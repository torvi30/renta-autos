import React from 'react';
import { Users, Fuel, Settings2, ArrowRight } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { VehicleShowcase } from '../showcase/VehicleShowcase';
import { StatusBadge } from './Badge';
import { Button } from './Button';
import { formatCurrency, getCategoryLabel } from '../../utils/formatters';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onQuickBook?: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onSelectVehicle,
  onQuickBook,
}) => {
  return (
    <article className="group relative flex flex-col rounded-2xl bg-carbon-900 border border-carbon-800/80 hover:border-gold-500/40 transition-all duration-500 hover:shadow-showroom overflow-hidden">
      
      {/* Contenedor del Showcase con Video Loop y fallback de foto */}
      <div className="relative w-full overflow-hidden bg-carbon-950">
        <VehicleShowcase
          videoUrl={vehicle.videoUrl}
          imageUrl={vehicle.mainImage}
          altText={`${vehicle.brand} ${vehicle.model}`}
          aspectRatio="16/9"
          autoPlay={true}
          showControls={false}
          className="border-none rounded-b-none"
        />

        {/* Categoría y Estado flotantes */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <StatusBadge status={vehicle.status} />
        </div>

        <div className="absolute top-3 left-3 z-20">
          <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-carbon-950/80 text-silver-300 border border-white/10 backdrop-blur-md">
            {getCategoryLabel(vehicle.category)}
          </span>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between">
        <div>
          {/* Marca, Modelo y Año */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                {vehicle.brand}
              </span>
              <h3 className="text-xl font-bold text-silver-100 font-display mt-0.5 group-hover:text-gold-300 transition-colors">
                {vehicle.model}
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-carbon-800 text-silver-400 font-mono">
              {vehicle.year}
            </span>
          </div>

          <p className="mt-2 text-xs text-silver-400 line-clamp-2 leading-relaxed">
            {vehicle.description}
          </p>

          {/* Especificaciones clave (Transmisión, Combustible, Plazas) */}
          <div className="mt-4 pt-4 border-t border-carbon-800 grid grid-cols-3 gap-2 text-center text-xs text-silver-400">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-carbon-850/60 border border-carbon-800/40">
              <Settings2 className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[11px] text-silver-200 capitalize">
                {vehicle.transmission === 'AUTOMATICA' ? 'Automática' : 'Manual'}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-carbon-850/60 border border-carbon-800/40">
              <Fuel className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[11px] text-silver-200 capitalize">
                {vehicle.fuel.toLowerCase()}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-carbon-850/60 border border-carbon-800/40">
              <Users className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[11px] text-silver-200">
                {vehicle.seats} Plazas
              </span>
            </div>
          </div>
        </div>

        {/* Precio y Botón de Acción */}
        <div className="mt-6 pt-4 border-t border-carbon-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-silver-400">Tarifa diaria</div>
            <div className="text-lg font-bold text-silver-100 font-mono">
              {formatCurrency(vehicle.pricePerDay)}
              <span className="text-xs font-normal text-silver-400"> / día</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onQuickBook && (
              <button
                onClick={() => onQuickBook(vehicle)}
                className="p-2 rounded-lg bg-carbon-850 hover:bg-gold-500/20 text-silver-300 hover:text-gold-400 border border-carbon-750 transition-colors text-xs font-medium"
                title="Reservar rápidamente"
                aria-label={`Reservar ${vehicle.brand} ${vehicle.model}`}
              >
                Reservar
              </button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSelectVehicle(vehicle)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              VER VEHÍCULO
            </Button>
          </div>
        </div>

      </div>
    </article>
  );
};
