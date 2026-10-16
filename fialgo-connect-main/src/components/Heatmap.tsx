import { useTrading } from "@/contexts/TradingContext";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings, Info } from "lucide-react";
import { useState, useMemo } from "react";

export default function Heatmap() {
  const { trades } = useTrading();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Generate mock daily P&L data for the month
  const dailyData = useMemo(() => {
    const data: Record<number, { profit: number; trades: number; winRate: number }> = {};
    // Simulate some trading days
    const seed = year * 100 + month;
    for (let d = 1; d <= daysInMonth; d++) {
      const hash = (seed * 31 + d * 17) % 100;
      if (hash < 25) {
        const profit = Math.round((Math.sin(d * 2.1 + seed) * 500 + 300) * 100) / 100;
        const tradeCount = Math.floor(Math.abs(Math.sin(d * 1.3)) * 5) + 1;
        const winRate = Math.round(50 + Math.sin(d) * 40);
        data[d] = { profit: Math.abs(profit), trades: tradeCount, winRate: Math.min(100, Math.max(0, winRate)) };
      }
    }
    return data;
  }, [year, month, daysInMonth]);

  // Weekly summaries
  const weeks = useMemo(() => {
    const result: { profit: number; days: number }[] = [];
    let weekProfit = 0;
    let weekDays = 0;
    let cellCount = 0;

    for (let i = 0; i < firstDayOfWeek; i++) cellCount++;

    for (let d = 1; d <= daysInMonth; d++) {
      if (dailyData[d]) {
        weekProfit += dailyData[d].profit;
        weekDays++;
      }
      cellCount++;
      if (cellCount % 7 === 0 || d === daysInMonth) {
        result.push({ profit: weekProfit, days: weekDays });
        weekProfit = 0;
        weekDays = 0;
      }
    }
    return result;
  }, [dailyData, daysInMonth, firstDayOfWeek]);

  const monthlyTotal = Object.values(dailyData).reduce((s, d) => s + d.profit, 0);
  const monthlyDays = Object.keys(dailyData).length;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 glass-card !p-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <h3 className="text-sm font-bold min-w-[140px] text-center">{monthLabel}</h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 px-3 py-1 text-[11px] font-semibold rounded-lg border border-border hover:bg-accent transition-colors"
          >
            This month
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Monthly stats:</span>
          <span className="text-xs font-bold text-success">${monthlyTotal.toFixed(0)}</span>
          <span className="text-xs text-muted-foreground">{monthlyDays} {monthlyDays === 1 ? "day" : "days"}</span>
          <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <Settings size={14} className="text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <Info size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Day Names */}
          <div className="grid grid-cols-7 border-b border-border">
            {dayNames.map((day) => (
              <div key={day} className="py-2.5 text-center text-[11px] font-semibold text-muted-foreground border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-r border-b border-border bg-accent/30" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const data = dailyData[day];
              const isToday = isCurrentMonth && today.getDate() === day;
              const cellIndex = firstDayOfWeek + i;
              const isLastCol = (cellIndex + 1) % 7 === 0;

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`min-h-[80px] p-2 border-b border-border relative transition-colors hover:bg-accent/30 ${
                    !isLastCol ? "border-r" : ""
                  } ${data ? "bg-success/8" : ""}`}
                  style={data ? { backgroundColor: `hsl(145 100% 39% / 0.08)` } : undefined}
                >
                  {/* Day number */}
                  <div className="flex items-start justify-end">
                    <span
                      className={`text-[11px] font-semibold ${
                        isToday
                          ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Trade data */}
                  {data && (
                    <div className="mt-1 text-center">
                      <p className="text-sm font-bold text-foreground">${data.profit.toFixed(0)}</p>
                      <p className="text-[10px] text-success font-medium">{data.trades} trades</p>
                      <p className="text-[10px] text-success font-medium">{data.winRate}%</p>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Trailing empty cells */}
            {Array.from({ length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div key={`trail-${i}`} className="min-h-[80px] border-r border-b border-border bg-accent/30 last:border-r-0" />
            ))}
          </div>
        </div>

        {/* Weekly Summary Sidebar */}
        <div className="w-[120px] border-l border-border shrink-0">
          <div className="py-2.5 text-center text-[11px] font-semibold text-muted-foreground border-b border-border">
            &nbsp;
          </div>
          {weeks.map((week, i) => (
            <div key={i} className="min-h-[80px] flex flex-col items-center justify-center border-b border-border px-2">
              <p className="text-[10px] text-muted-foreground font-medium">Week {i + 1}</p>
              <p className={`text-sm font-bold ${week.profit > 0 ? "text-success" : "text-foreground"}`}>
                ${week.profit.toFixed(0)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {week.days} {week.days === 1 ? "day" : "days"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
