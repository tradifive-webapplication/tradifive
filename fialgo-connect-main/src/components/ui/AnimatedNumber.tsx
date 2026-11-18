import React, { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: (val: number) => string;
  className?: string;
}

/**
 * Smoothly rolls a numeric value from 0 -> target on mount/reload,
 * and from previous -> next whenever `value` updates (e.g. timeframe switch).
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 900,
  delay = 0,
  format = (v) => Math.round(v).toString(),
  className,
}) => {
  const safeTarget = Number.isFinite(value) ? value : 0;
  const [display, setDisplay] = useState<number>(0);
  const currentRef = useRef<number>(0);
  const isFirstRunRef = useRef<boolean>(true);

  useEffect(() => {
    const startVal = isFirstRunRef.current ? 0 : currentRef.current;
    const initialDelay = isFirstRunRef.current ? delay : 0;
    isFirstRunRef.current = false;

    if (startVal === safeTarget) {
      setDisplay(safeTarget);
      currentRef.current = safeTarget;
      return;
    }

    let rafId = 0;
    let timeoutId = 0;

    const run = () => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Expo ease-out for crisp, Apple-like deceleration
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const next = startVal + (safeTarget - startVal) * eased;
        currentRef.current = next;
        setDisplay(next);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          currentRef.current = safeTarget;
          setDisplay(safeTarget);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    if (initialDelay > 0) {
      timeoutId = window.setTimeout(run, initialDelay);
    } else {
      run();
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [safeTarget, duration, delay]);

  return <span className={className}>{format(display)}</span>;
};

export default AnimatedNumber;
