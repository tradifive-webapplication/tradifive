import { useState, useMemo } from "react";
import { Info, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import DailyJournalModal from "./DailyJournalModal";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { useTradingTheme } from "@/hooks/useTradingTheme";

export default function JournalCalendar({
  loading,
  demoData,
}: {
  loading?: boolean;
  demoData?: { allTrades: any[]; balance: number } | null;
}) {
  const { recentTrades: rawRecentTrades, balance: rawBalance } = useDashboardData();

  const recentTrades = demoData ? demoData.allTrades : rawRecentTrades || [];
  const balance = demoData ? demoData.balance : rawBalance || 0;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { formatMoney, hideBalance, percentageOnly, isSettingsLoading } =
    useJournalSettings();
  const { config: tradingTheme } = useTradingTheme();
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const profitColor = isDark ? tradingTheme.profitHexDark : tradingTheme.profitHex;
  const lossColor = isDark ? tradingTheme.lossHexDark : tradingTheme.lossHex;

  const isPageLoading = loading || isSettingsLoading;

  const { weeks, monthLabel, monthlyTotal, tradingDays, weeklyData, tradesByDate } =
    useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay();

      const map = new Map<number, { pnl: number; trades: number }>();
      recentTrades.forEach((t: any) => {
        const tradeDateStr = t.closed_at || t.opened_at || t.created_at;
        if (!tradeDateStr || t.is_pending) return;
        const d = new Date(tradeDateStr);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          const current = map.get(day) || { pnl: 0, trades: 0 };
          current.pnl += Number(t.profit || 0);
          current.trades += 1;
          map.set(day, current);
        }
      });

      const weeksGrid: (number | null)[][] = [];
      const weekStats: { pnl: number; active: number }[] = [];
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
            const dayData = map.get(currentDay);
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
        monthLabel: currentDate.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        }),
        monthlyTotal: Array.from(map.values()).reduce((acc, d) => acc + d.pnl, 0),
        tradingDays: map.size,
        weeklyData: weekStats,
        tradesByDate: map,
      };
    }, [currentDate, recentTrades]);

  const dayTrades = useMemo(() => {
    if (!selectedDateObj || !recentTrades) return [];
    const targetYear = selectedDateObj.getFullYear();
    const targetMonth = selectedDateObj.getMonth();
    const targetDay = selectedDateObj.getDate();
    return recentTrades.filter((t: any) => {
      const tradeDateStr = t.closed_at || t.opened_at || t.created_at;
      if (!tradeDateStr || t.is_pending) return false;
      const d = new Date(tradeDateStr);
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

    const totalCommission =
      recentTrades.reduce((acc: number, t: any) => {
        if (!t.closed_at) return acc;
        const d = new Date(t.closed_at);
        if (
          d.getFullYear() === currentDate.getFullYear() &&
          d.getMonth() === currentDate.getMonth()
        ) {
          return acc + Number(t.commission || 0);
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
      totalCommission,
    };
  }, [tradesByDate, tradingDays, monthlyTotal, recentTrades, currentDate]);

  const formatPnl = (pnl: number) => {
    let str = "";
    if (percentageOnly && balance > 0) {
      str = `${pnl >= 0 ? "+" : ""}${((pnl / balance) * 100).toFixed(2)}%`;
    } else {
      str = formatMoney(pnl, { showSign: true, raw: true });
    }
    return hideBalance ? (
      <span className="blur-[5px] select-none opacity-75 transition-[filter,opacity] duration-200">
        {str}
      </span>
    ) : (
      str
    );
  };

  const today = new Date();

  return (
    <div className="bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                )
              }
              className="w-7 h-7 rounded-lg border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <h2 className="text-[14.5px] font-semibold text-slate-900 dark:text-white tracking-tight min-w-[126px] text-center">
              {monthLabel}
            </h2>
            <button
              type="button"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                )
              }
              className="w-7 h-7 rounded-lg border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="tactile-white-pill rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer"
          >
            This month
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Monthly:</span>
            {isPageLoading ? (
              <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span
                className={`text-[13px] font-bold tracking-tight tabular-nums ${monthlyTotal < 0
                    ? tradingTheme.lossText
                    : tradingTheme.profitText
                  }`}
              >
                {formatPnl(monthlyTotal)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-semibold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-md tabular-nums">
              {tradingDays}d active
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${showSettings
                  ? `${tradingTheme.profitBadge}`
                  : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              title="Monthly Insights & Legend"
            >
              <SlidersHorizontal size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3.5 bg-[#F8FAFC]/60 dark:bg-black/10">
        <div>
          {/* Day Headers */}
          <div className="grid grid-cols-7 sm:grid-cols-[repeat(7,1fr)_96px] gap-1.5 mb-1.5 px-0.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400"
              >
                {d}
              </div>
            ))}
            <div className="hidden sm:block py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Weekly
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-1.5">
            {isPageLoading
              ? Array.from({ length: 5 }).map((_, wIdx) => (
                <div
                  key={wIdx}
                  className="grid grid-cols-7 sm:grid-cols-[repeat(7,1fr)_96px] gap-1.5 animate-pulse"
                >
                  {Array.from({ length: 7 }).map((_, dIdx) => (
                    <div
                      key={dIdx}
                      className="min-h-[54px] sm:min-h-[86px] rounded-[12px] bg-white/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]"
                    />
                  ))}
                  <div className="hidden sm:flex rounded-[12px] bg-white/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]" />
                </div>
              ))
              : weeks.map((week, wIdx) => {
                const ws = weeklyData[wIdx] ?? { pnl: 0, active: 0 };
                return (
                  <div
                    key={wIdx}
                    className="grid grid-cols-7 sm:grid-cols-[repeat(7,1fr)_96px] gap-1.5"
                  >
                    {week.map((day, dIdx) => {
                      const dayData = day ? tradesByDate.get(day) : undefined;
                      const isToday =
                        day === today.getDate() &&
                        currentDate.getMonth() === today.getMonth() &&
                        currentDate.getFullYear() === today.getFullYear();

                      return (
                        <TactileCalendarCell
                          key={dIdx}
                          day={day}
                          pnl={dayData?.pnl}
                          formattedPnl={
                            dayData?.pnl !== undefined
                              ? formatPnl(dayData.pnl)
                              : undefined
                          }
                          trades={dayData?.trades}
                          isToday={isToday}
                          onClick={() => {
                            if (day) {
                              setSelectedDateObj(
                                new Date(
                                  currentDate.getFullYear(),
                                  currentDate.getMonth(),
                                  day
                                )
                              );
                            }
                          }}
                        />
                      );
                    })}

                    {/* Desktop Weekly Summary Tile */}
                    <div className="hidden sm:flex flex-col items-center justify-center text-center px-2 py-2 rounded-[14px] sm:rounded-[16px] bg-slate-50/80 dark:bg-[#18181B] border border-slate-200/80 dark:border-white/[0.07] shadow-[0_2px_6px_rgba(15,23,42,0.02)]">
                      <span className="text-[9.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Week {wIdx + 1}
                      </span>
                      <span
                        className={`text-[12.5px] font-black tracking-tight tabular-nums mt-1 ${ws.pnl < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : ws.pnl > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400"
                          }`}
                      >
                        {ws.pnl !== 0 ? formatPnl(ws.pnl) : formatPnl(0)}
                      </span>
                      <span className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
                        {ws.active} {ws.active === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Mobile Weekly Summary Bar */}
        <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-2 mt-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] overflow-x-auto no-scrollbar">
          <span className="text-[9.5px] font-semibold uppercase text-slate-400 shrink-0">
            Weekly:
          </span>
          {weeklyData.map((ws, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.08]"
            >
              <span className="text-[9.5px] font-semibold text-slate-400">
                W{idx + 1}:
              </span>
              <span
                className={`text-[10px] font-bold tabular-nums ${ws.pnl < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : ws.pnl > 0
                      ? "text-[#2563EB] dark:text-blue-400"
                      : "text-slate-400"
                  }`}
              >
                {ws.pnl !== 0 ? formatPnl(ws.pnl) : formatPnl(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Insights & Legend Popover */}
      {showSettings && (
        <div className="absolute right-3 top-[60px] z-[80] w-[calc(100%-24px)] sm:w-80 bg-white/98 dark:bg-[#1C1C20]/98 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-[0_20px_45px_rgba(15,23,42,0.14)] p-4 rounded-2xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
            <h3 className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
              <Info size={13} className="text-[#2563EB]" />
              Calendar Stats &amp; Legend
            </h3>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-600 dark:text-neutral-300">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: profitColor }} />
              <span>Profitable</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lossColor }} />
              <span>Losing</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Monthly Insights
            </h4>
            {monthlyStats ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border ${tradingTheme.profitBorder} ${tradingTheme.profitBg}`}>
                    <span className={`text-[9.5px] font-semibold uppercase ${tradingTheme.profitText}`}>
                      Best Day
                    </span>
                    <p className={`text-[13.5px] font-bold ${tradingTheme.profitText} tabular-nums mt-0.5`}>
                      {formatPnl(monthlyStats.bestDay.pnl)}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-0.5">
                      Day {monthlyStats.bestDay.day} · {monthlyStats.bestDay.trades} trd
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10">
                    <span className="text-[9.5px] font-semibold uppercase text-rose-500">
                      Worst Day
                    </span>
                    <p className="text-[13.5px] font-bold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                      {formatPnl(monthlyStats.worstDay.pnl)}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-0.5">
                      Day {monthlyStats.worstDay.day} · {monthlyStats.worstDay.trades} trd
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Daily P&amp;L</span>
                    <span
                      className={`font-semibold tabular-nums ${monthlyStats.avgPnl < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-[#2563EB] dark:text-blue-400"
                        }`}
                    >
                      {formatPnl(monthlyStats.avgPnl)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Winning Days</span>
                    <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
                      {monthlyStats.winningDays} / {tradingDays} (
                      {Math.round(monthlyStats.winRate)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commissions</span>
                    <span className="font-semibold text-rose-500 tabular-nums">
                      {formatMoney(Math.abs(monthlyStats.totalCommission), {
                        raw: true,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Trades</span>
                    <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
                      {monthlyStats.totalTrades}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-[11px] text-slate-400">
                  No trading data this month
                </p>
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

function TactileCalendarCell({
  day,
  pnl,
  formattedPnl,
  trades,
  isToday,
  onClick,
}: {
  day: number | null;
  pnl?: number;
  formattedPnl?: React.ReactNode;
  trades?: number;
  isToday: boolean;
  onClick?: () => void;
}) {
  const { config: tradingTheme } = useTradingTheme();

  if (!day) {
    return (
      <div className="min-h-[54px] sm:min-h-[86px] rounded-[14px] sm:rounded-[16px] pointer-events-none" />
    );
  }

  const isWin = pnl !== undefined && pnl > 0;
  const isLoss = pnl !== undefined && pnl < 0;

  const winBg =
    "bg-gradient-to-b from-emerald-500/[0.07] to-emerald-500/[0.13] dark:from-emerald-500/15 dark:to-emerald-500/5 border border-emerald-500/25 dark:border-emerald-500/30 shadow-[0_2px_6px_rgba(16,185,129,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-none hover:border-emerald-500/50 hover:shadow-md hover:scale-[1.01] transition-all";

  const lossBg =
    "bg-gradient-to-b from-rose-500/[0.06] to-rose-500/[0.12] dark:from-rose-500/15 dark:to-rose-500/5 border border-rose-500/25 dark:border-rose-500/30 shadow-[0_2px_6px_rgba(244,63,94,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-none hover:border-rose-500/50 hover:shadow-md hover:scale-[1.01] transition-all";

  const emptyBg =
    "bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-white/[0.07] shadow-[0_2px_6px_rgba(15,23,42,0.02)] hover:border-slate-300 dark:hover:border-white/15 hover:shadow-sm hover:scale-[1.01] transition-all";

  const tileClasses = isWin ? winBg : isLoss ? lossBg : emptyBg;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[54px] sm:min-h-[86px] p-2 sm:p-2.5 rounded-[14px] sm:rounded-[16px] text-left flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-95 ${tileClasses} ${
        isToday
          ? "ring-2 ring-slate-900 dark:ring-white shadow-sm"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1 w-full">
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 tabular-nums ${
            isToday
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "text-slate-700 dark:text-neutral-200"
          }`}
        >
          {day}
        </span>
        {trades !== undefined && trades > 0 && (
          <span
            className={`text-[8.5px] sm:text-[9.5px] font-bold px-1.5 py-0.5 rounded-md leading-none shrink-0 tabular-nums ${
              isWin
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                : isLoss
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25"
                  : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-neutral-300 border border-slate-200/60 dark:border-white/10"
            }`}
          >
            {trades}t
          </span>
        )}
      </div>
      {pnl !== undefined && (
        <div className="mt-auto pt-1 w-full">
          <p
            className={`text-[10px] sm:text-[12.5px] font-black tracking-tight leading-none tabular-nums truncate ${
              pnl < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {formattedPnl}
          </p>
        </div>
      )}
    </button>
  );
}
