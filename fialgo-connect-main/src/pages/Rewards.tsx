import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  ShieldCheck,
  Crown,
  Gift,
  TrendingUp,
  Target,
  ChevronRight,
  Check,
  Flame,
  ArrowRight,
  Shield,
  CheckCircle2,
  Activity,
  Coins,
  Lock,
  Info,
  MoreHorizontal,
  ArrowUpRight,
  Sparkles,
  Users,
  BarChart3,
  Medal,
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
  CartesianGrid,
} from "recharts";
import {
  getGamificationState,
  addXP,
  unlockBenefit,
  GamificationState,
  saveGamificationState,
} from "@/utils/gamification";
import {
  getForexDisciplineState,
  wrapUpForexSession,
  ForexDisciplineState,
} from "@/utils/disciplineScore";

// ═══════════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════
const CARD =
  "bg-white dark:bg-[#111115] rounded-[22px] border border-slate-100 dark:border-white/[0.06] shadow-[0_2px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)]";

const INNER_BOX =
  "bg-slate-50/80 dark:bg-white/[0.03] rounded-[14px] border border-slate-100 dark:border-white/[0.05]";

// Blue palette matching the reference image
const BLUE = {
  primary: "#2563EB",
  light: "#60A5FA",
  lighter: "#BFDBFE",
  glow: "rgba(37,99,235,0.15)",
};

// ═══════════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════════
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
  { id: "iron_sl", category: "risk", title: "Iron Stop-Loss", description: "Execute 25 MT5 positions with strict Stop Loss without moving it backwards.", icon: "🛡️", xpReward: 400, currentProgress: 25, maxProgress: 25, isUnlocked: true, unlockedDate: "Nov 18, 2026" },
  { id: "revenge_shield", category: "risk", title: "Revenge Immunity", description: "Complete 10 consecutive trading sessions with 0 revenge trade violations.", icon: "🧘", xpReward: 500, currentProgress: 10, maxProgress: 10, isUnlocked: true, unlockedDate: "Nov 19, 2026" },
  { id: "prop_drawdown", category: "risk", title: "Prop Firm Ready", description: "Maintain < 4% max drawdown over 30 consecutive trading days.", icon: "💼", xpReward: 1500, currentProgress: 22, maxProgress: 30, isUnlocked: false },
  { id: "zero_margin_call", category: "risk", title: "Account Fortress", description: "Execute 50 closed trades while maintaining margin level > 250%.", icon: "🏰", xpReward: 750, currentProgress: 38, maxProgress: 50, isUnlocked: false },
  { id: "gold_sniper", category: "forex", title: "Gold (XAU/USD) Sniper", description: "Execute 5 consecutive winning Gold trades with > 1:2 Risk/Reward ratio.", icon: "🪙", xpReward: 500, currentProgress: 5, maxProgress: 5, isUnlocked: true, unlockedDate: "Nov 17, 2026" },
  { id: "london_breakout", category: "forex", title: "London Session Pro", description: "Capture 15 winning setups executed during high-volume London open.", icon: "🇬🇧", xpReward: 600, currentProgress: 11, maxProgress: 15, isUnlocked: false },
  { id: "ny_reversal", category: "forex", title: "New York Power Hour", description: "Capture 10 profitable trend continuation trades during NY overlap.", icon: "🗽", xpReward: 650, currentProgress: 7, maxProgress: 10, isUnlocked: false },
  { id: "rr_hunter", category: "forex", title: "3R Profit Hunter", description: "Close 3 trades that hit full 1:3 R:R target without manual early exit.", icon: "🎯", xpReward: 700, currentProgress: 3, maxProgress: 3, isUnlocked: true, unlockedDate: "Nov 19, 2026" },
  { id: "fialgo_pilot", category: "algo", title: "FiAlgo V1 EA Commander", description: "Connect Exness MT5 account and activate FiAlgo V1 automated trading EA.", icon: "🤖", xpReward: 1000, currentProgress: 1, maxProgress: 1, isUnlocked: true, unlockedDate: "Nov 16, 2026" },
  { id: "bot_consistency", category: "algo", title: "Autonomous Consistency", description: "Run algorithmic bots for 5 consecutive winning sessions.", icon: "⚡", xpReward: 850, currentProgress: 4, maxProgress: 5, isUnlocked: false },
  { id: "multi_strategy", category: "algo", title: "Multi-Strategy Fleet", description: "Deploy 3 concurrent EA bot strategies across EUR/USD, GBP/USD and Gold.", icon: "🚢", xpReward: 1200, currentProgress: 2, maxProgress: 3, isUnlocked: false },
  { id: "month_of_steel", category: "habit", title: "Month of Steel", description: "Maintain a 30-day continuous login, trading & discipline streak.", icon: "🔥", xpReward: 2000, currentProgress: 16, maxProgress: 30, isUnlocked: false },
  { id: "journal_monk", category: "habit", title: "Journaling Monk", description: "Log detailed emotional reflections for 20 closed MT5 trades.", icon: "📖", xpReward: 450, currentProgress: 16, maxProgress: 20, isUnlocked: false },
  { id: "mentor_share", category: "habit", title: "Ecosystem Builder", description: "Refer 2 active verified Forex traders who connect MT5 accounts.", icon: "👥", xpReward: 1000, currentProgress: 2, maxProgress: 2, isUnlocked: true, unlockedDate: "Nov 15, 2026" },
];

const CHART_DATA = [
  { date: "Nov 5", score: 82 }, { date: "Nov 7", score: 86 },
  { date: "Nov 9", score: 84 }, { date: "Nov 11", score: 90 },
  { date: "Nov 13", score: 88 }, { date: "Nov 15", score: 94 },
  { date: "Nov 16", score: 92 }, { date: "Nov 17", score: 88 },
  { date: "Nov 18", score: 95 }, { date: "Nov 19", score: 94 },
  { date: "Nov 20", score: 96 },
];

const WEEKLY_REWARDS = [
  { day: 1, xp: 25, label: "+25 XP" },
  { day: 2, xp: 30, label: "+30 XP" },
  { day: 3, xp: 40, label: "+40 XP" },
  { day: 4, xp: 50, label: "+50 XP" },
  { day: 5, xp: 75, label: "+75 XP" },
  { day: 6, xp: 100, label: "+100 XP" },
  { day: 7, xp: 250, label: "Chest", bonus: true },
];

// ═══════════════════════════════════════════════════════════════════
//  DISCIPLINE ARC GAUGE — matching uploaded reference image exactly
// ═══════════════════════════════════════════════════════════════════
function DisciplineArcGauge({ score, grade }: { score: number; grade: string }) {
  const W = 240, H = 160;
  const cx = W / 2, cy = H - 24;
  const R = 88;

  // Arc from 180° to 0° (left to right, semicircle at bottom)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const sx = cx + r * Math.cos(toRad(startDeg));
    const sy = cy + r * Math.sin(toRad(startDeg));
    const ex = cx + r * Math.cos(toRad(endDeg));
    const ey = cy + r * Math.sin(toRad(endDeg));
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  };

  // Gauge goes from 180° → 0° as score 0 → 100
  const startDeg = 180;
  const totalDeg = 180;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const endDeg = startDeg - pct * totalDeg; // e.g. 96% → ~7.2°

  // Needle tip coordinates
  const needleDeg = startDeg - pct * totalDeg;
  const needleX = cx + R * Math.cos(toRad(needleDeg));
  const needleY = cy + R * Math.sin(toRad(needleDeg));

  const trackD = arcPath(180, 0, R);
  const fillD  = arcPath(180, endDeg, R);

  const totalLen = Math.PI * R; // ~276.5

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="relative" style={{ width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          <defs>
            {/* Gradient matching reference: light grey → vibrant blue */}
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="40%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={trackD}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={10}
            strokeLinecap="round"
            className="dark:stroke-white/10"
          />

          {/* Filled arc — animated */}
          <motion.path
            d={fillD}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={10}
            strokeLinecap="round"
            pathLength={totalLen}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pct }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            filter="url(#gaugeGlow)"
          />

          {/* Dot at tip */}
          <motion.circle
            cx={needleX}
            cy={needleY}
            r={6}
            fill="#2563EB"
            stroke="white"
            strokeWidth={2.5}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.35 }}
            className="drop-shadow-[0_0_6px_rgba(37,99,235,0.6)]"
          />

          {/* Min label */}
          <text x={12} y={H - 6} fontSize={11} fontWeight={600} fill="#94A3B8" textAnchor="middle">0</text>
          {/* Max label */}
          <text x={W - 12} y={H - 6} fontSize={11} fontWeight={600} fill="#94A3B8" textAnchor="middle">100</text>
        </svg>

        {/* Centered score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-7 pointer-events-none">
          <div className="flex items-baseline gap-1">
            <span className="text-[52px] font-black text-slate-900 dark:text-white leading-none tracking-tighter tabular-nums">
              {score}
            </span>
            <span className="text-sm font-bold text-slate-400 mb-1">/100</span>
          </div>
        </div>
      </div>

      {/* Status pill below gauge — from reference image */}
      <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
          GRADE {grade} · Top 4% of Traders
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  COMPLIANCE METER — matching "Total Project" reference card
// ═══════════════════════════════════════════════════════════════════
function ComplianceMeter({
  label, value, max = 100, displayValue, sublabel,
  color = "blue",
}: {
  label: string; value: number; max?: number;
  displayValue: string; sublabel: string;
  color?: "blue" | "emerald" | "violet" | "amber";
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const gradMap = {
    blue:    "from-blue-500 to-blue-400",
    emerald: "from-emerald-500 to-teal-400",
    violet:  "from-violet-500 to-purple-400",
    amber:   "from-amber-500 to-orange-400",
  };
  const glowMap = {
    blue:    "shadow-[0_0_12px_rgba(59,130,246,0.4)]",
    emerald: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    violet:  "shadow-[0_0_12px_rgba(139,92,246,0.4)]",
    amber:   "shadow-[0_0_12px_rgba(245,158,11,0.4)]",
  };

  return (
    <div className={`${INNER_BOX} p-4 space-y-3`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200">{label}</span>
        <span className="text-[12.5px] font-bold text-slate-900 dark:text-white tabular-nums">{displayValue}</span>
      </div>

      {/* Track — striped background + glowing fill pill */}
      <div className="relative h-2.5 rounded-full bg-slate-200/70 dark:bg-white/[0.07] overflow-visible">
        {/* Tick marks */}
        <div
          className="absolute inset-0 rounded-full opacity-30 dark:opacity-15 overflow-hidden"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(100,116,139,0.6) 5px, rgba(100,116,139,0.6) 6px)" }}
        />

        {/* Glow fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${gradMap[color]} ${glowMap[color]}`}
        />

        {/* Pin handle at tip */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#111115] border-2 border-slate-400 dark:border-slate-500 shadow-sm z-10"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{sublabel}</span>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  STAT PILL
// ═══════════════════════════════════════════════════════════════════
function StatPill({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className={`${INNER_BOX} flex items-center gap-3 px-4 py-3`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
      <div>
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">{value}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function Rewards() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "discipline" | "streak" | "achievements" | "vault") || "discipline";

  const [activeTab, setActiveTab] = useState<"discipline" | "streak" | "achievements" | "vault">(initialTab);
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "14D" | "All">("14D");
  const [gamState, setGamState] = useState<GamificationState>(getGamificationState);
  const [disciplineState, setDisciplineState] = useState<ForexDisciplineState>(getForexDisciplineState);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "risk" | "forex" | "algo" | "habit">("all");
  const [isWrapping, setIsWrapping] = useState(false);
  const [userName, setUserName] = useState("Trader");
  const [userInitial, setUserInitial] = useState("T");

  useEffect(() => {
    const handleXPUpdate = () => setGamState(getGamificationState());
    const handleDisciplineUpdate = (e: any) => {
      setDisciplineState(e?.detail || getForexDisciplineState());
    };
    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    window.addEventListener("tradifive_discipline_update", handleDisciplineUpdate);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader";
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());
      }
    });

    return () => {
      window.removeEventListener("tradifive_xp_update", handleXPUpdate);
      window.removeEventListener("tradifive_discipline_update", handleDisciplineUpdate);
    };
  }, []);

  const activeChartData = useMemo(() => {
    if (chartTimeframe === "7D") return CHART_DATA.slice(-5);
    if (chartTimeframe === "14D") return CHART_DATA.slice(-8);
    return CHART_DATA;
  }, [chartTimeframe]);

  const handleWrapUpSession = () => {
    setIsWrapping(true);
    setTimeout(() => {
      const res = wrapUpForexSession();
      setIsWrapping(false);
      if (res.success) {
        try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch (_) {}
        toast.success(`🏁 Forex Session Finalized!`, {
          description: `Score: ${res.score}/100 (Grade ${res.grade}) · +${res.xpEarned} XP`,
        });
      } else {
        toast.info("Today's session is already wrapped! Return tomorrow.");
      }
    }, 400);
  };

  const [claimDay, setClaimDay] = useState(() => Number(localStorage.getItem("tradifive_consistency_day") || "4"));
  const [lastClaimDate, setLastClaimDate] = useState(() => localStorage.getItem("tradifive_last_checkin_date") || "");
  const todayStr = new Date().toLocaleDateString("en-US");
  const isClaimedToday = lastClaimDate === todayStr;

  const handleDailyCheckin = () => {
    if (isClaimedToday) { toast.info("Already claimed today!"); return; }
    const reward = WEEKLY_REWARDS[claimDay - 1];
    addXP(reward.xp, `Day ${claimDay} Check-In`, "Daily Bonus");
    localStorage.setItem("tradifive_last_checkin_date", todayStr);
    setLastClaimDate(todayStr);
    const nextDay = claimDay >= 7 ? 1 : claimDay + 1;
    localStorage.setItem("tradifive_consistency_day", String(nextDay));
    setClaimDay(nextDay);
    try { confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } }); } catch (_) {}
    if (reward.bonus) toast.success("🎁 Gold Mystery Chest Unlocked!", { description: "+250 XP earned!" });
    else toast.success(`✅ ${reward.label} earned!`);
  };

  const handleRedeemCoins = (title: string, cost: number, action: () => void) => {
    if (gamState.bounty_balance < cost) {
      toast.error("Insufficient TradiCoins!", { description: `You need ${cost} coins.` });
      return;
    }
    const updated = {
      ...gamState,
      bounty_balance: gamState.bounty_balance - cost,
      ledger: [{ event: `Redeemed: ${title}`, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), mult: "Perk", xp: `-${cost} Coins` }, ...gamState.ledger],
    };
    saveGamificationState(updated);
    setGamState(updated);
    try { confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } }); } catch (_) {}
    action();
  };

  const filteredAchievements = achievements.filter(a => achievementFilter === "all" || a.category === achievementFilter);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const TABS = [
    { id: "discipline", emoji: "🛡️", label: "Discipline" },
    { id: "streak",     emoji: "🔥", label: "Daily Streak" },
    { id: "achievements", emoji: "🏆", label: `Badges (${unlockedCount})` },
    { id: "vault",      emoji: "🎁", label: "Vault" },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Engagement" }, { label: "Rewards Hub" }]}
      noPadding={true}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 font-sans select-none">

        {/* ══════════════════════════════════════════════════════════
            TOP HERO — User Identity + Arc Gauge + Trend Chart
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* ── LEFT: DISCIPLINE SCORE CARD (matches uploaded reference) ── */}
          <div className={`xl:col-span-5 ${CARD} p-6 flex flex-col gap-4`}>

            {/* Card header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Forex Discipline Score
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  LIVE
                </span>
                <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <MoreHorizontal size={15} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Arc Gauge — matching the uploaded image's clean semicircle */}
            <div className="flex justify-center">
              <DisciplineArcGauge score={disciplineState.score} grade={disciplineState.grade} />
            </div>

            {/* Status insight card — from reference image bottom section */}
            <div className={`${INNER_BOX} flex items-start gap-3.5 p-4`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm shadow-sm shadow-blue-500/30">
                ✦
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                  Excellent Discipline, Needs Refinement
                </p>
                <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">
                  Psychology score is rising. Tighten lot sizing & maintain streak for Grade S.
                </p>
              </div>
            </div>

            {/* User identity row */}
            <div className={`${INNER_BOX} flex items-center justify-between p-3.5`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{userName}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Level {gamState.level} Pro MT5 Trader</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-orange-500">
                <Flame size={15} className="fill-orange-500" />
                <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{disciplineState.streakDays}</span>
                <span className="text-[10.5px] text-slate-400 font-medium">day streak</span>
              </div>
            </div>

            {/* Wrap session CTA */}
            <button
              type="button"
              disabled={isWrapping || disciplineState.isSessionWrapped}
              onClick={handleWrapUpSession}
              className={`w-full py-3 rounded-[14px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                disciplineState.isSessionWrapped
                  ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.01] shadow-sm"
              }`}
            >
              {disciplineState.isSessionWrapped ? (
                <><CheckCircle2 size={15} /> Session Finalized for Today</>
              ) : (
                <><span>🏁</span> Wrap Up Today's Session</>
              )}
            </button>
            <p className="text-center text-[10.5px] text-slate-400">Forex runs 24/5 Mon–Fri · Auto-locks at 00:00 MT5</p>
          </div>

          {/* ── RIGHT: TREND CHART + QUICK STATS ── */}
          <div className={`xl:col-span-7 ${CARD} p-6 flex flex-col gap-5`}>

            {/* Chart Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <TrendingUp size={15} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                    Discipline &amp; Consistency Curve
                  </h3>
                </div>
                <p className="text-[12px] text-slate-400">
                  Psychology equity curve across your Forex sessions
                </p>
              </div>
              <div className="flex items-center p-0.5 rounded-[10px] bg-slate-100 dark:bg-white/[0.05] gap-0.5">
                {(["7D", "14D", "All"] as const).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1 rounded-[8px] text-[11px] font-semibold transition-all cursor-pointer ${
                      chartTimeframe === tf
                        ? "bg-white dark:bg-[#1E1E24] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Score headline */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-[28px] font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">+96.0%</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-100 dark:border-emerald-500/20">
                <ArrowUpRight size={11} />
                +4.8% this week
              </span>
              <span className="ml-auto flex items-center gap-1 text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                🪙 <span className="tabular-nums font-bold">{gamState.bounty_balance.toLocaleString()}</span>
                <span className="text-slate-400 font-normal">Coins</span>
              </span>
            </div>

            {/* Area chart */}
            <div className="w-full h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[75, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10">
                            <div className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">{d.date}</div>
                            <div className="font-bold text-[13px]">{d.score}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#areaFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 4 key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "Stop Loss", value: "100% Verified", color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Avg R:R", value: "1 : 2.4", color: "text-slate-900 dark:text-white" },
                { label: "Violations", value: "0", color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Total XP", value: `+${gamState.xp.toLocaleString()}`, color: "text-blue-600 dark:text-blue-400" },
              ].map(m => (
                <div key={m.label} className={`${INNER_BOX} p-3 text-center`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{m.label}</div>
                  <div className={`text-[13.5px] font-black ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Quote pill */}
            <div className={`${INNER_BOX} flex items-center gap-2.5 px-4 py-2.5`}>
              <span className="text-base shrink-0">🔥</span>
              <span className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug">
                Your trading psychology trended up{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">+4.8%</strong>{" "}
                this week with{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">0 revenge violations</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            QUICK STAT PILLS ROW
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatPill
            icon={<ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />}
            label="Discipline Score"
            value={`${disciplineState.score}/100`}
            accent="bg-blue-50 dark:bg-blue-500/10"
          />
          <StatPill
            icon={<Flame size={16} className="text-orange-500" />}
            label="Active Streak"
            value={`${disciplineState.streakDays} Days`}
            accent="bg-orange-50 dark:bg-orange-500/10"
          />
          <StatPill
            icon={<Star size={16} className="text-violet-500" />}
            label="Total XP"
            value={`${gamState.xp.toLocaleString()} XP`}
            accent="bg-violet-50 dark:bg-violet-500/10"
          />
          <StatPill
            icon={<Coins size={16} className="text-amber-500" />}
            label="TradiCoins"
            value={`${gamState.bounty_balance.toLocaleString()} 🪙`}
            accent="bg-amber-50 dark:bg-amber-500/10"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════
            SEGMENTED TAB SWITCHER
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1.5 p-1 rounded-[14px] bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.05] overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12.5px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: DISCIPLINE ENGINE
        ══════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === "discipline" && (
            <motion.div
              key="discipline"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`${CARD} p-5 sm:p-6 space-y-6`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Rule Compliance Parameters</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Synced with your Exness MT5 account & live Risk Guard.</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Live Score: {disciplineState.score}/100</span>
                </div>
              </div>

              {/* 4 Compliance meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <ComplianceMeter label="MT5 Stop-Loss Protection" value={100} displayValue="100% Verified" sublabel="Every order opened with protective SL" color="emerald" />
                <ComplianceMeter label="Lot Sizing Rule" value={95} displayValue="0.05 – 0.10 Lots" sublabel="Strict 1% account risk limit enforced" color="blue" />
                <ComplianceMeter label="Revenge Trade Shield" value={100} displayValue="0 Violations" sublabel="15-min cooldown respected post-loss" color="emerald" />
                <ComplianceMeter label="Daily Trade Cap" value={75} displayValue="3 / 4 Trades" sublabel="Under daily maximum execution limit" color="amber" />
              </div>

              {/* Forex 24/5 Session Banner */}
              <div className={`${INNER_BOX} flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-lg shrink-0">🌐</div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white">Forex 24/5 Session Rhythm</div>
                    <div className="text-[11.5px] text-slate-400">Markets run continuously. Session auto-locks at midnight 00:00 MT5.</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-[11.5px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> London &amp; NY Sessions Active
                </span>
              </div>

              {/* Weekly Consistency Log */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">Weekly Consistency Log</h4>
                  <div className="flex items-center gap-3 text-[10.5px] font-medium text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> A+ (95+)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> A (85–94)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {Object.values(disciplineState.calendarHistory).slice(-6).map((item) => {
                    const isAPlus = item.score >= 95;
                    return (
                      <div
                        key={item.date}
                        className={`${INNER_BOX} p-3 text-center space-y-1.5 hover:scale-[1.02] transition-transform cursor-default`}
                      >
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                          {new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <div className="text-[22px] font-black text-slate-900 dark:text-white tabular-nums">{item.score}</div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isAPlus
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20"
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20"
                        }`}>
                          GRADE {item.grade}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: DAILY STREAK
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "streak" && (
            <motion.div
              key="streak"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`${CARD} p-5 sm:p-6 space-y-6`}
            >
              {/* Streak Hero — with giant ambient watermark */}
              <div className="relative overflow-hidden rounded-[18px] p-6 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-900/[0.06] dark:via-[#111115] dark:to-orange-900/[0.04] border border-amber-200/60 dark:border-white/[0.05]">
                {/* Giant ambient watermark */}
                <div className="absolute right-4 -top-6 text-[160px] font-black text-amber-500/[0.06] dark:text-amber-500/[0.03] pointer-events-none select-none leading-none">
                  {disciplineState.streakDays}
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 shrink-0">
                      🔥
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">Active Streak</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[42px] font-black text-slate-900 dark:text-white leading-none tabular-nums tracking-tighter">{disciplineState.streakDays}</span>
                        <span className="text-sm font-bold text-slate-400">days</span>
                      </div>
                      <p className="text-[12px] text-slate-400 mt-1 max-w-[280px] leading-snug">
                        Consecutive Forex days logged with 100% SL &amp; 0 revenge trades.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2.5 shrink-0">
                    <div className={`${INNER_BOX} flex items-center gap-2 px-4 py-2.5`}>
                      <span className="text-base">⭐</span>
                      <div>
                        <div className="text-[11.5px] font-black text-slate-900 dark:text-white tabular-nums">+{gamState.xp.toLocaleString()} XP</div>
                        <div className="text-[9.5px] text-slate-400 font-semibold uppercase">Total Points</div>
                      </div>
                    </div>
                    <div className={`${INNER_BOX} flex items-center gap-2 px-4 py-2.5`}>
                      <span className="text-base">❄️</span>
                      <div>
                        <div className="text-[11.5px] font-black text-blue-600 dark:text-blue-400">1 Active</div>
                        <div className="text-[9.5px] text-slate-400 font-semibold uppercase">Streak Freeze</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="relative z-10 mt-5 pt-4 border-t border-slate-200/60 dark:border-white/[0.05] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400">Forex 24/5 Heatmap — Last 12 Weeks</span>
                    <div className="hidden sm:flex items-center gap-3 text-[10.5px] font-medium text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500 inline-block" /> A+</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-blue-500 inline-block" /> A</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[3px] bg-amber-400 inline-block" /> B</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto pb-1 scrollbar-none">
                    <div className="flex gap-2 min-w-[520px]">
                      {/* Day labels */}
                      <div className="flex flex-col justify-between h-[80px] text-[9.5px] font-bold text-slate-400 pr-1 shrink-0">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                      </div>
                      {/* Grid */}
                      <div className="inline-grid grid-rows-5 grid-flow-col gap-1.5 flex-1">
                        {Array.from({ length: 60 }).map((_, i) => {
                          const scores = [96, 94, 98, 92, 88, 95, 96, 90, 85, 98, 94, 96, 92, 95, 88, 96, 94, 92, 98, 95];
                          const s = scores[i % scores.length];
                          const upcoming = i > 52;
                          const bg = upcoming
                            ? "bg-slate-200/50 dark:bg-white/[0.05]"
                            : s >= 95 ? "bg-emerald-500"
                            : s >= 85 ? "bg-blue-500"
                            : "bg-amber-400";
                          return (
                            <div
                              key={i}
                              title={upcoming ? "Upcoming" : `Day ${i+1}: ${s}%`}
                              className={`w-4 h-4 rounded-[3px] ${bg} transition-all hover:scale-125 cursor-pointer`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Streak protection capsule */}
                  <div className={`${INNER_BOX} flex items-center justify-between px-4 py-3`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">❄️</span>
                      <div>
                        <div className="text-[12.5px] font-bold text-slate-900 dark:text-white">Streak Freeze Protection</div>
                        <div className="text-[11px] text-slate-400">Covers missed Forex trading sessions automatically</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 text-base">❄️❄️❄️</span>
                      <ChevronRight size={15} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Ladder */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white">7-Day Consistency Ladder</h4>
                  <span className="text-[11px] text-slate-400">Day 7 → Gold Mystery Chest</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {WEEKLY_REWARDS.map(item => {
                    const done = item.day < claimDay;
                    const current = item.day === claimDay && !isClaimedToday;
                    const claimed = item.day === claimDay && isClaimedToday;
                    return (
                      <div key={item.day} className={`p-3.5 rounded-[14px] border flex flex-col items-center text-center gap-2 min-h-[110px] justify-between transition-all ${
                        done || claimed
                          ? "bg-slate-50/70 dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.04] opacity-70"
                          : current
                          ? `bg-white dark:bg-[#1A1A1E] border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20 scale-[1.03]`
                          : `${INNER_BOX} border-transparent`
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Day {item.day}</span>
                        <div className="flex items-center justify-center">
                          {done || claimed ? (
                            <Check size={18} className="text-emerald-500 stroke-[2.5]" />
                          ) : item.bonus ? (
                            <Crown size={20} className="text-amber-500 fill-amber-500/20 animate-bounce" />
                          ) : (
                            <Zap size={18} className="text-blue-500" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                  <span className="text-[12px] text-slate-400">
                    {isClaimedToday ? "Streak saved! Next check-in opens tomorrow." : "Your Day 4 reward is ready to claim 🎁"}
                  </span>
                  <button
                    type="button"
                    onClick={handleDailyCheckin}
                    disabled={isClaimedToday}
                    className={`px-5 py-2.5 rounded-[12px] text-[12.5px] font-bold transition-all cursor-pointer ${
                      isClaimedToday
                        ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] shadow-sm"
                    }`}
                  >
                    {isClaimedToday ? "Checked-In Today ✓" : "Claim Daily Check-In 🔥"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: BADGES & ACHIEVEMENTS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`${CARD} p-5 sm:p-6 space-y-5`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">MT5 Badges &amp; Trophies</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">{unlockedCount} of {achievements.length} badges unlocked through MT5 execution.</p>
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded-[10px] bg-slate-100 dark:bg-white/[0.05] overflow-x-auto">
                  {(["all", "risk", "forex", "algo", "habit"] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAchievementFilter(cat)}
                      className={`px-3 py-1 rounded-[8px] text-[10.5px] font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        achievementFilter === cat
                          ? "bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-white shadow-xs font-bold"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      }`}
                    >
                      {cat === "algo" ? "Algo Bots" : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAchievements.map(badge => {
                  const pct = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));
                  return (
                    <div key={badge.id} className={`${INNER_BOX} flex items-start gap-4 p-4 transition-all hover:shadow-sm ${
                      badge.isUnlocked ? "" : "opacity-80"
                    }`}>
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center text-[20px] shadow-xs ${
                          badge.isUnlocked
                            ? "bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10"
                            : "bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5"
                        }`}>
                          {badge.icon}
                        </div>
                        {badge.isUnlocked && (
                          <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check size={9} className="text-white stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{badge.title}</h4>
                          <span className={`text-[9.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                            badge.isUnlocked
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20"
                              : "bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200/60 dark:border-white/5"
                          }`}>
                            {badge.isUnlocked ? "UNLOCKED" : `${badge.currentProgress}/${badge.maxProgress}`}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-400 leading-snug mb-2.5">{badge.description}</p>

                        {!badge.isUnlocked && (
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full bg-slate-900 dark:bg-white"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+{badge.xpReward} XP</span>
                          {badge.unlockedDate && (
                            <span className="text-[10px] text-slate-400">{badge.unlockedDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: REWARDS VAULT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "vault" && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`${CARD} p-5 sm:p-6 space-y-6`}
            >
              {/* Balance header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Forex Rewards &amp; Benefit Vault</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Exchange TradiCoins for AI coaching, EA licenses &amp; discounts.</p>
                </div>
                <div className={`${INNER_BOX} flex items-center gap-2.5 px-4 py-2.5 self-start`}>
                  <span className="text-xl">🪙</span>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Balance</div>
                    <div className="text-[16px] font-black text-slate-900 dark:text-white">{gamState.bounty_balance.toLocaleString()} Coins</div>
                  </div>
                </div>
              </div>

              {/* Reward cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: "⚡", label: "+25 AI Credits", desc: "Instant top-up for Forex chart OCR, MT5 screenshot analysis, and trade breakdowns.",
                    cost: 300, costLabel: "300 Coins", accent: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    action: () => { toast.success("⚡ 25 AI Credits added!"); }
                  },
                  {
                    icon: "🤖", label: "$20 FiAlgo Discount", desc: "Exclusive coupon towards FiAlgo V1 MT5 EA license renewal or upgrade.",
                    cost: 800, costLabel: "800 Coins", accent: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
                    action: () => { navigator.clipboard.writeText("FIALGO-PRO-20USD"); toast.success("Coupon FIALGO-PRO-20USD copied!"); }
                  },
                  {
                    icon: "🏆", label: "$500 Tournament Pass", desc: "Free ticket for the monthly global MetaTrader 5 trading championship.",
                    cost: 1200, costLabel: "1,200 Coins", accent: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    action: () => { toast.success("🏆 Tournament ticket registered!"); }
                  },
                ].map(item => (
                  <div key={item.label} className={`${INNER_BOX} flex flex-col justify-between gap-4 p-5 hover:shadow-sm transition-all`}>
                    <div className="space-y-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${item.accent}`}>{item.icon}</div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{item.label}</h4>
                      <p className="text-[11.5px] text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
                      <div>
                        <div className="text-[13.5px] font-bold text-slate-900 dark:text-white">{item.costLabel}</div>
                        <div className="text-[10px] text-slate-400">Instant delivery</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRedeemCoins(item.label, item.cost, item.action)}
                        className="px-4 py-1.5 rounded-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-bold cursor-pointer hover:scale-[1.03] transition-transform shadow-xs"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Referral CTA Banner */}
              <div className="relative overflow-hidden rounded-[18px] p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="absolute right-0 top-0 w-40 h-full opacity-10">
                  <svg viewBox="0 0 160 80" className="w-full h-full"><circle cx="120" cy="40" r="60" fill="white" /><circle cx="40" cy="70" r="30" fill="white" /></svg>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={15} className="text-blue-200" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Referral Program</span>
                    </div>
                    <h4 className="text-[16px] font-bold mb-0.5">Forex Partner &amp; Referral Network</h4>
                    <p className="text-[12px] text-blue-200 max-w-[380px]">
                      Invite MT5 traders. Earn ₹1,000–₹2,000 setup bonuses, +500 XP, and up to 10% weekly profit overrides.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/referrals")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-white text-blue-700 font-bold text-[13px] cursor-pointer hover:scale-[1.02] transition-transform shadow-sm shrink-0"
                  >
                    Open Program <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* XP Ledger */}
              {gamState.ledger.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Recent XP Activity</h4>
                    <span className="text-[11px] text-slate-400">{gamState.ledger.length} transactions</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {gamState.ledger.slice(0, 6).map((e, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-[12px]">
                        <div>
                          <span className="font-medium text-slate-800 dark:text-white">{e.event}</span>
                          <span className="ml-2 text-[10.5px] text-slate-400">({e.date})</span>
                        </div>
                        <span className={`font-bold tabular-nums ${e.xp.toString().startsWith("-") ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {e.xp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
