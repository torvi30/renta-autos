import React from 'react';
import { X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { VehicleFilterState } from '../../hooks/useVehicleFilters';
import { formatCurrency } from '../../utils/formatters';

interface CatalogFiltersProps {
  filters: VehicleFilterState;
  activeFiltersCount: number;
  categoryCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  absoluteMinPrice: number;
  absoluteMaxPrice: number;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onTransmissionChange: (transmission: string) => void;
  onFuelChange: (fuel: string) => void;
  onSeatsChange: (seats: number) => void;
  onMaxPriceChange: (price: number) => void;
  onResetFilters: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Toda la Colección' },
  { key: 'DEPORTIVO', label: 'Deportivos' },
  { key: 'SUV_LUJO', label: 'SUVs de Lujo' },
  { key: 'EXOTICO', label: 'Superdeportivos' },
  { key: 'SEDAN_EJECUTIVO', label: 'Sedanes Ejecutivos' },
  { key: 'CONVERTIBLE', label: 'Convertibles' },
];

const TRANSMISSIONS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Cualquiera' },
  { key: 'AUTOMATICA', label: 'Automática' },
  { key: 'MANUAL', label: 'Manual' },
];

const FUELS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Cualquiera' },
  { key: 'GASOLINA', label: 'Gasolina' },
  { key: 'HIBRIDO', label: 'Híbrido' },
  { key: 'ELECTRICO', label: '100% Eléctrico' },
];

const SEAT_OPTIONS: { count: number; label: string }[] = [
  { count: 0, label: 'Cualquiera' },
  { count: 2, label: '2+ Plazas' },
  { count: 4, label: '4+ Plazas' },
  { count: 5, label: '5+ Plazas' },
];

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  activeFiltersCount,
  categoryCounts,
  statusCounts,
  absoluteMinPrice,
  absoluteMaxPrice,
  onCategoryChange,
  onStatusChange,
  onTransmissionChange,
  onFuelChange,
  onSeatsChange,
  onMaxPriceChange,
  onResetFilters,
  isMobileOpen,
  onCloseMobile,
}) => {
  const content = (
    <div className="space-y-7">
      {/* Header del panel de filtros */}
      <div className="flex items-center justify-between pb-4 border-b border-carbon-800">
        <div className="flex items-center gap-2 text-silver-100 font-bold text-sm tracking-wider uppercase font-display">
          <SlidersHorizontal className="w-4 h-4 text-gold-400" />
          <span>Filtros de Precisión</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-gold-500 text-carbon-950 text-[11px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Categoría de Vehículo */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400">
          Categoría
        </h4>
        <div className="space-y-1.5">
          {CATEGORIES.map(cat => {
            const isSelected = filters.selectedCategory === cat.key;
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/40 font-semibold'
                    : 'text-silver-400 hover:text-silver-200 hover:bg-carbon-850/60 border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-gold-500 text-carbon-950 font-bold' : 'bg-carbon-800 text-silver-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rango de Tarifa Diaria (Slider Interactivo) */}
      <div className="space-y-3 pt-3 border-t border-carbon-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-silver-400">
            Tarifa Máxima / Día
          </span>
          <span className="font-mono font-bold text-gold-400 bg-carbon-850 px-2 py-0.5 rounded border border-carbon-750">
            {formatCurrency(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={absoluteMinPrice || 500}
          max={absoluteMaxPrice || 2500}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full h-1.5 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
          aria-label="Filtro de tarifa máxima por día"
        />
        <div className="flex justify-between text-[11px] text-silver-500 font-mono">
          <span>{formatCurrency(absoluteMinPrice || 500)}</span>
          <span>{formatCurrency(absoluteMaxPrice || 2500)}</span>
        </div>
      </div>

      {/* 3. Disponibilidad / Estado Operativo */}
      <div className="space-y-3 pt-3 border-t border-carbon-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400">
          Disponibilidad
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'AVAILABLE', label: 'Disponibles', dot: 'bg-emerald-500' },
            { key: 'RENTED', label: 'Alquilados', dot: 'bg-blue-500' },
            { key: 'MAINTENANCE', label: 'Mantenimiento', dot: 'bg-amber-500' },
          ].map(st => {
            const isSelected = filters.selectedStatus === st.key;
            const count = statusCounts[st.key] || 0;
            return (
              <button
                key={st.key}
                onClick={() => onStatusChange(st.key)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-carbon-800 text-silver-100 border border-gold-500/40 shadow-sm'
                    : 'bg-carbon-850/40 text-silver-400 hover:text-silver-200 border border-carbon-800/60'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {st.dot && <span className={`w-2 h-2 rounded-full ${st.dot}`} />}
                  <span className="truncate">{st.label}</span>
                </span>
                <span className="text-[10px] text-silver-500 font-mono ml-1">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Transmisión */}
      <div className="space-y-3 pt-3 border-t border-carbon-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400">
          Transmisión
        </h4>
        <div className="flex gap-2">
          {TRANSMISSIONS.map(trans => {
            const isSelected = filters.selectedTransmission === trans.key;
            return (
              <button
                key={trans.key}
                onClick={() => onTransmissionChange(trans.key)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all text-center ${
                  isSelected
                    ? 'bg-carbon-800 text-gold-300 border border-gold-500/40 font-semibold'
                    : 'bg-carbon-850/40 text-silver-400 hover:text-silver-200 border border-carbon-800/60'
                }`}
              >
                {trans.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Tipo de Combustible */}
      <div className="space-y-3 pt-3 border-t border-carbon-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400">
          Combustible / Propulsión
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {FUELS.map(fuel => {
            const isSelected = filters.selectedFuel === fuel.key;
            return (
              <button
                key={fuel.key}
                onClick={() => onFuelChange(fuel.key)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-center truncate ${
                  isSelected
                    ? 'bg-carbon-800 text-gold-300 border border-gold-500/40 font-semibold'
                    : 'bg-carbon-850/40 text-silver-400 hover:text-silver-200 border border-carbon-800/60'
                }`}
              >
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Capacidad de Pasajeros (Plazas) */}
      <div className="space-y-3 pt-3 border-t border-carbon-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400">
          Plazas Mínimas
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {SEAT_OPTIONS.map(seat => {
            const isSelected = filters.minSeats === seat.count;
            return (
              <button
                key={seat.count}
                onClick={() => onSeatsChange(seat.count)}
                className={`py-2 rounded-xl text-xs font-medium transition-all text-center ${
                  isSelected
                    ? 'bg-gold-500 text-carbon-950 font-bold shadow-md shadow-gold-500/10'
                    : 'bg-carbon-850/40 text-silver-400 hover:text-silver-200 border border-carbon-800/60'
                }`}
              >
                {seat.count === 0 ? 'Todas' : `${seat.count}+`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Versión Desktop: Columna lateral fija */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-28 bg-carbon-900/90 border border-carbon-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          {content}
        </div>
      </aside>

      {/* Versión Mobile: Drawer deslizable con backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content panel */}
          <div className="relative w-full max-w-sm bg-carbon-900 border-l border-carbon-800 h-full p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-carbon-800 mb-6">
                <span className="text-sm font-bold uppercase tracking-wider text-silver-100 font-display">
                  Filtros de Catálogo
                </span>
                <button
                  onClick={onCloseMobile}
                  className="p-2 rounded-lg bg-carbon-850 text-silver-400 hover:text-silver-100 border border-carbon-750"
                  aria-label="Cerrar filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {content}
            </div>

            <div className="pt-6 mt-6 border-t border-carbon-800">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-sm tracking-wide transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
