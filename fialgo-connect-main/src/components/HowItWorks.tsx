import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { Users, Layers, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const [dim, setDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const ob = new ResizeObserver(entries => {
      if (entries[0]) setDim({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
    });
    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, []);

  const STEPS = [
    {
      num: "01",
      icon: <Users size={24} strokeWidth={2} />,
      color: "#2563eb",
      colorBg: "rgba(37, 99, 235, 0.08)",
      colorBorder: "rgba(37, 99, 235, 0.25)",
      title: "Create Account & Connect MT5",
      desc: "Link any MetaTrader 5 broker securely in under 2 minutes. Your funds remain 100% inside your regulated broker with zero third-party custody.",
      tag: "2-Min Setup",
      side: "left"
    },
    {
      num: "02",
      icon: <Layers size={24} strokeWidth={2} />,
      color: "#f97316",
      colorBg: "rgba(249, 115, 22, 0.08)",
      colorBorder: "rgba(249, 115, 22, 0.25)",
      title: "Set Your Daily Risk Rules",
      desc: "Define your hard daily drawdown (e.g. ₹5,000 max loss), max open contracts, and FOMC/CPI news lockouts. Your rules are cast in iron.",
      tag: "Hard Limits",
      side: "right"
    },
    {
      num: "03",
      icon: <ShieldCheck size={24} strokeWidth={2} />,
      color: "#2563eb",
      colorBg: "rgba(37, 99, 235, 0.08)",
      colorBorder: "rgba(37, 99, 235, 0.25)",
      title: "Autonomous Risk Guard Protects You",
      desc: "Our 0.02s socket circuit breaker monitors your account in real-time. If you hit your limit, your terminal is automatically locked for the day.",
      tag: "0.02s Circuit Breaker",
      side: "left"
    },
    {
      num: "04",
      icon: <Sparkles size={24} strokeWidth={2} />,
      color: "#f97316",
      colorBg: "rgba(249, 115, 22, 0.08)",
      colorBorder: "rgba(249, 115, 22, 0.25)",
      title: "AI Trade Journal & Discipline Score",
      desc: "Every order auto-syncs with zero manual typing. AI grades your setup quality (A+ to F), flags emotional revenge trades, and helps you compound.",
      tag: "100% Auto-Sync",
      side: "right"
    },
  ];

  // Responsive SVG path
  const { w, h } = dim;
  let pathString = "";
  if (w > 0 && h > 0) {
    const isMobile = w < 768;
    const cx = w / 2;

    if (isMobile) {
      const step = h / 4;
      pathString = `M ${cx} 0 `;
      pathString += `C ${cx} ${step * 0.1}, 15 ${step * 0.2}, 15 ${step * 0.5} `;
      pathString += `S 45 ${step * 1.0}, 45 ${step * 1.5} `;
      pathString += `S 15 ${step * 2.0}, 15 ${step * 2.5} `;
      pathString += `S 45 ${step * 3.0}, 45 ${step * 3.5} `;
      pathString += `S ${cx} ${h * 0.9}, ${cx} ${h}`;
    } else {
      const lx = w * 0.25;
      const rx = w * 0.75;
      const stepH = h / 4;

      pathString = `M ${cx} 0 `;
      pathString += `C ${cx} ${stepH * 0.2}, ${lx} ${stepH * 0.1}, ${lx} ${stepH * 0.5} `;
      pathString += `S ${rx} ${stepH * 0.8}, ${rx} ${stepH * 1.5} `;
      pathString += `S ${lx} ${stepH * 1.8}, ${lx} ${stepH * 2.5} `;
      pathString += `S ${rx} ${stepH * 2.8}, ${rx} ${stepH * 3.5} `;
      pathString += `S ${cx} ${h * 0.95}, ${cx} ${h}`;
    }
  }

  return (
    <section id="how-it-works" style={{ backgroundColor: "#ffffff", padding: "80px 24px 60px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 70px" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(37, 99, 235, 0.08)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              padding: "5px 16px",
              borderRadius: 100,
              marginBottom: 16
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 8px #2563eb" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "1px", textTransform: "uppercase" }}>
              THE CONSISTENCY PROTOCOL
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#0f172a",
              marginBottom: 16,
              lineHeight: 1.2
            }}
          >
            From Inconsistent Trading <br />
            <span style={{ background: "linear-gradient(135deg, #2563eb 0%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              To Disciplined Profitability in Four Steps.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            style={{ fontSize: 16, color: "#475569", lineHeight: 1.6, margin: "0 auto", fontWeight: 400 }}
          >
            Everything you need — hard MT5 risk protection, automated AI trade journal, and institutional execution.
          </motion.p>
        </div>

        {/* 3D Timeline */}
        <div ref={containerRef} style={{ position: "relative", padding: "30px 0" }}>

          {/* Animated SVG Path */}
          {w > 0 && h > 0 && (
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
              <path d={pathString} stroke="#e2e8f0" strokeWidth="3" fill="none" />
              <motion.path
                d={pathString}
                stroke="url(#journeyGradient)"
                strokeWidth="3.5"
                fill="none"
                style={{ pathLength: scrollYProgress }}
                strokeLinecap="round"
                filter="drop-shadow(0 0 10px rgba(37,99,235,0.4))"
              />
              <defs>
                <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
            {STEPS.map((step, i) => {
              const isRight = step.side === "right";
              const isMobile = w < 768;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isMobile ? "flex-end" : (isRight ? "flex-end" : "flex-start"),
                    position: "relative",
                    zIndex: 2,
                    paddingLeft: isMobile ? 50 : 0
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)" }}
                    style={{
                      width: "100%",
                      maxWidth: isMobile ? "100%" : 420,
                      background: "#ffffff",
                      borderRadius: 22,
                      padding: isMobile ? 22 : 28,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.04), 0 0 0 1px #e2e8f0",
                      transition: "all 0.25s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          background: step.colorBg,
                          border: `1.5px solid ${step.colorBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: step.color,
                          flexShrink: 0
                        }}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                          STEP {step.num}
                        </span>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginTop: 2, margin: 0 }}>
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.55, margin: "0 0 16px 0", fontWeight: 400 }}>
                      {step.desc}
                    </p>

                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: step.colorBg, borderRadius: 100, border: `1px solid ${step.colorBorder}` }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: step.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: step.color }}>{step.tag}</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
