import { useState, useEffect } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { ROLE_LABELS, type AdminRole } from "../lib/rbac";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Calendar,
  History,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

// Task interface removed

// Removed INITIAL_DEPARTMENT_TASKS and MOCK_INCOMING

export default function TaskProtocolPage() {
  const { activeRole, adminUser } = useAdminAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState("");

  useEffect(() => {
    if (!activeRole || !adminUser) return;
    const fetchTasks = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('team_tasks')
        .select('*')
        .eq('assignee_email', adminUser.email)
        .order('created_at', { ascending: false });
      if (data) setTasks(data);
      setLoading(false);
    };

    fetchTasks();
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRole, adminUser]);

  const handleToggleClick = (task: any) => {
    if (task.status === 'completed') {
      // Re-open task
      supabase.from('team_tasks').update({ status: 'pending' }).eq('id', task.id).then(() => {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: 'pending' } : t));
      });
    } else {
      // Start completion flow
      setCompletingTaskId(task.id);
      setCompletionNote("");
    }
  };

  const submitCompletion = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const finalDesc = completionNote ? `${task.description || ''}\n\n[COMPLETION_NOTE]: ${completionNote}` : task.description;
    await supabase.from('team_tasks').update({ status: 'completed', description: finalDesc, completed_at: new Date().toISOString() }).eq('id', taskId);
    setCompletingTaskId(null);
    setCompletionNote("");
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed', description: finalDesc } : t));
  };

  const filteredTasks = tasks.filter(t =>
    activeTab === "pending" ? t.status !== "completed" : t.status === "completed"
  );

  const stats = {
    pending: tasks.filter(t => t.status !== "completed").length,
    completed: tasks.filter(t => t.status === "completed").length,
    total: tasks.length
  };

  if (!activeRole) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Daily Protocol</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            {ROLE_LABELS[activeRole]} Morning Directives
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded-lg self-start sm:self-auto">
          <Calendar size={14} className="text-neutral-500" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Sidebar - Navigation & Stats */}
        <div className="space-y-4 sm:space-y-6 col-span-1">
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
              <History size={14} className="text-neutral-600" /> Task Status
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg transition-none ${activeTab === "pending" ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase truncate ${activeTab === "pending" ? "text-white" : "text-neutral-400"}`}>Pending Actions</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 ml-2">{stats.pending}</span>
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg transition-none ${activeTab === "completed" ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase truncate ${activeTab === "completed" ? "text-white" : "text-neutral-400"}`}>Completed Log</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 ml-2">{stats.completed}</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Priority Alert</span>
            </div>
            <p className="text-[9px] text-neutral-500 uppercase leading-relaxed">
              All 'Critical' priority directives must be resolved before the 11:00 AM system audit.
            </p>
          </div>
        </div>

        {/* Main Task List */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {filteredTasks.length > 0 ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 sm:space-y-4"
              >
                {loading ? (
                   <div className="p-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest">Syncing Protocols...</div>
                ) : filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group bg-[#1E1E1E] border border-white/5 p-3.5 sm:p-4 rounded-xl transition-none flex gap-3 sm:gap-6"
                  >
                    <div className="shrink-0 pt-1 cursor-pointer" onClick={() => handleToggleClick(task)}>
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={22} className="text-emerald-500" />
                      ) : (
                        <Circle size={22} className="text-neutral-800 hover:text-emerald-500 transition-colors" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={`text-[13px] font-bold uppercase tracking-tight ${task.status === 'completed' ? "text-neutral-600 line-through" : "text-white"}`}>
                          {task.title}
                        </h4>
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border bg-white/5 border-white/10 text-neutral-500`}>
                          {task.status === 'completed' ? 'COMPLETED' : 'PENDING'}
                        </span>
                      </div>
                      
                      {/* Media and Description Rendering */}
                      <div className="mt-3">
                        {task.description && !task.description.includes('[MEDIA_URL]:') && !task.description.includes('[COMPLETION_NOTE]:') && (
                          <p className={`text-[11px] whitespace-pre-wrap ${task.status === 'completed' ? "text-neutral-700" : "text-neutral-400"}`}>{task.description}</p>
                        )}
                        
                        {task.description && (task.description.includes('[MEDIA_URL]:') || task.description.includes('[COMPLETION_NOTE]:')) && (
                          <div className="space-y-4 mt-2">
                            {/* Base Description */}
                            <p className={`text-[11px] whitespace-pre-wrap ${task.status === 'completed' ? "text-neutral-700" : "text-neutral-400"}`}>
                              {task.description.split('\n\n[MEDIA_URL]:')[0].split('\n\n[COMPLETION_NOTE]:')[0]}
                            </p>
                            
                            {/* Media Section */}
                            {task.description.includes('[MEDIA_URL]:') && (() => {
                              const url = task.description.split('[MEDIA_URL]:')[1]?.split('\n\n[COMPLETION_NOTE]:')[0];
                              if (!url) return null;
                              const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes('youtube') || url.includes('vimeo');
                              return (
                                <div className="mt-2">
                                  {isVideo ? (
                                    <video src={url} controls className="max-w-full h-40 rounded border border-white/10" />
                                  ) : (
                                    <img src={url} alt="Task Media" className="max-w-full h-40 object-cover rounded border border-white/10" />
                                  )}
                                </div>
                              );
                            })()}
                            
                            {/* Completion Note Section */}
                            {task.description.includes('[COMPLETION_NOTE]:') && (
                               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 mt-3">
                                 <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Completion Note:</p>
                                 <p className="text-[11px] text-emerald-400/80 italic">{task.description.split('[COMPLETION_NOTE]:')[1]}</p>
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {completingTaskId === task.id && (
                        <div className="mt-4 bg-black/40 p-3 rounded border border-white/10 flex items-end gap-3">
                          <div className="flex-1">
                            <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Add Completion Note (Optional)</label>
                            <input
                              type="text"
                              value={completionNote}
                              onChange={e => setCompletionNote(e.target.value)}
                              placeholder="e.g. Done, attached logs..."
                              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <button 
                            onClick={(e) => submitCompletion(task.id, e)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded shrink-0 h-[34px]"
                          >
                            Sign Off
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1 text-[8px] text-neutral-500 uppercase font-bold tracking-tighter">
                          <Clock size={10} />
                          Assigned: {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {task.due_date && (
                          <div className={`flex items-center gap-1 text-[8px] uppercase font-bold tracking-tighter ${
                            new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-400' : 'text-neutral-500'
                          }`}>
                            <AlertCircle size={10} />
                            Due: {new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}
                        {task.status === 'completed' && (
                          <div className="flex items-center gap-1 text-[8px] text-emerald-600 uppercase font-bold tracking-tighter ml-auto">
                            <CheckCircle2 size={10} />
                            Resolved
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <Calendar size={12} />
                        <span className="text-[10px] font-mono">{new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <ArrowRight size={14} className="text-neutral-800 opacity-0 group-hover:opacity-100 transition-none" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1E1E1E] border border-white/5 rounded p-20 flex flex-col items-center justify-center text-center"
              >
                <CheckCircle2 size={40} className="text-neutral-800 mb-4" />
                <h3 className="text-[12px] font-bold text-neutral-600 uppercase tracking-widest">Protocol Satisifed</h3>
                <p className="text-[10px] text-neutral-800 uppercase mt-2">All departmental directives for this cycle have been cleared.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
