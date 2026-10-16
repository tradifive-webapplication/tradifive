import { useState, useEffect } from "react";
import { Download, Filter, CalendarDays, CheckCircle2, XCircle, AlertCircle, Calendar as CalIcon, Loader2, Plus, Clock, LayoutList, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { exportToExcel } from "../../lib/exportUtils";
import LogAttendanceModal from "./LogAttendanceModal";

export default function AttendancePage() {
  const [deptFilter, setDeptFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("current"); // current, prev
  const [viewTab, setViewTab] = useState<"daily" | "sessions">("daily");
  
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const [empRes, attRes, sessRes] = await Promise.all([
      supabase.from("hr_employees").select("id, full_name, department").order("full_name"),
      supabase.from("hr_attendance").select("*"),
      supabase.from("hr_session_logs").select("*").order("login_time", { ascending: false })
    ]);
    if (empRes.data) setEmployeesData(empRes.data);
    if (attRes.data) setAttendanceData(attRes.data);
    if (sessRes.data) setSessionData(sessRes.data);
    setLoading(false);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session log?")) return;
    try {
      setLoading(true);
      const { error } = await supabase.from("hr_session_logs").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (err: any) {
      alert("Error deleting session: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('hr_attendance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hr_attendance' }, () => {
        load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hr_session_logs' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const depts = ["All", ...new Set([...employeesData.map(e => e.department), ...sessionData.map(s => s.department)])];

  const employees = employeesData.filter(e => deptFilter === "All" || e.department === deptFilter);

  // Generate an array of dates for the view (e.g., last 15 days)
  const today = new Date();
  const dates = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (14 - i));
    return d.toISOString().split("T")[0];
  });

  const getStatus = (empId: string, dateStr: string) => {
    const record = attendanceData.find(a => a.employee_id === empId && a.date === dateStr);
    return record?.status || "unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
      case "absent": return "bg-red-500/20 border-red-500/50 text-red-400";
      case "late": return "bg-amber-500/20 border-amber-500/50 text-amber-400";
      case "on_leave": return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      case "holiday": return "bg-white/[0.05] border-white/10 text-neutral-500";
      default: return "bg-black/20 border-white/5 text-neutral-700";
    }
  };

  const handleExportExcel = () => {
    const data = employees.map(emp => {
      const row: any = { Name: emp.full_name, Department: emp.department };
      dates.forEach(date => {
        row[date] = getStatus(emp.id, date).toUpperCase();
      });
      return row;
    });
    exportToExcel(data, "Tradifive_Attendance_Report");
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Attendance Log</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Time Tracking & Presence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowLogModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-indigo-500/20">
            <Plus size={13} /> Log Record
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-none">
            <Download size={13} /> Export Report
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button 
          onClick={() => setViewTab("daily")}
          className={`flex items-center gap-2 px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-colors ${viewTab === "daily" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}
        >
          <CalendarDays size={14} /> Daily Status
        </button>
        <button 
          onClick={() => setViewTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-colors ${viewTab === "sessions" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}
        >
          <Clock size={14} /> Session Logs
        </button>
      </div>

      {/* Filters & Legend */}
      <div className="flex items-center justify-between p-4 bg-[#1E1E1E] border border-white/5 rounded-lg shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-neutral-500" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#121212] border border-white/5 rounded px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider outline-none"
            >
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {viewTab === "daily" && (
            <div className="flex items-center gap-2">
              <CalIcon size={14} className="text-neutral-500" />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-[#121212] border border-white/5 rounded px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider outline-none"
              >
                <option value="current">Last 15 Days</option>
                <option value="prev">Previous Month</option>
              </select>
            </div>
          )}
        </div>

        {viewTab === "daily" && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mr-2">Legend:</span>
            {[
              { label: "Present", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" },
              { label: "Late", color: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
              { label: "Leave", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
              { label: "Absent", color: "bg-red-500/20 text-red-400 border-red-500/50" },
              { label: "Holiday", color: "bg-white/[0.05] text-neutral-500 border-white/10" },
            ].map(l => (
              <div key={l.label} className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-widest ${l.color}`}>
                {l.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-[#1E1E1E] border border-white/5 rounded-lg">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-[12px] font-bold text-white uppercase tracking-widest">Loading Attendance Records...</p>
        </div>
      ) : (
        <>
          {viewTab === "daily" && (
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-x-auto flex-1 min-h-0">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-[#121212] sticky top-0 z-10 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest sticky left-0 bg-[#121212] border-r border-white/5 z-20 w-[200px]">
                      Employee
                    </th>
                    {dates.map(date => {
                      const d = new Date(date);
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <th key={date} className={`px-2 py-2 text-center border-r border-white/5 last:border-r-0 min-w-[40px] ${isWeekend ? 'bg-white/[0.02]' : ''}`}>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-neutral-600 font-bold uppercase">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                            <span className={`text-[11px] font-bold ${isWeekend ? 'text-neutral-600' : 'text-neutral-300'}`}>{d.getDate()}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-white/[0.01] transition-none">
                      <td className="px-4 py-3 sticky left-0 bg-[#1E1E1E] border-r border-white/5 z-10 group-hover:bg-[#222222]">
                        <p className="text-[11px] font-bold text-white truncate">{emp.full_name}</p>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-wider truncate">{emp.department}</p>
                      </td>
                      {dates.map(date => {
                        const status = getStatus(emp.id, date);
                        const colorClass = getStatusColor(status);
                        const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
                        return (
                          <td key={date} className={`px-1 py-1 text-center border-r border-white/5 last:border-r-0 ${isWeekend ? 'bg-white/[0.02]' : ''}`}>
                            <div className={`w-6 h-6 mx-auto rounded border flex items-center justify-center ${colorClass}`} title={`${emp.full_name} - ${date} (${status})`}>
                              {status === "present" && <CheckCircle2 size={12} />}
                              {status === "absent" && <XCircle size={12} />}
                              {status === "late" && <AlertCircle size={12} />}
                              {status === "on_leave" && <CalendarDays size={12} />}
                              {status === "holiday" && <span className="text-[8px] font-black">H</span>}
                              {status === "unknown" && <span className="text-[10px]">-</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewTab === "sessions" && (
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#121212] sticky top-0 z-10 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-r border-white/5">User</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-r border-white/5">Login Time</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-r border-white/5">Logout Time</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-r border-white/5">Total Duration</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-r border-white/5">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessionData.filter(s => deptFilter === "All" || s.department === deptFilter).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-neutral-500 text-[11px] font-bold uppercase tracking-widest">
                        No session logs found
                      </td>
                    </tr>
                  ) : (
                    sessionData.filter(s => deptFilter === "All" || s.department === deptFilter).map(session => {
                      const isActive = !session.logout_time;
                      return (
                        <tr key={session.id} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 border-r border-white/5">
                            <p className="text-[11px] font-bold text-white">{session.full_name}</p>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{session.department}</p>
                          </td>
                          <td className="px-4 py-3 border-r border-white/5 text-[11px] text-neutral-300 font-medium">
                            {new Date(session.login_time).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 border-r border-white/5 text-[11px] text-neutral-500">
                            {session.logout_time ? new Date(session.logout_time).toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-3 border-r border-white/5 text-[11px] font-bold text-white">
                            {session.duration_minutes !== null ? `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m` : "-"}
                          </td>
                          <td className="px-4 py-3 border-r border-white/5">
                            {isActive ? (
                              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded w-fit uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Session
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Completed</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showLogModal && (
        <LogAttendanceModal 
          onClose={() => setShowLogModal(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
