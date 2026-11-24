import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, BookOpen, BarChart3, Briefcase, GraduationCap, 
  Brain, ShieldCheck, ArrowRight, Play, CheckCircle2, TrendingUp,
  Clock, AlertTriangle, Shield, Layers, Zap
} from "lucide-react";

interface InteractiveAppSwitcherProps {
  onStart: () => void;
}

type TabKey = "dashboard" | "journal" | "analytics" | "propdesk" | "study" | "coach";

export default function InteractiveAppSwitcher({ onStart }: InteractiveAppSwitcherProps) {
  const [mode, setMode] = useState<"classic" | "custom">("classic");
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const TABS: { id: TabKey; label: string; icon: any; side: "left" | "right" }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid, side: "left" },
    { id: "journal", label: "Journal", icon: BookOpen, side: "left" },
    { id: "analytics", label: "Analytics", icon: BarChart3, side: "left" },
    { id: "propdesk", label: "Prop desk", icon: Briefcase, side: "right" },
    { id: "study", label: "Study", icon: GraduationCap, side: "right" },
    { id: "coach", label: "Coach", icon: Brain, side: "right" },
  ];

  const TAB_DETAILS: Record<TabKey, {
    title: string;
    tagline: string;
    bullets: string[];
    stat: string;
  }> = {
    dashboard: {
      title: "Dashboard",
      tagline: "Where the day starts.",
      bullets: [
        "Total P&L, and the seven days that moved it",
        "The Tradifive Score: win rate, profit factor, average R, consistency, discipline"
      ],
      stat: "+$16,005 Net Profit"
    },
    journal: {
      title: "Journal",
      tagline: "Every execution auto-synced.",
      bullets: [
        "0.02s MetaTrader 5 order ingestion with zero manual spreadsheet entry",
        "Automated setup grading (Grade A+ to F) and psychological leak tagging"
      ],
      stat: "42 Trades Synced"
    },
    analytics: {
      title: "Analytics",
      tagline: "Mathematical edge unveiled.",
      bullets: [
        "Deep quantitative breakdown: Sharpe ratio, profit factor, session heatmaps",
        "Monte Carlo simulation & maximum adverse excursion (MAE) analysis"
      ],
      stat: "2.41 Profit Factor"
    },
    propdesk: {
      title: "Prop Desk & Risk Guard",
      tagline: "Autonomous capital protection.",
      bullets: [
        "Hard daily drawdown limit with instantaneous 0.02s terminal lockout",
        "Overleveraging & consecutive-loss cooling period enforcement"
      ],
      stat: "100% Capital Shielded"
    },
    study: {
      title: "Study Academy",
      tagline: "Battle-tested institutional playbooks.",
      bullets: [
        "Gold (XAUUSD) M1 liquidity sweep strategy blueprints and templates",
        "Risk management masterclasses designed for prop firm evaluations"
      ],
      stat: "14 Course Modules"
    },
    coach: {
      title: "AI Coach",
      tagline: "Your discipline partner that never sleeps.",
      bullets: [
        "Real-time alerts detecting emotional tilt and revenge trading habits",
        "Personalized post-market debriefs with actionable edge optimizations"
      ],
      stat: "Grade A+ Discipline"
    }
  };

  const currentDetail = TAB_DETAILS[activeTab];

  return (
    <section id="app-showcase" style={{ backgroundColor: "#ffffff", padding: "80px 24px 70px", position: "relative", overflow: "hidden" }}>
      
      {/* Background subtle atmospheric gradient */}
      <div 
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1000px",
          height: "600px",
          background: "radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.06) 0%, rgba(249,115,22,0.03) 50%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Section Header (Image Matching) */}
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: "clamp(30px, 4.4vw, 48px)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
              margin: "0 0 10px 0"
            }}
          >
            One journal for the whole session.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 16,
              color: "#64748b",
              fontWeight: 400,
              margin: "0 auto 22px auto"
            }}
          >
            Pick a part to see it in the app.
          </motion.p>

          {/* Switcher Toggle: [Classic] [Custom] */}
          <div 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              background: "#f1f5f9", 
              padding: "4px", 
              borderRadius: 100, 
              border: "1px solid #e2e8f0" 
            }}
          >
            <button
              onClick={() => setMode("classic")}
              style={{
                background: mode === "classic" ? "#2563eb" : "transparent",
                color: mode === "classic" ? "#ffffff" : "#64748b",
                border: "none",
                borderRadius: 100,
                padding: "6px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: mode === "classic" ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              Classic
            </button>
            <button
              onClick={() => setMode("custom")}
              style={{
                background: mode === "custom" ? "#2563eb" : "transparent",
                color: mode === "custom" ? "#ffffff" : "#64748b",
                border: "none",
                borderRadius: 100,
                padding: "6px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: mode === "custom" ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Selector Pills (< 960px) */}
        <div 
          className="show-below-lg" 
          style={{ 
            display: "none", 
            overflowX: "auto", 
            gap: 8, 
            paddingBottom: 16, 
            marginBottom: 16,
            scrollbarWidth: "none"
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 100,
                  background: active ? "rgba(37,99,235,0.08)" : "#ffffff",
                  border: active ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                  color: active ? "#2563eb" : "#475569",
                  fontWeight: active ? 700 : 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  cursor: "pointer"
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage with Desktop Flanking Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", gap: 24 }}>

          {/* LEFT SELECTOR COLUMN (Desktop) */}
          <div className="hide-below-lg" style={{ display: "flex", flexDirection: "column", gap: 36, width: 150, zIndex: 10 }}>
            {TABS.filter(t => t.side === "left").map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <div key={tab.id} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: "#ffffff",
                      border: active ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                      borderRadius: 100,
                      padding: "8px 16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.12), 0 4px 14px rgba(37,99,235,0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                      color: active ? "#2563eb" : "#0f172a",
                      fontWeight: active ? 700 : 600,
                      fontSize: 13.5,
                      width: "100%",
                      justifyContent: "flex-start",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: active ? "#2563eb" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#ffffff" : "#64748b" }}>
                      <Icon size={13} strokeWidth={2.2} />
                    </div>
                    <span>{tab.label}</span>
                  </button>

                  {/* Connector Line to App Window */}
                  {active && (
                    <motion.div 
                      layoutId="activeLeftConnector"
                      style={{
                        position: "absolute",
                        right: -24,
                        width: 24,
                        height: 2,
                        background: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end"
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 6px #2563eb", marginRight: -3 }} />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CENTER: macOS App Window */}
          <div style={{ maxWidth: 800, width: "100%", position: "relative" }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 22,
                boxShadow: "0 20px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px #e2e8f0",
                overflow: "hidden"
              }}
            >
              {/* macOS Header Bar */}
              <div
                style={{
                  height: 38,
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
                </div>

                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                  {activeTab === "dashboard" ? "Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </div>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>0.02s MT5 Bridge</span>
                </div>
              </div>

              {/* Window Content Display */}
              <div style={{ padding: "18px 20px", minHeight: 380, background: "#fafafa" }}>
                <AnimatePresence mode="wait">
                  
                  {/* 1. DASHBOARD VIEW */}
                  {activeTab === "dashboard" && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: 14 }}
                    >
                      {/* Announcement blue pill banner */}
                      <div 
                        style={{
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          borderRadius: 14,
                          padding: "10px 16px",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Your September recap is ready</span>
                          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 100 }}>56% Win Rate</span>
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 100 }}>
                          <Play size={10} fill="#ffffff" />
                          <span>Play</span>
                        </div>
                      </div>

                      {/* Big Hero Number: +$16,005 */}
                      <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
                        <div style={{ fontSize: "clamp(32px, 3.8vw, 44px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>
                          +$16,005
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 11.5, color: "#10b981", fontWeight: 700 }}>↑ +18.4% this month</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>•</span>
                          <span style={{ fontSize: 11.5, color: "#2563eb", fontWeight: 600 }}>Open journal →</span>
                        </div>
                      </div>

                      {/* Metric Widgets Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                          <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Avg RR</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>1.42R</div>
                        </div>

                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                          <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Win Rate</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: "#10b981", marginTop: 2 }}>56%</div>
                        </div>

                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                          <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Today</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: "#2563eb", marginTop: 2 }}>+$1,292</div>
                        </div>

                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                          <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Discipline</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: "#f97316", marginTop: 2 }}>89/100</div>
                        </div>
                      </div>

                      {/* Mini Live Chart Visual */}
                      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Equity Growth Curve</div>
                        <svg width="220" height="30" viewBox="0 0 220 30" style={{ overflow: "visible" }}>
                          <polyline
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2"
                            points="0,26 30,22 60,24 90,14 120,18 150,8 180,12 210,4"
                          />
                          <circle cx="210" cy="4" r="3.5" fill="#2563eb" />
                        </svg>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. JOURNAL VIEW */}
                  {activeTab === "journal" && (
                    <motion.div
                      key="journal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: 10 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Real-Time Trade Logs</div>
                        <span style={{ fontSize: 10.5, color: "#2563eb", background: "rgba(37,99,235,0.08)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>Auto-Synced MT5</span>
                      </div>

                      {[
                        { pair: "XAUUSD", dir: "BUY", lot: "0.50", pnl: "+$1,240.00", grade: "A+", tag: "#LiquiditySweep", pos: true },
                        { pair: "EURUSD", dir: "SELL", lot: "1.00", pnl: "+$420.50", grade: "A", tag: "#OrderBlock", pos: true },
                        { pair: "BTCUSD", dir: "BUY", lot: "0.10", pnl: "-$120.00", grade: "B", tag: "#StoppedOut", pos: false },
                      ].map((t, idx) => (
                        <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: t.pos ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: t.pos ? "#10b981" : "#ef4444" }}>
                              {t.dir}
                            </div>
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{t.pair} ({t.lot} lots)</div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>{t.tag}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: t.pos ? "#10b981" : "#ef4444" }}>{t.pnl}</div>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#2563eb" }}>Grade {t.grade}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* 3. ANALYTICS VIEW */}
                  {activeTab === "analytics" && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Quantitative Edge Analytics</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px" }}>
                          <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600 }}>Profit Factor</div>
                          <div style={{ fontSize: 24, fontWeight: 900, color: "#2563eb" }}>2.41</div>
                          <div style={{ fontSize: 10, color: "#10b981", marginTop: 2 }}>Top 5% of traders</div>
                        </div>
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px" }}>
                          <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600 }}>Sharpe Ratio</div>
                          <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>2.84</div>
                          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Institutional grade</div>
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Win/Loss Distribution</div>
                        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden" }}>
                          <div style={{ width: "56%", background: "#10b981" }} />
                          <div style={{ width: "44%", background: "#ef4444" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 4. PROP DESK / RISK GUARD VIEW */}
                  {activeTab === "propdesk" && (
                    <motion.div
                      key="propdesk"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Autonomous Risk Guard</div>
                        <span style={{ fontSize: 10.5, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>ARMED & ACTIVE (0.02s)</span>
                      </div>
                      
                      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                          <span style={{ color: "#64748b" }}>Daily Drawdown Limit</span>
                          <span style={{ fontWeight: 800, color: "#0f172a" }}>$1,850 / $5,000 max</span>
                        </div>
                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: "37%", height: "100%", background: "linear-gradient(90deg, #2563eb, #60a5fa)" }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#2563eb", fontWeight: 700, marginTop: 4 }}>37% utilized — 63% Capital Shielded ✓</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "#64748b" }}>Max Open Trades</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>3 / 3 Enforced</div>
                        </div>
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "#64748b" }}>Spread Shield</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>1.2 pips Normal</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 5. STUDY VIEW */}
                  {activeTab === "study" && (
                    <motion.div
                      key="study"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: 10 }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Institutional Strategy Playbooks</div>
                      {[
                        { title: "Module 01: Gold M1 Liquidity Sweeps", status: "Completed ✓", color: "#10b981" },
                        { title: "Module 02: MT5 Socket Architecture & Latency", status: "In Progress (60%)", color: "#2563eb" },
                        { title: "Module 03: Risk Math & Drawdown Elimination", status: "Unlocked", color: "#f97316" },
                      ].map((m, idx) => (
                        <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{m.title}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: m.color }}>{m.status}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* 6. COACH VIEW */}
                  {activeTab === "coach" && (
                    <motion.div
                      key="coach"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Tradifive AI Coach</div>
                        <span style={{ fontSize: 10.5, color: "#2563eb", fontWeight: 700 }}>Discipline Grade: A+</span>
                      </div>
                      <div style={{ background: "#ffffff", border: "1.5px solid #2563eb", borderRadius: 14, padding: "14px" }}>
                        <div style={{ fontSize: 11.5, color: "#0f172a", lineHeight: 1.5, fontWeight: 500 }}>
                          🎯 <strong>Session Observation:</strong> "Exceptional execution on Gold M1. You waited for the liquidity sweep at the London open and hit your 1.5R target without moving stops. Zero revenge trading detected."
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Explanatory Card (Matching Image) */}
            <motion.div
              key={activeTab + "-detail"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginTop: 18,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                boxShadow: "0 4px 18px rgba(0,0,0,0.03)"
              }}
            >
              {/* Left Column of Bottom Card */}
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  {currentDetail.title}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  Where <span style={{ color: "#2563eb", fontWeight: 600 }}>{currentDetail.tagline}</span>
                </div>
              </div>

              {/* Right Column with Bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 480 }}>
                {currentDetail.bullets.map((b, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "#475569", lineHeight: 1.45, display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: "#2563eb", fontWeight: 700 }}>•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT SELECTOR COLUMN (Desktop) */}
          <div className="hide-below-lg" style={{ display: "flex", flexDirection: "column", gap: 36, width: 150, zIndex: 10 }}>
            {TABS.filter(t => t.side === "right").map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <div key={tab.id} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  {/* Connector Line to App Window */}
                  {active && (
                    <motion.div 
                      layoutId="activeRightConnector"
                      style={{
                        position: "absolute",
                        left: -24,
                        width: 24,
                        height: 2,
                        background: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start"
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 6px #2563eb", marginLeft: -3 }} />
                    </motion.div>
                  )}

                  <button
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: "#ffffff",
                      border: active ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                      borderRadius: 100,
                      padding: "8px 16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.12), 0 4px 14px rgba(37,99,235,0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                      color: active ? "#2563eb" : "#0f172a",
                      fontWeight: active ? 700 : 600,
                      fontSize: 13.5,
                      width: "100%",
                      justifyContent: "flex-start",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: active ? "#2563eb" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#ffffff" : "#64748b" }}>
                      <Icon size={13} strokeWidth={2.2} />
                    </div>
                    <span>{tab.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
