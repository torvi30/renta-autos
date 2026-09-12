import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'ES' | 'EN';

export interface Translations {
  nav: {
    home: string;
    fleet: string;
    catalog: string;
    experience: string;
    howItWorks: string;
    requirements: string;
    adminPortal: string;
  };
  cta: {
    bookNow: string;
    viewDetails: string;
    viewCatalog: string;
    whatsappConcierge: string;
    contactUs: string;
    close: string;
    filter: string;
    all: string;
  };
  status: {
    available: string;
    rented: string;
    maintenance: string;
    inactive: string;
  };
  specs: {
    perDay: string;
    horsepower: string;
    acceleration: string;
    topSpeed: string;
    seats: string;
    transmission: string;
    automatic: string;
    manual: string;
    fuel: string;
    gasoline: string;
    hybrid: string;
    electric: string;
  };
  categories: {
    all: string;
    sports: string;
    suv: string;
    sedan: string;
    exotic: string;
    convertible: string;
  };
}

const DICTIONARY: Record<LanguageCode, Translations> = {
  ES: {
    nav: {
      home: 'Inicio',
      fleet: 'Flota Showroom',
      catalog: 'Catálogo',
      experience: 'Experiencia VIP',
      howItWorks: 'Cómo Funciona',
      requirements: 'Requisitos',
      adminPortal: 'Portal Ejecutivo',
    },
    cta: {
      bookNow: 'Reservar Unidad',
      viewDetails: 'Ver Ficha Completa',
      viewCatalog: 'Ver Catálogo Completo',
      whatsappConcierge: 'WhatsApp Concierge',
      contactUs: 'Contactar Concierge',
      close: 'Cerrar',
      filter: 'Filtrar',
      all: 'Todos',
    },
    status: {
      available: 'Disponible',
      rented: 'Alquilado',
      maintenance: 'Mantenimiento',
      inactive: 'No disponible',
    },
    specs: {
      perDay: 'por día',
      horsepower: 'Potencia',
      acceleration: '0-100 km/h',
      topSpeed: 'Vel. Máxima',
      seats: 'Plazas',
      transmission: 'Transmisión',
      automatic: 'Automática',
      manual: 'Manual',
      fuel: 'Combustible',
      gasoline: 'Gasolina Extra 98',
      hybrid: 'Híbrido Enchufable',
      electric: '100% Eléctrico',
    },
    categories: {
      all: 'Toda la Flota',
      sports: 'Deportivos',
      suv: 'SUVs de Lujo',
      sedan: 'Sedanes VIP',
      exotic: 'Exóticos',
      convertible: 'Convertibles',
    },
  },
  EN: {
    nav: {
      home: 'Home',
      fleet: 'Showroom Fleet',
      catalog: 'Catalog',
      experience: 'VIP Experience',
      howItWorks: 'How It Works',
      requirements: 'Requirements',
      adminPortal: 'Executive Portal',
    },
    cta: {
      bookNow: 'Book Vehicle',
      viewDetails: 'View Specifications',
      viewCatalog: 'Explore Full Catalog',
      whatsappConcierge: 'WhatsApp Concierge',
      contactUs: 'Contact Concierge',
      close: 'Close',
      filter: 'Filter',
      all: 'All',
    },
    status: {
      available: 'Available',
      rented: 'On Rental',
      maintenance: 'Maintenance',
      inactive: 'Unavailable',
    },
    specs: {
      perDay: 'per day',
      horsepower: 'Power',
      acceleration: '0-62 mph (0-100)',
      topSpeed: 'Top Speed',
      seats: 'Seats',
      transmission: 'Transmission',
      automatic: 'Automatic',
      manual: 'Manual',
      fuel: 'Fuel Type',
      gasoline: 'Premium 98 Octane',
      hybrid: 'Plug-in Hybrid',
      electric: '100% Electric',
    },
    categories: {
      all: 'All Fleet',
      sports: 'Sports Cars',
      suv: 'Luxury SUVs',
      sedan: 'Executive Sedans',
      exotic: 'Exotic Supercars',
      convertible: 'Convertibles',
    },
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'elite_wheels_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('ES');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as LanguageCode;
      if (saved && (saved === 'ES' || saved === 'EN')) {
        setLanguageState(saved);
      }
    } catch (e) {
      console.warn('Error al leer idioma:', e);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Error al guardar idioma:', e);
    }
  };

  const t = DICTIONARY[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser utilizado dentro de un LanguageProvider');
  }
  return context;
};
