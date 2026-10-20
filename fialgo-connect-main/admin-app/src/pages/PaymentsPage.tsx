import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { CreditCard, TrendingUp, IndianRupee } from "lucide-react";

export default function PaymentsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").in("subscription_status", ["pro", "elite", "trial"]).order("created_at", { ascending: false });
      setProfiles(data || []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel('profiles_payments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalRevenue = profiles.reduce((sum, p) => {
    if (p.subscription_status === "elite") return sum + 4999;
    if (p.subscription_status === "pro") return sum + 2499;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Finance Terminal</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Cashflow Monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: "Gross Yield (M)", value: `₹${totalRevenue.toLocaleString()}` },
          { label: "Confirmed Nodes", value: profiles.length },
          { label: "Standard ARPU", value: "₹1,299" },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4">
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-base sm:text-lg font-bold text-white uppercase">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            Subscription Registry
          </h2>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">Accessing ledger...</div>
          ) : profiles.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">No active transactions</div>
          ) : profiles.map(p => (
            <div key={p.id} className="p-3.5 space-y-2 hover:bg-white/[0.01]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white uppercase truncate">{p.full_name || "User"}</p>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest shrink-0">
                  {p.plan_type || "PRO"} ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span className="truncate">{p.email}</span>
                <span className="shrink-0 text-neutral-500">
                  {new Date(p.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
              <tr>
                <th className="px-5 py-3.5">Subscriber</th>
                <th className="px-5 py-3.5">Tier</th>
                <th className="px-5 py-3.5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={3} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Accessing ledger...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No active transactions</td></tr>
              ) : profiles.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-none group">
                  <td className="px-5 py-3">
                    <p className="text-[11px] font-bold text-neutral-300 uppercase">{p.full_name || "User"}</p>
                    <p className="text-[9px] text-neutral-500 font-mono lower-case">{p.email}</p>
                  </td>
                  <td className="px-5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{p.plan_type || "PRO"} ACTIVE</td>
                  <td className="px-5 py-3 text-right text-[10px] text-neutral-500 uppercase">
                    {new Date(p.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
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
