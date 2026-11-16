import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Activity,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Zap,
  BarChart3,
  Clock,
  ExternalLink,
  Play,
  Pause,
  Sliders,
  DollarSign,
  Cpu,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FiAlgoAdminDashboardProps {
  onOpenFullTerminal?: () => void;
}

export default function FiAlgoAdminDashboard({ onOpenFullTerminal }: FiAlgoAdminDashboardProps) {
  const navigate = useNavigate();
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [botStates, setBotStates] = useState([
    { id: 1, name: "Gold Scalper Pro (V1)", pair: "XAUUSD", strategy: "Dynamic Grid", pnl: "+₹18,450", winRate: "82.4%", status: "running", lot: "0.05" },
    { id: 2, name: "Euro Momentum Titan", pair: "EURUSD", strategy: "Trend Rider", pnl: "+₹12,800", winRate: "76.1%", status: "running", lot: "0.10" },
    { id: 3, name: "US30 Wall Street Breakout", pair: "US30", strategy: "Volatility Breakout", pnl: "+₹14,200", winRate: "74.8%", status: "running", lot: "0.02" },
    { id: 4, name: "BTC Intraday Arbitrage", pair: "BTCUSD", strategy: "Mean Reversion", pnl: "+₹2,800", winRate: "71.0%", status: "running", lot: "0.01" },
  ]);

  const toggleBot = (id: number) => {
    setBotStates(prev =>
      prev.map(b => (b.id === id ? { ...b, status: b.status === "running" ? "paused" : "running" } : b))
    );
  };

  const performanceData = [
    { name: "Mon", Profit: 4200 },
    { name: "Tue", Profit: 8900 },
    { name: "Wed", Profit: 15400 },
    { name: "Thu", Profit: 24100 },
    { name: "Fri", Profit: 34500 },
    { name: "Sat", Profit: 41200 },
    { name: "Sun", Profit: 48250 },
  ];

  const allocationData = [
    { name: "Gold Grid", value: 45, color: "#10b981" },
    { name: "Euro Trend", value: 25, color: "#8b5cf6" },
    { name: "US30 Breakout", value: 20, color: "#3b82f6" },
    { name: "BTC Arb", value: 10, color: "#f59e0b" },
  ];

  const recentOrders = [
    { id: "#894102", bot: "Gold Scalper", symbol: "XAUUSD", side: "BUY", lot: "0.05", open: "2648.20", close: "2654.80", profit: "+₹3,300", time: "2 mins ago" },
    { id: "#894101", bot: "Euro Momentum", symbol: "EURUSD", side: "SELL", lot: "0.10", open: "1.0845", close: "1.0820", profit: "+₹2,050", time: "14 mins ago" },
    { id: "#894098", bot: "US30 Breakout", symbol: "US30", side: "BUY", lot: "0.02", open: "43820", close: "43980", profit: "+₹4,200", time: "42 mins ago" },
    { id: "#894095", bot: "Gold Scalper", symbol: "XAUUSD", side: "BUY", lot: "0.05", open: "2645.10", close: "2649.50", profit: "+₹2,200", time: "1 hour ago" },
  ];

  const kpis = [
    { label: "Total Algo Profit", value: "+₹48,250", icon: TrendingUp, color: "text-emerald-600" },
    { label: "Active Bots", value: "4 Running", icon: Bot, color: "text-purple-600" },
    { label: "Win Rate %", value: "78.4%", icon: Activity, color: "text-blue-600" },
    { label: "MT5 Bridge", value: "Connected (12ms)", icon: Zap, color: "text-emerald-600" },
    { label: "Today's Trades", value: "18 Executed", icon: BarChart3, color: "text-slate-800" },
    { label: "Daily Drawdown", value: "-0.65% / 5%", icon: ShieldAlert, color: "text-amber-600" },
    { label: "Margin Used", value: "14.2%", icon: Layers, color: "text-slate-800" },
    { label: "Active Pairs", value: "XAUUSD, EURUSD", icon: Cpu, color: "text-purple-600" },
    { label: "Risk Guard", value: "Armed (Safe)", icon: ShieldCheck, color: "text-emerald-600" },
    { label: "EA License", value: "Verified Pro", icon: DollarSign, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto w-full font-sans select-none">
      {/* ── Top Header (Modeled directly after admin-app/src/pages/Dashboard.tsx) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-slate-900 uppercase">
            FiAlgo Engine Dashboard
          </h1>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Real-Time Algorithmic Execution & MT5 Pulse
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg shadow-xs">
            <span className="text-[11px] font-mono text-slate-600">{systemTime.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => {
              if (onOpenFullTerminal) onOpenFullTerminal();
              else navigate("/auto-trade/dashboard");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span>Open Full Terminal</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* ── 10 KPI Metrics Grid (Modeled on admin-app KPI grid) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl hover:border-purple-300 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <kpi.icon size={15} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-[8.5px] sm:text-[9px] font-bold uppercase tracking-widest mb-1 truncate">
              {kpi.label}
            </p>
            <p className={`text-base sm:text-xl font-bold ${kpi.color} tracking-tight truncate`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts Grid (7-Day Performance Trend + Strategy Allocation) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> 7-Day Cumulative Algo Profit Trend
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +₹48,250 Total
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Profit"]}
                />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Allocation Split */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Layers size={14} className="text-purple-600" /> Capital & Bot Allocation
            </h3>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-bold text-slate-900">4 Bots</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Allocated</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-600">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Bots Control Table (Matching Admin App style) ── */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Active Strategy Execution Fleet
            </h3>
            <p className="text-[11px] text-slate-500">Live automated algorithmic agents executing on MT5</p>
          </div>
          <button
            onClick={() => navigate("/strategy-builder")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-all"
          >
            <Zap size={13} />
            <span>+ Deploy New Strategy</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                <th className="py-2.5 px-3">Bot Name</th>
                <th className="py-2.5 px-3">Instrument</th>
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3">Lot Size</th>
                <th className="py-2.5 px-3">24h P&L</th>
                <th className="py-2.5 px-3">Win Rate</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {botStates.map((bot) => (
                <tr key={bot.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {bot.name.charAt(0)}
                    </div>
                    {bot.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {bot.pair}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{bot.strategy}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{bot.lot}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{bot.pnl}</td>
                  <td className="py-3 px-3 font-mono text-slate-700 font-semibold">{bot.winRate}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        bot.status === "running"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          bot.status === "running" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      {bot.status === "running" ? "Live" : "Paused"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleBot(bot.id)}
                      className={`p-1.5 rounded-lg border transition-all text-xs font-semibold cursor-pointer ${
                        bot.status === "running"
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                      title={bot.status === "running" ? "Pause Bot" : "Resume Bot"}
                    >
                      {bot.status === "running" ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Execution Log Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Recent Algorithmic Executions
            </h3>
            <p className="text-[11px] text-slate-500">Live order fills and profit settlements from MT5 terminal</p>
          </div>
          <button
            onClick={() => navigate("/auto-trade/history")}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>View Full History</span>
            <ExternalLink size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Strategy Bot</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3">Lots</th>
                <th className="py-2.5 px-3">Open</th>
                <th className="py-2.5 px-3">Close</th>
                <th className="py-2.5 px-3">Profit</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{order.id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{order.bot}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{order.symbol}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.side === "BUY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {order.side}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{order.lot}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{order.open}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{order.close}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">{order.profit}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-right">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
