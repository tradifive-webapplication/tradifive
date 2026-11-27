import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { CheckCircle2, Shield, TrendingUp, Users, ArrowRight, Activity, Cpu, Play, Layers, X, Zap, Trophy, Star, Globe, MessageSquare, Radio, MessageCircle, GraduationCap, Sparkles, BookText, Crown, ShieldCheck, ChevronDown, ChevronUp, ChevronRight, Plus, Bell } from "lucide-react";
import { ShieldDone, Graph, Activity as IconlyActivity, TwoUsers } from "react-iconly";
import PremiumBackground from "../components/PremiumBackground";
import StarsBackground from "../components/StarsBackground";
import { toast } from "sonner";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

import { Ic } from "../components/Ic";
import Pattern from "../components/Pattern";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { FlipText } from "@/components/ui/flip-text";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";
import SideRays from "@/components/SideRays";
import BlurText from "@/components/BlurText";
import LaserFlow from "@/components/LaserFlow";

/* ── hooks ── */
function useReveal() {
  const r = useRef<any>(null);
  useEffect(() => {
    const el = r.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return r;
}

/* ── Global Scroll Progress Indicator ── */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        transformOrigin: "0%",
        background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 35%, #ec4899 70%, #10b981 100%)",
        boxShadow: "0 0 12px rgba(99, 102, 241, 0.8), 0 0 24px rgba(59, 130, 246, 0.5)",
        zIndex: 99999,
        pointerEvents: "none"
      }}
    />
  );
}

/* ── Ambient Background Lighting Fields ── */
function AmbientGlowField() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Hero cyan aura */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, -30, 15, 0],
          scale: [1, 1.12, 0.96, 1],
          opacity: [0.12, 0.2, 0.12]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "4%",
          right: "10%",
          width: 580,
          height: 580,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.28) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
          filter: "blur(90px)"
        }}
      />
      {/* Mid-page purple / violet aura */}
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 25, -25, 0],
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.17, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "absolute",
          top: "32%",
          left: "5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(236,72,153,0.06) 50%, transparent 70%)",
          filter: "blur(100px)"
        }}
      />
      {/* Lower emerald/teal aura */}
      <motion.div
        animate={{
          x: [0, 35, -25, 0],
          y: [0, -20, 30, 0],
          scale: [0.95, 1.1, 0.95],
          opacity: [0.08, 0.15, 0.08]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute",
          top: "62%",
          right: "5%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.05) 50%, transparent 70%)",
          filter: "blur(95px)"
        }}
      />
      {/* Bottom CTA radiant beam */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "3%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.1) 40%, transparent 70%)",
          filter: "blur(85px)"
        }}
      />
    </div>
  );
}



/* ════════════════
   HERO PRODUCT SHOWCASE MOCKUP
════════════════ */
function HeroDashboard({ onStart }: { onStart: () => void }) {
  const [activeTab, setActiveTab] = useState<"Overview" | "Journal" | "Risk Guard" | "Reports">("Overview");

  const tabStats: Record<
    "Overview" | "Journal" | "Risk Guard" | "Reports",
    {
      bannerTitle: string;
      bannerSub: string;
      kpis: { label: string; delta: string; deltaPositive: boolean; value: string; sub: string }[];
      chartTitle: string;
      tooltipLabel: string;
      tooltipVal: string;
    }
  > = {
    Overview: {
      bannerTitle: "Good morning, Trader",
      bannerSub: "Portfolio snapshot · Today",
      kpis: [
        { label: "Net P&L", delta: "+12.4%", deltaPositive: true, value: "+$42,890", sub: "vs $38,160 last month" },
        { label: "Account Equity", delta: "+8.1%", deltaPositive: true, value: "$248,400", sub: "Across 3 accounts" },
        { label: "Risk Score", delta: "+0 breaches", deltaPositive: true, value: "94 / 100", sub: "All guards active" },
      ],
      chartTitle: "Equity vs target",
      tooltipLabel: "Oct 26",
      tooltipVal: "+$42.9K",
    },
    Journal: {
      bannerTitle: "Automated Trade Journal",
      bannerSub: "MT5 & Broker auto-sync · 128 trades",
      kpis: [
        { label: "Win Rate", delta: "+4.2%", deltaPositive: true, value: "68.4%", sub: "Last 30 days" },
        { label: "Profit Factor", delta: "+0.35", deltaPositive: true, value: "2.41", sub: "R-Multiple 1.9R avg" },
        { label: "Best Setup", delta: "78% WR", deltaPositive: true, value: "NY Open", sub: "London / NY overlap" },
      ],
      chartTitle: "Cumulative R-Multiple",
      tooltipLabel: "Week 4",
      tooltipVal: "+24.6R",
    },
    "Risk Guard": {
      bannerTitle: "Institutional Risk Guard",
      bannerSub: "Real-time drawdown & revenge-trade lock",
      kpis: [
        { label: "Daily Drawdown", delta: "Safe", deltaPositive: true, value: "0.42%", sub: "Max limit 2.00%" },
        { label: "Lot Cap", delta: "Locked", deltaPositive: true, value: "2.0 lots", sub: "Per position guard" },
        { label: "Saved Capital", delta: "+3 blocks", deltaPositive: true, value: "$6,450", sub: "Blocked tilt trades" },
      ],
      chartTitle: "Drawdown buffer vs limit",
      tooltipLabel: "Peak",
      tooltipVal: "98.2% safe",
    },
    Reports: {
      bannerTitle: "AI Performance Audit",
      bannerSub: "Weekly insights powered by TradiFive AI",
      kpis: [
        { label: "Discipline Score", delta: "+9 pts", deltaPositive: true, value: "96%", sub: "Top 5% this week" },
        { label: "Avg Hold Time", delta: "Optimal", deltaPositive: true, value: "42m", sub: "Winning trades" },
        { label: "Tilt Warnings", delta: "Resolved", deltaPositive: true, value: "0 active", sub: "Clean streak: 14d" },
      ],
      chartTitle: "Consistency index",
      tooltipLabel: "Today",
      tooltipVal: "96 pts",
    },
  };

  const current = tabStats[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[960px] mx-auto rounded-[22px] bg-white border border-slate-200/90 shadow-[0_32px_90px_-18px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.04)] overflow-hidden text-left"
    >
      {/* Top App Chrome Bar */}
      <div className="bg-[#0F1219] px-4 sm:px-5 h-12 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
            <img src="/tf-logo.png" alt="TradiFive" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.14em] text-white/90 uppercase">
            TradiFive
          </span>
        </div>

        {/* Interactive Center Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.05] p-1 rounded-lg border border-white/[0.06]">
          {(["Overview", "Journal", "Risk Guard", "Reports"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MT5 Live
          </span>
          <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-white/60">
            <Bell size={12} />
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
            A
          </div>
        </div>
      </div>

      {/* Main Light Workspace Content */}
      <div className="p-3.5 sm:p-5 bg-[#F8FAFC] space-y-4">
        {/* Dark Summary Hero Banner inside Frame */}
        <div
          className="rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden border border-white/10"
          style={{
            background:
              "radial-gradient(circle at 62% 20%, rgba(37, 99, 235, 0.28) 0%, rgba(15, 23, 42, 0.96) 52%, #090D16 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
            <div>
              <h3 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-white">
                {current.bannerTitle}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{current.bannerSub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStart}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white/90 transition-colors cursor-pointer"
              >
                Export
              </button>
              <button
                type="button"
                onClick={onStart}
                className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} strokeWidth={2.5} />
                Log trade
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 relative z-10">
            {current.kpis.map((kpi) => (
              <div key={kpi.label}>
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                  <span>{kpi.label}</span>
                  <span className={kpi.deltaPositive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                    {kpi.delta}
                  </span>
                </div>
                <div className="text-[22px] sm:text-[25px] font-bold tracking-tight text-white mt-0.5 tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-[10px] text-slate-400/90 mt-0.5">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Summary Column */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <h4 className="text-[13px] font-bold text-slate-900">Account summary</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Balances, limits and sync status.</p>

              <div className="mt-4 space-y-3.5">
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    Connected Terminal
                  </div>
                  <div className="text-[12.5px] font-bold text-slate-800 mt-0.5 tabular-nums">
                    MT5 · •• 4829
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Balance</div>
                    <div className="text-[14px] font-bold text-slate-900 mt-0.5 tabular-nums">$248,400</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Active Rules</div>
                    <div className="text-[14px] font-bold text-slate-900 mt-0.5 tabular-nums">6</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Win Rate</div>
                    <div className="text-[14px] font-bold text-slate-900 mt-0.5 tabular-nums">68.4%</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Top Asset</div>
                    <div className="text-[14px] font-bold text-slate-900 mt-0.5">XAU/USD</div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Daily Growth</div>
                  <div className="text-[13px] font-bold text-emerald-600 mt-0.5 tabular-nums">+8.4% this month</div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onStart}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
                >
                  Sync
                </button>
                <button
                  type="button"
                  onClick={onStart}
                  className="py-1.5 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-[11px] font-bold text-white cursor-pointer"
                >
                  ✓ Armed
                </button>
              </div>
              <button
                type="button"
                onClick={onStart}
                className="w-full py-2 px-3 rounded-lg bg-[#0F1219] hover:bg-slate-800 text-[11px] font-bold text-white cursor-pointer transition-colors"
              >
                Open Full Workspace
              </button>
            </div>
          </div>

          {/* Right Analytics + Activity Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Equity vs Target Chart Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900">{current.chartTitle}</h4>
                  <p className="text-[10.5px] text-slate-400">Daily performance progression</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> TARGET
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> ACTUAL
                  </span>
                  <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                    This month
                  </span>
                </div>
              </div>

              <div className="relative h-[145px] w-full">
                <svg viewBox="0 0 600 140" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroCurveFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                    </linearGradient>
                    <pattern id="heroChartDots" width="12" height="12" patternUnits="userSpaceOnUse">
                      <circle cx="1.5" cy="1.5" r="0.8" fill="#cbd5e1" opacity="0.6" />
                    </pattern>
                  </defs>

                  <rect x="0" y="10" width="600" height="115" fill="url(#heroChartDots)" rx="6" />
                  <line x1="0" y1="45" x2="600" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="85" x2="600" y2="85" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Target Pace Line */}
                  <path
                    d="M 0,72 Q 160,55 320,42 T 600,16"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Actual Equity Area + Curve */}
                  <path
                    d="M 0,118 C 70,104 120,82 180,90 C 240,98 300,76 365,64 C 425,52 470,40 520,56 C 555,66 580,44 600,26 L 600,126 L 0,126 Z"
                    fill="url(#heroCurveFill)"
                  />
                  <path
                    d="M 0,118 C 70,104 120,82 180,90 C 240,98 300,76 365,64 C 425,52 470,40 520,56 C 555,66 580,44 600,26"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle cx="520" cy="56" r="4" fill="#0F172A" stroke="#fff" strokeWidth="1.5" />
                </svg>

                {/* Crisp Dark Floating Tooltip Pill */}
                <div className="absolute right-[13%] top-[36%] bg-[#0F1219] text-white px-2.5 py-1.5 rounded-lg shadow-lg border border-white/10 pointer-events-none">
                  <div className="text-[9px] text-slate-400 leading-none">{current.tooltipLabel}</div>
                  <div className="text-[11.5px] font-bold tabular-nums mt-0.5">{current.tooltipVal}</div>
                </div>
              </div>
            </div>

            {/* Bottom 2 Cards: Recent Activity & Recent Trades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12.5px] font-bold text-slate-900">Recent activity</h4>
                  <button
                    type="button"
                    onClick={onStart}
                    className="text-[10.5px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { dot: "bg-emerald-500", title: "XAU/USD TP hit", desc: "+$1,240 · NY session breakout", time: "2m" },
                    { dot: "bg-blue-500", title: "Risk Guard verified", desc: "Daily risk exposure within 0.42%", time: "18m" },
                    { dot: "bg-amber-500", title: "Tilt shield warning", desc: "Cooldown paused 2nd impulse entry", time: "1h" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                        <div className="min-w-0">
                          <div className="text-[11.5px] font-semibold text-slate-800 truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12.5px] font-bold text-slate-900">Recent executions</h4>
                  <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600">
                    Today
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { iconBg: "bg-emerald-50 text-emerald-600", pair: "XAU/USD", sub: "Long · 2.00 lots", val: "+$1,240.00", pos: true },
                    { iconBg: "bg-blue-50 text-blue-600", pair: "EUR/USD", sub: "Short · 1.50 lots", val: "+$680.00", pos: true },
                    { iconBg: "bg-indigo-50 text-indigo-600", pair: "NAS100", sub: "Long · 0.50 lots", val: "+$1,890.00", pos: true },
                    { iconBg: "bg-rose-50 text-rose-600", pair: "GBP/JPY", sub: "Short · 1.00 lots", val: "-$240.00", pos: false },
                  ].map((tr) => (
                    <div key={tr.pair} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${tr.iconBg}`}>
                          {tr.pair.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11.5px] font-bold text-slate-800 truncate">{tr.pair}</div>
                          <div className="text-[10px] text-slate-400 truncate">{tr.sub}</div>
                        </div>
                      </div>
                      <span className={`text-[11.5px] font-bold tabular-nums shrink-0 ${tr.pos ? "text-slate-900" : "text-rose-600"}`}>
                        {tr.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════
   HERO
════════════════ */
function Hero({ onStart }: { onStart: () => void; onSignIn: () => void }) {
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<"All accounts" | "MT5 #4829">("All accounts");
  const [rangeFilter, setRangeFilter] = useState<"Last 30 days" | "This week">("Last 30 days");
  const [currencyFilter, setCurrencyFilter] = useState<"USD" | "INR">("USD");

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart();
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
      }}
    >
      {/* Top Space Sky + Planetary Horizon Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[690px] sm:h-[780px] overflow-hidden"
        style={{ backgroundColor: "#020617" }}
      >
        <img
          src="/hero-space-horizon.jpg"
          alt=""
          className="w-full h-full object-cover object-center select-none"
        />
        {/* Seamless blend from space horizon glow into crisp pure white below */}
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 55%, #ffffff 100%)",
          }}
        />
      </div>

      {/* Centered Hero Stack */}
      <div className="relative z-10 max-w-[1080px] mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 flex flex-col items-center text-center">
        {/* Top Announcement Badge */}
        <motion.button
          type="button"
          onClick={() => navigate("/features/tradifive-ai")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-[11.5px] font-medium text-white/95 mb-6 cursor-pointer transition-colors"
        >
          <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[9.5px] font-extrabold uppercase tracking-wide">
            NEW
          </span>
          <span>Smarter risk &amp; journaling with AI</span>
          <ChevronRight size={13} className="text-white/75" />
        </motion.button>

        {/* Headline + Floating Presence Cursor Tags */}
        <div className="relative w-full max-w-[860px] mx-auto">
          {/* Left Floating Cursor Tag */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0, y: [-3, 3, -3] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.4 },
              y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="hidden md:flex items-center gap-1.5 absolute left-2 lg:-left-6 top-[64%] pointer-events-none select-none"
          >
            <span className="px-2.5 py-1 rounded-full bg-[#1E40AF]/85 border border-blue-300/35 backdrop-blur-md text-[10.5px] font-semibold text-white shadow-lg">
              Elena R. · Risk Guard
            </span>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="-mt-3 text-blue-200 drop-shadow">
              <path d="M2 2L14 6.5L8.5 8.5L6.5 14L2 2Z" fill="currentColor" stroke="#1e3a8a" strokeWidth="1" />
            </svg>
          </motion.div>

          {/* Right Floating Cursor Tag */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, y: [3, -3, 3] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.5 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="hidden md:flex items-center gap-1.5 absolute right-2 lg:-right-4 top-[78%] pointer-events-none select-none"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="-mt-3 text-blue-200 drop-shadow scale-x-[-1]">
              <path d="M2 2L14 6.5L8.5 8.5L6.5 14L2 2Z" fill="currentColor" stroke="#1e3a8a" strokeWidth="1" />
            </svg>
            <span className="px-2.5 py-1 rounded-full bg-[#1E40AF]/85 border border-blue-300/35 backdrop-blur-md text-[10.5px] font-semibold text-white shadow-lg">
              arjun_fx · Journal
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="text-[36px] sm:text-[54px] lg:text-[66px] font-bold tracking-[-0.035em] leading-[1.05] text-white drop-shadow-[0_2px_20px_rgba(2,6,23,0.35)]"
          >
            Your trading edge,
            <br />
            finally under control.
          </motion.h1>
        </div>

        {/* Readable Subtitle over Horizon Glow */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
          className="mt-5 max-w-[540px] text-[14.5px] sm:text-[16px] font-medium leading-relaxed text-slate-800/90"
          style={{ textShadow: "0 1px 14px rgba(255,255,255,0.85)" }}
        >
          Manage risk rules, trade journaling, AI coaching, and live analytics from one intelligent platform built for serious traders.
        </motion.p>

        {/* Centered Interactive AI Command Bar */}
        <motion.form
          onSubmit={handlePromptSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
          className="mt-7 w-full max-w-[560px] rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/85 shadow-[0_18px_48px_rgba(15,23,42,0.12)] p-3 text-left"
        >
          <div className="px-1.5 pt-0.5 pb-2.5">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder='Ask TradiFive AI: "Audit my XAU/USD risk this month"...'
              className="w-full bg-transparent text-[13.5px] font-medium text-slate-900 placeholder:text-slate-400 outline-none border-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onStart}
                aria-label="Add context"
                className="w-7 h-7 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/features/tradifive-ai")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                <Sparkles size={11} className="text-[#2563EB]" />
                <span>TradiFive AI</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountFilter((v) => (v === "All accounts" ? "MT5 #4829" : "All accounts"))}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 cursor-pointer transition-colors"
              >
                {accountFilter}
              </button>
              <button
                type="button"
                onClick={() => setRangeFilter((v) => (v === "Last 30 days" ? "This week" : "Last 30 days"))}
                className="hidden sm:inline-flex px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 cursor-pointer transition-colors"
              >
                {rangeFilter}
              </button>
              <button
                type="button"
                onClick={() => setCurrencyFilter((v) => (v === "USD" ? "INR" : "USD"))}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 cursor-pointer transition-colors"
              >
                {currencyFilter}
              </button>
            </div>

            <button
              type="submit"
              aria-label="Get started with TradiFive AI"
              className="w-8 h-8 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(37,99,235,0.35)] cursor-pointer transition-all active:scale-95"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.form>

        {/* Centered Dashboard Product Mockup */}
        <div className="w-full mt-10 sm:mt-12">
          <HeroDashboard onStart={onStart} />
        </div>
      </div>

      {/* Smooth Gradient Bridge into Dark PlatformPillars Section Below */}
      <div
        aria-hidden="true"
        className="w-full h-24 sm:h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(241,245,249,0.5) 28%, rgba(15,23,42,0.88) 72%, #000000 100%)",
        }}
      />
    </section>
  );
}

/* ════════════════
   PLATFORM PILLARS TICKER
════════════════ */
const CORE_FEATURES = [
  { n: "Social Trading Feed", c: "#3b82f6" },
  { n: "Live Trading Competitions", c: "#7c3aed" },
  { n: "Institutional Risk Guard", c: "#3b82f6" },
  { n: "AI Trade Journal", c: "#10b981" },
  { n: "FiAlgo Engine", c: "#0ea5e9" },
  { n: "24-Hour Trading Stories", c: "#7c3aed" },
  { n: "Real-Time Leaderboards", c: "#3b82f6" },
  { n: "Multi-Broker MT5 Bridge", c: "#10b981" },
  { n: "Verified Performance Tracking", c: "#7c3aed" },
];
function PlatformPillars() {
  return (
    <section className="pillar-section" style={{ backgroundColor: "transparent", padding: "44px 0 24px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 3 }}>
        <p className="pillar-title">EVERYTHING A SERIOUS TRADER NEEDS — <br className="show-sm" />IN ONE PLATFORM</p>
      </div>
      <div className="pillar-mask">
        <div className="br-track">
          {[...CORE_FEATURES, ...CORE_FEATURES].map((b, i) => (
            <div key={i} className="br-chip">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: b.c, boxShadow: `0 0 8px ${b.c}` }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.2px" }}>{b.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   PROBLEM
════════════════ */
function Problem() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  return (
    <section id="problem" style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }} className="problem-grid">

        {/* Centered Text and Compact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          <div style={{ marginBottom: 20 }}>
            <span style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>WHY TRADIFIVE?</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 48 }}>
            <BlurText
              lines={[
                { text: "Trading Is More Than Charts.", gradient: ["#ffffff", "#3b82f6"] },
                { text: "It's Psychology & Discipline.", style: { color: "rgba(255,255,255,0.35)", fontSize: "clamp(18px, 2.5vw, 28px)" } }
              ]}
            />
          </h2>

          <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", textAlign: "left" }}>
            <AgentBentoGrid />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ════════════════
   HOW IT WORKS — THE TRADIFIVE JOURNEY
════════════════ */
function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const STEPS = [
    {
      num: "01",
      icon: <Users size={22} strokeWidth={2} />,
      color: "#818cf8",
      colorGlow: "rgba(99, 102, 241, 0.3)",
      borderColor: "rgba(99, 102, 241, 0.25)",
      title: "Create Your Account",
      desc: "Start your trading journey with Tradifive. Set up your profile, customize your experience, and unlock access to the complete trading ecosystem.",
      tag: "Ready in 60s",
      badge: "STEP 01",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>TF</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>@disciplined_trader</div>
                <div style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.45)" }}>Pro Profile Active</div>
              </div>
            </div>
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 10, fontWeight: 800, padding: "2.5px 8px", borderRadius: 100, background: "rgba(99, 102, 241, 0.18)", color: "#a5b4fc", border: "1px solid rgba(99, 102, 241, 0.3)" }}
            >
              +100 XP
            </motion.span>
          </div>
          <div style={{ height: 5, width: "100%", background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <motion.div
              style={{ width: "85%", height: "100%", background: "linear-gradient(to right, #6366f1, #3b82f6)", borderRadius: 3 }}
              animate={{ width: ["70%", "85%", "70%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={{ position: "absolute", top: 0, bottom: 0, width: 35, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
              animate={{ left: ["-20%", "120%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </div>
      )
    },
    {
      num: "02",
      icon: <Layers size={22} strokeWidth={2} />,
      color: "#34d399",
      colorGlow: "rgba(16, 185, 129, 0.3)",
      borderColor: "rgba(16, 185, 129, 0.25)",
      title: "Connect Your Broker",
      desc: "Link any MT5 broker securely. Our bridge technology ensures zero-latency execution while keeping your funds completely secure on your broker's end.",
      tag: "Zero-Latency MT5",
      badge: "STEP 02",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>MetaTrader 5 Bridge</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399" }} />
              <span>4ms ping</span>
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
            <span>Capital in Broker</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>100% Isolated</span>
          </div>
        </div>
      )
    },
    {
      num: "03",
      icon: <ShieldCheck size={22} strokeWidth={2} />,
      color: "#fbbf24",
      colorGlow: "rgba(245, 158, 11, 0.3)",
      borderColor: "rgba(245, 158, 11, 0.25)",
      title: "Activate Risk Guard",
      desc: "Set your daily loss limits and maximum trades. Once your rules are breached, Tradifive automatically locks your account for the day to prevent revenge trading.",
      tag: "AI Protected",
      badge: "STEP 03",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Drawdown Shield</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2.5px 8px", borderRadius: 100, background: "rgba(245, 158, 11, 0.18)", color: "#fcd34d", border: "1px solid rgba(245, 158, 11, 0.3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b" }} />
              ARMED
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
            <span>Max Daily Loss Limit</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>$250 / 3.0%</span>
          </div>
        </div>
      )
    },
    {
      num: "04",
      icon: <Globe size={22} strokeWidth={2} />,
      color: "#f472b6",
      colorGlow: "rgba(236, 72, 153, 0.3)",
      borderColor: "rgba(236, 72, 153, 0.25)",
      title: "Join Community & Creators",
      desc: "Follow verified traders, join public or private channels, share ideas, learn from creators, and grow alongside a community of traders.",
      tag: "Start Growing",
      badge: "STEP 04",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ec4899", boxShadow: "0 0 6px #ec4899" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Broadcast Channels</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f472b6", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#ec4899" }} />
              1,240+ Online
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
            <span>Top Trader Win Rate</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>68.4% Verified</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <section id="how-it-works" style={{ backgroundColor: "transparent", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginBottom: 20 }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              color: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "6px 20px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "2px",
              textTransform: "uppercase",
              boxShadow: "0 0 16px rgba(59, 130, 246, 0.15)"
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }} />
              THE TRADIFIVE JOURNEY
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(30px, 4.2vw, 50px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16, lineHeight: 1.15 }}
          >
            <span style={{ background: "linear-gradient(to right, #ffffff 40%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              From Beginner to Consistent Trader<br />
              In Four Simple Steps.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.55)", maxWidth: 540, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Everything you need — learning, trading, discipline, AI guidance, and community — in one ecosystem.
          </motion.p>
        </div>

        {/* ── Desktop Horizontal Connection Rail ── */}
        <div className="hidden lg:block" style={{ position: "relative", marginBottom: 28, padding: "0 40px" }}>
          <div style={{ position: "absolute", top: 18, left: 60, right: 60, height: 2, background: "rgba(255, 255, 255, 0.08)", zIndex: 0, overflow: "hidden" }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(to right, #6366f1 0%, #10b981 33%, #f59e0b 66%, #ec4899 100%)",
                boxShadow: "0 0 12px rgba(99, 102, 241, 0.6)"
              }}
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* Traveling laser comet along the rail */}
            <motion.div
              style={{
                position: "absolute",
                top: -2,
                width: 60,
                height: 6,
                borderRadius: 4,
                background: "linear-gradient(90deg, transparent, #ffffff, #60a5fa, transparent)",
                boxShadow: "0 0 12px #60a5fa, 0 0 20px #818cf8"
              }}
              animate={{ left: ["-10%", "110%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", position: "relative", zIndex: 1 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  style={{
                    position: "relative",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: hoveredStep === i ? step.color : "#121216",
                    border: `2px solid ${step.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    color: hoveredStep === i ? "#fff" : step.color,
                    boxShadow: `0 0 18px ${step.colorGlow}`,
                    transition: "all 0.25s ease",
                    cursor: "pointer"
                  }}
                >
                  {/* Pulsing halo ring */}
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: -5,
                      borderRadius: "50%",
                      border: `1.5px solid ${step.color}`
                    }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                  />
                  {step.num}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Connected 4-Step Cards Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          position: "relative",
          zIndex: 2
        }}>
          {STEPS.map((step, i) => {
            const isHovered = hoveredStep === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  background: "#121216",
                  borderRadius: 22,
                  padding: "24px 22px",
                  border: isHovered ? `1px solid ${step.borderColor}` : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isHovered
                    ? `inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 35px ${step.colorGlow}`
                    : "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 20,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
                }}
              >
                {/* Ambient Card Glow */}
                <motion.div
                  animate={{ scale: isHovered ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: step.colorGlow,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                    opacity: isHovered ? 0.95 : 0.4,
                    transition: "opacity 0.3s ease"
                  }}
                />

                <div>
                  {/* Top Header Pill */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "#18181e",
                        border: `1.5px solid ${step.borderColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: step.color,
                        boxShadow: `0 0 18px ${step.colorGlow}`
                      }}
                    >
                      {step.icon}
                    </motion.div>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      padding: "3px 9px",
                      borderRadius: 100,
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.08)"
                    }}>
                      {step.tag}
                    </span>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 900, color: step.color, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    {step.badge}
                  </span>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 10, lineHeight: 1.3 }}>
                    {step.title}
                  </h3>

                  <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.55)", lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
                    {step.desc}
                  </p>
                </div>

                {/* Creative Visual Preview Widget */}
                <div style={{ marginTop: 4 }}>
                  {step.preview}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ════════════════
   PLATFORM CAPABILITIES
════════════════ */
const CAPABILITIES = [
  {
    id: "01", tag: "RISK GUARD", title: "Autonomous Risk Protection",
    desc: "Set daily loss limits, max drawdown rules, and trading restrictions. Tradifive automatically protects your capital and enforces discipline.",
    m: "0.1s", mt: "Protection Speed", icon: Shield, color: "#7c3aed"
  },
  {
    id: "02", tag: "AUTO-SYNC JOURNAL", title: "Smart Trade Journal",
    desc: "Every trade is automatically imported, analyzed, and organized. Discover patterns, mistakes, and opportunities without manual journaling.",
    m: "100%", mt: "Automated", icon: Layers, color: "#3b82f6"
  },
  {
    id: "03", tag: "COMMUNITY & CHANNELS", title: "Verified Trading Network",
    desc: "Join public and private channels, follow creators, chat with traders, and learn from verified performance.",
    m: "24/7", mt: "Active Community", icon: Users, color: "#10b981"
  },
  {
    id: "04", tag: "AI COACH", title: "Personal Trading Mentor",
    desc: "Get personalized feedback, psychology coaching, trade reviews, and actionable insights based on your trading behavior.",
    m: "24/7", mt: "AI Support", icon: Zap, color: "#f59e0b"
  },
  {
    id: "05", tag: "CREATOR HUB", title: "Monetize Your Expertise",
    desc: "Launch premium channels, grow your audience, share signals, teach strategies, and earn from your trading knowledge.",
    m: "Creator", mt: "Earnings", icon: Trophy, color: "#ec4899"
  },
  {
    id: "06", tag: "TRADING DASHBOARD", title: "All Your Trading Data",
    desc: "Monitor performance, analytics, broker accounts, risk metrics, and growth from one powerful dashboard.",
    m: "Real", mt: "Time Analytics", icon: TrendingUp, color: "#3b82f6"
  }
];

function Features() {
  const r1 = useReveal(), r2 = useReveal();
  return (
    <section id="capabilities" style={{ backgroundColor: "transparent", padding: "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={r1} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>THE TRADIFIVE ECOSYSTEM</span>
          </div>
          <h2 className="capabilities-title" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
            <BlurText
              lines={[
                { text: "Everything You Need To", gradient: ["#ffffff", "#3b82f6"] },
                { text: "Trade, Learn & Grow.", gradient: ["#ffffff", "#3b82f6"] }
              ]}
            />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            AI-powered tools, verified traders, risk management, social communities, and performance analytics—all in one platform.
          </motion.p>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }} className="capabilities-grid-wrapper">
          <AgentBentoGrid />
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   APP SHOWCASE
════════════════ */
function PhoneMockup({ screen }: { screen: any }) {
  return (
    <div style={{
      width: 270, height: 540, borderRadius: 44,
      background: "linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
      border: "1.5px solid rgba(255,255,255,0.12)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 1px rgba(255,255,255,0.1)",
      position: "relative",
      overflow: "hidden",
      backdropFilter: "blur(10px)",
      flexShrink: 0 }}>
      {/* Notch */}
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 80, height: 22, background: "#000", borderRadius: 20, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ width: 36, height: 4, borderRadius: 4, background: "#111" }} />
      </div>

      {/* Status bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 22px 6px", zIndex: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 1 }}>{[1, 2, 3, 4].map(b => <div key={b} style={{ width: 3, height: 5 + b * 2, background: b < 4 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", borderRadius: 1 }} />)}</div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M1.5 8.5C5.5 4.5 18.5 4.5 22.5 8.5L20.5 10.5C17.5 7.5 6.5 7.5 3.5 10.5L1.5 8.5Z" /><path d="M5.5 12.5C8.5 9.5 15.5 9.5 18.5 12.5L16.5 14.5C14.5 12.5 9.5 12.5 7.5 14.5L5.5 12.5Z" /><circle cx="12" cy="18" r="2" /></svg>
          <div style={{ width: 18, height: 8, borderRadius: 2, position: "relative", display: "flex", alignItems: "center", padding: "0 1px" }}>
            <div style={{ width: "70%", height: "60%", background: "#10b981", borderRadius: 1 }} />
            <div style={{ position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)", width: 2, height: 5, background: "rgba(255,255,255,0.3)", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div style={{ position: "absolute", inset: 0, background: screen.bg, display: "flex", flexDirection: "column", paddingTop: 44 }}>
        {screen.content}
      </div>

      {/* Screen tint overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />

      {/* Home bar */}
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 80, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.25)" }} />
    </div>
  );
}

/* ════════════════
   PRICING
════════════════ */
function Pricing({ onStart }: { onStart: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite">("pro");

  return (
    <section id="pricing" style={{ backgroundColor: "transparent", padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", position: "relative" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 16 }}>
            <span style={{
              background: "rgba(59, 130, 246, 0.12)",
              border: "none",
              color: "#60a5fa",
              padding: "6px 18px",
              borderRadius: "100px",
              textTransform: "uppercase",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}>
              <Zap size={13} />
              TRANSPARENT PRICING
            </span>
          </div>

          <h2 style={{ fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 14, lineHeight: 1.15 }}>
            <BlurText
              lines={[
                { text: "Simple, Predictable Plans." },
                { text: "Invest In Your Edge." }
              ]}
              gradient={["#ffffff", "#3b82f6"]}
            />
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 640, margin: "0 auto", fontWeight: 500, lineHeight: 1.6 }}>
            Start free with full core journal and discipline tracking. Upgrade anytime as your capital and execution scale.
          </p>
        </div>

        {/* Platform Membership Cards */}
        <div className="relative z-10 w-full">
          <PricingCards
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onUpgradeClick={onStart}
            isStandalone={true}
          />
        </div>

        <div ref={useReveal()} className="rv d4" style={{ textAlign: "center", marginTop: 48, opacity: 0.45 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>No credit card required to start · Instant access · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   SOCIAL PROOF
════════════════ */
const TESTIS = [
  { name: "Priya Mehra", role: "Day Trader, Pune", init: "PM", grad: "linear-gradient(135deg,#3b82f6,#1d4ed8)", stars: 5, text: "The social feed changed my trading completely. Seeing real verified P&Ls from other traders keeps me accountable. My win rate jumped from 42% to 67% in 2 months." },
  { name: "Rahul Sharma", role: "IIT Delhi Graduate", init: "RS", grad: "linear-gradient(135deg,#7c3aed,#4c1d95)", stars: 5, text: "Risk Guard is the real deal. It literally stopped me from revenge trading after a bad morning session. Saved my account more than once." },
  { name: "Kavita Trivedi", role: "Swing Trader, Mumbai", init: "KT", grad: "linear-gradient(135deg,#10b981,#065f46)", stars: 5, text: "Love the trading competitions. Won the November contest and got a funded account. The leaderboard pushes you to perform better every single day." },
  { name: "Arjun Das", role: "Software Eng, Blr", init: "AD", grad: "linear-gradient(135deg,#f59e0b,#b45309)", stars: 5, text: "Auto-Sync Journal is a game changer. No more manual logging. The AI coach spotted that I was overleveraging on Mondays — something I never noticed." },
  { name: "Sneha Kapoor", role: "Forex Trader, Hyderabad", init: "SK", grad: "linear-gradient(135deg,#ec4899,#9d174d)", stars: 4, text: "Following top traders on the feed and seeing their actual trade setups has taught me more than any YouTube course. This is how trading education should work." },
  { name: "Vikram Singh", role: "Business Owner, Delhi", init: "VS", grad: "linear-gradient(135deg,#3b82f6,#7c3aed)", stars: 5, text: "The community here is different. Everyone has their MT5 connected so you know the results are real. No fake gurus, no screenshot traders." },
  { name: "Ananya Iyer", role: "Options Trader, Chennai", init: "AI", grad: "linear-gradient(135deg,#10b981,#3b82f6)", stars: 5, text: "Set my max daily loss and walked away. Tradifive enforced my rules better than I ever could myself. My discipline improved massively in just 6 weeks." },
  { name: "Zaid Khan", role: "Crypto Trader, Dubai", init: "ZK", grad: "linear-gradient(135deg,#f59e0b,#ec4899)", stars: 4, text: "Joined a competition for the first time last month. Finished 8th place. The competitive element makes you sharper. Already climbing the leaderboard." },
  { name: "Meera Nair", role: "Banker turned Trader, Kochi", init: "MN", grad: "linear-gradient(135deg,#7c3aed,#10b981)", stars: 5, text: "Finally a platform where I can show my real track record. My verified profile has attracted followers who genuinely want to learn from my strategy." },
];

const STATS = [
  { val: "50M+", label: "Global Retail Traders", color: "#3b82f6" },
  { val: "3-in-1", label: "Social + Trade + Risk", color: "#7c3aed" },
  { val: "24h", label: "Trading Stories", color: "#10b981" },
  { val: "Live", label: "MT5 Integration", color: "#3b82f6" },
];

function Social() {
  return (
    <section id="wall-of-fame" style={{ backgroundColor: "transparent", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", padding: "0 28px" }}>
        <div ref={useReveal()} className="rv social-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 80 }}>
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              className="feat-card-premium social-stat-card"
              whileHover={{ y: -6, scale: 1.03 }}
              style={{
                textAlign: "center",
                padding: "22px",
                cursor: "pointer",
                background: "#171717",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                borderRadius: 20,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <div className="social-stat-label" style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
              <div className="social-stat-val" style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.val}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>From the Community</span>
          </div>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 14, lineHeight: 1.1 }}>
            <BlurText
              text="Traders who chose to grow together."
              gradient={["#ffffff", "#3b82f6"]}
            />
          </h2>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)", maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}>
        {/* CSS animation replaces Framer Motion JS-driven scroll — GPU-composited, lower CPU overhead on mobile */}
        <div className="testimonials-track" style={{ display: "flex", gap: 20, padding: "16px 0" }}>
          {[...TESTIS, ...TESTIS].map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.02 }}
              className="feat-card-premium testimonial-card"
              style={{
                width: 320,
                padding: "22px",
                flexShrink: 0,
                borderRadius: 20,
                background: "#171717",
                border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease"
              }}
            >
              <div className="testimonial-stars" style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {Array(t.stars).fill(0).map((_, j) => (<svg key={j} width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>))}
                {Array(5 - t.stars).fill(0).map((_, j) => (<svg key={j + t.stars} width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>))}
              </div>
              <p className="testimonial-text" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20, fontWeight: 400 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="testimonial-avatar" style={{ width: 36, height: 36, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{t.init}</div>
                <div>
                  <div className="testimonial-name" style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                  <div className="testimonial-role" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   FAQ
════════════════ */
const FAQS = [
  { icon: "lock", q: "How is my MT5 connection secured?", a: "Tradifive connects via MetaAPI with read/execute permissions only — we can never withdraw funds or change account settings. All data is encrypted with TLS 1.3 in transit and AES-256 at rest." },
  { icon: "toggle", q: "Is my trading performance truly verified?", a: "Yes. When you connect your MT5 broker account, your trade history and live positions are pulled directly from the broker. Your public profile shows real, verifiable performance — not screenshots." },
  { icon: "wallet", q: "What is the minimum account size?", a: "You can start completely free with any demo account. For real-money trading, we recommend having at least ₹25,000 to allow the risk engine to position-size effectively." },
  { icon: "globe", q: "Which brokers are supported?", a: "Tradifive works with any MT5-compatible broker — IC Markets, Pepperstone, FP Markets, XM, Exness, Tickmill, Vantage, BlackBull, and 40+ more worldwide." },
  { icon: "wifi", q: "How do competitions work?", a: "Monthly competitions run on real or demo MT5 accounts. You enroll, trade during the competition period, and your P&L is tracked live on the public leaderboard. Top performers win cash prizes and funded accounts." },
  { icon: "cpu", q: "What is the AI Coach?", a: "The AI Coach analyzes your auto-synced trade journal, identifies patterns in your performance (e.g. overtrading on Mondays, poor risk-reward on news events), and gives personalized, actionable recommendations." },
];

function FAQItem({ f, i, open, setOpen }: { f: any, i: number, open: number | null, setOpen: (i: number | null) => void }) {
  const revealRef = useReveal();
  const isOpen = open === i;

  return (
    <motion.div
      ref={revealRef}
      whileHover={{ y: -2 }}
      className={`rv d${Math.min(i + 1, 4)} feat-card-premium`}
      style={{
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        background: isOpen ? "#1b1b22" : "#171717",
        border: isOpen ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: isOpen
          ? "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.15)"
          : "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
        borderRadius: 20
      }}
      onClick={() => setOpen(isOpen ? null : i)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: isOpen ? "#93c5fd" : "#fff", transition: "color 0.2s ease" }}>{f.q}</h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ flexShrink: 0, marginLeft: 12 }}
        >
          <Ic n="chev" s={13} c={isOpen ? "#60a5fa" : "rgba(255,255,255,0.3)"} sw={3} />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontWeight: 400 }}>{f.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ backgroundColor: "transparent", padding: "100px 28px", position: "relative" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>FAQ</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            <BlurText
              text="Frequently Asked Questions"
              gradient={["#ffffff", "#3b82f6"]}
            />
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 12, fontWeight: 500 }}>Everything you need to know about Tradifive.</p>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {FAQS.map((f, i) => (
            <FAQItem key={i} f={f} i={i} open={open} setOpen={setOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}


/* ════════════════
   COMMUNITY NETWORK
════════════════ */
function CommunityNetwork({ onStart }: { onStart: () => void }) {
  // Orbital layout: arranged in 3 concentric rings around center
  const innerRing = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    angle: (i / 6) * 360,
    r: 140,
    avatar: Math.floor(Math.random() * 15) + 1,
    gender: i % 2 === 0 ? 'men' : 'women'
  }));
  const outerRing = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 7,
    angle: (i / 6) * 360 + 30,
    r: 260,
    avatar: Math.floor(Math.random() * 15) + 1,
    gender: i % 2 === 0 ? 'men' : 'women'
  }));
  const allNodes = [...innerRing, ...outerRing];
  const cx = 340, cy = 300;
  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle - 90) * Math.PI / 180),
    y: cy + r * Math.sin((angle - 90) * Math.PI / 180),
  });

  const stats = [
    { value: "12,400+", label: "Active Traders", color: "#3b82f6" },
    { value: "₹2.8M", label: "Prizes Awarded", color: "#7c3aed" },
    { value: "94%", label: "Satisfaction Rate", color: "#10b981" },
    { value: "47", label: "Countries", color: "#3b82f6" },
  ];

  const benefits = [
    {
      title: "Pulse Feed",
      desc: "Share verified trade setups, profit milestones, and market insights with your followers in real time.",
      color: "#3b82f6"
    },
    {
      title: "Signal Channels",
      desc: "Subscribe to elite trader broadcast rooms and get live signals pushed directly to your dashboard.",
      color: "#7c3aed"
    },
    {
      title: "Direct Messages",
      desc: "Chat 1-on-1 with mentors, trading partners, or support — all inside the platform without leaving your workspace.",
      color: "#10b981"
    },
    {
      title: "Webinar Rooms",
      desc: "Join live educational sessions hosted by top-tier verified traders. Learn strategies, Q&A, and grow your edge.",
      color: "#3b82f6"
    },
  ];

  return (
    <section style={{ padding: "120px 20px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 100, position: "relative" }}>
          {/* Soft Background Glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 800, height: 400, background: "radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
            {/* Premium Pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#171717", padding: "6px 16px", borderRadius: 100, marginBottom: 24, backdropFilter: "blur(10px)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 10px #6366f1" }} />
              <span style={{ color: "#a5b4fc", fontWeight: 600, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Global Network</span>
            </div>

            <h2 className="community-title" style={{ fontSize: "clamp(24px, 6vw, 56px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.04em" }}>
              <BlurText
                lines={[
                  { text: "Thousands of traders are using", gradient: ["#ffffff", "#3b82f6"] },
                  { text: "TradiFive to learn, collab & grow.", gradient: ["#a855f7", "#6366f1"] }
                ]}
              />
            </h2>

            <p className="community-desc" style={{ fontSize: "clamp(15px, 4vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 40px", fontWeight: 400 }}>
              Join a vibrant global community. Share setups, learn from live webinars, and connect directly with the world's best verified traders.
            </p>

            <motion.button
              onClick={onStart}
              className="btn-glow-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: "14px 32px", borderRadius: 100, fontSize: 15, fontWeight: 700 }}
            >
              Join the Community <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="community-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 80, maxWidth: 900, margin: "0 auto 80px" }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="feat-card-premium community-stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              style={{
                textAlign: "center",
                padding: "28px 20px",
                cursor: "pointer",
                background: "#171717",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                borderRadius: 20,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <div className="community-stat-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
              <div className="community-stat-value" style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Two-column: orbital network + benefits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="community-grid">
          {/* Orbital Network SVG */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "680/600" }}>
            <svg viewBox="0 0 680 600" style={{ width: "100%", height: "100%" }}>
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </radialGradient>
                {/* animated dash pattern */}
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0)" />
                  <stop offset="50%" stopColor="rgba(99,102,241,0.5)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </linearGradient>
              </defs>

              {/* Orbit rings */}
              <motion.circle cx={cx} cy={cy} r={140} fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="4 8" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />
              <motion.circle cx={cx} cy={cy} r={260} fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="4 12" animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />

              {/* Expanding pulse shockwave rings around center logo */}
              <motion.circle
                cx={cx} cy={cy} r={55}
                fill="none"
                stroke="rgba(168,85,247,0.5)"
                strokeWidth="1.5"
                animate={{ r: [55, 95], opacity: [0.8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.circle
                cx={cx} cy={cy} r={55}
                fill="none"
                stroke="rgba(59,130,246,0.4)"
                strokeWidth="1"
                animate={{ r: [55, 115], opacity: [0.6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
              />

              {/* Center glow */}
              <motion.circle cx={cx} cy={cy} r={90} fill="url(#centerGlow)" animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
              <circle cx={cx} cy={cy} r={48} fill="rgba(10,10,20,0.95)" stroke="rgba(168,85,247,0.6)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 15px rgba(168,85,247,0.5))" }} />

              {/* Spoke lines: inner ring → center */}
              {innerRing.map(n => {
                const p = toXY(n.angle, n.r);
                return (
                  <line key={`spoke-${n.id}`}
                    x1={cx} y1={cy} x2={p.x} y2={p.y}
                    stroke="rgba(168,85,247,0.25)" strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Connecting lines: outer → nearest inner */}
              {outerRing.map(n => {
                const outer = toXY(n.angle, n.r);
                const nearestInner = innerRing.reduce((best, inn) => {
                  const diff = Math.abs(((inn.angle - n.angle) + 360) % 360);
                  const prevDiff = Math.abs(((best.angle - n.angle) + 360) % 360);
                  return diff < prevDiff ? inn : best;
                });
                const inner = toXY(nearestInner.angle, nearestInner.r);
                return (
                  <line key={`outer-conn-${n.id}`}
                    x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                    stroke="rgba(99,102,241,0.2)" strokeWidth="1.5"
                  />
                );
              })}

              {/* Flowing data dots: inner to center */}
              {innerRing.map((n, i) => {
                const start = toXY(n.angle, n.r - 20);
                return (
                  <motion.circle
                    key={`flow-inner-${n.id}`}
                    r="3.5"
                    fill="#a855f7"
                    initial={{ cx: start.x, cy: start.y, opacity: 0 }}
                    animate={{ cx: [start.x, cx], cy: [start.y, cy], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 5px #a855f7)" }}
                  />
                );
              })}

              {/* Flowing data dots: outer to inner */}
              {outerRing.map((n, i) => {
                const start = toXY(n.angle, n.r - 20);
                const nearestInner = innerRing.reduce((best, inn) => {
                  const diff = Math.abs(((inn.angle - n.angle) + 360) % 360);
                  const prevDiff = Math.abs(((best.angle - n.angle) + 360) % 360);
                  return diff < prevDiff ? inn : best;
                });
                const end = toXY(nearestInner.angle, nearestInner.r + 20);
                return (
                  <motion.circle
                    key={`flow-outer-${n.id}`}
                    r="2.5"
                    fill="#3b82f6"
                    initial={{ cx: start.x, cy: start.y, opacity: 0 }}
                    animate={{ cx: [start.x, end.x], cy: [start.y, end.y], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 + 0.5, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
                  />
                );
              })}

              {/* Outer ring avatars */}
              {allNodes.map(n => {
                const p = toXY(n.angle, n.r);
                const size = n.r === 140 ? 44 : 36;
                return (
                  <motion.g key={n.id} animate={{ y: [-5, 5, -5] }} transition={{ duration: 4 + (n.id % 3), repeat: Infinity, ease: "easeInOut", delay: n.id * 0.2 }}>
                    <motion.circle
                      cx={p.x} cy={p.y} r={size + 6}
                      fill={`rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.08)`}
                      stroke={`rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.4)`}
                      strokeWidth="1.5"
                      initial={{ opacity: 0.5, scale: 0.95 }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 3 + (n.id % 2), repeat: Infinity, delay: n.id * 0.3 }}
                      style={{ filter: `drop-shadow(0 0 10px rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.3))` }}
                    />
                    <clipPath id={`clip-${n.id}`}>
                      <circle cx={p.x} cy={p.y} r={size} />
                    </clipPath>
                    <image
                      href={`/avatars/${n.gender}_${n.avatar}.jpg`}
                      x={p.x - size} y={p.y - size}
                      width={size * 2} height={size * 2}
                      clipPath={`url(#clip-${n.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle cx={p.x} cy={p.y} r={size} fill="none" stroke={`rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.6)`} strokeWidth="2" />
                  </motion.g>
                );
              })}

              {/* Center logo */}
              <image
                href="/favicon.png"
                x={cx - 28} y={cy - 28}
                width="56" height="56"
                style={{ filter: "brightness(1.5)" }}
              />
            </svg>
          </div>

          {/* Community benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                className="feat-card-premium"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 8, scale: 1.02 }}
                style={{
                  display: "block",
                  padding: "28px",
                  cursor: "pointer",
                  background: "#171717",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                  borderRadius: 20,
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease"
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h3 className="problem-card-title" style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{b.title}</h3>
                </div>
                <p className="problem-card-desc" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontWeight: 400 }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .community-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ════════════════
   CTA
════════════════ */
function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      {/* Mesmerizing radiant ambient glow */}
      <motion.div
        animate={{ scale: [0.95, 1.15, 0.95], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 650,
          height: 380,
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)",
          filter: "blur(65px)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
          <motion.span
            whileHover={{ scale: 1.05 }}
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#a5b4fc",
              padding: "6px 18px",
              borderRadius: "100px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 0 16px rgba(99, 102, 241, 0.2)",
              cursor: "pointer"
            }}
          >
            <Sparkles size={13} />
            START YOUR JOURNEY
          </motion.span>
        </div>
        <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 18 }}>
          <BlurText
            lines={[
              { text: "Become The Trader" },
              { text: "You've Always Wanted To Be." }
            ]}
            gradient={["#ffffff", "#3b82f6"]}
          />
        </h2>
        <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 40, lineHeight: 1.65, fontWeight: 500, maxWidth: 580, margin: "0 auto 40px" }}>
          Join Tradifive and get access to AI coaching, risk management, auto-sync journaling, verified traders, creator communities, and everything you need to grow consistently.
        </p>

        <div ref={useReveal()} className="rv d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
          <motion.button
            onClick={onStart}
            className="shimmer-btn-fx"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              color: "#60a5fa",
              border: "none",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 24px rgba(59, 130, 246, 0.3)",
              borderRadius: 100,
              padding: "14px 34px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
              outline: "none",
              whiteSpace: "nowrap"
            }}
          >
            <span>Start Free Today</span>
            <ArrowRight size={16} />
          </motion.button>
          <motion.button
            onClick={() => { const el = document.getElementById("capabilities"); el?.scrollIntoView({ behavior: "smooth" }); }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "#171717",
              color: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: 100,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow:
                "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)",
              transition: "all 0.2s ease",
              outline: "none",
              whiteSpace: "nowrap"
            }}
          >
            <span>Explore Tradifive</span>
          </motion.button>
        </div>
        <p ref={useReveal()} className="rv d4" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)", fontWeight: 600, letterSpacing: 0.5 }}>No Credit Card Required • Free Community Access • Cancel Anytime</p>
      </div>
    </section>
  );
}

function Sep() {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "16px 0", position: "relative", overflow: "hidden" }}>
      <div style={{
        width: "80%",
        maxWidth: 1100,
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 80%, transparent)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="sep-laser-beam" />
      </div>
    </div>
  );
}

/* ════════════════
   MOBILE BLOCKER — shows download prompt instead of blank screen
════════════════ */
function MobileView({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 999999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
        <img src="/favicon.png" style={{ height: 40, width: "auto" }} alt="Icon" />
        <img src="/Dark mode logo with white.png" style={{ height: 34, width: "auto" }} alt="Tradifive" />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 14, color: "#fff" }}><span style={{ background: "linear-gradient(to right, #ffffff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tradifive Mobile App</span></h2>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 340, marginBottom: 36 }}>
        The full Tradifive experience is available on desktop. For mobile, download our app for the best experience.
      </p>
      <motion.button
        onClick={onStart}
        className="btn-glow-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ padding: "14px 36px", borderRadius: 100, fontSize: 15, fontWeight: 800, marginBottom: 14, width: "100%", maxWidth: 300, justifyContent: "center" }}
      >
        🚀 Sign Up Free
      </motion.button>
      <a href="/download" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 600 }}>Download Mobile App →</a>
    </div>
  );
}

/* ════════════════
   WAITLIST MODAL
════════════════ */


/* ════════════════
   ROOT
════════════════ */
export default function TradiFive() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);


  // Centralized OAuth & Auth Redirect Intercept -> Always forward to /auth-callback or /reset-password
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');
    const hasAuthToken = hash.includes('access_token=') || search.includes('code=');
    const hasAuthError = hash.includes('error=') || search.includes('error=');

    // If this is a password recovery link from Supabase email, route directly to Reset Password
    if (isRecovery) {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }

    if (hasAuthToken || hasAuthError) {
      navigate(`/auth-callback${search}${hash}`, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const check = () => {
      const isWidthMobile = window.innerWidth < 768;
      const isUAMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isWidthMobile || isUAMobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // Preload the heavy login page chunk in the background 1 second after landing page mount
    const timer = setTimeout(() => {
      import("./Login").catch(err => console.warn("Preload Login failed:", err));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle smooth scroll on cross-page navigation with hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const handleSignUp = () => navigate("/login", { state: { mode: "signup" } });
  const handleStart = handleSignUp;

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("custom-cursor-active", "cursor-style-system");
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  return (
    <div style={{ background: "#000000", color: "#fff", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <ScrollProgressBar />
      <AmbientGlowField />
      <PublicNavbar onSignIn={handleSignIn} onSignUp={handleSignUp} onDownloadClick={() => navigate('/download')} />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero onStart={handleStart} onSignIn={handleSignIn} />
        <PlatformPillars />
        <Sep />
        <Problem />
        <Sep />
        <HowItWorks />
        <Sep />
        <CommunityNetwork onStart={handleStart} />
        <Sep />
        <Social />
        <Sep />
        <Pricing onStart={handleStart} />
        <Sep />
        <FAQ />
        <Sep />
        <CTA onStart={handleStart} />
      </main>

      <PublicFooter />
    </div>
  );
}
