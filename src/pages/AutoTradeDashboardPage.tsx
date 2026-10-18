import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AITradingDashboard from "@/components/AITradingDashboard";
import { useNavigate } from "react-router-dom";

export default function AutoTradeDashboardPage() {
  const navigate = useNavigate();
  
  const [accountData, setAccountData] = useState({
    algoName: "FiAlgo V1 (Gold Specialist)",
    risk: "Low Risk · Dynamic Basket",
    deposit: 500,
    mt5Account: "414460525"
  });

  useEffect(() => {
    try {
      const direct = localStorage.getItem("tradifive_connected_mt5_account");
      if (direct && direct.trim()) {
        setAccountData(prev => ({ ...prev, mt5Account: direct.trim() }));
        return;
      }
      const stored = localStorage.getItem("tradifive_ib_proof_request");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.mt5_account_number && !parsed.mt5_account_number.includes("See")) {
          setAccountData(prev => ({ ...prev, mt5Account: parsed.mt5_account_number.trim() }));
        }
      }
    } catch (e) {}
  }, []);

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
