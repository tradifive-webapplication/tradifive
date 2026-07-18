import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Calendar, TrendingDown, ArrowDownToLine, Receipt, Building2, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface EmployeePayslipModalProps {
  employee: any;
  onClose: () => void;
}

export default function EmployeePayslipModal({ employee, onClose }: EmployeePayslipModalProps) {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      // Attempt to load from hr_payslips if the table exists
      const { data, error } = await supabase
        .from("hr_payslips")
        .select("*")
        .eq("employee_id", employee.id)
        .order("pay_period_start", { ascending: false });

      if (error) {
        console.warn("Could not load payslips. Did you run the SQL migration?", error);
        // Fallback to empty array if table doesn't exist yet
        setPayslips([]);
      } else {
        setPayslips(data || []);
      }
      setLoading(false);
    }
    loadHistory();
  }, [employee]);

  const totalPaid = payslips.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.net_amount), 0);
  const pendingAmount = payslips.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.net_amount), 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-[#121212] flex items-start justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-xl"
                style={{ background: employee.avatar_color || '#3b82f6' }}
              >
                {employee.avatar_initials || employee.full_name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{employee.full_name}</h2>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  <span className="flex items-center gap-1.5"><Building2 size={12} className="text-neutral-600" /> {employee.department}</span>
                  <span>•</span>
                  <span>{employee.role_title}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 gap-4 p-6 shrink-0 bg-gradient-to-b from-[#121212] to-[#0a0a0a]">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Total Paid (YTD)</p>
              <h3 className="text-2xl font-bold text-white">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-amber-500/10 to-transparent" />
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Clock size={16} />
              </div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Pending Amount</p>
              <h3 className="text-2xl font-bold text-white">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Receipt size={14} className="text-indigo-400" /> Payment History & Payslips
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-500 gap-3">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Loading Records...</p>
              </div>
            ) : payslips.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-[#121212] rounded-xl border border-dashed border-white/10">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Receipt className="text-neutral-600" size={20} />
                </div>
                <p className="text-[12px] font-bold text-white uppercase tracking-widest mb-1">No Payslips Found</p>
                <p className="text-[11px] text-neutral-500 max-w-[200px] leading-relaxed">Ensure you have run the `0004_payroll_history.sql` migration in Supabase.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payslips.map((slip) => (
                  <div key={slip.id} className="bg-[#151515] border border-white/5 rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${slip.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          <DollarSign size={18} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white">
                            {new Date(slip.pay_period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} Salary
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(slip.pay_period_start).toLocaleDateString()} - {new Date(slip.pay_period_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[16px] font-bold text-white font-mono">${Number(slip.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${slip.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {slip.status === 'paid' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                          {slip.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#1a1a1a] p-2.5 rounded-lg flex flex-col justify-between">
                        <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Base Pay</span>
                        <span className="text-[12px] font-bold text-neutral-300 font-mono">${Number(slip.base_amount).toLocaleString()}</span>
                      </div>
                      <div className="bg-[#1a1a1a] p-2.5 rounded-lg flex flex-col justify-between">
                        <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={9} className="text-emerald-400" /> Bonus</span>
                        <span className="text-[12px] font-bold text-emerald-400 font-mono">${Number(slip.bonus_amount).toLocaleString()}</span>
                      </div>
                      <div className="bg-[#1a1a1a] p-2.5 rounded-lg flex flex-col justify-between">
                        <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingDown size={9} className="text-red-400" /> Deductions</span>
                        <span className="text-[12px] font-bold text-red-400 font-mono">-${Number(slip.deductions).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                        <ArrowDownToLine size={12} /> Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
