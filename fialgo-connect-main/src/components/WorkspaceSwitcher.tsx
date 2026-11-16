import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import FiAlgoLogo from "./FiAlgoLogo";

interface WorkspaceSwitcherProps {
  isMobile?: boolean;
  className?: string;
  onCloseMobile?: () => void;
}

export default function WorkspaceSwitcher({
  isMobile = false,
  className = "",
  onCloseMobile,
}: WorkspaceSwitcherProps) {
  const { switchWorkspace, isFiAlgo } = useWorkspace();
  const [isHovered, setIsHovered] = useState(false);

  const handleSwitch = () => {
    onCloseMobile?.();
    switchWorkspace(isFiAlgo ? "tradifive" : "fialgo");
  };

  return (
    <div className={`relative select-none ${className}`}>
      {/* ── Workspace Switcher Button with side arrow (Hover slides logo UP and target logo UP from DOWN, click switches workspace) ── */}
      <button
        type="button"
        onClick={handleSwitch}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isFiAlgo ? "Switch to TradiFive Workspace" : "Switch to FiAlgo Workspace"}
        className="w-full flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-white/[0.05] active:bg-slate-200/50 dark:active:bg-white/[0.08] transition-colors duration-200 cursor-pointer text-left select-none group"
      >
        {/* Animated Logo Container */}
        <div className="relative h-[32px] sm:h-[36px] flex-1 overflow-hidden select-none flex items-center">
          {/* Active Workspace Logo (Moves UP and fades out on hover) */}
          <div
            className={`absolute inset-0 flex items-center transition-all duration-300 ease-out transform ${
              isHovered ? "opacity-0 -translate-y-3 pointer-events-none" : "opacity-100 translate-y-0"
            }`}
          >
            {isFiAlgo ? (
              <FiAlgoLogo variant="auto" />
            ) : (
              <>
                <img
                  src="/Tradifive_logo1.png"
                  alt="TradiFive Workspace"
                  className="h-[28px] sm:h-[32px] w-auto object-contain dark:hidden"
                />
                <img
                  src="/Dark mode logo with white.png"
                  alt="TradiFive Workspace"
                  className="h-[28px] sm:h-[32px] w-auto object-contain hidden dark:block"
                />
              </>
            )}
          </div>

          {/* Target Workspace Logo (Comes from DOWN and fades in on hover) */}
          <div
            className={`absolute inset-0 flex items-center transition-all duration-300 ease-out transform ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
            }`}
          >
            {isFiAlgo ? (
              <>
                <img
                  src="/Tradifive_logo1.png"
                  alt="Switch to TradiFive"
                  className="h-[28px] sm:h-[32px] w-auto object-contain dark:hidden"
                />
                <img
                  src="/Dark mode logo with white.png"
                  alt="Switch to TradiFive"
                  className="h-[28px] sm:h-[32px] w-auto object-contain hidden dark:block"
                />
              </>
            ) : (
              <FiAlgoLogo variant="auto" />
            )}
          </div>
        </div>

        {/* Arrow on the side so users instantly know it is a switcher button */}
        <ChevronsUpDown
          size={15}
          strokeWidth={2.2}
          className="text-slate-400 dark:text-neutral-500 group-hover:text-slate-700 dark:group-hover:text-neutral-200 transition-colors shrink-0 ml-2"
        />
      </button>
    </div>
  );
}
