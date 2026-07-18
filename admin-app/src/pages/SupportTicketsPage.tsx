import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Headphones, MessageSquare, Clock, X, RefreshCcw, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { createNotification } from "../lib/notifications";

const RenderTicketDescription = ({ description }: { description: string }) => {
  if (!description) return <p className="text-[12px] text-neutral-300 leading-relaxed whitespace-pre-wrap">No description provided.</p>;
  
  const cleanDesc = description.split('\n\n--- ATTACHMENTS ---')[0];
  const imgMatches = [...description.matchAll(/\[IMAGE_ATTACHMENT:(.*?)\]/g)].map(m => m[1]);
  const vidMatches = [...description.matchAll(/\[VIDEO_ATTACHMENT:(.*?)\]/g)].map(m => m[1]);

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-neutral-300 leading-relaxed whitespace-pre-wrap">{cleanDesc}</p>
      {(imgMatches.length > 0 || vidMatches.length > 0) && (
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
          {imgMatches.map((url, i) => (
            <a key={`img-${i}`} href={url} target="_blank" rel="noreferrer" className="block border border-white/10 rounded-lg overflow-hidden group relative">
              <img src={url} alt="Attachment" className="w-full h-32 object-cover transition-opacity duration-300" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none backdrop-blur-sm">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">View Media</span>
              </div>
            </a>
          ))}
          {vidMatches.map((url, i) => (
            <div key={`vid-${i}`} className="block border border-white/10 rounded-lg overflow-hidden">
              <video src={url} controls className="w-full h-32 object-cover bg-black" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SupportTicketsPage() {
  const { adminUser } = useAdminAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ticket Sync Failed:", error);
      setTickets([]);
    } else {
      // Enrich with profile data
      const userIds = [...new Set((data || []).map(t => t.user_id).filter(Boolean))];
      const profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }
      setTickets((data || []).map(t => ({ ...t, profiles: profileMap[t.user_id] || { full_name: "User", email: "" } })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();

    // Real-time subscription for new tickets
    const channel = supabase
      .channel("admin_support_tickets")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_tickets" },
        () => fetchTickets()
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_tickets" },
        () => fetchTickets()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [replies, setReplies] = useState<any[]>([]);

  useEffect(() => {
    if (selectedTicket) {
      const fetchReplies = async () => {
        const { data } = await supabase
          .from("ticket_replies")
          .select("*")
          .eq("ticket_id", selectedTicket.id)
          .order("created_at", { ascending: true });
        setReplies(data || []);
      };
      fetchReplies();

      const replyChannel = supabase
        .channel(`ticket_replies_${selectedTicket.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_replies", filter: `ticket_id=eq.${selectedTicket.id}` },
          (payload) => setReplies(prev => [...prev, payload.new])
        )
        .subscribe();

      return () => { supabase.removeChannel(replyChannel); };
    } else {
      setReplies([]);
    }
  }, [selectedTicket]);

  const updateTicketStatus = async (ticketId: string, userId: string, newStatus: string) => {
    // ... logic remains unchanged for status updates ...
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (!error) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket((prev: any) => ({ ...prev, status: newStatus }));
      
      // BROADCAST STATUS UPDATE TO USER INSTANTLY
      supabase.channel(`ticket_status_${ticketId}`).send({
        type: 'broadcast',
        event: 'status_update',
        payload: { ticketId, status: newStatus }
      });

      await createNotification({ userId, type: "SUPPORT", title: newStatus === "resolved" ? "Ticket Resolved" : "Ticket Updated", message: `Status updated to: ${newStatus.replace("_", " ").toUpperCase()}`, priority: "normal" });
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);

    await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id,
      admin_id: adminUser?.id || "admin",
      message: replyText,
    });

    await supabase.from("support_tickets").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", selectedTicket.id);

    await createNotification({ userId: selectedTicket.user_id, type: "SUPPORT", title: "Support Team Reply", message: `An admin has responded to your ticket: "${selectedTicket.subject}"`, priority: "high" });

    setReplyText("");
    setSending(false);
    fetchTickets();
  };

  const filtered = tickets.filter(t => filter === "all" || t.status === filter);

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  const priorityColor = (p: string) => {
    if (p === "urgent") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (p === "high") return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (p === "medium") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
  };

  const statusColor = (s: string) => {
    if (s === "open") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (s === "in_progress") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Support & Resolution Center</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Live Ticket Management // User Escalation Protocol</p>
        </div>
        <button onClick={fetchTickets} className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} /> Sync
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Tickets", value: tickets.length },
          { label: "Open", value: openCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Resolved", value: resolvedCount },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Urgent Alert */}
      {openCount > 0 && (
        <div className="bg-red-500/[0.03] border border-red-500/10 rounded p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{openCount} unresolved ticket(s) need attention</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${filter === f ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-600 hover:text-neutral-300"}`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Ticket Table */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Subject</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning support queue...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No tickets found</td></tr>
            ) : filtered.map(ticket => (
              <tr key={ticket.id} className="hover:bg-white/[0.01] transition-none cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                <td className="px-5 py-3">
                  <p className="text-[11px] font-bold text-neutral-300 uppercase">{ticket.profiles?.full_name || "User"}</p>
                  <p className="text-[9px] text-neutral-700 font-mono">{ticket.profiles?.email}</p>
                </td>
                <td className="px-5 py-3 text-[11px] text-neutral-400 max-w-[200px] truncate">{ticket.subject}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${priorityColor(ticket.priority)}`}>
                    {ticket.priority || "medium"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${statusColor(ticket.status)}`}>
                    {ticket.status?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-[10px] text-neutral-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  {ticket.status !== "resolved" && (
                    <button onClick={e => { e.stopPropagation(); updateTicketStatus(ticket.id, ticket.user_id, "resolved"); }}
                      className="px-3 py-1 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded uppercase flex items-center gap-1 ml-auto">
                      <CheckCircle2 size={10} /> Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Ticket Detail Modal ... */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <div className="bg-[#121212] border border-white/10 rounded-xl w-full max-w-[600px] shadow-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-white uppercase tracking-tight">{selectedTicket.subject}</h2>
                <p className="text-[10px] text-neutral-500 mt-1">By {selectedTicket.profiles?.full_name || "User"} • {new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white"><X size={16} /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border mb-3 inline-block ${statusColor(selectedTicket.status)}`}>{selectedTicket.status?.replace("_", " ")}</span>
                <RenderTicketDescription description={selectedTicket.description} />
              </div>

              {/* Chat Replies */}
              <div className="space-y-3">
                {replies.map(r => (
                  <div key={r.id} className={`flex flex-col ${r.admin_id ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-xl max-w-[85%] text-[11px] ${r.admin_id ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#1E1E1E] text-neutral-300 border border-white/5 rounded-bl-sm'}`}>
                      {r.message}
                    </div>
                    <span className="text-[8px] text-neutral-600 mt-1 px-1 uppercase">{r.admin_id ? 'Support Desk' : 'Client'} • {new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-2 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Action:</span>
                {["open", "in_progress", "resolved"].map(s => (
                  <button key={s} onClick={() => updateTicketStatus(selectedTicket.id, selectedTicket.user_id, s)}
                    className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${selectedTicket.status === s ? "bg-white/10 border-white/10 text-white" : "bg-[#1E1E1E] border-white/5 text-neutral-600 hover:text-neutral-300"}`}>
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendReply()}
                  placeholder="TYPE REPLY TO USER..."
                  className="flex-1 bg-[#1E1E1E] border border-white/5 rounded px-4 py-2.5 text-[11px] text-white outline-none focus:border-white/20"
                />
                <button onClick={sendReply} disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-2 disabled:opacity-50 transition-colors">
                  <Send size={12} /> {sending ? "Sending..." : "Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
