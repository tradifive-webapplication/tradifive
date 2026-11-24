import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Shield, BookOpen, Brain, Cpu, Users, 
  ArrowRight, CheckCircle2, AlertTriangle, Zap, Activity,
  TrendingUp, Sparkles, Clock, Lock, Layers
} from "lucide-react";

interface EcosystemDeepDiveProps {
  onStart: () => void;
}

export default function EcosystemDeepDive({ onStart }: EcosystemDeepDiveProps) {
  const [activeTab, setActiveTab] = useState<"risk" | "journal" | "algo" | "community">("risk");
  const [simTick, setSimTick] = useState(0);

  // Live simulation ticker for animated UI elements
  useEffect(() => {
    const timer = setInterval(() => {
      setSimTick((p) => (p + 1) % 100);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const TABS = [
    { id: "risk", label: "Institutional Risk Guard", short: "Risk Guard", icon: ShieldCheck, color: "#2563eb", badge: "AUTONOMOUS LOCK" },
    { id: "journal", label: "AI Trade Journal & Coach", short: "AI Journal", icon: BookOpen, color: "#7c3aed", badge: "AUTO-SYNC MT5" },
    { id: "algo", label: "FiAlgo Automated Engine", short: "AutoTrade", icon: Cpu, color: "#0ea5e9", badge: "GOLD M1 .EX5" },
    { id: "community", label: "Verified Social Network", short: "Community", icon: Users, color: "#10b981", badge: "VERIFIED P&L" },
  ] as const;

  return (
    <section id="technology" style={{ padding: "100px 24px", position: "relative", backgroundColor: "transparent" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)", padding: "6px 18px", borderRadius: 100, marginBottom: 20 }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 8px #2563eb" }} />
            <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase" }}>Core Platform Technology</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(28px, 4.2vw, 48px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.035em", lineHeight: 1.15, marginBottom: 16 }}
          >
            Built to Enforce Discipline & Amplify Profitability.
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            style={{ fontSize: 17, color: "#475569", maxWidth: 620, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Explore how our Institutional Risk Guard, AI Trade Journal, and algorithmic engine safeguard your capital and transform your trading psychology.
          </motion.p>
        </div>

        {/* Tab Selection Bar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40, overflowX: "auto", padding: "4px 0" }}>
          <div style={{ display: "inline-flex", background: "#f1f5f9", padding: 5, borderRadius: 100, border: "1px solid #e2e8f0", gap: 4 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 100,
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    outline: "none",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s ease",
                    color: isActive ? "#0f172a" : "#64748b",
                    background: "transparent",
                    zIndex: 1,
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#ffffff",
                        borderRadius: 100,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(226,232,240,0.8)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={16} color={isActive ? tab.color : "#94a3b8"} strokeWidth={2.2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Showcase Container */}
        <AnimatePresence mode="wait">
          {activeTab === "risk" && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "#ffffff",
                borderRadius: 28,
                border: "1px solid #e2e8f0",
                boxShadow: "0 15px 45px -10px rgba(0,0,0,0.05), 0 0 0 1px #f1f5f9",
                padding: "44px 40px",
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 48,
                alignItems: "center",
              }}
              className="showcase-card-grid"
            >
              {/* Left Column: Copy & Value Proposition */}
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(37,99,235,0.08)", color: "#2563eb", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 18 }}>
                  <Shield size={13} />
                  Autonomous Risk Enforcement
                </div>

                <h3 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                  Stop Blowing Accounts. <br />
                  Enforce Unbreakable Risk Rules.
                </h3>

                <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.65, marginBottom: 28 }}>
                  Most traders fail not from lack of technical skill, but from emotional spiraling, overleveraging, and revenge trading. 
                  Tradifive's <strong>Institutional Risk Guard</strong> connects directly to your MetaTrader 5 terminal with zero-latency execution locks, keeping your capital safe when emotions run high.
                </p>

                {/* Feature Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                  {[
                    { title: "Daily Max Drawdown Circuit Breaker", desc: "Once your daily loss limit (e.g., ₹5,000) is hit, your terminal locks automatically for the day. No override, no revenge trades." },
                    { title: "Revenge Trading & Cooldown Lockout", desc: "Detects rapid consecutive losses and enforces a mandatory 30-minute mental cooldown before your next order can execute." },
                    { title: "Spread Anomaly & Economic News Shield", desc: "Auto-pauses executions 30 minutes before high-impact news (FOMC, CPI, NFP) to prevent extreme slippage." },
                    { title: "Intraday Profit Trailing Stop", desc: "Automatically protects floating profits once peak daily milestones are achieved, ensuring winning days finish in green." }
                  ].map((feat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <CheckCircle2 size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a", fontWeight: 700, display: "block" }}>{feat.title}</strong>
                        <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "block", marginTop: 2 }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metric Strip */}
                <div style={{ display: "flex", gap: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>0.02s</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Lockout Response</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>100%</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Funds Custody In Broker</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#2563eb", letterSpacing: "-0.02em" }}>8 Modules</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Active Protection</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Animated Simulation Card */}
              <div style={{ background: "#f8fafc", borderRadius: 24, border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                {/* Terminal Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", letterSpacing: "0.5px" }}>RISK GUARD ENFORCER</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3px 10px", borderRadius: 100 }}>
                    ACTIVE & MONITORING
                  </span>
                </div>

                {/* Drawdown Gauge Box */}
                <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: "18px", marginBottom: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Daily Drawdown Limit</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>₹1,850 / ₹5,000 max</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 100, overflow: "hidden", marginBottom: 10 }}>
                    <motion.div 
                      style={{ height: "100%", background: "linear-gradient(90deg, #10b981 0%, #3b82f6 70%, #f59e0b 100%)", borderRadius: 100 }}
                      animate={{ width: ["37%", "42%", "37%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                    <span>Safe Operational Zone</span>
                    <span style={{ color: "#10b981" }}>37% Utilized · 63% Capital Shielded</span>
                  </div>
                </div>

                {/* Micro Metric Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Max Open Trades</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>3 / 3 Enforced</div>
                    <div style={{ fontSize: 10, color: "#10b981", marginTop: 2 }}>Zero Overleveraging</div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Spread Filter</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>1.2 pips normal</div>
                    <div style={{ fontSize: 10, color: "#3b82f6", marginTop: 2 }}>News Shield Active</div>
                  </div>
                </div>

                {/* Event Audit Stream */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "14px", fontSize: 11.5, fontFamily: "monospace" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", marginBottom: 8, fontWeight: 700 }}>
                    <Activity size={13} color="#2563eb" />
                    <span>REAL-TIME AUDIT LOG</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, color: "#334155" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>15:10:04 MT5 Order Check</span>
                      <span style={{ color: "#10b981" }}>PASS ✓ (Lot size within 1% risk)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>15:18:22 Revenge Prevention</span>
                      <span style={{ color: "#2563eb" }}>ARMED (Cooldown ready)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>15:25:00 Circuit Breaker</span>
                      <span style={{ color: "#10b981" }}>READY (Auto-cut at -₹5,000)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "journal" && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "#ffffff",
                borderRadius: 28,
                border: "1px solid #e2e8f0",
                boxShadow: "0 15px 45px -10px rgba(0,0,0,0.05), 0 0 0 1px #f1f5f9",
                padding: "44px 40px",
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 48,
                alignItems: "center",
              }}
              className="showcase-card-grid"
            >
              {/* Left Column: AI Trade Journal Copy */}
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 18 }}>
                  <Brain size={13} />
                  Automated Psychology & Analytics
                </div>

                <h3 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                  Zero Manual Entry. <br />
                  AI That Fixes Your Mental Edge.
                </h3>

                <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.65, marginBottom: 28 }}>
                  Spreadsheets and manual notes get abandoned within two weeks. Tradifive auto-syncs every single tick and trade directly from your MT5 broker, applying deep machine learning to grade setups and pinpoint costly psychological traps.
                </p>

                {/* Feature Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                  {[
                    { title: "Zero-Latency Broker Sync", desc: "No CSV uploads. Trades, entries, exits, fees, and execution durations import automatically in real time." },
                    { title: "Psychological Leakage Detection", desc: "Uncovers behavioral patterns: 'You have a 71% loss rate when entering trades after 7 PM' or 'Holding losers 3x longer than winners'." },
                    { title: "Automated Trade Grading (A+ to F)", desc: "Every execution is scored based on discipline, risk-reward ratio, adherence to plan, and timing efficiency." },
                    { title: "Session & Timeframe Analytics", desc: "Know with mathematical certainty whether London, New York, or Asian session generates your highest expectancy." }
                  ].map((feat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <CheckCircle2 size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a", fontWeight: 700, display: "block" }}>{feat.title}</strong>
                        <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "block", marginTop: 2 }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metric Strip */}
                <div style={{ display: "flex", gap: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>40+</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Quantitative Metrics</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>0 sec</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Manual Entry Time</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#7c3aed", letterSpacing: "-0.02em" }}>24/7</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>AI Psychology Coach</div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Journal Trade Audit Mockup */}
              <div style={{ background: "#f8fafc", borderRadius: 24, border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>AI TRADE AUDIT</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "3px 10px", borderRadius: 100 }}>
                    GRADE: A+ (DISCIPLINE 98%)
                  </span>
                </div>

                {/* Trade Details Card */}
                <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: "18px", marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>XAU/USD (Gold)</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginLeft: 8, background: "#ecfdf5", padding: "2px 6px", borderRadius: 4 }}>BUY 0.50 LOT</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#10b981" }}>+₹18,450.00</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: "#64748b", fontWeight: 500 }}>
                    <span>Entry: <strong>2,642.10</strong></span>
                    <span>Exit: <strong>2,654.80</strong></span>
                    <span>R:R: <strong style={{ color: "#2563eb" }}>1:3.4</strong></span>
                  </div>
                </div>

                {/* AI Psychology Feedback */}
                <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(37,99,235,0.04) 100%)", borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)", padding: "16px", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7c3aed", fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>
                    <Sparkles size={13} />
                    AI Behavioral Analysis
                  </div>
                  <p style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.55, margin: 0 }}>
                    "Outstanding patience during the 15-minute consolidation pullback. Stop loss was strictly respected at swing low. Zero early panic exit detected."
                  </p>
                </div>

                {/* Discovered Edge */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Identified Edge:</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a" }}>London/NY Overlap Win-Rate: <span style={{ color: "#10b981" }}>76.4%</span></span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "algo" && (
            <motion.div
              key="algo"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "#ffffff",
                borderRadius: 28,
                border: "1px solid #e2e8f0",
                boxShadow: "0 15px 45px -10px rgba(0,0,0,0.05), 0 0 0 1px #f1f5f9",
                padding: "44px 40px",
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 48,
                alignItems: "center",
              }}
              className="showcase-card-grid"
            >
              {/* Left Column: AutoTrade Copy */}
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(14,165,233,0.08)", color: "#0284c7", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 18 }}>
                  <Cpu size={13} />
                  Algorithmic Execution
                </div>

                <h3 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                  FiAlgo V1 Gold Engine (.ex5). <br />
                  Institutional Algorithmic Trading.
                </h3>

                <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.65, marginBottom: 28 }}>
                  Deploy our battle-tested Gold (XAUUSD) algorithm on any MetaTrader 5 broker. Designed to eliminate manual fatigue, capitalize on micro-liquidity sweeps on the M1 timeframe, and enforce non-negotiable risk limits.
                </p>

                {/* Feature Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                  {[
                    { title: "100% Capital Custody in Your Broker", desc: "Trade on Exness, IC Markets, Vantage, or any regulated MT5 broker. Tradifive never holds your capital." },
                    { title: "0% Profit Share Enterprise License", desc: "Pay once for a 3-Year hardware-bound key and keep 100% of your profits, or start with our 50/50% performance partnership." },
                    { title: "Economic News Auto-Shutdown", desc: "Automatically halts order execution 30 minutes before and after FOMC, CPI, and NFP announcements." },
                    { title: "High-Water Mark Loss Protection", desc: "On profit-sharing plans, prior losses are carried forward. You never pay a single rupee in fee until past losses are fully recovered." }
                  ].map((feat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <CheckCircle2 size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a", fontWeight: 700, display: "block" }}>{feat.title}</strong>
                        <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "block", marginTop: 2 }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metric Strip */}
                <div style={{ display: "flex", gap: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>M1</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Timeframe Optimization</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>0% Cut</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Enterprise Profits Kept</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0284c7", letterSpacing: "-0.02em" }}>3 Days</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Free MT5 Demo Trial</div>
                  </div>
                </div>
              </div>

              {/* Right Column: AutoTrade Engine Telemetry Mockup */}
              <div style={{ background: "#f8fafc", borderRadius: 24, border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0ea5e9" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>FIALGO ENGINE TELEMETRY</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0284c7", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "3px 10px", borderRadius: 100 }}>
                    PAIR: XAUUSD · M1
                  </span>
                </div>

                {/* Telemetry Status */}
                <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: "18px", marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Active MT5 Broker</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Exness / IC Markets</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Trailing Risk Breaker</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>Active & Bound (4ms)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>This Week Net Return</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#10b981" }}>+₹34,820.00</span>
                  </div>
                </div>

                {/* Security Shield Banner */}
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <ShieldCheck size={24} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: 12.5, color: "#065f46", display: "block" }}>Zero Capital Access Guarantee</strong>
                    <span style={{ fontSize: 11.5, color: "#047857", lineHeight: 1.4, display: "block", marginTop: 2 }}>
                      Tradifive executes read/trade commands only. Withdrawals are physically impossible from outside your broker.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "#ffffff",
                borderRadius: 28,
                border: "1px solid #e2e8f0",
                boxShadow: "0 15px 45px -10px rgba(0,0,0,0.05), 0 0 0 1px #f1f5f9",
                padding: "44px 40px",
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 48,
                alignItems: "center",
              }}
              className="showcase-card-grid"
            >
              {/* Left Column: Community Copy */}
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(16,185,129,0.08)", color: "#059669", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 18 }}>
                  <Users size={13} />
                  Verified Social Network
                </div>

                <h3 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                  Verified Track Records. <br />
                  No Fake Screenshots.
                </h3>

                <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.65, marginBottom: 28 }}>
                  The retail trading world is flooded with inspect-element screenshots and unverified claims. Tradifive calculates performance statistics directly from MT5 broker connections so you can follow and learn from genuinely profitable traders.
                </p>

                {/* Feature Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                  {[
                    { title: "Real MT5 Broker Verification", desc: "Every win-rate, profit factor, and drawdown metric is calculated straight from broker API feeds." },
                    { title: "Monthly Trading Competitions", desc: "Trade on live or demo accounts to climb the public leaderboard and win cash rewards and funded accounts." },
                    { title: "Creator Channels & Mentorship", desc: "Subscribe to elite traders' broadcast rooms for real-time market commentary, trade rationales, and live webinars." },
                    { title: "24-Hour Trading Stories", desc: "Share charts, entry triggers, and daily milestones with a community that understands the trading journey." }
                  ].map((feat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ fontSize: 14, color: "#0f172a", fontWeight: 700, display: "block" }}>{feat.title}</strong>
                        <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "block", marginTop: 2 }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metric Strip */}
                <div style={{ display: "flex", gap: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>12,400+</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Active Traders</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>₹2.8M</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Prizes Awarded</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#059669", letterSpacing: "-0.02em" }}>100%</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Verified Telemetry</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Social Leaderboard & Feed Mockup */}
              <div style={{ background: "#f8fafc", borderRadius: 24, border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>LIVE LEADERBOARD · NOV CUP</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3px 10px", borderRadius: 100 }}>
                    ₹5,00,000 PRIZE POOL
                  </span>
                </div>

                {/* Top 3 Leaderboard rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  {[
                    { rank: "#1", name: "Elena R.", pnl: "+₹14,820", wr: "78.4%", badge: "🥇 Gold Cup" },
                    { rank: "#2", name: "David M.", pnl: "+₹11,210", wr: "72.1%", badge: "🥈 Silver" },
                    { rank: "#3", name: "You (Verified)", pnl: "+₹8,847", wr: "69.5%", badge: "🥉 Top 3" },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#2563eb", width: 24 }}>{row.rank}</span>
                        <div>
                          <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{row.name}</strong>
                          <span style={{ fontSize: 10.5, color: "#64748b" }}>Win-Rate: {row.wr}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>{row.pnl}</div>
                        <span style={{ fontSize: 10, color: "#64748b" }}>{row.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Story Share Strip */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Live Trading Stories:</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb" }}>42 traders posted today →</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .showcase-card-grid {
            grid-template-columns: 1fr !important;
            padding: 28px 20px !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}
