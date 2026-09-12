export interface CompanySettings {
  companyName: string;
  tagline: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  address: string;
  city: string;
  businessHours: string;
  pickupLocations: string[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  policies: {
    coverageText: string;
    certificationText: string;
    minAge: number;
    depositRefundHours: number;
  };
  updatedAt?: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Premium Car Rental',
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
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
  },
  policies: {
    coverageText: 'Póliza de Cobertura Total Todo Riesgo ($0 Deducible)',
    certificationText: 'Flota Certificada 100% Original',
    minAge: 25,
    depositRefundHours: 48,
  },
  updatedAt: new Date().toISOString(),
};
