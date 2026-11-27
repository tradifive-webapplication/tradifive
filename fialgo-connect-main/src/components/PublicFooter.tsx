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

export default function PublicFooter() {
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
    <footer className="relative bg-[#07090F] border-t border-white/[0.08] overflow-hidden font-inter select-none z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-12 pt-16 pb-8 relative z-10">

        {/* Main Grid: Info block + Links block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/[0.06]">

          {/* Logo & Tagline area */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
              <img src="/favicon.png" className="h-9 w-auto transition-transform duration-200" alt="Icon" />
              <img src="/Dark mode logo with white.png" className="h-7 w-auto" alt="TradiFive" />
            </div>

            <p className="text-[13px] leading-relaxed text-slate-400 max-w-[280px]">
              Institutional-grade trade journaling, autonomous risk protection, and verified trader communities.
            </p>

            {/* Newsletter Subscription */}
            <div className="w-full max-w-[280px] mt-2 mb-2">
              <p className="text-[12px] font-medium text-slate-400 mb-3">Stay updated</p>
              <form onSubmit={handleSubscribe} className="flex items-center relative">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-full py-2.5 pl-4 pr-24 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-white/25 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 text-[12px] font-semibold rounded-full bg-white text-[#090d16] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Direct contact link */}
            <a
              href="mailto:hello@tradifive.in"
              className="inline-flex items-center gap-2 text-[13px] text-slate-300 hover:text-white font-medium transition-colors duration-200"
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
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:text-white text-slate-400 flex items-center justify-center transition-colors duration-150"
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
                <h3 className="text-[12px] font-semibold text-slate-300 leading-none mb-1">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className="text-[13px] font-normal text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors duration-150 group"
                        >
                          <span>{link.label}</span>
                          {link.href.startsWith("/features") && (
                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[13px] font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
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
        <div className="pt-8 pb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </div>

            {/* Security Badges */}
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 font-medium">Bank-Grade 256-Bit SSL</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 font-medium">MetaTrader 5 Bridge Certified</span>
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
