import { useState, useEffect } from "react";
import { ClipboardList, Clock, User, CheckCircle2, AlertCircle, BarChart, Bell, Activity } from "lucide-react";

import { supabase } from "../lib/supabase";

export default function OperationsPanelPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data } = await supabase.from('operations_tasks').select('*').order('created_at', { ascending: false });
      if (data) setTasks(data);
      setLoading(false);
    };

    fetchTasks();
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operations_tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const completeTask = async (id: string) => {
    await supabase.from('operations_tasks').update({ status: 'completed' }).eq('id', id);
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
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Operations Control</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Platform Workflow Orchestration</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#1E1E1E] border border-white/5 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
              {tasks.filter(t => t.status !== "completed").length} Active Protocols
            </span>
          </div>
          <button className="p-2 bg-white/[0.02] border border-white/5 rounded-lg hover:text-white transition-none">
            <Bell size={14} className="text-neutral-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: "Active Mandates", value: tasks.filter(t => t.status !== "completed").length, icon: ClipboardList },
          { label: "In execution", value: tasks.filter(t => t.status === "in-progress").length, icon: Activity },
          { label: "SLA Assurance", value: "98.2%", icon: CheckCircle2 },
          { label: "Stability Index", value: "Optimal", icon: BarChart },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 sm:mb-1.5 truncate">{s.label}</p>
              <p className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">{s.value}</p>
            </div>
            <s.icon size={28} className="absolute -bottom-1 -right-1 text-white/[0.02] group-hover:text-white/[0.04] transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-2">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1 mb-2">Live Protocol Feed</h3>
          {loading ? (
            <div className="p-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest">Loading protocols...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest">No active protocols</div>
          ) : tasks.map(task => (
            <div key={task.id} className={`bg-[#1E1E1E] border rounded-xl p-3.5 sm:p-4 transition-all group hover:bg-white/[0.01] ${task.status === "completed" ? "border-white/5 opacity-40 shadow-none" : "border-white/5 shadow-md"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-[#121212] border border-white/5 flex items-center justify-center text-[10px] font-bold shrink-0 ${task.status === 'in-progress' ? 'text-blue-500' : 'text-neutral-500'}`}>
                    {task.priority === 'urgent' ? <AlertCircle size={14} /> : <ClipboardList size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-neutral-200 uppercase tracking-tight truncate">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] text-neutral-500 uppercase font-bold mt-1">
                      <span className="flex items-center gap-1"><User size={10} /> {task.assigned_to || 'Unassigned'}</span>
                      <span className="text-[8px] border border-white/5 px-1.5 py-0.5 rounded text-neutral-400">{task.type}</span>
                      <span className="font-mono tracking-tighter text-neutral-600">{task.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">{timeAgo(task.created_at)} ago</span>
                  {task.status !== "completed" ? (
                    <button onClick={() => completeTask(task.id)}
                      className="px-3.5 py-1.5 text-[9px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5 rounded uppercase tracking-widest transition-none shadow-lg">
                      Finalize
                    </button>
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-6">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 sm:mb-6">Operations Health</h3>
            <div className="space-y-4 sm:space-y-5">
              {[
                { label: "Team Response", value: "2.4m", color: "bg-emerald-500" },
                { label: "Protocol Adherence", value: "99%", color: "bg-blue-500" },
                { label: "Load Balancing", value: "Automated", color: "bg-neutral-700" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-1.5">
                    <span className="text-neutral-500">{item.label}</span>
                    <span className="text-neutral-300">{item.value}</span>
                  </div>
                  <div className="h-1 bg-[#121212] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} opacity-40`} style={{ width: '85%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

