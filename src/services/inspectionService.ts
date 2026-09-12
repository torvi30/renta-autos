import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  VehicleInspection,
  InspectionComparison,
} from '../types/inspection';

const INSPECTIONS_COLLECTION = 'inspections';
const LOCAL_STORAGE_KEY = 'elite_wheels_inspections_cache';

// Mock de inspecciones de ejemplo iniciales para demostración
const INITIAL_MOCK_INSPECTIONS: VehicleInspection[] = [
  {
    id: 'INSP-2026-911A',
    reservationId: 'RES-2026-P911',
    vehicleId: 'veh-porsche-911-gt3-rs',
    vehicleName: 'Porsche 911 GT3 RS',
    vehiclePlate: 'GT3-911',
    clientName: 'Carlos Mendoza',
    type: 'CHECK_IN',
    odometer: 14250,
    fuelLevel: 100,
    cleanliness: 'IMMACULATE',
    damages: [],
    photos: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    ],
    inspectorName: 'Víctor Tamayo (Director General)',
    notes: 'Vehículo entregado en perfecto estado. Neumáticos Michelin Pilot Sport Cup 2 con 95% de vida útil.',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-10T10:00:00Z',
  },
];

/**
 * Obtener inspecciones locales desde localStorage
 */
export const getLocalInspections = (): VehicleInspection[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_INSPECTIONS));
      return INITIAL_MOCK_INSPECTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error al leer caché local de inspecciones:', err);
    return INITIAL_MOCK_INSPECTIONS;
  }
};

/**
 * Guardar lista completa en localStorage
 */
export const saveLocalInspections = (inspections: VehicleInspection[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inspections));
  } catch (err) {
    console.warn('Error al persistir inspecciones en localStorage:', err);
  }
};

/**
 * Obtener todas las inspecciones de una reserva específica
 */
export const getInspectionsByReservation = async (
  reservationId: string
): Promise<VehicleInspection[]> => {
  // 1. Intentar consultar en Cloud Firestore si está configurado
  if (db && isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, INSPECTIONS_COLLECTION),
        where('reservationId', '==', reservationId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cloudList: VehicleInspection[] = [];
        snap.forEach((docSnap) => {
          cloudList.push(docSnap.data() as VehicleInspection);
        });
        return cloudList;
      }
    } catch (err) {
      console.warn('Fallo al obtener inspecciones de Firestore, usando caché local:', err);
    }
  }

  // 2. Fallback a caché local
  const local = getLocalInspections();
  return local.filter((i) => i.reservationId === reservationId);
};

/**
 * Guardar una nueva inspección (Check-in o Check-out)
 */
export const saveInspection = async (
  data: Omit<VehicleInspection, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<VehicleInspection> => {
  const now = new Date().toISOString();
  const id =
    data.id ||
    `INSP-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newInspection: VehicleInspection = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Guardar en local cache
  const current = getLocalInspections();
  const existingIdx = current.findIndex((i) => i.id === id);
  let updatedList: VehicleInspection[];

  if (existingIdx >= 0) {
    updatedList = current.map((item) => (item.id === id ? newInspection : item));
  } else {
    updatedList = [newInspection, ...current];
  }
  saveLocalInspections(updatedList);

  // 2. Guardar en Cloud Firestore si está activo
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, INSPECTIONS_COLLECTION, id);
      await setDoc(docRef, newInspection, { merge: true });
    } catch (err) {
      console.warn('Advertencia al guardar inspección en Cloud Firestore:', err);
    }
  }

  return newInspection;
};

/**
 * Comparador inteligente entre Check-in y Check-out
 * Calcula kilómetros recorridos, faltante de combustible, nuevos daños y deducción del depósito
 */
export const compareInspections = (
  checkIn: VehicleInspection,
  checkOut: VehicleInspection,
  depositAmount: number = 3000
): InspectionComparison => {
  const distanceDriven = Math.max(0, checkOut.odometer - checkIn.odometer);
  const fuelDifference = checkOut.fuelLevel - checkIn.fuelLevel; // Ej. 90 - 100 = -10%

  // Detectar daños nuevos (que no estaban en el check-in)
  const checkInDamageIds = new Set(checkIn.damages.map((d) => d.id));
  const newDamages = checkOut.damages.filter((d) => !checkInDamageIds.has(d.id));

  // Penalización por combustible faltante ($2 USD por cada 1% faltante)
  let suggestedFuelPenalty = 0;
  if (fuelDifference < 0) {
    suggestedFuelPenalty = Math.abs(fuelDifference) * 2.5; // ej: -15% = $37.5 USD
  }

  // Tolerancia de kilometraje (ej. 250 km incluidos por día; calculamos base simbólica)
  let suggestedMileagePenalty = 0;
  if (distanceDriven > 1000) {
    const excess = distanceDriven - 1000;
    suggestedMileagePenalty = excess * 3; // $3 USD por km excedente
  }

  // Costo por daños reportados
  let damagesPenalty = 0;
  newDamages.forEach((d) => {
    if (d.severity === 'MINOR') damagesPenalty += 150;
    if (d.severity === 'MODERATE') damagesPenalty += 450;
    if (d.severity === 'SEVERE') damagesPenalty += 1200;
  });

  const totalSuggestedDeduction =
    suggestedFuelPenalty + suggestedMileagePenalty + damagesPenalty;
  const netDepositToRefund = Math.max(0, depositAmount - totalSuggestedDeduction);

  return {
    checkIn,
    checkOut,
    distanceDriven,
    fuelDifference,
    newDamagesCount: newDamages.length,
    newDamages,
    suggestedFuelPenalty: Math.round(suggestedFuelPenalty),
    suggestedMileagePenalty: Math.round(suggestedMileagePenalty),
    totalSuggestedDeduction: Math.round(totalSuggestedDeduction),
    netDepositToRefund: Math.round(netDepositToRefund),
  };
};
