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
    <div className="p-3 sm:p-4 rounded-[22px] transition-all flex flex-col justify-start relative overflow-hidden isolate border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none">

      {/* Header row — always visible & interactive */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-[#22D99A]/10 text-[#22D99A]" : "bg-slate-200/50 dark:bg-zinc-800 text-slate-500"
            }`}>
            <Icon size={16} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className={`text-[14px] font-semibold truncate leading-tight antialiased ${active ? "text-slate-800 dark:text-[#F5F7FA]" : "text-slate-500 dark:text-[#E2E7EE]"
              }`}>
              {title}
            </h3>
            <p className="text-[11px] font-normal text-slate-400 dark:text-[#778396] antialiased truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {value !== undefined && (
            <span className={`text-[11.5px] font-bold px-3 py-1.5 rounded-lg ${active ? "bg-emerald-50 text-emerald-600 dark:bg-[#22D99A]/10 dark:text-[#22D99A]" : "bg-slate-100 text-slate-500 dark:bg-[#22252A] dark:text-[#9AA6B6]"
              }`}>
              {value}
            </span>
          )}
          <Switch checked={active} onChange={onToggle} />
        </div>
      </div>

      {/* Children content area */}
      {children && (
        <div className="relative pt-3 mt-2 border-t border-slate-100 dark:border-[#2B2F35]">
          {/* Actual content */}
          <div className={`transition-all duration-300 ${active ? " opacity-40 pointer-events-none select-none" : ""}`}>
            {children}
          </div>

          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-2"
              >
                <div className="flex flex-col items-center gap-1 p-2 text-center">
                  <Lock className="text-slate-400 dark:text-[#E8ECF2] mb-0.5" size={16} />
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-[#E8ECF2] uppercase">
                    Protocol Guard Active
                  </span>
                  <p className="text-[9px] font-medium text-slate-400/80 dark:text-[#9AA4B2] leading-tight max-w-[200px]">
                    Configuration is locked to prevent trade disruption while running.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
