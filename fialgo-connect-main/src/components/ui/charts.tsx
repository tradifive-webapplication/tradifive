import React from "react";
import { Cpu } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface GaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  centerValue?: number | string;
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
  className?: string;
}

// Multi-stop color interpolation helper
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
  className = "",
  ...props
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const activeCount = Math.round((clampedValue / 100) * totalNotches);

  // SVG Geometry
  const cx = 150;
  const cy = 135;
  const rInner = 76;
  const rOuter = 108;
  const strokeW = notchCornerRadius ? notchCornerRadius * 1.8 : 5.4;

  // Build gradient stops
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

  // Generate notches
  const notches = Array.from({ length: totalNotches }, (_, idx) => {
    const stepRatio = totalNotches > 1 ? idx / (totalNotches - 1) : 0;
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
        className="w-full max-w-[280px] h-auto overflow-visible"
        viewBox="0 0 300 160"
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

      {/* Center Value and Label inside Semicircle Arch */}
      <div className="absolute top-[82px] flex flex-col items-center text-center pointer-events-none">
        <div className="text-3xl sm:text-[34px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
          {displayCenter}
        </div>
        {defaultLabel && (
          <div className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-neutral-400">
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

export default Gauge;
