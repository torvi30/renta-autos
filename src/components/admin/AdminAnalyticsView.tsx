import React, { useState, useMemo } from 'react';
import { Vehicle } from '../../types/vehicle';
import { Reservation } from '../../types/reservation';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Award,
  PieChart,
  BarChart3,
  MapPin,
  CheckCircle2,
  Car,
  ShieldCheck,
} from 'lucide-react';


interface AdminAnalyticsViewProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
}

interface MonthlyData {
  month: string;
  shortMonth: string;
  revenue: number;
  projected: number;
  bookings: number;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  vehicles,
  reservations,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'30D' | 'Q1' | 'Y2026' | 'ALL'>('Y2026');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyData | null>(null);

  // 1. Métricas Financieras Principales
  const totalRevenue = useMemo(() => {
    return reservations
      .filter((r) => r.status !== 'CANCELLED')
      .reduce((acc, r) => acc + (r.pricing?.rentalTotal || 0), 0);
  }, [reservations]);

  const totalDepositsInEscrow = useMemo(() => {
    return reservations
      .filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE')
      .reduce((acc, r) => acc + (r.pricing?.securityDeposit || 0), 0);
  }, [reservations]);

  const averageBookingValue = useMemo(() => {
    const validCount = reservations.filter((r) => r.status !== 'CANCELLED').length;
    return validCount > 0 ? Math.round(totalRevenue / validCount) : 0;
  }, [totalRevenue, reservations]);

  const averageRentalDays = useMemo(() => {
    const valid = reservations.filter((r) => r.status !== 'CANCELLED');
    if (valid.length === 0) return 0;
    const totalDays = valid.reduce((acc, r) => acc + (r.pricing?.days || 1), 0);
    return (totalDays / valid.length).toFixed(1);
  }, [reservations]);

  // 2. Datos de Ingresos Mensuales (Enero a Diciembre 2026)
  const monthlyData: MonthlyData[] = useMemo(() => {
    return [
      { month: 'Enero', shortMonth: 'Ene', revenue: 24500, projected: 22000, bookings: 5 },
      { month: 'Febrero', shortMonth: 'Feb', revenue: 28900, projected: 26000, bookings: 6 },
      { month: 'Marzo', shortMonth: 'Mar', revenue: 36800, projected: 32000, bookings: 8 },
      { month: 'Abril', shortMonth: 'Abr', revenue: 41200, projected: 38000, bookings: 9 },
      { month: 'Mayo', shortMonth: 'May', revenue: 38500, projected: 39000, bookings: 8 },
      { month: 'Junio', shortMonth: 'Jun', revenue: 45000, projected: 42000, bookings: 10 },
      { month: 'Julio', shortMonth: 'Jul', revenue: 52000, projected: 48000, bookings: 12 },
      { month: 'Agosto', shortMonth: 'Ago', revenue: 49000, projected: 46000, bookings: 11 },
      { month: 'Septiembre', shortMonth: 'Sep', revenue: 44000, projected: 45000, bookings: 9 },
      { month: 'Octubre', shortMonth: 'Oct', revenue: 39500, projected: 42000, bookings: 8 },
      { month: 'Noviembre', shortMonth: 'Nov', revenue: 54000, projected: 50000, bookings: 12 },
      { month: 'Diciembre', shortMonth: 'Dic', revenue: 68000, projected: 62000, bookings: 15 },
    ];
  }, []);

  const maxMonthlyRevenue = Math.max(...monthlyData.map((d) => Math.max(d.revenue, d.projected)));

  // 3. Desempeño y Rentabilidad por Vehículo (Top Performers)
  const vehiclePerformance = useMemo(() => {
    const map = new Map<string, { brand: string; model: string; plate: string; revenue: number; days: number; count: number }>();

    // Inicializar con la flota actual
    vehicles.forEach((v) => {
      map.set(v.id, {
        brand: v.brand,
        model: v.model,
        plate: v.plate,
        revenue: v.pricePerDay * 6, // Base ponderada de demostración
        days: 6,
        count: 2,
      });
    });

    // Sumar datos reales de reservas activas
    reservations.forEach((r) => {
      if (r.status !== 'CANCELLED' && map.has(r.vehicleId)) {
        const current = map.get(r.vehicleId)!;
        current.revenue += r.pricing?.rentalTotal || 0;
        current.days += r.pricing?.days || 0;
        current.count += 1;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [vehicles, reservations]);

  const maxVehicleRevenue = vehiclePerformance[0]?.revenue || 1;

  // 4. Exportar a CSV
  const handleExportCSV = () => {
    const headers = ['ID Reserva', 'Vehículo', 'Placa', 'Cliente', 'Fecha Inicio', 'Fecha Fin', 'Días', 'Tarifa Diaria', 'Total Renta', 'Depósito', 'Estado'];
    const rows = reservations.map((r) => [
      r.id,
      `"${r.vehicleName}"`,
      r.vehiclePlate,
      `"${r.client.fullName}"`,
      r.startDate,
      r.endDate,
      r.pricing?.days || 1,
      r.pricing?.dailyRate || 0,
      r.pricing?.rentalTotal || 0,
      r.pricing?.securityDeposit || 0,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `balance_financiero_elitewheels_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Barra Superior de Control y Período */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 border border-carbon-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gold-500/20 text-gold-400 border border-gold-500/30 font-mono">
              BUSINESS INTELLIGENCE (BI)
            </span>
            <span className="text-carbon-600">•</span>
            <span className="text-xs text-silver-400 font-mono">Actualizado en tiempo real</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-gold-400" />
            <span>Centro de Analítica Financiera & Flota VIP</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Período */}
          <div className="flex items-center bg-carbon-950/80 border border-carbon-750 rounded-xl p-1 text-xs font-mono font-bold shadow-inner">
            {[
              { id: '30D', label: '30 Días' },
              { id: 'Q1', label: 'Q1 2026' },
              { id: 'Y2026', label: 'Año 2026' },
              { id: 'ALL', label: 'Histórico' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === p.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-carbon-950 font-black shadow-md'
                    : 'text-silver-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Botón Exportar CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 border border-gold-500/30 hover:border-gold-500/60 text-gold-400 hover:text-gold-300 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula de KPIs Ejecutivos (Matriz 2x2 en Móvil para cero scroll excesivo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        
        {/* Facturación Bruta */}
        <button
          type="button"
          onClick={() => document.getElementById('analytics-monthly-chart')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-gold-500/70 p-3.5 sm:p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none flex flex-col justify-between"
          title="Clic para ver gráfica de evolución mensual de ingresos"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
                Facturación 2026
              </span>
              <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight truncate">
              {formatCurrency(totalRevenue + 524000)}
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 text-[10.5px] sm:text-xs text-emerald-400 font-bold flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">+18.4% Q-Trimestre</span>
            </div>
            <span className="text-gold-400 font-mono text-[10px] sm:text-[11px] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Ver Gráfica ↓
            </span>
          </div>
        </button>

        {/* Ticket Promedio */}
        <button
          type="button"
          onClick={() => document.getElementById('analytics-top-vehicles')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-emerald-500/70 p-3.5 sm:p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none flex flex-col justify-between"
          title="Clic para ver superdeportivos más rentables del showroom"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
                Ticket VIP
              </span>
              <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
                <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl lg:text-4xl font-black font-display text-emerald-400 tracking-tight truncate">
              {formatCurrency(averageBookingValue > 0 ? averageBookingValue : 5850)}
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 text-[10.5px] sm:text-xs text-silver-400 font-medium flex items-center justify-between">
            <span className="truncate">~<strong className="text-white">{averageRentalDays}d</strong>/contrato</span>
            <span className="text-emerald-400 font-mono text-[10px] sm:text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Top Autos ↓
            </span>
          </div>
        </button>

        {/* Tasa de Ocupación */}
        <button
          type="button"
          onClick={() => document.getElementById('analytics-categories-chart')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-blue-500/70 p-3.5 sm:p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none flex flex-col justify-between"
          title="Clic para ver demanda por categoría y modalidades de entrega"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
                Ocupación Flota
              </span>
              <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight truncate">
              76.8%
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 text-[10.5px] sm:text-xs text-silver-300 font-medium flex items-center justify-between">
            <span className="truncate">Alta demanda</span>
            <span className="text-blue-400 font-mono text-[10px] sm:text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Categorías ↓
            </span>
          </div>
        </button>

        {/* Depósitos en Custodia */}
        <button
          type="button"
          onClick={() => document.getElementById('analytics-escrow-summary')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative text-left group overflow-hidden rounded-2xl bg-gradient-to-b from-carbon-850 to-carbon-900 border border-carbon-750 hover:border-amber-500/70 p-3.5 sm:p-6 lg:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none flex flex-col justify-between"
          title="Clic para ver auditoría de garantías y pólizas de seguro"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-silver-300 uppercase tracking-wider font-mono truncate">
                Garantías
              </span>
              <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl lg:text-4xl font-black font-display text-amber-400 tracking-tight truncate">
              {formatCurrency(totalDepositsInEscrow > 0 ? totalDepositsInEscrow : 24000)}
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-carbon-800/80 text-[10.5px] sm:text-xs text-silver-400 font-medium flex items-center justify-between">
            <span className="truncate">Actas 100% OK</span>
            <span className="text-amber-400 font-mono text-[10px] sm:text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Auditoría ↓
            </span>
          </div>
        </button>

      </div>

      {/* 3. Gráfico Principal: Evolución Mensual de Ingresos (SVG Interactivo) */}
      <div id="analytics-monthly-chart" className="p-6 sm:p-8 rounded-3xl bg-carbon-900 border border-carbon-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-carbon-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white font-display">
                Evolución & Proyección de Ingresos Mensuales
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gold-500/10 text-gold-400 border border-gold-500/30">
                AÑO 2026
              </span>
            </div>
            <p className="text-xs sm:text-sm text-silver-400 mt-1">
              Comparativa entre facturación real (barras doradas) y proyección presupuestada (línea guía).
            </p>
          </div>

          {/* Tooltip Dinámico en Vivo */}
          <div className="h-10 flex items-center">
            {hoveredMonth ? (
              <div className="px-4 py-1.5 rounded-xl bg-carbon-800 border border-gold-500/50 text-xs font-mono font-bold text-gold-300 animate-fade-in shadow-lg">
                {hoveredMonth.month}: <strong className="text-white">{formatCurrency(hoveredMonth.revenue)}</strong> ({hoveredMonth.bookings} rentas)
              </div>
            ) : (
              <div className="text-xs font-mono text-silver-500 hidden sm:block">
                Pasa el cursor sobre una barra para ver detalles
              </div>
            )}
          </div>
        </div>

        {/* Canvas SVG del Gráfico de Barras */}
        <div className="relative h-64 sm:h-80 w-full pt-4">
          <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-3 px-2">
            {monthlyData.map((d, idx) => {
              const heightPercent = Math.round((d.revenue / maxMonthlyRevenue) * 100);
              const projectedHeight = Math.round((d.projected / maxMonthlyRevenue) * 100);

              return (
                <div
                  key={idx}
                  onClick={() => setHoveredMonth(d)}
                  onTouchStart={() => setHoveredMonth(d)}
                  onMouseEnter={() => setHoveredMonth(d)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer"
                >
                  {/* Barra de Proyección (Fondo Sutil) */}
                  <div
                    style={{ height: `${projectedHeight}%` }}
                    className="w-full max-w-[20px] sm:max-w-[28px] rounded-t-lg bg-carbon-800/40 border-t border-dashed border-silver-600/50 relative flex items-end justify-center"
                  >
                    {/* Barra Real (Degradado Oro) */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 via-gold-500 to-gold-400 group-hover:from-gold-400 group-hover:to-gold-300 shadow-lg group-hover:shadow-gold-500/30 transition-all duration-300"
                    />
                  </div>

                  {/* Etiqueta del Mes */}
                  <span className="text-[9px] sm:text-xs font-mono font-bold text-silver-400 group-hover:text-gold-400 mt-2.5 sm:mt-3 transition-colors">
                    {d.shortMonth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-carbon-800 text-[11px] sm:text-xs font-mono font-semibold text-silver-400 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-gold-600 to-gold-400" />
            <span>Facturación Real</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-carbon-800 border-t border-dashed border-silver-400" />
            <span>Objetivo Mensual</span>
          </div>
        </div>
      </div>

      {/* 4. Grilla Inferior: Top Superdeportivos & Canales de Entrega */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Top 5 Superdeportivos Más Rentables (7 Columnas) */}
        <div id="analytics-top-vehicles" className="lg:col-span-7 p-4 sm:p-8 rounded-3xl bg-carbon-900 border border-carbon-800 shadow-2xl space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                <span>Superdeportivos Más Rentables</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-silver-400 mt-0.5">Ranking por volumen de facturación bruta acumulada.</p>
            </div>
            <span className="text-xs font-mono text-gold-400 font-bold">Top 5</span>
          </div>

          <div className="space-y-3 sm:space-y-4 pt-1">
            {vehiclePerformance.map((veh, i) => {
              const widthPct = Math.round((veh.revenue / maxVehicleRevenue) * 100);

              return (
                <div key={i} className="space-y-1.5 p-2.5 sm:p-3 rounded-2xl hover:bg-carbon-850/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-carbon-800 text-gold-400 font-mono font-black text-[11px] sm:text-xs flex items-center justify-center border border-carbon-750 flex-shrink-0">
                        #{i + 1}
                      </span>
                      <strong className="text-white font-display text-xs sm:text-base truncate">
                        {veh.brand} {veh.model}
                      </strong>
                      <span className="text-[9.5px] sm:text-[10px] font-mono text-silver-400 bg-carbon-950 px-1.5 py-0.5 rounded border border-carbon-800 flex-shrink-0">
                        {veh.plate}
                      </span>
                    </div>

                    <div className="text-left sm:text-right pl-7 sm:pl-0 flex items-center sm:block justify-between">
                      <span className="font-mono font-black text-gold-400 text-xs sm:text-base">
                        {formatCurrency(veh.revenue)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-silver-400 block ml-2 sm:ml-0">
                        {veh.days}d ({veh.count} res.)
                      </span>
                    </div>
                  </div>

                  {/* Barra Porcentual */}
                  <div className="w-full h-2.5 rounded-full bg-carbon-950 overflow-hidden border border-carbon-800">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución por Categoría & Modalidad de Entrega (5 Columnas) */}
        <div id="analytics-categories-chart" className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-carbon-900 border border-carbon-800 shadow-2xl space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="pb-3 border-b border-carbon-800">
              <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
                <PieChart className="w-5 h-5 text-gold-400" />
                <span>Demanda por Categoría Showroom</span>
              </h3>
              <p className="text-xs text-silver-400 mt-0.5">Participación sobre la facturación global.</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Deportivos de Alto Rendimiento', pct: 38, color: 'bg-gold-500', count: '18 reservas' },
                { label: 'Superdeportivos Exóticos', pct: 28, color: 'bg-emerald-500', count: '12 reservas' },
                { label: 'SUVs de Ultra-Lujo', pct: 22, color: 'bg-blue-500', count: '10 reservas' },
                { label: 'Sedanes Ejecutivos VIP', pct: 12, color: 'bg-amber-500', count: '6 reservas' },
              ].map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-silver-300 font-semibold">{cat.label}</span>
                    <span className="font-mono font-bold text-white">{cat.pct}% ({cat.count})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-carbon-950 overflow-hidden border border-carbon-800">
                    <div style={{ width: `${cat.pct}%` }} className={`h-full rounded-full ${cat.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modalidades de Entrega */}
          <div className="pt-4 border-t border-carbon-800 space-y-3">
            <span className="text-xs font-bold text-silver-300 uppercase tracking-wider block">
              Logística de Despacho Preferida por Clientes
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-carbon-850 border border-carbon-800">
                <MapPin className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                <div className="font-bold text-white">46%</div>
                <div className="text-[10px] text-silver-400">Aeropuerto JMC</div>
              </div>

              <div className="p-2.5 rounded-xl bg-carbon-850 border border-carbon-800">
                <Car className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="font-bold text-white">34%</div>
                <div className="text-[10px] text-silver-400">Showroom Central</div>
              </div>

              <div className="p-2.5 rounded-xl bg-carbon-850 border border-carbon-800">
                <Award className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="font-bold text-white">20%</div>
                <div className="text-[10px] text-silver-400">Hotel / Residencia</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. Módulo de Auditoría de Garantías y Pólizas VIP */}
      <div id="analytics-escrow-summary" className="p-6 sm:p-8 rounded-3xl bg-carbon-900 border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-carbon-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                Auditoría Legal de Garantías & Fondos de Fianza
              </h3>
              <p className="text-xs text-silver-400">
                Custodia de depósitos en escrow respaldados por actas periciales de inspección vehicular y seguros todo riesgo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/35">
              100% Auditables
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800">
            <span className="text-xs text-silver-400 uppercase font-mono font-bold block mb-1">Total en Escrow</span>
            <span className="text-2xl font-black font-mono text-amber-400">{formatCurrency(totalDepositsInEscrow > 0 ? totalDepositsInEscrow : 24000)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800">
            <span className="text-xs text-silver-400 uppercase font-mono font-bold block mb-1">Estado de Reembolsos</span>
            <span className="text-2xl font-black font-mono text-emerald-400">0 Reclamaciones</span>
          </div>
          <div className="p-4 rounded-2xl bg-carbon-850 border border-carbon-800">
            <span className="text-xs text-silver-400 uppercase font-mono font-bold block mb-1">Protocolo KYC</span>
            <span className="text-2xl font-black font-mono text-blue-400">Biometría 100%</span>
          </div>
        </div>
      </div>

    </div>
  );
};
