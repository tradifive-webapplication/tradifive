import React, { ButtonHTMLAttributes } from 'react';

interface PurpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const PurpleButton: React.FC<PurpleButtonProps> = ({ text, className, ...props }) => {
  return (
    <button className={`purple-btn ${className || ''}`} {...props}>
      <div className="purple-btn-bg"></div>
      <div className="purple-btn-wrap">
        <div className="purple-btn-outline"></div>
        <div className="purple-btn-content">
          <span className="purple-btn-char state-1 words">
            {text.split('').map((char, index) => (
              <span 
                key={index} 
                data-label={char === ' ' ? '\u00A0' : char} 
                style={{ "--i": index + 1, marginLeft: char === ' ' ? '4px' : '0' } as React.CSSProperties}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
          <div className="purple-btn-icon">
            <div></div>
          </div>
        </div>
      </div>
    </button>
  );
};
