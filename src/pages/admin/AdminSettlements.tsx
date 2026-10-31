import React, { useState, useEffect, useMemo } from "react";
import { 
  Receipt, DollarSign, Clock, AlertTriangle, CheckCircle2, 
  Search, Filter, Download, ArrowUpRight, TrendingUp, 
  ShieldCheck, RefreshCw, Eye, Edit3, User, Check, AlertCircle, FileText
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Settlement, SettlementStatus } from "@/types/settlement";
import { 
  getAllSettlementsAdmin, 
  approveOfflinePayment, 
  calculateAndPersistWeeklySettlement 
} from "@/services/settlementService";
import { downloadSettlementInvoicePdf } from "@/utils/settlementPdf";
import SettlementDetailsModal from "@/components/settlements/SettlementDetailsModal";
import AdminSettlementAdjustModal from "@/components/admin/AdminSettlementAdjustModal";
import AdminCustomerSettlementProfileModal from "@/components/admin/AdminCustomerSettlementProfileModal";

export default function AdminSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const [adjustSettlement, setAdjustSettlement] = useState<Settlement | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);

  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Offline Payment manual verification prompt state
  const [verifyingSettlement, setVerifyingSettlement] = useState<Settlement | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState<string>("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAdminUser(session.user);
      }

      const list = await getAllSettlementsAdmin();
      setSettlements(list);
      if (isManual) {
        toast.success("Settlements refreshed from database ledger.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load settlements.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Searched settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      const matchesSearch = 
        s.settlement_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.mt5_account_number && s.mt5_account_number.includes(searchQuery)) ||
        s.week_label.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "paid") return s.status === "paid" || s.status === "approved";
      if (statusFilter === "pending") return s.status === "pending";
      if (statusFilter === "overdue") return s.status === "overdue";
      if (statusFilter === "loss_week") return s.status === "loss_week";

      return true;
    });
  }, [settlements, searchQuery, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalRealised = 0;
    let totalTradifiveCollected = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    settlements.forEach((s) => {
      totalRealised += s.net_realised_profit;
      if (s.status === "paid" || s.status === "approved") {
        totalTradifiveCollected += s.tradifive_share;
      }
      if (s.status === "pending") {
        pendingAmount += s.amount_payable;
        pendingCount++;
      }
      if (s.status === "overdue") {
        pendingAmount += s.amount_payable;
        overdueCount++;
      }
    });

    return {
      totalRealised,
      totalTradifiveCollected,
      pendingAmount,
      pendingCount,
      overdueCount
    };
  }, [settlements]);

  // Handler: Confirm offline payment
  const handleConfirmOfflinePayment = async () => {
    if (!verifyingSettlement) return;
    if (!paymentRefInput.trim()) {
      toast.error("Please enter a valid bank UTR, transaction ID, or payment reference.");
      return;
    }

    setIsVerifyingPayment(true);
    try {
      const res = await approveOfflinePayment(
        verifyingSettlement.id,
        paymentRefInput.trim(),
        adminUser?.id || "admin-system"
      );

      if (res.success) {
        toast.success(`Payment verified for ${verifyingSettlement.settlement_number}. Receipt generated.`);
        setVerifyingSettlement(null);
        setPaymentRefInput("");
        loadData();
      } else {
        toast.error(res.error || "Failed to verify offline payment.");
      }
    } catch (e: any) {
      toast.error(e.message || "Error verifying payment.");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Handler: Trigger new weekly cycle calculation
  const handleTriggerRecalculate = async () => {
    setIsRefreshing(true);
    try {
      const now = new Date();
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
      const res = await calculateAndPersistWeeklySettlement(
        "demo-trader",
        "26139980",
        oneWeekAgo.toISOString(),
        now.toISOString()
      );
      if (res) {
        toast.success("Triggered engine settlement calculation successfully.");
        loadData();
      }
    } catch (e: any) {
      toast.error("Engine calculation trigger error: " + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (settlements.length === 0) {
      toast.error("No settlement records to export.");
      return;
    }
    const headers = [
      "Settlement_Number", "Week", "User_ID", "MT5_Account", 
      "Starting_Balance", "Ending_Balance", "Gross_Profit", "Net_Profit", 
      "Tradifive_Share", "Customer_Share", "Amount_Payable", "Status"
    ];
    const rows = settlements.map(s => [
      s.settlement_number, s.week_label, s.user_id, s.mt5_account_number,
      s.starting_balance, s.ending_balance, s.gross_profit, s.net_realised_profit,
      s.tradifive_share, s.customer_share, s.amount_payable, s.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tradifive_settlements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Settlements exported to CSV.");
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Receipt size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Weekly Profit Settlements
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              50/50 Model Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise settlement management, offline clearance verification, high-water mark calculations, and audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleTriggerRecalculate}
            disabled={isRefreshing}
            className="h-9 px-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Run Engine Scan</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Realised Trading
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 tracking-tight">
            +₹{stats.totalRealised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">
            Closed positions across all connected MT5s
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tradifive Share Cleared
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            ₹{stats.totalTradifiveCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">
            Net collected 50% platform profit split
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Collections
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-amber-400 tracking-tight">
            ₹{stats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">
            {stats.pendingCount} cycles awaiting settlement
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overdue Settlements
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-400 tracking-tight">
            {stats.overdueCount} Cycles
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">
            Past grace period (require follow up)
          </p>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer, MT5, or cycle ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 [scrollbar-width:none]">
          {[
            { id: "all", label: "All Settlements" },
            { id: "pending", label: "Pending" },
            { id: "overdue", label: "Overdue" },
            { id: "paid", label: "Paid / Cleared" },
            { id: "loss_week", label: "Loss Weeks" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === f.id
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 text-[10.5px] uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Cycle & ID</th>
                <th className="py-3 px-4">Customer & MT5</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Tradifive (50%)</th>
                <th className="py-3 px-4 text-right">Amount Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No settlement records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((s) => {
                  const isPaid = s.status === "paid" || s.status === "approved";
                  const isPending = s.status === "pending";
                  const isOverdue = s.status === "overdue";
                  const isLoss = s.status === "loss_week";

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{s.week_label}</div>
                        <div className="text-[10.5px] font-mono text-slate-500">{s.settlement_number}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileUserId(s.user_id);
                              setShowProfileModal(true);
                            }}
                            className="font-semibold text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <User size={11} />
                            <span>{s.user_id.slice(0, 12)}...</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          MT5: #{s.mt5_account_number || "26139980"}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold">
                        <span className={s.net_realised_profit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {s.net_realised_profit >= 0 ? "+" : ""}₹{s.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-blue-400">
                        {isLoss ? "—" : `₹${s.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-white">
                        ₹{s.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isOverdue
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : isLoss
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {s.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5">
                        {/* View Breakdown */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSettlement(s);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="View Calculation Breakdown"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Download Invoice */}
                        <button
                          type="button"
                          onClick={() => downloadSettlementInvoicePdf(s)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Download Invoice PDF"
                        >
                          <FileText size={13} />
                        </button>

                        {/* Adjust Settlement with Audit */}
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustSettlement(s);
                            setShowAdjustModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                          title="Audit Adjustment"
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Mark offline payment */}
                        {(isPending || isOverdue) && (
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyingSettlement(s);
                              setPaymentRefInput("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                            title="Verify Offline Payment"
                          >
                            <Check size={11} />
                            <span>Mark Paid</span>
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
      </div>

      {/* Manual Offline Payment Approval Modal */}
      {verifyingSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Verify Offline Payment</h3>
                <p className="text-xs text-slate-400">
                  Settlement #{verifyingSettlement.settlement_number} • Payable: ₹{verifyingSettlement.amount_payable.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bank UTR / IMPS / Gateway Reference Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={paymentRefInput}
                onChange={(e) => setPaymentRefInput(e.target.value)}
                placeholder="E.g., UTR489102830192, TXID-TRC20-..."
                className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10.5px] text-slate-500 mt-1 block">
                This reference is permanently recorded on the client's official invoice receipt.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingSettlement(null)}
                disabled={isVerifyingPayment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOfflinePayment}
                disabled={isVerifyingPayment}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isVerifyingPayment ? "Confirming..." : "Approve & Mark Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Settlement Profile Modal */}
      {profileUserId && (
        <AdminCustomerSettlementProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setProfileUserId(null);
          }}
          userId={profileUserId}
          settlements={settlements}
        />
      )}

      {/* Settlement Details Breakdown Modal */}
      <SettlementDetailsModal
        settlement={selectedSettlement}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        isAdminView={true}
      />

      {/* Audit Adjustment Modal */}
      <AdminSettlementAdjustModal
        settlement={adjustSettlement}
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setAdjustSettlement(null);
        }}
        onSuccess={() => loadData()}
        adminId={adminUser?.id || "admin-system"}
      />
    </div>
  );
}
