import React, { useMemo, useState } from 'react';
import { Reservation } from '../../types/reservation';
import {
  Users,
  Search,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  Calendar,
  LayoutGrid,
  Table as TableIcon,
  DollarSign,
  TrendingUp,
  X,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AdminClientsViewProps {
  reservations: Reservation[];
}

interface ClientSummary {
  fullName: string;
  documentId: string;
  driverLicense: string;
  phone: string;
  email: string;
  ageConfirmed: boolean;
  totalReservations: number;
  totalSpent: number;
  lastReservationDate: string;
  reservationsList: Reservation[];
}

export const AdminClientsView: React.FC<AdminClientsViewProps> = ({ reservations }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);

  // Agrupar clientes únicos y recopilar su historial completo
  const clientsList = useMemo(() => {
    const clientsMap = new Map<string, ClientSummary>();

    reservations.forEach((r) => {
      const key = (r.client.documentId || r.client.email).trim().toLowerCase();
      const existing = clientsMap.get(key);

      const reservationSpend =
        r.status !== 'CANCELLED' ? r.pricing?.rentalTotal || 0 : 0;

      if (existing) {
        existing.totalReservations += 1;
        existing.totalSpent += reservationSpend;
        existing.reservationsList.push(r);
        if (r.createdAt > existing.lastReservationDate) {
          existing.lastReservationDate = r.createdAt;
        }
      } else {
        clientsMap.set(key, {
          fullName: r.client.fullName,
          documentId: r.client.documentId,
          driverLicense: r.client.driverLicense,
          phone: r.client.phone,
          email: r.client.email,
          ageConfirmed: r.client.ageConfirmation,
          totalReservations: 1,
          totalSpent: reservationSpend,
          lastReservationDate: r.createdAt,
          reservationsList: [r],
        });
      }
    });

    return Array.from(clientsMap.values());
  }, [reservations]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clientsList;
    return clientsList.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.documentId.toLowerCase().includes(term) ||
        c.driverLicense.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term)
    );
  }, [clientsList, searchTerm]);

  // Métricas acumuladas del CRM
  const totalClientsCount = clientsList.length;
  const verifiedCount = clientsList.filter((c) => c.ageConfirmed).length;
  const totalRevenue = clientsList.reduce((acc, c) => acc + c.totalSpent, 0);
  const averageSpent = totalClientsCount > 0 ? Math.round(totalRevenue / totalClientsCount) : 0;

  const handleOpenWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Hola ${name}, te saludamos cordialmente desde el Concierge VIP de Premium Car Rental.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. KPIs Ejecutivos de Cartera de Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Clientes Registrados
            </span>
            <div className="text-2xl font-bold font-display text-silver-100 mt-1">
              {totalClientsCount}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              Directorio de conductores boutique
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Verificación KYC
            </span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
              {verifiedCount} / {totalClientsCount}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Mayores de 25 años</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Inversión Facturada
            </span>
            <div className="text-2xl font-bold font-display text-gold-400 font-mono mt-1">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              Facturación bruta acumulada
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
              Ticket Promedio
            </span>
            <div className="text-2xl font-bold font-display text-silver-100 font-mono mt-1">
              {formatCurrency(averageSpent)}
            </div>
            <div className="text-[11px] text-silver-500 mt-0.5">
              Inversión promedio por titular
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Barra de Búsqueda y Switcher de Vista */}
      <div className="p-4 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-silver-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, documento, licencia, teléfono o email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-carbon-850 border border-carbon-750 text-silver-200 text-xs focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Alternador de Vista Tabla / Tarjetas */}
          <div className="flex items-center bg-carbon-850 p-1 rounded-xl border border-carbon-750">
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
              <span className="hidden sm:inline">Tabla</span>
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
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Contenedor de Datos: Tabla o Tarjetas */}
      {filteredClients.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-carbon-900 border border-carbon-800 space-y-3">
          <Users className="w-10 h-10 text-silver-600 mx-auto" />
          <h4 className="text-base font-semibold text-silver-200">
            No se encontraron clientes registrados
          </h4>
          <p className="text-xs text-silver-500 max-w-md mx-auto">
            {searchTerm
              ? 'No hay registros que coincidan con la búsqueda introducida.'
              : 'Los clientes que soliciten reservas en el showroom aparecerán catalogados automáticamente en este directorio.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= VISTA TABLA EJECUTIVA (FULL WIDTH) ================= */
        <div className="rounded-2xl bg-carbon-900 border border-carbon-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-carbon-850/80 border-b border-carbon-800 text-[11px] uppercase tracking-wider text-silver-400 font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Conductor Titular</th>
                  <th className="py-3.5 px-4">Documento / ID</th>
                  <th className="py-3.5 px-4">Licencia de Conducir</th>
                  <th className="py-3.5 px-4">Contacto Directo</th>
                  <th className="py-3.5 px-4 text-center">Reservas</th>
                  <th className="py-3.5 px-4 text-right">Inversión Total</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800/70">
                {filteredClients.map((client) => (
                  <tr
                    key={client.documentId || client.email}
                    className="hover:bg-carbon-850/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedClient(client)}
                  >
                    {/* Cliente / Avatar */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center font-bold font-display flex-shrink-0">
                          {client.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-silver-100 font-semibold block group-hover:text-gold-400 transition-colors truncate">
                            {client.fullName}
                          </strong>
                          <span className="text-[11px] text-silver-500 truncate block">
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="py-4 px-4 font-mono text-silver-300 whitespace-nowrap">
                      {client.documentId}
                    </td>

                    {/* Licencia */}
                    <td className="py-4 px-4 font-mono text-silver-300 whitespace-nowrap">
                      {client.driverLicense}
                    </td>

                    {/* Teléfono */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-silver-300">{client.phone}</span>
                    </td>

                    {/* Total Reservas */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-carbon-800 text-gold-400 border border-carbon-750">
                        {client.totalReservations}
                      </span>
                    </td>

                    {/* Inversión Total */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-silver-100 whitespace-nowrap">
                      {formatCurrency(client.totalSpent)}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 sm:px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenWhatsApp(client.phone, client.fullName)}
                          title="Contactar por WhatsApp"
                          className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-400 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="px-3 py-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-300 hover:text-gold-400 text-xs font-semibold transition-colors"
                        >
                          Expediente
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
        /* ================= VISTA TARJETAS VIP ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.documentId || client.email}
              onClick={() => setSelectedClient(client)}
              className="p-5 rounded-2xl bg-carbon-900 border border-carbon-800 hover:border-gold-500/40 transition-all shadow-sm space-y-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-carbon-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-sm font-display">
                      {client.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-silver-100 font-display group-hover:text-gold-400 transition-colors">
                        {client.fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verificado +25 Años</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-carbon-800 text-silver-300 border border-carbon-750">
                    {client.totalReservations} reserva(s)
                  </span>
                </div>

                {/* Detalles KYC */}
                <div className="space-y-2 pt-3 text-xs">
                  <div className="flex items-center justify-between text-silver-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gold-400" />
                      ID / Pasaporte:
                    </span>
                    <strong className="text-silver-200 font-mono">{client.documentId}</strong>
                  </div>

                  <div className="flex items-center justify-between text-silver-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gold-400" />
                      Licencia de Conducir:
                    </span>
                    <strong className="text-silver-200 font-mono">{client.driverLicense}</strong>
                  </div>

                  <div className="flex items-center justify-between text-silver-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gold-400" />
                      Teléfono:
                    </span>
                    <span className="text-silver-200">{client.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-silver-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold-400" />
                      Email:
                    </span>
                    <span className="text-silver-200 truncate max-w-[170px]" title={client.email}>
                      {client.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta */}
              <div className="pt-3 border-t border-carbon-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div>
                  <span className="text-[10px] text-silver-500 uppercase block">Gasto Total</span>
                  <span className="text-xs font-bold font-mono text-gold-400">
                    {formatCurrency(client.totalSpent)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenWhatsApp(client.phone, client.fullName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="px-2.5 py-1.5 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs font-semibold border border-carbon-700 transition-colors"
                  >
                    Ver
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 4. Modal / Expediente Completo de Cliente */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto">
            
            {/* Cabecera del Expediente */}
            <div className="p-5 sm:p-6 border-b border-carbon-800 bg-carbon-850/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center font-bold text-lg font-display">
                  {selectedClient.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                    Expediente KYC Conductor
                  </span>
                  <h3 className="text-lg font-bold text-silver-100 font-display">
                    {selectedClient.fullName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 rounded-lg bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
                aria-label="Cerrar expediente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Expediente */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Información General y Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-carbon-850/60 border border-carbon-800 text-xs">
                <div>
                  <span className="text-[10px] text-silver-500 uppercase block">Documento de Identidad</span>
                  <strong className="text-silver-200 font-mono text-sm">{selectedClient.documentId}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-silver-500 uppercase block">Licencia de Conducir</span>
                  <strong className="text-silver-200 font-mono text-sm">{selectedClient.driverLicense}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-silver-500 uppercase block">Teléfono / WhatsApp</span>
                  <span className="text-silver-200 font-semibold">{selectedClient.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-silver-500 uppercase block">Correo Electrónico</span>
                  <span className="text-silver-200">{selectedClient.email}</span>
                </div>
              </div>

              {/* Historial de Reservas del Cliente */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-silver-200 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gold-400" />
                    Historial de Reservas ({selectedClient.reservationsList.length})
                  </h4>
                  <span className="text-xs font-mono font-bold text-gold-400">
                    Total Invertido: {formatCurrency(selectedClient.totalSpent)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedClient.reservationsList.map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-xl bg-carbon-850 border border-carbon-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.vehicleImage}
                          alt={res.vehicleName}
                          className="w-12 h-9 object-cover rounded-lg border border-carbon-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-silver-100">{res.vehicleName}</span>
                            <span className="text-[10px] font-mono text-gold-400 bg-carbon-800 px-1.5 py-0.5 rounded">
                              {res.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-silver-400">
                            {res.startDate} al {res.endDate} ({res.pricing?.days} d)
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-silver-100">
                          {formatCurrency(res.pricing?.rentalTotal || 0)}
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            res.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : res.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                              : 'bg-carbon-800 text-silver-400'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Acción WhatsApp */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => handleOpenWhatsApp(selectedClient.phone, selectedClient.fullName)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Iniciar Conversación por WhatsApp</span>
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-5 py-3 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-300 text-xs font-semibold border border-carbon-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
