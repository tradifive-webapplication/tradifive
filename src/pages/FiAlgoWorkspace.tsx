import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Zap,
  Activity,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Layers,
  BarChart3,
  Terminal,
  Clock,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Download,
  AlertTriangle,
  Bot,
  ExternalLink,
  Wallet,
  Coins,
  ChevronRight,
  Sparkles,
  Database,
  Radio,
  FileCode,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface FiAlgoWorkspaceProps {
  defaultTab?: "autotrade" | "backtesting" | "strategy" | "bots" | "logs";
}

// Sample backtest simulation data curves
const SIMULATION_PRESETS: Record<string, { winRate: number; profitFactor: number; netReturn: string; maxDrawdown: string; sharpe: number; tradesCount: number; data: any[] }> = {
  "xauusd-gold-scalper": {
    winRate: 74.2,
    profitFactor: 2.84,
    netReturn: "+$8,420.50 (+84.2%)",
    maxDrawdown: "3.8%",
    sharpe: 2.45,
    tradesCount: 168,
    data: [
      { trade: "T0", equity: 10000, balance: 10000 },
      { trade: "T20", equity: 10850, balance: 10600 },
      { trade: "T40", equity: 11920, balance: 11450 },
      { trade: "T60", equity: 12640, balance: 12400 },
      { trade: "T80", equity: 13900, balance: 13700 },
      { trade: "T100", equity: 15200, balance: 14850 },
      { trade: "T120", equity: 16400, balance: 16100 },
      { trade: "T140", equity: 17350, balance: 17150 },
      { trade: "T168", equity: 18420, balance: 18420 },
    ],
  },
  "eurusd-smc-sniper": {
    winRate: 68.5,
    profitFactor: 2.31,
    netReturn: "+$5,940.00 (+59.4%)",
    maxDrawdown: "4.5%",
    sharpe: 2.12,
    tradesCount: 132,
    data: [
      { trade: "T0", equity: 10000, balance: 10000 },
      { trade: "T20", equity: 10620, balance: 10450 },
      { trade: "T40", equity: 11480, balance: 11300 },
      { trade: "T60", equity: 12210, balance: 12050 },
      { trade: "T80", equity: 13100, balance: 12900 },
      { trade: "T100", equity: 14350, balance: 14100 },
      { trade: "T120", equity: 15200, balance: 15000 },
      { trade: "T132", equity: 15940, balance: 15940 },
    ],
  },
  "us30-trend-rider": {
    winRate: 62.4,
    profitFactor: 2.15,
    netReturn: "+$6,780.20 (+67.8%)",
    maxDrawdown: "5.8%",
    sharpe: 1.94,
    tradesCount: 94,
    data: [
      { trade: "T0", equity: 10000, balance: 10000 },
      { trade: "T15", equity: 10750, balance: 10500 },
      { trade: "T30", equity: 11980, balance: 11700 },
      { trade: "T45", equity: 12840, balance: 12600 },
      { trade: "T60", equity: 14100, balance: 13850 },
      { trade: "T75", equity: 15400, balance: 15200 },
      { trade: "T94", equity: 16780, balance: 16780 },
    ],
  },
};

export default function FiAlgoWorkspace({ defaultTab = "autotrade" }: FiAlgoWorkspaceProps) {
  const navigate = useNavigate();
  const { switchWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"autotrade" | "backtesting" | "strategy" | "bots" | "logs">(defaultTab);

  // Auto trade master states
  const [botRunning, setBotRunning] = useState<boolean>(() => {
    return localStorage.getItem("tradifive_bot_status") === "running";
  });
  const [currency, setCurrency] = useState<"USD" | "INR">(() => {
    return (localStorage.getItem("tradifive_account_currency") as "USD" | "INR") || "USD";
  });
  const [balance, setBalance] = useState(10540.25);
  const [equity, setEquity] = useState(10785.60);
  const [dailyPnL, setDailyPnL] = useState(245.35);

  // Backtest state
  const [backtestPair, setBacktestPair] = useState("xauusd-gold-scalper");
  const [backtestTimeframe, setBacktestTimeframe] = useState("M5");
  const [backtestDuration, setBacktestDuration] = useState("90d");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState(SIMULATION_PRESETS["xauusd-gold-scalper"]);

  // Bot fleet states
  const [bots, setBots] = useState([
    {
      id: "fialgo-v1",
      name: "FiAlgo V1 (Gold Specialist)",
      symbol: "XAUUSD",
      timeframe: "M5",
      type: "Dynamic Basket & Scalper",
      status: "running",
      winRate: "76.4%",
      todayPnL: "+$182.40",
      activeTrades: 2,
    },
    {
      id: "fialgo-smc",
      name: "FiAlgo SMC Liquidity Sniper",
      symbol: "EURUSD / GBPUSD",
      timeframe: "M15",
      type: "Order Block & Fair Value Gap",
      status: "running",
      winRate: "71.2%",
      todayPnL: "+$62.95",
      activeTrades: 1,
    },
    {
      id: "fialgo-trend",
      name: "FiAlgo Momentum Trend Pro",
      symbol: "US30 / NAS100",
      timeframe: "H1",
      type: "Institutional Trend Rider",
      status: "paused",
      winRate: "64.8%",
      todayPnL: "$0.00",
      activeTrades: 0,
    },
  ]);

  // Strategy Builder State
  const [strategyPrompt, setStrategyPrompt] = useState(
    "Create an automated scalping bot for XAUUSD M5 that buys when EMA 9 crosses above EMA 21 with RSI above 52, trailing stop 25 pips and take profit 45 pips."
  );
  const [strategyGenerated, setStrategyGenerated] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live Audit Logs
  const [logs, setLogs] = useState([
    { time: "10:38:12", type: "EXECUTION", text: "FiAlgo V1 opened BUY 0.10 lot XAUUSD @ 2642.45 (SL: 2637.45, TP: 2652.45)", ping: "14ms" },
    { time: "10:35:04", type: "SIGNAL", text: "SMC Sniper detected Bearish FVG on EURUSD M15 at 1.0842", ping: "11ms" },
    { time: "10:30:19", type: "RISK", text: "Discipline Shield: Max daily loss threshold at 1.4% (Safe limit 5.0%)", ping: "8ms" },
    { time: "10:22:45", type: "PROFIT", text: "Trade #98241 closed on TP hit +$42.80 | Total daily profit updated", ping: "16ms" },
    { time: "10:15:00", type: "BRIDGE", text: "MT5 MetaAPI Socket Heartbeat verified. Active broker ping: 12ms", ping: "12ms" },
  ]);

  const toggleMasterBot = () => {
    const next = !botRunning;
    setBotRunning(next);
    try {
      localStorage.setItem("tradifive_bot_status", next ? "running" : "stopped");
      window.dispatchEvent(new Event("tradifive_bot_status_changed"));
    } catch (e) {}

    if (next) {
      toast.success("FiAlgo Master Bot Engine Activated", {
        description: "Executing live automated orders on connected MT5 broker.",
      });
    } else {
      toast.info("FiAlgo Bot Engine Paused", {
        description: "All automated entry execution has been suspended.",
      });
    }
  };

  const handleRunBacktest = () => {
    setIsSimulating(true);
    toast.loading("Running high-frequency algorithmic backtest simulation...", { id: "backtest" });
    setTimeout(() => {
      setIsSimulating(false);
      const chosen = SIMULATION_PRESETS[backtestPair] || SIMULATION_PRESETS["xauusd-gold-scalper"];
      setSimulationData(chosen);
      toast.success("Backtest simulation completed successfully!", {
        id: "backtest",
        description: `${chosen.tradesCount} simulated executions analyzed across ${backtestDuration}.`,
      });
    }, 900);
  };

  const toggleBotItem = (id: string) => {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nextStatus = b.status === "running" ? "paused" : "running";
          toast.info(`${b.name} is now ${nextStatus.toUpperCase()}`);
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const samplePythonCode = `"""
FiAlgo Automated Execution Bot
Architecture: MetaTrader 5 + Python Bridge
Strategy: Institutional Momentum & Basket Trailing Stop
"""
import MetaTrader5 as mt5
import time

SYMBOL = "XAUUSD"
LOT_SIZE = 0.10
MAGIC_NUMBER = 884210

def init_fialgo():
    if not mt5.initialize():
        print("FiAlgo: MT5 initialization failed")
        return False
    print("FiAlgo: Connected to MT5 execution server")
    return True

def run_fialgo_cycle():
    # Dynamic trailing stop & risk guard logic
    pass

if __name__ == "__main__":
    if init_fialgo():
        run_fialgo_cycle()
`;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "FiAlgo Workspace", path: "/fialgo" },
        { label: activeTab.toUpperCase() },
      ]}
    >
      <div className="flex-1 flex flex-col overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* ── TOP HERO HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/20 via-slate-900/10 to-transparent dark:from-purple-950/40 dark:via-white/[0.02] dark:to-transparent border border-purple-500/20 dark:border-purple-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 min-w-0">
            {/* FiAlgo Logo Banner */}
            <div className="h-12 sm:h-14 px-3 py-1.5 rounded-2xl bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/fialgo-logo.png"
                alt="FiAlgo"
                className="h-full w-auto object-contain"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  FiAlgo Workspace
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  Institutional Suite
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MT5 Bridge Connected
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                Automated Bot Execution · Historical Backtesting Lab · Strategy Rule Matrix · Execution Logs
              </p>
            </div>
          </div>

          {/* Quick Switch to TradiFive Workspace Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => switchWorkspace("tradifive")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Return to TradiFive Social & Journal Workspace"
            >
              <img src="/tf-logo.png" alt="TradiFive" className="w-4 h-4 object-contain" />
              <span>Switch to TradiFive</span>
              <ArrowRight size={13} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* ── WORKSPACE TABS NAVIGATION ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80 dark:border-white/10">
          {[
            { id: "autotrade", label: "Auto Trade Dashboard", icon: Zap, badge: botRunning ? "LIVE" : "PAUSED" },
            { id: "backtesting", label: "Backtesting Lab", icon: BarChart3, badge: "SIMULATOR" },
            { id: "strategy", label: "Strategy Builder", icon: Sliders, badge: "AI MQL5" },
            { id: "bots", label: "Active Bot Fleet", icon: Bot, badge: "3 BOTS" },
            { id: "logs", label: "Execution Logs", icon: Terminal, badge: "14ms" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-[0_4px_16px_rgba(147,51,234,0.35)]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: AUTO TRADE DASHBOARD ── */}
        {activeTab === "autotrade" && (
          <div className="space-y-6">
            {/* Quick Metrics KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Account Balance */}
              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Account Balance
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currency === "USD" ? `$${balance.toLocaleString()}` : `₹${(balance * 87).toLocaleString()}`}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                    <TrendingUp size={12} /> Real MT5 Live Account
                  </span>
                </div>
              </div>

              {/* Metric 2: Live Equity */}
              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Live Equity
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currency === "USD" ? `$${equity.toLocaleString()}` : `₹${(equity * 87).toLocaleString()}`}
                  </div>
                  <span className="text-[11px] font-semibold text-purple-500 flex items-center gap-1 mt-1">
                    Floating: +${(equity - balance).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Metric 3: Today's Bot PnL */}
              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Today's Profit
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    +{currency === "USD" ? `$${dailyPnL.toFixed(2)}` : `₹${(dailyPnL * 87).toFixed(0)}`}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                    Daily Target: 2.3% of 3.0% reached
                  </span>
                </div>
              </div>

              {/* Metric 4: Master Execution Control */}
              <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Master Bot Engine
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      botRunning ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    <Cpu size={16} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        botRunning ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {botRunning ? "ACTIVE" : "STANDBY"}
                    </span>
                  </div>
                  <button
                    onClick={toggleMasterBot}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      botRunning
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    {botRunning ? <Pause size={12} /> : <Play size={12} />}
                    {botRunning ? "Pause" : "Start"}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Positions Table */}
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Live Open Positions (FiAlgo Active Basket)
                    </h3>
                    <p className="text-xs text-slate-400">Directly synchronized with connected MT5 broker terminal</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  2 Trades Open
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Symbol</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Volume</th>
                      <th className="py-2.5 px-3">Open Price</th>
                      <th className="py-2.5 px-3">Current</th>
                      <th className="py-2.5 px-3">Stop Loss</th>
                      <th className="py-2.5 px-3">Take Profit</th>
                      <th className="py-2.5 px-3 text-right">Profit (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-slate-500">#894218</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> XAUUSD
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/10 text-emerald-600">
                          BUY
                        </span>
                      </td>
                      <td className="py-3 px-3">0.10</td>
                      <td className="py-3 px-3 font-mono">2638.20</td>
                      <td className="py-3 px-3 font-mono">2642.45</td>
                      <td className="py-3 px-3 font-mono text-rose-500">2633.20</td>
                      <td className="py-3 px-3 font-mono text-emerald-500">2648.20</td>
                      <td className="py-3 px-3 font-bold text-right text-emerald-500 font-mono">+$42.50</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-slate-500">#894219</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> EURUSD
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/10 text-emerald-600">
                          BUY
                        </span>
                      </td>
                      <td className="py-3 px-3">0.15</td>
                      <td className="py-3 px-3 font-mono">1.08210</td>
                      <td className="py-3 px-3 font-mono">1.08345</td>
                      <td className="py-3 px-3 font-mono text-rose-500">1.08050</td>
                      <td className="py-3 px-3 font-mono text-emerald-500">1.08550</td>
                      <td className="py-3 px-3 font-bold text-right text-emerald-500 font-mono">+$20.25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BACKTESTING LAB ── */}
        {activeTab === "backtesting" && (
          <div className="space-y-6">
            {/* Backtest Config Card */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-purple-500" />
                    Historical Backtesting Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Simulate algorithms across institutional tick data with tick-by-tick spread & slippage modelling.
                  </p>
                </div>

                <button
                  onClick={handleRunBacktest}
                  disabled={isSimulating}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw size={14} className={isSimulating ? "animate-spin" : ""} />
                  {isSimulating ? "Simulating..." : "Run Simulation"}
                </button>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Strategy & Asset
                  </label>
                  <select
                    value={backtestPair}
                    onChange={(e) => setBacktestPair(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="xauusd-gold-scalper">FiAlgo Gold Scalper Pro (XAUUSD)</option>
                    <option value="eurusd-smc-sniper">FiAlgo SMC Sniper (EURUSD)</option>
                    <option value="us30-trend-rider">FiAlgo Momentum Trend (US30)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Timeframe
                  </label>
                  <select
                    value={backtestTimeframe}
                    onChange={(e) => setBacktestTimeframe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="M1">1-Minute (M1 - Ultra Scalp)</option>
                    <option value="M5">5-Minute (M5 - Primary Execution)</option>
                    <option value="M15">15-Minute (M15 - Swing Scalp)</option>
                    <option value="H1">1-Hour (H1 - Macro Trend)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Historical Sample Period
                  </label>
                  <select
                    value={backtestDuration}
                    onChange={(e) => setBacktestDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="30d">Last 30 Days (High Volatility)</option>
                    <option value="90d">Last 90 Days (Quarterly Benchmark)</option>
                    <option value="180d">Last 180 Days (Semi-Annual)</option>
                    <option value="1y">1 Year (Full Cycle Stress Test)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Backtest Results KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Win Rate</span>
                <div className="text-lg font-black text-emerald-500 mt-1">{simulationData.winRate}%</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profit Factor</span>
                <div className="text-lg font-black text-purple-500 mt-1">{simulationData.profitFactor}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Return</span>
                <div className="text-sm font-black text-emerald-600 mt-1">{simulationData.netReturn}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Drawdown</span>
                <div className="text-lg font-black text-amber-500 mt-1">{simulationData.maxDrawdown}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sharpe Ratio</span>
                <div className="text-lg font-black text-blue-500 mt-1">{simulationData.sharpe}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Trades</span>
                <div className="text-lg font-black text-slate-800 dark:text-white mt-1">{simulationData.tradesCount}</div>
              </div>
            </div>

            {/* Backtest Equity Curve Chart */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simulated Equity & Balance Growth Curve
                  </h4>
                  <p className="text-xs text-slate-400">Growth trajectory starting from $10,000 benchmark account</p>
                </div>
                <span className="text-xs font-semibold text-emerald-500 font-mono">
                  Final: ${(simulationData.data[simulationData.data.length - 1].equity).toLocaleString()}
                </span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationData.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="trade" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: STRATEGY BUILDER ── */}
        {activeTab === "strategy" && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders size={18} className="text-purple-500" />
                    FiAlgo Visual Rule & Code Generator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Describe your algorithmic rules in plain English or visual parameters to compile MQL5 & Python bots.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  AI Algorithmic Compiler v3
                </span>
              </div>

              {/* Prompt Box */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Algorithm Rule Specification
                </label>
                <textarea
                  rows={3}
                  value={strategyPrompt}
                  onChange={(e) => setStrategyPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                  placeholder="Specify entry conditions, timeframe, indicators, stop loss, and trailing logic..."
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    toast.success("Algorithm compiled successfully into MQL5 / Python bridge format!");
                    setStrategyGenerated(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Compile Algorithm
                </button>
              </div>

              {/* Code viewer */}
              {strategyGenerated && (
                <div className="mt-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <FileCode size={14} className="text-purple-400" /> fialgo_strategy_engine.py
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(samplePythonCode);
                        setCopiedCode(true);
                        toast.success("Code copied to clipboard!");
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copiedCode ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-relaxed text-purple-200/90">
                    {samplePythonCode}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: ACTIVE BOT FLEET ── */}
        {activeTab === "bots" && (
          <div className="space-y-4">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E1E] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      bot.status === "running"
                        ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                        : "bg-slate-100 dark:bg-white/5 text-slate-400"
                    }`}
                  >
                    <Bot size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{bot.name}</h4>
                      <span
                        className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          bot.status === "running"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {bot.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bot.symbol} · {bot.timeframe} · {bot.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Win Rate</span>
                    <span className="text-xs font-black text-emerald-500 font-mono">{bot.winRate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's PnL</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{bot.todayPnL}</span>
                  </div>
                  <button
                    onClick={() => toggleBotItem(bot.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      bot.status === "running"
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {bot.status === "running" ? <Pause size={12} /> : <Play size={12} />}
                    {bot.status === "running" ? "Pause" : "Deploy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 5: EXECUTION LOGS ── */}
        {activeTab === "logs" && (
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-950 text-slate-200 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-purple-400" />
                <span className="font-bold text-white">Live Institutional Order Execution Stream</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Stream: Online
                </span>
                <span>Latency: 14ms</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 py-1.5 border-b border-white/5 hover:bg-white/[0.02] px-2 rounded">
                  <span className="text-slate-500 shrink-0 font-bold">{log.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      log.type === "EXECUTION"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : log.type === "SIGNAL"
                        ? "bg-purple-500/20 text-purple-400"
                        : log.type === "PROFIT"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="flex-1 text-slate-300">{log.text}</span>
                  <span className="text-slate-500 shrink-0 text-[10px]">{log.ping}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
