import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  User, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  RefreshCcw,
  Smartphone,
  Laptop
} from "lucide-react";
import {
  parseChatMessage,
  serializeChatMessage,
  uploadSupportAttachment,
  ChatAttachment
} from "../utils/supportChat";
import { Image as ImageIcon, Video, FileText, Download, X, Paperclip } from "lucide-react";
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
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<ChatAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState<string>("*/*");
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "web" | "mobile" | "unresolved">("all");

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
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const att = await uploadSupportAttachment(file, 'admin_desk');
        if (att) {
          setStagedAttachments(prev => [...prev, att]);
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
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Support fetch failed:", error);
      setTickets([]);
    } else {
      // Live Desk only includes live support chats
      const liveChats = (data || []).filter(t => {
        const cat = (t.category || '').toLowerCase();
        const sub = (t.subject || '').toLowerCase();
        return cat === 'live support' || cat === 'live_chat' || sub.startsWith('live support') || sub.startsWith('live chat');
      });

      const userIds = [...new Set(liveChats.map(t => t.user_id).filter(Boolean))];
      const profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }
      const mapped = liveChats.map(t => ({ ...t, profiles: profileMap[t.user_id] || { full_name: "User", email: "" } }));
      setTickets(mapped);
      // Auto-select latest active ticket if none selected
      if (!selectedTicket && mapped.length > 0) {
        const active = mapped.find(m => m.status !== 'resolved') || mapped[0];
        setSelectedTicket(active);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    
    // Subscribe to new tickets
    const sub = supabase.channel('admin_live_chat_desk')
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
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [selectedTicket?.id]);

  const sendMessage = async () => {
    if ((!newMessage.trim() && stagedAttachments.length === 0) || !selectedTicket) return;
    const serialized = serializeChatMessage(newMessage, stagedAttachments);
    setNewMessage("");
    setStagedAttachments([]);
    
    const { error } = await supabase.from('ticket_replies').insert([{
      ticket_id: selectedTicket.id,
      admin_id: adminUser?.id || 'admin_operator',
      message: serialized,
    }]);
    
    if (!error) {
      if (selectedTicket.status === 'open') {
        await supabase.from('support_tickets').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', selectedTicket.id);
        setSelectedTicket((prev: any) => prev ? { ...prev, status: 'in_progress' } : null);
      }
    }
  };

  const isMobileSession = (t: any) => {
    const sub = (t.subject || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    return sub.includes('mobile') || desc.includes('mobile');
  };

  const filteredTickets = tickets.filter(t => {
    if (channelFilter === 'unresolved' && t.status === 'resolved') return false;
    if (channelFilter === 'mobile' && !isMobileSession(t)) return false;
    if (channelFilter === 'web' && isMobileSession(t)) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (t.subject || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q) ||
      (t.profiles?.full_name || '').toLowerCase().includes(q) ||
      (t.profiles?.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      {/* Header aligned with SupportTicketsPage style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Chat Desk
          </h1>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Real-Time User Messaging Terminal // Web & Mobile Live Stream
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#18181c] border border-white/[0.08] rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                {tickets.filter(t => t.status !== 'resolved').length} Active
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Human Desk Online</span>
            </div>
          </div>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-[#18181c] border border-white/[0.08] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Sync
          </button>
        </div>
      </div>

      {/* Main Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-[640px]">
        {/* Left Side: Client Sessions List */}
        <div className="lg:col-span-1 bg-[#121214] border border-white/[0.08] rounded-xl flex flex-col shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.08] bg-[#18181c]/60 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients or ticket IDs..." 
                className="w-full bg-[#0d0d0f] border border-white/[0.08] text-white pl-9 pr-3 py-2 text-xs rounded-lg placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold uppercase tracking-widest">
              {[
                { id: "all", label: "All Chats" },
                { id: "unresolved", label: "Open" },
                { id: "web", label: "💻 Web" },
                { id: "mobile", label: "📱 Mobile" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setChannelFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    channelFilter === f.id
                      ? "bg-blue-600 text-white"
                      : "bg-[#18181c] text-neutral-400 hover:text-white border border-white/[0.06]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center">
                <LifeBuoy className="mx-auto text-neutral-700 mb-3" size={36} />
                <p className="text-neutral-500 text-xs uppercase tracking-wider">Queue Clear // No Active Chats</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const isMobile = isMobileSession(ticket);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 cursor-pointer transition-colors relative border-l-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                          isMobile ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                        }`}>
                          {isMobile ? <Smartphone size={10} /> : <Laptop size={10} />}
                          {isMobile ? "Mobile" : "Web"}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        ticket.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-neutral-200 mb-1 line-clamp-1">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                      <p className="truncate max-w-[140px]">{ticket.profiles?.full_name || 'Trader'}</p>
                      <span className="text-[10px] text-neutral-600 flex items-center gap-1 font-mono">
                        <Clock size={10} /> 
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation View */}
        <div className="lg:col-span-2 bg-[#121214] border border-white/[0.08] rounded-xl flex flex-col shadow-xl overflow-hidden relative">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-neutral-600 mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Select Client Session
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Choose an incoming ticket or live inquiry from the left queue to open the real-time communications console.
              </p>
            </div>
          ) : (
            <>
              {/* Active Ticket Top Bar */}
              <div className="p-4 border-b border-white/[0.08] bg-[#18181c]/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                    {selectedTicket.profiles?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none mb-1 flex items-center gap-2">
                      {selectedTicket.subject}
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/[0.06] text-neutral-400 font-mono">
                        #{selectedTicket.id.slice(0, 8)}
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {selectedTicket.profiles?.full_name || "Trader"} 
                      {selectedTicket.profiles?.email ? ` • ${selectedTicket.profiles.email}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'resolved' ? (
                    <button
                      onClick={async () => {
                        await supabase.from('support_tickets').update({ status: 'resolved', updated_at: new Date().toISOString() }).eq('id', selectedTicket.id);
                        setSelectedTicket({...selectedTicket, status: 'resolved'});
                      }}
                      className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Mark Solved
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await supabase.from('support_tickets').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', selectedTicket.id);
                        setSelectedTicket({...selectedTicket, status: 'in_progress'});
                      }}
                      className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0e0e10]">
                {/* Initial Description Card */}
                <div className="p-3.5 rounded-lg bg-[#18181c] border border-white/[0.06] text-xs text-neutral-300 max-w-[85%]">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">User Inquiry / Context</p>
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                  <span className="text-[9px] text-neutral-600 block mt-2 font-mono">
                    {new Date(selectedTicket.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                {messages.map((msg, i) => {
                  const isAdmin = Boolean(msg.admin_id && msg.admin_id !== selectedTicket.user_id);
                  const parsed = parseChatMessage(msg.message);

                  return (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col gap-1 max-w-[80%] ${isAdmin ? 'ml-auto items-end' : 'items-start'}`}
                    >
                      <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-600/10'
                          : 'bg-[#18181c] border border-white/[0.08] text-neutral-200 rounded-tl-sm'
                      }`}>
                        {parsed.text ? <p className="whitespace-pre-wrap">{parsed.text}</p> : null}
                        
                        {parsed.attachments && parsed.attachments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {parsed.attachments.map((att, aIdx) => {
                              if (att.type === 'image') {
                                return (
                                  <div
                                    key={aIdx}
                                    className="overflow-hidden rounded-lg border border-white/10 cursor-pointer"
                                    onClick={() => setLightboxMedia(att)}
                                  >
                                    <img src={att.url} alt={att.name} className="max-h-56 max-w-full object-cover hover:scale-105 transition-transform" />
                                    <span className="text-[10px] block px-2 py-1 bg-black/60 text-white truncate">{att.name}</span>
                                  </div>
                                );
                              }
                              if (att.type === 'video') {
                                return (
                                  <div key={aIdx} className="overflow-hidden rounded-lg border border-white/10">
                                    <video src={att.url} controls className="max-h-56 max-w-full rounded-lg" />
                                    <span className="text-[10px] block px-2 py-1 bg-black/60 text-white truncate">🎥 {att.name}</span>
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
                                  className="flex items-center gap-2 p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 transition-colors text-white"
                                >
                                  <FileText size={16} className="text-blue-300 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate">{att.name}</p>
                                    {att.size && <span className="text-[9px] opacity-60">{(att.size / 1024).toFixed(1)} KB</span>}
                                  </div>
                                  <Download size={13} className="shrink-0 opacity-80" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-neutral-500 px-1 font-mono">
                        {isAdmin ? 'Human Desk Officer' : 'Trader'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={fileAccept}
                multiple
                className="hidden"
              />

              {/* Staged attachments preview */}
              {stagedAttachments.length > 0 && (
                <div className="px-4 py-2 bg-[#141416] border-t border-white/[0.08] flex gap-2 overflow-x-auto">
                  {stagedAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1e1e24] border border-white/[0.08] text-[11px] font-medium text-white shadow-sm">
                      {att.type === 'image' && <ImageIcon size={12} className="text-blue-400" />}
                      {att.type === 'video' && <Video size={12} className="text-purple-400" />}
                      {att.type === 'document' && <FileText size={12} className="text-emerald-400" />}
                      <span className="max-w-[120px] truncate">{att.name}</span>
                      <button type="button" onClick={() => removeStagedAttachment(idx)} className="text-neutral-400 hover:text-rose-400 ml-1">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3.5 border-t border-white/[0.08] bg-[#141416]">
                <div className="flex items-center gap-3 mb-2 px-1 text-[11px] font-medium text-neutral-400">
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('image')}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    <ImageIcon size={13} className="text-blue-500" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('video')}
                    className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                  >
                    <Video size={13} className="text-purple-500" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('document')}
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <FileText size={13} className="text-emerald-500" />
                    <span>Document</span>
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('all')}
                    title="Attach Any File"
                    className="p-2.5 text-neutral-400 hover:text-white bg-[#1a1a1f] border border-white/[0.08] rounded-lg transition-colors shrink-0"
                  >
                    <Paperclip size={16} />
                  </button>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedTicket.status === 'resolved' ? "Ticket resolved. Mark active to reply." : "Type response to client..."}
                    disabled={selectedTicket.status === 'resolved'}
                    className="bg-[#1a1a1f] border border-white/[0.08] focus:border-blue-500 h-11 rounded-lg px-3.5 text-xs text-white placeholder:text-neutral-500 flex-1 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && stagedAttachments.length === 0) || selectedTicket.status === 'resolved'}
                    className="h-11 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:bg-neutral-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send size={14} /> Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden border border-white/10 bg-[#111]">
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
