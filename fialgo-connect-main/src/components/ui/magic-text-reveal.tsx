'use client';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

interface StardustParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  size: number;
  alpha: number;
  targetAlpha: number;
  sparkleSpeed: number;
  floatingSpeed: number;
  floatingAngle: number;
  floatRadius: number;
  isStar: boolean;
}

interface Particle {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  opacity: number;
  originalAlpha: number;
  velocityX: number;
  velocityY: number;
  angle: number;
  speed: number;
  floatingOffsetX: number;
  floatingOffsetY: number;
  floatingSpeed: number;
  floatingAngle: number;
  targetOpacity: number;
  sparkleSpeed: number;
}

export interface MagicTextRevealProps {
  text?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  spread?: number;
  speed?: number;
  density?: number;
  resetOnMouseLeave?: boolean;
  className?: string;
  style?: React.CSSProperties;
  align?: 'left' | 'center';
  isHovered?: boolean;
}

export const MagicTextReveal: React.FC<MagicTextRevealProps> = ({
  text = "Magic Text",
  color,
  fontSize = 70,
  fontFamily = "Plus Jakarta Sans, sans-serif",
  fontWeight = 600,
  spread,
  speed = 0.5,
  density = 4,
  resetOnMouseLeave = true,
  className = "",
  style = {},
  align,
  isHovered: externalHover
}) => {
  const isSmall = fontSize <= 28;
  const textAlign = align ?? (isSmall ? 'left' : 'center');
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Dynamic theme-aware color fallback
  const resolvedTextColor = useMemo(() => {
    if (color) return color;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "rgba(255, 255, 255, 0.98)";
    }
    return "rgba(15, 23, 42, 0.98)";
  }, [color]);

  const globalDpr = useMemo(() => {
    if (typeof window !== "undefined") {
      return Math.min(2.5, window.devicePixelRatio || 1);
    }
    return 1;
  }, []);

  // -------------------------------------------------------------
  // SMALL / COMPACT UI MODE: Crisp Vector Text + Luminous Stardust
  // -------------------------------------------------------------
  const stardustParticlesRef = useRef<StardustParticle[]>([]);

  // Large particle system refs
  const largeParticlesRef = useRef<Particle[]>([]);
  const [showLargeText, setShowLargeText] = useState(false);

  // Initialize stardust particles for compact mode
  const initStardust = useCallback((width: number, height: number) => {
    if (width <= 0 || height <= 0) return;

    const count = Math.min(32, Math.max(16, Math.round(width / 4.5)));
    const particles: StardustParticle[] = [];

    // Magic luminous color palette
    const colors = [
      'rgba(56, 189, 248, ',  // sky / cyan
      'rgba(96, 165, 250, ',  // royal blue
      'rgba(147, 197, 253, ', // bright ice blue
      'rgba(168, 85, 247, ',  // lavender purple
      'rgba(255, 255, 255, '  // pure diamond star
    ];

    for (let i = 0; i < count; i++) {
      // Distribute along text baseline and around text perimeter
      const baseX = Math.random() * width;
      const baseY = height * 0.5 + (Math.random() - 0.5) * height * 0.9;
      const isStar = Math.random() < 0.22;
      const initialAlpha = Math.random() * 0.6 + 0.3;

      particles.push({
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isStar ? (Math.random() * 0.6 + 1.2) : (Math.random() * 0.6 + 0.7),
        alpha: initialAlpha,
        targetAlpha: Math.random() * 0.7 + 0.25,
        sparkleSpeed: Math.random() * 2.2 + 1.2,
        floatingSpeed: Math.random() * 1.5 + 0.8,
        floatingAngle: Math.random() * Math.PI * 2,
        floatRadius: Math.random() * 4 + 2,
        isStar
      });
    }

    stardustParticlesRef.current = particles;
  }, []);

  // Update & Render Stardust Animation
  const animateStardust = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number,
    hovered: boolean
  ) => {
    ctx.clearRect(0, 0, width * globalDpr, height * globalDpr);
    ctx.save();
    ctx.scale(globalDpr, globalDpr);

    const particles = stardustParticlesRef.current;
    const time = Date.now() * 0.001;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Twinkle opacity oscillation
      const alphaDiff = p.targetAlpha - p.alpha;
      p.alpha += alphaDiff * p.sparkleSpeed * deltaTime * 2.5;
      if (Math.abs(alphaDiff) < 0.05) {
        p.targetAlpha = hovered ? (Math.random() * 0.5 + 0.5) : (Math.random() * 0.6 + 0.15);
        p.sparkleSpeed = Math.random() * 2.5 + 1.0;
      }

      // Orbital floating physics
      const speedMult = hovered ? 2.4 : 1.0;
      p.floatingAngle += deltaTime * p.floatingSpeed * speedMult;

      const currentRadius = hovered ? (p.floatRadius * 1.6) : p.floatRadius;
      const offsetX = Math.cos(p.floatingAngle + i) * currentRadius + Math.sin(time * 0.7 + i) * 1.5;
      const offsetY = Math.sin(p.floatingAngle * 1.3 + i) * currentRadius * 0.6;

      p.x = p.baseX + offsetX;
      p.y = p.baseY + offsetY;

      // Draw particle
      const renderAlpha = Math.max(0, Math.min(1, p.alpha));
      if (renderAlpha <= 0.02) continue;

      ctx.fillStyle = `${p.color}${renderAlpha})`;

      if (p.isStar && renderAlpha > 0.4) {
        // Draw 4-point micro star
        const s = p.size * 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + s * 0.25, p.y - s * 0.25);
        ctx.lineTo(p.x + s, p.y);
        ctx.lineTo(p.x + s * 0.25, p.y + s * 0.25);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - s * 0.25, p.y + s * 0.25);
        ctx.lineTo(p.x - s, p.y);
        ctx.lineTo(p.x - s * 0.25, p.y - s * 0.25);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw soft glowing stardust dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [globalDpr]);

  // -------------------------------------------------------------
  // LARGE TEXT MODE: Classical Particle Dissolve & Assemble
  // -------------------------------------------------------------
  const createLargeParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    textX: number,
    textY: number,
    font: string,
    colorStr: string
  ): Particle[] => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colorStr;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";

    ctx.fillText(text, textX, textY);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const sampleRate = Math.max(3, Math.round(globalDpr * 2));
    const particles: Particle[] = [];

    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    for (let y = 0; y < canvas.height; y += sampleRate) {
      for (let x = 0; x < canvas.width; x += sampleRate) {
        const idx = (y * canvas.width + x) * 4;
        if (data[idx + 3] > 30) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const spreadRadius = (spread !== undefined ? spread : 40) * globalDpr;

    for (let y = 0; y < canvas.height; y += sampleRate) {
      for (let x = 0; x < canvas.width; x += sampleRate) {
        const idx = (y * canvas.width + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 40) {
          const originalAlpha = alpha / 255;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * spreadRadius;

          particles.push({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            originalX: x,
            originalY: y,
            color: `rgba(${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]}, `,
            opacity: originalAlpha * 0.4,
            originalAlpha,
            velocityX: 0,
            velocityY: 0,
            angle: Math.random() * Math.PI * 2,
            speed: 0,
            floatingOffsetX: 0,
            floatingOffsetY: 0,
            floatingSpeed: Math.random() * 2 + 1,
            floatingAngle: Math.random() * Math.PI * 2,
            targetOpacity: Math.random() * originalAlpha * 0.6,
            sparkleSpeed: Math.random() * 2 + 1
          });
        }
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return particles;
  }, [globalDpr, textAlign, spread]);

  // Main animation loop
  useEffect(() => {
    let active = true;

    const loop = (currentTime: number) => {
      if (!active) return;
      const deltaTime = Math.min(0.1, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (canvas && ctx) {
        if (isSmall) {
          const rect = wrapperRef.current?.getBoundingClientRect();
          const w = rect?.width || 120;
          const h = rect?.height || 24;

          if (stardustParticlesRef.current.length === 0) {
            initStardust(w, h);
          }

          animateStardust(ctx, w, h, deltaTime, isHovered);
        } else {
          // Large particle animation
          const particles = largeParticlesRef.current;
          if (particles.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(globalDpr, globalDpr);

            const RETURN_SPEED = 4.5;
            const FLOAT_RADIUS = (spread ?? 40);

            particles.forEach(p => {
              if (isHovered) {
                const dx = p.originalX - p.x;
                const dy = p.originalY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0.2) {
                  p.x += (dx / dist) * RETURN_SPEED * deltaTime * 60;
                  p.y += (dy / dist) * RETURN_SPEED * deltaTime * 60;
                } else {
                  p.x = p.originalX;
                  p.y = p.originalY;
                }
                p.opacity = Math.max(0, p.opacity - 12 * deltaTime);
              } else {
                p.floatingAngle += deltaTime * p.floatingSpeed;
                p.x = p.originalX + Math.cos(p.floatingAngle) * FLOAT_RADIUS * 0.4;
                p.y = p.originalY + Math.sin(p.floatingAngle * 1.2) * FLOAT_RADIUS * 0.4;
                p.opacity = p.targetOpacity;
              }

              if (p.opacity > 0.02) {
                ctx.fillStyle = `${p.color}${p.opacity})`;
                ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1.2, 1.2);
              }
            });

            ctx.restore();

            if (isHovered && !showLargeText) setShowLargeText(true);
            if (!isHovered && showLargeText) setShowLargeText(false);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSmall, isHovered, showLargeText, globalDpr, spread, initStardust, animateStardust]);

  // Canvas size synchronization
  const updateCanvasSize = useCallback(() => {
    if (!wrapperRef.current || !canvasRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const w = Math.max(rect.width, 40);
    const h = Math.max(rect.height, 20);

    const canvas = canvasRef.current;
    canvas.width = w * globalDpr;
    canvas.height = h * globalDpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    if (isSmall) {
      initStardust(w, h);
    } else {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const textX = textAlign === "left" ? 10 * globalDpr : canvas.width / 2;
        const textY = canvas.height / 2;
        const font = `${fontWeight} ${fontSize * globalDpr}px ${fontFamily}`;
        largeParticlesRef.current = createLargeParticles(ctx, canvas, text, textX, textY, font, resolvedTextColor);
      }
    }
  }, [isSmall, globalDpr, textAlign, fontWeight, fontSize, fontFamily, text, resolvedTextColor, initStardust, createLargeParticles]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Handlers
  const handleMouseEnter = useCallback(() => {
    setInternalHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (resetOnMouseLeave) {
      setInternalHover(false);
    }
  }, [resetOnMouseLeave]);

  // Automatically sync with parent card hover if inside a card
  useEffect(() => {
    if (!wrapperRef.current) return;
    const parentCard = wrapperRef.current.closest('.backdrop-blur-md') || wrapperRef.current.closest('[data-locked-overlay]');
    if (!parentCard) return;

    const onEnter = () => setInternalHover(true);
    const onLeave = () => {
      if (resetOnMouseLeave) setInternalHover(false);
    };

    parentCard.addEventListener('mouseenter', onEnter);
    parentCard.addEventListener('mouseleave', onLeave);
    return () => {
      parentCard.removeEventListener('mouseenter', onEnter);
      parentCard.removeEventListener('mouseleave', onLeave);
    };
  }, [resetOnMouseLeave]);

  // -------------------------------------------------------------
  // RENDER COMPACT MODE (Lock Cards & UI Titles)
  // -------------------------------------------------------------
  if (isSmall) {
    return (
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative inline-flex items-center min-w-0 select-none group cursor-pointer ${className}`}
        style={{
          ...style
        }}
      >
        {/* Crisp vector text with subtle magical shimmer on hover */}
        <span
          ref={textRef}
          className={`relative z-10 font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
            isHovered ? 'text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.35)]' : ''
          }`}
          style={{
            color: isHovered ? undefined : resolvedTextColor,
            fontFamily,
            fontWeight,
            fontSize: `${fontSize}px`,
            lineHeight: 1.2
          }}
        >
          {text}
        </span>

        {/* Delicate floating stardust sparkles overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-20 overflow-visible"
          style={{
            transform: 'scale(1.25)',
            transformOrigin: textAlign === 'left' ? 'left center' : 'center center'
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER LARGE MODE (Hero & Feature Banners)
  // -------------------------------------------------------------
  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center ${textAlign === 'left' ? 'justify-start' : 'justify-center'} select-none cursor-pointer overflow-visible ${className}`}
      style={{
        backgroundColor: style.backgroundColor ?? 'transparent',
        ...style
      }}
    >
      <div
        className={`transition-all duration-300 pointer-events-none ${
          isHovered || showLargeText ? 'opacity-100 scale-[1.01]' : 'opacity-0'
        }`}
        style={{
          color: resolvedTextColor,
          fontFamily,
          fontWeight,
          fontSize: `${fontSize}px`,
          whiteSpace: 'nowrap',
          textAlign
        }}
      >
        {text}
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />
    </div>
  );
};

export default MagicTextReveal;
