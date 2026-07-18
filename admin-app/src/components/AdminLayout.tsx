import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { ROLE_LABELS, getNavForRole } from "../lib/rbac";
import {
  Bell, ChevronRight, BotMessageSquare, Search,
  Loader2, X, Cpu, Landmark, User, ShieldAlert, Zap, Monitor
} from "lucide-react";
import { Navigate, useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import QuickActionsPanel from "./QuickActionsPanel";
import InternalMessaging from "./InternalMessaging";
import NotificationCenter from "./NotificationCenter";
import { supabase } from "../lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminUser, loading, viewRole } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  const [topSearchQuery, setTopSearchQuery] = useState("");
  const [showTopSearch, setShowTopSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    pages: any[];
    employees: any[];
    clients: any[];
  }>({ pages: [], employees: [], clients: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'employee' | 'client';
    data: any;
  } | null>(null);
  const [entityExtraInfo, setEntityExtraInfo] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) return <Navigate to="/login" replace />;

  const activeRole = viewRole || adminUser.role;

  const pageName = location.pathname === "/" ? "Dashboard" :
    location.pathname.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Debounced search logic
  useEffect(() => {
    let active = true;
    const query = topSearchQuery.trim();

    if (!query) {
      setSearchResults({ pages: [], employees: [], clients: [] });
      setSelectedIndex(0);
      return;
    }

    const performSearch = async () => {
      setSearchLoading(true);

      let searchPrefix: '' | '/' | '@' | '#' = '';
      let cleanQuery = query;

      if (query.startsWith('/') || query.startsWith('@') || query.startsWith('#')) {
        searchPrefix = query.charAt(0) as '/' | '@' | '#';
        cleanQuery = query.slice(1).trim();
      }

      let matchedPages: any[] = [];
      let matchedEmployees: any[] = [];
      let matchedClients: any[] = [];

      // If prefix typed alone
      if (!cleanQuery) {
        if (searchPrefix === '/') {
          matchedPages = getNavForRole(activeRole);
        } else if (searchPrefix === '@') {
          const { data } = await supabase
            .from("hr_employees")
            .select("id, full_name, email, department, role_level, avatar_color")
            .limit(5);
          if (data) matchedEmployees = data;
        } else if (searchPrefix === '#') {
          const { data } = await supabase
            .from("profiles")
            .select("id, full_name, email, username, avatar_url, subscription_status, is_frozen")
            .limit(5);
          if (data) matchedClients = data;
        }
      } else {
        // 1. Pages Search
        if (searchPrefix === '' || searchPrefix === '/') {
          const accessiblePages = getNavForRole(activeRole);
          matchedPages = accessiblePages.filter(item =>
            item.label.toLowerCase().includes(cleanQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(cleanQuery.toLowerCase())
          );
        }

        // 2. Employees Search
        if (searchPrefix === '' || searchPrefix === '@') {
          try {
            const { data } = await supabase
              .from("hr_employees")
              .select("id, full_name, email, department, role_level, avatar_color")
              .or(`full_name.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,department.ilike.%${cleanQuery}%`)
              .limit(5);
            if (data && active) matchedEmployees = data;
          } catch (err) {
            console.error("Employee search error:", err);
          }
        }

        // 3. Clients Search
        if (searchPrefix === '' || searchPrefix === '#') {
          try {
            const { data } = await supabase
              .from("profiles")
              .select("id, full_name, email, username, avatar_url, subscription_status, is_frozen")
              .or(`full_name.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`)
              .limit(5);
            if (data && active) matchedClients = data;
          } catch (err) {
            console.error("Client search error:", err);
          }
        }
      }

      if (active) {
        setSearchResults({
          pages: matchedPages,
          employees: matchedEmployees,
          clients: matchedClients
        });
        setSelectedIndex(0);
        setSearchLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      performSearch();
    }, 150);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [topSearchQuery, activeRole]);

  // Fetch extra details for employee/client profile inspector modal
  useEffect(() => {
    if (!selectedEntity) {
      setEntityExtraInfo(null);
      return;
    }

    const fetchExtra = async () => {
      try {
        if (selectedEntity.type === 'client') {
          const { data } = await supabase
            .from("mt5_accounts")
            .select("*")
            .eq("user_id", selectedEntity.data.id);
          if (data) {
            setEntityExtraInfo({ mt5: data });
          }
        } else if (selectedEntity.type === 'employee') {
          const { data: attendance } = await supabase
            .from("hr_attendance")
            .select("*")
            .eq("employee_id", selectedEntity.data.id)
            .order("date", { ascending: false })
            .limit(3);
          if (attendance) {
            setEntityExtraInfo({ attendance });
          }
        }
      } catch (err) {
        console.error("Fetch profile extra error:", err);
      }
    };
    fetchExtra();
  }, [selectedEntity]);

  // Global keydown for "/" shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowTopSearch(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const flatResults = [
    ...searchResults.pages.map(p => ({ type: 'page' as const, data: p })),
    ...searchResults.employees.map(e => ({ type: 'employee' as const, data: e })),
    ...searchResults.clients.map(c => ({ type: 'client' as const, data: c }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showTopSearch || flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = flatResults[selectedIndex];
      if (selectedItem) {
        handleSelectItem(selectedItem);
      }
    } else if (e.key === "Escape") {
      setShowTopSearch(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectItem = (item: { type: 'page' | 'employee' | 'client'; data: any }) => {
    if (item.type === 'page') {
      navigate(item.data.path);
      setTopSearchQuery("");
      setShowTopSearch(false);
      inputRef.current?.blur();
    } else {
      setSelectedEntity({ type: item.type, data: item.data });
      setTopSearchQuery("");
      setShowTopSearch(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-[#E5E5E5] overflow-hidden font-sans selection:bg-white/10">
      {!isEmbed && <AdminSidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Stealth Minimal */}
        {!isEmbed && (
          <header className="h-[56px] flex items-center justify-between px-8 bg-[#121212] border-b border-zinc-900/80 relative z-50">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-neutral-700 font-bold uppercase tracking-widest text-[10px]">Terminal</span>
            <ChevronRight size={12} className="text-neutral-800" />
            <h2 className="text-[12px] font-bold text-white uppercase tracking-widest truncate">{pageName}</h2>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-xl px-8 hidden md:block relative">
            <div className="relative group flex items-center">
              <Search size={14} className="absolute left-3 text-neutral-500 group-focus-within:text-neutral-300 transition-colors pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={topSearchQuery}
                onChange={(e) => setTopSearchQuery(e.target.value)}
                onFocus={() => setShowTopSearch(true)}
                onBlur={() => setTimeout(() => setShowTopSearch(false), 250)}
                onKeyDown={handleKeyDown}
                placeholder="Search anything..."
                className="w-full bg-[#1A1A1A] border border-neutral-800 focus:border-neutral-700 rounded flex items-center pl-9 pr-12 py-1.5 text-[12px] text-white outline-none transition-all placeholder:text-neutral-600 focus:bg-[#222] focus:shadow-[0_0_25px_rgba(0,0,0,0.4)]"
              />
              <div className="absolute right-2 flex items-center gap-1 opacity-50">
                <kbd className="text-[9px] font-bold text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase">/ </kbd>
              </div>

              {/* Suggestions dropdown helper (Empty query) */}
              {showTopSearch && !topSearchQuery.trim() && (
                <div className="absolute top-[125%] left-0 w-full bg-[#18181B]/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-3 z-[200] space-y-3">
                  <div className="px-2 py-0.5 text-[9px] text-neutral-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                    Search Commands & Filters
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onMouseDown={() => setTopSearchQuery("/")}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-lg text-left transition-all group"
                    >
                      <span className="text-[12px] font-bold text-zinc-400 font-mono">/</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white">Pages</span>
                        <span className="text-[8px] text-neutral-500">Go to route</span>
                      </div>
                    </button>
                    <button
                      onMouseDown={() => setTopSearchQuery("@")}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-lg text-left transition-all group"
                    >
                      <span className="text-[12px] font-bold text-zinc-400 font-mono">@</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white">Employees</span>
                        <span className="text-[8px] text-neutral-500">HR directory</span>
                      </div>
                    </button>
                    <button
                      onMouseDown={() => setTopSearchQuery("#")}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-lg text-left transition-all group"
                    >
                      <span className="text-[12px] font-bold text-zinc-400 font-mono">#</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white">Clients</span>
                        <span className="text-[8px] text-neutral-500">User registry</span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between px-2 pt-1.5 text-[8.5px] text-neutral-600 font-medium">
                    <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
                    <span>Press / to focus search</span>
                  </div>
                </div>
              )}

              {/* Dynamic Results Dropdown list */}
              {showTopSearch && topSearchQuery.trim() && (
                <div className="absolute top-[125%] left-0 w-full bg-[#18181B]/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-2.5 z-[200] max-h-[420px] overflow-y-auto space-y-3 scrollbar-thin">
                  {searchLoading && (
                    <div className="px-3 py-4 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-2">
                      <Loader2 size={12} className="animate-spin text-neutral-400" /> Searching...
                    </div>
                  )}
                  {!searchLoading && flatResults.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11px] text-neutral-500">
                      No results found for <span className="text-white font-mono">"{topSearchQuery}"</span>
                    </div>
                  )}

                  {/* Section: Pages */}
                  {searchResults.pages.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[9px] text-neutral-500 font-bold uppercase tracking-widest border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Matched Pages</span>
                        <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded uppercase">/</span>
                      </div>
                      <div className="space-y-0.5">
                        {searchResults.pages.map((item, idx) => {
                          const globalIdx = idx;
                          const isSelected = selectedIndex === globalIdx;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onMouseDown={() => handleSelectItem({ type: 'page', data: item })}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={`w-full text-left px-3 py-2 text-[12px] rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-zinc-800 text-white' : 'text-neutral-300 hover:bg-white/5'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon size={13} className={isSelected ? 'text-white' : 'text-neutral-500'} />
                                <span>{item.label}</span>
                              </div>
                              <span className={`text-[9.5px] font-mono ${isSelected ? 'text-zinc-300' : 'text-neutral-500'}`}>
                                {item.department}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section: Employees */}
                  {searchResults.employees.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[9px] text-neutral-500 font-bold uppercase tracking-widest border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Personnel & Employees</span>
                        <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded uppercase">@</span>
                      </div>
                      <div className="space-y-0.5">
                        {searchResults.employees.map((item, idx) => {
                          const globalIdx = searchResults.pages.length + idx;
                          const isSelected = selectedIndex === globalIdx;
                          return (
                            <button
                              key={item.id}
                              onMouseDown={() => handleSelectItem({ type: 'employee', data: item })}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={`w-full text-left px-3 py-2 text-[12px] rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-zinc-800 text-white' : 'text-neutral-300 hover:bg-white/5'
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 uppercase shadow"
                                  style={{ background: item.avatar_color || '#a855f7' }}
                                >
                                  {item.full_name.charAt(0)}
                                </div>
                                <div className="truncate">
                                  <span className="font-semibold">{item.full_name}</span>
                                  <span className={`ml-2 text-[10px] ${isSelected ? 'text-zinc-300' : 'text-neutral-500'}`}>
                                    {item.email}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400'
                                  }`}>
                                  {item.role_level}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section: Clients */}
                  {searchResults.clients.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[9px] text-neutral-500 font-bold uppercase tracking-widest border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Users & Clients</span>
                        <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded uppercase">#</span>
                      </div>
                      <div className="space-y-0.5">
                        {searchResults.clients.map((item, idx) => {
                          const globalIdx = searchResults.pages.length + searchResults.employees.length + idx;
                          const isSelected = selectedIndex === globalIdx;
                          return (
                            <button
                              key={item.id}
                              onMouseDown={() => handleSelectItem({ type: 'client', data: item })}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={`w-full text-left px-3 py-2 text-[12px] rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-zinc-800 text-white' : 'text-neutral-300 hover:bg-white/5'
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] text-white font-bold shrink-0 uppercase bg-neutral-800 border border-white/5 overflow-hidden">
                                  {item.avatar_url && !item.avatar_url.startsWith('#') ? (
                                    <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    item.full_name.charAt(0)
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className="font-semibold">{item.full_name}</span>
                                  <span className={`ml-2 text-[10px] ${isSelected ? 'text-zinc-300' : 'text-neutral-500'}`}>
                                    @{item.username}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {item.is_frozen && (
                                  <span className="px-1.5 py-0.2 bg-red-500/15 text-red-400 border border-red-500/20 rounded text-[8px] font-bold">FROZEN</span>
                                )}
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${item.subscription_status === 'elite' ? 'text-amber-500/90' :
                                    item.subscription_status === 'pro' ? 'text-zinc-400' : 'text-neutral-500'
                                  }`}>
                                  {item.subscription_status || 'free'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={() => window.open('/live-view', '_blank')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded border border-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              title="Open Live App Viewer"
            >
              <Monitor size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Live App</span>
            </button>

            <Link to="/agent" className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-white/[0.05] rounded text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10" title="Agent Command">
              <BotMessageSquare size={14} className="text-[#a855f7]" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Agent Command</span>
            </Link>

            <div className="w-px h-4 bg-white/10 mx-2" />

            <div className={`flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded ${adminUser.role === 'ceo' && viewRole !== 'ceo' ? 'border-neutral-700 shadow-[0_0_10px_rgba(255,255,255,0.02)]' : ''}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${viewRole !== adminUser.role ? 'bg-white' : 'bg-neutral-600'}`} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                {ROLE_LABELS[activeRole]}
              </span>
            </div>

            <NotificationCenter />
          </div>
        </header>
        )}

        {/* Content Area - Full Matte Width */}
        <main className={`flex-1 overflow-y-auto bg-[#121212] ${(location.pathname === '/agent' || location.pathname === '/global-radar' || isEmbed) ? '' : 'p-6'}`}>
          <div className={(location.pathname === '/agent' || location.pathname === '/global-radar') ? 'h-full' : 'max-w-[1500px] mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      <InternalMessaging />
      <QuickActionsPanel />

      {/* Dynamic Detail Inspector Dialog */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedEntity(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {selectedEntity.type === 'employee' ? (
              // EMPLOYEE PROFILE MODAL VIEW
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm text-white font-bold shrink-0 uppercase shadow-lg border border-zinc-800"
                    style={{ background: selectedEntity.data.avatar_color || '#a855f7' }}
                  >
                    {selectedEntity.data.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">{selectedEntity.data.full_name}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider mt-0.5">
                      {selectedEntity.data.department} • {selectedEntity.data.role_level}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-zinc-800/60 font-mono text-[11px] leading-relaxed">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Identity Tag</span>
                    <span className="text-neutral-300 font-bold select-all">{selectedEntity.data.id.substring(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Secure Email</span>
                    <span className="text-white font-semibold select-all">{selectedEntity.data.email}</span>
                  </div>
                </div>

                {entityExtraInfo?.attendance && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Recent Attendance</h4>
                    <div className="bg-zinc-900/35 rounded-xl border border-zinc-800/50 overflow-hidden divide-y divide-zinc-800">
                      {entityExtraInfo.attendance.length === 0 ? (
                        <div className="p-3 text-[10px] text-neutral-600 font-mono italic">No logged attendance records.</div>
                      ) : (
                        entityExtraInfo.attendance.map((log: any) => (
                          <div key={log.id} className="p-2.5 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-neutral-400">{log.date}</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-tighter text-[9px] ${log.status === 'present' ? 'bg-emerald-500/15 text-emerald-400' :
                                log.status === 'late' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                              }`}>{log.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 pt-4 border-t border-zinc-800/60">
                  <button
                    onClick={() => {
                      setSelectedEntity(null);
                      navigate("/hr/employees");
                    }}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-zinc-700/40"
                  >
                    Go to Personnel Directory
                  </button>
                </div>
              </div>
            ) : (
              // CLIENT / USER PROFILE MODAL VIEW
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm text-white font-bold shrink-0 uppercase shadow-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
                    {selectedEntity.data.avatar_url && !selectedEntity.data.avatar_url.startsWith('#') ? (
                      <img src={selectedEntity.data.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedEntity.data.full_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">{selectedEntity.data.full_name}</h3>
                    <p className="text-[10px] text-neutral-500 font-mono font-bold mt-0.5 flex items-center gap-1.5">
                      <span>@{selectedEntity.data.username}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[8px] uppercase tracking-wider ${selectedEntity.data.subscription_status === 'elite' ? 'bg-amber-500/20 text-amber-400' :
                          selectedEntity.data.subscription_status === 'pro' ? 'bg-zinc-800 text-zinc-300' : 'bg-neutral-800 text-neutral-400'
                        }`}>{selectedEntity.data.subscription_status || 'free'}</span>
                    </p>
                  </div>
                </div>

                {selectedEntity.data.is_frozen && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <ShieldAlert size={14} className="text-red-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">Account Status: Restricted / Frozen</span>
                  </div>
                )}

                <div className="space-y-2.5 pt-4 border-t border-zinc-800/60 font-mono text-[11px] leading-relaxed">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Identity Tag</span>
                    <span className="text-neutral-300 font-bold select-all">{selectedEntity.data.id.substring(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Trader Email</span>
                    <span className="text-white font-semibold select-all">{selectedEntity.data.email}</span>
                  </div>
                </div>

                {/* MT5 Accounts Info */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Linked MT5 Accounts</h4>
                  <div className="bg-zinc-900/35 rounded-xl border border-zinc-800/50 overflow-hidden divide-y divide-zinc-800/60">
                    {!entityExtraInfo ? (
                      <div className="p-3 text-[10px] text-neutral-600 font-mono italic animate-pulse">Syncing Broker Node...</div>
                    ) : entityExtraInfo.mt5?.length === 0 ? (
                      <div className="p-3 text-[10px] text-neutral-600 font-mono italic">No accounts linked.</div>
                    ) : (
                      entityExtraInfo.mt5?.map((acc: any) => (
                        <div key={acc.id} className="p-2.5 flex justify-between items-center text-[10px] font-mono">
                          <div className="flex flex-col">
                            <span className="text-white font-bold">{acc.broker_login}</span>
                            <span className="text-[8px] text-neutral-500">{acc.broker_name || 'Standard MT5'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold">₹{(acc.balance || 0).toLocaleString()}</span>
                            <span className={`block text-[8.5px] uppercase font-bold tracking-tight ${acc.algo_status === 'active' ? 'text-emerald-400' : 'text-neutral-500'
                              }`}>{acc.algo_status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-zinc-800/60">
                  <button
                    onClick={() => {
                      setSelectedEntity(null);
                      navigate("/users");
                    }}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-zinc-700/40"
                  >
                    Go to Account Registry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
