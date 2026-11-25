import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { Search, Bell, Clock, ChevronLeft, Sparkles, AlertTriangle, XCircle, ShieldAlert, Timer, X, Bot, Menu, Monitor, Zap, Gauge, Plus, Star } from "lucide-react";
import AppSidebar from "./AppSidebar";
import FloatingAICoach from "./FloatingAICoach";
import { PurchaseCreditsModal } from "./PurchaseCreditsModal";
import ComingSoonVeil from "./ComingSoonVeil";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation, useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/lib/supabase";
import BottomNav from "./BottomNav";
import NotificationHub from "./NotificationHub";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import FiAlgoLayout from "./FiAlgoLayout";
import { getGamificationState } from "@/utils/gamification";

interface Breadcrumb {
  label: string;
  path?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  onBack?: () => void;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
  noScroll?: boolean;
  hideBottomNav?: boolean;
  fullScreen?: boolean;
}

function getComingSoonInfo(_pathname: string): { isSoon: boolean; title: string } {
  // Coming Soon veil disabled across TradiFive workspace - all features live & accessible
  return { isSoon: false, title: "" };
}

export default function DashboardLayout({ children, breadcrumbs, onBack, headerActions, noPadding = false, noScroll = false, hideBottomNav = false, fullScreen = false }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  const [emergencyHaltActive, setEmergencyHaltActive] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [alertKey, setAlertKey] = useState(0);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isPurchaseCreditsOpen, setIsPurchaseCreditsOpen] = useState(false);
  const [initialCoachMessage, setInitialCoachMessage] = useState<{ text: string; autoSend?: boolean; postContext?: any } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const constraintsRef = useRef(null);

  // Revenge trade cooldown violation detection
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0);
  const [showRevengeFlash, setShowRevengeFlash] = useState(false);
  const [lastKnownTradeCount, setLastKnownTradeCount] = useState<number | null>(null);
  const { recentTrades } = useDashboardData();
  const comingSoonInfo = getComingSoonInfo(location.pathname);
  const [isPeeking, setIsPeeking] = useState(false);

  const isCommunityRoute =
    location.pathname.startsWith('/home') ||
    location.pathname.startsWith('/discover') ||
    location.pathname.startsWith('/marketplace') ||
    location.pathname.startsWith('/channel') ||
    location.pathname.startsWith('/store') ||
    location.pathname.startsWith('/learning') ||
    location.pathname.startsWith('/courses');
  const transitionKey = isCommunityRoute ? 'community' : location.pathname;

  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsPeeking(false);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleOpenFloatingAI = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.text) {
        setInitialCoachMessage({
          text: customEvent.detail.text,
          autoSend: !!customEvent.detail.autoSend,
          postContext: customEvent.detail.postContext || null
        });
      }
      setIsAIOpen(true);
    };
    window.addEventListener("open-floating-ai-coach", handleOpenFloatingAI);
    return () => window.removeEventListener("open-floating-ai-coach", handleOpenFloatingAI);
  }, []);



  // Monitor cooldown state from localStorage
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const saved = localStorage.getItem('fialgo_cooldown');
        if (saved) {
          const cd = JSON.parse(saved);
          if (cd.active && cd.endsAt > Date.now()) {
            setCooldownActive(true);
            setCooldownEndsAt(cd.endsAt);
          } else {
            setCooldownActive(false);
            setCooldownEndsAt(0);
          }
        } else {
          setCooldownActive(false);
          setCooldownEndsAt(0);
        }
      } catch (e) { console.error(e); }
    };

    checkCooldown();
    window.addEventListener('fialgo_cooldown_changed', checkCooldown);
    window.addEventListener('storage', checkCooldown);
    // Also check periodically to catch expiry
    const interval = setInterval(checkCooldown, 5000);

    return () => {
      window.removeEventListener('fialgo_cooldown_changed', checkCooldown);
      window.removeEventListener('storage', checkCooldown);
      clearInterval(interval);
    };
  }, []);

  // Detect new trades during cooldown → trigger violation flash
  useEffect(() => {
    if (!recentTrades || recentTrades.length === 0) return;

    // Initialize trade count on first load
    if (lastKnownTradeCount === null) {
      setLastKnownTradeCount(recentTrades.length);
      return;
    }

    // Check if a new trade appeared while cooldown is active
    if (recentTrades.length > lastKnownTradeCount && cooldownActive) {
      setShowRevengeFlash(true);
      toast.error("⚠️ REVENGE TRADE DETECTED", {
        description: "Cooldown shield is active. Wait for the timer to expire before trading.",
        duration: 8000
      });
    }

    setLastKnownTradeCount(recentTrades.length);
  }, [recentTrades, cooldownActive, lastKnownTradeCount]);

  useEffect(() => {
    if (emergencyHaltActive) {
      setAlertKey(prev => prev + 1);
    }
  }, [emergencyHaltActive]);

  useEffect(() => {
    const checkHalt = () => {
      const saved = localStorage.getItem('fialgo_risk_config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          const active = config.autoTrading === true;
          setEmergencyHaltActive(active);

          if (active) {
            const triggerFlash = sessionStorage.getItem('fialgo_trigger_flash');
            if (triggerFlash === 'true') {
              setShowFlash(true);
              sessionStorage.removeItem('fialgo_trigger_flash');
            }
          } else {
            setShowFlash(false);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setEmergencyHaltActive(false);
        setShowFlash(false);
      }
    };

    checkHalt();

    window.addEventListener('fialgo_config_changed', checkHalt);
    window.addEventListener('storage', checkHalt);

    return () => {
      window.removeEventListener('fialgo_config_changed', checkHalt);
      window.removeEventListener('storage', checkHalt);
    };
  }, []);
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      const manual = localStorage.getItem("fialgo_sidebar_collapsed_user_manual");
      if (!manual && typeof window !== "undefined") {
        setIsCollapsed(window.innerWidth < 1280);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("fialgo_sidebar_collapsed");
      if (saved !== null) return saved === "true";
      if (typeof window !== "undefined") {
        return window.innerWidth < 1280;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const [isFullScreen, setIsFullScreen] = useState(() => {
    try {
      return localStorage.getItem("fialgo_full_screen") === "true";
    } catch (e) {
      return false;
    }
  });

  // Effective Full Screen: True if toggled, passed via prop, or on AutoTrade setup route
  const isEffectiveFullScreen = isFullScreen || fullScreen;
  const isHomePage =
    location.pathname === "/" ||
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/post/") ||
    location.pathname.startsWith("/inbox") ||
    location.pathname.startsWith("/channel") ||
    location.pathname.startsWith("/discover");
  const { isFiAlgo } = useWorkspace();

  const [bgFadeStyle, setBgFadeStyle] = useState(() => {
    try {
      return localStorage.getItem("fialgo_bg_fade_style") || "purple";
    } catch (e) {
      return "purple";
    }
  });

  useEffect(() => {
    const handleLayoutChange = () => {
      setIsFullScreen(localStorage.getItem("fialgo_full_screen") === "true");
    };
    const handleBgChange = () => {
      setBgFadeStyle(localStorage.getItem("fialgo_bg_fade_style") || "purple");
    };

    window.addEventListener('fialgo_full_screen_changed', handleLayoutChange);
    window.addEventListener('fialgo_bg_style_changed', handleBgChange);
    window.addEventListener('storage', handleLayoutChange);
    window.addEventListener('storage', handleBgChange);

    return () => {
      window.removeEventListener('fialgo_full_screen_changed', handleLayoutChange);
      window.removeEventListener('fialgo_bg_style_changed', handleBgChange);
      window.removeEventListener('storage', handleLayoutChange);
      window.removeEventListener('storage', handleBgChange);
    };
  }, []);


  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("fialgo_sidebar_collapsed", String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const [impersonatingUser, setImpersonatingUser] = useState<string | null>(null);
  const [mobileUsername, setMobileUsername] = useState(() => 
    localStorage.getItem("tradifive_cached_username") || "trader"
  );
  const [mobileAvatarUrl, setMobileAvatarUrl] = useState(() => 
    localStorage.getItem("tradifive_cached_avatar_url") || ""
  );

  // Real-time AI Credits state for the header badge
  const [aiCreditsRemaining, setAiCreditsRemaining] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("tradifive_ai_credits_remaining");
      return saved !== null ? Number(saved) : 10;
    } catch {
      return 10;
    }
  });
  const [aiCreditsMax, setAiCreditsMax] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("tradifive_ai_credits_max");
      return saved !== null ? Number(saved) : 10;
    } catch {
      return 10;
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("tradifive_forex_discipline_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.streakDays === "number" && parsed.streakDays !== 16 && parsed.streakDays !== 18) return parsed.streakDays;
      }
      const gam = localStorage.getItem("tradifive_gamification_state");
      if (gam) {
        const parsed = JSON.parse(gam);
        if (typeof parsed?.streak === "number") return parsed.streak;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [hasConnectedAccount, setHasConnectedAccount] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem("tradifive_cached_account_number"));
    } catch {
      return false;
    }
  });

  const [totalXP, setTotalXP] = useState<number>(() => {
    try {
      const gam = getGamificationState();
      if (typeof gam?.xp === "number" && gam.xp > 0 && gam.xp !== 1030 && gam.xp !== 3030 && gam.xp !== 350) return gam.xp;
      const raw = localStorage.getItem("tradifive_forex_discipline_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.xp === "number" && parsed.xp > 0 && parsed.xp !== 1030 && parsed.xp !== 3030 && parsed.xp !== 350) return parsed.xp;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const fetchAICredits = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase.rpc('get_ai_credits', {
        p_user_id: session.user.id
      });

      if (!error && data) {
        const remaining = data.credits_remaining ?? 10;
        const max = data.credits_max ?? 10;
        setAiCreditsRemaining(remaining);
        setAiCreditsMax(max);
        try {
          localStorage.setItem("tradifive_ai_credits_remaining", String(remaining));
          localStorage.setItem("tradifive_ai_credits_max", String(max));
        } catch (_) {}
      }
    } catch (e) {
      console.warn("Could not fetch AI credits:", e);
    }
  }, []);

  useEffect(() => {
    fetchAICredits();

    const handleCreditsUpdated = (e: any) => {
      if (e?.detail?.creditsRemaining !== undefined) {
        setAiCreditsRemaining(e.detail.creditsRemaining);
      }
      if (e?.detail?.creditsMax !== undefined) {
        setAiCreditsMax(e.detail.creditsMax);
      }
    };

    const handleDisciplineUpdated = (e: any) => {
      if (e?.detail?.streakDays !== undefined) {
        setStreakDays(e.detail.streakDays);
      }
    };
    const handleXPUpdated = () => {
      try {
        const gam = getGamificationState();
        if (gam?.xp) setTotalXP(gam.xp);
        const raw = localStorage.getItem("tradifive_forex_discipline_state");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.xp) setTotalXP(parsed.xp);
          if (parsed.streakDays) setStreakDays(parsed.streakDays);
        }
      } catch (_) {}
    };

    window.addEventListener("tradifive_credits_updated", handleCreditsUpdated);
    window.addEventListener("tradifive_profile_update", fetchAICredits);
    window.addEventListener("tradifive_discipline_update", handleDisciplineUpdated);
    window.addEventListener("tradifive_xp_update", handleXPUpdated);
    return () => {
      window.removeEventListener("tradifive_credits_updated", handleCreditsUpdated);
      window.removeEventListener("tradifive_profile_update", fetchAICredits);
      window.removeEventListener("tradifive_discipline_update", handleDisciplineUpdated);
      window.removeEventListener("tradifive_xp_update", handleXPUpdated);
    };
  }, [fetchAICredits]);

  useEffect(() => {
    let isMounted = true;
    const fetchMobileProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;
        const defaultUsername = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || "trader";
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, xp_total, streak_days')
          .eq('id', user.id)
          .maybeSingle();

        const { data: mt5 } = await supabase
          .from('mt5_accounts')
          .select('account_number')
          .eq('user_id', user.id)
          .maybeSingle();

        const connected = Boolean(mt5?.account_number);
        setHasConnectedAccount(connected);

        if (profile && isMounted) {
          const resolvedUsername = profile.username || defaultUsername;
          const resolvedAvatar = profile.avatar_url || "";
          setMobileUsername(resolvedUsername);
          setMobileAvatarUrl(resolvedAvatar);
          if (typeof profile.xp_total === "number" && profile.xp_total !== 1030 && profile.xp_total !== 3030 && profile.xp_total !== 350) {
            setTotalXP(profile.xp_total);
          }
          if (typeof profile.streak_days === "number" && connected && profile.streak_days !== 16 && profile.streak_days !== 18) {
            setStreakDays(profile.streak_days);
          } else if (!connected) {
            setStreakDays(0);
          }
          localStorage.setItem("tradifive_cached_username", resolvedUsername);
          if (resolvedAvatar) localStorage.setItem("tradifive_cached_avatar_url", resolvedAvatar);
        } else if (isMounted) {
          setMobileUsername(defaultUsername);
        }
      } catch (err) {
        // silent fallback to cached state
      }
    };
    fetchMobileProfile();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const impersonated = localStorage.getItem("fialgo_impersonating_user");
    if (impersonated) {
      setImpersonatingUser(impersonated);
    }
  }, []);

  const handleExitGodMode = () => {
    localStorage.removeItem("fialgo_impersonating_user");
    window.location.href = "/admin";
  };

  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Clean up display segments to match sidebar labels
  let displaySegments = [...pathSegments];
  if (displaySegments[0] === 'competitions') {
    if (displaySegments[1] === 'dashboard') {
      displaySegments = ['competitions'];
    } else if (displaySegments[1] === 'rewards') {
      displaySegments = ['rewards'];
    }
  }

  const lastSegment = displaySegments[displaySegments.length - 1] || "dashboard";

  // Format string utility: capitalize and replace hyphens with spaces
  const formatSegment = (str: string) => {
    const lower = str.toLowerCase();
    if (lower === 'ai-coach') return 'AI Coach';
    if (lower === 'risk-guard') return 'Risk Guard';
    if (lower === 'channel') return 'Channels';
    if (lower === 'live') return 'Live';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
  };

  const resolveDesktopPageName = (): string => {
    const p = location.pathname;
    const params = new URLSearchParams(location.search);
    if (p === '/home') return params.get('tab') === 'saved' ? 'Saved' : 'Home';
    if (p.startsWith('/discover') || p.startsWith('/marketplace')) return 'Discover';
    if (p.startsWith('/channel')) return 'Channels';
    if (p.startsWith('/inbox')) return 'Inbox';
    if (p.startsWith('/post/')) return 'Post';
    if (p.startsWith('/user/')) return 'Profile';
    if (p === '/profile') return 'Profile';
    if (p === '/dashboard') return 'Dashboard';
    if (p.startsWith('/journal/history')) return 'Trade History';
    if (p.startsWith('/journal')) return 'Journal';
    if (p.startsWith('/risk-guard')) return 'Risk Guard';
    if (p.startsWith('/auto-trade/setup')) return 'Auto Trade Setup';
    if (p.startsWith('/auto-trade/dashboard')) return 'Execution Dashboard';
    if (p.startsWith('/auto-trade/active-bots')) return 'Active Bots';
    if (p.startsWith('/strategy-builder')) return 'Strategy Builder';
    if (p.startsWith('/auto-trade/history')) return 'Order History';
    if (p.startsWith('/weekly-settlements')) return 'Weekly Settlements';
    if (p.startsWith('/auto-trade/license')) return 'EA License & Keys';
    if (p.startsWith('/ai-coach')) return 'AI Coach';
    if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs[breadcrumbs.length - 1].label;
    return formatSegment(lastSegment);
  };

  const title = formatSegment(lastSegment);
  const desktopPageName = resolveDesktopPageName();

  const getCategoryName = (pathname: string) => {
    if (pathname.startsWith('/fialgo') || pathname.startsWith('/auto-trade') || pathname.startsWith('/strategy-builder') || pathname.startsWith('/weekly-settlements')) return 'AutoTrade';
    if (pathname.startsWith('/inbox') || pathname.startsWith('/notifications')) return 'Communication';
    if (pathname.startsWith('/competitions') || pathname.startsWith('/rewards')) return 'Engagement';
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/settings') || pathname.startsWith('/profile') || pathname.startsWith('/support') || pathname.startsWith('/feedback')) return 'Settings & Support';
    return 'Main Menu';
  };

  const categoryName = getCategoryName(location.pathname);

  const { } = useTrading();
  const { activeMarket } = useMarket();

  let gradientClass = "from-[#e9ecef] via-[#f1f3f5] to-[#f4f6f8]"; // default gray
  if (bgFadeStyle === 'purple') {
    gradientClass = "from-[#edf2fb] via-[#f4f7fd] to-[#f8faff]";
  } else if (bgFadeStyle === 'black') {
    gradientClass = "from-[#d7dadd] via-[#e2e5e8] to-[#f1f3f5]"; // A darker gray/black fade for light mode
  } else if (bgFadeStyle === 'blue') {
    gradientClass = "from-[#e0f2fe] via-[#f0f9ff] to-[#f4faff]";
  } else if (bgFadeStyle === 'rose') {
    gradientClass = "from-[#ffe4e6] via-[#fff1f2] to-[#fff5f6]";
  }

  return (
    <div ref={constraintsRef} className="min-h-screen bg-[#F1F3F6] dark:bg-[#09090B] flex relative overflow-hidden">

      {!isMobile && (
        <div className="hidden md:block">
          <AppSidebar isCollapsed={isCollapsed} toggleCollapse={handleToggleCollapse} isFullScreen={isEffectiveFullScreen} />
        </div>
      )}

      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isMounted ? 'transition-[margin-left] duration-300' : ''} ml-0 ${isCollapsed ? 'md:ml-[90px]' : 'md:ml-[340px]'}`}>

        {impersonatingUser && (
          <div className="bg-rose-500 text-white px-4 py-2 flex items-center justify-center gap-3 shrink-0 shadow-lg z-50">
            <AlertTriangle size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">
              God Mode Active: Viewing data as user ID ({impersonatingUser.slice(0, 8)}...)
            </span>
            <button
              onClick={handleExitGodMode}
              className="ml-4 flex items-center gap-1 bg-black/20 hover:bg-black/40 px-3 py-1 rounded-md text-xs font-bold transition-colors"
            >
              <XCircle size={14} /> Exit God Mode
            </button>
          </div>
        )}

        {/* Top Logo Header — sits cleanly ABOVE the floating rounded content box on ALL pages */}
        {!isEffectiveFullScreen && (
          <header className={`h-[56px] sm:h-[62px] flex items-center justify-between px-3.5 sm:px-5 md:px-6 shrink-0 transition-all duration-300 ${comingSoonInfo.isSoon && !isPeeking ? "filter blur-[1.5px] opacity-85 pointer-events-none select-none" : ""}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* DESKTOP WEB APP (md+): Always show clean page name breadcrumb (no duplicate top-left logo) */}
              <div className="hidden md:flex items-center gap-2 text-[14px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-slate-400 dark:text-neutral-500">
                  {categoryName}
                </span>
                <span className="text-slate-300 dark:text-slate-500">/</span>
                <span className="text-[15px] font-semibold text-slate-900 dark:text-white">
                  {desktopPageName}
                </span>
              </div>

              {/* MOBILE WEB VIEW (< md): Keep TradiFive logo on primary pages & back+title on sub-pages */}
              <div className="flex md:hidden items-center gap-2">
                {location.pathname === '/home' ||
                location.pathname === '/dashboard' ||
                location.pathname === '/journal' ||
                location.pathname === '/risk-guard' ||
                location.pathname.startsWith('/ai-coach') ? (
                  <div onClick={() => navigate('/home')} className="flex items-center gap-2 cursor-pointer">
                    <img src="/tf-logo.png" alt="Logo" className="w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] object-contain shrink-0" />
                    <img
                      src="/Tradifive_logo1.png"
                      alt="Tradifive"
                      className="h-[18px] sm:h-[22px] w-auto object-contain dark:hidden"
                    />
                    <img
                      src="/Dark mode logo with white.png"
                      alt="Tradifive"
                      className="h-[18px] sm:h-[22px] w-auto object-contain hidden dark:block"
                    />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onBack ? onBack : () => navigate(-1)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] font-extrabold transition-all border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none active:scale-95 select-none mr-1 pointer-events-auto"
                      title="Go Back"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[15px] font-semibold text-slate-900 dark:text-white capitalize">
                      {breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : title}
                    </span>
                  </>
                )}
              </div>
            </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                {headerActions}

                {/* Mobile Compact Total XP Badge */}
                <button
                  type="button"
                  onClick={() => navigate('/rewards')}
                  className="sm:hidden flex items-center gap-1 px-2 h-[26px] rounded-[8px] bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer select-none active:scale-95 transition-all text-slate-800 dark:text-slate-200"
                  title={`${(totalXP || 0).toLocaleString()} Total XP (Click to view Rewards)`}
                >
                  <Star size={11} className="fill-amber-400 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-bold tabular-nums tracking-tight leading-none">
                    {(totalXP || 0).toLocaleString()} XP
                  </span>
                </button>

                {/* Mobile Compact Credits Badge — [ (gauge) 40/250 + ] */}
                <div
                  onClick={() => setIsPurchaseCreditsOpen(true)}
                  className="sm:hidden flex items-center gap-1.5 px-2 h-[26px] rounded-[8px] bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer select-none active:scale-95 transition-all"
                  title={`${aiCreditsRemaining !== null ? aiCreditsRemaining : 10}/${aiCreditsMax} AI Credits (Click to top up)`}
                >
                  <Gauge size={12} className="text-slate-800 dark:text-slate-200 stroke-[2] shrink-0" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                    {aiCreditsRemaining !== null ? aiCreditsRemaining : 10}/{aiCreditsMax}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPurchaseCreditsOpen(true);
                    }}
                    className="p-0.5 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors shrink-0 -mr-0.5"
                    title="Add or purchase AI credits"
                  >
                    <Plus size={12} className="stroke-[2.4]" />
                  </button>
                </div>

                {/* Mobile Top-Right Profile with Username & Avatar */}
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="sm:hidden flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-white dark:bg-white/[0.08] hover:bg-white/80 dark:hover:bg-white/[0.12] shadow-[0_1px_4px_rgba(15,23,42,0.06)] active:scale-95 transition-all cursor-pointer"
                  title="Profile"
                  aria-label="Profile"
                >
                  <span className="text-[11.5px] font-bold text-slate-800 dark:text-white max-w-[80px] truncate leading-none">
                    {mobileUsername}
                  </span>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0 border border-white dark:border-white/20">
                    {mobileAvatarUrl ? (
                      <img
                        src={mobileAvatarUrl}
                        alt={mobileUsername}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-avatar.svg";
                        }}
                      />
                    ) : (
                      <img
                        src="/default-avatar.svg"
                        alt={mobileUsername}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </button>

                {/* Desktop Total XP Pill — [ ⭐ Total XP ] */}
                <button
                  type="button"
                  onClick={() => navigate('/rewards')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 h-[28px] rounded-[8px] bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer select-none hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-800 dark:text-slate-200"
                  title={`${(totalXP || 0).toLocaleString()} Total XP (View Rewards & Vault)`}
                >
                  <Star size={13} className="fill-amber-400 text-amber-500 shrink-0" />
                  <span className="text-[12px] font-bold tabular-nums tracking-tight leading-none">
                    {(totalXP || 0).toLocaleString()} XP
                  </span>
                </button>

                {/* Desktop Small AI Credits Badge — exact match to user design: [ (gauge) 40/250 + ] */}
                <div
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 h-[28px] rounded-[8px] bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer select-none hover:border-slate-300 dark:hover:border-white/20 transition-all"
                  title={`${aiCreditsRemaining !== null ? aiCreditsRemaining : 10}/${aiCreditsMax} AI Credits Remaining Today (Click to top up)`}
                  onClick={() => setIsPurchaseCreditsOpen(true)}
                >
                  <Gauge size={13.5} className="text-slate-800 dark:text-slate-200 stroke-[2] shrink-0" />
                  <span className="text-[12px] font-bold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                    {aiCreditsRemaining !== null ? aiCreditsRemaining : 10}/{aiCreditsMax}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPurchaseCreditsOpen(true);
                    }}
                    className="p-0.5 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 -mr-0.5"
                    title="Add or purchase AI credits"
                  >
                    <Plus size={13.5} className="stroke-[2.4]" />
                  </button>
                </div>
                
                {/* AI Coach Top-Right Button — toggles mini FloatingAICoach (hidden when already on /ai-coach) */}
                {!location.pathname.startsWith('/ai-coach') && (
                  <button
                    type="button"
                    onClick={() => setIsAIOpen(prev => !prev)}
                    title="Open Mini AI Coach"
                    className="hidden sm:flex items-center justify-center gap-2 px-3.5 sm:px-4 h-9 rounded-full tactile-white-pill font-semibold text-[13px] cursor-pointer select-none"
                  >
                    <Sparkles size={14.5} strokeWidth={2.2} className="text-slate-700 dark:text-slate-200" />
                    <span>AI Coach</span>
                  </button>
                )}
              </div>
          </header>
        )}

        {/* Main Content Box — sits below logo and above bottom nav on ALL pages, borderless with curved corners; all scrolling happens inside */}
        <div
          className={`flex-1 min-h-0 flex flex-col overflow-hidden ${
            isEffectiveFullScreen
              ? "p-0"
              : hideBottomNav
              ? "px-2.5 sm:px-4 md:px-5 pb-2.5 md:pb-5"
              : "px-2.5 sm:px-4 md:px-5 pb-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.6rem)] md:pb-5"
          }`}
        >
          <main
            className={`relative flex-1 h-full min-h-0 flex flex-col overflow-hidden border-0 ${
              isEffectiveFullScreen
                ? "rounded-none shadow-none"
                : "rounded-[14px] md:rounded-[18px] shadow-[0_2px_18px_rgba(15,23,42,0.055)] dark:shadow-none"
            } bg-white dark:bg-[#121212] font-sans`}
          >

            {/* Premium Global Emergency Halt Banner - Crimson red warning card with physics-based gravity drop & free drag */}
            <AnimatePresence>
              {showFlash && (
                <motion.div
                  key="halt-flash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.25, 0, 0.25, 0] }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.25, 0.5, 0.75, 1],
                    ease: "easeInOut"
                  }}
                  onAnimationComplete={() => setShowFlash(false)}
                  className="fixed inset-0 bg-red-500 z-[9998] pointer-events-none"
                />
              )}
              {emergencyHaltActive && (
                <div key="halt-banner" className="fixed inset-x-0 top-24 flex justify-center z-[9999] pointer-events-none">
                  <motion.div
                    key={`halt-card-motion-${alertKey}`}
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.05}
                    dragMomentum={true}
                    initial={{ opacity: 0, y: -450, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -450, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 13,
                      mass: 1.1
                    }}
                    className="w-fit max-w-[90%] sm:max-w-[480px] pointer-events-auto select-none cursor-grab active:cursor-grabbing"
                  >
                    <div className="p-5 rounded-[22px] bg-gradient-to-b from-[#FFF0F0] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#FCD1D1] dark:shadow-none flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F06363]/10 flex items-center justify-center text-[#F06363] shrink-0 border border-[#F06363]/20">
                        <AlertTriangle size={18} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Emergency Halt Active</h3>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium mt-1">
                          All open positions have been forced closed. Fialgo MT5 Bridge is ignoring new order commands.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Revenge Trade Violation Flash — 3x intense red screen flash */}
            <AnimatePresence>
              {showRevengeFlash && (
                <motion.div
                  key="revenge-flash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.35, 0, 0.35, 0, 0.35, 0] }}
                  transition={{
                    duration: 1.8,
                    times: [0, 0.14, 0.28, 0.42, 0.56, 0.70, 1],
                    ease: "easeInOut"
                  }}
                  onAnimationComplete={() => setShowRevengeFlash(false)}
                  className="fixed inset-0 bg-red-600 z-[9998] pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Internal Content Area - Scrollable STRICTLY inside the floating rounded box */}
            <div
              ref={contentScrollRef}
              style={{ WebkitOverflowScrolling: "touch" }}
              className={`flex-1 min-h-0 ${noScroll ? "overflow-hidden flex flex-col" : "overflow-y-auto overscroll-y-contain scrollbar-hide"} ${noPadding || noScroll ? "p-0" : isEffectiveFullScreen ? "p-0 sm:p-4 lg:p-6 pb-8" : "p-3 sm:p-5 md:p-8 pb-8"}`}
            >
              <PageTransition
                key={transitionKey}
                enableGlowSweep={!isCommunityRoute}
                className={`${noScroll || (comingSoonInfo.isSoon && !isPeeking) ? "flex-1 h-full flex flex-col min-h-0" : "min-h-full flex flex-col"} transition-all duration-300 ${comingSoonInfo.isSoon && !isPeeking ? "filter blur-[2px] opacity-85 pointer-events-none select-none" : ""}`}
              >
                {children}
              </PageTransition>
            </div>

            {/* Coming Soon Veil Overlay - Confined strictly to THIS page (<main>) */}
            {comingSoonInfo.isSoon && (
              <ComingSoonVeil featureTitle={comingSoonInfo.title} />
            )}

            {/* Global Floating AI Coach Widget */}
            <FloatingAICoach
              isOpen={isAIOpen}
              onClose={() => {
                setIsAIOpen(false);
                setInitialCoachMessage(null);
              }}
              initialMessage={initialCoachMessage}
              onClearInitialMessage={() => setInitialCoachMessage(null)}
            />

            {/* Add / Purchase AI Credits Modal */}
            <PurchaseCreditsModal
              isOpen={isPurchaseCreditsOpen}
              onClose={() => setIsPurchaseCreditsOpen(false)}
              creditsRemaining={aiCreditsRemaining !== null ? aiCreditsRemaining : 10}
              creditsMax={aiCreditsMax}
            />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!hideBottomNav && (
        <>
          {/* Mobile Floating AI Coach Button (Only on Mobile, NOT on Home, Dashboard, Journal, Risk Guard, or AI Coach) */}
          {!isHomePage &&
            location.pathname !== '/dashboard' &&
            !location.pathname.startsWith('/journal') &&
            !location.pathname.startsWith('/risk-guard') &&
            !location.pathname.startsWith('/ai-coach') && (
            <button
              type="button"
              onClick={() => navigate('/ai-coach')}
              className="sm:hidden fixed right-4 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] z-40 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl shadow-purple-500/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer border border-white/20"
              title="Open AI Coach"
              aria-label="Open AI Coach"
            >
              <Sparkles size={20} strokeWidth={2.5} className="text-white" />
            </button>
          )}

          <BottomNav />
        </>
      )}
    </div>
  );
}
