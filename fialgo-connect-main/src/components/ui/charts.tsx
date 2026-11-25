import React, { createContext, useContext, useState, useMemo } from "react";
import { Cpu, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* =========================================================================
   1. GAUGE COMPONENT (NOTCH-BASED SEMICIRCLE)
========================================================================= */

export interface GaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  centerValue?: React.ReactNode;
  defaultLabel?: string;
  startAngle?: number;
  endAngle?: number;
  totalNotches?: number;
  notchCornerRadius?: number;
  suffix?: string;
  useGradient?: boolean;
  gradientColors?: string[];
  inactiveColor?: string;
  ariaLabel?: string;
  orientation?: "arc" | "linear";
  compact?: boolean;
  className?: string;
}

function interpolateGradient(t: number, stops: [number, string][]): string {
  if (t <= stops[0][0]) return stops[0][1];
  if (t >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];

  let i = 0;
  while (i < stops.length - 1 && stops[i + 1][0] < t) {
    i++;
  }

  const [t0, c0] = stops[i];
  const [t1, c1] = stops[i + 1];
  const ratio = (t - t0) / (t1 - t0);

  const parseHex = (hex: string) => {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  };

  const [r0, g0, b0] = parseHex(c0);
  const [r1, g1, b1] = parseHex(c1);

  const r = Math.round(r0 + (r1 - r0) * ratio);
  const g = Math.round(g0 + (g1 - g0) * ratio);
  const b = Math.round(b0 + (b1 - b0) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  centerValue,
  defaultLabel,
  startAngle = 180,
  endAngle = 360,
  totalNotches = 36,
  notchCornerRadius = 3,
  suffix = "%",
  useGradient = true,
  gradientColors = ["#60A5FA", "#2563EB", "#0031F2"],
  inactiveColor,
  ariaLabel = "Gauge",
  compact = false,
  className = "",
  ...props
}) => {
  const effectiveNotches = compact && totalNotches === 36 ? 28 : totalNotches;
  const clampedValue = Math.max(0, Math.min(100, value));
  const activeCount = Math.round((clampedValue / 100) * effectiveNotches);

  // SVG Geometry
  const cx = 150;
  const cy = 135;
  const rInner = 76;
  const rOuter = 108;
  const baseRadius = compact ? Math.max(notchCornerRadius, 3.6) : notchCornerRadius;
  const strokeW = baseRadius ? baseRadius * 1.8 : 5.4;

  const stops: [number, string][] =
    gradientColors.length === 2
      ? [
          [0, gradientColors[0]],
          [1, gradientColors[1]],
        ]
      : [
          [0, gradientColors[0]],
          [0.5, gradientColors[1]],
          [1, gradientColors[2] || gradientColors[1]],
        ];

  const notches = Array.from({ length: effectiveNotches }, (_, idx) => {
    const stepRatio = effectiveNotches > 1 ? idx / (effectiveNotches - 1) : 0;
    const angleDeg = startAngle + stepRatio * (endAngle - startAngle);
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);

    const isActive = idx < activeCount;
    const color = isActive
      ? useGradient
        ? interpolateGradient(stepRatio, stops)
        : gradientColors[1] || "#006DFE"
      : undefined;

    return {
      idx,
      x1: x1.toFixed(2),
      y1: y1.toFixed(2),
      x2: x2.toFixed(2),
      y2: y2.toFixed(2),
      isActive,
      color,
    };
  });

  const displayCenter =
    centerValue !== undefined
      ? centerValue
      : `${Math.round(clampedValue)}${suffix}`;

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      {...props}
    >
      <svg
        className={`w-full h-auto overflow-visible ${
          compact ? "max-w-[154px]" : "max-w-[280px]"
        }`}
        viewBox="0 0 300 154"
      >
        <g>
          {notches.map((notch) => (
            <line
              key={notch.idx}
              x1={notch.x1}
              y1={notch.y1}
              x2={notch.x2}
              y2={notch.y2}
              stroke={
                notch.isActive
                  ? notch.color
                  : inactiveColor || "currentColor"
              }
              className={
                !notch.isActive && !inactiveColor
                  ? "text-slate-200 dark:text-[#181C26]"
                  : ""
              }
              strokeWidth={strokeW}
              strokeLinecap="round"
              style={{
                transition: "stroke 0.3s ease, opacity 0.3s ease",
              }}
            />
          ))}
        </g>
      </svg>

      <div
        className={`absolute flex flex-col items-center text-center pointer-events-none ${
          compact ? "top-[42px]" : "top-[82px]"
        }`}
      >
        <div
          className={`font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-none ${
            compact ? "text-[17px]" : "text-3xl sm:text-[34px]"
          }`}
        >
          {displayCenter}
        </div>
        {defaultLabel && (
          <div
            className={`font-semibold text-slate-400 dark:text-neutral-400 ${
              compact ? "mt-0.5 text-[9.5px]" : "mt-1 text-[11px]"
            }`}
          >
            {defaultLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChartGaugeSemicircle = ({ value = 64 }: { value?: number }) => (
  <Card>
    <CardHeader>
      <CardTitle>Gauge - Semicircle</CardTitle>
      <CardDescription>Cluster CPU load, last 5 minutes</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mx-auto w-full max-w-sm">
        <Gauge
          ariaLabel="Gauge - Semicircle"
          centerValue={`${value}%`}
          defaultLabel="CPU load"
          endAngle={360}
          notchCornerRadius={3}
          startAngle={180}
          suffix="%"
          useGradient
          value={value}
        />
      </div>
    </CardContent>
    <CardFooter className="flex-col items-start gap-2 text-sm">
      <div className="flex gap-2 font-medium leading-none">
        Within the 80% autoscale threshold{" "}
        <Cpu aria-hidden="true" className="size-4" />
      </div>
      <div className="text-muted-foreground leading-none">
        Average across 12 nodes in eu-west-1
      </div>
    </CardFooter>
  </Card>
);

/* =========================================================================
   2. AREA CHART SYSTEM (BKLIT UI / SHADCN SPECIFICATION)
   - AreaChart
   - Grid
   - Area (supports dataKey, fadeEdges, fillOpacity, gradientToOpacity, showLine)
   - XAxis
   - ChartTooltip
========================================================================= */

interface ChartContextType {
  data: any[];
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  hoverIndex: number | null;
  setHoverIndex: (idx: number | null) => void;
  hoverCoords: { x: number; y: number } | null;
  setHoverCoords: (coords: { x: number; y: number } | null) => void;
  activeDataKey: string;
  setActiveDataKey: (key: string) => void;
}

const ChartContext = createContext<ChartContextType | null>(null);

export interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  aspectRatio?: string;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data = [],
  aspectRatio = "2 / 1",
  ariaLabel = "Area Chart",
  className = "",
  children,
  ...props
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [activeDataKey, setActiveDataKey] = useState<string>("value");

  // Chart internal coordinate space
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 24, bottom: 40, left: 24 };

  const contextValue = useMemo<ChartContextType>(
    () => ({
      data,
      width,
      height,
      padding,
      hoverIndex,
      setHoverIndex,
      hoverCoords,
      setHoverCoords,
      activeDataKey,
      setActiveDataKey,
    }),
    [data, hoverIndex, hoverCoords, activeDataKey]
  );

  return (
    <ChartContext.Provider value={contextValue}>
      <div
        role="region"
        aria-label={ariaLabel}
        style={aspectRatio && aspectRatio !== "auto" ? { aspectRatio, ...props.style } : props.style}
        className={`relative w-full overflow-hidden select-none ${className}`}
        {...props}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {children}
        </svg>
      </div>
    </ChartContext.Provider>
  );
};

export interface GridProps {
  horizontal?: boolean;
  vertical?: boolean;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  horizontal = true,
  vertical = false,
  className = "text-slate-200 dark:text-white/[0.07]",
}) => {
  const ctx = useContext(ChartContext);
  if (!ctx) return null;
  const { width, height, padding } = ctx;

  const yStops = [
    padding.top,
    padding.top + (height - padding.top - padding.bottom) * 0.33,
    padding.top + (height - padding.top - padding.bottom) * 0.66,
    height - padding.bottom,
  ];

  return (
    <g className={className} stroke="currentColor" strokeDasharray="3 3">
      {horizontal &&
        yStops.map((y, idx) => (
          <line
            key={`h-${idx}`}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            strokeWidth="1"
          />
        ))}
    </g>
  );
};

export interface AreaProps {
  dataKey: string;
  label?: string;
  fadeEdges?: boolean | "left" | "right";
  fillOpacity?: number;
  gradientToOpacity?: number;
  showLine?: boolean;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
}

export const Area: React.FC<AreaProps> = ({
  dataKey,
  fadeEdges = false,
  fillOpacity = 0.6,
  gradientToOpacity = 0.05,
  showLine = true,
  strokeColor = "#006DFE",
  fillColor = "#006DFE",
}) => {
  const ctx = useContext(ChartContext);
  if (!ctx) return null;
  const { data, width, height, padding, setHoverIndex, setHoverCoords } = ctx;

  const values = data.map((d) => Number(d[dataKey] ?? 0));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Build coordinate points
  const points = data.map((d, idx) => {
    const val = Number(d[dataKey] ?? 0);
    const x = padding.left + (idx / Math.max(1, data.length - 1)) * plotW;
    const y = height - padding.bottom - ((val - minVal) / range) * plotH;
    return { x, y, data: d, index: idx };
  });

  // Build smooth cubic bezier path
  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath += ` C ${cpX.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
  }

  const baselineY = height - padding.bottom;
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`
      : "";

  const uniqueId = React.useId().replace(/:/g, "");
  const gradientId = `areaGrad-${uniqueId}`;
  const maskId = `fadeMask-${uniqueId}`;

  return (
    <g>
      <defs>
        {/* Vertical gradient: from fillOpacity down to gradientToOpacity */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={gradientToOpacity} />
        </linearGradient>

        {/* Edge Fade Mask (when fadeEdges is active) */}
        {fadeEdges && (
          <mask id={maskId}>
            <linearGradient id={`edgeGrad-${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="black" />
              <stop offset="8%" stopColor="white" />
              <stop offset="92%" stopColor="white" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <rect x="0" y="0" width={width} height={height} fill={`url(#edgeGrad-${uniqueId})`} />
          </mask>
        )}
      </defs>

      {/* Filled Area with optional fadeEdges mask */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        mask={fadeEdges ? `url(#${maskId})` : undefined}
      />

      {/* Top Stroke Line (hidden when showLine={false}) */}
      {showLine && (
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          mask={fadeEdges ? `url(#${maskId})` : undefined}
        />
      )}


      {/* Invisible Interactive Hit Slices */}
      {points.map((pt, idx) => {
        const sliceW = plotW / points.length;
        return (
          <rect
            key={idx}
            x={pt.x - sliceW / 2}
            y={padding.top}
            width={sliceW}
            height={plotH}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => {
              setHoverIndex(idx);
              setHoverCoords({ x: pt.x, y: pt.y });
            }}
            onMouseLeave={() => {
              setHoverIndex(null);
              setHoverCoords(null);
            }}
          />
        );
      })}
    </g>
  );
};

export interface XAxisProps {
  dataKey?: string;
  format?: (val: any) => string;
  className?: string;
  minSpacing?: number;
}

export const XAxis: React.FC<XAxisProps> = ({
  dataKey = "date",
  format,
  className = "fill-slate-400 dark:fill-neutral-500 text-[11px] font-medium",
  minSpacing = 48,
}) => {
  const ctx = useContext(ChartContext);
  if (!ctx) return null;
  const { data, width, height, padding } = ctx;

  const plotW = width - padding.left - padding.right;

  // Format all items first
  const formattedItems = data.map((d, idx) => {
    const raw = d[dataKey];
    let label = "";
    if (raw instanceof Date) {
      label = raw.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (typeof raw === "string") {
      label = raw;
    } else {
      label = String(raw);
    }
    if (format) label = format(raw);
    const x = padding.left + (idx / Math.max(1, data.length - 1)) * plotW;
    return { x, label, idx };
  });

  // Calculate ticks: ensure no duplicates and minimum spacing
  const ticks: { x: number; label: string }[] = [];
  const lastItem = formattedItems[formattedItems.length - 1];
  let lastPlacedX = -999;
  let lastPlacedLabel = "";

  formattedItems.forEach((item, i) => {
    const isLast = i === formattedItems.length - 1;

    // Never repeat the same label consecutively
    if (item.label === lastPlacedLabel) return;

    // If this is too close to the previous placed tick, skip (unless it's the last one)
    if (item.x - lastPlacedX < minSpacing && !isLast) return;

    // If this non-last item is too close to the last item, skip it to protect the last tick's spacing
    if (!isLast && lastItem && (lastItem.x - item.x < minSpacing || lastItem.label === item.label)) {
      return;
    }

    ticks.push({ x: item.x, label: item.label });
    lastPlacedX = item.x;
    lastPlacedLabel = item.label;
  });

  return (
    <g className={className}>
      {ticks.map((t, idx) => (
        <text
          key={`tick-${idx}`}
          x={t.x}
          y={height - padding.bottom + 22}
          textAnchor="middle"
          className="select-none fill-slate-400 dark:fill-neutral-500 text-[11px] font-medium"
        >
          {t.label}
        </text>
      ))}
    </g>
  );
};

export interface ChartTooltipProps {
  className?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = () => {
  const ctx = useContext(ChartContext);
  if (!ctx || ctx.hoverIndex === null || !ctx.hoverCoords) return null;
  const { data, height, padding, hoverIndex, hoverCoords } = ctx;

  const item = data[hoverIndex];
  if (!item) return null;

  const rawDate = item.date;
  const dateStr =
    rawDate instanceof Date
      ? rawDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : String(rawDate);

  const scoreVal = item.score !== undefined ? `${item.score}%` : null;
  const equityVal = item.equity || null;
  const tradesVal = item.trades ? `${item.trades} trades` : null;

  return (
    <g className="pointer-events-none">
      {/* Vertical Crosshair Line */}
      <line
        x1={hoverCoords.x}
        y1={padding.top}
        x2={hoverCoords.x}
        y2={height - padding.bottom}
        stroke="#006DFE"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      {/* Hover Center Point with glow */}
      <circle cx={hoverCoords.x} cy={hoverCoords.y} r="6.5" fill="#38BDF8" opacity="0.3" />
      <circle cx={hoverCoords.x} cy={hoverCoords.y} r="4" fill="#FFFFFF" stroke="#006DFE" strokeWidth="2.5" />

      {/* Floating Tooltip Box */}
      <foreignObject
        x={Math.max(padding.left, Math.min(hoverCoords.x - 72, width - padding.right - 150))}
        y={Math.max(6, hoverCoords.y - 68)}
        width="145"
        height="64"
      >
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#121826]/95 backdrop-blur-md text-white border border-white/10 shadow-2xl space-y-0.5 select-none">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
            <span>{dateStr}</span>
            {tradesVal && <span className="text-[9.5px] text-slate-400 font-medium">{tradesVal}</span>}
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {scoreVal && (
              <span className="text-xs font-mono font-black text-[#38BDF8]">
                Score: {scoreVal}
              </span>
            )}
            {equityVal && (
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                {equityVal}
              </span>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

/* =========================================================================
   3. CHART AREA FILL EXPORT (USER SNIPPET READY)
========================================================================= */

const sampleVisitorsData = [
  { date: new Date(2026, 7, 1), visitors: 2260 },
  { date: new Date(2026, 7, 2), visitors: 2520 },
  { date: new Date(2026, 7, 3), visitors: 3230 },
  { date: new Date(2026, 7, 4), visitors: 3240 },
  { date: new Date(2026, 7, 5), visitors: 3400 },
  { date: new Date(2026, 7, 6), visitors: 3380 },
  { date: new Date(2026, 7, 7), visitors: 3350 },
  { date: new Date(2026, 7, 8), visitors: 2600 },
  { date: new Date(2026, 7, 9), visitors: 2620 },
  { date: new Date(2026, 7, 10), visitors: 3490 },
  { date: new Date(2026, 7, 11), visitors: 3560 },
  { date: new Date(2026, 7, 12), visitors: 3570 },
  { date: new Date(2026, 7, 13), visitors: 3650 },
  { date: new Date(2026, 7, 14), visitors: 3520 },
  { date: new Date(2026, 7, 15), visitors: 2650 },
  { date: new Date(2026, 7, 16), visitors: 2750 },
  { date: new Date(2026, 7, 17), visitors: 3730 },
  { date: new Date(2026, 7, 18), visitors: 3590 },
  { date: new Date(2026, 7, 19), visitors: 3780 },
  { date: new Date(2026, 7, 20), visitors: 3750 },
  { date: new Date(2026, 7, 21), visitors: 3900 },
  { date: new Date(2026, 7, 22), visitors: 2900 },
  { date: new Date(2026, 7, 23), visitors: 2750 },
  { date: new Date(2026, 7, 24), visitors: 3880 },
  { date: new Date(2026, 7, 25), visitors: 4010 },
  { date: new Date(2026, 7, 26), visitors: 3980 },
  { date: new Date(2026, 7, 27), visitors: 3990 },
  { date: new Date(2026, 7, 28), visitors: 4000 },
  { date: new Date(2026, 7, 29), visitors: 3080 },
  { date: new Date(2026, 7, 30), visitors: 3100 },
  { date: new Date(2026, 7, 31), visitors: 4030 },
];

export const ChartAreaFill = ({ data = sampleVisitorsData }: { data?: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Area Chart - Fill</CardTitle>
      <CardDescription>Daily visitors, August 2026</CardDescription>
    </CardHeader>
    <CardContent>
      <AreaChart
        ariaLabel="Area Chart - Fill"
        aspectRatio="2 / 1"
        data={data}
      >
        <Grid horizontal />
        <Area
          dataKey="visitors"
          fadeEdges
          fillOpacity={0.6}
          gradientToOpacity={0.05}
          label="Visitors"
          showLine={false}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </CardContent>
    <CardFooter className="flex-col items-start gap-2 text-sm">
      <div className="flex gap-2 font-medium leading-none">
        Weekday visitors up 25% since August 3{" "}
        <TrendingUp aria-hidden="true" className="size-4" />
      </div>
      <div className="text-muted-foreground leading-none">
        Weekends dip to about three quarters of weekday traffic
      </div>
    </CardFooter>
  </Card>
);

export default Gauge;
