/**
 * chart-primitives.ts
 * Shared utilities for hand-written chart components (TrafficCard, etc.)
 */

import { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Easing                                                                     */
/* -------------------------------------------------------------------------- */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  clamp                                                                      */
/* -------------------------------------------------------------------------- */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* -------------------------------------------------------------------------- */
/*  cx – tiny classname joiner (no dependency on clsx)                        */
/* -------------------------------------------------------------------------- */
export function cx(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/*  Number formatter                                                            */
/* -------------------------------------------------------------------------- */
export function defaultFormat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* -------------------------------------------------------------------------- */
/*  Tailwind utility strings                                                   */
/* -------------------------------------------------------------------------- */
export const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";

export const muted = "text-neutral-400 dark:text-neutral-500";

export const ring =
  "ring-1 ring-black/[0.05] dark:ring-white/[0.06]";

/* -------------------------------------------------------------------------- */
/*  useElementWidth – measures a container's pixel width                       */
/* -------------------------------------------------------------------------- */
export function useElementWidth<T extends HTMLElement>(
  defaultWidth = 300
): [React.RefCallback<T>, number] {
  const [width, setWidth] = useState(defaultWidth);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
    if (!el) return;
    // Set immediately so first paint isn't wrong
    setWidth(el.getBoundingClientRect().width || defaultWidth);
    observer.current = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.current.observe(el);
  }, [defaultWidth]);

  return [ref, width];
}

/* -------------------------------------------------------------------------- */
/*  useDismissOutside – calls onDismiss when a click/pointer lands outside ref */
/* -------------------------------------------------------------------------- */
export function useDismissOutside(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void
): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    document.addEventListener("pointerdown", handler, { capture: true });
    return () => document.removeEventListener("pointerdown", handler, { capture: true });
  }, [enabled, onDismiss, ref]);
}
