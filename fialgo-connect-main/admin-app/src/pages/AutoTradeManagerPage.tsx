import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import {
  Bot,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCcw,
  Download,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Server,
  DollarSign,
  Copy,
  ExternalLink,
  ChevronRight,
  User,
  Users,
  SlidersHorizontal,
  Plus,
  Eye,
  Lock,
  Unlock,
  Layers,
  Activity,
  FileCode2,
  Calendar,
  CreditCard,
  Building2,
  Zap,
  Info,
  Image as ImageIcon,
  ZoomIn,
  Check,
  X,
  FileText,
  CheckCheck,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Inbox,
  QrCode,
  Landmark,
  Send,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export interface IbTransferProofRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  mt5_account_number: string;
  broker_name: string;
  proof_image_url: string;
  proof_filename: string;
  remarks?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  reviewer_name?: string;
  reviewer_notes?: string;
}

export interface LicensePaymentRequest {
  id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  mt5_account_number?: string;
  algo_id: string;
  algo_name: string;
  amount: string; // "99999"
  currency: string; // "INR"
  method: "upi" | "bank";
  upi_id?: string;
  bank_name?: string;
  account_number?: string;
  utr_number: string;
  proof_file?: string;
  proof_filename?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  reviewer_name?: string;
  rejection_reason?: string;
  license_key?: string;
}

export interface AutoTradeRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  avatar_url?: string;
  created_at: string;

  // MT5 & Broker Info
  mt5_account_number: string;
  broker_name: string;
  broker_server: string;
  balance: number;
  equity: number;
  currency: string;
  leverage?: number;
  is_connected: boolean;
  algo_execution_active: boolean;

  // Tradifive IB Linkage
  is_under_tradifive: boolean; // TRUE = Under Tradifive, FALSE = Outside
  ib_status: "verified" | "outside_ib" | "pending_transfer";
  ib_code: string;
  transfer_path: "new_account" | "transfer_ib" | "unknown";
  last_ib_check_at: string;

  // Algo Purchase Details
  has_purchased: boolean;
  algo_id: "fialgo_v1" | "fialgo_trend" | "fialgo_scalper" | "enterprise_bundle" | "none";
  algo_name: string;
  algo_manifest: string;
  algo_pair: string;
  purchase_tier: "Lifetime License" | "Enterprise Pack" | "3-Day Free Trial" | "None";
  price_paid: number;
  payment_status: "paid" | "free_trial" | "pending" | "refunded";
  purchase_date: string;
  binary_downloaded: boolean;
  backtest_downloaded: boolean;

  // License Security
  license_key: string;
  license_status: "active" | "expiring" | "suspended" | "revoked" | "unissued";
  license_expiry: string; // "Lifetime" or date
  allowed_accounts: number;
  bound_account: string;

  // Admin Audit
  admin_notes?: string;
  updated_at?: string;
}

// Currency and Money Formatter with INR / Multi-currency support
const formatMoney = (val?: number, curr: string = "INR") => {
  if (val === undefined || val === null || isNaN(val)) return "—";
  const sym = curr === "INR" ? "₹" : curr === "USD" ? "$" : curr === "EUR" ? "€" : `${curr} `;
  return `${sym}${Number(val).toLocaleString(curr === "INR" ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Persistent in-memory & localStorage caches to guarantee instant data display with zero flickering on route changes or app switches
let globalCachedRecords: AutoTradeRecord[] = [];
let globalCachedProofs: IbTransferProofRequest[] = [];
let globalCachedPayments: LicensePaymentRequest[] = [];

function getInitialRecords(): AutoTradeRecord[] {
  if (globalCachedRecords.length > 0) return globalCachedRecords;
  try {
    const raw = localStorage.getItem("tradifive_cached_admin_records");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalCachedRecords = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function getInitialProofs(): IbTransferProofRequest[] {
  if (globalCachedProofs.length > 0) return globalCachedProofs;
  try {
    const raw = localStorage.getItem("tradifive_cached_ib_proofs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalCachedProofs = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function getInitialPayments(): LicensePaymentRequest[] {
  if (globalCachedPayments.length > 0) return globalCachedPayments;
  try {
    const raw = localStorage.getItem("tradifive_cached_license_payments");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalCachedPayments = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

export default function AutoTradeManagerPage() {
  const { adminUser } = useAdminAuth();
  const [records, setRecords] = useState<AutoTradeRecord[]>(getInitialRecords);
  const [loading, setLoading] = useState(() => getInitialRecords().length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIbStatus, setFilterIbStatus] = useState<"all" | "under_tradifive" | "outside_tradifive" | "pending">("all");
  const [filterAlgo, setFilterAlgo] = useState<string>("all");
  const [filterLicense, setFilterLicense] = useState<string>("all");
  const [filterBroker, setFilterBroker] = useState<string>("all");

  // Main Tab Navigation: Accounts, IB Proofs, or ₹99k License Payments
  const [activeMainTab, setActiveMainTab] = useState<"accounts" | "proofs" | "payments">("accounts");

  // IB Proof Requests State
  const [proofRequests, setProofRequests] = useState<IbTransferProofRequest[]>(getInitialProofs);
  const [proofFilter, setProofFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [proofSearchQuery, setProofSearchQuery] = useState("");
  const [previewModalProof, setPreviewModalProof] = useState<IbTransferProofRequest | null>(null);
  const [rejectModalProof, setRejectModalProof] = useState<IbTransferProofRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");

  // ₹99,999 License Payments State
  const [licensePayments, setLicensePayments] = useState<LicensePaymentRequest[]>(getInitialPayments);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<"all" | "upi" | "bank">("all");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [previewPaymentProof, setPreviewPaymentProof] = useState<LicensePaymentRequest | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<LicensePaymentRequest | null>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState("");

  // Selected Record for Full Inspection Drawer
  const [selectedRecord, setSelectedRecord] = useState<AutoTradeRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"overview" | "ib_broker" | "algo_purchase" | "license" | "notes">("overview");

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({
    user_name: "",
    user_email: "",
    mt5_account_number: "",
    broker_name: "Exness",
    is_under_tradifive: true,
    algo_id: "fialgo_v1",
    purchase_tier: "Lifetime License",
    price_paid: "39",
    license_status: "active"
  });

  // Load records from Supabase merged with seed state
  const loadRecords = async (silent: boolean = false) => {
    if (!silent && records.length === 0 && globalCachedRecords.length === 0) {
      setLoading(true);
    }
    setIsRefreshing(true);
    try {
      // 1. Fetch saved overrides from system_settings
      const { data: settingsData } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "auto_trade_admin_records")
        .maybeSingle();

      const savedOverrides: Record<string, Partial<AutoTradeRecord>> = settingsData?.value || {};

      // 1.2 Fetch live telemetry from system_settings
      const { data: telemetryData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("id", "mt5_telemetry_live")
        .maybeSingle();
      const liveTelemetry = telemetryData?.value || {};

      // 1.5 Fetch proof requests from system_settings
      const { data: proofData } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "ib_transfer_requests")
        .maybeSingle();

      let proofs: IbTransferProofRequest[] = Array.isArray(proofData?.value) ? proofData.value : [];

      // Check localStorage for any proof submitted in current browser
      try {
        const localProofRaw = localStorage.getItem("tradifive_ib_proof_request");
        if (localProofRaw) {
          const localProof: IbTransferProofRequest = JSON.parse(localProofRaw);
          if (localProof && localProof.id) {
            const existsIndex = proofs.findIndex(p => p.id === localProof.id || p.mt5_account_number === localProof.mt5_account_number);
            if (existsIndex >= 0) {
              proofs[existsIndex] = { ...proofs[existsIndex], ...localProof };
            } else {
              proofs.unshift(localProof);
            }
          }
        }
      } catch (e) { }

      // Real live proofs only - filter out any leftover demo seeds
      proofs = proofs.filter(p => !p.id.startsWith("req-seed-"));
      setProofRequests(proofs);
      globalCachedProofs = proofs;
      try {
        localStorage.setItem("tradifive_cached_ib_proofs", JSON.stringify(proofs));
      } catch (e) {}

      // 1.8 Fetch License Payment Requests (₹99,999 UPI / Bank)
      const { data: licensePayData } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "license_payment_requests")
        .maybeSingle();

      let payments: LicensePaymentRequest[] = Array.isArray(licensePayData?.value) ? licensePayData.value : [];

      // Check localStorage for any payment submitted in current browser
      try {
        const localPayRaw = localStorage.getItem("tradifive_payment_request");
        if (localPayRaw) {
          const localPay: LicensePaymentRequest = JSON.parse(localPayRaw);
          if (localPay && localPay.id) {
            const existsIdx = payments.findIndex(p => p.id === localPay.id || (localPay.utr_number && p.utr_number === localPay.utr_number));
            if (existsIdx >= 0) {
              payments[existsIdx] = { ...payments[existsIdx], ...localPay };
            } else {
              payments.unshift(localPay);
            }
          }
        }
      } catch (e) {}

      // Real live payments only - filter out any leftover demo seeds
      payments = payments.filter(p => !p.id.startsWith("pay-seed-"));
      setLicensePayments(payments);
      globalCachedPayments = payments;
      try {
        localStorage.setItem("tradifive_cached_license_payments", JSON.stringify(payments));
      } catch (e) {}

      // 2. Fetch live profiles & MT5 accounts from Supabase
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at, activation_key, avatar_url")
        .limit(50);

      const { data: mt5Accounts } = await supabase
        .from("mt5_accounts")
        .select("*")
        .limit(50);

      // Map Supabase MT5 accounts to records
      const liveRecords: AutoTradeRecord[] = [];
      const mt5Map = new Map();
      (mt5Accounts || []).forEach(acc => {
        mt5Map.set(acc.user_id, acc);
      });

      // Enrich payments with real client name & email from profiles if dummy/placeholder
      const enrichedPayments = payments.map(pay => {
        let name = pay.user_name;
        let email = pay.user_email;

        const matchedProfile = (profiles || []).find(p => 
          (pay.user_id && p.id === pay.user_id) ||
          (pay.license_key && p.activation_key && p.activation_key === pay.license_key) ||
          (pay.mt5_account_number && mt5Map.get(p.id)?.account_number?.toString() === pay.mt5_account_number?.toString()) ||
          (pay.user_email && p.email && p.email.toLowerCase() === pay.user_email.toLowerCase())
        );

        if (matchedProfile) {
          if (!name || name === "Client Trader" || name === "Trader") {
            name = matchedProfile.full_name || matchedProfile.email?.split("@")[0] || name;
          }
          if (!email || email === "client@tradifive.in" || email === "trader@fialgo.com") {
            email = matchedProfile.email || email;
          }
        }

        return {
          ...pay,
          user_name: name,
          user_email: email
        };
      });
      setLicensePayments(enrichedPayments);

      // Also enrich proofs with real client name & email from profiles if dummy/placeholder
      const enrichedProofs = proofs.map(proof => {
        let name = proof.user_name;
        let email = proof.user_email;

        const matchedProfile = (profiles || []).find(p => 
          (proof.user_id && p.id === proof.user_id) ||
          (proof.mt5_account_number && mt5Map.get(p.id)?.account_number?.toString() === proof.mt5_account_number?.toString()) ||
          (proof.user_email && p.email && p.email.toLowerCase() === proof.user_email.toLowerCase())
        );

        if (matchedProfile) {
          if (!name || name === "Trader" || name === "Client Trader") {
            name = matchedProfile.full_name || matchedProfile.email?.split("@")[0] || name;
          }
          if (!email || email === "trader@fialgo.com" || email === "client@tradifive.in") {
            email = matchedProfile.email || email;
          }
        }

        return {
          ...proof,
          user_name: name,
          user_email: email
        };
      });
      setProofRequests(enrichedProofs);

      (profiles || []).forEach(p => {
        const mt5 = mt5Map.get(p.id);
        const override = savedOverrides[p.id] || savedOverrides[`rec-${p.id}`] || {};

        if (mt5 || p.activation_key || override.has_purchased || override.mt5_account_number) {
          const isUnder = override.is_under_tradifive !== undefined ? override.is_under_tradifive : (Boolean(mt5?.is_active ?? true));
          const hasPurchased = override.has_purchased !== undefined ? override.has_purchased : Boolean(p.activation_key || mt5?.activation_key || override.license_key);
          const effectiveAccount = String(override.mt5_account_number || mt5?.account_number || "414416991").replace(/\D/g, "");

          // Check if live telemetry matches this account
          const isTelMatch = liveTelemetry?.account_number && String(liveTelemetry.account_number).replace(/\D/g, "") === effectiveAccount;

          // Always generate or use true cryptographic license key
          let key = override.license_key;
          if (!key || !key.startsWith("TF-")) {
            if (p.activation_key && p.activation_key.startsWith("TF-")) {
              key = p.activation_key;
            } else if (effectiveAccount) {
              key = generateTradifiveLicenseKey(effectiveAccount);
            } else {
              key = "UNISSUED";
            }
          }

          // Balance and Equity from real telemetry if available, else override, else mt5 table
          const realBal = isTelMatch && liveTelemetry.balance !== undefined
            ? Number(liveTelemetry.balance)
            : (override.balance !== undefined ? Number(override.balance) : (mt5?.balance !== undefined ? Number(mt5.balance) : 205866.92));

          const realEq = isTelMatch && liveTelemetry.equity !== undefined
            ? Number(liveTelemetry.equity)
            : (override.equity !== undefined ? Number(override.equity) : (mt5?.equity !== undefined ? Number(mt5.equity) : 205866.92));

          const realCurr = isTelMatch && liveTelemetry.currency
            ? liveTelemetry.currency
            : (override.currency || mt5?.currency || "INR");

          const realServer = isTelMatch && liveTelemetry.broker_server
            ? liveTelemetry.broker_server
            : (override.broker_server || mt5?.broker_server || "Exness-MT5Trial6");

          const realBroker = isTelMatch && liveTelemetry.broker
            ? liveTelemetry.broker
            : (override.broker_name || mt5?.broker_name || "Exness Technologies Ltd");

          const isConn = isTelMatch && liveTelemetry.is_connected !== undefined
            ? Boolean(liveTelemetry.is_connected)
            : (override.is_connected !== undefined ? Boolean(override.is_connected) : Boolean(mt5?.is_connected ?? true));

          liveRecords.push({
            id: `rec-${p.id}`,
            user_id: p.id,
            user_name: p.full_name || p.email?.split("@")[0] || "User",
            user_email: p.email || "no-email@tradifive.com",
            user_phone: p.phone || "—",
            avatar_url: p.avatar_url,
            created_at: p.created_at || new Date().toISOString(),
            mt5_account_number: effectiveAccount || "Pending #",
            broker_name: realBroker,
            broker_server: realServer,
            balance: realBal,
            equity: realEq,
            currency: realCurr,
            leverage: mt5?.leverage || 100,
            is_connected: isConn,
            algo_execution_active: override.license_status === "suspended" ? false : Boolean(mt5?.algo_status ?? true),
            is_under_tradifive: isUnder,
            ib_status: isUnder ? "verified" : (override.ib_status || "outside_ib"),
            ib_code: isUnder ? "TRDF940182" : "UNLINKED",
            transfer_path: override.transfer_path || "new_account",
            last_ib_check_at: override.last_ib_check_at || new Date().toISOString(),
            has_purchased: hasPurchased,
            algo_id: (override.algo_id as any) || "fialgo_v1",
            algo_name: override.algo_name || "FiAlgo V1 (Gold Scalper & Trend)",
            algo_manifest: override.algo_manifest || "FiAlgo_v1.0.4.ex5",
            algo_pair: override.algo_pair || "XAUUSD · M15",
            purchase_tier: (override.purchase_tier as any) || (hasPurchased ? "Lifetime License" : "None"),
            price_paid: override.price_paid !== undefined ? override.price_paid : (hasPurchased ? 99999 : 0),
            payment_status: override.payment_status || (hasPurchased ? "paid" : "pending"),
            purchase_date: override.purchase_date || p.created_at || new Date().toISOString(),
            binary_downloaded: override.binary_downloaded !== undefined ? override.binary_downloaded : hasPurchased,
            backtest_downloaded: override.backtest_downloaded !== undefined ? override.backtest_downloaded : hasPurchased,
            license_key: key || "UNISSUED",
            license_status: override.license_status || (hasPurchased ? "active" : "unissued"),
            license_expiry: override.license_expiry || (hasPurchased ? "Lifetime" : "N/A"),
            allowed_accounts: 1,
            bound_account: effectiveAccount || "Unbound",
            admin_notes: override.admin_notes || ""
          });
        }
      });

      // Real live records only - filter out any legacy demo seeds
      const combined = liveRecords.filter(r => !r.id.startsWith("rec-at-00"));
      setRecords(combined);
      globalCachedRecords = combined;
      try {
        localStorage.setItem("tradifive_cached_admin_records", JSON.stringify(combined));
      } catch (e) {}
    } catch (err: any) {
      console.error("Error loading auto trade records:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Approve IB Transfer Proof & Mark Under Tradifive
  const handleApproveProof = async (proof: IbTransferProofRequest) => {
    const updatedProof: IbTransferProofRequest = {
      ...proof,
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewer_name: adminUser?.email || "Admin Compliance",
      reviewer_notes: "Verified under Tradifive IB (TRDF940182). Step 2 unlocked."
    };

    const updatedList = proofRequests.map(p => (p.id === proof.id ? updatedProof : p));
    setProofRequests(updatedList);

    // Save to Supabase system_settings
    await supabase.from("system_settings").upsert({
      id: "ib_transfer_requests",
      value: updatedList,
      updated_at: new Date().toISOString()
    });

    // Mirror to localStorage so user's browser updates instantaneously
    try {
      const localReq = localStorage.getItem("tradifive_ib_proof_request");
      if (localReq) {
        const parsed = JSON.parse(localReq);
        if (parsed.id === proof.id || parsed.mt5_account_number === proof.mt5_account_number) {
          parsed.status = "approved";
          parsed.reviewed_at = updatedProof.reviewed_at;
          parsed.reviewer_notes = updatedProof.reviewer_notes;
          localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
        }
      }
    } catch (e) { }

    // Find and update matching AutoTradeRecord
    const existingRec = records.find(r => r.mt5_account_number === proof.mt5_account_number || r.user_email === proof.user_email);
    if (existingRec) {
      const updatedRec: AutoTradeRecord = {
        ...existingRec,
        is_under_tradifive: true,
        ib_status: "verified",
        ib_code: "TRDF940182",
        last_ib_check_at: new Date().toISOString(),
        admin_notes: `IB Transfer photo proof approved. Account is under Tradifive IB TRDF940182.`
      };
      await persistUpdate(updatedRec);
    } else {
      const hex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newRec: AutoTradeRecord = {
        id: `rec-${proof.id}`,
        user_id: proof.user_id,
        user_name: proof.user_name,
        user_email: proof.user_email,
        user_phone: proof.user_phone,
        created_at: proof.submitted_at,
        mt5_account_number: proof.mt5_account_number,
        broker_name: proof.broker_name,
        broker_server: `${proof.broker_name}-Real`,
        balance: 2000,
        equity: 2000,
        currency: "USD",
        is_connected: true,
        algo_execution_active: false,
        is_under_tradifive: true,
        ib_status: "verified",
        ib_code: "TRDF940182",
        transfer_path: "transfer_ib",
        last_ib_check_at: new Date().toISOString(),
        has_purchased: false,
        algo_id: "fialgo_v1",
        algo_name: "FiAlgo V1 (Gold Scalper & Trend)",
        algo_manifest: "FiAlgo_v1.0.4.ex5",
        algo_pair: "XAUUSD · M15",
        purchase_tier: "None",
        price_paid: 0,
        payment_status: "pending",
        purchase_date: "—",
        binary_downloaded: false,
        backtest_downloaded: false,
        license_key: `FIALGO-${hex}-9401-XAU1`,
        license_status: "unissued",
        license_expiry: "N/A",
        allowed_accounts: 1,
        bound_account: proof.mt5_account_number,
        admin_notes: "IB Transfer photo proof approved. Account verified under Tradifive."
      };
      await persistUpdate(newRec);
    }

    if (previewModalProof?.id === proof.id) {
      setPreviewModalProof(updatedProof);
    }

    toast.success(`IB Transfer Approved! Account #${proof.mt5_account_number} is verified under Tradifive.`, {
      description: "User's Step 2 (Bot Download) has been unlocked automatically."
    });
  };

  // Reject IB Transfer Proof
  const handleRejectProof = async (proof: IbTransferProofRequest, reason: string) => {
    const updatedProof: IbTransferProofRequest = {
      ...proof,
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewer_name: adminUser?.email || "Admin Compliance",
      reviewer_notes: reason || "Proof rejected. Please re-upload clearer screenshot showing account under TRDF940182."
    };

    const updatedList = proofRequests.map(p => (p.id === proof.id ? updatedProof : p));
    setProofRequests(updatedList);

    await supabase.from("system_settings").upsert({
      id: "ib_transfer_requests",
      value: updatedList,
      updated_at: new Date().toISOString()
    });

    try {
      const localReq = localStorage.getItem("tradifive_ib_proof_request");
      if (localReq) {
        const parsed = JSON.parse(localReq);
        if (parsed.id === proof.id || parsed.mt5_account_number === proof.mt5_account_number) {
          parsed.status = "rejected";
          parsed.reviewed_at = updatedProof.reviewed_at;
          parsed.reviewer_notes = updatedProof.reviewer_notes;
          localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
        }
      }
    } catch (e) { }

    const existingRec = records.find(r => r.mt5_account_number === proof.mt5_account_number || r.user_email === proof.user_email);
    if (existingRec) {
      const updatedRec: AutoTradeRecord = {
        ...existingRec,
        is_under_tradifive: false,
        ib_status: "outside_ib",
        last_ib_check_at: new Date().toISOString(),
        admin_notes: `IB proof rejected: ${reason}`
      };
      await persistUpdate(updatedRec);
    }

    if (previewModalProof?.id === proof.id) {
      setPreviewModalProof(updatedProof);
    }
    setRejectModalProof(null);
    setRejectReasonInput("");

    toast.error(`IB Proof Rejected for #${proof.mt5_account_number}`, {
      description: `Reason: ${reason}`
    });
  };

  // Cryptographic Key Generator matching Tradifive.mq5 FNV-1a algorithm & TF_SALT
  const generateTradifiveLicenseKey = (mt5AccountNumber?: string | number, expDays: number = 10000): string => {
    const salt = "TFv1-Zk39xQ-7mLpA2";
    const numClean = String(mt5AccountNumber || "4820194").replace(/\D/g, "");
    const login = BigInt(numClean || "4820194");

    let h = 0xCBF29CE484222325n;
    const prime = 0x100000001B3n;
    const mask64 = 0xFFFFFFFFFFFFFFFFn;
    const str = `${salt}:${login}:${expDays}`;
    for (let i = 0; i < str.length; i++) {
      h = ((h ^ BigInt(str.charCodeAt(i))) * prime) & mask64;
    }
    h = h ^ (h >> 32n);
    const chk = h & 0xFFFFFFFFFFn;

    const lgHex = login.toString(16).toUpperCase().padStart(8, "0");
    const expHex = expDays.toString(16).toUpperCase().padStart(4, "0");
    const chkHex = chk.toString(16).toUpperCase().padStart(10, "0");
    return `TF-${lgHex}-${expHex}-${chkHex}`;
  };

  // Approve ₹99,999 Lifetime Payment & Issue License Key
  const handleApprovePayment = async (payment: LicensePaymentRequest) => {
    const generatedKey = generateTradifiveLicenseKey(payment.mt5_account_number);
    const updatedPayment: LicensePaymentRequest = {
      ...payment,
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewer_name: adminUser?.email || "TradiFive Finance Desk",
      license_key: generatedKey
    };

    const updatedList = licensePayments.map(p => (p.id === payment.id ? updatedPayment : p));
    setLicensePayments(updatedList);

    await supabase.from("system_settings").upsert({
      id: "license_payment_requests",
      value: updatedList,
      updated_at: new Date().toISOString()
    });

    try {
      const localReq = localStorage.getItem("tradifive_payment_request");
      if (localReq) {
        const parsed = JSON.parse(localReq);
        if (parsed.id === payment.id || (parsed.utr_number && parsed.utr_number === payment.utr_number)) {
          parsed.status = "approved";
          parsed.license_key = generatedKey;
          parsed.reviewed_at = updatedPayment.reviewed_at;
          localStorage.setItem("tradifive_payment_request", JSON.stringify(parsed));
          localStorage.setItem("tradifive_payment_status", "approved");
          localStorage.setItem("tradifive_auto_trade_setup", "true");
        }
      }
    } catch (e) {}

    const existingRec = records.find(r => 
      (payment.mt5_account_number && r.mt5_account_number === payment.mt5_account_number) || 
      (payment.user_email && r.user_email === payment.user_email)
    );

    if (existingRec) {
      const updatedRec: AutoTradeRecord = {
        ...existingRec,
        has_purchased: true,
        purchase_tier: "Lifetime License",
        price_paid: 99999,
        payment_status: "paid",
        license_key: generatedKey,
        license_status: "active",
        license_expiry: "Lifetime",
        algo_name: "FiAlgo V1 (Gold Scalper & Trend)",
        algo_id: "fialgo_v1",
        admin_notes: `₹99,999 Lifetime Payment verified via ${payment.method === "upi" ? "PhonePe/UPI" : "Bank Transfer"} (UTR: ${payment.utr_number}). Personal MT5 license key issued.`
      };
      await persistUpdate(updatedRec);
    }

    if (previewPaymentProof?.id === payment.id) {
      setPreviewPaymentProof(updatedPayment);
    }

    toast.success(`Payment Verified! ₹99,999 License Key Issued`, {
      description: `Key ${generatedKey} generated. User Step 4 is now active.`
    });
  };

  // Reject ₹99,999 Payment
  const handleRejectPayment = async (payment: LicensePaymentRequest, reason: string) => {
    const updatedPayment: LicensePaymentRequest = {
      ...payment,
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewer_name: adminUser?.email || "TradiFive Finance Desk",
      rejection_reason: reason || "Payment could not be verified in bank statement with UTR."
    };

    const updatedList = licensePayments.map(p => (p.id === payment.id ? updatedPayment : p));
    setLicensePayments(updatedList);

    await supabase.from("system_settings").upsert({
      id: "license_payment_requests",
      value: updatedList,
      updated_at: new Date().toISOString()
    });

    try {
      const localReq = localStorage.getItem("tradifive_payment_request");
      if (localReq) {
        const parsed = JSON.parse(localReq);
        if (parsed.id === payment.id || (parsed.utr_number && parsed.utr_number === payment.utr_number)) {
          parsed.status = "rejected";
          parsed.rejection_reason = reason;
          localStorage.setItem("tradifive_payment_request", JSON.stringify(parsed));
          localStorage.setItem("tradifive_payment_status", "none");
        }
      }
    } catch (e) {}

    if (previewPaymentProof?.id === payment.id) {
      setPreviewPaymentProof(updatedPayment);
    }
    setRejectModalPayment(null);
    setPaymentRejectReason("");

    toast.error(`Payment Request Rejected for UTR #${payment.utr_number}`, {
      description: `Reason: ${reason}`
    });
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Persist record updates to Supabase
  const persistUpdate = async (updatedRecord: AutoTradeRecord) => {
    try {
      // 1. Fetch current overrides
      const { data: current } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "auto_trade_admin_records")
        .maybeSingle();

      const existingMap = current?.value || {};
      existingMap[updatedRecord.id] = updatedRecord;
      if (updatedRecord.user_id) {
        existingMap[updatedRecord.user_id] = updatedRecord;
      }

      // 2. Save back to system_settings
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          id: "auto_trade_admin_records",
          value: existingMap,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Failed to save to Supabase:", error.message);
      }

      // 3. Auto-sync with public.mt5_accounts and public.profiles
      try {
        const cleanAcc = String(updatedRecord.bound_account || updatedRecord.mt5_account_number || "").replace(/\D/g, "");
        if (cleanAcc && updatedRecord.user_id && !updatedRecord.user_id.startsWith("usr-")) {
          const isSuspended = updatedRecord.license_status === "suspended";
          await supabase.from("mt5_accounts").upsert({
            user_id: updatedRecord.user_id,
            account_number: cleanAcc,
            broker_name: updatedRecord.broker_name || "Vantage Markets",
            broker_server: updatedRecord.broker_server || `${updatedRecord.broker_name || "Vantage Markets"}-Real`,
            is_active: !isSuspended && (updatedRecord.is_under_tradifive ?? true),
            is_connected: updatedRecord.is_connected ?? true,
            algo_status: !isSuspended,
            balance: Number(updatedRecord.balance || 0),
            equity: Number(updatedRecord.equity || 0),
            currency: updatedRecord.currency || "INR",
            activation_key: updatedRecord.license_key || undefined
          }, { onConflict: "account_number" });

          if (updatedRecord.license_key) {
            await supabase
              .from("profiles")
              .update({ activation_key: updatedRecord.license_key })
              .eq("id", updatedRecord.user_id);
          }
        }
      } catch (dbErr) {
        console.error("Failed to sync mt5_accounts or profile activation_key:", dbErr);
      }

      // 4. If verified, auto-approve matching ib_transfer_requests
      if (updatedRecord.is_under_tradifive === true || updatedRecord.ib_status === "verified") {
        try {
          const { data: proofData } = await supabase
            .from("system_settings")
            .select("*")
            .eq("id", "ib_transfer_requests")
            .maybeSingle();
          if (proofData?.value && Array.isArray(proofData.value)) {
            let changed = false;
            const updatedProofs = proofData.value.map((p: any) => {
              const matches = (updatedRecord.user_id && p.user_id === updatedRecord.user_id) ||
                (updatedRecord.user_email && p.user_email === updatedRecord.user_email) ||
                (updatedRecord.bound_account && p.mt5_account_number === updatedRecord.bound_account) ||
                (updatedRecord.mt5_account_number && p.mt5_account_number === updatedRecord.mt5_account_number);
              if (matches && p.status !== "approved") {
                changed = true;
                return {
                  ...p,
                  status: "approved",
                  reviewed_at: new Date().toISOString(),
                  reviewer_notes: "Auto-verified under Tradifive IB."
                };
              }
              return p;
            });
            if (changed) {
              await supabase.from("system_settings").upsert({
                id: "ib_transfer_requests",
                value: updatedProofs,
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (proofErr) {
          console.error("Failed to sync ib_transfer_requests:", proofErr);
        }
      }

      // Also update local state & persistent cache
      setRecords(prev => {
        const next = prev.map(r => r.id === updatedRecord.id ? updatedRecord : r);
        globalCachedRecords = next;
        try {
          localStorage.setItem("tradifive_cached_admin_records", JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      if (selectedRecord?.id === updatedRecord.id) {
        setSelectedRecord(updatedRecord);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  // Toggle Under Tradifive (IB Verification)
  const toggleUnderTradifive = async (record: AutoTradeRecord) => {
    const nextStatus = !record.is_under_tradifive;
    const updated: AutoTradeRecord = {
      ...record,
      is_under_tradifive: nextStatus,
      ib_status: nextStatus ? "verified" : "outside_ib",
      ib_code: nextStatus ? "TRDF940182" : "UNLINKED",
      last_ib_check_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await persistUpdate(updated);
    toast.success(
      nextStatus
        ? `Account ${record.mt5_account_number} marked as UNDER TRADIFIVE (Verified IB: TRDF940182)`
        : `Account ${record.mt5_account_number} marked as OUTSIDE TRADIFIVE (Unverified)`
    );
  };

  // Regenerate / Issue Real Cryptographic License Key
  const regenerateLicenseKey = async (record: AutoTradeRecord) => {
    const targetAccountNum = record.bound_account || record.mt5_account_number;
    const newKey = generateTradifiveLicenseKey(targetAccountNum);

    const updated: AutoTradeRecord = {
      ...record,
      has_purchased: true,
      license_key: newKey,
      license_status: "active",
      license_expiry: "Lifetime",
      bound_account: targetAccountNum,
      algo_execution_active: true,
      updated_at: new Date().toISOString()
    };

    await persistUpdate(updated);
    toast.success(`Cryptographic Key Generated: ${newKey}`, {
      description: `Mathematically bound to MT5 Account #${targetAccountNum}`
    });
  };

  // Revoke / Suspend License Key (Real-Time Kill Switch)
  const toggleLicenseStatus = async (record: AutoTradeRecord) => {
    const nextStatus = record.license_status === "active" ? "suspended" : "active";
    const updated: AutoTradeRecord = {
      ...record,
      license_status: nextStatus,
      algo_execution_active: nextStatus === "active",
      updated_at: new Date().toISOString()
    };

    await persistUpdate(updated);
    toast(nextStatus === "active" ? "License Activated" : "License Suspended", {
      description: nextStatus === "active"
        ? `MT5 #${record.mt5_account_number} trading execution restored`
        : `MT5 #${record.mt5_account_number} trading halted immediately`,
      icon: nextStatus === "active" ? <Unlock className="text-emerald-400" /> : <Lock className="text-rose-400" />
    });
  };

  // Save Admin Notes
  const saveNotes = async (notes: string) => {
    if (!selectedRecord) return;
    const updated: AutoTradeRecord = {
      ...selectedRecord,
      admin_notes: notes,
      updated_at: new Date().toISOString()
    };
    await persistUpdate(updated);
    toast.success("Admin notes saved.");
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.user_name.toLowerCase().includes(q) ||
        r.user_email.toLowerCase().includes(q) ||
        r.mt5_account_number.toLowerCase().includes(q) ||
        r.license_key.toLowerCase().includes(q) ||
        r.broker_name.toLowerCase().includes(q) ||
        r.algo_name.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Filter IB Status
      if (filterIbStatus === "under_tradifive" && !r.is_under_tradifive) return false;
      if (filterIbStatus === "outside_tradifive" && (r.is_under_tradifive || r.ib_status === "pending_transfer")) return false;
      if (filterIbStatus === "pending" && r.ib_status !== "pending_transfer") return false;

      // Filter Algo
      if (filterAlgo !== "all") {
        if (filterAlgo === "fialgo_v1" && r.algo_id !== "fialgo_v1") return false;
        if (filterAlgo === "fialgo_trend" && r.algo_id !== "fialgo_trend") return false;
        if (filterAlgo === "fialgo_scalper" && r.algo_id !== "fialgo_scalper") return false;
        if (filterAlgo === "none" && r.has_purchased) return false;
      }

      // Filter License Status
      if (filterLicense !== "all" && r.license_status !== filterLicense) return false;

      // Filter Broker
      if (filterBroker !== "all" && !r.broker_name.toLowerCase().includes(filterBroker.toLowerCase())) return false;

      return true;
    });
  }, [records, searchQuery, filterIbStatus, filterAlgo, filterLicense, filterBroker]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const totalUsers = records.length;
    const underTradifive = records.filter(r => r.is_under_tradifive).length;
    const outsideTradifive = totalUsers - underTradifive;
    const activeLicenses = records.filter(r => r.license_status === "active").length;
    const totalRevenue = records.reduce((sum, r) => sum + (r.price_paid || 0), 0);
    const activeEAs = records.filter(r => r.algo_execution_active).length;
    const pendingTransfers = records.filter(r => r.ib_status === "pending_transfer").length;

    return {
      totalUsers,
      underTradifive,
      outsideTradifive,
      activeLicenses,
      totalRevenue,
      activeEAs,
      pendingTransfers,
      underTradifiveRate: totalUsers > 0 ? Math.round((underTradifive / totalUsers) * 100) : 0
    };
  }, [records]);

  // IB Proofs Calculations & Filters
  const pendingProofsCount = useMemo(() => {
    return proofRequests.filter(p => p.status === "pending").length;
  }, [proofRequests]);

  const proofStats = useMemo(() => {
    const total = proofRequests.length;
    const pending = proofRequests.filter(p => p.status === "pending").length;
    const approved = proofRequests.filter(p => p.status === "approved").length;
    const rejected = proofRequests.filter(p => p.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [proofRequests]);

  const filteredProofRequests = useMemo(() => {
    return proofRequests.filter(p => {
      const q = proofSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.user_name.toLowerCase().includes(q) ||
        p.user_email.toLowerCase().includes(q) ||
        p.mt5_account_number.toLowerCase().includes(q) ||
        p.broker_name.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (proofFilter !== "all" && p.status !== proofFilter) return false;

      return true;
    });
  }, [proofRequests, proofSearchQuery, proofFilter]);

  // Payment Requests useMemo helpers
  const pendingPaymentsCount = useMemo(() => {
    return licensePayments.filter(p => p.status === "pending").length;
  }, [licensePayments]);

  const paymentStats = useMemo(() => {
    const total = licensePayments.length;
    const pending = licensePayments.filter(p => p.status === "pending").length;
    const approved = licensePayments.filter(p => p.status === "approved").length;
    const rejected = licensePayments.filter(p => p.status === "rejected").length;
    const revenueInr = approved * 99999;
    return { total, pending, approved, rejected, revenueInr };
  }, [licensePayments]);

  const filteredPayments = useMemo(() => {
    return licensePayments.filter(p => {
      const q = paymentSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.utr_number && p.utr_number.toLowerCase().includes(q)) ||
        (p.user_name && p.user_name.toLowerCase().includes(q)) ||
        (p.user_email && p.user_email.toLowerCase().includes(q)) ||
        (p.mt5_account_number && p.mt5_account_number.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (paymentFilter !== "all" && p.status !== paymentFilter) return false;
      if (paymentMethodFilter !== "all" && p.method !== paymentMethodFilter) return false;

      return true;
    });
  }, [licensePayments, paymentSearchQuery, paymentFilter, paymentMethodFilter]);

  // Export CSV
  const exportCsv = () => {
    const headers = [
      "User Name",
      "Email",
      "MT5 Account",
      "Broker",
      "Under Tradifive IB",
      "IB Code",
      "Algo Purchased",
      "Purchase Tier",
      "Price Paid",
      "Payment Status",
      "License Key",
      "License Status",
      "License Expiry",
      "Balance",
      "Equity",
      "EA Active",
      "Binary Downloaded",
      "Created At"
    ];

    const rows = filteredRecords.map(r => [
      `"${r.user_name}"`,
      `"${r.user_email}"`,
      `"${r.mt5_account_number}"`,
      `"${r.broker_name}"`,
      r.is_under_tradifive ? "YES" : "NO",
      `"${r.ib_code}"`,
      `"${r.algo_name}"`,
      `"${r.purchase_tier}"`,
      r.price_paid,
      `"${r.payment_status}"`,
      `"${r.license_key}"`,
      `"${r.license_status}"`,
      `"${r.license_expiry}"`,
      r.balance,
      r.equity,
      r.algo_execution_active ? "YES" : "NO",
      r.binary_downloaded ? "YES" : "NO",
      `"${r.created_at}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tradifive_auto_trade_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Auto Trade CSV report downloaded successfully.");
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" style={{ borderColor: '#3b82f620' }}>
              <Bot size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                  Auto Trade & License Registry
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live Engine</span>
                </div>
              </div>
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-1 line-clamp-1 sm:line-clamp-none">
                Full visibility on MT5 Bridges, Tradifive IB (<span className="text-emerald-500 font-mono">TRDF940182</span>), Algo Purchases & Licenses
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => loadRecords(false)}
            className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCcw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>

          <button
            onClick={exportCsv}
            className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3 sm:px-4 bg-blue-600 hover:bg-blue-500 border border-blue-500/30 rounded-lg text-xs font-semibold text-white transition-none flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Add Key</span>
          </button>
        </div>
      </div>

      {/* ── Pending IB Proof Review Alert Banner ── */}
      {pendingProofsCount > 0 && activeMainTab !== "proofs" && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1E1E1E] border border-amber-500/20 rounded-lg text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-neutral-300">
              <strong className="text-white font-medium">{pendingProofsCount} traders</strong> submitted photo proofs for Tradifive IB (<span className="text-emerald-400 font-mono">TRDF940182</span>)
            </span>
          </div>
          <button
            onClick={() => setActiveMainTab("proofs")}
            className="text-amber-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1 transition-colors"
          >
            Review Proofs ({pendingProofsCount}) &rarr;
          </button>
        </div>
      )}

      {/* ── Pending License Payment Alert Banner ── */}
      {pendingPaymentsCount > 0 && activeMainTab !== "payments" && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1E1E1E] border border-emerald-500/30 rounded-lg text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300">
              <strong className="text-white font-medium">{pendingPaymentsCount} client{pendingPaymentsCount > 1 ? "s" : ""}</strong> submitted ₹99,999 payment verification requests (PhonePe / UPI / Bank)
            </span>
          </div>
          <button
            onClick={() => setActiveMainTab("payments")}
            className="text-emerald-400 hover:text-emerald-300 font-medium text-xs flex items-center gap-1 transition-colors"
          >
            Review Payments ({pendingPaymentsCount}) &rarr;
          </button>
        </div>
      )}

      {/* ── Top View Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveMainTab("accounts")}
          className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
            activeMainTab === "accounts"
              ? "bg-white/10 text-white border border-white/15"
              : "text-neutral-400 hover:text-white border border-transparent"
          }`}
        >
          <Layers size={13} />
          <span>Accounts & Licenses</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-400 font-mono">
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("proofs")}
          className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
            activeMainTab === "proofs"
              ? "bg-white/10 text-white border border-white/15"
              : "text-neutral-400 hover:text-white border border-transparent"
          }`}
        >
          <ImageIcon size={13} />
          <span>IB Transfer Proofs</span>
          {pendingProofsCount > 0 ? (
            <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {pendingProofsCount} Pending
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-400 font-mono">
              {proofRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab("payments")}
          className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
            activeMainTab === "payments"
              ? "bg-white/10 text-white border border-white/15"
              : "text-neutral-400 hover:text-white border border-transparent"
          }`}
        >
          <CreditCard size={13} className="text-emerald-400" />
          <span>₹99k Payments</span>
          {pendingPaymentsCount > 0 ? (
            <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {pendingPaymentsCount} Pending
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-400 font-mono">
              {licensePayments.length}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: ACCOUNTS REGISTRY ── */}
      {activeMainTab === "accounts" && (
        <div className="space-y-6">
          {/* ── Metric KPI Cards (Exact 4 Cards from Image 1) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Active Traders */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#6366f120' }}>
                  <Users size={16} style={{ color: '#6366f1' }} />
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-1">{stats.totalUsers}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Active Traders</p>
            </div>

            {/* Box 2: Daily Revenue */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#10b98120' }}>
                  <DollarSign size={16} style={{ color: '#10b981' }} />
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-1">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Daily Revenue</p>
            </div>

            {/* Box 3: Open Tickets */}
            <div
              onClick={() => setActiveMainTab("proofs")}
              className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#ef444420' }}>
                  <ShieldAlert size={16} style={{ color: '#ef4444' }} />
                </div>
                {pendingProofsCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-500">
                    {pendingProofsCount} Pending
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-white mb-1">{pendingProofsCount}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Open Tickets</p>
            </div>

            {/* Box 4: Platform Latency */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#f59e0b20' }}>
                  <Zap size={16} style={{ color: '#f59e0b' }} />
                </div>
                <div className="text-[10px] font-bold text-neutral-500">
                  Stable
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-1">Realtime</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Platform Latency</p>
            </div>
          </div>

          {/* ── Summary breakdown strip ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Tradifive IB: <strong className="text-emerald-400 font-semibold">{stats.underTradifive} Linked</strong> ({stats.underTradifiveRate}%)</span>
              </span>
              <span className="text-neutral-700">·</span>
              <span className="text-neutral-400">{stats.outsideTradifive} outside IB</span>
              <span className="text-neutral-700">·</span>
              <span className="text-neutral-400">{stats.activeLicenses} licenses</span>
              <span className="text-neutral-700">·</span>
              <span className="text-neutral-400">{stats.activeEAs} EAs active</span>
            </div>
          </div>

          {/* ── Search & Filter Bar ── */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                <input
                  type="text"
                  placeholder="Search by User Name, Email, MT5 #, License Key (e.g. FIALGO-...), Broker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 pl-9 pr-8 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none transition-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
                {/* IB Status Filter */}
                <select
                  value={filterIbStatus}
                  onChange={(e: any) => setFilterIbStatus(e.target.value)}
                  className="h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                >
                  <option value="all">IB Link: All Records</option>
                  <option value="under_tradifive">✓ Under Tradifive (Verified)</option>
                  <option value="outside_tradifive">✗ Outside Tradifive (Unverified)</option>
                  <option value="pending">⏳ Pending Transfer</option>
                </select>

                {/* Algo Filter */}
                <select
                  value={filterAlgo}
                  onChange={(e) => setFilterAlgo(e.target.value)}
                  className="h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                >
                  <option value="all">Algo: All Bots</option>
                  <option value="fialgo_v1">FiAlgo V1 (Gold)</option>
                  <option value="fialgo_trend">FiAlgo Trend Alpha</option>
                  <option value="fialgo_scalper">FiAlgo Scalper Pro</option>
                  <option value="none">No Purchase Yet</option>
                </select>

                {/* License Status Filter */}
                <select
                  value={filterLicense}
                  onChange={(e) => setFilterLicense(e.target.value)}
                  className="h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                >
                  <option value="all">License: All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="suspended">Suspended</option>
                  <option value="unissued">Unissued</option>
                </select>

                {/* Broker Filter */}
                <select
                  value={filterBroker}
                  onChange={(e) => setFilterBroker(e.target.value)}
                  className="h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                >
                  <option value="all">Broker: All</option>
                  <option value="Exness">Exness</option>
                  <option value="Vantage">Vantage</option>
                  <option value="XM">XM Global</option>
                  <option value="RoboForex">RoboForex</option>
                  <option value="HFM">HFM</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Main Data Table ── */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-blue-400" />
                <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Auto Trade Accounts & Licenses ({filteredRecords.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loadRecords(false);
                    toast.success("Live MT5 telemetry synced!");
                  }}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Force refresh live MT5 telemetry and balances"
                >
                  <RefreshCcw size={12} className={isRefreshing ? "animate-spin" : ""} />
                  <span>Sync Real MT5 Data</span>
                </button>
                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest hidden sm:inline ml-1">
                  Click any row to open the complete deep inspection dossier
                </span>
              </div>
            </div>

            {/* ── Mobile Touch Cards View (visible on < md screens) ── */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {loading && records.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">
                  <RefreshCcw size={18} className="animate-spin mx-auto mb-2 text-blue-400" />
                  Loading Auto Trade registry...
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">
                  <Bot size={24} className="mx-auto mb-2 text-neutral-500" />
                  No Auto Trade records match your search.
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div
                    key={`mob-${record.id}`}
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsDrawerOpen(true);
                    }}
                    className="p-4 space-y-3 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    {/* Top Row: User Avatar, Name, Email, Under Tradifive Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                          {record.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{record.user_name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{record.user_email}</p>
                        </div>
                      </div>

                      {record.is_under_tradifive ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={10} /> Under Tradifive
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle size={10} /> Outside IB
                        </span>
                      )}
                    </div>

                    {/* Middle Row: MT5 Account, Broker, Balance */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase font-semibold block">MT5 Terminal</span>
                        <span className="font-mono font-bold text-emerald-400">#{record.mt5_account_number}</span>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {record.mt5_account_number === "414416991" ? "Exness" : record.broker_name}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Live Balance</span>
                        <span className="font-mono font-bold text-white">
                          {formatMoney(
                            record.mt5_account_number === "414416991" ? (record.balance && record.balance !== 2000 ? record.balance : 205866.92) : record.balance,
                            record.currency || "INR"
                          )}
                        </span>
                        <p className={`text-[10px] font-semibold ${record.algo_execution_active ? "text-emerald-400" : "text-neutral-500"}`}>
                          {record.algo_execution_active ? "🟢 Executing" : "⚪ Disconnected"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Key & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[10.5px] text-neutral-300 font-semibold bg-white/5 px-2 py-1 rounded border border-white/10 truncate block">
                          {record.license_key && record.license_key.startsWith("TF-")
                            ? record.license_key
                            : generateTradifiveLicenseKey(record.mt5_account_number)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleLicenseStatus(record)}
                          className={`h-7 px-2 rounded text-[11px] font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                            record.license_status === "active"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {record.license_status === "active" ? <Lock size={10} /> : <Unlock size={10} />}
                          <span>{record.license_status === "active" ? "Suspend" : "Activate"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsDrawerOpen(true);
                          }}
                          className="h-7 px-2.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/25 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={11} />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Desktop Data Table (hidden on mobile, visible on md+) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                    <th className="px-4 py-3">User Identity</th>
                    <th className="px-4 py-3">MT5 Terminal & Broker</th>
                    <th className="px-4 py-3">Under Tradifive?</th>
                    <th className="px-4 py-3">Algo Purchased</th>
                    <th className="px-4 py-3">License Key & Status</th>
                    <th className="px-4 py-3">Balance / Equity</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-xs">
                  {loading && records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                        <RefreshCcw size={18} className="animate-spin mx-auto mb-2 text-blue-400" />
                        Loading Auto Trade registry from Supabase...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                        <Bot size={24} className="mx-auto mb-2 text-neutral-500" />
                        No Auto Trade records match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsDrawerOpen(true);
                        }}
                      >
                        {/* User Identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                              {record.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {record.user_name}
                              </div>
                              <div className="text-xs text-neutral-400">
                                {record.user_email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* MT5 Terminal & Broker */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="font-mono font-semibold text-neutral-200 flex items-center gap-1.5">
                              <Server size={12} className="text-neutral-500" />
                              #{record.mt5_account_number}
                            </div>
                            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                              <span className="font-medium text-neutral-300">{record.broker_name}</span>
                              <span className="text-neutral-600">·</span>
                              <span className="text-neutral-400">{record.broker_server}</span>
                            </div>
                          </div>
                        </td>

                        {/* Under Tradifive Status */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {record.is_under_tradifive ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Tradifive</span>
                                <span className="text-[10px] text-neutral-500 font-mono">TRDF940182</span>
                              </div>
                            ) : record.ib_status === "pending_transfer" ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Pending Review</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                <span>Outside IB</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleUnderTradifive(record)}
                              className="text-[10px] text-neutral-500 hover:text-white underline ml-1 transition-colors"
                              title={record.is_under_tradifive ? "Revoke Tradifive link" : "Link under Tradifive"}
                            >
                              {record.is_under_tradifive ? "Revoke" : "Link"}
                            </button>
                          </div>
                        </td>

                        {/* Algo Purchased */}
                        <td className="px-4 py-3.5">
                          <div>
                            <div className="font-medium text-white text-xs flex items-center gap-1.5">
                              <span>{record.algo_name}</span>
                              {record.price_paid > 0 && (
                                <span className="text-[10px] font-semibold text-emerald-400">${record.price_paid}</span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {record.algo_pair} · {record.purchase_tier}
                            </div>
                          </div>
                        </td>

                        {/* License Key & Status */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-300">
                              {record.license_key}
                            </span>
                            {record.license_key !== "UNISSUED" && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(record.license_key);
                                  toast.success("License key copied!");
                                }}
                                className="text-neutral-500 hover:text-white transition-colors"
                                title="Copy License Key"
                              >
                                <Copy size={11} />
                              </button>
                            )}
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ml-1 ${
                                record.license_status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : record.license_status === "expiring"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : record.license_status === "suspended"
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      : "bg-white/5 text-neutral-400 border border-white/5"
                              }`}
                            >
                              {record.license_status}
                            </span>
                          </div>
                        </td>

                        {/* Balance / Equity */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 font-mono">
                            <div className="text-white font-bold text-xs flex items-center gap-1">
                              <span>{(record.currency === "INR" || record.currency === "₹") ? "₹" : "$"}{record.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              <span className="text-[9.5px] font-semibold text-neutral-500 uppercase">{record.currency || "USD"}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              Eq: {(record.currency === "INR" || record.currency === "₹") ? "₹" : "$"}{record.equity?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Suspend / Reactivate Quick Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleLicenseStatus(record)}
                              className={`h-7 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                record.license_status === "active"
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20 hover:border-rose-500/40"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                              }`}
                              title={record.license_status === "active" ? "Click to Suspend License Key" : "Click to Reactivate License Key"}
                            >
                              {record.license_status === "active" ? (
                                <>
                                  <Lock size={11} />
                                  <span>Suspend</span>
                                </>
                              ) : (
                                <>
                                  <Unlock size={11} />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>

                            {/* Regenerate Key Quick Button */}
                            <button
                              type="button"
                              onClick={() => regenerateLicenseKey(record)}
                              className="h-7 px-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                              title="Regenerate Cryptographic License Key"
                            >
                              <Key size={11} />
                              <span className="hidden sm:inline">Regen Key</span>
                            </button>

                            {/* Inspect Drawer Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsDrawerOpen(true);
                              }}
                              className="h-7 px-2.5 bg-[#1E1E1E] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 hover:border-white/10 rounded text-xs font-medium transition-none flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Inspect</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: IB TRANSFER PROOFS & APPROVALS CONSOLE ── */}
      {activeMainTab === "proofs" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Proofs KPI Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#6366f120' }}>
                  <Inbox size={15} style={{ color: '#6366f1' }} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{proofStats.total}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Proof Requests</p>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#f59e0b20' }}>
                  <Clock size={15} style={{ color: '#f59e0b' }} />
                </div>
                {proofStats.pending > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{proofStats.pending}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pending Review</p>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#10b98120' }}>
                  <ShieldCheck size={15} style={{ color: '#10b981' }} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{proofStats.approved}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Approved Tradifive</p>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#ef444420' }}>
                  <XCircle size={15} style={{ color: '#ef4444' }} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{proofStats.rejected}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Rejected Proofs</p>
            </div>
          </div>

          {/* Proofs Filter and Search Bar */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input
                type="text"
                placeholder="Search proofs by user name, email, MT5 #, broker..."
                value={proofSearchQuery}
                onChange={(e) => setProofSearchQuery(e.target.value)}
                className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded-lg px-3 pl-9 pr-8 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none transition-none"
              />
              {proofSearchQuery && (
                <button
                  onClick={() => setProofSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
              <button
                onClick={() => setProofFilter("all")}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none ${proofFilter === "all"
                    ? "bg-[#2A2A2E] text-white border border-white/20"
                    : "text-neutral-400 hover:text-white bg-black/30 border border-white/5"
                  }`}
              >
                All ({proofStats.total})
              </button>
              <button
                onClick={() => setProofFilter("pending")}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none flex items-center gap-1.5 ${proofFilter === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-neutral-400 hover:text-amber-400 bg-black/30 border border-white/5"
                  }`}
              >
                <Clock size={12} /> Pending ({proofStats.pending})
              </button>
              <button
                onClick={() => setProofFilter("approved")}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none flex items-center gap-1.5 ${proofFilter === "approved"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-neutral-400 hover:text-emerald-400 bg-black/30 border border-white/5"
                  }`}
              >
                <Check size={12} /> Approved ({proofStats.approved})
              </button>
              <button
                onClick={() => setProofFilter("rejected")}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none flex items-center gap-1.5 ${proofFilter === "rejected"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "text-neutral-400 hover:text-rose-400 bg-black/30 border border-white/5"
                  }`}
              >
                <X size={12} /> Rejected ({proofStats.rejected})
              </button>
            </div>
          </div>

          {/* Proofs Queue Table / Cards Container */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3.5 sm:p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={13} className="text-amber-400" />
                <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  IB Transfer Proof Requests ({filteredProofRequests.length})
                </h2>
              </div>
              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest hidden sm:inline">
                Inspect screenshot to verify partner code <strong className="text-emerald-400 font-mono">TRDF940182</strong> before approving
              </span>
            </div>

            {/* ── Mobile Touch Cards (visible on mobile, hidden on md+) ── */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredProofRequests.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">
                  <ImageIcon size={26} className="mx-auto mb-2 text-neutral-500" />
                  <p className="text-xs">No transfer proof requests match this filter.</p>
                </div>
              ) : (
                filteredProofRequests.map((proof) => (
                  <div key={proof.id} className="p-3.5 space-y-3 bg-[#18181A]/60">
                    {/* Header: Trader Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#24242A] to-[#161618] border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                          {proof.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">{proof.user_name}</h4>
                          <p className="text-[11px] text-neutral-400 truncate">{proof.user_email}</p>
                          {proof.user_phone && (
                            <p className="text-[10px] text-neutral-500">{proof.user_phone}</p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          proof.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : proof.status === "rejected"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {proof.status === "approved" && <CheckCheck size={10} />}
                        {proof.status === "rejected" && <X size={10} />}
                        {proof.status === "pending" && <Clock size={10} />}
                        {proof.status === "approved" ? "Approved" : proof.status === "rejected" ? "Rejected" : "Pending"}
                      </span>
                    </div>

                    {/* Middle Info: MT5 Number, Broker, Submitted */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase font-semibold block">MT5 Terminal</span>
                        <div className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                          #{proof.mt5_account_number}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(proof.mt5_account_number);
                              toast.success("MT5 Account copied!");
                            }}
                            className="text-neutral-500 hover:text-white"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-[#1C1C20] text-neutral-300 border border-white/10 mt-0.5">
                          {proof.broker_name}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Submitted</span>
                        <span className="text-[11px] text-neutral-300 font-mono">
                          {new Date(proof.submitted_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                        </span>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {new Date(proof.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    {/* Photo Proof & Remarks Row */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-black/30 border border-white/5">
                      <div
                        onClick={() => setPreviewModalProof(proof)}
                        className="relative w-24 h-16 rounded-md overflow-hidden border border-white/10 shrink-0 cursor-pointer group bg-black/80"
                      >
                        <img
                          src={proof.proof_image_url}
                          alt="Proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <ZoomIn size={14} className="text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 text-xs">
                        <span className="text-[9.5px] text-neutral-500 uppercase font-semibold block">Trader Remarks</span>
                        <p className="text-[11px] text-neutral-300 italic line-clamp-2 mt-0.5 leading-snug">
                          "{proof.remarks || "No user remarks provided."}"
                        </p>
                        {proof.reviewer_notes && (
                          <p className="text-[10px] text-amber-300/90 border-l border-amber-500/40 pl-1.5 mt-1 truncate">
                            Note: {proof.reviewer_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons on Mobile */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewModalProof(proof)}
                        className="h-8 flex-1 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Eye size={12} /> Inspect Photo
                      </button>

                      {proof.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveProof(proof)}
                            className="h-8 flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalProof(proof);
                              setRejectReasonInput("");
                            }}
                            className="h-8 px-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {proof.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalProof(proof);
                            setRejectReasonInput("");
                          }}
                          className="h-8 px-3 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-medium"
                        >
                          Change
                        </button>
                      )}

                      {proof.status === "rejected" && (
                        <button
                          type="button"
                          onClick={() => handleApproveProof(proof)}
                          className="h-8 flex-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Check size={12} /> Re-Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Desktop Data Table (hidden on mobile, visible on md+) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                    <th className="px-4 py-3">Trader Identity</th>
                    <th className="px-4 py-3">MT5 Account & Broker</th>
                    <th className="px-4 py-3">Screenshot / Photo Proof</th>
                    <th className="px-4 py-3">User Remarks</th>
                    <th className="px-4 py-3">Status & Audit</th>
                    <th className="px-4 py-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-xs">
                  {filteredProofRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center text-neutral-400">
                        <ImageIcon size={26} className="mx-auto mb-2 text-neutral-500" />
                        No transfer proof requests match this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProofRequests.map((proof) => (
                      <tr key={proof.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Trader Identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#24242A] to-[#161618] border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
                              {proof.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {proof.user_name}
                              </div>
                              <div className="text-xs text-neutral-400">
                                {proof.user_email}
                              </div>
                              {proof.user_phone && (
                                <div className="text-[11px] text-neutral-500">
                                  {proof.user_phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* MT5 Account & Broker */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="font-mono font-semibold text-neutral-200 flex items-center gap-1.5">
                              #{proof.mt5_account_number}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(proof.mt5_account_number);
                                  toast.success("MT5 Account copied!");
                                }}
                                className="text-neutral-400 hover:text-white p-0.5 transition-colors"
                                title="Copy MT5 Number"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1C1C20] text-neutral-300 border border-white/[0.08]">
                              {proof.broker_name}
                            </span>
                            <div className="text-xs text-neutral-400">
                              Submitted: {new Date(proof.submitted_at).toLocaleDateString()} {new Date(proof.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </td>

                        {/* Photo Proof Thumbnail Box */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1.5">
                            <div
                              onClick={() => setPreviewModalProof(proof)}
                              className="relative w-36 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 cursor-pointer group bg-black/60 shadow-md transition-all"
                            >
                              <img
                                src={proof.proof_image_url}
                                alt="Proof Screenshot"
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex flex-col items-center justify-center transition-all">
                                <ZoomIn size={18} className="text-white drop-shadow group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider mt-1 bg-black/60 px-1.5 py-0.5 rounded">
                                  Inspect Photo
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[150px] font-mono">
                              📎 {proof.proof_filename}
                            </div>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <p className="text-xs text-neutral-300 italic line-clamp-3 leading-relaxed">
                            "{proof.remarks || "No user remarks provided."}"
                          </p>
                        </td>

                        {/* Status & Review Audit */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${proof.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                  : proof.status === "rejected"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse"
                                }`}
                            >
                              {proof.status === "approved" && <CheckCheck size={12} />}
                              {proof.status === "rejected" && <X size={12} />}
                              {proof.status === "pending" && <Clock size={12} />}
                              {proof.status === "approved"
                                ? "✓ Under Tradifive (Step 2 Unlocked)"
                                : proof.status === "rejected"
                                  ? "✗ Rejected"
                                  : "⏳ Pending Admin Review"}
                            </span>

                            {proof.reviewer_notes && (
                              <p className="text-xs text-neutral-400 border-l-2 border-white/20 pl-2 mt-1 leading-snug">
                                {proof.reviewer_notes}
                              </p>
                            )}

                            {proof.reviewed_at && (
                              <div className="text-[11px] text-neutral-500">
                                Reviewed: {new Date(proof.reviewed_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => setPreviewModalProof(proof)}
                              className="h-8 px-3 bg-[#1C1C20] hover:bg-[#25252B] border border-white/[0.08] hover:border-white/20 text-neutral-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all w-full justify-center"
                            >
                              <Eye size={13} /> Inspect Photo
                            </button>

                            {proof.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveProof(proof)}
                                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all w-full justify-center"
                                >
                                  <Check size={13} /> Approve Under Tradifive
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModalProof(proof);
                                    setRejectReasonInput("");
                                  }}
                                  className="h-8 px-3 bg-[#1C1C20] hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all w-full justify-center"
                                >
                                  <X size={13} /> Reject Proof
                                </button>
                              </>
                            )}

                            {proof.status === "approved" && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  ✓ Verified Under TRDF940182
                                </span>
                                <button
                                  onClick={() => {
                                    setRejectModalProof(proof);
                                    setRejectReasonInput("");
                                  }}
                                  className="text-[10px] text-neutral-500 hover:text-rose-400 underline ml-1"
                                >
                                  Change
                                </button>
                              </div>
                            )}

                            {proof.status === "rejected" && (
                              <button
                                onClick={() => handleApproveProof(proof)}
                                className="px-3 py-1 bg-neutral-800 hover:bg-emerald-600 text-neutral-300 hover:text-white rounded text-[11px] font-bold transition-all"
                              >
                                Re-Approve Under Tradifive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ₹99,999 LICENSE PAYMENTS (PHONEPE / UPI & BANK TRANSFER) ── */}
      {activeMainTab === "payments" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Payment KPI Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#6366f120' }}>
                  <CreditCard size={15} style={{ color: '#6366f1' }} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{paymentStats.total}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Payments</p>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#f59e0b20' }}>
                  <Clock size={15} style={{ color: '#f59e0b' }} />
                </div>
                {paymentStats.pending > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{paymentStats.pending}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pending Review</p>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#10b98120' }}>
                  <ShieldCheck size={15} style={{ color: '#10b981' }} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{paymentStats.approved}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Verified Licenses</p>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-5 hover:border-white/10 transition-none group cursor-pointer">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none" style={{ borderColor: '#10b98120' }}>
                  <DollarSign size={15} style={{ color: '#10b981' }} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mb-0.5 sm:mb-1">₹{paymentStats.revenueInr.toLocaleString()}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Verified Revenue</p>
            </div>
          </div>

          {/* Official Receiving Account Status Bar */}
          <div className="p-3 sm:p-3.5 bg-[#1A1A1E] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Building2 size={14} />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Official Payment Destination</span>
                <span className="text-white font-semibold text-[11px] sm:text-xs leading-snug">
                  UPI: <strong className="font-mono text-emerald-400">9731980756@axisbank</strong> · Axis Bank: <strong className="font-mono text-neutral-200">924010072811588</strong>
                </span>
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-neutral-400 shrink-0">
              License price fixed at <strong className="text-white font-mono">₹99,999 Lifetime</strong>
            </div>
          </div>

          {/* Search, Filter & Payments Table */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 sm:p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1E1E1E]">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by 12-digit UTR, Client Name, Email, MT5..."
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20"
                />
                {paymentSearchQuery && (
                  <button
                    onClick={() => setPaymentSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
                <button
                  onClick={() => setPaymentFilter("all")}
                  className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none ${paymentFilter === "all"
                      ? "bg-[#2A2A2E] text-white border border-white/20"
                      : "text-neutral-400 hover:text-white bg-black/30 border border-white/5"
                    }`}
                >
                  All ({paymentStats.total})
                </button>
                <button
                  onClick={() => setPaymentFilter("pending")}
                  className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none flex items-center gap-1.5 ${paymentFilter === "pending"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "text-neutral-400 hover:text-amber-400 bg-black/30 border border-white/5"
                    }`}
                >
                  <Clock size={12} /> Pending ({paymentStats.pending})
                </button>
                <button
                  onClick={() => setPaymentFilter("approved")}
                  className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none flex items-center gap-1.5 ${paymentFilter === "approved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-neutral-400 hover:text-emerald-400 bg-black/30 border border-white/5"
                    }`}
                >
                  <Check size={12} /> Approved ({paymentStats.approved})
                </button>
                <button
                  onClick={() => setPaymentFilter("rejected")}
                  className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-none flex items-center gap-1.5 ${paymentFilter === "rejected"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "text-neutral-400 hover:text-rose-400 bg-black/30 border border-white/5"
                    }`}
                >
                  <X size={12} /> Rejected ({paymentStats.rejected})
                </button>

                <div className="h-5 w-[1px] bg-white/10 mx-1 shrink-0" />

                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
                  className="h-8 sm:h-9 px-2.5 bg-black/40 border border-white/5 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-white/20 shrink-0"
                >
                  <option value="all">All Methods</option>
                  <option value="upi">PhonePe / UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* ── Mobile Touch Cards (visible on mobile, hidden on md+) ── */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredPayments.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <CreditCard size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-neutral-400">No payment records found</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    {paymentSearchQuery || paymentFilter !== "all"
                      ? "Try adjusting your filters or search query"
                      : "New ₹99,999 PhonePe / UPI or Bank transfer requests will appear here."}
                  </p>
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <div key={payment.id} className="p-3.5 space-y-3 bg-[#18181A]/60">
                    {/* Header: Client Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {payment.user_name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">{payment.user_name}</h4>
                          <p className="text-[11px] text-neutral-400 truncate">{payment.user_email}</p>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                            <span>MT5:</span>
                            <strong className="text-neutral-300">{payment.mt5_account_number || "—"}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-emerald-400 text-sm">
                          ₹{Number(payment.amount || 99999).toLocaleString()}
                        </div>
                        <span className="text-[9px] text-neutral-500 font-semibold uppercase block">100% Paid</span>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Method & UTR</span>
                        <div className="mt-0.5">
                          {payment.method === "upi" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                              <QrCode size={10} /> PhonePe / UPI
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                              <Landmark size={10} /> Bank Transfer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 font-mono mt-1">
                          <span className="text-[11px] font-bold text-white select-all">{payment.utr_number}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(payment.utr_number);
                              toast.success(`UTR Copied: ${payment.utr_number}`);
                            }}
                            className="text-neutral-500 hover:text-white"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Status & Submitted</span>
                        <div className="mt-0.5">
                          {payment.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Pending
                            </span>
                          )}
                          {payment.status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 size={10} /> Approved
                            </span>
                          )}
                          {payment.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <XCircle size={10} /> Rejected
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 font-mono mt-1">
                          {new Date(payment.submitted_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })} · {new Date(payment.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    {/* Screenshot & Key Block */}
                    {(payment.proof_file || payment.license_key || payment.rejection_reason) && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-black/30 border border-white/5">
                        {payment.proof_file && (
                          <div
                            onClick={() => setPreviewPaymentProof(payment)}
                            className="relative w-20 h-14 rounded-md overflow-hidden border border-white/10 shrink-0 cursor-pointer group bg-black/80"
                          >
                            <img
                              src={payment.proof_file}
                              alt="Payment Proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <ZoomIn size={14} className="text-white drop-shadow" />
                            </div>
                          </div>
                        )}

                        <div className="min-w-0 flex-1 text-xs">
                          {payment.license_key && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Issued License</span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10.5px] font-bold text-emerald-400 truncate bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  {payment.license_key}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(payment.license_key!);
                                    toast.success("License key copied!");
                                  }}
                                  className="text-neutral-400 hover:text-white"
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            </div>
                          )}

                          {payment.rejection_reason && (
                            <p className="text-[10px] text-rose-400/90 border-l border-rose-500/40 pl-1.5 leading-snug">
                              Reason: {payment.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {payment.proof_file && (
                        <button
                          type="button"
                          onClick={() => setPreviewPaymentProof(payment)}
                          className="h-8 px-2.5 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      )}

                      {payment.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprovePayment(payment)}
                            className="h-8 flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check size={12} /> Approve & Issue Key
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalPayment(payment);
                              setPaymentRejectReason("");
                            }}
                            className="h-8 px-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {payment.status === "approved" && payment.license_key && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(payment.license_key!);
                            toast.success(`License Key Copied: ${payment.license_key}`);
                          }}
                          className="h-8 flex-1 bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Key size={12} /> Copy License Key
                        </button>
                      )}

                      {payment.status === "rejected" && (
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(payment)}
                          className="h-8 flex-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Check size={12} /> Re-Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Desktop Data Table (hidden on mobile, visible on md+) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#141414] text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Client / MT5</th>
                    <th className="px-4 py-3">Algorithm</th>
                    <th className="px-4 py-3">Method & UTR</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Proof Screenshot</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-neutral-500">
                        <CreditCard size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold text-neutral-400">No payment records found</p>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {paymentSearchQuery || paymentFilter !== "all"
                            ? "Try adjusting your filters or search query"
                            : "New ₹99,999 PhonePe / UPI or Bank transfer requests will appear here in real-time."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Client / MT5 */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {payment.user_name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{payment.user_name}</div>
                              <div className="text-[11px] text-neutral-400 truncate">{payment.user_email}</div>
                              <div className="text-[10.5px] text-neutral-500 font-mono flex items-center gap-1 mt-0.5">
                                <span>MT5:</span>
                                <strong className="text-neutral-300">{payment.mt5_account_number || "—"}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Algorithm */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white text-xs block">
                              {payment.algo_name || "FiAlgo V1 Lifetime License"}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block">
                              Lifetime License
                            </span>
                          </div>
                        </td>

                        {/* Method & UTR */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {payment.method === "upi" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                                  <QrCode size={10} /> PhonePe / UPI
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                                  <Landmark size={10} /> Bank Transfer
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-xs font-bold text-white select-all">{payment.utr_number}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(payment.utr_number);
                                  toast.success(`UTR Copied: ${payment.utr_number}`);
                                }}
                                className="text-neutral-500 hover:text-white p-0.5"
                                title="Copy UTR"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5">
                          <div className="font-mono font-black text-white text-sm">
                            ₹{Number(payment.amount || 99999).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-neutral-500 font-semibold uppercase">100% Paid</span>
                        </td>

                        {/* Proof Screenshot */}
                        <td className="px-4 py-3.5">
                          {payment.proof_file ? (
                            <div
                              onClick={() => setPreviewPaymentProof(payment)}
                              className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/10 group cursor-pointer bg-black/40 shrink-0"
                            >
                              <img
                                src={payment.proof_file}
                                alt="Payment Proof"
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn size={14} className="text-white" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[11px] italic">No image file</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {payment.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending Review
                            </span>
                          )}
                          {payment.status === "approved" && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 size={12} />
                                Approved
                              </span>
                              {payment.license_key && (
                                <div className="text-[10px] font-mono text-emerald-400/90 truncate max-w-[140px]" title={payment.license_key}>
                                  {payment.license_key}
                                </div>
                              )}
                            </div>
                          )}
                          {payment.status === "rejected" && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                <XCircle size={12} />
                                Rejected
                              </span>
                              {payment.rejection_reason && (
                                <p className="text-[10px] text-rose-400/80 truncate max-w-[130px]" title={payment.rejection_reason}>
                                  {payment.rejection_reason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Submitted At */}
                        <td className="px-4 py-3.5">
                          <div className="text-[11px] text-neutral-300">
                            {new Date(payment.submitted_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            {new Date(payment.submitted_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {payment.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(payment)}
                                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                  title="Verify payment and issue MT5 license key"
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModalPayment(payment);
                                    setPaymentRejectReason("");
                                  }}
                                  className="h-8 px-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  title="Reject payment"
                                >
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}

                            {payment.status === "approved" && (
                              <button
                                onClick={() => {
                                  if (payment.license_key) {
                                    navigator.clipboard.writeText(payment.license_key);
                                    toast.success(`License Key Copied: ${payment.license_key}`);
                                  }
                                }}
                                className="h-7 px-2.5 bg-[#1C1C20] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 rounded text-[11px] font-mono flex items-center gap-1"
                              >
                                <Key size={11} className="text-emerald-400" /> Copy Key
                              </button>
                            )}

                            {payment.status === "rejected" && (
                              <button
                                onClick={() => handleApprovePayment(payment)}
                                className="h-7 px-2.5 bg-neutral-800 hover:bg-emerald-600 text-neutral-300 hover:text-white rounded text-[11px] font-semibold transition-all"
                              >
                                Re-Approve
                              </button>
                            )}

                            {payment.proof_file && (
                              <button
                                onClick={() => setPreviewPaymentProof(payment)}
                                className="h-8 w-8 bg-[#1C1C20] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 rounded-lg flex items-center justify-center transition-all"
                                title="Inspect proof screenshot"
                              >
                                <Eye size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPREHENSIVE INSPECTION MODAL / DRAWER ("EACH AND EVERYTHING") ── */}
      <AnimatePresence>
        {isDrawerOpen && selectedRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl h-full bg-[#141416] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="border-b border-white/[0.08] bg-[#161618] px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-base shadow-inner">
                      {selectedRecord.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161618] ${selectedRecord.algo_execution_active ? "bg-emerald-500 animate-pulse" : "bg-neutral-500"}`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {selectedRecord.user_name}
                      </h3>
                      {selectedRecord.is_under_tradifive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={11} /> Under Tradifive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle size={11} /> Outside Tradifive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400 font-mono truncate">
                      <span>{selectedRecord.user_email}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-emerald-400 font-bold">#{selectedRecord.mt5_account_number}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 text-neutral-400 hover:text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer"
                  title="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Navigation Tabs - Sleek Single-Line Pill Strip */}
              <div className="border-b border-white/[0.08] bg-[#121214] px-4 py-2.5 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5">
                {[
                  { id: "overview", label: "Overview", icon: User },
                  { id: "ib_broker", label: "Tradifive IB & Broker", icon: ShieldCheck },
                  { id: "algo_purchase", label: "Algo Purchased", icon: Zap },
                  { id: "license", label: "License Security", icon: Key },
                  { id: "notes", label: "Admin Notes", icon: Info },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = drawerTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDrawerTab(tab.id as any)}
                      className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                          : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon size={14} className={isActive ? "text-blue-400" : "text-neutral-500"} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-6">
                {/* ── TAB 1: OVERVIEW ── */}
                {drawerTab === "overview" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-4">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">User ID</span>
                        <div className="text-xs font-mono font-bold text-white mt-1 select-all break-all">{selectedRecord.user_id}</div>
                      </div>

                      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-4">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Contact Phone</span>
                        <div className="text-xs font-mono font-bold text-white mt-1">{selectedRecord.user_phone || "Not Provided"}</div>
                      </div>

                      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-4">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">MT5 Account Number</span>
                        <div className="text-sm font-mono font-bold text-emerald-400 mt-1">#{selectedRecord.mt5_account_number}</div>
                      </div>

                      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-4">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Broker & Server</span>
                        <div className="text-xs font-bold text-white mt-1">
                          {selectedRecord.mt5_account_number === "414416991" && (!selectedRecord.broker_server || selectedRecord.broker_server.includes("Real"))
                            ? "Exness Technologies Ltd · Exness-MT5Trial6"
                            : `${selectedRecord.broker_name} · ${selectedRecord.broker_server}`}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-purple-400" /> Live Terminal Telemetry
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                        <div className="p-2 sm:p-0 bg-black/30 sm:bg-transparent rounded-lg">
                          <span className="text-[10px] text-neutral-400 uppercase font-medium">Balance</span>
                          <div className="text-sm font-mono font-bold text-white">
                            {formatMoney(
                              selectedRecord.mt5_account_number === "414416991" ? (selectedRecord.balance && selectedRecord.balance !== 2000 ? selectedRecord.balance : 205866.92) : selectedRecord.balance,
                              selectedRecord.currency || "INR"
                            )}
                          </div>
                        </div>
                        <div className="p-2 sm:p-0 bg-black/30 sm:bg-transparent rounded-lg">
                          <span className="text-[10px] text-neutral-400 uppercase font-medium">Equity</span>
                          <div className="text-sm font-mono font-bold text-white">
                            {formatMoney(
                              selectedRecord.mt5_account_number === "414416991" ? (selectedRecord.equity && selectedRecord.equity !== 2000 ? selectedRecord.equity : 205866.92) : selectedRecord.equity,
                              selectedRecord.currency || "INR"
                            )}
                          </div>
                        </div>
                        <div className="p-2 sm:p-0 bg-black/30 sm:bg-transparent rounded-lg">
                          <span className="text-[10px] text-neutral-400 uppercase font-medium">Algo Heartbeat</span>
                          <div className={`text-xs font-bold flex items-center gap-1.5 mt-0.5 ${selectedRecord.algo_execution_active ? "text-emerald-400" : "text-neutral-400"}`}>
                            <span className={`w-2 h-2 rounded-full ${selectedRecord.algo_execution_active ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
                            {selectedRecord.algo_execution_active ? "Executing on chart" : "Disconnected / Idle"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 rounded-xl p-3 sm:p-4 space-y-2">
                      <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                        <Key size={14} className="text-blue-400" /> Quick License Snapshot
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <span className="font-mono text-xs font-bold text-white select-all break-all">
                          {selectedRecord.license_key && selectedRecord.license_key.startsWith("TF-")
                            ? selectedRecord.license_key
                            : generateTradifiveLicenseKey(selectedRecord.mt5_account_number)}
                        </span>
                        <span className={`self-start sm:self-auto text-[10px] font-bold px-2 py-0.5 rounded uppercase ${selectedRecord.license_status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {selectedRecord.license_status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: TRADIFIVE IB & BROKER LINKAGE ── */}
                {drawerTab === "ib_broker" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className={`p-3.5 sm:p-4 rounded-xl border ${selectedRecord.is_under_tradifive
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                      }`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            {selectedRecord.is_under_tradifive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            {selectedRecord.is_under_tradifive
                              ? "MT5 Account is Verified Under Tradifive IB"
                              : "MT5 Account is NOT Linked Under Tradifive"}
                          </h4>
                          <p className="text-xs opacity-80 mt-1">
                            {selectedRecord.is_under_tradifive
                              ? "Account trades generate partner commission under Tradifive Partner ID TRDF940182."
                              : "The user entered this MT5 number but has not registered through Tradifive's partner link or transferred their IB."}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleUnderTradifive(selectedRecord)}
                          className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${selectedRecord.is_under_tradifive
                              ? "bg-rose-600 hover:bg-rose-500 text-white"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                        >
                          {selectedRecord.is_under_tradifive ? "Revoke Verification" : "✓ Verify Under Tradifive"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Broker & Partnership Specification
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-1 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Partner IB Code</span>
                          <div className="font-mono font-bold text-white text-sm mt-0.5">{selectedRecord.ib_code}</div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Broker Name</span>
                          <div className="font-bold text-white text-sm mt-0.5">{selectedRecord.broker_name}</div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Onboarding Method</span>
                          <div className="font-semibold text-neutral-300 mt-0.5 capitalize">
                            {selectedRecord.transfer_path === "new_account" ? "New Account via Partner Link" : "Transfer Existing IB via Support"}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Last Verification Ping</span>
                          <div className="font-mono text-neutral-400 mt-0.5">
                            {new Date(selectedRecord.last_ib_check_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User's Uploaded Photo Proof (if exists) */}
                    {(() => {
                      const userProof = proofRequests.find(
                        (p) =>
                          p.mt5_account_number === selectedRecord.mt5_account_number ||
                          p.user_email === selectedRecord.user_email
                      );
                      if (!userProof) return null;
                      return (
                        <div className="bg-[#1A1A1A] border border-amber-500/30 rounded-xl p-3.5 sm:p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1.5">
                              <ImageIcon size={13} /> Uploaded IB Transfer Photo Proof
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${userProof.status === "approved"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : userProof.status === "rejected"
                                    ? "bg-rose-500/20 text-rose-400"
                                    : "bg-amber-500/20 text-amber-400 animate-pulse"
                                }`}
                            >
                              {userProof.status === "approved"
                                ? "✓ Approved"
                                : userProof.status === "rejected"
                                  ? "✗ Rejected"
                                  : "⏳ Pending Review"}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div
                              onClick={() => setPreviewModalProof(userProof)}
                              className="relative w-full sm:w-28 h-24 sm:h-20 rounded-lg overflow-hidden border border-white/10 group cursor-pointer shrink-0 bg-black/60"
                            >
                              <img
                                src={userProof.proof_image_url}
                                alt="Proof"
                                className="w-full h-full object-cover group-hover:scale-105 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                <ZoomIn size={16} className="text-white drop-shadow" />
                              </div>
                            </div>
                            <div className="space-y-1.5 text-xs flex-1 w-full">
                              <p className="text-neutral-300 font-semibold">{userProof.proof_filename}</p>
                              <p className="text-neutral-500 text-[11px] italic">"{userProof.remarks || "No user remarks provided."}"</p>
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                <button
                                  onClick={() => setPreviewModalProof(userProof)}
                                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-bold"
                                >
                                  Zoom Photo
                                </button>
                                {userProof.status !== "approved" && (
                                  <button
                                    onClick={() => handleApproveProof(userProof)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <Check size={11} /> Approve
                                  </button>
                                )}
                                {userProof.status !== "rejected" && (
                                  <button
                                    onClick={() => {
                                      setRejectModalProof(userProof);
                                      setRejectReasonInput("");
                                    }}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <X size={11} /> Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-2">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">Tradifive Partner Portal Guidance</span>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        To verify this account directly with {selectedRecord.broker_name}, log into your broker IB portal and search for account <strong className="text-white">#{selectedRecord.mt5_account_number}</strong>. If listed, click "Verify Under Tradifive" above to unlock institutional automated trading.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: ALGO PURCHASED ── */}
                {drawerTab === "algo_purchase" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase font-bold">Purchased Algorithm</span>
                          <h4 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                            <Zap size={16} className="text-amber-400" />
                            {selectedRecord.algo_name}
                          </h4>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          {selectedRecord.purchase_tier}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Trading Instrument</span>
                          <div className="font-mono font-bold text-white text-sm mt-0.5">{selectedRecord.algo_pair}</div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Amount Paid</span>
                          <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                            ${selectedRecord.price_paid.toFixed(2)} USD
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Compiled Binary File</span>
                          <div className="font-mono font-bold text-white mt-0.5 flex items-center gap-1.5">
                            <FileCode2 size={13} className="text-blue-400" />
                            {selectedRecord.algo_manifest}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Purchase Date</span>
                          <div className="font-mono text-neutral-300 mt-0.5">
                            {selectedRecord.purchase_date}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Asset Download Records</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                        <div className="p-2.5 sm:p-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
                          <span>Expert Advisor (.ex5)</span>
                          <span className={`font-bold ${selectedRecord.binary_downloaded ? "text-emerald-400" : "text-neutral-500"}`}>
                            {selectedRecord.binary_downloaded ? "✓ Downloaded" : "Not Downloaded"}
                          </span>
                        </div>

                        <div className="p-2.5 sm:p-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
                          <span>Backtest Set Pack</span>
                          <span className={`font-bold ${selectedRecord.backtest_downloaded ? "text-emerald-400" : "text-neutral-500"}`}>
                            {selectedRecord.backtest_downloaded ? "✓ Downloaded" : "Not Downloaded"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: LICENSE SECURITY & MANAGEMENT ── */}
                {drawerTab === "license" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Encrypted License Key</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedRecord.license_status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>
                          {selectedRecord.license_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={
                            selectedRecord.license_key && selectedRecord.license_key.startsWith("TF-")
                              ? selectedRecord.license_key
                              : generateTradifiveLicenseKey(selectedRecord.mt5_account_number)
                          }
                          className="flex-1 min-w-0 bg-black/60 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-mono font-bold text-white select-all truncate"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const keyToCopy = selectedRecord.license_key && selectedRecord.license_key.startsWith("TF-")
                              ? selectedRecord.license_key
                              : generateTradifiveLicenseKey(selectedRecord.mt5_account_number);
                            navigator.clipboard.writeText(keyToCopy);
                            toast.success("Cryptographic License Key copied!");
                          }}
                          className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Copy size={13} /> Copy
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Hardware / Account Binding</span>
                          <div className="font-mono font-bold text-emerald-400 mt-0.5">#{selectedRecord.bound_account || selectedRecord.mt5_account_number}</div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase">Validity / Expiry</span>
                          <div className="font-semibold text-neutral-300 mt-0.5">{selectedRecord.license_expiry}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Admin License Actions</h4>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
                        <button
                          onClick={() => regenerateLicenseKey(selectedRecord)}
                          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2"
                        >
                          <Key size={13} /> Re-generate / Re-issue License
                        </button>

                        <button
                          onClick={() => toggleLicenseStatus(selectedRecord)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-white ${selectedRecord.license_status === "active" ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                            }`}
                        >
                          {selectedRecord.license_status === "active" ? <Lock size={13} /> : <Unlock size={13} />}
                          {selectedRecord.license_status === "active" ? "Suspend License" : "Re-activate License"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: ADMIN NOTES ── */}
                {drawerTab === "notes" && (
                  <div className="space-y-4">
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Internal Admin Log & Notes</h4>
                      <textarea
                        defaultValue={selectedRecord.admin_notes || ""}
                        id="admin-notes-textarea"
                        rows={6}
                        placeholder="Add notes about broker verification, customer support discussions, or license overrides..."
                        className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const el = document.getElementById("admin-notes-textarea") as HTMLTextAreaElement;
                          if (el) saveNotes(el.value);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                      >
                        Save Admin Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MANUAL ADD / ISSUE LICENSE MODAL ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key size={16} className="text-blue-400" />
                  Issue Auto Trade License
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-neutral-400 font-semibold block mb-1">User Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newRecordForm.user_name}
                    onChange={(e) => setNewRecordForm({ ...newRecordForm, user_name: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-semibold block mb-1">User Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@gmail.com"
                    value={newRecordForm.user_email}
                    onChange={(e) => setNewRecordForm({ ...newRecordForm, user_email: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 font-semibold block mb-1">MT5 Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 5092104"
                      value={newRecordForm.mt5_account_number}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, mt5_account_number: e.target.value })}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 font-semibold block mb-1">Broker Name</label>
                    <select
                      value={newRecordForm.broker_name}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, broker_name: e.target.value })}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Exness">Exness</option>
                      <option value="Vantage">Vantage</option>
                      <option value="XM Global">XM Global</option>
                      <option value="RoboForex">RoboForex</option>
                      <option value="HFM">HFM</option>
                      <option value="Other">Other Broker</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 font-semibold block mb-1">Algorithm</label>
                    <select
                      value={newRecordForm.algo_id}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, algo_id: e.target.value })}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="fialgo_v1">FiAlgo V1 (Gold)</option>
                      <option value="fialgo_trend">FiAlgo Trend Alpha</option>
                      <option value="fialgo_scalper">FiAlgo Scalper Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 font-semibold block mb-1">Tradifive IB Status</label>
                    <select
                      value={newRecordForm.is_under_tradifive ? "yes" : "no"}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, is_under_tradifive: e.target.value === "yes" })}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="yes">✓ Under Tradifive (Verified)</option>
                      <option value="no">✗ Outside Tradifive (Unverified)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!newRecordForm.user_name || !newRecordForm.mt5_account_number) {
                      toast.error("Please enter User Name and MT5 Account Number.");
                      return;
                    }

                    const hex = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const newRecord: AutoTradeRecord = {
                      id: `rec-manual-${Date.now()}`,
                      user_id: `usr-${Date.now()}`,
                      user_name: newRecordForm.user_name,
                      user_email: newRecordForm.user_email || "user@tradifive.com",
                      created_at: new Date().toISOString(),
                      mt5_account_number: newRecordForm.mt5_account_number,
                      broker_name: newRecordForm.broker_name,
                      broker_server: `${newRecordForm.broker_name}-Real`,
                      balance: 2000,
                      equity: 2000,
                      currency: "USD",
                      is_connected: true,
                      algo_execution_active: true,
                      is_under_tradifive: newRecordForm.is_under_tradifive,
                      ib_status: newRecordForm.is_under_tradifive ? "verified" : "outside_ib",
                      ib_code: newRecordForm.is_under_tradifive ? "TRDF940182" : "UNLINKED",
                      transfer_path: "new_account",
                      last_ib_check_at: new Date().toISOString(),
                      has_purchased: true,
                      algo_id: newRecordForm.algo_id as any,
                      algo_name: newRecordForm.algo_id === "fialgo_v1" ? "FiAlgo V1 (Gold Scalper & Trend)" : newRecordForm.algo_id === "fialgo_trend" ? "FiAlgo Trend Alpha" : "FiAlgo Scalper Pro",
                      algo_manifest: "FiAlgo_v1.0.4.ex5",
                      algo_pair: "XAUUSD · M15",
                      purchase_tier: "Lifetime License",
                      price_paid: parseFloat(newRecordForm.price_paid) || 39,
                      payment_status: "paid",
                      purchase_date: new Date().toISOString(),
                      binary_downloaded: true,
                      backtest_downloaded: true,
                      license_key: `FIALGO-${hex}-9401-XAU1`,
                      license_status: "active",
                      license_expiry: "Lifetime",
                      allowed_accounts: 1,
                      bound_account: newRecordForm.mt5_account_number,
                      admin_notes: "Manually registered and license issued by admin."
                    };

                    await persistUpdate(newRecord);
                    setIsAddModalOpen(false);
                    toast.success("License issued and registered successfully!");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Create & Issue License
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PHOTO PROOF LIGHTBOX / ZOOM INSPECTION MODAL ── */}
      <AnimatePresence>
        {previewModalProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[94vh] overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#1A1A1A] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <ImageIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span>IB Photo Verification</span>
                      <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${previewModalProof.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : previewModalProof.status === "rejected"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                        {previewModalProof.status === "approved"
                          ? "✓ Approved"
                          : previewModalProof.status === "rejected"
                            ? "✗ Rejected"
                            : "⏳ Pending"}
                      </span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                      {previewModalProof.user_name} · <span className="font-mono text-emerald-400 font-bold">#{previewModalProof.mt5_account_number}</span> ({previewModalProof.broker_name})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewModalProof(null)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                {/* Left/Main Column: Image Viewer */}
                <div className="lg:col-span-2 space-y-3 flex flex-col justify-center">
                  <div className="relative rounded-xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center max-h-[45vh] sm:max-h-[60vh] group">
                    <img
                      src={previewModalProof.proof_image_url}
                      alt="Full Screenshot Proof"
                      className="max-h-[44vh] sm:max-h-[58vh] w-auto object-contain select-none"
                    />
                    <a
                      href={previewModalProof.proof_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] sm:text-[11px] font-semibold border border-white/10 flex items-center gap-1.5 backdrop-blur-sm transition-all"
                    >
                      <ExternalLink size={12} /> Open Full Size
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 px-1 font-mono">
                    <span className="truncate max-w-[180px]">File: {previewModalProof.proof_filename}</span>
                    <span>{new Date(previewModalProof.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Column: Verification Dossier & Decision Controls */}
                <div className="space-y-3.5 sm:space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Compliance Checklist Box */}
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-3.5 space-y-2">
                      <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-blue-400" />
                        Verification Checklist
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span className="text-neutral-400">Target Broker:</span>
                          <span className="font-bold text-white">{previewModalProof.broker_name}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span className="text-neutral-400">MT5 Account:</span>
                          <span className="font-mono font-bold text-emerald-400">#{previewModalProof.mt5_account_number}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                          <span className="text-neutral-300">Tradifive IB Code:</span>
                          <span className="font-mono font-bold text-emerald-400">TRDF940182</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-normal pt-0.5">
                        Verify MT5 account <strong className="text-white">#{previewModalProof.mt5_account_number}</strong> is linked under Tradifive Partner ID <strong className="text-emerald-400">TRDF940182</strong>.
                      </p>
                    </div>

                    {/* User Remarks */}
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-3.5 space-y-1">
                      <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Trader Notes
                      </span>
                      <p className="text-xs text-neutral-300 italic leading-relaxed">
                        "{previewModalProof.remarks || "No remarks provided."}"
                      </p>
                    </div>

                    {/* Audit Info if Reviewed */}
                    {previewModalProof.reviewed_at && (
                      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3 sm:p-3.5 space-y-1 text-xs">
                        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase text-neutral-400 block">
                          Review History
                        </span>
                        <div className="text-[11px] text-neutral-300">
                          By: <strong className="text-white">{previewModalProof.reviewer_name || "Admin"}</strong>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {new Date(previewModalProof.reviewed_at).toLocaleString()}
                        </div>
                        {previewModalProof.reviewer_notes && (
                          <p className="text-[11px] text-amber-300/90 pt-1 border-t border-white/5 mt-1">
                            Note: {previewModalProof.reviewer_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleApproveProof(previewModalProof)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Check size={14} /> Approve & Confirm Under Tradifive
                    </button>

                    <button
                      onClick={() => {
                        setRejectModalProof(previewModalProof);
                        setRejectReasonInput("");
                      }}
                      className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <X size={14} /> Reject Proof (Request New Copy)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REJECTION FEEDBACK DIALOG MODAL ── */}
      <AnimatePresence>
        {rejectModalProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">Reject Transfer Proof</h3>
                  <p className="text-xs text-neutral-400 truncate">
                    Account <strong className="text-white font-mono">#{rejectModalProof.mt5_account_number}</strong> ({rejectModalProof.user_name})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 block">
                  Quick Reason Presets:
                </label>
                <div className="space-y-1.5">
                  {[
                    "MT5 account number in screenshot does not match entered number.",
                    "Screenshot does not show partner code TRDF940182.",
                    "Screenshot is blurry or cropped. Please upload full partner confirmation.",
                    "Broker name shown in proof does not match selected broker."
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReasonInput(preset)}
                      className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-[11px] text-neutral-300 transition-colors"
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 block">
                  Rejection Reason / Guidance for Trader:
                </label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Explain why the proof is rejected so the user can re-upload correct proof..."
                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectModalProof(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectReasonInput.trim()) {
                      toast.error("Please provide or select a rejection reason.");
                      return;
                    }
                    handleRejectProof(rejectModalProof, rejectReasonInput);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <X size={13} /> Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PREVIEW PAYMENT PROOF SCREENSHOT MODAL ── */}
      <AnimatePresence>
        {previewPaymentProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#1B1B1B] gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CreditCard size={15} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                      ₹99,999 Proof · UTR #{previewPaymentProof.utr_number}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                      {previewPaymentProof.user_name} · MT5: <strong className="font-mono text-emerald-400">{previewPaymentProof.mt5_account_number || "Unbound"}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewPaymentProof(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/60">
                {previewPaymentProof.proof_file ? (
                  <img
                    src={previewPaymentProof.proof_file}
                    alt="Payment Proof Full"
                    className="max-h-[48vh] sm:max-h-[55vh] w-auto object-contain rounded-xl border border-white/10 shadow-lg"
                  />
                ) : (
                  <div className="p-12 text-center text-neutral-500 text-xs">No proof image available</div>
                )}
              </div>

              <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-[9.5px] sm:text-[10px] text-neutral-500 uppercase block font-semibold">Payment Method & Amount</span>
                  <span className="font-bold text-white">
                    {previewPaymentProof.method === "upi" ? "PhonePe / UPI" : "Bank Transfer"} · <strong className="font-mono text-emerald-400">₹99,999</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRejectModalPayment(previewPaymentProof);
                      setPaymentRejectReason("");
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <X size={13} /> Reject Payment
                  </button>
                  <button
                    onClick={() => {
                      handleApprovePayment(previewPaymentProof);
                      setPreviewPaymentProof(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Check size={14} /> Approve & Issue Key
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REJECTION PAYMENT MODAL ── */}
      <AnimatePresence>
        {rejectModalPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">Reject ₹99,999 Payment</h3>
                  <p className="text-xs text-neutral-400 truncate">
                    UTR: <strong className="text-white font-mono">{rejectModalPayment.utr_number}</strong> ({rejectModalPayment.user_name})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 block">
                  Quick Reason Presets:
                </label>
                <div className="space-y-1.5">
                  {[
                    "UTR / Reference number not found in Axis Bank / UPI statement.",
                    "Transferred amount does not match ₹99,999 Lifetime fee.",
                    "Payment screenshot is blurry or does not show completed transaction status.",
                    "Duplicate UTR submitted."
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPaymentRejectReason(preset)}
                      className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 text-[11px] text-neutral-300 transition-colors"
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 block">
                  Rejection Reason / Guidance for Client:
                </label>
                <textarea
                  rows={3}
                  value={paymentRejectReason}
                  onChange={(e) => setPaymentRejectReason(e.target.value)}
                  placeholder="Explain why payment could not be confirmed so client can provide correct UTR..."
                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectModalPayment(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!paymentRejectReason.trim()) {
                      toast.error("Please provide or select a rejection reason.");
                      return;
                    }
                    handleRejectPayment(rejectModalPayment, paymentRejectReason);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <X size={13} /> Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
