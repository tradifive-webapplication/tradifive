import React, { useEffect } from "react";
import LegalLayout from "@/components/LegalLayout";

export default function AmlKycPolicyPublic() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      activeTab="aml-kyc"
      title="AML & KYC Policy"
      lastUpdated="Last Updated: October 2025"
    >
      {/* Intro section */}
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          Tradifive Connect ("we", "our", "us") is dedicated to establishing the highest security standards, maintaining integrity, and preventing financial crime. This Anti-Money Laundering (AML) and Know Your Customer (KYC) Policy details our protocols for verifying our members, monitoring payouts, and preventing fraud.
        </p>
        <p className="text-[15px] leading-relaxed text-zinc-400">
          We strictly follow international guidelines set forth by the Financial Action Task Force (FATF), the Office of Foreign Assets Control (OFAC), and regional regulatory institutions governing prop evaluations, software subscriptions, and performance challenges.
        </p>
      </div>

      {/* Section 1 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 01</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Identity Verification Requirements</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Before getting paid, users must pass a KYC identity check (government ID + proof of address + liveness test) via our verification partner.
        </div>

        <p className="text-sm text-zinc-400">
          Before any participant can qualify for prize payouts, payout splits, or affiliate reward distribution, they must undergo identity verification via our integrated KYC processor. The verification process requires:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Proof of Identity (POI):</strong> A valid, unexpired government-issued document (e.g., passport, national ID card, or driver’s license) featuring a clear photograph, full name, and date of birth.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Proof of Address (POA):</strong> A bank statement, credit card bill, or utility bill dated within the last ninety (90) days that matches the name on the account.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Biometric Check:</strong> A real-time face matching (liveness check) to confirm the applicant matches their submitted identification documents.</span>
          </li>
        </ul>
      </div>

      {/* Section 2 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 02</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Verification Match & Payout Integrity</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> The name on your payment card, your verified ID, and your payout account must match exactly. Third-party deposits or payouts are prohibited.
        </div>

        <p className="text-sm text-zinc-400">
          To maintain strict compliance and prevent money laundering, all payout registrations are audited:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Name Match:</strong> The billing name on the payment method used for subscriptions, and the legal name verified during KYC, MUST exactly match the name on the payout method (e.g., Bank account, Stripe connect profile, or Crypto address owner). We do not permit third-party payments or payouts.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Refund Policy Interactions:</strong> In instances of suspicious or unverified payment channels, we reserve the right to freeze the account pending full KYC submission or refund the transaction to the original source.</span>
          </li>
        </ul>
      </div>

      {/* Section 3 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 03</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Sanctions & Restrictions</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> We screen all registrations against UN, EU, UK, and OFAC lists. We do not provide services to sanctioned regions.
        </div>

        <p className="text-sm text-zinc-400">
          We screen all users against international sanctions databases, including the United Nations, European Union, Office of Foreign Assets Control (OFAC), and UK Treasury listings.
        </p>
        <p className="text-sm font-bold text-zinc-300">
          Tradifive does not service residents of the following restricted or sanctioned jurisdictions:
        </p>
        <p className="text-sm text-zinc-455 bg-[#141416] border border-zinc-800 p-3.5 rounded-lg">
          Cuba, Iran, North Korea, Syria, Crimea region, Luhansk and Donetsk regions, and any country/territory subject to comprehensive OFAC trade embargoes. Any attempts to bypass these geographical blocks via VPNs or proxy setups will lead to permanent termination of accounts and forfeiture of balances.
        </p>
      </div>

      {/* Section 4 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 04</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Monitoring & Audits</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> We audit transactions for fraud indicators. Suspicious actions may lead to temporary freezes or reports to law enforcement.
        </div>

        <p className="text-sm text-zinc-400">
          We employ automated transaction monitoring systems to identify irregular patterns or suspicious activities. If an account displays indicators of illicit behavior (such as multiple credit cards linked to one account, rapid deposit/withdrawal cycles, or conflicting geographic data), we reserve the right to:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Request additional supporting documentation or video verification.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Suspend the profile and prevent active brokerage syncs until the compliance audit concludes.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Report suspicious transactions to the appropriate law enforcement or regulatory authorities.</span>
          </li>
        </ul>
      </div>
    </LegalLayout>
  );
}
