import React from "react";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LayoutGrid, Check } from "lucide-react";

type CardIntent = "trading" | "warning" | "discipline" | "emergency";

export function RiskGuardCard({
  icon: Icon,
  title,
  description,
  value,
  active,
  onToggle,
  intent = "trading",
  activeContent,
  pinned,
  onTogglePin,
  fixedBodyHeight = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  value?: string | number;
  active: boolean;
  onToggle: (val: boolean) => void;
  intent?: CardIntent;
  activeContent?: React.ReactNode;
  pinned?: boolean;
  onTogglePin?: () => void;
  fixedBodyHeight?: boolean;
  children?: React.ReactNode;
}) {
  const activeIconStyle =
    intent === "emergency"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
      : intent === "warning"
      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
      : "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";

  const activeBadgeStyle =
    intent === "emergency"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
      : intent === "warning"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
      : "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400";

  // Hide redundant "Disabled" / "Active" pills when the toggle switch already communicates on/off
  const valueStr = value !== undefined ? String(value).trim() : "";
  const showValuePill =
    valueStr.length > 0 &&
    valueStr.toLowerCase() !== "disabled" &&
    valueStr.toLowerCase() !== "active";

  const bodySizeClass = fixedBodyHeight ? "min-h-[148px] flex flex-col justify-between" : "";

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-[16px] transition-colors flex flex-col justify-start relative overflow-hidden isolate bg-white dark:bg-[#17171A] border shadow-[0_2px_8px_rgba(15,23,42,0.035),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none ${
        active
          ? intent === "emergency"
            ? "border-rose-200/80 dark:border-rose-500/25"
            : intent === "warning"
            ? "border-amber-200/80 dark:border-amber-500/25"
            : "border-blue-200/80 dark:border-blue-500/25"
          : "border-slate-200/70 dark:border-white/[0.07]"
      }`}
    >
      {/* Header row — compact, zero clutter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 transition-colors ${
              active
                ? activeIconStyle
                : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-neutral-400"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-[13px] font-semibold truncate leading-tight ${
                active
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

        <div className="flex items-center gap-1.5 shrink-0">
          {onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                pinned
                  ? "bg-blue-50 border-blue-200/80 text-[#2563EB] dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400"
                  : "bg-slate-50 border-slate-200/70 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-neutral-400 dark:hover:text-white"
              }`}
              title={
                pinned
                  ? "Pinned to Dashboard (click to remove)"
                  : "Add live widget to Dashboard"
              }
            >
              {pinned ? <Check size={10} strokeWidth={2.5} /> : <LayoutGrid size={10} />}
              <span>{pinned ? "Widget" : "+ Widget"}</span>
            </button>
          )}
          {showValuePill && (
            <span
              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md tabular-nums ${
                active
                  ? activeBadgeStyle
                  : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-neutral-400"
              }`}
            >
              {valueStr}
            </span>
          )}
          <Switch size="sm" checked={active} onChange={onToggle} />
        </div>
      </div>

      {/* Active custom live view (e.g. Rewards Gauge) OR original blurred edit controls */}
      {active && activeContent ? (
        <div className={`pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/[0.06] ${bodySizeClass}`}>
          {activeContent}
        </div>
      ) : (
        children && (
          <div className={`relative pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/[0.06] ${bodySizeClass}`}>
            <div
              className={`transition-all duration-200 ${
                fixedBodyHeight ? "flex-1 flex flex-col justify-between" : ""
              } ${
                active && !fixedBodyHeight
                  ? "opacity-35 pointer-events-none select-none blur-[1px]"
                  : active
                  ? "opacity-35 pointer-events-none select-none blur-[1px]"
                  : ""
              }`}
            >
              {children}
            </div>

            <AnimatePresence>
              {active && (
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
        )
      )}
    </div>
  );
}
