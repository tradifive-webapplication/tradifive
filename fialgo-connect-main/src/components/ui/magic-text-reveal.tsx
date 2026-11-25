'use client'
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

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
  size: number;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const [internalHover, setInternalHover] = useState(false);
  const [showText, setShowText] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const [textDimensions, setTextDimensions] = useState({ width: 0, height: 0 });

  const isSmall = fontSize <= 26;
  const textAlign = align ?? (isSmall ? 'left' : 'center');
  const isHovered = externalHover !== undefined ? externalHover : internalHover;
  const effectiveSpread = spread !== undefined ? spread : (isSmall ? Math.max(5, Math.round(fontSize * 0.42)) : 40);

  // Dynamic theme-aware color fallback if not explicitly provided
  const resolvedColor = useMemo(() => {
    if (color) return color;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "rgba(255, 255, 255, 0.96)";
    }
    return "rgba(15, 23, 42, 0.96)";
  }, [color]);

  const transformedDensity = 6 - density;
  const globalDpr = useMemo(() => {
    if (typeof window !== "undefined") return window.devicePixelRatio * 1.5 || 1;
    return 1;
  }, []);

  // Measure text dimensions
  const measureText = useCallback((text: string, fontSize: number, fontWeight: number | string, fontFamily: string) => {
    if (typeof window === "undefined") return { width: 120, height: 24 };
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { width: 120, height: 24 };
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    
    return {
      width: Math.ceil(metrics.width + (isSmall ? 4 : fontSize * 0.5)),
      height: Math.ceil(fontSize * (isSmall ? 1.25 : 1.4))
    };
  }, [isSmall]);

  // Update text dimensions when text or font properties change
  useEffect(() => {
    const dimensions = measureText(text, fontSize, fontWeight, fontFamily);
    setTextDimensions(dimensions);
  }, [text, fontSize, fontWeight, fontFamily, measureText]);

  // Create particles from text
  const createParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    textX: number,
    textY: number,
    font: string,
    baseColor: string,
    transformedDensity: number
  ): Particle[] => {
    const particles: Particle[] = [];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set text properties
    ctx.fillStyle = baseColor;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    ctx.imageSmoothingEnabled = true;
    
    // Render text for sampling
    ctx.fillText(text, textX, textY);
    
    // Sample the rendered text
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate sampling rate based on DPR
    const parsedWidth = parseInt(canvas.style.width);
    const currentDPR = canvas.width / (parsedWidth || 1);
    const baseSampleRate = isSmall ? 1 : Math.max(2, Math.round(currentDPR));
    const sampleRate = Math.max(1, baseSampleRate * (isSmall ? 1 : transformedDensity));
    
    // Calculate text bounds
    let minX = canvas.width;
    let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;
    
    for (let y = 0; y < canvas.height; y += sampleRate) {
      for (let x = 0; x < canvas.width; x += sampleRate) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // Calculate spread area
    const textWidth = maxX - minX;
    const textHeight = maxY - minY;
    const spreadRadius = isSmall ? (effectiveSpread * globalDpr) : Math.max(textWidth, textHeight) * 0.1;

    // Magical accent palette for shimmering particles
    const magicAccents = [
      'rgba(59, 130, 246, ',   // bright blue
      'rgba(96, 165, 250, ',   // sky blue
      'rgba(147, 197, 253, ',  // light blue
      'rgba(139, 92, 246, ',   // violet
      'rgba(56, 189, 248, '    // cyan
    ];
    
    for (let y = 0; y < canvas.height; y += sampleRate) {
      for (let x = 0; x < canvas.width; x += sampleRate) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 25) {
          const originalAlpha = alpha / 255;
          
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * spreadRadius;
          const initialX = x + Math.cos(angle) * distance;
          const initialY = y + Math.sin(angle) * distance;

          const isMagicAccent = isSmall && Math.random() < 0.38;
          const colorPrefix = isMagicAccent 
            ? magicAccents[Math.floor(Math.random() * magicAccents.length)]
            : `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, `;
          
          const particle: Particle = {
            x: initialX,
            y: initialY,
            originalX: x,
            originalY: y,
            color: `${colorPrefix}${originalAlpha})`,
            opacity: originalAlpha * (isSmall ? 0.75 : 0.3),
            originalAlpha,
            velocityX: 0,
            velocityY: 0,
            angle: Math.random() * Math.PI * 2,
            speed: 0,
            floatingOffsetX: 0,
            floatingOffsetY: 0,
            floatingSpeed: Math.random() * 2 + 1,
            floatingAngle: Math.random() * Math.PI * 2,
            targetOpacity: Math.random() * originalAlpha * (isSmall ? 0.9 : 0.5),
            sparkleSpeed: Math.random() * 2.5 + 1.2,
            size: isSmall ? (Math.random() < 0.3 ? 1.6 : 1.2) : 1.0
          };
          particles.push(particle);
        }
      }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return particles;
  }, [isSmall, textAlign, effectiveSpread, globalDpr]);

  // Update particles animation
  const updateParticles = useCallback((
    particles: Particle[],
    deltaTime: number,
    isHovered: boolean,
    showText: boolean,
    setShowText: (show: boolean) => void,
    spread: number,
    speed: number
  ) => {
    const FLOAT_RADIUS = spread * globalDpr;
    const RETURN_SPEED = isSmall ? 6 : 3;
    const FLOAT_SPEED = speed;
    const TRANSITION_SPEED = 5 * FLOAT_SPEED;
    const NOISE_SCALE = 0.6;
    const CHAOS_FACTOR = 1.3;
    const FADE_SPEED = isSmall ? 7 : 13; 

    particles.forEach(particle => {
      if (isHovered) {
        const dx = particle.originalX - particle.x;
        const dy = particle.originalY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) {
          particle.x += (dx / distance) * RETURN_SPEED * deltaTime * 60;
          particle.y += (dy / distance) * RETURN_SPEED * deltaTime * 60;
        } else {
          particle.x = particle.originalX;
          particle.y = particle.originalY;
        }
        
        particle.opacity = Math.max(0, particle.opacity - FADE_SPEED * deltaTime);
      } else {
        particle.floatingAngle += deltaTime * particle.floatingSpeed * (1 + Math.random() * CHAOS_FACTOR);
        
        const time = Date.now() * 0.001;
        const uniqueOffset = particle.floatingSpeed * 2000;
        const noiseX = (
          Math.sin(time * particle.floatingSpeed + particle.floatingAngle) * 1.2 +
          Math.sin((time + uniqueOffset) * 0.5) * 0.8 +
          (Math.random() - 0.5) * CHAOS_FACTOR
        ) * NOISE_SCALE;
        const noiseY = (
          Math.cos(time * particle.floatingSpeed + particle.floatingAngle * 1.5) * 0.6 +
          Math.cos((time + uniqueOffset) * 0.5) * 0.4 +
          (Math.random() - 0.5) * CHAOS_FACTOR
        ) * NOISE_SCALE;
        
        const randomOffsetX = FLOAT_RADIUS * noiseX;
        const randomOffsetY = FLOAT_RADIUS * noiseY;
        const targetX = particle.originalX + randomOffsetX;
        const targetY = particle.originalY + randomOffsetY;
        
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        
        const distanceFromTarget = Math.sqrt(dx * dx + dy * dy);
        const jitterScale = Math.min(1, distanceFromTarget / (FLOAT_RADIUS * 1.5));
        const jitterX = (Math.random() - 0.5) * FLOAT_SPEED * jitterScale;
        const jitterY = (Math.random() - 0.5) * FLOAT_SPEED * jitterScale;
        
        particle.x += dx * TRANSITION_SPEED * deltaTime + jitterX;
        particle.y += dy * TRANSITION_SPEED * deltaTime + jitterY;
        
        const distanceFromOrigin = Math.sqrt(
          Math.pow(particle.x - particle.originalX, 2) + 
          Math.pow(particle.y - particle.originalY, 2)
        );
        if (distanceFromOrigin > FLOAT_RADIUS) {
          const angle = Math.atan2(particle.y - particle.originalY, particle.x - particle.originalX);
          const pullBack = (distanceFromOrigin - FLOAT_RADIUS) * 0.1;
          particle.x -= Math.cos(angle) * pullBack;
          particle.y -= Math.sin(angle) * pullBack;
        }
        
        const opacityDiff = particle.targetOpacity - particle.opacity;
        particle.opacity += opacityDiff * particle.sparkleSpeed * deltaTime * 3;
        
        if (Math.abs(opacityDiff) < 0.01) {
          particle.targetOpacity = Math.random() < 0.45 
            ? Math.random() * 0.2 * particle.originalAlpha
            : particle.originalAlpha * (isSmall ? 1.2 : 2.5);
          particle.sparkleSpeed = Math.random() * 3 + 1;
        }
      }
    });

    if (isHovered && !showText) {
      setShowText(true);
    }
    if (!isHovered && showText) {
      setShowText(false);
    }
  }, [isSmall, globalDpr]);

  // Render particles
  const renderParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    globalDpr: number
  ) => {
    ctx.save();
    ctx.scale(globalDpr, globalDpr);
    
    const particlesByColor = new Map<string, Array<{x: number, y: number, size: number}>>();
    
    particles.forEach(particle => {
      if (particle.opacity <= 0.02) return;
      const color = particle.color.replace(/[\d.]+\)$/, `${Math.min(1, particle.opacity)})`);
      if (!particlesByColor.has(color)) {
        particlesByColor.set(color, []);
      }
      particlesByColor.get(color)!.push({
        x: particle.x / globalDpr,
        y: particle.y / globalDpr,
        size: particle.size
      });
    });
    
    particlesByColor.forEach((positions, color) => {
      ctx.fillStyle = color;
      positions.forEach(({ x, y, size }) => {
        if (isSmall) {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });
    
    ctx.restore();
  }, [isSmall]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    if (!wrapperRef.current || !canvasRef.current || !wrapperSize.width || !wrapperSize.height) return;
    
    const canvas = canvasRef.current;
    const { width, height } = wrapperSize;
    
    canvas.width = width * globalDpr;
    canvas.height = height * globalDpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const textX = textAlign === "left" 
      ? (isSmall ? 2 * globalDpr : 10 * globalDpr) 
      : canvas.width / 2;
    const textY = canvas.height / 2;
    
    const font = `${fontWeight} ${fontSize * globalDpr}px ${fontFamily}`;
    const particles = createParticles(ctx, canvas, text, textX, textY, font, resolvedColor, transformedDensity);
    
    particlesRef.current = particles;
    renderParticles(ctx, particles, globalDpr);
  }, [wrapperSize, globalDpr, textAlign, isSmall, text, fontSize, fontFamily, fontWeight, resolvedColor, transformedDensity, createParticles, renderParticles]);

  // Animation loop
  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      
      if (!canvas || !ctx || !particlesRef.current.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateParticles(
        particlesRef.current,
        deltaTime,
        isHovered,
        showText,
        setShowText,
        effectiveSpread,
        speed
      );
      
      renderParticles(ctx, particlesRef.current, globalDpr);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, showText, effectiveSpread, speed, globalDpr, updateParticles, renderParticles]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && textDimensions.width && textDimensions.height) {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const basePadding = isSmall ? 2 : (isMobile ? Math.max(fontSize * 0.3, 20) : Math.max(fontSize * 0.5, 40));
        
        const minWidth = isSmall ? (textDimensions.width + basePadding * 2) : Math.max(textDimensions.width + basePadding * 2, isMobile ? 120 : 200);
        const minHeight = isSmall ? (textDimensions.height + basePadding * 2) : Math.max(textDimensions.height + basePadding * 2, isMobile ? 60 : 100);
        
        const parentRect = wrapperRef.current.parentElement?.getBoundingClientRect();
        const viewportMargin = isMobile ? 0.95 : 0.9;
        const maxWidth = parentRect && parentRect.width > 0 ? parentRect.width * viewportMargin : (typeof window !== "undefined" ? window.innerWidth * viewportMargin : 500);
        const maxHeight = parentRect && parentRect.height > 0 ? parentRect.height * viewportMargin : (typeof window !== "undefined" ? window.innerHeight * viewportMargin : 300);
        
        const finalWidth = isSmall ? minWidth : Math.min(minWidth, maxWidth);
        const finalHeight = isSmall ? minHeight : Math.min(minHeight, maxHeight);
        
        setWrapperSize({ width: finalWidth, height: finalHeight });
      }
    };

    if (textDimensions.width && textDimensions.height) {
      handleResize();
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [textDimensions, fontSize, isSmall]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleMouseEnter = useCallback(() => {
    setInternalHover(true);
    setHasBeenShown(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (resetOnMouseLeave || !hasBeenShown) {
      setInternalHover(false);
    }
  }, [resetOnMouseLeave, hasBeenShown]);

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-flex items-center ${textAlign === 'left' ? 'justify-start' : 'justify-center'} overflow-visible transition-all duration-300 ${className}`}
      style={{
        width: wrapperSize.width || 'auto',
        height: wrapperSize.height || 'auto',
        minWidth: isSmall ? undefined : '150px',
        minHeight: isSmall ? undefined : '80px',
        maxWidth: '100%',
        backgroundColor: style.backgroundColor ?? (isSmall ? 'transparent' : 'rgba(15, 15, 15, 0.8)'),
        border: style.border ?? (isSmall ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'),
        backdropFilter: isSmall ? undefined : 'blur(10px)',
        cursor: 'pointer',
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated text layer */}
      <div
        className={`absolute z-10 transition-all duration-300 pointer-events-none ${
          isHovered || showText ? 'opacity-100 scale-[1.01]' : isSmall ? 'opacity-90' : 'opacity-0'
        }`}
        style={{
          color: resolvedColor,
          fontFamily,
          fontWeight,
          fontSize: `${fontSize}px`,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          left: textAlign === 'left' ? (isSmall ? '2px' : '8px') : '50%',
          top: '50%',
          transform: textAlign === 'left' ? 'translateY(-50%)' : 'translate(-50%, -50%)',
          textAlign: textAlign
        }}
      >
        {text}
      </div>
      
      {/* Canvas for magical particle system placed on top (z-20) so particles visibly sparkle over & around text */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
      />
    </div>
  );
};

export default MagicTextReveal;
