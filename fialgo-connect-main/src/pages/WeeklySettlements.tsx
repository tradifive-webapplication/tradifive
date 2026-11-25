import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const SETTLEMENT_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const settlementContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const settlementCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.44, ease: SETTLEMENT_EXPO_OUT },
  },
};
import { 
  Receipt, Wallet, ArrowUpRight, TrendingUp, TrendingDown, Clock, 
  CheckCircle2, AlertCircle, RefreshCw, Filter, ShieldCheck, Download, 
  ChevronRight, Calendar, ArrowRight, Info, Coins, ShieldAlert,
  Lock, Sparkles, Zap, Activity
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getSystemSetting } from "@/lib/systemSettings";
import { 
  Settlement, 
  CustomerSettlementSummary, 
  SettlementStatus 
} from "@/types/settlement";
import { 
  getCustomerSettlements 
} from "@/services/settlementService";
import SettlementDetailsModal from "@/components/settlements/SettlementDetailsModal";
import SettlementPaymentModal from "@/components/settlements/SettlementPaymentModal";
import { downloadSettlementInvoicePdf } from "@/utils/settlementPdf";

export default function WeeklySettlements() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [isLifetimePlan, setIsLifetimePlan] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        if (localStorage.getItem("tradifive_is_lifetime_plan") === "true") return true;
        const tier = localStorage.getItem("tradifive_payment_tier") || localStorage.getItem("tradifive_selected_tier");
        if (tier === "three_years" || tier === "lifetime") return true;
        const req = localStorage.getItem("tradifive_payment_request");
        if (req) {
          const p = JSON.parse(req);
          if (p.plan_tier === "three_years" || p.amount === "100000" || Number(p.amount) === 100000) return true;
        }
      }
    } catch (e) {}
    return false;
  });
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState<CustomerSettlementSummary>({
    totalTradingProfit: 0,
    tradifiveShare: 0,
    yourShare: 0,
    pendingPayment: 0,
    lossCarryForward: 0,
    settledCount: 0,
    overdueCount: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  
  // Modals state
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payingSettlement, setPayingSettlement] = useState<Settlement | null>(null);

  // Currency preference (USC / INR)
  const [viewCurrency] = useState<string>(() => {
    try {
      return localStorage.getItem("tradifive_view_currency") || "INR";
    } catch (e) {
      return "INR";
    }
  });

  const curr = viewCurrency === "USC" ? "USC " : "₹";

  const loadSettlementData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUid = session?.user?.id || "";
      setUserId(currentUid);

      if (session?.user) {
        setUserProfile(session.user);
      }

      const connectedAcc = localStorage.getItem("tradifive_connected_mt5_account") || "";
      setAccountNumber(connectedAcc);

      // Verify lifetime exemption status
      let isLt = false;
      if (localStorage.getItem("tradifive_is_lifetime_plan") === "true") {
        isLt = true;
      } else {
        try {
          const payments = await getSystemSetting<any[]>("license_payment_requests");
          if (Array.isArray(payments)) {
            const hasLt = payments.some((p: any) => 
              (p.user_id === currentUid || (connectedAcc && p.mt5_account_number === connectedAcc)) &&
              (p.plan_tier === "three_years" || p.amount === "100000" || Number(p.amount) === 100000 || (p.plan_name && p.plan_name.includes("3-Year")))
            );
            if (hasLt) isLt = true;
          }
          if (!isLt) {
            const adminRecords = await getSystemSetting<any[]>("auto_trade_admin_records");
            if (Array.isArray(adminRecords)) {
              const rec = adminRecords.find((r: any) => 
                r.user_id === currentUid || (connectedAcc && (r.mt5_account_number === connectedAcc || r.bound_account === connectedAcc))
              );
              if (rec && (rec.tier?.includes("three_years") || rec.tier?.includes("100000") || rec.tier?.includes("Lifetime") || rec.plan_tier === "three_years")) {
                isLt = true;
              }
            }
          }
        } catch (err) {
          console.warn("Error checking lifetime plan:", err);
        }
      }

      if (isLt) {
        setIsLifetimePlan(true);
        try {
          localStorage.setItem("tradifive_is_lifetime_plan", "true");
          window.dispatchEvent(new Event("tradifive_tier_update"));
        } catch (e) {}
      }

      const result = await getCustomerSettlements(currentUid, connectedAcc);
      setSettlements(result.settlements);
      setSummary(result.summary);
      if (isManual) {
        toast.success("Weekly settlements refreshed from live clearing engine.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch settlement data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSettlementData();
  }, []);

  // Filtered settlements list
  const filteredSettlements = useMemo(() => {
    if (selectedStatusFilter === "all") return settlements;
    if (selectedStatusFilter === "paid") {
      return settlements.filter(s => s.status === "paid" || s.status === "approved");
    }
    if (selectedStatusFilter === "pending") {
      return settlements.filter(s => s.status === "pending");
    }
    if (selectedStatusFilter === "overdue") {
      return settlements.filter(s => s.status === "overdue");
    }
    if (selectedStatusFilter === "loss_week") {
      return settlements.filter(s => s.status === "loss_week");
    }
    return settlements;
  }, [settlements, selectedStatusFilter]);

  // Current Active Settlement cycle (first in list)
  const currentSettlement = settlements[0] || null;

  const handleOpenDetails = (s: Settlement) => {
    setSelectedSettlement(s);
    setShowDetailsModal(true);
  };

  const handleOpenPayment = (s: Settlement) => {
    setPayingSettlement(s);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    loadSettlementData();
  };

  if (isLifetimePlan) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-20 select-none px-4 sm:px-6 md:px-8 py-4 max-w-[1400px] mx-auto w-full">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm"
              >
                <Lock size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                    Weekly Profit Settlement
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-500" />
                    Locked · 0% Profit Share
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5">
                  Institutional Lifetime Exemption · Zero Platform Deductions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="h-9 px-3.5 bg-white dark:bg-[#1E1E1E] border border-slate-200/70 dark:border-white/5 rounded-xl shadow-xs flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>MT5 #{accountNumber ? accountNumber : "36946803"}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  loadSettlementData(true);
                  toast.success("Telemetry and institutional standing verified.");
                }}
                disabled={isRefreshing}
                className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E1E] dark:hover:bg-white/[0.05] border border-slate-200/70 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin text-slate-900 dark:text-white" : "text-slate-400"} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Institutional Exemption Hero Card */}
          <div className="relative overflow-hidden rounded-[18px] border border-emerald-200/80 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 dark:from-emerald-950/20 dark:via-[#141416] dark:to-[#0D0D0E] p-6 sm:p-8 shadow-sm">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        ₹1,00,000 Institutional Lifetime Plan
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        100% Profits Yours
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                      Weekly Settlements Locked & Exempt
                    </h2>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold self-start md:self-auto">
                  <Lock size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Platform Profit Share: 0.00%</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-300 leading-relaxed max-w-4xl">
                Your MT5 trading account is active under the <strong className="text-slate-900 dark:text-white font-semibold">Tradifive ₹1,00,000 Lifetime Plan</strong>. Because your license was acquired with full upfront enterprise clearance, you retain <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">100% of all algorithmic trading profits</strong>. You are completely exempt from weekly 50/50 profit clearance invoices, profit splits, and settlement remittances.
              </p>

              {/* 3 Pillar Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white dark:bg-[#1A1A1D]/80 border border-slate-200/70 dark:border-white/5 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 dark:text-neutral-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Trading Profit Split</span>
                    <Sparkles size={14} className="text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                    100% Client
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 leading-normal">
                    0% platform cut. All gains remain directly inside your broker wallet.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1A1A1D]/80 border border-slate-200/70 dark:border-white/5 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 dark:text-neutral-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Settlement Dues</span>
                    <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                    ₹0.00 / Zero
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 leading-normal">
                    Account is in permanent good standing. No invoices will be generated.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1A1A1D]/80 border border-slate-200/70 dark:border-white/5 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 dark:text-neutral-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Broker Integration</span>
                    <Zap size={14} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400">
                    Direct MT5
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 leading-normal">
                    Zero lockups. Withdrawals processed normally via broker portal.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/70 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => navigate("/auto-trade/dashboard")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Activity size={14} />
                  <span>Open FiAlgo Modern Dashboard</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/auto-trade/history")}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#1E1E22] dark:hover:bg-white/[0.06] border border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-neutral-200 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Receipt size={14} className="text-slate-400 dark:text-neutral-400" />
                  <span>Audit MT5 Order History</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/auto-trade/license")}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#1E1E22] dark:hover:bg-white/[0.06] border border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-neutral-200 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-slate-400 dark:text-neutral-400" />
                  <span>License & Hardware Binding</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={settlementContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full"
      >
        
        {/* ── Top Header (Admin App Style: Dark, Clean, Sharp Borders, No Pill Badges) ── */}
        <motion.div variants={settlementCardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
              style={{ borderColor: "#3b82f620" }}
            >
              <Receipt size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                  Weekly Profit Settlement
                </h1>
              </div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.15em] mt-0.5">
                Transparent weekly performance settlements · Zero deductions from your MT5 account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 px-3 bg-white dark:bg-[#1E1E1E] border border-slate-200/70 dark:border-white/5 rounded-xl shadow-xs flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MT5 #{accountNumber ? `••••${accountNumber.slice(-4)}` : "Connected"}</span>
            </div>

            <button
              type="button"
              onClick={() => loadSettlementData(true)}
              disabled={isRefreshing}
              className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E1E] dark:hover:bg-white/[0.05] border border-slate-200/70 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Refresh Settlements"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-slate-900 dark:text-white" : "text-slate-400"} />
              <span>Sync</span>
            </button>
          </div>
        </motion.div>

        {/* ── 4 Metric Cards Grid (Consistent Dashboard Box Styling) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Trading Profit */}
          <motion.div variants={settlementCardVariants} className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none">
            <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${summary.totalTradingProfit > 0 ? "text-emerald-600 dark:text-emerald-400" : summary.totalTradingProfit < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
              <AnimatedNumber
                value={summary.totalTradingProfit}
                duration={900}
                format={(v) => `${v >= 0 ? "+" : ""}${curr}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              TOTAL TRADING PROFIT
            </div>
          </motion.div>

          {/* Card 2: Tradifive Share (50%) */}
          <motion.div variants={settlementCardVariants} className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
              <AnimatedNumber
                value={summary.tradifiveShare}
                duration={900}
                delay={60}
                format={(v) => `${curr}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              TRADIFIVE SHARE (50%)
            </div>
          </motion.div>

          {/* Card 3: Your Share (50%) */}
          <motion.div variants={settlementCardVariants} className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none">
            <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${summary.yourShare > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
              <AnimatedNumber
                value={summary.yourShare}
                duration={900}
                delay={120}
                format={(v) => `${v >= 0 ? "+" : ""}${curr}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              YOUR SHARE (50%)
            </div>
          </motion.div>

          {/* Card 4: Pending Payment */}
          <motion.div variants={settlementCardVariants} className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none">
            <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${summary.pendingPayment > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
              <AnimatedNumber
                value={summary.pendingPayment}
                duration={900}
                delay={180}
                format={(v) => `${curr}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              PENDING PAYMENT
            </div>
          </motion.div>
        </div>

        {/* ── 2. CURRENT ACTIVE SETTLEMENT CARD ── */}
        {currentSettlement && (
          <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-5 sm:p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Current Settlement Cycle: {currentSettlement.week_label}
                  </h2>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    currentSettlement.status === "paid" || currentSettlement.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : currentSettlement.status === "overdue"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : currentSettlement.status === "loss_week" || currentSettlement.status === "cleared"
                      ? "bg-white/5 text-neutral-400 border border-white/10"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {currentSettlement.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 mt-1">
                  Settlement ID: <span className="font-bold text-neutral-300">{currentSettlement.settlement_number}</span> · Bound MT5 #{currentSettlement.mt5_account_number ? `••••${currentSettlement.mt5_account_number.slice(-4)}` : "Connected"} · Exness Broker Server
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => downloadSettlementInvoicePdf(currentSettlement, userProfile)}
                  className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={12} />
                  <span>Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDetails(currentSettlement)}
                  className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Financial Parameters Grid (Clean Monospace Tiles) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Starting Balance</span>
                <span className="font-bold text-white block">
                  {curr}{currentSettlement.starting_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Ending Balance</span>
                <span className="font-bold text-white block">
                  {curr}{currentSettlement.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Gross Realised</span>
                <span className="font-bold text-emerald-400 block">
                  +{curr}{currentSettlement.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Trading Costs</span>
                <span className="font-bold text-neutral-400 block">
                  -{curr}{(currentSettlement.commissions + currentSettlement.swaps).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Loss Carry-Forward</span>
                <span className="font-bold text-neutral-400 block">
                  -{curr}{currentSettlement.previous_loss_carried.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Net Realised Profit</span>
                <span className="font-bold text-emerald-400 block">
                  +{curr}{currentSettlement.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Prominent Calculation Explanation Box (Clean Admin Strip) */}
            <div className="p-4 rounded-lg bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                    Calculation Breakdown (50/50 Audited Formula)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">Eligible net profit:</span>
                    <span className="text-sm font-bold text-white">
                      {curr}{currentSettlement.eligible_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">Customer share:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      +{curr}{currentSettlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">Tradifive share:</span>
                    <span className="text-sm font-bold text-blue-400">
                      {curr}{currentSettlement.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">Amount payable:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {curr}{currentSettlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400 leading-relaxed font-sans pt-1">
                  Only verified closed trades are included. Floating positions and capital deposits are 100% excluded. If the net trading result was negative, loss is carried forward and zero fee is due.
                </p>
              </div>

              {/* Direct Pay CTA */}
              <div className="flex flex-col gap-1.5 shrink-0 self-start md:self-center">
                {(currentSettlement.status === "pending" || currentSettlement.status === "overdue") && currentSettlement.amount_payable > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(currentSettlement)}
                    className="btn-fialgo-primary h-9 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowUpRight size={13} />
                    <span>Pay Now ({curr}{currentSettlement.amount_payable.toFixed(0)})</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>{currentSettlement.amount_payable === 0 ? "No Dues (0.00) ✓" : "Cycle Cleared"}</span>
                  </div>
                )}
                <span className="text-[9px] text-neutral-500 text-center font-mono">
                  Due: {new Date(currentSettlement.payment_deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. WEEKLY SETTLEMENT HISTORY ── */}
        <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-5 sm:p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/5">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly Settlement History
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Chronological ledger of verified weekly profit sharing cycles and payment clearance receipts
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {[
                { id: "all", label: "All Settlements" },
                { id: "paid", label: "Paid" },
                { id: "pending", label: "Pending" },
                { id: "overdue", label: "Overdue" },
                { id: "loss_week", label: "Loss Weeks" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                    selectedStatusFilter === f.id
                      ? "bg-slate-900 text-white dark:bg-white/10 dark:text-white border border-slate-900 dark:border-white/15 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white border border-transparent"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-black/20">
                  <th className="p-3">WEEK</th>
                  <th className="p-3 text-right">NET PROFIT</th>
                  <th className="p-3 text-right">TRADIFIVE SHARE</th>
                  <th className="p-3 text-right">CUSTOMER SHARE</th>
                  <th className="p-3 text-center">PAYMENT STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-xs">
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                      No settlements found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((s) => {
                    const isPaid = s.status === "paid" || s.status === "approved";
                    const isPending = s.status === "pending";
                    const isOverdue = s.status === "overdue";
                    const isLoss = s.status === "loss_week" || s.status === "cleared";

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">{s.week_label}</div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">{s.settlement_number}</div>
                        </td>

                        <td className="p-3 text-right font-bold">
                          <span className={s.net_realised_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {s.net_realised_profit >= 0 ? "+" : ""}{curr}{s.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {isLoss ? "—" : `${curr}${s.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>

                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {isLoss ? "—" : `+${curr}${s.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>

                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isOverdue
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : isLoss 
                              ? "bg-white/5 text-neutral-400 border border-white/10"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {s.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(s)}
                            className="h-7 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {(isPending || isOverdue) && (
                            <button
                              type="button"
                              onClick={() => handleOpenPayment(s)}
                              className="btn-fialgo-primary h-7 px-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden space-y-2.5">
            {filteredSettlements.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-xs font-mono">
                No settlements found for this filter.
              </div>
            ) : (
              filteredSettlements.map((s) => {
                const isPaid = s.status === "paid" || s.status === "approved";
                const isPending = s.status === "pending";
                const isOverdue = s.status === "overdue";
                const isLoss = s.status === "loss_week";

                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block font-sans">
                          {s.week_label}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {s.settlement_number}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isPaid
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isOverdue
                          ? "bg-rose-500/10 text-rose-400"
                          : isLoss 
                          ? "bg-white/5 text-neutral-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-xs">
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Net Profit</span>
                        <span className={`font-bold ${s.net_realised_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {s.net_realised_profit >= 0 ? "+" : ""}{curr}{s.net_realised_profit.toFixed(0)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Your 50%</span>
                        <span className="font-bold text-white">
                          +{curr}{s.customer_share.toFixed(0)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Tradifive 50%</span>
                        <span className="font-bold text-blue-400">
                          {curr}{s.tradifive_share.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(s)}
                        className="h-7 px-3 rounded bg-black/40 border border-white/10 text-xs font-bold text-neutral-300"
                      >
                        Details
                      </button>

                      {(isPending || isOverdue) && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(s)}
                          className="btn-fialgo-primary h-7 px-3 text-xs font-bold uppercase tracking-wider"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modals */}
        <SettlementDetailsModal
          settlement={selectedSettlement}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onPayNow={(s) => {
            setShowDetailsModal(false);
            handleOpenPayment(s);
          }}
          userProfile={userProfile}
        />

        <SettlementPaymentModal
          settlement={payingSettlement}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          userId={userId}
        />
      </motion.div>
    </DashboardLayout>
  );
}
