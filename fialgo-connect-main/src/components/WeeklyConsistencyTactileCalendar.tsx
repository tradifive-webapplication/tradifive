import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck, Flame, Award, Clock } from "lucide-react";
import { DailyDisciplineRecord } from "@/utils/disciplineScore";

interface WeeklyConsistencyTactileCalendarProps {
  calendarHistory?: Record<string, DailyDisciplineRecord>;
  todayScore?: number;
  todayGrade?: string;
  className?: string;
}

export const WeeklyConsistencyTactileCalendar: React.FC<WeeklyConsistencyTactileCalendarProps> = ({
  calendarHistory = {},
  todayScore = 96,
  todayGrade = "A+",
  className = "",
}) => {
  // Current active date - default to today (Nov 21, 2026)
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-21");

  // Generate 7 days for the current week: Monday to Sunday
  // Mon Nov 16 to Sun Nov 22, 2026
  const weekDays = [
    { date: "2026-11-16", dayNum: 16, dayLabel: "Mon", isToday: false },
    { date: "2026-11-17", dayNum: 17, dayLabel: "Tue", isToday: false },
    { date: "2026-11-18", dayNum: 18, dayLabel: "Wed", isToday: false },
    { date: "2026-11-19", dayNum: 19, dayLabel: "Thu", isToday: false },
    { date: "2026-11-20", dayNum: 20, dayLabel: "Fri", isToday: false },
    { date: "2026-11-21", dayNum: 21, dayLabel: "Sat", isToday: true },
    { date: "2026-11-22", dayNum: 22, dayLabel: "Sun", isToday: false, isMarketClosed: true },
  ];

  const getRecordForDate = (dateStr: string) => {
    if (calendarHistory[dateStr]) return calendarHistory[dateStr];
    if (dateStr === "2026-11-21") {
      return {
        date: "2026-11-21",
        score: todayScore,
        grade: todayGrade as "A+" | "A",
        tradesCount: 3,
        stopLossRate: 100,
        xpEarned: 120,
      };
    }
    return null;
  };

  const activeRecord = getRecordForDate(selectedDate);
  const activeDayObj = weekDays.find((d) => d.date === selectedDate) || weekDays[5];

  return (
    <div
      className={`bg-white dark:bg-[#17171A] rounded-[24px] sm:rounded-[28px] border border-slate-200/70 dark:border-white/[0.07] p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] select-none ${className}`}
    >
      {/* ── HEADER ROW: "Today" on Left, "< Nov • 2026 >" on Right ── */}
      <div className="flex items-center justify-between pb-3 sm:pb-3.5 mb-3.5 sm:mb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[19px] sm:text-[21px] font-black tracking-tight bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 dark:from-fuchsia-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Today
          </h3>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="text-[12px] font-bold text-slate-500 dark:text-neutral-400">
            Weekly Consistency
          </span>
        </div>

        {/* Month selector with tactile arrows matching the reference image */}
        <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 dark:text-neutral-400">
          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Previous week"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
          <span className="tabular-nums tracking-wide font-semibold px-0.5">
            Nov • 2026
          </span>
          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Next week"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── 7 TACTILE DAY CAPSULES (MON TO SUN) ── */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 items-start">
        {weekDays.map((day) => {
          const isSelected = selectedDate === day.date;
          const isToday = day.isToday;
          const record = getRecordForDate(day.date);
          const hasScore = record && record.score > 0;
          const isAPlus = record && record.score >= 95;

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 min-w-0">
              {/* Vertical Capsule Body */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedDate(day.date)}
                className={`w-full max-w-[56px] rounded-[18px] sm:rounded-[20px] p-1.5 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer relative ${
                  isToday
                    ? "bg-gradient-to-b from-[#A855F7] via-[#9333EA] to-[#7E22CE] shadow-[0_4px_16px_rgba(168,85,247,0.38)] ring-2 ring-[#C084FC]/60 ring-offset-2 dark:ring-offset-[#17171A]"
                    : isSelected
                    ? "bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-md ring-2 ring-indigo-400/50"
                    : "bg-[#78808D] dark:bg-[#343842] hover:bg-[#68707D] dark:hover:bg-[#3F4450] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
                }`}
              >
                {/* Top White Inset Tile (Date Number) */}
                <div
                  className={`w-full py-1.5 sm:py-2 rounded-[13px] sm:rounded-[15px] flex flex-col items-center justify-center transition-all ${
                    isToday
                      ? "bg-white text-[#9333EA] shadow-[0_2px_5px_rgba(0,0,0,0.14),inset_0_-1px_1px_rgba(0,0,0,0.05)]"
                      : isSelected
                      ? "bg-white text-indigo-700 shadow-[0_2px_5px_rgba(0,0,0,0.14)]"
                      : "bg-white dark:bg-[#202228] text-slate-700 dark:text-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.12),inset_0_-1px_1px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <span className="text-[15px] sm:text-[17px] font-black tracking-tight leading-none tabular-nums">
                    {day.dayNum}
                  </span>
                </div>

                {/* Bottom Day Label */}
                <div className="w-full text-center pt-1 pb-0.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider block leading-none">
                    {day.dayLabel}
                  </span>
                </div>
              </motion.button>

              {/* Bottom Micro Consistency Score Chip */}
              <div className="w-full flex justify-center">
                {day.isMarketClosed ? (
                  <span className="text-[8px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-tight py-0.5">
                    Weekend
                  </span>
                ) : hasScore ? (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold tabular-nums border whitespace-nowrap shadow-2xs ${
                      isAPlus
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20"
                        : "bg-blue-50 dark:bg-blue-500/10 text-[#2563EB] dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full shrink-0 ${
                        isAPlus ? "bg-emerald-500" : "bg-[#2563EB]"
                      }`}
                    />
                    <span>{record.score}</span>
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-300 dark:text-neutral-600 font-bold">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SELECTED DAY DISCIPLINE DETAIL DRAWER ── */}
      <AnimatePresence mode="wait">
        {activeRecord && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 text-[11px]"
          >
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 dark:text-white">
                {activeDayObj.dayLabel}, Nov {activeDayObj.dayNum}
              </span>
              <span className="text-slate-300 dark:text-neutral-600">·</span>
              <span
                className={`font-extrabold px-2 py-0.5 rounded-full text-[9px] ${
                  activeRecord.score >= 95
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400"
                }`}
              >
                Grade {activeRecord.grade} ({activeRecord.score}/100)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10.5px] text-slate-500 dark:text-neutral-400 font-semibold">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={12} />
                SL 100%
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                {activeRecord.tradesCount} Trades
              </span>
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Award size={12} />
                +{activeRecord.xpEarned} XP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeeklyConsistencyTactileCalendar;
