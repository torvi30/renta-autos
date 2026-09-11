import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleStatus } from '../../types/vehicle';
import { formatCurrency, getCategoryLabel } from '../../utils/formatters';
import {
  ExternalLink,
  Wrench,
  Shield,
  Zap,
  Search,
  Camera,
  Video,
  DollarSign,
  Car,
  CheckCircle2,
} from 'lucide-react';

interface AdminFleetViewProps {
  vehicles: Vehicle[];
  onUpdateVehicleStatus: (vehicleId: string, newStatus: VehicleStatus) => void;
  onNavigateToVehicleDetail: (slug: string) => void;
}

export const AdminFleetView: React.FC<AdminFleetViewProps> = ({
  vehicles,
  onUpdateVehicleStatus,
  onNavigateToVehicleDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        v.brand.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search) ||
        v.plate.toLowerCase().includes(search);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [vehicles, categoryFilter, statusFilter, searchTerm]);

  // KPIs de Flota
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const rentedCount = vehicles.filter((v) => v.status === 'RENTED').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. KPIs de la Flota */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Flota Total
            </span>
            <div className="text-2xl font-bold font-display text-silver-100 mt-1">
              {totalCount} Unidades
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              100% Superdeportivos & Ultra-Lujo
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Disponibles para Renta
            </span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
              {availableCount}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Listos para entrega inmediata</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Alquilados en Calle
            </span>
            <div className="text-2xl font-bold font-display text-blue-400 mt-1">
              {rentedCount}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              En servicio con clientes
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              En Mantenimiento
            </span>
            <div className="text-2xl font-bold font-display text-amber-400 mt-1">
              {maintenanceCount}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              Taller preventivo / Detailing
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-silver-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por marca, modelo o placa..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-carbon-850 border border-carbon-750 text-silver-200 text-xs focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Filtros por Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'Todas las Categorías' },
            { id: 'DEPORTIVO', label: 'Deportivos' },
            { id: 'SUV_LUJO', label: 'SUVs de Lujo' },
            { id: 'SEDAN_EJECUTIVO', label: 'Sedanes' },
            { id: 'EXOTICO', label: 'Exóticos' },
            { id: 'CONVERTIBLE', label: 'Convertibles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-silver-400 hover:text-silver-200 hover:bg-carbon-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Filtro por Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-carbon-850 border border-carbon-700 text-silver-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500 ml-2"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="AVAILABLE">🟢 Solo Disponibles</option>
            <option value="RENTED">🔵 Solo Alquilados</option>
            <option value="MAINTENANCE">🟠 Solo Mantenimiento</option>
          </select>
        </div>

      </div>

      {/* 3. Grid de Vehículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle) => {
          const isMaintenance = vehicle.status === 'MAINTENANCE';

          // Contadores de recursos según Regla 8 (Máx 12 fotos y 1 video)
          const totalPhotos =
            (vehicle.gallery?.exteriorImages.length || 0) +
            (vehicle.gallery?.interiorImages.length || 0) +
            (vehicle.gallery?.detailImages.length || 0) || 12;

          return (
            <div
              key={vehicle.id}
              className={`rounded-2xl bg-carbon-900 border transition-all overflow-hidden flex flex-col justify-between group ${
                isMaintenance
                  ? 'border-amber-800/60 shadow-md'
                  : 'border-carbon-800 hover:border-gold-500/40'
              }`}
            >
              {/* Imagen y Badges */}
              <div className="relative aspect-video bg-carbon-950 overflow-hidden">
                <img
                  src={vehicle.mainImage}
                  alt={vehicle.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Degradado oscuro inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-transparent to-transparent opacity-80" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-carbon-950/80 backdrop-blur-md text-gold-400 border border-gold-500/30">
                    {getCategoryLabel(vehicle.category)}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-silver-200 bg-carbon-900/90 border border-carbon-700">
                    {vehicle.plate}
                  </span>
                </div>

                {/* Contadores de Recursos (Regla 8 y 9) */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-[10px] text-silver-300">
                  <span className="inline-flex items-center gap-1 bg-carbon-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-carbon-700">
                    <Camera className="w-3 h-3 text-gold-400" />
                    <span>{totalPhotos}/12 Fotos</span>
                  </span>
                  {vehicle.videoUrl && (
                    <span className="inline-flex items-center gap-1 bg-carbon-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-carbon-700 text-emerald-400">
                      <Video className="w-3 h-3" />
                      <span>Video 15s HD</span>
                    </span>
                  )}
                </div>

                {isMaintenance && (
                  <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                    <div className="bg-carbon-950/90 border border-amber-500/50 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xl">
                      <Wrench className="w-4 h-4" />
                      <span>En Programa de Mantenimiento</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Datos Técnicos y Tarifas */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                    {vehicle.brand}
                  </div>
                  <h4 className="text-base font-bold text-silver-100 font-display truncate">
                    {vehicle.model}
                  </h4>
                  <div className="text-sm font-bold font-mono text-gold-400 mt-1">
                    {formatCurrency(vehicle.pricePerDay)} <span className="text-silver-500 font-normal text-xs">/ día</span>
                  </div>

                  {/* Micro-telemetría */}
                  <div className="flex items-center gap-3 text-[11px] text-silver-400 mt-2.5 pt-2.5 border-t border-carbon-800">
                    {vehicle.specs?.horsepower && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-gold-400" />
                        {vehicle.specs.horsepower} CV
                      </span>
                    )}
                    {vehicle.specs?.acceleration0to100 && (
                      <span>0-100: {vehicle.specs.acceleration0to100}</span>
                    )}
                  </div>
                </div>

                {/* Selector de Estado Operativo */}
                <div className="space-y-2 pt-2 border-t border-carbon-800">
                  <label className="block text-[10px] uppercase font-semibold text-silver-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-gold-400" />
                    Estado Operativo
                  </label>

                  <select
                    value={vehicle.status}
                    onChange={(e) =>
                      onUpdateVehicleStatus(vehicle.id, e.target.value as VehicleStatus)
                    }
                    className="w-full text-xs bg-carbon-850 border border-carbon-700 text-silver-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-gold-500 transition-colors cursor-pointer"
                  >
                    <option value="AVAILABLE">🟢 Disponible (Habilitado para Renta)</option>
                    <option value="RENTED">🔵 Alquilado (En uso de Cliente)</option>
                    <option value="MAINTENANCE">🟠 En Mantenimiento (Bloqueado)</option>
                    <option value="INACTIVE">⚫ Inactivo (Oculto)</option>
                  </select>

                  <button
                    onClick={() => onNavigateToVehicleDetail(vehicle.slug)}
                    className="w-full py-2 text-center text-xs font-semibold text-silver-400 hover:text-gold-400 flex items-center justify-center gap-1.5 hover:bg-carbon-850 rounded-xl transition-colors border border-transparent hover:border-carbon-750"
                  >
                    <span>Inspeccionar Ficha Showroom</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
