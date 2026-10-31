import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Zap,
  Shield,
  TrendingUp,
  LayoutGrid,
  Lock,
  Coins,
  BarChart3,
  Clock,
  Layers,
  CheckCircle2,
  Activity,
  Sliders,
  ArrowDown,
  Check,
  Cpu,
  Package,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Percent,
  Scale,
  ShieldCheck,
} from "lucide-react";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  };
}

/* ── Exact FAQ Box / Card Surface Settings (#171717, borderRadius: 20, borderless) ── */
const FAQ_CARD_STYLE: React.CSSProperties = {
  background: "#171717",
  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
  borderRadius: 20,
  border: "none",
};

const FAQ_CARD_HOVER = {
  y: -3,
  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.45)",
};

export function handleFileDownload(filename: string, fileType: "demo" | "backtest") {
  const content = `// FiAlgo V1 - ${fileType.toUpperCase()} BUILD
// Product Name: FiAlgo V1 Algorithmic Trading Engine
// Version: 1.0.4 Enterprise
// Platform: MetaTrader 5 (MT5)
// Symbol: XAUUSD (Gold), EURUSD, GBPUSD
// 
// Quick Setup Instructions:
// 1. Copy ${filename} into your MT5 "MQL5/Experts" directory.
// 2. Open MT5 Navigator window, right click Experts and click Refresh.
// 3. Drag FiAlgo V1 onto your desired chart (M5 or M15 recommended for XAUUSD).
// 4. In MT5 settings, ensure "Allow Algo Trading" is enabled.
// 5. In EA inputs, select your risk mode or load our official .set file.
// 
// Need help or key activation? Visit: https://tradifive.in
`;
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE 1 COMPONENT: Compact Free Downloads Banner Pill
   ═══════════════════════════════════════════════════════════════════ */
export function FreeDownloadsCompactBanner() {
  const [downloadingDemo, setDownloadingDemo] = useState(false);
  const [downloadingBacktest, setDownloadingBacktest] = useState(false);

  const triggerDownload = (type: "demo" | "backtest") => {
    if (type === "demo") {
      setDownloadingDemo(true);
      handleFileDownload("FIALGO_V1_DEMO.ex5", "demo");
      setTimeout(() => setDownloadingDemo(false), 2000);
    } else {
      setDownloadingBacktest(true);
      handleFileDownload("FIALGO_V1_BACKTEST.ex5", "backtest");
      setTimeout(() => setDownloadingBacktest(false), 2000);
    }
  };

  return (
    <motion.div
      {...fadeUp(0)}
      style={{
        ...FAQ_CARD_STYLE,
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 18,
        position: "relative",
      }}
    >
      {/* Left text */}
      <div style={{ minWidth: 240 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h4
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              fontFamily: "'Outfit', 'Inter', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            Free downloads
          </h4>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 100,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            FiAlgo V1
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.55)", margin: 0, fontWeight: 400 }}>
          Test before you pay — no key, no account needed.
        </p>
      </div>

      {/* Right buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => triggerDownload("demo")}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: 14,
            padding: "10px 20px",
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 145,
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            {downloadingDemo ? <Check size={13} color="#4ade80" /> : "↓"} FiAlgo V1 Demo
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.45)", marginTop: 2, fontWeight: 500 }}>
            {downloadingDemo ? "Downloaded" : "demo accounts only"}
          </div>
        </button>

        <button
          onClick={() => triggerDownload("backtest")}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: 14,
            padding: "10px 20px",
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 145,
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            {downloadingBacktest ? <Check size={13} color="#4ade80" /> : "↓"} FiAlgo V1 Backtest
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.45)", marginTop: 2, fontWeight: 500 }}>
            {downloadingBacktest ? "Downloaded" : "Strategy Tester only"}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT DETAILS COMPONENT: FiAlgo V1 Product Specifications & Card
   ═══════════════════════════════════════════════════════════════════ */
export function FiAlgoV1ProductSection({ onGetStarted }: { onGetStarted?: () => void }) {
  const navigate = useNavigate();
  const [downloadingDemo, setDownloadingDemo] = useState(false);
  const [downloadingBacktest, setDownloadingBacktest] = useState(false);
  const [mobileTab, setMobileTab] = useState<'specs' | 'license'>('license');

  const specRow1 = [
    { label: "Product Name", value: "FiAlgo V1", badge: "Official Build" },
    { label: "Platform", value: "MetaTrader 5 (MT5)", highlight: true },
  ];
  const specRow2 = [
    { label: "Supported Assets", value: "XAUUSD (Gold)" },
    { label: "Prop Firm Compatible", value: "No" },
  ];
  const specRow3 = [
    { label: "Trading Style", value: "Smart Dynamic Basket" },
    { label: "Broker Support", value: "Any MT5 Broker" },
  ];
  const specRow4 = [
    { label: "Timeframe", value: "1 Min (M1)" },
    { label: "Execution Speed", value: "< 3ms Direct MT5 Execution" },
    { label: "Official Plan", value: "₹9,999 Setup + Weekly 50/50% Split" },
  ];

  const planIncludes = [
    "One-time ₹9,999 Setup Fee for EA activation & MT5 binding",
    "Weekly 50/50% Profit Share on Net Positive Weeks Only",
    "Zero Fee on Red or Flat Weeks (No profit = ₹0 commission)",
    "Assigned Weekly Settlement Day (Mon–Sun Cohort Allocation)",
    "FiAlgo V1 Compiled Expert Advisor (.ex5)",
    "Hardware-Bound MT5 License Key & Instant Server Relay",
    "Automated MT5 Economic News Calendar Filter",
    "All 8 Institutional Risk Protection Modules",
  ];

  const handleProceed = () => {
    try {
      localStorage.setItem("tradifive_selected_tier", "profit_share_50");
    } catch (e) {}
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate("/auto-trade/setup");
    }
  };

  return (
    <section id="fialgo-product" style={{ padding: "50px 0 35px", position: "relative" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#171717",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
              borderRadius: 100,
              padding: "5px 14px",
              marginBottom: 14,
            }}
          >
            <Cpu size={13} color="#ffffff" />
            <span
              style={{
                color: "#ffffff",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              PRODUCT SPECIFICATIONS
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Meet FiAlgo V1.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Hands-Free MT5 Execution.
            </span>
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: 580,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            The complete automated trading system. Engineered for XAUUSD (Gold) on MetaTrader 5 with disciplined execution cycles and automated news blackout windows.
          </p>
        </motion.div>

        {/* Mobile & Tablet Interactive 3D Box Showcase (< 1024px) */}
        <div className="flex flex-col lg:hidden items-center mb-6" style={{ position: "relative" }}>
          {/* Radiant Ambient Backdrop Glow */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 280,
              height: 280,
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 70%)",
              filter: "blur(36px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Floating Stage with Feature Badges */}
          <div style={{ position: "relative", width: "100%", maxWidth: 350, display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0 16px" }}>
            {/* Top-Left Floating Telemetry Chip */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                position: "absolute",
                top: 20,
                left: 4,
                zIndex: 4,
                background: "rgba(18, 18, 18, 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                borderRadius: 100,
                padding: "4px 9px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                fontWeight: 700,
                color: "#93c5fd",
              }}
            >
              <Zap size={11} color="#60a5fa" />
              <span>&lt; 3ms Speed</span>
            </motion.div>

            {/* Top-Right Floating Telemetry Chip */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              style={{
                position: "absolute",
                top: 20,
                right: 4,
                zIndex: 4,
                background: "rgba(18, 18, 18, 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                borderRadius: 100,
                padding: "4px 9px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                fontWeight: 700,
                color: "#86efac",
              }}
            >
              <Shield size={11} color="#4ade80" />
              <span>News Filter</span>
            </motion.div>

            {/* Levitating 3D Box with Natural Floating Animation */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
              style={{ position: "relative", zIndex: 2 }}
            >
              <img
                src="/fialgo-v1-box.png"
                alt="FiAlgo V1 Official 3D Box Packaging"
                style={{
                  maxHeight: 260,
                  width: "auto",
                  filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.45))",
                }}
              />
            </motion.div>

            {/* Pedestal Floor Shadow */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 180,
                height: 16,
                background: "radial-gradient(ellipse at center, rgba(96, 165, 250, 0.3) 0%, rgba(0,0,0,0.7) 50%, transparent 75%)",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </div>

          {/* Floating Tagline Pill */}
          <div
            style={{
              marginTop: -6,
              background: "#171717",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.08)",
              borderRadius: 100,
              padding: "4px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10.5,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: 0.3,
            }}
          >
            <span style={{ color: "#60a5fa" }}>★</span>
            <span>MetaTrader 5 Automated Gold Algo</span>
          </div>

          {/* Mobile Segmented Tab Switcher: Plans & Pricing (2 Tiers) vs Specifications */}
          <div
            className="flex lg:hidden"
            style={{
              width: "100%",
              maxWidth: 390,
              marginTop: 18,
              background: "#111111",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: 4,
              gap: 4,
            }}
          >
            <button
              onClick={() => setMobileTab('license')}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: mobileTab === 'license' ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : "transparent",
                boxShadow: mobileTab === 'license' ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)" : "none",
                color: mobileTab === 'license' ? "#60a5fa" : "rgba(255, 255, 255, 0.5)",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
            >
              <Zap size={14} />
              <span>Plans & Pricing</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 6,
                  background: mobileTab === 'license' ? "rgba(96, 165, 250, 0.18)" : "rgba(255, 255, 255, 0.08)",
                  color: mobileTab === 'license' ? "#93c5fd" : "rgba(255, 255, 255, 0.4)",
                  border: mobileTab === 'license' ? "1px solid rgba(96, 165, 250, 0.3)" : "1px solid transparent",
                }}
              >
                2 Tiers
              </span>
            </button>
            <button
              onClick={() => setMobileTab('specs')}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: mobileTab === 'specs' ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : "transparent",
                boxShadow: mobileTab === 'specs' ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)" : "none",
                color: mobileTab === 'specs' ? "#60a5fa" : "rgba(255, 255, 255, 0.5)",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
            >
              <Package size={14} />
              <span>Specifications</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left (Specs + 3D Box) & Right (License) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end" style={{ position: "relative" }}>
          
          {/* Left Column (7 cols): Standing 3D Box + Product Details Card */}
          <div className={`lg:col-span-7 flex flex-col justify-end ${mobileTab === 'specs' ? 'block' : 'hidden lg:flex'}`} style={{ position: "relative" }}>
            
            {/* Desktop Standing 3D Box - positioned proudly above right half of specs card */}
            <div
              className="hidden lg:flex"
              style={{
                justifyContent: "flex-end",
                paddingRight: 72,
                marginTop: 14,
                marginBottom: -68,
                position: "relative",
                zIndex: 10,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{ position: "relative" }}
              >
                {/* Subtle blue ambient halo behind the 3D box */}
                <div
                  style={{
                    position: "absolute",
                    top: "15%",
                    left: "15%",
                    width: "70%",
                    height: "70%",
                    background: "radial-gradient(circle, rgba(96, 165, 250, 0.22) 0%, transparent 70%)",
                    filter: "blur(32px)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                <img
                  src="/fialgo-v1-box.png"
                  alt="FiAlgo V1 Official 3D Box Packaging"
                  style={{
                    height: 380,
                    width: "auto",
                    position: "relative",
                    zIndex: 2,
                    filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.35)) drop-shadow(0 4px 10px rgba(0,0,0,0.2))",
                  }}
                />
              </motion.div>
            </div>

            {/* Left Card: Product Specs & Architecture (FAQ card settings) */}
            <motion.div
              {...fadeUp(0.1)}
              style={{
                ...FAQ_CARD_STYLE,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Package size={18} color="#ffffff" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#fff",
                          margin: 0,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        FiAlgo V1 Product Details
                      </h3>
                      <div style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.45)", marginTop: 2 }}>
                        MQL5 Expert Advisor Engine
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Column Specs Grid matching screenshot */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 14 }}>
                  {/* Rows 1 to 3: 2 columns */}
                  {[specRow1, specRow2, specRow3].map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-2 gap-2">
                      {row.map((spec) => (
                        <div
                          key={spec.label}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "8px 11px",
                            borderRadius: 10,
                            background: "rgba(255, 255, 255, 0.03)",
                            minHeight: 50,
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.45)", fontWeight: 500, fontSize: 11 }}>{spec.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
                            <span
                              style={{
                                color: spec.highlight ? "#60a5fa" : "#ffffff",
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {spec.value}
                            </span>
                            {spec.badge && (
                              <span
                                style={{
                                  background: "rgba(255, 255, 255, 0.08)",
                                  color: "rgba(255, 255, 255, 0.8)",
                                  fontSize: 8.5,
                                  fontWeight: 700,
                                  padding: "1px 5px",
                                  borderRadius: 5,
                                }}
                              >
                                {spec.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Row 4: Timeframe & Speed (2 columns) */}
                  <div className="grid grid-cols-2 gap-2">
                    {specRow4.slice(0, 2).map((spec) => (
                      <div
                        key={spec.label}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "8px 11px",
                          borderRadius: 10,
                          background: "rgba(255, 255, 255, 0.03)",
                          minHeight: 50,
                        }}
                      >
                        <span style={{ color: "rgba(255, 255, 255, 0.45)", fontWeight: 500, fontSize: 11 }}>{spec.label}</span>
                        <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 12, marginTop: 2 }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* License Type Highlight Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    <span style={{ color: "rgba(255, 255, 255, 0.45)", fontWeight: 500, fontSize: 11 }}>
                      {specRow4[2].label}
                    </span>
                    <span
                      style={{
                        color: "#60a5fa",
                        fontWeight: 700,
                        fontSize: 11.5,
                        background: "rgba(96, 165, 250, 0.1)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(96, 165, 250, 0.2)",
                      }}
                    >
                      {specRow4[2].value}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Day Free Trial & Profit Guarantee Strip */}
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.03)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={16} color="#60a5fa" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      Free Demo &amp; Strategy Tester Build
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", marginTop: 1 }}>
                      Test on any MT5 demo account or Strategy Tester with zero risk.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDownloadingDemo(true);
                    handleFileDownload("FIALGO_V1_DEMO.ex5", "demo");
                    setTimeout(() => setDownloadingDemo(false), 2000);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    border: "none",
                    color: "#60a5fa",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "8px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #253347 0%, #131c33 100%)";
                    e.currentTarget.style.color = "#93c5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
                    e.currentTarget.style.color = "#60a5fa";
                  }}
                >
                  {downloadingDemo ? "✓ Downloaded" : "↓ Download Free Demo (.ex5)"}
                </button>
              </div>

              {/* Mobile Quick Action to View License */}
              <div className="block lg:hidden" style={{ marginTop: 12 }}>
                <button
                  onClick={() => setMobileTab('license')}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    border: "none",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 6px rgba(0,0,0,0.3)",
                    borderRadius: 12,
                    color: "#60a5fa",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>View Plans & Pricing (2 Tiers)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column (5 cols): Product Package & Order Card (FAQ card settings) */}
          <div className={`lg:col-span-5 flex flex-col justify-end ${mobileTab === 'license' ? 'block' : 'hidden lg:flex'}`}>
            <motion.div
              {...fadeUp(0.18)}
              style={{
                ...FAQ_CARD_STYLE,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                {/* Mobile Back Link to Specs */}
                <div className="block lg:hidden" style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => setMobileTab('specs')}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                    }}
                  >
                    <span>&larr; View Technical Specifications</span>
                  </button>
                </div>

                {/* Single Official Plan Badge */}
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 13 }}>⚡</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: "#6ee7b7" }}>
                      Official Performance Plan
                    </span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255, 255, 255, 0.55)" }}>
                    ₹9,999 Setup · Weekly 50/50%
                  </span>
                </div>

                {/* Product Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#6ee7b7",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 100,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    PERFORMANCE · WEEKLY 50/50% SHARE
                  </span>
                  <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>
                    Pay On Green Weeks Only
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 21,
                    fontWeight: 800,
                    color: "#ffffff",
                    margin: "0 0 6px",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  FiAlgo V1 Performance License
                </h3>
                <p style={{ fontSize: 12.5, color: "rgba(255, 255, 255, 0.55)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  Full algorithmic Gold execution engine on MT5 with a one-time ₹9,999 setup fee. Split 50% profits weekly only when your account is in green. Zero fees on non-profitable weeks.
                </p>

                {/* Price Tag */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      ONE-TIME SETUP FEE
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          color: "#34d399",
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        ₹9,999
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>
                        + Weekly 50/50% Split
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#6ee7b7",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        letterSpacing: 0.4,
                      }}
                    >
                      PAY ONLY ON PROFIT
                    </span>
                  </div>
                </div>

                {/* Weekly 50% Settlement Notice */}
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(234, 179, 8, 0.05)",
                    border: "1px solid rgba(234, 179, 8, 0.2)",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: "rgba(234, 179, 8, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <AlertTriangle size={14} color="#facc15" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fef08a", letterSpacing: 0.2 }}>
                      Weekly 50% Settlement Policy
                    </div>
                    <div style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.6)", marginTop: 2, lineHeight: 1.4 }}>
                      Weekly 50% profit share is settled via UPI or WhatsApp on your designated settlement day. If your week is flat or red, you pay ₹0.
                    </div>
                  </div>
                </div>

                {/* What is Included List */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                    OFFICIAL PLAN INCLUDES:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {planIncludes.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12 }}>
                        <CheckCircle2
                          size={14}
                          color="#34d399"
                          style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        <span style={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.4 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div>
                <button
                  onClick={() => handleProceed()}
                  style={{
                    width: "100%",
                    padding: "13px 20px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.3)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
                  }}
                >
                  <Zap size={15} />
                  <span>Get FiAlgo V1 License (₹9,999)</span>
                  <ArrowRight size={15} />
                </button>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => {
                    setDownloadingBacktest(true);
                    handleFileDownload("FIALGO_V1_BACKTEST.ex5", "backtest");
                    setTimeout(() => setDownloadingBacktest(false), 2000);
                  }}
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "none",
                    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    padding: "9px 12px",
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.75)";
                  }}
                >
                  {downloadingBacktest ? "✓ Downloaded" : "↓ Backtest Pack (.ex5)"}
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(255, 255, 255, 0.35)" }}>
                Instant Key Generation · Verified on MT5 build 4400+ · 100% Unlocked
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE 4 COMPONENT: From Checkout to First Trade (How It Works)
   ═══════════════════════════════════════════════════════════════════ */
export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Download & install",
      desc: "Copy the .ex5 into MQL5/Experts, refresh MT5.",
    },
    {
      num: "02",
      title: "Get your key",
      desc: "Enter your MT5 login on the order page — key generated instantly.",
    },
    {
      num: "03",
      title: "Attach to chart",
      desc: "Paste the key, set your lot size, enable Algo Trading.",
    },
    {
      num: "04",
      title: "Let it work",
      desc: "The basket closes at its money target. Monitor on the panel.",
    },
  ];

  const specs = [
    { label: "PLATFORM", value: "MetaTrader 5" },
    { label: "SYMBOL", value: "XAUUSD / any" },
    { label: "STYLE", value: "Basket grid" },
    { label: "DELIVERY", value: "Instant download" },
  ];

  return (
    <section style={{ padding: "60px 0 40px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
            <span
              style={{
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              HOW IT WORKS
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            From checkout to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              first trade
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.5)",
              lineHeight: 1.6,
              maxWidth: 540,
              margin: 0,
            }}
          >
            Get up and running in minutes with plug-and-play installation on your MetaTrader 5 terminal.
          </p>
        </motion.div>

        {/* 4 Steps Grid (FAQ card settings on all cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              {...fadeUp(0.06 * i)}
              style={{
                ...FAQ_CARD_STYLE,
                padding: "26px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 140,
                transition: "all 0.25s ease",
              }}
              whileHover={FAQ_CARD_HOVER}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <h4
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {step.title}
                </h4>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.25)",
                    lineHeight: 1,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {step.num}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.55)",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Specs Bottom Banner (FAQ card settings) */}
        <motion.div
          {...fadeUp(0.25)}
          style={{
            ...FAQ_CARD_STYLE,
            padding: "20px 28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
          }}
        >
          {specs.map((item, idx) => (
            <div
              key={item.label}
              style={{
                borderLeft: idx > 0 ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                paddingLeft: idx > 0 ? 20 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255, 255, 255, 0.4)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE 5 COMPONENT: Inside FiAlgo V1 (What You Get - 12 Cards)
   ═══════════════════════════════════════════════════════════════════ */
export function WhatYouGetSection() {
  const cards = [
    {
      icon: Zap,
      title: "Daily drawdown guard",
      desc: "Monitors real-time equity and stops when threshold is reached.",
    },
    {
      icon: Shield,
      title: "closes everything and stops for the day at your %",
      subtext: "set it under your firm's rule",
    },
    {
      icon: TrendingUp,
      title: "Daily profit target",
      desc: "Lock in gains once target is reached without overtrading.",
    },
    {
      icon: LayoutGrid,
      title: "lock the day in and stop",
      desc: "Automated daily session closure to protect winning runs.",
    },
    {
      icon: Lock,
      title: "USD news filter from the MT5 calendar",
      desc: "Automatic high-impact event detection directly via MT5.",
    },
    {
      icon: Coins,
      title: "flat 15 min before and after FOMC, CPI, NFP",
      desc: "Protection during high-spread volatile news announcements.",
    },
    {
      icon: BarChart3,
      title: "Session filter by country",
      desc: "Customizable sessions including Asia, London, and New York.",
    },
    {
      icon: Clock,
      title: "Asia, London, New York or custom hours, flat before the session ends",
      desc: "Automatically square off positions before liquidity dries up.",
    },
    {
      icon: Layers,
      title: "Capped 5-step recovery, never an open-ended grid",
      desc: "Controlled lot multiplier limit preventing endless exposure.",
    },
    {
      icon: CheckCircle2,
      title: "Max-spread and slippage guards",
      desc: "Skips entries during volatile spreads and sudden spikes.",
    },
    {
      icon: Activity,
      title: "Glass on-chart panel with live trades, today's P/L, balance, session and news status",
      desc: "Comprehensive live terminal diagnostics in one sleek HUD.",
    },
    {
      icon: Sliders,
      title: "SET page on the panel — change the main settings from the chart",
      desc: "Switch presets, direction, and lots without restarting the EA.",
    },
  ];

  return (
    <section style={{ padding: "60px 0 40px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
            <span
              style={{
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              WHAT YOU GET
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            Inside{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              FiAlgo V1
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.5)",
              lineHeight: 1.6,
              maxWidth: 540,
              margin: 0,
            }}
          >
            Complete feature suite engineered for high-precision algorithmic Gold trading.
          </p>
        </motion.div>

        {/* 12 Cards Grid (FAQ card settings on all cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                {...fadeUp(0.04 * i)}
                style={{
                  ...FAQ_CARD_STYLE,
                  padding: "24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  minHeight: 140,
                  transition: "all 0.25s ease",
                }}
                whileHover={FAQ_CARD_HOVER}
              >
                {/* Icon box */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={17} color="#ffffff" />
                </div>

                {/* Content */}
                <h4
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: "0 0 6px",
                    lineHeight: 1.35,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {card.title}
                </h4>

                {card.subtext && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255, 255, 255, 0.45)",
                      margin: "4px 0 0",
                      fontWeight: 500,
                    }}
                  >
                    {card.subtext}
                  </p>
                )}
                {card.desc && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255, 255, 255, 0.45)",
                      margin: "4px 0 0",
                      lineHeight: 1.45,
                    }}
                  >
                    {card.desc}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE 3 COMPONENT: 8 modules. One click each. (Risk Modules Grid)
   ═══════════════════════════════════════════════════════════════════ */
export function RiskModulesSection() {
  const modules = [
    {
      num: "01",
      title: "DAILY DD guard",
      desc: "Optional (default 20%). When today's loss reaches your %, every trade closes and the EA stops until the next day. Set it below your firm's daily loss rule.",
    },
    {
      num: "02",
      title: "DAILY target",
      desc: "Optional (default 50%). Hit your % for the day — lock it in and stop trading.",
    },
    {
      num: "03",
      title: "NEWS filter",
      desc: "Reads the MT5 economic calendar: 15 min before high-impact USD news it closes all trades and pending orders, and resumes 15 min after. Medium impact optional.",
    },
    {
      num: "04",
      title: "SESSION filter",
      desc: "Pick your country and session (Asia, London, New York, London+NY or custom hours). Auto DST. Everything is flat 5 min before the session ends.",
    },
    {
      num: "05",
      title: "5-STEP recovery",
      desc: "After a stop-out the next trade opens at 2x lot only after a $-loss gap (scaled with lot). Max 5 trades — 0.01, 0.02, 0.04, 0.08, 0.16 — then the cycle resets.",
    },
    {
      num: "06",
      title: "BE + TRAIL",
      desc: "At +20 pips the stop moves to entry, then trails in 10-pip steps. Basket TP 1.2 pips past break-even.",
    },
    {
      num: "07",
      title: "SPREAD guard",
      desc: "Skips entries when the spread is above your limit (default 500 points) and controls slippage.",
    },
    {
      num: "08",
      title: "SET page",
      desc: "Change the main settings from the chart panel — direction, lots, daily guards, session, news — remembered per account and symbol.",
    },
  ];

  return (
    <section style={{ padding: "60px 0 40px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
        {/* Section Header */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
            <span
              style={{
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              RISK MODULES
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            8 modules.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              One click each.
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: 580,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Every module is a toggle on the on-chart dashboard. The EA remembers your choice per chart and magic number.
          </p>
        </motion.div>

        {/* 8 Cards Grid (FAQ card settings on all cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {modules.map((mod, i) => (
            <motion.div
              key={mod.num}
              {...fadeUp(0.05 * i)}
              style={{
                ...FAQ_CARD_STYLE,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.25s ease",
              }}
              whileHover={FAQ_CARD_HOVER}
            >
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.8)",
                    letterSpacing: 0.5,
                  }}
                >
                  {mod.num}
                </span>
              </div>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 10px",
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                {mod.title}
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.55)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {mod.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE 2 COMPONENT: Free Trial & Downloads Section
   ═══════════════════════════════════════════════════════════════════ */
export function FreeTrialDownloadsSection() {
  const [downloadingDemo, setDownloadingDemo] = useState(false);
  const [downloadingBacktest, setDownloadingBacktest] = useState(false);

  const handleDownload = (type: "demo" | "backtest") => {
    if (type === "demo") {
      setDownloadingDemo(true);
      handleFileDownload("FIALGO_V1_DEMO.ex5", "demo");
      setTimeout(() => setDownloadingDemo(false), 2000);
    } else {
      setDownloadingBacktest(true);
      handleFileDownload("FIALGO_V1_BACKTEST.ex5", "backtest");
      setTimeout(() => setDownloadingBacktest(false), 2000);
    }
  };

  return (
    <section style={{ padding: "60px 0 60px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 18, height: 2, background: "#fff", borderRadius: 2 }} />
            <span
              style={{
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              TRY BEFORE YOU BUY
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            Free trial &{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              downloads
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: 580,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Download the free demo build (demo accounts only, no key needed) or the backtest build for the MT5 Strategy Tester. No payment, no account needed.
          </p>
        </motion.div>

        {/* Big Card Box (FAQ card settings) */}
        <motion.div
          {...fadeUp(0.15)}
          style={{
            ...FAQ_CARD_STYLE,
            padding: "36px 32px",
            position: "relative",
          }}
        >
          {/* Download icon box */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Download size={20} color="#ffffff" />
          </div>

          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 8px",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Free backtest pack
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.55)",
              margin: "0 0 28px",
              lineHeight: 1.6,
            }}
          >
            Run it in MT5 Strategy Tester — no key needed. Load the .set file in the Inputs tab to get the same report shown below.
          </p>

          {/* Download List Items (inner FAQ pill style) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Demo Build Item */}
            <button
              onClick={() => handleDownload("demo")}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.04)",
                border: "none",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                outline: "none",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 3, letterSpacing: "0.02em" }}>
                  FIALGO V1 - DEMO.ex5
                </div>
                <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>
                  {downloadingDemo ? "Download initiated..." : "Free demo build · demo accounts only · no key needed"}
                </div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                {downloadingDemo ? <Check size={16} /> : <ArrowDown size={16} />}
              </div>
            </button>

            {/* Backtest Build Item */}
            <button
              onClick={() => handleDownload("backtest")}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.04)",
                border: "none",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                outline: "none",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 3, letterSpacing: "0.02em" }}>
                  FIALGO V1 - BACKTEST.ex5
                </div>
                <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)" }}>
                  {downloadingBacktest ? "Download initiated..." : "Strategy Tester only · no key needed"}
                </div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                {downloadingBacktest ? <Check size={16} /> : <ArrowDown size={16} />}
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
