import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

interface CatalogEmptyStateProps {
  onResetFilters: () => void;
  searchQuery?: string;
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  onResetFilters,
  searchQuery,
}) => {
  return (
    <div className="py-20 px-6 text-center bg-carbon-900/40 rounded-3xl border border-carbon-800/80 backdrop-blur-md max-w-2xl mx-auto my-8">
      {/* Icon with subtle halo */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-carbon-850 border border-carbon-750 flex items-center justify-center shadow-lg shadow-gold-500/5 mb-5">
        <SearchX className="w-8 h-8 text-gold-400/80" />
      </div>

      <h3 className="text-xl font-bold text-silver-100 font-display uppercase tracking-wider">
        Ningún vehículo coincide con tu búsqueda
      </h3>

      <p className="mt-3 text-sm text-silver-400 max-w-md mx-auto leading-relaxed">
        {searchQuery ? (
          <>
            No encontramos resultados para el término <span className="text-gold-400 font-medium">"{searchQuery}"</span> con los filtros activos.
          </>
        ) : (
          'No hay vehículos en la flota que cumplan con la combinación actual de filtros seleccionados.'
        )}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          variant="primary"
          onClick={onResetFilters}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Restablecer Filtros
        </Button>
      </div>

      <p className="mt-6 text-xs text-silver-500">
        Tip: Intenta ampliar el rango de precio diario o seleccionar todas las categorías.
      </p>
    </div>
  );
};
