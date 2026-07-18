const fs = require('fs');

const content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
const startIndex = content.indexOf('function HowItWorks() {');
const endIndex = content.indexOf('/* ════════════════', startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find bounds");
  process.exit(1);
}

const newComponent = `function HowItWorks() {
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
      icon: <Users size={26} strokeWidth={1.8} />,
      color: "#6366f1", colorBg: "rgba(99,102,241,0.1)", colorBorder: "rgba(99,102,241,0.25)",
      title: "Create Your Account",
      desc: "Start your trading journey with Tradifive. Set up your profile, customize your experience, and unlock access to the complete trading ecosystem.",
      tag: "Get Started",
      side: "left"
    },
    {
      num: "02",
      icon: <Layers size={26} strokeWidth={1.8} />,
      color: "#10b981", colorBg: "rgba(16,185,129,0.1)", colorBorder: "rgba(16,185,129,0.25)",
      title: "Connect Your Broker",
      desc: "Link any MT5 broker securely. Our bridge technology ensures zero-latency execution while keeping your funds completely secure on your broker's end.",
      tag: "MT5 Integration",
      side: "right"
    },
    {
      num: "03",
      icon: <ShieldCheck size={26} strokeWidth={1.8} />,
      color: "#f59e0b", colorBg: "rgba(245,158,11,0.1)", colorBorder: "rgba(245,158,11,0.25)",
      title: "Activate Risk Guard",
      desc: "Set your daily loss limits and maximum trades. Once your rules are breached, Tradifive automatically locks your account for the day to prevent revenge trading.",
      tag: "AI Protected",
      side: "left"
    },
    {
      num: "04",
      icon: <Globe size={26} strokeWidth={1.8} />,
      color: "#ec4899", colorBg: "rgba(236,72,153,0.1)", colorBorder: "rgba(236,72,153,0.25)",
      title: "Join Community & Creators",
      desc: "Follow verified traders, join public or private channels, share ideas, learn from creators, and grow alongside a community of traders.",
      tag: "Start Growing",
      side: "right"
    },
  ];

  // Calculate dynamic responsive SVG path for the "crazy" snaking line
  const { w, h } = dim;
  let pathString = "";
  if (w > 0 && h > 0) {
    const isMobile = w < 768;
    const cx = w / 2;
    
    // For mobile, the boxes are all full width, so the line just goes straight down the left
    if (isMobile) {
      const lx = 30; // 30px from left edge
      pathString = \`M \${cx} 0 L \${lx} 100 L \${lx} \${h - 100} L \${cx} \${h}\`;
    } else {
      const lx = w * 0.25; // 25% from left (center of left box)
      const rx = w * 0.75; // 75% from left (center of right box)
      const stepH = h / 4;
      
      // Start at top center
      pathString = \`M \${cx} 0 \`;
      
      // Curve to Box 1 (Left)
      pathString += \`C \${cx} \${stepH * 0.2}, \${lx} \${stepH * 0.1}, \${lx} \${stepH * 0.5} \`;
      
      // Curve to Box 2 (Right)
      pathString += \`S \${rx} \${stepH * 0.8}, \${rx} \${stepH * 1.5} \`;
      
      // Curve to Box 3 (Left)
      pathString += \`S \${lx} \${stepH * 1.8}, \${lx} \${stepH * 2.5} \`;
      
      // Curve to Box 4 (Right)
      pathString += \`S \${rx} \${stepH * 2.8}, \${rx} \${stepH * 3.5} \`;
      
      // Curve to bottom center
      pathString += \`S \${cx} \${h * 0.95}, \${cx} \${h}\`;
    }
  }

  return (
    <section id="how-it-works" style={{ backgroundColor: "transparent", padding: "120px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 90 }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: "inline-block", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "6px 18px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24 }}
          >
            THE TRADIFIVE JOURNEY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}
          >
            From Beginner to Consistent Trader<br />
            <span style={{ background: "linear-gradient(to right, rgba(255,255,255,0.65), rgba(255,255,255,0.35))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>In Four Simple Steps.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Everything you need — learning, trading, discipline, AI guidance, and community — in one ecosystem.
          </motion.p>
        </div>

        {/* 3D Crazy Timeline */}
        <div ref={containerRef} style={{ position: "relative", padding: "40px 0" }}>
          
          {/* Animated Winding SVG Line */}
          {w > 0 && h > 0 && (
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
              <path d={pathString} stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
              <motion.path 
                d={pathString} 
                stroke="url(#gradient)" 
                strokeWidth="4" 
                fill="none" 
                style={{ pathLength: scrollYProgress }} 
                strokeLinecap="round"
                filter="drop-shadow(0 0 12px rgba(99,102,241,0.8))"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="33%" stopColor="#10b981" />
                  <stop offset="66%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Glowing Orb that follows path via framer motion */}
          {w > 0 && h > 0 && (
            <motion.div 
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: 24, height: 24,
                marginLeft: -12, marginTop: -12,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 20px 4px rgba(255,255,255,0.8), 0 0 40px 10px rgba(99,102,241,0.6)",
                zIndex: 10,
                offsetPath: \`path('\${pathString}')\`,
                offsetDistance: useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
              }}
            />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
            {STEPS.map((step, i) => {
              const isRight = step.side === "right";
              const isMobile = w < 768;
              return (
                <div key={i} style={{ 
                  display: "flex", 
                  justifyContent: isMobile ? "flex-end" : (isRight ? "flex-end" : "flex-start"), 
                  position: "relative", 
                  zIndex: 2,
                  paddingLeft: isMobile ? 60 : 0
                }}>
                  
                  {/* Floating 3D Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 60, rotateY: isMobile ? 0 : (isRight ? -30 : 30), scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    whileHover={{ y: -10, rotateY: isMobile ? 0 : (isRight ? 5 : -5), rotateX: 5, scale: 1.05 }}
                    style={{ 
                      perspective: 1200, 
                      width: "100%", 
                      maxWidth: isMobile ? "100%" : 400,
                      background: "#121214", borderRadius: 24, padding: 32,
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: \`inset 0 1px 0 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5), 0 0 40px \${step.colorBg}\`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 18,
                        background: "#171717",
                        border: \`1.5px solid \${step.colorBorder}\`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: step.color,
                        boxShadow: \`0 0 20px \${step.colorBg}\`,
                      }}>
                        {step.icon}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: 2 }}>STEP {step.num}</span>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 4 }}>{step.title}</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontWeight: 400 }}>{step.desc}</p>
                    
                    <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, boxShadow: \`0 0 10px \${step.color}\` }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{step.tag}</span>
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
`

const finalContent = content.slice(0, startIndex) + newComponent + "\n" + content.slice(endIndex);
fs.writeFileSync('src/pages/Landing.tsx', finalContent);
console.log('Successfully replaced HowItWorks component.');
