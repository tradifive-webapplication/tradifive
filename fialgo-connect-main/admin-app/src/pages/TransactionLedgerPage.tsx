import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Receipt, RefreshCcw, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function TransactionLedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Transaction fetch failed:", error);
      setTransactions([]);
    } else {
      const userIds = [...new Set((data || []).map(t => t.user_id).filter(Boolean))];
      const profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }
      setTransactions((data || []).map(t => ({ ...t, profiles: profileMap[t.user_id] || { full_name: "System", email: "" } })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = transactions.filter(t => {
    if (filter === "credit") return t.type === "credit" || t.amount > 0;
    if (filter === "debit") return t.type === "debit" || t.amount < 0;
    return true;
  });

  const totalVolume = transactions.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const credits = transactions.filter(t => t.type === "credit" || t.amount > 0).reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const debits = transactions.filter(t => t.type === "debit" || t.amount < 0).reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Transaction Ledger</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Platform-Wide Financial Oversight</p>
        </div>
        <button onClick={fetchTransactions} className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} /> Sync
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Transactions", value: transactions.length },
          { label: "Total Volume", value: `$${totalVolume.toLocaleString()}` },
          { label: "Credits (Inflow)", value: `$${credits.toLocaleString()}` },
          { label: "Debits (Outflow)", value: `$${debits.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white uppercase">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "credit", "debit"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-600 hover:text-neutral-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">ID</th>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Description</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Loading transaction history...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No transactions found</td></tr>
            ) : filtered.map((t, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-none">
                <td className="px-5 py-3 text-[10px] font-mono text-neutral-500">{t.id?.substring(0, 8) || `TXN-${i}`}</td>
                <td className="px-5 py-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">{t.profiles?.full_name || "System"}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {(t.type === "credit" || t.amount > 0) ? (
                      <ArrowDownLeft size={12} className="text-emerald-500" />
                    ) : (
                      <ArrowUpRight size={12} className="text-red-500" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{t.type || (t.amount > 0 ? "credit" : "debit")}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[11px] text-neutral-400">{t.description || t.reason || "Transaction"}</td>
                <td className="px-5 py-3">
                  <span className={`text-[12px] font-bold ${(t.type === "credit" || t.amount > 0) ? "text-emerald-500" : "text-red-500"}`}>
                    {(t.type === "credit" || t.amount > 0) ? "+" : "-"}${Math.abs(t.amount || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-[10px] text-neutral-500">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
