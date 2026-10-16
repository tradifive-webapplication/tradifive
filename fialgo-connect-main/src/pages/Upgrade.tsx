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
import { toast } from "sonner";

export default function Upgrade() {
  const navigate = useNavigate();
  const { setSubscription } = useTrading();

  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "elite" | "enterprise">(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam && ["starter", "pro", "elite"].includes(planParam)) {
      return planParam as "starter" | "pro" | "elite";
    }
    return "pro";
  });
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
        window.dispatchEvent(new Event('tradifive_profile_update'));
      }
      setSubscription(selectedPlan as any, selectedPlan === "starter" ? "demo" : "real");
      toast.success(`${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan activated!`, {
        description: selectedPlan === 'elite'
          ? 'Go to Settings → Creator Account to enable Creator Mode.'
          : 'Your new plan is live.',
      });
      navigate(selectedPlan === 'elite' ? '/settings?tab=creator' : '/settings?tab=subscription');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment bypassed — will integrate Razorpay later
  const handlePayment = async () => {
    await finalizeConnection();
  };

  return (
    <div className="h-screen bg-[#050505] font-sans overflow-x-hidden overflow-y-auto no-scrollbar relative flex flex-col items-center pt-24 pb-48">
      {/* Background gradients similar to Landing page */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* BACK BUTTON */}
      <div className="absolute top-8 right-8 z-[50]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 hover:text-white transition-all text-[12px] font-bold shadow-md"
        >
          <X size={16} />
          Back
        </button>
      </div>

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-[28px] md:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
          Stop Losing Trades.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Start Trading Like a Professional.</span>
        </h1>

      </div>

      <div className="relative z-10 w-full px-6">
        <PricingCards
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
          onUpgradeClick={(plan) => {
            setSelectedPlan(plan);
            setShowPaymentModal(true);
          }}
          isStandalone={true}
          activePlan={activePlan}
          showCheckoutBar={true}
        />

        {/* Compare Plans Section */}
        <div className="max-w-4xl mx-auto mt-12 mb-10">
          <div className="mb-6">
            <h2 className="text-[24px] font-bold text-[#e7e9ea]">Compare tiers & features</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                category: "Trading Core",
                features: [
                  { name: "Broker Connections", starter: "1", pro: "Up to 6", elite: "Unlimited", enterprise: "Custom" },
                  { name: "Executions/day", starter: "5/day", pro: "Unlimited", elite: "Unlimited", enterprise: "Custom limits" },
                  { name: "Trading Journal", starter: "Basic", pro: "Full + Calendar", elite: "Full + Analytics", enterprise: "Full + Analytics" },
                  { name: "Automated Trading", tooltip: "Automation assists execution. No guaranteed profits.", starter: false, pro: false, elite: "Coming Soon", enterprise: "Custom APIs" },
                ]
              },
              {
                category: "AI & Intelligence",
                features: [
                  { name: "AI Coach Credits", starter: "10/day", pro: "50/day", elite: "100/day", enterprise: "Custom pool" },
                  { name: "AI Trade Feedback", starter: "Post-trade score", pro: "Real-time feedback", elite: "Strategy-level analysis", enterprise: "Strategy-level analysis" },
                ]
              },
              {
                category: "Risk Management",
                features: [
                  { name: "Risk Guard", starter: "Core limits", pro: "Advanced controls", elite: "Strategy-level controls", enterprise: "Bespoke Kill-Switches" },
                  { name: "Revenge-trade Protection", starter: false, pro: true, elite: true, enterprise: true },
                ]
              },
              {
                category: "Community & Privacy",
                features: [
                  { name: "Trading Competitions", starter: false, pro: "1/month", elite: "2/month", enterprise: "Private pools" },
                  { name: "Balance Hiding (Privacy)", starter: false, pro: true, elite: true, enterprise: true },
                  { name: "Private Channels", starter: false, pro: true, elite: true, enterprise: true },
                ]
              },
              {
                category: "Elite Mentorship",
                features: [
                  { name: "Mentor account monitoring access", starter: false, pro: true, elite: true, enterprise: true },
                  { name: "Shared trading workspace", starter: false, pro: false, elite: true, enterprise: true },
                  { name: "Performance Reviews", starter: false, pro: false, elite: "Personalized", enterprise: "Dedicated Analyst" },
                  { name: "Support & Profile", starter: "Community", pro: "Priority", elite: "Premium + Badge", enterprise: "SLA / Account Manager" },
                ]
              }
            ].map((section, idx) => (
              <div key={idx} className="bg-[#16181c] rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="py-4 px-6 text-[15px] font-bold text-[#e7e9ea] w-[28%]">{section.category}</th>
                      <th className="py-4 px-6 text-[15px] font-bold text-[#e7e9ea] text-center w-[18%]">Starter</th>
                      <th className="py-4 px-6 text-[15px] font-bold text-[#e7e9ea] text-center w-[18%]">Pro</th>
                      <th className="py-4 px-6 text-[15px] font-bold text-[#e7e9ea] text-center w-[18%]">Elite</th>
                      <th className="py-4 px-6 text-[15px] font-bold text-[#e7e9ea] text-center w-[18%]">Enterprise</th>
                    </tr>
                    <tr>
                      <th colSpan={5} className="p-0">
                        <div className="h-[1px] w-[92%] mx-auto bg-gradient-to-r from-transparent via-[#2f3336] to-transparent"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.features.map((row, i) => (
                      <Fragment key={i}>
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-6 text-[14px] font-bold text-[#e7e9ea] flex items-center">
                            {row.name}
                            {row.tooltip && (
                              <span className="group relative inline-block ml-2">
                                <Info size={14} className="text-[#71767b] hover:text-[#e7e9ea] cursor-help inline align-text-bottom" />
                                <span className="absolute bottom-full left-0 mb-2 hidden w-max max-w-[220px] bg-slate-800 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl group-hover:block z-[9999] text-center font-normal">
                                  {row.tooltip}
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof row.starter === 'boolean'
                              ? (row.starter ? <Check size={18} strokeWidth={2.5} className="text-[#e7e9ea] mx-auto" /> : <X size={18} strokeWidth={2} className="text-[#71767b] mx-auto" />)
                              : <span className="text-[14px] font-medium text-[#e7e9ea]">{row.starter}</span>
                            }
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof row.pro === 'boolean'
                              ? (row.pro ? <Check size={18} strokeWidth={2.5} className="text-[#e7e9ea] mx-auto" /> : <X size={18} strokeWidth={2} className="text-[#71767b] mx-auto" />)
                              : <span className="text-[14px] font-medium text-[#e7e9ea]">{row.pro}</span>
                            }
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof row.elite === 'boolean'
                              ? (row.elite ? <Check size={18} strokeWidth={2.5} className="text-[#e7e9ea] mx-auto" /> : <X size={18} strokeWidth={2} className="text-[#71767b] mx-auto" />)
                              : <span className="text-[14px] font-medium text-[#e7e9ea]">{row.elite}</span>
                            }
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof row.enterprise === 'boolean'
                              ? (row.enterprise ? <Check size={18} strokeWidth={2.5} className="text-[#e7e9ea] mx-auto" /> : <X size={18} strokeWidth={2} className="text-[#71767b] mx-auto" />)
                              : <span className="text-[14px] font-medium text-[#e7e9ea]">{row.enterprise}</span>
                            }
                          </td>
                        </tr>
                        {i !== section.features.length - 1 && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="h-[1px] w-[92%] mx-auto bg-gradient-to-r from-transparent via-[#2f3336] to-transparent"></div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121214] border border-[#2B2B2F] rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors disabled:opacity-50"
                disabled={isProcessing}
              >
                <X size={16} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Initialize Connection</h3>
                <p className="text-[#B5BAC1] text-[13px]">
                  You are selecting the <span className="font-bold text-white capitalize">{selectedPlan}</span> protocol.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Activating...
                  </>
                ) : (
                  <><Zap size={16} /> Activate {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</>
                )}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                Payment integration coming soon · Plan activates instantly
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
