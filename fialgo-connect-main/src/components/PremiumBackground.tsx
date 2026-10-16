import React, { useEffect, useRef } from 'react';

export default function PremiumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize Bubbles / Plankton
    const numBubbles = 80;
    const bubbles = Array.from({ length: numBubbles }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.4 + 0.1, // Slow float
      phase: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.015 + 0.005,
      wobbleDist: Math.random() * 15 + 5,
    }));

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. Bubbles floating up
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      bubbles.forEach((b) => {
        b.y -= b.speedY;
        const currentX = b.x + Math.sin(time * b.wobbleSpeed + b.phase) * b.wobbleDist;

        if (b.y < -10) {
          b.y = canvas.height + 10;
          b.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: -1, 
      pointerEvents: 'none', 
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #111111 0%, #050505 100%)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '25vh',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
      }} />
      <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh', position: 'relative', zIndex: 1 }} />
    </div>
  );
}
