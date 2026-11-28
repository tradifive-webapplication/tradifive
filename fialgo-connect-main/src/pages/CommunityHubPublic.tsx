import React, { useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  MessageSquare,
  Users,
  Activity,
  Rss,
  ChevronRight,
  ArrowRight,
  Radio,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicFAQ } from "@/components/PublicFAQ";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CommunityHubPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login", { state: { mode: "signup" } });
  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
  }, []);

  const features = [
    {
      icon: Activity,
      badge: "Social Canvas",
      badgeStyle: "bg-blue-50 text-[#2563EB] border-blue-200",
      tagline: "Trade in public.",
      taglineMuted: "Verify every milestone.",
      desc: "Your live social trading canvas. Share annotated chart setups, publish broker-authenticated P&L recaps, and track disciplined desks globally with zero fake screenshot clutter.",
      points: [
        "Broker-verified P&L sharing via live MT5 sync",
        "Stories, trade cards, and market polls",
        "Follow audited traders and track their discipline score",
        "Structured setup attribution on every post",
      ],
      mockup: (
        <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-3 shadow-sm">
          <img
            src="/community-app-mockup.png"
            alt="Community Feed Screenshot"
            className="w-full rounded-xl border border-slate-200/70"
          />
        </div>
      ),
    },
    {
      icon: Rss,
      badge: "Signal Channels",
      badgeStyle: "bg-violet-50 text-violet-700 border-violet-200",
      tagline: "Verified channels.",
      taglineMuted: "Built-in track records.",
      desc: "Follow structured broadcast rooms hosted by vetted analysts. Every signal carries entry/stop levels and verified performance history inside one clean stream.",
      points: [
        "Live signal alerts pushed straight to your workspace",
        "Verified channel win-rate and drawdown attribution",
        "Public channels or mentor-gated private rooms",
        "Complete searchable signal history",
      ],
      mockup: (
        <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-5 space-y-3">
          {[
            { name: "AlphaFX Desk", sub: "2.4k members · 78% win", signal: "LONG XAU/USD @ 2,642.50" },
            { name: "Quant Macro", sub: "1.1k members · 2.4R avg", signal: "LONG EUR/USD @ 1.0840" },
          ].map((ch) => (
            <div
              key={ch.name}
              className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[14px] font-bold text-slate-900">{ch.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{ch.sub}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
                  <Radio size={14} />
                </div>
              </div>
              <div className="rounded-xl bg-violet-50/75 border border-violet-200/80 px-3 py-2 text-[12px] font-bold font-mono text-violet-700">
                {ch.signal}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: MessageSquare,
      badge: "Direct Messages",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      tagline: "Direct mentor access.",
      taglineMuted: "Zero noise.",
      desc: "Communicate 1-on-1 with mentors, trading partners, or fellow competitors inside a fast workspace inbox without jumping between external chat apps.",
      points: [
        "Real-time direct inbox built alongside your charts",
        "Attach trade cards & annotated chart snapshots",
        "Read receipts and clean privacy controls",
        "Direct mentor review threads",
      ],
      mockup: (
        <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-5 space-y-2.5">
          {[
            { from: "You", text: "What's your bias on XAU/USD heading into NY Open?", align: "right" },
            { from: "Marcus V.", text: "Watching 2,640 demand. If London low holds I'm sizing 0.75% with 2.2R target.", align: "left" },
            { from: "You", text: "Aligned — Risk Guard limit locked in for the session.", align: "right" },
          ].map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.align === "right" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[12.5px] leading-relaxed border ${
                  msg.align === "right"
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-slate-700 border-slate-200 shadow-2xs"
                }`}
              >
                {msg.align === "left" && (
                  <div className="text-[10.5px] font-bold text-emerald-600 mb-0.5">
                    {msg.from}
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const stats = [
    { n: "12,400+", l: "Active Traders" },
    { n: "3.2M", l: "Posts & Signals" },
    { n: "94%", l: "Rule Adherence" },
    { n: "47", l: "Countries Worldwide" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar
        alwaysLight
        onSignIn={handleSignIn}
        onSignUp={handleStart}
        onDownloadClick={() => navigate("/download")}
      />

      <main>
        {/* HERO */}
        <section className="pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="lg:col-span-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider mb-6">
                <Users size={13} />
                <span>Social Trading Network</span>
              </div>
              <h1
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[36px] sm:text-[52px] lg:text-[58px] tracking-[-0.035em] leading-[1.06] text-slate-900 mb-5"
              >
                <span className="font-bold block">The Community</span>
                <span className="font-extralight text-slate-500">built on </span>
                <span className="font-semibold text-[#2563EB]">verified edge.</span>
              </h1>
              <p className="text-[15.5px] sm:text-[17px] font-light text-slate-500 leading-relaxed max-w-[500px] mb-8">
                Stop trading in isolation. Follow verified traders worldwide, join broadcast signal rooms, and discuss live market setups in one noise-free hub.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStart}
                  className="tactile-blue-pill h-11 px-7 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Join the Network</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/features/discover")}
                  className="h-11 px-6 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[14px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Explore Discover
                </button>
              </div>
            </motion.div>

            {/* Hero Live Feed Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="lg:col-span-6"
            >
              <div className="rounded-[24px] bg-[#F8FAFC] border border-slate-200/90 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.12)] p-5 sm:p-6 space-y-4">
                <div className="rounded-2xl bg-white border border-slate-200/90 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Pulse Feed
                    </span>
                    <span className="text-[10.5px] text-slate-400">Verified MT5 Sync</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { init: "MV", name: "Marcus V.", sub: "LONG XAU/USD · +$1,240 ✓", badge: "84% win" },
                      { init: "ER", name: "Elena R.", sub: "EUR/USD NY Open Liquidity Setup", badge: "2.3R avg" },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between pt-2 border-t border-slate-100 first:border-none first:pt-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold flex items-center justify-center">
                            {row.init}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-slate-900">{row.name}</div>
                            <div className="text-[11.5px] text-slate-500">{row.sub}</div>
                          </div>
                        </div>
                        <span className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-violet-200/80 p-4">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-violet-600 mb-1.5">
                    Signal Channel Broadcast · AlphaFX Desk
                  </div>
                  <div className="text-[13.5px] font-bold font-mono text-slate-900">
                    LONG GBP/USD @ 1.2840 · TP 1.2920
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-1">
                    78% historical win rate · 2,400+ followers
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="pb-16 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl bg-white border border-slate-200/90 p-6 text-center shadow-2xs"
              >
                <div className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight tabular-nums">
                  {s.n}
                </div>
                <div className="text-[12.5px] font-medium text-slate-500 mt-1.5">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DESKTOP PLATFORM SHOWCASE */}
        <section className="py-12 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-[660px] mx-auto mb-10">
              <p className="text-[12.5px] font-semibold text-[#2563EB] uppercase tracking-wider mb-2">
                Unified Feed
              </p>
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[40px] font-bold tracking-[-0.03em] leading-[1.12] text-slate-900"
              >
                The trading network{" "}
                <span className="font-extralight text-slate-500">
                  built for serious execution.
                </span>
              </h2>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-200/95 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.12)] overflow-hidden p-3 sm:p-4">
              <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  TradiFive Terminal · Community Network
                </span>
                <span className="w-8" />
              </div>
              <div className="rounded-2xl overflow-hidden mt-3 bg-slate-900 border border-slate-200/80">
                <img
                  src="/homedesktop.png"
                  alt="Community Hub Platform"
                  className="w-full h-auto block object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3-IN-1 SOCIAL SUITE */}
        <section className="py-16 sm:py-24 px-4 sm:px-7">
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center mb-16">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[28px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900"
              >
                The 3-in-1 <span className="font-extralight text-slate-500">Social Suite.</span>
              </h2>
            </div>

            <div className="space-y-16 sm:space-y-24">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.badge}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                >
                  <div className={`lg:col-span-6 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-5 ${feat.badgeStyle}`}
                    >
                      {feat.badge}
                    </span>
                    <h3
                      style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                      className="text-[28px] sm:text-[38px] font-bold tracking-[-0.03em] leading-[1.1] text-slate-900 mb-4"
                    >
                      {feat.tagline}{" "}
                      <span className="block font-extralight text-slate-500">
                        {feat.taglineMuted}
                      </span>
                    </h3>
                    <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
                      {feat.desc}
                    </p>
                    <ul className="space-y-2.5">
                      {feat.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex items-center gap-2.5 text-[13.5px] font-medium text-slate-700"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
                            <ChevronRight size={11} />
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`lg:col-span-6 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    {feat.mockup}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-7 bg-[#F8FAFC] border-y border-slate-200/70 text-center">
          <div className="max-w-[600px] mx-auto">
            <h2
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[30px] sm:text-[42px] font-bold tracking-[-0.03em] text-slate-900 mb-4"
            >
              Ready to join <span className="font-extralight text-slate-500">the network?</span>
            </h2>
            <p className="text-[15px] text-slate-500 mb-8">
              Free to start. No credit card required.
            </p>
            <button
              onClick={handleStart}
              className="tactile-blue-pill h-11 px-8 rounded-full text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Join TradiFive Free</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <PublicFAQ lightMode />
      </main>

      <PublicFooter lightMode />
    </div>
  );
}
