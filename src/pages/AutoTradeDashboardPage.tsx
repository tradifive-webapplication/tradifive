import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AITradingDashboard from "@/components/AITradingDashboard";
import { useNavigate } from "react-router-dom";

export default function AutoTradeDashboardPage() {
  const navigate = useNavigate();
  
  // Hardcoded for now until connected to backend
  const algo = { name: "SafeGuard AI", risk: "Low Risk", deposit: 500 };
  const mt5Account = "8492018";

  return (
    <DashboardLayout>
      <div className="max-w-none mx-auto w-full font-sans select-none px-2 md:px-6">
        <AITradingDashboard 
          onBack={() => navigate('/auto-trade/setup')} 
          algo={algo} 
          mt5Account={mt5Account} 
        />
      </div>
    </DashboardLayout>
  );
}
