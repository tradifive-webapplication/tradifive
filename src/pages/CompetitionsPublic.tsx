import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Trophy, Target, Award, Zap, TrendingUp, Shield, ChevronRight, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarsBackground from "@/components/StarsBackground";
import { PublicFAQ } from "@/components/PublicFAQ";

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay } };
}

const LEADERBOARD = [
  { rank: 1, badge: "🥇", name: "Marcus V.", country: "🇺🇸", gain: "+₹4,820", pct: "+24.1%", color: "#f59e0b" },
  { rank: 2, badge: "🥈", name: "Elena R.", country: "🇩🇪", gain: "+₹3,210", pct: "+16.0%", color: "#94a3b8" },
  { rank: 3, badge: "🥉", name: "David M.", country: "🇬🇧", gain: "+₹2,880", pct: "+14.4%", color: "#cd7c2f" },
  { rank: 4, badge: "#4", name: "Yuki T.", country: "🇯🇵", gain: "+₹2,100", pct: "+10.5%", color: "#6366f1" },
  { rank: 12, badge: "You", name: "Your Account", country: "🏁", gain: "+₹891", pct: "+4.4%", color: "#10b981", isYou: true },
];

const STEPS = [
  { step: "01", icon: <Zap size={24} />, title: "Connect MT5", color: "#f59e0b", desc: "Link your existing MT5 broker account in under 60 seconds using our secure read-only API bridge. No withdrawal access, ever." },
  { step: "02", icon: <TrendingUp size={24} />, title: "Trade & Climb", color: "#6366f1", desc: "Execute trades in your normal MT5 terminal. Your performance metrics update in real-time on the live competition leaderboard." },
  { step: "03", icon: <Trophy size={24} />, title: "Win Real Prizes", color: "#10b981", desc: "Finish in the top tier at month's end to claim direct cash payouts or an exclusive funded account challenge worth up to ₹100k." },
];

const PRIZES = [
  { place: "1st Place", amount: "₹2,000", badge: "🥇", desc: "Cash + Funded Account Seat (₹50k)", color: "#f59e0b" },
  { place: "2nd Place", amount: "₹1,000", badge: "🥈", desc: "Cash Prize + Premium Badge", color: "#94a3b8" },
  { place: "3rd Place", amount: "₹500", badge: "🥉", desc: "Cash Prize + Elite Badge", color: "#cd7c2f" },
  { place: "Top 10%", amount: "Bonus", badge: "⭐", desc: "Exclusive Tier Upgrade + XP Multiplier", color: "#6366f1" },
];

const FAQ = [
  { q: "Is my capital at risk?", a: "No. Competitions use your real trading account's performance metrics but no tournament-specific capital is required. Your existing broker account trades are tracked." },
  { q: "How is performance verified?", a: "Every P&L figure is pulled directly from your MT5 account via read-only API. Nothing can be faked or manually edited. All results are 100% auditable." },
  { q: "How often do competitions run?", a: "Monthly championships run continuously. Smaller weekly sprints are also available. You can join multiple simultaneously with different broker accounts." },
  { q: "When and how do I get paid?", a: "Payouts are processed within 5 business days of the month-end close. You choose your payout method: bank transfer, crypto, or platform credit." },
];

export default function CompetitionsPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login");

  return (
    <div style={{ background: "#02040a", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .comp-hero { grid-template-columns: 1fr !important; }
          .steps-row { grid-template-columns: 1fr !important; }
          .prize-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <PublicNavbar onSignIn={handleStart} onSignUp={handleStart} onDownloadClick={() => navigate("/download")} />
      <StarsBackground />

      <main style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <section style={{ padding: "160px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="comp-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div {...fadeUp()}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
              <Trophy size={13} color="#f59e0b" />
              <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Live Tournaments</span>
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
              Compete.<br />
              <span style={{ background: "linear-gradient(to right, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Get Funded.</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
              Monthly trading competitions with real cash prizes and funded account seats. Your ranking is 100% transparent, verifiable, and MT5-authenticated. No pay-to-win, no fake results.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={handleStart} className="btn-glow-primary" style={{ borderRadius: 100, padding: "14px 32px", fontSize: 15, fontWeight: 700 }}>
                Join Next Tournament →
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0" }}>
                <div style={{ display: "flex" }}>
                  {[1, 2, 3].map(n => <div key={n} style={{ width: 28, height: 28, borderRadius: "50%", background: `rgba(245,158,11,${0.2 + n * 0.1})`, border: "2px solid #02040a", marginLeft: n > 1 ? -8 : 0 }} />)}
                </div>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>1,200+ traders competing now</span>
              </div>
            </div>
          </motion.div>

          {/* Live Leaderboard */}
          <motion.div {...fadeUp(0.2)}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 28, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>June Championship</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }} />
                    <span style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>Live · 24 days remaining</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f59e0b", fontSize: 24, fontWeight: 900 }}>₹5,000</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Prize Pool</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LEADERBOARD.map((u, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }} viewport={{ once: true }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: u.isYou ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)", border: u.isYou ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: u.isYou ? 11 : 18, fontWeight: 800, width: 24, textAlign: "center", color: u.isYou ? "#6366f1" : undefined }}>{u.badge}</span>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{u.country} Trader</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#10b981", fontWeight: 800, fontSize: 14 }}>{u.gain}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{u.pct}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>How it Works</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Three simple steps. Real money. Real accountability.</p>
        </motion.div>
        <div className="steps-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {STEPS.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.12)} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "36px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 20, right: 24, fontSize: 52, fontWeight: 900, color: "rgba(255,255,255,0.03)", lineHeight: 1 }}>{s.step}</div>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: s.color }}>
                {s.icon}
              </div>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRIZE BREAKDOWN */}
      <section style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>Prize Breakdown</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Every eligible trader gets rewarded for strong performance.</p>
        </motion.div>
        <div className="prize-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {PRIZES.map((p, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p.color}25`, borderRadius: 20, padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.badge}</div>
              <div style={{ color: p.color, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>{p.amount}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{p.place}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.5 }}>{p.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <PublicFAQ faqs={FAQ} />

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <motion.div {...fadeUp()} style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 20 }}>
            Ready to compete?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 36 }}>Join the next tournament for free. No registration fee.</p>
          <button onClick={handleStart} className="btn-glow-primary" style={{ borderRadius: 100, padding: "16px 44px", fontWeight: 800, fontSize: 16 }}>
            Enter the Arena →
          </button>
        </motion.div>
      </section>
      </main>

      <PublicFooter />
    </div>
  );
}
