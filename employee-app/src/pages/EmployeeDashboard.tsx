import { useState, useEffect, useRef } from "react";
import { Briefcase, Clock, CheckCircle2, ExternalLink, LogOut, TimerReset, Mail, Shield, MoreVertical } from "lucide-react";
import { useEmployeeAuth } from "../contexts/EmployeeAuthContext";
import { supabase } from "../lib/supabase";
import EODReportModal from "../components/EODReportModal";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const { adminUser } = useEmployeeAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time Tracking State
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [checkedInTime, setCheckedInTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEODModal, setShowEODModal] = useState(false);
  const [openTaskMenu, setOpenTaskMenu] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!adminUser?.email) return;

      const [tasksRes, activeLogRes] = await Promise.all([
        supabase
          .from("team_tasks")
          .select("*")
          .eq("assignee_email", adminUser.email)
          .order("created_at", { ascending: false }),
        supabase
          .from("team_time_logs")
          .select("*")
          .eq("employee_email", adminUser.email)
          .eq("status", "active")
          .maybeSingle(),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (activeLogRes.data) {
        setActiveLogId(activeLogRes.data.id);
        setCheckedInTime(new Date(activeLogRes.data.check_in));
      }
      setLoading(false);
    }
    loadData();
  }, [adminUser]);

  // Stopwatch ticker
  useEffect(() => {
    if (checkedInTime) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - checkedInTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [checkedInTime]);

  const formatStopwatch = (total: number) => {
    const h = Math.floor(total / 3600).toString().padStart(2, "0");
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleCheckIn = async () => {
    if (!adminUser?.email) return;
    const now = new Date();
    const { data, error } = await supabase
      .from("team_time_logs")
      .insert({ employee_email: adminUser.email, check_in: now.toISOString(), date: now.toISOString().split("T")[0], status: "active" })
      .select()
      .single();
    if (error) { toast.error("Failed to check in"); return; }
    toast.success("Checked in. Timer started.");
    setActiveLogId(data.id);
    setCheckedInTime(now);
  };

  const handleTaskComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("team_tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", taskId);
    if (!error) {
      toast.success("Task completed!");
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t)));
    }
  };

  const handleCheckoutSubmit = async (reportText: string) => {
    if (!adminUser?.email || !activeLogId) return;
    const totalMinutes = Math.floor(elapsedSeconds / 60);
    const now = new Date();
    const { error: reportError } = await supabase.from("team_eod_reports").insert({
      employee_email: adminUser.email,
      date: now.toISOString().split("T")[0],
      time_log_id: activeLogId,
      report_text: reportText,
    });
    if (reportError) { toast.error("Failed to save report."); throw reportError; }
    const { error: logError } = await supabase
      .from("team_time_logs")
      .update({ check_out: now.toISOString(), total_minutes: totalMinutes, status: "completed" })
      .eq("id", activeLogId);
    if (logError) { toast.error("Failed to close time log."); throw logError; }
    toast.success("Checked out successfully!");
    setActiveLogId(null);
    setCheckedInTime(null);
    setShowEODModal(false);
  };

  if (loading) {
    return <div className="p-10 text-center text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Loading Workspace...</div>;
  }

  const displayName = adminUser?.full_name || adminUser?.email || "Employee";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">My Workspace</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Welcome back, {firstName}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-lg font-bold text-indigo-400">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white uppercase tracking-wider truncate">{displayName}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-neutral-500"><Mail size={10} />{adminUser?.email}</span>
            <span className="flex items-center gap-1 text-[9px] text-indigo-400 uppercase font-bold tracking-widest"><Shield size={10} />{adminUser?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`border rounded-lg p-6 relative overflow-hidden flex flex-col ${activeLogId ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]" : "bg-[#1E1E1E] border-white/5"}`}>
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TimerReset size={14} className={activeLogId ? "text-indigo-400" : "text-neutral-500"} />
              Current Session
            </h2>
            <div className="text-center mb-8 flex-1 flex flex-col justify-center">
              <div className="text-[40px] leading-none font-black font-mono text-white tracking-widest">{formatStopwatch(elapsedSeconds)}</div>
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mt-2 flex justify-center gap-3">
                <span>Hrs</span> <span>Min</span> <span>Sec</span>
              </p>
            </div>
            {activeLogId ? (
              <button
                onClick={() => setShowEODModal(true)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center gap-2 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <LogOut size={14} /> Check Out & Report
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <Clock size={14} /> Check In (Start Timer)
              </button>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-6">
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ExternalLink size={14} className="text-emerald-400" /> Web Testing Links
            </h2>
            <div className="space-y-3">
              <a href="https://www.tradifive.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded hover:border-white/10 group transition-all">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">tradifive.in</span>
                <ExternalLink size={14} className="text-neutral-500 group-hover:text-emerald-400" />
              </a>
              <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded hover:border-white/10 group transition-all">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Localhost (5173)</span>
                <ExternalLink size={14} className="text-neutral-500 group-hover:text-indigo-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-6 min-h-[400px]">
            <h3 className="text-[12px] font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Briefcase size={16} className="text-amber-400" /> My Assigned Tasks
            </h3>
            {tasks.length === 0 ? (
              <div className="text-center text-neutral-500 text-[11px] py-10 uppercase tracking-widest">No tasks assigned yet.</div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex flex-col md:flex-row gap-4 justify-between p-4 bg-black/20 border border-white/5 rounded hover:border-white/10 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-widest ${task.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : task.status === "in_progress" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`text-[12px] font-bold tracking-wide ${task.status === "completed" ? "text-neutral-500 line-through" : "text-white"}`}>{task.title}</span>
                      </div>
                      {task.description && <p className="text-[11px] text-neutral-400 leading-relaxed max-w-2xl">{task.description}</p>}
                    </div>
                    <div className="flex items-center justify-end relative">
                      {task.status !== "completed" && (
                        <>
                          <button 
                            onClick={() => setOpenTaskMenu(openTaskMenu === task.id ? null : task.id)}
                            className="p-1.5 text-neutral-500 hover:bg-white/10 hover:text-white rounded transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openTaskMenu === task.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenTaskMenu(null)} />
                              <div className="absolute right-0 top-10 w-40 bg-[#18181B] border border-white/10 rounded shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                  onClick={() => { handleTaskComplete(task.id); setOpenTaskMenu(null); }} 
                                  className="w-full text-left px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-white/5 flex items-center gap-2"
                                >
                                  <CheckCircle2 size={12} />
                                  Mark Complete
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEODModal && (
        <EODReportModal
          totalMinutes={Math.floor(elapsedSeconds / 60)}
          onClose={() => setShowEODModal(false)}
          onSubmit={handleCheckoutSubmit}
        />
      )}
    </div>
  );
}
