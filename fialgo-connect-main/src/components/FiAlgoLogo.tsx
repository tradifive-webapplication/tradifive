import React from "react";

interface FiAlgoLogoProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
}

export default function FiAlgoLogo({ className = "", variant = "auto" }: FiAlgoLogoProps) {
  const algoColorClass =
    variant === "light"
      ? "text-neutral-900"
      : variant === "dark"
      ? "text-white"
      : "text-neutral-900 dark:text-white";

  return (
    <div className={`flex items-center select-none font-bold tracking-tight leading-none ${className}`}>
      <span className="font-extrabold text-[24px] sm:text-[27px] tracking-[-0.035em] leading-none text-[#A855F7]">
        fi
      </span>
      <span className={`font-extrabold text-[24px] sm:text-[27px] tracking-[-0.035em] leading-none transition-colors ${algoColorClass}`}>
        algo
      </span>
    </div>
  );
}
