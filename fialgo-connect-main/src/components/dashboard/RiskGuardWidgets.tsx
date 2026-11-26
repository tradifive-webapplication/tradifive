import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Crosshair,
  Layers,
  LayoutGrid,
  TrendingDown,
  X,
} from "lucide-react";
import { Gauge } from "@/components/ui/charts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export type RiskWidgetId =
  | "max_lot"
  | "no_avg"
  | "martingale"
  | "one_instrument";

const VALID_WIDGET_IDS = new Set<RiskWidgetId>([
  "max_lot",
  "no_avg",
  "martingale",
  "one_instrument",
]);

export const RISK_WIDGET_CATALOG: {
  id: RiskWidgetId;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "max_lot",
    title: "Max Lot Guard",
    subtitle: "72-notch dial: open vs locked lots",
  },
  {
    id: "no_avg",
    title: "No Averaging Down",
    subtitle: "Linear gauge: losing-position add guard",
  },
  {
    id: "martingale",
    title: "Martingale Protection",
    subtitle: "72-notch dial: post-loss lot cap scale",
  },
  {
    id: "one_instrument",
    title: "One Instrument Focus",
    subtitle: "Linear gauge: single-ticker focus score",
  },
];

const STORAGE_KEY = "tradifive_dashboard_risk_widgets";
const EVENTS = ["tradifive:risk-widgets-changed", "fialgo_config_changed", "storage"] as const;

export function getPinnedRiskWidgets(): RiskWidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return ["max_lot"];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is RiskWidgetId => VALID_WIDGET_IDS.has(id))
      : ["max_lot"];
  } catch {
    return ["max_lot"];
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

export const DashboardWidgetsPicker: React.FC = () => {
  const [pinned, setPinned] = useState<RiskWidgetId[]>(() => getPinnedRiskWidgets());

  useEffect(() => {
    const refresh = () => setPinned(getPinnedRiskWidgets());
    EVENTS.forEach((evt) => window.addEventListener(evt, refresh));
    return () => {
      EVENTS.forEach((evt) => window.removeEventListener(evt, refresh));
    };
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="tactile-white-pill rounded-full px-3 py-1 text-[11.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          title="Manage Risk Guard widgets on Dashboard"
        >
          <LayoutGrid size={12} className="text-blue-600 dark:text-blue-400" />
          <span>Widgets</span>
          {pinned.length > 0 && (
            <span className="px-1.5 py-[0.5px] rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
              {pinned.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[276px] p-3 rounded-2xl border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#17171A] shadow-xl"
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <span className="text-[12px] font-bold text-slate-900 dark:text-white">
            Risk Guard Widgets
          </span>
          <Link
            to="/risk-guard"
            className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Configure
          </Link>
        </div>

        <div className="space-y-1.5 max-h-[280px] overflow-y-auto amazing-scrollbar pr-0.5">
          {RISK_WIDGET_CATALOG.map((item) => {
            const checked = pinned.includes(item.id);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50/80 dark:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-slate-800 dark:text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                    {item.subtitle}
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={checked}
                  onChange={() => {
                    togglePinRiskWidget(item.id);
                    setPinned(getPinnedRiskWidgets());
                  }}
                />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

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

  const widgetData = useMemo(() => {
    const isIndian = activeMarket === "indian";
    const unit = isIndian ? "Qty" : "Lots";

    let savedCfg: any = {};
    try {
      savedCfg = JSON.parse(localStorage.getItem("fialgo_risk_config") || "{}");
    } catch {
      savedCfg = {};
    }

    const useDemo = !isConnected && demoMode;

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

    // 1. Max Lot
    const dbCap = Number(riskConfig?.max_lot_size ?? 0);
    const localCap = Number(savedCfg?.maxLot ?? 0);
    const maxLotActive =
      savedCfg?.maxLotActive !== undefined ? Boolean(savedCfg.maxLotActive) : dbCap > 0;
    const maxLotCap =
      dbCap > 0 ? dbCap : localCap > 0 ? localCap : isIndian ? 50 : 1.0;

    const openLots = useDemo
      ? isIndian
        ? Math.max(0, Math.round(storedDemoLots * 100))
        : Number(storedDemoLots.toFixed(2))
      : Number(liveOpenSum.toFixed(isIndian ? 0 : 2));

    const remainingLots = Math.max(0, Number((maxLotCap - openLots).toFixed(isIndian ? 0 : 2)));
    const exceededBy = Math.max(0, Number((openLots - maxLotCap).toFixed(isIndian ? 0 : 2)));
    const lotPct =
      maxLotCap > 0 ? Math.min(100, Math.max(0, Math.round((openLots / maxLotCap) * 100))) : 0;
    const lotBreached = openLots > maxLotCap;
    const lotWarning = !lotBreached && lotPct >= 70;
    const lotGrad =
      lotBreached || lotPct >= 95
        ? ["#FB7185", "#E11D48", "#BE123C"]
        : lotWarning
        ? ["#FBBF24", "#F59E0B", "#D97706"]
        : ["#60A5FA", "#2563EB", "#0031F2"];
    const fmtLot = (v: number) => (isIndian ? String(Math.round(v)) : v.toFixed(2));

    // 2. No Averaging Down
    const noAvgActive = Boolean(savedCfg?.noAveragingDown);
    const losingOpen = useDemo
      ? 1
      : livePositions.filter((p: any) => Number(p.profit ?? 0) < 0).length;
    const noAvgScore = losingOpen > 0 && useDemo ? 85 : losingOpen > 1 ? 65 : 100;

    // 3. Martingale Protection
    const martingaleActive = Boolean(savedCfg?.martingaleDetection);
    const multiplier = Number(savedCfg?.martingaleMultiplier || 1.5);
    const closedTrades = (recentTrades || []).filter((t: any) => t.closed_at);
    const lastLossTrade = closedTrades.find((t: any) => Number(t.profit ?? 0) < 0);
    const lastLossLot = useDemo
      ? 0.4
      : Number(lastLossTrade?.lot_size ?? lastLossTrade?.volume ?? 0.2);
    const allowedNextLot = Number((lastLossLot * multiplier).toFixed(2));
    const currentNextLot = useDemo ? 0.35 : Number(liveOpenSum.toFixed(2));
    const martingalePct =
      allowedNextLot > 0
        ? Math.min(100, Math.round((currentNextLot / allowedNextLot) * 100))
        : 0;
    const martingaleGrad =
      martingalePct >= 95
        ? ["#FB7185", "#E11D48", "#BE123C"]
        : martingalePct >= 70
        ? ["#FBBF24", "#F59E0B", "#D97706"]
        : ["#60A5FA", "#2563EB", "#0031F2"];

    // 4. One Instrument Mode
    const oneInstrActive = Boolean(savedCfg?.oneInstrumentMode);
    const allowedTicker = String(savedCfg?.allowedTicker || (isIndian ? "NIFTY50" : "XAUUSD"));
    const allTrades = (recentTrades || []) as any[];
    const onTickerCount = useDemo
      ? 4
      : allTrades.filter((t) =>
          String(t.symbol || "").toUpperCase().includes(allowedTicker.toUpperCase())
        ).length;
    const offTickerCount = useDemo ? 0 : Math.max(0, allTrades.length - onTickerCount);
    const instrPct = useDemo
      ? 100
      : allTrades.length > 0
      ? Math.round((onTickerCount / allTrades.length) * 100)
      : 100;

    return {
      isIndian,
      unit,
      useDemo,
      maxLot: {
        active: maxLotActive,
        cap: maxLotCap,
        openLots,
        remainingLots,
        exceededBy,
        pct: lotPct,
        breached: lotBreached,
        warning: lotWarning,
        grad: lotGrad,
        fmtLot,
      },
      noAvg: {
        active: noAvgActive,
        losingOpen,
        score: noAvgScore,
      },
      martingale: {
        active: martingaleActive,
        multiplier,
        lastLossLot,
        allowedNextLot,
        currentNextLot,
        pct: martingalePct,
        grad: martingaleGrad,
      },
      oneInstr: {
        active: oneInstrActive,
        allowedTicker,
        onTickerCount,
        offTickerCount,
        pct: instrPct,
      },
    };
  }, [activeMarket, isConnected, demoMode, riskConfig, recentTrades, accountMetrics]);

  if (pinned.length === 0) return null;

  const WidgetHeader = ({
    id,
    icon: Icon,
    title,
    badge,
    badgeTone = "neutral",
  }: {
    id: RiskWidgetId;
    icon: React.ElementType;
    title: string;
    badge: string;
    badgeTone?: "emerald" | "rose" | "amber" | "neutral";
  }) => {
    const toneClass =
      badgeTone === "rose"
        ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
        : badgeTone === "emerald"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
        : badgeTone === "amber"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-neutral-400";

    return (
      <div className="flex items-center justify-between gap-2 mb-2">
        <Link
          to="/risk-guard"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 truncate"
        >
          <Icon size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{title}</span>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${toneClass}`}>
            {badge}
          </span>
          <button
            type="button"
            onClick={() => togglePinRiskWidget(id)}
            className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
            title="Remove widget from Dashboard"
          >
            <X size={11.5} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {pinned.includes("max_lot") && (
        <div className={`${cardClass} p-3.5`}>
          <WidgetHeader
            id="max_lot"
            icon={Layers}
            title={widgetData.isIndian ? "Max Qty Guard" : "Max Lot Guard"}
            badge={
              widgetData.maxLot.breached
                ? "Breached"
                : widgetData.maxLot.active
                ? "Active"
                : "Off"
            }
            badgeTone={
              widgetData.maxLot.breached
                ? "rose"
                : widgetData.maxLot.active
                ? "emerald"
                : "neutral"
            }
          />
          <div className="flex items-center gap-2.5">
            <div className="w-[126px] shrink-0 flex justify-center">
              <Gauge
                compact
                ariaLabel="Dashboard Max Lot Exposure Gauge"
                value={widgetData.maxLot.pct}
                centerValue={widgetData.maxLot.pct}
                defaultLabel={`${widgetData.maxLot.fmtLot(widgetData.maxLot.openLots)} / ${widgetData.maxLot.fmtLot(widgetData.maxLot.cap)} ${widgetData.unit}`}
                suffix="%"
                needle="line"
                ruler
                totalNotches={72}
                spacing={40}
                notchLengthPercent={34}
                notchCornerRadius={2}
                startAngle={148}
                endAngle={392}
                enterTransition={{ type: "spring", visualDuration: 1.4, bounce: 0 }}
                enterStaggerScale={2}
                inactiveFillOpacity={0.4}
                useGradient
                gradientColors={widgetData.maxLot.grad}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">Lock</span>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {widgetData.maxLot.fmtLot(widgetData.maxLot.cap)} {widgetData.unit}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500 inline-flex items-center gap-1">
                  <span>Open</span>
                  <span
                    className={`px-1 rounded text-[8px] font-bold uppercase ${
                      widgetData.useDemo
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    {widgetData.useDemo ? "Demo" : "Live"}
                  </span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {widgetData.maxLot.fmtLot(widgetData.maxLot.openLots)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">
                  {widgetData.maxLot.breached ? "Over" : "Left"}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    widgetData.maxLot.breached
                      ? "text-rose-600 dark:text-rose-400"
                      : widgetData.maxLot.warning
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {widgetData.maxLot.breached
                    ? `+${widgetData.maxLot.fmtLot(widgetData.maxLot.exceededBy)}`
                    : `${widgetData.maxLot.fmtLot(widgetData.maxLot.remainingLots)} ${widgetData.unit}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {pinned.includes("no_avg") && (
        <div className={`${cardClass} p-3.5`}>
          <WidgetHeader
            id="no_avg"
            icon={TrendingDown}
            title="No Averaging Down"
            badge={widgetData.noAvg.active ? "Active" : "Off"}
            badgeTone={widgetData.noAvg.active ? "emerald" : "neutral"}
          />
          <Gauge
            orientation="linear"
            ariaLabel="No Averaging Down Compliance"
            value={widgetData.noAvg.score}
            centerValue={widgetData.noAvg.score}
            defaultLabel={`${widgetData.noAvg.losingOpen} losing open · 0 adds blocked`}
            suffix="% clean"
            labelPlacement="top"
            labelAlign="start"
            totalNotches={36}
            linearHeight={14}
            spacing={2}
            notchCornerRadius={3}
            inactiveFillOpacity={0.35}
            useGradient
            gradientColors={["#34D399", "#10B981", "#059669"]}
          />
        </div>
      )}

      {pinned.includes("martingale") && (
        <div className={`${cardClass} p-3.5`}>
          <WidgetHeader
            id="martingale"
            icon={AlertTriangle}
            title="Martingale Guard"
            badge={widgetData.martingale.active ? `${widgetData.martingale.multiplier.toFixed(1)}×` : "Off"}
            badgeTone={widgetData.martingale.active ? "amber" : "neutral"}
          />
          <div className="flex items-center gap-2.5">
            <div className="w-[126px] shrink-0 flex justify-center">
              <Gauge
                compact
                ariaLabel="Martingale Scale Cap Gauge"
                value={widgetData.martingale.pct}
                centerValue={widgetData.martingale.pct}
                defaultLabel={`${widgetData.martingale.currentNextLot.toFixed(2)} / ${widgetData.martingale.allowedNextLot.toFixed(2)}`}
                suffix="%"
                needle="line"
                ruler
                totalNotches={72}
                spacing={40}
                notchLengthPercent={34}
                notchCornerRadius={2}
                startAngle={148}
                endAngle={392}
                enterTransition={{ type: "spring", visualDuration: 1.4, bounce: 0 }}
                enterStaggerScale={2}
                inactiveFillOpacity={0.4}
                useGradient
                gradientColors={widgetData.martingale.grad}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">Scale</span>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {widgetData.martingale.multiplier.toFixed(1)}× max
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">Last Loss</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {widgetData.martingale.lastLossLot.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-400 dark:text-neutral-500">Next Cap</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {widgetData.martingale.allowedNextLot.toFixed(2)} Lots
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {pinned.includes("one_instrument") && (
        <div className={`${cardClass} p-3.5`}>
          <WidgetHeader
            id="one_instrument"
            icon={Crosshair}
            title={`Focus: ${widgetData.oneInstr.allowedTicker}`}
            badge={widgetData.oneInstr.active ? "Locked" : "Off"}
            badgeTone={widgetData.oneInstr.active ? "emerald" : "neutral"}
          />
          <Gauge
            orientation="linear"
            ariaLabel="One Instrument Focus Score"
            value={widgetData.oneInstr.pct}
            centerValue={widgetData.oneInstr.pct}
            defaultLabel={`${widgetData.oneInstr.onTickerCount} on-pair · ${widgetData.oneInstr.offTickerCount} off-pair`}
            suffix="% focus"
            labelPlacement="top"
            labelAlign="start"
            totalNotches={36}
            linearHeight={14}
            spacing={2}
            notchCornerRadius={3}
            inactiveFillOpacity={0.35}
            useGradient
            gradientColors={["#60A5FA", "#2563EB", "#0031F2"]}
          />
        </div>
      )}
    </div>
  );
};
