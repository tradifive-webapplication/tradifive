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
  | "analytics"
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
    scoreValue: 92,
    scoreNote: "Setup tags applied across 100% of fills",
    bullets: [
      { before: "Instant ", accent: "MT5 broker sync", after: " with screenshots & execution timing" },
      { before: "Structured ", accent: "setup & emotion tagging", after: " per position" },
      { before: "Pre-session & post-session ", accent: "mindset checklists", after: "" },
      { before: "Side-by-side ", accent: "planned vs actual R-multiple", after: " audit" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    taglineLead: "Find where your ",
    taglineAccent: "real edge lives.",
    icon: BarChart3,
    metricLabel: "Profit Factor",
    metricValue: "16.10",
    metricSub: "2.23R average expectancy",
    scoreLabel: "Edge Sharpness",
    scoreValue: 88,
    scoreNote: "Best window: NY Open XAU/USD (84% win)",
    bullets: [
      { before: "Breakdowns by ", accent: "session, hour, and instrument", after: "" },
      { before: "Clear ", accent: "MAE / MFE excursion heatmaps", after: " for tighter stops" },
      { before: "Compare ", accent: "A+ setups vs impulse entries", after: " at a glance" },
      { before: "Filter ", accent: "verified prop & live accounts", after: " side by side" },
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
      { before: "Automated ", accent: "daily loss & drawdown guardrails", after: "" },
      { before: "Cooldown lockouts after ", accent: "consecutive rule breaks", after: "" },
      { before: "Red-folder ", accent: "Forex Factory news warnings", after: " pre-open" },
      { before: "Live ", accent: "lot-size & exposure caps", after: " across linked accounts" },
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
  const [viewMode, setViewMode] = useState<"classic" | "custom">("classic");

  const active = SESSION_MODULES.find((m) => m.id === activeId) || SESSION_MODULES[0];
  const leftModules = SESSION_MODULES.slice(0, 3);
  const rightModules = SESSION_MODULES.slice(3, 6);
  const totalTicks = 24;
  const activeTicks = Math.round((active.scoreValue / 100) * totalTicks);

  return (
    <section
      id="features"
      className="relative bg-white text-slate-900 pt-16 sm:pt-24 pb-10 sm:pb-16 overflow-hidden"
    >
      {/* Top editorial bridge line */}
      <div className="max-w-[1220px] mx-auto px-4 sm:px-8 mb-10 sm:mb-20">
        <p className="text-[13.5px] sm:text-[15px] leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-900">TradiFive reads it back.</span>{" "}
          Trade by trade, until the pattern has nowhere to hide.
        </p>
      </div>

      {/* Subtle Cool Alpine Mist Silhouettes Flanking Margins (Ultra Clean) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[140px] bottom-[90px] overflow-hidden select-none"
      >
        <svg
          viewBox="0 0 1440 640"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full opacity-[0.42]"
        >
          <defs>
            <linearGradient id="mistRidgeLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#e2e8f0" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mistRidgeRight" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.48" />
              <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mistFadeV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="22%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="76%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M-40,640 L-40,340 L110,210 L215,295 L320,370 L460,520 L460,640 Z"
            fill="url(#mistRidgeLeft)"
          />
          <path
            d="M1480,640 L1480,310 L1320,185 L1210,280 L1085,365 L960,540 L960,640 Z"
            fill="url(#mistRidgeRight)"
          />
          <rect width="1440" height="640" fill="url(#mistFadeV)" />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1220px] mx-auto px-4 sm:px-8">
        {/* Centered Header + Segmented Toggle */}
        <div className="text-center max-w-[660px] mx-auto mb-7 sm:mb-12">
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
            className="text-[28px] sm:text-[46px] font-bold tracking-[-0.035em] leading-[1.08] text-slate-950"
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
            className="mt-3 sm:mt-3.5 text-[14px] sm:text-[15.5px] font-normal text-slate-600 leading-relaxed"
          >
            Inspect how auto-journaling, autonomous Risk Guard, and AI session coaching stay synced live.
          </motion.p>

          {/* View Switcher Pill */}
          <div className="mt-4 sm:mt-5 inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/90 shadow-inner">
            {(
              [
                { id: "classic", label: "Classic" },
                { id: "custom", label: "Focused" },
              ] as const
            ).map((tab) => {
              const isSelected = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 cursor-pointer ${isSelected
                      ? "bg-[#2563EB] text-white shadow-[0_3px_10px_rgba(37,99,235,0.35)]"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Quick Module Selector (2x3 Grid so all 6 are immediately visible without sideways scrolling) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden gap-2 max-w-[460px] mx-auto mb-5">
          {SESSION_MODULES.map((mod) => {
            const Icon = mod.icon;
            const isSelected = mod.id === activeId;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveId(mod.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[12px] font-semibold transition-all cursor-pointer ${isSelected
                    ? "bg-white text-slate-900 border-[#2563EB] shadow-[0_6px_18px_rgba(37,99,235,0.16)]"
                    : "bg-white/95 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg inline-flex items-center justify-center shrink-0 ${isSelected ? "bg-[#0F172A] text-white" : "bg-slate-900 text-white"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop 3-Column Interactive Showcase */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] items-center gap-4 lg:gap-0">
          {/* Left Floating Pills Column */}
          <div className="hidden lg:flex flex-col justify-center gap-12 z-20 pr-0">
            {leftModules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = mod.id === activeId;
              return (
                <div key={mod.id} className="relative flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveId(mod.id)}
                    className={`group relative z-10 inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full border bg-white transition-all duration-200 cursor-pointer ${isSelected
                        ? "border-[#2563EB] shadow-[0_10px_26px_rgba(37,99,235,0.18)] scale-[1.03]"
                        : "border-slate-200/90 shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.09)]"
                      }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl inline-flex items-center justify-center transition-colors ${isSelected
                          ? "bg-[#0F172A] text-white"
                          : "bg-slate-900 text-white group-hover:bg-[#2563EB]"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[12.5px] font-semibold text-slate-800 whitespace-nowrap">
                      {mod.label}
                    </span>
                  </button>
                  {/* Connector hairline + node */}
                  <div className="flex items-center shrink-0">
                    <div
                      className={`w-8 h-[1.5px] transition-colors ${isSelected ? "bg-[#2563EB]" : "bg-slate-200"
                        }`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full border-[1.5px] transition-colors ${isSelected
                          ? "bg-[#2563EB] border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                          : "bg-white border-slate-300"
                        }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Window Card */}
          <div className="relative z-10 max-w-[660px] w-full mx-auto">
            <div className="rounded-[22px] bg-white border border-slate-200/95 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.16)] overflow-hidden">
              {/* macOS Title Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/75">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {active.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {viewMode === "classic" ? "All widgets" : "Focus view"}
                </span>
              </div>

              {/* Dynamic Screen Canvas */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-${viewMode}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  className="p-3 sm:p-5 pb-12 sm:pb-20 bg-[#F8FAFC] min-h-[250px] sm:min-h-[330px]"
                >
                  {/* Mini Workspace Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <img src="/tf-logo.png" alt="TradiFive" className="w-4 h-4 rounded object-contain" />
                      <span className="text-[11px] font-bold text-slate-800">
                        TradiFive · {active.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                        Exness MT5 · Live
                      </span>
                    </div>
                  </div>

                  {active.id === "dashboard" && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white px-4 py-2.5 flex items-center justify-between shadow-sm">
                        <span className="text-[11px] font-medium text-blue-50">
                          November execution recap ready · 17 verified setups
                        </span>
                        <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-white text-blue-700">
                          Play brief
                        </span>
                      </div>

                      <div className="rounded-xl bg-white border border-slate-200/90 p-4 text-center">
                        <div className="text-[10px] font-medium text-slate-400">Net P&L · All time</div>
                        <div className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-slate-900 mt-0.5 tabular-nums">
                          +$12,530
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          14 wins · 3 losses · 82% win rate
                        </div>
                      </div>

                      {viewMode === "classic" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                          <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 sm:p-3">
                            <div className="text-[9.5px] text-slate-400 font-medium">Avg RR</div>
                            <div className="text-[15px] sm:text-[16px] font-bold text-slate-900 mt-0.5">2.23R</div>
                            <div className="text-[9px] text-emerald-600 font-medium mt-0.5">+$954 avg win</div>
                          </div>
                          <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 sm:p-3">
                            <div className="text-[9.5px] text-slate-400 font-medium">Profit Factor</div>
                            <div className="text-[15px] sm:text-[16px] font-bold text-slate-900 mt-0.5">16.10</div>
                            <div className="text-[9px] text-slate-500 mt-0.5">-$276 avg loss</div>
                          </div>
                          <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 sm:p-3 col-span-2 sm:col-span-1">
                            <div className="text-[9.5px] text-slate-400 font-medium">TradiFive Score</div>
                            <div className="text-[15px] sm:text-[16px] font-bold text-slate-900 mt-0.5">81 / 100</div>
                            <div className="text-[9px] text-blue-600 font-medium mt-0.5">Top 4% desk</div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between">
                          <div>
                            <div className="text-[11px] font-bold text-slate-800">Active Session Edge</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              NY Open XAU/USD (+2.64R expectancy · 0 rule breaches)
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            A+ Mode
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {active.id === "journal" && (
                    <div className="space-y-2.5">
                      {[
                        { pair: "XAU/USD", dir: "LONG", tag: "NY Break & Retest", r: "+2.4R", pnl: "+$1,640", good: true },
                        { pair: "NAS100", dir: "SHORT", tag: "London Sweep", r: "+1.8R", pnl: "+$1,210", good: true },
                        { pair: "EUR/USD", dir: "LONG", tag: "Pre-News Fade", r: "-0.8R", pnl: "-$240", good: false },
                      ].map((row) => (
                        <div
                          key={row.pair}
                          className="rounded-xl bg-white border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-bold text-slate-900">{row.pair}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${row.dir === "LONG"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-700"
                                }`}
                            >
                              {row.dir}
                            </span>
                            {viewMode === "classic" && (
                              <span className="text-[10px] text-slate-500 hidden sm:inline">
                                · {row.tag}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 tabular-nums">
                            <span className="text-[10.5px] font-semibold text-slate-500">{row.r}</span>
                            <span
                              className={`text-[12px] font-bold ${row.good ? "text-emerald-600" : "text-rose-500"
                                }`}
                            >
                              {row.pnl}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {active.id === "analytics" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                        <div className="rounded-xl bg-white border border-slate-200/80 p-2 sm:p-3">
                          <div className="text-[8.5px] sm:text-[9.5px] text-slate-400 truncate">London</div>
                          <div className="text-[13px] sm:text-[15px] font-bold text-emerald-600 mt-0.5">+$6,840</div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-slate-500">84% win</div>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200/80 p-2 sm:p-3">
                          <div className="text-[8.5px] sm:text-[9.5px] text-slate-400 truncate">NY Open</div>
                          <div className="text-[13px] sm:text-[15px] font-bold text-emerald-600 mt-0.5">+$4,920</div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-slate-500">79% win</div>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200/80 p-2 sm:p-3">
                          <div className="text-[8.5px] sm:text-[9.5px] text-slate-400 truncate">Asian</div>
                          <div className="text-[13px] sm:text-[15px] font-bold text-slate-800 mt-0.5">+$770</div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-slate-500">50% win</div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/80 p-3.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-2">
                          <span>Hourly Expectancy Edge</span>
                          <span className="text-[#2563EB]">Peak 13:30 – 16:00 UTC</span>
                        </div>
                        <div className="grid grid-cols-8 items-end gap-1.5 h-16">
                          {[35, 58, 82, 95, 76, 44, 62, 30].map((h, i) => (
                            <div
                              key={i}
                              className={`rounded-t-md ${i === 3 || i === 2 ? "bg-[#2563EB]" : "bg-blue-100"
                                }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {active.id === "risk-guard" && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">Daily Loss Limit</div>
                          <div className="text-[10px] text-slate-500">0.8% drawn today · 2.2% buffer remaining</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                          Armed
                        </span>
                      </div>
                      <div className="rounded-xl bg-white border border-slate-200/80 p-3.5">
                        <div className="flex justify-between text-[10.5px] font-semibold text-slate-700 mb-2">
                          <span>Daily Drawdown Meter</span>
                          <span>0.8% / 3.0%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full w-[26%] rounded-full bg-emerald-500" />
                        </div>
                        <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">Max trades/day: 3 / 5</div>
                          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">News guard: Auto-pause CPI</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {active.id === "reports" && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">
                            November 2026 Verified Statement
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Start $25,000.00 → Equity $37,530.00 (+50.1%)
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-bold">
                          Verified
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {[
                          "+$620", "+$1.1k", "-$280", "+$940", "+$1.4k", "+$750", "+$1.6k",
                          "+$890", "+$1.5k", "-$240", "+$980", "+$1.2k", "+$650", "+$1.4k",
                        ].map((val, idx) => (
                          <div
                            key={idx}
                            className={`rounded-md sm:rounded-lg py-1.5 sm:py-2 text-center text-[8px] sm:text-[9.5px] font-bold border ${val.startsWith("-")
                                ? "bg-rose-50/90 border-rose-200 text-rose-600"
                                : "bg-emerald-50/90 border-emerald-200 text-emerald-700"
                              }`}
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {active.id === "ai-coach" && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-white border border-slate-200/80 p-3.5">
                        <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#2563EB] mb-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>TradiFive AI · Session Debrief</span>
                        </div>
                        <p className="text-[11.5px] leading-relaxed text-slate-700">
                          “Your discipline held at <span className="font-bold text-slate-900">94/100</span> this week.
                          Sticking to the first 2 NY Open setups produced{" "}
                          <span className="font-bold text-emerald-600">+89% of total monthly gains</span> with zero revenge entries.”
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-white border border-slate-200/80 p-3">
                          <div className="text-[9.5px] text-slate-400">Next Focus Rule</div>
                          <div className="text-[11px] font-bold text-slate-800 mt-0.5">
                            Hold winners to 2.0R before partial
                          </div>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200/80 p-3">
                          <div className="text-[9.5px] text-slate-400">Streak Status</div>
                          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                            14 consecutive clean days
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Floating Pills Column */}
          <div className="hidden lg:flex flex-col justify-center gap-12 z-20 pl-0">
            {rightModules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = mod.id === activeId;
              return (
                <div key={mod.id} className="relative flex items-center justify-start">
                  {/* Connector node + hairline */}
                  <div className="flex items-center shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full border-[1.5px] transition-colors ${isSelected
                          ? "bg-[#2563EB] border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                          : "bg-white border-slate-300"
                        }`}
                    />
                    <div
                      className={`w-8 h-[1.5px] transition-colors ${isSelected ? "bg-[#2563EB]" : "bg-slate-200"
                        }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveId(mod.id)}
                    className={`group relative z-10 inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full border bg-white transition-all duration-200 cursor-pointer ${isSelected
                        ? "border-[#2563EB] shadow-[0_10px_26px_rgba(37,99,235,0.18)] scale-[1.03]"
                        : "border-slate-200/90 shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.09)]"
                      }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl inline-flex items-center justify-center transition-colors ${isSelected
                          ? "bg-[#0F172A] text-white"
                          : "bg-slate-900 text-white group-hover:bg-[#2563EB]"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[12.5px] font-semibold text-slate-800 whitespace-nowrap">
                      {mod.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overlapping Floating Summary Card */}
        <div className="relative z-20 -mt-7 sm:-mt-16 max-w-[660px] mx-auto pb-6 sm:pb-10">
          <div className="rounded-[20px] sm:rounded-[24px] bg-white border border-slate-200/95 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.14)] p-4 sm:p-7">
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
    <section id="problem" className="py-24 sm:py-28 px-4 sm:px-7 relative bg-white overflow-hidden">
      {/* Seamless alpine mountain backdrop dissolving top & bottom into crisp white */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <img
          src="/problem-mountain-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-[35%_52%] opacity-[0.58] sm:opacity-[0.65] scale-[1.03]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.42) 18%, rgba(255,255,255,0.08) 54%, rgba(255,255,255,0.82) 86%, #ffffff 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.34) 36%, rgba(255,255,255,0.72) 66%, rgba(255,255,255,0.9) 100%)",
          }}
        />
      </div>

      <div className="max-w-[1160px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:rounded-2xl lg:bg-white/55 lg:backdrop-blur-[6px] lg:p-6 lg:-ml-6 lg:border lg:border-white/80">
          <SectionHeader
            badge="The problem"
            icon={AlertTriangle}
            tone="rose"
            align="left"
            title="Most traders don't lack setups —"
            subtitle="they lose to unguarded behavior."
            description="Charts only show price. The real capital leaks happen in execution discipline right between setups."
            className="mb-6"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: 0.3, ease: EASE_OUT }}
            className="border-l-2 border-rose-500/80 pl-4 py-0.5 text-[13px] text-slate-700 leading-relaxed"
          >
            Across MT5 retail &amp; prop accounts, over 70% of monthly equity drawdowns occur during unscheduled post-loss sessions.
          </motion.div>
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-white/82 backdrop-blur-md border border-[#E4E4E4] px-5 sm:px-8 divide-y divide-[#E4E4E4] shadow-[0_18px_48px_-22px_rgba(15,23,42,0.1)]">
          {PROBLEMS.map((p, idx) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05, ease: EASE_OUT }}
              className="py-6 sm:py-7 flex items-start gap-5 sm:gap-7 group"
            >
              <span className="text-[13px] font-mono font-semibold text-slate-400 pt-0.5 tabular-nums shrink-0 group-hover:text-rose-500 transition-colors">
                {p.num}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                  <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-900">
                    {p.title}
                  </h3>
                  <span className="text-[11.5px] font-medium text-rose-600 shrink-0">
                    {p.impact}
                  </span>
                </div>
                <p className="text-[13.5px] text-slate-600 leading-relaxed font-normal">
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
  const [tradeLimitActive, setTradeLimitActive] = useState(true);
  const [tradeCap, setTradeCap] = useState(6);
  const [tradesUsed, setTradesUsed] = useState(0);

  const tradesLeft = Math.max(0, tradeCap - tradesUsed);
  const tradesBreached = tradesUsed >= tradeCap;

  const donutSize = 60;
  const strokeWidth = 5.5;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - 0.78);

  return (
    <section id="solution" className="py-14 sm:py-16 px-4 sm:px-7 relative bg-white">
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
                    <Switch checked={tradeLimitActive} onCheckedChange={setTradeLimitActive} size="sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5 tabular-nums">
                      <span>Today: {tradesUsed} / {tradeCap}</span>
                      <span className="px-1.5 py-[0.5px] rounded text-[8px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        LIVE
                      </span>
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        tradesBreached ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {tradesBreached ? "Limit reached" : `${tradesLeft} left today`}
                    </span>
                  </div>

                  <TradeSlotsBlobStrip
                    total={tradeCap}
                    completed={tradesUsed}
                    interactive={true}
                    onSelectCount={setTradesUsed}
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
                      onClick={() => setTradeCap((v) => Math.min(10, v + 1))}
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
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9.5px] font-bold uppercase">
                    MT5 · Auto-Synced
                  </span>
                </div>

                <div className="divide-y divide-[#E4E4E4]/70 text-[11px]">
                  {[
                    { pair: "XAU/USD", lot: "1.25L", setup: "NY Open Sweep", rr: "+2.4R", pnl: "+$1,480", win: true },
                    { pair: "EUR/USD", lot: "2.00L", setup: "London OB", rr: "+1.8R", pnl: "+$960", win: true },
                    { pair: "NAS100", lot: "0.50L", setup: "FVG Retest", rr: "-1.0R", pnl: "-$310", win: false },
                  ].map((row) => (
                    <div key={row.pair} className="px-3 py-1.5 flex items-center justify-between gap-2">
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
                    </div>
                  ))}
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
                <div className="px-3 py-2 rounded-[12px] bg-white border border-[#E4E4E4] shadow-[0_2px_6px_rgba(15,23,42,0.03)] flex items-center justify-between text-[11.5px]">
                  <span className="flex items-center gap-2 font-semibold text-slate-800">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span>
                      Pre-market plan active ·{" "}
                      <span className="text-slate-500 font-medium">Bullish bias</span>
                    </span>
                  </span>
                  <ArrowRight size={12.5} className="text-slate-400" />
                </div>

                <div className="p-3 rounded-[14px] bg-white border border-[#E4E4E4] shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#2563EB]">
                      <Sparkles size={11.5} />
                      TradiFive AI · Session Debrief
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">NY Session</span>
                  </div>
                  <p className="text-[11.5px] leading-snug text-slate-700">
                    &ldquo;Your discipline held at <strong className="text-slate-900">94/100</strong>.
                    Your first 2 NY Open setups made <strong className="text-emerald-600">+89% of gains</strong> with zero revenge trades.&rdquo;
                  </p>
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
                  <div>
                    <div className="text-[10.5px] font-medium text-slate-500">
                      Net Cumulative P&amp;L
                    </div>
                    <div className="text-[20px] font-bold text-slate-950 tracking-[-0.03em] tabular-nums leading-tight mt-0.5">
                      +$8,420.50
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10.5px]">
                      <span className="px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E4E4E4] font-semibold text-slate-700 tabular-nums">
                        14W / 4L
                      </span>
                      <span className="text-slate-400 font-medium tabular-nums">
                        18 closed trades
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
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[12px] font-bold text-slate-900 leading-none tabular-nums">
                        78%
                      </span>
                      <span className="text-[7.5px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                        Win
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Avg RR", value: "2.15R" },
                    { label: "Profit Factor", value: "2.48" },
                    { label: "Avg W / L", value: "$740 / $290" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="px-2 py-1.5 rounded-[11px] bg-white border border-[#E4E4E4] text-center"
                    >
                      <div className="text-[9.5px] font-medium text-slate-400">{m.label}</div>
                      <div className="text-[12px] font-bold text-slate-900 tabular-nums truncate">
                        {m.value}
                      </div>
                    </div>
                  ))}
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
        lightOnScroll={true}
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
