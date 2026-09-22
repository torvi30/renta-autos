export interface CompanySettings {
  // 1. Brand & Identity
  companyName: string;
  logoUrl?: string;
  tagline: string;

  // 2. Concierge Channels
  phone: string;
  whatsappPhone: string;
  email: string;
  address: string;
  city: string;
  businessHours: string;
  pickupLocations: string[];

  // 3. Hero Showcase Content
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
  };

  // 4. Official Social Links
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
  };

  // 5. Policies and Requirements
  policies: {
    coverageText: string;
    certificationText: string;
    minAge: number;
    depositRefundHours: number;
  };

  // 6. Fixed Commercial Exchange Rates (USD, EUR, COP)
  rates: {
    usdToCop: number;
    usdToEur: number;
  };

  updatedAt?: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Premium Car Rental',
  logoUrl: '',
  tagline: 'La experiencia definitiva en alquiler de vehículos de alta gama y superdeportivos. Flota seleccionada, entrega personalizada y atención concierge 24/7.',
  phone: '+57 (300) 911-5898',
  whatsappPhone: '573009115898',
  email: 'concierge@premiumcarrental.com',
  address: 'Showroom Central: Cra 43A #1-50, El Poblado',
  city: 'Medellín, Colombia',
  businessHours: 'Atención 24/7 / 365 días',
  pickupLocations: [
    'Showroom Central El Poblado',
    'Aeropuerto Internacional JMC (MDE)',
    'Aeropuerto Olaya Herrera (EOH)',
    'Llanogrande / Rionegro VIP',
    'Entrega a Hotel o Residencia Privada'
  ],
  hero: {
    badge: 'CONCESIONARIO SHOWROOM VIP • FLOTA 2026',
    titleLine1: 'TU VIAJE.',
    titleLine2: 'TU VEHÍCULO.',
    description: 'Explora nuestra exclusiva flota de vehículos de alta gama. Usa las flechas o la barra inferior para seleccionar cualquier auto, ver sus detalles y reservar.',
  },
  socialLinks: {
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
  },
  policies: {
    coverageText: 'Póliza de Cobertura Total Todo Riesgo ($0 Deducible)',
    certificationText: 'Flota Certificada 100% Original',
    minAge: 25,
    depositRefundHours: 48,
  },
  rates: {
    usdToCop: 4150,
    usdToEur: 0.92,
  },
  updatedAt: new Date().toISOString(),
};
