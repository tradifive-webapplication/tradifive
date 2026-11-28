import React, { useEffect, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  BrainCircuit,
  BarChart2,
  Search,
  Tag,
  Clock,
  DollarSign,
  BookOpen,
  ArrowRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicFAQ } from "@/components/PublicFAQ";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const METRICS = [
  { label: "Win Rate", value: "72.4%", change: "+3.2%", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Profit Factor", value: "2.14", change: "+0.18", icon: BarChart2, color: "text-[#2563EB]" },
  { label: "Avg RR", value: "1:2.7", change: "+0.4", icon: DollarSign, color: "text-amber-600" },
  { label: "Sharpe Ratio", value: "1.83", change: "+0.22", icon: CheckCircle2, color: "text-violet-600" },
];

const TRADES = [
  { sym: "XAUUSD", dir: "BUY", pnl: "+$1,640.00", rr: "2.4R", tag: "A+ NY Open", win: true, time: "14:15 UTC" },
  { sym: "US30", dir: "SELL", pnl: "-$280.00", rr: "-0.8R", tag: "Stop Hit", win: false, time: "15:40 UTC" },
  { sym: "EURUSD", dir: "BUY", pnl: "+$890.00", rr: "1.9R", tag: "London Sweep", win: true, time: "08:30 UTC" },
];

const FEATURES = [
  {
    icon: RefreshCw,
    color: "text-[#2563EB]",
    bg: "bg-blue-50 border-blue-200",
    title: "100% Broker Auto-Sync",
    desc: "Every fill, lot size, commission, and swap syncs automatically from MT5 and Indian brokers in real time. Zero spreadsheet typing.",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    title: "40+ Institutional Metrics",
    desc: "Win rate, profit factor, Sharpe ratio, MAE/MFE excursions, and hold durations computed automatically across every trade.",
  },
  {
    icon: Tag,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    title: "Setup & Emotion Tagging",
    desc: "Tag trades as 'A+ Setup', 'FOMO', or 'Early Exit' and filter directly to measure the exact dollar cost of every habit.",
  },
  {
    icon: Clock,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    title: "Session & Time Expectancy",
    desc: "Discover your strongest trading sessions, days of the week, and peak hourly win windows automatically.",
  },
  {
    icon: BrainCircuit,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    title: "AI Coach Attribution",
    desc: "Plain-English AI diagnostics surface patterns like '89% win rate on London XAUUSD vs 38% during late NY chop.'",
  },
  {
    icon: Search,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
    title: "Deep Multi-Account Filter",
    desc: "Isolate prop firm accounts, live portfolios, symbols, setups, and rule-compliance streaks in one clean click.",
  },
];

const PROBLEMS = [
  "Hours of repetitive manual logging after every market close",
  "Human bias omits bad losing trades and breaks accuracy",
  "Impossible to calculate MAE/MFE & session expectancy manually",
  "Provides zero real-time warning when discipline slips",
];

const SOLUTIONS = [
  "Zero manual entry — executions sync directly from your broker",
  "Captures exact commissions, swap fees, and slippage automatically",
  "Computes true R-multiples, drawdown streaks, and profit factors",
  "AI Coach highlights precisely what to double down on or stop",
];

export default function SmartJournalPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login", { state: { mode: "signup" } });
  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const [symFilter, setSymFilter] = useState<"ALL" | "XAUUSD" | "US30" | "EURUSD">("ALL");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
  }, []);

  const filteredTrades =
    symFilter === "ALL" ? TRADES : TRADES.filter((t) => t.sym === symFilter);

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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider mb-6">
                <BookOpen size={13} />
                <span>Smart Trade Journal</span>
              </div>

              <h1
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[36px] sm:text-[52px] lg:text-[58px] tracking-[-0.035em] leading-[1.06] text-slate-900 mb-5"
              >
                <span className="font-bold block">Stop trading</span>
                <span className="font-extralight text-slate-500">completely </span>
                <span className="font-semibold text-[#2563EB]">blind.</span>
              </h1>

              <p className="text-[15.5px] sm:text-[17px] font-light text-slate-500 leading-relaxed max-w-[500px] mb-8">
                Every trade synced automatically from MT5 and connected brokers into 40+ institutional analytics — exposing which setups pay you and which habits drain equity.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStart}
                  className="tactile-blue-pill h-11 px-7 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Connect Broker Free</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("sj-features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-11 px-6 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[14px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Explore metrics
                </button>
              </div>
            </motion.div>

            {/* Right: Crisp White Journal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="lg:col-span-6"
            >
              <div className="rounded-[24px] bg-[#F8FAFC] border border-slate-200/90 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.12)] p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {METRICS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.label}
                        className="rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-2xs"
                      >
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1`}>
                          <Icon size={13} className={m.color} />
                          <span>{m.label}</span>
                        </div>
                        <div className="text-[22px] font-extrabold text-slate-900 font-mono tabular-nums">
                          {m.value}
                        </div>
                        <div className={`text-[10.5px] font-semibold ${m.color} mt-0.5`}>
                          {m.change} this month
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Coach Highlight */}
                <div className="rounded-2xl bg-blue-50/75 border border-blue-200/80 p-4 mb-4">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                    <BrainCircuit size={13} />
                    <span>AI Coach Pattern Insight</span>
                  </div>
                  <p className="text-[13px] font-semibold text-slate-900">
                    “Your XAUUSD win rate climbs to 89% during London Open.”
                  </p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    Focusing risk there improves monthly expectancy by +1.4R.
                  </p>
                </div>

                {/* Filter + Trade List */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Verified Fills
                  </span>
                  <div className="inline-flex items-center gap-1 bg-white border border-slate-200/80 rounded-lg p-0.5">
                    {(["ALL", "XAUUSD", "US30", "EURUSD"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSymFilter(f)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                          symFilter === f
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredTrades.map((t) => (
                    <div
                      key={`${t.sym}-${t.time}`}
                      className="rounded-xl bg-white border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            t.win ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        <div>
                          <div className="text-[12.5px] font-bold text-slate-900">
                            {t.sym}{" "}
                            <span
                              className={`text-[10.5px] font-bold ${
                                t.dir === "BUY" ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {t.dir}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            {t.time} · {t.tag}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div
                          className={`text-[13px] font-bold ${
                            t.win ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {t.pnl}
                        </div>
                        <div className="text-[10px] text-slate-400">RR {t.rr}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* DESKTOP SHOWCASE */}
        <section className="py-12 sm:py-16 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-[660px] mx-auto mb-10">
              <p className="text-[12.5px] font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
                Automated Attribution
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[40px] font-bold tracking-[-0.03em] leading-[1.12] text-slate-900"
              >
                Every trade tracked{" "}
                <span className="font-extralight text-slate-500">automatically.</span>
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
                  TradiFive Terminal · AI Smart Journal
                </span>
                <span className="text-[10.5px] font-semibold text-[#2563EB]">
                  Auto-Sync
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden mt-3 bg-slate-900 border border-slate-200/80">
                <img
                  src="/journaldesktop.png"
                  alt="Smart Journal Platform"
                  className="w-full h-auto block object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section id="sj-features" className="py-16 sm:py-20 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-12">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[40px] font-bold tracking-[-0.03em] text-slate-900"
              >
                Everything the Journal <span className="font-extralight text-slate-500">tracks.</span>
              </h2>
              <p className="text-[15px] text-slate-500 mt-3 max-w-[480px] mx-auto">
                Institutional-grade analytics automatically structured from live executions.
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

        {/* COMPARISON */}
        <section className="py-16 sm:py-20 px-4 sm:px-7 bg-[#F8FAFC] border-y border-slate-200/70">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-12">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[26px] sm:text-[38px] font-bold tracking-[-0.03em] text-slate-900"
              >
                Manual Spreadsheets <span className="font-extralight text-slate-500">vs Smart Journal.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-rose-200/90 p-7 shadow-2xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <X size={18} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">Manual Spreadsheets</h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                      Incomplete &amp; Biased
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {PROBLEMS.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                      <span className="mt-1 w-4 h-4 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        ✕
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-white border border-emerald-200/90 p-7 shadow-2xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">TradiFive Smart Journal</h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      Automated &amp; Verified
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {SOLUTIONS.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[13.5px] text-slate-700 font-medium">
                      <span className="mt-1 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
              Know your edge. <span className="font-extralight text-slate-500">Scale it cleanly.</span>
            </h2>
            <p className="text-[15px] text-slate-500 mb-8">
              Connect your MT5 or broker account in under a minute.
            </p>
            <button
              onClick={handleStart}
              className="tactile-blue-pill h-11 px-8 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start Journaling Free</span>
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
