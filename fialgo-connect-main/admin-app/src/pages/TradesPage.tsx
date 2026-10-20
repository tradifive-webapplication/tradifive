import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const fetchTrades = async () => {
    setLoading(true);
    let query = supabase.from("trades").select("*", { count: "exact" }).order("closed_at", { ascending: false });
    if (filter !== "all") query = query.eq("trade_type", filter);

    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error("Trade fetch failed:", error);
      setTrades([]);
    } else {
      if (count !== null) setTotalCount(count);
      const userIds = [...new Set((data || []).map(t => t.user_id).filter(Boolean))];
      const profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }
      setTrades((data || []).map(t => ({ ...t, profiles: profileMap[t.user_id] || { full_name: "Trader", email: "" } })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();

    const debouncedFetch = () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchTrades();
      }, 2000);
    };

    const channel = supabase
      .channel('trades_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, debouncedFetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [filter, page]);

  const totalPnl = trades.reduce((acc, t) => acc + (t.profit || 0), 0);
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Live Execution Feed</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Real-time platform trade executions & telemetry stream</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "buy", "sell"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 px-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${filter === f
                  ? "bg-blue-600 border-blue-500/40 text-white shadow-md shadow-blue-500/20"
                  : "bg-[#1C1C20] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-[#25252B]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: "Total Executions", value: loading ? "..." : totalCount },
          { label: "Net P&L (Page)", value: `$${totalPnl.toFixed(2)}` },
          { label: "Win Rate (Page)", value: trades.length > 0 ? `${Math.round((trades.filter(t => t.profit > 0).length / trades.length) * 100)}%` : "0%" },
        ].map(s => (
          <div key={s.label} className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between transition-all">
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
        {/* Mobile View: Touch-Friendly Execution Stream */}
        <div className="md:hidden divide-y divide-white/[0.04]">
          {loading ? (
            <div className="p-8 text-center text-neutral-400 text-xs animate-pulse">Loading execution stream...</div>
          ) : trades.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">No trade executions found</div>
          ) : (
            trades.map((t, i) => (
              <div key={i} className="p-3.5 space-y-2 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white truncate">{t.profiles?.full_name || "Trader"}</span>
                  <span className={`font-mono text-xs font-bold shrink-0 ${(t.profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {(t.profit || 0) >= 0 ? "+" : "-"}${Math.abs(t.profit || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-neutral-300 uppercase">{t.symbol}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                    t.trade_type?.toLowerCase() === "buy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {t.trade_type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/[0.02] border-b border-white/[0.08]">
              <tr>
                <th className="px-5 py-3.5">Trader</th>
                <th className="px-5 py-3.5">Symbol</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-400 text-xs animate-pulse">Loading execution stream...</td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-400 text-xs">No trade executions found</td></tr>
              ) : trades.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-white">{t.profiles?.full_name || "Trader"}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-neutral-300 uppercase">{t.symbol}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${t.trade_type?.toLowerCase() === "buy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                      {t.trade_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-mono text-xs font-bold ${(t.profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                      {(t.profit || 0) >= 0 ? "+" : "-"}${Math.abs(t.profit || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161618] border border-white/[0.08] rounded-xl p-3.5 sm:p-4">
          <span className="text-xs text-neutral-400 text-center sm:text-left">
            Showing {totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-8 px-3 bg-[#1C1C20] hover:bg-[#25252B] border border-white/[0.08] rounded-lg text-xs font-semibold text-neutral-200 disabled:opacity-40 transition-all"
            >
              PREV
            </button>
            <span className="text-xs font-semibold text-neutral-300">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 px-3 bg-[#1C1C20] hover:bg-[#25252B] border border-white/[0.08] rounded-lg text-xs font-semibold text-neutral-200 disabled:opacity-40 transition-all"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
