import { Vehicle } from '../types/vehicle';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-txl-negra-2022',
    slug: 'toyota-prado-txl-negra-2022',
    brand: 'Toyota',
    model: 'Prado TXL 4x4 2022',
    year: 2022,
    plate: 'TXL-022',
    category: 'SUV_LUJO',
    description: 'La camioneta insignia ejecutiva en Colombia. Máximo estatus, comodidad superior y capacidad 4x4 total. Acabados en cuero premium, techo corredizo, climatizador tri-zona y serenidad absoluta para traslados ejecutivos y viajes VIP.',
    pricePerDay: 180,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'DIESEL',
    seats: 7,
    features: [
      'Tracción 4WD Permanente con Selector Multiterreno',
      'Interior en Cuero Premium con Calefacción y Ventilación',
      'Techo Corredizo Eléctrico (Sunroof)',
      'Sistema de Entretenimiento Touch con Apple CarPlay y Android Auto',
      'Nevera en Consola Central (Cool Box)',
      'Cámara 360° con Sensores de Proximidad 8 Zonas'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/toyota-prado-txl-negra.jpg',
    specs: {
      acceleration0to100: '9.8 s',
      horsepower: 204,
      topSpeed: 185,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/toyota-prado-txl-negra.jpg',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-runner-blindada-2022',
    slug: 'toyota-4runner-blindada-2022',
    brand: 'Toyota',
    model: '4Runner Blindada Nivel 3+',
    year: 2022,
    plate: 'RUN-422',
    category: 'SUV_LUJO',
    description: 'Seguridad ejecutiva de máxima categoría en color Blanco Perla. Blindaje balístico integral Nivel 3+ certificado con vidrios multicapa de 21mm, protección contra armas cortas y subametralladoras, rines con sistema Run-Flat y suspensión reforzada.',
    pricePerDay: 260,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 7,
    features: [
      'Blindaje Balístico Nivel 3+ Certificado',
      'Cristales Blindados con Traslúcidos de Alta Resistencia',
      'Neumáticos con Inserciones Run-Flat Antipinchazos',
      'Sirena e Intercomunicador de Seguridad Bidireccional',
      'Motor V6 4.0L de Alto Torque',
      'Suspensión Deportiva Reforzada para Peso Adicional'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/toyota-4runner-blanca-blindada.jpg',
    specs: {
      acceleration0to100: '8.4 s',
      horsepower: 270,
      topSpeed: 190,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/toyota-4runner-blanca-blindada.jpg',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-fortuner-sw4-2023',
    slug: 'toyota-fortuner-sw4-diamond-2023',
    brand: 'Toyota',
    model: 'Fortuner SW4 Diamond 4x4',
    year: 2023,
    plate: 'FTN-723',
    category: 'SUV_LUJO',
    description: 'La camioneta todoterreno familiar por excelencia en Colombia. Robustez insuperable, confort de 7 plazas en color Gris Plata, tracción 4x4 con bajo y bloqueo de diferencial, ideal para viajes por cualquier topografía nacional.',
    pricePerDay: 160,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'DIESEL',
    seats: 7,
    features: [
      'Tracción 4x4 con Bajo y Bloqueo de Diferencial Trasero',
      'Capacidad para 7 Pasajeros con Tercera Fila Plegable',
      'Cojinería en Cuero Bitono Diamond con Costuras Especiales',
      'Portón Trasero con Apertura y Cierre Eléctrico',
      'Sistema de Audio JBL Premium con Subwoofer',
      'Control de Descenso en Pendientes (DAC) y Asistente de Arranque (HAC)'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/toyota-fortuner-sw4-2023.jpg',
    specs: {
      acceleration0to100: '10.2 s',
      horsepower: 204,
      topSpeed: 180,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/toyota-fortuner-sw4-2023.jpg',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-sportage-gris-2022',
    slug: 'kia-sportage-gris-2022',
    brand: 'Kia',
    model: 'Sportage GT-Line 2022',
    year: 2022,
    plate: 'KSP-222',
    category: 'SUV_LUJO',
    description: 'SUV moderna y elegante en tono Gris Titanio. Gran economía de combustible, excelente espacio interior para equipaje y familia, pantalla panorámica curva, asistentes avanzados de conducción y suavidad de marcha inigualable.',
    pricePerDay: 95,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Pantalla Panorámica Curva Dual de 12.3 Pulgadas',
      'Faros Delanteros Full LED con Luces Boomerang',
      'Techo Panorámico Corredizo de Cristal',
      'Apple CarPlay y Android Auto Inalámbrico',
      'Cámara de Reversa HD con Guías Dinámicas',
      'Climatizador Automático Dual Bizona'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/kia-sportage-gris-2022.jpg',
    specs: {
      acceleration0to100: '8.9 s',
      horsepower: 187,
      topSpeed: 200,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/kia-sportage-gris-2022.jpg',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-sportage-blanca-2022',
    slug: 'kia-sportage-blanca-2022',
    brand: 'Kia',
    model: 'Sportage Zenith 2022',
    year: 2022,
    plate: 'SPT-822',
    category: 'SUV_LUJO',
    description: 'La SUV preferida en color Blanco Perla con techo negro bitono. Diseño vanguardista, asientos ergonómicos, gran confort de marcha para viajes largos y excelente consumo de combustible.',
    pricePerDay: 95,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Acabado Bitono Blanco Perla con Techo Negro Gloss',
      'Rines de Lujo Bicolor de 19 Pulgadas',
      'Asientos en Cuero con Ajuste Eléctrico y Lumbar',
      'Apertura Inteligente de Baúl Manos Libres',
      'Control de Crucero Adaptativo con Freno Autónomo',
      'Cargador Inalámbrico para Smartphones'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/kia-sportage-blanca-2022.jpg',
    specs: {
      acceleration0to100: '8.9 s',
      horsepower: 187,
      topSpeed: 200,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/kia-sportage-blanca-2022.jpg',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-mazda3-blanco-2018',
    slug: 'mazda-3-blanco-2018',
    brand: 'Mazda',
    model: '3 Grand Touring 2018',
    year: 2018,
    plate: 'MZD-318',
    category: 'SEDAN_EJECUTIVO',
    description: 'El sedán compacto más elegante y cotizado en Blanco Nieve. Manejo ágil y dinámico con tecnología SkyActiv-G, interior refinado con Head-Up Display, sistema de audio premium Bose y líneas esculpidas Kodo.',
    pricePerDay: 65,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Motor 2.0L SkyActiv-G de Alto Rendimiento y Ahorro',
      'Sistema de Audio Premium Bose de 9 Altavoces',
      'Pantalla Activa de Conducción Head-Up Display',
      'Sunroof Eléctrico de Cristal',
      'Asientos en Cuero Genuino y Paletas de Cambio en Volante',
      'Monitoreo de Punto Ciego y Alerta de Tráfico Cruzado'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/mazda-3-blanco-2018.jpg',
    specs: {
      acceleration0to100: '8.2 s',
      horsepower: 153,
      topSpeed: 210,
      doors: 4
    },
    gallery: {
      exteriorImages: [
        '/vehicles/mazda-3-blanco-2018.jpg',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-suzuki-swift-sport-2022',
    slug: 'suzuki-swift-sport-2022',
    brand: 'Suzuki',
    model: 'Swift Sport Boosterjet 2022',
    year: 2022,
    plate: 'SZK-522',
    category: 'DEPORTIVO',
    description: 'Hot-hatch deportivo ultraligero y emocionante en Amarillo Campeón. Motor 1.4L Turbo Boosterjet con relación peso-potencia excepcional, rines de 17 pulgadas bitono, doble salida de escape cromada y asientos tipo cubo deportivos.',
    pricePerDay: 70,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Motor 1.4L Turbo Boosterjet de Respuesta Inmediata',
      'Doble Salida de Escape Deportivo Cromado',
      'Asientos Semibucket Deportivos con Costuras Rojas Sport',
      'Difusor Trasero y Faldones en Acabado Tipo Fibra de Carbono',
      'Pantalla Táctil con Apple CarPlay y Android Auto',
      'Control Electrónico de Estabilidad y 6 Airbags'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/suzuki-swift-sport-2022.jpg',
    specs: {
      acceleration0to100: '7.8 s',
      horsepower: 140,
      topSpeed: 210,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/suzuki-swift-sport-2022.jpg',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1541348263662-e0c8666524e0?auto=format&fit=crop&w=1200&q=85'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-mercedes-g63-amg',
    slug: 'mercedes-benz-clase-g-63-amg-2024',
    brand: 'Mercedes-Benz',
    model: 'Clase G 63 AMG Biturbo',
    year: 2024,
    plate: 'GMB-630',
    category: 'SUV_LUJO',
    description: 'El icono definitivo del todoterreno de ultralujo en color Negro Obsidiana. Motor V8 Biturbo artesanal con 585 HP, tres bloqueos mecánicos de diferencial al 100%, escape lateral deportivo y presencia imponente e inconfundible.',
    pricePerDay: 850,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Motor V8 4.0L Biturbo AMG con 585 Caballos de Fuerza',
      'Tres Bloqueos Mecánicos de Diferencial 100%',
      'Escape Deportivo Lateral AMG con Válvulas Activas',
      'Pantalla Widescreen Cockpit Dual con Sistema MBUX',
      'Sonido Envolvente Burmester 3D Surround de 15 Altavoces',
      'Iluminación Ambiental LED de 64 Colores y Cuero Nappa Exclusivo'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/mercedes-amg-g63.jpg',
    specs: {
      acceleration0to100: '4.5 s',
      horsepower: 585,
      topSpeed: 240,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/mercedes-amg-g63.jpg',
        'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80'
      ],
      interiorImages: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      detailImages: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'veh-aston-martin-dbx',
    slug: 'aston-martin-dbx-707-v8-2023',
    brand: 'Aston Martin',
    model: 'DBX 707 V8 Biturbo',
    year: 2023,
    plate: 'DBX-077',
    category: 'SUV_LUJO',
    description: 'La supercamioneta británica de altas prestaciones en acabado Plata Satinado. Potencia brutal de 707 HP, tracción integral activa, suspensión neumática adaptativa de triple cámara y lujo artesanal para los gustos más exigentes.',
    pricePerDay: 750,
    currency: 'USD',
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    features: [
      'Motor V8 Biturbo de 707 HP de Rendimiento Extremo',
      'Frenos Carbono-Cerámicos de Competición de 420mm',
      'Interior Artesanal en Piel de Puente con Alcantara y Fibra de Carbono',
      'Escape Deportivo Cuádruple con Selector de Sonido',
      'Techo Panorámico Completo con Cortina Eléctrica',
      'Tracción Total Electrónica con Diferencial Trasero e-Diff'
    ],
    status: 'AVAILABLE',
    mainImage: '/vehicles/aston-martin-dbx.jpg',
    specs: {
      acceleration0to100: '3.3 s',
      horsepower: 707,
      topSpeed: 310,
      doors: 5
    },
    gallery: {
      exteriorImages: [
        '/vehicles/aston-martin-dbx.jpg',
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
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  }
];
