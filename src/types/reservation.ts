export type DeliveryLocationType = 'SHOWROOM' | 'AIRPORT' | 'HOTEL_RESIDENCE';

export type ReservationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface ClientInfo {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
  driverLicense: string;
  ageConfirmation: boolean;
}

export interface ReservationPricing {
  dailyRate: number;
  days: number;
  rentalTotal: number;
  securityDeposit: number;
  insuranceIncluded: boolean;
  currency: string;
}

export interface Reservation {
  id: string; // Formato oficial RES-2026-XXXX
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  vehiclePlate: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  returnTime: string; // HH:mm
  deliveryLocation: DeliveryLocationType;
  deliveryAddress?: string;
  client: ClientInfo;
  pricing: ReservationPricing;
  notes?: string;
  status: ReservationStatus;
  createdAt: string; // ISO 8601
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  conflictingReservation?: {
    id: string;
    startDate: string;
    endDate: string;
  };
}
