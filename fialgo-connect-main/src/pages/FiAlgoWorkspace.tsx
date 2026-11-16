import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FiAlgoAdminDashboard from "@/components/FiAlgoAdminDashboard";
import AutoTradeModernDashboard from "@/components/AutoTradeModernDashboard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Monitor } from "lucide-react";

interface FiAlgoWorkspaceProps {
  defaultTab?: string;
}

export default function FiAlgoWorkspace({ defaultTab }: FiAlgoWorkspaceProps) {
  const navigate = useNavigate();
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
        <div className="space-y-4 max-w-[1500px] mx-auto w-full font-sans select-none">
          {/* Header bar allowing return to overview */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-purple-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Auto Trade Engine Terminal
              </span>
            </div>
            <button
              onClick={() => setViewMode("overview")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-purple-700 transition-colors cursor-pointer"
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
