import { useState, useEffect, useCallback } from "react";
import {
  TradingThemeId,
  TradingThemeConfig,
  getTradingTheme,
  getStoredTradingTheme,
  setTradingTheme,
  THEMES,
} from "@/utils/tradingTheme";

export function useTradingTheme() {
  const [themeId, setThemeIdState] = useState<TradingThemeId>(() => getStoredTradingTheme());

  useEffect(() => {
    const handleUpdate = () => {
      setThemeIdState(getStoredTradingTheme());
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("tradifive_pnl_theme_changed", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("tradifive_pnl_theme_changed", handleUpdate);
    };
  }, []);

  const changeTheme = useCallback((newTheme: TradingThemeId) => {
    setTradingTheme(newTheme);
    setThemeIdState(newTheme);
  }, []);

  const config: TradingThemeConfig = getTradingTheme(themeId);

  return {
    themeId,
    config,
    changeTheme,
    THEMES,
  };
}
