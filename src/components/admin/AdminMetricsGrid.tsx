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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* 1. Flota Showroom */}
      <button
        type="button"
        onClick={() => onSelectTab?.('fleet')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/70 p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a gestionar la Flota"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Flota Showroom
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35">
              {availabilityRate}% Disp.
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {vehicles.length} <span className="text-lg sm:text-xl font-semibold text-silver-400">Unidades</span>
          </div>

          {/* Barra de Distribución de Flota */}
          <div className="w-full h-2.5 rounded-full bg-carbon-800 overflow-hidden flex mt-4 mb-3 shadow-inner">
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

          <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-semibold pt-1">
            <span className="text-emerald-400">{availableCars} Listos</span>
            <span className="text-blue-400">{rentedCars} Alquilados</span>
            <span className="text-amber-400">{maintenanceCars} Taller</span>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-xs text-gold-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium">Panel de Flota</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Entrar a Flota →
            </span>
          </div>
        </div>
      </button>

      {/* 2. Reservas Activas & Pipeline */}
      <button
        type="button"
        onClick={() => onSelectTab?.('reservations')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-amber-500/70 p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a revisar Solicitudes y Reservas"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Pipeline Comercial
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/35">
              En Vivo
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {totalReservations} <span className="text-lg sm:text-xl font-semibold text-silver-400">Solicitud(es)</span>
          </div>

          <div className="mt-4 pt-3 border-t border-carbon-800/80 flex items-center justify-between text-xs sm:text-sm">
            {pendingReservations > 0 ? (
              <span className="inline-flex items-center gap-2 text-amber-400 font-bold bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <Clock className="w-4 h-4 animate-pulse" />
                {pendingReservations} por confirmar
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                Todas gestionadas
              </span>
            )}
            <span className="text-xs sm:text-sm text-silver-300 font-mono font-medium">
              {activeReservations} confirmada(s)
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium">Bandeja de Contratos</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Entrar a Reservas →
            </span>
          </div>
        </div>
      </button>

      {/* 3. Ingresos Proyectados */}
      <button
        type="button"
        onClick={() => onSelectTab?.('analytics')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-emerald-500/70 p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a Analítica Financiera"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-emerald-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Ingresos de Renta
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35">
              <TrendingUp className="w-3.5 h-3.5" />
              Proyectado
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-black font-display text-gold-400 tracking-tight font-mono">
            {formatCurrency(totalEstimatedRevenue)}
          </div>

          <div className="mt-4 pt-3 border-t border-carbon-800/80 flex items-center justify-between text-xs sm:text-sm text-silver-300">
            <span>Tarifas brutas contratadas</span>
            <span className="text-gold-400 font-mono font-bold flex items-center gap-1 bg-carbon-800 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" /> USD Oficial
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium">Business Intelligence</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Ver Finanzas →
            </span>
          </div>
        </div>
      </button>

      {/* 4. Garantías en Custodia */}
      <button
        type="button"
        onClick={() => onSelectTab?.('analytics')}
        className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-blue-500/70 p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none"
        title="Clic para entrar a auditar el Fondo de Garantía"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Fondo de Garantía
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/35">
              Seguro VIP
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight font-mono">
            {formatCurrency(totalSecurityDeposits)}
          </div>

          <div className="mt-4 pt-3 border-t border-carbon-800/80 flex items-center justify-between text-xs sm:text-sm text-silver-300">
            <span>Depósitos en custodia</span>
            <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/25">
              100% Reembolsable
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-carbon-800/80 flex items-center justify-between text-xs text-blue-400 font-mono font-bold">
            <span className="text-silver-400 font-sans font-medium">Custodia Legal</span>
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Auditar Fondos →
            </span>
          </div>
        </div>
      </button>

    </div>
  );
};
