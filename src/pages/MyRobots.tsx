import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause, Power, ArrowRight, Signal, AlertTriangle, Settings, RefreshCw, Briefcase, Activity, TrendingUp, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { PushableButton } from "@/components/PushableButton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

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
}

export default function MyRobots() {
  const navigate = useNavigate();
  const { serverData, recentTrades, isConnected, isAlgoRunning, toggleAlgoStatus, loading } = useDashboardData();

  const [demoStatus, setDemoStatus] = useState<Record<string, BotStatus>>({
    'demo-scalper': 'running',
    'demo-swing': 'running',
    'demo-grid': 'running',
    'demo-hft': 'paused'
  });

  // Dynamically generate the user's active bots based on their actual Database State
  const bots: BotData[] = useMemo(() => {
    if (!isConnected) {
      return [
        {
          id: 'demo-scalper',
          name: 'TradiFive Scalper AI',
          pair: 'EUR/USD',
          profit: 12.4,
          trades: 142,
          status: demoStatus['demo-scalper'],
          subtitle: 'Simulated Execution',
          lastActive: 'Just now'
        },
        {
          id: 'demo-swing',
          name: 'TradiFive Swing Master',
          pair: 'XAU/USD',
          profit: 8.7,
          trades: 34,
          status: demoStatus['demo-swing'],
          subtitle: 'Simulated Execution',
          lastActive: '5m ago'
        },
        {
          id: 'demo-grid',
          name: 'TradiFive Grid Protocol',
          pair: 'GBP/JPY',
          profit: 18.5,
          trades: 84,
          status: demoStatus['demo-grid'],
          subtitle: 'Simulated Execution',
          lastActive: '1m ago'
        },
        {
          id: 'demo-hft',
          name: 'TradiFive HFT Core',
          pair: 'US100',
          profit: 24.2,
          trades: 412,
          status: demoStatus['demo-hft'],
          subtitle: 'Simulated Execution',
          lastActive: '12m ago'
        }
      ];
    }

    if (!serverData?.active_strategy) return [];

    const botName = serverData.active_strategy === "scalper" ? "TradiFive Scalper AI" : "TradiFive Swing Master";

    let status: BotStatus = "disconnected";
    let subtitle = "Waiting for MT5 connection";

    if (isConnected) {
      status = isAlgoRunning ? "running" : "paused";
      subtitle = isAlgoRunning ? "Connected to MT5" : "Paused via Kill-Switch";
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
      lastActive: isConnected ? "Live" : "Pending"
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
      return;
    }
    await toggleAlgoStatus();
  };

  const handleToggleBot = async (id: string) => {
    if (!isConnected) {
      setDemoStatus(prev => ({
        ...prev,
        [id]: prev[id] === 'running' ? 'paused' : 'running'
      }));
      return;
    }
    await toggleAlgoStatus();
  };

  const getStatusConfig = (status: BotStatus) => {
    switch (status) {
      case 'running': return { color: "bg-[#10B981]", text: "text-[#10B981]", bg: "bg-[#10B981]/10", label: "Active", icon: Signal };
      case 'paused': return { color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", label: "Paused", icon: Pause };
      case 'disconnected': return { color: "bg-red-500", text: "text-red-600", bg: "bg-red-50", label: "Not Connected", icon: Power };
      case 'error': return { color: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50", label: "Error", icon: AlertTriangle };
    }
  };

  const totalBots = bots.length;
  const activeBots = bots.filter(b => b.status === "running").length;
  const totalProfit = bots.reduce((sum, b) => sum + b.profit, 0);
  const isMasterRunning = isConnected ? isAlgoRunning : Object.values(demoStatus).some(s => s === 'running');

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto w-full">

        {/* HEADER */}
        <div className="flex items-start justify-between mt-2 mb-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Robots</h1>
              {isConnected ? (
                <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-blue-600/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  LIVE
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-amber-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  DEMO
                </span>
              )}
            </div>
            <p className="text-[15px] text-slate-400 font-normal mt-3">Manage your AI trading systems</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleGlobalState}
              className="bg-indigo-600/60 text-white font-bold px-6 py-2.5 rounded-xl border-b-4 border-indigo-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Play size={14} fill="currentColor" /> {isMasterRunning ? "PAUSE ALL" : "START ALL"}
            </button>
            <PushableButton variant="deep-3d" onClick={() => navigate("/strategy")} className="!bg-white uppercase tracking-widest text-xs font-bold px-6 py-2.5 rounded-xl">
              Browse Strategy Armory
            </PushableButton>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#1E1E1E] px-5 py-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-[#333333]/50 flex flex-col justify-between h-[120px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL BOTS</p>
            {loading ? (
              <Skeleton className="h-7 w-12 bg-slate-200 dark:bg-white/10 rounded mt-2" />
            ) : (
              <p className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{totalBots}</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-[#1E1E1E] px-5 py-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-[#333333]/50 flex flex-col justify-between h-[120px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTIVE BOTS</p>
            {loading ? (
              <Skeleton className="h-7 w-12 bg-slate-200 dark:bg-white/10 rounded mt-2" />
            ) : (
              <p className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{activeBots}</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#1E1E1E] px-5 py-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-[#333333]/50 flex flex-col justify-between h-[120px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL PROFIT</p>
            {loading ? (
              <Skeleton className="h-7 w-16 bg-slate-200 dark:bg-white/10 rounded mt-2" />
            ) : (
              <p className={`text-[26px] font-bold tracking-tight leading-none ${totalProfit >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
                {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(1)}%
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-[#1E1E1E] px-5 py-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-[#333333]/50 flex flex-col justify-between h-[120px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MASTER SWITCH</p>
            {loading ? (
              <Skeleton className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded mt-2" />
            ) : (
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isMasterRunning ? "bg-[#10B981]" : "bg-slate-300"}`}></span>
                <p className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">{isMasterRunning ? "Running" : "Paused"}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* BOTS GRID / SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 border border-border/80 shadow-sm flex flex-col animate-pulse h-[245px] justify-between"
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                    <Skeleton className="h-4.5 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>
                  <Skeleton className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-xl" />
                </div>

                {/* METRICS ROW */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-[#141414] dark:bg-white/5 border border-slate-100 dark:border-[#333333] dark:border-white/5 rounded-[20px] p-4 flex flex-col items-start justify-center gap-2">
                      <Skeleton className="h-3 w-12 bg-slate-200 dark:bg-white/10 rounded" />
                      <Skeleton className="h-4.5 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                    </div>
                  ))}
                </div>

                {/* BOTTOM ROW ACTIONS */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <Skeleton className="h-3.5 w-28 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10 rounded-xl" />
                    <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] border border-dashed border-slate-200 dark:border-[#333333] p-16 text-center shadow-sm max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 dark:bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-[#333333]">
              <Settings size={28} className="text-slate-400" />
            </div>
            <h2 className="text-[24px] font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No active bots</h2>
            <p className="text-slate-400 font-normal mb-8">Deploy your first AI bot to start automated trading</p>
            <button
              onClick={() => navigate("/strategy")}
              className="bg-white text-white font-bold px-10 py-3 rounded-xl border-b-4 border-blue-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all text-xs uppercase tracking-widest shadow-lg"
            >
              DEPLOY BOT
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bots.map((bot, i) => {
              const config = getStatusConfig(bot.status);
              const SIcon = config.icon;

              return (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* TOP ROW */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tactical Node</p>
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{bot.name}</h3>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.text} border-current/10 shadow-sm`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.color} ${bot.status === 'running' ? 'animate-pulse' : ''}`}></span>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{config.label}</span>
                    </div>
                  </div>

                  {/* METRICS ROW */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 dark:bg-[#141414] dark:bg-white/5 border border-slate-100 dark:border-[#333333] dark:border-white/5 rounded-[20px] p-4 flex flex-col items-start justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Parameters</p>
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{bot.pair}</h3>
                    </div>
                    <div className={`border rounded-[20px] p-4 flex flex-col items-start justify-center ${bot.profit >= 0 ? "bg-[#10B981]/5 border-[#10B981]/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" : "bg-rose-50 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/10"}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${bot.profit >= 0 ? "text-[#10B981]" : "text-rose-500"}`}>
                        Yield {bot.status === 'running' && <RefreshCw size={10} className="animate-spin" />}
                      </p>
                      <h3 className={`text-[16px] font-bold tracking-tight leading-none ${bot.profit >= 0 ? "text-[#10B981]" : "text-rose-500"}`}>
                        {bot.profit >= 0 ? "+" : ""}{bot.profit.toFixed(2)}%
                      </h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#141414] dark:bg-white/5 border border-slate-100 dark:border-[#333333] dark:border-white/5 rounded-[20px] p-4 flex flex-col items-start justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Execution</p>
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{bot.trades} TPS</h3>
                    </div>
                  </div>

                  {/* BOTTOM ROW ACTIONS */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <p className="text-[12px] text-slate-400 font-medium">Last activity: {bot.lastActive}</p>

                    <div className="flex items-center gap-3">
                      {bot.status === 'disconnected' || bot.status === 'error' ? (
                        <button className="text-[13px] font-bold text-slate-500 hover:text-foreground transition-colors">
                          Fix Connection
                        </button>
                      ) : (
                        <button className="text-[13px] font-bold text-slate-500 hover:text-foreground transition-colors flex items-center gap-1">
                          View Details <ArrowRight size={14} />
                        </button>
                      )}

                      {bot.status === 'running' ? (
                        <PushableButton variant="deep-3d" onClick={() => handleToggleBot(bot.id)}>
                          <Pause size={14} /> Pause
                        </PushableButton>
                      ) : (
                        <PushableButton
                          variant="deep-3d"
                          onClick={() => handleToggleBot(bot.id)}
                        >
                          <Play size={14} /> Start
                        </PushableButton>
                      )}
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






