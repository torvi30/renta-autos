import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanySettings } from '../types/settings';
import {
  getLocalCompanySettings,
  updateCompanySettings,
  subscribeCompanySettings,
} from '../services/settingsService';

interface SettingsContextType {
  settings: CompanySettings;
  updateSettings: (newSettings: CompanySettings) => Promise<CompanySettings>;
  isSaving: boolean;
  getWhatsAppLink: (params?: {
    vehicleName?: string;
    startDate?: string;
    endDate?: string;
    clientName?: string;
  }) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings>(getLocalCompanySettings());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeCompanySettings((cloudSettings) => {
      setSettings(cloudSettings);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateSettings = async (newSettings: CompanySettings): Promise<CompanySettings> => {
    setIsSaving(true);
    try {
      const saved = await updateCompanySettings(newSettings);
      setSettings(saved);
      return saved;
    } finally {
      setIsSaving(false);
    }
  };

  const getWhatsAppLink = ({
    vehicleName,
    startDate,
    endDate,
    clientName,
  }: {
    vehicleName?: string;
    startDate?: string;
    endDate?: string;
    clientName?: string;
  } = {}): string => {
    const rawPhone = settings.whatsappPhone || '573009115898';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    let message = `Hola, quiero consultar la disponibilidad para reservar un vehículo con ${settings.companyName}.\n`;
    if (vehicleName) message += `\n🚗 *Vehículo:* ${vehicleName}`;
    if (startDate) message += `\n📅 *Fecha de Inicio:* ${startDate}`;
    if (endDate) message += `\n📅 *Fecha de Fin:* ${endDate}`;
    if (clientName) message += `\n👤 *Cliente:* ${clientName}`;
    message += `\n\n¿Me pueden brindar más información y confirmar disponibilidad?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings: handleUpdateSettings,
        isSaving,
        getWhatsAppLink,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
