import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, CreditCard, QrCode, CheckCircle2, Copy, Check, 
  ArrowRight, ShieldCheck, RefreshCw, AlertCircle, Upload, Wallet
} from "lucide-react";
import { Settlement, PaymentGatewayType } from "@/types/settlement";
import { submitSettlementPayment } from "@/services/settlementService";
import { toast } from "sonner";

interface SettlementPaymentModalProps {
  settlement: Settlement | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (receiptNumber: string) => void;
  userId: string;
}

export default function SettlementPaymentModal({
  settlement,
  isOpen,
  onClose,
  onPaymentSuccess,
  userId
}: SettlementPaymentModalProps) {
  if (!isOpen || !settlement) return null;

  const [selectedMethod, setSelectedMethod] = useState<PaymentGatewayType>("upi_qr");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedCrypto, setCopiedCrypto] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const curr = settlement.currency === "USC" ? "USC " : "₹";
  const amountPayableFormatted = `${curr}${settlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const upiId = "tradifive.settlements@icici";
  const usdtAddress = "TYuH5N8qX7mKjLwP9vB3zR1sQa4eCtFd2M";

  const handleCopy = (text: string, type: "upi" | "crypto") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      toast.success("UPI ID copied to clipboard!");
    } else {
      setCopiedCrypto(true);
      setTimeout(() => setCopiedCrypto(false), 2000);
      toast.success("USDT TRC-20 Address copied to clipboard!");
    }
  };

  const handlePaymentSubmit = async () => {
    if (!transactionRef.trim()) {
      toast.error("Please enter your transaction reference number (UTR / TXID) to verify clearance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSettlementPayment(settlement.id, {
        userId,
        gateway: selectedMethod,
        amount: settlement.amount_payable,
        paymentReference: transactionRef.trim(),
        proofUrl: proofFile ? proofFile.name : undefined
      });

      if (res.success) {
        toast.success(`Weekly settlement cleared! Receipt #${res.receiptNumber}`);
        onPaymentSuccess(res.receiptNumber);
        onClose();
      }
    } catch (e) {
      toast.error("Error submitting settlement payment. Please check your reference.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayClick = () => {
    // Official Razorpay integration placeholder check
    toast.info("Razorpay Gateway in Live Configuration Mode. Please use Instant UPI QR or Corporate USDT for direct zero-fee settlement verification.");
    setSelectedMethod("upi_qr");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-[560px] rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1A1F2C] dark:border-[1px] dark:border-white/10 text-slate-800 dark:text-white max-h-[94vh] overflow-y-auto [scrollbar-width:none]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Remit Weekly Profit Share
                </h3>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  Settlement #{settlement.settlement_number}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Amount Due Card */}
          <div className="p-4 rounded-[18px] border-2 border-white bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white dark:bg-none dark:bg-[#161B26] shadow-[0_4px_10px_-5px_rgba(37,99,235,0.12),0_0_0_2px_#DBEAFE] dark:border-blue-500/30 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                Tradifive 50% Platform Share
              </span>
              <div className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {amountPayableFormatted}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                MT5 #{settlement.mt5_account_number} • {settlement.week_label}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-blue-200 dark:border-white/10 text-right">
              <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Customer Profit Retained</span>
              <span className="text-xs font-bold text-emerald-600">+{curr}{settlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSelectedMethod("upi_qr")}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selectedMethod === "upi_qr"
                  ? "bg-blue-50/60 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold shadow-xs"
                  : "bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <QrCode size={16} className="mb-1 text-blue-600 dark:text-blue-400" />
              <div className="text-xs font-bold leading-tight">Instant UPI QR</div>
              <div className="text-[10px] text-slate-400 mt-0.5">GPay, PhonePe, Paytm</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("crypto_usdt")}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selectedMethod === "crypto_usdt"
                  ? "bg-blue-50/60 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold shadow-xs"
                  : "bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Wallet size={16} className="mb-1 text-emerald-600" />
              <div className="text-xs font-bold leading-tight">USDT Crypto</div>
              <div className="text-[10px] text-slate-400 mt-0.5">TRC-20 / BEP-20</div>
            </button>

            <button
              type="button"
              onClick={handleRazorpayClick}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                selectedMethod === "razorpay"
                  ? "bg-blue-50/60 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold shadow-xs"
                  : "bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <CreditCard size={16} className="mb-1 text-purple-600" />
              <div className="text-xs font-bold leading-tight">Razorpay Gateway</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Live Setup Mode</div>
            </button>
          </div>

          {/* Tab 1: UPI QR Method */}
          {selectedMethod === "upi_qr" && (
            <div className="p-4 rounded-[18px] bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Visual QR Code Box */}
                <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                  <div className="w-full h-full bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center font-mono text-[9px] text-center p-1 font-bold">
                    <span>SCAN UPI</span>
                    <span className="text-[7.5px] text-emerald-400 mt-1">₹{settlement.amount_payable.toFixed(0)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tradifive Official Settlement VPA
                  </span>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex-1">{upiId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(upiId, "upi")}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                    >
                      {copiedUpi ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Scan via Google Pay, PhonePe, Paytm, or BHIM. Zero processing surcharge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Crypto USDT Method */}
          {selectedMethod === "crypto_usdt" && (
            <div className="p-4 rounded-[18px] bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 mb-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">TRON Network (TRC-20) Address:</span>
                <span className="text-[10px] font-bold text-emerald-600">~1.0 USDT Fee</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex-1 truncate">{usdtAddress}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(usdtAddress, "crypto")}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  {copiedCrypto ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Send exact equivalent of {amountPayableFormatted}. Blockchain verification completes within 3 minutes.
              </p>
            </div>
          )}

          {/* Verification Input: Reference / UTR / TXID */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Reference Number (UTR / Bank Ref / TXID): *
              </label>
              <input
                type="text"
                placeholder="e.g. 430194820192 or 0x9f482..."
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Upload Payment Receipt Screenshot (Optional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Legal Note */}
          <p className="text-[10.5px] text-slate-400 text-center mb-4 leading-tight">
            Tradifive never debits directly from your MT5 account. Submitting this reference logs an immutable settlement receipt with Finance Desk.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting || !transactionRef.trim()}
              onClick={handlePaymentSubmit}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                transactionRef.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Confirm Settlement Clearance</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
