import React, { useState, useEffect } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";

export type CursorStyleType = "3d" | "dot" | "system";

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<CursorStyleType>(() => {
    if (typeof window === "undefined") return "3d";
    return (localStorage.getItem("tradifive_cursor_style") as CursorStyleType) || "3d";
  });
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  // Instant coordinates for the pointer tip (no lag)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    if (!isFinePointer) return;

    setIsEnabled(true);

    const applyCursorClasses = (style: CursorStyleType) => {
      if (style === "system") {
        document.documentElement.classList.remove("custom-cursor-active");
        document.documentElement.classList.add("cursor-style-system");
      } else {
        document.documentElement.classList.add("custom-cursor-active");
        document.documentElement.classList.remove("cursor-style-system");
      }
    };

    applyCursorClasses(cursorStyle);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      // Create luxury tactile click circle
      const newRipple: ClickRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 500);
    };

    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, [role="button"], input[type="submit"], input[type="button"], select, .cursor-pointer, [data-cursor="pointer"], [onClick]'
      );
      const textInput = target.closest(
        'input[type="text"], input[type="password"], input[type="email"], input[type="search"], input[type="number"], textarea, [contenteditable="true"]'
      );

      setIsHovered(!!interactive && !textInput);
      setIsText(!!textInput);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleCursorChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as CursorStyleType;
      if (detail) {
        setCursorStyle(detail);
        applyCursorClasses(detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tradifive_cursor_style" && e.newValue) {
        const style = e.newValue as CursorStyleType;
        setCursorStyle(style);
        applyCursorClasses(style);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("tradifive_cursor_change", handleCursorChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      document.documentElement.classList.remove("cursor-style-system");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("tradifive_cursor_change", handleCursorChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [cursorX, cursorY, isVisible, cursorStyle]);

  if (!isEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999999] overflow-hidden select-none">
      {/* ── Luxury Expanding Click Circles (Refined & Compact) ── */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0.25, opacity: 0.9 }}
            animate={{ scale: 1.35, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: ripple.x,
              top: ripple.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="fixed pointer-events-none select-none z-[9999998]"
          >
            <div className="relative w-5 h-5 rounded-full flex items-center justify-center">
              {/* Outer refined ring */}
              <div className="absolute inset-0 rounded-full border border-slate-900/40 dark:border-white/60 shadow-[0_0_6px_rgba(15,23,42,0.12)] dark:shadow-[0_0_8px_rgba(255,255,255,0.22)]" />
              {/* Inner subtle luminescent core */}
              <div className="w-2 h-2 rounded-full bg-slate-900/[0.1] dark:bg-white/[0.16] blur-[0.5px]" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── 3D Sleek Glossy Arrow Mode ── */}
      {cursorStyle === "3d" && (
        <motion.div
          style={{
            x: cursorX,
            y: cursorY,
            translateX: "-1px",
            translateY: "-1px",
            transformOrigin: "1px 1px",
          }}
          animate={{
            scale: isText ? 0 : isClicking ? (isHovered ? 1.04 : 0.97) : isHovered ? 1.08 : 1,
            rotate: isClicking ? -1.5 : isHovered ? -1 : 0,
            opacity: isVisible && !isText ? 1 : 0,
          }}
          transition={{
            scale: { type: "spring", stiffness: 650, damping: 30 },
            rotate: { type: "spring", stiffness: 650, damping: 30 },
            opacity: { duration: 0.12 },
          }}
          className="fixed left-0 top-0 pointer-events-none select-none"
        >
          {/* Subtle interactive hover bloom */}
          {isHovered && (
            <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-blue-500/15 dark:bg-white/15 blur-md pointer-events-none -z-10" />
          )}

          {/* 3D Glossy Beveled Arrow with refined, lighter drop shadow */}
          <img
            src="/custom-cursor.png"
            alt=""
            width={26}
            height={26}
            className="w-[26px] h-[26px] object-contain drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.18)] select-none pointer-events-none"
            draggable={false}
          />
        </motion.div>
      )}

      {/* ── Minimal Precision Dot Mode ── */}
      {cursorStyle === "dot" && (
        <motion.div
          style={{
            x: cursorX,
            y: cursorY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            scale: isText ? 0 : isClicking ? (isHovered ? 1.15 : 0.96) : isHovered ? 1.25 : 1,
            opacity: isVisible && !isText ? 1 : 0,
          }}
          transition={{
            scale: { type: "spring", stiffness: 650, damping: 30 },
            opacity: { duration: 0.12 },
          }}
          className="fixed left-0 top-0 pointer-events-none select-none flex items-center justify-center"
        >
          {/* Outer halo on hover */}
          {isHovered && (
            <div className="absolute w-8 h-8 rounded-full bg-blue-500/20 dark:bg-white/20 blur-sm pointer-events-none" />
          )}
          <div
            className={`w-3 h-3 rounded-full transition-all duration-150 ${
              isHovered
                ? "bg-blue-600 dark:bg-white ring-4 ring-blue-500/25 scale-125"
                : "bg-slate-900 dark:bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
            }`}
          />
        </motion.div>
      )}
    </div>
  );
}

export default CustomCursor;
