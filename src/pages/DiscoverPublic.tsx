import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Compass, Search, Star, TrendingUp } from "lucide-react";

export default function DiscoverPublic() {
  return (
    <div style={{ background: "#02040A", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <PublicNavbar />
      
      <main style={{ flex: 1, padding: "120px 20px 80px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)", color: "#a855f7", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            <Compass size={16} /> Discover
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 20 }}>
            Find Your Next <span style={{ color: "#a855f7" }}>Trading Edge</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto" }}>
            Explore community-verified portfolios, copy high-performing configurations, and discover strategies that fit your risk profile.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Feature 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Search size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Advanced Search</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Filter strategies by win rate, maximum drawdown, asset class, and time in market to find exactly what matches your trading style.</p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Star size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Verified Performance</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Every strategy on Discover is backed by verified broker data. No fake screenshots, just pure, unadulterated performance metrics.</p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <TrendingUp size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>One-Click Copy</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>Found a strategy you like? Instantly deploy the configuration to your own terminal and mirror the trades with customized risk settings.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
