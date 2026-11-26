import React from "react";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type CardIntent = "trading" | "warning" | "discipline" | "emergency" | "positive";

export function RiskGuardCard({
  icon: Icon,
  title,
  description,
  value,
  active,
  onToggle,
  intent = "trading",
  hasDashboardWidget = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  value?: string | number;
  active: boolean;
  onToggle: (val: boolean) => void;
  intent?: CardIntent;
  hasDashboardWidget?: boolean;
  children?: React.ReactNode;
}) {
  const { isStarter } = usePlan();
  const navigate = useNavigate();
  const effectiveActive = isStarter ? false : active;

  const handleGuardedToggle = (val: boolean) => {
    if (isStarter) {
      toast.info("Pro & Elite Feature · Risk Guard", {
        description: "Upgrade to Pro or Elite to unlock live Risk Guard protection.",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/upgrade"),
        },
      });
      return;
    }
    onToggle(val);
  };

  const activeIconStyle =
    intent === "emergency"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
      : intent === "positive"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
      : intent === "warning"
      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
      : "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";

  const activeBadgeStyle =
    intent === "emergency"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
      : intent === "positive"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
      : intent === "warning"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
      : "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";

  // Hide redundant "Disabled" / "Active" pills when the toggle switch already communicates on/off
  const valueStr = value !== undefined ? String(value).trim() : "";
  const showValuePill =
    valueStr.length > 0 &&
    valueStr.toLowerCase() !== "disabled" &&
    valueStr.toLowerCase() !== "active";

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-[16px] transition-all flex flex-col justify-start relative overflow-hidden isolate bg-white dark:bg-[#17171A] border shadow-[0_2px_8px_rgba(15,23,42,0.035),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none ${
        effectiveActive
          ? intent === "emergency"
            ? "border-rose-200/80 dark:border-rose-500/25"
            : intent === "positive"
            ? "border-emerald-200/80 dark:border-emerald-500/25"
            : intent === "warning"
            ? "border-amber-200/80 dark:border-amber-500/25"
            : "border-blue-200/80 dark:border-blue-500/25"
          : "border-slate-200/70 dark:border-white/[0.07]"
      }`}
    >
      {/* Subtle top-left corner indicator when widget is pinned on Dashboard */}
      {hasDashboardWidget && (
        <span
          title="Live widget active on Dashboard"
          className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400 shadow-[0_0_6px_rgba(37,99,235,0.65)] pointer-events-none z-20"
        />
      )}

      {/* Header row — compact, zero clutter */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 transition-colors ${
              effectiveActive
                ? activeIconStyle
                : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-neutral-400"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-[13px] font-semibold truncate leading-tight ${
                effectiveActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-800 dark:text-neutral-200"
              }`}
            >
              {title}
            </h3>
            <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 truncate mt-0.5 leading-tight">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showValuePill && (
            <span
              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md tabular-nums ${
                effectiveActive
                  ? activeBadgeStyle
                  : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-neutral-400"
              }`}
            >
              {valueStr}
            </span>
          )}
          <Switch size="sm" checked={effectiveActive} onChange={handleGuardedToggle} />
        </div>
      </div>

      {/* Single unified content area — blurs and locks when switch is ON */}
      {children && (
        <div className="relative pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
          <div
            className={`transition-all duration-200 ${
              effectiveActive ? "opacity-35 pointer-events-none select-none blur-[1px]" : ""
            }`}
          >
            {children}
          </div>

          <AnimatePresence>
            {effectiveActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-10 pt-1.5"
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-[#1E1E22]/95 border border-slate-200/80 dark:border-white/10 shadow-sm">
                  <Lock
                    size={11}
                    className={
                      intent === "emergency"
                        ? "text-rose-500"
                        : intent === "positive"
                        ? "text-emerald-500"
                        : intent === "warning"
                        ? "text-amber-500"
                        : "text-[#2563EB] dark:text-blue-400"
                    }
                  />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-neutral-200">
                    Guard active · turn off to edit
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
