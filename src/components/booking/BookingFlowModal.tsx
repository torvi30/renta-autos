import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import {
  ClientInfo,
  DeliveryLocationType,
  Reservation,
} from '../../types/reservation';
import {
  getTodayDateString,
  getTomorrowDateString,
  getDateAfterDaysString,
  calculateReservationPricing,
  checkAvailability,
  createReservation,
  generateWhatsAppReservationLink,
  getDeliveryLocationLabel,
} from '../../services/reservationService';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../common/Button';

export interface BookingFlowModalProps {
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  vehicle: initialVehicle,
  vehicles,
  isOpen,
  onClose,
  initialStartDate,
  initialEndDate,
}) => {
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  // Pasos: 1 = Fechas & Vehículo, 2 = Conductor KYC, 3 = Confirmación & Voucher
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Estado del vehículo seleccionado
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle?.id || vehicles[0]?.id || ''
  );

  // Fechas y horarios
  const [startDate, setStartDate] = useState<string>(() => initialStartDate || getTomorrowDateString());
  const [endDate, setEndDate] = useState<string>(() => initialEndDate || getDateAfterDaysString(3));
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [returnTime, setReturnTime] = useState<string>('10:00');

  // Modalidad de entrega
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationType>('SHOWROOM');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  // Datos KYC del Conductor
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    fullName: '',
    email: '',
    phone: '',
    documentId: '',
    driverLicense: '',
    ageConfirmation: false,
  });
  const [notes, setNotes] = useState<string>('');

  // Feedback y resultados
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Sincronizar selección de vehículo y fechas externas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (initialVehicle) {
        setSelectedVehicleId(initialVehicle.id);
      }
      if (initialStartDate) {
        setStartDate(initialStartDate);
      }
      if (initialEndDate) {
        setEndDate(initialEndDate);
      }
      // Si el modal se vuelve a abrir, reiniciar pasos excepto si ya completó una reserva previa
      if (currentStep === 3 && !createdReservation) {
        setCurrentStep(1);
      }
    }
  }, [isOpen, initialVehicle, initialStartDate, initialEndDate]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Vehículo activo
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || initialVehicle || vehicles[0];
  }, [vehicles, selectedVehicleId, initialVehicle]);

  // Regla 14: Verificación reactiva de disponibilidad del vehículo
  const availabilityResult = useMemo(() => {
    if (!activeVehicle) return { isAvailable: false, reason: 'Vehículo no seleccionado' };
    return checkAvailability(activeVehicle, startDate, endDate);
  }, [activeVehicle, startDate, endDate]);

  // Cálculo de cotización
  const pricing = useMemo(() => {
    if (!activeVehicle) {
      return {
        dailyRate: 0,
        days: 1,
        rentalTotal: 0,
        securityDeposit: 0,
        insuranceIncluded: true,
        currency: 'USD',
      };
    }
    return calculateReservationPricing(activeVehicle.pricePerDay, startDate, endDate);
  }, [activeVehicle, startDate, endDate]);

  const todayStr = getTodayDateString();

  const handleNextToDriverStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!availabilityResult.isAvailable) return;
    setSubmissionError(null);
    setCurrentStep(2);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;

    if (!clientInfo.ageConfirmation) {
      setSubmissionError(
        language === 'ES'
          ? 'Debes confirmar que cuentas con 25 años o más para reservar esta categoría de lujo.'
          : 'You must confirm that you are 25 years or older to book this luxury category.'
      );
      return;
    }

    setSubmissionError(null);

    const result = createReservation({
      vehicle: activeVehicle,
      startDate,
      endDate,
      pickupTime,
      returnTime,
      deliveryLocation,
      deliveryAddress: deliveryLocation === 'HOTEL_RESIDENCE' ? deliveryAddress : undefined,
      client: clientInfo,
      notes: notes.trim() || undefined,
    });

    if (result.error || !result.reservation) {
      setSubmissionError(
        result.error ||
          (language === 'ES'
            ? 'Ocurrió un error al procesar la reserva.'
            : 'An error occurred while processing the reservation.')
      );
      return;
    }

    setCreatedReservation(result.reservation);
    setCurrentStep(3);
  };

  const getDeliveryLabel = (loc: DeliveryLocationType) => {
    if (language === 'EN') {
      switch (loc) {
        case 'SHOWROOM':
          return 'VIP Central Showroom';
        case 'AIRPORT':
          return 'International Airport (VIP Meet & Greet)';
        case 'HOTEL_RESIDENCE':
          return 'Hotel / Private Residence Delivery';
        default:
          return loc;
      }
    }
    return getDeliveryLocationLabel(loc);
  };

  const handleOpenWhatsApp = useCallback(() => {
    if (!createdReservation) return;
    const url = generateWhatsAppReservationLink(createdReservation);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [createdReservation]);

  const handleCopyReservationCode = useCallback(() => {
    if (!createdReservation) return;
    navigator.clipboard.writeText(createdReservation.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }, [createdReservation]);

  if (!isOpen || !activeVehicle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Encabezado Superior con Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-carbon-800 bg-carbon-850/90 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                {language === 'ES' ? 'Showroom Concierge VIP' : 'VIP Showroom Concierge'}
              </span>
              <span className="text-carbon-600">•</span>
              <span className="text-xs text-silver-400 font-mono">
                {language === 'ES' ? `Paso ${currentStep} de 3` : `Step ${currentStep} of 3`}
              </span>
            </div>
            <h2 id="booking-modal-title" className="text-lg sm:text-xl font-bold text-silver-100 font-display">
              {currentStep === 1 &&
                (language === 'ES' ? 'Configuración de Renta & Fechas' : 'Rental Configuration & Dates')}
              {currentStep === 2 &&
                (language === 'ES' ? 'Registro del Conductor & KYC' : 'Driver Registration & KYC')}
              {currentStep === 3 &&
                (language === 'ES' ? 'Voucher de Reserva Oficial' : 'Official Booking Voucher')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper Visual */}
            <div className="flex items-center gap-1.5 bg-carbon-900/80 px-3 py-1.5 rounded-full border border-carbon-750 text-xs">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                  currentStep >= 1
                    ? 'bg-gold-500 text-carbon-950'
                    : 'bg-carbon-800 text-silver-500'
                }`}
              >
                1
              </span>
              <div className={`w-3 h-0.5 ${currentStep >= 2 ? 'bg-gold-500' : 'bg-carbon-700'}`} />
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                  currentStep >= 2
                    ? 'bg-gold-500 text-carbon-950'
                    : 'bg-carbon-800 text-silver-500'
                }`}
              >
                2
              </span>
              <div className={`w-3 h-0.5 ${currentStep >= 3 ? 'bg-gold-500' : 'bg-carbon-700'}`} />
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                  currentStep === 3
                    ? 'bg-gold-500 text-carbon-950'
                    : 'bg-carbon-800 text-silver-500'
                }`}
              >
                3
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de Error General */}
        {submissionError && (
          <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-xs animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Cuerpo del Modal con Scroll */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* ============================================================ */}
          {/* PASO 1: SELECCIÓN DE VEHÍCULO, FECHAS Y MODALIDAD DE ENTREGA */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <form onSubmit={handleNextToDriverStep} className="space-y-6">
              
              {/* Tarjeta de Vehículo y Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-carbon-850 border border-carbon-800">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={activeVehicle.mainImage}
                    alt={activeVehicle.model}
                    className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-carbon-750"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider block">
                      {language === 'ES' ? 'Vehículo Seleccionado' : 'Selected Vehicle'}
                    </span>
                    <h4 className="text-base font-bold text-silver-100 truncate font-display">
                      {activeVehicle.brand} {activeVehicle.model}
                    </h4>
                    <div className="text-xs text-silver-400 flex items-center gap-2 mt-0.5">
                      <span className="text-gold-400 font-semibold">{formatPrice(activeVehicle.pricePerDay)}</span>
                      <span>{language === 'ES' ? '/ día' : '/ day'}</span>
                      <span className="text-carbon-600">•</span>
                      <span className="font-mono text-silver-500">
                        {language === 'ES' ? 'Placa:' : 'Plate:'} {activeVehicle.plate}
                      </span>
                    </div>
                  </div>
                </div>

                {vehicles.length > 1 && (
                  <div className="w-full sm:w-auto">
                    <label htmlFor="select-vehicle-flow" className="sr-only">
                      {language === 'ES' ? 'Cambiar vehículo' : 'Change vehicle'}
                    </label>
                    <select
                      id="select-vehicle-flow"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full sm:w-auto text-xs bg-carbon-800 border border-carbon-700 text-silver-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gold-500 transition-colors"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({formatPrice(v.pricePerDay)}/{language === 'ES' ? 'd' : 'day'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Selector de Fechas y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Recogida */}
                <div className="p-4 rounded-xl bg-carbon-850/60 border border-carbon-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-silver-200 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-gold-400" />
                    <span>{language === 'ES' ? 'Fecha & Hora de Recogida' : 'Pick-up Date & Time'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label htmlFor="flow-pickup-date" className="block text-[11px] text-silver-400 mb-1">
                        {language === 'ES' ? 'Fecha' : 'Date'}
                      </label>
                      <input
                        id="flow-pickup-date"
                        type="date"
                        required
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="flow-pickup-time" className="block text-[11px] text-silver-400 mb-1">
                        {language === 'ES' ? 'Hora' : 'Time'}
                      </label>
                      <input
                        id="flow-pickup-time"
                        type="time"
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Devolución */}
                <div className="p-4 rounded-xl bg-carbon-850/60 border border-carbon-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-silver-200 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-gold-400" />
                    <span>{language === 'ES' ? 'Fecha & Hora de Devolución' : 'Return Date & Time'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label htmlFor="flow-return-date" className="block text-[11px] text-silver-400 mb-1">
                        {language === 'ES' ? 'Fecha' : 'Date'}
                      </label>
                      <input
                        id="flow-return-date"
                        type="date"
                        required
                        min={startDate || todayStr}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="flow-return-time" className="block text-[11px] text-silver-400 mb-1">
                        {language === 'ES' ? 'Hora' : 'Time'}
                      </label>
                      <input
                        id="flow-return-time"
                        type="time"
                        required
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Indicador de Disponibilidad en Tiempo Real (Regla 14) */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition-colors ${
                  availabilityResult.isAvailable
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                }`}
              >
                {availabilityResult.isAvailable ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-emerald-300">
                        {language === 'ES'
                          ? 'Vehículo disponible para las fechas seleccionadas'
                          : 'Vehicle available for selected dates'}
                      </strong>
                      <span className="text-emerald-400/80">
                        {language === 'ES'
                          ? `Duración confirmada: ${pricing.days} día(s) con entrega programada.`
                          : `Confirmed duration: ${pricing.days} day(s) with scheduled handover.`}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-rose-300">
                        {language === 'ES' ? 'Disponibilidad restringida' : 'Restricted availability'}
                      </strong>
                      <span>{availabilityResult.reason}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Modalidad y Ubicación de Entrega */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-silver-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  {language === 'ES' ? 'Modalidad de Entrega VIP' : 'VIP Handover Option'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('SHOWROOM')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      deliveryLocation === 'SHOWROOM'
                        ? 'bg-gold-500/10 border-gold-500/50 text-silver-100 shadow-sm'
                        : 'bg-carbon-850 border-carbon-750 text-silver-400 hover:border-carbon-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-silver-100">
                      {language === 'ES' ? 'Showroom Central' : 'Main Showroom'}
                    </div>
                    <div className="text-[11px] text-silver-500 mt-0.5">
                      {language === 'ES' ? 'Retiro VIP en boutique' : 'VIP boutique pick-up'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('AIRPORT')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      deliveryLocation === 'AIRPORT'
                        ? 'bg-gold-500/10 border-gold-500/50 text-silver-100 shadow-sm'
                        : 'bg-carbon-850 border-carbon-750 text-silver-400 hover:border-carbon-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-silver-100">
                      {language === 'ES' ? 'Aeropuerto VIP' : 'VIP Airport'}
                    </div>
                    <div className="text-[11px] text-silver-500 mt-0.5">
                      {language === 'ES' ? 'Meet & Greet en terminal' : 'Terminal Meet & Greet'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('HOTEL_RESIDENCE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      deliveryLocation === 'HOTEL_RESIDENCE'
                        ? 'bg-gold-500/10 border-gold-500/50 text-silver-100 shadow-sm'
                        : 'bg-carbon-850 border-carbon-750 text-silver-400 hover:border-carbon-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-silver-100">
                      {language === 'ES' ? 'Hotel / Residencia' : 'Hotel / Residence'}
                    </div>
                    <div className="text-[11px] text-silver-500 mt-0.5">
                      {language === 'ES' ? 'Despacho personalizado' : 'White-glove delivery'}
                    </div>
                  </button>
                </div>

                {deliveryLocation === 'HOTEL_RESIDENCE' && (
                  <div className="animate-fade-in pt-1">
                    <label htmlFor="flow-delivery-addr" className="block text-[11px] text-silver-400 mb-1">
                      {language === 'ES' ? 'Dirección exacta o Nombre del Hotel *' : 'Exact address or Hotel name *'}
                    </label>
                    <input
                      id="flow-delivery-addr"
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={
                        language === 'ES'
                          ? 'Ej. Hotel Four Seasons / Penthouse 1201'
                          : 'e.g. Four Seasons Hotel / Penthouse 1201'
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                    />
                  </div>
                )}
              </div>

              {/* Desglose Financiero Preliminar */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-2 text-xs">
                <div className="flex justify-between text-silver-400">
                  <span>{language === 'ES' ? 'Días de alquiler:' : 'Rental days:'}</span>
                  <span className="font-semibold text-silver-200">
                    {pricing.days} {language === 'ES' ? 'día(s)' : 'day(s)'}
                  </span>
                </div>
                <div className="flex justify-between text-silver-400">
                  <span>{language === 'ES' ? 'Tarifa por día:' : 'Daily rate:'}</span>
                  <span className="font-semibold text-silver-200">{formatPrice(pricing.dailyRate)}</span>
                </div>
                <div className="flex justify-between text-silver-400">
                  <span>{language === 'ES' ? 'Subtotal Renta:' : 'Rental Subtotal:'}</span>
                  <span className="font-semibold text-silver-200">{formatPrice(pricing.rentalTotal)}</span>
                </div>
                <div className="flex justify-between text-silver-400">
                  <span>{language === 'ES' ? 'Depósito en Garantía (Reembolsable):' : 'Security Deposit (Refundable):'}</span>
                  <span className="font-semibold text-silver-200">{formatPrice(pricing.securityDeposit)}</span>
                </div>
                <div className="flex justify-between text-silver-400">
                  <span>{language === 'ES' ? 'Cobertura VIP a Todo Riesgo:' : 'VIP Comprehensive Coverage:'}</span>
                  <span className="font-semibold text-emerald-400">
                    {language === 'ES' ? 'Incluida ($0)' : 'Included ($0)'}
                  </span>
                </div>
                <div className="pt-2 border-t border-carbon-750 flex justify-between text-sm font-bold text-silver-100">
                  <span>{language === 'ES' ? 'Total Estimado al Despacho:' : 'Estimated Total at Handover:'}</span>
                  <span className="font-mono text-gold-400 text-base">
                    {formatPrice(pricing.rentalTotal + pricing.securityDeposit)}
                  </span>
                </div>
              </div>

              {/* Botón de Continuar */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!availabilityResult.isAvailable}
                >
                  <span>{language === 'ES' ? 'CONTINUAR A DATOS DEL CONDUCTOR' : 'PROCEED TO DRIVER DETAILS'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

            </form>
          )}

          {/* ============================================================ */}
          {/* PASO 2: DATOS DEL CONDUCTOR & KYC LIGERO                     */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <form onSubmit={handleConfirmReservation} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span className="text-xs font-semibold text-silver-200 uppercase tracking-wider">
                    {language === 'ES'
                      ? 'Información Requerida para Despacho VIP'
                      : 'Information Required for VIP Handover'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-silver-400 hover:text-gold-400 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'ES' ? 'Modificar fechas' : 'Modify dates'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nombre Completo */}
                <div>
                  <label htmlFor="kyc-fullname" className="block text-[11px] text-silver-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-gold-400" />
                    {language === 'ES' ? 'Nombre y Apellido Completo *' : 'Full Legal Name *'}
                  </label>
                  <input
                    id="kyc-fullname"
                    type="text"
                    required
                    value={clientInfo.fullName}
                    onChange={(e) => setClientInfo({ ...clientInfo, fullName: e.target.value })}
                    placeholder={language === 'ES' ? 'Ej. Roberto Gómez Silva' : 'e.g. Robert Smith'}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Documento / Pasaporte */}
                <div>
                  <label htmlFor="kyc-doc" className="block text-[11px] text-silver-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-gold-400" />
                    {language === 'ES' ? 'Documento de Identidad / Pasaporte *' : 'ID / Passport Number *'}
                  </label>
                  <input
                    id="kyc-doc"
                    type="text"
                    required
                    value={clientInfo.documentId}
                    onChange={(e) => setClientInfo({ ...clientInfo, documentId: e.target.value })}
                    placeholder={language === 'ES' ? 'Ej. 1020304050 o PAS-992144' : 'e.g. PAS-992144'}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Licencia de Conducir */}
                <div>
                  <label htmlFor="kyc-license" className="block text-[11px] text-silver-400 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-gold-400" />
                    {language === 'ES' ? 'Número de Licencia de Conducir *' : "Driver's License Number *"}
                  </label>
                  <input
                    id="kyc-license"
                    type="text"
                    required
                    value={clientInfo.driverLicense}
                    onChange={(e) => setClientInfo({ ...clientInfo, driverLicense: e.target.value })}
                    placeholder={language === 'ES' ? 'Ej. LC-2024-8890' : 'e.g. DL-2026-8890'}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label htmlFor="kyc-phone" className="block text-[11px] text-silver-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gold-400" />
                    {language === 'ES' ? 'Teléfono Móvil / WhatsApp *' : 'Mobile Phone / WhatsApp *'}
                  </label>
                  <input
                    id="kyc-phone"
                    type="tel"
                    required
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Correo Electrónico */}
                <div className="sm:col-span-2">
                  <label htmlFor="kyc-email" className="block text-[11px] text-silver-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gold-400" />
                    {language === 'ES' ? 'Correo Electrónico Oficial *' : 'Official Email Address *'}
                  </label>
                  <input
                    id="kyc-email"
                    type="email"
                    required
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="client@luxury.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

              </div>

              {/* Notas especiales */}
              <div>
                <label htmlFor="kyc-notes" className="block text-[11px] text-silver-400 mb-1">
                  {language === 'ES'
                    ? 'Notas Especiales o Requerimientos de Vuelo (Opcional)'
                    : 'Special Notes or Flight Details (Optional)'}
                </label>
                <textarea
                  id="kyc-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === 'ES'
                      ? 'Ej. Llegada en vuelo AA 921 a las 09:30 AM, requerimos silla de seguridad infantil o entrega en hangar.'
                      : 'e.g. Flight AA 921 arrival at 09:30 AM, child safety seat or hangar delivery requested.'
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              {/* Declaración de Edad Mínima */}
              <div className="p-3.5 rounded-xl bg-carbon-850/80 border border-carbon-750 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="age-confirmation-checkbox"
                  required
                  checked={clientInfo.ageConfirmation}
                  onChange={(e) => setClientInfo({ ...clientInfo, ageConfirmation: e.target.checked })}
                  className="mt-0.5 rounded bg-carbon-800 border-carbon-700 text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="age-confirmation-checkbox" className="text-xs text-silver-300 leading-relaxed cursor-pointer">
                  {language === 'ES' ? (
                    <>
                      Confirmo que tengo <strong className="text-silver-100 font-semibold">25 años o más</strong> y
                      cuento con licencia de conducir vigente y tarjeta de crédito para el depósito de garantía (Requisito estricto de aseguradora para flota ultra-lujo).
                    </>
                  ) : (
                    <>
                      I confirm that I am <strong className="text-silver-100 font-semibold">25 years of age or older</strong> and
                      hold a valid driver&apos;s license and credit card for the security deposit (Strict insurance requirement for ultra-luxury fleet).
                    </>
                  )}
                </label>
              </div>

              {/* Botones de Navegación */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(1)}
                  className="sm:w-1/3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {language === 'ES' ? 'VOLVER' : 'BACK'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="sm:w-2/3"
                >
                  {language === 'ES' ? 'CONFIRMAR & GENERAR VOUCHER' : 'CONFIRM & GENERATE VOUCHER'}
                </Button>
              </div>

            </form>
          )}

          {/* ============================================================ */}
          {/* PASO 3: CONFIRMACIÓN, VOUCHER OFICIAL & BOTÓN WHATSAPP       */}
          {/* ============================================================ */}
          {currentStep === 3 && createdReservation && (
            <div className="space-y-6 animate-fade-in text-center">
              
              {/* Badge Éxito */}
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono font-semibold uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                  <span>{language === 'ES' ? 'Código Oficial:' : 'Official Code:'}</span>
                  <strong className="text-silver-100">{createdReservation.id}</strong>
                </span>
                <h3 className="text-2xl font-bold text-silver-100 font-display">
                  {language === 'ES' ? '¡Solicitud Registrada con Éxito!' : 'Booking Request Confirmed!'}
                </h3>
                <p className="text-xs sm:text-sm text-silver-400 mt-1.5 max-w-md mx-auto">
                  {language === 'ES' ? (
                    <>
                      Tu reserva ha sido ingresada al sistema con estado{' '}
                      <span className="text-amber-400 font-semibold">PENDING (En Verificación)</span>.
                      Un Concierge asignado validará los documentos y coordinará la entrega inmediata.
                    </>
                  ) : (
                    <>
                      Your reservation has been recorded with status{' '}
                      <span className="text-amber-400 font-semibold">PENDING (Under Review)</span>.
                      An assigned Concierge will review your credentials and arrange handover.
                    </>
                  )}
                </p>
              </div>

              {/* Voucher Card Formal */}
              <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-800 text-left text-xs space-y-4 max-w-lg mx-auto shadow-xl">
                
                {/* Cabecera del Voucher */}
                <div className="flex items-center gap-3 pb-3 border-b border-carbon-750">
                  <img
                    src={createdReservation.vehicleImage}
                    alt={createdReservation.vehicleName}
                    className="w-16 h-11 object-cover rounded-lg border border-carbon-700"
                  />
                  <div>
                    <span className="text-[10px] text-gold-400 font-semibold uppercase">
                      {language === 'ES' ? 'Vehículo Asignado' : 'Assigned Vehicle'}
                    </span>
                    <h5 className="text-sm font-bold text-silver-100 font-display">
                      {createdReservation.vehicleName}
                    </h5>
                    <span className="text-silver-500 font-mono text-[11px]">
                      {language === 'ES' ? 'Placa:' : 'Plate:'} {createdReservation.vehiclePlate}
                    </span>
                  </div>
                </div>

                {/* Datos de Agenda y Entrega */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-carbon-750">
                  <div>
                    <span className="text-silver-500 text-[10px] block uppercase">
                      {language === 'ES' ? 'Periodo de Reserva' : 'Booking Period'}
                    </span>
                    <span className="font-semibold text-silver-200">
                      {createdReservation.startDate} {language === 'ES' ? 'al' : 'to'} {createdReservation.endDate}
                    </span>
                    <span className="text-silver-500 block text-[11px]">
                      ({createdReservation.pricing.days} {language === 'ES' ? 'día(s)' : 'day(s)'} • {createdReservation.pickupTime})
                    </span>
                  </div>
                  <div>
                    <span className="text-silver-500 text-[10px] block uppercase">
                      {language === 'ES' ? 'Lugar de Entrega' : 'Delivery Location'}
                    </span>
                    <span className="font-semibold text-silver-200">
                      {getDeliveryLabel(createdReservation.deliveryLocation)}
                    </span>
                  </div>
                </div>

                {/* Titular */}
                <div className="pb-3 border-b border-carbon-750">
                  <span className="text-silver-500 text-[10px] block uppercase">
                    {language === 'ES' ? 'Titular / Conductor' : 'Primary Driver'}
                  </span>
                  <span className="font-semibold text-silver-200">{createdReservation.client.fullName}</span>
                  <div className="text-silver-400 text-[11px] flex gap-3 mt-0.5">
                    <span>ID: {createdReservation.client.documentId}</span>
                    <span>•</span>
                    <span>{language === 'ES' ? 'Licencia:' : 'License:'} {createdReservation.client.driverLicense}</span>
                  </div>
                </div>

                {/* Desglose Financiero Final */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-silver-400">
                    <span>
                      {language === 'ES' ? 'Subtotal Renta' : 'Rental Subtotal'} ({createdReservation.pricing.days}{' '}
                      {language === 'ES' ? 'días' : 'days'}):
                    </span>
                    <span className="font-semibold text-silver-200">
                      {formatPrice(createdReservation.pricing.rentalTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-silver-400">
                    <span>
                      {language === 'ES'
                        ? 'Depósito de Garantía (Reembolsable):'
                        : 'Security Deposit (Refundable):'}
                    </span>
                    <span className="font-semibold text-silver-200">
                      {formatPrice(createdReservation.pricing.securityDeposit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-silver-400">
                    <span>
                      {language === 'ES' ? 'Seguro VIP a Todo Riesgo:' : 'VIP Comprehensive Insurance:'}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {language === 'ES' ? 'Incluido ($0)' : 'Included ($0)'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-carbon-750 flex justify-between text-sm font-bold text-silver-100">
                    <span>
                      {language === 'ES' ? 'Total Estimado al Despacho:' : 'Estimated Total at Handover:'}
                    </span>
                    <span className="font-mono text-gold-400 text-base">
                      {formatPrice(
                        createdReservation.pricing.rentalTotal +
                          createdReservation.pricing.securityDeposit
                      )}
                    </span>
                  </div>
                </div>

              </div>

              {/* Botones de Acción (Regla 30) */}
              <div className="space-y-3 max-w-lg mx-auto pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOpenWhatsApp}
                  icon={<Send className="w-4 h-4" />}
                  fullWidth
                >
                  {language === 'ES'
                    ? 'ENVIAR SOLICITUD A WHATSAPP CONCIERGE'
                    : 'SEND INQUIRY TO WHATSAPP CONCIERGE'}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReservationCode}
                    icon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    fullWidth
                  >
                    {copiedCode
                      ? language === 'ES'
                        ? '¡CÓDIGO COPIADO!'
                        : 'CODE COPIED!'
                      : language === 'ES'
                      ? 'COPIAR CÓDIGO'
                      : 'COPY CODE'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentStep(1);
                      onClose();
                    }}
                    fullWidth
                  >
                    {language === 'ES' ? 'FINALIZAR Y CERRAR' : 'FINISH & CLOSE'}
                  </Button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
