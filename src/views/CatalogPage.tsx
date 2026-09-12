import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  ChevronRight, 
  Sparkles
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import { useVehicleFilters, SortOption } from '../hooks/useVehicleFilters';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import { CatalogSkeleton } from '../components/catalog/CatalogSkeleton';
import { CatalogEmptyState } from '../components/catalog/CatalogEmptyState';
import { VehicleCard } from '../components/common/VehicleCard';

interface CatalogPageProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onQuickBook: (vehicle: Vehicle) => void;
  onNavigateHome: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  vehicles,
  onSelectVehicle,
  onQuickBook,
  onNavigateHome,
}) => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    filters,
    filteredVehicles,
    activeFiltersCount,
    categoryCounts,
    statusCounts,
    absoluteMinPrice,
    absoluteMaxPrice,
    setSearchQuery,
    setSelectedCategory,
    setSelectedStatus,
    setSelectedTransmission,
    setSelectedFuel,
    setMinSeats,
    setMaxPrice,
    setSortBy,
    resetFilters,
  } = useVehicleFilters(vehicles);

  // Micro-transición suave de carga al alternar categorías (Regla 15: loading state visual)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.selectedCategory]);

  const availableCount = statusCounts['AVAILABLE'] || 0;

  return (
    <div className="min-h-screen bg-carbon-950 pt-28 pb-20 text-silver-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation (Regla 17: SEO y navegación clara) */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-silver-400">
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
            <li className="text-gold-400 font-medium" aria-current="page">
              Catálogo de Vehículos
            </li>
          </ol>
        </nav>

        {/* Cabecera Editorial del Catálogo */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-carbon-850">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLECCIÓN BOUTIQUE 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-silver-100 uppercase font-display tracking-tight">
              Flota de Alto Rendimiento
            </h1>
            <p className="mt-3 text-sm sm:text-base text-silver-400 max-w-2xl leading-relaxed">
              Explora nuestra cuidada selección de superdeportivos, SUVs de ultra-lujo y sedanes ejecutivos. Cada unidad se entrega con cobertura total y en estado de conservación de museo.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 sm:gap-6 bg-carbon-900/60 border border-carbon-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-silver-100 font-mono">
                {vehicles.length}
              </div>
              <div className="text-[11px] text-silver-400 uppercase tracking-wider">
                Total Flota
              </div>
            </div>
            <div className="h-8 w-px bg-carbon-800" />
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {availableCount}
              </div>
              <div className="text-[11px] text-silver-400 uppercase tracking-wider">
                Disponibles
              </div>
            </div>
            <div className="h-8 w-px bg-carbon-800" />
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-gold-400 font-mono">
                100%
              </div>
              <div className="text-[11px] text-silver-400 uppercase tracking-wider">
                Garantía VIP
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Herramientas: Buscador en Vivo, Ordenamiento y Controles */}
        <div className="py-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Buscador en Vivo */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-500" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo o especificación (ej. GT3, V8)..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-carbon-900 border border-carbon-800 rounded-xl text-xs sm:text-sm text-silver-100 placeholder-silver-500 focus:outline-none focus:border-gold-500/60 transition-colors shadow-inner"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-silver-500 hover:text-silver-200"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controles: Filtros Móviles, Ordenamiento y Vistas */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            
            {/* Botón de Filtros para Móvil */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-800 text-xs font-semibold text-silver-200 hover:border-gold-500/40 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-gold-400" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold-500 text-carbon-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Selector de Ordenamiento */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-silver-400 whitespace-nowrap">
                Ordenar por:
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-carbon-900 border border-carbon-800 rounded-xl px-3 py-2 text-xs font-medium text-silver-200 focus:outline-none focus:border-gold-500/60 cursor-pointer"
                aria-label="Criterio de ordenamiento"
              >
                <option value="featured">Destacados de la Flota</option>
                <option value="price_asc">Tarifa: Menor a Mayor</option>
                <option value="price_desc">Tarifa: Mayor a Menor</option>
                <option value="power_desc">Potencia (Caballos de Fuerza)</option>
                <option value="year_desc">Año: Más Reciente</option>
              </select>
            </div>

            {/* Alternador de Vista (Grid / List) */}
            <div className="hidden sm:flex items-center bg-carbon-900 border border-carbon-800 rounded-xl p-1">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'grid'
                    ? 'bg-carbon-800 text-gold-400 shadow-sm'
                    : 'text-silver-500 hover:text-silver-300'
                }`}
                title="Vista de cuadrícula"
                aria-label="Vista de cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'list'
                    ? 'bg-carbon-800 text-gold-400 shadow-sm'
                    : 'text-silver-500 hover:text-silver-300'
                }`}
                title="Vista de lista extendida"
                aria-label="Vista de lista extendida"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Chips de Filtros Activos para fácil eliminación */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 pt-2">
            <span className="text-xs text-silver-500">Filtros activos:</span>
            {filters.selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-carbon-850 border border-carbon-750 text-xs text-silver-300">
                Categoría: {filters.selectedCategory}
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:text-gold-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.selectedStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-carbon-850 border border-carbon-750 text-xs text-silver-300">
                Estado: {filters.selectedStatus}
                <button
                  onClick={() => setSelectedStatus('ALL')}
                  className="hover:text-gold-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.selectedTransmission !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-carbon-850 border border-carbon-750 text-xs text-silver-300">
                Transmisión: {filters.selectedTransmission}
                <button
                  onClick={() => setSelectedTransmission('ALL')}
                  className="hover:text-gold-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.selectedFuel !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-carbon-850 border border-carbon-750 text-xs text-silver-300">
                Combustible: {filters.selectedFuel}
                <button
                  onClick={() => setSelectedFuel('ALL')}
                  className="hover:text-gold-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minSeats > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-carbon-850 border border-carbon-750 text-xs text-silver-300">
                Plazas: {filters.minSeats}+
                <button
                  onClick={() => setMinSeats(0)}
                  className="hover:text-gold-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxPrice < absoluteMaxPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-carbon-850 border border-carbon-750 text-xs text-silver-300">
                Máx: ${filters.maxPrice}/día
                <button
                  onClick={() => setMaxPrice(absoluteMaxPrice)}
                  className="hover:text-gold-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-gold-400 hover:text-gold-300 font-medium ml-2 underline underline-offset-4"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Layout Principal: Filtros + Resultados */}
        <div className="flex gap-8 items-start mt-2">
          
          {/* Panel de Filtros Lateral (Desktop) y Drawer (Móvil) */}
          <CatalogFilters
            filters={filters}
            activeFiltersCount={activeFiltersCount}
            categoryCounts={categoryCounts}
            statusCounts={statusCounts}
            absoluteMinPrice={absoluteMinPrice}
            absoluteMaxPrice={absoluteMaxPrice}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
            onTransmissionChange={setSelectedTransmission}
            onFuelChange={setSelectedFuel}
            onSeatsChange={setMinSeats}
            onMaxPriceChange={setMaxPrice}
            onResetFilters={resetFilters}
            isMobileOpen={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
          />

          {/* Contenedor de Resultados del Catálogo */}
          <div className="flex-1 w-full min-w-0">
            
            {/* Barra de Conteo de Resultados */}
            <div className="mb-6 flex items-center justify-between text-xs text-silver-400">
              <div>
                Mostrando <span className="text-gold-400 font-bold">{filteredVehicles.length}</span> de <span className="text-silver-200">{vehicles.length}</span> vehículos disponibles
              </div>
            </div>

            {/* Renderizado de Estados (Regla 15: Loading, Empty, Success) */}
            {isLoading ? (
              <CatalogSkeleton count={6} />
            ) : filteredVehicles.length === 0 ? (
              <CatalogEmptyState
                onResetFilters={resetFilters}
                searchQuery={filters.searchQuery}
              />
            ) : (
              <div
                className={
                  layoutMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                    : 'flex flex-col space-y-6'
                }
              >
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    layoutMode={layoutMode}
                    onSelectVehicle={onSelectVehicle}
                    onQuickBook={onQuickBook}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
