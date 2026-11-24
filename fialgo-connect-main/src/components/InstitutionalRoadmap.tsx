import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, ShieldCheck, Cpu, Brain, CheckCircle2, 
  ArrowRight, Activity, Zap, Lock, Shield, Sparkles, TrendingUp
} from "lucide-react";

interface InstitutionalRoadmapProps {
  onStart: () => void;
}

export default function InstitutionalRoadmap({ onStart }: InstitutionalRoadmapProps) {
  const [activeStep, setActiveStep] = useState(0);

  const STEPS = [
    {
      num: "01",
      tag: "ZERO-LATENCY BRIDGE",
      title: "Connect Any MT5 Broker in 60s",
      accent: "#2563eb",
      accentBg: "rgba(37, 99, 235, 0.08)",
      accentBorder: "rgba(37, 99, 235, 0.25)",
      headline: "100% Fund Custody. Zero External Withdrawals.",
      desc: "Link Exness, IC Markets, Vantage, or any regulated MetaTrader 5 broker via encrypted socket relay. Tradifive sends execution commands only—your capital remains 100% safe in your broker.",
      bullets: [
        "Encrypted 4ms WebSocket relay directly to your MT5 account",
        "Zero CSV or manual uploads required—trades sync in real time",
        "100% broker fund custody guarantee (no capital ever touches Tradifive)"
      ],
      preview: {
        badge: "MT5 BRIDGE ACTIVE",
        title: "Broker Socket Relay",
        status: "CONNECTED · 2ms PING",
        metric1Label: "Active Broker",
        metric1Value: "Exness / IC Markets",
        metric2Label: "Account Type",
        metric2Value: "Live MT5 (ECN / RAW)",
        metric3Label: "Capital Custody",
        metric3Value: "100% in Broker Custody",
        footnote: "Encrypted AES-256 Bridge Relay"
      }
    },
    {
      num: "02",
      tag: "AUTONOMOUS ENFORCER",
      title: "Arm Your Institutional Risk Guard",
      accent: "#f97316",
      accentBg: "rgba(249, 115, 22, 0.08)",
      accentBorder: "rgba(249, 115, 22, 0.25)",
      headline: "Hard Circuit Breakers. Zero Revenge Trading.",
      desc: "Set your daily max drawdown limit (e.g. ₹5,000) and max open trade count. The instant your risk limit is breached, Tradifive automatically kills MT5 trading for the day. No manual override, no blown accounts.",
      bullets: [
        "Daily max drawdown circuit breaker with 0.02s terminal lock",
        "30-minute mandatory revenge trading cooldown after consecutive losses",
        "Spread anomaly and high-impact economic news filter (FOMC, CPI, NFP)"
      ],
      preview: {
        badge: "CIRCUIT BREAKER ARMED",
        title: "Autonomous Risk Enforcer",
        status: "ARMED & MONITORING",
        metric1Label: "Daily Loss Limit",
        metric1Value: "₹1,850 / ₹5,000 max",
        metric2Label: "Utilization",
        metric2Value: "37% Used · 63% Shielded",
        metric3Label: "Revenge Lock",
        metric3Value: "0.02s Socket Killswitch",
        footnote: "Zero Emotional Overrides Allowed"
      }
    },
    {
      num: "03",
      tag: "ALGORITHMIC ENGINE",
      title: "Deploy FiAlgo or Trade Discretionary",
      accent: "#2563eb",
      accentBg: "rgba(37, 99, 235, 0.08)",
      accentBorder: "rgba(37, 99, 235, 0.25)",
      headline: "Gold M1 Micro-Liquidity Sweeps & Strict Discipline.",
      desc: "Deploy our proprietary FiAlgo V1 Gold algorithm (.ex5) to automate execution on the M1 timeframe, or trade discretionary under our strict risk guardrails. Keep 100% of profits with our 3-year enterprise license.",
      bullets: [
        "Specialized XAUUSD M1 algorithm capturing institutional micro-sweeps",
        "0% profit share enterprise license—keep every single dollar you generate",
        "Performance partner option: pay only on profitable green weeks"
      ],
      preview: {
        badge: "ALGO TELEMETRY",
        title: "FiAlgo V1 M1 Gold (.ex5)",
        status: "RUNNING · GOLD M1",
        metric1Label: "Pair / Timeframe",
        metric1Value: "XAU/USD · M1 Chart",
        metric2Label: "Week Net Return",
        metric2Value: "+₹34,820.00 Net",
        metric3Label: "Profit Share Cut",
        metric3Value: "0% Kept by Platform (Enterprise)",
        footnote: "High-Water Mark Protection Active"
      }
    },
    {
      num: "04",
      tag: "BEHAVIORAL MASTERY",
      title: "AI Trade Journaling & Public Leaderboard",
      accent: "#f97316",
      accentBg: "rgba(249, 115, 22, 0.08)",
      accentBorder: "rgba(249, 115, 22, 0.25)",
      headline: "AI That Grades Your Plan Adherence from A+ to F.",
      desc: "Every closed trade is automatically categorized and analyzed. Our AI detects costly psychological habits like holding losers too long or trading during fatigue hours, while your verified win-rate powers your competition standing.",
      bullets: [
        "Automated trade grading (A+ to F) based on risk-to-reward and discipline",
        "Psychological leakage detection: pinpoints exact session win rates",
        "Compete on broker-verified public leaderboards for real cash rewards"
      ],
      preview: {
        badge: "AI TRADE AUDIT",
        title: "Trade Grading & Psychology",
        status: "GRADE: A+ (DISCIPLINE 98%)",
        metric1Label: "Last Execution",
        metric1Value: "XAU/USD · BUY 0.50 Lot",
        metric2Label: "Trade Result",
        metric2Value: "+₹18,450.00 (R:R 1:3.4)",
        metric3Label: "Identified Edge",
        metric3Value: "London Overlap Win Rate: 76.4%",
        footnote: "Zero Emotional Tilt Detected"
      }
    }
  ];

  return (
    <section id="how-it-works" style={{ backgroundColor: "#ffffff", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      {/* Subtle radial ambient background glow */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.04) 0%, rgba(249,115,22,0.03) 50%, transparent 80%)", 
          pointerEvents: "none" 
        }} 
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(249, 115, 22, 0.08)",
              border: "1px solid rgba(249, 115, 22, 0.25)",
              padding: "6px 18px",
              borderRadius: 100,
              marginBottom: 20
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 8px #f97316" }} />
            <span style={{ color: "#ea580c", fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              THE INSTITUTIONAL ROADMAP
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: "clamp(30px, 4.4vw, 52px)",
              fontWeight: 900,
              letterSpacing: "-0.035em",
              color: "#0f172a",
              lineHeight: 1.15,
              marginBottom: 16
            }}
          >
            From Retail Frustration to Institutional Consistency. <br />
            <span style={{ background: "linear-gradient(135deg, #2563eb 0%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              In Four Decisive Steps.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            style={{
              fontSize: 17,
              color: "#475569",
              maxWidth: 620,
              margin: "0 auto",
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            A high-discipline framework designed to protect your capital, automate non-negotiable risk rules, and compound profits.
          </motion.p>
        </div>

        {/* Step Selector Pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 44 }}>
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 22px",
                  borderRadius: 100,
                  border: isActive ? `1.5px solid ${step.accent}` : "1px solid #e2e8f0",
                  background: isActive ? "#ffffff" : "#f8fafc",
                  color: isActive ? "#0f172a" : "#64748b",
                  boxShadow: isActive ? `0 4px 14px ${step.accentBg}, 0 1px 3px rgba(0,0,0,0.05)` : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  outline: "none",
                  fontSize: 13.5,
                  fontWeight: 700
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: isActive ? step.accent : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#64748b",
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  {step.num}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Card (3D Elevated Showcase) */}
        <AnimatePresence mode="wait">
          {(() => {
            const current = STEPS[activeStep];
            return (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: "#ffffff",
                  borderRadius: 28,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 20px 50px -15px rgba(0, 0, 0, 0.06), 0 0 0 1px #f1f5f9",
                  padding: "48px 44px",
                  display: "grid",
                  gridTemplateColumns: "1.15fr 0.85fr",
                  gap: 48,
                  alignItems: "center"
                }}
                className="roadmap-card-grid"
              >
                {/* Left Side: Step Details & Value */}
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 100, background: current.accentBg, border: `1px solid ${current.accentBorder}`, color: current.accent, fontSize: 11, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: current.accent }} />
                    {current.tag}
                  </div>

                  <h3 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                    {current.headline}
                  </h3>

                  <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.65, marginBottom: 28 }}>
                    {current.desc}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                    {current.bullets.map((b, bIdx) => (
                      <div key={bIdx} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <CheckCircle2 size={19} color={current.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 14, color: "#1e293b", fontWeight: 600, lineHeight: 1.5 }}>
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={onStart}
                      style={{
                        background: current.accent === "#f97316"
                          ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                          : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        border: "none",
                        padding: "12px 26px",
                        borderRadius: 100,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: `0 4px 14px ${current.accentBg}`,
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <span>Get Started with Step {current.num}</span>
                      <ArrowRight size={15} />
                    </button>

                    <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
                      Takes less than 2 minutes · No CC required
                    </span>
                  </div>
                </div>

                {/* Right Side: Interactive Mockup Card */}
                <div style={{ background: "#f8fafc", borderRadius: 24, border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  {/* Mockup Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: current.accent, boxShadow: `0 0 10px ${current.accent}` }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", letterSpacing: "0.5px" }}>
                        {current.preview.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: current.accent, background: current.accentBg, border: `1px solid ${current.accentBorder}`, padding: "3px 10px", borderRadius: 100 }}>
                      {current.preview.badge}
                    </span>
                  </div>

                  {/* Status Banner */}
                  <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "16px 18px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                      Operating State
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                      {current.preview.status}
                    </div>
                  </div>

                  {/* Metrics Rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                    {[
                      { l: current.preview.metric1Label, v: current.preview.metric1Value },
                      { l: current.preview.metric2Label, v: current.preview.metric2Value },
                      { l: current.preview.metric3Label, v: current.preview.metric3Value }
                    ].map((m, mIdx) => (
                      <div key={mIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{m.l}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: current.accent }}>{m.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footnote Strip */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748b", fontWeight: 600, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    <span>Security Telemetry:</span>
                    <span style={{ color: "#0f172a", fontWeight: 700 }}>{current.preview.footnote}</span>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* 4 Bottom Micro-Step Cards for Instant Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 32 }} className="roadmap-quad-grid">
          {STEPS.map((s, i) => {
            const isSel = activeStep === i;
            return (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  background: isSel ? "#ffffff" : "#f8fafc",
                  border: isSel ? `1.5px solid ${s.accent}` : "1px solid #e2e8f0",
                  borderRadius: 18,
                  padding: "18px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isSel ? `0 4px 16px ${s.accentBg}` : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: s.accent, background: s.accentBg, padding: "2px 8px", borderRadius: 100 }}>
                    STEP {s.num}
                  </span>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isSel ? s.accent : "#cbd5e1" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .roadmap-card-grid {
            grid-template-columns: 1fr !important;
            padding: 32px 24px !important;
            gap: 32px !important;
          }
          .roadmap-quad-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .roadmap-quad-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
