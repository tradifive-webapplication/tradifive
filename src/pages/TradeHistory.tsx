import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Download, Search, Filter, Terminal, Clock, RefreshCw, CheckCircle2,
  AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Bot, ShieldCheck,
  Zap, Calendar, Sliders, ExternalLink, ArrowRight, Key, Layers,
  CreditCard, Shield, FileText, CheckCircle, Package, Lock, Cpu, Eye,
  X
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

const kpiBoxStyle = "h-[120px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none";

const cardBoxStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none transition-all";

const innerTileStyle = "bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[16px] p-3.5 flex flex-col justify-between";

// ── 1. Purchased Algorithms & Licenses ────────────────────────────────────────
interface PurchasedAlgo {
  orderId: string;
  name: string;
  category: string;
  purchaseDate: string;
  price: string;
  licenseKey: string;
  mt5Account: string;
  status: "active" | "provisioned" | "standby";
  version: string;
  description: string;
  pairs: string[];
  billingType: "Lifetime License" | "Pro Included" | "Annual Pass";
}

const mockPurchasedAlgos: PurchasedAlgo[] = [
  {
    orderId: "ORD-849201",
    name: "TradiFive Scalper AI",
    category: "High-Frequency Scalping",
    purchaseDate: "Oct 12, 2026",
    price: "₹24,999",
    licenseKey: "TRDF-8492-AX91",
    mt5Account: "8492018",
    status: "active",
    version: "v4.2 Enterprise",
    description: "Sub-second order routing with dynamic spread offset and volatility burst capture.",
    pairs: ["EURUSD", "XAUUSD"],
    billingType: "Lifetime License"
  },
  {
    orderId: "ORD-791042",
    name: "TradiFive Swing Master",
    category: "Macro Trend Following",
    purchaseDate: "Sep 28, 2026",
    price: "₹19,999",
    licenseKey: "TRDF-7910-SW22",
    mt5Account: "8492018",
    status: "active",
    version: "v3.8 Institutional",
    description: "Multi-timeframe trend confirmation filtering false spikes with volumetric expansion.",
    pairs: ["XAUUSD", "GBPUSD"],
    billingType: "Lifetime License"
  },
  {
    orderId: "ORD-652011",
    name: "TradiFive HFT Core",
    category: "Order Flow Arbitrage",
    purchaseDate: "Aug 15, 2026",
    price: "₹34,999",
    licenseKey: "TRDF-6520-HF99",
    mt5Account: "8492018",
    status: "active",
    version: "v2.4 Ultra",
    description: "Liquidity imbalance capture on US100 market open volatility.",
    pairs: ["US100", "USDJPY"],
    billingType: "Lifetime License"
  },
  {
    orderId: "ORD-541209",
    name: "TradiFive Grid Protocol",
    category: "Mean Reversion Range",
    purchaseDate: "Jul 10, 2026",
    price: "₹17,999",
    licenseKey: "TRDF-5412-GD01",
    mt5Account: "Unassigned",
    status: "standby",
    version: "v1.9 Core",
    description: "Geometric non-martingale basket expansion across ranging currency pairs.",
    pairs: ["GBPJPY", "EURJPY"],
    billingType: "Lifetime License"
  }
];

// ── 2. Executed Trades Orders ────────────────────────────────────────────────
interface ClosedTrade {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  lot: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  pnl: number;
  returnPct: string;
  status: "win" | "loss";
  duration: string;
  strategy: string;
  commission: number;
  swap: number;
  sl: number;
  tp: number;
  magic: string;
}

const mockOrders: ClosedTrade[] = [
  {
    id: "TR-849201",
    pair: "EURUSD",
    type: "BUY",
    lot: 0.10,
    openPrice: 1.08210,
    closePrice: 1.08635,
    openTime: "Today 08:30 AM",
    closeTime: "Today 10:42 AM",
    pnl: 42.50,
    returnPct: "+0.85%",
    status: "win",
    duration: "2h 12m",
    strategy: "TradiFive Scalper AI",
    commission: -1.20,
    swap: 0.00,
    sl: 1.08050,
    tp: 1.08635,
    magic: "849201"
  },
  {
    id: "TR-849202",
    pair: "XAUUSD",
    type: "SELL",
    lot: 0.05,
    openPrice: 2648.50,
    closePrice: 2650.94,
    openTime: "Today 07:10 AM",
    closeTime: "Today 09:15 AM",
    pnl: -12.20,
    returnPct: "-0.24%",
    status: "loss",
    duration: "2h 05m",
    strategy: "TradiFive Swing Master",
    commission: -0.80,
    swap: -0.15,
    sl: 2651.00,
    tp: 2640.00,
    magic: "849202"
  },
  {
    id: "TR-849203",
    pair: "GBPUSD",
    type: "BUY",
    lot: 0.10,
    openPrice: 1.29120,
    closePrice: 1.29971,
    openTime: "Today 06:00 AM",
    closeTime: "Today 08:30 AM",
    pnl: 85.10,
    returnPct: "+1.70%",
    status: "win",
    duration: "2h 30m",
    strategy: "TradiFive Scalper AI",
    commission: -1.20,
    swap: 0.00,
    sl: 1.28900,
    tp: 1.29970,
    magic: "849201"
  },
  {
    id: "TR-849204",
    pair: "USDJPY",
    type: "SELL",
    lot: 0.20,
    openPrice: 153.250,
    closePrice: 152.690,
    openTime: "Yesterday 02:15 PM",
    closeTime: "Yesterday 06:40 PM",
    pnl: 112.00,
    returnPct: "+2.24%",
    status: "win",
    duration: "4h 25m",
    strategy: "TradiFive HFT Core",
    commission: -2.40,
    swap: 0.45,
    sl: 153.600,
    tp: 152.500,
    magic: "849204"
  },
  {
    id: "TR-849205",
    pair: "EURJPY",
    type: "BUY",
    lot: 0.10,
    openPrice: 165.800,
    closePrice: 165.555,
    openTime: "Yesterday 10:10 AM",
    closeTime: "Yesterday 01:20 PM",
    pnl: -24.50,
    returnPct: "-0.49%",
    status: "loss",
    duration: "3h 10m",
    strategy: "TradiFive Grid Protocol",
    commission: -1.20,
    swap: -0.30,
    sl: 165.500,
    tp: 166.400,
    magic: "849203"
  },
  {
    id: "TR-849206",
    pair: "XAUUSD",
    type: "BUY",
    lot: 0.08,
    openPrice: 2635.40,
    closePrice: 2644.90,
    openTime: "2 days ago",
    closeTime: "2 days ago",
    pnl: 76.00,
    returnPct: "+1.52%",
    status: "win",
    duration: "5h 18m",
    strategy: "TradiFive Swing Master",
    commission: -1.10,
    swap: 0.20,
    sl: 2628.00,
    tp: 2645.00,
    magic: "849202"
  },
  {
    id: "TR-849207",
    pair: "GBPUSD",
    type: "BUY",
    lot: 0.10,
    openPrice: 1.28850,
    closePrice: 1.29490,
    openTime: "3 days ago",
    closeTime: "3 days ago",
    pnl: 64.00,
    returnPct: "+1.28%",
    status: "win",
    duration: "4h 40m",
    strategy: "TradiFive Scalper AI",
    commission: -1.20,
    swap: 0.00,
    sl: 1.28600,
    tp: 1.29500,
    magic: "849201"
  },
  {
    id: "TR-849208",
    pair: "US100",
    type: "BUY",
    lot: 0.15,
    openPrice: 20410.50,
    closePrice: 20580.20,
    openTime: "3 days ago",
    closeTime: "3 days ago",
    pnl: 254.55,
    returnPct: "+3.18%",
    status: "win",
    duration: "1h 45m",
    strategy: "TradiFive HFT Core",
    commission: -3.00,
    swap: 0.00,
    sl: 20380.00,
    tp: 20600.00,
    magic: "849204"
  }
];

// ── 3. Exact MT5 Terminal & Bot Execution Logs ───────────────────────────────
interface TerminalLog {
  id: string;
  time: string;
  type: "trade" | "status_on" | "status_off" | "license";
  event: string;
  details: string;
}

const initialTerminalLogs: TerminalLog[] = [
  { id: "log-1", time: "11:02 AM", type: "trade", event: "Trade Opened", details: "EURUSD BUY 0.10 lots @ 1.08410 (Ticket #849202)" },
  { id: "log-2", time: "10:45 AM", type: "status_on", event: "Bot Resumed (ON)", details: "Trading algorithm resumed by User via Web Console" },
  { id: "log-3", time: "10:42 AM", type: "trade", event: "Take Profit Hit", details: "EURUSD BUY 0.10 lots closed at 1.08635 (+$42.50)" },
  { id: "log-4", time: "10:24 AM", type: "trade", event: "Trade Opened", details: "XAUUSD BUY 0.05 lots @ 2641.80 (Ticket #849201)" },
  { id: "log-5", time: "09:40 AM", type: "status_off", event: "Bot Paused (OFF)", details: "Temporary pause during high-volatility session" },
  { id: "log-6", time: "09:15 AM", type: "trade", event: "Stop Loss Hit", details: "XAUUSD SELL 0.05 lots closed at 2650.94 (-$12.20)" },
  { id: "log-7", time: "08:00 AM", type: "license", event: "Heartbeat Verified", details: "License TRDF-8492-AX91 authenticated on MT5 terminal · Ping 2.1ms" },
  { id: "log-8", time: "06:00 AM", type: "status_on", event: "Bot Activated (ON)", details: "Daily trading session initialized on VPS Terminal" }
];

export default function TradeHistory() {
  const navigate = useNavigate();
  const { isConnected } = useDashboardData();

  // Primary Module Tab: "purchases" | "trades" | "terminal"
  const [activeModule, setActiveModule] = useState<"purchases" | "trades" | "terminal">("purchases");

  // Modal State for Terminal Logs
  const [showTerminalModal, setShowTerminalModal] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPair, setSelectedPair] = useState("ALL");
  const [tradeFilter, setTradeFilter] = useState<"all" | "wins" | "losses">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Order & telemetry ledger updated");
    }, 600);
  };

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadEA = (algoName: string) => {
    toast.success(`Downloading ${algoName} (.ex5)`, {
      description: "Ready to install in your MT5 /MQL5/Experts folder."
    });
  };

  const handleDownloadTerminalLog = () => {
    const textContent = initialTerminalLogs
      .map(log => `[${log.time}] [${log.event}] ${log.details}`)
      .join("\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MT5_Audit_Log_${Date.now()}.txt`;
    a.click();
    toast.success("Logs downloaded as MT5_Audit_Log.txt");
  };

  // Filtered Datasets
  const filteredPurchases = mockPurchasedAlgos.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.licenseKey.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const filteredTrades = mockOrders.filter((order) => {
    if (tradeFilter === "wins" && order.status !== "win") return false;
    if (tradeFilter === "losses" && order.status !== "loss") return false;
    if (selectedPair !== "ALL" && !order.pair.toUpperCase().includes(selectedPair)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.pair.toLowerCase().includes(q) ||
        order.strategy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredTerminalLogs = initialTerminalLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.event.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.time.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalPurchases = mockPurchasedAlgos.length;
  const activeLicenses = mockPurchasedAlgos.filter(p => p.status === "active").length;
  const totalProfit = mockOrders.reduce((sum, o) => sum + o.pnl, 0);
  const winCount = mockOrders.filter(o => o.status === "win").length;
  const winRate = Number(((winCount / mockOrders.length) * 100).toFixed(1));

  const handleExportCSV = () => {
    let headers = "";
    let rows = "";

    if (activeModule === "purchases") {
      headers = "Order ID,Algorithm Name,Category,Purchase Date,License Key,MT5 Account,Price,Status\n";
      rows = filteredPurchases.map(p =>
        `${p.orderId},${p.name},${p.category},${p.purchaseDate},${p.licenseKey},${p.mt5Account},${p.price},${p.status}`
      ).join("\n");
    } else if (activeModule === "trades") {
      headers = "Ticket ID,Pair,Type,Lot Size,Open Price,Close Price,Open Time,Close Time,Net PnL,Strategy\n";
      rows = filteredTrades.map(o =>
        `${o.id},${o.pair},${o.type},${o.lot},${o.openPrice},${o.closePrice},${o.openTime},${o.closeTime},${o.pnl},${o.strategy}`
      ).join("\n");
    } else {
      headers = "Time,Event,Details\n";
      rows = filteredTerminalLogs.map(a =>
        `"${a.time}","${a.event}","${a.details}"`
      ).join("\n");
    }

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradifive_${activeModule}_history_${Date.now()}.csv`;
    a.click();
    toast.success(`Exported ${activeModule} ledger as CSV`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6 md:px-8 font-sans">

        {/* ── TOP HEADER (Systemic Tradifive Style) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Order & Activity Ledger
              </h1>
              {isConnected ? (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live MT5 Telemetry
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-amber-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Sandbox Executions
                </span>
              )}
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-2">
              Comprehensive record of purchased algorithms, executed trade orders, and MT5 terminal execution logs
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Open Terminal Button */}
            <button
              type="button"
              onClick={() => setShowTerminalModal(true)}
              className="inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[14px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal Logs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 dark:shadow-none text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-slate-900 dark:text-white" : "text-slate-400"}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 dark:shadow-none text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── 4 KPI BOXES (Consistent with Journal & RiskGuard) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Purchased Algos & Licenses */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Purchased Algos
              </p>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1.5 leading-none">
                <h3
                  className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {totalPurchases}
                </h3>
                <span className="text-[12px] font-medium text-slate-400">
                  ({activeLicenses} Active)
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Licenses
              </span>
            </div>
          </div>

          {/* 2. Realized Net Profit */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Realized Net P&L
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h3
                className={`text-[26px] font-medium tracking-tight leading-none ${totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
              </h3>
              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
                All Trades
              </span>
            </div>
          </div>

          {/* 3. Trades Win Rate */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Trade Win %
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1.5 leading-none">
                <h3
                  className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {winRate}%
                </h3>
                <span className="text-[12px] font-medium text-slate-400">
                  ({winCount} / {mockOrders.length})
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Win Rate
              </span>
            </div>
          </div>

          {/* 4. MT5 Terminal Latency */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                VPS Gateway
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <h3
                  className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  2.1ms Ping
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50">
                OPTIMAL
              </span>
            </div>
          </div>
        </div>

        {/* ── 3 CORE MODULE TABS: (Purchased Algos | Executed Trades | Execution Logs) ── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-1">
          {/* Main Module Switcher */}
          <div className="bg-slate-100 dark:bg-[#191B1E] p-1 rounded-xl flex items-center gap-1 border border-slate-200/50 dark:border-white/5 overflow-x-auto">
            <button
              type="button"
              onClick={() => { setActiveModule("purchases"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${activeModule === "purchases"
                  ? "bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Package className="w-3.5 h-3.5 text-indigo-500" />
              <span>Purchased Algos ({totalPurchases})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveModule("trades"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${activeModule === "trades"
                  ? "bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Executed Trades ({mockOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveModule("terminal"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${activeModule === "terminal"
                  ? "bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>MT5 Execution Logs ({initialTerminalLogs.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeModule}...`}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 1: PURCHASED ALGORITHMS & LICENSES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeModule === "purchases" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  My Purchased Trading Algorithms &amp; Licenses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified EA licenses provisioned to your MT5 terminal with live activation keys
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/strategy")}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <span>Browse Strategy Armory</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPurchases.map((algo) => (
                <div key={algo.orderId} className={cardBoxStyle}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                          {algo.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">·</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Order #{algo.orderId}
                        </span>
                      </div>
                      <h4
                        className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {algo.name}
                      </h4>
                    </div>

                    <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/50 uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {algo.description}
                  </p>

                  {/* 3 Inner Tiles: License Key, MT5 Binding, Plan */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {/* License Key */}
                    <div className={innerTileStyle}>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">
                        License Key
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                          {algo.licenseKey}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, algo.licenseKey, "License Key")}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title="Copy key"
                        >
                          {copiedKey === algo.licenseKey ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* MT5 Account */}
                    <div className={innerTileStyle}>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">
                        Bound MT5
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-white mt-1">
                        #{algo.mt5Account}
                      </span>
                    </div>

                    {/* Plan Tier */}
                    <div className={innerTileStyle}>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">
                        Billing Tier
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">
                        {algo.billingType}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-white/5">
                    <div className="text-[11px] text-slate-400">
                      <span>Purchased: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{algo.purchaseDate}</strong></span>
                      <span className="mx-1.5">·</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{algo.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadEA(algo.name)}
                        className="h-8 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .EX5</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/auto-trade/active-bots")}
                        className="h-8 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>View Bot</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 2: EXECUTED TRADE ORDERS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeModule === "trades" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTradeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${tradeFilter === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                >
                  All ({mockOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter("wins")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${tradeFilter === "wins"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                >
                  Winning ({winCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter("losses")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${tradeFilter === "losses"
                      ? "bg-rose-600 text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                >
                  Losing ({mockOrders.length - winCount})
                </button>
              </div>

              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Pairs</option>
                <option value="EURUSD">EUR/USD</option>
                <option value="XAUUSD">XAU/USD</option>
                <option value="GBPUSD">GBP/USD</option>
                <option value="USDJPY">USD/JPY</option>
                <option value="US100">US100</option>
              </select>
            </div>

            <div className="rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ticket ID</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Asset &amp; Order</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Strategy Engine</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Execution Price</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Timestamp</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Realized P&amp;L</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredTrades.map((order) => {
                      const isExpanded = expandedId === order.id;
                      const isWin = order.status === "win";

                      return (
                        <Fragment key={order.id}>
                          <tr
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${isExpanded ? "bg-slate-50/80 dark:bg-white/[0.03]" : ""
                              }`}
                          >
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                                #{order.id}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {order.pair}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.type === "BUY"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50"
                                  }`}>
                                  {order.type} {order.lot}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{order.strategy}</span>
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="text-xs font-medium text-slate-600 dark:text-slate-300 font-mono">
                                <span>{order.openPrice}</span>
                                <span className="text-slate-400 mx-1">→</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{order.closePrice}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                  {order.closeTime}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {order.duration}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <p
                                  className={`text-sm font-bold tracking-tight leading-none ${isWin ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                    }`}
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  {order.pnl >= 0 ? "+" : ""}${order.pnl.toFixed(2)}
                                </p>
                                <span className={`text-[10px] font-bold ${isWin ? "text-emerald-500" : "text-rose-500"}`}>
                                  {order.returnPct}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Telemetry Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-0 border-t-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-slate-50/60 dark:bg-black/20 px-6 py-5 border-b border-slate-100 dark:border-white/5"
                                >
                                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/50 dark:border-white/5">
                                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                                      MT5 Execution Telemetry (Ticket #{order.id})
                                    </h4>
                                    <span className="text-xs font-mono text-slate-400">
                                      Magic: {order.magic}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Stop Loss</span>
                                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{order.sl}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Take Profit</span>
                                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{order.tp}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Commission</span>
                                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">${order.commission.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Swap Fee</span>
                                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">${order.swap.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Execution Latency</span>
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">1.8ms (VPS)</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Fill Quality</span>
                                      <span className="text-xs font-bold text-slate-800 dark:text-white">Zero Slippage</span>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 3: INLINE MT5 TERMINAL & BOT EXECUTION LOGS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeModule === "terminal" && (
          <div className="space-y-4">
            <div className={cardBoxStyle}>
              {/* Header Row */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#22D99A]/10 text-[#22D99A]">
                    <Terminal size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                      MT5 Terminal &amp; Bot Execution Logs
                    </h3>
                    <p className="text-[11.5px] text-slate-400 dark:text-slate-400">
                      Live timeline of Bot activations, pauses, trades &amp; pings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-500 font-bold">LIVE TELEMETRY</span>
                </div>
              </div>

              {/* Terminal Dark Console Box (Exact User Image Design) */}
              <div className="bg-slate-950 dark:bg-black/90 rounded-[16px] border border-slate-800 dark:border-white/10 p-4 max-h-[380px] overflow-y-auto space-y-2.5 font-mono text-xs text-slate-200">
                {filteredTerminalLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-slate-500 text-[11px] shrink-0 tabular-nums">
                      [{log.time}]
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${log.type === 'status_on'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : log.type === 'status_off'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : log.type === 'license'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                      {log.event}
                    </span>
                    <span className="text-slate-300 text-[11.5px] min-w-0 flex-1 leading-snug">
                      {log.details}
                    </span>
                  </div>
                ))}
              </div>

              {/* Terminal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-slate-400">
                <span className="text-[11.5px] font-mono">
                  VPS Gateway: 185.220.101.44 · Latency: 2.1ms
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTerminalLog}
                    className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[12px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-[#2B2F35] text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="h-[34px] px-4 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                    <span>Refresh Stream</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL: POPUP MT5 TERMINAL & BOT EXECUTION LOGS ── */}
      <AnimatePresence>
        {showTerminalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-2xl dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] max-w-2xl w-full p-6 space-y-4 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#22D99A]/10 text-[#22D99A]">
                    <Terminal size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                      MT5 Terminal &amp; Bot Execution Logs
                    </h3>
                    <p className="text-[11.5px] text-slate-400 dark:text-slate-400">
                      Live timeline of Bot activations, pauses, trades &amp; pings
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTerminalModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Terminal View Container */}
              <div className="bg-slate-950 dark:bg-black/90 rounded-[16px] border border-slate-800 dark:border-white/5 p-4 max-h-[340px] overflow-y-auto space-y-2 font-mono text-xs text-slate-200">
                {initialTerminalLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-slate-500 text-[11px] shrink-0 tabular-nums">
                      [{log.time}]
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${log.type === 'status_on'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : log.type === 'status_off'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : log.type === 'license'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                      {log.event}
                    </span>
                    <span className="text-slate-300 text-[11.5px] min-w-0 flex-1 leading-snug">
                      {log.details}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span className="text-[11.5px]">VPS Gateway: 185.220.101.44 · Latency: 2.1ms</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTerminalLog}
                    className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[12px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTerminalModal(false)}
                    className="h-[34px] px-4 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
