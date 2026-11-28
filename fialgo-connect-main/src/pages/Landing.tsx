import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import {
  motion,
  AnimatePresence,
  useInView,
  animate,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Users,
  ArrowRight,
  Layers,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Paperclip,
  AudioLines,
  ArrowUp,
  X,
  Search,
  Crown,
  TrendingUp,
  Plus,
  Upload,
  Share2,
  SlidersHorizontal,
  CalendarDays,
  Newspaper,
  Shield,
  Flame,
  Info,
  BookOpen,
  BarChart3,
  FileText,
  LayoutGrid,
  Check,
  CheckCircle2,
  AlertTriangle,
  Target,
  Zap,
  Lock,
} from "lucide-react";
import {
  Home as IconlyHome,
  Category as IconlyCategory,
  Document as IconlyDocument,
  ShieldDone as IconlyShieldDone,
  Activity as IconlyActivity,
  TicketStar as IconlyTicketStar,
  AddUser as IconlyAddUser,
  Message as IconlyMessage,
  Notification as IconlyNotification,
  Lock as IconlyLock,
} from "react-iconly";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { supabase } from "@/integrations/supabase/client";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";
import BlurText from "@/components/ui/BlurText";
import { MT5_BROKER_LOGOS } from "@/components/MT5BrokerLogos";
import { TradeSlotsBlobStrip } from "@/components/ui/TradeSlotBlobCheckbox";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Switch } from "@/components/ui/switch";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AI_PLACEHOLDERS = [
  "Audit my XAU/USD risk exposure this month...",
  "Why did I overtrade after my NY Open stop loss?",
  "Check my daily drawdown buffer and win-rate streak...",
];

const AI_PRESETS: Array<{ label: string; prompt: string; reply: string }> = [
  {
    label: "Audit",
    prompt: "Audit my recent XAU/USD and EUR/USD executions",
    reply:
      "Last 17 trades: 82% win rate · 2.23R avg reward-to-risk. London/NY overlap entries outperform Asian session by +$4,120. Keep max risk capped at 0.75% per setup.",
  },
  {
    label: "Drawdown",
    prompt: "Check my current Risk Guard drawdown buffer",
    reply:
      "Daily drawdown is 0.8% against your 3.0% hard stop (73% buffer remaining). Zero rule breaches across your 14-day disciplined streak.",
  },
  {
    label: "Overtrade",
    prompt: "When am I most likely to take impulsive entries?",
    reply:
      "Impulse risk spikes 22 minutes after a stopped-out trade. Enabling a 30-min Risk Guard cooldown protects ~$1,850/month in recovered equity.",
  },
];

/* ════════════════
   PROPER AI COACH HERO COMPOSER (Opaque Crisp Wide Composer)
════════════════ */
function HeroAICoachBox({ onStart }: { onStart: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [typedLen, setTypedLen] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewReply, setPreviewReply] = useState<{
    prompt: string;
    reply: string;
  } | null>(null);
  const [accountScope, setAccountScope] = useState<
    "All Accounts" | "MT5 #4829" | "Funded 100K"
  >("All Accounts");
  const [coachMode, setCoachMode] = useState<"TradiFive AI" | "Psychology Talks">(
    "TradiFive AI"
  );

  // Typewriter cycling animation for empty input
  useEffect(() => {
    if (query.length > 0) return;
    const current = AI_PLACEHOLDERS[placeholderIdx];

    const delay =
      !isDeleting && typedLen === current.length
        ? 1900
        : isDeleting && typedLen === 0
          ? 350
          : isDeleting
            ? 22
            : 40;

    const timer = setTimeout(() => {
      if (!isDeleting && typedLen < current.length) {
        setTypedLen((v) => v + 1);
      } else if (!isDeleting && typedLen === current.length) {
        setIsDeleting(true);
      } else if (isDeleting && typedLen > 0) {
        setTypedLen((v) => v - 1);
      } else {
        setIsDeleting(false);
        setPlaceholderIdx((i) => (i + 1) % AI_PLACEHOLDERS.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, placeholderIdx, typedLen, isDeleting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim() || AI_PLACEHOLDERS[placeholderIdx].replace(/\.\.\.$/, "");
    const matched = AI_PRESETS.find((p) =>
      trimmed.toLowerCase().includes(p.label.toLowerCase())
    );
    setPreviewReply({
      prompt: trimmed,
      reply:
        matched?.reply ||
        `[${coachMode} · ${accountScope}] Analyzed execution context: 82% win rate, 2.23R average reward-to-risk, 0.8% daily drawdown vs 3.0% limit. Create a free account to audit your own MT5 history live.`,
    });
  };

  const handleVoiceClick = () => {
    setCoachMode("Psychology Talks");
    setPreviewReply({
      prompt: "Voice Coach · Psychology & Impulse Check",
      reply:
        "[Psychology Talks · Voice Mode] Pre-session reset ready: check tilt triggers, validate your max 0.75% risk per setup, and confirm your NY Open session plan before placing any order.",
    });
  };

  const displayPlaceholder = AI_PLACEHOLDERS[placeholderIdx].slice(0, typedLen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.16, ease: EASE_OUT }}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.58)",
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.86), 0 24px 64px rgba(15, 23, 42, 0.16), 0 4px 18px rgba(15, 23, 42, 0.08)",
      }}
      className="w-full max-w-[680px] mx-auto rounded-[18px] sm:rounded-[22px] backdrop-blur-2xl backdrop-saturate-150 border border-white/65 overflow-hidden text-left"
    >
      <form onSubmit={handleSubmit} className="px-3.5 sm:px-5 pt-3.5 sm:pt-4 pb-3 sm:pb-3.5 space-y-3 sm:space-y-4">
        {/* Clean Typing Area with Trailing Blinking Blue Caret */}
        <div className="relative min-h-[24px] sm:min-h-[26px] flex items-center px-0.5">
          {!query && (
            <div className="pointer-events-none absolute inset-0 flex items-center text-[13px] sm:text-[15px] text-slate-700/90 font-normal overflow-hidden pr-2">
              <span className="truncate">{displayPlaceholder}</span>
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  times: [0, 0.45, 0.5, 0.95],
                }}
                className="inline-block w-[1.8px] h-[16px] sm:h-[18px] bg-[#2563EB] ml-0.5 shrink-0"
              />
            </div>
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Ask TradiFive AI Coach"
            className="w-full bg-transparent text-[13px] sm:text-[15px] font-medium text-slate-900 caret-[#2563EB] outline-none border-none relative z-10"
          />
        </div>

        {/* Clean Toolbar: Left Context & Mode Pills + Right Voice & Send */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-0.5">
          {/* Left Controls: Attach + Account Selector + AI Mode Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <button
              type="button"
              onClick={onStart}
              title="Import trade log or screenshot"
              className="w-8 h-8 rounded-full border border-white/90 bg-white/95 hover:bg-white text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,0.06)] flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <Paperclip size={13.5} strokeWidth={1.85} />
            </button>

            <button
              type="button"
              onClick={() =>
                setAccountScope((s) =>
                  s === "All Accounts"
                    ? "MT5 #4829"
                    : s === "MT5 #4829"
                      ? "Funded 100K"
                      : "All Accounts"
                )
              }
              className="h-8 px-2.5 sm:px-3 rounded-full border border-white/90 bg-white/95 hover:bg-white text-[11px] sm:text-[12px] font-medium text-slate-800 shadow-[0_1px_4px_rgba(15,23,42,0.06)] inline-flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{accountScope}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() =>
                setCoachMode((m) =>
                  m === "TradiFive AI" ? "Psychology Talks" : "TradiFive AI"
                )
              }
              className="h-8 inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 rounded-full border border-white/90 bg-white/95 hover:bg-white text-[11px] sm:text-[12px] font-medium text-slate-800 shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles size={12.5} className="text-[#2563EB] shrink-0" />
              <span className="sm:hidden">
                {coachMode === "Psychology Talks" ? "Psych AI" : "TradiFive AI"}
              </span>
              <span className="hidden sm:inline">{coachMode}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>
          </div>

          {/* Right Controls: Voice Button + Send Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleVoiceClick}
              aria-label="Talk with Psychology Voice Coach"
              title="Voice / Psychology Talks"
              className="tactile-black-pill h-8 w-9 sm:w-10 rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer"
            >
              <AudioLines size={14} strokeWidth={2.1} />
            </button>

            <button
              type="submit"
              aria-label="Send to TradiFive AI Coach"
              title="Send prompt"
              className="tactile-blue-pill h-8 w-9 sm:w-10 rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ArrowUp size={15} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </form>

      {/* Instant Live Preview Response Drawer */}
      <AnimatePresence initial={false}>
        {previewReply && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50"
          >
            <div className="px-5 py-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[12.5px] font-normal text-slate-700 leading-relaxed">
                  {previewReply.reply}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewReply(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer shrink-0"
                  aria-label="Close preview"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => navigate("/features/tradifive-ai")}
                  className="text-[11.5px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Learn how AI Coach works
                </button>
                <button
                  type="button"
                  onClick={onStart}
                  className="tactile-blue-pill h-7.5 px-4 py-1 rounded-full text-[11.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Start Free</span>
                  <ArrowRight size={11.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════
   CRISP HD LIVE REACT PRODUCT DASHBOARD (Zero Blurry Image)
════════════════ */
const DASHBOARD_SURFACE_CARD =
  "bg-white rounded-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] border border-slate-200/70";

function AnimatedMetric({
  value,
  active,
  prefix = "",
  suffix = "",
  decimals = 0,
  startFrom = 0,
  comma = true,
}: {
  value: number;
  active: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  startFrom?: number;
  comma?: boolean;
}) {
  const [display, setDisplay] = useState(startFrom);

  useEffect(() => {
    if (!active) return;
    const controls = animate(startFrom, value, {
      duration: 3.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [value, active, startFrom]);

  const formatted =
    decimals > 0
      ? comma
        ? display.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
        : display.toFixed(decimals)
      : comma
        ? Math.round(display).toLocaleString("en-US")
        : String(Math.round(display));

  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
}

const DASHBOARD_TIMEFRAMES: Record<
  "All" | "1D" | "7D" | "1M",
  {
    pnlNum: number;
    record: string;
    winRate: number;
    avgRRNum: number;
    profitFactorNum: number;
    avgWin: number;
    avgLoss: number;
    balanceNum: number;
    growth: string;
  }
> = {
  All: {
    pnlNum: 12530,
    record: "14W / 3L · 17 closed trades",
    winRate: 82,
    avgRRNum: 2.23,
    profitFactorNum: 16.1,
    avgWin: 954.29,
    avgLoss: 276.67,
    balanceNum: 37530,
    growth: "+50.1%",
  },
  "1D": {
    pnlNum: 1420,
    record: "2W / 0L · 2 closed trades",
    winRate: 100,
    avgRRNum: 2.8,
    profitFactorNum: 18.4,
    avgWin: 710,
    avgLoss: 0,
    balanceNum: 37530,
    growth: "+3.9%",
  },
  "7D": {
    pnlNum: 4890,
    record: "6W / 1L · 7 closed trades",
    winRate: 86,
    avgRRNum: 2.45,
    profitFactorNum: 14.2,
    avgWin: 892.5,
    avgLoss: 265,
    balanceNum: 37530,
    growth: "+15.0%",
  },
  "1M": {
    pnlNum: 10840,
    record: "12W / 2L · 14 closed trades",
    winRate: 85,
    avgRRNum: 2.31,
    profitFactorNum: 15.8,
    avgWin: 938,
    avgLoss: 270,
    balanceNum: 37530,
    growth: "+40.6%",
  },
};

const CALENDAR_DAYS = [
  { d: "", pnl: "" },
  { d: "", pnl: "" },
  { d: "", pnl: "" },
  { d: "", pnl: "" },
  { d: "1", pnl: "+$620", pos: true },
  { d: "2", pnl: "", pos: null },
  { d: "3", pnl: "+$1,120", pos: true },
  { d: "4", pnl: "-$280", pos: false },
  { d: "5", pnl: "+$940", pos: true },
  { d: "6", pnl: "+$1,380", pos: true },
  { d: "7", pnl: "", pos: null },
  { d: "8", pnl: "+$750", pos: true },
  { d: "9", pnl: "+$1,640", pos: true },
  { d: "10", pnl: "+$890", pos: true },
  { d: "11", pnl: "+$1,450", pos: true },
  { d: "12", pnl: "-$240", pos: false },
  { d: "13", pnl: "", pos: null },
  { d: "14", pnl: "+$980", pos: true },
  { d: "15", pnl: "+$1,210", pos: true },
  { d: "16", pnl: "+$650", pos: true },
  { d: "17", pnl: "+$1,420", pos: true },
];

function HeroDashboard({ onStart }: { onStart: () => void }) {
  const dashRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<"All" | "1D" | "7D" | "1M">("All");
  const [scoreWindow, setScoreWindow] = useState<"30d" | "all">("all");
  const stats = DASHBOARD_TIMEFRAMES[timeframe];
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (stats.winRate / 100) * circumference;

  // Trigger slow count-up numbers & graph animations cleanly when scrolled into view
  const isDashInView = useInView(dashRef, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={dashRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.22, ease: EASE_OUT }}
      onClick={onStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStart();
        }
      }}
      title="Open TradiFive Live Workspace"
      className="relative w-full max-w-[1180px] mx-auto rounded-[20px] sm:rounded-[24px] p-1.5 sm:p-2.5 bg-white border border-slate-200/90 shadow-[0_18px_48px_-14px_rgba(15,23,42,0.10),0_0_0_1px_rgba(15,23,42,0.06)] overflow-visible cursor-pointer text-left select-none"
    >
      {/* Exact TradiFive Light Mode Multi-Panel Workspace Shell */}
      <div className="rounded-[15px] sm:rounded-[18px] bg-[#F2F4F8] border border-slate-200/80 p-1.5 sm:p-2.5 flex gap-2.5 sm:min-h-[600px] overflow-visible">
        {/* PRIMARY NAVIGATION RAIL (Double White Capsule + Soft Gray Inner Pill, matching AppSidebar.tsx) */}
        <div className="hidden xl:flex flex-col items-center justify-between w-[56px] shrink-0 gap-2">
          {/* Top White Outer Capsule */}
          <div className="w-full flex-1 flex flex-col items-center py-1.5 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            {/* Inner Gray Navigation Pill */}
            <div className="w-[44px] rounded-[22px] bg-[#f4f7fb] flex flex-col items-center py-2.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] gap-2 relative">
              {/* TF Monogram Mark */}
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/tf-logo.png"
                  alt="TradiFive"
                  className="w-7 h-7 object-contain"
                />
              </div>

              {/* Hairline Divider */}
              <div className="w-5 h-[1px] bg-slate-200 -mt-0.5" />

              {/* Real App Pillars */}
              <div className="w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <IconlyHome size={14} set="curved" stroke="bold" primaryColor="currentColor" />
              </div>

              <div className="relative w-[32px] h-[32px] rounded-[11px] bg-white text-slate-800 shadow-sm border border-slate-200/60 flex items-center justify-center">
                <IconlyCategory size={14} set="curved" stroke="bold" primaryColor="currentColor" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2.5px] h-[16px] bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>

              <div className="w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <IconlyDocument size={14} set="curved" stroke="bold" primaryColor="currentColor" />
              </div>

              <div className="w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <IconlyShieldDone size={14} set="curved" stroke="bold" primaryColor="currentColor" />
              </div>

              <div className="w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-[#2563EB] hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Sparkles size={14} strokeWidth={2} />
              </div>

              <div className="relative w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center opacity-85 transition-colors">
                <IconlyActivity size={14} set="curved" stroke="bold" primaryColor="currentColor" />
                <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white border border-slate-200/90 text-slate-500 flex items-center justify-center shadow-2xs">
                  <IconlyLock size={7} set="curved" stroke="bold" primaryColor="currentColor" />
                </div>
              </div>
            </div>

            {/* Vertical Version Text */}
            <div className="flex-1 w-full flex items-center justify-center min-h-[70px] py-2 select-none">
              <span className="text-[8px] font-extrabold tracking-[0.2em] text-slate-400 rotate-[-90deg] whitespace-nowrap uppercase">
                TRADIFIVE v1.2
              </span>
            </div>
          </div>

          {/* Bottom Rewards & Referrals White Capsule */}
          <div className="w-full flex-shrink-0 flex flex-col items-center p-1.5 bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mt-auto">
            <div className="w-[44px] rounded-[22px] bg-[#f4f7fb] flex flex-col items-center py-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] gap-1.5">
              <div className="w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <IconlyTicketStar size={14} set="curved" stroke="bold" primaryColor="currentColor" />
              </div>
              <div className="w-[32px] h-[32px] rounded-[11px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <IconlyAddUser size={14} set="curved" stroke="bold" primaryColor="currentColor" />
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY NAVIGATION SIDEBAR (matches WorkspaceSwitcher + AppSidebar.tsx) */}
        <aside className="hidden lg:flex flex-col justify-between w-[196px] shrink-0 px-1.5 py-1.5">
          <div className="space-y-3.5">
            {/* Exact Brand Header Logo */}
            <div className="flex items-center px-1.5 pt-1">
              <img
                src="/Tradifive_logo1.png"
                alt="TradiFive"
                className="h-[22px] w-auto object-contain"
              />
            </div>

            {/* Exact App Search Input */}
            <div className="relative h-[34px] rounded-2xl bg-white border border-slate-200/80 px-3 flex items-center justify-between text-[10.5px] text-slate-400 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Search size={12} className="text-slate-400 shrink-0" />
                <span className="truncate font-medium">Search navigation…</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-400 border border-slate-200 shrink-0">
                ⌘K
              </span>
            </div>

            {/* Communication */}
            <div className="space-y-1">
              <div className="px-2 text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                Communication
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 hover:bg-white/60 transition-colors">
                <span className="text-slate-400 flex items-center">
                  <IconlyMessage size={14} set="curved" stroke="bold" primaryColor="currentColor" />
                </span>
                <span>Inbox</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 hover:bg-white/60 transition-colors">
                <span className="inline-flex items-center gap-2.5">
                  <span className="text-slate-400 flex items-center">
                    <IconlyNotification size={14} set="curved" stroke="bold" primaryColor="currentColor" />
                  </span>
                  <span>Notifications</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              </div>
            </div>

            {/* Trading Dashboard */}
            <div className="space-y-1">
              <div className="px-2 text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                Trading Dashboard
              </div>
              <div className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-900 shadow-sm">
                <span className="text-slate-800 flex items-center">
                  <IconlyCategory size={14} set="curved" stroke="bold" primaryColor="currentColor" />
                </span>
                <span>Main Dashboard</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3.5px] h-5 bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 hover:bg-white/60 transition-colors">
                <span className="text-slate-400 flex items-center">
                  <IconlyDocument size={14} set="curved" stroke="bold" primaryColor="currentColor" />
                </span>
                <span>Reports &amp; Statements</span>
              </div>
            </div>
          </div>

          {/* Bottom Elite Card + Profile */}
          <div className="space-y-2.5">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/75 border border-amber-200/75 p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-900">
                <Crown size={12} className="text-amber-500" />
                <span>TradiFive</span>
                <span className="text-amber-600">Elite</span>
              </div>
              <p className="text-[9.5px] leading-[1.35] text-slate-600 text-center">
                Unlock unlimited AI features, premium metrics &amp; full API copy trading.
              </p>
              <div className="w-full h-7 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(245,158,11,0.28)]">
                <Sparkles size={10.5} />
                <span>Upgrade Elite</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1.5 pt-1.5 border-t border-slate-200/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  NH
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-semibold text-slate-900 truncate">
                    Nikhil Harake
                  </div>
                  <div className="text-[9px] text-emerald-600 font-medium">
                    Online
                  </div>
                </div>
              </div>
              <ChevronDown size={11} className="text-slate-400 shrink-0" />
            </div>
          </div>
        </aside>

        {/* Right Main Dashboard Container */}
        <div className="flex-1 min-w-0 flex flex-col rounded-2xl bg-[#F8FAFC] border border-slate-200/75 overflow-visible">
          {/* Top Utility Bar */}
          <div className="h-10 bg-white/95 rounded-t-2xl border-b border-slate-200/70 px-4 flex items-center justify-between gap-2">
            <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5">
              <span>Main Menu</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">Dashboard</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-semibold text-amber-700">
                <span>★</span> 0 XP
              </span>
              <span className="h-6 px-2.5 rounded-full bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold inline-flex items-center">
                10/10 +
              </span>
              <span className="h-6 px-2.5 rounded-full bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold inline-flex items-center gap-1">
                <Sparkles size={10} className="text-[#2563EB]" />
                <span>AI Coach</span>
              </span>
            </div>
          </div>

          {/* Dashboard Canvas */}
          <div className="p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-visible">
            {/* Title + Exact Dashboard Capsule Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[15px] sm:text-[17px] font-bold tracking-tight text-slate-900 leading-tight">
                  Dashboard
                </h2>
                <p className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium">
                  Fri, Nov 27, 2026
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Mobile Compact Live Broker Pill */}
                <div className="flex md:hidden items-center gap-1.5 bg-white rounded-full px-2.5 py-1 border border-slate-200/80 shadow-2xs text-[9.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-700">MT5 · Live</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono font-bold text-slate-900">$37,790</span>
                </div>

                {/* Exact Dashboard Broker Status + Action Pill Group */}
                <div className="hidden md:flex items-center gap-2 bg-white rounded-full pl-3 pr-1.5 py-1 border border-slate-200/75 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Exness MT5 · Live</span>
                  </div>
                  <div className="h-3.5 w-px bg-slate-200" />
                  <div className="text-[10px] font-medium text-slate-400 font-mono">
                    Equity{" "}
                    <span className="font-semibold text-slate-800">$37,790</span>
                  </div>
                  <div className="h-3.5 w-px bg-slate-200" />
                  <div className="flex items-center gap-1">
                    <span className="rounded-full px-2.5 py-0.5 bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                      <Plus size={10} /> Log trade
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold whitespace-nowrap">
                      Import
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold whitespace-nowrap">
                      Connect broker
                    </span>
                  </div>
                </div>

                <span className="rounded-full px-3 py-1 bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold hidden sm:inline-flex items-center gap-1 whitespace-nowrap">
                  <Share2 size={10} /> Share profile
                </span>
                <span className="rounded-full px-3 py-1 bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                  <SlidersHorizontal size={10} /> Widgets
                  <span className="ml-0.5 px-1 rounded bg-blue-50 text-[#2563EB] font-bold text-[9px]">
                    1
                  </span>
                </span>
              </div>
            </div>

            {/* Top Row: Open Canvas Net P&L + Ring (Left) & 3 Dashboard Cards + Pre-market Plan Bar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Net P&L + Analytics Win Ring directly on canvas */}
              <div className="lg:col-span-5 flex items-end justify-between gap-3 px-1">
                <div>
                  <div
                    className="inline-flex items-center p-0.5 rounded-[10px] bg-slate-200/70 mb-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(["All", "1D", "7D", "1M"] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={`relative px-2.5 py-0.5 rounded-[8px] text-[10px] font-semibold transition-colors cursor-pointer ${timeframe === tf
                            ? "bg-white text-slate-900 shadow-[0_1px_4px_rgba(15,23,42,0.09)]"
                            : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">
                    Net P&amp;L · {timeframe === "All" ? "All time" : timeframe}
                  </div>
                  <div className="text-[30px] sm:text-[34px] font-bold tracking-tight text-[#2563EB] leading-none mt-1 font-mono tabular-nums">
                    <AnimatedMetric
                      value={stats.pnlNum}
                      active={isDashInView}
                      prefix="+$"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-medium">
                    {stats.record}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>Analytics →</span>
                    <span className="rounded-[10px] px-2.5 py-0.5 bg-white text-slate-900 border border-slate-200/90 shadow-[0_1.5px_3px_rgba(15,23,42,0.06),inset_0_-1px_1.5px_rgba(15,23,42,0.05)] text-[10px] font-semibold">
                      Hide
                    </span>
                  </div>

                  {/* Scroll-Sweeping SVG Win Rate Donut */}
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center mr-1">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="4.5"
                      />
                      <motion.circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{
                          strokeDashoffset: isDashInView ? strokeOffset : circumference,
                        }}
                        transition={{ duration: 3.0, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                      <span className="text-[10.5px] font-bold text-slate-900 font-mono">
                        <AnimatedMetric
                          value={stats.winRate}
                          active={isDashInView}
                          suffix="%"
                          comma={false}
                        />
                      </span>
                      <span className="text-[7.5px] font-semibold text-slate-400 mt-0.5">
                        WIN
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 3 Metric Cards (Exact Dashboard SURFACE_CARD) + Pre-market Plan Bar */}
              <div className="lg:col-span-7 flex flex-col gap-2 sm:gap-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className={`${DASHBOARD_SURFACE_CARD} px-2.5 sm:px-3.5 py-2.5 sm:py-3 text-center transition-shadow hover:shadow-md`}
                  >
                    <div className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 inline-flex items-center gap-1">
                      <span>Avg RR</span>
                      <Info size={9.5} className="text-slate-300" />
                    </div>
                    <div className="text-[15px] sm:text-[18px] font-bold text-slate-900 mt-1 font-mono tabular-nums">
                      <AnimatedMetric
                        value={stats.avgRRNum}
                        active={isDashInView}
                        decimals={2}
                        suffix="R"
                        comma={false}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -3 }}
                    className={`${DASHBOARD_SURFACE_CARD} px-2.5 sm:px-3.5 py-2.5 sm:py-3 text-center transition-shadow hover:shadow-md`}
                  >
                    <div className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 inline-flex items-center gap-1">
                      <span>Profit Factor</span>
                      <Info size={9.5} className="text-slate-300" />
                    </div>
                    <div className="text-[15px] sm:text-[18px] font-bold text-slate-900 mt-1 font-mono tabular-nums">
                      <AnimatedMetric
                        value={stats.profitFactorNum}
                        active={isDashInView}
                        decimals={2}
                        comma={false}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -3 }}
                    className={`${DASHBOARD_SURFACE_CARD} col-span-2 sm:col-span-1 px-2.5 sm:px-3.5 py-2.5 sm:py-3 text-center transition-shadow hover:shadow-md`}
                  >
                    <div className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 inline-flex items-center gap-1">
                      <span>Avg W / L</span>
                      <Info size={9.5} className="text-slate-300" />
                    </div>
                    <div className="text-[12.5px] sm:text-[13px] font-bold text-slate-900 mt-1 sm:mt-1.5 font-mono tabular-nums">
                      <AnimatedMetric
                        value={stats.avgWin}
                        active={isDashInView}
                        decimals={2}
                        prefix="$"
                        comma={false}
                      />{" "}
                      /{" "}
                      <AnimatedMetric
                        value={stats.avgLoss}
                        active={isDashInView}
                        decimals={2}
                        prefix="$"
                        comma={false}
                      />
                    </div>
                  </motion.div>
                </div>

                <div
                  className={`${DASHBOARD_SURFACE_CARD} px-3.5 py-2 flex items-center justify-between`}
                >
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#2563EB]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Start today&apos;s pre-market plan</span>
                  </span>
                  <ArrowRight size={12} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Middle 3 Chart Cards — Steady Layout, Slow Animated Draw on Scroll */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
              {/* Chart 1: Cumulative P&L */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className={`${DASHBOARD_SURFACE_CARD} p-3.5 flex flex-col justify-between transition-shadow hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-900">
                      <TrendingUp size={12.5} className="text-emerald-500" />
                      <span>Cumulative P&amp;L</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">
                      Closed trade equity curve ·{" "}
                      {timeframe === "All" ? "All time" : timeframe}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11.5px] font-bold text-[#2563EB] font-mono tabular-nums">
                      <AnimatedMetric
                        value={stats.pnlNum}
                        active={isDashInView}
                        prefix="+$"
                      />
                    </div>
                    <div className="text-[8px] font-semibold text-slate-400 uppercase">
                      NET
                    </div>
                  </div>
                </div>

                <svg viewBox="0 0 300 132" className="w-full h-[132px] my-2 overflow-visible">
                  <defs>
                    <linearGradient id="pnlGradHero" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {[16, 48, 80, 112].map((yPos, idx) => (
                    <g key={yPos}>
                      <line
                        x1="28"
                        y1={yPos}
                        x2="294"
                        y2={yPos}
                        stroke="#F1F5F9"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="22"
                        y={yPos + 3}
                        textAnchor="end"
                        fontSize="7.5"
                        fill="#94A3B8"
                        fontFamily="Geist Mono, monospace"
                      >
                        {["$15k", "$10k", "$5k", "$0"][idx]}
                      </text>
                    </g>
                  ))}
                  <motion.path
                    d="M32 112 L58 98 L82 103 L106 86 L130 70 L154 76 L178 58 L202 47 L226 49 L250 32 L274 22 L292 18 L292 112 Z"
                    fill="url(#pnlGradHero)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isDashInView ? 1 : 0 }}
                    transition={{ duration: 3.0, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.path
                    d="M32 112 L58 98 L82 103 L106 86 L130 70 L154 76 L178 58 L202 47 L226 49 L250 32 L274 22 L292 18"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isDashInView ? 1 : 0 }}
                    transition={{ duration: 3.0, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {["Nov 3", "Nov 9", "Nov 16", "Nov 23", "Nov 27"].map((lbl, i) => (
                    <text
                      key={lbl}
                      x={36 + i * 62}
                      y="128"
                      textAnchor="middle"
                      fontSize="7.5"
                      fill="#94A3B8"
                    >
                      {lbl}
                    </text>
                  ))}
                </svg>

                <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>
                    Win rate <strong className="text-slate-700">{stats.winRate}%</strong>
                  </span>
                  <span>17 closed trades</span>
                </div>
              </motion.div>

              {/* Chart 2: Account Balance */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className={`${DASHBOARD_SURFACE_CARD} p-3.5 flex flex-col justify-between transition-shadow hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11.5px] font-bold text-slate-900">
                      Account Balance
                    </div>
                    <div className="flex items-center gap-2.5 text-[9px] text-slate-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" /> Balance
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Deposits
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-0.5 bg-slate-100/90 border border-slate-200/70 rounded-lg p-0.5 text-[9px] font-semibold text-slate-500">
                    <span className="px-1.5 py-0.5">1W</span>
                    <span className="px-1.5 py-0.5">1M</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white text-slate-900 shadow-2xs">
                      All
                    </span>
                  </div>
                </div>

                <svg viewBox="0 0 300 132" className="w-full h-[132px] my-2 overflow-visible">
                  <defs>
                    <linearGradient id="balGradHero" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {[16, 40, 64, 88, 112].map((yPos, idx) => (
                    <g key={yPos}>
                      <line
                        x1="34"
                        y1={yPos}
                        x2="294"
                        y2={yPos}
                        stroke="#F1F5F9"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="28"
                        y={yPos + 3}
                        textAnchor="end"
                        fontSize="7.5"
                        fill="#94A3B8"
                        fontFamily="Geist Mono, monospace"
                      >
                        {["$45k", "$39.5k", "$33k", "$26.5k", "$20k"][idx]}
                      </text>
                    </g>
                  ))}
                  <line
                    x1="36"
                    y1="94"
                    x2="292"
                    y2="94"
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <motion.path
                    d="M36 94 L62 86 L88 89 L114 78 L140 68 L166 72 L192 59 L218 52 L244 54 L270 43 L292 34 L292 112 L36 112 Z"
                    fill="url(#balGradHero)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isDashInView ? 1 : 0 }}
                    transition={{ duration: 3.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.path
                    d="M36 94 L62 86 L88 89 L114 78 L140 68 L166 72 L192 59 L218 52 L244 54 L270 43 L292 34"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isDashInView ? 1 : 0 }}
                    transition={{ duration: 3.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {["Nov 3", "Nov 9", "Nov 14", "Nov 20", "Nov 24", "Nov 27"].map(
                    (lbl, i) => (
                      <text
                        key={lbl}
                        x={40 + i * 50}
                        y="128"
                        textAnchor="middle"
                        fontSize="7.5"
                        fill="#94A3B8"
                      >
                        {lbl}
                      </text>
                    )
                  )}
                </svg>

                <div className="flex items-center justify-between text-[9.5px] pt-1 border-t border-slate-100">
                  <span className="text-slate-400">
                    Start <strong className="text-slate-700 font-mono">$25,000.00</strong>
                  </span>
                  <span className="font-bold text-[#2563EB] font-mono tabular-nums">
                    <AnimatedMetric
                      value={stats.balanceNum}
                      active={isDashInView}
                      startFrom={25000}
                      decimals={2}
                      prefix="$"
                    />{" "}
                    ({stats.growth})
                  </span>
                </div>
              </motion.div>

              {/* Chart 3: TRADIFIVE SCORE */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className={`${DASHBOARD_SURFACE_CARD} p-3.5 flex flex-col justify-between transition-shadow hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1 text-[10.5px] font-bold tracking-wider uppercase text-slate-900">
                      <span>TradiFive Score</span>
                      <Info size={9.5} className="text-slate-300" />
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      All time: 17 closed trades
                    </div>
                    <div
                      className="flex items-center gap-2.5 mt-1 text-[9.5px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setScoreWindow("30d")}
                        className={`pb-0.5 cursor-pointer ${scoreWindow === "30d"
                            ? "font-semibold text-slate-900 border-b-[1.5px] border-slate-900"
                            : "text-slate-400"
                          }`}
                      >
                        30 days
                      </button>
                      <button
                        type="button"
                        onClick={() => setScoreWindow("all")}
                        className={`pb-0.5 cursor-pointer ${scoreWindow === "all"
                            ? "font-semibold text-slate-900 border-b-[1.5px] border-slate-900"
                            : "text-slate-400"
                          }`}
                      >
                        All time
                      </button>
                    </div>
                  </div>
                  <div className="text-right leading-none">
                    <div className="text-[22px] font-bold text-slate-900 font-mono tabular-nums">
                      <AnimatedMetric
                        value={scoreWindow === "all" ? 81 : 84}
                        active={isDashInView}
                        comma={false}
                      />
                    </div>
                    <div className="text-[8.5px] text-slate-400 mt-0.5">
                      17 trades scored
                    </div>
                  </div>
                </div>

                {/* Crisp Vector Radar Pentagon (expands steadily on scroll!) */}
                <div className="flex items-center justify-center my-0.5">
                  <svg viewBox="0 0 220 120" className="w-[196px] h-[108px]">
                    {[38, 28, 18, 9].map((r) => {
                      const pts = [0, 1, 2, 3, 4]
                        .map((k) => {
                          const ang = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
                          return `${110 + r * Math.cos(ang)},${64 + r * Math.sin(ang)}`;
                        })
                        .join(" ");
                      return (
                        <polygon
                          key={r}
                          points={pts}
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      );
                    })}
                    {[0, 1, 2, 3, 4].map((k) => {
                      const ang = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
                      return (
                        <line
                          key={k}
                          x1="110"
                          y1="64"
                          x2={110 + 38 * Math.cos(ang)}
                          y2={64 + 38 * Math.sin(ang)}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      );
                    })}
                    <motion.g
                      initial={{ scale: 0.35, opacity: 0 }}
                      animate={{
                        scale: isDashInView ? 1 : 0.35,
                        opacity: isDashInView ? 1 : 0,
                      }}
                      transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: "110px 64px" }}
                    >
                      <polygon
                        points="110,32.5 146,52 132.5,95 87.5,95 96,59"
                        fill="rgba(15,23,42,0.12)"
                        stroke="#0F172A"
                        strokeWidth="1.6"
                      />
                      <circle cx="87.5" cy="95" r="2.5" fill="#0F172A" />
                    </motion.g>
                    <text x="110" y="18" textAnchor="middle" fontSize="7.5" fill="#64748B">
                      Win rate
                    </text>
                    <text x="155" y="51" textAnchor="start" fontSize="7.5" fill="#64748B">
                      Profit factor
                    </text>
                    <text x="139" y="106" textAnchor="start" fontSize="7.5" fill="#64748B">
                      Avg R
                    </text>
                    <text
                      x="81"
                      y="106"
                      textAnchor="end"
                      fontSize="7.5"
                      fontWeight="700"
                      fill="#0F172A"
                    >
                      Consistency
                    </text>
                    <text x="64" y="51" textAnchor="end" fontSize="7.5" fill="#64748B">
                      Discipline
                    </text>
                  </svg>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      Consistency
                    </span>
                    <span className="font-bold text-slate-900 font-mono">100/100</span>
                  </div>
                  <p className="text-[8px] leading-[1.3] text-slate-400">
                    Consistency is active across 16 unique market days. Steady routine &amp; disciplined pacing.
                  </p>
                  <div className="grid grid-cols-5 gap-1 text-center pt-0.5">
                    {[
                      ["82", "Win", false],
                      ["100", "PF", false],
                      ["100", "Avg R", false],
                      ["100", "Cons.", true],
                      ["25", "Disc.", false],
                    ].map(([val, lbl, active]) => (
                      <div
                        key={String(lbl)}
                        className={`rounded-md py-1 ${active ? "bg-slate-100 border border-slate-200/70" : ""
                          }`}
                      >
                        <div className="text-[9.5px] font-bold text-slate-900 font-mono">
                          {val}
                        </div>
                        <div className="text-[7px] text-slate-400 whitespace-nowrap">
                          {lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Strip: P&L Calendar | News | Risk Guard & Discipline Side-by-Side (Balanced 4/4/4 Proportions) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* P&L Calendar */}
              <div className={`lg:col-span-4 ${DASHBOARD_SURFACE_CARD} p-3`}>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1 text-[10.5px] font-bold text-slate-900 min-w-0">
                    <CalendarDays size={11.5} className="text-slate-500 shrink-0" />
                    <span className="truncate">P&amp;L calendar</span>
                    <span className="text-emerald-600 font-mono shrink-0">
                      <AnimatedMetric
                        value={12530}
                        active={isDashInView}
                        decimals={0}
                        prefix="+$"
                      />
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-700 shrink-0">
                    <ChevronLeft size={9.5} className="text-slate-400" />
                    <span>Nov 2026</span>
                    <ChevronRight size={9.5} className="text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((w, idx) => (
                    <div
                      key={idx}
                      className="text-center text-[7.5px] font-semibold text-slate-400 pb-0.5"
                    >
                      {w}
                    </div>
                  ))}
                  {CALENDAR_DAYS.map((cell, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{
                        opacity: isDashInView ? 1 : 0,
                        scale: isDashInView ? 1 : 0.94,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(idx * 0.04, 0.8),
                        ease: EASE_OUT,
                      }}
                      className={`h-8 rounded-md px-0.5 py-0.5 flex flex-col justify-between text-[7px] ${!cell.d
                          ? "bg-transparent"
                          : cell.pos === true
                            ? "bg-emerald-50/90 border border-emerald-200/70 text-emerald-800"
                            : cell.pos === false
                              ? "bg-rose-50/90 border border-rose-200/70 text-rose-700"
                              : "bg-slate-50 border border-slate-100 text-slate-400"
                        }`}
                    >
                      <span className="font-semibold leading-none pl-0.5">{cell.d}</span>
                      {cell.pnl && (
                        <span className="font-mono font-bold truncate leading-none text-[6.5px] tracking-tighter">
                          {cell.pnl}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* News Feed */}
              <div
                className={`lg:col-span-4 ${DASHBOARD_SURFACE_CARD} p-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                      <Newspaper size={12} className="text-slate-500 shrink-0" />
                      <span>News</span>
                      <span className="text-[9px] font-normal text-slate-400 truncate">
                        Forex Factory · this week
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="inline-flex items-center bg-slate-100 rounded-md p-0.5 text-[8.5px] font-semibold text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-white text-slate-900 shadow-2xs">
                        Day
                      </span>
                      <span className="px-2 py-0.5">Week</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[8.5px] text-slate-500 whitespace-nowrap">
                      <ChevronLeft size={9.5} />
                      <span className="font-medium text-slate-700">Fri, Nov 27</span>
                      <span className="text-[#2563EB] font-semibold">Today</span>
                      <ChevronRight size={9.5} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      {
                        time: "13:30 UTC",
                        ccy: "USD",
                        title: "Core PCE Price Index",
                        impact: "HIGH",
                      },
                      {
                        time: "14:45 UTC",
                        ccy: "USD",
                        title: "Chicago PMI Flash",
                        impact: "MED",
                      },
                      {
                        time: "15:00 UTC",
                        ccy: "EUR",
                        title: "ECB Liquidity Brief",
                        impact: "LOW",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-50/80 border border-slate-100"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.impact === "HIGH"
                                ? "bg-rose-500"
                                : item.impact === "MED"
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                              }`}
                          />
                          <span className="text-[9.5px] font-bold text-slate-700 shrink-0">
                            {item.ccy}
                          </span>
                          <span className="text-[9px] text-slate-600 truncate">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 shrink-0 whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Guard + Discipline Side-by-Side (Clean Unclipped Proportions) */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-2">
                <div className="grid grid-cols-2 gap-2.5 flex-1">
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className={`${DASHBOARD_SURFACE_CARD} p-3 flex flex-col justify-between transition-shadow hover:shadow-md min-w-0`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-900 min-w-0">
                          <Shield size={11} className="text-emerald-600 shrink-0" />
                          <span className="truncate">Risk guard</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold whitespace-nowrap shrink-0">
                          Active
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[16px] font-bold text-slate-900 font-mono leading-none">
                          <AnimatedMetric
                            value={0.8}
                            active={isDashInView}
                            decimals={1}
                            suffix="%"
                            comma={false}
                          />
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                          / 3.0% limit
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: isDashInView ? "27%" : "0%" }}
                        transition={{ duration: 3.0, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className={`${DASHBOARD_SURFACE_CARD} p-3 flex flex-col justify-between transition-shadow hover:shadow-md min-w-0`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-900 min-w-0">
                          <Flame size={11} className="text-amber-500 shrink-0" />
                          <span className="truncate">Discipline</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[8px] font-bold whitespace-nowrap shrink-0">
                          Lv 7
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[16px] font-bold text-slate-900 font-mono leading-none">
                          <AnimatedMetric
                            value={94}
                            active={isDashInView}
                            comma={false}
                          />
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                          / 100 score
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[8px] font-mono pt-1.5 border-t border-slate-100 mt-2 whitespace-nowrap">
                      <span className="text-emerald-600 font-semibold">14d streak</span>
                      <span className="text-[#2563EB] font-bold">+450 XP</span>
                    </div>
                  </motion.div>
                </div>

                {/* Tiny authentic footer utility strip */}
                <div className="flex items-center justify-end gap-3 text-[9px] text-slate-400 px-1">
                  <span>Support</span>
                  <span>Suggest</span>
                  <span>Report</span>
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
const HERO_HEADLINES = [
  {
    line1: "Your edge isn't luck.",
    lightPrefix: "It's",
    accent: "discipline.",
  },
  {
    line1: "The market isn't beating you.",
    lightPrefix: "Your",
    accent: "habits are.",
  },
  {
    line1: "You don't need another strategy.",
    lightPrefix: "You need",
    accent: "self-control.",
  },
];

function Hero({ onStart }: { onStart: () => void; onSignIn: () => void }) {
  const navigate = useNavigate();
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HERO_HEADLINES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const activeHeadline = HERO_HEADLINES[headlineIndex];

  return (
    <section
      className="relative w-full overflow-x-clip"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Top Space Horizon Image + Crisp Twinkling Cosmic Starfield */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[830px] sm:h-[1020px] overflow-hidden"
        style={{ backgroundColor: "#01030A" }}
      >
        <img
          src="/hero-space-bg.avif"
          alt=""
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 14%, black 32%, black 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 14%, black 32%, black 100%)",
          }}
          className="w-full h-full object-cover object-center translate-y-[78px] sm:translate-y-[150px] scale-[1.12] sm:scale-[1.14] select-none"
        />

        {/* Soft Full-Container Atmospheric Glow (zero sharp box edges, fades completely to transparent) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 42% at 50% 60%, rgba(56,189,248,0.16) 0%, rgba(37,99,235,0.14) 45%, transparent 74%)",
          }}
        />

        {/* Crisp Vector Starfield Layer 1 (dense micro-stars) */}
        <motion.svg
          animate={{ opacity: [0.55, 0.98, 0.55] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          viewBox="0 0 1440 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-x-0 top-0 w-full h-[500px]"
        >
          {[
            [48, 62, 0.9],
            [95, 78, 1.2],
            [135, 195, 0.8],
            [180, 145, 1.5],
            [218, 38, 1.0],
            [248, 52, 0.9],
            [290, 268, 1.1],
            [312, 198, 1.3],
            [390, 92, 1.6],
            [445, 240, 1.0],
            [478, 134, 0.8],
            [520, 44, 1.2],
            [588, 165, 1.4],
            [640, 110, 0.9],
            [715, 68, 1.7],
            [790, 185, 1.1],
            [860, 48, 1.3],
            [925, 132, 1.5],
            [968, 250, 0.85],
            [990, 215, 1.0],
            [1065, 74, 1.4],
            [1105, 195, 0.95],
            [1140, 158, 1.6],
            [1215, 62, 1.1],
            [1262, 272, 1.0],
            [1295, 195, 1.3],
            [1365, 108, 1.5],
            [1405, 182, 0.9],
            [78, 310, 1.1],
            [196, 340, 1.0],
            [1190, 325, 1.1],
            [1345, 305, 1.3],
          ].map(([cx, cy, r], i) => (
            <circle
              key={`s1-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={i % 3 === 0 ? "#BAE6FD" : "#FFFFFF"}
            />
          ))}
        </motion.svg>

        {/* Crisp Vector Starfield Layer 2 (counter-twinkling stars + 4-point star sparkles) */}
        <motion.svg
          animate={{ opacity: [0.9, 0.35, 0.9] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          viewBox="0 0 1440 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-x-0 top-0 w-full h-[500px]"
        >
          {[
            [62, 192, 1.2],
            [142, 42, 1.4],
            [168, 275, 0.9],
            [225, 245, 0.9],
            [265, 128, 1.1],
            [355, 138, 1.5],
            [420, 315, 0.85],
            [482, 195, 1.1],
            [545, 295, 1.3],
            [610, 82, 0.9],
            [678, 225, 1.0],
            [752, 128, 1.6],
            [830, 275, 1.2],
            [895, 192, 0.85],
            [962, 92, 1.4],
            [1028, 280, 0.9],
            [1155, 92, 1.1],
            [1185, 225, 1.5],
            [1245, 118, 1.2],
            [1335, 56, 1.6],
            [1395, 245, 1.1],
          ].map(([cx, cy, r], i) => (
            <circle
              key={`s2-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={i % 2 === 0 ? "#FFFFFF" : "#93C5FD"}
            />
          ))}

          {/* Delicate 4-Point Cosmic Star Glints */}
          {[
            [165, 96, 5.5],
            [342, 232, 4.5],
            [1098, 108, 5.5],
            [1288, 168, 5.0],
            [1215, 288, 4.2],
          ].map(([x, y, s], i) => (
            <path
              key={`glint-${i}`}
              d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s
                } Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
              fill={i % 2 === 0 ? "#FFFFFF" : "#BAE6FD"}
              opacity="0.9"
            />
          ))}
        </motion.svg>

        {/* Occasional Faint Shooting Star Across Upper Deep Sky */}
        <motion.div
          animate={{
            x: ["-10vw", "38vw"],
            y: ["0px", "120px"],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 7.5,
            ease: "easeOut",
          }}
          className="hidden sm:block absolute left-[18%] top-[75px] w-[95px] h-[1.5px] rotate-[16deg] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(186,230,253,0.6) 60%, #ffffff 100%)",
          }}
        />

        {/* Seamless veil keeping top text high-contrast and blending evenly through ice-blue into white */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(2,6,23,0.44) 0%, rgba(2,6,23,0.12) 38%, rgba(2,6,23,0) 62%, rgba(239,246,255,0.62) 78%, rgba(255,255,255,0.94) 91%, #ffffff 100%)",
          }}
        />
      </div>

      {/* Centered Hero Stack (shifted gently lower with balanced subheadline & generous space above Dashboard) */}
      <div className="relative z-10 max-w-[1220px] mx-auto px-3.5 sm:px-6 pt-24 sm:pt-44 pb-10 sm:pb-16 flex flex-col items-center text-center">
        {/* Announcement Pill */}
        <motion.button
          type="button"
          onClick={() => navigate("/features/tradifive-ai")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          whileHover={{ y: -1 }}
          className="inline-flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-3 sm:pr-3.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 backdrop-blur-md shadow-[0_4px_20px_rgba(2,6,23,0.3)] text-[11px] sm:text-[12px] font-semibold text-white/95 mb-4 sm:mb-6 max-w-[calc(100vw-28px)] cursor-pointer transition-colors"
        >
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white text-[#2563EB] text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase leading-tight shadow-2xs shrink-0">
            NEW
          </span>
          <span className="truncate">Introducing AI-Powered Trading Intelligence</span>
          <ArrowRight size={12} className="text-white/80 shrink-0" />
        </motion.button>

        {/* React Bits BlurText Editorial Headline (Bold + Thin Weight Contrast, Cycles 3 Headlines) */}
        <div className="min-h-[84px] sm:min-h-[126px] lg:min-h-[144px] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.h1
              key={headlineIndex}
              exit={{ opacity: 0, filter: "blur(8px)", y: -10, transition: { duration: 0.28, ease: EASE_OUT } }}
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[24px] sm:text-[46px] lg:text-[56px] tracking-[-0.035em] leading-[1.12] sm:leading-[1.08] text-white max-w-[1040px] drop-shadow-[0_6px_26px_rgba(1,3,10,0.65)] flex flex-col items-center"
            >
              <BlurText
                as="span"
                text={activeHeadline.line1}
                effect="blur"
                animateBy="words"
                direction="top"
                staggerFrom="start"
                trigger="load"
                delay={105}
                stepDuration={0.35}
                blur={10}
                distance={42}
                className="justify-center font-bold tracking-[-0.038em] text-white"
              />

              <span className="inline-flex flex-wrap items-baseline justify-center gap-x-[0.26em] -mt-0.5 sm:-mt-1">
                <BlurText
                  as="span"
                  text={activeHeadline.lightPrefix}
                  effect="blur"
                  animateBy="words"
                  direction="top"
                  staggerFrom="start"
                  trigger="load"
                  delay={105}
                  initialDelay={320}
                  stepDuration={0.35}
                  blur={10}
                  distance={42}
                  className="justify-center font-extralight tracking-[-0.03em] text-blue-100/85"
                />
                <BlurText
                  as="span"
                  text={activeHeadline.accent}
                  effect="blur"
                  animateBy="words"
                  direction="top"
                  staggerFrom="start"
                  trigger="load"
                  delay={105}
                  initialDelay={430}
                  stepDuration={0.35}
                  blur={10}
                  distance={42}
                  className="justify-center font-semibold tracking-[-0.03em]"
                  pieceClassName="bg-gradient-to-b from-white via-white to-blue-200 bg-clip-text text-transparent"
                />
              </span>
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Attractive High-Contrast Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
          style={{
            fontFamily: "'Manrope', 'Inter', sans-serif",
            textShadow: "0 2px 18px rgba(2,6,23,0.75)",
          }}
          className="mt-3 sm:mt-4 max-w-[600px] px-1 text-[13.5px] sm:text-[16.5px] font-light tracking-[-0.01em] leading-[1.58] text-slate-200/90"
        >
          An AI-powered trading ecosystem built to help you{" "}
          <span className="font-medium text-white">manage risk</span>, understand your psychology, and trade with discipline.
        </motion.p>

        {/* Lowered Sleek Glass AI Coach Composer */}
        <div className="w-full mt-7 sm:mt-12">
          <HeroAICoachBox onStart={onStart} />
        </div>

        {/* Lowered Crisp Steady Live HD Dashboard Showcase */}
        <div id="hero-white-zone" className="w-full mt-9 sm:mt-[92px]">
          <HeroDashboard onStart={onStart} />
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   ONE WORKSPACE INTERACTIVE SHOWCASE (Light Editorial Transition)
════════════════ */
type SessionModuleId =
  | "dashboard"
  | "journal"
  | "community"
  | "risk-guard"
  | "reports"
  | "ai-coach";

interface SessionModuleSpec {
  id: SessionModuleId;
  label: string;
  taglineLead: string;
  taglineAccent: string;
  icon: typeof LayoutGrid;
  metricLabel: string;
  metricValue: string;
  metricSub: string;
  scoreLabel: string;
  scoreValue: number;
  scoreNote: string;
  bullets: Array<{ before: string; accent: string; after: string }>;
}

const SESSION_MODULES: SessionModuleSpec[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    taglineLead: "Where the ",
    taglineAccent: "day starts.",
    icon: LayoutGrid,
    metricLabel: "Net P&L",
    metricValue: "+$12,530",
    metricSub: "14 wins, 3 losses",
    scoreLabel: "TradiFive Score",
    scoreValue: 81,
    scoreNote: "Strongest spoke: consistency 100",
    bullets: [
      { before: "", accent: "Net P&L", after: ", and the exact sessions that moved it" },
      { before: "The ", accent: "TradiFive Score", after: ": win rate, profit factor, avg R, discipline" },
      { before: "A calendar where ", accent: "every trading day is tracked", after: " cleanly" },
      { before: "This week's calendar, plus ", accent: "high-impact news ahead", after: "" },
    ],
  },
  {
    id: "journal",
    label: "Journal",
    taglineLead: "Every fill, ",
    taglineAccent: "zero guesswork.",
    icon: BookOpen,
    metricLabel: "Logged Trades",
    metricValue: "148",
    metricSub: "MT5 & broker auto-synced",
    scoreLabel: "Rule Adherence",
    scoreValue: 94,
    scoreNote: "Setup tags applied across 100% of fills",
    bullets: [
      { before: "5 live ", accent: "metric cards & win-rate ring", after: " synced from MT5" },
      { before: "Open ", accent: "Cumulative P&L, Daily Bars, & Radar", after: " bento grid" },
      { before: "Symbol performance & ", accent: "Long vs Short attribution", after: "" },
      { before: "Full ", accent: "trade ledger with R-multiples", after: " & setup tags" },
    ],
  },
  {
    id: "community",
    label: "Community",
    taglineLead: "Verified traders, ",
    taglineAccent: "zero noise.",
    icon: Users,
    metricLabel: "Verified Traders",
    metricValue: "4,820+",
    metricSub: "Live setups, watchlists & streaks",
    scoreLabel: "Signal Integrity",
    scoreValue: 96,
    scoreNote: "Broker-linked setups only · Real P&L proof",
    bullets: [
      { before: "Live ", accent: "trader feed with MT5 verified receipts", after: "" },
      { before: "Personal ", accent: "market watchlist & Forex Factory news", after: " right beside feed" },
      { before: "Public ", accent: "winning streaks & discipline leaderboards", after: "" },
      { before: "Follow top traders & ", accent: "join private channels", after: " in one click" },
    ],
  },
  {
    id: "risk-guard",
    label: "Risk Guard",
    taglineLead: "Protect capital ",
    taglineAccent: "before tilt hits.",
    icon: ShieldCheck,
    metricLabel: "Daily Buffer Used",
    metricValue: "0.8%",
    metricSub: "3.0% hard daily limit armed",
    scoreLabel: "Safety Readiness",
    scoreValue: 96,
    scoreNote: "Max drawdown kill-switch standing by",
    bullets: [
      { before: "Interactive ", accent: "Daily Trade Limit shield slots", after: " & cooldown locks" },
      { before: "Live ", accent: "Drawdown Depth Gauge", after: " across daily, weekly, monthly caps" },
      { before: "Automated ", accent: "Daily Profit Target milestone lock", after: " to secure wins" },
      { before: "Hard ", accent: "Account Protection floor", after: " & red-folder news blocking" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    taglineLead: "Proof ready ",
    taglineAccent: "for any desk.",
    icon: FileText,
    metricLabel: "Verified Return",
    metricValue: "+50.1%",
    metricSub: "Monthly equity curve snapshot",
    scoreLabel: "Audit Completeness",
    scoreValue: 94,
    scoreNote: "Exportable PDF & shareable public link",
    bullets: [
      { before: "Clean ", accent: "broker-verified equity statements", after: " in one click" },
      { before: "Daily, weekly, and ", accent: "monthly P&L calendar exports", after: "" },
      { before: "Share ", accent: "read-only track records", after: " without exposing capital" },
      { before: "Built for ", accent: "prop challenge reviews", after: " and mentor sign-off" },
    ],
  },
  {
    id: "ai-coach",
    label: "AI Coach",
    taglineLead: "Reads the pattern ",
    taglineAccent: "you missed.",
    icon: Sparkles,
    metricLabel: "Behavior Gain",
    metricValue: "-68%",
    metricSub: "Revenge entries this month",
    scoreLabel: "Coaching Pulse",
    scoreValue: 89,
    scoreNote: "Live memory across your last 30 sessions",
    bullets: [
      { before: "Detects ", accent: "overtrading & revenge loops", after: " automatically" },
      { before: "Turns raw fills into ", accent: "plain-English session debriefs", after: "" },
      { before: "Answers questions over ", accent: "your exact trade history", after: "" },
      { before: "Delivers ", accent: "one crisp focus rule", after: " before tomorrow's bell" },
    ],
  },
];

function OneSessionShowcase({ onStart }: { onStart: () => void }) {
  const [activeId, setActiveId] = useState<SessionModuleId>("dashboard");
  const [liveTick, setLiveTick] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const showcaseInView = useInView(sectionRef, { once: true, amount: 0.22 });
  const [rollPct, setRollPct] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const mountainY = useTransform(scrollYProgress, [0, 0.5, 1], [56, 0, -24]);
  const mountainScale = useTransform(scrollYProgress, [0, 0.45, 1], [1.12, 1.0, 1.03]);

  useEffect(() => {
    if (!showcaseInView) return;
    const ctrl = animate(0, 1, {
      duration: 1.45,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setRollPct(v),
    });
    return () => ctrl.stop();
  }, [showcaseInView]);

  useEffect(() => {
    if (!showcaseInView) return;
    const id = window.setInterval(() => {
      setLiveTick((t) => (t + 1) % 6);
    }, 1500);
    return () => window.clearInterval(id);
  }, [showcaseInView]);

  const pnlOffsets = [0, 18, 44, 28, 62, 36];
  const liveDelta = pnlOffsets[liveTick];
  const liveNetPnl = Math.round((12530 + liveDelta) * rollPct);
  const liveEquity = Math.round((37790 + liveDelta) * rollPct);
  const liveXau = (2648.4 + liveTick * 0.35).toFixed(2);
  const liveNas = (20942.5 + liveTick * 2.25).toFixed(1);
  const liveEur = (1.0542 + (liveTick % 3) * 0.0002).toFixed(4);
  const liveGoalProfit = Math.round((1840 + liveDelta) * rollPct);
  const liveGoalPct = Math.min(92, Math.round(((1840 + liveDelta) / 2500) * 100 * rollPct));
  const liveOpenLots = ((1.2 + (liveTick % 4) * 0.08) * rollPct).toFixed(2);
  const liveLotPct = Math.round((Number(1.2 + (liveTick % 4) * 0.08) / 2.0) * 100 * rollPct);
  const liveDdPct = ((0.78 + (liveTick % 3) * 0.04) * rollPct).toFixed(2);
  const liveShieldScore = Math.round((88 + (liveTick % 2)) * rollPct);
  const liveXauRow = Math.round((1640 + liveDelta) * rollPct);

  const active = SESSION_MODULES.find((m) => m.id === activeId) || SESSION_MODULES[0];
  const leftModules = SESSION_MODULES.slice(0, 3);
  const rightModules = SESSION_MODULES.slice(3, 6);
  const totalTicks = 24;
  const activeTicks = Math.round((active.scoreValue / 100) * totalTicks);
  const isDarkFocus = false;

  const dashDonutRadius = 17;
  const dashDonutCirc = 2 * Math.PI * dashDonutRadius;
  const dashDonutOffset = dashDonutCirc - 0.82 * rollPct * dashDonutCirc;

  const curlyConnectorPaths = [
    {
      path: "M 2 20 C 11 20, 13 5, 22 6 C 28 7, 26 19, 19 16 C 14 14, 19 8, 29 12 C 36 15, 40 21, 45 21",
      endY: 21,
    },
    {
      path: "M 2 18 C 11 5, 17 31, 25 18 C 32 7, 38 25, 45 18",
      endY: 18,
    },
    {
      path: "M 2 16 C 11 16, 13 31, 22 30 C 28 29, 26 17, 19 20 C 14 22, 19 28, 29 24 C 36 21, 40 15, 45 15",
      endY: 15,
    },
  ];

  const renderCurlyConnector = (rowIdx: number, isSelected: boolean, side: "left" | "right") => {
    const spec = curlyConnectorPaths[rowIdx] || curlyConnectorPaths[1];
    return (
      <svg
        viewBox="0 0 48 36"
        fill="none"
        aria-hidden="true"
        className={`w-[48px] h-[36px] shrink-0 overflow-visible ${side === "right" ? "-scale-x-100" : ""}`}
      >
        <path
          d={spec.path}
          stroke={isSelected ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.72)"}
          strokeWidth={isSelected ? "4.5" : "3"}
          strokeLinecap="round"
        />
        <path
          d={spec.path}
          stroke={isSelected ? "rgba(37, 99, 235, 0.25)" : "rgba(71, 85, 105, 0.45)"}
          strokeWidth={isSelected ? "3.2" : "1.55"}
          strokeLinecap="round"
        />
        {isSelected && (
          <motion.path
            key={`${side}-${rowIdx}-active`}
            d={spec.path}
            stroke="#2563EB"
            strokeWidth="1.9"
            strokeLinecap="round"
            initial={{ pathLength: 0.15, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          />
        )}
        {isSelected && (
          <motion.path
            d={spec.path}
            stroke="#93C5FD"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="3 7"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
        )}
        {isSelected && (
          <circle cx="45" cy={spec.endY} r="5.5" fill="rgba(37, 99, 235, 0.16)" />
        )}
        <circle
          cx="45"
          cy={spec.endY}
          r={isSelected ? "3.1" : "2.6"}
          fill={isSelected ? "#2563EB" : "#FFFFFF"}
          stroke={isSelected ? "#2563EB" : "#CBD5E1"}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  const renderCurlyButton = (
    mod: (typeof SESSION_MODULES)[number],
    side: "left" | "right" | "mobile"
  ) => {
    const Icon = mod.icon;
    const isSelected = mod.id === activeId;
    const isRight = side === "right";
    const isMobile = side === "mobile";
    const pillCorners = isRight
      ? "rounded-[9px_22px_9px_22px]"
      : isMobile
      ? "rounded-[18px_8px_18px_8px]"
      : "rounded-[22px_9px_22px_9px]";
    const badgeCorners = isRight
      ? "rounded-[5px_12px_5px_12px]"
      : "rounded-[12px_5px_12px_5px]";

    return (
      <motion.button
        key={mod.id}
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        animate={isSelected ? { y: -2 } : { y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        onClick={() => setActiveId(mod.id)}
        className={`group relative z-10 overflow-hidden inline-flex items-center justify-start gap-2.5 border transition-colors duration-200 cursor-pointer shrink-0 ${pillCorners} ${
          isMobile ? "w-full h-[42px] px-2.5" : "w-[152px] h-[44px] pl-2 pr-3"
        } ${
          isSelected
            ? "bg-gradient-to-br from-white via-[#F4F8FF] to-[#EBF2FF] border-[#2563EB] shadow-[0_12px_26px_-6px_rgba(37,99,235,0.34),inset_0_1px_0_rgba(255,255,255,0.95)] ring-2 ring-[#2563EB]/15"
            : "bg-white/95 border-[#DDE3EE] shadow-[0_6px_18px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-[#93C5FD] hover:bg-white hover:shadow-[0_10px_24px_rgba(37,99,235,0.12)]"
        }`}
      >
        {/* Decorative calligraphic curl corner accent */}
        <svg
          viewBox="0 0 18 14"
          fill="none"
          aria-hidden="true"
          className={`pointer-events-none absolute top-1 ${
            isRight ? "left-1.5 -scale-x-100" : "right-1.5"
          } w-3.5 h-2.5 transition-opacity ${
            isSelected ? "opacity-90" : "opacity-35 group-hover:opacity-65"
          }`}
        >
          <path
            d="M 2 10 C 5 2, 11 2, 13 6 C 14 8, 12 10, 10 9 C 8.5 8.2, 9.5 6, 12.5 5.5"
            stroke={isSelected ? "#2563EB" : "#94A3B8"}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>

        <span className="relative inline-flex items-center justify-center shrink-0">
          {isSelected && (
            <svg
              viewBox="0 0 34 34"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[3px] w-[34px] h-[34px]"
            >
              <path
                d="M 5 17 C 5 8, 13 4, 21 5 C 28 6, 30 14, 29 21"
                stroke="#60A5FA"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="2.5 3.5"
              />
            </svg>
          )}
          <span
            className={`w-7 h-7 ${badgeCorners} inline-flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? "bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.42)]"
                : "bg-slate-900 text-white group-hover:bg-[#2563EB] group-hover:rotate-3"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
        </span>

        <span
          className={`text-[12px] font-semibold whitespace-nowrap truncate ${
            isSelected ? "text-[#2563EB]" : "text-slate-800"
          }`}
        >
          {mod.label}
        </span>
      </motion.button>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative bg-white text-slate-900 pt-16 sm:pt-24 pb-10 sm:pb-16 overflow-hidden"
    >
      {/* Top editorial bridge line */}
      <div className="max-w-[1220px] mx-auto px-4 sm:px-8 mb-8 sm:mb-14">
        <p className="text-[13.5px] sm:text-[15px] leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-900">TradiFive reads it back.</span>{" "}
          Trade by trade, until the pattern has nowhere to hide.
        </p>
      </div>

      {/* Single Unified Scroll-Parallax Mountain Canyon & Soaring Eagle Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 overflow-hidden select-none"
      >
        <motion.div
          style={{ y: mountainY, scale: mountainScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src="/workspace-sky-bg.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-96"
          />
        </motion.div>

        {/* Subtle Center Mist Halo & Top/Bottom Page Transitions */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 52% 48% at 50% 44%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 75%), linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.68) 7%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 84%, #ffffff 100%)",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-8">
        {/* Centered Header + Segmented Toggle */}
        <div className="text-center max-w-[660px] mx-auto mb-7 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white border border-[#E4E4E4] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.08)] mb-3.5"
          >
            <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#2563EB]">
              <LayoutGrid size={11} strokeWidth={2.2} />
            </span>
            <span className="text-[12px] font-semibold tracking-[-0.01em] text-slate-900">
              Inside the workspace
            </span>
          </motion.div>

          <h2
            style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
            className="text-[28px] sm:text-[44px] font-bold tracking-[-0.035em] leading-[1.08] text-slate-950"
          >
            <BlurText
              as="span"
              text="One workspace"
              effect="blur"
              animateBy="words"
              direction="top"
              trigger="view"
              threshold={0.05}
              delay={55}
              stepDuration={0.3}
              blur={8}
              distance={22}
              className="justify-center font-bold tracking-[-0.035em] text-slate-950"
            />
            <BlurText
              as="span"
              text="for your entire trading session."
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
              className="justify-center font-normal tracking-[-0.03em] text-slate-600 mt-0.5"
            />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
            className="mt-3 text-[14px] sm:text-[15.5px] font-normal text-slate-700 leading-relaxed"
          >
            Click any tool button on the side to switch the live TradiFive web app preview between Dashboard, Journal, Risk Guard, and AI Coach.
          </motion.p>
        </div>

        {/* Mobile Quick Module Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden gap-2.5 max-w-[500px] mx-auto mb-5">
          {SESSION_MODULES.map((mod) => renderCurlyButton(mod, "mobile"))}
        </div>

        {/* Desktop 3-Column Interactive Showcase */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] items-center gap-4 lg:gap-0">
          {/* Left Floating Curly Pills Column — Uniform Fixed Size on Click */}
          <div className="hidden lg:flex flex-col justify-center gap-12 z-20 pr-0">
            {leftModules.map((mod, idx) => (
              <div key={mod.id} className="relative flex items-center justify-end">
                {renderCurlyButton(mod, "left")}
                {renderCurlyConnector(idx, mod.id === activeId, "left")}
              </div>
            ))}
          </div>

          {/* Center Window: Authentic Non-Interactive TradiFive Web App Shell (Uniform Locked Size) */}
          <div className="relative z-10 w-full mx-auto">
            <div
              className={`pointer-events-none select-none rounded-[20px] sm:rounded-[24px] p-1.5 sm:p-2 border shadow-[0_24px_68px_-20px_rgba(15,23,42,0.18)] transition-colors duration-300 ${
                isDarkFocus
                  ? "bg-[#111216] border-white/[0.1] text-white"
                  : "bg-white border-[#E4E4E4] text-slate-900"
              }`}
              aria-hidden="true"
            >
              {/* Inner TradiFive Multi-Panel Shell (Fixed Height lg:h-[436px] so tabs never resize) */}
              <div
                className={`rounded-[15px] sm:rounded-[18px] border p-1.5 sm:p-2 flex gap-2 lg:h-[436px] overflow-hidden transition-colors duration-300 ${
                  isDarkFocus
                    ? "bg-[#0D0E12] border-white/[0.08]"
                    : "bg-[#F2F4F8] border-slate-200/80"
                }`}
              >
                {/* 1. Primary Double-Capsule Vertical Icon Rail (exact Pic 2 AppSidebar left rail) */}
                <div className="hidden lg:flex flex-col items-center justify-between w-[48px] shrink-0 gap-1.5">
                  <div
                    className={`w-full flex-1 flex flex-col items-center py-1.5 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.04)] ${
                      isDarkFocus ? "bg-[#16171D]" : "bg-white"
                    }`}
                  >
                    <div
                      className={`w-[38px] rounded-[18px] flex flex-col items-center py-2 gap-1.5 ${
                        isDarkFocus
                          ? "bg-[#1E2029]"
                          : "bg-[#f4f7fb] shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)]"
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img src="/tf-logo.png" alt="TradiFive" className="w-5 h-5 object-contain" />
                      </div>
                      <div className={`w-4 h-[1px] ${isDarkFocus ? "bg-white/10" : "bg-slate-200"}`} />
                      {[
                        { id: "dashboard" as const, Icon: IconlyCategory },
                        { id: "journal" as const, Icon: IconlyDocument },
                        { id: "community" as const, Icon: Users },
                        { id: "risk-guard" as const, Icon: IconlyShieldDone },
                        { id: "ai-coach" as const, Icon: Sparkles },
                      ].map((rail) => {
                        const isRailActive =
                          rail.id === activeId || (activeId === "reports" && rail.id === "journal");
                        const RailIcon = rail.Icon;
                        return (
                          <div
                            key={rail.id}
                            className={`relative w-[28px] h-[28px] rounded-[9px] flex items-center justify-center ${
                              isRailActive
                                ? isDarkFocus
                                  ? "bg-[#2563EB] text-white shadow-sm"
                                  : "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                                : "text-slate-400"
                            }`}
                          >
                            {rail.id === "community" || rail.id === "ai-coach" ? (
                              <RailIcon size={12.5} strokeWidth={2} />
                            ) : (
                              <RailIcon size={12.5} set="curved" stroke="bold" primaryColor="currentColor" />
                            )}
                            {isRailActive && !isDarkFocus && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-blue-600 rounded-l-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[42px]">
                      <span className="text-[7px] font-extrabold tracking-[0.18em] text-slate-400 rotate-[-90deg] whitespace-nowrap uppercase">
                        TRADIFIVE V1.2
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Secondary Navigation Sidebar (exact Pic 2 AppSidebar panel) */}
                <aside className="hidden md:flex flex-col justify-between w-[162px] shrink-0 px-1 py-1">
                  <div className="space-y-2.5">
                    <div className="flex items-center px-1 pt-0.5">
                      <img
                        src={isDarkFocus ? "/Dark mode logo with white.png" : "/Tradifive_logo1.png"}
                        alt="TradiFive"
                        className="h-[19px] w-auto object-contain"
                      />
                    </div>

                    <div
                      className={`h-[28px] rounded-xl border px-2.5 flex items-center justify-between text-[9.5px] text-slate-400 ${
                        isDarkFocus ? "bg-[#16171D] border-white/[0.08]" : "bg-white border-slate-200/80"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 truncate">
                        <Search size={10} className="shrink-0" />
                        <span className="truncate">Search navigation…</span>
                      </span>
                      <span className="px-1 rounded bg-slate-100/80 dark:bg-white/10 text-[8px] font-bold">
                        ⌘K
                      </span>
                    </div>

                    {(() => {
                      const SIDEBAR_MENUS: Record<
                        SessionModuleId,
                        Array<{
                          heading: string;
                          items: Array<{ label: string; icon: typeof LayoutGrid; active?: boolean; dot?: boolean }>;
                        }>
                      > = {
                        dashboard: [
                          {
                            heading: "Communication",
                            items: [
                              { label: "Inbox", icon: IconlyMessage as any },
                              { label: "Notifications", icon: IconlyNotification as any, dot: true },
                            ],
                          },
                          {
                            heading: "Trading Dashboard",
                            items: [
                              { label: "Main Dashboard", icon: LayoutGrid, active: true },
                              { label: "Reports & Statements", icon: FileText },
                            ],
                          },
                        ],
                        journal: [
                          {
                            heading: "Smart Journal",
                            items: [
                              { label: "Daily Journal", icon: BookOpen, active: true },
                              { label: "Trade History", icon: BarChart3 },
                            ],
                          },
                          {
                            heading: "Analytics",
                            items: [
                              { label: "Symbol Performance", icon: TrendingUp },
                              { label: "TradiFive Score", icon: Target },
                            ],
                          },
                        ],
                        community: [
                          {
                            heading: "Community",
                            items: [
                              { label: "Home", icon: Globe, active: true },
                              { label: "Discover", icon: Search },
                              { label: "Channels", icon: Users },
                              { label: "Saved", icon: BookOpen },
                            ],
                          },
                          {
                            heading: "Leaderboard",
                            items: [
                              { label: "Top Traders", icon: Crown },
                              { label: "Contests", icon: Flame },
                            ],
                          },
                        ],
                        "risk-guard": [
                          {
                            heading: "Risk Guard",
                            items: [
                              { label: "Risk Dashboard", icon: ShieldCheck, active: true },
                              { label: "Trading Control", icon: SlidersHorizontal },
                              { label: "Drawdown Caps", icon: AlertTriangle },
                              { label: "Behaviour Rules", icon: Lock },
                            ],
                          },
                        ],
                        reports: [
                          {
                            heading: "Trading Dashboard",
                            items: [
                              { label: "Main Dashboard", icon: LayoutGrid },
                              { label: "Reports & Statements", icon: FileText, active: true },
                            ],
                          },
                          {
                            heading: "Exports",
                            items: [
                              { label: "Monthly Calendar", icon: CalendarDays },
                              { label: "Verified Proof", icon: CheckCircle2 },
                            ],
                          },
                        ],
                        "ai-coach": [
                          {
                            heading: "TradiFive AI",
                            items: [
                              { label: "AI Coach Insights", icon: Sparkles, active: true },
                              { label: "Daily Journal", icon: BookOpen },
                              { label: "Performance Analytics", icon: BarChart3 },
                            ],
                          },
                          {
                            heading: "Coach Persona",
                            items: [
                              { label: "Strict Guard", icon: ShieldCheck },
                              { label: "Mindset Coach", icon: Flame },
                            ],
                          },
                        ],
                      };

                      return SIDEBAR_MENUS[activeId].map((group) => (
                        <div key={group.heading} className="space-y-0.5">
                          <div className="px-1.5 text-[8px] font-semibold tracking-wider text-slate-400 uppercase">
                            {group.heading}
                          </div>
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isSel = Boolean(item.active);
                            return (
                              <div
                                key={item.label}
                                className={`relative flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-xl text-[10px] ${
                                  isSel
                                    ? isDarkFocus
                                      ? "bg-[#1A1C24] border border-white/[0.1] font-semibold text-white"
                                      : "bg-white border border-slate-200/80 font-semibold text-slate-900 shadow-xs"
                                    : "font-medium text-slate-500"
                                }`}
                              >
                                <span className="inline-flex items-center gap-2 min-w-0">
                                  {group.heading === "Communication" ? (
                                    <ItemIcon size={12} set="curved" stroke="bold" primaryColor="currentColor" />
                                  ) : (
                                    <ItemIcon size={12} className={isSel ? "text-[#2563EB]" : "text-slate-400"} />
                                  )}
                                  <span className="truncate">{item.label}</span>
                                </span>
                                {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                                {isSel && (
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.45)]" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Elite + Nikhil Harake Footer */}
                  <div className="space-y-2">
                    <div
                      className={`rounded-xl border p-2 space-y-1.5 ${
                        isDarkFocus
                          ? "bg-amber-500/10 border-amber-500/25"
                          : "bg-gradient-to-br from-amber-50 to-orange-50/75 border-amber-200/75"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                        <Crown size={10.5} className="text-amber-500" />
                        <span>TradiFive</span>
                        <span className="text-amber-600">Elite</span>
                      </div>
                      <div className="w-full h-5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-semibold flex items-center justify-center gap-1">
                        <Sparkles size={9} />
                        <span>Upgrade Elite</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1 pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="relative w-6 h-6 rounded-full bg-slate-900 text-white text-[8.5px] font-bold flex items-center justify-center shrink-0">
                          NH
                          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9.5px] font-semibold truncate">Nikhil Harake</div>
                          <div className="text-[8px] text-emerald-600 font-medium">Online</div>
                        </div>
                      </div>
                      <ChevronDown size={10} className="text-slate-400 shrink-0" />
                    </div>
                  </div>
                </aside>

                {/* 3. Right Main App Canvas (Static Interface Preview Only — pointer-events-none) */}
                <div
                  className={`flex-1 min-w-0 flex flex-col rounded-2xl border overflow-hidden ${
                    isDarkFocus ? "bg-[#121318] border-white/[0.08]" : "bg-[#F8FAFC] border-slate-200/75"
                  }`}
                >
                  {/* Top App Breadcrumb + XP Bar */}
                  <div
                    className={`h-9 border-b px-3.5 flex items-center justify-between gap-2 ${
                      isDarkFocus ? "bg-[#17181E] border-white/[0.08]" : "bg-white/95 border-slate-200/70"
                    }`}
                  >
                    <div className="text-[9.5px] text-slate-400 flex items-center gap-1">
                      <span>Main Menu</span>
                      <span>/</span>
                      <span className={`font-semibold ${isDarkFocus ? "text-white" : "text-slate-800"}`}>
                        {active.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="hidden sm:inline-flex items-center gap-1 h-5 px-2 rounded-full bg-amber-50 border border-amber-200/80 text-[9px] font-semibold text-amber-700">
                        ★ 0 XP
                      </span>
                      <span
                        className={`h-5 px-2 rounded-full border text-[9px] font-semibold inline-flex items-center ${
                          isDarkFocus ? "bg-white/[0.05] border-white/[0.1] text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      >
                        10/10 +
                      </span>
                      <span
                        className={`h-5 px-2 rounded-full border text-[9px] font-semibold inline-flex items-center gap-1 ${
                          isDarkFocus ? "bg-white/[0.05] border-white/[0.1] text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      >
                        <Sparkles size={9} className="text-[#2563EB]" />
                        <span>AI Coach</span>
                      </span>
                    </div>
                  </div>

                  {/* Page Body */}
                  <div className="p-2.5 sm:p-3.5 pb-3.5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active.id}
                        initial={{ opacity: 0, y: 8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.99 }}
                        transition={{ duration: 0.24, ease: EASE_OUT }}
                        className="space-y-2.5"
                      >
                        {/* Context-Matched Page Header Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-[14px] font-bold tracking-tight leading-tight">
                              {active.id === "community"
                                ? "Home Community"
                                : active.id === "ai-coach"
                                ? "TradiFive AI Coach"
                                : active.label}
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium">
                              Fri, Nov 27, 2026
                            </div>
                          </div>

                          {active.id === "community" ? (
                            <div className="hidden sm:flex items-center gap-1.5 text-[9px]">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${
                                  isDarkFocus
                                    ? "bg-[#1E293B] border-white/10 text-blue-300"
                                    : "bg-white border-slate-200/90 text-slate-800 shadow-2xs"
                                }`}
                              >
                                <Plus size={10} className="text-[#2563EB]" /> New Post
                              </span>
                              <span
                                className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                  isDarkFocus ? "bg-[#17181E] border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                                }`}
                              >
                                <SlidersHorizontal size={10} />
                              </span>
                            </div>
                          ) : active.id === "risk-guard" ? (
                            <div className="hidden sm:flex items-center gap-1.5 text-[9px]">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                LIVE · Armed
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-600 font-bold">
                                Emergency Kill Switch
                              </span>
                            </div>
                          ) : active.id === "ai-coach" ? (
                            <div className="hidden sm:flex items-center gap-1 text-[8.5px]">
                              {["Strict Guard", "Analytical Quant", "Mindset"].map((persona, idx) => (
                                <span
                                  key={persona}
                                  className={`px-2 py-0.5 rounded-full border font-semibold ${
                                    idx === 0
                                      ? "bg-[#2563EB] border-[#2563EB] text-white"
                                      : isDarkFocus
                                      ? "bg-[#17181E] border-white/[0.08] text-neutral-300"
                                      : "bg-white border-slate-200 text-slate-600"
                                  }`}
                                >
                                  {persona}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div
                              className={`hidden sm:flex items-center gap-1.5 rounded-full pl-2.5 pr-1 py-0.5 border text-[9px] ${
                                isDarkFocus ? "bg-[#17181E] border-white/[0.08]" : "bg-white border-slate-200/80 shadow-2xs"
                              }`}
                            >
                              <span className="inline-flex items-center gap-1 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Exness MT5 · Live
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="font-mono text-slate-400 tabular-nums">
                                Equity <strong className={isDarkFocus ? "text-white" : "text-slate-800"}>${liveEquity.toLocaleString()}</strong>
                              </span>
                              <span className="px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/10 font-semibold">
                                + Log trade
                              </span>
                              <span className="px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/10 font-semibold">
                                Import
                              </span>
                              <span className="px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/10 font-semibold">
                                Connect broker
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ── VIEW 1: EXACT PIC 2 DASHBOARD (LIVE RUNNING NUMBERS & ANIMATED CURVES) ── */}
                        {active.id === "dashboard" && (
                          <>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
                              {/* Left: Net P&L + Timeframe Strip + 82% Donut */}
                              <div className="lg:col-span-5 flex items-end justify-between gap-2 px-0.5">
                                <div>
                                  <div className="inline-flex items-center p-0.5 rounded-[8px] bg-slate-200/70 dark:bg-white/[0.08] mb-1.5 text-[9px] font-semibold">
                                    <span className={`px-2 py-0.5 rounded-[6px] shadow-xs ${isDarkFocus ? "bg-[#26262B] text-white" : "bg-white text-slate-900"}`}>All</span>
                                    <span className="px-1.5 py-0.5 text-slate-500">1D</span>
                                    <span className="px-1.5 py-0.5 text-slate-500">7D</span>
                                    <span className="px-1.5 py-0.5 text-slate-500">1M</span>
                                  </div>
                                  <div className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                                    <span>Net P&amp;L · All time</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  </div>
                                  <div className="text-[24px] sm:text-[26px] font-bold tracking-tight text-[#2563EB] leading-none mt-0.5 font-mono tabular-nums transition-all duration-500">
                                    +${liveNetPnl.toLocaleString()}
                                  </div>
                                  <div className="text-[9px] text-slate-500 mt-1 font-medium">
                                    14W / 3L · 17 closed trades
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="text-[8.5px] text-slate-400 flex items-center gap-1">
                                    <span>Analytics →</span>
                                    <span className={`rounded-md px-2 py-0.5 border text-[8.5px] font-semibold ${isDarkFocus ? "bg-white/[0.05] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
                                      Hide
                                    </span>
                                  </div>
                                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                                      <circle cx="22" cy="22" r={dashDonutRadius} fill="none" stroke={isDarkFocus ? "rgba(255,255,255,0.12)" : "#E2E8F0"} strokeWidth="4" />
                                      <motion.circle
                                        cx="22"
                                        cy="22"
                                        r={dashDonutRadius}
                                        fill="none"
                                        stroke="#2563EB"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={dashDonutCirc}
                                        initial={{ strokeDashoffset: dashDonutCirc }}
                                        animate={{ strokeDashoffset: dashDonutOffset }}
                                        transition={{ duration: 0.9, ease: EASE_OUT }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                                      <span className="text-[9.5px] font-bold font-mono tabular-nums">{Math.round(82 * rollPct)}%</span>
                                      <span className="text-[6.5px] font-semibold text-slate-400">WIN</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right: 3 Stat Cards + Pre-market Plan Strip */}
                              <div className="lg:col-span-7 flex flex-col gap-1.5">
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[
                                    { label: "Avg RR", val: ((2.23 + (liveTick % 3) * 0.01) * rollPct).toFixed(2) + "R" },
                                    { label: "Profit Factor", val: ((16.1 + liveTick * 0.04) * rollPct).toFixed(2) },
                                    { label: "Avg W / L", val: `$${Math.round((954 + Math.round(liveDelta / 4)) * rollPct)} / $${Math.round(277 * rollPct)}` },
                                  ].map((m) => (
                                    <div
                                      key={m.label}
                                      className={`rounded-[12px] border px-2 py-2 text-center ${
                                        isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"
                                      }`}
                                    >
                                      <div className="text-[8.5px] text-slate-400 font-medium">{m.label}</div>
                                      <div className="text-[11px] sm:text-[12px] font-bold font-mono tabular-nums mt-0.5 truncate">{m.val}</div>
                                    </div>
                                  ))}
                                </div>
                                <div
                                  className={`rounded-[12px] border px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-[#2563EB] ${
                                    isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"
                                  }`}
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Start today&apos;s pre-market plan
                                  </span>
                                  <ArrowRight size={10.5} className="text-slate-400" />
                                </div>
                              </div>
                            </div>

                            {/* Middle 3 Chart Cards (Cumulative P&L | Account Balance | TRADIFIVE SCORE) */}
                            <div className="grid grid-cols-3 gap-2">
                              {/* Cumulative P&L */}
                              <div className={`rounded-[13px] border p-2.5 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-start justify-between text-[9.5px]">
                                  <div>
                                    <div className="font-bold flex items-center gap-1">
                                      <TrendingUp size={10.5} className="text-emerald-500" /> Cumulative P&amp;L
                                    </div>
                                    <div className="text-[8px] text-slate-400">Closed trade equity curve</div>
                                  </div>
                                  <span className="font-bold text-[#2563EB] font-mono tabular-nums">+${liveNetPnl.toLocaleString()}</span>
                                </div>
                                <svg viewBox="0 0 180 64" className="w-full h-14 my-1 overflow-visible">
                                  <defs>
                                    <linearGradient id="showcasePnlG" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  <path d="M4,56 L30,48 L52,50 L74,40 L96,30 L118,34 L142,20 L166,12 L176,8 L176,56 Z" fill="url(#showcasePnlG)" />
                                  <motion.path
                                    d="M4,56 L30,48 L52,50 L74,40 L96,30 L118,34 L142,20 L166,12 L176,8"
                                    fill="none"
                                    stroke="#2563EB"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: showcaseInView ? 1 : 0 }}
                                    transition={{ duration: 1.25, ease: EASE_OUT }}
                                  />
                                  <circle cx="176" cy="8" r="2.8" fill="#2563EB" />
                                </svg>
                                <div className="flex justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                                  <span>Win rate <strong className={isDarkFocus ? "text-white" : "text-slate-700"}>82%</strong></span>
                                  <span>17 closed trades</span>
                                </div>
                              </div>

                              {/* Account Balance */}
                              <div className={`rounded-[13px] border p-2.5 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-start justify-between text-[9.5px]">
                                  <div>
                                    <div className="font-bold">Account Balance</div>
                                    <div className="text-[8px] text-slate-400">● Balance · ● Deposits</div>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[8px] font-semibold">All</span>
                                </div>
                                <svg viewBox="0 0 180 64" className="w-full h-14 my-1 overflow-visible">
                                  <line x1="4" y1="46" x2="176" y2="46" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
                                  <path d="M4,46 L34,40 L64,41 L94,32 L124,25 L154,18 L176,10 L176,56 L4,56 Z" fill="url(#showcasePnlG)" />
                                  <motion.path
                                    d="M4,46 L34,40 L64,41 L94,32 L124,25 L154,18 L176,10"
                                    fill="none"
                                    stroke="#2563EB"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: showcaseInView ? 1 : 0 }}
                                    transition={{ duration: 1.25, ease: EASE_OUT }}
                                  />
                                  <circle cx="176" cy="10" r="2.8" fill="#2563EB" />
                                </svg>
                                <div className="flex justify-between text-[8px] pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                                  <span className="text-slate-400">Start $25k</span>
                                  <span className="font-bold text-[#2563EB] font-mono tabular-nums">${Math.round((37530 + liveDelta) * rollPct).toLocaleString()} (+{(50.1 * rollPct).toFixed(1)}%)</span>
                                </div>
                              </div>

                              {/* TRADIFIVE SCORE */}
                              <div className={`rounded-[13px] border p-2.5 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider">TradiFive Score</div>
                                    <div className="text-[7.5px] text-slate-400">17 trades scored</div>
                                  </div>
                                  <span className="text-[16px] font-bold font-mono tabular-nums leading-none">{Math.round((81 + (liveTick % 2)) * rollPct)}</span>
                                </div>
                                <div className="flex items-center justify-center my-0.5">
                                  <svg viewBox="0 0 120 68" className="w-24 h-12">
                                    <polygon points="60,8 92,26 80,58 40,58 28,26" fill="none" stroke={isDarkFocus ? "rgba(255,255,255,0.14)" : "#E2E8F0"} strokeWidth="1" />
                                    <motion.polygon
                                      points="60,18 86,30 76,54 44,54 39,30"
                                      fill={isDarkFocus ? "rgba(37,99,235,0.22)" : "rgba(37,99,235,0.12)"}
                                      stroke={isDarkFocus ? "#3B82F6" : "#2563EB"}
                                      strokeWidth="1.4"
                                      initial={{ scale: 0.7, opacity: 0.4 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.7, ease: EASE_OUT }}
                                      style={{ transformOrigin: "60px 36px" }}
                                    />
                                  </svg>
                                </div>
                                <div className="flex justify-between text-[8px] pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                                  <span className="font-semibold">● Consistency</span>
                                  <span className="font-bold font-mono">100/100</span>
                                </div>
                              </div>
                            </div>

                            {/* Bottom 4 Bento Row (P&L Calendar | Forex Factory News | Risk Guard | Discipline Lv 7) */}
                            <div className="grid grid-cols-12 gap-2">
                              <div className={`col-span-4 rounded-[12px] border p-2 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[8.5px] font-bold mb-1.5">
                                  <span>P&amp;L calendar <span className="text-emerald-600 font-mono tabular-nums">+${liveNetPnl.toLocaleString()}</span></span>
                                  <span className="text-slate-400">Nov 2026</span>
                                </div>
                                <div className="grid grid-cols-7 gap-0.5">
                                  {CALENDAR_DAYS.slice(4, 18).map((cell, idx) => (
                                    <div
                                      key={idx}
                                      className={`h-6 rounded px-0.5 py-0.5 flex flex-col justify-between text-[6px] ${
                                        cell.pos === true
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                          : cell.pos === false
                                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                                          : "bg-slate-100/70 dark:bg-white/[0.04] text-slate-400"
                                      }`}
                                    >
                                      <span className="font-bold">{cell.d}</span>
                                      {cell.pnl && <span className="font-mono truncate">{cell.pnl}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className={`col-span-4 rounded-[12px] border p-2 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[8.5px] font-bold mb-1.5">
                                  <span>News <span className="font-normal text-slate-400">Forex Factory</span></span>
                                  <span className="text-[#2563EB]">Today</span>
                                </div>
                                <div className="space-y-1 text-[8px]">
                                  {[
                                    { c: "USD", t: "Core PCE Price Index", tm: "13:30 UTC", dot: "bg-rose-500" },
                                    { c: "USD", t: "Chicago PMI Flash", tm: "14:45 UTC", dot: "bg-amber-500" },
                                    { c: "EUR", t: "ECB Liquidity Brief", tm: "15:00 UTC", dot: "bg-slate-400" },
                                  ].map((n) => (
                                    <div key={n.t} className="flex items-center justify-between px-1.5 py-1 rounded bg-slate-500/5">
                                      <span className="flex items-center gap-1 truncate">
                                        <span className={`w-1.5 h-1.5 rounded-full ${n.dot}`} />
                                        <strong>{n.c}</strong>
                                        <span className="truncate text-slate-500">{n.t}</span>
                                      </span>
                                      <span className="text-slate-400 font-mono shrink-0">{n.tm}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="col-span-4 grid grid-cols-2 gap-1.5">
                                <div className={`rounded-[12px] border p-2 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="flex items-center justify-between text-[8.5px] font-bold">
                                    <span>Risk guard</span>
                                    <span className="px-1 rounded bg-emerald-500/15 text-emerald-600 text-[7px]">Active</span>
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold font-mono tabular-nums leading-none">{liveDdPct}%</div>
                                    <div className="text-[7.5px] text-slate-400 mt-0.5">/ 3.0% limit</div>
                                  </div>
                                  <div className="h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                    <motion.div
                                      animate={{ width: `${Math.round((Number(liveDdPct) / 3.0) * 100)}%` }}
                                      transition={{ duration: 0.45 }}
                                      className="h-full bg-emerald-500 rounded-full"
                                    />
                                  </div>
                                </div>

                                <div className={`rounded-[12px] border p-2 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="flex items-center justify-between text-[8.5px] font-bold">
                                    <span>Discipline</span>
                                    <span className="px-1 rounded bg-amber-500/15 text-amber-600 text-[7px]">Lv 7</span>
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold font-mono tabular-nums leading-none">{94 + (liveTick % 2)}</div>
                                    <div className="text-[7.5px] text-slate-400 mt-0.5">/ 100 score</div>
                                  </div>
                                  <div className="text-[7.5px] text-emerald-600 font-semibold">14d streak</div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* ── VIEW 2: EXACT WEB APP JOURNAL PAGE (5 Live Metrics + Animated Bento Charts + Symbol Attribution + Running Ledger) ── */}
                        {active.id === "journal" && (
                          <div className="space-y-2">
                            {/* Top 5 Draggable Metric Cards Row (matches JournalMetrics.tsx) */}
                            <div className="grid grid-cols-5 gap-1.5">
                              {[
                                { label: "Net P&L", value: `+$${liveNetPnl.toLocaleString()}`, sub: `+50.${1 + (liveTick % 2)}% ROI`, tone: "text-emerald-600" },
                                { label: "Win Rate", value: "82.4%", sub: "14W · 3L · 0E", tone: "text-[#2563EB]" },
                                { label: "Profit Factor", value: (16.1 + liveTick * 0.04).toFixed(2), sub: "17 closed trades", tone: "" },
                                { label: "Avg Win / Loss", value: `$${954 + Math.round(liveDelta / 4)} / $277`, sub: "3.45 ratio", tone: "" },
                                { label: "Day Streak", value: "+6 Days", sub: `Best +$${liveXauRow.toLocaleString()}`, tone: "text-emerald-600" },
                              ].map((stat) => (
                                <div key={stat.label} className={`rounded-[11px] p-2 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="text-[7.5px] font-medium text-slate-400 truncate">{stat.label}</div>
                                  <div className={`text-[11px] font-bold font-mono tabular-nums mt-0.5 truncate ${stat.tone}`}>{stat.value}</div>
                                  <div className="text-[7px] text-slate-400 mt-0.5 truncate">{stat.sub}</div>
                                </div>
                              ))}
                            </div>

                            {/* Middle Bento Row: Animated Net Daily P&L Bars + Symbol Performance + Long/Short */}
                            <div className="grid grid-cols-12 gap-2">
                              <div className={`col-span-5 rounded-[12px] p-2.5 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[9px] font-bold mb-1.5">
                                  <span>Net Daily P&amp;L</span>
                                  <span className="text-emerald-600 font-mono inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    14 green days
                                  </span>
                                </div>
                                <div className="grid grid-cols-10 items-end gap-1 h-16 pt-2">
                                  {[
                                    { h: 42, win: true }, { h: 74, win: true }, { h: 24, win: false },
                                    { h: 60, win: true }, { h: 86, win: true }, { h: 50, win: true },
                                    { h: 96, win: true }, { h: 20, win: false }, { h: 66, win: true }, { h: Math.min(98, 86 + (liveTick % 4) * 3), win: true },
                                  ].map((b, i) => (
                                    <div key={i} className="h-full flex items-end">
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${b.h}%` }}
                                        transition={{ duration: 0.45, delay: i * 0.03, ease: EASE_OUT }}
                                        className={`w-full rounded-t ${b.win ? "bg-emerald-500/85" : "bg-rose-500/80"}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className={`col-span-7 rounded-[12px] p-2.5 border flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[9px] font-bold mb-1.5">Performance by symbol &amp; direction</div>
                                <div className="space-y-1.5">
                                  {[
                                    { sym: "XAUUSD", info: "8t · 88%", pnl: `+$${(7420 + liveDelta).toLocaleString()}`, w: "88%" },
                                    { sym: "NAS100", info: "5t · 80%", pnl: "+$3,610", w: "62%" },
                                    { sym: "EURUSD", info: "4t · 75%", pnl: "+$1,500", w: "38%" },
                                  ].map((r, idx) => (
                                    <div key={r.sym}>
                                      <div className="flex justify-between text-[8px] mb-0.5">
                                        <span><strong>{r.sym}</strong> <span className="text-slate-400">{r.info}</span></span>
                                        <span className="font-mono font-bold text-emerald-600 tabular-nums">{r.pnl}</span>
                                      </div>
                                      <div className="h-1 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: r.w }}
                                          transition={{ duration: 0.65, delay: idx * 0.08, ease: EASE_OUT }}
                                          className="h-full rounded-full bg-emerald-500"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-white/[0.06] text-[8px]">
                                  <div className={`rounded px-2 py-1 ${isDarkFocus ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                                    <span className="text-slate-400 font-semibold">LONGS (12): </span>
                                    <strong className="text-emerald-600 font-mono tabular-nums">+${(9120 + liveDelta).toLocaleString()}</strong>
                                  </div>
                                  <div className={`rounded px-2 py-1 ${isDarkFocus ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                                    <span className="text-slate-400 font-semibold">SHORTS (5): </span>
                                    <strong className="text-emerald-600 font-mono">+$3,410</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Live Ledger Strip */}
                            <div className={`rounded-[12px] border overflow-hidden ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                              <div className={`divide-y ${isDarkFocus ? "divide-white/[0.06]" : "divide-[#E4E4E4]/70"}`}>
                                {[
                                  { pair: "XAU/USD", dir: "BUY", lot: "1.50L", tag: "NY Break & Retest · Live", r: "+2.4R", pnl: `+$${liveXauRow.toLocaleString()}`, good: true },
                                  { pair: "NAS100", dir: "SELL", lot: "1.00L", tag: "London Sweep", r: "+1.8R", pnl: "+$1,210", good: true },
                                  { pair: "EUR/USD", dir: "BUY", lot: "2.00L", tag: "Pre-News Fade", r: "-0.8R", pnl: "-$240", good: false },
                                ].map((row) => (
                                  <div key={row.pair} className="px-2.5 py-1.5 flex items-center justify-between text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold">{row.pair}</span>
                                      <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${row.dir === "BUY" ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-500"}`}>
                                        {row.dir}
                                      </span>
                                      <span className="text-slate-400">{row.lot} · {row.tag}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono tabular-nums">
                                      <span className="text-slate-400">{row.r}</span>
                                      <span className={`font-bold ${row.good ? "text-emerald-600" : "text-rose-500"}`}>{row.pnl}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── VIEW 3: EXACT HOME & COMMUNITY PAGE INTERFACE (LIVE MARKET QUOTES + VERIFIED FEED) ── */}
                        {active.id === "community" && (
                          <div className="grid grid-cols-12 gap-2 items-start">
                            {/* Left: My Watchlist (Live Ticking Prices) + Forex Factory News */}
                            <div className="col-span-3 space-y-2 hidden sm:block">
                              <div className={`rounded-[13px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[9px] font-bold">
                                  <span className="inline-flex items-center gap-1">
                                    My Watchlist
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[7.5px]">+ Add</span>
                                </div>
                                {[
                                  { sym: "XAU/USD", sub: "Gold Spot", p: liveXau, chg: `+1.${24 + liveTick}%`, up: true },
                                  { sym: "NAS100", sub: "Index", p: liveNas, chg: `+0.${82 + (liveTick % 4)}%`, up: true },
                                  { sym: "EUR/USD", sub: "Forex Spot", p: liveEur, chg: "-0.18%", up: false },
                                ].map((w) => (
                                  <div key={w.sym} className="flex items-center justify-between text-[8px]">
                                    <div>
                                      <span className="font-bold block leading-tight">{w.sym}</span>
                                      <span className="text-[7px] text-slate-400">{w.sub}</span>
                                    </div>
                                    <div className="text-right font-mono tabular-nums">
                                      <span className="block font-bold leading-tight">{w.p}</span>
                                      <span className={w.up ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{w.chg}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className={`rounded-[13px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[8.5px] font-bold">
                                  <span>Market News</span>
                                  <span className="text-[#2563EB] text-[7.5px]">Today</span>
                                </div>
                                {[
                                  { c: "USD", t: "Core PCE Price", tm: "13:30", dot: "bg-rose-500" },
                                  { c: "USD", t: "Chicago PMI", tm: "14:45", dot: "bg-amber-500" },
                                ].map((n) => (
                                  <div key={n.t} className="flex items-center justify-between text-[7.5px]">
                                    <span className="flex items-center gap-1 truncate">
                                      <span className={`w-1.5 h-1.5 rounded-full ${n.dot}`} />
                                      <strong>{n.c}</strong>
                                      <span className="truncate text-slate-400">{n.t}</span>
                                    </span>
                                    <span className="font-mono text-slate-400">{n.tm}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Center: Search Pill + Verified Trader Feed Posts */}
                            <div className="col-span-12 sm:col-span-6 space-y-2">
                              <div className={`rounded-full px-3 py-1.5 border flex items-center justify-between text-[8.5px] ${isDarkFocus ? "bg-[#17171A] border-white/[0.08] text-neutral-400" : "bg-white border-[#E4E4E4] text-slate-400"}`}>
                                <span className="inline-flex items-center gap-1.5 truncate">
                                  <Search size={10} />
                                  <span>Search traders, $tickers, #setups…</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[#2563EB] font-bold text-[7.5px]">For You</span>
                              </div>

                              {[
                                {
                                  author: "Arjun Mehta",
                                  handle: "@arjun_fx · 14m",
                                  badge: "XAU/USD LONG +2.4R",
                                  text: "NY Open liquidity sweep above 2,640 held structure. Risk Guard locked my 1/1 target at +$1,640.",
                                  setupPill: "NY Open Sweep · Exness MT5 Verified",
                                  likes: 128 + liveTick,
                                  comments: 24 + (liveTick % 2),
                                },
                                {
                                  author: "Sara Kapoor",
                                  handle: "@sara_trades · 1h",
                                  badge: "NAS100 · +$1,210",
                                  text: "Followed pre-market bullish bias and stepped away at 11:30 AM EST. 14 clean days with zero tilt.",
                                  setupPill: "London OB · Rule Score 96/100",
                                  likes: 94 + (liveTick % 3),
                                  comments: 16,
                                },
                              ].map((post) => (
                                <div key={post.handle} className={`rounded-[13px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                                        {post.author[0]}
                                      </span>
                                      <div className="min-w-0">
                                        <span className="text-[9px] font-bold block leading-none truncate">{post.author}</span>
                                        <span className="text-[7px] text-slate-400">{post.handle}</span>
                                      </div>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[7px] font-bold shrink-0">
                                      {post.badge}
                                    </span>
                                  </div>
                                  <p className={`text-[8px] leading-snug ${isDarkFocus ? "text-neutral-300" : "text-slate-600"}`}>
                                    {post.text}
                                  </p>
                                  <div className={`px-2 py-1 rounded-lg border text-[7.5px] font-semibold flex items-center justify-between ${isDarkFocus ? "bg-white/[0.03] border-white/[0.06] text-emerald-400" : "bg-emerald-50/70 border-emerald-200/70 text-emerald-700"}`}>
                                    <span>✓ {post.setupPill}</span>
                                    <span className="font-mono">+2.4R</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[7.5px] text-slate-400 pt-0.5">
                                    <span className="inline-flex items-center gap-2.5 font-mono tabular-nums">
                                      <span>♥ {post.likes}</span>
                                      <span>💬 {post.comments}</span>
                                    </span>
                                    <span>Repost · Share</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Right: Followers + Winning Streaks + Top Disciplined */}
                            <div className="col-span-3 space-y-2 hidden sm:block">
                              <div className={`rounded-[13px] p-2.5 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[8.5px] text-slate-400">Verified Network</div>
                                <div className="text-[13px] font-bold font-mono tabular-nums mt-0.5">{(1482 + liveTick).toLocaleString()} Followers</div>
                                <div className="text-[7.5px] text-emerald-600 font-semibold mt-0.5">+{38 + (liveTick % 4)} new this week</div>
                              </div>

                              <div className={`rounded-[13px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[9px] font-bold">Top Disciplined</div>
                                {[
                                  { n: "Nikhil H.", sub: "42 trades", s: `${94 + (liveTick % 2)} Score` },
                                  { n: "Arjun M.", sub: "31 trades", s: "91% Win" },
                                  { n: "Sara K.", sub: "28 trades", s: "89 Score" },
                                ].map((t) => (
                                  <div key={t.n} className="flex items-center justify-between text-[8px]">
                                    <div className="min-w-0">
                                      <span className="font-bold block leading-none truncate">{t.n}</span>
                                      <span className="text-[7px] text-slate-400">{t.sub}</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-[7px] shrink-0">
                                      {t.s}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className={`rounded-[13px] p-2.5 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[9px] font-bold mb-0.5">Winning Streaks</div>
                                <div className="text-[12px] font-bold text-amber-500 font-mono">14 Clean Days</div>
                                <div className="text-[7px] text-slate-400">0 risk breaches</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── VIEW 4: EXACT WEB USER APP RISK GUARD (Goal Strip + 3 Category Tabs + Gauge Card + Slots Card + Right Account Shield Panel) ── */}
                        {active.id === "risk-guard" && (
                          <div className="space-y-2">
                            {/* Profit Goal Progress & Star Milestones (exact RiskGuard.tsx) */}
                            <div className="rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] space-y-1.5">
                              <div className="flex items-center justify-between text-[8.5px]">
                                <span className="font-bold inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Profit Goal Milestones ·{" "}
                                  <span className="text-emerald-600 font-mono tabular-nums">+${liveGoalProfit.toLocaleString()} / $2,500</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/70 font-bold text-[7.5px]">
                                  ★ Claim +250 XP
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                  animate={{ width: `${liveGoalPct}%` }}
                                  transition={{ duration: 0.5, ease: EASE_OUT }}
                                  className="h-full rounded-full bg-[#2563EB]"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[7.5px] font-semibold text-slate-400">
                                <span className="text-[#2563EB]">★ $0</span>
                                <span className="text-[#2563EB]">★ +$625</span>
                                <span className="text-[#2563EB]">★ +$1,250</span>
                                <span className="text-emerald-600">★ +$1,875</span>
                                <span>+$2,500 Goal</span>
                              </div>
                            </div>

                            {/* Main 2-Column Workspace: Left Rule Cards + Tabs | Right Account Shield Panel (exact RiskGuard.tsx) */}
                            <div className="grid grid-cols-12 gap-2 items-stretch">
                              <div className="col-span-8 flex flex-col gap-2">
                                {/* 3 Category Tabs (matches RiskGuard.tsx) */}
                                <div className="grid grid-cols-3 p-0.5 rounded-[10px] bg-slate-200/80 border border-slate-200/70 text-[8px] font-semibold text-center">
                                  <div className="py-1 px-1 rounded-[8px] bg-white text-slate-900 shadow-xs inline-flex items-center justify-center gap-1">
                                    <span className="truncate">Trading Control</span>
                                    <span className="px-1 rounded-full bg-blue-50 text-[#2563EB] text-[7px] font-bold">4</span>
                                  </div>
                                  <div className="py-1 px-1 text-slate-500 inline-flex items-center justify-center gap-1">
                                    <span className="truncate">Risk Management</span>
                                    <span className="px-1 rounded-full bg-slate-300/60 text-slate-600 text-[7px] font-bold">3</span>
                                  </div>
                                  <div className="py-1 px-1 text-slate-500 inline-flex items-center justify-center gap-1">
                                    <span className="truncate">Behaviour</span>
                                    <span className="px-1 rounded-full bg-slate-300/60 text-slate-600 text-[7px] font-bold">3</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 flex-1">
                                  {/* Max Lot Size Card with Ruler Dial Gauge (exact RiskGuard.tsx lines 2525-2597) */}
                                  <div className="rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] flex flex-col justify-between">
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-5 h-5 rounded-lg bg-blue-50 text-[#2563EB] inline-flex items-center justify-center shrink-0">
                                          <Layers size={10} />
                                        </span>
                                        <div className="min-w-0">
                                          <div className="text-[9.5px] font-bold leading-tight truncate">Max Lot Size</div>
                                          <div className="text-[7px] text-slate-400 truncate">Hard cap per trade</div>
                                        </div>
                                      </div>
                                      <span className="w-6 h-3.5 rounded-full bg-[#2563EB] p-0.5 inline-flex justify-end items-center shrink-0">
                                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                      </span>
                                    </div>

                                    {/* Mini Ruler Dial Gauge */}
                                    <div className="flex items-center gap-2 my-1">
                                      <div className="relative w-16 h-12 shrink-0 flex items-center justify-center">
                                        <svg viewBox="0 0 80 56" className="w-16 h-12">
                                          <path d="M 10 46 A 30 30 0 1 1 70 46" fill="none" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 3" />
                                          <motion.path
                                            d="M 10 46 A 30 30 0 1 1 70 46"
                                            fill="none"
                                            stroke="#2563EB"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeDasharray="130"
                                            animate={{ strokeDashoffset: Math.max(20, 130 - liveLotPct * 1.1) }}
                                            transition={{ duration: 0.5 }}
                                          />
                                        </svg>
                                        <div className="absolute inset-x-0 bottom-1 text-center">
                                          <span className="text-[11px] font-extrabold font-mono text-slate-900 tabular-nums">{liveLotPct}%</span>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0 space-y-1 text-[7.5px]">
                                        <div className="flex justify-between">
                                          <span className="text-slate-400">Lock Set</span>
                                          <strong className="font-mono">2.00 L</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="px-1 rounded bg-emerald-100 text-emerald-700 font-bold text-[6.5px] uppercase">Live</span>
                                          <strong className="font-mono text-[#2563EB] tabular-nums">{liveOpenLots} L</strong>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-[7.5px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                                      <span>Martingale Guard</span>
                                      <strong className="text-emerald-600">Armed</strong>
                                    </div>
                                  </div>

                                  {/* Daily Trade Limit + Drawdown Card */}
                                  <div className="flex flex-col gap-2">
                                    <div className="rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <ShieldCheck size={11} className="text-[#2563EB]" />
                                          <span className="text-[9.5px] font-bold">Daily Trade Limit</span>
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[7.5px] font-bold">2 / 5</span>
                                      </div>
                                      <TradeSlotsBlobStrip total={5} completed={2} interactive={false} />
                                    </div>

                                    <div className="rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] flex-1 flex flex-col justify-between">
                                      <div className="flex items-center justify-between text-[9px] font-bold">
                                        <span>Drawdown Guard</span>
                                        <span className="text-emerald-600 font-mono tabular-nums">{liveDdPct}% / 3.0%</span>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden my-1">
                                        <motion.div
                                          animate={{ width: `${Math.round((Number(liveDdPct) / 3.0) * 100)}%` }}
                                          transition={{ duration: 0.45 }}
                                          className="h-full rounded-full bg-emerald-500"
                                        />
                                      </div>
                                      <div className="flex justify-between text-[7.5px] text-slate-400">
                                        <span>Floor: <strong className="text-slate-700">$35,500</strong></span>
                                        <span className="text-emerald-600 font-semibold">Cooldown 15m</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Account Shield Panel (exact RiskGuard.tsx lines 4937-5060!) */}
                              <div className="col-span-4 rounded-[12px] border bg-white border-[#E4E4E4] flex flex-col justify-between overflow-hidden">
                                <div className="px-2.5 pt-2 pb-1 flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-slate-900">Account Shield</span>
                                  <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Strong Shield
                                  </span>
                                </div>

                                <div className="px-2.5 flex flex-col items-center">
                                  <div className="relative w-24 h-14 flex items-center justify-center">
                                    <svg viewBox="0 0 100 62" className="w-24 h-14">
                                      <path d="M 12 52 A 38 38 0 1 1 88 52" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 3.5" />
                                      <motion.path
                                        d="M 12 52 A 38 38 0 1 1 88 52"
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray="165"
                                        initial={{ strokeDashoffset: 165 }}
                                        animate={{ strokeDashoffset: Math.round(165 * (1 - liveShieldScore / 100)) }}
                                        transition={{ duration: 0.7, ease: EASE_OUT }}
                                      />
                                    </svg>
                                    <div className="absolute inset-x-0 bottom-0.5 text-center leading-tight">
                                      <div className="text-[13px] font-extrabold font-mono text-slate-900 tabular-nums">{liveShieldScore}%</div>
                                      <div className="text-[7px] text-slate-400 font-semibold">10/16 rules</div>
                                    </div>
                                  </div>
                                </div>

                                {/* 3-Pillar Progress List */}
                                <div className="px-2.5 py-1.5 border-t border-slate-100 space-y-1.5 text-[7.5px]">
                                  {[
                                    { title: "Trading Control", count: "4/4", w: "100%", bar: "bg-[#2563EB]" },
                                    { title: "Risk & Capital", count: "3/6", w: "50%", bar: "bg-emerald-500" },
                                    { title: "Behaviour Control", count: "3/7", w: "43%", bar: "bg-indigo-500" },
                                  ].map((pillar) => (
                                    <div key={pillar.title}>
                                      <div className="flex justify-between font-semibold mb-0.5">
                                        <span className="text-slate-700">{pillar.title}</span>
                                        <span className="text-slate-400 font-mono">{pillar.count}</span>
                                      </div>
                                      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: pillar.w }}
                                          transition={{ duration: 0.6, ease: EASE_OUT }}
                                          className={`h-full rounded-full ${pillar.bar}`}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* 2x2 Safety Checks Matrix */}
                                <div className="px-2.5 py-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[7.5px] font-semibold text-slate-700">
                                  {["Capital safe", "Lots capped", "Tilt blocked", "Auto-stop on"].map((chk) => (
                                    <span key={chk} className="inline-flex items-center gap-1 truncate">
                                      <CheckCircle2 size={8.5} className="text-emerald-500 shrink-0" />
                                      <span className="truncate">{chk}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── VIEW 5: REAL REPORTS & STATEMENTS INTERFACE (KPI Strip + Equity AreaChart + Audited Statement Rows) ── */}
                        {active.id === "reports" && (
                          <div className="space-y-2">
                            {/* Top 4 KPI Summary Cards */}
                            <div className="grid grid-cols-4 gap-1.5">
                              {[
                                { label: "Verified Net P&L", val: `+$${liveNetPnl.toLocaleString()}`, sub: "17 broker-synced trades", tone: "text-[#2563EB]" },
                                { label: "Return on Capital", val: `+50.${1 + (liveTick % 2)}%`, sub: "$25,000 → $37,530", tone: "text-emerald-600" },
                                { label: "Profit Factor", val: (16.1 + liveTick * 0.04).toFixed(2), sub: "82.4% win rate", tone: "text-slate-900" },
                                { label: "Audited Docs", val: "4 Ready", sub: "PDF · CSV · Public link", tone: "text-slate-900" },
                              ].map((k) => (
                                <div key={k.label} className="rounded-[11px] p-2 border bg-white border-[#E4E4E4]">
                                  <div className="text-[7.5px] font-medium text-slate-400 truncate">{k.label}</div>
                                  <div className={`text-[11px] font-extrabold font-mono tabular-nums mt-0.5 ${k.tone}`}>{k.val}</div>
                                  <div className="text-[7px] text-slate-400 mt-0.5 truncate">{k.sub}</div>
                                </div>
                              ))}
                            </div>

                            {/* Middle: Audited Equity Curve + Daily Heatmap Strip */}
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-7 rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[9px] font-bold">
                                  <span>Verified Growth Curve · Nov 2026</span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[7.5px] font-bold inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Exness Audited
                                  </span>
                                </div>
                                <svg viewBox="0 0 240 62" className="w-full h-14 my-1 overflow-visible">
                                  <defs>
                                    <linearGradient id="reportCurveG" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.24" />
                                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  <path d="M4,54 L36,46 L68,48 L100,36 L132,29 L164,21 L196,15 L234,7 L234,58 L4,58 Z" fill="url(#reportCurveG)" />
                                  <motion.path
                                    d="M4,54 L36,46 L68,48 L100,36 L132,29 L164,21 L196,15 L234,7"
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.9, ease: EASE_OUT }}
                                  />
                                  <circle cx="234" cy="7" r="3" fill="#10B981" />
                                </svg>
                                <div className="flex justify-between text-[7.5px] text-slate-400 border-t border-slate-100 pt-1">
                                  <span>Max Drawdown: <strong className="text-slate-700">1.1%</strong></span>
                                  <span>Sharpe: <strong className="text-emerald-600">2.84</strong></span>
                                  <span>Verified Hash: <strong className="font-mono">#TF-94A2</strong></span>
                                </div>
                              </div>

                              <div className="col-span-5 rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                                  <span>14-Day P&amp;L Matrix</span>
                                  <span className="text-[#2563EB] font-mono">86% Green</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {[
                                    "+$620", "+$1.1k", "-$280", "+$940", "+$1.4k", "+$750", "+$1.6k",
                                    "+$890", "+$1.5k", "-$240", "+$980", "+$1.2k", "+$650", `+$${(liveXauRow / 1000).toFixed(2)}k`,
                                  ].map((val, idx) => (
                                    <div
                                      key={idx}
                                      className={`rounded py-1.5 text-center text-[6.5px] font-bold border tabular-nums ${
                                        val.startsWith("-")
                                          ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                                      }`}
                                    >
                                      {val}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Export Statements List */}
                            <div className="rounded-[12px] border bg-white border-[#E4E4E4] divide-y divide-slate-100">
                              {[
                                { name: "November 2026 Audit Statement", meta: "Monthly Statements · Exness MT5 Verified", fmt: "PDF", size: "420 KB", pnl: `+$${liveNetPnl.toLocaleString()}` },
                                { name: "Prop Challenge Review Ledger", meta: "Audit Statements · 17 Closed Fills", fmt: "XLSX", size: "184 KB", pnl: "Rule Score 94%" },
                              ].map((doc) => (
                                <div key={doc.name} className="px-2.5 py-1.5 flex items-center justify-between text-[8.5px]">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold text-[7px]">{doc.fmt}</span>
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                                      <div className="text-[7px] text-slate-400 truncate">{doc.meta} · {doc.size}</div>
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-600 tabular-nums shrink-0">{doc.pnl}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── VIEW 6: EXACT TRADI FIVE AI COACH WEB APP PAGE (AI Console Left Drawer + Live Consultation + Quick Audit Prompt Cards + Input Console) ── */}
                        {active.id === "ai-coach" && (
                          <div className="grid grid-cols-12 gap-2 items-stretch">
                            {/* Left AI Console Sidebar (exact TradifiveAI.tsx lines 1468-1643) */}
                            <div className="col-span-4 rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    AI Console
                                  </span>
                                  <span className="text-[7.5px] text-emerald-600 font-semibold">Live</span>
                                </div>

                                <div className="w-full py-1.5 px-2.5 rounded-xl bg-blue-600 text-white text-[9px] font-bold flex items-center gap-1.5 shadow-xs">
                                  <Plus size={11} strokeWidth={2.5} />
                                  <span>New Chat</span>
                                </div>

                                <div>
                                  <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Recent Audits
                                  </div>
                                  <div className="space-y-1">
                                    {[
                                      { title: "NY Open Profit Audit", sub: "+89% gains · $11,150", active: true },
                                      { title: "Drawdown Risk Check", sub: `${liveDdPct}% daily buffer`, active: false },
                                      { title: "Optimal Lot Sizing", sub: `0.5% cap = ${liveOpenLots}L`, active: false },
                                    ].map((sess) => (
                                      <div
                                        key={sess.title}
                                        className={`px-2 py-1.5 rounded-lg border text-left ${
                                          sess.active
                                            ? "bg-slate-100/90 border-slate-200/80 text-slate-900"
                                            : "border-transparent text-slate-500"
                                        }`}
                                      >
                                        <div className="text-[8.5px] font-semibold truncate">{sess.title}</div>
                                        <div className="text-[7px] text-slate-400 truncate font-mono tabular-nums">{sess.sub}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Sidebar Footer: Active MT5 Bridge Card (exact TradifiveAI.tsx lines 1600-1623) */}
                              <div className="pt-2 border-t border-slate-100 space-y-1">
                                <div className="flex items-center gap-1 text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active MT5 Bridge</span>
                                </div>
                                <div className="rounded-lg p-1.5 border border-slate-200/80 bg-[#F8FAFC] flex items-center justify-between gap-1">
                                  <div className="min-w-0">
                                    <div className="text-[8.5px] font-bold text-slate-800 truncate">Exness MT5</div>
                                    <div className="text-[7px] text-slate-400 font-mono">MT5 #40892</div>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-[7px] font-bold uppercase">
                                    Live
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Main Coach Workspace (Live Streamed Audit + 2x2 Prompt Cards + Real Input Console) */}
                            <div className="col-span-8 flex flex-col justify-between gap-1.5">
                              {/* Live AI Conversation Cards */}
                              <div className="rounded-[12px] p-2.5 border bg-white border-[#E4E4E4] space-y-1.5">
                                <div className="flex justify-end">
                                  <div className="rounded-xl rounded-tr-sm px-2.5 py-1 bg-blue-600 text-white text-[8.5px] font-medium">
                                    Audit my NY Open performance &amp; lock optimal sizing
                                  </div>
                                </div>

                                <div className="rounded-xl rounded-tl-sm p-2 border bg-[#F8FAFC] border-slate-200/80 space-y-1.5">
                                  <div className="flex items-center justify-between text-[8px]">
                                    <span className="font-bold text-blue-600 inline-flex items-center gap-1">
                                      <Sparkles size={9.5} /> TradiFive AI · Analytical Quant
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-mono font-bold tabular-nums">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                      Synced · +${liveNetPnl.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-[8px] leading-relaxed text-slate-700">
                                    Your first 2 NY Open fills produced <strong className="text-slate-900">+89% of gains (${(11150 + liveDelta).toLocaleString()})</strong> with 0 tilt. Cap lot exposure at <strong className="font-mono text-blue-600">{liveOpenLots}L</strong> before CPI.
                                  </p>
                                  <div className="rounded-lg border border-slate-200/80 overflow-hidden text-[7.5px]">
                                    <div className="grid grid-cols-3 bg-slate-100/80 px-2 py-0.5 font-bold text-slate-500 uppercase">
                                      <span>Window</span>
                                      <span>Win Rate</span>
                                      <span className="text-right">Avg R / P&amp;L</span>
                                    </div>
                                    <div className="grid grid-cols-3 px-2 py-1 bg-white font-medium text-slate-700 border-t border-slate-100">
                                      <span>NY Open (8–11a)</span>
                                      <span className="text-emerald-600 font-bold">88.2%</span>
                                      <span className="text-right font-mono font-bold text-emerald-600 tabular-nums">+2.4R</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Compact 2x2 Quick Audit Chips (matches TradifiveAI.tsx lines 1688-1742) */}
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { title: "Audit Recent Trades", sub: "Win-rate & setup leaks", icon: TrendingUp, tone: "bg-blue-50 text-blue-600" },
                                  { title: "Drawdown Risk Check", sub: `Buffer ${liveDdPct}% / 3.0%`, icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-600" },
                                ].map((c) => (
                                  <div key={c.title} className="rounded-[10px] p-1.5 border bg-white border-[#E4E4E4] flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${c.tone}`}>
                                      <c.icon size={11} />
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-[8px] font-bold text-slate-900 truncate">{c.title}</div>
                                      <div className="text-[7px] text-slate-400 truncate font-mono tabular-nums">{c.sub}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Authentic Input Console Card (matches TradifiveAI.tsx lines 1215-1378) */}
                              <div className="rounded-[12px] p-2 border bg-white border-[#E4E4E4] space-y-1.5">
                                <div className="flex items-center justify-between text-[7.5px]">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold tabular-nums">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    Credits: {10 - (liveTick % 2)} / 10
                                  </span>
                                  <span className="font-bold text-blue-600 inline-flex items-center gap-0.5">
                                    <Zap size={9} className="fill-current" /> Upgrade plan
                                  </span>
                                </div>
                                <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 flex items-center justify-between text-[8px] text-slate-400">
                                  <span className="truncate">Ask your AI Coach about trades, risk, or psychology...</span>
                                  <span className="w-5 h-5 rounded-lg bg-blue-600 text-white inline-flex items-center justify-center font-bold shrink-0">↑</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Curly Pills Column — Uniform Fixed Size on Click */}
          <div className="hidden lg:flex flex-col justify-center gap-12 z-20 pl-0">
            {rightModules.map((mod, idx) => (
              <div key={mod.id} className="relative flex items-center justify-start">
                {renderCurlyConnector(idx, mod.id === activeId, "right")}
                {renderCurlyButton(mod, "right")}
              </div>
            ))}
          </div>
        </div>

        {/* Frosted Bento Summary Card Below Workspace Frame */}
        <div className="relative z-20 mt-5 sm:mt-6 max-w-[880px] mx-auto pb-6 sm:pb-10">
          <div className="relative overflow-hidden rounded-[24px_14px_24px_14px] sm:rounded-[28px_16px_28px_16px] bg-white/90 backdrop-blur-xl border border-white/90 ring-1 ring-slate-200/75 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.14)] p-4 sm:p-6">
            {/* Subtle decorative curly ribbon flourish */}
            <svg
              viewBox="0 0 80 28"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute top-3 right-5 w-16 h-6 opacity-30"
            >
              <path
                d="M 4 22 C 18 4, 34 4, 42 14 C 48 22, 38 26, 33 20 C 29 14, 38 6, 56 10 C 66 12, 72 17, 76 14"
                stroke="#2563EB"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch"
              >
                {/* Left: Module Header + Dual KPI Cards */}
                <div className="lg:col-span-5 flex flex-col justify-between lg:border-r lg:border-slate-200/70 lg:pr-6">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-[14px_6px_14px_6px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white inline-flex items-center justify-center shrink-0 shadow-[0_8px_18px_-4px_rgba(37,99,235,0.45)]">
                      <active.icon className="w-[18px] h-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[19px] sm:text-[20px] font-bold tracking-tight text-slate-950 leading-tight">
                        {active.label}
                      </h3>
                      <p className="text-[12.5px] font-medium text-slate-500 mt-0.5">
                        {active.taglineLead}
                        <span className="text-[#2563EB] font-semibold">{active.taglineAccent}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {/* Hero Metric Tile */}
                    <div className="rounded-2xl bg-[#F8FAFF] border border-slate-200/80 px-3.5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                          {active.metricLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Live snapshot
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <span className="text-[22px] font-extrabold tracking-tight text-slate-950 tabular-nums">
                          {active.metricValue}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 truncate">
                          {active.metricSub}
                        </span>
                      </div>
                    </div>

                    {/* Score Meter Tile */}
                    <div className="rounded-2xl bg-white/95 border border-slate-200/80 px-3.5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                          {active.scoreLabel}
                        </span>
                        <span className="text-[13px] font-extrabold text-slate-950 tabular-nums">
                          {active.scoreValue}
                          <span className="text-[10.5px] font-semibold text-slate-400"> / 100</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-[2.5px] mt-2" aria-hidden="true">
                        {Array.from({ length: totalTicks }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`h-2.5 flex-1 rounded-[1.5px] transition-colors ${
                              idx < activeTicks ? "bg-[#2563EB]" : "bg-slate-200/85"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10.5px] text-slate-500 mt-2">{active.scoreNote}</div>
                    </div>
                  </div>
                </div>

                {/* Right: 2x2 Capability Bento + Module Stepper & CTA */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pr-14 sm:pr-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Inside {active.label}
                      </span>
                      {/* Inline Quick Module Stepper */}
                      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 border border-slate-200/70 p-0.5">
                        <button
                          type="button"
                          aria-label="Previous module"
                          onClick={() => {
                            const i = SESSION_MODULES.findIndex((m) => m.id === active.id);
                            const prev = SESSION_MODULES[(i - 1 + SESSION_MODULES.length) % SESSION_MODULES.length];
                            setActiveId(prev.id);
                          }}
                          className="w-5 h-5 rounded-full inline-flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <div className="flex items-center gap-1 px-1">
                          {SESSION_MODULES.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              aria-label={`View ${m.label}`}
                              onClick={() => setActiveId(m.id)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                m.id === active.id
                                  ? "w-4 bg-[#2563EB]"
                                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          aria-label="Next module"
                          onClick={() => {
                            const i = SESSION_MODULES.findIndex((m) => m.id === active.id);
                            const next = SESSION_MODULES[(i + 1) % SESSION_MODULES.length];
                            setActiveId(next.id);
                          }}
                          className="w-5 h-5 rounded-full inline-flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-white transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {active.bullets.map((b, i) => (
                        <div
                          key={i}
                          className="group rounded-[16px_8px_16px_8px] bg-white/90 border border-slate-200/75 p-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-[#93C5FD] hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.2)] transition-all"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-[7px_3px_7px_3px] bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold inline-flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                              0{i + 1}
                            </span>
                            <p className="text-[12.5px] leading-snug text-slate-600">
                              {b.before}
                              <span className="text-[#2563EB] font-semibold">{b.accent}</span>
                              {b.after}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cohesive Action Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-[11.5px] font-medium text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Included free across MT5 &amp; broker sync</span>
                    </div>

                    <button
                      type="button"
                      onClick={onStart}
                      className="inline-flex items-center gap-2 rounded-[16px_7px_16px_7px] bg-slate-950 hover:bg-[#2563EB] text-white px-4 py-2 text-[12.5px] font-semibold shadow-[0_8px_20px_-6px_rgba(15,23,42,0.35)] hover:shadow-[0_10px_24px_-6px_rgba(37,99,235,0.45)] transition-all cursor-pointer"
                    >
                      <span>Try {active.label} free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   CONNECTED MT5 BROKERS STRIP
════════════════ */
function PlatformPillars() {
  return (
    <section className="py-10 sm:py-12 overflow-hidden relative bg-white border-y border-slate-100">
      <div className="text-center mb-6 px-4">
        <p className="text-[12.5px] font-medium tracking-[-0.01em] text-slate-400">
          Direct MetaTrader 5 connectivity across 40+ global brokers &amp; prop desks
        </p>
      </div>
      <div className="pillar-mask max-w-[1280px] mx-auto">
        <div className="br-track items-center">
          {[...MT5_BROKER_LOGOS, ...MT5_BROKER_LOGOS].map((broker, i) => (
            <div
              key={`${broker.id}-${i}`}
              title={broker.name}
              className="inline-flex items-center px-7 sm:px-9 py-1.5 shrink-0 select-none opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 border-r border-slate-100"
            >
              {broker.render()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   REUSABLE SCROLL SECTION HEADER (BOXED BADGE + BLURTEXT + SUBHEADER)
════════════════ */
function SectionHeader({
  badge,
  icon: Icon,
  tone = "blue",
  title,
  subtitle,
  description,
  align = "center",
  className = "",
  inlineSubtitle = false,
  action,
}: {
  badge: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  tone?: "blue" | "rose" | "emerald";
  title: string;
  subtitle: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  inlineSubtitle?: boolean;
  action?: React.ReactNode;
}) {
  const toneStyles = {
    blue: "bg-blue-50 border-blue-200/70 text-[#2563EB]",
    rose: "bg-rose-50 border-rose-200/70 text-rose-600",
    emerald: "bg-emerald-50 border-emerald-200/70 text-emerald-700",
  }[tone];

  const isCenter = align === "center";

  return (
    <div className={`${isCenter ? "text-center flex flex-col items-center" : "text-left"} ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className={`inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white border border-[#E4E4E4] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.08)] mb-4 ${isCenter ? "mx-auto" : ""
          }`}
      >
        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${toneStyles}`}>
          <Icon size={11} strokeWidth={2.2} />
        </span>
        <span className="text-[12px] font-semibold tracking-[-0.01em] text-slate-900">
          {badge}
        </span>
      </motion.div>

      <h2
        style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
        className={`text-[28px] sm:text-[42px] font-bold tracking-[-0.035em] leading-[1.1] text-slate-950 ${isCenter ? "max-w-[780px] mx-auto" : ""
          }`}
      >
        {inlineSubtitle ? (
          <span
            className={`inline-flex flex-wrap items-baseline gap-x-[0.26em] ${isCenter ? "justify-center" : "justify-start"
              }`}
          >
            <BlurText
              as="span"
              text={title}
              effect="blur"
              animateBy="words"
              direction="top"
              trigger="view"
              threshold={0.05}
              delay={55}
              stepDuration={0.3}
              blur={8}
              distance={22}
              className={`${isCenter ? "justify-center" : "justify-start"} font-bold tracking-[-0.035em] text-slate-950`}
            />
            <BlurText
              as="span"
              text={subtitle}
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
              className={`${isCenter ? "justify-center" : "justify-start"} font-normal tracking-[-0.03em] text-slate-400`}
            />
          </span>
        ) : (
          <>
            <BlurText
              as="span"
              text={title}
              effect="blur"
              animateBy="words"
              direction="top"
              trigger="view"
              threshold={0.05}
              delay={55}
              stepDuration={0.3}
              blur={8}
              distance={22}
              className={`${isCenter ? "justify-center" : "justify-start"} font-bold tracking-[-0.035em] text-slate-950`}
            />
            <BlurText
              as="span"
              text={subtitle}
              effect="blur"
              animateBy="words"
              direction="top"
              trigger="view"
              threshold={0.05}
              delay={55}
              initialDelay={200}
              stepDuration={0.3}
              blur={8}
              distance={22}
              className={`${isCenter ? "justify-center" : "justify-start"} font-normal tracking-[-0.03em] text-slate-400 mt-1`}
            />
          </>
        )}
      </h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
          className={`text-[15px] sm:text-[16px] font-normal text-slate-600 leading-[1.6] mt-4 ${isCenter ? "max-w-[590px] mx-auto" : ""
            }`}
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: 0.3, ease: EASE_OUT }}
          className="mt-7"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}

/* ════════════════
   WHY TRADIFIVE
════════════════ */
function WhyTradiFive() {
  return (
    <section id="why-tradifive" className="py-20 sm:py-24 px-4 sm:px-7 relative bg-white">
      <div className="max-w-[1160px] mx-auto">
        <SectionHeader
          badge="Why TradiFive"
          icon={Layers}
          tone="blue"
          title="Trading is more than charts —"
          subtitle="it comes down to psychology & discipline."
          description="Every system in TradiFive links your live MT5 feed, automated journal memory, Risk Guard limits, and AI coaching in one loop."
          className="mb-12"
        />

        <div className="w-full text-left">
          <AgentBentoGrid />
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   THE PROBLEM
════════════════ */
function ProblemSection() {
  const PROBLEMS = [
    {
      num: "01",
      title: "Revenge trading after one red trade",
      desc: "A clean morning gain unravels in fifteen minutes when impulse re-entries double position size to 'make it back'.",
      impact: "Wipes weekly gains",
    },
    {
      num: "02",
      title: "Disconnected spreadsheets & skipped logs",
      desc: "Manual tracking misses bad fills, emotional exits, and time-of-day leaks — hiding the real reason drawdowns happen.",
      impact: "Blinds edge metrics",
    },
    {
      num: "03",
      title: "No real-time loss circuit breaker",
      desc: "By the time you review trades on Sunday evening, daily limits and funded evaluation rules have already been breached.",
      impact: "Blown evaluations",
    },
    {
      num: "04",
      title: "Zero objective feedback loop",
      desc: "Without quantified execution scoring, good strategy reads get abandoned while bad risk habits repeat unchecked.",
      impact: "Inconsistent sizing",
    },
  ];

  return (
    <section id="problem" className="py-20 sm:py-24 px-4 sm:px-7 relative bg-white overflow-hidden">
      {/* Vivid alpine mountain backdrop with crisp peak visibility + gentle top/bottom white dissolves */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <motion.img
          src="/mountain.jpg"
          alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          whileInView={{ opacity: 0.86, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.05, ease: EASE_OUT }}
          className="w-full h-full object-cover object-[46%_40%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.22) 13%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.24) 85%, #ffffff 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0.4) 100%)",
          }}
        />
      </div>

      <div className="max-w-[1160px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
          <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 p-5 sm:p-6 shadow-[0_14px_38px_-16px_rgba(15,23,42,0.12)]">
            <SectionHeader
              badge="The problem"
              icon={AlertTriangle}
              tone="rose"
              align="left"
              title="Most traders don't lack setups —"
              subtitle="they lose to unguarded behavior."
              description="Charts only show price. The real capital leaks happen in execution discipline right between setups."
              className="mb-4"
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.28, ease: EASE_OUT }}
              className="rounded-xl bg-rose-50/75 border border-rose-200/70 px-3.5 py-2.5 flex items-start gap-2.5 text-[12.5px] text-slate-700 leading-relaxed"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                Over <strong className="text-slate-900">70% of monthly equity drawdowns</strong> occur during unscheduled post-loss sessions.
              </span>
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {PROBLEMS.map((p, idx) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, x: 20, y: 12 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -2, transition: { duration: 0.18, ease: EASE_OUT } }}
              transition={{ duration: 0.45, delay: 0.08 + idx * 0.09, ease: EASE_OUT }}
              className="rounded-2xl bg-white/86 backdrop-blur-md border border-[#E4E4E4] px-5 py-4 sm:py-4.5 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.1)] hover:border-rose-200/90 hover:bg-white/95 transition-colors flex items-start gap-4 sm:gap-5 group"
            >
              <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-rose-50 text-[11.5px] font-mono font-bold text-slate-500 group-hover:text-rose-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors tabular-nums">
                {p.num}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-slate-900">
                    {p.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/70 text-[10.5px] font-semibold text-rose-600 shrink-0">
                    {p.impact}
                  </span>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   THE SOLUTION
════════════════ */
function SolutionSection({ onStart }: { onStart: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.15 });
  const manualPauseUntilRef = useRef<number>(0);

  const pauseAutoBriefly = () => {
    manualPauseUntilRef.current = Date.now() + 7000;
  };

  // Card 1: Daily Trade Limit interactive + auto state
  const [tradeLimitActive, setTradeLimitActive] = useState(true);
  const [tradeCap, setTradeCap] = useState(5);
  const [tradesUsed, setTradesUsed] = useState(1);

  // Card 2: Smart Journal interactive + auto state
  const [journalLiveIdx, setJournalLiveIdx] = useState(0);
  const [selectedRowIdx, setSelectedRowIdx] = useState(0);

  const JOURNAL_BATCHES = [
    [
      { pair: "XAU/USD", lot: "1.25L", setup: "NY Open Sweep", rr: "+2.4R", pnl: "+$1,480", win: true, note: "Waited for sweep · Rule score 98/100" },
      { pair: "EUR/USD", lot: "2.00L", setup: "London OB", rr: "+1.8R", pnl: "+$960", win: true, note: "Clean 0.5% risk · Held to target" },
      { pair: "NAS100", lot: "0.50L", setup: "FVG Retest", rr: "-1.0R", pnl: "-$310", win: false, note: "Stopped cleanly · Zero revenge trade" },
    ],
    [
      { pair: "GBP/USD", lot: "1.50L", setup: "London Break", rr: "+2.1R", pnl: "+$1,120", win: true, note: "Synced in 0.4s from Exness MT5" },
      { pair: "XAU/USD", lot: "1.25L", setup: "NY Open Sweep", rr: "+2.4R", pnl: "+$1,480", win: true, note: "Waited for sweep · Rule score 98/100" },
      { pair: "USD/JPY", lot: "1.80L", setup: "Session High Rej", rr: "+1.5R", pnl: "+$740", win: true, note: "Followed pre-market level cleanly" },
    ],
  ];
  const activeTrades = JOURNAL_BATCHES[journalLiveIdx];
  const selectedTradeObj = activeTrades[selectedRowIdx] || activeTrades[0];

  // Card 3: Pre-Market Plan & AI Coach interactive + auto state
  const BIASES = [
    {
      label: "Bullish bias",
      dotClass: "bg-emerald-500",
      session: "NY Session",
      score: "94/100",
      highlight: "+89% of gains",
      quote: "Your first 2 NY Open setups made",
      tail: "with zero revenge trades.",
    },
    {
      label: "Bearish bias",
      dotClass: "bg-rose-500",
      session: "London Session",
      score: "91/100",
      highlight: "3 clean short setups",
      quote: "You skipped 2 late counter-trend traps and caught",
      tail: "inside your risk plan.",
    },
    {
      label: "Range / Wait",
      dotClass: "bg-amber-500",
      session: "Risk Check",
      score: "97/100",
      highlight: "100% capital saved",
      quote: "Staying flat during choppy pre-news action kept",
      tail: "until clean structure formed.",
    },
  ] as const;
  const [biasIdx, setBiasIdx] = useState(0);
  const activeBias = BIASES[biasIdx];

  // Card 4: Dashboard Net Cumulative P&L timeframe switcher
  const PNL_RANGES = ["7D", "30D", "ALL"] as const;
  const PNL_STATS = {
    "7D": {
      pnlNum: 2140.0,
      wins: 4,
      losses: 1,
      closed: 5,
      winPct: 80,
      avgRR: 2.3,
      pf: 3.1,
      avgWL: "$610 / $220",
    },
    "30D": {
      pnlNum: 8420.5,
      wins: 14,
      losses: 4,
      closed: 18,
      winPct: 78,
      avgRR: 2.15,
      pf: 2.48,
      avgWL: "$740 / $290",
    },
    ALL: {
      pnlNum: 24890.0,
      wins: 41,
      losses: 12,
      closed: 53,
      winPct: 77,
      avgRR: 2.08,
      pf: 2.36,
      avgWL: "$795 / $310",
    },
  } as const;
  const [pnlRange, setPnlRange] = useState<"7D" | "30D" | "ALL">("30D");
  const currentStats = PNL_STATS[pnlRange];

  // Auto-play animations across all 4 cards when section is visible
  useEffect(() => {
    if (!isInView) return;

    const slotsTimer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) return;
      if (!tradeLimitActive) return;
      setTradesUsed((prev) => (prev >= tradeCap ? 0 : prev + 1));
    }, 1850);

    const journalTimer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) return;
      setSelectedRowIdx((prev) => {
        if (prev < 2) return prev + 1;
        setJournalLiveIdx((b) => (b + 1) % JOURNAL_BATCHES.length);
        return 0;
      });
    }, 2300);

    const aiTimer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) return;
      setBiasIdx((prev) => (prev + 1) % BIASES.length);
    }, 3400);

    const pnlTimer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) return;
      setPnlRange((prev) => {
        const nextIdx = (PNL_RANGES.indexOf(prev) + 1) % PNL_RANGES.length;
        return PNL_RANGES[nextIdx];
      });
    }, 3100);

    return () => {
      window.clearInterval(slotsTimer);
      window.clearInterval(journalTimer);
      window.clearInterval(aiTimer);
      window.clearInterval(pnlTimer);
    };
  }, [isInView, tradeLimitActive, tradeCap]);

  const tradesLeft = Math.max(0, tradeCap - tradesUsed);
  const tradesBreached = tradeLimitActive && tradesUsed >= tradeCap;

  const donutSize = 60;
  const strokeWidth = 5.5;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - currentStats.winPct / 100);

  return (
    <section ref={sectionRef} id="solution" className="py-14 sm:py-16 px-4 sm:px-7 relative bg-white">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <SectionHeader
            badge="The solution"
            icon={CheckCircle2}
            tone="emerald"
            align="left"
            title="One simple workspace"
            subtitle="built from real trading tools."
            description="Every rule limit, auto-synced trade, AI review, and P&L stat works together automatically."
            className="max-w-[600px]"
          />
          <button
            type="button"
            onClick={onStart}
            className="tactile-blue-pill h-10 px-6 rounded-full text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Try TradiFive Free</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>

        <div className="rounded-2xl bg-[#E4E4E4]/45 border border-[#E4E4E4] p-2 sm:p-2.5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5">
            {/* CARD 1: Risk Guard — Daily Trade Limit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-4 flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[#E4E4E4]/70">
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                    <Lock size={13.5} strokeWidth={1.8} className="text-slate-700" />
                    <span>Stops <span className="text-slate-800 font-medium">overtrading</span></span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700">
                    Risk Guard
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-slate-900 mb-0.5">
                  Daily Trade Limit
                </h3>
                <p className="text-[12.5px] text-slate-500 leading-snug">
                  Pick your max trades per day so you never take extra emotional trades after a win or loss.
                </p>
              </div>

              {/* Actual Real Web App Card: Risk Guard Daily Trade Limit */}
              <div className="p-3 rounded-[14px] bg-white border border-[#E4E4E4] shadow-[0_2px_8px_rgba(15,23,42,0.03)] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                        tradeLimitActive
                          ? "bg-blue-50 text-[#2563EB]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <ShieldCheck size={13} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-slate-900 truncate leading-tight">
                        Daily Trade Limit
                      </div>
                      <div className="text-[10px] text-slate-400 truncate leading-tight">
                        Stop overtrading after max orders per day
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold tabular-nums ${
                        tradeLimitActive
                          ? "bg-blue-50 text-[#2563EB]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tradeCap}/day
                    </span>
                    <Switch
                      checked={tradeLimitActive}
                      onCheckedChange={(checked) => {
                        pauseAutoBriefly();
                        setTradeLimitActive(checked);
                      }}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5 tabular-nums">
                      <span>Today: {tradesUsed} / {tradeCap}</span>
                      <span
                        className={`px-1.5 py-[0.5px] rounded text-[8px] font-bold uppercase ${
                          tradeLimitActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tradeLimitActive ? "LIVE" : "PAUSED"}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {tradesUsed > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            pauseAutoBriefly();
                            setTradesUsed(0);
                          }}
                          className="text-[9.5px] font-semibold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                      <span
                        className={`font-semibold tabular-nums ${
                          !tradeLimitActive
                            ? "text-slate-400"
                            : tradesBreached
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {!tradeLimitActive
                          ? "Guard paused"
                          : tradesBreached
                          ? "Limit reached · Locked"
                          : `${tradesLeft} left today`}
                      </span>
                    </div>
                  </div>

                  <TradeSlotsBlobStrip
                    total={tradeCap}
                    completed={tradesUsed}
                    interactive={true}
                    onSelectCount={(count) => {
                      pauseAutoBriefly();
                      setTradesUsed(count);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-medium text-slate-500">
                    Max trades per day
                  </span>
                  <div className="flex items-center gap-1 w-[112px]">
                    <button
                      type="button"
                      onClick={() => {
                        pauseAutoBriefly();
                        const next = Math.max(1, tradeCap - 1);
                        setTradeCap(next);
                        if (tradesUsed > next) setTradesUsed(next);
                      }}
                      className="tactile-white-pill w-6 h-6 rounded-[7px] flex items-center justify-center text-[12px] font-bold text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center px-1.5 py-0.5 rounded-[7px] bg-[#F8FAFC] border border-[#E4E4E4] text-[11.5px] font-bold text-slate-900 tabular-nums">
                      {tradeCap}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        pauseAutoBriefly();
                        setTradeCap((v) => Math.min(10, v + 1));
                      }}
                      className="tactile-white-pill w-6 h-6 rounded-[7px] flex items-center justify-center text-[12px] font-bold text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: Smart Journal — Auto-Synced Trades */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-4 flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[#E4E4E4]/70">
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                    <Layers size={13.5} strokeWidth={1.8} className="text-slate-700" />
                    <span>No <span className="text-slate-800 font-medium">manual logging</span></span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700">
                    Smart Journal
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-slate-900 mb-0.5">
                  Auto-Synced Trade Journal
                </h3>
                <p className="text-[12.5px] text-slate-500 leading-snug">
                  Every trade from your MT5 account saves automatically with pair, setup tag, and profit.
                </p>
              </div>

              {/* Actual Real Web App Card: MT5 Synced Trades Table */}
              <div className="rounded-[14px] bg-white border border-[#E4E4E4] shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[#E4E4E4]/80 flex items-center justify-between gap-2 bg-[#FAFAFC]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-[6px] bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <BookOpen size={11.5} strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-900">
                      Recent Trades
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      pauseAutoBriefly();
                      const nextIdx = (journalLiveIdx + 1) % JOURNAL_BATCHES.length;
                      setJournalLiveIdx(nextIdx);
                      setSelectedRowIdx(0);
                    }}
                    className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9.5px] font-bold uppercase cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    title="Auto-syncing from MT5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    MT5 · Auto-Sync
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={journalLiveIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="divide-y divide-[#E4E4E4]/70 text-[11px]"
                  >
                    {activeTrades.map((row, idx) => {
                      const isSelected = selectedRowIdx === idx;
                      return (
                        <button
                          key={row.pair}
                          type="button"
                          onClick={() => {
                            pauseAutoBriefly();
                            setSelectedRowIdx(idx);
                          }}
                          className={`w-full px-3 py-1.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                            isSelected ? "bg-blue-50/70" : "hover:bg-slate-50/80"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                row.win
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {row.rr}
                            </span>
                            <div className="min-w-0 truncate">
                              <span className="font-semibold text-slate-900">{row.pair}</span>{" "}
                              <span className="text-[10px] text-slate-400">· {row.lot} · {row.setup}</span>
                            </div>
                          </div>
                          <span
                            className={`font-mono font-bold tabular-nums shrink-0 ${
                              row.win ? "text-emerald-600" : "text-rose-500"
                            }`}
                          >
                            {row.pnl}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                <div className="px-3 py-1 bg-[#FAFAFC] border-t border-[#E4E4E4]/70 flex items-center justify-between text-[10px] text-slate-500 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${journalLiveIdx}-${selectedRowIdx}`}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2 }}
                      className="truncate block"
                    >
                      <strong className="text-slate-700">{selectedTradeObj.pair}:</strong> {selectedTradeObj.note}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: TradiFive AI — Pre-Market Plan & Session Debrief */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-4 flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[#E4E4E4]/70">
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                    <Sparkles size={13.5} strokeWidth={1.8} className="text-slate-700" />
                    <span>Clear <span className="text-slate-800 font-medium">daily feedback</span></span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700">
                    TradiFive AI
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-slate-900 mb-0.5">
                  Pre-Market Plan &amp; AI Coach
                </h3>
                <p className="text-[12.5px] text-slate-500 leading-snug">
                  Write your plan before opening a trade and get simple AI feedback after every session.
                </p>
              </div>

              {/* Actual Real Web App Cards: Pre-market Plan + AI Session Debrief */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    pauseAutoBriefly();
                    setBiasIdx((v) => (v + 1) % BIASES.length);
                  }}
                  className="w-full px-3 py-2 rounded-[12px] bg-white hover:bg-slate-50/80 border border-[#E4E4E4] shadow-[0_2px_6px_rgba(15,23,42,0.03)] flex items-center justify-between text-[11.5px] cursor-pointer transition-colors"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeBias.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 font-semibold text-slate-800"
                    >
                      <span className={`w-2 h-2 rounded-full ${activeBias.dotClass}`} />
                      <span>
                        Pre-market plan ·{" "}
                        <span className="text-slate-500 font-medium">{activeBias.label}</span>
                      </span>
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] font-semibold text-[#2563EB] inline-flex items-center gap-1">
                    Switch <ArrowRight size={11.5} />
                  </span>
                </button>

                <div className="p-3 rounded-[14px] bg-white border border-[#E4E4E4] shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#2563EB]">
                      <Sparkles size={11.5} />
                      TradiFive AI · Session Debrief
                    </span>
                    <div className="inline-flex items-center gap-1">
                      {BIASES.map((b, i) => (
                        <button
                          key={b.session}
                          type="button"
                          onClick={() => {
                            pauseAutoBriefly();
                            setBiasIdx(i);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold cursor-pointer transition-colors ${
                            biasIdx === i
                              ? "bg-blue-50 text-[#2563EB]"
                              : "text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          {b.session === "NY Session" ? "NY" : b.session === "London Session" ? "LDN" : "Risk"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeBias.session}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.22 }}
                      className="text-[11.5px] leading-snug text-slate-700"
                    >
                      &ldquo;Your discipline held at <strong className="text-slate-900">{activeBias.score}</strong>.{" "}
                      {activeBias.quote} <strong className="text-emerald-600">{activeBias.highlight}</strong> {activeBias.tail}&rdquo;
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* CARD 4: Live Dashboard — Net Cumulative P&L & Win Rate */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT }}
              className="rounded-xl bg-white border border-[#E4E4E4] p-4 flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[#E4E4E4]/70">
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                    <CheckCircle2 size={13.5} strokeWidth={1.8} className="text-slate-700" />
                    <span>All stats <span className="text-slate-800 font-medium">in one place</span></span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700">
                    Dashboard
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-slate-900 mb-0.5">
                  Net P&amp;L &amp; Win Rate Tracker
                </h3>
                <p className="text-[12.5px] text-slate-500 leading-snug">
                  Track your total profit, win rate, average reward-to-risk, and profit factor at a glance.
                </p>
              </div>

              {/* Actual Real Web App Card: Dashboard Net Cumulative P&L + Win Ring + 3-Metric Row */}
              <div className="space-y-2">
                <div className="p-3 rounded-[14px] bg-white border border-[#E4E4E4] shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-medium text-slate-500">
                        Net Cumulative P&amp;L
                      </span>
                      <div className="inline-flex items-center p-0.5 rounded-[7px] bg-slate-100">
                        {PNL_RANGES.map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => {
                              pauseAutoBriefly();
                              setPnlRange(tab);
                            }}
                            className={`px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold cursor-pointer transition-colors ${
                              pnlRange === tab
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-[20px] font-bold text-slate-950 tracking-[-0.03em] tabular-nums leading-tight mt-0.5">
                      <AnimatedNumber
                        value={currentStats.pnlNum}
                        duration={750}
                        format={(v) =>
                          `+$${v.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        }
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10.5px]">
                      <span className="px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E4E4E4] font-semibold text-slate-700 tabular-nums">
                        <AnimatedNumber value={currentStats.wins} duration={650} />W /{" "}
                        <AnimatedNumber value={currentStats.losses} duration={650} />L
                      </span>
                      <span className="text-slate-400 font-medium tabular-nums">
                        <AnimatedNumber value={currentStats.closed} duration={650} /> closed trades
                      </span>
                    </div>
                  </div>

                  <div className="relative w-[60px] h-[60px] shrink-0">
                    <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`} className="-rotate-90">
                      <circle
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth={strokeWidth}
                      />
                      <circle
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="transition-[stroke-dashoffset] duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[12px] font-bold text-slate-900 leading-none tabular-nums">
                        <AnimatedNumber
                          value={currentStats.winPct}
                          duration={650}
                          format={(v) => `${Math.round(v)}%`}
                        />
                      </span>
                      <span className="text-[7.5px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                        Win
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="px-2 py-1.5 rounded-[11px] bg-white border border-[#E4E4E4] text-center">
                    <div className="text-[9.5px] font-medium text-slate-400">Avg RR</div>
                    <div className="text-[12px] font-bold text-slate-900 tabular-nums truncate">
                      <AnimatedNumber
                        value={currentStats.avgRR}
                        duration={650}
                        format={(v) => `${v.toFixed(2)}R`}
                      />
                    </div>
                  </div>
                  <div className="px-2 py-1.5 rounded-[11px] bg-white border border-[#E4E4E4] text-center">
                    <div className="text-[9.5px] font-medium text-slate-400">Profit Factor</div>
                    <div className="text-[12px] font-bold text-slate-900 tabular-nums truncate">
                      <AnimatedNumber
                        value={currentStats.pf}
                        duration={650}
                        format={(v) => v.toFixed(2)}
                      />
                    </div>
                  </div>
                  <div className="px-2 py-1.5 rounded-[11px] bg-white border border-[#E4E4E4] text-center">
                    <div className="text-[9.5px] font-medium text-slate-400">Avg W / L</div>
                    <div className="text-[12px] font-bold text-slate-900 tabular-nums truncate">
                      {currentStats.avgWL}
                    </div>
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

/* ════════════════
   HOW IT WORKS
════════════════ */
function HowItWorks() {
  const workflowRef = useRef<HTMLElement | null>(null);
  const inView = useInView(workflowRef, { once: true, amount: 0.18 });
  const [activeStep, setActiveStep] = useState(0);
  const [manualStep, setManualStep] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: workflowRef,
    offset: ["start 78%", "end 38%"],
  });
  const ribbonProgress = useTransform(scrollYProgress, [0.06, 0.84], [0.08, 1]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      if (manualStep !== null) return;
      if (v >= 0.7) setActiveStep(3);
      else if (v >= 0.46) setActiveStep(2);
      else if (v >= 0.24) setActiveStep(1);
      else setActiveStep(0);
    });
    return () => unsub();
  }, [scrollYProgress, manualStep]);

  const currentStep = manualStep ?? activeStep;

  const STEPS = [
    {
      num: "01",
      icon: Users,
      title: "Open your workspace",
      desc: "Set up your trader profile, currency base, and session clock in under a minute.",
      stagger: "lg:mt-6",
      nodeX: 138,
      nodeY: 66,
    },
    {
      num: "02",
      icon: Layers,
      title: "Link your MT5 bridge",
      desc: "Stream every execution at 4ms latency while keeping 100% of capital on your broker.",
      stagger: "lg:mt-0",
      nodeX: 412,
      nodeY: 26,
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Arm Risk Guard",
      desc: "Set daily drawdown ceilings and trade-count limits that lock tilt before losses compound.",
      stagger: "lg:mt-7",
      nodeX: 698,
      nodeY: 68,
    },
    {
      num: "04",
      icon: Globe,
      title: "Trade alongside pros",
      desc: "Publish broker-verified receipts, follow disciplined desks, and climb clean leaderboards.",
      stagger: "lg:mt-1",
      nodeX: 978,
      nodeY: 28,
    },
  ];

  const curlyWavePath =
    "M 138 66 C 215 66, 240 16, 275 24 C 302 30, 288 54, 268 46 C 248 38, 282 14, 345 20 C 378 23, 396 26, 412 26 C 485 26, 512 80, 555 72 C 585 66, 570 42, 550 50 C 530 58, 568 82, 634 74 C 668 70, 684 68, 698 68 C 772 68, 800 18, 842 26 C 870 32, 856 54, 836 46 C 818 38, 852 16, 915 24 C 948 28, 964 28, 978 28";

  const renderStepArtifact = (idx: number, isCurrent: boolean) => {
    if (idx === 0) {
      return (
        <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
              NH
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold text-slate-900 leading-tight truncate">
                Nikhil Harake
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                @nikhil_harake · USD
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                isCurrent ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[10px] text-slate-500 font-medium">
            <span>Auto-Journal</span>
            <span className="text-slate-900 font-semibold">Enabled ✓</span>
          </div>
        </div>
      );
    }

    if (idx === 1) {
      return (
        <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-800 shadow-2xs">
              Exness MT5
            </span>
            <svg viewBox="0 0 64 22" fill="none" className="flex-1 h-5 overflow-visible" aria-hidden="true">
              <path
                d="M 2 14 C 14 2, 24 22, 32 11 C 40 0, 50 20, 62 9"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <motion.path
                d="M 2 14 C 14 2, 24 22, 32 11 C 40 0, 50 20, 62 9"
                stroke="#2563EB"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="3 4"
                animate={{ strokeDashoffset: [0, -14] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
            </svg>
            <span className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold">
              TradiFive
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[10px] text-slate-500 font-mono">
            <span>Read · Execute</span>
            <span className="text-[#2563EB] font-semibold">4ms · Non-custodial</span>
          </div>
        </div>
      );
    }

    if (idx === 2) {
      return (
        <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
            <span>Drawdown Ceiling</span>
            <span className="font-mono text-emerald-600">0.8% / 3.0%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200/90 overflow-hidden">
            <motion.div
              animate={{ width: isCurrent ? "32%" : "27%" }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[10px] text-slate-500">
            <span>Trade Slots</span>
            <span className="inline-flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((slot) => (
                <span
                  key={slot}
                  className={`w-2 h-2 rounded-full ${
                    slot < 2 ? "bg-[#2563EB]" : "bg-slate-200 border border-slate-300"
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 space-y-2">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="font-semibold text-slate-900 truncate">Arjun M. · XAU/USD</span>
          <span className="font-mono font-bold text-emerald-600">+2.4R</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[10px] text-slate-500">
          <span>Verified MT5 Receipt</span>
          <span className="font-mono font-semibold text-slate-900">Rank #12</span>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={workflowRef}
      id="how-it-works"
      className="py-20 sm:py-28 px-4 sm:px-7 relative bg-white overflow-hidden"
    >
      <div className="max-w-[1160px] mx-auto">
        <SectionHeader
          badge="Workflow"
          icon={Globe}
          tone="blue"
          title="From setup to consistent execution"
          subtitle="in four natural steps."
          description="Scroll down to follow the workflow — each stage activates in sequence, with zero clutter."
          className="mb-10 sm:mb-12"
        />

        {/* Handwritten Curly Ribbon Trajectory Connecting Steps 01 → 04 */}
        <div className="hidden lg:block relative max-w-[1120px] mx-auto -mb-2">
          <svg viewBox="0 0 1120 92" fill="none" className="w-full h-[84px] overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="workflowCurlyInk" x1="120" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="62%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* Base Slate Hairline Wave */}
            <path
              d={curlyWavePath}
              stroke="#E2E8F0"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Soft Ambient Halo Underlay */}
            <motion.path
              d={curlyWavePath}
              stroke="rgba(37, 99, 235, 0.14)"
              strokeWidth="7"
              strokeLinecap="round"
              style={{
                pathLength: manualStep !== null ? (manualStep + 1) / 4 : ribbonProgress,
              }}
            />

            {/* Animated Crisp Inked Curly Line */}
            <motion.path
              d={curlyWavePath}
              stroke="url(#workflowCurlyInk)"
              strokeWidth="2.4"
              strokeLinecap="round"
              style={{
                pathLength: manualStep !== null ? (manualStep + 1) / 4 : ribbonProgress,
              }}
            />

            {/* Waypoint Anchors along the Curve */}
            {STEPS.map((s, i) => {
              const isReached = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <g
                  key={s.num}
                  onClick={() => setManualStep(manualStep === i ? null : i)}
                  className="cursor-pointer"
                >
                  {isCurrent && (
                    <circle
                      cx={s.nodeX}
                      cy={s.nodeY}
                      r="14"
                      fill="rgba(37, 99, 235, 0.14)"
                    />
                  )}
                  <circle
                    cx={s.nodeX}
                    cy={s.nodeY}
                    r={isCurrent ? "7.5" : "5.5"}
                    fill={isReached ? "#2563EB" : "#FFFFFF"}
                    stroke={isReached ? "#2563EB" : "#CBD5E1"}
                    strokeWidth="2"
                  />
                  <circle
                    cx={s.nodeX}
                    cy={s.nodeY}
                    r="2.2"
                    fill="#FFFFFF"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Staggered Human-Crafted Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-start">
          {STEPS.map((step, i) => {
            const isCurrent = i === currentStep;
            const isReached = i <= currentStep;

            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, delay: i * 0.2, ease: EASE_OUT }}
                onClick={() => setManualStep(manualStep === i ? null : i)}
                className={`${step.stagger} group relative rounded-2xl p-5 border flex flex-col justify-between gap-5 transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? "bg-white border-slate-900/15 ring-1 ring-[#2563EB]/35 shadow-[0_24px_48px_-18px_rgba(37,99,235,0.22),0_4px_12px_-4px_rgba(15,23,42,0.06)] -translate-y-1"
                    : isReached
                    ? "bg-white border-slate-200/90 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.07)] hover:border-slate-300"
                    : "bg-[#FAFAFC] border-slate-200/75 opacity-80 hover:opacity-100 hover:bg-white"
                }`}
              >
                {/* Clean Editorial Header (Numeral + Hairline Accent) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[12px] font-mono font-semibold tracking-wider transition-colors ${
                        isCurrent ? "text-[#2563EB]" : isReached ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {step.num}
                    </span>
                    <span
                      className={`h-[1.5px] transition-all duration-300 rounded-full ${
                        isCurrent ? "w-8 bg-[#2563EB]" : isReached ? "w-5 bg-slate-300" : "w-4 bg-slate-200"
                      }`}
                    />
                  </div>

                  <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950 mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>

                {/* Bespoke Product UI Snapshot Inside Each Card */}
                {renderStepArtifact(i, isCurrent)}
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
    <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-7 relative bg-white">
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader
          badge="Pricing"
          icon={Crown}
          tone="blue"
          title="Simple, predictable plans"
          subtitle="built to scale with your edge."
          description="Start free with core trade journaling and discipline tracking. Upgrade anytime as your capital scales."
          className="mb-12"
        />

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
   COMMUNITY & SOCIAL PROOF
════════════════ */
const TESTIS = [
  {
    name: "Priya Mehra",
    role: "Day Trader, Pune",
    init: "PM",
    broker: "Exness MT5 · XAU/USD",
    proof: "42% → 67% Win Rate",
    metricLabel: "8-Week Verified",
    text: "Seeing real verified P&Ls from other traders keeps me accountable. My win rate jumped from 42% to 67% in two months.",
  },
  {
    name: "Rahul Sharma",
    role: "IIT Delhi Graduate",
    init: "RS",
    broker: "Zerodha · NIFTY 50",
    proof: "19d Clean Streak",
    metricLabel: "0 Tilt Breaches",
    text: "Risk Guard stopped me from revenge trading after a bad morning session. Saved my account more than once.",
  },
  {
    name: "Kavita Trivedi",
    role: "Swing Trader, Mumbai",
    init: "KT",
    broker: "FundedNext · EUR/USD",
    proof: "Rank #1 Nov Cup",
    metricLabel: "Funded Qualified",
    text: "Won the November trading competition and qualified for a funded account. The leaderboard keeps your focus sharp daily.",
  },
  {
    name: "Arjun Das",
    role: "Software Engineer, Bengaluru",
    init: "AD",
    broker: "IC Markets · NAS100",
    proof: "2.4x Profit Factor",
    metricLabel: "Auto-Synced",
    text: "Auto-Sync Journal eliminated manual logging. The AI coach spotted that I was overleveraging on Mondays.",
  },
  {
    name: "Sneha Kapoor",
    role: "Forex Trader, Hyderabad",
    init: "SK",
    broker: "Pepperstone · GBP/USD",
    proof: "96 / 100 Discipline",
    metricLabel: "MT5 Verified",
    text: "Following verified setups from disciplined traders taught me more than any course. Zero noise.",
  },
  {
    name: "Vikram Singh",
    role: "Business Owner, Delhi",
    init: "VS",
    broker: "Vantage · XAU/USD",
    proof: "+$4,120 / Mo",
    metricLabel: "Live Feed Link",
    text: "Everyone here connects live MT5 accounts so results are verifiable. No fake gurus, no edited screenshots.",
  },
];

function Social() {
  const proofRef = useRef<HTMLElement | null>(null);
  const inView = useInView(proofRef, { once: true, amount: 0.2 });
  const [countPct, setCountPct] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, 1, {
      duration: 1.35,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCountPct(v),
    });
    return () => ctrl.stop();
  }, [inView]);

  const activeTraders = Math.round(12400 * countPct).toLocaleString();
  const prizePool = (2.8 * countPct).toFixed(1);
  const ruleAdherence = Math.round(94 * countPct);
  const brokerCount = Math.round(40 * countPct);

  return (
    <section ref={proofRef} id="wall-of-fame" className="py-20 sm:py-28 relative overflow-hidden bg-white">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
        <SectionHeader
          badge="Community & Proof"
          icon={Users}
          tone="blue"
          title="Traders who chose"
          subtitle="to grow together."
          inlineSubtitle
          description="Share broker-verified executions, compete on rule-weighted leaderboards, and connect with disciplined traders worldwide."
          className="mb-12 sm:mb-14"
        />

        {/* Editorial Proof Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-12">
          {/* Left Featured Card: Live Rule-Weighted Leaderboard + Scroll Telemetry */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="lg:col-span-5 relative overflow-hidden rounded-[24px] bg-[#0B0F19] text-white p-6 flex flex-col justify-between gap-6 border border-slate-800/80 shadow-[0_24px_54px_-18px_rgba(11,15,25,0.45)]"
          >
            {/* Subtle Radial Accent & Decorative Curly Wave */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 w-60 h-60 rounded-full bg-blue-600/20 blur-3xl"
            />
            <svg
              viewBox="0 0 120 36"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-5 w-20 h-6 opacity-35"
            >
              <path
                d="M 4 28 C 24 4, 48 32, 68 12 C 82 -2, 98 22, 116 8"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">
                  Verified Execution Network
                </div>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="text-[36px] sm:text-[42px] font-bold tracking-tight tabular-nums leading-none">
                    {activeTraders}+
                  </span>
                  <span className="text-[12.5px] font-medium text-slate-400">
                    active traders
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-bold font-mono text-emerald-400 tabular-nums leading-none">
                  {ruleAdherence}%
                </div>
                <div className="text-[10.5px] text-slate-400 mt-1">Rule adherence</div>
              </div>
            </div>

            {/* Live Rule-Weighted Standings */}
            <div className="relative z-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400">
                <span>LIVE RULE LEADERBOARD</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
              {[
                { rank: "01", name: "Nikhil H.", pair: "XAU/USD · 14d Clean", score: "94 Score", pnl: "+$12,530" },
                { rank: "02", name: "Arjun Mehta", pair: "XAU/USD · NY Sweep", score: "91% Win", pnl: "+$9,480" },
                { rank: "03", name: "Kavita T.", pair: "EUR/USD · Prop Desk", score: "89 Score", pnl: "+$7,820" },
              ].map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-[11.5px] border border-white/[0.05]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[10.5px] text-slate-500 font-semibold">{row.rank}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{row.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{row.pair}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-emerald-400">{row.pnl}</div>
                    <div className="text-[9.5px] text-slate-400">{row.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right 2x2 Community Pillar Bento Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1: Pulse Feed */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.05, ease: EASE_OUT }}
              className="rounded-[22px] bg-[#FAFAFC] hover:bg-white border border-slate-200/85 p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-[0_18px_40px_-16px_rgba(15,23,42,0.09)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[15px] font-bold text-slate-950">Pulse feed</span>
                  <span className="font-mono text-[11.5px] font-bold text-[#2563EB] tabular-nums">
                    ₹{prizePool}M prizes
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Share broker-verified setups, profit milestones, and session reviews in real time.
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 px-3 py-2 flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-slate-800 truncate">✓ XAU/USD Long · MT5 Receipt</span>
                <span className="font-mono font-bold text-emerald-600 shrink-0">+2.4R</span>
              </div>
            </motion.div>

            {/* 2: Signal Channels */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.12, ease: EASE_OUT }}
              className="rounded-[22px] bg-[#FAFAFC] hover:bg-white border border-slate-200/85 p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-[0_18px_40px_-16px_rgba(15,23,42,0.09)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[15px] font-bold text-slate-950">Signal channels</span>
                  <span className="font-mono text-[11.5px] font-bold text-slate-900 tabular-nums">
                    {brokerCount}+ brokers
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Subscribe to audited broadcast desks with structured entries, stops, and rule checks.
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 px-3 py-2 flex items-center justify-between gap-2 text-[10.5px]">
                <span className="text-slate-500 truncate">IC Markets · Exness · Pepperstone</span>
                <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
              </div>
            </motion.div>

            {/* 3: Direct Messages */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.18, ease: EASE_OUT }}
              className="rounded-[22px] bg-[#FAFAFC] hover:bg-white border border-slate-200/85 p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-[0_18px_40px_-16px_rgba(15,23,42,0.09)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[15px] font-bold text-slate-950">Direct messages</span>
                  <span className="text-[11px] font-mono text-slate-400">1-on-1 desks</span>
                </div>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Review executions privately with mentors and accountability partners inside your workspace.
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 px-3 py-2 flex items-center justify-between text-[10.5px]">
                <span className="text-slate-600 truncate">&ldquo;Halved risk before CPI.&rdquo;</span>
                <span className="text-[#2563EB] font-semibold shrink-0">Logged ✓</span>
              </div>
            </motion.div>

            {/* 4: Webinar Rooms */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.24, ease: EASE_OUT }}
              className="rounded-[22px] bg-[#FAFAFC] hover:bg-white border border-slate-200/85 p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-[0_18px_40px_-16px_rgba(15,23,42,0.09)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[15px] font-bold text-slate-950">Webinar rooms</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold">Live weekly</span>
                </div>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Join live tape breakdowns and prop-firm reviews hosted by vetted disciplined traders.
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 px-3 py-2 flex items-center justify-between text-[10.5px]">
                <div className="flex -space-x-1.5">
                  {["NH", "PM", "KT"].map((a) => (
                    <span
                      key={a}
                      className="w-5 h-5 rounded-full bg-slate-900 text-white text-[8px] font-bold border border-white inline-flex items-center justify-center"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <span className="text-slate-600 font-medium">NY Open Breakdown</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upgraded Verified Proof Cards Marquee (Pause on Hover) */}
      <div
        className="relative w-full overflow-hidden flex"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="testimonials-track flex gap-4 sm:gap-5 py-3 hover:[animation-play-state:paused]">
          {[...TESTIS, ...TESTIS].map((t, i) => (
            <div
              key={i}
              className="w-[336px] sm:w-[360px] shrink-0 rounded-2xl bg-white border border-slate-200/90 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.09)] p-5 flex flex-col justify-between gap-4 hover:border-blue-300/80 transition-colors"
            >
              {/* Top Verified Broker & Proof Metric Strip */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <span className="text-[10.5px] font-mono text-slate-400 truncate">
                  {t.broker}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-mono font-bold text-emerald-700 shrink-0">
                  {t.proof}
                </span>
              </div>

              {/* Quote Body */}
              <p className="text-[13.5px] text-slate-700 leading-relaxed font-normal">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author + Verified Tag Footer */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {t.init}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-950 truncate">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{t.role}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#2563EB] shrink-0">
                  {t.metricLabel} ✓
                </span>
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
      className={`rounded-2xl border p-5 sm:p-6 cursor-pointer transition-colors duration-150 ${isOpen
          ? "bg-[#E4E4E4]/30 border-blue-300 shadow-xs"
          : "bg-white border-[#E4E4E4] hover:border-slate-300 shadow-2xs"
        }`}
    >
      <div className="flex justify-between items-center gap-4">
        <h4 className="text-[15px] font-semibold text-slate-900">{f.q}</h4>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-slate-900" : ""
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
            <div className="pt-4 mt-4 border-t border-[#E4E4E4] text-[14px] text-slate-600 leading-relaxed">
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
    <section className="py-20 sm:py-24 px-4 sm:px-7 relative bg-white">
      <div className="max-w-[780px] mx-auto">
        <SectionHeader
          badge="FAQ"
          icon={Info}
          tone="blue"
          title="Answers for"
          subtitle="serious traders."
          inlineSubtitle
          description="Security, broker integrations, and platform mechanics."
          className="mb-12"
        />

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
   CLOSING CTA
════════════════ */
function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-24 sm:py-28 px-4 sm:px-7 relative bg-white">
      <div className="max-w-[700px] mx-auto text-center">
        <SectionHeader
          badge="Start your workspace"
          icon={Sparkles}
          tone="blue"
          title="Become the trader"
          subtitle="you set out to be."
          description="Join TradiFive for automated trade journaling, autonomous Risk Guard, AI coaching, and verified community feedback."
          className="mb-9"
        />

        <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
          <button
            type="button"
            onClick={onStart}
            className="tactile-blue-pill h-11 px-7 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Free Today</span>
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("problem");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-11 px-6 rounded-full text-[14px] font-semibold inline-flex items-center bg-white border border-[#E4E4E4] text-slate-800 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            Explore Capabilities
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
      <div className="h-px w-full bg-[#E4E4E4]" />
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
    document.documentElement.classList.remove("dark", "custom-cursor-active", "cursor-style-system");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  void supabase;

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#0F172A",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <PublicNavbar
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onDownloadClick={() => navigate("/download")}
        lightOnScroll={false}
      />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero onStart={handleStart} onSignIn={handleSignIn} />
        <PlatformPillars />
        <WhyTradiFive />
        <Sep />
        <ProblemSection />
        <Sep />
        <SolutionSection onStart={handleStart} />
        <Sep />
        <OneSessionShowcase onStart={handleStart} />
        <Sep />
        <HowItWorks />
        <Sep />
        <Social />
        <Sep />
        <Pricing onStart={handleStart} />
        <Sep />
        <FAQ />
        <Sep />
        <CTA onStart={handleStart} />
      </main>

      <PublicFooter lightMode />
    </div>
  );
}
