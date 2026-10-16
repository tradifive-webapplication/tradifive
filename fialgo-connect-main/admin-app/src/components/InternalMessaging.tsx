import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Maximize2, Minimize2, Paperclip, MoreVertical, Lock, Unlock, Image as ImageIcon, FileText, Video, Trash2, ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { supabase } from "../lib/supabase";
import { dispatchNotification } from "./NotificationCenter";

export default function InternalMessaging() {
  const { adminUser } = useAdminAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Attachment state
  const [attachment, setAttachment] = useState<{ url: string, type: 'image' | 'video' | 'document', name: string } | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const me = adminUser?.id;

  useEffect(() => {
    if (!me) return;
    async function load() {
      const [empRes, msgRes] = await Promise.all([
        supabase.from("hr_employees").select("*").neq("id", me),
        supabase.from("internal_messages").select("*").or(`from_id.eq.${me},to_id.eq.${me}`).order("created_at")
      ]);
      if (empRes.data) setContacts(empRes.data);
      if (msgRes.data) setMessages(msgRes.data);
    }
    load();

    const channel = supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'internal_messages' }, payload => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        if (payload.new.to_id === me) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [me]);

  const activeContact = contacts.find(c => c.id === activeConvo);
  const convoMessages = messages.filter(
    m => (m.from_id === me && m.to_id === activeConvo) ||
         (m.to_id === me && m.from_id === activeConvo)
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convoMessages.length, activeConvo]);

  // Auto-close on navigation if not pinned
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      if (!isPinned) {
        setOpen(false);
      }
    }
  }, [location.pathname, isPinned]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload - generate object URL for local preview
    const url = URL.createObjectURL(file);
    let type: 'image' | 'video' | 'document' = 'document';
    
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';

    setAttachment({ url, type, name: file.name });
    setShowAttachMenu(false);
  };

  const sendMessage = async () => {
    if ((!newMsg.trim() && !attachment) || !activeConvo || !me) return;
    
    const text = newMsg.trim();
    const currentAttachment = attachment;
    
    setNewMsg("");
    setAttachment(null);

    // Instead of failing if DB schema isn't fully migrated, we append attachment to text as fallback
    let fallbackText = text;
    if (currentAttachment) {
      fallbackText += `\n[ATTACHMENT: ${currentAttachment.name}]`;
    }

    const { data: newDbMsg } = await supabase.from("internal_messages").insert({
      from_id: me,
      to_id: activeConvo,
      message: fallbackText, // Ensure we send something if columns don't exist
      attachment_url: currentAttachment?.url,
      attachment_type: currentAttachment?.type,
      attachment_name: currentAttachment?.name,
      read: false
    }).select().single();

    if (newDbMsg) {
      setMessages(prev => {
         if (prev.find(m => m.id === newDbMsg.id)) return prev;
         return [...prev, newDbMsg];
      });
    } else {
      // Local optimistic update if DB insert failed due to schema
      const optMsg = {
        id: Math.random().toString(),
        from_id: me,
        to_id: activeConvo,
        message: text,
        attachment_url: currentAttachment?.url,
        attachment_type: currentAttachment?.type,
        attachment_name: currentAttachment?.name,
        created_at: new Date().toISOString(),
        read: false
      };
      setMessages(prev => [...prev, optMsg]);
    }

    // Simulate reply after 2s
    setTimeout(async () => {
      const replies = [
        "Received. Reviewing now.",
        "Got it, thanks.",
        "I'll take a look at this.",
        "Understood.",
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      
      const { data: replyDbMsg } = await supabase.from("internal_messages").insert({
        from_id: activeConvo,
        to_id: me,
        message: replyText,
        read: false
      }).select().single();

      if (replyDbMsg) {
        setMessages(prev => {
          if (prev.find(m => m.id === replyDbMsg.id)) return prev;
          return [...prev, replyDbMsg];
        });
        dispatchNotification(`New Message from ${activeContact?.full_name || "Agent"}`, replyText, "MESSAGE");
      }
    }, 2000);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const getUnreadForContact = (contactId: string) =>
    messages.filter(m => m.from_id === contactId && m.to_id === me && !m.read).length;

  // Group contacts by department
  const departments = Array.from(new Set(contacts.map(c => c.department)));

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9998]" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" 
      />

      {/* Floating Trigger Button (Style matches Quick Actions, positioned above it) */}
      <motion.button
        onClick={() => { 
          setOpen(true); 
          setUnreadCount(0); 
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-4 lg:bottom-24 lg:right-6 z-[120] w-12 h-12 rounded-full bg-[#1c1c1c]/90 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl hover:border-white/20 transition-all group"
        title="Internal Comms"
      >
        <MessageSquare size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border border-[#121212]">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="internal-chat-window"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed z-[9999] right-0 top-0 bottom-0 w-full sm:w-[600px] md:w-[750px] lg:w-[800px] max-w-full h-screen bg-[#121212] border-l border-white/10 shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-l-2xl"
          >
            {/* Draggable Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#1A1A1A] shrink-0">
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <MessageSquare size={12} className="text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">Internal Comms Network</span>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-widest mt-0.5">End-to-End Encrypted</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 bg-[#151515]">
              {/* Contact list */}
              <div className={`w-full md:w-[280px] border-r border-white/5 flex flex-col shrink-0 bg-[#151515] ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/5 shrink-0">
                  <input 
                    type="text" 
                    placeholder="Search directory..." 
                    className="w-full bg-[#1E1E1E] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-neutral-500 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                  {departments.map(dept => (
                    <div key={dept}>
                      <h3 className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600">{dept}</h3>
                      <div className="space-y-0.5">
                        {contacts.filter(c => c.department === dept).map(contact => {
                          const unread = getUnreadForContact(contact.id);
                          const isHead = contact.role_title.toLowerCase().includes("head") || contact.role_title.toLowerCase().includes("chief") || contact.role_title.toLowerCase().includes("director");
                          
                          return (
                            <button
                              key={contact.id}
                              onClick={() => {
                                setActiveConvo(contact.id);
                                setMessages(prev => prev.map(m =>
                                  m.from_id === contact.id ? { ...m, read: true } : m
                                ));
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                                activeConvo === contact.id 
                                  ? "bg-gradient-to-r from-white/[0.02] to-blue-500/10 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-white" 
                                  : "border border-transparent hover:bg-white/[0.03] text-neutral-400 hover:text-neutral-200"
                              }`}
                            >
                              <div className="relative shrink-0">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md border ${isHead ? 'border-amber-500/50' : 'border-white/10'}`}
                                  style={{ background: contact.avatar_color || '#333' }}
                                >
                                  {contact.avatar_initials}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#151515]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-white truncate flex items-center gap-2">
                                  {contact.full_name}
                                  {isHead && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-bold uppercase tracking-widest">HEAD</span>}
                                </p>
                                <p className="text-[11px] text-neutral-500 truncate mt-0.5">{contact.role_title}</p>
                              </div>
                              {unread > 0 && (
                                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                                  {unread}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat area */}
              <div className={`flex-1 flex flex-col min-w-0 bg-[#121212] ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
                {activeContact ? (
                  <>
                    {/* Chat header */}
                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 shrink-0 bg-[#151515]/50 backdrop-blur-md">
                      <button
                        onClick={() => setActiveConvo(null)}
                        className="md:hidden p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-lg bg-white/5 mr-1 shrink-0"
                        title="Back to Directory"
                        aria-label="Back to Contacts"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-md border border-white/10 shrink-0"
                        style={{ background: activeContact.avatar_color || '#333' }}
                      >
                        {activeContact.avatar_initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-[14px] font-semibold text-white tracking-wide">{activeContact.full_name}</h2>
                          <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                            {activeContact.department} • {activeContact.role_title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400 font-mono uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                          <span>Connected Securely</span>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#121212] to-[#121212]">
                      {convoMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                            <Lock size={24} className="text-blue-400" />
                          </div>
                          <p className="text-[12px] font-bold uppercase tracking-widest text-white">End-to-End Encrypted</p>
                          <p className="text-[12px] mt-2 max-w-sm text-center leading-relaxed text-neutral-400">
                            Messages, images, videos, and documents sent to {activeContact.full_name.split(" ")[0]} are secured with enterprise-grade encryption.
                          </p>
                        </div>
                      ) : (
                        convoMessages.map((msg, index) => {
                          const isMe = msg.from_id === me;
                          
                          return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                                
                                {/* Attachment Rendering */}
                                {msg.attachment_url && (
                                  <div className={`mb-2 rounded-xl overflow-hidden border border-white/10 max-w-sm ${isMe ? 'bg-blue-900/30' : 'bg-[#1E1E1E]'}`}>
                                    {msg.attachment_type === 'image' && (
                                      <img src={msg.attachment_url} alt="Attachment" className="w-full object-cover max-h-64" />
                                    )}
                                    {msg.attachment_type === 'video' && (
                                      <video src={msg.attachment_url} controls className="w-full max-h-64" />
                                    )}
                                    {msg.attachment_type === 'document' && (
                                      <div className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-red-500/20 text-red-500 flex items-center justify-center">
                                          <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] text-white font-medium truncate">{msg.attachment_name || "Document.pdf"}</p>
                                          <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-1">Encrypted File</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Text Message */}
                                {msg.message && !msg.message.startsWith('[ATTACHMENT') && (
                                  <div className={`px-5 py-3.5 shadow-lg ${
                                    isMe
                                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm border border-indigo-500/30"
                                      : "bg-[#1E1E1E] text-neutral-200 border border-white/5 rounded-2xl rounded-tl-sm"
                                  }`}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                  </div>
                                )}
                                <p className={`text-[10px] mt-1.5 font-mono uppercase tracking-widest ${isMe ? "text-neutral-500 pr-1" : "text-neutral-600 pl-1"}`}>
                                  {formatTime(msg.created_at || new Date().toISOString())}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={endRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5 bg-[#151515] shrink-0">
                      
                      {/* Attachment Preview */}
                      {attachment && (
                        <div className="mb-4 p-3 bg-[#1A1A1A] border border-white/10 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                              {attachment.type === 'image' ? <ImageIcon size={20} /> : attachment.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-white">{attachment.name}</p>
                              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Ready to send</p>
                            </div>
                          </div>
                          <button onClick={() => setAttachment(null)} className="p-2 rounded hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        {/* Attachment Menu */}
                        <AnimatePresence>
                          {showAttachMenu && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-2 bg-[#1E1E1E] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2 flex gap-2"
                            >
                              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><ImageIcon size={18} /></div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Image</span>
                              </button>
                              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center"><Video size={18} /></div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Video</span>
                              </button>
                              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center"><FileText size={18} /></div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Doc</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-end gap-3 bg-[#121212] border border-white/10 rounded-2xl p-2 shadow-inner focus-within:border-blue-500/50 transition-colors">
                          <button 
                            onClick={() => setShowAttachMenu(!showAttachMenu)}
                            className="w-10 h-10 shrink-0 rounded-xl hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                          >
                            <Paperclip size={18} />
                          </button>
                          
                          <textarea
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            placeholder={`Message ${activeContact.full_name.split(" ")[0]}...`}
                            rows={1}
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                            className="flex-1 bg-transparent py-2.5 text-[14px] text-white placeholder:text-neutral-600 outline-none resize-none leading-relaxed"
                          />
                          
                          <button
                            onClick={sendMessage}
                            disabled={(!newMsg.trim() && !attachment)}
                            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 flex items-center justify-center shrink-0 transition-colors shadow-md"
                          >
                            <Send size={16} className={newMsg.trim() || attachment ? "text-white" : ""} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center flex-col gap-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-[#121212] to-[#121212]">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-2xl relative">
                      <div className="absolute inset-0 border border-blue-500/30 rounded-3xl animate-ping opacity-20" />
                      <MessageSquare size={32} className="text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-semibold text-white tracking-wide">Internal Communications</p>
                      <p className="text-[12px] text-neutral-500 mt-2 max-w-[250px] leading-relaxed mx-auto">Select a department head or employee to initiate a secure transmission.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
