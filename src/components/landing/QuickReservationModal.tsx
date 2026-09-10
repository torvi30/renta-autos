import React, { useState, useMemo } from 'react';
import { X, Calendar, CheckCircle2, Send } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { Button } from '../common/Button';
import { formatCurrency, generateWhatsAppLink } from '../../utils/formatters';

interface QuickReservationModalProps {
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
}

export const QuickReservationModal: React.FC<QuickReservationModalProps> = ({
  vehicle: initialVehicle,
  vehicles,
  isOpen,
  onClose,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle?.id || vehicles[0]?.id || ''
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sincronizar si cambia el vehículo seleccionado desde el exterior
  React.useEffect(() => {
    if (initialVehicle) {
      setSelectedVehicleId(initialVehicle.id);
    }
  }, [initialVehicle]);

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || initialVehicle || vehicles[0];

  // Cálculo de días y precio total estimado (Prompt sección 16)
  const calculation = useMemo(() => {
    if (!startDate || !endDate) {
      return { days: 1, total: activeVehicle ? activeVehicle.pricePerDay : 0 };
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const validDays = diffDays > 0 ? diffDays : 1;
    const total = validDays * (activeVehicle ? activeVehicle.pricePerDay : 0);
    return { days: validDays, total };
  }, [startDate, endDate, activeVehicle]);

  if (!isOpen || !activeVehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSendToWhatsApp = () => {
    const url = generateWhatsAppLink({
      vehicleName: `${activeVehicle.brand} ${activeVehicle.model} (${activeVehicle.year})`,
      startDate,
      endDate,
      clientName,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Solicitud de Reserva"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-carbon-800 bg-carbon-850/80">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-400">
              SOLICITUD DE RESERVA
            </span>
            <h3 className="text-xl font-bold text-silver-100 font-display">
              {activeVehicle.brand} {activeVehicle.model}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Formulario */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            
            {/* Resumen del Vehículo y Selector */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-carbon-850 border border-carbon-800">
              <img
                src={activeVehicle.mainImage}
                alt={activeVehicle.model}
                className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gold-400 font-semibold uppercase">Vehículo Seleccionado</div>
                <div className="text-sm font-bold text-silver-100 truncate">
                  {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.year})
                </div>
                <div className="text-xs text-silver-400">
                  {formatCurrency(activeVehicle.pricePerDay)} / día
                </div>
              </div>

              {vehicles.length > 1 && (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="text-xs bg-carbon-800 border border-carbon-700 text-silver-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      Cambiar auto
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Fechas de Alquiler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  Fecha de Recogida
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  Fecha de Devolución
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="space-y-3 pt-2 border-t border-carbon-800">
              <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider block">
                Tus Datos de Contacto
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-silver-400 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Roberto Gómez"
                    className="w-full px-3 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-silver-400 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-silver-400 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-silver-400 mb-1">Lugar de Entrega / Notas Especiales (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Entrega en Terminal 2 de Aeropuerto, 10:00 AM"
                  className="w-full px-3 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Desglose de Precios (Prompt sección 16: Vehículo, Fechas, Días, Precio/día, Total) */}
            <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-2 text-xs">
              <div className="flex justify-between text-silver-400">
                <span>Días de alquiler:</span>
                <span className="font-semibold text-silver-200">{calculation.days} día(s)</span>
              </div>
              <div className="flex justify-between text-silver-400">
                <span>Tarifa por día:</span>
                <span className="font-semibold text-silver-200">{formatCurrency(activeVehicle.pricePerDay)}</span>
              </div>
              <div className="flex justify-between text-silver-400">
                <span>Seguro a todo riesgo:</span>
                <span className="font-semibold text-emerald-400">Incluido (Gratis)</span>
              </div>
              <div className="pt-2 border-t border-carbon-750 flex justify-between text-sm font-bold text-silver-100">
                <span>Total Estimado:</span>
                <span className="font-mono text-gold-400 text-base">{formatCurrency(calculation.total)}</span>
              </div>
            </div>

            {/* Botones de Envío */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
              >
                CONFIRMAR SOLICITUD DE RESERVA
              </Button>
            </div>

          </form>
        ) : (
          /* Pantalla de Confirmación / Envío a WhatsApp */
          <div className="p-8 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-bold text-silver-100 font-display">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="text-sm text-silver-400 mt-2 max-w-md mx-auto">
                Hemos recibido tu solicitud para el <strong className="text-silver-200">{activeVehicle.brand} {activeVehicle.model}</strong> por {calculation.days} día(s).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 max-w-md mx-auto text-left text-xs space-y-1.5 text-silver-300">
              <div><strong>Cliente:</strong> {clientName}</div>
              <div><strong>Fechas:</strong> {startDate || 'A coordinar'} al {endDate || 'A coordinar'}</div>
              <div><strong>Total Estimado:</strong> {formatCurrency(calculation.total)}</div>
              <div><strong>Estado:</strong> <span className="text-amber-400 font-semibold">PENDING (En verificación)</span></div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                variant="primary"
                size="md"
                onClick={handleSendToWhatsApp}
                icon={<Send className="w-4 h-4" />}
                fullWidth
              >
                ENVIAR COPIA A WHATSAPP
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                fullWidth
              >
                CERRAR
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
