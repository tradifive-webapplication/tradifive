import React, { ButtonHTMLAttributes } from 'react';

interface PushableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'deep-3d';
}

export const PushableButton: React.FC<PushableButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  if (variant === 'secondary') {
    return (
      <button 
        className={`tactile-white-pill rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer outline-none ${className}`} 
        {...props}
      >
        {children}
      </button>
    );
  }

  // High-contrast clean blue primary action for web user app with tactile bevel
  return (
    <button
      className={`tactile-blue-pill rounded-full px-6 py-2.5 text-xs font-bold tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer outline-none disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
