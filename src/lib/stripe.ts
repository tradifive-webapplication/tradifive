import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const handleStripeCheckout = async (planId: string, price: number, name: string) => {
  const loadingToast = toast.loading("Securely connecting to Stripe...");
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to upgrade.", { id: loadingToast });
      return;
    }

    const response = await supabase.functions.invoke('create-checkout-session', {
      body: { planId, price, name }
    });

    console.log("Edge Function Response Data:", response.data);

    if (response.error || response.data?.error) {
      const errorMsg = response.error?.message || response.data?.error || "Failed to create checkout session";
      console.error("Checkout Error:", errorMsg);
      throw new Error(errorMsg);
    }

    const { url } = response.data;
    
    if (url) {
      toast.success("Redirecting to secure checkout...", { id: loadingToast });
      window.location.href = url;
    } else {
      throw new Error("No checkout URL returned from Stripe");
    }
  } catch (error: any) {
    console.error("Checkout Exception:", error);
    toast.error(error.message || "Something went wrong. Please try again.", { id: loadingToast });
  }
};
