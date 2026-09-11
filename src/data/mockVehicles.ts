import { Vehicle } from '../types/vehicle';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    slug: 'rolls-royce-ghost-black-badge-2024',
    brand: 'Rolls-Royce',
    model: 'Ghost Black Badge',
    year: 2024,
    plate: 'RR-VIP',
    category: 'SEDAN_EJECUTIVO',
    description: 'La cúspide del lujo contemporáneo y la máxima serenidad sobre ruedas. Su motor V12 twin-turbo y suspensión planar proporcionan una experiencia de viaje inigualable en el pináculo de la elegancia automotriz.',
    pricePerDay: 2300,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Techo Shooting Starlight con constelaciones activas',
      'Puertas de apertura y cierre asistido electro-magnético',
      'Interior en madera técnica y cuero artesanal de grado 1',
      'Suspensión Planar Flagbearer con cámara predictiva',
      'Nevera para champaña con cristalería grabada a mano',
      'Aislamiento acústico de doble acristalamiento reforzado'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/rolls-royce-ghost.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-luxury-black-car-driving-on-the-highway-at-night-43013-large.mp4',
    specs: {
      acceleration0to100: '4.7 s',
      horsepower: 600,
      topSpeed: 250,
      doors: 4
    },
    gallery: {
      exteriorImages: [
        '/vehicles/rolls-royce-ghost.jpg',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-15T15:00:00Z',
    updatedAt: '2026-01-15T15:00:00Z',
  },
  {
    id: 'veh-002',
    slug: 'porsche-911-gt3-rs-2024',
    brand: 'Porsche',
    model: '911 GT3 RS (Weissach)',
    year: 2024,
    plate: 'LUX-911',
    category: 'DEPORTIVO',
    description: 'Pura ingeniería de circuito homologada para la carretera. Aerodinámica activa extrema, alerón DRS móvil y motor bóxer atmosférico de 4.0L que gira a 9,000 RPM.',
    pricePerDay: 1250,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    features: [
      'Paquete Weissach Fibra de Carbono',
      'Frenos Carbono-Cerámicos (PCCB)',
      'Eje Trasero Direccional Activo',
      'Sistema DRS de Alerón Móvil',
      'Escape Deportivo de Titanio',
      'Audio Bose Surround High-End'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/porsche-gt3-rs.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-the-city-at-night-42984-large.mp4',
    specs: {
      acceleration0to100: '3.2 s',
      horsepower: 525,
      topSpeed: 296,
      doors: 2
    },
    gallery: {
      exteriorImages: [
        '/vehicles/porsche-gt3-rs.jpg',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'veh-003',
    slug: 'ferrari-f8-tributo-2023',
    brand: 'Ferrari',
    model: 'F8 Tributo (Maranello)',
    year: 2023,
    plate: 'F8-ITA',
    category: 'EXOTICO',
    description: 'Homenaje supremo al motor V8 más galardonado de la historia. 720 caballos de fuerza con un diseño aerodinámico magistral, aerodinámica S-Duct y respuesta brutal al acelerador.',
    pricePerDay: 1950,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    features: [
      'Motor V8 Twin Turbo 3.9L de 720 CV',
      'Chasis de Aluminio ultraligero',
      'Ferrari Dynamic Enhancer (FDE+)',
      'Volante Manettino F1 con LEDs de cambio',
      'Asientos Racing Daytona en alcántara y fibra de carbono',
      'Sistema de elevación delantera (Front Lift)'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/ferrari-f8.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-the-city-at-night-42984-large.mp4',
    specs: {
      acceleration0to100: '2.9 s',
      horsepower: 720,
      topSpeed: 340,
      doors: 2
    },
    gallery: {
      exteriorImages: [
        '/vehicles/ferrari-f8.jpg',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'veh-004',
    slug: 'mercedes-amg-g63-2024',
    brand: 'Mercedes-Benz',
    model: 'AMG G63 Stronger Than Time',
    year: 2024,
    plate: 'G63-V8',
    category: 'SUV_LUJO',
    description: 'El icono supremo de poder y exclusividad. Motor V8 Biturbo artesanal de 585 CV, acabados en fibra de carbono mate y el inconfundible sonido de sus escapes laterales AMG.',
    pricePerDay: 1450,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Motor V8 Biturbo 4.0L Handcrafted',
      'Tapicería Cuero Nappa Exclusivo bitono',
      'Sistema de Sonido Burmester High-End 3D',
      'Escape Deportivo AMG con válvula activa',
      'Tracción Integral Permanente con 3 bloqueos',
      'Techo corredizo panorámico de cristal'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/mercedes-amg-g63.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-in-an-autumn-landscape-43033-large.mp4',
    specs: {
      acceleration0to100: '4.5 s',
      horsepower: 585,
      topSpeed: 240,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/mercedes-amg-g63.jpg',
        'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'veh-005',
    slug: 'mclaren-720s-spider-2024',
    brand: 'McLaren',
    model: '720S Spider Performance',
    year: 2024,
    plate: 'MCL-720',
    category: 'CONVERTIBLE',
    description: 'Superdeportivo descapotable con monocasco de fibra de carbono y puertas diédricas. El techo rígido retráctil se pliega en 11 segundos permitiendo disfrutar de sus 720 CV a cielo abierto.',
    pricePerDay: 1850,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    features: [
      'Chasis Monocell II-S de fibra de carbono pura',
      'Puertas diédricas de apertura vertical con apertura asistida',
      'Techo rígido retráctil de vidrio electrocrómico',
      'Suspensión Proactive Chassis Control II',
      'Frenos carbono-cerámicos con pinzas McLaren Orange',
      'Sistema de telemetría de circuito integrada'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/mclaren-720s.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-the-city-at-night-42984-large.mp4',
    specs: {
      acceleration0to100: '2.8 s',
      horsepower: 720,
      topSpeed: 341,
      doors: 2
    },
    gallery: {
      exteriorImages: [
        '/vehicles/mclaren-720s.jpg',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
  },
  {
    id: 'veh-006',
    slug: 'lamborghini-urus-performante-2024',
    brand: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    plate: 'URU-666',
    category: 'SUV_LUJO',
    description: 'Superdeportivo con alma de SUV. El Urus Performante eleva el rendimiento con menor peso, aerodinámica mejorada, escape de titanio Akrapovič y modo Rally exclusivo.',
    pricePerDay: 1650,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Capó y techo de fibra de carbono visible',
      'Escape de titanio Akrapovič de fábrica',
      'Selector de modos ANIMA (incluye modo RALLY)',
      'Frenos carbono-cerámicos con pinzas personalizadas',
      'Llantas forjadas de 23 pulgadas ultraligeras',
      'Interior completo en Alcántara Nero Cosmus'
    ],
    status: 'MAINTENANCE',
    mainImage: '/vehicles/lamborghini-urus.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-the-city-at-night-42984-large.mp4',
    specs: {
      acceleration0to100: '3.3 s',
      horsepower: 666,
      topSpeed: 306,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/lamborghini-urus.jpg',
        'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-22T11:00:00Z',
    updatedAt: '2026-01-22T11:00:00Z',
  },
  {
    id: 'veh-007',
    slug: 'aston-martin-dbx707-2024',
    brand: 'Aston Martin',
    model: 'DBX707 V8 Super-SUV',
    year: 2024,
    plate: 'AM-707',
    category: 'SUV_LUJO',
    description: 'El SUV de lujo más potente del mundo. 707 caballos de fuerza con el refinamiento británico inconfundible de Aston Martin, embrague húmedo de competición y un dinamismo asombroso.',
    pricePerDay: 1550,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Motor 4.0L V8 Biturbo recalibrado a 707 CV',
      'Transmisión de 9 velocidades con embrague húmedo multidisco',
      'Frenos de carbono-cerámica de 420mm de serie',
      'Diferencial electrónico trasero de deslizamiento limitado (e-diff)',
      'Asientos Sport Plus de cuero Semi-Anilina cosidos a mano',
      'Escape cuádruple activo con salidas de acero inoxidable'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/aston-martin-dbx.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-luxury-black-car-driving-on-the-highway-at-night-43013-large.mp4',
    specs: {
      acceleration0to100: '3.1 s',
      horsepower: 707,
      topSpeed: 310,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/aston-martin-dbx.jpg',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
  {
    id: 'veh-008',
    slug: 'bmw-m4-competition-2024',
    brand: 'BMW',
    model: 'M4 Competition M xDrive',
    year: 2024,
    plate: 'M4-XDR',
    category: 'DEPORTIVO',
    description: 'Equilibrio perfecto entre deportividad pura y comodidad diaria. 510 CV con tracción total inteligente configurable a propulsión trasera para una experiencia visceral.',
    pricePerDay: 680,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 4,
    features: [
      'Motor 3.0L M TwinPower Turbo 6 cilindros en línea',
      'Tracción inteligente M xDrive con modo 2WD pura propulsión',
      'Diferencial Activo M de competición',
      'Asientos M de Carbono envolventes',
      'Faros Láser BMW Shadowline con luz de curva',
      'Sistema de escape M Performance con cuatro salidas'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/bmw-m4.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-in-an-autumn-landscape-43033-large.mp4',
    specs: {
      acceleration0to100: '3.5 s',
      horsepower: 510,
      topSpeed: 290,
      doors: 2
    },
    gallery: {
      exteriorImages: [
        '/vehicles/bmw-m4.jpg',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'veh-009',
    slug: 'ferrari-296-gtb-hybrid-2024',
    brand: 'Ferrari',
    model: '296 GTB Assetto Fiorano',
    year: 2024,
    plate: 'FER-296',
    category: 'EXOTICO',
    description: 'Revolución híbrida enchufable de Maranello. Combina un V6 turbo a 120° con un motor eléctrico para desatar 830 CV de precisión quirúrgica y aceleración instantánea.',
    pricePerDay: 2100,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'HIBRIDO',
    seats: 2,
    features: [
      'Propulsión Híbrida V6 PHEV de 830 CV combinados',
      'Paquete de aligeramiento Assetto Fiorano',
      'Amortiguadores Multimatic derivados de carreras GT',
      'Modo eDrive 100% eléctrico para ciudad',
      'Llantas de fibra de carbono ultraligeras',
      'Pantalla para acompañante con telemetría en tiempo real'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85',
    specs: {
      acceleration0to100: '2.9 s',
      horsepower: 830,
      topSpeed: 330,
      doors: 2
    },
    isFeatured: false,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'veh-010',
    slug: 'porsche-taycan-turbo-s-2024',
    brand: 'Porsche',
    model: 'Taycan Turbo S Cross Turismo',
    year: 2024,
    plate: 'TAY-999',
    category: 'SEDAN_EJECUTIVO',
    description: 'Prestaciones eléctricas electrizantes con alma 100% Porsche. Aceleración brutal con Launch Control (761 CV en Overboost) y arquitectura de 800 voltios de carga ultrarrápida.',
    pricePerDay: 950,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'ELECTRICO',
    seats: 4,
    features: [
      'Tracción total permanente con 2 motores síncronos',
      'Batería Performance Plus de 93.4 kWh',
      'Porsche Electric Sport Sound activo',
      'Suspensión neumática adaptativa de tres cámaras con PASM',
      'Frenos cerámicos PCCB con pinzas en amarillo ácido',
      'Pantalla curva digital de 16.8 pulgadas para el conductor'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85',
    specs: {
      acceleration0to100: '2.8 s',
      horsepower: 761,
      topSpeed: 260,
      doors: 4
    },
    isFeatured: false,
    createdAt: '2026-02-03T11:00:00Z',
    updatedAt: '2026-02-03T11:00:00Z',
  },
  {
    id: 'veh-011',
    slug: 'porsche-911-carrera-t-manual-2024',
    brand: 'Porsche',
    model: '911 Carrera T (Manual 7-Vel)',
    year: 2024,
    plate: 'MAN-911',
    category: 'DEPORTIVO',
    description: 'Para los auténticos puristas del volante. Transmisión manual de 7 velocidades de recorrido corto, acristalamiento ligero, eliminación de asientos traseros y suspensión deportiva PASM (-10mm).',
    pricePerDay: 790,
    currency: 'USD',
    transmission: 'MANUAL',
    fuel: 'GASOLINA',
    seats: 2,
    features: [
      'Caja de cambios manual de 7 marchas con función auto-blip',
      'Diferencial mecánico autoblocante con Porsche Torque Vectoring',
      'Suspensión deportiva PASM rebajada 10 mm',
      'Escape deportivo con salidas dobles en negro brillo',
      'Aislamiento acústico reducido para sentir el motor bóxer',
      'Volante deportivo GT calefactable en Race-Tex'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
    specs: {
      acceleration0to100: '4.0 s',
      horsepower: 385,
      topSpeed: 291,
      doors: 2
    },
    isFeatured: false,
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-02-05T09:00:00Z',
  }
];
