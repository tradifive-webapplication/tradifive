import React from 'react';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ checked, onChange, id }) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId.replace(/:/g, '');

  return (
    <div className="animated-checkbox-wrapper">
      <style>{`
        .animated-checkbox-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .animated-checkbox-wrapper input[type="checkbox"] {
          display: none;
        }
        .animated-checkbox-wrapper .check {
          cursor: pointer;
          position: relative;
          margin: auto;
          width: 18px;
          height: 18px;
          -webkit-tap-highlight-color: transparent;
          transform: translate3d(0, 0, 0);
          display: inline-block;
        }
        .animated-checkbox-wrapper .check:before {
          content: "";
          position: absolute;
          top: -15px;
          left: -15px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.05);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .animated-checkbox-wrapper .check svg {
          position: relative;
          z-index: 1;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke: #c8ccd4;
          stroke-width: 1.5;
          transform: translate3d(0, 0, 0);
          transition: all 0.2s ease;
        }
        .dark .animated-checkbox-wrapper .check svg {
           stroke: #555;
        }
        .animated-checkbox-wrapper .check svg path {
          stroke-dasharray: 60;
          stroke-dashoffset: 0;
        }
        .animated-checkbox-wrapper .check svg polyline {
          stroke-dasharray: 22;
          stroke-dashoffset: 66;
        }
        .animated-checkbox-wrapper .check:hover:before {
          opacity: 1;
        }
        .animated-checkbox-wrapper .check:hover svg {
          stroke: #4285f4;
        }
        .dark .animated-checkbox-wrapper .check:hover svg {
          stroke: #6b9cfa;
        }
        .animated-checkbox-wrapper input[type="checkbox"]:checked + .check svg {
          stroke: #4285f4;
        }
        .animated-checkbox-wrapper input[type="checkbox"]:checked + .check svg path {
          stroke-dashoffset: 60;
          transition: all 0.3s linear;
        }
        .animated-checkbox-wrapper input[type="checkbox"]:checked + .check svg polyline {
          stroke-dashoffset: 42;
          transition: all 0.2s linear;
          transition-delay: 0.15s;
        }
      `}</style>
      <input 
        type="checkbox" 
        id={checkboxId} 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <label htmlFor={checkboxId} className="check">
        <svg width="18px" height="18px" viewBox="0 0 18 18">
          <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
          <polyline points="1 9 7 14 15 4"></polyline>
        </svg>
      </label>
    </div>
  );
};
