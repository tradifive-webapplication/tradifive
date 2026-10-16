import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Shield, BookOpen, Crown, Sparkles, Cpu } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

function MobileSlider({ features }: { features: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <div style={{ padding: "0 0 60px 0" }}>
      <div className="embla" ref={emblaRef} style={{ overflow: "hidden" }}>
        <div className="embla__container" style={{ display: "flex", touchAction: "pan-y pinch-zoom" }}>
          {features.map((feat, i) => (
            <div className="embla__slide" key={i} style={{ flex: "0 0 100%", minWidth: 0, padding: "0 24px" }}>
              <div style={{ width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 32, background: "#111", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center" }}>
                <img src={feat.imageSrc} alt={feat.title} style={{ width: "100%", height: "auto", objectFit: "contain" }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {React.cloneElement(feat.icon, { size: 20 })}
                </div>
                <span style={{ color: feat.color, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>{feat.featureNumber}</span>
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12 }}>{feat.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
        {features.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === selectedIndex ? "#fff" : "rgba(255,255,255,0.2)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Individual Feature Card ─── */
function FeatureCard({ feat }: { feat: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end end"],
  });

  // Phase 1 (0 → 0.3): Card with rounded corners & padding expands to fullscreen
  const inset = useTransform(scrollYProgress, [0, 0.3], [40, 0]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.3], [28, 0]);

  // Phase 2 (0.3 → 0.5): Text fades in after image is fullscreen
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.5], [40, 0]);

  // Overlay darkens as text appears for readability
  const overlayOpacity = useTransform(scrollYProgress, [0.25, 0.5], [0.15, 0.85]);

  return (
    <div ref={cardRef} style={{ height: "300vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
        }}
      >
        {/* IMAGE CONTAINER — starts with padding & rounded corners, expands to fill */}
        <motion.div
          style={{
            position: "absolute",
            top: inset,
            left: inset,
            right: inset,
            bottom: inset,
            borderRadius,
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          {!imageError ? (
            <img
              src={feat.imageSrc}
              alt={feat.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            /* Fallback placeholder when image fails to load */
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0a0a0a",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.15)", marginBottom: 12, display: "flex", justifyContent: "center" }}>
                  {feat.icon}
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 600 }}>
                  {feat.id} Screenshot
                </div>
                <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 12, marginTop: 4 }}>
                  Place {feat.imageSrc} in /public
                </div>
              </div>
            </div>
          )}

          {/* Dark overlay that gets stronger as text appears */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(6px)",
              opacity: overlayOpacity,
            }}
          />

          {/* Radial color glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at center, ${feat.color}30 0%, transparent 60%)`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* TEXT CONTENT — fades in after image goes fullscreen */}
        <motion.div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 800,
            padding: "0 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: textOpacity,
            y: textY,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, justifyContent: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(12px)",
              }}
            >
              {feat.icon}
            </div>
            <span
              style={{
                color: feat.color,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {feat.featureNumber}
            </span>
          </div>

          <h3
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 24,
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            {feat.title}
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 20,
              lineHeight: 1.6,
              maxWidth: 700,
              margin: "0 auto",
              textShadow: "0 2px 16px rgba(0,0,0,0.8)",
              fontWeight: 500,
            }}
          >
            {feat.desc}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DeepDiveFeatures() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const featuresData = [
    {
      id: "Community",
      icon: <Users size={24} color="#6366f1" />,
      color: "#6366f1",
      featureNumber: "FEATURE 01",
      title: "The trading network built for modern traders.",
      desc: "Share ideas, post analysis, follow creators, join public or private channels, and connect with traders worldwide through a beautifully designed social canvas.",
      imageSrc: "/homedesktop.png",
    },
    {
      id: "Risk Guard",
      icon: <Shield size={24} color="#10b981" />,
      color: "#10b981",
      featureNumber: "FEATURE 02",
      title: "Protect your capital before emotions take over.",
      desc: "Set daily loss limits, maximum drawdown rules, trading restrictions, and automated safeguards that help maintain discipline.",
      imageSrc: "/riskguarddesktop.png",
    },
    {
      id: "AI Journal",
      icon: <BookOpen size={24} color="#a855f7" />,
      color: "#a855f7",
      featureNumber: "FEATURE 03",
      title: "Every trade tracked automatically.",
      desc: "Connect your broker and let Tradifive automatically record, analyze, and organize every trade without manual input.",
      imageSrc: "/journaldesktop.png",
    },
    {
      id: "AI Coach",
      icon: <Sparkles size={24} color="#f59e0b" />,
      color: "#f59e0b",
      featureNumber: "FEATURE 04",
      title: "Your personal trading mentor.",
      desc: "Receive real-time coaching, psychology feedback, performance reviews, and personalized improvement plans powered by AI.",
      imageSrc: "/aicoachdesktop.png",
    },
    {
      id: "Creator Hub",
      icon: <Crown size={24} color="#ec4899" />,
      color: "#ec4899",
      featureNumber: "FEATURE 05",
      title: "Build your audience. Share your expertise.",
      desc: "Launch premium communities, create educational content, share signals, and monetize your trading knowledge.",
      imageSrc: "/mentordesktop.png",
    },
    {
      id: "FiAlgo Engine",
      icon: <Cpu size={24} color="#0ea5e9" />,
      color: "#0ea5e9",
      featureNumber: "FEATURE 06",
      title: "FiAlgo Algorithmic Trading Engine (MT5).",
      desc: "Deploy V1 of our intelligent FiAlgo trading algorithms. Supports major pairs like XAUUSD on any MT5 broker. Purchase a license to execute trades completely hands-free while you sleep.",
      imageSrc: "/autotradedesktop.png",
    },
  ];

  return (
    <>
      {/* HEADER SECTION */}
      <section id="features" style={{ backgroundColor: "transparent", padding: "clamp(60px, 10vw, 140px) 24px", position: "relative" }}>
        <motion.div
          {...fadeUp()}
          style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}
        >
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: "100px",
                textTransform: "uppercase",
                fontSize: "clamp(9px, 1.5vw, 11px)",
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              FEATURES
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 5vw, 64px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            <span style={{ background: "linear-gradient(to right, #ffffff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Six Powerful Systems.
              <br />
              One Trading Ecosystem.
            </span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "clamp(15px, 3vw, 18px)",
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Everything you need to trade, learn, improve, connect, and grow—all from one platform.
          </p>
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <div id="deep-dives" style={{ position: "relative", zIndex: 10 }}>
        {isMobile ? (
          <MobileSlider features={featuresData} />
        ) : (
          featuresData.map((feat, i) => (
            <FeatureCard key={i} feat={feat} />
          ))
        )}
      </div>
    </>
  );
}
