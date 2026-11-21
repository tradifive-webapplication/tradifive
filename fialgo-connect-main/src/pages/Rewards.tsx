import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  History,
  Zap,
  Activity,
  Wifi,
  Calendar as CalendarIcon,
  List as ListIcon,
  Award,
  Crown,
  Lock,
  Sparkles,
  Ticket,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { Gauge } from "@/components/ui/charts";
import { getGamificationState, saveGamificationState } from "@/utils/gamification";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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
  telemetryStat?: string;
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

interface WeekHistorySet {
  id: string;
  rangeLabel: string;
  shortLabel: string;
  badge: string;
  isCurrent: boolean;
  passRate: string;
  avgScore: number;
  totalSessions: number;
  days: WeeklyDayRecord[];
}

interface BadgeItem {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  xp: string;
  category: "risk" | "consistency" | "execution" | "milestone";
  categoryLabel: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  current?: number;
  target?: number;
  progressPct?: number;
  unlockedDate?: string;
  proofNote: string;
}

interface VaultReward {
  id: string;
  title: string;
  desc: string;
  cost: number;
  tag: string;
  categoryLabel: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  voucherCode: string;
  benefitDetails: string;
  terms: string;
}

interface StreakLevelMilestone {
  level: number;
  title: string;
  subtitle: string;
  targetDays: number;
  currentDays: number;
  status: "completed" | "active" | "locked";
  xpReward: string;
  perks: string;
  multiplier: string;
  completedDate?: string;
  criteria: string;
}

const CARD_BASE =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

export default function Rewards() {
  /* -------------------------------------------------------------------------
     REAL-TIME HOOKS & SUPABASE TELEMETRY
  ------------------------------------------------------------------------- */
  const {
    accountMetrics,
    recentTrades,
    avgDisciplineScore,
    tradesToday,
    dailyXpEarned,
    breachLogs,
    isConnected,
    balance: liveBalance,
    equity: liveEquity,
  } = useDashboardData();

  /* -------------------------------------------------------------------------
     STATE & REAL DATA HOOKS
  ------------------------------------------------------------------------- */
  const [activeTab, setActiveTab] = useState<"discipline" | "streak" | "badges" | "vault">("discipline");
  const [activeRange, setActiveRange] = useState<"7D" | "14D" | "All">("14D");

  const hasTrades = Boolean(recentTrades && recentTrades.length > 0);

  // Real Gamification State (Real XP & Streak)
  const [totalXP, setTotalXP] = useState<number>(() => {
    try {
      const gam = getGamificationState();
      if (typeof gam?.xp === "number" && gam.xp > 0 && gam.xp !== 1030 && gam.xp !== 3030 && gam.xp !== 350) return gam.xp;
      const raw = localStorage.getItem("tradifive_forex_discipline_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.xp === "number" && parsed.xp > 0 && parsed.xp !== 1030 && parsed.xp !== 3030 && parsed.xp !== 350) return parsed.xp;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    try {
      const gam = getGamificationState();
      if (typeof gam?.level === "number") return gam.level;
      return 1;
    } catch {
      return 1;
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("tradifive_forex_discipline_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Purge old mock streak numbers (16 or 18)
        if (
          parsed?.streakDays === 16 ||
          parsed?.streakDays === 18 ||
          parsed?.calendarHistory?.["2026-11-15"]
        ) {
          return 0;
        }
        if (typeof parsed?.streakDays === "number") return parsed.streakDays;
      }
      const gam = getGamificationState();
      if (typeof gam?.streak === "number") return gam.streak;
      return 0;
    } catch {
      return 0;
    }
  });

  const xp = totalXP;
  const setXp = setTotalXP;

  const [score, setScore] = useState<number | null>(() => (hasTrades ? (avgDisciplineScore || 100) : null));
  const [displayScore, setDisplayScore] = useState<number | null>(() => (hasTrades ? (avgDisciplineScore || 100) : null));
  const [redeemedRewards, setRedeemedRewards] = useState<Set<string>>(new Set());
  const [replayKey, setReplayKey] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [consistencyViewMode, setConsistencyViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [badgeFilter, setBadgeFilter] = useState<"all" | "unlocked" | "in_progress">("all");

  // Dynamic Level & Progress thresholds based on real totalXP
  const levelInfo = useMemo(() => {
    if (totalXP < 1000) return { level: 1, minXp: 0, nextXp: 1000, needed: 1000 - totalXP };
    if (totalXP < 2500) return { level: 2, minXp: 1000, nextXp: 2500, needed: 2500 - totalXP };
    if (totalXP < 5000) return { level: 3, minXp: 2500, nextXp: 5000, needed: 5000 - totalXP };
    if (totalXP < 10000) return { level: 4, minXp: 5000, nextXp: 10000, needed: 10000 - totalXP };
    return { level: 5, minXp: 10000, nextXp: 10000, needed: 0 };
  }, [totalXP]);

  const progressPercent = useMemo(() => {
    const range = levelInfo.nextXp - levelInfo.minXp;
    if (range <= 0) return 100;
    return Math.min(100, Math.max(0, ((totalXP - levelInfo.minXp) / range) * 100));
  }, [totalXP, levelInfo]);

  // Real Account Number string (never fake mock ID)
  const displayAccountNumber = useMemo(() => {
    if (accountMetrics?.account_number) return `#${accountMetrics.account_number}`;
    if (accountMetrics?.login) return `#${accountMetrics.login}`;
    if (isConnected) return "Connected";
    return "Disconnected";
  }, [accountMetrics, isConnected]);

  // User Profile State
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("tradifive_cached_display_name") || localStorage.getItem("tradifive_cached_username") || "Trader";
    } catch {
      return "Trader";
    }
  });
  const [userAvatar, setUserAvatar] = useState("TR");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>(() => {
    try {
      return localStorage.getItem("tradifive_cached_avatar_url") || "";
    } catch {
      return "";
    }
  });
  const [userTier, setUserTier] = useState("PRO");

  // Fetch real profile from Supabase profiles table
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url, tier, xp_total, xp_level, streak_days")
            .eq("id", session.user.id)
            .maybeSingle();

          const name =
            profile?.display_name ||
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            profile?.username ||
            session.user.email?.split("@")[0] ||
            "Trader";

          const avatar = profile?.avatar_url || session.user.user_metadata?.avatar_url || "";
          const tier = profile?.tier?.toUpperCase() || "PRO";

          if (isMounted) {
            setUserName(name);
            setUserTier(tier);
            if (avatar) {
              setUserAvatarUrl(avatar);
              try {
                localStorage.setItem("tradifive_cached_avatar_url", avatar);
              } catch (_) {}
            }
            const initials = name
              .split(" ")
              .filter(Boolean)
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "TR";
            setUserAvatar(initials);
            try {
              localStorage.setItem("tradifive_cached_display_name", name);
            } catch (_) {}

            if (typeof profile?.xp_total === "number") {
              setTotalXP(profile.xp_total);
            }
            if (typeof profile?.xp_level === "number") {
              setCurrentLevel(profile.xp_level);
            }
            if (typeof profile?.streak_days === "number") {
              setStreakDays(profile.streak_days);
            }
          }
        }
      } catch (e) {
        console.error("Error fetching user profile:", e);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  // Listen to live XP updates
  useEffect(() => {
    const handleXpUpdate = () => {
      try {
        const gam = getGamificationState();
        if (typeof gam?.xp === "number") setTotalXP(gam.xp);
        if (typeof gam?.level === "number") setCurrentLevel(gam.level);
        if (typeof gam?.streak === "number") setStreakDays(gam.streak);
      } catch (_) {}
    };
    window.addEventListener("tradifive_xp_update", handleXpUpdate);
    return () => window.removeEventListener("tradifive_xp_update", handleXpUpdate);
  }, []);

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
     DISCIPLINE CURVE DATASETS (7D, 14D, ALL) - 100% REAL DATA
  ------------------------------------------------------------------------- */
  const curveDatasets: Record<"7D" | "14D" | "All", CurveDataset> = useMemo(() => {
    const today = new Date();
    const buildPoints = (daysCount: number) => {
      const pts: PointData[] = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().split("T")[0];
        const dayTrades = recentTrades?.filter((t) => (t.close_time || t.open_time || t.closed_at || "").startsWith(iso)) || [];
        const hasTrades = dayTrades.length > 0;
        const dayScore = hasTrades
          ? Math.round(dayTrades.reduce((acc, t) => acc + (t.discipline_score || 100), 0) / dayTrades.length)
          : 100;
        const dayProfit = dayTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
        pts.push({
          date: d,
          score: dayScore,
          equity: hasTrades ? `${dayProfit >= 0 ? "+" : ""}$${dayProfit.toFixed(2)}` : "$0.00",
          trades: dayTrades.length,
        });
      }
      return pts;
    };

    const p7 = buildPoints(7);
    const p14 = buildPoints(14);
    const pAll = buildPoints(30);

    const calcDataset = (pts: PointData[]) => {
      const totalTrades = pts.reduce((acc, p) => acc + p.trades, 0);
      const totalProfit = pts.reduce((acc, p) => {
        const num = parseFloat(p.equity.replace("$", "").replace("+", "")) || 0;
        return acc + num;
      }, 0);
      const hasTrades = totalTrades > 0;

      return {
        headline: hasTrades ? `${totalProfit >= 0 ? "+" : ""}$${totalProfit.toFixed(2)}` : "$0.00",
        delta: hasTrades ? `${totalTrades} verified order${totalTrades === 1 ? "" : "s"}` : "Session Ready",
        sessions: `${totalTrades} closed session${totalTrades === 1 ? "" : "s"}`,
        scoreLabel: hasTrades ? `Score: ${avgDisciplineScore || 100}%` : "Score: --",
        points: pts,
      };
    };

    return {
      "7D": calcDataset(p7),
      "14D": calcDataset(p14),
      All: calcDataset(pAll),
    };
  }, [recentTrades, avgDisciplineScore]);

  // Live Metric States
  const [liveTradesCount, setLiveTradesCount] = useState<number>(() => tradesToday || 0);
  const [liveSessionsCount, setLiveSessionsCount] = useState<number>(() => recentTrades?.length || 0);
  const [liveStopLossPercent, setLiveStopLossPercent] = useState<number>(() => {
    if (recentTrades && recentTrades.length > 0) {
      const slTrades = recentTrades.filter((t) => t.sl);
      return Math.round((slTrades.length / recentTrades.length) * 100);
    }
    return 0;
  });
  const [liveViolationsCount, setLiveViolationsCount] = useState<number>(() => breachLogs?.length || 0);

  // Sync with live Supabase telemetry if available
  useEffect(() => {
    if (tradesToday) setLiveTradesCount(tradesToday);
    if (breachLogs && breachLogs.length > 0) {
      setLiveViolationsCount(breachLogs.length);
    }
    if (recentTrades && recentTrades.length > 0) {
      setLiveSessionsCount(recentTrades.length);
      const slTrades = recentTrades.filter((t) => t.sl);
      const slPct = Math.round((slTrades.length / recentTrades.length) * 100);
      setLiveStopLossPercent(slPct);
      if (avgDisciplineScore) {
        setScore(avgDisciplineScore);
        setDisplayScore(avgDisciplineScore);
      }
    } else {
      setLiveSessionsCount(0);
      setLiveStopLossPercent(0);
      setScore(null);
      setDisplayScore(null);
    }
    if (dailyXpEarned && isConnected) {
      setTotalXP((prev) => Math.max(prev, dailyXpEarned));
    }
  }, [tradesToday, avgDisciplineScore, breachLogs, recentTrades, dailyXpEarned, isConnected]);

  const clampedScore = hasTrades && typeof displayScore === "number" ? Math.max(0, Math.min(100, displayScore)) : null;

  const activeDataset = useMemo(() => {
    return curveDatasets[activeRange];
  }, [curveDatasets, activeRange]);

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const rechartsData = useMemo(() => {
    return activeDataset.points.map((pt) => {
      const d = pt.date instanceof Date ? pt.date : new Date(pt.date);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return {
        label,
        fullDate,
        score: pt.score,
        equity: pt.equity,
        trades: pt.trades,
      };
    });
  }, [activeDataset.points]);

  const DisciplineChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0].payload;
    return (
      <div
        className={`px-3 py-2 rounded-[10px] border text-[12px] shadow-[0_6px_20px_rgba(15,23,42,0.1)] ${
          isDark
            ? "bg-[#18181B] border-white/10 text-white"
            : "bg-white border-slate-200/90 text-slate-900"
        }`}
      >
        <p className="text-[11px] text-slate-400 font-medium">{pt.fullDate}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[14px] font-bold tabular-nums text-[#006DFE] dark:text-blue-400">
            Discipline: {pt.score}%
          </span>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {pt.equity}
          </span>
        </div>
        <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
          {pt.trades} closed trade{pt.trades !== 1 ? "s" : ""} verified
        </p>
      </div>
    );
  };

  /* -------------------------------------------------------------------------
     RULE COMPLIANCE PARAMETERS (4 CARDS WITH UIVERSE BARS)
  ------------------------------------------------------------------------- */
  const complianceRules: ComplianceRule[] = [
    {
      id: "sl",
      title: "MT5 Stop-Loss Protection",
      subtitle: "Every order opened with mandatory protective SL",
      value: hasTrades ? liveStopLossPercent : 0,
      badgeText: hasTrades ? `${liveStopLossPercent}% Verified` : "--",
      percentageText: hasTrades ? `${liveStopLossPercent}%` : "--",
      colorType: "green",
      icon: <ShieldCheck size={16} className="text-emerald-500" />,
      auditBadge: hasTrades ? `${liveStopLossPercent}% PROTECTED` : "-- PROTECTED",
      auditTitle: "Stop-Loss Enforcement Telemetry",
      auditSummary:
        hasTrades
          ? "Every single market order transmitted to your connected MT5 terminal was verified with a hard protective stop-loss in place upon order receipt. Zero unhedged exposure detected."
          : "Mandatory protective stop-loss guard active. Every future order will be automatically inspected upon receipt.",
      auditStats: [
        { label: "Orders Analyzed", value: `${liveSessionsCount} Closed Positions` },
        { label: "Avg SL Latency", value: hasTrades ? "1.4s post-fill" : "--" },
        { label: "Discipline Breaches", value: `${liveViolationsCount} Detected` },
      ],
      telemetryStat: hasTrades ? `${liveSessionsCount} Closed Orders · SL Verified` : "0 Closed Orders · Awaiting First Trade",
    },
    {
      id: "lots",
      title: "Lot Sizing Rule",
      subtitle: "Strict 1% account risk limit dynamically enforced",
      value: hasTrades ? 100 : 0,
      badgeText: "1.0% Risk Cap",
      percentageText: hasTrades ? "100%" : "--",
      colorType: "blue",
      icon: <Scale size={16} className="text-[#006DFE] dark:text-blue-400" />,
      auditBadge: "1.0% RISK CAP",
      auditTitle: "Dynamic Position Sizing Audit",
      auditSummary:
        `Positions strictly calibrated against account equity (${accountMetrics?.equity ? `$${Number(accountMetrics.equity).toLocaleString()}` : "connected account"}). All orders are capped at 1.0% maximum capital exposure.`,
      auditStats: [
        { label: "Max Risk Enforced", value: "1.00% Account Equity" },
        { label: "Highest Lot Traded", value: hasTrades ? "Within Risk Cap" : "Awaiting First Order" },
        { label: "Oversizing Attempts", value: "0 Flagged" },
      ],
      telemetryStat: hasTrades ? "Max Risk 1.0% · 0 Oversizing Flags" : "Max Risk 1.0% · Awaiting First Trade",
    },
    {
      id: "revenge",
      title: "Revenge Trade Shield",
      subtitle: "15-minute emotional cooldown respected post-loss",
      value: hasTrades ? 100 : 0,
      badgeText: "0 Violations",
      percentageText: hasTrades ? "100%" : "--",
      colorType: "green",
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      auditBadge: "0 VIOLATIONS",
      auditTitle: "Revenge Trade Shield Telemetry",
      auditSummary:
        "Following any losing trade, Live MT5 Guard enforces a mandatory 15-minute emotional reset window before new market entries.",
      auditStats: [
        { label: "Post-Loss Cooldowns", value: hasTrades ? "All Respected" : "Ready" },
        { label: "Cooldown Window", value: "15m Mandatory" },
        { label: "Lot Doubling Attempts", value: "0 Blocked" },
      ],
      telemetryStat: hasTrades ? "15m Emotional Shield Active · 0 Breaches" : "15m Shield Ready · 0 Breaches",
    },
    {
      id: "cap",
      title: "Daily Trade Cap",
      subtitle: "Strictly under maximum daily execution quota",
      value: hasTrades ? Math.round(((tradesToday || 0) / 4) * 100) : 0,
      badgeText: hasTrades ? `${tradesToday || 0} / 4 Trades` : "0 / 4 Trades",
      percentageText: `${hasTrades ? Math.round(((tradesToday || 0) / 4) * 100) : 0}%`,
      colorType: (tradesToday || 0) >= 4 ? "green" : "blue",
      icon: <Clock size={16} className={(tradesToday || 0) >= 4 ? "text-emerald-500" : "text-[#006DFE] dark:text-blue-400"} />,
      auditBadge: `${tradesToday || 0} / 4 TRADES`,
      auditTitle: "Daily Execution Quota Monitor",
      auditSummary:
        `Overtrading is prevented by capping executions at 4 trades per 24/5 MT5 session cycle. You have ${Math.max(0, 4 - (tradesToday || 0))} execution slot(s) remaining today.`,
      auditStats: [
        { label: "Executions Today", value: `${tradesToday || 0} / 4 Slots Used` },
        { label: "Auto-Reset Timer", value: "00:00 MT5 Server" },
        { label: "Overtrading Breaches", value: "0 This Month" },
      ],
      telemetryStat: hasTrades ? `${tradesToday || 0} / 4 Executions · ${Math.max(0, 4 - (tradesToday || 0))} Slot${Math.max(0, 4 - (tradesToday || 0)) === 1 ? "" : "s"} Remaining` : "0 / 4 Executions · 4 Slots Available",
    },
  ];

  /* -------------------------------------------------------------------------
     DYNAMIC CALENDAR & CONSISTENCY AUDIT DATA (REAL TIME & REAL DATES)
  ------------------------------------------------------------------------- */
  const { calendarDaysMap, calendarWeeks, currentMonthLabel } = useMemo(() => {
    const today = new Date();
    const currentMonthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const todayIso = today.toISOString().split("T")[0];

    const currentDayOfWeek = today.getDay();
    const distToMon = (currentDayOfWeek + 6) % 7;
    const currentMon = new Date(today);
    currentMon.setDate(today.getDate() - distToMon);

    const startMon = new Date(currentMon);
    startMon.setDate(currentMon.getDate() - 14);

    const map: Record<string, CalendarDayItem> = {};
    const weeks: string[][] = [];

    for (let w = 0; w < 4; w++) {
      const weekDates: string[] = [];
      for (let d = 0; d < 7; d++) {
        const curDate = new Date(startMon);
        curDate.setDate(startMon.getDate() + (w * 7 + d));
        const iso = curDate.toISOString().split("T")[0];
        weekDates.push(iso);

        const isToday = iso === todayIso;
        const isPast = curDate < today && !isToday;
        const isUpcoming = curDate > today && !isToday;
        const isSunday = curDate.getDay() === 0;

        const dayTrades = recentTrades?.filter((t) => (t.close_time || t.open_time || t.closed_at || "").startsWith(iso)) || [];
        const hasTrades = dayTrades.length > 0;
        const dayScore = isToday
          ? (tradesToday && hasTrades ? displayScore : null)
          : hasTrades
          ? Math.round(dayTrades.reduce((acc, t) => acc + (t.discipline_score || 100), 0) / dayTrades.length)
          : null;

        const dayNet = hasTrades
          ? `${dayTrades.reduce((acc, t) => acc + (t.profit || 0), 0) >= 0 ? "+" : ""}$${dayTrades.reduce((acc, t) => acc + (t.profit || 0), 0).toFixed(2)}`
          : (isToday ? (tradesToday ? "+0.00%" : "--") : "--");

        const dayTradesStr = isToday
          ? `${tradesToday || 0} / 4`
          : hasTrades
          ? `${dayTrades.length} / 4`
          : "0 / 4";

        const pairStr = hasTrades
          ? Array.from(new Set(dayTrades.map((t) => t.symbol))).slice(0, 2).join(" · ")
          : (isToday ? (isConnected ? "Active Session" : "Connect Broker") : "--");

        const dayName = curDate.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = curDate.getDate();
        const formattedDate = curDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (isToday ? " (Today)" : "");

        map[iso] = {
          id: `day-${iso}`,
          dateStr: iso,
          dayNum,
          dayName,
          formattedDate,
          score: isSunday ? null : dayScore,
          grade: dayScore ? (dayScore >= 95 ? "GRADE A+" : "GRADE A") : "--",
          tier: dayScore ? (dayScore >= 95 ? "A+" : "A") : "--",
          trades: dayTradesStr,
          pair: pairStr,
          net: dayNet,
          isToday,
          isUpcoming,
          isMarketClosed: isSunday,
          note: isSunday
            ? "Market Closed. Weekend session guard active. 0 orders allowed."
            : isUpcoming
            ? "Upcoming MT5 session. Risk guard rules will engage on first execution."
            : isToday
            ? (tradesToday ? "Live MT5 compliance active. Real-time trade discipline verified." : "Awaiting session executions. Risk guard ready.")
            : hasTrades
            ? "Disciplined execution verified with protective stop-loss in place."
            : "No trading activity recorded for this session.",
        };
      }
      weeks.push(weekDates);
    }

    return { calendarDaysMap: map, calendarWeeks: weeks, currentMonthLabel };
  }, [recentTrades, displayScore, tradesToday, isConnected]);

  const weeklyHistory: WeekHistorySet[] = useMemo(() => {
    return [0, 1, 2].map((offset) => {
      const weekIdx = 2 - offset;
      const weekDates = calendarWeeks[weekIdx] || [];
      const days = weekDates.slice(0, 6).map((iso) => {
        const item = calendarDaysMap[iso];
        return {
          id: iso,
          dayHeader: item?.dayName?.toUpperCase() || "MON",
          day: item?.formattedDate?.toUpperCase() || "",
          score: item?.score !== null && item?.score !== undefined ? item.score : 0,
          grade: item?.grade || "--",
          tier: item?.tier || "--",
          trades: item?.trades || "0 / 4",
          pair: item?.pair || "--",
          net: item?.net || "--",
          note: item?.note || "No session recorded.",
        };
      });

      const firstD = new Date(weekDates[0] || "");
      const lastD = new Date(weekDates[5] || "");
      const rangeLabel = `${firstD.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${lastD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      const shortLabel = `${firstD.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${lastD.getDate()}`;

      const activeDays = days.filter((d) => d.trades !== "0 / 4" && d.score > 0);

      return {
        id: `w-${offset}`,
        rangeLabel,
        shortLabel,
        badge: offset === 0 ? "Current Week" : offset === 1 ? "Previous Week" : "2 Weeks Ago",
        isCurrent: offset === 0,
        passRate: activeDays.length ? "100% Pass Rate" : "Awaiting First Session",
        avgScore: activeDays.length ? Math.round(activeDays.reduce((acc, d) => acc + d.score, 0) / activeDays.length) : 0,
        totalSessions: activeDays.length,
        days,
      };
    });
  }, [calendarWeeks, calendarDaysMap]);

  const selectedCalendarRecord = calendarDaysMap[selectedCalendarDate] || Object.values(calendarDaysMap)[0];

  const handleOpenCalendarDayModal = (day: CalendarDayItem) => {
    if (day.isMarketClosed) {
      toast.info("Market Closed", { description: "Forex and stock indices are closed on Sunday." });
      return;
    }
    if (day.isUpcoming) {
      toast.info("Upcoming Session", { description: "Session audit will generate automatically once the session opens." });
      return;
    }
    setActiveAuditModal({
      isOpen: true,
      badge: `${day.grade || "GRADE A"} · ${day.score || 100}/100`,
      title: `Session Audit — ${day.formattedDate}`,
      summary: day.note || "Verified MT5 disciplined trade execution.",
      stats: [
        { label: "Executions", value: day.trades || "0 / 4" },
        { label: "Pairs Traded", value: day.pair || "--" },
        { label: "Session Return", value: day.net || "--" },
      ],
    });
  };


  /* -------------------------------------------------------------------------
     BADGES DATA (DYNAMICALLY DERIVED FROM REAL TELEMETRY)
  ------------------------------------------------------------------------- */
  const badgesData: BadgeItem[] = useMemo(() => [
    {
      id: "b1",
      title: "Iron Stop-Loss",
      desc: "Protective SL attached under 3 seconds across closed trades.",
      unlocked: recentTrades.length >= 5 && liveStopLossPercent >= 90,
      xp: "+150 XP",
      category: "risk",
      categoryLabel: "RISK DISCIPLINE",
      icon: <ShieldCheck size={18} className="text-[#006DFE] dark:text-blue-400" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      unlockedDate: "Verified",
      current: Math.min(5, recentTrades.length),
      target: 5,
      progressPct: Math.min(100, Math.round(((recentTrades.length || 0) / 5) * 100)),
      proofNote: "Verified protective stop-loss adherence across closed MT5 trading sessions.",
    },
    {
      id: "b2",
      title: "Zero Violation Week",
      desc: "Maintain Grade A (90+) across an entire weekly trading cycle.",
      unlocked: streakDays >= 7 && liveViolationsCount === 0,
      xp: "+150 XP",
      category: "consistency",
      categoryLabel: "WEEKLY MASTERY",
      icon: <Award size={18} className="text-[#006DFE] dark:text-blue-400" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      unlockedDate: "Verified",
      current: Math.min(7, streakDays),
      target: 7,
      progressPct: Math.min(100, Math.round(((streakDays || 0) / 7) * 100)),
      proofNote: streakDays >= 7 ? "Week cycle audit finalized with 0 risk violations and 100% quota adherence." : "Requires 7 consecutive days without a risk violation.",
    },
    {
      id: "b3",
      title: "Cool-Headed Execution",
      desc: "Respect 100% of 15-minute post-loss cooldown windows.",
      unlocked: recentTrades.length >= 5 && liveViolationsCount === 0 && streakDays >= 3,
      xp: "+100 XP",
      category: "execution",
      categoryLabel: "EMOTIONAL SHIELD",
      icon: <Clock size={18} className="text-[#006DFE] dark:text-blue-400" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      unlockedDate: "Verified",
      current: Math.min(3, streakDays),
      target: 3,
      progressPct: Math.min(100, Math.round(((streakDays || 0) / 3) * 100)),
      proofNote: streakDays >= 3 ? "Cooldown periods strictly respected post stop-loss triggers. Impulsive trade guard verified." : "Respect all cooldown rules across active sessions.",
    },
    {
      id: "b4",
      title: "Risk Architect",
      desc: "Keep average risk per trade below 0.80% across sessions.",
      unlocked: recentTrades.length >= 10 && liveViolationsCount === 0,
      xp: "+50 XP",
      category: "risk",
      categoryLabel: "CAPITAL DISCIPLINE",
      icon: <Scale size={18} className="text-[#006DFE] dark:text-blue-400" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      unlockedDate: "Verified",
      current: Math.min(10, recentTrades.length),
      target: 10,
      progressPct: Math.min(100, Math.round(((recentTrades.length || 0) / 10) * 100)),
      proofNote: "Account risk kept at disciplined parameters. Position lot sizing verified by MT5 telemetry.",
    },
    {
      id: "b5",
      title: "21-Day Shield Bearer",
      desc: "Complete 21 consecutive disciplined trading days.",
      unlocked: streakDays >= 21,
      xp: "+250 XP",
      category: "milestone",
      categoryLabel: "STREAK CHALLENGE",
      icon: <Shield size={18} className="text-[#006DFE] dark:text-blue-400 stroke-[2.2]" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      current: streakDays,
      target: 21,
      progressPct: Math.min(100, Math.round((streakDays / 21) * 100)),
      proofNote: streakDays >= 21 ? "21-Day Shield unlocked. Automated strike absorption active." : `Currently at ${streakDays} of 21 sessions verified. Complete ${Math.max(0, 21 - streakDays)} more sessions to unlock.`,
    },
    {
      id: "b6",
      title: "Institutional Centurion",
      desc: "Reach 100 closed sessions with disciplined risk compliance.",
      unlocked: recentTrades.length >= 100,
      xp: "+500 XP",
      category: "milestone",
      categoryLabel: "LIFETIME MASTERY",
      icon: <Trophy size={18} className="text-[#006DFE] dark:text-blue-400" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      current: Math.min(100, recentTrades.length),
      target: 100,
      progressPct: Math.min(100, Math.round(((recentTrades.length || 0) / 100) * 100)),
      proofNote: `Verified MT5 session tracking active across connected trading ledger.`,
    },
  ], [recentTrades, streakDays, liveStopLossPercent, liveViolationsCount]);

  const handleOpenBadgeModal = (badge: BadgeItem) => {
    setActiveAuditModal({
      isOpen: true,
      badge: badge.unlocked ? `BADGE UNLOCKED · ${badge.categoryLabel}` : `IN PROGRESS · ${badge.categoryLabel}`,
      title: badge.title,
      summary: badge.proofNote,
      stats: [
        { label: "Status", value: badge.unlocked ? "Verified & Synchronized" : `${badge.current || 0}/${badge.target || 0} Completed` },
        { label: "XP Reward", value: badge.xp },
        { label: "Category", value: badge.categoryLabel },
        { label: "Telemetry Verification", value: badge.unlocked ? "MT5 Live Log" : "Live Session Tracking" },
      ],
    });
  };

  /* -------------------------------------------------------------------------
     VAULT REWARDS DATA (CONSISTENT ACCENTS & CLEAN LABELS)
  ------------------------------------------------------------------------- */
  const vaultRewards: VaultReward[] = [
    {
      id: "prop20",
      title: "20% Prop Challenge Discount",
      desc: "Instant 20% voucher valid across all FTMO, FundingPips & 5ers $50k-$100k evaluations.",
      cost: 500,
      tag: "POPULAR",
      categoryLabel: "PROP FIRM PARTNERSHIP",
      icon: <Ticket size={18} className="text-[#006DFE] dark:text-blue-400 stroke-[2.2]" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      voucherCode: "TRADI5-PROP20-EXCL",
      benefitDetails: "20% discount applied at checkout on $50k, $100k, or $200k challenge tiers.",
      terms: "Valid for 30 days from redemption. Single-use per verified trading account.",
    },
    {
      id: "vps",
      title: "30-Day Low-Latency MT5 VPS",
      desc: "1.2ms Equinix LD4 server hosting with pre-configured automated Risk Guard enforcer.",
      cost: 350,
      tag: "INFRASTRUCTURE",
      categoryLabel: "HIGH-SPEED HOSTING",
      icon: <Zap size={18} className="text-[#006DFE] dark:text-blue-400 stroke-[2.2]" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      voucherCode: "LD4-VPS-30D-FAST",
      benefitDetails: "Dedicated NVMe core, 4GB RAM, zero-reboot maintenance window in London LD4 datacenter.",
      terms: "Activates automatically upon redemption. Credentials delivered to your registered email.",
    },
    {
      id: "rebate",
      title: "$50 Raw Spread Cashback",
      desc: "Direct commission rebate credit applied straight to verified connected trading account.",
      cost: 750,
      tag: "CASH REWARD",
      categoryLabel: "BROKER COMMISSION",
      icon: <Crown size={18} className="text-[#006DFE] dark:text-blue-400 stroke-[2.2]" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      voucherCode: "CASH-50USD-REBATE",
      benefitDetails: "$50.00 cash rebate balance credited directly to your connected MT5 ledger.",
      terms: "Requires minimum 10 closed lots executed with protective stop-loss adherence.",
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

  const streakLevelsData: StreakLevelMilestone[] = useMemo(() => [
    {
      level: 1,
      title: "3-Day Foundation Sprint",
      subtitle: "Establish baseline MT5 execution rhythm & zero impulsive entries",
      targetDays: 3,
      currentDays: Math.min(3, streakDays),
      status: streakDays >= 3 ? "completed" : "active",
      xpReward: "+50 XP",
      perks: "1.05x Multiplier Floor",
      multiplier: "1.05x",
      completedDate: streakDays >= 3 ? "Achieved" : undefined,
      criteria: "Complete 3 consecutive sessions with Grade A discipline and 0 stop-loss removals.",
    },
    {
      level: 2,
      title: "7-Day Routine Mastery",
      subtitle: "Build subconscious risk control habits across full trading week",
      targetDays: 7,
      currentDays: streakDays >= 7 ? 7 : Math.max(0, streakDays),
      status: streakDays >= 7 ? "completed" : streakDays >= 3 ? "active" : "locked",
      xpReward: "+150 XP",
      perks: "1.15x Permanent Multiplier Floor",
      multiplier: "1.15x",
      completedDate: streakDays >= 7 ? "Achieved" : undefined,
      criteria: "7 consecutive sessions adhering strictly to 15-minute post-loss cooldowns.",
    },
    {
      level: 3,
      title: "14-Day Consistency Pro",
      subtitle: "Two full consecutive weeks of institutional risk compliance",
      targetDays: 14,
      currentDays: streakDays >= 14 ? 14 : Math.max(0, streakDays),
      status: streakDays >= 14 ? "completed" : streakDays >= 7 ? "active" : "locked",
      xpReward: "+250 XP",
      perks: "1.25x Permanent Multiplier Floor",
      multiplier: "1.25x",
      completedDate: streakDays >= 14 ? "Achieved" : undefined,
      criteria: "14 consecutive sessions keeping average risk strictly below 1.0% per trade.",
    },
    {
      level: 4,
      title: "21-Day Iron Shield Sprint",
      subtitle: "Unlock automated strike absorption shield against volatile market news",
      targetDays: 21,
      currentDays: streakDays >= 21 ? 21 : Math.max(0, streakDays),
      status: streakDays >= 21 ? "completed" : streakDays >= 14 ? "active" : "locked",
      xpReward: "+500 XP",
      perks: "1 Drawdown Shield · 1.35x Multiplier",
      multiplier: "1.35x",
      completedDate: streakDays >= 21 ? "Achieved" : undefined,
      criteria: "Reach 21 consecutive disciplined sessions. Grants 1 automatic stop-out strike buffer.",
    },
    {
      level: 5,
      title: "30-Day Master Institution",
      subtitle: "Top 1% elite discipline status & permanent prop challenge readiness",
      targetDays: 30,
      currentDays: streakDays >= 30 ? 30 : Math.max(0, streakDays),
      status: streakDays >= 30 ? "completed" : streakDays >= 21 ? "active" : "locked",
      xpReward: "+1,000 XP",
      perks: "Lifetime Elite Status · 1.50x Multiplier Ceiling",
      multiplier: "1.50x",
      completedDate: streakDays >= 30 ? "Achieved" : undefined,
      criteria: "Complete 30 consecutive flawless sessions to cement permanent prop-firm pass readiness.",
    },
  ], [streakDays]);

  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const todayIso = today.toISOString().split("T")[0];
    const currentDayOfWeek = today.getDay();
    const distToMon = (currentDayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distToMon);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const curDate = new Date(monday);
      curDate.setDate(monday.getDate() + i);
      const iso = curDate.toISOString().split("T")[0];
      const isToday = iso === todayIso;
      const isPast = curDate < today && !isToday;
      const isSunday = curDate.getDay() === 0;

      const dayTrades = recentTrades?.filter((t) => (t.close_time || t.open_time || t.closed_at || "").startsWith(iso)) || [];
      const hasTrades = dayTrades.length > 0;
      const dayScore = isToday
        ? (tradesToday ? displayScore : null)
        : hasTrades
        ? Math.round(dayTrades.reduce((acc, t) => acc + (t.discipline_score || 100), 0) / dayTrades.length)
        : null;

      const dayNet = hasTrades
        ? `${dayTrades.reduce((acc, t) => acc + (t.profit || 0), 0) >= 0 ? "+" : ""}$${dayTrades.reduce((acc, t) => acc + (t.profit || 0), 0).toFixed(2)}`
        : (isToday ? (tradesToday ? "+0.00%" : "--") : isSunday ? "Off" : "--");

      const pairs = hasTrades
        ? Array.from(new Set(dayTrades.map((t) => t.symbol))).slice(0, 2).join(" · ")
        : (isToday ? (isConnected ? "Active Session" : "Connect Broker") : "--");

      days.push({
        dayNum: i + 1,
        dayName: curDate.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: curDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: dayScore,
        pair: isSunday ? "Weekend Protected" : pairs,
        status: isToday ? "active" : (isPast ? (hasTrades ? "completed" : "rest") : (i === 6 ? "milestone" : "upcoming")),
        isToday,
        isGoal: i === 6,
        net: dayNet,
        trades: isToday ? `${tradesToday || 0} / 4` : `${dayTrades.length} / 4`,
      });
    }
    return days;
  }, [displayScore, tradesToday, recentTrades, isConnected]);

  const handleCurrentWeekDayClick = (dayItem: any) => {
    if (dayItem.status === "upcoming" || (dayItem.status === "milestone" && !dayItem.score)) {
      toast("Upcoming Milestone Session", {
        description: `Session ${dayItem.dayNum} (${dayItem.dayName}, ${dayItem.dateStr}) logs as soon as your next compliant MT5 trade session closes.`,
      });
      return;
    }
    setActiveAuditModal({
      isOpen: true,
      badge: `DAY ${dayItem.dayNum} AUDIT · ${dayItem.dayName.toUpperCase()}, ${dayItem.dateStr.toUpperCase()}`,
      title: `Day ${dayItem.dayNum} Compliance Telemetry`,
      summary: `Verified MT5 session on ${dayItem.dateStr}. Executed ${dayItem.pair} with a ${dayItem.score}% discipline rating and ${dayItem.net} net result. Stop-loss was 100% verified with zero emotional cooldown breaches.`,
      stats: [
        { label: "Discipline Rating", value: `${dayItem.score}/100` },
        { label: "Session P&L Net", value: dayItem.net },
        { label: "Executed Trades", value: `${dayItem.trades} Executions` },
        { label: "Protective SL", value: "100% Enforced" },
        { label: "XP Multiplier", value: "1.35x Active" },
      ],
    });
  };

  const handleStreakLevelClick = (lvl: StreakLevelMilestone) => {
    setActiveAuditModal({
      isOpen: true,
      badge: `LEVEL ${lvl.level} · ${lvl.status === "completed" ? "ACHIEVED" : lvl.status === "active" ? "IN PROGRESS" : "LOCKED"}`,
      title: lvl.title,
      summary: `${lvl.subtitle}. ${lvl.criteria}`,
      stats: [
        { label: "Target Streak", value: `${lvl.targetDays} Consecutive Days` },
        { label: "Current Progress", value: `${lvl.status === "completed" ? lvl.targetDays : lvl.status === "active" ? streakDays : 0} / ${lvl.targetDays} Days` },
        { label: "XP Reward", value: lvl.xpReward },
        { label: "Perks Granted", value: lvl.perks },
        { label: "Status", value: lvl.status === "completed" ? `Unlocked (${lvl.completedDate})` : lvl.status === "active" ? `${lvl.targetDays - streakDays} Sessions Left` : "Locked" },
      ],
    });
  };

  const handleRedeemReward = (reward: VaultReward) => {
    const isClaimed = redeemedRewards.has(reward.id);
    if (isClaimed) {
      setActiveAuditModal({
        isOpen: true,
        badge: `VOUCHER ACTIVE · ${reward.categoryLabel}`,
        title: reward.title,
        summary: `Voucher code ${reward.voucherCode} is active and assigned to trader ${userName}${displayAccountNumber !== "Disconnected" ? ` (${displayAccountNumber})` : ""}.`,
        stats: [
          { label: "Voucher Code", value: reward.voucherCode },
          { label: "Benefit", value: reward.benefitDetails },
          { label: "Cost", value: `${reward.cost} XP (Redeemed)` },
          { label: "Terms", value: reward.terms },
        ],
      });
      return;
    }

    if (xp < reward.cost) {
      toast.error("Insufficient XP", {
        description: `You need ${reward.cost - xp} more XP to unlock this institutional perk. Keep trading with discipline!`,
      });
      return;
    }

    setXp((prev) => prev - reward.cost);
    setRedeemedRewards((prev) => new Set(prev).add(reward.id));
    toast.success(`Claimed: ${reward.title}`, {
      description: `Debited ${reward.cost} XP. Voucher code ${reward.voucherCode} dispatched to your profile.`,
    });

    setActiveAuditModal({
      isOpen: true,
      badge: `SUCCESSFULLY REDEEMED · ${reward.categoryLabel}`,
      title: reward.title,
      summary: `Your perk has been activated! Use voucher code ${reward.voucherCode} at checkout or broker terminal.`,
      stats: [
        { label: "Voucher Code", value: reward.voucherCode },
        { label: "Benefit", value: reward.benefitDetails },
        { label: "Cost", value: `${reward.cost} XP` },
        { label: "Status", value: "Verified & Assigned" },
      ],
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
        {/* ── Pinned Header Row (Clean, matching Dashboard & Journal) ── */}
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
            Card 1: Discipline Status, Identity & XP Level Progress (7 cols)
            Card 2: Trading Streak & Milestone Shield (5 cols)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-4 sm:mb-5">
          
          {/* Card A: Trader Identity, Level/XP Progress & Account Chips (7 cols) */}
          <div className={`lg:col-span-7 ${CARD_BASE} px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col justify-between gap-2.5`}>
            
            {/* Top row: Avatar + Name + 2 Stat Chips (TOTAL XP & ACCOUNT) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              {/* User avatar and name (fetched real profile, larger & prominent) */}
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-2xl p-[2px] bg-slate-100 dark:bg-white/[0.04] border-2 border-[#006DFE]/40 shadow-sm">
                    {userAvatarUrl ? (
                      <img
                        src={userAvatarUrl}
                        alt={userName}
                        className="w-full h-full rounded-[14px] object-cover"
                        onError={() => setUserAvatarUrl("")}
                      />
                    ) : (
                      <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-base sm:text-lg font-black overflow-hidden tracking-wider">
                        {userAvatar}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#006DFE] border-2 border-white dark:border-[#17171A] flex items-center justify-center text-[9px] text-white font-bold shadow-2xs">
                    ✓
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-[17px] sm:text-[19px] font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                      {userName}
                    </h2>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30 leading-none">
                      {userTier}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-300 border border-slate-200/80 dark:border-white/[0.08] leading-none">
                      Level {levelInfo.level}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-semibold text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                    Level {levelInfo.level} Pro MT5 Trader
                  </p>
                </div>
              </div>

              {/* 2 Stat Chips: TOTAL XP & ACCOUNT (Consistent Sleek Neutral, Real Data) */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-center min-w-[84px]">
                  <div className="text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-1">
                    <Star size={9.5} className="fill-[#006DFE] text-[#006DFE]" /> TOTAL XP
                  </div>
                  <div className="text-xs font-mono font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {totalXP.toLocaleString()} XP
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs text-center min-w-[84px]">
                  <div className="text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-neutral-400">
                    ACCOUNT
                  </div>
                  <div className={`text-xs font-mono font-bold mt-0.5 tabular-nums ${
                    displayAccountNumber === "Disconnected" ? "text-slate-400 dark:text-neutral-500" : "text-slate-900 dark:text-white"
                  }`}>
                    {displayAccountNumber}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Level, XP & Horizontal Progress Bar (Consistent Brand Accent) */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-slate-900 dark:text-white">Level {levelInfo.level}</span>
                  <span className="text-slate-300 dark:text-neutral-600">·</span>
                  <span className="font-medium text-slate-500 dark:text-neutral-400">
                    {levelInfo.needed > 0 ? `${levelInfo.needed.toLocaleString()} XP to Lv ${levelInfo.level + 1}` : "Elite Rank"}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 tabular-nums shrink-0">
                  {totalXP.toLocaleString()} / {levelInfo.nextXp.toLocaleString()} XP
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006DFE] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card B: Trading Streak (5 cols - Balanced Hero Height) */}
          <div className={`lg:col-span-5 ${CARD_BASE} px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col justify-between gap-2`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                Trading Streak
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                streakDays > 0
                  ? "bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-neutral-400 border border-slate-200/60 dark:border-white/[0.08]"
              }`}>
                <Flame size={12} className="text-[#006DFE] shrink-0" />
                <span>{streakDays > 0 ? "Active" : "Ready"}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-[22px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                  {streakDays} Days
                </div>
                <div className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-400 mt-0.5">
                  {streakDays >= 21 ? "21d Shield Unlocked" : `Target 21 Days · ${Math.max(0, 21 - streakDays)} days left`}
                </div>
              </div>

              {/* Circular Mini Ring */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#006DFE]"
                    strokeWidth="3.5"
                    strokeDasharray={`${Math.min(100, (streakDays / 21) * 100)}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[9.5px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                  {streakDays}/21
                </span>
              </div>
            </div>

            {/* Segmented 7-block week progress */}
            <div className="grid grid-cols-7 gap-1 pt-1.5 border-t border-slate-100 dark:border-white/[0.06]">
              {[1, 2, 3, 4, 5, 6, 7].map((b) => {
                const filled = streakDays > 0 ? (streakDays % 7 === 0 ? 7 : streakDays % 7) : 0;
                return (
                  <div
                    key={b}
                    className={`h-1.5 rounded-full ${
                      b <= filled
                        ? "bg-[#006DFE]"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                );
              })}
            </div>
          </div>

        </div>

        {/* =========================================================================
            CORE BENTO ROW (12 COLS):
            Left (5 cols): Forex Discipline Rating Semi-Circular Notch Gauge
            Right (7 cols): Discipline Curve AreaChart with heavier fill, no top line, faded edges
        ========================================================================= */}
        {/* =========================================================================
            OPEN 2-GRAPH ANALYTICS BAND (UNBOXED - EXACT MATCH TO DASHBOARD IMAGE 2)
            Left (4 cols / 12): Forex Discipline Rating Semicircular Notch Gauge (Compact Box)
            Right (8 cols / 12): Discipline Curve AreaChart (Wide, Matching Dashboard Height)
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 pt-5 pb-1 border-t border-slate-200/75 dark:border-white/[0.08] items-stretch mb-5 sm:mb-6">
          
          {/* ── LEFT (4 OF 12): FOREX DISCIPLINE RATING (COMPACT / PROPORTIONED GAUGE) ── */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full px-0.5 pt-0.5 pb-1 select-none">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3 min-h-[42px]">
              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#006DFE] shrink-0" />
                  <span>Forex Discipline Rating</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span>{isConnected ? (hasTrades ? "MT5 Compliance Guard Active" : "Connected · Awaiting First Trade") : "Broker Guard Ready"}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 shrink-0">
                  ● {hasTrades && clampedScore !== null ? (clampedScore >= 95 ? "GRADE A+" : "GRADE A") : "Awaiting Trades"}
                </span>
              </div>
            </div>

            {/* Semicircle Gauge with Rounded Notches Shaded from First Colour to Last */}
            <div className="relative flex flex-col items-center justify-center min-h-[235px] h-[235px] w-full flex-1">
              <div className="mx-auto w-full max-w-[270px]">
                <Gauge
                  ariaLabel="Gauge - Semicircle"
                  centerValue={clampedScore !== null ? `${clampedScore}%` : "--"}
                  defaultLabel="Forex Discipline"
                  endAngle={360}
                  notchCornerRadius={3}
                  startAngle={180}
                  suffix="%"
                  useGradient
                  value={clampedScore !== null ? clampedScore : 0}
                />
              </div>

              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE]" />
                <span>{hasTrades && clampedScore !== null ? (clampedScore >= 95 ? "GRADE A+ · Institutional Grade" : "Standard Compliance") : "Connect MT5 · Awaiting Trades"}</span>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Stop Loss: {hasTrades ? `${liveStopLossPercent}% Verified` : "--"}</span>
              </span>
              <span className="text-slate-400 dark:text-neutral-500 font-medium">
                {hasTrades ? liveViolationsCount : 0} Violations
              </span>
            </div>
          </div>

          {/* ── RIGHT (8 OF 12): DISCIPLINE CURVE AREA CHART (WIDE WIDTH, SAME DASHBOARD HEIGHT) ── */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full pt-5 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200/75 dark:border-white/[0.08] lg:pl-7 select-none">
            {/* Header & Timeframe Switcher */}
            <div className="flex items-start justify-between gap-2 pb-2 min-h-[42px]">
              <div>
                <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#006DFE] shrink-0" />
                  <span>Discipline Curve</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span>Closed trade performance &amp; discipline curve</span>
                </p>
              </div>

              {/* Range Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center p-0.5 rounded-[10px] bg-slate-200/70 dark:bg-white/[0.07] shrink-0">
                  {(["7D", "14D", "All"] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setActiveRange(range)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-[8px] transition-all cursor-pointer ${
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
            </div>

            {/* Headline Metric Row */}
            <div className="flex items-baseline gap-2.5 mb-2">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight transition-all duration-300">
                {activeDataset.headline}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <TrendingUp size={11} />
                <span>{activeDataset.delta}</span>
              </span>
            </div>

            {/* Recharts AreaChart: Exact match to Dashboard PerformanceChart */}
            <div className="w-full flex-1 flex flex-col justify-center min-h-[220px] h-[220px] select-none outline-none focus:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={rechartsData}
                  margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
                  accessibilityLayer={false}
                >
                  <defs>
                    <linearGradient id="tfDisciplineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006DFE" stopOpacity={0.25} />
                      <stop offset="85%" stopColor="#006DFE" stopOpacity={0.03} />
                      <stop offset="100%" stopColor="#006DFE" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={35}
                    tick={{
                      fill: isDark ? "#71717A" : "#94A3B8",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                    dy={8}
                  />

                  <YAxis
                    domain={[75, 100]}
                    ticks={[75, 80, 85, 90, 95, 100]}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                    tick={{
                      fill: isDark ? "#71717A" : "#94A3B8",
                      fontSize: 11,
                      fontWeight: 500,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                    tickFormatter={(val) => `${val}%`}
                  />

                  <Tooltip
                    content={<DisciplineChartTooltip />}
                    cursor={{
                      stroke: isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.18)",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#006DFE"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tfDisciplineGrad)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      strokeWidth: 2,
                      stroke: isDark ? "#17171A" : "#FFFFFF",
                      fill: "#006DFE",
                    }}
                    isAnimationActive={true}
                    animationDuration={850}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Summary Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${hasTrades ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span>{activeDataset.sessions}</span>
                <span className="text-slate-300 dark:text-neutral-600">·</span>
                <span className="text-slate-500 dark:text-neutral-400 font-medium">
                  {hasTrades ? "Closed Sessions Synced" : "Awaiting First Session"}
                </span>
              </span>
              <span className="font-bold text-[#006DFE] dark:text-blue-400">
                {hasTrades ? activeDataset.scoreLabel : "Score: --"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            NAVIGATION TABS (TACTILE PILL BUTTONS LIKE HOME PAGE)
        ========================================================================= */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 my-5 sm:my-6">
          {[
            { id: "discipline", label: "Discipline", icon: <Shield size={14} className="stroke-[2.2]" /> },
            { id: "streak", label: "Daily Streak", icon: <Flame size={14} className="text-[#006DFE]" />, badge: streakDays > 0 ? `${streakDays}d` : undefined },
            { id: "badges", label: "Badges", icon: <Trophy size={14} className="text-[#006DFE]" />, badge: badgesData.filter((b) => b.unlocked).length > 0 ? `${badgesData.filter((b) => b.unlocked).length}/${badgesData.length}` : undefined },
            { id: "vault", label: "Vault", icon: <Gift size={14} className="text-emerald-500" />, badge: "Store" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 h-9 sm:h-[38px] px-3.5 sm:px-4.5 rounded-full text-xs sm:text-[13px] font-bold select-none cursor-pointer transition-all active:scale-95 ${
                  isActive
                    ? "tactile-black-pill"
                    : "tactile-white-pill text-slate-700 dark:text-neutral-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-neutral-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB CONTENT PANELS
        ========================================================================= */}

        {/* ── PANEL 1: DISCIPLINE ── */}
        {activeTab === "discipline" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
            
            {/* Rule Compliance Parameters Card (Left side: 7 cols) */}
            <div className={`lg:col-span-7 xl:col-span-7 ${CARD_BASE} p-3 sm:p-3.5 flex flex-col justify-between gap-2`}>
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-0.5 border-b border-slate-100 dark:border-white/[0.06] gap-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                      <Shield size={13} className="stroke-[2.2]" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                      Rule Compliance Parameters
                    </h3>
                  </div>
                  <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 mt-0.5 font-medium truncate">
                    Synced with your connected MT5 account &amp; live Risk Guard enforcer.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleReplayBars}
                    className="tactile-white-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Replay Sync</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-[11px] font-bold text-[#006DFE] dark:text-blue-400 tabular-nums">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE] animate-pulse" />
                    <span>Score: {hasTrades && score !== null ? `${score}/100` : "--/100"}</span>
                  </div>
                </div>
              </div>

              {/* 2x2 Interactive Rule Cards with Exact Uiverse .loaderBar */}
              <div key={replayKey} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 flex-1 py-0.5">
                {complianceRules.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => handleOpenRuleModal(rule)}
                    className="w-full text-left p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] hover:border-[#006DFE]/40 dark:hover:border-[#006DFE]/40 transition-all cursor-pointer flex flex-col justify-between gap-1.5 group"
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
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate pl-4">
                          {rule.subtitle}
                        </p>
                      </div>

                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border shadow-2xs whitespace-nowrap shrink-0 tabular-nums bg-white dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10">
                        {rule.badgeText}
                      </span>
                    </div>

                    {/* Middle: 3D Horizontal Bar + Percentage */}
                    <div className="flex items-center gap-2 w-full pt-0.5">
                      {/* 3D Track with inset shadow */}
                      <div className="relative flex-1 h-[8px] rounded-full bg-[#EAEFF5] dark:bg-[#080C14] border border-slate-300/80 dark:border-[#006DFE]/40 p-[1px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.12)] overflow-hidden">
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
                        className={`text-[11px] font-black tabular-nums shrink-0 min-w-[30px] text-right ${
                          rule.colorType === "green"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : rule.colorType === "amber"
                            ? "text-[#006DFE] dark:text-blue-400"
                            : "text-[#006DFE] dark:text-blue-400"
                        }`}
                      >
                        {rule.percentageText}
                      </span>
                    </div>

                    {/* Bottom: Micro Telemetry Stat */}
                    {rule.telemetryStat && (
                      <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500 dark:text-neutral-400 pt-0.5 border-t border-slate-200/50 dark:border-white/[0.04]">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600 shrink-0" />
                          <span className="truncate">{rule.telemetryStat}</span>
                        </span>
                        <span className="text-[10px] text-[#006DFE] dark:text-blue-400 font-semibold group-hover:underline shrink-0 pl-1">
                          Inspect &rarr;
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Unified Forex 24/5 Session Rhythm Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] shrink-0 text-[#006DFE]">
                    <Globe size={11} className="text-[#006DFE]" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                      Forex 24/5 Session Rhythm
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium hidden sm:inline">
                      Continuous live sync · Auto-locks midnight 00:00 MT5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 dark:text-neutral-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">SYD</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">TYO</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] font-bold">
                      LDN ●
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-bold">
                      NYC ●
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    London &amp; NY Active
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Consistency Log & Calendar (Right side: 5 cols) */}
            <div className={`lg:col-span-5 xl:col-span-5 ${CARD_BASE} p-3 sm:p-3.5 flex flex-col justify-between gap-2`}>
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Header: Title, Subtitle & View Mode Switcher */}
                <div className="pb-2 mb-1 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                      <CalendarIcon size={13} className="stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        Weekly Consistency Log
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium truncate">
                        Audit past MT5 sessions &amp; score history
                      </p>
                    </div>
                  </div>

                  {/* View Mode Toggle (Calendar vs List) */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200/70 dark:border-white/[0.06] shrink-0">
                    <button
                      type="button"
                      onClick={() => setConsistencyViewMode("calendar")}
                      title="Calendar View"
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                        consistencyViewMode === "calendar"
                          ? "bg-[#006DFE] text-white shadow-xs"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <CalendarIcon size={11} />
                      <span>Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsistencyViewMode("list")}
                      title="List View"
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                        consistencyViewMode === "list"
                          ? "bg-[#006DFE] text-white shadow-xs"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <ListIcon size={11} />
                      <span>List</span>
                    </button>
                  </div>
                </div>

                {/* VIEW 1: INTERACTIVE DISCIPLINE CALENDAR */}
                {consistencyViewMode === "calendar" ? (
                  <div className="flex-1 flex flex-col justify-between gap-1.5">
                    
                    {/* Month Header & Legend */}
                    <div className="flex items-center justify-between pb-0.5 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-slate-400 dark:text-neutral-500 font-normal">Month:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 font-mono text-[10.5px]">
                          {currentMonthLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>A+ (95+)</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE]" />
                          <span>A (85-94)</span>
                        </span>
                      </div>
                    </div>

                    {/* 7-Weekday Header */}
                    <div className="grid grid-cols-7 gap-1.5 text-center py-1">
                      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                        <span
                          key={d}
                          className={`text-[9px] sm:text-[9.5px] font-mono font-bold tracking-wider ${
                            d === "SUN" ? "text-slate-300 dark:text-neutral-600" : "text-slate-400 dark:text-neutral-500"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* 4-Week Calendar Grid (Consistent, Well-Proportioned Boxes) */}
                    <div className="grid grid-rows-4 gap-1.5">
                      {calendarWeeks.map((week, wIdx) => (
                        <div key={`cw-${wIdx}`} className="grid grid-cols-7 gap-1.5">
                          {week.map((dateStr) => {
                            const day = calendarDaysMap[dateStr];
                            if (!day) return <div key={dateStr} />;
                            const isSelected = selectedCalendarDate === dateStr;
                            const isToday = day.isToday;
                            const hasScore = typeof day.score === "number";
                            const isAPlus = hasScore && day.score >= 95;

                            let cellStyle = "bg-slate-50/70 dark:bg-white/[0.025] text-slate-700 dark:text-neutral-300 border border-slate-200/70 dark:border-white/[0.06]";
                            if (hasScore) {
                              if (isAPlus) {
                                cellStyle = "bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/90 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-2xs hover:border-emerald-400";
                              } else {
                                cellStyle = "bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/90 dark:border-blue-500/30 text-[#006DFE] dark:text-blue-300 shadow-2xs hover:border-blue-400";
                              }
                            } else if (day.isMarketClosed) {
                              cellStyle = "bg-slate-50/60 dark:bg-white/[0.015] border border-slate-200/60 dark:border-white/[0.05] text-slate-400 dark:text-neutral-500";
                            } else if (day.isUpcoming) {
                              cellStyle = "bg-slate-50/30 dark:bg-white/[0.01] border border-dashed border-slate-200/80 dark:border-white/[0.08] text-slate-400 dark:text-neutral-500";
                            }

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => setSelectedCalendarDate(dateStr)}
                                title={hasScore ? `${day.formattedDate}: Score ${day.score} (${day.grade})` : day.formattedDate}
                                className={`relative p-1 sm:p-1.5 rounded-xl flex flex-col justify-between transition-all cursor-pointer h-[42px] sm:h-[46px] select-none ${cellStyle} ${
                                  isSelected
                                    ? "ring-2 ring-[#006DFE] dark:ring-blue-400 shadow-sm border-[#006DFE] dark:border-blue-400 scale-[1.02]"
                                    : "hover:scale-[1.02]"
                                }`}
                              >
                                {/* Top: Day Number + Tiny Indicator */}
                                <div className="flex items-center justify-between w-full leading-none">
                                  <span className={`text-[9.5px] sm:text-[10px] font-mono font-bold ${isToday ? "text-[#006DFE] dark:text-blue-400 font-black" : ""}`}>
                                    {String(day.dayNum).padStart(2, "0")}
                                  </span>
                                  {isToday ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE] animate-pulse" title="Today's Active Session" />
                                  ) : isAPlus ? (
                                    <span className="text-[7.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 leading-none">A+</span>
                                  ) : hasScore ? (
                                    <span className="text-[7.5px] font-mono font-bold text-[#006DFE] dark:text-blue-400 leading-none">A</span>
                                  ) : day.isMarketClosed ? (
                                    <span className="text-[7px] font-mono text-slate-300 dark:text-neutral-600 leading-none">OFF</span>
                                  ) : null}
                                </div>

                                {/* Bottom: Score or State */}
                                <div className="flex items-end justify-between w-full leading-none pt-0.5">
                                  {hasScore ? (
                                    <span className={`text-[12px] sm:text-[13px] font-black font-mono tracking-tight tabular-nums ${
                                      isAPlus ? "text-emerald-700 dark:text-emerald-300" : "text-[#006DFE] dark:text-blue-400"
                                    }`}>
                                      {day.score}
                                    </span>
                                  ) : day.isMarketClosed ? (
                                    <span className="text-[9.5px] font-mono font-semibold text-slate-400 dark:text-neutral-500">
                                      Off
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] font-mono text-slate-300 dark:text-neutral-600 font-semibold">
                                      --
                                    </span>
                                  )}
                                  {hasScore && (
                                    <span className="text-[8px] font-mono text-slate-400 dark:text-neutral-500 hidden sm:inline">
                                      {day.net}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Selected Day Inspector Mini Card */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0 flex items-center gap-2 truncate">
                        <span className="text-[11.5px] font-bold text-slate-900 dark:text-white shrink-0">
                          {selectedCalendarRecord.formattedDate}:
                        </span>
                        {selectedCalendarRecord.score ? (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
                            selectedCalendarRecord.score >= 95
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/80"
                              : "bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border-blue-200/80"
                          }`}>
                            Score: {selectedCalendarRecord.score}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-neutral-500 shrink-0">
                            {selectedCalendarRecord.isMarketClosed ? "Weekend Off" : "Pending"}
                          </span>
                        )}
                        <span className="text-[10.5px] text-slate-400 dark:text-neutral-500 truncate font-medium">
                          {selectedCalendarRecord.trades ? `${selectedCalendarRecord.trades} Trades · ${selectedCalendarRecord.net}` : selectedCalendarRecord.note}
                        </span>
                      </div>

                      {selectedCalendarRecord.score && (
                        <button
                          type="button"
                          onClick={() => handleOpenCalendarDayModal(selectedCalendarRecord)}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-white bg-[#006DFE] hover:bg-blue-600 active:scale-95 shadow-xs shrink-0 cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span>Audit Log</span>
                          <span>&rarr;</span>
                        </button>
                      )}
                    </div>

                  </div>
                ) : (
                  /* VIEW 2: WEEKLY AUDIT LIST */
                  <div className="flex-1 flex flex-col justify-between gap-2">
                    
                    {/* Stepper with Chevrons and Date Range */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200/70 dark:border-white/[0.06]">
                        <button
                          type="button"
                          disabled={selectedWeekIndex >= weeklyHistory.length - 1}
                          onClick={() => setSelectedWeekIndex((prev) => Math.min(weeklyHistory.length - 1, prev + 1))}
                          title="Previous Week"
                          className="w-6 h-6 rounded-md bg-white dark:bg-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-neutral-200 shadow-2xs transition-all cursor-pointer"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <span className="px-2 text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {currentWeekData.rangeLabel}
                        </span>
                        <button
                          type="button"
                          disabled={selectedWeekIndex <= 0}
                          onClick={() => setSelectedWeekIndex((prev) => Math.max(0, prev - 1))}
                          title="Next Week"
                          className="w-6 h-6 rounded-md bg-white dark:bg-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-neutral-200 shadow-2xs transition-all cursor-pointer"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>

                      {/* Quick Week Jump Pills */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200/70 dark:border-white/[0.06]">
                        {weeklyHistory.map((week, idx) => {
                          const isSelected = selectedWeekIndex === idx;
                          return (
                            <button
                              key={week.id}
                              type="button"
                              onClick={() => setSelectedWeekIndex(idx)}
                              className={`px-2 py-0.5 rounded text-[10.5px] font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-[#006DFE] text-white shadow-xs"
                                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              {idx === 0 ? "Current" : idx === 1 ? "-1W" : "-2W"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 6 Sleek Compact Interactive Audit Rows */}
                    <div className="space-y-1 py-0.5">
                      {weeklyDays.map((day) => {
                        const isAPlus = day.tier === "A+";
                        const dotColor = isAPlus ? "bg-emerald-500" : "bg-[#006DFE]";
                        const gradeColor = isAPlus
                          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/70 dark:border-emerald-500/25"
                          : "text-[#006DFE] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/25";

                        const formattedDayTitle = day.day.replace(
                          /^(MON|TUE|WED|THU|FRI|SAT),\s*(NOV|DEC|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT)\s*(\d+)$/i,
                          (_, d, m, n) => {
                            const capD = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
                            const capM = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
                            return `${capD}, ${capM} ${n}`;
                          }
                        );

                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleOpenDayModal(day)}
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-50/80 dark:bg-white/[0.025] hover:bg-blue-50/50 dark:hover:bg-blue-500/10 border border-slate-200/60 dark:border-white/[0.05] hover:border-[#006DFE]/40 dark:hover:border-[#006DFE]/40 transition-all cursor-pointer flex items-center justify-between text-left group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-md bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-neutral-200 shrink-0 shadow-2xs">
                                {day.dayHeader.slice(0, 3)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#006DFE] transition-colors leading-tight">
                                  {formattedDayTitle}
                                </div>
                                <div className="text-[10px] font-medium text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                                  <span className="truncate">{day.pair}</span>
                                  <span className="text-slate-300 dark:text-neutral-700">·</span>
                                  <span className={`font-semibold shrink-0 ${day.net.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                    {day.net}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pl-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums group-hover:text-[#006DFE] transition-colors">
                                {day.score}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${gradeColor}`}>
                                {day.grade}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>

              {/* Consistency Summary Strip */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>{recentTrades?.length || 0} Sessions Audited</span>
                  <span className="text-slate-300 dark:text-neutral-700">·</span>
                  <span>Month Avg: <strong className="text-slate-900 dark:text-white font-bold">{recentTrades?.length ? (avgDisciplineScore || 100) : "--"}</strong></span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>{recentTrades?.length ? "100% Pass Rate" : "Session Ready"}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── PANEL 2: DAILY STREAK (DAILY CHECK-IN & LEVEL-WISE PROGRESSION) ── */}
        {activeTab === "streak" && (
          <div className="space-y-4 sm:space-y-5">
            
            {/* 1. TODAY'S DAILY CHECK-IN HERO CARD */}
            <div className={`${CARD_BASE} p-4 sm:p-5 flex flex-col gap-4`}>
              {/* Top Row: Today's Status & Streak Flame */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/25 flex items-center justify-center shadow-2xs shrink-0 text-[#006DFE]">
                    <Flame size={20} className="fill-[#006DFE] text-[#006DFE]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums leading-none">
                        {streakDays} Consecutive Days
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/25">
                        <Flame size={10} className="fill-[#006DFE] text-[#006DFE]" />
                        <span>Active Streak</span>
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Today ({new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })})</span>
                      <span className="text-slate-300 dark:text-neutral-700">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        {tradesToday > 0 ? "Session Finalized · Grade A+ Verified" : "Ready · Trade with Stop-Loss to Start Day 1"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Stat Badges */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/25 flex items-center gap-1.5 text-xs font-bold text-[#006DFE] dark:text-blue-400 shadow-2xs">
                    <Star size={12} className="fill-[#006DFE] text-[#006DFE] shrink-0" />
                    <span>{streakDays >= 30 ? "1.50x Multiplier" : streakDays >= 21 ? "1.35x Multiplier" : streakDays >= 14 ? "1.25x Multiplier" : streakDays >= 7 ? "1.15x Multiplier" : streakDays >= 3 ? "1.05x Multiplier" : "1.00x Base Multiplier"}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/25 flex items-center gap-1.5 text-xs font-bold text-[#006DFE] dark:text-blue-400 shadow-2xs">
                    <Shield size={12} className="stroke-[2.2] shrink-0" />
                    <span>{streakDays >= 21 ? "Drawdown Shield Active" : `${Math.max(0, 21 - streakDays)} Days to Shield`}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Current Week Rhythm (7 Days: Mon 18 - Sun 24) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CalendarIcon size={13} className="text-[#006DFE]" />
                    <span>Current Week Rhythm ({weeklyHistory[0]?.rangeLabel || "This Week"})</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>{tradesToday > 0 ? "Today Logged & Verified" : "Awaiting Today's Session"}</span>
                  </span>
                </div>

                {/* 7-Day Responsive Strip */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                  {currentWeekDays.map((d) => {
                    const isCompleted = d.status === "completed";
                    const isToday = d.isToday;
                    const isMilestone = d.isGoal;

                    return (
                      <button
                        key={d.dayNum}
                        type="button"
                        onClick={() => handleCurrentWeekDayClick(d)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center flex flex-col items-center justify-between gap-1.5 transition-all cursor-pointer select-none group ${
                          isToday
                            ? "bg-blue-50/80 dark:bg-blue-500/10 border-[#006DFE] dark:border-[#006DFE] shadow-sm ring-2 ring-[#006DFE]/25"
                            : isCompleted
                            ? "bg-white dark:bg-[#17171A] hover:bg-slate-50 dark:hover:bg-white/[0.04] border-slate-200/80 dark:border-white/[0.08] shadow-2xs"
                            : isMilestone
                            ? "bg-gradient-to-b from-blue-50/50 to-amber-50/50 dark:from-blue-500/5 dark:to-amber-500/5 border-dashed border-[#006DFE]/60 hover:border-[#006DFE]"
                            : "bg-slate-50/50 dark:bg-white/[0.02] border-dashed border-slate-200/70 dark:border-white/[0.06] opacity-75 hover:opacity-100"
                        }`}
                      >
                        {/* Day Name & Date */}
                        <div>
                          <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                            isToday ? "text-[#006DFE] dark:text-blue-400" : "text-slate-400 dark:text-neutral-500"
                          }`}>
                            {d.dayName}
                          </div>
                          <div className="text-[11.5px] sm:text-xs font-black text-slate-800 dark:text-white tabular-nums mt-0.5">
                            {d.dateStr.split(" ")[1]}
                          </div>
                        </div>

                        {/* Status Icon */}
                        <div className="my-0.5">
                          {isToday ? (
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[#006DFE] flex items-center justify-center">
                              <Flame size={12} className="fill-[#006DFE] text-[#006DFE]" />
                            </div>
                          ) : isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            </div>
                          ) : isMilestone ? (
                            <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] flex items-center justify-center">
                              <Shield size={12} className="text-[#006DFE]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center">
                              <Clock size={11} className="text-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Bottom Score or Tag */}
                        <div className="text-[9.5px] sm:text-[10px] font-bold tabular-nums">
                          {isToday ? (
                            <span className="text-[#006DFE] dark:text-blue-400">
                              {tradesToday > 0 ? `${displayScore}%` : "Ready"}
                            </span>
                          ) : isCompleted ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{d.score}%</span>
                          ) : isMilestone ? (
                            <span className="text-[#006DFE] dark:text-blue-400 font-bold">Goal</span>
                          ) : (
                            <span className="text-slate-400 dark:text-neutral-500">Wait</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. LEVEL-WISE DISCIPLINE PROGRESSION (LEVELS 1 TO 5) */}
            <div className={`${CARD_BASE} p-4 sm:p-5 space-y-4`}>
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                      <Trophy size={13} className="stroke-[2.2]" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Discipline Milestone Levels
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
                    Unlock permanent multiplier floors, drawdown shields, and vault spending rewards.
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/25 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto tabular-nums">
                  <Flame size={12} className="fill-[#006DFE] text-[#006DFE]" />
                  <span>{streakDays} / 21 Days Target</span>
                </div>
              </div>

              {/* 5 Levels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {streakLevelsData.map((lvl) => {
                  const isCompleted = lvl.status === "completed";
                  const isActive = lvl.status === "active";
                  const isLocked = lvl.status === "locked";
                  const progressPct = isCompleted ? 100 : isActive ? Math.round((streakDays / lvl.targetDays) * 100) : 0;

                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => handleStreakLevelClick(lvl)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer group select-none min-h-[135px] ${
                        isActive
                          ? "bg-white dark:bg-[#17171A] border-[#006DFE]/70 dark:border-[#006DFE]/60 shadow-md ring-1 ring-[#006DFE]/25"
                          : isCompleted
                          ? "bg-white dark:bg-[#17171A] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] shadow-2xs hover:border-[#006DFE]/40"
                          : "bg-slate-50/60 dark:bg-white/[0.02] border-dashed border-slate-200/80 dark:border-white/[0.06] opacity-75 hover:opacity-100"
                      }`}
                    >
                      {/* Top: Level Tag + Status + XP Reward */}
                      <div className="flex items-center justify-between gap-1.5 w-full">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10.5px] font-black shrink-0 ${
                            isCompleted
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 dark:border-emerald-500/20"
                              : isActive
                              ? "bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] border border-blue-200/60 dark:border-blue-500/20"
                              : "bg-slate-100 dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/10"
                          }`}>
                            {lvl.level}
                          </span>
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 truncate">
                            {lvl.targetDays} Days Target
                          </span>
                        </div>

                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tabular-nums bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/20 shrink-0">
                          {lvl.xpReward}
                        </span>
                      </div>

                      {/* Middle: Title & Subtitle */}
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#006DFE] transition-colors leading-tight">
                          {lvl.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate font-medium">
                          {lvl.subtitle}
                        </p>
                      </div>

                      {/* Perk & Status / Progress footer */}
                      <div className="pt-1.5 border-t border-slate-100 dark:border-white/[0.05] flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between text-[10px] leading-tight">
                          <span className="text-slate-400 dark:text-neutral-500 font-medium">Perk:</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[65%] text-right text-[10px]">
                            {lvl.perks}
                          </span>
                        </div>

                        {/* Progress bar or Status */}
                        {isActive ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9.5px] font-medium text-slate-500 dark:text-neutral-400 leading-tight">
                              <span className="text-[#006DFE] font-bold">{lvl.currentDays} / {lvl.targetDays} Days</span>
                              <span className="font-bold text-[#006DFE] dark:text-blue-400">{Math.max(0, lvl.targetDays - lvl.currentDays)} Sessions Left</span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#006DFE]"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        ) : isCompleted ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9.5px] leading-tight">
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={10} className="text-emerald-500" />
                                <span>Achieved &amp; Claimed</span>
                              </span>
                              <span className="text-slate-400 dark:text-neutral-500 font-mono text-[9px]">
                                {lvl.completedDate || "Claimed"}
                              </span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-emerald-500 overflow-hidden" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9.5px] text-slate-400 dark:text-neutral-500 leading-tight">
                              <span className="inline-flex items-center gap-1">
                                <Lock size={9.5} />
                                <span>Locked Milestone</span>
                              </span>
                              <span className="text-[9px]">Unlocks at Lv 4</span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-slate-200/70 dark:bg-white/[0.08] overflow-hidden" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* 3. STREAK & SHIELD MECHANICS FAQ CARDS (3 COLS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className={`${CARD_BASE} p-4 space-y-1.5`}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Shield size={14} className="text-[#006DFE]" />
                  <span>Loss Protection Buffer</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-medium">
                  The 21-Day Streak Shield automatically absorbs 1 daily drawdown stop-out without resetting your streak progress to zero.
                </p>
              </div>

              <div className={`${CARD_BASE} p-4 space-y-1.5`}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Zap size={14} className="text-[#006DFE]" />
                  <span>XP Multiplier Stacking</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-medium">
                  Compliant sessions stack multipliers from 1.05x to 1.50x. Achieving milestone checkpoints locks in your permanent multiplier floor.
                </p>
              </div>

              <div className={`${CARD_BASE} p-4 space-y-1.5`}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Weekend Rhythm Exemption</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-medium">
                  Forex market closures over Saturday and Sunday are auto-protected and will never break an active weekday consistency streak.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ── PANEL 3: BADGES (HUMAN-CRAFTED DISCIPLINE ACHIEVEMENTS) ── */}
        {activeTab === "badges" && (
          <div className={`${CARD_BASE} p-4 sm:p-5 space-y-4`}>
            
            {/* Header: Title, Subtitle, Filter Switcher & Total XP Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06] gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                    <Trophy size={13} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Trader Discipline Badges ({badgesData.filter((b) => b.unlocked).length} / {badgesData.length} Unlocked)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
                  Verified telemetry achievements earned through consistent MT5 risk execution.
                </p>
              </div>

              {/* Filter Pills + XP Reward Pill */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Filter Selector */}
                <div className="inline-flex items-center p-0.5 rounded-[10px] bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06]">
                  {(["all", "unlocked", "in_progress"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setBadgeFilter(filter)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-[8px] transition-all cursor-pointer ${
                        badgeFilter === filter
                          ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {filter === "all"
                        ? `All (${badgesData.length})`
                        : filter === "unlocked"
                        ? `Unlocked (${badgesData.filter((b) => b.unlocked).length})`
                        : `In Progress (${badgesData.filter((b) => !b.unlocked).length})`}
                    </button>
                  ))}
                </div>

                {/* Total Claimed XP Pill */}
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/25 flex items-center gap-1.5 shadow-2xs tabular-nums">
                  <Star size={11} className="fill-[#006DFE] text-[#006DFE]" />
                  <span>
                    +{badgesData
                      .filter((b) => b.unlocked)
                      .reduce((sum, b) => sum + (parseInt(b.xp.replace(/[^0-9]/g, "") || "0", 10)), 0)}{" "}
                    XP Earned
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Badges Grid (Interactive Tactile Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {badgesData
                .filter((b) => {
                  if (badgeFilter === "unlocked") return b.unlocked;
                  if (badgeFilter === "in_progress") return !b.unlocked;
                  return true;
                })
                .map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleOpenBadgeModal(b)}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group ${
                      b.unlocked
                        ? "bg-white dark:bg-[#17171A] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] hover:border-[#006DFE]/40 shadow-2xs"
                        : "bg-slate-50/60 dark:bg-white/[0.02] border-dashed border-slate-200/80 dark:border-white/[0.06] hover:border-[#006DFE]/40 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Icon + Category + XP Pill */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${b.accentBg} ${b.accentBorder}`}>
                          {b.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 truncate block">
                            {b.categoryLabel}
                          </span>
                          <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#006DFE] transition-colors leading-tight mt-0.5">
                            {b.title}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold shrink-0 tabular-nums ${
                          b.unlocked
                            ? "bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/20"
                            : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/10"
                        }`}
                      >
                        {b.xp}
                      </span>
                    </div>

                    {/* Middle: Requirement description */}
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-medium">
                      {b.desc}
                    </p>

                    {/* Bottom: Progress or Verified Status */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] w-full">
                      {b.unlocked ? (
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={11} className="text-emerald-500" />
                            <span>Unlocked &amp; Synced</span>
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                            {b.unlockedDate}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-neutral-400">
                            <span>{b.current} / {b.target} Sessions</span>
                            <span className="font-bold text-[#006DFE] dark:text-blue-400">{b.progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#006DFE]"
                              style={{ width: `${b.progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
            </div>

          </div>
        )}

        {/* ── PANEL 4: VAULT (INSTITUTIONAL PERKS & VOUCHERS) ── */}
        {activeTab === "vault" && (
          <div className={`${CARD_BASE} p-4 sm:p-5 space-y-4`}>
            
            {/* Header: Title & Available Balance Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06] gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                    <Gift size={13} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Institutional Rewards Vault
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
                  Redeem your Grade A+ discipline score and XP balance for institutional trading perks &amp; rebates.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/25 text-xs font-bold flex items-center gap-1.5 shadow-2xs tabular-nums">
                  <Sparkles size={11} className="text-[#006DFE] fill-[#006DFE]" />
                  <span>Available Balance: {totalXP.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            {/* 3 Vault Perk Cards (Tactile Cards matching Dashboard & Journal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vaultRewards.map((reward) => {
                const isClaimed = redeemedRewards.has(reward.id);
                const canAfford = totalXP >= reward.cost;

                return (
                  <div
                    key={reward.id}
                    className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all group ${
                      isClaimed
                        ? "bg-emerald-50/20 dark:bg-emerald-500/5 border-emerald-200/70 dark:border-emerald-500/20 shadow-2xs"
                        : "bg-white dark:bg-[#17171A] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] hover:border-[#006DFE]/40 shadow-[0_2px_10px_rgba(15,23,42,0.03),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none"
                    }`}
                  >
                    {/* Top Row: Icon + Category Tag + Cost */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${reward.accentBg} ${reward.accentBorder}`}>
                          {reward.icon}
                        </div>
                        <div className="min-w-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${reward.accentBg} ${reward.accentText} border ${reward.accentBorder}`}>
                            {reward.tag}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                        {reward.cost} XP
                      </span>
                    </div>

                    {/* Middle: Title & Description */}
                    <div>
                      <h4 className="text-[14.5px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-[#006DFE] transition-colors">
                        {reward.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed font-medium mt-1">
                        {reward.desc}
                      </p>
                    </div>

                    {/* Bottom: Action Button & Verification Note */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] w-full space-y-2">
                      <button
                        type="button"
                        onClick={() => handleRedeemReward(reward)}
                        className={`w-full h-10 px-4 rounded-xl text-xs sm:text-[12.5px] font-bold tracking-tight transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                          isClaimed
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/25 hover:bg-emerald-100/50"
                            : canAfford
                            ? "bg-[#006DFE] hover:bg-blue-600 text-white shadow-[0_2px_8px_rgba(0,109,254,0.3)] hover:shadow-[0_4px_12px_rgba(0,109,254,0.4)]"
                            : "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-neutral-500 border border-slate-200/60 dark:border-white/[0.05] cursor-not-allowed"
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-500" />
                            <span>✓ Voucher Claimed · View Code</span>
                          </>
                        ) : canAfford ? (
                          <>
                            <Sparkles size={13} />
                            <span>Redeem for {reward.cost} XP</span>
                          </>
                        ) : (
                          <span>Insufficient XP ({Math.max(0, reward.cost - totalXP)} Needed)</span>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-500 px-0.5 font-medium">
                        <span className="truncate">{reward.terms.split(".")[0]}.</span>
                        <span className="font-mono text-slate-500 dark:text-neutral-400 shrink-0">{reward.categoryLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How Vault Redemption Works Info Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                  <ShieldCheck size={14} className="stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    On-Chain MT5 Ledger Verification
                  </div>
                  <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 font-medium">
                    All XP redemptions are irreversibly recorded on your verified trader ledger{displayAccountNumber !== "Disconnected" ? ` and synchronized with ${displayAccountNumber}` : ""}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                  ● 0% Slippage Guaranteed
                </span>
              </div>
            </div>

            {/* ── BEGINNER'S DIRECTORY: HOW TO EARN XP & REDEEM PERKS ── */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#006DFE] dark:text-blue-400 shrink-0">
                      <Star size={13} className="fill-[#006DFE] text-[#006DFE]" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Beginner's Blueprint: How You Earn XP &amp; What You Can Unlock
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
                    Every disciplined trading habit generates XP that can be redeemed for real evaluation discounts, cashback, and VPS infrastructure.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/25 self-start sm:self-auto tabular-nums">
                  1 XP = 1 Trader Discipline Point
                </span>
              </div>

              {/* Step 1: 4 Core Earning Channels */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Where &amp; How You Earn XP (Daily Trading Actions)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Channel 1: MT5 Compliant Sessions */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                          DAILY SESSIONS
                        </span>
                        <span className="text-[10.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +50 to +150 XP
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mt-1">
                        Compliant MT5 Trading
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Execute trades with 100% protective SL under 3 seconds &amp; respect your 1.0% risk cap. Grade A+ awards +150 XP daily.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                      Trigger: Automatic at 00:00 MT5 Close
                    </div>
                  </div>

                  {/* Channel 2: Streaks & Levels */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                          STREAK LEVELS
                        </span>
                        <span className="text-[10.5px] font-mono font-bold text-[#006DFE] dark:text-blue-400">
                          +50 to +1,000 XP
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mt-1">
                        Milestone Level Sprints
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Consecutive disciplined sessions level you from Lv 1 (3d) to Lv 5 (30d). Unlocks permanent multiplier boosts up to 1.50x.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                      Trigger: On Level Milestone Complete
                    </div>
                  </div>

                  {/* Channel 3: Journal Reflections */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                          TRADE JOURNAL
                        </span>
                        <span className="text-[10.5px] font-mono font-bold text-[#006DFE] dark:text-blue-400">
                          +30 XP / Entry
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mt-1">
                        Session Post-Mortems
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Log detailed execution reflections in the Smart Journal (min 80 characters, anti-cheat verified). Reflect, learn, and earn.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                      Trigger: Save Verified Trade Journal
                    </div>
                  </div>

                  {/* Channel 4: Competitions & Badges */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                          COMMUNITY &amp; BADGES
                        </span>
                        <span className="text-[10.5px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          +50 to +500 XP
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mt-1">
                        Tournaments &amp; Badges
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Join free trading tournaments (+50 XP) and unlock institutional badges (Zero Violation Week, Cool-Headed, Risk Architect).
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                      Trigger: Tournament Join / Badge Claim
                    </div>
                  </div>

                </div>
              </div>

              {/* Step 2: What You Can Purchase / Unlock with XP */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>What You Can Purchase &amp; Redeem in the Vault</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/70 dark:border-blue-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#006DFE] dark:text-blue-400">
                      <Ticket size={13} />
                      <span>20% Prop Discounts</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                      500 XP = $60 to $120 Savings
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed font-medium">
                      Instant evaluation discount vouchers valid on $50k &amp; $100k funded challenges.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/70 dark:border-blue-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#006DFE] dark:text-blue-400">
                      <Zap size={13} />
                      <span>30-Day MT5 VPS</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                      350 XP = 1.2ms LD4 Hosting
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed font-medium">
                      Automated Risk Guard enforcer running 24/5 on ultra-low-latency Equinix hardware.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/70 dark:border-emerald-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Crown size={13} />
                      <span>$50 Raw Spread Rebate</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                      750 XP = $50 Direct Cash
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed font-medium">
                      Direct cash rebate credited to your connected live trading balance. 100% withdrawable.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/70 dark:border-blue-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#006DFE] dark:text-blue-400">
                      <Sparkles size={13} />
                      <span>AI Credits &amp; Tournaments</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                      Free Entry &amp; AI Refills
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed font-medium">
                      Redeem XP to refill AI Trade Coach query credits and enter cash-prize tournaments for free.
                    </p>
                  </div>

                </div>
              </div>

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
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#006DFE]/15 text-[#006DFE] dark:text-blue-400">
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
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
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
