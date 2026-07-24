import React from "react";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

export function RiskGuardCard({
  icon: Icon,
  title,
  description,
  value,
  active,
  onToggle,
  children
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  value?: string | number;
  active: boolean;
  onToggle: (val: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`p-4 sm:p-5 rounded-[22px] transition-all flex flex-col justify-start relative overflow-hidden isolate ${active
        ? "border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-[0_4px_12px_-4px_rgba(16,185,129,0.15)]"
        : "border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none"
      }`}>

      {/* Header row — always visible & interactive */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200/50 dark:bg-zinc-800 text-slate-500"
            }`}>
            <Icon size={16} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className={`text-[13px] font-bold truncate leading-tight ${active ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}>
              {title}
            </h3>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {value !== undefined && (
            <span className={`text-[11.5px] font-bold px-3 py-1.5 rounded-lg ${active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400"
              }`}>
              {value}
            </span>
          )}
          <Switch checked={active} onChange={onToggle} />
        </div>
      </div>

      {/* Children content area */}
      {children && (
        <div className="relative pt-4 mt-3 border-t border-slate-100 dark:border-white/5">
          {/* Actual content — blurred when active */}
          <div className={`transition-all duration-300 ${active ? "blur-[3px] select-none pointer-events-none opacity-60" : ""}`}>
            {children}
          </div>

          {/* Lock overlay — shown only when active */}
          <AnimatePresence>
            {active && (
              <motion.div
                key="lock-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10"
              >
                <Lock size={18} className="text-slate-400 dark:text-slate-500 mb-0.5" strokeWidth={1.8} />
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Protocol Guard Active
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-snug max-w-[200px]">
                  Configuration is locked to prevent trade disruption while running.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
