import { useState } from "react";
import { GripVertical, ShieldCheck, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import JournalMetrics from "@/components/journal/JournalMetrics";
import JournalGrid from "@/components/journal/JournalGrid";
import JournalTradesTable from "@/components/journal/JournalTradesTable";
import TradeSlideOver from "@/components/journal/TradeSlideOver";
import JournalSettingsBar from "@/components/journal/JournalSettingsBar";
import { JournalSettingsProvider } from "@/contexts/JournalSettingsContext";
import { formatUTCDate, formatHoldDuration } from "@/utils/tradeUtils";
import { ChartRadarDefault } from "@/components/journal/ChartRadarDefault";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { useMarket } from "@/contexts/MarketContext";
import { toast } from "sonner";

export default function Journal() {
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const { isConnected } = useDashboardData();
  const { activeMarket } = useMarket();

  // --- SEBI Indian Market Daily Login State ---
  const [dailyTokenActive, setDailyTokenActive] = useState(() => {
    try {
      const token = sessionStorage.getItem('indian_daily_token');
      return token === 'active';
    } catch(e) { return false; }
  });


  return (
    <JournalSettingsProvider>
      <DashboardLayout>
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12">

          {/* Demo Mode Banner */}
          {!isConnected && activeMarket !== 'indian' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-gradient-to-b from-[#FFFBEB] to-[#FFFDF5] border-2 border-white rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#FDE68A] dark:bg-none dark:bg-[#1E1912] dark:border-[1px] dark:border-amber-500/30 dark:shadow-[inset_0_1px_1px_rgba(251,191,36,0.05)] p-3.5 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300 leading-tight">
                    You're viewing demo data
                  </p>
                  <p className="text-[11.5px] sm:text-[12px] text-amber-700/70 dark:text-slate-300 mt-0.5 leading-snug">
                    Connect your real broker account to see live trades, P&amp;L and risk metrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings?tab=trading')}
                className="w-full sm:w-auto justify-center text-[12.5px] sm:text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] py-2 px-4 rounded-xl shadow-md cursor-pointer shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 2px 10px rgba(245,158,11,0.3)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Connect Real Account
              </button>
            </motion.div>
          )}

          {/* SEBI Compliance Banner for Indian Market */}
          {activeMarket === 'indian' && !dailyTokenActive && (
             <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-gradient-to-b from-[#EFF6FF] to-[#F8FAFC] border-2 border-white rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#BFDBFE] dark:bg-none dark:bg-[#1A2332] dark:border-[1px] dark:border-blue-500/30 dark:shadow-[inset_0_1px_1px_rgba(59,130,246,0.05)] p-3.5 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
             >
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                   </div>
                   <div>
                      <p className="text-[13px] font-semibold text-blue-900 dark:text-blue-300 leading-tight">
                         SEBI Compliance: Daily Login Required
                      </p>
                      <p className="text-[11.5px] sm:text-[12px] text-blue-800/70 dark:text-slate-300 mt-0.5 leading-snug">
                         To pull live trades into your journal, you must authorize your Indian broker for today's session.
                      </p>
                   </div>
                </div>
                <button
                   onClick={() => {
                      toast.success("Broker API Authorized for Today", {
                         description: "Live syncing active until 3:30 PM market close.",
                         icon: <ShieldCheck className="text-emerald-500" />
                      });
                      setDailyTokenActive(true);
                      sessionStorage.setItem('indian_daily_token', 'active');
                   }}
                   className="w-full sm:w-auto justify-center text-[12.5px] sm:text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] py-2 px-4 rounded-xl shadow-md cursor-pointer shrink-0"
                   style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
                   }}
                >
                   <Key size={14} />
                   Connect for Today
                </button>
             </motion.div>
          )}

          {/* Metrics Row — always fixed at top */}
          <JournalMetrics
            isEditMode={isEditMode}
            onEditToggle={() => setIsEditMode(v => !v)}
          />

          {/* Edit mode hint banner */}
          <AnimatePresence>
            {isEditMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl text-[12px] font-semibold text-blue-700 dark:text-slate-300">
                  <GripVertical size={14} />
                  Drag any box or the calendar to reorder your journal layout. Click <strong className="text-blue-800 dark:text-blue-400">Done</strong> when finished.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draggable Grid */}
          <JournalGrid isEditMode={isEditMode} />

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChartRadarDefault />
          </div>

          {/* 📊 Premium Live Trades & Positions Table */}
          <JournalTradesTable onTradeClick={(trade) => {
            const mapped = {
              id: Number(trade.ticket || 0) || trade.id,
              asset: trade.symbol,
              direction: trade.trade_type === 0 || String(trade.trade_type).toUpperCase().includes("BUY") ? "BUY" as const : "SELL" as const,
              pnl: Number(trade.profit),
              entryTime: formatUTCDate(trade.opened_at || trade.created_at),
              exitTime: trade.closed_at ? formatUTCDate(trade.closed_at) : "Open",
              entryPrice: Number(trade.open_price || trade.entry_price || 0),
              exitPrice: Number(trade.close_price || trade.exit_price || 0),
              stopLoss: trade.stop_loss ? Number(trade.stop_loss) : undefined,
              takeProfit: trade.take_profit ? Number(trade.take_profit) : undefined,
              setups: trade.tags || (trade.setup ? [trade.setup] : []),
              mistakes: [],
              notes: trade.notes || "",
              holdDuration: formatHoldDuration(trade.opened_at || trade.created_at, trade.closed_at),
              rawTrade: trade
            };
            setSelectedTrade(mapped);
            setIsSlideOverOpen(true);
          }} />

        </div>

        {/* Trade Slide-Over */}
        <TradeSlideOver
          trade={selectedTrade}
          isOpen={isSlideOverOpen}
          onClose={() => setIsSlideOverOpen(false)}
        />
      </DashboardLayout>
    </JournalSettingsProvider>
  );
}
