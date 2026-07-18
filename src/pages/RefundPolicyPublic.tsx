import React, { useEffect } from "react";
import LegalLayout from "@/components/LegalLayout";

export default function RefundPolicyPublic() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      activeTab="refund"
      title="Refund Policy"
      lastUpdated="Last Updated: October 2025"
    >
      {/* Intro section */}
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          At Tradifive, we strive to ensure that our users are satisfied with the analytical tools, AI coaching, and platform features we provide. However, due to the digital nature of our services and the immediate access granted upon payment, we maintain a strict policy regarding refunds and cancellations.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-rose-500/[0.02] border border-rose-500/10 text-rose-400 font-bold text-xs tracking-wider text-center uppercase">
          Please read this policy carefully before purchasing a subscription or entering a trading challenge.
        </div>
      </div>

      {/* Section 1 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 01</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Subscription Cancellations</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> You can cancel your subscription inside your account settings. You will keep access until the billing cycle ends, but no prorated refunds are given.
        </div>

        <p className="text-sm text-zinc-400">
          You may cancel your Tradifive subscription (e.g., Elite or Pro tier) at any time through your Account Settings dashboard. If you cancel your subscription:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Your cancellation will take effect at the end of the current paid term.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>You will retain access to your premium features, dashboards, and AI coach until your current billing cycle expires.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>No Prorated Refunds:</strong> We do not provide refunds or credits for any partial-month subscription periods or unused services.</span>
          </li>
        </ul>
      </div>

      {/* Section 2 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 02</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Challenge & Competition Fees</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Competition and evaluation fees are non-refundable once you place your first trade. Unused accounts can be refunded within 30 days minus a 10% fee.
        </div>

        <p className="text-sm text-zinc-400">
          Tradifive occasionally hosts trading challenges, evaluations, or premium competitions that require an entry fee. Due to the administrative costs of provisioning accounts and managing risk metrics:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Non-Refundable Once Traded:</strong> If you have placed at least one (1) trade on the provided challenge or competition account, the fee is strictly non-refundable under any circumstances.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Unused Accounts:</strong> If you purchase an evaluation or challenge and fail to log in or initiate a single trade within thirty (30) days of purchase, you may request a refund. This refund will be subject to a 10% administrative processing fee.</span>
          </li>
        </ul>
      </div>

      {/* Section 3 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 03</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Billing Errors</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Double-billing or errors made by our systems will be fully refunded if requested within 14 days.
        </div>

        <p className="text-sm text-zinc-400">
          We recognize that billing errors can occur. We will issue a full refund in the following exceptional circumstances:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>You were charged multiple times for the same subscription period due to a technical error on our platform or via Stripe.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Your account was charged after you successfully completed the cancellation process within the application prior to the renewal date.</span>
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-2">
          If you believe you have experienced a billing error, please submit a "Billing Issue" ticket via the Support section of your dashboard within 14 days of the charge.
        </p>
      </div>

      {/* Section 4 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 04</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Chargebacks & Disputes</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Filing a chargeback without emailing support first will result in immediate and permanent account suspension.
        </div>

        <p className="text-sm text-zinc-400">
          Filing a chargeback or dispute with your credit card company or bank without first contacting our Support Desk is a violation of our Terms of Service.
        </p>
        <p className="text-sm text-zinc-455">
          If you file an unwarranted chargeback, your Tradifive account, including any linked brokerages, active challenges, and accumulated data, will be immediately and permanently suspended. We also reserve the right to contest chargebacks using the digital footprint and login data associated with your account.
        </p>
      </div>
    </LegalLayout>
  );
}
