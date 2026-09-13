import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { getTodayDateString } from '../../services/reservationService';

export interface BlockedRange {
  startDate: string;
  endDate: string;
  id?: string;
  reason?: string;
}

interface ShowroomDatePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (startDate: string, endDate: string) => void;
  blockedRanges?: BlockedRange[];
  pickupTime: string;
  returnTime: string;
  onPickupTimeChange: (time: string) => void;
  onReturnTimeChange: (time: string) => void;
  language?: 'ES' | 'EN';
  minDate?: string;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const WEEKDAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ShowroomDatePicker: React.FC<ShowroomDatePickerProps> = ({
  startDate,
  endDate,
  onChange,
  blockedRanges = [],
  pickupTime,
  returnTime,
  onPickupTimeChange,
  onReturnTimeChange,
  language = 'ES',
  minDate,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activePickingMode, setActivePickingMode] = useState<'start' | 'end'>('start');
  const [dateError, setDateError] = useState<string | null>(null);

  const todayStr = minDate || getTodayDateString();

  // Parse current viewing month/year from selected startDate or today
  const initialYear = startDate ? parseInt(startDate.split('-')[0], 10) : parseInt(todayStr.split('-')[0], 10);
  const initialMonth = startDate ? parseInt(startDate.split('-')[1], 10) - 1 : parseInt(todayStr.split('-')[1], 10) - 1;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Close calendar popover on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Check if a date string YYYY-MM-DD is blocked
  const isDateBlocked = (dateStr: string): boolean => {
    return blockedRanges.some((range) => dateStr >= range.startDate && dateStr <= range.endDate);
  };

  // Check if a range has any blocked date in between
  const hasBlockedBetween = (start: string, end: string): boolean => {
    const cur = new Date(`${start}T12:00:00`);
    const target = new Date(`${end}T12:00:00`);
    cur.setDate(cur.getDate() + 1);

    while (cur <= target) {
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const curStr = `${year}-${month}-${day}`;

      if (isDateBlocked(curStr)) {
        return true;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  // Format date for display
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return language === 'ES' ? 'Seleccionar fecha' : 'Select date';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthName = language === 'ES' ? MONTH_NAMES_ES[monthIdx] : MONTH_NAMES_EN[monthIdx];
      return `${day} ${monthName?.slice(0, 3)} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Handle clicking a calendar day
  const handleDayClick = (dateStr: string) => {
    setDateError(null);

    // Past date
    if (dateStr < todayStr) return;

    // Blocked date
    if (isDateBlocked(dateStr)) {
      setDateError(
        language === 'ES'
          ? 'Esta fecha ya se encuentra reservada para este vehículo.'
          : 'This date is already booked for this vehicle.'
      );
      return;
    }

    if (activePickingMode === 'start') {
      // User is picking start date
      if (endDate && dateStr >= endDate) {
        // If start date is after current end date, push end date to start + 2 days
        const nextEndDate = addDays(dateStr, 2);
        if (hasBlockedBetween(dateStr, nextEndDate)) {
          onChange(dateStr, addDays(dateStr, 1));
        } else {
          onChange(dateStr, nextEndDate);
        }
      } else if (endDate && hasBlockedBetween(dateStr, endDate)) {
        // There's a conflict between new start and existing end
        onChange(dateStr, addDays(dateStr, 1));
      } else {
        onChange(dateStr, endDate || addDays(dateStr, 2));
      }
      setActivePickingMode('end');
    } else {
      // User is picking end date
      if (dateStr <= startDate) {
        // User clicked on or before start date -> change start date instead
        onChange(dateStr, addDays(dateStr, 2));
        setActivePickingMode('end');
      } else {
        // Check if there is a conflict in the range
        if (hasBlockedBetween(startDate, dateStr)) {
          setDateError(
            language === 'ES'
              ? 'El rango seleccionado cruza fechas ya reservadas por otro cliente. Selecciona una fecha anterior al bloqueo.'
              : 'The selected range crosses dates already booked. Please select an earlier return date.'
          );
          return;
        }
        onChange(startDate, dateStr);
        setIsOpen(false);
      }
    }
  };

  // Add days helper
  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(`${dateStr}T12:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Apply quick duration preset
  const handleQuickPreset = (days: number) => {
    setDateError(null);
    const targetStart = startDate || todayStr;
    const targetEnd = addDays(targetStart, days);

    if (hasBlockedBetween(targetStart, targetEnd)) {
      setDateError(
        language === 'ES'
          ? `No es posible aplicar ${days} días porque cruza una reserva existente.`
          : `Cannot apply ${days} days because it crosses an existing reservation.`
      );
      return;
    }

    onChange(targetStart, targetEnd);
    setIsOpen(false);
  };

  // Calculate days in view month
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // In JavaScript getDay() 0 is Sunday, 1 is Monday... convert to Mon = 0
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isPast: boolean;
      isBlocked: boolean;
      isStart: boolean;
      isEnd: boolean;
      isInRange: boolean;
      isToday: boolean;
    }> = [];

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      days.push({
        dayNumber: 0,
        dateStr: '',
        isCurrentMonth: false,
        isPast: true,
        isBlocked: false,
        isStart: false,
        isEnd: false,
        isInRange: false,
        isToday: false,
      });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(viewMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

      const isPast = dateStr < todayStr;
      const isBlocked = isDateBlocked(dateStr);
      const isStart = dateStr === startDate;
      const isEnd = dateStr === endDate;
      const isInRange = Boolean(startDate && endDate && dateStr > startDate && dateStr < endDate);
      const isToday = dateStr === todayStr;

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isPast,
        isBlocked,
        isStart,
        isEnd,
        isInRange,
        isToday,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr, startDate, endDate, blockedRanges]);

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(`${startDate}T12:00:00`).getTime();
    const end = new Date(`${endDate}T12:00:00`).getTime();
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDate, endDate]);

  const monthLabel = language === 'ES' ? MONTH_NAMES_ES[viewMonth] : MONTH_NAMES_EN[viewMonth];
  const weekdays = language === 'ES' ? WEEKDAY_NAMES_ES : WEEKDAY_NAMES_EN;

  return (
    <div ref={containerRef} className="relative w-full space-y-3">
      {/* ========================================================================= */}
      {/* BOTONES DISPARADORES VISUALES (100% integrados, dentro del modal)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Recogida */}
        <div className="p-3.5 rounded-xl bg-carbon-850/80 border border-carbon-800 hover:border-carbon-700 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-silver-300 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-gold-400">
              <CalendarIcon className="w-3.5 h-3.5" />
              {language === 'ES' ? 'Recogida' : 'Pick-up'}
            </span>
            <span className="text-[10px] text-silver-500 font-mono">
              {language === 'ES' ? 'Inicio de Renta' : 'Rental Start'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setActivePickingMode('start');
                setIsOpen(true);
              }}
              className={`col-span-2 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                isOpen && activePickingMode === 'start'
                  ? 'bg-gold-500/15 border-gold-500 text-gold-300 shadow-sm ring-1 ring-gold-500/30'
                  : 'bg-carbon-800 border-carbon-700 text-silver-100 hover:border-carbon-600'
              }`}
            >
              <span className="truncate">{formatDateLabel(startDate)}</span>
              <CalendarIcon className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 ml-1" />
            </button>

            <div className="relative">
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => onPickupTimeChange(e.target.value)}
                className="w-full px-2 py-2 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs font-mono text-center focus:outline-none focus:border-gold-500"
                aria-label="Hora de recogida"
              />
            </div>
          </div>
        </div>

        {/* Devolución */}
        <div className="p-3.5 rounded-xl bg-carbon-850/80 border border-carbon-800 hover:border-carbon-700 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-silver-300 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-gold-400">
              <Clock className="w-3.5 h-3.5" />
              {language === 'ES' ? 'Devolución' : 'Return'}
            </span>
            <span className="text-[10px] text-silver-400 font-bold bg-carbon-800 px-2 py-0.5 rounded-full border border-carbon-700 font-mono">
              {rentalDays} {language === 'ES' ? 'día(s)' : 'day(s)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setActivePickingMode('end');
                setIsOpen(true);
              }}
              className={`col-span-2 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                isOpen && activePickingMode === 'end'
                  ? 'bg-gold-500/15 border-gold-500 text-gold-300 shadow-sm ring-1 ring-gold-500/30'
                  : 'bg-carbon-800 border-carbon-700 text-silver-100 hover:border-carbon-600'
              }`}
            >
              <span className="truncate">{formatDateLabel(endDate)}</span>
              <CalendarIcon className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 ml-1" />
            </button>

            <div className="relative">
              <input
                type="time"
                value={returnTime}
                onChange={(e) => onReturnTimeChange(e.target.value)}
                className="w-full px-2 py-2 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs font-mono text-center focus:outline-none focus:border-gold-500"
                aria-label="Hora de devolución"
              />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CALENDARIO BOUTIQUE DESPLEGABLE (DIRECTAMENTE ANCLADO DENTRO DEL MODAL)   */}
      {/* Nunca sale por allá lejos: se renderiza exactamente dentro del flujo      */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="w-full rounded-2xl bg-carbon-900 border border-gold-500/30 p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4 animate-fade-in z-30">
          
          {/* Barra Superior del Calendario: Mes, Año, Navegación y Botón Cerrar */}
          <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-bold text-silver-100 font-display uppercase tracking-wider">
                {monthLabel} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-300 hover:text-white border border-carbon-700 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-300 hover:text-white border border-carbon-700 transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white border border-carbon-700 transition-colors ml-2"
                aria-label="Cerrar calendario"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Atajos Rápidos de Duración */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-silver-400 uppercase tracking-widest font-mono">
              {language === 'ES' ? 'Duración:' : 'Quick duration:'}
            </span>
            {[
              { label: language === 'ES' ? '+2 días' : '+2 days', days: 2 },
              { label: language === 'ES' ? '+3 días (Fin de semana)' : '+3 days (Weekend)', days: 3 },
              { label: language === 'ES' ? '+7 días (1 Semana)' : '+7 days (1 Week)', days: 7 },
            ].map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => handleQuickPreset(preset.days)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-carbon-800 hover:bg-gold-500/20 text-silver-300 hover:text-gold-300 border border-carbon-750 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Guía Visual / Leyenda de Estados */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-silver-400 py-1 px-2.5 rounded-lg bg-carbon-850 border border-carbon-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-400 shadow-sm" />
              <span>{language === 'ES' ? 'Tu Selección' : 'Your Selection'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{language === 'ES' ? 'Disponible' : 'Available'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{language === 'ES' ? 'Ocupado / Reservado' : 'Reserved'}</span>
            </div>
          </div>

          {/* Mensaje de Error / Conflicto si el usuario intentó seleccionar una fecha reservada */}
          {dateError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{dateError}</span>
            </div>
          )}

          {/* Días de la Semana */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-silver-400 uppercase tracking-wider pb-1">
            {weekdays.map((day, idx) => (
              <div key={idx} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula de Días */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="h-9 w-full" />;
              }

              const isBlocked = item.isBlocked;
              const isPast = item.isPast;
              const isSelectable = !isPast && !isBlocked;

              // Estilos de selección
              let cellClass = 'h-9 w-full rounded-lg flex flex-col items-center justify-center font-medium transition-all relative ';

              if (item.isStart || item.isEnd) {
                cellClass += 'bg-gradient-to-r from-gold-500 to-amber-400 text-carbon-950 font-black shadow-md shadow-gold-500/30 scale-105 z-10';
              } else if (item.isInRange) {
                cellClass += 'bg-gold-500/20 text-gold-300 font-semibold border-y border-gold-500/40';
              } else if (isBlocked) {
                cellClass += 'bg-rose-950/25 text-rose-400/50 line-through cursor-not-allowed border border-rose-900/30';
              } else if (isPast) {
                cellClass += 'text-silver-600 opacity-40 cursor-not-allowed';
              } else {
                cellClass += 'text-silver-200 hover:bg-gold-500/20 hover:text-gold-300 border border-transparent hover:border-gold-500/30 cursor-pointer';
              }

              return (
                <button
                  key={`day-${item.dateStr}`}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => handleDayClick(item.dateStr)}
                  title={
                    isBlocked
                      ? (language === 'ES' ? 'Vehículo ocupado en esta fecha' : 'Vehicle booked on this date')
                      : item.dateStr
                  }
                  className={cellClass}
                >
                  <span>{item.dayNumber}</span>
                  {item.isToday && !item.isStart && !item.isEnd && (
                    <span className="w-1 h-1 rounded-full bg-gold-400 mt-0.5" />
                  )}
                  {isBlocked && (
                    <span className="w-1 h-1 rounded-full bg-rose-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Pie del Calendario con Confirmación Rápida */}
          <div className="flex items-center justify-between pt-3 border-t border-carbon-800 text-xs">
            <div className="text-silver-400">
              <span className="font-semibold text-silver-200">
                {activePickingMode === 'start'
                  ? (language === 'ES' ? 'Paso 1: Elige fecha de recogida' : 'Step 1: Pick start date')
                  : (language === 'ES' ? 'Paso 2: Elige fecha de devolución' : 'Step 2: Pick return date')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs tracking-wider transition-colors shadow-sm"
            >
              {language === 'ES' ? 'LISTO' : 'DONE'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
