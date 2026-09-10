export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';

export type VehicleCategory = 
  | 'DEPORTIVO' 
  | 'SUV_LUJO' 
  | 'SEDAN_EJECUTIVO' 
  | 'EXOTICO' 
  | 'CONVERTIBLE';

export type TransmissionType = 'AUTOMATICA' | 'MANUAL';

export type FuelType = 'GASOLINA' | 'HIBRIDO' | 'ELECTRICO' | 'DIESEL';

export interface VehicleGallery {
  // Regla 8: Máximo 12 fotografías organizadas por categoría
  exteriorImages: string[]; // Frente, lateral, trasera, etc. (1-5)
  interiorImages: string[]; // Tablero, volante, asientos (6-9)
  detailImages: string[];   // Pantalla, rines, motor, baúl (10-12)
}

export interface Vehicle {
  id: string;
  slug: string; // Para SEO / URL amigable (Regla 17)
  brand: string;
  model: string;
  year: number;
  plate: string;
  category: VehicleCategory;
  description: string;
  pricePerDay: number;
  currency: string; // 'USD'
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  features: string[];
  status: VehicleStatus;
  mainImage: string;
  videoUrl?: string; // Video de exterior máx 15 segundos en loop silencioso (Regla 7, 9)
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
  | 'CANCELLED';

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
