import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface SystemAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number;
  onLearnMore?: () => void;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({
  isOpen,
  onClose,
  title = "General information",
  message = "Something you might like to know.",
  duration = 10,
  onLearnMore
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      return;
    }

    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onClose, duration]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-10 left-0 right-0 z-[300] w-full flex flex-col items-center justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="w-full max-w-2xl pointer-events-auto flex flex-col items-center"
          >
            {/* Bright Liquid Blue Glass Card */}
            <div className="bg-blue-50/20 backdrop-blur-2xl rounded-[24px] shadow-[0_10px_40px_rgba(59,130,246,0.08)] border border-blue-200/40 w-full p-1 relative overflow-hidden group">
              {/* Internal Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-100/10 to-transparent pointer-events-none" />
              
              <div className="bg-white/40 backdrop-blur-md rounded-[20px] px-6 py-2.5 flex items-center justify-between gap-4 relative z-10 border border-white/40">
                <div className="flex items-center gap-5">
                  {/* Themed Icon */}
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <AlertCircle size={18} />
                  </div>
                  
                  <div className="flex flex-col">
                    <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                      {title}
                    </h4>
                    <p className="text-[13px] text-slate-600 font-medium leading-none opacity-80">
                      {message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Styled Buttons */}
                  <button 
                    onClick={onClose}
                    className="px-5 py-2 bg-white hover:bg-blue-700 rounded-xl text-[12px] font-bold text-white transition-all active:scale-[0.97] shadow-lg shadow-blue-500/20"
                  >
                    Accept
                  </button>

                  {onLearnMore && (
                    <button 
                      onClick={onLearnMore}
                      className="px-5 py-2 bg-white/60 hover:bg-white dark:bg-[#1E1E1E] border border-blue-100/50 rounded-xl text-[12px] font-bold text-slate-700 transition-all active:scale-[0.97]"
                    >
                      Learn more
                    </button>
                  )}
                  
                  {/* Subtle Close */}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/60 transition-all active:scale-[0.97]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Brighter Timer Text */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-[11px] font-bold text-white/50 tracking-[0.15em] uppercase"
            >
              Auto-Close Sequence <span className="text-white tabular-nums">{timeLeft}s</span>
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};





