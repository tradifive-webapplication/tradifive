import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { 
  Bot, Activity, TrendingUp, Play, Pause, Plus, 
  ExternalLink, Terminal, ArrowRight, ShieldCheck, CheckCircle2 
} from "lucide-react";

export default function MyRobots() {
  const navigate = useNavigate();
  const { serverData, isConnected, isAlgoRunning, toggleAlgoStatus } = useDashboardData();

  const [currentTime, setCurrentTime] = useState("");
  const [isAutoTradeSetup, setIsAutoTradeSetup] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("tradifive_auto_trade_setup") === "true";
  });

  useEffect(() => {
    const update = () => {
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
    update();
    const timer = setInterval(update, 1000);

    const handleSetupDone = () => {
      setIsAutoTradeSetup(localStorage.getItem("tradifive_auto_trade_setup") === "true");
    };
    window.addEventListener("tradifive_auto_trade_setup_done", handleSetupDone);

    return () => {
      clearInterval(timer);
      window.removeEventListener("tradifive_auto_trade_setup_done", handleSetupDone);
    };
  }, []);

  const isMasterRunning = Boolean(isAutoTradeSetup && isAlgoRunning);

  const toggleGlobalState = async () => {
    if (!isAutoTradeSetup) {
      toast.info("Please complete FiAlgo setup to activate automated trading.");
      navigate("/auto-trade/setup");
      return;
    }
    if (!isConnected) {
      toast.info("Please connect your MT5 account to control algorithmic bots.");
      return;
    }
    await toggleAlgoStatus();
    toast.success(isAlgoRunning ? "FiAlgo V1 execution paused" : "FiAlgo V1 execution resumed");
  };

  // The 1 official FiAlgo EA algorithm purchased and configured by the user
  const activeBot = useMemo(() => {
    if (!isAutoTradeSetup) return null;

    const unroundedProfit = isConnected && serverData?.equity && serverData?.balance
      ? serverData.equity - serverData.balance
      : 0;

    const pnlFormatted = unroundedProfit !== 0
      ? (unroundedProfit >= 0 ? "+₹" : "-₹") + Math.abs(Math.round(unroundedProfit)).toLocaleString("en-IN")
      : "+₹0.00";

    return {
      id: "fialgo-v1",
      name: "FiAlgo V1 EA",
      tag: "Institutional MT5",
      instrument: "XAUUSD, EURUSD",
      strategy: "Institutional Risk Guard + Dynamic Grid",
      lot: serverData?.lot_size ? String(serverData.lot_size) : "0.10",
      pnl: pnlFormatted,
      winRate: "78.4%",
      status: isAlgoRunning ? ("LIVE" as const) : ("PAUSED" as const),
      color: "bg-purple-600",
    };
  }, [isAutoTradeSetup, isConnected, isAlgoRunning, serverData]);

  const stats = [
    {
      label: "TOTAL ALGO FLEET",
      value: isAutoTradeSetup ? "1 ALGO" : "0 BOTS",
      color: "text-white",
    },
    {
      label: "ACTIVE BOTS",
      value: isMasterRunning ? "1 RUNNING" : "0 RUNNING",
      color: isMasterRunning ? "text-emerald-400" : "text-neutral-400",
    },
    {
      label: "WIN RATE %",
      value: isAutoTradeSetup ? "78.4%" : "--",
      color: "text-white",
    },
    {
      label: "MT5 BRIDGE",
      value: isConnected ? "CONNECTED (12MS)" : isAutoTradeSetup ? "READY" : "STANDBY",
      color: isConnected ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "FLEET STATUS",
      value: isMasterRunning ? "ARMED (SAFE)" : isAutoTradeSetup ? "PAUSED" : "NOT SETUP",
      color: isMasterRunning ? "text-emerald-400" : "text-amber-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1500px] mx-auto w-full font-sans select-none text-[#E5E5E5] px-4 sm:px-6 md:px-8 py-4">
        {/* ── Top Header Bar (Admin App Exact Style) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase font-sans">
              ACTIVE BOTS ENGINE
            </h1>
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
              REAL-TIME ALGORITHMIC FLEET &amp; TELEMETRY
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {currentTime && (
              <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-[#161618] border border-white/5 text-[11px] font-mono text-neutral-400">
                {currentTime}
              </div>
            )}

            {/* Master Toggle */}
            <button
              onClick={toggleGlobalState}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                isMasterRunning
                  ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {isMasterRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>{isMasterRunning ? "Pause Algo" : "Start Algo"}</span>
            </button>

            {/* Setup / Strategy Button */}
            {!isAutoTradeSetup ? (
              <button
                onClick={() => navigate("/auto-trade/setup")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider text-blue-300 transition-colors cursor-pointer"
              >
                <Plus size={12} />
                <span>Setup &amp; Activate</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/strategy-builder")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider text-purple-300 transition-colors cursor-pointer"
              >
                <Plus size={12} />
                <span>Strategy Builder</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Metric Boxes Row (Admin App 5-Box Grid) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4 hover:border-white/10 transition-colors"
            >
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
                {s.label}
              </p>
              <p className={`text-base sm:text-lg font-bold font-mono uppercase tracking-tight ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
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
              onClick={() => navigate("/auto-trade/dashboard")}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Terminal size={12} className="text-neutral-400" />
              <span>Open Bot Live Terminal</span>
              <ExternalLink size={11} className="text-neutral-500" />
            </button>
          </div>

          {/* Table View or Setup Empty State */}
          {activeBot ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/[0.01]">
                    <th className="py-3 px-4">Bot Name</th>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Strategy</th>
                    <th className="py-3 px-4">Lot Size</th>
                    <th className="py-3 px-4">24H P&amp;L</th>
                    <th className="py-3 px-4">Win Rate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${activeBot.color}`}
                        >
                          F1
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{activeBot.name}</span>
                            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono uppercase">
                              {activeBot.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-neutral-300">
                      {activeBot.instrument}
                    </td>
                    <td className="py-4 px-4 text-neutral-400">{activeBot.strategy}</td>
                    <td className="py-4 px-4 font-mono text-neutral-300">{activeBot.lot}</td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      {activeBot.pnl}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-300">{activeBot.winRate}</td>
                    <td className="py-4 px-4">
                      {activeBot.status === "LIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          PAUSED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={toggleGlobalState}
                        className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title={activeBot.status === "LIVE" ? "Pause Algo" : "Start Algo"}
                      >
                        {activeBot.status === "LIVE" ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3 text-neutral-400">
                <Bot size={22} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-1">
                No Active Algorithm Deployed
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-5 leading-relaxed">
                You haven&apos;t activated your FiAlgo V1 EA license yet. Complete the 4-step setup process to link MT5 and begin automated trading.
              </p>
              <button
                onClick={() => navigate("/auto-trade/setup")}
                className="btn-fialgo-primary h-9 px-5 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Setup &amp; Activate FiAlgo V1</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
