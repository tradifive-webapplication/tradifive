import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gauge, Zap, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
  creditsMax: number;
}

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  priceUsd: string;
  badge?: string;
  popular?: boolean;
  description: string;
}

const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_50",
    name: "Starter Boost",
    credits: 50,
    priceInr: 99,
    priceUsd: "$1.20",
    description: "Ideal for quick trade reviews and setup queries",
  },
  {
    id: "pack_200",
    name: "Trader Pro Pack",
    credits: 200,
    priceInr: 249,
    priceUsd: "$2.99",
    popular: true,
    badge: "BEST VALUE",
    description: "Most popular for full-day active intraday mentoring",
  },
  {
    id: "pack_500",
    name: "Elite Power Pack",
    credits: 500,
    priceInr: 499,
    priceUsd: "$5.99",
    description: "Heavy charting, screenshot analysis & strategy tuning",
  },
];

export const PurchaseCreditsModal: React.FC<PurchaseCreditsModalProps> = ({
  isOpen,
  onClose,
  creditsRemaining,
  creditsMax,
}) => {
  const navigate = useNavigate();
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyCredits = async (pack: CreditPack) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentRemaining = creditsRemaining !== null ? creditsRemaining : 10;
      const currentMax = creditsMax !== null ? creditsMax : 10;
      const newRemaining = currentRemaining + pack.credits;
      const newMax = Math.max(currentMax, newRemaining);

      if (user) {
        await supabase
          .from("profiles")
          .update({
            ai_credits_remaining: newRemaining,
            ai_credits_max: newMax,
          })
          .eq("id", user.id);
      }

      localStorage.setItem("tradifive_ai_credits_remaining", String(newRemaining));
      localStorage.setItem("tradifive_ai_credits_max", String(newMax));

      window.dispatchEvent(
        new CustomEvent("tradifive_credits_updated", {
          detail: { creditsRemaining: newRemaining, creditsMax: newMax },
        })
      );

      toast.success(`Success! Added ${pack.credits} AI credits to your account.`);
      onClose();
    } catch (err: any) {
      console.error("Failed to add credits:", err);
      toast.error("Could not add credits. Please try again.");
    } finally {
      setPurchasingPackId(null);
    }
  };

  const handlePurchase = async (pack: CreditPack) => {
    setPurchasingPackId(pack.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (razorpayKey) {
        await initiateRazorpayCheckout({
          amount: pack.priceInr * 100,
          currency: "INR",
          name: "TradiFive AI",
          description: `${pack.name} — ${pack.credits} AI Credits`,
          prefill: {
            email: user?.email || undefined,
            name: user?.user_metadata?.full_name || undefined,
          },
          onSuccess: async () => {
            await handleApplyCredits(pack);
          },
          onError: () => {
            setPurchasingPackId(null);
          },
          onDismiss: () => {
            setPurchasingPackId(null);
          },
        });
      } else {
        await handleApplyCredits(pack);
      }
    } catch (err: any) {
      console.warn("Direct credit apply fallback:", err?.message);
      await handleApplyCredits(pack);
    }
  };

  const safeRemaining = creditsRemaining !== null ? creditsRemaining : 10;
  const safeMax = creditsMax > 0 ? creditsMax : 10;
  const remainingPercent = Math.min(100, Math.max(0, Math.round((safeRemaining / safeMax) * 100)));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative w-full max-w-[500px] bg-[#F1F3F6] dark:bg-[#111114] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Consistent Top Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#18181B] border-b border-slate-200/70 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full tactile-white-pill flex items-center justify-center text-slate-800 dark:text-white shrink-0 border border-slate-200/80 dark:border-white/10">
                <Gauge className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                  AI Credits & Top-Up
                </h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">
                  Recharge your credits for continuous AI coaching
                </p>
              </div>
            </div>

            {/* Circular Tactile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full tactile-white-pill flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content - Scrollable with uniform TradiFive cards */}
          <div className="p-4 sm:p-5 space-y-3.5 max-h-[82vh] overflow-y-auto">
            {/* Card 1: Current Balance Overview */}
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/80 dark:border-white/10 figma-card-shadow p-4 sm:p-5 transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Balance
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  Resets daily at 00:00 IST
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {safeRemaining}
                  </span>
                  <span className="text-[14px] font-semibold text-slate-400 dark:text-slate-400">
                    / {safeMax} remaining
                  </span>
                </div>

                <span className="tactile-white-pill text-[11px] font-bold px-3 py-1 rounded-full text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-xs">
                  {remainingPercent}% left
                </span>
              </div>

              {/* Smooth Sleek Progress Bar */}
              <div className="mt-3.5 w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-slate-900 via-slate-800 to-black dark:from-white dark:to-slate-200 rounded-full transition-all duration-500"
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                Instant Credit Booster Packs
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                No subscription needed
              </span>
            </div>

            {/* Cards 2, 3, 4: Consistent Booster Pack Cards with Tactile Black Pill Buttons */}
            <div className="space-y-2.5">
              {CREDIT_PACKS.map((pack) => {
                const isBusy = purchasingPackId === pack.id;
                return (
                  <div
                    key={pack.id}
                    className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/80 dark:border-white/10 figma-card-shadow hover:border-slate-300 dark:hover:border-white/25 p-4 sm:p-4.5 flex items-center justify-between gap-3 transition-all"
                  >
                    {/* Left: Pack info */}
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                          +{pack.credits} Credits
                        </span>
                        {pack.badge && (
                          <span className="px-2 py-0.5 text-[9.5px] font-black tracking-wider uppercase rounded-full bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs">
                            {pack.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {pack.description}
                      </p>
                    </div>

                    {/* Right: Price & Consistent Tactile Black Pill Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">
                          ₹{pack.priceInr}
                        </div>
                        <div className="text-[10.5px] text-slate-400 leading-tight">
                          {pack.priceUsd}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handlePurchase(pack)}
                        className="tactile-black-pill rounded-full px-4 sm:px-4.5 py-1.5 sm:py-2 text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        title={`Purchase ${pack.name}`}
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Buy</span>
                            <span className="text-[14px] font-bold leading-none -mt-0.5">+</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card 5: Need 250 daily credits every day? (Consistent TradiFive Card) */}
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/80 dark:border-white/10 figma-card-shadow hover:border-slate-300 dark:hover:border-white/25 p-4 sm:p-4.5 flex items-center justify-between gap-3 transition-all">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                    Need 250 daily credits every day?
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Upgrade to Pro or Elite for high daily limits and full automated bots
                </p>
              </div>

              {/* Consistent Tactile White Pill Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/upgrade");
                }}
                className="tactile-white-pill rounded-full px-4 py-1.5 sm:py-2 text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-slate-200/80 dark:border-white/10"
                title="View Membership Plans"
              >
                <span>Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
