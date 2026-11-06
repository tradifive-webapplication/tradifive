import React, { ButtonHTMLAttributes } from 'react';

interface PushableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'deep-3d';
}

export const PushableButton: React.FC<PushableButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  if (variant === 'secondary') {
    return (
      <button 
        className={`bg-slate-100 dark:bg-[#2B2B2B] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-800 dark:text-white border border-slate-200 dark:border-[#383838] rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-150 active:scale-[0.985] inline-flex items-center justify-center gap-2 cursor-pointer outline-none ${className}`} 
        {...props}
      >
        {children}
      </button>
    );
  }

  // High-contrast clean blue primary action for web user app with tactile micro-scale
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-500 text-white shadow-[0_2px_8px_-2px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-blue-500 rounded-full px-6 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 active:scale-[0.985] inline-flex items-center justify-center gap-2 cursor-pointer outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
