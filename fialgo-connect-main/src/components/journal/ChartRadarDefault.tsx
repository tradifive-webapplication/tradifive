"use client";

import { TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useMemo } from "react";

export const description = "A radar chart";

const METRIC_COLORS: Record<string, { fill: string; stroke: string }> = {
  Discipline: { fill: "#2563EB", stroke: "#2563EB" },
  "Risk Mgmt": { fill: "#0EA5E9", stroke: "#0EA5E9" },
  Consistency: { fill: "#6366F1", stroke: "#6366F1" },
  Execution: { fill: "#3B82F6", stroke: "#3B82F6" },
  Psychology: { fill: "#8B5CF6", stroke: "#8B5CF6" },
  Accuracy: { fill: "#1D4ED8", stroke: "#1D4ED8" },
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const meta = METRIC_COLORS[d.metric] || { fill: "#2563EB" };
    return (
      <div className="bg-slate-950/95 text-white border border-white/10 rounded-xl px-3 py-2 shadow-xl">
        <p
          style={{ color: meta.fill }}
          className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
        >
          {d.metric}
        </p>
        <p className="text-[16px] font-bold tabular-nums leading-none">
          {d.score}
          <span className="text-slate-400 text-[11px] font-medium ml-0.5">/100</span>
        </p>
      </div>
    );
  }
  return null;
}

export function ChartRadarDefault({
  demoTrades,
  frameless = false,
}: {
  demoTrades?: any[] | null;
  frameless?: boolean;
} = {}) {
  const { recentTrades: rawRecentTrades } = useDashboardData();
  const recentTrades = demoTrades || rawRecentTrades || [];

  const chartData = useMemo(() => {
    const closed = recentTrades.filter((t: any) => t.closed_at && !t.is_pending);
    const last50 = closed.slice(0, 50);

    if (last50.length === 0) {
      return [
        { metric: "Discipline", score: 0 },
        { metric: "Risk Mgmt", score: 0 },
        { metric: "Consistency", score: 0 },
        { metric: "Execution", score: 0 },
        { metric: "Psychology", score: 0 },
        { metric: "Accuracy", score: 0 },
      ];
    }

    const wins = last50.filter((t: any) => Number(t.profit || 0) > 0);
    const losses = last50.filter((t: any) => Number(t.profit || 0) < 0);
    const wr = last50.length > 0 ? (wins.length / last50.length) * 100 : 0;

    // Win Rate -> Accuracy
    const accuracy = Math.round(wr);

    // Profit Factor -> Risk Mgmt
    const totalWin = wins.reduce((a: number, t: any) => a + Number(t.profit || 0), 0);
    const totalLoss = Math.abs(
      losses.reduce((a: number, t: any) => a + Number(t.profit || 0), 0)
    );
    const pf = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? 2 : 1;
    const riskMgmt = Math.min(100, Math.round((pf / 2) * 100));

    // Consistency: unique trading days
    const tradeDays = new Set(
      last50.map((t: any) => new Date(t.closed_at).toDateString())
    ).size;
    const consistency = Math.min(100, Math.round((tradeDays / 20) * 100));

    // Discipline: SL usage
    const withSL = last50.filter(
      (t: any) => t.stop_loss && Number(t.stop_loss) > 0
    );
    const discipline = Math.min(100, Math.round((withSL.length / last50.length) * 100));

    // Execution: avg win / avg loss ratio
    const avgWin = wins.length > 0 ? totalWin / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 1;
    const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 1;
    const execution = Math.min(100, Math.round((rrRatio / 2) * 100));

    // Psychology: consecutive loss control
    let maxLossStreak = 0;
    let streak = 0;
    last50.forEach((t: any) => {
      if (Number(t.profit || 0) < 0) {
        streak++;
        maxLossStreak = Math.max(maxLossStreak, streak);
      } else {
        streak = 0;
      }
    });
    const psychology = Math.max(0, Math.min(100, 100 - maxLossStreak * 12));

    return [
      { metric: "Discipline", score: discipline },
      { metric: "Risk Mgmt", score: riskMgmt },
      { metric: "Consistency", score: consistency },
      { metric: "Execution", score: execution },
      { metric: "Psychology", score: psychology },
      { metric: "Accuracy", score: accuracy },
    ];
  }, [recentTrades]);

  const closedCount = recentTrades.filter((t: any) => t.closed_at && !t.is_pending).length;
  const overallScore = Math.round(
    chartData.reduce((a, d) => a + d.score, 0) / chartData.length
  );
  const hasData = closedCount > 0;

  return (
    <div
      className={
        frameless
          ? "flex flex-col h-full px-0.5 pt-0.5 pb-1"
          : "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none overflow-hidden flex flex-col h-full p-4 sm:p-5"
      }
    >
      {/* Header */}
      <div className={`flex items-start justify-between ${frameless ? "mb-1 min-h-[42px]" : "mb-1"}`}>
        <div>
          <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
            TradiFive Score
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            6-axis performance breakdown
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[22px] font-bold text-[#2563EB] dark:text-blue-400 tabular-nums leading-none">
            <AnimatedNumber value={overallScore} duration={950} delay={120} />
          </span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Overall
          </span>
        </div>
      </div>

      {/* Radar */}
      <div
        className={`flex-1 flex flex-col items-center justify-center ${
          frameless ? "min-h-[188px]" : "min-h-[220px]"
        }`}
      >
        <ResponsiveContainer width="100%" height={frameless ? 192 : 230}>
          <RadarChart cx="50%" cy="50%" outerRadius={frameless ? "72%" : "70%"} data={chartData}>
            <defs>
              <radialGradient id="tfRadarGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.14} />
              </radialGradient>
            </defs>
            <PolarGrid
              stroke="#E2E8F0"
              className="dark:[stroke:rgba(255,255,255,0.08)]"
              strokeDasharray="0"
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={({ x, y, textAnchor, payload }: any) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fill="#64748B"
                  fontSize={10}
                  fontWeight={600}
                  dy={4}
                >
                  {payload.value}
                </text>
              )}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={2}
              fill="url(#tfRadarGrad)"
              fillOpacity={1}
              isAnimationActive={true}
              animationBegin={140}
              animationDuration={950}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend scores */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 mt-0.5">
        {chartData.map((d, idx) => {
          const meta = METRIC_COLORS[d.metric] || { fill: "#2563EB" };
          return (
            <div key={d.metric} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: meta.fill }}
              />
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-neutral-400 truncate">
                {d.metric}
              </span>
              <span className="text-[10.5px] font-bold text-slate-900 dark:text-white ml-auto tabular-nums">
                <AnimatedNumber value={d.score} duration={850} delay={140 + idx * 45} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2563EB] dark:text-blue-400">
          <TrendingUp size={12} />
          <span>{hasData ? "Live score active" : "Ready for trades"}</span>
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {hasData
            ? `Last ${Math.min(50, closedCount)} trade${closedCount !== 1 ? "s" : ""}`
            : "No trades yet"}
        </span>
      </div>
    </div>
  );
}
