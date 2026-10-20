import { useState, useEffect } from "react";
import { Download, Search, Filter, Mail, Phone, MapPin, ExternalLink, ShieldCheck, Users, Building2, Loader2, UserPlus, Crown } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { exportToExcel, exportToPDF } from "../../lib/exportUtils";
import EmployeeProfileModal from "./EmployeeProfileModal";
import AddEmployeeModal from "./AddEmployeeModal";

export default function EmployeeDirectoryPage() {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("hr_employees").select("*").order("full_name");
    const { data: tasksData } = await supabase.from("team_tasks").select("assignee_email, due_date, status");
    
    if (data) {
      const now = new Date();
      // Normalize current date for comparison (ignore time)
      now.setHours(0, 0, 0, 0);
      
      const enrichedData = data.map(emp => {
        let missedCount = 0;
        if (tasksData) {
          missedCount = tasksData.filter(t => {
            if (t.assignee_email !== emp.email || t.status === 'completed' || !t.due_date) return false;
            const dueDate = new Date(t.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < now;
          }).length;
        }
        return { ...emp, missedDeadlines: missedCount };
      });
      const sortedData = enrichedData.sort((a, b) => {
        const aIsCeo = a.role_level === "ceo" || a.role_title?.toLowerCase() === "ceo";
        const bIsCeo = b.role_level === "ceo" || b.role_title?.toLowerCase() === "ceo";
        if (aIsCeo && !bIsCeo) return -1;
        if (!aIsCeo && bIsCeo) return 1;
        return (a.full_name || "").localeCompare(b.full_name || "");
      });
      setEmployees(sortedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('hr_employees_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hr_employees' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const depts = ["All", ...new Set(employees.map(e => e.department))];

  const filtered = employees.filter(emp => {
    const matchesQuery = emp.full_name.toLowerCase().includes(query.toLowerCase()) || 
                         emp.role_title.toLowerCase().includes(query.toLowerCase());
    const matchesDept = deptFilter === "All" || emp.department === deptFilter;
    return matchesQuery && matchesDept;
  });

  const handleExportExcel = () => {
    const data = filtered.map(e => ({
      ID: e.id,
      Name: e.full_name,
      Email: e.email,
      Phone: e.phone,
      Department: e.department,
      Role: e.role_title,
      Status: e.status,
      Location: e.location,
      "Joined Date": e.joined_at,
    }));
    exportToExcel(data, "Tradifive_Employee_Directory");
  };

  const handleExportPDF = () => {
    const columns = ["Name", "Department", "Role", "Email", "Status"];
    const rows = filtered.map(e => [
      e.full_name,
      e.department,
      e.role_title,
      e.email,
      e.status.toUpperCase(),
    ]);
    exportToPDF(columns, rows, "Employee Directory", "Tradifive_Employee_Directory");
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Employee Directory</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Personnel Records & Contact Info
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-indigo-500/20">
            <UserPlus size={13} /> Add Employee
          </button>
          <div className="w-px h-4 bg-white/10 hidden sm:block mx-1" />
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1E1E1E] border border-white/5 hover:bg-white/[0.04] text-white text-[10px] font-bold uppercase tracking-widest rounded transition-none">
            <Download size={13} /> PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-none">
            <Download size={13} /> Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-[#1E1E1E] border border-white/5 rounded-xl">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees by name or role..."
            className="w-full bg-[#121212] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[12px] text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-neutral-500 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider outline-none"
          >
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-[12px] font-bold text-white uppercase tracking-widest">Loading Directory...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(emp => (
          <div 
            key={emp.id} 
            onClick={() => setSelectedEmployeeId(emp.id)}
            className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-indigo-500/30 hover:bg-white/[0.02] cursor-pointer transition-colors group flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: emp.avatar_color }} />
            
            <div className="flex items-start justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                {emp.role_level === "ceo" || emp.role_title?.toLowerCase() === "ceo" || emp.email === "ceo@tradifive.in" ? (
                  <img
                    src="/nikil_avatar.jpg"
                    alt={emp.full_name}
                    className="w-10 h-10 rounded object-cover shadow-lg"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-[12px] font-bold text-white shadow-lg"
                    style={{ background: emp.avatar_color }}
                  >
                    {emp.avatar_initials}
                  </div>
                )}
                <div>
                  <h3 className="text-[13px] font-bold text-white">{emp.full_name}</h3>
                  <p className="text-[10px] text-neutral-500">{emp.role_title}</p>
                </div>
              </div>
              {(emp.role_level === "ceo" || emp.role_title?.toLowerCase() === "ceo" || emp.role_title?.toLowerCase().includes("chief executive officer")) ? (
                <span title="Master CEO">
                  <Crown size={15} className="text-amber-500 fill-amber-500/20" />
                </span>
              ) : emp.role_level === "head" ? (
                <span title="Department Head">
                  <ShieldCheck size={14} className="text-yellow-500" />
                </span>
              ) : null}
            </div>

            <div className="space-y-2 mt-2 mb-4 flex-1">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Building2 size={12} className="text-neutral-600" />
                <span className="font-bold uppercase">{emp.department}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Mail size={12} className="text-neutral-600" />
                <span className="font-mono truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Phone size={12} className="text-neutral-600" />
                <span className="font-mono">{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <MapPin size={12} className="text-neutral-600" />
                <span>{emp.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-col gap-2 mt-auto">
              
              {emp.missedDeadlines >= 15 ? (
                <div className="w-full text-center bg-red-600/20 border border-red-500 text-red-500 font-bold text-[9px] uppercase tracking-widest py-1.5 rounded animate-pulse">
                  ⚠️ DISCIPLINARY REVIEW ({emp.missedDeadlines}/15 STRIKES)
                </div>
              ) : emp.missedDeadlines > 0 ? (
                <div className="w-full text-center bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-[9px] uppercase tracking-widest py-1 rounded">
                  {emp.missedDeadlines}/15 MISSED DEADLINES
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {emp.skills.slice(0, 2).map((s: string, i: number) => (
                    <span key={i} className="text-[8px] bg-white/[0.03] border border-white/5 px-1.5 py-0.5 rounded text-neutral-500 uppercase tracking-widest truncate max-w-[60px]">
                      {s}
                    </span>
                  ))}
                  {emp.skills.length > 2 && (
                    <span className="text-[8px] bg-white/[0.03] border border-white/5 px-1.5 py-0.5 rounded text-neutral-500 uppercase tracking-widest">
                      +{emp.skills.length - 2}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                  emp.status === "active" ? "text-emerald-500 bg-emerald-500/10" :
                  emp.status === "on_leave" ? "text-amber-500 bg-amber-500/10" : "text-red-500 bg-red-500/10"
                }`}>
                  {emp.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-lg">
          <Users size={32} className="mx-auto text-neutral-600 mb-4" />
          <p className="text-[12px] font-bold text-white uppercase tracking-widest">No employees found</p>
          <p className="text-[10px] text-neutral-500 mt-2">Try adjusting your search query or department filter.</p>
        </div>
      )}
        </>
      )}
      </div>

      {/* Profile Modal */}
      {selectedEmployeeId && (
        <EmployeeProfileModal 
          employeeId={selectedEmployeeId} 
          onClose={() => setSelectedEmployeeId(null)} 
          onSuccess={load}
        />
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            load();
          }}
        />
      )}
    </>
  );
}
