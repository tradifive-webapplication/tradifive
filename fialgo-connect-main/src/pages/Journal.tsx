import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  ShieldCheck,
  Key,
  Plus,
  Check,
  Percent,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutGrid,
  Award,
  AlertTriangle,
  Flame,
  Clock,
  Tag,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import JournalMetrics from "@/components/journal/JournalMetrics";
import JournalGrid from "@/components/journal/JournalGrid";
import JournalTradesTable from "@/components/journal/JournalTradesTable";
import TradeSlideOver from "@/components/journal/TradeSlideOver";
import LogTradeModal from "@/components/dashboard/LogTradeModal";
import { ChartRadarDefault } from "@/components/journal/ChartRadarDefault";
import {
  JournalSettingsProvider,
  useJournalSettings,
  CURRENCIES,
  CurrencyCode,
} from "@/contexts/JournalSettingsContext";
import { formatUTCDate, formatHoldDuration } from "@/utils/tradeUtils";
import { buildJournalDemoData } from "@/utils/journalDemoData";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMarket } from "@/contexts/MarketContext";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SURFACE_CARD =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.03 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: EXPO_OUT },
  },
};

function JournalContent() {
  const navigate = useNavigate();
  const { recentTrades, lastImportTime, refetch } = useDashboardData();
  const { activeMarket } = useMarket();
  const { isStarter } = usePlan();
  const {
    currency,
    setCurrency,
    hideBalance,
    setHideBalance,
    hideOnlyBalance,
    setHideOnlyBalance,
    percentageOnly,
    setPercentageOnly,
    formatMoney,
  } = useJournalSettings();

  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logModalTab, setLogModalTab] = useState<"manual" | "import">("manual");
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const demoData = useMemo(
    () => (demoMode ? buildJournalDemoData(activeMarket) : null),
    [demoMode, activeMarket]
  );

  const effectiveTrades = demoData ? demoData.allTrades : recentTrades || [];
  const effectiveLastImport = demoData ? demoData.lastImportTime : lastImportTime;

  // SEBI Indian Market Daily Login State
  const [dailyTokenActive, setDailyTokenActive] = useState(() => {
    try {
      return sessionStorage.getItem("indian_daily_token") === "active";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(e.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResync = async () => {
    toast.promise(
      (async () => {
        if (activeMarket === "indian") {
          const { error } = await supabase.functions.invoke("sync-indian-trades");
          if (error) throw error;
        } else {
          const { error } = await supabase.functions.invoke("sync-metaapi-trades");
          if (error) throw error;
        }
        await refetch();
        setTableRefreshKey((k) => k + 1);
      })(),
      {
        loading: "Synchronizing trades...",
        success: "Sync complete!",
        error: "Sync failed",
      }
    );
  };

  // Extra breakdown stats to complement TradiFive Score Radar in the 3-col analytics row
  const extraStats = useMemo(() => {
    const closed = effectiveTrades.filter(
      (t: any) => !!t.closed_at && !t.is_pending
    );
    const bySymbol = new Map<string, { pnl: number; count: number; wins: number }>();
    const bySetup = new Map<string, { pnl: number; count: number; wins: number }>();

    let longPnl = 0;
    let longCount = 0;
    let longWins = 0;
    let shortPnl = 0;
    let shortCount = 0;
    let shortWins = 0;

    let bestTrade = 0;
    let worstTrade = 0;
    let holdSumMin = 0;
    let holdCount = 0;

    let curWin = 0;
    let bestWinStreak = 0;
    let curLoss = 0;
    let worstLossStreak = 0;

    const chrono = [...closed].sort(
      (a: any, b: any) =>
        new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime()
    );

    chrono.forEach((t: any) => {
      const pnl = Number(t.profit || 0);
      const sym = String(t.symbol || "UNKNOWN").toUpperCase();
      const sEntry = bySymbol.get(sym) || { pnl: 0, count: 0, wins: 0 };
      sEntry.pnl += pnl;
      sEntry.count += 1;
      if (pnl > 0) sEntry.wins += 1;
      bySymbol.set(sym, sEntry);

      const tags: string[] = Array.isArray(t.tags)
        ? t.tags
        : t.setup
        ? [t.setup]
        : [];
      tags.forEach((rawTag) => {
        const clean = String(rawTag || "").trim();
        if (!clean) return;
        const cur = bySetup.get(clean) || { pnl: 0, count: 0, wins: 0 };
        cur.pnl += pnl;
        cur.count += 1;
        if (pnl > 0) cur.wins += 1;
        bySetup.set(clean, cur);
      });

      const isBuy =
        t.trade_type === 0 ||
        String(t.trade_type || t.type || "")
          .toUpperCase()
          .includes("BUY");
      if (isBuy) {
        longPnl += pnl;
        longCount += 1;
        if (pnl > 0) longWins += 1;
      } else {
        shortPnl += pnl;
        shortCount += 1;
        if (pnl > 0) shortWins += 1;
      }

      if (pnl > bestTrade) bestTrade = pnl;
      if (pnl < worstTrade) worstTrade = pnl;

      if (pnl > 0) {
        curWin += 1;
        curLoss = 0;
        if (curWin > bestWinStreak) bestWinStreak = curWin;
      } else if (pnl < 0) {
        curLoss += 1;
        curWin = 0;
        if (curLoss > worstLossStreak) worstLossStreak = curLoss;
      }

      if (t.opened_at && t.closed_at) {
        const diffMin =
          (new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime()) /
          60000;
        if (diffMin > 0 && diffMin < 60 * 24 * 60) {
          holdSumMin += diffMin;
          holdCount += 1;
        }
      }
    });

    const symbolRows = Array.from(bySymbol.entries())
      .map(([symbol, v]) => ({
        symbol,
        ...v,
        winRate: v.count > 0 ? Math.round((v.wins / v.count) * 100) : 0,
      }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      .slice(0, 5);

    const maxAbsSymbol = Math.max(1, ...symbolRows.map((s) => Math.abs(s.pnl)));

    const setupRows = Array.from(bySetup.entries())
      .map(([setup, v]) => ({
        setup,
        ...v,
        winRate: v.count > 0 ? Math.round((v.wins / v.count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const avgHoldMin = holdCount > 0 ? holdSumMin / holdCount : 0;
    const avgHoldLabel =
      avgHoldMin <= 0
        ? "—"
        : avgHoldMin < 60
        ? `${Math.round(avgHoldMin)}m`
        : avgHoldMin < 1440
        ? `${(avgHoldMin / 60).toFixed(1)}h`
        : `${(avgHoldMin / 1440).toFixed(1)}d`;

    return {
      symbolRows,
      maxAbsSymbol,
      setupRows,
      longPnl,
      longCount,
      longWinRate: longCount > 0 ? Math.round((longWins / longCount) * 100) : 0,
      shortPnl,
      shortCount,
      shortWinRate: shortCount > 0 ? Math.round((shortWins / shortCount) * 100) : 0,
      bestTrade,
      worstTrade,
      bestWinStreak,
      worstLossStreak,
      avgHoldLabel,
    };
  }, [effectiveTrades]);

  const blurClass = hideBalance ? "blur-[5px] select-none opacity-75" : "";

  const openLogModal = (tab: "manual" | "import") => {
    setLogModalTab(tab);
    setLogModalOpen(true);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Journal" }]}
      noScroll={true}
      noPadding={true}
    >
      <div className="flex-1 h-full min-h-0 bg-[#F7F8FA] dark:bg-[#141416] flex flex-col overflow-hidden font-sans transition-colors">
        {/* ── Pinned Journal Header & All Original Utility Controls ────────── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EXPO_OUT }}
          className="shrink-0 bg-[#F7F8FA]/95 dark:bg-[#141416]/95 backdrop-blur-md z-30"
        >
          <div className="max-w-[1440px] mx-auto px-3.5 sm:px-6 pt-3 sm:pt-3.5 pb-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Title + Last Import & Resync */}
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[19px] sm:text-[21px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  Journal
                </h1>
                <button
                  type="button"
                  onClick={() => setDemoMode((v) => !v)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                    demoMode
                      ? "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400"
                      : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-neutral-400"
                  }`}
                  title="Toggle demo preview data"
                >
                  {demoMode ? "Demo data · On" : "Demo data · Off"}
                </button>
                {isEditMode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400">
                    Editing layout
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 mt-1 flex-wrap">
                <span>
                  Last import:{" "}
                  <strong className="font-medium text-slate-600 dark:text-neutral-300">
                    {effectiveLastImport}
                  </strong>
                </span>
                <span className="text-slate-300 dark:text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={handleResync}
                  className="inline-flex items-center gap-1 text-[#2563EB] hover:text-blue-700 dark:text-blue-400 font-semibold cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>Resync</span>
                </button>
              </div>
            </div>

            {/* Right Controls: Currency, Hide Balance, Hide Only Bal, Show %, Edit Layout, + Log Trade */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Currency Selector */}
              <div className="relative" ref={currencyDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCurrencyOpen((v) => !v)}
                  className="tactile-white-pill inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer"
                >
                  <span className="tabular-nums">{currency.code}</span>
                  <span className="text-slate-400">{currency.symbol}</span>
                  <ChevronDown
                    size={12}
                    className={`text-slate-400 transition-transform duration-200 ${
                      currencyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {currencyOpen && (
                  <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1.5 w-[210px] bg-white dark:bg-[#1C1C20] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCurrency(c.code as CurrencyCode);
                          setCurrencyOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2 text-left transition-colors cursor-pointer ${
                          currency.code === c.code
                            ? "bg-blue-50/70 dark:bg-blue-500/10"
                            : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] font-semibold text-slate-900 dark:text-white">
                            {c.code}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[12px] font-semibold text-slate-400 tabular-nums">
                          {c.symbol}
                        </span>
                        {currency.code === c.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hide Balance */}
              <button
                type="button"
                onClick={() => {
                  if (isStarter) {
                    toast.error("Premium Feature", {
                      description: "Upgrade to Pro to use privacy features.",
                    });
                    return;
                  }
                  setHideBalance(!hideBalance);
                }}
                className={`tactile-white-pill inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                  hideBalance ? "!text-[#2563EB] dark:!text-blue-400" : ""
                } ${isStarter ? "opacity-60" : ""}`}
                title="Hide all balance and P&L values"
              >
                {hideBalance ? <Eye size={12.5} /> : <EyeOff size={12.5} />}
                <span>{hideBalance ? "Hidden" : "Hide"}</span>
              </button>

              {/* Hide Only Balance */}
              <button
                type="button"
                onClick={() => {
                  if (isStarter) {
                    toast.error("Premium Feature", {
                      description: "Upgrade to Pro to use privacy features.",
                    });
                    return;
                  }
                  setHideOnlyBalance(!hideOnlyBalance);
                }}
                className={`tactile-white-pill hidden sm:inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                  hideOnlyBalance ? "!text-[#2563EB] dark:!text-blue-400" : ""
                } ${isStarter ? "opacity-60" : ""}`}
                title="Hide only account balance while keeping P&L visible"
              >
                <span>{hideOnlyBalance ? "Bal hidden" : "Hide balance"}</span>
              </button>

              {/* Show % */}
              <button
                type="button"
                onClick={() => {
                  if (isStarter) {
                    toast.error("Premium Feature", {
                      description: "Upgrade to Pro to use privacy features.",
                    });
                    return;
                  }
                  setPercentageOnly(!percentageOnly);
                }}
                className={`tactile-white-pill inline-flex items-center gap-1 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                  percentageOnly ? "!text-[#2563EB] dark:!text-blue-400" : ""
                } ${isStarter ? "opacity-60" : ""}`}
                title="Display P&L as percentage of balance"
              >
                <Percent size={11} strokeWidth={2.5} />
                <span>{percentageOnly ? "Only %" : "%"}</span>
              </button>

              {/* Edit / Reorder Layout */}
              <button
                type="button"
                onClick={() => setIsEditMode((v) => !v)}
                className={`tactile-white-pill inline-flex items-center justify-center gap-1 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                  isEditMode ? "!text-[#2563EB] dark:!text-blue-400" : ""
                }`}
                title={isEditMode ? "Save layout order" : "Drag & reorder journal cards"}
              >
                {isEditMode ? (
                  <>
                    <Check size={13} strokeWidth={2.5} />
                    <span>Done</span>
                  </>
                ) : (
                  <LayoutGrid size={13} />
                )}
              </button>

              {/* + Log Trade */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => openLogModal("manual")}
                className="tactile-black-pill inline-flex items-center gap-1 h-[32px] px-3 rounded-[10px] text-[11.5px] font-semibold cursor-pointer"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Log trade</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ── Scrollable Body Strictly Inside Borderless Curved Box ────────── */}
        <div
          style={{ WebkitOverflowScrolling: "touch", willChange: "scroll-position" }}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain amazing-scrollbar"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1440px] mx-auto px-3.5 sm:px-6 pt-2 pb-12 space-y-5"
          >
            {/* SEBI Compliance Banner for Indian Market */}
            {activeMarket === "indian" && !dailyTokenActive && (
              <motion.div
                variants={sectionVariants}
                className={`${SURFACE_CARD} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                      SEBI Compliance: Daily Login Required
                    </p>
                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400">
                      Authorize your Indian broker to pull live trades for today&apos;s session.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Broker API Authorized for Today", {
                      description: "Live syncing active until 3:30 PM market close.",
                    });
                    setDailyTokenActive(true);
                    sessionStorage.setItem("indian_daily_token", "active");
                  }}
                  className="tactile-black-pill rounded-full px-4 py-1.5 text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Key size={13} />
                  <span>Connect for Today</span>
                </button>
              </motion.div>
            )}

            {/* PRO Upsell Banner (Starter plan) */}
            {isStarter && (
              <motion.div
                variants={sectionVariants}
                className={`${SURFACE_CARD} px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}
              >
                <p className="text-[12.5px] text-slate-600 dark:text-neutral-300">
                  Want more out of your journal?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/settings?plan=pro")}
                    className="font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Activate PRO to unlock privacy toggles &amp; advanced insights →
                  </button>
                </p>
              </motion.div>
            )}

            {/* Edit Mode Hint Banner */}
            <AnimatePresence>
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/25 rounded-xl text-[12px] font-medium text-[#2563EB] dark:text-blue-300">
                    <GripVertical size={14} />
                    <span>
                      Drag any metric card, chart, or the calendar to reorder your journal
                      layout. Click <strong>Done</strong> above when finished.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. 5 Draggable Metric Cards (Balance & P&L, Win %, Streak/DD, Avg W/L, Profit Factor) */}
            <motion.section variants={sectionVariants}>
              <JournalMetrics
                isEditMode={isEditMode}
                onEditToggle={() => setIsEditMode((v) => !v)}
                hideToolbar={true}
                demoData={demoData}
              />
            </motion.section>

            {/* 2. 6 Draggable Chart & Calendar Bento Grid (Cumulative P&L, Net Daily P&L, Account Balance, Drawdown, Trading Calendar, Trade Duration) */}
            <motion.section variants={sectionVariants}>
              <JournalGrid isEditMode={isEditMode} demoData={demoData} />
            </motion.section>

            {/* 3. Analytics Overview Row: TradiFive Score Radar + Symbol/Direction Breakdown + Streaks/Setups */}
            <motion.section
              variants={sectionVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              {/* Col 1: Original TradiFive Score 6-Axis Radar */}
              <ChartRadarDefault demoTrades={demoData ? demoData.allTrades : null} />

              {/* Col 2: Performance by Symbol + Long vs Short */}
              <div className={`${SURFACE_CARD} p-4 sm:p-5 flex flex-col justify-between gap-4`}>
                <div>
                  <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Performance by symbol
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Top traded instruments &amp; direction split
                  </p>

                  {extraStats.symbolRows.length === 0 ? (
                    <p className="text-[12px] text-slate-400 py-8 text-center">
                      No closed trades yet.
                    </p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {extraStats.symbolRows.map((row, idx) => {
                        const pctWidth = Math.max(
                          8,
                          (Math.abs(row.pnl) / extraStats.maxAbsSymbol) * 100
                        );
                        return (
                          <div key={row.symbol} className="space-y-1">
                            <div className="flex items-center justify-between text-[12px]">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {row.symbol}
                                </span>
                                <span className="text-[10.5px] text-slate-400 tabular-nums">
                                  {row.count}t ·{" "}
                                  <AnimatedNumber
                                    value={row.winRate}
                                    duration={850}
                                    delay={100 + idx * 45}
                                    format={(v) => `${Math.round(v)}%`}
                                  />
                                </span>
                              </div>
                              <span
                                className={`font-semibold tabular-nums ${blurClass} ${
                                  row.pnl < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-[#2563EB] dark:text-blue-400"
                                }`}
                              >
                                <AnimatedNumber
                                  value={row.pnl}
                                  duration={900}
                                  delay={100 + idx * 45}
                                  format={(v) => formatMoney(v, { showSign: true, raw: true })}
                                />
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pctWidth}%` }}
                                transition={{
                                  duration: 0.9,
                                  delay: 0.1 + idx * 0.05,
                                  ease: EXPO_OUT,
                                }}
                                className={`h-full rounded-full ${
                                  row.pnl < 0 ? "bg-rose-400" : "bg-[#2563EB]"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Long vs Short Split */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Longs ({extraStats.longCount})
                    </span>
                    <p
                      className={`text-[14px] font-bold tabular-nums mt-0.5 ${blurClass} ${
                        extraStats.longPnl < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-[#2563EB] dark:text-blue-400"
                      }`}
                    >
                      <AnimatedNumber
                        value={extraStats.longPnl}
                        duration={950}
                        delay={140}
                        format={(v) => formatMoney(v, { showSign: true, raw: true })}
                      />
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                      <AnimatedNumber
                        value={extraStats.longWinRate}
                        duration={850}
                        delay={160}
                        format={(v) => `${Math.round(v)}%`}
                      />{" "}
                      win rate
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Shorts ({extraStats.shortCount})
                    </span>
                    <p
                      className={`text-[14px] font-bold tabular-nums mt-0.5 ${blurClass} ${
                        extraStats.shortPnl < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-[#2563EB] dark:text-blue-400"
                      }`}
                    >
                      <AnimatedNumber
                        value={extraStats.shortPnl}
                        duration={950}
                        delay={180}
                        format={(v) => formatMoney(v, { showSign: true, raw: true })}
                      />
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                      <AnimatedNumber
                        value={extraStats.shortWinRate}
                        duration={850}
                        delay={200}
                        format={(v) => `${Math.round(v)}%`}
                      />{" "}
                      win rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Col 3: Extremes, Streaks & Tagged Setups */}
              <div className={`${SURFACE_CARD} p-4 sm:p-5 flex flex-col justify-between gap-4`}>
                <div>
                  <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Extremes &amp; setups
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Key execution highs, lows &amp; playbook tags
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mt-4">
                    <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] p-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <Award size={11} className="text-[#2563EB]" />
                        <span>Best trade</span>
                      </div>
                      <p
                        className={`text-[14px] font-bold text-[#2563EB] dark:text-blue-400 tabular-nums mt-1 ${blurClass}`}
                      >
                        <AnimatedNumber
                          value={extraStats.bestTrade}
                          duration={950}
                          delay={120}
                          format={(v) => formatMoney(v, { showSign: true, raw: true })}
                        />
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] p-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <AlertTriangle size={11} className="text-rose-500" />
                        <span>Worst trade</span>
                      </div>
                      <p
                        className={`text-[14px] font-bold tabular-nums mt-1 ${blurClass} ${
                          extraStats.worstTrade < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        <AnimatedNumber
                          value={extraStats.worstTrade}
                          duration={950}
                          delay={150}
                          format={(v) => formatMoney(v, { showSign: true, raw: true })}
                        />
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] p-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <Flame size={11} className="text-amber-500" />
                        <span>Best / worst streak</span>
                      </div>
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                        <AnimatedNumber value={extraStats.bestWinStreak} duration={800} delay={160} />
                        W /{" "}
                        <AnimatedNumber
                          value={extraStats.worstLossStreak}
                          duration={800}
                          delay={190}
                        />
                        L
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] p-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <Clock size={11} className="text-slate-400" />
                        <span>Avg hold</span>
                      </div>
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                        {extraStats.avgHoldLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-2">
                    <Tag size={11} />
                    <span>Tagged setups</span>
                  </div>
                  {extraStats.setupRows.length === 0 ? (
                    <p className="text-[11.5px] text-slate-400">
                      Click any trade below to tag setups &amp; notes.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {extraStats.setupRows.map((s, idx) => (
                        <div
                          key={s.setup}
                          className="flex items-center justify-between text-[11.5px] py-1"
                        >
                          <span className="font-medium text-slate-700 dark:text-neutral-200 truncate">
                            {s.setup}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 tabular-nums">
                            <span className="text-[10.5px] text-slate-400">
                              {s.count}t · {s.winRate}%
                            </span>
                            <span
                              className={`font-semibold ${blurClass} ${
                                s.pnl < 0
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-[#2563EB] dark:text-blue-400"
                              }`}
                            >
                              <AnimatedNumber
                                value={s.pnl}
                                duration={900}
                                delay={140 + idx * 45}
                                format={(v) => formatMoney(v, { showSign: true, raw: true })}
                              />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* 4. Full Live Trades & Positions Table (Account Metrics Bar + Positions/Pending/Closed/Alerts + 14 Columns + Import/Export) */}
            <motion.section variants={sectionVariants}>
              <JournalTradesTable
                refreshKey={tableRefreshKey}
                demoData={demoData}
                onImportCsv={() => openLogModal("import")}
                onTradeClick={(trade) => {
                  const mapped = {
                    id: Number(trade.ticket || 0) || trade.id,
                    asset: trade.symbol,
                    direction:
                      trade.trade_type === 0 ||
                      String(trade.trade_type).toUpperCase().includes("BUY")
                        ? ("BUY" as const)
                        : ("SELL" as const),
                    pnl: Number(trade.profit),
                    entryTime: formatUTCDate(trade.opened_at || trade.created_at),
                    exitTime: trade.closed_at
                      ? formatUTCDate(trade.closed_at)
                      : "Open",
                    entryPrice: Number(trade.open_price || trade.entry_price || 0),
                    exitPrice: Number(trade.close_price || trade.exit_price || 0),
                    stopLoss: trade.stop_loss ? Number(trade.stop_loss) : undefined,
                    takeProfit: trade.take_profit
                      ? Number(trade.take_profit)
                      : undefined,
                    setups: trade.tags || (trade.setup ? [trade.setup] : []),
                    mistakes: [],
                    notes: trade.notes || "",
                    holdDuration: formatHoldDuration(
                      trade.opened_at || trade.created_at,
                      trade.closed_at
                    ),
                    rawTrade: trade,
                  };
                  setSelectedTrade(mapped);
                  setIsSlideOverOpen(true);
                }}
              />
            </motion.section>
          </motion.div>
        </div>

        {/* Trade Slide-Over */}
        <TradeSlideOver
          trade={selectedTrade}
          isOpen={isSlideOverOpen}
          onClose={() => {
            setIsSlideOverOpen(false);
            refetch();
            setTableRefreshKey((k) => k + 1);
          }}
        />

        {/* Log Trade & CSV Import Modal */}
        <LogTradeModal
          open={logModalOpen}
          initialTab={logModalTab}
          currencySymbol={currency.symbol}
          onClose={() => setLogModalOpen(false)}
          onSaved={() => {
            refetch();
            setTableRefreshKey((k) => k + 1);
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default function Journal() {
  return (
    <JournalSettingsProvider>
      <JournalContent />
    </JournalSettingsProvider>
  );
}
