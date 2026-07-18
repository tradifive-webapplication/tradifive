import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from "recharts";
import JournalCalendar from "./JournalCalendar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { useTrading } from "@/contexts/TradingContext";

const tickStyle = { fontSize: 10, fill: "#94a3b8", fontWeight: 500 as const };
const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: "12px",
  fontWeight: "600",
};

function ChartSkeleton() {
  return (
    <div className="h-full w-full flex items-end gap-3 pt-6 animate-pulse">
      {Array.from({ length: 12 }).map((_, idx) => {
        const heights = ["h-12", "h-20", "h-16", "h-28", "h-36", "h-24", "h-40", "h-48", "h-32", "h-44", "h-28", "h-20"];
        return (
          <div
            key={idx}
            className={`flex-1 ${heights[idx % heights.length]} bg-slate-200 dark:bg-white/10 rounded-t-lg`}
          />
        );
      })}
    </div>
  );
}

// --- Reusable Chart Card Wrapper ---
function ChartCard({
  title, legend, children, filter, onFilter, filters, chartHeight = 280
}: {
  title: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  filter?: string;
  onFilter?: (v: string) => void;
  filters?: string[];
  chartHeight?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-7 rounded-[22px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col h-full min-h-[408px] transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] relative dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-200 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
          {legend && <div className="mt-2">{legend}</div>}
        </div>
        {filters && (
          <div className="flex items-center bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-[#333333]">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => onFilter?.(f)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${filter === f ? "bg-white dark:bg-[#1E1E1E] dark:bg-slate-700 text-slate-900 dark:text-slate-200 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0" style={{ height: chartHeight }}>
        {children}
      </div>
    </motion.div>
  );
}

function RecentTradesCard() {
  const [tab, setTab] = useState<"recent" | "open">("recent");
  const { recentTrades, loading: dataLoading } = useDashboardData();
  const { formatMoney: fmtMoney, hideBalance, percentageOnly, isSettingsLoading } = useJournalSettings();
  const loading = dataLoading || isSettingsLoading;
  const rows = tab === "recent" ? recentTrades : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-7 rounded-[22px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col h-full min-h-[408px] transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] relative dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none"
    >
      {/* Custom Tabs */}
      <div className="flex items-center gap-8 mb-6 border-b border-slate-100 dark:border-[#333333] dark:border-white/5">
        <button
          onClick={() => setTab("recent")}
          className={`pb-2 text-[12px] font-extrabold uppercase tracking-wider transition-all relative ${tab === "recent" ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"}`}
        >
          Recent trades
          {tab === "recent" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setTab("open")}
          className={`pb-2 text-[12px] font-extrabold uppercase tracking-wider transition-all relative ${tab === "open" ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"}`}
        >
          Open positions
          {tab === "open" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scroll pr-1">
        <table className="w-full">
          <thead className="sticky top-0 bg-white dark:bg-[#1E1E1E] z-10">
            <tr className="bg-slate-50 dark:bg-white/5">
              <th className="text-center py-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider rounded-l-xl">Close Date</th>
              <th className="text-center py-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Symbol</th>
              <th className="text-right py-3 pr-4 text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider rounded-r-xl">Net P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 text-center"><div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded mx-auto" /></td>
                  <td className="py-4 text-center"><div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded mx-auto" /></td>
                  <td className="py-4 text-right pr-4"><div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded ml-auto" /></td>
                </tr>
              ))
            ) : (
              rows.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="py-4 text-center text-[12px] font-bold text-slate-600 dark:text-slate-300">
                     {t.closed_at ? (() => {
                       const parsed = new Date(t.closed_at);
                       return isNaN(parsed.getTime()) ? "Open" : parsed.toLocaleDateString();
                     })() : "Open"}
                  </td>
                  <td className="py-4 text-center text-[12px] font-bold text-slate-900 dark:text-slate-200 dark:text-white tracking-wide">{t.symbol}</td>
                  <td className={`py-4 text-right pr-4 text-[12px] font-bold tracking-tight ${t.profit >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                    {(hideBalance || percentageOnly) ? <span className="blur-[2px] select-none opacity-40">{fmtMoney(t.profit, { showSign: true, raw: true })}</span> : fmtMoney(t.profit, { showSign: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

const BlurOverlay = () => (
  <div className="absolute inset-0 z-50 bg-white/5 dark:bg-slate-900/5 rounded-[20px] pointer-events-none" />
);

export default function JournalCharts({ cardId }: { cardId?: string }) {
  const { recentTrades: rawRecentTrades, balance: rawBalance, loading: dataLoading, activeMarket } = useDashboardData();
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
  const initialBalance = isDemo ? 103240.75 : (rawBalance || 0);

  const { formatMoney: fmtMoney, hideBalance, hideOnlyBalance, percentageOnly, currency, isSettingsLoading } = useJournalSettings();
  const loading = dataLoading || isSettingsLoading;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  const dynamicTooltipStyle = useMemo(() => {
    if (isDark) {
      return {
        backgroundColor: "#1A1A1C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
        fontSize: "12px",
        fontWeight: "600",
        color: "#fff",
      };
    }
    return {
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      fontSize: "12px",
      fontWeight: "600",
      color: "#0f172a",
    };
  }, [isDark]);

  const [cumFilter, setCumFilter] = useState("All");
  const [balFilter, setBalFilter] = useState("All");
  const [ddFilter, setDdFilter] = useState("All");
  const [netFilter, setNetFilter] = useState("All");

  const hasData = recentTrades && recentTrades.length > 0;

  const getFilteredData = (data: any[], filterValue: string) => {
    if (filterValue === "All" || !data) return data;
    const limit = filterValue === "1W" ? 7 : filterValue === "1M" ? 30 : data.length;
    return data.slice(-limit);
  };

  // Dynamically calculate chart data from recentTrades
  const { cumulativePnL, netDailyPnL, accountBalance, drawdownData, scatterData } = useMemo(() => {
    if (!hasData) {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const start = {
        date: yesterday.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
        value: 0,
        balance: initialBalance || 0,
        deposits: initialBalance || 0
      };
      const end = {
        date: today.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
        value: 0,
        balance: initialBalance || 0,
        deposits: initialBalance || 0
      };
      const flat = [start, end];
      return { 
        cumulativePnL: flat, 
        netDailyPnL: flat, 
        accountBalance: flat, 
        drawdownData: flat, 
        scatterData: { profit: [{ dur: 0, pnl: 0 }], loss: [] } 
      };
    }

    const closedTrades = recentTrades.filter(t => t.closed_at && !t.is_pending);
    const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime());
    
    const totalProfit = sortedTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
    const depositAmount = initialBalance - totalProfit; // Dynamically calculate actual initial deposit

    let cum = 0;
    let runningBalance = depositAmount;
    let maxEquity = depositAmount;
    const cPnL: any[] = [];
    const nDPnL: any[] = [];
    const aBal: any[] = [];
    const dData: any[] = [];
    const sData: { profit: any[], loss: any[] } = { profit: [], loss: [] };

    // Group daily to avoid duplicate X-axis dates
    const dailyMap = new Map<string, { profit: number; dateObject: Date }>();

    sortedTrades.forEach((t) => {
      const dateVal = t.closed_at || t.created_at;
      if (!dateVal) return;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return;
      const dateStr = d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
      const current = dailyMap.get(dateStr) || { profit: 0, dateObject: d };
      current.profit += t.profit;
      dailyMap.set(dateStr, current);

      // Populate Scatter Data individually (scatter chart is fine with individual points)
      let durationSec = Math.floor(Math.random() * 120) + 10;
      if (t.opened_at && t.closed_at) {
        durationSec = Math.max(1, Math.round((new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime()) / 1000));
      }
      if (t.profit >= 0) {
        sData.profit.push({ dur: durationSec, pnl: t.profit });
      } else {
        sData.loss.push({ dur: durationSec, pnl: t.profit });
      }
    });

    // Convert daily map back to sorted array by date
    const dailyList = Array.from(dailyMap.entries()).map(([dateStr, info]) => ({
      dateStr,
      profit: info.profit,
      time: info.dateObject.getTime()
    })).sort((a, b) => a.time - b.time);

    // Prepend the initial starting/deposit baseline point so curves start correctly at the deposit amount ($500.00)
    if (dailyList.length > 0) {
      const firstTime = dailyList[0].time;
      const prevDate = new Date(firstTime - 24 * 60 * 60 * 1000);
      const prevDateStr = !isNaN(prevDate.getTime()) 
        ? prevDate.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })
        : "Start";
      
      cPnL.push({ date: prevDateStr, value: 0 });
      aBal.push({ date: prevDateStr, balance: depositAmount, deposits: depositAmount });
      dData.push({ date: prevDateStr, value: 0 });
    }

    dailyList.forEach((item) => {
      cum += item.profit;
      cPnL.push({ date: item.dateStr, value: cum });
      nDPnL.push({ date: item.dateStr, value: item.profit });

      runningBalance += item.profit;
      aBal.push({ date: item.dateStr, balance: runningBalance, deposits: depositAmount });
      
      if (runningBalance > maxEquity) maxEquity = runningBalance;
      const dd = runningBalance - maxEquity;
      dData.push({ date: item.dateStr, value: dd });
    });

    return { cumulativePnL: cPnL, netDailyPnL: nDPnL, accountBalance: aBal, drawdownData: dData, scatterData: sData };
  }, [recentTrades, initialBalance, hasData]);

  if (cardId === "calendar") return <JournalCalendar loading={loading} />;
  if (cardId === "trades") return <RecentTradesCard />;

  if (cardId === "cumulative-pnl") {
    const filteredData = getFilteredData(cumulativePnL, cumFilter);
    const isPositive = filteredData.length > 0 && filteredData[filteredData.length - 1].value >= 0;
    const chartColor = isPositive ? "#10B981" : "#F06363";
    return (
      <ChartCard title="Daily Net Cumulative P&L" legend={<div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: chartColor }} />Cumulative P&L</div>} filter={cumFilter} onFilter={setCumFilter} filters={["1W", "1M", "All"]}>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <>
            {!hasData && <BlurOverlay />}
            <ResponsiveContainer width="100%" height="100%" className="group focus:outline-none focus-visible:outline-none">
              <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                <defs><linearGradient id="cumPnlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColor} stopOpacity={0.2} /><stop offset="95%" stopColor={chartColor} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.02)" : "#e2e8f0"} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" /><XAxis dataKey="date" tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} />
                <YAxis width={72} tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtMoney(v, { raw: true })} />
                <Tooltip 
                  contentStyle={dynamicTooltipStyle} 
                  itemStyle={{ color: isDark ? "#fff" : "#0f172a" }}
                  labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                  formatter={(value: any) => {
                    const val = Number(value);
                    return [(hideBalance || percentageOnly) ? <span className="blur-[4px] select-none opacity-40">{fmtMoney(val, { showSign: true, raw: true })}</span> : fmtMoney(val, { showSign: true }), "Cumulative P&L"];
                  }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" /><Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2.5} fill="url(#cumPnlGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </ChartCard>
    );
  }
  if (cardId === "net-daily-pnl") {
    const filteredData = getFilteredData(netDailyPnL, netFilter);
    return (
      <ChartCard title="Net Daily P&L" legend={<div className="flex items-center gap-3"><div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#10B981' }} />Profit</div><div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#F06363' }} />Loss</div></div>} filter={netFilter} onFilter={setNetFilter} filters={["1W", "1M", "All"]}>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <>
            {!hasData && <BlurOverlay />}
            <ResponsiveContainer width="100%" height="100%" className="group focus:outline-none focus-visible:outline-none">
              <BarChart data={filteredData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "transparent" : "#e2e8f0"} fill="transparent" fillOpacity={0} horizontalFill={[]} verticalFill={[]} className={isDark ? "" : "opacity-0 group-hover:opacity-100 transition-opacity duration-300"} /><XAxis dataKey="date" tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} />
                <YAxis width={72} tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtMoney(v, { raw: true })} />
                <Tooltip 
                  cursor={isDark ? { fill: 'transparent' } : undefined}
                  contentStyle={dynamicTooltipStyle} 
                  itemStyle={{ color: isDark ? "#fff" : "#0f172a" }}
                  labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                  formatter={(value: any) => {
                    const val = Number(value);
                    return [(hideBalance || percentageOnly) ? <span className="blur-[4px] select-none opacity-40">{fmtMoney(val, { showSign: true, raw: true })}</span> : fmtMoney(val, { showSign: true }), "Daily P&L"];
                  }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" /><Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={24}>{filteredData.map((d, i) => <Cell key={i} fill={d.value >= 0 ? "#10B981" : "#F06363"} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </ChartCard>
    );
  }
  if (cardId === "account-balance") {
    const filteredData = getFilteredData(accountBalance, balFilter);
    return (
      <ChartCard title="Account Balance" legend={<div className="flex items-center gap-4"><div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#10B981' }} />Balance</div><div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />Deposits</div></div>} filter={balFilter} onFilter={setBalFilter} filters={["1W", "1M", "All"]}>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <>
            {!hasData && <BlurOverlay />}
            <ResponsiveContainer width="100%" height="100%" className="group focus:outline-none focus-visible:outline-none">
              <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                <defs><linearGradient id="balGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient><linearGradient id="depGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.02)" : "#e2e8f0"} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" /><XAxis dataKey="date" tick={{ ...tickStyle, filter: (hideBalance || hideOnlyBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || hideOnlyBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} /><YAxis width={72} tick={{ ...tickStyle, filter: (hideBalance || hideOnlyBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || hideOnlyBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtMoney(v, { raw: true })} />
                <Tooltip 
                  contentStyle={dynamicTooltipStyle} 
                  itemStyle={{ color: isDark ? "#fff" : "#0f172a" }}
                  labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                  formatter={(value: any, name: string) => {
                    const val = Number(value);
                    const displayName = name === "balance" ? "Account Balance" : "Total Deposits";
                    return [(hideBalance || hideOnlyBalance || percentageOnly) ? <span className="blur-[4px] select-none opacity-40">{fmtMoney(val, { raw: true })}</span> : fmtMoney(val), displayName];
                  }}
                />
                <Area type="monotone" dataKey="deposits" stroke="#10B981" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#depGrad2)" dot={false} /><Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} fill="url(#balGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </ChartCard>
    );
  }
  if (cardId === "drawdown") {
    const chartColor = "#F06363";
    const filteredData = getFilteredData(drawdownData, ddFilter);
    return (
      <ChartCard title="Drawdown" legend={<div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className="w-2.5 h-2.5 rounded-full shadow-sm shadow-[#F06363]/20" style={{ backgroundColor: chartColor }} />Max Drawdown Curve</div>} filter={ddFilter} onFilter={setDdFilter} filters={["1W", "1M", "All"]} chartHeight={280}>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <>
            {!hasData && <BlurOverlay />}
            <ResponsiveContainer width="100%" height="100%" className="group focus:outline-none focus-visible:outline-none">
              <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                <defs><linearGradient id="ddGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColor} stopOpacity={0.25} /><stop offset="95%" stopColor={chartColor} stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.02)" : "#e2e8f0"} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" /><XAxis dataKey="date" tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} /><YAxis width={72} tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtMoney(v, { raw: true })} />
                <Tooltip 
                  contentStyle={dynamicTooltipStyle} 
                  itemStyle={{ color: isDark ? "#fff" : "#0f172a" }}
                  labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                  formatter={(value: any) => {
                    const val = Number(value);
                    return [(hideBalance || percentageOnly) ? <span className="blur-[4px] select-none opacity-40">{fmtMoney(val, { raw: true })}</span> : fmtMoney(val), "Drawdown"];
                  }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" /><Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2.5} fill="url(#ddGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </ChartCard>
    );
  }
  if (cardId === "trade-duration") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-7 rounded-[22px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col h-full min-h-[408px] transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] relative dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none"
      >
        {loading ? (
          <>
            <div className="mb-8">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-200 dark:text-white leading-tight">Trade Duration Performance</h3>
            </div>
            <ChartSkeleton />
          </>
        ) : (
          <>
            {!hasData && <BlurOverlay />}
            <div className="mb-8">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-200 dark:text-white leading-tight">Trade Duration Performance</h3>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-tight">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#10B981' }} /> Profit
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-tight">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#F06363' }} /> Loss
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%" className="group focus:outline-none focus-visible:outline-none">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.02)" : "#e2e8f0"} vertical={false} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <XAxis 
                    dataKey="dur" 
                    type="number" 
                    tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => v < 60 ? `${v}s` : `${Math.floor(v / 60)}m`}
                  />
                  <YAxis width={72} 
                    dataKey="pnl" 
                    type="number" 
                    tick={{ ...tickStyle, filter: (hideBalance || percentageOnly) ? 'blur(3.5px)' : 'none', opacity: (hideBalance || percentageOnly) ? 0.3 : 1 }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => fmtMoney(v, { raw: true })}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={dynamicTooltipStyle} 
                    itemStyle={{ color: isDark ? "#fff" : "#0f172a" }}
                    labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                    formatter={(value: any, name: string) => {
                      if (name === "pnl") {
                        const val = Number(value);
                        return [(hideBalance || percentageOnly) ? <span className="blur-[4px] select-none opacity-40">{fmtMoney(val, { showSign: true, raw: true })}</span> : fmtMoney(val, { showSign: true }), "Trade P&L"];
                      }
                      if (name === "dur") {
                        const val = Number(value);
                        return [val < 60 ? `${val}s` : `${Math.floor(val / 60)}m ${val % 60}s`, "Duration"];
                      }
                      return [value, name];
                    }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" />
                  <Scatter data={scatterData.profit} fill="#10B981" opacity={0.8} r={6} />
                  <Scatter data={scatterData.loss} fill="#F06363" opacity={0.8} r={6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  return null;
}






