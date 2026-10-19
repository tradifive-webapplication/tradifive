import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bot,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCcw,
  Download,
  Key,
  ShieldCheck,
  ShieldAlert,
  Server,
  DollarSign,
  Copy,
  User,
  Users,
  Plus,
  Eye,
  Lock,
  Unlock,
  Layers,
  Activity,
  FileCode2,
  Zap,
  Info,
  Image as ImageIcon,
  ZoomIn,
  Check,
  X,
  CheckCheck,
  Clock,
  Inbox,
  ExternalLink,
  CreditCard,
  QrCode,
  Landmark,
  Building2,
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
  license_expiry: string;
  allowed_accounts: number;
  bound_account: string;

  // Admin Audit
  admin_notes?: string;
  updated_at?: string;
}

// Real Live Testing Mode: Demo seed records removed
const SEED_RECORDS: AutoTradeRecord[] = [];
const SEED_IB_PROOFS: IbTransferProofRequest[] = [];
const SEED_LICENSE_PAYMENTS: LicensePaymentRequest[] = [];

export default function AdminAutoTrade() {
  const [records, setRecords] = useState<AutoTradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIbStatus, setFilterIbStatus] = useState<"all" | "under_tradifive" | "outside_tradifive">("all");
  const [filterAlgo, setFilterAlgo] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<AutoTradeRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"overview" | "ib_broker" | "algo_purchase" | "license" | "notes">("overview");

  // Main Tab Navigation: accounts | proofs | payments
  const [activeMainTab, setActiveMainTab] = useState<"accounts" | "proofs" | "payments">("accounts");

  // IB Proof Requests State
  const [proofRequests, setProofRequests] = useState<IbTransferProofRequest[]>([]);
  const [proofFilter, setProofFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [proofSearchQuery, setProofSearchQuery] = useState("");
  const [previewModalProof, setPreviewModalProof] = useState<IbTransferProofRequest | null>(null);
  const [rejectModalProof, setRejectModalProof] = useState<IbTransferProofRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");

  // ₹99,999 License Payments State
  const [licensePayments, setLicensePayments] = useState<LicensePaymentRequest[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<"all" | "upi" | "bank">("all");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [previewPaymentProof, setPreviewPaymentProof] = useState<LicensePaymentRequest | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<LicensePaymentRequest | null>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data: settingsData } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "auto_trade_admin_records")
        .maybeSingle();

      const savedOverrides: Record<string, Partial<AutoTradeRecord>> = settingsData?.value || {};

      // 1.5 Fetch proof requests
      const { data: proofData } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "ib_transfer_requests")
        .maybeSingle();

      let proofs: IbTransferProofRequest[] = Array.isArray(proofData?.value) ? proofData.value : [];

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
      } catch (e) {}

      // Real live proofs only - filter out any leftover demo seeds
      proofs = proofs.filter(p => !p.id.startsWith("req-seed-"));
      setProofRequests(proofs);

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

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at, activation_key, avatar_url")
        .limit(50);

      const { data: mt5Accounts } = await supabase
        .from("mt5_accounts")
        .select("*")
        .limit(50);

      const liveRecords: AutoTradeRecord[] = [];
      const mt5Map = new Map();
      (mt5Accounts || []).forEach(acc => mt5Map.set(acc.user_id, acc));

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
        const override = savedOverrides[p.id] || {};

        if (mt5 || p.activation_key || override.has_purchased) {
          const isUnder = override.is_under_tradifive !== undefined ? override.is_under_tradifive : Boolean(mt5?.is_active);
          const hasPurchased = override.has_purchased !== undefined ? override.has_purchased : Boolean(p.activation_key || mt5?.activation_key);
          const key = override.license_key || p.activation_key || mt5?.activation_key || (hasPurchased ? `FIALGO-${p.id.slice(0, 4).toUpperCase()}-9401-XAU1` : "UNISSUED");

          liveRecords.push({
            id: `rec-${p.id}`,
            user_id: p.id,
            user_name: p.full_name || p.email?.split("@")[0] || "User",
            user_email: p.email || "no-email@tradifive.com",
            user_phone: p.phone || "—",
            avatar_url: p.avatar_url,
            created_at: p.created_at || new Date().toISOString(),
            mt5_account_number: override.mt5_account_number || mt5?.account_number || "Pending #",
            broker_name: override.broker_name || mt5?.broker_name || "Exness",
            broker_server: mt5?.broker_server || "Exness-Real",
            balance: mt5?.balance || 2500,
            equity: mt5?.equity || 2500,
            currency: mt5?.currency || "USD",
            leverage: mt5?.leverage || 500,
            is_connected: Boolean(mt5?.is_connected),
            algo_execution_active: Boolean(mt5?.algo_status),
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
            price_paid: override.price_paid !== undefined ? override.price_paid : (hasPurchased ? 39 : 0),
            payment_status: override.payment_status || (hasPurchased ? "paid" : "pending"),
            purchase_date: override.purchase_date || p.created_at || new Date().toISOString(),
            binary_downloaded: override.binary_downloaded !== undefined ? override.binary_downloaded : hasPurchased,
            backtest_downloaded: override.backtest_downloaded !== undefined ? override.backtest_downloaded : hasPurchased,
            license_key: key,
            license_status: override.license_status || (hasPurchased ? "active" : "unissued"),
            license_expiry: override.license_expiry || (hasPurchased ? "Lifetime" : "N/A"),
            allowed_accounts: 1,
            bound_account: override.bound_account || mt5?.account_number || "Unbound",
            admin_notes: override.admin_notes || ""
          });
        }
      });

      // Real live records only - filter out any legacy demo seeds
      const combined = liveRecords.filter(r => !r.id.startsWith("rec-at-00"));
      setRecords(combined);
    } catch (err: any) {
      console.error("Error loading auto trade records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Approve IB Transfer Proof
  const handleApproveProof = async (proof: IbTransferProofRequest) => {
    const updatedProof: IbTransferProofRequest = {
      ...proof,
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewer_name: "Tradifive Compliance Admin",
      reviewer_notes: "Verified under Tradifive IB (TRDF940182). Step 2 unlocked."
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
          parsed.status = "approved";
          parsed.reviewed_at = updatedProof.reviewed_at;
          parsed.reviewer_notes = updatedProof.reviewer_notes;
          localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
        }
      }
    } catch (e) {}

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
      reviewer_name: "Tradifive Compliance Admin",
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
    } catch (e) {}

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
      reviewer_name: "TradiFive Finance Desk",
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
      reviewer_name: "TradiFive Finance Desk",
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

  const persistUpdate = async (updatedRecord: AutoTradeRecord) => {
    try {
      const { data: current } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "auto_trade_admin_records")
        .maybeSingle();

      const existingMap = current?.value || {};
      existingMap[updatedRecord.id] = updatedRecord;

      await supabase
        .from("system_settings")
        .upsert({
          id: "auto_trade_admin_records",
          value: existingMap,
          updated_at: new Date().toISOString()
        });

      setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      if (selectedRecord?.id === updatedRecord.id) {
        setSelectedRecord(updatedRecord);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

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

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.user_name.toLowerCase().includes(q) ||
        r.user_email.toLowerCase().includes(q) ||
        r.mt5_account_number.toLowerCase().includes(q) ||
        r.license_key.toLowerCase().includes(q) ||
        r.broker_name.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (filterIbStatus === "under_tradifive" && !r.is_under_tradifive) return false;
      if (filterIbStatus === "outside_tradifive" && r.is_under_tradifive) return false;
      if (filterAlgo !== "all" && r.algo_id !== filterAlgo) return false;
      return true;
    });
  }, [records, searchQuery, filterIbStatus, filterAlgo]);

  const stats = useMemo(() => {
    const totalUsers = records.length;
    const underTradifive = records.filter(r => r.is_under_tradifive).length;
    const activeLicenses = records.filter(r => r.license_status === "active").length;
    const totalRevenue = records.reduce((sum, r) => sum + (r.price_paid || 0), 0);
    return {
      totalUsers,
      underTradifive,
      outsideTradifive: totalUsers - underTradifive,
      activeLicenses,
      totalRevenue
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

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bot className="text-blue-500" size={30} />
            Auto Trade & Licenses
          </h1>
          <p className="text-slate-400 mt-1">
            Check User MT5 Accounts, Tradifive IB Verification (<span className="text-emerald-400 font-mono font-bold">TRDF940182</span>), Algo Purchases & Licenses.
          </p>
        </div>

        <button
          onClick={loadRecords}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh Live Data
        </button>
      </div>

      {/* ── Pending Payment Review Alert Banner ── */}
      {pendingPaymentsCount > 0 && activeMainTab !== "payments" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <span>{pendingPaymentsCount} ₹99,999 License Payment{pendingPaymentsCount > 1 ? "s" : ""} Awaiting Verification</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 uppercase font-black">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Check 12-digit UTR numbers and payment receipts to issue personal FiAlgo V1 lifetime license keys.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveMainTab("payments")}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <CreditCard size={14} /> Review Payments ({pendingPaymentsCount})
          </button>
        </motion.div>
      )}

      {/* ── Pending IB Proof Review Alert Banner ── */}
      {pendingProofsCount > 0 && activeMainTab !== "proofs" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>{pendingProofsCount} Trader{pendingProofsCount > 1 ? "s" : ""} Submitted Photo Proof for Tradifive IB Transfer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 uppercase font-black">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Inspect screenshot proofs to verify accounts moved under Tradifive IB (<span className="text-emerald-400 font-mono font-bold">TRDF940182</span>) and unlock Step 2 (Bot Download).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveMainTab("proofs")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <Eye size={14} /> Review Proofs ({pendingProofsCount})
          </button>
        </motion.div>
      )}

      {/* ── Top Navigation Tabs ── */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3 flex-wrap">
        <button
          onClick={() => setActiveMainTab("accounts")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
            activeMainTab === "accounts"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-900 text-neutral-400 hover:text-white hover:bg-slate-800 border border-white/5"
          }`}
        >
          <Layers size={14} />
          <span>Auto Trade Registry & Licenses</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeMainTab === "accounts" ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
          }`}>
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("proofs")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 relative ${
            activeMainTab === "proofs"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
              : "bg-slate-900 text-neutral-400 hover:text-white hover:bg-slate-800 border border-white/5"
          }`}
        >
          <ImageIcon size={14} />
          <span>IB Transfer Proofs & Approvals</span>
          {pendingProofsCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-black flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              {pendingProofsCount} PENDING
            </span>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeMainTab === "proofs" ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
            }`}>
              {proofRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab("payments")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 relative ${
            activeMainTab === "payments"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 text-neutral-400 hover:text-white hover:bg-slate-800 border border-white/5"
          }`}
        >
          <CreditCard size={14} className={activeMainTab === "payments" ? "text-white" : "text-emerald-400"} />
          <span>₹99,999 Payments</span>
          {pendingPaymentsCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-black flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              {pendingPaymentsCount} PENDING
            </span>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeMainTab === "payments" ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
            }`}>
              {licensePayments.length}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: ACCOUNTS REGISTRY ── */}
      {activeMainTab === "accounts" && (
        <div className="space-y-8">
          {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all shadow-sm">
              <Users size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">{stats.totalUsers}</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">TOTAL ACCOUNTS</p>
            <p className="text-[11px] text-neutral-500 mt-1">Platform MT5 records</p>
          </div>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all shadow-sm">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mb-1">{stats.underTradifive}</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">UNDER TRADIFIVE IB</p>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified TRDF940182
            </p>
          </div>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-105 group-hover:bg-rose-500/20 transition-all shadow-sm">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mb-1">{stats.outsideTradifive}</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">OUTSIDE TRADIFIVE</p>
            <p className="text-[11px] text-neutral-500 mt-1">Unlinked / Outside IB</p>
          </div>
        </div>

        <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all shadow-sm">
              <Key size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight mb-1">{stats.activeLicenses}</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">ACTIVE BOT LICENSES</p>
            <p className="text-[11px] text-neutral-500 mt-1">Total Rev: ${stats.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by User Name, Email, MT5 #, License Key, Broker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterIbStatus}
          onChange={(e: any) => setFilterIbStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none"
        >
          <option value="all">IB: All Records</option>
          <option value="under_tradifive">✓ Under Tradifive</option>
          <option value="outside_tradifive">✗ Outside Tradifive</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">MT5 Account & Broker</th>
                <th className="px-5 py-4">Under Tradifive?</th>
                <th className="px-5 py-4">Algo Purchased</th>
                <th className="px-5 py-4">License Key</th>
                <th className="px-5 py-4">Balance</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No matching Auto Trade records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedRecord(r);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{r.user_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.user_email}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-white">#{r.mt5_account_number}</div>
                      <div className="text-[11px] text-slate-400">{r.broker_name} · {r.broker_server}</div>
                    </td>

                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        {r.is_under_tradifive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={12} /> UNDER TRADIFIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle size={12} /> OUTSIDE TRADIFIVE
                          </span>
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleUnderTradifive(r)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white underline"
                          >
                            {r.is_under_tradifive ? "Mark Outside" : "✓ Mark Under Tradifive"}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{r.algo_name}</div>
                      <div className="text-[11px] text-slate-400">{r.purchase_tier} {r.price_paid > 0 && `($${r.price_paid})`}</div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-neutral-300">
                      {r.license_key}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-white">
                      ${r.balance?.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedRecord(r);
                          setIsDrawerOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
                      >
                        Inspect
                      </button>
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
        <div className="space-y-6">
          {/* Proofs KPI Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all shadow-sm">
                  <Inbox size={18} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">{proofStats.total}</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">TOTAL PROOF REQUESTS</p>
                <p className="text-[11px] text-neutral-500 mt-1">Submitted verification requests</p>
              </div>
            </div>

            <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all shadow-sm">
                  <Clock size={18} />
                </div>
                {proofStats.pending > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mb-1">{proofStats.pending}</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">PENDING ADMIN REVIEW</p>
                <p className="text-[11px] text-neutral-500 mt-1">Awaiting screenshot verification</p>
              </div>
            </div>

            <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all shadow-sm">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mb-1">{proofStats.approved}</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">APPROVED UNDER TRADIFIVE</p>
                <p className="text-[11px] text-neutral-500 mt-1">Verified & unlocked Step 2 (Bot)</p>
              </div>
            </div>

            <div className="bg-[#161618] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-105 group-hover:bg-rose-500/20 transition-all shadow-sm">
                  <XCircle size={18} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mb-1">{proofStats.rejected}</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">REJECTED PROOFS</p>
                <p className="text-[11px] text-neutral-500 mt-1">Flagged with feedback for re-upload</p>
              </div>
            </div>
          </div>

          {/* Proofs Filter and Search Bar */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search proofs by user name, email, MT5 account #, or broker..."
                value={proofSearchQuery}
                onChange={(e) => setProofSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {proofSearchQuery && (
                <button
                  onClick={() => setProofSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setProofFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  proofFilter === "all"
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({proofStats.total})
              </button>
              <button
                onClick={() => setProofFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  proofFilter === "pending"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <Clock size={12} /> Pending Review ({proofStats.pending})
              </button>
              <button
                onClick={() => setProofFilter("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  proofFilter === "approved"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <Check size={12} /> Approved ({proofStats.approved})
              </button>
              <button
                onClick={() => setProofFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  proofFilter === "rejected"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                    : "text-rose-400 hover:bg-rose-500/10"
                }`}
              >
                <X size={12} /> Rejected ({proofStats.rejected})
              </button>
            </div>
          </div>

          {/* Proofs Queue Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={15} className="text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  IB Transfer Proof Requests ({filteredProofRequests.length})
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Inspect screenshot to verify partner code <strong className="text-emerald-400 font-mono">TRDF940182</strong> before approving
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Trader Identity</th>
                    <th className="px-5 py-4">MT5 Account & Broker</th>
                    <th className="px-5 py-4">Screenshot / Photo Proof</th>
                    <th className="px-5 py-4">User Remarks</th>
                    <th className="px-5 py-4">Status & Audit</th>
                    <th className="px-5 py-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredProofRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center text-slate-500">
                        <ImageIcon size={26} className="mx-auto mb-2 text-slate-600" />
                        No transfer proof requests match this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProofRequests.map((proof) => (
                      <tr key={proof.id} className="hover:bg-slate-900/40 transition-colors">
                        {/* Trader Identity */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                              {proof.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {proof.user_name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {proof.user_email}
                              </div>
                              {proof.user_phone && (
                                <div className="text-[10px] text-slate-500">
                                  {proof.user_phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* MT5 Account & Broker */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="font-mono font-bold text-white flex items-center gap-1.5">
                              #{proof.mt5_account_number}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(proof.mt5_account_number);
                                  toast.success("MT5 Account copied!");
                                }}
                                className="text-slate-500 hover:text-white"
                                title="Copy MT5 Number"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {proof.broker_name}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              Submitted: {new Date(proof.submitted_at).toLocaleDateString()} {new Date(proof.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </td>

                        {/* Photo Proof Thumbnail Box */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <div
                              onClick={() => setPreviewModalProof(proof)}
                              className="relative w-36 h-20 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-500/50 cursor-pointer group bg-black/60 shadow-md transition-all"
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
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px] font-mono">
                              📎 {proof.proof_filename}
                            </div>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="px-5 py-4 max-w-[200px]">
                          <p className="text-[11px] text-slate-300 italic line-clamp-3 leading-relaxed">
                            "{proof.remarks || "No user remarks provided."}"
                          </p>
                        </td>

                        {/* Status & Review Audit */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                proof.status === "approved"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : proof.status === "rejected"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
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
                              <p className="text-[10px] text-slate-400 border-l-2 border-slate-700 pl-2 mt-1 leading-snug">
                                {proof.reviewer_notes}
                              </p>
                            )}

                            {proof.reviewed_at && (
                              <div className="text-[9.5px] text-slate-500">
                                Reviewed: {new Date(proof.reviewed_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => setPreviewModalProof(proof)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all w-full justify-center"
                            >
                              <Eye size={13} /> Inspect Photo
                            </button>

                            {proof.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveProof(proof)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all w-full justify-center"
                                >
                                  <Check size={13} /> Approve Under Tradifive
                                </button>

                                <button
                                  onClick={() => {
                                    setRejectModalProof(proof);
                                    setRejectReasonInput("");
                                  }}
                                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all w-full justify-center"
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
                                  className="text-[10px] text-slate-500 hover:text-rose-400 underline ml-1"
                                >
                                  Change
                                </button>
                              </div>
                            )}

                            {proof.status === "rejected" && (
                              <button
                                onClick={() => handleApproveProof(proof)}
                                className="px-3 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded text-[11px] font-bold transition-all"
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

      {/* ── TAB 3: ₹99,999 LICENSE PAYMENTS (UPI & BANK TRANSFER) ── */}
      {activeMainTab === "payments" && (
        <div className="space-y-6">
          {/* ── Official Receiving Account Details Strip ── */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl shadow-emerald-950/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CreditCard size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Official TradiFive Payment Accounts</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Amount: ₹99,999 (Lifetime)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Traders pay to these official accounts via PhonePe/UPI QR or Axis Bank IMPS/NEFT, then submit their 12-digit UTR.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* UPI Box */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <QrCode size={16} className="text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">PhonePe / UPI ID</div>
                      <div className="font-mono font-bold text-white text-xs truncate select-all">9731980756@axisbank</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("9731980756@axisbank");
                      toast.success("UPI ID Copied: 9731980756@axisbank");
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                    title="Copy UPI ID"
                  >
                    <Copy size={12} />
                  </button>
                </div>

                {/* Bank Box */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Landmark size={16} className="text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Axis Bank Transfer</div>
                      <div className="font-mono font-bold text-white text-xs truncate">
                        A/C: <span className="select-all">924010072811588</span> · IFSC: <span className="select-all">UTIB0001690</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("924010072811588");
                      toast.success("Bank Account # Copied: 924010072811588");
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                    title="Copy Account Number"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── KPI Metric Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total ₹99k Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                ₹{paymentStats.revenueInr.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {paymentStats.approved} Verified Lifetime Licenses
              </p>
            </div>

            <div
              onClick={() => setPaymentFilter("pending")}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all cursor-pointer ${
                paymentFilter === "pending"
                  ? "border-amber-500/60 bg-amber-500/[0.04]"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {paymentStats.pending}
                </div>
                {paymentStats.pending > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting bank verification & key issuance</p>
            </div>

            <div
              onClick={() => setPaymentFilter("approved")}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all cursor-pointer ${
                paymentFilter === "approved"
                  ? "border-emerald-500/60 bg-emerald-500/[0.04]"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Verified & Issued</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {paymentStats.approved}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Keys generated & Step 4 unlocked</p>
            </div>

            <div
              onClick={() => setPaymentFilter("rejected")}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all cursor-pointer ${
                paymentFilter === "rejected"
                  ? "border-rose-500/60 bg-rose-500/[0.04]"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Rejected</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <XCircle size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">
                {paymentStats.rejected}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Invalid UTR or failed screenshot</p>
            </div>
          </div>

          {/* ── Filter & Search Toolbar ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by 12-digit UTR, Client Name, Email, or MT5 Account..."
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-slate-800 rounded-xl shrink-0 flex-wrap">
                {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      paymentFilter === st
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "all" ? "All Status" : st}
                  </button>
                ))}
              </div>

              {/* Method Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-slate-800 rounded-xl shrink-0">
                {(["all", "upi", "bank"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethodFilter(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      paymentMethodFilter === m
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "all" ? "All Methods" : m === "upi" ? "PhonePe / UPI" : "Bank"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
              <div>
                Showing <strong className="text-white font-mono">{filteredPayments.length}</strong> of{" "}
                <strong className="text-white font-mono">{licensePayments.length}</strong> payment requests
              </div>
              <div className="text-[11px] text-slate-500">
                Approving automatically generates <span className="text-emerald-400 font-mono font-bold">FIALGO-V1-XXXX-YYYY-GOLD</span> key & unlocks trader's Step 4.
              </div>
            </div>
          </div>

          {/* ── Payments Data Table ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="px-5 py-4">Client & MT5 Account</th>
                    <th className="px-5 py-4">Algorithm & Plan</th>
                    <th className="px-5 py-4">Payment Method & UTR</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Proof Screenshot</th>
                    <th className="px-5 py-4">Status & License</th>
                    <th className="px-5 py-4">Submitted At</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                        <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold text-slate-400">No payment records found</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {paymentSearchQuery || paymentFilter !== "all"
                            ? "Try adjusting your filters or search query"
                            : "New ₹99,999 PhonePe / UPI or Bank transfer requests will appear here in real-time."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Client / MT5 */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {payment.user_name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{payment.user_name}</div>
                              <div className="text-[11px] text-slate-400 truncate">{payment.user_email}</div>
                              <div className="text-[10.5px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <span>MT5:</span>
                                <strong className="text-emerald-400 font-bold">{payment.mt5_account_number || "—"}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Algorithm */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <span className="font-bold text-white text-xs block">
                              {payment.algo_name || "FiAlgo V1 Lifetime License"}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 inline-block">
                              Lifetime License
                            </span>
                          </div>
                        </td>

                        {/* Method & UTR */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {payment.method === "upi" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                                  <QrCode size={11} /> PhonePe / UPI
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                                  <Landmark size={11} /> Bank Transfer
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
                                className="text-slate-500 hover:text-white p-0.5"
                                title="Copy UTR"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4">
                          <div className="font-mono font-black text-white text-sm">
                            ₹{Number(payment.amount || 99999).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">100% Paid</span>
                        </td>

                        {/* Proof Screenshot */}
                        <td className="px-5 py-4">
                          {payment.proof_file ? (
                            <div
                              onClick={() => setPreviewPaymentProof(payment)}
                              className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-700 group cursor-pointer bg-black/40 shrink-0"
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
                            <span className="text-slate-500 text-[11px] italic">No image file</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
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
                        <td className="px-5 py-4">
                          <div className="text-[11px] text-slate-300">
                            {new Date(payment.submitted_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {new Date(payment.submitted_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
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
                                className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-[11px] font-mono flex items-center gap-1"
                              >
                                <Key size={11} className="text-emerald-400" /> Copy Key
                              </button>
                            )}

                            {payment.status === "rejected" && (
                              <button
                                onClick={() => handleApprovePayment(payment)}
                                className="h-7 px-2.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded text-[11px] font-semibold transition-all"
                              >
                                Re-Approve
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

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full max-w-xl h-full bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedRecord.user_name}</h3>
                  <p className="text-xs text-slate-400">{selectedRecord.user_email}</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border ${
                selectedRecord.is_under_tradifive ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-rose-950/20 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">
                      {selectedRecord.is_under_tradifive ? "✓ Verified Under Tradifive IB (TRDF940182)" : "✗ Outside Tradifive"}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">MT5 Account: #{selectedRecord.mt5_account_number}</p>
                  </div>
                  <button
                    onClick={() => toggleUnderTradifive(selectedRecord)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg"
                  >
                    Toggle
                  </button>
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
                  <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1.5">
                        <ImageIcon size={13} /> Uploaded IB Transfer Photo Proof
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          userProof.status === "approved"
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
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => setPreviewModalProof(userProof)}
                        className="relative w-28 h-20 rounded-lg overflow-hidden border border-slate-700 group cursor-pointer shrink-0 bg-black/60"
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
                      <div className="space-y-1.5 text-xs flex-1">
                        <p className="text-slate-300 font-semibold">{userProof.proof_filename}</p>
                        <p className="text-slate-400 text-[11px] italic">"{userProof.remarks || "No user remarks provided."}"</p>
                        <div className="flex items-center gap-2 pt-1">
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

              {/* Algo & License */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Algo & License Specification</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Algorithm</span>
                    <strong className="text-white">{selectedRecord.algo_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Package</span>
                    <strong className="text-white">{selectedRecord.purchase_tier}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Amount Paid</span>
                    <strong className="text-emerald-400 font-mono">${selectedRecord.price_paid} USD</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Binary File</span>
                    <strong className="text-white font-mono">{selectedRecord.algo_manifest}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-500 block text-[10px] uppercase">License Key</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedRecord.license_key}
                      className="flex-1 bg-black/50 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono font-bold text-white"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedRecord.license_key);
                        toast.success("Copied!");
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Internal Notes</h4>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/60 leading-relaxed">
                  {selectedRecord.admin_notes || "No admin notes added."}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PHOTO PROOF LIGHTBOX / ZOOM INSPECTION MODAL ── */}
      <AnimatePresence>
        {previewModalProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      IB Transfer Photo Verification
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        previewModalProof.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : previewModalProof.status === "rejected"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {previewModalProof.status === "approved"
                          ? "✓ Approved Under Tradifive"
                          : previewModalProof.status === "rejected"
                          ? "✗ Rejected"
                          : "⏳ Pending Review"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Trader: <strong className="text-white">{previewModalProof.user_name}</strong> ({previewModalProof.user_email}) · MT5: <span className="font-mono text-emerald-400 font-bold">#{previewModalProof.mt5_account_number}</span> ({previewModalProof.broker_name})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewModalProof(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left/Main Column: Image Viewer */}
                <div className="lg:col-span-2 space-y-3 flex flex-col justify-center">
                  <div className="relative rounded-xl overflow-hidden bg-black/80 border border-slate-800 flex items-center justify-center max-h-[60vh] group">
                    <img
                      src={previewModalProof.proof_image_url}
                      alt="Full Screenshot Proof"
                      className="max-h-[58vh] w-auto object-contain select-none"
                    />
                    <a
                      href={previewModalProof.proof_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1.5 backdrop-blur-sm transition-all"
                    >
                      <ExternalLink size={12} /> Open Full Size
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                    <span>File: {previewModalProof.proof_filename}</span>
                    <span>Submitted: {new Date(previewModalProof.submitted_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Right Column: Verification Checklist & Decision Controls */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    {/* Compliance Checklist Box */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-blue-400" />
                        Verification Checklist
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">Target Broker:</span>
                          <span className="font-bold text-white">{previewModalProof.broker_name}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">MT5 Account:</span>
                          <span className="font-mono font-bold text-emerald-400">#{previewModalProof.mt5_account_number}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                          <span className="text-slate-300">Tradifive IB Code:</span>
                          <span className="font-mono font-bold text-emerald-400">TRDF940182</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal pt-1">
                        Ensure the screenshot explicitly verifies that MT5 account <strong className="text-white">#{previewModalProof.mt5_account_number}</strong> is linked under Tradifive Partner ID <strong className="text-emerald-400">TRDF940182</strong>.
                      </p>
                    </div>

                    {/* User Remarks */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Trader Notes
                      </span>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{previewModalProof.remarks || "No additional remarks submitted by trader."}"
                      </p>
                    </div>

                    {/* Audit Info if Reviewed */}
                    {previewModalProof.reviewed_at && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Review History
                        </span>
                        <div className="text-[11px] text-slate-300">
                          Reviewed by: <strong className="text-white">{previewModalProof.reviewer_name || "Admin"}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(previewModalProof.reviewed_at).toLocaleString()}
                        </div>
                        {previewModalProof.reviewer_notes && (
                          <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800 mt-1">
                            Note: {previewModalProof.reviewer_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
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
                      <X size={14} /> Reject Proof (Request Clearer Copy)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reject Transfer Proof</h3>
                  <p className="text-xs text-slate-400">
                    Account <strong className="text-white font-mono">#{rejectModalProof.mt5_account_number}</strong> ({rejectModalProof.user_name})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
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
                      className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Rejection Reason / Guidance for Trader:
                </label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Explain why the proof is rejected so the user can re-upload correct proof..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectModalProof(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <CreditCard size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      ₹99,999 Payment Proof · UTR #{previewPaymentProof.utr_number}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Client: <strong className="text-white">{previewPaymentProof.user_name}</strong> ({previewPaymentProof.user_email}) · MT5: <strong className="font-mono text-emerald-400">{previewPaymentProof.mt5_account_number || "Unbound"}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewPaymentProof(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/60">
                {previewPaymentProof.proof_file ? (
                  <img
                    src={previewPaymentProof.proof_file}
                    alt="Payment Proof Full"
                    className="max-h-[55vh] w-auto object-contain rounded-xl border border-slate-800 shadow-lg"
                  />
                ) : (
                  <div className="p-12 text-center text-neutral-500">No proof image available</div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Payment Method & Amount</span>
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
                    className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <X size={13} /> Reject Payment
                  </button>
                  <button
                    onClick={() => {
                      handleApprovePayment(previewPaymentProof);
                      setPreviewPaymentProof(null);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Check size={14} /> Approve & Issue License Key
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reject ₹99,999 Payment</h3>
                  <p className="text-xs text-neutral-400">
                    UTR: <strong className="text-white font-mono">{rejectModalPayment.utr_number}</strong> ({rejectModalPayment.user_name})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
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
                      className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Rejection Reason / Guidance for Client:
                </label>
                <textarea
                  rows={3}
                  value={paymentRejectReason}
                  onChange={(e) => setPaymentRejectReason(e.target.value)}
                  placeholder="Explain why payment could not be confirmed so client can provide correct UTR..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectModalPayment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
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
