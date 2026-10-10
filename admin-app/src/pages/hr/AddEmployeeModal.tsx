import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building2, Briefcase, MapPin, DollarSign, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder,
  direction = "down"
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[];
  placeholder: string;
  direction?: "down" | "up";
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <div 
        onClick={() => setOpen(!open)}
        className={`w-full bg-[#1A1A1A] border ${open ? 'border-indigo-500' : 'border-white/10'} hover:border-white/20 rounded p-2.5 px-3 text-[13px] text-white outline-none transition-colors cursor-pointer flex items-center justify-between`}
      >
        <span className={value ? "text-white" : "text-neutral-500"}>
          {value ? options.find(o => o.value === value)?.label || value : placeholder}
        </span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180 text-indigo-400" : ""}`} />
      </div>
      
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: direction === "up" ? 5 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction === "up" ? 5 : -5 }}
              transition={{ duration: 0.15 }}
              className={`absolute left-0 right-0 bg-[#222222] border border-white/10 rounded shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar ${
                direction === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"
              }`}
            >
              <div className="p-1 flex flex-col gap-0.5">
                {options.map(opt => (
                  <div 
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`px-3 py-2 text-[13px] rounded-sm cursor-pointer transition-colors ${
                      value === opt.value 
                        ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                        : "text-neutral-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([
    "Executive",
    "Technology",
    "Operations",
    "Trading & Risk",
    "Finance",
    "Content & Marketing",
    "HR & People",
    "Support",
    "Sales"
  ]);

  useEffect(() => {
    async function loadDepts() {
      const { data } = await supabase.from("department_access_keys").select("department");
      if (data) {
        const uniqueDepts = Array.from(new Set([
          "Executive",
          "Technology",
          "Operations",
          "Trading & Risk",
          "Finance",
          "Content & Marketing",
          "HR & People",
          "Support",
          "Sales",
          ...data.map(k => k.department).filter(Boolean)
        ]));
        setDepartments(uniqueDepts);
      }
    }
    loadDepts();
  }, []);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    role_title: "",
    role_level: "ic",
    location: "",
    salary: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const generateColor = () => {
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [successData, setSuccessData] = useState<{ email: string; tempPassword: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Provision the auth account via Edge Function
      const { data: provisionData, error: provisionError } = await supabase.functions.invoke('provision-employee', {
        body: {
          email: formData.email,
          full_name: formData.full_name,
          department: formData.department,
          role_level: formData.role_level
        }
      });

      if (provisionError) {
        // Try to extract a specific error message if the backend provided one
        console.error("Edge Function Error Context:", provisionError.context);
        throw new Error(provisionError.message || "Failed to contact Edge Function. Check logs.");
      }
      
      if (provisionData?.error) throw new Error(provisionData.error);

      // 2. Insert into HR personnel records
      const { error: insertError } = await supabase
        .from("hr_employees")
        .insert([{
          ...formData,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          avatar_initials: generateInitials(formData.full_name),
          avatar_color: generateColor(),
          skills: [],
          status: "active",
          joined_at: new Date().toISOString().split("T")[0]
        }]);

      if (insertError) throw insertError;
      
      // 3. Show Success Screen instead of closing immediately
      setSuccessData({
        email: provisionData.email,
        tempPassword: provisionData.tempPassword
      });
      onSuccess();
    } catch (err: any) {
      console.error("Error adding employee:", err);
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#151515]">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">
                {successData ? "Employee Provisioned" : "Add New Employee"}
              </h2>
              <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-wider">
                {successData ? "Secure Credentials Generated" : "Create a new personnel record"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-white/10 text-neutral-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {successData ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <User size={32} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Account Created Successfully</h3>
                <p className="text-sm text-neutral-400 max-w-md mx-auto">
                  Please securely copy and provide these credentials to the new employee. They will use these to log into the Employee Portal.
                </p>
              </div>
              
              <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded p-6 text-left space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Identity (Email)</label>
                  <div className="mt-1 p-3 bg-black/50 border border-white/5 rounded text-emerald-400 font-mono text-sm">
                    {successData.email}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Temporary Pass-Key</label>
                  <div className="mt-1 p-3 bg-black/50 border border-white/5 rounded text-white font-mono text-sm tracking-wider">
                    {successData.tempPassword}
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors"
              >
                Close & Finish
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[12px] font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Personal Details */}
                <div className="col-span-2 space-y-4">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Full Name *
                      </label>
                      <input required name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Jane Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={12} /> Email Address *
                      </label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" placeholder="jane@tradifive.in" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone size={12} /> Phone Number
                      </label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={12} /> Location
                      </label>
                      <input name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. New York, USA" />
                    </div>
                  </div>
                </div>

                {/* Corporate Details */}
                <div className="col-span-2 space-y-4">
                  <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">Corporate Placement</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 size={12} /> Department *
                      </label>
                      <CustomSelect 
                        value={formData.department}
                        onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                        placeholder="Select Department"
                        options={departments.map(d => ({ label: d, value: d }))}
                        direction="up"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} /> Role Title *
                      </label>
                      <input required name="role_title" value={formData.role_title} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Senior Frontend Engineer" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Hierarchy Level
                      </label>
                      <CustomSelect 
                        value={formData.role_level}
                        onChange={(val) => setFormData(prev => ({ ...prev, role_level: val }))}
                        placeholder="Select Level"
                        options={[
                          { value: "ceo", label: "CEO" },
                          { value: "head", label: "Department Head" },
                          { value: "manager", label: "Manager" },
                          { value: "team_lead", label: "Team Leader" },
                          { value: "ic", label: "Employee" }
                        ]}
                        direction="up"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign size={12} /> Base Salary (Annual)
                      </label>
                      <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" placeholder="120000" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-white/5 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors">
                  Cancel
                </button>
                <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-indigo-500/20">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Saving..." : "Add Employee"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
