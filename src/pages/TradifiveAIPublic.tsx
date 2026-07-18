import React, { useRef, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import LaserFlow from "@/components/LaserFlow";
import PublicFooter from "@/components/PublicFooter";
import WaitlistModal from "@/components/WaitlistModal";
import { Sparkles, Brain, Shield, MessageCircle, BarChart3, Zap, Target, ChevronDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

const aiCoachFeatures = [
  {
    icon: Brain,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.22)",
    title: "Real-Time Behavioral Interventions",
    description: "The AI Coach tracks patterns in your order entry and volume to recognize when you're deviating from your plan due to greed, FOMO, or panic — and intervenes before damage is done.",
  },
  {
    icon: Shield,
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.22)",
    title: "Risk Guard Integration",
    description: "Automatically enforces your daily loss limits and position sizing rules. If you're about to break a rule, the coach warns you with context — not just a popup.",
  },
  {
    icon: MessageCircle,
    color: "#34d399",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.22)",
    title: "Natural Language Reviews",
    description: "Ask your Coach questions like \"Why did I fail my rules on Tuesday?\" or \"Review my execution logic\" and get instant, constructive summaries of your performance.",
  },
  {
    icon: BarChart3,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.22)",
    title: "Psychological Edge Diagnostics",
    description: "Get a personalized behavioral scorecard. Discover if you hold losses too long, cut winners early, or trade poorly during specific hours or market conditions.",
  },
  {
    icon: Zap,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.10)",
    border: "rgba(236,72,153,0.22)",
    title: "Instant Voice & Chat Coaching",
    description: "Talk to your AI Coach through voice or text during live sessions. It listens, understands context, and delivers calm, rational guidance exactly when you need it most.",
  },
  {
    icon: Target,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.10)",
    border: "rgba(6,182,212,0.22)",
    title: "Adaptive Learning Engine",
    description: "The more you trade, the smarter it gets. TradiFive AI builds a unique psychological profile of your trading style and tailors coaching to your specific weaknesses.",
  },
];

const faqItems = [
  {
    question: "How does the AI Coach analyze my trades?",
    answer: "TradiFive AI analyzes your complete trading history — entry/exit patterns, position sizing, timing, win/loss streaks, and emotional indicators. It cross-references this data with your stated rules and plan to detect behavioral deviations in real time.",
  },
  {
    question: "Is my trading data secure and private?",
    answer: "Absolutely. All your trading data is encrypted end-to-end and stored securely. Your data is never shared with third parties or used to train models for other users. You own your data completely and can export or delete it at any time.",
  },
  {
    question: "Can the AI Coach prevent me from overtrading?",
    answer: "Yes. The AI Coach monitors your trade frequency, position count, and emotional signals. When it detects overtrading patterns — like revenge trading after a loss or excessive entries during low-probability setups — it triggers real-time alerts and can enforce cool-down periods you've pre-configured.",
  },
  {
    question: "Does it work with all brokers and markets?",
    answer: "TradiFive AI Coach works across all major markets including equities, futures, forex, and crypto. It integrates with most popular brokers through our unified API layer. Check our integrations page for the full list of supported brokers.",
  },
  {
    question: "What makes this different from other trading tools?",
    answer: "Unlike generic analytics dashboards, TradiFive AI is a coaching engine. It doesn't just show you what happened — it understands why, predicts when you're about to repeat mistakes, and actively guides you back to discipline. It's like having a world-class trading psychologist available 24/7.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes. You can start with our free plan which includes basic AI coaching features, limited trade analysis, and community access. Upgrade anytime to unlock advanced behavioral diagnostics, unlimited coaching sessions, and priority AI responses.",
  },
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof faqItems[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.3s",
        background: "#171717",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
        borderRadius: 20,
        marginBottom: 10
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>{item.question}</h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ flexShrink: 0, marginLeft: 12 }}
        >
          <ChevronDown size={16} color="rgba(255,255,255,0.4)" strokeWidth={2.5} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                paddingTop: 14,
                marginTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.65,
                fontWeight: 400
              }}
            >
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TradifiveAIPublic() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const handleStart = () => setShowWaitlist(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  // 1. Entry progress (when top of wrapper moves from bottom of screen to top of screen)
  const { scrollYProgress: entryProgress } = useScroll({
    target: imageContainerRef,
    offset: ["start end", "start start"]
  });
  const headerOpacity = useTransform(entryProgress, [0.5, 1], [1, 0]);
  const headerY = useTransform(entryProgress, [0.5, 1], [0, -40]);

  // 2. Sticky progress (when wrapper is pinned to screen, scrolling its 300vh height)
  const { scrollYProgress: stickyProgress } = useScroll({
    target: imageContainerRef,
    offset: ["start start", "end end"]
  });
  const imageScale = useTransform(stickyProgress, [0, 0.4, 1], [1.0, 1.2, 1.2]);
  const imageBorderRadius = useTransform(stickyProgress, [0, 0.4], ["24px", "0px"]);

  // Phase 1: Image becomes dark (0.4 to 0.5)
  const baseImageOpacity = useTransform(stickyProgress, [0.4, 0.5, 1], [1, 0.2, 0.2]);
  // Phase 2: Mini Photo comes (0.5 to 0.6)
  const miniPhotoOpacity = useTransform(stickyProgress, [0.5, 0.6, 1], [0, 1, 1]);
  const miniPhotoY = useTransform(stickyProgress, [0.5, 0.65], [16, -24]);
  // Phase 3: Arrow comes (0.6 to 0.7)
  const arrowOpacity = useTransform(stickyProgress, [0.6, 0.7, 1], [0, 1, 1]);
  const arrowY = useTransform(stickyProgress, [0.6, 0.75], [8, -12]);
  // Phase 4: Message comes (0.7 to 0.8)
  const messageOpacity = useTransform(stickyProgress, [0.7, 0.8, 1], [0, 1, 1]);
  const messageY = useTransform(stickyProgress, [0.7, 0.85], [-20, 0]);

  return (
    <div
      style={{
        background: "#02040a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicNavbar
        onSignIn={handleStart}
        onSignUp={handleStart}
        onDownloadClick={() => navigate("/download")}
      />

      <main style={{ flex: 1 }}>
        {isMobile ? (
          <div
            style={{
              background: "#02040a",
              padding: "100px 20px 60px 20px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {/* Inline CSS style tag for keyframe animations to keep component self-contained */}
            <style>{`
              @keyframes waterfall {
                0% {
                  top: -10%;
                  opacity: 0;
                }
                5% {
                  opacity: 0.85;
                }
                90% {
                  opacity: 0.85;
                }
                100% {
                  top: 110%;
                  opacity: 0;
                }
              }
            `}</style>

            {/* Ambient Background laser light matching mockup */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <LaserFlow
                horizontalBeamOffset={0.30}
                verticalBeamOffset={-0.12} // Adjusted lower to prevent overlap on mobile
                color="#60A5FA"
                horizontalSizing={0.045}
                verticalSizing={1.2}
                wispDensity={1}
                wispSpeed={15}
                wispIntensity={3}
                flowSpeed={0.35}
                flowStrength={0.25}
                fogIntensity={0.35}
                fogScale={0.3}
                fogFallSpeed={0.6}
                decay={1.1}
                falloffStart={1.2}
              />
            </div>


            {/* Content: Badge, Heading, Subtitle, CTA Button */}
            <div style={{ position: "relative", zIndex: 2, width: "100%", paddingRight: "15%" }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "4px 10px",
                  marginBottom: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                <Sparkles size={9} color="#ffffff" />
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: 8.5,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Artificial Intelligence
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18 }}
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  marginBottom: 12,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Meet Your New
                <br />
                <span style={{ color: "#fff" }}>AI Trading Coach.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28 }}
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.5,
                  marginBottom: 22,
                  fontWeight: 400,
                  maxWidth: 320,
                }}
              >
                TradiFive AI doesn't just show you data. It understands your
                behavior, optimizes your edge, and talks you out of making
                emotional mistakes in real-time.
              </motion.p>

              {/* CTA Button with Ambient Halo Glow behind it */}
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* Halo Glow */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "140%",
                    height: "150%",
                    background: "radial-gradient(circle, rgba(230,215,200,0.3) 0%, transparent 70%)",
                    filter: "blur(12px)",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />

                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.38 }}
                  onClick={handleStart}
                  className="btn-glow-primary"
                  style={{
                    position: "relative",
                    zIndex: 2,
                    borderRadius: 100,
                    padding: "10px 24px",
                    fontWeight: 700,
                    fontSize: 11.5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    letterSpacing: "0.06em",
                    transition: "all 0.2s ease",
                  }}
                >
                  SEE IN ACTION &rarr;
                </motion.button>
              </div>
            </div>

            {/* Dashboard Screenshot block */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                marginTop: 20,
                borderRadius: "8px",
                border: "none",
                overflow: "hidden",
                background: "transparent",
              }}
            >
              <img
                src="/aicoachdesktop.png"
                alt="TradiFive AI Coach Dashboard"
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
              {/* Bottom fade */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "15%",
                  background: "linear-gradient(to top, #02040a 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* Bottom scrolling list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                width: "100%",
                marginTop: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.45)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Everything you need for disciplined trading:
              </div>

              {/* Premium horizontal sliding row */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  overflow: "hidden",
                  padding: "6px 0",
                  // Fade out scroll boundaries
                  maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
                }}
              >
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: 15, repeat: Infinity }}
                  style={{ display: "flex", gap: "16px", whiteSpace: "nowrap" }}
                >
                  {[...["AI Coach", "Risk Guard", "Smart Journal", "Competitions", "Community Hub", "Analytics"], ...["AI Coach", "Risk Guard", "Smart Journal", "Competitions", "Community Hub", "Analytics"]].map((label, i) => (
                    <div
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "rgba(255, 255, 255, 0.95)",
                        }}
                      >
                        {label}
                      </span>
                      {i !== 11 && (
                        <span style={{ color: "rgba(255, 255, 255, 0.25)", fontSize: 12 }}>•</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ── Hero Section ── */}
            <section
              style={{
                position: "relative",
                minHeight: "calc(100vh + 200px)",
                overflow: "visible",
                backgroundColor: "#02040a",
              }}
            >
              {/* LaserFlow — full background */}
              <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                {/* Blue Beam */}
                <LaserFlow
                  horizontalBeamOffset={0.12}
                  verticalBeamOffset={-0.05}
                  color="#60A5FA"
                  horizontalSizing={0.045}
                  verticalSizing={1.2}
                  wispDensity={1}
                  wispSpeed={15}
                  wispIntensity={3}
                  flowSpeed={0.35}
                  flowStrength={0.25}
                  fogIntensity={0.35}
                  fogScale={0.3}
                  fogFallSpeed={0.6}
                  decay={1.1}
                  falloffStart={1.2}
                />
              </div>

              {/* ── Left Text Block ── */}
              <div
                style={{
                  position: "absolute",
                  top: "35%",
                  left: "calc(50% - min(1180px, 94%) / 2)",
                  transform: "translateY(-50%)",
                  maxWidth: 640,
                  zIndex: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    display: "inline-flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: 8,
                    background: "#171717",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "6px 16px 6px 8px",
                    borderRadius: "100px",
                    marginBottom: 32,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "rgba(99,102,241,0.2)" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#818cf8", animation: "pulse 2s infinite" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.5px" }}>AI Trading Coach</span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  style={{
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    fontSize: "clamp(28px, 4.5vw, 50px)",
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: "-0.04em",
                    marginBottom: 20,
                    color: "#fff",
                  }}
                >
                  Meet Your New<br />
                  <span style={{ background: "linear-gradient(to right, #ffffff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Trading Coach.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  style={{
                    fontSize: 17,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.6,
                    maxWidth: 540,
                    marginBottom: 40,
                    fontWeight: 400,
                  }}
                >
                  TradiFive AI doesn't just show you data. It understands your
                  behavior, optimizes your edge, and talks you out of making
                  emotional mistakes in real-time.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32, width: "100%" }}
                >
                  <motion.button
                    onClick={handleStart}
                    className="btn-glow-primary"
                    style={{ borderRadius: "9999px" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    SEE IN ACTION <ArrowRight size={16} />
                  </motion.button>
                  <motion.button
                    onClick={handleStart}
                    className="btn-ghost"
                    style={{ borderRadius: "9999px" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Features
                  </motion.button>
                </motion.div>
              </div>

              {/* ── Dashboard Image ── */}
              <motion.div
                initial={{ opacity: 0, y: -40, clipPath: "inset(0% 0% 100% 0%)" }}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 1.6, delay: 0.45, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  position: "absolute",
                  bottom: "-5%",
                  left: "50%",
                  x: "-50%",
                  width: "min(1180px, 94%)",
                  zIndex: 5,
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.85) 86%, rgba(0,0,0,0.6) 91%, rgba(0,0,0,0.3) 95%, rgba(0,0,0,0.1) 98%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.85) 86%, rgba(0,0,0,0.6) 91%, rgba(0,0,0,0.3) 95%, rgba(0,0,0,0.1) 98%, rgba(0,0,0,0) 100%)",
                }}
              >
                {/* Glow behind image */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 1.0 }}
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                    height: 100,
                    background: "radial-gradient(ellipse, rgba(96,165,250,0.30) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)",
                    filter: "blur(28px)",
                    pointerEvents: "none",
                    zIndex: -1,
                  }}
                />
                {/* Main dashboard screenshot — no border */}
                <img
                  src="/aicoachdesktop.png"
                  alt="TradiFive AI Coach Dashboard"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: "16px 16px 0 0",
                    border: "none",
                    backgroundColor: "#0a0a0f",
                    boxShadow: "0 -32px 120px rgba(96,165,250,0.10), 0 0 80px rgba(168,85,247,0.08)",
                  }}
                />
              </motion.div>

            </section>

            {/* ── Info Section (Top part, dark background) ── */}
            <section style={{ background: "#02040a", padding: "90px 0 48px" }}>
              <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>

                {/* Feature List (Left-aligned stacked layout) */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: "12px",
                    marginBottom: 40,
                    fontFamily: "'Outfit', sans-serif",
                    marginTop: "-20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255, 255, 255, 0.45)",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Everything you need for disciplined trading:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "12px 20px",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {["AI Coach", "Risk Guard", "Smart Journal", "Competitions", "Community Hub", "Analytics"].map((label, i) => (
                      <React.Fragment key={label}>
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.05 * i, duration: 0.4 }}
                        >
                          {label}
                        </motion.span>
                        {i < 5 && <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>

              </div>
            </section>
          </>
        )}

        {/* ── AI Coach Showcase ── */}
        <section style={{ background: "#ffffff", padding: isMobile ? "60px 0 80px 0" : "100px 0 0 0", color: "#09090b", position: "relative" }}>
          {/* Subtle top divider border */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.08)" }} />

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 20px" : "0 40px" }}>

            {/* Header */}
            <motion.div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 64, opacity: isMobile ? 1 : headerOpacity, y: isMobile ? 0 : headerY }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: isMobile ? "4px 10px" : "5px 12px",
                  marginBottom: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                <Sparkles size={isMobile ? 9 : 10} color="#ffffff" />
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: isMobile ? 8.5 : 9.5,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  TradiFive AI
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: isMobile ? "28px" : "clamp(30px, 3.5vw, 48px)",
                  fontWeight: 800,
                  color: "#09090b",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  maxWidth: 700,
                  margin: "0 auto 16px",
                }}
              >
                The First AI Coach That Actually Knows Your Trading Style
              </h2>
              <p
                style={{
                  fontSize: isMobile ? 14 : 16,
                  color: "rgba(9,9,11,0.6)",
                  maxWidth: 580,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                TradiFive AI tracks your patterns, monitors your live execution, and guides you back to discipline before emotional mistakes cost you.
              </p>
            </motion.div>
          </div>

          {/* Animated Full-width Image Mockup (Sticky Wrapper) */}
          <div ref={imageContainerRef} style={{ height: isMobile ? "auto" : "300vh", position: "relative", width: "100%", marginTop: isMobile ? 0 : 24, marginBottom: isMobile ? 40 : 0 }}>
            <div id="hide-nav-zone" style={{ position: isMobile ? "relative" : "sticky", top: 0, height: isMobile ? "auto" : "100vh", display: "flex", alignItems: "flex-start", paddingTop: isMobile ? 20 : 80, justifyContent: "center", overflow: isMobile ? "visible" : "hidden" }}>
              <motion.div
                style={{
                  position: "relative",
                  borderRadius: isMobile ? 8 : imageBorderRadius,
                  overflow: "hidden",
                  background: "#000",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                  border: isMobile ? "none" : "1px solid #e2e8f0",
                  scale: isMobile ? 1 : imageScale,
                  transformOrigin: "center center",
                  width: "92%",
                  maxWidth: 1600,
                }}
              >
                <motion.img
                  src="/aicoachmini (2).png"
                  alt="TradiFive AI Coach Base"
                  style={{ width: "100%", height: "auto", display: "block", opacity: isMobile ? 1 : baseImageOpacity, filter: isMobile ? "blur(1px) brightness(0.65)" : "none" }}
                />

                {/* Mobile Mini Coach Overlay inside the big image */}
                {isMobile && (
                  <div style={{
                    position: "absolute",
                    bottom: "3%",
                    right: "4%",
                    width: "25%",
                    maxWidth: 110,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    borderRadius: 10,
                    overflow: "hidden"
                  }}>
                    <img src="/minicoach.png" alt="Mini Coach Mobile" style={{ width: "100%", height: "auto", display: "block" }} />
                  </div>
                )}

                {/* Overlay — full width row: text left, S-curve arrow, mini coach right */}
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: 0,
                    right: 0,
                    padding: "40px 60px",
                    display: isMobile ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 32,
                  }}
                >
                  {/* Left: Big white text — no box, raw typography */}
                  <motion.div
                    style={{
                      flex: 1,
                      maxWidth: 480,
                      opacity: messageOpacity,
                      y: messageY,
                      marginTop: -300,
                      marginLeft: 300,
                    }}
                  >
                    <p style={{
                      margin: "0 0 10px 0",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "clamp(11px, 1.1vw, 14px)",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(168, 85, 247, 0.9)",
                    }}>
                      Always with you
                    </p>
                    <h3 style={{
                      margin: "0 0 16px 0",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "clamp(28px, 3.5vw, 52px)",
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                    }}>
                      Mini AI Coach.<br />
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Always On.</span>
                    </h3>
                    <p style={{
                      margin: 0,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(13px, 1.2vw, 17px)",
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.7,
                      fontWeight: 400,
                      maxWidth: 380,
                    }}>
                      Instant AI coaching on every page — no switching, no waiting.
                      Jump into a session the moment emotion takes over your trades.
                    </p>
                  </motion.div>

                  {/* Middle: S-curve arrow sweeping left → right */}
                  <motion.svg
                    width="260" height="120" viewBox="0 0 260 120" fill="none"
                    style={{ flexShrink: 0, opacity: arrowOpacity, y: arrowY, marginTop: -140 }}
                  >
                    <defs>
                      <linearGradient id="sArrow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#e879f9" />
                      </linearGradient>
                    </defs>
                    {/* S-curve path: starts bottom-left, swoops up then curves down to the right */}
                    <path
                      d="M 10 100 C 60 100 40 20 130 30 C 200 38 210 80 248 70"
                      stroke="url(#sArrow)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Arrowhead pointing right */}
                    <path
                      d="M 235 58 L 250 70 L 238 83"
                      stroke="#e879f9"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>

                  {/* Right: Mini coach image */}
                  <motion.div
                    style={{
                      width: "26vw",
                      maxWidth: 310,
                      minWidth: 190,
                      boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 2px rgba(168,85,247,0.2)",
                      borderRadius: 18,
                      overflow: "hidden",
                      flexShrink: 0,
                      opacity: miniPhotoOpacity,
                      y: miniPhotoY,
                      marginTop: -100,
                    }}
                  >
                    <img
                      src="/minicoach.png"
                      alt="Mini Coach"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {isMobile && (
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px 0 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              {/* Left text */}
              <div style={{ flex: 1, maxWidth: 320 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(168, 85, 247, 0.08)",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                    borderRadius: 100,
                    padding: "6px 12px",
                    marginBottom: 12,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a855f7", lineHeight: 1 }}>Always with you</span>
                </div>
                <h3 style={{ margin: "0 0 10px 0", fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1.1, color: "#09090b" }}>Mini AI Coach.<br /><span style={{ color: "rgba(9,9,11,0.5)" }}>Always On.</span></h3>
                <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(9,9,11,0.65)", lineHeight: 1.45 }}>Jump into a session the moment emotion takes over. Let our AI guide you back to clarity and keep your trades disciplined and on track.</p>
              </div>

              {/* Arrow pointing up */}
              <svg width="80" height="106" viewBox="0 0 60 80" fill="none" style={{ flexShrink: 0, marginTop: -40, marginRight: 44 }}>
                {/* Horizontal line from left, curving up 90 degrees */}
                <path d="M 5 70 Q 40 70 40 20" stroke="#00d2ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Arrowhead pointing straight up */}
                <path d="M 28 32 L 40 18 L 52 32" stroke="#00d2ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TradiFive AI Coach — Feature Details Section ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ background: "#02040a", padding: "100px 0 120px", position: "relative" }}>
          {/* Top subtle glow */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 1 }}>

            {/* Section Header */}
            <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 72 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "4px 10px",
                  marginBottom: 20,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                <Brain size={9} color="#ffffff" />
                <span style={{ color: "#ffffff", fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
                  AI Coach Capabilities
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(28px, 3.2vw, 44px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  maxWidth: 620,
                  margin: "0 auto 16px",
                }}
              >
                Your Trading Psychology,{" "}
                <span style={{ background: "linear-gradient(135deg, #a855f7, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Decoded & Coached
                </span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
                Six powerful AI-driven capabilities working together to transform how you trade — from impulsive to intentional.
              </p>
            </motion.div>

            {/* Feature Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 24 }}>
              {aiCoachFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6, boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px ${feat.border}, 0 8px 32px rgba(0,0,0,0.5)` }}
                    className="feat-card-premium"
                    style={{
                      display: "block",
                      padding: "28px",
                      cursor: "pointer",
                      background: "#171717",
                      boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                      borderRadius: 20,
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.07 * i + 0.15, duration: 0.4 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: feat.bg,
                        border: `1px solid ${feat.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                      }}
                    >
                      <Icon size={22} color={feat.color} />
                    </motion.div>
                    <h4
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#ffffff",
                        marginBottom: 10,
                        lineHeight: 1.3,
                      }}
                    >
                      {feat.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {feat.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── FAQ Section ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ background: "#060810", padding: "100px 0 120px", position: "relative" }}>
          {/* Top border */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.05)" }} />

          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px" }}>

            {/* FAQ Header */}
            <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 56 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "4px 10px",
                  marginBottom: 20,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                <MessageCircle size={9} color="#ffffff" />
                <span style={{ color: "#ffffff", fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
                  FAQ
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(26px, 3vw, 40px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                }}
              >
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
                Everything you need to know about TradiFive AI Coach.
              </p>
            </motion.div>

            {/* FAQ Accordion */}
            <motion.div {...fadeUp(0.1)} style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {faqItems.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </motion.div>

            {/* CTA below FAQ */}
            <motion.div {...fadeUp(0.2)} style={{ textAlign: "center", marginTop: 64 }}>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
                Still have questions? Start for free and see it in action.
              </p>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 100,
                  padding: "10px 24px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  boxShadow: "none",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                Get Started Free →
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
      {showWaitlist && (
        <WaitlistModal
          isOpen={showWaitlist}
          onClose={() => setShowWaitlist(false)}
        />
      )}
    </div>
  );
}
