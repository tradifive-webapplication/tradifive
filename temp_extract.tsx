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
        { user: "Marcus V.", tag: "@marcus", color: "#6366f1", pnl: "+₹342", pair: "EUR/USD • BUY", time: "2m" },
        { user: "Elena R.", tag: "@elena", color: "#10b981", pnl: "+₹189", pair: "XAU/USD • BUY", time: "8m" },
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
          {[{ l: "Daily Loss", v: "-₹120", c: "#10b981" }, { l: "Limit", v: "₹500", c: "rgba(255,255,255,0.6)" }].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 8px", textAlign: "left" }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Rules */}
      {[{ r: "Max Daily Drawdown", v: "₹500", on: true }, { r: "Stop After 3 Losses", v: "3 trades", on: true }, { r: "Weekend Lock", v: "Fri 10pm", on: false }].map((rule, i) => (
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
        { pair: "EUR/USD", dir: "BUY", pnl: "+₹142", rr: "1:2.8", date: "Today" },
        { pair: "GBP/JPY", dir: "BUY", pnl: "+₹88", rr: "1:1.9", date: "Yesterday" },
        { pair: "BTC/USD", dir: "SELL", pnl: "-₹31", rr: "1:0.6", date: "Yesterday" },
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
            <div style={{ fontSize: 13, fontWeight: 900, color: "#f59e0b" }}>₹5,000</div>
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
        { rank: 1, name: "Marcus V.", pnl: "+₹4,820", badge: "🥇" },
        { rank: 2, name: "Elena R.", pnl: "+₹3,210", badge: "🥈" },
        { rank: 3, name: "David M.", pnl: "+₹2,880", badge: "🥉" },
        { rank: 12, name: "You", pnl: "+₹891", badge: "#12", you: true },
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
          <div className="phone-container" style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", position: "relative", minHeight: 600, width: "100%" }}>
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

/* ════════════════