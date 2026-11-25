import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  enableGlowSweep?: boolean;
}

/**
 * PageTransition provides an Apple / Linear / Stripe grade page entrance animation.
 * Features:
 * - Subtle upward lift (y: 16 -> 0)
 * - Micro-scale expansion (scale: 0.993 -> 1)
 * - Cinematic lens focus-in (blur: 4px -> 0px)
 * - Calibrated cubic-bezier easing ([0.16, 1, 0.3, 1])
 * - Luminous accent sweep line on page mount
 * - Automatic hardware acceleration & reduced-motion fallback
 * - Cleans up transforms on complete for pristine position:fixed / sticky behavior
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "w-full flex-1 flex flex-col min-h-0",
  enableGlowSweep = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [showSweep, setShowSweep] = useState(enableGlowSweep && !shouldReduceMotion);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enableGlowSweep || shouldReduceMotion) return;
    const timer = setTimeout(() => setShowSweep(false), 800);
    return () => clearTimeout(timer);
  }, [enableGlowSweep, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
        scale: 0.993,
        filter: "blur(4px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        y: -10,
        scale: 0.995,
      }}
      transition={{
        duration: 0.38,
        ease: [0.16, 1, 0.3, 1], // Custom Apple/Linear deceleration curve
      }}
      onAnimationComplete={() => setIsComplete(true)}
      style={{
        willChange: isComplete ? "auto" : "transform, opacity, filter",
        transform: isComplete ? "none" : undefined,
        filter: isComplete ? "none" : undefined,
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "subpixel-antialiased",
      }}
      className={`relative ${className}`}
    >
      {/* Dynamic top luminous sweep line on page mount */}
      {showSweep && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0.9 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent pointer-events-none z-50 origin-center"
        />
      )}
      {children}
    </motion.div>
  );
};

export default PageTransition;
