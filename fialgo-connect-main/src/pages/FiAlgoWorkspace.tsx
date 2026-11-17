import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FiAlgoAdminDashboard from "@/components/FiAlgoAdminDashboard";
import AutoTradeModernDashboard from "@/components/AutoTradeModernDashboard";
import { ArrowLeft, Monitor, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkUserAutoTradeAccess } from "@/utils/autoTradeAccess";

interface FiAlgoWorkspaceProps {
  defaultTab?: string;
}

export default function FiAlgoWorkspace({ defaultTab }: FiAlgoWorkspaceProps) {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeMt5Account, setActiveMt5Account] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      setIsVerifying(true);
      const access = await checkUserAutoTradeAccess();

      if (!isMounted) return;

      if (!access.hasAccess) {
        // User has not completed setup / not yet approved by Admin -> redirect to setup wizard
        navigate("/auto-trade/setup", { replace: true });
      } else {
        setHasAccess(true);
        setActiveMt5Account(access.mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "Connected");
        setIsVerifying(false);
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const [viewMode, setViewMode] = useState<"overview" | "terminal">(
    defaultTab === "autotrade" ? "terminal" : "overview"
  );

  if (isVerifying) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Checking FiAlgo Account Setup...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return null;
  }

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
            mt5Account={activeMt5Account}
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
