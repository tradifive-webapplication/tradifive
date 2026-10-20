import React, { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WaitlistModal from "@/components/WaitlistModal";
import { Sparkles, Shield, Zap, ChevronDown, ArrowRight, CheckCircle2, Cpu, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import AutoTradeProfitCalculator from "@/components/AutoTradeProfitCalculator";
import AlgoLiveExecutionTerminal from "@/components/AlgoLiveExecutionTerminal";
import {
  HowItWorksSection,
  WhatYouGetSection,
  RiskModulesSection,
  FreeTrialDownloadsSection,
  FiAlgoV1ProductSection,
} from "@/components/FiAlgoProductShowcase";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

const fialgoFaqItems = [
  {
    question: "What is FiAlgo V1 and how does it work?",
    answer: "FiAlgo V1 is a fully automated Expert Advisor (.ex5) engineered specifically for MetaTrader 5 (MT5). It automates trade analysis, entry execution, stop loss placement, and trailing profit management primarily on Gold (XAUUSD) and major currency pairs without requiring manual intervention.",
  },
  {
    question: "What are the two pricing options for FiAlgo V1?",
    answer: "We offer two transparent pricing models: (1) Lifetime VIP License at ₹99,999 one-time with 0% profit share forever (keep 100% of all profits with zero recurring fees), and (2) Performance Partner at ₹5,000 initial setup fee + 50% daily profit share on net green trading days (zero commission on red days). For Performance accounts, the daily 50% profit share is settled daily via UPI; unpaid keys are automatically suspended until cleared.",
  },
  {
    question: "Do I need a VPS to run FiAlgo V1?",
    answer: "While you can run FiAlgo V1 on your personal laptop or desktop during market hours, we strongly recommend a low-latency Windows VPS (Virtual Private Server) with under 20ms ping to your broker. This ensures your algorithms execute 24/5 even when your personal computer is turned off.",
  },
  {
    question: "What is the difference between the Free Demo, Backtest, and Lifetime License?",
    answer: "The Free Demo build lets you run FiAlgo V1 on any MT5 demo account with all 8 risk modules active and zero risk. The Backtest build lets you run fast historical simulations inside MT5 Strategy Tester. The Lifetime License unlocks live trading on real accounts, unlimited demo accounts, lifetime algorithm updates, and 1-on-1 setup assistance.",
  },
  {
    question: "Which brokers and account types are supported?",
    answer: "FiAlgo V1 works with any broker supporting MetaTrader 5 (MT5), including Exness, IC Markets, Pepperstone, and XM. We recommend Raw Spread or ECN accounts with low spreads on Gold (XAUUSD).",
  },
  {
    question: "How does the built-in High-Impact News Filter work?",
    answer: "FiAlgo V1 has an integrated economic calendar sync. It automatically pauses new trade entries and tightens existing trailing stops 30 minutes before and after high-impact (Folder Red) news events like FOMC, CPI, and NFP, preventing slippage during severe market spikes.",
  },
  {
    question: "How do I install and activate FiAlgo V1 on MetaTrader 5?",
    answer: "Setup takes under 2 minutes: Open MT5 -> Click 'File' -> 'Open Data Folder' -> Navigate to 'MQL5' -> 'Experts' -> Paste the 'FIALGO V1.ex5' file. In MT5, refresh your Navigator, drag FiAlgo V1 onto your XAUUSD chart, ensure 'Allow Algo Trading' is enabled in toolbar, and enter your license key.",
  },
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof fialgoFaqItems[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.3s",
        background: "#171717",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
        borderRadius: 20,
        marginBottom: 10,
        border: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>{item.question}</h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ flexShrink: 0, marginLeft: 12 }}
        >
          <ChevronDown size={16} color="rgba(255,255,255,0.4)" strokeWidth={2.5} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                paddingTop: 14,
                marginTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.65,
                fontWeight: 400
              }}
            >
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionDivider({ my = 36 }: { my?: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 1240,
        margin: `${my}px auto`,
        height: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
      }}
    >
      {/* Soft Ambient Center Glow */}
      <div
        style={{
          position: "absolute",
          width: "50%",
          maxWidth: 500,
          height: 14,
          background: "radial-gradient(ellipse, rgba(255, 255, 255, 0.15) 0%, transparent 70%)",
          filter: "blur(6px)",
          pointerEvents: "none",
        }}
      />
      {/* Glowing Gradient Line */}
      <div
        style={{
          width: "100%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 15%, rgba(255, 255, 255, 0.18) 50%, rgba(255, 255, 255, 0.03) 85%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default function AutoTradePublic() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const handleStart = (tier?: string) => {
    const chosenTier = tier || localStorage.getItem("tradifive_selected_tier") || "lifetime";
    navigate(`/auto-trade/setup?tier=${chosenTier}`);
  };
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "#02040a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicNavbar
        onSignIn={handleStart}
        onSignUp={handleStart}
        onDownloadClick={() => navigate("/download")}
      />

      <main style={{ flex: 1 }}>
        {isMobile ? (
          <div
            style={{
              background: "#02040a",
              padding: "135px 20px 60px 20px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >


            {/* Content: Badge, Heading, Subtitle, CTA Button */}
            <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#171717",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.08)",
                  borderRadius: 100,
                  padding: "4px 11px",
                  marginBottom: 14,
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", animation: "pulse 2s infinite" }} />
                <span
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ⚡ Automatic Trading Bot • Gold
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18 }}
                style={{
                  fontSize: "25px",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.25,
                  letterSpacing: "-0.025em",
                  marginBottom: 12,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  wordBreak: "keep-all",
                }}
              >
                Automatic Gold Trading.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  100% Hands-Free.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28 }}
                style={{
                  fontSize: 13.5,
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.55,
                  marginBottom: 20,
                  fontWeight: 400,
                  maxWidth: 340,
                }}
              >
                Let the FiAlgo bot trade Gold for you automatically on MT5. Zero trading experience needed — easy 60-second setup and automated risk protection.
              </motion.p>

              {/* CTA Button */}
              <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: 320 }}>
                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.38 }}
                  onClick={() => {
                    const el = document.getElementById("fialgo-downloads");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else handleStart();
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    borderRadius: 100,
                    padding: "13px 24px",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: 6,
                    letterSpacing: "0.02em",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    color: "#60a5fa",
                    border: "none",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  DOWNLOAD FREE DEMO (.ex5) &rarr;
                </motion.button>
              </div>

              {/* Mobile Trust badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                  <span>Easy 60s Setup</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#60a5fa", fontWeight: 700 }}>✓</span>
                  <span>No Experience Needed</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>
                  <span>Automated Risk Protection</span>
                </div>
              </div>
            </div>



            {/* Bottom scrolling list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                width: "100%",
                marginTop: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.45)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Everything you need for disciplined trading:
              </div>

              {/* Premium horizontal sliding row */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  overflow: "hidden",
                  padding: "6px 0",
                  // Fade out scroll boundaries
                  maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
                }}
              >
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: 15, repeat: Infinity }}
                  style={{ display: "flex", gap: "16px", whiteSpace: "nowrap" }}
                >
                  {[...["FiAlgo Engine", "Risk Guard", "Smart Journal", "Competitions", "Community Hub", "Analytics"], ...["FiAlgo Engine", "Risk Guard", "Smart Journal", "Competitions", "Community Hub", "Analytics"]].map((label, i) => (
                    <div
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "rgba(255, 255, 255, 0.95)",
                        }}
                      >
                        {label}
                      </span>
                      {i !== 11 && (
                        <span style={{ color: "rgba(255, 255, 255, 0.25)", fontSize: 12 }}>•</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ── Hero Section (Two-Column Responsive Grid — No Empty Space) ── */}
            <section
              style={{
                position: "relative",
                padding: "185px 0 50px",
                backgroundColor: "#02040a",
                overflow: "hidden",
              }}
            >
              {/* Ambient Glows */}
              <div style={{ position: "absolute", top: 120, left: "15%", width: 500, height: 350, background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 140, right: "10%", width: 550, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 5 }}>

                {/* 2-Column Responsive Desktop Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

                  {/* Left Column: Heading, Value Prop & CTAs */}
                  <div className="lg:col-span-6 flex flex-col items-start">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#171717",
                        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.08)",
                        padding: "6px 16px 6px 12px",
                        borderRadius: "100px",
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "rgba(96,165,250,0.15)" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", animation: "pulse 2s infinite" }} />
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                        ⚡ Automatic Trading Bot • Gold
                      </span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      style={{
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        fontSize: "clamp(28px, 3vw, 40px)",
                        fontWeight: 800,
                        lineHeight: 1.22,
                        letterSpacing: "-0.03em",
                        marginBottom: 16,
                        color: "#fff",
                        wordBreak: "keep-all",
                      }}
                    >
                      Automatic Gold Trading.<br />
                      <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                        100% Hands-Free on MT5.
                      </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.72)",
                        lineHeight: 1.6,
                        maxWidth: 520,
                        marginBottom: 28,
                        fontWeight: 400,
                      }}
                    >
                      Let the FiAlgo bot trade Gold for you automatically on MetaTrader 5. Zero trading experience required — simple 60-second setup, built-in safety protection for your account, and automated news & risk protections.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}
                    >
                      <button
                        onClick={() => {
                          const el = document.getElementById("fialgo-downloads");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                          else handleStart();
                        }}
                        style={{
                          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                          color: "#60a5fa",
                          border: "none",
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)",
                          borderRadius: 100,
                          padding: "13px 26px",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          transition: "all 0.2s ease",
                          outline: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.background = "linear-gradient(135deg, #253347 0%, #131c33 100%)";
                          e.currentTarget.style.color = "#93c5fd";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
                          e.currentTarget.style.color = "#60a5fa";
                        }}
                      >
                        <span>DOWNLOAD FREE DEMO (.ex5)</span>
                        <ArrowRight size={16} />
                      </button>

                      <button
                        onClick={() => {
                          const el = document.getElementById("fialgo-v1-pricing");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        style={{
                          background: "#171717",
                          color: "rgba(255, 255, 255, 0.9)",
                          border: "none",
                          borderRadius: 100,
                          padding: "13px 24px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          boxShadow:
                            "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)",
                          transition: "all 0.2s ease",
                          outline: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.background = "#1e1e1e";
                          e.currentTarget.style.color = "#ffffff";
                          e.currentTarget.style.boxShadow =
                            "inset 0 1px 0 0 rgba(255, 255, 255, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.18), 0 2px 4px rgba(0, 0, 0, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.background = "#171717";
                          e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                          e.currentTarget.style.boxShadow =
                            "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)";
                        }}
                      >
                        <span>View Specifications & Key</span>
                      </button>
                    </motion.div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-300">Easy 60s Setup (MT5)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 font-bold">100%</span>
                        <span className="text-slate-300">Hands-Free Trading</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">3-Day</span>
                        <span className="text-slate-300">Profit Guarantee</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">100%</span>
                        <span className="text-slate-300">Safe in Your Own Account</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Trading Engine Terminal (Real-Time Tick Simulation) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="lg:col-span-6 w-full"
                  >
                    <AlgoLiveExecutionTerminal />
                  </motion.div>

                </div>

                {/* Feature Ticker Strip directly beneath the grid */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontFamily: "'Outfit', sans-serif",
                    marginTop: 48,
                    paddingTop: 24,
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255, 255, 255, 0.45)",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Everything you need for disciplined trading:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "12px 20px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {["FiAlgo Engine", "Risk Guard", "Smart Journal", "Competitions", "Community Hub", "Analytics"].map((label, i) => (
                      <React.Fragment key={label}>
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.05 * i, duration: 0.4 }}
                        >
                          {label}
                        </motion.span>
                        {i < 5 && <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>

              </div>
            </section>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── FiAlgo V1 Product Specifications & License Section ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionDivider />
        <div id="fialgo-v1-pricing">
          <FiAlgoV1ProductSection onGetStarted={handleStart} />
        </div>

        <SectionDivider />
        {/* DESKTOP PLATFORM SHOWCASE */}
        <section style={{ padding: "40px 24px 80px", maxWidth: 1240, margin: "0 auto", position: "relative" }}>
          <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 18 }}>
              <Cpu size={13} color="#0ea5e9" />
              <span style={{ color: "#0ea5e9", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>METATRADER 5 INTERFACE · LIVE PREVIEW</span>
            </div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(26px, 3vw, 40px)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              Automated Algorithmic{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Execution on MT5.
              </span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
              Attach FiAlgo V1 to any chart in MetaTrader 5 in seconds. Experience real-time order basket tracking, spread monitoring, and trailing stops with institutional execution speed.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp(0.15)}
            style={{
              background: "#171717",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
              borderRadius: 20,
              border: "none",
              padding: "16px",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Window Header Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5 }}>Tradifive Terminal · FiAlgo MT5 Engine</div>
              <div style={{ width: 32 }} />
            </div>

            {/* Screenshot */}
            <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12, background: "#0c0d12", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <img
                src="/autotradedesktop.png"
                alt="Tradifive Terminal - FiAlgo MT5 Engine"
                className="w-full h-auto block select-none pointer-events-none"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              />
            </div>
          </motion.div>
        </section>

        <SectionDivider />
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── How It Works Section (Image 4) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <HowItWorksSection />

        <SectionDivider />
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── 8 Modules — One Click Each (Image 3) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <RiskModulesSection />

        <SectionDivider />
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── Inside FiAlgo Engine (Image 5) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <WhatYouGetSection />

        <SectionDivider />
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── Interactive ROI & Profit Calculator Section ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section id="profit-simulator" style={{ background: "#02040a", padding: "40px 0 40px", position: "relative" }}>
          {/* Ambient Glow */}
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
            <AutoTradeProfitCalculator />
          </div>
        </section>

        <SectionDivider />
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── Free Trial & Downloads Section (Image 2) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div id="fialgo-downloads">
          <FreeTrialDownloadsSection />
        </div>

        <SectionDivider />
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── FAQ Section ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ background: "#02040a", padding: "60px 0 100px", position: "relative" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
            {/* FAQ Header */}
            <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 48 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#171717",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
                  borderRadius: 100,
                  padding: "4px 12px",
                  marginBottom: 18,
                }}
              >
                <HelpCircle size={10} color="#38bdf8" />
                <span style={{ color: "#ffffff", fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
                  FIALGO V1 FAQ
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(26px, 3vw, 40px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                }}
              >
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
                Everything you need to know about setting up and executing trades with FiAlgo V1 on MetaTrader 5.
              </p>
            </motion.div>

            {/* FAQ Accordion */}
            <motion.div {...fadeUp(0.1)}>
              {fialgoFaqItems.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </motion.div>


          </div>
        </section>
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
