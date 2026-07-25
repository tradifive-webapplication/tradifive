import React, { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PerformanceChartProps {
  trades: any[];
  isDark: boolean;
}

export default function PerformanceChart({ trades, isDark }: PerformanceChartProps) {
  const data = useMemo(() => {
    // Sort trades by closed_at ascending
    const sorted = [...trades].filter(t => t.closed_at).sort((a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime());

    let cumulative = 0;
    const chartData = sorted.map((t, index) => {
      cumulative += t.profit;
      return {
        name: `Trade ${index + 1}`,
        profit: cumulative,
        actualProfit: t.profit,
        date: new Date(t.closed_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
    });

    // If no trades, provide a flat line or empty data
    if (chartData.length === 0) {
      return [{ date: 'Today', profit: 0, actualProfit: 0 }];
    }

    // Add a starting point of 0 if we want the chart to start from base
    return [{ date: 'Start', profit: 0, actualProfit: 0 }, ...chartData];
  }, [trades]);

  const isProfitable = data.length > 0 && data[data.length - 1].profit >= 0;
  const strokeColor = isProfitable ? '#10B981' : '#F43F5E';
  const gradientId = isProfitable ? 'colorProfit' : 'colorLoss';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#1A1A1C] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl`}>
          <p className="text-[11px] font-bold opacity-60 mb-1">{dataPoint.date}</p>
          <p className="text-[18px] font-black tracking-tight mb-0.5">
            <span className={dataPoint.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
              {dataPoint.profit >= 0 ? '+' : '-'}${Math.abs(dataPoint.profit).toFixed(2)}
            </span>
          </p>
          {dataPoint.date !== 'Start' && (
            <p className="text-[11px] font-medium opacity-70">
              Trade: <span className={dataPoint.actualProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {dataPoint.actualProfit >= 0 ? '+' : '-'}${Math.abs(dataPoint.actualProfit).toFixed(2)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 15 }}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#71717A' : '#94A3B8', fontSize: 10, fontWeight: 600 }}
            dy={10}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#71717A' : '#94A3B8', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="profit"
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor, style: { filter: `drop-shadow(0px 0px 8px ${strokeColor})` } }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
