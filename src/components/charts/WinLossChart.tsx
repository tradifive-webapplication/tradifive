import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface WinLossChartProps {
  trades: any[];
  isDark: boolean;
}

export default function WinLossChart({ trades, isDark }: WinLossChartProps) {
  const data = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let breakeven = 0;

    const closedTrades = trades.filter(t => t.closed_at);

    closedTrades.forEach(t => {
      if (t.profit > 0) wins++;
      else if (t.profit < 0) losses++;
      else breakeven++;
    });

    const total = wins + losses + breakeven;

    return [
      { name: 'Wins', value: wins, color: '#10B981', percentage: total > 0 ? (wins / total) * 100 : 0 },
      { name: 'Losses', value: losses, color: '#F43F5E', percentage: total > 0 ? (losses / total) * 100 : 0 },
      { name: 'Breakeven', value: breakeven, color: '#94A3B8', percentage: total > 0 ? (breakeven / total) * 100 : 0 }
    ].filter(d => d.value > 0);
  }, [trades]);

  const winRate = useMemo(() => {
    const wins = data.find(d => d.name === 'Wins')?.value || 0;
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, color, percentage } = payload[0].payload;
      return (
        <div className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-[#1A1A1C] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl flex items-center gap-3`}>
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
          <div className="flex flex-col">
            <span className="text-[13px] font-bold">{name}: {value}</span>
            <span className="text-[11px] font-medium opacity-70">{percentage.toFixed(1)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            cornerRadius={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Win Rate</span>
        <span className="text-[36px] font-black text-slate-900 dark:text-white tracking-tight leading-none">{winRate}%</span>
      </div>
    </div>
  );
}
