import React, { useState, useMemo } from 'react';
import { Vehicle } from '../../types/vehicle';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { formatCurrency } from '../../utils/formatters';
import { generateWhatsAppReservationLink } from '../../services/reservationService';
import { AdminDateBlockModal } from './AdminDateBlockModal';
import { AdminReservationEditModal } from './AdminReservationEditModal';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X,
  Send,
  ShieldCheck,
  TrendingUp,
  Table as TableIcon,
  LayoutGrid,
  Pencil,
  Trash2,
  ListOrdered,
  Sparkles,
} from 'lucide-react';

interface AdminCalendarViewProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onUpdateReservationStatus: (id: string, newStatus: ReservationStatus) => void;
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => Promise<void> | void;
  onDeleteReservation: (id: string) => Promise<void> | void;
  onSaveDateBlock: (vehicle: Vehicle, startDate: string, endDate: string, reason: string) => Promise<void> | void;
  onNavigateToVehicleDetail: (slug: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  vehicles,
  reservations,
  onUpdateReservationStatus,
  onUpdateReservation,
  onDeleteReservation,
  onSaveDateBlock,
  onNavigateToVehicleDetail,
}) => {
  // Estado de fecha actual seleccionada
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Si hay reservas existentes, fijar en el mes de la primera reserva o hoy
    if (reservations.length > 0 && reservations[0].startDate) {
      const parts = reservations[0].startDate.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    return new Date();
  });

  const [viewMode, setViewMode] = useState<'timeline' | 'monthGrid' | 'agenda'>('timeline');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modales
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);
  const [blockPreselectedVehicleId, setBlockPreselectedVehicleId] = useState<string | undefined>();
  const [blockPreselectedDate, setBlockPreselectedDate] = useState<string | undefined>();
  const [inspectedReservation, setInspectedReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isDeletingFromInspection, setIsDeletingFromInspection] = useState<boolean>(false);

  // Navegación de mes
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Cálculo de días en el mes actual
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  // Lista de días del mes: [1, 2, 3, ... daysInMonth]
  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Fecha de hoy en formato YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Mes seleccionado formateado como prefijo 'YYYY-MM'
  const currentMonthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

  // Vehículos filtrados
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (categoryFilter !== 'ALL' && v.category !== categoryFilter) return false;
      return true;
    });
  }, [vehicles, categoryFilter]);

  // Reservas activas del mes seleccionado
  const monthReservations = useMemo(() => {
    const monthStart = `${currentMonthPrefix}-01`;
    const monthEnd = `${currentMonthPrefix}-${String(daysInMonth).padStart(2, '0')}`;

    return reservations.filter((r) => {
      if (r.status === 'CANCELLED') return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      // Comprobar si la reserva se cruza con este mes:
      // (r.startDate <= monthEnd) && (r.endDate >= monthStart)
      return r.startDate <= monthEnd && r.endDate >= monthStart;
    });
  }, [reservations, currentMonthPrefix, daysInMonth, statusFilter]);

  // Detector de conflictos / solapamientos
  const conflictsList = useMemo(() => {
    const conflicts: { vehicleName: string; resA: string; resB: string; dates: string }[] = [];
    const groupedByVehicle = new Map<string, Reservation[]>();

    reservations.forEach((r) => {
      if (r.status === 'CANCELLED' || r.status === 'COMPLETED') return;
      const list = groupedByVehicle.get(r.vehicleId) || [];
      list.push(r);
      groupedByVehicle.set(r.vehicleId, list);
    });

    groupedByVehicle.forEach((vehRes) => {
      for (let i = 0; i < vehRes.length; i++) {
        for (let j = i + 1; j < vehRes.length; j++) {
          const a = vehRes[i];
          const b = vehRes[j];
          const overlap = a.startDate <= b.endDate && a.endDate >= b.startDate;
          if (overlap) {
            conflicts.push({
              vehicleName: a.vehicleName,
              resA: a.id,
              resB: b.id,
              dates: `${a.startDate} / ${b.startDate}`,
            });
          }
        }
      }
    });

    return conflicts;
  }, [reservations]);

  // Métricas de Ocupación del Mes
  const totalFleetCapacity = (filteredVehicles.length || 1) * daysInMonth;
  
  // Días reservados en este mes
  const totalBookedDaysInMonth = useMemo(() => {
    let bookedCount = 0;
    const monthStart = `${currentMonthPrefix}-01`;
    const monthEnd = `${currentMonthPrefix}-${String(daysInMonth).padStart(2, '0')}`;

    monthReservations.forEach((r) => {
      const effectiveStart = r.startDate < monthStart ? monthStart : r.startDate;
      const effectiveEnd = r.endDate > monthEnd ? monthEnd : r.endDate;
      const d1 = new Date(effectiveStart).getTime();
      const d2 = new Date(effectiveEnd).getTime();
      const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      bookedCount += diffDays;
    });
    return bookedCount;
  }, [monthReservations, currentMonthPrefix, daysInMonth]);

  const occupancyRate = Math.min(100, Math.round((totalBookedDaysInMonth / totalFleetCapacity) * 100));

  // Próximos despachos en 48h
  const upcomingDispatchesCount = useMemo(() => {
    const today = new Date();
    const in48h = new Date();
    in48h.setDate(in48h.getDate() + 2);
    const todayYMD = today.toISOString().split('T')[0];
    const in48hYMD = in48h.toISOString().split('T')[0];

    return reservations.filter(
      (r) =>
        (r.status === 'CONFIRMED' || r.status === 'PENDING') &&
        r.startDate >= todayYMD &&
        r.startDate <= in48hYMD
    ).length;
  }, [reservations]);

  // Handlers para abrir el modal de bloqueo
  const handleOpenBlockModal = (vehicleId?: string, dateStr?: string) => {
    setBlockPreselectedVehicleId(vehicleId);
    setBlockPreselectedDate(dateStr);
    setIsBlockModalOpen(true);
  };

  const handleSaveBlockWrapper = async (
    vehicle: Vehicle,
    startDate: string,
    endDate: string,
    reason: string
  ) => {
    await onSaveDateBlock(vehicle, startDate, endDate, reason);
  };

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* 1. KPIs Ejecutivos de Ocupación Mensual (Mismo Estilo Grande y Homologado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* % Ocupación Mensual */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Ocupación {MONTH_NAMES[currentMonthIndex]}
            </span>
            <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {occupancyRate}% <span className="text-lg sm:text-xl font-semibold text-silver-400">Ocupado</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium">
            Capacidad total: {totalFleetCapacity} días-auto
          </div>
        </div>

        {/* Días Contratados */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-blue-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Días Contratados
            </span>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {totalBookedDaysInMonth} <span className="text-lg sm:text-xl font-semibold text-silver-400">Días</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium">
            {monthReservations.length} contrato(s) activos en el mes
          </div>
        </div>

        {/* Próximas Salidas en 48h */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-amber-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Despachos Inminentes
            </span>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-amber-400 tracking-tight">
            {upcomingDispatchesCount} <span className="text-lg sm:text-xl font-semibold text-silver-400">Entregas</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Programadas en las próximas 48 horas</span>
          </div>
        </div>

        {/* Detector de Conflictos de Agenda */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-emerald-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Integridad de Agenda
            </span>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-emerald-400 tracking-tight">
            {conflictsList.length === 0 ? '0' : conflictsList.length} <span className="text-lg sm:text-xl font-semibold text-silver-400">Conflictos</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium">
            {conflictsList.length === 0 ? '✓ 100% Flota alineada sin solapes' : '⚠️ Solapamiento detectado'}
          </div>
        </div>

      </div>

      {/* Alerta de Conflicto si existe */}
      {conflictsList.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/70 border-2 border-rose-500/60 text-rose-300 shadow-xl flex items-center gap-4 animate-slide-up">
          <AlertTriangle className="w-7 h-7 text-rose-400 flex-shrink-0" />
          <div>
            <h4 className="text-base font-bold text-white">Alerta de Solapamiento Operativo Detectada</h4>
            <p className="text-xs sm:text-sm text-rose-200 mt-0.5">
              Se han detectado reservas con fechas cruzadas para el mismo vehículo: {conflictsList.map(c => `${c.vehicleName} (${c.resA} vs ${c.resB})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* 2. Barra de Navegación Temporal, Filtros y Modo de Vista */}
      <div className="p-4 sm:p-5 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl">
        
        {/* Controles de Navegación por Mes */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-carbon-850 p-1 rounded-xl border border-carbon-750">
            <button
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="p-2 rounded-lg text-silver-300 hover:text-white hover:bg-carbon-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 hover:bg-carbon-800 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="p-2 rounded-lg text-silver-300 hover:text-white hover:bg-carbon-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gold-400" />
            <h2 className="text-lg sm:text-xl font-black text-white font-display">
              {MONTH_NAMES[currentMonthIndex]} {currentYear}
            </h2>
          </div>
        </div>

        {/* Filtros por Categoría, Estado y Botón de Bloqueo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Switcher de Vista: Timeline Gantt vs Cuadrícula vs Agenda */}
          <div className="flex items-center bg-carbon-850 p-1.5 rounded-xl border border-carbon-750 flex-wrap gap-1">
            <button
              onClick={() => setViewMode('timeline')}
              title="Timeline Gantt de Flota"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Gantt</span>
            </button>
            <button
              onClick={() => setViewMode('monthGrid')}
              title="Cuadrícula Mensual"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'monthGrid'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cuadrícula</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              title="Agenda Móvil & Lista Ejecutiva"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Agenda VIP</span>
            </button>
          </div>

          {/* Filtro por Categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm bg-carbon-850 border border-carbon-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 font-bold"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="DEPORTIVO">Deportivos</option>
            <option value="SUV_LUJO">SUVs de Lujo</option>
            <option value="SEDAN_EJECUTIVO">Sedanes</option>
            <option value="EXOTICO">Superdeportivos Exóticos</option>
            <option value="CONVERTIBLE">Convertibles</option>
          </select>

          {/* Filtro por Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-carbon-850 border border-carbon-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500 font-bold"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="ACTIVE">En Curso / Activas</option>
            <option value="PENDING">Pendientes</option>
            <option value="MAINTENANCE">Mantenimiento / Taller</option>
          </select>

          {/* Botón Principal: + Bloquear Fechas */}
          <button
            onClick={() => handleOpenBlockModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-carbon-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Wrench className="w-4 h-4" />
            <span>+ Bloquear Fechas (Taller)</span>
          </button>
        </div>

      </div>

      {/* 3. VISTA 1: TIMELINE GANTT DE FLOTA (MATRIZ AUTOMOTRIZ) */}
      {viewMode === 'timeline' && (
        <div className="rounded-3xl bg-carbon-900 border border-carbon-800 shadow-2xl overflow-hidden">
          
          {/* Barra de Ayuda y Scroll en Móvil */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-carbon-850 border-b border-carbon-800 text-xs text-silver-300 font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Cronograma Gantt de Flota • Clic en cualquier reserva para inspeccionar, editar o eliminar</span>
            </div>
            <div className="text-gold-400 font-mono text-[11px] font-bold flex items-center gap-1 xl:hidden">
              <span>Desliza para ver días ➔</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1280px]">
              
              {/* Encabezado del Timeline: Columnas de Días */}
              <div
                className="grid border-b border-carbon-800 bg-carbon-850"
                style={{ gridTemplateColumns: `290px repeat(${daysInMonth}, minmax(42px, 1fr))` }}
              >
                {/* Cabecera de Vehículo Fija (Sticky) */}
                <div className="p-4 border-r border-carbon-800 text-xs font-extrabold uppercase tracking-wider text-silver-300 flex items-center justify-between sticky left-0 z-30 bg-carbon-850 shadow-md min-w-[290px]">
                  <span>Flota Boutique ({filteredVehicles.length})</span>
                  <span className="text-[10px] text-gold-400 font-mono">Días 1-{daysInMonth}</span>
                </div>

                {/* Columnas de los Días del Mes */}
                {daysArray.map((day) => {
                  const dayDate = new Date(currentYear, currentMonthIndex, day);
                  const dayOfWeekIndex = (dayDate.getDay() + 6) % 7;
                  const dayOfWeekName = WEEKDAY_NAMES[dayOfWeekIndex];
                  const isWeekend = dayOfWeekIndex >= 5;
                  const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
                  const isToday = dateStr === todayStr;

                  return (
                    <div
                      key={day}
                      className={`text-center py-2.5 px-0.5 border-r border-carbon-800/80 text-xs transition-colors flex flex-col justify-center ${
                        isToday
                          ? 'bg-gold-500/20 text-gold-400 font-black ring-1 ring-gold-400/50'
                          : isWeekend
                          ? 'bg-carbon-900/60 text-silver-400'
                          : 'text-silver-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold">{dayOfWeekName}</span>
                      <span className={`text-sm font-black font-mono mt-0.5 ${isToday ? 'text-gold-400' : 'text-white'}`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Filas por Cada Vehículo */}
              <div className="divide-y divide-carbon-800/70">
                {filteredVehicles.map((vehicle) => {
                  const vehicleMonthRes = monthReservations.filter((r) => r.vehicleId === vehicle.id);

                  return (
                    <div
                      key={vehicle.id}
                      className="grid hover:bg-carbon-850/40 transition-colors relative"
                      style={{ gridTemplateColumns: `290px repeat(${daysInMonth}, minmax(42px, 1fr))` }}
                    >
                      {/* Columna Fija de Información del Vehículo (Sticky) */}
                      <div className="p-3.5 border-r border-carbon-800 flex items-center gap-3 min-w-[290px] bg-carbon-900 sticky left-0 z-20 shadow-lg">
                        <img
                          src={vehicle.mainImage}
                          alt={vehicle.model}
                          className="w-14 h-10 object-cover rounded-xl border border-carbon-750 shadow-md flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => onNavigateToVehicleDetail(vehicle.slug)}
                            className="text-left font-black text-sm text-white hover:text-gold-400 transition-colors truncate block"
                          >
                            {vehicle.brand} {vehicle.model}
                          </button>
                          <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                            <span className="text-gold-400 font-bold">${vehicle.pricePerDay}/d</span>
                            <span className="text-carbon-600 font-bold">•</span>
                            <span className="bg-carbon-800 px-1.5 py-0.5 rounded text-silver-300 font-bold text-[11px]">
                              {vehicle.plate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contenedor de Celdas y Barras Matemáticamente Posicionadas */}
                      <div
                        className="relative col-span-full h-16"
                        style={{
                          gridColumn: `2 / span ${daysInMonth}`,
                        }}
                      >
                        {/* Celdas de Fondo por Cada Día */}
                        <div
                          className="absolute inset-0 grid"
                          style={{
                            gridTemplateColumns: `repeat(${daysInMonth}, minmax(42px, 1fr))`,
                          }}
                        >
                          {daysArray.map((day) => {
                            const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
                            const isToday = dateStr === todayStr;

                            return (
                              <div
                                key={day}
                                onClick={() => handleOpenBlockModal(vehicle.id, dateStr)}
                                title={`Haga clic para bloquear fechas para ${vehicle.model} el ${dateStr}`}
                                className={`h-full border-r border-carbon-800/60 hover:bg-gold-500/10 transition-colors cursor-pointer ${
                                  isToday ? 'bg-gold-500/5' : ''
                                }`}
                              />
                            );
                          })}
                        </div>

                        {/* Barras de Reserva Superpuestas sin colapso visual */}
                        {vehicleMonthRes.map((res) => {
                          const startParts = res.startDate.split('-');
                          const endParts = res.endDate.split('-');
                          
                          let startDay = 1;
                          let endDay = daysInMonth;

                          if (res.startDate.startsWith(currentMonthPrefix)) {
                            startDay = parseInt(startParts[2], 10);
                          } else if (res.startDate < `${currentMonthPrefix}-01`) {
                            startDay = 1;
                          }

                          if (res.endDate.startsWith(currentMonthPrefix)) {
                            endDay = parseInt(endParts[2], 10);
                          } else if (res.endDate > `${currentMonthPrefix}-${String(daysInMonth).padStart(2, '0')}`) {
                            endDay = daysInMonth;
                          }

                          const colSpan = Math.max(1, endDay - startDay + 1);
                          const leftPercent = ((startDay - 1) / daysInMonth) * 100;
                          const widthPercent = (colSpan / daysInMonth) * 100;

                          const isMaintenance = res.status === 'MAINTENANCE';
                          const isConfirmed = res.status === 'CONFIRMED';
                          const isActive = res.status === 'ACTIVE';
                          const isPending = res.status === 'PENDING';

                          return (
                            <div
                              key={res.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedReservation(res);
                              }}
                              style={{
                                left: `calc(${leftPercent}% + 3px)`,
                                width: `calc(${widthPercent}% - 6px)`,
                              }}
                              className={`absolute top-2.5 bottom-2.5 z-10 rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer transition-all shadow-md hover:shadow-2xl flex items-center justify-between gap-1.5 overflow-hidden hover:scale-[1.01] hover:z-30 ${
                                isMaintenance
                                  ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 border-2 border-amber-500/70 shadow-amber-900/30'
                                  : isActive
                                  ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white border-2 border-blue-400 shadow-blue-900/40'
                                  : isConfirmed
                                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-carbon-950 font-black border-2 border-emerald-300 shadow-emerald-900/40'
                                  : isPending
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-carbon-950 font-black border-2 border-amber-300 shadow-amber-900/30'
                                  : 'bg-carbon-800 text-silver-200 border border-carbon-700'
                              }`}
                              title={`${res.id} • ${res.client.fullName} (${res.startDate} al ${res.endDate}) - Clic para ver, editar o eliminar`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 truncate">
                                {isMaintenance ? (
                                  <Wrench className="w-3.5 h-3.5 flex-shrink-0 text-amber-300" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                <span className="truncate font-extrabold text-[11px] sm:text-xs">
                                  {isMaintenance ? (res.notes || 'Taller / Mantenimiento') : res.client.fullName}
                                </span>
                                {colSpan > 1 && (
                                  <span className="text-[10px] opacity-80 flex-shrink-0">
                                    ({colSpan}d)
                                  </span>
                                )}
                              </div>

                              <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase bg-black/40 px-1.5 py-0.5 rounded text-white/90 flex-shrink-0">
                                {res.id}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Leyenda Inferior del Timeline */}
          <div className="p-4 border-t border-carbon-800 bg-carbon-850 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-silver-300">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-silver-400 font-bold uppercase tracking-wider font-mono text-[11px]">Leyenda:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Confirmada</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                <span>En Curso (Activa)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Pendiente</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-700" />
                <span>Mantenimiento / Bloqueo</span>
              </span>
            </div>

            <div className="text-xs text-silver-400 font-mono">
              Tip: Haga clic en cualquier casilla de día para crear un bloqueo rápido.
            </div>
          </div>

        </div>
      )}

      {/* 4. VISTA 2: CUADRÍCULA MENSUAL TRADICIONAL */}
      {viewMode === 'monthGrid' && (
        <div className="rounded-3xl bg-carbon-900 border border-carbon-800 shadow-2xl overflow-hidden p-6 space-y-4">
          
          {/* Cabecera de 7 Días */}
          <div className="grid grid-cols-7 gap-3 text-center border-b border-carbon-800 pb-3">
            {WEEKDAY_NAMES.map((w) => (
              <div key={w} className="text-xs sm:text-sm font-extrabold uppercase text-silver-300 tracking-wider">
                {w}
              </div>
            ))}
          </div>

          {/* Celdas de Días en Matriz de 7 Columnas */}
          <div className="grid grid-cols-7 gap-3">
            {/* Offset inicial del primer día de mes */}
            {(() => {
              const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
              const offset = (firstDayOfMonth.getDay() + 6) % 7; // Lun=0
              return Array.from({ length: offset }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[120px] rounded-2xl bg-carbon-950/40 border border-carbon-850 opacity-40" />
              ));
            })()}

            {daysArray.map((day) => {
              const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;

              // Reservas que tocan este día
              const dayReservations = monthReservations.filter(
                (r) => r.startDate <= dateStr && r.endDate >= dateStr
              );

              return (
                <div
                  key={day}
                  onClick={() => handleOpenBlockModal(undefined, dateStr)}
                  className={`min-h-[120px] p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                    isToday
                      ? 'bg-carbon-850 border-gold-500/60 shadow-lg shadow-gold-500/10 ring-1 ring-gold-400'
                      : 'bg-carbon-850/80 border-carbon-750 hover:border-gold-500/40 hover:bg-carbon-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-sm ${
                        isToday ? 'bg-gold-500 text-carbon-950 shadow-md' : 'text-white'
                      }`}
                    >
                      {day}
                    </span>

                    {dayReservations.length > 0 && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-carbon-900 text-gold-400 border border-carbon-700">
                        {dayReservations.length} auto(s)
                      </span>
                    )}
                  </div>

                  {/* Listado de autos en ese día */}
                  <div className="space-y-1.5 mt-2">
                    {dayReservations.slice(0, 2).map((res) => {
                      const isMaintenance = res.status === 'MAINTENANCE';
                      return (
                        <div
                          key={res.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedReservation(res);
                          }}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg truncate transition-transform hover:scale-105 ${
                            isMaintenance
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : res.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {res.vehicleName.split(' ')[0]} {res.vehiclePlate}
                        </div>
                      );
                    })}

                    {dayReservations.length > 2 && (
                      <div className="text-[10px] text-silver-400 font-mono font-bold text-center">
                        + {dayReservations.length - 2} más
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-silver-500 group-hover:text-gold-400 font-mono text-right mt-1">
                    + Bloquear
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 4. VISTA 3: AGENDA MÓVIL / LISTA EJECUTIVA DE DESPACHOS */}
      {viewMode === 'agenda' && (
        <div className="rounded-3xl bg-carbon-900 border border-carbon-800 shadow-2xl p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-carbon-800">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display">
                Agenda Mensual de Reservas & Despachos
              </h3>
              <p className="text-xs sm:text-sm text-silver-300 mt-0.5">
                Listado optimizado para celulares y dispositivos táctiles. Edita o elimina en 1 toque.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-carbon-800 text-gold-400 border border-gold-500/30">
              {monthReservations.length} Contratos
            </span>
          </div>

          {monthReservations.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CalendarIcon className="w-12 h-12 text-silver-500 mx-auto" />
              <p className="text-base text-silver-300 font-bold">No hay reservas registradas en este mes.</p>
              <button
                onClick={() => handleOpenBlockModal()}
                className="px-5 py-2.5 rounded-xl bg-gold-500 text-carbon-950 font-black text-xs cursor-pointer"
              >
                + Registrar Bloqueo de Taller
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {monthReservations.map((res) => {
                const isMaintenance = res.status === 'MAINTENANCE';
                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl bg-carbon-850 border border-carbon-750 hover:border-gold-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div>
                      {/* Top: Auto e ID */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-mono font-bold text-gold-400 bg-carbon-900 px-2.5 py-1 rounded-lg border border-carbon-700">
                          {res.id}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            isMaintenance
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : res.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      {/* Info del Auto */}
                      <div className="flex items-center gap-3.5 mt-4">
                        <img
                          src={res.vehicleImage}
                          alt={res.vehicleName}
                          className="w-16 h-12 object-cover rounded-xl border border-carbon-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white truncate">{res.vehicleName}</h4>
                          <span className="text-xs font-mono text-silver-400 font-semibold">{res.vehiclePlate}</span>
                        </div>
                      </div>

                      {/* Info del Conductor & Fechas */}
                      <div className="mt-4 pt-3 border-t border-carbon-800/80 space-y-1.5 text-xs text-silver-300">
                        <div className="flex justify-between">
                          <span className="text-silver-400">Titular:</span>
                          <span className="font-extrabold text-white">{res.client.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-silver-400">Fechas:</span>
                          <span className="font-mono text-white font-bold">{res.startDate} al {res.endDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-silver-400">Total:</span>
                          <span className="font-mono text-gold-400 font-black text-sm">
                            {formatCurrency(res.pricing?.rentalTotal || 0)} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones en la tarjeta */}
                    <div className="pt-3 border-t border-carbon-800 flex items-center gap-2">
                      {!isMaintenance && (
                        <button
                          onClick={() => {
                            const url = generateWhatsAppReservationLink(res);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          title="WhatsApp Concierge"
                          className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setEditingReservation(res)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 hover:text-gold-300 border border-gold-500/30 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`¿Seguro que deseas eliminar permanentemente la reserva ${res.id}?`)) {
                            await onDeleteReservation(res.id);
                          }
                        }}
                        title="Eliminar reserva"
                        className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL DE INSPECCIÓN RÁPIDA DE RESERVA / EXPEDIENTE */}
      {inspectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-3xl bg-carbon-900 border-2 border-gold-500/40 shadow-2xl overflow-hidden my-auto p-6 sm:p-7 space-y-5 text-silver-100">
            
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-4 border-b border-carbon-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-gold-400 bg-carbon-800 px-3 py-1 rounded-lg border border-carbon-700">
                  {inspectedReservation.id}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    inspectedReservation.status === 'CONFIRMED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : inspectedReservation.status === 'MAINTENANCE'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {inspectedReservation.status}
                </span>
              </div>

              <button
                onClick={() => {
                  setInspectedReservation(null);
                  setIsDeletingFromInspection(false);
                }}
                className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehículo */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-carbon-850 border border-carbon-800">
              <img
                src={inspectedReservation.vehicleImage}
                alt={inspectedReservation.vehicleName}
                className="w-20 h-14 object-cover rounded-xl border border-carbon-700 flex-shrink-0"
              />
              <div>
                <span className="text-xs font-bold text-gold-400 uppercase">Superdeportivo</span>
                <h4 className="text-lg font-black text-white font-display">
                  {inspectedReservation.vehicleName}
                </h4>
                <div className="text-xs font-mono text-silver-300 font-bold mt-0.5">
                  Placa: {inspectedReservation.vehiclePlate}
                </div>
              </div>
            </div>

            {/* Fechas y Cliente */}
            <div className="space-y-2.5 text-sm p-4 rounded-2xl bg-carbon-850/60 border border-carbon-800">
              <div className="flex justify-between">
                <span className="text-silver-400 font-medium">Titular:</span>
                <span className="text-white font-extrabold">{inspectedReservation.client.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400 font-medium">Teléfono:</span>
                <span className="text-white font-mono">{inspectedReservation.client.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400 font-medium">Intervalo:</span>
                <span className="text-white font-bold font-mono">
                  {inspectedReservation.startDate} al {inspectedReservation.endDate} ({inspectedReservation.pricing?.days || 1} días)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400 font-medium">Total Renta:</span>
                <span className="text-gold-400 font-mono font-black text-base">
                  {formatCurrency(inspectedReservation.pricing?.rentalTotal || 0)}
                </span>
              </div>
              {inspectedReservation.notes && (
                <div className="pt-2 border-t border-carbon-800 text-xs text-silver-300">
                  <span className="text-silver-400 font-bold">Notas:</span> {inspectedReservation.notes}
                </div>
              )}
            </div>

            {/* Confirmación de Borrado en el Modal de Inspección */}
            {isDeletingFromInspection ? (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 space-y-3 animate-slide-up">
                <p className="text-xs sm:text-sm text-rose-200 font-bold">
                  ¿Seguro de eliminar permanentemente la reserva {inspectedReservation.id}?
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setIsDeletingFromInspection(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-carbon-800 text-silver-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      await onDeleteReservation(inspectedReservation.id);
                      setInspectedReservation(null);
                      setIsDeletingFromInspection(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Eliminación</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Botones de Acción Completos: Editar, Eliminar, WhatsApp y Estado */}
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Botón Editar Reserva */}
                <button
                  onClick={() => {
                    const target = inspectedReservation;
                    setInspectedReservation(null);
                    setEditingReservation(target);
                  }}
                  className="py-3 px-4 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 hover:text-gold-300 border border-gold-500/40 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Editar Ficha de Reserva</span>
                </button>

                {/* Botón WhatsApp Concierge */}
                {inspectedReservation.status !== 'MAINTENANCE' && (
                  <button
                    onClick={() => {
                      const url = generateWhatsAppReservationLink(inspectedReservation);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>WhatsApp Concierge</span>
                  </button>
                )}
              </div>

              {/* Fila Inferior: Cambio de Estado y Eliminar */}
              <div className="flex items-center gap-2 pt-2 border-t border-carbon-800">
                {inspectedReservation.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      onUpdateReservationStatus(inspectedReservation.id, 'CONFIRMED');
                      setInspectedReservation(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-black text-xs sm:text-sm uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Aprobar Solicitud
                  </button>
                )}

                {inspectedReservation.status === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      onUpdateReservationStatus(inspectedReservation.id, 'ACTIVE');
                      setInspectedReservation(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Marcar en Entrega
                  </button>
                )}

                {inspectedReservation.status === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      onUpdateReservationStatus(inspectedReservation.id, 'COMPLETED');
                      setInspectedReservation(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-black text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Finalizar y Recibir Vehículo
                  </button>
                )}

                {inspectedReservation.status === 'MAINTENANCE' && (
                  <button
                    onClick={() => {
                      onUpdateReservationStatus(inspectedReservation.id, 'COMPLETED');
                      setInspectedReservation(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Liberar Bloqueo
                  </button>
                )}

                {/* Botón Eliminar Reserva */}
                {!isDeletingFromInspection && (
                  <button
                    onClick={() => setIsDeletingFromInspection(true)}
                    className="py-2.5 px-3.5 rounded-xl bg-carbon-850 hover:bg-rose-950/70 border border-carbon-750 hover:border-rose-500/50 text-silver-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Eliminar reserva permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL DE EDICIÓN COMPLETA DE RESERVAS */}
      <AdminReservationEditModal
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        reservation={editingReservation}
        vehicles={vehicles}
        onSave={onUpdateReservation}
        onDelete={onDeleteReservation}
      />

      {/* 7. MODAL DE BLOQUEO MANUAL DE FECHAS (TALLER) */}
      <AdminDateBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        vehicles={vehicles}
        initialVehicleId={blockPreselectedVehicleId}
        initialStartDate={blockPreselectedDate}
        onSaveBlock={handleSaveBlockWrapper}
      />

    </div>
  );
};
