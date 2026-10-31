import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Receipt, Download, Calendar, Wallet, CheckCircle2, 
  AlertCircle, ArrowUpRight, TrendingUp, TrendingDown, Clock, ShieldCheck
} from "lucide-react";
import { Settlement } from "@/types/settlement";
import { downloadSettlementInvoicePdf } from "@/utils/settlementPdf";

interface SettlementDetailsModalProps {
  settlement: Settlement | null;
  isOpen: boolean;
  onClose: () => void;
  onPayNow?: (settlement: Settlement) => void;
  userProfile?: any;
}

export default function SettlementDetailsModal({
  settlement,
  isOpen,
  onClose,
  onPayNow,
  userProfile
}: SettlementDetailsModalProps) {
  if (!isOpen || !settlement) return null;

  const isPaid = settlement.status === "paid" || settlement.status === "approved";
  const isPending = settlement.status === "pending";
  const isOverdue = settlement.status === "overdue";
  const isLoss = settlement.status === "loss_week";

  const curr = settlement.currency === "USC" ? "USC " : "₹";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-[700px] rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1A1F2C] dark:border-[1px] dark:border-white/10 text-slate-800 dark:text-white max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Receipt size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Settlement Details
                  </h3>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {settlement.settlement_number}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  {settlement.week_label} • MT5 #{settlement.mt5_account_number}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSettlementInvoicePdf(settlement, userProfile)}
                className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download Printable PDF Invoice"
              >
                <Download size={13} />
                <span className="hidden sm:inline">PDF Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto pr-1 py-4 space-y-4 [scrollbar-width:none]">
            {/* Status & Payable Callout Banner */}
            <div className={`p-4 rounded-[18px] border-2 border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.06),0_0_0_2px_#E2E8F0] ${
              isPaid
                ? "bg-gradient-to-r from-[#ECFDF5] via-emerald-50/40 to-white dark:bg-none dark:bg-[#132A20] border-emerald-200/50"
                : isOverdue
                ? "bg-gradient-to-r from-[#FEF2F2] via-rose-50/40 to-white dark:bg-none dark:bg-[#2A1315] border-rose-200/50"
                : isLoss
                ? "bg-slate-50 dark:bg-white/5 border-slate-200/70"
                : "bg-gradient-to-r from-[#FFFBEB] via-amber-50/40 to-white dark:bg-none dark:bg-[#2A2313] border-amber-200/50"
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : isOverdue
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                      : isLoss
                      ? "bg-slate-200 text-slate-700 dark:bg-white/20 dark:text-slate-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                  }`}>
                    {settlement.status.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar size={12} />
                    Due: {new Date(settlement.payment_deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {isLoss ? (
                    <span className="text-slate-500">Zero Fee (Loss Offset Active)</span>
                  ) : (
                    <span>Payable: <b className="text-blue-600 dark:text-blue-400">{curr}{settlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></span>
                  )}
                </div>
              </div>

              {/* Action button if pending */}
              {(isPending || isOverdue) && onPayNow && (
                <button
                  type="button"
                  onClick={() => onPayNow(settlement)}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <ArrowUpRight size={15} />
                  <span>Pay Platform Share</span>
                </button>
              )}
            </div>

            {/* Audit Calculation Breakdown Grid */}
            <div className="p-4 rounded-[18px] bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-2.5 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Settlement Financial Breakdown (Audited Real MT5 Data)
              </span>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Gross Realised Winning Profit:</span>
                <span className="font-bold text-emerald-600">+{curr}{settlement.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Gross Realised Trading Losses:</span>
                <span className="font-bold text-rose-600">-{curr}{settlement.gross_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Broker Commissions & Swaps:</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">-{curr}{(settlement.commissions + settlement.swaps).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-300 dark:border-white/10 font-bold">
                <span className="text-slate-800 dark:text-white">Net Realised Closed Profit:</span>
                <span className={settlement.net_realised_profit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {settlement.net_realised_profit >= 0 ? '+' : ''}{curr}{settlement.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Previous Loss Offset (Carry-Forward):</span>
                <span className="font-bold text-slate-500">-{curr}{settlement.previous_loss_carried.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-500/10 px-3 border border-emerald-200/60 dark:border-emerald-500/20 font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">Eligible Profit for 50/50 Split:</span>
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">
                  {curr}{settlement.eligible_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 50/50 Split Results */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Your Share (50%)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                    +{curr}{settlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">Retained 100% in MT5</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase block">Tradifive Share (50%)</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {curr}{settlement.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">Agreed Platform Fee</span>
                </div>
              </div>
            </div>

            {/* Closed Trades List (Items) */}
            {settlement.items && settlement.items.length > 0 && (
              <div className="p-4 rounded-[18px] bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Trade-Wise Execution Ledger ({settlement.items.length} Closed Deals)
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 font-mono">
                    Zero Floating P&L
                  </span>
                </div>

                <div className="overflow-x-auto [scrollbar-width:none]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase">
                        <th className="py-1.5 font-bold">Ticket</th>
                        <th className="py-1.5 font-bold">Symbol</th>
                        <th className="py-1.5 font-bold">Type</th>
                        <th className="py-1.5 font-bold">Lots</th>
                        <th className="py-1.5 font-bold text-right">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                      {settlement.items.map((item) => (
                        <tr key={item.id || item.ticket}>
                          <td className="py-1.5 text-slate-500">#{item.ticket}</td>
                          <td className="py-1.5 font-bold text-slate-800 dark:text-slate-200">{item.symbol}</td>
                          <td className="py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                              item.trade_type === "BUY" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}>
                              {item.trade_type}
                            </span>
                          </td>
                          <td className="py-1.5">{item.lot_size}</td>
                          <td className={`py-1.5 text-right font-bold ${item.net_pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {item.net_pnl >= 0 ? "+" : ""}{curr}{item.net_pnl.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Audit Record (If paid) */}
            {isPaid && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Verified Payment Receipt #{settlement.receipt_number || "REC-TRDF-VERIFIED"}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 space-y-0.5 text-[11.5px]">
                  <p>Method: <b>{settlement.payment_method || "Online Payment Gateway"}</b></p>
                  <p>Reference: <span className="font-mono">{settlement.payment_reference || "N/A"}</span></p>
                  <p>Cleared: {settlement.paid_at ? new Date(settlement.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : "Verified"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium">
              Governed by FiAlgo V1 Operating Agreement
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
