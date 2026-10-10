import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, FileText, RotateCcw, AlertTriangle, Cookie, Fingerprint, ChevronRight, Mail, HelpCircle } from "lucide-react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export type LegalTabId = "privacy" | "terms" | "refund" | "risk" | "cookie" | "aml-kyc";

interface LegalLayoutProps {
  activeTab: LegalTabId;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LEGAL_PAGES = [
  { id: "privacy", label: "Privacy Policy", path: "/privacy-policy", icon: Shield, index: "01" },
  { id: "terms", label: "Terms of Service", path: "/terms-of-service", icon: FileText, index: "02" },
  { id: "refund", label: "Refund Policy", path: "/refund-policy", icon: RotateCcw, index: "03" },
  { id: "risk", label: "Risk Disclosure", path: "/risk-disclosure", icon: AlertTriangle, index: "04" },
  { id: "cookie", label: "Cookie Policy", path: "/cookie-policy", icon: Cookie, index: "05" },
  { id: "aml-kyc", label: "AML & KYC Policy", path: "/aml-kyc-policy", icon: Fingerprint, index: "06" },
] as const;

export default function LegalLayout({ activeTab, title, lastUpdated, children }: LegalLayoutProps) {
  const activePage = LEGAL_PAGES.find((p) => p.id === activeTab) || LEGAL_PAGES[0];

  return (
    <div className="min-h-screen bg-[#070708] text-[#F3F4F6] overflow-x-hidden font-inter selection:bg-indigo-500/20 selection:text-indigo-200">
      <PublicNavbar />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293707_1px,transparent_1px),linear-gradient(to_bottom,#1f293707_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
      
      {/* Subtle light leak at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <main className="pt-32 pb-28 px-6 sm:px-10 md:px-16 relative z-10 max-w-7xl mx-auto min-h-[90vh]">
        
        {/* Breadcrumbs / Upper metadata */}
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-6">
          <Link to="/" className="hover:text-zinc-300 transition-colors">TradiFive</Link>
          <span>/</span>
          <span className="text-zinc-400">Legal Center</span>
          <span>/</span>
          <span className="text-indigo-400">{activePage.index}</span>
        </div>

        {/* Header Block */}
        <div className="border-b border-zinc-800/80 pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5.5xl font-extrabold text-white tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-4 uppercase tracking-wider">
              {lastUpdated}
            </p>
          </div>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-300 hover:text-white"
          >
            Exit Directory
            <ChevronRight size={14} className="text-zinc-500" />
          </Link>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 z-30 space-y-6">
            
            {/* Mobile horizontal scrolling pills */}
            <div className="flex lg:hidden overflow-x-auto pb-4 gap-2 -mx-6 px-6 scrollbar-none border-b border-zinc-900">
              {LEGAL_PAGES.map((page) => {
                const isCurrent = page.id === activeTab;
                return (
                  <Link
                    key={page.id}
                    to={page.path}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all ${
                      isCurrent
                        ? "bg-zinc-900 border-zinc-750 text-indigo-400 font-extrabold"
                        : "bg-transparent border-transparent text-zinc-450 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60">{page.index}</span>
                    {page.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Vertical Menu Card */}
            <div className="hidden lg:block bg-[#0B0B0C] border border-zinc-900 rounded-xl p-5 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between px-2 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Legal Index</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" title="System compliance validated" />
              </div>
              
              <div className="space-y-1">
                {LEGAL_PAGES.map((page) => {
                  const PageIcon = page.icon;
                  const isCurrent = page.id === activeTab;

                  return (
                    <Link
                      key={page.id}
                      to={page.path}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold transition-all relative ${
                        isCurrent
                          ? "bg-[#141416] border border-zinc-800 text-white font-bold"
                          : "bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#0E0E0F]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] ${isCurrent ? "text-indigo-400" : "text-zinc-650"}`}>
                          {page.index}
                        </span>
                        <span>{page.label}</span>
                      </div>
                      
                      {isCurrent ? (
                        <span className="w-1 h-3 rounded-full bg-indigo-500" />
                      ) : (
                        <ChevronRight size={13} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Premium Compliance Sidecard */}
            <div className="hidden lg:block bg-gradient-to-b from-[#0B0B0C] to-[#080809] border border-zinc-900 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/[0.01] rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-450 shrink-0">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">Compliance Desk</h4>
                  <p className="text-[11.5px] leading-relaxed text-zinc-500 mt-1">
                    Direct inquiries regarding our operations, audits, or legal framework.
                  </p>
                </div>
              </div>
              
              <a
                href="mailto:compliance@tradifive.in"
                className="w-full py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Mail size={13} />
                compliance@tradifive.in
              </a>
            </div>
            
          </div>

          {/* RIGHT DOCUMENT CARD */}
          <div className="lg:col-span-8">
            <div className="bg-[#0B0B0C] border border-zinc-900 rounded-xl p-6 sm:p-10 md:p-14 shadow-2xl relative">
              {/* Top border line indicator */}
              <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
              
              <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed text-zinc-300 space-y-9">
                {children}
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
