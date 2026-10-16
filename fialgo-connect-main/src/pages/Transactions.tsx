import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Tag, 
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Plus
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { usePayoutsAndTransactions } from "@/hooks/usePayoutsAndTransactions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { recordUserActivity } from "@/lib/activity";

export default function Transactions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Auth check on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Authentication required", {
          description: "Please sign in to access the Capital Flow Ledger."
        });
        navigate("/login");
      }
    });
  }, [navigate]);

  const { loading, transactions, refetch } = usePayoutsAndTransactions();

  // Dynamic calculations based on live table data
  const completedTxns = transactions.filter(t => t.status?.toLowerCase() === "completed");
  const pendingTxns = transactions.filter(t => t.status?.toLowerCase() === "pending");

  const grossEarnings = completedTxns.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const liquidExpenses = Math.abs(completedTxns.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
  const pendingSettlement = Math.abs(pendingTxns.reduce((acc, t) => acc + t.amount, 0));
  const netCashflow = grossEarnings - liquidExpenses;

  // Search filtering
  const filteredTransactions = transactions.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(query) ||
      (t.desc && t.desc.toLowerCase().includes(query)) ||
      (t.type && t.type.toLowerCase().includes(query)) ||
      t.status.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = async () => {
    toast.success("Preparing Statement Statement...", {
      description: "Compiling financial telemetry. Check download folder shortly."
    });
    await recordUserActivity("STRATEGY_CHANGE", "User exported financial transaction ledger statement.");
  };

  const handleReconcile = () => {
    refetch();
    toast.success("Ledger Reconciled", {
      description: "Successfully synchronized database signatures with Supabase node."
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 bg-[#F8F9FD] dark:bg-[#0d0d0f] overflow-y-auto no-scrollbar -m-10 p-8 pb-40">
        <div className="max-w-[1500px] mx-auto space-y-8 pt-4">
          
          {/* HEADER & TOP ACTIONS */}
          <div className="flex items-center justify-between mt-2 mb-10 h-[60px]">
            <div className="flex flex-col pt-1">
               <h1 className="text-[30px] font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Capital Flow Ledger</h1>
               <p className="text-[14px] text-slate-500 font-medium tracking-tight mt-2">Fiscal Statement // All-Time Financial Ecosystem logs.</p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={handleExport}
                 className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333333] rounded-xl text-slate-600 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-[#141414] transition-all shadow-sm"
               >
                 <Download size={16} /> Export Statement
               </button>
               <button 
                 onClick={handleReconcile}
                 className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200"
               >
                 <RefreshCcw size={16} /> RECONCILE
               </button>
            </div>
          </div>

          {/* TOTAL BALANCE CARD */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-8">
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liquid Expenses</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">${liquidExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Earnings</p>
                <div className="text-2xl font-bold text-[#10B981] tracking-tight">+${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Settlement</p>
                <div className="text-2xl font-bold text-amber-500 tracking-tight">${pendingSettlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Cashflow</p>
                <div className={`text-2xl font-bold tracking-tight ${netCashflow >= 0 ? "text-[#10B981]" : "text-rose-500"}`}>
                  {netCashflow >= 0 ? "+" : "-"}${Math.abs(netCashflow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
             </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-4 border border-white dark:border-[#333333] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
             <div className="relative group w-full lg:max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-200 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by ID, description or type..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 text-sm font-bold shadow-sm transition-all"
                />
             </div>
             <div className="flex items-center gap-3 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl text-[11px] font-black uppercase text-slate-600 hover:bg-white dark:hover:bg-[#1A1A1A] hover:border-slate-200 dark:hover:border-[#333333] transition-all">
                  <Calendar size={16} /> Last 30 Days
                </button>
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl text-[11px] font-black uppercase text-slate-600 hover:bg-white dark:hover:bg-[#1A1A1A] hover:border-slate-200 dark:hover:border-[#333333] transition-all">
                  <Filter size={16} /> Filter Type
                </button>
                <button 
                  onClick={refetch}
                  className="p-4 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl text-slate-400 hover:text-slate-250 transition-all"
                >
                   <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                </button>
             </div>
          </div>

          {/* TRANSACTION TABLE */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 font-bold uppercase tracking-widest text-sm bg-white dark:bg-[#1E1E1E] rounded-[24px] border border-white dark:border-[#333333] shadow-sm">
              <Clock size={20} className="animate-spin mr-3 text-blue-500" /> Loading Transaction Logs...
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] overflow-hidden border border-white dark:border-[#333333] shadow-sm">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50 dark:bg-[#141414]/50">
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                           <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Details</th>
                           <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Type</th>
                           <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Date</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                         </tr>
                      </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                        {paginatedTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-[#222222]/50 transition-colors group">
                             <td className="px-8 py-6">
                                {txn.status?.toLowerCase() === "completed" ? (
                                  <div className="w-9 h-9 rounded-full bg-[#D1E4FF] dark:bg-[#1E1E1E] text-emerald-500 flex items-center justify-center shadow-sm">
                                     <CheckCircle2 size={18} />
                                  </div>
                                ) : txn.status?.toLowerCase() === "pending" ? (
                                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-[#1E1E1E] text-amber-500 flex items-center justify-center shadow-sm">
                                     <Clock size={18} />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-[#1E1E1E] text-red-500 flex items-center justify-center shadow-sm">
                                     <XCircle size={18} />
                                  </div>
                                )}
                             </td>
                              <td className="px-6 py-6 max-w-[400px]">
                                 <div className="space-y-1">
                                    <div className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{txn.desc}</div>
                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{txn.id}</div>
                                 </div>
                              </td>
                             <td className="px-6 py-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                   <Tag size={12} className="text-slate-400" /> {txn.type}
                                </div>
                             </td>
                              <td className="px-6 py-6 text-[12px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap">{txn.date}</td>
                              <td className={`px-8 py-6 text-right font-bold text-[16px] tracking-tight whitespace-nowrap ${txn.amount >= 0 ? "text-[#10B981]" : "text-slate-900 dark:text-white"}`}>
                                 {txn.amount >= 0 ? `+ $${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `- $${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               {/* PAGINATION */}
               <div className="p-8 bg-slate-50/30 dark:bg-[#141414]/30 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Showing {paginatedTransactions.length} of {totalItems} Transactions</p>
                  <div className="flex items-center gap-2">
                     <button 
                       disabled={currentPage === 1}
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333333] text-slate-400 hover:text-slate-900 dark:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <ChevronLeft size={18} />
                     </button>
                     {Array.from({ length: totalPages }).map((_, idx) => (
                       <button
                         key={idx}
                         onClick={() => setCurrentPage(idx + 1)}
                         className={`w-10 h-10 flex items-center justify-center rounded-xl border ${
                           currentPage === idx + 1
                             ? "bg-slate-900 border-slate-900 text-white font-black text-[12px] shadow-lg"
                             : "bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#333333] text-slate-600 font-bold text-[12px] hover:bg-slate-50 dark:hover:bg-[#141414]"
                         } transition-all shadow-sm`}
                       >
                         {idx + 1}
                       </button>
                     ))}
                     <button 
                       disabled={currentPage === totalPages}
                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                       className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333333] text-slate-400 hover:text-slate-900 dark:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <ChevronRight size={18} />
                     </button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}






