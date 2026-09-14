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
  TrendingUp,
  Wrench,
  Pencil,
  Trash2,
  FileCheck,
  ClipboardCheck,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { getDeliveryLocationLabel, generateWhatsAppReservationLink } from '../../services/reservationService';
import { Vehicle } from '../../types/vehicle';
import { AdminReservationEditModal } from './AdminReservationEditModal';
import { AdminContractModal } from './AdminContractModal';
import { AdminInspectionModal } from './AdminInspectionModal';

interface AdminReservationsViewProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onUpdateStatus: (reservationId: string, newStatus: ReservationStatus) => void;
  onUpdateReservation: (reservationId: string, updates: Partial<Reservation>) => Promise<void> | void;
  onDeleteReservation: (reservationId: string) => Promise<void> | void;
}

export const AdminReservationsView: React.FC<AdminReservationsViewProps> = ({
  vehicles,
  reservations,
  onUpdateStatus,
  onUpdateReservation,
  onDeleteReservation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [contractReservation, setContractReservation] = useState<Reservation | null>(null);
  const [inspectionReservation, setInspectionReservation] = useState<Reservation | null>(null);


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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmada</span>
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>En Curso</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-carbon-700 text-silver-300 border border-carbon-600">
            <Check className="w-3.5 h-3.5" />
            <span>Completada</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-950/60 text-rose-400 border border-rose-800/50">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelada</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">
            <Wrench className="w-3.5 h-3.5" />
            <span>Taller / Bloqueo</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* 1. KPIs de Gestión de Reservas (Mismo Estilo Ejecutivo Grande) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Solicitudes */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Total Solicitudes
            </span>
            <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {reservations.length}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-400 font-medium">
            Registros históricos en plataforma
          </div>
        </div>

        {/* Pendientes de Validación */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-amber-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Pendientes de Validación
            </span>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-amber-400 tracking-tight">
            {pendingCount}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{pendingCount > 0 ? 'Requieren aprobación inmediata' : 'Todas gestionadas al día'}</span>
          </div>
        </div>

        {/* Activas & Completadas */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-blue-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
              Activas & Completadas
            </span>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {confirmedCount}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium">
            <span className="text-blue-400 font-semibold">{confirmedCount} en curso</span> • {completedCount} finalizadas
          </div>
        </div>

        {/* Total Renta Proyectada */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/50 p-6 lg:p-7 shadow-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-emerald-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Renta Proyectada
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35">
                <TrendingUp className="w-3.5 h-3.5" />
                Oficial
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-gold-400 tracking-tight font-mono">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-400 flex items-center justify-between">
            <span>Tarifas brutas contratadas</span>
            <span className="text-gold-400 font-mono font-bold">USD Oficial</span>
          </div>
        </div>

      </div>

      {/* 2. Barra de Búsqueda, Filtros y Switcher de Vista */}
      <div className="p-4 sm:p-5 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-5 h-5 text-silver-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código RES, cliente, teléfono o auto..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-carbon-850 border border-carbon-700 text-white placeholder-silver-500 text-sm focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
          />
        </div>

        {/* Filtros por Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
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
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white hover:bg-carbon-800 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Switcher Tabla / Tarjetas (Solo visible en pantallas medianas y grandes) */}
          <div className="hidden md:flex items-center bg-carbon-850 p-1.5 rounded-xl border border-carbon-750 ml-2">
            <button
              onClick={() => setViewMode('table')}
              title="Vista de Tabla Ejecutiva"
              className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/35 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Vista en Tarjetas"
              className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/35 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Contenedor de Listado: Tarjetas Automáticas en Móvil y Vista Dual en Escritorio */}
      {filteredReservations.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-carbon-900 border border-carbon-800 space-y-3">
          <AlertCircle className="w-12 h-12 text-silver-600 mx-auto" />
          <h4 className="text-lg font-bold text-silver-200">
            No se encontraron reservas
          </h4>
          <p className="text-sm text-silver-400 max-w-md mx-auto">
            {searchTerm
              ? 'No hay registros que coincidan con la búsqueda introducida.'
              : 'Aún no hay solicitudes de reserva registradas en este estado.'}
          </p>
        </div>
      ) : (
        <>
          {/* ================= VISTA MÓVIL (< md): SIEMPRE TARJETAS (CERO SCROLL HORIZONTAL) ================= */}
          <div className="block md:hidden space-y-4">
            {filteredReservations.map((res) => (
              <div
                key={`mobile-${res.id}`}
                onClick={() => setSelectedReservation(res)}
                className="p-4 rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/50 shadow-xl space-y-3.5 cursor-pointer group active:scale-[0.99] transition-all"
              >
                {/* 1. Cabecera: Código + Fecha + Estado en la misma pantalla */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-carbon-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-gold-400 bg-carbon-800 px-2.5 py-1 rounded-lg border border-carbon-700 flex items-center gap-1.5 shadow-sm">
                      <span>{res.id}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(res.id);
                        }}
                        className="text-silver-400 hover:text-gold-300 p-0.5"
                        title="Copiar código"
                      >
                        {copiedId === res.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </span>
                    <span className="text-[11px] text-silver-400 font-mono">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {getStatusBadge(res.status)}
                  </div>
                </div>

                {/* 2. Auto Asignado */}
                <div className="flex items-start gap-3">
                  <img
                    src={res.vehicleImage}
                    alt={res.vehicleName}
                    className="w-20 h-14 object-cover rounded-xl border border-carbon-700 shadow-md flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase text-gold-400 font-bold block tracking-wider">
                      Vehículo Asignado
                    </span>
                    <h4 className="text-white text-sm font-black truncate mt-0.5">
                      {res.vehicleName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-carbon-800 text-silver-300 font-mono font-bold border border-carbon-700">
                        {res.vehiclePlate}
                      </span>
                      <span className="text-silver-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{getDeliveryLocationLabel(res.deliveryLocation)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Conductor & Periodo & Finanzas */}
                <div className="p-3 rounded-xl bg-carbon-900/95 border border-carbon-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-silver-400 font-bold block">Conductor</span>
                      <strong className="text-white text-xs sm:text-sm block">{res.client.fullName}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-silver-400 font-bold block">Teléfono</span>
                      <a
                        href={`tel:${res.client.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gold-400 font-mono text-xs hover:underline"
                      >
                        {res.client.phone}
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-carbon-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-silver-400 block">Periodo</span>
                      <span className="text-white font-medium text-xs">
                        {res.startDate} al {res.endDate} ({res.pricing?.days} d)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-silver-400 block">Total Renta</span>
                      <div className="text-base font-black font-mono text-gold-400">
                        {formatCurrency(res.pricing?.rentalTotal || 0)}
                        <span className="text-[10px] text-silver-400 font-normal ml-1">
                          (+ {formatCurrency(res.pricing?.securityDeposit || 0)} dep.)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Deck de Botones de Acción en Móvil */}
                <div className="pt-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* Botón Principal para ver todo el expediente con un click */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedReservation(res)}
                      className="py-2.5 px-3 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-white border border-carbon-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Eye className="w-4 h-4 text-gold-400" />
                      <span>Ver Expediente</span>
                    </button>

                    <button
                      onClick={() => handleOpenClientWhatsApp(res)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Acciones de Estado Inmediato */}
                  {res.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onUpdateStatus(res.id, 'CONFIRMED')}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-carbon-950 text-xs font-black shadow-md active:scale-95 transition-all text-center"
                      >
                        Aprobar Reserva
                      </button>
                      <button
                        onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                        className="py-2.5 px-3 rounded-xl bg-rose-950/90 text-rose-300 border border-rose-800/60 text-xs font-bold active:scale-95 transition-all text-center"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}

                  {res.status === 'CONFIRMED' && (
                    <button
                      onClick={() => onUpdateStatus(res.id, 'ACTIVE')}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold active:scale-95 transition-all text-center"
                    >
                      Iniciar Entrega del Auto
                    </button>
                  )}

                  {res.status === 'ACTIVE' && (
                    <button
                      onClick={() => onUpdateStatus(res.id, 'COMPLETED')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-95 transition-all text-center"
                    >
                      Completar Devolución del Auto
                    </button>
                  )}

                  {/* Barra de Herramientas Compactas: Contrato, Inspección, Editar, Eliminar */}
                  <div className="flex items-center justify-between pt-1 border-t border-carbon-800/80 text-xs">
                    <button
                      onClick={() => setContractReservation(res)}
                      className="p-2 rounded-lg bg-carbon-850 text-gold-400 hover:bg-gold-500/20 border border-carbon-700 flex items-center gap-1 font-semibold"
                      title="Contrato PDF"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Contrato</span>
                    </button>

                    <button
                      onClick={() => setInspectionReservation(res)}
                      className="p-2 rounded-lg bg-carbon-850 text-emerald-400 hover:bg-emerald-500/20 border border-carbon-700 flex items-center gap-1 font-semibold"
                      title="Acta Inspección"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Inspección</span>
                    </button>

                    <button
                      onClick={() => setEditingReservation(res)}
                      className="p-2 rounded-lg bg-carbon-850 text-silver-300 hover:text-gold-300 border border-carbon-700 flex items-center gap-1 font-semibold"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Editar</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm(`¿Seguro que deseas eliminar permanentemente la reserva ${res.id}?`)) {
                          await onDeleteReservation(res.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-carbon-850 text-rose-400 hover:bg-rose-950/50 border border-rose-500/30"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* ================= VISTA ESCRITORIO (>= md): TABLA O TARJETAS SEGÚN SELECCIÓN ================= */}
          <div className="hidden md:block">
            {viewMode === 'table' ? (
              /* TABLA EJECUTIVA EN ESCRITORIO */
              <div className="rounded-2xl bg-carbon-900 border border-carbon-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-carbon-850 border-b border-carbon-750 text-xs uppercase tracking-wider text-silver-300 font-extrabold">
                        <th className="py-4 px-6">Código / Fecha</th>
                        <th className="py-4 px-4">Vehículo</th>
                        <th className="py-4 px-4">Conductor</th>
                        <th className="py-4 px-4">Periodo de Renta</th>
                        <th className="py-4 px-4">Entrega</th>
                        <th className="py-4 px-4 text-right">Total Renta</th>
                        <th className="py-4 px-4 text-center">Estado</th>
                        <th className="py-4 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-carbon-800/80">
                      {filteredReservations.map((res) => (
                        <tr
                          key={res.id}
                          className="hover:bg-carbon-850/60 transition-colors group cursor-pointer"
                          onClick={() => setSelectedReservation(res)}
                        >
                          {/* Código */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-gold-400 bg-carbon-800 px-2.5 py-1 rounded-lg border border-carbon-700">
                                {res.id}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(res.id);
                                }}
                                className="text-silver-400 hover:text-gold-400 transition-colors p-1"
                                title="Copiar código"
                              >
                                {copiedId === res.id ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <span className="text-xs text-silver-400 block mt-1 font-mono">
                              {new Date(res.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Vehículo */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3.5 min-w-[200px]">
                              <img
                                src={res.vehicleImage}
                                alt={res.vehicleName}
                                className="w-16 h-12 object-cover rounded-xl border border-carbon-700 flex-shrink-0 shadow-sm"
                              />
                              <div className="min-w-0">
                                <strong className="text-white font-black text-sm sm:text-base block truncate">
                                  {res.vehicleName}
                                </strong>
                                <span className="text-xs text-silver-300 font-mono font-bold mt-0.5 block">
                                  {res.vehiclePlate}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Conductor */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-sm sm:text-base text-white">{res.client.fullName}</div>
                            <span className="text-xs text-silver-300 font-mono">{res.client.phone}</span>
                          </td>

                          {/* Periodo */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-xs sm:text-sm text-white">
                              {res.startDate} al {res.endDate}
                            </div>
                            <span className="text-xs text-silver-300 font-mono">
                              {res.pricing?.days} día(s) • {res.pickupTime}
                            </span>
                          </td>

                          {/* Entrega */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-silver-200 font-medium">
                              {getDeliveryLocationLabel(res.deliveryLocation)}
                            </span>
                          </td>

                          {/* Monto */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="font-mono font-black text-gold-400 text-base sm:text-lg">
                              {formatCurrency(res.pricing?.rentalTotal || 0)}
                            </div>
                            <span className="text-xs text-silver-400 font-mono">
                              + {formatCurrency(res.pricing?.securityDeposit || 0)} dep.
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            {getStatusBadge(res.status)}
                          </td>

                          {/* Acciones */}
                          <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => setContractReservation(res)}
                                title="Ver Contrato y Voucher Oficial (PDF / Imprimir)"
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-gold-500/20 border border-gold-500/40 text-gold-400 transition-all shadow-sm cursor-pointer hover:scale-105"
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setInspectionReservation(res)}
                                title="Acta de Inspección Check-in / Check-out"
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 transition-all shadow-sm cursor-pointer hover:scale-105"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenClientWhatsApp(res)}
                                title="Enviar WhatsApp Concierge"
                                className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 transition-colors shadow-sm cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingReservation(res)}
                                title="Editar Reserva"
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-gold-500/30 text-gold-400 hover:text-gold-300 transition-colors shadow-sm cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`¿Seguro que deseas eliminar permanentemente la reserva ${res.id}?`)) {
                                    await onDeleteReservation(res.id);
                                  }
                                }}
                                title="Eliminar Reserva"
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-rose-950/60 border border-rose-500/30 text-silver-400 hover:text-rose-400 transition-colors shadow-sm cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedReservation(res)}
                                title="Ver Expediente de Solicitud"
                                className="p-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-200 hover:text-white transition-colors shadow-sm cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
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
              /* TARJETAS DETALLADAS EN ESCRITORIO */
              <div className="space-y-5">
                {filteredReservations.map((res) => (
                  <div
                    key={`desktop-${res.id}`}
                    onClick={() => setSelectedReservation(res)}
                    className="p-6 rounded-2xl bg-carbon-900 border border-carbon-800 hover:border-gold-500/50 transition-all shadow-xl space-y-4 cursor-pointer group"
                  >
                    {/* Cabecera */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-carbon-800">
                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm font-mono font-bold text-gold-400 bg-carbon-800 px-3 py-1 rounded-xl border border-carbon-750 flex items-center gap-2">
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
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </span>
                        <span className="text-xs sm:text-sm text-silver-400 font-mono">
                          Registrada el {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(res.status)}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                      {/* Vehículo */}
                      <div className="flex items-start gap-4">
                        <img
                          src={res.vehicleImage}
                          alt={res.vehicleName}
                          className="w-24 h-18 object-cover rounded-xl border-2 border-carbon-700 shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs uppercase text-gold-400 font-bold block">
                            Vehículo Asignado
                          </span>
                          <strong className="text-white text-base sm:text-lg font-black block mt-0.5">
                            {res.vehicleName}
                          </strong>
                          <span className="text-xs text-silver-300 font-mono font-bold mt-1 block">
                            Placa: {res.vehiclePlate}
                          </span>
                        </div>
                      </div>

                      {/* Cliente */}
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase text-silver-400 font-bold block tracking-wider">
                          Conductor Titular
                        </span>
                        <div className="font-extrabold text-white text-base">{res.client.fullName}</div>
                        <div className="text-silver-300 flex items-center gap-2 text-xs">
                          <FileText className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                          <span>Licencia: {res.client.driverLicense}</span>
                        </div>
                        <div className="text-silver-300 flex items-center gap-2 text-xs">
                          <Phone className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                          <span className="font-mono">{res.client.phone}</span>
                        </div>
                      </div>

                      {/* Agenda */}
                      <div className="space-y-1.5 md:text-right">
                        <span className="text-xs uppercase text-silver-400 font-bold block tracking-wider">
                          Agenda & Finanzas
                        </span>
                        <div className="font-bold text-white text-sm sm:text-base">
                          {res.startDate} al {res.endDate} ({res.pricing?.days} d)
                        </div>
                        <div className="text-silver-300 flex md:justify-end items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>{getDeliveryLocationLabel(res.deliveryLocation)}</span>
                        </div>
                        <div className="text-xl font-black font-mono text-gold-400 pt-1">
                          Total: {formatCurrency((res.pricing?.rentalTotal || 0) + (res.pricing?.securityDeposit || 0))}
                        </div>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="pt-3.5 border-t border-carbon-800/80 flex flex-wrap items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenClientWhatsApp(res)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>WhatsApp Concierge</span>
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setContractReservation(res)}
                          className="px-3 py-2 rounded-xl bg-carbon-800 hover:bg-gold-500/20 text-gold-400 border border-gold-500/40 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Ver Contrato y Voucher Oficial (PDF)"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Contrato</span>
                        </button>

                        <button
                          onClick={() => setInspectionReservation(res)}
                          className="px-3 py-2 rounded-xl bg-carbon-800 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Acta de Inspección Check-in / Check-out"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Inspección</span>
                        </button>

                        <button
                          onClick={() => setEditingReservation(res)}
                          className="px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 border border-gold-500/30 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`¿Seguro que deseas eliminar permanentemente la reserva ${res.id}?`)) {
                              await onDeleteReservation(res.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-carbon-800 hover:bg-rose-950/60 text-silver-400 hover:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                          title="Eliminar reserva"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {res.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => onUpdateStatus(res.id, 'CONFIRMED')}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-carbon-950 text-xs sm:text-sm font-black transition-all shadow-md active:scale-95"
                            >
                              Aprobar Reserva
                            </button>
                            <button
                              onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                              className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs sm:text-sm font-bold transition-colors"
                            >
                              Rechazar
                            </button>
                          </>
                        )}

                        {res.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onUpdateStatus(res.id, 'ACTIVE')}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-colors"
                          >
                            Iniciar Entrega
                          </button>
                        )}

                        {res.status === 'ACTIVE' && (
                          <button
                            onClick={() => onUpdateStatus(res.id, 'COMPLETED')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-colors"
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
          </div>
        </>
      )}

      {/* 4. Modal / Expediente Completo de Reserva */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReservation(null);
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto"
          >
            
            {/* Cabecera Modal */}
            <div className="p-6 border-b border-carbon-800 bg-carbon-850/95 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-lg bg-carbon-800 text-gold-400 border border-carbon-750">
                    {selectedReservation.id}
                  </span>
                  {getStatusBadge(selectedReservation.status)}
                </div>
                <h3 className="text-xl font-black text-white font-display">
                  Expediente de Solicitud de Reserva
                </h3>
              </div>

              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
                aria-label="Cerrar expediente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
              
              {/* Vehículo Asignado */}
              <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-800 flex items-center gap-4">
                <img
                  src={selectedReservation.vehicleImage}
                  alt={selectedReservation.vehicleName}
                  className="w-24 h-16 object-cover rounded-xl border-2 border-carbon-700 flex-shrink-0"
                />
                <div>
                  <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">Vehículo Asignado</span>
                  <h4 className="text-lg font-black text-white font-display mt-0.5">
                    {selectedReservation.vehicleName}
                  </h4>
                  <div className="text-xs text-silver-300 font-mono font-bold mt-1">
                    Placa: {selectedReservation.vehiclePlate}
                  </div>
                </div>
              </div>

              {/* Titular Conductor */}
              <div className="p-5 rounded-2xl bg-carbon-850/60 border border-carbon-800 space-y-2.5">
                <span className="text-xs font-bold uppercase text-silver-400 block tracking-wider">
                  Datos del Conductor Titular (KYC)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><strong className="text-silver-400">Nombre:</strong> <span className="text-white font-bold">{selectedReservation.client.fullName}</span></div>
                  <div><strong className="text-silver-400">ID / Pasaporte:</strong> <span className="text-white font-mono">{selectedReservation.client.documentId}</span></div>
                  <div><strong className="text-silver-400">Licencia:</strong> <span className="text-white font-mono">{selectedReservation.client.driverLicense}</span></div>
                  <div><strong className="text-silver-400">Teléfono:</strong> <span className="text-white font-mono">{selectedReservation.client.phone}</span></div>
                  <div className="sm:col-span-2"><strong className="text-silver-400">Email:</strong> <span className="text-white">{selectedReservation.client.email}</span></div>
                </div>
              </div>

              {/* Fechas y Entrega */}
              <div className="p-5 rounded-2xl bg-carbon-850/60 border border-carbon-800 space-y-2.5">
                <span className="text-xs font-bold uppercase text-silver-400 block tracking-wider">
                  Agenda y Ubicación
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong className="text-silver-400">Recogida:</strong> <span className="text-white">{selectedReservation.startDate} ({selectedReservation.pickupTime})</span>
                  </div>
                  <div>
                    <strong className="text-silver-400">Devolución:</strong> <span className="text-white">{selectedReservation.endDate} ({selectedReservation.returnTime})</span>
                  </div>
                  <div className="sm:col-span-2">
                    <strong className="text-silver-400">Modalidad de Entrega:</strong> <span className="text-white font-semibold">{getDeliveryLocationLabel(selectedReservation.deliveryLocation)}</span>
                    {selectedReservation.deliveryAddress && ` - ${selectedReservation.deliveryAddress}`}
                  </div>
                </div>
              </div>

              {/* Desglose Financiero */}
              <div className="p-5 rounded-2xl bg-carbon-850 border border-carbon-800 space-y-2.5">
                <span className="text-xs font-bold uppercase text-silver-400 block tracking-wider">
                  Desglose Financiero
                </span>
                <div className="flex justify-between text-silver-300 text-sm">
                  <span>Subtotal Renta ({selectedReservation.pricing?.days} días):</span>
                  <span className="text-white font-bold font-mono">
                    {formatCurrency(selectedReservation.pricing?.rentalTotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-silver-300 text-sm">
                  <span>Depósito en Garantía (Reembolsable):</span>
                  <span className="text-white font-bold font-mono">
                    {formatCurrency(selectedReservation.pricing?.securityDeposit || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-silver-300 text-sm">
                  <span>Cobertura VIP a Todo Riesgo:</span>
                  <span className="text-emerald-400 font-bold">Incluida ($0)</span>
                </div>
                <div className="pt-3 border-t border-carbon-750 flex justify-between font-black text-base text-white">
                  <span>Total Estimado al Despacho:</span>
                  <span className="font-mono text-gold-400 text-xl">
                    {formatCurrency(
                      (selectedReservation.pricing?.rentalTotal || 0) +
                        (selectedReservation.pricing?.securityDeposit || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 flex flex-wrap gap-2.5">
                <button
                  onClick={() => handleOpenClientWhatsApp(selectedReservation)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp Oficial</span>
                </button>

                <button
                  onClick={() => {
                    const target = selectedReservation;
                    setSelectedReservation(null);
                    setContractReservation(target);
                  }}
                  className="py-3 px-4 rounded-xl bg-carbon-800 hover:bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Generar e Imprimir Contrato Oficial"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Contrato PDF</span>
                </button>

                <button
                  onClick={() => {
                    const target = selectedReservation;
                    setSelectedReservation(null);
                    setInspectionReservation(target);
                  }}
                  className="py-3 px-4 rounded-xl bg-carbon-800 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Acta de Inspección Check-in / Check-out"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Inspección</span>
                </button>

                <button
                  onClick={() => {
                    const target = selectedReservation;
                    setSelectedReservation(null);
                    setEditingReservation(target);
                  }}
                  className="py-3 px-4 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-200 hover:text-white font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-gold-400" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={async () => {
                    if (window.confirm(`¿Seguro que deseas eliminar permanentemente la reserva ${selectedReservation.id}?`)) {
                      await onDeleteReservation(selectedReservation.id);
                      setSelectedReservation(null);
                    }
                  }}
                  className="py-3 px-4 rounded-xl bg-carbon-850 hover:bg-rose-950/80 border border-rose-500/40 text-rose-400 hover:text-rose-300 font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>

                {selectedReservation.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedReservation.id, 'CONFIRMED');
                      setSelectedReservation(null);
                    }}
                    className="py-3 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-black text-xs uppercase transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
                  >
                    Aprobar Ahora
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. Modal de Edición de Reserva */}
      <AdminReservationEditModal
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        reservation={editingReservation}
        vehicles={vehicles}
        onSave={onUpdateReservation}
        onDelete={onDeleteReservation}
      />

      {/* 6. Modal de Contrato Oficial & Voucher PDF */}
      <AdminContractModal
        isOpen={!!contractReservation}
        onClose={() => setContractReservation(null)}
        reservation={contractReservation}
        vehicle={vehicles.find((v) => v.id === contractReservation?.vehicleId)}
      />

      {/* 7. Modal de Inspección Check-in / Check-out */}
      <AdminInspectionModal
        isOpen={!!inspectionReservation}
        onClose={() => setInspectionReservation(null)}
        reservation={inspectionReservation}
        vehicle={vehicles.find((v) => v.id === inspectionReservation?.vehicleId)}
      />

    </div>
  );
};

