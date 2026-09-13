import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  Gauge, 
  Zap, 
  Flame, 
  ShieldCheck, 
  Eye, 
  MessageSquare, 
  Sparkles,
  Compass
} from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';

interface HeroSectionProps {
  vehicles: Vehicle[];
  onExploreFleet: () => void;
  onSelectVehicleForModal: (vehicle: Vehicle) => void;
  onSelectVehicleForBooking: (vehicle: Vehicle) => void;
  currentVehicleId?: string;
  onVehicleChange?: (vehicle: Vehicle) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  vehicles,
  onSelectVehicleForModal,
  onSelectVehicleForBooking,
  currentVehicleId,
  onVehicleChange,
}) => {
  const { settings, getWhatsAppLink } = useSettings();
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  // Todos los vehículos activos de la flota para el Showroom Turntable Pavilion
  const showroomVehicles = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    return vehicles.filter((v) => v.status !== 'INACTIVE');
  }, [vehicles]);

  // Por defecto, index 0 es la Toyota Prado TXL (el vehículo insignia de la flota)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const mobileDockRef = React.useRef<HTMLDivElement>(null);

  // Sincronización si se selecciona desde el exterior
  useEffect(() => {
    if (currentVehicleId) {
      const idx = showroomVehicles.findIndex((v) => v.id === currentVehicleId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [currentVehicleId, showroomVehicles]);

  // Auto-desplazar la tarjeta activa al centro con límites estrictos para evitar bucles continuos
  useEffect(() => {
    if (mobileDockRef.current) {
      const container = mobileDockRef.current;
      const activeCard = container.children[currentIndex] as HTMLElement;
      if (activeCard) {
        const cardLeft = activeCard.offsetLeft;
        const cardWidth = activeCard.offsetWidth;
        const containerWidth = container.offsetWidth;
        const maxScroll = Math.max(0, container.scrollWidth - containerWidth);
        const targetLeft = Math.min(Math.max(0, cardLeft - (containerWidth - cardWidth) / 2), maxScroll);

        // Solo desplazamos si la diferencia es superior a 15px para evitar cualquier ciclo de rebote
        if (Math.abs(container.scrollLeft - targetLeft) > 15) {
          container.scrollTo({
            left: targetLeft,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentIndex]);

  const activeVehicle = showroomVehicles[currentIndex] || showroomVehicles[0] || vehicles[0];

  const prevIndex = showroomVehicles.length > 0 ? (currentIndex - 1 + showroomVehicles.length) % showroomVehicles.length : 0;
  const nextIndex = showroomVehicles.length > 0 ? (currentIndex + 1) % showroomVehicles.length : 0;
  const prevVehicle = showroomVehicles[prevIndex] || activeVehicle;
  const nextVehicle = showroomVehicles[nextIndex] || activeVehicle;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (showroomVehicles.length === 0) return 0;
      const nextIdx = (prev + 1) % showroomVehicles.length;
      if (onVehicleChange) onVehicleChange(showroomVehicles[nextIdx]);
      return nextIdx;
    });
  }, [showroomVehicles, onVehicleChange]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (showroomVehicles.length === 0) return 0;
      const prevIdx = (prev - 1 + showroomVehicles.length) % showroomVehicles.length;
      if (onVehicleChange) onVehicleChange(showroomVehicles[prevIdx]);
      return prevIdx;
    });
  }, [showroomVehicles, onVehicleChange]);

  const handleSelectCar = (index: number) => {
    setCurrentIndex(index);
    if (onVehicleChange) onVehicleChange(showroomVehicles[index]);
  };

  // Navegación con flechas de teclado (← y →)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Soporte de Swipe táctil en móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext(); // Deslizar hacia la izquierda = siguiente
      else handlePrev();          // Deslizar hacia la derecha = anterior
    }
    setTouchStartX(null);
  };

  const whatsAppLink = getWhatsAppLink({
    vehicleName: `${activeVehicle.brand} ${activeVehicle.model} (${activeVehicle.year})`,
  });

  return (
    <section
      id="hero-pavilion"
      className="relative pt-28 sm:pt-32 pb-8 sm:pb-12 flex flex-col justify-start overflow-hidden bg-gradient-to-b from-carbon-950 via-carbon-900 to-carbon-950"
    >
      {/* Luz ambiental cenital de concesionario showroom VIP */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-gold-500/20 via-gold-500/5 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Cabecera Editorial del Concesionario Showroom */}
        <div className="text-center max-w-3xl mx-auto mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-carbon-850/90 border border-gold-500/40 text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 shadow-lg shadow-gold-500/5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span>{language === 'EN' ? t.hero.badge : (settings.hero?.badge || t.hero.badge)}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase font-display leading-[1.05]">
            {language === 'EN' ? t.hero.titleLine1 : (settings.hero?.titleLine1 || t.hero.titleLine1)} <br />
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">
              {language === 'EN' ? t.hero.titleLine2 : (settings.hero?.titleLine2 || t.hero.titleLine2)}
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-silver-300 font-light max-w-2xl mx-auto">
            {language === 'EN' ? t.hero.description : (settings.hero?.description || t.hero.description)}
          </p>
        </div>

        {/* PROTAGONISTA VISUAL: Escenario Showroom 3D con Navegación Cinemática */}
        <div 
          className="relative max-w-5xl mx-auto mt-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Tarjeta flotante de información del auto activo */}
          <div className="absolute top-4 left-4 z-40 hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-carbon-950/90 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
                {activeVehicle.brand}
              </span>
              <span className="text-base font-bold text-silver-100 font-display">
                {activeVehicle.model} ({activeVehicle.year})
              </span>
            </div>
            <div className="h-6 w-px bg-carbon-750" />
            <div className="flex flex-col">
              <span className="text-[10px] text-silver-400">{t.hero.dailyRate}</span>
              <span className="text-sm font-bold text-silver-100 font-mono">
                {formatPrice(activeVehicle.pricePerDay)} <span className="text-[10px] text-silver-400 font-normal">{t.hero.perDaySuffix}</span>
              </span>
            </div>
            <StatusBadge status={activeVehicle.status} />
          </div>

          {/* Flecha Flotante Anterior (Izquierda) - Estilo Concesionario VIP */}
          <button
            onClick={handlePrev}
            aria-label={`Vehículo anterior: ${prevVehicle.brand} ${prevVehicle.model}`}
            title={`Anterior: ${prevVehicle.brand} ${prevVehicle.model}`}
            className="absolute left-2 sm:-left-7 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-carbon-950/90 hover:bg-gold-500 hover:text-carbon-950 border border-gold-500/40 hover:border-gold-400 text-silver-200 backdrop-blur-xl shadow-2xl transition-all duration-300 flex items-center justify-center group active:scale-95"
          >
            <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
            
            {/* Tooltip de previsualización */}
            <span className="hidden lg:group-hover:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-carbon-900/95 border border-carbon-750 text-[11px] text-silver-200 whitespace-nowrap shadow-xl font-medium">
              ← {prevVehicle.brand} {prevVehicle.model}
            </span>
          </button>

          {/* Flecha Flotante Siguiente (Derecha) - Estilo Concesionario VIP */}
          <button
            onClick={handleNext}
            aria-label={`Siguiente vehículo: ${nextVehicle.brand} ${nextVehicle.model}`}
            title={`Siguiente: ${nextVehicle.brand} ${nextVehicle.model}`}
            className="absolute right-2 sm:-right-7 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-carbon-950/90 hover:bg-gold-500 hover:text-carbon-950 border border-gold-500/40 hover:border-gold-400 text-silver-200 backdrop-blur-xl shadow-2xl transition-all duration-300 flex items-center justify-center group active:scale-95"
          >
            <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />

            {/* Tooltip de previsualización */}
            <span className="hidden lg:group-hover:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-carbon-900/95 border border-carbon-750 text-[11px] text-silver-200 whitespace-nowrap shadow-xl font-medium">
              {nextVehicle.brand} {nextVehicle.model} →
            </span>
          </button>

          {/* Escenario Showroom de Lujo: Presentación Pro del Vehículo Activo */}
          <div
            onClick={() => onSelectVehicleForModal(activeVehicle)}
            className="relative w-full aspect-[16/9] sm:aspect-[20/9] rounded-3xl bg-gradient-to-b from-carbon-900 via-carbon-950 to-black border border-carbon-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(212,175,55,0.06)] overflow-hidden select-none group cursor-pointer flex items-center justify-center transition-all duration-500 hover:border-gold-500/40"
            title={language === 'ES' ? 'Clic para ver ficha técnica y galería completa' : 'Click to view specs and full gallery'}
          >
            {/* Iluminación cenital ambiental de estudio */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-56 bg-gradient-to-b from-gold-500/15 via-gold-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Sombra de contacto de piso para realismo visual */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] sm:w-[70%] h-12 bg-black/90 blur-2xl rounded-full pointer-events-none" />

            {/* Reflejo inferior sutil de cristal oscuro */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-carbon-950 via-carbon-950/60 to-transparent pointer-events-none" />

            {/* Fotografía principal estática, nítida y completa del vehículo */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 z-20">
              <img
                src={activeVehicle.mainImage}
                alt={`${activeVehicle.brand} ${activeVehicle.model} - Exhibición Showroom`}
                className="max-h-[85%] sm:max-h-[90%] max-w-[92%] sm:max-w-[88%] object-contain object-center select-none filter contrast-[1.02] brightness-[0.99] group-hover:brightness-105 group-hover:scale-[1.02] transition-all duration-500 drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                draggable={false}
              />
            </div>

            {/* Badge de estado en esquina superior derecha */}
            <div className="absolute top-4 right-4 z-30 hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-carbon-950/80 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold tracking-widest uppercase backdrop-blur-md shadow-lg">
                SHOWROOM VIP • {activeVehicle.category.replace('_', ' ')}
              </span>
            </div>

            {/* Overlay interactivo en Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-black/30 backdrop-blur-[2px] z-30">
              <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-carbon-950/95 border border-gold-500/60 shadow-2xl text-gold-300 text-xs sm:text-sm font-bold tracking-wider uppercase backdrop-blur-xl animate-bounce-gentle">
                <Eye className="w-4 h-4 text-gold-400" />
                <span>{language === 'ES' ? 'Ver Ficha Técnica y Galería Completa' : 'View Specs & Full Gallery'}</span>
                <ArrowUpRight className="w-4 h-4 text-gold-400 ml-1" />
              </div>
            </div>
          </div>

          {/* Especificaciones clave de telemetría debajo del showcase */}
          {activeVehicle.specs && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-carbon-900/80 p-3.5 rounded-2xl border border-carbon-800/80 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2.5 px-3">
                <Zap className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">{t.specs.acceleration}</div>
                  <div className="text-sm font-bold text-silver-100 font-mono transition-all">
                    {activeVehicle.specs.acceleration0to100 || '3.2 s'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <Flame className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">{t.specs.horsepower}</div>
                  <div className="text-sm font-bold text-silver-100 font-mono transition-all">
                    {activeVehicle.specs.horsepower} HP
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <Gauge className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">{t.specs.topSpeed}</div>
                  <div className="text-sm font-bold text-silver-100 font-mono transition-all">
                    {activeVehicle.specs.topSpeed} km/h
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">{t.hero.warranty}</div>
                  <div className="text-sm font-bold text-silver-100">{t.hero.insurance}</div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción directa para el auto actual */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => onSelectVehicleForBooking(activeVehicle)}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              {t.hero.bookThisVehicle} ({formatPrice(activeVehicle.pricePerDay)}/{t.detail.day})
            </Button>
            
            <Button
              variant="outline"
              size="md"
              onClick={() => onSelectVehicleForModal(activeVehicle)}
              icon={<Eye className="w-4 h-4" />}
            >
              {t.hero.viewSpecsAndGallery}
            </Button>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-500/40 text-xs font-semibold tracking-wider transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.hero.vipWhatsApp}</span>
            </a>
          </div>

        </div>

        {/* VIP DOCK: Carrusel interactivo de la flota showroom */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-carbon-800/80 w-full">
          
          {/* Cabecera del Dock con Título, Contador y Controles */}
          <div className="flex items-center justify-between mb-4 px-1 gap-2">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-gold-400 flex-shrink-0 animate-spin-slow" />
              <span className="text-xs sm:text-sm md:text-base font-bold text-silver-200 uppercase tracking-widest font-display">
                {t.hero.dockTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-carbon-800/90 text-gold-400 font-mono text-xs font-bold border border-gold-400/25 shadow-sm">
                {String(currentIndex + 1).padStart(2, '0')} / {String(showroomVehicles.length).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-silver-400 hidden lg:inline font-medium">
                {t.hero.dockHint}
              </span>

              {/* Controles rápidos para avanzar/retroceder vehículos */}
              <div className="flex items-center gap-1 bg-carbon-900 border border-carbon-800 rounded-lg p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-silver-300 hover:text-white hover:bg-carbon-800 active:scale-90 transition-all"
                  aria-label="Vehículo anterior"
                  title="Vehículo anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-silver-300 hover:text-white hover:bg-carbon-800 active:scale-90 transition-all"
                  aria-label="Siguiente vehículo"
                  title="Siguiente vehículo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Fila de Tarjetas: Selector boutique compacto con scroll fluido para toda la flota */}
          <div
            ref={mobileDockRef}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex gap-2 sm:gap-2.5 xl:gap-3 overflow-x-auto pb-4 pt-1 px-4 sm:px-1 scrollbar-thin scrollbar-thumb-carbon-700 scrollbar-track-transparent"
          >
            {showroomVehicles.map((veh, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={veh.id}
                  onClick={() => handleSelectCar(idx)}
                  className={`relative p-2 sm:p-2.5 rounded-2xl border text-left transition-all duration-300 group flex flex-col justify-between w-[134px] min-w-[134px] sm:w-[140px] sm:min-w-[140px] lg:w-[144px] lg:min-w-[144px] xl:w-[150px] xl:min-w-[150px] flex-shrink-0 min-h-[195px] sm:min-h-[205px] xl:min-h-[215px] ${
                    isActive
                      ? 'bg-gradient-to-b from-carbon-850 via-carbon-900 to-carbon-950 border-gold-400 ring-2 ring-gold-400/50 shadow-[0_12px_28px_rgba(212,175,55,0.25)] -translate-y-1.5'
                      : 'bg-gradient-to-b from-carbon-900/90 to-carbon-950/90 border-carbon-800/90 hover:border-gold-500/40 hover:bg-carbon-850 hover:-translate-y-1'
                  }`}
                >
                  {/* Indicador superior flotante cuando está activo */}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold-400 border-2 border-carbon-950 shadow-md shadow-gold-500/50" />
                    </span>
                  )}

                  {/* Miniatura compacta del vehículo */}
                  <div className="h-18 sm:h-20 lg:h-18 xl:h-22 w-full rounded-xl overflow-hidden mb-2 bg-carbon-950 relative shadow-inner group/img flex-shrink-0">
                    <img
                      src={veh.mainImage}
                      alt={veh.model}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isActive ? 'scale-110' : 'group-hover:scale-108'
                      }`}
                      loading="lazy"
                    />
                    
                    {/* Badge del número de auto */}
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-carbon-950/80 backdrop-blur-md text-[9px] font-mono font-bold text-silver-200 border border-white/10 shadow-sm">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Badge de selección */}
                    {isActive ? (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-gold-400 text-carbon-950 text-[8px] font-mono font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-carbon-950" />
                        {language === 'ES' ? 'ACTIVO' : 'ACTIVE'}
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 px-1.5 py-0.5 rounded bg-carbon-950/85 backdrop-blur-sm text-[8px] font-mono text-gold-400 border border-gold-500/30">
                        {language === 'ES' ? 'Elegir' : 'Select'}
                      </span>
                    )}
                  </div>

                  {/* Cuerpo de la Tarjeta: Marca, Modelo, Categoría y Año */}
                  <div className="space-y-0.5 min-w-0 flex-grow flex flex-col justify-start">
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider text-gold-400 truncate"
                      title={veh.brand}
                    >
                      {veh.brand}
                    </div>
                    <div
                      className="text-xs sm:text-[13px] font-bold text-silver-100 truncate leading-tight font-display"
                      title={veh.model}
                    >
                      {veh.model}
                    </div>
                    <div className="text-[9px] text-silver-400 uppercase tracking-wider font-mono truncate">
                      {veh.category.replace('_', ' ')} • {veh.year}
                    </div>
                  </div>

                  {/* Parte Inferior: Tarifa Diaria e Indicador de Barra Dorada */}
                  <div className="mt-2 pt-2 border-t border-carbon-800/80 w-full flex-shrink-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs sm:text-[12px] font-extrabold font-mono text-silver-100">
                        {formatPrice(veh.pricePerDay)}
                      </span>
                      <span className="text-[9px] text-silver-400 font-mono uppercase">
                        /{t.detail.day.charAt(0)}
                      </span>
                    </div>

                    {/* Barra de Acento Dorado (Activa vs Inactiva) */}
                    <div
                      className={`w-full h-1 rounded-full mt-1.5 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-400 via-gold-300 to-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                          : 'bg-carbon-800/60 group-hover:bg-carbon-700'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Indicadores de Puntos Paginadores en Móvil */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2 max-w-full overflow-x-auto py-1 scrollbar-none">
            {showroomVehicles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectCar(idx)}
                className={`transition-all duration-300 rounded-full flex-shrink-0 ${
                  currentIndex === idx
                    ? 'w-6 h-1.5 bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]'
                    : 'w-1.5 h-1.5 bg-carbon-750 hover:bg-silver-500'
                }`}
                aria-label={`Ir al vehículo ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
