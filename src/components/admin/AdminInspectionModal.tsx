import React, { useState, useEffect } from 'react';
import { Reservation } from '../../types/reservation';
import { Vehicle } from '../../types/vehicle';
import {
  VehicleInspection,
  VehicleZone,
  DamageSeverity,
  DamageItem,
  CleanlinessLevel,
  DepositResolution,
} from '../../types/inspection';
import {
  getInspectionsByReservation,
  saveInspection,
  compareInspections,
} from '../../services/inspectionService';
import { uploadVehiclePhoto } from '../../services/storageService';
import { luxuryAlert } from '../../context/AlertContext';
import {
  X,
  ClipboardCheck,
  Fuel,
  Gauge,
  Camera,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Loader2,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AdminInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  vehicle?: Vehicle | null;
  onSaveSuccess?: () => void;
}

const VEHICLE_ZONES: { zone: VehicleZone; label: string; icon: string }[] = [
  { zone: 'FRONT', label: 'Frontal & Parachoques', icon: '🏎️' },
  { zone: 'LEFT_SIDE', label: 'Lateral Izquierdo & Espejo', icon: '🚗' },
  { zone: 'RIGHT_SIDE', label: 'Lateral Derecho & Espejo', icon: '🚗' },
  { zone: 'REAR', label: 'Posterior, Difusor & Escape', icon: '🏁' },
  { zone: 'WHEELS', label: 'Rines & Neumáticos (4 ruedas)', icon: '🛞' },
  { zone: 'WINDSHIELD', label: 'Parabrisas & Cristales', icon: '🪟' },
  { zone: 'ROOF', label: 'Techo / Capota', icon: '⚡' },
  { zone: 'INTERIOR', label: 'Habitáculo & Tapicería VIP', icon: '🛋️' },
];

export const AdminInspectionModal: React.FC<AdminInspectionModalProps> = ({
  isOpen,
  onClose,
  reservation,
  vehicle: _vehicle,
  onSaveSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'CHECK_IN' | 'CHECK_OUT' | 'COMPARE'>('CHECK_IN');
  const [existingCheckIn, setExistingCheckIn] = useState<VehicleInspection | null>(null);
  const [existingCheckOut, setExistingCheckOut] = useState<VehicleInspection | null>(null);


  // Form State
  const [odometer, setOdometer] = useState<number>(14500);
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [cleanliness, setCleanliness] = useState<CleanlinessLevel>('IMMACULATE');
  const [damages, setDamages] = useState<DamageItem[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [depositResolution, setDepositResolution] = useState<DepositResolution>('REFUND_FULL');
  const [deductionAmount, setDeductionAmount] = useState<number>(0);

  // New damage helper
  const [selectedZone, setSelectedZone] = useState<VehicleZone>('FRONT');
  const [damageSeverity, setDamageSeverity] = useState<DamageSeverity>('MINOR');
  const [damageDescription, setDamageDescription] = useState<string>('');

  // Status & Feedback
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Cargar inspecciones existentes de la reserva
  useEffect(() => {
    if (!reservation || !isOpen) return;

    let isMounted = true;

    getInspectionsByReservation(reservation.id)
      .then((list) => {
        if (!isMounted) return;
        const inInsp = list.find((i) => i.type === 'CHECK_IN') || null;
        const outInsp = list.find((i) => i.type === 'CHECK_OUT') || null;

        setExistingCheckIn(inInsp);
        setExistingCheckOut(outInsp);

        if (inInsp && !outInsp) {
          // Si ya hay Check-in pero no Check-out, pre-seleccionar pestaña de Check-out
          setActiveTab('CHECK_OUT');
          setOdometer(inInsp.odometer + 150);
          setFuelLevel(100);
          setCleanliness('CLEAN');
          setDamages([]);
          setPhotos([]);
          setNotes('');
        } else if (inInsp && outInsp) {
          // Si ambos existen, mostrar pestaña de comparativa
          setActiveTab('COMPARE');
        } else {
          // Si ninguno existe, preparar Check-in
          setActiveTab('CHECK_IN');
          setOdometer(14000);
          setFuelLevel(100);
          setCleanliness('IMMACULATE');
          setDamages([]);
          setPhotos([]);
          setNotes('Vehículo en condiciones impecables de Showroom.');
        }
      });


    return () => {
      isMounted = false;
    };
  }, [reservation, isOpen]);

  if (!isOpen || !reservation) return null;

  // Manejador para agregar daño mapeado
  const handleAddDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageDescription.trim()) return;

    const zoneObj = VEHICLE_ZONES.find((z) => z.zone === selectedZone);
    const newDamage: DamageItem = {
      id: `dmg-${Date.now()}`,
      zone: selectedZone,
      zoneLabel: zoneObj?.label || selectedZone,
      severity: damageSeverity,
      description: damageDescription.trim(),
      createdAt: new Date().toISOString(),
    };

    setDamages([...damages, newDamage]);
    setDamageDescription('');
  };

  const handleRemoveDamage = (id: string) => {
    setDamages(damages.filter((d) => d.id !== id));
  };

  // Subir fotos de la inspección
  const handleUploadInspectionPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPhotos((prev) => [...prev, localUrl]);

    setIsUploadingPhoto(true);
    try {
      const res = await uploadVehiclePhoto(reservation.vehicleId, file, photos.length);
      setPhotos((prev) => {
        const withoutBlob = prev.filter((p) => p !== localUrl);
        return [...withoutBlob, res.url];
      });
    } catch (err) {
      console.warn('Fallo subida a nube, se mantiene en memoria local:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Guardar Acta de Inspección
  const handleSaveInspection = async () => {
    setIsSubmitting(true);
    try {
      const payload: Omit<VehicleInspection, 'id' | 'createdAt' | 'updatedAt'> = {
        reservationId: reservation.id,
        vehicleId: reservation.vehicleId,
        vehicleName: reservation.vehicleName,
        vehiclePlate: reservation.vehiclePlate,
        clientName: reservation.client.fullName,
        type: activeTab === 'CHECK_IN' ? 'CHECK_IN' : 'CHECK_OUT',
        odometer: Number(odometer),
        fuelLevel: Number(fuelLevel),
        cleanliness,
        damages,
        photos,
        inspectorName: 'Víctor Tamayo (Director General)',
        notes: notes.trim() || undefined,
        depositResolution: activeTab === 'CHECK_OUT' ? depositResolution : undefined,
        deductionAmount: activeTab === 'CHECK_OUT' ? deductionAmount : undefined,
      };

      const saved = await saveInspection(payload);
      if (saved.type === 'CHECK_IN') {
        setExistingCheckIn(saved);
        setFeedbackToast('✓ Acta de Entrega (Check-in) guardada con éxito.');
      } else {
        setExistingCheckOut(saved);
        setFeedbackToast('✓ Acta de Devolución (Check-out) y liquidación guardadas.');
        setActiveTab('COMPARE');
      }

      setTimeout(() => setFeedbackToast(null), 3500);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      luxuryAlert.error({
        title: 'Error en Inspección',
        message: err?.message || 'Fallo de red al guardar el acta de inspección.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Comparativa si ambos existen
  const comparison =
    existingCheckIn && existingCheckOut
      ? compareInspections(
          existingCheckIn,
          existingCheckOut,
          reservation.pricing?.securityDeposit || 3000
        )
      : null;

  // Bloquear scroll de la página de fondo mientras la inspección esté abierta
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-carbon-950/90 backdrop-blur-xl overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-t-3xl sm:rounded-3xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] animate-slide-up sm:animate-fade-in"
      >
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-3.5 sm:p-6 sm:px-8 border-b border-carbon-800 bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gold-500/15 text-gold-400 flex items-center justify-center border border-gold-500/30 flex-shrink-0">
              <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gold-500/20 text-gold-400 border border-gold-500/30 font-mono truncate">
                  INSPECCIÓN
                </span>
                <span className="text-silver-400 text-[11px] sm:text-xs font-mono truncate">
                  #{reservation.id} • {reservation.vehiclePlate}
                </span>
              </div>
              <h2 className="text-sm sm:text-xl font-black text-white font-display truncate">
                Inspección de Flota VIP
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-carbon-800 text-silver-400 hover:text-white hover:bg-carbon-750 transition-colors border border-carbon-700 flex-shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación de la Inspección */}
        <div className="flex border-b border-carbon-800 bg-carbon-850/60 px-3 sm:px-8 gap-2 pt-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('CHECK_IN')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'CHECK_IN'
                ? 'border-gold-500 text-gold-400 bg-carbon-900/90 rounded-t-xl'
                : 'border-transparent text-silver-400 hover:text-silver-200'
            }`}
          >
            <Gauge className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">1. Entrega al Cliente (Check-in)</span>
            <span className="inline sm:hidden">1. Entrega</span>
            {existingCheckIn && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1 flex-shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHECK_OUT')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'CHECK_OUT'
                ? 'border-gold-500 text-gold-400 bg-carbon-900/90 rounded-t-xl'
                : 'border-transparent text-silver-400 hover:text-silver-200'
            }`}
          >
            <Scale className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">2. Devolución (Check-out)</span>
            <span className="inline sm:hidden">2. Devolución</span>
            {existingCheckOut && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1 flex-shrink-0" />}
          </button>

          {existingCheckIn && existingCheckOut && (
            <button
              type="button"
              onClick={() => setActiveTab('COMPARE')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'COMPARE'
                  ? 'border-emerald-500 text-emerald-400 bg-carbon-900/90 rounded-t-xl'
                  : 'border-transparent text-silver-400 hover:text-silver-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">3. Liquidación & Depósito</span>
              <span className="inline sm:hidden">3. Balance</span>
            </button>
          )}
        </div>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="mx-5 sm:mx-8 mt-3 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* ======================================================== */}
          {/* MODO 1 Y 2: FORMULARIO DE CHECK-IN / CHECK-OUT           */}
          {/* ======================================================== */}
          {activeTab !== 'COMPARE' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Tarjeta de Resumen de la Unidad */}
              <div className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {reservation.vehicleImage && (
                    <img
                      src={reservation.vehicleImage}
                      alt={reservation.vehicleName}
                      className="w-20 h-14 rounded-xl object-cover border border-gold-500/40"
                    />
                  )}
                  <div>
                    <div className="text-xs text-silver-400 uppercase font-semibold">Superdeportivo</div>
                    <div className="text-base font-black text-white">{reservation.vehicleName}</div>
                    <div className="text-xs text-gold-400 font-mono">Placa: {reservation.vehiclePlate}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-silver-400 block">Conductor Titular VIP</span>
                  <span className="text-sm font-bold text-white">{reservation.client.fullName}</span>
                  <span className="text-xs text-emerald-400 font-mono block">
                    Garantía en Custodia: {formatCurrency(reservation.pricing?.securityDeposit || 0)}
                  </span>
                </div>
              </div>

              {/* Fila: Odómetro & Combustible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* 1. Odómetro Digital */}
                <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-3">
                  <label className="text-xs font-bold text-silver-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-gold-400" />
                    Lectura de Odómetro ({activeTab === 'CHECK_IN' ? 'Inicial' : 'Final'})
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={odometer}
                      onChange={(e) => setOdometer(Number(e.target.value))}
                      className="w-full text-2xl font-black font-mono bg-carbon-900 border border-carbon-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-silver-400 font-mono">
                      KILÓMETROS (KM)
                    </span>
                  </div>

                  {existingCheckIn && activeTab === 'CHECK_OUT' && (
                    <div className="text-xs text-silver-400 flex items-center justify-between pt-1 font-mono">
                      <span>Km Inicial Check-in:</span>
                      <strong className="text-white">{existingCheckIn.odometer.toLocaleString()} km</strong>
                    </div>
                  )}
                </div>

                {/* 2. Nivel de Combustible / Batería */}
                <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-silver-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Fuel className="w-4 h-4 text-gold-400" />
                      Nivel de Combustible (Extra 98 Octanos)
                    </label>
                    <span className="text-base font-black font-mono text-gold-400">
                      {fuelLevel}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(Number(e.target.value))}
                    className="w-full accent-gold-500 h-2 bg-carbon-700 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-silver-400 font-semibold">
                    <span>Vacío (0%)</span>
                    <span>1/4 (25%)</span>
                    <span>1/2 (50%)</span>
                    <span>3/4 (75%)</span>
                    <span className="text-emerald-400 font-bold">Tanque Lleno (100%)</span>
                  </div>
                </div>

              </div>

              {/* Selector de Nivel de Limpieza */}
              <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-3">
                <span className="text-xs font-bold text-silver-200 uppercase tracking-wider block">
                  Estado de Limpieza & Detailing Showroom
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'IMMACULATE', label: 'Impecable (Showroom 100%)', desc: 'Sin polvo, vidrios y cuero pulidos' },
                    { id: 'CLEAN', label: 'Limpio Estándar', desc: 'Polvo de carretera moderado' },
                    { id: 'REQUIRES_DETAILING', label: 'Requiere Detailing VIP', desc: 'Barro o interior con manchas' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCleanliness(lvl.id as CleanlinessLevel)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        cleanliness === lvl.id
                          ? 'bg-gold-500/15 border-gold-500/50 text-white'
                          : 'bg-carbon-900 border-carbon-750 text-silver-400 hover:text-silver-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl.label}</div>
                      <div className="text-[11px] text-silver-400 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapeo Visual de Daños & Novedades */}
              <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-silver-200 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-gold-400" />
                    Mapeo de Novedades de Carrocería ({damages.length} registradas)
                  </span>
                  <span className="text-[11px] text-silver-400 font-mono">
                    {damages.length === 0 ? '🟢 Sin rayones ni novedades' : '⚠️ Novedades reportadas'}
                  </span>
                </div>

                {/* Formulario Rápido para Agregar Novedad */}
                <form onSubmit={handleAddDamage} className="p-4 rounded-xl bg-carbon-900 border border-carbon-750 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-silver-400 font-semibold mb-1">Zona del Vehículo</label>
                      <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value as VehicleZone)}
                        className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                      >
                        {VEHICLE_ZONES.map((z) => (
                          <option key={z.zone} value={z.zone}>
                            {z.icon} {z.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-silver-400 font-semibold mb-1">Severidad</label>
                      <select
                        value={damageSeverity}
                        onChange={(e) => setDamageSeverity(e.target.value as DamageSeverity)}
                        className="w-full text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                      >
                        <option value="MINOR">Leve (Micro-rayón / Desgaste superficial)</option>
                        <option value="MODERATE">Moderado (Hendidura / Rayón profundo)</option>
                        <option value="SEVERE">Severo (Fisura / Daño estructural)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-silver-400 font-semibold mb-1">Descripción</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={damageDescription}
                          onChange={(e) => setDamageDescription(e.target.value)}
                          placeholder="Ej. Rayón de 2cm en rin delantero derecho"
                          className="flex-1 text-xs bg-carbon-800 border border-carbon-700 text-silver-100 rounded-lg px-3 py-2"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-carbon-950 text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Lista de Novedades Agregadas */}
                {damages.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {damages.map((dmg) => (
                      <div
                        key={dmg.id}
                        className="p-3 rounded-xl bg-carbon-900 border border-carbon-750 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dmg.severity === 'MINOR'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : dmg.severity === 'MODERATE'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {dmg.severity === 'MINOR' ? 'LEVE' : dmg.severity === 'MODERATE' ? 'MODERADO' : 'SEVERO'}
                          </span>
                          <span className="font-bold text-white">{dmg.zoneLabel}:</span>
                          <span className="text-silver-300">{dmg.description}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDamage(dmg.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 rounded"
                          title="Eliminar reporte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fotos de Evidencia */}
              <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-silver-200 uppercase tracking-wider block">
                      Fotografías de Evidencia ({photos.length})
                    </span>
                    <span className="text-[11px] text-silver-400">
                      Capturas del odómetro, tanque y estado de carrocería.
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 border border-gold-500/30 text-xs font-bold cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isUploadingPhoto ? 'Subiendo...' : 'Tomar / Subir Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadInspectionPhoto}
                    />
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {photos.map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-carbon-700 bg-carbon-900">
                        <img src={url} alt={`Evidencia ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resolución de Depósito de Garantía si es Check-Out */}
              {activeTab === 'CHECK_OUT' && (
                <div className="p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 space-y-3">
                  <span className="text-xs font-bold text-silver-200 uppercase tracking-wider block">
                    Resolución del Depósito en Garantía (Check-out)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'REFUND_FULL', label: 'Reembolso Íntegro 100%', desc: 'Sin novedades ni penalidades' },
                      { id: 'DEDUCT_PENALTY', label: 'Deducción de Garantía', desc: 'Descuento por combustible/km/daños' },
                      { id: 'HOLD_FOR_ASSESSMENT', label: 'Retención Preventiva', desc: 'En cotización de taller' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setDepositResolution(res.id as DepositResolution)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          depositResolution === res.id
                            ? 'bg-gold-500/15 border-gold-500/50 text-white'
                            : 'bg-carbon-900 border-carbon-750 text-silver-400 hover:text-silver-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{res.label}</div>
                        <div className="text-[11px] text-silver-400 mt-0.5">{res.desc}</div>
                      </button>
                    ))}
                  </div>

                  {depositResolution === 'DEDUCT_PENALTY' && (
                    <div className="pt-2 flex items-center gap-3">
                      <label className="text-xs text-silver-300 font-semibold">Monto a deducir ($USD):</label>
                      <input
                        type="number"
                        min={0}
                        max={reservation.pricing?.securityDeposit || 5000}
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(Number(e.target.value))}
                        className="w-36 text-xs font-mono font-bold bg-carbon-900 border border-carbon-700 text-gold-400 rounded-lg px-3 py-2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Botón Guardar Inspección */}
              <div className="pt-4 border-t border-carbon-800 flex items-center justify-between">

                <div className="text-xs text-silver-400 font-mono">
                  Inspector Responsable: <strong>Víctor Tamayo</strong>
                </div>

                <button
                  type="button"
                  onClick={handleSaveInspection}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 text-xs font-black shadow-xl transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Acta...</span>
                    </>
                  ) : (
                    <span>
                      {activeTab === 'CHECK_IN'
                        ? 'Firmar & Guardar Acta de Entrega'
                        : 'Firmar & Guardar Acta de Devolución'}
                    </span>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* MODO 3: COMPARATIVA & RESOLUCIÓN DE GARANTÍA             */}
          {/* ======================================================== */}
          {activeTab === 'COMPARE' && comparison && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="p-5 rounded-2xl bg-gradient-to-r from-carbon-850 to-carbon-800 border border-carbon-750 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gold-400 uppercase tracking-widest font-mono">
                    AUDITORÍA COMPARATIVA AUTOMOTRIZ
                  </div>
                  <h3 className="text-lg font-black text-white font-display">
                    Liquidación de Entrega vs. Devolución
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-silver-400 uppercase block">Depósito Inicial</span>
                  <span className="text-xl font-black font-mono text-white">
                    {formatCurrency(reservation.pricing?.securityDeposit || 3000)}
                  </span>
                </div>
              </div>

              {/* Grid Métricas de Diferencia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-silver-400">Kilómetros Recorridos</span>
                  <div className="text-2xl font-black font-mono text-white">
                    {comparison.distanceDriven.toLocaleString()} km
                  </div>
                  <div className="text-xs text-silver-400">
                    Inicial: {comparison.checkIn.odometer.toLocaleString()} km ➔ Final: {comparison.checkOut.odometer.toLocaleString()} km
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-silver-400">Diferencia de Combustible</span>
                  <div
                    className={`text-2xl font-black font-mono ${
                      comparison.fuelDifference >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {comparison.fuelDifference >= 0 ? `+${comparison.fuelDifference}%` : `${comparison.fuelDifference}%`}
                  </div>
                  <div className="text-xs text-silver-400">
                    Entregado: {comparison.checkIn.fuelLevel}% ➔ Recibido: {comparison.checkOut.fuelLevel}%
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-silver-400">Nuevos Daños Detectados</span>
                  <div
                    className={`text-2xl font-black font-mono ${
                      comparison.newDamagesCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {comparison.newDamagesCount === 0 ? '0 Novedades' : `${comparison.newDamagesCount} Novedad(es)`}
                  </div>
                  <div className="text-xs text-silver-400">
                    {comparison.newDamagesCount === 0 ? 'Carrocería en estado idéntico' : 'Requiere cobro de reparación'}
                  </div>
                </div>

              </div>

              {/* Liquidación del Depósito de Garantía */}
              <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-800 space-y-4">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider block">
                  Resolución del Depósito de Garantía Reembolsable
                </span>

                <div className="space-y-2 text-xs border-b border-carbon-800 pb-4">
                  <div className="flex justify-between text-silver-300">
                    <span>Depósito de Garantía Original en Custodia:</span>
                    <strong className="font-mono text-white">
                      +{formatCurrency(reservation.pricing?.securityDeposit || 3000)}
                    </strong>
                  </div>

                  {comparison.suggestedFuelPenalty > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Deducción por faltante de combustible ({Math.abs(comparison.fuelDifference)}%):</span>
                      <strong className="font-mono">-{formatCurrency(comparison.suggestedFuelPenalty)}</strong>
                    </div>
                  )}

                  {comparison.suggestedMileagePenalty > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Deducción por exceso de kilometraje:</span>
                      <strong className="font-mono">-{formatCurrency(comparison.suggestedMileagePenalty)}</strong>
                    </div>
                  )}

                  {comparison.newDamagesCount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Deducción estimada por reparación de novedades:</span>
                      <strong className="font-mono">
                        -{formatCurrency(comparison.totalSuggestedDeduction - comparison.suggestedFuelPenalty - comparison.suggestedMileagePenalty)}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-silver-400 uppercase block font-semibold">
                      Total Neto a Reembolsar al Cliente:
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {formatCurrency(comparison.netDepositToRefund)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Auditoría Verificada</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
