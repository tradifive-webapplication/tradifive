import { useState, useEffect } from "react";
import { Download, Search, Filter, DollarSign, ArrowUpRight, TrendingUp, Building2, Users, Loader2, Check, X, Edit2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { exportToExcel } from "../../lib/exportUtils";
import EmployeePayslipModal from "./EmployeePayslipModal";

export default function PayrollPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSalary, setEditSalary] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("hr_employees").select("*").order("department").order("full_name");
    if (data) setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('hr_payroll_changes')
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

  const totalPayroll = filtered.reduce((acc, emp) => acc + (Number(emp.salary) || 0), 0);
  const averageSalary = filtered.length > 0 ? totalPayroll / filtered.length : 0;

  const handleExportExcel = () => {
    const data = filtered.map(e => ({
      ID: e.id,
      Name: e.full_name,
      Department: e.department,
      Role: e.role_title,
      "Base Salary": e.salary,
      Status: e.status
    }));
    exportToExcel(data, "Tradifive_Payroll_Report");
  };

  const handleSaveSalary = async (id: string) => {
    setSavingId(id);
    try {
      const newSalary = parseFloat(editSalary);
      const { error } = await supabase
        .from("hr_employees")
        .update({ salary: isNaN(newSalary) ? null : newSalary })
        .eq("id", id);
      
      if (error) throw error;
      
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, salary: isNaN(newSalary) ? null : newSalary } : emp));
      setEditingId(null);
    } catch (err) {
      console.error("Error updating salary:", err);
      alert("Failed to update salary");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Payroll & Compensation</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Salary Management & Budgets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-none">
            <Download size={13} /> Export Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0">
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-indigo-500/10 to-transparent" />
          <div className="flex items-start justify-between mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp size={10} /> Active
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 relative z-10">Total Annual Payroll</p>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight relative z-10">${totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <div className="flex items-start justify-between mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 relative z-10">Average Salary</p>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight relative z-10">${averageSalary.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-amber-500/10 to-transparent" />
          <div className="flex items-start justify-between mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 relative z-10">Employees in Payroll</p>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight relative z-10">{filtered.length}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-[#1E1E1E] border border-white/5 rounded-xl shrink-0">
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

      {/* Payroll Table */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-[#1E1E1E] border border-white/5 rounded-lg">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-[12px] font-bold text-white uppercase tracking-widest">Loading Payroll Data...</p>
        </div>
      ) : (
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden flex-1 min-h-0">
          {/* Mobile Touch Cards */}
          <div className="md:hidden divide-y divide-white/5 overflow-y-auto max-h-[600px]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-[11px] font-bold uppercase tracking-widest">
                No employees found in the payroll.
              </div>
            ) : (
              filtered.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="p-3.5 space-y-3 hover:bg-white/[0.02] cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0"
                        style={{ background: emp.avatar_color }}
                      >
                        {emp.avatar_initials}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white">{emp.full_name}</p>
                        <p className="text-[9px] text-neutral-500 truncate max-w-[160px]">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {editingId === emp.id ? (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleSaveSalary(emp.id)}
                            disabled={savingId === emp.id}
                            className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                          >
                            {savingId === emp.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            disabled={savingId === emp.id}
                            className="p-1.5 rounded bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setEditingId(emp.id);
                            setEditSalary(emp.salary ? emp.salary.toString() : "");
                          }}
                          className="p-1.5 rounded text-neutral-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">{emp.department}</span>
                      <span className="text-neutral-300 font-medium text-[10px]">{emp.role_title}</span>
                    </div>
                    <div className="text-right" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Base Salary</span>
                      {editingId === emp.id ? (
                        <input
                          type="number"
                          value={editSalary}
                          onChange={(e) => setEditSalary(e.target.value)}
                          className="w-[90px] bg-[#121212] border border-indigo-500/50 rounded px-1.5 py-0.5 text-[11px] text-white outline-none text-right font-mono"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveSalary(emp.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-400 font-mono">
                          {emp.salary ? `$${Number(emp.salary).toLocaleString()}` : <span className="text-neutral-600 italic font-sans text-[10px]">Not Set</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#121212] sticky top-0 z-10 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Department & Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Base Salary (Annual)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest w-[100px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(emp => (
                  <tr 
                    key={emp.id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0"
                          style={{ background: emp.avatar_color }}
                        >
                          {emp.avatar_initials}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-white">{emp.full_name}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 size={12} className="text-neutral-500" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{emp.department}</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 pl-5">{emp.role_title}</p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {editingId === emp.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-neutral-500">$</span>
                          <input
                            type="number"
                            value={editSalary}
                            onChange={(e) => setEditSalary(e.target.value)}
                            className="w-[120px] bg-[#121212] border border-indigo-500/50 rounded px-2 py-1 text-[13px] text-white outline-none text-right"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSalary(emp.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-[13px] font-bold text-emerald-400 font-mono">
                          {emp.salary ? `$${Number(emp.salary).toLocaleString()}` : <span className="text-neutral-600 italic font-sans text-[11px]">Not Set</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        {editingId === emp.id ? (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleSaveSalary(emp.id)}
                              disabled={savingId === emp.id}
                              className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                            >
                              {savingId === emp.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              disabled={savingId === emp.id}
                              className="p-1.5 rounded bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30 transition-colors disabled:opacity-50"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(emp.id);
                              setEditSalary(emp.salary ? emp.salary.toString() : "");
                            }}
                            className="p-1.5 rounded text-neutral-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 text-[12px]">
                      No employees found in the payroll.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslip History Modal */}
      {selectedEmployee && (
        <EmployeePayslipModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
        />
      )}
    </div>
  );
}
