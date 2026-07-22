import React, { useEffect } from "react";
import LegalLayout from "@/components/LegalLayout";

export default function TermsOfServicePublic() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalLayout
      activeTab="terms"
      title="Terms of Service"
      lastUpdated="Last Updated: October 2025"
    >
      {/* Intro section */}
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          Welcome to Tradifive Connect. These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Tradifive Private Limited ("Company", "we", "us", or "our"), concerning your access to and use of the Tradifive website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
        </p>
        <p className="text-[15px] leading-relaxed text-zinc-400">
          You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
        </p>
      </div>

      {/* Section 0 - CORE BUSINESS MODEL */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 00</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Core Business Model & Disclaimers</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Tradifive Private Limited is a software company, not a broker. We do not hold client funds or execute trades.
        </div>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Technology Provider:</strong> Tradifive Private Limited is a software technology provider and not a broker, financial institution, or registered investment advisor. We provide analytical tools and connectivity software.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>No Client Funds Held:</strong> Tradifive does not take deposits, process withdrawals, execute trades on its own books, or hold any client funds. Users connect their own third-party brokerage accounts via API.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>No Financial Advice:</strong> All analytics, metrics, and AI coaching insights provided by the platform are for informational and educational purposes only and do not constitute financial or investment advice.</span>
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 01</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Account Connectivity & Usage</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Connecting your trading account allows us to import data to generate analytical metrics. You confirm that you own the connected broker profile. We do not have execution authority.
        </div>

        <p className="text-sm text-zinc-400">
          The core functionality of Tradifive Connect requires you to link a third-party brokerage account (e.g., via MetaTrader 4/5, cTrader, or FIX APIs). By establishing this connection:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>You explicitly grant us read-only access to your trading ledgers, execution history, and active positions.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>You acknowledge that we process this data for the sole purpose of rendering analytical dashboards, computing performance metrics, and facilitating AI-driven coaching features.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>You confirm that you possess the legal right and authority to grant us access to the connected brokerage account.</span>
          </li>
        </ul>

        <h3 className="text-sm font-mono text-rose-400 uppercase tracking-wider mt-6">Prohibited Use Cases</h3>
        <p className="text-sm text-zinc-400">
          We strictly prohibit utilizing the platform for automated algorithmic execution beyond our provided webhook integrations (if applicable). Tradifive Connect is an analytical layer and does not possess write permissions to open, modify, or close positions on your behalf.
        </p>
      </div>

      {/* Section 2 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 02</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Subscription Tiering & Billing</h2>
        
        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Premium features are billed on a recurring basis via Stripe. You can cancel at any time, but we do not issue prorated refunds for partial months.
        </div>

        <p className="text-sm text-zinc-400">
          Access to certain features of the Site may require you to purchase a subscription (e.g., Elite or Pro tier memberships). You agree to provide current, complete, and accurate purchase and account information for all purchases:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Recurring Billing:</strong> Subscriptions are billed on a recurring basis as per your selection (monthly/annually) via our payment processor, Stripe.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Cancellations:</strong> You may cancel your subscription at any time; however, access to premium features will persist until the end of your current billing cycle.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Refunds:</strong> Please refer to our Refund Policy for detailed information regarding digital goods and subscription refunds.</span>
          </li>
        </ul>
      </div>

      {/* Section 3 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 03</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">User Conduct Rules</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Be honest, keep your account secure, and do not attempt to scrap our databases or hack the application.
        </div>

        <p className="text-sm text-zinc-400">
          By using the Site, you represent and warrant that all registration details you submit are true and accurate, you will update them as necessary, and you are not a minor. As a user, you agree not to:
        </p>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Systematically retrieve data or other content from the Site to create or compile a collection, compilation, database, or directory without written permission from us.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Circumvent, disable, or otherwise interfere with security-related features of the Site or bypass network limits.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span>Decipher, decompile, disassemble, or reverse engineer any of the software comprising the Site.</span>
          </li>
        </ul>
      </div>

      {/* Section 4 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 04</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Proprietary Rights</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> All visual content, logos, source code, and design architecture are owned by Tradifive.
        </div>

        <p className="text-sm text-zinc-400">
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
        </p>
      </div>

      {/* Section 5 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 05</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Disclaimers & Liability</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> The site is provided "as is". We are not responsible for brokerage losses or server sync issues.
        </div>

        <p className="text-sm font-bold text-zinc-400 uppercase tracking-wide">
          THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK.
        </p>
        <p className="text-sm text-zinc-400">
          Under no circumstances shall Tradifive Connect, its developers, directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
        </p>
      </div>
      {/* Section 6 */}
      <div className="border-t border-zinc-800/60 pt-8 mt-10 space-y-4">
        <span className="font-mono text-[10px] text-indigo-400 block tracking-widest uppercase">Section 06</span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Regulatory Compliance & Disclaimers (India)</h2>

        <div className="bg-white/[0.01] border-l-2 border-indigo-500/30 pl-4 py-2.5 my-4 text-[13px] text-zinc-400 leading-relaxed italic">
          <strong>Summary:</strong> Tradifive is a Technology Service Provider. We are not registered with SEBI or the RBI. Users are solely responsible for their own regulatory compliance.
        </div>

        <ul className="space-y-3 pl-1 text-[13.5px] text-zinc-400">
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>SEBI Disclaimer:</strong> Tradifive is an educational and analytics technology platform. We are NOT registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor (RIA) or Research Analyst (RA). Any information or trades shared by users in the community channels are their personal opinions and do not constitute financial advice from Tradifive.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>FEMA & RBI Compliance:</strong> Tradifive provides software analytics (AI Journal & Risk Guard) and does not execute trades or hold user funds. Users are solely responsible for ensuring that their connected broker accounts and trading activities comply with their local jurisdiction's laws, including the Foreign Exchange Management Act (FEMA) and Reserve Bank of India (RBI) guidelines.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-indigo-400 mt-1 select-none font-mono font-black">—</span>
            <span><strong>Technology Provider Limitations:</strong> Tradifive acts exclusively as a Technology Service Provider (TSP). While our Risk Guard aims to assist in risk management, we do not guarantee uptime or execution speed. Tradifive is not liable for any financial losses incurred due to broker API latency, internet outages, or software failures.</span>
          </li>
        </ul>
      </div>
    </LegalLayout>
  );
}
