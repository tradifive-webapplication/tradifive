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
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { useMarket } from "@/contexts/MarketContext";
import { buildJournalDemoData } from "@/utils/journalDemoData";
import { supabase } from "@/lib/supabase";
import tradifiveLogo from "@/assets/tradifive-logo.png";

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

const DEFAULT_STATEMENTS: StatementDoc[] = [
  {
    id: "stmt-audit-w47",
    name: "Automated Monday Audit Statement — W47",
    category: "Audit Statements",
    period: "Nov 17 – Nov 22, 2026",
    date: "Nov 22, 2026",
    verifiedPnl: 290.0,
    format: "PDF",
    size: "1.4 MB",
    isAudited: true,
    tradesCount: 1,
  },
  {
    id: "stmt-oct-2026",
    name: "October 2026 Monthly P&L Statement",
    category: "Monthly Statements",
    period: "Oct 01 – Oct 31, 2026",
    date: "Nov 01, 2026",
    verifiedPnl: 3450.0,
    format: "PDF",
    size: "2.1 MB",
    isAudited: true,
    tradesCount: 28,
  },
  {
    id: "stmt-tax-fy26",
    name: "Comprehensive Prop Firm & Tax Report FY26",
    category: "Tax & Fiscal",
    period: "Apr 01 – Nov 22, 2026",
    date: "Nov 15, 2026",
    verifiedPnl: 14820.0,
    format: "PDF",
    size: "3.6 MB",
    isAudited: true,
    tradesCount: 94,
  },
  {
    id: "stmt-csv-oct",
    name: "October 2026 Raw Execution Trade Log",
    category: "Trade Logs",
    period: "Oct 01 – Oct 31, 2026",
    date: "Nov 01, 2026",
    verifiedPnl: 3450.0,
    format: "CSV",
    size: "640 KB",
    isAudited: true,
    tradesCount: 28,
  },
  {
    id: "stmt-audit-w46",
    name: "Automated Monday Audit Statement — W46",
    category: "Audit Statements",
    period: "Nov 10 – Nov 16, 2026",
    date: "Nov 16, 2026",
    verifiedPnl: 840.5,
    format: "PDF",
    size: "1.2 MB",
    isAudited: true,
    tradesCount: 8,
  },
  {
    id: "stmt-full-csv",
    name: "Full Account Lifetime Execution History",
    category: "Trade Logs",
    period: "Jan 01 – Nov 22, 2026",
    date: "Nov 22, 2026",
    verifiedPnl: 18560.0,
    format: "CSV",
    size: "1.8 MB",
    isAudited: true,
    tradesCount: 132,
  },
];

export const Reports: React.FC = () => {
  const { recentTrades, balance, winRate, profitFactor, avgDisciplineScore } = useDashboardData();
  const { formatMoney, hideBalance, percentageOnly } = useJournalSettings();
  const { activeMarket } = useMarket();

  // User Profile
  const [traderName, setTraderName] = useState("TradiFive Trader");
  const [traderUsername, setTraderUsername] = useState("tradifive");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const full = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "TradiFive Trader";
        const uname = session.user.email?.split("@")[0] || "tradifive";
        setTraderName(full);
        setTraderUsername(uname);
      }
    });
  }, []);

  // Demo fallback trades if user has no live trades synced
  const fallbackTrades = useMemo(() => {
    try {
      const demo = buildJournalDemoData(activeMarket);
      return demo.allTrades;
    } catch {
      return [];
    }
  }, [activeMarket]);

  const effectiveTrades = useMemo(() => {
    if (recentTrades && recentTrades.length > 0) return recentTrades;
    return fallbackTrades;
  }, [recentTrades, fallbackTrades]);

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
    if (!effectiveTrades.length) return 290.0;
    return effectiveTrades.reduce((acc, t) => acc + (Number(t.profit) || 0), 0);
  }, [effectiveTrades]);

  const effectiveAccountBalance = balance > 0 ? balance : 28154.0;
  const netPct = (totalNet / effectiveAccountBalance) * 100;

  const winCount = useMemo(() => {
    return effectiveTrades.filter((t) => (Number(t.profit) || 0) > 0).length || 1;
  }, [effectiveTrades]);

  const lossCount = useMemo(() => {
    return effectiveTrades.filter((t) => (Number(t.profit) || 0) < 0).length || 0;
  }, [effectiveTrades]);

  const totalTradesCount = effectiveTrades.length || 1;
  const computedWinRate = Math.round((winCount / totalTradesCount) * 100);

  const bestTrade = useMemo(() => {
    if (!effectiveTrades.length) return { symbol: "NAS100", profit: 290.0, type: "BUY", r: 5.8 };
    const sorted = [...effectiveTrades].sort((a, b) => (Number(b.profit) || 0) - (Number(a.profit) || 0));
    const top = sorted[0];
    return {
      symbol: top?.symbol || "NAS100",
      profit: Number(top?.profit) || 290.0,
      type: String(top?.type || "BUY").toUpperCase().includes("BUY") ? "LONG" : "SHORT",
      r: 5.8,
    };
  }, [effectiveTrades]);

  const worstTrade = useMemo(() => {
    const sorted = [...effectiveTrades].sort((a, b) => (Number(a.profit) || 0) - (Number(b.profit) || 0));
    const worst = sorted[0];
    if (worst && Number(worst.profit) < 0) {
      return {
        symbol: worst.symbol,
        profit: Number(worst.profit),
        type: String(worst.type || "SELL").toUpperCase().includes("BUY") ? "LONG" : "SHORT",
        r: -1.0,
      };
    }
    return null;
  }, [effectiveTrades]);

  // Filtered statements list
  const filteredStatements = useMemo(() => {
    return DEFAULT_STATEMENTS.filter((doc) => {
      const matchCat = activeCategory === "All" || doc.category === activeCategory;
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.period.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

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
      const rows = tradesToExport.map((t, idx) => [
        t.ticket || t.id || `TR-${1000 + idx}`,
        t.symbol || "NAS100",
        String(t.type || "BUY").toUpperCase(),
        t.volume || 1.0,
        t.open_time || "2026-11-22 09:30:00",
        t.closed_at || "2026-11-22 11:45:00",
        t.open_price || 20540.2,
        t.close_price || 20830.2,
        Number(t.profit || 0).toFixed(2),
        `${((Number(t.profit || 0) / effectiveAccountBalance) * 100).toFixed(2)}%`,
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
        format: genFormat,
        size: "1.4 MB",
        isAudited: true,
        tradesCount: effectiveTrades.length || 1,
      });
      toast.success("Statement generated successfully");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ── Top Header & Actions ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      </div>

      {/* ── Consistency Cards (The 5 consistency cards from screenshot) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Daily/Weekly Net Return */}
        <div
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
            className={`text-[22px] sm:text-[24px] font-bold tracking-tight leading-none truncate ${
              totalNet >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {hideBalance ? "•••••" : `${totalNet >= 0 ? "+" : ""}${formatMoney(totalNet, { raw: true })}`}
          </h3>
          <p
            className={`text-[11px] font-semibold mt-2 truncate ${
              totalNet >= 0 ? "text-emerald-600/90 dark:text-emerald-400/90" : "text-rose-600/90 dark:text-rose-400/90"
            }`}
          >
            {totalNet >= 0 ? "+" : ""}
            {netPct.toFixed(2)}% account P&L
          </p>
        </div>

        {/* Card 2: Win Rate */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <Award size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Win Rate
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
            {computedWinRate}%
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
            {winCount} won · {lossCount} lost
          </p>
        </div>

        {/* Card 3: Total Trades */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <Activity size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Total Trades
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
            {totalTradesCount}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
            {winCount} Buy · {lossCount} Sell
          </p>
        </div>

        {/* Card 4: Profit Factor */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <Percent size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Profit Factor
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
            {profitFactor || "290"}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
            Gross wins / losses
          </p>
        </div>

        {/* Card 5: Consistency & Discipline Standing */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <div className="absolute top-4 right-4 text-slate-400/30 group-hover:text-slate-500 transition-colors">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
            Consistency Score
          </span>
          <h3 className="text-[22px] sm:text-[24px] font-bold tracking-tight leading-none text-indigo-600 dark:text-indigo-400 truncate">
            {avgDisciplineScore || 94}%
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
            Disciplined · Rule Compliant
          </p>
        </div>
      </div>

      {/* ── Featured Audit & Statement Packages ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Monday Audit Statement */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group hover:border-slate-300 dark:hover:border-white/20 transition-colors">
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
            <span className="text-[11px] font-semibold text-slate-400">Latest: Nov 22, 2026</span>
            <button
              type="button"
              onClick={() => setSelectedStatement(DEFAULT_STATEMENTS[0])}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View Audit <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Box 2: Tax Statement */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group hover:border-slate-300 dark:hover:border-white/20 transition-colors">
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
            <span className="text-[11px] font-semibold text-slate-400">FY 2025–2026</span>
            <button
              type="button"
              onClick={() => setSelectedStatement(DEFAULT_STATEMENTS[2])}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View Report <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Box 3: Raw Execution Log */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group hover:border-slate-300 dark:hover:border-white/20 transition-colors">
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
            <span className="text-[11px] font-semibold text-slate-400">132 Trades logged</span>
            <button
              type="button"
              onClick={() => handleDownloadCsv("Tradifive_Lifetime_Execution_History")}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Export CSV <Download size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Statements & Documents Center (Table & Filters) ──────────────── */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
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
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                    No statements matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Interactive Statement Preview Modal (Matching Reference Image) ── */}
      {createPortal(
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
                        selectedStatement.verifiedPnl >= 0
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
                          selectedStatement.verifiedPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {selectedStatement.verifiedPnl >= 0 ? "+" : ""}
                        {formatMoney(selectedStatement.verifiedPnl, { raw: true })}
                      </h3>
                      <p
                        className={`text-[11px] font-medium mt-1.5 truncate ${
                          selectedStatement.verifiedPnl >= 0 ? "text-emerald-600/90 dark:text-emerald-400/90" : "text-rose-600/90 dark:text-rose-400/90"
                        }`}
                      >
                        +1.03% account P&L
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
                        100%
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                        1 won · 0 lost
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
                        1
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                        1 Buy · 0 Sell
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
                        290
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
                        N/A
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
                              {bestTrade.symbol}
                            </h4>
                          </div>
                        </div>
                        <span className="tactile-emerald-pill text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          LONG
                        </span>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-[24px] font-bold tracking-tight leading-none text-emerald-500">
                          +{formatMoney(bestTrade.profit, { raw: true })}
                        </h3>
                        <p className="text-[11px] font-medium text-emerald-600/90 dark:text-emerald-400/90 mt-1.5">
                          +5.8R achieved
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
                      </div>
                      <div className="mt-2 text-center py-2">
                        <p className="text-xs font-semibold text-slate-400">N/A</p>
                      </div>
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
                          Felt highly disciplined. Sticked to system rules strictly, accepted stop losses gracefully, and maintained focus.
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
                        <span className="text-[16px] font-bold text-emerald-500 tabular-nums">
                          +{formatMoney(selectedStatement.verifiedPnl, { raw: true })}
                        </span>
                      </div>

                      <div className="h-[200px] w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { time: "09:30", pnl: 0 },
                              { time: "10:00", pnl: 75 },
                              { time: "10:30", pnl: 150 },
                              { time: "11:00", pnl: 225 },
                              { time: "11:45", pnl: selectedStatement.verifiedPnl },
                            ]}
                          >
                            <defs>
                              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
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
                              stroke="#6366F1"
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
      {createPortal(
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
    </div>
  );
};

export default Reports;
