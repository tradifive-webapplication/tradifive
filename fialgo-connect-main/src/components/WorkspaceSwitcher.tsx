import React from "react";
import { Link } from "react-router-dom";

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
  return (
    <div className={`relative select-none ${className}`}>
      <Link
        to="/dashboard"
        onClick={onCloseMobile}
        className="w-full flex items-center p-1.5 px-2 rounded-xl select-none group"
        title="TradiFive"
      >
        <div className="relative h-[32px] sm:h-[36px] flex items-center select-none">
          <img
            src="/Tradifive_logo1.png"
            alt="TradiFive"
            className="h-[28px] sm:h-[32px] w-auto object-contain dark:hidden"
          />
          <img
            src="/Dark mode logo with white.png"
            alt="TradiFive"
            className="h-[28px] sm:h-[32px] w-auto object-contain hidden dark:block"
          />
        </div>
      </Link>
    </div>
  );
}
