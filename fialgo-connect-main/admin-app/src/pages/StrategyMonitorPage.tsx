import { useState, useEffect } from "react";
import { Workflow, Zap, Code, ShieldCheck, Search, Activity, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StrategyMonitorPage() {
  const [strats, setStrats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select(`*, profiles:creator_id (full_name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setStrats(data || []);
    } catch (err) {
      console.error("Error fetching strategies:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Strategy Hub</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Algorithmic Execution Monitor
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: "Active Bots", val: strats.filter(s => s.status === 'running').length.toString() },
          { label: "User Built EAs", val: strats.length.toString() },
          { label: "Avg System WinRate", val: strats.length ? (strats.reduce((acc, s) => acc + (s.win_rate || 0), 0) / strats.length).toFixed(1) + "%" : "0%" },
          { label: "Server Load", val: "24%", alert: false }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-3.5 sm:p-5 rounded-xl">
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1 truncate">{m.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${m.alert ? 'text-rose-500' : 'text-white'}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-[350px]">
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-white/[0.02]">
           <div className="relative w-full sm:w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search strategies..." 
                className="bg-[#121212] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white w-full focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
             <div className="h-48 flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : strats.length === 0 ? (
             <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">
                No trading strategies deployed.
             </div>
          ) : (
            <>
              {/* Mobile touch cards */}
              <div className="md:hidden divide-y divide-white/5">
                {strats.map((strat) => (
                  <div key={strat.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${strat.type === 'EA Builder' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {strat.type === 'EA Builder' ? <Code size={14} /> : <Workflow size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-white truncate">{strat.name}</p>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{strat.type}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shrink-0 border ${
                        strat.status === 'running' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}>
                        {strat.status === 'running' && <Activity size={9} className="animate-pulse" />}
                        <span>{strat.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5 text-neutral-400">
                      <span>By @{strat.profiles?.full_name || 'Anonymous'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">{strat.win_rate || 0}% WR</span>
                        <span className="font-mono text-neutral-500">{strat.active_users || 0} users</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Strategy</th>
                      <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Creator</th>
                      <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Performance</th>
                      <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strats.map((strat) => (
                      <tr key={strat.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${strat.type === 'EA Builder' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              {strat.type === 'EA Builder' ? <Code size={14} /> : <Workflow size={14} />}
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-white">{strat.name}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{strat.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[11px] text-neutral-300">@{strat.profiles?.full_name || 'Anonymous'}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                             <div>
                                <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Win Rate</p>
                                <p className="text-[12px] font-bold text-emerald-500">{strat.win_rate || 0}%</p>
                             </div>
                             <div>
                                <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Active Users</p>
                                <p className="text-[12px] font-bold text-white">{strat.active_users || 0}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
                            strat.status === 'running' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                          }`}>
                            {strat.status === 'running' && <Activity size={10} className="animate-pulse" />}
                            <span className="text-[9px] font-bold uppercase tracking-widest">{strat.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
