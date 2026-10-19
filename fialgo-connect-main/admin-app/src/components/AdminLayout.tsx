import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { ROLE_LABELS, getNavForRole } from "../lib/rbac";
import {
  Bell, ChevronRight, BotMessageSquare, Search,
  Loader2, X, Cpu, Landmark, User, ShieldAlert, Zap, Monitor,
  Menu, LayoutDashboard, Users as UsersIcon, Bot, Activity
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

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
      setShowMobileSearch(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectItem = (item: { type: 'page' | 'employee' | 'client'; data: any }) => {
    if (item.type === 'page') {
      navigate(item.data.path);
      setTopSearchQuery("");
      setShowTopSearch(false);
      setShowMobileSearch(false);
      inputRef.current?.blur();
    } else {
      setSelectedEntity({ type: item.type, data: item.data });
      setTopSearchQuery("");
      setShowTopSearch(false);
      setShowMobileSearch(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-[#E5E5E5] overflow-hidden font-sans selection:bg-white/10">
      {!isEmbed && (
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Sleek Minimal & Ergonomic */}
        {!isEmbed && (
          <header className="h-14 sm:h-15 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-[#121214]/95 backdrop-blur-md border-b border-white/[0.08] relative z-40 select-none shrink-0">
            {/* Left: Hamburger (Mobile) + Breadcrumb */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors mr-1 cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu size={19} />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wider uppercase shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Tradifive
                </span>
                <ChevronRight size={13} className="text-neutral-600 shrink-0" />
                <h2 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate max-w-[160px] sm:max-w-xs">
                  {pageName === "Auto Trade Admin" ? "Auto Trade Registry" : pageName}
                </h2>
              </div>
            </div>

            {/* Desktop Global Search Bar */}
            <div className="flex-1 max-w-xl px-4 sm:px-8 hidden md:block relative">
              <div className="relative group flex items-center">
                <Search size={14} className="absolute left-3.5 text-neutral-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={topSearchQuery}
                  onChange={(e) => setTopSearchQuery(e.target.value)}
                  onFocus={() => setShowTopSearch(true)}
                  onBlur={() => setTimeout(() => setShowTopSearch(false), 250)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, employees, clients..."
                  className="w-full bg-[#18181A] hover:bg-[#1D1D20] focus:bg-[#202024] border border-white/10 focus:border-blue-500/50 rounded-lg flex items-center pl-10 pr-12 py-2 text-xs text-white outline-none transition-all placeholder:text-neutral-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                />
                <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
                  <kbd className="text-[10px] font-medium text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">/ </kbd>
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

            {/* Right: Actions & Tools */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
              {/* Mobile Search Trigger Button */}
              <button
                onClick={() => {
                  setShowMobileSearch(true);
                  setTimeout(() => mobileInputRef.current?.focus(), 100);
                }}
                className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Search Pages and Users"
                aria-label="Search"
              >
                <Search size={16} />
              </button>

              <button
                onClick={() => window.open('/live-view', '_blank')}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded border border-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                title="Open Live App Viewer"
              >
                <Monitor size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline-block">Live App</span>
              </button>

              <Link
                to="/agent"
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-transparent hover:bg-white/[0.05] rounded text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                title="Agent Command"
              >
                <BotMessageSquare size={14} className="text-[#a855f7]" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline-block">Agent</span>
              </Link>

              <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />

              <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded ${adminUser.role === 'ceo' && viewRole !== 'ceo' ? 'border-neutral-700 shadow-[0_0_10px_rgba(255,255,255,0.02)]' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${viewRole !== adminUser.role ? 'bg-white' : 'bg-neutral-600'}`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                  {ROLE_LABELS[activeRole]}
                </span>
              </div>

              <NotificationCenter />
            </div>
          </header>
        )}

        {/* Mobile Fullscreen Search Overlay */}
        {showMobileSearch && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col p-4 md:hidden">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Search size={16} className="text-neutral-400" />
              <input
                ref={mobileInputRef}
                type="text"
                value={topSearchQuery}
                onChange={(e) => setTopSearchQuery(e.target.value)}
                placeholder="Search pages, employees, clients..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              />
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                  setTopSearchQuery("");
                }}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-4">
              {!topSearchQuery.trim() ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Quick Commands</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTopSearchQuery("/")}
                      className="p-2.5 bg-white/5 rounded-lg text-left"
                    >
                      <span className="text-xs font-mono font-bold text-blue-400">/</span>
                      <p className="text-[10px] font-bold text-white mt-1">Pages</p>
                    </button>
                    <button
                      onClick={() => setTopSearchQuery("@")}
                      className="p-2.5 bg-white/5 rounded-lg text-left"
                    >
                      <span className="text-xs font-mono font-bold text-purple-400">@</span>
                      <p className="text-[10px] font-bold text-white mt-1">Employees</p>
                    </button>
                    <button
                      onClick={() => setTopSearchQuery("#")}
                      className="p-2.5 bg-white/5 rounded-lg text-left"
                    >
                      <span className="text-xs font-mono font-bold text-emerald-400">#</span>
                      <p className="text-[10px] font-bold text-white mt-1">Clients</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchLoading && (
                    <div className="py-6 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-blue-400" /> Searching database...
                    </div>
                  )}

                  {!searchLoading && flatResults.length === 0 && (
                    <p className="text-xs text-neutral-500 text-center py-8">No results found.</p>
                  )}

                  {searchResults.pages.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectItem({ type: "page", data: item })}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 text-left active:bg-white/10"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={14} className="text-blue-400" />
                          <span className="text-xs font-medium text-white">{item.label}</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-mono">{item.department}</span>
                      </button>
                    );
                  })}

                  {searchResults.employees.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem({ type: "employee", data: item })}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 text-left active:bg-white/10"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 uppercase"
                          style={{ background: item.avatar_color || "#a855f7" }}
                        >
                          {item.full_name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium text-white">{item.full_name}</p>
                          <p className="text-[9px] text-neutral-400 truncate">{item.email}</p>
                        </div>
                      </div>
                      <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-300 font-mono uppercase">{item.role_level}</span>
                    </button>
                  ))}

                  {searchResults.clients.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem({ type: "client", data: item })}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 text-left active:bg-white/10"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-white font-bold shrink-0 uppercase bg-neutral-800 border border-white/5">
                          {item.full_name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium text-white">{item.full_name}</p>
                          <p className="text-[9px] text-neutral-400">@{item.username}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-amber-400 uppercase">{item.subscription_status || "free"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area - Full Matte Width & Proper Mobile Fit */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-[#121212] ${(location.pathname === '/agent' || location.pathname === '/global-radar' || isEmbed) ? '' : 'p-3.5 sm:p-5 md:p-6 pb-24 lg:pb-6'}`}>
          <div className={(location.pathname === '/agent' || location.pathname === '/global-radar') ? 'h-full' : 'max-w-[1500px] mx-auto w-full min-w-0'}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      {!isEmbed && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161616]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              location.pathname === "/" ? "text-blue-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[9px] uppercase tracking-wider mt-0.5">Overview</span>
          </Link>

          <Link
            to="/auto-trade-admin"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors relative ${
              location.pathname === "/auto-trade-admin" || location.pathname === "/auto-trade" ? "text-blue-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Bot size={18} />
            <span className="text-[9px] uppercase tracking-wider mt-0.5">Auto Trade</span>
            <span className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </Link>

          <Link
            to="/users"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              location.pathname.startsWith("/users") ? "text-blue-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <UsersIcon size={18} />
            <span className="text-[9px] uppercase tracking-wider mt-0.5">Users</span>
          </Link>

          <Link
            to="/trades"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              location.pathname === "/trades" ? "text-blue-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Activity size={18} />
            <span className="text-[9px] uppercase tracking-wider mt-0.5">Feed</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-neutral-400 hover:text-white transition-colors"
            aria-label="All Navigation Menu"
          >
            <Menu size={18} />
            <span className="text-[9px] uppercase tracking-wider mt-0.5">Menu</span>
          </button>
        </nav>
      )}

      <InternalMessaging />
      <QuickActionsPanel />

      {/* Dynamic Detail Inspector Dialog */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#18181B] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6 relative flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedEntity(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>

            {selectedEntity.type === 'employee' ? (
              // EMPLOYEE PROFILE MODAL VIEW
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm text-white font-bold shrink-0 uppercase shadow-lg border border-zinc-800"
                    style={{ background: selectedEntity.data.avatar_color || '#a855f7' }}
                  >
                    {selectedEntity.data.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-white uppercase tracking-wider truncate">{selectedEntity.data.full_name}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider mt-0.5 truncate">
                      {selectedEntity.data.department} • {selectedEntity.data.role_level}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-zinc-800/60 font-mono text-[11px] leading-relaxed">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Identity Tag</span>
                    <span className="text-neutral-300 font-bold select-all truncate ml-2">{selectedEntity.data.id.substring(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Secure Email</span>
                    <span className="text-white font-semibold select-all truncate ml-2">{selectedEntity.data.email}</span>
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
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm text-white font-bold shrink-0 uppercase shadow-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
                    {selectedEntity.data.avatar_url && !selectedEntity.data.avatar_url.startsWith('#') ? (
                      <img src={selectedEntity.data.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedEntity.data.full_name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-white uppercase tracking-wider truncate">{selectedEntity.data.full_name}</h3>
                    <p className="text-[10px] text-neutral-500 font-mono font-bold mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="truncate">@{selectedEntity.data.username}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[8px] uppercase tracking-wider shrink-0 ${selectedEntity.data.subscription_status === 'elite' ? 'bg-amber-500/20 text-amber-400' :
                          selectedEntity.data.subscription_status === 'pro' ? 'bg-zinc-800 text-zinc-300' : 'bg-neutral-800 text-neutral-400'
                        }`}>{selectedEntity.data.subscription_status || 'free'}</span>
                    </p>
                  </div>
                </div>

                {selectedEntity.data.is_frozen && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <ShieldAlert size={14} className="text-red-400 animate-pulse shrink-0" />
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">Account Status: Restricted / Frozen</span>
                  </div>
                )}

                <div className="space-y-2.5 pt-4 border-t border-zinc-800/60 font-mono text-[11px] leading-relaxed">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Identity Tag</span>
                    <span className="text-neutral-300 font-bold select-all truncate ml-2">{selectedEntity.data.id.substring(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-neutral-500">Trader Email</span>
                    <span className="text-white font-semibold select-all truncate ml-2">{selectedEntity.data.email}</span>
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
                          <div className="flex flex-col min-w-0">
                            <span className="text-white font-bold truncate">{acc.broker_login}</span>
                            <span className="text-[8px] text-neutral-500 truncate">{acc.broker_name || 'Standard MT5'}</span>
                          </div>
                          <div className="text-right shrink-0">
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
