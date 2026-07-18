import {
  LayoutDashboard, ShieldAlert, BookOpen, Bell, Sparkles, Trophy, HelpCircle,
  Search, PanelLeftClose, PanelLeftOpen, Lock, ChevronDown, ChevronRight, ChevronLeft, Inbox, Moon, Palette, ChevronsUpDown, Clock, User, CreditCard, MessageSquare, UserCheck,
  Plus, Users, LayoutGrid, Shield, Gift, Compass, BookText, Brain, ShieldCheck, Target, Award, Mail, Crown, PlusCircle, X, GraduationCap, ShoppingBag, Video, Hash, Globe, TrendingUp, Home as LucideHome, UserPlus
} from "lucide-react";
import { Home, Category, Discovery, Document, Star, ShieldDone, TwoUsers, Scan, TicketStar, Discount, Work, Bag, Video as IconlyVideo, Message, Notification, Logout, Wallet, Setting, User as IconlyUser, Graph } from "react-iconly";
import { ENABLE_MOCK_DATA } from "@/lib/mockData";
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

// Dynamic communicationMenu will be defined inside AppSidebar component
const mainMenu = [
  { path: "/home", icon: WrappedIconly(Home), label: "Home" },
  { path: "/dashboard", icon: WrappedIconly(Category), label: "Dashboard" },
  { path: "/journal", icon: WrappedIconly(Document), label: "Journal" },
  { path: "/risk-guard", icon: WrappedIconly(ShieldDone), label: "Risk Guard" },
  { path: "/ai-coach", icon: WrappedSparkles, label: "AI Coach" },
  { path: "/discover", icon: WrappedIconly(Discovery), label: "Discover" },
  { path: "/channel", icon: WrappedIconly(TwoUsers), label: "Channel / Community", badge: ENABLE_MOCK_DATA ? "3" : undefined },
];

const engagementMenu = [
  { path: "/competitions/dashboard", icon: WrappedIconly(Scan), label: "Competitions", isLocked: true },
  { path: "/competitions/rewards", icon: WrappedIconly(TicketStar), label: "Rewards" },
  { path: "/referrals", icon: WrappedIconly(Discount), label: "Referrals" },
];

const creatorHubMenu = [
  { path: "/creator/analytics", icon: WrappedIconly(Graph), label: "Creator Dashboard" },
  { path: "/creator/mentorship", icon: WrappedIconly(Work), label: "Mentorship Hub" },
  { path: "/creator/store", icon: WrappedIconly(Bag), label: "My Store" },
  { path: "/creator/live", icon: WrappedIconly(IconlyVideo), label: "Live Sessions" },
];

const communityMenu = [
  { path: "/discover", icon: WrappedIconly(Discovery), label: "Discover" },
  { path: "/channel", icon: WrappedIconly(TwoUsers), label: "Channel / Community", badge: ENABLE_MOCK_DATA ? "3" : undefined },
];

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

    const dmChannel = supabase.channel('sidebar-unread-dms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dm_conversations',
      }, () => {
        fetchUnreadDMs(currentUserId);
      })
      .subscribe();

    const notificationsChannel = supabase.channel('sidebar-unread-notifications')
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
  }, [currentUserId]);

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

    return () => {
      observer.disconnect();
      window.removeEventListener("tradifive_xp_update", handleXPUpdate);
      window.removeEventListener("tradifive_profile_update", handleProfileUpdate);
      window.removeEventListener("storage", syncStorage);
      window.removeEventListener('fialgo_bg_style_changed', handleBgChange);
      window.removeEventListener('storage', handleBgChange);
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
    localStorage.removeItem("tradifive_cached_display_name");
    localStorage.removeItem("tradifive_cached_username");
    localStorage.removeItem("tradifive_cached_avatar_url");
    localStorage.removeItem("tradifive_cached_banner_url");
    localStorage.removeItem("tradifive_cached_mt5_acc");
    localStorage.removeItem("tradifive_cached_plan");
    localStorage.removeItem("tradifive_user_status");
    await supabase.auth.signOut();
    setIsLoggingOut(false);
    navigate("/login");
  };

  const communicationMenu = [
    { path: "/inbox", icon: WrappedIconly(Message), label: "Inbox", badge: ENABLE_MOCK_DATA ? "5" : (unreadDMs > 0 ? String(unreadDMs) : undefined) },
    { path: "/notifications", icon: WrappedIconly(Notification), label: "Notifications", badge: ENABLE_MOCK_DATA ? "12" : (unreadNotifications > 0 ? (unreadNotifications > 15 ? "15+" : String(unreadNotifications)) : undefined) },
  ];

  const renderMenuItem = (item: any) => {
    const active = location.pathname.startsWith(item.path) || (location.pathname === '/' && item.path === '/dashboard');

    return (
      <button
        key={item.label}
        id={`tour-nav-${item.label.toLowerCase().replace(/[\s\/]+/g, '-')}`}
        onClick={() => !item.isLocked && item.path !== "#" && React.startTransition(() => navigate(item.path))}
        className={`relative flex items-center justify-between transition-all duration-300 group ${isCollapsed
          ? "rounded-xl py-3 px-0 justify-center mx-2 w-auto h-[44px]"
          : `rounded-xl py-2.5 w-auto h-[42px] ${item.isChild ? "ml-8 mr-2 px-3" : "mx-3 px-3"}`
          } ${item.isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          } ${active
            ? theme === 'dark'
              ? "sidebar-magic-active border border-transparent"
              : "bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50"
            : "text-slate-500 dark:text-neutral-400 font-semibold hover:text-slate-900 hover:bg-slate-100/50 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
          }`}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Removed left-side active indicator */}
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full gap-0" : "gap-3"}`}>
          <item.icon set="curved" stroke="bold" primaryColor="currentColor" size={item.isChild ? 16 : 18} strokeWidth={2} className={`shrink-0 ${active ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-neutral-400 group-hover:text-slate-600 dark:group-hover:text-white"}`} />
          <span className={`text-[13px] ${item.isChild ? "text-[12px]" : ""} font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"}`}>
            {item.label}
          </span>
        </div>

        {item.isLocked && (
          <div className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[70px] opacity-100 ml-2"}`}>
            <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 px-2 py-[3px] rounded-full shrink-0 shadow-sm">
              <Lock size={10} className="text-indigo-500 shrink-0" />
              <span className="text-[8.5px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 leading-none">Soon</span>
            </div>
          </div>
        )}

        {item.badge && (
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[40px] opacity-100 ml-2"}`}>
            <span className="text-[11px] font-extrabold text-rose-500 min-w-[20px] text-right select-none drop-shadow-md inline-block whitespace-nowrap">
              {item.badge}
            </span>
          </div>
        )}

        {item.hasDropdown && (
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[20px] opacity-100 ml-2"}`}>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>
        )}

        {active && theme !== "dark" && (
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full shadow-[0_0_10px_rgba(37,99,235,0.4)] ${isCollapsed ? 'hidden' : 'block'}`} />
        )}
      </button>
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
          ? `flex h-full flex-col ${mobileBgClass} dark:bg-[#1E1E1E] w-full`
          : `fixed left-0 top-0 z-40 flex h-screen flex-col bg-transparent dark:bg-[#1E1E1E] backdrop-blur-md dark:backdrop-filter-none border-r-0 border-transparent dark:border-r dark:border-white/5 dark:rounded-r-3xl ${isMounted ? "transition-[width] duration-300" : ""
          } ${isCollapsed ? "w-[80px]" : "w-[280px]"}`
          }`}
        style={isFullScreen && !isMobile ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : {}}
      >

        {/* Floating Toggle Button */}
        {toggleCollapse && theme === 'dark' && (
          <button
            id="tour-collapse-btn"
            onClick={toggleCollapse}
            className="absolute -right-3 top-[31px] z-50 flex items-center justify-center w-6 h-6 rounded-full border border-slate-200/50 dark:border-white/10 bg-white dark:bg-[#2B2B2F] text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Header */}
        <div className={`relative flex h-[76px] items-center shrink-0 ${isCollapsed || theme !== 'dark' ? 'justify-center' : 'justify-between px-6'}`}>
          <div className="flex items-center justify-center overflow-hidden w-full">
            {theme === 'dark' ? (
              <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                <img src={logoOnly} alt="TradiFive Icon" className="h-[40px] object-contain shrink-0 transition-all duration-300" />
                <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100 -ml-1'}`}>
                  <img src="/Dark mode logo with white.png" alt="TradiFive Text" className="h-[24px] object-contain shrink-0 w-[120px]" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center transition-all duration-300">
                <img src={isCollapsed ? logoOnly : fialgoLogo} alt="TradiFive" className={`${isCollapsed ? 'h-[40px]' : 'h-[50px]'} object-contain shrink-0 transition-all duration-300`} />
              </div>
            )}
          </div>
        </div>

        <div className={isCollapsed ? "mx-2 border-t border-slate-200/60 dark:border-white/5" : "mx-5 border-t border-slate-200/60 dark:border-white/5"} />

        {/* Market Switcher */}
        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[100px] opacity-100"}`}>
          <div className="px-5 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={`mt-2 mb-2 flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#1A1A1C] border border-slate-200/60 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm ${isCollapsed ? "justify-center" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      {activeMarket === 'forex' ? (
                        <Globe size={14} />
                      ) : (
                        <TrendingUp size={14} />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 leading-none mb-0.5">Market</span>
                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                        {activeMarket === 'forex' ? 'Global (Forex)' : 'Indian Market'}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown size={14} className="text-slate-400 dark:text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[220px] rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 shadow-lg p-1.5">
                <DropdownMenuLabel className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 py-1.5">Select Primary Market</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                <DropdownMenuItem onClick={() => setActiveMarket('forex')} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${activeMarket === 'forex' ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500"><Globe size={12} /></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-slate-800 dark:text-white leading-tight">Global Markets</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Forex, Crypto, Commodities</span>
                  </div>
                  {activeMarket === 'forex' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveMarket('indian')} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all mt-1 ${activeMarket === 'indian' ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500"><TrendingUp size={12} /></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-slate-800 dark:text-white leading-tight">Indian Market</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">NSE, BSE, F&O</span>
                  </div>
                  {activeMarket === 'indian' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>



        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col pb-4 ${isCollapsed ? "px-2" : "px-2"}`}
        >

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

          {/* MAIN NAVIGATION — Always visible */}
          <div className={isCollapsed ? "mx-2 mb-3 border-t border-slate-200 dark:border-white/5" : "mx-6 mb-3 border-t border-slate-200 dark:border-white/5"} />
          <div className="pb-3">
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[30px] opacity-100 mb-2"}`}>
              <h3 className="text-slate-400 dark:text-neutral-400 text-[10px] font-extrabold uppercase tracking-[0.15em] px-6 font-sans whitespace-nowrap">Main Navigation</h3>
            </div>
            <div className="flex flex-col gap-1">
              {mainMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem)}
            </div>
          </div>

          {isCreator && (
            <>
              {/* CREATOR HUB — Creator Mode */}
              <div className={isCollapsed ? "mx-2 mb-3 border-t border-slate-200 dark:border-white/5" : "mx-6 mb-3 border-t border-slate-200 dark:border-white/5"} />
              <div className="pb-3">
                <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[30px] opacity-100 mb-2"}`}>
                  <h3 className="text-slate-400 dark:text-neutral-400 text-[10px] font-extrabold uppercase tracking-[0.15em] px-6 font-sans whitespace-nowrap">Creator Hub</h3>
                </div>
                <div className="flex flex-col gap-1">
                  {creatorHubMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem)}
                </div>
              </div>
            </>
          )}

          {/* ENGAGEMENT SECTION */}
          <div className={isCollapsed ? "mx-2 mb-3 border-t border-slate-200 dark:border-white/5" : "mx-6 mb-3 border-t border-slate-200 dark:border-white/5"} />
          <div className="pb-3">
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[30px] opacity-100 mb-2"}`}>
              <h3 className="text-slate-400 dark:text-neutral-400 text-[10px] font-extrabold uppercase tracking-[0.15em] px-6 font-sans whitespace-nowrap">Engagement</h3>
            </div>
            <div className="flex flex-col gap-1">
              {engagementMenu.filter(m => m.label.toLowerCase().includes(navSearchQuery.toLowerCase())).map(renderMenuItem)}
            </div>
          </div>

          {/* END OF SECTIONS */}
        </div>

        {/* UPGRADE CARDS */}
        {!isCreator && !hideProCard && (
          <div id="tour-pro-card" className={`px-4 mt-1 font-sans overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-[250px] opacity-100 mb-4"}`}>
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-[#161616] dark:to-[#111] rounded-2xl p-5 py-6 border border-indigo-100 dark:border-white/10 shadow-sm group">
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
                  onClick={() => navigate("/upgrade")}
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
                    {(userPlan === "intermediate" || userPlan === "pro") ? "Upgrade to Elite" : "Upgrade to Pro"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={isCollapsed ? "mx-2 mb-2 border-t border-slate-200 dark:border-white/5" : "mx-6 mb-2 border-t border-slate-200 dark:border-white/5"} />
        {/* Footer Profile */}
        <div className={`shrink-0 pb-4 flex justify-center ${isCollapsed ? "px-2" : "px-4 w-full"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                onMouseEnter={() => !isCollapsed && setIsHoveredProfile(true)}
                onMouseLeave={() => !isCollapsed && setIsHoveredProfile(false)}
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
