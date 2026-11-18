import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface PerformanceChartProps {
  trades: any[];
  isDark: boolean;
  currencySymbol?: string;
}

function computeNiceScale(minVal: number, maxVal: number) {
  const low = Math.min(0, minVal);
  const high = Math.max(0, maxVal);
  const rawSpan = high - low || 100;
  const roughStep = rawSpan / 3;
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const norm = roughStep / mag;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const step = niceNorm * mag;

  const niceMin = Math.floor(low / step) * step;
  const niceMax = Math.ceil(high / step) * step;

  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.001; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return { domain: [niceMin, niceMax] as [number, number], ticks };
}

function formatAxisCurrency(val: number, sym: string): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs === 0) return `${sym}0`;
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}${sym}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `${sign}${sym}${abs.toFixed(0)}`;
}

function formatTooltipCurrency(val: number, sym: string): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : val > 0 ? "+" : "";
  return `${sign}${sym}${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PerformanceChart({
  trades,
  isDark,
  currencySymbol = "$",
}: PerformanceChartProps) {
  const { data, domain, ticks } = useMemo(() => {
    const sorted = [...(trades || [])]
      .filter((t) => t.closed_at)
      .sort(
        (a, b) =>
          new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime()
      );

    if (sorted.length === 0) {
      return {
        data: [{ label: "Today", fullDate: "Today", profit: 0, delta: 0, symbol: "" }],
        domain: [0, 100] as [number, number],
        ticks: [0, 50, 100],
      };
    }

    let cumulative = 0;
    let minP = 0;
    let maxP = 0;

    const firstDate = new Date(sorted[0].closed_at);
    const startLabel = firstDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const points = sorted.map((t) => {
      const p = Number(t.profit || 0);
      cumulative = Math.round((cumulative + p) * 100) / 100;
      if (cumulative < minP) minP = cumulative;
      if (cumulative > maxP) maxP = cumulative;
      const dt = new Date(t.closed_at);
      return {
        label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        profit: cumulative,
        delta: p,
        symbol: t.symbol || "",
      };
    });

    const series = [
      {
        label: startLabel,
        fullDate: "Start",
        profit: 0,
        delta: 0,
        symbol: "",
      },
      ...points,
    ];

    const scale = computeNiceScale(minP, maxP);
    return { data: series, domain: scale.domain, ticks: scale.ticks };
  }, [trades]);

  const finalProfit = data.length > 0 ? data[data.length - 1].profit : 0;
  const strokeColor =
    finalProfit < 0
      ? isDark
        ? "#F87171"
        : "#DC2626"
      : isDark
      ? "#60A5FA"
      : "#2563EB";
  const gradientId =
    finalProfit < 0 ? "tfEquityLoss" : "tfEquityProfit";

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0].payload;
    return (
      <div
        className={`px-3 py-2 rounded-[10px] border text-[12px] shadow-[0_6px_20px_rgba(15,23,42,0.1)] ${
          isDark
            ? "bg-[#18181B] border-white/10 text-white"
            : "bg-white border-slate-200/90 text-slate-900"
        }`}
      >
        <p className="text-[11px] text-slate-400 font-medium">{pt.fullDate}</p>
        <p className="text-[14px] font-semibold tabular-nums mt-0.5">
          {formatTooltipCurrency(pt.profit, currencySymbol)}
        </p>
        {pt.fullDate !== "Start" && (
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 tabular-nums mt-0.5">
            {pt.symbol ? `${pt.symbol} · ` : ""}
            <span
              className={
                pt.delta >= 0
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-rose-600 dark:text-rose-400 font-medium"
              }
            >
              {formatTooltipCurrency(pt.delta, currencySymbol)}
            </span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="tfEquityProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.11} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tfEquityLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.11} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tfEquityFlat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.08} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
          />

          <ReferenceLine
            y={0}
            stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)"}
            strokeDasharray="2 3"
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={48}
            tick={{
              fill: isDark ? "#71717A" : "#94A3B8",
              fontSize: 11,
              fontWeight: 500,
            }}
            dy={8}
          />

          <YAxis
            domain={domain}
            ticks={ticks}
            axisLine={false}
            tickLine={false}
            width={54}
            tick={{
              fill: isDark ? "#71717A" : "#94A3B8",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
            tickFormatter={(val) => formatAxisCurrency(val, currencySymbol)}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.18)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />

          <Area
            type="linear"
            dataKey="profit"
            stroke={strokeColor}
            strokeWidth={1.75}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 3.5,
              strokeWidth: 2,
              stroke: isDark ? "#17171A" : "#FFFFFF",
              fill: strokeColor,
            }}
            isAnimationActive={true}
            animationDuration={450}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
