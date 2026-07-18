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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Trading Feed</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Platform Execution</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "buy", "sell"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-600 hover:text-neutral-300"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Executions", value: loading ? "..." : totalCount },
          { label: "Net P&L (Page)", value: `$${totalPnl.toFixed(2)}` },
          { label: "Win Rate (Page)", value: trades.length > 0 ? `${Math.round((trades.filter(t => t.profit > 0).length / trades.length) * 100)}%` : "0%" },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white uppercase">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">Trader</th>
              <th className="px-5 py-3.5">Symbol</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5 text-right">Net P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning blockchain history...</td></tr>
            ) : trades.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Terminal empty</td></tr>
            ) : trades.map((t, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-none group">
                <td className="px-5 py-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">{t.profiles?.full_name || "User"}</p>
                </td>
                <td className="px-5 py-3 text-[11px] font-mono text-neutral-500 uppercase tracking-tighter">{t.symbol}</td>
                <td className="px-5 py-3">
                  <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest underline decoration-neutral-800 underline-offset-4">
                    {t.trade_type}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-[11px] font-bold text-neutral-300">
                    ${Math.abs(t.profit || 0).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#1E1E1E] border border-white/5 rounded p-4">
          <span className="text-[10px] font-mono text-neutral-500">
            Showing {totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              PREV
            </button>
            <span className="text-[10px] font-bold text-neutral-400">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
