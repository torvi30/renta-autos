import React, { useState, useMemo } from 'react';
import { Car } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { VehicleCard } from '../common/VehicleCard';
import { useLanguage } from '../../context/LanguageContext';

interface FeaturedFleetProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onQuickBook?: (vehicle: Vehicle) => void;
  onNavigateToCatalog?: () => void;
}

export const FeaturedFleet: React.FC<FeaturedFleetProps> = ({
  vehicles,
  onSelectVehicle,
  onQuickBook,
  onNavigateToCatalog,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { key: 'ALL', label: t.featured.allCollection },
    { key: 'DEPORTIVO', label: t.categories.sports },
    { key: 'SUV_LUJO', label: t.categories.suv },
    { key: 'EXOTICO', label: t.categories.exotic },
    { key: 'SEDAN_EJECUTIVO', label: t.categories.sedan },
  ];

  const filteredVehicles = useMemo(() => {
    if (selectedCategory === 'ALL') return vehicles;
    return vehicles.filter((v) => v.category === selectedCategory);
  }, [vehicles, selectedCategory]);

  return (
    <section id="showroom" className="pt-8 sm:pt-12 pb-20 bg-carbon-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold-400 uppercase mb-2">
              <Car className="w-4 h-4" />
              <span>{t.featured.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-silver-100 uppercase font-display">
              {t.featured.title}
            </h2>
            <p className="mt-2 text-sm text-silver-400 max-w-xl">
              {t.featured.description}
            </p>
          </div>

          {/* Filtros rápidos por categoría */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat.key
                    ? 'bg-gold-500 text-carbon-950 shadow-md shadow-gold-500/10'
                    : 'bg-carbon-900 text-silver-400 hover:text-silver-200 border border-carbon-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Vehículos */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelectVehicle={onSelectVehicle}
                onQuickBook={onQuickBook}
              />
            ))}
          </div>
        ) : (
          /* Estado vacío (Regla 15: empty state profesional) */
          <div className="py-16 text-center bg-carbon-900/40 rounded-2xl border border-carbon-800 p-8">
            <Car className="w-12 h-12 mx-auto text-silver-500 mb-3" />
            <h3 className="text-base font-bold text-silver-200">{t.featured.emptyTitle}</h3>
            <p className="text-xs text-silver-500 mt-1">{t.featured.emptySubtitle}</p>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-gold-400 border border-gold-500/30 rounded-lg hover:bg-gold-500/10 transition-colors"
            >
              {t.featured.viewAllBtn}
            </button>
          </div>
        )}

        {/* Banner / CTA hacia el Catálogo Completo */}
        {onNavigateToCatalog && (
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 border border-carbon-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl text-center sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-silver-100 font-display uppercase tracking-wider">
                {t.featured.bannerTitle}
              </h3>
              <p className="text-xs text-silver-400 mt-1">
                {t.featured.bannerSubtitle}
              </p>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-gold-500/10 hover:shadow-gold-500/20 whitespace-nowrap active:scale-98 text-center"
            >
              {t.featured.exploreCatalogBtn} ({vehicles.length})
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
