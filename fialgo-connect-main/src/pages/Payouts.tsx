import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Banknote, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  History
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { PushableButton } from "@/components/PushableButton";
import { usePayoutsAndTransactions } from "@/hooks/usePayoutsAndTransactions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Payouts() {
  const navigate = useNavigate();
  const [requestAmount, setRequestAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("Crypto Transfer");
  
  // Auth enforcement on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Authentication required", {
          description: "Please sign in to access the Capital Center."
        });
        navigate("/login");
      }
    });
  }, [navigate]);

  const { loading, payouts, payoutStats, submitPayoutRequest } = usePayoutsAndTransactions();

  const handleSubmit = async () => {
    if (!requestAmount) {
      toast.error("Please enter a withdrawal amount.");
      return;
    }
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", { description: "Please enter a positive numeric value." });
      return;
    }
    const success = await submitPayoutRequest(amount, selectedMethod);
    if (success) {
      setRequestAmount("");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 bg-[#F8F9FD] dark:bg-[#0d0d0f] overflow-y-auto no-scrollbar -m-10 p-8 pb-40">
        <div className="max-w-6xl mx-auto space-y-10 pt-4">
          
          {/* HEADER SECTION */}
          <div className="flex items-center justify-between mt-2 mb-12 h-[60px]">
            <div className="flex flex-col pt-1">
               <h1 className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">Capital Center</h1>
               <p className="text-[14px] text-slate-400 font-bold uppercase tracking-tight mt-3">Fiscal Settlement // Profit disbursement & withdrawal protocols.</p>
            </div>
            <div className="flex items-center gap-3 bg-blue-50/50 px-5 py-2.5 rounded-xl border border-blue-100/50">
               <ShieldCheck size={16} className="text-slate-200" strokeWidth={2.5} />
               <span className="text-[11px] font-bold text-white uppercase tracking-tight">Verified Entity</span>
            </div>
          </div>

          {/* LOADING STATE INDICATOR */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 font-bold uppercase tracking-widest text-sm">
              <Clock size={20} className="animate-spin mr-3 text-blue-500" /> Loading Capital Details...
            </div>
          ) : (
            <>
              {/* MAIN STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#12141d] rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 translate-x-4">
                    <Wallet size={140} className="text-slate-300" />
                  </div>
                   <div className="relative z-10">
                     <p className="text-[11px] font-bold text-slate-300 uppercase tracking-tight mb-5">Withdrawable Equity</p>
                     <h2 className="text-4xl font-bold tracking-tighter text-white">${payoutStats.withdrawable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    <div className="mt-10 flex items-center gap-4">
                       <div className="px-4 py-1.5 bg-white/10 rounded-full text-[11px] font-bold border border-white/10 tracking-tight uppercase">100% PROFIT SPLIT</div>
                       <div className="flex items-center text-blue-300 text-[11px] font-bold uppercase tracking-tight">
                         Live Update <Clock size={14} className="ml-2" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] px-10 py-8 border border-slate-100 dark:border-[#333333] shadow-sm flex flex-col justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-6">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Gross Disbursement</p>
                     </div>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter">${payoutStats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                   </div>
                   <div className="mt-8 h-1.5 w-full bg-slate-50 dark:bg-[#141414] rounded-full overflow-hidden">
                     <div className="h-full bg-[#D1E4FF] dark:bg-emerald-500 w-[75%]" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 mt-5 uppercase tracking-tight flex items-center gap-2">
                     <TrendingUp size={14} className="text-emerald-500" strokeWidth={2.5} /> Performance +12.4%
                   </p>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] px-10 py-8 border border-slate-100 dark:border-[#333333] shadow-sm flex flex-col justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-6">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Next Settlement Node</p>
                     </div>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{payoutStats.nextPayout}</h3>
                   </div>
                   <div className="flex items-center gap-2 mt-8">
                     <div className="px-4 py-2 bg-blue-50/50 text-white rounded-xl text-[10px] font-bold border border-blue-100 uppercase tracking-tight">
                       {payoutStats.daysRemaining} DAYS REMAINING
                     </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* REQUEST FORM */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] p-10 border border-slate-100 dark:border-[#333333] shadow-sm">
                       <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-3">
                         <ArrowUpRight size={18} className="text-slate-200" strokeWidth={2.5} /> Initiate Settlement Request
                       </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block mb-3">Amount to Withdraw</label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">$</span>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              value={requestAmount}
                              onChange={(e) => setRequestAmount(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-[20px] py-5 pl-10 pr-6 outline-none focus:ring-4 focus:ring-blue-500/5 font-bold text-foreground text-lg transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block mb-3">Preferred Method</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              type="button"
                              onClick={() => setSelectedMethod("Crypto Transfer")}
                              className={`flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${
                                selectedMethod === "Crypto Transfer" 
                                  ? "border-blue-500 bg-blue-50/30 shadow-blue-500/10" 
                                  : "border-slate-100 dark:border-[#333333] bg-slate-50 dark:bg-[#141414]"
                              }`}
                            >
                              <CreditCard size={24} className={`${selectedMethod === "Crypto Transfer" ? "text-slate-200" : "text-slate-400"} mb-3`} strokeWidth={2} />
                              <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedMethod === "Crypto Transfer" ? "text-white" : "text-slate-500"}`}>Crypto Transfer</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => setSelectedMethod("Bank Wire")}
                              className={`flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
                                selectedMethod === "Bank Wire" 
                                  ? "border-blue-500 bg-blue-50/30 shadow-blue-500/10" 
                                  : "border-slate-100 dark:border-[#333333] bg-slate-50 dark:bg-[#141414]"
                              }`}
                            >
                              <TrendingUp size={24} className={`${selectedMethod === "Bank Wire" ? "text-slate-200" : "text-slate-400"} mb-3`} strokeWidth={2} />
                              <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedMethod === "Bank Wire" ? "text-white" : "text-slate-500"}`}>Bank Wire</span>
                            </button>
                          </div>
                        </div>
                        <PushableButton 
                          variant="deep-3d" 
                          onClick={handleSubmit}
                          className="w-full py-5 text-[14px]"
                        >
                          SUBMIT SETTLEMENT REQUEST
                        </PushableButton>
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tight mt-4">Standard Processing: 24-48 Hours</p>
                      </div>
                   </div>

                   <div className="bg-amber-50/50 rounded-[32px] p-8 border border-amber-100/50 flex items-start gap-5 mt-8">
                      <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} strokeWidth={2.5} />
                      <div className="space-y-2">
                        <h4 className="text-[13px] font-bold text-amber-900 uppercase tracking-tight">Compliance Protocol</h4>
                        <p className="text-[12px] text-amber-800/60 leading-relaxed font-bold uppercase tracking-tight">KYC validation required. All active institutional trades must be finalized prior to disbursement.</p>
                      </div>
                   </div>
                </div>

                {/* PAYOUT HISTORY */}
                <div className="lg:col-span-3">
                  <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] overflow-hidden border border-slate-100 dark:border-[#333333] shadow-sm h-full flex flex-col">
                    <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
                      <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <History size={18} className="text-slate-200" strokeWidth={2.5} /> Settlement Ledger
                      </h3>
                      <button 
                        onClick={() => navigate("/transactions")}
                        className="text-[11px] font-bold text-white uppercase tracking-tight flex items-center gap-2 hover:gap-3 transition-all"
                      >
                        Full History <ArrowRight size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/30 dark:bg-[#141414]/30">
                              <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Protocol ID</th>
                              <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Date</th>
                              <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Amount</th>
                              <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                            {payouts.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#222222]/50 transition-colors group">
                                <td className="px-10 py-6 font-bold text-slate-300 text-[14px]">{item.id}</td>
                                <td className="px-6 py-6">
                                  <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">{item.date}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{item.method}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-6 font-bold text-slate-900 dark:text-white text-[16px] tracking-tighter">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-10 py-6 text-right">
                                   <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-tight ${
                                     item.status?.toLowerCase() === "completed" 
                                       ? "bg-emerald-500/10 text-emerald-500" 
                                       : item.status?.toLowerCase() === "failed" 
                                         ? "bg-rose-500/10 text-rose-500" 
                                         : "bg-amber-500/10 text-amber-500"
                                   }`}>
                                     <CheckCircle2 size={14} strokeWidth={2.5} /> {item.status}
                                   </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="p-8 bg-slate-50/30 dark:bg-[#141414]/30 text-center">
                       <p className="text-[12px] text-slate-400 font-bold uppercase tracking-tight flex items-center justify-center gap-3">
                         Settlement Support Needed? <HelpCircle size={16} strokeWidth={2.5} /> <span className="text-slate-200 cursor-pointer hover:underline">Contact Finance Terminal</span>
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}






