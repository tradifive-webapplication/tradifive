import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Crosshair,
  HeartPulse,
  Layers,
  LayoutGrid,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Target,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { Gauge } from "@/components/ui/charts";
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
  | "session"
  | "tilt_score";

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
  "tilt_score",
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
    subtitle: "Active trading sessions strip",
  },
  {
    id: "tilt_score",
    group: "Behaviour & Discipline",
    title: "Calm & Tilt Trend",
    subtitle: "Smooth trendline: mindset stability score",
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

        <div className="space-y-2.5 max-h-[340px] overflow-y-auto amazing-scrollbar pr-0.5">
          {(["Trading Control", "Risk Management", "Behaviour & Discipline"] as const).map(
            (groupName) => (
              <div key={groupName} className="space-y-1">
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-1 pt-0.5">
                  {groupName}
                </p>
                {RISK_WIDGET_CATALOG.filter((item) => item.group === groupName).map(
                  (item) => {
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
                  }
                )}
              </div>
            )
          )}
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
        : liveOpen.reduce((s: number, p: any) => s + Number(p.profit ?? 0), 0);
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
    const activeSessionsList: string[] = Array.isArray(savedCfg?.selectedSessions)
      ? savedCfg.selectedSessions
      : isIndian
      ? ["Morning", "Afternoon"]
      : ["London", "NY"];

    // 11. Tilt / Calm Trend
    const tiltOn = Boolean(savedCfg?.emotionalTradingDetector);
    const recent7 = allTrades.filter((t) => t.closed_at).slice(0, 7).reverse();
    const tiltSeries = useDemo
      ? [92, 88, 90, 76, 84, 89, 94]
      : recent7.length >= 2
      ? recent7.map((t) => Number(t.discipline_score ?? (Number(t.profit || 0) >= 0 ? 88 : 66)))
      : [85, 87, 84, 89, 90, 88, 92];
    const calmScore = Math.round(tiltSeries.reduce((a, b) => a + b, 0) / Math.max(1, tiltSeries.length));

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
      tilt: {
        active: tiltOn,
        calmScore,
        series: tiltSeries,
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
        </div>
      )}

      {pinned.includes("one_instrument") && (
        <div className={`${cardClass} p-3.5`}>
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
        </div>
      )}

      {pinned.includes("drawdown") && (
        <div className={`${cardClass} p-3.5`}>
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
        </div>
      )}

      {pinned.includes("profit_target") && (
        <div className={`${cardClass} p-3.5`}>
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
        </div>
      )}

      {pinned.includes("equity_floor") && (
        <div className={`${cardClass} p-3.5`}>
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
        </div>
      )}

      {pinned.includes("trade_limit") && (
        <div className={`${cardClass} p-3.5`}>
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
          <Gauge
            orientation="linear"
            ariaLabel="Dashboard Daily Trade Count"
            value={widgetData.tradeLimit.pct}
            centerValue={widgetData.tradeLimit.used}
            defaultLabel={`${widgetData.tradeLimit.used} of ${widgetData.tradeLimit.cap} trades today`}
            suffix={`/${widgetData.tradeLimit.cap}`}
            labelPlacement="top"
            labelAlign="start"
            totalNotches={36}
            linearHeight={12}
            spacing={2}
            notchCornerRadius={3}
            inactiveFillOpacity={0.35}
            useGradient
            gradientColors={
              widgetData.tradeLimit.breached
                ? ["#FB7185", "#E11D48", "#BE123C"]
                : ["#60A5FA", "#2563EB", "#0031F2"]
            }
          />
        </div>
      )}

      {pinned.includes("loss_cooldown") && (
        <div className={`${cardClass} p-3.5`}>
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
        </div>
      )}

      {pinned.includes("session") && (
        <div className={`${cardClass} p-3.5`}>
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
          <div className="flex items-center gap-1.5 flex-wrap">
            {widgetData.session.list.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-300"
              >
                {s === "NY" ? "New York" : s}
              </span>
            ))}
          </div>
        </div>
      )}

      {pinned.includes("tilt_score") && (
        <div className={`${cardClass} p-3.5`}>
          <WidgetHeader
            id="tilt_score"
            icon={HeartPulse}
            title="Calm & Tilt Trend"
            badge={`${widgetData.tilt.calmScore}% calm`}
            badgeTone={widgetData.tilt.calmScore >= 75 ? "emerald" : "amber"}
          />
          <div className="w-full h-9 rounded-xl bg-slate-50 dark:bg-white/[0.04] px-2 py-1">
            <svg viewBox="0 0 200 28" preserveAspectRatio="none" className="w-full h-full">
              {(() => {
                const pts = widgetData.tilt.series;
                const coords = pts.map((v, idx) => {
                  const x = (idx / Math.max(1, pts.length - 1)) * 200;
                  const y = 24 - ((Math.max(40, Math.min(100, v)) - 40) / 60) * 20;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });
                return (
                  <path
                    d={`M ${coords.join(" L ")}`}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
