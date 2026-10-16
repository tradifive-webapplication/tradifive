import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, CreditCard, Wallet, Activity, TrendingUp, TrendingDown, ArrowUpRight, ShieldAlert, Settings, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    monthlyRevenue: 0,
    connectedAccounts: 0
  });
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [maintMode, setMaintMode] = useState<any>({
    active: false,
    mode: 'Full',
    severity: 'Critical',
    title: 'SYSTEM MAINTENANCE',
    message: 'We are upgrading the core trading engines. Platform access is temporarily restricted.',
    endTime: new Date(Date.now() + 3600000).toISOString(),
    whitelist: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Fetch stats
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: activeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
      const { count: accountCount } = await supabase.from('mt5_accounts').select('*', { count: 'exact', head: true });
      
      // Recent trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*, profiles(full_name)')
        .order('closed_at', { ascending: false })
        .limit(10);

      // Fetch maintenance mode
      const { data: maintData } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 'maintenance_mode')
        .maybeSingle();

      if (maintData?.value) {
        setMaintMode(maintData.value);
      }

      setStats({
        totalUsers: userCount || 0,
        activeSubs: activeCount || 0,
        monthlyRevenue: (activeCount || 0) * 999,
        connectedAccounts: accountCount || 0
      });
      setRecentTrades(trades || []);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const handleMaintToggle = async (checked: boolean) => {
    const updated = { ...maintMode, active: checked };
    setMaintMode(updated);
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 'maintenance_mode', value: updated });
    
    if (error) {
      toast.error("Failed to update maintenance mode");
      setMaintMode({ ...maintMode, active: !checked });
    } else {
      toast.success(`Maintenance Mode ${checked ? 'ACTIVATED' : 'DEACTIVATED'}`);
    }
  };

  const kpis = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-slate-200", bg: "bg-blue-500/10" },
    { label: "Active Subs", value: stats.activeSubs, icon: CreditCard, color: "text-emerald-500", bg: "bg-[#D1E4FF] dark:bg-emerald-500/10" },
    { label: "Total Revenue", value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "MT5 Accounts", value: stats.connectedAccounts, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Overview</h1>
        <p className="text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all hover:translate-y-[-2px] group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+12% vs last month</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{loading ? "..." : kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Trades and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Trade Feed */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-slate-200" size={18} />
              Live Trade Feed
            </h2>
            <button className="text-xs font-semibold text-slate-300 hover:text-blue-300 transition-colors">View All Trades</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentTrades.map((trade, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-200">
                      {trade.profiles?.full_name || "User #" + trade.user_id.slice(0, 4)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${trade.type === 'buy' ? 'bg-[#D1E4FF] dark:bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 font-bold ${trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trade.profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        ₹{Math.abs(trade.profit).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(trade.closed_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {!loading && recentTrades.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No trades executed in the last 24 hours.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health & Maintenance */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 flex-1">
            <h3 className="text-lg font-bold">System Health</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">MT5 Server Load</span>
                  <span className="text-emerald-400">Healthy</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D1E4FF] dark:bg-emerald-500 w-[24%]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Webhook Processing</span>
                  <span className="text-slate-300">Optimal</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[12%]" />
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-800">
              <div className="flex items-center gap-4 bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg text-slate-300">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Today's Revenue</p>
                  <p className="text-lg font-bold text-white">₹14,985.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode Panel */}
          <div className={`border rounded-2xl p-6 transition-all duration-300 ${maintMode.active ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench className={maintMode.active ? 'text-amber-500' : 'text-slate-400'} size={18} />
                <span className={maintMode.active ? 'text-amber-500' : 'text-slate-200'}>Global Control</span>
              </h3>
              <Switch checked={maintMode.active} onCheckedChange={handleMaintToggle} className="data-[state=checked]:bg-amber-500" />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {maintMode.active ? 'Maintenance mode is currently locking out all non-admin users.' : 'Toggle to lock out users and show the maintenance screen.'}
            </p>
            {maintMode.active && (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 flex gap-3 animate-pulse">
                <ShieldAlert className="text-amber-500 shrink-0" size={16} />
                <div>
                  <p className="text-xs font-bold text-amber-500 uppercase">Warning</p>
                  <p className="text-[10px] text-amber-200">Users cannot access the platform until you turn this off.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
