import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface FeatureItem {
  id: string;
  title: string;
  desc: string;
  path: string;
  badge?: "LIVE" | "SOON";
  isLive?: boolean;
}

interface FeaturesMegaMenuProps {
  isOpen: boolean;
  dropdownLeft: number;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/* ── Platform Features ── */
const FEATURES: FeatureItem[] = [
  {
    id: "auto-trade",
    title: "FiAlgo V1 Auto Trade",
    desc: "Hands-free automated execution bots & MT5",
    path: "/features/auto-trade",
    badge: "LIVE",
    isLive: true,
  },
  {
    id: "community-hub",
    title: "Social Pulse & Feeds",
    desc: "Connect with verified traders worldwide",
    path: "/features/community-hub",
    badge: "LIVE",
    isLive: true,
  },
  {
    id: "risk-guard",
    title: "Risk Guard Protection",
    desc: "Drawdown kill-switch & daily loss limits",
    path: "/features/risk-guard",
    badge: "SOON",
    isLive: false,
  },
  {
    id: "smart-journal",
    title: "Smart Trade Journal",
    desc: "Auto broker sync & 40+ analytics metrics",
    path: "/features/smart-journal",
    badge: "SOON",
    isLive: false,
  },
  {
    id: "channels",
    title: "Creator Hub & Mentors",
    desc: "Curated broadcast rooms & verified signals",
    path: "/features/channels",
    badge: "SOON",
    isLive: false,
  },
];

export default function FeaturesMegaMenu({
  isOpen,
  dropdownLeft,
  onClose,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: FeaturesMegaMenuProps) {
  const [hoveredId, setHoveredId] = useState<string | null>("auto-trade");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="features-mega-dropdown"
          initial={{ opacity: 0, y: 8, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.985 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            left: dropdownLeft,
            width: "min(680px, calc(100vw - 32px))",
            maxWidth: 680,
            /* ── Exact FAQ Box Settings (#171717, borderRadius 20, borderless) ── */
            background: "#171717",
            borderRadius: 20,
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0, 0, 0, 0.85)",
            border: "none",
            padding: "16px",
            zIndex: 2000,
            color: "#fff",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            WebkitFontSmoothing: "antialiased",
            textAlign: "left",
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          {/* Main 2-Column Grid (FundingPips Style) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              alignItems: "stretch",
            }}
          >
            {/* ══════════════════════════════════════════════════════
                LEFT COLUMN: 5 FEATURE ITEMS (Vertical Stack)
            ══════════════════════════════════════════════════════ */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                justifyContent: "space-between",
              }}
            >
              {FEATURES.map((feat) => {
                const isHovered = hoveredId === feat.id;
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => {
                      onNavigate(feat.path);
                      onClose();
                    }}
                    onMouseEnter={() => setHoveredId(feat.id)}
                    style={{
                      background: isHovered ? "#222222" : "transparent",
                      boxShadow: isHovered
                        ? "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.05)"
                        : "none",
                      border: "none",
                      borderRadius: 14,
                      padding: "11px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                      width: "100%",
                      outline: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%" }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: "#ffffff",
                          lineHeight: 1.25,
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {feat.title}
                      </div>
                      {feat.badge && (
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 6,
                            letterSpacing: "0.04em",
                            background: feat.badge === "LIVE" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                            color: feat.badge === "LIVE" ? "#34d399" : "#94a3b8",
                            border: `1px solid ${feat.badge === "LIVE" ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)"}`
                          }}
                        >
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isHovered ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.44)",
                        lineHeight: 1.35,
                        marginTop: 3,
                        transition: "color 0.18s ease",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {feat.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════════════════
                RIGHT COLUMN: FEATURED VISUAL CARD (FundingPips Style)
            ══════════════════════════════════════════════════════ */}
            <div
              style={{
                background: "#1f1f1f",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                border: "none",
                borderRadius: 16,
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Top: 3D Visual Artwork Banner */}
              <div
                style={{
                  position: "relative",
                  borderRadius: 14,
                  overflow: "hidden",
                  height: 155,
                  width: "100%",
                  background: "radial-gradient(ellipse at 50% 30%, #1a223f 0%, #0c1022 100%)",
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "16px",
                  boxShadow: "inset 0 0 40px rgba(56, 189, 248, 0.15)",
                }}
              >
                {/* 3D artwork background image */}
                <img
                  src="/3d-trading.png"
                  alt="TradiFive Ecosystem"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.85,
                    filter: "contrast(1.15) brightness(0.95)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Gradient vignette for legibility */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(8, 11, 22, 0.2) 0%, rgba(8, 11, 22, 0.85) 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Bold headline on top of graphic */}
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(56, 189, 248, 0.18)",
                      border: "1px solid rgba(56, 189, 248, 0.35)",
                      borderRadius: 100,
                      padding: "2.5px 8px",
                      marginBottom: 6,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>ALGO V1</span>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#ffffff",
                      lineHeight: 1.15,
                      letterSpacing: "-0.03em",
                      textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    FiAlgo V1<br />
                    Quant Engine
                  </div>
                </div>
              </div>

              {/* Bottom: Editorial message + Start Free button */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Automate trades with FiAlgo V1
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255, 255, 255, 0.52)",
                      lineHeight: 1.45,
                      marginTop: 3,
                    }}
                  >
                    Institutional MT5 Gold execution with built-in risk protection, automated news filtering & verified edge.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("/features/auto-trade");
                    onClose();
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "9px 20px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #182236 0%, #0d1526 100%)",
                    border: "1px solid rgba(56, 189, 248, 0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)",
                    color: "#60a5fa",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #22324f 0%, #111c34 100%)";
                    e.currentTarget.style.color = "#93c5fd";
                    e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 4px 14px rgba(30, 58, 138, 0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #182236 0%, #0d1526 100%)";
                    e.currentTarget.style.color = "#60a5fa";
                    e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.22)";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)";
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  <span>Start Free</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
