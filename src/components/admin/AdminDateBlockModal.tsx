import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types/vehicle';
import {
  X,
  Wrench,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface AdminDateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  initialVehicleId?: string;
  initialStartDate?: string;
  onSaveBlock: (vehicle: Vehicle, startDate: string, endDate: string, reason: string) => Promise<void> | void;
}

const PRESET_REASONS = [
  'Mantenimiento Preventivo & Service Oficial',
  'Detailing VIP & Protección Cerámica',
  'Evento Showroom / Exhibición Privada',
  'Inspección de Neumáticos & Frenos Carbocerámicos',
  'Custodia Especial / Traslado de Base',
];

export const AdminDateBlockModal: React.FC<AdminDateBlockModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  initialVehicleId,
  initialStartDate,
  onSaveBlock,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedVehicleId(initialVehicleId || (vehicles[0]?.id ?? ''));
      const defaultStart = initialStartDate || new Date().toISOString().split('T')[0];
      setStartDate(defaultStart);

      // Default end date: +2 days
      const d = new Date(defaultStart);
      d.setDate(d.getDate() + 2);
      setEndDate(d.toISOString().split('T')[0]);

      setReason(PRESET_REASONS[0]);
      setCustomReason('');
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialVehicleId, initialStartDate, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (!vehicle) {
      setErrorMessage('Por favor seleccione un vehículo de la flota.');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage('Debe especificar la fecha de inicio y de fin.');
      return;
    }

    if (endDate < startDate) {
      setErrorMessage('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    const finalReason = customReason.trim() || reason;

    try {
      setIsSubmitting(true);
      await onSaveBlock(vehicle, startDate, endDate, finalReason);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al guardar el bloqueo de fechas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto">
        
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-carbon-800 bg-carbon-850/95 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-inner flex-shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Control Operativo
                </span>
                <span className="text-carbon-600">•</span>
                <span className="text-xs text-silver-300 font-mono font-bold">Bloqueo de Flota</span>
              </div>
              <h3 className="text-xl font-black text-white font-display tracking-tight mt-0.5">
                Bloquear Fechas de Vehículo
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 text-sm">
          
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Selección de Vehículo */}
          <div className="space-y-2">
            <label className="block text-xs uppercase font-bold text-silver-300">
              Superdeportivo / Vehículo a Bloquear:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full text-sm font-bold bg-carbon-850 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors cursor-pointer"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.plate}) • {v.status}
                </option>
              ))}
            </select>

            {selectedVehicle && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-carbon-850/60 border border-carbon-800 mt-2">
                <img
                  src={selectedVehicle.mainImage}
                  alt={selectedVehicle.model}
                  className="w-14 h-10 object-cover rounded-lg border border-carbon-700 flex-shrink-0"
                />
                <div className="min-w-0 text-xs">
                  <span className="text-white font-bold block truncate">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </span>
                  <span className="text-silver-400 font-mono">
                    Placa: {selectedVehicle.plate} • Estado actual: {selectedVehicle.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Rango de Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold text-silver-300">
                Fecha de Inicio:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full text-sm font-bold font-mono bg-carbon-850 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold text-silver-300">
                Fecha de Finalización:
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full text-sm font-bold font-mono bg-carbon-850 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          {/* 3. Motivo del Bloqueo */}
          <div className="space-y-2">
            <label className="block text-xs uppercase font-bold text-silver-300">
              Motivo Operativo:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_REASONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                  className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    reason === r && !customReason
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                      : 'bg-carbon-850 text-silver-300 border-carbon-750 hover:bg-carbon-800'
                  }`}
                >
                  • {r}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="O escribe otro motivo específico (opcional)..."
                className="w-full text-xs sm:text-sm bg-carbon-850 border border-carbon-700 text-white placeholder-silver-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          {/* Nota informativa sobre disponibilidad */}
          <div className="p-3.5 rounded-xl bg-carbon-850 border border-carbon-750 text-xs text-silver-300 flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Este bloqueo protegerá el superdeportivo en el Timeline y evitará que clientes del showroom reserven estas fechas en estricto cumplimiento de la <strong>Regla 14</strong>.
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-300 font-bold text-xs sm:text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-carbon-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Confirmar Bloqueo'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
