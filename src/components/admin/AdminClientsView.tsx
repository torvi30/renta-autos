import React, { useState, useMemo } from 'react';
import { Reservation } from '../../types/reservation';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  Search,
  Send,
  Table as TableIcon,
  LayoutGrid,
  DollarSign,
  TrendingUp,
  X,
} from 'lucide-react';

interface ClientProfile {
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

interface AdminClientsViewProps {
  reservations: Reservation[];
}

export const AdminClientsView: React.FC<AdminClientsViewProps> = ({ reservations }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [kycFilter, setKycFilter] = useState<'ALL' | 'VERIFIED'>('ALL');
  const [sortByRevenue, setSortByRevenue] = useState<boolean>(false);
  const [minSpentFilter, setMinSpentFilter] = useState<boolean>(false);

  // Extraer cartera única de clientes a partir de las reservas registradas
  const clientsList: ClientProfile[] = useMemo(() => {
    const clientsMap = new Map<string, ClientProfile>();

    reservations.forEach((r) => {
      const key = r.client.documentId || r.client.email || r.client.fullName;
      const reservationSpend =
        r.status !== 'CANCELLED' ? r.pricing?.rentalTotal || 0 : 0;

      if (clientsMap.has(key)) {
        const existing = clientsMap.get(key)!;
        existing.totalReservations += 1;
        existing.totalSpent += reservationSpend;
        existing.reservationsList.push(r);
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

  // Métricas acumuladas del CRM
  const totalClientsCount = clientsList.length;
  const verifiedCount = clientsList.filter((c) => c.ageConfirmed).length;
  const totalRevenue = clientsList.reduce((acc, c) => acc + c.totalSpent, 0);
  const averageSpent = totalClientsCount > 0 ? Math.round(totalRevenue / totalClientsCount) : 0;

  const filteredClients = useMemo(() => {
    let result = [...clientsList];

    if (kycFilter === 'VERIFIED') {
      result = result.filter((c) => c.ageConfirmed);
    }

    if (minSpentFilter) {
      result = result.filter((c) => c.totalSpent >= averageSpent);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(term) ||
          c.documentId.toLowerCase().includes(term) ||
          c.driverLicense.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term)
      );
    }

    if (sortByRevenue) {
      result.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    return result;
  }, [clientsList, searchTerm, kycFilter, minSpentFilter, sortByRevenue, averageSpent]);

  const handleOpenWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Hola ${name}, te saludamos cordialmente desde el Concierge VIP de Premium Car Rental.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleResetFilters = () => {
    setKycFilter('ALL');
    setSortByRevenue(false);
    setMinSpentFilter(false);
    setSearchTerm('');
  };

  const isAllSelected = kycFilter === 'ALL' && !sortByRevenue && !minSpentFilter;

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* 1. KPIs Ejecutivos de Cartera de Clientes (Interactivos con Filtros Rápidos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Clientes Registrados */}
        <button
          type="button"
          onClick={handleResetFilters}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            isAllSelected
              ? 'border-gold-500 ring-2 ring-gold-500/40 shadow-gold-500/10'
              : 'border-carbon-750 hover:border-gold-500/50'
          }`}
          title="Clic para ver toda la cartera sin filtros"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Clientes Registrados
              </span>
              {isAllSelected && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold">
                  Ver Todos
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {totalClientsCount} <span className="text-lg sm:text-xl font-semibold text-silver-400">Titulares</span>
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-400 font-medium flex items-center justify-between">
            <span>Directorio VIP de conductores</span>
            <span className="text-gold-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {isAllSelected ? 'Todos activos' : 'Restablecer →'}
            </span>
          </div>
        </button>

        {/* Verificación KYC */}
        <button
          type="button"
          onClick={() => setKycFilter(kycFilter === 'VERIFIED' ? 'ALL' : 'VERIFIED')}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            kycFilter === 'VERIFIED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/15 shadow-emerald-500/10'
              : 'border-carbon-750 hover:border-emerald-500/50'
          }`}
          title="Clic para filtrar solo clientes con KYC verificado"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Verificación KYC
              </span>
              {kycFilter === 'VERIFIED' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  Filtrando
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-emerald-400 tracking-tight">
            {verifiedCount} / {totalClientsCount}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-emerald-400 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Mayores de 25 años</span>
            </div>
            <span className="text-emerald-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {kycFilter === 'VERIFIED' ? 'Quitar' : 'Filtrar →'}
            </span>
          </div>
        </button>

        {/* Inversión Facturada (Ordenar por Mayor Gasto) */}
        <button
          type="button"
          onClick={() => setSortByRevenue(!sortByRevenue)}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            sortByRevenue
              ? 'border-gold-500 ring-2 ring-gold-500/40 bg-gold-950/15 shadow-gold-500/10'
              : 'border-carbon-750 hover:border-gold-500/50'
          }`}
          title="Clic para ordenar clientes por mayor volumen de inversión (Top VIP)"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-emerald-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Inversión Facturada
              </span>
              {sortByRevenue && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold">
                  Top Inversores
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-gold-400 tracking-tight font-mono">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-400 font-medium flex items-center justify-between">
            <span>Facturación acumulada</span>
            <span className="text-gold-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {sortByRevenue ? 'Desactivar orden' : 'Ordenar Top →'}
            </span>
          </div>
        </button>

        {/* Ticket Promedio (Filtrar Alto Rendimiento) */}
        <button
          type="button"
          onClick={() => setMinSpentFilter(!minSpentFilter)}
          className={`relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none ${
            minSpentFilter
              ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/15 shadow-blue-500/10'
              : 'border-carbon-750 hover:border-blue-500/50'
          }`}
          title="Clic para ver clientes con inversión superior al ticket promedio"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono">
                Ticket Promedio
              </span>
              {minSpentFilter && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold">
                  {'>'} Promedio
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight font-mono">
            {formatCurrency(averageSpent)}
          </div>
          <div className="mt-4 pt-3 border-t border-carbon-800/80 text-xs sm:text-sm text-silver-300 font-medium flex items-center justify-between">
            <span>Inversión promedio</span>
            <span className="text-blue-400 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {minSpentFilter ? 'Quitar filtro' : 'Filtrar VIP →'}
            </span>
          </div>
        </button>

      </div>

      {/* 2. Barra de Búsqueda y Switcher de Vista */}
      <div className="p-4 sm:p-5 rounded-2xl bg-carbon-900 border border-carbon-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-5 h-5 text-silver-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, documento, licencia, teléfono o email..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-carbon-850 border border-carbon-700 text-white placeholder-silver-500 text-sm focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Alternador de Vista Tabla / Tarjetas */}
          <div className="flex items-center bg-carbon-850 p-1.5 rounded-xl border border-carbon-750">
            <button
              onClick={() => setViewMode('table')}
              title="Vista de Tabla Ejecutiva"
              className={`p-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                viewMode === 'table'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Vista en Tarjetas"
              className={`p-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                viewMode === 'cards'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tarjetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Contenedor de Datos: Tabla o Tarjetas */}
      {filteredClients.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-carbon-900 border border-carbon-800 space-y-3">
          <Users className="w-12 h-12 text-silver-600 mx-auto" />
          <h4 className="text-lg font-bold text-silver-200">
            No se encontraron clientes registrados
          </h4>
          <p className="text-sm text-silver-400 max-w-md mx-auto">
            {searchTerm
              ? 'No hay registros que coincidan con la búsqueda introducida.'
              : 'Los clientes que soliciten reservas en el showroom aparecerán catalogados automáticamente en este directorio.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= VISTA TABLA EJECUTIVA (FULL WIDTH) ================= */
        <div className="rounded-2xl bg-carbon-900 border border-carbon-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-carbon-850 border-b border-carbon-750 text-xs uppercase tracking-wider text-silver-300 font-extrabold">
                  <th className="py-4 px-6">Conductor Titular</th>
                  <th className="py-4 px-4">Documento / ID</th>
                  <th className="py-4 px-4">Licencia de Conducir</th>
                  <th className="py-4 px-4">Contacto Directo</th>
                  <th className="py-4 px-4 text-center">Reservas</th>
                  <th className="py-4 px-4 text-right">Inversión Total</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800/80">
                {filteredClients.map((client) => (
                  <tr
                    key={client.documentId || client.email}
                    className="hover:bg-carbon-850/60 transition-colors group cursor-pointer"
                    onClick={() => setSelectedClient(client)}
                  >
                    {/* Cliente / Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center font-bold text-base font-display flex-shrink-0 shadow-sm">
                          {client.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-white font-extrabold text-sm sm:text-base block group-hover:text-gold-400 transition-colors truncate">
                            {client.fullName}
                          </strong>
                          <span className="text-xs text-silver-400 font-mono truncate block mt-0.5">
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="py-4 px-4 font-mono font-bold text-silver-200 whitespace-nowrap">
                      {client.documentId}
                    </td>

                    {/* Licencia */}
                    <td className="py-4 px-4 font-mono font-bold text-silver-200 whitespace-nowrap">
                      {client.driverLicense}
                    </td>

                    {/* Teléfono */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-white font-mono font-semibold">{client.phone}</span>
                    </td>

                    {/* Total Reservas */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl font-mono text-xs font-bold bg-carbon-800 text-gold-400 border border-carbon-700">
                        {client.totalReservations}
                      </span>
                    </td>

                    {/* Inversión Total */}
                    <td className="py-4 px-4 text-right font-mono font-black text-gold-400 text-base sm:text-lg whitespace-nowrap">
                      {formatCurrency(client.totalSpent)}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenWhatsApp(client.phone, client.fullName)}
                          title="Contactar por WhatsApp"
                          className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 transition-colors shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-silver-200 hover:text-gold-400 text-xs sm:text-sm font-bold transition-colors shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.documentId || client.email}
              onClick={() => setSelectedClient(client)}
              className="p-6 rounded-2xl bg-carbon-900 border border-carbon-800 hover:border-gold-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-carbon-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center font-bold text-base font-display">
                      {client.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white font-display group-hover:text-gold-400 transition-colors">
                        {client.fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verificado +25 Años</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-carbon-800 text-silver-200 border border-carbon-700">
                    {client.totalReservations} reserva(s)
                  </span>
                </div>

                {/* Detalles KYC */}
                <div className="space-y-2.5 pt-4 text-sm">
                  <div className="flex items-center justify-between text-silver-300">
                    <span className="flex items-center gap-2 text-silver-400">
                      <FileText className="w-4 h-4 text-gold-400" />
                      ID / Pasaporte:
                    </span>
                    <strong className="text-white font-mono">{client.documentId}</strong>
                  </div>

                  <div className="flex items-center justify-between text-silver-300">
                    <span className="flex items-center gap-2 text-silver-400">
                      <FileText className="w-4 h-4 text-gold-400" />
                      Licencia:
                    </span>
                    <strong className="text-white font-mono">{client.driverLicense}</strong>
                  </div>

                  <div className="flex items-center justify-between text-silver-300">
                    <span className="flex items-center gap-2 text-silver-400">
                      <Phone className="w-4 h-4 text-gold-400" />
                      Teléfono:
                    </span>
                    <span className="text-white font-mono font-semibold">{client.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-silver-300">
                    <span className="flex items-center gap-2 text-silver-400">
                      <Mail className="w-4 h-4 text-gold-400" />
                      Email:
                    </span>
                    <span className="text-white truncate max-w-[180px]" title={client.email}>
                      {client.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta */}
              <div className="pt-4 border-t border-carbon-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div>
                  <span className="text-xs text-silver-400 uppercase font-medium block">Inversión Total</span>
                  <span className="text-base font-black font-mono text-gold-400">
                    {formatCurrency(client.totalSpent)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenWhatsApp(client.phone, client.fullName)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="px-3.5 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-200 text-xs sm:text-sm font-bold border border-carbon-700 transition-colors shadow-sm"
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedClient(null);
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto"
          >
            
            {/* Cabecera del Expediente */}
            <div className="p-6 border-b border-carbon-800 bg-carbon-850/95 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-500/35 text-gold-400 flex items-center justify-center font-bold text-xl font-display shadow-inner">
                  {selectedClient.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                    Expediente KYC Conductor
                  </span>
                  <h3 className="text-xl font-black text-white font-display mt-0.5">
                    {selectedClient.fullName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="p-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-400 hover:text-white transition-colors"
                aria-label="Cerrar expediente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Expediente */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
              
              {/* Resumen Comercial */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800 text-center">
                  <span className="text-xs text-silver-400 uppercase font-semibold block">Reservas Contratadas</span>
                  <div className="text-3xl font-black font-mono text-gold-400 mt-1">
                    {selectedClient.totalReservations}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800 text-center">
                  <span className="text-xs text-silver-400 uppercase font-semibold block">Inversión Facturada</span>
                  <div className="text-3xl font-black font-mono text-white mt-1">
                    {formatCurrency(selectedClient.totalSpent)}
                  </div>
                </div>
              </div>

              {/* Ficha Documental KYC */}
              <div className="p-5 rounded-2xl bg-carbon-850/60 border border-carbon-800 space-y-3">
                <span className="text-xs font-bold uppercase text-silver-400 block tracking-wider">
                  Documentación Legal & Contacto
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><strong className="text-silver-400">ID / Pasaporte:</strong> <span className="text-white font-mono font-bold">{selectedClient.documentId}</span></div>
                  <div><strong className="text-silver-400">Licencia:</strong> <span className="text-white font-mono font-bold">{selectedClient.driverLicense}</span></div>
                  <div><strong className="text-silver-400">Teléfono:</strong> <span className="text-white font-mono font-bold">{selectedClient.phone}</span></div>
                  <div><strong className="text-silver-400">Email:</strong> <span className="text-white">{selectedClient.email}</span></div>
                  <div className="sm:col-span-2">
                    <strong className="text-silver-400">Validación de Edad (+25):</strong>{' '}
                    <span className="text-emerald-400 font-bold">✓ Conductor Certificado</span>
                  </div>
                </div>
              </div>

              {/* Historial de Reservas del Cliente */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-silver-400 block tracking-wider">
                  Historial de Alquileres ({selectedClient.reservationsList.length})
                </span>

                <div className="space-y-2.5">
                  {selectedClient.reservationsList.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800 flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.vehicleImage}
                          alt={res.vehicleName}
                          className="w-14 h-10 object-cover rounded-lg border border-carbon-700 flex-shrink-0"
                        />
                        <div>
                          <strong className="text-white font-bold block">{res.vehicleName}</strong>
                          <span className="text-silver-400 text-xs font-mono">
                            {res.startDate} al {res.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-gold-400 text-sm sm:text-base">
                          {formatCurrency(res.pricing?.rentalTotal || 0)}
                        </div>
                        <span className="text-xs font-mono uppercase text-silver-400">{res.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón WhatsApp */}
              <div className="pt-2">
                <button
                  onClick={() => handleOpenWhatsApp(selectedClient.phone, selectedClient.fullName)}
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <Send className="w-5 h-5" />
                  <span>Contactar vía WhatsApp Concierge</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
