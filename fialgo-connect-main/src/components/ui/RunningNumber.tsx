import React, { useEffect, useState, useRef } from "react";
import { animate } from "framer-motion";

export interface RunningNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
  animateOnMount?: boolean;
}

export function RunningNumber({
  value,
  prefix = "₹",
  suffix = "",
  className = "",
  duration = 0.7,
  decimals = 0,
  animateOnMount = true,
}: RunningNumberProps) {
  const [displayNumber, setDisplayNumber] = useState<number>(() => (animateOnMount ? 0 : value));
  const prevValueRef = useRef<number>(animateOnMount ? 0 : value);

  useEffect(() => {
    const fromVal = prevValueRef.current;
    prevValueRef.current = value;

    // Run animation smoothly from previous value to new value
    const controls = animate(fromVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Smooth snappy ease-out
      onUpdate: (latest) => {
        setDisplayNumber(latest);
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? displayNumber.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(displayNumber).toLocaleString("en-IN");

  return (
    <span className={`inline-block tabular-nums tracking-tight ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default RunningNumber;
