import React from 'react';
import { Users, Fuel, Settings2, ArrowRight, Zap, Gauge, CalendarClock } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { VehicleShowcase } from '../showcase/VehicleShowcase';
import { StatusBadge } from './Badge';
import { Button } from './Button';
import { getCategoryLabel } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onQuickBook?: (vehicle: Vehicle) => void;
  layoutMode?: 'grid' | 'list';
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onSelectVehicle,
  onQuickBook,
  layoutMode = 'grid',
}) => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const isAvailable = vehicle.status === 'AVAILABLE';
  const isRented = vehicle.status === 'RENTED';
  const isMaintenance = vehicle.status === 'MAINTENANCE';

  const isList = layoutMode === 'list';

  return (
    <article
      className={`group relative flex rounded-2xl bg-carbon-900 border border-carbon-800/80 hover:border-gold-500/40 transition-all duration-500 hover:shadow-showroom overflow-hidden ${
        isList ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {/* Contenedor del Showcase con Video Loop y fallback de foto */}
      <div className={`relative overflow-hidden bg-carbon-950 ${isList ? 'w-full md:w-5/12 lg:w-4/12' : 'w-full'}`}>
        <VehicleShowcase
          videoUrl={vehicle.videoUrl}
          imageUrl={vehicle.mainImage}
          altText={`${vehicle.brand} ${vehicle.model}`}
          aspectRatio={isList ? '16/9' : '16/9'}
          autoPlay={true}
          showControls={false}
          className="border-none rounded-none h-full"
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

        {/* Mini badge flotante de aceleración y HP en hover */}
        {vehicle.specs && (
          <div className="absolute bottom-3 left-3 right-3 z-20 hidden group-hover:flex items-center justify-between text-[11px] font-mono font-medium text-silver-200 px-3 py-1.5 rounded-lg bg-carbon-950/90 border border-gold-500/30 backdrop-blur-md transition-all animate-fade-in">
            {vehicle.specs.horsepower && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold-400" />
                {vehicle.specs.horsepower} CV
              </span>
            )}
            {vehicle.specs.acceleration0to100 && (
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-gold-400" />
                0-100 en {vehicle.specs.acceleration0to100}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className={`flex flex-col flex-1 p-5 sm:p-6 justify-between ${isList ? 'md:py-6 md:px-8' : ''}`}>
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
            <span className="text-xs px-2.5 py-0.5 rounded bg-carbon-800 text-silver-400 font-mono">
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
              {formatPrice(vehicle.pricePerDay)}
              <span className="text-xs font-normal text-silver-400"> {t.specs.perDay}</span>
            </div>
          </div>


          <div className="flex items-center gap-2">
            {isAvailable ? (
              <>
                {onQuickBook && (
                  <button
                    onClick={() => onQuickBook(vehicle)}
                    className="p-2 px-3 rounded-lg bg-carbon-850 hover:bg-gold-500/20 text-silver-300 hover:text-gold-400 border border-carbon-750 transition-colors text-xs font-medium whitespace-nowrap"
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
                  VER DETALLE
                </Button>
              </>
            ) : isRented ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectVehicle(vehicle)}
                icon={<CalendarClock className="w-3.5 h-3.5 text-blue-400" />}
              >
                CONSULTAR FECHA
              </Button>
            ) : isMaintenance ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectVehicle(vehicle)}
              >
                EN MANTENIMIENTO
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectVehicle(vehicle)}
              >
                VER FICHA TÉCNICA
              </Button>
            )}
          </div>
        </div>

      </div>
    </article>
  );
};
