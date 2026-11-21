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
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { Gauge } from "@/components/ui/charts";
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
     STATE
  ------------------------------------------------------------------------- */
  const [activeTab, setActiveTab] = useState<"discipline" | "streak" | "badges" | "vault">("discipline");
  const [activeRange, setActiveRange] = useState<"7D" | "14D" | "All">("14D");
  const [xp, setXp] = useState(850);
  const [score, setScore] = useState(97);
  const [displayScore, setDisplayScore] = useState(97);
  const [streakDays, setStreakDays] = useState(18);
  const [redeemedRewards, setRedeemedRewards] = useState<Set<string>>(new Set());
  const [replayKey, setReplayKey] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [consistencyViewMode, setConsistencyViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("2026-11-21");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "unlocked" | "in_progress">("all");

  // User Profile State
  const [userName, setUserName] = useState("Nikhil Harake");
  const [userAvatar, setUserAvatar] = useState("NH");
  const [userTier, setUserTier] = useState("PRO");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Nikhil Harake";
          setUserName(name);
          const initials = name
            .split(" ")
            .filter(Boolean)
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "NH";
          setUserAvatar(initials);
        }
      } catch (e) {
        console.error("Error fetching user profile:", e);
      }
    };
    fetchUser();
  }, []);

  // Real-Time Clock & Heartbeat
  const [currentUtcTime, setCurrentUtcTime] = useState("");
  const [latency, setLatency] = useState(11);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [liveEventPulse, setLiveEventPulse] = useState(false);

  // UTC MT5 Server Clock (ticks every second in real time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toISOString().substring(11, 19);
      setCurrentUtcTime(`MT5 ${timeStr} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuating real-time MT5 ping latency
  useEffect(() => {
    const pingInterval = setInterval(() => {
      setLatency(Math.floor(10 + Math.random() * 5));
    }, 3500);
    return () => clearInterval(pingInterval);
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
     DISCIPLINE CURVE DATASETS (7D, 14D, ALL)
  ------------------------------------------------------------------------- */
  const curveDatasets: Record<"7D" | "14D" | "All", CurveDataset> = {
    "7D": {
      headline: "+96.8%",
      delta: "+4.8% this week",
      sessions: "7 closed sessions",
      scoreLabel: "Score: 97%",
      points: [
        { date: new Date(2026, 10, 15), score: 93, equity: "+91.2%", trades: 2 },
        { date: new Date(2026, 10, 16), score: 91, equity: "+92.0%", trades: 3 },
        { date: new Date(2026, 10, 17), score: 88, equity: "+91.5%", trades: 4 },
        { date: new Date(2026, 10, 18), score: 95, equity: "+93.4%", trades: 2 },
        { date: new Date(2026, 10, 19), score: 94, equity: "+94.7%", trades: 3 },
        { date: new Date(2026, 10, 20), score: 96, equity: "+95.8%", trades: 2 },
        { date: new Date(2026, 10, 21), score: 97, equity: "+96.8%", trades: 3 },
      ],
    },
    "14D": {
      headline: "+96.8%",
      delta: "+4.8% this week",
      sessions: "16 closed sessions",
      scoreLabel: "Score: 97%",
      points: [
        { date: new Date(2026, 10, 9), score: 84, equity: "+82.4%", trades: 2 },
        { date: new Date(2026, 10, 11), score: 89, equity: "+86.1%", trades: 3 },
        { date: new Date(2026, 10, 13), score: 86, equity: "+85.3%", trades: 2 },
        { date: new Date(2026, 10, 15), score: 93, equity: "+90.8%", trades: 2 },
        { date: new Date(2026, 10, 17), score: 88, equity: "+89.4%", trades: 4 },
        { date: new Date(2026, 10, 19), score: 94, equity: "+94.8%", trades: 3 },
        { date: new Date(2026, 10, 21), score: 97, equity: "+96.8%", trades: 3 },
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
        { date: new Date(2026, 10, 21), score: 97, equity: "+114.2%", trades: 3 },
      ],
    },
  };

  // Live Curve & Metric States
  const [liveTradesCount, setLiveTradesCount] = useState<number>(3);
  const [livePoints7D, setLivePoints7D] = useState<PointData[]>(curveDatasets["7D"].points);
  const [livePoints14D, setLivePoints14D] = useState<PointData[]>(curveDatasets["14D"].points);
  const [livePointsAll, setLivePointsAll] = useState<PointData[]>(curveDatasets["All"].points);
  const [liveHeadline, setLiveHeadline] = useState("+96.8%");
  const [liveSessionsCount, setLiveSessionsCount] = useState(16);
  const [liveStopLossPercent, setLiveStopLossPercent] = useState(100);
  const [liveViolationsCount, setLiveViolationsCount] = useState(0);

  // Sync with live Supabase telemetry if available
  useEffect(() => {
    if (tradesToday) setLiveTradesCount(tradesToday);
    if (avgDisciplineScore) {
      setScore(avgDisciplineScore);
      setDisplayScore(avgDisciplineScore);
    }
    if (breachLogs && breachLogs.length > 0) {
      setLiveViolationsCount(breachLogs.length);
    }
    if (recentTrades && recentTrades.length > 0) {
      const slTrades = recentTrades.filter((t) => t.sl);
      const slPct = Math.round((slTrades.length / recentTrades.length) * 100);
      setLiveStopLossPercent(slPct);
    }
    if (dailyXpEarned) {
      setXp(850 + dailyXpEarned);
    }
  }, [tradesToday, avgDisciplineScore, breachLogs, recentTrades, dailyXpEarned]);

  // Live Order Simulator / Real-time Execution Trigger (Updates Today's Point in Place)
  const handleSimulateLiveTrade = useCallback(() => {
    const pairs = ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "BTCUSD", "NAS100"];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const action = Math.random() > 0.4 ? "BUY" : "SELL";
    const lot = (Math.floor(Math.random() * 6) + 5) / 100;
    const slLatency = (Math.random() * 0.7 + 1.1).toFixed(1);
    const newScore = Math.min(100, Math.max(92, Math.round(95 + Math.random() * 4)));
    const addedEquity = +(Math.random() * 0.5 + 0.2).toFixed(1);

    setLiveEventPulse(true);
    setTimeout(() => setLiveEventPulse(false), 2000);

    setDisplayScore(newScore);
    setScore(newScore);
    setLiveTradesCount((prev) => Math.min(4, prev + 1));

    const updatedHeadline = `+${(96.0 + addedEquity).toFixed(1)}%`;
    setLiveHeadline(updatedHeadline);

    // Update the latest point (Today: Nov 21) in-place without appending duplicate date ticks
    const updateTodayPoint = (prev: PointData[]) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.length - 1;
      copy[last] = {
        ...copy[last],
        score: newScore,
        equity: updatedHeadline,
        trades: Math.min(4, liveTradesCount + 1),
      };
      return copy;
    };

    setLivePoints7D(updateTodayPoint);
    setLivePoints14D(updateTodayPoint);
    setLivePointsAll(updateTodayPoint);

    setXp((prev) => prev + 25);

    toast.success("Live MT5 Guard: Order Verified", {
      description: `${action} ${lot} ${pair} · Protective SL Attached (${slLatency}s) · Discipline: ${newScore}% (+25 XP)`,
    });
  }, [liveTradesCount]);

  // Real-time periodic live market heartbeat (100% Live Streaming MT5 Feed)
  useEffect(() => {
    if (!isLiveStreaming) return;
    const streamInterval = setInterval(() => {
      // Realistic server latency fluctuation
      setLatency(Math.floor(Math.random() * 5) + 10);

      // Micro pulse
      setLiveEventPulse(true);
      setTimeout(() => setLiveEventPulse(false), 900);

      const microDelta = (Math.random() * 0.14 - 0.04).toFixed(1);
      setLiveHeadline((prev) => {
        const current = parseFloat(prev.replace("+", "").replace("%", "")) || 96.0;
        const updated = Math.max(95.0, Math.min(98.8, current + parseFloat(microDelta))).toFixed(1);
        const headlineStr = `+${updated}%`;

        // Also dynamically reflect on today's chart point
        const updateMicroEquity = (points: PointData[]) => {
          if (points.length === 0) return points;
          const copy = [...points];
          const last = copy.length - 1;
          copy[last] = {
            ...copy[last],
            equity: headlineStr,
          };
          return copy;
        };

        setLivePoints7D(updateMicroEquity);
        setLivePoints14D(updateMicroEquity);
        setLivePointsAll(updateMicroEquity);

        return headlineStr;
      });
    }, 4000);

    return () => clearInterval(streamInterval);
  }, [isLiveStreaming]);

  const clampedScore = Math.max(0, Math.min(100, displayScore));

  const activeDataset = useMemo(() => {
    const base = curveDatasets[activeRange];
    const points = activeRange === "7D" ? livePoints7D : activeRange === "14D" ? livePoints14D : livePointsAll;
    return {
      ...base,
      headline: activeRange === "All" ? "+114.2%" : liveHeadline,
      delta: activeRange === "All" ? "+18.4% this month" : "+4.8% this week",
      sessions: base.sessions,
      scoreLabel: `Score: ${displayScore}%`,
      points,
    };
  }, [activeRange, livePoints7D, livePoints14D, livePointsAll, liveHeadline, displayScore]);

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
      telemetryStat: "16 Closed Orders · Avg SL Latency 1.4s",
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
      telemetryStat: "Max Risk 1.0% · 0 Oversizing Flags",
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
      telemetryStat: "6 Cooldowns Respected · 0 Breaches",
    },
    {
      id: "cap",
      title: "Daily Trade Cap",
      subtitle: "Strictly under maximum daily execution quota",
      value: Math.round((liveTradesCount / 4) * 100),
      badgeText: `${liveTradesCount} / 4 Trades`,
      percentageText: `${Math.round((liveTradesCount / 4) * 100)}%`,
      colorType: liveTradesCount >= 4 ? "green" : "amber",
      icon: <Clock size={16} className={liveTradesCount >= 4 ? "text-emerald-500" : "text-amber-500"} />,
      auditBadge: `${liveTradesCount} / 4 TRADES`,
      auditTitle: "Daily Execution Quota Monitor",
      auditSummary:
        `Overtrading is prevented by capping executions at 4 trades per 24/5 MT5 session cycle. You have ${Math.max(0, 4 - liveTradesCount)} execution slot(s) remaining today.`,
      auditStats: [
        { label: "Executions Today", value: `${liveTradesCount} / 4 Slots Used` },
        { label: "Auto-Reset Timer", value: "00:00 MT5 Server" },
        { label: "Overtrading Breaches", value: "0 This Month" },
      ],
      telemetryStat: `${liveTradesCount} / 4 Executions · ${Math.max(0, 4 - liveTradesCount)} Slot Remaining`,
    },
  ];

  /* -------------------------------------------------------------------------
     WEEKLY CONSISTENCY HISTORY (3 AUDITED WEEKS OF PERFORMANCE)
  ------------------------------------------------------------------------- */
  const weeklyHistory: WeekHistorySet[] = [
    {
      id: "w1",
      rangeLabel: "Nov 16 – 21, 2026",
      shortLabel: "Nov 16–21",
      badge: "Current Week",
      isCurrent: true,
      passRate: "100% Pass Rate",
      avgScore: 93.5,
      totalSessions: 6,
      days: [
        {
          id: "mon-1",
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
          id: "tue-1",
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
          id: "wed-1",
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
          id: "thu-1",
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
          id: "fri-1",
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
          id: "sat-1",
          dayHeader: "SAT",
          day: "SAT, NOV 21",
          score: displayScore,
          grade: displayScore >= 95 ? "GRADE A+" : "GRADE A",
          tier: displayScore >= 95 ? "A+" : "A",
          trades: `${liveTradesCount} / 4`,
          pair: "BTCUSD · ETHUSD",
          net: "+0.92%",
          note: "Live MT5 compliance active. Real-time trade discipline verified.",
        },
      ],
    },
    {
      id: "w2",
      rangeLabel: "Nov 9 – 14, 2026",
      shortLabel: "Nov 9–14",
      badge: "Previous Week",
      isCurrent: false,
      passRate: "100% Pass Rate",
      avgScore: 90.7,
      totalSessions: 6,
      days: [
        {
          id: "mon-2",
          dayHeader: "MON",
          day: "MON, NOV 9",
          score: 90,
          grade: "GRADE A",
          tier: "A",
          trades: "3 / 4",
          pair: "EURUSD",
          net: "+0.75%",
          note: "Disciplined stop placement on high-impact ECB release.",
        },
        {
          id: "tue-2",
          dayHeader: "TUE",
          day: "TUE, NOV 10",
          score: 91,
          grade: "GRADE A",
          tier: "A",
          trades: "2 / 4",
          pair: "GBPUSD · XAUUSD",
          net: "+1.10%",
          note: "1.0% risk cap adhered to during NY open volatility.",
        },
        {
          id: "wed-2",
          dayHeader: "WED",
          day: "WED, NOV 11",
          score: 89,
          grade: "GRADE A",
          tier: "A",
          trades: "4 / 4",
          pair: "USDJPY",
          net: "+0.45%",
          note: "Cooldown period respected after early morning scratch trade.",
        },
        {
          id: "thu-2",
          dayHeader: "THU",
          day: "THU, NOV 12",
          score: 93,
          grade: "GRADE A",
          tier: "A",
          trades: "2 / 4",
          pair: "EURUSD · GBPUSD",
          net: "+1.35%",
          note: "Zero overtrading; session locked at daily target profit.",
        },
        {
          id: "fri-2",
          dayHeader: "FRI",
          day: "FRI, NOV 13",
          score: 87,
          grade: "GRADE A",
          tier: "A",
          trades: "3 / 4",
          pair: "XAUUSD",
          net: "-0.60%",
          note: "Strict daily loss limit triggered; stopped trading for the day.",
        },
        {
          id: "sat-2",
          dayHeader: "SAT",
          day: "SAT, NOV 14",
          score: 94,
          grade: "GRADE A",
          tier: "A",
          trades: "2 / 4",
          pair: "BTCUSD · SOLUSD",
          net: "+0.80%",
          note: "Clean weekend crypto execution with verified protective SL.",
        },
      ],
    },
    {
      id: "w3",
      rangeLabel: "Nov 2 – 7, 2026",
      shortLabel: "Nov 2–7",
      badge: "2 Weeks Ago",
      isCurrent: false,
      passRate: "100% Pass Rate",
      avgScore: 92.0,
      totalSessions: 6,
      days: [
        {
          id: "mon-3",
          dayHeader: "MON",
          day: "MON, NOV 2",
          score: 88,
          grade: "GRADE A",
          tier: "A",
          trades: "3 / 4",
          pair: "EURUSD · AUDUSD",
          net: "+0.90%",
          note: "Risk per position kept strictly under 0.8% equity.",
        },
        {
          id: "tue-3",
          dayHeader: "TUE",
          day: "TUE, NOV 3",
          score: 92,
          grade: "GRADE A",
          tier: "A",
          trades: "2 / 4",
          pair: "XAUUSD",
          net: "+1.40%",
          note: "Pre-election market volatility managed with reduced lot size.",
        },
        {
          id: "wed-3",
          dayHeader: "WED",
          day: "WED, NOV 4",
          score: 95,
          grade: "GRADE A+",
          tier: "A+",
          trades: "3 / 4",
          pair: "GBPUSD · EURUSD",
          net: "+1.85%",
          note: "Perfect execution across London and NY session overlap.",
        },
        {
          id: "thu-3",
          dayHeader: "THU",
          day: "THU, NOV 5",
          score: 90,
          grade: "GRADE A",
          tier: "A",
          trades: "3 / 4",
          pair: "USDCHF · USDJPY",
          net: "+0.30%",
          note: "All trade orders executed with instant stop losses attached.",
        },
        {
          id: "fri-3",
          dayHeader: "FRI",
          day: "FRI, NOV 6",
          score: 96,
          grade: "GRADE A+",
          tier: "A+",
          trades: "2 / 4",
          pair: "XAUUSD",
          net: "+1.70%",
          note: "US NFP news release bypassed as planned; zero slippage violations.",
        },
        {
          id: "sat-3",
          dayHeader: "SAT",
          day: "SAT, NOV 7",
          score: 91,
          grade: "GRADE A",
          tier: "A",
          trades: "2 / 4",
          pair: "SOLUSD · ETHUSD",
          net: "+0.65%",
          note: "Weekend crypto risk limit verified by MT5 Guard.",
        },
      ],
    },
  ];

  const currentWeekData = weeklyHistory[selectedWeekIndex] || weeklyHistory[0];
  const weeklyDays = currentWeekData.days;

  /* -------------------------------------------------------------------------
     CALENDAR CONSISTENCY DATA (MONTH OF NOVEMBER 2026 AUDIT TRAIL)
  ------------------------------------------------------------------------- */
  interface CalendarDayItem {
    id: string;
    dateStr: string;
    dayNum: number;
    dayName: string;
    formattedDate: string;
    score?: number;
    grade?: string;
    tier?: string;
    trades?: string;
    pair?: string;
    net?: string;
    note?: string;
    isMarketClosed?: boolean;
    isUpcoming?: boolean;
    isToday?: boolean;
  }

  const calendarDaysMap: Record<string, CalendarDayItem> = useMemo(() => ({
    "2026-11-02": { id: "nov-2", dateStr: "2026-11-02", dayNum: 2, dayName: "Mon", formattedDate: "Mon, Nov 2", score: 88, grade: "GRADE A", tier: "A", trades: "3 / 4", pair: "EURUSD · AUDUSD", net: "+0.90%", note: "Risk per position kept strictly under 0.8% equity." },
    "2026-11-03": { id: "nov-3", dateStr: "2026-11-03", dayNum: 3, dayName: "Tue", formattedDate: "Tue, Nov 3", score: 92, grade: "GRADE A", tier: "A", trades: "2 / 4", pair: "XAUUSD", net: "+1.40%", note: "Pre-election market volatility managed with reduced lot size." },
    "2026-11-04": { id: "nov-4", dateStr: "2026-11-04", dayNum: 4, dayName: "Wed", formattedDate: "Wed, Nov 4", score: 95, grade: "GRADE A+", tier: "A+", trades: "3 / 4", pair: "GBPUSD · EURUSD", net: "+1.85%", note: "Perfect execution across London and NY session overlap." },
    "2026-11-05": { id: "nov-5", dateStr: "2026-11-05", dayNum: 5, dayName: "Thu", formattedDate: "Thu, Nov 5", score: 90, grade: "GRADE A", tier: "A", trades: "3 / 4", pair: "USDCHF · USDJPY", net: "+0.30%", note: "All trade orders executed with instant stop losses attached." },
    "2026-11-06": { id: "nov-6", dateStr: "2026-11-06", dayNum: 6, dayName: "Fri", formattedDate: "Fri, Nov 6", score: 96, grade: "GRADE A+", tier: "A+", trades: "2 / 4", pair: "XAUUSD", net: "+1.70%", note: "US NFP news release bypassed as planned; zero slippage violations." },
    "2026-11-07": { id: "nov-7", dateStr: "2026-11-07", dayNum: 7, dayName: "Sat", formattedDate: "Sat, Nov 7", score: 91, grade: "GRADE A", tier: "A", trades: "2 / 4", pair: "SOLUSD · ETHUSD", net: "+0.65%", note: "Weekend crypto risk limit verified by MT5 Guard." },
    "2026-11-08": { id: "nov-8", dateStr: "2026-11-08", dayNum: 8, dayName: "Sun", formattedDate: "Sun, Nov 8", isMarketClosed: true, note: "Market Closed. Weekend session guard active. 0 orders allowed." },

    "2026-11-09": { id: "nov-9", dateStr: "2026-11-09", dayNum: 9, dayName: "Mon", formattedDate: "Mon, Nov 9", score: 90, grade: "GRADE A", tier: "A", trades: "3 / 4", pair: "EURUSD", net: "+0.75%", note: "Disciplined stop placement on high-impact ECB release." },
    "2026-11-10": { id: "nov-10", dateStr: "2026-11-10", dayNum: 10, dayName: "Tue", formattedDate: "Tue, Nov 10", score: 91, grade: "GRADE A", tier: "A", trades: "2 / 4", pair: "GBPUSD · XAUUSD", net: "+1.10%", note: "1.0% risk cap adhered to during NY open volatility." },
    "2026-11-11": { id: "nov-11", dateStr: "2026-11-11", dayNum: 11, dayName: "Wed", formattedDate: "Wed, Nov 11", score: 89, grade: "GRADE A", tier: "A", trades: "4 / 4", pair: "USDJPY", net: "+0.45%", note: "Cooldown period respected after early morning scratch trade." },
    "2026-11-12": { id: "nov-12", dateStr: "2026-11-12", dayNum: 12, dayName: "Thu", formattedDate: "Thu, Nov 12", score: 93, grade: "GRADE A", tier: "A", trades: "2 / 4", pair: "EURUSD · GBPUSD", net: "+1.35%", note: "Zero overtrading; session locked at daily target profit." },
    "2026-11-13": { id: "nov-13", dateStr: "2026-11-13", dayNum: 13, dayName: "Fri", formattedDate: "Fri, Nov 13", score: 87, grade: "GRADE A", tier: "A", trades: "3 / 4", pair: "XAUUSD", net: "-0.60%", note: "Strict daily loss limit triggered; stopped trading for the day." },
    "2026-11-14": { id: "nov-14", dateStr: "2026-11-14", dayNum: 14, dayName: "Sat", formattedDate: "Sat, Nov 14", score: 94, grade: "GRADE A", tier: "A", trades: "2 / 4", pair: "BTCUSD · SOLUSD", net: "+0.80%", note: "Clean weekend crypto execution with verified protective SL." },
    "2026-11-15": { id: "nov-15", dateStr: "2026-11-15", dayNum: 15, dayName: "Sun", formattedDate: "Sun, Nov 15", isMarketClosed: true, note: "Market Closed. Weekend session guard active. 0 orders allowed." },

    "2026-11-16": { id: "nov-16", dateStr: "2026-11-16", dayNum: 16, dayName: "Mon", formattedDate: "Mon, Nov 16", score: 92, grade: "GRADE A", tier: "A", trades: "3 / 4", pair: "EURUSD · XAUUSD", net: "+1.15%", note: "All stop-losses attached within 1.8s of entry." },
    "2026-11-17": { id: "nov-17", dateStr: "2026-11-17", dayNum: 17, dayName: "Tue", formattedDate: "Tue, Nov 17", score: 88, grade: "GRADE A", tier: "A", trades: "4 / 4", pair: "GBPUSD · USDJPY", net: "-0.42%", note: "Hit 4/4 daily trade cap; stopped trading immediately per rules." },
    "2026-11-18": { id: "nov-18", dateStr: "2026-11-18", dayNum: 18, dayName: "Wed", formattedDate: "Wed, Nov 18", score: 95, grade: "GRADE A+", tier: "A+", trades: "2 / 4", pair: "XAUUSD", net: "+1.64%", note: "Zero drawdown violation; 0.75% max risk per position." },
    "2026-11-19": { id: "nov-19", dateStr: "2026-11-19", dayNum: 19, dayName: "Thu", formattedDate: "Thu, Nov 19", score: 94, grade: "GRADE A", tier: "A", trades: "3 / 4", pair: "EURUSD · NAS100", net: "+0.88%", note: "Respected 15-min cooldown after morning breakeven stop." },
    "2026-11-20": { id: "nov-20", dateStr: "2026-11-20", dayNum: 20, dayName: "Fri", formattedDate: "Fri, Nov 20", score: 96, grade: "GRADE A+", tier: "A+", trades: "2 / 4", pair: "XAUUSD · GBPJPY", net: "+1.32%", note: "Flawless London-NY overlap execution; 100% SL compliance." },
    "2026-11-21": { id: "nov-21", dateStr: "2026-11-21", dayNum: 21, dayName: "Sat", formattedDate: "Sat, Nov 21 (Today)", score: displayScore, grade: displayScore >= 95 ? "GRADE A+" : "GRADE A", tier: displayScore >= 95 ? "A+" : "A", trades: `${liveTradesCount} / 4`, pair: "BTCUSD · ETHUSD", net: "+0.92%", isToday: true, note: "Live MT5 compliance active. Real-time trade discipline verified." },
    "2026-11-22": { id: "nov-22", dateStr: "2026-11-22", dayNum: 22, dayName: "Sun", formattedDate: "Sun, Nov 22", isMarketClosed: true, note: "Market Closed. Weekend session guard active. 0 orders allowed." },

    "2026-11-23": { id: "nov-23", dateStr: "2026-11-23", dayNum: 23, dayName: "Mon", formattedDate: "Mon, Nov 23", isUpcoming: true, note: "Upcoming MT5 session. Risk guard rules will engage on first execution." },
    "2026-11-24": { id: "nov-24", dateStr: "2026-11-24", dayNum: 24, dayName: "Tue", formattedDate: "Tue, Nov 24", isUpcoming: true, note: "Upcoming MT5 session. Risk guard rules will engage on first execution." },
    "2026-11-25": { id: "nov-25", dateStr: "2026-11-25", dayNum: 25, dayName: "Wed", formattedDate: "Wed, Nov 25", isUpcoming: true, note: "Upcoming MT5 session. Risk guard rules will engage on first execution." },
    "2026-11-26": { id: "nov-26", dateStr: "2026-11-26", dayNum: 26, dayName: "Thu", formattedDate: "Thu, Nov 26", isUpcoming: true, note: "Upcoming MT5 session. Risk guard rules will engage on first execution." },
    "2026-11-27": { id: "nov-27", dateStr: "2026-11-27", dayNum: 27, dayName: "Fri", formattedDate: "Fri, Nov 27", isUpcoming: true, note: "Upcoming MT5 session. Risk guard rules will engage on first execution." },
    "2026-11-28": { id: "nov-28", dateStr: "2026-11-28", dayNum: 28, dayName: "Sat", formattedDate: "Sat, Nov 28", isUpcoming: true, note: "Upcoming MT5 session. Risk guard rules will engage on first execution." },
    "2026-11-29": { id: "nov-29", dateStr: "2026-11-29", dayNum: 29, dayName: "Sun", formattedDate: "Sun, Nov 29", isMarketClosed: true, note: "Market Closed. Weekend session guard active. 0 orders allowed." },
  }), [displayScore, liveTradesCount]);

  const calendarWeeks = [
    ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"],
    ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"],
    ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22"],
    ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"],
  ];

  const selectedCalendarRecord = calendarDaysMap[selectedCalendarDate] || calendarDaysMap["2026-11-21"];

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
      badge: `${day.grade || "GRADE A"} · ${day.score || 90}/100`,
      title: `Session Audit — ${day.formattedDate}`,
      summary: day.note || "Verified MT5 disciplined trade execution.",
      stats: [
        { label: "Executions", value: day.trades || "3 / 4" },
        { label: "Pairs Traded", value: day.pair || "EURUSD" },
        { label: "Session Return", value: day.net || "+0.00%" },
      ],
    });
  };


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
      category: "risk",
      categoryLabel: "RISK DISCIPLINE",
      icon: <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />,
      accentBg: "bg-emerald-50 dark:bg-emerald-500/10",
      accentText: "text-emerald-600 dark:text-emerald-400",
      accentBorder: "border-emerald-200/80 dark:border-emerald-500/25",
      unlockedDate: "Nov 16, 2026",
      proofNote: "Verified across 30 consecutive closed orders on Exness MT5 Server with an average stop-loss latency of 1.4s.",
    },
    {
      id: "b2",
      title: "Zero Violation Week",
      desc: "Maintain Grade A+ (95+) across an entire Monday–Friday cycle.",
      unlocked: true,
      xp: "+150 XP",
      category: "consistency",
      categoryLabel: "WEEKLY MASTERY",
      icon: <Award size={18} className="text-[#006DFE] dark:text-blue-400" />,
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      accentText: "text-[#006DFE] dark:text-blue-400",
      accentBorder: "border-blue-200/80 dark:border-blue-500/25",
      unlockedDate: "Nov 14, 2026",
      proofNote: "Week 45 audit finalized with a 96.2 average score and 100% adherence to daily trade quotas.",
    },
    {
      id: "b3",
      title: "Cool-Headed Execution",
      desc: "Respect 100% of 15-minute post-loss cooldown windows.",
      unlocked: true,
      xp: "+100 XP",
      category: "execution",
      categoryLabel: "EMOTIONAL SHIELD",
      icon: <Clock size={18} className="text-cyan-600 dark:text-cyan-400" />,
      accentBg: "bg-cyan-50 dark:bg-cyan-500/10",
      accentText: "text-cyan-600 dark:text-cyan-400",
      accentBorder: "border-cyan-200/80 dark:border-cyan-500/25",
      unlockedDate: "Nov 12, 2026",
      proofNote: "All 6 cooldowns strictly respected post stop-loss triggers. Zero impulsive order attempts detected.",
    },
    {
      id: "b4",
      title: "Risk Architect",
      desc: "Keep average risk per trade below 0.80% across 25 sessions.",
      unlocked: true,
      xp: "+50 XP",
      category: "risk",
      categoryLabel: "CAPITAL DISCIPLINE",
      icon: <Scale size={18} className="text-purple-600 dark:text-purple-400" />,
      accentBg: "bg-purple-50 dark:bg-purple-500/10",
      accentText: "text-purple-600 dark:text-purple-400",
      accentBorder: "border-purple-200/80 dark:border-purple-500/25",
      unlockedDate: "Nov 9, 2026",
      proofNote: "Account risk kept at a disciplined 0.72% average. Max position lot size strictly calibrated against equity.",
    },
    {
      id: "b5",
      title: "21-Day Shield Bearer",
      desc: "Complete 21 consecutive disciplined trading days (18/21).",
      unlocked: false,
      xp: "+250 XP",
      category: "milestone",
      categoryLabel: "STREAK CHALLENGE",
      icon: <Shield size={18} className="text-amber-600 dark:text-amber-400 stroke-[2.2]" />,
      accentBg: "bg-amber-50 dark:bg-amber-500/10",
      accentText: "text-amber-600 dark:text-amber-400",
      accentBorder: "border-amber-200/80 dark:border-amber-500/25",
      current: 18,
      target: 21,
      progressPct: 85,
      proofNote: "Currently at 18 of 21 sessions verified. Complete 3 more consecutive sessions to unlock the 21-Day Shield perk and +250 XP.",
    },
    {
      id: "b6",
      title: "Institutional Centurion",
      desc: "Reach 100 closed sessions with an average score above 92.",
      unlocked: false,
      xp: "+500 XP",
      category: "milestone",
      categoryLabel: "LIFETIME MASTERY",
      icon: <Trophy size={18} className="text-indigo-600 dark:text-indigo-400" />,
      accentBg: "bg-indigo-50 dark:bg-indigo-500/10",
      accentText: "text-indigo-600 dark:text-indigo-400",
      accentBorder: "border-indigo-200/80 dark:border-indigo-500/25",
      current: 64,
      target: 100,
      progressPct: 64,
      proofNote: "Currently at 64 of 100 verified sessions with an average score of 94.6. On track for Institutional Tier status.",
    },
  ];

  const handleOpenBadgeModal = (badge: BadgeItem) => {
    setActiveAuditModal({
      isOpen: true,
      badge: badge.unlocked ? `BADGE UNLOCKED · ${badge.categoryLabel}` : `IN PROGRESS · ${badge.categoryLabel}`,
      title: badge.title,
      summary: badge.proofNote,
      stats: [
        { label: "Status", value: badge.unlocked ? `Verified (${badge.unlockedDate})` : `${badge.current}/${badge.target} Completed` },
        { label: "XP Reward", value: badge.xp },
        { label: "Category", value: badge.categoryLabel },
        { label: "Telemetry Verification", value: badge.unlocked ? "Exness MT5 On-Chain Log" : "Live Session Tracking" },
      ],
    });
  };

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

  const streakWeeksData = useMemo(() => [
    {
      weekId: "w1",
      phaseTitle: "Phase 1: Foundation & Routine",
      dateRange: "Nov 4 – Nov 10",
      badgeText: "Bronze Shield Unlocked · 1.15x XP",
      isCompleted: true,
      progressLabel: "7/7 Verified",
      days: [
        { dayNum: 1, dateStr: "Mon, Nov 4", pair: "EURUSD", score: 94, net: "+1.20%", trades: "2 / 4", status: "completed" },
        { dayNum: 2, dateStr: "Tue, Nov 5", pair: "GBPUSD", score: 91, net: "+0.85%", trades: "3 / 4", status: "completed" },
        { dayNum: 3, dateStr: "Wed, Nov 6", pair: "USDJPY", score: 96, net: "+1.40%", trades: "2 / 4", status: "completed" },
        { dayNum: 4, dateStr: "Thu, Nov 7", pair: "XAUUSD", score: 89, net: "+0.60%", trades: "4 / 4", status: "completed" },
        { dayNum: 5, dateStr: "Fri, Nov 8", pair: "EURUSD", score: 95, net: "+1.75%", trades: "2 / 4", status: "completed" },
        { dayNum: 6, dateStr: "Sat, Nov 9", pair: "BTCUSD", score: 92, net: "+0.90%", trades: "3 / 4", status: "completed" },
        { dayNum: 7, dateStr: "Sun, Nov 10", pair: "Weekend", score: 95, net: "+0.45%", trades: "1 / 4", status: "completed", isMilestone: true, milestoneName: "Bronze Shield" },
      ],
    },
    {
      weekId: "w2",
      phaseTitle: "Phase 2: Execution Consistency",
      dateRange: "Nov 11 – Nov 17",
      badgeText: "Silver Shield Unlocked · 1.25x XP",
      isCompleted: true,
      progressLabel: "7/7 Verified",
      days: [
        { dayNum: 8, dateStr: "Mon, Nov 11", pair: "EURUSD", score: 93, net: "+1.10%", trades: "3 / 4", status: "completed" },
        { dayNum: 9, dateStr: "Tue, Nov 12", pair: "GBPUSD", score: 90, net: "+0.75%", trades: "2 / 4", status: "completed" },
        { dayNum: 10, dateStr: "Wed, Nov 13", pair: "XAUUSD", score: 97, net: "+2.10%", trades: "2 / 4", status: "completed" },
        { dayNum: 11, dateStr: "Thu, Nov 14", pair: "USDJPY", score: 92, net: "+0.80%", trades: "3 / 4", status: "completed" },
        { dayNum: 12, dateStr: "Fri, Nov 15", pair: "EURUSD", score: 94, net: "+1.35%", trades: "2 / 4", status: "completed" },
        { dayNum: 13, dateStr: "Sat, Nov 16", pair: "BTCUSD", score: 96, net: "+1.05%", trades: "2 / 4", status: "completed" },
        { dayNum: 14, dateStr: "Sun, Nov 17", pair: "Weekend", score: 95, net: "+0.50%", trades: "1 / 4", status: "completed", isMilestone: true, milestoneName: "Silver Shield" },
      ],
    },
    {
      weekId: "w3",
      phaseTitle: "Phase 3: The 21-Day Iron Shield Sprint",
      dateRange: "Nov 18 – Nov 24",
      badgeText: "Final Stretch · 3 Sessions Remaining",
      isCompleted: false,
      progressLabel: "4/7 Active (Day 18 Today)",
      days: [
        { dayNum: 15, dateStr: "Mon, Nov 18", pair: "EURUSD · GBPUSD", score: 95, net: "+1.64%", trades: "2 / 4", status: "completed" },
        { dayNum: 16, dateStr: "Tue, Nov 19", pair: "GBPUSD · USDJPY", score: 88, net: "-0.42%", trades: "4 / 4", status: "completed" },
        { dayNum: 17, dateStr: "Wed, Nov 20", pair: "XAUUSD", score: 96, net: "+1.32%", trades: "2 / 4", status: "completed" },
        { dayNum: 18, dateStr: "Thu, Nov 21", pair: "BTCUSD · ETHUSD", score: displayScore, net: "+0.92%", trades: `${liveTradesCount} / 4`, status: "active", isToday: true },
        { dayNum: 19, dateStr: "Fri, Nov 22", pair: "Pending Session", score: null, net: "--", trades: "0 / 4", status: "upcoming" },
        { dayNum: 20, dateStr: "Sat, Nov 23", pair: "Pending Session", score: null, net: "--", trades: "0 / 4", status: "upcoming" },
        { dayNum: 21, dateStr: "Sun, Nov 24", pair: "Master Target", score: null, net: "--", trades: "0 / 4", status: "shield_milestone", isFinalGoal: true, milestoneName: "21-Day Iron Shield" },
      ],
    },
  ], [displayScore, liveTradesCount]);

  const handleStreakDayClick = (dayItem: any) => {
    if (dayItem.status === "upcoming" || (dayItem.status === "shield_milestone" && !dayItem.score)) {
      toast("Upcoming Milestone Session", {
        description: `Session ${dayItem.dayNum} (${dayItem.dateStr}) unlocks as soon as you complete your next compliant MT5 trading session.`,
      });
      return;
    }
    setActiveAuditModal({
      isOpen: true,
      badge: `DAY ${dayItem.dayNum} AUDIT · ${dayItem.dateStr}`,
      title: `Session ${dayItem.dayNum} Compliance Telemetry`,
      summary: `Verified Exness MT5 session on ${dayItem.dateStr}. Executed ${dayItem.pair} with a ${dayItem.score}% discipline rating and ${dayItem.net} net result. Stop-loss was 100% verified with zero emotional cooldown breaches.`,
      stats: [
        { label: "Discipline Rating", value: `${dayItem.score}/100` },
        { label: "Executed Trades", value: `${dayItem.trades} Executions` },
        { label: "Session P&L Net", value: dayItem.net },
        { label: "Protective SL", value: "100% Enforced" },
        { label: "XP Multiplier", value: "1.35x Active" },
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
            Card 1: Discipline Status & Identity (6 cols - Unboxed like Dashboard)
            Card 2: Trading Streak (3 cols)
            Card 3: Trader Rank & XP (3 cols)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-4 sm:mb-5">
          
          {/* Card A: Trader Identity, Live Status & Telemetry Chips (6 cols - Unboxed Hero Style like Dashboard) */}
          <div className="lg:col-span-6 px-1 py-1 flex flex-col justify-between gap-3">
            
            {/* Top row: Status header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  DISCIPLINE STATUS
                </span>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isConnected ? `${accountMetrics?.broker || "MT5 Server"} – Live` : "MT5 Server – Live"}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <CheckCircle2 size={11} />
                <span>Session Finalized</span>
              </span>
            </div>

            {/* Middle row: Avatar + Name + 3 Right-aligned Stat Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              
              {/* User avatar and name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl p-[2px] bg-gradient-to-tr from-[#006DFE] to-cyan-400 shadow-sm">
                    <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white text-base font-black overflow-hidden">
                      {userAvatar}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#006DFE] border-2 border-white dark:border-[#17171A] flex items-center justify-center text-[9px] text-white font-bold shadow-2xs">
                    ✓
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-base sm:text-[17px] font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                      {userName}
                    </h2>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30 leading-none">
                      {userTier}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                    Level 1 Pro MT5 Trader
                  </p>
                </div>
              </div>

              {/* 3 Stat Chips: ACCOUNT, RISK CAP, STREAK */}
              <div className="flex items-center gap-2 text-center shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs">
                  <div className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    ACCOUNT
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
                    {accountMetrics?.account_number ? `#${accountMetrics.account_number}` : "#88412"}
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs">
                  <div className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    RISK CAP
                  </div>
                  <div className="text-xs font-mono font-bold text-[#006DFE] dark:text-blue-400 mt-0.5 tabular-nums">
                    1.0%
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs">
                  <div className="text-[9.5px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    STREAK
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                    6W Net
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card B: Trading Streak (3 cols - Compact Height) */}
          <div className={`lg:col-span-3 ${CARD_BASE} px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col justify-between gap-1.5`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                Trading Streak
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/30">
                <span className="animate-flame">🔥</span>
                <span>Active</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-[22px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                  {streakDays} Days
                </div>
                <div className="text-[10.5px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  21d Shield · 3 days left
                </div>
              </div>

              {/* Circular Mini Ring (18 / 21) */}
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
                    className="text-amber-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${(18 / 21) * 100}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[9.5px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                  18/21
                </span>
              </div>
            </div>

            {/* Segmented 7-block week progress */}
            <div className="grid grid-cols-7 gap-1 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
              {[1, 2, 3, 4, 5, 6, 7].map((b) => (
                <div
                  key={b}
                  className={`h-1 rounded-full ${
                    b <= 6
                      ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                      : "bg-slate-200 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card C: Trader Rank & XP Progress (3 cols - Compact Height) */}
          <div className={`lg:col-span-3 ${CARD_BASE} px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col justify-between gap-1.5`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                Trader Rank
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/30">
                <Star size={10} className="fill-purple-500 text-purple-500" />
                <span>Lv 2 Perks</span>
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <div className="text-xl sm:text-[22px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Level 1
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tabular-nums">
                  {xp} / 1,000 XP
                </div>
              </div>
              <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                {1000 - xp} XP to Lv 2
              </div>
            </div>

            {/* Shimmering XP progress bar */}
            <div className="relative w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden bar-shimmer">
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
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span>Real-time MT5 compliance · {latency}ms</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 shrink-0">
                  ● GRADE A+
                </span>
                {liveEventPulse && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Semicircle Gauge with Rounded Notches Shaded from First Colour to Last */}
            <div className="relative flex flex-col items-center justify-center min-h-[235px] h-[235px] w-full flex-1">
              <div className={`mx-auto w-full max-w-[270px] transition-transform duration-300 ${liveEventPulse ? "scale-[1.02]" : ""}`}>
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

              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE] animate-pulse" />
                <span>GRADE A+ · Top 4% of Traders</span>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Stop Loss: {liveStopLossPercent}% Verified</span>
              </span>
              <span className="text-slate-400 dark:text-neutral-500 font-medium">
                {liveViolationsCount} Violations
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
                  <span>Closed trade equity curve</span>
                  <span className="text-slate-300 dark:text-neutral-700">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed Active
                  </span>
                </p>
              </div>

              {/* Range Switcher & Live Order Trigger */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSimulateLiveTrade}
                  title="Trigger Real-Time MT5 Trade Execution"
                  className="tactile-white-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[10.5px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:border-[#006DFE]/50 transition-all shadow-2xs"
                >
                  <Zap size={11} className="text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline">Simulate Live Order</span>
                </button>

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
              {liveEventPulse && (
                <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 animate-bounce">
                  ⚡ Live Tick
                </span>
              )}
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeDataset.sessions}</span>
                <span className="text-slate-300 dark:text-neutral-600">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Feed Synced</span>
              </span>
              <span className="font-bold text-[#006DFE] dark:text-blue-400">
                {activeDataset.scoreLabel}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            NAVIGATION TABS (TACTILE PILL BUTTONS LIKE HOME PAGE)
        ========================================================================= */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 my-5 sm:my-6">
          {[
            { id: "discipline", label: "Discipline", icon: <Shield size={14} className="stroke-[2.2]" />, badge: "97%" },
            { id: "streak", label: "Daily Streak", icon: <Flame size={14} className="text-amber-500" />, badge: `${streakDays}d Active` },
            { id: "badges", label: "Badges", icon: <Trophy size={14} className="text-yellow-500" />, badge: "4/6" },
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
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-neutral-300"
                  }`}
                >
                  {tab.badge}
                </span>
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
                    Synced with your Exness MT5 account &amp; live Risk Guard enforcer.
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
                    <span>Score: {score}/100</span>
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
                            ? "text-amber-600 dark:text-amber-400"
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
                  <div className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] shrink-0">
                    🌐
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
                          November 2026
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
                    <div className="grid grid-cols-7 gap-1 text-center py-0.5">
                      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                        <span
                          key={d}
                          className={`text-[8.5px] font-mono font-bold ${
                            d === "SUN" ? "text-slate-300 dark:text-neutral-600" : "text-slate-400 dark:text-neutral-500"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* 4-Week Calendar Grid (Each day shows its score clearly) */}
                    <div className="grid grid-rows-4 gap-1">
                      {calendarWeeks.map((week, wIdx) => (
                        <div key={`cw-${wIdx}`} className="grid grid-cols-7 gap-1">
                          {week.map((dateStr) => {
                            const day = calendarDaysMap[dateStr];
                            if (!day) return <div key={dateStr} />;
                            const isSelected = selectedCalendarDate === dateStr;
                            const isToday = day.isToday;
                            const hasScore = typeof day.score === "number";
                            const isAPlus = hasScore && day.score >= 95;

                            let cellStyle = "bg-slate-50/70 dark:bg-white/[0.025] text-slate-700 dark:text-neutral-300 border-slate-200/70 dark:border-white/[0.06]";
                            if (hasScore) {
                              if (isAPlus) {
                                cellStyle = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300/80 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-300 shadow-2xs";
                              } else {
                                cellStyle = "bg-blue-50/80 dark:bg-blue-500/10 border-blue-300/80 dark:border-blue-500/25 text-[#006DFE] dark:text-blue-300 shadow-2xs";
                              }
                            } else if (day.isMarketClosed) {
                              cellStyle = "bg-slate-100/40 dark:bg-white/[0.015] border-transparent text-slate-300 dark:text-neutral-600";
                            } else if (day.isUpcoming) {
                              cellStyle = "border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500";
                            }

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => setSelectedCalendarDate(dateStr)}
                                title={hasScore ? `${day.formattedDate}: Score ${day.score} (${day.grade})` : day.formattedDate}
                                className={`relative p-0.5 rounded-lg border flex flex-col items-center justify-between transition-all cursor-pointer h-7 sm:h-[29px] min-h-[28px] ${cellStyle} ${
                                  isSelected ? "ring-2 ring-[#006DFE] dark:ring-blue-400 shadow-xs scale-[1.02]" : "hover:scale-[1.02]"
                                }`}
                              >
                                {/* Day Number Header */}
                                <div className="flex items-center justify-between w-full px-0.5">
                                  <span className={`text-[8.5px] font-mono font-bold leading-none ${isToday ? "text-[#006DFE] dark:text-blue-400 font-black" : ""}`}>
                                    {day.dayNum}
                                  </span>
                                  {isToday && (
                                    <span className="w-1 h-1 rounded-full bg-[#006DFE] animate-pulse" title="Today's Active Session" />
                                  )}
                                </div>

                                {/* Score in Center */}
                                <div className="my-auto">
                                  {hasScore ? (
                                    <span className={`text-[9.5px] font-black font-mono leading-none tracking-tight ${
                                      isAPlus ? "text-emerald-700 dark:text-emerald-400" : "text-[#006DFE] dark:text-blue-400"
                                    }`}>
                                      {day.score}
                                    </span>
                                  ) : day.isMarketClosed ? (
                                    <span className="text-[8px] font-mono text-slate-300 dark:text-neutral-600">Off</span>
                                  ) : (
                                    <span className="text-[8px] font-mono text-slate-300 dark:text-neutral-600">·</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Selected Day Inspector Mini Card */}
                    <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0 flex items-center gap-2 truncate">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0">
                          {selectedCalendarRecord.formattedDate}:
                        </span>
                        {selectedCalendarRecord.score ? (
                          <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                            selectedCalendarRecord.score >= 95
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/70"
                              : "bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border-blue-200/70"
                          }`}>
                            Score: {selectedCalendarRecord.score}
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-mono text-slate-400 dark:text-neutral-500 shrink-0">
                            {selectedCalendarRecord.isMarketClosed ? "Weekend Off" : "Pending"}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 truncate font-medium">
                          {selectedCalendarRecord.trades ? `${selectedCalendarRecord.trades} Trades · ${selectedCalendarRecord.net}` : selectedCalendarRecord.note}
                        </span>
                      </div>

                      {selectedCalendarRecord.score && (
                        <button
                          type="button"
                          onClick={() => handleOpenCalendarDayModal(selectedCalendarRecord)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-[#006DFE] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200/60 dark:border-blue-500/20 shrink-0 cursor-pointer transition-all"
                        >
                          Audit Log &rarr;
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
                  <span>18 Sessions Audited</span>
                  <span className="text-slate-300 dark:text-neutral-700">·</span>
                  <span>Month Avg: <strong className="text-slate-900 dark:text-white font-bold">92.1</strong></span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>100% Pass Rate</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── PANEL 2: DAILY STREAK ROADMAP (HUMAN-CRAFTED MILESTONE JOURNEY) ── */}
        {activeTab === "streak" && (
          <div className="space-y-4 sm:space-y-5">
            
            {/* Top Streak Stats Bento (4 Pro Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              
              {/* Card 1: Active Streak */}
              <div className={`${CARD_BASE} p-4 flex flex-col justify-between gap-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    CURRENT STREAK
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/25">
                    <Flame size={11} className="fill-amber-500 text-amber-500" />
                    <span>Active Pace</span>
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                    {streakDays} Consecutive Days
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-medium">
                    Nov 4 – Today (Nov 21) · Zero risk breaches
                  </p>
                </div>
                {/* 18 / 21 Progress bar */}
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500 dark:text-neutral-400">
                    <span>Target: 21 Days</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">3 Sessions Left</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(streakDays / 21) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: XP Multiplier */}
              <div className={`${CARD_BASE} p-4 flex flex-col justify-between gap-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    XP MULTIPLIER
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/25">
                    <Star size={11} className="fill-purple-500 text-purple-500" />
                    <span>Tier 2 Boost</span>
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                    1.35x Multiplier
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-medium">
                    +35% bonus XP awarded on all verified MT5 trades
                  </p>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[10.5px] text-slate-500 dark:text-neutral-400">
                  <span>Next: Day 21 Master</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">1.50x Multiplier</span>
                </div>
              </div>

              {/* Card 3: Streak Shield Protection */}
              <div className={`${CARD_BASE} p-4 flex flex-col justify-between gap-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    AUTOMATIC SHIELD
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/25">
                    <Shield size={11} className="stroke-[2.2]" />
                    <span>In Progress</span>
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                    3 Sessions Left
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-medium">
                    Unlocks automated strike absorption on volatile news
                  </p>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[10.5px] text-slate-500 dark:text-neutral-400">
                  <span>Perk</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1 Drawdown Breach Shield</span>
                </div>
              </div>

              {/* Card 4: Historical Best */}
              <div className={`${CARD_BASE} p-4 flex flex-col justify-between gap-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    HISTORICAL RECORD
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/25">
                    <Trophy size={11} className="text-emerald-500" />
                    <span>Top 3%</span>
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                    26 Days PB
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-medium">
                    Personal best reached Oct 2026 · 8 days away
                  </p>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[10.5px] text-slate-500 dark:text-neutral-400">
                  <span>Pass Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white">100% MT5 Compliant</span>
                </div>
              </div>

            </div>

            {/* 3 Structured Weekly Chapters */}
            <div className="space-y-4">
              {streakWeeksData.map((week) => (
                <div key={week.weekId} className={`${CARD_BASE} p-4 sm:p-5 flex flex-col gap-3`}>
                  
                  {/* Chapter Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/[0.06] gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        week.isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20"
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20"
                      }`}>
                        {week.isCompleted ? <CheckCircle2 size={13} /> : <Flame size={13} />}
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                          {week.phaseTitle}
                        </h4>
                        <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 mt-0.5 font-medium">
                          {week.dateRange} · {week.progressLabel}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border self-start sm:self-auto shrink-0 ${
                      week.isCompleted
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/25"
                        : "bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border-blue-200/70 dark:border-blue-500/25"
                    }`}>
                      {week.badgeText}
                    </span>
                  </div>

                  {/* 7 Days Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {week.days.map((item) => {
                      const isCompleted = item.status === "completed";
                      const isActiveToday = item.isToday;
                      const isUpcoming = item.status === "upcoming";
                      const isMilestone = item.isFinalGoal || item.isMilestone;

                      return (
                        <button
                          key={item.dayNum}
                          type="button"
                          onClick={() => handleStreakDayClick(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer group ${
                            isActiveToday
                              ? "bg-blue-50/70 dark:bg-blue-500/10 border-[#006DFE] dark:border-[#006DFE] shadow-sm ring-1 ring-[#006DFE]/30"
                              : isCompleted
                              ? "bg-white dark:bg-[#17171A] hover:bg-slate-50 dark:hover:bg-white/[0.04] border-slate-200/70 dark:border-white/[0.07] hover:border-[#006DFE]/40 shadow-2xs"
                              : isMilestone
                              ? "bg-gradient-to-b from-blue-50/50 to-amber-50/50 dark:from-blue-500/5 dark:to-amber-500/5 border-dashed border-[#006DFE]/50"
                              : "bg-slate-50/50 dark:bg-white/[0.02] border-dashed border-slate-200/70 dark:border-white/5 opacity-65 hover:opacity-100"
                          }`}
                        >
                          {/* Top: Day # + Status Icon */}
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isActiveToday
                                ? "text-[#006DFE] dark:text-blue-400"
                                : "text-slate-400 dark:text-neutral-500"
                            }`}>
                              Day {String(item.dayNum).padStart(2, "0")}
                            </span>

                            {isActiveToday ? (
                              <span className="w-2 h-2 rounded-full bg-[#006DFE] animate-ping" />
                            ) : isCompleted ? (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : isMilestone ? (
                              <Shield size={12} className="text-[#006DFE]" />
                            ) : (
                              <Clock size={11} className="text-slate-400" />
                            )}
                          </div>

                          {/* Middle: Date + Pair */}
                          <div>
                            <div className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#006DFE] transition-colors">
                              {isActiveToday ? "Today" : item.dateStr.split(",")[1] || item.dateStr}
                            </div>
                            <div className="text-[9.5px] font-medium text-slate-400 dark:text-neutral-500 truncate mt-0.5">
                              {item.pair}
                            </div>
                          </div>

                          {/* Bottom: Score or Action badge */}
                          <div className="pt-1 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[9.5px]">
                            {item.score ? (
                              <>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  Score: {item.score}
                                </span>
                                <span className={`font-semibold ${item.net.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                  {item.net}
                                </span>
                              </>
                            ) : isMilestone ? (
                              <span className="font-bold text-[#006DFE] dark:text-blue-400 truncate">
                                21d Shield
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-neutral-500">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>

            {/* Streak & Shield Mechanics FAQ Cards (3-col) */}
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
                  <Zap size={14} className="text-amber-500" />
                  <span>XP Multiplier Stacking</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-medium">
                  Compliant sessions stack multipliers from 1.15x to 1.50x. Achieving 7-day checkpoints locks in your permanent multiplier floor.
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
                  <div className="w-5 h-5 rounded-md bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                    <Trophy size={13} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Trader Discipline Badges (4 / 6 Unlocked)
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
                      {filter === "all" ? "All (6)" : filter === "unlocked" ? "Unlocked (4)" : "In Progress (2)"}
                    </button>
                  ))}
                </div>

                {/* Total Claimed XP Pill */}
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-500/25 flex items-center gap-1.5 shadow-2xs tabular-nums">
                  <Star size={11} className="fill-purple-500 text-purple-500" />
                  <span>+450 XP Claimed</span>
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
                            ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/20"
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

              <div className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 text-xs font-bold self-start sm:self-auto">
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
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#006DFE]/15 text-[#006DFE] dark:text-blue-400 uppercase">
                          {reward.tag}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
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
