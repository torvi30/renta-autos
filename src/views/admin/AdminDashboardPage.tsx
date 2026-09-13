import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus } from '../../types/vehicle';
import { Reservation, ReservationStatus } from '../../types/reservation';
import {
  getStoredReservations,
  updateReservationStatus,
  updateReservation,
  deleteReservation,
  subscribeReservations,
  seedInitialReservationsToFirestore,
  generateWhatsAppReservationLink,
  getDeliveryLocationLabel,
  createMaintenanceBlock,
} from '../../services/reservationService';
import {
  seedInitialVehiclesToFirestore,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../../services/vehicleService';
import { isFirebaseConfigured } from '../../services/firebase';
import { AdminSidebar, AdminTab } from '../../components/admin/AdminSidebar';
import { AdminMetricsGrid } from '../../components/admin/AdminMetricsGrid';
import { AdminReservationsView } from '../../components/admin/AdminReservationsView';
import { AdminFleetView } from '../../components/admin/AdminFleetView';
import { AdminClientsView } from '../../components/admin/AdminClientsView';
import { AdminCalendarView } from '../../components/admin/AdminCalendarView';
import { AdminAnalyticsView } from '../../components/admin/AdminAnalyticsView';
import { AdminSettingsView } from '../../components/admin/AdminSettingsView';
import { AdminVehicleModal } from '../../components/admin/AdminVehicleModal';

import {
  Menu,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  CalendarDays,
  Car,
  Users,
  Eye,
  Cloud,
  RefreshCw,
  Plus,
  Phone,
  Sparkles,
  Pencil,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Check,
  XCircle,
} from 'lucide-react';
import { formatCurrency, getCategoryLabel, getStatusConfig } from '../../utils/formatters';

interface AdminDashboardPageProps {
  vehicles: Vehicle[];
  onUpdateVehicleStatus: (vehicleId: string, newStatus: VehicleStatus) => void;
  onNavigateHome: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToVehicleDetail: (slug: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  vehicles,
  onUpdateVehicleStatus,
  onNavigateHome,
  onNavigateToCatalog,
  onNavigateToVehicleDetail,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [reservations, setReservations] = useState<Reservation[]>(getStoredReservations);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const cloudConnected = isFirebaseConfigured();

  // Suscripción reactiva en tiempo real a las reservas en Cloud Firestore
  useEffect(() => {
    const unsubscribe = subscribeReservations((updatedReservations) => {
      setReservations(updatedReservations);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSyncToCloud = async () => {
    setIsSeeding(true);
    showToast('Iniciando sincronización de flota y reservas con Cloud Firestore...');
    try {
      const vehRes = await seedInitialVehiclesToFirestore();
      const resRes = await seedInitialReservationsToFirestore();
      showToast(`${vehRes.message} (${resRes.message})`);
    } catch (err: any) {
      showToast(`Error de sincronización: ${err?.message || 'Fallo de conexión'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpdateReservationStatus = (id: string, newStatus: ReservationStatus) => {
    const updated = updateReservationStatus(id, newStatus);
    if (updated) {
      showToast(`Reserva ${id} actualizada a estado ${newStatus}.`);
    }
  };

  const handleLocalVehicleStatusUpdate = (vehicleId: string, newStatus: VehicleStatus) => {
    onUpdateVehicleStatus(vehicleId, newStatus);
    const car = vehicles.find((v) => v.id === vehicleId);
    showToast(`Estado de ${car?.model || 'Vehículo'} cambiado a ${newStatus}.`);
  };

  // Handlers CRUD de Vehículos
  const handleOpenCreateVehicle = () => {
    setVehicleToEdit(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (veh: Vehicle) => {
    setVehicleToEdit(veh);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (payload: Partial<Vehicle>) => {
    if (vehicleToEdit) {
      await updateVehicle(vehicleToEdit.id, payload);
      showToast(`Vehículo ${payload.brand || ''} ${payload.model || ''} actualizado con éxito.`);
    } else {
      const created = await createVehicle(payload as any);
      showToast(`Vehículo ${created.brand} ${created.model} registrado en la flota.`);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    await deleteVehicle(vehicleId);
    showToast('Vehículo retirado de la flota correctamente.');
  };

  const handleSaveDateBlock = async (
    vehicle: Vehicle,
    startDate: string,
    endDate: string,
    reason: string
  ) => {
    try {
      const result = createMaintenanceBlock({
        vehicle,
        startDate,
        endDate,
        reason,
      });
      if (result.reservation) {
        showToast(`Bloqueo de fechas guardado: ${result.reservation.id} (${reason})`);
      } else {
        showToast(`No se pudo registrar bloqueo: ${result.error || 'Error'}`);
      }
    } catch (err: any) {
      showToast(`Error al registrar bloqueo: ${err?.message || 'Fallo desconocido'}`);
    }
  };

  const handleUpdateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      const updated = await updateReservation(id, updates);
      if (updated) {
        showToast(`Reserva ${id} actualizada con éxito.`);
      } else {
        showToast('No se encontró la reserva.');
      }
    } catch (err: any) {
      showToast(`Error al actualizar reserva: ${err?.message || 'Fallo desconocido'}`);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await deleteReservation(id);
      showToast(`Reserva ${id} eliminada permanentemente.`);
    } catch (err: any) {
      showToast(`Error al eliminar reserva: ${err?.message || 'Fallo desconocido'}`);
    }
  };

  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  const availableVehiclesCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;

  // Promedio de tarifa diaria (ADR)
  const averageDailyRate = vehicles.length > 0
    ? Math.round(vehicles.reduce((acc, v) => acc + v.pricePerDay, 0) / vehicles.length)
    : 0;

  return (
    <div className="min-h-screen bg-carbon-950 text-silver-100 flex selection:bg-gold-500/20 selection:text-gold-400">
      
      {/* Toast Flotante de Notificaciones */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 sm:p-5 rounded-2xl bg-carbon-900 border-2 border-gold-500/60 text-white text-sm shadow-2xl flex items-center gap-3.5 animate-slide-up backdrop-blur-2xl">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-semibold text-silver-100">{toastMessage}</span>
        </div>
      )}

      {/* 1. Barra Lateral de Navegación Ejecutiva */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNavigateHome={onNavigateHome}
        pendingReservationsCount={pendingCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-carbon-950 via-carbon-900/30 to-carbon-950">
        
        {/* Cabecera Superior Ejecutiva con Mayor Presencia y Letra Grande */}
        <header className="border-b border-carbon-800/80 bg-carbon-900/95 backdrop-blur-2xl sticky top-0 z-30 px-5 sm:px-8 lg:px-10 py-4 sm:py-5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            {/* Botón Hamburguesa en Móvil */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-silver-400 hover:text-white border border-carbon-750 lg:hidden transition-colors"
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  PORTAL EJECUTIVO VIP
                </span>
                <span className="text-carbon-600 font-bold">•</span>
                <span className="text-xs sm:text-sm text-silver-300 font-mono uppercase font-bold">
                  {currentTab === 'dashboard'
                    ? 'Centro de Control'
                    : currentTab === 'calendar'
                    ? 'Cronograma & Ocupación'
                    : currentTab}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-display tracking-tight mt-1">
                {currentTab === 'dashboard' && 'Centro de Mando & Telemetría Comercial'}
                {currentTab === 'fleet' && 'Gestión Integral de Flota Boutique'}
                {currentTab === 'reservations' && 'Solicitudes & Ciclo de Vida de Reservas'}
                {currentTab === 'clients' && 'Directorio & Verificación de Conductores KYC'}
                {currentTab === 'calendar' && 'Cronograma Operativo & Ocupación de Flota'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botón Principal de Acción Rápida: Nuevo Vehículo */}
            <button
              onClick={handleOpenCreateVehicle}
              className="hidden sm:inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black text-sm sm:text-base shadow-xl shadow-gold-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Vehículo</span>
            </button>

            {/* Indicador de Estado Cloud Firestore (Spark $0) */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-carbon-850 border border-carbon-750 text-xs sm:text-sm shadow-inner">
              <Cloud className={`w-5 h-5 flex-shrink-0 ${cloudConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs text-silver-400 leading-none">
                  {cloudConnected ? 'Cloud Firestore (Spark $0)' : 'Modo Demostración'}
                </span>
                <span className="text-xs sm:text-sm font-mono text-gold-400 font-bold leading-tight mt-0.5">
                  {cloudConnected ? 'En línea • Sincronizado' : 'Local / Offline'}
                </span>
              </div>
            </div>

            {cloudConnected && (
              <button
                onClick={handleSyncToCloud}
                disabled={isSeeding}
                title="Sincronizar catálogo y reservas con Cloud Firestore"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-carbon-850 hover:bg-carbon-800 border border-gold-500/35 text-xs sm:text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                <span className="hidden xl:inline">Sincronizar Nube</span>
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 transition-colors shadow-sm"
            >
              <span>Ver Showroom</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Contenedor de la Vista Activa con Scroll */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 w-full max-w-[1680px] mx-auto space-y-7">
          
          {/* Alerta de Solicitudes Pendientes con Letra Clara */}
          {pendingCount > 0 && currentTab !== 'reservations' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-carbon-900 border-2 border-amber-500/60 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/40 shadow-md">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2.5 flex-wrap">
                    <span>Atención Requerida: {pendingCount} solicitud(es) de reserva pendiente(s)</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/25 text-amber-400 font-bold border border-amber-500/40">
                      Acción Inmediata
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-silver-300 mt-1">
                    Clientes VIP han completado el flujo de cotización en el showroom y esperan confirmación de entrega y contrato.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('reservations')}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-black text-sm transition-all self-start sm:self-auto shadow-lg active:scale-95 flex-shrink-0"
              >
                Revisar Solicitudes Ahora
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 1: DASHBOARD GENERAL                                */}
          {/* ============================================================ */}
          {currentTab === 'dashboard' && (
            <div className="space-y-7 animate-fade-in">
              
              {/* Tarjetas de Métricas de Alto Impacto con Navegación Directa */}
              <AdminMetricsGrid
                vehicles={vehicles}
                reservations={reservations}
                onSelectTab={setCurrentTab}
              />

              {/* Barra de Acciones Rápidas y Telemetría con Tamaños Cómodos */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 border border-carbon-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono mr-1">
                    Acceso Rápido:
                  </span>

                  <button
                    onClick={handleOpenCreateVehicle}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-xs sm:text-sm font-black text-gold-400 transition-all active:scale-95 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Vehículo</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('reservations')}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 transition-colors shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-gold-400" />
                    <span>Reservas ({reservations.length})</span>
                    {pendingCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>

                  <button
                    onClick={() => setCurrentTab('fleet')}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 transition-colors shadow-sm"
                  >
                    <Car className="w-4 h-4 text-gold-400" />
                    <span>Flota ({vehicles.length})</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {availableVehiclesCount} Disp.
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('calendar')}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 transition-colors shadow-sm"
                  >
                    <CalendarDays className="w-4 h-4 text-gold-400" />
                    <span>Cronograma Gantt</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('clients')}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-xs sm:text-sm font-bold text-silver-200 hover:text-gold-400 transition-colors shadow-sm"
                  >
                    <Users className="w-4 h-4 text-gold-400" />
                    <span>Directorio KYC</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-silver-300 font-mono font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-white font-bold">Telemetría: 100% Operativa</span>
                  <span className="text-carbon-600 hidden sm:inline">•</span>
                  <span className="text-gold-400 hidden sm:inline">Medellín VIP Showroom</span>
                </div>
              </div>

              {/* Grilla Principal: Reservas VIP Recientes & Supervisión de Flota */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                
                {/* 2 Cols: Actividad y Solicitudes Recientes con Estilo VIP Grande y Legible */}
                <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-carbon-900 border border-carbon-800 space-y-5 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-carbon-800">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white font-display tracking-tight">
                            Solicitudes de Reserva & Contratos VIP
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carbon-800 text-gold-400 border border-gold-500/30">
                            {reservations.length} Totales
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-silver-300 mt-1">
                          Flujo comercial en tiempo real con integración directa a WhatsApp Concierge y Firestore.
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('reservations')}
                        className="text-xs sm:text-sm text-gold-400 hover:text-gold-300 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Ver todas</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 pt-4">
                      {reservations.length === 0 ? (
                        <div className="py-14 text-center text-silver-400 text-sm font-medium">
                          No hay solicitudes de reserva registradas por el momento.
                        </div>
                      ) : (
                        reservations.slice(0, 4).map((r) => {
                          const isPending = r.status === 'PENDING';
                          const isConfirmed = r.status === 'CONFIRMED';
                          const isActive = r.status === 'ACTIVE';

                          return (
                            <div
                              key={r.id}
                              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-carbon-850 to-carbon-850/80 border border-carbon-750 hover:border-gold-500/50 transition-all duration-300 space-y-4 shadow-xl group"
                            >
                              {/* Fila Superior: Vehículo, Cliente, Fechas y Monto */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                
                                <div className="flex items-center gap-4">
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={r.vehicleImage}
                                      alt={r.vehicleName}
                                      className="w-24 h-18 sm:w-28 sm:h-20 object-cover rounded-2xl border-2 border-carbon-700 shadow-md group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute bottom-1 right-1 bg-carbon-950/95 text-[11px] font-mono font-bold text-gold-400 px-2 py-0.5 rounded-md border border-carbon-700 shadow-sm">
                                      {r.vehiclePlate}
                                    </span>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                      <span className="text-base sm:text-lg font-black text-white">{r.vehicleName}</span>
                                      <span className="text-xs font-mono font-bold text-gold-400 bg-carbon-800 px-2 py-0.5 rounded-md border border-carbon-700">
                                        #{r.id}
                                      </span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-silver-200 font-medium mt-1 flex items-center gap-2 flex-wrap">
                                      <span className="text-white font-extrabold text-sm sm:text-base">{r.client.fullName}</span>
                                      <span className="text-carbon-600 font-bold">•</span>
                                      <span className="text-silver-300 font-mono">{r.client.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-silver-300 font-mono mt-1.5 flex-wrap">
                                      <span className="inline-flex items-center gap-1.5 bg-carbon-900 px-2.5 py-1 rounded-lg text-silver-200 font-medium border border-carbon-800">
                                        <Calendar className="w-3.5 h-3.5 text-gold-400" />
                                        {r.startDate} al {r.endDate} ({r.pricing?.days || 1}d)
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 bg-carbon-900 px-2.5 py-1 rounded-lg text-silver-200 font-medium border border-carbon-800">
                                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                        {getDeliveryLocationLabel(r.deliveryLocation)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Columna de Precios y Estado */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-carbon-800">
                                  <div className="text-left sm:text-right">
                                    <div className="text-xs text-silver-400 font-medium uppercase tracking-wider">Renta Total</div>
                                    <div className="text-xl sm:text-2xl font-mono font-black text-gold-400 mt-0.5">
                                      {formatCurrency(r.pricing?.rentalTotal || 0)}
                                    </div>
                                  </div>

                                  <div>
                                    <span
                                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full inline-block ${
                                        isConfirmed
                                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                          : isPending
                                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50 animate-pulse'
                                          : isActive
                                          ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                                          : 'bg-carbon-800 text-silver-400'
                                      }`}
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                </div>

                              </div>

                              {/* Fila Inferior: Botones de Acción Inmediata */}
                              <div className="pt-3 border-t border-carbon-800/70 flex items-center justify-between gap-3 flex-wrap">
                                <div className="text-xs sm:text-sm text-silver-300 font-mono font-semibold">
                                  Garantía: <span className="text-white">{formatCurrency(r.pricing?.securityDeposit || 0)}</span> (Custodia)
                                </div>

                                <div className="flex items-center gap-2.5">
                                  {/* Botón Directo a WhatsApp Concierge */}
                                  <button
                                    onClick={() => {
                                      const url = generateWhatsAppReservationLink(r);
                                      window.open(url, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
                                    title="Contactar al cliente con plantilla VIP de WhatsApp"
                                  >
                                    <Phone className="w-4 h-4" />
                                    <span>WhatsApp Concierge</span>
                                  </button>

                                  {/* Acciones de estado */}
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-carbon-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95"
                                      >
                                        <Check className="w-4 h-4" />
                                        <span>Aprobar</span>
                                      </button>
                                      <button
                                        onClick={() => handleUpdateReservationStatus(r.id, 'CANCELLED')}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-rose-950/40 text-rose-400 border border-carbon-700 hover:border-rose-500/30 text-xs sm:text-sm font-semibold transition-colors"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        <span>Rechazar</span>
                                      </button>
                                    </>
                                  )}

                                  {isConfirmed && (
                                    <button
                                      onClick={() => handleUpdateReservationStatus(r.id, 'ACTIVE')}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all active:scale-95"
                                    >
                                      <Car className="w-4 h-4" />
                                      <span>Marcar en Entrega</span>
                                    </button>
                                  )}

                                  {isActive && (
                                    <button
                                      onClick={() => handleUpdateReservationStatus(r.id, 'COMPLETED')}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all active:scale-95"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Completar Renta</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-carbon-800 flex items-center justify-between text-xs sm:text-sm text-silver-300">
                    <span className="font-mono text-xs font-semibold">
                      Sincronización bidireccional automática en tiempo real.
                    </span>
                    <button
                      onClick={() => setCurrentTab('reservations')}
                      className="text-gold-400 hover:text-gold-300 font-bold"
                    >
                      Ir al Administrador Completo de Reservas ➔
                    </button>
                  </div>
                </div>

                {/* 1 Col: Supervisión de Flota Boutique en Tiempo Real */}
                <div className="p-6 sm:p-7 rounded-2xl bg-carbon-900 border border-carbon-800 space-y-5 flex flex-col justify-between shadow-2xl">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-carbon-800">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl font-black text-white font-display">
                            Supervisión de Flota
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carbon-800 text-silver-200 border border-carbon-700">
                            {vehicles.length} Autos
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-silver-300 mt-1">
                          Monitoreo de disponibilidad y tarifas diarias.
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('fleet')}
                        className="text-xs sm:text-sm text-gold-400 hover:text-gold-300 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Flota</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lista de Vehículos con Diseño Ejecutivo y Letras Grandes */}
                    <div className="divide-y divide-carbon-800/80 pt-1">
                      {vehicles.slice(0, 6).map((veh) => {
                        const statusConfig = getStatusConfig(veh.status);
                        const categoryLabel = getCategoryLabel(veh.category);

                        return (
                          <div
                            key={veh.id}
                            className="py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm group hover:bg-carbon-850/60 px-3 rounded-2xl transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={veh.mainImage || (veh.gallery?.exteriorImages && veh.gallery.exteriorImages[0]) || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'}
                                alt={veh.model}
                                className="w-16 h-12 sm:w-18 sm:h-13 object-cover rounded-xl border border-carbon-700 flex-shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white font-extrabold truncate text-sm sm:text-base">
                                    {veh.brand} {veh.model}
                                  </span>
                                </div>
                                <div className="text-xs text-silver-300 font-mono flex items-center gap-2 mt-1">
                                  <span className="text-gold-400 font-extrabold text-sm">
                                    {formatCurrency(veh.pricePerDay)}/d
                                  </span>
                                  <span className="text-carbon-600 font-bold">•</span>
                                  <span className="bg-carbon-800 px-2 py-0.5 rounded font-bold text-silver-200">
                                    {veh.plate}
                                  </span>
                                </div>
                                <div className="text-[11px] text-silver-400 font-medium mt-0.5">
                                  {categoryLabel}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Botón de Ciclo Rápido de Estado */}
                              <button
                                onClick={() => {
                                  const nextStatus: VehicleStatus =
                                    veh.status === 'AVAILABLE'
                                      ? 'RENTED'
                                      : veh.status === 'RENTED'
                                      ? 'MAINTENANCE'
                                      : 'AVAILABLE';
                                  handleLocalVehicleStatusUpdate(veh.id, nextStatus);
                                }}
                                title="Haga clic para alternar estado operativo rápidamente"
                                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border cursor-pointer hover:opacity-85 transition-opacity shadow-sm ${statusConfig.badgeClass}`}
                              >
                                {statusConfig.label}
                              </button>

                              {/* Botón Editar Vehículo Directo */}
                              <button
                                onClick={() => handleOpenEditVehicle(veh)}
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-silver-300 hover:text-gold-400 transition-colors shadow-sm"
                                title="Editar ficha técnica y tarifas de este vehículo"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Botón Ver en Showroom */}
                              <button
                                onClick={() => onNavigateToVehicleDetail(veh.slug)}
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-silver-300 hover:text-white transition-colors shadow-sm"
                                title="Ver en showroom público"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-carbon-800">
                    <button
                      onClick={handleOpenCreateVehicle}
                      className="w-full py-3.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-gold-500/40 text-sm font-black text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center gap-2.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Añadir Nuevo Superdeportivo</span>
                    </button>

                    <button
                      onClick={onNavigateToCatalog}
                      className="w-full py-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs sm:text-sm font-bold text-silver-300 hover:text-white transition-colors text-center"
                    >
                      Ver Catálogo Público Completo
                    </button>
                  </div>
                </div>

              </div>

              {/* Barra Inferior de Garantías y Protocolos VIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 sm:p-6 rounded-2xl bg-carbon-900 border border-carbon-800/90 flex items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-black text-white">Blindaje de Pólizas & Garantías</h5>
                    <p className="text-xs sm:text-sm text-silver-300 mt-1 leading-relaxed">
                      100% de la flota asegurada con cobertura Todo Riesgo para superdeportivos y depósitos custodiados.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-carbon-900 border border-carbon-800/90 flex items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-black text-white">Logística Showroom Medellín</h5>
                    <p className="text-xs sm:text-sm text-silver-300 mt-1 leading-relaxed">
                      Entregas VIP coordinadas en Aeropuerto JMC, El Poblado, Llanogrande y Laureles con valet privado.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-carbon-900 border border-carbon-800/90 flex items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-black text-white">ADR Promedio de Flota</h5>
                    <p className="text-xs sm:text-sm text-silver-300 mt-1 leading-relaxed">
                      Tarifa diaria promedio de <span className="text-gold-400 font-mono font-black">{formatCurrency(averageDailyRate)} USD/día</span> en vehículos exóticos activos.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 2: FLOTA BOUTIQUE                                   */}
          {/* ============================================================ */}
          {currentTab === 'fleet' && (
            <div className="animate-fade-in">
              <AdminFleetView
                vehicles={vehicles}
                onUpdateVehicleStatus={handleLocalVehicleStatusUpdate}
                onNavigateToVehicleDetail={onNavigateToVehicleDetail}
                onCreateVehicle={handleOpenCreateVehicle}
                onEditVehicle={handleOpenEditVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 3: GESTIÓN DE RESERVAS                              */}
          {/* ============================================================ */}
          {currentTab === 'reservations' && (
            <div className="animate-fade-in">
              <AdminReservationsView
                vehicles={vehicles}
                reservations={reservations}
                onUpdateStatus={handleUpdateReservationStatus}
                onUpdateReservation={handleUpdateReservation}
                onDeleteReservation={handleDeleteReservation}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 4: CLIENTES KYC                                     */}
          {/* ============================================================ */}
          {currentTab === 'clients' && (
            <div className="animate-fade-in">
              <AdminClientsView reservations={reservations} />
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 5: CRONOGRAMA & OCUPACIÓN GANTT                     */}
          {/* ============================================================ */}
          {currentTab === 'calendar' && (
            <div className="animate-fade-in">
              <AdminCalendarView
                vehicles={vehicles}
                reservations={reservations}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onUpdateReservation={handleUpdateReservation}
                onDeleteReservation={handleDeleteReservation}
                onSaveDateBlock={handleSaveDateBlock}
                onNavigateToVehicleDetail={onNavigateToVehicleDetail}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 6: ANALÍTICA FINANCIERA & BI                         */}
          {/* ============================================================ */}
          {currentTab === 'analytics' && (
            <div className="animate-fade-in">
              <AdminAnalyticsView
                vehicles={vehicles}
                reservations={reservations}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 7: AJUSTES & EMPRESA (CONFIGURACIÓN SHOWROOM)        */}
          {/* ============================================================ */}
          {currentTab === 'settings' && (
            <div className="animate-fade-in">
              <AdminSettingsView />
            </div>
          )}

        </main>


      </div>

      {/* Modal de Crear / Editar Vehículo */}
      <AdminVehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicleToEdit={vehicleToEdit}
        onSave={handleSaveVehicle}
      />

    </div>
  );
};
