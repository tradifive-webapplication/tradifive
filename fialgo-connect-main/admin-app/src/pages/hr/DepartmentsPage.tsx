import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DEPARTMENT_ORDER } from "../../lib/rbac";

const DEPT_LABELS: Record<string, string> = {
  "Technology": "Technology (CTO)",
  "HR & People": "HR & People (CHRO)",
  "Support": "Support (Head of Support)",
  "Sales": "Sales (Head of Sales)",
  "Operations": "Operations (COO)",
  "Executive": "Executive (CEO)",
  "Trading & Risk": "Trading & Risk (CRO)",
  "Finance & Compliance": "Finance & Compliance (CFO)",
  "Content & Marketing": "Content & Marketing (CMO)",
  "Mentors": "Mentors (Head of Mentors)"
};
import { supabase } from "../../lib/supabase";
import {
  Building2, Users, Search, Plus, 
  MoreVertical, X, Sparkles, KeyRound,
  Mail, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { getGroupedNavForRole } from "../../lib/rbac";

export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newHeadLabel, setNewHeadLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function fetchDepartments() {
    setLoading(true);
    try {
      // Fetch admin profiles, active department keys, and actual employee directory
      const [profilesRes, keysRes, employeesRes] = await Promise.all([
        supabase.from("admin_profiles").select("*"),
        supabase.from("department_access_keys").select("*"),
        supabase.from("hr_employees").select("*")
      ]);

      if (profilesRes.data) {
        setAdmins(profilesRes.data);
        processData(profilesRes.data, keysRes.data || [], employeesRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  function processData(adminList: any[], keysList: any[], employeeList: any[]) {
    const ALLOWED_DEPARTMENTS = [
      "Technology", "HR & People", "Support", "Sales", "Operations", 
      "Executive", "Trading & Risk", "Finance & Compliance", "Content & Marketing", "Mentors"
    ];

    const deptMap: Record<string, { total: number, active: number, keys: string[] }> = {};
    
    // Initialize the allowed signup departments so they always show up by default
    ALLOWED_DEPARTMENTS.forEach(dept => {
      deptMap[dept] = { total: 0, active: 0, keys: [] };
    });

    // Initialize departments from generated keys
    keysList.forEach(k => {
      if (k.department && k.is_active) {
        const d = k.department;
        if (!deptMap[d]) deptMap[d] = { total: 0, active: 0, keys: [] };
        if (!deptMap[d].keys.includes(k.key_code)) {
          deptMap[d].keys.push(k.key_code);
        }
      }
    });

    // 2. Populate counts from actual employee directory (hr_employees table)
    employeeList.forEach(emp => {
      let d = emp.department;
      if (!d) return;
      if (d === "HR") d = "HR & People";
      
      if (!deptMap[d]) deptMap[d] = { total: 0, active: 0, keys: [] };
      deptMap[d].total++;
      if (emp.status === "active" || emp.status === "on_leave") {
        deptMap[d].active++;
      }
    });

    // First pass: check if we should use adminList as fallback (i.e. if employee list doesn't have anyone for this dept)
    adminList.forEach(admin => {
      let d = admin.department;
      if (!d || d === "Unassigned") return;
      if (d === "HR") d = "HR & People";
      
      if (!deptMap[d]) deptMap[d] = { total: 0, active: 0, keys: [] };
      
      // We only count admins if there are NO employees found for this department yet
      const deptEmployees = employeeList.filter(e => {
        let ed = e.department;
        if (ed === "HR") ed = "HR & People";
        return ed === d;
      });
      
      if (deptEmployees.length === 0) {
        deptMap[d].total++;
        if (admin.is_active !== false && admin.is_suspended !== true) {
          deptMap[d].active++;
        }
      }
    });

    const deptArray = Object.keys(deptMap).map(name => {
      // Find head of department in hr_employees first
      const deptEmployees = employeeList.filter(e => {
        let d = e.department;
        if (d === "HR") d = "HR & People";
        return d === name;
      });

      let manager = "Pending Assignment";

      // 1. Search for head in hr_employees
      const empHead = deptEmployees.find(e => 
        e.role_level === "head" || 
        e.role_level === "ceo" ||
        e.role_title?.toLowerCase() === "ceo" ||
        e.role_title?.toLowerCase().includes("chief executive officer") ||
        e.role_title?.toLowerCase().includes("head of") ||
        e.role_title?.toLowerCase().includes("manager")
      );

      // Get deptAdmins for the department regardless of whether empHead is found
      const deptAdmins = adminList.filter(e => {
        let d = e.department;
        if (d === "HR") d = "HR & People";
        return d === name;
      });

      if (empHead) {
        manager = empHead.full_name;
      } else {
        // 2. Fallback to admins list
        const adminHead = deptAdmins.find(e => 
          e.role === "ceo" ||
          e.role === "hr_manager" || 
          e.role === "technical_lead" || 
          e.role === "operations_executive" || 
          e.role === "support_executive" ||
          e.role === "risk_executive" ||
          e.role === "finance_executive" ||
          e.role === "community_manager"
        );

        if (adminHead) {
          manager = adminHead.full_name;
        } else if (deptEmployees.length > 0) {
          manager = deptEmployees[0].full_name; // Fallback to first employee
        } else if (deptAdmins.length > 0) {
          manager = deptAdmins[0].full_name; // Fallback to first admin
        }
      }

      return {
        id: name,
        name,
        total_employees: deptMap[name].total,
        active_employees: deptMap[name].active,
        manager,
        keys: deptMap[name].keys,
        admins: deptAdmins,
        employees: deptEmployees
      };
    });

    const sortedDepts = deptArray.sort((a, b) => {
      if (a.name === "Executive") return -1;
      if (b.name === "Executive") return 1;
      return a.name.localeCompare(b.name);
    });

    setDepartments(sortedDepts);
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newHeadLabel.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      // Generate a dynamic Department Access Key for the new department
      const deptPrefix = newDeptName.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const randomNums = Math.floor(1000 + Math.random() * 9000);
      const keyCode = `TDF-${deptPrefix}-${randomNums}`;

      const { error } = await supabase.from("department_access_keys").insert({
        key_code: keyCode,
        department: newDeptName.trim(),
        label: newHeadLabel.trim(),
        is_active: true
      });

      if (error) {
        toast.error("Failed to create department: " + error.message);
      } else {
        toast.success(`Department "${newDeptName}" established successfully!`);
        setCreatedKey(keyCode);
        // Reload list
        fetchDepartments();
      }
    } catch (err: any) {
      toast.error("An error occurred: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1200px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Departments</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Organization Structure
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedKey(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded transition-none w-fit"
        >
          <Plus size={13} />
          New Department
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#1E1E1E] p-3 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-neutral-500 p-10 flex justify-center uppercase tracking-widest text-[10px] font-bold">
          Loading Departments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredDepts.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDept(dept)}
              className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none relative group cursor-pointer"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-none">
                <button className="p-1 text-neutral-500 hover:text-white transition-none">
                  <MoreVertical size={14} />
                </button>
              </div>

              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Building2 size={18} className="text-indigo-400" />
              </div>
              
              <h3 className="text-white font-bold text-sm tracking-wide">{DEPT_LABELS[dept.name] || dept.name}</h3>
              <p className="text-[10px] text-neutral-500 mb-2 flex items-center gap-1.5">
                <Users size={10} /> Head: <span className="text-neutral-300 font-bold">{dept.manager}</span>
              </p>

              {dept.keys && dept.keys.length > 0 && (
                <div className="mb-4 mt-2 p-2 bg-black/30 border border-white/5 rounded">
                  <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <KeyRound size={8} /> Active Signup Keys
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {dept.keys.map((k: string) => (
                      <span key={k} className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[18px] font-black text-white leading-none">{dept.active_employees}</p>
                  <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Active Admins</p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-black text-neutral-400 leading-none">{dept.total_employees}</p>
                  <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Total Registered</p>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredDepts.length === 0 && (
            <div className="col-span-3 text-center py-10 border border-white/5 border-dashed rounded-lg">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">No departments found</p>
            </div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1E1E1E] border border-white/10 rounded-xl w-full max-w-[460px] p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="text-indigo-400" size={16} />
              </div>
              <div>
                <h3 className="text-white text-[12px] font-bold uppercase tracking-widest">Establish Department</h3>
                <p className="text-neutral-500 text-[10px] mt-0.5">Register organization segment & generate signup key</p>
              </div>
            </div>

            {createdKey ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="text-emerald-400" size={20} />
                </div>
                <h4 className="text-white text-sm font-bold">Signup Key Generated!</h4>
                <p className="text-neutral-400 text-[10px] max-w-xs mx-auto leading-relaxed">
                  Provide this key code to the department head so they can register their account under the new department.
                </p>
                <div className="p-4 bg-black/40 border border-white/5 rounded-lg select-all">
                  <p className="text-lg font-mono font-bold text-emerald-400 tracking-wider">
                    {createdKey}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
                >
                  Finished
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest px-1">Department Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Marketing / Product"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded py-2 px-3 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 pt-4 border-t border-white/5">
                  <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest px-1">Key Holder Label (e.g. Navin / CMO)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Navin Kumar (CMO)"
                    value={newHeadLabel}
                    onChange={(e) => setNewHeadLabel(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded py-2 px-3 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50"
                  >
                    {creating ? "Generating Key..." : "Generate Signup Key"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Department Details Modal */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1E1E1E] border border-white/10 rounded-xl w-full max-w-[500px] p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedDept(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Building2 className="text-indigo-400" size={20} />
              </div>
              <div>
                <h3 className="text-white text-[16px] font-bold tracking-wide">
                  {DEPT_LABELS[selectedDept.name] || selectedDept.name}
                </h3>
                <p className="text-neutral-500 text-[10px] mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={10} /> Head: <span className="text-neutral-300 font-bold">{selectedDept.manager}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#121212] border border-white/5 rounded-lg">
                <p className="text-[20px] font-black text-white leading-none">{selectedDept.active_employees}</p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1.5">Active Admins</p>
              </div>
              <div className="p-4 bg-[#121212] border border-white/5 rounded-lg">
                <p className="text-[20px] font-black text-neutral-400 leading-none">{selectedDept.total_employees}</p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1.5">Total Registered</p>
              </div>
            </div>

            <div className="space-y-6">
              {selectedDept.keys && selectedDept.keys.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">Active Signup Keys</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDept.keys.map((k: string) => (
                      <div key={k} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded flex items-center gap-1.5">
                        <KeyRound size={10} className="text-indigo-400" />
                        <span className="text-[10px] font-mono font-bold text-indigo-400">{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDept.admins && selectedDept.admins.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">Registered Admins</h4>
                  <div className="space-y-2">
                    {selectedDept.admins.map((admin: any) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-[#121212] border border-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
                            {admin.avatar_url ? (
                              <img src={admin.avatar_url} alt={admin.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <Users size={12} className="text-neutral-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] text-white font-bold">{admin.full_name}</p>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">{admin.role.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`mailto:${admin.email || 'admin@tradifive.in'}`}
                            className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/30 transition-colors"
                            title={`Message ${admin.full_name}`}
                          >
                            <MessageCircle size={12} />
                          </a>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${admin.is_suspended ? 'bg-red-500/10 text-red-400' : (admin.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400')}`}>
                            {admin.is_suspended ? 'Suspended' : (admin.is_active ? 'Active' : 'Inactive')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedDept.admins || selectedDept.admins.length === 0) && (
                <div className="text-center py-8 border border-white/5 border-dashed rounded-lg bg-[#121212]">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No registered admins yet</p>
                </div>
              )}

              <div>
                <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">Department Employees</h4>
                
                {selectedDept.employees && selectedDept.employees.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDept.employees.map((emp: any) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-[#121212] border border-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
                            <Users size={12} className="text-neutral-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-white font-bold">{emp.full_name}</p>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">{emp.role_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {emp.email && (
                            <a 
                              href={`mailto:${emp.email}`}
                              className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/30 transition-colors"
                              title={`Message ${emp.full_name}`}
                            >
                              <MessageCircle size={12} />
                            </a>
                          )}
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${emp.status === 'on_leave' ? 'bg-amber-500/10 text-amber-400' : (emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400')}`}>
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-white/5 border-dashed rounded-lg bg-[#121212]">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No employees assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
