import React, { useState, useEffect } from 'react';
import { PricingCards } from '@/components/PricingCards';
import { initiateRazorpayCheckout } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';
import { Crown, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CurrentPlanTab() {
  const [activePlan, setActivePlan] = useState<'starter' | 'pro' | 'elite'>('starter');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'elite'>('starter');
  const [downgradeModalPlan, setDowngradeModalPlan] = useState<'starter' | 'pro' | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const cached = (localStorage.getItem('tradifive_cached_plan') || 'starter') as 'starter' | 'pro' | 'elite';
    setActivePlan(cached);
    setSelectedPlan(cached);

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('subscription_status, plan_type').eq('id', user.id).maybeSingle();
          const p = (data?.subscription_status || data?.plan_type || 'starter') as 'starter' | 'pro' | 'elite';
          if (['starter', 'pro', 'elite'].includes(p)) {
            setActivePlan(p);
            setSelectedPlan(p);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadProfile();
  }, []);

  const applyPlan = async (newPlan: 'starter' | 'pro' | 'elite') => {
    setIsChanging(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          subscription_status: newPlan,
          plan_type: newPlan,
        }).eq('id', user.id);
        localStorage.setItem('tradifive_selected_plan', newPlan);
        localStorage.setItem('tradifive_cached_plan', newPlan);
        const limits = { starter: 5, pro: 50, elite: 150, institutional: 1000 };
        const newMax = limits[newPlan] || 5;
        localStorage.setItem(`tradifive_ai_credits_${user.id}`, String(newMax));
        window.dispatchEvent(new Event('tradifive_profile_update'));
      }
      setActivePlan(newPlan);
      setSelectedPlan(newPlan);
      toast.success(`Plan updated to ${newPlan === 'starter' ? 'Standard (Free)' : newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change plan.');
    } finally {
      setIsChanging(false);
      setDowngradeModalPlan(null);
    }
  };

  const handleUpgrade = async (plan: 'starter' | 'pro' | 'elite') => {
    if (plan === 'starter') {
      setDowngradeModalPlan('starter');
      return;
    }
    const BYPASS_RAZORPAY_FOR_TESTING = true;
    if (BYPASS_RAZORPAY_FOR_TESTING) {
      await applyPlan(plan);
      return;
    }
    const price = plan === 'pro' ? 1399 : 2799;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await initiateRazorpayCheckout({
        amount: price * 100,
        currency: 'INR',
        name: 'TradiFive',
        description: `Upgrade to ${plan.toUpperCase()}`,
        receipt: `cur_upg_${plan}_${Date.now()}`,
        notes: { plan, userId: user?.id || 'guest' },
        prefill: {
          email: user?.email || undefined,
          name: user?.user_metadata?.full_name || undefined,
        },
        onSuccess: async () => {
          await applyPlan(plan);
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Payment failed to initiate.');
    }
  };

  const handleDowngrade = (plan: 'starter' | 'pro' | 'elite') => {
    if (plan === 'starter' || plan === 'pro') {
      setDowngradeModalPlan(plan);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Active Plan Overview */}
      <div className="bg-white dark:bg-[#161618] rounded-3xl border border-slate-200/90 dark:border-white/10 p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100">
              <Crown size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activePlan === 'starter' ? 'Standard Plan' : activePlan === 'pro' ? 'Pro Plan' : 'Elite Plan'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {activePlan === 'starter'
                  ? 'Standard free tier. Upgrade below to activate real-time AI trade coaching & unlimited executions.'
                  : 'Monthly membership. Secured by Razorpay Standard Web Checkout.'}
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {activePlan === 'starter' ? '₹0' : activePlan === 'pro' ? '₹1,399' : '₹2,799'}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {activePlan === 'starter' ? 'Free forever' : 'per month'}
            </div>
          </div>
        </div>

        {/* Quota Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-slate-100 dark:border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">MT5 Sync</div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              {activePlan === 'starter' ? '0 (Manual/CSV)' : activePlan === 'pro' ? '1 Live Account' : 'Up to 3 Accounts'}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Coach</div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              {activePlan === 'starter' ? '5 Credits/day' : activePlan === 'pro' ? '50 Credits/day' : '150 Credits/day'}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Guard</div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              {activePlan === 'starter' ? 'Basic Alert' : activePlan === 'pro' ? 'Revenge Shield' : 'Full Killswitch'}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Feed & Channels</div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              {activePlan === 'starter' ? '1 Post · 1 Public' : activePlan === 'pro' ? 'Unlimited · 3 Private' : 'VIP · Boosted'}
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans in Clean White Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Available Plans</h3>
          <p className="text-xs text-slate-500">Upgrade or downgrade anytime with automatic proration and instant activation.</p>
        </div>

        <PricingCards
          activePlan={activePlan}
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
          onUpgradeClick={handleUpgrade}
          onDowngradeClick={handleDowngrade}
          isStandalone={false}
          showCheckoutBar={false}
        />
      </div>

      {/* Downgrade Dialog */}
      <Dialog open={!!downgradeModalPlan} onOpenChange={(open) => !open && setDowngradeModalPlan(null)}>
        <DialogContent className="sm:max-w-[440px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#333333] shadow-2xl rounded-3xl p-7 text-slate-900 dark:text-white">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <AlertCircle size={24} />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Downgrade to {downgradeModalPlan === 'starter' ? 'Standard (Free)' : 'Pro'}?
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 text-sm leading-relaxed">
              {downgradeModalPlan === 'starter'
                ? 'Your daily AI credits will revert to 5/day, live MT5 sync and Home customization will be locked, and feed posts will be capped at 1/day.'
                : 'By downgrading to Pro (₹1,399/mo), live MT5 accounts will be limited to 1, channels to 3, and AI credits to 50/day.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:justify-end">
            <button
              type="button"
              onClick={() => setDowngradeModalPlan(null)}
              disabled={isChanging}
              className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all shadow-sm"
            >
              Keep Current Plan
            </button>
            <button
              type="button"
              disabled={isChanging}
              onClick={() => downgradeModalPlan && applyPlan(downgradeModalPlan)}
              className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isChanging ? 'Updating...' : 'Confirm Downgrade'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
