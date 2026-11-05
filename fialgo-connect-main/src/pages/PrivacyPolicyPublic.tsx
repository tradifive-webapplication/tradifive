import React, { useEffect } from "react";
import LegalLayout from "@/components/LegalLayout";

export default function PrivacyPolicyPublic() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      activeTab="privacy"
      title="Privacy Policy"
      lastUpdated="Last Updated: October 2025"
    >
      {/* Intro section */}
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          Your privacy is critically important to us. Tradifive Private Limited ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact our compliance desk.
        </p>
        <p className="text-[15px] leading-relaxed text-zinc-400">
          Because Tradifive operates strictly as a technology and software provider and not as a broker-dealer, we do not require or process AML/KYC documents for the purpose of trading deposits. We take your privacy very seriously and only collect what is strictly necessary to run our software analytics.
        </p>
      </div>

      {/* Section 1 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 01</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Information We Collect</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> We collect details needed to create your account, handle payments securely, and sync read-only trading statistics from your broker. We do not look at passwords or place executions.
        </div>

        <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider mt-4">Personal Information You Disclose to Us</h3>
        <p className="text-sm text-zinc-400">
          We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, or when you contact us directly.
        </p>
        
        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Account Data:</strong> Legal names, email addresses, usernames, and communication logs required to create a software profile.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Financial & Payment Data:</strong> All software subscription payments are processed through Stripe. We do not store credit card credentials on our servers; only secure tokens provided by our processor are used.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Brokerage Integration Data:</strong> When you connect your third-party broker account (via MetaTrader or FIX), we store read-only API hashes to sync ledger metrics purely for dashboard analytics.</span>
          </li>
        </ul>

        <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider mt-6">Information Automatically Collected</h3>
        <p className="text-sm text-zinc-400">
          We automatically collect certain information when you navigate the platform (such as IP addresses, browser specs, device details, and localization headers) to maintain session stability.
        </p>
        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Trading Telemetry:</strong> To populate your dashboard metrics and train the AI Coach, we automatically fetch and analyze trade history, execution times, win/loss spreads, and drawdown ratios.</span>
          </li>
        </ul>
      </div>

      {/* Section 2 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 02</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">How We Use Your Information</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Your data is used exclusively to generate performance telemetry, manage competition standings, and run security checks to prevent abuse.
        </div>

        <p className="text-sm text-zinc-400">
          We process your information based on legitimate business interests, the fulfillment of contract terms, and compliance requirements:
        </p>
        
        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Dashboard Rendering:</strong> Populating tables, win-ratio charts, and risk levels in real-time.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>AI Coaching Modules:</strong> Aggregating execution habits to train your local, private coaching instance.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Anti-Abuse Verification:</strong> Detecting duplicate profiles, multi-account abuse, or geo-restriction bypass attempts.</span>
          </li>
        </ul>
      </div>

      {/* Section 3 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 03</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Information Sharing Policies</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> We do not sell data. Period. We only share details with trusted infrastructure providers (like Stripe or Supabase) required to run the platform.
        </div>

        <p className="text-sm text-zinc-400">
          We only share information under strict contract limits or legal requests:
        </p>
        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Service Partners:</strong> Hosting providers, database servers, and payout processors bound by secure privacy controls.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Legal Demands:</strong> If audited or ordered by government entities to satisfy regulatory or compliance reporting.</span>
          </li>
        </ul>
        <div className="mt-6 p-4 rounded-lg bg-emerald-500/[0.02] border border-emerald-500/10 text-emerald-400 font-bold text-xs tracking-wider text-center uppercase">
          Commercial monetization or resale of your private trading data to prop desks or brokerages is strictly prohibited.
        </div>
      </div>

      {/* Section 4 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 04</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Data Security Protocols</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Credentials are encrypted at-rest using AES-256 standard and shielded behind database proxy configurations.
        </div>

        <p className="text-sm text-zinc-400">
          All linked passwords and integration parameters are encrypted at rest with military-grade AES-256 keys. Our core databases do not store plain-text access tokens; all network calls go through isolated gateway layers that enforce restricted operations.
        </p>
      </div>

      {/* Section 5 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 05</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Your Rights & Erasure (DPDP Act Compliance)</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> You have the right to request deletion. You can erase your account and clean all cached statistics directly from your dashboard.
        </div>

        <p className="text-sm text-zinc-400">
          Under the Digital Personal Data Protection Act 2023 (India), GDPR, CCPA, and other regional frameworks, you hold the right to retrieve or purge your personal data. By accessing your Settings panel inside the user application, you can initiate a complete profile wipe. Upon request, all trading records, ledger integrations, and dashboard data will be expunged from primary server vaults within thirty (30) days.
        </p>
      </div>
      {/* Section 06 - Google User Data Policy & OAuth 2.0 Compliance */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 06</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Google API Services & OAuth 2.0 User Data Policy</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> When you use "Sign in with Google", we only request your primary email, name, and profile picture strictly for authentication. We never sell or share Google user data.
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed">
          Tradifive enables users to authenticate using Google OAuth 2.0 services ("Sign in with Google"). This section details our explicit policies regarding Google user data:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Data Accessed & Collected:</strong> We access only basic Google profile information: your verified email address, full name, and avatar image URL provided by Google during sign-in.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>How Data Is Used:</strong> Google user data is strictly utilized to authenticate your identity, establish your unique Tradifive account profile, and securely persist your authorized software session.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>No Transfer, Resale, or Advertising:</strong> Tradifive does not sell, license, rent, or transfer Google user data to any third parties, brokers, data brokers, advertising networks, or external marketing entities under any circumstances.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>No Credit Evaluation or Automated Profiling:</strong> We do not use Google user data for creditworthiness assessments, lending decisions, or personalized targeted advertising.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Revocation of Google Access:</strong> You may revoke Tradifive's access to your Google account at any time via your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Google Account Security Permissions</a>. Upon revocation, you can also request total profile deletion via <a href="/delete-account" className="text-indigo-400 underline">https://www.tradifive.in/delete-account</a>.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Limited Use Compliance:</strong> Tradifive's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-medium">Google API Services User Data Policy</a>, including the Limited Use requirements.</span>
          </li>
        </ul>
      </div>

      {/* Section 07 - Contact Information */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 07</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Contact Information & Privacy Officer</h2>
        <p className="text-sm text-zinc-400">
          If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, you may contact our dedicated Compliance & Privacy team:
        </p>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 text-sm space-y-2 text-zinc-300">
          <p><strong>Entity:</strong> TradiFive Technologies</p>
          <p><strong>Contact Email:</strong> <a href="mailto:support@tradifive.in" className="text-indigo-400 underline">support@tradifive.in</a> / <a href="mailto:nikhilharake369@gmail.com" className="text-indigo-400 underline">nikhilharake369@gmail.com</a></p>
          <p><strong>Headquarters:</strong> Belgaum, Karnataka, India - 591113</p>
          <p><strong>Official Website:</strong> <a href="https://www.tradifive.in" className="text-indigo-400 underline">https://www.tradifive.in</a></p>
        </div>
      </div>
    </LegalLayout>
  );
}
