import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AnimatedCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const ctrl = animate(count, value, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [value]);

  return <span className={className}>{display}</span>;
}

interface RiskScoreCardProps {
  score: number;
  activeGuardsCount?: number;
}

export function RiskScoreCard({
  score = 0,
  activeGuardsCount = 0,
}: RiskScoreCardProps) {
  const navigate = useNavigate();
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  let statusText = "READY";
  let statusDesc = "Activate guards or log trades to build your live risk score.";
  let accentColor = "#2563EB";
  let badgeClass =
    "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";

  if (clamped >= 80) {
    statusText = "EXCELLENT";
    statusDesc = "Disciplined execution with tight risk adherence.";
    accentColor = "#2563EB";
    badgeClass =
      "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";
  } else if (clamped >= 60) {
    statusText = "GOOD";
    statusDesc = "Consistent risk control across recent sessions.";
    accentColor = "#2563EB";
    badgeClass =
      "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";
  } else if (clamped >= 40) {
    statusText = "MODERATE";
    statusDesc = "Some rule variance detected. Tighten daily caps.";
    accentColor = "#D97706";
    badgeClass =
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  } else if (clamped > 0) {
    statusText = "ELEVATED RISK";
    statusDesc = "High variance detected. Enable drawdown & cooldown guards.";
    accentColor = "#E11D48";
    badgeClass =
      "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400";
  }

  const aiConfidence = clamped > 0 ? 92 : activeGuardsCount > 0 ? 84 : 0;

  // Clean semicircular arc math
  const r = 64;
  const cx = 84;
  const cy = 78;
  const circumference = Math.PI * r;
  const dashOffset = circumference - (circumference * clamped) / 100;

  return (
    <div className="w-full rounded-[18px] p-4 sm:p-5 bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Risk Score
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Live discipline &amp; protection rating
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400" />
          Live
        </span>
      </div>

      {/* Clean Precision Semi-Circular Gauge */}
      <div className="flex flex-col items-center pt-1">
        <div className="relative w-[168px] h-[94px] flex items-end justify-center">
          <svg viewBox="0 0 168 92" className="w-full h-full overflow-visible">
            {/* Track */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className="stroke-slate-100 dark:stroke-white/[0.08]"
            />
            {/* Active Fill */}
            <motion.path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke={accentColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          <div className="absolute bottom-1 flex flex-col items-center">
            <div className="flex items-baseline gap-0.5">
              <AnimatedCounter
                value={clamped}
                className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums"
              />
              <span className="text-[12px] font-medium text-slate-400">/100</span>
            </div>
          </div>
        </div>

        <span
          className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}
        >
          {statusText}
        </span>
        <p className="text-[11.5px] text-slate-400 text-center mt-1.5 leading-snug max-w-[230px]">
          {statusDesc}
        </p>
      </div>

      {/* AI Confidence + Active Rules */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-400">Protection coverage</span>
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums inline-flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#2563EB] dark:text-blue-400" />
            {activeGuardsCount} active · {aiConfidence}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${aiConfidence}%` }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-[#2563EB]"
          />
        </div>
      </div>

      {/* Bottom Action */}
      <button
        type="button"
        onClick={() => navigate("/journal")}
        className="tactile-white-pill w-full h-[36px] rounded-[11px] text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>View Full Analysis</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
}
