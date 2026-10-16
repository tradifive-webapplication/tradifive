import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Cpu, Rocket, Shield, ArrowLeft, ShieldCheck } from "lucide-react";
import tradifiveLogo from "@/assets/tradifive-login-logo.png";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const G = () => (
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    :root {
      --bg: #02040a;
      --ink: #ffffff;
      --ink2: rgba(255, 255, 255, 0.7);
      --ink3: rgba(255, 255, 255, 0.4);
      --azure: #3b82f6;
      --slate: #94a3b8;
    }
    body {
      background: var(--bg);
      color: var(--ink);
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3 {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.02em;
    }
    .text-glow {
      background: linear-gradient(to right, #fff 20%, #cccccc 80%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .feat-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      padding: 32px;
      transition: all 0.3s ease;
    }
    .feat-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-5px);
    }
    .noise {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: url('https://grainy-gradients.vercel.app/noise.svg');
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }
  `}</style>
);

export default function AIEngine() {
   const navigate = useNavigate();

   return (
      <div style={{ minHeight: "100vh", background: "#02040a", color: "#fff", position: "relative", overflow: "hidden" }}>
         <G />
         <div className="noise" />

         {/* Background Aura */}
         <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
         <div style={{ position: "absolute", bottom: "10%", right: "20%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

         {/* Nav */}
         <PublicNavbar onStart={() => navigate("/login")} />

         {/* Hero Section */}
         <section style={{ position: "relative", paddingTop: 180, paddingBottom: 100 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" }}>

               {/* Left Content */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 32, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                     <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3b82f6" }} />
                     <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "none", letterSpacing: "0.2px" }}>Neural Execution Layer</span>
                  </div>

                  <h1 style={{ fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.05em", marginBottom: 24, color: "#fff", fontFamily: "Inter, sans-serif" }}>
                     <span style={{ background: "linear-gradient(to right, #3b82f6, #ffffff 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>The Brain Behind.</span><br />
                     <span className="text-glow">Your Performance.</span>
                  </h1>

                  <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, maxWidth: 540, marginBottom: 40, fontWeight: 400 }}>
                     Tradifive's AI Engine doesn't just trade—it evolves. Using institutional-grade neural networks, it processes millions of data points per second to identify high-probability edges.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginBottom: 48 }}>
                     <div className="feat-card">
                        <Zap size={20} color="#3b82f6" style={{ marginBottom: 16 }} />
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>2.4ms Latency</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Direct-to-market execution with optimized routing protocols.</p>
                     </div>
                     <div className="feat-card">
                        <Shield size={20} color="#3b82f6" style={{ marginBottom: 16 }} />
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Adaptive Logic</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Adjusts to market volatility in real-time automatically.</p>
                     </div>
                  </div>

                  <button
                     onClick={() => navigate("/login")}
                     style={{ padding: "14px 32px", borderRadius: 100, background: "#3b82f6", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", transition: "all 0.3s" }}
                  >
                     Deploy AI Engine Now
                  </button>
               </motion.div>

               {/* Right Visual */}
               <div style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                     position: "relative",
                     left: "150px",
                     top: "-20px",
                     width: "180%",
                     aspectRatio: "1/1",
                     overflow: "hidden",
                     borderRadius: "40px",
                     background: "#02040a",
                  }}>
                     <img
                        src="/Brain.jpg"
                        alt="AI Engine"
                        style={{ width: "100%", height: "100%", display: "block", opacity: 0.9, objectFit: "cover" }}
                     />

                     {/* 4-Way Black Fades */}
                     <div style={{
                        position: "absolute",
                        inset: 0,
                        background: `
                  linear-gradient(to right, #02040a 0%, transparent 40%),
                  linear-gradient(to left, #02040a 0%, transparent 40%),
                  linear-gradient(to bottom, #02040a 0%, transparent 40%),
                  linear-gradient(to top, #02040a 0%, transparent 40%)
                `,
                        pointerEvents: "none",
                        zIndex: 6
                     }} />

                     {/* Theme Glow */}
                     <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), transparent 60%)",
                        pointerEvents: "none",
                        zIndex: 5
                     }} />
                  </div>
               </div>

            </div>
         </section>

         {/* Neural Intelligence Showcase */}
         <section style={{ padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }} className="flex-col-sm">
                  <div style={{ position: "relative" }}>
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                        <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 40, padding: 48, backdropFilter: "blur(20px)" }}>
                           <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
                              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                 <Cpu size={32} color="#3b82f6" />
                              </div>
                              <div>
                                 <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Neural Engine v4.2</p>
                                 <p style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Direct-to-Market</p>
                              </div>
                           </div>

                           <div style={{ display: "flex", flexDirection: "column" }}>
                              {[
                                 { label: "Execution Latency", val: "2.4ms", sub: "Optimized Routing" },
                                 { label: "Data Points / Sec", val: "1.2M", sub: "Real-time Telemetry" },
                                 { label: "Adaptive Logic", val: "Active", sub: "Volatility Protection" }
                              ].map(stat => (
                                 <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div>
                                       <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{stat.label}</p>
                                       <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{stat.sub}</p>
                                    </div>
                                    <p style={{ fontSize: 18, fontWeight: 900, color: "#3b82f6" }}>{stat.val}</p>
                                 </div>
                              ))}
                           </div>

                           <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }} />
                              <span style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Systemic Edge Sync Verified</span>
                           </div>
                        </div>
                     </motion.div>
                     <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120%", height: "120%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)", zIndex: 0 }} />
                  </div>

                  <div>
                     <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>AI Coach Module</span>
                     </div>
                     <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", marginBottom: 24, lineHeight: 1.1 }}>Meet Kimi.<br /><span className="text-glow">Your Performance Co-pilot.</span></h2>
                     <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 40 }}>
                        Institutional trading requires objective analysis. Kimi audits your sessions, identifies cognitive biases, and helps you refine your strategy with neural-precision feedback.
                     </p>

                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {[
                           { t: "Live Audits", d: "Neural session tracking." },
                           { t: "Logic Builder", d: "Algorithm design aid." },
                           { t: "Edge Discovery", d: "Market pattern detection." },
                           { t: "Risk Guardian", d: "Proactive threat alerts." }
                        ].map(f => (
                           <div key={f.t} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24 }}>
                              <h4 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{f.t}</h4>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{f.d}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Adaptive Logic Section */}
         <section style={{ padding: "100px 40px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center" }} className="flex-col-sm">
                  <div>
                     <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Neural Stability</span>
                     </div>
                     <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>Adaptive Volatility Logic</h2>
                     <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 32 }}>
                        The AI Engine automatically recalibrates your risk parameters during extreme market events. If volatility spikes beyond institutional thresholds, the engine secures your open PnL and adjusts your entry filters.
                     </p>
                     <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "24px 32px", borderRadius: 24, display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                           <Rocket size={24} color="#3b82f6" />
                        </div>
                        <div>
                           <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Institutional Safety Mode</p>
                           <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Auto-recalibration enabled across all symbols.</p>
                        </div>
                     </div>
                  </div>

                  <div style={{ position: "relative" }}>
                     <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
                     <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 40, padding: 48 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                           <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "2px" }}>Volatility Spectrum</span>
                           <span style={{ fontSize: 10, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "2px" }}>Neural Sync</span>
                        </div>
                        <div style={{ height: 120, display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 32 }}>
                           {[40, 60, 45, 90, 65, 80, 50, 70, 85, 60, 95, 75, 80, 55].map((h, i) => (
                              <motion.div
                                 key={i}
                                 initial={{ height: 0 }}
                                 whileInView={{ height: `${h}%` }}
                                 transition={{ duration: 0.5, delay: i * 0.05 }}
                                 style={{ flex: 1, background: i === 10 ? "#3b82f6" : "rgba(59, 130, 246, 0.2)", borderRadius: "4px 4px 0 0" }}
                              />
                           ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Peak Volatility Alert</p>
                           <p style={{ fontSize: 13, fontWeight: 900, color: "#3b82f6" }}>RECALIBRATING...</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Edge Execution Architecture */}
         <section style={{ padding: "100px 40px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }} className="flex-col-sm">
                  <div>
                     <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "6px 16px", borderRadius: "100px", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>Local Edge Processing</span>
                     </div>
                     <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>Run Locally. Execute Globally.</h2>
                     <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 32 }}>
                        Your algorithms shouldn't rely on distant servers. Download the TradiFive Bridge file, run it directly on your workstation, and connect your MT5 terminal for zero-latency execution.
                     </p>

                     <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                           <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Zap size={20} color="#3b82f6" />
                           </div>
                           <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>High-Frequency Scalping</p>
                        </div>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 20 }}>
                           Engineered for intensity. The AI Engine is capable of executing <span style={{ color: "#fff", fontWeight: 700 }}>10+ trades per minute</span> in fractions of a second, ensuring you capture every micro-pip of alpha.
                        </p>
                        <div style={{ height: 1, width: "100%", background: "rgba(255,255,255,0.05)", marginBottom: 20 }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>Current Throughput</span>
                           <span style={{ fontSize: 14, fontWeight: 900, color: "#3b82f6" }}>0.04s Execution</span>
                        </div>
                     </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 40, padding: 48, position: "relative", overflow: "hidden" }}>
                     <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.03))", pointerEvents: "none" }} />
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                        <h3 style={{ fontSize: 24, fontWeight: 800 }}>Algo Kill Switch</h3>
                        <div style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", fontSize: 11, fontWeight: 900 }}>EMERGENCY OVERRIDE</div>
                     </div>
                     <p style={{ color: "var(--ink2)", lineHeight: 1.6, marginBottom: 32 }}>
                        Total control over your automated systems. The **Algo Kill Switch** allows you to instantly terminate all running logic and close all open positions if drawdown limits are breached or market conditions shift.
                     </p>
                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                           <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 4 }}>Drawdown Target</p>
                           <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Fixed -2.5%</p>
                        </div>
                        <div style={{ padding: 20, background: "rgba(59, 130, 246, 0.05)", borderRadius: 16, border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                           <p style={{ fontSize: 10, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", marginBottom: 4 }}>Status</p>
                           <p style={{ fontSize: 20, fontWeight: 900, color: "#3b82f6" }}>Monitoring</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Custom Algo & Account Growth */}
         <section style={{ padding: "100px 40px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
               <div style={{ textAlign: "center", marginBottom: 80 }}>
                  <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24 }}>Custom Algo Engineering</h2>
                  <p style={{ fontSize: 18, color: "var(--ink2)", maxWidth: 700, margin: "0 auto" }}>
                     Need something unique? Our institutional engineers build bespoke trading algorithms tailored to your specific edge.
                  </p>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 32, padding: 48 }}>
                     <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 40 }}>Account Growth Focused</h3>
                     <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 40 }}>
                        {[20, 35, 30, 50, 45, 65, 60, 85, 80, 100].map((h, i) => (
                           <div key={i} style={{ flex: 1, background: "linear-gradient(to top, #3b82f6, transparent)", height: `${h}%`, borderRadius: "4px 4px 0 0", opacity: 0.3 + (i * 0.07) }} />
                        ))}
                     </div>
                     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                        <div>
                           <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Equity Growth</p>
                           <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>+42.5%</p>
                        </div>
                        <div>
                           <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Profit Factor</p>
                           <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>2.48</p>
                        </div>
                        <div>
                           <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Win Rate</p>
                           <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>68.2%</p>
                        </div>
                     </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                     <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 32, padding: 40 }}>
                        <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Bespoke Development</h4>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 24 }}>
                           Work with our team to codify your manual strategy into a high-performance automated system.
                        </p>
                        <button onClick={() => navigate("/login")} style={{ width: "100%", padding: "16px", borderRadius: 12, background: "#fff", color: "#000", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}>
                           Inquire for Custom Build
                        </button>
                     </div>
                     <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 32, padding: 40, display: "flex", alignItems: "center", gap: 20 }}>
                        <ShieldCheck size={32} color="#3b82f6" />
                        <div>
                           <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Prop Firm Compatible</p>
                           <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Passed 500+ challenges globally.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <PublicFooter />
      </div>
   );
}
