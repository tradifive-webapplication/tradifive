import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Layers } from "lucide-react";

export interface ProfileTradeItem {
  id: string;
  ticket?: string | number;
  symbol?: string;
  trade_type?: number | string;
  type?: string;
  direction?: string;
  lot_size?: number;
  lots?: number;
  profit?: number;
  closed_at?: string;
  open_time?: string;
  created_at?: string;
}

interface ProfileTradesLedgerProps {
  trades: ProfileTradeItem[];
  isOwnProfile?: boolean;
  currencySymbol?: string;
}

export const ProfileTradesLedger: React.FC<ProfileTradesLedgerProps> = ({
  trades,
  isOwnProfile = false,
  currencySymbol = "$",
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all");
  const [query, setQuery] = useState("");

  const sortedTrades = useMemo(() => {
    const list = Array.isArray(trades) ? [...trades] : [];
    return list.sort((a, b) => {
      const da = new Date(a.closed_at || a.open_time || a.created_at || 0).getTime();
      const db = new Date(b.closed_at || b.open_time || b.created_at || 0).getTime();
      return db - da;
    });
  }, [trades]);

  const stats = useMemo(() => {
    let netPnl = 0;
    let wins = 0;
    let losses = 0;
    let totalLots = 0;
    for (const t of sortedTrades) {
      const p = Number(t.profit) || 0;
      netPnl += p;
      if (p > 0) wins++;
      else if (p < 0) losses++;
      totalLots += Number(t.lot_size ?? t.lots ?? 0) || 0;
    }
    return { netPnl, wins, losses, totalLots };
  }, [sortedTrades]);

  const filteredTrades = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedTrades.filter((t) => {
      const p = Number(t.profit) || 0;
      if (filter === "wins" && p <= 0) return false;
      if (filter === "losses" && p >= 0) return false;
      if (q && !String(t.symbol || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sortedTrades, filter, query]);

  const isBuyTrade = (t: ProfileTradeItem) => {
    if (typeof t.trade_type === "number") return t.trade_type === 0;
    const raw = String(t.trade_type ?? t.type ?? t.direction ?? "").toUpperCase();
    return raw === "0" || raw.includes("BUY") || raw.includes("LONG");
  };

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
            Execution Ledger
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 text-[11px] font-semibold tabular-nums">
            {sortedTrades.length} {sortedTrades.length === 1 ? "trade" : "trades"}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] text-[11px] font-medium text-slate-600 dark:text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Verified Sync
        </span>
      </div>

      {/* Compact 3-Stat Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
            Net P&amp;L
          </span>
          <span
            className={`text-[14px] sm:text-[15px] font-bold tabular-nums mt-0.5 block truncate ${
              stats.netPnl > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : stats.netPnl < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {stats.netPnl >= 0 ? "+" : "-"}
            {currencySymbol}
            {Math.abs(stats.netPnl).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
            Win / Loss
          </span>
          <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block truncate">
            <span className="text-emerald-600 dark:text-emerald-400">{stats.wins}W</span>
            <span className="text-slate-300 dark:text-zinc-600 mx-1">/</span>
            <span className="text-rose-600 dark:text-rose-400">{stats.losses}L</span>
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
            Volume
          </span>
          <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block truncate">
            {stats.totalLots.toFixed(2)} lots
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar — Always fits inside card without overflow */}
      {sortedTrades.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] self-start">
            {(
              [
                { id: "all", label: "All" },
                { id: "wins", label: "Wins" },
                { id: "losses", label: "Losses" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-white dark:bg-[#242428] text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter symbol..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-[12px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-400 dark:focus:border-white/25 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Trades List or Clean Empty State */}
      {sortedTrades.length === 0 ? (
        <div className="py-10 px-5 text-center rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Layers size={18} strokeWidth={1.8} />
          </div>
          <p className="text-[13.5px] font-semibold text-slate-800 dark:text-white">
            No closed trades synced yet
          </p>
          <p className="text-[12px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
            {isOwnProfile
              ? "Connect your MT5 broker or log trades in Smart Journal to showcase verified executions on your profile."
              : "This trader hasn't synced any public executions yet."}
          </p>
          {isOwnProfile && (
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/journal")}
                className="px-4 h-8 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[12px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <span>Open Smart Journal</span>
                <ArrowUpRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/settings?tab=trading")}
                className="px-4 h-8 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.1] text-[12px] font-semibold transition-all cursor-pointer active:scale-95"
              >
                Connect Broker
              </button>
            </div>
          )}
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="py-10 px-5 text-center rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06]">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-zinc-300">
            No matching trades
          </p>
          <p className="text-[11.5px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Try clearing the symbol filter or switching tabs.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden bg-white dark:bg-[#17171A]">
          {filteredTrades.slice(0, 50).map((trade) => {
            const profit = Number(trade.profit) || 0;
            const isWin = profit >= 0;
            const buy = isBuyTrade(trade);
            const lots = Number(trade.lot_size ?? trade.lots ?? 0);
            const dateStr = trade.closed_at || trade.open_time || trade.created_at;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—";

            return (
              <div
                key={trade.id}
                className="flex items-center justify-between gap-3 px-3.5 sm:px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Left: Direction Badge + Symbol + Date/Ticket */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      buy
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {buy ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {trade.symbol || "UNKNOWN"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase leading-none ${
                          buy
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {buy ? "BUY" : "SELL"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 tabular-nums truncate">
                      {formattedDate}
                      {trade.ticket ? ` · #${trade.ticket}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right: Lot Size + P&L */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-[13.5px] font-bold tabular-nums leading-tight ${
                      isWin
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isWin ? "+" : "-"}
                    {currencySymbol}
                    {Math.abs(profit).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium tabular-nums mt-0.5">
                    {lots > 0 ? `${lots.toFixed(2)} lots` : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileTradesLedger;
