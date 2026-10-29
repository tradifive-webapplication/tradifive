import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, Power, ArrowRight, ArrowUpRight, Signal, 
  AlertTriangle, Settings, RefreshCw, Activity, 
  TrendingUp, Zap, Bot, Layers, Clock, ShieldCheck, Terminal,
  Plus, Filter, CheckCircle2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type BotStatus = "running" | "paused" | "disconnected" | "error";

interface BotData {
  id: string;
  name: string;
  pair: string;
  profit: number;
  trades: number;
  status: BotStatus;
  subtitle: string;
  lastActive: string;
  strategyType: string;
}

const kpiBoxStyle = "h-[120px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none";

const botCardStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none transition-all flex flex-col justify-between";

export default function MyRobots() {
  const navigate = useNavigate();
  const { serverData, recentTrades, isConnected, isAlgoRunning, toggleAlgoStatus, loading } = useDashboardData();

  const [filterTab, setFilterTab] = useState<"all" | "active" | "paused">("all");

  // Dynamically generate the user's active bots based on their actual Database State
  const bots: BotData[] = useMemo(() => {
    if (!isConnected) {
      return [];
    }

    if (!serverData?.active_strategy) return [];

    const botName = serverData.active_strategy === "scalper" ? "TradiFive Scalper AI" : "TradiFive Swing Master";

    let status: BotStatus = "disconnected";
    let subtitle = "Waiting for MT5 telemetry link";

    if (isConnected) {
      status = isAlgoRunning ? "running" : "paused";
      subtitle = isAlgoRunning ? "Synchronized with live MT5 EA Terminal" : "Trading paused via kill-switch";
    }

    const unroundedProfit = isConnected ? serverData.equity - serverData.balance : 0;
    const profitPercent = isConnected && serverData.balance > 0 ? (unroundedProfit / serverData.balance) * 100 : 0;

    return [{
      id: serverData.active_strategy,
      name: botName,
      pair: "Global Account Flow",
      profit: profitPercent,
      trades: recentTrades.length,
      status,
      subtitle,
      lastActive: isConnected ? "Live" : "Pending",
      strategyType: "Active MT5 Link"
    }];
  }, [serverData, recentTrades, isConnected, isAlgoRunning, demoStatus]);

  const toggleGlobalState = async () => {
    if (!isConnected) {
      const anyRunning = Object.values(demoStatus).some(s => s === 'running');
      const newStatus = anyRunning ? 'paused' : 'running';
      setDemoStatus(prev => {
        const next = { ...prev };
        for (const key in next) next[key] = newStatus;
        return next;
      });
      toast.success(anyRunning ? "All algorithmic bots paused" : "All algorithmic bots activated");
      return;
    }
    await toggleAlgoStatus();
    toast.success(isAlgoRunning ? "MT5 Algorithm execution paused" : "MT5 Algorithm execution resumed");
  };

  const handleToggleBot = async (id: string, name: string) => {
    if (!isConnected) {
      const isRunning = demoStatus[id] === 'running';
      setDemoStatus(prev => ({
        ...prev,
        [id]: isRunning ? 'paused' : 'running'
      }));
      toast.info(isRunning ? `${name} paused` : `${name} activated`);
      return;
    }
    await toggleAlgoStatus();
  };

  const totalBots = bots.length;
  const activeBots = bots.filter(b => b.status === "running").length;
  const pausedBots = bots.filter(b => b.status === "paused").length;
  const totalProfit = bots.reduce((sum, b) => sum + b.profit, 0);
  const isMasterRunning = isConnected ? isAlgoRunning : Object.values(demoStatus).some(s => s === 'running');

  // Filter bots
  const filteredBots = bots.filter(b => {
    if (filterTab === "active") return b.status === "running";
    if (filterTab === "paused") return b.status === "paused";
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6 md:px-8">
        
        {/* ── TOP HEADER (Consistent with Journal & RiskGuard) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 
                className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Robots
              </h1>
              {isConnected ? (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live MT5 Link
                </span>
              ) : (
                <span className="bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-slate-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Standby
                </span>
              )}
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-2">
              Manage your AI trading systems and automated algorithmic execution nodes
            </p>
          </div>

          {/* Action Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Master Toggle */}
            <button
              type="button"
              onClick={toggleGlobalState}
              className={`h-[38px] px-4 rounded-[14px] border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isMasterRunning
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
              }`}
            >
              {isMasterRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause All</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start All</span>
                </>
              )}
            </button>

            {/* Armory Navigation Button */}
            <button
              type="button"
              onClick={() => navigate("/strategy")}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 dark:shadow-none text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Browse Strategy Armory</span>
            </button>
          </div>
        </div>

        {/* ── 4 CONSISTENT KPI BOXES (Exact Journal & RiskGuard Pattern) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Total Bots */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Total Bots
              </p>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <Skeleton className="h-7 w-12 rounded" />
              ) : (
                <h3 
                  className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {totalBots}
                </h3>
              )}
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Installed
              </span>
            </div>
          </div>

          {/* 2. Active Bots */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Active Bots
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <Skeleton className="h-7 w-16 rounded" />
              ) : (
                <div className="flex items-baseline gap-1.5 leading-none">
                  <h3 
                    className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {activeBots}
                  </h3>
                  <span className="text-[12px] font-medium text-slate-400">
                    / {totalBots} online
                  </span>
                </div>
              )}
              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
          </div>

          {/* 3. Total Profit */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Total Profit
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <Skeleton className="h-7 w-20 rounded" />
              ) : (
                <h3 
                  className={`text-[26px] font-medium tracking-tight leading-none ${totalProfit >= 0 ? "text-[#10B981]" : "text-rose-500"}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(1)}%
                </h3>
              )}
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Aggregated
              </span>
            </div>
          </div>

          {/* 4. Master Switch */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Master Switch
              </p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isMasterRunning 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}>
                <Power className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <Skeleton className="h-7 w-24 rounded" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isMasterRunning ? "bg-[#10B981] animate-pulse" : "bg-amber-500"}`} />
                  <h3 
                    className="text-[24px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {isMasterRunning ? "Running" : "Paused"}
                  </h3>
                </div>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isMasterRunning 
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20" 
                  : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
              }`}>
                {isMasterRunning ? "ONLINE" : "STANDBY"}
              </span>
            </div>
          </div>
        </div>

        {/* ── FILTER & CONTROL TABS ── */}
        <div className="flex items-center justify-between pt-2">
          <div className="bg-slate-100 dark:bg-[#191B1E] p-1 rounded-xl flex items-center gap-1 border border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "all"
                  ? "bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Nodes ({totalBots})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "active"
                  ? "bg-white dark:bg-[#282828] text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Active ({activeBots})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("paused")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "paused"
                  ? "bg-white dark:bg-[#282828] text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Paused ({pausedBots})
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/auto-trade/dashboard")}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Open Bot Live Terminal</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* ── BOTS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`${botCardStyle} h-[270px] animate-pulse flex flex-col justify-between`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-5 w-48 rounded" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBots.length === 0 ? (
          <div className="rounded-[22px] border-2 border-dashed border-slate-200 dark:border-white/10 p-12 text-center max-w-xl mx-auto my-8 bg-white dark:bg-[#1E1E1E]">
            <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
              No bots match this filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-normal">
              Switch your tab view or deploy a new algorithm from the Strategy Armory
            </p>
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredBots.map((bot, idx) => {
              const isRunning = bot.status === "running";

              return (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={botCardStyle}
                >
                  {/* CARD HEADER */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                            Tactical Node
                          </span>
                          <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {bot.strategyType}
                          </span>
                        </div>
                        <h3 
                          className="text-[16px] sm:text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {bot.name}
                        </h3>
                      </div>

                      {/* Status Pill */}
                      {isRunning ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 uppercase tracking-wider shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20 uppercase tracking-wider shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Paused
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-normal line-clamp-1 mb-4 mt-0.5">
                      {bot.subtitle}
                    </p>
                  </div>

                  {/* ── 3 CONSISTENT INNER TILES (Parameters, Yield, Execution) ── */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-2">
                    {/* Tile 1: Parameters */}
                    <div className="bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[16px] p-3 sm:p-3.5 flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                        Parameters
                      </span>
                      <span 
                        className="text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {bot.pair}
                      </span>
                    </div>

                    {/* Tile 2: Yield */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/[0.04] border border-emerald-200/60 dark:border-emerald-500/20 rounded-[16px] p-3 sm:p-3.5 flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                        Yield
                        {isRunning && (
                          <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-500" />
                        )}
                      </span>
                      <span 
                        className="text-[14px] sm:text-[15px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {bot.profit >= 0 ? "+" : ""}{bot.profit.toFixed(2)}%
                      </span>
                    </div>

                    {/* Tile 3: Execution */}
                    <div className="bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[16px] p-3 sm:p-3.5 flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                        Execution
                      </span>
                      <span 
                        className="text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {bot.trades} TPS
                      </span>
                    </div>
                  </div>

                  {/* ── CARD FOOTER ── */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last activity: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{bot.lastActive}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate("/auto-trade/dashboard")}
                        className="h-8 px-2.5 sm:px-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBot(bot.id, bot.name)}
                        className={`h-8 px-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                          isRunning
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <Pause className="w-3 h-3 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
