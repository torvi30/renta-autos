export type InspectionType = 'CHECK_IN' | 'CHECK_OUT';

export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE';

export type VehicleZone =
  | 'FRONT'
  | 'LEFT_SIDE'
  | 'RIGHT_SIDE'
  | 'REAR'
  | 'ROOF'
  | 'WHEELS'
  | 'WINDSHIELD'
  | 'INTERIOR';

export interface DamageItem {
  id: string;
  zone: VehicleZone;
  zoneLabel: string;
  severity: DamageSeverity;
  description: string;
  photoUrl?: string;
  createdAt: string;
}

export type CleanlinessLevel = 'IMMACULATE' | 'CLEAN' | 'REQUIRES_DETAILING';

export type DepositResolution =
  | 'REFUND_FULL'
  | 'DEDUCT_PENALTY'
  | 'HOLD_FOR_ASSESSMENT';

export interface VehicleInspection {
  id: string; // Formato INSP-YYYY-XXXX
  reservationId: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  clientName: string;
  type: InspectionType;
  odometer: number; // Kilometraje en km
  fuelLevel: number; // Porcentaje de 0 a 100
  cleanliness: CleanlinessLevel;
  damages: DamageItem[];
  photos: string[];
  inspectorName: string;
  notes?: string;
  depositResolution?: DepositResolution;
  deductionAmount?: number; // Monto deducido si aplica
  createdAt: string;
  updatedAt: string;
}

export interface InspectionComparison {
  checkIn: VehicleInspection;
  checkOut: VehicleInspection;
  distanceDriven: number; // km
  fuelDifference: number; // % (checkOut - checkIn)
  newDamagesCount: number;
  newDamages: DamageItem[];
  suggestedFuelPenalty: number;
  suggestedMileagePenalty: number;
  totalSuggestedDeduction: number;
  netDepositToRefund: number;
}
