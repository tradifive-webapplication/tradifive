import React, { useEffect, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  Shield,
  TrendingDown,
  Target,
  Activity,
  Zap,
  Lock,
  Eye,
  Bell,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicFAQ } from "@/components/PublicFAQ";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    icon: TrendingDown,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    title: "Drawdown Kill-Switch",
    desc: "Set a hard daily drawdown limit. The moment equity hits your cap, open exposure flattens and new orders lock automatically.",
  },
  {
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    title: "Per-Trade Risk Cap",
    desc: "Enforce maximum % risk per position across your connected accounts. Oversized orders are flagged and blocked before slippage compounds.",
  },
  {
    icon: Lock,
    color: "text-[#2563EB]",
    bg: "bg-blue-50 border-blue-200",
    title: "Session Time Lock",
    desc: "Restrict trading windows cleanly to London, New York, or your tested edge hours — preventing midnight boredom entries.",
  },
  {
    icon: Eye,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    title: "Live Exposure Monitor",
    desc: "Track real-time equity, floating P&L, margin load, and rule headroom across all MT5 & Indian broker portfolios at once.",
  },
  {
    icon: Bell,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    title: "Threshold Alerts",
    desc: "Receive escalating warnings at 50%, 75%, and 90% of your daily budget so you adjust deliberately before circuit breakers trigger.",
  },
  {
    icon: Zap,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
    title: "Millisecond Bridge",
    desc: "Direct bridge execution talks straight to MT5 and broker APIs with sub-second response when protection must act immediately.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your broker",
    desc: "Link your MT5 or Indian broker using read/execute API credentials. Funds never leave your regulated broker.",
  },
  {
    n: "02",
    title: "Configure hard limits",
    desc: "Choose your max daily drawdown %, max consecutive losses, lot caps, and approved market sessions.",
  },
  {
    n: "03",
    title: "24/7 rule enforcement",
    desc: "Risk Guard checks live floating equity and open orders continuously throughout every trading session.",
  },
  {
    n: "04",
    title: "Cooldown engages on breach",
    desc: "When any boundary is crossed, open risk closes cleanly and a disciplined cooldown window protects your capital.",
  },
];

type SimState = "safe" | "warn" | "locked";

export default function RiskGuardPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login", { state: { mode: "signup" } });
  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const [simState, setSimState] = useState<SimState>("safe");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
  }, []);

  const simConfig: Record<
    SimState,
    {
      dd: string;
      ddBar: number;
      lot: string;
      lotBar: number;
      killSwitch: string;
      statusLabel: string;
      statusColor: string;
      equity: string;
      pnl: string;
      pnlColor: string;
    }
  > = {
    safe: {
      dd: "0.8% / 3.0%",
      ddBar: 27,
      lot: "1.2 / 3.0 lots",
      lotBar: 40,
      killSwitch: "ARMED · STANDBY",
      statusLabel: "Active",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      equity: "$37,790.00",
      pnl: "+$412.20",
      pnlColor: "text-emerald-600",
    },
    warn: {
      dd: "2.2% / 3.0%",
      ddBar: 74,
      lot: "2.6 / 3.0 lots",
      lotBar: 86,
      killSwitch: "ALERT SENT (74%)",
      statusLabel: "Warning",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      equity: "$36,810.00",
      pnl: "-$567.80",
      pnlColor: "text-amber-600",
    },
    locked: {
      dd: "3.0% / 3.0%",
      ddBar: 100,
      lot: "0.0 / 3.0 lots",
      lotBar: 0,
      killSwitch: "TRIGGERED · LOCKED",
      statusLabel: "Cooldown Active",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
      equity: "$36,520.00",
      pnl: "Protected · -$750 max",
      pnlColor: "text-rose-600",
    },
  };

  const sim = simConfig[simState];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar
        alwaysLight
        onSignIn={handleSignIn}
        onSignUp={handleStart}
        onDownloadClick={() => navigate("/download")}
      />

      <main>
        {/* HERO */}
        <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="lg:col-span-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-6">
                <Shield size={13} />
                <span>Risk Guard Engine</span>
              </div>

              <h1
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[36px] sm:text-[52px] lg:text-[58px] tracking-[-0.035em] leading-[1.06] text-slate-900 mb-5"
              >
                <span className="font-bold block">Never blow</span>
                <span className="font-extralight text-slate-500">another </span>
                <span className="font-semibold text-[#2563EB]">account.</span>
              </h1>

              <p className="text-[15.5px] sm:text-[17px] font-light text-slate-500 leading-relaxed max-w-[500px] mb-8">
                Autonomous capital protection connected straight to your broker. Enforce daily drawdown caps, session locks, and instant kill-switches before one red trade snowballs.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStart}
                  className="tactile-blue-pill h-11 px-7 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Enable Risk Guard</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("how-rg-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-11 px-6 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[14px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  How it works
                </button>
              </div>
            </motion.div>

            {/* Right: Interactive Live Risk Console Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="lg:col-span-6"
            >
              <div className="rounded-[24px] bg-[#F8FAFC] border border-slate-200/90 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.12)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>Live Risk Monitor</span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Exness MT5 · Automated Guardrails
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${sim.statusColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {sim.statusLabel}
                  </span>
                </div>

                {/* Interactive Scenario Selector */}
                <div className="flex items-center justify-between gap-2 mb-4 bg-white p-1 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 pl-2.5 hidden sm:inline">
                    Simulate state:
                  </span>
                  <div className="grid grid-cols-3 gap-1 flex-1 sm:flex-none">
                    {(
                      [
                        { id: "safe", label: "Normal" },
                        { id: "warn", label: "Warning" },
                        { id: "locked", label: "Kill-Switch" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSimState(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          simState === s.id
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="rounded-2xl bg-white border border-slate-200/80 p-4">
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="font-semibold text-slate-600">
                        Max Daily Drawdown
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {sim.dd}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          simState === "locked"
                            ? "bg-rose-500"
                            : simState === "warn"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${sim.ddBar}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200/80 p-4">
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="font-semibold text-slate-600">
                        Open Exposure Limit
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {sim.lot}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                        style={{ width: `${sim.lotBar}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200/80 p-4 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-slate-600">
                      Kill-Switch Engine
                    </span>
                    <span
                      className={`text-[11.5px] font-bold font-mono inline-flex items-center gap-1.5 ${
                        simState === "locked" ? "text-rose-600" : "text-[#2563EB]"
                      }`}
                    >
                      {simState === "locked" && <AlertTriangle size={13} />}
                      {sim.killSwitch}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/90 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                      Account Equity
                    </div>
                    <div className="text-[22px] font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {sim.equity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[13px] font-bold font-mono ${sim.pnlColor}`}>
                      {sim.pnl}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Session status
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PLATFORM WINDOW SHOWCASE */}
        <section className="py-12 sm:py-16 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-[660px] mx-auto mb-10">
              <p className="text-[12.5px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                Platform Console
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[40px] font-bold tracking-[-0.03em] leading-[1.12] text-slate-900"
              >
                Protect your capital{" "}
                <span className="font-extralight text-slate-500">
                  before emotions take over.
                </span>
              </h2>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-200/95 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.12)] overflow-hidden p-3 sm:p-4">
              <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  TradiFive Terminal · Risk Guard Console
                </span>
                <span className="text-[10.5px] font-semibold text-emerald-600">
                  Live
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden mt-3 bg-slate-900 border border-slate-200/80">
                <img
                  src="/riskguarddesktop.png"
                  alt="Risk Guard Platform"
                  className="w-full h-auto block object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="py-16 sm:py-20 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-12">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[40px] font-bold tracking-[-0.03em] text-slate-900"
              >
                Everything Risk Guard <span className="font-extralight text-slate-500">enforces.</span>
              </h2>
              <p className="text-[15px] text-slate-500 mt-3 max-w-[480px] mx-auto">
                Six automated layers of capital protection for live and funded accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                    className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:border-blue-200 transition-colors"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${f.bg} ${f.color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-[16px] font-bold text-slate-900 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      {f.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section id="how-rg-works" className="py-16 sm:py-20 px-4 sm:px-7 bg-[#F8FAFC] border-y border-slate-200/70">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-12">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[40px] font-bold tracking-[-0.03em] text-slate-900"
              >
                How Risk Guard <span className="font-extralight text-slate-500">works.</span>
              </h2>
              <p className="text-[15px] text-slate-500 mt-3">
                Four structured steps — takes under 5 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs relative"
                >
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[12px] font-bold mb-4 font-mono">
                    {s.n}
                  </div>
                  <h4 className="text-[15.5px] font-bold text-slate-900 mb-2">
                    {s.title}
                  </h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-7 text-center">
          <div className="max-w-[600px] mx-auto">
            <h2
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[30px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900 mb-4"
            >
              Protect your <span className="font-extralight text-slate-500">capital today.</span>
            </h2>
            <p className="text-[15px] text-slate-500 mb-8">
              Set up autonomous risk rules in minutes. Free to start with every TradiFive workspace.
            </p>
            <button
              onClick={handleStart}
              className="tactile-blue-pill h-11 px-8 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <PublicFAQ lightMode />
      </main>

      <PublicFooter lightMode />
    </div>
  );
}
