import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Bot,
  Activity,
  Plus,
  Play,
  Pause,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  PieChart
} from "lucide-react";

interface FiAlgoAdminDashboardProps {
  onOpenFullTerminal?: () => void;
}

export default function FiAlgoAdminDashboard({ onOpenFullTerminal }: FiAlgoAdminDashboardProps) {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const statsRow1 = [
    { label: "TOTAL ALGO PROFIT", value: "+₹48,250", color: "text-emerald-400" },
    { label: "ACTIVE BOTS", value: "4 Running", color: "text-white" },
    { label: "WIN RATE %", value: "78.4%", color: "text-white" },
    { label: "MT5 BRIDGE", value: "Connected (12ms)", color: "text-emerald-400" },
    { label: "TODAY'S TRADES", value: "18 Executed", color: "text-white" },
  ];

  const statsRow2 = [
    { label: "DAILY DRAWDOWN", value: "-0.65% / 5%", color: "text-amber-400" },
    { label: "MARGIN USED", value: "14.2%", color: "text-white" },
    { label: "ACTIVE PAIRS", value: "XAUUSD, EURUSD", color: "text-purple-300" },
    { label: "RISK GUARD", value: "Armed (Safe)", color: "text-emerald-400" },
    { label: "EA LICENSE", value: "Verified Pro", color: "text-emerald-400" },
  ];

  const [strategies, setStrategies] = useState([
    {
      id: 1,
      name: "Gold Scalper Pro (V1)",
      instrument: "XAUUSD",
      strategy: "Dynamic Grid",
      lot: "0.35",
      pnl: "+₹18,450",
      winRate: "82.4%",
      status: "LIVE",
      color: "bg-purple-500",
    },
    {
      id: 2,
      name: "Euro Momentum Titan",
      instrument: "EURUSD",
      strategy: "Trend Follower",
      lot: "0.20",
      pnl: "+₹12,800",
      winRate: "79.1%",
      status: "LIVE",
      color: "bg-blue-500",
    },
    {
      id: 3,
      name: "US30 Wall Street Breakout",
      instrument: "US30",
      strategy: "Session Breakout",
      lot: "0.15",
      pnl: "+₹9,450",
      winRate: "74.8%",
      status: "LIVE",
      color: "bg-emerald-500",
    },
    {
      id: 4,
      name: "BTC Intraday Arbitrage",
      instrument: "BTCUSD",
      strategy: "Range Mean Revert",
      lot: "0.10",
      pnl: "+₹7,550",
      winRate: "71.2%",
      status: "LIVE",
      color: "bg-amber-500",
    },
  ]);

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto w-full font-sans select-none text-[#E5E5E5]">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase font-sans">
            FIALGO ENGINE DASHBOARD
          </h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            REAL-TIME ALGORITHMIC EXECUTION & MT5 PULSE
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentTime && (
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-[#161618] border border-white/5 text-[11px] font-mono text-neutral-400">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <span>Open Full Terminal</span>
            <ExternalLink size={12} className="text-neutral-400" />
          </button>
        </div>
      </div>

      {/* ── Metric Boxes Row 1 (Admin App Box Styling) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {statsRow1.map((s) => (
          <div
            key={s.label}
            className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4 hover:border-white/10 transition-colors"
          >
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className={`text-base sm:text-lg font-bold uppercase tracking-tight ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Metric Boxes Row 2 (Admin App Box Styling) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {statsRow2.map((s) => (
          <div
            key={s.label}
            className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4 hover:border-white/10 transition-colors"
          >
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
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
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Day Cumulative Algo Profit Trend
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              +₹48,250 Total
            </span>
          </div>

          {/* SVG Line & Area Chart */}
          <div className="h-48 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

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
            <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-2 pt-2 border-t border-white/5">
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
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <PieChart size={15} className="text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
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
                <span className="text-sm font-bold text-white block">4 Bots</span>
                <span className="text-[8px] text-neutral-500 uppercase tracking-widest">Active</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 w-full text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px]">Gold Grid</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white">45%</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[11px]">Euro Trend</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white">25%</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-[11px]">US30 Breakout</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white">20%</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px]">BTC Arb</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Strategy Execution Fleet (Admin App Box Table) ── */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              ACTIVE STRATEGY EXECUTION FLEET
            </h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Live automated algorithmic agents executing on MT5
            </p>
          </div>

          <button
            onClick={() => navigate("/strategy-builder")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider text-purple-300 transition-colors cursor-pointer"
          >
            <Plus size={12} />
            <span>Deploy New Strategy</span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/[0.01]">
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
            <tbody className="divide-y divide-white/5 font-sans">
              {strategies.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${b.color}`}>
                        {b.name.charAt(0)}
                      </div>
                      <span>{b.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-300">{b.instrument}</td>
                  <td className="py-3 px-4 text-neutral-400">{b.strategy}</td>
                  <td className="py-3 px-4 font-mono text-neutral-300">{b.lot}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{b.pnl}</td>
                  <td className="py-3 px-4 font-mono text-neutral-300">{b.winRate}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate("/auto-trade/active-bots")}
                      className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
