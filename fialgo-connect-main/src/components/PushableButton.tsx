import React, { ButtonHTMLAttributes } from 'react';

interface PushableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'deep-3d';
}

export const PushableButton: React.FC<PushableButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  if (variant === 'deep-3d') {
    return (
      <button className={`uiverse-pushable ${className || ''}`} {...props}>
        <span className="uiverse-shadow"></span>
        <span className="uiverse-edge"></span>
        <span className="uiverse-front">
          {children}
        </span>
      </button>
    );
  }

  if (variant === 'primary') {
    return (
      <button className={`btn-3d-mission ${className || ''}`} {...props}>
        <span className="btn-top">{children}</span>
        <span className="btn-bottom"></span>
        <span className="btn-base"></span>
      </button>
    );
  }

  return (
    <button 
      className={`bg-white dark:bg-[#1E1E1E] text-slate-700 border border-slate-200 dark:border-[#333333] rounded-xl px-6 py-3 font-bold hover:bg-slate-50 dark:bg-[#141414] transition-all ${className || ''}`} 
      {...props}
    >
      {children}
    </button>
  );
};

