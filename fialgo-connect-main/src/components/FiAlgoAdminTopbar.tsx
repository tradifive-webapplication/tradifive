import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  X,
  BotMessageSquare,
  Monitor,
  Bell,
  Bot,
  Activity,
  Cpu,
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

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

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
    if (p === "/fialgo") return "Auto Trade Engine";
    if (p.startsWith("/auto-trade/dashboard")) return "MT5 Execution Pulse";
    if (p.startsWith("/auto-trade/active-bots")) return "Active Bots";
    if (p.startsWith("/strategy-builder")) return "Strategy Builder";
    if (p.startsWith("/auto-trade/history")) return "Order History";
    if (p.startsWith("/weekly-settlements")) return "Weekly Settlements";
    if (p.startsWith("/auto-trade/license")) return "EA License & Keys";
    if (p.startsWith("/risk-guard")) return "Configure Risk & Lots";
    if (p.startsWith("/broker-connect")) return "Broker Setup & MT5";
    return "Auto Trade Engine";
  };

  const navItems = [
    { label: "Auto Trade Engine", path: "/fialgo", category: "Overview" },
    { label: "MT5 Execution Pulse", path: "/auto-trade/dashboard", category: "Terminal" },
    { label: "Active Bots", path: "/auto-trade/active-bots", category: "Bots" },
    { label: "Strategy Builder", path: "/strategy-builder", category: "Builder" },
    { label: "Order History", path: "/auto-trade/history", category: "Execution" },
    { label: "Weekly Settlements", path: "/weekly-settlements", category: "Settlements" },
    { label: "EA License & Keys", path: "/auto-trade/license", category: "License" },
    { label: "Configure Risk & Lots", path: "/risk-guard", category: "Risk" },
    { label: "Broker Setup & MT5", path: "/broker-connect", category: "MT5" },
  ];

  const filteredItems = topSearchQuery.trim()
    ? navItems.filter((i) =>
        i.label.toLowerCase().includes(topSearchQuery.toLowerCase()) ||
        i.category.toLowerCase().includes(topSearchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-[#121214]/95 backdrop-blur-md border-b border-white/[0.08] relative z-30 select-none shrink-0 font-sans">
      {/* Left: Mobile Hamburger + Clean Page Title (Exact Match to Admin App Image 1) */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer mr-1"
          aria-label="Open Navigation Menu"
        >
          <Menu size={19} />
        </button>

        <h2 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate max-w-[160px] sm:max-w-xs">
          {getPageTitle()}
        </h2>
      </div>

      {/* Desktop Global Search Bar (Exact Match to Admin App Image 1) */}
      <div className="flex-1 max-w-xl px-4 sm:px-8 hidden md:block relative">
        <div className="relative group flex items-center">
          <Search
            size={14}
            className="absolute left-3.5 text-neutral-500 group-focus-within:text-blue-400 transition-colors pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={topSearchQuery}
            onChange={(e) => setTopSearchQuery(e.target.value)}
            onFocus={() => setShowTopSearch(true)}
            onBlur={() => setTimeout(() => setShowTopSearch(false), 250)}
            placeholder="Search algo bots, strategies, executions, routes..."
            className="w-full bg-[#18181A] hover:bg-[#1D1D20] focus:bg-[#202024] border border-white/10 focus:border-blue-500/50 rounded-lg flex items-center pl-10 pr-12 py-2 text-xs text-white outline-none transition-all placeholder:text-neutral-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          />
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-medium text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">
              /
            </kbd>
          </div>

          {/* Quick Search Dropdown */}
          {showTopSearch && !topSearchQuery.trim() && (
            <div className="absolute top-[125%] left-0 w-full bg-[#18181B]/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-3 z-[200] space-y-3">
              <div className="px-2 py-0.5 text-[9px] text-neutral-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                Search Commands & Filters
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onMouseDown={() => {
                    navigate("/fialgo");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-lg text-left transition-all"
                >
                  <Bot size={13} className="text-zinc-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-300">Pages</span>
                    <span className="text-[8px] text-neutral-500">Go to route</span>
                  </div>
                </button>
                <button
                  onMouseDown={() => {
                    navigate("/auto-trade/active-bots");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-lg text-left transition-all"
                >
                  <Activity size={13} className="text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-300">Active Bots</span>
                    <span className="text-[8px] text-neutral-500">Live fleet</span>
                  </div>
                </button>
                <button
                  onMouseDown={() => {
                    navigate("/strategy-builder");
                    setShowTopSearch(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-lg text-left transition-all"
                >
                  <Cpu size={13} className="text-purple-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-300">Strategy</span>
                    <span className="text-[8px] text-neutral-500">Builder</span>
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
                  No matching routes found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Only Notification Bell */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notification Bell */}
        <button
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={17} />
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
              placeholder="Search algo bots, strategies, executions, routes..."
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
