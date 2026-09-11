import React from 'react';
import { Vehicle } from '../../types/vehicle';
import { Reservation } from '../../types/reservation';
import {
  Car,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AdminMetricsGridProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
}

export const AdminMetricsGrid: React.FC<AdminMetricsGridProps> = ({
  vehicles,
  reservations,
}) => {
  const availableCars = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const rentedCars = vehicles.filter((v) => v.status === 'RENTED').length;
  const maintenanceCars = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  const pendingReservations = reservations.filter((r) => r.status === 'PENDING').length;
  const confirmedReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE'
  ).length;

  const totalEstimatedRevenue = reservations
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + (curr.pricing?.rentalTotal || 0), 0);

  const totalSecurityDeposits = reservations
    .filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.pricing?.securityDeposit || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Flota Boutique */}
      <div className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-silver-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Flota Boutique</span>
          <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <Car className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display text-silver-100">
            {vehicles.length} Vehículos
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-2 flex-wrap font-mono">
            <span className="text-emerald-400">● {availableCars} Disp.</span>
            <span className="text-blue-400">● {rentedCars} Alq.</span>
            {maintenanceCars > 0 && (
              <span className="text-amber-400">● {maintenanceCars} Mant.</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Solicitudes & Reservas */}
      <div className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-silver-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Reservas Activas</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display text-silver-100">
            {confirmedReservations + pendingReservations} Solicitudes
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-2 font-mono">
            {pendingReservations > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" />
                {pendingReservations} pendiente(s) de confirmar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Todas gestionadas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Ingresos Estimados */}
      <div className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-silver-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Proyectados</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display text-gold-400 font-mono">
            {formatCurrency(totalEstimatedRevenue)}
          </div>
          <div className="text-[11px] text-silver-400 mt-2">
            Tarifas de renta confirmadas y en curso
          </div>
        </div>
      </div>

      {/* 4. Depósitos en Custodia */}
      <div className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-silver-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Garantías en Custodia</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display text-silver-100 font-mono">
            {formatCurrency(totalSecurityDeposits)}
          </div>
          <div className="text-[11px] text-silver-400 mt-2">
            Depósitos de seguridad reembolsables
          </div>
        </div>
      </div>

    </div>
  );
};
