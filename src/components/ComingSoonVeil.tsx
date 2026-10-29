import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ComingSoonVeilProps {
  featureTitle: string;
}

export default function ComingSoonVeil({ featureTitle }: ComingSoonVeilProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page-veil-active"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-30 rounded-[inherit] pointer-events-none overflow-hidden"
      >
        {/* Soft, light 25% blur confined strictly to THIS page container (<main>) */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/20 dark:bg-black/25 pointer-events-none rounded-[inherit]" />

        {/* Centered human-crafted card */}
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-sm w-full pointer-events-auto my-auto"
          >
            <div className="relative bg-white/95 dark:bg-[#14161f]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-7 sm:p-8 shadow-xl text-center">
              {/* Subtle status tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Coming Soon</span>
              </div>

              {/* Page / Feature Title */}
              <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight mb-2.5">
                {featureTitle}
              </h2>

              {/* Human Message */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-xs mx-auto">
                We're actively finalizing this feature for launch. In the meantime, you can explore Auto Trade or check the community feed.
              </p>

              {/* Clean Human Actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/auto-trade/dashboard")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Go to Auto Trade
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                >
                  View Feed →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
