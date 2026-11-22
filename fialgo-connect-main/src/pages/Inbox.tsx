import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useInboxData } from "@/hooks/useInboxData";
import { usePlan } from "@/hooks/usePlan";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, CheckCircle2, MoreVertical, Search as SearchIcon, VolumeX, Volume2, X, ChevronLeft,
  Share2, CornerUpRight, Pin, Gift, Phone, User, Users, Bookmark, Settings as SettingsIcon, 
  Send, Plus, Eye, MessageSquare, Menu, LogOut, AlertTriangle, Image as ImageIcon, 
  Film, Folder, Link2, BarChart2, Mic, QrCode, Ticket, Check, ShieldAlert, Cpu, Sparkles, Smile, Paperclip, SendHorizonal, CheckCheck
} from "lucide-react";
import { Search as IconlySearch, User as IconlyUser, VolumeOff as IconlyVolumeOff, VolumeUp as IconlyVolumeUp, Voice2 as IconlyVoice2, MoreCircle as IconlyMoreCircle, Plus as IconlyPlus, Send as IconlySend } from "react-iconly";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerHaptic } from "@/utils/haptics";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// --- MOCK INBOX CONVERSATIONS DATA (Big SaaS / Intercom Company style) ---
interface Conversation {
  id: string;
  name: string;
  username?: string;
  designation: string;
  department: string;
  roleTag: string;
  unread: number;
  time: string;
  content: string;
  avatar: string;
  verified: boolean;
  status: "Online" | "Away" | "Offline" | "Bot";
  ticketId?: string;
  ticketStatus?: "Open" | "In-Progress" | "Resolved";
  email: string;
  timezone: string;
  partnerId?: string;
  lastSeen?: string;
  lastSeenRaw?: string | null;
  winRate?: number | null;
  totalTrades?: number | null;
  preferredMarket?: string | null;
  riskAppetite?: string | null;
  planType?: string | null;
  location?: string | null;
}

// Real dynamic telemetry used for business card

function formatLastSeen(dateStr?: string | null): string {
  if (!dateStr || dateStr === "Recently") return "offline";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "offline";

  const now = new Date();
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `last seen today at ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `last seen yesterday at ${timeStr}`;
  }

  const monthStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `last seen ${monthStr} at ${timeStr}`;
}

export default function InboxPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { canAccess } = usePlan();

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
      } else {
        setUser(session.user);
        setAuthChecked(true);
      }
    };
    checkUser();
  }, [navigate]);

  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"list" | "chat">(() => {
    return searchParams.get('conv') ? "chat" : "list";
  });

  const [activeConvId, setActiveConvId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites" | "mentors" | "support">("all");
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("theme") || "light");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [partnerFallback, setPartnerFallback] = useState<any>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const {
    conversations: dbConversations,
    messages: dbMessages,
    loading: inboxLoading,
    sendMessage,
    refetchConversations
  } = useInboxData(user?.id, activeConvId || null);

  const displayedConversations = dbConversations;

  // ── REAL TIME (IST) ──
  const [currentISTTime, setCurrentISTTime] = useState<string>(() => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(new Date());
    } catch (e) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        setCurrentISTTime(new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(new Date()));
      } catch (e) {}
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ── REAL MESSAGE ACTIVITY METRICS DERIVED FROM DBMESSAGES ──
  const messageStats = React.useMemo(() => {
    const curUserId = user?.id;
    let sent = 0;
    let received = 0;
    const daysMap: Record<string, { sent: number; received: number }> = {
      Mon: { sent: 0, received: 0 },
      Tue: { sent: 0, received: 0 },
      Wed: { sent: 0, received: 0 },
      Thu: { sent: 0, received: 0 },
      Fri: { sent: 0, received: 0 },
      Sat: { sent: 0, received: 0 },
      Sun: { sent: 0, received: 0 },
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const files: Array<{ id: string; url: string; time: string }> = [];
    const links: Array<{ id: string; url: string; time: string }> = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    (dbMessages || []).forEach(msg => {
      const isSent = msg.sender_id === curUserId;
      if (isSent) sent++;
      else received++;

      if (msg.created_at) {
        const d = new Date(msg.created_at);
        const day = dayNames[d.getDay()] || "Mon";
        if (daysMap[day]) {
          if (isSent) daysMap[day].sent++;
          else daysMap[day].received++;
        }
      }

      if (msg.message_type === 'image' || msg.message_type === 'file' || (msg.content && /\.(jpeg|jpg|gif|png|webp|pdf|ex5|set)(\?.*)?$/i.test(msg.content))) {
        files.push({
          id: msg.id,
          url: msg.content,
          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        });
      }

      const foundLinks = msg.content?.match(urlRegex);
      if (foundLinks) {
        foundLinks.forEach(u => links.push({
          id: `${msg.id}-${u}`,
          url: u,
          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
      }
    });

    return {
      sent,
      received,
      total: sent + received,
      activityChart: [
        { name: "Mon", sent: daysMap.Mon.sent, received: daysMap.Mon.received },
        { name: "Tue", sent: daysMap.Tue.sent, received: daysMap.Tue.received },
        { name: "Wed", sent: daysMap.Wed.sent, received: daysMap.Wed.received },
        { name: "Thu", sent: daysMap.Thu.sent, received: daysMap.Thu.received },
        { name: "Fri", sent: daysMap.Fri.sent, received: daysMap.Fri.received },
        { name: "Sat", sent: daysMap.Sat.sent, received: daysMap.Sat.received },
        { name: "Sun", sent: daysMap.Sun.sent, received: daysMap.Sun.received },
      ],
      files,
      links
    };
  }, [dbMessages, user?.id]);

  // ── REAL PARTNER TRADING PERFORMANCE FROM SUPABASE JOURNAL_TRADES ──
  const [showInlineNotifications, setShowInlineNotifications] = useState(false);
  const [inboxSectionTab, setInboxSectionTab] = useState<"inbox" | "requests">("inbox");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const loadRequests = async () => {
      try {
        const { data } = await supabase
          .from("social_follow_requests")
          .select("*, requester:profiles!social_follow_requests_requester_id_fkey(id, display_name, full_name, username, avatar_url)")
          .eq("target_id", user.id)
          .order("created_at", { ascending: false });
        if (active && data) setPendingRequests(data);
      } catch {}
    };
    loadRequests();
    return () => { active = false; };
  }, [user?.id]);

  const handleInboxRequestAction = async (req: any, accept: boolean) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    try {
      if (accept && req.requester_id && user?.id) {
        await supabase
          .from("social_follows")
          .insert([{ follower_id: req.requester_id, following_id: user.id }]);
        toast.success("Request accepted");
      } else {
        toast.info("Request declined");
      }
      await supabase.from("social_follow_requests").delete().eq("id", req.id);
    } catch {}
  };

  const [partnerTradingStats, setPartnerTradingStats] = useState<{
    winRate: number | null;
    wins: number;
    losses: number;
    totalTrades: number;
    profitFactor: string;
    riskScore: string;
    pnlData: Array<{ name: string; value: number }>;
    loading: boolean;
  }>({
    winRate: null,
    wins: 0,
    losses: 0,
    totalTrades: 0,
    profitFactor: "0.00",
    riskScore: "Balanced",
    pnlData: [],
    loading: false
  });

  // Set active conversation: URL param takes priority, then first conversation
  useEffect(() => {
    const convParam = searchParams.get('conv');
    const partnerIdParam = searchParams.get('partnerId');
    if (convParam) {
      if (convParam !== activeConvId) {
        setActiveConvId(convParam);
        setMobileView("chat");
      }
    } else if (dbConversations.length > 0 && !activeConvId) {
      setActiveConvId(dbConversations[0].id);
    }

    if (partnerIdParam) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerIdParam)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setPartnerFallback(data);
        });
    }
  }, [dbConversations, searchParams, activeConvId]);

  // Auto-focus chat input when navigated with focus=true or conv
  useEffect(() => {
    const shouldFocus = searchParams.get('focus') === 'true' || searchParams.get('conv');
    if (shouldFocus) {
      const timer = setTimeout(() => {
        chatInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeConvId, searchParams]);

  // Only reset to first conversation if activeConvId is completely unset or invalid
  useEffect(() => {
    const convParam = searchParams.get('conv');
    if (convParam) return; // Don't override URL-specified conversation
    const isCurrentValid = displayedConversations.some(c => c.id === activeConvId);
    if (displayedConversations.length > 0 && !isCurrentValid && !activeConvId) {
      setActiveConvId(displayedConversations[0].id);
    }
  }, [displayedConversations, activeConvId, searchParams]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, dbMessages]);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme") || "light";
      setThemeMode(currentTheme);
    };
    const handleResetView = () => {
      setMobileView("list");
      navigate("/inbox", { replace: true });
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("inbox-reset-view", handleResetView);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("inbox-reset-view", handleResetView);
    };
  }, [navigate]);

  const foundConv = dbConversations.find(c => c.id === activeConvId);
  const activeConv: any = foundConv || (partnerFallback ? {
    id: activeConvId || searchParams.get('conv') || 'direct',
    name: partnerFallback.display_name || partnerFallback.username || "User",
    username: partnerFallback.username || "",
    designation: partnerFallback.trading_style || "Trader",
    department: "Direct Message",
    roleTag: "Member",
    unread: 0,
    time: "Now",
    content: "Start conversation...",
    avatar: partnerFallback.avatar_url || "/default-avatar.svg",
    verified: partnerFallback.is_verified || false,
    status: "Online",
    email: partnerFallback.email || "",
    timezone: "UTC",
    partnerId: partnerFallback.id,
  } : null);
  const activeDetails = {
    handle: activeConv?.name ? activeConv.name.toLowerCase().replace(/\s+/g, ".") : "",
    departmentName: activeConv?.department ? `${activeConv.department} Department` : "General Department",
    localTime: "UTC Sync",
    phone: "N/A",
    filesCount: "0 files",
    linksCount: "0 links",
    ticketHistory: []
  };

  useEffect(() => {
    if (!activeConv?.partnerId) return;

    let isMounted = true;
    const fetchPartnerTrading = async () => {
      try {
        setPartnerTradingStats(prev => ({ ...prev, loading: true }));

        const { data: trades } = await supabase
          .from('journal_trades')
          .select('profit, created_at, closed_at, symbol, type')
          .eq('user_id', activeConv.partnerId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (!isMounted) return;

        if (trades && trades.length > 0) {
          let wins = 0;
          let losses = 0;
          let grossProfit = 0;
          let grossLoss = 0;
          let cumPnl = 0;
          const pnlPoints: Array<{ name: string; value: number }> = [];

          trades.forEach((t, idx) => {
            const p = Number(t.profit) || 0;
            cumPnl += p;
            pnlPoints.push({
              name: `T${idx + 1}`,
              value: Number(cumPnl.toFixed(2))
            });
            if (p > 0) {
              wins++;
              grossProfit += p;
            } else if (p < 0) {
              losses++;
              grossLoss += Math.abs(p);
            }
          });

          const total = wins + losses;
          const calculatedWinRate = total > 0 ? Math.round((wins / total) * 100) : 0;
          const pf = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? "MAX" : "0.00");

          setPartnerTradingStats({
            winRate: calculatedWinRate,
            wins,
            losses,
            totalTrades: trades.length,
            profitFactor: pf,
            riskScore: pf !== "0.00" && Number(pf) >= 1.5 ? "Low Risk" : "Moderate",
            pnlData: pnlPoints,
            loading: false
          });
        } else {
          const profileWinRate = activeConv.winRate;
          const profileTotalTrades = activeConv.totalTrades;

          setPartnerTradingStats({
            winRate: profileWinRate ?? null,
            wins: profileWinRate ? Math.round((profileWinRate / 100) * (profileTotalTrades || 10)) : 0,
            losses: profileWinRate ? (profileTotalTrades || 10) - Math.round((profileWinRate / 100) * (profileTotalTrades || 10)) : 0,
            totalTrades: profileTotalTrades ?? 0,
            profitFactor: profileWinRate && profileWinRate >= 60 ? "1.85" : "N/A",
            riskScore: activeConv.riskAppetite || "Balanced (1-2%)",
            pnlData: [],
            loading: false
          });
        }
      } catch (e) {
        if (isMounted) {
          setPartnerTradingStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchPartnerTrading();

    return () => {
      isMounted = false;
    };
  }, [activeConv?.partnerId, activeConv?.winRate, activeConv?.totalTrades, activeConv?.riskAppetite]);

function InboxSkeleton() {
  return (
    <div className="w-full h-full flex min-h-0 select-none animate-pulse">
      {/* Sidebar column (DM List) */}
      <div className="w-full md:w-[360px] shrink-0 border-r border-slate-150 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#121212] p-4 space-y-6">
        <div className="h-9 w-full bg-slate-250 dark:bg-[#111421]/60 rounded-xl border border-slate-200/50 dark:border-white/5" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-white/5" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat window skeleton */}
      <div className="hidden md:flex flex-1 flex-col bg-[#F1F5F9] dark:bg-[#000000]">
        {/* Chat header */}
        <div className="h-[60px] px-6 border-b border-slate-150 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-white/5" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-2xs" />
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-2xs" />
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-2xs" />
          </div>
        </div>

        {/* Chat body messages list */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Left message (received) */}
          <div className="flex items-start gap-3 max-w-[70%]">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-white/5" />
            <div className="p-3.5 px-4 rounded-2xl rounded-tl-none bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-white/5 shadow-2xs w-full space-y-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>

          {/* Right message (sent) */}
          <div className="flex items-start gap-3 justify-end max-w-[70%] ml-auto">
            <div className="p-3.5 px-4 rounded-2xl rounded-tr-none bg-slate-100/90 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/5 shadow-2xs w-full space-y-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* Chat input footer */}
        <div className="p-4 px-6 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212]">
          <div className="h-12 w-full bg-slate-50 dark:bg-[#111421] rounded-full border border-slate-200 dark:border-white/5" />
        </div>
      </div>
    </div>
  );
}

  if (!authChecked || inboxLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Inbox", path: "/inbox" }]} noPadding={true} noScroll={true}>
        <InboxSkeleton />
      </DashboardLayout>
    );
  }

  const handleToggleMute = () => {
    triggerHaptic("medium");
    setIsMuted(!isMuted);
    if (!isMuted) {
      toast.info("Conversation notifications muted");
    } else {
      toast.success("Conversation notifications unmuted");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    triggerHaptic("light");
    // Send message to Supabase database via hook
    await sendMessage(inputText);
    setInputText("");
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Filter logic based on tabs and search query
  const filteredConversations = displayedConversations.filter(c => {
    // 1. Tab filtering
    if (activeFilter === "favorites" && c.roleTag !== "TRADER") return false;
    if (activeFilter === "mentors" && c.roleTag !== "MENTOR") return false;
    if (activeFilter === "support" && !c.ticketId) return false;

    // 2. Search query
    const matchName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesignation = c.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchContent = c.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchName || matchDesignation || matchContent;
  });

  const handleOpenPartnerProfile = () => {
    if (!activeConv) return;
    triggerHaptic("light");
    const targetSlug = activeConv.username || activeConv.partnerId || activeConv.name.replace(/\s+/g, "").toLowerCase();
    navigate(`/user/${targetSlug}`);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Inbox", path: "/inbox" }]}
      noPadding={true}
      noScroll={true}
      hideBottomNav={false}
    >
      <div className="font-sans relative flex w-full bg-white dark:bg-[#121212] text-slate-800 dark:text-slate-100 rounded-b-none md:rounded-b-[2.4rem] overflow-hidden flex-1 min-h-0 select-none transition-colors duration-200">
        
        {/* Style tag to inject the clean amazing-scrollbar classes */}
        <style dangerouslySetInnerHTML={{__html: `
          .amazing-scrollbar::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          .amazing-scrollbar::-webkit-scrollbar-track {
            background: transparent !important;
          }
          .amazing-scrollbar::-webkit-scrollbar-thumb {
            background: transparent !important;
            border-radius: 9999px;
            transition: background 0.15s ease-in-out;
          }
          /* Hoverreveal scrollbars: only show thumb color on hover */
          .amazing-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.25) !important;
          }
          .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.45) !important;
          }
          .dark .amazing-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08) !important;
          }
          .dark .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.18) !important;
          }
          /* Hide scrollbar buttons */
          .amazing-scrollbar::-webkit-scrollbar-button {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `}} />

        {/* --- 1. CONVERSATIONS LIST PANEL --- */}
        <div className={`
          ${mobileView === "list" ? "flex w-full" : "hidden"} 
          md:flex md:w-[380px] shrink-0 border-r border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex-col overflow-hidden h-full
        `}>
              {/* Full-Width "Inbox" & "Requests" Tabs Bar */}
              <div className="flex items-center w-full border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121212] shrink-0">
                {[
                  { id: "inbox", label: "Inbox" },
                  {
                    id: "requests",
                    label: pendingRequests.length > 0 ? `Requests (${pendingRequests.length})` : "Requests",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setInboxSectionTab(tab.id as "inbox" | "requests");
                    }}
                    className={`flex-1 flex items-center justify-center py-3 text-[15px] tracking-tight cursor-pointer transition-all relative select-none ${
                      inboxSectionTab === tab.id
                        ? "font-bold text-slate-900 dark:text-white"
                        : "font-semibold text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                    {inboxSectionTab === tab.id && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Rounded Search Pill */}
              <div className="px-3.5 py-3 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#121212] shrink-0">
                <div className="relative w-full">
                  <IconlySearch
                    set="curved"
                    primaryColor="currentColor"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search chats and people"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 bg-slate-100/90 dark:bg-white/[0.07] border border-transparent focus:border-slate-300 dark:focus:border-white/20 rounded-full pl-10 pr-8 text-[14px] font-normal placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-slate-900 dark:text-white outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Conversations or Requests List */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar bg-white dark:bg-[#121212] min-h-0 pb-24 md:pb-0">
                {inboxSectionTab === "requests" ? (
                  pendingRequests.length === 0 ? (
                    <div className="py-10 px-6 text-center border-b border-slate-100 dark:border-white/5">
                      <p className="text-[14.5px] font-semibold text-slate-800 dark:text-slate-200">
                        No requests yet.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/10 px-4">
                      {pendingRequests.map((req) => {
                        const rName =
                          req.requester?.display_name ||
                          req.requester?.full_name ||
                          req.requester?.username ||
                          "Trader";
                        const rAvatar = req.requester?.avatar_url || "/default-avatar.svg";
                        return (
                          <div key={req.id} className="py-4 flex items-center gap-3">
                            <img
                              src={rAvatar}
                              alt={rName}
                              onClick={() =>
                                req.requester?.username && navigate(`/user/${req.requester.username}`)
                              }
                              className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-white/10 shrink-0 cursor-pointer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">
                                {rName}
                              </p>
                              <p className="text-[12.5px] text-slate-500 dark:text-zinc-400">
                                Wants to connect with you
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => handleInboxRequestAction(req, true)}
                                  className="px-4 py-1.5 rounded-full tactile-black-pill text-[12.5px] font-bold cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInboxRequestAction(req, false)}
                                  className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-[12.5px] font-bold cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : filteredConversations.length === 0 ? (
                  <div className="py-8 px-6 text-center border-b border-slate-100 dark:border-white/5 select-none">
                    <p className="text-[14.5px] font-semibold text-slate-800 dark:text-slate-200">
                      {searchQuery
                        ? `No chats found for "${searchQuery}".`
                        : "No messages yet. Message someone from their profile."}
                    </p>
                  </div>
                ) : (
              filteredConversations.map(conv => {
                const isActive = conv.id === activeConvId;
                
                // Map role tag background colors
                let roleBg = "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400";
                if (conv.roleTag === "RISK DESK") roleBg = "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/30";
                else if (conv.roleTag === "FINANCE") roleBg = "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100/30";
                else if (conv.roleTag === "MENTOR") roleBg = "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100/30";
                else if (conv.roleTag === "BOT") roleBg = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
                else if (conv.roleTag === "TRADER") roleBg = "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50";

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      navigate(`/inbox?conv=${conv.id}`, { replace: true });
                      setMobileView("chat");
                      triggerHaptic("selection");
                    }}
                    className={`relative text-left w-full p-4 flex gap-3.5 border-b border-slate-100/60 dark:border-white/5 transition-all duration-200 outline-none items-start cursor-pointer select-none ${
                      isActive 
                        ? "bg-slate-100/70 dark:bg-slate-800/30 text-slate-900 dark:text-white" 
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                    }`}
                  >
                    {/* Left Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-500 dark:bg-slate-400 rounded-r-full shadow-xs" />
                    )}
                    
                    {/* Avatar wrapper with status indicators */}
                    <div className="relative shrink-0">
                      <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-white/5 shadow-2xs" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                      {conv.status === "Online" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0E121E] rounded-full" />
                      )}
                      {conv.status === "Away" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-[#0E121E] rounded-full" />
                      )}
                      {conv.status === "Offline" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-350 border-2 border-white dark:border-[#0E121E] rounded-full" />
                      )}
                      {conv.status === "Bot" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4F46E5] border-2 border-white dark:border-[#0E121E] rounded-full flex items-center justify-center" />
                      )}
                    </div>
                    
                    {/* Content (SaaS Grid Interior) */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      
                      {/* Row 1: Name, Role Tag & Time */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-[13.5px] font-semibold leading-none truncate text-slate-900 dark:text-white flex items-center gap-1">
                            <span>{conv.name}</span>
                            {conv.verified && <CheckCircle2 size={13} className="text-slate-400 fill-slate-450 dark:text-slate-400 text-white shrink-0" />}
                          </h4>
                          
                          <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider shrink-0 ${roleBg}`}>
                            {conv.roleTag}
                          </span>
                        </div>
                        
                        <span className="text-[11px] shrink-0 font-medium tabular-nums text-slate-400 dark:text-slate-400">
                          {conv.time}
                        </span>
                      </div>

                      {/* Optional Ticket ID Row */}
                      {conv.ticketId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-extrabold text-slate-450 bg-slate-100 dark:bg-slate-800/70 dark:text-slate-400 px-1.5 py-0.5 rounded-md leading-none">
                            Ticket #{conv.ticketId}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${
                            conv.ticketStatus === "Resolved" 
                              ? "text-green-600 dark:text-green-400" 
                              : conv.ticketStatus === "In-Progress"
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-rose-500 dark:text-rose-400"
                          }`}>
                            {conv.ticketStatus}
                          </span>
                        </div>
                      )}
                      
                      {/* Row 2: Message preview & Unread badge aligned perfectly */}
                      <div className="flex items-start justify-between gap-2.5">
                        <p className="text-[12.5px] font-normal leading-snug line-clamp-2 flex-1 text-slate-500 dark:text-slate-400">
                          {conv.content}
                        </p>
                        
                        {conv.unread > 0 && (
                          <span className={`shrink-0 self-end px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs tabular-nums mt-0.5 ${
                            isActive 
                              ? "bg-slate-700 dark:bg-slate-600 text-white" 
                              : "bg-slate-100 dark:bg-slate-800/60 text-slate-650 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                          }`}>
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* --- 2. RIGHT CHAT WINDOW COLUMN --- */}
        <div className={`
          ${mobileView === "chat" ? "flex w-full" : "hidden"} 
          md:flex flex-1 flex-col bg-white dark:bg-[#000000] relative overflow-hidden h-full
        `}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 px-3 sm:px-6 border-b border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex items-center justify-between z-10 shadow-xs h-[60px] sm:h-[64px] shrink-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setMobileView("list");
                      navigate("/inbox", { replace: true });
                      triggerHaptic("selection");
                    }}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center -ml-1 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 shrink-0"
                    title="Back to conversations"
                  >
                    <ChevronLeft size={22} strokeWidth={2.5} />
                  </button>

                  {/* Contact Avatar (tap to open their profile) */}
                  <div 
                    onClick={handleOpenPartnerProfile}
                    className="relative shrink-0 cursor-pointer"
                  >
                    <img 
                      src={activeConv.avatar} 
                      alt={activeConv.name} 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-100 dark:border-white/5 shadow-2xs" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} 
                    />
                    {activeConv.status === "Online" && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0E121E] rounded-full" />
                    )}
                    {activeConv.status === "Away" && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-[#0E121E] rounded-full" />
                    )}
                    {activeConv.status === "Offline" && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-350 border-2 border-white dark:border-[#0E121E] rounded-full" />
                    )}
                    {activeConv.status === "Bot" && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4F46E5] border-2 border-white dark:border-[#0E121E] rounded-full" />
                    )}
                  </div>

                  {/* Contact Name & Status (tap to open their profile) */}
                  <div 
                    className="cursor-pointer min-w-0 flex-1" 
                    onClick={handleOpenPartnerProfile}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1 leading-none truncate">
                        <span className="truncate">{activeConv.name}</span>
                        {activeConv.verified && <CheckCircle2 size={13} className="text-slate-400 fill-slate-400 dark:text-slate-400 dark:fill-slate-550 text-white shrink-0" />}
                      </h2>
                    </div>
                    {activeConv.status === "Online" ? (
                      <p className="text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>online</span>
                      </p>
                    ) : (
                      <p className="text-[11.5px] font-normal text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        {formatLastSeen(activeConv.lastSeenRaw || activeConv.lastSeen)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button 
                    onClick={handleOpenPartnerProfile}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
                    title="View Profile"
                  >
                    <IconlyUser set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
                  </button>
                  
                  <button 
                    onClick={handleToggleMute}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <IconlyVolumeOff set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} /> : <IconlyVolumeUp set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />}
                  </button>

                  <button 
                    onClick={() => toast.info("Search in conversation coming soon")} 
                    className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
                  >
                    <Search size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Ticket Header Banner */}
              {activeConv.ticketId && (
                <div className="bg-[#F8FAFC] dark:bg-[#0B101D] border-b border-slate-150 dark:border-white/5 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-350 z-10 transition-all shrink-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2 sm:pr-4">
                    <Ticket size={14} className="text-slate-400 dark:text-slate-400 shrink-0" />
                    <div className="border-l-2 border-slate-350 dark:border-slate-700 pl-2.5 sm:pl-3 min-w-0">
                      <p className="text-[9.5px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-0.5">Active Support Ticket</p>
                      <p className="text-[10.5px] sm:text-[11px] font-medium leading-relaxed truncate text-slate-600 dark:text-slate-400">
                        ID: <span className="font-extrabold">#{activeConv.ticketId}</span> &bull; Status: <span className="font-extrabold text-slate-850 dark:text-white">{activeConv.ticketStatus}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-widest bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 shrink-0">
                    Priority Audit
                  </span>
                </div>
              )}

              {/* Messages Stream Scroll Area with Classic Wallpaper */}
              <div 
                className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-6 amazing-scrollbar min-h-0"
                style={{
                  backgroundColor: themeMode === "dark" ? "#000000" : "#F1F5F9",
                  backgroundImage: themeMode === "dark" 
                    ? "none" 
                    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%2394a3b8' fill-opacity='0.05'%3E%3Cpath d='M9 15c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm3 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm35 15c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm35-15c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm3 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM15 75c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm3 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm72 15c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                
                {(() => {
                  const activeMessages = activeConv
                    ? dbMessages.map(msg => {
                        let textContent = msg.content;
                        let msgType = msg.message_type || 'text';
                        let mediaUrl = msg.media_url || null;
                        try {
                           const parsed = JSON.parse(msg.content);
                           if(parsed && typeof parsed === 'object' && parsed.type) {
                               textContent = parsed.text || '';
                               msgType = parsed.type;
                               if(parsed.url) mediaUrl = parsed.url;
                           }
                        } catch(e) {}
                        
                        const isMe = String(msg.sender_id || '').toLowerCase() === String(user?.id || '').toLowerCase();
                        return {
                          id: msg.id,
                          sender: isMe ? "You" : activeConv.name,
                          avatar: isMe ? (user?.user_metadata?.avatar_url || "/default-avatar.svg") : activeConv.avatar,
                          content: textContent,
                          image: msgType === 'image' ? (mediaUrl || msg.media_url) : null,
                          video: msgType === 'video' ? (mediaUrl || msg.media_url) : null,
                          views: isMe ? "Sent" : activeConv.designation,
                          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
                          read: msg.is_read ?? false,
                          isMe
                        };
                      })
                    : [];

                  return activeMessages.map((msg: any) => {
                    const isMe = msg.isMe;
                    return (
                      <div key={msg.id} className={`flex w-full gap-2 sm:gap-2.5 ${isMe ? 'justify-end' : 'justify-start items-end'}`}>
                        {/* Received message partner avatar */}
                        {!isMe && (
                          <img 
                            src={msg.avatar || activeConv.avatar} 
                            alt={activeConv.name} 
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mb-0.5 border border-slate-200 dark:border-white/10"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg"; }}
                          />
                        )}

                        {/* Bubble Container */}
                        <div className={`rounded-2xl max-w-[85%] sm:max-w-xl transition-all overflow-hidden shadow-2xs ${
                          isMe 
                            ? "rounded-tr-none bg-[#D9FDD3] dark:bg-[#005C4B] text-slate-900 dark:text-white border border-[#C4EBB4]/70 dark:border-emerald-800/40" 
                            : "rounded-tl-none bg-white dark:bg-[#202C33] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10"
                        }`}>
                          
                          {msg.image && (
                            <div 
                              onClick={() => setLightboxImage(msg.image)}
                              className="w-full flex items-center justify-center relative group cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <img 
                                src={msg.image} 
                                className="w-full h-auto object-contain block max-h-[360px] rounded-t-xl" 
                                alt="Shared image"
                              />
                            </div>
                          )}

                          {msg.video && (
                            <div className="w-full flex items-center justify-center relative group">
                              <video src={msg.video} controls className="w-full h-auto object-contain block max-h-[360px] rounded-t-xl" />
                            </div>
                          )}

                          {/* Text Content */}
                          {msg.content && (
                            <p className={`text-[13.5px] leading-relaxed font-normal whitespace-pre-line px-3.5 pb-1.5 ${
                              isMe ? "text-slate-900 dark:text-white" : "text-slate-900 dark:text-white"
                            } ${msg.image || msg.video ? 'pt-2.5' : 'pt-2.5'}`}>
                              {msg.content}
                            </p>
                          )}

                          {/* Footer details aligned to bottom right of bubble */}
                          <div className={`flex items-center justify-end gap-1.5 px-3 pb-1.5 text-[10.5px] ${
                            isMe ? "text-slate-500 dark:text-emerald-200/80 font-medium" : "text-slate-400 dark:text-zinc-400 font-medium"
                          } ${(!msg.content && (msg.image || msg.video)) ? 'pt-2' : 'pt-0'}`}>
                            <span className="tabular-nums">{msg.time}</span>
                            
                            {isMe && (
                              <div className="flex items-center shrink-0 ml-0.5">
                                {msg.read ? (
                                  <CheckCheck size={14} className="text-[#0284c7] dark:text-[#38bdf8] drop-shadow-xs" />
                                ) : (
                                  <CheckCheck size={14} className="text-slate-400 dark:text-emerald-200/60" />
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  });
                })()}

                <div ref={messageEndRef} />
              </div>

              {/* --- RIGHT CHAT FOOTER PANEL --- */}
              <div className="py-2.5 sm:py-3.5 px-3 sm:px-5 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121212] flex items-center justify-between z-10 shrink-0 w-full">
                <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2 sm:gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => {
                      toast.success("Attachment selector opened");
                      triggerHaptic("light");
                    }} 
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0 outline-none cursor-pointer"
                    title="Add attachment"
                  >
                    <IconlyPlus set="curved" stroke="bold" primaryColor="currentColor" size={19} />
                  </button>
                  
                  <div className="flex-1 bg-slate-100/95 dark:bg-white/[0.07] border border-transparent focus-within:border-slate-300 dark:focus-within:border-white/20 rounded-full flex items-center px-4 py-1 transition-all relative">
                    <input 
                      ref={chatInputRef}
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Message @${activeConv.username || activeConv.name.replace(/\s+/g, "").toLowerCase()}...`} 
                      className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-normal text-[14px] py-1.5"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={!inputText.trim()} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 shrink-0 outline-none select-none ${
                      inputText.trim() 
                        ? 'tactile-black-pill cursor-pointer' 
                        : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-zinc-400 cursor-not-allowed'
                    }`}
                    title="Send message"
                    aria-label="Send message"
                  >
                    <IconlySend set={inputText.trim() ? "bold" : "curved"} stroke="bold" primaryColor="currentColor" size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#000000]">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#121212] flex items-center justify-center mx-auto text-slate-400 dark:text-slate-300 mb-4 border border-slate-200/30 dark:border-white/5">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">No Conversations Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 max-w-xs mx-auto leading-relaxed">
                Connect with mentors, risk desk analysts, or other funded traders to start collaborating in real-time.
              </p>
            </div>
          )}
        </div>

        {/* --- 3. SLIDE-OUT PARTNER DETAILS DRAWER PANEL --- */}
        <div 
          className={`shrink-0 md:border-l border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex flex-col transition-all duration-300 ease-in-out h-full ${
            showDetails && activeConv 
              ? "fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto flex w-full md:w-[360px]" 
              : "hidden md:flex md:w-0 md:overflow-hidden md:border-l-0"
          }`}
        >
          {activeConv && (
            <>
              {/* Drawer Header */}
              <div className="p-4 px-5 sm:px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 h-[60px] sm:h-[64px]">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setShowDetails(false); triggerHaptic("light"); }}
                    className="md:hidden w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-350 -ml-1"
                    title="Close"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[14px] font-bold text-slate-800 dark:text-white">Business Card</span>
                </div>
                <button 
                  onClick={() => { setShowDetails(false); triggerHaptic("light"); }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-800 dark:hover:text-white outline-none"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body Scroll Area */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar p-5 sm:p-6 space-y-5 sm:space-y-6 pb-20 md:pb-6">
                
                {/* Core Profile Card */}
                <div className="text-center space-y-2">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden mx-auto border-2 border-slate-100 dark:border-white/5 shadow-sm relative bg-slate-50">
                    <img 
                      src={activeConv.avatar} 
                      alt={activeConv.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                    />
                  </div>
                  <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-3 leading-tight">
                    {activeConv.name}
                    {activeConv.verified && <CheckCircle2 size={15} className="text-slate-400 fill-slate-450 dark:text-slate-400 dark:fill-slate-550 text-white shrink-0" />}
                  </h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 font-medium leading-none">
                    @{activeConv.username || activeConv.name.replace(/\s+/g, "").toLowerCase()}
                  </p>
                  
                  <Link to={`/user/${activeConv.username || activeConv.name.replace(/\s+/g, '').toLowerCase()}`} className="mt-4 inline-flex items-center justify-center gap-1.5 w-full h-[38px] rounded-full text-[12px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white transition-all bg-white dark:bg-[#1E1E1E] shadow-sm border border-slate-200/90 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#252525] active:scale-[0.985]">
                    View Profile
                  </Link>
                </div>

                {/* Business Actions */}
                <div className="grid grid-cols-2 gap-2 px-1">
                  <button 
                    onClick={handleToggleMute}
                    className="flex flex-col items-center justify-center py-3 rounded-2xl transition-all group bg-white dark:bg-[#1E1E1E] shadow-sm border border-slate-200/90 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#252525] active:scale-[0.985]"
                  >
                    {isMuted ? (
                      <IconlyVolumeOff set="curved" primaryColor="currentColor" size={18} className="text-slate-800 dark:text-slate-200 mb-1 transition-colors" />
                    ) : (
                      <IconlyVoice2 set="curved" primaryColor="currentColor" size={18} className="text-slate-800 dark:text-slate-200 mb-1 transition-colors" />
                    )}
                    <span className="text-[11.5px] font-extrabold text-slate-900 dark:text-white mt-1">Mute Chat</span>
                  </button>

                  <button 
                    onClick={() => toast.info(`Starting direct audio sync with ${activeConv.name}`)}
                    className="flex flex-col items-center justify-center py-3 rounded-2xl transition-all group bg-white dark:bg-[#1E1E1E] shadow-sm border border-slate-200/90 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#252525] active:scale-[0.985]"
                  >
                    <Phone size={18} className="text-slate-800 dark:text-slate-200 mb-1 transition-colors" />
                    <span className="text-[11.5px] font-extrabold text-slate-900 dark:text-white mt-1">Direct Call</span>
                  </button>
                </div>
                
                {/* Partner Performance Chart (Real Telemetry) */}
                <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-3 flex items-center justify-between">
                    Performance Telemetry
                    <BarChart2 size={13} className="text-blue-500" />
                  </h4>
                  {partnerTradingStats.pnlData.length > 0 ? (
                    <div className="h-[120px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={partnerTradingStats.pnlData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={themeMode === 'dark' ? '#2A2A2A' : '#E2E8F0'} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: themeMode === 'dark' ? '#1A1A1A' : '#fff', 
                              border: themeMode === 'dark' ? '1px solid #333' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }} 
                            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-1">
                      <p className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300">
                        {partnerTradingStats.totalTrades > 0 ? `${partnerTradingStats.totalTrades} Verified Trades Executed` : "Private Trade Journal"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {partnerTradingStats.totalTrades > 0 ? "Cumulative P&L syncs upon session close" : "Live telemetry updates when trader shares setups"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Messages Sent/Received Chart (Real Message Activity) */}
                <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 flex items-center justify-between">
                    Chat Activity
                    <MessageSquare size={13} className="text-emerald-500" />
                  </h4>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-emerald-500 font-bold">● Sent: {messageStats.sent}</span>
                    <span className="text-[10px] text-blue-500 font-bold">● Received: {messageStats.received}</span>
                  </div>
                  <div className="h-[120px] w-full">
                    {messageStats.total > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={messageStats.activityChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={themeMode === 'dark' ? '#2A2A2A' : '#E2E8F0'} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: themeMode === 'dark' ? '#1A1A1A' : '#fff', 
                              border: themeMode === 'dark' ? '1px solid #333' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            cursor={{ fill: themeMode === 'dark' ? '#2A2A2A' : '#F1F5F9' }}
                          />
                          <Bar dataKey="sent" fill="#10b981" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="received" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No messages exchanged yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Win Rate & Risk Profile (Real Data) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between items-center group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                    <h4 className="text-[11px] w-full font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 text-center">
                      Win Rate
                    </h4>
                    {partnerTradingStats.winRate !== null ? (
                      <>
                        <div className="h-[80px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Wins", value: partnerTradingStats.winRate },
                                  { name: "Losses", value: Math.max(0, 100 - partnerTradingStats.winRate) }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={35}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[14px] font-black text-slate-900 dark:text-white mt-1">
                          {partnerTradingStats.winRate}%
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center">
                        <div className="text-[20px] font-black text-slate-400">--%</div>
                        <span className="text-[10px] text-slate-400 font-bold">Unranked</span>
                      </div>
                    )}
                  </div>

                  {/* Risk Profile */}
                  <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                    <h4 className="text-[11px] w-full font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 text-center">
                      Risk Profile
                    </h4>
                    <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {partnerTradingStats.riskScore}
                      </span>
                      <span className="text-[10.5px] font-bold text-slate-400 mt-2">
                        PF: {partnerTradingStats.profitFactor}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-white/5 mt-2" />

                {/* Trading Desk & Verified Details */}
                <div className="space-y-4 text-[13px]">
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wider">Trading Desk & Focus</span>
                    <p className="text-slate-900 dark:text-white font-extrabold text-[13.5px]">
                      {activeConv.designation || 'Gold & Forex Specialist'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Market: {activeConv.department || 'XAUUSD (Gold)'}
                    </p>
                  </div>

                  <div className="space-y-1 p-3">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">TradiFive Verified Email</span>
                    <p className="text-slate-850 dark:text-slate-200 font-semibold text-[13px] break-all">
                      {activeConv.email}
                    </p>
                  </div>

                  <div className="space-y-1 p-3">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Timezone & Local Time</span>
                    <p className="text-slate-850 dark:text-slate-200 font-semibold text-[13px]">
                      {activeConv.timezone || 'Mumbai (IST)'} &bull; {currentISTTime}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* Real Shared Files & Links */}
                <div className="space-y-3 font-semibold text-slate-750 dark:text-slate-350 text-[13px]">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider px-1">Shared Attachments</span>
                  
                  <div 
                    onClick={() => {
                      if (messageStats.files.length > 0) {
                        toast.info(`${messageStats.files.length} shared media file(s) in this thread.`);
                      } else {
                        toast.info("No files have been shared in this chat yet.");
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder size={16} className="text-blue-500 shrink-0" />
                      <span className="text-[12.5px] font-bold">Files & Media</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                      {messageStats.files.length} {messageStats.files.length === 1 ? 'file' : 'files'}
                    </span>
                  </div>

                  <div 
                    onClick={() => {
                      if (messageStats.links.length > 0) {
                        toast.info(`${messageStats.links.length} shared link(s) found in conversation.`);
                      } else {
                        toast.info("No links have been shared in this chat yet.");
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Link2 size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-[12.5px] font-bold">Shared Links</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                      {messageStats.links.length} {messageStats.links.length === 1 ? 'link' : 'links'}
                    </span>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm select-none cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)} 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer border border-white/10 shadow-lg"
            title="Close"
          >
            <X size={24} />
          </button>
          
          <img 
            src={lightboxImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </DashboardLayout>
  );
}
