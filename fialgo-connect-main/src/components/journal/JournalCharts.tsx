import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import JournalCalendar from "./JournalCalendar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";

const CARD_SURFACE =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

const tickStyle = { fontSize: 10, fill: "#94a3b8", fontWeight: 500 as const };

function ChartSkeleton() {
  return (
    <div className="h-full w-full flex items-end gap-2.5 pt-6 animate-pulse">
      {Array.from({ length: 12 }).map((_, idx) => {
        const heights = [
          "h-12",
          "h-20",
          "h-16",
          "h-28",
          "h-36",
          "h-24",
          "h-40",
          "h-44",
          "h-32",
          "h-36",
          "h-28",
          "h-20",
        ];
        return (
          <div
            key={idx}
            className={`flex-1 ${heights[idx % heights.length]} bg-slate-100 dark:bg-white/[0.06] rounded-t-lg`}
          />
        );
      })}
    </div>
  );
}

function ChartCard({
  title,
  legend,
  children,
  footer,
  filter,
  onFilter,
  filters,
  chartHeight = 250,
  frameless = false,
}: {
  title: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  filter?: string;
  onFilter?: (v: string) => void;
  filters?: string[];
  chartHeight?: number;
  frameless?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={
        frameless
          ? "flex flex-col h-full relative px-0.5 pt-0.5 pb-1"
          : `${CARD_SURFACE} p-4 sm:p-5 flex flex-col h-full min-h-[340px] sm:min-h-[370px] relative`
      }
    >
      <div
        className={`flex items-start justify-between gap-2 ${
          frameless ? "mb-3 min-h-[42px]" : "mb-4"
        }`}
      >
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h3>
          {legend && <div className="mt-1">{legend}</div>}
        </div>
        {filters && (
          <div
            className={`inline-flex items-center p-0.5 rounded-[9px] shrink-0 ${
              frameless
                ? "bg-slate-200/70 dark:bg-white/[0.07]"
                : "bg-slate-100/90 dark:bg-white/[0.06]"
            }`}
          >
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFilter?.(f)}
                className={`px-2.5 py-1 rounded-[7px] text-[10.5px] font-semibold transition-all cursor-pointer ${
                  filter === f
                    ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        className={`w-full relative flex-1 flex flex-col min-h-0 ${frameless ? "" : "min-h-[240px]"}`}
        style={frameless ? { minHeight: chartHeight } : { height: chartHeight, minHeight: chartHeight }}
      >
        {children}
      </div>
      {footer}
    </motion.div>
  );
}

function RecentTradesCard({
  demoData,
}: {
  demoData?: { allTrades: any[]; balance: number } | null;
}) {
  const [tab, setTab] = useState<"recent" | "open">("recent");
  const { recentTrades: rawRecentTrades, loading: dataLoading } = useDashboardData();
  const recentTrades = demoData ? demoData.allTrades : rawRecentTrades || [];
  const { formatMoney: fmtMoney, hideBalance, percentageOnly, isSettingsLoading } =
    useJournalSettings();
  const loading = demoData ? isSettingsLoading : dataLoading || isSettingsLoading;
  const rows =
    tab === "recent"
      ? (recentTrades || []).filter((t: any) => !!t.closed_at)
      : (recentTrades || []).filter((t: any) => !t.closed_at && !t.is_pending);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${CARD_SURFACE} p-4 sm:p-5 flex flex-col h-full min-h-[340px] sm:min-h-[370px] relative`}
    >
      <div className="flex items-center gap-6 mb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setTab("recent")}
          className={`pb-2 text-[12px] font-semibold transition-all relative cursor-pointer ${
            tab === "recent"
              ? "text-slate-900 dark:text-white"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Recent trades
          {tab === "recent" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-[#2563EB]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("open")}
          className={`pb-2 text-[12px] font-semibold transition-all relative cursor-pointer ${
            tab === "open"
              ? "text-slate-900 dark:text-white"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Open positions
          {tab === "open" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-[#2563EB]" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 amazing-scrollbar pr-1">
        <table className="w-full">
          <thead className="sticky top-0 bg-white dark:bg-[#17171A] z-10">
            <tr className="bg-slate-50 dark:bg-white/[0.04]">
              <th className="text-center py-2.5 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider rounded-l-lg">
                Close Date
              </th>
              <th className="text-center py-2.5 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="text-right py-2.5 pr-3 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider rounded-r-lg">
                Net P&amp;L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 text-center">
                    <div className="h-3.5 w-16 bg-slate-100 dark:bg-white/10 rounded mx-auto" />
                  </td>
                  <td className="py-3 text-center">
                    <div className="h-3.5 w-14 bg-slate-100 dark:bg-white/10 rounded mx-auto" />
                  </td>
                  <td className="py-3 text-right pr-3">
                    <div className="h-3.5 w-14 bg-slate-100 dark:bg-white/10 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-[12px] text-slate-400">
                  No trades yet
                </td>
              </tr>
            ) : (
              rows.map((t: any, i: number) => (
                <tr
                  key={t.id || i}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 text-center text-[11.5px] font-medium text-slate-500 dark:text-neutral-400 tabular-nums">
                    {t.closed_at
                      ? (() => {
                          const parsed = new Date(t.closed_at);
                          return isNaN(parsed.getTime())
                            ? "Open"
                            : parsed.toLocaleDateString();
                        })()
                      : "Open"}
                  </td>
                  <td className="py-3 text-center text-[12px] font-semibold text-slate-900 dark:text-white">
                    {t.symbol}
                  </td>
                  <td
                    className={`py-3 text-right pr-3 text-[12px] font-semibold tabular-nums ${
                      Number(t.profit || 0) >= 0
                        ? "text-[#2563EB] dark:text-blue-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {hideBalance || percentageOnly ? (
                      <span className="blur-[5px] select-none opacity-60">
                        {fmtMoney(t.profit, { showSign: true, raw: true })}
                      </span>
                    ) : (
                      fmtMoney(t.profit, { showSign: true })
                    )}
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

const EmptyChartHint = ({ message }: { message: string }) => (
  <div className="h-full min-h-[240px] rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.015] flex flex-col items-center justify-center text-center px-4">
    <p className="text-[12px] text-slate-400">{message}</p>
  </div>
);

export default function JournalCharts({
  cardId,
  demoData,
  frameless = false,
}: {
  cardId?: string;
  demoData?: { allTrades: any[]; balance: number } | null;
  frameless?: boolean;
}) {
  const {
    recentTrades: rawRecentTrades,
    balance: rawBalance,
    loading: dataLoading,
  } = useDashboardData();

  const recentTrades = demoData ? demoData.allTrades : rawRecentTrades || [];
  const initialBalance = demoData ? demoData.balance : rawBalance || 0;

  const {
    formatMoney: fmtMoney,
    hideBalance,
    hideOnlyBalance,
    percentageOnly,
    isSettingsLoading,
  } = useJournalSettings();
  const loading = demoData ? isSettingsLoading : dataLoading || isSettingsLoading;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const dynamicTooltipStyle = useMemo(() => {
    if (isDark) {
      return {
        backgroundColor: "#141417",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
        fontSize: "12px",
        fontWeight: "600",
        color: "#fff",
      };
    }
    return {
      backgroundColor: "#0f172a",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      boxShadow: "0 10px 20px -5px rgba(15,23,42,0.22)",
      fontSize: "12px",
      fontWeight: "600",
      color: "#fff",
    };
  }, [isDark]);

  const [cumFilter, setCumFilter] = useState("All");
  const [balFilter, setBalFilter] = useState("All");
  const [ddFilter, setDdFilter] = useState("All");
  const [netFilter, setNetFilter] = useState("All");

  const closedTradesList = useMemo(
    () => recentTrades.filter((t: any) => !!t.closed_at && !t.is_pending),
    [recentTrades]
  );
  const hasData = closedTradesList.length > 0;

  const getFilteredData = (data: any[], filterValue: string) => {
    if (filterValue === "All" || !data) return data;
    const limit = filterValue === "1W" ? 7 : filterValue === "1M" ? 30 : data.length;
    return data.slice(-limit);
  };

  const { cumulativePnL, netDailyPnL, accountBalance, drawdownData, scatterData } =
    useMemo(() => {
      if (!hasData) {
        return {
          cumulativePnL: [],
          netDailyPnL: [],
          accountBalance: [],
          drawdownData: [],
          scatterData: { profit: [], loss: [] },
        };
      }

      const sortedTrades = [...closedTradesList].sort(
        (a: any, b: any) =>
          new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime()
      );

      const totalProfit = sortedTrades.reduce(
        (acc: number, t: any) => acc + Number(t.profit || 0),
        0
      );
      const depositAmount = initialBalance - totalProfit;

      let cum = 0;
      let runningBalance = depositAmount;
      let maxEquity = depositAmount;
      const cPnL: any[] = [];
      const nDPnL: any[] = [];
      const aBal: any[] = [];
      const dData: any[] = [];
      const sData: { profit: any[]; loss: any[] } = { profit: [], loss: [] };

      const dailyMap = new Map<string, { profit: number; dateObject: Date }>();

      sortedTrades.forEach((t: any) => {
        const dateVal = t.closed_at || t.created_at;
        if (!dateVal) return;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return;
        const dateStr = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const current = dailyMap.get(dateStr) || { profit: 0, dateObject: d };
        current.profit += Number(t.profit || 0);
        dailyMap.set(dateStr, current);

        let durationSec = 60;
        if (t.opened_at && t.closed_at) {
          durationSec = Math.max(
            1,
            Math.round(
              (new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime()) / 1000
            )
          );
        }
        if (Number(t.profit || 0) >= 0) {
          sData.profit.push({ dur: durationSec, pnl: Number(t.profit || 0) });
        } else {
          sData.loss.push({ dur: durationSec, pnl: Number(t.profit || 0) });
        }
      });

      const dailyList = Array.from(dailyMap.entries())
        .map(([dateStr, info]) => ({
          dateStr,
          profit: info.profit,
          time: info.dateObject.getTime(),
        }))
        .sort((a, b) => a.time - b.time);

      if (dailyList.length > 0) {
        const firstTime = dailyList[0].time;
        const prevDate = new Date(firstTime - 24 * 60 * 60 * 1000);
        const prevDateStr = !isNaN(prevDate.getTime())
          ? prevDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Start";

        cPnL.push({ date: prevDateStr, value: 0 });
        aBal.push({
          date: prevDateStr,
          balance: depositAmount,
          deposits: depositAmount,
        });
        dData.push({ date: prevDateStr, value: 0 });
      }

      dailyList.forEach((item) => {
        cum += item.profit;
        cPnL.push({ date: item.dateStr, value: cum });
        nDPnL.push({ date: item.dateStr, value: item.profit });

        runningBalance += item.profit;
        aBal.push({
          date: item.dateStr,
          balance: runningBalance,
          deposits: depositAmount,
        });

        if (runningBalance > maxEquity) maxEquity = runningBalance;
        const dd = runningBalance - maxEquity;
        dData.push({ date: item.dateStr, value: dd });
      });

      return {
        cumulativePnL: cPnL,
        netDailyPnL: nDPnL,
        accountBalance: aBal,
        drawdownData: dData,
        scatterData: sData,
      };
    }, [closedTradesList, initialBalance, hasData]);

  if (cardId === "calendar")
    return <JournalCalendar loading={demoData ? false : loading} demoData={demoData} />;
  if (cardId === "trades") return <RecentTradesCard demoData={demoData} />;

  if (cardId === "cumulative-pnl") {
    const filteredData = getFilteredData(cumulativePnL, cumFilter);
    const isPositive =
      filteredData.length === 0 ||
      filteredData[filteredData.length - 1].value >= 0;
    const chartColor = isPositive ? "#2563EB" : "#E11D48";
    return (
      <ChartCard
        title="Daily Net Cumulative P&L"
        legend={
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: chartColor }}
            />
            Cumulative P&amp;L
          </div>
        }
        filter={cumFilter}
        onFilter={setCumFilter}
        filters={["1W", "1M", "All"]}
      >
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <EmptyChartHint message="Plots live after your first closed trade." />
        ) : (
          <div
            className={`h-[250px] w-full transition-[filter,opacity] duration-200 ${
              hideBalance || percentageOnly
                ? "blur-[6px] select-none pointer-events-none opacity-75"
                : ""
            }`}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={filteredData}
                margin={{ top: 6, right: 8, left: -6, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tfCumPnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                />
                <XAxis
                  dataKey="date"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={22}
                />
                <YAxis
                  width={62}
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtMoney(v, { raw: true })}
                />
                <Tooltip
                  contentStyle={dynamicTooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  formatter={(value: any) => [
                    fmtMoney(Number(value), { showSign: true, raw: true }),
                    "Cumulative P&L",
                  ]}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}
                  strokeDasharray="3 3"
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#tfCumPnlGrad)"
                  isAnimationActive={true}
                  animationBegin={90}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    );
  }

  if (cardId === "net-daily-pnl") {
    const filteredData = getFilteredData(netDailyPnL, netFilter);
    return (
      <ChartCard
        title="Net Daily P&L"
        legend={
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              Profit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Loss
            </span>
          </div>
        }
        filter={netFilter}
        onFilter={setNetFilter}
        filters={["1W", "1M", "All"]}
      >
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <EmptyChartHint message="Daily P&L bars populate once trades close." />
        ) : (
          <div
            className={`h-[250px] w-full transition-[filter,opacity] duration-200 ${
              hideBalance || percentageOnly
                ? "blur-[6px] select-none pointer-events-none opacity-75"
                : ""
            }`}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={filteredData}
                margin={{ top: 6, right: 8, left: -6, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                />
                <XAxis
                  dataKey="date"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={22}
                />
                <YAxis
                  width={62}
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtMoney(v, { raw: true })}
                />
                <Tooltip
                  cursor={{
                    fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
                  }}
                  contentStyle={dynamicTooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  formatter={(value: any) => [
                    fmtMoney(Number(value), { showSign: true, raw: true }),
                    "Daily P&L",
                  ]}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}
                  strokeDasharray="3 3"
                />
                <Bar
                  dataKey="value"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={true}
                  animationBegin={110}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {filteredData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.value >= 0 ? "#2563EB" : "#E11D48"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    );
  }

  if (cardId === "account-balance") {
    const filteredData = getFilteredData(accountBalance, balFilter);
    const balValues = filteredData.flatMap((d) => [
      Number(d.balance || 0),
      Number(d.deposits || 0),
    ]);
    const minVal = balValues.length ? Math.min(...balValues) : 0;
    const maxVal = balValues.length ? Math.max(...balValues) : 1000;
    const span = Math.max(maxVal - minVal, Math.abs(maxVal) * 0.04, 100);
    const pad = span * 0.22;
    const niceStep = (() => {
      const rough = (span + pad * 2) / 4;
      const mag = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1))));
      const norm = rough / mag;
      return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
    })();
    const domainMin = Math.max(0, Math.floor((minVal - pad) / niceStep) * niceStep);
    const domainMax = Math.ceil((maxVal + pad) / niceStep) * niceStep;

    const firstDeposit = filteredData.length > 0 ? Number(filteredData[0].deposits || 0) : 0;
    const latestBalance =
      filteredData.length > 0 ? Number(filteredData[filteredData.length - 1].balance || 0) : 0;
    const pctChange =
      firstDeposit > 0 ? ((latestBalance - firstDeposit) / firstDeposit) * 100 : 0;

    const formatCompactAxis = (v: number) => {
      const sample = fmtMoney(0, { raw: true });
      const symMatch = sample.match(/^[^0-9-]+/);
      const sym = symMatch ? symMatch[0] : "$";
      const abs = Math.abs(v);
      const sign = v < 0 ? "-" : "";
      if (abs >= 1000) {
        const k = abs / 1000;
        return `${sign}${sym}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
      }
      return `${sign}${sym}${Math.round(abs)}`;
    };

    return (
      <ChartCard
        title="Account Balance"
        frameless={frameless}
        chartHeight={frameless ? 235 : 250}
        legend={
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              Balance
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Deposits
            </span>
          </div>
        }
        filter={balFilter}
        onFilter={setBalFilter}
        filters={["1W", "1M", "All"]}
        footer={
          frameless ? (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] tabular-nums">
              <span className="text-slate-400 font-medium">
                Start{" "}
                <span className="text-slate-600 dark:text-neutral-300 font-semibold">
                  {hasData ? fmtMoney(firstDeposit, { raw: true }) : "—"}
                </span>
              </span>
              <span
                className={`font-semibold ${
                  pctChange >= 0
                    ? "text-[#2563EB] dark:text-blue-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {hasData
                  ? `${fmtMoney(latestBalance, { raw: true })} (${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%)`
                  : "No trades yet"}
              </span>
            </div>
          ) : undefined
        }
      >
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <EmptyChartHint message="Tracks your balance vs. initial deposits." />
        ) : (
          <div
            className={`${frameless ? "min-h-[235px] h-[235px] lg:h-auto flex-1 flex flex-col" : "h-[250px]"} w-full transition-[filter,opacity] duration-200 ${
              hideBalance || hideOnlyBalance || percentageOnly
                ? "blur-[6px] select-none pointer-events-none opacity-75"
                : ""
            }`}
          >
            <ResponsiveContainer width="100%" height={frameless ? "100%" : 250} minHeight={frameless ? 235 : 250}>
              <AreaChart
                data={filteredData}
                margin={{ top: 8, right: 8, left: -12, bottom: 2 }}
              >
                <defs>
                  <linearGradient id="tfBalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "#eef2f6"}
                />
                <XAxis
                  dataKey="date"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={26}
                  dy={4}
                />
                <YAxis
                  width={52}
                  domain={[domainMin, domainMax]}
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompactAxis}
                />
                <Tooltip
                  contentStyle={dynamicTooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  formatter={(value: any, name: string) => [
                    fmtMoney(Number(value), { raw: true }),
                    name === "balance" ? "Account Balance" : "Total Deposits",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="deposits"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                  isAnimationActive={true}
                  animationBegin={100}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#tfBalGrad)"
                  isAnimationActive={true}
                  animationBegin={140}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    );
  }

  if (cardId === "drawdown") {
    const chartColor = "#E11D48";
    const filteredData = getFilteredData(drawdownData, ddFilter);
    return (
      <ChartCard
        title="Drawdown"
        legend={
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: chartColor }}
            />
            Max Drawdown Curve
          </div>
        }
        filter={ddFilter}
        onFilter={setDdFilter}
        filters={["1W", "1M", "All"]}
      >
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <EmptyChartHint message="Measures peak-to-trough equity drawdown." />
        ) : (
          <div
            className={`h-[250px] w-full transition-[filter,opacity] duration-200 ${
              hideBalance || percentageOnly
                ? "blur-[6px] select-none pointer-events-none opacity-75"
                : ""
            }`}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={filteredData}
                margin={{ top: 6, right: 8, left: -6, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tfDdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                />
                <XAxis
                  dataKey="date"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={22}
                />
                <YAxis
                  width={62}
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtMoney(v, { raw: true })}
                />
                <Tooltip
                  contentStyle={dynamicTooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  formatter={(value: any) => [
                    fmtMoney(Number(value), { raw: true }),
                    "Drawdown",
                  ]}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}
                  strokeDasharray="3 3"
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#tfDdGrad)"
                  isAnimationActive={true}
                  animationBegin={120}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    );
  }

  if (cardId === "trade-duration") {
    return (
      <ChartCard
        title="Trade Duration Performance"
        legend={
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              Profit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Loss
            </span>
          </div>
        }
      >
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <EmptyChartHint message="Compare trade hold time against P&L." />
        ) : (
          <div
            className={`h-[250px] w-full transition-[filter,opacity] duration-200 ${
              hideBalance || percentageOnly
                ? "blur-[6px] select-none pointer-events-none opacity-75"
                : ""
            }`}
          >
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 10, right: 10, left: -6, bottom: 0 }}>
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                />
                <XAxis
                  dataKey="dur"
                  type="number"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v < 60
                      ? `${v}s`
                      : v < 3600
                      ? `${Math.floor(v / 60)}m`
                      : `${(v / 3600).toFixed(1)}h`
                  }
                />
                <YAxis
                  width={62}
                  dataKey="pnl"
                  type="number"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtMoney(v, { raw: true })}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={dynamicTooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  formatter={(value: any, name: string) => {
                    if (name === "pnl") {
                      return [
                        fmtMoney(Number(value), { showSign: true, raw: true }),
                        "Trade P&L",
                      ];
                    }
                    if (name === "dur") {
                      const val = Number(value);
                      return [
                        val < 60
                          ? `${val}s`
                          : `${Math.floor(val / 60)}m ${val % 60}s`,
                        "Duration",
                      ];
                    }
                    return [value, name];
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}
                  strokeDasharray="4 4"
                />
                <Scatter
                  data={scatterData.profit}
                  fill="#2563EB"
                  opacity={0.85}
                  isAnimationActive={true}
                  animationBegin={110}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
                <Scatter
                  data={scatterData.loss}
                  fill="#E11D48"
                  opacity={0.85}
                  isAnimationActive={true}
                  animationBegin={150}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    );
  }

  return null;
}
