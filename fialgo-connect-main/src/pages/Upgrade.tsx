import { RunningNumber } from '@/components/ui/RunningNumber';
import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Zap,
  Info,
  Check,
  Minus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import { supabase } from "@/lib/supabase";
import { PricingCards } from "@/components/PricingCards";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";

export default function Upgrade() {
  const navigate = useNavigate();
  const { setSubscription } = useTrading();

  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite">(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam && ["starter", "pro", "elite"].includes(planParam)) {
      return planParam as "starter" | "pro" | "elite";
    }
    return "pro";
  });

  const selectedPlanLabel = selectedPlan === 'starter' ? 'Free' : selectedPlan === 'pro' ? 'Pro' : 'Elite';
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const activePlan = localStorage.getItem('tradifive_cached_plan') || 'starter';

  const finalizeConnection = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ subscription_status: selectedPlan, plan_type: selectedPlan })
          .eq('id', user.id);
        // Also cache locally so settings page reads it immediately
        localStorage.setItem('tradifive_selected_plan', selectedPlan);
        localStorage.setItem('tradifive_cached_plan', selectedPlan);
        const limits = { starter: 20, pro: 100, elite: 350, institutional: 1000 };
        const newMax = limits[selectedPlan as keyof typeof limits] || 20;
        localStorage.setItem(`tradifive_ai_credits_${user.id}`, String(newMax));
        window.dispatchEvent(new Event('tradifive_profile_update'));

        if (selectedPlan !== 'starter') {
          try {
            await supabase.from('billing_history').insert({
              user_id: user.id,
              plan: selectedPlan,
              amount: selectedPlan === 'pro' ? 1399 : 2799,
              currency: 'INR',
              status: 'paid',
              created_at: new Date().toISOString(),
              period_start: new Date().toISOString(),
              period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          } catch (e) {
            console.warn("Could not insert billing history:", e);
          }
        }
      }
      setSubscription(selectedPlan as any, selectedPlan === "starter" ? "demo" : "real");
      toast.success(`${selectedPlanLabel} Plan activated!`, {
        description: selectedPlan === 'elite'
          ? 'Go to Settings → Creator Account to enable Creator Mode.'
          : 'Your new plan is active.',
      });
      setShowPaymentModal(false);
      navigate(selectedPlan === 'elite' ? '/settings?tab=creator' : '/settings?tab=subscription');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Razorpay Standard Web Checkout Integration
  const handlePayment = async () => {
    if (selectedPlan === 'starter') {
      await finalizeConnection();
      return;
    }

    const price = selectedPlan === 'pro' ? 1399 : 2799;
    const amountInPaise = price * 100;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await initiateRazorpayCheckout({
        amount: amountInPaise,
        currency: 'INR',
        name: 'TradiFive',
        description: `${selectedPlanLabel} Plan Subscription`,
        receipt: `upg_${selectedPlan}_${Date.now()}`,
        notes: {
          plan: selectedPlan,
          userId: user?.id || 'guest',
        },
        prefill: {
          email: user?.email || undefined,
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || undefined,
        },
        onSuccess: async () => {
          await finalizeConnection();
        },
        onError: () => {
          setIsProcessing(false);
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to start payment.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0C0E] font-sans overflow-x-hidden overflow-y-auto no-scrollbar relative flex flex-col items-center pt-12 pb-32">
      {/* BACK BUTTON */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-[50]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#161618] hover:bg-slate-50 dark:hover:bg-[#1E1E22] border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-200 transition-all text-xs font-bold shadow-sm"
        >
          <X size={15} />
          Back
        </button>
      </div>

      {/* Header section */}
      <div className="text-center mb-12 relative z-10 max-w-2xl px-4 mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
          Transparent & Simple Pricing
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Predictable plans for serious traders
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Switch, upgrade or downgrade anytime. Zero setup fees. Instant activation with secure Razorpay checkout.
        </p>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6">
        <PricingCards
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
          onUpgradeClick={(plan) => {
            setSelectedPlan(plan);
            setShowPaymentModal(true);
          }}
          onDowngradeClick={(plan) => {
            setSelectedPlan(plan);
            setShowPaymentModal(true);
          }}
          isStandalone={true}
          activePlan={activePlan}
          showCheckoutBar={false}
        />

        {/* Compare Plans Section */}
        <div className="max-w-5xl mx-auto mt-16 mb-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compare Plan Features</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed feature breakdown across all membership tiers</p>
          </div>

          <div className="space-y-6">
            {[
              {
                category: "Broker & Journal Core",
                features: [
                  { name: "Live MT5 Broker Sync", starter: "0 (Manual & CSV)", pro: "1 Account", elite: "Up to 3 Accounts" },
                  { name: "Trading Journal & Calendar", starter: "Basic", pro: "Full + Screenshots", elite: "Full + AI Strategy Grading" },
                  { name: "PDF Statement Exports", starter: false, pro: true, elite: true },
                  { name: "AI Auto-Trade", tooltip: "AI-assisted automated execution (Coming Soon).", starter: false, pro: false, elite: "Coming Soon" },
                ]
              },
              {
                category: "AI & Intelligence",
                features: [
                  { name: "AI Coach Credits", starter: "5/day", pro: "50/day", elite: "150/day" },
                  { name: "AI Trade Feedback", starter: "Basic Q&A", pro: "Live trade review", elite: "Weekly Deep Psychology" },
                ]
              },
              {
                category: "Risk Management & Alerts",
                features: [
                  { name: "Risk Guard Protection", starter: "Basic loss alert", pro: "Revenge Shield & Cooldown", elite: "Full Kill-Switch & News Lock" },
                  { name: "Real-Time Alerts", starter: false, pro: "In-app & Push", elite: "Instant Telegram & WhatsApp" },
                ]
              },
              {
                category: "Home Feed, Channels & Privacy",
                features: [
                  { name: "Home Feed Posts & Watchlist", starter: "1 post/day · 3 pairs", pro: "Unlimited + Layout Edit", elite: "Unlimited + Priority Boost" },
                  { name: "Channels Creation", starter: "1 Public Channel", pro: "Up to 3 Private/Public", elite: "Unlimited VIP & Paid" },
                  { name: "Balance Hiding (Privacy Mode)", starter: false, pro: true, elite: true },
                  { name: "Trading Competitions", starter: false, pro: "1/month", elite: "2/month (2x XP)" },
                ]
              },
              {
                category: "Elite Mentorship & Referrals",
                features: [
                  { name: "Mentor account monitoring", starter: false, pro: false, elite: true },
                  { name: "Verified Badge & Workspace", starter: false, pro: false, elite: true },
                  { name: "Refer & Earn Commission", starter: true, pro: true, elite: true },
                  { name: "Customer Support", starter: "Community", pro: "Priority Support", elite: "24/7 VIP Dedicated" },
                ]
              }
            ].map((section, idx) => (
              <div key={idx} className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                      <th className="py-3.5 px-6 text-sm font-bold text-slate-900 dark:text-white w-[40%]">{section.category}</th>
                      <th className="py-3.5 px-6 text-sm font-bold text-slate-900 dark:text-white text-center w-[20%]">Standard</th>
                      <th className="py-3.5 px-6 text-sm font-bold text-indigo-600 dark:text-indigo-400 text-center w-[20%]">Pro</th>
                      <th className="py-3.5 px-6 text-sm font-bold text-purple-600 dark:text-purple-400 text-center w-[20%]">Elite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {section.features.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="py-3.5 px-6 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                          {row.name}
                          {row.tooltip && (
                            <span className="group relative inline-block ml-2">
                              <Info size={13} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help inline align-middle" />
                              <span className="absolute bottom-full left-0 mb-2 hidden w-max max-w-[220px] bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl group-hover:block z-50 text-center font-normal">
                                {row.tooltip}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {typeof row.starter === 'boolean' ? (
                            row.starter ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                <Check size={13} strokeWidth={3} />
                              </div>
                            ) : (
                              <Minus size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{row.starter}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {typeof row.pro === 'boolean' ? (
                            row.pro ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                <Check size={13} strokeWidth={3} />
                              </div>
                            ) : (
                              <Minus size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{row.pro}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {typeof row.elite === 'boolean' ? (
                            row.elite ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                <Check size={13} strokeWidth={3} />
                              </div>
                            ) : (
                              <Minus size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{row.elite}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment confirmation modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowPaymentModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
            >
              <button
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors disabled:opacity-50"
                disabled={isProcessing}
              >
                <X size={16} />
              </button>

              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                  <Shield size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedPlan === 'starter' ? 'Downgrade to Free' : `Upgrade to ${selectedPlanLabel}`}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {selectedPlan === 'starter'
                    ? 'Confirm switching your account back to the Free tier.'
                    : `You are subscribing to the ${selectedPlanLabel} membership.`}
                </p>
                {selectedPlan !== 'starter' && (
                  <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm font-bold">
                    <RunningNumber value={selectedPlan === 'pro' ? 1399 : 2799} prefix="₹" /> <span className="text-xs text-slate-500">/ month</span>
                  </div>
                )}
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Opening Checkout...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    {selectedPlan === 'starter'
                      ? 'Confirm Free Plan'
                      : `Pay ₹${selectedPlan === 'pro' ? '1,399' : '2,799'} with Razorpay`}
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed flex items-center justify-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Secured by Razorpay Standard Checkout · 256-bit SSL
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
