import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { MessageSquare, Users, ShieldCheck, Zap } from "lucide-react";

export default function ChannelsPublic() {
  return (
    <div style={{ background: "#02040A", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, padding: "120px 20px 80px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", color: "#eab308", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            <MessageSquare size={16} /> Community Channels
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 20 }}>
            Collaborative <span style={{ color: "#eab308" }}>Broker-Signal Rooms</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto" }}>
            Join private and public channels. Receive high-conviction trade setups, discuss market conditions, and execute signals instantly.
          </p>
        </div>

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
