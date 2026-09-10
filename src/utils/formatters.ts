import { VehicleCategory, VehicleStatus } from '../types/vehicle';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCategoryLabel = (category: VehicleCategory): string => {
  switch (category) {
    case 'DEPORTIVO':
      return 'Deportivo';
    case 'SUV_LUJO':
      return 'SUV de Lujo';
    case 'SEDAN_EJECUTIVO':
      return 'Sedán Ejecutivo';
    case 'EXOTICO':
      return 'Superdeportivo / Exótico';
    case 'CONVERTIBLE':
      return 'Convertible';
    default:
      return category;
  }
};

export const getStatusConfig = (status: VehicleStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: 'Disponible',
        dotClass: 'bg-emerald-500',
        badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
        icon: '🟢',
      };
    case 'RENTED':
      return {
        label: 'Alquilado',
        dotClass: 'bg-blue-500',
        badgeClass: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
        icon: '🔵',
      };
    case 'MAINTENANCE':
      return {
        label: 'Mantenimiento',
        dotClass: 'bg-amber-500',
        badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
        icon: '🟠',
      };
    case 'INACTIVE':
      return {
        label: 'No disponible',
        dotClass: 'bg-gray-500',
        badgeClass: 'text-gray-400 bg-gray-900/60 border-gray-700/40',
        icon: '⚫',
      };
  }
};

/**
 * Regla 30: Preparar botón "RESERVAR POR WHATSAPP"
 * Genera el enlace con el mensaje preformateado con vehículo, fechas y cliente.
 * No se envía de forma automática; requiere click explícito del usuario.
 */
export const generateWhatsAppLink = ({
  phone = '1234567890',
  vehicleName,
  startDate,
  endDate,
  clientName,
}: {
  phone?: string;
  vehicleName?: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
}): string => {
  let message = `Hola, quiero consultar la disponibilidad para reservar un vehículo con Premium Car Rental.\n`;
  if (vehicleName) message += `\n🚗 *Vehículo:* ${vehicleName}`;
  if (startDate) message += `\n📅 *Fecha de Inicio:* ${startDate}`;
  if (endDate) message += `\n📅 *Fecha de Fin:* ${endDate}`;
  if (clientName) message += `\n👤 *Cliente:* ${clientName}`;
  message += `\n\n¿Me pueden brindar más información y confirmar disponibilidad?`;

  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
};
