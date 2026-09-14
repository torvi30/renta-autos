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
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface AdminFleetViewProps {
  vehicles: Vehicle[];
  onUpdateVehicleStatus: (vehicleId: string, newStatus: VehicleStatus) => void;
  onNavigateToVehicleDetail: (slug: string) => void;
  onCreateVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export const AdminFleetView: React.FC<AdminFleetViewProps> = ({
  vehicles,
  onUpdateVehicleStatus,
  onNavigateToVehicleDetail,
  onCreateVehicle,
  onEditVehicle,
  onDeleteVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleCardFilterClick = (targetStatus: string) => {
    setStatusFilter(targetStatus);
    setTimeout(() => {
      document.getElementById('fleet-vehicles-grid-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

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
    <div className="space-y-7 animate-fade-in">
      
      {/* 1. KPIs de la Flota (Tarjetas Interactivas con Filtro Inmediato) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Flota Total */}
        <button
          type="button"
          onClick={() => handleCardFilterClick('ALL')}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            statusFilter === 'ALL'
              ? 'border-gold-500 ring-2 ring-gold-500/40 shadow-gold-500/10'
              : 'border-carbon-750 hover:border-gold-500/50'
          }`}
          title="Clic para ver toda la flota sin filtros"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Flota Total
              </span>
              {statusFilter === 'ALL' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold">
                  Ver Todos
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {totalCount} <span className="text-lg sm:text-xl font-semibold text-silver-400">Unidades</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-400 font-medium flex items-center justify-between">
            <span>100% Superdeportivos & Ultra-Lujo</span>
            <span className="text-gold-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Filtrar ↓
            </span>
          </div>
        </button>

        {/* Disponibles para Renta */}
        <button
          type="button"
          onClick={() => handleCardFilterClick(statusFilter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            statusFilter === 'AVAILABLE'
              ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/15 shadow-emerald-500/10'
              : 'border-carbon-750 hover:border-emerald-500/50'
          }`}
          title="Clic para filtrar solo vehículos disponibles"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Disponibles para Renta
              </span>
              {statusFilter === 'AVAILABLE' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  Filtrando
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-emerald-400 tracking-tight">
            {availableCount}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-emerald-400 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Listos para despacho inmediato</span>
            </div>
            <span className="text-emerald-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {statusFilter === 'AVAILABLE' ? 'Quitar' : 'Filtrar ↓'}
            </span>
          </div>
        </button>

        {/* Alquilados en Servicio */}
        <button
          type="button"
          onClick={() => handleCardFilterClick(statusFilter === 'RENTED' ? 'ALL' : 'RENTED')}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            statusFilter === 'RENTED'
              ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/15 shadow-blue-500/10'
              : 'border-carbon-750 hover:border-blue-500/50'
          }`}
          title="Clic para filtrar solo vehículos alquilados"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Alquilados en Servicio
              </span>
              {statusFilter === 'RENTED' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold">
                  Filtrando
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {rentedCount}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium flex items-center justify-between">
            <span>En circulación con clientes VIP</span>
            <span className="text-blue-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {statusFilter === 'RENTED' ? 'Quitar' : 'Filtrar ↓'}
            </span>
          </div>
        </button>

        {/* En Mantenimiento */}
        <button
          type="button"
          onClick={() => handleCardFilterClick(statusFilter === 'MAINTENANCE' ? 'ALL' : 'MAINTENANCE')}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            statusFilter === 'MAINTENANCE'
              ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-950/15 shadow-amber-500/10'
              : 'border-carbon-750 hover:border-amber-500/50'
          }`}
          title="Clic para filtrar solo vehículos en mantenimiento"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                En Mantenimiento
              </span>
              {statusFilter === 'MAINTENANCE' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                  Filtrando
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-amber-400 tracking-tight">
            {maintenanceCount}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-400 font-medium flex items-center justify-between">
            <span>Taller preventivo / Detailing VIP</span>
            <span className="text-amber-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {statusFilter === 'MAINTENANCE' ? 'Quitar' : 'Filtrar ↓'}
            </span>
          </div>
        </button>

      </div>

      {/* 2. Filtros, Búsqueda y Botón de Creación */}
      <div className="p-4 sm:p-5 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        
        {/* Input de Búsqueda y Botón Nuevo Vehículo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 w-full sm:max-w-xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-silver-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por marca, modelo o placa..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-carbon-850 border border-carbon-700 text-white placeholder-silver-500 text-sm focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
            />
          </div>

          <button
            onClick={onCreateVehicle}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black text-sm shadow-xl shadow-gold-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span>Nuevo Vehículo</span>
          </button>
        </div>

        {/* Filtros por Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'Todas las Categorías' },
            { id: 'DEPORTIVO', label: 'Deportivos' },
            { id: 'SUV_LUJO', label: 'SUVs' },
            { id: 'SEDAN_EJECUTIVO', label: 'Sedanes' },
            { id: 'EXOTICO', label: 'Exóticos' },
            { id: 'CONVERTIBLE', label: 'Convertibles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                categoryFilter === tab.id
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white hover:bg-carbon-800 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Filtro por Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-carbon-850 border border-carbon-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 font-bold ml-1"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="AVAILABLE">🟢 Solo Disponibles</option>
            <option value="RENTED">🔵 Solo Alquilados</option>
            <option value="MAINTENANCE">🟠 Solo Mantenimiento</option>
          </select>
        </div>

      </div>

      {/* Anclaje para scroll suave y Banner de Filtro Activo */}
      <div id="fleet-vehicles-grid-section" className="space-y-4 pt-1">
        {statusFilter !== 'ALL' && (
          <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 border border-carbon-750 flex items-center justify-between shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 animate-pulse ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                  : statusFilter === 'RENTED'
                  ? 'bg-blue-400 shadow-lg shadow-blue-400/50'
                  : 'bg-amber-400 shadow-lg shadow-amber-400/50'
              }`} />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-white">
                  {statusFilter === 'AVAILABLE' && `Mostrando ${filteredVehicles.length} vehículos disponibles para despacho`}
                  {statusFilter === 'RENTED' && `Mostrando ${filteredVehicles.length} vehículos en servicio con clientes VIP`}
                  {statusFilter === 'MAINTENANCE' && `Mostrando ${filteredVehicles.length} vehículo en taller o inspección`}
                </span>
                <span className="text-xs text-silver-400 font-mono">
                  (de {vehicles.length} unidades totales en flota)
                </span>
              </div>
            </div>

            <button
              onClick={() => setStatusFilter('ALL')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 hover:text-gold-300 border border-gold-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span>Ver Todos</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Grid de Vehículos con Tarjetas de Alta Gama */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
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
              className={`rounded-2xl bg-carbon-900 border transition-all overflow-hidden flex flex-col justify-between group shadow-xl ${
                isMaintenance
                  ? 'border-amber-800/80 shadow-amber-950/20'
                  : 'border-carbon-800 hover:border-gold-500/50'
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

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-carbon-950/90 backdrop-blur-md text-gold-400 border border-gold-500/40 shadow-sm">
                    {getCategoryLabel(vehicle.category)}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black text-silver-200 bg-carbon-900/95 border border-carbon-700 shadow-sm">
                    {vehicle.plate}
                  </span>
                </div>

                {/* Contadores de Recursos (Regla 8 y 9) */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-silver-300">
                  <span className="inline-flex items-center gap-1.5 bg-carbon-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-carbon-700 font-medium">
                    <Camera className="w-3.5 h-3.5 text-gold-400" />
                    <span>{totalPhotos}/12 Fotos</span>
                  </span>
                  {vehicle.videoUrl && (
                    <span className="inline-flex items-center gap-1.5 bg-carbon-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-carbon-700 text-emerald-400 font-medium">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video 15s HD</span>
                    </span>
                  )}
                </div>

                {isMaintenance && (
                  <div className="absolute inset-0 bg-amber-950/70 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                    <div className="bg-carbon-950/95 border border-amber-500/60 text-amber-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-2xl">
                      <Wrench className="w-5 h-5" />
                      <span>En Programa de Taller</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Datos Técnicos y Tarifas */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gold-400">
                    {vehicle.brand}
                  </div>
                  <h4 className="text-lg font-black text-white font-display truncate mt-0.5">
                    {vehicle.model}
                  </h4>
                  <div className="text-base font-black font-mono text-gold-400 mt-1">
                    {formatCurrency(vehicle.pricePerDay)} <span className="text-silver-400 font-normal text-xs">/ día</span>
                  </div>

                  {/* Micro-telemetría */}
                  <div className="flex items-center gap-3 text-xs text-silver-300 mt-3 pt-3 border-t border-carbon-800/80 font-medium">
                    {vehicle.specs?.horsepower && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-gold-400" />
                        {vehicle.specs.horsepower} CV
                      </span>
                    )}
                    {vehicle.specs?.acceleration0to100 && (
                      <span>0-100: {vehicle.specs.acceleration0to100}</span>
                    )}
                  </div>
                </div>

                {/* Selector de Estado Operativo */}
                <div className="space-y-2.5 pt-3 border-t border-carbon-800">
                  <label className="block text-xs uppercase font-bold text-silver-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gold-400" />
                    Estado Operativo
                  </label>

                  <select
                    value={vehicle.status}
                    onChange={(e) =>
                      onUpdateVehicleStatus(vehicle.id, e.target.value as VehicleStatus)
                    }
                    className="w-full text-xs sm:text-sm font-bold bg-carbon-850 border border-carbon-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 transition-colors cursor-pointer"
                  >
                    <option value="AVAILABLE">🟢 Disponible (Habilitado)</option>
                    <option value="RENTED">🔵 Alquilado (En uso)</option>
                    <option value="MAINTENANCE">🟠 En Mantenimiento (Bloqueado)</option>
                    <option value="INACTIVE">⚫ Inactivo (Oculto)</option>
                  </select>

                  {/* Acciones CRUD: Editar y Eliminar */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onEditVehicle(vehicle)}
                      className="py-2.5 px-3 text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 bg-carbon-850 hover:bg-carbon-800 border border-carbon-700 hover:border-gold-500/40 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Pencil className="w-4 h-4 text-gold-400" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicleToDelete(vehicle)}
                      className="py-2.5 px-3 text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-300 bg-carbon-850 hover:bg-rose-950/30 border border-carbon-700 hover:border-rose-500/40 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigateToVehicleDetail(vehicle.slug)}
                    className="w-full py-2 text-center text-xs font-bold text-silver-400 hover:text-gold-400 flex items-center justify-center gap-1.5 hover:bg-carbon-850 rounded-xl transition-colors border border-transparent mt-1"
                  >
                    <span>Ver Ficha Showroom</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar Vehículo */}
      {vehicleToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/85 backdrop-blur-xl animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVehicleToDelete(null);
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-carbon-900 border border-carbon-750 p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white font-display">
                ¿Eliminar {vehicleToDelete.brand} {vehicleToDelete.model}?
              </h3>
              <p className="text-xs sm:text-sm text-silver-300 leading-relaxed">
                Esta acción retirará el superdeportivo de la flota comercial y de Cloud Firestore.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-300 text-xs sm:text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteVehicle(vehicleToDelete.id);
                  setVehicleToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
