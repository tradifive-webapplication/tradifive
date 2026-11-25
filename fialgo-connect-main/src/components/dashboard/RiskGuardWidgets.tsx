import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, X } from "lucide-react";
import { Gauge } from "@/components/ui/charts";

export type RiskWidgetId = "max_lot";

const STORAGE_KEY = "tradifive_dashboard_risk_widgets";
const EVENTS = ["tradifive:risk-widgets-changed", "fialgo_config_changed", "storage"] as const;

export function getPinnedRiskWidgets(): RiskWidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function togglePinRiskWidget(id: RiskWidgetId): boolean {
  const current = getPinnedRiskWidgets();
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [...current, id];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("tradifive:risk-widgets-changed"));
  } catch {
    /* ignore storage errors */
  }
  return !exists;
}

interface DashboardPinnedRiskWidgetsProps {
  activeMarket: string;
  isConnected: boolean;
  demoMode: boolean;
  riskConfig: any;
  recentTrades: any[];
  accountMetrics: any;
  cardClass: string;
}

export const DashboardPinnedRiskWidgets: React.FC<DashboardPinnedRiskWidgetsProps> = ({
  activeMarket,
  isConnected,
  demoMode,
  riskConfig,
  recentTrades,
  accountMetrics,
  cardClass,
}) => {
  const [pinned, setPinned] = useState<RiskWidgetId[]>(() => getPinnedRiskWidgets());
  const [, setSyncTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setPinned(getPinnedRiskWidgets());
      setSyncTick((t) => t + 1);
    };
    EVENTS.forEach((evt) => window.addEventListener(evt, refresh));
    return () => {
      EVENTS.forEach((evt) => window.removeEventListener(evt, refresh));
    };
  }, []);

  const maxLotState = useMemo(() => {
    const isIndian = activeMarket === "indian";
    const unit = isIndian ? "Qty" : "Lots";

    let savedCfg: any = {};
    try {
      savedCfg = JSON.parse(localStorage.getItem("fialgo_risk_config") || "{}");
    } catch {
      savedCfg = {};
    }

    const dbCap = Number(riskConfig?.max_lot_size ?? 0);
    const localCap = Number(savedCfg?.maxLot ?? 0);
    const active =
      savedCfg?.maxLotActive !== undefined ? Boolean(savedCfg.maxLotActive) : dbCap > 0;
    const cap =
      dbCap > 0 ? dbCap : localCap > 0 ? localCap : isIndian ? 50 : 1.0;

    const accountOpen = Array.isArray(accountMetrics?.open_positions)
      ? accountMetrics.open_positions
      : [];
    const tradesOpen = (recentTrades || []).filter(
      (t: any) => !t.closed_at && !t.is_pending
    );
    const livePositions = accountOpen.length > 0 ? accountOpen : tradesOpen;
    const liveOpenSum = livePositions.reduce(
      (sum: number, p: any) => sum + Number(p.lot ?? p.lot_size ?? p.volume ?? 0),
      0
    );

    let storedDemoLots = 0.65;
    try {
      const rawDemo = Number(localStorage.getItem("fialgo_demo_open_lots"));
      if (Number.isFinite(rawDemo) && rawDemo >= 0) storedDemoLots = rawDemo;
    } catch {
      /* ignore */
    }

    const useDemo = !isConnected && demoMode;
    const openLots = useDemo
      ? isIndian
        ? Math.max(0, Math.round(storedDemoLots * 100))
        : Number(storedDemoLots.toFixed(2))
      : Number(liveOpenSum.toFixed(isIndian ? 0 : 2));

    const remainingLots = Math.max(0, Number((cap - openLots).toFixed(isIndian ? 0 : 2)));
    const exceededBy = Math.max(0, Number((openLots - cap).toFixed(isIndian ? 0 : 2)));
    const pct = cap > 0 ? Math.min(100, Math.max(0, Math.round((openLots / cap) * 100))) : 0;
    const isBreached = openLots > cap;
    const isWarning = !isBreached && pct >= 70;
    const gradientColors =
      isBreached || pct >= 95
        ? ["#FB7185", "#E11D48", "#BE123C"]
        : isWarning
        ? ["#FBBF24", "#F59E0B", "#D97706"]
        : ["#60A5FA", "#2563EB", "#0031F2"];

    const fmt = (v: number) => (isIndian ? String(Math.round(v)) : v.toFixed(2));

    return {
      isIndian,
      unit,
      active,
      cap,
      openLots,
      remainingLots,
      exceededBy,
      pct,
      isBreached,
      isWarning,
      useDemo,
      gradientColors,
      fmt,
    };
  }, [activeMarket, isConnected, demoMode, riskConfig, recentTrades, accountMetrics]);

  if (pinned.length === 0) return null;

  return (
    <div className="space-y-3">
      {pinned.includes("max_lot") && (
        <div className={`${cardClass} p-3.5`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Link
              to="/risk-guard"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 truncate"
            >
              <Layers size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">
                {maxLotState.isIndian ? "Max Qty Guard" : "Max Lot Guard"}
              </span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  maxLotState.isBreached
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                    : maxLotState.active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-neutral-400"
                }`}
              >
                {maxLotState.isBreached ? "Breached" : maxLotState.active ? "Active" : "Off"}
              </span>
              <button
                type="button"
                onClick={() => togglePinRiskWidget("max_lot")}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
                title="Remove widget from Dashboard"
              >
                <X size={11.5} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-[126px] shrink-0 flex justify-center">
              <Gauge
                compact
                ariaLabel="Dashboard Max Lot Exposure Gauge"
                value={maxLotState.pct}
                suffix="%"
                defaultLabel={`${maxLotState.fmt(maxLotState.openLots)} / ${maxLotState.fmt(maxLotState.cap)} ${maxLotState.unit}`}
                startAngle={135}
                endAngle={405}
                ruler
                needle="gradient"
                inactiveFillOpacity={0.42}
                useGradient
                gradientColors={maxLotState.gradientColors}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">Lock</span>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {maxLotState.fmt(maxLotState.cap)} {maxLotState.unit}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500 inline-flex items-center gap-1">
                  <span>Open</span>
                  <span
                    className={`px-1 rounded text-[8px] font-bold uppercase ${
                      maxLotState.useDemo
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    {maxLotState.useDemo ? "Demo" : "Live"}
                  </span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {maxLotState.fmt(maxLotState.openLots)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">
                  {maxLotState.isBreached ? "Over" : "Left"}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    maxLotState.isBreached
                      ? "text-rose-600 dark:text-rose-400"
                      : maxLotState.isWarning
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {maxLotState.isBreached
                    ? `+${maxLotState.fmt(maxLotState.exceededBy)}`
                    : `${maxLotState.fmt(maxLotState.remainingLots)} ${maxLotState.unit}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
