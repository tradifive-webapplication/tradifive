import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { CreditCard, RefreshCcw, Crown, Zap, UserCog, Save } from "lucide-react";
import { createNotification } from "../lib/notifications";

export default function SubscriptionManagerPage() {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "trial" | "pro" | "elite" | "expired">("all");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, subscription_status, created_at")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updatePlan = async (userId: string, newPlan: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: newPlan })
      .eq("id", userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_status: newPlan } : u));
      await createNotification({
        userId,
        type: "BILLING",
        title: "Subscription Updated",
        message: `Your subscription has been changed to ${newPlan.toUpperCase()} by the admin team.`,
        priority: "normal"
      });
    }
  };

  const filtered = users.filter(u => {
    const matchesFilter = filter === "all" || u.subscription_status === filter;
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const planCounts = {
    trial: users.filter(u => u.subscription_status === "trial").length,
    pro: users.filter(u => u.subscription_status === "pro").length,
    elite: users.filter(u => u.subscription_status === "elite").length,
    expired: users.filter(u => u.subscription_status === "expired" || !u.subscription_status).length,
  };

  const planBadge = (plan: string) => {
    if (plan === "elite") return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (plan === "pro") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (plan === "trial") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
  };

  const estimatedMRR = (planCounts.pro * 2499) + (planCounts.elite * 4999);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Subscription Manager</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">User Plans, Trials & Billing Override</p>
        </div>
        <button onClick={fetchUsers} className="self-start sm:self-auto px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Sync
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4">
        {[
          { label: "Total Users", value: users.length, icon: UserCog },
          { label: "Pro Trial", value: planCounts.trial, icon: Zap },
          { label: "Pro", value: planCounts.pro, icon: CreditCard },
          { label: "Elite", value: planCounts.elite, icon: Crown },
          { label: "Est. MRR", value: `₹${estimatedMRR.toLocaleString()}`, icon: CreditCard },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4">
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 truncate">{s.label}</p>
            <p className="text-base sm:text-lg font-bold text-white truncate">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full">
        <input
          type="text"
          placeholder="SEARCH TRADERS..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1E1E1E] border border-white/5 rounded-lg px-3.5 py-2 text-[10px] font-mono text-white outline-none focus:border-white/20 w-full sm:w-60"
        />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {(["all", "trial", "pro", "elite", "expired"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-none shrink-0 ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-500 hover:text-neutral-300"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">Loading subscriptions...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">No users found</div>
          ) : filtered.map(u => (
            <div key={u.id} className="p-3.5 space-y-2.5 hover:bg-white/[0.01]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-200 uppercase truncate">{u.full_name || "User"}</p>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">{u.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-widest border shrink-0 ${planBadge(u.subscription_status)}`}>
                  {u.subscription_status || "none"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[9px] text-neutral-500">
                  Joined: {new Date(u.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase">Change:</span>
                  <select
                    value={u.subscription_status || ""}
                    onChange={e => updatePlan(u.id, e.target.value)}
                    className="bg-[#121212] border border-white/10 rounded-md px-2 py-1 text-[10px] text-white outline-none cursor-pointer"
                  >
                    <option value="trial">Trial</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                    <option value="expired">Expired</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-5 py-3.5">Trader</th>
                <th className="px-5 py-3.5">Current Plan</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Change Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Loading subscriptions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-none">
                  <td className="px-5 py-3">
                    <p className="text-[11px] font-bold text-neutral-300 uppercase">{u.full_name || "User"}</p>
                    <p className="text-[9px] text-neutral-500 font-mono">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${planBadge(u.subscription_status)}`}>
                      {u.subscription_status || "none"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[10px] text-neutral-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <select
                      value={u.subscription_status || ""}
                      onChange={e => updatePlan(u.id, e.target.value)}
                      className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white outline-none cursor-pointer"
                    >
                      <option value="trial">Trial</option>
                      <option value="pro">Pro</option>
                      <option value="elite">Elite</option>
                      <option value="expired">Expired</option>
                      <option value="">None</option>
                    </select>
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
