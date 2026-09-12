import React from 'react';
import { Reservation } from '../../types/reservation';
import { Vehicle } from '../../types/vehicle';
import {
  X,
  Printer,
  FileCheck,
  Shield,
  Car,
  QrCode,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AdminContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  vehicle?: Vehicle | null;
}

export const AdminContractModal: React.FC<AdminContractModalProps> = ({
  isOpen,
  onClose,
  reservation,
  vehicle: _vehicle,
}) => {

  if (!isOpen || !reservation) return null;

  const contractNumber = `CTR-2026-${reservation.id.replace(/^RES-/, '')}`;
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-carbon-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static print:inset-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none print:bg-white">
        
        {/* Cabecera Interactiva del Modal (Oculta en Impresión) */}
        <div className="flex items-center justify-between p-5 border-b border-carbon-800 bg-carbon-850 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center border border-gold-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gold-400 font-mono font-bold tracking-wider uppercase">
                DOCUMENTO LEGAL OFICIAL
              </div>
              <h2 className="text-lg font-black text-white font-display">
                Contrato de Arrendamiento & Voucher Ejecutivo
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 text-xs font-black shadow-lg transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-carbon-800 text-silver-400 hover:text-white hover:bg-carbon-750 transition-colors border border-carbon-700"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CUERPO DEL CONTRATO (FORMATO IMPRIMIBLE / PDF)            */}
        {/* ======================================================== */}
        <div
          id="printable-contract"
          className="overflow-y-auto p-6 sm:p-10 text-silver-200 bg-carbon-900 font-sans space-y-6 print:overflow-visible print:p-8 print:bg-white print:text-black print:space-y-4"
        >
          {/* Membrete Corporativo */}
          <div className="border-b-2 border-gold-500/60 pb-6 print:border-black print:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-6 h-6 text-gold-400 print:text-black" />
                <span className="text-xl sm:text-2xl font-black text-white print:text-black font-display tracking-tight">
                  ELITE WHEELS SHOWROOM
                </span>
              </div>
              <p className="text-xs text-silver-400 print:text-gray-600 font-medium">
                Alquiler de Superdeportivos & Flota de Ultra-Lujo • Medellín VIP Concierge
              </p>
              <p className="text-[11px] text-silver-500 print:text-gray-500 font-mono">
                Carrera 43A #1-50, El Poblado • NIT: 901.884.210-9 • concierge@elitewheels.com
              </p>
            </div>

            <div className="sm:text-right bg-carbon-850 print:bg-gray-100 p-3.5 rounded-2xl border border-carbon-750 print:border-gray-300">
              <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400 print:text-black font-bold block">
                CONTRATO DE ARRENDAMIENTO
              </span>
              <div className="text-lg font-black font-mono text-white print:text-black">
                {contractNumber}
              </div>
              <div className="text-xs text-silver-400 print:text-gray-600">
                Reserva Ref: <span className="font-mono font-bold text-silver-200 print:text-black">{reservation.id}</span>
              </div>
              <div className="text-[11px] text-silver-500 print:text-gray-500 mt-1">
                Fecha Emisión: {currentDate}
              </div>
            </div>
          </div>

          {/* Sección 1: Las Partes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 print:bg-transparent print:border print:border-gray-300 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gold-400 print:text-black flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              1. Identificación de las Partes Contratantes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-silver-400 print:text-gray-500">
                  Arrendador (La Empresa)
                </span>
                <div className="font-bold text-white print:text-black">
                  ELITE WHEELS S.A.S.
                </div>
                <div className="text-silver-300 print:text-gray-700">
                  Representante Legal: <strong>Víctor Tamayo</strong> (Director General)
                </div>
                <div className="text-silver-400 print:text-gray-600 font-mono">
                  NIT: 901.884.210-9 • Tel: +57 (300) 911-LUX
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-carbon-800 print:border-gray-300 sm:pl-4 pt-2 sm:pt-0">
                <span className="text-[10px] uppercase font-bold text-silver-400 print:text-gray-500">
                  Arrendatario (Conductor Titular VIP)
                </span>
                <div className="font-bold text-white print:text-black text-sm">
                  {reservation.client.fullName}
                </div>
                <div className="text-silver-300 print:text-gray-700">
                  Doc / Pasaporte: <strong className="font-mono">{reservation.client.documentId || 'VERIFICADO KYC'}</strong>
                </div>
                <div className="text-silver-300 print:text-gray-700">
                  Licencia Conducción: <strong className="font-mono">{reservation.client.driverLicense || 'VERIFICADA OFICIAL'}</strong>
                </div>
                <div className="text-silver-400 print:text-gray-600 font-mono">
                  Tel: {reservation.client.phone} • Email: {reservation.client.email}
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Vehículo y Fechas */}
          <div className="p-4 sm:p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 print:bg-transparent print:border print:border-gray-300 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gold-400 print:text-black flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              2. Ficha del Vehículo & Cronograma de Renta
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase font-semibold block">Vehículo</span>
                <span className="font-bold text-white print:text-black text-sm block">{reservation.vehicleName}</span>
                <span className="text-[10px] font-mono text-gold-400 print:text-gray-600">Matrícula: {reservation.vehiclePlate}</span>
              </div>

              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase font-semibold block">Entrega (Check-in)</span>
                <span className="font-bold text-white print:text-black block">{reservation.startDate}</span>
                <span className="text-[10px] font-mono text-silver-400 print:text-gray-600">Hora: {reservation.pickupTime || '10:00 AM'}</span>
              </div>

              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase font-semibold block">Devolución (Check-out)</span>
                <span className="font-bold text-white print:text-black block">{reservation.endDate}</span>
                <span className="text-[10px] font-mono text-silver-400 print:text-gray-600">Hora: {reservation.returnTime || '06:00 PM'}</span>
              </div>

              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase font-semibold block">Modalidad Entrega</span>
                <span className="font-bold text-gold-400 print:text-black block">
                  {reservation.deliveryLocation === 'SHOWROOM'
                    ? 'Showroom Central El Poblado'
                    : reservation.deliveryLocation === 'AIRPORT'
                    ? 'Aeropuerto JMC (VIP Meet & Greet)'
                    : 'Hotel o Residencia Privada'}
                </span>
                <span className="text-[10px] text-silver-400 print:text-gray-600">{reservation.pricing?.days || 1} días contratados</span>
              </div>
            </div>
          </div>

          {/* Sección 3: Liquidación Financiera */}
          <div className="p-4 sm:p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 print:bg-transparent print:border print:border-gray-300 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gold-400 print:text-black flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              3. Liquidación Económica & Custodia de Garantía
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase block">Tarifa Diaria</span>
                <span className="text-base font-black font-mono text-white print:text-black">
                  {formatCurrency(reservation.pricing?.dailyRate || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase block">Total Renta</span>
                <span className="text-base font-black font-mono text-gold-400 print:text-black">
                  {formatCurrency(reservation.pricing?.rentalTotal || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase block">Depósito en Garantía</span>
                <span className="text-base font-black font-mono text-emerald-400 print:text-black">
                  {formatCurrency(reservation.pricing?.securityDeposit || 0)}
                </span>
                <span className="text-[9px] text-silver-400 print:text-gray-500 block">Reembolsable 100%</span>
              </div>

              <div className="p-3 rounded-xl bg-carbon-900 print:bg-gray-50 border border-carbon-800 print:border-gray-200">
                <span className="text-[10px] text-silver-400 print:text-gray-500 uppercase block">Cobertura Todo Riesgo</span>
                <span className="text-xs font-bold text-white print:text-black block mt-1">Incluida ($0 Deducible)</span>
                <span className="text-[9px] text-emerald-400 print:text-gray-600 block">Póliza Flota Premium</span>
              </div>
            </div>
          </div>

          {/* Sección 4: Cláusulas Esenciales */}
          <div className="p-4 sm:p-5 rounded-2xl bg-carbon-850/80 border border-carbon-800 print:bg-transparent print:border print:border-gray-300 space-y-2 text-[11px] text-silver-300 print:text-gray-700 leading-relaxed">
            <h3 className="text-xs font-black uppercase tracking-wider text-gold-400 print:text-black flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4" />
              4. Cláusulas y Términos de Servicio VIP
            </h3>
            <p>
              <strong>PRIMERA. DESTINACIÓN EXCLUSIVA:</strong> El vehículo se arrienda exclusivamente para uso turístico o corporativo en vías pavimentadas. Queda estrictamente prohibida la conducción en pistas de carreras sin autorización previa, piques ilegales o cesión a terceros no autorizados en este contrato.
            </p>
            <p>
              <strong>SEGUNDA. KILOMETRAJE Y COMBUSTIBLE:</strong> Se estipula un límite de conducción de 200 km por día de renta acumulables. El kilómetro adicional se liquidará a razón de $3 USD/km. El vehículo se entrega con el 100% de combustible (Gasolina Extra 98 Octanos) y debe restituirse en idéntico nivel.
            </p>
            <p>
              <strong>TERCERA. RETORNO DEL DEPÓSITO DE GARANTÍA:</strong> El depósito de garantía será liberado en su totalidad en un plazo no mayor a 48 horas hábiles posteriores a la firma del Acta de Inspección Final (Check-out), una vez verificado el perfecto estado de carrocería, llantas y habitáculo.
            </p>
          </div>

          {/* Sección 5: Firmas Formales & Código QR */}
          <div className="pt-4 border-t-2 border-carbon-800 print:border-black grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Firma Arrendador */}
            <div className="md:col-span-5 text-center space-y-2">
              <div className="h-16 flex items-end justify-center">
                <div className="font-serif italic text-base sm:text-lg text-gold-400 print:text-black font-bold border-b border-silver-400 print:border-black w-3/4 pb-1">
                  Víctor Tamayo
                </div>
              </div>
              <div className="text-xs font-bold text-white print:text-black">
                VÍCTOR TAMAYO
              </div>
              <div className="text-[10px] text-silver-400 print:text-gray-600">
                Director General • Elite Wheels Showroom
              </div>
            </div>

            {/* Código QR de Autenticación */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-2 bg-carbon-850 print:bg-white rounded-xl border border-carbon-750 print:border-gray-300">
              <QrCode className="w-12 h-12 text-gold-400 print:text-black" />
              <span className="text-[8px] font-mono text-silver-400 print:text-gray-500 mt-1 uppercase text-center">
                Autenticación QR
              </span>
            </div>

            {/* Firma Arrendatario */}
            <div className="md:col-span-5 text-center space-y-2">
              <div className="h-16 flex items-end justify-center">
                <div className="border-b border-silver-400 print:border-black w-3/4 pb-1 text-xs text-silver-500 print:text-gray-400">
                  (Firma Digital o Manuscrita)
                </div>
              </div>
              <div className="text-xs font-bold text-white print:text-black uppercase">
                {reservation.client.fullName}
              </div>
              <div className="text-[10px] text-silver-400 print:text-gray-600">
                Arrendatario / Conductor Principal Titular
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
