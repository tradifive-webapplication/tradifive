import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { RefreshCw, TrendingUp, CheckCircle2, BrainCircuit, BarChart2, Search, Calendar, Trophy, Tag, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarsBackground from "@/components/StarsBackground";
import { PublicFAQ } from "@/components/PublicFAQ";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

const METRICS = [
  { label: "Win Rate", value: "72.4%", change: "+3.2%", icon: <TrendingUp size={14} />, color: "#10b981" },
  { label: "Profit Factor", value: "2.14", change: "+0.18", icon: <BarChart2 size={14} />, color: "#6366f1" },
  { label: "Avg RR", value: "1:2.7", change: "+0.4", icon: <DollarSign size={14} />, color: "#f59e0b" },
  { label: "Sharpe Ratio", value: "1.83", change: "+0.22", icon: <CheckCircle2 size={14} />, color: "#a855f7" },
];

const TRADES = [
  { sym: "XAUUSD", dir: "BUY", pnl: "+$342.50", rr: "1:3.2", tag: "A+ Setup", win: true, time: "06:05 PM" },
  { sym: "US30", dir: "SELL", pnl: "-$125.00", rr: "1:1.1", tag: "Revenge", win: false, time: "04:30 PM" },
  { sym: "EURUSD", dir: "BUY", pnl: "+$87.20", rr: "1:2.0", tag: "Breakout", win: true, time: "02:15 PM" },
];

const FEATURES = [
  {
    icon: <RefreshCw size={20} />,
    color: "#6366f1",
    title: "100% Auto-Synced",
    desc: "Every execution, lot size, commission, and slippage is pulled directly from your MT5 terminal and Indian brokers (Zerodha, Dhan) in real time. Zero manual data entry — ever.",
  },
  {
    icon: <TrendingUp size={20} />,
    color: "#10b981",
    title: "40+ Performance Metrics",
    desc: "Win rate, profit factor, Sharpe ratio, average hold time, drawdown streaks — all calculated automatically and visualised in interactive charts.",
  },
  {
    icon: <Tag size={20} />,
    color: "#f59e0b",
    title: "Custom Trade Tagging",
    desc: "Tag every trade with custom labels — 'A+ Setup', 'FOMO', 'Revenge Trade'. Then filter your data to discover exactly what each pattern costs you.",
  },
  {
    icon: <Clock size={20} />,
    color: "#a855f7",
    title: "Session & Time Analysis",
    desc: "Discover your most profitable time of day, day of week, and optimal trade duration. Know exactly when your edge is at its peak.",
  },
  {
    icon: <BrainCircuit size={20} />,
    color: "#ef4444",
    title: "AI Coach Insights",
    desc: "An AI engine analyses your journal patterns and delivers personalised insights — 'Your XAUUSD trades have 3× higher win rate during London session.'",
  },
  {
    icon: <Search size={20} />,
    color: "#0ea5e9",
    title: "Deep Filtering Engine",
    desc: "Filter your equity curve by asset, session, tag, day of week, or trade type. Find and eliminate the bad habits hiding inside your data.",
  },
];

const PROBLEMS = [
  "Requires hours of manual data entry after every session",
  "Prone to typos and skipped losing trades",
  "Impossible to calculate complex edge metrics manually",
  "Provides zero actionable, real-time insights",
];

const SOLUTIONS = [
  "Zero manual entry — all trades synced from MT5 & Indian brokers instantly",
  "Captures exact slippage, commission, and swap costs",
  "Calculates true risk-adjusted returns automatically",
  "AI highlights exactly what's working and what isn't",
];

export default function SmartJournalPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login");

  return (
    <div style={{ background: "#02040a", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .sj-hero { grid-template-columns: 1fr !important; }
          .sj-feat { grid-template-columns: 1fr 1fr !important; }
          .sj-ps { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .sj-feat { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <PublicNavbar onSignIn={handleStart} onSignUp={handleStart} onDownloadClick={() => navigate("/download")} />
      <StarsBackground />

      <main style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <section style={{ padding: "160px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(236,72,153,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="sj-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Left: Copy */}
          <motion.div {...fadeUp()}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
              <BrainCircuit size={13} color="#ec4899" />
              <span style={{ color: "#ec4899", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Smart Journal</span>
            </div>
            <h1 style={{ fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 24 }}>
              Stop Trading<br />
              <span style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Blind.
              </span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              The Smart Trade Journal automatically syncs every execution from your MT5 terminal and Indian broker accounts in real time — plotting your true edge across 40+ professional metrics. Find out exactly what setups make you money, and which ones are bleeding your account.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={handleStart} style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)", color: "#fff", border: "none", borderRadius: 100, padding: "13px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Connect Broker Free →
              </button>
              <button onClick={() => { const el = document.getElementById("sj-features"); el?.scrollIntoView({ behavior: "smooth" }); }} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "13px 28px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                See all features
              </button>
            </div>
          </motion.div>

          {/* Right: Journal Preview Widget */}
          <motion.div {...fadeUp(0.15)}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

              {/* Metrics row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
                {METRICS.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} viewport={{ once: true }}
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: m.color }}>
                      {m.icon}
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{m.label}</span>
                    </div>
                    <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{m.value}</div>
                    <div style={{ color: m.color, fontSize: 11, fontWeight: 700, marginTop: 2 }}>{m.change} this month</div>
                  </motion.div>
                ))}
              </div>

              {/* AI Insight */}
              <div style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <BrainCircuit size={14} color="#ec4899" />
                  <span style={{ color: "#ec4899", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>AI Coach Insight</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>
                  "Your XAUUSD win rate is 89% during the London session."
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Focus trading there to maximise your edge.</p>
              </div>

              {/* Recent trades */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TRADES.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.win ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{t.sym} <span style={{ color: t.dir === "BUY" ? "#10b981" : "#ef4444", fontSize: 11 }}>{t.dir}</span></div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{t.time} · {t.tag}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: t.win ? "#10b981" : "#ef4444", fontWeight: 800, fontSize: 13 }}>{t.pnl}</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>RR {t.rr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="sj-features" style={{ padding: "80px 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>Everything the Journal Tracks</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Professional-grade analytics, automatically generated from your real MT5 and Indian market trades.</p>
        </motion.div>

        <div className="sj-feat" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 24px" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: f.color }}>
                {f.icon}
              </div>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROBLEM vs SOLUTION */}
      <section style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>Manual Spreadsheets vs Smart Journal</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>The old way destroys your data quality. Here's what changes.</p>
        </motion.div>

        <div className="sj-ps" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Problem */}
          <motion.div {...fadeUp(0.1)} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 24, padding: "36px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 22 }}>📊</span>
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 900, fontSize: 17 }}>Manual Spreadsheets</h3>
                <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Inaccurate & Tedious</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PROBLEMS.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 900 }}>✕</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div {...fadeUp(0.2)} style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 24, padding: "36px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrainCircuit size={22} color="#ec4899" />
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 900, fontSize: 17 }}>Smart Journal</h3>
                <p style={{ color: "#ec4899", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Automated & Accurate</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SOLUTIONS.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: "#ec4899", fontSize: 10, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px 120px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(236,72,153,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div {...fadeUp()} style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 18 }}>
            Know your edge. Trade it with confidence.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 36 }}>Connect your MT5 or Indian broker account in 60 seconds. No spreadsheets required.</p>
          <button onClick={handleStart} style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)", color: "#fff", border: "none", borderRadius: 100, padding: "15px 40px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            Start Journaling Free →
          </button>
        </motion.div>
      </section>

      <PublicFAQ />
      </main>

      <PublicFooter />
    </div>
  );
}
