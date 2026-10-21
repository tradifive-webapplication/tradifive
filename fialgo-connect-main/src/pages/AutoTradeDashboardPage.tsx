import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AutoTradeModernDashboard from "@/components/AutoTradeModernDashboard";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AutoTradeDashboardPage() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  
  const [accountData, setAccountData] = useState({
    algoName: "FiAlgo V1 (Gold Specialist)",
    risk: "Low Risk · Dynamic Basket",
    deposit: 500,
    mt5Account: ""
  });

  useEffect(() => {
    let isMounted = true;

    async function verifyUserAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          navigate('/login');
          return;
        }

        const userId = session.user.id;

        // 1. Check if user has an active MT5 account in Supabase
        const { data: userAcc } = await supabase
          .from('mt5_accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 2. Check if user has an activation key in profiles
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('activation_key')
          .eq('id', userId)
          .maybeSingle();

        // 3. Fallback: Check auto_trade_admin_records in system_settings
        let adminRecVerified: any = null;
        try {
          const { data: adminSettings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('id', 'auto_trade_admin_records')
            .maybeSingle();
          if (adminSettings?.value && typeof adminSettings.value === 'object') {
            const recordsList = Object.values(adminSettings.value) as any[];
            adminRecVerified = recordsList.find(
              r => (r.user_id === userId || (session.user.email && r.user_email === session.user.email)) &&
                   (r.is_under_tradifive === true || r.ib_status === 'verified')
            );
          }
        } catch (e) {}

        // 4. Fallback: Check ib_transfer_requests in system_settings
        let proofApproved: any = null;
        try {
          const { data: proofSettings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('id', 'ib_transfer_requests')
            .maybeSingle();
          if (proofSettings?.value && Array.isArray(proofSettings.value)) {
            proofApproved = proofSettings.value.find(
              r => (r.user_id === userId || (session.user.email && r.user_email === session.user.email)) &&
                   r.status === 'approved'
            );
          }
        } catch (e) {}

        const hasAccess = !!userAcc || !!userProfile?.activation_key || !!adminRecVerified || !!proofApproved;

        // If user has NO connected MT5 account, NO activation key, and NO admin approval, redirect to setup
        if (!hasAccess) {
          // Clear stale credentials from local storage
          localStorage.removeItem("tradifive_auto_trade_setup");
          localStorage.removeItem("tradifive_connected_mt5_account");
          localStorage.removeItem("tradifive_ib_proof_request");
          localStorage.removeItem("tradifive_payment_request");
          localStorage.removeItem("tradifive_payment_status");
          window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));

          // Redirect to setup page so user can pay & connect
          navigate('/auto-trade/setup');
          return;
        }

        // Active account found or verified for this user!
        if (isMounted) {
          const accNumber = String(
            userAcc?.account_number ||
            adminRecVerified?.bound_account ||
            adminRecVerified?.mt5_account_number ||
            proofApproved?.mt5_account_number ||
            localStorage.getItem("tradifive_connected_mt5_account") ||
            ""
          ).replace(/\D/g, '');

          const depVal = Number(userAcc?.balance || adminRecVerified?.balance || 500);

          localStorage.setItem("tradifive_auto_trade_setup", "true");
          if (accNumber) {
            localStorage.setItem("tradifive_connected_mt5_account", accNumber);
          }
          if (userProfile?.activation_key || userAcc?.activation_key) {
            localStorage.setItem("tradifive_license_key", userProfile?.activation_key || userAcc?.activation_key || "");
          }
          window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));

          setAccountData(prev => ({
            ...prev,
            mt5Account: accNumber,
            deposit: depVal
          }));
          setIsVerifying(false);
        }
      } catch (err) {
        console.error("AutoTrade access check error:", err);
        if (isMounted) setIsVerifying(false);
      }
    }

    verifyUserAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (isVerifying) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Verifying AI Trading Access...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-none mx-auto w-full font-sans select-none px-2 md:px-6">
        <AutoTradeModernDashboard 
          onBack={() => navigate('/auto-trade/setup')} 
          algo={{ name: accountData.algoName, risk: accountData.risk, deposit: accountData.deposit }} 
          mt5Account={accountData.mt5Account} 
        />
      </div>
    </DashboardLayout>
  );
}
