import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Target,
  Zap,
  Activity,
  Lock,
  Unlock,
  History,
  AlertTriangle,
  RefreshCw,
  Info,
  LayoutDashboard,
  Settings,
  TrendingDown,
  ChevronRight,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { PushableButton } from "@/components/PushableButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Mock data for TradeZella-style visuals
const pnlData = [
  { date: '02/16', pnl: 0, balance: 10000 },
  { date: '02/17', pnl: 120, balance: 10120 },
  { date: '02/18', pnl: 340, balance: 10460 },
  { date: '02/19', pnl: -150, balance: 10310 },
  { date: '02/20', pnl: 450, balance: 10760 },
  { date: '02/21', pnl: 210, balance: 10970 },
  { date: '02/22', pnl: 580, balance: 11550 },
  { date: '02/23', pnl: -200, balance: 11350 },
  { date: '02/24', pnl: 890, balance: 12240 },
  { date: '02/25', pnl: 430, balance: 12670 },
  { date: '02/26', pnl: 1200, balance: 13870 },
];

const calendarDays = [
  { day: 16, pnl: 0, trades: 0 },
  { day: 17, pnl: 216, trades: 8, win: 0.62 },
  { day: 18, pnl: 302, trades: 3, win: 1.0 },
  { day: 19, pnl: 53.6, trades: 14, win: 0.64 },
  { day: 20, pnl: 220, trades: 4, win: 1.0 },
  { day: 21, pnl: 534, trades: 6, win: 0.66 },
  { day: 22, pnl: 184, trades: 2, win: 1.0 },
  { day: 23, pnl: 315, trades: 5, win: 0.80 },
  { day: 24, pnl: 600, trades: 24, win: 0.62 },
  { day: 25, pnl: 766, trades: 17, win: 0.58 },
  { day: 26, pnl: 1800, trades: 6, win: 0.66 },
  { day: 27, pnl: 996, trades: 9, win: 0.66 },
  { day: 28, pnl: 1640, trades: 15, win: 0.60 },
];

interface ShieldLog {
  id: string;
  created_at: string;
  message: string;
  metadata?: any;
}

export default function RiskEngine() {
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<ShieldLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeTab = location.pathname.includes("management") ? "settings" : "dashboard";

  const { accountMetrics, todayProfit, tradesToday, drawdown, balance, equity, loading: metricsLoading } = useDashboardData();

  useEffect(() => {
    fetchProfile();
    fetchLogs();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_locked_for_today, max_daily_trades, trades_today, max_drawdown_limit')
      .eq('id', user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: logData } = await supabase
      .from('system_logs')
      .select('*')
      .eq('user_id', user.id)
      .ilike('message', '%Discipline Shield%')
      .order('created_at', { ascending: false })
      .limit(10);

    setLogs(logData || []);
  };

  const updateSettings = async (updates: any) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to sync parameters");
    } else {
      toast.success("Parameters updated successfully");
      setProfile({ ...profile, ...updates });
    }
    setSaving(false);
  };

  const isConnected = !!accountMetrics?.account_number;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - Clean & Compact */}
        <div className="flex items-center justify-between mt-2 mb-10 h-[60px]">
          <div className="flex flex-col pt-1">
            <h1 className="text-[30px] font-black uppercase tracking-tighter text-foreground leading-none">Risk Guard Terminal</h1>
            <p className="text-[14px] text-slate-500 font-medium tracking-tight mt-2">Operational Integrity // Advanced Discipline Protocols.</p>
          </div>

          {isConnected && (
            <div className="flex items-center gap-4 pr-2 self-end mb-2">
               <div className="flex flex-col items-end">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Telemetry Status</p>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D1E4FF] dark:bg-emerald-500 animate-pulse" />
                    <span className="text-[13px] text-foreground font-bold tracking-tight">Heartbeat Active</span>
                 </div>
               </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!isConnected ? (
                /* Compact White-Mode Empty State */
                <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] dark:border-white/5 p-12 text-center space-y-6 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} className="text-white" />
                  </div>
                  <div className="max-w-xs mx-auto space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white dark:text-white uppercase tracking-tight">System Idle</h2>
                    <p className="text-slate-500 dark:text-slate-300 font-medium text-xs leading-relaxed">Connect your MT5 account to activate live monitoring and your TradeZella-style telemetry dashboard.</p>
                  </div>
                  <Link
                    to="/broker-connect"
                    className="button group"
                    style={{ "--round": "12px" } as any}
                  >
                    <span className="text">Sync MT5 Account</span>
                    <ChevronRight size={16} className="relative z-10" />
                  </Link>
                </div>
              ) : (
                /* REDESIGNED TRADEZELLA-STYLE DASHBOARD */
                <div className="space-y-6">
                  {/* Top Stats Bar */}
                  {metricsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1E1E1E] px-5 py-4 rounded-2xl border border-slate-100 dark:border-[#333333]/50 shadow-sm animate-pulse h-[106px] flex flex-col justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 bg-slate-200 dark:bg-white/10 rounded-full" />
                            <Skeleton className="h-3.5 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                          </div>
                          <Skeleton className="h-7 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                          <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white dark:bg-[#1E1E1E] px-5 py-4 rounded-2xl border border-slate-100 dark:border-[#333333]/50 shadow-sm group hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet size={14} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Balance</span>
                        </div>
                        <div className="text-[26px] font-bold text-foreground tracking-tight">${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-emerald-600 font-black flex items-center gap-1 mt-1 uppercase italic tracking-widest">
                          <ArrowUpRight size={10} /> +${todayProfit?.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1E1E1E] px-5 py-4 rounded-2xl border border-slate-100 dark:border-[#333333]/50 shadow-sm group hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <Target size={14} className="text-slate-200" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yield Efficiency</span>
                        </div>
                        <div className="text-[26px] font-bold text-foreground tracking-tight">62.54%</div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-[#1E1E1E] dark:bg-white/5 rounded-full overflow-hidden mt-3">
                          <div className="h-full bg-[#3b82f6] w-[62%]" />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1E1E1E] px-5 py-4 rounded-2xl border border-slate-100 dark:border-[#333333]/50 shadow-sm group hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap size={14} className="text-amber-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-Time P&L</span>
                        </div>
                        <div className={`text-[26px] font-bold tracking-tight ${todayProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {todayProfit >= 0 ? "+" : ""}${todayProfit?.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest italic">
                          {tradesToday} Orders Today
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1E1E1E] px-5 py-4 rounded-2xl border border-slate-100 dark:border-[#333333]/50 shadow-sm group hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown size={14} className="text-rose-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Drawdown</span>
                        </div>
                        <div className="text-[26px] font-bold text-foreground tracking-tight">{drawdown?.toFixed(2)}%</div>
                        <div className="text-[10px] text-rose-500 font-black mt-1 uppercase tracking-widest italic">
                          Security Limit: {profile?.max_drawdown_limit}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Charts & Calendar Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cumulative P&L Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm overflow-hidden p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-white">
                            <TrendingUp size={16} />
                          </div>
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Cumulative Net P&L</h3>
                        </div>
                        <div className="flex gap-2">
                          {['7D', '30D', 'ALL'].map(t => (
                            <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${t === '30D' ? 'bg-slate-900 dark:bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                          ))}
                        </div>
                      </div>

                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={pnlData}>
                            <defs>
                              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: '800'
                              }}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPnl)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* TradeZella Style Calendar */}
                    <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-100 dark:bg-[#1E1E1E] dark:bg-white/5 rounded-xl text-slate-600">
                            <Calendar size={16} />
                          </div>
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Monthly Journal</h3>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-[#D1E4FF] dark:bg-emerald-500/10 px-2 py-1 rounded-lg">+$7,630</span>
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <div key={d} className="text-center text-[10px] font-black text-slate-300 py-1">{d}</div>
                        ))}
                        {/* Placeholder empty days */}
                        {[...Array(15)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-slate-50/50 dark:bg-white/[0.02]" />
                        ))}
                        {/* Interactive Data Days */}
                        {calendarDays.map(day => (
                          <div
                            key={day.day}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center border transition-all hover:scale-110 cursor-pointer ${day.pnl > 0
                                ? "bg-[#D1E4FF] dark:bg-emerald-500/10 border-[#D6E4FF] dark:border-emerald-500/20"
                                : "bg-slate-50 dark:bg-[#141414] dark:bg-white/5 border-transparent"
                              }`}
                          >
                            <span className={`text-[10px] font-black ${day.pnl > 0 ? "text-emerald-600" : "text-slate-400"}`}>{day.day}</span>
                            {day.pnl > 0 && <span className="text-[8px] font-bold text-emerald-500 mt-0.5">${day.pnl}</span>}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-400">Trading Days</span>
                          <span className="font-black text-slate-900 dark:text-white dark:text-white">12 Days</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-400">Profit Factor</span>
                          <span className="font-black text-emerald-600">3.42</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Performance Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm p-6 overflow-hidden">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600">
                          <Layers size={18} />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-tight">Net Daily P&L</h3>
                      </div>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pnlData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" hide />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                              {pnlData.map((entry, index) => (
                                <cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-50 dark:border-white/5 dark:border-white/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-[#1E1E1E] dark:bg-blue-500 rounded-xl"><History size={18} className="text-slate-600" /></div>
                          <h3 className="font-bold text-sm uppercase tracking-tight">Recent Protection Events</h3>
                        </div>
                      </div>
                      <div className="p-2">
                        {logs.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-sm font-medium">No violations detected today.</div>
                        ) : (
                          <div className="space-y-1">
                            {logs.map((log) => (
                              <div key={log.id} className="p-3 hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/[0.02] rounded-2xl flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                                  <p className="text-[12px] font-bold text-slate-700 dark:text-white">{log.message}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                {/* Drawdown Limit Settings - Refined for White Mode */}
                <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] p-8 rounded-[40px] border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm space-y-6 cursor-default group">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform"><TrendingDown size={28} /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Threshold</p>
                      <p className="text-sm font-bold text-rose-600">Daily Max Drawdown</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black text-slate-900 dark:text-white dark:text-white">{profile?.max_drawdown_limit || 0}%</span>
                      <div className="flex gap-2">
                        <button onClick={() => updateSettings({ max_drawdown_limit: Math.max(0.5, (profile?.max_drawdown_limit || 5) - 0.5) })} className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-[#333333] dark:border-white/10 flex items-center justify-center font-bold text-xl hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/5 transition-all">-</button>
                        <button onClick={() => updateSettings({ max_drawdown_limit: Math.min(20, (profile?.max_drawdown_limit || 5) + 0.5) })} className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-[#333333] dark:border-white/10 flex items-center justify-center font-bold text-xl hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/5 transition-all">+</button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">If floating drawdown exceeds this limit, all positions will be terminated and the engine will freeze until the next session.</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] p-8 rounded-[40px] border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm space-y-6 group">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Target size={28} /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Threshold</p>
                      <p className="text-sm font-bold text-indigo-600">Max Daily Trades</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black text-slate-900 dark:text-white dark:text-white">{profile?.max_daily_trades || 0}</span>
                      <div className="flex gap-2">
                        <button onClick={() => updateSettings({ max_daily_trades: Math.max(1, (profile?.max_daily_trades || 10) - 1) })} className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-[#333333] dark:border-white/10 flex items-center justify-center font-bold text-xl hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/5 transition-all">-</button>
                        <button onClick={() => updateSettings({ max_daily_trades: (profile?.max_daily_trades || 10) + 1 })} className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-[#333333] dark:border-white/10 flex items-center justify-center font-bold text-xl hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/5 transition-all">+</button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">System will block new trade initiations once this allocation is exhausted for the day.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className={`p-8 rounded-[40px] border shadow-2xl space-y-6 transition-all duration-500 ${profile?.is_locked_for_today ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/20" : "bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] border-slate-100 dark:border-[#333333] dark:border-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-3xl ${profile?.is_locked_for_today ? "bg-white dark:bg-[#1E1E1E] text-rose-500 shadow-xl" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600"}`}>
                      {profile?.is_locked_for_today ? <Lock size={32} /> : <Unlock size={32} />}
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${profile?.is_locked_for_today ? "text-rose-100" : "text-slate-400"}`}>Security State</p>
                      <p className={`text-sm font-bold ${profile?.is_locked_for_today ? "text-white" : "text-rose-600"}`}>{profile?.is_locked_for_today ? "Protocol Lockdown" : "Standard Ops"}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-xl font-black ${profile?.is_locked_for_today ? "text-white" : "text-slate-900 dark:text-white dark:text-white"}`}>Manual Lockdown</h3>
                      <p className={`text-xs font-medium leading-relaxed mt-2 ${profile?.is_locked_for_today ? "text-rose-100" : "text-slate-500"}`}>
                        Instantly restrict all trade executions on the cloud node. This is a one-way toggle for the current session.
                      </p>
                    </div>
                    <PushableButton
                      variant="deep-3d"
                      onClick={() => updateSettings({ is_locked_for_today: !profile?.is_locked_for_today })}
                      disabled={saving}
                      className="w-full"
                    >
                      {profile?.is_locked_for_today ? "LIFT SUSPENSION" : "INITIATE LOCKDOWN"}
                    </PushableButton>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/10 p-8 rounded-[40px] space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <Info size={24} />
                    <h4 className="font-bold uppercase tracking-tight text-sm">Sync Notice</h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Risk parameters are pushed to your localized cloud node via MetaApi Webhooks. Changes take effect within 10-20ms of acknowledgement.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}






