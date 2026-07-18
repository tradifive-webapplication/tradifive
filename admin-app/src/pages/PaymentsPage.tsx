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
      <div>
        <h1 className="text-xl font-bold tracking-widest text-white uppercase">Finance Terminal</h1>
        <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Cashflow Monitoring</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Gross Yield (M)", value: `₹${totalRevenue.toLocaleString()}` },
          { label: "Confirmed Nodes", value: profiles.length },
          { label: "Standard ARPU", value: "₹1,299" },
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
            Subscription Registry
          </h2>
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
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
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">{p.full_name || "User"}</p>
                  <p className="text-[9px] text-neutral-800 font-mono lower-case">{p.email}</p>
                </td>
                <td className="px-5 py-3 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{p.plan_type || "PRO"} ACTIVE</td>
                <td className="px-5 py-3 text-right text-[10px] text-neutral-700 uppercase">
                  {new Date(p.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
