import React, { useEffect, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  Monitor,
  Smartphone,
  Zap,
  Shield,
  Bell,
  BarChart2,
  MessageSquare,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Users,
  BookText,
  Sparkles,
  Crown,
  Rss,
  ArrowRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MOBILE_FEATURES = [
  {
    icon: BarChart2,
    title: "Live Portfolio",
    desc: "Track all MT5 accounts in real time — equity, drawdown headroom, win rate, and open exposure in your pocket.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Instant price triggers, daily drawdown threshold alerts, and post-session review nudges.",
  },
  {
    icon: Shield,
    title: "Risk Guard Mobile",
    desc: "Adjust drawdown caps or trigger an emergency kill-switch cleanly from anywhere.",
  },
  {
    icon: MessageSquare,
    title: "Community Pulse",
    desc: "Read verified setups, follow signal channels, and reply inside direct mentor DMs on the move.",
  },
  {
    icon: Trophy,
    title: "Competition Radar",
    desc: "Monitor live tournament rankings and get notified the moment positions move.",
  },
  {
    icon: Zap,
    title: "Auto-Synced Journal",
    desc: "Every trade fills and syncs automatically to your journal without opening a desktop spreadsheet.",
  },
];

const SCREENS = [
  { title: "Dashboard", desc: "Real-time P&L & equity curve", icon: LayoutDashboard, color: "text-[#2563EB] bg-blue-50 border-blue-200" },
  { title: "Risk Guard", desc: "Live drawdown & kill-switch", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { title: "Pulse Feed", desc: "Verified social trade stream", icon: Rss, color: "text-violet-600 bg-violet-50 border-violet-200" },
  { title: "Smart Journal", desc: "Automated fill attribution", icon: BookOpen, color: "text-sky-600 bg-sky-50 border-sky-200" },
];

const DESKTOP_FEATURES = [
  {
    icon: Monitor,
    title: "Multi-Workspace Layouts",
    desc: "Coordinate live analytics charts, journals, Risk Guard telemetry, and community channels cleanly.",
  },
  {
    icon: Zap,
    title: "Direct MT5 Bridge",
    desc: "Sub-10ms broker telemetry streaming directly with institutional encryption and clean uptime.",
  },
  {
    icon: BarChart2,
    title: "Session Expectancy Suite",
    desc: "Break down win rate, MAE/MFE, Sharpe, and time-of-day expectancy across accounts.",
  },
  {
    icon: Shield,
    title: "Autonomous Risk Guard",
    desc: "Background session locking, daily loss limits, and per-trade lot governance enforced automatically.",
  },
];

const APP_SHOWCASE_TABS = [
  {
    num: "01",
    icon: Users,
    badge: "bg-blue-50 text-[#2563EB] border-blue-200",
    label: "Community",
    title: "The trading network built for modern traders.",
    desc: "Follow verified performers, browse structured trade ideas, join channels, and stay sharp inside a noise-free feed.",
    bullets: [
      "Broker-verified social trade feed",
      "Public & private analyst channels",
      "Direct messaging with mentors",
      "Real track-record badges",
    ],
    btnText: "Explore Community",
    screenshot: "/community.jpeg",
  },
  {
    num: "02",
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Risk Guard",
    title: "Protect your capital before emotions take over.",
    desc: "Monitor live drawdown budgets, set automated daily caps, and arm cooldown protection directly from your device.",
    bullets: [
      "Daily loss limit enforcement",
      "Max drawdown kill-switch",
      "Revenge-trade cooldown timer",
      "Real-time margin alerts",
    ],
    btnText: "Activate Risk Guard",
    screenshot: "/risk_guard_.jpeg",
  },
  {
    num: "03",
    icon: BookText,
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    label: "AI Journal",
    title: "Every trade tracked automatically.",
    desc: "Connect your broker once and TradiFive logs, tags, and analyzes every execution cleanly on desktop & mobile.",
    bullets: [
      "Zero manual trade entry",
      "Instant R-multiple breakdowns",
      "Session & pair expectancy maps",
      "Clean setup notes & tags",
    ],
    btnText: "Open Journal",
    screenshot: "/journal page.jpeg",
  },
  {
    num: "04",
    icon: Sparkles,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "AI Coach",
    title: "Your personal trading mentor.",
    desc: "Get calm, actionable coaching over your own fills — identifying overtrading patterns before they hit your P&L.",
    bullets: [
      "Automated trade audits",
      "Psychology Talks voice & chat",
      "Streak & rule coaching",
      "Weekly improvement focus",
    ],
    btnText: "Ask AI Coach",
    screenshot: "/aicoach page.jpeg",
  },
  {
    num: "05",
    icon: Crown,
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Creator Hub",
    title: "Build your audience on verified truth.",
    desc: "Launch curated signal broadcast channels, share mentorship recaps, and scale an authenticated trader following.",
    bullets: [
      "Verified channel signal logs",
      "Structured audience tools",
      "Live broadcast rooms",
      "Creator performance cards",
    ],
    btnText: "Launch Creator Hub",
    screenshot: "/creator hub.jpeg",
  },
];

export default function DownloadAppPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login", { state: { mode: "signup" } });
  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
  }, []);

  const active = APP_SHOWCASE_TABS[activeFeature];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <PublicNavbar
        alwaysLight
        onSignIn={handleSignIn}
        onSignUp={handleStart}
        onDownloadClick={() => {}}
      />

      <main>
        {/* HERO */}
        <section className="pt-28 sm:pt-36 pb-16 px-4 sm:px-7">
          <div className="max-w-[960px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider mb-6">
                <Smartphone size={13} />
                <span>Apps for Every Platform</span>
              </div>

              <h1
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[36px] sm:text-[54px] tracking-[-0.035em] leading-[1.08] text-slate-900 mb-5"
              >
                <span className="font-bold">Take TradiFive</span>
                <span className="block font-extralight text-slate-500">
                  everywhere you trade.
                </span>
              </h1>

              <p className="text-[15.5px] sm:text-[17px] font-light text-slate-500 leading-relaxed max-w-[560px] mx-auto mb-10">
                Institutional-grade risk governance on your desktop. Clean execution insights in your pocket across iOS, Android, macOS, and Windows.
              </p>
            </motion.div>

            {/* Download Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="max-w-[440px] mx-auto rounded-[24px] bg-[#F8FAFC] border border-slate-200/95 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.12)] p-7 sm:p-9"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mx-auto mb-5 text-slate-900">
                <Smartphone size={26} />
              </div>
              <h2 className="text-[21px] font-bold text-slate-900 mb-2">
                TradiFive Companion
              </h2>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">
                Monitor open drawdown limits, review journal entries, and chat inside verified community channels on iOS &amp; Android.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={handleStart}
                  className="tactile-blue-pill w-full h-11 rounded-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>App Store — iOS Early Access</span>
                </button>
                <button
                  onClick={handleStart}
                  className="tactile-black-pill w-full h-11 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone size={16} />
                  <span>Google Play — Android Beta</span>
                </button>
              </div>

              <div className="mt-5 inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                Desktop &amp; Web Live · Mobile Rolling Out
              </div>
            </motion.div>
          </div>
        </section>

        {/* INTERACTIVE 5-SYSTEM MOBILE SHOWCASE */}
        <section id="app-preview" className="py-16 sm:py-24 px-4 sm:px-7 bg-[#F8FAFC] border-y border-slate-200/70">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-[660px] mx-auto mb-10">
              <p className="text-[12.5px] font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
                Inside TradiFive
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[30px] sm:text-[44px] font-bold tracking-[-0.03em] leading-[1.1] text-slate-900 mb-3"
              >
                Five powerful systems.{" "}
                <span className="block font-extralight text-slate-500">
                  One pocket ecosystem.
                </span>
              </h2>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {APP_SHOWCASE_TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const isSelected = activeFeature === idx;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveFeature(idx)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[12.5px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Feature Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.num}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-5 ${active.badge}`}
                    >
                      Feature {active.num} · {active.label}
                    </span>
                    <h3
                      style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                      className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] leading-[1.12] text-slate-900 mb-4"
                    >
                      {active.title}
                    </h3>
                    <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
                      {active.desc}
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {active.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-center gap-2.5 text-[13.5px] font-medium text-slate-700"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={2.8} />
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleStart}
                      className="tactile-blue-pill h-11 px-7 rounded-full text-[13.5px] font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>{active.btnText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.screenshot}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="relative w-[275px] sm:w-[295px] h-[560px] sm:h-[600px] rounded-[42px] border-[10px] border-slate-900 bg-slate-950 shadow-[0_28px_60px_-15px_rgba(15,23,42,0.28)] overflow-hidden"
                  >
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-950 rounded-full z-10 border border-white/10" />
                    <img
                      src={active.screenshot}
                      alt={active.label}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* EVERYTHING IN YOUR POCKET */}
        <section className="py-16 sm:py-24 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[12.5px] font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
                Mobile Companion
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900"
              >
                Everything <span className="font-extralight text-slate-500">in your pocket.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {SCREENS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.title}
                      className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-6 text-center flex flex-col items-center justify-center gap-3 aspect-[0.82]"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${s.color}`}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="text-[14px] font-bold text-slate-900">{s.title}</div>
                      <div className="text-[12px] text-slate-500 leading-snug">{s.desc}</div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-7 space-y-3.5">
                {MOBILE_FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 mb-1">
                          {f.title}
                        </h4>
                        <p className="text-[13px] text-slate-500 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* DESKTOP TERMINAL */}
        <section className="py-16 sm:py-20 px-4 sm:px-7 bg-[#F8FAFC] border-y border-slate-200/70">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[12.5px] font-semibold text-violet-600 uppercase tracking-wider mb-2">
                Desktop &amp; Web Terminal
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900"
              >
                Built for <span className="font-extralight text-slate-500">focused desks.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {DESKTOP_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15.5px] font-bold text-slate-900 mb-1.5">
                        {f.title}
                      </h4>
                      <p className="text-[13.5px] text-slate-500 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-7 text-center">
          <div className="max-w-[580px] mx-auto">
            <h2
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[30px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900 mb-4"
            >
              Start on any device. <span className="font-extralight text-slate-500">Free.</span>
            </h2>
            <p className="text-[15px] text-slate-500 mb-8">
              One workspace synced smoothly across web, desktop, and mobile.
            </p>
            <button
              onClick={handleStart}
              className="tactile-blue-pill h-11 px-8 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </main>

      <PublicFooter lightMode />
    </div>
  );
}
