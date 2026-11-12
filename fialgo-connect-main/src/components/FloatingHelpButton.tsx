import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
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
  RotateCcw,
  AlertCircle,
  Lightbulb,
  Mail
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  parseChatMessage,
  serializeChatMessage,
  uploadSupportAttachment,
  ChatAttachment
} from "@/utils/supportChat";
import { useLocation, useNavigate } from "react-router-dom";
import ReportProblemModal from "./ReportProblemModal";
import SuggestFeatureModal from "./SuggestFeatureModal";

export default function FloatingHelpButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [inboxUnread, setInboxUnread] = useState(0);
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

  // ── Reactive Dark / Light Theme Detection ──
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    const updateTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("storage", updateTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  // ── Drag & Drop Persistence (Zero-Reset, Drops Wherever Released) ──
  const [btnPos, setBtnPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem("tf_support_btn_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch {}
    return { x: 0, y: 0 };
  });

  const [activeCorner, setActiveCorner] = useState<"bottom-right" | "bottom-left" | "top-left" | "top-right">(() => {
    try {
      const savedCorner = localStorage.getItem("tf_support_corner");
      if (savedCorner === "bottom-left" || savedCorner === "top-left" || savedCorner === "top-right" || savedCorner === "bottom-right") {
        return savedCorner;
      }
    } catch {}
    return "bottom-right";
  });

  const x = useMotionValue(btnPos.x);
  const y = useMotionValue(btnPos.y);

  // Keep motion values synced with state
  useEffect(() => {
    x.set(btnPos.x);
    y.set(btnPos.y);
  }, [btnPos.x, btnPos.y]);

  const [hasMoved, setHasMoved] = useState(() => btnPos.x !== 0 || btnPos.y !== 0);
  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragJustEndedRef = useRef(false);

  // ── High-Performance Global Window Pointer Drag ──
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = x.get();
    const startY = y.get();

    let hasDragged = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startClientX;
      const deltaY = moveEv.clientY - startClientY;

      if (!hasDragged && Math.hypot(deltaX, deltaY) > 4) {
        hasDragged = true;
        isDraggingRef.current = true;
        setIsCurrentlyDragging(true);
      }

      if (hasDragged) {
        let newX = startX + deltaX;
        let newY = startY + deltaY;

        if (typeof window !== "undefined") {
          const maxLeft = -(window.innerWidth - 74);
          const maxTop = -(window.innerHeight - 74);
          newX = Math.min(8, Math.max(maxLeft, newX));
          newY = Math.min(8, Math.max(maxTop, newY));
        }

        x.set(newX);
        y.set(newY);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      setIsCurrentlyDragging(false);

      if (hasDragged) {
        // Drag finished: store position permanently without resetting
        dragJustEndedRef.current = true;
        setTimeout(() => {
          dragJustEndedRef.current = false;
          isDraggingRef.current = false;
        }, 120);

        const curX = x.get();
        const curY = y.get();

        setBtnPos({ x: curX, y: curY });
        setHasMoved(curX !== 0 || curY !== 0);

        const isLeft = typeof window !== "undefined" && curX < -(window.innerWidth - 106) / 2;
        const isTop = typeof window !== "undefined" && curY < -(window.innerHeight - 106) / 2;
        const quadrant = isTop ? (isLeft ? "top-left" : "top-right") : (isLeft ? "bottom-left" : "bottom-right");
        setActiveCorner(quadrant);

        try {
          localStorage.setItem("tf_support_btn_pos", JSON.stringify({ x: curX, y: curY }));
          localStorage.setItem("tf_support_corner", quadrant);
        } catch {}
      } else {
        isDraggingRef.current = false;
        // Clean single click -> toggle support chat window
        if (!dragJustEndedRef.current) {
          if (isOpen) {
            setIsOpen(false);
          } else {
            handleOpen();
          }
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const handleResetPos = () => {
    animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
    animate(y, 0, { type: "spring", stiffness: 400, damping: 28 });
    setBtnPos({ x: 0, y: 0 });
    setHasMoved(false);
    setActiveCorner("bottom-right");
    try {
      localStorage.removeItem("tf_support_btn_pos");
      localStorage.removeItem("tf_support_corner");
    } catch {}
    toast.success("Support button reset to bottom-right corner");
  };

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

  // Fetch unread inbox messages for Mailbox badge in footer
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => {
        if (typeof count === "number") setInboxUnread(count);
      });
  }, [user?.id]);

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
      {/* Bottom Floating Action Dock (Report, Suggest, Help - matches requested layout & Picture 3) */}
      {/* ── 1. Bottom Footer Action Strip (Down below the white page, exactly matching Reference Image 3) ── */}
      <div
        style={{
          position: "fixed",
          bottom: 8,
          right: 28,
          zIndex: 9988,
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 12,
          fontWeight: 500,
          color: isDark ? "rgba(255, 255, 255, 0.55)" : "#64748b",
          userSelect: "none",
        }}
      >
        {/* Mailbox Link */}
        <button
          type="button"
          onClick={() => navigate("/inbox")}
          title="Open Inbox"
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 5.5,
            cursor: "pointer",
            color: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            padding: 0,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#ffffff" : "#0f172a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255, 255, 255, 0.55)" : "#64748b")}
        >
          <Mail size={13.5} />
          <span>Mailbox</span>
          {inboxUnread > 0 && (
            <span
              style={{
                padding: "1px 6px",
                borderRadius: 9999,
                background: isDark ? "#ffffff" : "#0f172a",
                color: isDark ? "#0f172a" : "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {inboxUnread}
            </span>
          )}
        </button>

        {/* Suggest Link (Opens bottom sheet with backside page scale & blur) */}
        <button
          type="button"
          onClick={() => setShowSuggestModal(true)}
          title="Suggest a Feature"
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 5.5,
            cursor: "pointer",
            color: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            padding: 0,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#ffffff" : "#0f172a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255, 255, 255, 0.55)" : "#64748b")}
        >
          <Lightbulb size={13.5} className="text-amber-500" />
          <span>Suggest</span>
        </button>

        {/* Report Link (Opens bottom sheet with backside page scale & blur) */}
        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          title="Report a Problem"
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 5.5,
            cursor: "pointer",
            color: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            padding: 0,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#ffffff" : "#0f172a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255, 255, 255, 0.55)" : "#64748b")}
        >
          <AlertCircle size={13.5} className="text-rose-500" />
          <span>Report</span>
        </button>
      </div>

      {/* ── 2. Help Circle Button (Corner of white page, above footer strip - matches Image 3) ── */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Live Support Desk"
        title="Help & Support Desk"
        style={{
          position: "fixed",
          bottom: 34,
          right: 28,
          zIndex: 9989,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "none",
          boxShadow: isDark
            ? "0 10px 25px -4px rgba(37, 99, 235, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.2)"
            : "0 10px 25px -4px rgba(37, 99, 235, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3)",
          userSelect: "none",
          transition: "all 0.15s ease",
        }}
      >
        {/* Pulsing online green dot (Picture 3) */}
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
              border: "2px solid #ffffff",
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.8)",
            }}
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
              top: -3,
              right: -3,
              minWidth: 19,
              height: 19,
              borderRadius: 10,
              background: "#ef4444",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid #ffffff",
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.9)",
            }}
          >
            {unreadCount}
          </motion.div>
        )}

        {isOpen ? <X size={20} strokeWidth={2.4} /> : <MessageSquare size={20} strokeWidth={2.4} />}
      </motion.button>

      {/* Modals for Report a Problem & Suggest a Feature */}
      <ReportProblemModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={user?.id}
        username={user?.user_metadata?.username || user?.email?.split('@')[0]}
      />

      <SuggestFeatureModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        userId={user?.id}
        username={user?.user_metadata?.username || user?.email?.split('@')[0]}
      />

      {/* Floating Chat Window with Adaptive Light/Dark Theme & Human Big-Tech Finish */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
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
                ? 64
                : isBig
                ? "min(780px, calc(100vh - 120px))"
                : 570
            }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: activeCorner.startsWith("bottom") ? 92 : undefined,
              top: activeCorner.startsWith("top") ? 92 : undefined,
              right: activeCorner.endsWith("right") ? 24 : undefined,
              left: activeCorner.endsWith("left") ? 24 : undefined,
              zIndex: 9991,
              background: isDark ? "#121214" : "#ffffff",
              borderRadius: 20,
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(226, 232, 240, 0.9)",
              boxShadow: isDark
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.06)"
                : "0 20px 50px -10px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header: Clean Big-Tech Layout (Single-line title, compact status & uniform icon controls) */}
            <div
              style={{
                padding: "12px 16px",
                background: isDark
                  ? "linear-gradient(to bottom, #18181d, #121215)"
                  : "linear-gradient(to bottom, #ffffff, #f8fafc)",
                borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(226, 232, 240, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                gap: 10
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "nowrap" }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isDark ? "#ffffff" : "#0f172a",
                      margin: 0,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    Live Support Desk
                  </h4>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 6.5px",
                      borderRadius: 100,
                      background: isDark ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
                      border: isDark ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid #a7f3d0",
                      flexShrink: 0
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 6px #10b981"
                      }}
                    />
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: isDark ? "#34d399" : "#059669",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em"
                      }}
                    >
                      Online
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: isDark ? "rgba(255, 255, 255, 0.45)" : "#64748b",
                    display: "block",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · Support Team` : "TradiFive Customer Support"}
                </span>
              </div>

              {/* Window Controls: Reset, Expand/Compact, Minimize, Close (Uniform 28x28 icon buttons) */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                {hasMoved && (
                  <button
                    type="button"
                    onClick={handleResetPos}
                    style={{
                      width: 28,
                      height: 28,
                      background: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
                      color: isDark ? "rgba(255, 255, 255, 0.75)" : "#475569",
                      cursor: "pointer",
                      padding: 0,
                      borderRadius: 7,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                    title="Reset button position to default corner"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleWindowSize}
                  style={{
                    width: 28,
                    height: 28,
                    background: isBig
                      ? (isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(37, 99, 235, 0.1)")
                      : (isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9"),
                    border: isBig
                      ? (isDark ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(37, 99, 235, 0.25)")
                      : (isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0"),
                    color: isBig
                      ? (isDark ? "#60a5fa" : "#2563eb")
                      : (isDark ? "rgba(255, 255, 255, 0.75)" : "#475569"),
                    cursor: "pointer",
                    padding: 0,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease"
                  }}
                  title={isBig ? "Switch to Compact View" : "Expand to Spacious View"}
                >
                  {isBig ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    width: 28,
                    height: 28,
                    background: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
                    color: isDark ? "rgba(255, 255, 255, 0.75)" : "#475569",
                    cursor: "pointer",
                    padding: 0,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease"
                  }}
                  title={isMinimized ? "Restore Window" : "Minimize Window"}
                >
                  <Minus size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    background: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
                    color: isDark ? "rgba(255, 255, 255, 0.75)" : "#475569",
                    cursor: "pointer",
                    padding: 0,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease"
                  }}
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
                    padding: isBig ? "20px 24px" : "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    background: isDark ? "#0c0c0e" : "#f8fafc"
                  }}
                >
                  {/* Resolution Notice Banner */}
                  {resolvedNotice && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: isDark ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
                        border: isDark ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #a7f3d0",
                        color: isDark ? "#6ee7b7" : "#065f46",
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "center"
                      }}
                    >
                      🎉 This inquiry was resolved! Feel free to send a message anytime if you need more help.
                    </div>
                  )}

                  {/* Intro greeting card: Welcoming & Human Big-Tech finish */}
                  <div
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: isBig ? "70%" : "88%",
                      padding: "13px 16px",
                      borderRadius: "16px 16px 16px 4px",
                      background: isDark ? "#18181d" : "#ffffff",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                      boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                      color: isDark ? "rgba(255, 255, 255, 0.9)" : "#334155",
                      fontSize: 13,
                      lineHeight: 1.5
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 650, color: isDark ? "#ffffff" : "#0f172a", fontSize: 13.5 }}>
                      👋 Hi! Welcome to TradiFive Support. How can we help you today?
                    </p>
                    <span
                      style={{
                        fontSize: 12,
                        color: isDark ? "rgba(255, 255, 255, 0.6)" : "#64748b",
                        marginTop: 4,
                        display: "block"
                      }}
                    >
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
                          gap: 4
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            background: isUser
                              ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                              : isDark
                              ? "#1c1c22"
                              : "#ffffff",
                            border: isUser
                              ? "none"
                              : isDark
                              ? "1px solid rgba(255, 255, 255, 0.08)"
                              : "1px solid #e2e8f0",
                            boxShadow: isUser
                              ? "0 1px 2px rgba(37,99,235,0.2)"
                              : isDark
                              ? "none"
                              : "0 1px 3px rgba(0,0,0,0.04)",
                            color: isUser ? "#ffffff" : isDark ? "#ffffff" : "#0f172a",
                            fontSize: 13,
                            lineHeight: 1.45,
                            wordBreak: "break-word"
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
                                        border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #cbd5e1",
                                        cursor: "pointer"
                                      }}
                                    >
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        style={{
                                          width: "100%",
                                          maxHeight: isBig ? 340 : 180,
                                          objectFit: "contain",
                                          display: "block",
                                          background: isDark ? "#050505" : "#f1f5f9"
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 10,
                                          padding: "3px 8px",
                                          background: isDark ? "rgba(0,0,0,0.5)" : "#f8fafc",
                                          display: "block",
                                          color: isDark ? "rgba(255,255,255,0.8)" : "#475569",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap"
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
                                        border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #cbd5e1"
                                      }}
                                    >
                                      <video
                                        src={att.url}
                                        controls
                                        style={{
                                          width: "100%",
                                          maxHeight: isBig ? 320 : 180,
                                          display: "block"
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 10,
                                          padding: "3px 8px",
                                          background: isDark ? "rgba(0,0,0,0.5)" : "#f8fafc",
                                          display: "block",
                                          color: isDark ? "rgba(255,255,255,0.8)" : "#475569",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap"
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
                                      background: isDark ? "rgba(0,0,0,0.25)" : "#f1f5f9",
                                      border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e2e8f0",
                                      textDecoration: "none",
                                      color: isDark ? "#ffffff" : "#0f172a"
                                    }}
                                  >
                                    <FileText size={18} color="#3b82f6" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span
                                        style={{
                                          fontSize: 12,
                                          fontWeight: 650,
                                          display: "block",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap"
                                        }}
                                      >
                                        {att.name}
                                      </span>
                                      {att.size && (
                                        <span style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>
                                          {(att.size / 1024).toFixed(1)} KB
                                        </span>
                                      )}
                                    </div>
                                    <Download size={14} color={isDark ? "rgba(255,255,255,0.6)" : "#64748b"} />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: 10,
                            color: isDark ? "rgba(255, 255, 255, 0.4)" : "#94a3b8",
                            alignSelf: isUser ? "flex-end" : "flex-start",
                            paddingLeft: 4,
                            paddingRight: 4
                          }}
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
                      background: isDark ? "#18181c" : "#f1f5f9",
                      borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
                      display: "flex",
                      gap: 8,
                      overflowX: "auto"
                    }}
                  >
                    {stagedAttachments.map((att, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                          border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: isDark ? "#ffffff" : "#0f172a"
                        }}
                      >
                        {att.type === "image" && <ImageIcon size={13} color="#3b82f6" />}
                        {att.type === "video" && <Video size={13} color="#8b5cf6" />}
                        {att.type === "document" && <FileText size={13} color="#10b981" />}
                        <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {att.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStagedAttachment(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isDark ? "rgba(255,255,255,0.6)" : "#64748b",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex"
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
                      padding: "7px 16px",
                      background: isDark ? "#131317" : "#f8fafc",
                      borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: isDark ? "rgba(255, 255, 255, 0.45)" : "#64748b", fontWeight: 500 }}>
                      Problem solved?
                    </span>
                    <button
                      type="button"
                      onClick={handleMarkResolved}
                      style={{
                        padding: "5px 13px",
                        borderRadius: 100,
                        background: isDark
                          ? "linear-gradient(135deg, #064e3b 0%, #022c22 100%)"
                          : "#10b981",
                        border: isDark ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid #059669",
                        boxShadow: isDark
                          ? "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.25)"
                          : "0 1px 3px rgba(16, 185, 129, 0.25)",
                        color: isDark ? "#34d399" : "#ffffff",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease"
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
                    padding: "11px 16px 14px",
                    background: isDark ? "#131317" : "#ffffff",
                    borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0"
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => triggerFilePicker("image")}
                      title="Attach Photo"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        color: isDark ? "rgba(255,255,255,0.75)" : "#475569",
                        cursor: "pointer",
                        padding: "3px 8px",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 500,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <ImageIcon size={13} color="#3b82f6" />
                      <span>Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerFilePicker("video")}
                      title="Attach Video"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        color: isDark ? "rgba(255,255,255,0.75)" : "#475569",
                        cursor: "pointer",
                        padding: "3px 8px",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 500,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <Video size={13} color="#8b5cf6" />
                      <span>Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerFilePicker("document")}
                      title="Attach Document"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        color: isDark ? "rgba(255,255,255,0.75)" : "#475569",
                        cursor: "pointer",
                        padding: "3px 8px",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 500,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <FileText size={13} color="#10b981" />
                      <span>Document</span>
                    </button>
                  </div>

                  {/* Input Row: Systemic & Proper Fit */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                      border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                      borderRadius: 14,
                      padding: "4px 6px 4px 12px",
                      transition: "border-color 0.15s ease"
                    }}
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Type a message... (Enter to send)"
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: isDark ? "#ffffff" : "#0f172a",
                        fontSize: 13,
                        padding: "7px 0",
                        minWidth: 0
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => triggerFilePicker("all")}
                      title="Attach File"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                        cursor: "pointer",
                        padding: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      <Paperclip size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isSending || (!inputText.trim() && stagedAttachments.length === 0)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isSending || (!inputText.trim() && stagedAttachments.length === 0) ? "not-allowed" : "pointer",
                        opacity: isSending || (!inputText.trim() && stagedAttachments.length === 0) ? 0.35 : 1,
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        boxShadow: "0 2px 5px rgba(37, 99, 235, 0.35)",
                        flexShrink: 0,
                        transition: "all 0.15s ease"
                      }}
                    >
                      {isSending ? (
                        <div
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: "50%",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTopColor: "#ffffff",
                            animation: "spin 0.8s linear infinite"
                          }}
                        />
                      ) : (
                        <Send size={14} style={{ marginLeft: 1 }} />
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
              padding: 24
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
                background: "#111"
              }}
            >
              <button
                type="button"
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
                  zIndex: 10
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
                  objectFit: "contain"
                }}
              />
              <div
                style={{
                  padding: "10px 16px",
                  background: "#18181c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
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
                    gap: 6
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
