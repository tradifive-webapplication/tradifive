import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AITradingDashboard from "@/components/AITradingDashboard";
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

        // If user has NO connected MT5 account and NO activation key, their setup was revoked or never done!
        if (!userAcc && !userProfile?.activation_key) {
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

        // Active account found for this user!
        if (isMounted) {
          const accNumber = userAcc?.account_number ? String(userAcc.account_number).replace(/\D/g, '') : "";
          const depVal = Number(userAcc?.balance || 500);

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
        <AITradingDashboard 
          onBack={() => navigate('/auto-trade/setup')} 
          algo={{ name: accountData.algoName, risk: accountData.risk, deposit: accountData.deposit }} 
          mt5Account={accountData.mt5Account} 
        />
      </div>
    </DashboardLayout>
  );
}
