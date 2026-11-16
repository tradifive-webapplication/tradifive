import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FiAlgoAdminDashboard from "@/components/FiAlgoAdminDashboard";
import AutoTradeModernDashboard from "@/components/AutoTradeModernDashboard";
import { ArrowLeft, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FiAlgoWorkspaceProps {
  defaultTab?: string;
}

export default function FiAlgoWorkspace({ defaultTab }: FiAlgoWorkspaceProps) {
  const navigate = useNavigate();

  // If user has not completed setup, immediately redirect to setup workflow
  useEffect(() => {
    const isSetup = typeof window !== "undefined" && localStorage.getItem("tradifive_auto_trade_setup") === "true";
    if (!isSetup) {
      navigate("/auto-trade/setup", { replace: true });
    }
  }, [navigate]);

  const [viewMode, setViewMode] = useState<"overview" | "terminal">(
    defaultTab === "autotrade" ? "terminal" : "overview"
  );

  const mt5Account =
    typeof window !== "undefined"
      ? localStorage.getItem("tradifive_connected_mt5_account") || "8841092"
      : "8841092";

  if (viewMode === "terminal") {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-[1500px] mx-auto w-full font-sans select-none text-[#E5E5E5]">
          {/* Header bar allowing return to overview */}
          <div className="flex items-center justify-between bg-[#1E1E1E] border border-white/5 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                Auto Trade Engine Terminal
              </span>
            </div>
            <button
              onClick={() => setViewMode("overview")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-purple-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to FiAlgo Overview Dashboard</span>
            </button>
          </div>

          <AutoTradeModernDashboard
            onBack={() => setViewMode("overview")}
            algo={{ name: "FiAlgo V1 (Gold Specialist)", risk: "Low Risk · Dynamic Basket", deposit: 0 }}
            mt5Account={mt5Account}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FiAlgoAdminDashboard onOpenFullTerminal={() => setViewMode("terminal")} />
    </DashboardLayout>
  );
}
