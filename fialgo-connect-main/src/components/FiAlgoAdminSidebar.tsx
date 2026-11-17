import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import FiAlgoLogo from "./FiAlgoLogo";
import { checkUserAutoTradeAccess } from "@/utils/autoTradeAccess";
import {
  Bot,
  Activity,
  Cpu,
  FileText,
  Landmark,
  Key,
  ChevronsUpDown,
  ExternalLink,
  LogOut,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "NEW": "bg-purple-500/15 text-purple-300 border border-purple-500/25",
  "LIVE": "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  "RUNNING": "bg-white/10 text-neutral-200 border border-white/15",
  "PRO": "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  "SETUP": "bg-white/10 text-neutral-300 border border-white/15",
};

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface FiAlgoAdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function FiAlgoAdminSidebar({ mobileOpen = false, onClose }: FiAlgoAdminSidebarProps) {
  const { switchWorkspace } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAutoTradeSetup, setIsAutoTradeSetup] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("tradifive_auto_trade_setup") === "true";
  });

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    email: string;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("fialgo_user_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.email || parsed.fullName)) {
            return parsed;
          }
        }
        // Check Supabase session cache in localStorage for immediate synchronous email
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("auth-token")) {
            const authData = JSON.parse(localStorage.getItem(key) || "{}");
            const u = authData?.user;
            if (u?.email) {
              return {
                fullName: u.user_metadata?.full_name || u.email.split("@")[0] || "Trader",
                email: u.email,
              };
            }
          }
        }
      } catch (e) {}
    }
    return {
      fullName: "",
      email: "",
    };
  });

  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setIsAutoTradeSetup(localStorage.getItem("tradifive_auto_trade_setup") === "true");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("tradifive_auto_trade_setup_done", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("tradifive_auto_trade_setup_done", handleStorage);
    };
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Verify actual setup & admin approval status in Supabase
          const access = await checkUserAutoTradeAccess(user.id);
          setIsAutoTradeSetup(access.hasAccess);

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, username")
            .eq("id", user.id)
            .maybeSingle();

          const resolvedFullName =
            profile?.full_name ||
            profile?.username ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Trader";

          const resolvedEmail = user.email || profile?.email || "";

          const profileObj = {
            fullName: resolvedFullName,
            email: resolvedEmail,
          };

          setUserProfile(profileObj);
          try {
            localStorage.setItem("fialgo_user_profile", JSON.stringify(profileObj));
          } catch (e) {}
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadUser();
  }, []);

  // Exactly ONE button under OVERVIEW: first works as Setup, then converts to Dashboard
  const navSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        {
          id: "autotrade-main",
          label: isAutoTradeSetup ? "Auto Trade Dashboard" : "Auto Trade Setup",
          path: isAutoTradeSetup ? "/fialgo" : "/auto-trade/setup",
          icon: Bot,
          badge: isAutoTradeSetup ? "LIVE" : "SETUP",
        },
      ],
    },
    {
      title: "ALGORITHMS & BOTS",
      items: [
        { id: "active-bots", label: "Active Bots", path: "/auto-trade/active-bots", icon: Activity, badge: "RUNNING" },
        { id: "strategy-builder", label: "Strategy Builder", path: "/strategy-builder", icon: Cpu },
      ],
    },
    {
      title: "EXECUTION & SETTLEMENTS",
      items: [
        { id: "order-history", label: "Order History", path: "/auto-trade/history", icon: FileText },
        { id: "weekly-settlements", label: "Weekly Settlements", path: "/weekly-settlements", icon: Landmark },
      ],
    },
    {
      title: "CREDENTIALS & ACCESS",
      items: [
        { id: "ea-license", label: "EA License & Keys", path: "/auto-trade/license", icon: Key, badge: "PRO" },
      ],
    },
  ];

  const renderSidebarInner = (isMobileView: boolean) => (
    <div className="flex flex-col h-full overflow-hidden bg-[#1E1E1E] text-[#E5E5E5] font-sans">
      {/* ── Top Header with Workspace Switcher Logo (Hover smoothly shifts logo UP and target logo UP from DOWN, click switches workspace) ── */}
      <div className="mb-6 px-1 relative shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose?.();
              switchWorkspace("tradifive");
            }}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            title="Switch to TradiFive Workspace"
            className="flex-1 flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors cursor-pointer group select-none text-left"
          >
            {/* Logo container with vertical shift animation on hover */}
            <div className="relative h-[32px] sm:h-[36px] flex-1 overflow-hidden select-none flex items-center">
              {/* Front Side: Active FiAlgo Logo (Moves UP and fades out on hover) */}
              <div
                className={`absolute inset-0 flex items-center transition-all duration-300 ease-out transform ${
                  isLogoHovered ? "opacity-0 -translate-y-3 pointer-events-none" : "opacity-100 translate-y-0"
                }`}
              >
                <FiAlgoLogo variant="dark" />
              </div>

              {/* Back Side: TradiFive Logo (Comes from DOWN and fades in on hover) */}
              <div
                className={`absolute inset-0 flex items-center transition-all duration-300 ease-out transform ${
                  isLogoHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                }`}
              >
                <img
                  src="/Dark mode logo with white.png"
                  alt="Switch to TradiFive"
                  className="h-[28px] sm:h-[32px] w-auto object-contain"
                />
              </div>
            </div>

            {/* Arrow on the side so users instantly know it is a switcher button */}
            <ChevronsUpDown
              size={14}
              strokeWidth={2.2}
              className="text-neutral-500 group-hover:text-neutral-200 transition-colors shrink-0 ml-2"
            />
          </button>

          {/* Mobile Close Button */}
          {isMobileView && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 ml-2 cursor-pointer shrink-0"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Auto Trade Navigation Sections ── */}
      <nav className="flex-1 overflow-y-auto space-y-5 px-1 scrollbar-hide">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.2em] px-3 mb-2">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/fialgo" && location.pathname.startsWith(item.path)) ||
                  (item.id === "autotrade-main" &&
                    (location.pathname === "/fialgo" ||
                      location.pathname.startsWith("/auto-trade/dashboard") ||
                      location.pathname.startsWith("/auto-trade/setup")));

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                      isActive
                        ? "sidebar-active-item font-semibold text-white bg-white/[0.04]"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <item.icon
                        size={15}
                        className={isActive ? "text-purple-400" : "text-neutral-500"}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          BADGE_COLORS[item.badge] || "bg-white/5 text-neutral-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom Profile Area (Exact Admin App Box Style) ── */}
      <div className="pt-2 border-t border-white/5 px-1 mt-auto shrink-0 relative">
        <div
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#161618] border border-white/[0.08] hover:border-white/15 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#0E0E10] border border-white/[0.08] text-xs font-bold text-white flex items-center justify-center shrink-0 uppercase shadow-inner">
              {userProfile.fullName ? userProfile.fullName.trim().charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : "U")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {userProfile.fullName || (userProfile.email ? userProfile.email.split("@")[0] : "Trader")}
              </p>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium tracking-tight">
                {userProfile.email || "Syncing account..."}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={13} className="text-neutral-500 group-hover:text-neutral-300 shrink-0 ml-2" />
        </div>

        {/* Profile Popover Menu (Systemic, No Blue) */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#161618] border border-white/[0.08] rounded-xl shadow-2xl p-1.5 z-[250] space-y-1 backdrop-blur-xl">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                switchWorkspace("tradifive");
                navigate("/journal");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <span>Switch to TradiFive Workspace</span>
              <ExternalLink size={12} className="text-neutral-400" />
            </button>
            <div className="my-1 border-t border-white/5" />
            <button
              onClick={async () => {
                setShowProfileMenu(false);
                await supabase.auth.signOut();
                navigate("/login");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <span>Sign Out</span>
              <LogOut size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-[260px] h-screen bg-[#1E1E1E] border-r border-white/5 flex-col shrink-0 select-none p-4 relative z-20">
        {renderSidebarInner(false)}
      </aside>

      {/* Mobile Responsive Slide-Over Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[150] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-y-0 left-0 w-[260px] max-w-[85vw] h-full bg-[#1E1E1E] border-r border-white/10 flex flex-col select-none p-4 shadow-2xl"
            >
              {renderSidebarInner(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
