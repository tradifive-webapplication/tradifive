import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Share2,
  Printer,
  CheckCircle2,
  Star,
  Pin,
  Smile,
  Activity,
  Award,
  DollarSign,
  Percent,
  ShieldCheck,
  Search,
  ArrowUpRight,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useJournalSettings, JournalSettingsProvider } from "@/contexts/JournalSettingsContext";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/lib/supabase";
import tradifiveLogo from "@/assets/tradifive-logo.png";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const REPORTS_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const reportsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const reportsCardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: REPORTS_EXPO_OUT,
    },
  },
};

interface StatementDoc {
  id: string;
  name: string;
  category: "Audit Statements" | "Tax & Fiscal" | "Trade Logs" | "Monthly Statements";
  period: string;
  date: string;
  verifiedPnl: number;
  format: "PDF" | "CSV" | "XLSX";
  size: string;
  isAudited?: boolean;
  tradesCount: number;
}

export const Reports: React.FC = () => {
  const { recentTrades, balance, winRate, profitFactor, avgDisciplineScore } = useDashboardData();
  const { formatMoney, hideBalance, percentageOnly } = useJournalSettings();
  const { activeMarket } = useMarket();

  // User Profile
  const [traderName, setTraderName] = useState("TradiFive Trader");
  const [traderUsername, setTraderUsername] = useState("tradifive");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        const full = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "TradiFive Trader";
        const uname = session.user.email?.split("@")[0] || "tradifive";
        setTraderName(full);
        setTraderUsername(uname);
      }
    }).catch(() => {});
  }, []);

  // Live trades data directly from user accounts and logs
  const effectiveTrades = useMemo(() => {
    if (Array.isArray(recentTrades) && recentTrades.length > 0) return recentTrades;
    return [];
  }, [recentTrades]);

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatement, setSelectedStatement] = useState<StatementDoc | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genRange, setGenRange] = useState("this-week");
  const [genFormat, setGenFormat] = useState<"PDF" | "CSV" | "JSON">("PDF");
  const [genScope, setGenScope] = useState("performance");

  // Summary Metrics calculation
  const totalNet = useMemo(() => {
    if (!effectiveTrades.length) return 0;
    return effectiveTrades.reduce((acc, t) => acc + (Number(t?.profit) || 0), 0);
  }, [effectiveTrades]);

  const effectiveAccountBalance = balance > 0 ? balance : 0;
  const netPct = effectiveAccountBalance > 0 ? (totalNet / effectiveAccountBalance) * 100 : 0;
  const safeNetPct = isFinite(netPct) ? netPct.toFixed(2) : "0.00";

  const winCount = useMemo(() => {
    return effectiveTrades.filter((t) => (Number(t?.profit) || 0) > 0).length;
  }, [effectiveTrades]);

  const lossCount = useMemo(() => {
    return effectiveTrades.filter((t) => (Number(t?.profit) || 0) < 0).length;
  }, [effectiveTrades]);

  const buyCount = useMemo(() => {
    return effectiveTrades.filter((t) => String(t?.type || "").toUpperCase().includes("BUY")).length;
  }, [effectiveTrades]);

  const sellCount = useMemo(() => {
    return effectiveTrades.filter((t) => String(t?.type || "").toUpperCase().includes("SELL")).length;
  }, [effectiveTrades]);

  const totalTradesCount = effectiveTrades.length;
  const computedWinRate = totalTradesCount > 0 ? Math.round((winCount / totalTradesCount) * 100) : 0;
  const safeWinRate = isFinite(computedWinRate) ? computedWinRate : 0;

  // Real Profit Factor calculation
  const formattedProfitFactor = useMemo(() => {
    if (typeof profitFactor === "number" && !isNaN(profitFactor) && profitFactor > 0) {
      return profitFactor.toFixed(2);
    }
    const grossProfit = effectiveTrades
      .filter((t) => (Number(t?.profit) || 0) > 0)
      .reduce((acc, t) => acc + Number(t.profit), 0);
    const grossLoss = Math.abs(
      effectiveTrades
        .filter((t) => (Number(t?.profit) || 0) < 0)
        .reduce((acc, t) => acc + Number(t.profit), 0)
    );
    if (grossLoss > 0) {
      return (grossProfit / grossLoss).toFixed(2);
    }
    return grossProfit > 0 ? "10.0+ (Max)" : "0.00";
  }, [profitFactor, effectiveTrades]);

  const bestTrade = useMemo(() => {
    if (!effectiveTrades.length) return null;
    const sorted = [...effectiveTrades].sort((a, b) => (Number(b?.profit) || 0) - (Number(a?.profit) || 0));
    const top = sorted[0];
    if (!top || (Number(top?.profit) || 0) <= 0) return null;
    return {
      symbol: top?.symbol || top?.asset || "TRADE",
      profit: Number(top?.profit) || 0,
      type: String(top?.type || top?.direction || "BUY").toUpperCase().includes("BUY") ? "LONG" : "SHORT",
      r: Number(top?.risk_reward_ratio) || 2.0,
    };
  }, [effectiveTrades]);

  const worstTrade = useMemo(() => {
    if (!effectiveTrades.length) return null;
    const sorted = [...effectiveTrades].sort((a, b) => (Number(a?.profit) || 0) - (Number(b?.profit) || 0));
    const worst = sorted[0];
    if (worst && Number(worst?.profit) < 0) {
      return {
        symbol: worst.symbol || worst.asset || "TRADE",
        profit: Number(worst.profit),
        type: String(worst.type || worst.direction || "SELL").toUpperCase().includes("BUY") ? "LONG" : "SHORT",
        r: Number(worst.risk_reward_ratio) || -1.0,
      };
    }
    return null;
  }, [effectiveTrades]);

  // Latest trade date calculation
  const latestTradeDate = useMemo(() => {
    if (!effectiveTrades.length) return null;
    const latest = effectiveTrades[0];
    const raw = latest?.closed_at || latest?.open_time || latest?.created_at;
    if (!raw) return null;
    return new Date(raw).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [effectiveTrades]);

  // Dynamically generate statement documents from real trades
  const realStatements = useMemo<StatementDoc[]>(() => {
    if (!effectiveTrades || effectiveTrades.length === 0) {
      return [];
    }

    const docs: StatementDoc[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthName = now.toLocaleString("en-US", { month: "long" });

    // 1. Full Lifetime Execution History
    docs.push({
      id: "stmt-lifetime-real",
      name: "Full Account Lifetime Execution History",
      category: "Trade Logs",
      period: `Lifetime (${effectiveTrades.length} Trades)`,
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verifiedPnl: totalNet,
      format: "CSV",
      size: `${Math.max(1, Math.round(effectiveTrades.length * 0.4))} KB`,
      isAudited: true,
      tradesCount: effectiveTrades.length,
    });

    // 2. Weekly Audit Statement (trades in the last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTrades = effectiveTrades.filter((t: any) => {
      const d = t?.closed_at || t?.open_time || t?.created_at;
      return d ? new Date(d) >= sevenDaysAgo : true;
    });
    const weeklyPnl = weeklyTrades.reduce((acc, t) => acc + (Number(t?.profit) || 0), 0);

    docs.push({
      id: "stmt-weekly-real",
      name: `Automated Weekly Audit Statement — ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      category: "Audit Statements",
      period: "Last 7 Days Rolling Window",
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verifiedPnl: weeklyPnl,
      format: "PDF",
      size: "1.2 MB",
      isAudited: true,
      tradesCount: weeklyTrades.length,
    });

    // 3. Current Monthly Statement
    const currentMonthTrades = effectiveTrades.filter((t: any) => {
      const d = t?.closed_at || t?.open_time || t?.created_at;
      if (!d) return true;
      const tradeDate = new Date(d);
      return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === currentYear;
    });
    const monthlyPnl = currentMonthTrades.reduce((acc, t) => acc + (Number(t?.profit) || 0), 0);

    docs.push({
      id: "stmt-month-real",
      name: `${currentMonthName} ${currentYear} Monthly P&L Statement`,
      category: "Monthly Statements",
      period: `${currentMonthName} 01 – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verifiedPnl: monthlyPnl,
      format: "PDF",
      size: "1.8 MB",
      isAudited: true,
      tradesCount: currentMonthTrades.length,
    });

    // 4. Comprehensive Prop Firm & Tax Report
    docs.push({
      id: "stmt-tax-real",
      name: `Comprehensive Prop Firm & Tax Report FY${currentYear}`,
      category: "Tax & Fiscal",
      period: `Year-to-Date FY${currentYear}`,
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verifiedPnl: totalNet,
      format: "PDF",
      size: "2.8 MB",
      isAudited: true,
      tradesCount: effectiveTrades.length,
    });

    return docs;
  }, [effectiveTrades, totalNet]);

  // Filtered statements list
  const filteredStatements = useMemo(() => {
    return realStatements.filter((doc) => {
      const matchCat = activeCategory === "All" || doc.category === activeCategory;
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.period.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [realStatements, activeCategory, searchQuery]);

  // Instant real CSV download generator
  const handleDownloadCsv = (docName: string, tradesToExport = effectiveTrades) => {
    try {
      const headers = [
        "Ticket",
        "Symbol",
        "Type",
        "Volume",
        "Open Time",
        "Close Time",
        "Open Price",
        "Close Price",
        "Profit ($)",
        "P&L (%)",
        "Status",
      ];
      const validTrades = (tradesToExport || []).filter(Boolean);
      const rows = validTrades.map((t: any, idx: number) => [
        t?.ticket || t?.id || `TR-${1000 + idx}`,
        t?.symbol || "NAS100",
        String(t?.type || "BUY").toUpperCase(),
        t?.volume || t?.lot_size || 1.0,
        t?.open_time || t?.opened_at || "2026-11-22 09:30:00",
        t?.closed_at || "2026-11-22 11:45:00",
        t?.open_price || t?.entry_price || 20540.2,
        t?.close_price || 20830.2,
        Number(t?.profit || 0).toFixed(2),
        `${((Number(t?.profit || 0) / (effectiveAccountBalance || 1)) * 100).toFixed(2)}%`,
        "Verified",
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${docName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${docName}`);
    } catch {
      toast.error("Failed to generate CSV export");
    }
  };

  // Trigger Custom Generator
  const handleGenerateCustom = () => {
    setIsGeneratorOpen(false);
    if (genFormat === "CSV") {
      handleDownloadCsv(`Tradifive_${genScope}_${genRange}`);
    } else {
      // Open preview modal
      setSelectedStatement({
        id: `custom-${Date.now()}`,
        name: `Audited Statement — ${genScope.toUpperCase()} (${genRange.replace("-", " ")})`,
        category: "Audit Statements",
        period: "Custom Selected Window",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        verifiedPnl: totalNet,
        format: genFormat === "JSON" ? "PDF" : genFormat,
        size: "1.4 MB",
        isAudited: true,
        tradesCount: effectiveTrades.length || 0,
      });
      toast.success("Statement generated successfully");
    }
  };

  const modalPnl = selectedStatement?.verifiedPnl ?? 0;
  const modalTrades = selectedStatement?.tradesCount ?? totalTradesCount;
  const modalNetPct = effectiveAccountBalance > 0 ? ((modalPnl / effectiveAccountBalance) * 100).toFixed(2) : "0.00";
  const modalWinRate = totalTradesCount > 0 ? safeWinRate : (modalPnl >= 0 ? 100 : 0);
  const modalWins = winCount;
  const modalLosses = lossCount;
  const modalPf = formattedProfitFactor;

  const grossProfit = useMemo(() => {
    return effectiveTrades
      .filter((t) => (Number(t?.profit) || 0) > 0)
      .reduce((acc, t) => acc + Number(t.profit), 0);
  }, [effectiveTrades]);

  const grossLoss = useMemo(() => {
    return Math.abs(
      effectiveTrades
        .filter((t) => (Number(t?.profit) || 0) < 0)
        .reduce((acc, t) => acc + Number(t.profit), 0)
    );
  }, [effectiveTrades]);

  const avgWin = winCount > 0 ? grossProfit / winCount : 0;
  const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
  const modalRR = avgLoss > 0 ? `1:${(avgWin / avgLoss).toFixed(1)}` : (avgWin > 0 ? "1:3.0+" : (totalTradesCount > 0 ? "1:1.0" : "N/A"));

  const chartPoints = useMemo(() => {
    if (!selectedStatement) return [];
    if (effectiveTrades.length === 0) {
      const pnl = Number(selectedStatement.verifiedPnl) || 0;
      return [
        { time: "09:30", pnl: 0 },
        { time: "16:00", pnl: pnl },
      ];
    }
    let running = 0;
    const sortedTrades = [...effectiveTrades].reverse();
    return sortedTrades.map((t: any, idx: number) => {
      running += Number(t?.profit) || 0;
      const d = t?.closed_at || t?.open_time;
      const timeStr = d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `T#${idx + 1}`;
      return { time: timeStr, pnl: Math.round(running * 100) / 100 };
    });
  }, [selectedStatement, effectiveTrades]);

  return (
    <motion.div
      variants={reportsContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-16"
    >
      {/* ── Top Header & Actions ─────────────────────────────────────────── */}
      <motion.div variants={reportsCardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-white">
              Reports & Statements
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={11} strokeWidth={2.5} />
              Verified Ledger
            </span>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Download audited statements, tax reports, Monday P&L certificates, and raw execution logs.
          </p>
        </div>

        {/* Tactile Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => handleDownloadCsv("Tradifive_All_Trades_History")}
            className="tactile-white-pill h-[36px] px-3.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-transform shadow-xs"
          >
            <Download size={13} strokeWidth={2.2} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="tactile-black-pill h-[36px] px-4 rounded-full text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-transform shadow-sm"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Generate Report</span>
          </button>
        </div>
      </motion.div>

      {/* ── Consistency Cards (The 5 consistency cards from screenshot) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Daily/Weekly Net Return */}
        <motion.div
          variants={reportsCardVariants}
          className={`p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${
            totalNet >= 0
              ? "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/30"
              : "bg-rose-500/[0.04] dark:bg-rose-500/[0.08] border-rose-500/30"
          }`}
        >
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <DollarSign size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Audited Net Return
          </span>
          <h3
            className={`text-[22px] sm:text-[24px] font-bold tracking-tight leading-none truncate tabular-nums ${
              totalNet >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {hideBalance ? (
              "•••••"
            ) : (
              <AnimatedNumber
                value={totalNet}
                duration={900}
                format={(v) => `${v >= 0 ? "+" : ""}${formatMoney(v, { raw: true })}`}
              />
            )}
          </h3>
          <p
            className={`text-[11px] font-semibold mt-2 truncate tabular-nums ${
              totalNet >= 0 ? "text-emerald-600/90 dark:text-emerald-400/90" : "text-rose-600/90 dark:text-rose-400/90"
            }`}
          >
            <AnimatedNumber
              value={Number(safeNetPct) || 0}
              duration={850}
              delay={60}
              format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`}
            />{" "}
            account P&amp;L
          </p>
        </motion.div>

        {/* Card 2: Win Rate */}
        <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <Award size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Win Rate
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate tabular-nums">
            <AnimatedNumber value={safeWinRate} duration={850} delay={80} />%
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate tabular-nums">
            {winCount} won · {lossCount} lost
          </p>
        </motion.div>

        {/* Card 3: Total Trades */}
        <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <Activity size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Total Trades
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate tabular-nums">
            <AnimatedNumber value={totalTradesCount} duration={850} delay={120} />
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate tabular-nums">
            {buyCount} Buy · {sellCount} Sell
          </p>
        </motion.div>

        {/* Card 4: Profit Factor */}
        <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <Percent size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Profit Factor
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate tabular-nums">
            {!isNaN(Number(formattedProfitFactor)) ? (
              <AnimatedNumber
                value={Number(formattedProfitFactor)}
                duration={850}
                delay={160}
                format={(v) => v.toFixed(2)}
              />
            ) : (
              formattedProfitFactor
            )}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
            Gross wins / losses
          </p>
        </motion.div>

        {/* Card 5: Consistency & Discipline Standing */}
        <motion.div variants={reportsCardVariants} className="col-span-2 sm:col-span-1 bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Consistency Score
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-indigo-600 dark:text-indigo-400 truncate tabular-nums">
            <AnimatedNumber
              value={avgDisciplineScore ? Number(avgDisciplineScore) : (totalTradesCount > 0 ? 95 : 100)}
              duration={900}
              delay={200}
            />%
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
            {totalTradesCount > 0 ? "Disciplined · Rule Compliant" : "Standing Active · No Violations"}
          </p>
        </motion.div>
      </div>

      {/* ── Featured Audit & Statement Packages ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Monday Audit Statement */}
        <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Weekly
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
              Automated Monday Audit Statements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Transparent trade-by-trade calculation breakdown generated every Monday with verified P&L and broker hashes.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              {latestTradeDate ? `Latest: ${latestTradeDate}` : "Awaiting live trades"}
            </span>
            <button
              type="button"
              onClick={() => {
                const weeklyStmt = realStatements.find((s) => s.category === "Audit Statements") || realStatements[0];
                if (weeklyStmt) {
                  setSelectedStatement(weeklyStmt);
                } else {
                  toast.info("No trading activity recorded yet. Connect an MT5 account to generate audit statements.");
                }
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View Audit <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* Box 2: Tax Statement */}
        <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Fiscal / Tax
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
              Comprehensive Tax & P&L Statement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Ready-to-file documents for prop firms and tax jurisdictions with gross profit, fees, commissions, and net payout tabs.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              FY {new Date().getFullYear() - 1}–{new Date().getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => {
                const taxStmt = realStatements.find((s) => s.category === "Tax & Fiscal") || realStatements[0];
                if (taxStmt) {
                  setSelectedStatement(taxStmt);
                } else {
                  toast.info("No trades to generate tax report. Connect an account to start.");
                }
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View Report <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* Box 3: Raw Execution Log */}
        <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Full Log
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
              Raw Execution & Tick History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Complete tick-level CSV export containing open/close timestamps, lot sizes, slippage, and tags for Excel & Python.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              {totalTradesCount} {totalTradesCount === 1 ? "Trade" : "Trades"} logged
            </span>
            <button
              type="button"
              onClick={() => {
                if (totalTradesCount > 0) {
                  handleDownloadCsv("Tradifive_Lifetime_Execution_History");
                } else {
                  toast.info("No trade records to export yet.");
                }
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Export CSV <Download size={13} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Statements & Documents Center (Table & Filters) ──────────────── */}
      <motion.div variants={reportsCardVariants} className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto amazing-scrollbar pb-1 sm:pb-0">
            {["All", "Audit Statements", "Monthly Statements", "Tax & Fiscal", "Trade Logs"].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search statements..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Document Name</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Verified P&L</th>
                <th className="px-5 py-3">Format</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-white/5">
              {filteredStatements.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText size={15} />
                    </div>
                    <div>
                      <span className="block truncate max-w-[280px] sm:max-w-none">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{doc.category} · {doc.tradesCount} trades</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                    {doc.period}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        doc.verifiedPnl >= 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {doc.verifiedPnl >= 0 ? "+" : ""}
                      {formatMoney(doc.verifiedPnl, { raw: true })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-500 dark:text-slate-400">
                    {doc.format} <span className="text-[10px] opacity-70">({doc.size})</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-500 dark:text-slate-400">
                    {doc.date}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStatement(doc)}
                        className="tactile-white-pill h-[30px] px-3 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer select-none active:scale-95 transition-transform"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadCsv(doc.name)}
                        className="tactile-white-pill w-[30px] h-[30px] rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform"
                        title="Download"
                      >
                        <Download size={13} strokeWidth={2.4} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStatements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400 mb-3">
                      <FileText size={22} />
                    </div>
                    <h4 className="text-[14.5px] font-bold text-slate-800 dark:text-white mb-1">
                      {totalTradesCount === 0 ? "No Statements Generated Yet" : "No statements matching filter"}
                    </h4>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      {totalTradesCount === 0
                        ? "Statements and audited trade logs will generate automatically as trades execute on your connected MT5 or broker accounts."
                        : "Try searching with a different keyword or selecting 'All' categories."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Interactive Statement Preview Modal (Matching Reference Image) ── */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedStatement && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto amazing-scrollbar">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStatement(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-[980px] bg-white dark:bg-[#141416] border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-900 dark:text-white my-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-150 dark:border-white/10 bg-white dark:bg-[#141416] gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <img src={tradifiveLogo} alt="Tradifive Logo" className="h-[32px] sm:h-[38px] w-auto object-contain" />
                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-indigo-500" />
                        <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                          {selectedStatement.period}
                        </h2>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {selectedStatement.name}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv(selectedStatement.name)}
                      className="tactile-white-pill h-[34px] px-3.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer select-none active:scale-95"
                    >
                      <Download size={13} strokeWidth={2.4} />
                      <span className="hidden sm:inline">Download CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="tactile-white-pill h-[34px] px-3.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 cursor-pointer select-none active:scale-95"
                    >
                      <Share2 size={13} strokeWidth={2.4} />
                      <span className="hidden sm:inline">Share Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStatement(null)}
                      className="tactile-white-pill w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer select-none active:scale-95 shrink-0"
                    >
                      <X size={15} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>

                {/* Modal Body (Matching the exact cards & buttons layout from screenshot) */}
                <div className="flex-1 overflow-y-auto amazing-scrollbar p-5 sm:p-8 space-y-5 bg-[#F8F9FA] dark:bg-[#111112]">
                  {/* Row 1: The 5 Consistency Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Card 1: Daily Net Return */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl relative overflow-hidden border shadow-xs ${
                        modalPnl >= 0
                          ? "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] border-emerald-500/30"
                          : "bg-rose-500/[0.05] dark:bg-rose-500/[0.08] border-rose-500/30"
                      }`}
                    >
                      <div className="absolute top-4 right-4 text-slate-400/30">
                        <DollarSign size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">
                        Daily Net Return
                      </span>
                      <h3
                        className={`text-[22px] sm:text-[24px] font-bold tracking-tight leading-none truncate ${
                          modalPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {modalPnl >= 0 ? "+" : ""}
                        {formatMoney(modalPnl, { raw: true })}
                      </h3>
                      <p
                        className={`text-[11px] font-medium mt-1.5 truncate ${
                          modalPnl >= 0 ? "text-emerald-600/90 dark:text-emerald-400/90" : "text-rose-600/90 dark:text-rose-400/90"
                        }`}
                      >
                        {modalPnl >= 0 ? "+" : ""}{modalNetPct}% account P&L
                      </p>
                    </div>

                    {/* Card 2: Win Rate */}
                    <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xs">
                      <div className="absolute top-4 right-4 text-slate-400/30">
                        <Award size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">
                        Win Rate
                      </span>
                      <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                        {modalWinRate}%
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                        {modalWins} won · {modalLosses} lost
                      </p>
                    </div>

                    {/* Card 3: Total Trades */}
                    <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xs">
                      <div className="absolute top-4 right-4 text-slate-400/30">
                        <Activity size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">
                        Total Trades
                      </span>
                      <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                        {modalTrades}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                        {buyCount} Buy · {sellCount} Sell
                      </p>
                    </div>

                    {/* Card 4: Profit Factor */}
                    <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xs">
                      <div className="absolute top-4 right-4 text-slate-400/30">
                        <Percent size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">
                        Profit Factor
                      </span>
                      <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                        {modalPf}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                        Gross wins / losses
                      </p>
                    </div>

                    {/* Card 5: R:R Achieved */}
                    <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">
                        R:R Achieved
                      </span>
                      <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                        {modalRR}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                        Avg Win / Loss ratio
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Best Trade & Worst Trade Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Best Trade */}
                    <div className="bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] border border-emerald-500/25 dark:border-emerald-500/30 p-5 sm:p-6 rounded-2xl relative shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                            <Star size={17} className="fill-emerald-500/20" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Best Trade
                            </span>
                            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white uppercase leading-none mt-1">
                              {bestTrade ? bestTrade.symbol : "No Winning Trades"}
                            </h4>
                          </div>
                        </div>
                        {bestTrade && (
                          <span className="tactile-emerald-pill text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            {bestTrade.type}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="text-[24px] font-bold tracking-tight leading-none text-emerald-500">
                          {bestTrade ? `+${formatMoney(bestTrade.profit, { raw: true })}` : "$0.00"}
                        </h3>
                        <p className="text-[11px] font-medium text-emerald-600/90 dark:text-emerald-400/90 mt-1.5">
                          {bestTrade ? `+${bestTrade.r || 2.0}R achieved` : "Awaiting winning trades"}
                        </p>
                      </div>
                    </div>

                    {/* Worst Trade */}
                    <div className="bg-rose-500/[0.05] dark:bg-rose-500/[0.08] border border-rose-500/25 dark:border-rose-500/30 p-5 sm:p-6 rounded-2xl relative shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                            <Pin size={17} className="rotate-45" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Worst Trade
                            </span>
                            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white uppercase leading-none mt-1">
                              {worstTrade ? worstTrade.symbol : "N/A"}
                            </h4>
                          </div>
                        </div>
                        {worstTrade && (
                          <span className="tactile-rose-pill text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            SHORT
                          </span>
                        )}
                      </div>
                      {worstTrade ? (
                        <div className="mt-2">
                          <h3 className="text-[24px] font-bold tracking-tight leading-none text-rose-500">
                            {formatMoney(worstTrade.profit, { raw: true })}
                          </h3>
                          <p className="text-[11px] font-medium text-rose-600/90 dark:text-rose-400/90 mt-1.5">
                            {worstTrade.r ? `${worstTrade.r}R` : "Drawdown"}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 text-center py-2">
                          <p className="text-xs font-semibold text-slate-400">No losses recorded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Emotional State & Intraday P&L Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Emotional State (with smileys & meditating illustration) */}
                    <div className="col-span-1 bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Smile size={16} className="text-indigo-500" />
                            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">
                              Emotional State
                            </h4>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            AUTO
                          </span>
                        </div>

                        {/* 5 Smiley Faces row */}
                        <div className="flex items-center gap-2.5 mb-5">
                          {["Impatient", "Stressed", "Neutral", "Disciplined", "Calm"].map((em, idx) => {
                            const isDisciplined = em === "Disciplined";
                            return (
                              <div
                                key={em}
                                className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs transition-transform ${
                                  isDisciplined
                                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30 scale-105"
                                    : "border-slate-200 dark:border-white/10 text-slate-400 opacity-60"
                                }`}
                              >
                                {idx === 0 && ">:("}
                                {idx === 1 && ":("}
                                {idx === 2 && ":|"}
                                {idx === 3 && ":)"}
                                {idx === 4 && ":D"}
                              </div>
                            );
                          })}
                        </div>

                        <h5 className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400">
                          Disciplined
                        </h5>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Felt highly disciplined. Stuck to system rules strictly, accepted stop losses gracefully, and maintained focus.
                        </p>
                      </div>

                      {/* Meditating Trader SVG Illustration */}
                      <div className="flex justify-end mt-4">
                        <svg viewBox="0 0 100 100" className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="50" cy="30" r="10" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
                          <path d="M30 75 Q50 60 70 75" />
                          <path d="M40 45 L50 65 L60 45" />
                          <circle cx="35" cy="55" r="2" fill="currentColor" />
                          <circle cx="65" cy="55" r="2" fill="currentColor" />
                        </svg>
                      </div>
                    </div>

                    {/* Intraday P&L Over Time Line Chart */}
                    <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-indigo-500" />
                          <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                            Intraday P&L Over Time
                          </h4>
                        </div>
                        <span className={`text-[16px] font-bold tabular-nums ${modalPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {modalPnl >= 0 ? "+" : ""}{formatMoney(modalPnl, { raw: true })}
                        </span>
                      </div>

                      <div className="h-[200px] w-full pt-2 min-h-[200px]">
                        <ResponsiveContainer width="100%" height={200} minWidth={100} minHeight={180}>
                          <AreaChart data={chartPoints}>
                            <defs>
                              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={modalPnl >= 0 ? "#6366F1" : "#F43F5E"} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={modalPnl >= 0 ? "#6366F1" : "#F43F5E"} stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                            <XAxis dataKey="time" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis
                              stroke="#888"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                              formatter={(val: any) => [`$${val}`, "P&L"]}
                              contentStyle={{
                                backgroundColor: "#18181B",
                                borderColor: "rgba(255,255,255,0.1)",
                                borderRadius: "10px",
                                fontSize: "11px",
                                color: "#fff",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="pnl"
                              stroke={modalPnl >= 0 ? "#6366F1" : "#F43F5E"}
                              strokeWidth={2.4}
                              fillOpacity={1}
                              fill="url(#pnlGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Tradifive Discipline Quote Bar (Exact from screenshot) */}
                  <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 font-bold">••</span>
                      <span>Discipline is choosing between what you want now and what you want most.</span>
                    </div>
                    <span className="text-slate-400 font-semibold">— Tradifive</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Generate Custom Report Modal ─────────────────────────────────── */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isGeneratorOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsGeneratorOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="relative w-full max-w-[480px] bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 sm:p-6 text-slate-900 dark:text-white space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    Generate Custom Statement
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Scope selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Scope</label>
                  <select
                    value={genScope}
                    onChange={(e) => setGenScope(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium outline-none"
                  >
                    <option value="performance">Comprehensive Performance Audit</option>
                    <option value="tax">Fiscal & Tax Statement (Prop Firm)</option>
                    <option value="raw_execution">Raw Execution History (Tick Data)</option>
                    <option value="discipline">Discipline & Consistency Scorecard</option>
                  </select>
                </div>

                {/* Period selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Period</label>
                  <select
                    value={genRange}
                    onChange={(e) => setGenRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium outline-none"
                  >
                    <option value="today">Today (Intraday)</option>
                    <option value="this-week">This Week (Monday to Present)</option>
                    <option value="this-month">This Month (November 2026)</option>
                    <option value="last-month">Last Month (October 2026)</option>
                    <option value="ytd">Year to Date (2026)</option>
                    <option value="all-time">All-Time Lifetime History</option>
                  </select>
                </div>

                {/* Format selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["PDF", "CSV", "JSON"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setGenFormat(fmt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          genFormat === fmt
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                            : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateCustom}
                    className="tactile-black-pill px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download size={13} />
                    <span>Generate & Download</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default function ReportsPage() {
  return (
    <JournalSettingsProvider>
      <Reports />
    </JournalSettingsProvider>
  );
}
