import React, { useState } from 'react';
import { Check, CheckCircle, Sparkles, X, Info } from 'lucide-react';
import logoOnly from '@/assets/Logo_only.png';
import { toast } from 'sonner';
import ElectricBorder from './ElectricBorder';

interface PricingCardsProps {
  selectedPlan: 'starter' | 'pro' | 'elite' | 'enterprise';
  onSelectPlan: (plan: 'starter' | 'pro' | 'elite' | 'enterprise') => void;
  onUpgradeClick?: (plan: 'starter' | 'pro' | 'elite' | 'enterprise') => void;
  isStandalone?: boolean;
  activePlan?: string;
  showCheckoutBar?: boolean;
}

type FeatureItem = { type: 'header'; text: string } | { type: 'feature'; text: string; included: boolean; isLimitation?: boolean; tooltip?: string };

const starterFeatures: FeatureItem[] = [
  { type: 'header', text: 'Includes' },
  { type: 'feature', text: '1 broker connection', included: true },
  { type: 'feature', text: 'Up to 5 executions/day', included: true },
  { type: 'feature', text: 'Basic trading journal', included: true },
  { type: 'feature', text: 'Daily P&L & discipline score', included: true },
  { type: 'feature', text: '10 AI Coach credits/day', included: true },
  { type: 'feature', text: 'Core Risk Guard (max loss, max trades)', included: true },
  { type: 'header', text: 'Limitations' },
  { type: 'feature', text: 'No automation', included: false, isLimitation: true },
  { type: 'feature', text: 'No advanced analytics', included: false, isLimitation: true },
  { type: 'feature', text: 'No mentor access', included: false, isLimitation: true }
];

const proFeatures: FeatureItem[] = [
  { type: 'header', text: 'Trading & Execution' },
  { type: 'feature', text: 'Up to 6 broker connections', included: true },
  { type: 'feature', text: 'Unlimited trades/day', included: true },
  { type: 'feature', text: 'Full journal with calendar & behavior insights', included: true },
  { type: 'header', text: 'AI & Discipline' },
  { type: 'feature', text: '50 AI Coach credits/day', included: true, tooltip: '1 credit = 1 trade analysis or coaching action' },
  { type: 'feature', text: 'Real-time AI trade feedback', included: true },
  { type: 'feature', text: 'Loss cooldown & revenge-trade protection', included: true },
  { type: 'header', text: 'Risk & Performance' },
  { type: 'feature', text: 'Advanced Risk Guard controls', included: true },
  { type: 'feature', text: 'Balance hiding & privacy tools', included: true },
  { type: 'header', text: 'Community' },
  { type: 'feature', text: 'Create & manage private channels', included: true },
  { type: 'feature', text: 'Join 1 trading competition/month', included: true },
];

const eliteFeatures: FeatureItem[] = [
  { type: 'header', text: 'Automation & Scale' },
  { type: 'feature', text: 'Unlimited broker connections', included: true },
  { type: 'feature', text: 'AI-assisted automated trading (Soon)', included: true },
  { type: 'feature', text: 'Custom strategy-level risk controls', included: true },
  { type: 'header', text: 'Mentorship & Monitoring' },
  { type: 'feature', text: 'Mentor account monitoring access', included: true },
  { type: 'feature', text: 'Shared trading workspace', included: true },
  { type: 'feature', text: 'Personal performance reviews', included: true },
  { type: 'header', text: 'AI Power' },
  { type: 'feature', text: '100 AI Coach credits/day', included: true },
  { type: 'feature', text: 'Deep behavioral & performance analytics', included: true },
  { type: 'header', text: 'Premium Access' },
  { type: 'feature', text: 'Dedicated premium support', included: true },
  { type: 'feature', text: 'Join 2 competitions/month', included: true },
  { type: 'feature', text: 'Elite badge & profile boost', included: true },
];

const enterpriseFeatures: FeatureItem[] = [
  { type: 'header', text: 'Your Rules. Your Server. Your Way.' },
  { type: 'feature', text: 'Custom risk guard rules (e.g., Max Qty Kill Switch, Consecutive Loss Kill Switch)', included: true },
  { type: 'feature', text: 'Deployed on your own dedicated server', included: true },
  { type: 'feature', text: 'Custom broker API integrations', included: true },
  { type: 'feature', text: 'White-glove onboarding & dedicated support', included: true },
  { type: 'feature', text: 'Advanced API access for external tools', included: true },
];

export function PricingCards({ selectedPlan, onSelectPlan, onUpgradeClick, isStandalone = false, activePlan = 'starter', showCheckoutBar = false }: PricingCardsProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly');
  const annualDiscountPercent = 20; // Discount configurable later

  const getPriceDisplay = (basePrice: number) => {
    if (billingInterval === 'monthly') {
      return {
        monthly: basePrice.toLocaleString('en-IN'),
        subtitle: 'billed monthly'
      };
    } else {
      const discountedMonthly = Math.round(basePrice * (1 - annualDiscountPercent / 100));
      const annualTotal = discountedMonthly * 12;
      return {
        monthly: discountedMonthly.toLocaleString('en-IN'),
        subtitle: `Billed annually at ₹${annualTotal.toLocaleString('en-IN')}`
      };
    }
  };

  const standardPrice = getPriceDisplay(1299);
  const proPrice = getPriceDisplay(2499);
  const elitePrice = getPriceDisplay(4999);
  const [starterExpanded, setStarterExpanded] = useState(false);
  const [proExpanded, setProExpanded] = useState(false);
  const [eliteExpanded, setEliteExpanded] = useState(false);
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false);

  const isCurrentPlan = (plan: string) => !isStandalone && activePlan === plan;

  const handleUpgrade = (plan: 'starter' | 'pro' | 'elite' | 'enterprise') => {
    if (onUpgradeClick) {
      onUpgradeClick(plan);
    } else {
      toast.info("TradiFive Early Launch: Auto Trade & Social Feed are 100% Free today! Subscriptions unlock in Phase 2.");
    }
  };

  const renderFeatureList = (features: FeatureItem[], iconType: 'check' | 'checkCircle', iconColorClass: string, isExpanded: boolean, onToggle: () => void) => {
    let visibleCount = 0;
    const visibleFeatures = [];
    for (const item of features) {
      if (!isExpanded && visibleCount >= 3) break;
      visibleFeatures.push(item);
      if (item.type === 'feature') visibleCount++;
    }

    // If the last item pushed is a header, remove it.
    if (!isExpanded && visibleFeatures.length > 0 && visibleFeatures[visibleFeatures.length - 1].type === 'header') {
      visibleFeatures.pop();
    }

    return (
      <div className="flex flex-col flex-grow mt-2">
        <div className="space-y-3">
          {visibleFeatures.map((item, i) => {
            if (item.type === 'header') {
              return (
                <h4 key={i} className={`text-[11px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-2 ${i !== 0 ? 'mt-6' : 'mt-2'}`}>
                  {item.text}
                </h4>
              );
            }

            return (
              <div key={i} className={`flex items-start gap-2 ${item.isLimitation ? 'opacity-70' : ''}`}>
                {item.isLimitation ? (
                  <X size={13} className="text-red-400 mt-[3px] shrink-0" />
                ) : iconType === 'checkCircle' ? (
                  <CheckCircle size={13} className={`${iconColorClass} mt-[3px] shrink-0`} />
                ) : (
                  <Check size={13} className={`${iconColorClass} mt-[3px] shrink-0`} />
                )}
                <span className={`text-[12px] font-medium leading-tight ${item.isLimitation ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-[#DBDEE1]'}`}>
                  {item.text}
                  {item.tooltip && (
                    <span className="group relative inline-block ml-1">
                      <Info size={12} className="text-slate-400 hover:text-slate-600 cursor-help inline align-text-bottom" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-max max-w-[200px] bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg group-hover:block z-50">
                        {item.tooltip}
                      </span>
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="mt-6 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-[#949ba4] dark:hover:text-slate-300 transition-colors cursor-pointer text-center w-full"
        >
          {isExpanded ? 'Show less' : 'View more'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full pb-32">
      {/* 🚀 Early Adopter Launch Pass Banner */}
      <div className="w-full max-w-4xl mx-auto mb-10 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-center animate-fade-in shadow-lg relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} className="text-blue-400" /> Early Adopter Launch Pass
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-1">
          Auto Trade & Social Feed are 100% Free During Launch!
        </h3>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Paid subscriptions (AI Coach, Smart Journal & Risk Guard Pro) are launching in Phase 2. Enjoy full automated execution bots & trader community feeds free of charge.
        </p>
      </div>

      <div className="flex justify-center mb-10 w-full relative z-10">
        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] p-1 rounded-full inline-flex items-center gap-1 border border-[#222] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300 ${billingInterval === 'monthly' ? 'bg-[#222224] text-white shadow-md border border-white/5' : 'text-zinc-500 hover:text-white border border-transparent'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('annually')}
            className={`px-5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300 flex items-center gap-1.5 ${billingInterval === 'annually' ? 'bg-[#222224] text-white shadow-md border border-white/5' : 'text-zinc-500 hover:text-white border border-transparent'}`}
          >
            Annually
            <span className="bg-white/10 text-zinc-300 px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wider">SAVE {annualDiscountPercent}%</span>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 max-w-7xl mx-auto w-full ${isStandalone ? 'dark' : ''}`}>
        <div
          onClick={() => onSelectPlan('starter')}
          className={`cursor-pointer p-6 rounded-[32px] border-[2px] transition-all duration-300 flex flex-col relative overflow-hidden bg-white dark:bg-[#121214] ${selectedPlan === 'starter'
            ? 'border-slate-300 dark:border-[#444] bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F5] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_8px_30px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] dark:shadow-none md:-translate-y-2 scale-[1.02] z-10'
            : 'border-transparent dark:border-transparent bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_1px_#E2E8F0] dark:shadow-none hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.05),0_0_0_1px_#CBD5E1] dark:hover:shadow-none'
            }`}
        >
          <div className="absolute -bottom-10 -right-10 z-0 pointer-events-none opacity-[0.08] dark:opacity-[0.05] transform -rotate-12 grayscale">
            <img src={logoOnly} alt="" className="w-[200px] h-[200px] object-contain" />
          </div>
          <div className={`absolute -bottom-10 -right-10 w-64 h-64 bg-amber-500/15 dark:bg-amber-500/10 blur-3xl rounded-full z-0 pointer-events-none transition-opacity duration-700 ${selectedPlan === 'starter' ? 'opacity-100' : 'opacity-0'}`}></div>

          <h3 className="text-[16px] font-bold text-slate-800 dark:text-white mb-2 relative z-10">Standard</h3>
          <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-6 min-h-[36px]">For beginners learning discipline & journaling</p>
          <div className={`flex items-baseline gap-1 ${billingInterval === 'monthly' ? 'mb-6' : 'mb-1'}`}>
            <span className="text-[32px] font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>₹{standardPrice.monthly}</span>
            <span className="text-[12px] font-medium text-slate-500">/ month</span>
          </div>
          {billingInterval === 'annually' && (
            <div className="text-[11.5px] font-bold text-amber-600 dark:text-amber-500 mb-6">{standardPrice.subtitle}</div>
          )}
          <button
            onClick={() => !isCurrentPlan('starter') && handleUpgrade('starter')}
            disabled={isCurrentPlan('starter')}
            className={`w-full flex items-center justify-center h-10 rounded-full border border-slate-300 dark:border-white/5 bg-slate-200 dark:bg-[#1E1E1E] text-slate-800 dark:text-white font-bold text-[13px] hover:bg-slate-300 dark:hover:bg-[#2A2A2A] transition-all active:scale-95 mb-4 ${isCurrentPlan('starter') ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isCurrentPlan('starter') ? 'Current Plan' : 'Get Standard'}
          </button>

          {renderFeatureList(starterFeatures, 'check', 'text-slate-400', starterExpanded, () => setStarterExpanded(!starterExpanded))}
        </div>

        <div
          onClick={() => onSelectPlan('pro')}
          className={`cursor-pointer p-6 rounded-[32px] border-[2px] transition-all duration-300 flex flex-col relative overflow-hidden bg-white dark:bg-[#121214] ${selectedPlan === 'pro'
            ? 'border-[#fbbf24] dark:border-[#f59e0b]/80 bg-gradient-to-b from-[#f59e0b]/5 to-transparent dark:from-[#78350f]/20 dark:to-[#121214] shadow-[0_8px_20px_-5px_rgba(245,158,11,0.2)] md:-translate-y-2 scale-[1.02] z-10'
            : 'border-[#fde68a] dark:border-[#f59e0b]/30 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12)] dark:shadow-none hover:border-[#fbbf24] dark:hover:border-[#f59e0b]/60 hover:shadow-[0_8px_15px_-5px_rgba(245,158,11,0.15)]'
            }`}
        >
          <div className="absolute -top-8 -right-8 z-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08] transform rotate-12 mix-blend-overlay">
            <img src={logoOnly} alt="" className="w-[200px] h-[200px] object-contain" />
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full z-0 pointer-events-none mix-blend-screen"></div>

          <div className="absolute top-0 right-0 px-4 py-2 bg-amber-500/10 dark:bg-white/5 border-l border-b border-amber-500/20 dark:border-white/10 backdrop-blur-md text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-widest rounded-bl-[24px] rounded-tr-[32px] flex items-center gap-1 z-20 shadow-sm">
            Most Popular
          </div>

          <h3 className="text-[16px] font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2 relative z-10">
            Pro <Sparkles size={16} className="text-amber-500" />
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-6 min-h-[36px]">Designed to make traders consistent, not lucky.</p>
          <div className={`flex items-baseline gap-1 ${billingInterval === 'monthly' ? 'mb-6' : 'mb-1'}`}>
            <span className="text-[32px] font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>₹{proPrice.monthly}</span>
            <span className="text-[12px] font-medium text-slate-500">/ month</span>
          </div>
          {billingInterval === 'annually' && (
            <div className="text-[11.5px] font-bold text-amber-600 dark:text-amber-500 mb-6">{proPrice.subtitle}</div>
          )}
          <button
            onClick={() => !isCurrentPlan('pro') && handleUpgrade('pro')}
            disabled={isCurrentPlan('pro')}
            className={`w-full flex items-center justify-center h-12 rounded-full font-bold text-[13px] transition-all active:scale-95 mb-4 ${isCurrentPlan('pro') ? 'opacity-60 cursor-not-allowed saturate-50 bg-amber-600 text-white' : 'btn-glow-primary'}`}
            style={!isCurrentPlan('pro') ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.35), 0 8px 30px rgba(0, 0, 0, 0.3)' } : {}}
          >
            {isCurrentPlan('pro') ? 'Current Plan' : (!isStandalone && activePlan === 'elite') ? 'Downgrade to Pro' : 'Get Pro'}
          </button>

          <div className="mb-1 mt-2">
            <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Everything in Standard, plus:</span>
          </div>
          {renderFeatureList(proFeatures, 'checkCircle', 'text-amber-500', proExpanded, () => setProExpanded(!proExpanded))}
        </div>

        <ElectricBorder
          color="#a855f7"
          borderRadius={32}
          className="w-full md:col-span-1"
          style={{ height: '100%' }}
        >
          <div
            onClick={() => onSelectPlan('elite')}
            className={`cursor-pointer p-6 rounded-[32px] border-[2px] transition-all duration-300 flex flex-col relative overflow-hidden bg-white dark:bg-[#121214] h-full ${selectedPlan === 'elite'
              ? 'border-purple-400 dark:border-purple-500/80 bg-gradient-to-b from-purple-50/50 to-[#FFFFFF] dark:from-purple-900/20 dark:to-[#121214] shadow-[0_8px_30px_-5px_rgba(168,85,247,0.25)] md:-translate-y-2 scale-[1.02] z-10'
              : 'border-transparent dark:border-transparent bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_1px_#E2E8F0] dark:shadow-none hover:shadow-[0_8px_15px_-5px_rgba(168,85,247,0.15),0_0_0_1px_#c084fc] dark:hover:border-purple-500/40 dark:hover:shadow-none'
              }`}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full z-0 pointer-events-none mix-blend-screen transition-opacity duration-700"></div>

            <h3 className="text-[16px] font-bold text-slate-800 dark:text-white mb-2 relative z-10">Elite</h3>
            <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-6 min-h-[36px] relative z-10">For serious traders, mentors & automation users</p>
            <div className={`flex items-baseline gap-1 ${billingInterval === 'monthly' ? 'mb-6' : 'mb-1'}`}>
              <span className="text-[32px] font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>₹{elitePrice.monthly}</span>
              <span className="text-[12px] font-medium text-slate-500">/ month</span>
            </div>
            {billingInterval === 'annually' && (
              <div className="text-[11.5px] font-bold text-purple-600 dark:text-purple-400 mb-6">{elitePrice.subtitle}</div>
            )}
            <button
              onClick={() => !isCurrentPlan('elite') && handleUpgrade('elite')}
              disabled={isCurrentPlan('elite')}
              className={`w-full flex items-center justify-center h-10 rounded-full border border-slate-300 dark:border-white/5 bg-slate-200 dark:bg-[#1E1E1E] text-slate-800 dark:text-white font-bold text-[13px] hover:bg-slate-300 dark:hover:bg-[#2A2A2A] transition-all active:scale-95 mb-4 ${isCurrentPlan('elite') ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isCurrentPlan('elite') ? 'Current Plan' : 'Get Elite'}
            </button>

            <div className="mb-1 mt-2">
              <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Everything in Pro, plus:</span>
            </div>
            {renderFeatureList(eliteFeatures, 'checkCircle', 'text-purple-400', eliteExpanded, () => setEliteExpanded(!eliteExpanded))}
          </div>
        </ElectricBorder>

        {/* ENTERPRISE PLAN */}
        <div
          onClick={() => onSelectPlan('enterprise')}
          className={`cursor-pointer p-6 rounded-[32px] border-[2px] transition-all duration-300 flex flex-col relative overflow-hidden bg-white dark:bg-[#121214] h-full ${selectedPlan === 'enterprise'
            ? 'border-emerald-500 dark:border-emerald-500/80 bg-gradient-to-b from-emerald-50/50 to-[#FFFFFF] dark:from-emerald-900/20 dark:to-[#121214] shadow-[0_8px_30px_-5px_rgba(16,185,129,0.25)] md:-translate-y-2 scale-[1.02] z-10'
            : 'border-transparent dark:border-transparent bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_1px_#E2E8F0] dark:shadow-none hover:shadow-[0_8px_15px_-5px_rgba(16,185,129,0.15),0_0_0_1px_#6ee7b7] dark:hover:border-emerald-500/40 dark:hover:shadow-none'
            }`}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full z-0 pointer-events-none mix-blend-screen transition-opacity duration-700"></div>

          <h3 className="text-[16px] font-bold text-slate-800 dark:text-white mb-2 relative z-10">Enterprise</h3>
          <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-6 min-h-[36px] relative z-10">For institutional desks & proprietary traders</p>
          <div className={`flex items-baseline gap-1 ${billingInterval === 'monthly' ? 'mb-6' : 'mb-1'}`}>
            <span className="text-[32px] font-extrabold text-slate-900 dark:text-white">Custom</span>
          </div>
          {billingInterval === 'annually' && (
            <div className="text-[11.5px] font-bold text-transparent mb-6">Pricing on request</div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toast.success("Redirecting to Contact form...", { icon: <CheckCircle className="text-emerald-500" /> }); }}
            className={`w-full flex items-center justify-center h-10 rounded-full border border-emerald-500 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[13px] hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95 mb-4`}
          >
            Contact Us &rarr;
          </button>

          <div className="mb-1 mt-2">
            <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Bespoke features:</span>
          </div>
          {renderFeatureList(enterpriseFeatures, 'checkCircle', 'text-emerald-500', enterpriseExpanded, () => setEnterpriseExpanded(!enterpriseExpanded))}
        </div>
      </div>

      {showCheckoutBar && (selectedPlan === 'pro' || selectedPlan === 'elite') && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0b] border-t border-[#222] z-50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <h4 className="text-white font-bold text-[15px]">{selectedPlan === 'elite' ? 'Elite' : 'Pro'}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-white font-extrabold text-[24px]">₹{selectedPlan === 'elite' ? elitePrice.monthly : proPrice.monthly}</span>
                  <span className="text-zinc-400 font-medium text-[12px]">/ month</span>
                </div>
                <div className="text-zinc-500 text-[12px] font-medium mt-1">
                  {billingInterval === 'monthly'
                    ? `Billed monthly`
                    : `For first year, then ${selectedPlan === 'elite' ? elitePrice.subtitle : proPrice.subtitle}`}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 mt-4 md:mt-0">
              <button
                onClick={() => handleUpgrade(selectedPlan)}
                className="btn-glow-primary px-8 py-3 rounded-full font-bold text-[14px] w-full md:w-[320px] justify-center transition-all shadow-lg"
              >
                Subscribe & Pay
              </button>
              <div className="text-[10px] text-zinc-500 max-w-[320px] text-center md:text-right leading-relaxed mt-1 px-2 md:px-0">
                By subscribing to Tradifive, you agree to our <a href="#" className="underline hover:text-zinc-300">Terms of Service</a>. Your subscription will auto-renew automatically. You can <a href="#" className="underline hover:text-zinc-300 text-zinc-300 font-semibold">cancel anytime</a> before your next billing cycle to avoid further charges.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
