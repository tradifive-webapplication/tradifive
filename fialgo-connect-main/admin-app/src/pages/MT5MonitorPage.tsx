import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Monitor, RefreshCcw, Server } from "lucide-react";

export default function MT5MonitorPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("mt5_accounts").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("MT5 fetch failed:", error);
        setAccounts([]);
      } else {
        const userIds = [...new Set((data || []).map(a => a.user_id).filter(Boolean))];
        const profileMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
          (profiles || []).forEach(p => { profileMap[p.id] = p; });
        }
        setAccounts((data || []).map(a => ({ ...a, profiles: profileMap[a.user_id] || { full_name: "User", email: "" } })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const connectedCount = accounts.filter(a => a.algo_status).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Network Monitor</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Infrastructure & Broker Telemetry</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} /> Sync
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Handled", value: accounts.length },
          { label: "Active Bridges", value: connectedCount },
          { label: "Terminal Disconnects", value: accounts.length - connectedCount },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white uppercase">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.08] bg-white/[0.01] flex items-center justify-between">
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Server size={14} className="text-blue-400" /> MT5 Active Links
          </h2>
          <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            {connectedCount} LIVE BRIDGES
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/[0.02] border-b border-white/[0.08]">
              <tr>
                <th className="px-5 py-3.5">Terminal ID</th>
                <th className="px-5 py-3.5">Account #</th>
                <th className="px-5 py-3.5">Balance</th>
                <th className="px-5 py-3.5">Signal Status</th>
                <th className="px-5 py-3.5 text-right">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-400 text-xs animate-pulse">Scanning network nodes...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-400 text-xs">No terminals detected</td></tr>
              ) : accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5 text-xs font-semibold text-white">{acc.profiles?.full_name || "LINK"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-neutral-300">{acc.account_number || "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-white">${acc.balance?.toFixed(0) || "0"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      acc.algo_status ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-800 text-neutral-400 border border-white/5"
                    }`}>
                      {acc.algo_status ? "STABLE" : "DISCONNECT"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-xs text-neutral-400">
                    {acc.updated_at ? new Date(acc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
