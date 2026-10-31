import React from "react";
import { Settlement } from "@/types/settlement";
import { X, User, ShieldCheck, Download, TrendingUp, Wallet, Clock, ArrowUpRight } from "lucide-react";
import { downloadSettlementInvoicePdf } from "@/utils/settlementPdf";

interface AdminCustomerSettlementProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  settlements: Settlement[];
}

export default function AdminCustomerSettlementProfileModal({
  isOpen,
  onClose,
  userId,
  settlements
}: AdminCustomerSettlementProfileModalProps) {
  if (!isOpen) return null;

  const userSettlements = settlements.filter(s => s.user_id === userId);
  const latestSettlement = userSettlements[0];
  
  const totalProfit = userSettlements.reduce((sum, s) => sum + s.net_realised_profit, 0);
  const totalTradifiveShare = userSettlements.reduce((sum, s) => sum + s.tradifive_share, 0);
  const totalPending = userSettlements
    .filter(s => s.status === "pending" || s.status === "overdue")
    .reduce((sum, s) => sum + s.amount_payable, 0);
  const activeLossCarry = latestSettlement?.loss_carried_forward || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#18181B] rounded-[24px] border-2 border-white dark:border-white/10 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Settlement Profile
              </h2>
              <p className="text-xs text-slate-400">
                User ID: <span className="font-mono font-semibold">{userId}</span> • MT5 #{latestSettlement?.mt5_account_number || "••••9980"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Cumulative Net Profit</span>
              <span className="text-sm font-bold text-emerald-600 block mt-1">
                +₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tradifive Revenue</span>
              <span className="text-sm font-bold text-blue-600 block mt-1">
                ₹{totalTradifiveShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Outstanding Dues</span>
              <span className={`text-sm font-bold block mt-1 ${totalPending > 0 ? "text-amber-600" : "text-slate-700 dark:text-slate-300"}`}>
                ₹{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Loss Carry Buffer</span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 block mt-1">
                ₹{activeLossCarry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Settlements Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              All Settlement Records ({userSettlements.length})
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-2.5">Cycle</th>
                    <th className="p-2.5 text-right">Net Profit</th>
                    <th className="p-2.5 text-right">Payable</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {userSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900 dark:text-white">{s.week_label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{s.settlement_number}</div>
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        <span className={s.net_realised_profit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                          {s.net_realised_profit >= 0 ? "+" : ""}₹{s.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-blue-600">
                        ₹{s.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${
                          s.status === "paid" || s.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : s.status === "overdue"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                            : s.status === "loss_week"
                            ? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                        }`}>
                          {s.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => downloadSettlementInvoicePdf(s)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                          title="Download Invoice PDF"
                        >
                          <Download size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
