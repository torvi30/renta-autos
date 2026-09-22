export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';

export type VehicleCategory = 
  | 'SPORTS' 
  | 'DEPORTIVO' 
  | 'LUXURY_SUV' 
  | 'SUV_LUJO' 
  | 'EXECUTIVE_SEDAN' 
  | 'SEDAN_EJECUTIVO' 
  | 'EXOTIC' 
  | 'EXOTICO' 
  | 'CONVERTIBLE';

export type TransmissionType = 'AUTOMATIC' | 'AUTOMATICA' | 'MANUAL';

export type FuelType = 'GASOLINE' | 'GASOLINA' | 'HYBRID' | 'HIBRIDO' | 'ELECTRIC' | 'ELECTRICO' | 'DIESEL';

export interface VehicleGallery {
  // Maximum 12 photographs organized by category
  exteriorImages: string[]; // Front, sides, rear, etc. (1-5)
  interiorImages: string[]; // Dashboard, steering wheel, seats (6-9)
  detailImages: string[];   // Touchscreen, wheels, engine, trunk (10-12)
}

export interface Vehicle {
  id: string;
  slug: string; // SEO-friendly URL slug
  brand: string;
  model: string;
  year: number;
  plate: string;
  category: VehicleCategory;
  description: string;
  pricePerDay: number;
  currency: string; // e.g. 'USD'
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  features: string[];
  status: VehicleStatus;
  mainImage: string;
  videoUrl?: string; // Showcase loop video (max 15s)
  specs?: {
    acceleration0to100?: string;
    horsepower?: number;
    topSpeed?: number;
    doors?: number;
  };
  gallery?: VehicleGallery;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'CANCELLED'
  | 'MAINTENANCE';

export interface ReservationRequest {
  vehicleId: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalEstimated: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientDocument?: string;
  notes?: string;
}
