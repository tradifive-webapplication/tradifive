import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { 
  ChevronLeft as IconlyChevronLeft, 
  ChevronRight as IconlyChevronRight, 
  Setting as IconlySetting 
} from "react-iconly";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import DailyJournalModal from "./DailyJournalModal";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { useTrading } from "@/contexts/TradingContext";

export default function JournalCalendar({ loading }: { loading?: boolean }) {
  const { recentTrades: rawRecentTrades, balance: rawBalance, activeMarket } = useDashboardData();
  const { isConnected } = useTrading();
  
  const isDemo = !isConnected;

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
  const balance = isDemo ? 103240.75 : (rawBalance || 0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { formatMoney, hideBalance, percentageOnly, isSettingsLoading } = useJournalSettings();
  const { isStarter } = usePlan();

  const isPageLoading = loading || isSettingsLoading;

  const hasData = recentTrades && recentTrades.length > 0;

  const { weeks, monthLabel, monthlyTotal, tradingDays, weeklyData, tradesByDate } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // Aggregation
    const tradesByDate = new Map<number, { pnl: number, trades: number }>();
    recentTrades?.forEach(t => {
      if (!t.closed_at) return;
      const d = new Date(t.closed_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const current = tradesByDate.get(day) || { pnl: 0, trades: 0 };
        current.pnl += (t.profit || 0);
        current.trades += 1;
        tradesByDate.set(day, current);
      }
    });

    const weeksGrid: (number | null)[][] = [];
    const weekStats: { pnl: number, active: number }[] = [];
    let currentDay = 1;

    for (let i = 0; i < 6; i++) {
      const week: (number | null)[] = [];
      let weekPnl = 0;
      let weekActive = 0;
      
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startDayOfWeek) {
          week.push(null);
        } else if (currentDay > daysInMonth) {
          week.push(null);
        } else {
          week.push(currentDay);
          const dayData = tradesByDate.get(currentDay);
          if (dayData) {
            weekPnl += dayData.pnl;
            weekActive += 1;
          }
          currentDay++;
        }
      }
      weeksGrid.push(week);
      weekStats.push({ pnl: weekPnl, active: weekActive });
      if (currentDay > daysInMonth) break;
    }

    return {
      weeks: weeksGrid,
      monthLabel: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      monthlyTotal: Array.from(tradesByDate.values()).reduce((acc, d) => acc + d.pnl, 0),
      tradingDays: tradesByDate.size,
      weeklyData: weekStats,
      tradesByDate
    };
  }, [currentDate, recentTrades]);

  const dayTrades = useMemo(() => {
    if (!selectedDateObj || !recentTrades) return [];
    const targetYear = selectedDateObj.getFullYear();
    const targetMonth = selectedDateObj.getMonth();
    const targetDay = selectedDateObj.getDate();
    return recentTrades.filter(t => {
      if (!t.closed_at) return false;
      const d = new Date(t.closed_at);
      return (
        d.getFullYear() === targetYear &&
        d.getMonth() === targetMonth &&
        d.getDate() === targetDay
      );
    });
  }, [selectedDateObj, recentTrades]);

  const monthlyStats = useMemo(() => {
    const entries = Array.from(tradesByDate.entries());
    if (entries.length === 0) return null;

    const sorted = [...entries].sort((a, b) => b[1].pnl - a[1].pnl);
    const bestDay = sorted[0];
    const worstDay = sorted[sorted.length - 1];
    const avgPnl = monthlyTotal / tradingDays;
    const winningDays = entries.filter(([, d]) => d.pnl > 0).length;
    const totalTrades = entries.reduce((acc, [, d]) => acc + d.trades, 0);
    const winRate = tradingDays > 0 ? (winningDays / tradingDays) * 100 : 0;
    
    const totalCommission = recentTrades?.reduce((acc, t) => {
      if (!t.closed_at) return acc;
      const d = new Date(t.closed_at);
      if (d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth()) {
        return acc + Number((t as any).commission || 0);
      }
      return acc;
    }, 0) || 0;

    return {
      bestDay: { day: bestDay[0], pnl: bestDay[1].pnl, trades: bestDay[1].trades },
      worstDay: { day: worstDay[0], pnl: worstDay[1].pnl, trades: worstDay[1].trades },
      avgPnl,
      winningDays,
      totalTrades,
      winRate,
      totalCommission
    };
  }, [tradesByDate, tradingDays, monthlyTotal, recentTrades, currentDate]);

  const formatPnl = (pnl: number) => {
    let str = "";
    if (percentageOnly && balance > 0) {
      str = `${pnl >= 0 ? "+" : ""}${((pnl / balance) * 100).toFixed(2)}%`;
    } else {
      str = formatMoney(pnl, { showSign: true, raw: true });
    }
    return hideBalance ? <span className="blur-[2px] select-none opacity-40 transition-all duration-300">{str}</span> : str;
  };

  return (
    <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] rounded-[22px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col h-full overflow-hidden transition-all duration-300 hover:scale-[1.002] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] relative dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#333333] dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.002]">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 active:scale-95 cursor-pointer"
            >
              <IconlyChevronLeft set="curved" primaryColor="currentColor" size={16} stroke="bold" />
            </button>
            <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-900 dark:text-slate-200 tracking-tight min-w-[110px] sm:min-w-[120px] text-center">{monthLabel}</h2>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 active:scale-95 cursor-pointer"
            >
              <IconlyChevronRight set="curved" primaryColor="currentColor" size={16} stroke="bold" />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-slate-200 dark:border-[#333333] dark:border-white/10 text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          >
            This month
          </button>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">Monthly:</span>
            {isPageLoading ? (
              <Skeleton className="h-4.5 w-16 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[12.5px] sm:text-[13px] font-bold tracking-tight ${monthlyTotal >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                {formatPnl(monthlyTotal)}
              </span>
            )}
          </div>
          {isPageLoading ? (
            <Skeleton className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{tradingDays} days active</span>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${showSettings ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                title="View Legend & Insights"
              >
                <IconlySetting set="curved" primaryColor="currentColor" size={15} stroke="bold" className={showSettings ? "rotate-45" : ""} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full pb-2">
        <div className="w-full">
          {/* Day headers */}
          <div className="grid grid-cols-7 sm:grid-cols-[repeat(7,1fr)_110px] gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1.5 sm:py-2 bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="py-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                {d}
              </div>
            ))}
            <div className="hidden sm:block py-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
              Weekly
            </div>
          </div>

          {/* Calendar rows */}
          <div className="flex flex-col gap-1 sm:gap-1.5 p-1 sm:p-2 bg-slate-50/40 dark:bg-black/10">
            {isPageLoading ? (
              Array.from({ length: 5 }).map((_, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 sm:grid-cols-[repeat(7,1fr)_110px] gap-1 sm:gap-1.5 animate-pulse">
                  {Array.from({ length: 7 }).map((_, dIdx) => (
                    <div key={dIdx} className="min-h-[56px] sm:min-h-[110px] p-1.5 sm:p-3.5 rounded-[14px] sm:rounded-[22px] border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between bg-slate-50/20 dark:bg-white/[0.005]">
                      <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-200 dark:bg-white/10" />
                      <div className="mt-auto pt-1">
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 bg-slate-200 dark:bg-white/10 rounded" />
                      </div>
                    </div>
                  ))}
                  <div className="hidden sm:flex border-2 border-white dark:border-white/5 rounded-[18px] sm:rounded-[22px] flex-col items-center justify-center text-center px-4 py-3 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Week {wIdx + 1}</span>
                    <Skeleton className="h-4 w-14 bg-slate-200 dark:bg-white/10 rounded mb-1" />
                    <Skeleton className="h-3 w-10 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>
                </div>
              ))
            ) : (
              weeks.map((week, wIdx) => {
                const ws = weeklyData[wIdx] ?? { pnl: 0, active: 0 };
                return (
                  <div key={wIdx} className="grid grid-cols-7 sm:grid-cols-[repeat(7,1fr)_110px] gap-1 sm:gap-1.5">
                    {week.map((day, dIdx) => {
                      const dayData = day ? tradesByDate.get(day) : undefined;
                      const isToday = day === new Date().getDate() && 
                                      currentDate.getMonth() === new Date().getMonth() && 
                                      currentDate.getFullYear() === new Date().getFullYear();
                      return (
                        <CalendarCell
                          key={dIdx}
                          day={day}
                          pnl={dayData?.pnl}
                          formattedPnl={dayData?.pnl !== undefined ? formatPnl(dayData.pnl) : undefined}
                          trades={dayData?.trades}
                          isToday={isToday}
                          onClick={() => {
                            if (isStarter) {
                              toast.error(
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <Crown size={16} className="text-amber-500" />
                                    <span className="font-bold text-slate-900 dark:text-white">Pro Feature</span>
                                  </div>
                                  <span className="text-slate-600 dark:text-slate-300">Upgrade to Pro or Elite to access the Daily Journal & Performance Summary.</span>
                                </div>
                              );
                              return;
                            }
                            if (day) {
                              setSelectedDateObj(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                            }
                          }}
                        />
                      );
                    })}
                    <div className="hidden sm:flex border-2 border-white dark:border-[1px] dark:border-white/5 rounded-[18px] sm:rounded-[22px] flex-col items-center justify-center text-center px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-b from-[#F5F7FB] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] dark:bg-none dark:bg-[#161A22] dark:shadow-none dark:hover:shadow-none">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Week {wIdx + 1}</span>
                      <span className={`text-[12.5px] sm:text-[13px] font-bold tracking-tight font-sans tabular-nums ${ws.pnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                        {ws.pnl !== 0 ? formatPnl(ws.pnl) : formatPnl(0)}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-slate-400/80 tracking-wide mt-0.5 sm:mt-1">{ws.active} {ws.active === 1 ? "day" : "days"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Mobile Weekly Summary Bar */}
          <div className="sm:hidden flex items-center justify-between gap-1.5 px-2.5 py-2 mt-1.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 overflow-x-auto scrollbar-hide">
            <span className="text-[9px] font-extrabold uppercase text-slate-400 shrink-0">Weekly:</span>
            {weeklyData.map((ws, idx) => (
              <div key={idx} className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-2xs">
                <span className="text-[9px] font-bold text-slate-400">W{idx + 1}:</span>
                <span className={`text-[9.5px] font-bold tabular-nums font-sans ${ws.pnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                  {ws.pnl !== 0 ? formatPnl(ws.pnl) : "$0"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings / Info Popover */}
      {showSettings && (
        <div className="absolute right-2 sm:right-6 top-[64px] z-[100] w-[calc(100%-16px)] sm:w-80 max-w-[340px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-none p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              Calendar Stats & Legend
            </h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-wider transition-colors bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 px-2 py-0.5 rounded"
            >
              Close
            </button>
          </div>

          {/* Color Legend Section */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80">Color Legend</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Profitable</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F06363]/10 border border-[#F06363]/20">
                <span className="w-2 h-2 rounded-full bg-[#F06363]" />
                <span>Losing</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 col-span-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span>No Trades / Neutral</span>
              </div>
            </div>
          </div>

          {/* Stats/Insights Section */}
          <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-white/5 pt-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80">Monthly Insights</h4>
            {monthlyStats ? (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col p-3 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 dark:bg-[#10B981]/5 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#10B981]/80 mb-1">Best Day</span>
                    <span className="text-[14px] font-black text-[#10B981] leading-none tabular-nums font-sans">{formatPnl(monthlyStats.bestDay.pnl)}</span>
                    <span className="text-[9px] font-bold text-slate-400/80 mt-1.5">Day {monthlyStats.bestDay.day} ({monthlyStats.bestDay.trades} trd)</span>
                  </div>
                  
                  <div className="flex flex-col p-3 rounded-xl border border-[#F06363]/20 bg-[#F06363]/5 dark:bg-[#F06363]/5 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#F06363]/80 mb-1">Worst Day</span>
                    <span className="text-[14px] font-black text-[#F06363] leading-none tabular-nums font-sans">{formatPnl(monthlyStats.worstDay.pnl)}</span>
                    <span className="text-[9px] font-bold text-slate-400/80 mt-1.5">Day {monthlyStats.worstDay.day} ({monthlyStats.worstDay.trades} trd)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Avg Daily P&L</span>
                    <span className={`tabular-nums font-black text-[12px] font-sans ${monthlyStats.avgPnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                      {formatPnl(monthlyStats.avgPnl)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Winning Days</span>
                    <span className="font-sans text-[12px] text-slate-800 dark:text-slate-200 font-bold">
                      {monthlyStats.winningDays} / {tradingDays} ({Math.round(monthlyStats.winRate)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-2 mt-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Commissions</span>
                    <span className="font-sans text-[12px] font-black text-[#F06363]">
                      ${Math.abs(monthlyStats.totalCommission).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-2 mt-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Trades</span>
                    <span className="font-sans text-[12px] font-black text-slate-800 dark:text-white">{monthlyStats.totalTrades}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 rounded-xl border border-dashed border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <p className="text-[11px] text-slate-400/80 font-medium uppercase tracking-wider">No trading data this month</p>
              </div>
            )}
          </div>
        </div>
      )}


      <DailyJournalModal
        isOpen={!!selectedDateObj}
        onClose={() => setSelectedDateObj(null)}
        date={selectedDateObj || new Date()}
        trades={dayTrades}
        accountBalance={balance}
      />
    </div>
  );
}

function CalendarCell({ day, pnl, formattedPnl, trades, isToday, onClick }: { day: number | null, pnl?: number, formattedPnl?: string, trades?: number, isToday: boolean, onClick?: () => void }) {
  const getPillClass = () => {
    if (pnl === undefined || pnl === 0) {
      return "text-slate-500 bg-slate-100/80 dark:bg-white/5 dark:text-slate-400 border border-slate-200/50 dark:border-transparent";
    }
    if (pnl > 0) {
      return "text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 dark:bg-[#10B981]/10 dark:border-transparent";
    }
    return "text-[#F06363] bg-[#F06363]/15 border border-[#F06363]/30 dark:bg-[#F06363]/10 dark:border-transparent";
  };

  const getCellClasses = () => {
    if (!day) {
      return "min-h-[56px] sm:min-h-[110px] p-1 sm:p-3.5 rounded-[12px] sm:rounded-[22px] border border-transparent bg-transparent transition-all duration-200 pointer-events-none";
    }

    const baseClasses = "min-h-[56px] sm:min-h-[110px] p-1.5 sm:p-3.5 rounded-[12px] sm:rounded-[22px] border-2 border-white dark:border-[1px] dark:border-white/5 transition-all duration-300 relative flex flex-col justify-between cursor-pointer";

    if (pnl === undefined || pnl === 0) {
      // Neutral day
      return `${baseClasses} bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_2px_5px_-3px_rgba(0,0,0,0.08),0_0_0_1.5px_#E7E7E7] hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:bg-none dark:bg-[#141414] dark:shadow-none dark:hover:shadow-none`;
    }

    if (pnl > 0) {
      // Profitable day
      return `${baseClasses} bg-gradient-to-b from-[#EBF9F3] to-[#FFFFFF] shadow-[0_2px_5px_-3px_rgba(0,0,0,0.08),0_0_0_1.5px_#C2F0DD] hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#A5E5CB] dark:bg-none dark:bg-[#10B981]/5 dark:border-[#10B981]/20 dark:shadow-none dark:hover:shadow-none`;
    }

    // Losing day
    return `${baseClasses} bg-gradient-to-b from-[#FFF0F0] to-[#FFFFFF] shadow-[0_2px_5px_-3px_rgba(0,0,0,0.08),0_0_0_1.5px_#FCD1D1] hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#FAA2A2] dark:bg-none dark:bg-[#F06363]/5 dark:border-[#F06363]/20 dark:shadow-none dark:hover:shadow-none`;
  };

  return (
    <div
      onClick={day ? onClick : undefined}
      className={getCellClasses()}
    >
      <div className="flex justify-between items-start gap-1">
        {day && (
          <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[12px] font-bold shrink-0 ${
            isToday 
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/10 dark:shadow-white/5" 
              : "text-[#393939] dark:text-slate-400"
          }`}>
            {day}
          </span>
        )}
        {trades !== undefined && trades > 0 && (
          <span className={`text-[7.5px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded leading-none shrink-0 tracking-wide uppercase truncate max-w-[38px] sm:max-w-none ${getPillClass()}`}>
            {trades} {trades === 1 ? "trd" : "trds"}
          </span>
        )}
      </div>
      {day && pnl !== undefined && (
        <div className="mt-auto pt-1 sm:pt-2">
          <p className={`text-[9.5px] sm:text-[13px] font-bold tracking-tight leading-none font-sans tabular-nums truncate ${pnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
            {formattedPnl}
          </p>
        </div>
      )}
    </div>
  );
}



