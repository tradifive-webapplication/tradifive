import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Github, Mail, ArrowUpRight, Heart } from "lucide-react";

const COLS = [
  {
    title: "Platform",
    links: [
      { label: "Social Feed", href: "/features/pulse-feeds" },
      { label: "Risk Guard", href: "/features/risk-guard" },
      { label: "Auto-Journal", href: "/features/smart-journal" },
      { label: "Multi-Broker Bridge", href: "/features/smart-journal" },
      { label: "Discover", href: "/features/discover" },
      { label: "Channels", href: "/features/channels" },
    ],
  },
  {
    title: "Coming Soon",
    links: [
      { label: "AI Auto-Trading", href: "#" },
      { label: "Custom Strategies", href: "#" },
      { label: "Options Trading", href: "#" },
      { label: "Prop Firm Integrations", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Pulse Feeds", href: "/features/pulse-feeds" },
      { label: "Signal Channels", href: "/features/channels" },
      { label: "Competitions", href: "/features/competitions" },
      { label: "Community Hub", href: "/features/community-hub" },
    ],
  },
  {
    title: "Legal Directory",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cancel & Refund Policy", href: "/refund-policy" },
      { label: "Risk Disclosure", href: "/risk-disclosure" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "AML & KYC Policy", href: "/aml-kyc-policy" },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export default function PublicFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#020202] border-t border-white/[0.04] overflow-hidden font-inter select-none z-20">

      {/* Premium Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-purple-500/30" />

      {/* Ambient glows behind footer elements */}
      <div className="absolute top-[-100px] left-[15%] w-[450px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[10%] w-[350px] h-[250px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-12 pt-16 pb-8 relative z-10">

        {/* Main Grid: Info block + Links block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/[0.04]">

          {/* Logo & Tagline area */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
              <img src="/favicon.png" className="h-9 w-auto group-hover:scale-105 transition-transform duration-300" alt="Icon" />
              <img src="/Dark mode logo with white.png" className="h-7 w-auto" alt="TradiFive" />
            </div>

            <p className="text-[13px] leading-relaxed text-slate-400 max-w-[280px]">
              The next-generation social trading platform connecting verified traders globally. Scale, verify, and trade better together.
            </p>

            {/* Newsletter Subscription */}
            <div className="w-full max-w-[280px] mt-2 mb-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Join the waitlist</p>
              <div className="flex items-center relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2.5 pl-4 pr-24 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                />
                <button className="absolute right-1 top-1 bottom-1 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold rounded-full transition-colors">
                  Join
                </button>
              </div>
            </div>

            {/* Direct contact link */}
            <a
              href="mailto:hello@tradifive.com"
              className="inline-flex items-center gap-2 text-[13px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200"
            >
              <Mail size={14} />
              hello@tradifive.com
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
                    className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-400 flex items-center justify-center transition-all duration-200"
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
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className="text-[13px] font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200 group"
                        >
                          {link.label}
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

        {/* Footer bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-slate-500 text-center md:text-left font-medium">
            &copy; {new Date().getFullYear()} TradiFive. Built for verified traders. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span>Made with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>by the tech team at</span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-black">
              TradiFive
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
