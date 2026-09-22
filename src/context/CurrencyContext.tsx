import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSettings } from './SettingsContext';

export type CurrencyCode = 'USD' | 'EUR' | 'COP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rateAgainstUSD: number; // 1 USD = X Currency
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD ($)',
    flag: '🇺🇸',
    rateAgainstUSD: 1,
    decimals: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€)',
    flag: '🇪🇺',
    rateAgainstUSD: 0.92,
    decimals: 0,
  },
  COP: {
    code: 'COP',
    symbol: '$',
    label: 'COP ($)',
    flag: '🇨🇴',
    rateAgainstUSD: 4150,
    decimals: 0,
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  config: CurrencyConfig;
  convertPrice: (amountInUSD: number) => number;
  formatPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'elite_wheels_selected_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  // Calculate dynamic configurations based on rates saved in company settings
  const dynamicConfigs: Record<CurrencyCode, CurrencyConfig> = useMemo(() => {
    const copRate = Number(settings?.rates?.usdToCop) || 4150;
    const eurRate = Number(settings?.rates?.usdToEur) || 0.92;

    return {
      USD: {
        ...CURRENCY_CONFIGS.USD,
      },
      EUR: {
        ...CURRENCY_CONFIGS.EUR,
        rateAgainstUSD: eurRate,
      },
      COP: {
        ...CURRENCY_CONFIGS.COP,
        rateAgainstUSD: copRate,
      },
    };
  }, [settings?.rates]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as CurrencyCode;
      if (saved && dynamicConfigs[saved]) {
        setCurrencyState(saved);
      }
    } catch (e) {
      console.warn('Error reading saved currency:', e);
    }
  }, [dynamicConfigs]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, newCurrency);
    } catch (e) {
      console.warn('Error saving currency preference:', e);
    }
  };

  const config = dynamicConfigs[currency] || dynamicConfigs.USD;

  const convertPrice = (amountInUSD: number): number => {
    return Math.round(amountInUSD * config.rateAgainstUSD);
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertPrice(amountInUSD);
    const locale = currency === 'COP' ? 'es-CO' : currency === 'EUR' ? 'de-DE' : 'en-US';

    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: config.decimals,
    }).format(converted);

    return formatted;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        config,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
