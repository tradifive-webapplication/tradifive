import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TermsTab() {
  const [activeSection, setActiveSection] = useState('terms');

  const sections = [
    { id: 'terms', title: 'Terms of Service', icon: FileText, color: 'text-indigo-500 dark:text-indigo-400' },
    { id: 'privacy', title: 'Privacy Policy', icon: Shield, color: 'text-emerald-500 dark:text-emerald-400' },
    { id: 'security', title: 'Data Security', icon: Lock, color: 'text-blue-500 dark:text-blue-400' },
    { id: 'legal', title: 'Legal & Risk', icon: AlertTriangle, color: 'text-amber-500 dark:text-amber-400' },
    { id: 'refunds', title: 'Refund Policy', icon: RotateCcw, color: 'text-rose-500 dark:text-rose-400' },
  ];

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Legal & Privacy
        </h2>
        <p className="text-[15px] font-medium text-slate-500 dark:text-[#80848E] max-w-2xl">
          Please read these terms carefully. By using Tradifive Connect, you agree to our terms of service, privacy policy, and data handling practices.
        </p>
      </div>

      {/* Main Container - Premium Glassmorphism */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-2 border-white dark:border-[#222B3F] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),_0_0_0_2px_#E7E7E7] dark:shadow-none rounded-[32px] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 min-h-[600px] group">
        
        {/* Abstract background gradient decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/5 dark:to-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 relative z-10 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-700/50 pb-6 md:pb-0 md:pr-6">
          <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">Legal Documents</h3>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white dark:bg-[#1A1E29] shadow-sm border-2 border-slate-200 dark:border-[#2b2d31] scale-[1.02]' 
                    : 'hover:bg-white/50 dark:hover:bg-white/5 border-2 border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-slate-50 dark:bg-white/5' : ''}`}>
                    <Icon size={18} className={isActive ? sec.color : 'opacity-70'} />
                  </div>
                  <span className={`text-[13px] font-bold ${isActive ? 'text-slate-900 dark:text-white' : ''}`}>
                    {sec.title}
                  </span>
                </div>
                {isActive && <ChevronRight size={16} className="text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 relative z-10 overflow-y-auto amazing-scrollbar pr-2 pb-4">
          <AnimatePresence mode="wait">
            {activeSection === 'terms' && (
              <motion.div key="terms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h3>
                <p className="text-[13px] text-slate-500 font-medium tracking-wide uppercase">Last Updated: October 2025</p>
                <div className="space-y-6 text-[14px] text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                  <p>Welcome to Tradifive Connect. By accessing our platform, connecting your brokerage accounts, or subscribing to our analytical tools, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">0. Core Business Model & Technology Provider Status</h4>
                    <p>Tradifive Private Limited is a software technology provider and not a broker, financial institution, or registered investment advisor. We provide analytical tools and connectivity software. Tradifive does not take deposits, process withdrawals, execute trades on its own books, or hold any client funds. Users connect their own third-party brokerage accounts via API. All analytics, metrics, and AI coaching insights provided by the platform are for informational and educational purposes only and do not constitute financial or investment advice.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">1. Account Connectivity & Usage</h4>
                    <p>By integrating a brokerage account (e.g., MetaTrader 4/5, cTrader, or proprietary FIX APIs) via our platform, you explicitly grant us read-only access to your trading ledgers, execution history, and active positions for the sole purpose of rendering analytical dashboards, computing performance metrics, and facilitating AI-driven coaching features. We strictly prohibit utilizing the platform for automated algorithmic execution beyond our provided webhook integrations (if applicable).</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">2. Subscription and Billing</h4>
                    <p>Elite and Pro tier memberships are billed on a recurring basis as per your selection (monthly/annually) via Stripe. You may cancel your subscription at any time; however, access to premium features will persist until the end of your current billing cycle. No prorated refunds are issued for partial usage.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">3. User Conduct</h4>
                    <p>You agree not to reverse-engineer the analytics engine, scrape platform data, or abuse the ticketing and support channels. Any violation may result in immediate suspension of your account without notice.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                <p className="text-[13px] text-slate-500 font-medium tracking-wide uppercase">Last Updated: October 2025</p>
                <div className="space-y-6 text-[14px] text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                  <p>Your privacy is critically important to us. At Tradifive, we have a few fundamental principles:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>We don’t ask for personal information unless we truly need it.</li>
                    <li>We don’t share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
                    <li>We don’t store personal information on our servers unless required for the on-going operation of our services.</li>
                  </ul>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Information We Collect</h4>
                    <p>We collect log data (IP addresses, browser type), device information, and most importantly, your trading telemetry via connected broker APIs. This data is utilized solely to train your personal AI coach model and render your private dashboards.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Data Sharing</h4>
                    <p>All trading ledgers and performance metrics are strictly private by default. They will never be shared with external third-party agencies, advertisers, or other platform users unless you explicitly toggle your profile visibility to "Public" in your Privacy & Safety settings.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Data Security & Storage</h3>
                <div className="space-y-6 text-[14px] text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-start gap-4">
                     <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 mt-1 shrink-0">
                        <Lock size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-[15px] mb-1">Bank-Grade Encryption</h4>
                        <p className="text-[13px] text-emerald-700 dark:text-emerald-300/80">All data in transit and at rest is secured using AES-256 encryption. We never store plaintext broker passwords.</p>
                     </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Token Vaults</h4>
                    <p>When you link an account, we generate an OAuth token or store your API keys in isolated, hardware-backed KMS (Key Management Service) vaults. Our database instances have no direct access to decrypt these keys; they must pass through our secure proxy layer which only executes read requests.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">No Execution Authority</h4>
                    <p>Tradifive Connect is an analytical layer. The integrations provided via our "Connect" flow do not possess write permissions to open, modify, or close positions on your behalf. We will never place trades for you.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Compliance</h4>
                    <p>We routinely undergo penetration testing and comply with standard GDPR and CCPA regulations regarding your right to be forgotten. You can delete all your data permanently from the "Account" settings tab.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'legal' && (
              <motion.div key="legal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Legal Disclaimer & Risk Warning</h3>
                <div className="space-y-6 text-[14px] text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                  <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-4">
                     <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 mt-1 shrink-0">
                        <AlertTriangle size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-400 text-[15px] mb-1">High Risk Warning</h4>
                        <p className="text-[13px] text-amber-700 dark:text-amber-300/80">Trading foreign exchange on margin, CFD derivatives, and cryptocurrencies carries a high level of risk and may not be suitable for all investors.</p>
                     </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Educational Purposes Only</h4>
                    <p>All content generated by the Tradifive AI Coach, performance projections, and algorithmic insights serve illustrative and educational objectives. They do not represent financial, legal, or tax advisory recommendations. Past performance is not indicative of future results.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Limitation of Liability</h4>
                    <p>Under no circumstances shall Tradifive Connect, its developers, or its parent entities be held liable for any drawdown events, liquidation of funds, or loss of capital occurred during broker sync cycles or while utilizing our software. You bear 100% of the liability for your trading decisions and executions.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'refunds' && (
              <motion.div key="refunds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Refund & Cancellation Policy</h3>
                <div className="space-y-6 text-[14px] text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start gap-4">
                     <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 mt-1 shrink-0">
                        <RotateCcw size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-rose-900 dark:text-rose-400 text-[15px] mb-1">Standard Policy</h4>
                        <p className="text-[13px] text-rose-700 dark:text-rose-300/80">Digital subscriptions and challenge access fees are generally non-refundable once the service has been accessed or utilized.</p>
                     </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Subscription Cancellations</h4>
                    <p>You may cancel your monthly or annual Tradifive subscription at any time through the Settings dashboard. Upon cancellation, your access to premium features will remain active until the end of your current paid billing cycle. We do not issue prorated refunds for mid-cycle cancellations.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Challenge & Competition Fees</h4>
                    <p>Fees paid for entry into trading challenges, evaluations, or premium competitions are strictly non-refundable once a trade has been placed on the provided account. If you purchase an evaluation and fail to log in or initiate a trade within 30 days, you may request a refund minus a 10% administrative processing fee.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">Disputes & Chargebacks</h4>
                    <p>Filing a chargeback or dispute without first contacting our Support Desk is a violation of our Terms of Service and will result in a permanent ban across the Tradifive ecosystem. If you experience billing issues, please file a "Billing Issue" ticket, and our team will review it within 24 hours.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
