import { useState, useEffect } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Wrench, Bug, Clock, Server, AlertCircle, Filter, Search } from "lucide-react";

import { supabase } from "../lib/supabase";

export default function TechIssuesPage() {
  const { adminUser } = useAdminAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();

    // Realtime subscription
    const channel = supabase
      .channel('tech_issues_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tech_issues' }, () => {
        fetchIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    const { data } = await supabase.from('tech_issues').select('*').order('created_at', { ascending: false });
    if (data) setIssues(data);
    setLoading(false);
  };

  const resolveIssue = async (id: string) => {
    await supabase.from('tech_issues').update({ status: 'resolved' }).eq('id', id);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); // minutes
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Incident Hub</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Active Hardware & Software Faults</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={13} />
            <input placeholder="FILTER LOGS..." className="bg-[#1E1E1E] border border-white/5 pl-9 pr-4 py-2 rounded-lg text-[10px] text-zinc-300 focus:outline-none w-full sm:w-[180px] placeholder:text-neutral-600 uppercase" />
          </div>
          <div className="px-3 py-1.5 bg-[#1E1E1E] border border-white/5 rounded-lg text-center shrink-0">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {issues.filter(i => i.status !== "resolved").length} Critical Faults
            </span>
          </div>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
        {["all", "urgent", "high", "medium", "low"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-none shrink-0 ${filter === s ? "bg-white/10 border-white/10 text-white" : "bg-white/[0.01] border-white/5 text-neutral-500 hover:text-neutral-300"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {issues.filter(i => filter === "all" || i.severity === filter).map(issue => (
          <div key={issue.id} className={`bg-[#1E1E1E] border rounded-xl p-3.5 sm:p-5 group hover:border-white/10 transition-none ${issue.status === "resolved" ? "border-white/5 opacity-40 shadow-none" : "border-white/10 shadow-lg shadow-black/20"}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className={`p-2 rounded-lg bg-[#121212] border border-white/5 mt-0.5 shrink-0 ${issue.severity === 'urgent' ? 'animate-pulse text-neutral-200' : 'text-neutral-500'}`}>
                  {issue.severity === 'urgent' ? <AlertCircle size={14} /> : <Wrench size={14} />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-tight truncate">{issue.title}</p>
                    <span className={`text-[8px] font-bold uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded ${issue.severity === 'urgent' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] text-neutral-500 uppercase font-bold mt-2">
                    <span className="flex items-center gap-1.5"><Server size={11} className="text-neutral-500" /> {issue.component}</span>
                    <span className="flex items-center gap-1.5"><Clock size={11} className="text-neutral-500" /> REPO: {timeAgo(issue.created_at)} AGO</span>
                    <span className="text-neutral-600 font-mono tracking-tighter">REF: {issue.id.substring(0, 8)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center sm:flex-col justify-between sm:items-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${issue.status === 'open' ? 'text-amber-500' : issue.status === 'resolved' ? 'text-neutral-500' : 'text-blue-500'}`}>
                  {issue.status}
                </span>
                {issue.status !== "resolved" && (
                  <button
                    onClick={() => resolveIssue(issue.id)}
                    className="px-3.5 py-1.5 text-[9px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5 rounded uppercase tracking-widest transition-none shadow-lg">
                    Resolve Fault
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

