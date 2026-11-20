import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Lock, 
  Cpu, 
  TrendingUp,
  Activity,
  Server,
  CheckCircle2,
  Gauge
} from "lucide-react";

interface AutoTradeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AutoTradeConfirmModal({
  isOpen,
  onClose,
  onConfirm
}: AutoTradeConfirmModalProps) {
  // Toggle backside page scaling & blur when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("tf-sheet-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.classList.remove("tf-sheet-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("tf-sheet-open");
    }
  }, [isOpen, onClose]);

  const handleConfirmClick = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex flex-col justify-end sm:justify-center items-center pointer-events-auto p-0 sm:p-4">
        {/* Backdrop (Darkens and triggers blur on backside page) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-[6px] cursor-pointer"
        />

        {/* Modal / Drawer Dialog matching Big-Tech Apple & Linear styling */}
        <motion.div
          initial={{ y: "100%", opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 450) {
              onClose();
            }
          }}
          className="relative w-full max-w-[840px] rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-[#121214] border-t sm:border border-slate-200/90 dark:border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto amazing-scrollbar text-slate-900 dark:text-white font-sans z-10"
        >
          {/* Top handle pill for pulling down on mobile */}
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mt-3.5 mb-2 cursor-grab active:cursor-grabbing hover:bg-slate-400 dark:hover:bg-white/40 transition-colors sm:hidden" />

          {/* Close button (Circular tactile pill) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 sm:top-6 right-4 sm:right-6 w-9 h-9 rounded-full tactile-white-pill text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200/80 dark:border-white/10 shadow-2xs active:scale-95 z-20"
          >
            <X size={15} strokeWidth={2.4} />
          </button>

          <div className="p-6 sm:p-9 pt-4 sm:pt-7">
            {/* ── HEADER ── */}
            <div className="space-y-2 pr-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10.5px] font-extrabold uppercase tracking-[0.16em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <Cpu size={12} className="shrink-0 text-blue-600 dark:text-blue-400" />
                <span>FIALGO QUANTITATIVE ENGINE · MT5</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                Are you sure you want to open AutoTrade?
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed max-w-2xl">
                You are about to leave TradiFive and launch the dedicated <strong className="text-slate-800 dark:text-neutral-200">FiAlgo AutoTrade Engine</strong>.
              </p>
            </div>

            {/* ── LIVE ENGINE TELEMETRY STRIP ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Server size={15} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block leading-tight">Execution Server</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">London Equinix LD4</span>
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Activity size={15} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block leading-tight">Broker Latency</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate block">0.8ms · Zero Slippage</span>
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Gauge size={15} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block leading-tight">Quant Strategy</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">Gold Sniper + Scalper</span>
                </div>
              </div>
            </div>

            {/* ── WHAT IS AUTOTRADE? EXPLANATION BOX ── */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#18181B] border border-slate-200/80 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200">
                <Bot size={15} className="text-blue-600 dark:text-blue-400" />
                <span>What is AutoTrade?</span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                AutoTrade is FiAlgo’s institutional algorithmic execution platform. Rather than trading manually with fear or fatigue, our battle-tested quantitative algorithms run around the clock on your <strong>MetaTrader 5 (MT5)</strong> account, automatically finding entries, managing trailing stops, and capturing profits with zero emotional bias.
              </p>
            </div>

            {/* ── 4 CORE HIGHLIGHT TILES ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              {/* Tile 1: Speed */}
              <motion.div 
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/5 hover:border-blue-500/30 transition-all space-y-1.5 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                  <Zap size={16} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Microsecond Execution Speed
                </h4>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-normal">
                  Direct broker API routing (Exness, Vantage, XM, Fusion) for instant sub-millisecond execution without slippage or delays.
                </p>
              </motion.div>

              {/* Tile 2: Discipline & Risk */}
              <motion.div 
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/5 hover:border-emerald-500/30 transition-all space-y-1.5 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                  <ShieldCheck size={16} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Discipline Shield &amp; Risk Guard
                </h4>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-normal">
                  Hard automated stop losses, dynamic lot calculation, and max daily drawdown protection to secure your capital 24/5.
                </p>
              </motion.div>

              {/* Tile 3: 100% Hands-Free */}
              <motion.div 
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/5 hover:border-purple-500/30 transition-all space-y-1.5 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                  100% Hands-Free 24/5 Execution
                </h4>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-normal">
                  Specialized quantitative models trade Gold (XAUUSD) and major FX pairs continuously while you go about your day.
                </p>
              </motion.div>

              {/* Tile 4: Transparent Plans */}
              <motion.div 
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/5 hover:border-amber-500/30 transition-all space-y-1.5 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
                  <Sparkles size={16} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Transparent &amp; Flexible Plans
                </h4>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-normal">
                  Keep 100% of all profits with the 3-Year Unlimited EA Pass (₹1,00,000) or trade with $0 upfront on our 50/50 profit share.
                </p>
              </motion.div>
            </div>

            {/* ── SECURITY GUARANTEE ── */}
            <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-neutral-400">
              <Lock size={13} className="text-emerald-500 shrink-0" />
              <span>
                <strong className="text-slate-800 dark:text-neutral-200">Non-Custodial Security:</strong> Your money never leaves your regulated broker. You have full instant manual override and kill switch anytime.
              </span>
            </div>

            {/* ── SYSTEMIC FOOTER ACTION BUTTONS ── */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5 mt-6">
              {/* Secondary Systemic Button: Tactile White Pill */}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-11 px-6 rounded-full tactile-white-pill text-xs sm:text-[13px] font-bold text-slate-700 dark:text-zinc-200 border border-slate-200/90 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              >
                Cancel / Stay on TradiFive
              </button>
              
              {/* Primary Systemic Button: Branded Vibrant Blue Tactile Pill */}
              <button
                type="button"
                onClick={handleConfirmClick}
                className="w-full sm:w-auto h-11 px-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-[13px] inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all cursor-pointer select-none"
              >
                <span>Confirm &amp; Enter AutoTrade</span>
                <ArrowRight size={15} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
