import React from "react";
import { Activity, Home, Eye, Sparkles, ChevronUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ComingSoonVeilProps {
  featureTitle: string;
  featureDesc?: string;
  isPeeking?: boolean;
  onPeekChange?: (peeking: boolean) => void;
}

export default function ComingSoonVeil({
  featureTitle,
  featureDesc,
  isPeeking = false,
  onPeekChange,
}: ComingSoonVeilProps) {
  const navigate = useNavigate();

  const setPeeking = (val: boolean) => {
    if (onPeekChange) onPeekChange(val);
  };

  return (
    <AnimatePresence mode="wait">
      {!isPeeking ? (
        <motion.div
          key="page-veil-active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-30 rounded-[inherit] pointer-events-none overflow-hidden"
        >
          {/* 
            Clean Frosted Backdrop Veil:
            Confined strictly to THIS page container (<main>).
            Pure, smooth, gentle blur across the page with clean borders.
            No dark vignette, no dirty corners.
          */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/20 dark:bg-black/25 pointer-events-none rounded-[inherit]" />

          {/* 
            Centered Card:
            Dead center in this page area.
            Smooth, soft elevation shadow and clean rounded borders.
          */}
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-lg w-full pointer-events-auto my-auto"
            >
              {/* Clean card body with smooth shadows and rounded corners */}
              <div className="relative bg-white/95 dark:bg-[#13161f]/95 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 rounded-[32px] sm:rounded-[36px] p-7 sm:p-9 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-center overflow-hidden">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.07] border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide mb-4 shadow-sm">
                  <Sparkles size={13} className="text-amber-500 animate-pulse" />
                  <span>Coming Up Next</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-snug">
                  {featureTitle} is on the way
                </h2>

                {/* Human, simple explanation */}
                <div className="space-y-2 mb-6 text-slate-600 dark:text-slate-300 text-xs sm:text-[13.5px] leading-relaxed max-w-md mx-auto">
                  <p>
                    {featureDesc ||
                      "We are launching TradiFive step by step to ensure every tool is fast, accurate, and completely reliable for your trading."}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[12px] sm:text-[12.5px]">
                    Right now, <strong className="text-slate-900 dark:text-white font-semibold">Auto Trade</strong> and our <strong className="text-slate-900 dark:text-white font-semibold">Social Feed</strong> are fully active and live. We're finalizing this section and will open it very soon.
                  </p>
                </div>

                {/* Systematic 2-Step Roadmap Indicator */}
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-2xl p-3 mb-6 text-left">
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Stage 1 (Live Now):</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate">FiAlgo Auto Trade & Community Feed</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500/80 ring-4 ring-amber-500/15" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Stage 2 (Finalizing):</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate">{featureTitle}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center mb-4">
                  <button
                    onClick={() => navigate("/auto-trade/dashboard")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Activity size={14} /> Open Auto Trade (Live)
                  </button>
                  <button
                    onClick={() => navigate("/home")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <Home size={14} /> View Social Feed
                  </button>
                </div>

                {/* Peek / Preview Page Layout Option */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => setPeeking(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer py-1.5 px-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <Eye size={13} /> Peek at the page layout
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer py-1.5 px-2.5"
                  >
                    <ArrowLeft size={12} /> Go back
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Minimized floating pill when user is peeking at the page */
        <motion.div
          key="page-veil-minimized"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-6 right-6 z-40 pointer-events-auto"
        >
          <button
            onClick={() => setPeeking(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 dark:bg-[#1a1e27]/95 text-white text-xs font-bold shadow-2xl border border-white/15 backdrop-blur-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>{featureTitle} is coming soon</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] text-slate-200 ml-1">
              Show Details
            </span>
            <ChevronUp size={14} className="text-slate-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
