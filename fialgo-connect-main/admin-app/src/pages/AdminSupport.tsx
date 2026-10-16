import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  Clock, 
  Filter, 
  MoreVertical,
  ChevronRight,
  User,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSupport() {
  const { adminUser } = useAdminAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Support fetch failed:", error);
        setTickets([]);
      } else {
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
    fetchTickets();
    
    // Subscribe to new tickets
    const sub = supabase.channel('support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };
    fetchMessages();

    const sub = supabase.channel(`ticket_replies_${selectedTicket.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_replies', filter: `ticket_id=eq.${selectedTicket.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [selectedTicket]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const { error } = await supabase.from('ticket_replies').insert([{
      ticket_id: selectedTicket.id,
      admin_id: adminUser?.id || null, // If adminUser.id exists it's an admin, otherwise if we had a user it would be different, but we know this is admin
      message: newMessage.trim(),
    }]);
    
    if (!error) {
      setNewMessage("");
      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === 'open') {
        await supabase.from('support_tickets').update({ status: 'in_progress' }).eq('id', selectedTicket.id);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Support Command</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Platform Assistance Terminal</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{tickets.filter(t => t.status !== 'resolved').length} Active</span>
                </div>
                <div className="w-px h-4 bg-slate-800" />
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Live Ops</span>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-[600px]">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <Input 
                placeholder="Search ticket IDs..." 
                className="bg-slate-950 border-slate-800 pl-10 rounded-xl h-11"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">
                <span>Recent Inquiries</span>
                <span className="flex items-center gap-1 text-blue-500 underline decoration-blue-500/20 underline-offset-4 cursor-pointer">All Statuses <ChevronRight size={10} /></span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {tickets.length === 0 ? (
                <div className="p-12 text-center">
                    <LifeBuoy className="mx-auto text-slate-800 mb-4" size={48} />
                    <p className="text-slate-500 text-sm italic">Queue clear. No pending tickets.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800/10">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`p-6 hover:bg-blue-500/5 cursor-pointer transition-all group relative border-l-2 ${selectedTicket?.id === ticket.id ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:border-blue-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-slate-600 uppercase">#{ticket.id.slice(0, 8)}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    ticket.status === 'open' ? 'bg-amber-500/10 text-amber-500' :
                                    ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{ticket.subject}</h4>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500 font-medium">{ticket.profiles?.full_name || 'System User'}</p>
                                <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                    <Clock size={10} /> 
                                    {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden relative backdrop-blur-sm">
          {!selectedTicket ? (
            <>
              <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0.5">Initialize Communication</h3>
                    <p className="text-xs text-slate-500 font-medium italic">Select a ticket from the master queue to begin resolution</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white rounded-xl">
                        <AlertCircle size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white rounded-xl">
                        <MoreVertical size={20} />
                    </Button>
                </div>
              </div>

              <div className="flex-1 p-12 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-24 h-24 bg-slate-800/10 border-2 border-dashed border-slate-800 rounded-3xl mb-6 flex items-center justify-center">
                    <MessageSquare className="text-slate-800" size={40} />
                </div>
                <p className="text-slate-600 text-sm font-bold uppercase tracking-[0.2em] mb-2">Workspace Inactive</p>
                <p className="max-w-[280px] text-slate-700 text-xs italic">Pending selection of an operational ticket from the tactical sidebar.</p>
              </div>

              <div className="p-8 border-t border-slate-800 bg-slate-900/20">
                <div className="relative">
                  <Input 
                    disabled
                    placeholder="Secure response channel locked..." 
                    className="bg-slate-950/20 border-slate-800/50 h-16 rounded-2xl pl-6 pr-16 italic"
                  />
                  <button disabled className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800/20 text-slate-700 rounded-xl flex items-center justify-center">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 uppercase font-bold text-sm">
                    {selectedTicket.profiles?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white mb-0.5">{selectedTicket.subject}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedTicket.profiles?.full_name || "System User"} • {selectedTicket.priority} Priority
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedTicket.status !== 'resolved' && (
                      <Button onClick={async () => {
                        await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', selectedTicket.id);
                        setSelectedTicket({...selectedTicket, status: 'resolved'});
                      }} variant="outline" size="sm" className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-[10px] uppercase tracking-widest h-8">
                          Mark Resolved
                      </Button>
                    )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Initial Ticket Description */}
                <div className="flex flex-col items-start gap-2 max-w-[80%]">
                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl rounded-tl-sm text-sm text-slate-300">
                    {selectedTicket.description}
                  </div>
                  <span className="text-[10px] text-slate-600 px-2">User • {new Date(selectedTicket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                {messages.map((msg, i) => {
                  // We treat admin replies as admin_id !== null, user replies as admin_id === null
                  const isAdmin = msg.admin_id && msg.admin_id !== selectedTicket.user_id;
                  
                  return (
                    <div key={msg.id || i} className={`flex flex-col gap-2 max-w-[80%] ${isAdmin ? 'ml-auto items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-2xl text-sm ${isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-tl-sm'}`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-600 px-2">
                        {isAdmin ? 'Admin' : 'User'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/20">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedTicket.status === 'resolved' ? "Ticket resolved. Cannot reply." : "Type response..."}
                    disabled={selectedTicket.status === 'resolved'}
                    className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 h-14 rounded-2xl pl-6 pr-16 text-white"
                  />
                  <button type="submit" disabled={!newMessage.trim() || selectedTicket.status === 'resolved'} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-slate-800 rounded-xl flex items-center justify-center transition-colors">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Critical Priority", count: tickets.filter(t => t.priority?.toLowerCase() === 'high' || t.priority?.toLowerCase() === 'critical').length, icon: AlertCircle, color: "text-rose-500" },
            { label: "Awaiting Input", count: tickets.filter(t => t.status === 'open').length, icon: Clock, color: "text-amber-500" },
            { label: "Recently Resolved", count: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle2, color: "text-emerald-500" },
          ].map((stat) => (
              <div key={stat.label} className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl flex items-center gap-6">
                <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 ${stat.color}`}>
                    <stat.icon size={24} />
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-bold text-white tracking-tight">{stat.count}</p>
                </div>
              </div>
          ))}
      </div>
    </div>
  );
}
