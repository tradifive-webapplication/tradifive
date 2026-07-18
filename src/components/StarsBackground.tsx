import React, { useEffect, useRef } from "react";

export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setCanvasSize();

    const numStars = Math.floor((width * height) / 12000);
    const stars = Array.from({ length: numStars }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.2 + 0.05,
      alpha: Math.random() * 0.6 + 0.1,
    }));

    let animationFrameId: number;

    const render = () => {
      // Base background color
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      stars.forEach((s) => {
        s.y -= s.speedY;
        if (s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.globalAlpha = s.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    window.addEventListener("resize", setCanvasSize);
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
