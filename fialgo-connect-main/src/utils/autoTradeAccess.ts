import { supabase } from "@/lib/supabase";
import { getSystemSetting } from "@/lib/systemSettings";

export interface AutoTradeAccessResult {
  hasAccess: boolean;
  mt5Account?: string;
  isVerified: boolean;
  hasPaid: boolean;
  proofStatus: "none" | "pending" | "approved" | "rejected";
  paymentStatus: "none" | "pending" | "approved" | "rejected";
}

/**
 * Validates whether the logged in user has completed the FiAlgo AutoTrade setup
 * and has been verified & approved by an administrator in Supabase.
 *
 * A user is considered to have access ONLY if:
 * 1. They have an active/connected record in public.mt5_accounts, OR
 * 2. They have an activation_key assigned in public.profiles, OR
 * 3. An admin has verified them in auto_trade_admin_records (system_settings), OR
 * 4. Both their IB proof and License payment requests have been marked 'approved' by admin.
 */
export async function checkUserAutoTradeAccess(userId?: string): Promise<AutoTradeAccessResult> {
  try {
    let resolvedUserId = userId;
    let resolvedEmail = "";

    if (!resolvedUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        localStorage.removeItem("tradifive_auto_trade_setup");
        return {
          hasAccess: false,
          isVerified: false,
          hasPaid: false,
          proofStatus: "none",
          paymentStatus: "none"
        };
      }
      resolvedUserId = session.user.id;
      resolvedEmail = session.user.email || "";
    }

    // 1. Check active/connected account in mt5_accounts
    const { data: userAcc } = await supabase
      .from("mt5_accounts")
      .select("account_number, is_active, is_connected")
      .eq("user_id", resolvedUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isMt5Active = Boolean(userAcc && (userAcc.is_active || userAcc.is_connected));
    const mt5AccNumber = userAcc?.account_number ? String(userAcc.account_number).replace(/\D/g, "") : undefined;

    // 2. Check activation key in profiles
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("activation_key")
      .eq("id", resolvedUserId)
      .maybeSingle();

    const hasActivationKey = Boolean(userProfile?.activation_key && userProfile.activation_key.trim().length > 5);

    // 3. Check auto_trade_admin_records
    let adminRecordVerified = false;
    try {
      const adminSettings = await getSystemSetting<any>("auto_trade_admin_records");

      if (adminSettings && typeof adminSettings === "object") {
        const recordsList = Object.values(adminSettings) as any[];
        const matched = recordsList.find(
          (r) =>
            (r.user_id === resolvedUserId || (resolvedEmail && r.user_email === resolvedEmail)) &&
            (r.is_under_tradifive === true || r.ib_status === "verified")
        );
        if (matched) adminRecordVerified = true;
      }
    } catch (_) {}

    // 4. Check ib_transfer_requests status
    let proofStatus: "none" | "pending" | "approved" | "rejected" = "none";
    try {
      const proofSettings = await getSystemSetting<any[]>("ib_transfer_requests");

      if (proofSettings && Array.isArray(proofSettings)) {
        const matchedProof = proofSettings.find(
          (r: any) => r.user_id === resolvedUserId || (resolvedEmail && r.user_email === resolvedEmail)
        );
        if (matchedProof?.status) {
          proofStatus = matchedProof.status;
        }
      }
    } catch (_) {}

    // 5. Check license_payment_requests status
    let paymentStatus: "none" | "pending" | "approved" | "rejected" = "none";
    try {
      const paySettings = await getSystemSetting<any[]>("license_payment_requests");

      if (paySettings && Array.isArray(paySettings)) {
        const matchedPay = paySettings.find(
          (r: any) => r.user_id === resolvedUserId || (resolvedEmail && r.user_email === resolvedEmail)
        );
        if (matchedPay?.status) {
          paymentStatus = matchedPay.status;
        }
      }
    } catch (_) {}

    const isVerified = isMt5Active || adminRecordVerified || proofStatus === "approved";
    const hasPaid = hasActivationKey || paymentStatus === "approved";

    // Access to live dashboard is granted ONLY if verified AND paid/activated
    const hasAccess = isMt5Active || hasActivationKey || adminRecordVerified || (proofStatus === "approved" && paymentStatus === "approved");

    if (hasAccess) {
      localStorage.setItem("tradifive_auto_trade_setup", "true");
      if (mt5AccNumber) {
        localStorage.setItem("tradifive_connected_mt5_account", mt5AccNumber);
      }
    } else {
      localStorage.removeItem("tradifive_auto_trade_setup");
    }

    window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));

    return {
      hasAccess,
      mt5Account: mt5AccNumber,
      isVerified,
      hasPaid,
      proofStatus,
      paymentStatus,
    };
  } catch (err) {
    console.error("Error checking auto trade access:", err);
    localStorage.removeItem("tradifive_auto_trade_setup");
    return {
      hasAccess: false,
      isVerified: false,
      hasPaid: false,
      proofStatus: "none",
      paymentStatus: "none",
    };
  }
}
