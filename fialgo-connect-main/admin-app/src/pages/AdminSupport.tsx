import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  RefreshCcw,
  Smartphone,
  Laptop,
  Image as ImageIcon, 
  Video, 
  FileText, 
  Download, 
  X,
  Paperclip,
  UserCheck
} from "lucide-react";
import {
  parseChatMessage,
  serializeChatMessage,
  uploadSupportAttachment,
  ChatAttachment
} from "../utils/supportChat";

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
  const [sending, setSending] = useState(false);

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
      // Live Desk strictly includes live support chats
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
      const mapped = liveChats.map(t => ({ ...t, profiles: profileMap[t.user_id] || { full_name: "Trader", email: "" } }));
      setTickets(mapped);
      
      // Auto-select latest active ticket if none currently selected
      setSelectedTicket((prev: any) => {
        if (!prev && mapped.length > 0) {
          return mapped.find(m => m.status !== 'resolved') || mapped[0];
        }
        if (prev) {
          const updated = mapped.find(m => m.id === prev.id);
          return updated || prev;
        }
        return null;
      });
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
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Failed to load replies:", error);
      }
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
    if ((!newMessage.trim() && stagedAttachments.length === 0) || !selectedTicket || sending) return;
    setSending(true);
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
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'in_progress' } : t));
      }
    } else {
      console.error("Message send error:", error);
    }
    setSending(false);
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

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const totalCount = tickets.length;

  return (
    <div className="space-y-5 font-sans pb-4">
      {/* 1. Header aligned with SupportTicketsPage style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Chat Desk
          </h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Real-Time User Messaging Terminal // Web & Mobile Live Stream
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-[#1E1E1E] border border-white/5 rounded flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest font-mono">
                {openCount + inProgressCount} ACTIVE CHATS
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">HUMAN OPERATOR ONLINE</span>
            </div>
          </div>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Sync
          </button>
        </div>
      </div>

      {/* 2. Top KPI Stat Boxes matching Support Tickets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Live Chats", value: openCount + inProgressCount, sub: "Currently Ongoing" },
          { label: "Awaiting Reply", value: openCount, sub: "Needs Attention" },
          { label: "In Progress", value: inProgressCount, sub: "Operator Engaged" },
          { label: "Resolved Today", value: resolvedCount, sub: "Successfully Closed" },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4 shadow-sm">
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white font-mono tracking-tight">{loading ? "..." : s.value}</p>
            <p className="text-[8px] text-neutral-600 uppercase tracking-wider mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Main Split Console with Fixed Viewport and Scroll Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-270px)] min-h-[580px] max-h-[820px] overflow-hidden">
        {/* Left Side: Client Sessions Queue */}
        <div className="lg:col-span-1 bg-[#1E1E1E] border border-white/5 rounded-xl flex flex-col shadow-xl overflow-hidden h-full">
          {/* Search & Channel Filter Bar */}
          <div className="p-3.5 border-b border-white/5 bg-[#17171A] space-y-2.5 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={13} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients or ticket IDs..." 
                className="w-full bg-[#101012] border border-white/5 text-white pl-8 pr-3 py-1.5 text-xs rounded placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[9px] font-bold uppercase tracking-widest">
              {[
                { id: "all", label: "All Chats" },
                { id: "unresolved", label: "Open" },
                { id: "web", label: "💻 Web" },
                { id: "mobile", label: "📱 Mobile" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setChannelFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    channelFilter === f.id
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-[#101012] text-neutral-400 hover:text-white border border-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scrollable List of Chats */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center">
                <LifeBuoy className="mx-auto text-neutral-700 mb-2.5" size={32} />
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Queue Clear // No Active Chats</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const isMobile = isMobileSession(ticket);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3.5 cursor-pointer transition-colors relative border-l-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                          isMobile ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}>
                          {isMobile ? <Smartphone size={9} /> : <Laptop size={9} />}
                          {isMobile ? "MOBILE" : "WEB"}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        ticket.status === 'open' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-neutral-200 mb-1 line-clamp-1">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                      <p className="truncate max-w-[140px] text-neutral-400 font-medium">{ticket.profiles?.full_name || 'Trader'}</p>
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

        {/* Right Side: Conversation Box with Dedicated Internal Scroll View */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-xl flex flex-col shadow-xl overflow-hidden h-full">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-neutral-600 mb-3">
                <MessageSquare size={26} />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                Select Client Live Session
              </h3>
              <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed">
                Choose an incoming ticket or live inquiry from the left queue to open the real-time communications console.
              </p>
            </div>
          ) : (
            <>
              {/* Pinned Top Bar */}
              <div className="p-3.5 border-b border-white/5 bg-[#17171A] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                    {selectedTicket.profiles?.full_name?.charAt(0) || "T"}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none mb-1 flex items-center gap-2">
                      {selectedTicket.subject}
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/[0.04] text-neutral-400">
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
                        setSelectedTicket((prev: any) => prev ? { ...prev, status: 'resolved' } : null);
                        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t));
                      }}
                      className="px-3 py-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Mark Solved
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await supabase.from('support_tickets').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', selectedTicket.id);
                        setSelectedTicket((prev: any) => prev ? { ...prev, status: 'in_progress' } : null);
                        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'in_progress' } : t));
                      }}
                      className="px-3 py-1.5 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Scrollable Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#121214] custom-scrollbar">
                {/* Initial Description Card */}
                <div className="p-3 rounded bg-[#17171A] border border-white/5 text-xs text-neutral-300 max-w-[85%] shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">User Inquiry / Context</p>
                    <span className="text-[9px] text-neutral-600 font-mono">
                      {new Date(selectedTicket.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-neutral-300 text-[12px]">{selectedTicket.description}</p>
                </div>

                {messages.map((msg, i) => {
                  const isAdmin = Boolean(msg.admin_id && msg.admin_id !== selectedTicket.user_id);
                  const parsed = parseChatMessage(msg.message);

                  return (
                    <div
                      key={msg.id || i}
                      className={`flex items-start gap-2 max-w-[85%] ${isAdmin ? 'ml-auto justify-end' : 'justify-start'}`}
                    >
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 uppercase">
                          {selectedTicket.profiles?.full_name?.charAt(0) || "T"}
                        </div>
                      )}
                      
                      <div className={`flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                            : 'bg-[#18181C] border border-white/10 text-neutral-200 rounded-tl-none shadow-sm'
                        }`}>
                          {parsed.text ? <p className="whitespace-pre-wrap text-[13px]">{parsed.text}</p> : null}
                          
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
                                      <img src={att.url} alt={att.name} className="max-h-60 max-w-full object-cover hover:scale-102 transition-transform" />
                                      <span className="text-[10px] block px-2 py-1 bg-black/60 text-white truncate font-mono">{att.name}</span>
                                    </div>
                                  );
                                }
                                if (att.type === 'video') {
                                  return (
                                    <div key={aIdx} className="overflow-hidden rounded-lg border border-white/10">
                                      <video src={att.url} controls className="max-h-60 max-w-full rounded-lg" />
                                      <span className="text-[10px] block px-2 py-1 bg-black/60 text-white truncate font-mono">🎥 {att.name}</span>
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
                                    className="flex items-center gap-2 p-2 rounded bg-black/30 hover:bg-black/50 border border-white/10 transition-colors text-white"
                                  >
                                    <FileText size={15} className="text-blue-300 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold truncate">{att.name}</p>
                                      {att.size && <span className="text-[9px] opacity-60 font-mono">{(att.size / 1024).toFixed(1)} KB</span>}
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

                      {isAdmin && (
                        <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          HQ
                        </div>
                      )}
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
                <div className="px-4 py-2 bg-[#17171A] border-t border-white/5 flex gap-2 overflow-x-auto shrink-0">
                  {stagedAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#202025] border border-white/10 text-[11px] font-medium text-white shadow-sm shrink-0">
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

              {/* Pinned Input Bar at Bottom */}
              <div className="p-3 border-t border-white/5 bg-[#17171A] shrink-0">
                <div className="flex items-center gap-3 mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('image')}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    <ImageIcon size={12} className="text-blue-500" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('video')}
                    className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                  >
                    <Video size={12} className="text-purple-500" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFilePicker('document')}
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <FileText size={12} className="text-emerald-500" />
                    <span>Document</span>
                  </button>
                  {isUploading && (
                    <span className="text-[10px] text-blue-400 animate-pulse ml-auto font-mono">
                      Uploading media...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type reply to trader (press Enter to send)..."
                    className="flex-1 bg-[#101012] border border-white/5 text-white px-3.5 py-2 text-xs rounded placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && stagedAttachments.length === 0) || sending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <Send size={12} className={sending ? "animate-spin" : ""} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setLightboxMedia(null)}
              className="absolute -top-10 right-0 p-2 text-neutral-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <img 
              src={lightboxMedia.url} 
              alt={lightboxMedia.name} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10" 
            />
            <p className="text-white text-xs font-mono mt-3 px-3 py-1 bg-black/50 rounded">{lightboxMedia.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
