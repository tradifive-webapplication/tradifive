import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ChevronsUpDown, Check } from "lucide-react";

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
    }, 300);
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
      className={`relative select-none w-full ${className}`}
    >
      {/* ── Borderless Workspace Switcher (Logo on Left + Dropdown Arrow on Far Right like Bottom Profile) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-white/[0.05] transition-all duration-200 cursor-pointer text-left group"
        title="Switch Workspace (TradiFive / FiAlgo)"
      >
        {/* Logo container (Prominent, crisp size, no workspace text below) */}
        <div className="flex items-center h-[28px] sm:h-[30px] overflow-hidden">
          {isFiAlgo ? (
            <img
              src="/fialgo-logo.png"
              alt="FiAlgo Workspace"
              className="h-[26px] sm:h-[29px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <>
              <img
                src="/Tradifive_logo1.png"
                alt="TradiFive Workspace"
                className="h-[26px] sm:h-[29px] w-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <img
                src="/Dark mode logo with white.png"
                alt="TradiFive Workspace"
                className="h-[26px] sm:h-[29px] w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </>
          )}
        </div>

        {/* Up/Down Arrow Side (Positioned on the far right like the profile card at the bottom) */}
        <ChevronsUpDown
          size={16}
          strokeWidth={2.2}
          className="text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0 mr-1"
        />
      </button>

      {/* ── Dropdown Menu (Simple: TradiFive Workspace & FiAlgo Workspace, No Distractions) ── */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-2 w-full min-w-[220px] rounded-2xl bg-white dark:bg-[#1A1A1E] border border-slate-200/90 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)] p-1.5 z-[200] animate-in fade-in zoom-in-95 duration-150 space-y-1`}
        >
          {/* Option 1: TradiFive Workspace */}
          <button
            type="button"
            onClick={() => handleSelect("tradifive")}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
              isTradiFive
                ? "bg-slate-100/90 dark:bg-white/10 text-slate-900 dark:text-white"
                : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 p-1 shadow-xs">
                <img
                  src="/tf-logo.png"
                  alt="TradiFive"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[13px] font-semibold truncate">
                TradiFive Workspace
              </span>
            </div>

            {isTradiFive && (
              <Check size={16} className="text-blue-500 shrink-0" strokeWidth={2.5} />
            )}
          </button>

          {/* Option 2: FiAlgo Workspace */}
          <button
            type="button"
            onClick={() => handleSelect("fialgo")}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
              isFiAlgo
                ? "bg-slate-100/90 dark:bg-white/10 text-slate-900 dark:text-white"
                : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 p-1 shadow-xs overflow-hidden">
                <img
                  src="/fialgo-logo.png"
                  alt="FiAlgo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[13px] font-semibold truncate">
                FiAlgo Workspace
              </span>
            </div>

            {isFiAlgo && (
              <Check size={16} className="text-purple-500 shrink-0" strokeWidth={2.5} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
