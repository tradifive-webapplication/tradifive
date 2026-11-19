import { toast } from "sonner";

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayCheckoutOptions {
  /**
   * Amount in paise (100 paise = 1 INR). Minimum is 100 paise.
   */
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: RazorpayPrefill;
  theme?: {
    color?: string;
  };
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay Standard Web Checkout:
 * 1. Calls /api/create-order to create order ID
 * 2. Opens Razorpay modal with order ID
 * 3. On success, calls /api/verify-payment to verify HMAC signature
 */
export const initiateRazorpayCheckout = async (options: RazorpayCheckoutOptions) => {
  const loadingToast = toast.loading("Initializing secure payment session...");

  try {
    // 1. Ensure Razorpay script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
    }

    const key_id = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key_id) {
      throw new Error("Razorpay Key ID (VITE_RAZORPAY_KEY_ID) is missing from environment.");
    }

    const amountInPaise = Math.round(options.amount);
    if (amountInPaise < 100) {
      throw new Error("Minimum payment amount is 100 paise (₹1.00).");
    }

    // 2. Call backend order creation endpoint
    const orderRes = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: (options.currency || "INR").toUpperCase(),
        receipt: options.receipt,
        notes: options.notes,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.order_id) {
      throw new Error(orderData.error || "Failed to create payment order");
    }

    toast.dismiss(loadingToast);

    // 3. Open Razorpay standard checkout modal
    const rzpOptions = {
      key: key_id,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: options.name || "TradiFive",
      description: options.description || "Subscription Upgrade",
      image: options.image || "/favicon-cropped.png",
      order_id: orderData.order_id,
      prefill: options.prefill || {},
      theme: {
        color: options.theme?.color || "#4f46e5",
      },
      notes: options.notes || {},
      modal: {
        ondismiss: () => {
          toast.info("Payment session dismissed.");
          options.onDismiss?.();
        },
        escape: true,
        backdropclose: false,
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        const verifyToast = toast.loading("Verifying payment security signature...");
        try {
          // 4. Verify payment signature on backend
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed: Signature mismatch");
          }

          toast.success("Payment verified successfully!", { id: verifyToast });
          if (options.onSuccess) {
            await options.onSuccess(response);
          }
        } catch (verifyErr: any) {
          console.error("Payment verification failure:", verifyErr);
          toast.error(verifyErr.message || "Payment verification failed", { id: verifyToast });
          options.onError?.(verifyErr);
        }
      },
    };

    const razorpayInstance = new (window as any).Razorpay(rzpOptions);

    razorpayInstance.on("payment.failed", (failRes: any) => {
      console.error("Payment failure response:", failRes.error);
      toast.error(failRes.error?.description || "Payment failed. Please try again.");
      options.onError?.(failRes.error);
    });

    razorpayInstance.open();
  } catch (error: any) {
    console.error("Checkout error:", error);
    toast.error(error.message || "Something went wrong initiating checkout.", { id: loadingToast });
    options.onError?.(error);
  }
};
