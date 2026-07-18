import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Download, Shield, Bot, Users, Trophy,
  BookOpen, Smartphone, GraduationCap, TrendingUp,
  BarChart3, Zap, Lock, Globe, MessageCircle, Star,
  ChevronRight, Check
} from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";

/* ─────────────────────────── Reveal wrapper ─────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Animated counter ─────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, target]);

  const display = target >= 1000
    ? `${(count / 1000).toFixed(0)}K+`
    : target === 98
      ? `${count}%`
      : `${count}${suffix}`;

  return <span ref={ref}>{display}</span>;
}

/* ─────────────────────────── Feature card ─────────────────────────── */
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative bg-[#0f0f14] border border-[#1a1a2e] rounded-xl p-6 md:p-8 hover:border-[#6366f1]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_40px_rgba(99,102,241,0.05)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1]/10 to-[#7c3aed]/10 border border-[#6366f1]/20 flex items-center justify-center mb-5 text-[#818cf8]">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────── Pricing card ─────────────────────────── */
function PricingCard({ tier, price, description, features, popular = false }: {
  tier: string; price: string; description: string; features: string[]; popular?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className={`relative bg-[#0f0f14] border rounded-xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${
      popular
        ? "border-[#6366f1]/40 scale-[1.02] bg-gradient-to-b from-[#6366f1]/5 to-[#0f0f14]"
        : "border-[#1a1a2e] hover:border-[#6366f1]/30"
    }`}>
      {popular && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-[0.65rem] font-bold uppercase tracking-wider px-5 py-1 rounded-b-lg">
          Most Popular
        </div>
      )}
      <div className="text-sm font-semibold text-[#818cf8] mb-2">{tier}</div>
      <div className="text-4xl font-extrabold mb-1 flex items-end gap-1">
        {price}
        {price !== "Custom" && <span className="text-sm font-medium text-slate-500 mb-1">/month</span>}
      </div>
      <p className="text-sm text-slate-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
            <span className="w-[18px] h-[18px] rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[0.65rem] font-bold flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={() => navigate(price === "Custom" ? "/contact" : "/signup")}
        className={`w-full rounded-xl h-11 font-semibold ${
          popular
            ? "bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:opacity-90 text-white"
            : "bg-transparent border border-[#1a1a2e] hover:border-[#6366f1] text-white hover:bg-[#6366f1]/5"
        }`}
      >
        {price === "Custom" ? "Contact Sales" : price === "$0" ? "Get Started Free" : "Start Pro Trial"}
      </Button>
    </div>
  );
}

/* ─────────────────────────── Testimonial card ─────────────────────────── */
function TestimonialCard({ stars, text, name, role, initials, gradient }: {
  stars: number; text: string; name: string; role: string; initials: string; gradient: string;
}) {
  return (
    <div className="bg-[#0f0f14] border border-[#1a1a2e] rounded-xl p-8 hover:border-[#6366f1]/20 transition-all duration-500">
      <div className="text-yellow-500 text-sm tracking-widest mb-4">
        {"★".repeat(stars)}{"☆".repeat(5 - stars)}
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${gradient} flex items-center justify-center text-xs font-bold text-white`}>
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-slate-500">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Marquee ─────────────────────────── */
const marqueeItems = [
  "Social Trading", "AI Coach", "Competitions", "MT5 Integration", "RiskGuard",
  "Creator Economy", "Smart Journal", "Mobile First", "Enterprise Security",
  "Global Community", "Real-time Sync", "Learning Hub",
];

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function LandingPro() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans selection:bg-[#6366f1]/30">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "bg-[#050505]/95 shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-[#1a1a2e]" : "bg-[#050505]/70 border-b border-transparent"
      }`}>
        <a href="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#818cf8] to-[#7c3aed] bg-clip-text text-transparent">
          TradiFive
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Stories"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6366f1] rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Button variant="outline" onClick={() => navigate("/login")} className="rounded-xl border-[#1a1a2e] hover:border-[#6366f1] text-white hover:bg-[#6366f1]/5 h-9">
            Log In
          </Button>
          <Button onClick={() => navigate("/signup")} className="rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:opacity-90 text-white h-9">
            Get Started
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#4f46e5] blur-[100px] opacity-40 -top-[10%] -left-[5%] animate-pulse" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[#7c3aed] blur-[100px] opacity-30 -bottom-[10%] -right-[5%] animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-[#6366f1] blur-[80px] opacity-20 top-[40%] left-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "4s" }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now with AI Trading Coach
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
          >
            Trade Smarter.
            <br />
            Together.
            <br />
            <span className="bg-gradient-to-r from-[#818cf8] via-[#7c3aed] to-[#6366f1] bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradient-shift_4s_ease_infinite]">
              With AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The world's first social trading platform powered by AI. Connect with top traders, copy winning strategies, compete in live tournaments, and get real-time coaching from your personal AI assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mb-14"
          >
            <Button onClick={() => navigate("/signup")} size="lg" className="rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:opacity-90 text-white px-8 h-12 text-base font-semibold group">
              Start Trading Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={() => navigate("/features/discover")} variant="outline" size="lg" className="rounded-xl border-[#1a1a2e] hover:border-[#6366f1] text-white hover:bg-[#6366f1]/5 px-8 h-12 text-base">
              Explore Features
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-8 md:gap-12 justify-center"
          >
            {[
              { target: 50000, label: "Active Traders" },
              { target: 1200, label: "Live Channels" },
              { target: 98, label: "Win Rate" },
              { target: 24, label: "/7 AI Support" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold">
                  <AnimatedCounter target={s.target} />
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="py-8 border-y border-[#1a1a2e] bg-[#0a0a0f] overflow-hidden">
        <div className="flex animate-[marquee_30s_linear_infinite] w-max">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-8 text-sm font-semibold text-slate-600 whitespace-nowrap">
              <Zap className="w-4 h-4 opacity-50" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#6366f1]/8 border border-[#6366f1]/15 rounded-full text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-4">
                Platform Features
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Everything you need to trade like a pro
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                From AI-powered insights to social collaboration — TradiFive gives you the complete toolkit to analyze, execute, and grow your portfolio.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Bot className="w-5 h-5" />, title: "AI Trading Coach", desc: "Your personal AI assistant analyzes your trades, spots patterns, and gives real-time feedback to improve your strategy — powered by Google Gemini." },
              { icon: <TrendingUp className="w-5 h-5" />, title: "Live MT5 Integration", desc: "Connect your MetaTrader 5 account in seconds. Sync trades automatically, track P&L in real-time, and manage risk across all positions." },
              { icon: <Users className="w-5 h-5" />, title: "Social Trading Channels", desc: "Follow top traders, join live channels, share your analysis, and build your following. The first true social network built for traders." },
              { icon: <Trophy className="w-5 h-5" />, title: "Trading Competitions", desc: "Compete in weekly tournaments with real prizes. Climb leaderboards, earn badges, and prove your skills on a global stage." },
              { icon: <Shield className="w-5 h-5" />, title: "RiskGuard Protection", desc: "Automated risk controls that guard your account. Set drawdown limits, daily loss caps, and get instant alerts when thresholds are hit." },
              { icon: <BookOpen className="w-5 h-5" />, title: "Smart Trade Journal", desc: "Every trade is automatically logged with charts, notes, and performance metrics. Review, learn, and iterate with data-driven insights." },
              { icon: <BarChart3 className="w-5 h-5" />, title: "Creator Economy", desc: "Monetize your expertise. Sell signals, host mentorship sessions, build a subscription channel, and earn from your trading knowledge." },
              { icon: <Smartphone className="w-5 h-5" />, title: "Native Mobile Apps", desc: "Trade on the go with our iOS and Android apps. Push notifications for trades, alerts, and messages keep you connected anywhere." },
              { icon: <GraduationCap className="w-5 h-5" />, title: "Learning & Courses", desc: "Access curated courses, live webinars, and strategy libraries. Learn from verified mentors and level up your trading game." },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <FeatureCard {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#6366f1]/8 border border-[#6366f1]/15 rounded-full text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-4">
                Simple Setup
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Get started in 4 easy steps
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                No complicated setup. No hidden fees. Just connect, configure, and start trading smarter.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { n: "1", title: "Create Your Account", desc: "Sign up in under 60 seconds with email or social login. No credit card required for the free tier." },
              { n: "2", title: "Connect Your Broker", desc: "Link your MT5 account via MetaAPI securely. Your credentials are encrypted and never stored on our servers." },
              { n: "3", title: "Configure AI Coach", desc: "Set your risk profile, trading goals, and preferences. The AI adapts to your style and experience level." },
              { n: "4", title: "Trade & Compete", desc: "Start trading, join channels, enter competitions, and watch your AI coach guide you to better decisions." },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-xl font-extrabold text-white mx-auto mb-6 shadow-[0_8px_24px_rgba(79,70,229,0.3)]">
                    {s.n}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
            {/* Connector lines on md+ */}
            <div className="hidden md:block absolute top-7 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px">
              <div className="h-full bg-gradient-to-r from-[#6366f1]/40 via-[#7c3aed]/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Preview ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#6366f1]/8 border border-[#6366f1]/15 rounded-full text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-4">
                Live Dashboard
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Your command center for trading
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Real-time data, social feeds, AI insights, and risk controls — all in one beautifully designed dashboard.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="bg-[#0a0a0f] rounded-2xl border border-[#1a1a2e] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1a1a2e]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-4 text-xs font-medium text-slate-500">TradiFive Dashboard</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "AI Coach", sub: "3 new insights today", avatar: "AI", gradient: "from-[#6366f1] to-[#7c3aed]", chart: true },
                  { label: "Portfolio", sub: "+$2,847 this week", avatar: "P", gradient: "from-emerald-500 to-emerald-600", value: "$48,293", change: "↑ 6.3% vs last month", changeColor: "text-emerald-400" },
                  { label: "RiskGuard", sub: "All systems green", avatar: "R", gradient: "from-amber-500 to-amber-600", progress: 72, limit: "Daily drawdown: 2.8% / 5.0% limit" },
                  { label: "Channels", sub: "12 unread messages", avatar: "C", gradient: "from-pink-500 to-pink-600", avatars: true },
                ].map((card, i) => (
                  <div key={i} className="bg-[#0f0f14] border border-[#1a1a2e] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-[0.65rem] font-bold text-white`}>
                        {card.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{card.label}</h4>
                        <p className="text-xs text-slate-500">{card.sub}</p>
                      </div>
                    </div>
                    {card.value && (
                      <div className="text-2xl font-extrabold">{card.value}</div>
                    )}
                    {card.change && (
                      <div className={`text-xs font-semibold ${card.changeColor}`}>{card.change}</div>
                    )}
                    {card.progress !== undefined && (
                      <>
                        <div className="h-1.5 bg-emerald-500/20 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${card.progress}%` }} />
                        </div>
                        <div className="text-xs text-slate-500 mt-2">{card.limit}</div>
                      </>
                    )}
                    {card.chart && (
                      <div className="h-14 flex items-end gap-1 mt-2">
                        {[60, 80, 45, 90, 70, 55, 85, 40].map((h, j) => (
                          <div key={j} className={`flex-1 rounded-sm transition-opacity hover:opacity-100 opacity-60 ${j % 3 === 0 ? "bg-emerald-500" : j % 2 === 0 ? "bg-[#7c3aed]" : "bg-[#6366f1]"}`} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    )}
                    {card.avatars && (
                      <div className="flex -space-x-2 mt-3">
                        {["A", "B", "C"].map((a, j) => (
                          <div key={j} className={`w-7 h-7 rounded-full border-2 border-[#0f0f14] flex items-center justify-center text-[0.6rem] font-bold text-white ${j === 0 ? "bg-gradient-to-br from-[#6366f1] to-[#7c3aed]" : j === 1 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-amber-500 to-amber-600"}`}>
                            {a}
                          </div>
                        ))}
                        <div className="w-7 h-7 rounded-full border-2 border-[#0f0f14] bg-[#1a1a2e] flex items-center justify-center text-[0.6rem] font-bold text-slate-500">+9</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#6366f1]/8 border border-[#6366f1]/15 rounded-full text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-4">
                Pricing
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Start free and scale as you grow. No hidden fees, no surprise charges.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <PricingCard
                tier="Starter"
                price="$0"
                description="Perfect for getting started and exploring the platform."
                features={[
                  "1 MT5 Account Connection",
                  "Basic AI Coach Access",
                  "3 Trading Channels",
                  "Community Access",
                  "Standard RiskGuard",
                  "Trade Journal",
                ]}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <PricingCard
                tier="Pro"
                price="$29"
                description="For serious traders who want the full power of AI + social."
                features={[
                  "Unlimited MT5 Accounts",
                  "Full AI Coach (Unlimited)",
                  "Unlimited Channels",
                  "Competition Access",
                  "Advanced RiskGuard",
                  "Smart Journal + Analytics",
                  "Creator Tools",
                  "Priority Support",
                ]}
                popular
              />
            </Reveal>
            <Reveal delay={0.2}>
              <PricingCard
                tier="Enterprise"
                price="Custom"
                description="For prop firms, brokerages, and trading communities."
                features={[
                  "White-label Solution",
                  "Custom AI Training",
                  "Dedicated Infrastructure",
                  "Admin Dashboard",
                  "API Access",
                  "SSO & RBAC",
                  "24/7 Dedicated Support",
                  "Custom Integrations",
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#6366f1]/8 border border-[#6366f1]/15 rounded-full text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-4">
                Trader Stories
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Loved by traders worldwide
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Join thousands of traders who have transformed their trading with TradiFive.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <TestimonialCard
                stars={5}
                text="The AI coach caught a risk pattern I had been ignoring for months. My win rate improved from 42% to 67% in just 8 weeks. Game changer."
                name="Marcus K."
                role="Forex Trader, London"
                initials="MK"
                gradient="from-[#6366f1] to-[#7c3aed]"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <TestimonialCard
                stars={5}
                text="I went from trading alone to building a channel with 2,400 followers. Now I monetize my signals and mentor new traders. The creator economy is real."
                name="Sarah L."
                role="Day Trader & Creator, Singapore"
                initials="SL"
                gradient="from-pink-500 to-pink-600"
              />
            </Reveal>
            <Reveal delay={0.2}>
              <TestimonialCard
                stars={5}
                text="RiskGuard saved my account during the NFP volatility last month. Auto-closed my positions at my drawdown limit. Best safety net I've ever used."
                name="David R."
                role="Prop Trader, New York"
                initials="DR"
                gradient="from-emerald-500 to-emerald-600"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#4f46e5] blur-[100px] opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Ready to trade like never before?
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Join 50,000+ traders who are already using AI and community to outperform the market. Start free today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => navigate("/signup")} size="lg" className="rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:opacity-90 text-white px-8 h-12 text-base font-semibold group">
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => navigate("/download")} variant="outline" size="lg" className="rounded-xl border-[#1a1a2e] hover:border-[#6366f1] text-white hover:bg-[#6366f1]/5 px-8 h-12 text-base">
                <Download className="w-4 h-4 mr-2" />
                Download App
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a1a2e] bg-[#0a0a0f] pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-[#818cf8] to-[#7c3aed] bg-clip-text text-transparent mb-4">
              TradiFive
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The world's first AI-powered social trading platform. Trade smarter, together, with intelligent coaching.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <div className="space-y-2">
              {["Features", "Pricing", "Mobile App", "AI Coach", "Competitions"].map((item) => (
                <a key={item} href={`/${item.toLowerCase().replace(/ /g, "-")}`} className="block text-sm text-slate-500 hover:text-[#818cf8] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <div className="space-y-2">
              {["Community", "Contact", "Channels", "Mentorship"].map((item) => (
                <a key={item} href={`/${item.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-[#818cf8] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
            <div className="space-y-2">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Risk Disclosure", href: "/risk-disclosure" },
                { label: "AML & KYC Policy", href: "/aml-kyc-policy" },
                { label: "Refund Policy", href: "/refund-policy" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="block text-sm text-slate-500 hover:text-[#818cf8] transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-[#1a1a2e] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <div>© 2026 TradiFive. All rights reserved.</div>
          <div className="flex gap-6">
            {["X", "LinkedIn", "Instagram", "YouTube"].map((s) => (
              <a key={s} href="#" className="hover:text-[#818cf8] transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Tailwind custom animation keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
