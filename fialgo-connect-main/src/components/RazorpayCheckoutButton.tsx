import React, { useState } from "react";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface RazorpayCheckoutButtonProps {
  /**
   * Amount in INR (Rupees). E.g., 499 for ₹499.
   * Converted internally to paise (* 100).
   */
  amount: number;
  currency?: string;
  planId?: string;
  planName?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amount,
  currency = "INR",
  planId,
  planName = "Pro Membership",
  description,
  buttonText,
  className,
  disabled = false,
  children,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || loading) return;

    setLoading(true);

    try {
      // Get current logged-in user profile if available to prefill
      let prefill: { name?: string; email?: string } = {};
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          prefill = {
            email: user.email || undefined,
            name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
          };
        }
      } catch (authErr) {
        // Auth is optional for prefill
      }

      const amountInPaise = Math.round(amount * 100);

      await initiateRazorpayCheckout({
        amount: amountInPaise,
        currency,
        name: "TradiFive",
        description: description || `Upgrade to ${planName}`,
        receipt: `rcpt_${planId || "sub"}_${Date.now()}`,
        notes: {
          planId: planId || "plan",
          planName: planName,
        },
        prefill,
        onSuccess: async (res) => {
          setLoading(false);
          if (onSuccess) {
            await onSuccess(res);
          }
        },
        onError: (err) => {
          setLoading(false);
          onError?.(err);
        },
        onDismiss: () => {
          setLoading(false);
          onDismiss?.();
        },
      });
    } catch (err) {
      setLoading(false);
      onError?.(err);
    }
  };

  if (children) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={className}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      }
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard size={16} />
          <span>{buttonText || `Pay ₹${amount} with Razorpay`}</span>
        </>
      )}
    </button>
  );
};

export default RazorpayCheckoutButton;
