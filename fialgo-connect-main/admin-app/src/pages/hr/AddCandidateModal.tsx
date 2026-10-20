import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building2, Briefcase, FileText, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface AddCandidateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCandidateModal({ onClose, onSuccess }: AddCandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>(["Technology", "HR & People", "Support", "Operations", "Executive"]);

  useEffect(() => {
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
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role_applied: "",
    experience_years: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("hr_candidates")
        .insert([{
          ...formData,
          experience_years: formData.experience_years ? parseInt(formData.experience_years, 10) : 0,
          stage: "applied",
        }]);

      if (insertError) throw insertError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error adding candidate:", err);
      setError(err.message || "Failed to add candidate");
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
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Add New Candidate</h2>
              <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-wider">Enter recruitment details</p>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-white/10 text-neutral-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[12px] font-medium">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">Candidate Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={12} /> Full Name *
                    </label>
                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. John Smith" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={12} /> Email Address *
                    </label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} /> Years of Experience
                    </label>
                    <input required type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. 5" />
                  </div>
                </div>
              </div>

              {/* Role Details */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">Target Role</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={12} /> Department *
                    </label>
                    <select required name="department" value={formData.department} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors">
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase size={12} /> Role Applied For *
                    </label>
                    <input required name="role_applied" value={formData.role_applied} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} /> Interviewer Notes
                    </label>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange} 
                      rows={3}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-purple-500 transition-colors resize-none" 
                      placeholder="Add initial screening notes or resume highlights..." 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-white/5 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors">
                Cancel
              </button>
              <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-purple-500/20">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Saving..." : "Add Candidate"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
