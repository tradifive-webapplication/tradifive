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
            1. Frosted Backdrop Veil:
            Confined strictly to THIS page container (<main>).
            Does NOT cover or blur the AppSidebar or outer layout.
          */}
          <div className="absolute inset-0 backdrop-blur-[5px] bg-slate-900/[0.08] dark:bg-black/35 pointer-events-none rounded-[inherit]" />

          {/* 
            2. Atmospheric Vignette & Corner Shadow Falloff for this page:
            Soft ambient shadow along top, bottom, left, right, and 4 corners of the page container.
          */}
          <div
            className="absolute inset-0 pointer-events-none select-none rounded-[inherit]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(15, 23, 42, 0) 30%, rgba(15, 23, 42, 0.16) 68%, rgba(15, 23, 42, 0.42) 100%)",
              boxShadow: "inset 0 0 100px 25px rgba(15, 23, 42, 0.22)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none select-none hidden dark:block rounded-[inherit]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0.38) 65%, rgba(0, 0, 0, 0.75) 100%)",
              boxShadow: "inset 0 0 130px 35px rgba(0, 0, 0, 0.6)",
            }}
          />

          {/* 
            3. Centered Organic Glassmorphic Card:
            Dead center in THIS PAGE area (not full screen across the sidebar).
            Pebble-soft rounded corners, diffused ambient halo, no harsh box outline.
          */}
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-lg w-full pointer-events-auto my-auto"
            >
              {/* Feathered ambient shadow halo behind the card to dissolve hard box edges */}
              <div className="absolute -inset-6 sm:-inset-8 bg-slate-900/15 dark:bg-black/60 rounded-[50px] blur-3xl pointer-events-none -z-10" />

              {/* Glassmorphic body with soft organic curves */}
              <div className="relative bg-white/85 dark:bg-[#12151e]/90 backdrop-blur-3xl border border-white/70 dark:border-white/10 rounded-[36px] sm:rounded-[42px] p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.18),0_0_50px_rgba(255,255,255,0.4)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85),0_0_35px_rgba(255,255,255,0.03)] text-center overflow-hidden">
                {/* Subtle top light sheen */}
                <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide mb-4 shadow-sm">
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
                <div className="bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl p-3 mb-6 text-left">
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
