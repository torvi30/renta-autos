import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Share2, 
  Check, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Gauge, 
  Settings2, 
  Fuel, 
  Users, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ArrowLeft,
  Flame,
  Award
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import { VehicleShowcase } from '../components/showcase/VehicleShowcase';
import { VehicleLightbox } from '../components/showcase/VehicleLightbox';
import { VehicleCard } from '../components/common/VehicleCard';
import { StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatCurrency, getCategoryLabel, generateWhatsAppLink } from '../utils/formatters';

interface VehicleDetailPageProps {
  vehicle: Vehicle | null;
  allVehicles: Vehicle[];
  onNavigateHome: () => void;
  onNavigateToCatalog: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenBooking: (vehicle: Vehicle, startDate?: string, endDate?: string) => void;
}

export const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({
  vehicle,
  allVehicles,
  onNavigateHome,
  onNavigateToCatalog,
  onSelectVehicle,
  onOpenBooking,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'ALL' | 'EXTERIOR' | 'INTERIOR' | 'DETAILS'>('ALL');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Selector de fechas para la cotización interactiva
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  // Título dinámico para SEO (Regla 17)
  useEffect(() => {
    if (vehicle) {
      document.title = `${vehicle.brand} ${vehicle.model} (${vehicle.year}) | Premium Car Rental`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [vehicle]);

  // Recopilar fotos organizadas respetando la Regla 8 (máximo 12 fotografías)
  const exteriorImages = vehicle?.gallery?.exteriorImages || [];
  const interiorImages = vehicle?.gallery?.interiorImages || [];
  const detailImages = vehicle?.gallery?.detailImages || [];

  const allPhotos = useMemo(() => {
    if (!vehicle) return [];
    const combined = [
      vehicle.mainImage,
      ...exteriorImages,
      ...interiorImages,
      ...detailImages,
    ];
    // Eliminar duplicados y limitar estrictamente a 12 fotos
    return Array.from(new Set(combined)).slice(0, 12);
  }, [vehicle, exteriorImages, interiorImages, detailImages]);

  const displayedPhotos = useMemo(() => {
    if (activeGalleryTab === 'EXTERIOR') return exteriorImages.length > 0 ? exteriorImages : [vehicle?.mainImage || ''];
    if (activeGalleryTab === 'INTERIOR') return interiorImages;
    if (activeGalleryTab === 'DETAILS') return detailImages;
    return allPhotos;
  }, [activeGalleryTab, exteriorImages, interiorImages, detailImages, allPhotos, vehicle?.mainImage]);

  // Cálculo dinámico de cotización
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  const dailySubtotal = (vehicle?.pricePerDay || 0) * totalDays;
  const securityDeposit = Math.round((vehicle?.pricePerDay || 1000) * 1.5);
  const totalEstimated = dailySubtotal;

  // Vehículos similares de la misma categoría o rango
  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return allVehicles
      .filter((v) => v.id !== vehicle.id && (v.category === vehicle.category || v.status === 'AVAILABLE'))
      .slice(0, 3);
  }, [vehicle, allVehicles]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openLightboxAt = (photoUrl: string) => {
    const idx = allPhotos.indexOf(photoUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  if (!vehicle) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-carbon-950 text-silver-100 px-4 py-20">
        <div className="w-16 h-16 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-center justify-center mb-6">
          <Layers className="w-8 h-8 text-gold-400" />
        </div>
        <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-silver-100">
          Vehículo No Encontrado
        </h1>
        <p className="mt-2 text-sm text-silver-400 max-w-md text-center">
          El vehículo solicitado no se encuentra en el catálogo actual o ha cambiado de identificador.
        </p>
        <button
          onClick={onNavigateToCatalog}
          className="mt-6 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Explorar Catálogo Completo
        </button>
      </div>
    );
  }

  const isAvailable = vehicle.status === 'AVAILABLE';
  const isRented = vehicle.status === 'RENTED';
  const isMaintenance = vehicle.status === 'MAINTENANCE';

  const whatsAppLink = generateWhatsAppLink({
    vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
    startDate,
    endDate,
  });

  return (
    <div className="min-h-screen bg-carbon-950 text-silver-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation (Regla 17: SEO y navegación) */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-silver-400 flex-wrap">
            <li>
              <button
                onClick={onNavigateHome}
                className="hover:text-gold-400 transition-colors"
              >
                Inicio
              </button>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-silver-600" />
            </li>
            <li>
              <button
                onClick={onNavigateToCatalog}
                className="hover:text-gold-400 transition-colors"
              >
                Catálogo de Vehículos
              </button>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-silver-600" />
            </li>
            <li className="text-gold-400 font-medium truncate max-w-xs" aria-current="page">
              {vehicle.brand} {vehicle.model}
            </li>
          </ol>
        </nav>

        {/* Cabecera Principal del Vehículo */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-carbon-850">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
                {getCategoryLabel(vehicle.category)}
              </span>
              <StatusBadge status={vehicle.status} />
              <span className="text-xs px-2.5 py-0.5 rounded bg-carbon-900 border border-carbon-800 text-silver-400 font-mono">
                Placa: {vehicle.plate}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-sm font-semibold uppercase tracking-widest text-gold-400">
                {vehicle.brand}
              </span>
              <span className="text-xs text-silver-500 font-mono">
                Año {vehicle.year}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-silver-100 uppercase font-display tracking-tight mt-1">
              {vehicle.model}
            </h1>
          </div>

          {/* Acciones de Cabecera: Compartir y Volver */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-800 hover:border-gold-500/40 text-silver-300 hover:text-gold-400 text-xs font-semibold transition-all shadow-sm"
              title="Copiar enlace del vehículo"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartir Ficha</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToCatalog}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-800 hover:border-carbon-700 text-silver-400 hover:text-silver-200 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Flota</span>
            </button>
          </div>
        </div>

        {/* Bloque Superior: Showcase Cinemático Protagonista (Regla 7, 9) */}
        <div className="mt-8 rounded-3xl overflow-hidden border border-carbon-800/80 shadow-showroom bg-carbon-950 relative">
          <VehicleShowcase
            videoUrl={vehicle.videoUrl}
            imageUrl={vehicle.mainImage}
            altText={`${vehicle.brand} ${vehicle.model}`}
            aspectRatio="16/9"
            autoPlay={true}
            showControls={true}
            priority={true}
          />
        </div>

        {/* Métricas Destacadas de Rendimiento (Barra de Desempeño) */}
        {vehicle.specs && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-carbon-850 flex items-center justify-center border border-carbon-750 text-gold-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-silver-400 uppercase tracking-wider">Potencia</div>
                <div className="text-lg font-bold text-silver-100 font-mono">
                  {vehicle.specs.horsepower ? `${vehicle.specs.horsepower} CV` : 'N/D'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-carbon-850 flex items-center justify-center border border-carbon-750 text-gold-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-silver-400 uppercase tracking-wider">0 - 100 km/h</div>
                <div className="text-lg font-bold text-silver-100 font-mono">
                  {vehicle.specs.acceleration0to100 || 'N/D'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-carbon-850 flex items-center justify-center border border-carbon-750 text-gold-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-silver-400 uppercase tracking-wider">Vel. Máxima</div>
                <div className="text-lg font-bold text-silver-100 font-mono">
                  {vehicle.specs.topSpeed ? `${vehicle.specs.topSpeed} km/h` : 'N/D'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-carbon-850 flex items-center justify-center border border-carbon-750 text-gold-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-silver-400 uppercase tracking-wider">Configuración</div>
                <div className="text-lg font-bold text-silver-100 font-mono">
                  {vehicle.seats} Plazas · {vehicle.specs.doors || 2}P
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal: Dos Columnas (Información Técnica + Sidebar de Cotización) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Columna Izquierda: Descripción, Ficha Técnica y Galería (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Descripción Editorial */}
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-silver-100 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-400" />
                <span>Sobre este Vehículo</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-silver-300 leading-relaxed">
                {vehicle.description}
              </p>
            </div>

            {/* Galería Oficial de hasta 12 Fotografías (Regla 8) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-silver-100 font-display">
                    Galería Oficial de Showroom
                  </h3>
                  <p className="text-xs text-silver-400 mt-1">
                    Inspección fotográfica en alta fidelidad ({allPhotos.length} / 12 fotografías). Clic en cualquier imagen para abrir visor a pantalla completa.
                  </p>
                </div>

                {/* Filtros de Galería por Sección */}
                <div className="flex items-center gap-1.5 bg-carbon-900 border border-carbon-800 p-1 rounded-xl">
                  {[
                    { key: 'ALL', label: 'Todas' },
                    { key: 'EXTERIOR', label: 'Exterior' },
                    { key: 'INTERIOR', label: 'Interior' },
                    { key: 'DETAILS', label: 'Detalles' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveGalleryTab(tab.key as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        activeGalleryTab === tab.key
                          ? 'bg-carbon-800 text-gold-400 font-semibold shadow-sm'
                          : 'text-silver-400 hover:text-silver-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Fotos con soporte de apertura de Lightbox */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayedPhotos.map((photo, index) => (
                  <button
                    key={`photo-${index}`}
                    onClick={() => openLightboxAt(photo)}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-carbon-800/80 hover:border-gold-500/50 bg-carbon-900 focus:outline-none transition-all shadow-md"
                  >
                    <img
                      src={photo}
                      alt={`${vehicle.brand} ${vehicle.model} foto ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-carbon-950/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-silver-300 font-mono backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Ampliar ⤢
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ficha Técnica Exhaustiva */}
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider text-silver-100 font-display mb-6">
                Ficha Técnica de Fabricante
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-start gap-3">
                  <Settings2 className="w-5 h-5 text-gold-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-silver-400">Transmisión</div>
                    <div className="text-sm font-semibold text-silver-100 mt-0.5 capitalize">
                      {vehicle.transmission === 'AUTOMATICA' ? 'Automática Secuencial de Alto Rendimiento' : 'Manual de Precisión'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-start gap-3">
                  <Fuel className="w-5 h-5 text-gold-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-silver-400">Tipo de Combustible / Propulsión</div>
                    <div className="text-sm font-semibold text-silver-100 mt-0.5 capitalize">
                      {vehicle.fuel === 'GASOLINA' && 'Gasolina Premium de Alto Octanaje (98+)'}
                      {vehicle.fuel === 'HIBRIDO' && 'Híbrido Enchufable de Altas Prestaciones'}
                      {vehicle.fuel === 'ELECTRICO' && '100% Eléctrico (Arquitectura 800V)'}
                      {vehicle.fuel === 'DIESEL' && 'Diésel Biturbo Eficiente'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-gold-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-silver-400">Estado de Conservación</div>
                    <div className="text-sm font-semibold text-silver-100 mt-0.5">
                      Flota Certificada 100% Oficial de Fábrica
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-silver-400">Disponibilidad de Entrega</div>
                    <div className="text-sm font-semibold text-silver-100 mt-0.5">
                      Inmediata en Showroom Central o Aeropuerto VIP
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipamiento Exclusivo y Características VIP */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-silver-100 font-display mb-6">
                  Equipamiento y Paquetes de Serie
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicle.features.map((feature, idx) => (
                    <div
                      key={`feat-${idx}`}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-carbon-900/60 border border-carbon-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-silver-200">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Columna Derecha: Tarjeta de Cotización y Reserva Rápida (4 cols) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-carbon-900 border border-carbon-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Tarifa y Estado */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-carbon-800">
                <div>
                  <span className="text-xs text-silver-400">Tarifa Diaria Oficial</span>
                  <div className="text-3xl font-extrabold text-silver-100 font-mono mt-0.5">
                    {formatCurrency(vehicle.pricePerDay)}
                    <span className="text-xs font-normal text-silver-400"> / día</span>
                  </div>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              {/* Selector de Fechas para Cotización */}
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-silver-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  <span>Cotizador de Reserva</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">
                      Recogida
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-carbon-850 border border-carbon-750 rounded-xl text-xs text-silver-100 focus:outline-none focus:border-gold-500/60 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-silver-400 mb-1">
                      Devolución
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-carbon-850 border border-carbon-750 rounded-xl text-xs text-silver-100 focus:outline-none focus:border-gold-500/60 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Desglose de Precios */}
              <div className="space-y-2.5 pt-4 border-t border-carbon-800 text-xs">
                <div className="flex justify-between text-silver-400">
                  <span>{formatCurrency(vehicle.pricePerDay)} x {totalDays} {totalDays === 1 ? 'día' : 'días'}</span>
                  <span className="font-mono text-silver-200">{formatCurrency(dailySubtotal)}</span>
                </div>

                <div className="flex justify-between text-silver-400">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-gold-400" />
                    Cobertura VIP a todo riesgo
                  </span>
                  <span className="text-emerald-400 font-semibold">Incluida</span>
                </div>

                <div className="flex justify-between text-silver-400">
                  <span>Depósito de garantía reembolsable</span>
                  <span className="font-mono text-silver-300">{formatCurrency(securityDeposit)}</span>
                </div>

                <div className="pt-3 border-t border-carbon-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-silver-100 uppercase tracking-wider font-display">
                    Total Estimado
                  </span>
                  <span className="text-xl font-extrabold text-gold-400 font-mono">
                    {formatCurrency(totalEstimated)}
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 space-y-3">
                {isAvailable ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => onOpenBooking(vehicle, startDate, endDate)}
                  >
                    Solicitar Reserva ({totalDays} {totalDays === 1 ? 'Día' : 'Días'})
                  </Button>
                ) : isRented ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={() => onOpenBooking(vehicle, startDate, endDate)}
                  >
                    Consultar Próxima Disponibilidad
                  </Button>
                ) : isMaintenance ? (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center text-xs text-amber-300">
                    Vehículo en revisión técnica programada. Consulta con nuestro concierge para fechas futuras.
                  </div>
                ) : null}

                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-carbon-800 hover:border-emerald-600/40 bg-carbon-850 hover:bg-carbon-800 text-xs font-semibold text-silver-200 hover:text-emerald-400 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Consultar por WhatsApp (Regla 30)</span>
                </a>
              </div>

              {/* Garantías VIP */}
              <div className="pt-4 border-t border-carbon-800 space-y-2 text-[11px] text-silver-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span>Sin penalización por cancelación hasta 48h antes.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span>Kilometraje flexible y asistencia 24/7 en carretera.</span>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* Sección de Vehículos Similares / Relacionados */}
        {similarVehicles.length > 0 && (
          <div className="mt-24 pt-12 border-t border-carbon-850">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                  EXPLORA MÁS OPCIONES
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-silver-100 uppercase font-display mt-1">
                  Vehículos Similares
                </h3>
              </div>
              <button
                onClick={onNavigateToCatalog}
                className="text-xs text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-4"
              >
                Ver todo el catálogo →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarVehicles.map((simVeh) => (
                <VehicleCard
                  key={simVeh.id}
                  vehicle={simVeh}
                  onSelectVehicle={onSelectVehicle}
                  onQuickBook={(v) => onOpenBooking(v)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal Lightbox a Pantalla Completa */}
      <VehicleLightbox
        isOpen={lightboxOpen}
        images={allPhotos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
        vehicleTitle={`${vehicle.brand} ${vehicle.model}`}
      />

    </div>
  );
};
