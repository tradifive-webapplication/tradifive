import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  FileWarning,
  TrendingDown,
} from "lucide-react";
import BlurText from "@/components/ui/BlurText";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ProblemItem {
  num: string;
  title: string;
  desc: string;
  impact: string;
  statLabel: string;
  statValue: string;
  tag: string;
}

const PROBLEMS: ProblemItem[] = [
  {
    num: "01",
    title: "Revenge trading after one red trade",
    desc: "A clean morning gain unravels in fifteen minutes when impulse re-entries double position size to 'make it back'.",
    impact: "-$1,840 weekly leak",
    statLabel: "POST-LOSS RE-ENTRY",
    statValue: "1.0 -> 4.0 lots",
    tag: "Impulse Escalation",
  },
  {
    num: "02",
    title: "Disconnected spreadsheets & skipped logs",
    desc: "Manual tracking drops emotional exits, bad fills, and late-session leaks — hiding the real reason drawdowns happen.",
    impact: "63% unlogged fills",
    statLabel: "EDGE VISIBILITY",
    statValue: "Blind to leaks",
    tag: "Fragmented Data",
  },
  {
    num: "03",
    title: "No real-time loss circuit breaker",
    desc: "By the time you review trades on Sunday evening, daily loss limits and prop evaluation rules have already been breached.",
    impact: "Blown evaluations",
    statLabel: "DAILY DD BREACH",
    statValue: "-5.2% @ 14:42 NY",
    tag: "Unguarded Capital",
  },
  {
    num: "04",
    title: "Zero objective feedback loop",
    desc: "Without quantified execution scoring, strong strategy edges get abandoned while subtle sizing mistakes repeat unchecked.",
    impact: "2.8x sizing variance",
    statLabel: "EXECUTION DRIFT",
    statValue: "Unchecked",
    tag: "No Audit Memory",
  },
];

function ProblemVisualStage({ active }: { active: number }) {
  if (active === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">EQUITY CURVE · NY SESSION</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300">
            IMPULSE SPIRAL DETECTED
          </span>
        </div>

        {/* Animated Equity Bleed SVG */}
        <div className="rounded-xl bg-[#070B14] border border-white/[0.07] p-3.5">
          <svg viewBox="0 0 420 155" className="w-full h-[145px] overflow-visible">
            <defs>
              <linearGradient id="probBleedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal subtle reference grid */}
            <line x1="0" y1="45" x2="420" y2="45" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="420" y2="90" stroke="rgba(255,255,255,0.1)" />
            <line x1="0" y1="132" x2="420" y2="132" stroke="rgba(244,63,94,0.3)" strokeDasharray="3 4" />

            <text x="4" y="40" fill="#64748B" fontSize="9" fontFamily="monospace">+2.1% PEAK</text>
            <text x="4" y="85" fill="#64748B" fontSize="9" fontFamily="monospace">0.0% BE</text>
            <text x="4" y="145" fill="#FB7185" fontSize="9" fontFamily="monospace">-3.4% MAX DD BREACHED</text>

            {/* Calm profitable morning */}
            <motion.path
              d="M 10 88 C 55 82, 95 58, 155 46 C 180 42, 198 40, 215 44"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
            />

            {/* Sudden crash area */}
            <motion.path
              d="M 215 44 L 245 78 L 270 68 L 302 108 L 332 98 L 372 136 L 408 144 L 408 148 L 215 148 Z"
              fill="url(#probBleedGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            />

            {/* Cascading revenge re-entries */}
            <motion.path
              d="M 215 44 L 245 78 L 270 68 L 302 108 L 332 98 L 372 136 L 408 144"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.45, duration: 0.85, ease: EASE_OUT }}
            />

            {/* Stop out trigger node */}
            <circle cx="215" cy="44" r="4.5" fill="#F43F5E" stroke="#070B14" strokeWidth="2" />
            <circle cx="302" cy="108" r="3.5" fill="#F43F5E" />
            <circle cx="408" cy="144" r="4.5" fill="#F43F5E" />
          </svg>
        </div>

        {/* MT5 Execution Tape */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { time: "09:34", act: "XAUUSD 1.0L", pnl: "+$620", bad: false },
            { time: "09:49", act: "2.0L RE-ENTRY", pnl: "-$910", bad: true },
            { time: "09:56", act: "4.0L TILT", pnl: "-$1,550", bad: true },
          ].map((row) => (
            <div
              key={row.time}
              className={`rounded-lg border px-2.5 py-2 font-mono text-[10.5px] ${
                row.bad
                  ? "bg-rose-500/[0.08] border-rose-500/25"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              <div className="text-[9.5px] text-slate-400">{row.time} NY</div>
              <div className="text-white font-semibold truncate mt-0.5">{row.act}</div>
              <div className={row.bad ? "text-rose-400 font-bold mt-0.5" : "text-emerald-400 font-bold mt-0.5"}>
                {row.pnl}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (active === 1) {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">MANUAL_TRADES_FINAL_V3.XLSX</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
            4 SKIPPED ENTRIES
          </span>
        </div>
        <div className="rounded-xl bg-[#070B14] border border-white/[0.07] overflow-hidden divide-y divide-white/[0.06] font-mono text-[11px]">
          {[
            { pair: "EURUSD", setup: "London Sweep", res: "+1.9R", missing: false },
            { pair: "XAUUSD", setup: "-- not logged --", res: "-2.4R", missing: true },
            { pair: "NAS100", setup: "-- manual exit --", res: "-1.6R", missing: true },
            { pair: "GBPUSD", setup: "OB Retest", res: "+1.4R", missing: false },
          ].map((r, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3.5 py-2.5 ${
                r.missing ? "bg-rose-500/[0.07]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                {r.missing ? (
                  <FileWarning size={13} className="text-rose-400 shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-xs bg-emerald-500/20 border border-emerald-500/40 shrink-0" />
                )}
                <span className="text-white font-semibold">{r.pair}</span>
              </div>
              <span className={r.missing ? "text-rose-300/90 italic" : "text-slate-400"}>
                {r.setup}
              </span>
              <span className={r.missing ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {r.res}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-3.5 py-2.5 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">Reported vs. Actual Expectancy</span>
          <span className="text-rose-400 font-semibold">Overstated by +41%</span>
        </div>
      </div>
    );
  }

  if (active === 2) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">FUNDED EVALUATION · $100K PHASE 1</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/35 text-rose-300">
            BREACHED
          </span>
        </div>

        <div className="rounded-xl bg-[#070B14] border border-white/[0.07] p-4 space-y-4">
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-400">Daily Loss Limit (-3.0% Cap)</span>
              <span className="text-rose-400 font-bold">-5.2% Hit</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: "35%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.07] p-3">
              <div className="text-[10px] font-mono text-slate-400">TIME TO BREACH</div>
              <div className="text-[18px] font-bold text-white mt-0.5 tabular-nums">28 mins</div>
            </div>
            <div className="rounded-lg bg-rose-500/[0.1] border border-rose-500/25 p-3">
              <div className="text-[10px] font-mono text-rose-300">ACCOUNT STATUS</div>
              <div className="text-[15px] font-bold text-rose-400 mt-1">Challenge Failed</div>
            </div>
          </div>
        </div>
        <p className="text-[11.5px] font-mono text-slate-400">
          * Without broker-edge lockouts, one undisciplined session resets weeks of steady evaluation progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">RISK PER TRADE VARIANCE (LAST 6 FILLS)</span>
        <span className="text-rose-300">NO AUDIT SCORE</span>
      </div>
      <div className="rounded-xl bg-[#070B14] border border-white/[0.07] p-4">
        <div className="h-[120px] flex items-end justify-between gap-2.5">
          {[
            { label: "T1", h: 32, pct: "0.5%", ok: true },
            { label: "T2", h: 35, pct: "0.5%", ok: true },
            { label: "T3", h: 78, pct: "1.8%", ok: false },
            { label: "T4", h: 98, pct: "2.4%", ok: false },
            { label: "T5", h: 30, pct: "0.4%", ok: true },
            { label: "T6", h: 86, pct: "2.1%", ok: false },
          ].map((b, i) => (
            <div key={b.label} className="flex-1 flex flex-col items-center h-full justify-end gap-1.5">
              <span className={`text-[9.5px] font-mono ${b.ok ? "text-emerald-400" : "text-rose-400"}`}>
                {b.pct}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${b.h}%` }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                className={`w-full rounded-t-md ${
                  b.ok
                    ? "bg-emerald-500/70 border border-emerald-400/40"
                    : "bg-rose-500/80 border border-rose-400/50"
                }`}
              />
              <span className="text-[9px] font-mono text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-3.5 py-2.5 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">Rule Adherence Index</span>
        <span className="text-rose-400 font-semibold">41 / 100 · Unstable</span>
      </div>
    </div>
  );
}

/* ════════════════
   THE PROBLEM (HIGH-CONTRAST OBSIDIAN STAGE)
════════════════ */
export function ProblemSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PROBLEMS.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [paused]);

  const activeProblem = PROBLEMS[activeIdx];

  return (
    <section
      id="problem"
      className="py-20 sm:py-24 px-4 sm:px-7 relative bg-[#060913] text-white overflow-hidden"
    >
      {/* Architectural Blueprint Dot + Vertical Column Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 140px 140px",
        }}
      />
      {/* Faint Drawdown Contour Curves + Crimson / Indigo Backlighting */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 520"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-45"
      >
        <path
          d="M -60 190 C 240 160, 420 260, 680 230 C 920 205, 1140 360, 1500 320"
          fill="none"
          stroke="rgba(244,63,94,0.18)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <path
          d="M -60 340 C 280 280, 520 390, 820 340 C 1080 295, 1280 410, 1500 390"
          fill="none"
          stroke="rgba(59,130,246,0.14)"
          strokeWidth="1.2"
        />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-[-8%] w-[560px] h-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-[-10%] w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 68%)",
        }}
      />

      <div className="max-w-[1160px] mx-auto relative z-10">
        {/* Top Scroll-Animated Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white/[0.06] border border-white/15 mb-4"
            >
              <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400/35 flex items-center justify-center text-rose-400">
                <AlertTriangle size={11} strokeWidth={2.2} />
              </span>
              <span className="text-[12px] font-semibold tracking-[-0.01em] text-rose-100">
                The problem
              </span>
            </motion.div>

            <h2
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[28px] sm:text-[42px] font-bold tracking-[-0.035em] leading-[1.1] text-white max-w-[680px]"
            >
              <BlurText
                as="span"
                text="Most traders don't lack setups —"
                effect="blur"
                animateBy="words"
                direction="top"
                trigger="view"
                threshold={0.05}
                delay={55}
                stepDuration={0.3}
                blur={8}
                distance={22}
                className="justify-start font-bold tracking-[-0.035em] text-white"
              />
              <BlurText
                as="span"
                text="they lose to unguarded behavior."
                effect="blur"
                animateBy="words"
                direction="top"
                trigger="view"
                threshold={0.05}
                delay={55}
                initialDelay={180}
                stepDuration={0.3}
                blur={8}
                distance={22}
                className="justify-start font-normal tracking-[-0.03em] text-slate-400 mt-1"
              />
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.22, ease: EASE_OUT }}
            className="text-[14.5px] sm:text-[15.5px] font-normal text-slate-400 max-w-[420px] leading-[1.6]"
          >
            Across MT5 retail &amp; prop accounts, over{" "}
            <span className="text-white font-semibold">70% of monthly equity drawdowns</span>{" "}
            occur during unscheduled post-loss sessions. Click any leak to inspect the pattern.
          </motion.p>
        </div>

        {/* Interactive Split Diagnostic Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left: 4 Interactive Behavior Failure Selectors */}
          <div className="lg:col-span-6 flex flex-col gap-2.5">
            {PROBLEMS.map((p, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={p.num}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#111829] border-rose-500/45 shadow-[0_12px_32px_-12px_rgba(244,63,94,0.25)]"
                      : "bg-white/[0.025] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`text-[12px] font-mono font-bold pt-0.5 tabular-nums shrink-0 ${
                        isSelected ? "text-rose-400" : "text-slate-500"
                      }`}
                    >
                      {p.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h3 className="text-[15.5px] font-semibold text-white tracking-[-0.01em]">
                          {p.title}
                        </h3>
                        <span
                          className={`text-[11px] font-mono font-medium shrink-0 ${
                            isSelected ? "text-rose-400" : "text-slate-400"
                          }`}
                        >
                          {p.impact}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-400 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Live Behavioral Autopsy Stage */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0D1322] border border-white/[0.12] p-5 sm:p-6 flex flex-col justify-between shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <TrendingDown size={15} className="text-rose-400" />
                <span className="text-[12px] font-mono font-semibold text-white">
                  Leak {activeProblem.num} · {activeProblem.tag}
                </span>
              </div>
              <span className="text-[11px] font-mono text-rose-300">
                {activeProblem.statValue}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  <ProblemVisualStage active={activeIdx} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-5 mt-5 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <span className="text-[11.5px] font-mono text-slate-400">
                Status: <span className="text-rose-400 font-semibold">Unguarded Account</span>
              </span>
              <a
                href="#solution"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>See how TradiFive stops this</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   THE SOLUTION (INTERACTIVE PROTECTION STAGE + ARCHITECTURAL DECK)
════════════════ */
export function SolutionSection({ onStart }: { onStart: () => void }) {
  const [simulatedLock, setSimulatedLock] = useState(false);

  const donutSize = 74;
  const strokeWidth = 6.5;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - 0.78);

  return (
    <section
      id="solution"
      className="py-20 sm:py-24 px-4 sm:px-7 relative bg-[#F4F6FA] border-y border-[#E4E4E4] overflow-hidden"
    >
      {/* Subtle architectural grid & ascending equity watermark curves on the backside */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-65"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(228,228,228,0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(228,228,228,0.55) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 40%, transparent 100%)",
        }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 520"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-55"
      >
        <path
          d="M -60 410 C 260 390, 480 280, 760 250 C 1020 220, 1220 120, 1500 85"
          fill="none"
          stroke="rgba(16,185,129,0.22)"
          strokeWidth="1.6"
        />
        <path
          d="M -60 450 C 310 420, 560 340, 860 310 C 1100 285, 1300 185, 1500 155"
          fill="none"
          stroke="rgba(37,99,235,0.16)"
          strokeWidth="1.25"
          strokeDasharray="5 6"
        />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-[-6%] w-[460px] h-[460px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-[-6%] w-[480px] h-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-[1160px] mx-auto relative z-10">
        {/* Scroll-Animated Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white border border-[#E4E4E4] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.08)] mb-4"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
                <ShieldCheck size={11} strokeWidth={2.2} />
              </span>
              <span className="text-[12px] font-semibold tracking-[-0.01em] text-slate-900">
                The solution
              </span>
            </motion.div>

            <h2
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[28px] sm:text-[42px] font-bold tracking-[-0.035em] leading-[1.1] text-slate-950 max-w-[660px]"
            >
              <BlurText
                as="span"
                text="One disciplined workspace"
                effect="blur"
                animateBy="words"
                direction="top"
                trigger="view"
                threshold={0.05}
                delay={55}
                stepDuration={0.3}
                blur={8}
                distance={22}
                className="justify-start font-bold tracking-[-0.035em] text-slate-950"
              />
              <BlurText
                as="span"
                text="closing every leak automatically."
                effect="blur"
                animateBy="words"
                direction="top"
                trigger="view"
                threshold={0.05}
                delay={55}
                initialDelay={180}
                stepDuration={0.3}
                blur={8}
                distance={22}
                className="justify-start font-normal tracking-[-0.03em] text-slate-400 mt-1"
              />
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
              className="text-[15px] sm:text-[16px] font-normal text-slate-600 leading-[1.6] mt-4 max-w-[580px]"
            >
              Inside the TradiFive web app, real-time Risk Guard lockouts, broker-verified trade cards, AI debriefs, and P&amp;L telemetry work together automatically.
            </motion.p>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="tactile-blue-pill h-10 px-6 rounded-full text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Open Live Workspace Free</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>

        {/* 2x2 Showcase Box Containing Actual Real Cards From Inside TradiFive Web User App */}
        <div className="rounded-2xl bg-[#E4E4E4]/55 border border-[#E4E4E4] p-3 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* REAL APP CARD 1: Risk Guard Protocol Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                    <Lock size={13.5} className="text-slate-700" />
                    Addresses <strong className="text-slate-800 font-semibold">Revenge trading</strong>
                  </span>
                  <span className="text-[11px] font-mono font-medium text-emerald-700">
                    Auto-arms at cap
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-950 mb-1">
                  Risk Guard Protection Card
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  Live account drawdown shield directly from the TradiFive Risk Guard dashboard.
                </p>

                {/* Embedded Real Web App Card: Risk Guard */}
                <div className="rounded-[16px] bg-[#FAFAFC] border border-[#E4E4E4] p-4 space-y-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          simulatedLock ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-[12.5px] font-semibold text-slate-900">
                        Exness MT5 · Drawdown Shield
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulatedLock((v) => !v)}
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-semibold border transition-colors cursor-pointer ${
                        simulatedLock
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/60"
                      }`}
                    >
                      {simulatedLock ? "LOCKED · 14H" : "ARMED · TEST CAP"}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-slate-500">Daily Loss Buffer (Max -3.0%)</span>
                      <span className={simulatedLock ? "text-rose-600 font-bold" : "text-slate-800 font-semibold"}>
                        {simulatedLock ? "-3.0% Hit ($1,500)" : "-0.4% Used (-$200)"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E4E4E4] overflow-hidden">
                      <motion.div
                        animate={{ width: simulatedLock ? "100%" : "18%" }}
                        transition={{ duration: 0.45, ease: EASE_OUT }}
                        className={`h-full rounded-full ${
                          simulatedLock ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {[
                      { k: "Max Open", v: "5 Trades" },
                      { k: "Streak Stop", v: "2 Losses" },
                      { k: "Action", v: simulatedLock ? "Blocked" : "Enforced" },
                    ].map((stat) => (
                      <div
                        key={stat.k}
                        className="rounded-lg bg-white border border-[#E4E4E4] px-2.5 py-2 text-center"
                      >
                        <div className="text-[10px] text-slate-400">{stat.k}</div>
                        <div
                          className={`text-[11.5px] font-semibold mt-0.5 ${
                            stat.k === "Action" && simulatedLock
                              ? "text-rose-600"
                              : "text-slate-900"
                          }`}
                        >
                          {stat.v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* REAL APP CARD 2: Smart Journal Auto-Sync Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                    <Layers size={13.5} className="text-slate-700" />
                    Addresses <strong className="text-slate-800 font-semibold">Manual spreadsheets</strong>
                  </span>
                  <span className="text-[11px] font-mono font-medium text-emerald-700">
                    100% fill accuracy
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-950 mb-1">
                  Smart Journal Synced Fills
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  Real closed executions synced directly from MetaTrader 5 with R-multiples and setup tags.
                </p>

                {/* Embedded Real Web App Card: Recent Fills Table */}
                <div className="rounded-[16px] bg-[#FAFAFC] border border-[#E4E4E4] overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="px-4 py-2.5 bg-white border-b border-[#E4E4E4] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-700 font-semibold">MT5 Bridge · Verified Fills</span>
                    <span className="text-emerald-600 font-medium">4ms Auto-Sync</span>
                  </div>
                  <div className="divide-y divide-[#E4E4E4]/80 text-[12px]">
                    {[
                      { pair: "XAU/USD", side: "BUY 1.25L", setup: "NY Open Sweep", rr: "+2.4R", pnl: "+$1,480", win: true },
                      { pair: "EUR/USD", side: "SELL 2.00L", setup: "London OB", rr: "+1.8R", pnl: "+$960", win: true },
                      { pair: "NAS100", side: "BUY 0.50L", setup: "FVG Retest", rr: "-1.0R", pnl: "-$310", win: false },
                    ].map((row) => (
                      <div
                        key={row.pair}
                        className="px-4 py-2.5 flex items-center justify-between gap-2 bg-white/75"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                              row.win
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : "bg-rose-50 text-rose-600 border border-rose-200/80"
                            }`}
                          >
                            {row.rr}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {row.pair}{" "}
                              <span className="text-[11px] font-normal text-slate-400">
                                · {row.side}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-500 truncate">{row.setup}</div>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold tabular-nums shrink-0 ${
                            row.win ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {row.pnl}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* REAL APP CARD 3: Pre-Market Plan + AI Session Debrief Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                    <Sparkles size={13.5} className="text-slate-700" />
                    Addresses <strong className="text-slate-800 font-semibold">Delayed feedback</strong>
                  </span>
                  <span className="text-[11px] font-mono font-medium text-emerald-700">
                    Real-time pattern memory
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-950 mb-1">
                  TradiFive AI Debrief &amp; Plan
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  Authentic pre-market checklist &amp; AI behavioral coach widget inside your daily dashboard.
                </p>

                {/* Embedded Real Web App Card: Pre-Market Plan + AI Coach */}
                <div className="space-y-2.5">
                  <div className="rounded-[15px] bg-white border border-[#E4E4E4] px-4 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span>
                        Pre-market plan active ·{" "}
                        <span className="text-slate-500 font-medium">Bullish bias</span>
                      </span>
                    </span>
                    <ArrowRight size={13} className="text-slate-400" />
                  </div>

                  <div className="rounded-[16px] bg-[#FAFAFC] border border-[#E4E4E4] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB]">
                        <Sparkles size={12.5} />
                        TradiFive AI · Session Debrief
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-400">NY Session</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-700">
                      &ldquo;Your discipline held at <strong className="text-slate-950">94/100</strong> this week.
                      Sticking to the first 2 NY Open setups generated{" "}
                      <strong className="text-emerald-700">+89% of monthly gains</strong> with zero revenge fills.&rdquo;
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-[#E4E4E4]/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Focus: Hold winners to 2.0R</span>
                      <span className="font-mono font-semibold text-emerald-700">14-day streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* REAL APP CARD 4: Net Cumulative P&L + Win Rate Ring + 3-Metric Row (Exact Dashboard.tsx Hero Card) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                    <CheckCircle2 size={13.5} className="text-slate-700" />
                    Addresses <strong className="text-slate-800 font-semibold">Inconsistent scaling</strong>
                  </span>
                  <span className="text-[11px] font-mono font-medium text-emerald-700">
                    Scale on verified proof
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-950 mb-1">
                  Net P&amp;L &amp; Edge Telemetry
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  Live win-rate donut, cumulative P&amp;L, and RR telemetry straight from the user dashboard.
                </p>

                {/* Embedded Real Web App Card: Exact Dashboard.tsx Top Metrics */}
                <div className="space-y-2.5">
                  <div className="rounded-[16px] bg-[#FAFAFC] border border-[#E4E4E4] p-4 flex items-center justify-between gap-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">Net Cumulative P&amp;L</div>
                      <div className="text-[26px] font-bold text-slate-950 tracking-[-0.03em] tabular-nums leading-tight mt-0.5">
                        +$8,420.50
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-white border border-[#E4E4E4] font-semibold text-slate-800 tabular-nums">
                          14W / 4L
                        </span>
                        <span className="text-slate-500 font-medium tabular-nums">18 closed trades</span>
                      </div>
                    </div>

                    <div className="relative w-[74px] h-[74px] shrink-0">
                      <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`} className="-rotate-90">
                        <circle
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          fill="none"
                          stroke="#E4E4E4"
                          strokeWidth={strokeWidth}
                        />
                        <motion.circle
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          whileInView={{ strokeDashoffset: dashOffset }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: EASE_OUT }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[13.5px] font-bold text-slate-950 leading-none tabular-nums">
                          78%
                        </span>
                        <span className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                          Win
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Avg RR", value: "2.15R" },
                      { label: "Profit Factor", value: "2.48" },
                      { label: "Avg W / L", value: "$740 / $290" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-[12px] bg-white border border-[#E4E4E4] px-2.5 py-2.5 text-center shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
                      >
                        <div className="text-[10px] font-medium text-slate-400">{m.label}</div>
                        <div className="text-[13px] font-bold text-slate-900 mt-0.5 tabular-nums truncate">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
