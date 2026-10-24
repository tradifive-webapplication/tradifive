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
  designation: string;
  department: string;
  roleTag: string; // e.g. "STAFF", "MENTOR", "BOT", "ADMIN", "TRADER"
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
  lastSeen?: string;
}

const mockPerformanceData = [
  { name: "Mon", value: 340 },
  { name: "Tue", value: 480 },
  { name: "Wed", value: 420 },
  { name: "Thu", value: 650 },
  { name: "Fri", value: 890 },
  { name: "Sat", value: 720 },
  { name: "Sun", value: 950 }
];

const mockMessageData = [
  { name: "Mon", sent: 12, received: 18 },
  { name: "Tue", sent: 15, received: 22 },
  { name: "Wed", sent: 20, received: 19 },
  { name: "Thu", sent: 18, received: 25 },
  { name: "Fri", sent: 25, received: 20 }
];

const mockWinRateData = [
  { name: "Wins", value: 68 },
  { name: "Losses", value: 32 }
];

const mockRiskData = [
  { day: "D1", risk: 1.2 },
  { day: "D2", risk: 1.5 },
  { day: "D3", risk: 1.1 },
  { day: "D4", risk: 1.8 },
  { day: "D5", risk: 1.3 }
];

export default function InboxPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { canAccess } = usePlan();
  
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return "light";
  });

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

  const messageEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations: dbConversations,
    messages: dbMessages,
    loading: inboxLoading,
    sendMessage
  } = useInboxData(user?.id, activeConvId || null);

  const displayedConversations = dbConversations;

  // Set active conversation: URL param takes priority, then first conversation
  useEffect(() => {
    const convParam = searchParams.get('conv');
    if (convParam) {
      setActiveConvId(convParam);
      setMobileView("chat");
    } else if (dbConversations.length > 0 && !activeConvId) {
      setActiveConvId(dbConversations[0].id);
    }
  }, [dbConversations, searchParams]);

  // Only reset to first conversation if activeConvId is invalid AND there's no URL param
  useEffect(() => {
    const convParam = searchParams.get('conv');
    if (convParam) return; // Don't override URL-specified conversation
    const isCurrentValid = displayedConversations.some(c => c.id === activeConvId);
    if (displayedConversations.length > 0 && !isCurrentValid) {
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
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const activeConv = dbConversations.find(c => c.id === activeConvId);
  const activeDetails = {
    handle: activeConv?.name ? activeConv.name.toLowerCase().replace(/\s+/g, ".") : "",
    departmentName: activeConv?.department ? `${activeConv.department} Department` : "General Department",
    localTime: "UTC Sync",
    phone: "N/A",
    filesCount: "0 files",
    linksCount: "0 links",
    ticketHistory: []
  };

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

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#D0D0D5] dark:hover:shadow-none active:scale-95 cursor-pointer outline-none"
          title="Inbox Actions"
        >
          <Menu size={20} />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-60 mt-2 rounded-2xl bg-white dark:bg-[#121212] border border-slate-150 dark:border-white/5 p-1.5 shadow-xl z-[100] outline-none">
        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          Inbox Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/5" />
        
        <DropdownMenuItem 
          onClick={() => toast.success("All messages marked as read")}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <CheckCheck size={16} className="text-slate-400" />
          <span>Mark all as read</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => toast.info("Viewing archived conversations...")}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <Folder size={16} className="text-slate-400" />
          <span>Archived Conversations</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => toast.success("Inbox notifications muted")}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <VolumeX size={16} className="text-slate-400" />
          <span>Mute all notifications</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/5" />

        <DropdownMenuItem 
          onClick={() => toast.info("Opening chat preferences...")}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <SettingsIcon size={16} className="text-slate-400" />
          <span>Chat Preferences</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DashboardLayout
      noPadding={true}
      noScroll={true}
      headerActions={headerActions}
      hideBottomNav={isMobile && mobileView === "chat"}
      onBack={isMobile && mobileView === "chat" ? () => setMobileView("list") : undefined}
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
          md:flex md:w-[360px] shrink-0 border-r border-slate-150 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#121212] flex-col overflow-hidden h-full
        `}>
          
          {/* Search Header */}
          <div className="p-3 px-4 flex flex-col border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#121212] gap-2.5 shrink-0">
            <div className="relative w-full">
              <IconlySearch set="curved" primaryColor="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 rounded-xl pl-10 pr-8 py-2.5 text-[13px] font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* SaaS Filter Tabs (Favorites, Mentors, Support) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-[#121212] rounded-full border border-slate-200/30 dark:border-white/5 text-[11px] font-bold shrink-0 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => {
                  setActiveFilter("all");
                  triggerHaptic("selection");
                }}
                className={`flex-1 min-w-[55px] py-1.5 rounded-full text-center transition-all ${activeFilter === "all" ? 'bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 text-slate-900 dark:text-white' : 'text-slate-450 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'}`}
              >
                All
              </button>
              <button 
                onClick={() => {
                  if (!canAccess('inbox_favorites')) {
                    toast.error("Pro Feature", { description: "Upgrade to Pro to filter by Favorites." });
                    return;
                  }
                  triggerHaptic("selection");
                  setActiveFilter("favorites");
                }}
                className={`flex-1 min-w-[80px] py-1.5 flex items-center justify-center gap-1.5 rounded-full text-center transition-all ${activeFilter === "favorites" ? 'bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 text-slate-900 dark:text-white' : 'text-slate-450 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'} ${!canAccess('inbox_favorites') ? 'opacity-60' : ''}`}
              >
                {!canAccess('inbox_favorites') && <div className="text-amber-500"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
                Favorites
              </button>
              <button 
                onClick={() => {
                  setActiveFilter("mentors");
                  triggerHaptic("selection");
                }}
                className={`flex-1 min-w-[75px] py-1.5 rounded-full text-center transition-all ${activeFilter === "mentors" ? 'bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 text-slate-900 dark:text-white' : 'text-slate-450 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'}`}
              >
                Mentors
              </button>
              <button 
                onClick={() => {
                  if (!canAccess('inbox_support')) {
                    toast.error("Pro Feature", { description: "Upgrade to Pro to access priority Support." });
                    return;
                  }
                  triggerHaptic("selection");
                  setActiveFilter("support");
                }}
                className={`flex-1 min-w-[70px] py-1.5 flex items-center justify-center gap-1.5 rounded-full text-center transition-all ${activeFilter === "support" ? 'bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 text-slate-900 dark:text-white' : 'text-slate-450 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'} ${!canAccess('inbox_support') ? 'opacity-60' : ''}`}
              >
                {!canAccess('inbox_support') && <div className="text-amber-500"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
                Support
              </button>
            </div>
          </div>

          {/* Scrollable list of conversations divided by light dividers */}
          <div className="flex-1 overflow-y-auto amazing-scrollbar bg-white dark:bg-[#121212] min-h-0 pb-24 md:pb-0">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[260px] text-slate-400 select-none">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
                  <MessageSquare size={20} />
                </div>
                <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">
                  {searchQuery ? "No matching conversations" : "No Messages Yet"}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                  {searchQuery 
                    ? `No conversations match "${searchQuery}". Try a different keyword.` 
                    : "Direct messages with mentors, risk desk analysts, and peers will appear here."}
                </p>
                {!searchQuery && (
                  <Link
                    to="/community"
                    className="mt-4 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 transition-all shadow-2xs"
                  >
                    Explore Community
                  </Link>
                )}
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
                      triggerHaptic("selection");
                    }}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center -ml-1 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 shrink-0"
                    title="Back to conversations"
                  >
                    <ChevronLeft size={22} strokeWidth={2.5} />
                  </button>

                  {/* Contact Avatar (tap to view details) */}
                  <div 
                    onClick={() => { setShowDetails(!showDetails); triggerHaptic("light"); }}
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

                  {/* Contact Name & Status (tap to view details) */}
                  <div 
                    className="cursor-pointer min-w-0 flex-1" 
                    onClick={() => { setShowDetails(!showDetails); triggerHaptic("light"); }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1 leading-none truncate">
                        <span className="truncate">{activeConv.name}</span>
                        {activeConv.verified && <CheckCircle2 size={13} className="text-slate-400 fill-slate-400 dark:text-slate-400 dark:fill-slate-550 text-white shrink-0" />}
                      </h2>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        activeConv.status === 'Online' ? 'bg-green-500' :
                        activeConv.status === 'Away' ? 'bg-amber-500' :
                        activeConv.status === 'Offline' ? 'bg-slate-400' :
                        activeConv.status === 'Bot' ? 'bg-indigo-500' : 'bg-slate-400'
                      }`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 hidden sm:inline">
                        {activeConv.status}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider truncate">
                      {activeConv.designation} &bull; {activeConv.roleTag}
                    </p>
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button 
                    onClick={() => { setShowDetails(!showDetails); triggerHaptic("light"); }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95 ${showDetails ? 'bg-slate-100 dark:bg-slate-800 text-blue-500 dark:text-blue-400' : ''}`}
                    title="Conversation Details"
                  >
                    <IconlyUser set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
                  </button>
                  
                  <button 
                    onClick={handleToggleMute}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <IconlyVolumeOff set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} /> : <IconlyVolumeUp set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />}
                  </button>

                  <button 
                    onClick={() => toast.info("Search in conversation coming soon")} 
                    className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95"
                  >
                    <Search size={18} strokeWidth={2} />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95 outline-none">
                        <MoreVertical size={17} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white dark:bg-[#121212] border border-slate-150 dark:border-white/5 p-1 shadow-xl z-[100] outline-none">
                      <DropdownMenuItem onClick={() => { setShowDetails(true); triggerHaptic("light"); }} className="flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer">
                        <User size={15} /> View Business Card
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleToggleMute} className="flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer">
                        {isMuted ? <Volume2 size={15} /> : <VolumeX size={15} />}
                        {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info(`Exporting thread for ${activeConv.name}...`)} className="flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer">
                        <Bookmark size={15} /> Export Audit Log
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                
                <div className="flex justify-center my-2">
                  <span className="bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/30 dark:border-white/5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    Audited Communication Thread
                  </span>
                </div>

                {(() => {
                  const activeMessages = activeConv
                    ? dbMessages.map(msg => {
                        let textContent = msg.content;
                        let msgType = 'text';
                        let mediaUrl = null;
                        try {
                           const parsed = JSON.parse(msg.content);
                           if(parsed && typeof parsed === 'object' && parsed.type) {
                               textContent = parsed.text || '';
                               msgType = parsed.type;
                               if(parsed.url) mediaUrl = parsed.url;
                           }
                        } catch(e) {}
                        
                        return {
                          id: msg.id,
                          sender: msg.sender_id === user?.id ? "You" : activeConv.name,
                          avatar: msg.sender_id === user?.id ? "/default-avatar.svg" : activeConv.avatar,
                          content: textContent,
                          image: msgType === 'image' ? mediaUrl : null,
                          video: msgType === 'video' ? mediaUrl : null,
                          views: msg.sender_id === user?.id ? "Sent" : activeConv.designation,
                          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
                          read: msg.is_read ?? false,
                          isMe: msg.sender_id === user?.id || msg.sender_id === 'user-1' || msg.sender_id === 'mock-user-id'
                        };
                      })
                    : [];

                  return activeMessages.map((msg: any) => {
                    const isMe = msg.isMe;
                    return (
                      <div key={msg.id} className={`flex w-full gap-2.5 sm:gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {/* Bubble Container */}
                        <div className={`rounded-2xl border shadow-2xs max-w-[85%] sm:max-w-2xl text-slate-800 dark:text-slate-100 transition-all overflow-hidden ${
                          isMe 
                            ? "rounded-tr-none bg-white border-slate-200/60 dark:bg-[#1E1E1E] dark:border-white/5" 
                            : "rounded-tl-none bg-white border-slate-200/60 dark:bg-[#1E1E1E] dark:border-white/5"
                        }`}>
                          
                          {msg.image && (
                            <div 
                              onClick={() => setLightboxImage(msg.image)}
                              className="w-full flex items-center justify-center relative group cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <img 
                                src={msg.image} 
                                className="w-full h-auto object-contain block" 
                                alt="Shared image"
                              />
                            </div>
                          )}

                          {msg.video && (
                            <div className="w-full flex items-center justify-center relative group">
                              <video src={msg.video} controls className="w-full h-auto object-contain block" />
                            </div>
                          )}

                          {/* Text Content */}
                          {msg.content && (
                            <p className={`text-[13px] text-slate-800 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-line px-4 pb-2 ${msg.image || msg.video ? 'pt-3' : 'pt-3.5'}`}>
                              {msg.content}
                            </p>
                          )}

                          {/* Footer details aligned to bottom right of bubble */}
                          <div className={`flex items-center justify-end gap-1.5 px-4 pb-2 text-[10px] text-slate-450 dark:text-slate-400 font-bold ${(!msg.content && (msg.image || msg.video)) ? 'pt-3' : 'pt-0'}`}>
                            <span className="tabular-nums">{msg.time}</span>
                            
                            {isMe && (
                              <div className="flex items-center shrink-0">
                                {msg.read ? (
                                  <CheckCheck size={14} className="text-[#3b82f6]" />
                                ) : (
                                  <Check size={14} strokeWidth={2.5} className="text-slate-500" />
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
              <div className="p-2.5 sm:p-4 px-3 sm:px-6 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex items-center justify-between z-10 shadow-xs shrink-0 w-full pb-[max(env(safe-area-inset-bottom),0.75rem)] md:pb-4">
                <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2 sm:gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      toast.success("Attachment selector opened");
                      triggerHaptic("light");
                    }} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:shadow-[0_6px_10px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0] dark:hover:shadow-none flex items-center justify-center transition-all text-slate-400 dark:text-slate-400 hover:text-blue-500 shrink-0 outline-none active:scale-95"
                    title="Add attachment"
                  >
                    <IconlyPlus set="curved" primaryColor="currentColor" size={19} />
                  </button>
                  
                  <div className="flex-1 bg-slate-100 dark:bg-[#1E1E1E] border border-transparent rounded-[24px] flex items-center px-4 sm:px-5 py-1 sm:py-1.5 transition-all relative">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Reply to ${activeConv.name}...`} 
                      className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium text-[13.5px] sm:text-[14px] py-1 sm:py-1.5"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={!inputText.trim()} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:shadow-[0_6px_10px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0] dark:hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all text-slate-400 dark:text-slate-400 hover:text-blue-500 shrink-0 outline-none active:scale-95 group"
                    title="Send message"
                  >
                    <IconlySend set="curved" primaryColor="currentColor" size={19} className="mr-0.5 group-hover:translate-x-0.5 transition-transform" />
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
                  <p className="text-[12.5px] text-slate-400 dark:text-slate-400 font-bold leading-none uppercase tracking-wider">
                    {activeConv.roleTag} &bull; {activeConv.department} Desk
                  </p>
                  
                  <Link to={`/user/${activeConv.name.replace(/\s+/g, '').toLowerCase()}`} className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white transition-all bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 hover:opacity-90">
                    View Profile
                  </Link>
                </div>

                {/* Business Actions */}
                <div className="grid grid-cols-2 gap-2 px-1">
                  <button 
                    onClick={handleToggleMute}
                    className="flex flex-col items-center justify-center py-3 rounded-2xl transition-all group bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 hover:opacity-90"
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
                    className="flex flex-col items-center justify-center py-3 rounded-2xl transition-all group bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 hover:opacity-90"
                  >
                    <Phone size={18} className="text-slate-800 dark:text-slate-200 mb-1 transition-colors" />
                    <span className="text-[11.5px] font-extrabold text-slate-900 dark:text-white mt-1">Direct Call</span>
                  </button>
                </div>
                
                {/* Partner Performance Chart */}
                <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-3 flex items-center justify-between">
                    Weekly P&L
                    <BarChart2 size={13} className="text-blue-500" />
                  </h4>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockPerformanceData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                          cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Messages Sent/Received Chart */}
                <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 flex items-center justify-between">
                    Message Activity
                    <MessageSquare size={13} className="text-emerald-500" />
                  </h4>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-emerald-500 font-bold">● Sent: 90</span>
                    <span className="text-[10px] text-blue-500 font-bold">● Received: 104</span>
                  </div>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockMessageData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
                  </div>
                </div>

                {/* Win Rate Pie Chart */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between items-center group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                    <h4 className="text-[11px] w-full font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 text-center">
                      Win Rate
                    </h4>
                    <div className="h-[80px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockWinRateData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={35}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {mockWinRateData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-[14px] font-black text-slate-900 dark:text-white mt-1">68%</div>
                  </div>

                  {/* Risk Profile Line Chart */}
                  <div className="bg-[#F8F9FC] dark:bg-[#1C1C21] border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between group hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                    <h4 className="text-[11px] w-full font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 text-center">
                      Risk Profile
                    </h4>
                    <div className="h-[80px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockRiskData}>
                          <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2, fill: "#f59e0b" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-white/5 mt-2" />

                {/* Department Card */}
                <div className="space-y-4 text-[13px]">
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wider">Department Desk</span>
                    <p className="text-slate-900 dark:text-white font-extrabold text-[13.5px]">
                      {activeDetails.departmentName}
                    </p>
                  </div>

                  <div className="space-y-1 p-3">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Business Email</span>
                    <p className="text-slate-850 dark:text-slate-200 font-semibold text-[13px]">
                      {activeConv.email}
                    </p>
                  </div>

                  <div className="space-y-1 p-3">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Timezone & Local Time</span>
                    <p className="text-slate-850 dark:text-slate-200 font-semibold text-[13px]">
                      {activeConv.timezone} &bull; {activeDetails.localTime}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* Ticket Audits (SaaS Ticket History) */}
                {activeDetails.ticketHistory && activeDetails.ticketHistory.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider px-1">Ticket History Log</span>
                    <div className="space-y-2">
                      {activeDetails.ticketHistory.map((t: any) => (
                        <div key={t.id} className="p-3.5 rounded-2xl bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none border border-white dark:border-white/5 flex items-center justify-between text-xs font-semibold">
                          <div className="space-y-1">
                            <p className="text-slate-900 dark:text-white font-extrabold">Ticket #{t.id}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-none">{t.desc}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            t.status === "Resolved" ? "text-green-600 dark:text-green-400" : "text-amber-500"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-slate-100 dark:border-white/5" />

                {/* Custom Business Shared Files */}
                <div className="space-y-4 font-semibold text-slate-750 dark:text-slate-350 text-[13px]">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider px-1">Shared Attachments</span>
                  
                  <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                    <Folder size={18} className="text-slate-400 shrink-0" />
                    <span className="text-[13.5px]">{activeDetails.filesCount}</span>
                  </div>

                  <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                    <Link2 size={18} className="text-slate-400 shrink-0" />
                    <span className="text-[13.5px]">{activeDetails.linksCount}</span>
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
