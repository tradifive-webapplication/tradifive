import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command, Users, LayoutDashboard, FileText, Send, RefreshCw, Search,
  X, UserPlus, CalendarDays, Building2, Shield, BarChart3, Home,
  Settings, Bell, ChevronRight, CornerDownLeft
} from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";

interface QuickAction {
  label: string;
  description: string;
  shortcut?: string;
  icon: any;
  section: string;
  onAction: () => void;
}

export default function QuickActionsPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, activeRole } = useAdminAuth();

  // Ctrl+Space to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Individual keyboard shortcuts when panel is open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const map: Record<string, string> = {
        u: "/users", j: "/trades", a: "/audit-logs",
        s: "/system-status", h: "/hr", k: "/hr/hiring",
        r: "/roles", d: "/", t: "/tasks",
      };
      if (map[e.key.toLowerCase()]) {
        navigate(map[e.key.toLowerCase()]);
        setOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        window.location.reload();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, navigate]);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const ALL_ACTIONS: QuickAction[] = [
    // Navigation
    { section: "Navigation", label: "Go to Dashboard", description: "Main executive overview", shortcut: "D", icon: LayoutDashboard, onAction: () => go("/") },
    { section: "Navigation", label: "Go to Users", description: "View all registered users", shortcut: "U", icon: Users, onAction: () => go("/users") },
    { section: "Navigation", label: "Go to Trades", description: "Live execution feed", shortcut: "J", icon: BarChart3, onAction: () => go("/trades") },
    { section: "Navigation", label: "Go to Audit Logs", description: "View activity logs", shortcut: "A", icon: FileText, onAction: () => go("/audit-logs") },
    { section: "Navigation", label: "System Health", description: "View infrastructure status", shortcut: "S", icon: Shield, onAction: () => go("/system-status") },
    { section: "Navigation", label: "HR Dashboard", description: "People & hiring overview", shortcut: "H", icon: Building2, onAction: () => go("/hr") },
    { section: "Navigation", label: "Hiring Pipeline", description: "Candidate management", shortcut: "K", icon: UserPlus, onAction: () => go("/hr/hiring") },
    { section: "Navigation", label: "Attendance", description: "Employee attendance records", icon: CalendarDays, onAction: () => go("/hr/attendance") },
    { section: "Navigation", label: "Settings", description: "Global configuration", icon: Settings, onAction: () => go("/settings") },
    { section: "Navigation", label: "Admin Personnel", description: "Role management", shortcut: "R", icon: Users, onAction: () => go("/roles") },
    { section: "Navigation", label: "Task Protocol", description: "View active tasks", shortcut: "T", icon: FileText, onAction: () => go("/tasks") },
    // Actions
    { section: "Actions", label: "Send Notification", description: "Broadcast message to users", icon: Bell, onAction: () => { setOpen(false); alert("Notification panel — connect to Supabase"); } },
    { section: "Actions", label: "Refresh Dashboard", description: "Reload current page", shortcut: "Ctrl+R", icon: RefreshCw, onAction: () => { window.location.reload(); setOpen(false); } },
    { section: "Actions", label: "Search", description: "Quick search anything", shortcut: "Ctrl+K", icon: Search, onAction: () => setOpen(false) },
    // HR Actions
    { section: "HR Actions", label: "Add Employee", description: "Onboard a new team member", icon: UserPlus, onAction: () => { go("/hr/employees"); } },
    { section: "HR Actions", label: "Mark Attendance", description: "Record today's attendance", icon: CalendarDays, onAction: () => go("/hr/attendance") },
  ];

  const filtered = query.trim()
    ? ALL_ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ACTIONS;

  // Group by section
  const grouped = filtered.reduce<Record<string, QuickAction[]>>((acc, a) => {
    if (!acc[a.section]) acc[a.section] = [];
    acc[a.section].push(a);
    return acc;
  }, {});

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[200] w-12 h-12 rounded-full bg-[#1c1c1c]/90 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl hover:border-white/20 transition-all group"
        title="Quick Actions (Ctrl+Space)"
      >
        <Command size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-[#00000080] z-[300] backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed bottom-20 right-6 z-[310] w-[360px] bg-[#1c1c1c]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col origin-bottom-right"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              {/* Search */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10 bg-white/[0.02]">
                <Search size={18} className="text-neutral-400 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search actions..."
                  className="flex-1 bg-transparent text-[14px] text-white placeholder:text-neutral-500 outline-none font-medium"
                />
                <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-black/40 px-2 py-1 rounded border border-white/5 uppercase">
                  ESC
                </kbd>
              </div>

              {/* Actions */}
              <div className="max-h-[380px] overflow-y-auto py-2">
                {Object.entries(grouped).map(([section, actions]) => (
                  <div key={section} className="mb-2">
                    <div className="px-5 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      {section}
                    </div>
                    {actions.map((action, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                        onClick={action.onAction}
                        className="w-full flex items-center gap-4 px-5 py-2.5 text-left transition-none group"
                      >
                        <div className="flex items-center justify-center shrink-0">
                          <action.icon size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-white/90 group-hover:text-white">{action.label}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{action.description}</p>
                        </div>
                        {action.shortcut && (
                          <kbd className="text-[10px] font-medium text-neutral-500 bg-black/40 px-2 py-0.5 rounded border border-white/5 shrink-0 uppercase">
                            {action.shortcut}
                          </kbd>
                        )}
                        <CornerDownLeft size={14} className="text-neutral-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-neutral-500">
                    <Search size={24} className="mb-3 opacity-20" />
                    <p className="text-[13px] font-medium">No results found for "{query}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
