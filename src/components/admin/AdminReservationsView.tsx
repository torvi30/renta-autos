import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus } from '../../types/reservation';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Send,
  MapPin,
  FileText,
  Phone,
  AlertCircle,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  X,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { getDeliveryLocationLabel, generateWhatsAppReservationLink } from '../../services/reservationService';

interface AdminReservationsViewProps {
  reservations: Reservation[];
  onUpdateStatus: (reservationId: string, newStatus: ReservationStatus) => void;
}

export const AdminReservationsView: React.FC<AdminReservationsViewProps> = ({
  reservations,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        r.id.toLowerCase().includes(search) ||
        r.client.fullName.toLowerCase().includes(search) ||
        r.client.email.toLowerCase().includes(search) ||
        r.client.phone.toLowerCase().includes(search) ||
        r.vehicleName.toLowerCase().includes(search) ||
        r.vehiclePlate.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [reservations, statusFilter, searchTerm]);

  // KPIs de reservas
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE').length;
  const completedCount = reservations.filter((r) => r.status === 'COMPLETED').length;
  const totalRevenue = reservations
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + (r.pricing?.rentalTotal || 0), 0);

  const handleCopyCode = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenClientWhatsApp = (reservation: Reservation) => {
    const url = generateWhatsAppReservationLink(reservation);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Pendiente</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmada</span>
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>En Curso</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-carbon-700 text-silver-300 border border-carbon-600">
            <Check className="w-3 h-3" />
            <span>Completada</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/50 text-rose-400 border border-rose-800/40">
            <XCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. KPIs de Gestión de Reservas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Total Solicitudes
            </span>
            <div className="text-2xl font-bold font-display text-silver-100 mt-1">
              {reservations.length}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              Registros históricos
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Pendientes de Validación
            </span>
            <div className="text-2xl font-bold font-display text-amber-400 mt-1">
              {pendingCount}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{pendingCount > 0 ? 'Requieren aprobación' : 'Sin pendientes'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Activas & Completadas
            </span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
              {confirmedCount + completedCount}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              {confirmedCount} en curso • {completedCount} finalizadas
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Total Renta Proyectada
            </span>
            <div className="text-2xl font-bold font-display text-gold-400 font-mono mt-1">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              Excluye solicitudes canceladas
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Barra de Búsqueda, Filtros y Switcher de Vista */}
      <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-silver-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código RES, cliente, teléfono o auto..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-carbon-850 border border-carbon-750 text-silver-200 text-xs focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Filtros por Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'PENDING', label: `Pendientes (${pendingCount})` },
            { id: 'CONFIRMED', label: 'Confirmadas' },
            { id: 'ACTIVE', label: 'En Curso' },
            { id: 'COMPLETED', label: 'Completadas' },
            { id: 'CANCELLED', label: 'Canceladas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-silver-400 hover:text-silver-200 hover:bg-carbon-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Switcher Tabla / Tarjetas */}
          <div className="flex items-center bg-carbon-850 p-1 rounded-xl border border-carbon-750 ml-2">
            <button
              onClick={() => setViewMode('table')}
              title="Vista de Tabla Ejecutiva"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm'
                  : 'text-silver-400 hover:text-silver-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Vista en Tarjetas"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm'
                  : 'text-silver-400 hover:text-silver-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Contenedor de Listado: Tabla Ejecutiva o Tarjetas */}
      {filteredReservations.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-carbon-900 border border-carbon-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-silver-600 mx-auto" />
          <h4 className="text-base font-semibold text-silver-200">
            No se encontraron reservas
          </h4>
          <p className="text-xs text-silver-500 max-w-md mx-auto">
            {searchTerm
              ? 'No hay registros que coincidan con la búsqueda introducida.'
              : 'Aún no hay solicitudes de reserva registradas en este estado.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= VISTA TABLA EJECUTIVA ================= */
        <div className="rounded-2xl bg-carbon-900 border border-carbon-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-carbon-850/80 border-b border-carbon-800 text-[11px] uppercase tracking-wider text-silver-400 font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Código / Fecha</th>
                  <th className="py-3.5 px-4">Vehículo</th>
                  <th className="py-3.5 px-4">Conductor</th>
                  <th className="py-3.5 px-4">Periodo de Renta</th>
                  <th className="py-3.5 px-4">Entrega</th>
                  <th className="py-3.5 px-4 text-right">Total Renta</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800/70">
                {filteredReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-carbon-850/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedReservation(res)}
                  >
                    {/* Código */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-silver-100 bg-carbon-800 px-2 py-0.5 rounded border border-carbon-750">
                          {res.id}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(res.id);
                          }}
                          className="text-silver-500 hover:text-gold-400 transition-colors"
                          title="Copiar código"
                        >
                          {copiedId === res.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-silver-500 block mt-1">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Vehículo */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 min-w-[170px]">
                        <img
                          src={res.vehicleImage}
                          alt={res.vehicleName}
                          className="w-12 h-8 object-cover rounded-lg border border-carbon-750 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <strong className="text-silver-100 font-semibold block truncate">
                            {res.vehicleName}
                          </strong>
                          <span className="text-[10px] text-silver-500 font-mono">
                            {res.vehiclePlate}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Conductor */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-silver-200">{res.client.fullName}</div>
                      <span className="text-[11px] text-silver-400">{res.client.phone}</span>
                    </td>

                    {/* Periodo */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-silver-200">
                        {res.startDate} al {res.endDate}
                      </div>
                      <span className="text-[11px] text-silver-400">
                        {res.pricing?.days} día(s) • {res.pickupTime}
                      </span>
                    </td>

                    {/* Entrega */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-silver-300">
                        {getDeliveryLocationLabel(res.deliveryLocation)}
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-gold-400 text-sm">
                        {formatCurrency(res.pricing?.rentalTotal || 0)}
                      </div>
                      <span className="text-[10px] text-silver-500">
                        + {formatCurrency(res.pricing?.securityDeposit || 0)} dep.
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(res.status)}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 sm:px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenClientWhatsApp(res)}
                          title="Enviar WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-400 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedReservation(res)}
                          title="Ver Expediente"
                          className="p-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-300 hover:text-gold-400 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= VISTA TARJETAS DETALLADAS ================= */
        <div className="space-y-4">
          {filteredReservations.map((res) => (
            <div
              key={res.id}
              onClick={() => setSelectedReservation(res)}
              className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 hover:border-carbon-700 transition-all shadow-sm space-y-4 cursor-pointer"
            >
              {/* Cabecera */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-carbon-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-silver-100 bg-carbon-800 px-2.5 py-1 rounded-lg border border-carbon-750 flex items-center gap-1.5">
                    <span>{res.id}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(res.id);
                      }}
                      className="text-silver-400 hover:text-gold-400 transition-colors"
                      title="Copiar código"
                    >
                      {copiedId === res.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </span>
                  <span className="text-xs text-silver-500 font-mono">
                    Registrada el {new Date(res.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(res.status)}
                </div>
              </div>

              {/* Contenido */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Vehículo */}
                <div className="flex items-start gap-3">
                  <img
                    src={res.vehicleImage}
                    alt={res.vehicleName}
                    className="w-16 h-12 object-cover rounded-lg border border-carbon-750 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase text-gold-400 font-semibold block">
                      Vehículo
                    </span>
                    <strong className="text-silver-100 text-sm font-display block">
                      {res.vehicleName}
                    </strong>
                    <span className="text-silver-400 font-mono">Placa: {res.vehiclePlate}</span>
                  </div>
                </div>

                {/* Cliente */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-silver-500 font-semibold block">
                    Conductor Titular
                  </span>
                  <div className="font-semibold text-silver-200">{res.client.fullName}</div>
                  <div className="text-silver-400 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-gold-400 flex-shrink-0" />
                    <span>Licencia: {res.client.driverLicense}</span>
                  </div>
                  <div className="text-silver-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gold-400 flex-shrink-0" />
                    <span>{res.client.phone}</span>
                  </div>
                </div>

                {/* Agenda */}
                <div className="space-y-1 md:text-right">
                  <span className="text-[10px] uppercase text-silver-500 font-semibold block">
                    Agenda & Total
                  </span>
                  <div className="font-semibold text-silver-200">
                    {res.startDate} al {res.endDate} ({res.pricing?.days} d)
                  </div>
                  <div className="text-silver-400 flex md:justify-end items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold-400" />
                    <span>{getDeliveryLocationLabel(res.deliveryLocation)}</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-gold-400 pt-0.5">
                    Total: {formatCurrency((res.pricing?.rentalTotal || 0) + (res.pricing?.securityDeposit || 0))}
                  </div>
                </div>

              </div>

              {/* Botones */}
              <div className="pt-3 border-t border-carbon-800/80 flex flex-wrap items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleOpenClientWhatsApp(res)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </button>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {res.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(res.id, 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-carbon-950 text-xs font-bold transition-colors"
                      >
                        Aprobar Reserva
                      </button>
                      <button
                        onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {res.status === 'CONFIRMED' && (
                    <button
                      onClick={() => onUpdateStatus(res.id, 'ACTIVE')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                    >
                      Iniciar Entrega
                    </button>
                  )}

                  {res.status === 'ACTIVE' && (
                    <button
                      onClick={() => onUpdateStatus(res.id, 'COMPLETED')}
                      className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-carbon-950 text-xs font-bold transition-colors"
                    >
                      Completar Devolución
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 4. Modal / Expediente Completo de Reserva */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto">
            
            {/* Cabecera Modal */}
            <div className="p-5 sm:p-6 border-b border-carbon-800 bg-carbon-850/90 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-carbon-800 text-gold-400 border border-carbon-750">
                    {selectedReservation.id}
                  </span>
                  {getStatusBadge(selectedReservation.status)}
                </div>
                <h3 className="text-lg font-bold text-silver-100 font-display">
                  Expediente de Solicitud de Reserva
                </h3>
              </div>

              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
                aria-label="Cerrar expediente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Vehículo Asignado */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 flex items-center gap-4">
                <img
                  src={selectedReservation.vehicleImage}
                  alt={selectedReservation.vehicleName}
                  className="w-20 h-14 object-cover rounded-lg border border-carbon-700 flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] text-gold-400 font-semibold uppercase">Vehículo</span>
                  <h4 className="text-base font-bold text-silver-100 font-display">
                    {selectedReservation.vehicleName}
                  </h4>
                  <div className="text-silver-400 font-mono mt-0.5">
                    Placa: {selectedReservation.vehiclePlate}
                  </div>
                </div>
              </div>

              {/* Titular Conductor */}
              <div className="p-4 rounded-xl bg-carbon-850/60 border border-carbon-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-silver-400 block tracking-wider">
                  Datos del Conductor Titular (KYC)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><strong>Nombre:</strong> {selectedReservation.client.fullName}</div>
                  <div><strong>ID / Pasaporte:</strong> {selectedReservation.client.documentId}</div>
                  <div><strong>Licencia:</strong> {selectedReservation.client.driverLicense}</div>
                  <div><strong>Teléfono:</strong> {selectedReservation.client.phone}</div>
                  <div className="sm:col-span-2"><strong>Email:</strong> {selectedReservation.client.email}</div>
                </div>
              </div>

              {/* Fechas y Entrega */}
              <div className="p-4 rounded-xl bg-carbon-850/60 border border-carbon-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-silver-400 block tracking-wider">
                  Agenda y Ubicación
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <strong>Recogida:</strong> {selectedReservation.startDate} ({selectedReservation.pickupTime})
                  </div>
                  <div>
                    <strong>Devolución:</strong> {selectedReservation.endDate} ({selectedReservation.returnTime})
                  </div>
                  <div className="sm:col-span-2">
                    <strong>Modalidad de Entrega:</strong> {getDeliveryLocationLabel(selectedReservation.deliveryLocation)}
                    {selectedReservation.deliveryAddress && ` - ${selectedReservation.deliveryAddress}`}
                  </div>
                </div>
              </div>

              {/* Desglose Financiero */}
              <div className="p-4 rounded-xl bg-carbon-850 border border-carbon-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-silver-400 block tracking-wider">
                  Desglose Financiero
                </span>
                <div className="flex justify-between text-silver-400">
                  <span>Subtotal Renta ({selectedReservation.pricing?.days} días):</span>
                  <span className="text-silver-200 font-semibold">
                    {formatCurrency(selectedReservation.pricing?.rentalTotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-silver-400">
                  <span>Depósito en Garantía (Reembolsable):</span>
                  <span className="text-silver-200 font-semibold">
                    {formatCurrency(selectedReservation.pricing?.securityDeposit || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-silver-400">
                  <span>Cobertura VIP a Todo Riesgo:</span>
                  <span className="text-emerald-400 font-semibold">Incluida ($0)</span>
                </div>
                <div className="pt-2 border-t border-carbon-750 flex justify-between font-bold text-sm text-silver-100">
                  <span>Total Estimado al Despacho:</span>
                  <span className="font-mono text-gold-400 text-base">
                    {formatCurrency(
                      (selectedReservation.pricing?.rentalTotal || 0) +
                        (selectedReservation.pricing?.securityDeposit || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Notas especiales */}
              {selectedReservation.notes && (
                <div className="p-3 rounded-xl bg-carbon-850/40 border border-carbon-800 text-silver-300">
                  <strong className="text-[10px] text-silver-500 uppercase block mb-1">Notas del Cliente:</strong>
                  {selectedReservation.notes}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleOpenClientWhatsApp(selectedReservation)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar WhatsApp Oficial</span>
                </button>

                {selectedReservation.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedReservation.id, 'CONFIRMED');
                      setSelectedReservation(null);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs uppercase transition-colors"
                  >
                    Aprobar Ahora
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
