
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays, User, Clock, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface LogAttendanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogAttendanceModal({ onClose, onSuccess }: LogAttendanceModalProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "present",
    check_in: "09:00",
    check_out: "17:00",
  });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("hr_employees").select("id, full_name, department").order("full_name");
      if (data) setEmployees(data);
      setInitialLoading(false);
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        employee_id: formData.employee_id,
        date: formData.date,
        status: formData.status,
        check_in: formData.status === "present" || formData.status === "late" ? formData.check_in : null,
        check_out: formData.status === "present" || formData.status === "late" ? formData.check_out : null,
      };

      // Upsert
      const { error: upsertError } = await supabase
        .from("hr_attendance")
        .upsert(payload, { onConflict: 'employee_id, date' });

      if (upsertError) throw upsertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error logging attendance:", err);
      setError(err.message || "Failed to log attendance");
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
          className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#151515]">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Log Attendance</h2>
              <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-wider">Record daily presence manually</p>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-white/10 text-neutral-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {initialLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[12px] font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} /> Employee *
                </label>
                <select required name="employee_id" value={formData.employee_id} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors">
                  <option value="">Select an employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays size={12} /> Date *
                </label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "present", label: "Present" },
                    { val: "absent", label: "Absent" },
                    { val: "late", label: "Late" },
                    { val: "on_leave", label: "On Leave" },
                    { val: "holiday", label: "Holiday" }
                  ].map(opt => (
                    <label key={opt.val} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${formData.status === opt.val ? 'bg-indigo-500/10 border-indigo-500' : 'bg-[#1A1A1A] border-white/5 hover:border-white/20'}`}>
                      <input type="radio" name="status" value={opt.val} checked={formData.status === opt.val} onChange={handleChange} className="hidden" />
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${formData.status === opt.val ? 'border-indigo-500' : 'border-neutral-600'}`}>
                        {formData.status === opt.val && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </div>
                      <span className={`text-[12px] font-bold uppercase tracking-wider ${formData.status === opt.val ? 'text-indigo-400' : 'text-neutral-400'}`}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(formData.status === "present" || formData.status === "late") && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} /> Check In
                    </label>
                    <input type="time" name="check_in" value={formData.check_in} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} /> Check Out
                    </label>
                    <input type="time" name="check_out" value={formData.check_out} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-[13px] text-white outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-white/5 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors">
                  Cancel
                </button>
                <button disabled={loading || !formData.employee_id} type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[12px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-indigo-500/20">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Saving..." : "Log Record"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
