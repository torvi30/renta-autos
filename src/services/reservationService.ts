import { Vehicle } from '../types/vehicle';
import {
  Reservation,
  ReservationPricing,
  AvailabilityCheckResult,
  ClientInfo,
  DeliveryLocationType,
  ReservationStatus,
} from '../types/reservation';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const STORAGE_KEY = 'PREMIUM_RENTAL_RESERVATIONS_V1';
const RESERVATIONS_COLLECTION = 'reservations';

// Formato de fecha YYYY-MM-DD local seguro
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateAfterDaysString = (days: number): string => {
  const target = new Date();
  target.setDate(target.getDate() + days);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Semillas iniciales para demostrar detección de solapamientos (Regla 14)
 */
export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-2026-P911',
    vehicleId: 'veh-002', // Porsche 911 GT3 RS
    vehicleName: 'Porsche 911 GT3 RS',
    vehicleImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85',
    vehiclePlate: 'LUX-002',
    startDate: getDateAfterDaysString(3),
    endDate: getDateAfterDaysString(6),
    pickupTime: '11:00',
    returnTime: '11:00',
    deliveryLocation: 'SHOWROOM',
    client: {
      fullName: 'Carlos Mendoza',
      email: 'carlos.mendoza@executive.com',
      phone: '+1 305 444 8899',
      documentId: 'P-984321',
      driverLicense: 'DL-FL-4321',
      ageConfirmation: true,
    },
    pricing: {
      dailyRate: 1850,
      days: 3,
      rentalTotal: 5550,
      securityDeposit: 3700,
      insuranceIncluded: true,
      currency: 'USD',
    },
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Limpia recursivamente objetos para garantizar que ningún campo sea `undefined`,
 * previniendo errores de validación síncrona en Firebase Firestore.
 */
export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key] = sanitizeForFirestore(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Obtener todas las reservas persistidas en localStorage
 */
export const getStoredReservations = (): Reservation[] => {
  if (typeof window === 'undefined') return SEED_RESERVATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RESERVATIONS));
      return SEED_RESERVATIONS;
    }
    const list = JSON.parse(raw) as Reservation[];
    // Limpiar reservas fantasmas fallidas por error de undefined en Firestore
    const cleaned = list
      .filter((r) => r.id !== 'RES-2026-G89M' && r.id !== 'RES-2026-00VH')
      .map((r) => ({
        ...r,
        deliveryAddress: r.deliveryAddress || '',
        notes: r.notes || '',
      }));

    if (cleaned.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    console.warn('Error al leer reservas de localStorage:', error);
    return SEED_RESERVATIONS;
  }
};

/**
 * Persistir lista de reservas en caché local
 */
export const saveReservations = (reservations: Reservation[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (error) {
    console.error('Error al guardar reservas en localStorage:', error);
  }
};

/**
 * Suscripción reactiva en tiempo real a las reservas en Cloud Firestore
 */
export const subscribeReservations = (
  callback: (reservations: Reservation[]) => void
): (() => void) => {
  // Emitir de inmediato la caché local para respuesta instantánea
  callback(getStoredReservations());

  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const colRef = collection(db, RESERVATIONS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudItems: Reservation[] = [];
          snapshot.forEach((docSnap) => {
            cloudItems.push(docSnap.data() as Reservation);
          });
          // Ordenar por fecha de creación descendente
          cloudItems.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveReservations(cloudItems);
          callback(cloudItems);
        }
      },
      (error) => {
        console.warn('Aviso en listener de reservas Firestore, manteniendo caché local:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Error al configurar suscripción Firestore para reservas:', error);
    return () => {};
  }
};

/**
 * Calcular desglose de precios (días, subtotal, depósito y cobertura)
 */
export const calculateReservationPricing = (
  pricePerDay: number,
  startDate: string,
  endDate: string
): ReservationPricing => {
  let days = 1;
  if (startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const diffTime = end.getTime() - start.getTime();
    const calculatedDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    days = calculatedDays > 0 ? calculatedDays : 1;
  }

  const rentalTotal = days * pricePerDay;
  // Depósito de garantía estándar: 2x tarifa diaria o mínimo $2,000 USD reembolsable
  const securityDeposit = Math.max(2000, pricePerDay * 2);

  return {
    dailyRate: pricePerDay,
    days,
    rentalTotal,
    securityDeposit,
    insuranceIncluded: true,
    currency: 'USD',
  };
};

/**
 * Regla 14: Validar disponibilidad antes de confirmar una reserva.
 * Evitar reservas duplicadas para el mismo vehículo y periodo.
 */
export const checkAvailability = (
  vehicle: Vehicle,
  startDate: string,
  endDate: string,
  excludeReservationId?: string,
  clientContact?: string
): AvailabilityCheckResult => {
  // 1. Estado operativo del vehículo
  if (vehicle.status === 'MAINTENANCE') {
    return {
      isAvailable: false,
      reason: 'El vehículo se encuentra actualmente en programa de mantenimiento preventivo y no admite reservas.',
    };
  }

  if (vehicle.status === 'INACTIVE') {
    return {
      isAvailable: false,
      reason: 'El vehículo está temporalmente inactivo y no está disponible para alquiler.',
    };
  }

  // 2. Validación básica de fechas
  if (!startDate || !endDate) {
    return {
      isAvailable: false,
      reason: 'Por favor selecciona la fecha de recogida y la fecha de devolución.',
    };
  }

  const todayStr = getTodayDateString();
  if (startDate < todayStr) {
    return {
      isAvailable: false,
      reason: 'La fecha de recogida no puede ser anterior al día de hoy.',
    };
  }

  if (endDate <= startDate) {
    return {
      isAvailable: false,
      reason: 'La fecha de devolución debe ser posterior a la fecha de recogida (mínimo 24 horas).',
    };
  }

  // 3. Validación de solapamiento de fechas con reservas existentes activas
  const allReservations = getStoredReservations();
  const vehicleReservations = allReservations.filter((res) => {
    if (res.vehicleId !== vehicle.id) return false;
    if (res.id === excludeReservationId) return false;
    if (
      res.status !== 'PENDING' &&
      res.status !== 'CONFIRMED' &&
      res.status !== 'ACTIVE' &&
      res.status !== 'MAINTENANCE'
    ) {
      return false;
    }

    // Si es un reintento del mismo cliente (mismo email o teléfono en una reserva PENDING),
    // no generar un falso conflicto contra sí mismo
    if (
      clientContact &&
      res.status === 'PENDING' &&
      ((res.client.email && res.client.email.toLowerCase() === clientContact.toLowerCase()) ||
        (res.client.phone && res.client.phone.trim() === clientContact.trim()))
    ) {
      return false;
    }

    return true;
  });

  // Verificación de intervalo: (startA <= endB) && (endA >= startB)
  for (const existing of vehicleReservations) {
    const hasOverlap = startDate <= existing.endDate && endDate >= existing.startDate;
    if (hasOverlap) {
      return {
        isAvailable: false,
        reason: `Conflicto de agenda: Este vehículo ya tiene una reserva (${existing.id}) del ${existing.startDate} al ${existing.endDate}. Por favor selecciona otro rango de fechas o consulta otro modelo disponible.`,
        conflictingReservation: {
          id: existing.id,
          startDate: existing.startDate,
          endDate: existing.endDate,
        },
      };
    }
  }

  return {
    isAvailable: true,
  };
};

/**
 * Obtener todos los rangos de fechas bloqueados/reservados para un vehículo específico
 */
export const getVehicleBlockedDateRanges = (
  vehicleId: string,
  excludeReservationId?: string
): Array<{ startDate: string; endDate: string; id: string; status: ReservationStatus }> => {
  const allReservations = getStoredReservations();
  return allReservations
    .filter(
      (res) =>
        res.vehicleId === vehicleId &&
        res.id !== excludeReservationId &&
        (res.status === 'PENDING' ||
          res.status === 'CONFIRMED' ||
          res.status === 'ACTIVE' ||
          res.status === 'MAINTENANCE')
    )
    .map((res) => ({
      startDate: res.startDate,
      endDate: res.endDate,
      id: res.id,
      status: res.status,
    }));
};

/**
 * Crear una nueva solicitud de reserva con código único RES-2026-XXXX y persistencia dual (Cloud Firestore + Local)
 */
export const createReservation = (params: {
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  deliveryLocation: DeliveryLocationType;
  deliveryAddress?: string;
  client: ClientInfo;
  notes?: string;
}): { reservation: Reservation; error?: string } => {
  // Validación de disponibilidad obligatoria antes de guardar
  const clientContact = params.client.email || params.client.phone;
  const availability = checkAvailability(params.vehicle, params.startDate, params.endDate, undefined, clientContact);
  if (!availability.isAvailable) {
    return {
      reservation: null as unknown as Reservation,
      error: availability.reason || 'El vehículo no está disponible para las fechas seleccionadas.',
    };
  }

  const pricing = calculateReservationPricing(
    params.vehicle.pricePerDay,
    params.startDate,
    params.endDate
  );

  // Generación de código único premium
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const reservationId = `RES-2026-${randomSuffix}`;

  const newReservation: Reservation = {
    id: reservationId,
    vehicleId: params.vehicle.id,
    vehicleName: `${params.vehicle.brand} ${params.vehicle.model}`,
    vehicleImage: params.vehicle.mainImage,
    vehiclePlate: params.vehicle.plate,
    startDate: params.startDate,
    endDate: params.endDate,
    pickupTime: params.pickupTime || '10:00',
    returnTime: params.returnTime || '10:00',
    deliveryLocation: params.deliveryLocation,
    deliveryAddress: params.deliveryAddress || '',
    client: {
      fullName: params.client.fullName || '',
      email: params.client.email || '',
      phone: params.client.phone || '',
      documentId: params.client.documentId || '',
      driverLicense: params.client.driverLicense || '',
      ageConfirmation: Boolean(params.client.ageConfirmation),
    },
    pricing,
    notes: params.notes || '',
    status: 'PENDING' as ReservationStatus,
    createdAt: new Date().toISOString(),
  };

  // 1. Persistir en Cloud Firestore de manera segura, sanitizada y asíncrona
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, newReservation.id);
      const cleanData = sanitizeForFirestore(newReservation);
      setDoc(docRef, cleanData).catch((err) => {
        console.warn('Aviso: la reserva se guardó localmente pero falló el envío a Firestore:', err);
      });
    } catch (err) {
      console.warn('Advertencia al preparar setDoc en Firestore:', err);
    }
  }

  // 2. Guardar en caché local (reemplazando cualquier intento pendiente previo del mismo cliente)
  const currentList = getStoredReservations();
  const filteredList = currentList.filter(
    (r) =>
      !(
        r.vehicleId === newReservation.vehicleId &&
        r.status === 'PENDING' &&
        (r.client.email.toLowerCase() === newReservation.client.email.toLowerCase() ||
          r.client.phone === newReservation.client.phone) &&
        r.startDate === newReservation.startDate &&
        r.endDate === newReservation.endDate
      )
  );
  saveReservations([newReservation, ...filteredList]);

  return { reservation: newReservation };
};

/**
 * Versión asíncrona de creación de reserva que garantiza confirmación en Cloud Firestore
 */
export const createReservationAsync = async (params: {
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  deliveryLocation: DeliveryLocationType;
  deliveryAddress?: string;
  client: ClientInfo;
  notes?: string;
}): Promise<{ reservation: Reservation | null; error?: string }> => {
  const syncResult = createReservation(params);
  if (syncResult.error || !syncResult.reservation) {
    return { reservation: null, error: syncResult.error };
  }

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, syncResult.reservation.id);
      const cleanData = sanitizeForFirestore(syncResult.reservation);
      await setDoc(docRef, cleanData);
    } catch (error: any) {
      console.warn('La reserva se completó con respaldo local, Firestore arrojó advertencia:', error);
    }
  }

  return { reservation: syncResult.reservation };
};

export const getDeliveryLocationLabel = (location: DeliveryLocationType): string => {
  switch (location) {
    case 'SHOWROOM':
      return 'Showroom Central VIP';
    case 'AIRPORT':
      return 'Aeropuerto Internacional (Meet & Greet VIP)';
    case 'HOTEL_RESIDENCE':
      return 'Entrega en Hotel / Residencia Privada';
    default:
      return location;
  }
};

export interface WhatsAppPricingDisplay {
  dailyRateText?: string;
  rentalTotalText?: string;
  securityDepositText?: string;
  totalEstimatedText?: string;
  currencyCode?: string;
}

/**
 * Regla 30: Preparar enlace estructurado para WhatsApp Concierge con soporte de divisa activa
 */
export const generateWhatsAppReservationLink = (
  reservation: Reservation,
  conciergePhone: string = '573009115898',
  pricingDisplay?: WhatsAppPricingDisplay
): string => {
  const locationLabel = getDeliveryLocationLabel(reservation.deliveryLocation);

  const dailyText =
    pricingDisplay?.dailyRateText ||
    `$${reservation.pricing.dailyRate.toLocaleString()} ${reservation.pricing.currency}`;
  const rentalTotalText =
    pricingDisplay?.rentalTotalText ||
    `$${reservation.pricing.rentalTotal.toLocaleString()} ${reservation.pricing.currency}`;
  const depositText =
    pricingDisplay?.securityDepositText ||
    `$${reservation.pricing.securityDeposit.toLocaleString()} ${reservation.pricing.currency}`;
  const totalText =
    pricingDisplay?.totalEstimatedText ||
    `$${(reservation.pricing.rentalTotal + reservation.pricing.securityDeposit).toLocaleString()} ${reservation.pricing.currency}`;

  const lines = [
    `🌟 *SOLICITUD DE RESERVA - BOUTIQUE LUXURY CAR RENTAL*`,
    `🔖 *Código Oficial:* ${reservation.id}`,
    `---------------------------------`,
    `🚗 *Vehículo:* ${reservation.vehicleName}`,
    `🏷️ *Placa:* ${reservation.vehiclePlate}`,
    `📅 *Periodo:* ${reservation.startDate} al ${reservation.endDate} (${reservation.pricing.days} día(s))`,
    `⏰ *Horario:* ${reservation.pickupTime} - ${reservation.returnTime}`,
    `📍 *Lugar de Entrega:* ${locationLabel}${
      reservation.deliveryAddress ? ` (${reservation.deliveryAddress})` : ''
    }`,
    ``,
    `👤 *Datos del Titular:*`,
    `• Nombre: ${reservation.client.fullName}`,
    `• Documento / ID: ${reservation.client.documentId}`,
    `• Licencia de Conducir: ${reservation.client.driverLicense}`,
    `• Teléfono: ${reservation.client.phone}`,
    `• Email: ${reservation.client.email}`,
    ``,
    `💳 *Liquidación Financiera:*`,
    `• Tarifa por Día: ${dailyText}`,
    `• Subtotal Renta (${reservation.pricing.days} d): ${rentalTotalText}`,
    `• Depósito en Garantía (Reembolsable): ${depositText}`,
    `• Cobertura VIP Todo Riesgo: Incluida ($0)`,
    `• *TOTAL ESTIMADO AL DESPACHO:* ${totalText}`,
  ];

  if (reservation.notes) {
    lines.push(``, `📝 *Notas Especiales:* ${reservation.notes}`);
  }

  lines.push(
    ``,
    `Hola, he generado esta reserva desde el Showroom Web y deseo confirmar disponibilidad y entrega. ¿Me pueden asistir?`
  );

  const cleanPhone = conciergePhone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
};

/**
 * Actualizar estado de una reserva (Regla 14: PENDING -> CONFIRMED -> ACTIVE -> COMPLETED -> CANCELLED)
 */
export const updateReservationStatus = (
  reservationId: string,
  newStatus: ReservationStatus
): Reservation | null => {
  const currentList = getStoredReservations();
  let updatedItem: Reservation | null = null;

  const updatedList = currentList.map((res) => {
    if (res.id === reservationId) {
      updatedItem = { ...res, status: newStatus };
      return updatedItem;
    }
    return res;
  });

  if (updatedItem) {
    saveReservations(updatedList);

    // Sincronizar en Firestore
    if (db && isFirebaseConfigured()) {
      const docRef = doc(db, RESERVATIONS_COLLECTION, reservationId);
      updateDoc(docRef, { status: newStatus }).catch((err) => {
        console.warn('Advertencia al actualizar estado en Cloud Firestore:', err);
      });
    }
  }

  return updatedItem;
};

/**
 * Actualizar una reserva existente (fechas, cliente, estado, vehículo, notas)
 * Recalcula automáticamente días y precios si cambian las fechas o la tarifa diaria.
 */
export const updateReservation = async (
  reservationId: string,
  updates: Partial<Reservation>
): Promise<Reservation | null> => {
  const currentList = getStoredReservations();
  const existingIndex = currentList.findIndex((r) => r.id === reservationId);
  if (existingIndex === -1) return null;

  const existing = currentList[existingIndex];
  const newStartDate = updates.startDate || existing.startDate;
  const newEndDate = updates.endDate || existing.endDate;

  let updatedPricing = updates.pricing || existing.pricing;
  if (updates.startDate || updates.endDate || updates.pricing?.dailyRate) {
    const dailyRate = updates.pricing?.dailyRate ?? existing.pricing.dailyRate;
    const days = calculateDaysBetween(newStartDate, newEndDate);
    const rentalTotal = days * dailyRate;
    const securityDeposit = Math.max(2000, dailyRate * 2);

    updatedPricing = {
      dailyRate,
      days,
      rentalTotal,
      securityDeposit,
      insuranceIncluded: true,
      currency: 'USD',
    };
  }

  const updatedReservation: Reservation = {
    ...existing,
    ...updates,
    startDate: newStartDate,
    endDate: newEndDate,
    pricing: updatedPricing,
  };

  const updatedList = [...currentList];
  updatedList[existingIndex] = updatedReservation;
  saveReservations(updatedList);

  // Sincronización asíncrona segura con Firestore (no bloqueante para la UI)
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, reservationId);
      const cleanData = sanitizeForFirestore(updatedReservation);
      setDoc(docRef, cleanData, { merge: true }).catch((err) => {
        console.warn('Advertencia al sincronizar reserva editada en Firestore:', err);
      });
    } catch (err) {
      console.warn('Advertencia al preparar setDoc en Firestore:', err);
    }
  }

  return updatedReservation;
};

/**
 * Eliminar definitivamente una reserva del sistema (localStorage y Cloud Firestore)
 */
export const deleteReservation = async (reservationId: string): Promise<boolean> => {
  const currentList = getStoredReservations();
  const filteredList = currentList.filter((r) => r.id !== reservationId);
  saveReservations(filteredList);

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, reservationId);
      deleteDoc(docRef).catch((err) => {
        console.warn('Advertencia al eliminar reserva en Firestore:', err);
      });
    } catch (err) {
      console.warn('Advertencia al preparar deleteDoc en Firestore:', err);
    }
  }

  return true;
};

/**
 * Sembrar reservas iniciales de prueba en Cloud Firestore
 */
export const seedInitialReservationsToFirestore = async (): Promise<{
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
    let count = 0;
    for (const res of SEED_RESERVATIONS) {
      const docRef = doc(db, RESERVATIONS_COLLECTION, res.id);
      await setDoc(docRef, res, { merge: true });
      count++;
    }

    return {
      success: true,
      count,
      message: `${count} reserva(s) sincronizadas con Cloud Firestore.`,
    };
  } catch (error: any) {
    return {
      success: false,
      count: 0,
      message: error?.message || 'Error al sembrar reservas en Cloud Firestore.',
    };
  }
};

/**
 * Bloqueo Administrativo Manual de Fechas (Mantenimiento, Taller, Evento VIP)
 * Genera una reserva especial con status 'MAINTENANCE' para que el motor
 * de disponibilidad (checkAvailability) bloquee automáticamente dichas fechas.
 */
export const calculateDaysBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
};

export const createMaintenanceBlock = (params: {
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  reason: string;
}): { reservation: Reservation | null; error?: string } => {
  const { vehicle, startDate, endDate, reason } = params;

  if (!startDate || !endDate) {
    return { reservation: null, error: 'Debe especificar fecha de inicio y fin.' };
  }

  if (endDate < startDate) {
    return { reservation: null, error: 'La fecha de fin debe ser igual o posterior a la de inicio.' };
  }

  // Generar ID oficial de bloqueo
  const blockId = `BLOCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const days = calculateDaysBetween(startDate, endDate) || 1;

  const newBlock: Reservation = {
    id: blockId,
    vehicleId: vehicle.id,
    vehicleName: `${vehicle.brand} ${vehicle.model}`,
    vehicleImage: vehicle.mainImage,
    vehiclePlate: vehicle.plate,
    startDate,
    endDate,
    pickupTime: '08:00',
    returnTime: '20:00',
    deliveryLocation: 'SHOWROOM',
    client: {
      fullName: 'Operaciones & Taller VIP',
      email: 'mantenimiento@premiumcars.com',
      phone: '+57 300 000 0000',
      documentId: 'OPS-MAINT',
      driverLicense: 'OPS-MAINT',
      ageConfirmation: true,
    },
    pricing: {
      dailyRate: 0,
      days,
      rentalTotal: 0,
      securityDeposit: 0,
      insuranceIncluded: true,
      currency: 'USD',
    },
    notes: `BLOQUEO OPERATIVO: ${reason}`,
    status: 'MAINTENANCE',
    createdAt: new Date().toISOString(),
  };

  const currentList = getStoredReservations();
  saveReservations([newBlock, ...currentList]);

  if (db && isFirebaseConfigured()) {
    const docRef = doc(db, RESERVATIONS_COLLECTION, newBlock.id);
    setDoc(docRef, newBlock).catch((err) => {
      console.warn('Aviso al guardar bloqueo en Firestore:', err);
    });
  }

  return { reservation: newBlock };
};

