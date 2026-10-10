import React, { useEffect } from "react";
import LegalLayout from "@/components/LegalLayout";

export default function CookiePolicyPublic() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      activeTab="cookie"
      title="Cookie Policy"
      lastUpdated="Last Updated: October 2025"
    >
      {/* Intro section */}
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          This Cookie Policy explains how Tradifive ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website at tradifive.in, or use our desktop and mobile applications (collectively, the "Services").
        </p>
        <p className="text-[15px] leading-relaxed text-zinc-400">
          It explains what these technologies are and why we use them, as well as your rights to control our use of them. In some cases, we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
        </p>
      </div>

      {/* Section 1 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 01</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">What Are Cookies?</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Cookies are small files stored in your browser to remember your preferences and keep you logged in safely.
        </div>

        <p className="text-sm text-zinc-400">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
        </p>
        <p className="text-sm text-zinc-400">
          Cookies set by the website owner (in this case, Tradifive) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., interactive content, analytics, and payment processing).
        </p>
      </div>

      {/* Section 2 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 02</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Types of Cookies We Use</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> We use essential cookies (login & security), performance cookies (speed and diagnostics), and security cookies (protecting data vaults).
        </div>

        <p className="text-sm text-zinc-400">
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Services to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience.
        </p>

        <div className="space-y-4 mt-6">
          <div className="p-4 rounded-xl bg-white/[0.01] border border-zinc-900">
            <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-1">Strictly Necessary Cookies</h3>
            <p className="text-[13px] leading-relaxed text-zinc-550">
              Required to access active account areas, confirm verification states, prevent spam, and maintain billing sessions during checkouts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.01] border border-zinc-900">
            <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-1">Performance & Telemetry</h3>
            <p className="text-[13px] leading-relaxed text-zinc-550">
              Collect aggregate speed metrics, page load speeds, and API latency measurements. These do not link directly to identifying accounts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.01] border border-zinc-900">
            <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-1">Security & Vault Caching</h3>
            <p className="text-[13px] leading-relaxed text-zinc-550">
              Protects linked API keys, verifies login tokens, and secures cross-origin transactions from injection attempts.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 03</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Broker Integration State</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> We do not store passwords in standard cookie variables. They are kept in encrypted secure session variables.
        </div>

        <p className="text-sm text-zinc-400">
          Our platform does not cache your raw password credentials in standard cookies. Instead, encrypted authentication tokens are stored securely in local session states, protected by security flags (HTTP-only when transmitted). Temporary browser storage is used to cache your dashboard analytics (e.g. drawdown calculations, historical win rates) to minimize latency and avoid pulling redundant data from your broker on every single page load.
        </p>
      </div>

      {/* Section 4 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 04</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Managing Cookies</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> You can block or delete cookies in your browser settings, though it might restrict your ability to log in.
        </div>

        <p className="text-sm text-zinc-400">
          You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website or application (such as logging in or loading dashboards) may be restricted.
        </p>
      </div>
    </LegalLayout>
  );
}
