import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Vehicle,
  VehicleCategory,
  VehicleStatus,
  TransmissionType,
  FuelType,
} from '../../types/vehicle';
import { uploadVehiclePhoto, uploadVehicleVideo, UploadResult } from '../../services/storageService';
import { generateVehicleSlug } from '../../services/vehicleService';
import {
  X,
  Camera,
  Video,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Zap,
  Gauge,
  Loader2,
  Sparkles,
  Star,
  Eye,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Car,
  Copy,
} from 'lucide-react';

interface AdminVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit: Vehicle | null;
  onSave: (vehicleData: Partial<Vehicle>) => Promise<void> | void;
}

// Preset de comodidades VIP
const LUXURY_AMENITIES_PRESETS = [
  'Audio Burmester 3D High-End',
  'Frenos Carbono-Cerámicos',
  'Escape Deportivo Activo',
  'Interior Cuero Nappa & Alcantara',
  'Cámara 360° Surround View',
  'Suspensión Neumática Adaptativa',
  'Apple CarPlay & Android Auto Inalámbrico',
  'Head-Up Display Holográfico',
  'Paquete Aerodinámico Fibra de Carbono',
  'Asientos Climatizados con Masaje',
  'Modo Track / Launch Control',
  'Faros Láser Matrix LED',
];

// Banco de Plantillas Oficiales de Superdeportivos y Flota VIP
interface VehiclePreset {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  category: VehicleCategory;
  pricePerDay: number;
  horsepower: number;
  acceleration: string;
  topSpeed: number;
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  doors: number;
  features: string[];
  description: string;
  mainImage: string;
  galleryImages: string[];
  videoUrl?: string;
}

// Catálogo Oficial de Fotografías en Estudio Turntable 360°
export interface StudioShowroomPhoto {
  id: string;
  name: string;
  brand: string;
  url: string;
  type: string;
}

export const OFFICIAL_STUDIO_TURNTABLE_PHOTOS: StudioShowroomPhoto[] = [
  { id: 'toyota-4runner', name: 'Toyota 4Runner Blanca (Blindada)', brand: 'Toyota', url: '/vehicles/toyota-4runner-blanca-blindada.jpg', type: 'SUV Lujo' },
  { id: 'toyota-prado', name: 'Toyota Prado TXL Negra', brand: 'Toyota', url: '/vehicles/toyota-prado-txl-negra.jpg', type: 'SUV Lujo' },
  { id: 'toyota-fortuner', name: 'Toyota Fortuner SW4 Gris', brand: 'Toyota', url: '/vehicles/toyota-fortuner-sw4-2023.jpg', type: 'SUV Lujo' },
  { id: 'kia-sportage-blanca', name: 'Kia Sportage Zenith Blanca', brand: 'Kia', url: '/vehicles/kia-sportage-blanca-2022.jpg', type: 'SUV Lujo' },
  { id: 'kia-sportage-gris', name: 'Kia Sportage GT-Line Gris', brand: 'Kia', url: '/vehicles/kia-sportage-gris-2022.jpg', type: 'SUV Lujo' },
  { id: 'mazda-3', name: 'Mazda 3 Grand Touring Blanco', brand: 'Mazda', url: '/vehicles/mazda-3-blanco-2018.jpg', type: 'Sedán' },
  { id: 'suzuki-swift', name: 'Suzuki Swift Sport Amarillo', brand: 'Suzuki', url: '/vehicles/suzuki-swift-sport-2022.jpg', type: 'Deportivo' },
  { id: 'mercedes-g63', name: 'Mercedes-Benz G63 AMG Biturbo', brand: 'Mercedes-Benz', url: '/vehicles/mercedes-amg-g63.jpg', type: 'SUV Lujo' },
  { id: 'aston-martin-dbx', name: 'Aston Martin DBX 707 Biturbo', brand: 'Aston Martin', url: '/vehicles/aston-martin-dbx.jpg', type: 'SUV Lujo' },
  { id: 'porsche-gt3', name: 'Porsche 911 GT3 RS (992)', brand: 'Porsche', url: '/vehicles/porsche-gt3-rs.jpg', type: 'Deportivo' },
  { id: 'ferrari-f8', name: 'Ferrari F8 Tributo V8', brand: 'Ferrari', url: '/vehicles/ferrari-f8.jpg', type: 'Exótico' },
  { id: 'lamborghini-urus', name: 'Lamborghini Urus Performante', brand: 'Lamborghini', url: '/vehicles/lamborghini-urus.jpg', type: 'SUV Lujo' },
  { id: 'bmw-m4', name: 'BMW M4 Competition Coupé', brand: 'BMW', url: '/vehicles/bmw-m4.jpg', type: 'Deportivo' },
  { id: 'rolls-royce-ghost', name: 'Rolls-Royce Ghost Extended', brand: 'Rolls-Royce', url: '/vehicles/rolls-royce-ghost.jpg', type: 'Sedán VIP' },
  { id: 'mclaren-720s', name: 'McLaren 720S Spider Performance', brand: 'McLaren', url: '/vehicles/mclaren-720s.jpg', type: 'Convertible' },
];

const LUXURY_PRESETS: VehiclePreset[] = [
  {
    id: 'toyota-4runner-blindada',
    name: 'Toyota 4Runner Blindada Nivel 3+',
    brand: 'Toyota',
    model: '4Runner Blindada Nivel 3+',
    year: 2022,
    plate: 'RUN-422',
    category: 'SUV_LUJO',
    pricePerDay: 260,
    horsepower: 270,
    acceleration: '8.4s',
    topSpeed: 190,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 7,
    doors: 5,
    features: [
      'Blindaje Balístico Nivel 3+ Certificado',
      'Cristales Blindados con Traslúcidos de Alta Resistencia',
      'Neumáticos con Inserciones Run-Flat Antipinchazos',
      'Sirena e Intercomunicador de Seguridad Bidireccional',
      'Motor V6 4.0L de Alto Torque',
      'Suspensión Deportiva Reforzada para Peso Adicional',
    ],
    description:
      'Seguridad ejecutiva de máxima categoría en color Blanco Perla. Blindaje balístico integral Nivel 3+ certificado con vidrios multicapa de 21mm, protección contra armas cortas y subametralladoras, rines con sistema Run-Flat y suspensión reforzada.',
    mainImage: '/vehicles/toyota-4runner-blanca-blindada.jpg',
    galleryImages: [
      '/vehicles/toyota-4runner-blanca-blindada.jpg',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'toyota-prado-txl',
    name: 'Toyota Prado TXL 4x4 2022',
    brand: 'Toyota',
    model: 'Prado TXL 4x4 2022',
    year: 2022,
    plate: 'TXL-022',
    category: 'SUV_LUJO',
    pricePerDay: 180,
    horsepower: 204,
    acceleration: '9.8s',
    topSpeed: 185,
    transmission: 'AUTOMATICA',
    fuel: 'DIESEL',
    seats: 7,
    doors: 5,
    features: [
      'Tracción 4WD Permanente con Selector Multiterreno',
      'Interior en Cuero Premium con Calefacción y Ventilación',
      'Techo Corredizo Eléctrico (Sunroof)',
      'Sistema Touch con Apple CarPlay y Android Auto',
      'Nevera en Consola Central (Cool Box)',
      'Cámara 360° con Sensores de Proximidad 8 Zonas',
    ],
    description:
      'La camioneta insignia ejecutiva en Colombia. Máximo estatus, comodidad superior y capacidad 4x4 total. Acabados en cuero premium, techo corredizo, climatizador tri-zona y serenidad absoluta para traslados ejecutivos y viajes VIP.',
    mainImage: '/vehicles/toyota-prado-txl-negra.jpg',
    galleryImages: [
      '/vehicles/toyota-prado-txl-negra.jpg',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'toyota-fortuner-sw4',
    name: 'Toyota Fortuner SW4 Diamond 4x4',
    brand: 'Toyota',
    model: 'Fortuner SW4 Diamond 4x4',
    year: 2023,
    plate: 'FTN-723',
    category: 'SUV_LUJO',
    pricePerDay: 160,
    horsepower: 204,
    acceleration: '10.2s',
    topSpeed: 180,
    transmission: 'AUTOMATICA',
    fuel: 'DIESEL',
    seats: 7,
    doors: 5,
    features: [
      'Tracción 4x4 con Bajo y Bloqueo de Diferencial Trasero',
      'Capacidad para 7 Pasajeros con Tercera Fila Plegable',
      'Cojinería en Cuero Bitono Diamond con Costuras Especiales',
      'Portón Trasero con Apertura y Cierre Eléctrico',
      'Sistema de Audio JBL Premium con Subwoofer',
      'Control de Descenso en Pendientes (DAC)',
    ],
    description:
      'La camioneta todoterreno familiar por excelencia en Colombia. Robustez insuperable, confort de 7 plazas en color Gris Plata, tracción 4x4 con bajo y bloqueo de diferencial, ideal para viajes por cualquier topografía nacional.',
    mainImage: '/vehicles/toyota-fortuner-sw4-2023.jpg',
    galleryImages: [
      '/vehicles/toyota-fortuner-sw4-2023.jpg',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'kia-sportage-zenith',
    name: 'Kia Sportage Zenith 2022 (Blanca)',
    brand: 'Kia',
    model: 'Sportage Zenith 2022',
    year: 2022,
    plate: 'SPT-822',
    category: 'SUV_LUJO',
    pricePerDay: 95,
    horsepower: 187,
    acceleration: '8.9s',
    topSpeed: 200,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 5,
    features: [
      'Acabado Bitono Blanco Perla con Techo Negro Gloss',
      'Rines de Lujo Bicolor de 19 Pulgadas',
      'Asientos en Cuero con Ajuste Eléctrico y Lumbar',
      'Apertura Inteligente de Baúl Manos Libres',
      'Control de Crucero Adaptativo con Freno Autónomo',
      'Cargador Inalámbrico para Smartphones',
    ],
    description:
      'La SUV preferida en color Blanco Perla con techo negro bitono. Diseño vanguardista, asientos ergonómicos, gran confort de marcha para viajes largos y excelente consumo de combustible.',
    mainImage: '/vehicles/kia-sportage-blanca-2022.jpg',
    galleryImages: [
      '/vehicles/kia-sportage-blanca-2022.jpg',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'kia-sportage-gtline',
    name: 'Kia Sportage GT-Line 2022 (Gris)',
    brand: 'Kia',
    model: 'Sportage GT-Line 2022',
    year: 2022,
    plate: 'KSP-222',
    category: 'SUV_LUJO',
    pricePerDay: 95,
    horsepower: 187,
    acceleration: '8.9s',
    topSpeed: 200,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 5,
    features: [
      'Pantalla Panorámica Curva Dual de 12.3 Pulgadas',
      'Faros Delanteros Full LED con Luces Boomerang',
      'Techo Panorámico Corredizo de Cristal',
      'Apple CarPlay y Android Auto Inalámbrico',
      'Cámara de Reversa HD con Guías Dinámicas',
      'Climatizador Automático Dual Bizona',
    ],
    description:
      'SUV moderna y elegante en tono Gris Titanio. Gran economía de combustible, excelente espacio interior para equipaje y familia, pantalla panorámica curva, asistentes avanzados de conducción y suavidad de marcha inigualable.',
    mainImage: '/vehicles/kia-sportage-gris-2022.jpg',
    galleryImages: [
      '/vehicles/kia-sportage-gris-2022.jpg',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'mazda-3-grand-touring',
    name: 'Mazda 3 Grand Touring 2018',
    brand: 'Mazda',
    model: '3 Grand Touring 2018',
    year: 2018,
    plate: 'MZD-318',
    category: 'SEDAN_EJECUTIVO',
    pricePerDay: 65,
    horsepower: 153,
    acceleration: '8.2s',
    topSpeed: 210,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 4,
    features: [
      'Motor 2.0L SkyActiv-G de Alto Rendimiento',
      'Sistema de Audio Premium Bose de 9 Altavoces',
      'Pantalla Activa de Conducción Head-Up Display',
      'Sunroof Eléctrico de Cristal',
      'Asientos en Cuero Genuino con Paletas al Volante',
      'Monitoreo de Punto Ciego y Alerta de Tráfico Cruzado',
    ],
    description:
      'El sedán compacto más elegante y cotizado en Blanco Nieve. Manejo ágil y dinámico con tecnología SkyActiv-G, interior refinado con Head-Up Display, sistema de audio premium Bose y líneas esculpidas Kodo.',
    mainImage: '/vehicles/mazda-3-blanco-2018.jpg',
    galleryImages: [
      '/vehicles/mazda-3-blanco-2018.jpg',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'suzuki-swift-sport',
    name: 'Suzuki Swift Sport 2022',
    brand: 'Suzuki',
    model: 'Swift Sport Boosterjet 2022',
    year: 2022,
    plate: 'SZK-522',
    category: 'DEPORTIVO',
    pricePerDay: 70,
    horsepower: 140,
    acceleration: '7.8s',
    topSpeed: 210,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 5,
    features: [
      'Motor 1.4L Turbo Boosterjet de Respuesta Inmediata',
      'Doble Salida de Escape Deportivo Cromado',
      'Asientos Semibucket Deportivos con Costuras Rojas Sport',
      'Difusor Trasero en Acabado Tipo Fibra de Carbono',
      'Pantalla Táctil con Apple CarPlay y Android Auto',
    ],
    description:
      'Hot-hatch deportivo ultraligero y emocionante en Amarillo Campeón. Motor 1.4L Turbo Boosterjet con relación peso-potencia excepcional, rines de 17 pulgadas bitono y doble salida de escape cromada.',
    mainImage: '/vehicles/suzuki-swift-sport-2022.jpg',
    galleryImages: [
      '/vehicles/suzuki-swift-sport-2022.jpg',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'mercedes-g63-amg',
    name: 'Mercedes-Benz Clase G 63 AMG',
    brand: 'Mercedes-Benz',
    model: 'Clase G 63 AMG Biturbo',
    year: 2024,
    plate: 'GMB-630',
    category: 'SUV_LUJO',
    pricePerDay: 850,
    horsepower: 585,
    acceleration: '4.5s',
    topSpeed: 240,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 5,
    features: [
      'Motor V8 4.0L Biturbo AMG con 585 Caballos de Fuerza',
      'Tres Bloqueos Mecánicos de Diferencial 100%',
      'Escape Deportivo Lateral AMG con Válvulas Activas',
      'Pantalla Widescreen Cockpit Dual con Sistema MBUX',
      'Sonido Envolvente Burmester 3D Surround de 15 Altavoces',
    ],
    description:
      'El icono definitivo del todoterreno de ultralujo en color Negro Obsidiana. Motor V8 Biturbo artesanal con 585 HP, tres bloqueos mecánicos de diferencial al 100%, escape lateral deportivo y presencia imponente.',
    mainImage: '/vehicles/mercedes-amg-g63.jpg',
    galleryImages: [
      '/vehicles/mercedes-amg-g63.jpg',
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'aston-martin-dbx',
    name: 'Aston Martin DBX 707 V8 Biturbo',
    brand: 'Aston Martin',
    model: 'DBX 707 V8 Biturbo',
    year: 2023,
    plate: 'DBX-077',
    category: 'SUV_LUJO',
    pricePerDay: 750,
    horsepower: 707,
    acceleration: '3.3s',
    topSpeed: 310,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 5,
    features: [
      'Motor V8 Biturbo de 707 HP de Rendimiento Extremo',
      'Frenos Carbono-Cerámicos de Competición de 420mm',
      'Interior Artesanal en Piel de Puente con Alcantara',
      'Escape Deportivo Cuádruple con Selector de Sonido',
      'Techo Panorámico Completo con Cortina Eléctrica',
    ],
    description:
      'La supercamioneta británica de altas prestaciones en acabado Plata Satinado. Potencia brutal de 707 HP, tracción integral activa, suspensión neumática adaptativa de triple cámara y lujo artesanal.',
    mainImage: '/vehicles/aston-martin-dbx.jpg',
    galleryImages: [
      '/vehicles/aston-martin-dbx.jpg',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'porsche-gt3-rs',
    name: 'Porsche 911 GT3 RS (992)',
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    plate: 'GT3-911',
    category: 'DEPORTIVO',
    pricePerDay: 1850,
    horsepower: 525,
    acceleration: '3.2s',
    topSpeed: 296,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    doors: 2,
    features: [
      'Paquete Weissach Fibra de Carbono',
      'Frenos Carbono-Cerámicos (PCCB)',
      'Escape Deportivo Activo Titanio',
      'Interior Cuero Nappa & Alcantara',
      'Modo Track / Launch Control',
      'Audio Burmester 3D High-End',
    ],
    description:
      'Pura ingeniería de circuito homologada para la calle. Motor bóxer atmosférico de 4.0 litros que gira hasta las 9.000 rpm, aerodinámica activa con DRS y precisión quirúrgica para una experiencia de conducción inolvidable.',
    mainImage: '/vehicles/porsche-gt3-rs.jpg',
    galleryImages: [
      '/vehicles/porsche-gt3-rs.jpg',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'ferrari-f8',
    name: 'Ferrari F8 Tributo V8',
    brand: 'Ferrari',
    model: 'F8 Tributo',
    year: 2024,
    plate: 'F8-720',
    category: 'EXOTICO',
    pricePerDay: 2400,
    horsepower: 720,
    acceleration: '2.9s',
    topSpeed: 340,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    doors: 2,
    features: [
      'Motor V8 Biturbo Galardonado',
      'Frenos Carbono-Cerámicos Brembo',
      'Manettino con Modo Race',
      'Interior Cuero Rosso & Alcantara',
      'Escape Deportivo Activo',
      'Cámara 360° Surround View',
    ],
    description:
      'Homenaje a la excelencia del motor V8 de Maranello. Una sinfonía acústica inconfundible con 720 CV de potencia pura, aceleración fulgurante de 0 a 100 en 2.9 segundos y el magnetismo del Cavallino Rampante.',
    mainImage: '/vehicles/ferrari-f8.jpg',
    galleryImages: [
      '/vehicles/ferrari-f8.jpg',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'lambo-urus',
    name: 'Lamborghini Urus Performante',
    brand: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    plate: 'URU-666',
    category: 'SUV_LUJO',
    pricePerDay: 1950,
    horsepower: 666,
    acceleration: '3.3s',
    topSpeed: 306,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 4,
    features: [
      'Modo Rally Exclusivo Performante',
      'Escape Akrapovič de Titanio',
      'Frenos Carbocerámicos Gigantes 440mm',
      'Tracción Integral Permanente con Diferencial Torsen',
      'Interior Alcantara con Costuras Giallo',
    ],
    description:
      'El primer Super Sport Utility Vehicle del mundo en su versión más radical. Alma de superdeportivo con la versatilidad de un SUV de lujo, rugido intimidante y presencia imponente.',
    mainImage: '/vehicles/lamborghini-urus.jpg',
    galleryImages: [
      '/vehicles/lamborghini-urus.jpg',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'bmw-m4',
    name: 'BMW M4 Competition Coupé',
    brand: 'BMW',
    model: 'M4 Competition Coupé',
    year: 2024,
    plate: 'BMW-004',
    category: 'DEPORTIVO',
    pricePerDay: 600,
    horsepower: 510,
    acceleration: '3.5s',
    topSpeed: 290,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 4,
    doors: 2,
    features: [
      'Motor M TwinPower Turbo 6 cilindros en línea',
      'Tracción Integral M xDrive',
      'Techo en Plástico Reforzado con Fibra de Carbono (CFRP)',
      'Asientos Deportivos M en Cuero Merino',
    ],
    description:
      'Precisión alemana y dinamismo de pista. Motor biturbo de 510 HP con aceleración implacable y tecnología M xDrive.',
    mainImage: '/vehicles/bmw-m4.jpg',
    galleryImages: [
      '/vehicles/bmw-m4.jpg',
    ],
  },
  {
    id: 'rolls-ghost',
    name: 'Rolls-Royce Ghost Extended V12',
    brand: 'Rolls-Royce',
    model: 'Ghost Extended',
    year: 2024,
    plate: 'RRG-001',
    category: 'SEDAN_EJECUTIVO',
    pricePerDay: 2800,
    horsepower: 571,
    acceleration: '4.8s',
    topSpeed: 250,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 5,
    doors: 4,
    features: [
      'Techo Starlight Headliner Iluminado',
      'Puertas Eléctricas Suaves con Cierre Automático',
      'Nevera de Champán Refrigerada Integrada',
      'Suspensión Planar Magic Carpet Ride',
    ],
    description:
      'La máxima expresión del lujo sereno y la distinción británica. Suavidad inigualable gracias al motor V12 Twin-Turbo de 6.75 litros.',
    mainImage: '/vehicles/rolls-royce-ghost.jpg',
    galleryImages: [
      '/vehicles/rolls-royce-ghost.jpg',
    ],
  },
  {
    id: 'mclaren-720s',
    name: 'McLaren 720S Spider Performance',
    brand: 'McLaren',
    model: '720S Spider',
    year: 2024,
    plate: 'MCL-720',
    category: 'CONVERTIBLE',
    pricePerDay: 2200,
    horsepower: 720,
    acceleration: '2.9s',
    topSpeed: 341,
    transmission: 'AUTOMATICA',
    fuel: 'GASOLINA',
    seats: 2,
    doors: 2,
    features: [
      'Chasis Monocasco de Carbono Monocage II-S',
      'Techo Rígido Retráctil Electrocrómico',
      'Puertas Diédricas de Apertura Vertical',
    ],
    description:
      'Aerodinámica inspirada en la Fórmula 1 y visión panorámica a cielo abierto. Estructura de carbono ultra-ligera y motor V8 biturbo.',
    mainImage: '/vehicles/mclaren-720s.jpg',
    galleryImages: [
      '/vehicles/mclaren-720s.jpg',
    ],
  },
];

// Banco de Fotografías de Stock y Estudio para atajos rápidos
const STOCK_PHOTOS = [
  { label: 'Toyota 4Runner Blanca', url: '/vehicles/toyota-4runner-blanca-blindada.jpg' },
  { label: 'Toyota Prado TXL Negra', url: '/vehicles/toyota-prado-txl-negra.jpg' },
  { label: 'Toyota Fortuner SW4', url: '/vehicles/toyota-fortuner-sw4-2023.jpg' },
  { label: 'Kia Sportage Blanca', url: '/vehicles/kia-sportage-blanca-2022.jpg' },
  { label: 'Kia Sportage Gris', url: '/vehicles/kia-sportage-gris-2022.jpg' },
  { label: 'Mazda 3 Blanco', url: '/vehicles/mazda-3-blanco-2018.jpg' },
  { label: 'Suzuki Swift Sport', url: '/vehicles/suzuki-swift-sport-2022.jpg' },
  { label: 'Mercedes-AMG G63', url: '/vehicles/mercedes-amg-g63.jpg' },
  { label: 'Aston Martin DBX 707', url: '/vehicles/aston-martin-dbx.jpg' },
  { label: 'Porsche 911 GT3 RS', url: '/vehicles/porsche-gt3-rs.jpg' },
  { label: 'Ferrari F8 Frontal', url: '/vehicles/ferrari-f8.jpg' },
  { label: 'Lamborghini Urus', url: '/vehicles/lamborghini-urus.jpg' },
  { label: 'BMW M4 Competition', url: '/vehicles/bmw-m4.jpg' },
  { label: 'Rolls-Royce Ghost', url: '/vehicles/rolls-royce-ghost.jpg' },
  { label: 'McLaren 720S', url: '/vehicles/mclaren-720s.jpg' },
  { label: 'Cockpit & Volante VIP', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Rines & Frenos Cerámicos', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=85' },
];

export const AdminVehicleModal: React.FC<AdminVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleToEdit,
  onSave,
}) => {
  const isEditMode = Boolean(vehicleToEdit);

  // Pestañas organizadas
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'specs'>('general');
  // Vista previa móvil (toggle entre formulario y preview en pantallas pequeñas)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [plate, setPlate] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('DEPORTIVO');
  const [status, setStatus] = useState<VehicleStatus>('AVAILABLE');
  const [pricePerDay, setPricePerDay] = useState<number>(1500);
  const [transmission, setTransmission] = useState<TransmissionType>('AUTOMATICA');
  const [fuel, setFuel] = useState<FuelType>('GASOLINA');
  const [seats, setSeats] = useState<number>(2);
  const [doors, setDoors] = useState<number>(2);
  const [description, setDescription] = useState('');

  // Specs
  const [horsepower, setHorsepower] = useState<number>(650);
  const [acceleration, setAcceleration] = useState('2.9s');
  const [topSpeed, setTopSpeed] = useState<number>(330);

  // Features
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  // Media (Reglas 7, 8 y 9)
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Zoom / Lightbox modal interno de previsualización de foto
  const [zoomImage, setZoomImage] = useState<{ url: string; label: string } | null>(null);

  // Upload status
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [presetSuccessToast, setPresetSuccessToast] = useState<string | null>(null);

  // Inicializar o resetear formulario
  useEffect(() => {
    if (vehicleToEdit) {
      setBrand(vehicleToEdit.brand);
      setModel(vehicleToEdit.model);
      setYear(vehicleToEdit.year);
      setPlate(vehicleToEdit.plate);
      setCategory(vehicleToEdit.category);
      setStatus(vehicleToEdit.status);
      setPricePerDay(vehicleToEdit.pricePerDay);
      setTransmission(vehicleToEdit.transmission);
      setFuel(vehicleToEdit.fuel);
      setSeats(vehicleToEdit.seats);
      setDoors(vehicleToEdit.specs?.doors || 2);
      setDescription(vehicleToEdit.description || '');
      setHorsepower(vehicleToEdit.specs?.horsepower || 500);
      setAcceleration(vehicleToEdit.specs?.acceleration0to100 || '3.2s');
      setTopSpeed(vehicleToEdit.specs?.topSpeed || 300);
      setFeatures(vehicleToEdit.features || []);
      setMainImage(vehicleToEdit.mainImage || '');
      setVideoUrl(vehicleToEdit.videoUrl || '');

      // Recopilar galería existente (máx 12)
      const allGallery: string[] = [];
      if (vehicleToEdit.gallery) {
        allGallery.push(...(vehicleToEdit.gallery.exteriorImages || []));
        allGallery.push(...(vehicleToEdit.gallery.interiorImages || []));
        allGallery.push(...(vehicleToEdit.gallery.detailImages || []));
      }
      setGalleryImages(allGallery.slice(0, 12));
    } else {
      // Valores iniciales realistas con propuesta de estudio Showroom pre-configurada
      setBrand('');
      setModel('');
      setYear(new Date().getFullYear());
      setPlate('');
      setCategory('SUV_LUJO');
      setStatus('AVAILABLE');
      setPricePerDay(200);
      setTransmission('AUTOMATICA');
      setFuel('GASOLINA');
      setSeats(5);
      setDoors(5);
      setDescription('');
      setHorsepower(240);
      setAcceleration('8.5s');
      setTopSpeed(200);
      setFeatures(['Tracción 4x4 / AWD', 'Cámara 360° Surround View', 'Interior Cuero Premium', 'Apple CarPlay & Android Auto Inalámbrico']);
      setMainImage('/vehicles/toyota-4runner-blanca-blindada.jpg');
      setGalleryImages([
        '/vehicles/toyota-4runner-blanca-blindada.jpg',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
      ]);
      setVideoUrl('');
    }
    setErrorMessage(null);
    setActiveTab('general');
    setMobilePreviewOpen(false);
  }, [vehicleToEdit, isOpen]);

  // Bloquear scroll de la página de fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cargar plantilla predefinida en 1 clic
  const handleApplyPreset = (preset: VehiclePreset) => {
    setBrand(preset.brand);
    setModel(preset.model);
    setYear(preset.year);
    setPlate(preset.plate);
    setCategory(preset.category);
    setPricePerDay(preset.pricePerDay);
    setHorsepower(preset.horsepower);
    setAcceleration(preset.acceleration);
    setTopSpeed(preset.topSpeed);
    setTransmission(preset.transmission);
    setFuel(preset.fuel);
    setSeats(preset.seats);
    setDoors(preset.doors);
    setFeatures(preset.features);
    setDescription(preset.description);
    setMainImage(preset.mainImage);
    setGalleryImages(preset.galleryImages);
    if (preset.videoUrl) setVideoUrl(preset.videoUrl);

    setPresetSuccessToast(`✨ Plantilla cargada: ${preset.name}`);
    setTimeout(() => setPresetSuccessToast(null), 4000);
  };

  // Generador de placa aleatoria VIP
  const handleGenerateRandomPlate = () => {
    const letters = ['LUX', 'VIP', 'EXO', 'GT3', 'F8', 'RRG', 'MCL'];
    const randomPrefix = letters[Math.floor(Math.random() * letters.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setPlate(`${randomPrefix}-${randomNum}`);
  };

  if (!isOpen) return null;

  // Manejador de subida de archivo para imagen principal
  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convertir a DataURL base64 persistente para garantizar que la imagen nunca se pierda
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setMainImage((current) => (current.startsWith('blob:') || !current ? base64 : current));
      }
    };
    reader.readAsDataURL(file);

    // Vista previa instantánea
    const localUrl = URL.createObjectURL(file);
    setMainImage(localUrl);

    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const tempId = vehicleToEdit?.id || `veh-${brand || 'custom'}-${model || 'auto'}`.toLowerCase().replace(/\s+/g, '-');
      const result = await uploadVehiclePhoto(tempId, file, 0);
      setMainImage(result.url);
    } catch (err: any) {
      console.warn('Fallo subida a storage, el archivo se conserva como base64 persistente:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Multi-subida de fotografías para la galería
  const handleMultiUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 12 - galleryImages.length;
    if (remainingSlots <= 0) {
      setErrorMessage('Límite alcanzado: Ya tienes 12 fotografías en la galería (Regla 8).');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Previews instantáneos locales
    const localPreviews = filesToUpload.map((f) => URL.createObjectURL(f));
    setGalleryImages((prev) => [...prev, ...localPreviews].slice(0, 12));

    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const tempId = vehicleToEdit?.id || `veh-${brand || 'flota'}-${model || 'unit'}`.toLowerCase().replace(/\s+/g, '-');
      const uploadPromises = filesToUpload.map((file, idx) =>
        uploadVehiclePhoto(tempId, file, galleryImages.length + idx)
      );
      const results = await Promise.allSettled(uploadPromises);
      const successfulUrls = results
        .filter((r): r is PromiseFulfilledResult<UploadResult> => r.status === 'fulfilled')
        .map((r) => r.value.url);


      if (successfulUrls.length > 0) {
        // Reemplazar los blobs temporales con las URLs oficiales
        setGalleryImages((prev) => {
          const nonBlobs = prev.filter((u) => !u.startsWith('blob:'));
          return [...nonBlobs, ...successfulUrls].slice(0, 12);
        });
      }
    } catch (err: any) {
      console.warn('Advertencia en subida de galería:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Añadir por URL directa
  const handleAddPhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    if (galleryImages.length >= 12) {
      setErrorMessage('Límite alcanzado: Máximo 12 fotografías por vehículo según la Regla 8.');
      return;
    }

    setGalleryImages([...galleryImages, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
    setErrorMessage(null);
  };

  // Asignar cualquier foto de la galería como Portada Principal
  const handleSetAsMain = (index: number) => {
    const selected = galleryImages[index];
    const currentMain = mainImage;
    setMainImage(selected);
    const newGallery = [...galleryImages];
    if (currentMain) {
      newGallery[index] = currentMain;
    } else {
      newGallery.splice(index, 1);
    }
    setGalleryImages(newGallery);
  };

  // Mover foto de posición (Reordenar secuencia)
  const handleMovePhoto = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const newGallery = [...galleryImages];
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIndex];
    newGallery[targetIndex] = temp;
    setGalleryImages(newGallery);
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Manejador de subida de video
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localVideo = URL.createObjectURL(file);
    setVideoUrl(localVideo);

    setIsUploadingVideo(true);
    setErrorMessage(null);
    try {
      const tempId = vehicleToEdit?.id || `veh-${brand || 'custom'}-${model || 'auto'}`.toLowerCase().replace(/\s+/g, '-');
      const result = await uploadVehicleVideo(tempId, file);
      setVideoUrl(result.url);
    } catch (err: any) {
      console.warn('Fallo en subida de video, manteniendo enlace local:', err);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeature.trim()) return;
    if (!features.includes(customFeature.trim())) {
      setFeatures([...features, customFeature.trim()]);
    }
    setCustomFeature('');
  };

  // Guardar formulario con validación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim() || !model.trim() || !plate.trim()) {
      setErrorMessage('Por favor completa la Marca, Modelo y Placa oficial del vehículo.');
      setActiveTab('general');
      return;
    }

    if (!mainImage.trim()) {
      setErrorMessage('Es obligatorio asignar una Imagen Principal destacada para el Showroom.');
      setActiveTab('media');
      return;
    }

    if (galleryImages.length > 12) {
      setErrorMessage('La galería no puede exceder el límite estricto de 12 fotografías (Regla 8).');
      setActiveTab('media');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Distribuir las 12 fotos en la estructura VehicleGallery según la Regla 8
    const exteriorImages = galleryImages.slice(0, 5);
    const interiorImages = galleryImages.slice(5, 9);
    const detailImages = galleryImages.slice(9, 12);

    const vehiclePayload: Partial<Vehicle> = {
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      plate: plate.trim().toUpperCase(),
      category,
      status,
      pricePerDay: Number(pricePerDay),
      currency: 'USD',
      transmission,
      fuel,
      seats: Number(seats),
      description:
        description.trim() ||
        `Exclusivo ${brand} ${model} año ${year}. Rendimiento superdeportivo, confort boutique y acabados de lujo para clientes VIP.`,
      features: features.length > 0 ? features : ['Transmisión Automática', 'Audio Premium', 'Interior de Lujo'],
      mainImage: mainImage.trim(),
      ...(videoUrl.trim() ? { videoUrl: videoUrl.trim() } : {}),
      specs: {
        horsepower: Number(horsepower),
        acceleration0to100: acceleration.trim(),
        topSpeed: Number(topSpeed),
        doors: Number(doors),
      },
      gallery: {
        exteriorImages,
        interiorImages,
        detailImages,
      },
    };

    try {
      const savePromise = Promise.resolve(onSave(vehiclePayload));
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));
      await Promise.race([savePromise, timeoutPromise]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al guardar los datos del vehículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos financieros en vivo para el simulador
  const weeklyYield = pricePerDay * 5;
  const monthlyYield = Math.round(pricePerDay * 30 * 0.7); // 70% ocupación
  const warrantyDeposit = Math.round(pricePerDay * 3);
  const calculatedSlug = generateVehicleSlug(brand || 'marca', model || 'modelo', year);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-carbon-950/90 backdrop-blur-xl overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl rounded-t-3xl sm:rounded-3xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[95vh] animate-slide-up sm:animate-fade-in"
      >
        {/* Indicador de Arrastre para Móvil */}
        <div className="w-10 h-1 rounded-full bg-carbon-600/70 mx-auto mt-2.5 sm:hidden flex-shrink-0" />
        
        {/* ======================================================== */}
        {/* CABECERA MAESTRA (ESTÁNDAR INGENIERÍA VIP)                */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:px-8 border-b border-carbon-800 bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400" />
                CENTRO DE INGENIERÍA DE FLOTA
              </span>
              <span className="text-carbon-600">•</span>
              <span className="text-xs text-silver-400 font-mono">
                {isEditMode ? `ID: ${vehicleToEdit?.id}` : 'Nueva Ficha de Superdeportivo'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
              <Car className="w-6 h-6 text-gold-400 hidden sm:block" />
              <span>{isEditMode ? `Editar ${vehicleToEdit?.brand} ${vehicleToEdit?.model}` : 'Registrar Nuevo Superdeportivo en Flota'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle de Vista Previa en Móvil */}
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 border border-gold-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Eye className="w-4 h-4" />
              <span>{mobilePreviewOpen ? 'Volver a Formulario' : 'Ver Vista Previa'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-carbon-800 text-silver-400 hover:text-white hover:bg-carbon-750 transition-colors border border-carbon-700"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BARRA DE ACCIONES RÁPIDAS: PLANTILLAS PRE-CONFIGURADAS   */}
        {/* ======================================================== */}
        <div className="px-5 sm:px-8 py-3 bg-carbon-950/70 border-b border-carbon-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-silver-300 whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            {isEditMode ? 'Reemplazar con Plantilla Oficial:' : 'Plantillas 1-Clic:'}
          </span>
          <div className="flex items-center gap-2 flex-nowrap">
            {LUXURY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-carbon-800/90 hover:bg-gold-500/20 text-silver-300 hover:text-gold-300 border border-carbon-700 hover:border-gold-500/40 transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Banner Inteligente de Sugerencia para sincronizar a formato oficial de estudio */}
        {((brand.toUpperCase().includes('TOYOTA') && (model.includes('2022') || plate.toUpperCase() === 'FRE334' || plate.toUpperCase().includes('FRE')))) && (
          <div className="mx-5 sm:mx-8 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-gold-500/20 via-gold-400/10 to-carbon-900 border border-gold-500/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <span>Sincronizar a Formato Oficial Showroom (Toyota 4Runner Blanca)</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Estudio 360°
                  </span>
                </div>
                <div className="text-[11px] text-silver-300 mt-0.5">
                  Reemplaza la foto al aire libre por la foto oficial de estudio en plataforma giratoria y ajusta la ficha a SUV de Lujo (270 CV, $260/día).
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setBrand('Toyota');
                setModel('4Runner Blindada Nivel 3+ 2022');
                setCategory('SUV_LUJO');
                setPricePerDay(260);
                setHorsepower(270);
                setAcceleration('8.4s');
                setTopSpeed(190);
                setTransmission('AUTOMATICA');
                setFuel('GASOLINA');
                setSeats(7);
                setDoors(5);
                setMainImage('/vehicles/toyota-4runner-blanca-blindada.jpg');
                setGalleryImages([
                  '/vehicles/toyota-4runner-blanca-blindada.jpg',
                  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
                  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85',
                ]);
                setPresetSuccessToast('✨ Formato de estudio Showroom aplicado exitosamente a la Toyota 4Runner');
                setTimeout(() => setPresetSuccessToast(null), 4000);
              }}
              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95 whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aplicar Formato Oficial 1-Clic</span>
            </button>
          </div>
        )}

        {/* Toast Notifier para Presets */}
        {presetSuccessToast && (
          <div className="mx-5 sm:mx-8 mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{presetSuccessToast}</span>
          </div>
        )}

        {/* Mensaje de Error si ocurre */}
        {errorMessage && (
          <div className="mx-5 sm:mx-8 mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* CUERPO PRINCIPAL: DUAL PANE (FORMULARIO + LIVE PREVIEW)  */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* PANEL IZQUIERDO: FORMULARIO MAESTRO (7 COLUMNAS) */}
          <div
            className={`lg:col-span-7 xl:col-span-7 flex flex-col border-r border-carbon-800 bg-carbon-900/95 overflow-hidden ${
              mobilePreviewOpen ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Pestañas de Navegación del Formulario */}
            <div className="flex border-b border-carbon-800 bg-carbon-850/60 px-5 sm:px-8 gap-2 pt-3">
              {[
                {
                  id: 'general',
                  label: '1. Datos & Mecánica',
                  icon: Gauge,
                  completed: Boolean(brand && model && plate && pricePerDay),
                },
                {
                  id: 'media',
                  label: `2. Galería & Multimedia (${galleryImages.length}/12)`,
                  icon: Camera,
                  completed: Boolean(mainImage && galleryImages.length > 0),
                },
                {
                  id: 'specs',
                  label: '3. Equipamiento & Reseña',
                  icon: Zap,
                  completed: Boolean(features.length > 0),
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                      isActive
                        ? 'border-gold-500 text-gold-400 bg-carbon-900/90 rounded-t-xl shadow-sm'
                        : 'border-transparent text-silver-400 hover:text-silver-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.completed && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll del Formulario */}
            <form onSubmit={handleSubmit} id="vehicle-form" className="overflow-y-auto p-5 sm:p-8 space-y-6 flex-1">
              
              {/* ======================================================== */}
              {/* PESTAÑA 1: DATOS GENERALES Y MECÁNICA                    */}
              {/* ======================================================== */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Fila 1: Marca, Modelo, Año */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider mb-2">
                        Marca del Fabricante *
                      </label>
                      <input
                        type="text"
                        required
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ej. Porsche, Ferrari, Lamborghini"
                        className="w-full text-sm font-semibold bg-carbon-800/90 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider mb-2">
                        Modelo & Versión *
                      </label>
                      <input
                        type="text"
                        required
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Ej. 911 GT3 RS, F8 Tributo"
                        className="w-full text-sm font-semibold bg-carbon-800/90 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider mb-2">
                        Año de Matrícula *
                      </label>
                      <input
                        type="number"
                        required
                        min={2018}
                        max={2027}
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full text-sm font-mono font-semibold bg-carbon-800/90 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Placa, Categoría, Tarifa Diaria */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-silver-200 uppercase tracking-wider">
                          Placa Oficial *
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateRandomPlate}
                          className="text-[10px] text-gold-400 hover:text-gold-300 font-semibold underline"
                        >
                          Generar VIP
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        placeholder="Ej. LUX-911"
                        className="w-full text-sm font-mono font-black bg-carbon-800/90 border border-carbon-700 text-gold-400 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-all shadow-inner uppercase tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider mb-2">
                        Categoría Showroom *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                        className="w-full text-sm font-medium bg-carbon-800/90 border border-carbon-700 text-silver-100 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-all"
                      >
                        <option value="DEPORTIVO">Deportivo de Alto Rendimiento</option>
                        <option value="SUV_LUJO">SUV de Ultra-Lujo</option>
                        <option value="SEDAN_EJECUTIVO">Sedán Ejecutivo VIP</option>
                        <option value="EXOTICO">Superdeportivo Exótico</option>
                        <option value="CONVERTIBLE">Convertible Gran Turismo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider mb-2">
                        Tarifa Diaria ($USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400 font-black text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          required
                          min={300}
                          max={15000}
                          step={50}
                          value={pricePerDay}
                          onChange={(e) => setPricePerDay(Number(e.target.value))}
                          className="w-full text-sm font-mono font-black text-gold-400 bg-carbon-800/90 border border-carbon-700 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-gold-500 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slug SEO Preview (Regla 17) */}
                  <div className="p-3.5 rounded-xl bg-carbon-850 border border-carbon-800 flex items-center justify-between text-xs">
                    <span className="text-silver-400">URL pública amigable para SEO (Regla 17):</span>
                    <span className="font-mono text-gold-400 bg-carbon-900 px-2 py-1 rounded border border-carbon-750">
                      /vehicles/{calculatedSlug}
                    </span>
                  </div>

                  {/* Ficha Mecánica y Telemetría */}
                  <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Gauge className="w-4 h-4" />
                        Telemetría & Ficha Técnica de Rendimiento
                      </span>
                      <span className="text-[11px] text-silver-400">Especificaciones oficiales</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">Potencia (CV / HP)</label>
                        <input
                          type="number"
                          min={200}
                          max={1800}
                          value={horsepower}
                          onChange={(e) => setHorsepower(Number(e.target.value))}
                          className="w-full text-xs font-mono font-bold bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">0-100 km/h</label>
                        <input
                          type="text"
                          value={acceleration}
                          onChange={(e) => setAcceleration(e.target.value)}
                          placeholder="Ej. 2.9s"
                          className="w-full text-xs font-mono font-bold bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">Velocidad Punta</label>
                        <input
                          type="number"
                          min={200}
                          max={450}
                          value={topSpeed}
                          onChange={(e) => setTopSpeed(Number(e.target.value))}
                          className="w-full text-xs font-mono font-bold bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">Plazas</label>
                        <input
                          type="number"
                          min={1}
                          max={7}
                          value={seats}
                          onChange={(e) => setSeats(Number(e.target.value))}
                          className="w-full text-xs font-mono font-bold bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">Transmisión</label>
                        <select
                          value={transmission}
                          onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                          className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        >
                          <option value="AUTOMATICA">Automática Doble Embrague (PDK/DCT)</option>
                          <option value="MANUAL">Manual 6/7 Velocidades</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">Combustible</label>
                        <select
                          value={fuel}
                          onChange={(e) => setFuel(e.target.value as FuelType)}
                          className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        >
                          <option value="GASOLINA">Gasolina Premium 98 Octanos</option>
                          <option value="HIBRIDO">Híbrido Enchufable (PHEV)</option>
                          <option value="ELECTRICO">100% Eléctrico Ultra-Fast</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-silver-300 font-semibold mb-1.5">Estado Operativo</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                          className="w-full text-xs font-bold bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
                        >
                          <option value="AVAILABLE">🟢 Disponible para Renta</option>
                          <option value="RENTED">🔵 Alquilado (En uso)</option>
                          <option value="MAINTENANCE">🟠 En Mantenimiento</option>
                          <option value="INACTIVE">⚫ Inactivo (Oculto)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* PESTAÑA 2: GESTOR MULTIMEDIA PROFESIONAL (REGLAS 7, 8, 9)*/}
              {/* ======================================================== */}
              {activeTab === 'media' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Cumplimiento de Regla 8: Contador y distribución */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-carbon-850 to-carbon-800 border border-carbon-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center flex-shrink-0 border border-gold-500/30">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Galería Oficial de 12 Fotografías (Regla 8)
                        </div>
                        <div className="text-xs text-silver-400">
                          1-5 Exterior • 6-9 Habitáculo VIP • 10-12 Detalles & Mecánica
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-black border ${
                          galleryImages.length === 12
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : galleryImages.length >= 6
                            ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
                            : 'bg-carbon-800 text-silver-400 border-carbon-700'
                        }`}
                      >
                        {galleryImages.length} / 12 FOTOS
                      </span>
                    </div>
                  </div>

                  {/* 1. Fotografía Principal Protagonista (Cover Photo) */}
                  <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-750 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                        Fotografía Principal (Showroom Cover) *
                      </label>
                      {isUploadingPhoto && (
                        <span className="text-xs text-gold-400 flex items-center gap-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo a la nube...
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {mainImage ? (
                        <div className="relative group w-44 h-28 rounded-xl overflow-hidden border-2 border-gold-500/60 shadow-xl flex-shrink-0 bg-carbon-950">
                          <img
                            src={mainImage}
                            alt="Portada del vehículo"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setZoomImage({ url: mainImage, label: 'Foto Principal Showroom' })}
                            className="absolute inset-0 bg-carbon-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-1"
                          >
                            <Maximize2 className="w-4 h-4" />
                            <span>Zoom</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-44 h-28 rounded-xl bg-carbon-800 border-2 border-dashed border-carbon-700 flex flex-col items-center justify-center text-silver-500 text-xs">
                          <Camera className="w-6 h-6 mb-1 text-carbon-600" />
                          <span>Sin Portada</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2.5 w-full">
                        <input
                          type="url"
                          value={mainImage}
                          onChange={(e) => setMainImage(e.target.value)}
                          placeholder="Pega una URL (https://images.unsplash.com/...)"
                          className="w-full text-xs font-mono bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-500/20 to-gold-400/10 hover:from-gold-500/30 hover:to-gold-400/20 text-gold-300 text-xs font-bold cursor-pointer border border-gold-500/40 transition-all shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir Archivo Local (WebP/JPG)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={handleUploadMainImage}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Estudio Showroom Oficial (Plataforma Giratoria 360°) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-gold-500/40 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center font-black text-sm flex-shrink-0">
                          ✨
                        </div>
                        <div>
                          <h5 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                            Catálogo Oficial de Estudio Showroom (Plataforma Giratoria 360°)
                          </h5>
                          <p className="text-[11px] text-silver-400">
                            Haz clic en cualquier vehículo para usar su fotografía profesional de estudio con plataforma giratoria e iluminación de concesionario.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20 self-start sm:self-auto">
                        15 Modelos Oficiales
                      </span>
                    </div>

                    {/* Grid de miniaturas con selector de 1 clic */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {OFFICIAL_STUDIO_TURNTABLE_PHOTOS.map((studioCar) => {
                        const isSelected = mainImage === studioCar.url;
                        return (
                          <button
                            key={studioCar.id}
                            type="button"
                            onClick={() => {
                              setMainImage(studioCar.url);
                              if (galleryImages.length === 0 || !galleryImages.includes(studioCar.url)) {
                                setGalleryImages([studioCar.url, ...galleryImages.filter((img) => img !== studioCar.url)].slice(0, 12));
                              }
                              setPresetSuccessToast(`📸 Foto de estudio aplicada: ${studioCar.name}`);
                              setTimeout(() => setPresetSuccessToast(null), 3000);
                            }}
                            className={`relative rounded-xl overflow-hidden border text-left transition-all group flex flex-col ${
                              isSelected
                                ? 'border-gold-500 ring-2 ring-gold-500/50 shadow-lg shadow-gold-500/20'
                                : 'border-carbon-700 hover:border-gold-500/50 bg-carbon-800'
                            }`}
                          >
                            <div className="relative aspect-video bg-carbon-950 overflow-hidden">
                              <img
                                src={studioCar.url}
                                alt={studioCar.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-gold-500 text-carbon-950 p-1 rounded-md shadow font-bold text-[10px] flex items-center gap-0.5">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                              <div className="absolute bottom-1 left-1 bg-carbon-950/80 backdrop-blur-xs text-[9px] font-mono text-silver-300 px-1 rounded">
                                {studioCar.type}
                              </div>
                            </div>
                            <div className="p-2 bg-carbon-850 flex-1 flex flex-col justify-between">
                              <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                                {studioCar.name}
                              </span>
                              <span className="text-[9px] text-gold-400/80 font-mono mt-0.5">
                                {isSelected ? '✓ Portada Activa' : 'Aplicar Foto'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Guía de Fotografía de Estudio e Inteligencia Artificial (IA) */}
                    <div className="p-3.5 rounded-xl bg-carbon-950/70 border border-carbon-750 text-xs text-silver-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                          <span>¿Cómo lograr que un carro nuevo se vea igual a estos?</span>
                        </div>
                        <span className="text-[10px] font-mono text-gold-400">Guía Showroom VIP</span>
                      </div>
                      <p className="text-[11px] text-silver-400 leading-relaxed">
                        Los vehículos de la flota usan <strong>fotografía de estudio en plataforma giratoria (turntable)</strong>:
                        un pedestal circular oscuro en el piso, fondo negro difuso de concesionario sin distracciones de calle ni árboles, e iluminación cenital difusa (aros de luz).
                      </p>
                      <div className="pt-2 border-t border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[10px] text-silver-400 font-mono">
                          Fórmula de IA (Midjourney / ChatGPT / Gemini) para cualquier modelo:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const carDesc = `${brand || 'Toyota 4Runner'} ${model || '2022'}`;
                            const promptText = `Professional commercial automotive studio photography of a ${carDesc} in white color, positioned on a circular rotating dark showroom turntable platform with edge LED ring lights, modern dark luxury dealership background with subtle glass reflections, high-end studio rim lighting, 8k resolution, photorealistic, 3/4 front view`;
                            navigator.clipboard.writeText(promptText);
                            setPresetSuccessToast('📋 Prompt maestro de IA copiado al portapapeles');
                            setTimeout(() => setPresetSuccessToast(null), 3500);
                          }}
                          className="px-3 py-1.5 bg-carbon-800 hover:bg-gold-500/20 text-gold-400 border border-carbon-700 hover:border-gold-500/40 rounded-lg text-[10px] font-bold transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Prompt Maestro de IA</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Galería de hasta 12 Fotos con Slots Categorizados */}
                  <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-750 space-y-4 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-silver-200 uppercase tracking-wider block">
                          Ranuras de la Galería ({galleryImages.length}/12)
                        </span>
                        <span className="text-[11px] text-silver-400">
                          Haz clic en cualquier foto para hacerla portada (⭐), hacer zoom (🔍) o reordenar (⬅️ ➡️).
                        </span>
                      </div>

                      {/* Botón Multi-Subida de Fotos */}
                      <label
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          galleryImages.length >= 12
                            ? 'opacity-40 cursor-not-allowed bg-carbon-800 text-silver-500 border-carbon-750'
                            : 'bg-carbon-800 hover:bg-carbon-750 text-gold-400 border-gold-500/40 hover:border-gold-500'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Subir Varias Fotos a la Vez</span>
                        <input
                          type="file"
                          multiple
                          disabled={galleryImages.length >= 12}
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleMultiUploadGallery}
                        />
                      </label>
                    </div>

                    {/* Agregar por URL rápida */}
                    {galleryImages.length < 12 && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="O pega una URL de fotografía..."
                          className="flex-1 text-xs font-mono bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoUrl}
                          className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 text-xs font-bold border border-carbon-750 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    )}

                    {/* Grid Visual de Ranuras (Slot Matrix) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                      {galleryImages.map((img, idx) => {
                        let categoryLabel = 'Exterior';
                        if (idx >= 5 && idx < 9) categoryLabel = 'Cockpit';
                        if (idx >= 9) categoryLabel = 'Detalle';

                        return (
                          <div
                            key={idx}
                            className="relative aspect-video rounded-xl overflow-hidden border border-carbon-700 group bg-carbon-900 shadow-md"
                          >
                            <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            
                            {/* Badge de ranura y categoría */}
                            <div className="absolute top-1.5 left-1.5 bg-carbon-950/90 text-[10px] font-mono text-gold-400 px-1.5 py-0.5 rounded font-bold border border-carbon-800">
                              #{idx + 1} {categoryLabel}
                            </div>

                            {/* Acciones en Hover */}
                            <div className="absolute inset-0 bg-carbon-950/80 backdrop-blur-xs flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                              <button
                                type="button"
                                onClick={() => handleSetAsMain(idx)}
                                title="Hacer Portada Principal"
                                className="p-1.5 bg-gold-500 text-carbon-950 rounded-lg hover:scale-110 transition-transform font-bold"
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setZoomImage({ url: img, label: `Foto #${idx + 1} (${categoryLabel})` })}
                                title="Ver en pantalla completa"
                                className="p-1.5 bg-carbon-800 text-white rounded-lg hover:bg-carbon-700 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMovePhoto(idx, 'left')}
                                  title="Mover a la izquierda"
                                  className="p-1.5 bg-carbon-800 text-silver-300 rounded-lg hover:bg-carbon-700 transition-colors"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {idx < galleryImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMovePhoto(idx, 'right')}
                                  title="Mover a la derecha"
                                  className="p-1.5 bg-carbon-800 text-silver-300 rounded-lg hover:bg-carbon-700 transition-colors"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryPhoto(idx)}
                                title="Eliminar foto"
                                className="p-1.5 bg-rose-950 text-rose-400 rounded-lg hover:bg-rose-900 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Espacios vacíos hasta 12 para visualizar el cupo exacto */}
                      {Array.from({ length: Math.max(0, 12 - galleryImages.length) }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="aspect-video rounded-xl border border-dashed border-carbon-750 flex flex-col items-center justify-center text-carbon-500 text-[10px] p-2 text-center"
                        >
                          <Camera className="w-4 h-4 mb-1 text-carbon-600" />
                          <span>Ranura #{galleryImages.length + idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* Paleta de Fotos de Stock Rápidas */}
                    <div className="pt-2 border-t border-carbon-800">
                      <span className="text-[11px] font-bold text-silver-400 mb-2 block">
                        📸 Banco Rápido de Fotos HD (Clic para añadir a galería):
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {STOCK_PHOTOS.map((stock, i) => (
                          <button
                            key={i}
                            type="button"
                            disabled={galleryImages.length >= 12}
                            onClick={() => {
                              if (galleryImages.length < 12 && !galleryImages.includes(stock.url)) {
                                setGalleryImages([...galleryImages, stock.url]);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-[10px] font-medium text-silver-300 hover:text-gold-300 border border-carbon-750 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-40"
                          >
                            + {stock.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Video de Exterior en Loop (Reglas 7 y 9) */}
                  <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-750 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-silver-200 uppercase tracking-wider block">
                          Video Promocional en Loop Silencioso (Reglas 7 & 9)
                        </label>
                        <span className="text-[11px] text-silver-400">
                          Recomendado máx 15 segundos en formato MP4 o WebM para el showroom principal.
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                          videoUrl
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-carbon-800 text-silver-400 border-carbon-700'
                        }`}
                      >
                        {videoUrl ? '✓ Video Configurado' : '✕ Sin Video'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="flex-1 text-xs font-mono bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-gold-500"
                      />

                      <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-200 text-xs font-bold cursor-pointer border border-carbon-700 transition-colors whitespace-nowrap shadow-sm">
                        <Video className="w-4 h-4 text-gold-400" />
                        <span>{isUploadingVideo ? 'Subiendo...' : 'Subir MP4 / WebM'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={handleUploadVideo}
                        />
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* PESTAÑA 3: EQUIPAMIENTO VIP Y RESEÑA EDITORIAL           */}
              {/* ======================================================== */}
              {activeTab === 'specs' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Comodidades VIP */}
                  <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-750 space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-silver-200 uppercase tracking-wider block">
                        Equipamiento & Comodidades de Ultra-Lujo
                      </span>
                      <span className="text-xs text-gold-400 font-mono font-bold">
                        {features.length} seleccionadas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {LUXURY_AMENITIES_PRESETS.map((amenity) => {
                        const isSelected = features.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleFeature(amenity)}
                            className={`text-left p-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-gold-500/15 border-gold-500/50 text-gold-300 shadow-sm'
                                : 'bg-carbon-800/80 border-carbon-750 text-silver-400 hover:text-silver-200 hover:bg-carbon-800'
                            }`}
                          >
                            <span>{amenity}</span>
                            {isSelected && <Check className="w-4 h-4 text-gold-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Añadir característica personalizada */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={customFeature}
                        onChange={(e) => setCustomFeature(e.target.value)}
                        placeholder="Agregar equipamiento personalizado (ej. Nevera de Champán, Fibra de Carbono Forjada)..."
                        className="flex-1 text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomFeature}
                        className="px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 text-xs font-bold border border-carbon-750 shadow-sm"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>

                  {/* Reseña Editorial */}
                  <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-750 space-y-2 shadow-md">
                    <label className="block text-xs font-bold text-silver-200 uppercase tracking-wider">
                      Descripción Editorial para la Ficha Showroom VIP
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Redacta la reseña destacando la exclusividad, ingeniería, sensaciones de manejo y nivel de confort para el cliente VIP..."
                      className="w-full text-xs leading-relaxed bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl p-4 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                </div>
              )}

            </form>

            {/* Footer de Acciones del Formulario */}
            <div className="p-5 sm:px-8 border-t border-carbon-800 bg-carbon-850/80 flex items-center justify-between gap-3">
              <div className="text-xs text-silver-400 hidden sm:flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Sincronización dual en Cloud Firestore ($0 Spark) y Local Cache.</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs font-bold border border-carbon-700 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  form="vehicle-form"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 text-xs font-black shadow-xl transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Ficha...</span>
                    </>
                  ) : (
                    <span>{isEditMode ? 'Guardar Cambios' : 'Publicar Vehículo en Flota'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANEL DERECHO: VISTA PREVIA EN VIVO (SHOWROOM SIMULATOR) */}
          {/* ======================================================== */}
          <div
            className={`lg:col-span-5 xl:col-span-5 p-5 sm:p-8 bg-gradient-to-b from-carbon-950 via-carbon-900 to-carbon-950 overflow-y-auto flex flex-col justify-between space-y-6 ${
              mobilePreviewOpen ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-6">
              
              {/* Encabezado del Simulador */}
              <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-400 font-mono">
                    VISTA PREVIA EN TIEMPO REAL
                  </span>
                </div>
                <span className="text-[11px] text-silver-400 font-medium">
                  Así lo verá el cliente
                </span>
              </div>

              {/* Tarjeta Showroom de Lujo Interactiva */}
              <div className="relative rounded-3xl overflow-hidden bg-carbon-850 border border-carbon-700 hover:border-gold-500/50 shadow-2xl transition-all group">
                
                {/* Imagen Principal con Aspect Ratio de Showroom */}
                <div className="relative aspect-[16/10] overflow-hidden bg-carbon-950">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={`${brand} ${model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-silver-500">
                      <Camera className="w-10 h-10 mb-2 text-carbon-700" />
                      <span className="text-xs">Sin Fotografía Principal</span>
                    </div>
                  )}

                  {/* Degradado Showroom sobre la imagen */}
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-black/40" />

                  {/* Badges superiores */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-carbon-950/85 text-gold-400 border border-gold-500/40 backdrop-blur-md">
                      {category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                        status === 'AVAILABLE'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                          : status === 'RENTED'
                          ? 'bg-blue-950/80 text-blue-400 border-blue-500/50'
                          : 'bg-amber-950/80 text-amber-400 border-amber-500/50'
                      }`}
                    >
                      {status === 'AVAILABLE' ? '🟢 Disponible' : status === 'RENTED' ? '🔵 Alquilado' : '🟠 Mantenimiento'}
                    </span>
                  </div>

                  {/* Placa Metálica Flotante */}
                  <div className="absolute bottom-3 right-3 bg-carbon-950/90 border border-silver-400/40 rounded-md px-2.5 py-0.5 text-[11px] font-mono font-bold text-white shadow-lg">
                    {plate || 'PLACA-VIP'}
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Título y Tarifa */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-silver-400 uppercase tracking-widest font-semibold">
                        {brand || 'Marca Fabricante'}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                        {model || 'Modelo / Versión'} <span className="text-silver-400 text-lg font-normal">({year})</span>
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-silver-400 uppercase font-semibold">Tarifa VIP</div>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-gold-400 tracking-tight">
                        ${pricePerDay.toLocaleString()}
                        <span className="text-xs font-normal text-silver-400">/día</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Telemetría VIP */}
                  <div className="grid grid-cols-4 gap-2 py-3 px-3.5 rounded-2xl bg-carbon-900 border border-carbon-800 text-center">
                    <div>
                      <div className="text-[10px] text-silver-400 uppercase font-semibold">Potencia</div>
                      <div className="text-xs sm:text-sm font-black text-white font-mono">{horsepower} CV</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-silver-400 uppercase font-semibold">0-100</div>
                      <div className="text-xs sm:text-sm font-black text-gold-400 font-mono">{acceleration}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-silver-400 uppercase font-semibold">Vel. Máx</div>
                      <div className="text-xs sm:text-sm font-black text-white font-mono">{topSpeed} km/h</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-silver-400 uppercase font-semibold">Plazas</div>
                      <div className="text-xs sm:text-sm font-black text-white font-mono">{seats}</div>
                    </div>
                  </div>

                  {/* Badges de Equipamiento */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {features.slice(0, 3).map((feat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-carbon-800/80 text-silver-300 text-[10px] font-semibold border border-carbon-750"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                    {features.length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-gold-500/10 text-gold-400 text-[10px] font-bold border border-gold-500/20">
                        +{features.length - 3} más
                      </span>
                    )}
                  </div>

                  {/* Botón Simulado de Reserva Showroom */}
                  <div className="pt-2">
                    <div className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-carbon-950 text-xs font-black text-center shadow-lg uppercase tracking-wider">
                      Solicitar Renta Showroom VIP
                    </div>
                  </div>

                </div>

              </div>

              {/* Simulador Financiero Ejecutivo (Nivel 20 Años de Experiencia) */}
              <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-3">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Rendimiento Financiero Estimado
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800">
                    <div className="text-[10px] text-silver-400 uppercase font-semibold">Semanal (5 Días)</div>
                    <div className="text-base font-black font-mono text-white">
                      ${weeklyYield.toLocaleString()} USD
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-carbon-900 border border-carbon-800">
                    <div className="text-[10px] text-silver-400 uppercase font-semibold">Mensual (70% Ocup.)</div>
                    <div className="text-base font-black font-mono text-emerald-400">
                      ${monthlyYield.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-silver-400 border-t border-carbon-800/80">
                  <span>Depósito en Garantía Sugerido:</span>
                  <span className="font-mono font-bold text-gold-400">${warrantyDeposit.toLocaleString()} USD</span>
                </div>
              </div>

            </div>

            {/* Mini Galería de Preview en Vivo */}
            {galleryImages.length > 0 && (
              <div className="pt-4 border-t border-carbon-800">
                <span className="text-xs font-bold text-silver-300 mb-2 block">
                  Miniatura Galería Oficial ({galleryImages.length} fotos cargadas):
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setZoomImage({ url: img, label: `Foto #${i + 1}` })}
                      className="relative w-16 h-12 rounded-lg overflow-hidden border border-carbon-700 hover:border-gold-500/60 flex-shrink-0 transition-transform hover:scale-105"
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL ZOOM / LIGHTBOX INTERNO PARA INSPECCIONAR FOTOS     */}
      {/* ======================================================== */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-gold-500/50 shadow-2xl bg-carbon-950 p-2">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-carbon-900/90 text-white hover:bg-carbon-800 transition-colors z-10 border border-carbon-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImage.url}
              alt={zoomImage.label}
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs font-bold text-gold-400 font-mono">
              {zoomImage.label}
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
};
