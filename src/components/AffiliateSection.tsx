import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Calendar } from "lucide-react";

interface AffiliateSectionProps {
  onStart: () => void;
}

export default function AffiliateSection({ onStart }: AffiliateSectionProps) {
  return (
    <section id="affiliate" style={{ backgroundColor: "#ffffff", padding: "80px 24px 60px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1.05fr", 
            gap: 28, 
            alignItems: "center" 
          }}
          className="liquid-hero-grid"
        >

          {/* LEFT CARD: Copy & CTA (Exact Match to Image 1) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 28,
              padding: "36px 32px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
            }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 3.8vw, 42px)",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1.18,
                margin: "0 0 16px 0"
              }}
            >
              Put Tradifive in your bio. <br />
              <span style={{ color: "#2563eb" }}>Get paid every month.</span>
            </h2>

            <p
              style={{
                fontSize: 15,
                color: "#64748b",
                lineHeight: 1.6,
                margin: "0 0 24px 0",
                fontWeight: 400
              }}
            >
              Earn up to 25% of what your followers pay. Start with 30 days, stay on while it works. Plus your own code for them: 40% off for as long as they stay.
            </p>

            {/* Pill Badge */}
            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "5px 14px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f172a"
                }}
              >
                Apex free for as long as you're an affiliate
              </span>
            </div>

            {/* Action Button */}
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
                transition: "all 0.2s ease"
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
              <span>Become an affiliate</span>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
                <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </button>
          </motion.div>

          {/* RIGHT CARD: Trader Profile & Tier Metrics (Exact Match to Image 1) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 28,
              padding: "36px 34px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
            }}
          >
            {/* Profile Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div 
                style={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: "50%", 
                  background: "#0f172a", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 800
                }}
              >
                TT
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Trading Trav
                </h3>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                  @tradingtrav
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} color="#2563eb" /> Tradifive affiliate
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Paid every month
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Column Commission Tiers */}
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: 12, 
                padding: "20px 0",
                borderTop: "1px solid #f1f5f9",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: 24
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>15%</div>
                <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, lineHeight: 1.3 }}>from the start</div>
              </div>

              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>20%</div>
                <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, lineHeight: 1.3 }}>from 10 paying members</div>
              </div>

              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>25%</div>
                <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, lineHeight: 1.3 }}>from 250 paying members</div>
              </div>

              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>30 days</div>
                <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, lineHeight: 1.3 }}>to start</div>
              </div>
            </div>

            {/* Discount Code Box */}
            <div 
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "12px 16px",
                display: "inline-block"
              }}
            >
              <div style={{ fontSize: 11, color: "#64748b" }}>Your code for them</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>TRAV40</span>
                <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>40% off</span>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
