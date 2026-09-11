import { useState, useMemo, useEffect, useCallback } from 'react';
import { Vehicle } from '../types/vehicle';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'power_desc' | 'year_desc';

export interface VehicleFilterState {
  searchQuery: string;
  selectedCategory: string; // 'ALL' | VehicleCategory
  selectedStatus: string;   // 'ALL' | VehicleStatus
  selectedTransmission: string; // 'ALL' | TransmissionType
  selectedFuel: string;     // 'ALL' | FuelType
  minSeats: number;         // 0 = all
  maxPrice: number;
  sortBy: SortOption;
}

export const useVehicleFilters = (vehicles: Vehicle[]) => {
  // Calcular límites de precios basados en los datos reales
  const { absoluteMinPrice, absoluteMaxPrice } = useMemo(() => {
    if (vehicles.length === 0) return { absoluteMinPrice: 0, absoluteMaxPrice: 3000 };
    const prices = vehicles.map(v => v.pricePerDay);
    return {
      absoluteMinPrice: Math.min(...prices),
      absoluteMaxPrice: Math.max(...prices),
    };
  }, [vehicles]);

  // Inicializar estado desde la URL o valores por defecto
  const getInitialState = (): VehicleFilterState => {
    if (typeof window === 'undefined') {
      return {
        searchQuery: '',
        selectedCategory: 'ALL',
        selectedStatus: 'ALL',
        selectedTransmission: 'ALL',
        selectedFuel: 'ALL',
        minSeats: 0,
        maxPrice: absoluteMaxPrice || 3000,
        sortBy: 'featured',
      };
    }

    const params = new URLSearchParams(window.location.search);
    const urlPrice = params.get('maxPrice');

    return {
      searchQuery: params.get('q') || '',
      selectedCategory: params.get('category') || 'ALL',
      selectedStatus: params.get('status') || 'ALL',
      selectedTransmission: params.get('transmission') || 'ALL',
      selectedFuel: params.get('fuel') || 'ALL',
      minSeats: params.get('seats') ? Number(params.get('seats')) : 0,
      maxPrice: urlPrice ? Number(urlPrice) : (absoluteMaxPrice || 3000),
      sortBy: (params.get('sort') as SortOption) || 'featured',
    };
  };

  const [filters, setFilters] = useState<VehicleFilterState>(getInitialState);

  // Sincronizar con URL cada vez que cambien los filtros relevantes (Regla 17: SEO y URLs amigables)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (filters.selectedCategory !== 'ALL') params.set('category', filters.selectedCategory);
    if (filters.selectedStatus !== 'ALL') params.set('status', filters.selectedStatus);
    if (filters.selectedTransmission !== 'ALL') params.set('transmission', filters.selectedTransmission);
    if (filters.selectedFuel !== 'ALL') params.set('fuel', filters.selectedFuel);
    if (filters.minSeats > 0) params.set('seats', filters.minSeats.toString());
    if (filters.maxPrice < absoluteMaxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy !== 'featured') params.set('sort', filters.sortBy);

    const queryString = params.toString();
    const currentPath = window.location.pathname;
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

    // Solo actualizar el historial sin recargar la página
    if (window.location.search !== (queryString ? `?${queryString}` : '')) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [filters, absoluteMaxPrice]);

  // Actualizadores de estado individuales
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const setSelectedStatus = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, selectedStatus: status }));
  }, []);

  const setSelectedTransmission = useCallback((transmission: string) => {
    setFilters(prev => ({ ...prev, selectedTransmission: transmission }));
  }, []);

  const setSelectedFuel = useCallback((fuel: string) => {
    setFilters(prev => ({ ...prev, selectedFuel: fuel }));
  }, []);

  const setMinSeats = useCallback((seats: number) => {
    setFilters(prev => ({ ...prev, minSeats: seats }));
  }, []);

  const setMaxPrice = useCallback((price: number) => {
    setFilters(prev => ({ ...prev, maxPrice: price }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedCategory: 'ALL',
      selectedStatus: 'ALL',
      selectedTransmission: 'ALL',
      selectedFuel: 'ALL',
      minSeats: 0,
      maxPrice: absoluteMaxPrice,
      sortBy: 'featured',
    });
  }, [absoluteMaxPrice]);

  // Contar filtros activos distintos de los valores por defecto
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim() !== '') count++;
    if (filters.selectedCategory !== 'ALL') count++;
    if (filters.selectedStatus !== 'ALL') count++;
    if (filters.selectedTransmission !== 'ALL') count++;
    if (filters.selectedFuel !== 'ALL') count++;
    if (filters.minSeats > 0) count++;
    if (filters.maxPrice < absoluteMaxPrice) count++;
    return count;
  }, [filters, absoluteMaxPrice]);

  // Conteo de vehículos por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: vehicles.length };
    vehicles.forEach(v => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  // Conteo de vehículos por estado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: vehicles.length };
    vehicles.forEach(v => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  // Filtrado y ordenamiento optimizado (useMemo)
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(vehicle => {
        // 1. Búsqueda por texto (marca, modelo, descripción, features)
        if (filters.searchQuery.trim() !== '') {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchBrand = vehicle.brand.toLowerCase().includes(query);
          const matchModel = vehicle.model.toLowerCase().includes(query);
          const matchDesc = vehicle.description.toLowerCase().includes(query);
          const matchFeature = vehicle.features.some(f => f.toLowerCase().includes(query));
          if (!matchBrand && !matchModel && !matchDesc && !matchFeature) {
            return false;
          }
        }

        // 2. Filtro de Categoría
        if (filters.selectedCategory !== 'ALL' && vehicle.category !== filters.selectedCategory) {
          return false;
        }

        // 3. Filtro de Estado
        if (filters.selectedStatus !== 'ALL' && vehicle.status !== filters.selectedStatus) {
          return false;
        }

        // 4. Filtro de Transmisión
        if (filters.selectedTransmission !== 'ALL' && vehicle.transmission !== filters.selectedTransmission) {
          return false;
        }

        // 5. Filtro de Combustible
        if (filters.selectedFuel !== 'ALL' && vehicle.fuel !== filters.selectedFuel) {
          return false;
        }

        // 6. Filtro de Plazas mínimas
        if (filters.minSeats > 0 && vehicle.seats < filters.minSeats) {
          return false;
        }

        // 7. Filtro de Precio máximo
        if (vehicle.pricePerDay > filters.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return a.pricePerDay - b.pricePerDay;
          case 'price_desc':
            return b.pricePerDay - a.pricePerDay;
          case 'power_desc': {
            const hpA = a.specs?.horsepower || 0;
            const hpB = b.specs?.horsepower || 0;
            return hpB - hpA;
          }
          case 'year_desc':
            return b.year - a.year;
          case 'featured':
          default:
            // Destacados primero, luego por año más reciente
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.year - a.year;
        }
      });
  }, [vehicles, filters]);

  return {
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
  };
};
