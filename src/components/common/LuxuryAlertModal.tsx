import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { useCurrency } from '../../context/CurrencyContext';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface LuxuryAlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  vehicle?: Partial<Vehicle> | null;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  timer?: number; // en milisegundos
  isDestructive?: boolean;
}

interface LuxuryAlertModalProps {
  isOpen: boolean;
  options: LuxuryAlertOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LuxuryAlertModal: React.FC<LuxuryAlertModalProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel,
}) => {
  const { formatPrice } = useCurrency();
  const [progress, setProgress] = useState(100);

  const type = options?.type || 'success';
  const confirmText = options?.confirmText || (options?.showCancelButton ? 'Confirmar' : 'Aceptar');
  const cancelText = options?.cancelText || 'Cancelar';
  const showCancel = options?.showCancelButton ?? false;
  const isDestructive = options?.isDestructive ?? (type === 'warning' || type === 'error');

  // Auto-close countdown timer with progress bar
  useEffect(() => {
    if (!isOpen || !options?.timer) {
      setProgress(100);
      return;
    }

    const duration = options.timer;
    const interval = 25;
    const step = (interval / duration) * 100;

    const timerInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          onConfirm();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, interval);

    return () => clearInterval(timerInterval);
  }, [isOpen, options?.timer, onConfirm]);

  // Support ESC and Enter key shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen || !options) return null;

  // Theme palette and configuration per alert type
  const typeConfig = {
    success: {
      badgeText: 'OPERACIÓN EXITOSA',
      icon: CheckCircle2,
      ringBorder: 'border-emerald-500/40',
      ringBg: 'bg-emerald-500/15',
      iconColor: 'text-gold-400',
      glow: 'shadow-[0_0_50px_rgba(212,175,55,0.25)]',
      primaryBtn: 'bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-carbon-950 shadow-gold-500/20',
      accentTag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    warning: {
      badgeText: 'CONFIRMACIÓN REQUERIDA',
      icon: AlertTriangle,
      ringBorder: 'border-amber-500/40',
      ringBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      glow: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
      primaryBtn: isDestructive 
        ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-red-500/25'
        : 'bg-gradient-to-r from-amber-500 to-gold-500 text-carbon-950 shadow-amber-500/20',
      accentTag: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    error: {
      badgeText: 'AVISO DEL SISTEMA',
      icon: XCircle,
      ringBorder: 'border-rose-500/40',
      ringBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      glow: 'shadow-[0_0_50px_rgba(244,63,94,0.25)]',
      primaryBtn: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-500/20',
      accentTag: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    info: {
      badgeText: 'INFORMACIÓN OFICIAL',
      icon: Info,
      ringBorder: 'border-blue-500/40',
      ringBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.25)]',
      primaryBtn: 'bg-gradient-to-r from-gold-500 to-amber-500 text-carbon-950 shadow-gold-500/20',
      accentTag: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
  }[type];

  const IconComponent = typeConfig.icon;
  const { vehicle } = options;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-carbon-950/85 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-carbon-900 via-carbon-900 to-carbon-950 border border-carbon-750/90 ${typeConfig.glow} overflow-hidden max-h-[90dvh] flex flex-col p-4 sm:p-7 animate-alert-pop`}
      >
        <div className="overflow-y-auto overscroll-contain flex-1">
        {/* Luz ambiental cenital sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold-500/10 blur-3xl pointer-events-none" />

        {/* Botón de cierre en la esquina */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-carbon-800/80 hover:bg-carbon-750 text-silver-400 hover:text-white flex items-center justify-center transition-colors z-20"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ======================================================== */}
        {/* CABECERA CON ÍCONO EMBLEMÁTICO Y BADGE VIP               */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center text-center">
          
          {/* Anillo de Icono con ondas concéntricas */}
          <div className="relative mb-4">
            <div className={`w-20 h-20 rounded-full ${typeConfig.ringBg} border-2 ${typeConfig.ringBorder} flex items-center justify-center relative shadow-inner`}>
              <IconComponent className={`w-10 h-10 ${typeConfig.iconColor} animate-pulse-subtle`} />
            </div>
            <span className="absolute -inset-1 rounded-full border border-gold-400/20 animate-ping pointer-events-none opacity-50" />
          </div>

          {/* Badge Oficial */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase mb-2.5 border ${typeConfig.accentTag}`}>
            <Sparkles className="w-3 h-3" />
            <span>{typeConfig.badgeText}</span>
          </div>

          {/* Título de la Alerta */}
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display leading-snug">
            {options.title}
          </h3>

          {/* Mensaje descriptivo */}
          {options.message && (
            <p className="mt-2 text-xs sm:text-sm text-silver-300 font-light leading-relaxed max-w-md">
              {options.message}
            </p>
          )}
        </div>

        {/* ======================================================== */}
        {/* PREVIEW EXCLUSIVO DEL VEHÍCULO (SI APLICA)               */}
        {/* ======================================================== */}
        {vehicle && (
          <div className="mt-5 p-3.5 rounded-2xl bg-carbon-950/80 border border-carbon-800/90 shadow-inner flex flex-col sm:flex-row items-center gap-3.5 text-left">
            {vehicle.mainImage && (
              <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-carbon-900 flex-shrink-0 shadow-md">
                <img
                  src={vehicle.mainImage}
                  alt={vehicle.model || 'Vehículo'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-grow min-w-0 w-full sm:w-auto">
              <div className="text-[10px] font-bold text-gold-400 uppercase tracking-widest truncate">
                {vehicle.brand || 'Flota Boutique'}
              </div>
              <div className="text-sm font-black text-silver-100 font-display truncate">
                {vehicle.model || 'Vehículo de Lujo'} {vehicle.year ? `(${vehicle.year})` : ''}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-silver-400 font-mono">
                {vehicle.pricePerDay ? (
                  <span className="text-silver-200 font-bold">
                    {formatPrice(vehicle.pricePerDay)}/día
                  </span>
                ) : null}
                {vehicle.category && (
                  <span className="px-1.5 py-0.5 rounded bg-carbon-800 text-gold-400 text-[9px] uppercase">
                    {vehicle.category.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BOTONES DE ACCIÓN (ESTILO SHOWROOM VIP)                  */}
        {/* ======================================================== */}
        <div className={`mt-6 flex flex-col-reverse sm:flex-row items-center gap-3 ${showCancel ? 'justify-end' : 'justify-center'}`}>
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-300 hover:text-white font-semibold text-xs tracking-wider uppercase border border-carbon-700 active:scale-95 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-7 py-2.5 rounded-xl ${typeConfig.primaryBtn} font-black text-xs tracking-widest uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* BARRA DE PROGRESO DE AUTO-CIERRE (SI HAY TEMPORIZADOR)   */}
        {/* ======================================================== */}
        {options.timer && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-carbon-800">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-amber-400 transition-all ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        </div>

      </div>
    </div>
  );
};
