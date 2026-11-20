import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  Layers,
  Play,
  Pause,
  TrendingUp,
  PieChart,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FiAlgoAdminDashboardProps {
  onOpenFullTerminal?: () => void;
}

export default function FiAlgoAdminDashboard({ onOpenFullTerminal }: FiAlgoAdminDashboardProps) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const statsRow1 = [
    { label: "ENGINE STATUS", value: "OPERATIONAL", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "CONNECTED BROKERS", value: "3 MT5 TERMINALS", color: "text-slate-900 dark:text-white" },
    { label: "AGGREGATE NET P&L", value: "+₹3,42,850", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "ALGO FLEET", value: "4 ACTIVE BOTS", color: "text-blue-600 dark:text-blue-400" },
    { label: "BRIDGE LATENCY", value: "1.4 MS", color: "text-emerald-600 dark:text-emerald-400" },
  ];

  const statsRow2 = [
    { label: "WIN RATE (7D)", value: "81.4%", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "TOTAL ORDERS TODAY", value: "38 EXECUTED", color: "text-slate-900 dark:text-white" },
    { label: "MAX DRAWDOWN", value: "2.1% (TOL 5%)", color: "text-slate-700 dark:text-slate-300" },
    { label: "ACTIVE FLOATING P&L", value: "+₹14,200", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "KILL-SWITCH RISK GUARD", value: "ARMED & READY", color: "text-emerald-600 dark:text-emerald-400" },
  ];

  const [strategies] = useState([
    {
      id: "bot-1",
      name: "FiAlgo V1 Gold Grid",
      instrument: "XAUUSD (Gold)",
      strategy: "Dynamic Grid Reversion",
      lot: "0.02 - 0.08",
      pnl: "+₹1,24,500",
      winRate: "86.2%",
      status: "LIVE",
      color: "bg-amber-500",
    },
    {
      id: "bot-2",
      name: "Euro Momentum Trend",
      instrument: "EURUSD",
      strategy: "EMA Breakout Follow",
      lot: "0.05",
      pnl: "+₹88,200",
      winRate: "79.1%",
      status: "LIVE",
      color: "bg-blue-500",
    },
    {
      id: "bot-3",
      name: "US30 Open Gap Scalper",
      instrument: "US30",
      strategy: "NY Open Liquidity",
      lot: "0.01",
      pnl: "+₹95,400",
      winRate: "84.5%",
      status: "LIVE",
      color: "bg-purple-500",
    },
    {
      id: "bot-4",
      name: "BTC Arbitrage Hunter",
      instrument: "BTCUSD",
      strategy: "Micro Spread Arbitrage",
      lot: "0.01",
      pnl: "+₹34,750",
      winRate: "75.0%",
      status: "LIVE",
      color: "bg-amber-500",
    },
  ]);

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto w-full font-sans select-none text-slate-800 dark:text-slate-200">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-white/[0.07]">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
            FIALGO ENGINE DASHBOARD
          </h1>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
            Real-Time Algorithmic Execution & MT5 Pulse
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentTime && (
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] shadow-xs text-[11px] font-mono text-slate-500 dark:text-neutral-400">
              {currentTime}
            </div>
          )}

          <button
            onClick={() => {
              if (onOpenFullTerminal) {
                onOpenFullTerminal();
              } else {
                navigate("/auto-trade/dashboard");
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Open Full Terminal</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* ── Metric Boxes Row 1 (Dashboard Card Box Styling) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {statsRow1.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none p-3.5 sm:p-4 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
          >
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p className={`text-base sm:text-lg font-bold uppercase tracking-tight ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Metric Boxes Row 2 (Dashboard Card Box Styling) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {statsRow2.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none p-3.5 sm:p-4 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
          >
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p className={`text-base sm:text-lg font-bold uppercase tracking-tight ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts & Visualizations Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: 7-Day Cumulative Algo Profit Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                7-Day Cumulative Algo Profit Trend
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              +₹48,250 Total
            </span>
          </div>

          {/* SVG Line & Area Chart */}
          <div className="h-48 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="3 3" />

              {/* Area */}
              <polygon
                points="0,160 70,148 150,135 230,110 310,85 400,45 500,20 500,180 0,180"
                fill="url(#profitGrad)"
              />
              {/* Curve Line */}
              <polyline
                points="0,160 70,148 150,135 230,110 310,85 400,45 500,20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              <circle cx="500" cy="20" r="4" fill="#10b981" className="animate-pulse" />
            </svg>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Right: Capital & Bot Allocation */}
        <div className="bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <PieChart size={15} className="text-purple-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Capital & Bot Allocation
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
            {/* Donut representation */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="107 238" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="60 238" strokeDashoffset="-107" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#a855f7" strokeWidth="12" strokeDasharray="47 238" strokeDashoffset="-167" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="24 238" strokeDashoffset="-214" />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white block">4 Bots</span>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest">Active</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 w-full text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px]">Gold Grid</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">45%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[11px]">Euro Trend</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">25%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-[11px]">US30 Breakout</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">20%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px]">BTC Arb</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Strategy Execution Fleet ── */}
      <div className="bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              ACTIVE STRATEGY EXECUTION FLEET
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live automated algorithmic agents executing on MT5
            </p>
          </div>

          <button
            onClick={() => navigate("/strategy-builder")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-purple-200/60 dark:border-purple-500/30 text-[11px] font-bold text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
          >
            <Plus size={12} />
            <span>Deploy New Strategy</span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="py-3 px-4">Bot Name</th>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Lot Size</th>
                <th className="py-3 px-4">24H P&L</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
              {strategies.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${b.color}`}>
                        {b.name.charAt(0)}
                      </div>
                      <span>{b.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-neutral-300">{b.instrument}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-neutral-400">{b.strategy}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-neutral-300">{b.lot}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{b.pnl}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-neutral-300">{b.winRate}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate("/auto-trade/active-bots")}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                      title="Manage Bot"
                    >
                      <Pause size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
