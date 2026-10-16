import { useState, useEffect, useRef } from "react";
import { Check, GripVertical, Percent } from "lucide-react";
import { 
  ChevronDown as IconlyChevronDown, 
  Show as IconlyShow, 
  Hide as IconlyHide, 
  Category as IconlyCategory, 
  InfoCircle as IconlyInfoCircle, 
  Graph as IconlyGraph, 
  Swap as IconlySwap 
} from "react-iconly";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function MetricTooltip({ content }: { content: string }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help focus:outline-none flex items-center justify-center shrink-0">
          <IconlyInfoCircle set="curved" primaryColor="currentColor" size={16} className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white/80 transition-colors shrink-0" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 p-2.5 rounded-xl border border-white/10 dark:border-slate-200/50 shadow-xl text-[11px] font-semibold leading-relaxed tracking-tight">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
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
import { useTrading } from "@/contexts/TradingContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useJournalSettings, CURRENCIES, CurrencyCode } from "@/contexts/JournalSettingsContext";
import { usePlan } from "@/hooks/usePlan";
import { useMarket } from "@/contexts/MarketContext";

// --- Donut/Gauge for Win Rate ---
function WinRateGauge({ winPct, wins, even, losses }: { winPct: number; wins: number; even: number; losses: number }) {
  const r = 26, c = 2 * Math.PI * r;
  const total = wins + even + losses;
  const winArc = total > 0 ? (wins / total) * c : 0;
  const evenArc = total > 0 ? (even / total) * c : 0;
  const lossArc = total > 0 ? c - winArc - evenArc : c;
  return (
    <div className="relative w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] shrink-0">
      <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#1e293b" strokeWidth="6" className="dark:stroke-slate-700 stroke-slate-100" />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#10B981" strokeWidth="6" strokeDasharray={`${winArc} ${c - winArc}`} strokeDashoffset="0" strokeLinecap="round" />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#64748b" strokeWidth="6" strokeDasharray={`${evenArc} ${c - evenArc}`} strokeDashoffset={`${-winArc}`} />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#F06363" strokeWidth="6" strokeDasharray={`${lossArc} ${c - lossArc}`} strokeDashoffset={`${-(winArc + evenArc)}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none" style={{ gap: '1px' }}>
        <span className="text-[9px] font-black" style={{ color: '#10B981' }}>{wins}</span>
        <span className="text-[7.5px] text-slate-400 font-bold">{even}</span>
        <span className="text-[8px] font-black" style={{ color: '#F06363' }}>{losses}</span>
      </div>
    </div>
  );
}

// --- Circular Gauge (Profit Factor) ---
function CircularGauge({ value, max = 2 }: { value: number; max?: number }) {
  const r = 24, c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const color = value >= 1 ? "#10B981" : "#F06363";
  return (
    <div className="relative w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] shrink-0">
      <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#1e293b" strokeWidth="5.5" className="dark:stroke-slate-700 stroke-slate-100" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5.5" strokeDasharray={`${pct * c} ${c - pct * c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9.5px] font-black" style={{ color }}>{value}</span>
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
    <div className="space-y-1.5 w-full max-w-[85px] sm:max-w-[110px] shrink-0">
      <div className="flex h-[5px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="rounded-l-full" style={{ width: `${winW}%`, backgroundColor: '#10B981' }} />
        <div className="rounded-r-full" style={{ width: `${100 - winW}%`, backgroundColor: '#F06363' }} />
      </div>
      <div className="flex justify-between text-[8.5px] sm:text-[9px] font-bold">
        <span className={`transition-all duration-300 ${hideBalance || percentageOnly ? 'blur-[2px] select-none opacity-40' : ''}`} style={{ color: '#10B981' }}>{formatMoney(displayWin, { raw: true })}</span>
        <span className={`transition-all duration-300 ${hideBalance || percentageOnly ? 'blur-[2px] select-none opacity-40' : ''}`} style={{ color: '#F06363' }}>{`-${formatMoney(displayLoss, { raw: true }).replace('-', '')}`}</span>
      </div>
    </div>
  );
}

// --- Streak Pill ---
function StreakPill({ label, value, color, style }: { label: string; value: string; color: string; style?: React.CSSProperties }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${color}`} style={style}>{value} {label}</span>
  );
}

// ── Metric Content Components ────────────────────────────────────────────────
const METRIC_CONTENT: Record<string, React.ReactNode> = {
  pnl: (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Account balance & P&L</p>
          <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">255</span>
        </div>
        <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
      </div>
      <div className="flex items-end justify-between mt-1">
        <div>
          <h3 className="text-[28px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>₹0</h3>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            P&L: <span className="text-[#F06363]">-₹2,001.78</span>
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
          <IconlyGraph set="curved" primaryColor="currentColor" size={16} stroke="bold" className="text-indigo-500" />
        </div>
      </div>
    </>
  ),
  winrate: (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Trade Win %</p>
        <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>52.96%</h3>
        <WinRateGauge winPct={52.96} wins={134} even={2} losses={119} />
      </div>
    </>
  ),
  streak: (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Current Streak</p>
        <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase w-9">Days</span>
          <span className="w-6 h-6 rounded-lg text-black text-[11px] font-bold flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>2</span>
          <StreakPill label="days" value="2" color="" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#10B981' }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase w-9">Trades</span>
          <span className="w-6 h-6 rounded-lg text-black text-[11px] font-bold flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>1</span>
          <StreakPill label="W" value="36" color="" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#10B981' }} />
          <StreakPill label="L" value="90" color="" style={{ backgroundColor: 'rgba(246, 55, 55, 0.1)', color: '#F06363' }} />
        </div>
      </div>
    </>
  ),
  avgwinloss: (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Avg Win/Loss</p>
        <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>0.49</h3>
        <WinLossBar avgWin={18.5} avgLoss={37.7} />
      </div>
    </>
  ),
  profitfactor: (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Profit Factor</p>
        <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>0.55</h3>
        <CircularGauge value={0.55} />
      </div>
    </>
  ),
};

// ── Sortable Wrapper ────────────────────────────────────────────────────────
function SortableMetric({ id, isEditMode, children, className = "" }: { id: string; isEditMode: boolean; children: React.ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !isEditMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
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
      <div className={`min-h-[115px] sm:h-[120px] px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-[22px] sm:rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] premium-flat-card shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none
        ${isEditMode ? "ring-2 ring-[#10B981]/50 ring-offset-2 pointer-events-none" : "hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"}`}
      >
        {isEditMode && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-1.5 rounded-xl shadow-xl z-50 border border-slate-100 dark:border-slate-700 animate-bounce-subtle">
            <GripVertical size={14} strokeWidth={3} />
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
}: {
  isEditMode?: boolean;
  onEditToggle?: () => void;
}) {
  const { activeMarket } = useMarket();
  const { todayProfit: rawTodayProfit, totalProfit: rawTotalProfit, winRate: rawWinRate, tradesToday: rawTradesToday, drawdown: rawDrawdown, recentTrades: rawRecentTrades, lastImportTime, refetch, loading, balance: rawBalance } = useDashboardData();
  const { isConnected } = useTrading();

  const isDemo = !isConnected;

  const todayProfit = isDemo ? 124.50 : (rawTodayProfit || 0);
  const totalProfit = isDemo ? 3240.75 : (rawTotalProfit || 0);
  const tradesToday = isDemo ? 3 : (rawTradesToday || 0);
  const winRate = isDemo ? 68 : (rawWinRate || 0);
  const drawdown = isDemo ? 0 : (rawDrawdown || 0);
  const balance = isDemo ? 103240.75 : (rawBalance || 0);

  const mockRecentTrades = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const profit = [120.00, -50.00, 310.50, 45.00, -110.00, 280.00, 845.50][i];
    return {
      id: `mock${i}`,
      symbol: activeMarket === 'indian' 
        ? ["NIFTY50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "INFY", "TCS", "ITC"][i]
        : ["EURUSD", "GBPUSD", "XAUUSD", "US30", "NAS100", "XAUUSD", "XAUUSD"][i],
      type: profit > 0 ? "BUY" : "SELL",
      profit: profit,
      closed_at: d.toISOString(),
      is_pending: false,
      notes: "Simulated trade execution."
    };
  });

  const recentTrades = isDemo ? mockRecentTrades : (rawRecentTrades || []);
  const { isStarter } = usePlan();
  const { formatMoney, hideBalance, setHideBalance, hideOnlyBalance, setHideOnlyBalance, percentageOnly, setPercentageOnly, currency, setCurrency, isSettingsLoading } = useJournalSettings();

  const isPageLoading = loading || isSettingsLoading;
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [order, setOrder] = useState(["pnl", "winrate", "streak", "avgwinloss", "profitfactor"]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalWins = recentTrades ? recentTrades.filter(t => (t.profit || 0) > 0).length : 0;
  const totalLosses = recentTrades ? recentTrades.filter(t => (t.profit || 0) < 0).length : 0;
  const totalEvens = recentTrades ? recentTrades.filter(t => (t.profit || 0) === 0).length : 0;

  const winningTrades = recentTrades ? recentTrades.filter(t => (t.profit || 0) > 0) : [];
  const losingTrades = recentTrades ? recentTrades.filter(t => (t.profit || 0) < 0) : [];

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((acc, t) => acc + (t.profit || 0), 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((acc, t) => acc + (t.profit || 0), 0) / losingTrades.length)
    : 0;

  const avgWinLossRatio = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : 0;

  const grossProfit = winningTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + (t.profit || 0), 0));

  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? Number(grossProfit.toFixed(2)) : 0;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
      }
    };
    fetchUser();
  }, []);

  const isSubscriptionNone = isStarter;

  const metrics: Record<string, React.ReactNode> = {
    pnl: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Account balance & P&L</p>
            <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">...</span>
          </div>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-7 w-28 bg-slate-200 dark:bg-white/10 animate-pulse" />
          <Skeleton className="h-3.5 w-20 bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Account balance & P&L</p>
            <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{recentTrades?.length || 0}</span>
          </div>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h3 className={`text-[20px] sm:text-[24px] lg:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none transition-all duration-300 ${hideBalance || hideOnlyBalance || percentageOnly ? 'blur-[5px] select-none opacity-40' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              {formatMoney(balance, { raw: true })}
            </h3>
            <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              P&L: <span className={`transition-all duration-300 ${hideBalance ? 'blur-[2px] select-none opacity-40' : ''}`} style={{ color: totalProfit >= 0 ? '#10B981' : '#F06363' }}>
                {percentageOnly ? `${totalProfit >= 0 ? "+" : ""}${((totalProfit / (balance > 0 ? balance : 1)) * 100).toFixed(2)}%` : formatMoney(totalProfit, { showSign: true, raw: true })}
              </span>
            </p>
          </div>
        </div>
      </>
    ),
    winrate: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Trade Win %</p>
          <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-7 w-20 bg-slate-200 dark:bg-white/10 animate-pulse" />
          <Skeleton className="h-[50px] w-[50px] rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Trade Win %</p>
          <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] sm:text-[24px] lg:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{winRate}%</h3>
          <WinRateGauge winPct={winRate} wins={totalWins} even={totalEvens} losses={totalLosses} />
        </div>
      </>
    ),
    streak: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Current Streak</p>
          <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
        </div>
        <div className="space-y-3 mt-2">
          <Skeleton className="h-4.5 w-full bg-slate-200 dark:bg-white/10 animate-pulse" />
          <Skeleton className="h-4.5 w-full bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Current Streak</p>
          <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase w-[60px] shrink-0">Drawdown</span>
            <span className="w-6 h-6 rounded-lg text-white text-[11px] font-bold flex items-center justify-center" style={{ backgroundColor: '#F06363' }}>{drawdown.toFixed(0)}</span>
            <StreakPill label="risk" value={`${drawdown.toFixed(1)}%`} color="" style={{ backgroundColor: 'rgba(246, 55, 55, 0.1)', color: '#F06363' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase w-[60px] shrink-0">Trades</span>
            <span className="w-6 h-6 rounded-lg text-black text-[11px] font-bold flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>{recentTrades.length}</span>
            <StreakPill label="W" value={`${totalWins}`} color="" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#10B981' }} />
            <StreakPill label="L" value={`${totalLosses}`} color="" style={{ backgroundColor: 'rgba(246, 55, 55, 0.1)', color: '#F06363' }} />
          </div>
        </div>
      </>
    ),
    avgwinloss: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Avg Win/Loss</p>
          <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
        </div>
        <div className="flex items-end justify-between mt-2">
          <Skeleton className="h-7 w-16 bg-slate-200 dark:bg-white/10 animate-pulse" />
          <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Avg Win/Loss</p>
          <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] sm:text-[24px] lg:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
            {avgWinLossRatio > 0 ? avgWinLossRatio.toFixed(2) : "0.00"}
          </h3>
          <WinLossBar avgWin={avgWin} avgLoss={avgLoss} />
        </div>
      </>
    ),
    profitfactor: isPageLoading ? (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Profit Factor</p>
          <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-7 w-16 bg-slate-200 dark:bg-white/10 animate-pulse" />
          <Skeleton className="h-[50px] w-[50px] rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Profit Factor</p>
          <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] sm:text-[24px] lg:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
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

  return (
    <>
      {/* Subscription Upsell Banner */}
      {isSubscriptionNone && (
        <div className="w-full bg-[#FFF1F2] dark:bg-[#F06363]/10 border border-[#F06363]/20 dark:border-[#F06363]/20 rounded-2xl p-5 mb-8 flex items-center gap-4 shadow-sm">
          <span className="text-slate-900 dark:text-white font-black text-sm">$</span>
          <p className="text-[13px] text-slate-700 dark:text-slate-200 font-medium tracking-tight">
            Want to get more out of your journal? <span onClick={() => window.location.href = '/settings?plan=pro'} className="font-bold cursor-pointer hover:underline">Activate your PRO subscription to unlock advanced features.</span>
          </p>
        </div>
      )}

      {/* Import Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-400 dark:text-slate-400 flex-wrap">
          <span className="font-bold text-slate-900 dark:text-white">Last import:</span>
          <span className="font-semibold">{lastImportTime}</span>
          <span className="text-slate-300 dark:text-slate-400">•</span>
          <button
            onClick={async () => {
              toast.promise(
                (async () => {
                  if (activeMarket === 'indian') {
                    const { error } = await supabase.functions.invoke('sync-indian-trades');
                    if (error) throw error;
                  } else {
                    const { error } = await supabase.functions.invoke('sync-metaapi-trades');
                    if (error) throw error;
                  }
                  await refetch();
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                })(),
                {
                  loading: 'Synchronizing trades...',
                  success: 'Sync complete! Refreshing page...',
                  error: 'Sync failed'
                }
              );
            }}
            className="text-emerald-500 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-blue-300 transition-colors font-bold cursor-pointer"
          >
            Resync
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Selector */}
          <div className="relative" ref={currencyDropdownRef}>
            <button
              onClick={() => setCurrencyOpen(v => !v)}
              className={`inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[14px] border-2 text-[11px] font-bold tracking-tight transition-all duration-300 ${currencyOpen
                  ? "border-white dark:border-white/5 bg-gradient-to-b from-[#E8E8EC] to-[#F4F4F4] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:shadow-none text-slate-900 dark:text-white"
                  : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-700 dark:text-slate-300 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
                }`}
            >
              <span className="tabular-nums">{currency.code}</span>
              <span className="text-slate-400 dark:text-slate-400 font-medium">{currency.symbol}</span>
              <IconlyChevronDown set="curved" primaryColor="currentColor" size={11} className={`transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`} stroke="bold" />
            </button>
            {currencyOpen && (
              <div className="absolute top-full right-0 mt-2 w-[220px] bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${currency.code === c.code ? "bg-slate-50 dark:bg-white/5" : "hover:bg-slate-50/60 dark:hover:bg-white/[0.03]"
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-bold text-slate-900 dark:text-white">{c.code}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-400 ml-2 font-medium">{c.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-400 dark:text-slate-400 tabular-nums">{c.symbol}</span>
                    {currency.code === c.code && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hide Balance */}
          <button
            onClick={() => {
              if (isStarter) {
                toast.error("Premium Feature", { description: "Upgrade to Pro to use privacy features." });
                return;
              }
              setHideBalance(!hideBalance);
            }}
            className={`inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[14px] border-2 text-[11px] font-bold tracking-tight transition-all duration-300 ${hideBalance
                ? "border-white dark:border-white/5 bg-gradient-to-b from-[#FEF3C7] to-[#FFFBEB] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#F59E0B40] dark:shadow-none text-amber-700 dark:text-amber-400"
                : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
              } ${isStarter ? 'opacity-60' : ''}`}
          >
            {isStarter && <div className="text-blue-500"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
            {hideBalance ? <IconlyHide set="curved" primaryColor="currentColor" size={13} stroke="bold" /> : <IconlyShow set="curved" primaryColor="currentColor" size={13} stroke="bold" />}
            <span>{hideBalance ? "Hidden" : "Hide Balance"}</span>
          </button>

          {/* Hide Only Balance */}
          <button
            onClick={() => {
              if (isStarter) {
                toast.error("Premium Feature", { description: "Upgrade to Pro to use privacy features." });
                return;
              }
              setHideOnlyBalance(!hideOnlyBalance);
            }}
            className={`inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[14px] border-2 text-[11px] font-bold tracking-tight transition-all duration-300 ${hideOnlyBalance
                ? "border-white dark:border-[#2A2A2E] bg-gradient-to-b from-[#F3F0FF] to-[#FAF8FF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#A78BFA40] dark:shadow-none text-violet-600 dark:text-violet-400"
                : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
              } ${isStarter ? 'opacity-60' : ''}`}
          >
            {isStarter && <div className="text-blue-500"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
            {hideOnlyBalance ? <IconlyHide set="curved" primaryColor="currentColor" size={13} stroke="bold" /> : <IconlyShow set="curved" primaryColor="currentColor" size={13} stroke="bold" />}
            <span>{hideOnlyBalance ? "Hidden Bal" : "Hide Only Balance"}</span>
          </button>

          {/* Show % */}
          <button
            onClick={() => {
              if (isStarter) {
                toast.error("Premium Feature", { description: "Upgrade to Pro to use privacy features." });
                return;
              }
              setPercentageOnly(!percentageOnly);
            }}
            className={`inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[14px] border-2 text-[11px] font-bold tracking-tight transition-all duration-300 ${percentageOnly
                ? "border-white dark:border-white/5 bg-gradient-to-b from-[#D1FAE5] to-[#ECFDF5] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#10B98140] dark:shadow-none text-emerald-600 dark:text-emerald-400"
                : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
              } ${isStarter ? 'opacity-60' : ''}`}
          >
            {isStarter && <div className="text-blue-500"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
            <Percent size={12} strokeWidth={2.5} />
            <span>{percentageOnly ? "Only" : "Show"}</span>
          </button>

          {/* Grid / Edit Layout Button */}
          <button
            onClick={onEditToggle}
            className={`w-[36px] h-[36px] rounded-[14px] border-2 flex items-center justify-center transition-all duration-300 ${isEditMode
                ? "border-white dark:border-white/5 bg-gradient-to-b from-[#D1FAE5] to-[#ECFDF5] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#10B98140] dark:shadow-none text-emerald-600 dark:text-emerald-400"
                : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-400 hover:text-slate-600 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
              }`}
          >
            {isEditMode ? <Check size={16} strokeWidth={3} /> : <IconlyCategory set="curved" primaryColor="currentColor" size={15} stroke="bold" />}
          </button>
        </div>
      </div>

      {/* 5 Metric Cards — Draggable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
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






