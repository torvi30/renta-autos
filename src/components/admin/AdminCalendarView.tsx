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
  SlidersHorizontal,
  User,
  Phone,
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

// Monograma de 2 letras para cliente o código
const getClientMonogram = (name: string): string => {
  if (!name) return 'R';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Helper para obtener las etiquetas numéricas de día de inicio y fin (ej: "11" y "15")
const getReservationDayLabels = (
  res: Reservation,
  currentMonthPrefix: string,
  daysInMonth: number
) => {
  const startParts = res.startDate.split('-');
  const endParts = res.endDate.split('-');

  let startLabel = '';
  let endLabel = '';

  if (res.startDate.startsWith(currentMonthPrefix)) {
    startLabel = String(parseInt(startParts[2], 10));
  } else if (res.startDate < `${currentMonthPrefix}-01`) {
    startLabel = '◀ 1';
  } else {
    startLabel = String(parseInt(startParts[2], 10));
  }

  if (res.endDate.startsWith(currentMonthPrefix)) {
    endLabel = String(parseInt(endParts[2], 10));
  } else if (res.endDate > `${currentMonthPrefix}-${String(daysInMonth).padStart(2, '0')}`) {
    endLabel = `${daysInMonth} ▶`;
  } else {
    endLabel = String(parseInt(endParts[2], 10));
  }

  return { startLabel, endLabel };
};

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
  const [timeScale, setTimeScale] = useState<'month' | 'biweek1' | 'biweek2' | 'week'>('month');
  const [hoveredReservation, setHoveredReservation] = useState<{
    res: Reservation;
    vehicle: Vehicle;
    x: number;
    y: number;
  } | null>(null);
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

  // Días visibles según el zoom / escala seleccionada (Mes, Quincena o Semana)
  const visibleDaysArray = useMemo(() => {
    if (timeScale === 'biweek1') {
      return Array.from({ length: Math.min(15, daysInMonth) }, (_, i) => i + 1);
    }
    if (timeScale === 'biweek2') {
      const count = daysInMonth - 15;
      return Array.from({ length: Math.max(1, count) }, (_, i) => i + 16);
    }
    if (timeScale === 'week') {
      const now = new Date();
      let startD = 1;
      if (now.getFullYear() === currentYear && now.getMonth() === currentMonthIndex) {
        startD = Math.max(1, Math.min(now.getDate(), Math.max(1, daysInMonth - 6)));
      }
      return Array.from({ length: Math.min(7, daysInMonth) }, (_, i) => startD + i).filter(
        (d) => d <= daysInMonth
      );
    }
    return daysArray;
  }, [timeScale, daysInMonth, daysArray, currentYear, currentMonthIndex]);

  const colMinWidth = useMemo(() => {
    if (timeScale === 'week') return '90px';
    if (timeScale === 'biweek1' || timeScale === 'biweek2') return '52px';
    return '28px';
  }, [timeScale]);

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
      {/* 1. KPIs Ejecutivos de Ocupación e Integridad (Interactivos con Acceso Directo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* % Ocupación Mensual */}
        <button
          type="button"
          onClick={() => {
            handleToday();
            setStatusFilter('ALL');
            setViewMode('timeline');
          }}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            viewMode === 'timeline' && statusFilter === 'ALL'
              ? 'border-gold-500 ring-2 ring-gold-500/40 shadow-gold-500/10'
              : 'border-carbon-750 hover:border-gold-500/50'
          }`}
          title="Clic para enfocar el mes actual en el Timeline"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Ocupación {MONTH_NAMES[currentMonthIndex]}
              </span>
              {viewMode === 'timeline' && statusFilter === 'ALL' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold">
                  Mes en Curso
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {occupancyRate}% <span className="text-lg sm:text-xl font-semibold text-silver-400">Ocupado</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium flex items-center justify-between">
            <span>Capacidad: {totalFleetCapacity} días-auto</span>
            <span className="text-gold-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Enfocar Hoy →
            </span>
          </div>
        </button>

        {/* Días Contratados (Ver Agenda de Contratos) */}
        <button
          type="button"
          onClick={() => {
            setViewMode(viewMode === 'agenda' ? 'timeline' : 'agenda');
          }}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            viewMode === 'agenda'
              ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/15 shadow-blue-500/10'
              : 'border-carbon-750 hover:border-blue-500/50'
          }`}
          title="Clic para alternar entre vista de Cronograma y Agenda de Contratos"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Días Contratados
              </span>
              {viewMode === 'agenda' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold">
                  Modo Agenda
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {totalBookedDaysInMonth} <span className="text-lg sm:text-xl font-semibold text-silver-400">Días</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium flex items-center justify-between">
            <span>{monthReservations.length} contrato(s) activos</span>
            <span className="text-blue-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {viewMode === 'agenda' ? 'Ver Timeline →' : 'Ver Agenda →'}
            </span>
          </div>
        </button>

        {/* Próximas Salidas en 48h */}
        <button
          type="button"
          onClick={() => {
            handleToday();
            setViewMode('agenda');
          }}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            upcomingDispatchesCount > 0
              ? 'border-amber-500/80 hover:border-amber-400 ring-1 ring-amber-500/30'
              : 'border-carbon-750 hover:border-amber-500/50'
          }`}
          title="Clic para ver despachos y entregas inmediatas de las próximas 48h"
        >
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
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-amber-400 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Próximas 48 horas</span>
            </div>
            <span className="text-amber-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Revisar →
            </span>
          </div>
        </button>

        {/* Detector de Conflictos de Agenda */}
        <button
          type="button"
          onClick={() => {
            if (conflictsList.length > 0) {
              document.getElementById('conflicts-alert-banner')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            conflictsList.length > 0
              ? 'border-rose-500 ring-2 ring-rose-500/50 bg-rose-950/20'
              : 'border-carbon-750 hover:border-emerald-500/50'
          }`}
          title={conflictsList.length > 0 ? "Clic para ver solapamientos detectados" : "100% Flota alineada sin solapes"}
        >
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${conflictsList.length > 0 ? 'from-rose-500 to-amber-500' : 'from-emerald-500 via-emerald-400 to-transparent'}`} />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Integridad de Agenda
            </span>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${
              conflictsList.length > 0
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-4xl sm:text-5xl font-black font-display tracking-tight ${conflictsList.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {conflictsList.length === 0 ? '0' : conflictsList.length} <span className="text-lg sm:text-xl font-semibold text-silver-400">Conflictos</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium flex items-center justify-between">
            <span>{conflictsList.length === 0 ? '✓ 100% Sin solapes' : '⚠️ Solapamiento'}</span>
            <span className="text-emerald-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {conflictsList.length > 0 ? 'Resolver →' : 'Verificar ✓'}
            </span>
          </div>
        </button>

      </div>

      {/* Alerta de Conflicto si existe */}
      {conflictsList.length > 0 && (
        <div id="conflicts-alert-banner" className="p-5 rounded-2xl bg-rose-950/70 border-2 border-rose-500/60 text-rose-300 shadow-xl flex items-center gap-4 animate-slide-up">
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
          
          {/* Barra de Ayuda, Scroll y Selector de Escala / Zoom */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-carbon-850 border-b border-carbon-800 text-xs text-silver-300 font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>Cronograma Gantt de Flota • Clic en cualquier reserva para inspeccionar o gestionar</span>
            </div>

            {/* Selector de Escala / Zoom Horizontal */}
            <div className="flex items-center gap-1 bg-carbon-900/95 p-1 rounded-xl border border-carbon-750 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-silver-400 px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gold-400" /> Vista:
              </span>
              <button
                type="button"
                onClick={() => setTimeScale('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeScale === 'month'
                    ? 'bg-gold-500 text-carbon-950 shadow-md font-black'
                    : 'text-silver-400 hover:text-white hover:bg-carbon-800'
                }`}
                title="Vista de mes completo ajustada a pantalla"
              >
                <span>Mes ({daysInMonth}d)</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeScale('biweek1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeScale === 'biweek1'
                    ? 'bg-gold-500 text-carbon-950 shadow-md font-black'
                    : 'text-silver-400 hover:text-white hover:bg-carbon-800'
                }`}
                title="Días 1 al 15"
              >
                <span>1ª Quincena (1-15)</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeScale('biweek2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeScale === 'biweek2'
                    ? 'bg-gold-500 text-carbon-950 shadow-md font-black'
                    : 'text-silver-400 hover:text-white hover:bg-carbon-800'
                }`}
                title={`Días 16 al ${daysInMonth}`}
              >
                <span>2ª Quincena (16-{daysInMonth})</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeScale('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeScale === 'week'
                    ? 'bg-gradient-to-r from-gold-400 to-amber-500 text-carbon-950 shadow-md font-black ring-1 ring-gold-300'
                    : 'text-silver-400 hover:text-white hover:bg-carbon-800'
                }`}
                title="Vista detallada de 7 días"
              >
                <span>Semana (7d)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full" style={{ minWidth: timeScale === 'month' ? '1060px' : timeScale === 'week' ? '880px' : '980px' }}>
              
              {/* Encabezado del Timeline: Columnas de Días Visibles */}
              <div
                className="grid border-b border-carbon-800 bg-carbon-850 sticky top-0 z-30"
                style={{ gridTemplateColumns: `220px repeat(${visibleDaysArray.length}, minmax(${colMinWidth}, 1fr))` }}
              >
                {/* Cabecera de Vehículo Fija (Sticky) */}
                <div className="p-3 border-r border-carbon-800 text-xs font-extrabold uppercase tracking-wider text-silver-300 flex items-center justify-between sticky left-0 z-40 bg-carbon-850 shadow-md min-w-[220px] w-[220px]">
                  <span>Flota ({filteredVehicles.length})</span>
                  <span className="text-[10px] text-gold-400 font-mono">
                    Días {visibleDaysArray[0]}-{visibleDaysArray[visibleDaysArray.length - 1]}
                  </span>
                </div>

                {/* Columnas de los Días Visibles */}
                {visibleDaysArray.map((day) => {
                  const dayDate = new Date(currentYear, currentMonthIndex, day);
                  const dayOfWeekIndex = (dayDate.getDay() + 6) % 7;
                  const dayOfWeekName = WEEKDAY_NAMES[dayOfWeekIndex];
                  const isWeekend = dayOfWeekIndex >= 5;
                  const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
                  const isToday = dateStr === todayStr;

                  return (
                    <div
                      key={day}
                      className={`text-center py-2 px-0.5 border-r border-carbon-800/80 text-xs transition-colors flex flex-col justify-center ${
                        isToday
                          ? 'bg-gold-500/20 text-gold-400 font-black ring-1 ring-gold-400/50'
                          : isWeekend
                          ? 'bg-carbon-900/60 text-silver-400'
                          : 'text-silver-300'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold">{dayOfWeekName}</span>
                      <span className={`text-xs font-black font-mono mt-0.5 ${isToday ? 'text-gold-400' : 'text-white'}`}>
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
                  const firstVisible = visibleDaysArray[0];
                  const lastVisible = visibleDaysArray[visibleDaysArray.length - 1];
                  const totalVisible = visibleDaysArray.length;

                  return (
                    <div
                      key={vehicle.id}
                      className="grid hover:bg-carbon-850/40 transition-colors relative min-h-[56px]"
                      style={{ gridTemplateColumns: `220px repeat(${totalVisible}, minmax(${colMinWidth}, 1fr))` }}
                    >
                      {/* Columna Fija de Información del Vehículo (Sticky) */}
                      <div className="border-r border-carbon-800 flex items-center gap-2.5 min-w-[220px] w-[220px] bg-carbon-900 sticky left-0 z-20 shadow-lg p-2.5 h-14">
                        <img
                          src={vehicle.mainImage}
                          alt={vehicle.model}
                          className="w-11 h-8 object-cover rounded-lg border border-carbon-750 shadow-md flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onNavigateToVehicleDetail(vehicle.slug)}
                            className="text-left font-black text-xs text-white hover:text-gold-400 transition-colors truncate block w-full"
                          >
                            {vehicle.brand} {vehicle.model}
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                            <span className="text-gold-400 font-bold">${vehicle.pricePerDay}/d</span>
                            <span className="text-carbon-600 font-bold">•</span>
                            <span className="bg-carbon-800 px-1 py-0.2 rounded text-silver-300 font-bold text-[10px]">
                              {vehicle.plate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contenedor de Celdas y Barras Matemáticamente Posicionadas */}
                      <div
                        className="relative col-span-full h-14"
                        style={{
                          gridColumn: `2 / span ${totalVisible}`,
                        }}
                      >
                        {/* Celdas de Fondo por Cada Día */}
                        <div
                          className="absolute inset-0 grid"
                          style={{
                            gridTemplateColumns: `repeat(${totalVisible}, minmax(${colMinWidth}, 1fr))`,
                          }}
                        >
                          {visibleDaysArray.map((day) => {
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

                        {/* Barras de Reserva con Proporción Perfecta */}
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

                          // Si la reserva no cae en la ventana visible actual, no renderizar
                          if (endDay < firstVisible || startDay > lastVisible) {
                            return null;
                          }

                          const effectiveStart = Math.max(startDay, firstVisible);
                          const effectiveEnd = Math.min(endDay, lastVisible);
                          const colOffset = effectiveStart - firstVisible;
                          const colSpan = Math.max(1, effectiveEnd - effectiveStart + 1);

                          const isStartsBeforeVisible = startDay < firstVisible;
                          const isEndsAfterVisible = endDay > lastVisible;

                          const leftPercent = (colOffset / totalVisible) * 100;
                          const widthPercent = (colSpan / totalVisible) * 100;

                          const isMaintenance = res.status === 'MAINTENANCE';
                          const isConfirmed = res.status === 'CONFIRMED';
                          const isActive = res.status === 'ACTIVE';
                          const isPending = res.status === 'PENDING';

                          // Paleta ejecutiva de Cintas Glassmorphic con Resplandor Neón
                          const theme = isMaintenance
                            ? {
                                barClass:
                                  'bg-gradient-to-r from-rose-950/90 via-zinc-950/80 to-rose-950/90 border border-rose-500/35 border-l-[3.5px] border-l-rose-500 text-rose-200 shadow-[0_2px_10px_rgba(244,63,94,0.18)] hover:shadow-[0_4px_22px_rgba(244,63,94,0.45)]',
                                beaconDot: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]',
                                monogramBg: 'bg-rose-950/90 text-rose-300 border border-rose-500/30',
                                badgeBg: 'bg-black/40 text-rose-300 border border-rose-500/25',
                              }
                            : isActive
                            ? {
                                barClass:
                                  'bg-gradient-to-r from-cyan-950/90 via-blue-950/80 to-cyan-950/90 border border-cyan-500/35 border-l-[3.5px] border-l-cyan-400 text-cyan-200 shadow-[0_2px_10px_rgba(6,182,212,0.18)] hover:shadow-[0_4px_22px_rgba(6,182,212,0.45)]',
                                beaconDot: 'bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse',
                                monogramBg: 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/30',
                                badgeBg: 'bg-black/40 text-cyan-300 border border-cyan-500/25',
                              }
                            : isConfirmed
                            ? {
                                barClass:
                                  'bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-emerald-950/90 border border-emerald-500/35 border-l-[3.5px] border-l-emerald-400 text-emerald-200 shadow-[0_2px_10px_rgba(16,185,129,0.18)] hover:shadow-[0_4px_22px_rgba(16,185,129,0.45)]',
                                beaconDot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
                                monogramBg: 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30',
                                badgeBg: 'bg-black/40 text-emerald-300 border border-emerald-500/25',
                              }
                            : isPending
                            ? {
                                barClass:
                                  'bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-amber-950/90 border border-amber-500/35 border-l-[3.5px] border-l-amber-400 text-amber-200 shadow-[0_2px_10px_rgba(245,158,11,0.18)] hover:shadow-[0_4px_22px_rgba(245,158,11,0.45)]',
                                beaconDot: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]',
                                monogramBg: 'bg-amber-950/90 text-amber-300 border border-amber-500/30',
                                badgeBg: 'bg-black/40 text-amber-300 border border-amber-500/25',
                              }
                            : {
                                barClass: 'bg-carbon-900 border border-carbon-700 text-silver-300',
                                beaconDot: 'bg-silver-400',
                                monogramBg: 'bg-carbon-800 text-silver-300 border border-carbon-700',
                                badgeBg: 'bg-black/40 text-silver-400 border border-carbon-700',
                              };

                          const monogram = getClientMonogram(res.client.fullName);
                          const totalDays = res.pricing?.days || colSpan;
                          const { startLabel, endLabel } = getReservationDayLabels(
                            res,
                            currentMonthPrefix,
                            daysInMonth
                          );
                          const monthShort = MONTH_NAMES[currentMonthIndex]?.slice(0, 3) || 'Sep';
                          const roundedClasses = `${isStartsBeforeVisible ? 'rounded-l-none' : 'rounded-l-lg'} ${isEndsAfterVisible ? 'rounded-r-none' : 'rounded-r-lg'}`;

                          return (
                            <div
                              key={res.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setHoveredReservation(null);
                                setInspectedReservation(res);
                              }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredReservation({
                                  res,
                                  vehicle,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredReservation(null)}
                              style={{
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${widthPercent}% - 4px)`,
                              }}
                              className={`absolute top-1/2 -translate-y-1/2 h-8 z-10 ${roundedClasses} cursor-pointer transition-all duration-200 backdrop-blur-md flex items-center overflow-hidden hover:scale-[1.015] hover:-translate-y-0.5 hover:z-30 select-none ${theme.barClass}`}
                            >
                              {/* Divisores internos de días sincronizados con la cuadrícula */}
                              {colSpan > 1 && (
                                <div
                                  className="absolute inset-0 grid pointer-events-none z-0"
                                  style={{ gridTemplateColumns: `repeat(${colSpan}, 1fr)` }}
                                >
                                  {Array.from({ length: colSpan }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`h-full ${i < colSpan - 1 ? 'border-r border-white/10' : ''}`}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Modo Semana y Quincena: Cápsula Ejecutiva Compacta */}
                              {timeScale === 'week' || timeScale === 'biweek1' || timeScale === 'biweek2' ? (
                                <div className="flex items-center gap-2 px-2.5 z-10 w-full overflow-hidden">
                                  {/* Cápsula de Rango de Fechas Integrada */}
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/65 border border-white/20 font-mono font-black text-xs text-white shadow-sm flex-shrink-0">
                                    {isStartsBeforeVisible && <span className="text-silver-400 text-[10px]">◀</span>}
                                    <span>{startLabel}</span>
                                    <span className="text-silver-400 text-[10px]">➔</span>
                                    <span>{endLabel} {timeScale === 'week' ? monthShort : ''}</span>
                                    {isEndsAfterVisible && <span className="text-silver-400 text-[10px]">▶</span>}
                                  </div>

                                  {/* Monograma de Estado */}
                                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${theme.monogramBg} flex-shrink-0`}>
                                    {isMaintenance ? '🛠 TALLER' : monogram}
                                  </span>

                                  {/* Duración */}
                                  <span className="text-xs font-mono font-black tracking-wider uppercase text-silver-200 flex-shrink-0">
                                    {totalDays} {totalDays === 1 ? 'DÍA' : 'DÍAS'}
                                  </span>

                                  {/* Cliente / Notas */}
                                  <span className="text-xs font-bold text-silver-300 truncate opacity-90">
                                    • {isMaintenance ? (res.notes || 'Mantenimiento') : res.client.fullName.split(' ')[0]}
                                  </span>
                                </div>
                              ) : colSpan === 1 ? (
                                /* Modo Mes: 1 día */
                                <div className="w-full h-full flex items-center justify-center z-10 font-mono font-black text-[11px] text-white">
                                  {isMaintenance ? (
                                    <Wrench className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                                  ) : (
                                    <span>{startLabel}</span>
                                  )}
                                </div>
                              ) : colSpan === 2 ? (
                                /* Modo Mes: 2 días */
                                <div className="w-full h-full flex items-center justify-center gap-1 z-10 font-mono font-black text-[10px] text-white px-1">
                                  <span>{startLabel}</span>
                                  <span className="text-silver-400 text-[9px]">➔</span>
                                  <span>{endLabel}</span>
                                </div>
                              ) : colSpan === 3 ? (
                                /* Modo Mes: 3 días */
                                <div className="flex items-center justify-between w-full h-full px-1.5 z-10 gap-1 font-mono">
                                  <span className="px-1 py-0.5 rounded bg-black/65 border border-white/20 font-black text-[10px] text-white">
                                    {startLabel}➔{endLabel}
                                  </span>
                                  <span className={`text-[9px] font-black px-1 py-0.5 rounded ${theme.monogramBg}`}>
                                    {isMaintenance ? '🛠' : monogram}
                                  </span>
                                  <span className="text-[9px] font-bold text-silver-300">
                                    {totalDays}d
                                  </span>
                                </div>
                              ) : (
                                /* Modo Mes: 4+ días */
                                <div className="flex items-center gap-1.5 px-2 z-10 w-full overflow-hidden font-mono">
                                  <span className="px-1.5 py-0.5 rounded bg-black/65 border border-white/20 font-black text-[10px] text-white flex-shrink-0">
                                    {startLabel} ➔ {endLabel}
                                  </span>
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${theme.monogramBg} flex-shrink-0`}>
                                    {isMaintenance ? '🛠' : monogram}
                                  </span>
                                  <span className="text-[10px] font-black uppercase text-silver-300 flex-shrink-0">
                                    {totalDays}d
                                  </span>
                                </div>
                              )}
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
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span className="text-silver-400 font-bold uppercase tracking-wider font-mono text-[11px]">Leyenda:</span>
              <span className="flex items-center gap-1.5 bg-carbon-900 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="text-emerald-200 font-bold">Confirmada</span>
              </span>
              <span className="flex items-center gap-1.5 bg-carbon-900 px-2.5 py-1 rounded-md border border-cyan-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                <span className="text-cyan-200 font-bold">En Curso (Activa)</span>
              </span>
              <span className="flex items-center gap-1.5 bg-carbon-900 px-2.5 py-1 rounded-md border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span className="text-amber-200 font-bold">Pendiente</span>
              </span>
              <span className="flex items-center gap-1.5 bg-carbon-900 px-2.5 py-1 rounded-md border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span className="text-rose-200 font-bold">Mantenimiento / Bloqueo</span>
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

      {/* 5. TOOLTIP FLOTANTE VIP (POPOVER HOVER) */}
      {hoveredReservation && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-150 transform -translate-x-1/2 shadow-2xl"
          style={{
            left: `${Math.min(Math.max(hoveredReservation.x, 190), window.innerWidth - 190)}px`,
            top: `${hoveredReservation.y < 300 ? hoveredReservation.y + 45 : hoveredReservation.y - 12}px`,
            transform: hoveredReservation.y < 300 ? 'translateX(-50%)' : 'translate(-50%, -100%)',
          }}
        >
          <div className="w-80 sm:w-96 rounded-2xl bg-carbon-900/95 backdrop-blur-xl border border-carbon-700 shadow-2xl p-4 text-white ring-1 ring-gold-500/40">
            {/* Cabecera del Popover */}
            <div className="flex items-start justify-between gap-3 border-b border-carbon-800 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={hoveredReservation.vehicle.mainImage}
                  alt={hoveredReservation.vehicle.model}
                  className="w-10 h-8 object-cover rounded-lg border border-carbon-750 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                    {hoveredReservation.vehicle.brand} {hoveredReservation.vehicle.model}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-gold-400">
                    <span>Placa: {hoveredReservation.vehicle.plate}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                  hoveredReservation.res.status === 'MAINTENANCE'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                    : hoveredReservation.res.status === 'ACTIVE'
                    ? 'bg-blue-900/80 text-blue-200 border border-blue-400/60'
                    : hoveredReservation.res.status === 'CONFIRMED'
                    ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-400/60'
                    : hoveredReservation.res.status === 'PENDING'
                    ? 'bg-amber-900/80 text-amber-200 border border-amber-400/60'
                    : 'bg-carbon-800 text-silver-300'
                }`}
              >
                {hoveredReservation.res.status === 'MAINTENANCE'
                  ? 'Taller'
                  : hoveredReservation.res.status === 'ACTIVE'
                  ? 'En Curso'
                  : hoveredReservation.res.status === 'CONFIRMED'
                  ? 'Confirmada'
                  : hoveredReservation.res.status === 'PENDING'
                  ? 'Pendiente'
                  : hoveredReservation.res.status}
              </span>
            </div>

            {/* Código de Reserva */}
            <div className="py-2.5 border-b border-carbon-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-silver-400 font-medium">Contrato / Código:</span>
              <span className="font-black text-gold-400 bg-carbon-850 px-2 py-0.5 rounded border border-carbon-750">
                {hoveredReservation.res.id}
              </span>
            </div>

            {/* Datos del Cliente */}
            {hoveredReservation.res.status !== 'MAINTENANCE' ? (
              <div className="py-2.5 border-b border-carbon-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white truncate">
                    <User className="w-3.5 h-3.5 text-silver-400 flex-shrink-0" />
                    <span>{hoveredReservation.res.client.fullName}</span>
                  </div>
                  {hoveredReservation.res.client.ageConfirmation && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" /> Verificado
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-silver-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-silver-500" />
                    {hoveredReservation.res.client.phone}
                  </span>
                  <span className="font-mono">Doc: {hoveredReservation.res.client.documentId}</span>
                </div>
              </div>
            ) : (
              <div className="py-2.5 border-b border-carbon-800/80 text-xs text-amber-300/90 font-medium">
                <span className="font-bold text-amber-200">Motivo de Bloqueo: </span>
                {hoveredReservation.res.notes || 'Revisión técnica periódica'}
              </div>
            )}

            {/* Fechas y Duración */}
            <div className="py-2.5 border-b border-carbon-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-silver-300 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span className="font-mono">{hoveredReservation.res.startDate}</span>
                <span className="text-silver-500">➔</span>
                <span className="font-mono">{hoveredReservation.res.endDate}</span>
              </div>
              <span className="font-black text-gold-400 font-mono">
                {hoveredReservation.res.pricing?.days || 1} {(hoveredReservation.res.pricing?.days || 1) === 1 ? 'día' : 'días'}
              </span>
            </div>

            {/* Finanzas */}
            {hoveredReservation.res.status !== 'MAINTENANCE' && (
              <div className="pt-2.5 flex items-center justify-between text-xs">
                <div className="text-silver-400">
                  Total: <span className="text-white font-black">{formatCurrency(hoveredReservation.res.pricing?.rentalTotal || 0)}</span>
                </div>
                <div className="text-silver-400 font-mono text-[11px]">
                  Depósito: <span className="text-gold-400 font-bold">{formatCurrency(hoveredReservation.res.pricing?.securityDeposit || 0)}</span>
                </div>
              </div>
            )}

            {/* Click Prompt */}
            <div className="mt-3 pt-2 border-t border-carbon-800 text-[10px] text-center text-gold-400 font-bold tracking-wide">
              ✨ Clic para abrir expediente completo y gestionar
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
