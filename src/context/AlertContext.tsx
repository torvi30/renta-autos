import React, { createContext, useContext, useState, useCallback } from 'react';
import { LuxuryAlertModal, LuxuryAlertOptions } from '../components/common/LuxuryAlertModal';

interface AlertContextValue {
  showAlert: (options: LuxuryAlertOptions) => Promise<boolean>;
  showConfirm: (options: LuxuryAlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

// Global event trigger allowing luxuryAlert invocation from any context
type AlertResolver = (value: boolean) => void;

let globalAlertTrigger: ((options: LuxuryAlertOptions) => Promise<boolean>) | null = null;

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<LuxuryAlertOptions | null>(null);
  const [resolver, setResolver] = useState<AlertResolver | null>(null);

  const showAlert = useCallback((options: LuxuryAlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setCurrentOptions(options);
      setIsOpen(true);
      setResolver(() => resolve);
    });
  }, []);

  const showConfirm = useCallback((options: LuxuryAlertOptions): Promise<boolean> => {
    return showAlert({
      type: options.type || 'warning',
      showCancelButton: true,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      ...options,
    });
  }, [showAlert]);

  // Set global trigger for static luxuryAlert utility
  React.useEffect(() => {
    globalAlertTrigger = showAlert;
    return () => {
      globalAlertTrigger = null;
    };
  }, [showAlert]);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <LuxuryAlertModal
        isOpen={isOpen}
        options={currentOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

/**
 * Global luxuryAlert modal utility (SweetAlert / Swal style)
 */
export const luxuryAlert = {
  fire: (options: LuxuryAlertOptions): Promise<boolean> => {
    if (globalAlertTrigger) {
      return globalAlertTrigger(options);
    }
    // Fallback if provider is not mounted
    const confirmed = window.confirm(`${options.title}\n\n${options.message || ''}`);
    return Promise.resolve(confirmed);
  },

  success: (options: LuxuryAlertOptions | string, message?: string): Promise<boolean> => {
    const opts: LuxuryAlertOptions = typeof options === 'string'
      ? { type: 'success', title: options, message }
      : { type: 'success', ...options };
    return luxuryAlert.fire(opts);
  },

  warning: (options: LuxuryAlertOptions | string, message?: string): Promise<boolean> => {
    const opts: LuxuryAlertOptions = typeof options === 'string'
      ? { type: 'warning', title: options, message }
      : { type: 'warning', ...options };
    return luxuryAlert.fire(opts);
  },

  confirm: (options: LuxuryAlertOptions | string, message?: string): Promise<boolean> => {
    const opts: LuxuryAlertOptions = typeof options === 'string'
      ? { 
          type: 'warning', 
          title: options, 
          message, 
          showCancelButton: true,
          confirmText: 'Confirmar',
          cancelText: 'Cancelar' 
        }
      : { 
          type: 'warning', 
          showCancelButton: true, 
          confirmText: 'Confirmar',
          cancelText: 'Cancelar', 
          ...options 
        };
    return luxuryAlert.fire(opts);
  },

  error: (options: LuxuryAlertOptions | string, message?: string): Promise<boolean> => {
    const opts: LuxuryAlertOptions = typeof options === 'string'
      ? { type: 'error', title: options, message }
      : { type: 'error', ...options };
    return luxuryAlert.fire(opts);
  },

  info: (options: LuxuryAlertOptions | string, message?: string): Promise<boolean> => {
    const opts: LuxuryAlertOptions = typeof options === 'string'
      ? { type: 'info', title: options, message }
      : { type: 'info', ...options };
    return luxuryAlert.fire(opts);
  },
};
