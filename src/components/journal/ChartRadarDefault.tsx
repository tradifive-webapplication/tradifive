"use client";

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Lock, TrendingUp } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useTradingTheme } from "@/hooks/useTradingTheme";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MagicTextReveal } from "@/components/ui/magic-text-reveal";

export const description = "TradiFive 5-Axis Radar Score with Interactive Diagnostics";

type MetricKey = "winRate" | "profitFactor" | "avgR" | "consistency" | "discipline";

interface MetricData {
  key: MetricKey;
  label: string;
  score: number | null; // null if locked
  isLocked: boolean;
  pillValue: number;
  detailScoreDisplay: string;
  explanation: string;
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
  const { config: tradingTheme } = useTradingTheme();
  const { isStarter } = usePlan();
  const navigate = useNavigate();

  // Timeframe selector state: '30d' or 'all'
  const [timeframe, setTimeframe] = useState<"30d" | "all">("all");

  // Filter trades based on selected timeframe
  const scopedTrades = useMemo(() => {
    const closed = recentTrades.filter(
      (t: any) => t && t.closed_at && !t.is_pending
    );
    if (timeframe === "30d") {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return closed.filter(
        (t: any) => new Date(t.closed_at).getTime() >= cutoff
      );
    }
    return closed;
  }, [recentTrades, timeframe]);

  // Metrics computation for 5 pillars: Win Rate, Profit Factor, Avg R, Consistency, Discipline
  const metricsData = useMemo<Record<MetricKey, MetricData>>(() => {
    const closed = scopedTrades;
    const wins = closed.filter((t: any) => Number(t.profit || 0) > 0);
    const losses = closed.filter((t: any) => Number(t.profit || 0) < 0);

    // 1. Win Rate
    const rawWinRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
    const winRateScore = Math.round(rawWinRate);
    const winRateExp =
      closed.length === 0
        ? "Win rate measures the percentage of closed trades that generated profit. Unlocks after your first closed trade."
        : winRateScore >= 60
        ? `Strong win rate of ${winRateScore}% across ${closed.length} trades (${wins.length}W / ${losses.length}L). Combined with healthy risk-to-reward, this provides high statistical edge.`
        : winRateScore >= 45
        ? `Balanced win rate of ${winRateScore}% across ${closed.length} trades (${wins.length}W / ${losses.length}L). Ensure your average winning trade adequately compensates for losing trades.`
        : `Win rate is ${winRateScore}% across ${closed.length} trades. Focus on selective setup criteria and letting winning runs reach full target targets.`;

    // 2. Profit Factor
    const totalWin = wins.reduce((sum, t) => sum + Number(t.profit || 0), 0);
    const totalLoss = Math.abs(losses.reduce((sum, t) => sum + Number(t.profit || 0), 0));
    const rawPF = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? 3.5 : 0;
    // Scale: 2.0+ is 100 score, 1.0 is 50 score
    const pfScore = closed.length === 0 ? 0 : Math.min(100, Math.round((rawPF / 2.0) * 100));
    const pfExp =
      closed.length === 0
        ? "Gross profit divided by gross losses. A profit factor above 1.50 represents solid edge, and 2.00+ is institutional grade."
        : rawPF >= 2.0
        ? `Elite profit factor of ${rawPF.toFixed(2)}. Gross profits exceed losses by over 2x, comfortably surpassing top prop firm benchmarks.`
        : rawPF >= 1.3
        ? `Solid profit factor of ${rawPF.toFixed(2)}. Winning trades are generating more aggregate capital than losing positions.`
        : `Profit factor is ${rawPF.toFixed(2)}. Aim to trim losing trades earlier and allow high-conviction winners to run to improve your ratio.`;

    // 3. Avg R (Reward-to-Risk)
    const avgWin = wins.length > 0 ? totalWin / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 1;
    const rawRR = avgLoss > 0 ? avgWin / avgLoss : 1;
    const avgRScore = closed.length === 0 ? 0 : Math.min(100, Math.round((rawRR / 2.0) * 100));
    const avgRExp =
      closed.length === 0
        ? "Average return per unit of risk taken. Measures whether your winners are consistently larger than your standard stop loss."
        : rawRR >= 1.8
        ? `Excellent risk-to-reward of ${rawRR.toFixed(2)}R. Sizable winners ensure account equity grows even during lower strike rate cycles.`
        : `Average return is ${rawRR.toFixed(2)}R. Seek higher timeframe confirmation and trail stops to capture 1.5R to 2.5R on primary setups.`;

    // 4. Consistency
    const uniqueDays = new Set(
      closed.map((t: any) => new Date(t.closed_at).toDateString())
    ).size;
    const consistencyLocked = uniqueDays < 3;
    const consistencyScore = consistencyLocked
      ? null
      : Math.min(100, Math.round((uniqueDays / 12) * 100));
    const consistencyExp = consistencyLocked
      ? "Consistency needs 3 trading days in this window. It starts on your third trading day."
      : `Consistency is active across ${uniqueDays} unique market days in this window. Demonstrates steady routine and disciplined schedule pacing.`;

    // 5. Discipline
    const withSL = closed.filter((t: any) => t.stop_loss && Number(t.stop_loss) > 0);
    const slPct = closed.length > 0 ? (withSL.length / closed.length) * 100 : 0;
    let maxLossStreak = 0;
    let currentStreak = 0;
    closed.forEach((t: any) => {
      if (Number(t.profit || 0) < 0) {
        currentStreak++;
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    const disciplineScore =
      closed.length === 0
        ? 0
        : Math.max(
            5,
            Math.min(
              100,
              Math.round(slPct * 0.7 + Math.max(0, 30 - maxLossStreak * 5))
            )
          );
    const disciplineExp =
      closed.length === 0
        ? "Tracks rule adherence: setting hard stop losses on entry, observing max loss limits, and eliminating revenge trading."
        : disciplineScore >= 80
        ? `High discipline (${disciplineScore}/100). Hard stop losses attached on ${Math.round(slPct)}% of executions with controlled drawdown streaks.`
        : `Discipline score is ${disciplineScore}/100. Ensure 100% of orders have predefined stop losses before market entry.`;

    return {
      winRate: {
        key: "winRate",
        label: "Win rate",
        score: winRateScore,
        isLocked: false,
        pillValue: winRateScore,
        detailScoreDisplay: `${winRateScore}%`,
        explanation: winRateExp,
      },
      profitFactor: {
        key: "profitFactor",
        label: "Profit factor",
        score: pfScore,
        isLocked: false,
        pillValue: pfScore,
        detailScoreDisplay: rawPF > 0 ? rawPF.toFixed(2) : "0.00",
        explanation: pfExp,
      },
      avgR: {
        key: "avgR",
        label: "Avg R",
        score: avgRScore,
        isLocked: false,
        pillValue: avgRScore,
        detailScoreDisplay: `${rawRR.toFixed(2)}R`,
        explanation: avgRExp,
      },
      consistency: {
        key: "consistency",
        label: "Consistency",
        score: consistencyScore,
        isLocked: consistencyLocked,
        pillValue: consistencyScore ?? 0,
        detailScoreDisplay: consistencyLocked ? "No score" : `${consistencyScore}/100`,
        explanation: consistencyExp,
      },
      discipline: {
        key: "discipline",
        label: "Discipline",
        score: disciplineScore,
        isLocked: false,
        pillValue: disciplineScore,
        detailScoreDisplay: `${disciplineScore}/100`,
        explanation: disciplineExp,
      },
    };
  }, [scopedTrades]);

  const metricsList = useMemo(
    () => [
      metricsData.winRate,
      metricsData.profitFactor,
      metricsData.avgR,
      metricsData.consistency,
      metricsData.discipline,
    ],
    [metricsData]
  );

  // Default active key: if Consistency is locked, default to "consistency" like in reference image!
  const [activeKey, setActiveKey] = useState<MetricKey>("consistency");
  const activeMetric = metricsData[activeKey] || metricsData.consistency;

  // Overall Score: Average of all unlocked scores
  const overallScore = useMemo(() => {
    const validScores = metricsList
      .filter((m) => !m.isLocked && m.score !== null)
      .map((m) => m.score as number);
    if (validScores.length === 0) return 0;
    return Math.round(
      validScores.reduce((acc, val) => acc + val, 0) / validScores.length
    );
  }, [metricsList]);

  // Overall subtitle dynamic text
  const subtitleText = useMemo(() => {
    const count = scopedTrades.length;
    const windowName = timeframe === "30d" ? "30 days" : "history";
    if (count < 10) {
      return `${timeframe === "30d" ? "30 days" : "All time"}: under 10 trades in ${windowName}`;
    }
    return `${timeframe === "30d" ? "30 days" : "All time"}: ${count} closed trades`;
  }, [scopedTrades.length, timeframe]);

  // --- SVG Radar Geometry (5-point regular pentagon) ---
  const cx = 150;
  const cy = 108;
  const maxR = 74;

  // Angles for the 5 vertices:
  // 0: Win rate (top, -90°)
  // 1: Profit factor (top-right, -18°)
  // 2: Avg R (bottom-right, 54°)
  // 3: Consistency (bottom-left, 126°)
  // 4: Discipline (top-left, 198°)
  const angles = [-Math.PI / 2, -Math.PI / 10, (3 * Math.PI) / 10, (7 * Math.PI) / 10, (11 * Math.PI) / 10];

  // Concentric pentagon grid rings (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const points = angles
      .map((angle) => {
        const x = cx + maxR * lvl * Math.cos(angle);
        const y = cy + maxR * lvl * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return points;
  });

  // Calculate polygon data points
  const dataPoints = metricsList.map((m, idx) => {
    const angle = angles[idx];
    // If locked, pinch close to center (4% radius) as in reference screenshot
    const pct = m.isLocked || m.score === null ? 0.05 : Math.max(0.06, Math.min(1.0, m.score / 100));
    const r = maxR * pct;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle, ...m };
  });

  const polygonPath = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Spoke lines from center to outer ring
  const spokes = angles.map((angle, idx) => {
    const outerX = cx + maxR * Math.cos(angle);
    const outerY = cy + maxR * Math.sin(angle);
    const m = metricsList[idx];
    return {
      x1: cx,
      y1: cy,
      x2: outerX,
      y2: outerY,
      isLocked: m.isLocked,
      key: m.key,
    };
  });

  // Label positions (slightly outside maxR)
  const labelPositions = [
    { x: cx, y: cy - maxR - 12, anchor: "middle" }, // Win rate
    { x: cx + maxR * Math.cos(angles[1]) + 10, y: cy + maxR * Math.sin(angles[1]) + 4, anchor: "start" }, // Profit factor
    { x: cx + maxR * Math.cos(angles[2]) + 8, y: cy + maxR * Math.sin(angles[2]) + 16, anchor: "start" }, // Avg R
    { x: cx + maxR * Math.cos(angles[3]) - 8, y: cy + maxR * Math.sin(angles[3]) + 16, anchor: "end" }, // Consistency
    { x: cx + maxR * Math.cos(angles[4]) - 10, y: cy + maxR * Math.sin(angles[4]) + 4, anchor: "end" }, // Discipline
  ];

  return (
    <div
      className={
        frameless
          ? "flex flex-col h-full relative px-0.5 pt-0.5 pb-1 select-none"
          : "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none overflow-hidden relative flex flex-col h-full p-4 sm:p-5 select-none"
      }
    >
      <div className={`flex flex-col flex-1 min-h-0 ${isStarter ? "blur-[2px] select-none pointer-events-none opacity-75" : ""}`}>
      {/* ── 1. Header (Title, Subtitle, Timeframe Tabs, Overall Score) ── */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200 flex items-center gap-1">
              <span>TradiFive Score</span>
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="TradiFive Score Info"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <Info size={13} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                TradiFive composite score calculated across 5 core trading pillars:
                Win Rate, Profit Factor, Average R, Consistency, and Risk Discipline.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
            {subtitleText}
          </p>

          {/* Timeframe Tabs: 30 days | All time */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  toast.info("Pro Feature · Score History", {
                    description: "Upgrade to Pro to toggle timeframe scoring between 30 days and All Time.",
                    action: { label: "Upgrade", onClick: () => navigate("/upgrade") },
                  });
                  return;
                }
                setTimeframe("30d");
              }}
              className={`text-[11.5px] pb-0.5 transition-all cursor-pointer ${
                timeframe === "30d"
                  ? "font-semibold text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white"
                  : "font-medium text-slate-400 hover:text-slate-700 dark:hover:text-neutral-300"
              }`}
            >
              30 days
            </button>
            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  toast.info("Pro Feature · Score History", {
                    description: "Upgrade to Pro to toggle timeframe scoring between 30 days and All Time.",
                    action: { label: "Upgrade", onClick: () => navigate("/upgrade") },
                  });
                  return;
                }
                setTimeframe("all");
              }}
              className={`text-[11.5px] pb-0.5 transition-all cursor-pointer ${
                timeframe === "all"
                  ? "font-semibold text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white"
                  : "font-medium text-slate-400 hover:text-slate-700 dark:hover:text-neutral-300"
              }`}
            >
              All time
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[34px] sm:text-[36px] font-black text-slate-900 dark:text-white tabular-nums leading-none tracking-tight">
            <AnimatedNumber value={overallScore} duration={950} delay={100} />
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-0.5">
            {scopedTrades.length > 0 ? "-1 since yesterday" : "Awaiting trades"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">

      {/* ── 2. Radar Chart Canvas (Interactive Polygon & Spokes) ── */}
      <div className="flex-1 flex items-center justify-center min-h-[195px] max-h-[225px] w-full relative py-1">
        <svg
          viewBox="0 0 300 220"
          className="w-full h-full max-w-[320px] overflow-visible"
        >
          <defs>
            {/* Subtle soft radar fill gradient */}
            <linearGradient id="tfRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.14" className="dark:stop-color-white dark:stop-opacity-20" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.04" className="dark:stop-color-white dark:stop-opacity-05" />
            </linearGradient>
          </defs>

          {/* 5 Concentric Pentagonal Web Grid Lines */}
          {gridPolygons.map((pts, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={pts}
              fill="none"
              stroke="currentColor"
              className="text-slate-200/90 dark:text-white/[0.08]"
              strokeWidth={idx === gridPolygons.length - 1 ? 1.2 : 0.8}
            />
          ))}

          {/* Radial Spokes: Solid for active, Dotted/Dashed for locked axis */}
          {spokes.map((spoke, idx) => (
            <line
              key={`spoke-${idx}`}
              x1={spoke.x1}
              y1={spoke.y1}
              x2={spoke.x2}
              y2={spoke.y2}
              stroke="currentColor"
              className={
                spoke.isLocked
                  ? "text-slate-400/80 dark:text-neutral-500"
                  : "text-slate-200/90 dark:text-white/[0.08]"
              }
              strokeWidth={1}
              strokeDasharray={spoke.isLocked ? "3 3" : undefined}
            />
          ))}

          {/* Filled Data Polygon */}
          <polygon
            points={polygonPath}
            fill="url(#tfRadarGrad)"
            stroke="currentColor"
            className="text-slate-800 dark:text-slate-200"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />

          {/* Polygon Vertices & Hit Areas */}
          {dataPoints.map((pt) => {
            const isHovered = activeKey === pt.key;
            return (
              <g
                key={`vertex-${pt.key}`}
                className="cursor-pointer"
                onMouseEnter={() => setActiveKey(pt.key)}
                onClick={() => setActiveKey(pt.key)}
              >
                {/* Visual Vertex Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.5 : 2.5}
                  className={`transition-all duration-200 ${
                    isHovered
                      ? "fill-slate-900 dark:fill-white stroke-2 stroke-white dark:stroke-slate-900"
                      : "fill-slate-700 dark:fill-slate-300"
                  }`}
                />
                {/* Expanded Invisible Hit Area */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={18}
                  fill="transparent"
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* Axis Labels Around Chart */}
          {metricsList.map((m, idx) => {
            const pos = labelPositions[idx];
            const isHovered = activeKey === m.key;
            return (
              <g
                key={`label-${m.key}`}
                className="cursor-pointer select-none group"
                onMouseEnter={() => setActiveKey(m.key)}
                onClick={() => setActiveKey(m.key)}
              >
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.anchor as any}
                  className={`text-[10.5px] transition-colors duration-150 ${
                    isHovered
                      ? "fill-slate-900 dark:fill-white font-bold"
                      : "fill-slate-500 dark:fill-neutral-400 group-hover:fill-slate-900 dark:group-hover:fill-white font-medium"
                  }`}
                >
                  {m.isLocked ? "🔒 " : ""}
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── 3. Interactive Detail Explanation Section (Directly Under Radar) ── */}
      <div className="mt-1 mb-1.5 px-0.5 py-1 min-h-[58px] flex flex-col justify-center transition-all duration-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeMetric.isLocked && (
              <Lock size={12.5} className="text-slate-400 shrink-0" />
            )}
            <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
              {activeMetric.label}
            </h4>
          </div>
          <span className="text-[13.5px] font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
            {activeMetric.isLocked ? "No score" : activeMetric.detailScoreDisplay}
          </span>
        </div>
        <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-snug mt-1">
          {activeMetric.explanation}
        </p>
      </div>

      {/* ── 4. Bottom Metric Row (5 Interactive Pillars) ── */}
      <div className="grid grid-cols-5 gap-1 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] mt-auto">
        {metricsList.map((m) => {
          const isSelected = activeKey === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onMouseEnter={() => setActiveKey(m.key)}
              onClick={() => setActiveKey(m.key)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-all cursor-pointer text-center ${
                isSelected
                  ? "bg-slate-100 dark:bg-white/[0.08] shadow-sm"
                  : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[13.5px] font-bold text-slate-900 dark:text-white tabular-nums flex items-center justify-center min-h-[20px]">
                {m.isLocked ? (
                  <Lock size={12.5} className="text-slate-500 dark:text-neutral-400" />
                ) : (
                  <AnimatedNumber value={m.pillValue} duration={700} />
                )}
              </span>
              <span
                className={`text-[9.5px] tracking-tight mt-0.5 truncate max-w-full px-0.5 ${
                  isSelected
                    ? "font-semibold text-slate-900 dark:text-white"
                    : "font-medium text-slate-400 dark:text-neutral-400"
                }`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
      </div>
      </div>

      {isStarter && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-auto">
          <div className="backdrop-blur-md bg-white/95 dark:bg-[#1A1A1E]/95 border border-slate-200/80 dark:border-white/15 px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 max-w-[320px] w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <Lock size={14} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <MagicTextReveal
                  text="TradiFive Score"
                  fontSize={13}
                  fontWeight={700}
                  className="leading-tight"
                />
                <p className="text-[10px] font-semibold text-slate-400 dark:text-neutral-400">
                  Pro &amp; Elite
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/upgrade")}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11.5px] font-bold shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
