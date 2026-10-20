import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Banknote, CheckCircle2, XCircle, Clock, RefreshCcw, AlertCircle } from "lucide-react";
import { createNotification } from "../lib/notifications";

export default function PayoutApprovalsPage() {
  const { adminUser } = useAdminAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchPayouts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payout_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payout fetch failed:", error);
      setPayouts([]);
    } else {
      const userIds = [...new Set((data || []).map(p => p.user_id).filter(Boolean))];
      const profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }
      setPayouts((data || []).map(p => ({ ...p, profiles: profileMap[p.user_id] || { full_name: "User", email: "" } })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayouts();

    const channel = supabase
      .channel('payout_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payout_requests' }, () => {
        fetchPayouts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAction = async (payoutId: string, userId: string, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("payout_requests")
      .update({ status: action, reviewed_by: adminUser?.id, reviewed_at: new Date().toISOString() })
      .eq("id", payoutId);

    if (!error) {
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: action } : p));
      await createNotification({
        userId,
        type: "BILLING",
        title: action === "approved" ? "Payout Approved" : "Payout Rejected",
        message: action === "approved"
          ? "Your withdrawal request has been approved and is being processed."
          : "Your withdrawal request has been rejected. Please contact support for details.",
        priority: "high"
      });
    }
  };

  const filtered = payouts.filter(p => filter === "all" || p.status === filter);
  const pendingCount = payouts.filter(p => p.status === "pending").length;
  const totalApproved = payouts.filter(p => p.status === "approved").reduce((s, p) => s + (p.amount || 0), 0);

  const statusBadge = (status: string) => {
    if (status === "approved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (status === "rejected") return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Payout Approvals</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Withdrawal Request Processing</p>
        </div>
        <button onClick={fetchPayouts} className="self-start sm:self-auto px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Sync
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: "Total Requests", value: payouts.length },
          { label: "Pending Review", value: pendingCount },
          { label: "Total Approved", value: `$${totalApproved.toLocaleString()}` },
          { label: "Rejected", value: payouts.filter(p => p.status === "rejected").length },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4">
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 truncate">{s.label}</p>
            <p className="text-base sm:text-lg font-bold text-white uppercase">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{pendingCount} payout request(s) awaiting review</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-none shrink-0 ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-500 hover:text-neutral-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">Loading payout requests...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">No payout requests found</div>
          ) : filtered.map(p => (
            <div key={p.id} className="p-3.5 space-y-2.5 hover:bg-white/[0.01]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white uppercase truncate">{p.profiles?.full_name || "User"}</p>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">{p.profiles?.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-widest border shrink-0 ${statusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Amount</span>
                  <span className="text-sm font-bold text-white font-mono">${p.amount?.toLocaleString() || "0"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Method</span>
                  <span className="text-[10px] text-neutral-300 font-semibold uppercase">{p.method || "Crypto"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[9px] text-neutral-500">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                {p.status === "pending" ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleAction(p.id, p.user_id, "approved")}
                      className="px-2.5 py-1 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> Approve
                    </button>
                    <button onClick={() => handleAction(p.id, p.user_id, "rejected")}
                      className="px-2.5 py-1 text-[9px] font-bold bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 border border-white/5 rounded-md uppercase flex items-center gap-1">
                      <XCircle size={10} /> Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Processed</span>
                )}
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
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Requested</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Loading payout requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No payout requests found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-none">
                  <td className="px-5 py-3">
                    <p className="text-[11px] font-bold text-neutral-300 uppercase">{p.profiles?.full_name || "User"}</p>
                    <p className="text-[9px] text-neutral-500 font-mono">{p.profiles?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-bold text-white font-mono">${p.amount?.toLocaleString() || "0"}</td>
                  <td className="px-5 py-3 text-[10px] text-neutral-400 uppercase">{p.method || "Crypto"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[10px] text-neutral-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {p.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(p.id, p.user_id, "approved")}
                          className="px-3 py-1 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded uppercase flex items-center gap-1">
                          <CheckCircle2 size={10} /> Approve
                        </button>
                        <button onClick={() => handleAction(p.id, p.user_id, "rejected")}
                          className="px-3 py-1 text-[9px] font-bold bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 border border-white/5 rounded uppercase flex items-center gap-1">
                          <XCircle size={10} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-neutral-600 uppercase tracking-widest">Processed</span>
                    )}
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
