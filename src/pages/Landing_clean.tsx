import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import DeepDiveFeatures from "@/components/DeepDiveFeatures";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { PushableButton } from "../components/PushableButton";
import tradifiveLogo from "@/assets/tradifive-login-logo.png";
import tradifiveNewLogo from "@/assets/tradifive-new-logo.png";
import { supabase } from "@/lib/supabase";
import { X, Send, Rocket, MessageSquare, User, Shield, Download, Sparkles, Image, Layers, Share2 } from "lucide-react";
import WaitlistModal from "../components/WaitlistModal";
import { toast } from "sonner";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { Ic } from "../components/Ic";
import { TradeExecution3D, JournalGraphs3D, RiskGuard3D } from "../components/TerminalGraphics3D";

/* ═══════════════════════════════════
   GLOBAL STYLES — Light Mode
═══════════════════════════════════ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    @media (max-width: 1023px) {
      body { overflow: hidden !important; }
      #root > div > main, 
      #root > div > footer, 
      #root > div > nav, 
      #root > div > .Navbar, 
      #root > div > .bg-aura, 
      #root > div > .noise {
        display: none !important;
}
}

    :root {
      /* VERIFICATION MARKER: V2_LIVE */
      --bg:      #02040a;
      --bg2:     #050505;
      --bg3:     #0a0a0a;
      --surface: #0a0a0a;
      --border:  rgba(255, 255, 255, 0.08);
      --border2: rgba(255, 255, 255, 0.12);
      --ink:     #ffffff;
      --ink2:    rgba(255, 255, 255, 0.7);
      --ink3:    rgba(255, 255, 255, 0.4);
      --muted:   #64748b;
      --ghost:   #94a3b8;
      --blue:    #cccccc;
      --azure:   #aaaaaa;
      --violet:  #888888;
      --purple:  #ffffff;
      --cyan:    #bbbbbb;
      --green:   #dddddd;
      --rose:    #999999;
      --amber:   #eeeeee;
      --grad1:   linear-gradient(135deg, #dddddd, #444444);
      --grad-classic: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
}

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{
      background: var(--bg);
      color: var(--ink);
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
}
    h1,h2,h3,h4,h5,h6 {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.02em;
}

    ::-webkit-scrollbar{width:6px;}
    ::-webkit-scrollbar-track{background:var(--bg);}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:10px;}

    /* CURSOR GLOW */
    .cursor-glow{pointer-events:none;position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(255, 255, 255, 0.05) 0%,transparent 70%);transform:translate(-50%,-50%);z-index:0;transition:opacity 0.3s;}

    /* NAV */
    .nav-link {
      font-size: 14px;
      font-weight: 500;
      color: var(--ink3);
      text-decoration: none;
      transition: all 0.3s ease;
}
    .nav-link:hover {
      color: var(--ink);
}

    /* BUTTONS */
    .btn-classic {
      padding: 12px 28px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid transparent;
}
    .btn-primary-classic {
      background: #fff;
      color: #000;
}
    .btn-primary-classic:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
}
    .btn-outline-classic {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      border-color: var(--border2);
}
    .btn-outline-classic:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #fff;
      transform: translateY(-2px);
}

    .btn-see-how {
      transition: all 0.3s ease;
}
    .btn-see-how:hover {
      background-color: #3b82f6 !important;
      color: #fff !important;
      border-color: #3b82f6 !important;
      transform: translateY(-2px);
}

    /* STEP CARDS — AMAZING CLASSIC */
    .step-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 28px;
      padding: 48px 36px;
      position: relative;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
}
    .step-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--grad-classic);
      opacity: 0.5;
      pointer-events: none;
}
    .step-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-12px) scale(1.02);
      box-shadow: 
        0 20px 40px -12px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(255, 255, 255, 0.1);
}
    .step-num {
      font-size: 12px;
      font-weight: 800;
      color: var(--purple);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 24px;
      display: block;
}
    .step-title {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 16px;
      font-family: 'Inter', sans-serif;
}
    .step-desc {
      font-size: 15px;
      color: var(--ink3);
      line-height: 1.7;
      font-weight: 400;
}

    /* FEATURE CARDS (Liquid Glass) */
    .feat-card-premium {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border-radius: 32px;
      padding: 40px;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        0 10px 30px -10px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
}
    .feat-card-premium::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; height: 100%;
      background: linear-gradient(135deg, transparent, rgba(255,255,255,0.03), transparent);
      pointer-events: none;
}
    .feat-card-premium:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-12px) scale(1.02);
      box-shadow: 
        inset 0 1px 1px rgba(255, 255, 255, 0.2),
        0 40px 80px -15px rgba(0, 0, 0, 0.6);
}
    .feat-card-premium:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-8px);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 30px 60px -12px rgba(0, 0, 0, 0.5);
}

    /* GRADIENT TEXT */
    .text-glow {
      background: linear-gradient(to right, #fff 20%, #cccccc 80%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

    /* REVEAL ANIMATIONS */
    .rv{opacity:0;transform:translateY(30px);transition:opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);}
    .rv.in{opacity:1;transform:none;}
    .d1{transition-delay:0.1s}
    .d2{transition-delay:0.2s}
    .d3{transition-delay:0.3s}
    .d4{transition-delay:0.4s}

    /* TICKERS & TRACKS */
    .tick-wrap {
      overflow: hidden;
      white-space: nowrap;
      background: var(--bg2);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 12px 0;
      position: relative;
}
    .tick-track {
      display: inline-flex;
      animation: ticker 40s linear infinite;
}
    @keyframes ticker {
      to { transform: translateX(-50%); }
}

    .br-track {
      display: inline-flex;
      animation: broker 35s linear infinite;
}
    @keyframes broker {
      to { transform: translateX(-50%); }
}
    .br-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      border-radius: 100px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
      white-space: nowrap;
      margin: 0 8px;
      transition: all 0.3s ease;
}
    .br-chip:hover {
      border-color: var(--purple);
      background: rgba(255, 255, 255, 0.05);
      transform: translateY(-2px);
}

    /* FLOATING ANIMATIONS */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
}
    .fa { animation: float 4s ease-in-out infinite; }
    .fb { animation: float 5s ease-in-out infinite 0.5s; }
    .fc { animation: float 3.5s ease-in-out infinite 0.2s; }

    @media (max-width: 1024px) {
      .capabilities-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
    @media (max-width: 768px) {
      .capabilities-grid { grid-template-columns: 1fr !important; }
      .steps-grid { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 42px !important; }
}
  `}</style>
);

/* ── hooks ── */
function useReveal() {
  const r = useRef();
  useEffect(() => {
    const el = r.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return r;
}

function ScrollFloat({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}

function Counter({ to, prefix = "", suffix = "" }) {
  const [v, setV] = useState(0);
  const r = useRef(); const done = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return; done.current = true;
      const dur = 1800, t0 = performance.now();
      const tick = t => { const p = Math.min((t - t0) / dur, 1); setV(Math.round((1 - (1 - p) ** 3) * to)); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (r.current) io.observe(r.current); return () => io.disconnect();
  }, [to]);
  return <span ref={r}>{prefix}{v.toLocaleString()}{suffix}</span>;
}

/* ── Icons ── */

/* ════════════════
   CURSOR GLOW
════════════════ */


/* ════════════════
   WAITLIST MODAL
════════════════ */

/* ════════════════
   NAVBAR
════════════════ */

/* ════════════════
   TICKER
════════════════ */
const TICKS = [["EUR/USD", "+0.43%", 1], ["GBP/USD", "+1.21%", 1], ["USD/JPY", "−0.18%", 0], ["XAU/USD", "+0.87%", 1], ["BTC/USD", "+3.24%", 1], ["NAS100", "+0.62%", 1], ["S&P 500", "+0.44%", 1], ["USD/CAD", "−0.11%", 0], ["ETH/USD", "+5.11%", 1], ["OIL", "−0.77%", 0]];
function Ticker() {
  return (
    <div className="tick-wrap">
      <div className="tick-track">
        {[...TICKS, ...TICKS].map(([s, v, u], i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "0 28px" }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ghost)", letterSpacing: "0.4px" }}>{s}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: u ? "var(--green)" : "var(--rose)" }}>{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════
   HERO
════════════════ */
function Hero({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }) {
  const navigate = useNavigate();
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal();

  return (
    <section style={{ position: "relative", overflow: "hidden", paddingTop: 180, paddingBottom: 100, background: "#000000" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" }} className="flex-col-sm">

        {/* Left Content */}
        <div style={{ zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 32, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cccccc" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "none", letterSpacing: "0.2px" }}>Institutional Risk Management</span>
          </motion.div>

          <ScrollFloat>
            <h1 ref={r1} className="rv" style={{ fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.05em", marginBottom: 24, color: "#fff" }}>
              <span style={{ background: "linear-gradient(to right, #3b82f6, #ffffff 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Master Your Risk.</span><br />
              <span className="text-glow">You Stay </span>
              <span style={{
                background: "linear-gradient(to right, #ffffff 0%, rgba(255, 255, 255, 0.2) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>in Control.</span>
            </h1>
          </ScrollFloat>

          <p ref={r2} className="rv d1" style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, maxWidth: 540, marginBottom: 40, fontWeight: 400 }}>
            Tradifive is an AI-powered trading ecosystem that enforces risk rules, builds discipline, and tracks performance — so traders stop blowing accounts and start trading like professionals.
          </p>

          <div ref={r3} className="rv d2" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48 }}>
            <button
              onClick={onStart}
              className="btn-classic"
              style={{ padding: "14px 32px", fontSize: 14, background: "#3b82f6", color: "#fff", fontWeight: 800, border: "none" }}
            >
              Start Trading
            </button>
            <button
              onClick={onSignIn}
              className="btn-classic btn-see-how"
              style={{
                padding: "14px 32px",
                fontSize: 14,
                backgroundColor: "#161616",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.25'/%3E%3C/svg%3E")`,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 800
              }}
            >
              See how it works ↓
            </button>
          </div>

          <div ref={r4} className="rv d3" style={{ display: "flex", gap: 24, opacity: 0.6 }}>
            {["✓ Automated Risk Guards", "✓ Built-in Risk Guard protection", "✓ Smart trade journal & insights"].map(t => (
              <span key={t} style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Right Video / Visual */}
        <div ref={r5} style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "center" }} className="rv d4">
          <div style={{
            position: "relative",
            left: "80px",
            width: "75%",
            overflow: "hidden",
            WebkitMaskImage: "radial-gradient(circle at center, black 50%, transparent 100%)",
            maskImage: "radial-gradient(circle at center, black 50%, transparent 100%)"
          }}>
            <img
              src="/Dark_image.jpg"
              alt="Mission Control"
              style={{ width: "100%", display: "block", opacity: 0.9, objectFit: "cover" }}
            />

            {/* Glossy overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), transparent 60%)", pointerEvents: "none" }} />
          </div>

          {/* Decorative floating elements */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)", filter: "blur(40px)", zIndex: -1 }} />
        </div>

      </div>
    </section>
  );
}

/* ════════════════
   BROKERS
════════════════ */
const CORE_FEATURES = [
  { n: "Next-Gen AI Core", c: "#3b82f6" },
  { n: "Elite Trading Challenges", c: "#94a3b8" },
  { n: "Institutional Risk Guard", c: "#3b82f6" },
  { n: "Quantum Execution Nodes", c: "#94a3b8" },
  { n: "Automated Edge Engine", c: "#3b82f6" },
  { n: "Real-Time Telemetry", c: "#94a3b8" },
  { n: "Multi-Broker Bridge", c: "#3b82f6" }
];
function Brokers() {
  return (
    <section style={{ background: "#050505", padding: "44px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 3 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 900,
          background: "linear-gradient(to right, rgba(255,255,255,0.3), #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "4px",
          textTransform: "uppercase"
        }}>CORE INFRASTRUCTURE FOR THE MODERN TRADER</p>
      </div>
      <div style={{
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        width: "100%",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "25%", background: "linear-gradient(to right, #050505 10%, transparent)", zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "25%", background: "linear-gradient(to left, #050505 10%, transparent)", zIndex: 10, pointerEvents: "none" }} />
        <div className="br-track">
          {[...CORE_FEATURES, ...CORE_FEATURES].map((b, i) => (
            <div key={i} className="br-chip" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "10px 24px", borderRadius: "100px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.c, boxShadow: `0 0 10px ${b.c}` }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.2px" }}>{b.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   PROBLEM
 ════════════════ */
function Problem() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  return (
    <section id="problem" style={{ background: "transparent", padding: "140px 28px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }} className="flex-col-sm">
        <div>
          <div ref={r1} className="rv" style={{ marginBottom: 24 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.08)", color: "#dddddd", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>The Hard Truth</span>
          </div>
          <ScrollFloat>
            <h2 ref={r2} className="rv d1" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 48 }}>
              95% of traders fail.<br />
              <span style={{
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E") rgba(255,255,255,0.3)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>It's not a lack of skill.</span>
            </h2>
          </ScrollFloat>
        </div>
      </div>
    </section>
  );
}
/* ---------------- */
function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const STEPS = [
    {
      id: "01",
      title: "Connect MT5",
      desc: "Link your MetaTrader 5 demo or real account securely in under 2 minutes. Works with 50+ brokers globally.",
      icon: "link"
    },
    {
      id: "02",
      title: "1. Connect & Configure",
      desc: "Set your risk parameters once. Tradifive automatically calibrates limits to your account size to protect your capital.",
      icon: "cpu"
    },
    {
      id: "03",
      title: "Monitor Live",
      desc: "Every trade, every metric — updated live on your premium dashboard. Zero delays, always accurate.",
      icon: "cloud"
    },
    {
      id: "04",
      title: "Scale Profits",
      desc: "Verify results on demo, then go real. All settings and history transfer instantly when you upgrade.",
      icon: "trend"
}
  ];

  const StepContent = ({ s, i }: { s: any, i: number }) => {
    const ref = useReveal();
    return (
      <div ref={ref} className="rv" style={{ transitionDelay: `${i * 0.1}s` }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--purple)", textTransform: "uppercase", letterSpacing: 2 }}>Step {s.id}</span>
        <h3 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8, marginBottom: 16 }}>{s.title}</h3>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 500 }}>{s.desc}</p>
      </div>
    );
  };

  return (
    <section id="how-it-works" style={{ background: "#000", padding: "140px 28px", position: "relative" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 100 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 24 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#cccccc", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "6px 16px", borderRadius: "100px", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>The Process</span>
          </div>
          <ScrollFloat>
            <h2 ref={useReveal()} className="rv d1" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 24, lineHeight: 1.1 }}>
              From zero to automated profits<br />
              <span style={{ background: "linear-gradient(to right, #cccccc, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in four simple steps.</span>
            </h2>
          </ScrollFloat>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", maxWidth: 540, margin: "0 auto", fontWeight: 400 }}>No trading experience required. Our platform handles the complexity, you handle the results.</p>
        </div>

        <div ref={containerRef} style={{ position: "relative" }}>
          {/* Vertical Timeline Line - Starts below first icon, ends at top of 4th */}
          <div style={{ position: "absolute", left: 21, top: 44, bottom: 144, width: 2, background: "rgba(255,255,255,0.03)", zIndex: 0 }}>
            <motion.div style={{
              width: "100%",
              height: lineHeight,
              background: "linear-gradient(to bottom, #7c3aed, #3b82f6)",
              boxShadow: "0 0 10px #7c3aed, 0 0 20px rgba(255, 255, 255, 0.3)",
              filter: "blur(0.5px)"
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 100, position: "relative", zIndex: 1 }}>
            {STEPS.map((s, i) => {
              // Calculate if this step is "active" based on scroll progress
              // We'll use a simple threshold for now, or just rely on the line passing through
              const stepProgress = (i / (STEPS.length - 1));

              return (
                <div key={i} style={{ display: "flex", gap: 48, position: "relative" }}>
                  {/* Step Circle/Icon Container */}
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <motion.div
                      initial={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#000" }}
                      whileInView={{
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)"
                      }}
                      viewport={{ once: false, amount: 0.8 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid",
                        position: "relative",
                        zIndex: 3,
                        backgroundColor: "#000"
                      }}
                    >
                      <Ic n={s.icon} s={18} c="#fff" sw={2} />

                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: "absolute", inset: -4, borderRadius: 16, background: "rgba(255, 255, 255, 0.4)", zIndex: -1 }}
                      />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <StepContent s={s} i={i} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   PHILOSOPHY (Waycode Style)
  ════════════════ */
function Philosophy() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();

  const PhilosophyItem = ({ item, i }: { item: any, i: number }) => {
    const ref = useReveal();
    return (
      <div ref={ref} className="rv" style={{ padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
        <span style={{ fontWeight: 800, color: "#fff", marginRight: 8 }}>{item.t}</span> {item.d}
      </div>
    );
  };

  return (
    <section style={{ background: "#000", padding: "140px 28px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 80, textAlign: "center" }}>
          <div ref={r1} className="rv" style={{ marginBottom: 24 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#dddddd", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "6px 16px", borderRadius: "100px", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Why not just use what exists?</span>
          </div>
          <ScrollFloat>
            <h2 ref={r2} className="rv d1" style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 32 }}>
              Typical tools <span style={{ background: "linear-gradient(to right, #fff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>weren't built</span><br />
              <span style={{ background: "linear-gradient(to right, #fff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>for your psychology.</span>
            </h2>
          </ScrollFloat>
        </div>

        <div style={{ display: "grid", gap: 16, maxWidth: 800, margin: "0 auto" }}>
          {[
            { t: "Telegram Signals", d: "are noise. By the time you see the alert, the edge is gone and you're chasing the move with high emotional friction.", c: "var(--purple)" },
            { t: "TradingView", d: "is for analysis, not execution. Drawing perfect lines doesn't stop you from breaking your own rules when money is on the line.", c: "var(--azure)" },
            { t: "Manual Journals", d: "are tedious. You'll stop logging your losses when they hurt, hiding the truth from yourself and stalling your growth.", c: "var(--green)" },
            { t: "Excel Sheets", d: "are static. They don't react to live market volatility or enforce your max drawdown in real-time to protect your capital.", c: "var(--rose)" }
          ].map((item, i) => (
            <PhilosophyItem key={i} item={item} i={i} />
          ))}
        </div>

        <p ref={r3} className="rv d3" style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", marginTop: 64, fontWeight: 500, maxWidth: 600, margin: "64px auto 0", textAlign: "center" }}>
          TradiFive is the first platform built specifically for the trader who is serious about profits but <span style={{ color: "var(--purple)" }}>doesn't have the institutional discipline</span> to stay consistent.
        </p>
      </div>
    </section>
  );
}

function Discipline() {
  const r1 = useReveal(), r2 = useReveal();
  return (
    <section style={{ background: "#050505", padding: "140px 28px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }} className="flex-col-sm">
        <div>
          <div ref={r1} className="rv" style={{ marginBottom: 24 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "#cccccc", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "6px 16px", borderRadius: "100px", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Why we built this</span>
          </div>
          <ScrollFloat>
            <h2 ref={r2} className="rv d1" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 40 }}>
              We were <span style={{ background: "linear-gradient(to right, #cccccc, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>you.</span>
            </h2>
          </ScrollFloat>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, padding: 32, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 28 }}>
            {[
              { v: "0", l: "Manual Logging" },
              { v: "∞", l: "Risk Control" },
              { v: "1", l: "Mission Control" }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontWeight: 700, marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Markets don't always teach discipline properly. YouTube tutorials help, but only so far. We found ourselves stuck — trading alone, with no one to enforce our rules, and <span style={{ color: "#fff", fontWeight: 700 }}>no way to stop our own impulses.</span>
          </p>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            We tried everything. Manual journals were too slow. Risk rules were broken in seconds. TradiFive meant nothing for a trader who wasn't just chasing a quick win.
          </p>
          <p style={{ fontSize: 20, color: "#fff", fontWeight: 600, lineHeight: 1.6 }}>
            So we built the platform we wished existed. A focused environment where <span style={{ color: "var(--purple)" }}>Risk Guard</span> and <span style={{ color: "var(--azure)" }}>Auto-Sync Journaling</span> build a portfolio that actually shows what you know.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   PLATFORM CAPABILITIES (FEATURES)
 ════════════════ */
const CAPABILITIES = [
  {
    id: "01",
    tag: "Execution Engine",
    title: "Low-Latency MT5 Bridge",
    desc: "Direct-to-market execution with institutional-grade routing. Optimized for high-frequency deployment and minimal slippage.",
    m: "2.4ms",
    mt: "Avg. Latency",
    icon: Rocket,
    color: "#3b82f6"
  },
  {
    id: "02",
    tag: "Risk Protocol",
    title: "Autonomous Risk Guard",
    desc: "Real-time position sizing and drawdown protection. Built to enforce discipline and protect capital around the clock.",
    m: "0.1s",
    mt: "React Speed",
    icon: Shield,
    color: "#a855f7"
  },
  {
    id: "03",
    tag: "Analytics Core",
    title: "Precision AI Telemetry",
    desc: "40+ premium metrics synced live to your dashboard. Comprehensive tracking of Sharpe ratio, equity curves, and edge distribution.",
    m: "40+",
    mt: "Live Metrics",
    icon: Layers,
    color: "#ec4899"
  },
  {
    id: "04",
    tag: "Discovery Engine",
    title: "Performance & Psychology Analytics",
    desc: "Analyze your trades, uncover hidden psychological patterns, and benchmark your performance against successful traders.",
    m: "92.4%",
    mt: "Copied Win Rate",
    icon: Sparkles,
    color: "#3b82f6"
  },
  {
    id: "05",
    tag: "Signal Hub",
    title: "Secure Community Channels",
    desc: "Join dedicated broadcast rooms, launch private signal channels, and route live signals directly to your connected MetaTrader terminal.",
    m: "450+",
    mt: "Active Channels",
    icon: MessageSquare,
    color: "#a855f7"
  },
  {
    id: "06",
    tag: "Social Timeline",
    title: "Vibrant Pulse Feeds",
    desc: "A stunning social canvas to share chart setups, show off verified profit milestones, and publish execution summaries with zero noise.",
    m: "120k+",
    mt: "Daily Highlights",
    icon: Share2,
    color: "#ec4899"
}
];

function Features() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  return (
    <section id="features" style={{ background: "transparent", padding: "120px 28px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div ref={r1} className="rv" style={{ marginBottom: 20 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "var(--azure)", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>Platform Capabilities</span>
          </div>
          <ScrollFloat>
            <h2 ref={r2} className="rv d1" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Institutional architecture.<br />
              <span className="text-glow">Engineered for individuals.</span>
            </h2>
          </ScrollFloat>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 1050, margin: "0 auto" }} className="capabilities-grid grid-1-sm">
          {CAPABILITIES.map((f, i) => (
            <div
              key={i}
              id={f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              className="feat-card-premium"
              style={{ padding: "32px", borderRadius: 24, position: "relative", overflow: "hidden" }}
            >
              {/* Technical ID Number */}
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.015)", letterSpacing: "-0.05em", pointerEvents: "none" }}>{f.id}</div>

              <div style={{ position: "relative", zIndex: 2 }}>
                {/* Icon Container */}
                <div style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: `rgba(255, 255, 255, 0.03)`, 
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginBottom: 20
                }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>

                <span style={{ color: "var(--purple)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{f.tag}</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "12px 0 16px 0" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 40, fontWeight: 400 }}>{f.desc}</p>

                <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{f.m}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{f.mt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ════════════════
   HOW IT WORKS
════════════════ */

/* ════════════════
   PRICING
════════════════ */

/* ════════════════
   ALGOBRAIN (Huly Inspired Creative Bento)
════════════════ */
function TerminalBento() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  return (
    <section id="community" style={{ background: "#050505", padding: "140px 28px", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 24 }}>
            <span className="badge" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#cccccc", border: "1px solid rgba(255, 255, 255, 0.2)" }}>The Tech Stack ⚡</span>
          </div>
          <ScrollFloat>
            <h2 ref={useReveal()} className="rv d1" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 20, lineHeight: 1.1 }}>
              Engineered for precision.
            </h2>
          </ScrollFloat>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto", fontWeight: 500 }}>Everything a professional manual trader needs, built into one seamless terminal.</p>
        </div>

        {/* Creative Bento Grid */}
        <div className="brain-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "minmax(180px, auto)", gap: 24 }}>

          {/* Top Left - Trade Execution */}
          <div ref={r2} className="brain-card" style={{ gridColumn: "span 2", gridRow: "span 3", background: "#10141d", borderRadius: 28, padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, background: "radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)" }} />
            <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
              <h4 style={{ color: "#fff", fontSize: 17, fontWeight: 800, marginBottom: 14 }}>One-Click Execution. <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Calculate risk and fire orders instantly from the slide-over panel.</span></h4>
              <div style={{ flex: 1, position: "relative", marginTop: 20 }}>
                 <TradeExecution3D />
              </div>
            </div>
          </div>

          {/* Top Right - Automated Journal */}
          <div ref={r2} className="brain-card" style={{ gridColumn: "span 4", gridRow: "span 3", background: "#0b0e14", borderRadius: 28, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
               <JournalGraphs3D />
            </div>
            <div style={{ position: "absolute", inset: 0, zIndex: 2, padding: 32, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(to top, rgba(11, 14, 20, 0.4), transparent 60%)", pointerEvents: "none" }}>
              <h4 style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>Automated Journal. <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Every trade synced and charted in real-time.</span></h4>
              <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, width: "fit-content" }}>
                <Ic n="verify" s={14} c="#3b82f6" sw={3} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>Live Sync Active</span>
              </div>
            </div>
          </div>

          {/* Bottom - Risk Guard */}
          <div ref={r3} className="brain-card" style={{ gridColumn: "span 6", gridRow: "span 2", background: "#0b0e14", borderRadius: 28, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 32 }}>
            
            <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 400 }}>
              <h4 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Risk Guard Protocol.</h4>
              <p style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>Enforce extreme discipline. Set your max daily loss, and if you tilt, the terminal locks you out of the market to protect your capital.</p>
              <div style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, width: "fit-content" }}>
                <Shield size={14} color="#a855f7" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#a855f7" }}>Capital Protection</span>
              </div>
            </div>

            <div style={{ flex: 1, height: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
               <RiskGuard3D />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
function DownloadModal({ showDownloadModal, setShowDownloadModal }: { showDownloadModal: boolean; setShowDownloadModal: (s: boolean) => void }) {
  return (
    <AnimatePresence>
      {showDownloadModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(20px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                background: "rgba(10, 10, 10, 0.9)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 32,
                padding: 40,
                maxWidth: 600,
                width: "100%",
                position: "relative",
                boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
              }}
            >
              <button 
                onClick={() => setShowDownloadModal(false)}
                style={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Download TradiFive</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Get the desktop terminal or mobile app to manage your MT5 accounts</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="flex-col-sm">
                {/* Desktop Terminal */}
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 20,
                  padding: 24,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>💻</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Desktop Terminal</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Ultra low-latency professional trading cockpit.</p>
                  
                  <a 
                    href="/dist/TradiFive_Setup.exe" 
                    download 
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      background: "#3b82f6",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: "none",
                      display: "inline-block",
                      marginBottom: 10,
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                    onClick={() => toast.success("Starting Download for Windows...")}
                  >
                    Windows (.exe)
                  </a>
                  
                  <a 
                    href="/dist/TradiFive_Mac.dmg" 
                    download 
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: "none",
                      display: "inline-block",
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                    onClick={() => toast.success("Starting Download for macOS...")}
                  >
                    macOS (.dmg)
                  </a>
                </div>

                {/* Mobile App */}
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 20,
                  padding: 24,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Mobile App</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Monitor trades, adjust risk, and view feeds on the go.</p>
                  
                  <button 
                    onClick={() => toast.info("iOS app is currently in TestFlight. Invitation sent to your email.")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #111, #222)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      marginBottom: 10,
                      transition: "all 0.2s"
                    }}
                  >
                    iOS App
                  </button>
                  
                  <button 
                    onClick={() => toast.info("Android app APK download ready. Invitation link sent.")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #111, #222)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Android App
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                Secure connection powered by TradiFive Intelligence. Supports all MT5 brokers.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );
}
function PricingSection({ onStart }: { onStart: () => void }) {
  const [selectedPlan, setSelectedPlan] = React.useState<'starter' | 'pro' | 'elite' | 'enterprise'>('pro');
  return (
    <section id="pricing" style={{ padding: "80px 24px", background: "#050505" }}>
      <PricingCards 
        selectedPlan={selectedPlan} 
        onSelectPlan={setSelectedPlan} 
        onUpgradeClick={() => onStart()} 
      />
    </section>
  );
}

export default function TradiFive() {
  const [isMobile, setIsMobile] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const isWidthMobile = window.innerWidth < 1024;
      const isUAMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isWidthMobile || isUAMobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSignIn = () => setShowWaitlist(true);
  const handleSignUp = () => setShowWaitlist(true);
  const handleStart = handleSignUp;

  // Removed redirect to allow landing page to show on mobile

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', position: 'relative' }}>
      <PublicNavbar onSignIn={handleSignIn} onSignUp={handleSignUp} onDownloadClick={() => setShowDownloadModal(true)} />
      <DownloadModal showDownloadModal={showDownloadModal} setShowDownloadModal={setShowDownloadModal} />
      <main style={{ position: 'relative', zIndex: 1, paddingTop: 40 }}>
        <Hero onStart={handleStart} onSignIn={handleSignIn} />
        <Brokers />
        <Problem />
        <HowItWorks />
        <Philosophy />
        <Discipline />
        <Features />
        <DeepDiveFeatures />
        <TerminalBento />
        <PricingSection onStart={handleStart} />
      </main>
      <PublicFooter />
    </div>
  );
}
