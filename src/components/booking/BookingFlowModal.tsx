import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Calendar,
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
  Printer,
  Share2,
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
  getStoredReservations,
  subscribeReservations,
} from '../../services/reservationService';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../common/Button';
import { ShowroomDatePicker } from './ShowroomDatePicker';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

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
  const { settings } = useSettings();
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
  const [phonePrefix, setPhonePrefix] = useState<string>('+57');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Feedback y resultados
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lista viva de reservas para detección reactiva de conflictos en tiempo real
  const [allReservations, setAllReservations] = useState<Reservation[]>(getStoredReservations);

  useEffect(() => {
    const unsubscribe = subscribeReservations((updatedList) => {
      setAllReservations(updatedList);
    });
    return () => unsubscribe();
  }, []);

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

  // Cerrar con tecla Escape y bloquear scroll de fondo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Vehículo activo
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || initialVehicle || vehicles[0];
  }, [vehicles, selectedVehicleId, initialVehicle]);

  // Rangos de fechas bloqueados para el vehículo activo (para el calendario interactivo)
  const vehicleBlockedRanges = useMemo(() => {
    if (!activeVehicle) return [];
    return allReservations
      .filter(
        (res) =>
          res.vehicleId === activeVehicle.id &&
          (res.status === 'PENDING' ||
            res.status === 'CONFIRMED' ||
            res.status === 'ACTIVE' ||
            res.status === 'MAINTENANCE')
      )
      .map((res) => ({
        startDate: res.startDate,
        endDate: res.endDate,
        id: res.id,
        reason: res.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Reserva existente',
      }));
  }, [activeVehicle, allReservations]);

  // Regla 14: Verificación reactiva de disponibilidad del vehículo
  const availabilityResult = useMemo(() => {
    if (!activeVehicle) return { isAvailable: false, reason: 'Vehículo no seleccionado' };
    return checkAvailability(activeVehicle, startDate, endDate);
  }, [activeVehicle, startDate, endDate, allReservations]);

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
    if (!activeVehicle || isSubmitting) return;

    if (!clientInfo.ageConfirmation) {
      setSubmissionError(
        language === 'ES'
          ? 'Debes confirmar que cuentas con 25 años o más para reservar esta categoría de lujo.'
          : 'You must confirm that you are 25 years or older to book this luxury category.'
      );
      return;
    }

    const finalPhone = phoneNumber.trim()
      ? `${phonePrefix} ${phoneNumber.trim()}`.trim()
      : clientInfo.phone.trim();

    if (!finalPhone) {
      setSubmissionError(
        language === 'ES'
          ? 'Por favor ingresa un número de teléfono móvil o WhatsApp.'
          : 'Please enter a valid mobile or WhatsApp phone number.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const result = createReservation({
        vehicle: activeVehicle,
        startDate,
        endDate,
        pickupTime,
        returnTime,
        deliveryLocation,
        deliveryAddress:
          deliveryLocation === 'HOTEL_RESIDENCE' || deliveryLocation === 'AIRPORT'
            ? deliveryAddress.trim() || undefined
            : undefined,
        client: {
          ...clientInfo,
          phone: finalPhone,
        },
        notes: notes.trim() || undefined,
      });

      if (result.error || !result.reservation) {
        setSubmissionError(
          result.error ||
            (language === 'ES'
              ? 'Ocurrió un error al procesar la reserva.'
              : 'An error occurred while processing the reservation.')
        );
        setIsSubmitting(false);
        return;
      }

      setCreatedReservation(result.reservation);
      setCurrentStep(3);
    } catch (err: any) {
      setSubmissionError(err?.message || 'Error al procesar la reserva');
    } finally {
      setIsSubmitting(false);
    }
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
    try {
      navigator.clipboard.writeText(createdReservation.id);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch (_) {}

    const targetPhone = settings.whatsappPhone || '573009115898';
    const pricingDisplay = {
      dailyRateText: formatPrice(createdReservation.pricing.dailyRate),
      rentalTotalText: formatPrice(createdReservation.pricing.rentalTotal),
      securityDepositText: formatPrice(createdReservation.pricing.securityDeposit),
      totalEstimatedText: formatPrice(
        createdReservation.pricing.rentalTotal + createdReservation.pricing.securityDeposit
      ),
    };
    const url = generateWhatsAppReservationLink(createdReservation, targetPhone, pricingDisplay);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [createdReservation, settings.whatsappPhone, formatPrice]);

  const handleCopyReservationCode = useCallback(() => {
    if (!createdReservation) return;
    navigator.clipboard.writeText(createdReservation.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }, [createdReservation]);

  const handleCopySummary = useCallback(() => {
    if (!createdReservation) return;
    const locationStr = `${getDeliveryLabel(createdReservation.deliveryLocation)}${
      createdReservation.deliveryAddress ? ` (${createdReservation.deliveryAddress})` : ''
    }`;
    const totalEst = formatPrice(
      createdReservation.pricing.rentalTotal + createdReservation.pricing.securityDeposit
    );
    const summaryText = [
      `🚗 *Reserva ${createdReservation.id}* - ${createdReservation.vehicleName} (${createdReservation.vehiclePlate})`,
      `📅 *Fechas:* ${createdReservation.startDate} al ${createdReservation.endDate} (${createdReservation.pricing.days} días)`,
      `⏰ *Horario:* ${createdReservation.pickupTime} - ${createdReservation.returnTime}`,
      `📍 *Entrega:* ${locationStr}`,
      `👤 *Titular:* ${createdReservation.client.fullName} (Doc: ${createdReservation.client.documentId})`,
      `💰 *Total Estimado:* ${totalEst}`,
      `🌟 *Elite Wheels Boutique Car Rental*`,
    ].join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  }, [createdReservation, formatPrice]);

  const handlePrintVoucher = useCallback(() => {
    window.print();
  }, []);

  if (!isOpen || !activeVehicle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-fade-in print:p-0 print:bg-white print:static print:inset-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      {/* Backdrop explícito con soporte de clic para cerrar afuera */}
      <div
        className="fixed inset-0 bg-carbon-950/85 backdrop-blur-xl transition-opacity cursor-pointer -z-10 print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-t-3xl sm:rounded-2xl bg-carbon-900 border-t sm:border border-carbon-750 shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] z-10 animate-slide-up sm:animate-fade-in print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none print:bg-white"
      >
        {/* Píldora de arrastre táctil superior para smartphones */}
        <div className="w-12 h-1 rounded-full bg-carbon-700/80 mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0 print:hidden" />
        
        {/* Encabezado Superior con Stepper (Fijo, no se desplaza) */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-carbon-800 bg-carbon-850/90 gap-2.5 flex-shrink-0 print:hidden">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-gold-400 truncate">
                {language === 'ES' ? 'Showroom Concierge VIP' : 'VIP Concierge'}
              </span>
              <span className="text-carbon-600">•</span>
              <span className="text-[11px] sm:text-xs text-silver-400 font-mono">
                {language === 'ES' ? `Paso ${currentStep} de 3` : `Step ${currentStep} of 3`}
              </span>
            </div>
            <h2 id="booking-modal-title" className="text-sm sm:text-lg font-bold text-silver-100 font-display truncate">
              {currentStep === 1 &&
                (language === 'ES' ? 'Configuración de Renta' : 'Rental Configuration')}
              {currentStep === 2 &&
                (language === 'ES' ? 'Registro del Conductor KYC' : 'Driver Registration KYC')}
              {currentStep === 3 &&
                (language === 'ES' ? 'Voucher de Reserva Oficial' : 'Official Booking Voucher')}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Stepper Visual */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-carbon-900/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-carbon-750 text-xs">
              <span
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] transition-colors ${
                  currentStep >= 1
                    ? 'bg-gold-500 text-carbon-950'
                    : 'bg-carbon-800 text-silver-500'
                }`}
              >
                1
              </span>
              <div className={`w-2 sm:w-3 h-0.5 ${currentStep >= 2 ? 'bg-gold-500' : 'bg-carbon-700'}`} />
              <span
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] transition-colors ${
                  currentStep >= 2
                    ? 'bg-gold-500 text-carbon-950'
                    : 'bg-carbon-800 text-silver-500'
                }`}
              >
                2
              </span>
              <div className={`w-2 sm:w-3 h-0.5 ${currentStep >= 3 ? 'bg-gold-500' : 'bg-carbon-700'}`} />
              <span
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-[11px] transition-colors ${
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
              className="p-1.5 sm:p-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de Error General / Conflicto */}
        {submissionError && (
          <div className="mx-5 sm:mx-6 mt-4 p-4 rounded-xl bg-rose-950/70 border border-rose-800/80 flex flex-col gap-3 text-rose-300 text-xs animate-shake">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold text-rose-200 block mb-0.5">
                  {language === 'ES' ? 'Aviso de Disponibilidad / Conflicto' : 'Availability / Conflict Notice'}
                </span>
                <span>{submissionError}</span>
              </div>
            </div>

            {currentStep === 2 && (
              <div className="pt-2 border-t border-rose-800/50 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-rose-300/80">
                  {language === 'ES'
                    ? 'Revisa las fechas libres directamente en el calendario.'
                    : 'Check open dates directly on the calendar.'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionError(null);
                    setCurrentStep(1);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'ES' ? 'Cambiar Fechas en Calendario' : 'Change Dates in Calendar'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cuerpo del Modal con Scroll Aislado */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">

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

              {/* Selector de Fechas y Horarios Boutique Showroom (integrado, sin popups desalineados) */}
              <div className="space-y-2">
                <ShowroomDatePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(newStart, newEnd) => {
                    setStartDate(newStart);
                    setEndDate(newEnd);
                    setSubmissionError(null);
                  }}
                  blockedRanges={vehicleBlockedRanges}
                  pickupTime={pickupTime}
                  returnTime={returnTime}
                  onPickupTimeChange={setPickupTime}
                  onReturnTimeChange={setReturnTime}
                  language={language}
                  minDate={todayStr}
                />
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
                    onClick={() => {
                      setDeliveryLocation('AIRPORT');
                      if (!deliveryAddress || deliveryAddress.includes('Hotel')) {
                        setDeliveryAddress('Aeropuerto JMC (Rionegro / Medellín - MDE)');
                      }
                    }}
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
                    onClick={() => {
                      setDeliveryLocation('HOTEL_RESIDENCE');
                      if (deliveryAddress.includes('Aeropuerto')) {
                        setDeliveryAddress('');
                      }
                    }}
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

                {deliveryLocation === 'AIRPORT' && (
                  <div className="animate-fade-in pt-1 space-y-2">
                    <label className="block text-[11px] text-silver-400">
                      {language === 'ES' ? 'Terminal Aérea para Entrega Meet & Greet *' : 'Airport for Meet & Greet Handover *'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Aeropuerto JMC (Rionegro / Medellín - MDE)',
                        'Aeropuerto Olaya Herrera (Medellín - EOH)',
                        'Aeropuerto El Dorado (Bogotá - BOG)',
                        'Aeropuerto Alfonso Bonilla (Cali - CLO)',
                      ].map((apt) => (
                        <button
                          key={apt}
                          type="button"
                          onClick={() => setDeliveryAddress(apt)}
                          className={`px-3 py-2 rounded-lg text-left text-xs border transition-all truncate ${
                            deliveryAddress === apt
                              ? 'bg-gold-500/20 border-gold-500 text-gold-300 font-semibold'
                              : 'bg-carbon-800 border-carbon-750 text-silver-400 hover:text-silver-200'
                          }`}
                        >
                          ✈️ {apt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={
                        language === 'ES'
                          ? 'O especifica aerolínea, número de vuelo o hangar privado...'
                          : 'Or specify flight number or private hangar...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-xs focus:outline-none focus:border-gold-500"
                    />
                  </div>
                )}

                {deliveryLocation === 'HOTEL_RESIDENCE' && (
                  <div className="animate-fade-in pt-1 space-y-2">
                    <label htmlFor="flow-delivery-addr" className="block text-[11px] text-silver-400">
                      {language === 'ES' ? 'Dirección exacta o Nombre del Hotel *' : 'Exact address or Hotel name *'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['El Poblado', 'Llanogrande', 'Laureles', 'Envigado', 'Zona Rosa Bogotá'].map((zone) => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() =>
                            setDeliveryAddress((prev) =>
                              prev && !prev.includes(zone) ? `${prev}, ${zone}` : zone
                            )
                          }
                          className="text-[10px] px-2.5 py-1 rounded bg-carbon-800 border border-carbon-700 text-silver-400 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                        >
                          + {zone}
                        </button>
                      ))}
                    </div>
                    <input
                      id="flow-delivery-addr"
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={
                        language === 'ES'
                          ? 'Ej. Hotel The Charlee / Hotel Click Clack / Penthouse Poblado'
                          : 'e.g. The Charlee Hotel / Penthouse Poblado'
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-800 border border-carbon-700 text-silver-200 text-base sm:text-xs focus:outline-none focus:border-gold-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-base sm:text-xs focus:outline-none focus:border-gold-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-base sm:text-xs focus:outline-none focus:border-gold-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-base sm:text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label htmlFor="kyc-phone" className="block text-[11px] text-silver-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gold-400" />
                    {language === 'ES' ? 'Teléfono Móvil / WhatsApp *' : 'Mobile Phone / WhatsApp *'}
                  </label>
                  <div className="flex gap-2">
                    <select
                      aria-label={language === 'ES' ? 'Prefijo de país' : 'Country prefix'}
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className="px-2.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-gold-300 text-xs focus:outline-none focus:border-gold-500 font-mono font-bold"
                    >
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+507">🇵🇦 +507</option>
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                    </select>
                    <input
                      id="kyc-phone"
                      type="tel"
                      required
                      value={phoneNumber || clientInfo.phone}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setClientInfo({ ...clientInfo, phone: e.target.value });
                      }}
                      placeholder="300 123 4567"
                      className="flex-1 px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-base sm:text-xs focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-200 text-base sm:text-xs focus:outline-none focus:border-gold-500"
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
                  className="w-full sm:w-1/3 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {language === 'ES' ? 'VOLVER' : 'BACK'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-2/3 min-h-[44px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-carbon-950 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'ES' ? 'PROCESANDO RESERVA...' : 'PROCESSING BOOKING...'}</span>
                    </span>
                  ) : (
                    language === 'ES' ? 'CONFIRMAR & GENERAR VOUCHER' : 'CONFIRM & GENERATE VOUCHER'
                  )}
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
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-carbon-800/90 border border-gold-500/40 text-gold-400 text-xs font-mono shadow-md mb-2">
                  <span className="text-silver-400 uppercase tracking-wider text-[10px]">
                    {language === 'ES' ? 'Código Oficial:' : 'Official Code:'}
                  </span>
                  <strong className="text-silver-100 font-mono tracking-widest text-sm">
                    {createdReservation.id}
                  </strong>
                  <button
                    type="button"
                    onClick={handleCopyReservationCode}
                    title={language === 'ES' ? 'Copiar código' : 'Copy code'}
                    className="ml-1 p-1 hover:bg-gold-500/20 rounded text-silver-300 hover:text-gold-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-sans font-medium text-[11px]">
                        <Check className="w-3.5 h-3.5" /> {language === 'ES' ? 'Copiado' : 'Copied'}
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-80 hover:opacity-100" />
                    )}
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-silver-100 font-display">
                  {language === 'ES' ? '¡Solicitud Registrada con Éxito!' : 'Booking Request Confirmed!'}
                </h3>
                <p className="text-xs sm:text-sm text-silver-400 mt-1.5 max-w-md mx-auto">
                  {language === 'ES' ? (
                    <>
                      Tu reserva ya quedó registrada en el sistema. Para{' '}
                      <strong className="text-emerald-400 font-semibold">validar tus documentos y coordinar la entrega</strong>,
                      continúa a WhatsApp con nuestro Concierge oficial.
                    </>
                  ) : (
                    <>
                      Your reservation has been recorded in our system. To{' '}
                      <strong className="text-emerald-400 font-semibold">verify documents and coordinate handover</strong>,
                      continue to WhatsApp with our VIP Concierge.
                    </>
                  )}
                </p>
              </div>

              {/* Voucher Card Formal */}
              <div
                id="official-booking-voucher"
                className="p-5 sm:p-7 rounded-2xl bg-carbon-850 border border-carbon-800 text-left text-xs space-y-4 max-w-lg mx-auto shadow-xl print:max-w-none print:bg-white print:border print:border-gray-300 print:text-black print:p-6"
              >
                
                {/* Cabecera del Voucher con Logo para Impresión */}
                <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-black">
                  <div>
                    <h2 className="text-xl font-black text-black uppercase tracking-tight">ELITE WHEELS</h2>
                    <p className="text-[11px] text-gray-600">Boutique Luxury Car Rental • Colombia</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase font-mono block">Código de Reserva</span>
                    <span className="text-base font-bold font-mono text-black">{createdReservation.id}</span>
                  </div>
                </div>

                {/* Cabecera del Voucher */}
                <div className="flex items-center gap-3 pb-3 border-b border-carbon-750 print:border-gray-200">
                  <img
                    src={createdReservation.vehicleImage}
                    alt={createdReservation.vehicleName}
                    className="w-16 h-11 object-cover rounded-lg border border-carbon-700 print:border-gray-300"
                  />
                  <div>
                    <span className="text-[10px] text-gold-400 print:text-gray-500 font-semibold uppercase">
                      {language === 'ES' ? 'Vehículo Asignado' : 'Assigned Vehicle'}
                    </span>
                    <h5 className="text-sm font-bold text-silver-100 print:text-black font-display">
                      {createdReservation.vehicleName}
                    </h5>
                    <span className="text-silver-500 print:text-gray-600 font-mono text-[11px]">
                      {language === 'ES' ? 'Placa:' : 'Plate:'} {createdReservation.vehiclePlate}
                    </span>
                  </div>
                </div>

                {/* Datos de Agenda y Entrega */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-carbon-750 print:border-gray-200">
                  <div>
                    <span className="text-silver-500 print:text-gray-500 text-[10px] block uppercase">
                      {language === 'ES' ? 'Periodo de Reserva' : 'Booking Period'}
                    </span>
                    <span className="font-semibold text-silver-200 print:text-black">
                      {createdReservation.startDate} {language === 'ES' ? 'al' : 'to'} {createdReservation.endDate}
                    </span>
                    <span className="text-silver-500 print:text-gray-600 block text-[11px]">
                      ({createdReservation.pricing.days} {language === 'ES' ? 'día(s)' : 'day(s)'} • {createdReservation.pickupTime})
                    </span>
                  </div>
                  <div>
                    <span className="text-silver-500 print:text-gray-500 text-[10px] block uppercase">
                      {language === 'ES' ? 'Lugar de Entrega' : 'Delivery Location'}
                    </span>
                    <span className="font-semibold text-silver-200 print:text-black">
                      {getDeliveryLabel(createdReservation.deliveryLocation)}
                    </span>
                    {createdReservation.deliveryAddress && (
                      <span className="text-silver-500 print:text-gray-600 block text-[11px] truncate">
                        {createdReservation.deliveryAddress}
                      </span>
                    )}
                  </div>
                </div>

                {/* Titular */}
                <div className="pb-3 border-b border-carbon-750 print:border-gray-200">
                  <span className="text-silver-500 print:text-gray-500 text-[10px] block uppercase">
                    {language === 'ES' ? 'Titular / Conductor' : 'Primary Driver'}
                  </span>
                  <span className="font-semibold text-silver-200 print:text-black">{createdReservation.client.fullName}</span>
                  <div className="text-silver-400 print:text-gray-600 text-[11px] flex gap-3 mt-0.5">
                    <span>Doc: {createdReservation.client.documentId}</span>
                    <span>•</span>
                    <span>{language === 'ES' ? 'Licencia:' : 'License:'} {createdReservation.client.driverLicense}</span>
                    <span>•</span>
                    <span>Tel: {createdReservation.client.phone}</span>
                  </div>
                </div>

                {/* Desglose Financiero Final */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-silver-400 print:text-gray-700">
                    <span>
                      {language === 'ES' ? 'Subtotal Renta' : 'Rental Subtotal'} ({createdReservation.pricing.days}{' '}
                      {language === 'ES' ? 'días' : 'days'}):
                    </span>
                    <span className="font-semibold text-silver-200 print:text-black">
                      {formatPrice(createdReservation.pricing.rentalTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-silver-400 print:text-gray-700">
                    <span>
                      {language === 'ES'
                        ? 'Depósito de Garantía (Reembolsable):'
                        : 'Security Deposit (Refundable):'}
                    </span>
                    <span className="font-semibold text-silver-200 print:text-black">
                      {formatPrice(createdReservation.pricing.securityDeposit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-silver-400 print:text-gray-700">
                    <span>
                      {language === 'ES' ? 'Seguro VIP a Todo Riesgo:' : 'VIP Comprehensive Insurance:'}
                    </span>
                    <span className="font-semibold text-emerald-400 print:text-emerald-700">
                      {language === 'ES' ? 'Incluido ($0)' : 'Included ($0)'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-carbon-750 print:border-gray-300 flex justify-between text-sm font-bold text-silver-100 print:text-black">
                    <span>
                      {language === 'ES' ? 'Total Estimado al Despacho:' : 'Estimated Total at Handover:'}
                    </span>
                    <span className="font-mono text-gold-400 print:text-black text-base">
                      {formatPrice(
                        createdReservation.pricing.rentalTotal +
                          createdReservation.pricing.securityDeposit
                      )}
                    </span>
                  </div>
                </div>

                {/* Nota de validez para impresión */}
                <div className="hidden print:block pt-3 border-t border-gray-300 text-[10px] text-gray-500">
                  <p>Este comprobante certifica la solicitud de reserva en Elite Wheels Showroom. Entrega sujeta a validación física de documentos de identidad y licencia de conducción en el momento del despacho.</p>
                </div>

              </div>

              {/* Botones de Acción (Nivel Pro & Máxima Conversión) */}
              <div className="space-y-3 max-w-lg mx-auto pt-2 print:hidden">
                {/* Botón Principal: WhatsApp Oficial Verde Concierge */}
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full group relative flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0f776a] text-carbon-950 font-bold shadow-xl shadow-[#25D366]/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-black/10 flex items-center justify-center text-carbon-950 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wide text-carbon-950 flex items-center gap-1.5 sm:gap-2">
                      <span className="truncate">{language === 'ES' ? 'CONTINUAR A WHATSAPP CON MI RESERVA' : 'CONTINUE TO WHATSAPP CONCIERGE'}</span>
                      <Send className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div className="text-[10.5px] sm:text-[11px] font-medium text-carbon-900/90 truncate">
                      {language === 'ES'
                        ? 'Coordinar entrega y validar documentos inmediatamente'
                        : 'Coordinate handover & review credentials now'}
                    </div>
                  </div>
                </button>

                {/* Acciones Secundarias: Imprimir / PDF y Copiar Resumen */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handlePrintVoucher}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 hover:border-gold-500/40 text-silver-200 hover:text-gold-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-gold-400" />
                    <span>{language === 'ES' ? 'Imprimir / PDF' : 'Print / PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 hover:border-gold-500/40 text-silver-200 hover:text-gold-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">{language === 'ES' ? '¡Copiado!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-gold-400" />
                        <span>{language === 'ES' ? 'Compartir' : 'Share'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Botón Terciario: Finalizar y Volver sin fricción */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-silver-400 hover:text-silver-100 transition-colors cursor-pointer text-center"
                >
                  {language === 'ES' ? 'Finalizar y volver al showroom' : 'Finish and return to showroom'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
