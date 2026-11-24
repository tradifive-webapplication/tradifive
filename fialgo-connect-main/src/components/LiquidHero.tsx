import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, MessageSquare, Bell } from "lucide-react";

interface LiquidHeroProps {
  onStart: () => void;
  onSignIn: () => void;
}

export default function LiquidHero({ onStart, onSignIn }: LiquidHeroProps) {
  return (
    <section 
      style={{ 
        position: "relative", 
        overflow: "hidden", 
        width: "100%", 
        paddingTop: "70px",
        paddingBottom: "50px",
        backgroundColor: "#ffffff"
      }}
    >
      {/* Radiant ambient glow */}
      <div 
        style={{
          position: "absolute",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1100px",
          height: "600px",
          background: "radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.06) 0%, rgba(15,23,42,0.02) 50%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: 1160, width: "100%", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "40px", alignItems: "center" }} className="liquid-hero-grid">

          {/* LEFT: Headline & CTAs (Exact match to Image 2) */}
          <div style={{ maxWidth: 560 }}>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              style={{
                fontSize: "clamp(38px, 5.2vw, 64px)",
                fontWeight: 800,
                color: "#1e293b",
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
                margin: "0 0 18px 0"
              }}
            >
              A journal you'll <br />
              <span 
                style={{ 
                  display: "inline-block", 
                  border: "1.5px solid #2563eb", 
                  borderRadius: 12, 
                  padding: "0 14px", 
                  margin: "0 6px 0 0", 
                  fontFamily: "'Playfair Display', Georgia, serif", 
                  fontStyle: "italic", 
                  color: "#2563eb",
                  fontWeight: 500
                }}
              >
                actually
              </span>{" "}
              want to open.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              style={{
                fontSize: "clamp(16px, 1.8vw, 18.5px)",
                color: "#64748b",
                lineHeight: 1.55,
                maxWidth: 500,
                margin: "0 0 30px 0",
                fontWeight: 400
              }}
            >
              Every trade, every day, in one place that makes you come back.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}
            >
              <button
                onClick={onStart}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 100,
                  padding: "13px 26px",
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 4px 18px rgba(15,23,42,0.2)",
                  transition: "all 0.2s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(15,23,42,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(15,23,42,0.2)";
                }}
              >
                <span>Sign up</span>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </div>
              </button>

              <button
                onClick={() => window.open("https://discord.gg/tradifive", "_blank")}
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1.5px solid #0f172a",
                  borderRadius: 100,
                  padding: "12px 24px",
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  transition: "all 0.2s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <MessageSquare size={11} fill="#fff" />
                </div>
                <span>Join the Discord, 900+ members</span>
              </button>
            </motion.div>

            {/* Micro-Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, color: "#64748b", fontWeight: 500, flexWrap: "wrap" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={14} color="#0f172a" strokeWidth={2.5} />
                <span>No card to start</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={14} color="#0f172a" strokeWidth={2.5} />
                <span>Cancel any time</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={14} color="#0f172a" strokeWidth={2.5} />
                <span>Free forever</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: iPhone App Mockup & App Store Badge (Exact match to Image 2) */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            
            {/* Top Label */}
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 18, textAlign: "left", width: "100%", maxWidth: 380 }}>
              Coming soon to the App Store <br />and Google Play.
            </div>

            {/* Titanium iPhone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                width: 320,
                height: 480,
                background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: "44px 44px 0 0",
                border: "4px solid #334155",
                borderBottom: "none",
                boxShadow: "0 30px 80px -15px rgba(0,0,0,0.3), 0 0 0 1px #475569",
                position: "relative",
                overflow: "hidden",
                padding: "16px 20px"
              }}
            >
              {/* Dynamic Island */}
              <div 
                style={{
                  position: "absolute",
                  top: 14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 90,
                  height: 24,
                  background: "#000000",
                  borderRadius: 20,
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px"
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0b0f19" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#064e3b" }} />
              </div>

              {/* Status bar: 9:41 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#ffffff", fontSize: 12, fontWeight: 700, marginTop: 4, marginBottom: 50, zIndex: 10, position: "relative" }}>
                <span>9:41</span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 10 }}>5G</span>
                  <div style={{ width: 18, height: 9, borderRadius: 2.5, border: "1px solid #fff", display: "flex", alignItems: "center", padding: 1 }}>
                    <div style={{ width: "80%", height: "100%", background: "#fff", borderRadius: 1 }} />
                  </div>
                </div>
              </div>

              {/* App Icon with Notification Badge "1" */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 40 }}>
                <div style={{ position: "relative" }}>
                  <div 
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 22,
                      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      border: "1.5px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 14px 34px rgba(0,0,0,0.5)"
                    }}
                  >
                    {/* App Cloud/Waves Logo */}
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    </svg>
                  </div>

                  {/* Red Notification Badge "1" */}
                  <div 
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #0f172a",
                      boxShadow: "0 2px 8px rgba(239,68,68,0.5)"
                    }}
                  >
                    1
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 12, letterSpacing: "-0.2px" }}>
                  Tradifive
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  Daily Journal & MT5 Sync
                </div>
              </div>

              {/* Floating Widget Notification */}
              <div 
                style={{
                  marginTop: 60,
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  color: "#ffffff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase" }}>Trade Alert</span>
                  <span style={{ fontSize: 9, color: "#94a3b8" }}>Just now</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>XAUUSD +$1,240 Closed ✓</div>
                <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>Risk managed: 0.02s circuit breaker armed.</div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
