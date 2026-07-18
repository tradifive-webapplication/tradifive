import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { CheckCircle2, Shield, TrendingUp, Users, ArrowRight, Activity, Cpu, Play, Layers, X, Zap, Trophy, Star, Globe, MessageSquare, Radio, MessageCircle, GraduationCap, Sparkles, BookText, Crown, ShieldCheck } from "lucide-react";
import { ShieldDone, Graph, Activity as IconlyActivity, TwoUsers } from "react-iconly";
import WaitlistModal from "../components/WaitlistModal";
import PremiumBackground from "../components/PremiumBackground";
import StarsBackground from "../components/StarsBackground";
import { toast } from "sonner";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

import { Ic } from "../components/Ic";
import Pattern from "../components/Pattern";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
// Spline is dynamically imported ONLY for desktop — avoids shipping the heavy
// WebGL runtime to mobile devices where it is not rendered.
const SplineLazy = lazy(() => import('@splinetool/react-spline'));
import { FlipText } from "@/components/ui/flip-text";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";
import DeepDiveFeatures from "@/components/DeepDiveFeatures";
import SideRays from "@/components/SideRays";
import PlasmaWave from "@/components/PlasmaWave";
import BlurText from "@/components/BlurText";
import LaserFlow from "@/components/LaserFlow";

/* ── hooks ── */
function useReveal() {
  const r = useRef<any>(null);
  useEffect(() => {
    const el = r.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return r;
}



/* ════════════════
   3D HERO DASHBOARD VISUAL
════════════════ */
function HeroDashboard() {
  const [tick, setTick] = useState(0);
  const [trades, setTrades] = useState([
    { pair: "EUR/USD", dir: "BUY", pnl: "+$142.50", pos: true, time: "2s ago" },
    { pair: "XAU/USD", dir: "SELL", pnl: "+$89.20", pos: true, time: "18s ago" },
    { pair: "BTC/USD", dir: "BUY", pnl: "-$32.10", pos: false, time: "1m ago" },
    { pair: "GBP/JPY", dir: "BUY", pnl: "+$211.00", pos: true, time: "3m ago" },
  ]);
  // Animated chart points
  const chartPoints = [
    "0,80 40,65 80,70 120,45 160,55 200,30 240,40 280,20 320,35 360,15 400,25 440,10 480,18"
  ];

  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % 100), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-dashboard-container">
      {/* Main glass terminal */}
      <motion.div
        initial={{ opacity: 0, x: 40, rotateY: -8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute", top: 20, left: 0, right: 0,
          background: "linear-gradient(160deg, rgba(18,18,22,0.98) 0%, rgba(10,10,12,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(150,200,255,0.2)",
          borderRightColor: "rgba(150,200,255,0.15)",
          borderRadius: 24,
          padding: "20px",
          backdropFilter: "blur(40px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), inset -1px 1px 3px rgba(150,200,255,0.15), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden"
        }}
      >


        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#f43f5e", "#f59e0b", "#10b981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>tradifive — live dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>LIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { l: "Total P&L", v: "+$2,847", c: "#10b981", sub: "this week" },
            { l: "Win Rate", v: "73.4%", c: "rgba(255,255,255,0.9)", sub: "last 50 trades" },
            { l: "Followers", v: "1,240", c: "rgba(255,255,255,0.75)", sub: "on your profile" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#171717", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{s.l}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c, letterSpacing: "-0.03em" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "#171717", borderRadius: 14, padding: "14px", marginBottom: 14, overflow: "hidden", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Equity Curve</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>↑ +18.4% this month</span>
          </div>
          <svg width="100%" height="70" viewBox="0 0 480 90" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline points={`${chartPoints[0]} 480,90 0,90`} fill="url(#chartGrad)" stroke="none" />
            <polyline
              points={chartPoints[0]}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 1000, strokeDashoffset: 0, animation: "chartDraw 2s ease-out forwards" }}
            />
            <circle cx="440" cy="10" r="4" fill="#10b981" opacity="0.9">
              <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Live trades feed */}
        <div style={{ background: "#171717", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Live Trade Feed</span>
            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>● Synced</span>
          </div>
          {trades.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.6 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < trades.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: t.dir === "BUY" ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: t.dir === "BUY" ? "#10b981" : "#f43f5e" }}>{t.dir}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{t.pair}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.time}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.pos ? "#10b981" : "#f43f5e" }}>{t.pnl}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating card: Social post */}
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          position: "absolute", top: -10, right: -30,
          background: "rgba(14,14,16,0.95)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderTopColor: "rgba(150, 200, 255, 0.45)",
          borderRightColor: "rgba(150, 200, 255, 0.35)",
          borderRadius: 18, padding: "14px 16px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset -1px 1px 4px rgba(150, 200, 255, 0.3), 0 0 0 1px rgba(255,255,255,0.04)",
          width: 195, zIndex: 20, "--rot": "-2deg"
        } as any}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #374151, #6b7280)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>MV</div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>Marcus V.</div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)" }}>@marcus_trades • 2m</div>
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, margin: 0 }}>Closed EUR/USD +142 pips. Risk managed the whole way. Love the journal sync 🔥</p>
        <div style={{ display: "flex", gap: 12, marginTop: 10, color: "rgba(255,255,255,0.3)", fontSize: 10.5, fontWeight: 600 }}>
          <span>❤️ 47</span><span>💬 12</span><span>🔁 8</span>
        </div>
      </motion.div>

      {/* Floating card: Leaderboard badge */}
      <motion.div
        className="hero-card-b"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{
          position: "absolute", bottom: 60, right: -20,
          background: "rgba(14,14,16,0.95)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderTopColor: "rgba(150, 200, 255, 0.25)",
          borderRightColor: "rgba(150, 200, 255, 0.2)",
          borderRadius: 16, padding: "12px 16px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset -1px 1px 2px rgba(150,200,255,0.15)",
          width: 175, zIndex: 20
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏆 Leaderboard</div>
        {[
          { rank: "#1", name: "Elena R.", pnl: "+$4,820" },
          { rank: "#2", name: "David M.", pnl: "+$3,210" },
          { rank: "#3", name: "You", pnl: "+$2,847", you: true },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{r.rank}</span>
              <span style={{ fontSize: 11, fontWeight: r.you ? 800 : 600, color: r.you ? "#f59e0b" : "rgba(255,255,255,0.7)" }}>{r.name}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>{r.pnl}</span>
          </div>
        ))}
      </motion.div>

      {/* Floating card: Risk Guard */}
      <motion.div
        className="hero-card-c"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        style={{
          position: "absolute", bottom: 55, left: -20,
          background: "rgba(14,14,16,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(255,255,255,0.15)",
          borderRightColor: "rgba(255,255,255,0.12)",
          borderRadius: 16, padding: "12px 16px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset -1px 1px 1px rgba(255,255,255,0.05)",
          width: 170, zIndex: 20
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Shield size={12} color="#10b981" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 1 }}>Risk Guard</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Daily Limit</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>$500</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
            <div style={{ height: "100%", width: "34%", background: "linear-gradient(to right, #10b981, rgba(255,255,255,0.4))", borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 9, color: "#10b981", marginTop: 4, fontWeight: 600 }}>34% used — Protected ✓</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════
   HERO TRUST SIGNALS
════════════════ */
function HeroTrustSignals() {
  const navigate = useNavigate();
  const [clicks, setClicks] = useState(0);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleBuiltTogetherClick = () => {
    setClicks(prev => {
      const next = prev + 1;
      if (next >= 10) {
        navigate("/login");
        return 0;
      }
      return next;
    });

    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => {
      setClicks(0);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20, width: "100%" }}
    >
      {/* 4 Feature Items */}
      <div className="trust-features-grid" style={{ gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#3b82f6" }}><ShieldDone set="light" size={18} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Risk First</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>AI risk guard protects your capital in real-time.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#7c3aed" }}><Graph set="light" size={18} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Data Driven</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>Advanced analytics for smarter decisions.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#8b5cf6" }}><IconlyActivity set="light" size={18} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Lightning Fast</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>Blazing fast execution with low latency.</div>
        </div>
        <div 
          style={{ display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}
          onClick={handleBuiltTogetherClick}
        >
          <div style={{ color: "#6366f1" }}><TwoUsers set="light" size={18} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Built Together</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>Join a transparent community of traders.</div>
        </div>
      </div>

      {/* Social Proof Card */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-[#171717] border border-white/5 rounded-2xl w-full">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="text-[10px] sm:text-xs text-white/60 font-medium">Trusted by traders worldwide</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex" }}>
              {["/avatars/men_1.jpg", "/avatars/women_1.jpg", "/avatars/men_2.jpg", "/avatars/women_2.jpg", "/nikil_avatar.jpg"].map((src, i) => (
                <div key={i} className="w-5 h-5 sm:w-[26px] sm:h-[26px]" style={{
                  borderRadius: "50%",
                  border: "2px solid #0a0a0a",
                  marginLeft: i === 0 ? 0 : (i === 1 ? -4 : -6), // Slightly tighter overlap on mobile
                  overflow: "hidden",
                  zIndex: 5 - i,
                  position: "relative",
                  background: "#111"
                }}>
                  {/* Using placeholder colors if image missing */}
                  <img src={src} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                </div>
              ))}
            </div>
            <div className="px-2 py-1 bg-white/5 rounded-full text-[9px] sm:text-[11px] font-bold text-white tracking-wide">
              +2.4K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Divider */}
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="text-[13px] sm:text-base font-extrabold text-white leading-none">4.9/5</span>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="#f59e0b" color="#f59e0b" />)}
              </div>
            </div>
            <div className="text-[9px] sm:text-[11px] text-white/50">from 1,200+ reviews</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════
   HERO
════════════════ */
function Hero({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }) {
  return (
    <section className="hero-section" style={{ position: 'relative' }}>
      {/* SideRays background */}
      <div className="siderays-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2.8}
          spread={2.5}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.4}
          opacity={1}
        />
      </div>

      {/* LaserFlow beam — same style as TradifiveAI page */}
      <div className="hidden md:block" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <LaserFlow
          horizontalBeamOffset={0.72}
          verticalBeamOffset={-0.04}
          color="#818cf8"
          horizontalSizing={0.10}
          verticalSizing={1.15}
          wispDensity={0.8}
          wispSpeed={14}
          wispIntensity={4}
          flowSpeed={0.3}
          flowStrength={0.22}
          fogIntensity={0.5}
          fogScale={0.28}
          fogFallSpeed={0.55}
          decay={1.1}
          falloffStart={1.2}
        />
      </div>

      <PremiumBackground />

      <div className="hero-container">
        <div className="hero-grid">

          {/* LEFT: Content */}
          <div className="hero-content-left" style={{ width: "100%", maxWidth: 640, marginTop: "60px" }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="hero-badge" style={{ display: "inline-flex", width: "fit-content", alignItems: "center", gap: 8, background: "#171717", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "6px 16px 6px 8px", borderRadius: "100px", marginBottom: 32, backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "rgba(99,102,241,0.2)" }}><div className="pulse-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "#818cf8" }} /></div>
              <span className="hero-badge-text" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.5px" }}>AI-Powered Trading Ecosystem</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="hero-title"
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.04em", marginTop: -8, marginBottom: 20, color: "#fff" }}
            >
              <BlurText
                text={"The Ultimate AI Ecosystem\nfor Modern Traders."}
                gradient={["#ffffff", "#3b82f6"]}
              />
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hero-desc"
              style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 540, marginBottom: 40, fontWeight: 400 }}
            >
              Tradifive is an AI-powered trading ecosystem that enforces risk rules, builds discipline, and tracks performance — so traders stop blowing accounts and start trading like professionals.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-cta-group"
              style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32, width: "100%" }}
            >
              <motion.button
                onClick={onStart}
                className="btn-glow-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free <ArrowRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => {
                  const el = document.getElementById("features") || document.getElementById("how-it-works") || document.getElementById("problem");
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  } else {
                    onSignIn();
                  }
                }}
                className="btn-ghost"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Trust Signals (Custom Layout) */}
            <HeroTrustSignals />


          </div>

          {/* RIGHT: 3D Dashboard */}
          <div className="hero-right" style={{ position: "relative", perspective: 1200, transform: "scale(1) translateY(12px)" }}>
            {/* Glow removed by request */}
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   PLATFORM PILLARS TICKER
════════════════ */
const CORE_FEATURES = [
  { n: "Social Trading Feed", c: "#3b82f6" },
  { n: "Live Trading Competitions", c: "#7c3aed" },
  { n: "Institutional Risk Guard", c: "#3b82f6" },
  { n: "AI Trade Journal", c: "#10b981" },
  { n: "24-Hour Trading Stories", c: "#7c3aed" },
  { n: "Real-Time Leaderboards", c: "#3b82f6" },
  { n: "Multi-Broker MT5 Bridge", c: "#10b981" },
  { n: "Verified Performance Tracking", c: "#7c3aed" },
];
function PlatformPillars() {
  return (
    <section className="pillar-section" style={{ backgroundColor: "transparent", padding: "44px 0 24px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 3 }}>
        <p className="pillar-title">EVERYTHING A SERIOUS TRADER NEEDS — <br className="show-sm" />IN ONE PLATFORM</p>
      </div>
      <div className="pillar-mask">
        <div className="br-track">
          {[...CORE_FEATURES, ...CORE_FEATURES].map((b, i) => (
            <div key={i} className="br-chip">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: b.c, boxShadow: `0 0 8px ${b.c}` }} />
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
    <section id="problem" style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }} className="problem-grid">

        {/* Centered Text and Compact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          <div style={{ marginBottom: 20 }}>
            <span style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>WHY TRADIFIVE?</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 48 }}>
            <BlurText
              lines={[
                { text: "Trading Is More Than Charts.", gradient: ["#ffffff", "#3b82f6"] },
                { text: "It's Psychology & Discipline.", style: { color: "rgba(255,255,255,0.35)", fontSize: "clamp(18px, 2.5vw, 28px)" } }
              ]}
            />
          </h2>

          <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", textAlign: "left" }}>
            <AgentBentoGrid />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ════════════════
   HOW IT WORKS
════════════════ */
function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const [dim, setDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const ob = new ResizeObserver(entries => {
      if (entries[0]) setDim({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
    });
    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, []);

  const STEPS = [
    {
      num: "01",
      icon: <Users size={26} strokeWidth={1.8} />,
      color: "#6366f1", colorBg: "rgba(99,102,241,0.1)", colorBorder: "rgba(99,102,241,0.25)",
      title: "Create Your Account",
      desc: "Start your trading journey with Tradifive. Set up your profile, customize your experience, and unlock access to the complete trading ecosystem.",
      tag: "Get Started",
      side: "left"
    },
    {
      num: "02",
      icon: <Layers size={26} strokeWidth={1.8} />,
      color: "#10b981", colorBg: "rgba(16,185,129,0.1)", colorBorder: "rgba(16,185,129,0.25)",
      title: "Connect Your Broker",
      desc: "Link any MT5 broker securely. Our bridge technology ensures zero-latency execution while keeping your funds completely secure on your broker's end.",
      tag: "MT5 Integration",
      side: "right"
    },
    {
      num: "03",
      icon: <ShieldCheck size={26} strokeWidth={1.8} />,
      color: "#f59e0b", colorBg: "rgba(245,158,11,0.1)", colorBorder: "rgba(245,158,11,0.25)",
      title: "Activate Risk Guard",
      desc: "Set your daily loss limits and maximum trades. Once your rules are breached, Tradifive automatically locks your account for the day to prevent revenge trading.",
      tag: "AI Protected",
      side: "left"
    },
    {
      num: "04",
      icon: <Globe size={26} strokeWidth={1.8} />,
      color: "#ec4899", colorBg: "rgba(236,72,153,0.1)", colorBorder: "rgba(236,72,153,0.25)",
      title: "Join Community & Creators",
      desc: "Follow verified traders, join public or private channels, share ideas, learn from creators, and grow alongside a community of traders.",
      tag: "Start Growing",
      side: "right"
    },
  ];

  // Calculate dynamic responsive SVG path for the "crazy" snaking line
  const { w, h } = dim;
  let pathString = "";
  if (w > 0 && h > 0) {
    const isMobile = w < 768;
    const cx = w / 2;

    if (isMobile) {
      const step = h / 4;
      pathString = `M ${cx} 0 `;
      pathString += `C ${cx} ${step * 0.1}, 15 ${step * 0.2}, 15 ${step * 0.5} `;
      pathString += `S 45 ${step * 1.0}, 45 ${step * 1.5} `;
      pathString += `S 15 ${step * 2.0}, 15 ${step * 2.5} `;
      pathString += `S 45 ${step * 3.0}, 45 ${step * 3.5} `;
      pathString += `S ${cx} ${h * 0.9}, ${cx} ${h}`;
    } else {
      const lx = w * 0.25; // 25% from left (center of left box)
      const rx = w * 0.75; // 75% from left (center of right box)
      const stepH = h / 4;

      // Start at top center
      pathString = `M ${cx} 0 `;

      // Curve to Box 1 (Left)
      pathString += `C ${cx} ${stepH * 0.2}, ${lx} ${stepH * 0.1}, ${lx} ${stepH * 0.5} `;

      // Curve to Box 2 (Right)
      pathString += `S ${rx} ${stepH * 0.8}, ${rx} ${stepH * 1.5} `;

      // Curve to Box 3 (Left)
      pathString += `S ${lx} ${stepH * 1.8}, ${lx} ${stepH * 2.5} `;

      // Curve to Box 4 (Right)
      pathString += `S ${rx} ${stepH * 2.8}, ${rx} ${stepH * 3.5} `;

      // Curve to bottom center
      pathString += `S ${cx} ${h * 0.95}, ${cx} ${h}`;
    }
  }

  return (
    <section id="how-it-works" style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 90 }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: "inline-block", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "6px 18px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24 }}
          >
            THE TRADIFIVE JOURNEY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}
          >
            <span style={{ background: "linear-gradient(to right, #ffffff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              From Beginner to Consistent Trader<br />
              In Four Simple Steps.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Everything you need — learning, trading, discipline, AI guidance, and community — in one ecosystem.
          </motion.p>
        </div>

        {/* 3D Crazy Timeline */}
        <div ref={containerRef} style={{ position: "relative", padding: "40px 0" }}>

          {/* Animated Winding SVG Line */}
          {w > 0 && h > 0 && (
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
              <path d={pathString} stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
              <motion.path
                d={pathString}
                stroke="url(#gradient)"
                strokeWidth="4"
                fill="none"
                style={{ pathLength: scrollYProgress }}
                strokeLinecap="round"
                filter="drop-shadow(0 0 12px rgba(99,102,241,0.8))"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="33%" stopColor="#10b981" />
                  <stop offset="66%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
            {STEPS.map((step, i) => {
              const isRight = step.side === "right";
              const isMobile = w < 768;
              return (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: isMobile ? "flex-end" : (isRight ? "flex-end" : "flex-start"),
                  position: "relative",
                  zIndex: 2,
                  paddingLeft: isMobile ? 60 : 0
                }}>

                  {/* Floating 3D Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 60, rotateY: isMobile ? 0 : (isRight ? -30 : 30), scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    whileHover={{ y: -10, rotateY: isMobile ? 0 : (isRight ? 5 : -5), rotateX: 5, scale: 1.05 }}
                    style={{
                      perspective: 1200,
                      width: "100%",
                      maxWidth: isMobile ? "100%" : 400,
                      background: "#121214", borderRadius: 24, padding: isMobile ? 20 : 32,
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5), 0 0 40px ${step.colorBg}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, marginBottom: isMobile ? 14 : 20 }}>
                      <div style={{
                        width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, borderRadius: isMobile ? 14 : 18,
                        background: "#171717",
                        border: `1.5px solid ${step.colorBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: step.color,
                        boxShadow: `0 0 20px ${step.colorBg}`,
                      }}>
                        {step.icon}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: 2 }}>STEP {step.num}</span>
                        <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "#fff", marginTop: 4 }}>{step.title}</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontWeight: 400 }}>{step.desc}</p>

                    <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, boxShadow: `0 0 10px ${step.color}` }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{step.tag}</span>
                    </div>
                  </motion.div>

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
   PLATFORM CAPABILITIES
════════════════ */
const CAPABILITIES = [
  {
    id: "01", tag: "RISK GUARD", title: "Autonomous Risk Protection",
    desc: "Set daily loss limits, max drawdown rules, and trading restrictions. Tradifive automatically protects your capital and enforces discipline.",
    m: "0.1s", mt: "Protection Speed", icon: Shield, color: "#7c3aed"
  },
  {
    id: "02", tag: "AUTO-SYNC JOURNAL", title: "Smart Trade Journal",
    desc: "Every trade is automatically imported, analyzed, and organized. Discover patterns, mistakes, and opportunities without manual journaling.",
    m: "100%", mt: "Automated", icon: Layers, color: "#3b82f6"
  },
  {
    id: "03", tag: "COMMUNITY & CHANNELS", title: "Verified Trading Network",
    desc: "Join public and private channels, follow creators, chat with traders, and learn from verified performance.",
    m: "24/7", mt: "Active Community", icon: Users, color: "#10b981"
  },
  {
    id: "04", tag: "AI COACH", title: "Personal Trading Mentor",
    desc: "Get personalized feedback, psychology coaching, trade reviews, and actionable insights based on your trading behavior.",
    m: "24/7", mt: "AI Support", icon: Zap, color: "#f59e0b"
  },
  {
    id: "05", tag: "CREATOR HUB", title: "Monetize Your Expertise",
    desc: "Launch premium channels, grow your audience, share signals, teach strategies, and earn from your trading knowledge.",
    m: "Creator", mt: "Earnings", icon: Trophy, color: "#ec4899"
  },
  {
    id: "06", tag: "TRADING DASHBOARD", title: "All Your Trading Data",
    desc: "Monitor performance, analytics, broker accounts, risk metrics, and growth from one powerful dashboard.",
    m: "Real", mt: "Time Analytics", icon: TrendingUp, color: "#3b82f6"
  }
];

function Features() {
  const r1 = useReveal(), r2 = useReveal();
  return (
    <section id="capabilities" style={{ backgroundColor: "transparent", padding: "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={r1} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>THE TRADIFIVE ECOSYSTEM</span>
          </div>
          <h2 className="capabilities-title" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
            <BlurText
              lines={[
                { text: "Everything You Need To", gradient: ["#ffffff", "#3b82f6"] },
                { text: "Trade, Learn & Grow.", gradient: ["#ffffff", "#3b82f6"] }
              ]}
            />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            AI-powered tools, verified traders, risk management, social communities, and performance analytics—all in one platform.
          </motion.p>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }} className="capabilities-grid-wrapper">
          <AgentBentoGrid />
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   APP SHOWCASE
════════════════ */
function PhoneMockup({ screen }: { screen: any }) {
  return (
    <div style={{
      width: 270, height: 540, borderRadius: 44,
      background: "linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
      border: "1.5px solid rgba(255,255,255,0.12)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 1px rgba(255,255,255,0.1)",
      position: "relative",
      overflow: "hidden",
      backdropFilter: "blur(10px)",
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 80, height: 22, background: "#000", borderRadius: 20, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ width: 36, height: 4, borderRadius: 4, background: "#111" }} />
      </div>

      {/* Status bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 22px 6px", zIndex: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 1 }}>{[1, 2, 3, 4].map(b => <div key={b} style={{ width: 3, height: 5 + b * 2, background: b < 4 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", borderRadius: 1 }} />)}</div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M1.5 8.5C5.5 4.5 18.5 4.5 22.5 8.5L20.5 10.5C17.5 7.5 6.5 7.5 3.5 10.5L1.5 8.5Z" /><path d="M5.5 12.5C8.5 9.5 15.5 9.5 18.5 12.5L16.5 14.5C14.5 12.5 9.5 12.5 7.5 14.5L5.5 12.5Z" /><circle cx="12" cy="18" r="2" /></svg>
          <div style={{ width: 18, height: 8, borderRadius: 2, position: "relative", display: "flex", alignItems: "center", padding: "0 1px" }}>
            <div style={{ width: "70%", height: "60%", background: "#10b981", borderRadius: 1 }} />
            <div style={{ position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)", width: 2, height: 5, background: "rgba(255,255,255,0.3)", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div style={{ position: "absolute", inset: 0, background: screen.bg, display: "flex", flexDirection: "column", paddingTop: 44 }}>
        {screen.content}
      </div>

      {/* Screen tint overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />

      {/* Home bar */}
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 80, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.25)" }} />
    </div>
  );
}

/* ════════════════
   WHY TRADIFIVE
════════════════ */
function WhyTradifive() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only load the heavy Spline scene on desktop after mount — never on mobile
    if (window.innerWidth >= 768) {
      setIsDesktop(true);
    }
  }, []);

  return (
    <section id="why" style={{ backgroundColor: "transparent", position: "relative", height: "100vh", minHeight: 800, width: "100%", display: "flex", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
          {isDesktop ? (
            <Suspense fallback={<div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #121214 0%, #1a1a2e 100%)' }} />}>
              <SplineLazy scene="/scene.splinecode" style={{ width: '100%', height: '100%' }} />
            </Suspense>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #121214 0%, #1a1a2e 100%)' }} />
          )}
        </div>
      </div>

      <div style={{ position: "absolute", top: 48, left: 48, zIndex: 10, pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(to right, #3b82f6, #60a5fa)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>T</span>
          </div>
          <span style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Tradi<span style={{ color: "#3b82f6" }}>five</span></span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>
          AI-Powered Trading, Unleashed.
        </p>
      </div>

      <div style={{ position: "absolute", bottom: 48, left: 48, zIndex: 10, pointerEvents: "none" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>
          Built by a <span style={{ color: "#fff", fontWeight: 900 }}>Trader</span>, for <span style={{ color: "#fff", fontWeight: 900 }}>Traders</span>
        </p>
      </div>

      {/* Mask to hide SPLINE watermark */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 160, height: 48, background: "#000", zIndex: 20, pointerEvents: "none", boxShadow: "-20px -10px 40px rgba(0,0,0,0.8)" }} />
    </section>
  );
}

/* ════════════════
   PRICING
════════════════ */
function Pricing({ onStart }: { onStart: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite" | "enterprise">("pro");
  return (
    <section id="pricing" style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>PRICING & MEMBERSHIP</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 14, lineHeight: 1.1 }}>
            <BlurText
              lines={[
                { text: "Start Free." },
                { text: "Scale When You're Ready." }
              ]}
              gradient={["#ffffff", "#3b82f6"]}
            />
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto", fontWeight: 500 }}>Everything you need to become a disciplined and profitable trader.</p>
        </div>

        <div className="relative z-10 w-full">
          <PricingCards
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onUpgradeClick={onStart}
            isStandalone={true}
          />
        </div>

        <div ref={useReveal()} className="rv d4" style={{ textAlign: "center", marginTop: 52, opacity: 0.35 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Instant activation · Secure MT5 connection · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   SOCIAL PROOF
════════════════ */
const TESTIS = [
  { name: "Priya Mehra", role: "Day Trader, Pune", init: "PM", grad: "linear-gradient(135deg,#3b82f6,#1d4ed8)", stars: 5, text: "The social feed changed my trading completely. Seeing real verified P&Ls from other traders keeps me accountable. My win rate jumped from 42% to 67% in 2 months." },
  { name: "Rahul Sharma", role: "IIT Delhi Graduate", init: "RS", grad: "linear-gradient(135deg,#7c3aed,#4c1d95)", stars: 5, text: "Risk Guard is the real deal. It literally stopped me from revenge trading after a bad morning session. Saved my account more than once." },
  { name: "Kavita Trivedi", role: "Swing Trader, Mumbai", init: "KT", grad: "linear-gradient(135deg,#10b981,#065f46)", stars: 5, text: "Love the trading competitions. Won the November contest and got a funded account. The leaderboard pushes you to perform better every single day." },
  { name: "Arjun Das", role: "Software Eng, Blr", init: "AD", grad: "linear-gradient(135deg,#f59e0b,#b45309)", stars: 5, text: "Auto-Sync Journal is a game changer. No more manual logging. The AI coach spotted that I was overleveraging on Mondays — something I never noticed." },
  { name: "Sneha Kapoor", role: "Forex Trader, Hyderabad", init: "SK", grad: "linear-gradient(135deg,#ec4899,#9d174d)", stars: 4, text: "Following top traders on the feed and seeing their actual trade setups has taught me more than any YouTube course. This is how trading education should work." },
  { name: "Vikram Singh", role: "Business Owner, Delhi", init: "VS", grad: "linear-gradient(135deg,#3b82f6,#7c3aed)", stars: 5, text: "The community here is different. Everyone has their MT5 connected so you know the results are real. No fake gurus, no screenshot traders." },
  { name: "Ananya Iyer", role: "Options Trader, Chennai", init: "AI", grad: "linear-gradient(135deg,#10b981,#3b82f6)", stars: 5, text: "Set my max daily loss and walked away. Tradifive enforced my rules better than I ever could myself. My discipline improved massively in just 6 weeks." },
  { name: "Zaid Khan", role: "Crypto Trader, Dubai", init: "ZK", grad: "linear-gradient(135deg,#f59e0b,#ec4899)", stars: 4, text: "Joined a competition for the first time last month. Finished 8th place. The competitive element makes you sharper. Already climbing the leaderboard." },
  { name: "Meera Nair", role: "Banker turned Trader, Kochi", init: "MN", grad: "linear-gradient(135deg,#7c3aed,#10b981)", stars: 5, text: "Finally a platform where I can show my real track record. My verified profile has attracted followers who genuinely want to learn from my strategy." },
];

const STATS = [
  { val: "50M+", label: "Global Retail Traders", color: "#3b82f6" },
  { val: "3-in-1", label: "Social + Trade + Risk", color: "#7c3aed" },
  { val: "24h", label: "Trading Stories", color: "#10b981" },
  { val: "Live", label: "MT5 Integration", color: "#3b82f6" },
];

function Social() {
  return (
    <section id="wall-of-fame" style={{ backgroundColor: "transparent", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", padding: "0 28px" }}>
        <div ref={useReveal()} className="rv social-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 80 }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              className="feat-card-premium social-stat-card"
              style={{
                textAlign: "center",
                padding: "22px",
                cursor: "pointer",
                background: "#171717",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                borderRadius: 20
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <div className="social-stat-label" style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
              <div className="social-stat-val" style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>From the Community</span>
          </div>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 14, lineHeight: 1.1 }}>
            <BlurText
              text="Traders who chose to grow together."
              gradient={["#ffffff", "#3b82f6"]}
            />
          </h2>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)", maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}>
        {/* CSS animation replaces Framer Motion JS-driven scroll — GPU-composited, lower CPU overhead on mobile */}
        <div className="testimonials-track" style={{ display: "flex", gap: 20, padding: "16px 0" }}>
          {[...TESTIS, ...TESTIS].map((t, i) => (
            <div key={i} className="feat-card-premium testimonial-card" style={{ width: 320, padding: "22px", flexShrink: 0, borderRadius: 20, background: "#171717", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="testimonial-stars" style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {Array(t.stars).fill(0).map((_, j) => (<svg key={j} width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>))}
                {Array(5 - t.stars).fill(0).map((_, j) => (<svg key={j + t.stars} width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>))}
              </div>
              <p className="testimonial-text" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20, fontWeight: 400 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="testimonial-avatar" style={{ width: 36, height: 36, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{t.init}</div>
                <div>
                  <div className="testimonial-name" style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                  <div className="testimonial-role" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{t.role}</div>
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
   FAQ
════════════════ */
const FAQS = [
  { icon: "lock", q: "How is my MT5 connection secured?", a: "Tradifive connects via MetaAPI with read/execute permissions only — we can never withdraw funds or change account settings. All data is encrypted with TLS 1.3 in transit and AES-256 at rest." },
  { icon: "toggle", q: "Is my trading performance truly verified?", a: "Yes. When you connect your MT5 broker account, your trade history and live positions are pulled directly from the broker. Your public profile shows real, verifiable performance — not screenshots." },
  { icon: "wallet", q: "What is the minimum account size?", a: "You can start completely free with any demo account. For real-money trading, we recommend having at least ₹25,000 to allow the risk engine to position-size effectively." },
  { icon: "globe", q: "Which brokers are supported?", a: "Tradifive works with any MT5-compatible broker — IC Markets, Pepperstone, FP Markets, XM, Exness, Tickmill, Vantage, BlackBull, and 40+ more worldwide." },
  { icon: "wifi", q: "How do competitions work?", a: "Monthly competitions run on real or demo MT5 accounts. You enroll, trade during the competition period, and your P&L is tracked live on the public leaderboard. Top performers win cash prizes and funded accounts." },
  { icon: "cpu", q: "What is the AI Coach?", a: "The AI Coach analyzes your auto-synced trade journal, identifies patterns in your performance (e.g. overtrading on Mondays, poor risk-reward on news events), and gives personalized, actionable recommendations." },
];

function FAQItem({ f, i, open, setOpen }: { f: any, i: number, open: number | null, setOpen: (i: number | null) => void }) {
  const revealRef = useReveal();

  return (
    <div
      ref={revealRef}
      className={`rv d${Math.min(i + 1, 4)} feat-card-premium`}
      style={{
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.3s",
        background: "#171717",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
        borderRadius: 20
      }}
      onClick={() => setOpen(open === i ? null : i)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{f.q}</h4>
        </div>
        <div style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.4s", flexShrink: 0, marginLeft: 12 }}>
          <Ic n="chev" s={13} c="rgba(255,255,255,0.25)" sw={3} />
        </div>
      </div>
      <AnimatePresence>
        {open === i && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontWeight: 400 }}>{f.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ backgroundColor: "transparent", padding: "100px 28px", position: "relative" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>FAQ</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            <BlurText
              text="Frequently Asked Questions"
              gradient={["#ffffff", "#3b82f6"]}
            />
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 12, fontWeight: 500 }}>Everything you need to know about Tradifive.</p>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {FAQS.map((f, i) => (
            <FAQItem key={i} f={f} i={i} open={open} setOpen={setOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}


/* ════════════════
   COMMUNITY NETWORK
════════════════ */
function CommunityNetwork({ onStart }: { onStart: () => void }) {
  // Orbital layout: arranged in 3 concentric rings around center
  const innerRing = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    angle: (i / 6) * 360,
    r: 140,
    avatar: Math.floor(Math.random() * 15) + 1,
    gender: i % 2 === 0 ? 'men' : 'women'
  }));
  const outerRing = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 7,
    angle: (i / 6) * 360 + 30,
    r: 260,
    avatar: Math.floor(Math.random() * 15) + 1,
    gender: i % 2 === 0 ? 'men' : 'women'
  }));
  const allNodes = [...innerRing, ...outerRing];
  const cx = 340, cy = 300;
  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle - 90) * Math.PI / 180),
    y: cy + r * Math.sin((angle - 90) * Math.PI / 180),
  });

  const stats = [
    { value: "12,400+", label: "Active Traders", color: "#3b82f6" },
    { value: "$2.8M", label: "Prizes Awarded", color: "#7c3aed" },
    { value: "94%", label: "Satisfaction Rate", color: "#10b981" },
    { value: "47", label: "Countries", color: "#3b82f6" },
  ];

  const benefits = [
    {
      title: "Pulse Feed",
      desc: "Share verified trade setups, profit milestones, and market insights with your followers in real time.",
      color: "#3b82f6"
    },
    {
      title: "Signal Channels",
      desc: "Subscribe to elite trader broadcast rooms and get live signals pushed directly to your dashboard.",
      color: "#7c3aed"
    },
    {
      title: "Direct Messages",
      desc: "Chat 1-on-1 with mentors, trading partners, or support — all inside the platform without leaving your workspace.",
      color: "#10b981"
    },
    {
      title: "Webinar Rooms",
      desc: "Join live educational sessions hosted by top-tier verified traders. Learn strategies, Q&A, and grow your edge.",
      color: "#3b82f6"
    },
  ];

  return (
    <section style={{ padding: "120px 20px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 100, position: "relative" }}>
          {/* Soft Background Glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 800, height: 400, background: "radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
            {/* Premium Pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#171717", padding: "6px 16px", borderRadius: 100, marginBottom: 24, backdropFilter: "blur(10px)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 10px #6366f1" }} />
              <span style={{ color: "#a5b4fc", fontWeight: 600, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Global Network</span>
            </div>

            <h2 className="community-title" style={{ fontSize: "clamp(24px, 6vw, 56px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.04em" }}>
              <BlurText
                lines={[
                  { text: "Thousands of traders are using", gradient: ["#ffffff", "#3b82f6"] },
                  { text: "TradiFive to learn, collab & grow.", gradient: ["#a855f7", "#6366f1"] }
                ]}
              />
            </h2>

            <p className="community-desc" style={{ fontSize: "clamp(15px, 4vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 40px", fontWeight: 400 }}>
              Join a vibrant global community. Share setups, learn from live webinars, and connect directly with the world's best verified traders.
            </p>

            <button onClick={onStart} style={{ background: "#fff", color: "#000", padding: "14px 32px", borderRadius: 100, fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 0 40px rgba(255,255,255,0.15)" }}>
              Join the Community <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="community-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 80, maxWidth: 900, margin: "0 auto 80px" }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="feat-card-premium community-stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                textAlign: "center",
                padding: "28px 20px",
                cursor: "pointer",
                background: "#171717",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                borderRadius: 20
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <div className="community-stat-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
              <div className="community-stat-value" style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Two-column: orbital network + benefits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="community-grid">
          {/* Orbital Network SVG */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "680/600" }}>
            <svg viewBox="0 0 680 600" style={{ width: "100%", height: "100%" }}>
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </radialGradient>
                {/* animated dash pattern */}
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0)" />
                  <stop offset="50%" stopColor="rgba(99,102,241,0.5)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </linearGradient>
              </defs>

              {/* Orbit rings */}
              <motion.circle cx={cx} cy={cy} r={140} fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="4 8" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />
              <motion.circle cx={cx} cy={cy} r={260} fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="4 12" animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />

              {/* Center glow */}
              <motion.circle cx={cx} cy={cy} r={90} fill="url(#centerGlow)" animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
              <circle cx={cx} cy={cy} r={48} fill="rgba(10,10,20,0.95)" stroke="rgba(168,85,247,0.6)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 15px rgba(168,85,247,0.5))" }} />

              {/* Spoke lines: inner ring → center */}
              {innerRing.map(n => {
                const p = toXY(n.angle, n.r);
                return (
                  <line key={`spoke-${n.id}`}
                    x1={cx} y1={cy} x2={p.x} y2={p.y}
                    stroke="rgba(168,85,247,0.25)" strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Connecting lines: outer → nearest inner */}
              {outerRing.map(n => {
                const outer = toXY(n.angle, n.r);
                const nearestInner = innerRing.reduce((best, inn) => {
                  const diff = Math.abs(((inn.angle - n.angle) + 360) % 360);
                  const prevDiff = Math.abs(((best.angle - n.angle) + 360) % 360);
                  return diff < prevDiff ? inn : best;
                });
                const inner = toXY(nearestInner.angle, nearestInner.r);
                return (
                  <line key={`outer-conn-${n.id}`}
                    x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                    stroke="rgba(99,102,241,0.2)" strokeWidth="1.5"
                  />
                );
              })}

              {/* Flowing data dots: inner to center */}
              {innerRing.map((n, i) => {
                const start = toXY(n.angle, n.r - 20);
                return (
                  <motion.circle
                    key={`flow-inner-${n.id}`}
                    r="3.5"
                    fill="#a855f7"
                    initial={{ cx: start.x, cy: start.y, opacity: 0 }}
                    animate={{ cx: [start.x, cx], cy: [start.y, cy], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 5px #a855f7)" }}
                  />
                );
              })}

              {/* Flowing data dots: outer to inner */}
              {outerRing.map((n, i) => {
                const start = toXY(n.angle, n.r - 20);
                const nearestInner = innerRing.reduce((best, inn) => {
                  const diff = Math.abs(((inn.angle - n.angle) + 360) % 360);
                  const prevDiff = Math.abs(((best.angle - n.angle) + 360) % 360);
                  return diff < prevDiff ? inn : best;
                });
                const end = toXY(nearestInner.angle, nearestInner.r + 20);
                return (
                  <motion.circle
                    key={`flow-outer-${n.id}`}
                    r="2.5"
                    fill="#3b82f6"
                    initial={{ cx: start.x, cy: start.y, opacity: 0 }}
                    animate={{ cx: [start.x, end.x], cy: [start.y, end.y], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 + 0.5, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
                  />
                );
              })}

              {/* Outer ring avatars */}
              {allNodes.map(n => {
                const p = toXY(n.angle, n.r);
                const size = n.r === 140 ? 44 : 36;
                return (
                  <motion.g key={n.id} animate={{ y: [-5, 5, -5] }} transition={{ duration: 4 + (n.id % 3), repeat: Infinity, ease: "easeInOut", delay: n.id * 0.2 }}>
                    <motion.circle
                      cx={p.x} cy={p.y} r={size + 6}
                      fill={`rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.08)`}
                      stroke={`rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.4)`}
                      strokeWidth="1.5"
                      initial={{ opacity: 0.5, scale: 0.95 }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 3 + (n.id % 2), repeat: Infinity, delay: n.id * 0.3 }}
                      style={{ filter: `drop-shadow(0 0 10px rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.3))` }}
                    />
                    <clipPath id={`clip-${n.id}`}>
                      <circle cx={p.x} cy={p.y} r={size} />
                    </clipPath>
                    <image
                      href={`/avatars/${n.gender}_${n.avatar}.jpg`}
                      x={p.x - size} y={p.y - size}
                      width={size * 2} height={size * 2}
                      clipPath={`url(#clip-${n.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle cx={p.x} cy={p.y} r={size} fill="none" stroke={`rgba(${n.r === 140 ? '168,85,247' : '99,102,241'}, 0.6)`} strokeWidth="2" />
                  </motion.g>
                );
              })}

              {/* Center logo */}
              <image
                href="/favicon.png"
                x={cx - 28} y={cy - 28}
                width="56" height="56"
                style={{ filter: "brightness(1.5)" }}
              />
            </svg>
          </div>

          {/* Community benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                className="feat-card-premium"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: "block",
                  padding: "28px",
                  cursor: "pointer",
                  background: "#171717",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                  borderRadius: 20
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h3 className="problem-card-title" style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{b.title}</h3>
                </div>
                <p className="problem-card-desc" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontWeight: 400 }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .community-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ════════════════
   CTA
════════════════ */
function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
          <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>START YOUR JOURNEY</span>
        </div>
        <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 18 }}>
          <BlurText
            lines={[
              { text: "Become The Trader" },
              { text: "You've Always Wanted To Be." }
            ]}
            gradient={["#ffffff", "#3b82f6"]}
          />
        </h2>
        <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 40, lineHeight: 1.65, fontWeight: 500, maxWidth: 580, margin: "0 auto 40px" }}>
          Join Tradifive and get access to AI coaching, risk management, auto-sync journaling, verified traders, creator communities, and everything you need to grow consistently.
        </p>

        <div ref={useReveal()} className="rv d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
          <motion.button onClick={onStart} className="btn-glow-primary" whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} style={{ padding: "15px 40px", fontSize: 15, fontWeight: 800 }}>
            Start Free Today →
          </motion.button>
          <motion.button onClick={() => { const el = document.getElementById("capabilities"); el?.scrollIntoView({ behavior: "smooth" }); }} className="btn-ghost" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} style={{ padding: "15px 40px", fontSize: 15 }}>
            Explore Tradifive →
          </motion.button>
        </div>
        <p ref={useReveal()} className="rv d4" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.22)", fontWeight: 600, letterSpacing: 0.5 }}>No Credit Card Required • Free Community Access • Cancel Anytime</p>
      </div>
    </section>
  );
}

function Sep() {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "12px 0" }}>
      <div style={{
        width: "80%",
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 80%, transparent)"
      }} />
    </div>
  );
}

/* ════════════════
   MOBILE BLOCKER — shows download prompt instead of blank screen
════════════════ */
function MobileView({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 999999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
        <img src="/favicon.png" style={{ height: 40, width: "auto" }} alt="Icon" />
        <img src="/Dark mode logo with white.png" style={{ height: 34, width: "auto" }} alt="Tradifive" />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 14, color: "#fff" }}><span style={{ background: "linear-gradient(to right, #ffffff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tradifive Mobile App</span></h2>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 340, marginBottom: 36 }}>
        The full Tradifive experience is available on desktop. For mobile, download our app for the best experience.
      </p>
      <button onClick={onStart} style={{ padding: "14px 36px", background: "#3b82f6", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 100, cursor: "pointer", marginBottom: 14, width: "100%", maxWidth: 300 }}>
        🚀 Sign Up Free
      </button>
      <a href="/download" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 600 }}>Download Mobile App →</a>
    </div>
  );
}

/* ════════════════
   WAITLIST MODAL
════════════════ */


/* ════════════════
   ROOT
════════════════ */
export default function TradiFive() {
  const [isMobile, setIsMobile] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = () => {
      const isWidthMobile = window.innerWidth < 768;
      const isUAMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isWidthMobile || isUAMobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // Preload the heavy login page chunk in the background 1 second after landing page mount
    const timer = setTimeout(() => {
      import("./Login").catch(err => console.warn("Preload Login failed:", err));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle smooth scroll on cross-page navigation with hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const handleSignUp = () => setShowWaitlist(true);
  const handleStart = handleSignUp;

  // Mobile view is allowed to see the landing page, so we don't block.

  return (
    <div style={{ background: "transparent", color: "#fff", minHeight: "100vh", position: "relative" }}>
      <PublicNavbar onSignIn={handleSignIn} onSignUp={handleSignUp} onDownloadClick={() => navigate('/download')} />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero onStart={handleStart} onSignIn={handleSignIn} />
        <PlatformPillars />
        <Sep />
        <Problem />
        <Sep />
        <HowItWorks />
        <Sep />
        <DeepDiveFeatures />
        <Sep />
        <CommunityNetwork onStart={handleStart} />
        <Sep />
        <Social />
        <Sep />
        <Pricing onStart={handleStart} />
        <Sep />
        <FAQ />
        <Sep />
        <CTA onStart={handleStart} />
      </main>

      <PublicFooter />

      {showWaitlist && (
        <WaitlistModal
          isOpen={showWaitlist}
          onClose={() => setShowWaitlist(false)}
        />
      )}
    </div>
  );
}
