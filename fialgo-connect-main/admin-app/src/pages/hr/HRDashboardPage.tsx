import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Building2, Users, UserPlus, CalendarDays, TrendingUp,
  ArrowRight, CheckCircle, AlertCircle, Clock, Star,
} from "lucide-react";
import ClearanceCodeManagement from "../../components/ClearanceCodeManagement";
import DepartmentKeysManagement from "../../components/DepartmentKeysManagement";

export default function HRDashboardPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [empRes, candRes, attRes] = await Promise.all([
          supabase.from("hr_employees").select("*"),
          supabase.from("hr_candidates").select("*"),
          supabase.from("hr_attendance").select("*")
        ]);

        if (empRes.data) setEmployees(empRes.data);
        if (candRes.data) setCandidates(candRes.data);
        if (attRes.data) setAttendance(attRes.data);
      } catch (err) {
        console.warn("HR tables might be missing:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const activeEmployees = employees.filter(e => e.status === "active").length;
  const onLeave = employees.filter(e => e.status === "on_leave").length;
  const openRoles = candidates.filter(c => c.stage === "applied" || c.stage === "interview").length;
  const newHires = candidates.filter(c => c.stage === "hired").length;

  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === "present" || a.status === "late").length;
  const absentToday = todayAttendance.filter(a => a.status === "absent").length;

  const depts = [...new Set(employees.map(e => e.department))];
  const deptStats = depts.map(d => ({
    name: d,
    count: employees.filter(e => e.department === d).length,
    active: employees.filter(e => e.department === d && e.status === "active").length,
  }));

  const topPerformers = [...employees]
    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    .slice(0, 5);

  const recentActivity = [
    { text: "Dashboard connected to live DB", time: "Just now", type: "hire", dept: "System" },
  ]; // Can be replaced with actual activity log table later

  const stats = [
    { label: "Total Employees", value: employees.length, icon: Users, color: "#6366f1", sub: `${activeEmployees} active` },
    { label: "Open Positions", value: openRoles, icon: UserPlus, color: "#a855f7", sub: "Actively hiring" },
    { label: "Present Today", value: presentToday, icon: CalendarDays, color: "#10b981", sub: `${absentToday} absent` },
    { label: "New Hires (30d)", value: newHires, icon: Star, color: "#f59e0b", sub: "This month" },
  ];

  if (loading) {
    return <div className="text-neutral-500 p-10 flex justify-center uppercase tracking-widest text-[10px] font-bold">Loading HR Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">HR Dashboard</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            People & Talent Operations
          </p>
        </div>
        <button
          onClick={() => navigate("/hr/hiring")}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg transition-none shadow-lg shadow-purple-500/20"
        >
          <UserPlus size={13} />
          Add Candidate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center shrink-0" style={{ borderColor: `${s.color}20` }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mb-1">{s.value}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">{s.label}</p>
            <p className="text-[9px] text-neutral-500 mt-1 truncate">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Department breakdown */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={13} className="text-neutral-600" /> By Department
            </h3>
          </div>
          <div className="space-y-3">
            {deptStats.map(dept => {
              const pct = (dept.active / dept.count) * 100;
              const colors: Record<string, string> = {
                "Executive": "#f59e0b",
                "Technology": "#6366f1",
                "Risk & Trading": "#ef4444",
                "Operations": "#10b981",
                "Support": "#3b82f6",
                "HR": "#a855f7",
              };
              const color = colors[dept.name] || "#64748b";
              return (
                <div key={dept.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-neutral-400">{dept.name}</span>
                    <span className="text-[10px] text-neutral-600 font-bold">{dept.count} people</span>
                  </div>
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top performers */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <TrendingUp size={13} className="text-neutral-700" /> Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-neutral-700 w-4">#{i + 1}</span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ background: emp.avatar_color }}
                >
                  {emp.avatar_initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{emp.full_name}</p>
                  <p className="text-[8px] text-neutral-700 truncate">{emp.role_title}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black" style={{ color: emp.performance_score >= 90 ? "#10b981" : "#f59e0b" }}>
                    {emp.performance_score}
                  </p>
                  <p className="text-[7px] text-neutral-700">SCORE</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Clock size={13} className="text-neutral-700" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${act.type === "hire" ? "bg-green-500" : act.type === "leave" ? "bg-yellow-500" : "bg-indigo-500"
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-neutral-400 leading-relaxed">{act.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-neutral-700">{act.time}</span>
                    <span className="text-[7px] font-bold text-neutral-700 uppercase tracking-wider">· {act.dept}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Employee Directory", desc: "View all team members", path: "/hr/employees", icon: Users, color: "#6366f1" },
          { label: "Hiring Pipeline", desc: `${openRoles} candidates active`, path: "/hr/hiring", icon: UserPlus, color: "#a855f7" },
          { label: "Attendance Records", desc: "Monthly view & reports", path: "/hr/attendance", icon: CalendarDays, color: "#10b981" },
        ].map(link => (
          <button
            key={link.label}
            onClick={() => navigate(link.path)}
            className="bg-[#1E1E1E] border border-white/5 hover:border-white/10 rounded-lg p-4 flex items-center gap-4 text-left transition-none group"
          >
            <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center shrink-0" style={{ borderColor: `${link.color}20` }}>
              <link.icon size={16} style={{ color: link.color }} />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-white">{link.label}</p>
              <p className="text-[9px] text-neutral-600">{link.desc}</p>
            </div>
            <ArrowRight size={14} className="text-neutral-700 group-hover:text-white transition-none" />
          </button>
        ))}
      </div>

      {/* Security & Access Management */}
      <ClearanceCodeManagement />
      <DepartmentKeysManagement />
    </div>
  );
}
