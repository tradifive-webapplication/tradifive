import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Crown, CheckCircle2, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProSubscriptionModal({ isOpen, onClose, onSuccess }: ProSubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful! Welcome to Creator Pro.");
      onSuccess();
      onClose();
    }, 2000);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={!isProcessing ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-[#151515] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Area */}
            <div className="p-6 pb-0 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[50px] rounded-full" />
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors z-20 text-slate-500 dark:text-slate-400"
              >
                <X size={16} />
              </button>

              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 relative z-10">
                <Crown size={32} className="text-white" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white relative z-10">Creator Pro</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6 relative z-10">Unlock powerful monetization and analytics tools for serious traders.</p>
            </div>

            {/* Features */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#1A1A1E] border-y border-slate-100 dark:border-white/5 space-y-3">
              {[
                "Publish Premium Posts (blurred for non-subscribers)",
                "Offer monthly subscriptions to your profile",
                "Receive tips and donations on your content",
                "Advanced Creator Analytics Dashboard",
                "Verified PRO badge on your profile"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-purple-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing & Checkout */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 p-4 rounded-xl border-2 border-purple-500 bg-purple-500/5">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Monthly Plan</div>
                  <div className="text-xs text-slate-500 mt-0.5">Cancel anytime</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 dark:text-white">₹1,499</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">/ month</div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} /> Subscribe Now
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure encrypted payment processing
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
