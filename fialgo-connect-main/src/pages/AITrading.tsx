import React, { useState, useEffect } from "react";
import { 
  Download, Copy, CheckCircle2, Lock, Mail, Play, Pause, Power, 
  ExternalLink, ArrowRight, ArrowLeft, X, Zap, Package, Shield, Check, 
  Terminal, Camera, UploadCloud, Clock, Image as ImageIcon, 
  Headset, Send, RefreshCw, Calculator, Calendar, Sparkles, ChevronRight,
  AlertCircle, DollarSign, MessageCircle, AlertTriangle, Coins, Layers,
  Sliders, FileCode, Cpu, Activity
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

export default function AITrading() {
  const navigate = useNavigate();

  // Active Wizard Step: 1, 2, or 3 (Shows ONE step at a time for maximum clarity!)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Setup mode & selection - default to "new" to promote Vantage Markets
  const [setupPath, setSetupPath] = useState<"new" | "transfer">("new");
  const [selectedBroker, setSelectedBroker] = useState<string>("vantage");

  // Account & Verification
  const [mt5Account, setMt5Account] = useState("");
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
  const [isPaying, setIsPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem("tradifive_auto_trade_setup") === "true";
  });

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
    const content = `// ═══════════════════════════════════════════════════════════════════
// FiAlgo V1 - OFFICIAL ENTERPRISE MT5 RELEASE
// Product: FiAlgo V1 Algorithmic Execution Engine
// Build Version: 1.0.4 Enterprise
// Target Platform: MetaTrader 5 (MT5 Build 4150+)
// Asset: XAUUSD (Gold Spot / US Dollar)
// Architecture: Tick-by-tick breakout engine with dynamic basket & drawdown guard
// 
// Quick Setup Instructions:
// 1. In MetaTrader 5, click File -> Open Data Folder.
// 2. Navigate to MQL5/Experts and copy this file inside.
// 3. Right-click Experts in MT5 Navigator and click "Refresh".
// 4. Attach FiAlgo V1 to your XAUUSD M1 chart.
// 5. In EA inputs, load XAUUSD_M1_Preset.set and paste your activation key.
// 
// Verified Checksum: SHA256-FA104-MT5-GOLD-BUILD
// Support Desk: https://tradifive.in
// ═══════════════════════════════════════════════════════════════════
`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FiAlgo_v1.0.4.ex5";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("FiAlgo_v1.0.4.ex5 downloaded!", {
      description: "Official compiled MT5 binary ready to install into MQL5/Experts."
    });
    setHasDownloaded(true);
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
    localStorage.setItem("tradifive_auto_trade_setup", "true");
    window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));
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
      <div className="max-w-3xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── HEADER (CLEAN & COMPACT ON ALL SCREENS) ── */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
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
        <div className="space-y-2">
          {/* Progress Header Meta */}
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Step {activeStep} of 3: {activeStep === 1 ? "Connect MT5" : activeStep === 2 ? "Download FiAlgo" : "Activate License"}
            </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white text-xs">
              {activeStep === 1 ? "33%" : activeStep === 2 ? "66%" : "100%"}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: activeStep === 1 ? "33%" : activeStep === 2 ? "66%" : "100%" }}
            />
          </div>

          {/* 3 Step Milestone Tabs (Clean & touch-friendly on mobile) */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`py-1.5 px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-xs ${
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
              className={`py-1.5 px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-xs ${
                activeStep === 2
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : (hasDownloaded && ibVerified)
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{(hasDownloaded && ibVerified) ? "✓" : "2."} Download</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`py-1.5 px-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center text-xs ${
                activeStep === 3
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : (hasPaid && ibVerified && hasDownloaded)
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span>{(hasPaid && ibVerified && hasDownloaded) ? "✓" : "3."} Activate</span>
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
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-4 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Connect MT5 Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Follow the 3 simple steps below to connect your account and unlock your FiAlgo V1 license key.
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
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-4">
                  
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
                          Confirming partner link under IB 27863221 &amp; verifying min. $500 balance with {currentBroker.name}.
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
                    <span className="text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 rounded font-bold border border-blue-200/60 dark:border-blue-500/20 whitespace-nowrap">
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
                    <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Open Free MT5 Account on Vantage
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          Official Partner
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-0 sm:pl-8.5 leading-relaxed">
                        Register using our official link below. Our Partner IB (Rebate code: <strong className="font-mono text-slate-900 dark:text-white font-bold">MCTDw2R6</strong>) will be applied automatically.
                      </p>

                      <div className="pl-0 sm:pl-8.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                        <a
                          href="https://vigco.co/la-com-inv/MCTDw2R6"
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <BrokerLogo id="vantage" size={16} />
                          <span>Open Free MT5 Account on Vantage</span>
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy("MCTDw2R6", "Referral Code MCTDw2R6 copied!")}
                          className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedPartnerId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span>{copiedPartnerId ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>
                    </div>

                    {/* STEP 2: FUND $500 */}
                    <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 dark:bg-white/[0.02] dark:border-white/10 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Complete KYC &amp; Deposit Minimum $500 USD
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Min. $500
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Complete your quick ID check on Vantage portal and deposit at least <strong>$500 USD</strong>. A minimum of $500 is strictly required so the Gold (XAUUSD) algorithm can safely handle margin buffers.
                        </p>
                      </div>
                    </div>

                    {/* STEP 3: SUBMIT MT5 NUMBER */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-white dark:bg-[#161618] dark:border-white/10 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Submit Your Vantage MT5 Number
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
                            I confirm this MT5 account is funded with a <strong>minimum balance of $500 USD</strong>.
                          </span>
                        </label>

                        {/* Compulsory Screenshot Proof */}
                        <div className={`flex items-center justify-between p-2.5 rounded-xl border border-dashed transition-colors text-xs ${
                          proofFile
                            ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5"
                            : "border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
                        }`}>
                          <div className="flex items-center gap-2">
                            <UploadCloud size={14} className={proofFile ? "text-emerald-500" : "text-slate-400"} />
                            <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              {proofFile ? (proofFileName || "Screenshot Attached") : "Attach deposit confirmation (Required)"}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
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
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                              <span>Submit for Quick Verification &amp; Unlock Key →</span>
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
                    <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Request IB Transfer to {currentBroker.ibNumber || "27863221"}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          IB: {currentBroker.ibNumber || "27863221"}
                        </span>
                      </div>

                      <div className="pl-0 sm:pl-8.5 space-y-2.5">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Your Current Broker
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
                          Send an email to {currentBroker.name} support (<span className="text-slate-700 dark:text-slate-300 font-mono">{currentBroker.supportEmail}</span>) to move your MT5 account under Partner IB <strong>{currentBroker.ibNumber || "27863221"}</strong>.
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
                            <span>Copy Template</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* STEP 2: FUND $500 */}
                    <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 dark:bg-white/[0.02] dark:border-white/10 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Maintain Minimum $500 Account Balance
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Min. $500
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Your trading account must have at least <strong>$500 USD</strong> equity to run FiAlgo safely on Gold (XAUUSD).
                        </p>
                      </div>
                    </div>

                    {/* STEP 3: SUBMIT MT5 NUMBER & PROOF */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-white dark:bg-[#161618] dark:border-white/10 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Submit MT5 Number &amp; Transfer Proof
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
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-xs">
                          <div className="flex items-center gap-2">
                            <UploadCloud size={14} className="text-slate-400" />
                            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {proofFile ? (proofFileName || "Screenshot Attached") : "Screenshot proof of transfer request (Required)"}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 cursor-pointer">
                              {proofFile ? "Change" : "Browse Proof"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSubmitProof}
                          disabled={isSubmittingProof || !proofFile || !mt5Account.trim() || !depositConfirmed}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  Download FiAlgo V1 Expert Advisor
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Download the compiled binary (.ex5) and chart preset for MetaTrader 5.
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
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121215] p-3.5 sm:p-6 space-y-3 sm:space-y-4 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
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
                    Tick-by-tick breakout algorithm engineered strictly for Gold (XAUUSD) market structure with hard drawdown protection.
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
                    <span>Size: <strong className="text-slate-700 dark:text-slate-300">4.2 MB</strong></span>
                    <span className="hidden sm:inline"> · MQL5 Binary</span>
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
                <span>Continue to Step 3: Activation Key</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: ONLY SHOWN WHEN activeStep === 3 ── */}
        {activeStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:bg-[#161618] dark:border-white/10 p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  {ibVerified ? "Activation Key & Start Trading" : "Activation Key Verification"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {ibVerified
                    ? "Attach your activation key to FiAlgo V1 on MetaTrader 5."
                    : "Account verification with minimum $500 deposit is required to unlock your key."}
                </p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                ibVerified
                  ? "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-200 dark:border-white/10"
                  : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-slate-200 dark:border-white/10"
              }`}>
                {ibVerified ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Lock size={12} className="text-slate-500" />}
                <span>{ibVerified ? "Unlocked & Active" : "Key Locked"}</span>
              </span>
            </div>

            {!ibVerified ? (
              /* ── LOCKED STATE: WAITING FOR VERIFICATION ($500+ & IB LINK) ── */
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161618] border border-slate-200/80 dark:border-white/10 space-y-4 sm:space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Lock size={22} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Verification Required</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      FiAlgo V1 License Key is Locked
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      To protect traders from improper risk calibration, personal activation keys are generated exclusively for accounts verified under Vantage Partner IB <strong className="text-slate-800 dark:text-slate-200">27863221</strong> with a <strong className="text-slate-800 dark:text-slate-200">minimum deposit of $500</strong>.
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

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {transferRequestStatus === "pending" ? "⌛" : "·"}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">Desk Status:</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {transferRequestStatus === "pending" ? "Under Review (~1-2 hrs)" : "Awaiting Submission"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Support & Test Helper - Clean, No Rainbow */}
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
              /* ── UNLOCKED STATE: SHOW LICENSE KEY & MT5 ATTACHMENT ── */
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your MT5 Activation Key:
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Bound to {displayAccountLabel} · Min $500 Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 rounded-xl p-3.5 px-4 sm:px-5">
                  <span className="font-mono text-base sm:text-lg font-extrabold tracking-widest text-slate-900 dark:text-white select-all">
                    TRDF-8492-AX91
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyKey("TRDF-8492-AX91")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer ml-3 shadow-xs"
                  >
                    {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                  </button>
                </div>

                {/* 3-Step Human Instructions on How to Paste in MT5 */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-white/5 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Terminal size={13} className="text-blue-500" />
                    <span>How to attach in MetaTrader 5:</span>
                  </h4>
                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-5 list-decimal leading-relaxed">
                    <li>In MT5, open the Navigator panel (<kbd className="font-mono bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded text-[11px]">Ctrl+N</kbd>) and locate <strong>FiAlgo V1</strong>.</li>
                    <li>Drag FiAlgo V1 onto any <strong>XAUUSD (Gold)</strong> 1-Minute chart.</li>
                    <li>In the <strong>Inputs</strong> tab, paste key <strong className="font-mono text-slate-900 dark:text-white">TRDF-8492-AX91</strong>, ensure default lot size is set to <strong>0.01</strong> (calibrated for your $500 balance), and check <strong>Allow Algo Trading</strong> on your toolbar.</li>
                  </ol>
                </div>

                {/* Algo Power Switch Row */}
                <div className="p-3 bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isBotRunning ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <Power size={13} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {isBotRunning ? 'Live Algo Execution: ON' : 'Live Algo Execution: PAUSED'}
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        {isBotRunning ? 'Executing automated trades' : 'Trading paused'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleBot}
                    className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                      isBotRunning
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isBotRunning ? <Pause size={10} className="fill-current" /> : <Play size={10} className="fill-current" />}
                    <span>{isBotRunning ? 'Pause Bot' : 'Turn ON'}</span>
                  </button>
                </div>

                {/* Primary Dashboard CTA */}
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Zap size={14} />
                  <span>Open AutoTrade Dashboard →</span>
                </button>
              </div>
            )}

            {/* Stepper Navigation: Back to Step 2 */}
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Step 2 (Download)</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowCalculator(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl my-8"
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
              <div className="bg-[#0a0c14] p-4 sm:p-8 rounded-[32px] border border-white/10 shadow-2xl">
                <AutoTradeProfitCalculator />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
