export type TradingThemeId = "classic" | "monochrome" | "blue";

export interface TradingThemeConfig {
  id: TradingThemeId;
  label: string;
  subLabel: string;
  badge?: string;
  previewProfit: string;
  previewLoss: string;
  // Profit styling
  profitHex: string;
  profitHexDark: string;
  profitText: string;
  profitBg: string;
  profitBorder: string;
  profitBadge: string;
  // Loss styling
  lossHex: string;
  lossHexDark: string;
  lossText: string;
  lossBg: string;
  lossBorder: string;
  lossBadge: string;
}

export const THEMES: Record<TradingThemeId, TradingThemeConfig> = {
  classic: {
    id: "classic",
    label: "Classic Green & Red",
    subLabel: "Traditional trading floor standard. Vibrant emerald for wins, crimson for losses.",
    badge: "Recommended",
    previewProfit: "+$3,155",
    previewLoss: "-$420",
    profitHex: "#10B981",
    profitHexDark: "#34D399",
    profitText: "text-emerald-600 dark:text-emerald-400",
    profitBg: "bg-emerald-50 dark:bg-emerald-500/15",
    profitBorder: "border-emerald-200/80 dark:border-emerald-500/30",
    profitBadge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30",
    lossHex: "#EF4444",
    lossHexDark: "#F87171",
    lossText: "text-rose-600 dark:text-rose-400",
    lossBg: "bg-rose-50 dark:bg-rose-500/15",
    lossBorder: "border-rose-200/80 dark:border-rose-500/30",
    lossBadge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/30",
  },
  monochrome: {
    id: "monochrome",
    label: "Monochrome Black & White",
    subLabel: "Institutional minimal aesthetic. Deep black / pure white for profit, muted slate for loss.",
    previewProfit: "+$3,155",
    previewLoss: "-$420",
    profitHex: "#0F172A",
    profitHexDark: "#FFFFFF",
    profitText: "text-slate-900 dark:text-white",
    profitBg: "bg-slate-100 dark:bg-white/10",
    profitBorder: "border-slate-300 dark:border-white/20",
    profitBadge: "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-800 dark:border-white",
    lossHex: "#64748B",
    lossHexDark: "#A1A1AA",
    lossText: "text-slate-500 dark:text-neutral-400",
    lossBg: "bg-slate-50 dark:bg-white/5",
    lossBorder: "border-slate-200 dark:border-white/10",
    lossBadge: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-neutral-300 border border-slate-200 dark:border-white/10",
  },
  blue: {
    id: "blue",
    label: "Modern Electric Blue & Red",
    subLabel: "Modern FinTech style. High-contrast electric blue for profit, rose red for loss.",
    previewProfit: "+$3,155",
    previewLoss: "-$420",
    profitHex: "#2563EB",
    profitHexDark: "#60A5FA",
    profitText: "text-[#2563EB] dark:text-blue-400",
    profitBg: "bg-blue-50 dark:bg-blue-500/15",
    profitBorder: "border-blue-200/80 dark:border-blue-500/30",
    profitBadge: "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30",
    lossHex: "#EF4444",
    lossHexDark: "#F87171",
    lossText: "text-rose-600 dark:text-rose-400",
    lossBg: "bg-rose-50 dark:bg-rose-500/15",
    lossBorder: "border-rose-200/80 dark:border-rose-500/30",
    lossBadge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/30",
  },
};

export const DEFAULT_TRADING_THEME: TradingThemeId = "classic";

export function getStoredTradingTheme(): TradingThemeId {
  if (typeof window === "undefined") return DEFAULT_TRADING_THEME;
  try {
    const stored = localStorage.getItem("tradifive_pnl_theme") as TradingThemeId;
    if (stored && THEMES[stored]) return stored;
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_TRADING_THEME;
}

export function setTradingTheme(id: TradingThemeId) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("tradifive_pnl_theme", id);
      window.dispatchEvent(new Event("tradifive_pnl_theme_changed"));
    } catch {
      // ignore
    }
  }
}

export function getTradingTheme(id?: string): TradingThemeConfig {
  const key = (id && id in THEMES ? id : getStoredTradingTheme()) as TradingThemeId;
  return THEMES[key] || THEMES.classic;
}

export function getPnlTextColor(pnl: number, themeId?: TradingThemeId): string {
  const cfg = getTradingTheme(themeId);
  return pnl < 0 ? cfg.lossText : cfg.profitText;
}

export function getPnlHexColor(pnl: number, isDark: boolean, themeId?: TradingThemeId): string {
  const cfg = getTradingTheme(themeId);
  if (pnl < 0) {
    return isDark ? cfg.lossHexDark : cfg.lossHex;
  }
  return isDark ? cfg.profitHexDark : cfg.profitHex;
}

export function getChartStrokeColor(finalProfit: number, isDark: boolean, themeId?: TradingThemeId): string {
  return getPnlHexColor(finalProfit, isDark, themeId);
}
