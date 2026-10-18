import React, { useState, useEffect } from "react";
import { 
  Download, Copy, CheckCircle2, Lock, Mail, Play, Pause, Power, 
  ExternalLink, ArrowRight, ArrowLeft, X, Zap, Package, Shield, Check, 
  Terminal, Camera, UploadCloud, Clock, Image as ImageIcon, 
  Headset, Send, RefreshCw, Calculator, Calendar, Sparkles, ChevronRight,
  AlertCircle, DollarSign, MessageCircle, AlertTriangle, Coins, Layers,
  Sliders, FileCode, Cpu, Activity, QrCode, Landmark, CreditCard, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
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

  // Account & Verification
  const [mt5Account, setMt5Account] = useState<string>(() => {
    try {
      const direct = localStorage.getItem("tradifive_connected_mt5_account");
      if (direct && direct.trim()) return direct.trim();
      const stored = localStorage.getItem("tradifive_ib_proof_request");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.mt5_account_number && !parsed.mt5_account_number.includes("See")) return parsed.mt5_account_number.trim();
      }
    } catch (e) {}
    return "414460525";
  });
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
  // Step 3: Lifetime License Payment State (₹99,999)
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

  // Sync saved proof request on mount and periodic check
  useEffect(() => {
    const checkProofStatus = async () => {
      const local = localStorage.getItem("tradifive_ib_proof_request");
      if (!local) return;

      try {
        const parsed = JSON.parse(local);
        if (parsed.status === "approved") {
          setIbVerified(true);
          setTransferRequestStatus("approved");
          if (parsed.mt5_account_number && !mt5Account && parsed.mt5_account_number !== "See Proof Screenshot") {
            setMt5Account(parsed.mt5_account_number);
          }
        } else if (parsed.status === "pending") {
          setTransferRequestStatus("pending");
          if (parsed.proof_image_url) setProofFile(parsed.proof_image_url);
          if (parsed.proof_filename) setProofFileName(parsed.proof_filename);
          if (parsed.mt5_account_number && !mt5Account && parsed.mt5_account_number !== "See Proof Screenshot") {
            setMt5Account(parsed.mt5_account_number);
          }
          if (parsed.broker_name) {
            const found = BROKERS.find(b => b.name.toLowerCase().includes(parsed.broker_name.toLowerCase()));
            if (found) setSelectedBroker(found.id);
          }
        }
      } catch (e) {}

      try {
        const { data } = await supabase
          .from("system_settings")
          .select("*")
          .eq("id", "ib_transfer_requests")
          .maybeSingle();

        if (data?.value && Array.isArray(data.value) && local) {
          const parsed = JSON.parse(local);
          const matching = data.value.find((r: any) =>
            r.id === parsed.id || (parsed.mt5_account_number && r.mt5_account_number === parsed.mt5_account_number)
          );

          if (matching) {
            if (matching.status === "approved") {
              setIbVerified(true);
              setTransferRequestStatus("approved");
              parsed.status = "approved";
              localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
            } else if (matching.status === "pending") {
              setTransferRequestStatus("pending");
            }
          }
        }
      } catch (err) {}

      // Also check payment verification status
      try {
        const localPay = localStorage.getItem("tradifive_payment_request");
        if (localPay) {
          const parsedPay = JSON.parse(localPay);
          if (parsedPay.status === "approved") {
            setPaymentStatus("approved");
          }
        }

        const { data: payData } = await supabase
          .from("system_settings")
          .select("*")
          .eq("id", "license_payment_requests")
          .maybeSingle();

        if (payData?.value && Array.isArray(payData.value) && localPay) {
          const parsedPay = JSON.parse(localPay);
          const matched = payData.value.find((r: any) =>
            r.id === parsedPay.id || (parsedPay.utr_number && r.utr_number === parsedPay.utr_number)
          );
          if (matched && matched.status === "approved") {
            setPaymentStatus("approved");
            localStorage.setItem("tradifive_payment_status", "approved");
            localStorage.setItem("tradifive_auto_trade_setup", "true");
          }
        }
      } catch (err) {}
    };

    checkProofStatus();
    const interval = setInterval(checkProofStatus, 5000);
    return () => clearInterval(interval);
  }, [mt5Account]);

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
    let userName = "Client Trader";
    let userEmail = "client@tradifive.in";
    try {
      const uRaw = localStorage.getItem("tradifive_user") || localStorage.getItem("sb-pfejilmsrvvshdhhjbyz-auth-token");
      if (uRaw) {
        const parsed = JSON.parse(uRaw);
        userName = parsed?.user?.user_metadata?.full_name || parsed?.full_name || parsed?.name || userName;
        userEmail = parsed?.user?.email || parsed?.email || userEmail;
      }
    } catch (e) {}

    const newPaymentRequest = {
      id: `pay-${Date.now()}`,
      user_name: userName,
      user_email: userEmail,
      mt5_account_number: mt5Account.trim() || "See Screenshot",
      algo_id: "fialgo_v1",
      algo_name: "FiAlgo V1 Lifetime License",
      amount: "99999",
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
      description: "₹99,999 payment verified. Personal MT5 key is now active."
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
    const currentBrokerObj = BROKERS.find(b => b.id === selectedBroker);
    const brokerLabel = currentBrokerObj ? currentBrokerObj.name : "Vantage Markets";
    const cleanAccount = mt5Account.trim();

    const newRequest = {
      id: `req-${Date.now()}`,
      user_id: "usr-" + Math.floor(1000 + Math.random() * 9000),
      user_name: "Trader",
      user_email: "trader@fialgo.com",
      mt5_account_number: cleanAccount,
      broker_name: brokerLabel,
      proof_image_url: proofFile,
      proof_filename: proofFileName || "verification_proof.png",
      remarks: proofRemarks ? `${proofRemarks} | Min $500 balance confirmed` : "Min $500 balance confirmed",
      min_deposit_met: true,
      status: "pending",
      submitted_at: new Date().toISOString()
    };

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
    } catch (err) {
      console.warn("Stored locally:", err);
    }

    setIsSubmittingProof(false);
    toast.success("Verification Request Submitted!", {
      description: "Our desk will verify your MT5 account under Partner IB 27863221 ($500 min. deposit) within ~1–2 hours."
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
    const a = document.createElement("a");
    a.href = "/FiAlgo_v1.0.4.ex5";
    a.download = "FiAlgo_v1.0.4.ex5";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setHasDownloaded(true);
    localStorage.setItem("tradifive_ea_downloaded", "true");
    toast.success("FiAlgo_v1.0.4.ex5 downloaded! (Real 236 KB MT5 Binary)", {
      description: "Official compiled Expert Advisor ready. Copy into your MetaTrader 5 MQL5/Experts folder."
    });
  };


  const handleDownloadPreset = () => {
    const setContent = `; ═══════════════════════════════════════════════════════════════════
; FiAlgo V1 - OFFICIAL INSTITUTIONAL PRESET (.set)
; Asset: XAUUSD (Gold) | Timeframe: M1 (1-Minute)
; Build: 1.0.4 Enterprise
; ═══════════════════════════════════════════════════════════════════
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
    a.download = "XAUUSD_M1_Preset.set";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("XAUUSD_M1_Preset.set downloaded!", {
      description: "Optimized chart inputs preset ready to load into FiAlgo inputs."
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

  const handleGoToDashboard = () => {
    const cleanAccount = mt5Account.trim() || "414460525";
    const selectedBrokerObj = BROKERS.find(b => b.id === selectedBroker);
    const brokerName = selectedBrokerObj ? selectedBrokerObj.name : "Exness";
    try {
      const existing = localStorage.getItem("tradifive_ib_proof_request");
      const parsed = existing ? JSON.parse(existing) : {};
      parsed.mt5_account_number = cleanAccount;
      parsed.broker_name = brokerName;
      localStorage.setItem("tradifive_ib_proof_request", JSON.stringify(parsed));
      localStorage.setItem("tradifive_connected_mt5_account", cleanAccount);
    } catch (e) {}
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
    <DashboardLayout>
      <div className="max-w-3xl mx-auto w-full px-0 sm:px-6 pt-3 pb-32 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── HEADER (CLEAN & COMPACT ON ALL SCREENS) ── */}
        <div className="px-1 sm:px-0 flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Trading Setup
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect your MT5 broker and activate automated trading.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCalculator(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
            title="Open Profit Calculator"
          >
            <Calculator size={13} className="text-blue-500" />
            <span>Calculator</span>
          </button>
        </div>

        {/* ── SLEEK PROGRESS BAR (MOBILE-OPTIMIZED) ── */}
        <div className="px-1 sm:px-0 space-y-2">
          {/* Progress Header Meta */}
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Step {activeStep} of 4: {activeStep === 1 ? "Connect MT5" : activeStep === 2 ? "Download FiAlgo" : activeStep === 3 ? "License Payment" : "Activate License"}
            </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white text-xs">
              {activeStep === 1 ? "25%" : activeStep === 2 ? "50%" : activeStep === 3 ? "75%" : "100%"}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: activeStep === 1 ? "25%" : activeStep === 2 ? "50%" : activeStep === 3 ? "75%" : "100%" }}
            />
          </div>

          {/* 4 Step Milestone Tabs (Clean & touch-friendly on mobile) */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`py-1.5 px-1 sm:px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-[11px] sm:text-xs truncate ${
                activeStep === 1
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : ibVerified
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{ibVerified ? "✓" : "1."} Connect</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`py-1.5 px-1 sm:px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-[11px] sm:text-xs truncate ${
                activeStep === 2
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : hasDownloaded
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{hasDownloaded ? "✓" : "2."} Download</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`py-1.5 px-1 sm:px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-[11px] sm:text-xs truncate ${
                activeStep === 3
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : paymentStatus === "approved"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : paymentStatus === "pending"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
                      : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{paymentStatus === "approved" ? "✓" : paymentStatus === "pending" ? "⌛" : "3."} Pay ₹99k</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`py-1.5 px-1 sm:px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-[11px] sm:text-xs truncate ${
                activeStep === 4
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : (hasPaid && ibVerified)
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{(hasPaid && ibVerified) ? "✓" : "4."} Activate</span>
            </button>
          </div>
        </div>

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
                            onChange={(e) => setMt5Account(e.target.value)}
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
                            onChange={(e) => setMt5Account(e.target.value)}
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

        {/* ── STEP 2: ONLY SHOWN WHEN activeStep === 2 ── */}
        {activeStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-3 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  Download FiAlgo V1 Expert Advisor
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Download the EA file and chart preset for MetaTrader 5.
                </p>
              </div>

              {hasDownloaded && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                  <CheckCircle2 size={13} />
                  Downloaded
                </span>
              )}
            </div>

            {/* FiAlgo V1 Product Card - Systemic Institutional White Mode */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121215] p-3 sm:p-6 space-y-3 sm:space-y-4 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
              {/* Subtle top hairline */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-slate-900 dark:bg-white/20" />

              {/* Header: Compact Side-by-Side Telemetry & 3D Packaging on Mobile */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="space-y-1.5 text-left flex-1 min-w-0">
                  {/* Status & Badge Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10">
                      <Shield size={10} className="text-slate-600 dark:text-slate-400" />
                      <span>Gold Specialist · MT5 EA</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span>Verified v1.0.4</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    FiAlgo V1 <span className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">(MetaTrader 5 Build)</span>
                  </h3>

                  {/* Algorithmic Purpose */}
                  <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Precision Gold (XAUUSD) algorithm with automated risk management and capital protection.
                  </p>
                </div>

                {/* 3D Product Box in clean showcase pedestal */}
                <div className="shrink-0 self-center sm:self-start">
                  <div className="relative group p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-2xs">
                    <img
                      src="/fialgo-v1-box.png"
                      alt="FiAlgo V1 3D Box"
                      className="h-20 sm:h-28 w-auto object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_12px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 right-1 text-[7.5px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-black/80 px-1 rounded border border-slate-200/70 dark:border-white/10">
                      v1.0.4
                    </span>
                  </div>
                </div>
              </div>

              {/* Specifications Grid - Unified Institutional Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-white/5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[68px]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Asset Pair</span>
                    <Coins size={12} className="text-slate-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white text-xs block font-bold leading-tight">XAUUSD (Gold)</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Spot / USD Structure</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[68px]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Timeframe</span>
                    <Clock size={12} className="text-slate-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white text-xs block font-bold leading-tight">1-Min (M1)</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Tick-Level Accuracy</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[68px]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Execution</span>
                    <Zap size={12} className="text-slate-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white text-xs block font-bold flex items-center gap-1.5 leading-tight">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      &lt; 3ms Direct MT5
                    </strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Zero Broker Relay</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[68px]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Engine</span>
                    <Layers size={12} className="text-slate-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white text-xs block font-bold leading-tight">Dynamic Basket</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Adaptive Risk Guard</span>
                  </div>
                </div>
              </div>

              {/* Account Size & Lot Sizing Recommendation - Systemic 3-Column Quant Matrix */}
              <div className="rounded-xl bg-slate-50/90 dark:bg-[#161619] border border-slate-200/80 dark:border-white/10 p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Shield size={13} className="text-slate-500" />
                    <span className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400">Safety Specifications</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-500/20">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span>Risk Guard Active</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5 text-center">
                  <div className="p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Min. Deposit</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white font-mono">$500 USD</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Base Lot</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white font-mono">0.01</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Leverage</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white font-mono">1:100+</strong>
                  </div>
                </div>
              </div>

              {/* 3-Day Profit Guarantee - Systemic Responsive Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                    <Shield size={15} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      3-Day Net Profit Guarantee &amp; 100% Refund
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Zero-risk trial. If your account shows no profit after 3 days, instant refund.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCalculator(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white/15 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <Calculator size={12} className="text-slate-500" />
                  <span>Profit Calculator →</span>
                </button>
              </div>

              {/* Action Buttons & Binary Manifest - Ergonomic Mobile Grid */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileCode size={13} className="text-slate-400 shrink-0" />
                    <span className="text-[11px]">File:</span>
                    <code className="font-mono text-[11px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded border border-slate-200/80 dark:border-white/5 truncate">
                      FiAlgo_v1.0.4.ex5
                    </code>
                  </div>
                  <div className="text-[11px] text-slate-500 shrink-0 font-mono">
                    <span>Size: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">236 KB</strong></span>
                    <span className="hidden sm:inline"> · Real Compiled MT5 Binary</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPreset}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-slate-200/90 dark:border-white/10 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Sliders size={13} />
                    <span>Presets (.set)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadEA}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all inline-flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                    title="Download real compiled 236 KB binary for MetaTrader 5"
                  >
                    <Download size={14} />
                    <span>Download (.ex5)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Navigation: Back to Step 1 & Forward to Step 3 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Step 3: License Payment</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: ONLY SHOWN WHEN activeStep === 3 (LIFETIME LICENSE PAYMENT ₹99,999) ── */}
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
                  Lifetime License Payment
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete the ₹99,999 one-time payment via PhonePe / UPI or Bank Transfer to request your license key.
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
                      ₹99,999 Lifetime License Payment Confirmed
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
                        `Hello TradiFive Team! I have completed the ₹99,999 payment for FiAlgo V1 via PhonePe/UPI. My UTR number is ${paymentUtr}. Please expedite and issue my license key.`
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
                {/* Selected Algorithm & Price: FiAlgo V1 ₹99,999 Lifetime */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Selected Algorithm
                    </span>
                    <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                      Lifetime License
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#161618] border-2 border-blue-600 dark:border-blue-500 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* 3D Product Box Image */}
                      <div className="h-12 w-10 sm:h-14 sm:w-11 shrink-0 flex items-center justify-center">
                        <img
                          src="/fialgo-v1-box.png"
                          alt="FiAlgo V1 Product"
                          className="h-full w-auto object-contain drop-shadow-md"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                            FiAlgo V1
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20">
                            Selected
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Gold (XAUUSD) Precision EA
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                        Price
                      </div>
                      <div className="text-base sm:text-xl font-mono font-black text-slate-900 dark:text-white leading-tight">
                        ₹99,999
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Lifetime
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector (2 Options) */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-semibold">
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
                          Transfer Amount: <strong className="text-slate-900 dark:text-white font-mono">₹99,999</strong> · Zero additional processing fees
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Bank Transfer Option */}
                {paymentMethod === "bank" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-3 text-xs">
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Transfer ₹99,999 via NEFT, RTGS, IMPS, or Net Banking to bank account details below:
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
                      Complete the one-time payment of ₹99,999 in Step 3 via PhonePe / UPI (<strong className="font-mono text-slate-800 dark:text-slate-200">9731980756@axisbank</strong>) or Bank Transfer to request your license key.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <CreditCard size={14} />
                  <span>Go to Step 3: Complete Payment (₹99,999) →</span>
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
                        <span className="text-slate-600 dark:text-slate-400">Fee Verification:</span>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">₹99,999 (Under Review)</span>
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
                        `Hello TradiFive Team! I have completed the ₹99,999 payment for FiAlgo V1 (UTR: ${paymentUtr || "[Your UTR]"}). Please verify and issue my license key.`
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
                        `Hello Support Team,\n\nPlease verify my payment of ₹99,999 for FiAlgo V1.\nUTR Number: ${paymentUtr || ""}\n\nPlease issue my license key.\n\nThank you!`
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
                      Payment of ₹99,999 is confirmed! Your license key will unlock once your MT5 account is verified under Partner IB <strong className="text-slate-800 dark:text-slate-200">27863221</strong> with a <strong className="text-slate-800 dark:text-slate-200">minimum balance of $500 USD</strong>.
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
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">₹99,999 Paid ✓</span>
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
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 space-y-4">
                {(() => {
                  let activeKey = "";
                  try {
                    const raw = localStorage.getItem("tradifive_payment_request");
                    if (raw) {
                      const parsed = JSON.parse(raw);
                      if (parsed.license_key && parsed.license_key.startsWith("TF-")) {
                        activeKey = parsed.license_key;
                      }
                    }
                  } catch (e) {}
                  if (!activeKey) {
                    activeKey = generateTradifiveLicenseKey(mt5Account || "4820194");
                  }

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Your Cryptographic MT5 License Key:
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Bound to MT5 #{mt5Account || "4820194"} · Lifetime License</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 rounded-xl p-3.5 px-4 sm:px-5">
                        <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-slate-900 dark:text-emerald-400 select-all">
                          {activeKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(activeKey)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer ml-3 shadow-xs shrink-0"
                        >
                          {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                        </button>
                      </div>

                      {/* 2 Ways to Activate in MT5 */}
                      <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-white/5 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Terminal size={13} className="text-blue-500" />
                          <span>Two Ways to Activate in MetaTrader 5:</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Method 1: On-Chart Dashboard */}
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 space-y-1.5">
                            <span className="font-bold text-slate-800 dark:text-white block text-xs flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px]">1</span>
                              Direct on Chart Dashboard (Instant)
                            </span>
                            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              On the live chart dashboard, click the <strong className="text-blue-500">SET</strong> button at top right. At the bottom under <strong>LICENSE KEY</strong>, click the box, paste your key, and click <strong className="text-emerald-500">ACTIVATE</strong>. Status instantly turns <strong className="text-emerald-400">ACTIVE</strong>.
                            </p>
                          </div>

                          {/* Method 2: EA Properties Inputs */}
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 space-y-1.5">
                            <span className="font-bold text-slate-800 dark:text-white block text-xs flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px]">2</span>
                              Via EA Inputs Dialog (F7)
                            </span>
                            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">F7</kbd> on your MT5 chart to open EA properties. Go to the <strong>Inputs</strong> tab, locate <strong>LicenseKey</strong> under <code>=== License ===</code>, paste this key, and click <strong>OK</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span>This key is mathematically cryptographically locked to MT5 Account <strong>#{mt5Account || "4820194"}</strong> with Lifetime validity.</span>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* FiAlgo Connected Live Status Banner */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 relative" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          FiAlgo Connected
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span>MT5 Online</span>
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        License key verified on MT5 Account <strong>#{mt5Account || "414460525"}</strong>. Algorithm running on chart.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-white/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      Ping: 1.8ms
                    </span>
                  </div>
                </div>

                {/* Primary Dashboard CTA */}
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.005] active:scale-[0.995]"
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
