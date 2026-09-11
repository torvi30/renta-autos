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

const LOCAL_CACHE_KEY = 'PREMIUM_RENTAL_VEHICLES_CACHE_V1';
const VEHICLES_COLLECTION = 'vehicles';

/**
 * Obtener vehículos almacenados en la caché local / estado semilla
 */
export const getLocalVehicles = (): Vehicle[] => {
  if (typeof window === 'undefined') return MOCK_VEHICLES;
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(MOCK_VEHICLES));
      return MOCK_VEHICLES;
    }
    return JSON.parse(raw) as Vehicle[];
  } catch (error) {
    console.warn('Error al leer vehículos de la caché local:', error);
    return MOCK_VEHICLES;
  }
};

/**
 * Guardar vehículos en la caché local
 */
export const saveLocalVehicles = (vehicles: Vehicle[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error('Error al persistir vehículos en caché local:', error);
  }
};

/**
 * Obtener todos los vehículos (Cloud Firestore con fallback local automático)
 */
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  if (!db || !isFirebaseConfigured()) {
    return getLocalVehicles();
  }

  try {
    const colRef = collection(db, VEHICLES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Si la colección de la nube está vacía, entregamos el catálogo local
      return getLocalVehicles();
    }

    const cloudVehicles: Vehicle[] = [];
    snapshot.forEach((docSnap) => {
      cloudVehicles.push(docSnap.data() as Vehicle);
    });

    saveLocalVehicles(cloudVehicles);
    return cloudVehicles;
  } catch (error) {
    console.warn('Error al consultar vehículos en Firestore, usando fallback local:', error);
    return getLocalVehicles();
  }
};

/**
 * Suscripción reactiva en tiempo real a la colección de vehículos
 */
export const subscribeVehicles = (
  callback: (vehicles: Vehicle[]) => void
): (() => void) => {
  // Emitir de inmediato los datos de caché para carga instantánea
  callback(getLocalVehicles());

  if (!db || !isFirebaseConfigured()) {
    return () => {};
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
          saveLocalVehicles(items);
          callback(items);
        }
      },
      (error) => {
        console.warn('Aviso en suscripción a Firestore (vehículos), manteniendo fallback:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Error al configurar listener de Firestore para vehículos:', error);
    return () => {};
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

  // 1. Guardar en local cache inmediatamente
  const currentList = getLocalVehicles();
  const updatedList = [newVehicle, ...currentList];
  saveLocalVehicles(updatedList);

  // 2. Persistir en Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, newVehicle.id);
      await setDoc(docRef, newVehicle);
    } catch (error) {
      console.warn('Advertencia al crear vehículo en Cloud Firestore:', error);
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
    id: vehicleId, // Preservar ID
    updatedAt: now,
  };

  // 1. Actualizar caché local
  const updatedList = currentList.map((v) => (v.id === vehicleId ? updatedVehicle : v));
  saveLocalVehicles(updatedList);

  // 2. Actualizar en Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
      await setDoc(docRef, updatedVehicle, { merge: true });
    } catch (error) {
      console.warn('Advertencia al actualizar vehículo en Cloud Firestore:', error);
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
      console.warn('Advertencia al eliminar vehículo en Cloud Firestore:', error);
    }
  }

  return true;
};

