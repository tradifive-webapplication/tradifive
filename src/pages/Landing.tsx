import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PricingCards } from "@/components/PricingCards";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { CheckCircle2, Lock, Shield, TrendingUp, Users, ArrowRight, Activity, Cpu, Play, Layers, X, Zap, Trophy, Star, Globe, MessageSquare, Radio, MessageCircle, GraduationCap, Sparkles, BookText, Crown, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import PremiumBackground from "../components/PremiumBackground";
import StarsBackground from "../components/StarsBackground";
import { toast } from "sonner";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

import { Ic } from "../components/Ic";
import Pattern from "../components/Pattern";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { FlipText } from "@/components/ui/flip-text";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";
import EcosystemDeepDive from "../components/EcosystemDeepDive";
import HeroDashboard from "../components/HeroDashboard";
import WhatIsTradifive from "../components/WhatIsTradifive";
import HowItWorks from "../components/HowItWorks";
import MentorComparison from "../components/MentorComparison";
import InstitutionalRoadmap from "../components/InstitutionalRoadmap";
// SideRays removed for clean white mode
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
/* ════════════════
   HERO TRUST SIGNALS
════════════════ */
function HeroTrustSignals() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", marginTop: 4 }}
    >
      {/* 4 Feature Items */}
      <div className="trust-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ color: "#2563eb" }}><Shield size={18} strokeWidth={2.2} /></div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Risk First</div>
          <div style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35 }}>AI risk guard protects your capital.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ color: "#f97316" }}><TrendingUp size={18} strokeWidth={2.2} /></div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Data Driven</div>
          <div style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35 }}>Advanced analytics for smarter trades.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ color: "#2563eb" }}><Activity size={18} strokeWidth={2.2} /></div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Lightning Fast</div>
          <div style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35 }}>Blazing fast execution with low latency.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ color: "#f97316" }}><Users size={18} strokeWidth={2.2} /></div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Built Together</div>
          <div style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35 }}>Join a transparent trader community.</div>
        </div>
      </div>

      {/* Social Proof Card */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 p-3 bg-white border border-slate-200 shadow-sm rounded-2xl w-full">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Trusted by traders worldwide</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex" }}>
              {["/avatars/men_1.jpg", "/avatars/women_1.jpg", "/avatars/men_2.jpg", "/avatars/women_2.jpg", "/nikil_avatar.jpg"].map((src, i) => (
                <div key={i} className="w-5 h-5 sm:w-[24px] sm:h-[24px]" style={{
                  borderRadius: "50%",
                  border: "2px solid #ffffff",
                  marginLeft: i === 0 ? 0 : -5,
                  overflow: "hidden",
                  zIndex: 5 - i,
                  position: "relative",
                  background: "#111"
                }}>
                  <img src={src} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                </div>
              ))}
            </div>
            <div className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px] sm:text-[10.5px] font-bold text-slate-700 tracking-wide">
              +2.4K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div style={{ width: 1, height: 26, background: "#e2e8f0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="text-[13px] sm:text-sm font-extrabold text-slate-900 leading-none">4.9/5</span>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3" fill="#f97316" color="#f97316" />)}
              </div>
            </div>
            <div className="text-[9px] sm:text-[10.5px] text-slate-500">from 1,200+ reviews</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════
   HERO WITH 3D DASHBOARD
════════════════ */
function Hero({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }) {
  return (
    <section 
      className="hero-section" 
      style={{ 
        position: "relative", 
        overflow: "hidden", 
        width: "100%", 
        paddingTop: "60px",
        paddingBottom: "40px",
        backgroundColor: "#ffffff"
      }}
    >
      {/* Radiant ambient glow */}
      <div 
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1200px",
          height: "600px",
          background: "radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.07) 0%, rgba(249,115,22,0.04) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div className="hero-container" style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "40px", alignItems: "center" }}>

          {/* LEFT: Content */}
          <div className="hero-content-left" style={{ width: "100%", maxWidth: 580 }}>
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 7, 
                background: "rgba(37,99,235,0.06)", 
                border: "1px solid rgba(37,99,235,0.18)", 
                padding: "4px 14px 4px 8px", 
                borderRadius: 100, 
                marginBottom: 20 
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "rgba(249,115,22,0.15)" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px #f97316" }} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb", letterSpacing: "0.5px" }}>
                MT5 RISK & DISCIPLINE TERMINAL
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ 
                fontSize: "clamp(30px, 4.2vw, 48px)", 
                fontWeight: 900, 
                lineHeight: 1.15, 
                letterSpacing: "-0.035em", 
                margin: "0 0 16px 0", 
                color: "#0f172a" 
              }}
            >
              Stop Blowing Accounts. <br />
              <span style={{ background: "linear-gradient(135deg, #2563eb 0%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Trade With Hard Risk Protection.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              style={{ 
                fontSize: "clamp(15px, 1.6vw, 17px)", 
                color: "#475569", 
                lineHeight: 1.55, 
                maxWidth: 540, 
                margin: "0 0 24px 0", 
                fontWeight: 400 
              }}
            >
              Tradifive connects directly to your MT5 broker to enforce hard daily loss limits, auto-journal every trade in real-time, and eliminate emotional revenge trading.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}
            >
              <button
                onClick={onStart}
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 18px rgba(37, 99, 235, 0.35)",
                  borderRadius: 100,
                  padding: "13px 30px",
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                  outline: "none",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(37, 99, 235, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(37, 99, 235, 0.35)";
                }}
              >
                <span>Start Free</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("what-is-tradifive") || document.getElementById("how-it-works");
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  } else {
                    onSignIn();
                  }
                }}
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 100,
                  padding: "12px 24px",
                  fontSize: 14.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.2s ease",
                  outline: "none",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.color = "#ea580c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#0f172a";
                }}
              >
                <span>How It Works</span>
              </button>
            </motion.div>

            {/* Feature Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)", padding: "4px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 600, color: "#0f172a" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                <span>Risk Guard: <strong style={{ color: "#0f172a" }}>Active (0.02s)</strong></span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)", padding: "4px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 600, color: "#0f172a" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 6px #2563eb" }} />
                <span>AI Journal: <strong style={{ color: "#0f172a" }}>Auto-Sync MT5</strong></span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.18)", padding: "4px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 600, color: "#0f172a" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px #f97316" }} />
                <span>FiAlgo Engine: <strong style={{ color: "#0f172a" }}>Gold M1</strong></span>
              </div>
            </div>

            {/* Trust Signals: 4 Features + Review strip */}
            <HeroTrustSignals />
          </div>

          {/* RIGHT: Live Interactive Dashboard (Image 1) */}
          <div className="hero-right" style={{ position: "relative", perspective: 1200 }}>
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
  { n: "Social Trading Feed", c: "#2563eb" },
  { n: "Live Trading Competitions", c: "#f97316" },
  { n: "Institutional Risk Guard", c: "#2563eb" },
  { n: "AI Trade Journal", c: "#f97316" },
  { n: "FiAlgo Engine", c: "#2563eb" },
  { n: "24-Hour Trading Stories", c: "#f97316" },
  { n: "Real-Time Leaderboards", c: "#2563eb" },
  { n: "Multi-Broker MT5 Bridge", c: "#f97316" },
  { n: "Verified Performance Tracking", c: "#2563eb" },
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
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", letterSpacing: "-0.2px" }}>{b.n}</span>
            </div>
          ))}
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
      flexShrink: 0 }}>
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
   PRICING
════════════════ */
function Pricing({ onStart }: { onStart: () => void }) {
  const navigate = useNavigate();
  const [pricingCategory, setPricingCategory] = useState<"autotrade" | "platform">("autotrade");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite">("pro");
  const [selectedFialgoPlan, setSelectedFialgoPlan] = useState<"three_years" | "profit_share">("three_years");
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(true);
  const [performanceExpanded, setPerformanceExpanded] = useState(false);
  const [comparisonTableExpanded, setComparisonTableExpanded] = useState(false);

  const threeYearFeatures = [
    { title: "0% Profit Share — Keep 100% of Profits", desc: "No weekly invoices, settlement days, or profit cuts. Every dollar made in your MT5 remains 100% yours.", highlighted: true },
    { title: "3-Year Hardware-Bound MT5 License Key", desc: "Fully verified license key bound to your live MT5 account with continuous encrypted server relay.", highlighted: true },
    { title: "FiAlgo V1 Institutional Gold Engine (.ex5)", desc: "Compiled institutional Expert Advisor optimized for Gold (XAUUSD) on M1 timeframe.", highlighted: false },
    { title: "All 8 Institutional Risk Protection Modules", desc: "Max loss locks, dynamic drawdown circuit breaker, real-time spread shield & equity trailing.", highlighted: false },
    { title: "Automated Economic News Calendar Shield", desc: "Auto-halts trading 30m before and after high-impact events (FOMC, CPI, NFP, Fed speaks).", highlighted: false },
    { title: "Guaranteed 50% Loyalty Renewal Discount", desc: "Renew after 3 years at ₹49,999 for another 3 years, or switch flexibly to profit share anytime.", highlighted: false },
    { title: "Priority 1-on-1 VPS & MT5 Setup Support", desc: "Direct engineering desk assistance for instant cloud VPS deployment and broker binding.", highlighted: false },
    { title: "100% Capital Custody in Your Own Broker", desc: "Trade on Exness, Vantage, or any regulated MT5 broker. Tradifive never touches your capital.", highlighted: false },
  ];

  const profitShareFeatures = [
    { title: "One-Time ₹10,000 Setup Fee", desc: "Affordable barrier to deploy the institutional engine, compile your build, and bind MT5.", highlighted: true },
    { title: "Weekly 50/50% Net Profit Share on Green Weeks", desc: "Keep 50% of verified net profits directly in your broker. 50% platform share invoiced weekly.", highlighted: true },
    { title: "₹0 Fee on Red or Flat Weeks", desc: "If trading finishes flat or in loss for the week, you owe exactly ₹0. No profit = zero fee.", highlighted: true },
    { title: "High-Water Mark / Loss Carry-Forward", desc: "Prior losses are carried forward. You NEVER pay a single rupee in fee until all past losses are recovered.", highlighted: true },
    { title: "Zero Broker Account Deductions", desc: "100% of your funds stay safe in your broker. Invoices are cleared externally via UPI/Bank transfer.", highlighted: false },
    { title: "FiAlgo V1 Institutional Gold Engine (.ex5)", desc: "Same battle-tested algorithmic engine running 8 risk management and spread safety modules.", highlighted: false },
    { title: "Automated Monday Audit Statements", desc: "Transparent trade-by-trade calculation breakdown generated every Monday with verified P&L.", highlighted: false },
    { title: "Continuous Free Strategy Updates", desc: "Receive all minor and major engine updates throughout your performance partnership.", highlighted: false },
  ];

  const comparisonRows = [
    { label: "Upfront License Fee", threeYears: "₹1,00,000 one-time", profitShare: "₹10,000 one-time" },
    { label: "License Term", threeYears: "3 Full Years (36 Months)", profitShare: "Continuous Weekly" },
    { label: "Profit Share %", threeYears: "0% — You Keep 100%", profitShare: "50/50% on Net Profit" },
    { label: "Fee on Red / Flat Weeks", threeYears: "₹0 (Zero Fees Ever)", profitShare: "₹0 (No Profit = No Fee)" },
    { label: "Loss Carry-Forward Protection", threeYears: "N/A (Keep 100% Profits)", profitShare: "Yes (Full High-Water Mark)" },
    { label: "Weekly Settlement Invoices", threeYears: "None — Zero Invoices", profitShare: "Every Monday (Green Weeks Only)" },
    { label: "Capital Location", threeYears: "100% In Your MT5 Broker", profitShare: "100% In Your MT5 Broker" },
    { label: "Broker Deductions", threeYears: "0% (Never Deducted)", profitShare: "0% (Never Deducted)" },
    { label: "MT5 Risk & News Modules", threeYears: "All 8 Active", profitShare: "All 8 Active" },
    { label: "3-Year Renewal Guarantee", threeYears: "50% Discount (₹49,999)", profitShare: "Continuous Partnership" },
  ];

  return (
    <section id="pricing" style={{ backgroundColor: "transparent", padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", position: "relative" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 16 }}>
            <span style={{
              background: "rgba(37, 99, 235, 0.08)",
              border: "1px solid rgba(37, 99, 235, 0.18)",
              color: "#2563eb",
              padding: "6px 18px",
              borderRadius: "100px",
              textTransform: "uppercase",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}>
              <Zap size={13} />
              TRANSPARENT PRICING & LICENSES
            </span>
          </div>

          <h2 style={{ fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#0f172a", marginBottom: 14, lineHeight: 1.15 }}>
            <BlurText
              lines={[
                { text: "Two Clear Options." },
                { text: "Zero Hidden Deductions." }
              ]}
              gradient={["#0f172a", "#2563eb"]}
            />
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "#64748b", maxWidth: 640, margin: "0 auto 30px", fontWeight: 500, lineHeight: 1.6 }}>
            Choose between a <strong style={{ color: "#2563eb" }}>0% profit-sharing 3-year enterprise license</strong> or our <strong style={{ color: "#059669" }}>performance partner plan</strong> where you pay only when you make profits.
          </p>

          {/* Primary Category Switcher */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: 4,
              borderRadius: 100,
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              boxShadow: "none",
              gap: 4
            }}
          >
            <button
              onClick={() => setPricingCategory("autotrade")}
              style={{
                padding: "10px 22px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
                background: pricingCategory === "autotrade"
                  ? "#ffffff"
                  : "transparent",
                color: pricingCategory === "autotrade"
                  ? "#2563eb"
                  : "#64748b",
                boxShadow: pricingCategory === "autotrade"
                  ? "0 2px 8px rgba(37, 99, 235, 0.15), 0 1px 2px rgba(0, 0, 0, 0.04)"
                  : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                outline: "none"
              }}
              onMouseEnter={(e) => {
                if (pricingCategory !== "autotrade") e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                if (pricingCategory !== "autotrade") e.currentTarget.style.color = "#64748b";
              }}
            >
              <Zap size={14} />
              <span>FiAlgo V1 AutoTrade Licenses (₹1L & ₹10K)</span>
            </button>

            <button
              onClick={() => setPricingCategory("platform")}
              style={{
                padding: "10px 22px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
                background: pricingCategory === "platform"
                  ? "#ffffff"
                  : "transparent",
                color: pricingCategory === "platform"
                  ? "#2563eb"
                  : "#64748b",
                boxShadow: pricingCategory === "platform"
                  ? "0 2px 8px rgba(37, 99, 235, 0.15), 0 1px 2px rgba(0, 0, 0, 0.04)"
                  : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                outline: "none"
              }}
              onMouseEnter={(e) => {
                if (pricingCategory !== "platform") e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                if (pricingCategory !== "platform") e.currentTarget.style.color = "#64748b";
              }}
            >
              <ShieldCheck size={14} />
              <span>Platform Membership (Journal & AI Coach)</span>
            </button>
          </div>
        </div>

        {/* ── OPTION A: FIALGO AUTOTRADE 2 OFFICIAL LICENSES ── */}
        {pricingCategory === "autotrade" && (
          <div className="relative z-10 w-full" style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

              {/* FAQ BOX 1: 3-Year Enterprise Pass */}
              <div
                className="feat-card-premium"
                style={{
                  padding: "20px 24px",
                  background: "#ffffff",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  cursor: "pointer" }}
                onClick={() => setEnterpriseExpanded(!enterpriseExpanded)}
              >
                {/* FAQ Header Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 100, background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb",
                      flexShrink: 0
                    }}>
                      <Crown size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          3-Year Enterprise Pass
                        </h3>
                        <span style={{
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "none",
                          color: "#60a5fa",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          padding: "3px 9px",
                          borderRadius: 100,
                          textTransform: "uppercase"
                        }}>
                          0% PROFIT SHARE
                        </span>
                        <span style={{
                          padding: "3px 9px",
                          borderRadius: 8,
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          fontSize: 10.5,
                          fontWeight: 700
                        }}>
                          36 MONTHS
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontWeight: 500 }}>
                        Keep 100% of all profits. Zero ongoing cuts. Pay once.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                    <div className="hidden sm:block" style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>₹1,00,000</span>
                      <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>one-time (~₹2,777/mo)</span>
                    </div>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transform: enterpriseExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", color: "#64748b"
                    }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* FAQ Collapsible Body */}
                <AnimatePresence>
                  {enterpriseExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          paddingTop: 20,
                          marginTop: 18,
                          borderTop: "1px solid #f1f5f9",
                          cursor: "default"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Compact Price Box */}
                        <div style={{
                          padding: "14px 18px",
                          borderRadius: 14,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          marginBottom: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12
                        }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
                                ₹1,00,000
                              </span>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                one-time upfront license (~₹2,777/month)
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#3b82f6" }} />
                              <span style={{ fontSize: 11.5, color: "#2563eb", fontWeight: 600 }}>
                                0% Profit Share · 100% Profits Retained In MT5
                              </span>
                            </div>
                          </div>
                          <div style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "none",
                            color: "#334155",
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            🛡️ 50% Renewal Guarantee (₹49,999) after 3 years
                          </div>
                        </div>

                        {/* All 8 Specifications in 2-Column Grid */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "12px 20px",
                          marginBottom: 20
                        }}>
                          {threeYearFeatures.map((feat, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <CheckCircle2 size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, display: "block" }}>
                                  {feat.title}
                                </span>
                                <span style={{ fontSize: 12, color: "#64748b", display: "block", marginTop: 2, lineHeight: 1.4 }}>
                                  {feat.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>
                            ⚡ Instant Hardware-Bound MT5 License Key Relay · Verified MT5 build 4400+
                          </div>
                          <button
                            onClick={() => navigate("/features/auto-trade")}
                            className="btn-tradifive"
                            style={{ padding: "11px 22px", fontSize: 13, fontWeight: 700 }}
                          >
                            <span>Get 3-Year Enterprise License (₹1,00,000)</span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* FAQ BOX 2: Performance Partner Plan */}
              <div
                className="feat-card-premium"
                style={{
                  padding: "20px 24px",
                  background: "#ffffff",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  cursor: "pointer" }}
                onClick={() => setPerformanceExpanded(!performanceExpanded)}
              >
                {/* FAQ Header Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#34d399",
                      flexShrink: 0
                    }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          Performance Partner Plan
                        </h3>
                        <span style={{
                          background: "rgba(16, 185, 129, 0.15)",
                          border: "none",
                          color: "#34d399",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 0.8,
                          padding: "3px 9px",
                          borderRadius: 100,
                          textTransform: "uppercase"
                        }}>
                          PAY ONLY ON PROFITS
                        </span>
                        <span style={{
                          padding: "3px 9px",
                          borderRadius: 8,
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          fontSize: 10.5,
                          fontWeight: 700
                        }}>
                          SETUP + 50/50%
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontWeight: 500 }}>
                        Split 50% weekly only when your account is in green. Zero fee on flat or red weeks.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                    <div className="hidden sm:block" style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>₹10,000</span>
                      <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>setup + 50% weekly</span>
                    </div>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transform: enterpriseExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", color: "#64748b"
                    }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* FAQ Collapsible Body */}
                <AnimatePresence>
                  {performanceExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          paddingTop: 20,
                          marginTop: 18,
                          borderTop: "1px solid #e2e8f0",
                          cursor: "default"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Compact Price Box */}
                        <div style={{
                          padding: "14px 18px",
                          borderRadius: 14,
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "none",
                          marginBottom: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12
                        }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
                                ₹10,000
                              </span>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                one-time setup fee + 50% weekly net profit share
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#10b981" }} />
                              <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 600 }}>
                                ₹0 Platform Fee On Red Or Flat Weeks (No Profit = Zero Fee)
                              </span>
                            </div>
                          </div>
                          <div style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "#ecfdf5",
                            border: "1px solid #a7f3d0",
                            color: "#065f46",
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            🔒 High-Water Mark / Loss Carry-Forward Protection
                          </div>
                        </div>

                        {/* All 8 Specifications in 2-Column Grid */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "12px 20px",
                          marginBottom: 20
                        }}>
                          {profitShareFeatures.map((feat, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, display: "block" }}>
                                  {feat.title}
                                </span>
                                <span style={{ fontSize: 12, color: "#64748b", display: "block", marginTop: 2, lineHeight: 1.4 }}>
                                  {feat.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>
                            🛡️ Zero Broker Account Deductions · Invoices cleared weekly via UPI / Bank
                          </div>
                          <button
                            onClick={() => navigate("/features/auto-trade")}
                            className="btn-tradifive-success"
                            style={{ padding: "11px 22px", fontSize: 13, fontWeight: 700 }}
                          >
                            <span>Get Performance License (₹10,000)</span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* FAQ BOX 3: Detailed Feature & Model Comparison */}
              <div
                className="feat-card-premium"
                style={{
                  padding: "20px 24px",
                  background: "#ffffff",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  cursor: "pointer" }}
                onClick={() => setComparisonTableExpanded(!comparisonTableExpanded)}
              >
                {/* FAQ Header Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0f172a",
                      flexShrink: 0
                    }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Detailed Feature & Model Comparison
                      </h3>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0", fontWeight: 500 }}>
                        Review the core economic differences between our two official licensing structures.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/features/auto-trade"); }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 10,
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Activity size={13} />
                      <span>View Live Telemetry</span>
                    </button>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transform: enterpriseExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", color: "#64748b"
                    }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* FAQ Collapsible Body */}
                <AnimatePresence>
                  {comparisonTableExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          paddingTop: 20,
                          marginTop: 18,
                          borderTop: "1px solid #e2e8f0",
                          cursor: "default"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 600 }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Feature / Parameter</th>
                                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>3-Year Pass (₹1,00,000)</th>
                                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>Performance (₹10,000)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparisonRows.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                                    {row.label}
                                  </td>
                                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                                    {row.threeYears}
                                  </td>
                                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#047857" }}>
                                    {row.profitShare}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Proof Assurance Banner */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderRadius: 20,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                flexWrap: "wrap",
                gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 14, color: "#0f172a", display: "block", fontWeight: 700 }}>
                      100% Capital Isolation Guarantee · 3-Day Free Demo Trial
                    </strong>
                    <span style={{ fontSize: 12.5, color: "#64748b", marginTop: 2, display: "block" }}>
                      Experience FiAlgo V1 automated trading risk-free on any MT5 demo account for 3 full days. Your capital stays with your broker.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/features/auto-trade")}
                  className="btn-tradifive"
                  style={{ padding: "9px 20px", fontSize: 12.5, fontWeight: 700 }}
                >
                  Start 3-Day Free Demo Trial (.ex5)
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── OPTION B: PLATFORM APPS (JOURNAL & RISKGUARD) ── */}
        {pricingCategory === "platform" && (
          <div className="relative z-10 w-full">
            <PricingCards
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onUpgradeClick={onStart}
              isStandalone={true}
            />
          </div>
        )}

        <div ref={useReveal()} className="rv d4" style={{ textAlign: "center", marginTop: 48, opacity: 0.45 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Instant activation · Hardware-bound MT5 key · Dedicated engineer onboarding desk</p>
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
  { name: "Rahul Sharma", role: "IIT Delhi Graduate", init: "RS", grad: "linear-gradient(135deg,#f97316,#4c1d95)", stars: 5, text: "Risk Guard is the real deal. It literally stopped me from revenge trading after a bad morning session. Saved my account more than once." },
  { name: "Kavita Trivedi", role: "Swing Trader, Mumbai", init: "KT", grad: "linear-gradient(135deg,#10b981,#065f46)", stars: 5, text: "Love the trading competitions. Won the November contest and got a funded account. The leaderboard pushes you to perform better every single day." },
  { name: "Arjun Das", role: "Software Eng, Blr", init: "AD", grad: "linear-gradient(135deg,#f59e0b,#b45309)", stars: 5, text: "Auto-Sync Journal is a game changer. No more manual logging. The AI coach spotted that I was overleveraging on Mondays — something I never noticed." },
  { name: "Sneha Kapoor", role: "Forex Trader, Hyderabad", init: "SK", grad: "linear-gradient(135deg,#ec4899,#9d174d)", stars: 4, text: "Following top traders on the feed and seeing their actual trade setups has taught me more than any YouTube course. This is how trading education should work." },
  { name: "Vikram Singh", role: "Business Owner, Delhi", init: "VS", grad: "linear-gradient(135deg,#3b82f6,#f97316)", stars: 5, text: "The community here is different. Everyone has their MT5 connected so you know the results are real. No fake gurus, no screenshot traders." },
  { name: "Ananya Iyer", role: "Options Trader, Chennai", init: "AI", grad: "linear-gradient(135deg,#10b981,#3b82f6)", stars: 5, text: "Set my max daily loss and walked away. Tradifive enforced my rules better than I ever could myself. My discipline improved massively in just 6 weeks." },
  { name: "Zaid Khan", role: "Crypto Trader, Dubai", init: "ZK", grad: "linear-gradient(135deg,#f59e0b,#ec4899)", stars: 4, text: "Joined a competition for the first time last month. Finished 8th place. The competitive element makes you sharper. Already climbing the leaderboard." },
  { name: "Meera Nair", role: "Banker turned Trader, Kochi", init: "MN", grad: "linear-gradient(135deg,#f97316,#10b981)", stars: 5, text: "Finally a platform where I can show my real track record. My verified profile has attracted followers who genuinely want to learn from my strategy." },
];

const STATS = [
  { val: "50M+", label: "Global Retail Traders", color: "#3b82f6" },
  { val: "3-in-1", label: "Social + Trade + Risk", color: "#f97316" },
  { val: "24h", label: "Trading Stories", color: "#f97316" },
  { val: "Live", label: "MT5 Integration", color: "#2563eb" },
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
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                borderRadius: 20
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <div className="social-stat-label" style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
              <div className="social-stat-val" style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
            <span style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)", color: "#2563eb", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>From the Community</span>
          </div>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#0f172a", marginBottom: 14, lineHeight: 1.15 }}>
            <BlurText
              text="Traders who chose to grow together."
              gradient={["#0f172a", "#2563eb"]}
            />
          </h2>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)", maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}>
        {/* CSS animation replaces Framer Motion JS-driven scroll — GPU-composited, lower CPU overhead on mobile */}
        <div className="testimonials-track" style={{ display: "flex", gap: 20, padding: "16px 0" }}>
          {[...TESTIS, ...TESTIS].map((t, i) => (
            <div key={i} className="feat-card-premium testimonial-card" style={{ width: 320, padding: "22px", flexShrink: 0, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <div className="testimonial-stars" style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {Array(t.stars).fill(0).map((_, j) => (<svg key={j} width="11" height="11" viewBox="0 0 24 24" fill="#f97316" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>))}
                {Array(5 - t.stars).fill(0).map((_, j) => (<svg key={j + t.stars} width="11" height="11" viewBox="0 0 24 24" fill="#e2e8f0" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>))}
              </div>
              <p className="testimonial-text" style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, marginBottom: 20, fontWeight: 400 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="testimonial-avatar" style={{ width: 36, height: 36, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{t.init}</div>
                <div>
                  <div className="testimonial-name" style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                  <div className="testimonial-role" style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{t.role}</div>
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
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        borderRadius: 20
      }}
      onClick={() => setOpen(open === i ? null : i)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{f.q}</h4>
        </div>
        <div style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.4s", flexShrink: 0, marginLeft: 12 }}>
          <Ic n="chev" s={13} c="#64748b" sw={3} />
        </div>
      </div>
      <AnimatePresence>
        {open === i && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid #e2e8f0", fontSize: 14, color: "#475569", lineHeight: 1.65, fontWeight: 400 }}>{f.a}</div>
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
            <span style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)", color: "#2563eb", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>FAQ</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.15, color: "#0f172a" }}>
            <BlurText
              text="Frequently Asked Questions"
              gradient={["#0f172a", "#2563eb"]}
            />
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 15, color: "#64748b", marginTop: 12, fontWeight: 500 }}>Everything you need to know about Tradifive.</p>
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
    { value: "₹2.8M", label: "Prizes Awarded", color: "#f97316" },
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
      color: "#f97316"
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
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 800, height: 400, background: "radial-gradient(circle at center, rgba(37,99,235,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 1 }}>
            {/* Premium Pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)", padding: "6px 16px", borderRadius: 100, marginBottom: 24, backdropFilter: "blur(10px)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 10px #f97316" }} />
              <span style={{ color: "#2563eb", fontWeight: 600, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Global Network</span>
            </div>

            <h2 className="community-title" style={{ fontSize: "clamp(24px, 6vw, 56px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15, marginBottom: 24, letterSpacing: "-0.04em" }}>
              <BlurText
                lines={[
                  { text: "Thousands of traders are using", gradient: ["#0f172a", "#2563eb"] },
                  { text: "TradiFive to learn, collab & grow.", gradient: ["#f97316", "#2563eb"] }
                ]}
              />
            </h2>

            <p className="community-desc" style={{ fontSize: "clamp(15px, 4vw, 18px)", color: "#475569", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 40px", fontWeight: 400 }}>
              Join a vibrant global community. Share setups, learn from live webinars, and connect directly with the world's best verified traders.
            </p>

            <motion.button
              onClick={onStart}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: "14px 32px", borderRadius: 100, fontSize: 15, fontWeight: 700 }}
            >
              Join the Community <ArrowRight size={16} />
            </motion.button>
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
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                borderRadius: 20
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <div className="community-stat-label" style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
              <div className="community-stat-value" style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{s.value}</div>
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
                  <stop offset="0%" stopColor="rgba(37,99,235,0.25)" />
                  <stop offset="100%" stopColor="rgba(37,99,235,0)" />
                </radialGradient>
                {/* animated dash pattern */}
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(37,99,235,0)" />
                  <stop offset="50%" stopColor="rgba(37,99,235,0.4)" />
                  <stop offset="100%" stopColor="rgba(37,99,235,0)" />
                </linearGradient>
              </defs>

              {/* Orbit rings */}
              <motion.circle cx={cx} cy={cy} r={140} fill="none" stroke="rgba(249,115,22,0.3)" strokeWidth="1" strokeDasharray="4 8" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />
              <motion.circle cx={cx} cy={cy} r={260} fill="none" stroke="rgba(37,99,235,0.25)" strokeWidth="1" strokeDasharray="4 12" animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />

              {/* Center glow */}
              <motion.circle cx={cx} cy={cy} r={90} fill="url(#centerGlow)" animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
              <circle cx={cx} cy={cy} r={48} fill="#ffffff" stroke="rgba(249,115,22,0.6)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 15px rgba(249,115,22,0.5))" }} />

              {/* Spoke lines: inner ring → center */}
              {innerRing.map(n => {
                const p = toXY(n.angle, n.r);
                return (
                  <line key={`spoke-${n.id}`}
                    x1={cx} y1={cy} x2={p.x} y2={p.y}
                    stroke="rgba(249,115,22,0.25)" strokeWidth="1.5"
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
                    stroke="rgba(37,99,235,0.2)" strokeWidth="1.5"
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
                    fill="#f97316"
                    initial={{ cx: start.x, cy: start.y, opacity: 0 }}
                    animate={{ cx: [start.x, cx], cy: [start.y, cy], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 5px #f97316)" }}
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
                      fill={`rgba(${n.r === 140 ? '249,115,22' : '37,99,235'}, 0.08)`}
                      stroke={`rgba(${n.r === 140 ? '249,115,22' : '37,99,235'}, 0.4)`}
                      strokeWidth="1.5"
                      initial={{ opacity: 0.5, scale: 0.95 }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 3 + (n.id % 2), repeat: Infinity, delay: n.id * 0.3 }}
                      style={{ filter: `drop-shadow(0 0 10px rgba(${n.r === 140 ? '249,115,22' : '37,99,235'}, 0.3))` }}
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
                    <circle cx={p.x} cy={p.y} r={size} fill="none" stroke={`rgba(${n.r === 140 ? '249,115,22' : '37,99,235'}, 0.6)`} strokeWidth="2" />
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
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  borderRadius: 20
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h3 className="problem-card-title" style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{b.title}</h3>
                </div>
                <p className="problem-card-desc" style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, fontWeight: 400 }}>{b.desc}</p>
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

      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)", borderRadius: 32, padding: "72px 32px", boxShadow: "0 25px 60px -15px rgba(37,99,235,0.4)" }}>
        <div ref={useReveal()} className="rv" style={{ marginBottom: 18 }}>
          <span style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", padding: "6px 16px", borderRadius: "100px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>START YOUR JOURNEY</span>
        </div>
        <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 18 }}>
          <BlurText
            lines={[
              { text: "Become The Trader" },
              { text: "You've Always Wanted To Be." }
            ]}
            gradient={["#ffffff", "#e0e7ff"]}
          />
        </h2>
        <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 40, lineHeight: 1.65, fontWeight: 500, maxWidth: 580, margin: "0 auto 40px" }}>
          Join Tradifive and get access to AI coaching, risk management, auto-sync journaling, verified traders, creator communities, and everything you need to grow consistently.
        </p>

        <div ref={useReveal()} className="rv d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
          <button
            onClick={onStart}
            style={{
              background: "#ffffff",
              color: "#1d4ed8",
              border: "none",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)",
              borderRadius: 100,
              padding: "14px 34px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
              outline: "none",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.color = "#1e40af";
              e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#1d4ed8";
              e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)";
            }}
          >
            <span>Start Free Today</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => { const el = document.getElementById("capabilities"); el?.scrollIntoView({ behavior: "smooth" }); }}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              borderRadius: 100,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow:
                "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)",
              transition: "all 0.2s ease",
              outline: "none",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.22)";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 0 rgba(255, 255, 255, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.18), 0 2px 4px rgba(0, 0, 0, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)";
            }}
          >
            <span>Explore Tradifive</span>
          </button>
        </div>
        <p ref={useReveal()} className="rv d4" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: 0.5 }}>No Credit Card Required • Free Community Access • Cancel Anytime</p>
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
        background: "linear-gradient(to right, transparent, rgba(226, 232, 240, 0.6) 20%, #e2e8f0 50%, rgba(226, 232, 240, 0.6) 80%, transparent)"
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
      <motion.button
        onClick={onStart}
        className="btn-glow-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ padding: "14px 36px", borderRadius: 100, fontSize: 15, fontWeight: 800, marginBottom: 14, width: "100%", maxWidth: 300, justifyContent: "center" }}
      >
        🚀 Sign Up Free
      </motion.button>
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
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);


  // Centralized OAuth & Auth Redirect Intercept -> Always forward to /auth-callback or /reset-password
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');
    const hasAuthToken = hash.includes('access_token=') || search.includes('code=');
    const hasAuthError = hash.includes('error=') || search.includes('error=');

    // If this is a password recovery link from Supabase email, route directly to Reset Password
    if (isRecovery) {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }

    if (hasAuthToken || hasAuthError) {
      navigate(`/auth-callback${search}${hash}`, { replace: true });
    }
  }, [navigate]);





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

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#FFFFFF";
    document.body.style.color = "#0F172A";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });
  const handleSignUp = () => navigate("/login", { state: { mode: "signup" } });
  const handleStart = handleSignUp;



  // Mobile view is allowed to see the landing page, so we don't block.

  return (
    <div style={{ background: "#FFFFFF", color: "#0F172A", minHeight: "100vh", position: "relative" }}>
      <PublicNavbar onSignIn={handleSignIn} onSignUp={handleSignUp} onDownloadClick={() => navigate('/download')} />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero onStart={handleStart} onSignIn={handleSignIn} />
        <PlatformPillars />
        <Sep />
        <MentorComparison onStart={handleStart} />
        <Sep />
        <WhatIsTradifive onStart={handleStart} />
        <Sep />
        <HowItWorks />
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
    </div>
  );
}
