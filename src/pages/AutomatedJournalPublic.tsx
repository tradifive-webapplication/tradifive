import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, BarChart2, Sync, Search, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import tradifiveLogo from "@/assets/tradifive-login-logo.png";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    :root {
      --bg: #02040a;
      --ink: #ffffff;
      --ink2: rgba(255, 255, 255, 0.7);
      --ink3: rgba(255, 255, 255, 0.4);
      --slate: #94a3b8;
      --azure: #3b82f6;
    }
    body {
      background: var(--bg);
      color: var(--ink);
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3 {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.02em;
    }
    .text-glow {
      background: linear-gradient(to right, #fff 20%, #cccccc 80%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .feat-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 18px;
      transition: all 0.3s ease;
    }
    .feat-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-5px);
    }
    .noise {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: url('https://grainy-gradients.vercel.app/noise.svg');
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }
  `}</style>
);

export default function AutomatedJournalPublic() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#02040a", color: "#fff", position: "relative", overflow: "hidden" }}>
      <G />
      <div className="noise" />

      {/* Background Aura */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Global Edge Fades */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400, background: "linear-gradient(to bottom, #02040a 0%, transparent 100%)", zIndex: 10, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 400, background: "linear-gradient(to top, #02040a 0%, transparent 100%)", zIndex: 10, pointerEvents: "none" }} />

      {/* Nav */}
      <PublicNavbar onStart={() => navigate("/login")} />

      {/* Hero Section */}
      <section style={{ position: "relative", paddingTop: 180, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 60, alignItems: "center" }}>

          {/* Left Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 32, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3b82f6" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "none", letterSpacing: "0.2px" }}>Real-time Telemetry Sync</span>
            </div>

            <h1 style={{ fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.05em", marginBottom: 24, color: "#fff", fontFamily: "Inter, sans-serif" }}>
              <span style={{ background: "linear-gradient(to right, #3b82f6, #ffffff 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Data-Driven.</span><br />
              <span className="text-glow">Discipline.</span>
            </h1>

            <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, maxWidth: 540, marginBottom: 40, fontWeight: 400 }}>
              Stop lying to yourself. Our Automated Journal captures every trade, every emotional state, and every metric in real-time, syncing directly from your MT5 terminal.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginBottom: 48 }}>
              <div className="feat-card">
                <RefreshCw size={20} color="#3b82f6" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Auto-Sync</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Your trades are logged the moment they hit the server automatically.</p>
              </div>
              <div className="feat-card">
                <BarChart2 size={20} color="#3b82f6" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Advanced Analytics</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Deep dive into win-rate distribution with institutional precision.</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              style={{ padding: "14px 32px", borderRadius: 100, background: "#3b82f6", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", transition: "all 0.3s" }}
            >
              Open Your Journal
            </button>
          </motion.div>

          {/* Right Visual */}
          <div style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              position: "relative",
              left: "150px",
              top: "-40px",
              width: "100%",
              aspectRatio: "1/1",
              overflow: "hidden",
              borderRadius: "40px",
              background: "#02040a",
            }}>
              <img
                src="/Dis.jpeg"
                alt="Automated Journal"
                style={{ width: "100%", height: "100%", display: "block", opacity: 1, objectFit: "cover" }}
              />

              {/* 4-Way Black Fades */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: `
                  linear-gradient(to right, #02040a 0%, transparent 40%),
                  linear-gradient(to left, #02040a 0%, transparent 40%),
                  linear-gradient(to bottom, #02040a 0%, transparent 40%),
                  linear-gradient(to top, #02040a 0%, transparent 40%)
                `,
                pointerEvents: "none",
                zIndex: 6
              }} />
            </div>
          </div>

        </div>
      </section>

      {/* Showcase Section 1: The Tactical Calendar */}
      <section style={{ padding: "100px 40px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }} className="flex-col-sm">
            <div>
              <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Visual Performance</span>
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>The Tactical Calendar</h2>
              <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 32 }}>
                Visualize your performance with a high-fidelity calendar view. Every trading day is automatically color-coded based on your net PnL, allowing you to spot streaks and cycles instantly.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { t: "Institutional Precision", d: "Net PnL calculated down to the cent with automated swap and fee deduction." },
                  { t: "Cycle Recognition", d: "Spot behavioral patterns across days and weeks to optimize your performance." }
                ].map(f => (
                  <div key={f.t} style={{ display: "flex", gap: 16 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{f.t}</h4>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Calendar Visual */}
            <div style={{ background: "#0b0e14", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", padding: 24, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontWeight: 800, fontSize: 18 }}>March 2025</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={16} /></div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={16} /></div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", paddingBottom: 10 }}>{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const pnl = i % 7 === 0 ? -140 : i % 3 === 0 ? 250 : 0;
                  return (
                    <div key={i} style={{
                      aspectRatio: "1/1",
                      borderRadius: 12,
                      background: pnl > 0 ? "rgba(59, 130, 246, 0.15)" : pnl < 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      border: "1px solid",
                      borderColor: pnl > 0 ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: i === 14 ? "#3b82f6" : "rgba(255,255,255,0.4)" }}>{i + 1}</span>
                      {pnl !== 0 && <div style={{ width: 4, height: 4, borderRadius: "50%", background: pnl > 0 ? "#3b82f6" : "rgba(255,255,255,0.2)" }} />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section 2: Deep Telemetry */}
      <section style={{ padding: "140px 40px", background: "#02040a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center" }} className="flex-col-sm">

            {/* Mock Trade Review Visual */}
            <div style={{ position: "relative" }}>
              <div style={{ background: "#0b0e14", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", padding: 40, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Trade ID #8492</span>
                    <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>XAUUSD <span style={{ color: "rgba(255,255,255,0.4)" }}>SELL</span></h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#3b82f6" }}>+$1,240.50</span>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Execution: 420ms</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
                  <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Setups</span>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      {["Technical", "Trend"].map(s => (
                        <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", borderRadius: 6 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Mistakes</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>None Detected</p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 32 }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontStyle: "italic" }}>
                    "Perfect execution on the resistance break. Sentiment was heavy on USD, which provided the extra momentum for the final push."
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Data Intelligence</span>
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>Deep Telemetry Review</h2>
              <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 32 }}>
                Every trade is a lesson. Our journal automatically links your trade data with psychological tagging, allowing you to review your execution with surgical precision.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {[
                  { t: "Auto-Tagging", d: "Algorithmically detects entry accuracy and exit efficiency." },
                  { t: "Psychological Sync", d: "Link your state of mind to every execution." }
                ].map(f => (
                  <div key={f.t}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.t}</h4>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.d}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Showcase Section 3: Metrics of Excellence */}
      <section style={{ padding: "100px 40px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Institutional Analytics</span>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24 }}>Metrics of Excellence</h2>
            <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, maxWidth: 700, margin: "0 auto" }}>
              Beyond simple PnL. Understand your mathematical edge with metrics used by hedge funds and proprietary trading firms.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="flex-col-sm">
            {[
              { label: "Profit Factor", value: "1.84", sub: "Ratio of gross profit to gross loss.", color: "#3b82f6" },
              { label: "Sharpe Ratio", value: "2.1", sub: "Risk-adjusted performance benchmark.", color: "#3b82f6" },
              { label: "Win Rate", value: "64.2%", sub: "Percentage of profitable executions.", color: "#3b82f6" }
            ].map(m => (
              <div key={m.label} style={{ padding: 40, background: "#0b0e14", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>{m.label}</p>
                <h3 style={{ fontSize: 48, fontWeight: 900, color: m.color, marginBottom: 12 }}>{m.value}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section 4: Behavioral Edge */}
      <section style={{ padding: "140px 40px", background: "#02040a", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }} className="flex-col-sm">
            <div>
              <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Behavioral Psychology</span>
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>Discover Your Behavioral Edge</h2>
              <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 32 }}>
                TradiFive analyzes when you perform best. Discover which days of the week or hours of the day carry your highest expectancy.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { t: "Temporal Expectancy", d: "Identify which market sessions (London, NY, Tokyo) yield your best returns." },
                  { t: "Discipline Scoring", d: "Track how well you stick to your rules with automated rule-break detection." }
                ].map(f => (
                  <div key={f.t}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.t}</h4>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Chart Visual */}
            <div style={{ background: "#0b0e14", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", padding: 40, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5)" }}>
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Profit by Day of Week</h4>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Aggregated performance over last 90 days</p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200 }}>
                {[
                  { day: "Mon", val: 40 },
                  { day: "Tue", val: 85 },
                  { day: "Wed", val: 65 },
                  { day: "Thu", val: 95 },
                  { day: "Fri", val: 30 }
                ].map(d => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: "100%",
                      height: `${d.val}%`,
                      background: d.val > 60 ? "#3b82f6" : "rgba(59, 130, 246, 0.2)",
                      borderRadius: "8px 8px 4px 4px",
                      transition: "all 0.3s"
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section 5: High-Precision Sync */}
      <section style={{ padding: "100px 40px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={24} color="#3b82f6" />
            </div>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>Zero-Latency Sync</h2>
          <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 40 }}>
            Connect your MT5 account via MetaAPI and watch your journal populate in real-time. No manual entry, no CSV imports. Just pure, automated data flow.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
            {[
              { t: "99.9% Uptime", d: "Reliable bridge architecture." },
              { t: "Instant Import", d: "Trades appear within seconds." },
              { t: "Multi-Account", d: "Journal all your accounts in one place." }
            ].map(f => (
              <div key={f.t} style={{ textAlign: "center" }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{f.t}</h4>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
