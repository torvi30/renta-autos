import { Vehicle, VehicleStatus } from '../types/vehicle';
import { MOCK_VEHICLES } from '../data/mockVehicles';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const LOCAL_CACHE_KEY = 'PREMIUM_RENTAL_VEHICLES_COLOMBIA_V9';
const VEHICLES_COLLECTION = 'vehicles';

type VehicleChangeListener = (vehicles: Vehicle[]) => void;
const vehicleListeners: Set<VehicleChangeListener> = new Set();

export const notifyVehicleListeners = (vehicles: Vehicle[]) => {
  vehicleListeners.forEach((listener) => {
    try {
      listener(vehicles);
    } catch (err) {
      console.warn('Error en vehicle listener:', err);
    }
  });
};

/**
 * Recursively cleans undefined properties to prevent setDoc from failing in Firestore
 */
export const cleanFirestoreData = <T = any>(data: T): T => {
  if (data === null || data === undefined) return null as any;
  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData).filter((item) => item !== undefined) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as any;
  }
  return data;
};

/**
 * Retrieve vehicles stored in local cache or fallback to initial mock fleet
 */
export const getLocalVehicles = (): Vehicle[] => {
  if (typeof window === 'undefined') return MOCK_VEHICLES;
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) {
      return MOCK_VEHICLES;
    }
    const parsed = JSON.parse(raw) as Vehicle[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return MOCK_VEHICLES;
    }
    return parsed;
  } catch (error) {
    console.warn('Error reading vehicles from local cache:', error);
    return MOCK_VEHICLES;
  }
};

/**
 * Save vehicles to local cache and immediately notify all subscribed components
 */
export const saveLocalVehicles = (vehicles: Vehicle[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(vehicles));
    notifyVehicleListeners(vehicles);
  } catch (error) {
    console.error('Error persisting vehicles to local cache:', error);
  }
};

/**
 * Fetch all vehicles with Cloud Firestore as single source of truth
 */
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  if (!db || !isFirebaseConfigured()) {
    const local = getLocalVehicles();
    return local.length > 0 ? local : MOCK_VEHICLES;
  }

  try {
    const colRef = collection(db, VEHICLES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return MOCK_VEHICLES;
    }

    const cloudVehicles: Vehicle[] = [];
    snapshot.forEach((docSnap) => {
      cloudVehicles.push(docSnap.data() as Vehicle);
    });

    // Cloud Firestore is the single source of truth
    saveLocalVehicles(cloudVehicles);
    return cloudVehicles;
  } catch (error) {
    console.warn('Error querying vehicles in Firestore, using local fallback:', error);
    const local = getLocalVehicles();
    return local.length > 0 ? local : MOCK_VEHICLES;
  }
};

/**
 * Real-time reactive subscription to the vehicles collection
 */
export const subscribeVehicles = (
  callback: (vehicles: Vehicle[]) => void
): (() => void) => {
  vehicleListeners.add(callback);

  // Immediately emit cached fleet for zero-latency initial paint
  const initialCache = getLocalVehicles();
  if (initialCache.length > 0) {
    callback(initialCache);
  }

  if (!db || !isFirebaseConfigured()) {
    if (initialCache.length === 0) {
      callback(MOCK_VEHICLES);
    }
    return () => {
      vehicleListeners.delete(callback);
    };
  }

  try {
    const colRef = collection(db, VEHICLES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Vehicle[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as Vehicle);
          });

          // Cloud Firestore is the single source of truth
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(items));
          notifyVehicleListeners(items);
          callback(items);
        } else {
          callback(MOCK_VEHICLES);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (vehicles), maintaining fallback:', error);
        callback(MOCK_VEHICLES);
      }
    );

    return () => {
      vehicleListeners.delete(callback);
      unsubscribe();
    };
  } catch (error) {
    console.warn('Error configuring Firestore vehicle listener:', error);
    return () => {
      vehicleListeners.delete(callback);
    };
  }
};

/**
 * Update vehicle operational status in Cloud Firestore and local cache
 */
export const updateVehicleStatusInCloud = async (
  vehicleId: string,
  newStatus: VehicleStatus
): Promise<boolean> => {
  // 1. Update local cache immediately (optimistic UI update)
  const currentList = getLocalVehicles();
  const updatedList = currentList.map((v) =>
    v.id === vehicleId
      ? { ...v, status: newStatus, updatedAt: new Date().toISOString() }
      : v
  );
  saveLocalVehicles(updatedList);

  // 2. Synchronize to Cloud Firestore if connected
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.warn('Direct updateDoc failed in Firestore, attempting setDoc with merge:', error);
      try {
        const vehicleToSave = updatedList.find((v) => v.id === vehicleId);
        if (vehicleToSave) {
          const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
          await setDoc(docRef, vehicleToSave, { merge: true });
        }
        return true;
      } catch (innerError) {
        console.error('Failed persisting vehicle status to Cloud Firestore:', innerError);
        return false;
      }
    }
  }

  return true;
};

/**
 * Initial seeding of vehicles to Cloud Firestore
 */
export const seedInitialVehiclesToFirestore = async (): Promise<{
  success: boolean;
  count: number;
  message: string;
}> => {
  if (!db || !isFirebaseConfigured()) {
    return {
      success: false,
      count: 0,
      message: 'Firebase is not configured or offline.',
    };
  }

  try {
    let inserted = 0;
    for (const vehicle of MOCK_VEHICLES) {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicle.id);
      await setDoc(docRef, vehicle, { merge: true });
      inserted++;
    }

    return {
      success: true,
      count: inserted,
      message: `Successfully synchronized ${inserted} luxury vehicles to Cloud Firestore.`,
    };
  } catch (error: any) {
    console.error('Error seeding vehicles to Firestore:', error);
    return {
      success: false,
      count: 0,
      message: error?.message || 'Error writing documents to Cloud Firestore.',
    };
  }
};

/**
 * Generate SEO-friendly slug
 */
export const generateVehicleSlug = (brand: string, model: string, year?: number): string => {
  const base = `${brand}-${model}${year ? `-${year}` : ''}`;
  return base
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Create a new vehicle in Cloud Firestore and local cache
 */
export const createVehicle = async (
  vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<Vehicle> => {
  const now = new Date().toISOString();
  const id = vehicleData.id || `veh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const slug = vehicleData.slug || generateVehicleSlug(vehicleData.brand, vehicleData.model, vehicleData.year);

  const newVehicle: Vehicle = {
    ...vehicleData,
    id,
    slug,
    currency: vehicleData.currency || 'USD',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save to local cache immediately (at the front of the list for instant visibility)
  const currentList = getLocalVehicles();
  const updatedList = [newVehicle, ...currentList.filter((v) => v.id !== id)];
  saveLocalVehicles(updatedList);

  // 2. Persist to Cloud Firestore with strict cleanup of undefined fields
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, newVehicle.id);
      const cleaned = cleanFirestoreData(newVehicle);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (error: any) {
      console.error('Error persisting vehicle to Cloud Firestore:', error);
    }
  }

  return newVehicle;
};

/**
 * Update existing vehicle details
 */
export const updateVehicle = async (
  vehicleId: string,
  updates: Partial<Vehicle>
): Promise<Vehicle> => {
  const currentList = getLocalVehicles();
  const existing = currentList.find((v) => v.id === vehicleId);

  if (!existing) {
    throw new Error(`Vehicle with ID ${vehicleId} not found.`);
  }

  const now = new Date().toISOString();
  const updatedVehicle: Vehicle = {
    ...existing,
    ...updates,
    id: vehicleId,
    updatedAt: now,
  };

  // 1. Update local cache
  const updatedList = currentList.map((v) => (v.id === vehicleId ? updatedVehicle : v));
  saveLocalVehicles(updatedList);

  // 2. Update Cloud Firestore with clean payload
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      const cleaned = cleanFirestoreData(updatedVehicle);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (error: any) {
      console.error('Error updating vehicle in Cloud Firestore:', error);
    }
  }

  return updatedVehicle;
};

/**
 * Remove a vehicle from fleet
 */
export const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
  // 1. Remove from local cache
  const currentList = getLocalVehicles();
  const filteredList = currentList.filter((v) => v.id !== vehicleId);
  saveLocalVehicles(filteredList);

  // 2. Delete from Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting vehicle in Cloud Firestore:', error);
    }
  }

  return true;
};

