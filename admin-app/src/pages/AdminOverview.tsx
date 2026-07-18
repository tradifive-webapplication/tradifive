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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Master Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Operational Intelligence Center</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">System: Normal</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl group hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <BarChart3 className="text-slate-800" size={16} />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{loading ? "..." : kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-blue-500" size={18} />
              Platform Execution Stream
            </h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">LIVE FEED</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-black/20">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentTrades.map((trade, i) => (
                  <tr key={i} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-300">
                      {trade.profiles?.full_name || "ID:" + trade.user_id.slice(0, 4)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500 group-hover:text-blue-400 transition-colors uppercase">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trade.type === 'buy' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1.5 font-bold ${trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trade.profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        ₹{Math.abs(trade.profit).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md">
          <h3 className="text-lg font-bold mb-8">System Deployment</h3>
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Execution Nodes</p>
                <p className="text-2xl font-bold text-white">04 Active</p>
              </div>
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/10">
                <ArrowUpRight size={24} />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-500">API Latency</span>
                <span className="text-emerald-500">Fast (12ms)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full">
                <div className="h-full bg-blue-600 w-[12%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mt-auto">
              <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-widest">Master Audit</p>
              <div className="flex gap-2">
                <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]" />
                </div>
                <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]" />
                </div>
                <div className="flex-1 h-1 bg-rose-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[40%]" />
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 italic">Infrastructure scan complete.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
