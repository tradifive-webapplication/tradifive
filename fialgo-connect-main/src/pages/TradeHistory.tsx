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

const kpiBoxStyle = "bg-[#1E1E1E] border border-white/5 rounded-lg p-4 relative flex flex-col justify-between";

const cardBoxStyle = "bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-3.5 hover:border-white/10 transition-none";

const innerTileStyle = "bg-black/30 border border-white/5 rounded-lg p-3 flex flex-col justify-between";

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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPair, setSelectedPair] = useState("ALL");
  const [selectedAlgo, setSelectedAlgo] = useState("ALL");
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
    if (selectedAlgo !== "ALL" && order.strategy !== selectedAlgo) return false;

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

  const algoStats = mockPurchasedAlgos.map((algo) => {
    const trades = mockOrders.filter(o => o.strategy.toLowerCase() === algo.name.toLowerCase());
    const pnl = trades.reduce((sum, o) => sum + o.pnl, 0);
    return {
      name: algo.name,
      tradesCount: trades.length,
      pnl
    };
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
      <div className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full">

        {/* ── Top Header (Admin App Style: Dark, Clean, Sharp Borders) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
              style={{ borderColor: "#3b82f620" }}
            >
              <FileText size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                  Order History &amp; Execution Audit
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    {isConnected ? "Live Telemetry" : "Sandbox Executions"}
                  </span>
                </div>
              </div>
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">
                Purchased Algorithms, MT5 Execution Orders &amp; Terminal Audit Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-white" : "text-neutral-400"} />
              <span>Sync Data</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} className="text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── 4 Metric Cards Grid (Matching Admin App Style, Fonts & Numbers) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Purchased Algos */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 relative">
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {activeLicenses} Active
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
              <Bot size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {totalPurchases}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              PURCHASED ALGOS
            </div>
          </div>

          {/* Card 2: Realized Net P&L */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 relative">
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                All Trades
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <TrendingUp size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              +${totalProfit.toFixed(2)}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              REALIZED NET P&amp;L
            </div>
          </div>

          {/* Card 3: Trade Win % */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 relative">
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-mono font-bold text-neutral-400 bg-black/40 px-1.5 py-0.5 rounded">
                {winCount}/{mockOrders.length} Wins
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
              <Activity size={15} />
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {winRate}%
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              TRADE WIN RATE
            </div>
          </div>

          {/* Card 4: VPS Gateway Latency */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 relative">
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                OPTIMAL
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
              <Zap size={15} />
            </div>
            <div className="flex items-center gap-1.5 text-2xl font-bold font-mono text-white tracking-tight">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>2.1ms</span>
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              VPS LATENCY
            </div>
          </div>
        </div>

        {/* ── Status Strip (Matching Admin App Green Status Dot) ── */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 flex-wrap">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold">MT5 Terminal: Connected (0% Slippage)</span>
          <span className="text-neutral-600">·</span>
          <span>{totalPurchases} Licenses Provisioned ({activeLicenses} Active)</span>
          <span className="text-neutral-600">·</span>
          <span>{mockOrders.length} Executed Trades Audited</span>
          <span className="text-neutral-600">·</span>
          <span>Zero-Lag VPS Sync</span>
        </div>

        {/* ── Top Navigation Tabs & Search (Pill styling matching Admin App) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => { setActiveModule("purchases"); setSearchQuery(""); }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeModule === "purchases"
                  ? "bg-[#1E1E1E] text-white border border-white/10 shadow-xs"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Bot size={13} className={activeModule === "purchases" ? "text-blue-400" : ""} />
              <span>Purchased Algos</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-neutral-400 font-mono font-bold">
                {totalPurchases}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveModule("trades"); setSearchQuery(""); }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeModule === "trades"
                  ? "bg-[#1E1E1E] text-white border border-white/10 shadow-xs"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Activity size={13} className={activeModule === "trades" ? "text-emerald-400" : ""} />
              <span>Executed Trades</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 font-mono font-bold">
                {mockOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveModule("terminal"); setSearchQuery(""); }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeModule === "terminal"
                  ? "bg-[#1E1E1E] text-white border border-white/10 shadow-xs"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Terminal size={13} className={activeModule === "terminal" ? "text-purple-400" : ""} />
              <span>MT5 Execution Logs</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-purple-400 font-mono font-bold">
                {initialTerminalLogs.length}
              </span>
            </button>
          </div>

          {/* Search Box matching Admin Input Style */}
          <div className="relative min-w-[240px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeModule}...`}
              className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded pl-8 pr-3 text-xs font-mono text-white focus:outline-none placeholder-neutral-500 transition-none"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 1: PURCHASED ALGORITHMS & LICENSES (Clean Admin Grid)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeModule === "purchases" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {filteredPurchases.map((algo) => (
              <div key={algo.orderId} className={cardBoxStyle}>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {algo.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        #{algo.orderId}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-1.5">
                      {algo.name}
                    </h4>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </span>
                </div>

                {/* 3 Spec Tiles (Clean, high-signal) */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-black/30 border border-white/5 rounded-lg font-mono text-xs">
                  {/* License Key */}
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">
                      License Key
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {algo.licenseKey}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, algo.licenseKey, "License Key")}
                        className="text-neutral-400 hover:text-white"
                        title="Copy key"
                      >
                        {copiedKey === algo.licenseKey ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bound MT5 */}
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">
                      Bound MT5
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      #{algo.mt5Account}
                    </span>
                  </div>

                  {/* Supported Pairs */}
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">
                      Pairs
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-300 truncate block">
                      {algo.pairs.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="text-[11px] font-mono text-neutral-400">
                    <span>Purchased: <strong className="text-neutral-300 font-bold">{algo.purchaseDate}</strong></span>
                    <span className="mx-1.5">·</span>
                    <span className="font-bold text-white">{algo.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadEA(algo.name)}
                      className="btn-fialgo-primary h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>Download .EX5</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/auto-trade/active-bots")}
                      className="h-7 px-2.5 rounded bg-black/30 hover:bg-white/[0.08] border border-white/10 text-[10px] font-mono font-bold text-blue-400 transition-none cursor-pointer flex items-center gap-1"
                    >
                      <span>View Bot</span>
                      <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODULE 2: EXECUTED TRADE ORDERS (Admin App Table Aesthetic)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeModule === "trades" && (
          <div className="space-y-3">
            {/* Top Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTradeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-none cursor-pointer ${
                    tradeFilter === "all"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-neutral-400 hover:text-white border border-transparent"
                  }`}
                >
                  All ({mockOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter("wins")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-none cursor-pointer ${
                    tradeFilter === "wins"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-neutral-400 hover:text-white border border-transparent"
                  }`}
                >
                  Winning ({winCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter("losses")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-none cursor-pointer ${
                    tradeFilter === "losses"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "text-neutral-400 hover:text-white border border-transparent"
                  }`}
                >
                  Losing ({mockOrders.length - winCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Algo Filter Dropdown */}
                <select
                  value={selectedAlgo}
                  onChange={(e) => setSelectedAlgo(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-black/30 border border-white/5 text-xs font-mono font-bold text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Algo: All Bots</option>
                  {mockPurchasedAlgos.map(algo => (
                    <option key={algo.name} value={algo.name}>
                      {algo.name}
                    </option>
                  ))}
                </select>

                {/* Pair Filter Dropdown */}
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-black/30 border border-white/5 text-xs font-mono font-bold text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Pair: All Assets</option>
                  <option value="EURUSD">EUR/USD</option>
                  <option value="XAUUSD">XAU/USD</option>
                  <option value="GBPUSD">GBP/USD</option>
                  <option value="USDJPY">USD/JPY</option>
                  <option value="US100">US100</option>
                </select>
              </div>
            </div>

            {/* Algo Execution Summary Strip: Shows Which Algo & How Many Trades It Took */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              {algoStats.map(stat => (
                <div 
                  key={stat.name}
                  onClick={() => setSelectedAlgo(selectedAlgo === stat.name ? "ALL" : stat.name)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-none flex items-center justify-between ${
                    selectedAlgo === stat.name 
                      ? "bg-blue-600/15 border-blue-500/40 text-white shadow-xs" 
                      : "bg-[#1E1E1E] border-white/5 text-neutral-400 hover:border-white/10"
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-bold block text-white truncate text-xs">{stat.name}</span>
                    <span className="text-[10px] text-neutral-500">{stat.tradesCount} trades taken</span>
                  </div>
                  <span className={`text-xs font-bold ${stat.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stat.pnl >= 0 ? "+" : ""}${stat.pnl.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 border-b border-white/5 bg-black/10">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    EXECUTED TRADE ORDERS ({filteredTrades.length})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-neutral-400">
                    Realtime MT5 execution telemetry &amp; slippage audit
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-black/20">
                      <th className="p-3.5">TICKET ID</th>
                      <th className="p-3.5">ASSET &amp; ORDER</th>
                      <th className="p-3.5">STRATEGY ENGINE</th>
                      <th className="p-3.5">EXECUTION PRICE</th>
                      <th className="p-3.5">TIMESTAMP</th>
                      <th className="p-3.5">REALIZED P&amp;L</th>
                      <th className="p-3.5 text-right">DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {filteredTrades.map((order) => {
                      const isExpanded = expandedId === order.id;
                      const isWin = order.status === "win";

                      return (
                        <Fragment key={order.id}>
                          <tr
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            className={`hover:bg-white/[0.02] transition-none cursor-pointer ${
                              isExpanded ? "bg-white/[0.03]" : ""
                            }`}
                          >
                            <td className="p-3.5 font-bold text-white">
                              #{order.id}
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white font-sans">
                                  {order.pair}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  order.type === "BUY"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                  {order.type} {order.lot}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 text-neutral-300">
                              <span className="inline-flex items-center gap-1.5">
                                <Bot size={13} className="text-blue-400" />
                                <span>{order.strategy}</span>
                              </span>
                            </td>

                            <td className="p-3.5 text-neutral-300">
                              <span>{order.openPrice}</span>
                              <span className="text-neutral-500 mx-1">→</span>
                              <span className="font-bold text-white">{order.closePrice}</span>
                            </td>

                            <td className="p-3.5 text-neutral-400 text-[11px]">
                              <div>{order.closeTime}</div>
                              <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Clock size={10} />
                                <span>{order.duration}</span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className={`font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                                {order.pnl >= 0 ? "+" : ""}${order.pnl.toFixed(2)}
                              </div>
                              <div className={`text-[10px] ${isWin ? "text-emerald-500" : "text-rose-500"}`}>
                                {order.returnPct}
                              </div>
                            </td>

                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                className="text-neutral-400 hover:text-white"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Telemetry Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-0 border-t-0">
                                <div className="bg-black/30 px-5 py-4 border-b border-white/5 space-y-3 font-mono text-xs">
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                                      <Sliders size={12} className="text-blue-400" />
                                      <span>MT5 Execution Telemetry (Ticket #{order.id})</span>
                                    </h4>
                                    <span className="text-[10px] text-neutral-500">
                                      Magic: {order.magic}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Stop Loss</span>
                                      <span className="font-bold text-white">{order.sl}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Take Profit</span>
                                      <span className="font-bold text-white">{order.tp}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Commission</span>
                                      <span className="font-bold text-white">${order.commission.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Swap Fee</span>
                                      <span className="font-bold text-white">${order.swap.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Execution Latency</span>
                                      <span className="font-bold text-emerald-400">1.8ms (VPS)</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Fill Quality</span>
                                      <span className="font-bold text-white">Zero Slippage</span>
                                    </div>
                                  </div>
                                </div>
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
              <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Terminal size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      MT5 Terminal &amp; Bot Execution Logs
                    </h3>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                      Live timeline of Bot activations, pauses, trades &amp; pings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>

              {/* Terminal Dark Console Box */}
              <div className="bg-black/40 rounded-lg border border-white/5 p-4 max-h-[380px] overflow-y-auto space-y-2 font-mono text-xs">
                {filteredTerminalLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-neutral-500 text-[10px] shrink-0 tabular-nums">
                      [{log.time}]
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                      log.type === 'status_on'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : log.type === 'status_off'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        : log.type === 'license'
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                    }`}>
                      {log.event}
                    </span>
                    <span className="text-neutral-300 text-xs min-w-0 flex-1 leading-snug">
                      {log.details}
                    </span>
                  </div>
                ))}
              </div>

              {/* Terminal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-neutral-400 border-t border-white/5 font-mono">
                <span className="text-[11px]">
                  VPS Gateway: 185.220.101.44 · Latency: 2.1ms
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTerminalLog}
                    className="h-8 px-3 rounded-lg bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-neutral-300 transition-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={12} />
                    <span>Download Log</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="btn-fialgo-primary h-8 px-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
    </DashboardLayout>
  );
}
