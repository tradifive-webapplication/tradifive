import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  Activity,
  FileWarning,
  TrendingDown,
  Zap,
  RotateCcw,
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
      className="py-20 sm:py-24 px-4 sm:px-7 relative bg-[#070B14] text-white overflow-hidden"
    >
      {/* Subtle architectural dark grid + radial depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,0.16) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 65%)",
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
const SOLUTIONS = [
  {
    icon: Lock,
    problemRef: "Revenge trading",
    title: "Hard Cooldown Circuit Breaker",
    desc: "When daily loss or drawdown limits trigger, Risk Guard locks execution automatically so one red trade never compounds.",
    metric: "Auto-arms at cap",
    eventTitle: "Order Blocked · 4.0L XAUUSD",
    eventSub: "Daily limit -1.5% reached · 14h cooldown locked",
  },
  {
    icon: Layers,
    problemRef: "Manual spreadsheets",
    title: "Instant Broker-Verified Journal",
    desc: "Every MT5 position streams directly into structured setup, R-multiple, and MAE/MFE attribution with zero typing.",
    metric: "100% fill accuracy",
    eventTitle: "MT5 Auto-Synced · +1.8R",
    eventSub: "Entry, SL, TP, and session context saved in 4ms",
  },
  {
    icon: Sparkles,
    problemRef: "Delayed feedback",
    title: "Live Behavioral AI Coaching",
    desc: "Detect tilt windows, post-loss risk spikes, and session edges early — with plain-English pre-session guardrails.",
    metric: "Real-time memory",
    eventTitle: "AI Alert · NY Open Edge",
    eventSub: "First 2 trades generate +89% of your monthly P&L",
  },
  {
    icon: CheckCircle2,
    problemRef: "Inconsistent scaling",
    title: "Unified TradiFive Discipline Score",
    desc: "Benchmark win rate, profit factor, consistency, and rule adherence in one live score ready for prop desks.",
    metric: "Scale on proof",
    eventTitle: "Discipline Score · 96/100",
    eventSub: "14 consecutive clean days · Verified MT5 equity",
  },
];

export function SolutionSection({ onStart }: { onStart: () => void }) {
  const [selectedSol, setSelectedSol] = useState(0);
  const [shieldSimulated, setShieldSimulated] = useState(true);

  const activeSol = SOLUTIONS[selectedSol];

  return (
    <section
      id="solution"
      className="py-20 sm:py-24 px-4 sm:px-7 relative bg-[#F5F6F8] border-y border-[#E4E4E4]"
    >
      <div className="max-w-[1160px] mx-auto">
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
              TradiFive enforces your rules at the broker edge, logs every execution automatically, and shields hard-won gains.
            </motion.p>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="tactile-blue-pill h-10 px-6 rounded-full text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Experience the Solution Free</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>

        {/* Unified White + #E4E4E4 Architectural Solution Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Live Interactive Protection Simulator */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-[#E4E4E4] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_38px_-18px_rgba(15,23,42,0.1)]">
            <div>
              {/* Mode Toggle Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E4E4E4]">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-[#2563EB]" />
                  <span className="text-[12.5px] font-semibold text-slate-900">
                    Equity Curve Impact
                  </span>
                </div>

                <div className="inline-flex items-center p-0.5 rounded-full bg-[#F5F6F8] border border-[#E4E4E4]">
                  <button
                    type="button"
                    onClick={() => setShieldSimulated(false)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      !shieldSimulated
                        ? "bg-white text-rose-600 border border-[#E4E4E4] shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Unguarded
                  </button>
                  <button
                    type="button"
                    onClick={() => setShieldSimulated(true)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      shieldSimulated
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    TradiFive Protected
                  </button>
                </div>
              </div>

              {/* Dual Contrast SVG Curve */}
              <div className="rounded-xl bg-[#FAFAFB] border border-[#E4E4E4] p-3.5 mb-4">
                <svg viewBox="0 0 420 165" className="w-full h-[155px] overflow-visible">
                  <defs>
                    <linearGradient id="solSafeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="50" x2="420" y2="50" stroke="#E4E4E4" strokeDasharray="3 4" />
                  <line x1="0" y1="95" x2="420" y2="95" stroke="#E4E4E4" />
                  <line x1="0" y1="120" x2="420" y2="120" stroke="#93C5FD" strokeDasharray="4 4" />

                  <text x="4" y="44" fill="#059669" fontSize="9" fontFamily="monospace">+6.8% PROTECTED</text>
                  <text x="4" y="114" fill="#2563EB" fontSize="9" fontFamily="monospace">-1.5% GUARD FLOOR</text>

                  {/* Baseline crashed unguarded path (always subtle reference, bold if Unguarded active) */}
                  <motion.path
                    d="M 12 95 C 55 88, 95 66, 145 58 C 165 56, 175 112, 195 118 L 245 104 L 305 144 L 406 154"
                    fill="none"
                    stroke={shieldSimulated ? "#CBD5E1" : "#E11D48"}
                    strokeWidth={shieldSimulated ? "1.6" : "2.5"}
                    strokeDasharray={shieldSimulated ? "4 4" : "0"}
                    animate={{ opacity: shieldSimulated ? 0.8 : 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* TradiFive Protected Equity Curve */}
                  {shieldSimulated && (
                    <>
                      <motion.path
                        d="M 12 95 C 55 88, 95 66, 145 58 L 185 116 L 235 116 C 285 95, 340 58, 406 38 L 406 155 L 12 155 Z"
                        fill="url(#solSafeGrad)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.path
                        d="M 12 95 C 55 88, 95 66, 145 58 L 185 116 L 235 116 C 285 95, 340 58, 406 38"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.85, ease: EASE_OUT }}
                      />
                      {/* Flat Cooldown Highlight Pill on chart */}
                      <rect x="184" y="109" width="52" height="14" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
                      <text x="210" y="119" textAnchor="middle" fill="#1D4ED8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                        LOCKED
                      </text>
                      <circle cx="406" cy="38" r="4.5" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Live Active Intercept / Sync Readout */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedSol}-${shieldSimulated}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 ${
                  shieldSimulated
                    ? "bg-emerald-50/60 border-emerald-200"
                    : "bg-rose-50/70 border-rose-200"
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`text-[12.5px] font-semibold truncate ${
                      shieldSimulated ? "text-emerald-900" : "text-rose-900"
                    }`}
                  >
                    {shieldSimulated
                      ? activeSol.eventTitle
                      : "Protection Disabled · Drawdown Uncapped"}
                  </div>
                  <div
                    className={`text-[11.5px] truncate mt-0.5 ${
                      shieldSimulated ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {shieldSimulated
                      ? activeSol.eventSub
                      : "Switch back to TradiFive Protected to preview automated Risk Guard lock."}
                  </div>
                </div>
                {!shieldSimulated ? (
                  <button
                    type="button"
                    onClick={() => setShieldSimulated(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-rose-200 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 shrink-0 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Arm Guard</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[11px] font-mono font-semibold text-emerald-700 shrink-0">
                    <Zap size={11} />
                    <span>ACTIVE</span>
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: 4 Architectural Solution Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SOLUTIONS.map((s, idx) => {
              const Icon = s.icon;
              const isSelected = idx === selectedSol;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setSelectedSol(idx);
                    setShieldSimulated(true);
                  }}
                  className={`text-left rounded-2xl border p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-white border-emerald-500/50 shadow-[0_12px_30px_-14px_rgba(16,185,129,0.2)]"
                      : "bg-white border-[#E4E4E4] hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E4E4E4]/75">
                      <span
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-700 text-white"
                            : "bg-[#F5F6F8] border-[#E4E4E4] text-slate-700"
                        }`}
                      >
                        <Icon size={15} strokeWidth={1.9} />
                      </span>
                      <span className="text-[11px] font-mono font-medium text-emerald-700">
                        {s.metric}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-400 mb-1">
                      Fixes {s.problemRef}
                    </div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-slate-950 mb-2 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
