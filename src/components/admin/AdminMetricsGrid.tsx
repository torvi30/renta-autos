import React from 'react';
import { Vehicle } from '../../types/vehicle';
import { Reservation } from '../../types/reservation';
import {
  Car,
  Calendar,
  DollarSign,
  ShieldCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { AdminTab } from './AdminSidebar';

interface AdminMetricsGridProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onSelectTab?: (tab: AdminTab) => void;
}

export const AdminMetricsGrid: React.FC<AdminMetricsGridProps> = ({
  vehicles,
  reservations,
  onSelectTab,
}) => {
  const totalCars = vehicles.length || 1;
  const availableCars = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const rentedCars = vehicles.filter((v) => v.status === 'RENTED').length;
  const maintenanceCars = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
  const availabilityRate = Math.round((availableCars / totalCars) * 100);

  const pendingReservations = reservations.filter((r) => r.status === 'PENDING').length;
  const activeReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE'
  ).length;
  const totalReservations = reservations.length;

  const totalEstimatedRevenue = reservations
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + (curr.pricing?.rentalTotal || 0), 0);

  const totalSecurityDeposits = reservations
    .filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.pricing?.securityDeposit || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      
      {/* 1. Flota Showroom */}
      <button
        type="button"
        onClick={() => onSelectTab?.('fleet')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/70 p-3.5 sm:p-5 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a gestionar la Flota"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
              Flota
            </span>
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 truncate">
              {availabilityRate}%
            </span>
          </div>
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
            <Car className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            {vehicles.length} <span className="text-xs sm:text-lg font-semibold text-silver-400 font-sans">Unidades</span>
          </div>

          {/* Barra de Distribución de Flota */}
          <div className="w-full h-1.5 sm:h-2.5 rounded-full bg-carbon-800 overflow-hidden flex mt-2 sm:mt-4 mb-1.5 sm:mb-3 shadow-inner">
            <div
              style={{ width: `${(availableCars / totalCars) * 100}%` }}
              className="bg-emerald-400 h-full"
              title={`${availableCars} Disponibles`}
            />
            <div
              style={{ width: `${(rentedCars / totalCars) * 100}%` }}
              className="bg-blue-400 h-full"
              title={`${rentedCars} Alquilados`}
            />
            <div
              style={{ width: `${(maintenanceCars / totalCars) * 100}%` }}
              className="bg-amber-400 h-full"
              title={`${maintenanceCars} Mantenimiento`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono font-semibold pt-0.5">
            <span className="text-emerald-400">{availableCars} Listos</span>
            <span className="text-blue-400">{rentedCars} Renta</span>
            <span className="text-amber-400">{maintenanceCars} Taller</span>
          </div>
          
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-[11px] sm:text-xs text-gold-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium hidden sm:inline">Panel de Flota</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Ver Flota →
            </span>
          </div>
        </div>
      </button>

      {/* 2. Reservas Activas & Pipeline */}
      <button
        type="button"
        onClick={() => onSelectTab?.('reservations')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-amber-500/70 p-3.5 sm:p-5 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a revisar Solicitudes y Reservas"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
              Pipeline
            </span>
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/35 truncate">
              En Vivo
            </span>
          </div>
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            {totalReservations} <span className="text-xs sm:text-lg font-semibold text-silver-400 font-sans">Contratos</span>
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 flex items-center justify-between text-[10px] sm:text-xs">
            {pendingReservations > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30 truncate">
                <Clock className="w-3 h-3 animate-pulse" />
                {pendingReservations} Pendientes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30 truncate">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )}
            <span className="text-silver-400 font-mono font-medium">
              {activeReservations} Activas
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-[11px] sm:text-xs text-amber-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium hidden sm:inline">Bandeja de Contratos</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Ver Reservas →
            </span>
          </div>
        </div>
      </button>

      {/* 3. Ingresos Proyectados */}
      <button
        type="button"
        onClick={() => onSelectTab?.('analytics')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-emerald-500/70 p-3.5 sm:p-5 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a Analítica Financiera"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-emerald-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
              Ingresos
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 truncate">
              <TrendingUp className="w-3 h-3" />
              Renta
            </span>
          </div>
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-gold-400 tracking-tight font-mono truncate">
            {formatCurrency(totalEstimatedRevenue)}
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 flex items-center justify-between text-[10px] sm:text-xs text-silver-300">
            <span className="truncate">Tarifas brutas</span>
            <span className="text-gold-400 font-mono font-bold flex items-center gap-0.5 bg-carbon-800 px-1.5 py-0.5 rounded border border-carbon-700">
              <Sparkles className="w-3 h-3 text-gold-400" /> USD
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-[11px] sm:text-xs text-emerald-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium hidden sm:inline">Business Intelligence</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Finanzas →
            </span>
          </div>
        </div>
      </button>

      {/* 4. Garantías en Custodia */}
      <button
        type="button"
        onClick={() => onSelectTab?.('analytics')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-blue-500/70 p-3.5 sm:p-5 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a auditar el Fondo de Garantía"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
              Garantía
            </span>
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/35 truncate">
              Seguro VIP
            </span>
          </div>
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight font-mono truncate">
            {formatCurrency(totalSecurityDeposits)}
          </div>

          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 flex items-center justify-between text-[10px] sm:text-xs text-silver-300">
            <span className="truncate">En custodia</span>
            <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/25">
              100% Reemb.
            </span>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-[11px] sm:text-xs text-blue-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium hidden sm:inline">Custodia Legal</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Auditar →
            </span>
          </div>
        </div>
      </button>

    </div>
  );
};
