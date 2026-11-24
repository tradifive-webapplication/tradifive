import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Zap, CheckCircle2, ArrowRight, Lock, Activity, TrendingUp } from "lucide-react";

interface WhatIsTradifiveProps {
  onStart: () => void;
}

export default function WhatIsTradifive({ onStart }: WhatIsTradifiveProps) {
  const PILLARS = [
    {
      badge: "0.02s CIRCUIT BREAKER",
      badgeColor: "#2563eb",
      badgeBg: "rgba(37, 99, 235, 0.08)",
      badgeBorder: "rgba(37, 99, 235, 0.2)",
      icon: ShieldCheck,
      iconColor: "#2563eb",
      iconBg: "rgba(37, 99, 235, 0.1)",
      title: "Autonomous Risk Guard",
      subtitle: "Hard Drawdown Lock — Never Blow An Account Again",
      desc: "Set your daily loss limit (e.g. ₹5,000). The instant you breach it, Tradifive automatically kills MT5 trading for the day. No emotional overrides, no revenge trading, 100% fund custody.",
      bullets: [
        "0.02s automatic socket terminal lockout",
        "Mandatory 30-min cooldown after losing streaks",
        "High-impact economic news filter (FOMC, CPI, NFP)"
      ],
      tag: "Discipline Enforcer",
      accent: "#2563eb"
    },
    {
      badge: "100% MT5 AUTO-SYNC",
      badgeColor: "#f97316",
      badgeBg: "rgba(249, 115, 22, 0.08)",
      badgeBorder: "rgba(249, 115, 22, 0.2)",
      icon: Sparkles,
      iconColor: "#f97316",
      iconBg: "rgba(249, 115, 22, 0.1)",
      title: "Automated AI Trade Journal",
      subtitle: "Instant Trade Grading — Zero Manual Spreadsheets",
      desc: "Every trade is automatically imported from your MT5 broker in real time. AI scores your setup discipline (Grade A+ to F), identifies psychological leaks, and tracks 40+ quantitative metrics.",
      bullets: [
        "Zero seconds spent manually typing into Excel",
        "AI psychology coach highlights emotional errors",
        "Deep-dive win rate, profit factor & setup analysis"
      ],
      tag: "Psychology & Analytics",
      accent: "#f97316"
    },
    {
      badge: "0% PROFIT CUT OPTION",
      badgeColor: "#2563eb",
      badgeBg: "rgba(37, 99, 235, 0.08)",
      badgeBorder: "rgba(37, 99, 235, 0.2)",
      icon: Zap,
      iconColor: "#2563eb",
      iconBg: "rgba(37, 99, 235, 0.1)",
      title: "FiAlgo V1 Algorithmic Engine",
      subtitle: "Institutional Gold M1 Execution or Discretionary",
      desc: "Deploy our battle-tested Gold (XAUUSD) M1 Expert Advisor (.ex5) to capture institutional liquidity sweeps, or trade discretionary under our strict risk rules. Keep 100% of profits.",
      bullets: [
        "Specialized XAUUSD M1 institutional algorithm",
        "3-Year license option: keep 100% of your profits",
        "Performance partner option: pay only on green weeks"
      ],
      tag: "Execution Engine",
      accent: "#2563eb"
    }
  ];

  return (
    <section id="what-is-tradifive" style={{ backgroundColor: "#ffffff", padding: "80px 24px 60px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Section Header: Compact & Punchy */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 50px" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(37, 99, 235, 0.08)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              padding: "5px 16px",
              borderRadius: 100,
              marginBottom: 16
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 8px #2563eb" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "1px", textTransform: "uppercase" }}>
              WHAT IS TRADIFIVE?
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(28px, 4.2vw, 46px)",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
              margin: "0 0 16px 0"
            }}
          >
            Three Tools Every Serious Trader Needs. <br />
            <span style={{ color: "#2563eb" }}>Combined Into One Platform.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
            style={{
              fontSize: "clamp(15px, 1.6vw, 17.5px)",
              color: "#475569",
              lineHeight: 1.6,
              margin: "0 auto",
              fontWeight: 400
            }}
          >
            Tradifive is built to solve the single reason 90% of traders fail: lack of risk discipline. We protect your capital, automate your journaling, and provide verified execution.
          </motion.p>
        </div>

        {/* 3 Pillars Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 40 }}>
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 24,
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.25s ease",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = p.accent;
                  e.currentTarget.style.boxShadow = `0 14px 34px -4px ${p.badgeBg}, 0 2px 6px rgba(0,0,0,0.04)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)";
                }}
              >
                <div>
                  {/* Top Row: Icon & Tag */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: p.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Icon size={26} color={p.iconColor} />
                    </div>

                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: p.badgeColor,
                      background: p.badgeBg,
                      border: `1px solid ${p.badgeBorder}`,
                      padding: "4px 12px",
                      borderRadius: 100,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase"
                    }}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.accent, marginBottom: 14 }}>
                    {p.subtitle}
                  </div>

                  {/* Plain English Description */}
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "0 0 22px 0", fontWeight: 400 }}>
                    {p.desc}
                  </p>

                  {/* Bullet Points */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, paddingTop: 18, borderTop: "1px solid #f1f5f9" }}>
                    {p.bullets.map((b, bIdx) => (
                      <div key={bIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <CheckCircle2 size={16} color={p.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 500, lineHeight: 1.45 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Action Link */}
                <button
                  onClick={onStart}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 100,
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0f172a",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = p.accent;
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = p.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#0f172a";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <span>Explore {p.title}</span>
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
