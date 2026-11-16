import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, CreditCard, QrCode, CheckCircle2, Copy, Check, 
  RefreshCw, Wallet
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
    toast.info("Razorpay Gateway in Live Configuration Mode. Please use Instant UPI QR or Corporate USDT for direct zero-fee settlement verification.");
    setSelectedMethod("upi_qr");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          className="relative w-full max-w-[520px] rounded-lg border border-white/10 bg-[#1E1E1E] p-5 shadow-2xl text-white max-h-[92vh] overflow-y-auto font-mono text-xs [scrollbar-width:none]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 text-blue-400 flex items-center justify-center shrink-0">
                <CreditCard size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  Remit Weekly Profit Share
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Settlement #{settlement.settlement_number} · MT5 #{settlement.mt5_account_number || "Connected"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded bg-black/30 hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-none flex items-center justify-center cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          {/* Amount Due Card (Clean Monospace Admin Card) */}
          <div className="p-4 rounded-lg bg-black/30 border border-white/5 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">
                Tradifive 50% Platform Share
              </span>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {amountPayableFormatted}
              </div>
              <span className="text-[10px] text-neutral-500">
                {settlement.week_label}
              </span>
            </div>

            <div className="p-2.5 rounded bg-black/40 border border-white/5 text-right">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest block mb-0.5">Retained in MT5</span>
              <span className="text-sm font-bold text-emerald-400">+{curr}{settlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSelectedMethod("upi_qr")}
              className={`p-2.5 rounded-lg border text-left transition-none cursor-pointer ${
                selectedMethod === "upi_qr"
                  ? "bg-blue-600/15 border-blue-500/40 text-white"
                  : "bg-black/30 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <QrCode size={14} className="mb-1 text-blue-400" />
              <div className="text-xs font-bold font-sans">Instant UPI QR</div>
              <div className="text-[9px] text-neutral-500 mt-0.5">GPay, PhonePe</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("crypto_usdt")}
              className={`p-2.5 rounded-lg border text-left transition-none cursor-pointer ${
                selectedMethod === "crypto_usdt"
                  ? "bg-emerald-600/15 border-emerald-500/40 text-white"
                  : "bg-black/30 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <Wallet size={14} className="mb-1 text-emerald-400" />
              <div className="text-xs font-bold font-sans">USDT Crypto</div>
              <div className="text-[9px] text-neutral-500 mt-0.5">TRC-20</div>
            </button>

            <button
              type="button"
              onClick={handleRazorpayClick}
              className={`p-2.5 rounded-lg border text-left transition-none cursor-pointer ${
                selectedMethod === "razorpay"
                  ? "bg-purple-600/15 border-purple-500/40 text-white"
                  : "bg-black/30 border-white/5 text-neutral-400 hover:border-white/10"
              }`}
            >
              <CreditCard size={14} className="mb-1 text-purple-400" />
              <div className="text-xs font-bold font-sans">Razorpay</div>
              <div className="text-[9px] text-amber-400 mt-0.5">Setup Mode</div>
            </button>
          </div>

          {/* Tab 1: UPI QR Method */}
          {selectedMethod === "upi_qr" && (
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-24 h-24 bg-black/50 p-2 rounded-lg border border-white/10 flex flex-col items-center justify-center shrink-0 font-mono text-[9px] text-center font-bold text-white">
                  <span>SCAN UPI</span>
                  <span className="text-[8px] text-emerald-400 mt-1">₹{settlement.amount_payable.toFixed(0)}</span>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">
                    Official Settlement VPA
                  </span>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5 font-mono text-xs">
                    <span className="font-bold text-white flex-1 truncate">{upiId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(upiId, "upi")}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {copiedUpi ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-sans leading-tight">
                    Scan with Google Pay, PhonePe, Paytm, or BHIM. Zero processing fee.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Crypto USDT Method */}
          {selectedMethod === "crypto_usdt" && (
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 mb-4 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-300 font-bold">TRC-20 Address:</span>
                <span className="text-[9px] font-bold text-emerald-400">~1.0 USDT Fee</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5 text-xs">
                <span className="font-bold text-white flex-1 truncate">{usdtAddress}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(usdtAddress, "crypto")}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  {copiedCrypto ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 font-sans">
                Send exact equivalent of {amountPayableFormatted}. Blockchain verification completes in 3 minutes.
              </p>
            </div>
          )}

          {/* Verification Input: Reference / UTR / TXID */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                Transaction Reference Number (UTR / Bank Ref / TXID) *
              </label>
              <input
                type="text"
                placeholder="e.g. 430194820192 or 0x9f482..."
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded text-xs font-mono text-white focus:outline-none focus:border-white/20 transition-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                Upload Payment Receipt Screenshot (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-white/10 file:text-[10px] file:font-mono file:font-bold file:bg-white/5 file:text-neutral-300 hover:file:bg-white/10 cursor-pointer"
              />
            </div>
          </div>

          <p className="text-[10px] text-neutral-500 text-center mb-4 leading-tight font-sans">
            FiAlgo never debits directly from your MT5 account. Submitting this reference logs an immutable settlement clearance.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider transition-none cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting || !transactionRef.trim()}
              onClick={handlePaymentSubmit}
              className="flex-1 h-9 btn-fialgo-primary text-xs font-bold uppercase tracking-wider transition-none inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Confirm Clearance</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
