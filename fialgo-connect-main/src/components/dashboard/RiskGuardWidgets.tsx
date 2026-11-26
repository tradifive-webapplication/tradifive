import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Crosshair,
  GripVertical,
  Layers,
  LayoutGrid,
  Lock,
  Move,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Target,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { useSortable, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Gauge } from "@/components/ui/charts";
import { TradeSlotsBlobStrip } from "@/components/ui/TradeSlotBlobCheckbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export type RiskWidgetId =
  | "max_lot"
  | "no_avg"
  | "martingale"
  | "one_instrument"
  | "drawdown"
  | "profit_target"
  | "equity_floor"
  | "trade_limit"
  | "loss_cooldown"
  | "session";

const VALID_WIDGET_IDS = new Set<RiskWidgetId>([
  "max_lot",
  "no_avg",
  "martingale",
  "one_instrument",
  "drawdown",
  "profit_target",
  "equity_floor",
  "trade_limit",
  "loss_cooldown",
  "session",
]);

export const RISK_WIDGET_CATALOG: {
  id: RiskWidgetId;
  group: "Trading Control" | "Risk Management" | "Behaviour & Discipline";
  title: string;
  subtitle: string;
}[] = [
  {
    id: "max_lot",
    group: "Trading Control",
    title: "Max Lot Guard",
    subtitle: "72-notch dial: open vs locked lots",
  },
  {
    id: "no_avg",
    group: "Trading Control",
    title: "No Averaging Down",
    subtitle: "Linear gauge: losing-position add guard",
  },
  {
    id: "martingale",
    group: "Trading Control",
    title: "Post-Loss Lot Cap",
    subtitle: "Step flow + bar: limit size after a loss",
  },
  {
    id: "one_instrument",
    group: "Trading Control",
    title: "One Instrument Focus",
    subtitle: "Pair split bar: active vs other pairs",
  },
  {
    id: "drawdown",
    group: "Risk Management",
    title: "Drawdown Guard",
    subtitle: "72-notch dial: worst drawdown vs cap",
  },
  {
    id: "profit_target",
    group: "Risk Management",
    title: "Daily Profit Goal",
    subtitle: "Emerald milestone bar: today's gain vs goal",
  },
  {
    id: "equity_floor",
    group: "Risk Management",
    title: "Account Equity Floor",
    subtitle: "Safety buffer: live equity vs hard stop",
  },
  {
    id: "trade_limit",
    group: "Behaviour & Discipline",
    title: "Daily Trade Limit",
    subtitle: "Linear bar: executed orders vs daily cap",
  },
  {
    id: "loss_cooldown",
    group: "Behaviour & Discipline",
    title: "Loss Cooldown Shield",
    subtitle: "Recovery wait timer after losing trades",
  },
  {
    id: "session",
    group: "Behaviour & Discipline",
    title: "Session Sentinel",
    subtitle: "Opening & closing windows strip",
  },
];

export type DashboardWidgetZone =
  | "top_strip"
  | "mid_band"
  | "col_left"
  | "col_mid"
  | "col_right";

export const DASHBOARD_WIDGET_ZONES: {
  id: DashboardWidgetZone;
  label: string;
  shortLabel: string;
}[] = [
  { id: "top_strip", label: "Top Row", shortLabel: "Top" },
  { id: "mid_band", label: "Middle Row", shortLabel: "Mid" },
  { id: "col_left", label: "Bottom Left", shortLabel: "Left" },
  { id: "col_mid", label: "Bottom Center", shortLabel: "Center" },
  { id: "col_right", label: "Bottom Right", shortLabel: "Right" },
];

const VALID_ZONES = new Set<DashboardWidgetZone>([
  "top_strip",
  "mid_band",
  "col_left",
  "col_mid",
  "col_right",
]);

const STORAGE_KEY = "tradifive_dashboard_risk_widgets";
const ZONES_STORAGE_KEY = "tradifive_dashboard_risk_widget_zones";
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

export function getRiskWidgetZones(): Record<string, DashboardWidgetZone> {
  try {
    const raw = localStorage.getItem(ZONES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const clean: Record<string, DashboardWidgetZone> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (VALID_WIDGET_IDS.has(k as RiskWidgetId) && VALID_ZONES.has(v as DashboardWidgetZone)) {
        clean[k] = v as DashboardWidgetZone;
      }
    });
    return clean;
  } catch {
    return {};
  }
}

export function setRiskWidgetZone(id: RiskWidgetId, zone: DashboardWidgetZone) {
  const current = getRiskWidgetZones();
  const next = { ...current, [id]: zone };
  try {
    localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("tradifive:risk-widgets-changed"));
  } catch {
    /* ignore storage errors */
  }
}

export function reorderPinnedRiskWidgets(nextOrder: RiskWidgetId[]) {
  const clean = nextOrder.filter((id) => VALID_WIDGET_IDS.has(id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent("tradifive:risk-widgets-changed"));
  } catch {
    /* ignore storage errors */
  }
}

export const RISK_WIDGET_LABELS: Record<RiskWidgetId, string> = RISK_WIDGET_CATALOG.reduce(
  (acc, item) => {
    acc[item.id] = item.title;
    return acc;
  },
  {} as Record<RiskWidgetId, string>
);

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

export function useDashboardRiskWidgetState() {
  const [pinned, setPinned] = useState<RiskWidgetId[]>(() => getPinnedRiskWidgets());
  const [zones, setZones] = useState<Record<string, DashboardWidgetZone>>(() =>
    getRiskWidgetZones()
  );

  useEffect(() => {
    const refresh = () => {
      setPinned(getPinnedRiskWidgets());
      setZones(getRiskWidgetZones());
    };
    EVENTS.forEach((evt) => window.addEventListener(evt, refresh));
    return () => {
      EVENTS.forEach((evt) => window.removeEventListener(evt, refresh));
    };
  }, []);

  return { pinned, zones };
}

interface DashboardWidgetsPickerProps {
  locked?: boolean;
  placeMode?: boolean;
  onTogglePlaceMode?: () => void;
}

export const DashboardWidgetsPicker: React.FC<DashboardWidgetsPickerProps> = ({
  locked = false,
  placeMode = false,
  onTogglePlaceMode,
}) => {
  const { pinned, zones } = useDashboardRiskWidgetState();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full tactile-white-pill text-[12.5px] font-semibold cursor-pointer select-none ${
            placeMode && !locked ? "tactile-pill-active" : ""
          }`}
          title={
            locked
              ? "Dashboard Widgets (Pro & Elite)"
              : "Add and place widgets anywhere on Dashboard"
          }
        >
          {locked ? (
            <Lock size={12.5} className="text-amber-500 shrink-0" />
          ) : (
            <LayoutGrid size={13.5} className="text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <span>Widgets</span>
          {locked ? (
            <span className="px-1.5 py-[0.5px] rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 uppercase tracking-wide">
              Pro
            </span>
          ) : (
            pinned.length > 0 && (
              <span className="px-1.5 py-[0.5px] rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                {pinned.length}
              </span>
            )
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[310px] p-3 rounded-2xl border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#17171A] shadow-xl z-50"
      >
        {locked ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/25">
              <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Lock size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-snug">
                  Widgets Locked on Standard
                </p>
                <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Add live Risk Guard widgets and drag/place them anywhere on your Dashboard with Pro or Elite.
                </p>
              </div>
            </div>

            <div className="space-y-1 opacity-60 pointer-events-none select-none">
              {RISK_WIDGET_CATALOG.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]"
                >
                  <span className="text-[11px] font-medium text-slate-600 dark:text-neutral-300 truncate">
                    {item.title}
                  </span>
                  <Lock size={11} className="text-slate-400 shrink-0" />
                </div>
              ))}
            </div>

            <Link
              to="/upgrade"
              onClick={() => setOpen(false)}
              className="w-full h-9 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Lock size={12} />
              <span>Unlock with Pro &amp; Elite</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-white/[0.06] gap-2">
              <span className="text-[12px] font-bold text-slate-900 dark:text-white">
                Dashboard Widgets
              </span>
              <div className="flex items-center gap-1.5">
                {onTogglePlaceMode && (
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePlaceMode();
                      setOpen(false);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                      placeMode
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 border-slate-200/80 dark:border-white/10 hover:border-blue-300"
                    }`}
                    title="Show drop zones across Dashboard to place widgets anywhere"
                  >
                    <Move size={10} />
                    <span>{placeMode ? "Placing" : "Place on Page"}</span>
                  </button>
                )}
                <Link
                  to="/risk-guard"
                  onClick={() => setOpen(false)}
                  className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Rules
                </Link>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mb-2 px-0.5">
              Toggle widgets on, choose a Dashboard section below, or drag any widget directly onto a slot.
            </p>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto amazing-scrollbar pr-0.5">
              {(["Trading Control", "Risk Management", "Behaviour & Discipline"] as const).map(
                (groupName) => (
                  <div key={groupName} className="space-y-1.5">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-1 pt-0.5">
                      {groupName}
                    </p>
                    {RISK_WIDGET_CATALOG.filter((item) => item.group === groupName).map(
                      (item) => {
                        const checked = pinned.includes(item.id);
                        const currentZone = zones[item.id] || "col_right";
                        return (
                          <div
                            key={item.id}
                            className="p-2 rounded-xl bg-slate-50/85 dark:bg-white/[0.04] space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2.5">
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
                                onChange={() => togglePinRiskWidget(item.id)}
                              />
                            </div>

                            {checked && (
                              <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60 dark:border-white/[0.06] flex-wrap">
                                <span className="text-[9px] font-semibold text-slate-400 mr-0.5">
                                  Place:
                                </span>
                                {DASHBOARD_WIDGET_ZONES.map((z) => (
                                  <button
                                    key={z.id}
                                    type="button"
                                    onClick={() => setRiskWidgetZone(item.id, z.id)}
                                    className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold transition-colors cursor-pointer ${
                                      currentZone === z.id
                                        ? "bg-[#2563EB] text-white"
                                        : "bg-white dark:bg-[#1C1C20] text-slate-500 dark:text-neutral-400 border border-slate-200/70 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                  >
                                    {z.shortLabel}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )
              )}
            </div>
          </>
        )}
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
  locked?: boolean;
  zone?: DashboardWidgetZone;
  gridClassName?: string;
  isEditMode?: boolean;
}

const SortableWidgetShell: React.FC<{
  id: RiskWidgetId;
  cardClass: string;
  isEditMode?: boolean;
  children: React.ReactNode;
}> = ({ id, cardClass, isEditMode = false, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: "relative",
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${cardClass} p-3.5 relative transition-shadow ${
        isEditMode
          ? "ring-2 ring-[#2563EB]/45 ring-offset-2 dark:ring-offset-[#141416] cursor-grab active:cursor-grabbing"
          : "cursor-grab active:cursor-grabbing hover:border-blue-200/80 dark:hover:border-blue-500/30"
      }`}
    >
      {isEditMode && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1 px-2.5 py-0.5 bg-white dark:bg-[#242428] text-slate-900 dark:text-white rounded-full text-[9.5px] font-semibold shadow-sm border border-[#2563EB]/30 whitespace-nowrap pointer-events-none">
          <GripVertical size={10} className="text-[#2563EB]" />
          <span>{RISK_WIDGET_LABELS[id]}</span>
        </div>
      )}
      {children}
    </div>
  );
};

export const DashboardPinnedRiskWidgets: React.FC<DashboardPinnedRiskWidgetsProps> = ({
  activeMarket,
  isConnected,
  demoMode,
  riskConfig,
  recentTrades,
  accountMetrics,
  cardClass,
  locked = false,
  zone,
  gridClassName = "space-y-3",
  isEditMode = false,
}) => {
  const { pinned, zones } = useDashboardRiskWidgetState();
  const [, setSyncTick] = useState(0);

  useEffect(() => {
    const refresh = () => setSyncTick((t) => t + 1);
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
    const extraAdds = useDemo
      ? 0
      : (() => {
          const grouped = new Map<string, number[]>();
          livePositions.forEach((p: any) => {
            const symKey = String(p.symbol || "").toUpperCase();
            const dirKey = String(p.trade_type ?? p.type ?? "");
            const k = `${symKey}:${dirKey}`;
            const list = grouped.get(k) || [];
            list.push(Number(p.profit ?? 0));
            grouped.set(k, list);
          });
          let adds = 0;
          grouped.forEach((profits) => {
            if (profits.length > 1 && profits.some((pr) => pr < 0)) {
              adds += profits.length - 1;
            }
          });
          return adds;
        })();
    const noAvgScore = extraAdds === 0 ? 100 : Math.max(20, 100 - extraAdds * 30);

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
    const allowedTicker = String(savedCfg?.allowedTicker || (isIndian ? "NIFTY50" : "XAUUSD")).toUpperCase();
    const allTrades = (recentTrades || []) as any[];
    const symCounts = new Map<string, number>();
    if (useDemo) {
      symCounts.set(allowedTicker, 4);
      symCounts.set(allowedTicker === "EURUSD" ? "GBPUSD" : "EURUSD", 1);
    } else {
      allTrades.forEach((t) => {
        const s = String(t.symbol || "").trim().toUpperCase();
        if (s) symCounts.set(s, (symCounts.get(s) || 0) + 1);
      });
    }
    const totalInstrTrades = Array.from(symCounts.values()).reduce((a, b) => a + b, 0);
    const onTickerCount = Array.from(symCounts.entries()).reduce(
      (acc, [s, c]) => (s.includes(allowedTicker) ? acc + c : acc),
      0
    );
    const offTickerCount = Math.max(0, totalInstrTrades - onTickerCount);
    const instrPct =
      totalInstrTrades > 0 ? Math.round((onTickerCount / totalInstrTrades) * 100) : 100;
    const pairSegments = Array.from(symCounts.entries())
      .map(([symbol, count]) => ({
        symbol,
        count,
        pct: totalInstrTrades > 0 ? Math.round((count / totalInstrTrades) * 100) : 0,
        isAllowed: symbol.includes(allowedTicker),
      }))
      .sort((a, b) => Number(b.isAllowed) - Number(a.isAllowed))
      .slice(0, 3);

    // 5. Drawdown Guard (Daily / Weekly / Monthly)
    const drawdownActive = Boolean(savedCfg?.drawdownGuardActive);
    const activePeriod: "daily" | "weekly" | "monthly" =
      savedCfg?.ddPeriod === "weekly" || savedCfg?.ddPeriod === "monthly"
        ? savedCfg.ddPeriod
        : "daily";
    const ddCapPct =
      activePeriod === "weekly"
        ? Math.max(0.5, Number(savedCfg?.weeklyDrawdown ?? 10))
        : activePeriod === "monthly"
        ? Math.max(0.5, Number(savedCfg?.monthlyDrawdown ?? 20))
        : Math.max(0.5, Number(riskConfig?.max_daily_loss_percent || savedCfg?.maxDrawdown || 5));

    let demoDd = activePeriod === "weekly" ? 6.2 : activePeriod === "monthly" ? 11.4 : 2.8;
    try {
      const savedPeriods = JSON.parse(localStorage.getItem("fialgo_demo_dd_periods") || "null");
      if (savedPeriods && Number.isFinite(Number(savedPeriods[activePeriod]))) {
        demoDd = Number(savedPeriods[activePeriod]);
      } else {
        const savedDd = Number(localStorage.getItem("fialgo_demo_drawdown_pct"));
        if (activePeriod === "daily" && Number.isFinite(savedDd) && savedDd >= 0) demoDd = savedDd;
      }
    } catch {
      /* ignore */
    }
    const nowDt = new Date();
    const startToday = new Date(nowDt.getFullYear(), nowDt.getMonth(), nowDt.getDate());
    const dow = (nowDt.getDay() + 6) % 7;
    const startWeek = new Date(nowDt.getFullYear(), nowDt.getMonth(), nowDt.getDate() - dow);
    const startMonth = new Date(nowDt.getFullYear(), nowDt.getMonth(), 1);
    const periodStart =
      activePeriod === "weekly" ? startWeek : activePeriod === "monthly" ? startMonth : startToday;

    const periodClosed = allTrades
      .filter((t) => t.closed_at && new Date(t.closed_at) >= periodStart)
      .sort(
        (a, b) =>
          new Date(a.closed_at || a.created_at).getTime() -
          new Date(b.closed_at || b.created_at).getTime()
      );
    const periodRealized = periodClosed.reduce((s, t) => s + Number(t.profit ?? 0), 0);
    const floatPnl =
      Number(accountMetrics?.equity || 0) > 0 && Number(accountMetrics?.balance || 0) > 0
        ? Number(accountMetrics.equity) - Number(accountMetrics.balance)
        : livePositions.reduce((s: number, p: any) => s + Number(p.profit ?? 0), 0);
    let runPnl = 0;
    let worstPnl = Math.min(0, periodRealized + floatPnl, floatPnl);
    periodClosed.forEach((t) => {
      runPnl += Number(t.profit ?? 0);
      if (runPnl < worstPnl) worstPnl = runPnl;
    });
    const baseCap = useDemo
      ? isIndian
        ? 100000
        : 10000
      : Math.max(100, Number(accountMetrics?.balance || 10000) - periodRealized);
    const ddPeakPct = useDemo
      ? Number(demoDd.toFixed(1))
      : Number(((Math.max(0, -worstPnl) / baseCap) * 100).toFixed(2));
    const ddGaugePct = Math.min(100, Math.round((ddPeakPct / ddCapPct) * 100));
    const ddBreached = ddPeakPct >= ddCapPct;
    const ddGrad =
      ddBreached || ddGaugePct >= 95
        ? ["#FB7185", "#E11D48", "#BE123C"]
        : ddGaugePct >= 70
        ? ["#FBBF24", "#F59E0B", "#D97706"]
        : ["#60A5FA", "#2563EB", "#0031F2"];

    const sym = isIndian ? "₹" : "$";
    // 6. Daily Profit Target
    const profitActive = Boolean(savedCfg?.dailyProfitTargetActive);
    const profitGoal = Math.max(isIndian ? 500 : 10, Number(savedCfg?.dailyProfitTarget ?? (isIndian ? 5000 : 500)));
    let demoProfit = 320;
    try {
      const savedP = Number(localStorage.getItem("fialgo_demo_profit_today"));
      if (Number.isFinite(savedP) && savedP >= 0) demoProfit = savedP;
    } catch {
      /* ignore */
    }
    const todayOnlyClosed = allTrades
      .filter((t) => t.closed_at && new Date(t.closed_at) >= startToday)
      .reduce((s, t) => s + Number(t.profit ?? 0), 0);
    const profitToday = useDemo
      ? isIndian
        ? Math.round(demoProfit * 10)
        : Math.round(demoProfit)
      : Number(
          (savedCfg?.profitTargetCalc === "equity"
            ? todayOnlyClosed + floatPnl
            : todayOnlyClosed
          ).toFixed(0)
        );
    const profitPct = Math.min(100, Math.max(0, Math.round((Math.max(0, profitToday) / profitGoal) * 100)));

    // 7. Equity Hard Stop
    const eqActive = Boolean(savedCfg?.equityHardStopActive);
    const eqFloor = Math.max(0, Number(savedCfg?.equityHardStop ?? 1000));
    const liveEq = useDemo
      ? isIndian
        ? 100000
        : 10000
      : Math.max(0, Math.round(Number(accountMetrics?.equity || accountMetrics?.balance || 10000)));
    const eqBufferPct =
      liveEq > 0 ? Math.min(100, Math.max(0, Math.round(((liveEq - eqFloor) / liveEq) * 100))) : 100;

    // 8. Daily Trade Limit
    const tradeLimitActive = Boolean(savedCfg?.disciplineActive);
    const tradeCap = Math.max(1, Number(riskConfig?.max_open_trades || savedCfg?.tradeLimit || 3));
    let demoTrades = 2;
    try {
      const savedT = Number(localStorage.getItem("fialgo_demo_trades_today"));
      if (Number.isFinite(savedT) && savedT >= 0) demoTrades = savedT;
    } catch {
      /* ignore */
    }
    const todayTradesUsed = useDemo
      ? demoTrades
      : allTrades.filter((t) => new Date(t.closed_at || t.created_at) >= startToday).length;
    const tradeLimitPct = Math.min(100, Math.round((todayTradesUsed / tradeCap) * 100));

    // 9. Loss Cooldown
    const cooldownOn = Boolean(savedCfg?.revengeGuard);
    const cooldownMins = Math.max(5, Number(savedCfg?.waitPeriod || 15));
    let cooldownRunning = false;
    try {
      const cd = JSON.parse(localStorage.getItem("fialgo_cooldown") || "null");
      cooldownRunning = Boolean(cd?.active && cd?.endsAt > Date.now());
    } catch {
      /* ignore */
    }

    // 10. Session Sentinel
    const sessionOn = Boolean(savedCfg?.sessionActive);
    const validMarketKeys = isIndian
      ? ["PreMarket", "Morning", "Afternoon", "PostMarket"]
      : ["London", "Sydney", "NY", "Asian"];
    const defaultSessionTimes: Record<string, { start: string; end: string }> = {
      London: { start: "13:30", end: "22:00" },
      Sydney: { start: "03:30", end: "12:00" },
      NY: { start: "17:30", end: "02:00" },
      Asian: { start: "05:30", end: "14:30" },
      PreMarket: { start: "09:00", end: "09:15" },
      Morning: { start: "09:15", end: "12:00" },
      Afternoon: { start: "12:00", end: "15:30" },
      PostMarket: { start: "15:40", end: "16:00" },
    };
    const savedSessionTimes: Record<string, { start: string; end: string }> = {
      ...defaultSessionTimes,
      ...(savedCfg?.sessionTimes || {}),
    };
    const rawSessions: string[] = Array.isArray(savedCfg?.selectedSessions)
      ? savedCfg.selectedSessions
      : isIndian
      ? ["Morning", "Afternoon"]
      : ["London", "NY"];
    const activeSessionsList = rawSessions
      .filter((id) => validMarketKeys.includes(id))
      .map((id) => {
        const fmt = (hhmm: string) => {
          const [hStr = "09", mStr = "00"] = hhmm.split(":");
          const h24 = Number(hStr) || 0;
          const period = h24 >= 12 ? "PM" : "AM";
          const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
          return `${h12}:${mStr.padStart(2, "0")} ${period}`;
        };
        const t = savedSessionTimes[id] || { start: "09:00", end: "17:00" };
        return {
          id,
          label: id === "NY" ? "New York" : id,
          window: `${fmt(t.start)} – ${fmt(t.end)}`,
        };
      });

    return {
      isIndian,
      sym,
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
        pairSegments,
      },
      drawdown: {
        active: drawdownActive,
        periodLabel: activePeriod === "weekly" ? "Weekly" : activePeriod === "monthly" ? "Monthly" : "Daily",
        capPct: ddCapPct,
        peakPct: ddPeakPct,
        leftPct: Math.max(0, Number((ddCapPct - ddPeakPct).toFixed(1))),
        pct: ddGaugePct,
        breached: ddBreached,
        grad: ddGrad,
      },
      profitTarget: {
        active: profitActive,
        goal: profitGoal,
        today: profitToday,
        pct: profitPct,
        reached: profitToday >= profitGoal,
      },
      equityFloor: {
        active: eqActive,
        floor: eqFloor,
        equity: liveEq,
        cushion: Math.max(0, liveEq - eqFloor),
        breached: eqFloor > 0 && liveEq <= eqFloor,
        bufferPct: eqBufferPct,
      },
      tradeLimit: {
        active: tradeLimitActive,
        used: todayTradesUsed,
        cap: tradeCap,
        pct: tradeLimitPct,
        breached: todayTradesUsed >= tradeCap,
      },
      cooldown: {
        active: cooldownOn,
        mins: cooldownMins,
        running: cooldownRunning,
      },
      session: {
        active: sessionOn,
        list: activeSessionsList,
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
        <div className="inline-flex items-center gap-1 min-w-0">
          <GripVertical
            size={12}
            className="text-slate-300 dark:text-neutral-600 shrink-0 cursor-grab"
          />
          <Link
            to="/risk-guard"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 truncate"
          >
            <Icon size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">{title}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${toneClass}`}>
            {badge}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/10 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Move widget to another section"
              >
                <Move size={10.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={6}
              className="w-40 p-1.5 rounded-xl bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 shadow-xl"
            >
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Place Widget In
              </p>
              {DASHBOARD_WIDGET_ZONES.map((z) => {
                const activeZone = (zones[id] || "col_right") === z.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setRiskWidgetZone(id, z.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      activeZone
                        ? "bg-blue-50 text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-300"
                        : "text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    {z.label}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
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

  const visibleIds = pinned.filter((id) => !zone || (zones[id] || "col_right") === zone);
  if (locked || visibleIds.length === 0) return null;

  const renderWidget = (id: RiskWidgetId): React.ReactNode => {
    switch (id) {
      case "max_lot":
        return (
          <>
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
          </>
        );
      case "no_avg":
        return (
          <>
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
          </>
        );
      case "martingale":
        return (
          <>
          <WidgetHeader
            id="martingale"
            icon={AlertTriangle}
            title="Post-Loss Lot Cap"
            badge={widgetData.martingale.active ? `${widgetData.martingale.multiplier.toFixed(1)}×` : "Off"}
            badgeTone={widgetData.martingale.active ? "amber" : "neutral"}
          />
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 text-[10.5px]">
              <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/[0.04]">
                <span className="text-[9px] text-slate-400 block">Last Losing Lot</span>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {widgetData.martingale.lastLossLot.toFixed(2)} Lots
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 tabular-nums">
                × {widgetData.martingale.multiplier.toFixed(1)}
              </span>
              <div className="px-2 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-500/10 text-right">
                <span className="text-[9px] text-emerald-700/80 dark:text-emerald-400/80 block">
                  Max Next
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                  {widgetData.martingale.allowedNextLot.toFixed(2)} Lots
                </span>
              </div>
            </div>

            <Gauge
              orientation="linear"
              ariaLabel="Dashboard Martingale Scale Cap"
              value={widgetData.martingale.pct}
              centerValue={widgetData.martingale.pct}
              defaultLabel={`Open ${widgetData.martingale.currentNextLot.toFixed(2)} of ${widgetData.martingale.allowedNextLot.toFixed(2)} Lots max`}
              suffix="% used"
              labelPlacement="top"
              labelAlign="start"
              totalNotches={36}
              linearHeight={12}
              spacing={2}
              notchCornerRadius={3}
              inactiveFillOpacity={0.35}
              useGradient
              gradientColors={widgetData.martingale.grad}
            />
          </div>
          </>
        );
      case "one_instrument":
        return (
          <>
          <WidgetHeader
            id="one_instrument"
            icon={Crosshair}
            title={
              widgetData.oneInstr.active
                ? `Only: ${widgetData.oneInstr.allowedTicker}`
                : "One Instrument"
            }
            badge={widgetData.oneInstr.active ? "Locked" : "Any Pair"}
            badgeTone={widgetData.oneInstr.active ? "emerald" : "neutral"}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {widgetData.oneInstr.active
                  ? `${widgetData.oneInstr.allowedTicker} active`
                  : "All pairs open"}
              </span>
              <span className="text-[10.5px] text-slate-400 tabular-nums">
                {widgetData.oneInstr.pct}% on {widgetData.oneInstr.allowedTicker}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.07] overflow-hidden flex gap-[2px]">
              {widgetData.oneInstr.pairSegments.length > 0 ? (
                widgetData.oneInstr.pairSegments.map((seg, idx) => (
                  <div
                    key={seg.symbol}
                    style={{ flexGrow: Math.max(1, seg.count), flexBasis: 0 }}
                    className={`h-full ${idx === 0 ? "rounded-l-full" : ""} ${
                      idx === widgetData.oneInstr.pairSegments.length - 1
                        ? "rounded-r-full"
                        : ""
                    } ${
                      seg.isAllowed
                        ? "bg-[#2563EB] dark:bg-blue-500"
                        : widgetData.oneInstr.active
                        ? "bg-amber-400/80 dark:bg-amber-400/75"
                        : "bg-slate-300 dark:bg-white/25"
                    }`}
                  />
                ))
              ) : (
                <div className="w-full h-full rounded-full bg-[#2563EB] dark:bg-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {widgetData.oneInstr.pairSegments.map((seg) => (
                <span
                  key={seg.symbol}
                  className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded border ${
                    seg.isAllowed
                      ? "bg-blue-50/80 text-blue-600 border-blue-200/70 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30"
                      : widgetData.oneInstr.active
                      ? "bg-amber-50/70 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25"
                      : "bg-slate-50 text-slate-600 border-slate-200/70 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/[0.08]"
                  }`}
                >
                  {seg.symbol} {seg.pct}%
                </span>
              ))}
            </div>
          </div>
          </>
        );
      case "drawdown":
        return (
          <>
          <WidgetHeader
            id="drawdown"
            icon={ShieldAlert}
            title={widgetData.isIndian ? `Loss (${widgetData.drawdown.periodLabel})` : `${widgetData.drawdown.periodLabel} Drawdown`}
            badge={
              widgetData.drawdown.breached
                ? "Breached"
                : widgetData.drawdown.active
                ? "Locked"
                : "Off"
            }
            badgeTone={
              widgetData.drawdown.breached
                ? "rose"
                : widgetData.drawdown.active
                ? "emerald"
                : "neutral"
            }
          />
          <div className="flex items-center gap-2.5">
            <div className="w-[126px] shrink-0 flex justify-center">
              <Gauge
                compact
                ariaLabel="Dashboard Drawdown Depth Gauge"
                value={widgetData.drawdown.pct}
                centerValue={widgetData.drawdown.pct}
                defaultLabel={`${widgetData.drawdown.peakPct}% / ${widgetData.drawdown.capPct.toFixed(1)}%`}
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
                gradientColors={widgetData.drawdown.grad}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Limit</span>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {widgetData.drawdown.capPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Worst</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  -{widgetData.drawdown.peakPct}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Buffer</span>
                <span
                  className={`font-bold tabular-nums ${
                    widgetData.drawdown.breached
                      ? "text-rose-600"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {widgetData.drawdown.breached
                    ? "Exceeded"
                    : `${widgetData.drawdown.leftPct}% left`}
                </span>
              </div>
            </div>
          </div>
          </>
        );
      case "profit_target":
        return (
          <>
          <WidgetHeader
            id="profit_target"
            icon={Target}
            title="Daily Profit Goal"
            badge={
              widgetData.profitTarget.reached
                ? "Goal Hit!"
                : widgetData.profitTarget.active
                ? "Active"
                : "Off"
            }
            badgeTone={
              widgetData.profitTarget.reached || widgetData.profitTarget.active
                ? "emerald"
                : "neutral"
            }
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                Earned +{widgetData.sym}
                {Math.max(0, widgetData.profitTarget.today).toLocaleString()}
              </span>
              <span className="text-[10.5px] text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                Goal +{widgetData.sym}{widgetData.profitTarget.goal.toLocaleString()}
              </span>
            </div>
            <Gauge
              orientation="linear"
              ariaLabel="Dashboard Profit Milestone Bar"
              value={widgetData.profitTarget.pct}
              centerValue={widgetData.profitTarget.pct}
              defaultLabel={
                widgetData.profitTarget.reached
                  ? "Daily goal secured!"
                  : `+${widgetData.sym}${Math.max(0, widgetData.profitTarget.goal - widgetData.profitTarget.today).toLocaleString()} to go`
              }
              suffix="% of goal"
              labelPlacement="top"
              labelAlign="start"
              totalNotches={36}
              linearHeight={12}
              spacing={2}
              notchCornerRadius={3}
              inactiveFillOpacity={0.32}
              useGradient
              gradientColors={["#6EE7B7", "#10B981", "#059669"]}
            />
          </div>
          </>
        );
      case "equity_floor":
        return (
          <>
          <WidgetHeader
            id="equity_floor"
            icon={Wallet}
            title="Equity Floor"
            badge={
              widgetData.equityFloor.breached
                ? "Breached"
                : widgetData.equityFloor.active
                ? "Guarded"
                : "Off"
            }
            badgeTone={
              widgetData.equityFloor.breached
                ? "rose"
                : widgetData.equityFloor.active
                ? "emerald"
                : "neutral"
            }
          />
          <div className="space-y-1.5">
            <Gauge
              orientation="linear"
              ariaLabel="Dashboard Equity Floor Buffer"
              value={widgetData.equityFloor.bufferPct}
              centerValue={widgetData.equityFloor.cushion}
              defaultLabel={`Floor ${widgetData.sym}${widgetData.equityFloor.floor.toLocaleString()} · Equity ${widgetData.sym}${widgetData.equityFloor.equity.toLocaleString()}`}
              prefix={`+${widgetData.sym}`}
              suffix=" safe"
              labelPlacement="top"
              labelAlign="start"
              totalNotches={36}
              linearHeight={12}
              spacing={2}
              notchCornerRadius={3}
              inactiveFillOpacity={0.35}
              useGradient
              gradientColors={
                widgetData.equityFloor.breached
                  ? ["#FB7185", "#E11D48", "#BE123C"]
                  : ["#34D399", "#10B981", "#059669"]
              }
            />
          </div>
          </>
        );
      case "trade_limit":
        return (
          <>
          <WidgetHeader
            id="trade_limit"
            icon={ShieldCheck}
            title="Daily Trade Limit"
            badge={
              widgetData.tradeLimit.breached
                ? "Max Hit"
                : widgetData.tradeLimit.active
                ? "Guarded"
                : "Off"
            }
            badgeTone={
              widgetData.tradeLimit.breached
                ? "rose"
                : widgetData.tradeLimit.active
                ? "emerald"
                : "neutral"
            }
          />
          <TradeSlotsBlobStrip
            total={widgetData.tradeLimit.cap}
            completed={widgetData.tradeLimit.used}
            compact
          />
          </>
        );
      case "loss_cooldown":
        return (
          <>
          <WidgetHeader
            id="loss_cooldown"
            icon={ShieldOff}
            title="Loss Cooldown"
            badge={
              widgetData.cooldown.running
                ? "Paused"
                : widgetData.cooldown.active
                ? `${widgetData.cooldown.mins}m`
                : "Off"
            }
            badgeTone={
              widgetData.cooldown.running
                ? "rose"
                : widgetData.cooldown.active
                ? "emerald"
                : "neutral"
            }
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
            <span>Wait duration after loss</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {widgetData.cooldown.mins} mins
            </span>
          </div>
          </>
        );
      case "session":
        return (
          <>
          <WidgetHeader
            id="session"
            icon={Clock}
            title="Session Sentinel"
            badge={
              widgetData.session.active
                ? `${widgetData.session.list.length} active`
                : "Off"
            }
            badgeTone={widgetData.session.active ? "emerald" : "neutral"}
          />
          <div className="grid grid-cols-1 gap-1">
            {widgetData.session.list.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-2 py-1 rounded-lg bg-blue-50/75 dark:bg-blue-500/15 text-[10px]"
              >
                <span className="font-bold text-[#2563EB] dark:text-blue-300">
                  {s.label}
                </span>
                <span className="font-semibold text-slate-600 dark:text-neutral-300 tabular-nums">
                  {s.window}
                </span>
              </div>
            ))}
          </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SortableContext items={visibleIds} strategy={rectSortingStrategy}>
      <div className={gridClassName}>
        {visibleIds.map((id) => (
          <SortableWidgetShell
            key={id}
            id={id}
            cardClass={cardClass}
            isEditMode={isEditMode}
          >
            {renderWidget(id)}
          </SortableWidgetShell>
        ))}
      </div>
    </SortableContext>
  );
};
