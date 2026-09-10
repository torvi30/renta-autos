import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight, Gauge, Zap, Flame, ShieldCheck } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { VehicleTurntable360 } from '../showcase/VehicleTurntable360';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

interface HeroSectionProps {
  featuredVehicles: Vehicle[];
  onExploreFleet: () => void;
  onSelectVehicleForBooking: (vehicle: Vehicle) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredVehicles,
  onExploreFleet,
  onSelectVehicleForBooking,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeVehicle = featuredVehicles[selectedIndex] || featuredVehicles[0];

  return (
    <section className="relative min-h-[92vh] pt-28 pb-16 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-carbon-950 via-carbon-900 to-carbon-950">
      {/* Luz ambiental radial de showroom (Spotlight de techo) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-gold-500/10 via-gold-500/5 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Cabecera del Hero según requerimiento exacto */}
        <div className="text-center max-w-3xl mx-auto mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-carbon-850/80 border border-gold-500/20 text-xs font-semibold tracking-widest text-gold-400 uppercase mb-4 shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
            SHOWROOM DIGITAL 2026
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase font-display leading-[1.05]">
            TU VIAJE. <br />
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 bg-clip-text text-transparent">
              TU VEHÍCULO.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-silver-300 font-light max-w-xl mx-auto">
            Encuentra el vehículo perfecto para tu próximo viaje. Experimenta el lujo, la potencia y un servicio concierge inigualable.
          </p>

          {/* Botones de acción principales */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onExploreFleet}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              VER VEHÍCULOS
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSelectVehicleForBooking(activeVehicle)}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              RESERVAR AHORA
            </Button>
          </div>
        </div>

        {/* PROTAGONISTA VISUAL: VehicleTurntable360 con pedestal iluminado y control de giro */}
        <div className="relative max-w-5xl mx-auto mt-2">
          {/* Tarjeta flotante de información del auto activo */}
          <div className="absolute top-4 left-4 z-40 hidden sm:flex items-center gap-3 p-3 rounded-xl bg-carbon-950/80 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
                {activeVehicle.brand}
              </span>
              <span className="text-base font-bold text-silver-100">
                {activeVehicle.model} ({activeVehicle.year})
              </span>
            </div>
            <div className="h-6 w-px bg-carbon-750" />
            <div className="flex flex-col">
              <span className="text-[10px] text-silver-400">Tarifa por día</span>
              <span className="text-sm font-bold text-silver-100">
                {formatCurrency(activeVehicle.pricePerDay)} <span className="text-[10px] text-silver-400 font-normal">/ 24h</span>
              </span>
            </div>
            <StatusBadge status={activeVehicle.status} />
          </div>

          {/* Plato giratorio 360 interactivo */}
          <VehicleTurntable360
            vehicle={activeVehicle}
            className="shadow-showroom"
          />

          {/* Especificaciones clave debajo del showcase */}
          {activeVehicle.specs && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-carbon-900/60 p-3.5 rounded-xl border border-carbon-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2.5 px-3">
                <Zap className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-silver-400">Aceleración 0-100</div>
                  <div className="text-sm font-bold text-silver-100">{activeVehicle.specs.acceleration0to100 || '3.4 s'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <Flame className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-silver-400">Potencia</div>
                  <div className="text-sm font-bold text-silver-100">{activeVehicle.specs.horsepower} HP</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <Gauge className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-silver-400">Velocidad Máx.</div>
                  <div className="text-sm font-bold text-silver-100">{activeVehicle.specs.topSpeed} km/h</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 border-l border-carbon-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-silver-400">Garantía Flota</div>
                  <div className="text-sm font-bold text-silver-100">Seguro Integral</div>
                </div>
              </div>
            </div>
          )}

          {/* Selector interactivo de modelos en el Hero */}
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
            {featuredVehicles.slice(0, 4).map((veh, idx) => (
              <button
                key={veh.id}
                onClick={() => setSelectedIndex(idx)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
                  selectedIndex === idx
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/60 shadow-sm'
                    : 'bg-carbon-900/80 text-silver-400 border border-carbon-800 hover:border-carbon-700 hover:text-silver-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedIndex === idx ? 'bg-gold-400' : 'bg-carbon-600'}`} />
                <span>{veh.brand} {veh.model.split(' ')[0]}</span>
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
