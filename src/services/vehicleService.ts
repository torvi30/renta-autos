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

const LOCAL_CACHE_KEY = 'PREMIUM_RENTAL_VEHICLES_COLOMBIA_V6';
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
 * Limpia recursivamente propiedades undefined para evitar que setDoc falle en Firestore
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
 * Obtener vehículos almacenados en la caché local / estado semilla
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
    console.warn('Error al leer vehículos de la caché local:', error);
    return MOCK_VEHICLES;
  }
};

/**
 * Guardar vehículos en la caché local y notificar de inmediato a todos los componentes
 */
export const saveLocalVehicles = (vehicles: Vehicle[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(vehicles));
    notifyVehicleListeners(vehicles);
  } catch (error) {
    console.error('Error al persistir vehículos en caché local:', error);
  }
};

/**
 * Obtener todos los vehículos (Cloud Firestore como fuente única de verdad)
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

    // Cloud Firestore es la única fuente de la verdad
    saveLocalVehicles(cloudVehicles);
    return cloudVehicles;
  } catch (error) {
    console.warn('Error al consultar vehículos en Firestore, usando fallback local:', error);
    const local = getLocalVehicles();
    return local.length > 0 ? local : MOCK_VEHICLES;
  }
};

/**
 * Suscripción reactiva en tiempo real a la colección de vehículos
 */
export const subscribeVehicles = (
  callback: (vehicles: Vehicle[]) => void
): (() => void) => {
  vehicleListeners.add(callback);

  // Emitir de inmediato los datos de caché para carga instantánea
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

          // Cloud Firestore es la única fuente de la verdad
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(items));
          notifyVehicleListeners(items);
          callback(items);
        } else {
          callback(MOCK_VEHICLES);
        }
      },
      (error) => {
        console.warn('Aviso en suscripción a Firestore (vehículos), manteniendo fallback:', error);
        callback(MOCK_VEHICLES);
      }
    );

    return () => {
      vehicleListeners.delete(callback);
      unsubscribe();
    };
  } catch (error) {
    console.warn('Error al configurar listener de Firestore para vehículos:', error);
    return () => {
      vehicleListeners.delete(callback);
    };
  }
};

/**
 * Actualizar estado operativo de un vehículo en Cloud Firestore y caché local
 */
export const updateVehicleStatusInCloud = async (
  vehicleId: string,
  newStatus: VehicleStatus
): Promise<boolean> => {
  // 1. Actualizar caché local de inmediato (optimistic update)
  const currentList = getLocalVehicles();
  const updatedList = currentList.map((v) =>
    v.id === vehicleId
      ? { ...v, status: newStatus, updatedAt: new Date().toISOString() }
      : v
  );
  saveLocalVehicles(updatedList);

  // 2. Si Firestore está activo, sincronizar en la nube
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.warn('No se pudo actualizar el estado en Firestore directamente, intentando set con merge:', error);
      try {
        const vehicleToSave = updatedList.find((v) => v.id === vehicleId);
        if (vehicleToSave) {
          const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
          await setDoc(docRef, vehicleToSave, { merge: true });
        }
        return true;
      } catch (innerError) {
        console.error('Fallo al persistir estado en Cloud Firestore:', innerError);
        return false;
      }
    }
  }

  return true;
};

/**
 * Sembrado inicial de los 8 vehículos Showroom en Cloud Firestore
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
      message: 'Firebase no está configurado o no hay conexión activa.',
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
      message: `Se han sincronizado exitosamente ${inserted} vehículos de lujo en Cloud Firestore.`,
    };
  } catch (error: any) {
    console.error('Error al sembrar vehículos en Firestore:', error);
    return {
      success: false,
      count: 0,
      message: error?.message || 'Error al escribir los documentos en Cloud Firestore.',
    };
  }
};

/**
 * Generar slug amigable para SEO (Regla 17)
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
 * Crear un nuevo vehículo en Cloud Firestore y caché local (Fase 8)
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

  // 1. Guardar en local cache inmediatamente (al inicio de la lista para máxima visibilidad)
  const currentList = getLocalVehicles();
  const updatedList = [newVehicle, ...currentList.filter((v) => v.id !== id)];
  saveLocalVehicles(updatedList);

  // 2. Persistir en Cloud Firestore con limpieza estricta de undefined
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, newVehicle.id);
      const cleaned = cleanFirestoreData(newVehicle);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (error: any) {
      console.error('Error al persistir vehículo en Cloud Firestore:', error);
    }
  }

  return newVehicle;
};

/**
 * Actualizar datos de un vehículo existente (Fase 8)
 */
export const updateVehicle = async (
  vehicleId: string,
  updates: Partial<Vehicle>
): Promise<Vehicle> => {
  const currentList = getLocalVehicles();
  const existing = currentList.find((v) => v.id === vehicleId);

  if (!existing) {
    throw new Error(`Vehículo con ID ${vehicleId} no encontrado.`);
  }

  const now = new Date().toISOString();
  const updatedVehicle: Vehicle = {
    ...existing,
    ...updates,
    id: vehicleId,
    updatedAt: now,
  };

  // 1. Actualizar caché local
  const updatedList = currentList.map((v) => (v.id === vehicleId ? updatedVehicle : v));
  saveLocalVehicles(updatedList);

  // 2. Actualizar en Cloud Firestore con limpieza estricta de undefined
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      const cleaned = cleanFirestoreData(updatedVehicle);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (error: any) {
      console.error('Error al actualizar vehículo en Cloud Firestore:', error);
    }
  }

  return updatedVehicle;
};

/**
 * Eliminar un vehículo de la flota (Fase 8)
 */
export const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
  // 1. Remover de caché local
  const currentList = getLocalVehicles();
  const filteredList = currentList.filter((v) => v.id !== vehicleId);
  saveLocalVehicles(filteredList);

  // 2. Eliminar de Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar vehículo en Cloud Firestore:', error);
    }
  }

  return true;
};

