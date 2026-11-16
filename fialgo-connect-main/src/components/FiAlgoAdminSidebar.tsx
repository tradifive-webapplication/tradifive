import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
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
  Server,
  Zap,
  X,
  Sliders,
  ExternalLink,
  ChevronsUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "NEW": "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  "LIVE": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "4 RUNNING": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "PRO": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
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

const FIALGO_NAV_SECTIONS: NavSection[] = [
  {
    title: "ENGINE & OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", path: "/fialgo", icon: LayoutDashboard },
      { id: "autotrade-engine", label: "Auto Trade Engine", path: "/auto-trade/dashboard", icon: Bot, badge: "LIVE" },
    ],
  },
  {
    title: "ALGORITHMS & BOTS",
    items: [
      { id: "active-bots", label: "Active Bots", path: "/auto-trade/active-bots", icon: Activity, badge: "4 RUNNING" },
      { id: "marketplace", label: "Algo Marketplace", path: "/auto-trade/marketplace", icon: ShoppingBag, badge: "NEW" },
      { id: "strategy-builder", label: "Strategy Builder", path: "/strategy-builder", icon: Cpu },
    ],
  },
  {
    title: "EXECUTION & RISK",
    items: [
      { id: "order-history", label: "Order History", path: "/auto-trade/history", icon: FileText },
      { id: "weekly-settlements", label: "Weekly Settlements", path: "/weekly-settlements", icon: Landmark },
    ],
  },
  {
    title: "CREDENTIALS & ACCESS",
    items: [
      { id: "license", label: "License & EA Keys", path: "/auto-trade/license", icon: Key, badge: "PRO" },
      { id: "mt5-terminal", label: "MT5 Terminal Bridge", path: "/auto-trade/setup", icon: Server },
    ],
  },
];

interface FiAlgoAdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function FiAlgoAdminSidebar({ mobileOpen = false, onClose }: FiAlgoAdminSidebarProps) {
  const { switchWorkspace } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    email: string;
    avatarUrl: string;
    mt5Account: string;
  }>({
    fullName: "Nikhil Harake",
    email: "user@fialgo.trade",
    avatarUrl: "",
    mt5Account: "",
  });

  const [workloadMessage, setWorkloadMessage] = useState("Algo engine normal. 4 active bots synchronized.");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

          const { data: mt5 } = await supabase
            .from("mt5_accounts")
            .select("account_number")
            .eq("user_id", user.id)
            .maybeSingle();

          const storedAcc = localStorage.getItem("tradifive_connected_mt5_account") || "";

          setUserProfile({
            fullName: profile?.full_name || user.user_metadata?.full_name || "Nikhil Harake",
            email: user.email || "user@fialgo.trade",
            avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || "",
            mt5Account: mt5?.account_number || storedAcc || "8841092",
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
  };

  const renderSidebarInner = (isMobileView: boolean) => (
    <div className="flex flex-col h-full overflow-hidden bg-[#1E1E1E] text-[#E5E5E5] font-sans">
      {/* Brand & Workspace Switcher Header */}
      <div className="flex flex-col mb-4 px-1 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          {/* Tactical Workload Signal Nodes (Admin App exact design) */}
          <div className="relative group cursor-help z-[200]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase ml-1">MT5 LIVE</span>
            </div>

            <div className="absolute top-full left-0 mt-2 w-52 p-3 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[210]">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                Algo Engine Pulse
              </p>
              <p className="text-[11px] text-neutral-400 leading-relaxed mb-2.5">
                {workloadMessage}
              </p>
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> Latency: 12ms
                </div>
                <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> Risk Guard: Armed
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          {isMobileView && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Workspace Switcher with far-right chevron */}
        <div className="w-full">
          <WorkspaceSwitcher className="w-full" />
        </div>
      </div>

      {/* Algo Engine Active Banner (Admin App Dark styling) */}
      <div className="mb-4 px-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <Zap size={13} className="text-purple-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[9.5px] font-bold text-purple-300 uppercase tracking-wider truncate">
              Institutional Algo Engine
            </p>
            <p className="text-[8.5px] text-purple-400/70 font-mono truncate">
              MT5 #{userProfile.mt5Account} · Dynamic Grid
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections (Admin App Dark styling) */}
      <nav className="flex-1 overflow-y-auto space-y-5 px-1 scrollbar-hide">
        {FIALGO_NAV_SECTIONS.map((section) => (
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
                    onClick={() => {
                      if (isMobileView) onClose?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group relative cursor-pointer ${
                      isActive
                        ? "bg-white/[0.08] text-white font-semibold border-l-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={isActive ? "text-purple-400" : "text-neutral-500 group-hover:text-neutral-300"}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
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

      {/* Bottom Profile Area & Disconnect (Admin App Dark styling) */}
      <div className="pt-3 border-t border-white/5 px-1 mt-auto shrink-0 relative">
        <div
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="flex items-center justify-between p-2 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-purple-300">
                  {userProfile.fullName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white truncate">{userProfile.fullName}</p>
              <p className="text-[9.5px] text-emerald-400 font-bold uppercase tracking-tight truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> MT5 #{userProfile.mt5Account}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={14} className="text-neutral-500 group-hover:text-neutral-300 shrink-0" />
        </div>

        {/* Profile Popover Menu (Admin App Dark) */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-1 right-1 mb-2 bg-[#1A1A1D] border border-white/10 rounded-2xl shadow-2xl p-2 z-[250] space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-white">MT5 #{userProfile.mt5Account}</p>
                <p className="text-[9px] text-neutral-400">Vantage International · Raw ECN</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Active
              </span>
            </div>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/auto-trade/setup");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"
            >
              <Sliders size={14} className="text-neutral-500" />
              <span>Configure Risk & Lots</span>
            </button>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/auto-trade/license");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"
            >
              <Key size={14} className="text-neutral-500" />
              <span>EA Activation License</span>
            </button>

            <div className="h-px bg-white/5 my-1" />

            <button
              onClick={() => {
                setShowProfileMenu(false);
                switchWorkspace("tradifive");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <img src="/Dark mode logo with white.png" alt="" className="h-3.5 w-auto" />
                <span>Switch to TradiFive</span>
              </div>
              <ExternalLink size={12} className="text-neutral-400" />
            </button>
          </div>
        )}

        <button
          onClick={handleDisconnect}
          className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded hover:bg-white/5"
        >
          <LogOut size={12} />
          Switch to TradiFive
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Admin App exact width & background) */}
      <aside className="hidden lg:flex w-[260px] h-screen bg-[#1E1E1E] border-r border-white/5 flex-col shrink-0 select-none p-4 relative z-20">
        {renderSidebarInner(false)}
      </aside>

      {/* Mobile Responsive Slide-Over Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[150] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] h-full bg-[#1E1E1E] border-r border-white/10 flex flex-col select-none p-4 shadow-2xl"
            >
              {renderSidebarInner(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
