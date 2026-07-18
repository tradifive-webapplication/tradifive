"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useTrading } from "@/contexts/TradingContext"
import { useMemo } from "react"

export const description = "A radar chart"

const METRIC_COLORS: Record<string, { fill: string; stroke: string }> = {
  "Discipline":   { fill: "#6366f1", stroke: "#6366f1" },
  "Risk Mgmt":    { fill: "#10b981", stroke: "#10b981" },
  "Consistency":  { fill: "#f59e0b", stroke: "#f59e0b" },
  "Execution":    { fill: "#3b82f6", stroke: "#3b82f6" },
  "Psychology":   { fill: "#ec4899", stroke: "#ec4899" },
  "Accuracy":     { fill: "#8b5cf6", stroke: "#8b5cf6" },
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    const meta = METRIC_COLORS[d.metric] || { fill: "#6366f1" }
    return (
      <div style={{ background: "rgba(15,23,42,0.92)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 10px 25px rgba(0,0,0,0.4)" }}>
        <p style={{ color: meta.fill, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.metric}</p>
        <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{d.score}<span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginLeft: 2 }}>/100</span></p>
      </div>
    )
  }
  return null
}

export function ChartRadarDefault() {
  const { recentTrades: rawRecentTrades, winRate: rawWinRate, activeMarket } = useDashboardData()
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
      notes: "Simulated trade execution.",
      lot_size: [1.5, 2.0, 1.0, 0.5, 0.8, 1.0, 2.5][i],
    };
  });

  const recentTrades = isDemo ? mockRecentTrades : (rawRecentTrades || []);
  const winRate = isDemo ? 68 : (rawWinRate || 0);

  const chartData = useMemo(() => {
    if (!recentTrades || recentTrades.length === 0) {
      return [
        { metric: "Discipline",  score: 0 },
        { metric: "Risk Mgmt",   score: 0 },
        { metric: "Consistency", score: 0 },
        { metric: "Execution",   score: 0 },
        { metric: "Psychology",  score: 0 },
        { metric: "Accuracy",    score: 0 },
      ]
    }

    const closed = recentTrades.filter(t => t.closed_at && !t.is_pending)
    const last50 = closed.slice(0, 50)
    if (last50.length === 0) {
      return [
        { metric: "Discipline",  score: 0 },
        { metric: "Risk Mgmt",   score: 0 },
        { metric: "Consistency", score: 0 },
        { metric: "Execution",   score: 0 },
        { metric: "Psychology",  score: 0 },
        { metric: "Accuracy",    score: 0 },
      ]
    }

    const wins = last50.filter(t => t.profit > 0)
    const losses = last50.filter(t => t.profit < 0)
    const wr = last50.length > 0 ? (wins.length / last50.length) * 100 : 0

    // Win Rate → Accuracy
    const accuracy = Math.round(wr)

    // Average profit factor → Risk Mgmt
    const totalWin = wins.reduce((a, t) => a + (t.profit || 0), 0)
    const totalLoss = Math.abs(losses.reduce((a, t) => a + (t.profit || 0), 0))
    const pf = totalLoss > 0 ? totalWin / totalLoss : (totalWin > 0 ? 2 : 1)
    const riskMgmt = Math.min(100, Math.round((pf / 2) * 100))

    // Consistency: how many trading days have at least 1 trade
    const tradeDays = new Set(last50.map(t => new Date(t.closed_at).toDateString())).size
    const consistency = Math.min(100, Math.round((tradeDays / 20) * 100))

    // Discipline: based on SL usage (if trades have SL set)
    const withSL = last50.filter(t => t.stop_loss && Number(t.stop_loss) > 0)
    const discipline = Math.min(100, Math.round((withSL.length / last50.length) * 100))

    // Execution: win/loss ratio of avg trade size
    const avgWin = wins.length > 0 ? totalWin / wins.length : 0
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 1
    const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 1
    const execution = Math.min(100, Math.round((rrRatio / 2) * 100))

    // Psychology: consistency of not having >3 consecutive losses
    let maxLossStreak = 0
    let streak = 0
    last50.forEach(t => {
      if (t.profit < 0) { streak++; maxLossStreak = Math.max(maxLossStreak, streak) }
      else streak = 0
    })
    const psychology = Math.max(0, Math.min(100, 100 - maxLossStreak * 12))

    return [
      { metric: "Discipline",  score: discipline },
      { metric: "Risk Mgmt",   score: riskMgmt },
      { metric: "Consistency", score: consistency },
      { metric: "Execution",   score: execution },
      { metric: "Psychology",  score: psychology },
      { metric: "Accuracy",    score: accuracy },
    ]
  }, [recentTrades, winRate])

  const overallScore = Math.round(chartData.reduce((a, d) => a + d.score, 0) / chartData.length)
  const hasData = recentTrades && recentTrades.length > 0

  return (
    <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] rounded-[22px] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none overflow-hidden flex flex-col h-full transition-all duration-300 hover:scale-[1.002] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] dark:hover:shadow-none relative p-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">TradiFive Score</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your comprehensive trading performance breakdown</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[26px] font-black tabular-nums" style={{ background: "linear-gradient(135deg,#6366f1,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {overallScore}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-1">Overall</span>
        </div>
      </div>

      {/* Radar */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
            <defs>
              <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.25} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="#e2e8f0" className="dark:[stroke:#374151]" strokeDasharray="0" />
            <PolarAngleAxis
              dataKey="metric"
              tick={({ x, y, textAnchor, payload }: any) => {
                const meta = METRIC_COLORS[payload.value] || { fill: "#64748b" }
                return (
                  <text x={x} y={y} textAnchor={textAnchor} fill={meta.fill} fontSize={10} fontWeight={700} dy={4}>
                    {payload.value}
                  </text>
                )
              }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="score"
              stroke="url(#radarGrad)"
              strokeWidth={2}
              fill="url(#radarGrad)"
              fillOpacity={1}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend scores */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-2">
        {chartData.map(d => {
          const meta = METRIC_COLORS[d.metric] || { fill: "#6366f1" }
          return (
            <div key={d.metric} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.fill }} />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">{d.metric}</span>
              <span className="text-[10px] font-black ml-auto" style={{ color: meta.fill }}>{d.score}</span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp size={12} />
          Overall score is trending up
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {hasData ? `Based on your last ${Math.min(50, recentTrades!.filter(t => t.closed_at).length)} trades` : "No trades yet"}
        </span>
      </div>
    </div>
  )
}
