'use client'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    // Keep track of character IDs so existing characters don't re-mount animation
    const charItemsRef = useRef<CharItem[]>([]);

    // Sync character array with current string value
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

    // Split chars before and after caret
    const safeCursorIndex = Math.min(Math.max(0, cursorIndex), chars.length);
    const charsBefore = chars.slice(0, safeCursorIndex);
    const charsAfter = chars.slice(safeCursorIndex);

    // Color resolution for cursor
    const resolvedCursorBg =
      cursorColor === "blue"
        ? "bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.45)]"
        : cursorColor;

    return (
      <div className={cn("relative inline-flex w-full items-center", containerClassName)}>
        {/* Real hidden-text input that captures native interactions */}
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
          className={cn(
            "w-full bg-transparent text-transparent placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed",
            // Make native caret completely transparent so custom animated caret renders in its place
            "caret-transparent selection:bg-blue-500/20 selection:text-transparent",
            className
          )}
          {...props}
        />

        {/* Visual Overlay: Character-by-character spring animation and animated blue line caret */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center overflow-x-hidden whitespace-nowrap",
            className
          )}
          style={{
            // Reset borders, background, box-shadow so overlay matches exactly without double borders
            background: "transparent",
            borderColor: "transparent",
            boxShadow: "none",
          }}
        >
          {rawValue.length > 0 ? (
            <div className="inline-flex items-center whitespace-pre leading-none text-slate-900 dark:text-white">
              {/* Characters before cursor with spring animation */}
              <AnimatePresence mode="popLayout" initial={false}>
                {charsBefore.map((item) => (
                  <motion.span
                    key={item.id}
                    initial={
                      textAnimation === "spring"
                        ? { opacity: 0, scale: 0.5, y: -4 }
                        : { opacity: 0 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 24,
                      mass: 0.45,
                    }}
                    className="inline-block whitespace-pre"
                  >
                    {item.char}
                  </motion.span>
                ))}
              </AnimatePresence>

              {/* Custom Blue Line Caret */}
              {isFocused && (
                <motion.span
                  className={cn("inline-block shrink-0", resolvedCursorBg)}
                  style={{
                    width: `${caretWidth}px`,
                    borderRadius: `${cursorRadius}px`,
                    height: cursorStyle === "underline" ? "2px" : "1.25em",
                    alignSelf: cursorStyle === "underline" ? "flex-end" : "center",
                    marginLeft: charsBefore.length === 0 ? "0px" : "-0.5px",
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
              )}

              {/* Characters after cursor */}
              {charsAfter.map((item) => (
                <span key={item.id} className="inline-block whitespace-pre">
                  {item.char}
                </span>
              ))}
            </div>
          ) : (
            // When input is empty, show blinking caret if focused
            isFocused && (
              <motion.span
                className={cn("inline-block shrink-0", resolvedCursorBg)}
                style={{
                  width: `${caretWidth}px`,
                  borderRadius: `${cursorRadius}px`,
                  height: cursorStyle === "underline" ? "2px" : "1.25em",
                  alignSelf: cursorStyle === "underline" ? "flex-end" : "center",
                }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{
                  duration: (blinkSpeed * 2) / 1000,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )
          )}
        </div>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

export default AnimatedInput;
