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
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
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
  const [score, setScore] = useState(96);
  const [displayScore, setDisplayScore] = useState(96);
  const [streakDays, setStreakDays] = useState(18);
  const [redeemedRewards, setRedeemedRewards] = useState<Set<string>>(new Set());
  const [replayKey, setReplayKey] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

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
            .slice(0, 2) || "TR";
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
  const [latency, setLatency] = useState(12);
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
      setLatency(Math.floor(10 + Math.random() * 6));
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

  // Live Curve & Metric States
  const [liveTradesCount, setLiveTradesCount] = useState<number>(3);
  const [livePoints7D, setLivePoints7D] = useState<PointData[]>(curveDatasets["7D"].points);
  const [livePoints14D, setLivePoints14D] = useState<PointData[]>(curveDatasets["14D"].points);
  const [livePointsAll, setLivePointsAll] = useState<PointData[]>(curveDatasets["All"].points);
  const [liveHeadline, setLiveHeadline] = useState("+96.0%");
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
      setLiveSessionsCount(recentTrades.length);
      const slTrades = recentTrades.filter((t) => t.sl);
      const slPct = Math.round((slTrades.length / recentTrades.length) * 100);
      setLiveStopLossPercent(slPct);
    }
    if (dailyXpEarned) {
      setXp(850 + dailyXpEarned);
    }
  }, [tradesToday, avgDisciplineScore, breachLogs, recentTrades, dailyXpEarned]);

  // Live Order Simulator / Real-time Execution Trigger
  const handleSimulateLiveTrade = useCallback(() => {
    const pairs = ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "BTCUSD", "NAS100"];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const action = Math.random() > 0.4 ? "BUY" : "SELL";
    const lot = (Math.floor(Math.random() * 6) + 5) / 100;
    const slLatency = (Math.random() * 0.7 + 1.1).toFixed(1);
    const newScore = Math.min(100, Math.max(91, Math.round(95 + Math.random() * 4)));
    const addedEquity = +(Math.random() * 0.6 + 0.2).toFixed(1);

    setLiveEventPulse(true);
    setTimeout(() => setLiveEventPulse(false), 2000);

    setDisplayScore(newScore);
    setScore(newScore);
    setLiveTradesCount((prev) => Math.min(4, prev + 1));
    setLiveSessionsCount((prev) => prev + 1);

    const updatedHeadline = `+${(96.0 + addedEquity).toFixed(1)}%`;
    setLiveHeadline(updatedHeadline);

    const newPoint: PointData = {
      date: new Date(),
      score: newScore,
      equity: updatedHeadline,
      trades: Math.min(4, liveTradesCount + 1),
    };

    setLivePoints7D((prev) => [...prev.slice(1), newPoint]);
    setLivePoints14D((prev) => [...prev.slice(1), newPoint]);
    setLivePointsAll((prev) => [...prev.slice(1), newPoint]);

    setXp((prev) => prev + 25);

    toast.success("Live MT5 Guard: Order Verified", {
      description: `${action} ${lot} ${pair} · Protective SL Attached (${slLatency}s) · Discipline: ${newScore}% (+25 XP)`,
    });
  }, [liveTradesCount]);

  // Real-time periodic live market heartbeat (when streaming is ON)
  useEffect(() => {
    if (!isLiveStreaming) return;
    const streamInterval = setInterval(() => {
      setLiveEventPulse(true);
      setTimeout(() => setLiveEventPulse(false), 1200);

      const microDelta = (Math.random() * 0.16 - 0.04).toFixed(1);
      setLiveHeadline((prev) => {
        const current = parseFloat(prev.replace("+", "").replace("%", "")) || 96.0;
        const updated = Math.max(95.0, Math.min(99.0, current + parseFloat(microDelta))).toFixed(1);
        return `+${updated}%`;
      });
    }, 15000);

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
      sessions: `${liveSessionsCount} closed sessions`,
      scoreLabel: `Score: ${displayScore}%`,
      points,
    };
  }, [activeRange, livePoints7D, livePoints14D, livePointsAll, liveHeadline, liveSessionsCount, displayScore]);

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
          <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="min-w-0 flex items-center gap-2.5">
              <h1 className="text-[19px] sm:text-[21px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                Rewards
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live MT5 Guard
              </span>
            </div>

            {/* Real-time Telemetry & Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] text-[11px] font-mono text-slate-600 dark:text-neutral-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{currentUtcTime || "MT5 Live"}</span>
                <span className="text-slate-300 dark:text-neutral-600">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{latency}ms</span>
              </div>

              <button
                type="button"
                onClick={handleSimulateLiveTrade}
                className="tactile-white-pill inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-white cursor-pointer active:scale-95 transition-all"
                title="Simulate incoming live MT5 trade and update discipline metrics in real time"
              >
                <Zap size={12} className="text-[#006DFE] fill-[#006DFE]" />
                <span>Simulate Live Order</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextState = !isLiveStreaming;
                  setIsLiveStreaming(nextState);
                  toast(nextState ? "Real-Time Stream Resumed" : "Real-Time Stream Paused", {
                    description: nextState ? "MT5 compliance telemetry ticking live." : "Telemetry paused.",
                  });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold cursor-pointer active:scale-95 transition-all ${
                  isLiveStreaming
                    ? "tactile-black-pill"
                    : "tactile-white-pill text-slate-500 dark:text-neutral-400"
                }`}
                title="Toggle Real-Time Stream"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                <span>{isLiveStreaming ? "Live Feed: ON" : "Live Feed: OFF"}</span>
              </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-4 sm:mb-5">
          
          {/* Card A: Trader Identity, Live Status & Telemetry Chips (6 cols - Sculpted Hero Profile) */}
          <div className={`lg:col-span-6 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3`}>
            
            {/* Top row: Status header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                  Discipline Status
                </span>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isConnected ? `${accountMetrics?.broker || "MT5 Server"} · Live` : "MT5 Server · Live"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                  <CheckCircle2 size={11} />
                  <span>Session Finalized</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300">
                  {latency}ms
                </span>
              </div>
            </div>

            {/* Middle row: Avatar + Name + 4 Right-aligned Stat Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-0.5">
              
              {/* User avatar and name */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-[#006DFE] via-indigo-500 to-cyan-400 shadow-sm">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-base sm:text-lg font-black overflow-hidden tracking-tight">
                      {userAvatar}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006DFE] border-2 border-white dark:border-[#17171A] flex items-center justify-center text-[10px] text-white font-bold shadow-2xs">
                    ✓
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                      {userName}
                    </h2>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30 leading-none">
                      {userTier}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-500/30 leading-none">
                      Level 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 font-medium truncate">
                    Level 1 Pro MT5 Trader · Exness Real Verified
                  </p>
                </div>
              </div>

              {/* 4 Stat Chips: TOTAL XP, ACCOUNT, RISK CAP, STREAK */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 shrink-0 text-center">
                {/* TOTAL XP EARNED */}
                <div className="px-3 py-1.5 rounded-xl bg-purple-50/70 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-500/25 shadow-2xs">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center justify-center gap-0.5">
                    <Star size={9} className="fill-purple-500 text-purple-500" />
                    <span>TOTAL XP</span>
                  </div>
                  <div className="text-[12px] font-mono font-black text-purple-900 dark:text-purple-200 mt-0.5 tabular-nums">
                    {(2000 + xp).toLocaleString()} XP
                  </div>
                </div>

                {/* ACCOUNT */}
                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-2xs">
                  <div className="text-[9px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    ACCOUNT
                  </div>
                  <div className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
                    {accountMetrics?.account_number ? `#${accountMetrics.account_number}` : "#88412"}
                  </div>
                </div>

                {/* RISK CAP */}
                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-2xs">
                  <div className="text-[9px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    RISK CAP
                  </div>
                  <div className="text-[12px] font-mono font-bold text-[#006DFE] dark:text-blue-400 mt-0.5 tabular-nums">
                    1.0%
                  </div>
                </div>

                {/* STREAK */}
                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-2xs">
                  <div className="text-[9px] font-mono font-bold uppercase text-slate-400 dark:text-neutral-500">
                    STREAK
                  </div>
                  <div className="text-[12px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                    6W Net
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Lifetime XP context strip */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-neutral-400 gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {(2000 + xp).toLocaleString()} Lifetime XP Earned
                </span>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                  Top 4% Trader Rank
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-medium">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  +{dailyXpEarned || 850} XP this cycle
                </span>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <span className="text-slate-500 dark:text-neutral-400">
                  {1000 - (xp % 1000)} XP to Lv 2
                </span>
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
                <span className="absolute text-[8.5px] font-mono font-bold text-slate-700 dark:text-slate-200">
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
                <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-neutral-400 tabular-nums">
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
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-500/10 text-[#006DFE] dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 shrink-0">
                  ● GRADE A+
                </span>
                {liveEventPulse && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 animate-pulse">
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
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed Active
                  </span>
                </p>
              </div>

              {/* Dashboard-Style Range Switcher */}
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
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 animate-bounce">
                  ⚡ Live Tick
                </span>
              )}
            </div>

            {/* AreaChart: Wide width, height matching Image 2, no line, heavier fill, faded edges */}
            <div className="w-full flex-1 flex flex-col justify-center min-h-[195px] h-[195px] max-h-[210px]">
              <AreaChart
                ariaLabel="Area Chart - Fill"
                aspectRatio="auto"
                className="w-full h-full min-h-[195px] max-h-[210px]"
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
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-neutral-500">
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
                className={`inline-flex items-center gap-2 h-9 sm:h-[38px] px-4 sm:px-5 rounded-full text-xs sm:text-[13px] font-bold select-none cursor-pointer transition-all active:scale-95 ${
                  isActive
                    ? "tactile-black-pill"
                    : "tactile-white-pill text-slate-700 dark:text-neutral-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
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
            
            {/* Rule Compliance Parameters Card (Left side: 70% - 75% width, balanced human proportions) */}
            <div className={`lg:col-span-8 xl:col-span-9 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3`}>
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-1 border-b border-slate-100 dark:border-white/[0.06] gap-2">
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
              <div key={replayKey} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 my-auto">
                {complianceRules.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => handleOpenRuleModal(rule)}
                    className="w-full text-left p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06] hover:border-[#006DFE]/40 dark:hover:border-[#006DFE]/40 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
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

                    {/* Middle: 3D Horizontal Bar + Percentage */}
                    <div className="flex items-center gap-2.5 w-full pt-0.5">
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

                    {/* Bottom: Micro Telemetry Stat */}
                    {rule.telemetryStat && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-500 pt-1 border-t border-slate-200/50 dark:border-white/[0.04]">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600" />
                          {rule.telemetryStat}
                        </span>
                        <span className="text-[9px] text-[#006DFE] dark:text-blue-400 font-semibold group-hover:underline">
                          Inspect &rarr;
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Unified Forex 24/5 Session Rhythm Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
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
                    London &amp; NY Active
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Consistency Log (Right side: 25% - 30% width sleek interactive companion with History switcher) */}
            <div className={`lg:col-span-4 xl:col-span-3 ${CARD_BASE} p-4 sm:p-5 flex flex-col justify-between gap-3`}>
              <div className="flex-1 flex flex-col">
                
                {/* Header: Title, Range & History Selector */}
                <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                        <History size={13} className="text-[#006DFE] shrink-0" />
                        <span>Weekly Consistency Log</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 font-medium">
                        Audit past MT5 sessions &amp; rule pass rate
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-bold text-slate-500 dark:text-neutral-400 shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        A+
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006DFE]" />
                        A
                      </span>
                    </div>
                  </div>

                  {/* Week Navigator Bar: Chevrons + Quick Jump Pills */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={selectedWeekIndex >= weeklyHistory.length - 1}
                        onClick={() => setSelectedWeekIndex((prev) => Math.min(weeklyHistory.length - 1, prev + 1))}
                        title="Previous Week"
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={selectedWeekIndex <= 0}
                        onClick={() => setSelectedWeekIndex((prev) => Math.max(0, prev - 1))}
                        title="Next Week"
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                      >
                        <ChevronRight size={13} />
                      </button>
                      <span className="text-[10.5px] font-mono font-bold text-slate-800 dark:text-neutral-200 pl-1">
                        {currentWeekData.rangeLabel}
                      </span>
                    </div>

                    {/* Quick Week Jump Pills */}
                    <div className="flex items-center gap-1">
                      {weeklyHistory.map((week, idx) => {
                        const isSelected = selectedWeekIndex === idx;
                        return (
                          <button
                            key={week.id}
                            type="button"
                            onClick={() => setSelectedWeekIndex(idx)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-all ${
                              isSelected
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-600 dark:text-neutral-400"
                            }`}
                          >
                            {idx === 0 ? "Current" : idx === 1 ? "-1W" : "-2W"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 6 Sleek Compact Interactive Audit Rows */}
                <div className="space-y-1.5 py-0.5">
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
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.025] hover:bg-blue-50/60 dark:hover:bg-blue-500/10 border border-slate-200/60 dark:border-white/[0.05] hover:border-[#006DFE]/40 dark:hover:border-[#006DFE]/40 transition-all cursor-pointer flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-[9.5px] font-mono font-bold text-slate-700 dark:text-neutral-300 shrink-0 shadow-2xs">
                            {day.dayHeader.slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                              {day.day}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 flex items-center gap-1 truncate">
                              <span className={`w-1 h-1 rounded-full ${dotColor}`} />
                              <span>{day.pair}</span>
                              <span className="text-slate-300 dark:text-neutral-600">·</span>
                              <span className={day.net.startsWith("+") ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                                {day.net}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-black text-slate-900 dark:text-white tabular-nums group-hover:text-[#006DFE] transition-colors">
                            {day.score}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${gradeColor}`}>
                            {day.grade}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Audit Summary Strip */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[10.5px] font-mono text-slate-400 dark:text-neutral-500">
                <span className="flex items-center gap-1">
                  <span>6 Sessions Audited</span>
                  <span className="text-slate-300 dark:text-neutral-600">·</span>
                  <span className="font-bold text-slate-700 dark:text-neutral-300">Avg {currentWeekData.avgScore}</span>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentWeekData.passRate}</span>
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
