import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  X,
  Bot,
  Activity,
  Cpu,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-[#121214]/95 backdrop-blur-md border-b border-white/[0.08] relative z-30 select-none shrink-0 font-sans">
      {/* Left: Hamburger (Mobile) + Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer mr-1"
          aria-label="Open Navigation Menu"
        >
          <Menu size={19} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
            FiAlgo
          </span>
          <ChevronRight size={13} className="text-neutral-600 hidden sm:inline-block" />
          <h2 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate max-w-[170px] sm:max-w-xs">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Desktop Global Search Bar (Modeled exactly on AdminLayout.tsx) */}
      <div className="flex-1 max-w-xl px-4 sm:px-8 hidden md:block relative">
        <div className="relative group flex items-center">
          <Search
            size={14}
            className="absolute left-3.5 text-neutral-500 group-focus-within:text-purple-400 transition-colors pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={topSearchQuery}
            onChange={(e) => setTopSearchQuery(e.target.value)}
            onFocus={() => setShowTopSearch(true)}
            onBlur={() => setTimeout(() => setShowTopSearch(false), 250)}
            placeholder="Search algo bots, strategies, executions, routes..."
            className="w-full bg-[#18181A] hover:bg-[#1D1D20] focus:bg-[#202024] border border-white/10 focus:border-purple-500/50 rounded-lg flex items-center pl-10 pr-12 py-2 text-xs text-white outline-none transition-all placeholder:text-neutral-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          />
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-medium text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">
              /
            </kbd>
          </div>

          {/* Quick Search Helper (Empty query) */}
          {showTopSearch && !topSearchQuery.trim() && (
            <div className="absolute top-[125%] left-0 w-full bg-[#18181B]/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-3 z-[200] space-y-2.5">
              <div className="px-1 text-[9px] text-neutral-500 font-bold uppercase tracking-widest border-b border-white/5 pb-1.5">
                Quick Navigation & Commands
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onMouseDown={() => {
                    navigate("/fialgo");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-left transition-all"
                >
                  <Bot size={14} className="text-purple-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-neutral-200">Dashboard</p>
                    <p className="text-[8.5px] text-neutral-500">Overview</p>
                  </div>
                </button>
                <button
                  onMouseDown={() => {
                    navigate("/auto-trade/active-bots");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-left transition-all"
                >
                  <Activity size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-neutral-200">Active Bots</p>
                    <p className="text-[8.5px] text-neutral-500">4 Running</p>
                  </div>
                </button>
                <button
                  onMouseDown={() => {
                    navigate("/strategy-builder");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-left transition-all"
                >
                  <Cpu size={14} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-neutral-200">Strategy</p>
                    <p className="text-[8.5px] text-neutral-500">Builder</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Filter Results */}
          {showTopSearch && topSearchQuery.trim() && (
            <div className="absolute top-[125%] left-0 w-full bg-[#18181B]/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-2 z-[200] max-h-72 overflow-y-auto space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.path}
                    onMouseDown={() => {
                      navigate(item.path);
                      setTopSearchQuery("");
                      setShowTopSearch(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-white/5 text-neutral-300 hover:text-white transition-colors text-left"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-neutral-500">
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
          className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Live Engine Status Badge (Admin App exact styling) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">
            MT5 Connected
          </span>
        </div>

        {/* Live System Time */}
        <div className="hidden xl:flex items-center px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg">
          <span className="text-[11px] font-mono text-neutral-400">
            {systemTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Quick Action Button: Launch Bot */}
        <button
          onClick={() => navigate("/strategy-builder")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all active:scale-95 cursor-pointer"
        >
          <Zap size={13} />
          <span className="hidden sm:inline">Launch Bot</span>
        </button>
      </div>

      {/* Mobile Search Fullscreen Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col p-4 md:hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Search size={16} className="text-neutral-400" />
            <input
              ref={mobileInputRef}
              autoFocus
              type="text"
              value={topSearchQuery}
              onChange={(e) => setTopSearchQuery(e.target.value)}
              placeholder="Search algo bots, strategies..."
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

          <div className="flex-1 overflow-y-auto pt-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileSearch(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 text-left active:bg-white/10"
              >
                <span className="text-sm font-semibold text-white">{item.label}</span>
                <span className="text-[10px] uppercase font-bold text-neutral-400">{item.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
