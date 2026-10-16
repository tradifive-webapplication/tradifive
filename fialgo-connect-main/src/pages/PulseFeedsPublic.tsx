import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Activity, LayoutDashboard, Share2, Award } from "lucide-react";

export default function PulseFeedsPublic() {
  return (
    <div style={{ background: "#02040A", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, padding: "120px 20px 80px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            <Activity size={16} /> Pulse Feeds
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 20 }}>
            The Pulse of the <span style={{ color: "#ef4444" }}>Trading Floor</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto" }}>
            A vibrant social canvas for traders. Share chart setups, celebrate profit milestones, and post execution summaries with verified badges.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Feature 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <LayoutDashboard size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Dynamic Timeline</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Scroll through an engaging feed of market analysis, trade recaps, and community milestones. Stay connected to the broader market sentiment.</p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Share2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Seamless Sharing</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Automatically generate beautiful execution summaries directly from your MT5 bridge data and share them to your feed with one click.</p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Award size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Verified Badges</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Trust what you see. Posts linked to live execution data carry verification badges, ensuring authenticity and building community trust.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
