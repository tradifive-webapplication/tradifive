import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import {
  motion,
  AnimatePresence,
  useInView,
  animate,
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

  const active = SESSION_MODULES.find((m) => m.id === activeId) || SESSION_MODULES[0];
  const leftModules = SESSION_MODULES.slice(0, 3);
  const rightModules = SESSION_MODULES.slice(3, 6);
  const totalTicks = 24;
  const activeTicks = Math.round((active.scoreValue / 100) * totalTicks);
  const isDarkFocus = false;

  const dashDonutRadius = 17;
  const dashDonutCirc = 2 * Math.PI * dashDonutRadius;
  const dashDonutOffset = dashDonutCirc - 0.82 * dashDonutCirc;

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
          stroke={isSelected ? "rgba(37, 99, 235, 0.22)" : "#CBD5E1"}
          strokeWidth={isSelected ? "3.2" : "1.45"}
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

      {/* Atmospheric Soaring Eagle Above Alpine Clouds Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[20px] bottom-[40px] overflow-hidden select-none"
      >
        <motion.img
          src="/workspace-sky-bg.jpg"
          alt=""
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.05, ease: EASE_OUT }}
          className="w-full h-full object-cover object-[50%_28%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.18) 14%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.22) 84%, #ffffff 100%)",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1290px] mx-auto px-4 sm:px-8">
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
              className="justify-center font-normal tracking-[-0.03em] text-slate-400 mt-0.5"
            />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
            className="mt-3 text-[14px] sm:text-[15.5px] font-normal text-slate-600 leading-relaxed"
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
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Exness MT5 · Live
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="font-mono text-slate-400">
                                Equity <strong className={isDarkFocus ? "text-white" : "text-slate-800"}>$37,790</strong>
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

                        {/* ── VIEW 1: EXACT PIC 2 DASHBOARD ── */}
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
                                  <div className="text-[9px] font-medium text-slate-400">Net P&amp;L · All time</div>
                                  <div className="text-[24px] sm:text-[26px] font-bold tracking-tight text-[#2563EB] leading-none mt-0.5 font-mono tabular-nums">
                                    +$12,530
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
                                      <circle cx="22" cy="22" r={dashDonutRadius} fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeDasharray={dashDonutCirc} strokeDashoffset={dashDonutOffset} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                                      <span className="text-[9.5px] font-bold font-mono">82%</span>
                                      <span className="text-[6.5px] font-semibold text-slate-400">WIN</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right: 3 Stat Cards + Pre-market Plan Strip */}
                              <div className="lg:col-span-7 flex flex-col gap-1.5">
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[
                                    { label: "Avg RR", val: "2.23R" },
                                    { label: "Profit Factor", val: "16.10" },
                                    { label: "Avg W / L", val: "$954.29 / $276.67" },
                                  ].map((m) => (
                                    <div
                                      key={m.label}
                                      className={`rounded-[12px] border px-2 py-2 text-center ${
                                        isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"
                                      }`}
                                    >
                                      <div className="text-[8.5px] text-slate-400 font-medium">{m.label}</div>
                                      <div className="text-[11px] sm:text-[12px] font-bold font-mono mt-0.5 truncate">{m.val}</div>
                                    </div>
                                  ))}
                                </div>
                                <div
                                  className={`rounded-[12px] border px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-[#2563EB] ${
                                    isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"
                                  }`}
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                                  <span className="font-bold text-[#2563EB] font-mono">+$12,530</span>
                                </div>
                                <svg viewBox="0 0 180 64" className="w-full h-14 my-1 overflow-visible">
                                  <defs>
                                    <linearGradient id="showcasePnlG" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  <path d="M4,56 L30,48 L52,50 L74,40 L96,30 L118,34 L142,20 L166,12 L176,8 L176,56 Z" fill="url(#showcasePnlG)" />
                                  <path d="M4,56 L30,48 L52,50 L74,40 L96,30 L118,34 L142,20 L166,12 L176,8" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" />
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
                                  <path d="M4,46 L34,40 L64,41 L94,32 L124,25 L154,18 L176,10" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                <div className="flex justify-between text-[8px] pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                                  <span className="text-slate-400">Start $25k</span>
                                  <span className="font-bold text-[#2563EB] font-mono">$37,530 (+50.1%)</span>
                                </div>
                              </div>

                              {/* TRADIFIVE SCORE */}
                              <div className={`rounded-[13px] border p-2.5 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider">TradiFive Score</div>
                                    <div className="text-[7.5px] text-slate-400">17 trades scored</div>
                                  </div>
                                  <span className="text-[16px] font-bold font-mono leading-none">81</span>
                                </div>
                                <div className="flex items-center justify-center my-0.5">
                                  <svg viewBox="0 0 120 68" className="w-24 h-12">
                                    <polygon points="60,8 92,26 80,58 40,58 28,26" fill="none" stroke={isDarkFocus ? "rgba(255,255,255,0.14)" : "#E2E8F0"} strokeWidth="1" />
                                    <polygon points="60,18 86,30 76,54 44,54 39,30" fill={isDarkFocus ? "rgba(37,99,235,0.22)" : "rgba(15,23,42,0.12)"} stroke={isDarkFocus ? "#3B82F6" : "#0F172A"} strokeWidth="1.4" />
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
                                  <span>P&amp;L calendar <span className="text-emerald-600 font-mono">+$12,530</span></span>
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
                                    <div className="text-[13px] font-bold font-mono leading-none">0.8%</div>
                                    <div className="text-[7.5px] text-slate-400 mt-0.5">/ 3.0% limit</div>
                                  </div>
                                  <div className="h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                    <div className="h-full w-[27%] bg-emerald-500 rounded-full" />
                                  </div>
                                </div>

                                <div className={`rounded-[12px] border p-2 flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="flex items-center justify-between text-[8.5px] font-bold">
                                    <span>Discipline</span>
                                    <span className="px-1 rounded bg-amber-500/15 text-amber-600 text-[7px]">Lv 7</span>
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold font-mono leading-none">94</div>
                                    <div className="text-[7.5px] text-slate-400 mt-0.5">/ 100 score</div>
                                  </div>
                                  <div className="text-[7.5px] text-emerald-600 font-semibold">14d streak</div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* ── VIEW 2: EXACT WEB APP JOURNAL PAGE (5 Metrics + Bento Charts + Symbol Attribution + Ledger) ── */}
                        {active.id === "journal" && (
                          <div className="space-y-2">
                            {/* Top 5 Draggable Metric Cards Row (matches JournalMetrics.tsx) */}
                            <div className="grid grid-cols-5 gap-1.5">
                              {[
                                { label: "Net P&L", value: "+$12,530", sub: "+50.1% ROI", tone: "text-emerald-600" },
                                { label: "Win Rate", value: "82.4%", sub: "14W · 3L · 0E", tone: "text-[#2563EB]" },
                                { label: "Profit Factor", value: "16.10", sub: "17 closed trades", tone: "" },
                                { label: "Avg Win / Loss", value: "$954 / $277", sub: "3.45 ratio", tone: "" },
                                { label: "Day Streak", value: "+6 Days", sub: "Best +$1,640", tone: "text-emerald-600" },
                              ].map((stat) => (
                                <div key={stat.label} className={`rounded-[11px] p-2 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="text-[7.5px] font-medium text-slate-400 truncate">{stat.label}</div>
                                  <div className={`text-[11px] font-bold font-mono mt-0.5 truncate ${stat.tone}`}>{stat.value}</div>
                                  <div className="text-[7px] text-slate-400 mt-0.5 truncate">{stat.sub}</div>
                                </div>
                              ))}
                            </div>

                            {/* Middle Bento Row: Net Daily P&L Bars + Symbol Performance + Long/Short */}
                            <div className="grid grid-cols-12 gap-2">
                              {/* Net Daily P&L Bar Chart */}
                              <div className={`col-span-5 rounded-[12px] p-2.5 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[9px] font-bold mb-1.5">
                                  <span>Net Daily P&amp;L</span>
                                  <span className="text-emerald-600 font-mono">14 green days</span>
                                </div>
                                <div className="grid grid-cols-10 items-end gap-1 h-16 pt-2">
                                  {[
                                    { h: 42, win: true }, { h: 74, win: true }, { h: 24, win: false },
                                    { h: 60, win: true }, { h: 86, win: true }, { h: 50, win: true },
                                    { h: 96, win: true }, { h: 20, win: false }, { h: 66, win: true }, { h: 88, win: true },
                                  ].map((b, i) => (
                                    <div key={i} className="h-full flex items-end">
                                      <div
                                        className={`w-full rounded-t ${b.win ? "bg-emerald-500/85" : "bg-rose-500/80"}`}
                                        style={{ height: `${b.h}%` }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Performance by Symbol + Long vs Short Split (matches Journal.tsx lines 656-779) */}
                              <div className={`col-span-7 rounded-[12px] p-2.5 border flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[9px] font-bold mb-1.5">Performance by symbol &amp; direction</div>
                                <div className="space-y-1.5">
                                  {[
                                    { sym: "XAUUSD", info: "8t · 88%", pnl: "+$7,420", w: "88%" },
                                    { sym: "NAS100", info: "5t · 80%", pnl: "+$3,610", w: "62%" },
                                    { sym: "EURUSD", info: "4t · 75%", pnl: "+$1,500", w: "38%" },
                                  ].map((r) => (
                                    <div key={r.sym}>
                                      <div className="flex justify-between text-[8px] mb-0.5">
                                        <span><strong>{r.sym}</strong> <span className="text-slate-400">{r.info}</span></span>
                                        <span className="font-mono font-bold text-emerald-600">{r.pnl}</span>
                                      </div>
                                      <div className="h-1 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-500" style={{ width: r.w }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-white/[0.06] text-[8px]">
                                  <div className={`rounded px-2 py-1 ${isDarkFocus ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                                    <span className="text-slate-400 font-semibold">LONGS (12): </span>
                                    <strong className="text-emerald-600 font-mono">+$9,120</strong>
                                  </div>
                                  <div className={`rounded px-2 py-1 ${isDarkFocus ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                                    <span className="text-slate-400 font-semibold">SHORTS (5): </span>
                                    <strong className="text-emerald-600 font-mono">+$3,410</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Ledger Strip */}
                            <div className={`rounded-[12px] border overflow-hidden ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                              <div className={`divide-y ${isDarkFocus ? "divide-white/[0.06]" : "divide-[#E4E4E4]/70"}`}>
                                {[
                                  { pair: "XAU/USD", dir: "BUY", lot: "1.50L", tag: "NY Break & Retest", r: "+2.4R", pnl: "+$1,640", good: true },
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

                        {/* ── VIEW 3: EXACT HOME & COMMUNITY PAGE INTERFACE (Matches Home.tsx 3-Column Bento) ── */}
                        {active.id === "community" && (
                          <div className="grid grid-cols-12 gap-2 items-start">
                            {/* Left: My Watchlist + Forex Factory News (exact Home.tsx left column) */}
                            <div className="col-span-3 space-y-2 hidden sm:block">
                              <div className={`rounded-[13px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="flex items-center justify-between text-[9px] font-bold">
                                  <span>My Watchlist</span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[7.5px]">+ Add</span>
                                </div>
                                {[
                                  { sym: "XAU/USD", sub: "Gold Spot", p: "2,648.40", chg: "+1.24%", up: true },
                                  { sym: "NAS100", sub: "Index", p: "20,942.5", chg: "+0.82%", up: true },
                                  { sym: "EUR/USD", sub: "Forex Spot", p: "1.0542", chg: "-0.18%", up: false },
                                ].map((w) => (
                                  <div key={w.sym} className="flex items-center justify-between text-[8px]">
                                    <div>
                                      <span className="font-bold block leading-tight">{w.sym}</span>
                                      <span className="text-[7px] text-slate-400">{w.sub}</span>
                                    </div>
                                    <div className="text-right font-mono">
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

                            {/* Center: Search Pill + Verified Trader Feed Posts (exact Home.tsx FeedCard style) */}
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
                                  likes: "128",
                                  comments: "24",
                                },
                                {
                                  author: "Sara Kapoor",
                                  handle: "@sara_trades · 1h",
                                  badge: "NAS100 · +$1,210",
                                  text: "Followed pre-market bullish bias and stepped away at 11:30 AM EST. 14 clean days with zero tilt.",
                                  setupPill: "London OB · Rule Score 96/100",
                                  likes: "94",
                                  comments: "16",
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
                                    <span className="inline-flex items-center gap-2.5">
                                      <span>♥ {post.likes}</span>
                                      <span>💬 {post.comments}</span>
                                    </span>
                                    <span>Repost · Share</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Right: Followers + Winning Streaks + Top Disciplined (exact Home.tsx right column) */}
                            <div className="col-span-3 space-y-2 hidden sm:block">
                              <div className={`rounded-[13px] p-2.5 border ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[8.5px] text-slate-400">Verified Network</div>
                                <div className="text-[13px] font-bold font-mono mt-0.5">1,482 Followers</div>
                                <div className="text-[7.5px] text-emerald-600 font-semibold mt-0.5">+38 new this week</div>
                              </div>

                              <div className={`rounded-[13px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div className="text-[9px] font-bold">Top Disciplined</div>
                                {[
                                  { n: "Nikhil H.", sub: "42 trades", s: "94 Score" },
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

                        {/* ── VIEW 4: EXACT RISK GUARD WEB USER APP PAGE (Goals Strip + 3 Category Tabs + Protection Cards + Radial Gauge) ── */}
                        {active.id === "risk-guard" && (
                          <div className="space-y-2">
                            {/* Profit Goal Progress & Star Milestones (exact RiskGuard.tsx lines 2360-2485) */}
                            <div className={`rounded-[12px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                              <div className="flex items-center justify-between text-[8.5px]">
                                <span className="font-bold">Profit Goal Milestones · <span className="text-emerald-600 font-mono">+$1,840 / $2,500</span></span>
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-[#2563EB] font-bold text-[7.5px]">★ +250 XP Claimable</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
                                <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-[#2563EB] to-emerald-500" />
                              </div>
                              <div className="flex items-center justify-between text-[7.5px] font-semibold text-slate-400">
                                <span>★ $0</span>
                                <span className="text-[#2563EB]">★ +$625</span>
                                <span className="text-[#2563EB]">★ +$1,250</span>
                                <span className="text-emerald-600">★ +$1,875</span>
                                <span>+$2,500 Goal</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 pt-1 text-[8px] font-semibold text-center">
                                <div className={`py-1 rounded-md ${isDarkFocus ? "bg-[#26262B] text-white" : "bg-slate-100 text-slate-900"}`}>Trading Control · 4</div>
                                <div className="py-1 text-slate-400">Risk Management · 3</div>
                                <div className="py-1 text-slate-400">Behaviour &amp; Discipline · 3</div>
                              </div>
                            </div>

                            {/* Protection Rules Grid + Account Protection Shield */}
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-8 space-y-2">
                                <div className={`rounded-[12px] p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <ShieldCheck size={12} className="text-[#2563EB]" />
                                      <span className="text-[10.5px] font-bold">Daily Trade Limit</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-[#2563EB] text-[8.5px] font-bold">2 / 5 · Armed</span>
                                  </div>
                                  <TradeSlotsBlobStrip total={5} completed={2} interactive={false} />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  {/* Drawdown Depth Radial Gauge Card */}
                                  <div className={`rounded-[12px] p-2.5 border flex items-center justify-between gap-2 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                    <div>
                                      <div className="text-[9.5px] font-bold">Drawdown Guard</div>
                                      <div className="text-[12px] font-bold font-mono text-emerald-600 mt-0.5">0.8% <span className="text-[8px] text-slate-400">/ 3.0%</span></div>
                                      <div className="text-[7.5px] text-slate-400 mt-0.5">Daily · Weekly · Monthly</div>
                                    </div>
                                    <svg viewBox="0 0 44 44" className="w-9 h-9 shrink-0 -rotate-90">
                                      <circle cx="22" cy="22" r="16" fill="none" stroke={isDarkFocus ? "rgba(255,255,255,0.12)" : "#E2E8F0"} strokeWidth="4" />
                                      <circle cx="22" cy="22" r="16" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="100" strokeDashoffset="74" strokeLinecap="round" />
                                    </svg>
                                  </div>

                                  {/* Daily Profit Target Milestone Card */}
                                  <div className={`rounded-[12px] p-2.5 border flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                    <div className="flex items-center justify-between text-[9.5px] font-bold">
                                      <span>Daily Profit Target</span>
                                      <span className="text-emerald-600">+$2.5k</span>
                                    </div>
                                    <div className="text-[7.5px] text-slate-400 mt-0.5 mb-1.5">+$660 left to lock green day</div>
                                    <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
                                      <div className="h-full w-[74%] bg-emerald-500 rounded-full" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={`col-span-4 rounded-[12px] p-2.5 border flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                                <div>
                                  <div className="flex items-center justify-between text-[9.5px] font-bold mb-1">
                                    <span>Account Protection</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 text-[7.5px]">ARMED</span>
                                  </div>
                                  <div className="text-[8px] text-slate-400">Hard Equity Floor</div>
                                  <div className="text-[15px] font-bold font-mono text-[#2563EB] mt-0.5">$35,500</div>
                                </div>
                                <div className="space-y-1 text-[8px] pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                                  <div className="flex justify-between"><span className="text-slate-400">Max Risk</span><strong>0.5% / trade</strong></div>
                                  <div className="flex justify-between"><span className="text-slate-400">Cooldown</span><strong>15m post-loss</strong></div>
                                  <div className="flex justify-between"><span className="text-slate-400">News Lock</span><strong className="text-emerald-600">CPI 13:30</strong></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── VIEW 5: REAL REPORTS & STATEMENTS INTERFACE ── */}
                        {active.id === "reports" && (
                          <div className="space-y-2.5">
                            <div className={`rounded-[13px] p-3 border flex items-center justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                              <div>
                                <div className="text-[11px] font-bold">November 2026 Verified Statement</div>
                                <div className="text-[9.5px] text-slate-400 mt-0.5">Start $25,000.00 → Equity $37,530.00 (+50.1%)</div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#2563EB] text-[9.5px] font-bold">
                                Broker Verified
                              </span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {[
                                "+$620", "+$1.1k", "-$280", "+$940", "+$1.4k", "+$750", "+$1.6k",
                                "+$890", "+$1.5k", "-$240", "+$980", "+$1.2k", "+$650", "+$1.4k",
                              ].map((val, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-lg py-2 text-center text-[8px] font-bold border ${
                                    val.startsWith("-")
                                      ? "bg-rose-500/10 border-rose-500/25 text-rose-500"
                                      : "bg-emerald-500/10 border-emerald-500/25 text-emerald-600"
                                  }`}
                                >
                                  {val}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── VIEW 6: EXACT TRADI FIVE AI COACH WEB APP PAGE (Sessions Rail + Coach Stream + Prompt Bar) ── */}
                        {active.id === "ai-coach" && (
                          <div className="grid grid-cols-12 gap-2 items-stretch">
                            {/* Left Session History Rail (matches TradifiveAI.tsx left drawer) */}
                            <div className={`col-span-4 rounded-[12px] p-2.5 border flex flex-col justify-between ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                              <div className="space-y-1.5">
                                <div className="rounded-lg px-2 py-1.5 bg-[#2563EB] text-white text-[8.5px] font-bold text-center">
                                  + New AI Session
                                </div>
                                <div className="text-[7.5px] font-semibold text-slate-400 uppercase tracking-wider pt-1">
                                  Recent Threads
                                </div>
                                {[
                                  { t: "NY Open Profit Audit", active: true },
                                  { t: "Revenge Trigger Check", active: false },
                                  { t: "XAU/USD Lot Sizing", active: false },
                                ].map((item) => (
                                  <div
                                    key={item.t}
                                    className={`px-2 py-1.5 rounded-lg text-[8.5px] font-semibold truncate ${
                                      item.active
                                        ? isDarkFocus
                                          ? "bg-white/[0.08] text-white"
                                          : "bg-blue-50 text-[#2563EB]"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {item.t}
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[7.5px] text-slate-400">
                                Guardrails Synced: <strong className="text-emerald-600">3.0% DD · 15m Lock</strong>
                              </div>
                            </div>

                            {/* Right AI Conversation Panel (matches TradifiveAI.tsx chat view) */}
                            <div className={`col-span-8 rounded-[12px] p-2.5 border flex flex-col justify-between gap-2 ${isDarkFocus ? "bg-[#17171A] border-white/[0.08]" : "bg-white border-[#E4E4E4]"}`}>
                              <div className="space-y-2">
                                <div className="flex justify-end">
                                  <div className="rounded-2xl rounded-tr-sm px-2.5 py-1.5 bg-[#2563EB] text-white text-[9px] font-medium max-w-[85%]">
                                    Where did my clean profits come from this week?
                                  </div>
                                </div>

                                <div className={`rounded-2xl rounded-tl-sm p-2.5 border space-y-1.5 ${isDarkFocus ? "bg-white/[0.03] border-white/[0.07]" : "bg-[#F8FAFC] border-slate-200/80"}`}>
                                  <div className="flex items-center justify-between text-[8.5px] font-bold text-[#2563EB]">
                                    <span className="inline-flex items-center gap-1">
                                      <Sparkles size={10} /> TradiFive AI · Strict Guard
                                    </span>
                                    <span className="text-emerald-600 font-mono">94/100 Discipline</span>
                                  </div>
                                  <p className={`text-[9px] leading-relaxed ${isDarkFocus ? "text-neutral-300" : "text-slate-700"}`}>
                                    Sticking to your first 2 NY Open setups generated <strong className="text-emerald-600">+89% of gains ($11,150)</strong> with zero revenge trades. Keep hard stop at 2.0R before scaling.
                                  </p>
                                  <div className="flex items-center gap-1.5 pt-0.5 text-[7.5px]">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold">14d Clean Streak</span>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[#2563EB] font-bold">Rule: Max 2 NY trades</span>
                                  </div>
                                </div>
                              </div>

                              <div className={`rounded-full px-3 py-1.5 border flex items-center justify-between text-[8.5px] ${isDarkFocus ? "bg-[#121318] border-white/[0.08] text-neutral-400" : "bg-[#F8FAFC] border-slate-200 text-slate-400"}`}>
                                <span>Ask TradiFive AI about your MT5 trades or risk plan…</span>
                                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[9px] font-bold">↑</span>
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

        {/* Cleanly Docked Summary Card Below Workspace Frame (Zero Overlap) */}
        <div className="relative z-20 mt-4 sm:mt-5 max-w-[780px] mx-auto pb-6 sm:pb-10">
          <div className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#E4E4E4] shadow-[0_24px_60px_-15px_rgba(15,23,42,0.14)] p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-6"
              >
                {/* Left KPI + Segmented Bar */}
                <div className="sm:col-span-5 sm:border-r sm:border-slate-100 sm:pr-5">
                  <h3 className="text-[19px] font-bold tracking-tight text-slate-900">
                    {active.label}
                  </h3>
                  <p className="text-[12.5px] font-medium text-slate-500 mt-0.5">
                    {active.taglineLead}
                    <span className="text-[#2563EB] font-semibold">{active.taglineAccent}</span>
                  </p>

                  <div className="mt-4">
                    <div className="text-[10.5px] font-medium text-slate-400">
                      {active.metricLabel}
                    </div>
                    <div className="text-[20px] font-extrabold tracking-tight text-slate-900 tabular-nums mt-0.5">
                      {active.metricValue}
                    </div>
                    <div className="text-[10.5px] text-slate-500">{active.metricSub}</div>
                  </div>

                  <div className="mt-4">
                    <div className="text-[10.5px] font-medium text-slate-400">
                      {active.scoreLabel}
                    </div>
                    <div className="text-[16px] font-extrabold text-slate-900 tabular-nums mt-0.5">
                      {active.scoreValue}
                    </div>
                    {/* Segmented Tick Progress Bar */}
                    <div className="flex items-center gap-[2.5px] mt-1.5" aria-hidden="true">
                      {Array.from({ length: totalTicks }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-2.5 w-[3.5px] rounded-[1px] transition-colors ${idx < activeTicks ? "bg-[#2563EB]" : "bg-slate-200"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1.5">{active.scoreNote}</div>
                  </div>
                </div>

                {/* Right Bullets + Action */}
                <div className="sm:col-span-7 flex flex-col justify-between">
                  <ul className="space-y-3">
                    {active.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[13px] leading-snug text-slate-700"
                      >
                        <span className="mt-[9px] w-3 h-[1.5px] bg-[#2563EB] shrink-0" />
                        <span>
                          {b.before}
                          <span className="text-[#2563EB] font-semibold">{b.accent}</span>
                          {b.after}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-2">
                    <button
                      type="button"
                      onClick={onStart}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-900 hover:text-[#2563EB] border-b border-slate-900 hover:border-[#2563EB] pb-0.5 transition-colors cursor-pointer"
                    >
                      <span>Sign up to try it</span>
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
  const STEPS = [
    {
      num: "01",
      icon: Users,
      title: "Create your account",
      desc: "Set up your verified trader profile and workspace preferences in under a minute.",
      meta: "Setup · 60s",
      previewTitle: "@disciplined_trader",
      previewStatus: "Ready",
    },
    {
      num: "02",
      icon: Layers,
      title: "Connect your broker",
      desc: "Link any MT5 account via read/execute bridge while keeping 100% of funds on your broker.",
      meta: "MT5 bridge · 4ms",
      previewTitle: "MetaTrader 5 Bridge",
      previewStatus: "Synced",
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Activate Risk Guard",
      desc: "Configure daily loss caps and max trade rules. Breaches trigger an automatic cooldown lock.",
      meta: "Autonomous guard",
      previewTitle: "Drawdown Shield · 3.0%",
      previewStatus: "Armed",
    },
    {
      num: "04",
      icon: Globe,
      title: "Join the community",
      desc: "Follow verified traders, subscribe to broadcast channels, and compete on live leaderboards.",
      meta: "Verified network",
      previewTitle: "Broadcast Channels",
      previewStatus: "Active",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-7 relative bg-white">
      <div className="max-w-[1160px] mx-auto">
        <SectionHeader
          badge="Workflow"
          icon={Globe}
          tone="blue"
          title="From setup to consistent execution"
          subtitle="in four structured steps."
          description="Journaling, risk enforcement, AI review, and community accountability working from one unified feed."
          className="mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EASE_OUT }}
                className="border-t-2 border-[#E4E4E4] hover:border-[#2563EB] pt-6 flex flex-col justify-between gap-7 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="inline-flex items-center gap-2.5">
                      <span className="text-[12px] font-mono font-semibold text-slate-400 tabular-nums">
                        {step.num}
                      </span>
                      <Icon size={16} strokeWidth={1.7} className="text-slate-700" />
                    </div>
                    <span className="text-[11.5px] font-mono text-slate-400">
                      {step.meta}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-900 mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="border-t border-[#E4E4E4]/75 pt-3 flex items-center justify-between gap-2 text-[12px]">
                  <span className="font-medium text-slate-700 truncate">
                    {step.previewTitle}
                  </span>
                  <span className="font-mono font-medium text-emerald-700 shrink-0">
                    {step.previewStatus}
                  </span>
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

const COMMUNITY_PILLARS = [
  {
    title: "Pulse feed",
    desc: "Share verified setups, profit milestones, and reviews in real time.",
  },
  {
    title: "Signal channels",
    desc: "Subscribe to broker-verified broadcast desks with structured trade alerts.",
  },
  {
    title: "Direct messages",
    desc: "Collaborate 1-on-1 with trading mentors inside one unified workspace.",
  },
  {
    title: "Webinar rooms",
    desc: "Join live session breakdowns hosted by vetted disciplined performers.",
  },
];

function Social() {
  return (
    <section id="wall-of-fame" className="py-20 sm:py-24 relative overflow-hidden bg-white">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-7">
        <SectionHeader
          badge="Community & Proof"
          icon={Users}
          tone="blue"
          title="Traders who chose"
          subtitle="to grow together."
          inlineSubtitle
          description="Share verified setups, compete on rule-weighted leaderboards, and connect with disciplined traders worldwide."
          className="mb-12"
        />

        {/* Combined Metrics + Community Highlights Architectural Matrix */}
        <div className="rounded-2xl border border-[#E4E4E4] bg-[#E4E4E4] overflow-hidden mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE_OUT }}
                className="bg-white p-6 sm:p-7 text-center"
              >
                <div className="text-[28px] sm:text-[32px] font-bold text-slate-950 tracking-[-0.025em] tabular-nums leading-none">
                  {s.val}
                </div>
                <div className="text-[13px] font-medium text-slate-500 mt-2.5">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border-t border-[#E4E4E4]">
            {COMMUNITY_PILLARS.map((item) => (
              <div key={item.title} className="bg-[#FAFBFB] p-5 sm:p-6">
                <h3 className="text-[14.5px] font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
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
              className="w-[320px] shrink-0 rounded-2xl bg-white border border-[#E4E4E4] shadow-[0_6px_24px_-14px_rgba(15,23,42,0.06)] p-6 flex flex-col justify-between gap-6"
            >
              <p className="text-[14px] text-slate-600 leading-relaxed font-normal">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[11px] font-bold text-[#2563EB] shrink-0">
                  {t.init}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-900">
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
