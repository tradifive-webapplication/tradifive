import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  Sparkles,
  Flame,
  Plus,
  Quote,
  Check,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Portfolio from "./dashboard/Portfolio";
import Brokers from "./dashboard/Brokers";
import Reports from "./dashboard/Reports";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/lib/supabase";
import PerformanceChart from "@/components/charts/PerformanceChart";
import ShareProfileModal from "@/components/ShareProfileModal";
import DashboardNewsCard from "@/components/dashboard/DashboardNewsCard";
import DashboardPnLCalendar from "@/components/dashboard/DashboardPnLCalendar";
import DashboardGoalsCard from "@/components/dashboard/DashboardGoalsCard";
import PreMarketPlanModal, {
  loadTodayPlan,
  DailyPreMarketPlan,
} from "@/components/dashboard/PreMarketPlanModal";
import LogTradeModal from "@/components/dashboard/LogTradeModal";
import { getGamificationState } from "@/utils/gamification";

type PnlRange = "all" | "today" | "week" | "month";

const PNL_RANGE_TABS: { id: PnlRange; short: string; subLabel: string }[] = [
  { id: "all", short: "All", subLabel: "All time" },
  { id: "today", short: "1D", subLabel: "Today" },
  { id: "week", short: "7D", subLabel: "Last 7 days" },
  { id: "month", short: "1M", subLabel: "This month" },
];

const DAILY_QUOTES = [
  {
    text: "Socrates in this way became perfect, in all things improving himself, attending to nothing except to reason.",
    author: "EPICTETUS",
  },
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "MARCUS AURELIUS",
  },
  {
    text: "The best traders have no ego. To be a great trader you have to swallow your pride and get out of a losing position.",
    author: "TOM BALDWIN",
  },
  {
    text: "Consistency is a state of mind. Protect your capital first, and let your edge play out over a series of trades.",
    author: "MARK DOUGLAS",
  },
  {
    text: "We suffer more often in imagination than in reality. Execute the plan in front of you.",
    author: "SENECA",
  },
  {
    text: "Where you want to be is always in control, never wishing, always trading, and always first and foremost protecting your downside.",
    author: "PAUL TUDOR JONES",
  },
];

function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

function getLiveSessionBadge(): { name: string; active: boolean } {
  const utcHour = new Date().getUTCHours();
  const day = new Date().getUTCDay();
  if (day === 0 || day === 6) return { name: "Weekend · Crypto", active: false };
  if (utcHour >= 12 && utcHour < 16) return { name: "LDN / NY Overlap", active: true };
  if (utcHour >= 7 && utcHour < 12) return { name: "London Session", active: true };
  if (utcHour >= 16 && utcHour < 21) return { name: "New York Session", active: true };
  return { name: "Asian Session", active: true };
}

function formatCompactMoney(val: number, symbol: string, showPlus = false): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : showPlus && val > 0 ? "+" : "";
  const formatted =
    abs === 0
      ? "0"
      : abs >= 1000
      ? abs.toLocaleString("en-US", {
          minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        })
      : abs % 1 === 0
      ? abs.toFixed(0)
      : abs.toFixed(2);
  return `${sign}${symbol}${formatted}`;
}

const InfoTip: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-slate-300 hover:text-slate-500 dark:text-neutral-600 dark:hover:text-neutral-400 transition-colors cursor-pointer"
        aria-label={text}
      >
        <Info size={11.5} strokeWidth={2} />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[10.5px] font-medium leading-snug shadow-lg z-30 pointer-events-none text-center">
          {text}
        </span>
      )}
    </span>
  );
};

// Sculpted tactile white card surface
const SURFACE_CARD =
  "bg-white dark:bg-[#17171A] rounded-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none border border-slate-200/70 dark:border-white/[0.07]";

const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.975 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: EXPO_OUT,
    },
  },
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "main";
  const navigate = useNavigate();

  const {
    equity,
    balance,
    riskConfig,
    recentTrades,
    avgDisciplineScore,
    isConnected,
    accountMetrics,
    dailyXpEarned,
    tradesToday,
    refetch,
  } = useDashboardData();

  const { activeMarket } = useMarket();
  const currSym = activeMarket === "indian" ? "₹" : "$";

  const [pnlRange, setPnlRange] = useState<PnlRange>("all");
  const [hidePnl, setHidePnl] = useState<boolean>(() => {
    try {
      return localStorage.getItem("tf_dashboard_hide_pnl") === "true";
    } catch {
      return false;
    }
  });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [todayPlan, setTodayPlan] = useState<DailyPreMarketPlan | null>(() =>
    loadTodayPlan()
  );
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logModalTab, setLogModalTab] = useState<"manual" | "import">("manual");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [gamification, setGamification] = useState(getGamificationState());

  useEffect(() => {
    try {
      localStorage.setItem("tf_dashboard_hide_pnl", String(hidePnl));
    } catch {
      // Ignore storage error
    }
  }, [hidePnl]);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setProfileData(data);
      } else {
        setProfileData({
          display_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "TradiFive Trader",
          username: user.email?.split("@")[0] || "trader",
        });
      }
    };
    fetchProfile();

    const handleXPUpdate = () => setGamification(getGamificationState());
    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    return () => window.removeEventListener("tradifive_xp_update", handleXPUpdate);
  }, []);

  const activeTrades = useMemo(() => recentTrades || [], [recentTrades]);

  const effectiveBalance = balance;
  const effectiveEquity = equity;
  const effectiveDiscipline = avgDisciplineScore;
  const effectiveDailyXp = dailyXpEarned;
  const effectiveStreak = gamification.streak;
  const effectiveLevel = gamification.level;
  const effectiveRiskConfig = riskConfig;
  const effectiveTradesToday = tradesToday;

  const scopedTrades = useMemo(() => {
    if (pnlRange === "all") return activeTrades;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return activeTrades.filter((t: any) => {
      const dt = new Date(t.closed_at || t.opened_at || t.created_at);
      if (isNaN(dt.getTime())) return false;
      if (pnlRange === "today") return dt >= startOfToday;
      if (pnlRange === "week") return dt >= startOfWeek;
      if (pnlRange === "month") return dt >= startOfMonth;
      return true;
    });
  }, [activeTrades, pnlRange]);

  const openPositions = useMemo(
    () => activeTrades.filter((t: any) => !t.closed_at && !t.is_pending),
    [activeTrades]
  );

  const metrics = useMemo(() => {
    const closed = scopedTrades.filter((t: any) => !!t.closed_at && !t.is_pending);
    const total = closed.reduce((sum: number, t: any) => sum + Number(t.profit || 0), 0);
    const winsArr = closed.filter((t: any) => Number(t.profit || 0) > 0);
    const lossesArr = closed.filter((t: any) => Number(t.profit || 0) < 0);

    const wins = winsArr.length;
    const losses = lossesArr.length;
    const totalClosed = closed.length;
    const winRatePct = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;

    const grossProfit = winsArr.reduce((s: number, t: any) => s + Number(t.profit || 0), 0);
    const grossLoss = Math.abs(
      lossesArr.reduce((s: number, t: any) => s + Number(t.profit || 0), 0)
    );

    const avgWin = wins > 0 ? grossProfit / wins : 0;
    const avgLoss = losses > 0 ? grossLoss / losses : 0;
    const pf =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;

    const rrTrades = winsArr.filter(
      (t: any) =>
        t.risk_reward_ratio !== null &&
        t.risk_reward_ratio !== undefined &&
        !isNaN(Number(t.risk_reward_ratio)) &&
        Number(t.risk_reward_ratio) > 0
    );
    const avgWinRR =
      rrTrades.length > 0
        ? rrTrades.reduce((s: number, t: any) => s + Number(t.risk_reward_ratio), 0) /
          rrTrades.length
        : avgLoss > 0
        ? avgWin / avgLoss
        : 0;

    return {
      total,
      wins,
      losses,
      totalClosed,
      winRatePct,
      avgWin,
      avgLoss,
      pf,
      avgWinRR,
    };
  }, [scopedTrades]);

  const riskSummary = useMemo(() => {
    const currentDrawdownDollar = Math.max(0, effectiveBalance - effectiveEquity);
    const maxLossPercent = effectiveRiskConfig?.max_daily_loss_percent ?? 0;
    const isLimitConfigured =
      maxLossPercent > 0 ||
      (effectiveRiskConfig?.is_prop_firm_mode &&
        effectiveRiskConfig?.prop_firm_daily_loss > 0);
    const drawdownPct =
      effectiveBalance > 0 ? (currentDrawdownDollar / effectiveBalance) * 100 : 0;
    const maxTrades = effectiveRiskConfig?.max_open_trades || 5;
    const usedRatio =
      isLimitConfigured && maxLossPercent > 0
        ? Math.min(100, (drawdownPct / maxLossPercent) * 100)
        : 0;
    return {
      drawdownPct: drawdownPct.toFixed(1),
      maxLossPct: maxLossPercent.toFixed(1),
      isLimitConfigured,
      tradesTaken: effectiveTradesToday,
      maxTrades,
      usedRatio,
    };
  }, [
    effectiveBalance,
    effectiveEquity,
    effectiveRiskConfig,
    effectiveTradesToday,
  ]);

  const activeRangeMeta =
    PNL_RANGE_TABS.find((r) => r.id === pnlRange) || PNL_RANGE_TABS[0];

  const todayFormatted = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const sessionBadge = useMemo(() => getLiveSessionBadge(), []);
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  // Compact SVG Win Rate Ring
  const donutSize = 78;
  const strokeWidth = 6.5;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (Math.min(100, Math.max(0, metrics.winRatePct)) / 100) * circumference;

  const pnlColorClass =
    metrics.total < 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-[#2563EB] dark:text-blue-400";

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const openLogModal = (tab: "manual" | "import") => {
    setLogModalTab(tab);
    setLogModalOpen(true);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }]}
      noScroll={currentTab === "main"}
      noPadding={currentTab === "main"}
    >
      {currentTab === "main" && (
        <div className="flex-1 h-full min-h-0 bg-[#F7F8FA] dark:bg-[#141416] flex flex-col overflow-hidden font-sans transition-colors">
          {/* ── 1. Pinned Header Row (Dashboard + Date + Session + Share stay fixed on scroll) ── */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EXPO_OUT }}
            className="shrink-0 bg-[#F7F8FA]/95 dark:bg-[#141416]/95 backdrop-blur-md z-20"
          >
            <div className="max-w-[540px] lg:max-w-[1060px] mx-auto px-3.5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <h1 className="text-[19px] sm:text-[21px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  Dashboard
                </h1>
                <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1">
                  {todayFormatted}
                </p>
              </div>

              <div className="flex items-center shrink-0">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.08, ease: EXPO_OUT }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[12.5px] font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Share profile"
                >
                  <Share2 size={13.5} strokeWidth={2} />
                  <span>Share profile</span>
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* ── Smooth Scrollable Content Area Below Pinned Header ────────── */}
          <div
            style={{ WebkitOverflowScrolling: "touch", willChange: "scroll-position" }}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain amazing-scrollbar"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-[540px] lg:max-w-[1060px] mx-auto px-3.5 sm:px-6 pt-2.5 sm:pt-3 pb-10 space-y-3.5 sm:space-y-4"
            >

            {/* ── 2. Tactile Sculpted Quick-Start / Account Action Card ─────── */}
            <motion.section variants={cardVariants}>
              {activeTrades.length === 0 ? (
                <div className={`${SURFACE_CARD} px-4 py-3.5 sm:px-5 sm:py-4`}>
                  <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                    Log your first trade
                  </h2>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-snug">
                    Your numbers, calendar and AI coach fill in from your trades. Start with one.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => openLogModal("manual")}
                      className="tactile-white-pill rounded-full px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer"
                    >
                      Log a trade
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => openLogModal("import")}
                      className="tactile-white-pill rounded-full px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer"
                    >
                      Import trades
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => navigate("/settings?tab=trading")}
                      className="tactile-white-pill rounded-full px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer"
                    >
                      Connect broker
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${SURFACE_CARD} px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2`}
                >
                  <div className="flex items-center gap-2 text-[12px]">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? "bg-emerald-500" : "bg-blue-500"
                      }`}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {isConnected && accountMetrics?.broker
                        ? `${accountMetrics.broker} · Live`
                        : "TradiFive Journal"}
                    </span>
                    {isConnected && effectiveEquity > 0 && (
                      <span className="text-slate-400 dark:text-neutral-500 tabular-nums">
                        · Equity{" "}
                        <span
                          className={`inline-block transition-[filter,opacity] duration-200 ${
                            hidePnl ? "blur-[5px] select-none opacity-75" : ""
                          }`}
                        >
                          {formatCompactMoney(effectiveEquity, currSym, false)}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => openLogModal("manual")}
                      className="tactile-white-pill rounded-full px-3 py-1 text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      Log trade
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => openLogModal("import")}
                      className="tactile-white-pill rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer"
                    >
                      Import
                    </motion.button>
                    {!isConnected && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => navigate("/settings?tab=trading")}
                        className="tactile-white-pill rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer"
                      >
                        Connect
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </motion.section>

            {/* ── 3. Main Responsive Grid ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
              {/* LEFT COLUMN: Unified Performance + Clean Equity Curve + Risk & Discipline */}
              <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
                {/* A. TradiFive Signature Performance & P&L Card */}
                <motion.section
                  variants={cardVariants}
                  className={`${SURFACE_CARD} overflow-hidden`}
                >
                  {/* Top Bar: Timeframe Sliding Pills + Analytics + Hide Blur */}
                  <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between gap-2 border-b border-slate-100/90 dark:border-white/[0.05]">
                    <div className="inline-flex items-center p-0.5 rounded-[10px] bg-slate-100/90 dark:bg-white/[0.06]">
                      {PNL_RANGE_TABS.map((tab) => {
                        const active = pnlRange === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setPnlRange(tab.id)}
                            className={`relative px-2.5 py-1 rounded-[8px] text-[11.5px] font-semibold transition-colors cursor-pointer ${
                              active
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="dashboard-range-pill"
                                transition={{ type: "spring", stiffness: 480, damping: 34 }}
                                className="absolute inset-0 bg-white dark:bg-[#26262B] rounded-[8px] shadow-[0_1px_4px_rgba(15,23,42,0.09)]"
                              />
                            )}
                            <span className="relative z-10">{tab.short}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/journal"
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <span>Analytics</span>
                        <ArrowRight size={11.5} strokeWidth={2.2} />
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setHidePnl((v) => !v)}
                        className="tactile-white-pill rounded-[10px] px-2.5 py-1 text-[11.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        title={hidePnl ? "Show amounts" : "Blur amounts"}
                      >
                        {hidePnl ? <Eye size={12.5} /> : <EyeOff size={12.5} />}
                        <span>{hidePnl ? "Show" : "Hide"}</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Center Row: Net P&L (Left) + Animated Win Rate Ring (Right) */}
                  <div className="px-4 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">
                        Net P&amp;L · {activeRangeMeta.subLabel}
                      </p>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${pnlRange}-${metrics.total}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.16 }}
                          className={`mt-1 text-[32px] sm:text-[36px] font-bold tracking-tight leading-none tabular-nums transition-[filter,opacity] duration-200 ${pnlColorClass} ${
                            hidePnl ? "blur-[8px] select-none opacity-80" : "blur-0 opacity-100"
                          }`}
                        >
                          {formatCompactMoney(
                            metrics.total,
                            currSym,
                            metrics.total !== 0
                          )}
                        </motion.div>
                      </AnimatePresence>

                      <div className="mt-2.5 flex items-center flex-wrap gap-2 text-[11.5px]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.07] font-semibold text-slate-700 dark:text-neutral-200 tabular-nums">
                          {metrics.wins}W / {metrics.losses}L
                        </span>
                        <span className="text-slate-400 dark:text-neutral-500 font-medium">
                          {metrics.totalClosed} closed trade
                          {metrics.totalClosed !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Animated Win Rate Ring */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-[78px] h-[78px]">
                        <svg
                          width={donutSize}
                          height={donutSize}
                          viewBox={`0 0 ${donutSize} ${donutSize}`}
                          className="-rotate-90"
                        >
                          <circle
                            cx={donutSize / 2}
                            cy={donutSize / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-slate-100 dark:text-white/10"
                          />
                          <motion.circle
                            cx={donutSize / 2}
                            cy={donutSize / 2}
                            r={radius}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: dashOffset }}
                            transition={{
                              type: "spring",
                              stiffness: 120,
                              damping: 22,
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[14px] font-bold text-slate-900 dark:text-white leading-none tabular-nums">
                            {metrics.winRatePct.toFixed(0)}%
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                            Win
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom 3-Metric Telemetry Row */}
                  <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/[0.06] border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.015]">
                    <div className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-slate-400">
                        <span>Avg RR</span>
                        <InfoTip text="Average reward-to-risk ratio on winning trades." />
                      </div>
                      <p className="mt-0.5 text-[14px] font-semibold text-slate-900 dark:text-white tabular-nums">
                        {metrics.avgWinRR.toFixed(2)}R
                      </p>
                    </div>

                    <div className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-slate-400">
                        <span>Profit Factor</span>
                        <InfoTip text="Gross profit divided by gross loss." />
                      </div>
                      <p className="mt-0.5 text-[14px] font-semibold text-slate-900 dark:text-white tabular-nums">
                        {metrics.pf.toFixed(2)}
                      </p>
                    </div>

                    <div className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-slate-400">
                        <span>Avg W / L</span>
                        <InfoTip text="Average dollar win vs average dollar loss." />
                      </div>
                      <p
                        className={`mt-0.5 text-[14px] font-semibold tabular-nums transition-[filter,opacity] duration-200 ${
                          hidePnl ? "blur-[5.5px] select-none opacity-75" : ""
                        }`}
                      >
                        <span className="text-slate-900 dark:text-white">
                          {formatCompactMoney(metrics.avgWin, currSym, false)}
                        </span>
                        <span className="text-slate-300 dark:text-neutral-600 mx-0.5 font-normal">
                          /
                        </span>
                        <span className="text-slate-400 dark:text-neutral-500">
                          {formatCompactMoney(metrics.avgLoss, currSym, false)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Interactive Pre-Market Plan Strip */}
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(true)}
                    className="w-full px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[12px] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-neutral-200">
                      {todayPlan ? (
                        <>
                          <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </span>
                          <span>
                            Pre-market plan active ·{" "}
                            <span className="capitalize text-slate-500 dark:text-neutral-400 font-medium">
                              {todayPlan.bias} bias
                            </span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span className="text-teal-700 dark:text-teal-400">
                            Start today&apos;s pre-market plan
                          </span>
                        </>
                      )}
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-white transition-all"
                    />
                  </button>
                </motion.section>

                {/* B. Clean Precision Equity Curve Card */}
                <motion.section
                  variants={cardVariants}
                  className={`${SURFACE_CARD} p-4`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={13.5} className="text-slate-500 dark:text-neutral-400" />
                      <h2 className="text-[12.5px] font-semibold text-slate-900 dark:text-white tracking-tight">
                        Equity curve
                      </h2>
                      <span className="text-[11.5px] text-slate-400">
                        · {activeRangeMeta.subLabel}
                      </span>
                    </div>
                    <span
                      className={`text-[12.5px] font-semibold tabular-nums transition-[filter,opacity] duration-200 ${pnlColorClass} ${
                        hidePnl ? "blur-[5.5px] select-none opacity-75" : ""
                      }`}
                    >
                      {formatCompactMoney(
                        metrics.total,
                        currSym,
                        metrics.total !== 0
                      )}
                    </span>
                  </div>

                  {scopedTrades.some((t: any) => t.closed_at) ? (
                    <div
                      className={`h-[165px] w-full transition-[filter,opacity] duration-200 ${
                        hidePnl ? "blur-[6px] select-none pointer-events-none opacity-75" : ""
                      }`}
                    >
                      <PerformanceChart
                        trades={scopedTrades}
                        isDark={isDark}
                        currencySymbol={currSym}
                      />
                    </div>
                  ) : (
                    <div className="py-7 px-3 flex flex-col items-center justify-center rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-dashed border-slate-200/80 dark:border-white/[0.07]">
                      <div className="w-full max-w-[76%] border-t-2 border-dotted border-slate-200 dark:border-white/10" />
                      <p className="mt-2.5 text-[11.5px] text-slate-400 dark:text-neutral-500">
                        Curve updates live after your first closed trade
                      </p>
                    </div>
                  )}
                </motion.section>

                {/* C. Compact 2-Column Bento: Risk Guard + Discipline */}
                <motion.section
                  variants={cardVariants}
                  className="grid grid-cols-2 gap-3"
                >
                  <Link
                    to="/risk-guard"
                    className={`${SURFACE_CARD} p-3.5 hover:-translate-y-[1px] transition-transform block`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-600 dark:text-neutral-300">
                        <ShieldCheck size={13} className="text-blue-600 dark:text-blue-400" />
                        Risk guard
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          riskSummary.isLimitConfigured
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-neutral-400"
                        }`}
                      >
                        {riskSummary.isLimitConfigured ? "Active" : "Setup"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-[19px] font-bold text-slate-900 dark:text-white tabular-nums">
                        {riskSummary.isLimitConfigured
                          ? `${riskSummary.drawdownPct}%`
                          : "—"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {riskSummary.isLimitConfigured
                          ? `/ ${riskSummary.maxLossPct}% limit`
                          : "daily loss"}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.07] mt-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${riskSummary.usedRatio}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          riskSummary.usedRatio > 75
                            ? "bg-rose-500"
                            : "bg-emerald-600"
                        }`}
                      />
                    </div>
                  </Link>

                  <Link
                    to="/rewards"
                    className={`${SURFACE_CARD} p-3.5 hover:-translate-y-[1px] transition-transform block`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-600 dark:text-neutral-300">
                        <Flame size={13} className="text-orange-500" />
                        Discipline
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                        Lv.{effectiveLevel}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[19px] font-bold text-slate-900 dark:text-white tabular-nums">
                        {effectiveDiscipline !== null ? effectiveDiscipline : "—"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {effectiveDiscipline !== null ? "/ 100" : "score"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                      <span>{effectiveStreak}d streak</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        +{effectiveDailyXp} XP
                      </span>
                    </div>
                  </Link>
                </motion.section>

                {/* Open Positions (only when active) */}
                {openPositions.length > 0 && (
                  <motion.section
                    variants={cardVariants}
                    className={`${SURFACE_CARD} p-4`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <h2 className="text-[12.5px] font-semibold text-slate-900 dark:text-white tracking-tight">
                        Open positions ({openPositions.length})
                      </h2>
                      <Link
                        to="/journal"
                        className="text-[11.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Manage →
                      </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                      {openPositions.map((pos: any, idx: number) => {
                        const isBuy =
                          String(pos.trade_type || pos.type || "")
                            .toLowerCase()
                            .includes("buy") || pos.trade_type === 0;
                        const pnlVal = Number(pos.profit || 0);
                        return (
                          <div
                            key={pos.id || idx}
                            className="py-2 flex items-center justify-between text-[12.5px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {pos.symbol}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold ${
                                  isBuy
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                                }`}
                              >
                                {isBuy ? "BUY" : "SELL"}
                              </span>
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                {Number(pos.lot_size ?? pos.volume ?? 0).toFixed(2)}
                              </span>
                            </div>
                            <span
                              className={`font-semibold tabular-nums transition-[filter,opacity] duration-200 ${
                                pnlVal >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              } ${hidePnl ? "blur-[5px] select-none opacity-75" : ""}`}
                            >
                              {formatCompactMoney(pnlVal, currSym, true)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.section>
                )}
              </div>

              {/* RIGHT COLUMN: Tactile Button P&L Calendar + Market Radar + Goals + AI Coach */}
              <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
                <motion.div variants={cardVariants}>
                  <DashboardPnLCalendar
                    trades={activeTrades}
                    currSym={currSym}
                    hidePnl={hidePnl}
                    onLogTrade={() => openLogModal("manual")}
                  />
                </motion.div>

                <motion.div variants={cardVariants}>
                  <DashboardNewsCard />
                </motion.div>

                <motion.div variants={cardVariants}>
                  <DashboardGoalsCard />
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Link
                    to="/ai-coach"
                    className={`${SURFACE_CARD} px-4 py-3.5 flex items-center justify-between gap-3 hover:-translate-y-[1px] transition-transform group`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">
                          TradiFive AI Coach
                        </p>
                        <p className="text-[11.5px] text-slate-400 truncate mt-0.5">
                          Review your setups, psychology &amp; risk rules
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-white transition-all shrink-0"
                    />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* ── 4. Subtle Daily Discipline Quote Footer ───────────────────── */}
            <motion.footer
              variants={cardVariants}
              className="pt-3 pb-4 px-2 flex items-start justify-center gap-2 text-center max-w-[560px] mx-auto"
            >
              <Quote
                size={13}
                className="text-slate-300 dark:text-neutral-700 shrink-0 mt-0.5 rotate-180"
              />
              <p className="text-[11.5px] italic text-slate-400 dark:text-neutral-500 leading-relaxed">
                &ldquo;{dailyQuote.text}&rdquo;{" "}
                <span className="not-italic font-semibold tracking-[0.11em] uppercase text-[10px] text-slate-400/90 dark:text-neutral-500 ml-1">
                  {dailyQuote.author}
                </span>
              </p>
            </motion.footer>
              </motion.div>
            </div>

          {/* Modals */}
          <PreMarketPlanModal
            isOpen={isPlanModalOpen}
            onClose={() => setIsPlanModalOpen(false)}
            onSaved={(plan) => setTodayPlan(plan)}
          />

          <LogTradeModal
            isOpen={logModalOpen}
            initialTab={logModalTab}
            onClose={() => setLogModalOpen(false)}
            onSuccess={() => refetch()}
          />

          <ShareProfileModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            profile={{
              display_name: profileData?.display_name || profileData?.full_name,
              username: profileData?.username,
              avatar_url: profileData?.avatar_url,
              banner_url: profileData?.banner_url,
              bio: profileData?.bio,
              trading_style: profileData?.trading_style,
              trades_count: metrics.totalClosed,
              win_rate: `${metrics.winRatePct.toFixed(1)}%`,
              level: effectiveLevel,
            }}
          />
        </div>
      )}

      {currentTab === "portfolio" && <Portfolio />}
      {currentTab === "brokers" && <Brokers />}
      {currentTab === "reports" && <Reports />}
    </DashboardLayout>
  );
};

export default Dashboard;
