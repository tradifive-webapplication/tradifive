import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ChevronsUpDown, Check, Sparkles, Cpu, Layers } from "lucide-react";

interface WorkspaceSwitcherProps {
  isMobile?: boolean;
  className?: string;
}

export default function WorkspaceSwitcher({ isMobile = false, className = "" }: WorkspaceSwitcherProps) {
  const { activeWorkspace, switchWorkspace, isFiAlgo, isTradiFive } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleSelect = (ws: "tradifive" | "fialgo") => {
    switchWorkspace(ws);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none ${className}`}
    >
      {/* ── Boxed Workspace Switcher ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#1A1A1E]/90 hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-blue-500/40 dark:hover:border-blue-400/30 shadow-xs transition-all duration-200 cursor-pointer text-left min-w-[175px] sm:min-w-[195px] max-w-full group"
        title="Switch Workspace (TradiFive / FiAlgo)"
      >
        <div className="flex flex-col items-start min-w-0 flex-1">
          {/* Logo container */}
          <div className="flex items-center h-[22px] overflow-hidden">
            {isFiAlgo ? (
              <img
                src="/fialgo-logo.png"
                alt="FiAlgo Workspace"
                className="h-[20px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <>
                <img
                  src="/Tradifive_logo1.png"
                  alt="TradiFive Workspace"
                  className="h-[18px] sm:h-[19px] w-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-105"
                />
                <img
                  src="/Dark mode logo with white.png"
                  alt="TradiFive Workspace"
                  className="h-[18px] sm:h-[19px] w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105"
                />
              </>
            )}
          </div>

          {/* Label below: Workspace */}
          <div className="flex items-center gap-1.5 mt-1 leading-none">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              Workspace
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFiAlgo
                  ? "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                  : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
              } animate-pulse`}
            />
          </div>
        </div>

        {/* Switcher icon */}
        <div className="w-6 h-6 rounded-lg bg-slate-100/80 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/15 transition-all">
          <ChevronsUpDown
            size={13}
            className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors"
          />
        </div>
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1.5 w-[265px] rounded-2xl bg-white dark:bg-[#1A1A1E] border border-slate-200/90 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)] p-2 z-[200] animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Switch Workspace
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              2 Available
            </span>
          </div>

          {/* Option 1: TradiFive Workspace */}
          <button
            type="button"
            onClick={() => handleSelect("tradifive")}
            className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition-all cursor-pointer text-left ${
              isTradiFive
                ? "bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20"
                : "hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Logo icon box */}
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs p-1">
                <img
                  src="/tf-logo.png"
                  alt="TradiFive"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100 truncate">
                    TradiFive Workspace
                  </span>
                </div>
                <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Feed, Journal, AI Coach & Community
                </span>
              </div>
            </div>

            {isTradiFive ? (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-xs">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            ) : (
              <span className="text-[9.5px] font-bold text-slate-400 opacity-0 group-hover:opacity-100">
                Switch
              </span>
            )}
          </button>

          {/* Option 2: FiAlgo Workspace */}
          <button
            type="button"
            onClick={() => handleSelect("fialgo")}
            className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition-all cursor-pointer text-left mt-1 ${
              isFiAlgo
                ? "bg-purple-50/80 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-500/20"
                : "hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Logo icon box */}
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs p-1 overflow-hidden">
                <img
                  src="/fialgo-logo.png"
                  alt="FiAlgo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100 truncate">
                    FiAlgo Workspace
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    ALGO
                  </span>
                </div>
                <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Auto Trade, Backtesting & Bots
                </span>
              </div>
            </div>

            {isFiAlgo ? (
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            ) : (
              <span className="text-[9.5px] font-bold text-purple-600 dark:text-purple-400">
                Open →
              </span>
            )}
          </button>

          {/* Quick Footer */}
          <div className="mt-2 pt-1.5 px-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Cpu size={10} className="text-purple-500" />
              Institutional Algo Engine
            </span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">v2.4</span>
          </div>
        </div>
      )}
    </div>
  );
}
