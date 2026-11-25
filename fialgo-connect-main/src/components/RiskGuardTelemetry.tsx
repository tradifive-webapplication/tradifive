import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Activity,
  Target,
  Layers,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTradingTheme } from "@/hooks/useTradingTheme";

const SURFACE_CARD =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

interface RiskGuardTelemetryProps {
  sym: string;
  balance: number;
  equity: number;
  drawdown: number;
  todayProfit: number;
  tradesToday: number;
  recentTrades: any[];
  isConnected: boolean;
  maxDrawdown: number;
  drawdownGuardActive: boolean;
  tradeLimit: number;
  disciplineActive: boolean;
  dailyProfitTarget: number;
  dailyProfitTargetActive: boolean;
  maxLot: number;
  maxLotActive: boolean;
  stopLossRequired: boolean;
  activeRulesCount: number;
  totalRulesCount?: number;
}

function RiskCurveTooltip({ active, payload, label, sym }: any) {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0]?.payload;
  return (
    <div className="bg-white/95 dark:bg-[#1C1C20]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-[11px]">
      <p className="font-semibold text-slate-400 dark:text-neutral-400 mb-0.5">
        {label}
      </p>
      <p className="font-bold text-slate-900 dark:text-white tabular-nums">
        Equity: {sym}
        {Number(pt?.equity ?? 0).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}
      </p>
      <p
        className={`font-semibold tabular-nums mt-0.5 ${
          Number(pt?.pnl ?? 0) >= 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        Net: {Number(pt?.pnl ?? 0) >= 0 ? "+" : "-"}
        {sym}
        {Math.abs(Number(pt?.pnl ?? 0)).toFixed(2)}
      </p>
    </div>
  );
}

export const RiskGuardTelemetry: React.FC<RiskGuardTelemetryProps> = ({
  sym,
  balance,
  equity,
  drawdown,
  todayProfit,
  tradesToday,
  recentTrades,
  isConnected,
  maxDrawdown,
  drawdownGuardActive,
  tradeLimit,
  disciplineActive,
  dailyProfitTarget,
  dailyProfitTargetActive,
  maxLot,
  maxLotActive,
  stopLossRequired,
  activeRulesCount,
  totalRulesCount = 24,
}) => {
  const { isDark } = useTradingTheme();
  const [chartRange, setChartRange] = useState<"7D" | "14D" | "All">("14D");

  // 1. Horizontal Bars Data (Live Limit Utilization)
  const bars = useMemo(() => {
    const safeDrawdownLimit = Math.max(0.5, maxDrawdown || 5);
    const liveLossPct =
      todayProfit < 0 && balance > 0
        ? Math.min(safeDrawdownLimit, (Math.abs(todayProfit) / balance) * 100)
        : Math.max(0, drawdown || 0);
    const ddUtilization = Math.min(
      100,
      Math.round((liveLossPct / safeDrawdownLimit) * 100)
    );
    const ddRemaining = Math.max(0, safeDrawdownLimit - liveLossPct);

    const safeTradeLimit = Math.max(1, tradeLimit || 3);
    const tradeUtilization = Math.min(
      100,
      Math.round(((tradesToday || 0) / safeTradeLimit) * 100)
    );

    const safeProfitTarget = Math.max(1, dailyProfitTarget || 500);
    const positiveToday = Math.max(0, todayProfit || 0);
    const profitUtilization = Math.min(
      100,
      Math.round((positiveToday / safeProfitTarget) * 100)
    );

    const shieldUtilization = Math.min(
      100,
      Math.round((activeRulesCount / Math.max(1, totalRulesCount)) * 100)
    );

    return [
      {
        id: "dd",
        title: "Daily Drawdown Usage",
        subtitle: `Limit ${safeDrawdownLimit.toFixed(1)}% · ${
          drawdownGuardActive ? "Guard Armed" : "Standby"
        }`,
        badge: `${liveLossPct.toFixed(2)}% / ${safeDrawdownLimit.toFixed(1)}%`,
        pct: ddUtilization,
        pctLabel: `${ddUtilization}%`,
        color:
          ddUtilization >= 80
            ? ("rose" as const)
            : ddUtilization >= 50
            ? ("amber" as const)
            : ("green" as const),
        footer: `Safe buffer: ${ddRemaining.toFixed(2)}% remaining`,
        icon: (
          <ShieldAlert
            size={13}
            className={
              ddUtilization >= 80
                ? "text-rose-500 shrink-0"
                : ddUtilization >= 50
                ? "text-amber-500 shrink-0"
                : "text-emerald-500 shrink-0"
            }
          />
        ),
      },
      {
        id: "quota",
        title: "Daily Trade Quota",
        subtitle: `${disciplineActive ? "Hard cap active" : "Tracking executions"}`,
        badge: `${tradesToday || 0} / ${safeTradeLimit} trades`,
        pct: tradeUtilization,
        pctLabel: `${tradeUtilization}%`,
        color: tradeUtilization >= 90 ? ("amber" as const) : ("blue" as const),
        footer: `${Math.max(0, safeTradeLimit - (tradesToday || 0))} executions remaining today`,
        icon: <Activity size={13} className="text-[#2563EB] shrink-0" />,
      },
      {
        id: "profit",
        title: "Daily Profit Target",
        subtitle: `${
          dailyProfitTargetActive ? "Auto-lock on target" : "Progress monitor"
        }`,
        badge: `${sym}${Math.round(positiveToday).toLocaleString()} / ${sym}${safeProfitTarget.toLocaleString()}`,
        pct: profitUtilization,
        pctLabel: `${profitUtilization}%`,
        color: "green" as const,
        footer:
          profitUtilization >= 100
            ? "Target achieved · Protect gains"
            : `${sym}${Math.max(0, safeProfitTarget - positiveToday).toFixed(0)} away from lock target`,
        icon: <Target size={13} className="text-emerald-500 shrink-0" />,
      },
      {
        id: "armor",
        title: "Protocol Shield Strength",
        subtitle: `${maxLotActive ? `Max ${maxLot} lots` : "No lot cap"} · SL ${
          stopLossRequired ? "Required" : "Optional"
        }`,
        badge: `${activeRulesCount} / ${totalRulesCount} rules`,
        pct: shieldUtilization,
        pctLabel: `${shieldUtilization}%`,
        color: shieldUtilization >= 50 ? ("blue" as const) : ("amber" as const),
        footer:
          activeRulesCount >= 4
            ? "Strong automated protection coverage"
            : "Enable more guards to harden account",
        icon: <Layers size={13} className="text-[#2563EB] shrink-0" />,
      },
    ];
  }, [
    maxDrawdown,
    todayProfit,
    balance,
    drawdown,
    drawdownGuardActive,
    tradeLimit,
    tradesToday,
    disciplineActive,
    dailyProfitTarget,
    dailyProfitTargetActive,
    sym,
    activeRulesCount,
    totalRulesCount,
    maxLot,
    maxLotActive,
    stopLossRequired,
  ]);

  // 2. Equity Safety Curve Data (Recharts AreaChart)
  const curveData = useMemo(() => {
    const baseEq = equity || balance || 10000;
    const validTrades = (recentTrades || [])
      .filter((t) => t && (t.closed_at || t.close_time || t.open_time))
      .slice()
      .sort(
        (a, b) =>
          new Date(a.closed_at || a.close_time || a.open_time).getTime() -
          new Date(b.closed_at || b.close_time || b.open_time).getTime()
      );

    const limitDays = chartRange === "7D" ? 7 : chartRange === "14D" ? 14 : 30;

    if (validTrades.length >= 2) {
      const slice = validTrades.slice(-limitDays);
      let running = baseEq - slice.reduce((acc, t) => acc + Number(t.profit || 0), 0);
      return slice.map((t, idx) => {
        const pnl = Number(t.profit || 0);
        running += pnl;
        const dt = new Date(t.closed_at || t.close_time || t.open_time);
        return {
          label: dt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          equity: Number(running.toFixed(2)),
          pnl: Number(pnl.toFixed(2)),
          idx,
        };
      });
    }

    // Clean baseline curve when awaiting live closed trades
    const pts = [];
    const now = new Date();
    const count = chartRange === "7D" ? 7 : chartRange === "14D" ? 10 : 14;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      pts.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        equity: Number(baseEq.toFixed(2)),
        pnl: 0,
      });
    }
    return pts;
  }, [recentTrades, equity, balance, chartRange]);

  const ddStatus =
    drawdown >= (maxDrawdown || 5) * 0.8
      ? {
          text: "Near Limit",
          cls: "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/70 dark:border-rose-500/30",
        }
      : {
          text: "Safe Buffer",
          cls: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/30",
        };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
      {/* LEFT (7 cols): Live Exposure & Horizontal 3D Striped Limit Bars */}
      <div className={`lg:col-span-7 ${SURFACE_CARD} p-4 flex flex-col justify-between gap-3`}>
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={14} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Live Risk Limits &amp; Exposure
              </h3>
              <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 truncate">
                Real-time quota &amp; drawdown threshold telemetry
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${ddStatus.cls}`}
          >
            ● {ddStatus.text}
          </span>
        </div>

        {/* 2x2 Horizontal Striped Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
          {bars.map((bar) => {
            const stripeGradient =
              bar.color === "green"
                ? "repeating-linear-gradient(45deg, #059669 0 16px, #10B981 16px 32px)"
                : bar.color === "amber"
                ? "repeating-linear-gradient(45deg, #D97706 0 16px, #F59E0B 16px 32px)"
                : bar.color === "rose"
                ? "repeating-linear-gradient(45deg, #E11D48 0 16px, #FB7185 16px 32px)"
                : "repeating-linear-gradient(45deg, #0031F2 0 16px, #006DFE 16px 32px)";

            const stripeShadow =
              bar.color === "green"
                ? "0 1px 6px rgba(16,185,129,0.35), inset 0 1px 1px rgba(255,255,255,0.6)"
                : bar.color === "amber"
                ? "0 1px 6px rgba(245,158,11,0.35), inset 0 1px 1px rgba(255,255,255,0.6)"
                : bar.color === "rose"
                ? "0 1px 6px rgba(225,29,72,0.35), inset 0 1px 1px rgba(255,255,255,0.6)"
                : "0 1px 6px rgba(0,109,254,0.4), inset 0 1px 1px rgba(255,255,255,0.6)";

            const textColor =
              bar.color === "green"
                ? "text-emerald-600 dark:text-emerald-400"
                : bar.color === "amber"
                ? "text-amber-600 dark:text-amber-400"
                : bar.color === "rose"
                ? "text-rose-600 dark:text-rose-400"
                : "text-[#006DFE] dark:text-blue-400";

            return (
              <div
                key={bar.id}
                className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {bar.icon}
                      <span className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
                        {bar.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate pl-4">
                      {bar.subtitle}
                    </p>
                  </div>

                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-white dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10 whitespace-nowrap shrink-0 tabular-nums">
                    {bar.badge}
                  </span>
                </div>

                {/* 3D Striped Horizontal Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 h-[8px] rounded-full bg-[#EAEFF5] dark:bg-[#080C14] border border-slate-300/80 dark:border-[#006DFE]/30 p-[1px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, bar.pct)}%` }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        background: stripeGradient,
                        boxShadow: stripeShadow,
                      }}
                      className="uiverse-stripe-bar h-full rounded-full relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none rounded-t-full" />
                      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-black/20 pointer-events-none rounded-b-full" />
                    </motion.div>
                  </div>
                  <span className={`text-[11px] font-black tabular-nums min-w-[32px] text-right ${textColor}`}>
                    {bar.pctLabel}
                  </span>
                </div>

                <div className="text-[10px] font-medium text-slate-500 dark:text-neutral-400 truncate border-t border-slate-200/50 dark:border-white/[0.05] pt-1.5">
                  {bar.footer}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT (5 cols): Equity Safety Curve (Recharts AreaChart) */}
      <div className={`lg:col-span-5 ${SURFACE_CARD} p-4 flex flex-col justify-between gap-2`}>
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="min-w-0">
            <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#006DFE] shrink-0" />
              <span>Equity Protection Curve</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
              {isConnected ? "Live account equity trajectory" : "Baseline safety projection"}
            </p>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-[10px] bg-slate-100 dark:bg-white/[0.06] shrink-0">
            {(["7D", "14D", "All"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setChartRange(r)}
                className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[8px] transition-all cursor-pointer ${
                  chartRange === r
                    ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Headline Metric */}
        <div className="flex items-baseline justify-between gap-2 py-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {sym}
              {(equity || balance || 0).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                todayProfit >= 0
                  ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
              } tabular-nums`}
            >
              {todayProfit >= 0 ? "+" : "-"}
              {sym}
              {Math.abs(todayProfit || 0).toFixed(2)} today
            </span>
          </div>
        </div>

        {/* Smooth Recharts Area Chart */}
        <div className="w-full h-[175px] min-h-[175px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={curveData}
              margin={{ top: 8, right: 6, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tfRiskCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006DFE" stopOpacity={0.26} />
                  <stop offset="85%" stopColor="#006DFE" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="#006DFE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                minTickGap={28}
                tick={{
                  fill: isDark ? "#71717A" : "#94A3B8",
                  fontSize: 10,
                  fontWeight: 500,
                }}
                dy={6}
              />
              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                width={46}
                tick={{
                  fill: isDark ? "#71717A" : "#94A3B8",
                  fontSize: 10,
                  fontWeight: 500,
                }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${sym}${(v / 1000).toFixed(1)}k` : `${sym}${v}`
                }
              />
              <Tooltip content={<RiskCurveTooltip sym={sym} />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#006DFE"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tfRiskCurveGrad)"
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: isDark ? "#17171A" : "#FFFFFF",
                  fill: "#006DFE",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span>{isConnected ? "Broker Live" : "Awaiting Connection"}</span>
          </span>
          <span className="font-bold text-[#006DFE] dark:text-blue-400 tabular-nums">
            {activeRulesCount} Active Guards
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskGuardTelemetry;
