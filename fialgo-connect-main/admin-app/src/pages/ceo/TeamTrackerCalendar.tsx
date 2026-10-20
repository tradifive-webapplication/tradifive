import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, FileText, CheckCircle2, ChevronLeft, ChevronRight, User } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function TeamTrackerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

      try {
        const [logsRes, reportsRes, tasksRes] = await Promise.all([
          supabase.from("team_time_logs").select("*").gte("date", startOfMonth).lte("date", endOfMonth),
          supabase.from("team_eod_reports").select("*").gte("date", startOfMonth).lte("date", endOfMonth),
          supabase.from("team_tasks").select("*") // Fetch all for simplicity, or could filter by completion date
        ]);

        setLogs(logsRes.data || []);
        setReports(reportsRes.data || []);
        setTasks(tasksRes.data || []);
      } catch (error) {
        console.error("Error fetching team tracking data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDate]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const formatMinutes = (mins: number) => {
    if (!mins) return "0h 0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getLogsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return logs.filter(l => l.date === dateStr);
  };

  const getReportsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return reports.filter(r => r.date === dateStr);
  };

  const getTasksCompletedForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return tasks.filter(t => t.status === 'completed' && t.completed_at?.startsWith(dateStr));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Team Tracker Calendar</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Monitor Employee Attendance, Hours & EOD Reports
          </p>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays size={18} className="text-indigo-400" />
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="p-1.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid with Mobile Scroll Safety */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[550px] md:min-w-0 grid grid-cols-7 gap-1.5 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest pb-1 sm:pb-2">
                {d}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
               <div key={`empty-${i}`} className="h-20 sm:h-24 bg-white/[0.02] rounded-lg border border-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayLogs = getLogsForDay(day);
              const totalMins = dayLogs.reduce((acc, log) => acc + (log.total_minutes || 0), 0);
              const hasReports = getReportsForDay(day).length > 0;
              
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-lg border cursor-pointer flex flex-col ${
                    selectedDay === day ? 'bg-indigo-500/20 border-indigo-500' : 
                    dayLogs.length > 0 ? 'bg-black/40 border-white/10 hover:border-white/20' : 
                    'bg-black/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="text-[11px] sm:text-[12px] font-bold text-white mb-auto">{day}</div>
                  {dayLogs.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-neutral-400 bg-white/5 px-1 sm:px-1.5 py-0.5 rounded">
                        <span className="flex items-center gap-1"><User size={9}/> {dayLogs.length}</span>
                        <span className="flex items-center gap-1 text-emerald-400"><Clock size={9}/> {formatMinutes(totalMins)}</span>
                      </div>
                      {hasReports && (
                        <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-wider">
                          <FileText size={8} /> EOD
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/5">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-400" />
              Activity for {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString()}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold">
              Close
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {(() => {
              const dayLogs = getLogsForDay(selectedDay);
              const dayReports = getReportsForDay(selectedDay);
              const completedTasks = getTasksCompletedForDay(selectedDay);
              
              if (dayLogs.length === 0 && completedTasks.length === 0) {
                return <div className="text-center text-neutral-500 text-[11px] py-4">No activity recorded for this day.</div>;
              }

              return dayLogs.map(log => {
                const report = dayReports.find(r => r.employee_email === log.employee_email);
                const userTasks = completedTasks.filter(t => t.assignee_email === log.employee_email);
                
                return (
                  <div key={log.id} className="bg-black/30 border border-white/5 rounded-xl p-3.5 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                          <User size={14} className="text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-white truncate max-w-[200px] sm:max-w-none">{log.employee_email}</p>
                          <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">
                            Total Time: {formatMinutes(log.total_minutes)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right font-mono text-[9px] sm:text-[10px] text-neutral-400">
                        <span>In: {new Date(log.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="mx-2">•</span>
                        <span>Out: {log.check_out ? new Date(log.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <FileText size={10} /> End of Day Report
                        </h4>
                        {report ? (
                          <p className="text-[11px] text-neutral-300 bg-white/5 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                            {report.report_text}
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-500/70 italic">No report filed yet.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Tasks Completed
                        </h4>
                        {userTasks.length > 0 ? (
                          <div className="space-y-2">
                            {userTasks.map(t => (
                              <div key={t.id} className="text-[11px] text-white flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> {t.title}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-500 italic">No tasks marked complete today.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>
      )}
    </div>
  );
}
