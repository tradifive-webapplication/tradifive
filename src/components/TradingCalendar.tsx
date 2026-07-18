import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Settings, Info } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

const BlurOverlay = () => (
  <div className="absolute inset-0 z-50 bg-white/5 dark:bg-slate-900/5 rounded-[20px]" />
);

export default function TradingCalendar() {
  const { recentTrades } = useDashboardData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const hasData = recentTrades && recentTrades.length > 0;

  const { weeks, monthLabel, globalTotalProfit, globalTotalDays } = useMemo(() => {
    // 1. Setup Date Boundaries
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    // 2. Aggregate Trades
    const tradesByDate = new Map<string, { profit: number, trades: number, wins: number }>();
    if (recentTrades) {
      recentTrades.forEach((t: any) => {
        if (!t.closed_at) return;
        const d = new Date(t.closed_at);
        if (d.getFullYear() === year && d.getMonth() === month) {
           const key = d.getDate().toString();
           const current = tradesByDate.get(key) || { profit: 0, trades: 0, wins: 0 };
           current.trades += 1;
           const p = Number(t.profit) || 0;
           current.profit += p;
           if (p > 0) current.wins += 1;
           tradesByDate.set(key, current);
        }
      });
    }

    // 3. Build Grid
    let currentDayIter = 1;
    const constructedWeeks = [];
    let weekId = 1;
    let totalMonthProfit = 0;
    let totalActiveDays = 0;

    for (let row = 0; row < 6; row++) {
      const cells = [];
      let weekProfit = 0;
      let weekDays = 0;
      
      for (let col = 0; col < 7; col++) {
        if (row === 0 && col < startDayOfWeek) {
          cells.push({ d: "", active: false });
        } else if (currentDayIter > daysInMonth) {
          cells.push({ d: "", active: false });
        } else {
          const isToday = currentDayIter === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          const dayId = currentDayIter.toString();
          const dayData = tradesByDate.get(dayId);
          
          if (dayData) {
             weekProfit += dayData.profit;
             totalMonthProfit += dayData.profit;
             weekDays += 1;
             totalActiveDays += 1;
             
             const winRate = dayData.trades > 0 ? Math.round((dayData.wins / dayData.trades) * 100) : 0;
             const isProfitable = dayData.profit >= 0;

             cells.push({
               d: dayId,
               blue: isToday,
               pnl: (isProfitable ? "+$" : "-$") + Math.abs(dayData.profit).toFixed(2),
               trades: `${dayData.trades} trades`,
               win: `${winRate}% Win`,
               bg: isProfitable ? "bg-[#eefcf2] dark:bg-[#16a34a]/10" : "bg-red-50 dark:bg-red-900/10",
               textColor: isProfitable ? "text-[#16a34a]" : "text-red-500",
               pnlColor: isProfitable ? "text-foreground" : "text-red-600 dark:text-red-400"
             });
          } else {
             cells.push({ d: dayId, active: false, blue: isToday });
          }
          currentDayIter++;
        }
      }
      
      constructedWeeks.push({
        id: weekId++,
        total: (weekProfit >= 0 ? "+$" : "-$") + Math.abs(weekProfit).toFixed(2),
        totalVal: weekProfit,
        days: weekDays,
        cells
      });
      if (currentDayIter > daysInMonth) break;
    }
    
    return {
       weeks: constructedWeeks,
       monthLabel: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
       globalTotalProfit: totalMonthProfit,
       globalTotalDays: totalActiveDays
    };
  }, [currentDate, recentTrades]);

  const resetToCurrentMonth = () => setCurrentDate(new Date());

  return (
    <div className="bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/60 overflow-hidden mt-8 relative">
      {!hasData && <BlurOverlay />}
      {/* Header */}
      <div className="p-5 border-b border-border/60 flex items-center justify-between bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E]">
        <div className="flex items-center gap-4">
          <ChevronLeft 
            size={18} 
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          />
          <h3 className="text-lg font-bold text-foreground mx-1 min-w-[120px] text-center">{monthLabel}</h3>
          <ChevronRight 
            size={18} 
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          />
          
          <button onClick={resetToCurrentMonth} className="px-5 py-1.5 rounded-full border border-border/80 text-sm font-semibold hover:bg-slate-50 dark:bg-[#141414] dark:bg-blue-500 ml-2 text-foreground shadow-sm transition-colors">
            This month
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
           <span className="text-muted-foreground font-medium">Monthly stats:</span>
           <span className={`font-bold text-[15px] ${globalTotalProfit >= 0 ? "text-[#16a34a]" : "text-red-500"}`}>
             {globalTotalProfit >= 0 ? "+$" : "-$"}{Math.abs(globalTotalProfit).toFixed(2)}
           </span>
           <span className="text-muted-foreground font-medium">{globalTotalDays} days</span>
           <div className="h-4 w-px bg-border mx-1"></div>
           <Settings size={18} className="text-muted-foreground cursor-pointer hover:text-foreground" />
           <Info size={18} className="text-muted-foreground cursor-pointer hover:text-foreground" />
        </div>
      </div>
      
      {/* Grid Headers */}
      <div className="w-full grid" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr)) 120px' }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="py-4 text-center text-xs font-semibold text-muted-foreground border-b border-r border-border/40 bg-white dark:bg-[#1E1E1E] tracking-wide">
            {day}
          </div>
        ))}
        <div className="py-4 bg-white dark:bg-[#1E1E1E] border-b border-border/40"></div>
      </div>
      
      {/* Grid Body */}
      <div className="flex flex-col">
        {weeks.map((week, wi) => (
          <div key={wi} className="w-full grid" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr)) 120px' }}>
            {week.cells.map((cell, ci) => (
             <div key={ci} className={`relative p-2 border-r border-b border-border/40 min-h-[110px] ${cell.bg || 'bg-white dark:bg-[#1E1E1E]'}`}>
                {cell.blue ? (
                  <div className="absolute top-2.5 right-2.5 h-6 w-6 bg-white text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {cell.d}
                  </div>
                ) : (
                  <span className="text-[13px] text-muted-foreground absolute top-2 right-3 font-semibold">{cell.d}</span>
                )}
                
                {cell.pnl && (
                  <div className="flex flex-col items-center justify-center h-full pt-5">
                    <span className={`font-extrabold text-[15px] ${cell.pnlColor}`}>{cell.pnl}</span>
                    <span className={`text-[11px] font-bold mt-1 tracking-wide ${cell.textColor}`}>{cell.trades}</span>
                    <span className={`text-[11px] font-bold leading-tight ${cell.textColor}`}>{cell.win}</span>
                  </div>
                )}
             </div>
            ))}
            <div className="flex flex-col items-center justify-center border-b border-border/40 bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] min-h-[110px]">
               <span className="text-xs font-bold text-muted-foreground">Week {week.id}</span>
               <span className={`text-[16px] font-extrabold my-0.5 ${week.totalVal >= 0 ? "text-[#16a34a]" : "text-red-500"}`}>{week.total}</span>
               <span className="text-xs font-medium text-muted-foreground">{week.days} active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



