import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Building2, Calendar, ShieldCheck, Briefcase, Activity, CheckCircle2, Clock, Crown } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface EmployeeProfileModalProps {
  employeeId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EmployeeProfileModal({ employeeId, onClose, onSuccess }: EmployeeProfileModalProps) {
  const [employee, setEmployee] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [directReports, setDirectReports] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>(["Technology", "HR & People", "Support", "Operations", "Executive"]);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role_title: "",
    department: "",
    location: "",
    email: "",
    phone: "",
    role_level: "ic",
  });

  async function loadData() {
    setLoading(true);

    // Fetch employee
    const { data: emp } = await supabase
      .from("hr_employees")
      .select("*")
      .eq("id", employeeId)
      .single();
    
    if (emp) {
      setEmployee(emp);
      setEditForm({
        full_name: emp.full_name || "",
        role_title: emp.role_title || "",
        department: emp.department || "",
        location: emp.location || "",
        email: emp.email || "",
        phone: emp.phone || "",
        role_level: emp.role_level || "ic",
      });

      // Fetch manager
      if (emp.reporting_to) {
        const { data: mgr } = await supabase
          .from("hr_employees")
          .select("id, full_name, role_title, avatar_initials, avatar_color")
          .eq("id", emp.reporting_to)
          .single();
        setManager(mgr);
      } else {
        setManager(null);
      }

      // Fetch direct reports
      const { data: reports } = await supabase
        .from("hr_employees")
        .select("id, full_name, role_title, avatar_initials, avatar_color")
        .eq("reporting_to", emp.id);
      setDirectReports(reports || []);

      // Fetch attendance (last 5 records)
      const { data: att } = await supabase
        .from("hr_attendance")
        .select("*")
        .eq("employee_id", emp.id)
        .order("date", { ascending: false })
        .limit(5);
      setAttendance(att || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
    
    async function loadDepts() {
      const { data } = await supabase.from("department_access_keys").select("department");
      if (data) {
        const uniqueDepts = Array.from(new Set([
          "Technology",
          "HR & People",
          "Support",
          "Operations",
          "Executive",
          ...data.map(k => k.department).filter(Boolean)
        ]));
        setDepartments(uniqueDepts);
      }
    }
    loadDepts();
  }, [employeeId]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from("hr_employees")
        .update({
          full_name: editForm.full_name,
          role_title: editForm.role_title,
          department: editForm.department,
          location: editForm.location,
          email: editForm.email,
          phone: editForm.phone,
          role_level: editForm.role_level,
          avatar_initials: editForm.full_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        })
        .eq("id", employeeId);

      if (error) throw error;
      
      setIsEditing(false);
      await loadData();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      alert(err.message || "Failed to save updates");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete the profile of ${employee?.full_name || "this employee"}?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("hr_employees")
        .delete()
        .eq("id", employeeId);

      if (error) throw error;

      toast.success("Employee profile deleted successfully.");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete employee profile");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-[450px] bg-[#121212] border-l border-white/10 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
          onClick={e => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : employee ? (
            <>
              {/* Header Profile Info */}
              <div className="relative shrink-0 border-b border-white/5 bg-[#151515]">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: employee.avatar_color }} />
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    {employee.role_level === "ceo" || employee.role_title?.toLowerCase() === "ceo" || employee.email === "ceo@tradifive.in" ? (
                      <img
                        src="/nikil_avatar.jpg"
                        alt={employee.full_name}
                        className="w-16 h-16 rounded-xl object-cover shadow-xl"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-[20px] font-bold text-white shadow-xl"
                        style={{ background: employee.avatar_color }}
                      >
                        {employee.avatar_initials}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            disabled={editLoading}
                            onClick={handleSave}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            {editLoading ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleDelete}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Delete Profile
                          </button>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Edit Details
                          </button>
                        </>
                      )}
                      <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-neutral-500 hover:text-white transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Full Name</label>
                          <input
                            name="full_name"
                            value={editForm.full_name}
                            onChange={handleEditChange}
                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[13px] text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Role Title</label>
                          <input
                            name="role_title"
                            value={editForm.role_title}
                            onChange={handleEditChange}
                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[13px] text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1 col-span-1">
                            <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Department</label>
                            <select
                              name="department"
                              value={editForm.department}
                              onChange={handleEditChange}
                              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:border-indigo-500 outline-none"
                            >
                              {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1 col-span-1">
                            <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Location</label>
                            <input
                              name="location"
                              value={editForm.location}
                              onChange={handleEditChange}
                              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[12px] text-white focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1 col-span-1">
                            <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Hierarchy</label>
                            <select
                              name="role_level"
                              value={editForm.role_level}
                              onChange={handleEditChange}
                              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:border-indigo-500 outline-none"
                            >
                              <option value="ic">Contributor</option>
                              <option value="manager">Manager</option>
                              <option value="director">Director</option>
                              <option value="vp">VP</option>
                              <option value="head">Dept Head</option>
                              <option value="ceo">CEO</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          {employee.full_name}
                          {(employee.role_level === "ceo" || employee.role_title?.toLowerCase() === "ceo" || employee.role_title?.toLowerCase().includes("chief executive officer")) && (
                            <Crown size={18} className="text-amber-500 fill-amber-500/20 shrink-0" />
                          )}
                        </h2>
                        <p className="text-[12px] font-medium text-indigo-400 mt-1 uppercase tracking-widest">{employee.role_title}</p>
                        
                        <div className="flex items-center gap-4 mt-4 text-[11px] font-medium text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-neutral-600" />
                            {employee.department}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-neutral-600" />
                            {employee.location || "Remote"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                
                {/* Contact Info */}
                <div>
                  <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">Contact Information</h3>
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-lg p-3 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Email Address</label>
                          <input
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[12px] text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-wider">Phone Number</label>
                          <input
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[12px] text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 text-[12px] text-neutral-300">
                          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-neutral-500 shrink-0"><Mail size={12} /></div>
                          <span className="truncate">{employee.email}</span>
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-3 text-[12px] text-neutral-300">
                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-neutral-500 shrink-0"><Phone size={12} /></div>
                            <span>{employee.phone}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Corporate Hierarchy */}
                <div>
                  <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">Corporate Hierarchy</h3>
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-lg p-1">
                    {/* Manager */}
                    <div className="p-2 border-b border-white/5 last:border-0">
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-2">Reports To</p>
                      {manager ? (
                        <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/[0.02]">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ background: manager.avatar_color }}>
                            {manager.avatar_initials}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-white">{manager.full_name}</p>
                            <p className="text-[9px] text-neutral-500">{manager.role_title}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-400 px-2 italic">Board of Directors / Top Level</p>
                      )}
                    </div>

                    {/* Direct Reports */}
                    <div className="p-2">
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-2">Direct Reports ({directReports.length})</p>
                      {directReports.length > 0 ? (
                        <div className="space-y-1">
                          {directReports.map(dr => (
                            <div key={dr.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/[0.02]">
                              <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ background: dr.avatar_color }}>
                                {dr.avatar_initials}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-white">{dr.full_name}</p>
                                <p className="text-[9px] text-neutral-500">{dr.role_title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-400 px-2 italic">No direct reports.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Tasks / Workload */}
                <div>
                  <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">Current Workload</h3>
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Briefcase size={64} />
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 text-[12px] font-bold mb-2">
                      <Activity size={14} /> Active Assignments
                    </div>
                    <ul className="space-y-2 mt-3 relative z-10">
                      <li className="text-[11px] text-neutral-300 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                        <span>Quarterly Department Review & KPI Analysis</span>
                      </li>
                      <li className="text-[11px] text-neutral-300 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                        <span>Team OKR Alignment for Q3</span>
                      </li>
                      <li className="text-[11px] text-neutral-300 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                        <span>Vendor Contract Renewals (Pending)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Recent Attendance */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Recent Attendance</h3>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={10} /> Present Today
                    </span>
                  </div>
                  <div className="space-y-2">
                    {attendance.length > 0 ? (
                      attendance.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-neutral-500 shrink-0">
                              <Calendar size={13} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white">{new Date(att.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">{att.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {att.check_in && (
                              <p className="text-[11px] text-white flex items-center gap-1.5 justify-end">
                                <Clock size={10} className="text-emerald-500" /> {new Date(`2000-01-01T${att.check_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                            {att.check_out && (
                              <p className="text-[10px] text-neutral-500 flex items-center gap-1.5 justify-end mt-0.5">
                                <Clock size={10} /> {new Date(`2000-01-01T${att.check_out}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-neutral-500 italic p-3 bg-[#1A1A1A] border border-white/5 rounded-lg text-center">
                        No recent attendance records found.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
              <User size={32} className="opacity-50 mb-3" />
              <p className="text-[12px] font-bold">Employee Not Found</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
