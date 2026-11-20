import React from "react";
import { MoreVertical, RefreshCw, Settings, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ComplianceMetric {
  title: string;
  subtitle: string;
  value: number;
  badgeText: string;
  percentageText: string;
  indicatorClass: string;
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
      title: "MT5 Stop-Loss Protection",
      subtitle: "Every order opened with protective SL",
      value: 100,
      badgeText: "100% Verified",
      percentageText: "100%",
      indicatorClass: "bg-emerald-500",
    },
    {
      title: "Lot Sizing Rule",
      subtitle: "Strict 1% account risk limit enforced",
      value: 95,
      badgeText: "0.05 – 0.10 Lots",
      percentageText: "95%",
      indicatorClass: "bg-[#2563EB]",
    },
    {
      title: "Revenge Trade Shield",
      subtitle: "15-minute cooldown respected post-loss",
      value: 100,
      badgeText: "0 Violations",
      percentageText: "100%",
      indicatorClass: "bg-emerald-500",
    },
    {
      title: "Daily Trade Cap",
      subtitle: "Under daily maximum execution limit",
      value: 75,
      badgeText: "3 / 4 Trades",
      percentageText: "75%",
      indicatorClass: "bg-amber-500",
    },
  ];

  const handleRefresh = () => {
    toast.success("Risk Guard Synced", {
      description: "Rule compliance metrics refreshed with Exness MT5 server.",
    });
    onRefresh?.();
  };

  return (
    <Card
      className={`border border-slate-200/70 dark:border-white/[0.07] bg-white dark:bg-[#17171A] rounded-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5 space-y-0">
        <div>
          <CardTitle className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#2563EB] dark:text-blue-400" />
            <span>Rule Compliance Parameters</span>
          </CardTitle>
          <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
            Synced with your Exness MT5 account &amp; live Risk Guard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 tabular-nums">
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
            <DropdownMenuContent align="end" className="w-44 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
              <DropdownMenuItem onClick={handleRefresh} className="cursor-pointer gap-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                <span>Sync MT5 Rules</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Risk Guard settings: Max Risk 1%, SL mandatory, 15m cooldown.")}
                className="cursor-pointer gap-2 text-xs"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                <span>Risk Guard Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-[12px] bg-[#F8F9FA] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] flex items-end gap-3.5"
            >
              <div className="grow space-y-2 min-w-0">
                <div className="space-y-0.5">
                  <p className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
                    {item.subtitle}
                  </p>
                </div>
                <Progress
                  value={item.value}
                  indicatorClassName={item.indicatorClass}
                  className="h-2 bg-slate-200/70 dark:bg-white/10"
                />
              </div>

              <div className="flex flex-col items-end justify-between gap-1.5 shrink-0">
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1E24] text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-white/10 shadow-2xs whitespace-nowrap"
                >
                  {item.badgeText}
                </Badge>
                <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 tabular-nums">
                  {item.percentageText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RuleComplianceAnalytics;
