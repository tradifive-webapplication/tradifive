import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  enableGlowSweep?: boolean;
}

/**
 * PageTransition provides a crisp, fast Linear/Stripe-style page entrance.
 * - Clean subtle upward settle (y: 8 -> 0) with opacity fade (0 -> 1)
 * - Fast 180ms timing with sharp deceleration ([0.22, 1, 0.36, 1])
 * - No scale-from-backside or blur effects
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "w-full flex-1 flex flex-col min-h-0",
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
