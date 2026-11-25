import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Gauge } from "@/components/ui/charts";

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

interface MiniRingProps {
  label: string;
  active: number;
  total: number;
  colorClass: string;
}

function MiniCircularRing({ label, active, total, colorClass }: MiniRingProps) {
  const pct = total > 0 ? Math.min(100, Math.round((active / total) * 100)) : 0;

  return (
    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
      <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-200/80 dark:text-white/[0.08]"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className={colorClass}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${pct}, 100` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-slate-800 dark:text-white tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="text-center leading-tight">
        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
          {label}
        </p>
        <p className="text-[9.5px] font-medium text-slate-400 tabular-nums">
          {active}/{total}
        </p>
      </div>
    </div>
  );
}

interface RiskScoreCardProps {
  score: number;
  activeGuardsCount?: number;
  categoryCounts?: {
    trading_control: number;
    risk_management: number;
    behaviour: number;
  };
}

export function RiskScoreCard({
  score = 0,
  activeGuardsCount = 0,
  categoryCounts = { trading_control: 0, risk_management: 0, behaviour: 0 },
}: RiskScoreCardProps) {
  const navigate = useNavigate();

  // Combine trade discipline score with active guard armor rating if no trades yet
  const armorScore = Math.min(100, Math.round((activeGuardsCount / 8) * 100));
  const effectiveScore = score > 0 ? Math.round(score) : armorScore;
  const clamped = Math.max(0, Math.min(100, effectiveScore));

  let statusText = "READY";
  let statusDesc = "Activate guards or log trades to build your live risk score.";
  let gradientColors = ["#60A5FA", "#2563EB", "#0031F2"];
  let badgeClass =
    "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";

  if (clamped >= 80) {
    statusText = "EXCELLENT";
    statusDesc = "Disciplined execution with tight risk adherence.";
    gradientColors = ["#34D399", "#10B981", "#059669"];
    badgeClass =
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
  } else if (clamped >= 60) {
    statusText = "STRONG";
    statusDesc = "Consistent risk control across active guards.";
    gradientColors = ["#60A5FA", "#2563EB", "#0031F2"];
    badgeClass =
      "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";
  } else if (clamped >= 35) {
    statusText = "MODERATE";
    statusDesc = "Good foundation. Enable more drawdown & discipline rules.";
    gradientColors = ["#FBBF24", "#F59E0B", "#D97706"];
    badgeClass =
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  } else if (clamped > 0) {
    statusText = "LOW ARMOR";
    statusDesc = "Enable drawdown & cooldown guards to harden your account.";
    gradientColors = ["#FB7185", "#F43F5E", "#E11D48"];
    badgeClass =
      "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400";
  }

  const coveragePct = Math.min(100, Math.round((activeGuardsCount / 24) * 100));

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
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Notched Gradient Semicircular Gauge (Matching Rewards Page) */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-full max-w-[210px] mx-auto">
          <Gauge
            ariaLabel="Risk Score Gauge"
            centerValue={<AnimatedCounter value={clamped} />}
            defaultLabel="/100 Rating"
            startAngle={180}
            endAngle={360}
            notchCornerRadius={3}
            useGradient
            gradientColors={gradientColors}
            value={clamped}
          />
        </div>

        <span
          className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}
        >
          {statusText}
        </span>
        <p className="text-[11.5px] text-slate-400 text-center mt-1.5 leading-snug max-w-[230px]">
          {statusDesc}
        </p>
      </div>

      {/* 3 Circular Ring Breakdown Charts */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <MiniCircularRing
          label="Control"
          active={categoryCounts.trading_control}
          total={5}
          colorClass="text-[#2563EB]"
        />
        <MiniCircularRing
          label="Limits"
          active={categoryCounts.risk_management}
          total={8}
          colorClass="text-emerald-500"
        />
        <MiniCircularRing
          label="Mindset"
          active={categoryCounts.behaviour}
          total={11}
          colorClass="text-amber-500"
        />
      </div>

      {/* Horizontal 3D Striped Protection Bar */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-400">Protection coverage</span>
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums inline-flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#2563EB] dark:text-blue-400" />
            {activeGuardsCount} active · {coveragePct}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.08] p-[1px] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(4, coveragePct)}%` }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background:
                "repeating-linear-gradient(45deg, #0031F2 0 14px, #006DFE 14px 28px)",
            }}
            className="uiverse-stripe-bar h-full rounded-full"
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
