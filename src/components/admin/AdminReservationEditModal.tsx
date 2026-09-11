import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types/vehicle';
import { Reservation, ReservationStatus, DeliveryLocationType } from '../../types/reservation';
import { formatCurrency } from '../../utils/formatters';
import { calculateDaysBetween } from '../../services/reservationService';
import {
  X,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface AdminReservationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  vehicles: Vehicle[];
  onSave: (reservationId: string, updates: Partial<Reservation>) => Promise<void> | void;
  onDelete: (reservationId: string) => Promise<void> | void;
}

export const AdminReservationEditModal: React.FC<AdminReservationEditModalProps> = ({
  isOpen,
  onClose,
  reservation,
  vehicles,
  onSave,
  onDelete,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [returnTime, setReturnTime] = useState<string>('10:00');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationType>('SHOWROOM');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  
  // Cliente KYC
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [documentId, setDocumentId] = useState<string>('');
  const [driverLicense, setDriverLicense] = useState<string>('');

  // Estado y Notas
  const [status, setStatus] = useState<ReservationStatus>('PENDING');
  const [notes, setNotes] = useState<string>('');

  // UI States
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Precargar datos cuando cambia la reserva seleccionada
  useEffect(() => {
    if (reservation) {
      setSelectedVehicleId(reservation.vehicleId || '');
      setStartDate(reservation.startDate || '');
      setEndDate(reservation.endDate || '');
      setPickupTime(reservation.pickupTime || '10:00');
      setReturnTime(reservation.returnTime || '10:00');
      setDeliveryLocation(reservation.deliveryLocation || 'SHOWROOM');
      setDeliveryAddress(reservation.deliveryAddress || '');

      setFullName(reservation.client?.fullName || '');
      setPhone(reservation.client?.phone || '');
      setEmail(reservation.client?.email || '');
      setDocumentId(reservation.client?.documentId || '');
      setDriverLicense(reservation.client?.driverLicense || '');

      setStatus(reservation.status || 'PENDING');
      setNotes(reservation.notes || '');
      setIsConfirmingDelete(false);
      setErrorMsg(null);
    }
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  // Vehículo seleccionado actualmente en el modal
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const dailyRate = currentVehicle ? currentVehicle.pricePerDay : (reservation.pricing?.dailyRate || 1000);

  // Cálculo en vivo de días y total
  const calculatedDays = startDate && endDate ? calculateDaysBetween(startDate, endDate) : 1;
  const calculatedRentalTotal = calculatedDays * dailyRate;
  const calculatedDeposit = Math.max(2000, dailyRate * 2);
  const calculatedGrandTotal = calculatedRentalTotal + calculatedDeposit;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('El nombre completo del cliente es obligatorio.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    if (endDate < startDate) {
      setErrorMsg('La fecha de fin debe ser igual o posterior a la de inicio.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<Reservation> = {
        vehicleId: currentVehicle ? currentVehicle.id : reservation.vehicleId,
        vehicleName: currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model}` : reservation.vehicleName,
        vehicleImage: currentVehicle ? currentVehicle.mainImage : reservation.vehicleImage,
        vehiclePlate: currentVehicle ? currentVehicle.plate : reservation.vehiclePlate,
        startDate,
        endDate,
        pickupTime,
        returnTime,
        deliveryLocation,
        deliveryAddress: deliveryLocation !== 'SHOWROOM' ? deliveryAddress : '',
        client: {
          ...reservation.client,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          documentId: documentId.trim(),
          driverLicense: driverLicense.trim(),
        },
        status,
        notes: notes.trim(),
        pricing: {
          dailyRate,
          days: calculatedDays,
          rentalTotal: calculatedRentalTotal,
          securityDeposit: calculatedDeposit,
          insuranceIncluded: true,
          currency: 'USD',
        },
      };

      await onSave(reservation.id, updates);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(reservation.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al eliminar la reserva.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-carbon-900 border-2 border-gold-500/40 shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-silver-100">
        
        {/* Encabezado del Modal */}
        <div className="p-5 sm:p-6 border-b border-carbon-800 bg-carbon-850/80 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-carbon-800 text-gold-400 px-2.5 py-0.5 rounded-md border border-gold-500/30">
                  {reservation.id}
                </span>
                <span className="text-xs font-mono text-silver-400">
                  {status}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight mt-0.5">
                Editar Contrato & Detalles de Reserva
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white border border-carbon-750 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de Error si aplica */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario con Scroll */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* SECCIÓN 1: VEHÍCULO ASIGNADO */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-silver-300 flex items-center gap-2">
              <Car className="w-4 h-4 text-gold-400" />
              <span>Vehículo Asignado</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-bold text-sm focus:outline-none focus:border-gold-500 transition-colors"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.plate}) - ${v.pricePerDay} USD/día
                    </option>
                  ))}
                </select>
              </div>

              {currentVehicle && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-carbon-850 border border-carbon-800">
                  <img
                    src={currentVehicle.mainImage}
                    alt={currentVehicle.model}
                    className="w-14 h-11 object-cover rounded-lg border border-carbon-700 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{currentVehicle.model}</div>
                    <div className="text-xs font-mono font-bold text-gold-400">${currentVehicle.pricePerDay}/d</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: FECHAS Y LOGÍSTICA */}
          <div className="space-y-4 pt-4 border-t border-carbon-800">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-silver-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>Intervalo de Fechas & Horarios</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Fecha de Recogida</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Hora Recogida</label>
                <div className="relative">
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                  <Clock className="w-4 h-4 text-silver-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Fecha de Devolución</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Hora Devolución</label>
                <div className="relative">
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                  <Clock className="w-4 h-4 text-silver-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lugar de Entrega */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  <span>Modalidad de Entrega</span>
                </label>
                <select
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value as DeliveryLocationType)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-bold text-sm focus:outline-none focus:border-gold-500"
                >
                  <option value="SHOWROOM">Showroom Central VIP</option>
                  <option value="AIRPORT">Aeropuerto Internacional (Meet & Greet VIP)</option>
                  <option value="HOTEL_RESIDENCE">Hotel / Residencia Privada</option>
                </select>
              </div>

              {deliveryLocation !== 'SHOWROOM' && (
                <div>
                  <label className="block text-xs text-silver-400 font-semibold mb-1">
                    Dirección Específica o Aerolínea/Vuelo
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ej. Hotel Click Clack, El Poblado / Vuelo AV9340"
                    className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 3: DATOS DEL CONDUCTOR KYC */}
          <div className="space-y-4 pt-4 border-t border-carbon-800">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-silver-300 flex items-center gap-2">
              <User className="w-4 h-4 text-gold-400" />
              <span>Conductor Titular (KYC)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white text-sm font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>Teléfono Móvil</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  <span>Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-silver-400" />
                  <span>Documento / Pasaporte</span>
                </label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Licencia de Conducir</label>
                <input
                  type="text"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs text-silver-400 font-semibold mb-1">Estado de la Reserva</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                  className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white font-black text-sm focus:outline-none focus:border-gold-500"
                >
                  <option value="PENDING">PENDING (Pendiente)</option>
                  <option value="CONFIRMED">CONFIRMED (Confirmada)</option>
                  <option value="ACTIVE">ACTIVE (En Curso)</option>
                  <option value="COMPLETED">COMPLETED (Completada)</option>
                  <option value="CANCELLED">CANCELLED (Cancelada)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Taller / Bloqueo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: NOTAS Y OBSERVACIONES */}
          <div className="space-y-2 pt-4 border-t border-carbon-800">
            <label className="block text-xs text-silver-400 font-semibold">Notas Especiales u Observaciones Operativas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Conductor VIP solicita botella de agua con gas y entrega puntual en pista privada."
              className="w-full p-3 rounded-xl bg-carbon-850 border border-carbon-750 text-white text-sm focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>

          {/* SECCIÓN 5: DESGLOSE FINANCIERO EN VIVO */}
          <div className="p-4 rounded-2xl bg-carbon-850/80 border border-carbon-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-silver-400 uppercase tracking-wider">Desglose Calculado</span>
              <div className="text-xs sm:text-sm text-silver-300">
                <span className="text-white font-bold">{calculatedDays} día(s)</span> × <span className="text-gold-400 font-mono font-bold">${dailyRate} USD</span>
                <span className="mx-2">•</span>
                <span>Depósito: <span className="font-mono text-white">${calculatedDeposit} USD</span></span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-carbon-750 sm:pl-6">
              <span className="text-xs text-silver-400 uppercase tracking-wider">Total Estimado</span>
              <div className="text-xl sm:text-2xl font-mono font-black text-gold-400">
                {formatCurrency(calculatedGrandTotal)} USD
              </div>
            </div>
          </div>

          {/* ZONA DE PELIGRO: CONFIRMACIÓN DE ELIMINACIÓN */}
          {isConfirmingDelete ? (
            <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500/70 space-y-3 animate-slide-up">
              <div className="flex items-center gap-3 text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold">
                  ¿Confirmas eliminar permanentemente esta reserva ({reservation.id})? Esta acción la borrará de Firestore y no se puede deshacer.
                </span>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-silver-300 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-4 py-2.5 rounded-xl bg-carbon-850 hover:bg-rose-950/60 border border-carbon-750 hover:border-rose-500/50 text-silver-400 hover:text-rose-400 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Reserva</span>
              </button>
            </div>
          )}

          {/* BARRA INFERIOR DE ACCIÓN */}
          <div className="pt-4 border-t border-carbon-800 flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0 bg-carbon-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cerrar sin Guardar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black text-sm shadow-xl shadow-gold-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
