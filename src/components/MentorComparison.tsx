import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, ArrowRight } from "lucide-react";

interface MentorComparisonProps {
  onStart: () => void;
}

export default function MentorComparison({ onStart }: MentorComparisonProps) {
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);

  const DISCOUNTS = [
    { label: "40% off", price: "$35.99/mo" },
    { label: "50% off", price: "$30.00/mo" },
    { label: "60% off", price: "$24.00/mo" },
  ];

  return (
    <section id="comparison" style={{ backgroundColor: "#ffffff", padding: "80px 24px 60px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>

        {/* Section Header */}
        <div style={{ maxWidth: 760, marginBottom: 40 }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: "clamp(30px, 4.4vw, 48px)",
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
              margin: "0 0 12px 0"
            }}
          >
            You already paid <br />
            for the lesson.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: "clamp(15px, 1.6vw, 17px)",
              color: "#64748b",
              fontWeight: 400,
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Every red trade. Every moved stop. Every revenge entry. All tuition.
          </motion.p>
        </div>

        {/* Main 3-Card Comparison Layout */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", 
            gap: 20, 
            alignItems: "stretch",
            position: "relative" 
          }}
        >

          {/* CARD 1: Comparison Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: "26px 22px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 22 }}>
                Two ways to fix the same problem
              </div>

              {/* Table Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Header Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.1fr", gap: 8, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
                  <div />
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>The mentor</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb", textAlign: "center" }}>Tradifive</div>
                </div>

                {/* Row 1 */}
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.1fr", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Hours it is awake</div>
                  <div style={{ fontSize: 11.5, color: "#475569" }}>Their working hours</div>
                  <div style={{
                    border: "1.5px solid #2563eb",
                    borderRadius: 10,
                    padding: "6px 8px",
                    background: "rgba(37,99,235,0.03)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    textAlign: "center"
                  }}>
                    All of them
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.1fr", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Trades it remembers</div>
                  <div style={{ fontSize: 11.5, color: "#475569" }}>The ones you bring up</div>
                  <div style={{
                    border: "1.5px solid #2563eb",
                    borderRadius: 10,
                    padding: "6px 8px",
                    background: "rgba(37,99,235,0.03)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    textAlign: "center"
                  }}>
                    Every trade you log
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.1fr", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Waits for</div>
                  <div style={{ fontSize: 11.5, color: "#475569" }}>Your next session</div>
                  <div style={{
                    border: "1.5px solid #2563eb",
                    borderRadius: 10,
                    padding: "6px 8px",
                    background: "rgba(37,99,235,0.03)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    textAlign: "center"
                  }}>
                    Nothing
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4, display: "block" }}>
                Direct MT5 socket synchronization ensures 100% data fidelity with zero manual spreadsheets.
              </span>
            </div>
          </motion.div>

          {/* CARD 2: "The mentor" Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: "26px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 16.5, fontWeight: 700, color: "#0f172a" }}>The mentor</span>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  <Plus size={13} />
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "clamp(22px, 2.3vw, 29px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                  $100 to $7,000/mo
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  for one person's attention
                </div>
              </div>

              {/* Features List */}
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>
                What a person gives you
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#94a3b8" }}>–</span>
                  <span>Real guidance. Real accountability.</span>
                </div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#94a3b8" }}>–</span>
                  <span>Live feedback while you trade.</span>
                </div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#94a3b8" }}>–</span>
                  <span>One strategy. One brain. Forgets your trades by Monday.</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, fontSize: 11, color: "#94a3b8" }}>
              Traditional Discord signal rooms & 1-on-1 coaching
            </div>
          </motion.div>

          {/* CARD 3: "Tradifive" Card (Featured & Highlighted with floating "vs" badge) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: "#ffffff",
              border: "2px solid #2563eb",
              borderRadius: 24,
              padding: "26px 24px",
              boxShadow: "0 10px 30px rgba(37,99,235,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative"
            }}
          >
            {/* The Floating "vs" Badge */}
            <div
              style={{
                position: "absolute",
                left: -15,
                top: "48%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                zIndex: 10,
                boxShadow: "0 2px 8px rgba(37,99,235,0.4)"
              }}
              className="hide-xs"
            >
              vs
            </div>

            <div>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 17.5, fontWeight: 800, color: "#0f172a" }}>Tradifive</span>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 2px 6px rgba(37,99,235,0.3)" }}>
                  <Plus size={14} strokeWidth={2.5} />
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "clamp(21px, 2.3vw, 27px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                  <span style={{ color: "#2563eb" }}>Free.</span>{" "}
                  <span style={{ fontSize: 15.5, fontWeight: 600, color: "#475569" }}>
                    The coach is $35.99/mo on Apex
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  the journal is free forever, always
                </div>
              </div>

              {/* Pill Tag Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "rgba(37,99,235,0.06)", borderRadius: 10, margin: "12px 0 16px" }}>
                <span style={{ fontSize: 11.5, color: "#475569", fontWeight: 500 }}>What you keep</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#ffffff", padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(37,99,235,0.2)" }}>Apex</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb" }}>3/3</span>
                </div>
              </div>

              {/* Features with exact icons from Image 2 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 11, flexShrink: 0 }}>
                    📓
                  </div>
                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, lineHeight: 1.4 }}>
                    Reads every trade you have ever taken.
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 11, flexShrink: 0 }}>
                    📊
                  </div>
                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, lineHeight: 1.4 }}>
                    Remembers all of it. Forgets none of it.
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 11, flexShrink: 0 }}>
                    🔄
                  </div>
                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, lineHeight: 1.4 }}>
                    The coach is already inside, and it never sleeps.
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onStart}
              style={{
                marginTop: 22,
                width: "100%",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: 100,
                padding: "11px 20px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(37,99,235,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.3)";
              }}
            >
              <span>Start Free Forever</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

        </div>

        {/* Bottom Discount / Pricing Pills Bar (Image 2) */}
        <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
            Apex with a sale
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {DISCOUNTS.map((d, idx) => {
              const active = selectedDiscount === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDiscount(idx)}
                  style={{
                    background: active ? "rgba(37,99,235,0.08)" : "#ffffff",
                    border: active ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                    borderRadius: 100,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: active ? "#2563eb" : "#475569",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ color: "#2563eb", fontWeight: 700 }}>{d.label}</span>
                  <span>{d.price}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine Print Footer Subtext (Image 2) */}
        <p style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.55, marginTop: 12, maxWidth: 760 }}>
          Logging and keeping every trade is free forever. The coach that reads them back is Apex, $35.99 a month with code LIQUID40. Mentorship prices are the real market range for trading coaches and rooms.
        </p>

      </div>
    </section>
  );
}
