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

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <Server size={14} className="text-neutral-700" /> MT5 Active Links
          </h2>
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">Terminal ID</th>
              <th className="px-5 py-3.5">Account #</th>
              <th className="px-5 py-3.5">Balance</th>
              <th className="px-5 py-3.5">Signal Status</th>
              <th className="px-5 py-3.5 text-right">Last Heartbeat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning network nodes...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No terminals detected</td></tr>
            ) : accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-white/[0.01] transition-none group">
                <td className="px-5 py-3 text-[11px] font-bold text-neutral-300 uppercase">{acc.profiles?.full_name || "LINK"}</td>
                <td className="px-5 py-3 text-[11px] font-mono text-neutral-400">{acc.account_number || "—"}</td>
                <td className="px-5 py-3 text-[11px] font-mono text-neutral-300">${acc.balance?.toFixed(0) || "0"}</td>
                <td className="px-5 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                    {acc.algo_status ? "STABLE" : "DISCONNECT"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-[10px] text-neutral-500 uppercase">
                  {acc.updated_at ? new Date(acc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
