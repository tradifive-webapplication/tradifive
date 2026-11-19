import React, { useState } from 'react';
import { Check, CheckCircle2, Sparkles, X, Info } from 'lucide-react';
import { toast } from 'sonner';

export interface PricingCardsProps {
  selectedPlan?: 'starter' | 'pro' | 'elite';
  onSelectPlan?: (plan: 'starter' | 'pro' | 'elite') => void;
  onUpgradeClick?: (plan: 'starter' | 'pro' | 'elite') => void;
  onDowngradeClick?: (plan: 'starter' | 'pro' | 'elite') => void;
  isStandalone?: boolean;
  activePlan?: string;
  showCheckoutBar?: boolean;
}

type FeatureItem =
  | { type: 'header'; text: string }
  | { type: 'feature'; text: string; included: boolean; isLimitation?: boolean; tooltip?: string };

const starterFeatures: FeatureItem[] = [
  { type: 'header', text: 'Includes' },
  { type: 'feature', text: '1 broker connection', included: true },
  { type: 'feature', text: 'Up to 5 trade executions/day', included: true },
  { type: 'feature', text: 'Smart trading journal & daily P&L', included: true },
  { type: 'feature', text: 'Discipline score & trade tracking', included: true },
  { type: 'feature', text: '10 AI Coach credits/day', included: true },
  { type: 'feature', text: 'Core Risk Guard (max daily loss)', included: true },
  { type: 'header', text: 'Limitations' },
  { type: 'feature', text: 'No automated execution bots', included: false, isLimitation: true },
  { type: 'feature', text: 'Standard support', included: false, isLimitation: true },
  { type: 'feature', text: 'No mentor monitoring access', included: false, isLimitation: true }
];

const proFeatures: FeatureItem[] = [
  { type: 'header', text: 'Trading & Execution' },
  { type: 'feature', text: 'Up to 6 broker connections', included: true },
  { type: 'feature', text: 'Unlimited executions/day', included: true },
  { type: 'feature', text: 'Full journal with calendar & behavioral insights', included: true },
  { type: 'header', text: 'AI & Discipline' },
  { type: 'feature', text: '50 AI Coach credits/day', included: true, tooltip: '1 credit = 1 trade analysis or coaching action' },
  { type: 'feature', text: 'Real-time AI trade feedback', included: true },
  { type: 'feature', text: 'Loss cooldown & revenge-trade protection', included: true },
  { type: 'header', text: 'Risk & Community' },
  { type: 'feature', text: 'Advanced Risk Guard kill-switch controls', included: true },
  { type: 'feature', text: 'Balance hiding & privacy modes', included: true },
  { type: 'feature', text: 'Create & manage private channels', included: true },
  { type: 'feature', text: 'Join 1 trading competition/month', included: true },
];

const eliteFeatures: FeatureItem[] = [
  { type: 'header', text: 'Automation & Scale' },
  { type: 'feature', text: 'Unlimited broker connections', included: true },
  { type: 'feature', text: 'AI-assisted automated execution (Early access)', included: true },
  { type: 'feature', text: 'Custom strategy-level risk controls', included: true },
  { type: 'header', text: 'Mentorship & Intelligence' },
  { type: 'feature', text: 'Mentor account monitoring access', included: true },
  { type: 'feature', text: 'Shared trading workspace & copy insights', included: true },
  { type: 'feature', text: 'Personal performance reviews & strategy grading', included: true },
  { type: 'header', text: 'AI Power & Support' },
  { type: 'feature', text: '100 AI Coach credits/day', included: true },
  { type: 'feature', text: 'Deep behavioral & psychological metrics', included: true },
  { type: 'feature', text: '24/7 Priority VIP support & Elite profile badge', included: true },
  { type: 'feature', text: 'Join 2 competitions/month with double rewards', included: true },
];

export function PricingCards({
  selectedPlan = 'pro',
  onSelectPlan,
  onUpgradeClick,
  onDowngradeClick,
  isStandalone = false,
  activePlan = 'starter',
  showCheckoutBar = false
}: PricingCardsProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly');
  const [starterExpanded, setStarterExpanded] = useState(false);
  const [proExpanded, setProExpanded] = useState(false);
  const [eliteExpanded, setEliteExpanded] = useState(false);

  // Updated pricing in INR (₹)
  const prices = {
    starter: {
      monthly: 0,
      annual: 0,
      display: '₹0',
      period: 'forever',
      sub: 'Free forever · No card required'
    },
    pro: {
      monthly: 1399,
      annual: 1119,
      display: billingInterval === 'monthly' ? '₹1,399' : '₹1,119',
      period: '/ month',
      sub: billingInterval === 'monthly' ? 'Billed monthly' : 'Billed annually (₹13,428 / year)'
    },
    elite: {
      monthly: 2799,
      annual: 2239,
      display: billingInterval === 'monthly' ? '₹2,799' : '₹2,239',
      period: '/ month',
      sub: billingInterval === 'monthly' ? 'Billed monthly' : 'Billed annually (₹26,868 / year)'
    }
  };

  const isCurrentPlan = (plan: string) => activePlan === plan;

  const planRank: Record<string, number> = {
    starter: 0,
    pro: 1,
    elite: 2
  };

  const handleAction = (plan: 'starter' | 'pro' | 'elite') => {
    onSelectPlan?.(plan);

    if (isCurrentPlan(plan)) {
      toast.info(`You are currently on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`);
      return;
    }

    const currentRank = planRank[activePlan] ?? 0;
    const targetRank = planRank[plan] ?? 0;

    if (targetRank < currentRank) {
      if (onDowngradeClick) {
        onDowngradeClick(plan);
      } else if (onUpgradeClick) {
        onUpgradeClick(plan);
      }
    } else {
      if (onUpgradeClick) {
        onUpgradeClick(plan);
      }
    }
  };

  const getButtonConfig = (plan: 'starter' | 'pro' | 'elite') => {
    const current = isCurrentPlan(plan);
    const currentRank = planRank[activePlan] ?? 0;
    const targetRank = planRank[plan] ?? 0;

    if (current) {
      return {
        label: 'Current Plan',
        disabled: true,
        className: 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-white/10 cursor-default'
      };
    }

    if (targetRank < currentRank) {
      return {
        label: plan === 'starter' ? 'Downgrade to Standard' : `Downgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        disabled: false,
        className: 'bg-white hover:bg-slate-50 dark:bg-[#1E1E22] dark:hover:bg-[#25252A] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/15 font-bold shadow-sm'
      };
    }

    // Upgrade
    if (plan === 'pro') {
      return {
        label: 'Upgrade to Pro',
        disabled: false,
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/25 active:scale-[0.99]'
      };
    }

    if (plan === 'elite') {
      return {
        label: 'Upgrade to Elite',
        disabled: false,
        className: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-md active:scale-[0.99]'
      };
    }

    return {
      label: 'Get Started Free',
      disabled: false,
      className: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-sm'
    };
  };

  const renderFeatureList = (
    features: FeatureItem[],
    isExpanded: boolean,
    onToggle: () => void
  ) => {
    let visibleCount = 0;
    const visibleFeatures = [];
    for (const item of features) {
      if (!isExpanded && visibleCount >= 5) break;
      visibleFeatures.push(item);
      if (item.type === 'feature') visibleCount++;
    }

    return (
      <div className="flex flex-col flex-grow mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
        <div className="space-y-3">
          {visibleFeatures.map((item, i) => {
            if (item.type === 'header') {
              return (
                <div
                  key={i}
                  className={`text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ${
                    i !== 0 ? 'mt-4 pt-2' : ''
                  }`}
                >
                  {item.text}
                </div>
              );
            }

            return (
              <div key={i} className="flex items-start gap-2.5">
                {item.included ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X size={10} strokeWidth={2.5} />
                  </div>
                )}
                <span
                  className={`text-[13px] leading-snug ${
                    item.included
                      ? 'text-slate-700 dark:text-slate-200 font-medium'
                      : 'text-slate-400 dark:text-slate-500 line-through decoration-slate-300'
                  }`}
                >
                  {item.text}
                  {item.tooltip && (
                    <span className="group relative inline-block ml-1">
                      <Info
                        size={12}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help inline align-middle"
                      />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-max max-w-[200px] bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl group-hover:block z-50">
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
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="mt-5 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-left"
        >
          {isExpanded ? 'Show fewer features' : `View all features (${features.filter(f => f.type === 'feature').length})`}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Billing interval switcher */}
      <div className="flex justify-center mb-10 w-full">
        <div className="bg-slate-100 dark:bg-[#1E1E22] p-1 rounded-full inline-flex items-center gap-1 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              billingInterval === 'monthly'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setBillingInterval('annually')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              billingInterval === 'annually'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Annual billing
            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Clean White Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto w-full items-stretch">
        {/* 1. STANDARD CARD */}
        <div
          onClick={() => onSelectPlan?.('starter')}
          className={`bg-white dark:bg-[#161618] rounded-3xl border transition-all duration-200 flex flex-col justify-between p-7 sm:p-8 relative ${
            selectedPlan === 'starter'
              ? 'border-slate-400 dark:border-slate-500 shadow-md ring-2 ring-slate-200 dark:ring-white/10'
              : 'border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Standard</h3>
              {isCurrentPlan('starter') && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  Active Plan
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px] leading-relaxed">
              Essential execution & journaling for beginner traders learning discipline.
            </p>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">₹0</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">forever</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium">
              Free forever · No credit card required
            </div>

            <button
              onClick={() => handleAction('starter')}
              disabled={getButtonConfig('starter').disabled}
              className={`w-full py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                getButtonConfig('starter').className
              }`}
            >
              {isCurrentPlan('starter') && <CheckCircle2 size={16} className="text-emerald-500" />}
              {getButtonConfig('starter').label}
            </button>
          </div>

          {renderFeatureList(starterFeatures, starterExpanded, () => setStarterExpanded(!starterExpanded))}
        </div>

        {/* 2. PRO CARD (MOST POPULAR) */}
        <div
          onClick={() => onSelectPlan?.('pro')}
          className={`bg-white dark:bg-[#161618] rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between p-7 sm:p-8 relative ${
            selectedPlan === 'pro' || !selectedPlan
              ? 'border-indigo-600 shadow-xl ring-4 ring-indigo-50 dark:ring-indigo-950/30 md:-translate-y-1'
              : 'border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md'
          }`}
        >
          {/* Badge */}
          <div className="absolute -top-3.5 right-6 px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
            <Sparkles size={12} /> Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Pro
              </h3>
              {isCurrentPlan('pro') && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Active Plan
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px] leading-relaxed">
              For active traders seeking automated risk controls & real-time AI trade coaching.
            </p>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {prices.pro.display}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{prices.pro.period}</span>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-6 font-semibold">
              {prices.pro.sub}
            </div>

            <button
              onClick={() => handleAction('pro')}
              disabled={getButtonConfig('pro').disabled}
              className={`w-full py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                getButtonConfig('pro').className
              }`}
            >
              {isCurrentPlan('pro') && <CheckCircle2 size={16} className="text-emerald-500" />}
              {getButtonConfig('pro').label}
            </button>
          </div>

          {renderFeatureList(proFeatures, proExpanded, () => setProExpanded(!proExpanded))}
        </div>

        {/* 3. ELITE CARD */}
        <div
          onClick={() => onSelectPlan?.('elite')}
          className={`bg-white dark:bg-[#161618] rounded-3xl border transition-all duration-200 flex flex-col justify-between p-7 sm:p-8 relative ${
            selectedPlan === 'elite'
              ? 'border-slate-900 dark:border-purple-400 shadow-xl ring-2 ring-slate-200 dark:ring-purple-950/30'
              : 'border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Elite</h3>
              {isCurrentPlan('elite') ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Active Plan
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  Full Power
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px] leading-relaxed">
              For prop traders, mentors, and automation users scaling multiple broker portfolios.
            </p>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {prices.elite.display}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{prices.elite.period}</span>
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mb-6 font-semibold">
              {prices.elite.sub}
            </div>

            <button
              onClick={() => handleAction('elite')}
              disabled={getButtonConfig('elite').disabled}
              className={`w-full py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                getButtonConfig('elite').className
              }`}
            >
              {isCurrentPlan('elite') && <CheckCircle2 size={16} className="text-emerald-500" />}
              {getButtonConfig('elite').label}
            </button>
          </div>

          {renderFeatureList(eliteFeatures, eliteExpanded, () => setEliteExpanded(!eliteExpanded))}
        </div>
      </div>
    </div>
  );
}
export default PricingCards;
