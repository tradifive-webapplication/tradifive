import { useState, useEffect } from "react";
import { Clock, User, Shield } from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('admin_audit_logs')
        .select('*, admin_profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) setLogs(data);
      setLoading(false);
    };

    fetchLogs();

    const channel = supabase
      .channel('audit_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_audit_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = filter === "all" ? logs : logs.filter(l => l.details?.level === filter);

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); // minutes
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Audit Trail</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Immutable Logs</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "critical", "warning", "info"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-600 hover:text-neutral-300"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center p-8 text-[10px] uppercase tracking-widest text-neutral-600">Syncing Ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-8 text-[10px] uppercase tracking-widest text-neutral-600">No Immutable Logs Recorded</div>
        ) : filtered.map(log => (
          <div key={log.id} className="bg-[#1E1E1E] border border-white/5 rounded p-4 flex items-center justify-between hover:border-white/10 transition-none group">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded bg-[#121212] border border-white/5">
                <Shield size={14} className="text-neutral-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-bold text-neutral-300 uppercase">{log.action}</p>
                  <span className="text-[8px] font-bold text-neutral-700 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded">{log.details?.level || "INFO"}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[9px] text-neutral-700 font-bold uppercase">
                  <span>ACTOR: {log.admin_profiles?.full_name || "System"}</span>
                  <span>TARGET: {log.target_id || "Global"}</span>
                </div>
              </div>
            </div>
            <span className="text-[9px] text-neutral-800 flex items-center gap-1 font-mono">{timeAgo(log.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
