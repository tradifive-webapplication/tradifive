import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Menu,
  X,
  Bot,
  Activity,
  Cpu,
  ShoppingBag,
  FileText,
  Landmark,
  Key,
  Server,
  Zap,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

interface FiAlgoAdminTopbarProps {
  onOpenMobileMenu: () => void;
}

export default function FiAlgoAdminTopbar({ onOpenMobileMenu }: FiAlgoAdminTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [topSearchQuery, setTopSearchQuery] = useState("");
  const [showTopSearch, setShowTopSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener: press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setShowTopSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/fialgo") return "FiAlgo Engine Dashboard";
    if (p.startsWith("/auto-trade/dashboard")) return "Auto Trade Engine Terminal";
    if (p.startsWith("/auto-trade/active-bots")) return "Active Algo Bots";
    if (p.startsWith("/auto-trade/marketplace")) return "Algo Marketplace";
    if (p.startsWith("/strategy-builder")) return "Strategy Builder";
    if (p.startsWith("/auto-trade/history")) return "Execution & Order History";
    if (p.startsWith("/weekly-settlements")) return "Weekly Profit Settlements";
    if (p.startsWith("/auto-trade/license")) return "EA License & Key Activation";
    if (p.startsWith("/auto-trade/setup")) return "MT5 Terminal Connection";
    return "FiAlgo Workspace";
  };

  const navItems = [
    { label: "Dashboard", path: "/fialgo", category: "Engine" },
    { label: "Auto Trade Engine", path: "/auto-trade/dashboard", category: "Terminal" },
    { label: "Active Bots", path: "/auto-trade/active-bots", category: "Bots" },
    { label: "Algo Marketplace", path: "/auto-trade/marketplace", category: "Market" },
    { label: "Strategy Builder", path: "/strategy-builder", category: "Builder" },
    { label: "Order History", path: "/auto-trade/history", category: "Execution" },
    { label: "Weekly Settlements", path: "/weekly-settlements", category: "Finance" },
    { label: "License & EA Keys", path: "/auto-trade/license", category: "Access" },
  ];

  const filteredItems = topSearchQuery.trim()
    ? navItems.filter((i) =>
        i.label.toLowerCase().includes(topSearchQuery.toLowerCase()) ||
        i.category.toLowerCase().includes(topSearchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 relative z-30 select-none shrink-0 font-sans">
      {/* Left: Hamburger (Mobile) + Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu size={19} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
            FiAlgo
          </span>
          <ChevronRight size={13} className="text-slate-300 hidden sm:inline-block" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide truncate max-w-[170px] sm:max-w-xs">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Desktop Global Search Bar (Modeled exactly on AdminLayout.tsx) */}
      <div className="flex-1 max-w-xl px-4 sm:px-8 hidden md:block relative">
        <div className="relative group flex items-center">
          <Search
            size={14}
            className="absolute left-3.5 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={topSearchQuery}
            onChange={(e) => setTopSearchQuery(e.target.value)}
            onFocus={() => setShowTopSearch(true)}
            onBlur={() => setTimeout(() => setShowTopSearch(false), 250)}
            placeholder="Search algo bots, strategies, executions, routes..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-500/50 rounded-lg flex items-center pl-10 pr-12 py-1.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.12)]"
          />
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-medium text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
              /
            </kbd>
          </div>

          {/* Quick Search Helper (Empty query) */}
          {showTopSearch && !topSearchQuery.trim() && (
            <div className="absolute top-[125%] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-[200] space-y-2.5">
              <div className="px-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 pb-1.5">
                Quick Navigation & Commands
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onMouseDown={() => {
                    navigate("/fialgo");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-left transition-all"
                >
                  <Bot size={14} className="text-purple-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Dashboard</p>
                    <p className="text-[8.5px] text-slate-400">Overview</p>
                  </div>
                </button>
                <button
                  onMouseDown={() => {
                    navigate("/auto-trade/active-bots");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-left transition-all"
                >
                  <Activity size={14} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Active Bots</p>
                    <p className="text-[8.5px] text-slate-400">4 Running</p>
                  </div>
                </button>
                <button
                  onMouseDown={() => {
                    navigate("/strategy-builder");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-left transition-all"
                >
                  <Cpu size={14} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Strategy</p>
                    <p className="text-[8.5px] text-slate-400">Builder</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Filter Results */}
          {showTopSearch && topSearchQuery.trim() && (
            <div className="absolute top-[125%] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-[200] max-h-72 overflow-y-auto space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.path}
                    onMouseDown={() => {
                      navigate(item.path);
                      setTopSearchQuery("");
                      setShowTopSearch(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-purple-50 text-slate-700 hover:text-purple-900 transition-colors text-left"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching algo routes or features found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Live Status Badge + Live Time + Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Live Engine Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            MT5 Connected
          </span>
        </div>

        {/* Live System Time */}
        <div className="hidden xl:flex items-center px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[11px] font-mono text-slate-600">
            {systemTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Quick Action Button: Launch Bot */}
        <button
          onClick={() => navigate("/strategy-builder")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Zap size={13} />
          <span className="hidden sm:inline">Launch Bot</span>
        </button>
      </div>

      {/* Mobile Search Fullscreen Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[300] bg-white flex flex-col p-4 md:hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Search size={16} className="text-slate-400" />
            <input
              ref={mobileInputRef}
              autoFocus
              type="text"
              value={topSearchQuery}
              onChange={(e) => setTopSearchQuery(e.target.value)}
              placeholder="Search algo bots, strategies..."
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setTopSearchQuery("");
              }}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileSearch(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-left active:bg-slate-100"
              >
                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
