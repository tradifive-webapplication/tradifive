import React, { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Particle {
  id: number; x: number; y: number; size: number; color: string;
  vx: number; vy: number; alpha: number; decay: number;
}

function ParticleCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const idRef = useRef(0);
  const COLORS = ["#6366f1","#3b82f6","#818cf8","#a78bfa","#60a5fa","#c4b5fd"];

  const spawnBurst = useCallback((cx: number, cy: number, count = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.8 + Math.random() * 3.5;
      particlesRef.current.push({
        id: idRef.current++, x: cx, y: cy,
        size: 2.5 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, decay: 0.013 + Math.random() * 0.01,
      });
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let spawnTimer = 0, spawnCount = 0;

    const loop = (ts: number) => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (spawnCount < 10 && ts - spawnTimer > 90) { spawnBurst(W/2, H/2, 20); spawnTimer = ts; spawnCount++; }
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.02);
      for (const p of particlesRef.current) {
        p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.alpha -= p.decay;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 14;
        ctx.fill(); ctx.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [active, spawnBurst]);

  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:3 }} />;
}

function GridLines() {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:1 }} preserveAspectRatio="none">
      <defs>
        <pattern id="igrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(99,102,241,0.10)" strokeWidth="0.8"/>
        </pattern>
        <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="gridMask"><rect width="100%" height="100%" fill="url(#gridFade)"/></mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#igrid)" mask="url(#gridMask)"/>
    </svg>
  );
}

export default function PageIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter"|"logo"|"sweep"|"done">("enter");
  const [particlesActive, setParticlesActive] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase("logo"); setParticlesActive(true); }, 300);
    const t2 = setTimeout(() => setPhase("sweep"), 2000);
    const t3 = setTimeout(() => { setPhase("done"); onComplete(); }, 2750);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        animate={phase === "sweep" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.76,0,0.24,1] }}
        style={{ position:"fixed", inset:0, zIndex:9999, background:"#000", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}
      >
        {/* Radial glow */}
        <motion.div
          initial={{ scale:0.4, opacity:0 }}
          animate={{ scale:1.6, opacity:0.55 }}
          transition={{ duration:1.6, ease:"easeOut" }}
          style={{ position:"absolute", width:"60vw", height:"60vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(59,130,246,0.2) 45%, transparent 70%)", filter:"blur(60px)", zIndex:0 }}
        />
        <GridLines/>
        <ParticleCanvas active={particlesActive}/>

        {/* Sweep panels */}
        <motion.div initial={{ y:0 }} animate={phase==="sweep"?{y:"-100%"}:{y:0}} transition={{ duration:0.65, ease:[0.76,0,0.24,1] }}
          style={{ position:"absolute", top:0, left:0, right:0, height:"50%", background:"#000", zIndex:5 }}/>
        <motion.div initial={{ y:0 }} animate={phase==="sweep"?{y:"100%"}:{y:0}} transition={{ duration:0.65, ease:[0.76,0,0.24,1], delay:0.05 }}
          style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%", background:"#000", zIndex:5 }}/>

        {/* Center content */}
        <motion.div
          initial={{ opacity:0, scale:0.7, y:10 }}
          animate={phase==="sweep"?{opacity:0,scale:1.08,y:-8}:{opacity:1,scale:1,y:0}}
          transition={{ duration:0.65, ease:[0.16,1,0.3,1] }}
          style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}
        >
          {/* Logo circle */}
          <div style={{ position:"relative" }}>
            <motion.div
              initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1, duration:0.6 }}
              style={{ width:90, height:90, borderRadius:"50%", border:"1.5px solid rgba(99,102,241,0.4)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}
            >
              {/* Spinning arc */}
              <motion.div animate={{ rotate:360 }} transition={{ duration:1.2, ease:"linear", repeat:Infinity }}
                style={{ position:"absolute", inset:-3, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#6366f1", borderRightColor:"#3b82f6" }}/>
              {/* Inner */}
              <div style={{ width:66, height:66, borderRadius:"50%", background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(59,130,246,0.08))", border:"1px solid rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <motion.path d="M4 8 H28 M16 8 V26" stroke="url(#lg)" strokeWidth="3.5" strokeLinecap="round"
                    initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }} transition={{ duration:0.9, delay:0.3, ease:"easeOut" }}/>
                  <defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs>
                </svg>
              </div>
            </motion.div>
            {/* Orbit dot */}
            <motion.div animate={{ rotate:-360 }} transition={{ duration:1.8, ease:"linear", repeat:Infinity }}
              style={{ position:"absolute", inset:-8, borderRadius:"50%" }}>
              <div style={{ position:"absolute", top:"50%", left:0, transform:"translateY(-50%)", width:7, height:7, borderRadius:"50%", background:"#a78bfa", boxShadow:"0 0 12px #a78bfa" }}/>
            </motion.div>
          </div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity:0, y:8, letterSpacing:"0.4em" }}
            animate={{ opacity:1, y:0, letterSpacing:"-0.02em" }}
            transition={{ delay:0.55, duration:0.7, ease:[0.16,1,0.3,1] }}
            style={{ fontSize:26, fontWeight:900, fontFamily:"'Outfit','Inter',sans-serif", background:"linear-gradient(90deg,#fff 0%,#c4b5fd 50%,#60a5fa 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}
          >
            Tradifive
          </motion.div>

          {/* Tagline */}
          <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:0.5, y:0 }} transition={{ delay:0.85, duration:0.6 }}
            style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.55)", letterSpacing:"0.25em", textTransform:"uppercase" }}>
            AI · Trading · Ecosystem
          </motion.div>

          {/* Progress bar */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            style={{ width:140, height:2, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", marginTop:4 }}>
            <motion.div
              initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:1.6, delay:0.5, ease:"easeInOut" }}
              style={{ height:"100%", background:"linear-gradient(90deg,#6366f1,#3b82f6)", borderRadius:4, transformOrigin:"left", boxShadow:"0 0 10px #6366f1" }}/>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
