import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Layers, ShieldCheck, Globe } from "lucide-react";

export default function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const STEPS = [
    {
      num: "01",
      icon: <Users size={22} strokeWidth={2} />,
      color: "#818cf8",
      colorGlow: "rgba(99, 102, 241, 0.3)",
      borderColor: "rgba(99, 102, 241, 0.25)",
      title: "Create Your Account",
      desc: "Start your trading journey with Tradifive. Set up your profile, customize your experience, and unlock access to the complete trading ecosystem.",
      tag: "Ready in 60s",
      badge: "STEP 01",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>TF</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>@disciplined_trader</div>
                <div style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.45)" }}>Pro Profile Active</div>
              </div>
            </div>
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 10, fontWeight: 800, padding: "2.5px 8px", borderRadius: 100, background: "rgba(99, 102, 241, 0.18)", color: "#a5b4fc", border: "1px solid rgba(99, 102, 241, 0.3)" }}
            >
              +100 XP
            </motion.span>
          </div>
          <div style={{ height: 5, width: "100%", background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <motion.div
              style={{ width: "85%", height: "100%", background: "linear-gradient(to right, #6366f1, #3b82f6)", borderRadius: 3 }}
              animate={{ width: ["70%", "85%", "70%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={{ position: "absolute", top: 0, bottom: 0, width: 35, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
              animate={{ left: ["-20%", "120%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </div>
      )
    },
    {
      num: "02",
      icon: <Layers size={22} strokeWidth={2} />,
      color: "#34d399",
      colorGlow: "rgba(16, 185, 129, 0.3)",
      borderColor: "rgba(16, 185, 129, 0.25)",
      title: "Connect Your Broker",
      desc: "Link any MT5 broker securely. Our bridge technology ensures zero-latency execution while keeping your funds completely secure on your broker's end.",
      tag: "Zero-Latency MT5",
      badge: "STEP 02",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>MetaTrader 5 Bridge</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399" }} />
              <span>4ms ping</span>
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
            <span>Capital in Broker</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>100% Isolated</span>
          </div>
        </div>
      )
    },
    {
      num: "03",
      icon: <ShieldCheck size={22} strokeWidth={2} />,
      color: "#fbbf24",
      colorGlow: "rgba(245, 158, 11, 0.3)",
      borderColor: "rgba(245, 158, 11, 0.25)",
      title: "Activate Risk Guard",
      desc: "Set your daily loss limits and maximum trades. Once your rules are breached, Tradifive automatically locks your account for the day to prevent revenge trading.",
      tag: "AI Protected",
      badge: "STEP 03",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Drawdown Shield</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2.5px 8px", borderRadius: 100, background: "rgba(245, 158, 11, 0.18)", color: "#fcd34d", border: "1px solid rgba(245, 158, 11, 0.3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b" }} />
              ARMED
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
            <span>Max Daily Loss Limit</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>$250 / 3.0%</span>
          </div>
        </div>
      )
    },
    {
      num: "04",
      icon: <Globe size={22} strokeWidth={2} />,
      color: "#f472b6",
      colorGlow: "rgba(236, 72, 153, 0.3)",
      borderColor: "rgba(236, 72, 153, 0.25)",
      title: "Join Community & Creators",
      desc: "Follow verified traders, join public or private channels, share ideas, learn from creators, and grow alongside a community of traders.",
      tag: "Start Growing",
      badge: "STEP 04",
      preview: (
        <div style={{ background: "rgba(0, 0, 0, 0.5)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ec4899", boxShadow: "0 0 6px #ec4899" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Broadcast Channels</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f472b6", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#ec4899" }} />
              1,240+ Online
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
            <span>Top Trader Win Rate</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>68.4% Verified</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <section id="how-it-works" style={{ backgroundColor: "transparent", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginBottom: 20 }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              color: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "6px 20px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "2px",
              textTransform: "uppercase",
              boxShadow: "0 0 16px rgba(59, 130, 246, 0.15)"
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }} />
              THE TRADIFIVE JOURNEY
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(30px, 4.2vw, 50px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16, lineHeight: 1.15 }}
          >
            <span style={{ background: "linear-gradient(to right, #ffffff 40%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              From Beginner to Consistent Trader<br />
              In Four Simple Steps.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.55)", maxWidth: 540, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Everything you need — learning, trading, discipline, AI guidance, and community — in one ecosystem.
          </motion.p>
        </div>

        {/* ── Desktop Horizontal Connection Rail ── */}
        <div className="hidden lg:block" style={{ position: "relative", marginBottom: 28, padding: "0 40px" }}>
          <div style={{ position: "absolute", top: 18, left: 60, right: 60, height: 2, background: "rgba(255, 255, 255, 0.08)", zIndex: 0, overflow: "hidden" }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(to right, #6366f1 0%, #10b981 33%, #f59e0b 66%, #ec4899 100%)",
                boxShadow: "0 0 12px rgba(99, 102, 241, 0.6)"
              }}
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* Traveling laser comet along the rail */}
            <motion.div
              style={{
                position: "absolute",
                top: -2,
                width: 60,
                height: 6,
                borderRadius: 4,
                background: "linear-gradient(90deg, transparent, #ffffff, #60a5fa, transparent)",
                boxShadow: "0 0 12px #60a5fa, 0 0 20px #818cf8"
              }}
              animate={{ left: ["-10%", "110%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", position: "relative", zIndex: 1 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  style={{
                    position: "relative",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: hoveredStep === i ? step.color : "#121216",
                    border: `2px solid ${step.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    color: hoveredStep === i ? "#fff" : step.color,
                    boxShadow: `0 0 18px ${step.colorGlow}`,
                    transition: "all 0.25s ease",
                    cursor: "pointer"
                  }}
                >
                  {/* Pulsing halo ring */}
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: -5,
                      borderRadius: "50%",
                      border: `1.5px solid ${step.color}`
                    }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                  />
                  {step.num}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Connected 4-Step Cards Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          position: "relative",
          zIndex: 2
        }}>
          {STEPS.map((step, i) => {
            const isHovered = hoveredStep === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  background: "#121216",
                  borderRadius: 22,
                  padding: "24px 22px",
                  border: isHovered ? `1px solid ${step.borderColor}` : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isHovered
                    ? `inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 35px ${step.colorGlow}`
                    : "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 20,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
                }}
              >
                {/* Ambient Card Glow */}
                <motion.div
                  animate={{ scale: isHovered ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: step.colorGlow,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                    opacity: isHovered ? 0.95 : 0.4,
                    transition: "opacity 0.3s ease"
                  }}
                />

                <div>
                  {/* Top Header Pill */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "#18181e",
                        border: `1.5px solid ${step.borderColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: step.color,
                        boxShadow: `0 0 18px ${step.colorGlow}`
                      }}
                    >
                      {step.icon}
                    </motion.div>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      padding: "3px 9px",
                      borderRadius: 100,
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.08)"
                    }}>
                      {step.tag}
                    </span>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 900, color: step.color, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    {step.badge}
                  </span>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 10, lineHeight: 1.3 }}>
                    {step.title}
                  </h3>

                  <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.55)", lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
                    {step.desc}
                  </p>
                </div>

                {/* Creative Visual Preview Widget */}
                <div style={{ marginTop: 4 }}>
                  {step.preview}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
