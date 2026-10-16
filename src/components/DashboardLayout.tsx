import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Clock, ChevronLeft, Sparkles, AlertTriangle, XCircle, ShieldAlert, Timer, X, Bot, Menu } from "lucide-react";
import AppSidebar from "./AppSidebar";
import FloatingAICoach from "./FloatingAICoach";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation, useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/lib/supabase";
import BottomNav from "./BottomNav";

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
}

export default function DashboardLayout({ children, breadcrumbs, onBack, headerActions, noPadding = false, noScroll = false }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [emergencyHaltActive, setEmergencyHaltActive] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [alertKey, setAlertKey] = useState(0);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [initialCoachMessage, setInitialCoachMessage] = useState<{ text: string; autoSend?: boolean; postContext?: any } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const constraintsRef = useRef(null);

  // Revenge trade cooldown violation detection
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0);
  const [showRevengeFlash, setShowRevengeFlash] = useState(false);
  const [lastKnownTradeCount, setLastKnownTradeCount] = useState<number | null>(null);
  const { recentTrades } = useDashboardData();

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

  // Global Direct Message Notifications
  useEffect(() => {
    let channel: any;
    const setupDMNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const chanId = Math.random().toString(36).substring(2, 8);
      channel = supabase.channel(`global-dm-notifications-${user.id}-${chanId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${user.id}` },
          async (payload) => {
            // Play notification sound
            try {
              // Modern subtle pop notification sound
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
              audio.volume = 0.6;
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.catch(e => console.log("Audio play blocked by browser:", e));
              }
            } catch (e) {
              console.log("Audio play error:", e);
            }

            // Get sender details
            const { data: sender } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('id', payload.new.sender_id)
              .single();

            const senderName = sender?.display_name || 'Someone';

            toast.custom((t) => (
              <div className="bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-white/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none flex flex-col p-4 w-full sm:w-[350px] gap-2.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-[16px]">📩</span> New message from {senderName}
                    </h4>
                    <p className="text-[14px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 truncate pr-2">
                      {payload.new.content}
                    </p>
                  </div>
                  <button
                    onClick={() => { toast.dismiss(t); navigate(`/messages`); }}
                    className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-xl text-[13px] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-sm"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ), { duration: 5000, id: `msg-${payload.new.id}` });
          }
        )
        .subscribe();
    };

    setupDMNotifications();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate]);

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
  }, []);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("fialgo_sidebar_collapsed") === "true";
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
    if (str.toLowerCase() === 'ai-coach') return 'AI Coach';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
  };

  const title = formatSegment(lastSegment);

  const getCategoryName = (pathname: string) => {
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
    <div ref={constraintsRef} className={`min-h-screen bg-gradient-to-br ${gradientClass} dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] flex relative overflow-hidden`}>

      {/* Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-black/[0.1] dark:hidden blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 dark:hidden blur-[120px] -z-10 animate-float" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-purple-400/5 dark:hidden blur-[100px] -z-10 animate-pulse" />

      <div className="hidden md:block">
        <AppSidebar isCollapsed={isCollapsed} toggleCollapse={handleToggleCollapse} isFullScreen={isFullScreen} />
      </div>

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

        {/* Main Content Area */}
        <div className={`flex-1 ${isFullScreen ? 'pl-0 pr-0 pt-0 pb-0' : `px-0 md:px-5 ${impersonatingUser ? 'pt-0 md:pt-3' : 'pt-0 md:pt-5'} pb-16 md:pb-5`} ${noScroll ? 'overflow-hidden h-full flex flex-col' : 'overflow-y-auto scrollbar-hide'}`}>
          <main
            className={`${noScroll ? 'flex-1 h-full flex flex-col overflow-hidden' : 'min-h-full'
              } ${isFullScreen ? 'rounded-none border-l border-slate-200 dark:border-white/5' : 'rounded-none md:rounded-[2.5rem] border-0 md:border md:border-slate-100 dark:md:border-white/5 shadow-none md:shadow-[0_8px_30_rgb(0,0,0,0.04)]'} bg-white dark:bg-[#121212] font-sans`}
          >
            {/* Header (Moved Inside to Scroll) */}
            <header className="h-[70px] flex items-center justify-between px-4 sm:px-10 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="md:hidden flex items-center">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] font-extrabold transition-all border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none active:scale-95 select-none mr-2">
                        <Menu size={16} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px] bg-white dark:bg-[#1E1E1E] border-r border-slate-200 dark:border-white/5">
                      <AppSidebar isMobile={true} toggleCollapse={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                  </Sheet>
                </div>
                <button
                  onClick={onBack ? onBack : () => navigate(-1)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] font-extrabold transition-all border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none hover:shadow-[0_6px_10px_-4px_rgba(0,0,0,0.15),_0_0_0_2px_#D4D4D4] dark:hover:shadow-none active:scale-95 select-none mr-2"
                  title="Go Back"
                >
                  <ChevronLeft size={16} />
                </button>
                {breadcrumbs && breadcrumbs.length > 0 ? (
                  <div className="hidden sm:flex items-center gap-2 text-[14px] font-semibold text-slate-500 dark:text-slate-400">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">{categoryName}</button>
                    <span className="text-slate-300 dark:text-slate-400">/</span>
                    {breadcrumbs.map((bc, idx) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span className={idx === breadcrumbs.length - 1 ? "text-[15px] font-semibold text-slate-900 dark:text-white capitalize" : "capitalize hover:text-indigo-500 transition-colors cursor-pointer"}>{bc.label}</span>
                        {idx < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-400">/</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 text-[14px] font-semibold text-slate-500 dark:text-slate-400">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">{categoryName}</button>
                    {displaySegments.length > 0 ? displaySegments.map((segment, idx) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span className="text-slate-300 dark:text-slate-400">/</span>
                        <span className={idx === displaySegments.length - 1 ? "text-[15px] font-semibold text-slate-900 dark:text-white capitalize" : "capitalize text-slate-500"}>
                          {formatSegment(segment)}
                        </span>
                      </span>
                    )) : (
                      <span className="flex items-center gap-2">
                        <span className="text-slate-300 dark:text-slate-400">/</span>
                        <span className="text-[15px] font-semibold text-slate-900 dark:text-white capitalize">Dashboard</span>
                      </span>
                    )}
                  </div>
                )}
                {/* Mobile Title (shows only on mobile when breadcrumbs/segments are hidden) */}
                <div className="sm:hidden flex items-center text-[15px] font-semibold text-slate-900 dark:text-white capitalize">
                  {breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : title}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">

                {headerActions}
                <button
                  onClick={() => setIsAIOpen(!isAIOpen)}
                  className="hidden md:flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 font-bold text-[13px] transition-all shadow-sm hover:bg-slate-50 dark:hover:bg-[#222] hover:text-slate-900 dark:hover:text-white active:scale-95 select-none"
                  title="Toggle AI Coach"
                >
                  <Sparkles size={16} strokeWidth={2.5} /> <span>AI Coach</span>
                </button>
              </div>
            </header>

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

            {/* Internal Content Padding - stretch flex dynamically if noScroll is active */}
            <div className={`${noPadding || noScroll ? "p-0" : "p-4 pb-16 md:p-10 md:pb-20"} ${noScroll ? "flex-1 min-h-0 flex flex-col overflow-hidden" : ""}`}>
              <motion.div
                initial={{ opacity: location.pathname === '/settings' ? 1 : 0, y: location.pathname === '/settings' ? 0 : 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: location.pathname === '/settings' ? 0 : 0.4, ease: "easeOut" }}
                className={noScroll ? "flex-1 h-full flex flex-col min-h-0" : ""}
              >
                {children}
              </motion.div>
            </div>

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
          </main>
        </div>
      </div>
    </div>
  );
}
