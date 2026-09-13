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
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    dailyRate: string;
    perDaySuffix: string;
    bookThisVehicle: string;
    viewSpecsAndGallery: string;
    vipWhatsApp: string;
    dockTitle: string;
    dockHint: string;
    warranty: string;
    insurance: string;
  };
  featured: {
    badge: string;
    title: string;
    description: string;
    allCollection: string;
    emptyTitle: string;
    emptySubtitle: string;
    viewAllBtn: string;
    bannerTitle: string;
    bannerSubtitle: string;
    exploreCatalogBtn: string;
  };
  experience: {
    badge: string;
    title: string;
    subtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
    pillar5Title: string;
    pillar5Desc: string;
    pillar6Title: string;
    pillar6Desc: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    reqAge: string;
    reqAgeDesc: string;
    reqLicense: string;
    reqLicenseDesc: string;
    reqDeposit: string;
    reqDepositDesc: string;
    reqInsurance: string;
    reqInsuranceDesc: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
  };
  catalog: {
    breadcrumbHome: string;
    breadcrumbCatalog: string;
    badge: string;
    title: string;
    subtitle: string;
    totalFleet: string;
    available: string;
    vipWarranty: string;
    searchPlaceholder: string;
    filtersBtn: string;
    sortBy: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortPower: string;
    sortYear: string;
    activeFilters: string;
    clearAll: string;
    showing: string;
    of: string;
    availableVehicles: string;
    filterPanelTitle: string;
    category: string;
    maxPricePerDay: string;
    availability: string;
    transmission: string;
    fuel: string;
    seats: string;
    any: string;
    all: string;
    applyFilters: string;
    reset: string;
  };
  detail: {
    backToCatalog: string;
    shareVehicle: string;
    linkCopied: string;
    officialRate: string;
    bookingCalculator: string;
    pickup: string;
    dropoff: string;
    day: string;
    days: string;
    comprehensiveCoverage: string;
    included: string;
    securityDeposit: string;
    totalEstimated: string;
    requestBooking: string;
    vehicleOnRental: string;
    vehicleInMaintenance: string;
    bookViaWhatsApp: string;
    specsTitle: string;
    equipmentTitle: string;
    similarVehicles: string;
    exploreCatalog: string;
    galleryTabAll: string;
    galleryTabExt: string;
    galleryTabInt: string;
    galleryTabDet: string;
  };
  footer: {
    fleet: string;
    services: string;
    airportDelivery: string;
    doorDelivery: string;
    chauffeur: string;
    events: string;
    contactConcierge: string;
    rightsReserved: string;
    terms: string;
    privacy: string;
    requirements: string;
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
    hero: {
      badge: 'CONCESIONARIO SHOWROOM VIP 360° • FLOTA 2026',
      titleLine1: 'TU VIAJE.',
      titleLine2: 'TU VEHÍCULO.',
      description: 'Gira cada vehículo en 360° sobre nuestro plato giratorio de exhibición. Usa las flechas o la barra inferior para pasar de un auto a otro, y haz clic para ver su ficha técnica y galería completa.',
      dailyRate: 'Tarifa por día',
      perDaySuffix: '/ 24h',
      bookThisVehicle: 'RESERVAR ESTE VEHÍCULO',
      viewSpecsAndGallery: 'VER FICHA TÉCNICA & GALERÍA COMPLETA (12 FOTOS)',
      vipWhatsApp: 'CONSULTA VIP POR WHATSAPP',
      dockTitle: 'EXHIBICIÓN SHOWROOM: ELIGE CUALQUIER VEHÍCULO PARA VERLO GIRAR',
      dockHint: 'Usa las flechas ← → para cambiar de auto',
      warranty: 'Garantía Flota',
      insurance: 'Seguro Integral',
    },
    featured: {
      badge: 'COLECCIÓN EXCLUSIVA',
      title: 'Nuestra Flota en Showroom',
      description: 'Cada vehículo ha sido seleccionado minuciosamente para ofrecer un desempeño impecable, estética vanguardista y una experiencia de conducción suprema.',
      allCollection: 'Toda la Colección',
      emptyTitle: 'No hay vehículos en esta categoría',
      emptySubtitle: 'Explora nuestras otras categorías disponibles en el showroom.',
      viewAllBtn: 'Ver todos los vehículos',
      bannerTitle: '¿Buscas un modelo o configuración específica?',
      bannerSubtitle: 'Accede a nuestro catálogo extendido con filtros por transmisión, tipo de combustible, plazas y rango de presupuesto.',
      exploreCatalogBtn: 'Explorar Catálogo Completo',
    },
    experience: {
      badge: 'DISTINCIÓN AUTOMOTRIZ',
      title: 'La Experiencia Showroom',
      subtitle: 'Diseñamos cada aspecto de nuestro servicio para superar las expectativas de quienes buscan excelencia, exclusividad y privacidad.',
      pillar1Title: 'Entrega Concierge VIP',
      pillar1Desc: 'Llevamos el vehículo directamente a la terminal privada del aeropuerto, a su hotel o residencia en el horario exacto.',
      pillar2Title: 'Póliza y Cobertura Total',
      pillar2Desc: 'Tranquilidad absoluta garantizada. Todos nuestros alquileres incluyen seguro integral y asistencia vial especializada.',
      pillar3Title: 'Condición Showroom Impecable',
      pillar3Desc: 'Cada automóvil se somete a un detallado estético premium y revisión mecánica exhaustiva antes de cada entrega.',
      pillar4Title: 'Sin Trámites Excesivos',
      pillar4Desc: 'Proceso de verificación digital rápido y expedito. Sin pérdidas de tiempo en mostradores convencionales.',
      pillar5Title: 'Asistencia Personal 24/7',
      pillar5Desc: 'Un asesor concierge dedicado estará disponible en todo momento durante su periodo de reserva.',
      pillar6Title: 'Flexibilidad de Devolución',
      pillar6Desc: 'Coordinamos la recogida del vehículo en el punto y hora que mejor se adapte a su itinerario de viaje.',
    },
    howItWorks: {
      badge: 'PROCESO TRANSPARENTE',
      title: 'Cómo Funciona tu Reserva',
      subtitle: 'Tres sencillos pasos para asegurar el vehículo ideal con atención personalizada.',
      step1Title: 'Elige tu Vehículo',
      step1Desc: 'Explora nuestra flota de alta gama con video exterior en showroom, galería de hasta 12 fotos y especificaciones completas.',
      step2Title: 'Selecciona tus Fechas',
      step2Desc: 'Indica el periodo de alquiler y el punto de entrega deseado (aeropuerto, hotel o domicilio). Confirmamos disponibilidad inmediata.',
      step3Title: 'Recibe las Llaves y Conduce',
      step3Desc: 'Entrega puntual con inspección visual transparente y el tanque lleno. Tu viaje de ensueño comienza sin complicaciones.',
    },
    faq: {
      badge: 'TRANSPARENCIA TOTAL',
      title: 'Requisitos y Preguntas Frecuentes',
      subtitle: 'Todo lo que necesitas saber para disfrutar de una experiencia de alquiler sin contratiempos.',
      reqAge: 'Edad Mínima',
      reqAgeDesc: 'en superdeportivos',
      reqLicense: 'Licencia Vigente',
      reqLicenseDesc: 'Mínimo 2 años antigüedad',
      reqDeposit: 'Depósito Seguro',
      reqDepositDesc: 'Retención reembolsable',
      reqInsurance: 'Póliza Integral',
      reqInsuranceDesc: 'Cobertura completa',
      q1: '¿Cuáles son los requisitos mínimos para alquilar un vehículo de lujo?',
      a1: 'Es necesario tener al menos 23 años de edad (25 para modelos superdeportivos), presentar una licencia de conducir vigente (nacional o internacional válida) y documento de identidad o pasaporte original.',
      q2: '¿Qué cubre el seguro incluido en el alquiler?',
      a2: 'Todos los vehículos cuentan con póliza a todo riesgo con franquicia reducida, cobertura contra robo, daños a terceros y asistencia médica de urgencia. También disponemos de opción de Cobertura Cero Franquicia.',
      q3: '¿Cómo se gestiona la entrega y devolución (Concierge VIP)?',
      a3: 'Coordinamos la entrega directa en la terminal de llegadas del aeropuerto (incluyendo aviación privada), en el lobby de su hotel o directamente en su residencia particular a la hora exacta solicitada.',
      q4: '¿Existe límite de kilometraje diario?',
      a4: 'Nuestras tarifas estándar incluyen 200 km libres por día. Disponemos de paquetes con kilometraje ampliado o ilimitado según el modelo y la duración de la reserva.',
      q5: '¿Cuál es la política de combustible?',
      a5: 'Entregamos el vehículo con el depósito completamente lleno y verificado. Se devuelve en el mismo estado para evitar cargos adicionales de reabastecimiento.',
    },
    catalog: {
      breadcrumbHome: 'Inicio',
      breadcrumbCatalog: 'Catálogo de Vehículos',
      badge: 'COLECCIÓN BOUTIQUE 2026',
      title: 'Flota de Alto Rendimiento',
      subtitle: 'Explora nuestra cuidada selección de superdeportivos, SUVs de ultra-lujo y sedanes ejecutivos. Cada unidad se entrega con cobertura total y en estado de conservación de museo.',
      totalFleet: 'Total Flota',
      available: 'Disponibles',
      vipWarranty: 'Garantía VIP',
      searchPlaceholder: 'Buscar por marca, modelo o especificación (ej. GT3, V8)...',
      filtersBtn: 'Filtros',
      sortBy: 'Ordenar por:',
      sortFeatured: 'Destacados de la Flota',
      sortPriceAsc: 'Tarifa: Menor a Mayor',
      sortPriceDesc: 'Tarifa: Mayor a Menor',
      sortPower: 'Potencia (Caballos de Fuerza)',
      sortYear: 'Año: Más Reciente',
      activeFilters: 'Filtros activos:',
      clearAll: 'Limpiar todo',
      showing: 'Mostrando',
      of: 'de',
      availableVehicles: 'vehículos disponibles',
      filterPanelTitle: 'Filtros de Precisión',
      category: 'Categoría',
      maxPricePerDay: 'Tarifa Máxima / Día',
      availability: 'Disponibilidad',
      transmission: 'Transmisión',
      fuel: 'Combustible / Propulsión',
      seats: 'Plazas Mínimas',
      any: 'Cualquiera',
      all: 'Todos',
      applyFilters: 'Aplicar Filtros',
      reset: 'Limpiar',
    },
    detail: {
      backToCatalog: 'Volver al Catálogo',
      shareVehicle: 'Compartir',
      linkCopied: '¡Enlace Copiado!',
      officialRate: 'Tarifa Diaria Oficial',
      bookingCalculator: 'Cotizador de Reserva',
      pickup: 'Recogida',
      dropoff: 'Devolución',
      day: 'día',
      days: 'días',
      comprehensiveCoverage: 'Cobertura VIP a todo riesgo',
      included: 'Incluida',
      securityDeposit: 'Depósito de garantía reembolsable',
      totalEstimated: 'Total Estimado',
      requestBooking: 'Solicitar Reserva',
      vehicleOnRental: 'Vehículo Actualmente Alquilado',
      vehicleInMaintenance: 'Unidad en Mantenimiento',
      bookViaWhatsApp: 'Reservar por WhatsApp Concierge',
      specsTitle: 'Especificaciones y Ficha Técnica',
      equipmentTitle: 'Equipamiento y Paquetes de Serie',
      similarVehicles: 'Vehículos Similares en la Flota',
      exploreCatalog: 'Explorar Todo el Catálogo',
      galleryTabAll: 'Todas las Fotos',
      galleryTabExt: 'Exterior',
      galleryTabInt: 'Interior',
      galleryTabDet: 'Detalles',
    },
    footer: {
      fleet: 'Colección',
      services: 'Servicios VIP',
      airportDelivery: 'Entrega en Aeropuerto',
      doorDelivery: 'Entrega a Domicilio',
      chauffeur: 'Chófer Privado',
      events: 'Eventos & Producciones',
      contactConcierge: 'Contacto Concierge',
      rightsReserved: 'Todos los derechos reservados.',
      terms: 'Términos del Servicio',
      privacy: 'Política de Privacidad',
      requirements: 'Requisitos de Alquiler',
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
    hero: {
      badge: 'VIP 360° SHOWROOM PAVILION • 2026 FLEET',
      titleLine1: 'YOUR JOURNEY.',
      titleLine2: 'YOUR VEHICLE.',
      description: 'Rotate each vehicle in 360° on our turntable display. Use the navigation arrows or dock to switch models, and click to view full specifications and gallery.',
      dailyRate: 'Daily Rate',
      perDaySuffix: '/ 24h',
      bookThisVehicle: 'RESERVE THIS VEHICLE',
      viewSpecsAndGallery: 'VIEW SPECIFICATIONS & 12-PHOTO GALLERY',
      vipWhatsApp: 'VIP CONCIERGE WHATSAPP',
      dockTitle: 'SHOWROOM PAVILION: SELECT ANY VEHICLE TO ROTATE',
      dockHint: 'Use arrows ← → to switch vehicles',
      warranty: 'Fleet Warranty',
      insurance: 'Comprehensive Insurance',
    },
    featured: {
      badge: 'EXCLUSIVE COLLECTION',
      title: 'Our Showroom Fleet',
      description: 'Each vehicle is meticulously curated to deliver flawless performance, cutting-edge aesthetics, and a supreme driving experience.',
      allCollection: 'All Collection',
      emptyTitle: 'No vehicles found in this category',
      emptySubtitle: 'Explore our other categories available in the showroom.',
      viewAllBtn: 'View all vehicles',
      bannerTitle: 'Looking for a specific model or bespoke configuration?',
      bannerSubtitle: 'Access our extended catalog with precision filters by transmission, powertrain, seating, and budget.',
      exploreCatalogBtn: 'Explore Full Catalog',
    },
    experience: {
      badge: 'AUTOMOTIVE DISTINCTION',
      title: 'The Showroom Experience',
      subtitle: 'We craft every touchpoint of our service to exceed expectations of those seeking excellence, exclusivity, and discretion.',
      pillar1Title: 'VIP Concierge Delivery',
      pillar1Desc: 'Direct vehicle delivery to private airport terminals, your luxury hotel suite, or private estate at your exact scheduled hour.',
      pillar2Title: 'Full Coverage & Peace of Mind',
      pillar2Desc: 'Absolute serenity guaranteed. Every rental includes comprehensive premium insurance and 24/7 dedicated roadside response.',
      pillar3Title: 'Showroom Concierge Standard',
      pillar3Desc: 'Every supercar undergoes a multi-point mechanical inspection and bespoke aesthetic detailing before key handover.',
      pillar4Title: 'Frictionless Paperwork',
      pillar4Desc: 'Seamless digital verification and streamlined agreements. Zero waiting at airport counters.',
      pillar5Title: '24/7 Dedicated Concierge',
      pillar5Desc: 'A personal concierge advisor is available at all hours throughout your entire rental journey.',
      pillar6Title: 'Bespoke Return Logistics',
      pillar6Desc: 'Flexible drop-off collection scheduled around your private flight or travel itinerary.',
    },
    howItWorks: {
      badge: 'TRANSPARENT PROCESS',
      title: 'How Your Reservation Works',
      subtitle: 'Three effortless steps to secure your dream vehicle with bespoke concierge support.',
      step1Title: 'Select Your Vehicle',
      step1Desc: 'Explore our curated fleet with 360° turntable displays, 12-photo galleries, and verified telemetry specs.',
      step2Title: 'Choose Dates & Location',
      step2Desc: 'Specify your rental schedule and desired delivery point (airport, hotel, or private villa) for instant confirmation.',
      step3Title: 'Receive Keys & Drive',
      step3Desc: 'Punctual white-glove handover with full tank and transparent inspection. Your extraordinary journey begins.',
    },
    faq: {
      badge: 'TOTAL TRANSPARENCY',
      title: 'Requirements & FAQ',
      subtitle: 'Everything you need to know for a seamless, world-class luxury car rental.',
      reqAge: 'Minimum Age',
      reqAgeDesc: 'for supercars',
      reqLicense: 'Valid License',
      reqLicenseDesc: 'Minimum 2 years experience',
      reqDeposit: 'Security Deposit',
      reqDepositDesc: 'Refundable pre-authorization',
      reqInsurance: 'Comprehensive Policy',
      reqInsuranceDesc: 'Full coverage included',
      q1: 'What are the minimum requirements to rent a luxury vehicle?',
      a1: 'Drivers must be at least 23 years old (25 for supercars), hold a valid driver’s license (national or international permit), and present a valid passport or government ID.',
      q2: 'What is covered under the included insurance policy?',
      a2: 'All vehicles feature comprehensive coverage with reduced deductible, theft protection, third-party liability, and emergency roadside assistance.',
      q3: 'How does the VIP Concierge delivery & return work?',
      a3: 'We coordinate handovers directly at private airport FBOs, hotel port-cochère, or private villas at your specified appointment time.',
      q4: 'Is there a daily mileage limitation?',
      a4: 'Standard rates include 200 free kilometers (125 miles) per day. Extended and unlimited mileage packages are available.',
      q5: 'What is the fuel policy?',
      a5: 'We deliver vehicles with a full tank of premium fuel. Return with the same level to avoid refueling fees.',
    },
    catalog: {
      breadcrumbHome: 'Home',
      breadcrumbCatalog: 'Vehicle Catalog',
      badge: 'BOUTIQUE 2026 FLEET',
      title: 'High-Performance Fleet',
      subtitle: 'Explore our curated portfolio of exotic supercars, ultra-luxury SUVs, and executive sedans. Delivered in museum condition.',
      totalFleet: 'Total Fleet',
      available: 'Available',
      vipWarranty: 'VIP Warranty',
      searchPlaceholder: 'Search by brand, model, or specs (e.g. GT3, V8)...',
      filtersBtn: 'Filters',
      sortBy: 'Sort by:',
      sortFeatured: 'Featured Fleet',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortPower: 'Horsepower (High to Low)',
      sortYear: 'Year: Newest First',
      activeFilters: 'Active filters:',
      clearAll: 'Clear all',
      showing: 'Showing',
      of: 'of',
      availableVehicles: 'vehicles available',
      filterPanelTitle: 'Precision Filters',
      category: 'Category',
      maxPricePerDay: 'Max Daily Rate',
      availability: 'Availability',
      transmission: 'Transmission',
      fuel: 'Powertrain & Fuel',
      seats: 'Minimum Seats',
      any: 'Any',
      all: 'All',
      applyFilters: 'Apply Filters',
      reset: 'Clear',
    },
    detail: {
      backToCatalog: 'Back to Catalog',
      shareVehicle: 'Share',
      linkCopied: 'Link Copied!',
      officialRate: 'Official Daily Rate',
      bookingCalculator: 'Rental Quote Calculator',
      pickup: 'Pick-up Date',
      dropoff: 'Return Date',
      day: 'day',
      days: 'days',
      comprehensiveCoverage: 'Comprehensive VIP Coverage',
      included: 'Included',
      securityDeposit: 'Refundable Security Deposit',
      totalEstimated: 'Estimated Rental Total',
      requestBooking: 'Request Reservation',
      vehicleOnRental: 'Currently on Rental',
      vehicleInMaintenance: 'Unit in Scheduled Maintenance',
      bookViaWhatsApp: 'Book via WhatsApp Concierge',
      specsTitle: 'Technical Specifications & Performance',
      equipmentTitle: 'Factory Equipment & Bespoke Options',
      similarVehicles: 'Similar Vehicles in Fleet',
      exploreCatalog: 'Explore Entire Catalog',
      galleryTabAll: 'All Photos',
      galleryTabExt: 'Exterior',
      galleryTabInt: 'Interior',
      galleryTabDet: 'Bespoke Details',
    },
    footer: {
      fleet: 'Collection',
      services: 'VIP Services',
      airportDelivery: 'Airport VIP Delivery',
      doorDelivery: 'Doorstep Delivery',
      chauffeur: 'Private Chauffeur',
      events: 'Events & Film Production',
      contactConcierge: 'Concierge Contact',
      rightsReserved: 'All rights reserved.',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      requirements: 'Rental Requirements',
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
