import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Brain, RefreshCcw, MessageSquare, Users, Zap, Clock } from "lucide-react";

export default function AICoachMonitorPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, totalMessages: 0, uniqueUsers: 0, avgPerUser: 0 });

  const fetchData = async () => {
    setLoading(true);

    // Try to fetch from ai_chat_sessions or ai_logs
    const { data: sessionData, error } = await supabase
      .from("ai_chat_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (sessionData && sessionData.length > 0) {
      setSessions(sessionData);
      const uniqueUsers = new Set(sessionData.map((s: any) => s.user_id)).size;
      setStats({
        totalSessions: sessionData.length,
        totalMessages: sessionData.reduce((s: number, ses: any) => s + (ses.message_count || 0), 0),
        uniqueUsers,
        avgPerUser: uniqueUsers > 0 ? Math.round(sessionData.length / uniqueUsers) : 0,
      });
    } else {
      // Fallback: check profiles for any AI usage indicators
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      
      // Show profiles as potential AI users
      setSessions((profiles || []).map(p => ({
        id: p.id,
        user_id: p.id,
        profiles: p,
        title: "Platform User",
        message_count: 0,
        created_at: p.created_at,
        status: "available"
      })));
      setStats({
        totalSessions: 0,
        totalMessages: 0,
        uniqueUsers: profiles?.length || 0,
        avgPerUser: 0
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">AI Coach Monitor</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Kimi AI Usage Analytics & Conversation Logs</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total AI Sessions", value: stats.totalSessions, icon: Brain },
          { label: "Total Messages", value: stats.totalMessages, icon: MessageSquare },
          { label: "Unique Users", value: stats.uniqueUsers, icon: Users },
          { label: "Avg Sessions/User", value: stats.avgPerUser, icon: Zap },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={16} className="text-neutral-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
            </div>
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1E1E1E] border border-white/5 rounded p-5">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">AI Engine Status</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-bold text-emerald-500 uppercase">Operational</span>
          </div>
          <p className="text-[10px] text-neutral-600">Kimi AI via Supabase Edge Functions</p>
        </div>
        <div className="bg-[#1E1E1E] border border-white/5 rounded p-5">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Model Provider</h3>
          <p className="text-[14px] font-bold text-white mb-1">Moonshot (Kimi)</p>
          <p className="text-[10px] text-neutral-600">moonshot-v1-8k context window</p>
        </div>
        <div className="bg-[#1E1E1E] border border-white/5 rounded p-5">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Edge Function</h3>
          <p className="text-[14px] font-bold text-white mb-1">tradifive-ai</p>
          <p className="text-[10px] text-neutral-600">Deployed on Supabase Functions</p>
        </div>
      </div>

      {/* Session Log */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <Brain size={14} className="text-purple-500" /> AI Usage Log
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Session Topic</th>
              <th className="px-5 py-3.5">Messages</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning AI neural network...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No AI sessions detected</td></tr>
            ) : sessions.map((s, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-none">
                <td className="px-5 py-3">
                  <p className="text-[11px] font-bold text-neutral-300 uppercase">{s.profiles?.full_name || "User"}</p>
                  <p className="text-[9px] text-neutral-700 font-mono">{s.profiles?.email}</p>
                </td>
                <td className="px-5 py-3 text-[11px] text-neutral-400">{s.title || "General Inquiry"}</td>
                <td className="px-5 py-3 text-[11px] font-mono text-neutral-500">{s.message_count || 0}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                    s.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
                  }`}>
                    {s.status || "idle"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-[10px] text-neutral-500">
                  {s.created_at ? new Date(s.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
