import React from 'react';
import { VehicleStatus } from '../../types/vehicle';
import { getStatusConfig } from '../../utils/formatters';

interface BadgeProps {
  status: VehicleStatus;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider rounded-full border backdrop-blur-md transition-colors ${config.badgeClass} ${className}`}
      role="status"
      aria-label={`Estado: ${config.label}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass} animate-pulse-subtle`} />
      <span>{config.label}</span>
    </span>
  );
};
