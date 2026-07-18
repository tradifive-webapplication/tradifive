import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Star, Bug, MessageSquare, RefreshCcw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function FeedbackInboxPage() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "bugs" | "ratings">("all");

  const fetchFeedback = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Feedback fetch failed:", error);
      setFeedback([]);
    } else {
      const userIds = [...new Set((data || []).map(f => f.user_id).filter(Boolean))];
      const profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }
      setFeedback((data || []).map(f => ({ ...f, profiles: profileMap[f.user_id] || { full_name: "User", email: "" } })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchFeedback(); }, []);

  const deleteFeedback = async (id: string) => {
    await supabase.from("user_feedback").delete().eq("id", id);
    setFeedback(prev => prev.filter(f => f.id !== id));
  };

  const filtered = feedback.filter(f => {
    if (filter === "bugs") return f.description && f.description.length > 0;
    if (filter === "ratings") return f.rating > 0;
    return true;
  });

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating > 0).length).toFixed(1)
    : "0.0";

  const bugCount = feedback.filter(f => f.description && f.description.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Feedback Inbox</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Product Intelligence & User Reports</p>
        </div>
        <button onClick={fetchFeedback} className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Submissions", value: feedback.length },
          { label: "Average Rating", value: `${avgRating} / 5` },
          { label: "Bug Reports", value: bugCount },
          { label: "This Week", value: feedback.filter(f => new Date(f.created_at) > new Date(Date.now() - 7 * 86400000)).length },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white uppercase">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["all", "ratings", "bugs"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-600 hover:text-neutral-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Feedback Table */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Rating</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Description</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning feedback database...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No feedback found</td></tr>
            ) : filtered.map((f, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-none group">
                <td className="px-5 py-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">{f.profiles?.full_name || "User"}</p>
                  <p className="text-[9px] text-neutral-700 font-mono">{f.profiles?.email || ""}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className={`${(f.rating || 0) >= star ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-800'}`} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                    {f.category || "General"}
                  </span>
                </td>
                <td className="px-5 py-3 max-w-[300px]">
                  <p className="text-[11px] text-neutral-400 truncate">{f.description || "Rating only"}</p>
                </td>
                <td className="px-5 py-3 text-[10px] text-neutral-500">
                  {new Date(f.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => deleteFeedback(f.id)} className="px-3 py-1 text-[9px] font-bold bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 border border-white/5 rounded uppercase transition-colors">
                    Dismiss
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
