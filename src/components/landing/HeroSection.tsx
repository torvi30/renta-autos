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
import { VehicleTurntable360 } from '../showcase/VehicleTurntable360';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';

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
  // Los 8 vehículos boutique principales para el Showroom Turntable Pavilion
  const showroomVehicles = useMemo(() => vehicles.slice(0, 8), [vehicles]);

  // Por defecto, index 0 es el Rolls-Royce Ghost Black Badge (el vehículo más elegante de la flota)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Sincronización si se selecciona desde el exterior
  useEffect(() => {
    if (currentVehicleId) {
      const idx = showroomVehicles.findIndex((v) => v.id === currentVehicleId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [currentVehicleId, showroomVehicles]);

  const activeVehicle = showroomVehicles[currentIndex] || showroomVehicles[0];

  const prevIndex = (currentIndex - 1 + showroomVehicles.length) % showroomVehicles.length;
  const nextIndex = (currentIndex + 1) % showroomVehicles.length;
  const prevVehicle = showroomVehicles[prevIndex];
  const nextVehicle = showroomVehicles[nextIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = (prev + 1) % showroomVehicles.length;
      if (onVehicleChange) onVehicleChange(showroomVehicles[nextIdx]);
      return nextIdx;
    });
  }, [showroomVehicles, onVehicleChange]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[96vh] pt-28 pb-16 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-carbon-950 via-carbon-900 to-carbon-950"
    >
      {/* Luz ambiental cenital de concesionario showroom VIP */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-gold-500/20 via-gold-500/5 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Cabecera Editorial del Concesionario Showroom */}
        <div className="text-center max-w-3xl mx-auto mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-carbon-850/90 border border-gold-500/40 text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 shadow-lg shadow-gold-500/5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span>{settings.hero?.badge || 'CONCESIONARIO SHOWROOM VIP 360° • FLOTA 2026'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase font-display leading-[1.05]">
            {settings.hero?.titleLine1 || 'TU VIAJE.'} <br />
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">
              {settings.hero?.titleLine2 || 'TU VEHÍCULO.'}
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-silver-300 font-light max-w-2xl mx-auto">
            {settings.hero?.description || 'Gira cada vehículo en 360° sobre nuestro plato giratorio de exhibición. Usa las flechas o la barra inferior para pasar de un auto a otro, y haz clic para ver su ficha técnica y galería completa.'}
          </p>
        </div>

        {/* PROTAGONISTA VISUAL: Escenario Showroom 3D con Navegación Cinemática */}
        <div className="relative max-w-5xl mx-auto mt-2">
          
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
              <span className="text-[10px] text-silver-400">Tarifa por día</span>
              <span className="text-sm font-bold text-silver-100 font-mono">
                {formatCurrency(activeVehicle.pricePerDay)} <span className="text-[10px] text-silver-400 font-normal">/ 24h</span>
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

          {/* Plato giratorio 360 interactivo del auto activo estilo concesionario */}
          <div className="relative transition-all duration-500">
            <VehicleTurntable360
              key={activeVehicle.id}
              vehicle={activeVehicle}
              className="shadow-showroom"
              onOpenDetail={onSelectVehicleForModal}
            />
          </div>

          {/* Especificaciones clave de telemetría debajo del showcase */}
          {activeVehicle.specs && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-carbon-900/80 p-3.5 rounded-2xl border border-carbon-800/80 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2.5 px-3">
                <Zap className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">0 a 100 km/h</div>
                  <div className="text-sm font-bold text-silver-100 font-mono transition-all">
                    {activeVehicle.specs.acceleration0to100 || '3.2 s'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <Flame className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">Potencia</div>
                  <div className="text-sm font-bold text-silver-100 font-mono transition-all">
                    {activeVehicle.specs.horsepower} HP
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <Gauge className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">Velocidad Máx.</div>
                  <div className="text-sm font-bold text-silver-100 font-mono transition-all">
                    {activeVehicle.specs.topSpeed} km/h
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-silver-400 uppercase tracking-wider">Garantía Flota</div>
                  <div className="text-sm font-bold text-silver-100">Seguro Integral</div>
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
              RESERVAR ESTE VEHÍCULO ({formatCurrency(activeVehicle.pricePerDay)}/día)
            </Button>
            
            <Button
              variant="outline"
              size="md"
              onClick={() => onSelectVehicleForModal(activeVehicle)}
              icon={<Eye className="w-4 h-4" />}
            >
              VER FICHA TÉCNICA & GALERÍA COMPLETA (12 FOTOS)
            </Button>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-500/40 text-xs font-semibold tracking-wider transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CONSULTA VIP POR WHATSAPP</span>
            </a>
          </div>

          {/* VIP DOCK: Carrusel interactivo de los 8 autos boutique giratorios */}
          <div className="mt-8 pt-6 border-t border-carbon-800/80">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-silver-400 uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-gold-400" />
                <span>EXHIBICIÓN SHOWROOM: ELIGE CUALQUIER VEHÍCULO PARA VERLO GIRAR</span>
                <span className="px-2 py-0.5 rounded-full bg-carbon-800 text-gold-400 font-mono text-[10px]">
                  0{currentIndex + 1} / 0{showroomVehicles.length}
                </span>
              </span>
              <span className="text-[11px] text-silver-500 hidden sm:inline">
                Usa las flechas ← → para cambiar de auto
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {showroomVehicles.map((veh, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <button
                    key={veh.id}
                    onClick={() => handleSelectCar(idx)}
                    className={`relative p-2 rounded-xl border text-left transition-all duration-300 group flex flex-col justify-between ${
                      isActive
                        ? 'bg-carbon-850 border-gold-400 ring-2 ring-gold-400/40 shadow-xl -translate-y-1 shadow-gold-500/10'
                        : 'bg-carbon-900/80 border-carbon-800 hover:border-gold-500/30 hover:bg-carbon-850'
                    }`}
                  >
                    {/* Indicador de activo */}
                    {isActive && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-gold-400 border-2 border-carbon-950 shadow-sm animate-ping" />
                    )}

                    {/* Miniatura */}
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-1.5 bg-carbon-950">
                      <img
                        src={veh.mainImage}
                        alt={veh.model}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isActive ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />
                    </div>

                    {/* Texto marca y modelo */}
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-gold-400 truncate">
                        {veh.brand}
                      </div>
                      <div className="text-[11px] font-bold text-silver-100 truncate">
                        {veh.model.split(' ')[0]} {veh.model.split(' ')[1] || ''}
                      </div>
                      <div className="text-[10px] text-silver-400 font-mono mt-0.5">
                        {formatCurrency(veh.pricePerDay)}/d
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
