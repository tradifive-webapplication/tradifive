const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// 1. Imports
if (!code.includes('TerminalGraphics3D')) {
  code = code.replace(
    'import { Ic } from "../components/Ic";',
    'import { Ic } from "../components/Ic";\nimport { TradeExecution3D, JournalGraphs3D, RiskGuard3D } from "../components/TerminalGraphics3D";'
  );
}

// 2. CAPABILITIES
const oldCapabilities = `const CAPABILITIES = [
  {
    id: "01",
    tag: "Execution Engine",
    title: "Low-Latency MT5 Bridge",
    desc: "Direct-to-market execution with institutional-grade routing. Optimized for high-frequency deployment and minimal slippage.",
    m: "2.4ms",
    mt: "Avg. Latency",
    icon: Rocket,
    color: "#3b82f6"
  },
  {
    id: "02",
    tag: "Risk Protocol",
    title: "Autonomous Risk Guard",
    desc: "Real-time position sizing and drawdown protection. Built to enforce discipline and protect capital around the clock.",
    m: "0.1s",
    mt: "React Speed",
    icon: Shield,
    color: "#a855f7"
  },
  {
    id: "03",
    tag: "Analytics Core",
    title: "Precision AI Telemetry",
    desc: "40+ premium metrics synced live to your dashboard. Comprehensive tracking of Sharpe ratio, equity curves, and edge distribution.",
    m: "40+",
    mt: "Live Metrics",
    icon: Layers,
    color: "#ec4899"
  },
  {
    id: "04",
    tag: "Discovery Engine",
    title: "Discover Strategies",
    desc: "Explore verified algorithmic portfolios, copy high-winrate configurations, and benchmark your performance against public copyable strategies.",
    m: "92.4%",
    mt: "Copied Win Rate",
    icon: Sparkles,
    color: "#3b82f6"
  },
  {
    id: "05",
    tag: "Signal Hub",
    title: "Secure Community Channels",
    desc: "Join dedicated broadcast rooms, launch private signal channels, and route live signals directly to your connected MetaTrader terminal.",
    m: "450+",
    mt: "Active Channels",
    icon: MessageSquare,
    color: "#a855f7"
  },
  {
    id: "06",
    tag: "Social Timeline",
    title: "Vibrant Pulse Feeds",
    desc: "A stunning social canvas to share chart setups, show off verified profit milestones, and publish execution summaries with zero noise.",
    m: "120k+",
    mt: "Daily Highlights",
    icon: Share2,
    color: "#ec4899"
  }
];`;

const newCapabilities = `const CAPABILITIES = [
  {
    id: "01",
    tag: "Trade Execution",
    title: "One-Click Slide-Over",
    desc: "Instantly execute trades with our custom slide-over terminal. Calculate lot sizes, set precise T/P & S/L, and enter the market in milliseconds.",
    m: "2.4ms",
    mt: "Avg. Latency",
    icon: Rocket,
    color: "#3b82f6"
  },
  {
    id: "02",
    tag: "Risk Management",
    title: "Risk Guard Lockout",
    desc: "Set your maximum daily drawdown limit. If you hit your limit, the terminal instantly locks you out, protecting your capital from tilt and emotional trading.",
    m: "0.1s",
    mt: "Lockout Speed",
    icon: Shield,
    color: "#a855f7"
  },
  {
    id: "03",
    tag: "Journaling",
    title: "Automated Trade Sync",
    desc: "No more spreadsheets. Every trade you take is automatically synced, categorized, and analyzed in your beautiful daily journal.",
    m: "100%",
    mt: "Auto-Synced",
    icon: Layers,
    color: "#ec4899"
  },
  {
    id: "04",
    tag: "Analytics Core",
    title: "Deep Performance Analytics",
    desc: "Track your equity curve, win rates by pair, net daily P&L, and pinpoint exactly which setups are making you money and which are draining your account.",
    m: "40+",
    mt: "Live Metrics",
    icon: Sparkles,
    color: "#3b82f6"
  },
  {
    id: "05",
    tag: "Customization",
    title: "Flexible Multi-Currency",
    desc: "Whether you trade in USD, EUR, or INR, the dashboard instantly converts and formats your balances, commissions, and profit in your preferred local currency.",
    m: "10+",
    mt: "Supported Fiats",
    icon: MessageSquare,
    color: "#a855f7"
  },
  {
    id: "06",
    tag: "Privacy",
    title: "Stealth / Privacy Mode",
    desc: "Trading in public or sharing screenshots? One click blurs your sensitive balances and equity numbers while keeping your beautiful charts visible.",
    m: "1-Click",
    mt: "Privacy Toggle",
    icon: Shield,
    color: "#ec4899"
  }
];`;
code = code.replace(oldCapabilities, newCapabilities);

// 3. AlgoBrain -> TerminalBento
const startAlgo = code.indexOf('function AlgoBrain() {');
const endAlgo = code.indexOf('function Pricing({ onStart }', startAlgo);
if (startAlgo > -1 && endAlgo > -1) {
  const newTerminalBento = `function TerminalBento() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  return (
    <section style={{ background: "#050505", padding: "140px 28px", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 24 }}>
            <span className="badge" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#cccccc", border: "1px solid rgba(255, 255, 255, 0.2)" }}>The Tech Stack ⚡</span>
          </div>
          <h2 ref={useReveal()} className="rv d1" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 20, lineHeight: 1.1 }}>
            Engineered for precision.
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto", fontWeight: 500 }}>Everything a professional manual trader needs, built into one seamless terminal.</p>
        </div>

        {/* Creative Bento Grid */}
        <div className="brain-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "minmax(180px, auto)", gap: 24 }}>

          {/* Top Left - Trade Execution */}
          <div ref={r2} className="brain-card" style={{ gridColumn: "span 2", gridRow: "span 3", background: "#10141d", borderRadius: 28, padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, background: "radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)" }} />
            <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
              <h4 style={{ color: "#fff", fontSize: 17, fontWeight: 800, marginBottom: 14 }}>One-Click Execution. <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Calculate risk and fire orders instantly from the slide-over panel.</span></h4>
              <div style={{ flex: 1, position: "relative", marginTop: 20 }}>
                 <TradeExecution3D />
              </div>
            </div>
          </div>

          {/* Top Right - Automated Journal */}
          <div ref={r2} className="brain-card" style={{ gridColumn: "span 4", gridRow: "span 3", background: "#0b0e14", borderRadius: 28, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
               <JournalGraphs3D />
            </div>
            <div style={{ position: "absolute", inset: 0, zIndex: 2, padding: 32, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(to top, rgba(11, 14, 20, 0.4), transparent 60%)", pointerEvents: "none" }}>
              <h4 style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>Automated Journal. <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Every trade synced and charted in real-time.</span></h4>
              <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, width: "fit-content" }}>
                <Ic n="verify" s={14} c="#3b82f6" sw={3} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>Live Sync Active</span>
              </div>
            </div>
          </div>

          {/* Bottom - Risk Guard */}
          <div ref={r3} className="brain-card" style={{ gridColumn: "span 6", gridRow: "span 2", background: "#0b0e14", borderRadius: 28, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 32 }}>
            
            <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 400 }}>
              <h4 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Risk Guard Protocol.</h4>
              <p style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>Enforce extreme discipline. Set your max daily loss, and if you tilt, the terminal locks you out of the market to protect your capital.</p>
              <div style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, width: "fit-content" }}>
                <Shield size={14} color="#a855f7" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#a855f7" }}>Capital Protection</span>
              </div>
            </div>

            <div style={{ flex: 1, height: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
               <RiskGuard3D />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

`;
  code = code.slice(0, startAlgo) + newTerminalBento + code.slice(endAlgo);
}

code = code.replace('<AlgoBrain />', '<TerminalBento />');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log('Done modifying Landing.tsx phase 1');
