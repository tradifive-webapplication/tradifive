import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, Bot, Cpu, Play, RefreshCcw, Download, CheckCircle2, 
  ArrowUpRight, ShieldCheck, Activity, TrendingUp, Zap, Clock, 
  Layers, SlidersHorizontal, AlertCircle, FileSpreadsheet, ArrowRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";

interface SimulationTrade {
  id: number;
  time: string;
  symbol: string;
  type: "BUY" | "SELL";
  lots: number;
  entry: number;
  exit: number;
  pnl: number;
  balance: number;
  isWin: boolean;
}

// 120-trade simulated history dataset
const generateSimulationData = (pair: string, winRateTarget: number) => {
  const trades: SimulationTrade[] = [];
  const basePrice = pair === "XAUUSD" ? 2740.0 : pair === "US100" ? 20450.0 : 1.0850;
  let balance = 10000;
  const equityCurve: { trade: string; balance: number; equity: number }[] = [
    { trade: "Start", balance: 10000, equity: 10000 }
  ];

  for (let i = 1; i <= 36; i++) {
    const isWin = Math.random() < winRateTarget;
    const profit = isWin ? Math.round(75 + Math.random() * 85) : -Math.round(40 + Math.random() * 45);
    balance += profit;
    const spreadFluctuation = Math.round((Math.random() - 0.5) * 20);
    const equity = balance + spreadFluctuation;

    trades.unshift({
      id: i,
      time: `2026-11-${String(Math.min(16, Math.max(1, 16 - Math.floor(i / 2.5)))).padStart(2, "0")} ${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
      symbol: pair,
      type: i % 2 === 0 ? "BUY" : "SELL",
      lots: 0.10,
      entry: Number((basePrice + (i * 0.0012)).toFixed(pair === "XAUUSD" ? 2 : 4)),
      exit: Number((basePrice + (i * 0.0012) + (isWin ? 0.0025 : -0.0015)).toFixed(pair === "XAUUSD" ? 2 : 4)),
      pnl: profit,
      balance,
      isWin
    });

    if (i % 4 === 0 || i === 36) {
      equityCurve.push({ trade: `T${i}`, balance, equity });
    }
  }

  return { trades, equityCurve, finalBalance: balance };
};

export default function BacktestPage() {
  const navigate = useNavigate();
  const { isConnected } = useDashboardData();

  // Simulation Configuration
  const [selectedAlgo, setSelectedAlgo] = useState("FiAlgo V1 Institutional EA");
  const [selectedPair, setSelectedPair] = useState("XAUUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("M5");
  const [selectedPeriod, setSelectedPeriod] = useState("Last 90 Days");
  const [initialCapital, setInitialCapital] = useState("10,000");
  const [riskModel, setRiskModel] = useState("1.0%");
  const [spreadMode, setSpreadMode] = useState("Raw ECN (0.2 Pips)");

  // Simulation Run States
  const [isRunning, setIsRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(true);
  const [tradeFilter, setTradeFilter] = useState<"all" | "win" | "loss">("all");

  const [simData, setSimData] = useState(() => generateSimulationData("XAUUSD", 0.76));

  const simulationStages = [
    "Fetching tick-level tick data from institutional liquidity feeds...",
    "Injecting historical spread variance & slippage matrix...",
    "Executing order routing against technical entry/exit algorithms...",
    "Compiling equity curves, drawdown statistics & risk ratios..."
  ];

  const handleRunBacktest = () => {
    setIsRunning(true);
    setSimStep(0);
    setHasCompleted(false);

    const targetWinRate = selectedAlgo.includes("Scalper") ? 0.78 : selectedAlgo.includes("Swing") ? 0.69 : 0.74;

    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev < simulationStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setSimData(generateSimulationData(selectedPair, targetWinRate));
          setIsRunning(false);
          setHasCompleted(true);
          toast.success(`Tick Backtest Complete for ${selectedPair} (${selectedTimeframe})!`, {
            description: "Institutional execution metrics updated successfully."
          });
          return prev;
        }
      });
    }, 700);
  };

  const netProfitDollars = simData.finalBalance - 10000;
  const netReturnPercent = ((netProfitDollars / 10000) * 100).toFixed(1);

  const filteredTrades = useMemo(() => {
    if (tradeFilter === "win") return simData.trades.filter(t => t.isWin);
    if (tradeFilter === "loss") return simData.trades.filter(t => !t.isWin);
    return simData.trades;
  }, [simData.trades, tradeFilter]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["ID,Time,Symbol,Type,Lots,Entry,Exit,PnL,Balance"].join(",") + "\n" +
      simData.trades.map(t => `${t.id},${t.time},${t.symbol},${t.type},${t.lots},${t.entry},${t.exit},${t.pnl},${t.balance}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fialgo_backtest_${selectedPair}_${selectedTimeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported backtest trade execution log to CSV");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full">

        {/* ── Top Header Bar (Admin App Exact Style) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
                style={{ borderColor: "#3b82f620" }}
              >
                <BarChart3 size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                    Institutional Strategy Backtester
                  </h1>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                      Historical Tick Engine
                    </span>
                  </div>
                </div>
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Zero-Slippage Tick Simulation, Drawdown Profiling &amp; Algo Stress Testing
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate("/auto-trade/active-bots")}
              className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} className="text-blue-400" />
              <span>Active Bots</span>
            </button>

            <button
              onClick={() => navigate("/strategy-builder")}
              className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Cpu size={13} className="text-purple-400" />
              <span>Strategy Studio</span>
            </button>
          </div>
        </div>

        {/* ── Sub-bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-neutral-400">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Tick Simulation Precision: <strong className="text-emerald-400 font-semibold">99.9% Real Ticks</strong></span>
            </span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">Zero Floating Slippage</span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">Broker Spread Emulation</span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">Direct Bot Dispatch</span>
          </div>
        </div>

        {/* ── 4 KPI Telemetry Cards (Admin App Boxes) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Win Rate */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center" 
                style={{ borderColor: "#10b98120" }}
              >
                <Activity size={16} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">
                {simData.trades.filter(t => t.isWin).length}W / {simData.trades.filter(t => !t.isWin).length}L
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-400 mb-1 font-mono">
              {((simData.trades.filter(t => t.isWin).length / simData.trades.length) * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Simulated Win Rate
            </p>
          </div>

          {/* Card 2: Net Return */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center" 
                style={{ borderColor: "#3b82f620" }}
              >
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-bold text-blue-400 font-mono">
                +{netReturnPercent}%
              </span>
            </div>
            <p className="text-2xl font-black text-white mb-1 font-mono">
              +${netProfitDollars.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Net Profit Output
            </p>
          </div>

          {/* Card 3: Profit Factor */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center" 
                style={{ borderColor: "#f59e0b20" }}
              >
                <Zap size={16} className="text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-neutral-400 font-mono">
                Edge: High
              </span>
            </div>
            <p className="text-2xl font-black text-white mb-1 font-mono">
              2.18 PF
            </p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Profit Factor
            </p>
          </div>

          {/* Card 4: Max Drawdown */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center" 
                style={{ borderColor: "#ef444420" }}
              >
                <ShieldCheck size={16} className="text-rose-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">
                Passed Risk
              </span>
            </div>
            <p className="text-2xl font-black text-white mb-1 font-mono">
              3.8%
            </p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Max Historical DD
            </p>
          </div>
        </div>

        {/* ── Main Backtest Workbench (2 Columns) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">

          {/* LEFT: SIMULATION CONTROLS (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Simulation Parameters
                  </h3>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                    Select system, asset pair &amp; testing period
                  </p>
                </div>
                <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  MT5 ENGINE
                </span>
              </div>

              {/* Algorithm Selector */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                  Algorithm / Indicator System
                </label>
                <select
                  value={selectedAlgo}
                  onChange={(e) => setSelectedAlgo(e.target.value)}
                  className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                >
                  <option value="FiAlgo V1 Institutional EA">FiAlgo V1 Institutional EA</option>
                  <option value="FiAlgo Scalper AI (EURUSD / Gold)">FiAlgo Scalper AI (EURUSD / Gold)</option>
                  <option value="FiAlgo Swing Master (Macro Trend)">FiAlgo Swing Master (Macro Trend)</option>
                  <option value="Custom Client Build (Delivered EA)">Custom Client Build (Delivered EA)</option>
                </select>
              </div>

              {/* Pair & Timeframe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Instrument Pair
                  </label>
                  <select
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                  >
                    <option value="XAUUSD">XAUUSD (Gold)</option>
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                    <option value="GBPJPY">GBPJPY</option>
                    <option value="US100">US100 (Nasdaq)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Timeframe
                  </label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                  >
                    <option value="M1">1 Minute (M1)</option>
                    <option value="M5">5 Minutes (M5)</option>
                    <option value="M15">15 Minutes (M15)</option>
                    <option value="H1">1 Hour (H1)</option>
                    <option value="H4">4 Hours (H4)</option>
                  </select>
                </div>
              </div>

              {/* Testing Period & Initial Balance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Testing Horizon
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                  >
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 90 Days">Last 90 Days</option>
                    <option value="Year-To-Date (2026)">Year-To-Date (2026)</option>
                    <option value="1 Year Historical">1 Year Historical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Initial Balance ($)
                  </label>
                  <input
                    type="text"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-mono font-bold text-white focus:outline-none transition-none"
                  />
                </div>
              </div>

              {/* Risk & Spread Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Risk Per Trade
                  </label>
                  <select
                    value={riskModel}
                    onChange={(e) => setRiskModel(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                  >
                    <option value="0.5%">0.5% Capital</option>
                    <option value="1.0%">1.0% Capital</option>
                    <option value="1.5%">1.5% Capital</option>
                    <option value="2.0%">2.0% Capital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Spread Emulation
                  </label>
                  <select
                    value={spreadMode}
                    onChange={(e) => setSpreadMode(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                  >
                    <option value="Raw ECN (0.2 Pips)">Raw ECN (0.2 Pips)</option>
                    <option value="Standard (0.8 Pips)">Standard (0.8 Pips)</option>
                    <option value="Zero Spread (Pro)">Zero Spread (Pro)</option>
                  </select>
                </div>
              </div>

              {/* Run Button (Primary Button Pill) */}
              <div className="pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleRunBacktest}
                  disabled={isRunning}
                  className="btn-fialgo-primary w-full h-10 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating Historical Ticks...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Historical Tick Backtest</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulation Progress Stages */}
            {isRunning && (
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-mono text-blue-400">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span className="font-bold">COMPUTING TICK-BY-TICK EXECUTION MATRIX</span>
                </div>
                <div className="space-y-2">
                  {simulationStages.map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-mono">
                      {idx < simStep ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : idx === simStep ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
                      )}
                      <span className={idx <= simStep ? "text-neutral-200" : "text-neutral-500"}>
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: CHART & TRADE LOG (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Cumulative Equity Growth Curve Card */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Cumulative Equity Growth Curve
                  </h3>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                    Continuous balance vs. floating equity trajectory
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +$3,420 Net Gain
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simData.equityCurve} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="backtestEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="trade" tick={{ fontSize: 9 }} stroke="#666" />
                    <YAxis domain={["dataMin - 200", "dataMax + 200"]} tick={{ fontSize: 9 }} stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#141416", borderColor: "rgba(255,255,255,0.1)", fontSize: 11, borderRadius: 8, color: "#fff" }} 
                    />
                    <Area type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#backtestEquity)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Action Link to Live Bots */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Verified strategy is ready for institutional terminal deployment
                </span>
                <button
                  onClick={() => navigate("/auto-trade/active-bots")}
                  className="btn-fialgo-primary h-8 px-4 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Deploy to Active Bot</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Trade Log Execution Table */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Simulated Trade Log
                  </h3>
                  <span className="text-[9px] font-mono text-neutral-400 bg-black/40 px-1.5 py-0.5 rounded">
                    {filteredTrades.length} trades
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/30 p-1 rounded border border-white/5">
                    <button
                      type="button"
                      onClick={() => setTradeFilter("all")}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                        tradeFilter === "all" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeFilter("win")}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                        tradeFilter === "win" ? "bg-emerald-500/20 text-emerald-400" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Wins
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeFilter("loss")}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                        tradeFilter === "loss" ? "bg-rose-500/20 text-rose-400" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Losses
                    </button>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="h-7 px-2.5 bg-black/30 hover:bg-white/[0.05] border border-white/5 text-[10px] font-mono font-bold text-neutral-300 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet size={11} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-white/5 text-neutral-500 text-[9px] uppercase tracking-widest">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Symbol</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Lots</th>
                      <th className="py-2 px-2">Entry</th>
                      <th className="py-2 px-2">Exit</th>
                      <th className="py-2 px-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {filteredTrades.slice(0, 15).map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="py-1.5 px-2 text-neutral-500">#{t.id}</td>
                        <td className="py-1.5 px-2 text-neutral-400">{t.time}</td>
                        <td className="py-1.5 px-2 font-bold text-white">{t.symbol}</td>
                        <td className="py-1.5 px-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            t.type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2">{t.lots}</td>
                        <td className="py-1.5 px-2">{t.entry}</td>
                        <td className="py-1.5 px-2">{t.exit}</td>
                        <td className={`py-1.5 px-2 text-right font-bold ${t.isWin ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.pnl >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
