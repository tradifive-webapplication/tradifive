import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Receipt, Wallet, ArrowUpRight, TrendingUp, TrendingDown, Clock, 
  CheckCircle2, AlertCircle, RefreshCw, Filter, ShieldCheck, Download, 
  ChevronRight, Calendar, ArrowRight, Info, Coins, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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

// Signature Tradifive box styling tokens matching AI Journal, RiskGuard, and AutoTrade
const kpiBoxStyle = "rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-4 sm:p-5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] transition-all flex flex-col justify-between";
const cardBoxStyle = "rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-5 sm:p-6 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[22px]";

export default function WeeklySettlements() {
  const [userId, setUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState<string>("26139980");
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
  const [viewCurrency, setViewCurrency] = useState<string>(() => {
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
      const currentUid = session?.user?.id || "demo-trader";
      setUserId(currentUid);

      if (session?.user) {
        setUserProfile(session.user);
      }

      const connectedAcc = localStorage.getItem("tradifive_connected_mt5_account") || "26139980";
      setAccountNumber(connectedAcc);

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

  const handlePaymentSuccess = (receiptNumber: string) => {
    loadSettlementData();
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Weekly Profit Settlement" }]}>
      <div className="w-full pb-16 font-sans text-slate-800 dark:text-slate-200">
        
        {/* Top Header & Telemetry Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Receipt size={18} />
              </div>
              <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                Weekly Profit Settlement
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 shrink-0">
                50/50 Profit Split
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-slate-400 mt-1">
              Transparent, audited weekly performance settlements. Zero deductions from your MT5 broker account.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={() => loadSettlementData(true)}
              disabled={isRefreshing}
              className="w-[36px] h-[36px] rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Settlements"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
            </button>

            {/* Account Binding Indicator */}
            <div className="h-[36px] px-3.5 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center gap-2 select-none text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                MT5 #{accountNumber ? `••••${accountNumber.slice(-4)}` : "••••9980"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 1. TOP 4 SUMMARY CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
          {/* Card 1: Total Trading Profit */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Trading Profit
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                +{curr}{summary.totalTradingProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-2 truncate">
                Verified closed profit across {summary.settledCount + (currentSettlement ? 1 : 0)} cycles
              </p>
            </div>
          </div>

          {/* Card 2: Tradifive Share (50%) */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Tradifive Share (50%)
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                {curr}{summary.tradifiveShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-2 truncate">
                Total agreed performance platform fee
              </p>
            </div>
          </div>

          {/* Card 3: Your Share (50%) */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Your Share (50%)
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                +{curr}{summary.yourShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 truncate">
                100% credited & retained in your MT5
              </p>
            </div>
          </div>

          {/* Card 4: Pending Payment */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Pending Payment
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                summary.pendingPayment > 0 ? "bg-amber-50 dark:bg-amber-500/10" : "bg-slate-100 dark:bg-white/5"
              }`}>
                <Clock className={`w-4 h-4 ${summary.pendingPayment > 0 ? "text-amber-600" : "text-slate-400"}`} />
              </div>
            </div>
            <div>
              <h3 className={`text-[22px] font-bold tracking-tight leading-none ${
                summary.pendingPayment > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
              }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {curr}{summary.pendingPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center justify-between mt-2 pt-0.5">
                <span className="text-[11px] font-medium text-slate-400 truncate">
                  {summary.overdueCount > 0 ? `${summary.overdueCount} Overdue cycle` : "All dues current"}
                </span>
                {summary.pendingPayment > 0 && currentSettlement && (
                  <button
                    onClick={() => handleOpenPayment(currentSettlement)}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Pay Now</span>
                    <ArrowRight size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. CURRENT ACTIVE SETTLEMENT CARD ── */}
        {currentSettlement && (
          <div className={`${cardBoxStyle} mb-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Current Settlement Cycle: {currentSettlement.week_label}
                  </h2>
                  <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    currentSettlement.status === "paid"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : currentSettlement.status === "overdue"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                      : currentSettlement.status === "loss_week"
                      ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                  }`}>
                    {currentSettlement.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  Settlement ID: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{currentSettlement.settlement_number}</span> • Bound MT5 #{currentSettlement.mt5_account_number ? `••••${currentSettlement.mt5_account_number.slice(-4)}` : "••••9980"} • Exness Broker Server
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => downloadSettlementInvoicePdf(currentSettlement, userProfile)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download size={13} />
                  <span>Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDetails(currentSettlement)}
                  className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Financial Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
              <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Starting Balance</span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-white block mt-0.5">
                  {curr}{currentSettlement.starting_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ending Balance</span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-white block mt-0.5">
                  {curr}{currentSettlement.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Gross Realised</span>
                <span className="text-[13px] font-bold text-emerald-600 block mt-0.5">
                  +{curr}{currentSettlement.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Trading Costs & Swaps</span>
                <span className="text-[13px] font-bold text-slate-500 block mt-0.5">
                  -{curr}{(currentSettlement.commissions + currentSettlement.swaps).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Loss Carry-Forward</span>
                <span className="text-[13px] font-bold text-slate-500 block mt-0.5">
                  -{curr}{currentSettlement.previous_loss_carried.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-[16px] bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Net Realised Profit</span>
                <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  +{curr}{currentSettlement.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Prominent Calculation Explanation Box (Requested in Section 3) */}
            <div className="p-4 sm:p-5 rounded-[20px] border-2 border-white bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white dark:bg-none dark:bg-[#151D2A] shadow-[0_4px_10px_-5px_rgba(37,99,235,0.1),0_0_0_2px_#DBEAFE] dark:border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-blue-600" /> Prominent Calculation Breakdown
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Audited 50/50 Formula</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10.5px]">Eligible net profit:</span>
                    <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                      {curr}{currentSettlement.eligible_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10.5px]">Customer share:</span>
                    <span className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">
                      +{curr}{currentSettlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10.5px]">Tradifive share:</span>
                    <span className="text-[15px] font-bold text-blue-600 dark:text-blue-400">
                      {curr}{currentSettlement.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10.5px]">Amount payable:</span>
                    <span className="text-[16px] font-extrabold text-blue-700 dark:text-blue-300">
                      {curr}{currentSettlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  <b>How this was calculated:</b> Only verified closed trades are included. Floating positions, deposits, and capital transfers are 100% excluded. If the net trading result was negative, loss is carried forward and zero fee is due.
                </p>
              </div>

              {/* Direct Pay CTA */}
              <div className="flex flex-col gap-2 shrink-0 self-start md:self-center">
                {currentSettlement.status === "pending" || currentSettlement.status === "overdue" ? (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(currentSettlement)}
                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowUpRight size={15} />
                    <span>Pay Now ({curr}{currentSettlement.amount_payable.toFixed(0)})</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Cycle Cleared & Verified</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 text-center font-medium">
                  Payment Due: {new Date(currentSettlement.payment_deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. WEEKLY SETTLEMENT HISTORY ── */}
        <div className={cardBoxStyle}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                Weekly Settlement History
              </h2>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Chronological ledger of verified weekly profit sharing cycles and payment clearance receipts.
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatusFilter === f.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10.5px] uppercase tracking-wider">
                  <th className="py-3 font-bold">Week</th>
                  <th className="py-3 font-bold text-right">Net Profit</th>
                  <th className="py-3 font-bold text-right">Tradifive Share</th>
                  <th className="py-3 font-bold text-right">Customer Share</th>
                  <th className="py-3 font-bold text-center">Payment Status</th>
                  <th className="py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No settlements found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((s) => {
                    const isPaid = s.status === "paid" || s.status === "approved";
                    const isPending = s.status === "pending";
                    const isOverdue = s.status === "overdue";
                    const isLoss = s.status === "loss_week";

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{s.week_label}</div>
                          <div className="text-[10.5px] font-mono text-slate-400">{s.settlement_number}</div>
                        </td>

                        <td className="py-3.5 text-right font-bold">
                          <span className={s.net_realised_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {s.net_realised_profit >= 0 ? "+" : ""}{curr}{s.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="py-3.5 text-right font-bold text-blue-600 dark:text-blue-400">
                          {isLoss ? "—" : `${curr}${s.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>

                        <td className="py-3.5 text-right font-bold text-slate-800 dark:text-white">
                          {isLoss ? "—" : `+${curr}${s.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>

                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : isOverdue
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                              : isLoss
                              ? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                          }`}>
                            {s.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            View
                          </button>

                          {(isPending || isOverdue) && (
                            <button
                              type="button"
                              onClick={() => handleOpenPayment(s)}
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
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

          {/* Mobile Stacked Card View (Requested in Section 11) */}
          <div className="md:hidden space-y-3">
            {filteredSettlements.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
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
                    className="p-4 rounded-[18px] border-2 border-white bg-slate-50/70 dark:bg-white/5 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {s.week_label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {s.settlement_number}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : isOverdue
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                          : isLoss
                          ? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                      }`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 dark:border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Net Profit</span>
                        <span className={`font-bold ${s.net_realised_profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {s.net_realised_profit >= 0 ? "+" : ""}{curr}{s.net_realised_profit.toFixed(0)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Your 50%</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          +{curr}{s.customer_share.toFixed(0)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Tradifive 50%</span>
                        <span className="font-bold text-blue-600">
                          {curr}{s.tradifive_share.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(s)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 text-xs font-semibold"
                      >
                        Details
                      </button>

                      {(isPending || isOverdue) && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(s)}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs"
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
      </div>
    </DashboardLayout>
  );
}
