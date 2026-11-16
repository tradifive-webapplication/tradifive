import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import {
  LogOut,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  Bot,
  Activity,
  ShoppingBag,
  Cpu,
  FileText,
  Landmark,
  Key,
  Server,
  ShieldCheck,
  ShieldAlert,
  Zap,
  X,
  Sliders,
  ExternalLink,
  ChevronsUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "NEW": "bg-purple-100 text-purple-700 border border-purple-200",
  "LIVE": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "4 RUNNING": "bg-blue-100 text-blue-700 border border-blue-200",
  "PRO": "bg-amber-100 text-amber-700 border border-amber-200",
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

  const [workload, setWorkload] = useState(1);
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
    <div className="flex flex-col h-full overflow-hidden bg-white text-slate-800 font-sans">
      {/* Brand & Workspace Switcher Header */}
      <div className="flex flex-col mb-4 px-1 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          {/* Tactical Workload Signal Nodes */}
          <div className="relative group cursor-help z-[200]">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200/90 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase ml-1">MT5 LIVE</span>
            </div>

            <div className="absolute top-full left-0 mt-2 w-52 p-3 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[210]">
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">
                Algo Engine Pulse
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                {workloadMessage}
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Latency: 12ms
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Risk Guard: Armed
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          {isMobileView && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
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

      {/* Algo Engine Active Banner */}
      <div className="mb-4 px-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50/80 border border-purple-200/80 rounded-xl">
          <Zap size={13} className="text-purple-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[9.5px] font-bold text-purple-800 uppercase tracking-wider truncate">
              Institutional Algo Engine
            </p>
            <p className="text-[8.5px] text-purple-600/80 font-mono truncate">
              MT5 #{userProfile.mt5Account} · Dynamic Grid
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto space-y-5 px-1 scrollbar-hide">
        {FIALGO_NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] px-3 mb-2">
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all group relative cursor-pointer ${
                      isActive
                        ? "bg-purple-50 text-purple-800 font-semibold border-l-2 border-purple-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={isActive ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          BADGE_COLORS[item.badge] || "bg-slate-100 text-slate-600"
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

      {/* Bottom Profile Area & Disconnect */}
      <div className="pt-3 border-t border-slate-200/90 px-1 mt-auto shrink-0 relative">
        <div
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-purple-700">
                  {userProfile.fullName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-slate-900 truncate">{userProfile.fullName}</p>
              <p className="text-[9.5px] text-emerald-600 font-bold uppercase tracking-tight truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> MT5 #{userProfile.mt5Account}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0" />
        </div>

        {/* Profile Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-1 right-1 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[250] space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-900">MT5 #{userProfile.mt5Account}</p>
                <p className="text-[9px] text-purple-700/80">Vantage International · Raw ECN</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                Active
              </span>
            </div>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/auto-trade/setup");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Sliders size={14} className="text-slate-400" />
              <span>Configure Risk & Lots</span>
            </button>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/auto-trade/license");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Key size={14} className="text-slate-400" />
              <span>EA Activation License</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={() => {
                setShowProfileMenu(false);
                switchWorkspace("tradifive");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <img src="/Tradifive_logo1.png" alt="" className="h-3.5 w-auto" />
                <span>Switch to TradiFive</span>
              </div>
              <ExternalLink size={12} className="text-slate-400" />
            </button>
          </div>
        )}

        <button
          onClick={handleDisconnect}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-slate-500 hover:text-slate-900 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-lg hover:bg-slate-100"
        >
          <LogOut size={12} />
          Switch to TradiFive
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-[260px] h-screen bg-white border-r border-slate-200/90 flex-col shrink-0 select-none p-4 relative z-20">
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] h-full bg-white border-r border-slate-200 flex flex-col select-none p-4 shadow-2xl"
            >
              {renderSidebarInner(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
