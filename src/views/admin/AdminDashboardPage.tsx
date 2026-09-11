import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus } from '../../types/vehicle';
import { Reservation, ReservationStatus } from '../../types/reservation';
import {
  getStoredReservations,
  updateReservationStatus,
} from '../../services/reservationService';
import { AdminSidebar, AdminTab } from '../../components/admin/AdminSidebar';
import { AdminMetricsGrid } from '../../components/admin/AdminMetricsGrid';
import { AdminReservationsView } from '../../components/admin/AdminReservationsView';
import { AdminFleetView } from '../../components/admin/AdminFleetView';
import { AdminClientsView } from '../../components/admin/AdminClientsView';
import {
  Menu,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Car,
  Users,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cargar reservas sincronizadas
  useEffect(() => {
    setReservations(getStoredReservations());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateReservationStatus = (id: string, newStatus: ReservationStatus) => {
    const updated = updateReservationStatus(id, newStatus);
    if (updated) {
      setReservations(getStoredReservations());
      showToast(`Reserva ${id} actualizada a estado ${newStatus}.`);
    }
  };

  const handleLocalVehicleStatusUpdate = (vehicleId: string, newStatus: VehicleStatus) => {
    onUpdateVehicleStatus(vehicleId, newStatus);
    const car = vehicles.find((v) => v.id === vehicleId);
    showToast(`Estado de ${car?.model || 'Vehículo'} cambiado a ${newStatus}.`);
  };

  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-carbon-950 text-silver-100 flex selection:bg-gold-500/20 selection:text-gold-400">
      
      {/* Toast Flotante de Notificaciones */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-carbon-900 border border-gold-500/40 text-silver-100 text-xs shadow-2xl flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
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

      {/* 2. Área de Contenido Principal (Full width responsivo) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-carbon-950 via-carbon-900/30 to-carbon-950">
        
        {/* Cabecera Superior */}
        <header className="border-b border-carbon-800/80 bg-carbon-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botón Hamburguesa en Móvil */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-silver-400 hover:text-white border border-carbon-750 lg:hidden transition-colors"
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                  PORTAL EJECUTIVO
                </span>
                <span className="text-carbon-600">•</span>
                <span className="text-xs text-silver-400 font-mono">
                  {currentTab.toUpperCase()}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-silver-100 font-display">
                {currentTab === 'dashboard' && 'Centro de Mando & Telemetría Comercial'}
                {currentTab === 'fleet' && 'Gestión Integral de Flota Boutique'}
                {currentTab === 'reservations' && 'Solicitudes & Ciclo de Vida de Reservas'}
                {currentTab === 'clients' && 'Directorio & Verificación de Conductores KYC'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs font-semibold text-silver-300 hover:text-gold-400 transition-colors shadow-sm"
            >
              <span>Ver Showroom</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Contenedor de la Vista Activa con Scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 w-full max-w-[1600px] mx-auto space-y-6">
          
          {/* Alerta de Solicitudes Pendientes */}
          {pendingCount > 0 && currentTab !== 'reservations' && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-silver-100">
                    Atención Requerida: {pendingCount} solicitud(es) de reserva pendiente(s)
                  </h4>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Nuevos clientes de ultra-lujo han solicitado cotización y esperan confirmación de entrega.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('reservations')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-bold text-xs transition-colors self-start sm:self-auto shadow-md"
              >
                Revisar Solicitudes Ahora
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 1: DASHBOARD GENERAL                                */}
          {/* ============================================================ */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Tarjetas de Métricas de Alto Impacto */}
              <AdminMetricsGrid
                vehicles={vehicles}
                reservations={reservations}
              />

              {/* Barra de Acciones Rápidas */}
              <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
                  Acciones Rápidas de Operación:
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setCurrentTab('reservations')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs font-semibold text-silver-200 hover:text-gold-400 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gold-400" />
                    <span>Ver Reservas ({reservations.length})</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('fleet')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs font-semibold text-silver-200 hover:text-gold-400 transition-colors"
                  >
                    <Car className="w-3.5 h-3.5 text-gold-400" />
                    <span>Inventario de Flota ({vehicles.length})</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('clients')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs font-semibold text-silver-200 hover:text-gold-400 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-gold-400" />
                    <span>Directorio KYC</span>
                  </button>
                </div>
              </div>

              {/* Grilla Principal de Actividad y Flota */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2 Cols: Actividad y Solicitudes Recientes */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-carbon-900 border border-carbon-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
                    <div>
                      <h3 className="text-sm font-bold text-silver-100 font-display">
                        Últimas Solicitudes de Reserva Registradas
                      </h3>
                      <p className="text-xs text-silver-400 mt-0.5">
                        Alimentadas en vivo desde el flujo comercial del showroom.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('reservations')}
                      className="text-xs text-gold-400 hover:text-gold-300 font-semibold"
                    >
                      Ver todas ➔
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reservations.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-xl bg-carbon-850/80 border border-carbon-750 hover:border-carbon-700 flex items-center justify-between gap-4 flex-wrap transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={r.vehicleImage}
                            alt={r.vehicleName}
                            className="w-14 h-10 object-cover rounded-lg border border-carbon-700 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-silver-100">{r.vehicleName}</span>
                              <span className="text-[10px] font-mono text-gold-400 bg-carbon-800 px-1.5 py-0.5 rounded border border-carbon-700">
                                {r.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-silver-400 mt-0.5">
                              {r.client.fullName} • {r.startDate} al {r.endDate} ({r.pricing?.days} d)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-silver-100">
                              {formatCurrency(r.pricing?.rentalTotal || 0)}
                            </div>
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                r.status === 'CONFIRMED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                  : r.status === 'PENDING'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                                  : 'bg-carbon-800 text-silver-400'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>

                          {r.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-bold text-xs transition-colors shadow-sm"
                            >
                              Aprobar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1 Col: Estado Operativo de la Flota */}
                <div className="p-5 sm:p-6 rounded-2xl bg-carbon-900 border border-carbon-800 space-y-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
                      <div>
                        <h3 className="text-sm font-bold text-silver-100 font-display">
                          Supervisión de Flota
                        </h3>
                        <p className="text-xs text-silver-400 mt-0.5">
                          {vehicles.length} superdeportivos y autos de lujo
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('fleet')}
                        className="text-xs text-gold-400 hover:text-gold-300 font-semibold"
                      >
                        Gestionar ➔
                      </button>
                    </div>

                    <div className="divide-y divide-carbon-800 pt-1">
                      {vehicles.slice(0, 6).map((veh) => (
                        <div key={veh.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="truncate max-w-[170px]">
                            <span className="text-silver-200 font-semibold block truncate">
                              {veh.brand} {veh.model}
                            </span>
                            <span className="text-[10px] text-silver-500 font-mono">
                              Placa: {veh.plate} • {formatCurrency(veh.pricePerDay)}/d
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                veh.status === 'AVAILABLE'
                                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                                  : veh.status === 'RENTED'
                                  ? 'text-blue-400 bg-blue-950/40 border border-blue-800/40'
                                  : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                              }`}
                            >
                              {veh.status}
                            </span>

                            <button
                              onClick={() => onNavigateToVehicleDetail(veh.slug)}
                              className="p-1 rounded text-silver-500 hover:text-gold-400 transition-colors"
                              title="Ver en showroom"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToCatalog}
                    className="w-full py-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-carbon-750 text-xs font-semibold text-silver-300 hover:text-white transition-colors text-center mt-2"
                  >
                    Ver Catálogo Público Completo
                  </button>
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
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 3: GESTIÓN DE RESERVAS                              */}
          {/* ============================================================ */}
          {currentTab === 'reservations' && (
            <div className="animate-fade-in">
              <AdminReservationsView
                reservations={reservations}
                onUpdateStatus={handleUpdateReservationStatus}
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

        </main>

      </div>

    </div>
  );
};
