import React, { useState, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { 
  Monitor, Smartphone, Apple, Zap, Shield, Bell, 
  BarChart2, MessageSquare, Trophy, Star, 
  LayoutDashboard, ShieldCheck, Rss, BookOpen, Users, BookText, Sparkles, Crown 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PremiumBackground from "@/components/PremiumBackground";
import { toast } from "sonner";

function fadeUp(delay = 0) {
  return { 
    initial: { opacity: 0, y: 30 }, 
    whileInView: { opacity: 1, y: 0 }, 
    viewport: { once: true }, 
    transition: { duration: 0.6, delay } 
  };
}

const MOBILE_FEATURES = [
  { icon: <BarChart2 size={20} />, title: "Live Portfolio", desc: "Track all your MT5 accounts in real time. P&L, drawdown, win rate, and open positions — all in your pocket." },
  { icon: <Bell size={20} />, title: "Smart Alerts", desc: "AI-powered price alerts, risk limit warnings, and journal reminders sent directly as push notifications." },
  { icon: <Shield size={20} />, title: "Risk Guard Mobile", desc: "Monitor and adjust your max drawdown limits and kill-switch settings on the go. Never miss a critical moment." },
  { icon: <MessageSquare size={20} />, title: "Community Feed", desc: "Browse the Pulse Feed, follow signal channels, and chat with traders from anywhere in the world." },
  { icon: <Trophy size={20} />, title: "Competition Tracker", desc: "Watch your live rank in ongoing tournaments. Get notified when you enter or leave the prize zone." },
  { icon: <Zap size={20} />, title: "AI Journal on Mobile", desc: "Log trades manually or let AI auto-populate your journal from your MT5 history, all from your phone." },
];

const SCREENS = [
  { title: "Dashboard", desc: "Full P&L overview at a glance", icon: <LayoutDashboard size={24} color="#6366f1" /> },
  { title: "Risk Guard", desc: "Live drawdown monitoring", icon: <ShieldCheck size={24} color="#10b981" /> },
  { title: "Pulse Feed", desc: "Social trading feed", icon: <Rss size={24} color="#a855f7" /> },
  { title: "Smart Journal", desc: "AI-powered trade log", icon: <BookOpen size={24} color="#06b6d4" /> },
];

const DESKTOP_FEATURES = [
  { icon: <Monitor size={20} />, title: "Multi-Monitor Layout", desc: "Drag, resize, and arrange every panel across multiple screens for a true professional trading environment." },
  { icon: <Zap size={20} />, title: "Direct MT5 Bridge", desc: "Sub-10ms execution bridge to your MT5 terminal. No browser lag, no API rate limits." },
  { icon: <BarChart2 size={20} />, title: "Advanced Charting", desc: "Full TradingView-grade charts with custom indicators, drawing tools, and multi-timeframe analysis." },
  { icon: <Shield size={20} />, title: "Full Risk Guard Console", desc: "Full-featured risk engine with kill-switch, max drawdown rules, and real-time PnL monitoring per account." },
];

function SocialFeedScreen() {
  return (
    <div style={{ padding: "10px 14px", overflowY: "hidden", height: "100%" }}>
      {/* Top nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Feed</span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            <div style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: "#6366f1" }} />
          </div>
        </div>
      </div>
      {/* Story strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "hidden" }}>
        {["MV", "ER", "DM", "JK"].map((init, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${["#6366f1", "#10b981", "#f59e0b", "#ec4899"][i]}, ${["#a855f7", "#3b82f6", "#ef4444", "#8b5cf6"][i]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", border: "2px solid rgba(255,255,255,0.2)" }}>{init}</div>
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>Story</span>
          </div>
        ))}
      </div>
      {/* Posts */}
      {[
        { user: "Marcus V.", tag: "@marcus", color: "#6366f1", pnl: "+$342", pair: "EUR/USD • BUY", time: "2m" },
        { user: "Elena R.", tag: "@elena", color: "#10b981", pnl: "+$189", pair: "XAU/USD • BUY", time: "8m" },
      ].map((p, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 10px 8px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${p.color}, #a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#fff" }}>{p.user[0]}</div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{p.user}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>{p.tag} · {p.time} ago</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>{p.pnl}</div>
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginBottom: 5, background: "rgba(255,255,255,0.04)", padding: "3px 7px", borderRadius: 6, display: "inline-block" }}>{p.pair}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            {["❤ 47", "💬 12", "↗ 8"].map((a, j) => <span key={j} style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{a}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function RiskGuardScreen() {
  return (
    <div style={{ padding: "10px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Risk Guard</span>
        <div style={{ padding: "3px 8px", background: "rgba(16,185,129,0.15)", borderRadius: 100, fontSize: 8, fontWeight: 700, color: "#10b981" }}>ACTIVE</div>
      </div>
      {/* Gauge */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px", marginBottom: 10, textAlign: "center" }}>
        <div style={{ position: "relative", width: 100, height: 50, margin: "0 auto 8px" }}>
          <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%" }}>
            <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
            <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray="126" strokeDashoffset="50" />
            <defs><linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs>
          </svg>
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>62%</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>SAFE</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[{ l: "Daily Loss", v: "-$120", c: "#10b981" }, { l: "Limit", v: "$500", c: "rgba(255,255,255,0.6)" }].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 8px", textAlign: "left" }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Rules */}
      {[{ r: "Max Daily Drawdown", v: "$500", on: true }, { r: "Stop After 3 Losses", v: "3 trades", on: true }, { r: "Weekend Lock", v: "Fri 10pm", on: false }].map((rule, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, color: "#fff" }}>{rule.r}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>{rule.v}</div>
          </div>
          <div style={{ width: 28, height: 15, borderRadius: 8, background: rule.on ? "#6366f1" : "rgba(255,255,255,0.08)", position: "relative", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 2, left: rule.on ? 15 : 2, width: 11, height: 11, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function JournalScreen() {
  return (
    <div style={{ padding: "10px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>AI Journal</span>
        <div style={{ fontSize: 8, color: "#6366f1", fontWeight: 700 }}>AI Active ✦</div>
      </div>
      {/* AI Insight card */}
      <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))", borderRadius: 12, padding: "10px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <div style={{ width: 14, height: 14, borderRadius: 6, background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          </div>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#6366f1" }}>AI COACH INSIGHT</span>
        </div>
        <p style={{ fontSize: 8, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>You trade 38% better on Tuesday mornings. Consider increasing size by 1.2x on EUR/USD opens.</p>
      </div>
      {/* Recent trades */}
      {[
        { pair: "EUR/USD", dir: "BUY", pnl: "+$142", rr: "1:2.8", date: "Today" },
        { pair: "GBP/JPY", dir: "BUY", pnl: "+$88", rr: "1:1.9", date: "Yesterday" },
        { pair: "BTC/USD", dir: "SELL", pnl: "-$31", rr: "1:0.6", date: "Yesterday" },
      ].map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: t.pnl.startsWith("+") ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: t.pnl.startsWith("+") ? "#10b981" : "#ef4444" }}>{t.dir}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{t.pair}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>RR: {t.rr} · {t.date}</div>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: t.pnl.startsWith("+") ? "#10b981" : "#ef4444" }}>{t.pnl}</div>
        </div>
      ))}
    </div>
  );
}

function CompetitionScreen() {
  return (
    <div style={{ padding: "10px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Competitions</span>
        <div style={{ fontSize: 8, color: "#f59e0b", fontWeight: 700 }}>🏆 LIVE</div>
      </div>
      {/* Active competition */}
      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.06))", borderRadius: 14, padding: "12px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", marginBottom: 2 }}>June Championship</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>24 days remaining</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#f59e0b" }}>$5,000</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>Prize Pool</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 6 }}>
          <div style={{ height: "100%", width: "62%", background: "linear-gradient(to right, #f59e0b, #ef4444)", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>342 traders</span>
          <span style={{ fontSize: 7, color: "#f59e0b", fontWeight: 700 }}>Your Rank: #12</span>
        </div>
      </div>
      {/* Leaderboard */}
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Leaderboard</div>
      {[
        { rank: 1, name: "Marcus V.", pnl: "+$4,820", badge: "🥇" },
        { rank: 2, name: "Elena R.", pnl: "+$3,210", badge: "🥈" },
        { rank: 3, name: "David M.", pnl: "+$2,880", badge: "🥉" },
        { rank: 12, name: "You", pnl: "+$891", badge: "#12", you: true },
      ].map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", background: p.you ? "rgba(99,102,241,0.06)" : "transparent", borderRadius: p.you ? 8 : 0, padding: p.you ? "5px 6px" : "5px 0", margin: p.you ? "0 -6px" : "0" }}>
          <span style={{ fontSize: 10, width: 20, textAlign: "center" }}>{p.badge}</span>
          <span style={{ fontSize: 9, fontWeight: p.you ? 800 : 600, color: p.you ? "#6366f1" : "#fff", flex: 1 }}>{p.name}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#10b981" }}>{p.pnl}</span>
        </div>
      ))}
    </div>
  );
}

function AppShowcase({ onStart }: { onStart: () => void }) {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const FEATURES = [
    {
      num: "01",
      icon: <Users size={22} strokeWidth={1.8} />,
      color: "#6366f1", colorBg: "rgba(99,102,241,0.1)", colorBorder: "rgba(99,102,241,0.25)",
      label: "Community",
      title: "The trading network built for modern traders.",
      desc: "Share ideas, post analysis, follow creators, join public or private channels, and connect with traders worldwide through a social experience designed specifically for trading.",
      bullets: ["Trading-focused social feed", "Public & private channels", "Direct messaging & group chats", "Follow traders and creators"],
      btnText: "Explore Community →",
      screen: { bg: "linear-gradient(160deg, #0a0a12 0%, #05050d 100%)", content: <SocialFeedScreen /> }
    },
    {
      num: "02",
      icon: <ShieldCheck size={22} strokeWidth={1.8} />,
      color: "#10b981", colorBg: "rgba(16,185,129,0.1)", colorBorder: "rgba(16,185,129,0.25)",
      label: "Risk Guard",
      title: "Protect your capital before emotions take over.",
      desc: "Set daily loss limits, maximum drawdown rules, trading restrictions, and automated safeguards that help maintain discipline.",
      bullets: ["Daily loss protection", "Max drawdown control", "Revenge trading prevention", "Automated risk enforcement"],
      btnText: "Activate Risk Guard →",
      screen: { bg: "linear-gradient(160deg, #050d0a 0%, #030805 100%)", content: <RiskGuardScreen /> }
    },
    {
      num: "03",
      icon: <BookText size={22} strokeWidth={1.8} />,
      color: "#a855f7", colorBg: "rgba(168,85,247,0.1)", colorBorder: "rgba(168,85,247,0.25)",
      label: "AI Journal",
      title: "Every trade tracked automatically.",
      desc: "Connect your broker and let Tradifive automatically record, analyze, and organize every trade without manual input.",
      bullets: ["Auto-sync trading history", "Performance analytics", "Pattern recognition", "Trading insights"],
      btnText: "Open Journal →",
      screen: { bg: "linear-gradient(160deg, #0a0810 0%, #050408 100%)", content: <JournalScreen /> }
    },
    {
      num: "04",
      icon: <Sparkles size={22} strokeWidth={1.8} />,
      color: "#f59e0b", colorBg: "rgba(245,158,11,0.1)", colorBorder: "rgba(245,158,11,0.25)",
      label: "AI Coach",
      title: "Your personal trading mentor.",
      desc: "Receive real-time coaching, psychology feedback, performance reviews, and personalized improvement plans powered by AI.",
      bullets: ["Trade reviews", "Psychology coaching", "Performance feedback", "Personalized growth plans"],
      btnText: "Ask AI Coach →",
      screen: { bg: "linear-gradient(160deg, #0d0a03 0%, #080600 100%)", content: <JournalScreen /> }
    },
    {
      num: "05",
      icon: <Crown size={22} strokeWidth={1.8} />,
      color: "#ec4899", colorBg: "rgba(236,72,153,0.1)", colorBorder: "rgba(236,72,153,0.25)",
      label: "Creator Hub",
      title: "Build your audience. Share your expertise.",
      desc: "Launch premium communities, create educational content, share signals, and monetize your trading knowledge.",
      bullets: ["Premium channels", "Creator subscriptions", "Signal sharing", "Audience growth tools"],
      btnText: "Become a Creator →",
      screen: { bg: "linear-gradient(160deg, #0d0a03 0%, #080600 100%)", content: <SocialFeedScreen /> }
    }
  ];

  const active = FEATURES[activeFeature];

  return (
    <section id="app-preview" ref={sectionRef} style={{ backgroundColor: "transparent", padding: "120px 0", position: "relative", overflow: "hidden" }}>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: "inline-block", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "6px 18px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24 }}>
            INSIDE TRADIFIVE
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="app-showcase-title"
            style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
            Five Powerful Systems.<br />
            <span style={{ background: "linear-gradient(to right, rgba(255,255,255,0.65), rgba(255,255,255,0.3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>One Trading Ecosystem.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="app-showcase-desc"
            style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            Everything you need to trade, learn, improve, connect, and grow—all from one platform.
          </motion.p>
        </div>

        {/* Feature tabs */}
        <div className="app-showcase-tabs" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 72, flexWrap: "wrap" }}>
          {FEATURES.map((f, i) => (
            <motion.button
              key={i}
              className="app-showcase-tab"
              onClick={() => setActiveFeature(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 100,
                background: activeFeature === i ? "#262626" : "#171717",
                border: `1px solid ${activeFeature === i ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)"}`,
                color: activeFeature === i ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s ease-out",
                boxShadow: activeFeature === i
                  ? "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "none",
                backdropFilter: activeFeature === i ? "blur(12px)" : "none",
              }}
            >
              <span style={{ color: activeFeature === i ? f.color : "inherit", display: "flex" }}>{f.icon}</span>
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Main showcase */}
        <div className="showcase-grid">
          {/* Left: Feature info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#171717", display: "flex", alignItems: "center", justifyContent: "center", color: active.color }}>
                  {active.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: active.color, textTransform: "uppercase", letterSpacing: "2px" }}>Feature {active.num}</span>
              </div>

              <h3 className="app-showcase-feat-title" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.03em" }}>
                {active.title}
              </h3>
              <p className="app-showcase-feat-desc" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 32, maxWidth: 480 }}>
                {active.desc}
              </p>

              {/* Bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
                {active.bullets.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: active.colorBg, border: `1px solid ${active.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={active.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{b}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button onClick={onStart} className="btn-glow-primary" whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 32px", fontSize: 14, fontWeight: 700 }}>
                {active.btnText}
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Right: Real Mobile Screenshots */}
          <div className="phone-container" style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", position: "relative", minHeight: 600, width: "100%", transform: "translateY(-20px)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative",
                  width: 300,
                  height: 610,
                  borderRadius: 44,
                  border: "12px solid #111",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                  background: "#000",
                }}
              >
                {/* Hardware Buttons */}
                <div style={{ position: "absolute", top: 110, left: -14, width: 3, height: 26, background: "#222", borderRadius: "2px 0 0 2px" }} /> {/* Action */}
                <div style={{ position: "absolute", top: 160, left: -14, width: 3, height: 50, background: "#222", borderRadius: "2px 0 0 2px" }} /> {/* Vol Up */}
                <div style={{ position: "absolute", top: 220, left: -14, width: 3, height: 50, background: "#222", borderRadius: "2px 0 0 2px" }} /> {/* Vol Down */}
                <div style={{ position: "absolute", top: 180, right: -14, width: 3, height: 60, background: "#222", borderRadius: "0 2px 2px 0" }} /> {/* Power */}
                <div style={{ position: "absolute", top: 340, right: -13, width: 2, height: 40, background: "#222", borderRadius: "0 2px 2px 0" }} /> {/* Camera Control */}

                {/* Inner screen wrapper */}
                <div style={{ width: "100%", height: "100%", borderRadius: 32, overflow: "hidden", position: "relative" }}>
                  {/* iPhone 16 Dynamic Island */}
                  <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 100, height: 28, background: "#000", borderRadius: 14, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>

                  <img
                    src={
                      activeFeature === 0 ? "/community.jpeg" :
                        activeFeature === 1 ? "/risk_guard_.jpeg" :
                          activeFeature === 2 ? "/journal page.jpeg" :
                            activeFeature === 3 ? "/aicoach page.jpeg" :
                              "/creator hub.jpeg"
                    }
                    alt="App Screenshot"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom feature dots nav */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 60 }}>
          {FEATURES.map((f, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveFeature(i)}
              whileHover={{ scale: 1.3 }}
              style={{ width: i === activeFeature ? 28 : 8, height: 8, borderRadius: 100, background: i === activeFeature ? f.color : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", transition: "all 0.35s ease", padding: 0 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


export default function DownloadAppPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login");

  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "#fff", position: "relative" }}>
      <PremiumBackground />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        
        .dl-hero {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 440px;
          margin: 0 auto;
          gap: 32px;
        }

        .dl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .screen-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .feat-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }

        .dl-card {
          background: #171717;
          border: none;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.2);
          border-radius: 28px;
          padding: 44px 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .dl-card:hover {
          background: #1f1f1f;
          transform: translateY(-6px);
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.15), 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 50px -10px rgba(0,0,0,0.4);
        }

        .btn-primary {
          padding: 13px 20px;
          border-radius: 12px;
          background: #ffffff;
          color: #030712;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          width: 100%;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #f3f4f6;
          transform: translateY(-1.5px);
        }
        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          padding: 13px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          width: 100%;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1.5px);
        }
        .btn-secondary:active {
          transform: translateY(0);
        }

        .feature-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: #171717;
          border: none;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2);
          border-radius: 16px;
          padding: 22px 24px;
          transition: all 0.3s ease;
        }
        .feature-item:hover {
          background: #1f1f1f;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.3);
        }

        .screen-card {
          background: #171717;
          border: none;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2);
          border-radius: 22px;
          padding: 32px 20px;
          text-align: center;
          aspect-ratio: 0.68;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
        }
        .screen-card:hover {
          background: #1f1f1f;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.15), 0 8px 16px rgba(0,0,0,0.4);
          transform: translateY(-4px);
        }

        .desktop-feat-card {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          background: #171717;
          border: none;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(124, 58, 237, 0.25), 0 2px 4px rgba(0,0,0,0.2);
          border-radius: 20px;
          padding: 28px 24px;
          transition: all 0.3s ease;
        }
        .desktop-feat-card:hover {
          background: #1f1f1f;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.15), 0 8px 16px rgba(0,0,0,0.4);
          transform: translateY(-3px);
        }

        @media (max-width: 992px) {
          .dl-hero { grid-template-columns: 1fr; max-width: 480px !important; }
          .feat-grid-2 { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dl-hero { max-width: 340px !important; }
          .dl-grid { grid-template-columns: 1fr; }
          .screen-row { grid-template-columns: 1fr 1fr; }
          .dl-card {
            padding: 32px 24px;
            border-radius: 24px;
          }
          .dl-card h2 {
            font-size: 20px !important;
          }
          .dl-card p {
            font-size: 13px !important;
            margin-bottom: 24px !important;
          }
          .btn-primary, .btn-secondary {
            padding: 12px 16px;
            font-size: 13px;
          }
        }
      `}</style>
      <PublicNavbar onSignIn={handleStart} onSignUp={handleStart} onDownloadClick={() => {}} />

      {/* HERO */}
      <section style={{ padding: "160px 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div {...fadeUp()}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#171717", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 100, padding: "6px 16px 6px 8px", marginBottom: 28, backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "rgba(99,102,241,0.2)" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#818cf8" }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Apps for Every Platform</span>
            </div>
            <h1 style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.04em", marginBottom: 20 }}>
              Take <span style={{ background: "linear-gradient(to right, #6366f1, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TradiFive</span><br />
              Everywhere
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 48, maxWidth: 580, margin: "0 auto 48px", fontWeight: 400 }}>
              Institutional-grade execution on your desktop. Powerful insights in your pocket. Trade smarter from any device, anywhere in the world.
            </p>
          </motion.div>

          {/* Single Download Card for Mobile */}
          <motion.div {...fadeUp(0.15)} className="dl-hero">
            {/* Mobile App */}
            <div className="dl-card">
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <Smartphone size={28} color="#6366f1" />
              </div>
              <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, marginBottom: 10, letterSpacing: "-0.02em" }}>Mobile App</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13.5, marginBottom: 28, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 28px" }}>
                Manage risk, monitor your algorithms, and engage with the community on the go. iOS & Android.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleStart} className="btn-primary" style={{ cursor: "not-allowed", opacity: 0.8 }}>
                  <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  App Store — iOS
                </button>
                <button onClick={handleStart} className="btn-secondary" style={{ cursor: "not-allowed", opacity: 0.8 }}>
                  <Smartphone size={18} /> Google Play — Android
                </button>
              </div>
              <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#f59e0b", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Coming Soon
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AppShowcase onStart={handleStart} />

      {/* MOBILE APP FEATURES */}
      <section style={{ padding: "80px 24px 100px", maxWidth: 1200, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <Smartphone size={13} color="#6366f1" />
            <span style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Mobile Companion</span>
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
            Everything in Your Pocket
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15.5, maxWidth: 500, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}>
            The TradiFive mobile app is a full-featured companion — not a stripped-down version. 
          </p>
        </motion.div>

        <div className="feat-grid-2" style={{ alignItems: "start" }}>
          {/* Screen previews */}
          <motion.div {...fadeUp(0.1)}>
            <div className="screen-row">
              {SCREENS.map((s, i) => (
                <div key={i} className="screen-card">
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.icon}
                  </div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{s.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.45, fontWeight: 400 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MOBILE_FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)} className="feature-item">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#6366f1" }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, marginBottom: 5 }}>{f.title}</h4>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.55 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DESKTOP FEATURES */}
      <section style={{ padding: "80px 24px 100px", maxWidth: 1200, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <Monitor size={13} color="#7c3aed" />
            <span style={{ color: "#7c3aed", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Desktop Terminal</span>
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
            Built for Professionals
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15.5, maxWidth: 500, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}>The desktop app gives you the full institutional-grade experience with no compromises.</p>
        </motion.div>

        <div className="dl-grid">
          {DESKTOP_FEATURES.map((f, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="desktop-feat-card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#7c3aed" }}>
                {f.icon}
              </div>
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div {...fadeUp()} style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 20 }}>
            Start on any device. Free.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15.5, marginBottom: 36 }}>Sign up now and access the web, mobile, and desktop apps.</p>
          <button 
            onClick={handleStart} 
            style={{ 
              background: "linear-gradient(135deg, #6366f1, #7c3aed)", 
              color: "#fff", 
              border: "none", 
              borderRadius: 100, 
              padding: "16px 44px", 
              fontWeight: 800, 
              fontSize: 15, 
              cursor: "pointer",
              boxShadow: "0 10px 30px -10px rgba(99,102,241,0.4)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1.5px)"; e.currentTarget.style.boxShadow = "0 15px 35px -10px rgba(99,102,241,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(99,102,241,0.4)"; }}
          >
            Create Free Account
          </button>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
