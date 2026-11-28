import React, { useEffect, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  Sparkles,
  Brain,
  Shield,
  MessageCircle,
  BarChart3,
  Zap,
  Target,
  ChevronDown,
  ArrowRight,
  AudioLines,
  ArrowUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const aiCoachFeatures = [
  {
    icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    title: "Real-Time Behavioral Interventions",
    description:
      "Detects position sizing spikes, rapid re-entries after losses, and tilt patterns before damage compounds across your live account.",
  },
  {
    icon: Shield,
    color: "text-[#2563EB]",
    bg: "bg-blue-50 border-blue-200",
    title: "Risk Guard Integration",
    description:
      "Works hand-in-hand with your daily drawdown guardrails. Warns with full trade context rather than generic alert noise.",
  },
  {
    icon: MessageCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    title: "Natural Language Session Audits",
    description:
      "Ask \"Why did I miss my target on Tuesday?\" or \"Compare NY Open vs London fills\" and receive structured debriefs in seconds.",
  },
  {
    icon: BarChart3,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    title: "Psychological Edge Diagnostics",
    description:
      "Quantifies whether you cut winners early, move stops wider under stress, or overtrade during choppy low-volume sessions.",
  },
  {
    icon: Zap,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    title: "Instant Voice & Chat Mode",
    description:
      "Switch between text coaching and Psychology Talks voice mode during pre-market prep or right after a tense close.",
  },
  {
    icon: Target,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
    title: "Adaptive Pattern Memory",
    description:
      "Builds a living playbook around your real broker history — reinforcing winning behaviors as your capital scales.",
  },
];

const faqItems = [
  {
    question: "How does the AI Coach analyze my trades?",
    answer:
      "TradiFive AI audits your synced execution history — entry/exit timing, risk per trade, streaks, and rule adherence — cross-referenced directly with your trading plan.",
  },
  {
    question: "Is my trading data secure and private?",
    answer:
      "Yes. Your execution data is encrypted end-to-end, isolated per workspace, and never shared with third parties or trained across other traders.",
  },
  {
    question: "Can the AI Coach prevent me from overtrading?",
    answer:
      "Yes. Coupled with Risk Guard, the coach detects post-loss impulse windows and automatically enforces your cooldown lockouts when thresholds hit.",
  },
  {
    question: "Does it work with MT5 and Indian brokers?",
    answer:
      "Yes. Both MetaTrader 5 accounts and supported Indian brokers sync cleanly into your TradiFive AI Coach memory.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes. Every free account includes core AI journaling queries and session insights, with Pro & Elite unlocking higher daily AI reasoning limits.",
  },
];

const SAMPLE_PROMPTS = [
  {
    label: "Audit Tilt Windows",
    q: "When am I most likely to take impulsive entries?",
    a: "Impulse entries peak within 18 minutes of a stop-out between 15:30–16:30 UTC. Activating a 30-min Risk Guard cooldown recovers ~$1,850/month.",
  },
  {
    label: "Best Session Edge",
    q: "Which market session generates my cleanest R-multiple?",
    a: "NY Open XAU/USD holds an 84% win rate (+2.64R avg) when capped at 2 trades per session. Asian session fills average -0.35R expectancy.",
  },
  {
    label: "Drawdown Safety",
    q: "Check my current weekly drawdown & rule adherence",
    a: "Weekly drawdown sits at 0.8% against your 3.0% hard stop (73% headroom remaining) across 14 consecutive rule-compliant sessions.",
  },
];

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof faqItems)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl border p-5 sm:p-6 cursor-pointer transition-colors ${
        isOpen
          ? "bg-[#F8FAFC] border-blue-200 shadow-sm"
          : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
      }`}
    >
      <div className="flex justify-between items-center gap-4">
        <h4 className="text-[15px] font-bold text-slate-900">{item.question}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={17} className="text-slate-400 shrink-0" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-slate-200/80 text-[14px] text-slate-600 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TradifiveAIPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login", { state: { mode: "signup" } });
  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
  }, []);

  const currentSample = SAMPLE_PROMPTS[promptIdx];

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
        <section className="pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-7">
          <div className="max-w-[1100px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-6">
                <Sparkles size={13} />
                <span>TradiFive AI Coach</span>
              </div>

              <h1
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[36px] sm:text-[54px] lg:text-[62px] tracking-[-0.035em] leading-[1.06] text-slate-900 max-w-[820px] mx-auto mb-5"
              >
                <span className="font-bold">Meet your AI </span>
                <span className="font-extralight text-slate-500">trading </span>
                <span className="font-semibold text-[#2563EB]">psychologist.</span>
              </h1>

              <p className="text-[15.5px] sm:text-[17.5px] font-light text-slate-500 leading-relaxed max-w-[600px] mx-auto mb-9">
                TradiFive AI reads every trade across your broker history, spots discipline leaks before they escalate, and coaches you back to peak execution.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                <button
                  onClick={handleStart}
                  className="tactile-blue-pill h-11 px-7 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Try TradiFive AI Free</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("ai-capabilities")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-11 px-6 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[14px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Explore capabilities
                </button>
              </div>
            </motion.div>

            {/* Interactive Live Prompt Simulator Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="max-w-[780px] mx-auto text-left rounded-[24px] bg-[#F8FAFC] border border-slate-200/95 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.12)] p-4 sm:p-6 mb-14"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Interactive AI Preview
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PROMPTS.map((sp, idx) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => setPromptIdx(idx)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                        promptIdx === idx
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                    <Sparkles size={15} className="text-[#2563EB] shrink-0" />
                    <span>{currentSample.q}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="tactile-black-pill w-8 h-8 rounded-full inline-flex items-center justify-center">
                      <AudioLines size={13} />
                    </span>
                    <span className="tactile-blue-pill w-8 h-8 rounded-full inline-flex items-center justify-center">
                      <ArrowUp size={13} />
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={promptIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate-600"
                  >
                    {currentSample.a}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Desktop Platform Preview */}
            <div className="rounded-[24px] bg-white border border-slate-200/95 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.12)] overflow-hidden p-3 sm:p-4">
              <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  TradiFive Terminal · AI Coach Workspace
                </span>
                <span className="text-[10.5px] font-semibold text-[#2563EB]">
                  Active Memory
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden mt-3 bg-slate-900 border border-slate-200/80">
                <img
                  src="/aicoachdesktop.png"
                  alt="TradiFive AI Coach Dashboard"
                  className="w-full h-auto block object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MINI AI COACH SPOTLIGHT */}
        <section className="py-16 sm:py-20 px-4 sm:px-7 bg-[#F8FAFC] border-y border-slate-200/70">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-5">
                Always with you
              </span>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[30px] sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-slate-900 mb-4"
              >
                Mini AI Coach.{" "}
                <span className="block font-extralight text-slate-500">
                  Always ready on every screen.
                </span>
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
                Summon instant coaching directly inside your journal, dashboard, or Risk Guard panel the moment hesitation or FOMO hits — no context switching required.
              </p>
              <button
                onClick={handleStart}
                className="tactile-blue-pill h-10 px-6 rounded-full text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Unlock AI Coach</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="rounded-[24px] bg-white border border-slate-200/90 p-4 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.12)] max-w-[380px] w-full">
                <img
                  src="/minicoach.png"
                  alt="Mini AI Coach Preview"
                  className="w-full h-auto rounded-2xl block border border-slate-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section id="ai-capabilities" className="py-16 sm:py-24 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[12.5px] font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
                AI Capabilities
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900 mb-3"
              >
                Your trading psychology,{" "}
                <span className="font-extralight text-slate-500">decoded &amp; coached.</span>
              </h2>
              <p className="text-[15px] text-slate-500 max-w-[520px] mx-auto">
                Six intelligent systems working together to shift your execution from impulsive to systematic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {aiCoachFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
                    className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:border-blue-200 transition-colors"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${feat.bg} ${feat.color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <h4 className="text-[16.5px] font-bold text-slate-900 mb-2">
                      {feat.title}
                    </h4>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      {feat.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 px-4 sm:px-7 bg-[#F8FAFC] border-t border-slate-200/70">
          <div className="max-w-[780px] mx-auto">
            <div className="text-center mb-12">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[38px] font-bold tracking-[-0.03em] text-slate-900 mb-3"
              >
                Frequently Asked{" "}
                <span className="font-extralight text-slate-500">Questions</span>
              </h2>
              <p className="text-[14.5px] text-slate-500">
                Everything you need to know about TradiFive AI Coach.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <FAQItem
                  key={item.question}
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>

            <div className="text-center mt-14">
              <p className="text-[14.5px] text-slate-500 mb-4">
                Start free and test the AI Coach on your own trade log.
              </p>
              <button
                onClick={handleStart}
                className="tactile-blue-pill h-11 px-8 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter lightMode />
    </div>
  );
}
