import React, { useState } from "react";
import { Settlement } from "@/types/settlement";
import { adjustSettlementWithAudit } from "@/services/settlementService";
import { X, ShieldAlert, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { toast } from "sonner";

interface AdminSettlementAdjustModalProps {
  settlement: Settlement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}

export default function AdminSettlementAdjustModal({
  settlement,
  isOpen,
  onClose,
  onSuccess,
  adminId
}: AdminSettlementAdjustModalProps) {
  if (!isOpen || !settlement) return null;

  const [newAmount, setNewAmount] = useState<string>(settlement.amount_payable.toString());
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid non-negative adjusted amount.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      toast.error("An auditable reason with at least 10 characters is required by compliance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adjustSettlementWithAudit(
        settlement.id,
        parsedAmount,
        reason.trim(),
        adminId || "admin-system"
      );

      if (res.success) {
        toast.success("Settlement adjusted and logged in immutable audit records.");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to adjust settlement.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const diff = (parseFloat(newAmount) || 0) - settlement.amount_payable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#18181B] rounded-[24px] border-2 border-white dark:border-white/10 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Settlement Adjustment
              </h2>
              <p className="text-xs text-slate-400">
                Audited modification • ID: <span className="font-mono font-semibold">{settlement.settlement_number}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle size={14} />
              <span>Compliance Notice</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-amber-700 dark:text-amber-400">
              Settlement records are immutable by default. Any manual revision is permanently logged in the audit ledger with your admin identity and timestamp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase block">Current Payable</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                ₹{settlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase block">Net Trading Result</span>
              <span className="text-sm font-bold text-emerald-600 block mt-0.5">
                +₹{settlement.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Revised Amount Payable (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                step="any"
                min="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121214] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {diff !== 0 && (
              <p className={`text-[11px] font-semibold mt-1.5 ${diff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                Adjustment delta: {diff > 0 ? `+₹${diff.toFixed(2)}` : `-₹${Math.abs(diff).toFixed(2)}`}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Mandatory Adjustment Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Broker slippage rebate credited, trade #889211 reversed per broker desk..."
              rows={3}
              required
              minLength={10}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121214] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Minimum 10 characters. Stored in compliance audit log.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Committing..." : "Commit Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
