import React, { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Shield, AlertTriangle, TrendingDown, Target, Activity, Zap, Lock, Eye, Bell, ChevronRight } from "lucide-react";
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

const RULES = [
  { label: "Max Daily Drawdown", value: "2.0%", status: "safe", bar: 0.34 },
  { label: "Max Loss per Trade", value: "0.5%", status: "safe", bar: 0.18 },
  { label: "Max Open Lots", value: "3.0 lots", status: "warn", bar: 0.72 },
  { label: "Kill Switch", value: "OFF", status: "off", bar: 0 },
];

const FEATURES = [
  {
    icon: <TrendingDown size={22} />,
    color: "#ef4444",
    title: "Drawdown Kill-Switch",
    desc: "Set a maximum drawdown threshold. When your account hits that level, all open trades are closed instantly and new orders are blocked — automatically, with no manual action.",
  },
  {
    icon: <Target size={22} />,
    color: "#f59e0b",
    title: "Per-Trade Risk Limit",
    desc: "Define the maximum risk per trade as a percentage of your account. Attempt to open a trade above this threshold, and TradiFive will alert you or block execution entirely.",
  },
  {
    icon: <Lock size={22} />,
    color: "#6366f1",
    title: "Session Lock",
    desc: "Automatically disable trading outside of your defined trading session windows — London, New York, or custom. Eliminate emotionally-driven after-hours mistakes.",
  },
  {
    icon: <Eye size={22} />,
    color: "#10b981",
    title: "Live Account Monitor",
    desc: "Track your real-time equity, floating P&L, open exposure, and margin level across all connected MT5 and Indian broker accounts in a single unified dashboard.",
  },
  {
    icon: <Bell size={22} />,
    color: "#a855f7",
    title: "Smart Alerts",
    desc: "Get push notifications when your drawdown reaches 50%, 75%, or 100% of your limit — giving you time to react before the kill-switch fires.",
  },
  {
    icon: <Zap size={22} />,
    color: "#0ea5e9",
    title: "Sub-Second Response",
    desc: "Our bridge communicates directly with your MT5 or Indian broker server. Kill-switch execution latency is measured in milliseconds — not seconds.",
  },
];

const STEPS = [
  { n: "01", title: "Connect your Broker", desc: "Add your broker credentials using our secure read-only bridge. No withdrawal permissions. Ever." },
  { n: "02", title: "Define your Risk Rules", desc: "Set your max daily drawdown %, max loss per trade, lot limits, and allowed trading sessions." },
  { n: "03", title: "TradiFive Monitors 24/7", desc: "Our engine checks your live account data every second against your rules while you trade or sleep." },
  { n: "04", title: "Kill-Switch Fires if Needed", desc: "If any rule is breached, all positions are closed and new orders are blocked — instantly and automatically." },
];

function RiskMeter({ label, value, bar, status }: { label: string; value: string; bar: number; status: string }) {
  const color = status === "safe" ? "#10b981" : status === "warn" ? "#f59e0b" : "#6366f1";
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 800, fontSize: 13 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${bar * 100}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          style={{ height: "100%", background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

export default function RiskGuardPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login");

  return (
    <div style={{ background: "#02040a", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .rg-hero { grid-template-columns: 1fr !important; }
          .rg-steps { grid-template-columns: 1fr 1fr !important; }
          .rg-feat { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .rg-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <PublicNavbar onSignIn={handleStart} onSignUp={handleStart} onDownloadClick={() => navigate("/download")} />
      <StarsBackground />

      <main style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <section style={{ padding: "160px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(239,68,68,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="rg-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Left: Copy */}
          <motion.div {...fadeUp()}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
              <Shield size={13} color="#ef4444" />
              <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Risk Guard</span>
            </div>
            <h1 style={{ fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 24 }}>
              Never Blow<br />
              <span style={{ background: "linear-gradient(135deg, #ef4444, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Another Account.
              </span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Risk Guard is your autonomous trading safety net. It monitors your live MT5 or Indian broker account in real time and fires an instant kill-switch the moment any of your predefined risk rules are breached — protecting your capital while you sleep, travel, or trade.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={handleStart} className="btn-glow-primary" style={{ borderRadius: 100, padding: "13px 28px", fontSize: 14, fontWeight: 700 }}>
                Enable Risk Guard →
              </button>
              <button onClick={() => { const el = document.getElementById("how-rg-works"); el?.scrollIntoView({ behavior: "smooth" }); }} className="btn-ghost" style={{ borderRadius: 100, padding: "13px 28px", fontSize: 14, fontWeight: 600 }}>
                How it works
              </button>
            </div>
          </motion.div>

          {/* Right: Live Monitor Widget */}
          <motion.div {...fadeUp(0.15)}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Risk Monitor</h3>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Live · Connected to Pepperstone MT5 / Zerodha</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 100 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700 }}>Active</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {RULES.map((r, i) => (
                  <RiskMeter key={i} {...r} />
                ))}
              </div>

              {/* Account Equity */}
              <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 14, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Account Equity</div>
                  <div style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>₹24,817.40</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#10b981", fontSize: 14, fontWeight: 800 }}>+₹342.20</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Today</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DESKTOP PLATFORM SHOWCASE */}
      <section style={{ padding: "40px 24px 100px", maxWidth: 1240, margin: "0 auto", position: "relative" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 18 }}>
            <Shield size={13} color="#10b981" />
            <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>FEATURE 02 · PLATFORM SHOWCASE</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4.5vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", marginBottom: 14 }}>
            Protect your capital before emotions take over.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 680, margin: "0 auto", lineHeight: 1.6 }}>
            Set daily loss limits, maximum drawdown rules, trading restrictions, and automated safeguards that help maintain discipline.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.15)}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: "16px",
            position: "relative",
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.85), 0 0 60px rgba(16,185,129,0.08)",
            overflow: "hidden"
          }}
        >
          {/* Ambient backlight glow */}
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 200, background: "radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          
          {/* Window Header Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5 }}>Tradifive Terminal · Risk Guard Engine</div>
            <div style={{ width: 32 }} />
          </div>

          {/* Screenshot */}
          <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12, background: "#08090d" }}>
            <img
              src="/riskguarddesktop.png"
              alt="Risk Guard Platform"
              style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
            />
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>Everything Risk Guard Does</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Six intelligent layers of protection for your trading account.</p>
        </motion.div>

        <div className="rg-feat" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: f.color }}>
                {f.icon}
              </div>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-rg-works" style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>How Risk Guard Works</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 420, margin: "0 auto" }}>Four steps from setup to protection — takes under 5 minutes.</p>
        </motion.div>

        <div className="rg-steps" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {STEPS.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 22px", position: "relative" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "rgba(255,255,255,0.04)", lineHeight: 1, marginBottom: 20, position: "absolute", top: 16, right: 20 }}>{s.n}</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#ef4444", fontWeight: 900, fontSize: 13 }}>
                {s.n}
              </div>
              <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h4>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.55 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(239,68,68,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div {...fadeUp()} style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 18 }}>
            Protect your capital today.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 36 }}>Set up Risk Guard in minutes. Free with every Tradifive account.</p>
          <button onClick={handleStart} className="btn-glow-primary" style={{ borderRadius: 100, padding: "15px 40px", fontWeight: 800, fontSize: 15 }}>
            Start Free →
          </button>
        </motion.div>
      </section>

      <PublicFAQ />
      </main>

      <PublicFooter />
    </div>
  );
}
