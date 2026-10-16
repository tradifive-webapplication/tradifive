import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface FeatureItem {
  id: string;
  title: string;
  desc: string;
  path: string;
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
    title: "FiAlgo",
    desc: "Hands-free automated execution bots",
    path: "/features/auto-trade",
  },
  {
    id: "risk-guard",
    title: "Risk Guard Protection",
    desc: "Drawdown kill-switch & daily loss limits",
    path: "/features/risk-guard",
  },
  {
    id: "smart-journal",
    title: "Smart Trade Journal",
    desc: "Auto broker sync & 40+ analytics metrics",
    path: "/features/smart-journal",
  },
  {
    id: "community-hub",
    title: "Community Hub",
    desc: "Connect with verified traders worldwide",
    path: "/features/community-hub",
  },
  {
    id: "channels",
    title: "Creator Hub",
    desc: "Curated creator broadcast rooms & verified signals",
    path: "/features/channels",
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
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#ffffff",
                      lineHeight: 1.15,
                      letterSpacing: "-0.03em",
                      textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    Next-Gen FiAlgo<br />
                    Ecosystem
                  </div>
                </div>
              </div>

              {/* Bottom: Editorial message + Talk to Sales button */}
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
                    Need customized trading infrastructure?
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255, 255, 255, 0.52)",
                      lineHeight: 1.45,
                      marginTop: 3,
                    }}
                  >
                    Connect with our technical team for institutional execution rules, quant algorithms & prop firm setups.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("/contact");
                    onClose();
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "9px 18px",
                    borderRadius: 999,
                    background: "#2563eb",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1d4ed8";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(37, 99, 235, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#2563eb";
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.35)";
                  }}
                >
                  <span>Talk to Sales</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
