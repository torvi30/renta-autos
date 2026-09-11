import React, { useState, useEffect } from 'react';
import {
  Vehicle,
  VehicleCategory,
  VehicleStatus,
  TransmissionType,
  FuelType,
} from '../../types/vehicle';
import { uploadVehiclePhoto, uploadVehicleVideo } from '../../services/storageService';
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
  Info,
} from 'lucide-react';

interface AdminVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit: Vehicle | null;
  onSave: (vehicleData: Partial<Vehicle>) => Promise<void> | void;
}

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
  'Modo de Conducción Track / Launch Control',
  'Faros Láser Matrix LED',
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

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [plate, setPlate] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('DEPORTIVO');
  const [status, setStatus] = useState<VehicleStatus>('AVAILABLE');
  const [pricePerDay, setPricePerDay] = useState<number>(1200);
  const [transmission, setTransmission] = useState<TransmissionType>('AUTOMATICA');
  const [fuel, setFuel] = useState<FuelType>('GASOLINA');
  const [seats, setSeats] = useState<number>(2);
  const [doors, setDoors] = useState<number>(2);
  const [description, setDescription] = useState('');

  // Specs
  const [horsepower, setHorsepower] = useState<number>(500);
  const [acceleration, setAcceleration] = useState('3.2s');
  const [topSpeed, setTopSpeed] = useState<number>(310);

  // Features
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  // Media (Reglas 7, 8 y 9)
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Upload status
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setBrand('');
      setModel('');
      setYear(new Date().getFullYear());
      setPlate('');
      setCategory('DEPORTIVO');
      setStatus('AVAILABLE');
      setPricePerDay(1500);
      setTransmission('AUTOMATICA');
      setFuel('GASOLINA');
      setSeats(2);
      setDoors(2);
      setDescription('');
      setHorsepower(650);
      setAcceleration('2.9s');
      setTopSpeed(330);
      setFeatures(['Audio Burmester 3D High-End', 'Frenos Carbono-Cerámicos', 'Interior Cuero Nappa & Alcantara']);
      setMainImage('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=85');
      setGalleryImages([
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      ]);
      setVideoUrl('');
    }
    setErrorMessage(null);
    setActiveTab('general');
  }, [vehicleToEdit, isOpen]);

  if (!isOpen) return null;

  // Manejador de subida de archivo para imagen principal
  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const tempId = vehicleToEdit?.id || `veh-${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
      const result = await uploadVehiclePhoto(tempId, file, 0);
      setMainImage(result.url);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al subir la imagen principal');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Manejador para agregar foto a galería (máx 12 - Regla 8)
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

  const handleUploadGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (galleryImages.length >= 12) {
      setErrorMessage('Límite alcanzado: Máximo 12 fotografías por vehículo según la Regla 8.');
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const tempId = vehicleToEdit?.id || `veh-${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
      const result = await uploadVehiclePhoto(tempId, file, galleryImages.length);
      setGalleryImages([...galleryImages, result.url]);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al subir la fotografía a la galería');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Manejador de subida de video (máx 15s recomendado - Reglas 7 y 9)
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setErrorMessage(null);
    try {
      const tempId = vehicleToEdit?.id || `veh-${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
      const result = await uploadVehicleVideo(tempId, file);
      setVideoUrl(result.url);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al subir el video');
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

  // Guardar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim() || !model.trim() || !plate.trim()) {
      setErrorMessage('Por favor completa la Marca, Modelo y Placa oficial del vehículo.');
      setActiveTab('general');
      return;
    }

    if (!mainImage.trim()) {
      setErrorMessage('Es obligatorio especificar una Imagen Principal destacada para el Showroom.');
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

    // Distribuir las 12 fotos en la estructura VehicleGallery
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
      description: description.trim() || `Exclusivo ${brand} ${model} año ${year}. Rendimiento superdeportivo, confort boutique y acabados de lujo para clientes VIP.`,
      features: features.length > 0 ? features : ['Transmisión Automática', 'Audio Premium', 'Interior de Lujo'],
      mainImage: mainImage.trim(),
      videoUrl: videoUrl.trim() || undefined,
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
      await onSave(vehiclePayload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al guardar los datos del vehículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-carbon-800 bg-carbon-850/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                GESTIÓN DE FLOTA BOUTIQUE (FASE 8)
              </span>
              <span className="text-carbon-600">•</span>
              <span className="text-xs text-silver-400 font-mono">
                {isEditMode ? `ID: ${vehicleToEdit?.id}` : 'Nueva Unidad'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-silver-100 font-display">
              {isEditMode ? `Editar ${vehicleToEdit?.brand} ${vehicleToEdit?.model}` : 'Registrar Nuevo Vehículo en Flota'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-carbon-800 text-silver-400 hover:text-white hover:bg-carbon-750 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Formulario */}
        <div className="flex border-b border-carbon-800 bg-carbon-850/50 px-5 gap-2 pt-2">
          {[
            { id: 'general', label: '1. Datos & Mecánica', icon: Gauge },
            { id: 'media', label: `2. Multimedia (${galleryImages.length}/12 Fotos)`, icon: Camera },
            { id: 'specs', label: '3. Equipamiento & Reseña', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-gold-500 text-gold-400 bg-carbon-900/60 rounded-t-lg'
                    : 'border-transparent text-silver-400 hover:text-silver-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mensaje de Error si ocurre */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Contenido con Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          
          {/* ======================================================== */}
          {/* PESTAÑA 1: DATOS GENERALES Y MECÁNICA                    */}
          {/* ======================================================== */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-silver-300 font-semibold mb-1.5">Marca *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej. Porsche, Ferrari, Lamborghini"
                    className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-silver-300 font-semibold mb-1.5">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ej. 911 GT3 RS, F8 Tributo"
                    className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-silver-300 font-semibold mb-1.5">Año *</label>
                  <input
                    type="number"
                    required
                    min={2018}
                    max={2027}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-silver-300 font-semibold mb-1.5">Placa Oficial *</label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="Ej. LUX-911"
                    className="w-full text-xs font-mono bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-silver-300 font-semibold mb-1.5">Categoría Showroom *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                    className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    <option value="DEPORTIVO">Deportivo de Alto Rendimiento</option>
                    <option value="SUV_LUJO">SUV de Ultra-Lujo</option>
                    <option value="SEDAN_EJECUTIVO">Sedán Ejecutivo VIP</option>
                    <option value="EXOTICO">Superdeportivo Exótico</option>
                    <option value="CONVERTIBLE">Convertible Gran Turismo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-silver-300 font-semibold mb-1.5">Tarifa Diaria ($USD) *</label>
                  <input
                    type="number"
                    required
                    min={300}
                    max={15000}
                    step={50}
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold text-gold-400 bg-carbon-800 border border-carbon-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              {/* Telemetría y Mecánica */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-4">
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                  Telemetría & Ficha Mecánica
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">Potencia (CV / HP)</label>
                    <input
                      type="number"
                      min={200}
                      max={1800}
                      value={horsepower}
                      onChange={(e) => setHorsepower(Number(e.target.value))}
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">0-100 km/h</label>
                    <input
                      type="text"
                      value={acceleration}
                      onChange={(e) => setAcceleration(e.target.value)}
                      placeholder="Ej. 2.8s"
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">Velocidad Punta (km/h)</label>
                    <input
                      type="number"
                      min={200}
                      max={450}
                      value={topSpeed}
                      onChange={(e) => setTopSpeed(Number(e.target.value))}
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">Plazas</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">Transmisión</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    >
                      <option value="AUTOMATICA">Automática Doble Embrague (PDK/DCT)</option>
                      <option value="MANUAL">Manual 6/7 Velocidades</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">Combustible</label>
                    <select
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value as FuelType)}
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    >
                      <option value="GASOLINA">Gasolina Premium 98 Octanos</option>
                      <option value="HIBRIDO">Híbrido Enchufable (PHEV)</option>
                      <option value="ELECTRICO">100% Eléctrico Ultra-Fast Charge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">Estado Operativo</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
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
          {/* PESTAÑA 2: GESTOR MULTIMEDIA (REGLAS 7, 8 Y 9)           */}
          {/* ======================================================== */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Panel de Cumplimiento de Reglas */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center flex-shrink-0 border border-gold-500/20">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-silver-100">
                      Cumplimiento de Regla 8 (Máx 12 Fotografías)
                    </div>
                    <div className="text-[11px] text-silver-400">
                      Organizadas en Exterior (1-5), Interior (6-9) y Detalles (10-12).
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      galleryImages.length === 12
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : galleryImages.length >= 6
                        ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                        : 'bg-carbon-800 text-silver-400 border-carbon-700'
                    }`}
                  >
                    Fotos: {galleryImages.length} / 12
                  </span>
                </div>
              </div>

              {/* 1. Imagen Principal Protagonista */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-silver-200">
                    Fotografía Principal Destacada (Showroom Hero) *
                  </label>
                  {isUploadingPhoto && (
                    <span className="text-xs text-gold-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Subiendo a Storage...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt="Vista previa"
                      className="w-32 h-20 object-cover rounded-xl border border-gold-500/40 shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center text-silver-500 text-xs">
                      Sin Foto
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="url"
                      value={mainImage}
                      onChange={(e) => setMainImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    />
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs cursor-pointer border border-carbon-700 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-gold-400" />
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

              {/* 2. Galería de hasta 12 Fotos */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-silver-200 block">
                      Galería Oficial ({galleryImages.length}/12)
                    </span>
                    <span className="text-[11px] text-silver-400">
                      Haz clic en la papelera para retirar fotos o añade nuevas URLs / archivos locales.
                    </span>
                  </div>

                  <label
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      galleryImages.length >= 12
                        ? 'opacity-40 cursor-not-allowed bg-carbon-800 text-silver-500 border-carbon-750'
                        : 'bg-carbon-800 hover:bg-carbon-750 text-gold-400 border-gold-500/30 cursor-pointer'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Foto</span>
                    <input
                      type="file"
                      disabled={galleryImages.length >= 12}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleUploadGalleryPhoto}
                    />
                  </label>
                </div>

                {/* Formulario de URL rápida */}
                {galleryImages.length < 12 && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="O pega una URL de imagen (https://...)"
                      className="flex-1 text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-gold-400 text-xs font-semibold border border-carbon-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                )}

                {/* Grid de Miniaturas de Galería */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-lg overflow-hidden border border-carbon-700 group bg-carbon-900"
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 bg-carbon-950/80 text-[10px] font-mono text-gold-400 px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="absolute bottom-1 right-1 p-1 bg-rose-950/90 text-rose-400 hover:text-rose-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Espacios vacíos hasta 12 para visualizar el límite */}
                  {Array.from({ length: Math.max(0, 12 - galleryImages.length) })
                    .slice(0, 4)
                    .map((_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="aspect-video rounded-lg border border-dashed border-carbon-800 flex items-center justify-center text-carbon-600 text-[10px]"
                      >
                        Espacio #{galleryImages.length + idx + 1}
                      </div>
                    ))}
                </div>
              </div>

              {/* 3. Video de Exterior en Loop (Reglas 7 y 9) */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-silver-200 block">
                      Video Promocional en Loop Silencioso (Reglas 7 & 9)
                    </label>
                    <span className="text-[11px] text-silver-400">
                      Recomendado máx 15 segundos en formato MP4 o WebM.
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${
                      videoUrl
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
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
                    className="flex-1 text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2 w-full"
                  />

                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs cursor-pointer border border-carbon-700 transition-colors whitespace-nowrap">
                    <Video className="w-3.5 h-3.5 text-gold-400" />
                    <span>{isUploadingVideo ? 'Subiendo...' : 'Subir MP4'}</span>
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
          {/* PESTAÑA 3: EQUIPAMIENTO VIP Y RESEÑA                     */}
          {/* ======================================================== */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Comodidades VIP */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-3">
                <span className="text-xs font-semibold text-silver-200 block">
                  Equipamiento & Comodidades de Ultra-Lujo
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LUXURY_AMENITIES_PRESETS.map((amenity) => {
                    const isSelected = features.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleFeature(amenity)}
                        className={`text-left p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-gold-500/15 border-gold-500/40 text-gold-300'
                            : 'bg-carbon-800/80 border-carbon-750 text-silver-400 hover:text-silver-200'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
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
                    placeholder="Agregar comodidad personalizada (ej. Nevera de Champán)..."
                    className="flex-1 text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFeature}
                    className="px-3 py-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-gold-400 text-xs font-semibold border border-carbon-700"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              {/* Reseña Editorial */}
              <div>
                <label className="block text-xs text-silver-300 font-semibold mb-1.5">
                  Descripción Editorial para la Ficha Showroom
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Redacta la reseña destacando la exclusividad, ingeniería y sensación de manejo..."
                  className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-xl p-3.5 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-carbon-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-silver-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gold-400" />
              <span>Los cambios se sincronizan en Cloud Firestore y caché local.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs font-semibold border border-carbon-700 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Guardar Cambios' : 'Crear Vehículo'}</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
