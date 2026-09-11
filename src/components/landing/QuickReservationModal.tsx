import React from 'react';
import { Vehicle } from '../../types/vehicle';
import { BookingFlowModal } from '../booking/BookingFlowModal';

export interface QuickReservationModalProps {
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

/**
 * QuickReservationModal unificado con BookingFlowModal para cumplir con
 * la Regla 14 (validación estricta de disponibilidad) y la Regla 30 (resumen oficial WhatsApp).
 */
export const QuickReservationModal: React.FC<QuickReservationModalProps> = (props) => {
  return <BookingFlowModal {...props} />;
};
