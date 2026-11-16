import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  LogOut,
  LayoutDashboard,
  Bot,
  Activity,
  ShoppingBag,
  Cpu,
  FileText,
  Landmark,
  Key,
  ChevronsUpDown,
  ExternalLink,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "NEW": "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  "LIVE": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "RUNNING": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "PRO": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  "SETUP": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
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
  }>({
    fullName: "nikil harake",
    email: "nikilharake369@gmail.com",
  });

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setIsAutoTradeSetup(localStorage.getItem("tradifive_auto_trade_setup") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, username")
            .eq("id", user.id)
            .maybeSingle();

          setUserProfile({
            fullName: profile?.full_name || profile?.username || user.user_metadata?.full_name || "nikil harake",
            email: user.email || profile?.email || "nikilharake369@gmail.com",
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadUser();
  }, []);

  const handleDisconnect = async () => {
    onClose?.();
    switchWorkspace("tradifive");
    navigate("/journal");
  };

  const navSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        { id: "engine-dashboard", label: "Auto Trade Engine", path: "/fialgo", icon: Bot, badge: "LIVE" },
        {
          id: "autotrade-main",
          label: isAutoTradeSetup ? "Auto Trade Dashboard" : "Auto Trade Setup",
          path: isAutoTradeSetup ? "/auto-trade/dashboard" : "/auto-trade/setup",
          icon: isAutoTradeSetup ? LayoutDashboard : Bot,
          badge: isAutoTradeSetup ? undefined : "SETUP",
        },
      ],
    },
    {
      title: "ALGORITHMS & BOTS",
      items: [
        { id: "active-bots", label: "Active Bots", path: "/auto-trade/active-bots", icon: Activity, badge: "RUNNING" },
        { id: "algo-marketplace", label: "Algo Marketplace", path: "/auto-trade/marketplace", icon: ShoppingBag, badge: "NEW" },
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
      {/* ── Top Header with Tradifive Favicon + Big FiAlgo Logo + Far-Right Dropdown Arrow ── */}
      <div className="mb-6 px-1 relative shrink-0">
        <div
          onClick={() => setShowWorkspaceMenu((prev) => !prev)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group select-none"
          title="Switch Workspace"
        >
          {/* Left: Tradifive Favicon + Big FiAlgo Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/favicon.png"
              alt="Tradifive"
              className="h-6 w-auto object-contain drop-shadow-md shrink-0"
            />
            <img
              src="/fialgo-logo.png"
              alt="FiAlgo"
              className="h-8 sm:h-[34px] w-auto object-contain"
            />
          </div>

          {/* Right: Dropdown Arrow */}
          <div className="flex items-center gap-1 shrink-0">
            <ChevronsUpDown size={13} className="text-neutral-500 group-hover:text-neutral-300" />
            {isMobileView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
                className="p-1 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 ml-2 cursor-pointer"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Clean Dropdown for Workspace Switching */}
        {showWorkspaceMenu && (
          <div className="absolute top-full left-1 right-1 mt-1 bg-[#1A1A1D] border border-white/10 rounded-lg shadow-2xl p-1 z-[250] space-y-1">
            <button
              onClick={() => {
                setShowWorkspaceMenu(false);
                switchWorkspace("tradifive");
                navigate("/journal");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <span>TradiFive Workspace</span>
            </button>
            <div className="px-3 py-1.5 rounded bg-white/5 text-left text-xs font-bold text-purple-400 flex items-center justify-between">
              <span>FiAlgo Workspace</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">Active</span>
            </div>
          </div>
        )}
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
                  (item.path !== "/fialgo" && location.pathname.startsWith(item.path));

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

      {/* ── Bottom Profile Area (Exact Admin App Box Style from Image 2) ── */}
      <div className="pt-2 border-t border-white/5 px-1 mt-auto shrink-0 relative">
        <div
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#161618] border border-white/[0.08] hover:border-white/15 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#0E0E10] border border-white/[0.08] text-xs font-bold text-white flex items-center justify-center shrink-0 uppercase shadow-inner">
              {userProfile.fullName ? userProfile.fullName.trim().charAt(0).toUpperCase() : "N"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {userProfile.fullName}
              </p>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium tracking-tight">
                {userProfile.email}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={13} className="text-neutral-500 group-hover:text-neutral-300 shrink-0 ml-2" />
        </div>

        {/* Profile Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-1 right-1 mb-2 bg-[#1A1A1D] border border-white/10 rounded-lg shadow-2xl p-1 z-[250] space-y-1">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                switchWorkspace("tradifive");
                navigate("/journal");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs font-bold text-white hover:bg-white/5 cursor-pointer"
            >
              <span>Switch to TradiFive Workspace</span>
              <ExternalLink size={12} className="text-neutral-400" />
            </button>
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/settings");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs text-neutral-300 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <span>Settings</span>
            </button>
          </div>
        )}

        <button
          onClick={handleDisconnect}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-neutral-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors rounded hover:bg-white/5 cursor-pointer"
        >
          <LogOut size={12} />
          DISCONNECT
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Admin App exact width 260px) */}
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
