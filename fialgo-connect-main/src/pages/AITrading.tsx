import React, { useState, useEffect } from "react";
import { 
  Download, Copy, CheckCircle2, Lock, Mail, Play, Pause, Power, 
  ExternalLink, ArrowRight, ArrowLeft, X, Zap, Package, Shield, Check, 
  Terminal, Camera, UploadCloud, Clock, Image as ImageIcon, 
  Headset, Send, RefreshCw, Calculator, Calendar, Sparkles, ChevronRight,
  AlertCircle, DollarSign, MessageCircle, AlertTriangle
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
    if (setupPath === "transfer" && !proofFile) {
      toast.error("Please attach a screenshot of your transfer email or broker confirmation.");
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

  const handleDownload = () => {
    toast.success("Downloading FiAlgo_v1.0.4.ex5...", {
      description: "Official compiled algorithm binary for MetaTrader 5."
    });
    setHasDownloaded(true);
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
                  Link an MT5 account under Vantage Partner IB <strong className="font-mono text-slate-900 dark:text-white">27863221</strong> (min. $500 deposit) to run FiAlgo.
                </p>
              </div>

              {ibVerified && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                  <CheckCircle2 size={13} />
                  Connected
                </span>
              )}
            </div>

            {/* 5-Step Activation Roadmap Banner */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-white/[0.02] border border-blue-200/70 dark:border-blue-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Official Partner Onboarding Plan
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <span>Min. $500 Required</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
                <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <div className="font-bold text-blue-600 dark:text-blue-400">1. Open MT5</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-tight">Vantage Partner link (Code: MCTDw2R6)</div>
                </div>

                <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">2. Verify KYC</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-tight">Complete ID check on Vantage portal</div>
                </div>

                <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 col-span-2 sm:col-span-1">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <span>3. Deposit $500+</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5 leading-tight">Deposit min $500 &amp; place 1 test trade</div>
                </div>

                <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">4. Send MT5 ID</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-tight">Submit MT5 number for fast desk verification</div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 col-span-2 sm:col-span-1">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">5. Unlock Key</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5 leading-tight">Get activation key &amp; start auto trading</div>
                </div>
              </div>
            </div>

            {/* $500 Minimum Deposit Requirement Callout */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-amber-800 dark:text-amber-300">
                  Minimum $500 Account Balance Strictly Required
                </div>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
                  FiAlgo V1 is an automated Gold (XAUUSD) algorithm. A minimum trading account equity of <strong>$500 USD</strong> is strictly required to handle margin requirements, calibrated 0.01 lot size scaling, and institutional drawdown buffers safely.
                </p>
              </div>
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
              /* STATE 1B: UNDER REVIEW */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Account {displayAccountLabel} Under Review
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Confirming partner link under IB 27863221 &amp; verifying min. $500 balance with {currentBroker.name}.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20 shrink-0">
                      ~1–2 hours
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#121214] border border-slate-200/70 dark:border-white/5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <BrokerLogo id={selectedBroker} size={18} />
                      <span className="text-slate-400">Broker:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{currentBroker.name}</strong>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-slate-400">IB:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{currentBroker.ibNumber || "27863221"}</strong>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">$500 Min. Balance</span>
                    </div>

                    {proofFile && (
                      <button
                        type="button"
                        onClick={() => setShowProofPreviewModal(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <ImageIcon size={12} />
                        <span>View Proof</span>
                      </button>
                    )}
                  </div>

                  {/* Fast track verification strip */}
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-500/20 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Need Instant Verification?
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Priority Desk</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Ping our desk on WhatsApp or Email with your MT5 ID and screenshot to get approved in minutes:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Hello TradiFive Team! Please verify my Vantage MT5 account #${mt5Account} ($500+ deposit funded) under Partner IB 27863221 so I can activate FiAlgo V1.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp Desk</span>
                      </a>
                      <a
                        href={`mailto:support@tradifive.in?subject=Verify MT5 Account ${mt5Account}&body=Hello Support Team,%0D%0A%0D%0APlease verify my MT5 account %23${mt5Account} with minimum $500 balance under Partner IB 27863221.%0D%0A%0D%0AThank you!`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Mail size={13} />
                        <span>Email Desk</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    You can already proceed to download FiAlgo V1 while our desk confirms your connection and $500 balance.
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                    <button
                      type="button"
                      onClick={handleResetVerification}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Change Account
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
                      className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded border border-emerald-500/20 cursor-pointer"
                      title="Test helper to simulate instant approval"
                    >
                      Instant Verify (Demo)
                    </button>
                  </div>
                </div>

                {/* Continue to Step 2 Button */}
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
            ) : (
              /* STATE 1C: CLEAN 2-WAY CHOICE */
              <div className="space-y-4">
                {/* 2-Option Segmented Control: Open New (Vantage) vs Transfer Existing IB */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setSetupPath("new");
                      setSelectedBroker("vantage");
                    }}
                    className={`py-2 px-3 rounded-lg transition-all cursor-pointer text-center ${
                      setupPath === "new"
                        ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Open New Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupPath("transfer")}
                    className={`py-2 px-3 rounded-lg transition-all cursor-pointer text-center ${
                      setupPath === "transfer"
                        ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Transfer Existing IB
                  </button>
                </div>

                {/* ── PATH A: OPEN NEW ACCOUNT (EXCLUSIVELY VANTAGE MARKETS) ── */}
                {setupPath === "new" && (
                  <div className="space-y-3.5">
                    {/* Vantage Promotion Card */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <BrokerLogo id="vantage" size={28} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Vantage Markets
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                                Recommended Partner
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Raw ECN Spreads · Direct MT5 Execution · Institutional Liquidity
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Partner ID Copy Strip */}
                      <div className="p-2.5 bg-white dark:bg-[#121214] border border-blue-200/60 dark:border-white/5 rounded-xl flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Referral Code: </span>
                          <strong className="font-mono text-slate-900 dark:text-white font-bold">MCTDw2R6</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("MCTDw2R6", "Referral Code MCTDw2R6 copied!")}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPartnerId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span>{copiedPartnerId ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>

                      {/* 1-Click Open Account CTA */}
                      <a
                        href="https://vigco.co/la-com-inv/MCTDw2R6"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Open Free MT5 Account on Vantage</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* Step to connect newly created MT5 account */}
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Enter Your Vantage MT5 Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 8492015"
                          value={mt5Account}
                          onChange={(e) => setMt5Account(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>

                      {/* Minimum $500 Deposit Confirmation Checkbox */}
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <input
                          type="checkbox"
                          id="min-deposit-check-new"
                          checked={depositConfirmed}
                          onChange={(e) => setDepositConfirmed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <label htmlFor="min-deposit-check-new" className="text-slate-800 dark:text-slate-200 cursor-pointer font-medium leading-relaxed">
                          I confirm this MT5 account has a <strong>minimum balance of $500 USD</strong> (Essential for FiAlgo Gold grid calibration &amp; drawdown safety)
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Account Balance / Welcome Screenshot (Optional)
                        </label>
                        <div className="border border-dashed border-slate-300 dark:border-white/10 hover:border-slate-400 rounded-xl p-2.5 text-center cursor-pointer bg-slate-50 dark:bg-[#121214] relative flex items-center justify-center min-h-[42px]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {proofFile ? (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate px-2">
                              ✓ {proofFileName || "Screenshot Attached"}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <UploadCloud size={14} className="text-slate-400" />
                              <span>Attach deposit confirmation or welcome portal screenshot</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitProof}
                        disabled={isSubmittingProof || !mt5Account.trim() || !depositConfirmed}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          mt5Account.trim() && depositConfirmed
                            ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 shadow-xs"
                            : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        {isSubmittingProof ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Connect MT5 Account &amp; Submit for Verification →</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── PATH B: TRANSFER EXISTING IB (USER CAN CHOOSE OTHER BROKERS) ── */}
                {setupPath === "transfer" && (
                  <div className="space-y-3.5">
                    {/* Broker Selector */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Select Your Broker
                      </label>
                      <div className="relative">
                        <select
                          value={selectedBroker}
                          onChange={(e) => setSelectedBroker(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 appearance-none cursor-pointer"
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

                    {/* Change IB Instruction Box */}
                    <div className="p-3 bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/5 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          {selectedBroker === 'vantage' ? 'Rebate Account (IB Number):' : 'Partner IB to link:'}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-white/10 px-2 py-0.5 rounded">
                          <span>{currentBroker.ibNumber || "27863221"}</span>
                          {selectedBroker === 'vantage' && (
                            <span className="text-[10px] text-slate-500 font-normal">({currentBroker.referralCode || "MCTDw2R6"})</span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Send an email to {currentBroker.name} support (<span className="text-slate-700 dark:text-slate-300 font-mono">{currentBroker.supportEmail}</span>) to move your MT5 account under Partner IB / Rebate Account <strong>{currentBroker.ibNumber || "27863221"}</strong>.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={mailtoLink}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 inline-flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Mail size={12} />
                          <span>Open Mail App</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(emailTemplateText, "Email template copied!")}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Copy size={12} />
                          <span>Copy Email</span>
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          MT5 Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 8492015"
                          value={mt5Account}
                          onChange={(e) => setMt5Account(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>

                      {/* Minimum $500 Deposit Confirmation Checkbox */}
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <input
                          type="checkbox"
                          id="min-deposit-check-transfer"
                          checked={depositConfirmed}
                          onChange={(e) => setDepositConfirmed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <label htmlFor="min-deposit-check-transfer" className="text-slate-800 dark:text-slate-200 cursor-pointer font-medium leading-relaxed">
                          I confirm this MT5 account has a <strong>minimum balance of $500 USD</strong> (Required for Gold algorithm risk &amp; margin safety)
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Screenshot Proof of Transfer Request
                        </label>
                        <div className="border border-dashed border-slate-300 dark:border-white/10 hover:border-slate-400 rounded-xl p-2.5 text-center cursor-pointer bg-slate-50 dark:bg-[#121214] relative flex items-center justify-center min-h-[42px]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {proofFile ? (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate px-2">
                              ✓ {proofFileName || "Screenshot Attached"}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <UploadCloud size={14} className="text-slate-400" />
                              <span>Attach email sent or ticket screenshot</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitProof}
                        disabled={isSubmittingProof || !proofFile || !mt5Account.trim() || !depositConfirmed}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          proofFile && mt5Account.trim() && depositConfirmed
                            ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 shadow-xs"
                            : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        {isSubmittingProof ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Submit for Verification →</span>
                          </>
                        )}
                      </button>
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

            {/* FiAlgo V1 Product Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 text-white dark:bg-[#111113] border border-slate-800 dark:border-white/10 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <Shield size={11} />
                    <span>Gold Specialist · Institutional</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                    FiAlgo V1 (MetaTrader 5 Build)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                    Tick-by-tick breakout algorithm engineered strictly for Gold (XAUUSD) market structure with hard drawdown protection.
                  </p>
                </div>

                {/* 3D Product Box (responsive) */}
                <div className="shrink-0 flex items-center justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <img
                      src="/fialgo-v1-box.png"
                      alt="FiAlgo V1 3D Box"
                      className="h-24 sm:h-36 w-auto object-contain relative z-10 drop-shadow-2xl transition-transform hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-medium">Asset Pair</span>
                  <strong className="text-white text-xs">XAUUSD (Gold)</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-medium">Timeframe</span>
                  <strong className="text-white text-xs">1-Min (M1)</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-medium">Execution</span>
                  <strong className="text-emerald-400 text-xs">&lt; 3ms Direct MT5</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-medium">Engine</span>
                  <strong className="text-blue-300 text-xs">Dynamic Basket</strong>
                </div>
              </div>

              {/* Account Size & Lot Sizing Recommendation Bar */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Safety:</span>
                  <span className="font-bold text-amber-300">Min. $500 Balance</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">Base Lot Size: <strong className="text-white">0.01</strong></span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Auto Stop-Loss &amp; Risk Guard Active
                </div>
              </div>

              {/* 3-Day Profit Guarantee */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Shield size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      3-Day Net Profit Guarantee &amp; 100% Refund
                    </div>
                    <div className="text-[11px] text-blue-200/70">
                      Zero risk trial. If your account shows no profit after 3 days, instant refund.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCalculator(true)}
                  className="text-xs font-semibold text-blue-300 hover:text-white underline self-start sm:self-center cursor-pointer shrink-0"
                >
                  Calculator →
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>File: <strong className="font-mono text-slate-200">FiAlgo_v1.0.4.ex5</strong></span>
                  <span>·</span>
                  <span>Size: <strong className="text-slate-200">4.2 MB</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.success("Downloading XAUUSD_M1_Preset.set...")}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-center"
                  >
                    Presets (.set)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                ibVerified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
              }`}>
                {ibVerified ? <CheckCircle2 size={13} /> : <Lock size={13} />}
                <span>{ibVerified ? "Unlocked & Active" : "Key Locked"}</span>
              </span>
            </div>

            {!ibVerified ? (
              /* ── LOCKED STATE: WAITING FOR VERIFICATION ($500+ & IB LINK) ── */
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Lock size={24} />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      <span>Verification Required</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      FiAlgo V1 License Key is Locked
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      To protect traders from improper risk calibration, personal activation keys are generated exclusively for accounts verified under Vantage Partner IB <strong>27863221</strong> with a <strong>minimum deposit of $500</strong>.
                    </p>
                  </div>
                </div>

                {/* Requirements Checklist Card */}
                <div className="p-3.5 bg-white dark:bg-[#18181B] border border-slate-200/70 dark:border-white/5 rounded-xl space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Activation Requirements Checklist:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                      <span className="text-slate-700 dark:text-slate-300">Partner Link: <strong>Vantage (27863221)</strong></span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
                      {mt5Account ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
                      )}
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        MT5 Account: <strong>{mt5Account ? `#${mt5Account}` : "Step 1 Pending"}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">$</span>
                      <span className="text-amber-800 dark:text-amber-300">
                        Min. Deposit: <strong>$500.00 USD Required</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">⌛</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Desk Status: <strong>{transferRequestStatus === "pending" ? "Under Review (~1-2 hrs)" : "Awaiting Submission"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Support & Test Helper */}
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-500/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-300">
                      Need Fast-Track Verification?
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      Active Desk Support
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/70 leading-relaxed">
                    Send your MT5 account number and deposit screenshot directly to our verification team on WhatsApp or Email for priority review.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello TradiFive Team! Please verify my Vantage MT5 account #${mt5Account || "[Your MT5 Account]"} (Deposit: $500+) under Partner IB 27863221 to unlock my FiAlgo V1 license key.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 transition-colors shadow-xs"
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Mail size={13} />
                      <span>Email Support</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setIbVerified(true);
                        setTransferRequestStatus("approved");
                        toast.success("Account Approved & License Key Unlocked!", {
                          description: "Vantage MT5 account verified with $500 balance."
                        });
                      }}
                      className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors cursor-pointer"
                      title="Click to simulate instant desk approval"
                    >
                      <span>Instant Verify (Demo)</span>
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
