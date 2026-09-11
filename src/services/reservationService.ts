import { Vehicle } from '../types/vehicle';
import {
  Reservation,
  ReservationPricing,
  AvailabilityCheckResult,
  ClientInfo,
  DeliveryLocationType,
  ReservationStatus,
} from '../types/reservation';

const STORAGE_KEY = 'PREMIUM_RENTAL_RESERVATIONS_V1';

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
const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-2026-P911',
    vehicleId: 'veh-002', // Porsche 911 GT3 RS
    vehicleName: 'Porsche 911 GT3 RS',
    vehicleImage: '/vehicles/porsche-gt3-rs.jpg',
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
    return JSON.parse(raw) as Reservation[];
  } catch (error) {
    console.warn('Error reading reservations from localStorage:', error);
    return SEED_RESERVATIONS;
  }
};

/**
 * Persistir lista de reservas
 */
export const saveReservations = (reservations: Reservation[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (error) {
    console.error('Error saving reservations to localStorage:', error);
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
  excludeReservationId?: string
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
  const vehicleReservations = allReservations.filter(
    (res) =>
      res.vehicleId === vehicle.id &&
      res.id !== excludeReservationId &&
      (res.status === 'PENDING' || res.status === 'CONFIRMED' || res.status === 'ACTIVE')
  );

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
 * Crear una nueva solicitud de reserva con código único RES-2026-XXXX
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
  const availability = checkAvailability(params.vehicle, params.startDate, params.endDate);
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
    deliveryAddress: params.deliveryAddress,
    client: params.client,
    pricing,
    notes: params.notes,
    status: 'PENDING' as ReservationStatus,
    createdAt: new Date().toISOString(),
  };

  const currentList = getStoredReservations();
  saveReservations([newReservation, ...currentList]);

  return { reservation: newReservation };
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

/**
 * Regla 30: Preparar enlace estructurado para WhatsApp Concierge
 */
export const generateWhatsAppReservationLink = (
  reservation: Reservation,
  conciergePhone: string = '1234567890'
): string => {
  const locationLabel = getDeliveryLocationLabel(reservation.deliveryLocation);

  const lines = [
    `🌟 *SOLICITUD DE RESERVA - BOUTIQUE LUXURY CAR RENTAL*`,
    `🔖 *Código de Reserva:* ${reservation.id}`,
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
    `💳 *Desglose Financiero:*`,
    `• Tarifa por Día: $${reservation.pricing.dailyRate.toLocaleString()} ${reservation.pricing.currency}`,
    `• Subtotal Renta (${reservation.pricing.days} d): $${reservation.pricing.rentalTotal.toLocaleString()} ${reservation.pricing.currency}`,
    `• Depósito en Garantía (Reembolsable): $${reservation.pricing.securityDeposit.toLocaleString()} ${reservation.pricing.currency}`,
    `• Cobertura VIP Integral: Incluida ($0)`,
    `• *TOTAL ESTIMADO:* $${(reservation.pricing.rentalTotal + reservation.pricing.securityDeposit).toLocaleString()} ${reservation.pricing.currency}`,
  ];

  if (reservation.notes) {
    lines.push(``, `📝 *Notas Especiales:* ${reservation.notes}`);
  }

  lines.push(
    ``,
    `Hola, he generado esta solicitud desde el Showroom Web y deseo confirmar la disponibilidad y coordinar la entrega. ¿Me pueden asistir?`
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
  }

  return updatedItem;
};

