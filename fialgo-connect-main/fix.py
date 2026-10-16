import os

file_path = r"c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\pages\Landing.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

before = lines[:807] # 0 to 806
after = lines[909:]  # 909 to end

mid = """function Features() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  return (
    <section id="capabilities" style={{ background: "transparent", padding: "120px 28px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div ref={r1} className="rv" style={{ marginBottom: 20 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "var(--azure)", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>Platform Capabilities</span>
          </div>
          <h2 ref={r2} className="rv d1" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Institutional architecture.<br />
            <span className="text-glow">Engineered for individuals.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 1050, margin: "0 auto" }} className="capabilities-grid grid-1-sm">
          {CAPABILITIES.map((f: any, i: number) => (
            <div
              key={i}
              id={f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              className="feat-card-premium"
              style={{ padding: "32px", borderRadius: 24, position: "relative", overflow: "hidden" }}
            >
              {/* Technical ID Number */}
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.015)", letterSpacing: "-0.05em", pointerEvents: "none" }}>{f.id}</div>

              <div style={{ position: "relative", zIndex: 2 }}>
                {/* Icon Container */}
                <div style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: `rgba(255, 255, 255, 0.03)`, 
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginBottom: 20
                }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>

                <span style={{ color: "var(--purple)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{f.tag}</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "12px 0 16px 0" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 40, fontWeight: 400 }}>{f.desc}</p>

                <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{f.m}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{f.mt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════
   HOW IT WORKS
════════════════ */

/* ════════════════
   PRICING
════════════════ */

/* ════════════════
   ALGOBRAIN (Huly Inspired Creative Bento)
════════════════ */
function TerminalBento() {
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

function Pricing({ onStart }: { onStart: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite">("pro");
  return (
    <section id="pricing" style={{ background: "#050505", padding: "140px 28px", position: "relative", overflow: "hidden" }}>
      {/* Liquid background glows to make glass visible */}
      <div style={{ position: "absolute", top: "20%", left: "10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(255, 255, 255, 0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div ref={useReveal()} className="rv" style={{ marginBottom: 20 }}>
            <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "var(--azure)", padding: "6px 16px", borderRadius: "100px", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Pricing & Access</span>
          </div>
          <h2 ref={useReveal()} className="rv d1" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
            Transparent, flexible plans<br /><span style={{ background: "linear-gradient(to right, #cccccc, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>for every stage of your mission</span>
          </h2>
          <p ref={useReveal()} className="rv d2" style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto", fontWeight: 500 }}>Start free on demo. Scale up when you're ready for real telemetry.</p>
        </div>

        <div className="relative z-10 w-full">
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(before)
    f.write(mid)
    f.writelines(after)
