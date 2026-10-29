import {
  LayoutDashboard, ShieldAlert, BookOpen, Bell, Sparkles, Trophy, HelpCircle,
  Search, PanelLeftClose, PanelLeftOpen, Lock, ChevronDown, ChevronRight, ChevronLeft, Inbox, Moon, Sun, Palette, ChevronsUpDown, Clock, User, CreditCard, MessageSquare, UserCheck,
  Plus, Users, LayoutGrid, Shield, Gift, Compass, BookText, Brain, ShieldCheck, Target, Award, Mail, Crown, PlusCircle, X, GraduationCap, ShoppingBag, Video, Hash, Globe, TrendingUp, Home as LucideHome, UserPlus, Share2, Server, Box, Rocket
} from "lucide-react";
import { Home, Category, Discovery, Document, Star, Bookmark, ShieldDone, TwoUsers, Scan, TicketStar, Discount, Work, Bag, Video as IconlyVideo, Message, Notification, Logout, Wallet, Setting, User as IconlyUser, Graph, Chat, AddUser, Activity, TimeCircle, Play, ShieldFail, Danger, Filter, Paper } from "react-iconly";

import "./UiverseProButton.css";
import { useLocation, useNavigate } from "react-router-dom";
import fialgoLogo from "@/assets/tradifive-logo.png";
import logoOnly from "@/assets/logo-only.png";
import defaultAvatar from "@/assets/default-avatar.svg";
import React, { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { applyThemeWithTransition } from "@/utils/themeTransition";
import { useMarket } from "@/contexts/MarketContext";

const MOTIVATIONAL_MESSAGES = [
  "Consistency beats intensity. Every single time.",
  "Your edge is discipline, not prediction.",
  "The market rewards patience, not impulse.",
  "One good trade tomorrow is better than ten emotional trades today.",
  "You don’t need more trades. You need better decisions.",
  "Risk managed today is capital saved for tomorrow.",
  "Professional traders protect downside first.",
  "Walk away calm. Come back focused.",
  "Discipline is the real alpha.",
  "No trade is also a position.",
  "Protect capital. Everything else follows.",
  "Calm mind. Clear execution.",
  "You’re building a process, not chasing a result.",
  "The goal isn’t excitement. It’s longevity.",
  "Step away before emotion steps in."
];

const StatusOnlineIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
  </div>
);

const StatusIdleIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  </div>
);

const StatusDndIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5z" clipRule="evenodd" />
    </svg>
  </div>
);

const StatusInvisibleIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <svg className="w-3 h-3 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
    </svg>
  </div>
);

// We use a wrapper to ensure all Iconly icons get exactly the same size props
const WrappedIconly = (IconComponent: any) => {
  return (props: any) => {
    const { size, ...rest } = props;
    // Force all main sidebar icons to be size 20 (or 16 for children) to normalize them
    return <IconComponent size={size === 18 ? 20 : size} {...rest} />;
  };
};

const WrappedSparkles = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  // Use size 20 to perfectly match the visual weight of the Iconly icons!
  return <Sparkles size={size === 18 ? 20 : size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedBrain = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Brain size={size === 18 ? 20 : size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const wrapLucide = (IconComponent: any) => {
  return (props: any) => {
    const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
    return <IconComponent size={size === 18 ? 20 : size} strokeWidth={strokeWidth || 2} {...rest} />;
  };
};

// Dynamic communicationMenu will be defined inside AppSidebar component
const homeMenu = [
  { path: "/home", icon: WrappedIconly(Home), label: "Feed" },
  { path: "/home?tab=saved", icon: WrappedIconly(Bookmark), label: "Saved" },
  { path: "/home?tab=calendar", icon: wrapLucide(Clock), label: "Economic Calendar" },
];

const discoverMenu = [
  { path: "/discover", icon: WrappedIconly(Discovery), label: "Discover Hub" },
  { path: "/marketplace", icon: WrappedIconly(Bag), label: "Algo Marketplace" },
  { path: "/discover?tab=Marketplace", icon: WrappedIconly(Category), label: "Top Strategies" },
  { path: "/discover?tab=People", icon: WrappedIconly(TwoUsers), label: "Top Traders" },
  { path: "/competitions/dashboard", icon: WrappedIconly(Scan), label: "Contests", isLocked: true },
  { path: "/learning", icon: wrapLucide(GraduationCap), label: "Courses", isLocked: true },
];

const getAutoTradeMenu = () => {
  const isSetup = typeof window !== 'undefined' && localStorage.getItem("tradifive_auto_trade_setup") === "true";
  return [
    { path: isSetup ? "/auto-trade/dashboard" : "/auto-trade/setup", icon: WrappedIconly(Category), label: "Dashboard" },
    { path: "/auto-trade/active-bots", icon: WrappedIconly(Activity), label: "Active Bots", isLocked: true },
    { path: "/auto-trade/marketplace", icon: WrappedIconly(Bag), label: "Algo Marketplace" },
    { path: "/strategy-builder", icon: WrappedIconly(Setting), label: "Strategy Builder", isLocked: true },
    { path: "/auto-trade/history", icon: WrappedIconly(Document), label: "Order History", isLocked: true },
    { path: "/auto-trade/license", icon: WrappedIconly(ShieldDone), label: "License & Activation", isLocked: true },
  ];
};

const financeMenu = [
  { path: "/finance", icon: WrappedIconly(Wallet), label: "Portfolio" },
  { path: "/broker-connect", icon: wrapLucide(Server), label: "Broker Connect" },
];

const riskGuardMenu = [
  { path: "/risk-guard", icon: WrappedIconly(ShieldDone), label: "Risk Dashboard" },
  { path: "/risk-guard/limits", icon: wrapLucide(ShieldAlert), label: "Drawdown Limits" },
  { path: "/risk-guard/exposure", icon: WrappedIconly(Graph), label: "Position Exposure" },
  { path: "/risk-guard/kill-switch", icon: wrapLucide(X), label: "Kill Switch" },
];

const dashboardMenu = [
  { path: "/dashboard", icon: WrappedIconly(Category), label: "Main Dashboard" },
  { path: "/dashboard?tab=portfolio", icon: WrappedIconly(Wallet), label: "Portfolio & Holdings" },
  { path: "/dashboard?tab=brokers", icon: wrapLucide(Server), label: "Connected Brokers" },
  { path: "/dashboard?tab=reports", icon: WrappedIconly(Document), label: "Reports & Statements" },
];

const journalMenu = [
  { path: "/journal", icon: WrappedIconly(Document), label: "Daily Journal" },
  { path: "/journal/history", icon: wrapLucide(Clock), label: "Trade History" },
  { path: "/journal/mistakes", icon: WrappedIconly(ShieldDone), label: "Mistake Tracking" },
];

const aiCoachMenu = [
  { path: "/ai-coach", icon: WrappedSparkles, label: "AI Coach Insights" },
  { path: "/ai-coach/chat", icon: WrappedIconly(Message), label: "Coach Chat" },
  { path: "/ai-coach/feedback", icon: WrappedIconly(Notification), label: "Trade Feedback" },
  { path: "/ai-coach/goals", icon: WrappedIconly(TicketStar), label: "Trading Goals" },
];

const aiJournalMenu = [
  { path: "/ai-coach", icon: WrappedSparkles, label: "AI Coach Insights" },
  { path: "/journal", icon: WrappedIconly(Document), label: "Daily Journal" },
  { path: "/analytics", icon: WrappedIconly(Graph), label: "Performance Analytics" },
];

const communityMenu = [
  { path: "/channel", icon: WrappedIconly(Chat), label: "Channels" },
];

const marketplaceMenu = [
  { path: "/marketplace/store", icon: WrappedIconly(Bag), label: "App Store" },
  { path: "/marketplace/signals", icon: WrappedIconly(Graph), label: "Signals" },
];

const channelsMenu = [
  { path: "/channels/all", icon: wrapLucide(Hash), label: "All Channels" },
  { path: "/channels/messages", icon: WrappedIconly(Message), label: "Direct Messages" },
];

const creatorHubMenu = [
  { path: "/creator/analytics", icon: WrappedIconly(Graph), label: "Creator Dashboard" },
  { path: "/creator/store", icon: WrappedIconly(Bag), label: "My Store" },
  { path: "/creator/live", icon: WrappedIconly(IconlyVideo), label: "Live Sessions" },
];

const getPillars = (isCreator: boolean) => {
  const isAutoTradeSetup = typeof window !== 'undefined' && localStorage.getItem("tradifive_auto_trade_setup") === "true";
  return [
    { id: "home", icon: WrappedIconly(Home), tooltip: "Home Feed (Live)", defaultPath: "/home", isLive: true },
    { id: "autoTrade", icon: WrappedIconly(Activity), tooltip: "Auto Trade (Live)", defaultPath: isAutoTradeSetup ? "/auto-trade/dashboard" : "/auto-trade/setup", isLive: true },
    { id: "dashboard", icon: WrappedIconly(Category), tooltip: "Dashboard (Soon)", defaultPath: "/dashboard", isLocked: true },
    { id: "community", icon: WrappedIconly(Chat), tooltip: "Channels (Soon)", defaultPath: "/channel", isLocked: true },
    { id: "journal", icon: WrappedIconly(Document), tooltip: "Smart Journal (Soon)", defaultPath: "/journal", isLocked: true },
    { id: "riskGuard", icon: WrappedIconly(ShieldDone), tooltip: "Risk Guard (Soon)", defaultPath: "/risk-guard", isLocked: true },
    { id: "aiCoach", icon: WrappedSparkles, tooltip: "AI Coach (Soon)", defaultPath: "/ai-coach", isLocked: true },
    { id: "discover", icon: WrappedIconly(Discovery), tooltip: "Discover", defaultPath: "/discover", isLive: true },
    ...(isCreator ? [{ id: "creatorHub", icon: WrappedIconly(Star), tooltip: "Creator Hub (Soon)", defaultPath: "/creator/analytics", isLocked: true }] : []),
  ];
};

interface AppSidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  isFullScreen?: boolean;
  isMobile?: boolean;
}

// Sunglasses Avatar component for header
const SunglassesAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-[#121214] flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.15)] select-none pointer-events-none">
    <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6">
      {/* Hair outline & volume */}
      <path d="M26 40C26 28 35 20 50 20C65 20 74 28 74 40C74 43 72 46 70 48L72 58C72 60 70 62 67 62C65 62 64 61 63 60L60 52C58 53 54 54 50 54C46 54 42 53 40 52L37 60C36 61 35 62 33 62C30 62 28 60 28 58L30 48C28 46 26 43 26 40Z" fill="#121214" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sunglasses */}
      <path d="M33 41C33 39 35 37 37 37H47C49 37 51 39 51 41V45C51 47 49 49 47 49H37C35 49 33 47 33 45V41Z" fill="#ffffff" />
      <path d="M49 41C49 39 51 37 53 37H63C65 37 67 39 67 41V45C67 47 65 49 63 49H53C51 49 49 47 49 45V41Z" fill="#ffffff" />
      <path d="M47 42H53" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      {/* Cheeks & Chin / Neck */}
      <path d="M38 52V56C38 63 43 68 50 68C57 68 62 63 62 56V52" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
      {/* Mouth */}
      <path d="M46 60H54" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>
);

import { getGamificationState } from "@/utils/gamification";

const getCleanedFirstName = (name: any): string => {
  if (!name) return "Trader";
  const str = String(name).trim();
  if (
    !str ||
    str.toLowerCase() === "null" ||
    str.toLowerCase() === "undefined" ||
    str.toLowerCase() === "null null" ||
    str.toLowerCase() === "guest" ||
    str.toLowerCase() === "guest trader" ||
    str.toLowerCase() === "guest_trader"
  ) {
    return "Trader";
  }
  const parts = str.split(/\s+/).filter(p => p && p.toLowerCase() !== "null" && p.toLowerCase() !== "undefined");
  if (parts.length === 0) return "Trader";
  return parts[0];
};

const getCleanedFullName = (name: any): string => {
  if (!name) return "Trader";
  const str = String(name).trim();
  if (
    !str ||
    str.toLowerCase() === "null" ||
    str.toLowerCase() === "undefined" ||
    str.toLowerCase() === "null null" ||
    str.toLowerCase() === "guest" ||
    str.toLowerCase() === "guest trader" ||
    str.toLowerCase() === "guest_trader"
  ) {
    return "Trader";
  }
  const parts = str.split(/\s+/).filter(p => p && p.toLowerCase() !== "null" && p.toLowerCase() !== "undefined");
  if (parts.length === 0) return "Trader";
  return parts.join(" ");
};

export default function AppSidebar({ isCollapsed = false, toggleCollapse, isFullScreen = false, isMobile = false }: AppSidebarProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");

  const navigate = useNavigate();
  const { activeMarket, setActiveMarket } = useMarket();

  const getInitialPillar = () => {
    const path = location.pathname;
    if (path.startsWith("/home")) return "home";
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/journal")) return "journal";
    if (path.startsWith("/risk-guard")) return "riskGuard";
    if (path.startsWith("/ai-coach")) return "aiCoach";
    if (path.startsWith("/auto-trade") || path.startsWith("/strategy-builder")) return "autoTrade";
    if (path.startsWith("/discover") || path.startsWith("/marketplace")) return "discover";
    if (path.startsWith("/channel") || path.startsWith("/inbox") || path.startsWith("/notifications") || path.startsWith("/community")) return "community";
    if (path.startsWith("/rewards") || path.startsWith("/referrals")) return "rewards";
    if (path.startsWith("/settings") || path.startsWith("/profile") || path.startsWith("/upgrade")) return "settings";
    if (path.startsWith("/creator")) return "creatorHub";
    return "dashboard";
  };

  const [activePillar, setActivePillar] = useState(getInitialPillar());

  useEffect(() => {
    setActivePillar(getInitialPillar());
  }, [location.pathname]);

  const [theme, setThemeState] = useState(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) ? "dark" : "light");
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("tradifive_cached_display_name") || "Trader");
  const [username, setUsername] = useState(() => localStorage.getItem("tradifive_cached_username") || "trader");
  const [mt5Acc, setMt5Acc] = useState(() => localStorage.getItem("tradifive_cached_mt5_acc") || "");
  const [gamState, setGamState] = useState(() => getGamificationState());
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("tradifive_cached_avatar_url") || "");
  const [bannerUrl, setBannerUrl] = useState(() => localStorage.getItem("tradifive_cached_banner_url") || "");
  const [unreadDMs, setUnreadDMs] = useState(() => parseInt(sessionStorage.getItem("tradifive_unread_dms") || "0", 10));
  const [unreadNotifications, setUnreadNotifications] = useState(() => parseInt(sessionStorage.getItem("tradifive_unread_notifications") || "0", 10));
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [bgFadeStyle, setBgFadeStyle] = useState(() => {
    try {
      return localStorage.getItem("fialgo_bg_fade_style") || "purple";
    } catch (e) {
      return "purple";
    }
  });

  const [userStatus, setUserStatus] = useState(() => localStorage.getItem("tradifive_user_status") || "Online");
  const [userPlan, setUserPlan] = useState(() => (localStorage.getItem("tradifive_cached_plan") || "beginner").toLowerCase());
  const isCreator = userPlan === 'elite' || userPlan === 'advanced';
  const PROMO_SNOOZE_KEY = 'tradifive_promo_snoozed_until';
  const [hideProCard, setHideProCard] = useState(() => {
    const snoozedUntil = localStorage.getItem('tradifive_promo_snoozed_until');
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) return true;
    return false;
  });
  const dismissProCard = () => {
    const snoozeUntil = Date.now() + 20 * 60 * 1000; // 20 minutes
    localStorage.setItem(PROMO_SNOOZE_KEY, snoozeUntil.toString());
    setHideProCard(true);
    // Auto-show again after 20 min
    setTimeout(() => {
      localStorage.removeItem(PROMO_SNOOZE_KEY);
      setHideProCard(false);
    }, 20 * 60 * 1000);
  };
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [isHoveredProfile, setIsHoveredProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState("");
  const [displayedQuote, setDisplayedQuote] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore scroll position
    const savedScroll = sessionStorage.getItem("tradifive_sidebar_scroll");
    if (savedScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem("tradifive_sidebar_scroll", scrollContainerRef.current.scrollTop.toString());
    }
  };

  useEffect(() => {
    if (isLoggingOut && selectedQuote) {
      setDisplayedQuote("");
      let currentIndex = 0;
      // Dynamically calculate speed so it finishes in exactly 1.4 seconds (1400ms)
      const charDelay = Math.max(1400 / selectedQuote.length, 30);
      const interval = setInterval(() => {
        currentIndex++;
        setDisplayedQuote(selectedQuote.substring(0, currentIndex));
        if (currentIndex >= selectedQuote.length) {
          clearInterval(interval);
        }
      }, charDelay);
      return () => clearInterval(interval);
    } else {
      setDisplayedQuote("");
    }
  }, [isLoggingOut, selectedQuote]);

  const fetchUnreadDMs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dm_conversations')
        .select('user1_id, user2_id, user1_unread_count, user2_unread_count')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (error) {
        console.error("Error fetching unread DMs count:", error);
        return;
      }

      if (data) {
        const sum = data.reduce((acc, row) => {
          const count = row.user1_id === userId ? (row.user1_unread_count ?? 0) : (row.user2_unread_count ?? 0);
          return acc + count;
        }, 0);
        setUnreadDMs(sum);
        sessionStorage.setItem("tradifive_unread_dms", sum.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnreadNotifications = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error("Error fetching unread notifications count:", error);
        return;
      }

      const countValue = count ?? 0;
      setUnreadNotifications(countValue);
      sessionStorage.setItem("tradifive_unread_notifications", countValue.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const loadUserData = async () => {

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        let profile: any = null;

        // Only fetch profile if it's a real UUID (to prevent 400 Bad Request for mock users)
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

        if (isValidUUID) {
          // Fetch profile from database (source of truth)
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          profile = data;

          if (profile) {
            // We no longer sync account_type since it's derived from plan
          }
        }
        const defaultUsername = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || "trader";
        let resolvedName = "";
        let resolvedAvatar = "";
        let resolvedUsername = defaultUsername;
        if (profile) {
          resolvedUsername = profile.username || defaultUsername;
          // Use database profile directly — no localStorage mock overrides
          if (profile.display_name && profile.display_name !== "Guest Trader" && profile.display_name !== "null") {
            resolvedName = profile.display_name;
          } else {
            const fName = profile.first_name || "";
            const lName = profile.last_name || "";
            const composed = `${fName} ${lName}`.trim();
            if (composed && composed !== "null null" && composed !== "null") {
              resolvedName = composed;
            }
          }
          // Fallback to auth metadata if profile doesn't have an avatar
          resolvedAvatar = profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
          const p = (profile.plan_type || profile.subscription_status || "beginner").toLowerCase();
          setUserPlan(p);
          localStorage.setItem("tradifive_cached_plan", p);
        } else {
          // No profile exists yet — use auth metadata
          const meta = user.user_metadata || {};
          resolvedName = meta.full_name || meta.name || "";
          resolvedAvatar = meta.avatar_url || meta.picture || "";
        }
        const finalDisplayName = resolvedName || user.email?.split('@')[0] || "Trader";
        setDisplayName(finalDisplayName);
        setUsername(resolvedUsername);

        // Only override if we have a valid resolved avatar, otherwise keep cache
        const finalAvatar = resolvedAvatar || localStorage.getItem("tradifive_cached_avatar_url") || "";

        // Prevent overriding a fresh local upload with a stale DB read
        const lastUpdatedStr = localStorage.getItem("tradifive_avatar_updated_at");
        const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr, 10) : 0;
        const isFreshUpload = Date.now() - lastUpdated < 30000; // 30 seconds

        if (!isFreshUpload) {
          setAvatarUrl(finalAvatar);
          localStorage.setItem("tradifive_cached_avatar_url", finalAvatar);
        }

        if (profile?.banner_url) {
          setBannerUrl(profile.banner_url);
          localStorage.setItem("tradifive_cached_banner_url", profile.banner_url);
        }

        localStorage.setItem("tradifive_cached_display_name", finalDisplayName);
        localStorage.setItem("tradifive_cached_username", resolvedUsername);

        // Fetch MT5 Account
        const { data: mt5 } = await supabase
          .from('mt5_accounts')
          .select('account_number')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (mt5 && mt5.length > 0) {
          const resolvedMt5 = `MT5 #${mt5[0].account_number}`;
          setMt5Acc(resolvedMt5);
          localStorage.setItem("tradifive_cached_mt5_acc", resolvedMt5);
        }
      }
    } catch (e) {
      console.error("Error loading user profile details inside sidebar:", e);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    fetchUnreadDMs(currentUserId);
    fetchUnreadNotifications(currentUserId);

    const suffix = `${currentUserId}_${isMobile ? 'mobile' : 'desktop'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dmChannel = supabase.channel(`sidebar-unread-dms_${suffix}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dm_conversations',
      }, () => {
        fetchUnreadDMs(currentUserId);
      })
      .subscribe();

    const notificationsChannel = supabase.channel(`sidebar-unread-notifs_${suffix}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId}`
      }, () => {
        fetchUnreadNotifications(currentUserId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dmChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [currentUserId, isMobile]);

  useEffect(() => {
    const handleXPUpdate = () => {
      setGamState(getGamificationState());
      loadUserData();
    };
    const handleProfileUpdate = () => {
      loadUserData();
    };

    // Watch class mutations on HTML element for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeState(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    const syncStorage = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeState(isDark ? "dark" : "light");

      const cachedType = localStorage.getItem("tradifive_cached_account_type");
      if (cachedType) {
        setUserAccountType(cachedType);
      }
    };

    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    window.addEventListener("tradifive_profile_update", handleProfileUpdate);
    window.addEventListener("storage", syncStorage);

    const handleBgChange = () => {
      setBgFadeStyle(localStorage.getItem("fialgo_bg_fade_style") || "purple");
    };
    window.addEventListener('fialgo_bg_style_changed', handleBgChange);
    window.addEventListener('storage', handleBgChange);

    const handleAutoTradeSetup = () => {
      setActivePillar(prev => prev);
    };
    window.addEventListener("tradifive_auto_trade_setup_done", handleAutoTradeSetup);

    return () => {
      observer.disconnect();
      window.removeEventListener("tradifive_xp_update", handleXPUpdate);
      window.removeEventListener("tradifive_profile_update", handleProfileUpdate);
      window.removeEventListener("storage", syncStorage);
      window.removeEventListener('fialgo_bg_style_changed', handleBgChange);
      window.removeEventListener('storage', handleBgChange);
      window.removeEventListener("tradifive_auto_trade_setup_done", handleAutoTradeSetup);
    };
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    const newTheme = theme === "light" ? "dark" : "light";
    applyThemeWithTransition(newTheme, () => {
      setThemeState(newTheme);
    });
  };

  const handleLogoutClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    setSelectedQuote(MOTIVATIONAL_MESSAGES[randomIndex]);
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("tradifive_")) {
        localStorage.removeItem(k);
      }
    });
    await supabase.auth.signOut();
    setIsLoggingOut(false);
    navigate("/login");
  };

  const communicationMenu = [
    { path: "/inbox", icon: WrappedIconly(Message), label: "Inbox", badge: (unreadDMs > 0 ? String(unreadDMs) : undefined) },
    { path: "/notifications", icon: WrappedIconly(Notification), label: "Notifications", badge: (unreadNotifications > 0 ? (unreadNotifications > 15 ? "15+" : String(unreadNotifications)) : undefined) },
  ];

  const isAutoTradeSetup = typeof window !== 'undefined' && localStorage.getItem("tradifive_auto_trade_setup") === "true";

  const mobilePillars = [
    { id: "home", label: "Home Feed", icon: WrappedIconly(Home), isLive: true },
    { id: "autoTrade", label: "Auto Trade", icon: WrappedIconly(Activity), isLive: true },
    { id: "dashboard", label: "Dashboard (Soon)", icon: WrappedIconly(Category), isLocked: true },
    { id: "community", label: "Channels (Soon)", icon: WrappedIconly(Chat), isLocked: true },
    { id: "journal", label: "Journal (Soon)", icon: WrappedIconly(Document), isLocked: true },
    { id: "riskGuard", label: "Risk Guard (Soon)", icon: WrappedIconly(ShieldDone), isLocked: true },
    { id: "aiCoach", label: "AI Coach (Soon)", icon: WrappedIconly(Chat), isLocked: true },
    { id: "discover", label: "Discover", icon: WrappedIconly(Discovery), isLive: true },
    ...(isCreator ? [{ id: "creatorHub", label: "Creator Hub", icon: WrappedIconly(Star), isLocked: true }] : [])
  ];

  const getSecondaryPagesForPillar = (pillarId: string) => {
    switch (pillarId) {
      case "home":
        return [
          { path: "/home", icon: WrappedIconly(Home), label: "Home Feed" },
          { path: "/home?tab=saved", icon: WrappedIconly(Bookmark), label: "Saved Posts" },
          { path: "/home?tab=calendar", icon: WrappedIconly(TimeCircle), label: "Economic Calendar" },
        ];
      case "dashboard":
        return [
          { path: "/dashboard", icon: WrappedIconly(Category), label: "Dashboard", isLocked: true },
          { path: "/dashboard?tab=portfolio", icon: WrappedIconly(Wallet), label: "Portfolio & Holdings", isLocked: true },
          { path: "/broker-connect", icon: WrappedIconly(Activity), label: "Connected Brokers", isLocked: true },
          { path: "/dashboard?tab=reports", icon: WrappedIconly(Document), label: "Reports & Statements", isLocked: true },
        ];
      case "journal":
        return [
          { path: "/journal", icon: WrappedIconly(Document), label: "Daily Journal", isLocked: true },
          { path: "/journal/history", icon: WrappedIconly(TimeCircle), label: "Trade History", isLocked: true },
          { path: "/journal/mistakes", icon: WrappedIconly(ShieldDone), label: "Mistake Tracking", isLocked: true },
        ];
      case "riskGuard":
        return [
          { path: "/risk-guard", icon: WrappedIconly(ShieldDone), label: "Risk Dashboard", isLocked: true },
          { path: "/risk-guard/limits", icon: WrappedIconly(ShieldFail), label: "Drawdown Limits", isLocked: true },
          { path: "/risk-guard/exposure", icon: WrappedIconly(Graph), label: "Position Exposure", isLocked: true },
          { path: "/risk-guard/kill-switch", icon: WrappedIconly(Danger), label: "Kill Switch", isDanger: true, isLocked: true },
        ];
      case "discover":
        return [
          { path: "/discover", icon: WrappedIconly(Discovery), label: "Discover Hub" },
          { path: "/marketplace", icon: WrappedIconly(Bag), label: "Algo Marketplace" },
          { path: "/discover?tab=Marketplace", icon: WrappedIconly(Category), label: "Top Strategies" },
          { path: "/discover?tab=People", icon: WrappedIconly(TwoUsers), label: "Top Traders" },
          { path: "/competitions/dashboard", icon: WrappedIconly(Scan), label: "Contests", isLocked: true },
          { path: "/learning", icon: wrapLucide(GraduationCap), label: "Courses", isLocked: true },
        ];
      case "aiCoach":
        return [
          { path: "/ai-coach", icon: WrappedIconly(Chat), label: "AI Coach Insights", isLocked: true },
          { path: "/ai-coach/chat", icon: WrappedIconly(Message), label: "Coach Chat", isLocked: true },
          { path: "/ai-coach/feedback", icon: WrappedIconly(Notification), label: "Trade Feedback", isLocked: true },
          { path: "/ai-coach/goals", icon: WrappedIconly(TicketStar), label: "Trading Goals", isLocked: true },
          { path: "/analytics", icon: WrappedIconly(Graph), label: "Performance Analytics", isLocked: true },
        ];
      case "autoTrade":

        return [

          { path: isAutoTradeSetup ? "/auto-trade/dashboard" : "/auto-trade/setup", icon: WrappedIconly(Category), label: "Dashboard" },

          { path: "/auto-trade/active-bots", icon: WrappedIconly(Activity), label: "Active Bots", isLocked: true },

          { path: "/auto-trade/marketplace", icon: WrappedIconly(Bag), label: "Algo Marketplace" },

          { path: "/strategy-builder", icon: WrappedIconly(Setting), label: "Strategy Builder", isLocked: true },

          { path: "/auto-trade/history", icon: WrappedIconly(Document), label: "Order History", isLocked: true },

          { path: "/auto-trade/license", icon: WrappedIconly(ShieldDone), label: "License & Activation", isLocked: true },

        ];

      case "community":
        return [
          { path: "/channel", icon: WrappedIconly(Chat), label: "Channels & Chat", isLocked: true },
          { path: "/inbox", icon: WrappedIconly(Message), label: "Direct Messages", badge: (unreadDMs > 0 ? String(unreadDMs) : undefined) },
          { path: "/notifications", icon: WrappedIconly(Notification), label: "Notifications", badge: (unreadNotifications > 0 ? (unreadNotifications > 15 ? "15+" : String(unreadNotifications)) : undefined) },
          { path: "/home", icon: WrappedIconly(Home), label: "Home Feed" },
        ];
      case "creatorHub":
        return [
          { path: "/creator/analytics", icon: WrappedIconly(Graph), label: "Creator Dashboard" },
          { path: "/creator/store", icon: WrappedIconly(Bag), label: "My Store" },
          { path: "/creator/live", icon: WrappedIconly(IconlyVideo), label: "Live Sessions" },
        ];
      default:
        return [
          { path: "/dashboard", icon: WrappedIconly(Category), label: "Dashboard" },
          { path: "/journal", icon: WrappedIconly(Document), label: "Daily Journal" },
          { path: "/ai-coach", icon: WrappedIconly(Chat), label: "AI Coach" },
        ];
    }
  };

  const allMobileSecondaryItems = [
    ...mobilePillars.flatMap(p => getSecondaryPagesForPillar(p.id)),
    { path: "/referrals", icon: WrappedIconly(AddUser), label: "Refer & Earn" },
    { path: "/rewards", icon: WrappedIconly(TicketStar), label: "Rewards Hub (Soon)", isLocked: true },
    { path: "/settings", icon: WrappedIconly(Setting), label: "Settings" },
    { path: "/upgrade", icon: wrapLucide(Crown), label: "Upgrade Plan" },
    {
      label: theme === 'dark' ? "Light Mode" : "Dark Mode",
      icon: wrapLucide(theme === 'dark' ? Sun : Moon),
      isAction: true,
      action: toggleTheme,
      keepDrawerOpen: true
    },
    {
      label: "Logout",
      icon: WrappedIconly(Logout),
      isAction: true,
      action: (e: any) => handleLogoutClick(e),
      isDanger: true
    }
  ];

  const renderMenuItem = (item: any) => {
    const currentUrl = location.pathname + location.search;
    const active = !item.isAction && (
      currentUrl === item.path || 
      (location.pathname === '/' && item.path === '/dashboard') ||
      ((item.path === '/home' || item.path === '/home') && location.pathname === '/home' && (!location.search || location.search === ''))
    );

    return (
      <Tooltip delayDuration={0} key={item.label}>
        <TooltipTrigger asChild>
      <button
        id={`tour-nav-${item.label.toLowerCase().replace(/[\s\/]+/g, '-')}`}
        onClick={(e) => {
          if (item.isAction && item.action) {
            item.action(e);
            if (isMobile && !item.keepDrawerOpen) {
              toggleCollapse?.();
            }
            return;
          }
          if (item.path && item.path !== "#") {
            React.startTransition(() => navigate(item.path));
            if (isMobile) {
              toggleCollapse?.();
            }
          }
        }}
        className={`relative flex items-center justify-between transition-all duration-300 group ${isCollapsed
          ? "rounded-xl py-3 px-0 justify-center mx-2 w-auto h-[44px]"
          : `rounded-xl py-2.5 w-auto h-[42px] ${item.isChild ? "ml-8 mr-2 px-3" : "mx-3 px-3"}`
          } ${item.isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          } ${item.isDanger
            ? "text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 font-semibold"
            : active
              ? theme === 'dark'
                ? "sidebar-magic-active border border-transparent font-bold text-white shadow-sm"
                : "bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50"
              : "text-slate-600 dark:text-neutral-300 font-medium hover:text-slate-900 hover:bg-slate-100/70 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
          }`}
      >
        <div className={`flex items-center min-w-0 transition-all duration-300 ${isCollapsed ? "justify-center w-full gap-0" : "gap-3 flex-1"}`}>
          <item.icon 
            set="curved" 
            stroke="bold" 
            primaryColor="currentColor" 
            size={item.isChild ? 16 : 18} 
            strokeWidth={2} 
            className={`shrink-0 ${
              item.isDanger 
                ? 'text-rose-500' 
                : active 
                  ? (theme === 'dark' ? "text-white" : "text-slate-900") 
                  : "text-slate-400 dark:text-neutral-400 group-hover:text-slate-600 dark:group-hover:text-white"
            }`} 
          />
          <span className={`text-[13px] ${item.isChild ? "text-[12px]" : ""} font-medium truncate ${isCollapsed ? "max-w-0 opacity-0" : "opacity-100"}`}>
            {item.label}
          </span>
        </div>

        {item.isLocked && (
          <div className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "ml-2"}`}>
            <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 px-2 py-[3px] rounded-full shrink-0 shadow-sm">
              <Lock size={10} className="text-indigo-500 shrink-0" />
              <span className="text-[8.5px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 leading-none">Soon</span>
            </div>
          </div>
        )}

        {item.badge && (
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "ml-2"}`}>
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow-sm">
              {item.badge}
            </span>
          </div>
        )}

        {item.hasDropdown && (
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "ml-2"}`}>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>
        )}

        {active && theme !== "dark" && (
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-l-full shadow-[0_0_10px_rgba(37,99,235,0.4)] ${isCollapsed ? 'hidden' : 'block'}`} />
        )}
      </button>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right" sideOffset={14} className="bg-white dark:bg-[#2B2B2F] text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl">{item.label}</TooltipContent>}
      </Tooltip>
    );
  };

  let mobileBgClass = "bg-[#e9ecef]";
  if (bgFadeStyle === 'purple') mobileBgClass = "bg-[#edf2fb]";
  else if (bgFadeStyle === 'black') mobileBgClass = "bg-[#d7dadd]";
  else if (bgFadeStyle === 'blue') mobileBgClass = "bg-[#e0f2fe]";
  else if (bgFadeStyle === 'rose') mobileBgClass = "bg-[#ffe4e6]";

  return (
    <>
      <aside
        className={`${!isFullScreen ? 'dark-sidebar' : ''} ${isMobile
          ? 'flex h-full flex-col bg-[#f4f7fb] dark:bg-[#121214] w-full text-slate-900 dark:text-slate-100'
          : `fixed left-0 top-0 z-40 flex h-screen flex-row bg-transparent dark:bg-transparent ${isMounted ? "transition-[width] duration-300" : ""
          } ${isCollapsed ? "w-[90px]" : "w-[90px] xl:w-[340px]"}`
          }`}
        style={isFullScreen && !isMobile ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : {}}
      >
        {!isMobile && (
          <div className="w-[74px] h-[calc(100vh-24px)] flex flex-col items-center justify-between py-2 m-3 mr-0 shrink-0 z-50 relative gap-2">

            {/* Top Outer Pill */}
            <div className="w-full flex-1 flex flex-col items-center py-2 bg-white dark:bg-[#1E1E1E] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none">
              {/* Top Dark Pill - Navigation Icons */}
              <div className="w-[58px] rounded-[29px] bg-[#f4f7fb] dark:bg-[#1A1A1C] flex flex-col items-center py-5 pb-5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.4)] border-none gap-3.5 relative">

                {/* Asterisk / Logo */}
                <div onClick={toggleCollapse} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} className="w-12 h-12 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80 mb-0">
                  <img src="/tf-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>

                {/* Divider */}
                <div className="w-6 h-[1px] bg-slate-200 dark:bg-white/10 mb-2 mt-[-4px]" />

                {/* Pillars */}
                {getPillars(isCreator).map((pillar) => {
                  const isActive = activePillar === pillar.id;
                  return (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                    <div
                      key={pillar.id}
                      
                      onClick={() => {
                        setActivePillar(pillar.id);
                        if (pillar.defaultPath) {
                          React.startTransition(() => navigate(pillar.defaultPath));
                        }
                        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                      }}
                      className={`relative overflow-hidden w-[42px] h-[42px] rounded-[14px] flex items-center justify-center cursor-pointer transition-all ${isActive
                        ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/10'
                        : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5'
                        }`}
                    >
                      <pillar.icon size={18} set="curved" stroke="bold" primaryColor="currentColor" strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                      )}
                    </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={20} className="bg-[#2B2B2F] border border-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl">{pillar.tooltip}</TooltipContent>
                                          </Tooltip>
                    );
                  })}
                  </div>

                  {/* App Version */}
                  <div className="flex-1 w-full flex items-center justify-center min-h-[120px] mb-4">
                    <span className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 dark:text-[#8C8C8E]/80 rotate-[-90deg] whitespace-nowrap uppercase">
                      TRADIFIVE v1.2
                    </span>
                  </div>


            </div>

            {/* Bottom Rewards & Referrals Pill */}
            <div className="w-full flex-shrink-0 flex flex-col items-center p-2 bg-white dark:bg-[#1E1E1E] rounded-[37px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none relative mt-auto">
              {/* Inner Grey Pill */}
              <div className="w-[58px] rounded-[29px] bg-[#f4f7fb] dark:bg-[#1A1A1C] flex flex-col items-center py-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.4)] border-none gap-2 relative">
                 <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div onClick={() => navigate('/rewards')} className={`relative overflow-hidden w-[42px] h-[42px] rounded-[14px] flex items-center justify-center cursor-pointer transition-all ${window.location.pathname.startsWith('/rewards') ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5'}`}>
                        <TicketStar size={18} primaryColor="currentColor" set="curved" stroke="bold" className="relative z-10" />
                        {window.location.pathname.startsWith('/rewards') && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={20} className="bg-[#2B2B2F] border border-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl">Rewards Hub (Soon)</TooltipContent>
                 </Tooltip>

                 <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div onClick={() => navigate('/referrals')} className={`relative overflow-hidden w-[42px] h-[42px] rounded-[14px] flex items-center justify-center cursor-pointer transition-all ${window.location.pathname.startsWith('/referrals') ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5'}`}>
                        <AddUser size={18} primaryColor="currentColor" set="curved" stroke="bold" className="relative z-10" />
                        {window.location.pathname.startsWith('/referrals') && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={20} className="bg-[#2B2B2F] border border-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl">Referrals</TooltipContent>
                 </Tooltip>
              </div>
            </div>

          </div>

        )}

        {/* SECONDARY SIDEBAR */}
        <div className={`flex flex-col h-full bg-transparent border-transparent transition-all duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isMobile ? 'w-full' : isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-[274px] opacity-100'} shrink-0 relative`}>
          <div className={`flex flex-col h-full shrink-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isMobile ? 'w-full' : 'w-[274px]'} ${isCollapsed && !isMobile ? '-translate-x-12' : 'translate-x-0'}`}>



          {/* ── SIDEBAR HEADER ── */}
          <div className="shrink-0 px-3.5 pb-2 flex flex-col gap-3 relative">
            
            {/* Image Logo & Markets Dropdown Aligned with Primary Sidebar Favicon */}
            <div className={`overflow-hidden transition-all duration-300 flex items-center justify-between h-[54px] ${isMobile ? 'mt-0.5 pl-1 pr-12' : 'mt-[48px] pr-2'} ${isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"}`}>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <img src="/tf-logo.png" alt="Logo" className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] object-contain shrink-0" />
                )}
                <img 
                  src="/Tradifive_logo1.png" 
                  alt="TradiFive" 
                  className="h-[26px] sm:h-[28px] w-auto object-contain dark:hidden" 
                />
                <img 
                  src="/Dark mode logo with white.png" 
                  alt="TradiFive" 
                  className="h-[26px] sm:h-[28px] w-auto object-contain hidden dark:block" 
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-xs hover:border-blue-500/40 transition-all active:scale-95 cursor-pointer select-none" title={activeMarket === 'forex' ? "Global Market" : "Indian Market"}>
                    {activeMarket === 'forex' ? (
                      <Globe size={16} className="text-blue-500" strokeWidth={2.2} />
                    ) : (
                      <TrendingUp size={16} className="text-emerald-500" strokeWidth={2.2} />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-[170px] rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1 z-[100]">
                  <DropdownMenuItem onClick={() => setActiveMarket('forex')} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${activeMarket === 'forex' ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                    <Globe size={16} strokeWidth={activeMarket === 'forex' ? 2.5 : 2} />
                    <span className={`text-[13px] ${activeMarket === 'forex' ? 'font-bold' : 'font-medium'}`}>Global Market</span>
                    {activeMarket === 'forex' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveMarket('indian')} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all mt-0.5 ${activeMarket === 'indian' ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                    <TrendingUp size={16} strokeWidth={activeMarket === 'indian' ? 2.5 : 2} />
                    <span className={`text-[13px] ${activeMarket === 'indian' ? 'font-bold' : 'font-medium'}`}>Indian Market</span>
                    {activeMarket === 'indian' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>


            <div className="flex items-center gap-2 w-full">
              {/* Search Bar */}
              <div className="relative group flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search navigation…"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  className="w-full h-[40px] pl-10 pr-9 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 dark:focus:ring-blue-400/20 dark:focus:border-blue-400/30 shadow-xs transition-all"
                />
                {navSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => setNavSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.08] text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Collapse Button (Inline) for desktop */}
              {!isMobile && toggleCollapse && theme === 'dark' && (
                <button
                  id="tour-collapse-btn"
                  onClick={toggleCollapse}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200/50 dark:border-white/10 bg-white dark:bg-[#2B2B2F] text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors"
                  title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              )}
            </div>

            {/* Quick Mobile Communication Access: Messages & Notifications */}
            {isMobile && (
              <div className="grid grid-cols-2 gap-2 pt-1 pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    React.startTransition(() => navigate("/inbox"));
                    toggleCollapse?.();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[12px] font-semibold border transition-all active:scale-[0.98] ${
                    location.pathname.startsWith('/inbox')
                      ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs font-bold'
                      : 'bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Message set="curved" primaryColor="currentColor" size={16} stroke="bold" />
                    <span>Inbox</span>
                  </div>
                  {unreadDMs > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full leading-none shadow-xs">
                      {unreadDMs}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    React.startTransition(() => navigate("/notifications"));
                    toggleCollapse?.();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[12px] font-semibold border transition-all active:scale-[0.98] ${
                    location.pathname.startsWith('/notifications')
                      ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs font-bold'
                      : 'bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Notification set="curved" primaryColor="currentColor" size={16} stroke="bold" />
                    <span>Alerts</span>
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-full leading-none shadow-xs">
                      {unreadNotifications > 15 ? '15+' : unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Primary Buttons Horizontal (Pillars) - Segmented Control */}
            {isMobile && (
              <div className="pt-2 pb-1.5 -mx-1">
                <div className="p-1 bg-slate-200/60 dark:bg-white/[0.06] rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-hide no-scrollbar border border-slate-200/50 dark:border-white/[0.04]">
                  {mobilePillars.map((p) => {
                    const isActive = activePillar === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setActivePillar(p.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] whitespace-nowrap shrink-0 transition-all cursor-pointer select-none active:scale-95 ${
                          isActive
                            ? 'bg-white dark:bg-[#202025] text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-slate-200/70 dark:border-white/10'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <p.icon size={13} primaryColor="currentColor" stroke="bold" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>



          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col pb-4 ${isCollapsed ? "px-2" : isMobile ? "px-3" : "px-2"}`}
          >
            {isMobile ? (
              navSearchQuery ? (
                /* Mobile Search Results */
                <div className="pt-2 pb-3">
                  <div className="px-2 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-neutral-400">
                      Search Results
                    </span>
                    <button
                      onClick={() => setNavSearchQuery("")}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  {(() => {
                    const matching = allMobileSecondaryItems.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase()));
                    if (matching.length === 0) {
                      return (
                        <div className="py-8 text-center px-4">
                          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-2">No navigation links found for "{navSearchQuery}"</p>
                          <button
                            onClick={() => setNavSearchQuery("")}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                          >
                            Reset Search
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-1">
                        {matching.map(renderMenuItem)}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Mobile Vertical Secondary Pages for the Active Primary Button */
                <div className="pt-2.5 pb-3">
                  <div className="px-3 mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-sans">
                      {mobilePillars.find(p => p.id === activePillar)?.label || "Main"} Pages
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/5 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 font-mono">
                      {getSecondaryPagesForPillar(activePillar).length} items
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getSecondaryPagesForPillar(activePillar).map(renderMenuItem)}
                  </div>
                </div>
              )
            ) : (
              /* Desktop Original Active Pillar Submenu */
              <>
                {/* COMMUNICATION SECTION */}
                <div className={isCollapsed ? "mx-2 border-t border-slate-200 dark:border-white/5" : "mx-6 border-t border-slate-200 dark:border-white/5"} />
                <div className="pb-3 pt-3">
                  <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[30px] opacity-100 mb-2"}`}>
                    <h3 className="text-slate-400 dark:text-neutral-400 text-[10px] font-extrabold uppercase tracking-[0.15em] px-6 font-sans whitespace-nowrap">Communication</h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    {communicationMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem)}
                  </div>
                </div>

                {/* ACTIVE PILLAR SUB-MENU SECTION */}
                <div className={isCollapsed ? "mx-2 mb-3 border-t border-slate-200 dark:border-white/5" : "mx-6 mb-3 border-t border-slate-200 dark:border-white/5"} />
                <div className="pb-3">
                  <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[30px] opacity-100 mb-2"}`}>
                    <h3 className="text-slate-400 dark:text-neutral-400 text-[10px] font-extrabold uppercase tracking-[0.15em] px-6 font-sans whitespace-nowrap">
                      {getPillars(isCreator).find(p => p.id === activePillar)?.tooltip || "Menu"}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    {
                      activePillar === "home" ? homeMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                        activePillar === "dashboard" ? dashboardMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                          activePillar === "journal" ? journalMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                            activePillar === "riskGuard" ? riskGuardMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                              activePillar === "aiCoach" ? aiCoachMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                                activePillar === "autoTrade" ? getAutoTradeMenu().filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                                  activePillar === "discover" ? discoverMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                                    activePillar === "community" ? communityMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                                    activePillar === "creatorHub" ? creatorHubMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem) :
                                      null
                    }
                  </div>
                </div>
              </>
            )}
          </div>

          {/* UPGRADE CARDS */}
          {!isCreator && !hideProCard && !isMobile && (
            <div id="tour-pro-card" className={`px-3 mt-1 font-sans overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-[250px] opacity-100 mb-3"}`}>
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 dark:from-indigo-950/40 dark:via-[#161616] dark:to-[#111] rounded-2xl p-4 py-4.5 border border-indigo-100 dark:border-white/10 shadow-sm group">
                {/* Soft background gradient overlay */}
                <div className={`absolute inset-0 opacity-40 dark:opacity-10 bg-gradient-to-br ${(userPlan === "intermediate" || userPlan === "pro") ? "from-amber-200 to-yellow-100" : "from-indigo-200 to-purple-100"}`} />

                {/* Dismiss / Snooze button */}
                <div className="absolute top-2.5 right-2.5 z-20 group/dismiss">
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissProCard(); }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-white/20"
                    title="Remind me in 20 minutes"
                  >
                    <X size={13} />
                  </button>
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 group-hover/dismiss:opacity-100 transition-opacity shadow-lg">
                    Snooze 20 min
                  </span>
                </div>

                {/* Sparkle accent */}
                <div className={`absolute top-3 right-3 opacity-60 animate-pulse pointer-events-none ${(userPlan === "intermediate" || userPlan === "pro") ? "text-amber-500" : "text-indigo-500"}`}>
                  <Sparkles size={14} />
                </div>

                {/* Glow effect */}
                <div className={`absolute -bottom-4 -right-4 w-28 h-28 blur-2xl rounded-full ${(userPlan === "intermediate" || userPlan === "pro") ? "bg-amber-400/20" : "bg-indigo-400/20"}`} />
                <div className={`absolute -top-4 -left-4 w-24 h-24 blur-2xl rounded-full ${(userPlan === "intermediate" || userPlan === "pro") ? "bg-yellow-400/20" : "bg-violet-400/20"}`} />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <h4 className="text-slate-900 dark:text-white font-extrabold text-[16px] tracking-wide mb-1.5 flex items-center justify-center gap-1.5 drop-shadow-sm">
                    {(userPlan === "intermediate" || userPlan === "pro") ? (
                      <>
                        <Crown size={16} className="text-amber-500 drop-shadow-sm" />
                        TradiFive <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Elite</span>
                      </>
                    ) : (
                      <>
                        <Award size={16} className="text-indigo-600 drop-shadow-sm" />
                        TradiFive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pro</span>
                      </>
                    )}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[12px] font-medium leading-relaxed mb-4 px-1">
                    {(userPlan === "intermediate" || userPlan === "pro")
                      ? "Unlock unlimited AI features, premium metrics & full API copy trading."
                      : "Unlock powerful AI coaching, premium metrics & basic copy trading."}
                  </p>

                  <button
                    onClick={() => toast.info("TradiFive Early Launch: Auto Trade and Social Feed are free! Subscriptions unlock in Phase 2.")}
                    className={`uiverse-pro-button ${userPlan === "intermediate" || userPlan === "pro" ? "elite-btn" : ""}`}
                  >
                    <span className="uiverse-pro-fold"></span>
                    <div className="uiverse-pro-points_wrapper">
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                      <i className="uiverse-pro-point"></i>
                    </div>
                    <span className="uiverse-pro-inner">
                      <Sparkles size={15} className={`icon ${(userPlan === "intermediate" || userPlan === "pro") ? "text-amber-100" : "text-indigo-100"}`} />
                      Pro Waitlist (Soon)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Footer for Mobile: Integrated Actions & Utility Toolbar */}
          {isMobile ? (
            <div className="shrink-0 pt-2.5 pb-3 px-3 bg-[#f4f7fb] dark:bg-[#121214] border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2.5 select-none">
              {/* Dual Action Tiles: Refer & Earn and Rewards Hub */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    React.startTransition(() => navigate("/referrals"));
                    toggleCollapse?.();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white dark:bg-[#1E1E22] hover:bg-slate-100/80 dark:hover:bg-[#26262B] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-all active:scale-[0.98] text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <AddUser set="curved" primaryColor="currentColor" size={17} stroke="bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                      Refer & Earn
                    </div>
                    <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 leading-tight mt-0.5 truncate">
                      +500 XP / 20%
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    React.startTransition(() => navigate("/rewards"));
                    toggleCollapse?.();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white dark:bg-[#1E1E22] hover:bg-slate-100/80 dark:hover:bg-[#26262B] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-all active:scale-[0.98] text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    <TicketStar set="curved" primaryColor="currentColor" size={17} stroke="bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                      Rewards
                    </div>
                    <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-tight mt-0.5 truncate">
                      Claim perks
                    </div>
                  </div>
                </button>
              </div>

              {/* Integrated Utility Toolbar: Theme Toggle | Settings | Logout */}
              <div className="flex items-center bg-white dark:bg-[#1E1E22] rounded-xl p-1 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                {/* Theme Switch */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all text-[11.5px] font-semibold cursor-pointer active:scale-95"
                  title="Toggle Light / Dark mode"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={13} className="text-amber-400 shrink-0" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={13} className="text-slate-700 shrink-0" />
                      <span>Dark</span>
                    </>
                  )}
                </button>

                <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-white/10 shrink-0" />

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    React.startTransition(() => navigate("/settings"));
                    toggleCollapse?.();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all text-[11.5px] font-semibold cursor-pointer active:scale-95"
                >
                  <Setting set="curved" primaryColor="currentColor" size={14} stroke="bold" className="shrink-0" />
                  <span>Settings</span>
                </button>

                <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-white/10 shrink-0" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={(e) => handleLogoutClick(e)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-[11.5px] font-semibold cursor-pointer active:scale-95"
                >
                  <Logout set="curved" primaryColor="currentColor" size={14} stroke="bold" className="shrink-0" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Status and Version Indicator */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono px-1">
                <span className="uppercase tracking-wider">v2.0.0 Stable</span>
                <span className="flex items-center gap-1.5 text-emerald-500 font-sans font-medium text-[10px]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Connected
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className={isCollapsed ? "mx-2 mb-2 border-t border-slate-200 dark:border-white/5" : "mx-4 mb-2 border-t border-slate-200 dark:border-white/5"} />
              <div className={`shrink-0 pb-4 flex flex-col justify-center ${isCollapsed ? "px-2" : "px-3 w-full"}`}>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  onMouseEnter={() => !isCollapsed && setIsHoveredProfile(true)}
                  onMouseLeave={() => !isCollapsed && setIsHoveredProfile(false)}
                  onClick={() => {
                    if (isMobile) {
                      navigate('/profile');
                      toggleCollapse?.();
                    }
                  }}
                  className={`relative cursor-pointer select-none outline-none transition-all duration-200 ${isCollapsed
                    ? "mx-auto"
                    : "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-200/30 dark:hover:border-zinc-700/30"
                    }`}
                >
                  {isCollapsed ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300/40 hover:brightness-105 transition-all">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                        ) : (
                          <img src="/default-avatar.svg" alt="Default Avatar" className="w-full h-full object-cover" />
                        )}
                      </div>
                      {/* Dynamic Status bubble overlapping bottom profile card avatar */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full bg-white dark:bg-[#0e121f] flex items-center justify-center p-[2px] z-10">
                        {userStatus === "Online" && <div className="w-full h-full rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />}
                        {userStatus === "Idle" && (
                          <svg className="w-full h-full text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                          </svg>
                        )}
                        {userStatus === "Do Not Disturb" && (
                          <svg className="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {userStatus === "Invisible" && (
                          <svg className="w-full h-full text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Avatar on the left */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300/40 hover:brightness-105 transition-all">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                          ) : (
                            <img src="/default-avatar.svg" alt="Default Avatar" className="w-full h-full object-cover" />
                          )}
                        </div>
                        {/* Dynamic Status bubble */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full bg-white dark:bg-[#0e121f] flex items-center justify-center p-[2px] z-10">
                          {userStatus === "Online" && <div className="w-full h-full rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />}
                          {userStatus === "Idle" && (
                            <svg className="w-full h-full text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                            </svg>
                          )}
                          {userStatus === "Do Not Disturb" && (
                            <svg className="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5z" clipRule="evenodd" />
                            </svg>
                          )}
                          {userStatus === "Invisible" && (
                            <svg className="w-full h-full text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Text in the middle */}
                      <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight font-sans">
                            {getCleanedFullName(displayName || "Alex Mitchell")}
                          </span>
                          {isCreator && (
                            <div className="px-1 py-0.5 rounded border shrink-0 flex items-center bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30">
                              <Crown size={8} className="text-purple-600 dark:text-purple-400 mr-0.5" />
                              <span className="text-[8px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                Creator
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="relative h-[16px] w-full overflow-hidden mt-0.5 select-none">
                          <span className={`absolute inset-0 text-[12px] text-slate-450 dark:text-slate-400 font-semibold truncate transition-all duration-300 ease-out transform font-sans ${isHoveredProfile ? "opacity-0 -translate-y-2.5 pointer-events-none" : "opacity-100 translate-y-0"
                            }`}>
                            {userStatus}
                          </span>
                          <span className={`absolute inset-0 text-[12px] text-slate-450 dark:text-slate-400 font-semibold truncate transition-all duration-300 ease-out transform font-sans ${isHoveredProfile ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5 pointer-events-none"
                            }`}>
                            @{username || "alextrades"}
                          </span>
                        </div>
                      </div>

                      {/* Double Chevron on the right */}
                      <ChevronsUpDown size={16} className="text-slate-455 dark:text-slate-400 shrink-0 mr-1" />
                    </>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" sideOffset={12} className="w-[325px] rounded-[18px] p-0 bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.02)] overflow-visible font-sans relative">
                {/* Cover Banner (Discord style) */}
                {bannerUrl ? (
                  <div className="h-[100px] w-full relative rounded-t-[18px] overflow-hidden">
                    <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }} />
                  </div>
                ) : (
                  <div className="h-[100px] bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-600 dark:to-purple-600 w-full relative rounded-t-[18px]" />
                )}

                {/* Avatar Overlay & Details */}
                <div className="px-4 pb-3 relative">
                  {/* Avatar circle overlapping banner - exactly half-up the cover pic! */}
                  <div className="absolute -top-[42px] left-3 z-10">
                    <div className="w-[84px] h-[84px] rounded-full bg-white dark:bg-[#1E1E1E] p-1.5 relative select-none">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative border border-slate-200/40">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                        ) : (
                          <img src="/default-avatar.svg" alt="Default Avatar" className="w-full h-full object-cover" />
                        )}
                      </div>
                      {/* Dynamic Status bubble matching selected user status */}
                      <div className="absolute bottom-0.5 right-0.5 w-[24px] h-[24px] rounded-full bg-white dark:bg-[#1E1E1E] flex items-center justify-center p-[3px]">
                        {userStatus === "Online" && <div className="w-full h-full rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
                        {userStatus === "Idle" && (
                          <svg className="w-full h-full text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                          </svg>
                        )}
                        {userStatus === "Do Not Disturb" && (
                          <svg className="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {userStatus === "Invisible" && (
                          <svg className="w-full h-full text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="4.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Info details - beautifully pushed to the right of the avatar with pt-3 to center vertically alongside the lower half of the avatar */}
                  <div className="pt-3 pl-[92px] flex flex-col min-w-0 font-sans">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-sans text-[15.5px] font-bold text-slate-800 dark:text-white leading-tight tracking-tight truncate text-left">
                          {getCleanedFullName(displayName || "Alex Mitchell")}
                        </span>
                        {isCreator && (
                          <div className="px-1.5 py-0.5 rounded-md border shrink-0 flex items-center bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30">
                            <Crown size={9} className="text-purple-600 dark:text-purple-400 mr-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              Creator
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-sans text-[12.5px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1.5 text-left">
                        @{username || "alextrades"}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="mx-4 my-1.5 bg-zinc-100 dark:bg-zinc-800" />

                {/* Menu items (Profile, Online Status, Switch Accounts, Settings) */}
                <div className="px-2 pb-1.5 pt-0.5 space-y-0.5">
                  {/* Profile */}
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus:bg-zinc-50 dark:focus:bg-zinc-800/60 outline-none group text-slate-700 dark:text-slate-300 font-sans w-full border border-transparent hover:border-zinc-100/50 dark:hover:border-zinc-800/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <IconlyUser set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                      <span className="text-[14px] font-semibold flex-1 text-left truncate font-sans">Profile</span>
                    </div>
                  </DropdownMenuItem>

                  {/* Online Status container wrapper with hover states */}
                  <div
                    onMouseEnter={() => {
                      setIsStatusOpen(true);
                      setIsSwitchOpen(false);
                    }}
                    onMouseLeave={() => {
                      setIsStatusOpen(false);
                    }}
                    className="relative"
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsStatusOpen(!isStatusOpen);
                        setIsSwitchOpen(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus:bg-zinc-50 dark:focus:bg-zinc-800/60 outline-none group text-slate-700 dark:text-slate-300 font-sans w-full border border-transparent hover:border-zinc-100/50 dark:hover:border-zinc-800/30"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
                          {userStatus === "Online" && <StatusOnlineIcon />}
                          {userStatus === "Idle" && <StatusIdleIcon />}
                          {userStatus === "Do Not Disturb" && <StatusDndIcon />}
                          {userStatus === "Invisible" && <StatusInvisibleIcon />}
                        </div>
                        <span className="truncate text-[14px] font-semibold text-left font-sans">Online Status</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 dark:text-slate-400 transition-all duration-200 shrink-0 ${isStatusOpen ? 'translate-x-0.5 text-slate-700 dark:text-slate-300' : ''}`} />
                    </DropdownMenuItem>

                    {/* Status Flyout Card (Pops out perfectly aligned vertically next to Online status item!) */}
                    {isStatusOpen && (
                      <div className="absolute left-full top-0 ml-3 w-[260px] bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/5 rounded-[16px] p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.02)] z-[100] animate-slideInRight space-y-0.5 select-none text-left font-sans before:absolute before:right-full before:top-0 before:bottom-0 before:w-4 before:bg-transparent">
                        <div
                          onClick={(e) => { e.stopPropagation(); setUserStatus("Online"); localStorage.setItem("tradifive_user_status", "Online"); setIsStatusOpen(false); }}
                          className="flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <StatusOnlineIcon />
                          <span className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 font-sans">Online</span>
                        </div>

                        <div
                          onClick={(e) => { e.stopPropagation(); setUserStatus("Idle"); localStorage.setItem("tradifive_user_status", "Idle"); setIsStatusOpen(false); }}
                          className="flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <StatusIdleIcon />
                          <span className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 font-sans">Idle</span>
                        </div>

                        <div
                          onClick={(e) => { e.stopPropagation(); setUserStatus("Do Not Disturb"); localStorage.setItem("tradifive_user_status", "Do Not Disturb"); setIsStatusOpen(false); }}
                          className="flex flex-col p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <StatusDndIcon />
                            <span className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 font-sans">Do Not Disturb</span>
                          </div>
                          <span className="text-[10px] text-slate-455 dark:text-slate-400 pl-5 mt-0.5 leading-normal font-medium font-sans">You will not receive desktop notifications</span>
                        </div>

                        <div
                          onClick={(e) => { e.stopPropagation(); setUserStatus("Invisible"); localStorage.setItem("tradifive_user_status", "Invisible"); setIsStatusOpen(false); }}
                          className="flex flex-col p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <StatusInvisibleIcon />
                            <span className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 font-sans">Invisible</span>
                          </div>
                          <span className="text-[10px] text-slate-455 dark:text-slate-400 pl-5 mt-0.5 leading-normal font-medium font-sans">You will appear offline</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Switch Accounts container wrapper with hover states */}
                  <div
                    onMouseEnter={() => {
                      setIsSwitchOpen(true);
                      setIsStatusOpen(false);
                    }}
                    onMouseLeave={() => {
                      setIsSwitchOpen(false);
                    }}
                    className="relative"
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSwitchOpen(!isSwitchOpen);
                        setIsStatusOpen(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus:bg-zinc-50 dark:focus:bg-zinc-800/60 outline-none group text-slate-700 dark:text-slate-300 font-sans w-full border border-transparent hover:border-zinc-100/50 dark:hover:border-zinc-800/30"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <TwoUsers set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 transition-colors shrink-0" />
                        <span className="truncate text-[14px] font-semibold text-left font-sans">Switch Accounts</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 dark:text-slate-400 transition-all duration-200 shrink-0 ${isSwitchOpen ? 'translate-x-0.5 text-slate-700 dark:text-slate-300 font-sans' : ''}`} />
                    </DropdownMenuItem>

                    {/* Switch Account Flyout Card (pops out vertically perfectly next to Switch Accounts menu item!) */}
                    {isSwitchOpen && (
                      <div className="absolute left-full top-0 ml-3 w-[310px] bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/5 rounded-[18px] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.02)] z-[100] animate-slideInRight select-none text-left font-sans before:absolute before:right-full before:top-0 before:bottom-0 before:w-4 before:bg-transparent">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2.5 px-0.5 select-none font-sans">
                          Switch Account
                        </div>

                        {/* Active Profile */}
                        <div className="flex items-center justify-between p-2.5 mb-2.5 bg-zinc-50/20 hover:bg-zinc-50 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 border border-zinc-100/50 dark:border-zinc-800/50 rounded-xl cursor-pointer transition-colors group font-sans">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300/40 p-0.5">
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                                ) : (
                                  <img src="/default-avatar.svg" alt="Default Avatar" className="w-full h-full object-cover rounded-full" />
                                )}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-[11px] h-[11px] rounded-full bg-white dark:bg-[#1E1E1E] flex items-center justify-center p-[1px] z-10">
                                <div className="w-full h-full rounded-full bg-green-500" />
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight font-sans">{getCleanedFullName(displayName)}</span>
                              <span className="text-[11.5px] text-slate-400 dark:text-slate-400 font-medium mt-0.5 font-sans">@{username}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border ${isCreator ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400' : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300'}`}>
                            {userPlan} Plan
                          </span>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between pt-1">
                          <div
                            onMouseEnter={() => import("../pages/Settings")}
                            onClick={(e) => { e.stopPropagation(); React.startTransition(() => navigate("/settings")); setIsSwitchOpen(false); }}
                            className="flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors"
                          >
                            <Plus size={14} className="text-slate-450 dark:text-slate-400" />
                            <span className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-300 font-sans">Create new</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); React.startTransition(() => navigate("/upgrade")); setIsSwitchOpen(false); }}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-[11.5px] flex items-center gap-1 transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98] font-sans"
                          >
                            <Sparkles size={11.5} /> Upgrade
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <DropdownMenuItem
                    onClick={() => React.startTransition(() => navigate("/settings"))}
                    onMouseEnter={() => import("../pages/Settings")}
                    className="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus:bg-zinc-50 dark:focus:bg-zinc-800/60 outline-none group text-slate-700 dark:text-slate-300 font-sans w-full border border-transparent hover:border-zinc-100/50 dark:hover:border-zinc-800/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Setting set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                      <span className="text-[14px] font-semibold flex-1 text-left truncate font-sans">Settings</span>
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="mx-4 my-1.5 bg-zinc-100 dark:bg-zinc-800" />

                {/* Logout button */}
                <div className="px-2 pb-2">
                  <DropdownMenuItem
                    onClick={handleLogoutClick}
                    className="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/20 dark:focus:bg-red-950/20 outline-none text-slate-650 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 group w-full"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Logout set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-red-550 transition-colors shrink-0" />
                      <span className="text-[14px] font-bold flex-1 text-left truncate font-sans">Logout</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
          <style dangerouslySetInnerHTML={{
            __html: `
         .scrollbar-hide::-webkit-scrollbar {
           display: none;
         }
         .scrollbar-hide {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }
         @keyframes slideInRight {
           from {
             opacity: 0;
             transform: translateX(12px) scale(0.96);
           }
           to {
             opacity: 1;
             transform: translateX(0) scale(1);
           }
         }
         .animate-slideInRight {
           animation: slideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
         }
         @keyframes fadeIn {
           from {
             opacity: 0;
             transform: translateY(8px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         .animate-fadeIn {
           animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
         }
       `
          }} />
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99999] bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center select-none font-sans w-screen h-screen"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full max-w-[300px] flex flex-col items-center justify-center"
            >
              {/* Up: Motivational Message */}
              <p className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mb-8 text-center px-4 leading-relaxed">
                {selectedQuote}
              </p>

              {/* Middle: Loading Bar */}
              <div className="relative w-full">
                {/* The Bar Track */}
                <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Down: Signing out */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-[0.15em] uppercase mt-5 animate-[fadeInUp_0.4s_ease-out] text-center animate-pulse">
                Signing out...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#333333] shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Logout set="bold" className="text-red-500" size={24} />
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Are you sure you want to log out? You will need to log in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#333333] text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-md shadow-red-500/20 flex items-center justify-center min-w-[100px]"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Log Out"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
