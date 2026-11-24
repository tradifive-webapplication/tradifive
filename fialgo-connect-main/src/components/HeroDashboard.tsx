import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

export default function HeroDashboard() {
  const [tick, setTick] = useState(0);
  const [trades] = useState([
    { pair: "EUR/USD", dir: "BUY", pnl: "+₹142.50", pos: true, time: "2s ago" },
    { pair: "XAU/USD", dir: "SELL", pnl: "+₹89.20", pos: true, time: "18s ago" },
    { pair: "BTC/USD", dir: "BUY", pnl: "-₹32.10", pos: false, time: "1m ago" },
    { pair: "GBP/JPY", dir: "BUY", pnl: "+₹211.00", pos: true, time: "3m ago" },
  ]);

  const chartPoints = [
    "0,80 40,65 80,70 120,45 160,55 200,30 240,40 280,20 320,35 360,15 400,25 440,10 480,18"
  ];

  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % 100), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-dashboard-container" style={{ position: "relative", width: "100%", maxWidth: 540, margin: "0 auto" }}>
      {/* Main glass terminal */}
      <motion.div
        initial={{ opacity: 0, x: 30, rotateY: -6 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #e2e8f0",
          borderRadius: 24,
          padding: "20px",
          boxShadow: "0 20px 50px -15px rgba(37,99,235,0.12), 0 0 0 1px #e2e8f0, 0 4px 12px rgba(0,0,0,0.03)",
          overflow: "visible",
          position: "relative"
        }}
      >
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#ef4444", "#f59e0b", "#10b981"].map(c => (
                <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", marginLeft: 6 }}>
              tradifive — live dashboard
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>LIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { l: "Total P&L", v: "+₹2,847", c: "#10b981", sub: "this week" },
            { l: "Win Rate", v: "73.4%", c: "#0f172a", sub: "last 50 trades" },
            { l: "Followers", v: "1,240", c: "#334155", sub: "on your profile" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "11px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.c, letterSpacing: "-0.03em" }}>{s.v}</div>
              <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px", marginBottom: 14, overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Equity Curve</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>↑ +18.4% this month</span>
          </div>
          <svg width="100%" height="70" viewBox="0 0 480 90" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline points={`${chartPoints[0]} 480,90 0,90`} fill="url(#chartGrad)" stroke="none" />
            <polyline
              points={chartPoints[0]}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="440" cy="10" r="4.5" fill="#10b981">
              <animate attributeName="r" values="4;6.5;4" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Live trades feed */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ padding: "9px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Trade Feed</span>
            <span style={{ fontSize: 10.5, color: "#10b981", fontWeight: 700 }}>● Synced</span>
          </div>
          {trades.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.4 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderBottom: i < trades.length - 1 ? "1px solid #f8fafc" : "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: t.dir === "BUY" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 8.5, fontWeight: 900, color: t.dir === "BUY" ? "#10b981" : "#ef4444" }}>{t.dir}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{t.pair}</div>
                  <div style={{ fontSize: 9.5, color: "#94a3b8" }}>{t.time}</div>
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: t.pos ? "#10b981" : "#ef4444" }}>{t.pnl}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating card 1: Top-Right Review Card (Marcus V.) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          position: "absolute",
          top: -14,
          right: -24,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "12px 14px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          width: 200,
          zIndex: 20
        }}
        className="hide-xs"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #1e293b, #475569)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 900, color: "#fff" }}>MV</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Marcus V.</div>
            <div style={{ fontSize: 9, color: "#64748b" }}>@marcus_trades • 2m</div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.45, margin: 0 }}>
          Closed EUR/USD +142 pips. Risk managed the whole way. Love the journal sync 🔥
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8, color: "#94a3b8", fontSize: 10, fontWeight: 600 }}>
          <span>❤️ 47</span>
          <span>💬 12</span>
          <span>🔁 8</span>
        </div>
      </motion.div>

      {/* Floating card 2: Bottom-Right Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        style={{
          position: "absolute",
          bottom: 30,
          right: -20,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "12px 14px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          width: 180,
          zIndex: 20
        }}
        className="hide-xs"
      >
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          🏆 Leaderboard
        </div>
        {[
          { rank: "#1", name: "Elena R.", pnl: "+₹4,820" },
          { rank: "#2", name: "David M.", pnl: "+₹3,210" },
          { rank: "#3", name: "You", pnl: "+₹2,847", you: true },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: i < 2 ? "1px solid #f1f5f9" : "none" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8" }}>{r.rank}</span>
              <span style={{ fontSize: 10.5, fontWeight: r.you ? 800 : 600, color: r.you ? "#f97316" : "#0f172a" }}>{r.name}</span>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#10b981" }}>{r.pnl}</span>
          </div>
        ))}
      </motion.div>

      {/* Floating card 3: Bottom-Left Risk Guard */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          position: "absolute",
          bottom: 40,
          left: -20,
          background: "#ffffff",
          border: "1.5px solid #2563eb",
          borderRadius: 16,
          padding: "12px 14px",
          boxShadow: "0 12px 30px rgba(37,99,235,0.14)",
          width: 175,
          zIndex: 20
        }}
        className="hide-xs"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Shield size={13} color="#2563eb" />
          <span style={{ fontSize: 9.5, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Risk Guard</span>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9.5, color: "#64748b" }}>Daily Limit</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: "#0f172a" }}>₹500</span>
          </div>
          <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4 }}>
            <div style={{ height: "100%", width: "34%", background: "linear-gradient(to right, #2563eb, #60a5fa)", borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 8.5, color: "#2563eb", marginTop: 4, fontWeight: 700 }}>34% used — Protected ✓</div>
        </div>
      </motion.div>
    </div>
  );
}
