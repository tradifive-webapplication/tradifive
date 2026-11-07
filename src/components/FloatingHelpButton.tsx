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
  Minus,
  LifeBuoy,
  RotateCcw
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
  const [isBig, setIsBig] = useState<boolean>(() => {
    try {
      return localStorage.getItem("tf_support_window_size") === "big";
    } catch {
      return false;
    }
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<ChatAttachment | null>(null);
  const [resolvedNotice, setResolvedNotice] = useState(false);

  // ── Drag & Repositioning Logic (Allows user to move button anywhere along bottom or right side) ──
  const [btnPos, setBtnPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem("tf_support_btn_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return parsed;
        }
      }
    } catch {}
    return { x: 0, y: 0 };
  });

  const isDraggingRef = useRef(false);
  const [dragConstraints, setDragConstraints] = useState({ top: -600, bottom: 12, left: -1000, right: 12 });

  useEffect(() => {
    const updateBounds = () => {
      if (typeof window !== "undefined") {
        setDragConstraints({
          top: -(window.innerHeight - 90),
          bottom: 12,
          left: -(window.innerWidth - 80),
          right: 12,
        });
      }
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState("*/*");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleWindowSize = () => {
    const next = !isBig;
    setIsBig(next);
    try {
      localStorage.setItem("tf_support_window_size", next ? "big" : "normal");
    } catch {}
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

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

  // 2. Fetch or load active ticket when opened or user identified
  useEffect(() => {
    if (!user?.id) return;

    const fetchTicket = async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["open", "in_progress", "in-progress"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setActiveTicket(data[0]);
      } else if (isOpen) {
        // Auto-create live chat session if window is opened and no active ticket exists
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

  // 3. Fetch replies, subscribe to Realtime, and maintain 3s polling backup
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

      if (data) {
        setMessages(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };

    fetchReplies();

    // Realtime channel
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
          if (payload.new.admin_id && (!isOpen || isMinimized)) {
            setUnreadCount((c) => c + 1);
          }
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

    // 3-second polling sync fallback
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", activeTicket.id)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setMessages((prev) => {
          if (data.length > prev.length) {
            const newCount = data.length - prev.length;
            const newItems = data.slice(prev.length);
            if (newItems.some((m) => m.admin_id) && (!isOpen || isMinimized)) {
              setUnreadCount((c) => c + newCount);
            }
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            return data;
          }
          return prev;
        });
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeTicket?.id, isOpen, isMinimized]);

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
    toast.success("Ticket marked as solved");
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
      {/* Floating Action Button (Movable / Draggable anywhere on bottom or right side) */}
      <motion.button
        drag
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={dragConstraints}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={(_, info) => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 120);
          setBtnPos((prev) => {
            const nextX = Math.min(dragConstraints.right, Math.max(dragConstraints.left, prev.x + info.offset.x));
            const nextY = Math.min(dragConstraints.bottom, Math.max(dragConstraints.top, prev.y + info.offset.y));
            const next = { x: nextX, y: nextY };
            try {
              localStorage.setItem("tf_support_btn_pos", JSON.stringify(next));
            } catch {}
            return next;
          });
        }}
        animate={{ x: btnPos.x, y: btnPos.y }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        onClick={() => {
          if (isDraggingRef.current) return;
          if (isOpen) {
            setIsOpen(false);
          } else {
            handleOpen();
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setBtnPos({ x: 0, y: 0 });
          try {
            localStorage.removeItem("tf_support_btn_pos");
          } catch {}
          toast.success("Support button reset to default bottom-right position");
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        whileDrag={{ scale: 1.12, boxShadow: "0 20px 35px -5px rgba(37, 99, 235, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.4)" }}
        aria-label="Open Live Support Desk"
        title="Drag to reposition anywhere · Double-click to reset position · Click to open Support Desk"
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
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          border: "none",
        }}
      >
        {/* Pulsing online green dot if no unread messages */}
        {unreadCount === 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#10b981",
              border: "2px solid #fff",
              boxShadow: "0 0 8px #10b981" }}
          />
        )}

        {/* Glowing red unread badge when admin replied */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              background: "#ef4444",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              border: "2px solid #0f172a",
              boxShadow: "0 0 12px rgba(239, 68, 68, 0.9)" }}
          >
            {unreadCount}
          </motion.div>
        )}

        {isOpen ? <X size={26} strokeWidth={2.2} /> : <MessageSquare size={26} strokeWidth={2.2} />}
      </motion.button>

      {/* Floating Chat Window with Customizable Sizing (Big or Small) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isMinimized
                ? "min(340px, calc(100vw - 32px))"
                : isBig
                ? "min(760px, calc(100vw - 32px))"
                : "min(400px, calc(100vw - 32px))",
              height: isMinimized
                ? 62
                : isBig
                ? "min(780px, calc(100vh - 120px))"
                : 560 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: (typeof window !== "undefined" && btnPos.y < -(window.innerHeight / 2)) ? undefined : 92,
              top: (typeof window !== "undefined" && btnPos.y < -(window.innerHeight / 2)) ? 92 : undefined,
              right: (typeof window !== "undefined" && btnPos.x < -(window.innerWidth / 2)) ? undefined : 24,
              left: (typeof window !== "undefined" && btnPos.x < -(window.innerWidth / 2)) ? 24 : undefined,
              zIndex: 9991,
              background: "#121214",
              borderRadius: 20,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden" }}
          >
            {/* Header: Human-Made & Sizing Controls */}
            <div
              style={{
                padding: "12px 16px",
                background: "linear-gradient(to bottom, #1a1a1f, #141417)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(59, 130, 246, 0.18)",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa" }}
                >
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>
                      Live Support Desk
                    </h4>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 7px",
                        borderRadius: 100,
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.25)" }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#10b981",
                          boxShadow: "0 0 6px #10b981" }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#34d399",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em" }}
                      >
                        Online
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>
                    {activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · Support Team` : "Support Desk"}
                  </span>
                </div>
              </div>

              {/* Window Controls: Big/Small Toggle, Minimize, Close */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {(btnPos.x !== 0 || btnPos.y !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBtnPos({ x: 0, y: 0 });
                      try {
                        localStorage.removeItem("tf_support_btn_pos");
                      } catch {}
                      toast.success("Button reset to default bottom-right position");
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "rgba(255, 255, 255, 0.75)",
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Reset button position to default bottom-right"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleWindowSize}
                  style={{
                    background: isBig ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.06)",
                    border: isBig ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.12)",
                    color: isBig ? "#60a5fa" : "rgba(255, 255, 255, 0.75)",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    transition: "all 0.15s ease" }}
                  title={isBig ? "Switch to Compact View (Small)" : "Expand to Spacious View (Big)"}
                >
                  {isBig ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  <span>{isBig ? "Compact" : "Expand"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "rgba(255, 255, 255, 0.75)",
                    cursor: "pointer",
                    padding: "4px 6px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center" }}
                  title={isMinimized ? "Restore Window" : "Minimize Window"}
                >
                  <Minus size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "rgba(255, 255, 255, 0.75)",
                    cursor: "pointer",
                    padding: "4px 6px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center" }}
                  title="Close Desk"
                >
                  <X size={14} />
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
                    padding: isBig ? "20px 24px" : "16px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    background: "#0c0c0e" }}
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
                        textAlign: "center" }}
                    >
                      🎉 This inquiry was resolved! Feel free to send a message anytime if you need more help.
                    </div>
                  )}

                  {/* Intro message: Human-Made & Welcoming */}
                  <div
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: isBig ? "70%" : "85%",
                      padding: "12px 16px",
                      borderRadius: "14px 14px 14px 2px",
                      background: "#1a1a20",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: 13,
                      lineHeight: 1.5 }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, color: "#fff" }}>
                      👋 Hi! Welcome to TradiFive Support. How can we help you today?
                    </p>
                    <span style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.6)", marginTop: 4, display: "block" }}>
                      Feel free to message us with questions about your algo, MT5 setup, or account. You can also attach screenshots and files below.
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
                          maxWidth: isBig ? "72%" : "85%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4 }}
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
                            wordBreak: "break-word" }}
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
                                        cursor: "pointer" }}
                                    >
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        style={{
                                          width: "100%",
                                          maxHeight: isBig ? 340 : 180,
                                          objectFit: "contain",
                                          display: "block",
                                          background: "#050505" }}
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
                                          whiteSpace: "nowrap" }}
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
                                        border: "1px solid rgba(255,255,255,0.2)" }}
                                    >
                                      <video
                                        src={att.url}
                                        controls
                                        style={{
                                          width: "100%",
                                          maxHeight: isBig ? 320 : 180,
                                          display: "block" }}
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
                                          whiteSpace: "nowrap" }}
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
                                      color: "#fff" }}
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
                            paddingLeft: 4,
                            paddingRight: 4 }}
                        >
                          {isUser ? "You" : "TradiFive Support"} ·{" "}
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
                      overflowX: "auto" }}
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
                          color: "#fff" }}
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
                            display: "flex" }}
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
                      alignItems: "center" }}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)" }}>
                      Problem solved?
                    </span>
                    <button
                      onClick={handleMarkResolved}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 100,
                        background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
                        border: "1px solid rgba(52, 211, 153, 0.3)",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.25)",
                        color: "#34d399",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)"
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Mark Solved</span>
                    </button>
                  </div>
                )}

                {/* Input Toolbar & Field */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#141418",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
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
                        fontSize: 11 }}
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
                        fontSize: 11 }}
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
                        fontSize: 11 }}
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
                      padding: "4px 8px 4px 12px" }}
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Type your message here (Press Enter to send)..."
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        fontSize: 13,
                        padding: "8px 0" }}
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
                        padding: 6 }}
                    >
                      <Paperclip size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isSending || (!inputText.trim() && stagedAttachments.length === 0)}
                      className="w-[34px] h-[34px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-[0.985] disabled:opacity-40 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_3px_rgba(0,0,0,0.06)] dark:bg-gradient-to-r dark:from-[#1e293b] dark:to-[#0f172a] dark:text-[#60a5fa] dark:border-none dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(0,0,0,0.3)]"
                    >
                      {isSending ? (
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid rgba(96, 165, 250, 0.3)",
                            borderTopColor: "#60a5fa",
                            animation: "spin 0.8s linear infinite" }}
                        />
                      ) : (
                        <Send size={15} style={{ marginLeft: 1 }} />
                      )}
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
              padding: 24 }}
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
                background: "#111" }}
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
                  zIndex: 10 }}
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
                  objectFit: "contain" }}
              />
              <div
                style={{
                  padding: "10px 16px",
                  background: "#18181c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between" }}
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
                    gap: 6 }}
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
