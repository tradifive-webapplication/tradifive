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
  Server,
  ShieldAlert,
  ChevronsUpDown,
  ExternalLink,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "NEW": "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  "LIVE": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "ACTION": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
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
    title: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Executive Terminal", path: "/fialgo", icon: LayoutDashboard },
      { id: "autotrade-engine", label: "Auto Trade Engine", path: "/auto-trade/dashboard", icon: Bot, badge: "LIVE" },
    ],
  },
  {
    title: "USERS & CRM",
    items: [
      { id: "active-bots", label: "Active Bots", path: "/auto-trade/active-bots", icon: Activity },
      { id: "marketplace", label: "Algo Marketplace", path: "/auto-trade/marketplace", icon: ShoppingBag, badge: "NEW" },
      { id: "strategy-builder", label: "Strategy Builder", path: "/strategy-builder", icon: Cpu },
    ],
  },
  {
    title: "REVENUE & FINANCE",
    items: [
      { id: "revenue-stream", label: "Revenue Stream", path: "/fialgo", icon: Landmark },
      { id: "payout-approvals", label: "Payout Approvals", path: "/weekly-settlements", icon: FileText, badge: "ACTION" },
      { id: "transaction-ledger", label: "Transaction Ledger", path: "/auto-trade/history", icon: FileText },
    ],
  },
  {
    title: "TRADING & RISK",
    items: [
      { id: "mt5-monitor", label: "MT5 Monitor", path: "/auto-trade/setup", icon: Server },
      { id: "risk-control", label: "Risk Control & Limits", path: "/auto-trade/history", icon: ShieldAlert },
      { id: "license-keys", label: "EA License & Keys", path: "/auto-trade/license", icon: Key },
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
  }>({
    fullName: "nikil harake",
    email: "nikilharake369@gmail.com",
  });

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .maybeSingle();

          setUserProfile({
            fullName: profile?.full_name || user.user_metadata?.full_name || "nikil harake",
            email: user.email || "nikilharake369@gmail.com",
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
      {/* ── Top Header (Exact Match to Admin App Image 1) ── */}
      <div className="flex items-center justify-between mb-6 px-2 relative shrink-0">
        {/* Brand / Logo on Left with Switcher Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowWorkspaceMenu((prev) => !prev)}
            className="flex items-center gap-2 group cursor-pointer"
            title="Switch Workspace"
          >
            <img
              src="/favicon.png"
              alt="Icon"
              className="h-6 w-auto object-contain drop-shadow-md"
            />
            <span className="font-extrabold text-[17px] tracking-tight text-white font-sans">
              Tradifive
            </span>
            <ChevronsUpDown size={11} className="text-neutral-600 group-hover:text-neutral-400" />
          </button>

          {/* Clean Dropdown for Workspace Switching */}
          {showWorkspaceMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1D] border border-white/10 rounded-lg shadow-2xl p-1 z-[250] space-y-1">
              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  switchWorkspace("tradifive");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5"
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

        {/* Tactical Workload Signal Nodes on Far Right (Exact CSS from admin-app/src/index.css) */}
        <div className="flex items-center gap-2">
          <div className="signal-container cursor-help" title="System Normal · All Systems Operational">
            <div className="signal-node yellow active" />
            <div className="signal-node amber" />
            <div className="signal-node red" />
          </div>

          {isMobileView && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors ml-1"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Sections (Exact Typography from Admin App Image 1) ── */}
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors group relative z-20 cursor-pointer pointer-events-auto ${
                      isActive
                        ? "sidebar-active-item"
                        : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          BADGE_COLORS[item.badge] || "bg-white/5 text-neutral-600"
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

      {/* ── Bottom Profile Area (Exact Match to Admin App Image 1) ── */}
      <div className="pt-2 border-t border-white/5 px-1 mt-auto shrink-0 relative">
        <div
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-[#161616] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-black/60 border border-white/10 text-[10px] font-bold text-white flex items-center justify-center shrink-0 uppercase">
              {userProfile.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{userProfile.fullName}</p>
              <p className="text-[9px] text-neutral-600 truncate uppercase tracking-tighter">
                MASTER CEO
              </p>
            </div>
          </div>
          <ChevronsUpDown size={11} className="text-neutral-600 group-hover:text-neutral-400 shrink-0" />
        </div>

        {/* Profile Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-1 right-1 mb-2 bg-[#1A1A1D] border border-white/10 rounded-lg shadow-2xl p-1 z-[250] space-y-1">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                switchWorkspace("tradifive");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs font-bold text-white hover:bg-white/5"
            >
              <span>Switch to TradiFive</span>
              <ExternalLink size={12} className="text-neutral-400" />
            </button>
          </div>
        )}

        <button
          onClick={handleDisconnect}
          className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-neutral-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded hover:bg-white/5"
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
