import { Bell } from "lucide-react";
import StatusPill from "@/components/StatusPill";
import HeroCard from "@/components/HeroCard";
import MasterButton from "@/components/MasterButton";
import Heatmap from "@/components/Heatmap";
import EquityChart from "@/components/EquityChart";
import DashboardLayout from "@/components/DashboardLayout";
import LivePanel from "@/components/LivePanel";
import TradesOverview from "@/components/TradesOverview";
import GetStartedChecklist from "@/components/GetStartedChecklist";
import { useTrading } from "@/contexts/TradingContext";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { isConnected } = useTrading();

  return (
    <DashboardLayout>
      <LivePanel />
      <div className="mr-[320px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8"
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, Trader</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusPill connected={isConnected} />
              <button className="relative rounded-xl p-2.5 glass">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </button>
            </div>
          </div>

          <TradesOverview />
          <GetStartedChecklist />
          <HeroCard />
          <MasterButton />
          <EquityChart />
          <Heatmap />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
