import React, { useState, useEffect } from "react";
import { 
  Download, Copy, CheckCircle2, Lock, Mail, Play, Pause, Power, 
  ExternalLink, ArrowRight, ArrowLeft, X, Zap, Package, Shield, ShieldCheck, Check, 
  Terminal, Camera, UploadCloud, Clock, Image as ImageIcon, 
  Headset, Send, RefreshCw, Calculator, Calendar, Sparkles, ChevronRight,
  AlertCircle, DollarSign, MessageCircle, AlertTriangle, Coins, Layers,
  Sliders, FileCode, Cpu, Activity, QrCode, Landmark, CreditCard, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import AutoTradeProfitCalculator from "@/components/AutoTradeProfitCalculator";
import { supabase } from "@/lib/supabase";

// ─── BROKER CONFIGURATIONS ──────────────────────────────────────
const BROKERS = [
  { 
    id: 'vantage', 
    name: 'Vantage Markets', 
    url: 'https://vigco.co/la-com-inv/MCTDw2R6', 
    supportEmail: 'support@vantagemarkets.com', 
    tagline: 'Raw ECN · Low Spreads',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6'
  },
  { id: 'exness', name: 'Exness', url: 'https://exness.com/ib', supportEmail: 'support@exness.com', tagline: 'Instant Withdrawals · Zero Swap', ibNumber: '27863221', referralCode: 'MCTDw2R6' },
  { id: 'xm', name: 'XM Global', url: 'https://xm.com/ib', supportEmail: 'support@xm.com', tagline: 'Ultra Low Spread', ibNumber: '27863221', referralCode: 'MCTDw2R6' },
  { id: 'fusion', name: 'Fusion Markets', url: 'https://fusionmarkets.com/ib', supportEmail: 'help@fusionmarkets.com', tagline: 'Lowest Commission', ibNumber: '27863221', referralCode: 'MCTDw2R6' },
  { id: 'blackbull', name: 'BlackBull', url: 'https://blackbull.com/ib', supportEmail: 'support@blackbullmarkets.com', tagline: 'Institutional Execution', ibNumber: '27863221', referralCode: 'MCTDw2R6' },
];

const BrokerLogo = ({ id, size = 24 }: { id: string; size?: number }) => {
  switch (id) {
    case 'vantage':
      return (
        <div style={{ width: size, height: size }} className="rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs overflow-hidden border border-slate-200/70 p-0.5">
          <img src="/vantage-logo.png" alt="Vantage Markets" className="w-full h-full object-contain" />
        </div>
      );
    case 'exness':
      return (
        <div style={{ width: size, height: size }} className="rounded-lg bg-[#FFD400] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
          <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="none">
            <path d="M9 13C9 11 11 9.5 13.5 9.5C16 9.5 18 11.2 18 13.5H12C12 15 13 16 14.5 16C15.8 16 16.5 15.3 17 14.7L18.8 15.5C18 17 16.5 18 14.5 18C11 18 9 15.8 9 13ZM12 12H15C14.8 11.2 14.2 10.8 13.5 10.8C12.8 10.8 12.2 11.2 12 12Z" fill="#171717" />
            <path d="M19 13.5L21 16.5L23 13.5H25L22.2 17.5L25 21.5H23L21 18.5L19 21.5H17L19.8 17.5L17 13.5H19Z" fill="#171717" />
          </svg>
        </div>
      );
    case 'xm':
      return (
        <div style={{ width: size, height: size }} className="rounded-lg bg-[#111113] border border-white/5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden font-black">
          <span className="text-[9px] tracking-tight font-black">
            <span className="text-white">X</span>
            <span className="text-[#D31124]">M</span>
          </span>
        </div>
      );
    case 'fusion':
      return (
        <div style={{ width: size, height: size }} className="rounded-lg bg-[#0B132B] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
          <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="none">
            <circle cx="16" cy="16" r="7.5" stroke="#00B4D8" strokeWidth="2" strokeDasharray="11 3" />
            <circle cx="16" cy="16" r="3" fill="#00E5FF" />
          </svg>
        </div>
      );
    case 'blackbull':
      return (
        <div style={{ width: size, height: size }} className="rounded-lg bg-[#09090B] border border-white/5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
          <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="none">
            <path d="M10 12C11 14.5 12.5 15.5 13.5 18C14.5 20.5 15.5 22 16 22C16.5 22 17.5 20.5 18.5 18C19.5 15.5 21 14.5 22 12C19.5 13 18.5 14.5 16 14.5C13.5 14.5 12.5 13 10 12Z" fill="#F59E0B" />
          </svg>
        </div>
      );
    default:
      return (
        <div style={{ width: size, height: size }} className="rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-500 font-bold text-xs">
          {id.charAt(0).toUpperCase()}
        </div>
      );
  }
};

// Cryptographic Key Generator matching Tradifive.mq5 FNV-1a algorithm & TF_SALT
export const generateTradifiveLicenseKey = (mt5AccountNumber?: string | number, expDays: number = 10000): string => {
  const salt = "TFv1-Zk39xQ-7mLpA2";
  const numClean = String(mt5AccountNumber || "").replace(/\D/g, "");
  if (!numClean) return "";
  const login = BigInt(numClean);

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

export default function AITrading() {
  const navigate = useNavigate();

  // Active Wizard Step: 1, 2, or 3 (Shows ONE step at a time for maximum clarity!)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Setup mode & selection - default to user's connected Exness broker
  const [setupPath, setSetupPath] = useState<"new" | "transfer">("transfer");
  const [selectedBroker, setSelectedBroker] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("tradifive_ib_proof_request");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.broker_name && parsed.broker_name.toLowerCase().includes("vantage")) return "vantage";
      }
    } catch (e) {}
    return "exness";
  });

  // Account & Verification - clean and empty by default for all new accounts
  const [mt5Account, setMt5Account] = useState<string>("");
  const [ibVerified, setIbVerified] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(true);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>("");
  const [proofRemarks, setProofRemarks] = useState<string>("");
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);
  const [transferRequestStatus, setTransferRequestStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [showProofPreviewModal, setShowProofPreviewModal] = useState<boolean>(false);

  // Bot State & Setup Flags
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  // Step 3: Lifetime License Payment State (₹9,999)
  const [paymentStatus, setPaymentStatus] = useState<"none" | "pending" | "approved">(() => {
    try {
      const req = localStorage.getItem("tradifive_payment_request");
      const saved = localStorage.getItem("tradifive_payment_status");
      // Only approved or pending if an actual payment request was submitted
      if (saved === "approved" && req) return "approved";
      if (saved === "pending" && req) return "pending";
      return "none";
    } catch (e) {
      return "none";
    }
  });

  const hasPaid = paymentStatus === "approved";
  const [searchParams] = useSearchParams();
  
  // Single official plan: ₹9,999 Setup Fee + Weekly 50/50% Profit Share
  const [selectedTier] = useState<"performance_weekly_50">("performance_weekly_50");
  
  // Weekly Settlement & Withdrawal Cohort Day (Mon–Sun)
  const [settlementDay, setSettlementDay] = useState<string>(() => {
    try {
      return localStorage.getItem("tradifive_settlement_day") || "Wednesday";
    } catch (e) {
      return "Wednesday";
    }
  });

  const tradifiveId = React.useMemo(() => {
    const clean = String(mt5Account || (typeof window !== "undefined" ? localStorage.getItem("tradifive_connected_mt5_account") : "") || "").replace(/\D/g, "");
    if (clean.length >= 4) {
      return `TRDF-${clean.slice(-6).padStart(6, "0")}`;
    }
    return (typeof window !== "undefined" ? localStorage.getItem("tradifive_user_id_short") : "") || "TRDF-849201";
  }, [mt5Account]);

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [paymentUtr, setPaymentUtr] = useState<string>(() => {
    try {
      const req = localStorage.getItem("tradifive_payment_request");
      return req ? JSON.parse(req).utr_number || "" : "";
    } catch (e) {
      return "";
    }
  });
  const [paymentProofFile, setPaymentProofFile] = useState<string | null>(() => {
    try {
      const req = localStorage.getItem("tradifive_payment_request");
      return req ? JSON.parse(req).proof_file || null : null;
    } catch (e) {
      return null;
    }
  });
  const [paymentProofFileName, setPaymentProofFileName] = useState<string>("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [isBotRunning, setIsBotRunning] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("tradifive_bot_status");
      return saved ? saved === "active" : true;
    } catch (e) {
      return true;
    }
  });

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPartnerId, setCopiedPartnerId] = useState(false);

  // On mount: fetch the authenticated user's own MT5 account number from Supabase
  // This prevents showing old account numbers when a new user logs in
  useEffect(() => {
    const fetchUserMt5Account = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMt5Account("");
          return;
        }

        const { data: acc } = await supabase
          .from("mt5_accounts")
          .select("account_number, broker_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (acc?.account_number) {
          const accStr = String(acc.account_number).replace(/\D/g, "");
          setMt5Account(accStr);
          if (acc.broker_name) {
            const found = BROKERS.find(b => b.name.toLowerCase().includes(acc.broker_name!.toLowerCase()));
            if (found) setSelectedBroker(found.id);
          }
        } else {
          // Check system_settings auto_trade_admin_records as fallback
          try {
            const { data: recData } = await supabase
              .from("system_settings")
              .select("value")
              .eq("id", "auto_trade_admin_records")
              .maybeSingle();
            let matchedRec: any = null;
            if (recData?.value && typeof recData.value === "object") {
              const list = Object.values(recData.value) as any[];
              matchedRec = list.find(r => r.user_id === user.id || (user.email && r.user_email === user.email));
            }
            if (matchedRec?.bound_account || matchedRec?.mt5_account_number) {
              const num = String(matchedRec.bound_account || matchedRec.mt5_account_number).replace(/\D/g, "");
              setMt5Account(num);
              if (matchedRec.broker_name) {
                const found = BROKERS.find(b => b.name.toLowerCase().includes(matchedRec.broker_name.toLowerCase()));
                if (found) setSelectedBroker(found.id);
              }
            } else {
              setMt5Account("");
            }
          } catch (e) {
            setMt5Account("");
          }
        }
      } catch (e) {
        setMt5Account("");
      }
    };
    fetchUserMt5Account();
  }, []);

  // Sync saved proof request on mount and periodic check
  useEffect(() => {
    const checkProofStatus = async () => {
      let currentUser: any = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
        const local = localStorage.getItem("tradifive_ib_proof_request");

        if (local) {
          const parsed = JSON.parse(local);
          // If proof belongs to another user, wipe it
          if (user && parsed.user_id && parsed.user_id !== user.id && !parsed.user_id.startsWith("usr-")) {
            localStorage.removeItem("tradifive_ib_proof_request");
            localStorage.removeItem("tradifive_connected_mt5_account");
          } else if (parsed.status === "approved") {
            setIbVerified(true);
            setTransferRequestStatus("approved");
          } else if (parsed.status === "pending") {
            setTransferRequestStatus("pending");
            if (parsed.proof_image_url) setProofFile(parsed.proof_image_url);
            if (parsed.proof_filename) setProofFileName(parsed.proof_filename);
            if (parsed.broker_name) {
              const found = BROKERS.find(b => b.name.toLowerCase().includes(parsed.broker_name.toLowerCase()));
              if (found) setSelectedBroker(found.id);
            }
          }
        }
      } catch (e) {}

      // 1. Check if user already has an active account in public.mt5_accounts
      try {
        if (currentUser?.id) {
          const { data: activeAcc } = await supabase
            .from("mt5_accounts")
            .select("account_number, is_active, is_connected, broker_name")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (activeAcc && (activeAcc.is_active || activeAcc.is_connected)) {
            setIbVerified(true);
            setTransferRequestStatus("approved");
            const cleanAcc = String(activeAcc.account_number).replace(/\D/g, "");
            setMt5Account(cleanAcc);
            localStorage.setItem("tradifive_connected_mt5_account", cleanAcc);
            const savedReq = localStorage.getItem("tradifive_ib_proof_request");
            const parsedReq = savedReq ? JSON.parse(savedReq) : {};
            parsedReq.status = "approved";
            parsedReq.mt5_account_number = cleanAcc;
            localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsedReq));
          }
        }
      } catch (e) {}

      // 2. Check auto_trade_admin_records (where admin verifies accounts in admin portal)
      try {
        const { data: recData } = await supabase
          .from("system_settings")
          .select("value")
          .eq("id", "auto_trade_admin_records")
          .maybeSingle();

        if (recData?.value && typeof recData.value === "object") {
          const recordsList = Object.values(recData.value) as any[];
          const matchedAdmin = recordsList.find(r => 
            (currentUser && (r.user_id === currentUser.id || (currentUser.email && r.user_email === currentUser.email))) ||
            (mt5Account && (r.bound_account === mt5Account || r.mt5_account_number === mt5Account))
          );

          if (matchedAdmin && (matchedAdmin.is_under_tradifive === true || matchedAdmin.ib_status === "verified")) {
            setIbVerified(true);
            setTransferRequestStatus("approved");
            const accNum = String(matchedAdmin.bound_account || matchedAdmin.mt5_account_number || mt5Account).replace(/\D/g, "");
            if (accNum && !mt5Account) setMt5Account(accNum);
            localStorage.setItem("tradifive_connected_mt5_account", accNum);
            const savedReq = localStorage.getItem("tradifive_ib_proof_request");
            const parsedReq = savedReq ? JSON.parse(savedReq) : {};
            parsedReq.status = "approved";
            parsedReq.mt5_account_number = accNum;
            localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsedReq));
          }
        }
      } catch (e) {}

      // 3. Check ib_transfer_requests table in system_settings
      try {
        const { data } = await supabase
          .from("system_settings")
          .select("*")
          .eq("id", "ib_transfer_requests")
          .maybeSingle();

        if (data?.value && Array.isArray(data.value)) {
          const local = localStorage.getItem("tradifive_ib_proof_request");
          const parsed = local ? JSON.parse(local) : {};
          const matching = data.value.find((r: any) =>
            (parsed.id && r.id === parsed.id) ||
            (parsed.mt5_account_number && r.mt5_account_number === parsed.mt5_account_number) ||
            (mt5Account && r.mt5_account_number === mt5Account) ||
            (currentUser && (r.user_id === currentUser.id || (currentUser.email && r.user_email === currentUser.email)))
          );

          if (matching) {
            if (matching.status === "approved") {
              setIbVerified(true);
              setTransferRequestStatus("approved");
              parsed.status = "approved";
              if (matching.mt5_account_number) {
                parsed.mt5_account_number = matching.mt5_account_number;
                if (!mt5Account) setMt5Account(matching.mt5_account_number);
              }
              localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
            } else if (matching.status === "pending") {
              setTransferRequestStatus("pending");
            }
          }
        }
      } catch (err) {}

      // 4. Check payment verification status from license_payment_requests
      try {
        const localPay = localStorage.getItem("tradifive_payment_request");
        const parsedPay = localPay ? JSON.parse(localPay) : {};
        if (parsedPay.status === "approved") {
          setPaymentStatus("approved");
        }

        const { data: payData } = await supabase
          .from("system_settings")
          .select("*")
          .eq("id", "license_payment_requests")
          .maybeSingle();

        if (payData?.value && Array.isArray(payData.value)) {
          const matched = payData.value.find((r: any) =>
            (parsedPay.id && r.id === parsedPay.id) ||
            (parsedPay.utr_number && r.utr_number === parsedPay.utr_number) ||
            (paymentUtr && r.utr_number === paymentUtr) ||
            (currentUser && (r.user_id === currentUser.id || (currentUser.email && r.user_email === currentUser.email)))
          );

          if (matched && matched.status === "approved") {
            setPaymentStatus("approved");
            localStorage.setItem("tradifive_payment_status", "approved");
            localStorage.setItem("tradifive_auto_trade_setup", "true");
            window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));
          }
        }
      } catch (err) {}
    };

    checkProofStatus();
    const interval = setInterval(checkProofStatus, 4000);
    return () => clearInterval(interval);
  }, [mt5Account]);

  const [isMt5Connected, setIsMt5Connected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);

  const checkLiveMt5Connection = async (overrideAcc?: string) => {
    const accToTest = String(overrideAcc || mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "").replace(/\D/g, "");
    if (!accToTest) {
      setIsMt5Connected(false);
      return;
    }
    setIsCheckingConnection(true);
    try {
      // 1. Direct Edge function check
      const res = await fetch("https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/mt5-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          action: "get_dashboard_data",
          account_number: accToTest
        })
      });

      if (res.ok) {
        const d = await res.json();
        if (d?.account && (d.account.connection_status === "deployed" || d.account.is_connected === true)) {
          const lastUpdate = d.account.updated_at ? new Date(d.account.updated_at).getTime() : 0;
          const tenMinAgo = Date.now() - 10 * 60 * 1000;
          if (lastUpdate > tenMinAgo || (d.trades && d.trades.length > 0)) {
            setIsMt5Connected(true);
            setIsCheckingConnection(false);
            return;
          }
        }
      }

      // 2. Fallback check system_settings auto_trade_admin_records
      const { data: recData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("id", "auto_trade_admin_records")
        .maybeSingle();

      if (recData?.value && typeof recData.value === "object") {
        const rec = Object.values(recData.value).find((r: any) => 
          r.bound_account === accToTest || r.mt5_account_number === accToTest
        );
        if (rec && rec.algo_execution_active === true && rec.is_connected === true) {
          setIsMt5Connected(true);
          setIsCheckingConnection(false);
          return;
        }
      }

      setIsMt5Connected(false);
    } catch (e) {
      setIsMt5Connected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  useEffect(() => {
    if (activeStep === 4) {
      checkLiveMt5Connection();
      const interval = setInterval(() => checkLiveMt5Connection(), 15000);
      return () => clearInterval(interval);
    }
  }, [activeStep, mt5Account]);

  const handleToggleBot = () => {
    const nextState = !isBotRunning;
    setIsBotRunning(nextState);
    localStorage.setItem("tradifive_bot_status", nextState ? "active" : "paused");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: `log-${Date.now()}`,
      time: timeStr,
      type: 'status',
      event: nextState ? 'Bot Resumed (ON)' : 'Bot Paused (OFF)',
      details: nextState 
        ? 'User activated algorithmic execution via AI Trading setup' 
        : 'User paused bot execution. Open trades protected by hard SL/TP.',
    };

    try {
      const stored = localStorage.getItem("tradifive_bot_logs");
      const parsed = stored ? JSON.parse(stored) : [];
      localStorage.setItem("tradifive_bot_logs", JSON.stringify([newLog, ...(Array.isArray(parsed) ? parsed : []).slice(0, 49)]));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent("tradifive_bot_status_changed", { detail: { isRunning: nextState } }));

    if (nextState) {
      toast.success("Algorithm Active: Live Trading ON", {
        description: "MT5 terminal is actively executing automated signals.",
      });
    } else {
      toast.warning("Algorithm Standby: Trading Paused", {
        description: "New order triggers halted. Open positions monitored by hard SL/TP.",
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 8MB.");
      return;
    }

    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProofFile(reader.result as string);
      toast.success("Screenshot attached!", { description: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 8MB.");
      return;
    }

    setPaymentProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProofFile(reader.result as string);
      toast.success("Payment screenshot attached!", { description: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentRequest = async () => {
    if (!paymentUtr.trim()) {
      toast.error("Please enter the 12-digit UPI UTR or Reference Number.");
      return;
    }
    if (!paymentProofFile) {
      toast.error("Please attach a screenshot of your payment confirmation.");
      return;
    }

    setIsSubmittingPayment(true);
    let userName = "";
    let userEmail = "";
    let userId = "";

    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (authUser) {
        userId = authUser.id;
        userEmail = authUser.email || "";
        userName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || "";

        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, email, username")
          .eq("id", authUser.id)
          .maybeSingle();

        if (prof) {
          if (prof.full_name) userName = prof.full_name;
          else if (prof.username && !userName) userName = prof.username;
          if (prof.email) userEmail = prof.email;
        }
      }
    } catch (e) {
      console.warn("Could not fetch user profile:", e);
    }

    if (!userName) {
      try {
        const uRaw = localStorage.getItem("tradifive_user");
        if (uRaw) {
          const parsed = JSON.parse(uRaw);
          userName = parsed?.user?.user_metadata?.full_name || parsed?.full_name || parsed?.name || "";
          if (!userEmail) userEmail = parsed?.user?.email || parsed?.email || "";
        }
      } catch (e) {}
    }

    if (!userName) {
      userName = localStorage.getItem("tradifive_cached_display_name") || "";
    }
    if (!userName || userName === "Client Trader" || userName === "Trader") {
      userName = userEmail ? userEmail.split("@")[0] : "Client Trader";
    }
    if (!userEmail) {
      userEmail = "client@tradifive.in";
    }

    const accountForPayment = mt5Account.trim() || 
      localStorage.getItem("tradifive_connected_mt5_account") || 
      (() => {
        try {
          const s = localStorage.getItem("tradifive_ib_proof_request");
          return s ? JSON.parse(s).mt5_account_number || "" : "";
        } catch (e) { return ""; }
      })() || "See Screenshot";

    const newPaymentRequest = {
      id: `pay-${Date.now()}`,
      user_id: userId || undefined,
      user_name: userName,
      user_email: userEmail,
      mt5_account_number: accountForPayment,
      algo_id: "fialgo_v1",
      algo_name: "FiAlgo V1 Institutional (Weekly 50/50% Profit Share)",
      amount: "9999",
      plan_tier: "performance_weekly_50",
      plan_name: "FiAlgo V1 Institutional Setup (₹9,999 Setup + Weekly 50/50% Profit Share)",
      settlement_day: settlementDay,
      tradifive_id: tradifiveId,
      currency: "INR",
      method: paymentMethod,
      upi_id: paymentMethod === "upi" ? "9731980756@axisbank" : undefined,
      bank_name: paymentMethod === "bank" ? "Axis Bank" : undefined,
      account_number: paymentMethod === "bank" ? "924010072811588" : undefined,
      utr_number: paymentUtr.trim(),
      proof_file: paymentProofFile,
      proof_filename: paymentProofFileName || "payment_proof.png",
      status: "pending",
      submitted_at: new Date().toISOString()
    };

    localStorage.setItem("tradifive_payment_status", "pending");
    localStorage.setItem("tradifive_payment_request", JSON.stringify(newPaymentRequest));
    setPaymentStatus("pending");

    try {
      const { data: existing } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "license_payment_requests")
        .maybeSingle();

      const list = Array.isArray(existing?.value) ? existing.value : [];
      list.unshift(newPaymentRequest);

      await supabase.from("system_settings").upsert({
        id: "license_payment_requests",
        value: list,
        updated_at: new Date().toISOString()
      });
    } catch (err) {}

    setIsSubmittingPayment(false);
    toast.success("Payment Request Submitted!", {
      description: "Under review. Your license key will be issued within 2 hours."
    });
    setActiveStep(4);
  };

  const handleApprovePaymentDemo = () => {
    setPaymentStatus("approved");
    localStorage.setItem("tradifive_payment_status", "approved");
    localStorage.setItem("tradifive_auto_trade_setup", "true");
    toast.success("License Key Unlocked!", {
      description: "₹9,999 setup payment verified. Personal MT5 key is now active."
    });
  };

  const handleResetPayment = () => {
    setPaymentStatus("none");
    localStorage.removeItem("tradifive_payment_status");
    localStorage.removeItem("tradifive_payment_request");
    toast.info("Payment details reset. You can re-enter your UTR and screenshot.");
  };


  const handleSubmitProof = async () => {
    if (!mt5Account.trim()) {
      toast.error("Please enter your MT5 Account Number.");
      return;
    }
    if (!depositConfirmed) {
      toast.error("Please confirm your MT5 account is funded with at least $500.");
      return;
    }
    if (!proofFile) {
      toast.error(
        setupPath === "transfer"
          ? "Please attach a screenshot of your transfer email or broker confirmation."
          : "Please attach a screenshot confirming your $500+ deposit."
      );
      return;
    }

    setIsSubmittingProof(true);
    let userName = "";
    let userEmail = "";
    let userId = "";

    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (authUser) {
        userId = authUser.id;
        userEmail = authUser.email || "";
        userName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || "";

        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, email, username")
          .eq("id", authUser.id)
          .maybeSingle();

        if (prof) {
          if (prof.full_name) userName = prof.full_name;
          else if (prof.username && !userName) userName = prof.username;
          if (prof.email) userEmail = prof.email;
        }
      }
    } catch (e) {
      console.warn("Could not fetch user profile:", e);
    }

    if (!userName) {
      userName = localStorage.getItem("tradifive_cached_display_name") || "";
    }
    if (!userName || userName === "Trader" || userName === "Client Trader") {
      userName = userEmail ? userEmail.split("@")[0] : "Trader";
    }
    if (!userEmail) {
      userEmail = "trader@fialgo.com";
    }

    const currentBrokerObj = BROKERS.find(b => b.id === selectedBroker);
    const brokerLabel = currentBrokerObj ? currentBrokerObj.name : "Vantage Markets";
    const cleanAccount = mt5Account.trim();

    const newRequest = {
      id: `req-${Date.now()}`,
      user_id: userId || ("usr-" + Math.floor(1000 + Math.random() * 9000)),
      user_name: userName,
      user_email: userEmail,
      mt5_account_number: cleanAccount,
      broker_name: brokerLabel,
      proof_image_url: proofFile,
      proof_filename: proofFileName || "verification_proof.png",
      remarks: proofRemarks ? `${proofRemarks} | Min $500 balance confirmed` : "Min $500 balance confirmed",
      min_deposit_met: true,
      status: "pending",
      submitted_at: new Date().toISOString()
    };

    const cleanNum = cleanAccount.replace(/\D/g, "");
    const generatedLicKey = generateTradifiveLicenseKey(cleanNum);
    localStorage.setItem("tradifive_connected_mt5_account", cleanNum);
    localStorage.setItem("tradifive_license_key", generatedLicKey);
    localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(newRequest));
    setTransferRequestStatus("pending");

    try {
      const { data: existing } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "ib_transfer_requests")
        .maybeSingle();

      const list = Array.isArray(existing?.value) ? existing.value : [];
      list.unshift(newRequest);

      await supabase.from("system_settings").upsert({
        id: "ib_transfer_requests",
        value: list,
        updated_at: new Date().toISOString()
      });

      if (userId && !userId.startsWith("usr-")) {
        await supabase.from("mt5_accounts").upsert({
          user_id: userId,
          account_number: cleanNum,
          activation_key: generatedLicKey,
          broker_name: brokerLabel,
          connection_status: "pending_verification",
          algo_status: true
        }, { onConflict: "user_id" });
      }
    } catch (err) {
      console.warn("Stored locally:", err);
    }

    setIsSubmittingProof(false);
    toast.success(`Verification Request Submitted for #${cleanNum}!`, {
      description: `License key ${generatedLicKey} auto-generated & cryptographically locked to your MT5 account.`
    });
  };

  const handleResetVerification = () => {
    localStorage.removeItem("tradifive_ib_proof_request");
    setIbVerified(false);
    setTransferRequestStatus("none");
    setProofFile(null);
    setProofFileName("");
    setProofRemarks("");
    toast.info("Ready to submit new account details.");
  };

  const handleCopy = (text: string, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleCopyPartnerId = () => {
    navigator.clipboard.writeText("MCTDw2R6");
    setCopiedPartnerId(true);
    toast.success("Referral Code MCTDw2R6 copied!");
    setTimeout(() => setCopiedPartnerId(false), 2000);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success("Activation Key copied to clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadEA = () => {
    const cleanAccount = String(mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "").replace(/\D/g, "");
    const activeKey = cleanAccount ? generateTradifiveLicenseKey(cleanAccount) : "";

    const a = document.createElement("a");
    a.href = "/FiAlgo_v1.0.4.ex5";
    a.download = "FiAlgo_v1.0.4.ex5";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setHasDownloaded(true);
    localStorage.setItem("tradifive_ea_downloaded", "true");

    if (cleanAccount && activeKey) {
      setTimeout(() => {
        handleDownloadPreset();
      }, 400);
      toast.success(`FiAlgo EA & Preset Downloaded for Account #${cleanAccount}!`, {
        description: `License Key is locked to MT5 Account #${cleanAccount}. Only this account can execute the EA.`
      });
    } else {
      toast.success("FiAlgo_v1.0.4.ex5 downloaded! (Real 248 KB MT5 Binary)", {
        description: "Official compiled Expert Advisor ready. Copy into your MetaTrader 5 MQL5/Experts folder."
      });
    }
  };


  const handleDownloadPreset = () => {
    const cleanAccount = String(mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "").replace(/\D/g, "");
    const activeKey = cleanAccount
      ? generateTradifiveLicenseKey(cleanAccount)
      : "";

    const setContent = `; ═══════════════════════════════════════════════════════════════════
; FiAlgo V1 - OFFICIAL INSTITUTIONAL PRESET (.set)
; Asset: XAUUSD (Gold) | Timeframe: M1 (1-Minute)
; Build: 1.0.4 Enterprise
; Bound MT5 Account: #${cleanAccount || "All Accounts"}
; ═══════════════════════════════════════════════════════════════════
LicenseKey=${activeKey}
Symbol=XAUUSD
TimeFrame=PERIOD_M1
TradingStyle=DynamicBasket
BaseLot=0.01
MaxSpread=25
DynamicBasketMultiplier=1.20
MaxBasketOrders=5
DailyProfitTargetUSD=35.00
HardDrawdownGuardPercent=3.00
NewsFilterActive=true
NewsPreBlackoutMinutes=30
NewsPostBlackoutMinutes=30
TrailingStopPoints=150
MagicNumber=789104
`;
    const blob = new Blob([setContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cleanAccount ? `XAUUSD_M1_Preset_${cleanAccount}.set` : "XAUUSD_M1_Preset.set";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("XAUUSD_M1_Preset.set downloaded!", {
      description: activeKey
        ? `Pre-configured with License Key for MT5 Account #${cleanAccount}.`
        : "Optimized chart inputs preset ready to load into FiAlgo inputs."
    });
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setHasPaid(true);
      localStorage.setItem("tradifive_auto_trade_setup", "true");
      window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));
      toast.success("License Activated Successfully!", {
        description: "Your hardware-bound activation key is now live."
      });
    }, 1200);
  };

  const handleGoToDashboard = async () => {
    const cleanAccount = mt5Account.trim().replace(/\D/g, "");
    const selectedBrokerObj = BROKERS.find(b => b.id === selectedBroker);
    const brokerName = selectedBrokerObj ? selectedBrokerObj.name : "Exness";
    const licenseKey = generateTradifiveLicenseKey(cleanAccount);

    try {
      const existing = localStorage.getItem("tradifive_ib_proof_request");
      const parsed = existing ? JSON.parse(existing) : {};
      parsed.mt5_account_number = cleanAccount;
      parsed.broker_name = brokerName;
      localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
      localStorage.setItem("tradifive_connected_mt5_account", cleanAccount);
      localStorage.setItem("tradifive_license_key", licenseKey);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from("profiles")
          .update({ activation_key: licenseKey })
          .eq("id", session.user.id);

        await supabase
          .from("mt5_accounts")
          .upsert({
            user_id: session.user.id,
            account_number: cleanAccount,
            activation_key: licenseKey,
            broker_server: brokerName,
            connection_status: "deployed",
            algo_status: true
          }, { onConflict: "user_id" });
      }
    } catch (e) {
      console.warn("Could not sync account to Supabase:", e);
    }

    localStorage.setItem("tradifive_auto_trade_setup", "true");
    localStorage.setItem("tradifive_bot_status", "active");
    window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));
    toast.success(`FiAlgo Connected to MT5 #${cleanAccount}!`, {
      description: "Loading your live AutoTrade dashboard..."
    });
    navigate('/auto-trade/dashboard');
  };

  const currentBroker = BROKERS.find(b => b.id === selectedBroker) || BROKERS[0];
  const targetIbNumber = currentBroker.id === 'vantage' 
    ? '27863221 (Referral Code: MCTDw2R6)' 
    : (currentBroker.ibNumber || '27863221');
  const emailTemplateText = `Subject: Change IB - MT5 Account #${mt5Account || "[Your MT5 Account]"}\n\nHello Support Team,\n\nPlease move my trading account under Partner IB / Rebate Account: ${targetIbNumber}.\n\nThank you.`;
  const mailtoLink = `mailto:${currentBroker.supportEmail}?subject=${encodeURIComponent(`Change IB - MT5 Account #${mt5Account || ""}`)}&body=${encodeURIComponent(emailTemplateText)}`;

  const displayAccountLabel = mt5Account && mt5Account !== "See Proof Screenshot" 
    ? `#${mt5Account}` 
    : "Pending Review";

  return (
    <DashboardLayout fullScreen={true}>
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-10 py-6 space-y-6">

        {/* ── HEADER (EXPANSIVE BIG-TECH ENTERPRISE CONSOLE) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Enterprise Setup Console
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                Build v1.0.4 · MetaTrader 5 Bridge
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI Trading Setup
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg font-mono text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                ID: {tradifiveId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect your MT5 broker, download the FiAlgo V1 Expert Advisor, and activate automated execution.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>&lt; 3ms Direct Relay</span>
            </span>

            <button
              type="button"
              onClick={() => setShowCalculator(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              title="Open Profit Simulator"
            >
              <Calculator size={13} className="text-amber-400 dark:text-blue-600" />
              <span>Profit Simulator</span>
            </button>
          </div>
        </div>

        {/* ── SLEEK PROGRESS BAR & MILESTONES (FULL-WIDTH BIG-TECH CONSOLE) ── */}
        <div className="space-y-2.5">
          {/* Progress Header Meta */}
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Step {activeStep} of 4:
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {activeStep === 1 ? "Connect MT5 Broker" : activeStep === 2 ? "Download FiAlgo V1 & Presets" : activeStep === 3 ? "License Setup Payment" : "Activate Hardware-Bound Key"}
              </span>
            </div>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-500/20">
              {activeStep === 1 ? "25% Complete" : activeStep === 2 ? "50% Complete" : activeStep === 3 ? "75% Complete" : "100% Ready"}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: activeStep === 1 ? "25%" : activeStep === 2 ? "50%" : activeStep === 3 ? "75%" : "100%" }}
            />
          </div>

          {/* 4 Step Milestone Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer text-center text-xs truncate ${
                activeStep === 1
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-blue-500/20"
                  : ibVerified
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{ibVerified ? "✓" : "1."} Connect MT5</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer text-center text-xs truncate ${
                activeStep === 2
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-blue-500/20"
                  : hasDownloaded
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{hasDownloaded ? "✓" : "2."} Download EA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer text-center text-xs truncate ${
                activeStep === 3
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-blue-500/20"
                  : paymentStatus === "approved"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : paymentStatus === "pending"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
                      : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{paymentStatus === "approved" ? "✓" : paymentStatus === "pending" ? "⌛" : "3."} Pay ₹9,999</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer text-center text-xs truncate ${
                activeStep === 4
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-blue-500/20"
                  : (hasPaid && ibVerified)
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{(hasPaid && ibVerified) ? "✓" : "4."} Activate Key</span>
            </button>
          </div>
        </div>

        {/* ── EXPANSIVE 2-COLUMN BIG-TECH CONSOLE GRID (8 COLS MAIN + 4 COLS SIDEBAR) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* MAIN 8-COLUMN SETUP WORKSPACE */}
          <div className="lg:col-span-8 space-y-6">
            {/* ── STEP 1: ONLY SHOWN WHEN activeStep === 1 ── */}
        {activeStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-3 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Connect MT5 Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete these 3 steps to connect your broker and unlock your FiAlgo V1 license.
                </p>
              </div>

              {ibVerified && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                  <CheckCircle2 size={13} />
                  Connected
                </span>
              )}
            </div>

            {/* STATE 1A: ALREADY VERIFIED */}
            {ibVerified ? (
              <div className="space-y-4">
                <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        MT5 Account {displayAccountLabel} Connected &amp; Verified
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Broker: <strong>{currentBroker.name}</strong> · Partner IB: <strong className="font-mono">{currentBroker.ibNumber || "27863221"}</strong> · Balance: <strong className="text-emerald-600 dark:text-emerald-400">$500+ Qualified</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetVerification}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors self-start sm:self-center cursor-pointer"
                  >
                    Change Account
                  </button>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Continue to Step 2: Download FiAlgo V1</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : transferRequestStatus === "pending" ? (
              /* STATE 1B: UNDER REVIEW - HUMAN-CRAFTED FINTECH DESIGN */
              <div className="space-y-4">
                <div className="p-3 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-4">
                  
                  {/* Status Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                        <Clock size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            Account {displayAccountLabel} Under Review
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Verifying partner IB link and $500+ balance with {currentBroker.name}.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-amber-500/25 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>~1–2 hours</span>
                    </span>
                  </div>

                  {/* 3-Cell Parameter Row (Clean on Mobile, No awkward line wrapping) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/70 dark:border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Broker</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <BrokerLogo id={selectedBroker} size={14} />
                        <strong className="text-xs text-slate-800 dark:text-slate-200 truncate">{currentBroker.name}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Partner IB</span>
                      <strong className="font-mono text-xs text-slate-800 dark:text-slate-200 mt-1 block">
                        {currentBroker.ibNumber || "27863221"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Required Min.</span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 mt-1 block">
                        $500 USD
                      </strong>
                    </div>
                  </div>

                  {/* Attached Proof thumbnail if available */}
                  {proofFile && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/70 dark:border-white/5 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <ImageIcon size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 truncate text-[11.5px]">
                          {proofFileName || "Deposit verification screenshot"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProofPreviewModal(true)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer ml-2"
                      >
                        View Screenshot
                      </button>
                    </div>
                  )}

                  {/* Fast-Track Support Desk - Human Symmetrical Pair */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/70 dark:border-white/5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        Need instant verification?
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                        24/7 Priority
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Ping our desk on WhatsApp or Email with your MT5 ID to get approved within minutes:
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Hello TradiFive Team! Please verify my Vantage MT5 account #${mt5Account} ($500+ deposit funded) under Partner IB 27863221 so I can activate FiAlgo V1.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 border border-emerald-200/80 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <MessageCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span>WhatsApp Desk</span>
                      </a>
                      <a
                        href={`mailto:support@tradifive.in?subject=Verify MT5 Account ${mt5Account}&body=Hello Support Team,%0D%0A%0D%0APlease verify my MT5 account %23${mt5Account} with minimum $500 balance under Partner IB 27863221.%0D%0A%0D%0AThank you!`}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-slate-200/90 dark:border-white/10 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Mail size={14} className="text-slate-600 dark:text-slate-300" />
                        <span>Email Desk</span>
                      </a>
                    </div>
                  </div>

                  {/* Informative Next Step Banner & Primary CTA */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-500/20 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Download size={13} />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        You can download the <strong>FiAlgo V1</strong> MT5 EA and presets right now while our desk confirms your connection.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <span>Continue to Step 2: Download FiAlgo V1</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Secondary Footers: Change Account & Discreet Dev Helper */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200/60 dark:border-white/5 text-xs">
                    <button
                      type="button"
                      onClick={handleResetVerification}
                      className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      ← Change MT5 Account
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIbVerified(true);
                        setTransferRequestStatus("approved");
                        toast.success("Account Approved & Verified!", {
                          description: "Vantage MT5 account verified with $500 minimum balance."
                        });
                      }}
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 underline cursor-pointer"
                      title="Simulate instant broker approval for testing"
                    >
                      Simulate approval (Demo)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* STATE 1C: SIMPLE 3-STEP FLOW */
              <div className="space-y-4">
                {/* 2-Option Segmented Control */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setSetupPath("new");
                      setSelectedBroker("vantage");
                    }}
                    className={`py-2 px-2 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 min-h-[42px] ${
                      setupPath === "new"
                        ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>Open New <span className="hidden sm:inline">Account</span></span>
                    <span className="text-[8px] sm:text-[8.5px] font-semibold px-1 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 rounded border border-blue-200/60 dark:border-blue-500/20 whitespace-nowrap">
                      Recommended
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupPath("transfer")}
                    className={`py-2 px-2 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center min-h-[42px] ${
                      setupPath === "transfer"
                        ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>Transfer Existing <span className="hidden sm:inline">Account</span></span>
                  </button>
                </div>

                {/* ── PATH A: OPEN NEW ACCOUNT (EASY 3 STEPS) ── */}
                {setupPath === "new" && (
                  <div className="space-y-3">
                    {/* STEP 1: OPEN ACCOUNT */}
                    <div className="p-3 sm:p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Open Vantage MT5 Account
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 shrink-0 whitespace-nowrap">
                          Official Partner
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-0 sm:pl-8.5 leading-relaxed">
                        Register using our partner link below. Partner code <strong className="font-mono text-slate-900 dark:text-white font-bold">MCTDw2R6</strong> is applied automatically.
                      </p>

                      <div className="pl-0 sm:pl-8.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                        <a
                          href="https://vigco.co/la-com-inv/MCTDw2R6"
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <BrokerLogo id="vantage" size={16} />
                          <span className="truncate">Open Vantage Account</span>
                          <ExternalLink size={13} className="shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy("MCTDw2R6", "Referral Code MCTDw2R6 copied!")}
                          className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedPartnerId ? <Check size={12} className="text-emerald-500 shrink-0" /> : <Copy size={12} className="shrink-0" />}
                          <span className="whitespace-nowrap">{copiedPartnerId ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>
                    </div>

                    {/* STEP 2: FUND $500 */}
                    <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 dark:bg-white/[0.02] dark:border-white/10 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs space-y-1 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white leading-tight">
                            Complete KYC &amp; Deposit $500+
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0 whitespace-nowrap">
                            Min. $500
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Complete ID verification and deposit at least <strong>$500 USD</strong> into your Vantage account.
                        </p>
                      </div>
                    </div>

                    {/* STEP 3: SUBMIT MT5 NUMBER */}
                    <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 bg-white dark:bg-[#161618] dark:border-white/10 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Submit MT5 Account Number
                        </h4>
                      </div>

                      <div className="pl-0 sm:pl-8.5 space-y-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            MT5 Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 8492015"
                            value={mt5Account}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMt5Account(val);
                              const clean = val.replace(/\D/g, "");
                              if (clean) {
                                try {
                                  localStorage.setItem("tradifive_connected_mt5_account", clean);
                                  localStorage.setItem("tradifive_license_key", generateTradifiveLicenseKey(clean));
                                } catch (_) {}
                              }
                            }}
                            className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                          />
                        </div>

                        {/* Confirmation Checkbox */}
                        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            id="min-deposit-check-new"
                            checked={depositConfirmed}
                            onChange={(e) => setDepositConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          />
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            I confirm this MT5 account has a <strong>minimum balance of $500 USD</strong>.
                          </span>
                        </label>

                        {/* Compulsory Screenshot Proof */}
                        <div className={`flex items-center justify-between gap-2.5 p-3 rounded-xl border border-dashed transition-colors text-xs ${
                          proofFile
                            ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5"
                            : "border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
                        }`}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <UploadCloud size={15} className={`shrink-0 ${proofFile ? "text-emerald-500" : "text-slate-400"}`} />
                            <span className="text-slate-700 dark:text-slate-300 text-xs font-medium truncate">
                              {proofFile ? (proofFileName || "Screenshot Attached") : "Upload deposit screenshot (Required)"}
                            </span>
                          </div>
                          <div className="relative shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center shadow-xs ${
                              proofFile
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                                : "bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            }`}>
                              {proofFile ? "Change" : "Browse Proof"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSubmitProof}
                          disabled={isSubmittingProof || !proofFile || !mt5Account.trim() || !depositConfirmed}
                          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                            proofFile && mt5Account.trim() && depositConfirmed
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-200/60 dark:border-white/5"
                          }`}
                        >
                          {isSubmittingProof ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Submitting for Verification...</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Submit &amp; Unlock Key →</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PATH B: TRANSFER EXISTING IB (EASY 3 STEPS) ── */}
                {setupPath === "transfer" && (
                  <div className="space-y-3">
                    {/* STEP 1: REQUEST TRANSFER */}
                    <div className="p-3 sm:p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Request IB Transfer
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          IB: {currentBroker.ibNumber || "27863221"}
                        </span>
                      </div>

                      <div className="pl-0 sm:pl-8.5 space-y-2.5">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Select Current Broker
                          </label>
                          <div className="relative">
                            <select
                              value={selectedBroker}
                              onChange={(e) => setSelectedBroker(e.target.value)}
                              className="w-full bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                              {BROKERS.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name} ({b.tagline})
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                              <ChevronRight size={14} className="rotate-90" />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Email {currentBroker.name} support (<span className="text-slate-700 dark:text-slate-300 font-mono">{currentBroker.supportEmail}</span>) to transfer your account under Partner IB <strong>{targetIbNumber}</strong>.
                        </p>

                        <div className="flex items-center gap-2 pt-0.5">
                          <a
                            href={mailtoLink}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 inline-flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Mail size={12} />
                            <span>Open Mail App</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(emailTemplateText, "Email template copied!")}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Copy size={12} />
                            <span>Copy Email Template</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* STEP 2: FUND $500 */}
                    <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 dark:bg-white/[0.02] dark:border-white/10 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Maintain $500+ Account Balance
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Min. $500
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Maintain at least <strong>$500 USD</strong> balance in your trading account.
                        </p>
                      </div>
                    </div>

                    {/* STEP 3: SUBMIT MT5 NUMBER & PROOF */}
                    <div className="p-3 sm:p-4 rounded-xl border border-slate-200/80 bg-white dark:bg-[#161618] dark:border-white/10 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Submit MT5 Account &amp; Proof
                        </h4>
                      </div>

                      <div className="pl-0 sm:pl-8.5 space-y-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            MT5 Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 8492015"
                            value={mt5Account}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMt5Account(val);
                              const clean = val.replace(/\D/g, "");
                              if (clean) {
                                try {
                                  localStorage.setItem("tradifive_connected_mt5_account", clean);
                                  localStorage.setItem("tradifive_license_key", generateTradifiveLicenseKey(clean));
                                } catch (_) {}
                              }
                            }}
                            className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                          />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Important:</span>
                            <span>Must be an MT5 <strong>Hedging</strong> account (Netting accounts not supported).</span>
                          </p>
                        </div>

                        {/* Confirmation Checkbox */}
                        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            id="min-deposit-check-transfer"
                            checked={depositConfirmed}
                            onChange={(e) => setDepositConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          />
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            I confirm this MT5 account has a <strong>minimum balance of $500 USD</strong>.
                          </span>
                        </label>

                        {/* Screenshot Proof */}
                        <div className={`flex items-center justify-between gap-2.5 p-3 rounded-xl border border-dashed transition-colors text-xs ${
                          proofFile
                            ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5"
                            : "border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
                        }`}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <UploadCloud size={15} className={`shrink-0 ${proofFile ? "text-emerald-500" : "text-slate-400"}`} />
                            <span className="text-slate-700 dark:text-slate-300 text-xs font-medium truncate">
                              {proofFile ? (proofFileName || "Screenshot Attached") : "Upload transfer email screenshot (Required)"}
                            </span>
                          </div>
                          <div className="relative shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center shadow-xs ${
                              proofFile
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                                : "bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            }`}>
                              {proofFile ? "Change" : "Browse Proof"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSubmitProof}
                          disabled={isSubmittingProof || !proofFile || !mt5Account.trim() || !depositConfirmed}
                          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                            proofFile && mt5Account.trim() && depositConfirmed
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-200/60 dark:border-white/5"
                          }`}
                        >
                          {isSubmittingProof ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Submitting for Verification...</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Submit Transfer Request →</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: EXPANSIVE 2-COLUMN ENTERPRISE WORKSTATION (BIG-TECH CONSOLE) ── */}
        {activeStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Top Step Header with Live Telemetry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Step 2 · Institutional Binary Release
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Download FiAlgo V1 Expert Advisor &amp; Presets
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Deploy the precision Gold (XAUUSD M1) algorithmic engine directly onto MetaTrader 5.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasDownloaded ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 size={14} />
                    <span>Binaries Downloaded</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    <Cpu size={14} />
                    <span>MT5 v1.0.4 Ready</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Expansive Enterprise Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Primary Product Showcase, 3D Hardware Pedestal, Telemetry & 1-Click Downloads (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#161618] p-5 sm:p-7 space-y-6 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

                  {/* Header & 3D Packaging Showcase */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pt-1">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                          <Shield size={12} className="text-blue-600 dark:text-blue-400" />
                          <span>Gold Specialist · MT5 EA</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Verified v1.0.4 Release</span>
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        FiAlgo V1 <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">(MetaTrader 5 Build)</span>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Institutional quantitative algorithm with automated risk management, dynamic tick-level basket hedging, and real-time capital protection.
                      </p>
                    </div>

                    <div className="shrink-0 self-center sm:self-start">
                      <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#1c1c20] dark:to-[#161618] border border-slate-200/80 dark:border-white/10 shadow-sm">
                        <img
                          src="/fialgo-v1-box.png"
                          alt="FiAlgo V1 3D Box"
                          className="h-28 sm:h-36 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.14)] dark:drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-1.5 right-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-white/95 dark:bg-black/90 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 shadow-2xs">
                          v1.0.4
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Cell Telemetry Specifications Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[74px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Asset Pair</span>
                        <Coins size={13} className="text-amber-500" />
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-xs block font-bold">XAUUSD (Gold)</strong>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Spot USD Tick</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[74px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Timeframe</span>
                        <Clock size={13} className="text-blue-500" />
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-xs block font-bold">1-Min (M1)</strong>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Tick Precision</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[74px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Execution</span>
                        <Zap size={13} className="text-emerald-500" />
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-xs block font-bold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          &lt; 3ms Direct MT5
                        </strong>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Zero Relay Lag</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[74px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Engine</span>
                        <Layers size={13} className="text-purple-500" />
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white text-xs block font-bold">Dynamic Basket</strong>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Trailing Guard</span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Quant Matrix */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Automated Safety Specifications
                        </span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Risk Guard Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Min. Deposit</span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono">$500 USD</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Base Lot</span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono">0.01</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Leverage</span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono">1:100+</strong>
                      </div>
                    </div>
                  </div>

                  {/* Download Action Suite */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileCode size={14} className="text-slate-400 shrink-0" />
                        <span>Binary:</span>
                        <code className="font-mono text-[11px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded border border-slate-200/80 dark:border-white/5">
                          FiAlgo_v1.0.4.ex5
                        </code>
                      </div>
                      <div className="font-mono text-[11px]">
                        Size: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">248 KB</strong> (Compiled MT5)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadEA}
                        className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
                      >
                        <Download size={15} />
                        <span>Download FiAlgo EA (.ex5)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPreset}
                        className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-slate-200/90 dark:border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
                      >
                        <Sliders size={15} />
                        <span>Download Chart Presets (.set)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive MT5 Installation & WebRequest Setup Guide (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#161618] p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Terminal size={15} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        MT5 Quick Installation Guide
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                      4 Easy Steps
                    </span>
                  </div>

                  {/* Checklist Steps */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[10.5px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div className="space-y-1">
                        <strong className="text-slate-900 dark:text-white block font-semibold">Copy EA into MT5 folder</strong>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          In MT5: click <strong>File → Open Data Folder → MQL5 → Experts</strong> and paste <code className="font-mono text-slate-800 dark:text-slate-200">FiAlgo_v1.0.4.ex5</code>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[10.5px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="space-y-1">
                        <strong className="text-slate-900 dark:text-white block font-semibold">Enable Algo Trading</strong>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Click the <strong>Algo Trading</strong> button on the MT5 top toolbar (it should display a green play icon).
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10.5px] flex items-center justify-center shrink-0">3</span>
                          <span>Allow WebRequest (Required)</span>
                        </span>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">Ctrl+O</span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Go to <strong>Tools → Options → Experts</strong>. Check <em>"Allow WebRequest for listed URL"</em> and add:
                      </p>
                      <div className="flex items-center justify-between bg-white dark:bg-[#161618] border border-blue-200/80 dark:border-blue-500/30 rounded-lg p-2 px-2.5">
                        <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 select-all truncate">
                          https://rylwyxhupwpwsdbvuoej.supabase.co
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("https://rylwyxhupwpwsdbvuoej.supabase.co");
                            toast.success("Webhook URL Copied!", {
                              description: "Paste into MT5 Tools → Options → Experts → WebRequest"
                            });
                          }}
                          className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1 shrink-0 cursor-pointer ml-2"
                        >
                          <Copy size={11} />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[10.5px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <div className="space-y-1">
                        <strong className="text-slate-900 dark:text-white block font-semibold">Attach to XAUUSD (Gold) M1</strong>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Drag FiAlgo onto an M1 chart. In the Inputs tab, click <strong>Load</strong> to select the downloaded <code className="font-mono text-slate-800 dark:text-slate-200">XAUUSD_M1_Preset.set</code>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Priority Support Desk */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Need installation help?</span>
                    <a
                      href="https://wa.me/?text=Hello%20TradiFive%20Team!%20I%20need%20assistance%20installing%20FiAlgo%20V1%20on%20my%20MT5."
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle size={12} />
                      <span>WhatsApp Setup Desk →</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Navigation: Back to Step 1 & Forward to Step 3 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Step 1 (Connect)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Step 3: Pay ₹9,999 Setup Fee</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: ONLY SHOWN WHEN activeStep === 3 (ALGO SETUP FEE ₹9,999 + DAILY 50/50% PROFIT SHARE) ── */}
        {activeStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-3 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  Algo Setup & Activation Fee
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete the ₹9,999 setup fee payment via PhonePe / UPI or Bank Transfer to request your license key.
                </p>
              </div>

              {paymentStatus === "approved" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={13} />
                  <span>Payment Confirmed</span>
                </span>
              ) : paymentStatus === "pending" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20">
                  <Clock size={13} className="animate-spin" />
                  <span>Under Review (~2 Hrs)</span>
                </span>
              ) : null}
            </div>

            {/* STATE 3A: ALREADY PAID & CONFIRMED */}
            {paymentStatus === "approved" ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      ₹9,999 Performance Setup Payment Confirmed
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Your payment has been verified. Proceed to Step 4 to activate and view your MetaTrader 5 license key.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-800 dark:text-emerald-300">Need to make another payment or view UPI / Bank details?</span>
                  <button
                    type="button"
                    onClick={handleResetPayment}
                    className="font-bold text-emerald-900 hover:underline dark:text-emerald-200 cursor-pointer bg-white/70 dark:bg-white/10 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/30"
                  >
                    View PhonePe / UPI &amp; Bank Details
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Step 2 (Download)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Proceed to Step 4: Activate License Key</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : paymentStatus === "pending" ? (
              /* STATE 3B: PAYMENT SUBMITTED - PENDING 2-HOUR VERIFICATION */
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Payment Request Submitted (~2 Hours)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Your payment proof and UTR number have been submitted. Our finance desk is verifying your payment. Your personal license key will be issued within 2 hours.
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-amber-500/25 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>~2 Hours</span>
                  </span>
                </div>

                {/* Submitted Parameters Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/70 dark:border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Method</span>
                    <strong className="text-xs text-slate-900 dark:text-white mt-1 block truncate">
                      {paymentMethod === "upi" ? "PhonePe / UPI" : "Bank Transfer"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">UPI / Account</span>
                    <strong className="text-xs text-slate-900 dark:text-white mt-1 block font-mono truncate">
                      {paymentMethod === "upi" ? "9731980756@axisbank" : "924010072811588"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">UTR / Ref No.</span>
                    <strong className="text-xs text-slate-900 dark:text-white mt-1 block font-mono truncate">
                      {paymentUtr || "Submitted"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Estimated Delivery</span>
                    <strong className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block truncate">
                      Within 2 Hours
                    </strong>
                  </div>
                </div>

                {/* Fast-Track WhatsApp Desk */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/70 dark:border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Need it faster? Priority Desk
                    </span>
                    <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ⚡ 15-Min Fast-Track
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    Share your UTR number <strong className="text-slate-800 dark:text-slate-200 font-mono">{paymentUtr}</strong> on WhatsApp for instant 15-minute priority verification:
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello TradiFive Team! I have completed the ₹9,999 setup fee payment for FiAlgo V1 via PhonePe/UPI. My UTR number is ${paymentUtr}. Please expedite and issue my license key.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <MessageCircle size={14} />
                      <span>Fast-Track on WhatsApp Desk</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleResetPayment}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Edit UTR / Resubmit
                    </button>
                  </div>
                </div>

                {/* Stepper Navigation: Back to Step 2 & Forward to Step 4 */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Step 2 (Download)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Check License Key Status in Step 4</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* STATE 3C: PAYMENT REQUIRED - FORM WITH PHONEPE / UPI & BANK TRANSFER */
              <div className="space-y-4">
                {/* ── SINGLE OFFICIAL PLAN: ₹9,999 ONE-TIME SETUP + WEEKLY 50/50% PROFIT SHARE ── */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Official Algo Access Plan
                    </span>
                    <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Weekly 50/50% Profit Share
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 relative flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                          Single Official Plan
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Weekly 50/50% Profit Split
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        FiAlgo V1 Institutional Performance Plan
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                        Pay a one-time <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹9,999 setup fee</strong> to deploy the EA and lock your MT5 account. Profit is split 50/50% weekly on your designated settlement day. 0% commission on non-profitable weeks.
                      </p>
                    </div>

                    <div className="text-center sm:text-right shrink-0 p-3 rounded-xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/5 min-w-[150px] shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">One-Time Setup Fee</span>
                      <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-white block mt-0.5">
                        ₹9,999
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                        + Weekly 50% Profit Share
                      </span>
                    </div>
                  </div>

                  {/* ── STAGGERED WEEKLY SETTLEMENT & WITHDRAWAL COHORT SELECTOR ── */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Calendar size={14} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Select Weekly Settlement &amp; Withdrawal Day
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Withdrawals &amp; 50/50% profit share are settled weekly on your designated cohort day (Mon–Sun).
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
                        Staggered Weekly Cohorts
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 pt-1">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSettlementDay(day);
                            try { localStorage.setItem("tradifive_settlement_day", day); } catch (e) {}
                            toast.success(`Weekly settlement day set to ${day}`);
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                            settlementDay === day
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md ring-2 ring-blue-500/30 scale-[1.02]"
                              : "bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          <span className="block text-[10px] font-bold sm:hidden">{day.slice(0, 3)}</span>
                          <span className="hidden sm:block text-xs font-bold">{day}</span>
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Your Assigned Cohort: <strong className="text-slate-900 dark:text-white">Every {settlementDay}</strong></span>
                      </div>
                      <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                        TradiFive ID: <strong className="text-blue-600 dark:text-blue-400 font-bold">{tradifiveId}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector (2 Options) */}                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2.5 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                      paymentMethod === "upi"
                        ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <QrCode size={14} className={paymentMethod === "upi" ? "text-purple-600 dark:text-purple-400" : ""} />
                    <span>PhonePe / UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`py-2.5 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                      paymentMethod === "bank"
                        ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Landmark size={14} className={paymentMethod === "bank" ? "text-blue-600 dark:text-blue-400" : ""} />
                    <span>Bank Transfer (IMPS / NEFT)</span>
                  </button>
                </div>

                {/* Tab 1: PhonePe / UPI Option */}
                {paymentMethod === "upi" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Real Scannable UPI QR Code Image */}
                      <div className="w-40 sm:w-44 rounded-2xl bg-white p-2.5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center justify-center shrink-0">
                        <img 
                          src="/upi-qr-code.png?v=2" 
                          alt="Scan with PhonePe, GPay, Paytm to pay 9731980756@axisbank" 
                          className="w-full h-auto object-contain rounded-xl"
                        />
                        <span className="mt-1.5 text-[9.5px] font-bold text-slate-700 tracking-tight text-center">
                          Scan to Pay · Any UPI App
                        </span>
                      </div>

                      <div className="space-y-2.5 flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[10.5px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/20">PhonePe</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20">Google Pay</span>
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/20">Paytm</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">BHIM UPI</span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Scan the QR code or copy the TradiFive UPI ID below:
                        </div>

                        {/* Official UPI ID Box with One-Click Copy */}
                        <div className="flex items-center justify-between bg-white dark:bg-[#161618] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 max-w-sm mx-auto sm:mx-0 shadow-2xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TradiFive UPI ID (Nikhil Ravindra Harake)</span>
                            <code className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                              9731980756@axisbank
                            </code>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy("9731980756@axisbank", "UPI ID copied: 9731980756@axisbank")}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all ml-3 shrink-0"
                          >
                            <Copy size={12} />
                            <span>Copy UPI</span>
                          </button>
                        </div>

                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                          Transfer Amount: <strong className="text-slate-900 dark:text-white font-mono">₹9,999</strong> · Zero additional processing fees
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Bank Transfer Option */}
                {paymentMethod === "bank" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-3 text-xs">
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Transfer <strong className="text-slate-900 dark:text-white font-mono">₹9,999</strong> via NEFT, RTGS, IMPS, or Net Banking to bank account details below:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Name</span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">Nikhil Ravindra Harake</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("Nikhil Ravindra Harake", "Account Name copied!")}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Name</span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">Axis Bank</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Number</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">924010072811588</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("924010072811588", "Account Number copied!")}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#161618] border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">IFSC Code</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">UTIB0001690</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("UTIB0001690", "IFSC Code copied!")}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mandatory Submission Form: UTR & Proof Screenshot */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/90 dark:border-white/10 space-y-4 shadow-2xs">
                  <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Send size={14} className="text-blue-500" />
                      <span>Submit Payment Proof to Request License Key</span>
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                      After payment, provide your 12-digit UTR number and upload the screenshot. In 2 hours, your license key will be issued.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Input 1: UTR Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        12-Digit UPI UTR or Bank Reference Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 429184920192 (from PhonePe, GPay, or bank receipt)"
                        value={paymentUtr}
                        onChange={(e) => setPaymentUtr(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200/90 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-[10.5px] text-slate-400">
                        Found in your PhonePe / UPI payment details as "UTR" or "UPI Ref ID".
                      </span>
                    </div>

                    {/* Input 2: Payment Screenshot Proof */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Payment Screenshot Proof <span className="text-rose-500">*</span>
                      </label>
                      <div className="p-3 sm:p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <UploadCloud size={16} className={`shrink-0 ${paymentProofFile ? "text-emerald-500" : "text-slate-400"}`} />
                          <div className="min-w-0">
                            <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold block truncate">
                              {paymentProofFileName || (paymentProofFile ? "Screenshot Attached" : "Upload Screenshot of Payment")}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block">
                              PNG, JPG, or WEBP up to 8MB
                            </span>
                          </div>
                        </div>
                        <div className="relative shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePaymentProofUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            paymentProofFile
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                              : "bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                          }`}>
                            {paymentProofFile ? "Change Proof" : "Browse Screenshot"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notice: 2-Hour Delivery Callout */}
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-500/20 flex items-start gap-2.5 text-xs">
                      <Clock size={15} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="text-slate-900 dark:text-white font-bold text-xs block">
                          License Key Issued Within 2 Hours
                        </strong>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Once you submit your UTR number and proof screenshot, our compliance desk verifies the payment with the bank. In 2 hours you will receive your personal license key unlocked in Step 4.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stepper Navigation: Back to Step 2 & Request Key Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={13} />
                      <span>Back to Step 2 (Download)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitPaymentRequest}
                      disabled={isSubmittingPayment || !paymentUtr.trim() || !paymentProofFile}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.99] ${
                        paymentUtr.trim() && paymentProofFile
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed border border-slate-200/60 dark:border-white/5"
                      }`}
                    >
                      {isSubmittingPayment ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound size={14} />
                          <span>Submit Payment Proof &amp; Request License Key →</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 4: ONLY SHOWN WHEN activeStep === 4 (ACTIVATION KEY & MT5 SETUP) ── */}
        {activeStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-3 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  {hasPaid && ibVerified ? "Activation Key & Start Trading" : "Activation Key Verification"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {hasPaid && ibVerified
                    ? "Copy your license key and attach it to FiAlgo V1 in MT5."
                    : paymentStatus === "pending"
                      ? "Payment received. Your license key will be issued within 2 hours."
                      : "Complete payment and broker verification to unlock your license."}
                </p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                hasPaid && ibVerified
                  ? "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-200 dark:border-white/10"
                  : paymentStatus === "pending"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
                    : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-slate-200 dark:border-white/10"
              }`}>
                {hasPaid && ibVerified ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Unlocked &amp; Active</span>
                  </>
                ) : paymentStatus === "pending" ? (
                  <>
                    <Clock size={12} className="text-amber-500 animate-spin" />
                    <span>Key Issuance (~2 Hrs)</span>
                  </>
                ) : (
                  <>
                    <Lock size={12} className="text-slate-500" />
                    <span>Key Locked</span>
                  </>
                )}
              </span>
            </div>

            {/* ── CASE 4A: PAYMENT NOT INITIATED IN STEP 3 ── */}
            {paymentStatus === "none" ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/10 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Lock size={22} />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Payment Required</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      FiAlgo V1 License Key Locked
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      Complete payment of <strong className="text-slate-900 dark:text-white">"₹9,999 Setup Fee (Weekly 50/50% Profit Share)"</strong> in Step 3 via PhonePe / UPI (<strong className="font-mono text-slate-800 dark:text-slate-200">9731980756@axisbank</strong>) or Bank Transfer to request your license key.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <CreditCard size={14} />
                  <span>Go to Step 3: Complete Payment (₹9,999) →</span>
                </button>
              </div>
            ) : paymentStatus === "pending" ? (
              /* ── CASE 4B: PAYMENT SUBMITTED, UNDER 2-HOUR VERIFICATION ── */
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/10 space-y-4 sm:space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Clock size={22} className="animate-pulse" />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Verification In Progress (~2 Hours)</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      License Key Under Verification
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      We have received your payment request with UTR <strong className="font-mono text-slate-800 dark:text-slate-200">{paymentUtr || "Submitted"}</strong> and screenshot proof. In 2 hours you will get your license key unlocked right here.
                    </p>
                  </div>
                </div>

                {/* Status details matrix */}
                <div className="p-3.5 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 rounded-xl space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Verification Status Details:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">⌛</span>
                        <span className="text-slate-600 dark:text-slate-400">Plan &amp; Fee:</span>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        "₹9,999 Setup + Daily 50/50% Share"
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                        <span className="text-slate-600 dark:text-slate-400">Proof Submitted:</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono truncate max-w-[140px]">
                        UTR #{paymentUtr || "Received"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">⏱</span>
                        <span className="text-slate-600 dark:text-slate-400">Turnaround Time:</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        Within 2 Hours
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">#</span>
                        <span className="text-slate-600 dark:text-slate-400">Assigned License:</span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        TRDF-****-****
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Fast-Track Assistance */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Need 15-Minute Fast-Track Verification?
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Desk Online</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Send your UTR number to our finance desk on WhatsApp for priority approval within 15 minutes:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello TradiFive Team! I have completed the ₹9,999 setup fee for FiAlgo V1 Performance Partner (50% Daily Profit Share) (UTR: ${paymentUtr || "[Your UTR]"}). Please verify and issue my license key.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp Desk</span>
                    </a>

                    <a
                      href={`mailto:support@tradifive.in?subject=${encodeURIComponent(
                        `Verify License Payment UTR #${paymentUtr || ""}`
                      )}&body=${encodeURIComponent(
                        `Hello Support Team,\n\nPlease verify my payment of ₹9,999 for FiAlgo V1.\nUTR Number: ${paymentUtr || ""}\nPlan: Performance Partner (50/50% Daily Share)\n\nPlease issue my license key.\n\nThank you!`
                      )}`}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Mail size={13} />
                      <span>Email Support</span>
                    </a>
                  </div>

                  {/* Discrete testing helper */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Testing license key unlock?</span>
                    <button
                      type="button"
                      onClick={handleApprovePaymentDemo}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer"
                      title="Click to simulate instant payment approval"
                    >
                      ⚡ Instant Approve Payment (Demo Mode)
                    </button>
                  </div>
                </div>
              </div>
            ) : !ibVerified ? (
              /* ── CASE 4C: PAYMENT CONFIRMED, WAITING FOR BROKER VERIFICATION ($500+ & IB LINK) ── */
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/10 space-y-4 sm:space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Lock size={22} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Broker Verification Required</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      FiAlgo V1 License Key Locked
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      Payment of ₹9,999 is confirmed! Your license key will unlock once your MT5 account is verified under Partner IB <strong className="text-slate-800 dark:text-slate-200">27863221</strong> with a <strong className="text-slate-800 dark:text-slate-200">minimum balance of $500 USD</strong>.
                    </p>
                  </div>
                </div>

                {/* Requirements Checklist Card */}
                <div className="p-3.5 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 rounded-xl space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Activation Requirements Checklist:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                        <span className="text-slate-600 dark:text-slate-400">License Payment:</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        "₹9,999 Setup Paid ✓"
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                        <span className="text-slate-600 dark:text-slate-400">Partner Link:</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Vantage (27863221)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        {mt5Account ? (
                          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">·</span>
                        )}
                        <span className="text-slate-600 dark:text-slate-400">MT5 Account:</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {mt5Account ? `#${mt5Account}` : "Step 1 Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">$</span>
                        <span className="text-slate-600 dark:text-slate-400">Min. Balance:</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        $500.00 USD Required
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Support & Test Helper */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Need Fast-Track Verification?
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Desk Online</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Send your MT5 account number and deposit screenshot directly to our verification desk on WhatsApp or Email for priority review.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello TradiFive Team! Please verify my Vantage MT5 account #${mt5Account || "[Your MT5 Account]"} (Deposit: $500+) under Partner IB 27863221 to unlock my FiAlgo V1 license key.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp Desk</span>
                    </a>

                    <a
                      href={`mailto:support@tradifive.in?subject=${encodeURIComponent(
                        `Verify Vantage MT5 Account #${mt5Account || ""}`
                      )}&body=${encodeURIComponent(
                        `Hello Support Team,\n\nPlease verify my Vantage MT5 account #${mt5Account || ""}.\nPartner IB: 27863221\nDeposit: $500+ completed.\n\nPlease unlock my FiAlgo V1 license key.\n\nThank you!`
                      )}`}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Mail size={13} />
                      <span>Email Support</span>
                    </a>
                  </div>

                  {/* Discrete testing helper */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Testing activation?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIbVerified(true);
                        setTransferRequestStatus("approved");
                        toast.success("Account Approved & License Key Unlocked!", {
                          description: "Vantage MT5 account verified with $500 balance."
                        });
                      }}
                      className="font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
                      title="Click to simulate instant desk approval"
                    >
                      Instant Verify (Demo)
                    </button>
                  </div>
                </div>

                {!mt5Account && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <ArrowLeft size={13} />
                    <span>Go to Step 1 &amp; Submit Vantage Account</span>
                  </button>
                )}
              </div>
            ) : (
              /* ── CASE 4D: FULLY UNLOCKED STATE - SHOW LICENSE KEY & MT5 ATTACHMENT ── */
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 space-y-3.5">
                {(() => {
                  // Always generate key from the verified mt5Account for THIS user
                  const effectiveAccount = mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "";
                  const activeKey = effectiveAccount
                    ? generateTradifiveLicenseKey(effectiveAccount)
                    : "";

                  return (
                    <>
                      {/* Compact License Key Card */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              MT5 License Key
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200/60 dark:border-white/10">
                              #{effectiveAccount}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Lifetime Active
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-black/30 border border-slate-200/70 dark:border-white/5 rounded-lg p-2.5 px-3.5">
                          <code className="font-mono text-xs sm:text-sm font-extrabold tracking-wider text-slate-900 dark:text-emerald-400 select-all break-all">
                            {activeKey}
                          </code>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyKey(activeKey)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              {copiedKey ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadEA}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                              title="Download FiAlgo Expert Advisor (.ex5) + Account Preset (.set)"
                            >
                              <Download size={13} />
                              <span>Download EA</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadPreset}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                              title="Download pre-configured .set preset"
                            >
                              <Download size={13} />
                              <span>Download .set</span>
                            </button>
                          </div>
                        </div>

                        {/* Account-Lock Security Guarantee Card */}
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Strictly Account-Locked to MT5 Account #{effectiveAccount}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90">
                            This algo and license key are mathematically bound to account #{effectiveAccount}. If any other person copies your key or tries running this EA on a different MT5 login, execution is blocked immediately and the EA will remove itself.
                          </p>
                        </div>
                      </div>

                      {/* Compact 2-Step Quick Guide */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Step 1: WebRequest */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                              <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px]">1</span>
                              <span>Allow MT5 WebRequest</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            In MT5: <strong>Tools → Options → Experts</strong>. Check <em>"Allow WebRequest for listed URL"</em> and add:
                          </p>
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/5 rounded-md p-1.5 px-2.5">
                            <span className="font-mono text-[10.5px] text-blue-600 dark:text-blue-400 truncate select-all">
                              https://rylwyxhupwpwsdbvuoej.supabase.co
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("https://rylwyxhupwpwsdbvuoej.supabase.co");
                                toast.success("Webhook URL copied!");
                              }}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer shrink-0 ml-1.5"
                              title="Copy URL"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Step 2: Attach to Chart */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px]">2</span>
                              <span>Attach FiAlgo to Chart</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Press F7</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Drag <strong>FiAlgo</strong> onto any <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-[10px]">XAUUSD, M1</kbd> chart.
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-[10px]">F7</kbd> → <strong>Inputs</strong> → paste your License Key (or click <strong>Load</strong> .set) → click <strong>OK</strong>.
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Real-Time Connection Status */}
                {isMt5Connected ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex items-center justify-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          FiAlgo Connected &amp; Live
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2 text-[11px] hidden sm:inline">
                          MT5 #{mt5Account} · Algorithm active
                        </span>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-white/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      Online · 1.8ms
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Clock size={15} className="text-amber-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Awaiting MT5 Chart Connection
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2 text-[11px] hidden sm:inline">
                          Attach FiAlgo to chart with your key to start
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => checkLiveMt5Connection()}
                      disabled={isCheckingConnection}
                      className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/15 inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                    >
                      <RefreshCw size={11} className={isCheckingConnection ? "animate-spin" : ""} />
                      <span>{isCheckingConnection ? "Checking..." : "Refresh Status"}</span>
                    </button>
                  </div>
                )}

                {/* Primary Dashboard CTA */}
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.005] active:scale-[0.995]"
                >
                  <Zap size={14} className="text-amber-400" />
                  <span>Open AutoTrade Dashboard →</span>
                </button>
              </div>
            )}

            {/* Stepper Navigation: Back to Step 3 */}
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Step 3 (Payment)</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── ENTERPRISE SIDEBAR TELEMETRY & SPECIFICATIONS (4 COLS) ── */}
      <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">

        {/* CARD 2: RISK GUARD & CAPITAL DISCIPLINE */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#161618] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Shield size={14} />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Safety &amp; Risk Guard
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Disciplined
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400">Min. Deposit:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">$500.00 USD</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400">Recommended Base Lot:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">0.01 per $500</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400">Hard Daily Stop:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Max 3.0% Drawdown</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400">High-Impact News Filter:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">±30 Min Blackout Active</span>
            </div>
          </div>

          {/* Profit Simulator CTA */}
          <button
            type="button"
            onClick={() => setShowCalculator(true)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Calculator size={13} className="text-blue-600 dark:text-blue-400" />
            <span>Simulate Returns in Calculator →</span>
          </button>
        </div>

        {/* CARD 3: BROKER & PARTNER TELEMETRY */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#161618] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Partner Broker Status
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              ibVerified
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
            }`}>
              {ibVerified ? "Connected ✓" : "Pending Verification"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrokerLogo id={selectedBroker} size={16} />
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">{currentBroker.name}</h5>
                <p className="text-[10px] text-slate-500">{currentBroker.tagline}</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              IB: {currentBroker.ibNumber || "27863221"}
            </span>
          </div>

          {/* WebRequest Endpoint helper */}
          <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-500/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300">MT5 WebRequest URL</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("https://rylwyxhupwpwsdbvuoej.supabase.co");
                  toast.success("Webhook URL Copied!");
                }}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy size={10} />
                <span>Copy</span>
              </button>
            </div>
            <code className="text-[10.5px] font-mono font-semibold text-blue-600 dark:text-blue-400 truncate block select-all">
              https://rylwyxhupwpwsdbvuoej.supabase.co
            </code>
          </div>

          {/* Fast-Track Desk Contact */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Need fast approval?</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hello TradiFive Desk! I am setting up FiAlgo V1 for MT5 account #${mt5Account || ""}. Please assist.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <MessageCircle size={12} />
              <span>WhatsApp Desk →</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>

  {/* ── PHOTO PROOF PREVIEW MODAL LIGHTBOX ── */}
      <AnimatePresence>
        {showProofPreviewModal && proofFile && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setShowProofPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161616] border border-white/10 rounded-2xl max-w-xl w-full p-4 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Camera size={14} className="text-slate-400" />
                  Attached Screenshot Proof
                </h4>
                <button
                  type="button"
                  onClick={() => setShowProofPreviewModal(false)}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-auto rounded-lg border border-white/5 bg-black flex items-center justify-center p-2">
                <img src={proofFile} alt="Proof Full View" className="max-h-[60vh] w-auto object-contain rounded" />
              </div>

              <div className="flex justify-between items-center text-xs text-neutral-400 pt-1">
                <span>Account: {displayAccountLabel}</span>
                <button
                  type="button"
                  onClick={() => setShowProofPreviewModal(false)}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PROFIT SIMULATOR MODAL ── */}
      <AnimatePresence>
        {showCalculator && (
          <div 
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowCalculator(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl my-auto py-4 sm:py-6"
            >
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setShowCalculator(false)}
                  className="px-3 py-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" /> Close Simulator
                </button>
              </div>
              <div className="bg-[#0c0e14] p-3 sm:p-7 rounded-2xl sm:rounded-[28px] border border-white/10 shadow-2xl">
                <AutoTradeProfitCalculator 
                  onClose={() => setShowCalculator(false)}
                  ctaText="Continue MT5 Setup →"
                  onCtaClick={() => setShowCalculator(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
