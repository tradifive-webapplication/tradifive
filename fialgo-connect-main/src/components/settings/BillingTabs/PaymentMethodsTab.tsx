import React from 'react';
import { RazorpayCheckoutButton } from '@/components/RazorpayCheckoutButton';
import { CreditCard, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function PaymentMethodsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Razorpay Payment Gateway
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active
                </span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Standard Web Checkout with automated HMAC signature verification
              </p>
            </div>
          </div>

          <RazorpayCheckoutButton
            amount={1}
            planId="test_verification"
            planName="Razorpay Test Verification"
            description="Testing Razorpay Checkout Integration (₹1.00)"
            buttonText="Test Checkout (₹1)"
          />
        </div>

        {/* Supported Channels */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instant Payments</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> UPI & QR
            </div>
            <p className="text-xs text-slate-500 mt-1">GPay, PhonePe, Paytm, BHIM</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cards Accepted</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Credit & Debit
            </div>
            <p className="text-xs text-slate-500 mt-1">Visa, Mastercard, RuPay, Amex</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Banking</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> NetBanking
            </div>
            <p className="text-xs text-slate-500 mt-1">50+ Indian Banks supported</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wallets</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Digital Wallets
            </div>
            <p className="text-xs text-slate-500 mt-1">Mobikwik, Freecharge, Airtel</p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-white/5">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>All transactions are encrypted with 256-bit SSL and verified with server-side HMAC-SHA256 signatures.</span>
        </div>
      </div>
    </div>
  );
}
