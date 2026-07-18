import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { supabase } from "../lib/supabase";
import { getGroupedNavForRole, ROLE_LABELS, DEPARTMENT_ORDER, type AdminRole, type NavItem } from "../lib/rbac";

import {
  LogOut,
  ChevronUp,
  ChevronDown,
  Monitor,
  Headphones,
  ClipboardList,
  ShieldCheck,
  ShieldAlert,
  Users,
  DollarSign,
  Landmark,
  MessageSquare,
  Target,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "NEW":    "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  "LIVE":   "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "ACTION": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

export default function AdminSidebar() {
  const { adminUser, signOut, viewRole, setViewRole } = useAdminAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const effectiveRole = viewRole || adminUser?.role;
  const isDeptHead = adminUser?.isDeptHead === true;

  const [workload, setWorkload] = useState(1);
  const [workloadMessage, setWorkloadMessage] = useState("System Normal");

  // Workload Pulse Engine - Department Specific
  useEffect(() => {
    if (!effectiveRole) return;
    
    const checkWorkload = async () => {
      let intensity = 1;
      let msg = "All clear.";
      
      try {
        if (effectiveRole === "hr_manager") {
          const { count } = await supabase.from("hr_candidates").select("*", { count: "exact", head: true }).in("status", ["applied", "interview"]);
          if ((count || 0) > 5) { intensity = 3; msg = `${count} pending candidates require immediate attention.`; }
          else if ((count || 0) > 0) { intensity = 2; msg = `${count} candidates in pipeline.`; }
          else { intensity = 1; msg = "No pending candidates."; }
        } 
        else if (effectiveRole === "ceo") {
          const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
          if ((count || 0) > 50) { intensity = 3; msg = "High overall platform traffic. Monitor actively."; }
          else if ((count || 0) > 10) { intensity = 2; msg = "Moderate platform traffic."; }
          else { intensity = 1; msg = "Platform stable."; }
        }
        else if (effectiveRole === "support_executive") {
          intensity = 2; msg = "Multiple pending user tickets in queue.";
        }
        else if (effectiveRole === "operations_executive") {
          const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
          intensity = 2; msg = "Pending operational tasks require review.";
        }
        else {
          intensity = 1; msg = "Systems operational.";
        }
      } catch (err) {
        console.error(err);
      }

      setWorkload(intensity);
      setWorkloadMessage(msg);
    };

    checkWorkload();
    const interval = setInterval(checkWorkload, 15000);
    return () => clearInterval(interval);
  }, [effectiveRole]);

  const location = useLocation();
  const navigate = useNavigate();

  if (!adminUser || !effectiveRole) return null;

  const groupedNav = getGroupedNavForRole(effectiveRole);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActualCEO = adminUser.role === "ceo" && !isDeptHead;

  const viewOptions: { id: AdminRole; label: string; icon: any }[] = [
    { id: "ceo",                  label: "CEO (Executive)",            icon: ShieldCheck },
    { id: "technical_lead",       label: "CTO (Technology)",           icon: Monitor },
    { id: "operations_executive", label: "COO (Operations)",           icon: ClipboardList },
    { id: "risk_executive",       label: "CRO (Trading & Risk)",       icon: ShieldAlert },
    { id: "finance_executive",    label: "CFO (Finance)",              icon: Landmark },
    { id: "community_manager",    label: "CMO (Content & Marketing)",  icon: MessageSquare },
    { id: "hr_manager",           label: "CHRO (HR & People)",         icon: Users },
    { id: "support_executive",    label: "CXO (Support)",              icon: Headphones },
    { id: "sales_executive",      label: "CXO (Sales)",                icon: Target },
    { id: "mentor_manager",       label: "Head of Mentors (Mentors)",  icon: GraduationCap },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#1E1E1E] border-r border-white/5 flex flex-col shrink-0 select-none p-4 relative z-[100]">

      {/* Brand & Workload Signals */}
      <div className="flex items-center justify-between mb-8 px-2 relative">
        <div className="flex items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="Icon"
            className="h-6 w-auto object-contain drop-shadow-md"
          />
          <img
            src="/Dark mode logo with white.png"
            alt="Tradifive"
            className="h-[22px] w-auto object-contain mt-0.5 opacity-90"
          />
        </div>

        {/* Tactical Workload Signal Nodes */}
        <div className="relative group cursor-help z-[200]">
          <div className="signal-container">
            <div className={`signal-node yellow ${workload >= 1 ? "active" : ""}`} />
            <div className={`signal-node amber ${workload >= 2 ? "active" : ""}`} />
            <div className={`signal-node red ${workload >= 3 ? "active" : ""}`} />
          </div>
          
          <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[210]">
            <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">{ROLE_LABELS[effectiveRole as AdminRole]} Status</p>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">{workloadMessage}</p>
            <div className="space-y-1.5 pt-2 border-t border-white/5">
               <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> Normal</div>
               <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Pending</div>
               <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dept Head Locked Banner */}
      {isDeptHead && (
        <div className="mb-4 px-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <ShieldCheck size={11} className="text-blue-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest truncate">Dept Access</p>
              <p className="text-[8px] text-blue-500/60 truncate">{adminUser?.deptLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-5 px-1 scrollbar-hide">
        {DEPARTMENT_ORDER.map((section) => {
          const items = groupedNav[section];
          if (!items || items.length === 0) return null;

          // Check if this section has any sub-groups
          const hasSubGroups = items.some(i => i.group);

          if (!hasSubGroups) {
            return (
              <div key={section}>
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.2em] px-3 mb-3">
                  {section}
                </p>
                <div className="space-y-1">
                  {items.map((item: NavItem) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== "/" && item.path !== "/hr" && location.pathname.startsWith(item.path + "/"));

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-none group relative z-20 cursor-pointer pointer-events-auto
                          ${isActive
                            ? "sidebar-active-item shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                            : "text-neutral-500 hover:text-neutral-300"
                          }`}
                      >
                        <item.icon
                          size={15}
                          className={isActive ? "text-white" : "text-zinc-700 group-hover:text-zinc-500"}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${BADGE_COLORS[item.badge] || "bg-white/5 text-neutral-600"}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Render with sub-groups
          const subGroups: Record<string, NavItem[]> = {};
          for (const item of items) {
            const g = item.group || "General";
            if (!subGroups[g]) subGroups[g] = [];
            subGroups[g].push(item);
          }

          return (
            <div key={section}>
              <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.2em] px-3 mb-3">
                {section}
              </p>
              <div className="space-y-4">
                {Object.entries(subGroups).map(([groupLabel, groupItems]) => (
                  <div key={groupLabel}>
                    {/* Sub-group label */}
                    <div className="flex items-center gap-2 px-3 mb-1.5">
                      <div className="h-px flex-1 bg-white/[0.04]" />
                      <p className="text-[7.5px] text-neutral-700 font-bold uppercase tracking-[0.18em] shrink-0">
                        {groupLabel}
                      </p>
                      <div className="h-px flex-1 bg-white/[0.04]" />
                    </div>
                    <div className="space-y-0.5">
                      {groupItems.map((item: NavItem) => {
                        const isActive =
                          location.pathname === item.path ||
                          (item.path !== "/" && item.path !== "/hr" && location.pathname.startsWith(item.path + "/"));

                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-none group relative z-20 cursor-pointer pointer-events-auto
                              ${isActive
                                ? "sidebar-active-item shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                                : "text-neutral-500 hover:text-neutral-300"
                              }`}
                          >
                            <item.icon
                              size={15}
                              className={isActive ? "text-white" : "text-zinc-700 group-hover:text-zinc-500"}
                            />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${BADGE_COLORS[item.badge] || "bg-white/5 text-neutral-600"}`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Session Profile with Integrated Switcher */}
      <div className="mt-4 border-t border-white/5 pt-4 px-2 relative">
        <AnimatePresence>
          {showRoleSwitcher && (isActualCEO || adminUser.role === "hr_manager") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[105%] left-0 right-0 mb-1 bg-[#121212] border border-white/10 rounded-xl p-2 shadow-2xl z-[110] overflow-hidden"
            >
              <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest px-2 mb-2">
                Department Access
              </p>
              <div className="space-y-1">
                {viewOptions
                  .filter(opt => isActualCEO || opt.id !== "ceo")
                  .sort((a, b) => {
                    if (a.id === adminUser.role) return -1;
                    if (b.id === adminUser.role) return 1;
                    return 0;
                  })
                  .map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setViewRole(opt.id);
                      setShowRoleSwitcher(false);
                      navigate("/");
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded text-[10px] font-bold uppercase tracking-tight transition-none ${
                      effectiveRole === opt.id
                        ? "bg-white/10 text-white"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    <opt.icon
                      size={12}
                      className={effectiveRole === opt.id ? "text-white" : "text-neutral-700"}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => (isActualCEO || adminUser.role === "hr_manager") && setShowRoleSwitcher(!showRoleSwitcher)}
          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-none border ${
            showRoleSwitcher
              ? "bg-white/10 border-white/20"
              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden shrink-0 shadow-lg"
              style={{ background: adminUser.avatar_url?.startsWith('#') ? adminUser.avatar_url : '#121212' }}
            >
              {adminUser.avatar_url && !adminUser.avatar_url.startsWith('#') ? (
                <img src={adminUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                adminUser.full_name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{adminUser.full_name}</p>
              <p className="text-[9px] text-neutral-600 truncate uppercase tracking-tighter">
                {effectiveRole === "ceo" ? "Master CEO" : ROLE_LABELS[effectiveRole as AdminRole]}
              </p>
            </div>
          </div>
          <div className={`flex flex-col ${showRoleSwitcher ? "text-white" : "text-neutral-700"}`}>
            <ChevronUp size={10} className="-mb-0.5" />
            <ChevronDown size={10} className="-mt-0.5" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-none"
        >
          <LogOut size={12} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
