import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  CheckCircle2,
  Minimize2,
  Maximize2,
  LifeBuoy,
  User,
  Sparkles,
  Bot
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  parseChatMessage,
  serializeChatMessage,
  uploadSupportAttachment,
  ChatAttachment
} from "@/utils/supportChat";
import { useLocation } from "react-router-dom";

export default function FloatingHelpButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<ChatAttachment | null>(null);
  const [resolvedNotice, setResolvedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState("*/*");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Check user auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch or load active ticket when opened
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const fetchTicket = async () => {
      // Find latest non-resolved ticket
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["open", "in_progress", "in-progress"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setActiveTicket(data[0]);
      } else {
        // Auto-create live chat session
        const { data: newTicket } = await supabase
          .from("support_tickets")
          .insert([
            {
              user_id: user.id,
              subject: `Live Support (${new Date().toLocaleDateString([], { month: "short", day: "numeric" })})`,
              description: `Live chat session initiated by user via floating widget.`,
              status: "open",
              priority: "high"
            }
          ])
          .select()
          .single();

        if (newTicket) {
          setActiveTicket(newTicket);
        }
      }
    };

    fetchTicket();
  }, [isOpen, user?.id]);

  // 3. Fetch messages for active ticket and subscribe to Realtime
  useEffect(() => {
    if (!activeTicket?.id) {
      setMessages([]);
      return;
    }

    const fetchReplies = async () => {
      const { data } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", activeTicket.id)
        .order("created_at", { ascending: true });

      setMessages(data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    fetchReplies();

    // Subscribe to new replies
    const channel = supabase
      .channel(`floating_ticket_${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_replies",
          filter: `ticket_id=eq.${activeTicket.id}`
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `id=eq.${activeTicket.id}`
        },
        (payload) => {
          if (payload.new.status === "resolved") {
            setResolvedNotice(true);
            setActiveTicket((prev: any) => ({ ...prev, status: "resolved" }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTicket?.id]);

  // 4. File picker trigger
  const triggerFilePicker = (acceptType: "all" | "image" | "video" | "document") => {
    let accept = "*/*";
    if (acceptType === "image") accept = "image/*";
    else if (acceptType === "video") accept = "video/*";
    else if (acceptType === "document") accept = ".pdf,.doc,.docx,.txt,.csv,.log,.zip";
    setFileAccept(accept);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    toast.loading("Uploading attachment...", { id: "attach-float" });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const att = await uploadSupportAttachment(file, user?.id);
        if (att) {
          setStagedAttachments((prev) => [...prev, att]);
          toast.success(`Attached ${file.name}`, { id: "attach-float" });
        } else {
          toast.error(`Could not upload ${file.name}`, { id: "attach-float" });
        }
      } catch (err) {
        console.error(err);
        toast.error(`Upload failed for ${file.name}`, { id: "attach-float" });
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedAttachment = (idx: number) => {
    setStagedAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // 5. Send message
  const handleSendMessage = async () => {
    if ((!inputText.trim() && stagedAttachments.length === 0) || !activeTicket) return;
    setIsSending(true);

    const serialized = serializeChatMessage(inputText, stagedAttachments);
    const textSnapshot = inputText.trim();
    const attsSnapshot = [...stagedAttachments];

    setInputText("");
    setStagedAttachments([]);

    const { data, error } = await supabase.from("ticket_replies").insert([
      {
        ticket_id: activeTicket.id,
        admin_id: null,
        message: serialized
      }
    ]).select().single();

    if (error) {
      console.warn("Realtime insert error, using local fallback:", error);
      const fallbackMsg = {
        id: crypto.randomUUID(),
        ticket_id: activeTicket.id,
        admin_id: null,
        message: serialized,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }

    setIsSending(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // 6. Resolve ticket
  const handleMarkResolved = async () => {
    if (!activeTicket) return;
    await supabase.from("support_tickets").update({ status: "resolved" }).eq("id", activeTicket.id);
    setActiveTicket((prev: any) => ({ ...prev, status: "resolved" }));
    setResolvedNotice(true);
    toast.success("Ticket marked as resolved");
  };

  // Only show after user is logged in, and never show on landing/login/auth or admin pages
  const isHiddenRoute =
    !user ||
    location.pathname === "/" ||
    location.pathname === "/landing" ||
    location.pathname === "/landing_clean" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/signup" ||
    location.pathname === "/auth" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/admin");

  if (isHiddenRoute) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Open Live Support"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9990,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#fff",
          boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "#10b981",
            border: "2px solid #fff",
            boxShadow: "0 0 8px #10b981",
          }}
        />
        {isOpen ? <X size={26} strokeWidth={2.2} /> : <MessageSquare size={26} strokeWidth={2.2} />}
      </motion.button>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 64 : 540,
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: 92,
              right: 24,
              zIndex: 9991,
              width: "min(390px, calc(100vw - 32px))",
              background: "#121214",
              borderRadius: 22,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 18px",
                background: "linear-gradient(to bottom, #1a1a1f, #141417)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(59, 130, 246, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                  }}
                >
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>
                      Live Support Desk
                    </h4>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 100,
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        textTransform: "uppercase",
                      }}
                    >
                      HUMAN AGENT ONLINE
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.45)" }}>
                    {activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · Real Human Officer` : "Real Human Assistance"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                  title="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* If Minimized, don't show body */}
            {!isMinimized && (
              <>
                {/* Chat Message Scrollable Area */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    background: "#0c0c0e",
                  }}
                >
                  {/* Resolution Notice Banner */}
                  {resolvedNotice && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#6ee7b7",
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      🎉 This inquiry was resolved! Feel free to send a message anytime if you need more help.
                    </div>
                  )}

                  {/* Intro message */}
                  <div
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: "14px 14px 14px 2px",
                      background: "#1e1e24",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      👋 Hello! You are directly connected with TradiFive's Human Operations Team.
                    </p>
                    <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.55)", marginTop: 4, display: "block" }}>
                      Our real support staff is on desk. Send your messages, MT5 screenshots, videos, or documents below for personal assistance.
                    </span>
                  </div>

                  {/* Messages */}
                  {messages.map((m, idx) => {
                    const isUser = !m.admin_id;
                    const parsed = parseChatMessage(m.message);

                    return (
                      <div
                        key={m.id || idx}
                        style={{
                          alignSelf: isUser ? "flex-end" : "flex-start",
                          maxWidth: "85%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            background: isUser ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#1e1e24",
                            border: isUser ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                            color: "#fff",
                            fontSize: 13,
                            lineHeight: 1.45,
                            wordBreak: "break-word",
                          }}
                        >
                          {parsed.text && <p style={{ margin: 0 }}>{parsed.text}</p>}

                          {/* Render Attachments */}
                          {parsed.attachments && parsed.attachments.length > 0 && (
                            <div style={{ marginTop: parsed.text ? 8 : 0, display: "flex", flexDirection: "column", gap: 6 }}>
                              {parsed.attachments.map((att, aIdx) => {
                                if (att.type === "image") {
                                  return (
                                    <div
                                      key={aIdx}
                                      onClick={() => setLightboxMedia(att)}
                                      style={{
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 10,
                                          padding: "3px 8px",
                                          background: "rgba(0,0,0,0.5)",
                                          display: "block",
                                          color: "rgba(255,255,255,0.8)",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        📷 {att.name}
                                      </span>
                                    </div>
                                  );
                                }
                                if (att.type === "video") {
                                  return (
                                    <div
                                      key={aIdx}
                                      style={{
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                      }}
                                    >
                                      <video
                                        src={att.url}
                                        controls
                                        style={{ width: "100%", maxHeight: 180, display: "block" }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 10,
                                          padding: "3px 8px",
                                          background: "rgba(0,0,0,0.5)",
                                          display: "block",
                                          color: "rgba(255,255,255,0.8)",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        🎥 {att.name}
                                      </span>
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
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "8px 10px",
                                      borderRadius: 10,
                                      background: "rgba(0,0,0,0.25)",
                                      border: "1px solid rgba(255,255,255,0.12)",
                                      textDecoration: "none",
                                      color: "#fff",
                                    }}
                                  >
                                    <FileText size={18} color="#60a5fa" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ fontSize: 12, fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {att.name}
                                      </span>
                                      {att.size && (
                                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                                          {(att.size / 1024).toFixed(1)} KB
                                        </span>
                                      )}
                                    </div>
                                    <Download size={14} color="rgba(255,255,255,0.6)" />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: 10,
                            color: "rgba(255, 255, 255, 0.4)",
                            alignSelf: isUser ? "flex-end" : "flex-start",
                            paddingHorizontal: 4,
                          }}
                        >
                          {isUser ? "You" : "Human Support Officer"} ·{" "}
                          {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Staged Attachments Preview Strip */}
                {stagedAttachments.length > 0 && (
                  <div
                    style={{
                      padding: "8px 14px",
                      background: "#18181c",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                    }}
                  >
                    {stagedAttachments.map((att, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: "#fff",
                        }}
                      >
                        {att.type === "image" && <ImageIcon size={13} color="#60a5fa" />}
                        {att.type === "video" && <Video size={13} color="#a78bfa" />}
                        {att.type === "document" && <FileText size={13} color="#34d399" />}
                        <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {att.name}
                        </span>
                        <button
                          onClick={() => removeStagedAttachment(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "rgba(255,255,255,0.6)",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolve Action Button Bar */}
                {activeTicket && activeTicket.status !== "resolved" && (
                  <div
                    style={{
                      padding: "6px 14px",
                      background: "#141418",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)" }}>
                      Problem solved?
                    </span>
                    <button
                      onClick={handleMarkResolved}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 8,
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        color: "#34d399",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Mark Solved
                    </button>
                  </div>
                )}

                {/* Input Toolbar & Field */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#141418",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={fileAccept}
                    multiple
                    style={{ display: "none" }}
                  />

                  {/* Attachment Shortcuts */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => triggerFilePicker("image")}
                      title="Attach Photo"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                      }}
                    >
                      <ImageIcon size={15} color="#60a5fa" />
                      <span>Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerFilePicker("video")}
                      title="Attach Video"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                      }}
                    >
                      <Video size={15} color="#a78bfa" />
                      <span>Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerFilePicker("document")}
                      title="Attach Document"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                      }}
                    >
                      <FileText size={15} color="#34d399" />
                      <span>Document</span>
                    </button>
                  </div>

                  {/* Input Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 14,
                      padding: "4px 8px 4px 12px",
                    }}
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Type message to human support officer..."
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        fontSize: 13,
                        padding: "8px 0",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => triggerFilePicker("all")}
                      title="Attach File"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        padding: 6,
                      }}
                    >
                      <Paperclip size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isSending || (!inputText.trim() && stagedAttachments.length === 0)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        border: "none",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        opacity: !inputText.trim() && stagedAttachments.length === 0 ? 0.4 : 1,
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxMedia(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#111",
              }}
            >
              <button
                onClick={() => setLightboxMedia(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                <X size={18} />
              </button>
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  display: "block",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  padding: "10px 16px",
                  background: "#18181c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
                  {lightboxMedia.name}
                </span>
                <a
                  href={lightboxMedia.url}
                  download={lightboxMedia.name}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "#2563eb",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Download size={13} />
                  Download
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
