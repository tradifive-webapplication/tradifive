import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowRight,
  Layers,
  Globe,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { supabase } from "@/integrations/supabase/client";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ════════════════
   HERO PRODUCT SHOWCASE FRAME
════════════════ */
function HeroDashboard({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.16, ease: EASE_OUT }}
      onClick={onStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStart();
        }
      }}
      title="Open TradiFive Workspace"
      className="relative w-full max-w-[1040px] mx-auto rounded-[20px] p-1.5 sm:p-2 bg-white/95 border border-slate-200/90 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.20),0_0_0_1px_rgba(15,23,42,0.04)] overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative rounded-[14px] overflow-hidden bg-white border border-slate-200/70">
        <img
          src="/hero-dashboard-preview.jpg"
          alt="TradiFive trading dashboard showing P&L, cumulative equity, TradiFive Score, P&L calendar, and Risk Guard"
          className="w-full h-auto block select-none"
        />
      </div>
    </motion.div>
  );
}

/* ════════════════
   HERO
════════════════ */
function Hero({ onStart }: { onStart: () => void; onSignIn: () => void }) {
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Top Space Sky + Planetary Horizon Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] sm:h-[740px] overflow-hidden"
        style={{ backgroundColor: "#020617" }}
      >
        <img
          src="/hero-space-horizon.jpg"
          alt=""
          className="w-full h-full object-cover object-bottom select-none"
        />
        {/* Calm dark cosmic veil behind text, transitioning into crisp white at the base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(3,7,18,0.66) 0%, rgba(3,7,18,0.34) 40%, rgba(3,7,18,0) 64%, rgba(255,255,255,0.78) 86%, #ffffff 100%)",
          }}
        />
      </div>

      {/* Centered Hero Content */}
      <div className="relative z-10 max-w-[1120px] mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="text-[13px] font-medium text-blue-200/80 mb-5"
        >
          TradiFive · Risk Guard &amp; Automated Journal
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: EASE_OUT }}
          className="text-[38px] sm:text-[56px] lg:text-[64px] font-semibold tracking-[-0.035em] leading-[1.06] text-white max-w-[820px]"
        >
          Your trading edge,
          <br />
          finally under control
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: EASE_OUT }}
          className="mt-5 max-w-[540px] text-[16px] sm:text-[18px] font-normal leading-[1.58] text-slate-200/85"
        >
          Automated broker sync, autonomous drawdown protection, and AI trade review in one institutional workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: EASE_OUT }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={onStart}
            className="h-11 px-6 rounded-full bg-white text-[#090D16] hover:bg-slate-100 text-[14px] font-semibold inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-colors duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span>Get started free</span>
            <ArrowRight size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/features/tradifive-ai")}
            className="h-11 px-5 rounded-full bg-white/[0.10] hover:bg-white/[0.16] border border-white/20 text-white text-[14px] font-medium backdrop-blur-md transition-colors duration-150 cursor-pointer active:scale-[0.98]"
          >
            Explore TradiFive AI
          </button>
        </motion.div>

        {/* Product Dashboard Showcase */}
        <div className="w-full mt-12 sm:mt-16">
          <HeroDashboard onStart={onStart} />
        </div>
      </div>

      {/* Smooth Gradient Bridge into #07090F Sections Below */}
      <div
        aria-hidden="true"
        className="w-full h-24 sm:h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(226,232,240,0.45) 28%, rgba(13,16,23,0.90) 72%, #07090F 100%)",
        }}
      />
    </section>
  );
}

/* ════════════════
   PLATFORM PILLARS TICKER
════════════════ */
const CORE_FEATURES = [
  "Social trading feed",
  "Live competitions",
  "Autonomous Risk Guard",
  "Automated trade journal",
  "FiAlgo engine",
  "Real-time leaderboards",
  "MT5 broker bridge",
  "Verified track records",
];

function PlatformPillars() {
  return (
    <section className="py-12 overflow-hidden relative bg-[#07090F]">
      <div className="text-center mb-6 px-4">
        <p className="text-[13px] font-medium text-slate-400">
          Built for disciplined execution across every market
        </p>
      </div>
      <div className="pillar-mask">
        <div className="br-track">
          {[...CORE_FEATURES, ...CORE_FEATURES].map((label, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-[#0D1017] text-[13px] font-medium text-slate-300 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   PROBLEM / WHY TRADIFIVE
════════════════ */
function Problem() {
  return (
    <section id="problem" className="py-24 sm:py-28 px-4 sm:px-7 relative">
      <div className="max-w-[1160px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <span className="text-[13px] font-medium text-blue-400 mb-3">
            Why TradiFive
          </span>
          <h2 className="text-[28px] sm:text-[40px] font-semibold tracking-[-0.03em] leading-[1.12] text-slate-50 mb-12">
            Trading is more than charts
            <span className="block text-slate-400 mt-1 text-[22px] sm:text-[30px] font-medium">
              It comes down to psychology and discipline
            </span>
          </h2>

          <div className="w-full text-left">
            <AgentBentoGrid />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════
   HOW IT WORKS
════════════════ */
function HowItWorks() {
  const STEPS = [
    {
      num: "01",
      icon: Users,
      title: "Create your account",
      desc: "Set up your verified trader profile and workspace preferences in under a minute.",
      meta: "Setup · 60s",
      previewTitle: "@disciplined_trader",
      previewSub: "Pro workspace initialized",
      previewStatus: "Ready",
    },
    {
      num: "02",
      icon: Layers,
      title: "Connect your broker",
      desc: "Link any MT5 account via read/execute bridge while keeping 100% of funds on your broker.",
      meta: "MT5 bridge · 4ms",
      previewTitle: "MetaTrader 5 Bridge",
      previewSub: "Capital stays isolated at broker",
      previewStatus: "Synced",
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Activate Risk Guard",
      desc: "Configure daily loss caps and max trade rules. Breaches trigger an automatic cooldown lock.",
      meta: "Autonomous protection",
      previewTitle: "Drawdown Shield",
      previewSub: "Max daily loss limit 3.0%",
      previewStatus: "Armed",
    },
    {
      num: "04",
      icon: Globe,
      title: "Join the community",
      desc: "Follow verified traders, subscribe to broadcast channels, and compete on live leaderboards.",
      meta: "Verified network",
      previewTitle: "Broadcast Channels",
      previewSub: "Verified live track records",
      previewStatus: "Active",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-28 px-4 sm:px-7 relative">
      <div className="max-w-[1160px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium text-blue-400 mb-3">Workflow</p>
          <h2 className="text-[30px] sm:text-[42px] font-semibold tracking-[-0.03em] leading-[1.12] text-slate-50 mb-4">
            From setup to consistent execution
            <span className="block text-slate-400 font-medium mt-1">
              in four structured steps
            </span>
          </h2>
          <p className="text-[15px] text-slate-400 max-w-[520px] mx-auto leading-relaxed">
            Journaling, risk enforcement, AI review, and community accountability working from one unified feed.
          </p>
        </div>

        {/* Minimal Desktop Step Rail */}
        <div className="hidden lg:block relative mb-6 px-10">
          <div className="absolute top-[18px] left-16 right-16 h-px bg-white/[0.10]" />
          <div className="grid grid-cols-4 relative z-10">
            {STEPS.map((step) => (
              <div key={step.num} className="flex justify-center">
                <div className="w-9 h-9 rounded-full bg-[#0D1017] border border-white/[0.14] flex items-center justify-center text-[12px] font-medium text-slate-200 tabular-nums">
                  {step.num}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Clean Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE_OUT }}
                className="rounded-2xl bg-[#0D1017] border border-white/[0.08] hover:border-white/[0.16] p-6 flex flex-col justify-between gap-6 transition-colors duration-150"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-medium text-slate-400 tabular-nums">
                      {step.meta}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold text-slate-50 mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="rounded-xl bg-[#07090F] border border-white/[0.07] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-medium text-slate-200 truncate">
                      {step.previewTitle}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {step.previewStatus}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1 truncate">
                    {step.previewSub}
                  </p>
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
   PRICING
════════════════ */
function Pricing({ onStart }: { onStart: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite">("pro");

  return (
    <section id="pricing" className="py-24 sm:py-28 px-4 sm:px-7 relative">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[13px] font-medium text-blue-400 mb-3">Pricing</p>
          <h2 className="text-[30px] sm:text-[42px] font-semibold tracking-[-0.03em] leading-[1.12] text-slate-50 mb-4">
            Simple, predictable plans
            <span className="block text-slate-400 font-medium mt-1">
              Invest in your edge
            </span>
          </h2>
          <p className="text-[15.5px] text-slate-400 max-w-[580px] mx-auto leading-relaxed">
            Start free with core trade journaling and discipline tracking. Upgrade anytime as your capital scales.
          </p>
        </div>

        <div className="relative z-10 w-full">
          <PricingCards
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onUpgradeClick={onStart}
            isStandalone={true}
          />
        </div>

        <p className="text-center mt-10 text-[13px] font-medium text-slate-500">
          No credit card required to start · Instant access · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ════════════════
   SOCIAL PROOF
════════════════ */
const TESTIS = [
  {
    name: "Priya Mehra",
    role: "Day Trader, Pune",
    init: "PM",
    text: "Seeing real verified P&Ls from other traders keeps me accountable. My win rate jumped from 42% to 67% in two months.",
  },
  {
    name: "Rahul Sharma",
    role: "IIT Delhi Graduate",
    init: "RS",
    text: "Risk Guard stopped me from revenge trading after a bad morning session. Saved my account more than once.",
  },
  {
    name: "Kavita Trivedi",
    role: "Swing Trader, Mumbai",
    init: "KT",
    text: "Won the November trading competition and qualified for a funded account. The leaderboard keeps your focus sharp daily.",
  },
  {
    name: "Arjun Das",
    role: "Software Engineer, Bengaluru",
    init: "AD",
    text: "Auto-Sync Journal eliminated manual logging. The AI coach spotted that I was overleveraging on Mondays.",
  },
  {
    name: "Sneha Kapoor",
    role: "Forex Trader, Hyderabad",
    init: "SK",
    text: "Following verified setups from disciplined traders taught me more than any course. Zero noise.",
  },
  {
    name: "Vikram Singh",
    role: "Business Owner, Delhi",
    init: "VS",
    text: "Everyone here connects live MT5 accounts so results are verifiable. No fake gurus, no edited screenshots.",
  },
];

const STATS = [
  { val: "12,400+", label: "Active traders" },
  { val: "₹2.8M", label: "Competition prizes" },
  { val: "94%", label: "Rule adherence" },
  { val: "40+", label: "MT5 brokers" },
];

function Social() {
  return (
    <section id="wall-of-fame" className="py-24 sm:py-28 relative overflow-hidden">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-7">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-[#0D1017] border border-white/[0.08] p-6 text-center"
            >
              <div className="text-[28px] sm:text-[32px] font-semibold text-slate-50 tracking-[-0.02em] tabular-nums leading-none">
                {s.val}
              </div>
              <div className="text-[13px] font-medium text-slate-400 mt-2.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <p className="text-[13px] font-medium text-blue-400 mb-3">
            From the community
          </p>
          <h2 className="text-[28px] sm:text-[38px] font-semibold tracking-[-0.03em] leading-[1.12] text-slate-50">
            Traders who chose to grow together
          </h2>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden flex"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 16%, black 84%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 16%, black 84%, transparent)",
        }}
      >
        <div className="testimonials-track flex gap-5 py-2">
          {[...TESTIS, ...TESTIS].map((t, i) => (
            <div
              key={i}
              className="w-[320px] shrink-0 rounded-2xl bg-[#0D1017] border border-white/[0.08] p-6 flex flex-col justify-between gap-6"
            >
              <p className="text-[14px] text-slate-300 leading-relaxed font-normal">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161B26] border border-white/[0.10] flex items-center justify-center text-[11px] font-semibold text-slate-200 shrink-0">
                  {t.init}
                </div>
                <div>
                  <div className="text-[13.5px] font-medium text-slate-100">
                    {t.name}
                  </div>
                  <div className="text-[12px] text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
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
  {
    q: "How is my MT5 connection secured?",
    a: "Tradifive connects via MetaAPI with read/execute permissions only — we can never withdraw funds or modify account ownership. All traffic is encrypted with TLS 1.3 in transit and AES-256 at rest.",
  },
  {
    q: "Is my trading performance verified?",
    a: "Yes. When you connect your MT5 broker account, your trade history and live positions sync directly from the broker feed so your profile reflects verifiable execution.",
  },
  {
    q: "What is the minimum account size?",
    a: "You can start free on any demo account. For live trading, we recommend sufficient capital to support conservative 0.5% to 1.0% risk sizing per trade.",
  },
  {
    q: "Which brokers are supported?",
    a: "Tradifive works with 40+ MT5-compatible brokers including IC Markets, Pepperstone, FP Markets, XM, Exness, Tickmill, Vantage, and prop firm accounts.",
  },
  {
    q: "How do trading competitions work?",
    a: "Monthly competitions track P&L and rule adherence directly from connected accounts on a transparent leaderboard. Top disciplined performers earn prizes and funded challenges.",
  },
  {
    q: "What does the AI Coach analyze?",
    a: "The AI Coach audits your synced trade journal, flags behavioral patterns such as overleveraging or revenge entries after losses, and summarizes actionable weekly adjustments.",
  },
];

function FAQItem({
  f,
  i,
  open,
  setOpen,
}: {
  f: { q: string; a: string };
  i: number;
  open: number | null;
  setOpen: (i: number | null) => void;
}) {
  const isOpen = open === i;

  return (
    <div
      onClick={() => setOpen(isOpen ? null : i)}
      className={`rounded-2xl border p-5 sm:p-6 cursor-pointer transition-colors duration-150 ${
        isOpen
          ? "bg-[#121620] border-white/[0.16]"
          : "bg-[#0D1017] border-white/[0.08] hover:border-white/[0.14]"
      }`}
    >
      <div className="flex justify-between items-center gap-4">
        <h4 className="text-[15px] font-medium text-slate-100">{f.q}</h4>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-200" : ""
          }`}
        />
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/[0.07] text-[14px] text-slate-400 leading-relaxed">
              {f.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 sm:py-28 px-4 sm:px-7 relative">
      <div className="max-w-[780px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[13px] font-medium text-blue-400 mb-3">
            Frequently asked questions
          </p>
          <h2 className="text-[28px] sm:text-[38px] font-semibold tracking-[-0.03em] leading-[1.12] text-slate-50">
            Answers for serious traders
          </h2>
          <p className="text-[15px] text-slate-400 mt-3">
            Security, broker integrations, and platform mechanics.
          </p>
        </div>

        <div className="grid gap-3">
          {FAQS.map((f, i) => (
            <FAQItem key={f.q} f={f} i={i} open={open} setOpen={setOpen} />
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
  const innerRing = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    angle: (i / 6) * 360,
    r: 135,
    avatar: ((i * 3) % 15) + 1,
    gender: i % 2 === 0 ? "men" : "women",
  }));
  const outerRing = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 7,
    angle: (i / 6) * 360 + 30,
    r: 250,
    avatar: ((i * 5 + 2) % 15) + 1,
    gender: i % 2 === 0 ? "men" : "women",
  }));
  const allNodes = [...innerRing, ...outerRing];
  const cx = 340;
  const cy = 300;
  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos(((angle - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((angle - 90) * Math.PI) / 180),
  });

  const benefits = [
    {
      title: "Pulse feed",
      desc: "Share verified trade setups, profit milestones, and market reviews with followers in real time.",
    },
    {
      title: "Signal channels",
      desc: "Subscribe to verified trader broadcast rooms with structured execution alerts pushed to your workspace.",
    },
    {
      title: "Direct messages",
      desc: "Collaborate 1-on-1 with mentors and trading partners inside your workspace.",
    },
    {
      title: "Webinar rooms",
      desc: "Join live breakdown sessions hosted by verified traders to review setups and risk strategy.",
    },
  ];

  return (
    <section className="py-24 sm:py-28 px-4 sm:px-7 relative overflow-hidden">
      <div className="max-w-[1160px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[13px] font-medium text-blue-400 mb-3">
            Global network
          </p>
          <h2 className="text-[30px] sm:text-[46px] font-semibold tracking-[-0.03em] leading-[1.1] text-slate-50 max-w-[780px] mx-auto mb-5">
            Thousands of traders use TradiFive
            <span className="block text-slate-400 font-medium mt-1">
              to learn, verify, and grow together
            </span>
          </h2>
          <p className="text-[16px] text-slate-400 max-w-[540px] mx-auto leading-relaxed mb-8">
            Share verified setups, learn from live market sessions, and connect directly with disciplined traders worldwide.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="h-11 px-6 rounded-full bg-white text-[#090D16] hover:bg-slate-200 text-[14px] font-semibold inline-flex items-center gap-2 transition-colors duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span>Join the community</span>
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Clean Architectural Orbital Network */}
          <div className="relative w-full aspect-[680/600] max-w-[560px] mx-auto">
            <svg viewBox="0 0 680 600" className="w-full h-full">
              <circle
                cx={cx}
                cy={cy}
                r={135}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
              />
              <circle
                cx={cx}
                cy={cy}
                r={250}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />

              {innerRing.map((n) => {
                const p = toXY(n.angle, n.r);
                return (
                  <line
                    key={`spoke-${n.id}`}
                    x1={cx}
                    y1={cy}
                    x2={p.x}
                    y2={p.y}
                    stroke="rgba(59,130,246,0.22)"
                    strokeWidth="1"
                  />
                );
              })}

              {outerRing.map((n) => {
                const outer = toXY(n.angle, n.r);
                const nearestInner = innerRing.reduce((best, inn) => {
                  const diff = Math.abs(((inn.angle - n.angle + 360) % 360));
                  const prevDiff = Math.abs(((best.angle - n.angle + 360) % 360));
                  return diff < prevDiff ? inn : best;
                });
                const inner = toXY(nearestInner.angle, nearestInner.r);
                return (
                  <line
                    key={`outer-conn-${n.id}`}
                    x1={outer.x}
                    y1={outer.y}
                    x2={inner.x}
                    y2={inner.y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {allNodes.map((n) => {
                const p = toXY(n.angle, n.r);
                const size = n.r === 135 ? 38 : 30;
                return (
                  <g key={n.id}>
                    <clipPath id={`clip-${n.id}`}>
                      <circle cx={p.x} cy={p.y} r={size} />
                    </clipPath>
                    <image
                      href={`/avatars/${n.gender}_${n.avatar}.jpg`}
                      x={p.x - size}
                      y={p.y - size}
                      width={size * 2}
                      height={size * 2}
                      clipPath={`url(#clip-${n.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={size}
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              <circle
                cx={cx}
                cy={cy}
                r={44}
                fill="#0D1017"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
              />
              <image href="/favicon.png" x={cx - 22} y={cy - 22} width="44" height="44" />
            </svg>
          </div>

          {/* 4 Structured Feature Rows */}
          <div className="flex flex-col gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-[#0D1017] border border-white/[0.08] hover:border-white/[0.15] p-6 transition-colors duration-150"
              >
                <h3 className="text-[16px] font-semibold text-slate-50 mb-1.5">
                  {b.title}
                </h3>
                <p className="text-[14px] text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   CLOSING CTA
════════════════ */
function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-28 sm:py-32 px-4 sm:px-7 relative">
      <div className="max-w-[680px] mx-auto text-center">
        <p className="text-[13px] font-medium text-blue-400 mb-3">
          Start your workspace
        </p>
        <h2 className="text-[32px] sm:text-[48px] font-semibold tracking-[-0.03em] leading-[1.08] text-slate-50 mb-5">
          Become the trader
          <span className="block text-slate-400 font-medium mt-1">
            you set out to be
          </span>
        </h2>
        <p className="text-[16px] text-slate-400 leading-relaxed max-w-[540px] mx-auto mb-9">
          Join TradiFive for automated trade journaling, autonomous Risk Guard, AI coaching, and verified community feedback.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
          <button
            type="button"
            onClick={onStart}
            className="h-11 px-7 rounded-full bg-white text-[#090D16] hover:bg-slate-200 text-[14px] font-semibold inline-flex items-center gap-2 transition-colors duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span>Start free today</span>
            <ArrowRight size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("problem");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-11 px-6 rounded-full bg-[#0D1017] hover:bg-[#141822] border border-white/[0.12] text-slate-200 text-[14px] font-medium transition-colors duration-150 cursor-pointer"
          >
            Explore capabilities
          </button>
        </div>

        <p className="text-[12px] font-medium text-slate-500">
          No credit card required · Free community access · Cancel anytime
        </p>
      </div>
    </section>
  );
}

function Sep() {
  return (
    <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-7">
      <div className="h-px w-full bg-white/[0.07]" />
    </div>
  );
}

/* ════════════════
   ROOT
════════════════ */
export default function TradiFive() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery = hash.includes("type=recovery") || search.includes("type=recovery");
    const hasAuthToken = hash.includes("access_token=") || search.includes("code=");
    const hasAuthError = hash.includes("error=") || search.includes("error=");

    if (isRecovery) {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }

    if (hasAuthToken || hasAuthError) {
      navigate(`/auth-callback${search}${hash}`, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      import("./Login").catch((err) => console.warn("Preload Login failed:", err));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
    document.body.style.backgroundColor = "#07090F";
    document.body.style.color = "#ffffff";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  // Touch supabase client reference gently so build trees stay consistent
  void supabase;

  return (
    <div
      style={{
        background: "#07090F",
        color: "#fff",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <PublicNavbar
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onDownloadClick={() => navigate("/download")}
      />

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
