import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatHoldDuration } from "@/utils/tradeUtils";

interface JournalAnalyticsPanelProps {
  trades: any[];
  currSym: string;
  hidePnl: boolean;
  isDark: boolean;
}

const SURFACE_CARD =
  "bg-white dark:bg-[#17171A] rounded-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none border border-slate-200/70 dark:border-white/[0.07]";

function formatMoney(val: number, sym: string, showPlus = false): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : showPlus && val > 0 ? "+" : "";
  return `${sign}${sym}${abs.toLocaleString("en-US", {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAxisMoney(val: number, sym: string): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs === 0) return `${sym}0`;
  if (abs >= 1000) return `${sign}${sym}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${sym}${Math.round(abs)}`;
}

export const JournalAnalyticsPanel: React.FC<JournalAnalyticsPanelProps> = ({
  trades,
  currSym,
  hidePnl,
  isDark,
}) => {
  const closedTrades = useMemo(
    () =>
      (trades || [])
        .filter((t) => !!t.closed_at && !t.is_pending)
        .sort(
          (a, b) =>
            new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime()
        ),
    [trades]
  );

  // 1. Net Daily P&L Bar Series
  const dailySeries = useMemo(() => {
    const map = new Map<string, { label: string; pnl: number; count: number }>();
    closedTrades.forEach((t) => {
      const d = new Date(t.closed_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const cur = map.get(key) || {
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pnl: 0,
        count: 0,
      };
      cur.pnl = Math.round((cur.pnl + Number(t.profit || 0)) * 100) / 100;
      cur.count += 1;
      map.set(key, cur);
    });
    return Array.from(map.values()).slice(-20);
  }, [closedTrades]);

  // 2. Symbol Breakdown
  const symbolStats = useMemo(() => {
    const map = new Map<string, { symbol: string; count: number; wins: number; pnl: number }>();
    closedTrades.forEach((t) => {
      const sym = (t.symbol || "UNKNOWN").toUpperCase();
      const cur = map.get(sym) || { symbol: sym, count: 0, wins: 0, pnl: 0 };
      const p = Number(t.profit || 0);
      cur.count += 1;
      if (p > 0) cur.wins += 1;
      cur.pnl += p;
      map.set(sym, cur);
    });
    return Array.from(map.values()).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  }, [closedTrades]);

  // 3. Long vs Short Breakdown
  const sideStats = useMemo(() => {
    const init = { count: 0, wins: 0, pnl: 0 };
    const buy = { ...init };
    const sell = { ...init };
    closedTrades.forEach((t) => {
      const isBuy =
        t.trade_type === 0 ||
        String(t.trade_type || t.type || "").toUpperCase().includes("BUY");
      const target = isBuy ? buy : sell;
      const p = Number(t.profit || 0);
      target.count += 1;
      if (p > 0) target.wins += 1;
      target.pnl += p;
    });
    return { buy, sell };
  }, [closedTrades]);

  // 4. Setup / Tag Breakdown
  const setupStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; wins: number; pnl: number }>();
    closedTrades.forEach((t) => {
      const tags: string[] = Array.isArray(t.tags) && t.tags.length > 0
        ? t.tags
        : t.setup
        ? [t.setup]
        : [];
      const p = Number(t.profit || 0);
      tags.forEach((tag) => {
        const clean = String(tag).trim();
        if (!clean) return;
        const cur = map.get(clean) || { name: clean, count: 0, wins: 0, pnl: 0 };
        cur.count += 1;
        if (p > 0) cur.wins += 1;
        cur.pnl += p;
        map.set(clean, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.pnl - a.pnl).slice(0, 6);
  }, [closedTrades]);

  // 5. Extremes & Streaks
  const extremes = useMemo(() => {
    let best = 0;
    let worst = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let curWin = 0;
    let curLoss = 0;
    let totalHoldMs = 0;
    let holdCount = 0;

    closedTrades.forEach((t) => {
      const p = Number(t.profit || 0);
      if (p > best) best = p;
      if (p < worst) worst = p;
      if (p > 0) {
        curWin += 1;
        curLoss = 0;
        if (curWin > maxWinStreak) maxWinStreak = curWin;
      } else if (p < 0) {
        curLoss += 1;
        curWin = 0;
        if (curLoss > maxLossStreak) maxLossStreak = curLoss;
      }

      if (t.opened_at && t.closed_at) {
        const diff = new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime();
        if (diff > 0) {
          totalHoldMs += diff;
          holdCount += 1;
        }
      }
    });

    const avgHold =
      holdCount > 0
        ? formatHoldDuration(
            new Date(0).toISOString(),
            new Date(totalHoldMs / holdCount).toISOString()
          )
        : "—";

    return { best, worst, maxWinStreak, maxLossStreak, avgHold };
  }, [closedTrades]);

  const blurClass = hidePnl ? "blur-[5.5px] select-none opacity-80" : "";
  const maxSymbolAbs = Math.max(...symbolStats.map((s) => Math.abs(s.pnl)), 1);

  return (
    <div className="space-y-4">
      {/* 1. Net Daily P&L Bar Chart */}
      <section className={`${SURFACE_CARD} p-4 sm:p-5`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight">
              Daily P&amp;L distribution
            </h2>
            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
              Realized profit and loss grouped by trading day
            </p>
          </div>
          <span className="text-[11.5px] font-medium text-slate-400 tabular-nums">
            {dailySeries.length} day{dailySeries.length !== 1 ? "s" : ""}
          </span>
        </div>

        {dailySeries.length > 0 ? (
          <div
            className={`h-[190px] w-full transition-[filter,opacity] duration-200 ${
              hidePnl ? "blur-[6px] select-none pointer-events-none opacity-75" : ""
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
                />
                <ReferenceLine
                  y={0}
                  stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.14)"}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                  tick={{ fill: isDark ? "#71717A" : "#94A3B8", fontSize: 11, fontWeight: 500 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{
                    fill: isDark ? "#71717A" : "#94A3B8",
                    fontSize: 11,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                  tickFormatter={(v) => formatAxisMoney(v, currSym)}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const pt = payload[0].payload;
                    return (
                      <div className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#18181B] border border-slate-200 dark:border-white/10 shadow-lg text-[12px]">
                        <p className="text-[11px] text-slate-400">{pt.label}</p>
                        <p
                          className={`text-[13.5px] font-semibold tabular-nums mt-0.5 ${
                            pt.pnl >= 0
                              ? "text-[#2563EB] dark:text-blue-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatMoney(pt.pnl, currSym, true)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {pt.count} trade{pt.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]} maxBarSize={26}>
                  {dailySeries.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.pnl >= 0 ? "#2563EB" : "#E11D48"}
                      fillOpacity={0.88}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[140px] rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-center">
            <p className="text-[12px] text-slate-400">
              Daily P&amp;L bars appear once you have closed trades
            </p>
          </div>
        )}
      </section>

      {/* 2. Extremes & Streaks 4-Card Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`${SURFACE_CARD} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-400">Best trade</p>
          <p
            className={`mt-1 text-[17px] font-bold text-[#2563EB] dark:text-blue-400 tabular-nums transition-[filter,opacity] duration-200 ${blurClass}`}
          >
            {formatMoney(extremes.best, currSym, extremes.best > 0)}
          </p>
        </div>

        <div className={`${SURFACE_CARD} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-400">Worst trade</p>
          <p
            className={`mt-1 text-[17px] font-bold text-rose-600 dark:text-rose-400 tabular-nums transition-[filter,opacity] duration-200 ${blurClass}`}
          >
            {formatMoney(extremes.worst, currSym, false)}
          </p>
        </div>

        <div className={`${SURFACE_CARD} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-400">Best / worst streak</p>
          <p className="mt-1 text-[17px] font-bold text-slate-900 dark:text-white tabular-nums">
            <span>{extremes.maxWinStreak}W</span>
            <span className="text-slate-300 dark:text-neutral-600 mx-1 font-normal">/</span>
            <span className="text-slate-400">{extremes.maxLossStreak}L</span>
          </p>
        </div>

        <div className={`${SURFACE_CARD} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-400">Avg hold time</p>
          <p className="mt-1 text-[17px] font-bold text-slate-900 dark:text-white tabular-nums">
            {extremes.avgHold}
          </p>
        </div>
      </div>

      {/* 3. Two-Column Breakdown: Symbols + Long vs Short / Setups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Symbol Performance */}
        <section className={`lg:col-span-7 ${SURFACE_CARD} p-4 sm:p-5`}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight">
              Performance by symbol
            </h3>
            <span className="text-[11.5px] text-slate-400">
              {symbolStats.length} instrument{symbolStats.length !== 1 ? "s" : ""}
            </span>
          </div>

          {symbolStats.length === 0 ? (
            <p className="text-[12.5px] text-slate-400 py-8 text-center">
              Log trades to see which pairs perform best for you.
            </p>
          ) : (
            <div className="space-y-3">
              {symbolStats.slice(0, 8).map((item) => {
                const wr = item.count > 0 ? Math.round((item.wins / item.count) * 100) : 0;
                const widthPct = Math.max(8, (Math.abs(item.pnl) / maxSymbolAbs) * 100);
                return (
                  <div key={item.symbol} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.symbol}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {item.count}t · {wr}% WR
                        </span>
                      </div>
                      <span
                        className={`font-semibold tabular-nums transition-[filter,opacity] duration-200 ${blurClass} ${
                          item.pnl >= 0
                            ? "text-[#2563EB] dark:text-blue-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatMoney(item.pnl, currSym, true)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                      <div
                        style={{ width: `${widthPct}%` }}
                        className={`h-full rounded-full ${
                          item.pnl >= 0 ? "bg-[#2563EB]" : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Long vs Short + Setup Performance */}
        <div className="lg:col-span-5 space-y-4">
          <section className={`${SURFACE_CARD} p-4 sm:p-5`}>
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight mb-3">
              Long vs short
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Long (Buy)", data: sideStats.buy },
                { label: "Short (Sell)", data: sideStats.sell },
              ].map(({ label, data }) => {
                const wr = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
                return (
                  <div
                    key={label}
                    className="rounded-[14px] bg-slate-50/90 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] p-3"
                  >
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                      {label}
                    </p>
                    <p
                      className={`mt-1 text-[16px] font-bold tabular-nums transition-[filter,opacity] duration-200 ${blurClass} ${
                        data.pnl < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-[#2563EB] dark:text-blue-400"
                      }`}
                    >
                      {formatMoney(data.pnl, currSym, data.pnl !== 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
                      {data.count} trades · {wr}% win
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`${SURFACE_CARD} p-4 sm:p-5`}>
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight mb-3">
              Tagged setups
            </h3>
            {setupStats.length === 0 ? (
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Click any trade in your log to add setup tags (e.g. FVG, NY Open, Sweep) and track which playbook pays best.
              </p>
            ) : (
              <div className="space-y-2">
                {setupStats.map((st) => {
                  const wr = st.count > 0 ? Math.round((st.wins / st.count) * 100) : 0;
                  return (
                    <div
                      key={st.name}
                      className="flex items-center justify-between text-[12.5px] py-1.5 border-b border-slate-100 dark:border-white/[0.05] last:border-0"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-slate-800 dark:text-slate-100 truncate block">
                          {st.name}
                        </span>
                        <span className="text-[10.5px] text-slate-400 tabular-nums">
                          {st.count} trade{st.count !== 1 ? "s" : ""} · {wr}% WR
                        </span>
                      </div>
                      <span
                        className={`font-semibold tabular-nums shrink-0 transition-[filter,opacity] duration-200 ${blurClass} ${
                          st.pnl < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-[#2563EB] dark:text-blue-400"
                        }`}
                      >
                        {formatMoney(st.pnl, currSym, true)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default JournalAnalyticsPanel;
