import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Flame,
  Star,
  Trophy,
  Gift,
  Clock,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  X,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Gauge,
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  XAxis,
} from "@/components/ui/charts";

/* =========================================================================
   TYPES & DATA MODELS
========================================================================= */

interface PointData {
  date: Date;
  score: number;
  equity: string;
  trades: number;
}

interface CurveDataset {
  headline: string;
  delta: string;
  sessions: string;
  scoreLabel: string;
  points: PointData[];
}

interface ComplianceRule {
  id: "sl" | "lots" | "revenge" | "cap";
  title: string;
  subtitle: string;
  value: number;
  badgeText: string;
  percentageText: string;
  colorType: "green" | "blue" | "amber";
  icon: React.ReactNode;
  auditBadge: string;
  auditTitle: string;
  auditSummary: string;
  auditStats: { label: string; value: string }[];
}

interface WeeklyDayRecord {
  id: string;
  dayHeader: string;
  day: string;
  score: number;
  grade: "GRADE A+" | "GRADE A";
  tier: "A+" | "A";
  trades: string;
  pair: string;
  net: string;
  note: string;
}

interface BadgeItem {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  xp: string;
  icon: string;
}

interface VaultReward {
  id: string;
  title: string;
  desc: string;
  cost: number;
  tag: string;
}

const CARD_BASE =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

export default function Rewards() {
  /* -------------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------------- */
  const [activeTab, setActiveTab] = useState<"discipline" | "streak" | "badges" | "vault">("discipline");
  const [activeRange, setActiveRange] = useState<"7D" | "14D" | "All">("14D");
  const [xp, setXp] = useState(850);
  const [score, setScore] = useState(96);
  const [displayScore, setDisplayScore] = useState(96);
  const [streakDays, setStreakDays] = useState(18);
  const [redeemedRewards, setRedeemedRewards] = useState<Set<string>>(new Set());
  const [replayKey, setReplayKey] = useState(0);

  // Audit modal state
  const [activeAuditModal, setActiveAuditModal] = useState<{
    isOpen: boolean;
    badge: string;
    title: string;
    summary: string;
    stats: { label: string; value: string }[];
  }>({
    isOpen: false,
    badge: "",
    title: "",
    summary: "",
    stats: [],
  });

  /* -------------------------------------------------------------------------
     DISCIPLINE CURVE DATASETS (7D, 14D, ALL)
  ------------------------------------------------------------------------- */
  const curveDatasets: Record<"7D" | "14D" | "All", CurveDataset> = {
    "7D": {
      headline: "+96.0%",
      delta: "+4.8% this week",
      sessions: "7 closed sessions",
      scoreLabel: "Score: 96%",
      points: [
        { date: new Date(2026, 10, 15), score: 93, equity: "+91.2%", trades: 2 },
        { date: new Date(2026, 10, 16), score: 92, equity: "+92.0%", trades: 3 },
        { date: new Date(2026, 10, 17), score: 88, equity: "+91.5%", trades: 4 },
        { date: new Date(2026, 10, 18), score: 95, equity: "+93.4%", trades: 2 },
        { date: new Date(2026, 10, 19), score: 94, equity: "+94.7%", trades: 3 },
        { date: new Date(2026, 10, 20), score: 96, equity: "+95.6%", trades: 2 },
        { date: new Date(2026, 10, 21), score: 96, equity: "+96.0%", trades: 3 },
      ],
    },
    "14D": {
      headline: "+96.0%",
      delta: "+4.8% this week",
      sessions: "16 closed sessions",
      scoreLabel: "Score: 96%",
      points: [
        { date: new Date(2026, 10, 9), score: 84, equity: "+82.4%", trades: 2 },
        { date: new Date(2026, 10, 11), score: 89, equity: "+86.1%", trades: 3 },
        { date: new Date(2026, 10, 13), score: 87, equity: "+85.3%", trades: 2 },
        { date: new Date(2026, 10, 15), score: 93, equity: "+90.8%", trades: 2 },
        { date: new Date(2026, 10, 16), score: 92, equity: "+91.6%", trades: 3 },
        { date: new Date(2026, 10, 17), score: 88, equity: "+89.4%", trades: 4 },
        { date: new Date(2026, 10, 18), score: 95, equity: "+93.9%", trades: 2 },
        { date: new Date(2026, 10, 19), score: 94, equity: "+94.8%", trades: 3 },
        { date: new Date(2026, 10, 20), score: 96, equity: "+96.0%", trades: 3 },
      ],
    },
    All: {
      headline: "+114.2%",
      delta: "+18.4% this month",
      sessions: "42 closed sessions",
      scoreLabel: "Avg Score: 94%",
      points: [
        { date: new Date(2026, 9, 24), score: 78, equity: "+64.0%", trades: 3 },
        { date: new Date(2026, 9, 29), score: 82, equity: "+71.5%", trades: 2 },
        { date: new Date(2026, 10, 3), score: 86, equity: "+79.2%", trades: 3 },
        { date: new Date(2026, 10, 8), score: 85, equity: "+83.0%", trades: 2 },
        { date: new Date(2026, 10, 12), score: 90, equity: "+88.7%", trades: 3 },
        { date: new Date(2026, 10, 16), score: 92, equity: "+92.4%", trades: 3 },
        { date: new Date(2026, 10, 19), score: 95, equity: "+104.8%", trades: 2 },
        { date: new Date(2026, 10, 21), score: 96, equity: "+114.2%", trades: 3 },
      ],
    },
  };

  const clampedScore = Math.max(0, Math.min(100, displayScore));
  const activeDataset = curveDatasets[activeRange];

  /* -------------------------------------------------------------------------
     RULE COMPLIANCE PARAMETERS (4 CARDS WITH UIVERSE BARS)
  ------------------------------------------------------------------------- */
  const complianceRules: ComplianceRule[] = [
    {
      id: "sl",
      title: "MT5 Stop-Loss Protection",
      subtitle: "Every order opened with mandatory protective SL",
      value: 100,
      badgeText: "100% Verified",
      percentageText: "100%",
      colorType: "green",
      icon: <ShieldCheck size={16} className="text-emerald-500" />,
      auditBadge: "100% PROTECTED",
      auditTitle: "Stop-Loss Enforcement Telemetry",
      auditSummary:
        "Every single market order transmitted to Exness MT5 was verified with a hard protective stop-loss in place upon order receipt. Zero unhedged exposure detected.",
      auditStats: [
        { label: "Orders Analyzed", value: "16 Closed Positions" },
        { label: "Avg SL Latency", value: "1.4s post-fill" },
        { label: "Discipline Breaches", value: "0 Detected" },
      ],
    },
    {
      id: "lots",
      title: "Lot Sizing Rule",
      subtitle: "Strict 1% account risk limit dynamically enforced",
      value: 95,
      badgeText: "0.05 – 0.10 Lots",
      percentageText: "95%",
      colorType: "blue",
      icon: <Scale size={16} className="text-[#006DFE] dark:text-blue-400" />,
      auditBadge: "0.05 – 0.10 LOTS",
      auditTitle: "Dynamic Position Sizing Audit",
      auditSummary:
        "Positions strictly calibrated against account equity ($28,308.50). 15 out of 16 trades stayed within 0.75%–0.98% capital risk cap per trade.",
      auditStats: [
        { label: "Max Risk Enforced", value: "1.00% Account Equity" },
        { label: "Highest Lot Traded", value: "0.10 XAUUSD" },
        { label: "Oversizing Attempts", value: "0 Flagged" },
      ],
    },
    {
      id: "revenge",
      title: "Revenge Trade Shield",
      subtitle: "15-minute emotional cooldown respected post-loss",
      value: 100,
      badgeText: "0 Violations",
      percentageText: "100%",
      colorType: "green",
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      auditBadge: "0 VIOLATIONS",
      auditTitle: "Revenge Trade Shield Telemetry",
      auditSummary:
        "Following any losing trade, Live MT5 Guard enforces a mandatory 15-minute emotional reset window before new market entries.",
      auditStats: [
        { label: "Post-Loss Cooldowns", value: "6 / 6 Respected" },
        { label: "Shortest Re-entry Gap", value: "24m 12s" },
        { label: "Lot Doubling Attempts", value: "0 Blocked" },
      ],
    },
    {
      id: "cap",
      title: "Daily Trade Cap",
      subtitle: "Strictly under maximum daily execution quota",
      value: 75,
      badgeText: "3 / 4 Trades",
      percentageText: "75%",
      colorType: "amber",
      icon: <Clock size={16} className="text-amber-500" />,
      auditBadge: "3 / 4 TRADES",
      auditTitle: "Daily Execution Quota Monitor",
      auditSummary:
        "Overtrading is prevented by capping executions at 4 trades per 24/5 MT5 session cycle. You have 1 execution slot remaining today.",
      auditStats: [
        { label: "Executions Today", value: "3 / 4 Slots Used" },
        { label: "Auto-Reset Timer", value: "00:00 MT5 Server" },
        { label: "Overtrading Breaches", value: "0 This Month" },
      ],
    },
  ];

  /* -------------------------------------------------------------------------
     WEEKLY CONSISTENCY DAYS (6 CARDS AS SHOWN IN IMAGE 2)
  ------------------------------------------------------------------------- */
  const weeklyDays: WeeklyDayRecord[] = [
    {
      id: "mon",
      dayHeader: "MON",
      day: "MON, NOV 16",
      score: 92,
      grade: "GRADE A",
      tier: "A",
      trades: "3 / 4",
      pair: "EURUSD · XAUUSD",
      net: "+1.15%",
      note: "All stop-losses attached within 1.8s of entry.",
    },
    {
      id: "tue",
      dayHeader: "TUE",
      day: "TUE, NOV 17",
      score: 88,
      grade: "GRADE A",
      tier: "A",
      trades: "4 / 4",
      pair: "GBPUSD · USDJPY",
      net: "-0.42%",
      note: "Hit 4/4 daily trade cap; stopped trading immediately per rules.",
    },
    {
      id: "wed",
      dayHeader: "WED",
      day: "WED, NOV 18",
      score: 95,
      grade: "GRADE A+",
      tier: "A+",
      trades: "2 / 4",
      pair: "XAUUSD",
      net: "+1.64%",
      note: "Zero drawdown violation; 0.75% max risk per position.",
    },
    {
      id: "thu",
      dayHeader: "THU",
      day: "THU, NOV 19",
      score: 94,
      grade: "GRADE A",
      tier: "A",
      trades: "3 / 4",
      pair: "EURUSD · NAS100",
      net: "+0.88%",
      note: "Respected 15-min cooldown after morning breakeven stop.",
    },
    {
      id: "fri",
      dayHeader: "FRI",
      day: "FRI, NOV 20",
      score: 96,
      grade: "GRADE A+",
      tier: "A+",
      trades: "2 / 4",
      pair: "XAUUSD · GBPJPY",
      net: "+1.32%",
      note: "Flawless London-NY overlap execution; 100% SL compliance.",
    },
    {
      id: "sat",
      dayHeader: "SAT",
      day: "SAT, NOV 21",
      score: 96,
      grade: "GRADE A+",
      tier: "A+",
      trades: "3 / 4",
      pair: "BTCUSD · ETHUSD",
      net: "+0.92%",
      note: "Weekend crypto guard active. Perfect discipline verified.",
    },
  ];

  /* -------------------------------------------------------------------------
     BADGES DATA
  ------------------------------------------------------------------------- */
  const badgesData: BadgeItem[] = [
    {
      id: "b1",
      title: "Iron Stop-Loss",
      desc: "30 consecutive trades opened with protective SL under 3 seconds.",
      unlocked: true,
      xp: "+150 XP",
      icon: "🏆",
    },
    {
      id: "b2",
      title: "Zero Violation Week",
      desc: "Maintain Grade A+ (95+) across an entire Monday–Friday cycle.",
      unlocked: true,
      xp: "+150 XP",
      icon: "🏆",
    },
    {
      id: "b3",
      title: "Cool-Headed Execution",
      desc: "Respect 100% of 15-minute post-loss cooldown windows.",
      unlocked: true,
      xp: "+100 XP",
      icon: "🏆",
    },
    {
      id: "b4",
      title: "Risk Architect",
      desc: "Keep average risk per trade below 0.80% across 25 sessions.",
      unlocked: true,
      xp: "+50 XP",
      icon: "🏆",
    },
    {
      id: "b5",
      title: "21-Day Shield Bearer",
      desc: "Complete 21 consecutive disciplined trading days (18/21).",
      unlocked: false,
      xp: "+250 XP",
      icon: "🔒",
    },
    {
      id: "b6",
      title: "Institutional Centurion",
      desc: "Reach 100 closed sessions with an average score above 92.",
      unlocked: false,
      xp: "+500 XP",
      icon: "🔒",
    },
  ];

  /* -------------------------------------------------------------------------
     VAULT REWARDS DATA
  ------------------------------------------------------------------------- */
  const vaultRewards: VaultReward[] = [
    {
      id: "prop20",
      title: "20% Prop Challenge Discount",
      desc: "Instant voucher valid on $50k & $100k evaluation accounts.",
      cost: 500,
      tag: "POPULAR",
    },
    {
      id: "vps",
      title: "30-Day Low-Latency MT5 VPS",
      desc: "1.2ms Equinix LD4 server hosting for automated Risk Guard.",
      cost: 350,
      tag: "INFRASTRUCTURE",
    },
    {
      id: "rebate",
      title: "$50 Raw Spread Cashback",
      desc: "Direct commission rebate credited to Exness-Real #88412.",
      cost: 750,
      tag: "CASH REWARD",
    },
  ];

  /* -------------------------------------------------------------------------
     HANDLERS
  ------------------------------------------------------------------------- */
  const handleOpenRuleModal = (rule: ComplianceRule) => {
    setActiveAuditModal({
      isOpen: true,
      badge: rule.auditBadge,
      title: rule.auditTitle,
      summary: rule.auditSummary,
      stats: rule.auditStats,
    });
  };

  const handleOpenDayModal = (day: WeeklyDayRecord) => {
    setActiveAuditModal({
      isOpen: true,
      badge: `${day.grade} · ${day.score}/100`,
      title: `Session Audit — ${day.day}`,
      summary: day.note,
      stats: [
        { label: "Executions", value: day.trades },
        { label: "Pairs Traded", value: day.pair },
        { label: "Session Return", value: day.net },
      ],
    });
  };

  const handleRedeemReward = (reward: VaultReward) => {
    if (xp < reward.cost || redeemedRewards.has(reward.id)) return;
    setXp((prev) => prev - reward.cost);
    setRedeemedRewards((prev) => new Set(prev).add(reward.id));
    toast.success(`Claimed: ${reward.title}`, {
      description: `Debited ${reward.cost} XP. Voucher code dispatched to your profile.`,
    });
  };

  const handleReplayBars = () => {
    setReplayKey((k) => k + 1);
    toast.success("Synced & Replayed", {
      description: "Live MT5 compliance animation refreshed.",
    });
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Rewards" }]} noScroll={true} noPadding={true}>
      {/* ── CUSTOM ARCHITECTURAL STYLES ── */}
      <style>{`
        /* Uiverse.io 3D loaderBar Animation */
        @keyframes uiverseStripeMove {
          0% { background-position: 0 0; }
          100% { background-position: 64px 0; }
        }
        @keyframes uiverseLightShimmer {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 1; filter: brightness(1.14); }
        }
        .uiverse-stripe-bar {
          animation: uiverseStripeMove 3.2s linear infinite, uiverseLightShimmer 2s ease-in-out infinite;
          background-size: 64px 100% !important;
        }

        /* Flame animation */
        @keyframes flamePulse {
          0%, 100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.45)); }
          50% { transform: scale(1.08) rotate(2deg); filter: drop-shadow(0 0 13px rgba(251, 146, 60, 0.8)); }
        }
        .animate-flame {
          animation: flamePulse 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }

        /* XP Bar Shimmer */
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        .bar-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent);
          animation: shimmerSweep 3.2s infinite ease-in-out;
        }
      `}</style>

      <div className="flex-1 h-full min-h-0 bg-[#F7F8FA] dark:bg-[#141416] flex flex-col overflow-hidden font-sans transition-colors">
        {/* ── Pinned Header Row (Exactly matches Dashboard, Journal & Home) ── */}
        <header className="shrink-0 bg-[#F7F8FA]/95 dark:bg-[#141416]/95 backdrop-blur-md z-20 border-b border-slate-200/70 dark:border-white/[0.07]">
          <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <h1 className="text-[19px] sm:text-[21px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                Rewards
              </h1>
            </div>
          </div>
        </header>

        {/* ── Scrollable Body Area (Matching Dashboard & Journal) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 sm:px-6 pt-3.5 pb-12 scroll-smooth">
          <div className="w-full max-w-[1440px] mx-auto space-y-4 sm:space-y-5">

        {/* =========================================================================
            HERO ROW (12-COL GRID) — MATCHING DASHBOARD/JOURNAL CARD STYLING
            Card 1: Discipline Status & Identity (6 cols)
            Card 2: Trading Streak (3 cols)
            Card 3: Trader Rank & XP (3 cols)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-5 sm:mb-6">
          
          {/* Card A: Trader Identity, Live Status & Telemetry Chips (6 cols - Unboxed Hero Style like Dashboard) */}
          <div className="lg:col-span-6 px-1 py-1 flex flex-col justify-between gap-3">
            
            {/* Top row: Status header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  DISCIPLINE STATUS
                </span>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MT5 Server - Live
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <CheckCircle2 size={12} />
                <span>Session Finalized</span>
              </span>
            </div>

            {/* Middle row: Avatar + Name + 3 Right-aligned Stat Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              
              {/* User avatar and name */}
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl p-[2px] bg-gradient-to-tr from-[#006DFE] to-cyan-400 shadow-md">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-base font-black overflow-hidden">
                      NH
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006DFE] border-2 border-white dark:border-[#17171A] flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      Nikhil Harake
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-0.5">
                    Level 1 Pro MT5 Trader
                  </p>
                </div>
              </div>

              {/* 3 Stat Chips: ACCOUNT, RISK CAP, STREAK */}
              <div className="flex items-center gap-2 text-center">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs">
                  <div className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    ACCOUNT
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    #88412
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs">
                  <div className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    RISK CAP
                  </div>
                  <div className="text-xs font-mono font-bold text-[#006DFE] dark:text-blue-400 mt-0.5">
                    1.0%
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs">
                  <div className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    STREAK
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    6W Net
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card B: Trading Streak (3 cols) */}
          <div className={`lg:col-span-3 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                Trading Streak
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/30">
                <span className="animate-flame">🔥</span>
                <span>Active</span>
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {streakDays} Days
                </div>
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  21d Shield · 3 days left
                </div>
              </div>

              {/* Circular Mini Ring (18 / 21) */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${(18 / 21) * 100}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200">
                  18/21
                </span>
              </div>
            </div>

            {/* Segmented 7-block week progress */}
            <div className="grid grid-cols-7 gap-1 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
              {[1, 2, 3, 4, 5, 6, 7].map((b) => (
                <div
                  key={b}
                  className={`h-1.5 rounded-full ${
                    b <= 6
                      ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                      : "bg-slate-200 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card C: Trader Rank & XP Progress (3 cols) */}
          <div className={`lg:col-span-3 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                Trader Rank
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/30">
                <Star size={11} className="fill-purple-500 text-purple-500" />
                <span>Lv 2 Perks</span>
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Level 1
                </div>
                <div className="text-xs font-mono font-bold text-slate-500 dark:text-neutral-400 tabular-nums">
                  {xp} / 1,000 XP
                </div>
              </div>
              <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                {1000 - xp} XP to Lv 2
              </div>
            </div>

            {/* Shimmering XP progress bar */}
            <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden bar-shimmer">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#006DFE] via-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(xp / 1000) * 100}%` }}
              />
            </div>
          </div>

        </div>

        {/* =========================================================================
            CORE BENTO ROW (12 COLS):
            Left (5 cols): Forex Discipline Rating Semi-Circular Notch Gauge
            Right (7 cols): Discipline Curve AreaChart with heavier fill, no top line, faded edges
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-5 sm:mb-6">
          
          {/* ── LEFT (5 COLS): FOREX DISCIPLINE RATING GAUGE ── */}
          <div className={`lg:col-span-5 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3 select-none`}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Forex Discipline Rating
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
                  Real-time MT5 compliance
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                ● GRADE A+
              </span>
            </div>

            {/* Semicircle Gauge with Rounded Notches Shaded from First Colour to Last */}
            <div className="relative flex flex-col items-center justify-center py-2">
              <div className="mx-auto w-full max-w-sm">
                <Gauge
                  ariaLabel="Gauge - Semicircle"
                  centerValue={`${clampedScore}%`}
                  defaultLabel="Forex Discipline"
                  endAngle={360}
                  notchCornerRadius={3}
                  startAngle={180}
                  suffix="%"
                  useGradient
                  value={clampedScore}
                />
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE]" />
                <span>GRADE A+ · Top 4% of Traders</span>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/[0.06] text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} />
                <span>Stop Loss: 100% Verified</span>
              </span>
              <span className="text-slate-400 dark:text-neutral-500 font-medium">0 Violations</span>
            </div>
          </div>

          {/* ── RIGHT (7 COLS): DISCIPLINE CURVE AREA CHART (FADED EDGES, NO TOP LINE, HEAVIER FILL) ── */}
          <div className={`lg:col-span-7 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3 select-none`}>
            
            {/* Header & Timeframe Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06] gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  <TrendingUp size={15} className="text-[#006DFE]" />
                  <span>Discipline Curve</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
                  Closed trade equity curve
                </p>
              </div>

              {/* Dashboard-Style Range Switcher */}
              <div className="inline-flex items-center p-0.5 rounded-[10px] bg-slate-200/70 dark:bg-white/[0.07] self-start sm:self-auto">
                {(["7D", "14D", "All"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setActiveRange(range)}
                    className={`px-3 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
                      activeRange === range
                        ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-[0_1px_4px_rgba(15,23,42,0.09)]"
                        : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline Metric Row */}
            <div className="flex items-baseline gap-3 my-0.5">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                {activeDataset.headline}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <TrendingUp size={12} />
                <span>{activeDataset.delta}</span>
              </span>
            </div>

            {/* AreaChart: Heavier fill, no top line, gradient stopping short of transparent, edges faded out */}
            <div className="w-full">
              <AreaChart
                ariaLabel="Area Chart - Fill"
                aspectRatio="5 / 2"
                data={activeDataset.points}
              >
                <Grid horizontal />
                <Area
                  dataKey="score"
                  fadeEdges
                  fillOpacity={0.6}
                  gradientToOpacity={0.05}
                  label="Discipline"
                  showLine={false}
                />
                <XAxis />
                <ChartTooltip />
              </AreaChart>
            </div>

            {/* Bottom Summary Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] font-mono text-slate-400 dark:text-neutral-500">
              <span>{activeDataset.sessions}</span>
              <span className="font-bold text-[#006DFE] dark:text-blue-400">
                {activeDataset.scoreLabel}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTERED FLOATING NAVIGATION DOCK
        ========================================================================= */}
        <div className="flex justify-center my-6">
          <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/75 dark:border-white/[0.08] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none backdrop-blur-md">
            {[
              { id: "discipline", label: "Discipline", icon: <Shield size={14} className="stroke-[2.2]" /> },
              { id: "streak", label: "Daily Streak", icon: <Flame size={14} className="text-amber-500" /> },
              { id: "badges", label: "Badges (6)", icon: <Trophy size={14} className="text-yellow-500" /> },
              { id: "vault", label: "Vault", icon: <Gift size={14} className="text-emerald-500" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#006DFE] text-white shadow-[0_2px_10px_rgba(0,109,254,0.38)]"
                      : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB CONTENT PANELS
        ========================================================================= */}

        {/* ── PANEL 1: DISCIPLINE ── */}
        {activeTab === "discipline" && (
          <div className="space-y-5">
            
            {/* Rule Compliance Parameters Card (with exact Uiverse 3D Horizontal Bars) */}
            <div className={`${CARD_BASE} p-4 sm:p-5`}>
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-white/[0.06] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                      <Shield size={14} className="stroke-[2.2]" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      Rule Compliance Parameters
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5 pl-8 font-medium">
                    Synced with your Exness MT5 account &amp; live Risk Guard enforcer. Click any parameter to inspect audit logs.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto pl-8 sm:pl-0">
                  <button
                    type="button"
                    onClick={handleReplayBars}
                    className="tactile-white-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Replay Sync</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-[10.5px] font-mono font-bold text-[#006DFE] dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE] animate-pulse" />
                    <span>Score: {score}/100</span>
                  </div>
                </div>
              </div>

              {/* 2x2 Interactive Rule Cards with Exact Uiverse .loaderBar */}
              <div key={replayKey} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {complianceRules.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => handleOpenRuleModal(rule)}
                    className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] hover:border-[#006DFE]/40 dark:hover:border-[#006DFE]/40 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                  >
                    {/* Top: Title & Badge */}
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {rule.icon}
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#006DFE] transition-colors">
                            {rule.title}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate pl-5">
                          {rule.subtitle}
                        </p>
                      </div>

                      <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap shrink-0 tabular-nums bg-white dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10">
                        {rule.badgeText}
                      </span>
                    </div>

                    {/* Bottom: 3D Horizontal Bar + Percentage */}
                    <div className="flex items-center gap-2.5 w-full pt-1">
                      {/* 3D Track with inset shadow */}
                      <div className="relative flex-1 h-[10px] rounded-full bg-[#EAEFF5] dark:bg-[#080C14] border border-slate-300/80 dark:border-[#006DFE]/40 p-[1px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                        {/* 3D Horizontal Striped Loader Bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${rule.value}%` }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            background:
                              rule.colorType === "green"
                                ? "repeating-linear-gradient(45deg, #059669 0 16px, #10B981 16px 32px)"
                                : rule.colorType === "amber"
                                ? "repeating-linear-gradient(45deg, #D97706 0 16px, #F59E0B 16px 32px)"
                                : "repeating-linear-gradient(45deg, #0031F2 0 16px, #006DFE 16px 32px)",
                            boxShadow:
                              rule.colorType === "green"
                                ? "0 1px 6px rgba(16,185,129,0.35), inset 0 1px 1px rgba(255,255,255,0.6)"
                                : rule.colorType === "amber"
                                ? "0 1px 6px rgba(245,158,11,0.35), inset 0 1px 1px rgba(255,255,255,0.6)"
                                : "0 1px 6px rgba(0,109,254,0.4), inset 0 1px 1px rgba(255,255,255,0.6)",
                          }}
                          className="uiverse-stripe-bar h-full rounded-full relative overflow-hidden"
                        >
                          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none rounded-t-full" />
                          <div className="absolute inset-x-0 bottom-0 h-[30%] bg-black/20 pointer-events-none rounded-b-full" />
                        </motion.div>
                      </div>

                      <span
                        className={`text-[11px] font-mono font-extrabold tabular-nums shrink-0 min-w-[32px] text-right ${
                          rule.colorType === "green"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : rule.colorType === "amber"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-[#006DFE] dark:text-blue-400"
                        }`}
                      >
                        {rule.percentageText}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Unified Forex 24/5 Session Rhythm Bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-xs shrink-0">
                    🌐
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                      Forex 24/5 Session Rhythm
                    </span>
                    <span className="text-[10.5px] text-slate-400 dark:text-neutral-500 font-medium hidden sm:inline">
                      Continuous live sync · Auto-locks midnight 00:00 MT5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">SYD</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">TYO</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] font-bold">
                      LDN ●
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-bold">
                      NYC ●
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    London &amp; NY Sessions Active
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Consistency Log (6 Cards matching Dashboard/Journal styling) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Weekly Consistency Log
                  </span>
                  <span className="text-slate-400 dark:text-neutral-500">
                    · Click any session day for trade audit
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10.5px] font-mono font-bold text-slate-500 dark:text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    A+ (95+)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE]" />
                    A (85–94)
                  </span>
                </div>
              </div>

              {/* 6 Day Cards in a row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {weeklyDays.map((day) => {
                  const isAPlus = day.tier === "A+";
                  const dotColor = isAPlus ? "bg-emerald-500" : "bg-[#006DFE]";
                  const gradeColor = isAPlus
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/70 dark:border-emerald-500/20"
                    : "text-[#006DFE] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/20";

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleOpenDayModal(day)}
                      className={`p-4 ${CARD_BASE} hover:border-[#006DFE]/50 dark:hover:border-[#006DFE]/50 transition-all cursor-pointer flex flex-col items-center justify-between gap-3 text-center group`}
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                        <span>{day.dayHeader}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      </div>

                      <div>
                        <div className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-400">
                          {day.day}
                        </div>
                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums mt-0.5 group-hover:text-[#006DFE] transition-colors">
                          {day.score}
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${gradeColor}`}>
                        {day.grade}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── PANEL 2: DAILY STREAK ROADMAP ── */}
        {activeTab === "streak" && (
          <div className={`${CARD_BASE} p-5 sm:p-6 space-y-6`}>
            
            {/* Header with multiplier card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 dark:border-white/[0.06] gap-4">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  21-DAY STREAK SHIELD CHALLENGE
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  18 Consecutive Disciplined Sessions
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-xl font-medium">
                  Complete 3 more violation-free sessions to unlock an automatic Streak Shield that protects your multiplier on volatile news days.
                </p>
              </div>

              {/* Right: Current Multiplier Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 self-start md:self-auto min-w-[200px]">
                <span className="text-2xl animate-flame">🔥</span>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Current Multiplier
                  </div>
                  <div className="text-xl font-black text-amber-900 dark:text-amber-200 mt-0.5 tabular-nums">
                    1.35x XP
                  </div>
                </div>
              </div>
            </div>

            {/* 21-Day Milestone Tracker Grid */}
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-3">
                21-Day Milestone Tracker (Nov 4 – Nov 24)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {Array.from({ length: 21 }, (_, idx) => {
                  const day = idx + 1;
                  const isCompleted = day <= streakDays;
                  const isShieldDay = day === 21;

                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isCompleted
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                          : isShieldDay
                          ? "bg-[#006DFE]/10 border-dashed border-[#006DFE]/40 text-[#006DFE] dark:text-blue-300"
                          : "bg-slate-50 dark:bg-[#121826] border-slate-200/70 dark:border-white/5 opacity-60 text-slate-500"
                      }`}
                    >
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-400">
                          DAY {String(day).padStart(2, "0")}
                        </div>
                        <div className="text-xs font-bold mt-0.5">
                          {isCompleted ? "Verified" : isShieldDay ? "21d Shield" : "Upcoming"}
                        </div>
                      </div>
                      <span className="text-base">{isCompleted ? "🔥" : isShieldDay ? "🛡️" : "⏳"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── PANEL 3: BADGES ── */}
        {activeTab === "badges" && (
          <div className={`${CARD_BASE} p-5 sm:p-6 space-y-5`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Trader Discipline Badges (4 / 6 Unlocked)
                </h3>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5 font-medium">
                  Verified on-chain telemetry achievements earned through consistent MT5 risk execution.
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 self-start sm:self-auto">
                +450 XP Earned from Badges
              </span>
            </div>

            {/* 6 Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {badgesData.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                    b.unlocked
                      ? "bg-slate-50/80 dark:bg-[#121826] border-slate-200/80 dark:border-white/10"
                      : "bg-slate-50/40 dark:bg-[#121826]/40 border-dashed border-slate-200 dark:border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      b.unlocked ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                    }`}>
                      {b.icon}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        b.unlocked
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-200 dark:bg-white/10 text-slate-500"
                      }`}
                    >
                      {b.xp}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">{b.desc}</p>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {b.unlocked ? "✓ Unlocked & Synced" : "In Progress"}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ── PANEL 4: VAULT ── */}
        {activeTab === "vault" && (
          <div className={`${CARD_BASE} p-5 sm:p-6 space-y-5`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Institutional Rewards Vault
                </h3>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5 font-medium">
                  Redeem your Grade A+ discipline score and XP balance for institutional trading perks.
                </p>
              </div>

              <div className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 text-xs font-mono font-bold self-start sm:self-auto">
                Available Balance: {xp} XP
              </div>
            </div>

            {/* 3 Vault Perk Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vaultRewards.map((reward) => {
                const isClaimed = redeemedRewards.has(reward.id);
                const canAfford = xp >= reward.cost;

                return (
                  <div
                    key={reward.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200/90 dark:border-white/10 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-none flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#006DFE]/15 text-[#006DFE] dark:text-blue-400 uppercase">
                          {reward.tag}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                          {reward.cost} XP
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {reward.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        {reward.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isClaimed || !canAfford}
                      onClick={() => handleRedeemReward(reward)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isClaimed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default"
                          : canAfford
                          ? "bg-[#006DFE] hover:bg-blue-600 text-white shadow-[0_2px_10px_rgba(0,109,254,0.38)]"
                          : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isClaimed
                        ? "✓ Voucher Claimed"
                        : canAfford
                        ? `Redeem for ${reward.cost} XP`
                        : "Insufficient XP"}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =========================================================================
            AUDIT INSPECTION MODAL DRAWER
        ========================================================================= */}
        <AnimatePresence>
          {activeAuditModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveAuditModal((prev) => ({ ...prev, isOpen: false }))}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-10"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#006DFE]/15 text-[#006DFE] dark:text-blue-400">
                      {activeAuditModal.badge}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeAuditModal.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveAuditModal((prev) => ({ ...prev, isOpen: false }))}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-neutral-300">
                  <p className="leading-relaxed">{activeAuditModal.summary}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {activeAuditModal.stats.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#182030] border border-slate-200/70 dark:border-white/5"
                      >
                        <div className="text-[11px] text-slate-400 dark:text-neutral-400">
                          {s.label}
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0E131E] border-t border-slate-100 dark:border-white/[0.08] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveAuditModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-[#006DFE] text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Close Audit View
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
