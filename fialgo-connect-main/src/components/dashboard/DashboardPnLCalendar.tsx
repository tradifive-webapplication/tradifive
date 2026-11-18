import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
} from "lucide-react";

interface DashboardPnLCalendarProps {
  trades: any[];
  currSym: string;
  hidePnl: boolean;
  onLogTrade?: () => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatDayShort(val: number, sym: string): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "+";
  if (abs >= 1000) return `${sign}${sym}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${sym}${Math.round(abs)}`;
}

function formatFullMoney(val: number, sym: string): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : val > 0 ? "+" : "";
  return `${sign}${sym}${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const DashboardPnLCalendar: React.FC<DashboardPnLCalendarProps> = ({
  trades,
  currSym,
  hidePnl,
  onLogTrade,
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [direction, setDirection] = useState(1);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  // Group closed trades by YYYY-MM-DD
  const tradesByDay = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; items: any[] }>();
    (trades || []).forEach((t) => {
      if (t.is_pending || !t.closed_at) return;
      const d = new Date(t.closed_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      const existing = map.get(key) || { pnl: 0, count: 0, items: [] };
      existing.pnl += Number(t.profit || 0);
      existing.count += 1;
      existing.items.push(t);
      map.set(key, existing);
    });
    return map;
  }, [trades]);

  const { cells, monthStats } = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const list: Array<{
      key: string;
      day: number | null;
      isToday: boolean;
      pnl: number;
      count: number;
      items: any[];
    }> = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      list.push({
        key: `empty-${i}`,
        day: null,
        isToday: false,
        pnl: 0,
        count: 0,
        items: [],
      });
    }

    let monthPnl = 0;
    let greenDays = 0;
    let redDays = 0;
    let totalTrades = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const info = tradesByDay.get(key);
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        d === today.getDate();

      if (info && info.count > 0) {
        monthPnl += info.pnl;
        totalTrades += info.count;
        if (info.pnl > 0) greenDays += 1;
        else if (info.pnl < 0) redDays += 1;
      }

      list.push({
        key,
        day: d,
        isToday,
        pnl: info?.pnl ?? 0,
        count: info?.count ?? 0,
        items: info?.items ?? [],
      });
    }

    return {
      cells: list,
      monthStats: { monthPnl, greenDays, redDays, totalTrades },
    };
  }, [year, month, tradesByDay, today]);

  const stepMonth = (delta: number) => {
    setDirection(delta);
    setSelectedDayKey(null);
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDay = useMemo(() => {
    if (!selectedDayKey) return null;
    return cells.find((c) => c.key === selectedDayKey) || null;
  }, [selectedDayKey, cells]);

  const blurClass = hidePnl
    ? "blur-[5px] select-none opacity-80"
    : "blur-0 opacity-100";

  return (
    <section className="bg-white dark:bg-[#17171A] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-200/80 dark:border-white/[0.07]">
      {/* Top Bar: Title + Month P&L + Today shortcut */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight">
            P&amp;L calendar
          </h2>
          <span
            className={`text-[12px] font-medium tabular-nums transition-[filter,opacity] duration-200 ${blurClass} ${
              monthStats.monthPnl > 0
                ? "text-emerald-700 dark:text-emerald-400"
                : monthStats.monthPnl < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-400"
            }`}
          >
            {formatFullMoney(monthStats.monthPnl, currSym)}
          </span>
        </div>

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => {
              setDirection(1);
              setSelectedDayKey(null);
              setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
            className="text-[11.5px] font-medium text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            Today
          </button>
        )}
      </div>

      {/* Centered Month Navigator Row */}
      <div className="flex items-center justify-between px-1 mb-3">
        <button
          type="button"
          onClick={() => stepMonth(-1)}
          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={15} strokeWidth={1.9} />
        </button>

        <span className="text-[14px] font-semibold text-slate-900 dark:text-white tracking-tight">
          {monthLabel}
        </span>

        <button
          type="button"
          onClick={() => stepMonth(1)}
          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={15} strokeWidth={1.9} />
        </button>
      </div>

      {/* Single-Letter Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map((wd, idx) => (
          <div
            key={`${wd}-${idx}`}
            className="text-center text-[11px] font-medium text-slate-400 dark:text-neutral-500"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Tactile Keycap-Button Calendar Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: direction * 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -10 }}
          transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
          className="grid grid-cols-7 gap-1.5"
        >
          {cells.map((cell) => {
            if (cell.day === null) {
              return <div key={cell.key} className="h-[46px]" />;
            }

            const hasTrades = cell.count > 0;
            const isWin = hasTrades && cell.pnl > 0;
            const isLoss = hasTrades && cell.pnl < 0;
            const isSelected = selectedDayKey === cell.key;

            // Tactile sculpted button surface matching keycap button aesthetic
            let tileSurface =
              "bg-gradient-to-b from-[#FFFFFF] to-[#F4F5F7] border border-slate-200/80 shadow-[0_2px_4px_rgba(15,23,42,0.06),0_1px_1px_rgba(15,23,42,0.04),inset_0_-1.5px_0_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.95)] hover:to-[#ECEEF2] dark:bg-none dark:bg-[#202024] dark:border-white/[0.08] dark:shadow-[0_2px_4px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:bg-[#26262B]";

            if (isSelected) {
              tileSurface =
                "bg-[#E8EAEE] border border-slate-300/90 shadow-[inset_0_1px_2px_rgba(15,23,42,0.09)] dark:bg-white/15 dark:border-white/25 dark:shadow-none";
            } else if (isWin) {
              tileSurface =
                "bg-gradient-to-b from-[#F5FDF8] to-[#E6F7EE] border border-emerald-200/90 shadow-[0_2px_4px_rgba(16,185,129,0.09),0_1px_1px_rgba(15,23,42,0.03),inset_0_-1.5px_0_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] hover:to-[#DCF4E7] dark:bg-none dark:bg-emerald-500/[0.13] dark:border-emerald-500/30 dark:shadow-none";
            } else if (isLoss) {
              tileSurface =
                "bg-gradient-to-b from-[#FFF8F8] to-[#FDECEE] border border-rose-200/90 shadow-[0_2px_4px_rgba(225,29,72,0.08),0_1px_1px_rgba(15,23,42,0.03),inset_0_-1.5px_0_rgba(225,29,72,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] hover:to-[#FBE0E4] dark:bg-none dark:bg-rose-500/[0.13] dark:border-rose-500/30 dark:shadow-none";
            }

            const todayOutline = cell.isToday
              ? "!border-[1.5px] !border-slate-900 dark:!border-white"
              : "";

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() =>
                  setSelectedDayKey((prev) =>
                    prev === cell.key ? null : cell.key
                  )
                }
                className={`h-[46px] rounded-[12px] flex flex-col items-center justify-center px-0.5 transition-[transform,background-color,border-color,box-shadow] duration-150 active:translate-y-[1px] active:shadow-[0_1px_1px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(15,23,42,0.07)] cursor-pointer select-none relative ${tileSurface} ${todayOutline}`}
              >
                <span
                  className={`text-[12.5px] leading-none tabular-nums ${
                    isSelected || cell.isToday
                      ? "font-semibold text-slate-900 dark:text-white"
                      : hasTrades
                      ? "font-medium text-slate-800 dark:text-slate-100"
                      : "font-medium text-slate-600 dark:text-neutral-300"
                  }`}
                >
                  {cell.day}
                </span>

                {hasTrades && (
                  <span
                    className={`mt-1 text-[9.5px] font-semibold leading-none tabular-nums truncate max-w-full transition-[filter,opacity] duration-200 ${blurClass} ${
                      isWin
                        ? "text-emerald-700 dark:text-emerald-400"
                        : isLoss
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-500 dark:text-neutral-300"
                    }`}
                  >
                    {formatDayShort(cell.pnl, currSym)}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Expandable Selected Day Detail */}
      <AnimatePresence>
        {selectedDay && selectedDay.day !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[12px] font-semibold text-slate-900 dark:text-white">
                  {new Date(year, month, selectedDay.day).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {selectedDay.count > 0 ? (
                  <span
                    className={`text-[12px] font-semibold tabular-nums transition-[filter,opacity] duration-200 ${blurClass} ${
                      selectedDay.pnl >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatFullMoney(selectedDay.pnl, currSym)} · {selectedDay.count} trade
                    {selectedDay.count !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onLogTrade}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={2} />
                    Log a trade
                  </button>
                )}
              </div>

              {selectedDay.items.length > 0 && (
                <div className="space-y-1">
                  {selectedDay.items.slice(0, 4).map((t: any, i: number) => {
                    const pnl = Number(t.profit || 0);
                    return (
                      <div
                        key={t.id || i}
                        className="flex items-center justify-between text-[12px] px-2.5 py-1.5 rounded-[8px] bg-slate-50 dark:bg-white/[0.03]"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {t.symbol}
                        </span>
                        <span
                          className={`font-semibold tabular-nums transition-[filter,opacity] duration-200 ${blurClass} ${
                            pnl >= 0
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatFullMoney(pnl, currSym)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Summary */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2 text-[11.5px] text-slate-400 dark:text-neutral-500">
        <span>
          {monthStats.totalTrades > 0
            ? `${monthStats.greenDays}W · ${monthStats.redDays}L · ${monthStats.totalTrades} trades`
            : "Tap a day to open it"}
        </span>

        <Link
          to="/journal"
          className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
        >
          <span>Journal</span>
          <ArrowRight size={12} strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
};

export default DashboardPnLCalendar;
