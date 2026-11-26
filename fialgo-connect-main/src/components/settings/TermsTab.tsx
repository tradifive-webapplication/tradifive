import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertTriangle, RotateCcw, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TermsTab() {
  const [activeSection, setActiveSection] = useState('terms');

  const sections = [
    { id: 'terms', title: 'Terms of Service', icon: FileText, href: '/terms-of-service' },
    { id: 'privacy', title: 'Privacy Policy', icon: Shield, href: '/privacy-policy' },
    { id: 'security', title: 'Data Security', icon: Lock, href: '/privacy-policy' },
    { id: 'legal', title: 'Risk Disclosure', icon: AlertTriangle, href: '/risk-disclosure' },
    { id: 'refunds', title: 'Refund Policy', icon: RotateCcw, href: '/refund-policy' },
  ];

  const currentDoc = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="w-full max-w-[820px] space-y-5">
      {/* Document Navigation Card */}
      <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] text-slate-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                Legal &amp; Compliance Documents
              </h3>
              <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Review TradiFive policies governing data privacy, risk, and billing.
              </p>
            </div>
          </div>

          <a
            href={currentDoc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="tactile-white-pill h-8 px-3.5 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 text-slate-700 dark:text-neutral-200 shrink-0 self-start sm:self-center"
          >
            <span>Open Full Page</span>
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`h-8 px-3.5 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'tactile-black-pill font-bold'
                    : 'bg-[#F4F5F8] dark:bg-white/[0.04] text-slate-600 dark:text-neutral-300 border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Content Card */}
      <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {activeSection === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="space-y-4"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                <h4 className="text-[15.5px] font-bold text-slate-900 dark:text-white">Terms of Service</h4>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">Updated Oct 2025</span>
              </div>
              <div className="space-y-4 text-[13px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  By accessing TradiFive, connecting your brokerage accounts, or subscribing to our analytical tools, you agree to be bound by these Terms of Service.
                </p>
                <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">1. Technology Provider Status</h5>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                    TradiFive is a software technology provider and not a broker, financial institution, or registered investment advisor. TradiFive never holds client funds or accepts deposits.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">2. Account Connectivity &amp; Usage</h5>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                    When linking a trading terminal (e.g. MetaTrader 5 or supported Indian brokers), telemetry and trade history are synced solely for analytics, Risk Guard monitoring, and journaling.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">3. Subscriptions &amp; Billing</h5>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                    Pro and Elite subscriptions renew according to your chosen billing interval. You can upgrade, downgrade, cancel, or request a billing review anytime from Subscription settings.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="space-y-4"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                <h4 className="text-[15.5px] font-bold text-slate-900 dark:text-white">Privacy Policy</h4>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">Updated Oct 2025</span>
              </div>
              <div className="space-y-4 text-[13px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  We collect only the profile, device, and trading telemetry required to operate your analytics dashboards, sync journal entries, and protect your account.
                </p>
                <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">Private by Default</h5>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                    All trading ledgers, journal notes, and performance metrics are private by default and are never sold to third parties or displayed publicly unless you turn sharing on.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">Data Control &amp; Export</h5>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                    You can export a complete JSON/CSV backup or permanently delete your trading history or account directly from Data &amp; Privacy.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="space-y-4"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <h4 className="text-[15.5px] font-bold text-slate-900 dark:text-white">Data Security &amp; Encryption</h4>
              </div>
              <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13.5px]">Encrypted Transit &amp; Storage</h5>
                  <p className="text-[12.5px] text-slate-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                    All platform traffic and stored session credentials use TLS and AES-256 encryption with isolated API token storage.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">Read-Only Brokerage Telemetry</h5>
                <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                  Analytical sync flows never withdraw funds or alter account ownership permissions at your broker.
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'legal' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="space-y-4"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <h4 className="text-[15.5px] font-bold text-slate-900 dark:text-white">Risk Disclosure</h4>
              </div>
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13.5px]">High Risk Warning</h5>
                  <p className="text-[12.5px] text-slate-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                    Trading leveraged forex, futures, options, and CFDs involves substantial risk of loss and is not suitable for every investor.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">Educational &amp; Analytical Scope</h5>
                <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                  AI Coach commentary, risk metrics, and historical statistics are strictly educational and do not represent personalized investment advice. You retain full responsibility for all live orders.
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'refunds' && (
            <motion.div
              key="refunds"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="space-y-4"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <h4 className="text-[15.5px] font-bold text-slate-900 dark:text-white">Refund &amp; Cancellation Policy</h4>
              </div>
              <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-[13.5px]">Subscription Cancellation &amp; Refunds</h5>
                  <p className="text-[12.5px] text-slate-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                    Cancel your recurring subscription anytime from Settings → Subscription. Eligible billing issues can be submitted directly via Request a Refund.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] p-4 space-y-1.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-[13px]">Review Turnaround</h5>
                <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                  Billing and refund tickets submitted from Subscription or Help Center are reviewed by our billing team within 24 hours.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
