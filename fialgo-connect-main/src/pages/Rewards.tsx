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

export default function Rewards() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "discipline" | "streak" | "achievements" | "vault") || "discipline";
  
  const [activeTab, setActiveTab] = useState<"discipline" | "streak" | "achievements" | "vault">(initialTab);
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "14D" | "30D" | "All">("14D");
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
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-14 select-none">
        
        {/* ══════ HERO SECTION: TRADER PRESTIGE & DISCIPLINE GRAPH ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT COMMAND CARD: LIVE SCORE & WRAP UP (40% width) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/90 dark:border-white/10 figma-card-shadow p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Top Row: User Level & Streak Flame */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[14.5px] font-extrabold text-slate-900 dark:text-white leading-tight">
                    {userName}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400 leading-tight">
                    Level {gamState.level} Pro MT5 Trader
                  </span>
                </div>
              </div>

              {/* Glowing Streak Flame */}
              <div className="tactile-white-pill px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200 dark:border-white/10 shadow-xs">
                <Flame size={14} className="text-orange-500 fill-orange-500 shrink-0" />
                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                  {disciplineState.streakDays} Days
                </span>
              </div>
            </div>

            {/* Center: Large Discipline Meter */}
            <div className="my-5 p-4.5 rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-100/40 dark:from-white/[0.03] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Forex Discipline Rating
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  GRADE {disciplineState.grade}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {disciplineState.score}
                </span>
                <span className="text-base font-bold text-slate-400">/ 100</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                  +150 XP today
                </span>
              </div>

              {/* Smooth Gradient Fill Bar */}
              <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${disciplineState.score}%` }} 
                />
              </div>

              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-snug pt-0.5">
                🛡️ 0 revenge violations &amp; 100% Stop Loss adherence across MT5 orders.
              </p>
            </div>

            {/* Bottom: Wrap Up Session Action */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isWrapping || disciplineState.isSessionWrapped}
                onClick={handleWrapUpSession}
                className={`tactile-black-pill rounded-full w-full py-3 text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  disciplineState.isSessionWrapped ? "opacity-60 cursor-not-allowed" : "shadow-md hover:scale-[1.01]"
                }`}
              >
                <span>{disciplineState.isSessionWrapped ? "✅ Session Finalized for Today" : "🏁 Wrap Up Today's Session"}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
                <span>Forex runs 24/5</span>
                <span>Auto-locks at 00:00 MT5</span>
              </div>
            </div>
          </div>

          {/* RIGHT GRAPH CARD: DISCIPLINE & CONSISTENCY CURVE (60% width) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/90 dark:border-white/10 figma-card-shadow p-6 flex flex-col justify-between">
            {/* Graph Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-[15.5px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Discipline &amp; Consistency Curve
                  </h3>
                </div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Psychology equity curve &amp; rule adherence over Forex sessions
                </p>
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1.5 shrink-0">
                {(["7D", "14D", "30D", "All"] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      chartTimeframe === tf ? "tactile-black-pill text-white" : "tactile-white-pill text-slate-600 dark:text-slate-300"
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
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  +96.0%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  +4.8% this week
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 text-xs font-bold">
                <span>🪙</span>
                <span className="tabular-nums font-black">{gamState.bounty_balance.toLocaleString()}</span>
                <span className="text-slate-400 font-semibold">Coins</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[180px] sm:h-[195px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="disciplineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
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
                          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3.5 py-2 rounded-xl text-xs shadow-xl space-y-0.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{data.date}</span>
                            <div className="text-[13px] font-black">{data.score}% Discipline</div>
                            <div className="text-[10.5px] text-slate-300 dark:text-slate-600">{data.trades} Closed MT5 Trades</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563EB" 
                    strokeWidth={2.6} 
                    fillOpacity={1} 
                    fill="url(#disciplineGlow)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Metrics Footer Under Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-white/5 mt-2 text-center sm:text-left">
              <div>
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider block">Stop Loss</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">100% Verified</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider block">Avg R:R</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">1 : 2.4</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider block">Violations</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">0 Violations</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider block">Total XP</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">+{gamState.xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ MODERN TACTILE TAB SWITCHER (Clean, No Numbers) ══════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("discipline")}
            className={`px-5 py-2.5 rounded-full text-[12.5px] font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "discipline" ? "tactile-black-pill" : "tactile-white-pill"
            }`}
          >
            🛡️ Discipline Engine
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("streak")}
            className={`px-5 py-2.5 rounded-full text-[12.5px] font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "streak" ? "tactile-black-pill" : "tactile-white-pill"
            }`}
          >
            🔥 Daily Streak &amp; Chest
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("achievements")}
            className={`px-5 py-2.5 rounded-full text-[12.5px] font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "achievements" ? "tactile-black-pill" : "tactile-white-pill"
            }`}
          >
            🏆 Badges &amp; Trophies ({achievements.filter(a => a.isUnlocked).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vault")}
            className={`px-5 py-2.5 rounded-full text-[12.5px] font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "vault" ? "tactile-black-pill" : "tactile-white-pill"
            }`}
          >
            🎁 Rewards &amp; XP Vault
          </button>
        </div>

        {/* ══════ TAB 1: DISCIPLINE ENGINE ══════ */}
        {activeTab === "discipline" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/90 dark:border-white/10 figma-card-shadow p-6 sm:p-7 space-y-6">
              <div>
                <h3 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">
                  Rule Compliance Parameters
                </h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Synchronized with your Exness MetaTrader 5 account and live Risk Guard settings.
                </p>
              </div>

              {/* 4 Core Pillars Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. MT5 Stop-Loss Protection */}
                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-slate-900 dark:text-white">MT5 Stop-Loss</span>
                    <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">100%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                  <span className="text-[11.5px] text-slate-500 dark:text-slate-400 block leading-tight">
                    Every position opened with protective SL
                  </span>
                </div>

                {/* 2. Lot Sizing Rule */}
                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-slate-900 dark:text-white">Lot Sizing Rule</span>
                    <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">0.05–0.10</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "95%" }} />
                  </div>
                  <span className="text-[11.5px] text-slate-500 dark:text-slate-400 block leading-tight">
                    Strict adherence to 1% account risk limit
                  </span>
                </div>

                {/* 3. Revenge Trade Cooldown */}
                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-slate-900 dark:text-white">Revenge Shield</span>
                    <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">0 Violations</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                  <span className="text-[11.5px] text-slate-500 dark:text-slate-400 block leading-tight">
                    15-minute cooldown respected after loss
                  </span>
                </div>

                {/* 4. Daily Trade Cap */}
                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-slate-900 dark:text-white">Daily Trade Cap</span>
                    <span className="text-[12px] font-black text-slate-900 dark:text-white">3 / 4 Trades</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-900 dark:bg-white h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                  <span className="text-[11.5px] text-slate-500 dark:text-slate-400 block leading-tight">
                    Under daily maximum execution limit
                  </span>
                </div>
              </div>

              {/* Weekly Discipline Calendar Cards */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3.5">
                  <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-white">
                    Weekly Consistency Log
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Grade A+ (95+)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Grade A (85–94)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {Object.values(disciplineState.calendarHistory).slice(-6).map((item) => (
                    <div 
                      key={item.date}
                      className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#18181B] figma-card-shadow text-center space-y-1.5 hover:scale-[1.02] transition-transform"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {item.score}
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        GRADE {item.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════ TAB 2: DAILY STREAK & 7-DAY LADDER ══════ */}
        {activeTab === "streak" && (
          <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/90 dark:border-white/10 figma-card-shadow p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame size={20} className="fill-orange-500/20" />
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    7-Day Forex Consistency Ladder
                  </h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Check in daily and log your MT5 trades to extend your streak multiplier.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="tactile-white-pill px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                  Streak Freeze: 1 Active 🛡️
                </span>
                <span className="px-3.5 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider">
                  🔥 {disciplineState.streakDays}-Day Streak
                </span>
              </div>
            </div>

            {/* 7-Day Progressive Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weeklyStreakRewards.map((item) => {
                const isCompleted = item.day < claimDay;
                const isCurrent = item.day === claimDay && !isClaimedToday;
                const isClaimedCurrent = item.day === claimDay && isClaimedToday;

                return (
                  <div
                    key={item.day}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center min-h-[120px] transition-all ${
                      isCompleted
                        ? "bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 opacity-70 text-slate-400"
                        : isClaimedCurrent
                        ? "bg-emerald-50/60 dark:bg-emerald-500/[0.05] border-emerald-300 dark:border-emerald-500/30 text-emerald-600"
                        : isCurrent
                        ? "bg-white dark:bg-[#18181B] border-slate-900 dark:border-white shadow-lg ring-2 ring-slate-900/10 text-slate-900 dark:text-white scale-102"
                        : "bg-white dark:bg-[#18181B] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Day {item.day}</span>

                    <div className="my-2 flex items-center justify-center">
                      {isCompleted || isClaimedCurrent ? (
                        <Check size={20} className="text-emerald-500 stroke-[2.5]" />
                      ) : item.bonus ? (
                        <Crown size={22} className="text-amber-500 fill-amber-500/20 animate-bounce" />
                      ) : (
                        <Zap size={20} className="text-indigo-500" />
                      )}
                    </div>

                    <span className="text-[11.5px] font-black leading-none">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isClaimedToday ? "Streak saved for today! Next daily check-in opens tomorrow." : "Day 4 check-in ready to claim. Keep your momentum going!"}
              </span>

              <button
                type="button"
                onClick={handleClaimDailyCheckin}
                disabled={isClaimedToday}
                className={`tactile-black-pill rounded-full px-6 py-2.5 text-xs font-bold transition-all cursor-pointer ${
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
          <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/90 dark:border-white/10 figma-card-shadow p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  MetaTrader 5 Badges &amp; Trophies
                </h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Milestone badges earned directly through disciplined execution on MT5.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(["all", "risk", "forex", "algo", "habit"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAchievementFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-bold capitalize transition-all cursor-pointer ${
                      achievementFilter === cat
                        ? "tactile-black-pill text-white"
                        : "tactile-white-pill text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {cat === "algo" ? "Algo Bots" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((badge) => {
                const percent = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));
                return (
                  <div
                    key={badge.id}
                    className={`p-4.5 rounded-2xl border transition-all flex items-start gap-4 ${
                      badge.isUnlocked
                        ? "bg-white dark:bg-[#18181B] border-slate-200/90 dark:border-white/15 figma-card-shadow"
                        : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5 opacity-85"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 dark:border-white/10">
                      {badge.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">
                          {badge.title}
                        </h4>
                        {badge.isUnlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 tabular-nums shrink-0">
                            {badge.currentProgress} / {badge.maxProgress}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {badge.description}
                      </p>

                      {!badge.isUnlocked && (
                        <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div 
                            className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[11.5px] font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          +{badge.xpReward} XP
                        </span>
                        {badge.unlockedDate && (
                          <span className="text-slate-400 text-[10.5px]">
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
          <div className="bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/90 dark:border-white/10 figma-card-shadow p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Forex Rewards &amp; Benefit Vault
                </h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Exchange your hard-earned TradiCoins for instant AI Coaching, EA licenses & discounts.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 font-semibold block">Available Coins</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {gamState.bounty_balance.toLocaleString()} Coins
                </span>
              </div>
            </div>

            {/* Store Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Perk 1: AI Coach Credits */}
              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#18181B] figma-card-shadow flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                    +25 AI Coach Credits
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">
                    Instant credit top-up for Forex chart OCR, MT5 screenshot analysis, and trade breakdowns.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-black text-slate-900 dark:text-white block">300 Coins</span>
                    <span className="text-[10.5px] text-slate-400">Instant credit</span>
                  </div>
                  <button
                    type="button"
                    onClick={redeemAICredits}
                    className="tactile-black-pill rounded-full px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Perk 2: EA Bot License Discount */}
              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#18181B] figma-card-shadow flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                    $20 FiAlgo Pass Discount
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">
                    Exclusive coupon code towards FiAlgo V1 automated MT5 EA license renewal or upgrade.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-black text-slate-900 dark:text-white block">800 Coins</span>
                    <span className="text-[10.5px] text-slate-400">Coupon code</span>
                  </div>
                  <button
                    type="button"
                    onClick={redeemEADiscount}
                    className="tactile-black-pill rounded-full px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Perk 3: Forex Tournament Pass */}
              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#18181B] figma-card-shadow flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                    $500 Forex Tournament Pass
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">
                    Free ticket registration for the monthly global MetaTrader 5 trading championship.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-black text-slate-900 dark:text-white block">1,200 Coins</span>
                    <span className="text-[10.5px] text-slate-400">Free entry ticket</span>
                  </div>
                  <button
                    type="button"
                    onClick={redeemTournamentPass}
                    className="tactile-black-pill rounded-full px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>

            {/* Partner & Referral Program Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-slate-50/50 to-transparent dark:from-indigo-950/20 dark:via-white/[0.02] dark:to-transparent border border-indigo-200/60 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm shadow-indigo-500/20">
                  🤝
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14.5px] font-extrabold text-slate-900 dark:text-white">
                      Forex Partner &amp; Referral Program
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Earn Cash &amp; XP
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Introduce fellow MT5 traders. Earn ₹1,000–₹2,000 setup bonuses, +500 XP, and up to 10% weekly profit overrides.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/referrals")}
                className="tactile-black-pill rounded-full px-5 py-2.5 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <span>Open Referral Program</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Historical XP & Coins Ledger */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                  Recent Rewards &amp; XP Activity
                </h4>
                <span className="text-[11px] text-slate-400">{gamState.ledger.length} transactions</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {gamState.ledger.slice(0, 6).map((entry, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-[12.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white font-semibold">{entry.event}</span>
                      <span className="text-[10px] text-slate-400">({entry.date})</span>
                    </div>
                    <span className={`font-black tabular-nums ${
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
