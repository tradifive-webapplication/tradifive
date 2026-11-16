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

export default function WeeklySettlements() {
  const [userId, setUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
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

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full">
        
        {/* ── Top Header (Admin App Style: Dark, Clean, Sharp Borders, No Pill Badges) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
              style={{ borderColor: "#3b82f620" }}
            >
              <Receipt size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                  Weekly Profit Settlement
                </h1>
              </div>
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">
                Transparent weekly performance settlements · Zero deductions from your MT5 account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 px-3 bg-[#1E1E1E] border border-white/5 rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MT5 #{accountNumber ? `••••${accountNumber.slice(-4)}` : "Connected"}</span>
            </div>

            <button
              type="button"
              onClick={() => loadSettlementData(true)}
              disabled={isRefreshing}
              className="h-9 px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center gap-1.5 cursor-pointer"
              title="Refresh Settlements"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-white" : "text-neutral-400"} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* ── 4 Metric Cards Grid (Clean Admin App Style: No Cluttered Icon Circles or Corner Badges) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Trading Profit */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className={`text-2xl font-bold font-mono tracking-tight ${summary.totalTradingProfit > 0 ? "text-emerald-400" : summary.totalTradingProfit < 0 ? "text-rose-400" : "text-white"}`}>
              {summary.totalTradingProfit >= 0 ? "+" : ""}{curr}{summary.totalTradingProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              TOTAL TRADING PROFIT
            </div>
          </div>

          {/* Card 2: Tradifive Share (50%) */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {curr}{summary.tradifiveShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              TRADIFIVE SHARE (50%)
            </div>
          </div>

          {/* Card 3: Your Share (50%) */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className={`text-2xl font-bold font-mono tracking-tight ${summary.yourShare > 0 ? "text-emerald-400" : "text-white"}`}>
              {summary.yourShare >= 0 ? "+" : ""}{curr}{summary.yourShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              YOUR SHARE (50%)
            </div>
          </div>

          {/* Card 4: Pending Payment */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className={`text-2xl font-bold font-mono tracking-tight ${summary.pendingPayment > 0 ? "text-amber-400" : "text-white"}`}>
              {curr}{summary.pendingPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              PENDING PAYMENT
            </div>
          </div>
        </div>

        {/* ── 2. CURRENT ACTIVE SETTLEMENT CARD (Clean Admin Card) ── */}
        {currentSettlement && (
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
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
                  className="h-8 px-3 rounded-lg bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-neutral-300 transition-none cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={12} />
                  <span>Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDetails(currentSettlement)}
                  className="h-8 px-3 rounded-lg bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-neutral-300 transition-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Financial Parameters Grid (Clean Monospace Tiles) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Starting Balance</span>
                <span className="font-bold text-white block">
                  {curr}{currentSettlement.starting_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Ending Balance</span>
                <span className="font-bold text-white block">
                  {curr}{currentSettlement.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Gross Realised</span>
                <span className="font-bold text-emerald-400 block">
                  +{curr}{currentSettlement.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Trading Costs</span>
                <span className="font-bold text-neutral-400 block">
                  -{curr}{(currentSettlement.commissions + currentSettlement.swaps).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
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

        {/* ── 3. WEEKLY SETTLEMENT HISTORY (Admin Table Styling) ── */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Weekly Settlement History
              </h2>
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                Chronological ledger of verified weekly profit sharing cycles and payment clearance receipts
              </p>
            </div>

            {/* Filter Pills matching Admin App */}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-none cursor-pointer whitespace-nowrap ${
                    selectedStatusFilter === f.id
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-neutral-400 hover:text-white border border-transparent"
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
                <tr className="border-b border-white/5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-black/20">
                  <th className="p-3">WEEK</th>
                  <th className="p-3 text-right">NET PROFIT</th>
                  <th className="p-3 text-right">TRADIFIVE SHARE</th>
                  <th className="p-3 text-right">CUSTOMER SHARE</th>
                  <th className="p-3 text-center">PAYMENT STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
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
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-none">
                        <td className="p-3">
                          <div className="font-bold text-white font-sans text-xs">{s.week_label}</div>
                          <div className="text-[10px] font-mono text-neutral-500">{s.settlement_number}</div>
                        </td>

                        <td className="p-3 text-right font-bold">
                          <span className={s.net_realised_profit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                            {s.net_realised_profit >= 0 ? "+" : ""}{curr}{s.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="p-3 text-right font-bold text-blue-400">
                          {isLoss ? "—" : `${curr}${s.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>

                        <td className="p-3 text-right font-bold text-white">
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
                            className="h-7 px-3 rounded bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-neutral-300 transition-none cursor-pointer"
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
                    className="p-3.5 rounded-lg bg-black/30 border border-white/5 space-y-2 font-mono text-xs"
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
      </div>
    </DashboardLayout>
  );
}
