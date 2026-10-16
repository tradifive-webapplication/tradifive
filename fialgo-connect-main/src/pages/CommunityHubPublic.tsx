import React, { useEffect, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { MessageSquare, Users, Activity, Rss, Star, TrendingUp, Shield, Globe, Zap, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarsBackground from "@/components/StarsBackground";
import { PublicFAQ } from "@/components/PublicFAQ";

const PALETTE = {
  blue: "#6366f1",
  violet: "#7c3aed",
  cyan: "#06b6d4",
  green: "#10b981",
};

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay } };
}

export default function CommunityHubPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login");

  const features = [
    {
      icon: <Activity size={28} />, color: "#6366f1", title: "Pulse Feed",
      badge: "Social Canvas",
      tagline: "Trade in public. Win in public.",
      desc: "Your live social trading canvas. Post verified chart setups, share real MT5-linked P&L milestones, and broadcast your market commentary. Everything is authenticated — no screenshot fraud.",
      points: ["Verified P&L sharing via MT5 link", "Stories, polls, and trade cards", "Follow top traders and get notified", "Algorithmic ranking for quality content"],
      mockup: (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
          <img src="/community-app-mockup.png" alt="Community Feed Screenshot" style={{ width: "100%", borderRadius: 20, border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }} />
        </motion.div>
      )
    },
    {
      icon: <Rss size={28} />, color: "#7c3aed", title: "Signal Channels",
      badge: "Real-Time Signals",
      tagline: "Get signals from the best.",
      desc: "Join dedicated broadcast rooms run by elite, verified traders. Every signal is timestamped and traceable. No Telegram bots, no unverified gurus — just real performance data.",
      points: ["Live signal push to your dashboard", "Performance score for each channel", "Subscribe for free or via exclusive invite", "Archive of past signals with outcomes"],
      mockup: (
        <div style={{ background: "#0a0a10", borderRadius: 20, padding: 20, border: "1px solid rgba(124,58,237,0.1)" }}>
          {[
            { name: "AlphaFX Pro", sub: "2.4k subs", win: "78% win rate", signal: "LONG GBP/USD @ 1.2840", color: "#7c3aed" },
            { name: "Quant Edge", sub: "1.1k subs", win: "71% win rate", signal: "SHORT XAUUSD @ 1945", color: "#6366f1" },
          ].map((ch, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }} viewport={{ once: true }}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px", marginBottom: i === 0 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{ch.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{ch.sub} · {ch.win}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${ch.color}22`, border: `1px solid ${ch.color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Rss size={14} color={ch.color} />
                </div>
              </div>
              <div style={{ background: `${ch.color}12`, border: `1px solid ${ch.color}30`, borderRadius: 10, padding: "10px 12px", color: ch.color, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
                📡 {ch.signal}
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      icon: <MessageSquare size={28} />, color: "#10b981", title: "Direct Messages",
      badge: "Private Chat",
      tagline: "Connect 1-on-1. No noise.",
      desc: "A clean, distraction-free inbox to communicate with anyone on the platform. Send trade ideas, collaborate on strategies, or reach out to a mentor — all without leaving Tradifive.",
      points: ["Real-time message delivery", "Send chart screenshots and trade links", "Read receipts and activity indicators", "Message request system for verified privacy"],
      mockup: (
        <div style={{ background: "#0a0a10", borderRadius: 20, padding: 20, border: "1px solid rgba(16,185,129,0.1)" }}>
          {[
            { from: "You", text: "Hey, what's your take on gold tonight?", align: "right", color: "#6366f1" },
            { from: "Marcus V.", text: "Watching the 1938 level. If it holds I'm going long with tight SL.", align: "left", color: "#10b981" },
            { from: "You", text: "Same. Got a 1:3 setup queued up 🎯", align: "right", color: "#6366f1" },
          ].map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.align === "right" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{ maxWidth: "80%", background: msg.align === "right" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${msg.align === "right" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.5 }}>
                {msg.align === "left" && <div style={{ color: "#10b981", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{msg.from}</div>}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )
    },
  ];

  const stats = [
    { n: "12,400+", l: "Active Traders" }, { n: "3.2M", l: "Posts & Signals" },
    { n: "94%", l: "Satisfaction Rate" }, { n: "47", l: "Countries Worldwide" },
  ];

  return (
    <div style={{ background: "#02040a", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { background: #02040a; }
        @media (max-width: 768px) {
          .feat-row { grid-template-columns: 1fr !important; }
          .hero-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <PublicNavbar onSignIn={handleStart} onSignUp={handleStart} onDownloadClick={() => navigate("/download")} />
      <StarsBackground />

      <main style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <section style={{ padding: "160px 24px 80px", position: "relative", overflow: "hidden", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="hero-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
          <motion.div {...fadeUp()}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
              <Users size={13} color="#6366f1" />
              <span style={{ color: "#6366f1", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Social Trading Network</span>
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
              The Community<br />
              <span style={{ background: "linear-gradient(to right, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hub.</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
              Stop trading in isolation. Connect with a global network of verified, elite traders. Share setups, follow signals, message mentors — all in one place.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={handleStart} className="btn-glow-primary" style={{ borderRadius: 100, padding: "14px 32px", fontSize: 15, fontWeight: 700 }}>
                Join the Network →
              </button>
              <button onClick={() => navigate("/features/discover")} className="btn-ghost" style={{ borderRadius: 100, padding: "14px 28px", fontSize: 14, fontWeight: 600 }}>
                Explore Features
              </button>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div {...fadeUp(0.2)} style={{ position: "relative" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, overflow: "hidden", padding: 24 }}>
              <div style={{ background: "rgba(99,102,241,0.08)", borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>🔴 Live — Pulse Feed</div>
                {[{ a: "👤", n: "Marcus V.", t: "LONG XAUUSD · +₹1,240 ✓", c: "#10b981" }, { a: "👤", n: "Elena R.", t: "EUR/USD Setup 📊", c: "#6366f1" }].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${p.c}22`, border: `1px solid ${p.c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{p.a}</div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{p.n}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{p.t}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(124,58,237,0.08)", borderRadius: 16, padding: "16px 20px" }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>📡 AlphaFX Pro — Signal</div>
                <div style={{ color: "#a855f7", fontWeight: 800, fontSize: 14, fontFamily: "monospace" }}>LONG GBP/USD @ 1.2840 · TP 1.2920</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>78% win rate · 2.4k followers</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="feat-row" role="list">
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "28px 20px", textAlign: "center" }} role="listitem">
              <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.n}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 6 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DESKTOP PLATFORM SHOWCASE */}
      <section style={{ padding: "20px 24px 80px", maxWidth: 1240, margin: "0 auto", position: "relative" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 18 }}>
            <Users size={13} color="#6366f1" />
            <span style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>FEATURE 01 · PLATFORM SHOWCASE</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4.5vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", marginBottom: 14 }}>
            The trading network built for modern traders.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 680, margin: "0 auto", lineHeight: 1.6 }}>
            Share ideas, post analysis, follow creators, join public or private channels, and connect with traders worldwide through a beautifully designed social canvas.
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
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.85), 0 0 60px rgba(99,102,241,0.08)",
            overflow: "hidden"
          }}
        >
          {/* Ambient backlight glow */}
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 200, background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          
          {/* Window Header Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5 }}>Tradifive Terminal · Community Network</div>
            <div style={{ width: 32 }} />
          </div>

          {/* Screenshot */}
          <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12, background: "#08090d" }}>
            <img
              src="/homedesktop.png"
              alt="Community Hub Platform"
              style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
            />
          </div>
        </motion.div>
      </section>

      {/* FEATURE DEEP-DIVES */}
      <section style={{ padding: "20px 24px 120px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>The 3-in-1 Social Suite</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>Everything a serious trader needs to connect, collaborate, and grow with the community.</p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {features.map((feat, i) => (
            <motion.div key={i} {...fadeUp(0.1)} className="feat-row" style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${feat.color}15`, border: `1px solid ${feat.color}30`, borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
                  <span style={{ color: feat.color, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{feat.badge}</span>
                </div>
                <h3 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 16 }}>
                  {feat.tagline}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>{feat.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {feat.points.map((pt, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: `${feat.color}20`, border: `1px solid ${feat.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ChevronRight size={10} color={feat.color} />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>{feat.mockup}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div {...fadeUp()} style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 20 }}>
            Ready to join the network?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 36 }}>Free to start. No credit card required.</p>
          <button onClick={handleStart} className="btn-glow-primary" style={{ borderRadius: 100, padding: "16px 44px", fontWeight: 800, fontSize: 16 }}>
            Join TradiFive Free →
          </button>
        </motion.div>
      </section>

      <PublicFAQ />
      </main>

      <PublicFooter />
    </div>
  );
}
