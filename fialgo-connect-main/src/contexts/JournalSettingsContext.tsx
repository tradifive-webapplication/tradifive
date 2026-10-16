import React, { createContext, useContext, useState, useEffect } from "react";
import { useMarket } from "@/contexts/MarketContext";

export type CurrencyCode = "USD" | "INR" | "EUR" | "JPY" | "AED";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // conversion rate from USD
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rate: 1 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rate: 95.20 },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.92 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", rate: 157.8 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", rate: 3.67 },
];

interface JournalSettingsContextType {
  currency: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
  hideOnlyBalance: boolean;
  setHideOnlyBalance: (v: boolean) => void;
  percentageOnly: boolean;
  setPercentageOnly: (v: boolean) => void;
  formatMoney: (usdAmount: number, opts?: { showSign?: boolean, raw?: boolean }) => string;
  isSettingsLoading: boolean;
}

const STORAGE_KEY = "fialgo_journal_settings";

const JournalSettingsContext = createContext<JournalSettingsContextType | null>(null);

export function JournalSettingsProvider({ children }: { children: React.ReactNode }) {
  // Load persisted settings
  const loadSettings = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
  };

  const saved = loadSettings();

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(saved.currency || "USD");
  const [hideBalance, setHideBalance] = useState<boolean>(saved.hideBalance !== undefined ? saved.hideBalance : false);
  const [hideOnlyBalance, setHideOnlyBalance] = useState<boolean>(saved.hideOnlyBalance !== undefined ? saved.hideOnlyBalance : false);
  const [percentageOnly, setPercentageOnly] = useState<boolean>(saved.percentageOnly !== undefined ? saved.percentageOnly : false);

  const { activeMarket } = useMarket();
  const resolvedCurrencyCode = activeMarket === 'indian' ? 'INR' : currencyCode;

  const currency = CURRENCIES.find(c => c.code === resolvedCurrencyCode) || CURRENCIES[0];

  const effectivePercentageOnly = percentageOnly;

  // Persist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currency: currencyCode,
      hideBalance,
      hideOnlyBalance,
      percentageOnly,
    }));
  }, [currencyCode, hideBalance, hideOnlyBalance, percentageOnly]);

  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  const triggerLoading = () => {
    setIsSettingsLoading(true);
    setIsSettingsLoading(false);
  };

  const handleSetCurrency = (code: CurrencyCode) => {
    triggerLoading();
    setCurrencyCode(code);
  };

  const handleSetHideBalance = (v: boolean) => {
    triggerLoading();
    setHideBalance(v);
  };

  const handleSetHideOnlyBalance = (v: boolean) => {
    triggerLoading();
    setHideOnlyBalance(v);
  };

  const handleSetPercentageOnly = (v: boolean) => {
    triggerLoading();
    setPercentageOnly(v);
  };

  const formatMoney = (usdAmount: number, opts?: { showSign?: boolean, raw?: boolean }) => {
    if ((hideBalance || effectivePercentageOnly) && !opts?.raw) return "•••••••";
    
    const converted = usdAmount * currency.rate;
    const absVal = Math.abs(converted);
    const sign = opts?.showSign ? (converted >= 0 ? "+" : "-") : (converted < 0 ? "-" : "");
    
    // For JPY, no decimals
    const decimals = currency.code === "JPY" ? 0 : 2;
    const locale = currency.code === 'INR' ? 'en-IN' : 'en-US';
    const formatted = absVal.toLocaleString(locale, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
    
    return `${sign}${currency.symbol}${formatted}`;
  };

  return (
    <JournalSettingsContext.Provider value={{
      currency,
      setCurrency: handleSetCurrency,
      hideBalance,
      setHideBalance: handleSetHideBalance,
      hideOnlyBalance,
      setHideOnlyBalance: handleSetHideOnlyBalance,
      percentageOnly: effectivePercentageOnly,
      setPercentageOnly: handleSetPercentageOnly,
      formatMoney,
      isSettingsLoading,
    }}>
      {children}
    </JournalSettingsContext.Provider>
  );
}

export function useJournalSettings() {
  const ctx = useContext(JournalSettingsContext);
  if (!ctx) throw new Error("useJournalSettings must be used inside JournalSettingsProvider");
  return ctx;
}
