import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Receipt, Download, Calendar, ArrowUpRight, CheckCircle2 
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        />

        {/* Modal Dialog (Admin App Dark Clean Box) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          className="relative w-full max-w-[620px] rounded-lg border border-white/10 bg-[#1E1E1E] p-5 shadow-2xl text-white max-h-[90vh] flex flex-col font-mono text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 text-blue-400 flex items-center justify-center shrink-0">
                <Receipt size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                    Settlement Details
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    #{settlement.settlement_number}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {settlement.week_label} · Bound MT5 #{settlement.mt5_account_number || "Connected"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSettlementInvoicePdf(settlement, userProfile)}
                className="h-7 px-2.5 rounded bg-black/30 hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono font-bold text-neutral-300 transition-none flex items-center gap-1.5 cursor-pointer"
                title="Download Printable PDF Invoice"
              >
                <Download size={11} />
                <span>PDF Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded bg-black/30 hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-none flex items-center justify-center cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto pr-1 py-4 space-y-3.5 [scrollbar-width:none]">
            {/* Status & Payable Callout (Clean Admin Card) */}
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : isOverdue
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : isLoss
                      ? "bg-white/5 text-neutral-400 border border-white/10"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {settlement.status.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                    <Calendar size={11} />
                    Due: {new Date(settlement.payment_deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Payable:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                    {curr}{settlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action button if pending */}
              {(isPending || isOverdue) && onPayNow && settlement.amount_payable > 0 && (
                <button
                  type="button"
                  onClick={() => onPayNow(settlement)}
                  className="btn-fialgo-primary h-8 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <ArrowUpRight size={13} />
                  <span>Pay Now</span>
                </button>
              )}
            </div>

            {/* Audit Calculation Breakdown Grid (Clean Monospace Tiles) */}
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-2 text-xs">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-2">
                Settlement Financial Breakdown (Audited Real MT5 Data)
              </span>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-neutral-400">Gross Realised Winning Profit:</span>
                <span className="font-bold text-emerald-400">+{curr}{settlement.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-neutral-400">Gross Realised Trading Losses:</span>
                <span className="font-bold text-rose-400">-{curr}{settlement.gross_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-neutral-400">Broker Commissions &amp; Swaps:</span>
                <span className="font-bold text-neutral-400">-{curr}{(settlement.commissions + settlement.swaps).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.08] font-bold">
                <span className="text-white">Net Realised Closed Profit:</span>
                <span className={settlement.net_realised_profit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {settlement.net_realised_profit >= 0 ? '+' : ''}{curr}{settlement.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-neutral-400">Previous Loss Offset (Carry-Forward):</span>
                <span className="font-bold text-neutral-400">-{curr}{settlement.previous_loss_carried.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between py-2 rounded bg-black/40 px-3 border border-white/5 font-bold mt-1">
                <span className="text-white text-[11px] uppercase tracking-wider">Eligible Profit for 50/50 Split:</span>
                <span className="text-emerald-400 text-sm">
                  {curr}{settlement.eligible_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 50/50 Split Results */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Your Share (50%)</span>
                  <span className="text-base font-bold text-white block">
                    +{curr}{settlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">Retained 100% in MT5</span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Tradifive Share (50%)</span>
                  <span className="text-base font-bold text-blue-400 block">
                    {curr}{settlement.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">Agreed Platform Fee</span>
                </div>
              </div>
            </div>

            {/* Closed Trades List (Items) */}
            {settlement.items && settlement.items.length > 0 && (
              <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                    Trade-Wise Execution Ledger ({settlement.items.length} Closed Deals)
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Zero Floating P&amp;L
                  </span>
                </div>

                <div className="overflow-x-auto [scrollbar-width:none]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-neutral-500 text-[9px] font-bold uppercase tracking-widest">
                        <th className="py-1.5">Ticket</th>
                        <th className="py-1.5">Symbol</th>
                        <th className="py-1.5">Type</th>
                        <th className="py-1.5">Lots</th>
                        <th className="py-1.5 text-right">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {settlement.items.map((item) => (
                        <tr key={item.id || item.ticket}>
                          <td className="py-1.5 text-neutral-400">#{item.ticket}</td>
                          <td className="py-1.5 font-bold text-white">{item.symbol}</td>
                          <td className="py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              item.trade_type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {item.trade_type}
                            </span>
                          </td>
                          <td className="py-1.5 text-neutral-300">{item.lot_size}</td>
                          <td className={`py-1.5 text-right font-bold ${item.net_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
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
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Verified Payment Receipt #{settlement.receipt_number || "REC-TRDF-VERIFIED"}</span>
                </div>
                <div className="text-neutral-300 space-y-0.5 text-[11px] font-mono">
                  <p>Method: <b className="text-white">{settlement.payment_method || "Online Payment Gateway"}</b></p>
                  <p>Reference: <span className="text-white">{settlement.payment_reference || "N/A"}</span></p>
                  <p>Cleared: {settlement.paid_at ? new Date(settlement.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : "Verified"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[10px] text-neutral-500 font-mono">
              Governed by FiAlgo V1 Operating Agreement
            </span>

            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-mono font-bold transition-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
