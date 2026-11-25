'use client'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  textAnimation?: "spring" | "none";
  cursorStyle?: "line" | "block" | "underline";
  cursorColor?: string;
  caretWidth?: number;
  cursorRadius?: number;
  blinkSpeed?: number;
  containerClassName?: string;
}

interface CharItem {
  id: string;
  char: string;
}

// Strip text-color classes from the native hidden input so tailwind-merge NEVER overrides transparency
function stripTextColor(className?: string): string {
  if (!className) return "";
  return className
    .split(/\s+/)
    .filter((cls) => {
      // Check if it's a text-color class (e.g., text-white, text-black, text-slate-900, text-zinc-400)
      if (cls.startsWith("text-") || cls.startsWith("dark:text-")) {
        const raw = cls.replace(/^dark:/, "");
        const rest = raw.slice(5);
        // Preserve font sizes, alignments, wrapping
        if (
          [
            "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl",
            "left", "center", "right", "justify", "start", "end",
            "ellipsis", "clip", "wrap", "nowrap", "balance", "pretty"
          ].includes(rest) ||
          (rest.startsWith("[") && (rest.includes("px") || rest.includes("rem") || rest.includes("em")))
        ) {
          return true;
        }
        return false; // strip text color class from native hidden input
      }
      return true;
    })
    .join(" ");
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      className,
      containerClassName,
      type = "text",
      value: controlledValue,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onSelect,
      onScroll,
      placeholder,
      textAnimation = "spring",
      cursorStyle = "line",
      cursorColor = "blue",
      caretWidth = 2,
      cursorRadius = 2,
      blinkSpeed = 530,
      disabled,
      autoFocus,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

    const [uncontrolledValue, setUncontrolledValue] = useState<string>(
      defaultValue !== undefined ? String(defaultValue) : ""
    );
    const isControlled = controlledValue !== undefined;
    const rawValue = isControlled ? String(controlledValue ?? "") : uncontrolledValue;

    const [isFocused, setIsFocused] = useState(false);
    const [cursorIndex, setCursorIndex] = useState<number>(rawValue.length);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keep stable character IDs for animations
    const charItemsRef = useRef<CharItem[]>([]);

    const isPassword = type === "password";
    const chars: CharItem[] = [];
    for (let i = 0; i < rawValue.length; i++) {
      const displayChar = isPassword ? "•" : rawValue[i];
      const existing = charItemsRef.current[i];
      if (existing && existing.char === displayChar) {
        chars.push(existing);
      } else {
        chars.push({ id: `c-${i}-${Math.random().toString(36).slice(2, 7)}`, char: displayChar });
      }
    }
    charItemsRef.current = chars;

    // Sync overlay horizontal scroll with input scroll
    const syncScroll = useCallback(() => {
      if (inputRef.current && overlayRef.current) {
        overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
      }
    }, []);

    // Update cursor position from input element
    const updateCursorPosition = useCallback(() => {
      if (inputRef.current) {
        setCursorIndex(inputRef.current.selectionStart ?? rawValue.length);
        syncScroll();
      }
    }, [rawValue.length, syncScroll]);

    // Handle typing pulse (pause blinking while actively typing for clean UX)
    const triggerTypingPulse = () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 420);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledValue(e.target.value);
      }
      triggerTypingPulse();
      updateCursorPosition();
      setTimeout(syncScroll, 0);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      updateCursorPosition();
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setIsTyping(false);
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      triggerTypingPulse();
      setTimeout(() => {
        updateCursorPosition();
        syncScroll();
      }, 0);
      onKeyDown?.(e);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
      updateCursorPosition();
      onSelect?.(e);
    };

    const handleInputScroll = (e: React.UIEvent<HTMLInputElement>) => {
      syncScroll();
      onScroll?.(e);
    };

    // AutoFocus detection on mount
    useEffect(() => {
      if (inputRef.current && (autoFocus || document.activeElement === inputRef.current)) {
        setIsFocused(true);
        setCursorIndex(inputRef.current.selectionStart ?? rawValue.length);
      }
    }, [autoFocus, rawValue.length]);

    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, []);

    // Cursor position calculation
    const safeCursorIndex = Math.min(Math.max(0, cursorIndex), chars.length);

    // Color resolution for cursor
    const resolvedCursorBg =
      cursorColor === "blue"
        ? "bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.45)]"
        : cursorColor;

    // Caret element renderer
    const renderCaret = () => (
      <motion.span
        key="animated-caret"
        className={cn("inline-block shrink-0", resolvedCursorBg)}
        style={{
          width: `${caretWidth}px`,
          borderRadius: `${cursorRadius}px`,
          height: cursorStyle === "underline" ? "2px" : "1.25em",
          alignSelf: cursorStyle === "underline" ? "flex-end" : "center",
          marginLeft: "-0.5px",
          marginRight: "-0.5px",
        }}
        animate={isTyping ? { opacity: 1 } : { opacity: [1, 0, 1] }}
        transition={
          isTyping
            ? { duration: 0.05 }
            : {
                duration: (blinkSpeed * 2) / 1000,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
    );

    return (
      <div className={cn("relative inline-flex w-full items-center", containerClassName)}>
        {/* Real native input: 100% transparent text on all devices (mobile WebKit, Android, Desktop) */}
        <input
          ref={inputRef}
          type={type}
          value={rawValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onScroll={handleInputScroll}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            ...style,
            color: "transparent",
            WebkitTextFillColor: "transparent",
            caretColor: "transparent",
          }}
          className={cn(
            "w-full bg-transparent focus:outline-none disabled:cursor-not-allowed selection:bg-blue-500/20 selection:text-transparent",
            "!text-transparent !caret-transparent",
            stripTextColor(className)
          )}
          {...props}
        />

        {/* Visual Overlay: Renders characters with spring physics and the custom caret */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center overflow-x-hidden whitespace-nowrap",
            className
          )}
          style={{
            background: "transparent",
            borderColor: "transparent",
            boxShadow: "none",
          }}
        >
          {rawValue.length > 0 ? (
            <div className="inline-flex items-center whitespace-pre leading-normal">
              {chars.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === safeCursorIndex && isFocused && renderCaret()}
                  <motion.span
                    initial={
                      textAnimation === "spring"
                        ? { opacity: 0, scale: 0.6, y: -2 }
                        : { opacity: 0 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 520,
                      damping: 26,
                      mass: 0.35,
                    }}
                    className="inline-block whitespace-pre"
                  >
                    {item.char}
                  </motion.span>
                </React.Fragment>
              ))}
              {safeCursorIndex >= chars.length && isFocused && renderCaret()}
            </div>
          ) : (
            isFocused && renderCaret()
          )}
        </div>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

export default AnimatedInput;
