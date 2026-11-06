import React, { ButtonHTMLAttributes } from 'react';

interface PushableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'deep-3d';
}

export const PushableButton: React.FC<PushableButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  if (variant === 'secondary') {
    return (
      <button 
        className={`bg-[#171717] hover:bg-[#222222] text-white/90 hover:text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.2)] rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-150 active:scale-[0.985] inline-flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${className}`} 
        {...props}
      >
        {children}
      </button>
    );
  }

  // Exact button styling with subtle micro-scale press (scale 0.985, no sinking)
  return (
    <button
      className={`bg-gradient-to-r from-[#1e293b] to-[#0f172a] hover:from-[#253347] hover:to-[#131c33] text-[#60a5fa] hover:text-[#93c5fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)] rounded-full px-6 py-3 text-xs font-bold tracking-wide transition-all duration-150 active:scale-[0.985] inline-flex items-center justify-center gap-2 cursor-pointer outline-none border-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
