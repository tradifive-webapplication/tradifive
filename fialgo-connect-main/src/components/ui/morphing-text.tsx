"use client";

import React, { useCallback, useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface MorphingTextProps {
  className?: string;
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  align?: "left" | "center" | "right";
  maxBlur?: number;
}

const useMorphingText = (
  texts: string[],
  morphTime = 1.5,
  cooldownTime = 0.8,
  maxBlur = 4
) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  // Initialize text content on mount/update so there's never a blank flash
  useEffect(() => {
    if (text1Ref.current && texts.length > 0) {
      text1Ref.current.textContent = texts[0];
      text1Ref.current.style.opacity = "100%";
      text1Ref.current.style.filter = "none";
    }
    if (text2Ref.current && texts.length > 1) {
      text2Ref.current.textContent = texts[1];
      text2Ref.current.style.opacity = "0%";
      text2Ref.current.style.filter = "none";
    }
  }, [texts]);

  const setStyles = useCallback(
    (fraction: number) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;
      if (!current1 || !current2 || texts.length === 0) return;

      const blurAmount1 = Math.min(
        maxBlur / Math.max(0.01, 1 - fraction) - maxBlur,
        maxBlur * 2.5
      );
      const blurAmount2 = Math.min(
        maxBlur / Math.max(0.01, fraction) - maxBlur,
        maxBlur * 2.5
      );

      current2.style.filter = `blur(${blurAmount2}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      current1.style.filter = `blur(${blurAmount1}px)`;
      current1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts, maxBlur]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles, morphTime, cooldownTime]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const current1 = text1Ref.current;
    const current2 = text2Ref.current;
    if (current1 && current2 && texts.length > 0) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, [texts.length]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

interface TextsProps {
  texts: string[];
  align?: "left" | "center" | "right";
  morphTime?: number;
  cooldownTime?: number;
  maxBlur?: number;
}

const Texts: React.FC<TextsProps> = ({
  texts,
  align = "center",
  morphTime,
  cooldownTime,
  maxBlur,
}) => {
  const { text1Ref, text2Ref } = useMorphingText(
    texts,
    morphTime,
    cooldownTime,
    maxBlur
  );

  const alignClass =
    align === "left"
      ? "text-left left-0"
      : align === "right"
      ? "text-right right-0"
      : "text-center inset-x-0 m-auto";

  return (
    <>
      <span
        className={cn(
          "absolute top-0 inline-block w-full whitespace-nowrap select-none transition-[filter,opacity] tracking-tight",
          alignClass
        )}
        ref={text1Ref}
      />
      <span
        className={cn(
          "absolute top-0 inline-block w-full whitespace-nowrap select-none transition-[filter,opacity] tracking-tight",
          alignClass
        )}
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC<{ filterId: string }> = ({ filterId }) => (
  <svg
    id="morphing-filters"
    className="absolute pointer-events-none w-0 h-0 overflow-hidden"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", width: 0, height: 0 }}
  >
    <defs>
      <filter id={filterId} colorInterpolationFilters="sRGB">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  morphTime = 1.5,
  cooldownTime = 0.8,
  align = "center",
  maxBlur = 4,
}) => {
  const uniqueId = useId().replace(/:/g, "_");
  const filterId = `morph-threshold-${uniqueId}`;

  return (
    <div
      className={cn(
        "relative inline-block w-full overflow-visible font-sans leading-none",
        className
      )}
      style={{
        filter: `url(#${filterId}) blur(0.4px)`,
      }}
    >
      <Texts
        texts={texts}
        align={align}
        morphTime={morphTime}
        cooldownTime={cooldownTime}
        maxBlur={maxBlur}
      />
      <SvgFilters filterId={filterId} />
    </div>
  );
};

export default MorphingText;
