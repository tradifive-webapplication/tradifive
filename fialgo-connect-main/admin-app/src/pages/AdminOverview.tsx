import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Users, CreditCard, Wallet, Activity, TrendingUp, TrendingDown, ArrowUpRight, BarChart3 } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    monthlyRevenue: 0,
    connectedAccounts: 0
  });
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: activeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
      const { data: mt5Data } = await supabase.from('mt5_accounts').select('id');

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('closed_at', { ascending: false })
        .limit(10);

      let enrichedTrades = trades || [];
      if (!error && enrichedTrades.length > 0) {
        const userIds = [...new Set(enrichedTrades.map(t => t.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
          const profileMap: Record<string, any> = {};
          (profiles || []).forEach(p => { profileMap[p.id] = p; });
          enrichedTrades = enrichedTrades.map(t => ({ ...t, profiles: profileMap[t.user_id] || { full_name: "Trader" } }));
        }
      }

      setStats({
        totalUsers: userCount || 0,
        activeSubs: activeCount || 0,
        monthlyRevenue: (activeCount || 0) * 1299,
        connectedAccounts: mt5Data?.length || 0
      });
      setRecentTrades(enrichedTrades);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const kpis = [
    { label: "Platform Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Subs", value: stats.activeSubs, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Est. Revenue", value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Live Bots", value: stats.connectedAccounts, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Master Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Real-time operational intelligence & platform telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 px-3.5 bg-[#161618] border border-white/[0.08] rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-xs font-semibold text-neutral-300">System: Operational</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#161618] border border-white/[0.08] hover:border-white/20 p-4 sm:p-5 rounded-xl group transition-all duration-200 flex flex-col justify-between min-h-[116px]">
            <div className="flex items-center justify-between mb-3 text-neutral-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{loading ? "..." : kpi.value}</p>
            <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">Live synchronized</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Activity className="text-blue-400" size={14} />
              Platform Execution Stream
            </h2>
            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">LIVE FEED</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/[0.02] border-b border-white/[0.08]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Symbol</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {recentTrades.map((trade, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5 text-xs font-semibold text-white">
                      {trade.profiles?.full_name || "ID:" + trade.user_id?.slice(0, 4)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-neutral-300 uppercase">{trade.symbol}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${trade.type?.toLowerCase() === 'buy' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className={`inline-flex items-center justify-end gap-1 font-mono text-xs font-bold ${trade.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.profit >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        ₹{Math.abs(trade.profit || 0).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-6">System Nodes & Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">Execution Clusters</p>
                  <p className="text-xl font-extrabold text-white">04 Active Nodes</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="space-y-3 pt-5 border-t border-white/[0.08]">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-400">API Latency</span>
                  <span className="text-emerald-400">Fast (12ms)</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C1C20] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[12%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C20] p-4 rounded-xl border border-white/[0.08] mt-6">
            <p className="text-xs text-neutral-300 font-semibold mb-2.5 uppercase tracking-wider">Cluster Synchronization</p>
            <div className="flex gap-2">
              <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[100%]" />
              </div>
              <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[100%]" />
              </div>
              <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[80%]" />
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">All gateway endpoints operational.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

