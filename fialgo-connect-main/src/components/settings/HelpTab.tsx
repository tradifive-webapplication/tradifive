import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquare,
  X,
  Plus,
  Paperclip,
  Image as ImageIcon,
  Send,
  PhoneCall,
  ChevronRight,
  FileText,
  Info,
  CreditCard,
  UserCog,
  LayoutGrid,
  UserCheck,
  LineChart,
  Gift,
  Server,
  Video,
  Download,
  Copy,
  Check,
  ArrowUpDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  parseChatMessage,
  serializeChatMessage,
  uploadSupportAttachment,
  ChatAttachment,
} from "@/utils/supportChat";

const SETTINGS_CARD =
  "rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none";

const INNER_BOX =
  "rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07]";

const PRIMARY_PILL_BTN =
  "h-9 px-4 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-slate-900 text-[12px] font-semibold shadow-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50";

const SECONDARY_PILL_BTN =
  "tactile-white-pill h-9 px-4 rounded-full text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 text-slate-700 dark:text-neutral-200 cursor-pointer active:scale-95 disabled:opacity-50";

const QUICK_GUIDES = [
  {
    id: "mt5-sync",
    title: "How to connect a MetaTrader 5 (MT5) broker account",
    summary: "Sync live FX, Gold, or Prop Firm executions automatically.",
    answer:
      "Go to Settings -> Accounts & Brokers, enter your exact broker MT5 server name (e.g. VantageInternational-Live), MT5 account login number, and investor or trading password, then click Connect MT5 Account.",
  },
  {
    id: "coupons-plan",
    title: "Applying coupon codes, switching plans, or canceling",
    summary: "Real-time Pro/Elite upgrades, downgrades, and cancellation rules.",
    answer:
      "Open Settings -> Subscription. Enter an active coupon code (such as WELCOME20 or FOUNDER50) before switching plans or renewals. You can toggle Monthly/Annual cycles, switch tiers, or cancel immediately from the same page.",
  },
  {
    id: "refund-policy",
    title: "How refund requests are reviewed",
    summary: "Billing support review timelines and plan status while pending.",
    answer:
      "In Settings -> Subscription -> Refund, submit a request with your reason. Submitting creates a high-priority billing ticket; your active plan benefits remain available while our billing team processes your refund.",
  },
  {
    id: "backup-delete",
    title: "Exporting backups and clearing journal or trade history",
    summary: "Download JSON/CSV snapshots before deleting history or closing your account.",
    answer:
      "Visit Settings -> Data & Privacy to download a full JSON backup or scoped CSV export (All, Live, or Paper trades). To wipe recorded trades and journal logs while keeping brokers and settings intact, use Settings -> Delete history.",
  },
];

const TICKET_CATEGORIES = [
  {
    id: "Payments",
    title: "Payments",
    desc: "Billing, invoices, coupon codes, subscription renewals, or refund requests.",
    icon: CreditCard,
  },
  {
    id: "Account and Security",
    title: "Account & Security",
    desc: "Login access, 2FA authenticator setup, email/password updates, and privacy.",
    icon: UserCog,
  },
  {
    id: "Tradifive platforms",
    title: "Platform & Sync",
    desc: "TradiFive web workspace, broker links, MT5 connectivity, or journal sync.",
    icon: LayoutGrid,
  },
  {
    id: "Account verification",
    title: "Verification",
    desc: "Pro blue check status, Elite green check submission, and profile review.",
    icon: UserCheck,
  },
  {
    id: "Trading",
    title: "Trading & Risk Guard",
    desc: "Trade execution logs, Risk Guard cooldowns, PnL tracking, or analytics.",
    icon: LineChart,
  },
  {
    id: "Tradifive programs",
    title: "Partner & Rewards",
    desc: "Partner broker accounts, affiliate tracking, XP points, and competitions.",
    icon: Gift,
  },
  {
    id: "VPS",
    title: "VPS & Performance",
    desc: "Terminal latency, server uptime, connection diagnostics, and general bugs.",
    icon: Server,
  },
];

export default function HelpTab() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("TRADER");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const name =
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "TRADER";
        setUserName(name);
      }
    };
    fetchUser();
  }, []);

  // HUB SEARCH & FAQ STATE
  const [hubSearchQuery, setHubSearchQuery] = useState("");
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // TICKET FILTER & SORT STATE
  const [ticketStatusFilter, setTicketStatusFilter] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("all");
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [ticketSortOrder, setTicketSortOrder] = useState<"newest" | "oldest">(
    "newest"
  );

  // VIEW STATE
  const [viewMode, setViewMode] = useState<
    "hub" | "ticket_step_contacted" | "ticket_step1" | "ticket_step2"
  >("hub");
  const [contactedBefore, setContactedBefore] = useState<"yes" | "no" | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPreviousTicketId, setSelectedPreviousTicketId] =
    useState<string>("");

  // LIVE OPERATIONS / SIDE PANEL STATE
  const [showTicketPanel, setShowTicketPanel] = useState(false);
  const [showResolvedOverlay, setShowResolvedOverlay] = useState(false);

  // TICKET STATE
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // FORM STATE
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<ChatAttachment | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState<string>("*/*");

  const filteredGuides = useMemo(() => {
    const q = hubSearchQuery.trim().toLowerCase();
    if (!q) return QUICK_GUIDES;
    return QUICK_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.answer.toLowerCase().includes(q)
    );
  }, [hubSearchQuery]);

  const filteredTickets = useMemo(() => {
    const q = (ticketSearchQuery || hubSearchQuery).trim().toLowerCase();
    return [...tickets]
      .filter((t) => {
        if (ticketStatusFilter === "all") return true;
        const normStatus = String(t.status || "open").replace("_", "-");
        return normStatus === ticketStatusFilter;
      })
      .filter((t) => {
        if (!q) return true;
        return (
          String(t.subject || "").toLowerCase().includes(q) ||
          String(t.id || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return ticketSortOrder === "newest" ? db - da : da - db;
      });
  }, [
    tickets,
    ticketStatusFilter,
    ticketSearchQuery,
    hubSearchQuery,
    ticketSortOrder,
  ]);

  const triggerFilePicker = (
    acceptType: "all" | "image" | "video" | "document"
  ) => {
    let accept = "*/*";
    if (acceptType === "image") accept = "image/*";
    else if (acceptType === "video") accept = "video/*";
    else if (acceptType === "document")
      accept = ".pdf,.doc,.docx,.txt,.csv,.log,.zip";
    setFileAccept(accept);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    toast.loading("Uploading attachment...", { id: "attach-upload" });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const att = await uploadSupportAttachment(file, user?.id);
        if (att) {
          setStagedAttachments((prev) => [...prev, att]);
          toast.success(`Attached ${file.name}`, { id: "attach-upload" });
        } else {
          toast.error(`Could not upload ${file.name}`, { id: "attach-upload" });
        }
      } catch (err) {
        console.error(err);
        toast.error(`Error uploading ${file.name}`, { id: "attach-upload" });
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedAttachment = (idx: number) => {
    setStagedAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const startLiveChat = async () => {
    if (!user) {
      toast.error("Please log in to start a support conversation.");
      return;
    }
    const activeTicket = tickets.find(
      (t) =>
        t.status === "open" ||
        t.status === "in-progress" ||
        t.status === "in_progress"
    );
    if (activeTicket) {
      setSelectedTicket(activeTicket);
      setShowResolvedOverlay(false);
      setShowTicketPanel(true);
    } else {
      const { data } = await supabase
        .from("support_tickets")
        .insert([
          {
            user_id: user.id,
            subject: `Live Support Chat (${new Date().toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })})`,
            description: `Direct live chat inquiry started by ${userName}.`,
            status: "open",
            priority: "high",
          },
        ])
        .select()
        .single();

      if (data) {
        setTickets((prev) => [data, ...prev]);
        setSelectedTicket(data);
        setShowResolvedOverlay(false);
        setShowTicketPanel(true);
      } else {
        const mockTicket = {
          id: crypto.randomUUID(),
          user_id: user.id,
          subject: `Live Support Chat (${new Date().toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })})`,
          description: `Direct live chat inquiry started by ${userName}.`,
          status: "open",
          priority: "high",
          created_at: new Date().toISOString(),
        };
        setTickets((prev) => [mockTicket, ...prev]);
        setSelectedTicket(mockTicket);
        setShowResolvedOverlay(false);
        setShowTicketPanel(true);
      }
    }
  };

  // Fetch user's tickets
  useEffect(() => {
    if (!user) return;
    const fetchTickets = async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTickets(data || []);
    };
    fetchTickets();
  }, [user]);

  // Fetch messages for selected ticket
  useEffect(() => {
    if (!selectedTicket?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });

      setMessages(data || []);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        150
      );
    };
    fetchMessages();

    const sub = supabase
      .channel(`ticket_replies_stream_${selectedTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_replies",
          filter: `ticket_id=eq.${selectedTicket.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(
            () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            150
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [selectedTicket?.id]);

  // Real-time ticket status sync
  useEffect(() => {
    if (!user?.id) return;

    const broadcastSub = supabase
      .channel(`ticket_status_${selectedTicket?.id || "global"}`)
      .on("broadcast", { event: "status_update" }, ({ payload }) => {
        const { ticketId, status } = payload;
        setTickets((prev) =>
          prev.map((t) =>
            String(t.id) === String(ticketId) ? { ...t, status } : t
          )
        );
        setSelectedTicket((curr) => {
          if (curr && String(curr.id) === String(ticketId)) {
            if (curr.status !== "resolved" && status === "resolved") {
              setShowResolvedOverlay(true);
            }
            return { ...curr, status };
          }
          return curr;
        });
      })
      .subscribe();

    const postgresSub = supabase
      .channel(`db_status_sync_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setTickets((prev) =>
              prev.some((t) => String(t.id) === String(payload.new.id))
                ? prev
                : [payload.new, ...prev]
            );
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setTickets((prev) =>
              prev.map((t) =>
                String(t.id) === String(payload.new.id) ? payload.new : t
              )
            );
            setSelectedTicket((curr) => {
              if (curr && String(curr.id) === String(payload.new.id)) {
                if (
                  curr.status !== "resolved" &&
                  payload.new.status === "resolved"
                ) {
                  setShowResolvedOverlay(true);
                }
                return payload.new;
              }
              return curr;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastSub);
      supabase.removeChannel(postgresSub);
    };
  }, [user?.id, selectedTicket?.id]);

  const createTicketForm = async () => {
    if (!newTicketSubject.trim() || !newTicketDesc.trim()) {
      toast.error("Please enter both a subject and description.");
      return;
    }
    if (!user) {
      toast.error("Please log in to submit a support ticket.");
      return;
    }
    setIsCreating(true);
    try {
      const finalDescription = `[Category: ${selectedCategory || "General"}]\n\n${newTicketDesc}`;

      const { data, error } = await supabase
        .from("support_tickets")
        .insert([
          {
            user_id: user.id,
            subject: newTicketSubject.trim(),
            description: finalDescription,
            status: "open",
            priority: "medium",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Support ticket error:", error);
        toast.error(error.message || "Failed to create ticket.");
        return;
      }

      if (data) {
        setTickets((prev) => [data, ...prev]);
        setSelectedTicket(data);
        setNewTicketSubject("");
        setNewTicketDesc("");
        setContactedBefore(null);
        setSelectedCategory("");
        setViewMode("hub");
        setShowResolvedOverlay(false);
        setShowTicketPanel(true);
        toast.success("Support ticket submitted!");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && stagedAttachments.length === 0) || !selectedTicket || !user)
      return;
    const msg = serializeChatMessage(newMessage, stagedAttachments);
    setNewMessage("");
    setStagedAttachments([]);

    const { data, error } = await supabase
      .from("ticket_replies")
      .insert([
        {
          ticket_id: selectedTicket.id,
          admin_id: null,
          message: msg,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.message?.includes("row-level security")) {
        const mockReply = {
          id: crypto.randomUUID(),
          ticket_id: selectedTicket.id,
          admin_id: null,
          message: msg,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, mockReply]);
      } else {
        toast.error("Error sending message: " + error.message);
      }
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  };

  const openTicketForm = () => {
    setViewMode("ticket_step_contacted");
  };

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowResolvedOverlay(false);
    setShowTicketPanel(true);
  };

  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText("000-800-100-4378");
      setCopiedPhone(true);
      toast.success("Support number copied");
      setTimeout(() => setCopiedPhone(false), 1800);
    } catch {
      toast.info("Toll-free support: 000-800-100-4378");
    }
  };

  return (
    <div className="w-full space-y-5 pb-10 font-sans">
      {viewMode === "hub" && (
        <>
          {/* Card 1: Search & Quick Answers */}
          <div className={`${SETTINGS_CARD} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                  How can we help, {userName}?
                </h2>
                <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                  Search setup guides, billing answers, or jump straight to your tickets.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/70 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[10.5px] font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Support Online
              </span>
            </div>

            {/* Unified Search Input Box */}
            <div className="flex items-center gap-2 bg-[#F4F5F8] dark:bg-[#232329] rounded-xl px-3.5 h-10 border border-slate-200/80 dark:border-white/[0.08] focus-within:border-slate-900 dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-[#1E1E24] transition-colors">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={hubSearchQuery}
                onChange={(e) => setHubSearchQuery(e.target.value)}
                placeholder="Search MT5 sync, coupon codes, refunds, 2FA, or tickets..."
                className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {hubSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHubSearchQuery("")}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Expandable Quick Guides List */}
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] pt-1">
              {filteredGuides.length === 0 ? (
                <div className="py-4 text-center text-[12px] text-slate-400 dark:text-neutral-500">
                  No matching guides found. Open a ticket below for direct assistance.
                </div>
              ) : (
                filteredGuides.map((guide) => {
                  const isOpen = expandedGuideId === guide.id;
                  return (
                    <div key={guide.id} className="py-2.5 first:pt-1 last:pb-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGuideId(isOpen ? null : guide.id)
                        }
                        className="w-full flex items-center justify-between gap-3 text-left py-1 cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {guide.title}
                          </h3>
                          {!isOpen && (
                            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
                              {guide.summary}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          size={15}
                          className={`text-slate-400 shrink-0 transition-transform duration-150 ${
                            isOpen ? "rotate-90 text-slate-900 dark:text-white" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="text-[12px] text-slate-600 dark:text-neutral-300 leading-relaxed mt-1.5 pb-1 pr-6">
                          {guide.answer}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card Grid: 3 Consistent Support Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card A: Open a Ticket */}
            <div className={`${SETTINGS_CARD} p-5 flex flex-col justify-between gap-4`}>
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-200 flex items-center justify-center">
                  <FileText size={17} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                    Open a Ticket
                  </h3>
                  <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-1 leading-relaxed">
                    Submit a detailed billing, verification, or MT5 issue for tracked resolution.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openTicketForm}
                className={`${PRIMARY_PILL_BTN} w-full`}
              >
                <Plus size={14} />
                <span>Open Ticket</span>
              </button>
            </div>

            {/* Card B: Live Chat */}
            <div className={`${SETTINGS_CARD} p-5 flex flex-col justify-between gap-4`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-200 flex items-center justify-center">
                    <MessageSquare size={17} />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                    Live Support Chat
                  </h3>
                  <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-1 leading-relaxed">
                    Message our operations desk directly and attach screenshots or files.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={startLiveChat}
                className={`${PRIMARY_PILL_BTN} w-full`}
              >
                <MessageSquare size={14} />
                <span>Start Live Chat</span>
              </button>
            </div>

            {/* Card C: Phone Support */}
            <div className={`${SETTINGS_CARD} p-5 flex flex-col justify-between gap-4`}>
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-200 flex items-center justify-center">
                  <PhoneCall size={17} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                    Phone Desk
                  </h3>
                  <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-1 leading-relaxed">
                    Speak with urgent account recovery or payment support directly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={copyPhoneNumber}
                className={`${SECONDARY_PILL_BTN} w-full tabular-nums`}
                title="Copy support phone number"
              >
                {copiedPhone ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>000-800-100-4378</span>
              </button>
            </div>
          </div>

          {/* Card 3: My Tickets Table */}
          <div className={`${SETTINGS_CARD} overflow-hidden`}>
            {/* Header & Controls */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/[0.06] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                    My Tickets
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-neutral-300 text-[11px] font-bold tabular-nums">
                    {filteredTickets.length}
                  </span>
                </div>

                {/* Search + Sort */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 bg-[#F4F5F8] dark:bg-[#232329] rounded-xl px-3 h-8 border border-slate-200/80 dark:border-white/[0.08] focus-within:border-slate-900 dark:focus-within:border-white">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      placeholder="Filter tickets..."
                      className="w-36 sm:w-44 bg-transparent text-[12px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTicketSortOrder((o) =>
                        o === "newest" ? "oldest" : "newest"
                      )
                    }
                    className="tactile-white-pill h-8 px-3 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 text-slate-700 dark:text-neutral-200 cursor-pointer"
                  >
                    <ArrowUpDown size={12} />
                    <span>{ticketSortOrder === "newest" ? "Newest" : "Oldest"}</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "open", label: "Open" },
                    { id: "in-progress", label: "In Progress" },
                    { id: "resolved", label: "Resolved" },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTicketStatusFilter(st.id)}
                    className={`h-7 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      ticketStatusFilter === st.id
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-neutral-400 border border-slate-200/80 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
              <div className="py-10 px-6 text-center space-y-2">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-white">
                  No tickets found
                </p>
                <p className="text-[12px] text-slate-400 dark:text-neutral-500">
                  {tickets.length === 0
                    ? "Any support or refund requests you submit will appear here in real time."
                    : "Try clearing your search query or switching status filter."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {filteredTickets.map((ticket) => {
                  const statusStr = String(ticket.status || "open");
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => openTicket(ticket)}
                      className="w-full px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-[13.5px] font-semibold text-slate-900 dark:text-white truncate">
                          {ticket.subject}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5 font-mono">
                          #{String(ticket.id || "").split("-")[0].toUpperCase()} ·{" "}
                          {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            statusStr === "resolved"
                              ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : statusStr === "in-progress" ||
                                statusStr === "in_progress"
                              ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : "bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300"
                          }`}
                        >
                          {statusStr.replace("_", " ")}
                        </span>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* STEP 0: PREVIOUS CONTACT CHECK */}
      {viewMode === "ticket_step_contacted" && (
        <div className={`${SETTINGS_CARD} p-5 sm:p-6 space-y-5`}>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h2 className="text-[15.5px] font-bold text-slate-900 dark:text-white">
                Open a Support Ticket
              </h2>
              <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Check if this follows up an existing conversation first.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-neutral-300">
              Step 1 of 3
            </span>
          </div>

          <div className={`${INNER_BOX} p-3.5 flex items-start gap-2.5`}>
            <Info size={16} className="text-slate-500 dark:text-neutral-400 shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-slate-600 dark:text-neutral-300">
              Submitting multiple tickets for the same issue can delay resolution. Replying on your existing thread keeps all context together.
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
              Have you contacted us about this matter previously?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "no" as const,
                  title: "No, start a new ticket",
                  desc: "Open a fresh request with our support team.",
                },
                {
                  id: "yes" as const,
                  title: "Yes, open a previous ticket",
                  desc: "Jump back into an existing conversation.",
                },
              ].map((opt) => {
                const active = contactedBefore === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setContactedBefore(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? "border-slate-900 dark:border-white bg-slate-50/80 dark:bg-white/[0.05] shadow-[0_1px_6px_rgba(15,23,42,0.06)]"
                        : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                        {opt.title}
                      </span>
                      {active && (
                        <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-1">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {contactedBefore === "yes" && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Select previous ticket
              </label>
              <select
                value={selectedPreviousTicketId}
                onChange={(e) => setSelectedPreviousTicketId(e.target.value)}
                className="w-full h-10 bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] rounded-xl px-3.5 text-[13px] text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white"
              >
                <option value="" disabled>
                  -- Choose a ticket --
                </option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id.split("-")[0].toUpperCase()} — {t.subject} ({String(t.status || "").replace("_", " ")})
                  </option>
                ))}
              </select>
              {tickets.length === 0 && (
                <p className="text-[11.5px] text-amber-600 dark:text-amber-400">
                  No previous tickets found. Choose "No, start a new ticket" above.
                </p>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setViewMode("hub");
                setContactedBefore(null);
                setSelectedPreviousTicketId("");
              }}
              className={SECONDARY_PILL_BTN}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (contactedBefore === "yes" && selectedPreviousTicketId) {
                  const t = tickets.find(
                    (item) => item.id === selectedPreviousTicketId
                  );
                  if (t) openTicket(t);
                } else {
                  setViewMode("ticket_step1");
                }
              }}
              disabled={
                !contactedBefore ||
                (contactedBefore === "yes" && !selectedPreviousTicketId)
              }
              className={PRIMARY_PILL_BTN}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT CATEGORY */}
      {viewMode === "ticket_step1" && (
        <div className={`${SETTINGS_CARD} p-5 sm:p-6 space-y-5`}>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h2 className="text-[15.5px] font-bold text-slate-900 dark:text-white">
                Choose a Topic
              </h2>
              <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Select the closest category so we route your ticket directly.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-neutral-300">
              Step 2 of 3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TICKET_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.title;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.title)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? "border-slate-900 dark:border-white bg-slate-50/80 dark:bg-white/[0.05] shadow-[0_1px_6px_rgba(15,23,42,0.06)]"
                      : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                          : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">
                      {cat.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setViewMode("ticket_step_contacted");
                setSelectedCategory("");
              }}
              className={SECONDARY_PILL_BTN}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setViewMode("ticket_step2")}
              disabled={!selectedCategory}
              className={PRIMARY_PILL_BTN}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CREATE TICKET FORM */}
      {viewMode === "ticket_step2" && (
        <div className={`${SETTINGS_CARD} p-5 sm:p-6 space-y-5`}>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15.5px] font-bold text-slate-900 dark:text-white">
                  Describe Your Issue
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-700 dark:text-neutral-200">
                  {selectedCategory}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Include any account numbers, order timestamps, or steps to reproduce.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-neutral-300 shrink-0">
              Step 3 of 3
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block px-1">
                Subject *
              </label>
              <input
                type="text"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Brief summary of the request..."
                className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white dark:focus:bg-[#1E1E24] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block px-1">
                Description *
              </label>
              <textarea
                value={newTicketDesc}
                onChange={(e) => setNewTicketDesc(e.target.value)}
                placeholder="Explain what happened and what assistance you need..."
                rows={5}
                className="w-full p-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white dark:focus:bg-[#1E1E24] transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setViewMode("ticket_step1")}
              className={SECONDARY_PILL_BTN}
            >
              Back
            </button>
            <button
              type="button"
              onClick={createTicketForm}
              disabled={isCreating || !newTicketSubject.trim() || !newTicketDesc.trim()}
              className={PRIMARY_PILL_BTN}
            >
              <Send size={13} />
              <span>{isCreating ? "Submitting..." : "Submit Ticket"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TICKET CONVERSATION SIDE PANEL */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showTicketPanel && selectedTicket && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowTicketPanel(false)}
                  className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] z-[9994]"
                />
                <motion.div
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 260 }}
                  className="fixed top-0 right-0 h-[100dvh] w-[500px] max-w-[100vw] bg-white dark:bg-[#141417] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[9995] flex flex-col font-sans"
                >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-white dark:bg-[#141417] z-10 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-base shadow-xs">
                    {String(selectedTicket.id || "T").charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#141417] rounded-full" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-bold text-slate-900 dark:text-white leading-none tracking-tight uppercase truncate">
                    Ticket #{String(selectedTicket.id || "").split("-")[0]}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedTicket.status === "resolved"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : selectedTicket.status === "in-progress"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-neutral-200"
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Thread
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketPanel(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close ticket panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/60 dark:bg-[#101013] relative scroll-smooth">
              {/* Resolved Overlay */}
              <AnimatePresence>
                {showResolvedOverlay && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/75 dark:bg-[#141417]/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="bg-white dark:bg-[#1B1B20] p-7 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 max-w-[330px]">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
                        <UserCheck size={30} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Ticket Resolved
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mb-6 leading-relaxed">
                        Our team marked this issue as solved. You can always open a new ticket if anything comes up.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowResolvedOverlay(false);
                          setShowTicketPanel(false);
                        }}
                        className={`${PRIMARY_PILL_BTN} w-full`}
                      >
                        Close Panel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject Card */}
              <div className={`${SETTINGS_CARD} p-4`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                    Primary Inquiry
                  </p>
                  {selectedTicket.created_at && (
                    <span className="text-[10.5px] font-medium text-slate-400 dark:text-neutral-500 tabular-nums">
                      {new Date(selectedTicket.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                  {selectedTicket.subject}
                </h3>
                <p className="text-[12.5px] text-slate-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description?.split("\n\n").pop() ||
                    "No detailed description provided."}
                </p>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                  Conversation
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              </div>

              {/* Messages Thread */}
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="rounded-2xl bg-white dark:bg-[#1B1B20] border border-dashed border-slate-200/90 dark:border-white/10 p-5 text-center space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 flex items-center justify-center mx-auto">
                      <MessageSquare size={16} />
                    </div>
                    <p className="text-[12.5px] font-semibold text-slate-800 dark:text-white">
                      Your ticket is open
                    </p>
                    <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 max-w-[290px] mx-auto leading-relaxed">
                      Send a follow-up note or attach screenshots below and a TradiFive specialist will reply here in real time.
                    </p>
                  </div>
                )}
                {messages.map((r, i) => {
                  const isUser = !r.admin_id;
                  const showDate =
                    i === 0 ||
                    new Date(messages[i - 1].created_at).toDateString() !==
                      new Date(r.created_at).toDateString();

                  return (
                    <div key={r.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-white dark:bg-[#1B1B20] text-[10px] font-semibold text-slate-500 dark:text-neutral-400 px-3 py-1 rounded-full border border-slate-200/80 dark:border-white/10">
                            {new Date(r.created_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`relative px-4 py-2.5 pb-5 rounded-2xl max-w-[82%] shadow-2xs ${
                            isUser
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-sm"
                              : "bg-white dark:bg-[#1B1B20] text-slate-800 dark:text-neutral-200 rounded-tl-sm border border-slate-200/70 dark:border-white/10"
                          }`}
                        >
                          {(() => {
                            const parsed = parseChatMessage(r.message);
                            return (
                              <>
                                {parsed.text ? (
                                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                                    {parsed.text}
                                  </p>
                                ) : null}
                                {parsed.attachments &&
                                  parsed.attachments.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                      {parsed.attachments.map((att, aIdx) => {
                                        if (att.type === "image") {
                                          return (
                                            <div
                                              key={aIdx}
                                              className="overflow-hidden rounded-xl border border-white/15 dark:border-slate-900/15 cursor-pointer"
                                              onClick={() => setLightboxMedia(att)}
                                            >
                                              <img
                                                src={att.url}
                                                alt={att.name}
                                                className="max-h-52 max-w-full object-cover"
                                              />
                                              <span className="text-[10px] block px-2 py-1 bg-black/40 text-white truncate">
                                                {att.name}
                                              </span>
                                            </div>
                                          );
                                        }
                                        if (att.type === "video") {
                                          return (
                                            <div
                                              key={aIdx}
                                              className="overflow-hidden rounded-xl border border-white/15"
                                            >
                                              <video
                                                src={att.url}
                                                controls
                                                className="max-h-52 max-w-full rounded-xl"
                                              />
                                              <span className="text-[10px] block px-2 py-1 bg-black/40 text-white truncate">
                                                {att.name}
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
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                                              isUser
                                                ? "bg-white/10 dark:bg-slate-900/10 border-white/15 dark:border-slate-900/15 text-white dark:text-slate-900"
                                                : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                                            }`}
                                          >
                                            <FileText size={18} className="shrink-0 opacity-80" />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-xs font-semibold truncate">
                                                {att.name}
                                              </p>
                                              {att.size && (
                                                <span className="text-[10px] opacity-60">
                                                  {(att.size / 1024).toFixed(1)} KB
                                                </span>
                                              )}
                                            </div>
                                            <Download size={14} className="shrink-0 opacity-80" />
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                              </>
                            );
                          })()}
                          <span
                            className={`text-[9px] absolute bottom-1.5 right-3 font-medium ${
                              isUser
                                ? "text-white/60 dark:text-slate-900/60"
                                : "text-slate-400 dark:text-neutral-500"
                            }`}
                          >
                            {new Date(r.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={fileAccept}
              multiple
              className="hidden"
            />

            {/* Staged Attachments */}
            {stagedAttachments.length > 0 && (
              <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#1B1B20] border-t border-slate-200/80 dark:border-white/10 flex gap-2 overflow-x-auto">
                {stagedAttachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white"
                  >
                    {att.type === "image" && <ImageIcon size={13} className="text-slate-500" />}
                    {att.type === "video" && <Video size={13} className="text-slate-500" />}
                    {att.type === "document" && <FileText size={13} className="text-slate-500" />}
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => removeStagedAttachment(idx)}
                      className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input Bar */}
            {selectedTicket.status !== "resolved" && (
              <div className="p-4 bg-white dark:bg-[#141417] border-t border-slate-100 dark:border-white/[0.06] space-y-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => triggerFilePicker("image")}
                    className="h-7 px-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold cursor-pointer"
                  >
                    <ImageIcon size={12.5} />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => triggerFilePicker("video")}
                    className="h-7 px-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold cursor-pointer"
                  >
                    <Video size={12.5} />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => triggerFilePicker("document")}
                    className="h-7 px-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold cursor-pointer"
                  >
                    <FileText size={12.5} />
                    <span>Document</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] focus-within:border-slate-900 dark:focus-within:border-white rounded-2xl px-3.5 py-1.5 transition-colors">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => triggerFilePicker("all")}
                    title="Attach file"
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Paperclip size={17} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent py-2 text-[13px] text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && stagedAttachments.length === 0}
                    className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Media Lightbox */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxMedia(null)}
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden border border-white/10 bg-[#141417]"
            >
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors z-10 cursor-pointer"
              >
                <X size={16} />
              </button>
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.name}
                className="max-w-full max-h-[80vh] object-contain block"
              />
              <div className="p-3 bg-[#1B1B20] flex items-center justify-between gap-3">
                <span className="text-xs text-white font-semibold truncate max-w-[300px]">
                  {lightboxMedia.name}
                </span>
                <a
                  href={lightboxMedia.url}
                  download={lightboxMedia.name}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white text-slate-900 hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
