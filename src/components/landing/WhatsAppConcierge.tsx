import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, ShieldCheck } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { Button } from '../common/Button';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';

interface WhatsAppConciergeProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const WhatsAppConcierge: React.FC<WhatsAppConciergeProps> = ({
  vehicles,
  selectedVehicle: initialVehicle,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const { getWhatsAppLink } = useSettings();
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle?.id || vehicles[0]?.id || ''
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (initialVehicle) {
      setSelectedVehicleId(initialVehicle.id);
    }
  }, [initialVehicle]);

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId) || initialVehicle || vehicles[0];

  const handleOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    // Generar enlace seguro según la Regla 30
    const url = getWhatsAppLink({
      vehicleName: currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.year})` : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      clientName: clientName || undefined,
    });

    // Abrir ventana solo ante la acción voluntaria del usuario
    window.open(url, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  return (
    <>
      {/* Botón flotante discreto en esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setInternalIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase shadow-2xl shadow-emerald-950/80 transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-400/30"
          aria-label={language === 'ES' ? 'Abrir asistente de reserva por WhatsApp' : 'Open WhatsApp booking concierge'}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">
            {language === 'ES' ? 'RESERVAR POR WHATSAPP' : 'BOOK VIA WHATSAPP'}
          </span>
        </button>
      </div>

      {/* Modal / Dialog para estructurar el mensaje antes de enviarlo */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-md rounded-2xl bg-carbon-900 border border-carbon-750 p-6 sm:p-8 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-title"
          >
            {/* Botón Cerrar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-silver-400 hover:text-white hover:bg-carbon-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>
                {language === 'ES' ? 'ATENCIÓN CONCIERGE DIRECTA' : 'DIRECT CONCIERGE DESK'}
              </span>
            </div>

            <h3 id="whatsapp-title" className="text-xl font-bold text-silver-100 font-display">
              {language === 'ES' ? 'Reservar por WhatsApp' : 'Reserve via WhatsApp'}
            </h3>

            <p className="text-xs text-silver-400 mt-1">
              {language === 'ES'
                ? 'Personaliza tu consulta y un asesor te responderá inmediatamente con la confirmación de fechas y tarifa.'
                : 'Customize your request and an advisor will promptly confirm availability, dates, and rates.'}
            </p>

            <form onSubmit={handleOpenWhatsApp} className="mt-6 space-y-4">
              {/* Selección de Vehículo */}
              <div>
                <label className="block text-xs font-medium text-silver-300 mb-1">
                  {language === 'ES' ? 'Vehículo de interés' : 'Vehicle of interest'}
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                >
                  {vehicles.map((veh) => (
                    <option key={veh.id} value={veh.id}>
                      {veh.brand} {veh.model} ({veh.year}) — {formatPrice(veh.pricePerDay)}/{language === 'ES' ? 'día' : 'day'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-silver-300 mb-1">
                    {language === 'ES' ? 'Fecha de recogida' : 'Pick-up date'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-silver-300 mb-1">
                    {language === 'ES' ? 'Fecha de devolución' : 'Return date'}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Nombre del Cliente */}
              <div>
                <label className="block text-xs font-medium text-silver-300 mb-1">
                  {language === 'ES' ? 'Tu nombre completo' : 'Full name'}
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={language === 'ES' ? 'Ej. Carlos Mendoza' : 'e.g. John Smith'}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-silver-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {language === 'ES'
                    ? 'No se compartirá tu número con terceros ni recibirás spam.'
                    : 'Your details remain confidential. No spam or third-party sharing.'}
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<Send className="w-4 h-4" />}
                >
                  {language === 'ES' ? 'ABRIR EN WHATSAPP' : 'OPEN IN WHATSAPP'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
