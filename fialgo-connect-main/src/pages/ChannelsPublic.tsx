import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { MessageSquare, Users, ShieldCheck, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function ChannelsPublic() {
  return (
    <div style={{ background: "#02040A", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, padding: "120px 20px 80px", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", color: "#eab308", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            <MessageSquare size={16} /> Community Channels
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Collaborative <span style={{ color: "#eab308" }}>Broker-Signal Rooms</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
            Join private and public channels. Receive high-conviction trade setups, discuss market conditions, and execute signals instantly.
          </p>
        </div>

        {/* DESKTOP PLATFORM SHOWCASE */}
        <section style={{ padding: "0 0 60px 0", width: "100%", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 16 }}>
              <Crown size={13} color="#ec4899" />
              <span style={{ color: "#ec4899", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>FEATURE 05 · CREATOR HUB & CHANNELS</span>
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", marginBottom: 12 }}>
              Build your audience. Share your expertise.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15.5, maxWidth: 660, margin: "0 auto", lineHeight: 1.6 }}>
              Launch premium communities, create educational content, share signals, and monetize your trading knowledge.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: "16px",
              position: "relative",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.85), 0 0 60px rgba(236,72,153,0.08)",
              overflow: "hidden"
            }}
          >
            {/* Ambient glow */}
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 200, background: "radial-gradient(ellipse, rgba(236,72,153,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
            
            {/* Window Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5 }}>Tradifive Terminal · Creator Hub & Rooms</div>
              <div style={{ width: 32 }} />
            </div>

            {/* Screenshot */}
            <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12, background: "#08090d" }}>
              <img
                src="/mentordesktop.png"
                alt="Creator Hub Platform"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
              />
            </div>
          </motion.div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Feature 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Users size={24} color="#eab308" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Curated Communities</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Find channels managed by top-tier analysts and institutional traders. Filter out the noise and focus on quality discussions.</p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Zap size={24} color="#eab308" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Actionable Signals</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Signals posted in channels are parsed and converted into executable actions. Enter trades with a single click directly from the chat.</p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <ShieldCheck size={24} color="#eab308" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Verified Broadcasts</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Channel leaders must connect their live accounts to broadcast performance. See the real numbers behind the analysis.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
