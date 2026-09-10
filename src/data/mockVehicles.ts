import { Vehicle } from '../types/vehicle';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    slug: 'porsche-911-gt3-rs-2024',
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    plate: 'LUX-911',
    category: 'DEPORTIVO',
    description: 'Pura ingeniería de circuito homologada para la carretera. Aerodinámica activa extrema y motor bóxer atmosférico de 4.0 litros que gira a 9,000 RPM.',
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
      'Audio Bose Surround'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
    // Video corto showroom loop (sample MP4 web optimizado silencioso)
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-the-city-at-night-42984-large.mp4',
    specs: {
      acceleration0to100: '3.2 s',
      horsepower: 525,
      topSpeed: 296,
      doors: 2
    },
    gallery: {
      exteriorImages: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'veh-002',
    slug: 'mercedes-amg-g63-2024',
    brand: 'Mercedes-Benz',
    model: 'AMG G63 Stronger Than Time',
    year: 2024,
    plate: 'G63-V8',
    category: 'SUV_LUJO',
    description: 'El icono definitivo del poder y estatus. Motor V8 Biturbo artesanal de 585 CV, acabados en fibra de carbono y el inconfundible sonido de sus escapes laterales.',
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
      'Tracción Integral Permanente con 3 diferenciales',
      'Techo corredizo eléctrico panorámico'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1600&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-in-an-autumn-landscape-43033-large.mp4',
    specs: {
      acceleration0to100: '4.5 s',
      horsepower: 585,
      topSpeed: 240,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
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
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'veh-003',
    slug: 'ferrari-f8-tributo-2023',
    brand: 'Ferrari',
    model: 'F8 Tributo',
    year: 2023,
    plate: 'F8-ITA',
    category: 'EXOTICO',
    description: 'Homenaje supremo al motor V8 más galardonado de la historia de Maranello. 720 caballos de fuerza con un diseño aerodinámico magistral y una respuesta instantánea.',
    pricePerDay: 1950,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    features: [
      'Motor V8 Twin Turbo 720 CV',
      'Chasis de Aluminio ultraligero',
      'Ferrari Dynamic Enhancer (FDE+)',
      'Volante Manettino F1 de Carbono',
      'Asientos Racing Daytona en alcántara',
      'Cámara de elevación delantera (Front Lift)'
    ],
    status: 'RENTED', // Muestra insignia de Alquilado (Regla 14)
    mainImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-the-city-at-night-42984-large.mp4',
    specs: {
      acceleration0to100: '2.9 s',
      horsepower: 720,
      topSpeed: 340,
      doors: 2
    },
    isFeatured: true,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'veh-004',
    slug: 'rolls-royce-ghost-black-badge-2024',
    brand: 'Rolls-Royce',
    model: 'Ghost Black Badge',
    year: 2024,
    plate: 'RR-VIP',
    category: 'SEDAN_EJECUTIVO',
    description: 'La máxima expresión del lujo moderno y la serenidad sobre ruedas. Su motor V12 twin-turbo y suspensión planar proporcionan la sensación inigualable de alfombra mágica.',
    pricePerDay: 2300,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Techo Starlight con estrellas fugaces',
      'Puertas de apertura y cierre asistido electro-magnético',
      'Interior en madera técnica y cuero artesanal de grado 1',
      'Suspensión Planar Flagbearer con cámara predictiva',
      'Compartimento refrigerado para champaña con cristalería',
      'Aislamiento acústico de doble acristalamiento'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-luxury-black-car-driving-on-the-highway-at-night-43013-large.mp4',
    specs: {
      acceleration0to100: '4.7 s',
      horsepower: 600,
      topSpeed: 250,
      doors: 4
    },
    isFeatured: true,
    createdAt: '2026-01-15T15:00:00Z',
    updatedAt: '2026-01-15T15:00:00Z',
  },
  {
    id: 'veh-005',
    slug: 'bmw-m4-competition-2024',
    brand: 'BMW',
    model: 'M4 Competition xDrive',
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
      'Tracción inteligente M xDrive con modo 2WD',
      'Diferencial Activo M',
      'Asientos M de Carbono envolventes',
      'Faros Láser BMW Shadowline',
      'Sistema de escape M Performance con cuatro salidas'
    ],
    status: 'AVAILABLE',
    mainImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85',
    specs: {
      acceleration0to100: '3.5 s',
      horsepower: 510,
      topSpeed: 290,
      doors: 2
    },
    isFeatured: true,
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'veh-006',
    slug: 'lamborghini-urus-performante-2024',
    brand: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    plate: 'URU-666',
    category: 'SUV_LUJO',
    description: 'Superdeportivo con alma de SUV. El Urus Performante eleva el rendimiento con menor peso, aerodinámica mejorada y modo Rally exclusivo para terrenos sueltos.',
    pricePerDay: 1650,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Capó y techo de fibra de carbono visible',
      'Escape de titanio Akrapovič de serie',
      'Selector de modos ANIMA (incluye RALLY)',
      'Frenos carbono-cerámicos con pinzas personalizadas',
      'Llantas forjadas de 23 pulgadas',
      'Interior en Alcántara Nero Cosmus'
    ],
    status: 'MAINTENANCE', // Demuestra estado 🟠 Mantenimiento (Regla 14)
    mainImage: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85',
    specs: {
      acceleration0to100: '3.3 s',
      horsepower: 666,
      topSpeed: 306,
      doors: 5
    },
    isFeatured: false,
    createdAt: '2026-01-22T11:00:00Z',
    updatedAt: '2026-01-22T11:00:00Z',
  }
];
