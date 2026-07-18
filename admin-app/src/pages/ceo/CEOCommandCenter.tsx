import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  TrendingUp, Users, Activity, Banknote, ShieldAlert, Zap,
  ArrowRight, Landmark, Trophy, FileText, BotMessageSquare, Building2, Settings, CalendarDays, Briefcase
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function CEOCommandCenter() {
  const navigate = useNavigate();
  
  const [realStats, setRealStats] = useState({ activeTraders: 0, dailyRevenue: 0, openTickets: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [subData, setSubData] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const [profilesRes, txRes, ticketsRes, adminsRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("id, subscription_status"),
        supabase.from("transactions").select("amount, type, created_at").gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("admin_profiles").select("*"),
        supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(6)
      ]);

      const profiles = profilesRes.data || [];
      const txs = txRes.data || [];
      const todayRev = txs
        .filter(t => new Date(t.created_at) >= today && (t.type === 'credit' || t.amount > 0))
        .reduce((s, t) => s + Math.abs(t.amount || 0), 0);
      
      setRealStats({
        activeTraders: profiles.length,
        dailyRevenue: todayRev,
        openTickets: ticketsRes.count || 0
      });

      // Subscription distribution
      let pro = 0, elite = 0, trial = 0, free = 0;
      profiles.forEach(p => {
        if (p.subscription_status === 'pro') pro++;
        else if (p.subscription_status === 'elite') elite++;
        else if (p.subscription_status === 'trial') trial++;
        else free++;
      });
      setSubData([
        { name: 'Elite', value: elite, color: '#f59e0b' },
        { name: 'Pro', value: pro, color: '#6366f1' },
        { name: 'Pro Trial (7d) / Free', value: trial + free, color: '#64748b' }
      ]);

      // Compute 7-day chart data
      const chartMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartMap[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
      }
      
      txs.forEach(t => {
        if (t.type === 'credit' || t.amount > 0) {
          const dateStr = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (chartMap[dateStr] !== undefined) {
            chartMap[dateStr] += Math.abs(t.amount || 0);
          }
        }
      });
      
      setRevenueData(Object.entries(chartMap).map(([name, Total]) => ({ name, Total })));

      // Compute Depts dynamically from admin profiles
      const admins = adminsRes.data || [];
      const uniqueDepts = Array.from(new Set(admins.map(e => {
        let d = e.department || "Unassigned";
        if (d === "HR") d = "HR & People";
        if (d === "Risk") d = "Trading & Risk";
        return d;
      }))).filter(d => d !== "Unassigned" && d !== "Executive");

      const realDepts = uniqueDepts.map(deptName => {
        const deptAdmins = admins.filter(e => {
          let d = e.department || "";
          if (d === "HR") d = "HR & People";
          if (d === "Risk") d = "Trading & Risk";
          return d === deptName;
        });
        
        const head = deptAdmins.find(e => 
          e.role === "hr_manager" || 
          e.role === "technical_lead" || 
          e.role === "operations_executive" || 
          e.role === "support_executive"
        );
        
        const color = deptName.includes("Tech") ? "#6366f1" : deptName.includes("Trading") || deptName.includes("Risk") ? "#ef4444" : deptName.includes("Op") ? "#10b981" : deptName.includes("HR") ? "#a855f7" : "#3b82f6";

        return {
          name: deptName,
          head: head ? head.full_name : (deptAdmins.length > 0 ? deptAdmins[0].full_name : "Pending Assignment"),
          status: "Nominal",
          active: deptAdmins.filter(a => a.is_active !== false && a.is_suspended !== true).length,
          issues: 0,
          color
        };
      });
      setDepts(realDepts);

      // Logs
      if (logsRes.data) {
        setRecentActivity(logsRes.data.map(log => {
          const hoursAgo = Math.floor((new Date().getTime() - new Date(log.created_at).getTime()) / (1000 * 60 * 60));
          const timeStr = hoursAgo === 0 ? "Just now" : `${hoursAgo}h ago`;
          return {
            time: timeStr,
            text: log.message,
            dept: log.level === "ERROR" ? "Tech" : "System"
          };
        }));
      }

      setLoading(false);
    };
    
    fetchRealData();
    
    const channel = supabase.channel('ceo_command_center')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchRealData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchRealData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_logs' }, fetchRealData)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { label: "Active Traders", value: loading ? "..." : realStats.activeTraders.toLocaleString(), change: "", trend: "stable", icon: Users, color: "#6366f1", path: "/users" },
    { label: "Daily Revenue", value: loading ? "..." : `$${realStats.dailyRevenue.toLocaleString()}`, change: "", trend: "stable", icon: Landmark, color: "#10b981", path: "/payments" },
    { label: "Open Tickets", value: loading ? "..." : realStats.openTickets.toString(), change: "", trend: "stable", icon: ShieldAlert, color: "#ef4444", path: "/support-tickets" },
    { label: "Platform Latency", value: "Realtime", change: "Stable", trend: "stable", icon: Zap, color: "#f59e0b", path: "/system-status" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Command Center</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Global Operations Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Global Stable</span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(s.path)}
            className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: `${s.color}20` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${
                s.trend === 'up' ? 'text-emerald-500' : s.trend === 'down' ? 'text-red-500' : 'text-neutral-500'
              }`}>
                {s.change}
              </div>
            </div>
            <p className="text-2xl font-black text-white mb-1">{s.value}</p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-500" /> 7-Day Gross Subscription Yield
            </h3>
            <span className="text-[10px] text-neutral-400">Updates Real-Time</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 flex flex-col">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Users size={13} className="text-indigo-400" /> Subscription Distribution
          </h3>
          <div className="flex-1 min-h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {subData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                  formatter={(val: number) => [val, "Users"]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{realStats.activeTraders}</span>
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Total</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 px-2">
            {subData.map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[9px] text-neutral-400 uppercase font-bold">{s.name}</span>
                </div>
                <div className="text-sm font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Department Status */}
        <div className="col-span-2 bg-[#1E1E1E] border border-white/5 rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={13} className="text-neutral-700" /> Department Readiness
            </h3>
            <button onClick={() => navigate("/hr/employees")} className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1">
              View Directory <ArrowRight size={10} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {depts.map(d => (
              <div key={d.name} className="bg-black/20 border border-white/5 rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">{d.name}</p>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                    d.issues > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500">Head: <span className="text-white font-bold">{d.head}</span></span>
                  <span className="text-neutral-500">Active: <span className="text-white font-mono">{d.active}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Feed */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={13} className="text-neutral-700" /> Global Feed
            </h3>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-px h-full bg-white/5 mt-2 relative">
                  <div className="absolute top-0 -left-[3px] w-1.5 h-1.5 rounded-full bg-neutral-600 border-2 border-[#1E1E1E]" />
                </div>
                <div className="pb-4 border-b border-white/[0.02] w-full">
                  <p className="text-[11px] text-neutral-300 leading-snug">{act.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] text-neutral-600">{act.time}</span>
                    <span className="text-[7px] font-bold text-neutral-500 uppercase tracking-widest bg-white/[0.02] px-1 py-0.5 rounded border border-white/5">
                      {act.dept}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch */}
      <div>
        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Team Tracker", path: "/ceo/team-tracker", icon: CalendarDays, color: "#10b981" },
            { label: "Assign Tasks", path: "/ceo/task-assignment", icon: Briefcase, color: "#a855f7" },
            { label: "Agent Command", path: "/agent", icon: BotMessageSquare, color: "#f59e0b" },
            { label: "Audit Logs", path: "/audit-logs", icon: FileText, color: "#64748b" },
            { label: "Competitions", path: "/competitions", icon: Trophy, color: "#ef4444" },
            { label: "Global Config", path: "/settings", icon: Settings, color: "#3b82f6" },
          ].map(link => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="bg-[#1E1E1E] border border-white/5 hover:border-white/10 rounded-lg p-3 flex items-center gap-3 text-left transition-none group"
            >
              <link.icon size={14} className="text-neutral-500 group-hover:text-white transition-none" />
              <span className="text-[11px] font-bold text-neutral-300 group-hover:text-white">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
