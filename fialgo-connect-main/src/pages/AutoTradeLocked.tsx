import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Lock, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AutoTradeLocked() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full text-center bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-none relative overflow-hidden"
        >
          {/* Locked Icon Badge */}
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-zinc-200 shadow-xs mb-5">
            <Lock size={24} className="stroke-[2]" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <Activity size={10} className="stroke-[2.5]" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold mb-3">
            <Lock size={11} className="stroke-[2]" />
            Elite Early Access · Coming Soon
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            AI Auto-Trade Coming Soon
          </h2>

          <p className="text-[13px] text-slate-500 dark:text-neutral-400 leading-relaxed mb-6">
            AI-assisted automated execution is launching soon for Elite members while undergoing final risk calibrations.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] mb-6 text-left flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-slate-800 dark:text-neutral-200">
                Institutional Risk Guard Active
              </p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-400 mt-0.5">
                All capital safety rules, max drawdown breakers, and cooldown shields continue protecting your account.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/risk-guard")}
              className="w-full sm:flex-1 h-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <span>Open Risk Guard</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto h-[42px] px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-[13px] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
