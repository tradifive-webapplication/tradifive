import { useState, useEffect, useRef } from "react";
import { Check, GripVertical, Percent, RefreshCw } from "lucide-react";
import {
  ChevronDown as IconlyChevronDown,
  Show as IconlyShow,
  Hide as IconlyHide,
  Category as IconlyCategory,
  InfoCircle as IconlyInfoCircle,
} from "react-iconly";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useJournalSettings, CURRENCIES, CurrencyCode } from "@/contexts/JournalSettingsContext";
import { usePlan } from "@/hooks/usePlan";
import { useMarket } from "@/contexts/MarketContext";

const CARD_SURFACE =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

function MetricTooltip({ content }: { content: string }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="cursor-help focus:outline-none flex items-center justify-center shrink-0"
        >
          <IconlyInfoCircle
            set="curved"
            primaryColor="currentColor"
            size={15}
            className="text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 transition-colors shrink-0"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 p-2.5 rounded-xl border border-white/10 dark:border-slate-200/50 shadow-xl text-[11px] font-medium leading-relaxed tracking-tight">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

// --- Donut/Gauge for Win Rate (TradiFive Blue + Slate + Rose) ---
function WinRateGauge({
  wins,
  even,
  losses,
}: {
  wins: number;
  even: number;
  losses: number;
}) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const total = wins + even + losses;
  const winArc = total > 0 ? (wins / total) * c : 0;
  const evenArc = total > 0 ? (even / total) * c : 0;
  const lossArc = total > 0 ? Math.max(0, c - winArc - evenArc) : 0;

  return (
    <div className="relative w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="5.5"
          className="stroke-slate-100 dark:stroke-white/[0.08]"
        />
        {total > 0 && (
          <>
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="#2563EB"
              strokeWidth="5.5"
              strokeDasharray={`${winArc} ${c - winArc}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {evenArc > 0 && (
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="5.5"
                strokeDasharray={`${evenArc} ${c - evenArc}`}
                strokeDashoffset={`${-winArc}`}
              />
            )}
            {lossArc > 0 && (
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="#E11D48"
                strokeWidth="5.5"
                strokeDasharray={`${lossArc} ${c - lossArc}`}
                strokeDashoffset={`${-(winArc + evenArc)}`}
              />
            )}
          </>
        )}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center leading-none"
        style={{ gap: "1px" }}
      >
        <span className="text-[9px] font-bold text-[#2563EB] dark:text-blue-400 tabular-nums">
          {wins}
        </span>
        <span className="text-[7.5px] text-slate-400 font-semibold tabular-nums">
          {even}
        </span>
        <span className="text-[8px] font-bold text-rose-500 tabular-nums">
          {losses}
        </span>
      </div>
    </div>
  );
}

// --- Circular Gauge (Profit Factor) ---
function CircularGauge({ value, max = 3 }: { value: number; max?: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0) / max, 1);
  const color = value >= 1 || value === 0 ? "#2563EB" : "#E11D48";
  return (
    <div className="relative w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] shrink-0">
      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="5"
          className="stroke-slate-100 dark:stroke-white/[0.08]"
        />
        {value > 0 && (
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${pct * c} ${c - pct * c}`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9.5px] font-bold tabular-nums" style={{ color }}>
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// --- Horizontal bar for avg win/loss ---
function WinLossBar({ avgWin, avgLoss }: { avgWin: number; avgLoss: number }) {
  const { formatMoney, hideBalance, percentageOnly } = useJournalSettings();
  const total = avgWin + Math.abs(avgLoss);
  const winW = total > 0 ? (avgWin / total) * 100 : 50;
  const displayWin = total > 0 ? avgWin : 0;
  const displayLoss = total > 0 ? Math.abs(avgLoss) : 0;
  return (
    <div className="space-y-1.5 w-full max-w-[88px] sm:max-w-[108px] shrink-0">
      <div className="flex h-[5px] rounded-full overflow-hidden bg-slate-100 dark:bg-white/[0.08]">
        <div
          className="rounded-l-full bg-[#2563EB] transition-[width] duration-300"
          style={{ width: `${winW}%` }}
        />
        <div
          className="rounded-r-full bg-rose-400 transition-[width] duration-300"
          style={{ width: `${100 - winW}%` }}
        />
      </div>
      <div className="flex justify-between text-[8.5px] sm:text-[9px] font-semibold tabular-nums">
        <span
          className={`text-[#2563EB] dark:text-blue-400 transition-[filter,opacity] duration-200 ${
            hideBalance || percentageOnly ? "blur-[4px] select-none opacity-60" : ""
          }`}
        >
          {formatMoney(displayWin, { raw: true })}
        </span>
        <span
          className={`text-rose-500 transition-[filter,opacity] duration-200 ${
            hideBalance || percentageOnly ? "blur-[4px] select-none opacity-60" : ""
          }`}
        >
          {`-${formatMoney(displayLoss, { raw: true }).replace("-", "")}`}
        </span>
      </div>
    </div>
  );
}

function StreakPill({
  label,
  value,
  variant = "blue",
}: {
  label: string;
  value: string;
  variant?: "blue" | "rose" | "slate";
}) {
  const cls =
    variant === "blue"
      ? "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400"
      : variant === "rose"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
      : "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-neutral-300";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-semibold tabular-nums ${cls}`}>
      {value} {label}
    </span>
  );
}

// ── Sortable Wrapper ────────────────────────────────────────────────────────
function SortableMetric({
  id,
  isEditMode,
  children,
  className = "",
}: {
  id: string;
  isEditMode: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !isEditMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : undefined,
    cursor: isEditMode ? "grab" : "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group h-full ${className}`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      <div
        className={`min-h-[112px] sm:h-[118px] px-3.5 sm:px-4 py-3.5 flex flex-col justify-between transition-all duration-200 ${CARD_SURFACE} ${
          isEditMode
            ? "ring-2 ring-[#2563EB]/45 ring-offset-2 dark:ring-offset-[#141416] pointer-events-none"
            : "hover:-translate-y-[1px]"
        }`}
      >
        {isEditMode && (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white dark:bg-[#242428] text-slate-600 dark:text-neutral-300 p-1 rounded-lg shadow-md z-50 border border-slate-200/80 dark:border-white/10">
            <GripVertical size={13} strokeWidth={2.5} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default function JournalMetrics({
  isEditMode = false,
  onEditToggle,
  hideToolbar = false,
  demoData,
}: {
  isEditMode?: boolean;
  onEditToggle?: () => void;
  hideToolbar?: boolean;
  demoData?: {
    allTrades: any[];
    balance: number;
    totalProfit: number;
    winRate: number;
    drawdown: number;
    lastImportTime: string;
  } | null;
}) {
  const { activeMarket } = useMarket();
  const {
    totalProfit: rawTotalProfit,
    winRate: rawWinRate,
    drawdown: rawDrawdown,
    recentTrades: rawRecentTrades,
    lastImportTime: rawLastImportTime,
    refetch,
    loading,
    balance: rawBalance,
  } = useDashboardData();

  const totalProfit = demoData ? demoData.totalProfit : rawTotalProfit || 0;
  const winRate = demoData ? demoData.winRate : rawWinRate || 0;
  const drawdown = demoData ? demoData.drawdown : rawDrawdown || 0;
  const balance = demoData ? demoData.balance : rawBalance || 0;
  const recentTrades = demoData ? demoData.allTrades : rawRecentTrades || [];
  const lastImportTime = demoData ? demoData.lastImportTime : rawLastImportTime;

  const { isStarter } = usePlan();
  const {
    formatMoney,
    hideBalance,
    setHideBalance,
    hideOnlyBalance,
    setHideOnlyBalance,
    percentageOnly,
    setPercentageOnly,
    currency,
    setCurrency,
    isSettingsLoading,
  } = useJournalSettings();

  const isPageLoading = demoData ? isSettingsLoading : loading || isSettingsLoading;
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tradifive_journal_metrics_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      }
    } catch {
      /* ignore */
    }
    return ["pnl", "winrate", "streak", "avgwinloss", "profitfactor"];
  });

  useEffect(() => {
    try {
      localStorage.setItem("tradifive_journal_metrics_order", JSON.stringify(order));
    } catch {
      /* ignore */
    }
  }, [order]);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(e.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closedTrades = recentTrades.filter((t: any) => !!t.closed_at && !t.is_pending);
  const winningTrades = closedTrades.filter((t: any) => Number(t.profit || 0) > 0);
  const losingTrades = closedTrades.filter((t: any) => Number(t.profit || 0) < 0);
  const evenTrades = closedTrades.filter((t: any) => Number(t.profit || 0) === 0);

  const totalWins = winningTrades.length;
  const totalLosses = losingTrades.length;
  const totalEvens = evenTrades.length;

  const avgWin =
    totalWins > 0
      ? winningTrades.reduce((acc: number, t: any) => acc + Number(t.profit || 0), 0) /
        totalWins
      : 0;

  const avgLoss =
    totalLosses > 0
      ? Math.abs(
          losingTrades.reduce((acc: number, t: any) => acc + Number(t.profit || 0), 0) /
            totalLosses
        )
      : 0;

  const avgWinLossRatio = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : 0;

  const grossProfit = winningTrades.reduce(
    (acc: number, t: any) => acc + Number(t.profit || 0),
    0
  );
  const grossLoss = Math.abs(
    losingTrades.reduce((acc: number, t: any) => acc + Number(t.profit || 0), 0)
  );
  const profitFactor =
    grossLoss > 0
      ? Number((grossProfit / grossLoss).toFixed(2))
      : grossProfit > 0
      ? Number(grossProfit.toFixed(2))
      : 0;

  const metrics: Record<string, React.ReactNode> = {
    pnl: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Balance &amp; P&amp;L
          </p>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-6 w-24 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-3.5 w-20 bg-slate-200 dark:bg-white/10" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 tracking-tight truncate">
              Balance &amp; P&amp;L
            </p>
            <span className="bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-neutral-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
              {recentTrades.length}
            </span>
          </div>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
        </div>
        <div className="mt-1">
          <h3
            className={`text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums transition-[filter,opacity] duration-200 ${
              hideBalance || hideOnlyBalance || percentageOnly
                ? "blur-[6px] select-none opacity-75"
                : ""
            }`}
          >
            {formatMoney(balance, { raw: true })}
          </h3>
          <p className="text-[11.5px] font-medium text-slate-400 mt-1.5 tabular-nums">
            P&amp;L:{" "}
            <span
              className={`font-semibold transition-[filter,opacity] duration-200 ${
                hideBalance ? "blur-[5px] select-none opacity-75" : ""
              } ${
                totalProfit < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-[#2563EB] dark:text-blue-400"
              }`}
            >
              {percentageOnly
                ? `${totalProfit >= 0 ? "+" : ""}${
                    balance > 0 ? ((totalProfit / balance) * 100).toFixed(2) : "0.00"
                  }%`
                : formatMoney(totalProfit, { showSign: true, raw: true })}
            </span>
          </p>
        </div>
      </>
    ),

    winrate: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Trade Win %
          </p>
          <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-[48px] w-[48px] rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Trade Win %
          </p>
          <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
            {winRate}%
          </h3>
          <WinRateGauge wins={totalWins} even={totalEvens} losses={totalLosses} />
        </div>
      </>
    ),

    streak: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Drawdown &amp; W/L
          </p>
          <MetricTooltip content="Your current drawdown risk level alongside total executed wins and losses." />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Drawdown &amp; W/L
          </p>
          <MetricTooltip content="Your current drawdown risk level alongside total executed wins and losses." />
        </div>
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] font-semibold text-slate-400 w-[52px] shrink-0">
              Drawdown
            </span>
            <StreakPill
              label="risk"
              value={`${drawdown.toFixed(1)}%`}
              variant={drawdown > 0 ? "rose" : "slate"}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9.5px] font-semibold text-slate-400 w-[52px] shrink-0">
              Trades
            </span>
            <StreakPill label="W" value={`${totalWins}`} variant="blue" />
            <StreakPill label="L" value={`${totalLosses}`} variant="rose" />
          </div>
        </div>
      </>
    ),

    avgwinloss: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Avg Win / Loss
          </p>
          <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades." />
        </div>
        <div className="flex items-end justify-between mt-2">
          <Skeleton className="h-6 w-14 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Avg Win / Loss
          </p>
          <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades." />
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
            {avgWinLossRatio > 0 ? avgWinLossRatio.toFixed(2) : "0.00"}
          </h3>
          <WinLossBar avgWin={avgWin} avgLoss={avgLoss} />
        </div>
      </>
    ),

    profitfactor: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Profit Factor
          </p>
          <MetricTooltip content="Gross profits divided by gross losses. Above 1.0 indicates a profitable expectancy." />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-6 w-14 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-[46px] w-[46px] rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-semibold text-slate-400 tracking-tight">
            Profit Factor
          </p>
          <MetricTooltip content="Gross profits divided by gross losses. Above 1.0 indicates a profitable expectancy." />
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
            {profitFactor > 0 ? profitFactor.toFixed(2) : "0.00"}
          </h3>
          <CircularGauge value={profitFactor > 0 ? profitFactor : 0} />
        </div>
      </>
    ),
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleResync = async () => {
    toast.promise(
      (async () => {
        if (activeMarket === "indian") {
          const { error } = await supabase.functions.invoke("sync-indian-trades");
          if (error) throw error;
        } else {
          const { error } = await supabase.functions.invoke("sync-metaapi-trades");
          if (error) throw error;
        }
        await refetch();
      })(),
      {
        loading: "Synchronizing trades...",
        success: "Trades synced!",
        error: "Sync failed",
      }
    );
  };

  return (
    <>
      {!hideToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-[12px] text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-white">Last import:</span>
            <span className="font-medium">{lastImportTime}</span>
            <span className="text-slate-300 dark:text-neutral-600">·</span>
            <button
              type="button"
              onClick={handleResync}
              className="inline-flex items-center gap-1 text-[#2563EB] hover:text-blue-700 dark:text-blue-400 font-semibold cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Resync</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => setCurrencyOpen((v) => !v)}
                className="tactile-white-pill inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer"
              >
                <span className="tabular-nums">{currency.code}</span>
                <span className="text-slate-400">{currency.symbol}</span>
                <IconlyChevronDown
                  set="curved"
                  primaryColor="currentColor"
                  size={11}
                  className={`transition-transform duration-200 ${
                    currencyOpen ? "rotate-180" : ""
                  }`}
                  stroke="bold"
                />
              </button>
              {currencyOpen && (
                <div className="absolute top-full right-0 mt-2 w-[210px] bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCurrency(c.code as CurrencyCode);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 text-left transition-colors cursor-pointer ${
                        currency.code === c.code
                          ? "bg-blue-50/70 dark:bg-blue-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-semibold text-slate-900 dark:text-white">
                          {c.code}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">{c.name}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-400 tabular-nums">
                        {c.symbol}
                      </span>
                      {currency.code === c.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  toast.error("Premium Feature", {
                    description: "Upgrade to Pro to use privacy features.",
                  });
                  return;
                }
                setHideBalance(!hideBalance);
              }}
              className={`tactile-white-pill inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                hideBalance ? "!text-[#2563EB] dark:!text-blue-400" : ""
              } ${isStarter ? "opacity-60" : ""}`}
            >
              {hideBalance ? (
                <IconlyHide set="curved" primaryColor="currentColor" size={12} stroke="bold" />
              ) : (
                <IconlyShow set="curved" primaryColor="currentColor" size={12} stroke="bold" />
              )}
              <span>{hideBalance ? "Hidden" : "Hide"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  toast.error("Premium Feature", {
                    description: "Upgrade to Pro to use privacy features.",
                  });
                  return;
                }
                setHideOnlyBalance(!hideOnlyBalance);
              }}
              className={`tactile-white-pill inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                hideOnlyBalance ? "!text-[#2563EB] dark:!text-blue-400" : ""
              } ${isStarter ? "opacity-60" : ""}`}
            >
              <span>{hideOnlyBalance ? "Bal Hidden" : "Hide Bal"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  toast.error("Premium Feature", {
                    description: "Upgrade to Pro to use privacy features.",
                  });
                  return;
                }
                setPercentageOnly(!percentageOnly);
              }}
              className={`tactile-white-pill inline-flex items-center gap-1 h-[32px] px-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer ${
                percentageOnly ? "!text-[#2563EB] dark:!text-blue-400" : ""
              } ${isStarter ? "opacity-60" : ""}`}
            >
              <Percent size={11} strokeWidth={2.5} />
              <span>{percentageOnly ? "Only %" : "%"}</span>
            </button>

            <button
              type="button"
              onClick={onEditToggle}
              className={`tactile-white-pill w-[32px] h-[32px] rounded-[10px] flex items-center justify-center cursor-pointer ${
                isEditMode ? "!text-[#2563EB] dark:!text-blue-400" : ""
              }`}
              title={isEditMode ? "Done editing layout" : "Reorder journal layout"}
            >
              {isEditMode ? (
                <Check size={14} strokeWidth={2.8} />
              ) : (
                <IconlyCategory set="curved" primaryColor="currentColor" size={14} stroke="bold" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 5 Metric Cards — Draggable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {order.map((id, index) => (
              <SortableMetric
                key={id}
                id={id}
                isEditMode={isEditMode}
                className={index === 4 ? "col-span-2 sm:col-span-1" : ""}
              >
                {metrics[id]}
              </SortableMetric>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
