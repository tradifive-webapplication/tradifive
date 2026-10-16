import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import StarsBackground from "@/components/StarsBackground";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function OptionsTradingPublic() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#02040a", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <PublicNavbar onSignIn={() => navigate("/login")} onSignUp={() => navigate("/login")} onDownloadClick={() => navigate("/download")} />
      <StarsBackground />
      <main style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, marginBottom: 24, letterSpacing: "-0.03em" }}>
            Options <span style={{ color: "#a855f7" }}>Trading</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Advanced options analytics and integrated trading for NSE & US Markets. Coming soon.
          </p>
        </motion.div>
      </main>
      <PublicFooter />
    </div>
  );
}
