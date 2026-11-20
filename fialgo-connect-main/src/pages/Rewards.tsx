import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Gift, 
  CircleDollarSign,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  Check,
  Flame,
  Calendar,
  Share2,
  Copy,
  BookOpen,
  Users,
  BrainCircuit,
  ShieldAlert,
  Medal,
  Award,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Activity,
  Layers,
  Coins
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { 
  getGamificationState, 
  addXP, 
  unlockBenefit, 
  GamificationState,
  saveGamificationState
} from "@/utils/gamification";
import {
  getForexDisciplineState,
  wrapUpForexSession,
  ForexDisciplineState
} from "@/utils/disciplineScore";

const CARD_SURFACE =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

// --- Achievement Definition ---
interface Achievement {
  id: string;
  category: "risk" | "forex" | "algo" | "habit";
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Risk & Discipline
  {
    id: "iron_sl",
    category: "risk",
    title: "Iron Stop-Loss",
    description: "Execute 25 MT5 positions with strict Stop Loss without moving it backwards.",
    icon: "🛡️",
    xpReward: 400,
    currentProgress: 25,
    maxProgress: 25,
    isUnlocked: true,
    unlockedDate: "Nov 18, 2026",
  },
  {
    id: "revenge_shield",
    category: "risk",
    title: "Revenge Immunity",
    description: "Complete 10 consecutive trading sessions with 0 revenge trade violations.",
    icon: "🧘",
    xpReward: 500,
    currentProgress: 10,
    maxProgress: 10,
    isUnlocked: true,
    unlockedDate: "Nov 19, 2026",
  },
  {
    id: "prop_drawdown",
    category: "risk",
    title: "Prop Firm Ready",
    description: "Maintain < 4% max drawdown over 30 consecutive trading days.",
    icon: "💼",
    xpReward: 1500,
    currentProgress: 22,
    maxProgress: 30,
    isUnlocked: false,
  },
  {
    id: "zero_margin_call",
    category: "risk",
    title: "Account Fortress",
    description: "Execute 50 closed trades while maintaining margin level > 250%.",
    icon: "🏰",
    xpReward: 750,
    currentProgress: 38,
    maxProgress: 50,
    isUnlocked: false,
  },

  // Forex & Execution
  {
    id: "gold_sniper",
    category: "forex",
    title: "Gold (XAU/USD) Sniper",
    description: "Execute 5 consecutive winning Gold trades with > 1:2 Risk/Reward ratio.",
    icon: "🪙",
    xpReward: 500,
    currentProgress: 5,
    maxProgress: 5,
    isUnlocked: true,
    unlockedDate: "Nov 17, 2026",
  },
  {
    id: "london_breakout",
    category: "forex",
    title: "London Session Pro",
    description: "Capture 15 winning setups executed during high-volume London open.",
    icon: "🇬🇧",
    xpReward: 600,
    currentProgress: 11,
    maxProgress: 15,
    isUnlocked: false,
  },
  {
    id: "ny_reversal",
    category: "forex",
    title: "New York Power Hour",
    description: "Capture 10 profitable trend continuation trades during NY overlap.",
    icon: "🗽",
    xpReward: 650,
    currentProgress: 7,
    maxProgress: 10,
    isUnlocked: false,
  },
  {
    id: "rr_hunter",
    category: "forex",
    title: "3R Profit Hunter",
    description: "Close 3 trades that hit full 1:3 R:R target without manual early exit.",
    icon: "🎯",
    xpReward: 700,
    currentProgress: 3,
    maxProgress: 3,
    isUnlocked: true,
    unlockedDate: "Nov 19, 2026",
  },

  // Algo Bots & FiAlgo
  {
    id: "fialgo_pilot",
    category: "algo",
    title: "FiAlgo V1 EA Commander",
    description: "Connect Exness MT5 account and activate FiAlgo V1 automated trading EA.",
    icon: "🤖",
    xpReward: 1000,
    currentProgress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedDate: "Nov 16, 2026",
  },
  {
    id: "bot_consistency",
    category: "algo",
    title: "Autonomous Consistency",
    description: "Run algorithmic bots for 5 consecutive winning sessions.",
    icon: "⚡",
    xpReward: 850,
    currentProgress: 4,
    maxProgress: 5,
    isUnlocked: false,
  },
  {
    id: "multi_strategy",
    category: "algo",
    title: "Multi-Strategy Fleet",
    description: "Deploy 3 concurrent EA bot strategies across EUR/USD, GBP/USD and Gold.",
    icon: "🚢",
    xpReward: 1200,
    currentProgress: 2,
    maxProgress: 3,
    isUnlocked: false,
  },

  // Habit & Community
  {
    id: "month_of_steel",
    category: "habit",
    title: "Month of Steel",
    description: "Maintain a 30-day continuous login, trading & discipline streak.",
    icon: "🔥",
    xpReward: 2000,
    currentProgress: 16,
    maxProgress: 30,
    isUnlocked: false,
  },
  {
    id: "journal_monk",
    category: "habit",
    title: "Journaling Monk",
    description: "Log detailed emotional reflections for 20 closed MT5 trades.",
    icon: "📖",
    xpReward: 450,
    currentProgress: 16,
    maxProgress: 20,
    isUnlocked: false,
  },
  {
    id: "mentor_share",
    category: "habit",
    title: "Ecosystem Builder",
    description: "Refer 2 active verified Forex traders who connect MT5 accounts.",
    icon: "👥",
    xpReward: 1000,
    currentProgress: 2,
    maxProgress: 2,
    isUnlocked: true,
    unlockedDate: "Nov 15, 2026",
  },
];

// Historical Chart Data for Discipline & Consistency Curve
const CHART_HISTORY_DATA = [
  { date: "Nov 5", score: 82, xp: 2100, trades: 3 },
  { date: "Nov 7", score: 86, xp: 2350, trades: 4 },
  { date: "Nov 9", score: 84, xp: 2500, trades: 2 },
  { date: "Nov 11", score: 90, xp: 2800, trades: 3 },
  { date: "Nov 13", score: 88, xp: 2980, trades: 3 },
  { date: "Nov 15", score: 94, xp: 3250, trades: 2 },
  { date: "Nov 16", score: 92, xp: 3450, trades: 3 },
  { date: "Nov 17", score: 88, xp: 3600, trades: 4 },
  { date: "Nov 18", score: 95, xp: 3820, trades: 3 },
  { date: "Nov 19", score: 94, xp: 4000, trades: 2 },
  { date: "Nov 20", score: 96, xp: 4150, trades: 3 },
];

// ── Semi-Circular Speedometer Gauge (Inspired by DisputeFox & Wellness dashboards) ──
function DisciplineSemiGauge({ score = 96, grade = "A+" }: { score: number; grade: string }) {
  const r = 68;
  const cx = 100;
  const cy = 82;
  const c = Math.PI * r; // ~213.6
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dashOffset = c * (1 - pct);
  const angleRad = Math.PI * (1 - pct);
  const pinX = cx + r * Math.cos(angleRad);
  const pinY = cy - r * Math.sin(angleRad);

  return (
    <div className="relative w-full max-w-[220px] mx-auto flex flex-col items-center">
      <svg viewBox="0 0 200 98" className="w-full overflow-visible">
        <defs>
          <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="28%" stopColor="#F59E0B" />
            <stop offset="68%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-slate-100 dark:text-white/[0.08]"
        />

        {/* Foreground Animated Gauge */}
        <motion.path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#scoreGaugeGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Illuminated Needle Puck (from DisputeFox & Wellness designs) */}
        <motion.circle
          cx={pinX}
          cy={pinY}
          r="5.5"
          fill="#06B6D4"
          stroke="#ffffff"
          strokeWidth="2.5"
          className="drop-shadow-[0_2px_6px_rgba(6,182,212,0.6)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        />

        {/* Min / Max Labels */}
        <text x="24" y="94" fontSize="9" fontWeight="700" fill="#94A3B8" textAnchor="middle">0</text>
        <text x="176" y="94" fontSize="9" fontWeight="700" fill="#94A3B8" textAnchor="middle">100</text>
      </svg>

      {/* Centered Score Inside Arc */}
      <div className="absolute top-[26px] inset-x-0 flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-[42px] font-black text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
            {score}
          </span>
          <span className="text-xs font-bold text-slate-400">/ 100</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/25">
            GRADE {grade}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
            ▲ +4 pts
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Striped Target Progress Meter (Inspired by Total Project & Wellness widgets) ──
function StripedProgressMeter({
  value,
  max = 100,
  label,
  valueLabel,
  subLabel,
  color = "emerald",
}: {
  value: number;
  max?: number;
  label: string;
  valueLabel: string;
  subLabel: string;
  color?: "emerald" | "blue" | "indigo" | "amber";
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="p-4 rounded-[14px] bg-[#F7F8FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-slate-900 dark:text-white">{label}</span>
        <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tabular-nums">{valueLabel}</span>
      </div>

      {/* Dual Track: Striped tick mark background + Glowing gradient pill + Handle needle */}
      <div className="relative w-full h-3 rounded-full bg-slate-200/50 dark:bg-white/[0.06] overflow-visible flex items-center">
        <div 
          className="absolute inset-0 rounded-full opacity-40 dark:opacity-20 overflow-hidden"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, #64748b 3px, #64748b 4px)",
          }}
        />

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full relative ${
            color === "emerald"
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : color === "blue"
              ? "bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
              : color === "amber"
              ? "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              : "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          }`}
        />

        {/* Pin marker / handle from Image 6 */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2 h-4.5 rounded-full bg-slate-900 dark:bg-white shadow-[0_2px_4px_rgba(0,0,0,0.35)] border border-white dark:border-slate-800 pointer-events-none transition-all duration-700 z-10"
          style={{ left: `calc(${pct}% - 4px)` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{subLabel}</span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

export default function Rewards() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "discipline" | "streak" | "achievements" | "vault") || "discipline";
  
  const [activeTab, setActiveTab] = useState<"discipline" | "streak" | "achievements" | "vault">(initialTab);
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "14D" | "30D" | "All">("14D");
  const [chartMetric, setChartMetric] = useState<"discipline" | "risk" | "sl" | "xp">("discipline");
  const [gamState, setGamState] = useState<GamificationState>(getGamificationState);
  const [disciplineState, setDisciplineState] = useState<ForexDisciplineState>(getForexDisciplineState);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "risk" | "forex" | "algo" | "habit">("all");
  const [isWrapping, setIsWrapping] = useState(false);
  const [userName, setUserName] = useState("Trader");

  // Sync state on events
  useEffect(() => {
    const handleXPUpdate = () => {
      setGamState(getGamificationState());
    };
    const handleDisciplineUpdate = (e: any) => {
      if (e?.detail) setDisciplineState(e.detail);
      else setDisciplineState(getForexDisciplineState());
    };

    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    window.addEventListener("tradifive_discipline_update", handleDisciplineUpdate);

    // Fetch user name
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader";
        setUserName(name);
      }
    });

    return () => {
      window.removeEventListener("tradifive_xp_update", handleXPUpdate);
      window.removeEventListener("tradifive_discipline_update", handleDisciplineUpdate);
    };
  }, []);

  // Filtered Chart Data based on timeframe
  const activeChartData = useMemo(() => {
    if (chartTimeframe === "7D") return CHART_HISTORY_DATA.slice(-5);
    if (chartTimeframe === "14D") return CHART_HISTORY_DATA.slice(-8);
    return CHART_HISTORY_DATA;
  }, [chartTimeframe]);

  // Metric Details based on selected chart metric (from Image 5)
  const metricValues = useMemo(() => {
    switch (chartMetric) {
      case "risk":
        return { headline: "100.0%", badge: "0 Violations", color: "#10B981" };
      case "sl":
        return { headline: "100.0%", badge: "Verified MT5", color: "#06B6D4" };
      case "xp":
        return { headline: `+${gamState.xp.toLocaleString()} XP`, badge: `Level ${gamState.level} Pro`, color: "#6366F1" };
      case "discipline":
      default:
        return { headline: "+96.0%", badge: "+4.8% this week", color: "#2563EB" };
    }
  }, [chartMetric, gamState.xp, gamState.level]);

  // Handle Manual Session Wrap
  const handleWrapUpSession = () => {
    setIsWrapping(true);
    setTimeout(() => {
      const res = wrapUpForexSession();
      setIsWrapping(false);
      if (res.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        toast.success(`🏁 Forex Session Finalized!`, {
          description: `Discipline Score: ${res.score}/100 (Grade ${res.grade}) • +${res.xpEarned} XP awarded!`,
        });
      } else {
        toast.info("Today's session is already wrapped! Return for the next session.");
      }
    }, 400);
  };

  // 7-Day Consistency Ladder Rewards
  const weeklyStreakRewards = [
    { day: 1, xp: 25, label: "+25 XP" },
    { day: 2, xp: 30, label: "+30 XP" },
    { day: 3, xp: 40, label: "+40 XP" },
    { day: 4, xp: 50, label: "+50 XP" },
    { day: 5, xp: 75, label: "+75 XP" },
    { day: 6, xp: 100, label: "+100 XP" },
    { day: 7, xp: 250, label: "Gold Chest", bonus: true },
  ];

  const [claimDay, setClaimDay] = useState(() => {
    return Number(localStorage.getItem("tradifive_consistency_day") || "4");
  });
  const [lastClaimDate, setLastClaimDate] = useState(() => {
    return localStorage.getItem("tradifive_last_checkin_date") || "";
  });

  const todayStr = new Date().toLocaleDateString("en-US");
  const isClaimedToday = lastClaimDate === todayStr;

  const handleClaimDailyCheckin = () => {
    if (isClaimedToday) {
      toast.info("Daily check-in already claimed! Streak saved for today.");
      return;
    }

    const currentReward = weeklyStreakRewards[claimDay - 1];
    addXP(currentReward.xp, `Day ${claimDay} Forex Consistency Check-In`, "Daily Bonus");
    
    localStorage.setItem("tradifive_last_checkin_date", todayStr);
    setLastClaimDate(todayStr);

    let nextDay = claimDay + 1;
    if (nextDay > 7) nextDay = 1;
    localStorage.setItem("tradifive_consistency_day", String(nextDay));
    setClaimDay(nextDay);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (_) {}

    if (currentReward.bonus) {
      toast.success("🎁 Week Gold Mystery Chest Unlocked!", {
        description: "You earned +250 XP, 5 Free AI Coach Credits, and a Gold Profile Aura!",
      });
      try {
        const remaining = Number(localStorage.getItem("tradifive_ai_credits_remaining") || "10") + 5;
        const max = Math.max(Number(localStorage.getItem("tradifive_ai_credits_max") || "10"), remaining);
        localStorage.setItem("tradifive_ai_credits_remaining", String(remaining));
        localStorage.setItem("tradifive_ai_credits_max", String(max));
        window.dispatchEvent(new CustomEvent("tradifive_credits_updated", { detail: { creditsRemaining: remaining, creditsMax: max } }));
      } catch (_) {}
    } else {
      toast.success(`Check-In Successful! Earned ${currentReward.label}`);
    }
  };

  // Redemption Vault Handlers
  const handleRedeemCoins = (itemTitle: string, costCoins: number, perkAction: () => void) => {
    if (gamState.bounty_balance < costCoins) {
      toast.error("Insufficient TradiCoins!", {
        description: `You need ${costCoins} coins to unlock this reward. Keep trading with high discipline to earn more coins!`,
      });
      return;
    }

    const newBalance = gamState.bounty_balance - costCoins;
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newEntry = {
      event: `Redeemed: ${itemTitle}`,
      date: dateStr,
      mult: "Perk",
      xp: `-${costCoins} Coins`,
    };

    const updated = {
      ...gamState,
      bounty_balance: newBalance,
      ledger: [newEntry, ...gamState.ledger],
    };

    saveGamificationState(updated);
    setGamState(updated);

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (_) {}

    perkAction();
  };

  const redeemAICredits = () => {
    handleRedeemCoins("+25 AI Coach Credits", 300, () => {
      try {
        const currentRemaining = Number(localStorage.getItem("tradifive_ai_credits_remaining") || "10");
        const currentMax = Number(localStorage.getItem("tradifive_ai_credits_max") || "10");
        const newRem = currentRemaining + 25;
        const newMax = Math.max(currentMax, newRem);
        localStorage.setItem("tradifive_ai_credits_remaining", String(newRem));
        localStorage.setItem("tradifive_ai_credits_max", String(newMax));
        window.dispatchEvent(new CustomEvent("tradifive_credits_updated", { detail: { creditsRemaining: newRem, creditsMax: newMax } }));
        toast.success("⚡ 25 AI Credits added to your account instantly!");
      } catch (_) {}
    });
  };

  const redeemEADiscount = () => {
    handleRedeemCoins("$20 FiAlgo Pass Discount", 800, () => {
      navigator.clipboard.writeText("FIALGO-PRO-20USD");
      toast.success("Coupon code FIALGO-PRO-20USD copied to clipboard!", {
        description: "Apply this code at checkout on /auto-trade or /upgrade for $20 off.",
      });
    });
  };

  const redeemTournamentPass = () => {
    handleRedeemCoins("$500 Forex Tournament Pass", 1200, () => {
      toast.success("🏆 Tournament Ticket Registered!", {
        description: "You have been entered into the next Monthly Forex MT5 Championship with free buy-in.",
      });
    });
  };

  const filteredAchievements = achievements.filter(
    (a) => achievementFilter === "all" || a.category === achievementFilter
  );

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Engagement" },
        { label: "Rewards & Gamification" }
      ]}
      noPadding={true}
    >
      <div className="w-full px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 select-none font-sans">
        
        {/* ══════ HERO SECTION: TRADER PRESTIGE & DISCIPLINE GRAPH (Journal-Style) ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* LEFT COMMAND CARD: LIVE SCORE & WRAP UP (40% width) */}
          <div className={`lg:col-span-5 ${CARD_SURFACE} p-5 sm:p-6 flex flex-col justify-between relative`}>
            {/* Top Row: User Level & Streak Flame */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                    {userName}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400 leading-tight">
                    Level {gamState.level} Pro MT5 Trader
                  </span>
                </div>
              </div>

              {/* Glowing Streak Flame */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                <Flame size={14} className="text-orange-500 fill-orange-500 shrink-0" />
                <span className="tabular-nums font-bold">
                  {disciplineState.streakDays} Days
                </span>
              </div>
            </div>

            {/* Center: Semi-Circular Speedometer Gauge (Inspired by DisputeFox & Wellness designs) */}
            <div className="my-2 p-3.5 rounded-[14px] bg-[#F7F8FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <span>Discipline Rating</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+150 XP today</span>
              </div>
              
              <DisciplineSemiGauge score={disciplineState.score} grade={disciplineState.grade} />

              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 text-center leading-snug mt-2">
                🛡️ 0 revenge violations &amp; 100% Stop Loss adherence across MT5 orders.
              </p>
            </div>

            {/* Bottom: Wrap Up Session Action */}
            <div className="space-y-1.5 mt-2">
              <button
                type="button"
                disabled={isWrapping || disciplineState.isSessionWrapped}
                onClick={handleWrapUpSession}
                className={`tactile-black-pill rounded-xl w-full py-2.5 text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  disciplineState.isSessionWrapped ? "opacity-60 cursor-not-allowed" : "shadow-sm hover:scale-[1.01]"
                }`}
              >
                <span>{disciplineState.isSessionWrapped ? "✅ Session Finalized for Today" : "🏁 Wrap Up Today's Session"}</span>
              </button>

              <div className="flex items-center justify-between text-[10.5px] text-slate-400 px-1 font-medium">
                <span>Forex runs 24/5 (Mon–Fri)</span>
                <span>Auto-locks at 00:00 MT5</span>
              </div>
            </div>
          </div>

          {/* RIGHT GRAPH CARD: DISCIPLINE & CONSISTENCY CURVE (60% width) */}
          <div className={`lg:col-span-7 ${CARD_SURFACE} p-5 sm:p-6 flex flex-col justify-between`}>
            {/* Graph Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-[#2563EB] dark:text-blue-400" />
                  <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    Discipline &amp; Consistency Curve
                  </h3>
                </div>
                <p className="text-[11.5px] text-slate-400 mt-0.5">
                  Psychology equity curve &amp; rule adherence over Forex sessions
                </p>
              </div>

              {/* Timeframe Switcher matching Journal */}
              <div className="inline-flex items-center p-0.5 rounded-[9px] bg-slate-100/90 dark:bg-white/[0.06] shrink-0 self-start sm:self-auto">
                {(["7D", "14D", "30D", "All"] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-[7px] text-[10.5px] font-semibold transition-all cursor-pointer ${
                      chartTimeframe === tf
                        ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Score & Coin Counters Above Chart */}
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {metricValues.headline}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                  {metricValues.badge}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                <span>🪙</span>
                <span className="tabular-nums font-bold">{gamState.bounty_balance.toLocaleString()}</span>
                <span className="text-slate-400">Coins</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[180px] sm:h-[195px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="disciplineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricValues.color} stopOpacity={0.20} />
                      <stop offset="95%" stopColor={metricValues.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94A3B8" 
                    fontSize={10.5} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    domain={[70, 100]} 
                    stroke="#94A3B8" 
                    fontSize={10.5} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-xl text-xs shadow-xl space-y-0.5 border border-white/10 dark:border-slate-200/50">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">{data.date}</span>
                            <div className="text-[12.5px] font-bold">{data.score}% Discipline</div>
                            <div className="text-[10px] text-slate-300 dark:text-slate-600">{data.trades} Closed MT5 Trades</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke={metricValues.color} 
                    strokeWidth={2.4} 
                    fillOpacity={1} 
                    fill="url(#disciplineGlow)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 4 Psychological Metric Switcher Buttons (Inspired by Image 5) */}
            <div className="flex items-center gap-1.5 pt-2 overflow-x-auto scrollbar-none">
              {[
                { id: "discipline", label: "Discipline Score" },
                { id: "risk", label: "Risk Guard" },
                { id: "sl", label: "Stop Loss Purity" },
                { id: "xp", label: "XP Velocity" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMetric(m.id as any)}
                  className={`px-2.5 sm:px-3 py-1 rounded-[8px] text-[10.5px] sm:text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    chartMetric === m.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold"
                      : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Insight Quote Pill (Inspired by Image 5) */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 text-[11.5px] text-slate-600 dark:text-slate-300 mt-2">
              <span className="shrink-0">🔥</span>
              <span className="truncate">Your trading psychology trended up <strong className="text-emerald-600 dark:text-emerald-400">+4.8%</strong> this week with <strong className="text-emerald-600 dark:text-emerald-400">0 revenge violations</strong>.</span>
            </div>

            {/* Quick Metrics Footer Under Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-white/5 mt-2 text-center sm:text-left">
              <div>
                <span className="text-[10px] sm:text-[10.5px] text-slate-400 uppercase font-semibold tracking-wider block">Stop Loss</span>
                <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-900 dark:text-white">100% Verified</span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[10.5px] text-slate-400 uppercase font-semibold tracking-wider block">Avg R:R</span>
                <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-900 dark:text-white">1 : 2.4</span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[10.5px] text-slate-400 uppercase font-semibold tracking-wider block">Violations</span>
                <span className="text-[12px] sm:text-[12.5px] font-bold text-emerald-600 dark:text-emerald-400">0 Violations</span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[10.5px] text-slate-400 uppercase font-semibold tracking-wider block">Total XP</span>
                <span className="text-[12px] sm:text-[12.5px] font-bold text-indigo-600 dark:text-indigo-400">+{gamState.xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ MODERN SEGMENTED TAB SWITCHER (Journal-Style) ══════ */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/5 gap-1 overflow-x-auto max-w-full scrollbar-none">
          {[
            { id: "discipline", label: "🛡️ Discipline Engine" },
            { id: "streak", label: "🔥 Daily Streak & Chest" },
            { id: "achievements", label: `🏆 Badges & Trophies (${achievements.filter(a => a.isUnlocked).length})` },
            { id: "vault", label: "🎁 Rewards & XP Vault" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-[9px] text-[12px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════ TAB 1: DISCIPLINE ENGINE ══════ */}
        {activeTab === "discipline" && (
          <div className={`${CARD_SURFACE} p-5 sm:p-6 space-y-5`}>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                Rule Compliance Parameters
              </h3>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Synchronized with your Exness MetaTrader 5 account and live Risk Guard settings.
              </p>
            </div>

            {/* 4 Striped Target Progress Meters (Inspired by Image 6 & Image 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <StripedProgressMeter
                value={100}
                max={100}
                label="MT5 Stop-Loss Protection"
                valueLabel="100% Verified"
                subLabel="Every order executed with protective SL"
                color="emerald"
              />
              <StripedProgressMeter
                value={95}
                max={100}
                label="Lot Sizing Rule"
                valueLabel="0.05–0.10 Lots"
                subLabel="Strict 1% account risk limit enforced"
                color="blue"
              />
              <StripedProgressMeter
                value={100}
                max={100}
                label="Revenge Trade Shield"
                valueLabel="0 Violations"
                subLabel="15-min cooldown respected post-loss"
                color="emerald"
              />
              <StripedProgressMeter
                value={75}
                max={100}
                label="Daily Trade Cap"
                valueLabel="3 / 4 Trades"
                subLabel="Under daily maximum execution limit"
                color="amber"
              />
            </div>

            {/* Weekly Discipline Calendar Cards */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                  Weekly Consistency Log
                </h4>
                <div className="flex items-center gap-3 text-[10.5px] font-medium text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Grade A+ (95+)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Grade A (85–94)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 sm:gap-3">
                {Object.values(disciplineState.calendarHistory).slice(-6).map((item) => (
                  <div 
                    key={item.date}
                    className="p-3 rounded-[14px] bg-[#F7F8FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 text-center space-y-1 hover:scale-[1.01] transition-transform"
                  >
                    <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <div className="text-[20px] font-bold text-slate-900 dark:text-white tabular-nums">
                      {item.score}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      GRADE {item.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ TAB 2: DAILY STREAK & 7-DAY LADDER (Duolingo Style from Image 3) ══════ */}
        {activeTab === "streak" && (
          <div className={`${CARD_SURFACE} p-5 sm:p-6 space-y-5`}>
            {/* Streak Hero Card with Ambient Watermark */}
            <div className="relative overflow-hidden p-5 sm:p-6 rounded-[16px] bg-gradient-to-b from-amber-500/[0.07] via-[#F7F8FA] to-[#F7F8FA] dark:from-amber-500/[0.05] dark:via-white/[0.02] dark:to-white/[0.02] border border-amber-500/20 dark:border-white/5 space-y-5">
              {/* Giant ambient watermark number in background */}
              <div className="absolute right-6 -top-4 text-[130px] sm:text-[160px] font-black text-amber-500/[0.07] dark:text-amber-500/[0.035] pointer-events-none select-none leading-none z-0">
                {disciplineState.streakDays}
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20 shrink-0">
                    🔥
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {disciplineState.streakDays}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Active Streak</span>
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      Consecutive trading days logging MT5 setups with 100% Stop Loss &amp; 0 revenge trades.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1D] border border-slate-200/70 dark:border-white/10 shadow-xs flex items-center gap-2">
                    <span className="text-base">⭐</span>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block tabular-nums">+{gamState.xp.toLocaleString()} XP</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Points</span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1D] border border-slate-200/70 dark:border-white/10 shadow-xs flex items-center gap-2">
                    <span className="text-base">❄️</span>
                    <div>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">1 Shield Active</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Streak Freeze</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forex 24/5 Trading Activity Heatmap (Inspired by Duolingo & DisputeFox from Image 3 & 1) */}
              <div className="relative z-10 pt-3 border-t border-slate-200/60 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Forex 24/5 Discipline Heatmap (Last 12 Weeks)</span>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[4px] bg-emerald-500 inline-block" /> A+ (95+)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[4px] bg-blue-500 inline-block" /> A (85–94)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[4px] bg-amber-400 inline-block" /> B (70–84)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[4px] bg-slate-200 dark:bg-white/10 inline-block" /> Rest</span>
                  </div>
                </div>

                {/* Heatmap Grid with Day Labels & Month Headers */}
                <div className="overflow-x-auto pb-1 scrollbar-none">
                  <div className="min-w-[540px] space-y-1">
                    {/* Month Headers (Duolingo style) */}
                    <div className="flex text-[10px] font-bold text-slate-400 pl-8">
                      <span className="w-1/3">September</span>
                      <span className="w-1/3">October</span>
                      <span className="w-1/3">November</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Day Labels Mon, Wed, Fri */}
                      <div className="flex flex-col justify-between h-[84px] text-[9.5px] font-bold text-slate-400 pr-1 select-none">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                      </div>

                      <div className="inline-grid grid-rows-5 grid-flow-col gap-1.5 flex-1">
                        {Array.from({ length: 60 }).map((_, i) => {
                          const scores = [96, 94, 98, 92, 88, 95, 96, 90, 85, 98, 94, 96, 92, 95, 88, 96, 94, 92, 98, 95];
                          const score = scores[i % scores.length];
                          const isUpcoming = i > 52;
                          const bgClass = isUpcoming
                            ? "bg-slate-200/60 dark:bg-white/[0.06]"
                            : score >= 95
                            ? "bg-emerald-500 shadow-xs shadow-emerald-500/20"
                            : score >= 88
                            ? "bg-blue-500 shadow-xs shadow-blue-500/20"
                            : "bg-amber-400 shadow-xs shadow-amber-400/20";

                          return (
                            <div
                              key={i}
                              title={isUpcoming ? "Upcoming session" : `Day ${i + 1}: ${score}% Discipline`}
                              className={`w-4 h-4 rounded-[4px] ${bgClass} transition-all hover:scale-125 cursor-pointer`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duolingo Streak Protection Capsule (from Image 3) */}
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-[14px] bg-white dark:bg-[#1A1A1D] border border-slate-200/70 dark:border-white/10 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">❄️</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Streak Freeze Protection</span>
                      <span className="text-[10.5px] text-slate-400">Covers missed Forex trading sessions automatically</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 text-xs">
                      <span>❄️</span>
                      <span>❄️</span>
                      <span>❄️</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 whitespace-nowrap">
                      1 SHIELD ACTIVE
                    </span>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Progressive Blocks */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                  7-Day Consistency Ladder &amp; Mystery Chest
                </h4>
                <span className="text-[11px] text-slate-400">Day 7 yields Gold Mystery Chest</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {weeklyStreakRewards.map((item) => {
                  const isCompleted = item.day < claimDay;
                  const isCurrent = item.day === claimDay && !isClaimedToday;
                  const isClaimedCurrent = item.day === claimDay && isClaimedToday;

                  return (
                    <div
                      key={item.day}
                      className={`p-3.5 rounded-[14px] border flex flex-col items-center justify-between text-center min-h-[115px] transition-all ${
                        isCompleted
                          ? "bg-[#F7F8FA]/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5 opacity-65 text-slate-400"
                          : isClaimedCurrent
                          ? "bg-emerald-50/70 dark:bg-emerald-500/[0.06] border-emerald-300 dark:border-emerald-500/30 text-emerald-600"
                          : isCurrent
                          ? "bg-white dark:bg-[#1E1E22] border-[#2563EB] dark:border-blue-500 shadow-md ring-1 ring-[#2563EB]/20 text-slate-900 dark:text-white scale-102"
                          : "bg-[#F7F8FA] dark:bg-white/[0.03] border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="text-[10.5px] font-bold uppercase tracking-wider">Day {item.day}</span>

                      <div className="my-2 flex items-center justify-center">
                        {isCompleted || isClaimedCurrent ? (
                          <Check size={18} className="text-emerald-500 stroke-[2.5]" />
                        ) : item.bonus ? (
                          <Crown size={20} className="text-amber-500 fill-amber-500/20 animate-bounce" />
                        ) : (
                          <Zap size={18} className="text-[#2563EB]" />
                        )}
                      </div>

                      <span className="text-[11px] font-bold leading-none">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-400 font-medium">
                {isClaimedToday ? "Streak saved for today! Next daily check-in opens tomorrow." : "Day 4 check-in ready to claim. Keep your momentum going!"}
              </span>

              <button
                type="button"
                onClick={handleClaimDailyCheckin}
                disabled={isClaimedToday}
                className={`tactile-black-pill rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isClaimedToday ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
                }`}
              >
                {isClaimedToday ? "Checked-In Today" : "Claim Daily Check-In 🔥"}
              </button>
            </div>
          </div>
        )}

        {/* ══════ TAB 3: MT5 BADGES & ACHIEVEMENTS ══════ */}
        {activeTab === "achievements" && (
          <div className={`${CARD_SURFACE} p-5 sm:p-6 space-y-5`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                  MetaTrader 5 Badges &amp; Trophies
                </h3>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Milestone badges earned directly through disciplined execution on MT5.
                </p>
              </div>

              {/* Category Filter matching Journal */}
              <div className="inline-flex items-center p-0.5 rounded-[9px] bg-slate-100/90 dark:bg-white/[0.06] shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
                {(["all", "risk", "forex", "algo", "habit"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAchievementFilter(cat)}
                    className={`px-2.5 py-1 rounded-[7px] text-[10.5px] font-semibold capitalize transition-all cursor-pointer ${
                      achievementFilter === cat
                        ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    {cat === "algo" ? "Algo Bots" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAchievements.map((badge) => {
                const percent = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-[14px] border transition-all flex items-start gap-3.5 ${
                      badge.isUnlocked
                        ? "bg-[#F7F8FA] dark:bg-white/[0.03] border-slate-200/70 dark:border-white/10"
                        : "bg-[#F7F8FA]/60 dark:bg-white/[0.015] border-slate-200/50 dark:border-white/5 opacity-80"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-xl shrink-0 border border-slate-200/70 dark:border-white/10 shadow-xs">
                      {badge.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
                          {badge.title}
                        </h4>
                        {badge.isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shrink-0">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-semibold text-slate-400 tabular-nums shrink-0">
                            {badge.currentProgress} / {badge.maxProgress}
                          </span>
                        )}
                      </div>

                      <p className="text-[11.5px] text-slate-400 mt-1 leading-snug">
                        {badge.description}
                      </p>

                      {!badge.isUnlocked && (
                        <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                          <div 
                            className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          +{badge.xpReward} XP
                        </span>
                        {badge.unlockedDate && (
                          <span className="text-slate-400 text-[10px]">
                            Unlocked on {badge.unlockedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════ TAB 4: REWARDS & XP VAULT (Spend Coins) ══════ */}
        {activeTab === "vault" && (
          <div className={`${CARD_SURFACE} p-5 sm:p-6 space-y-5`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Forex Rewards &amp; Benefit Vault
                </h3>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Exchange your hard-earned TradiCoins for instant AI Coaching, EA licenses & discounts.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10.5px] text-slate-400 font-medium block">Available Balance</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  🪙 {gamState.bounty_balance.toLocaleString()} Coins
                </span>
              </div>
            </div>

            {/* Store Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Perk 1: AI Coach Credits */}
              <div className="p-4.5 rounded-[16px] bg-[#F7F8FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/15 transition-all">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
                    ⚡
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                    +25 AI Coach Credits
                  </h4>
                  <p className="text-[11.5px] text-slate-400 leading-snug">
                    Instant credit top-up for Forex chart OCR, MT5 screenshot analysis, and trade breakdowns.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[13.5px] font-bold text-slate-900 dark:text-white block">300 Coins</span>
                    <span className="text-[10px] text-slate-400">Instant credit</span>
                  </div>
                  <button
                    type="button"
                    onClick={redeemAICredits}
                    className="tactile-black-pill rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Perk 2: EA Bot License Discount */}
              <div className="p-4.5 rounded-[16px] bg-[#F7F8FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/15 transition-all">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                    $20 FiAlgo Pass Discount
                  </h4>
                  <p className="text-[11.5px] text-slate-400 leading-snug">
                    Exclusive coupon code towards FiAlgo V1 automated MT5 EA license renewal or upgrade.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[13.5px] font-bold text-slate-900 dark:text-white block">800 Coins</span>
                    <span className="text-[10px] text-slate-400">Coupon code</span>
                  </div>
                  <button
                    type="button"
                    onClick={redeemEADiscount}
                    className="tactile-black-pill rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Perk 3: Forex Tournament Pass */}
              <div className="p-4.5 rounded-[16px] bg-[#F7F8FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/15 transition-all">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
                    🏆
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                    $500 Forex Tournament Pass
                  </h4>
                  <p className="text-[11.5px] text-slate-400 leading-snug">
                    Free ticket registration for the monthly global MetaTrader 5 trading championship.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[13.5px] font-bold text-slate-900 dark:text-white block">1,200 Coins</span>
                    <span className="text-[10px] text-slate-400">Free entry ticket</span>
                  </div>
                  <button
                    type="button"
                    onClick={redeemTournamentPass}
                    className="tactile-black-pill rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>

            {/* Partner & Referral Program Banner */}
            <div className="p-4.5 sm:p-5 rounded-[16px] bg-gradient-to-r from-indigo-50/80 via-[#F7F8FA] to-transparent dark:from-indigo-950/25 dark:via-white/[0.02] dark:to-transparent border border-indigo-200/70 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm shadow-indigo-500/20">
                  🤝
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">
                      Forex Partner &amp; Referral Program
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Earn Cash &amp; XP
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">
                    Introduce fellow MT5 traders. Earn ₹1,000–₹2,000 setup bonuses, +500 XP, and up to 10% weekly profit overrides.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/referrals")}
                className="tactile-black-pill rounded-xl px-4.5 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <span>Open Referral Program</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Historical XP & Coins Ledger */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Recent Rewards &amp; XP Activity
                </h4>
                <span className="text-[10.5px] text-slate-400">{gamState.ledger.length} transactions</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {gamState.ledger.slice(0, 6).map((entry, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white font-medium">{entry.event}</span>
                      <span className="text-[10px] text-slate-400">({entry.date})</span>
                    </div>
                    <span className={`font-bold tabular-nums ${
                      entry.xp.startsWith("-") ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {entry.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
