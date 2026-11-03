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
  parseChatMessage,
  serializeChatMessage,
  uploadSupportAttachment,
  ChatAttachment
} from "@/utils/supportChat";
import { Image as ImageIcon, Video, FileText, Download, X, Paperclip, Send } from "lucide-react";
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
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<ChatAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState<string>("*/*");

  const triggerFilePicker = (acceptType: 'all' | 'image' | 'video' | 'document') => {
    let accept = "*/*";
    if (acceptType === 'image') accept = "image/*";
    else if (acceptType === 'video') accept = "video/*";
    else if (acceptType === 'document') accept = ".pdf,.doc,.docx,.txt,.csv,.log,.zip";
    setFileAccept(accept);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    toast.loading("Uploading attachment...", { id: "admin-attach" });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const att = await uploadSupportAttachment(file, 'admin');
        if (att) {
          setStagedAttachments(prev => [...prev, att]);
          toast.success(`Attached ${file.name}`, { id: "admin-attach" });
        }
      } catch (err) {
        console.error("Admin upload failed:", err);
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedAttachment = (idx: number) => {
    setStagedAttachments(prev => prev.filter((_, i) => i !== idx));
  };

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
    if ((!replyText.trim() && stagedAttachments.length === 0) || !selectedTicket) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    const serialized = serializeChatMessage(replyText, stagedAttachments);
    setReplyText("");
    setStagedAttachments([]);
    
    const { error } = await supabase.from('ticket_replies').insert({
      ticket_id: selectedTicket.id,
      admin_id: user?.id || 'admin_operator',
      message: serialized
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
      {/* Ticket Details & Live Chat Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-white max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {selectedTicket && (
            <>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={fileAccept}
                multiple
                className="hidden"
              />

              <DialogHeader className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-blue-400">#{selectedTicket.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-bold uppercase ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <DialogTitle className="text-lg font-bold text-white">{selectedTicket.subject}</DialogTitle>
                  <p className="text-xs text-slate-400 mt-1">User: {selectedTicket.profiles?.full_name || 'Anonymous'} ({selectedTicket.profiles?.email || 'N/A'})</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'resolved' ? (
                    <Button onClick={markResolved} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                      <CheckCircle2 size={14} className="mr-1.5" /> Mark Resolved
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </DialogHeader>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh] bg-slate-950/30">
                {/* Initial Description */}
                <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl text-sm text-slate-300">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Initial Ticket Description</span>
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {replies.map((r, i) => {
                  const isAdmin = !!r.admin_id;
                  const parsed = parseChatMessage(r.message);

                  return (
                    <div key={r.id || i} className={`flex flex-col gap-1 max-w-[85%] ${isAdmin ? 'ml-auto items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-2xl text-sm ${isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tl-sm'}`}>
                        {parsed.text && <p className="whitespace-pre-wrap">{parsed.text}</p>}

                        {/* Render Attachments */}
                        {parsed.attachments && parsed.attachments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {parsed.attachments.map((att, aIdx) => {
                              if (att.type === 'image') {
                                return (
                                  <div key={aIdx} className="overflow-hidden rounded-xl border border-white/20 cursor-pointer" onClick={() => setLightboxMedia(att)}>
                                    <img src={att.url} alt={att.name} className="max-h-56 max-w-full object-cover hover:scale-105 transition-transform" />
                                    <span className="text-[10px] block px-2 py-1 bg-black/40 text-white/90 truncate">{att.name}</span>
                                  </div>
                                );
                              }
                              if (att.type === 'video') {
                                return (
                                  <div key={aIdx} className="overflow-hidden rounded-xl border border-white/20">
                                    <video src={att.url} controls className="max-h-56 max-w-full rounded-xl" />
                                    <span className="text-[10px] block px-2 py-1 bg-black/40 text-white/90 truncate">🎥 {att.name}</span>
                                  </div>
                                );
                              }
                              return (
                                <a
                                  key={aIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={att.name}
                                  className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 transition-colors text-white"
                                >
                                  <FileText size={18} className="text-blue-300 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate">{att.name}</p>
                                    {att.size && <span className="text-[10px] opacity-60">{(att.size / 1024).toFixed(1)} KB</span>}
                                  </div>
                                  <Download size={14} className="shrink-0 opacity-80" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 px-2">
                        {isAdmin ? 'Admin' : 'User'} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Staged attachments preview */}
              {stagedAttachments.length > 0 && (
                <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex gap-2 overflow-x-auto">
                  {stagedAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-white shadow-sm">
                      {att.type === 'image' && <ImageIcon size={14} className="text-blue-400" />}
                      {att.type === 'video' && <Video size={14} className="text-purple-400" />}
                      {att.type === 'document' && <FileText size={14} className="text-emerald-400" />}
                      <span className="max-w-[120px] truncate">{att.name}</span>
                      <button type="button" onClick={() => removeStagedAttachment(idx)} className="text-slate-400 hover:text-rose-400 ml-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin reply composer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('image')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium"
                  >
                    <ImageIcon size={15} className="text-blue-500" />
                    <span>Attach Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('video')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition-colors font-medium"
                  >
                    <Video size={15} className="text-purple-500" />
                    <span>Attach Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('document')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium"
                  >
                    <FileText size={15} className="text-emerald-500" />
                    <span>Attach Document</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('all')}
                    title="Attach File"
                    className="p-3 text-slate-400 hover:text-blue-400 bg-slate-900 border border-slate-800 rounded-xl transition-colors"
                  >
                    <Paperclip size={18} />
                  </button>
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Type response to user..."
                    disabled={selectedTicket.status === 'resolved'}
                    className="bg-slate-900 border-slate-800 text-white h-12 flex-1"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={(!replyText.trim() && stagedAttachments.length === 0) || selectedTicket.status === 'resolved'}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 h-12"
                  >
                    <Send size={16} className="mr-2" /> Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden border border-white/10 bg-[#111]">
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors z-10"
            >
              <X size={18} />
            </button>
            <img src={lightboxMedia.url} alt={lightboxMedia.name} className="max-w-full max-h-[80vh] object-contain block" />
            <div className="p-3 bg-[#18181c] flex items-center justify-between">
              <span className="text-xs text-white font-bold truncate max-w-[300px]">{lightboxMedia.name}</span>
              <a
                href={lightboxMedia.url}
                download={lightboxMedia.name}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




