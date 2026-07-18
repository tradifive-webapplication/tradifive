import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Mail, CheckCircle2, XCircle, Search, RefreshCcw, Trash2, MailCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "invited" | "rejected">("all");

  const fetchWaitlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Waitlist fetch failed:", error);
      toast.error("Failed to load waitlist entries.");
      setWaitlist([]);
    } else {
      setWaitlist(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWaitlist();

    const subscription = supabase
      .channel('waitlist_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWaitlist((prev) => [payload.new, ...prev]);
          toast.success("New waitlist sign-up received!");
        } else if (payload.eventType === 'UPDATE') {
          setWaitlist((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)));
        } else if (payload.eventType === 'DELETE') {
          setWaitlist((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateStatus = async (id: string, newStatus: "invited" | "rejected" | "pending") => {
    const { error } = await supabase
      .from("waitlist")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status.");
    } else {
      toast.success(`User status updated to '${newStatus}'.`);
      setWaitlist(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry from the waitlist?")) return;

    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete entry:", error);
      toast.error("Failed to delete entry.");
    } else {
      toast.success("Entry removed from waitlist.");
      setWaitlist(prev => prev.filter(item => item.id !== id));
    }
  };

  // Filter waitlist entries based on search and status filters
  const filteredWaitlist = waitlist.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.feedback?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = waitlist.length;
  const pendingCount = waitlist.filter(item => item.status === "pending" || !item.status).length;
  const invitedCount = waitlist.filter(item => item.status === "invited").length;
  const rejectedCount = waitlist.filter(item => item.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Waitlist Registry</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Pre-launch User Acquisition & Sign-ups</p>
        </div>
        <button 
          onClick={fetchWaitlist} 
          className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2"
        >
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sign-ups", value: totalCount, border: "border-white/5" },
          { label: "Pending Review", value: pendingCount, border: "border-amber-500/20 text-amber-500" },
          { label: "Invited Users", value: invitedCount, border: "border-emerald-500/20 text-emerald-500" },
          { label: "Rejected/Archived", value: rejectedCount, border: "border-rose-500/20 text-rose-500" },
        ].map(s => (
          <div key={s.label} className={`bg-[#1E1E1E] border rounded p-4 ${s.border}`}>
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white uppercase">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1E1E1E] border border-white/5 rounded p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {(["all", "pending", "invited", "rejected"] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${
                statusFilter === f 
                  ? "bg-white/10 border-white/10 text-white" 
                  : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email or feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-white/5 rounded pl-9 pr-4 py-2 text-[11px] text-white placeholder-neutral-600 outline-none focus:border-white/10"
          />
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Excited About / Feedback</th>
              <th className="px-5 py-3.5">Date Registered</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">
                  Scanning waitlist database...
                </td>
              </tr>
            ) : filteredWaitlist.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">
                  No waitlist entries found
                </td>
              </tr>
            ) : (
              filteredWaitlist.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-none group">
                  <td className="px-5 py-4">
                    <p className="text-[11px] font-bold text-neutral-300 uppercase">{item.name || "Anonymous"}</p>
                    <p className="text-[9px] text-neutral-600 font-mono flex items-center gap-1.5 mt-0.5">
                      <Mail size={10} /> {item.email}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      item.status === "invited"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : item.status === "rejected"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {item.status || "pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-[300px] overflow-hidden">
                    <p className="text-[11px] text-neutral-400 truncate whitespace-normal leading-normal max-h-12 overflow-y-auto" title={item.feedback}>
                      {item.feedback || <span className="text-neutral-700 italic">None provided</span>}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-[10px] text-neutral-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status !== "invited" && (
                        <button 
                          onClick={() => updateStatus(item.id, "invited")} 
                          className="px-2.5 py-1 text-[9px] font-bold bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 rounded uppercase transition-colors flex items-center gap-1"
                          title="Send Invite"
                        >
                          <MailCheck size={10} /> Invite
                        </button>
                      )}
                      {item.status === "pending" && (
                        <button 
                          onClick={() => updateStatus(item.id, "rejected")} 
                          className="px-2.5 py-1 text-[9px] font-bold bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 rounded uppercase transition-colors"
                          title="Reject User"
                        >
                          Reject
                        </button>
                      )}
                      {item.status !== "pending" && (
                        <button 
                          onClick={() => updateStatus(item.id, "pending")} 
                          className="px-2.5 py-1 text-[9px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-white/5 rounded uppercase transition-colors"
                          title="Reset status to Pending"
                        >
                          Reset
                        </button>
                      )}
                      <button 
                        onClick={() => deleteEntry(item.id)} 
                        className="p-1 text-[9px] font-bold bg-neutral-800 hover:bg-rose-950/50 text-neutral-500 hover:text-rose-400 border border-white/5 rounded transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
