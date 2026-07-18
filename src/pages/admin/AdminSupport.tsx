import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LifeBuoy, 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Reply,
  User,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase.from('support_tickets').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    
    const { data } = await query;
    if (data) {
      setTickets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    setReplies(data || []);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('ticket_replies').insert({
      ticket_id: selectedTicket.id,
      admin_id: user?.id,
      message: replyText
    });

    if (error) {
      toast.error("Failed to send reply");
    } else {
      toast.success("Reply sent");
      setReplyText("");
      openTicket(selectedTicket);
      
      if (selectedTicket.status !== 'in_progress') {
          await supabase.from('support_tickets').update({ status: 'in_progress' }).eq('id', selectedTicket.id);
          fetchTickets();
      }
    }
  };

  const markResolved = async () => {
    if (!selectedTicket) return;
    const { error } = await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', selectedTicket.id);
    if (!error) {
      toast.success("Ticket resolved");
      setSelectedTicket(null);
      fetchTickets();
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgent': return 'text-rose-500';
        case 'high': return 'text-amber-500';
        default: return 'text-slate-500';
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Support Desk</h1>
          <p className="text-slate-400">Manage user inquiries and technical support tickets.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search tickets..." className="bg-slate-900 border-slate-800 pl-10 w-[200px]" />
            </div>
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-400">
                <Filter size={16} className="mr-2" />
                Filter
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <Clock className="text-slate-200" size={18} />
                <span className="text-[10px] font-bold text-slate-500">AVG RESPONSE</span>
            </div>
            <p className="text-2xl font-bold text-white">12m 45s</p>
            <p className="text-xs text-emerald-500 mt-1">-5m from yesterday</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <AlertCircle className="text-rose-500" size={18} />
                <span className="text-[10px] font-bold text-slate-500">URGENT OPEN</span>
            </div>
            <p className="text-2xl font-bold text-white">{tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length} Tickets</p>
            <p className="text-xs text-rose-500 mt-1">Immediate action required</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-emerald-500" size={18} />
                <span className="text-[10px] font-bold text-slate-500">RESOLVED</span>
            </div>
            <p className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'resolved').length}</p>
            <p className="text-xs text-slate-500 mt-1">Total resolved tickets</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <MessageSquare className="text-purple-500" size={18} />
                <span className="text-[10px] font-bold text-slate-500">TOTAL TICKETS</span>
            </div>
            <p className="text-2xl font-bold text-white">{tickets.length}</p>
            <p className="text-xs text-slate-200 mt-1">All time volume</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No tickets found.</td>
                </tr>
              ) : filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-slate-500" />
                      <span className="text-sm font-medium text-slate-300">{ticket.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{ticket.profiles?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500">{ticket.profiles?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300 font-medium truncate max-w-[250px]">{ticket.subject}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority || 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button onClick={() => openTicket(ticket)} variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                      View Ticket
                    </Button>
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




