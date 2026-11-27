import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Github, Mail, ArrowUpRight, Heart } from "lucide-react";
import { toast } from "sonner";

const COLS = [
  {
    title: "Platform",
    links: [
      { label: "FiAlgo", href: "/features/auto-trade", isNew: true },
      { label: "Tradifive AI Assistant", href: "/features/tradifive-ai" },
      { label: "Risk Guard Protection", href: "/features/risk-guard" },
      { label: "Smart Auto-Journal", href: "/features/smart-journal" },
      { label: "Multi-Broker Bridge", href: "/features/smart-journal" },
      { label: "Desktop & Mobile App", href: "/download" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Pulse Social Feeds", href: "/features/pulse-feeds" },
      { label: "Creator Hub", href: "/features/channels" },
      { label: "Trading Competitions", href: "/features/competitions" },
      { label: "Community Hub", href: "/features/community-hub" },
      { label: "Discover Top Traders", href: "/features/discover" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "ROI & Profit Simulator", href: "/features/auto-trade" },
      { label: "Partner & IB Program", href: "/auto-trade/setup" },
      { label: "Help & Support", href: "/contact" },
      { label: "Download App (Mac & PC)", href: "/download" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cancel & Refund Policy", href: "/refund-policy" },
      { label: "Risk Disclosure", href: "/risk-disclosure" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "AML & KYC Compliance", href: "/aml-kyc-policy" },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/tradifive" },
  { icon: Github, label: "GitHub", href: "https://github.com/tradifive" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/tradifive" },
];

export default function PublicFooter({ lightMode = false }: { lightMode?: boolean }) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to updates!");
    setNewsletterEmail("");
  };

  return (
    <footer
      className={`relative overflow-hidden font-inter select-none z-20 ${
        lightMode
          ? "bg-[#F8FAFC] border-t border-slate-200/90 text-slate-900"
          : "bg-[#020202] border-t border-white/[0.04]"
      }`}
    >
      {!lightMode && (
        <>
          {/* Premium Top Border Gradient */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-purple-500/30" />

          {/* Ambient glows behind footer elements */}
          <div className="absolute top-[-100px] left-[15%] w-[450px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-[10%] w-[350px] h-[250px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Cyber Grid Texture Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-12 pt-16 pb-8 relative z-10">

        {/* Main Grid: Info block + Links block */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b ${
            lightMode ? "border-slate-200/80" : "border-white/[0.04]"
          }`}
        >

          {/* Logo & Tagline area */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
              {lightMode ? (
                <img src="/Tradifive_logo1.png" className="h-7 w-auto" alt="TradiFive" />
              ) : (
                <>
                  <img src="/favicon.png" className="h-9 w-auto group-hover:scale-105 transition-transform duration-300" alt="Icon" />
                  <img src="/Dark mode logo with white.png" className="h-7 w-auto" alt="TradiFive" />
                </>
              )}
            </div>

            <p className={`text-[13px] leading-relaxed max-w-[280px] ${lightMode ? "text-slate-600" : "text-slate-400"}`}>
              The next-generation social trading platform connecting verified traders globally. Scale, verify, and trade better together.
            </p>

            {/* Newsletter Subscription */}
            <div className="w-full max-w-[280px] mt-2 mb-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Stay Updated</p>
              <form onSubmit={handleSubscribe} className="flex items-center relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full rounded-full py-2.5 pl-4 pr-24 text-[13px] focus:outline-none transition-all ${
                    lightMode
                      ? "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"
                      : "bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-white/[0.05]"
                  }`}
                />
                <button
                  type="submit"
                  className="tactile-blue-pill absolute right-1 top-1 bottom-1 px-4 text-[12px] font-bold rounded-full cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Direct contact link */}
            <a
              href="mailto:hello@tradifive.in"
              className={`inline-flex items-center gap-2 text-[13px] font-semibold transition-colors duration-200 ${
                lightMode ? "text-blue-600 hover:text-blue-700" : "text-indigo-400 hover:text-indigo-300"
              }`}
            >
              <Mail size={14} />
              hello@tradifive.in
            </a>

            {/* Social Icons list */}
            <div className="flex items-center gap-3 mt-1">
              {SOCIALS.map((soc) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={soc.label}
                    href={soc.href}
                    title={soc.label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                      lightMode
                        ? "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                        : "bg-white/[0.02] border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-400"
                    }`}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COLS.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${lightMode ? "text-slate-900" : "text-slate-500"}`}>
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className={`text-[13px] font-medium hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 group ${
                            lightMode ? "text-slate-600 hover:text-slate-950" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>{link.label}</span>
                          {"isNew" in link && link.isNew && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase border ${
                                lightMode
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              NEW
                            </span>
                          )}
                          {link.href.startsWith("/features") && (
                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className={`text-[13px] font-medium hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200 ${
                            lightMode ? "text-slate-600 hover:text-slate-950" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Big Tech Trust Badges & System Status Row */}
        <div
          className={`pt-8 pb-6 flex flex-wrap items-center justify-between gap-4 border-b ${
            lightMode ? "border-slate-200/80" : "border-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-4 flex-wrap">
            {/* Live Operational Status */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                lightMode
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${lightMode ? "bg-emerald-500" : "bg-emerald-400"}`}></span>
              All Systems Operational
            </div>

            {/* Security Badges */}
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
            <span className={`text-xs font-medium ${lightMode ? "text-slate-600" : "text-slate-400"}`}>Bank-Grade 256-Bit SSL</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
            <span className={`text-xs font-medium ${lightMode ? "text-slate-600" : "text-slate-400"}`}>MetaTrader 5 Bridge Certified</span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Global Execution Infrastructure (NY4 & LD4)
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="pt-6 flex flex-col items-center md:items-start gap-4">
          <p className="text-[11px] text-slate-500 leading-relaxed text-center md:text-left max-w-5xl">
            <strong>Regulatory & Risk Disclosure:</strong> Trading forex, commodities, and derivatives carries a high level of risk and may not be suitable for all investors. Leverage can work both to your advantage and disadvantage. TradiFive is a financial technology software provider offering analytics, risk management, and algorithmic bridge execution tools. We do not provide personalized financial or investment advice.
          </p>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
            <p className="text-[12px] text-slate-500 text-center md:text-left font-medium">
              &copy; {new Date().getFullYear()} TradiFive Technologies Inc. All rights reserved.
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span>Crafted for serious traders worldwide</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
