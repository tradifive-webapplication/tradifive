import React from "react";
import {
  MoreVertical,
  RefreshCw,
  Settings,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ComplianceMetric {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  badgeText: string;
  badgeVariant?: "emerald" | "blue" | "amber";
  percentageText: string;
  colorType: "green" | "blue" | "amber";
  icon: React.ReactNode;
}

interface RuleComplianceAnalyticsProps {
  score?: number;
  className?: string;
  onRefresh?: () => void;
}

export const RuleComplianceAnalytics: React.FC<RuleComplianceAnalyticsProps> = ({
  score = 96,
  className = "",
  onRefresh,
}) => {
  const metrics: ComplianceMetric[] = [
    {
      id: "sl",
      title: "MT5 Stop-Loss Protection",
      subtitle: "Every order opened with mandatory protective SL",
      value: 100,
      badgeText: "100% Verified",
      badgeVariant: "emerald",
      percentageText: "100%",
      colorType: "green",
      icon: <ShieldCheck size={16} className="text-emerald-500" />,
    },
    {
      id: "lots",
      title: "Lot Sizing Rule",
      subtitle: "Strict 1% account risk limit dynamically enforced",
      value: 95,
      badgeText: "0.05 – 0.10 Lots",
      badgeVariant: "blue",
      percentageText: "95%",
      colorType: "blue",
      icon: <Scale size={16} className="text-[#2563EB] dark:text-blue-400" />,
    },
    {
      id: "revenge",
      title: "Revenge Trade Shield",
      subtitle: "15-minute emotional cooldown respected post-loss",
      value: 100,
      badgeText: "0 Violations",
      badgeVariant: "emerald",
      percentageText: "100%",
      colorType: "green",
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
    },
    {
      id: "cap",
      title: "Daily Trade Cap",
      subtitle: "Strictly under maximum daily execution quota",
      value: 75,
      badgeText: "3 / 4 Trades",
      badgeVariant: "amber",
      percentageText: "75%",
      colorType: "amber",
      icon: <Clock size={16} className="text-amber-500" />,
    },
  ];

  const handleRefresh = () => {
    toast.success("Risk Guard Synced", {
      description: "Rule compliance metrics refreshed with Exness MT5 server.",
    });
    onRefresh?.();
  };

  const getGradientStyle = (color: "green" | "blue" | "amber") => {
    if (color === "green") {
      return {
        background: "repeating-linear-gradient(45deg, #059669 0 16px, #10B981 16px 32px)",
        boxShadow: "0 1px 6px rgba(16,185,129,0.35), inset 0 1px 1px rgba(255,255,255,0.6)",
      };
    }
    if (color === "amber") {
      return {
        background: "repeating-linear-gradient(45deg, #D97706 0 16px, #F59E0B 16px 32px)",
        boxShadow: "0 1px 6px rgba(245,158,11,0.35), inset 0 1px 1px rgba(255,255,255,0.6)",
      };
    }
    // Blue default (from user snippet: #0031F2 0 16px, #006DFE 16px 32px)
    return {
      background: "repeating-linear-gradient(45deg, #0031F2 0 16px, #006DFE 16px 32px)",
      boxShadow: "0 1px 6px rgba(0,109,254,0.4), inset 0 1px 1px rgba(255,255,255,0.6)",
    };
  };

  return (
    <div
      className={`border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#161619] rounded-[22px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-none p-4 sm:p-5 transition-all select-none ${className}`}
    >
      <style>{`
        @keyframes uiverseStripeMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 64px 0;
          }
        }
        @keyframes uiverseLightShimmer {
          0%, 100% {
            opacity: 0.95;
          }
          50% {
            opacity: 1;
            filter: brightness(1.12);
          }
        }
        .uiverse-3d-bar {
          animation: uiverseStripeMove 3.5s linear infinite, uiverseLightShimmer 2s ease-in-out infinite;
          background-size: 64px 100% !important;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-white/[0.06] gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
              <ShieldCheck size={16} />
            </div>
            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
              Rule Compliance Parameters
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 pl-9 font-medium">
            Synced with your Exness MT5 account &amp; live Risk Guard enforcer.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto pl-9 sm:pl-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse shrink-0" />
            <span className="text-[11px] font-extrabold text-[#2563EB] dark:text-blue-400 tabular-nums">
              Score: {score}/100
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-[#1E1E22]"
            >
              <DropdownMenuItem
                onClick={handleRefresh}
                className="cursor-pointer gap-2 text-xs font-semibold py-2"
              >
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                <span>Sync MT5 Rules</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toast.info(
                    "Risk Guard specifications: Max Risk 1%, SL Mandatory, 15m Cooldown."
                  )
                }
                className="cursor-pointer gap-2 text-xs font-semibold py-2"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Risk Guard Parameters</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── 4 COMPLIANCE METRICS WITH 3D HORIZONTAL BARS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {metrics.map((item) => (
          <div
            key={item.id}
            className="p-3.5 sm:p-4 rounded-[16px] bg-[#F8F9FC] dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition-all flex flex-col justify-between gap-3 shadow-[0_1px_3px_rgba(15,23,42,0.02)]"
          >
            {/* Top row: Title + Subtitle and Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">{item.icon}</span>
                  <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 truncate font-medium pl-5">
                  {item.subtitle}
                </p>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap shrink-0 tabular-nums ${
                  item.badgeVariant === "emerald"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/20"
                    : item.badgeVariant === "amber"
                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-500/20"
                    : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/70 dark:border-blue-500/20"
                }`}
              >
                {item.badgeText}
              </span>
            </div>

            {/* Bottom: 3D Horizontal Bar + Percentage */}
            <div className="flex items-center gap-3 pt-0.5">
              {/* 3D Track */}
              <div className="relative flex-1 h-[11px] rounded-full bg-[#E5E9F0] dark:bg-[#0D0D10] border border-slate-300/80 dark:border-white/10 p-[1.5px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] overflow-hidden">
                {/* 3D Horizontal Animated Striped Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={getGradientStyle(item.colorType)}
                  className="uiverse-3d-bar h-full rounded-full relative overflow-hidden"
                >
                  {/* Top 3D Specular Cylindrical Highlight (makes it look like a rounded 3D bar) */}
                  <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none rounded-t-full" />
                  
                  {/* Bottom shadow line for 3D depth */}
                  <div className="absolute inset-x-0 bottom-0 h-[30%] bg-black/20 pointer-events-none rounded-b-full" />
                </motion.div>
              </div>

              {/* Percentage text */}
              <span
                className={`text-[11.5px] font-extrabold tabular-nums shrink-0 min-w-[36px] text-right ${
                  item.colorType === "green"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : item.colorType === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-[#2563EB] dark:text-blue-400"
                }`}
              >
                {item.percentageText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleComplianceAnalytics;
