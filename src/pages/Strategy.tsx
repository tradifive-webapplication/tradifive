import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { usePlan } from "@/hooks/usePlan";
import DashboardLayout from "@/components/DashboardLayout";
import { PushableButton } from "@/components/PushableButton";
import {
  Zap,
  TrendingUp,
  Activity,
  ChevronRight,
  MonitorPlay,
  Lock,
  Unlock,
  Download,
  Copy,
  CheckCircle2,
  Video,
  PlayCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  Crown,
  MessageCircle,
  AlertTriangle
} from "lucide-react";
import DownloadEngineFlow from "@/components/DownloadEngineFlow";
import { useTrading } from "@/contexts/TradingContext";
import { toast } from "sonner";


const BOTS = [
  {
    id: "scalper",
    name: "TradiFive Scalper AI",
    category: "SCALPING",
    badge: "🔥 Most Popular",
    desc: "High-frequency rapid executions targeting small, consistent profits across highly volatile market sessions.",
    winRate: "76%",
    profit: "+12.4%",
    risk: "Medium",
    color: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20",
    bg: "bg-blue-50/50",
    textColor: "text-blue-600",
    borderHover: "group-hover:border-blue-200",
    glow: "bg-blue-400",
    icon: Zap,
    features: [
      "Trades XAUUSD & EURUSD",
      "Min. Balance: ₹500",
      "Max Drawdown: 8%",
      "Executes 15-25 trades per day"
    ]
  },
  {
    id: "swing",
    name: "TradiFive Swing Master",
    category: "SWING TRADING",
    badge: "💎 Premium AI",
    desc: "Rides major institutional market trends for days to capture massive, low-stress pip movements with high accuracy.",
    winRate: "68%",
    profit: "+21.5%",
    risk: "Low",
    color: "from-purple-500 to-pink-600",
    shadow: "shadow-purple-500/20",
    bg: "bg-purple-50/50",
    textColor: "text-purple-600",
    borderHover: "group-hover:border-purple-200",
    glow: "bg-purple-400",
    icon: TrendingUp,
    features: [
      "Trades All Major Pairs",
      "Min. Balance: ₹1,000",
      "Max Drawdown: 4%",
      "Executes 3-5 trades per week"
    ]
  }
];

export default function Strategy() {
  const { isProOrElite, isElite } = usePlan();
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState<string>("scalping");
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activationKey, setActivationKey] = useState("");
  const [downloadedEngines, setDownloadedEngines] = useState<Record<string, boolean>>({});
  
  // Real License & Gating States (1 Key Per User, Bound to MT5)
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [hasApprovedLicense, setHasApprovedLicense] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [licenseTier, setLicenseTier] = useState<"lifetime" | "50_50">("lifetime");
  const [selectedPlanForInquiry, setSelectedPlanForInquiry] = useState<"lifetime" | "50_50">("lifetime");
  const [loadingLicense, setLoadingLicense] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchKey = async () => {
      setLoadingLicense(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Check mt5_accounts
          const { data: acc } = await supabase
            .from('mt5_accounts')
            .select('account_number, activation_key, is_active, algo_status')
            .eq('user_id', user.id)
            .maybeSingle();

          const cleanAcc = acc?.account_number || localStorage.getItem("tradifive_connected_mt5_account") || "";
          setAccountNumber(cleanAcc);

          // 2. Check profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('activation_key')
            .eq('id', user.id)
            .maybeSingle();

          // 3. Check system_settings auto_trade_admin_records
          let adminApproved = false;
          let adminSuspended = false;
          let adminKey = "";
          let adminTier = "50_50";

          const { data: sysSettings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('id', 'auto_trade_admin_records')
            .maybeSingle();

          if (sysSettings?.value && typeof sysSettings.value === "object") {
            const records: any[] = Array.isArray(sysSettings.value)
              ? sysSettings.value
              : Object.values(sysSettings.value);

            const match = records.find((r: any) =>
              (r.user_id && r.user_id === user.id) ||
              (cleanAcc && (r.mt5_account_number === cleanAcc || r.bound_account === cleanAcc))
            );

            if (match) {
              if (match.license_status === "suspended") {
                adminSuspended = true;
              }
              if (match.license_status === "active" && match.license_key) {
                adminApproved = true;
                adminKey = match.license_key;
                if (match.purchase_tier === "Lifetime License") {
                  adminTier = "lifetime";
                }
              }
            }
          }

          if (adminSuspended || acc?.is_active === false || acc?.algo_status === false) {
            setIsSuspended(true);
          }

          const effectiveKey = adminKey || profile?.activation_key || acc?.activation_key || "";

          // Only consider approved if they have an active admin record OR an existing valid cryptographic key
          if (adminApproved || (effectiveKey && effectiveKey.startsWith("TF-"))) {
            setHasApprovedLicense(true);
            setActivationKey(effectiveKey);
            setLicenseTier(adminTier as "lifetime" | "50_50");
          } else {
            setHasApprovedLicense(false);
            setActivationKey("");
          }
        }
      } catch (e) {
        console.error("Error fetching license status:", e);
      } finally {
        setLoadingLicense(false);
      }
    };
    fetchKey();
  }, []);

  // Real-time listener for MT5 Connection
  useEffect(() => {
    let interval: any;

    if (step === 7) {
      const checkConnection = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('mt5_accounts')
          .select('account_number')
          .eq('user_id', user.id)
          .single();

        if (data && data.account_number) {
          setStep(8); // Jump to definitive SUCCESS screen!
        }
      };

      interval = setInterval(checkConnection, 3000); // Pulse every 3 seconds
      checkConnection();
    }


    return () => clearInterval(interval);
  }, [step]);

  const handleDeployBot = async (bot: any) => {
    setSelectedBot(bot);
    setStep(2);

    // Save the active strategy to Supabase so the MT5 Engine knows which logic to run!
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('mt5_accounts').update({ active_strategy: bot.id }).eq('user_id', user.id);
    }
  };

  const handleDownloadEngine = () => {
    setStep(4);
  };

  const onDownloadComplete = () => {
    if (selectedBot) {
      setDownloadedEngines(prev => ({ ...prev, [selectedBot.id]: true }));
    }
    setStep(5);
  };




  const copyKey = () => {
    navigator.clipboard.writeText(activationKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHeaderBack = () => {
    if (step === 1) {
      navigate(-1);
    } else if (step === 4) {
      setStep(3); // Go back from download to setup intro
    } else if (step === 8) {
      setStep(1); // Reset on success back
    } else {
      setStep(prev => prev - 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "AI Engines", path: "/robots" },
        { label: "Strategy" }
      ]}
      onBack={handleHeaderBack}
    >
      <div className="flex flex-col font-sans overflow-hidden w-full h-full flex-1 pt-0 text-foreground">
        <div className="flex-1 flex flex-col items-center justify-start px-6 w-full pb-24 relative">

          {/* Tactical Deployment Progress Bar */}
          {step > 1 && step < 8 && (
            <div className="w-full max-w-lg mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Setup</span>
                <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 italic">
                  {Math.round(((step - 1) / 6) * 100)}% COMPLETE
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-[#1E1E1E] rounded-full relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((step - 1) / 6) * 100}%` }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="absolute h-full bg-blue-600 rounded-full"
                  style={{
                    boxShadow: '0 0-12px rgba(37, 99, 235, 0.6)',
                  }}
                />
                {/* Visual Glow Layer */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((step - 1) / 6) * 100}%` }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="absolute h-full bg-blue-400/30 blur-[2px] rounded-full"
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* STEP 1: SELECT YOUR ALGO */}
            {step === 1 && (
              <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl mx-auto mt-2">
                <div className="text-center mb-8">
                  <h1 className="text-[30px] font-extrabold tracking-tight text-foreground mb-2">TradiFive AI Engines</h1>
                  <p className="text-slate-500 font-medium text-[15px]">Select the algorithmic model to deploy to your MT5 account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  {BOTS.map((bot, i) => (
                    <motion.div
                      key={bot.id}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-5 md:p-6 border border-slate-200 dark:border-[#333333]/80 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden flex flex-col"
                    >
                      {/* Absolute corner tag to reclaim space */}
                      <div className="absolute top-0 right-0">
                        <span className={`text-[9px] font-black tracking-widest uppercase bg-slate-50 dark:bg-[#141414] border-l border-b border-slate-100 dark:border-[#333333] text-slate-400 px-4 py-2 rounded-bl-[16px] italic shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]`}>
                          {bot.badge.replace(/🔥 |💎 /, "")}
                        </span>
                      </div>

                      {/* Title & Desc - Now at top level */}
                      <h3 className="text-[19px] font-extrabold text-foreground mb-2 mt-2 tracking-tight">{bot.name}</h3>
                      <p className="text-slate-500 text-[13px] font-medium mb-6 leading-relaxed min-h-[38px]">{bot.desc}</p>

                      {/* Metrics Block */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-[12px] p-2.5 flex flex-col justify-center">
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Win Rate</p>
                          <p className="text-foreground font-extrabold text-[15px]">{bot.winRate}</p>
                        </div>
                        <div className={`border-2 ${bot.borderHover} border-slate-100 dark:border-[#333333] bg-white dark:bg-[#1E1E1E] shadow-sm rounded-[12px] p-2.5 flex flex-col justify-center transition-colors`}>
                          <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${bot.textColor}`}>Target</p>
                          <p className={`font-extrabold text-[15px] ${bot.textColor}`}>{bot.profit}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-[12px] p-2.5 flex flex-col justify-center">
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Risk</p>
                          <p className="text-foreground font-extrabold text-[14px]">{bot.risk}</p>
                        </div>
                      </div>

                      {/* Extra Intelligence Features List */}
                      <div className="space-y-2 mb-6 bg-slate-50/50 rounded-[14px] p-4 border border-slate-100 dark:border-[#333333]/80 flex-1">
                        {bot.features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 size={13} className={`${bot.textColor} shrink-0 opacity-70`} strokeWidth={2.5} />
                            <span className="text-slate-500 font-medium text-[12px]">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Deploy Button */}
                      <div className="mt-auto w-full pt-1">
                        <PushableButton variant="deep-3d" onClick={() => handleDeployBot(bot)} className="w-full">
                          Deploy {bot.name.split(' ')[1]}
                        </PushableButton>
                      </div>
                    </motion.div>
                  ))}

                  {/* CUSTOM ALGO FORGE - GATED FOR ADVANCED */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className={`bg-white dark:bg-[#1E1E1E] rounded-[24px] p-5 md:p-6 border-2 border-dashed border-slate-200 dark:border-[#333333] hover:border-blue-300 transition-all duration-300 relative group overflow-hidden flex flex-col ${!isProOrElite ? 'bg-slate-50/50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Activity size={24} className="text-blue-600" />
                      </div>
                      {!isProOrElite ? (
                        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/20">
                          <Lock size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Advanced Tier</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#D1E4FF] dark:bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-[#D6E4FF] dark:border-emerald-500/20">
                           <Sparkles size={12} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Unlocked</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-[19px] font-extrabold text-foreground mb-2 tracking-tight">Custom Algo Forge</h3>
                    <p className="text-slate-500 text-[13px] font-medium mb-6 leading-relaxed">
                      Build your own institutional-grade algorithmic models using our visual node editor. No coding required.
                    </p>

                    <div className="space-y-2 mb-6 bg-slate-100/50 rounded-[14px] p-4 border border-slate-100 dark:border-[#333333] flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0 opacity-70" strokeWidth={2.5} />
                        <span className="text-slate-500 font-medium text-[12px]">Visual Logic Builder</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0 opacity-70" strokeWidth={2.5} />
                        <span className="text-slate-500 font-medium text-[12px]">Custom Risk Profiles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0 opacity-70" strokeWidth={2.5} />
                        <span className="text-slate-500 font-medium text-[12px]">Backtest Architecture</span>
                      </div>
                    </div>

                    <div className="mt-auto w-full pt-1">
                      <PushableButton 
                        variant="deep-3d" 
                        onClick={() => isElite ? toast.success("Forge Initializing...") : navigate("/upgrade")} 
                        className={`w-full ${!isElite ? 'grayscale opacity-80' : ''}`}
                      >
                        {isElite ? 'Enter Forge' : 'Upgrade to Build'}
                      </PushableButton>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONNECT BROKER */}
            {step === 2 && (
              <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto mt-2">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 md:p-10 border border-border/80 shadow-sm text-center relative overflow-hidden">
                  <div className="w-16 h-16 bg-blue-50/50 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-blue-100">
                    <MonitorPlay size={28} className="text-[#3B82F6]" />
                  </div>
                  <h2 className="text-[22px] font-black tracking-tight mb-3 text-foreground uppercase">Connect Account</h2>
                  <p className="text-slate-500 font-medium text-[14px] mb-8 max-w-[280px] mx-auto leading-relaxed">
                    Link your MetaTrader 5 account to activate seamless AI trading.
                  </p>

                  <PushableButton variant="deep-3d" onClick={() => setStep(3)} className="w-full mb-6">
                    CONNECT MT5
                  </PushableButton>

                  <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] py-2 rounded-xl max-w-[240px] mx-auto">
                    <Lock size={12} className="text-slate-300" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Secure link active</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SETUP TRADING ENGINE & LICENSE GATING */}
            {step === 3 && (
              <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg mx-auto mt-2">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 sm:p-8 border border-border/80 shadow-sm">
                  <div className="text-center mb-6">
                    <h2 className="text-[22px] font-black tracking-tight text-foreground uppercase">
                      EA License & Protocol
                    </h2>
                    <p className="text-slate-500 font-medium text-xs mt-1">
                      {hasApprovedLicense
                        ? "Your license is approved. Download Tradifive.ex5 and attach to MT5."
                        : "Select your license tier. Exactly 1 hardware-locked key is issued per MT5 account."}
                    </p>
                  </div>

                  {/* Suspended Alert */}
                  {isSuspended && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-6 flex items-start gap-3">
                      <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                          Trading Suspended by Admin
                        </h4>
                        <p className="text-xs text-rose-600/90 dark:text-rose-400/90 mt-1 leading-relaxed">
                          Your EA license key has been suspended. In your MT5 terminal, the Tradifive EA has ceased trading and removed pending orders. Please contact support to reactivate.
                        </p>
                        <a
                          href="https://wa.me/919999999999?text=Hello%20Tradifive%20Support%2C%20my%20EA%20license%20is%20suspended.%20Please%20assist%20me%20to%20reactivate."
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          <MessageCircle size={12} /> Contact Tradifive Support
                        </a>
                      </div>
                    </div>
                  )}

                  {/* If Approved & Active */}
                  {hasApprovedLicense ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <ShieldCheck size={22} />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                              License Approved & Verified
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {licenseTier === "lifetime" ? "1 Lakh Lifetime License (0% Share)" : "Daily 50% Profit Share Partner"}
                            </h4>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 bg-black/10 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                          #{accountNumber || "MT5"}
                        </span>
                      </div>

                      <div className="space-y-4 max-w-sm mx-auto pt-2">
                        <PushableButton
                          variant="deep-3d"
                          onClick={handleDownloadEngine}
                          disabled={isSuspended}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> Download EA (Tradifive.ex5)
                        </PushableButton>
                        <PushableButton
                          variant="secondary"
                          onClick={() => setStep(5)}
                          className="w-full"
                        >
                          View License Key & Guide
                        </PushableButton>
                      </div>
                    </div>
                  ) : (
                    /* If Not Approved / Unpaid: Show the Two Plan Options & Talk with Team */
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option 1: 1 Lakh Lifetime License */}
                        <div
                          onClick={() => setSelectedPlanForInquiry("lifetime")}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                            selectedPlanForInquiry === "lifetime"
                              ? "border-amber-500 bg-amber-50/40 dark:bg-amber-500/10 shadow-sm"
                              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Crown size={18} className="text-amber-500" />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                              0% Share
                            </span>
                          </div>
                          <h4 className="text-[13px] font-black text-slate-900 dark:text-white">
                            1 Lakh Lifetime
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            ₹1,00,000 / $1,200 one-time. Keep 100% of all profits. 1 hardware-bound permanent key.
                          </p>
                          <div className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400">
                            Full Ownership
                          </div>
                        </div>

                        {/* Option 2: 50/50 Profit Split Partner */}
                        <div
                          onClick={() => setSelectedPlanForInquiry("50_50")}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                            selectedPlanForInquiry === "50_50"
                              ? "border-sky-500 bg-sky-50/40 dark:bg-sky-500/10 shadow-sm"
                              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Activity size={18} className="text-sky-500" />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300">
                              Partner
                            </span>
                          </div>
                          <h4 className="text-[13px] font-black text-slate-900 dark:text-white">
                            50/50 Profit Split
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            ₹0 Upfront. Split daily trading profits 50/50 with Tradifive via crypto remittance.
                          </p>
                          <div className="mt-3 text-xs font-bold text-sky-600 dark:text-sky-400">
                            Zero Initial Cost
                          </div>
                        </div>
                      </div>

                      {/* Locked EA Download Button Notice */}
                      <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <Lock size={16} className="text-amber-500 shrink-0" />
                        <span>
                          EA download and cryptographic activation key unlock automatically once your plan is approved by the admin.
                        </span>
                      </div>

                      {/* Talk with Tradifive Team CTA */}
                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(
                          `Hello Tradifive Team! I want to get an MT5 EA License Key for Account #${accountNumber || "new"}. I am interested in the ${
                            selectedPlanForInquiry === "lifetime"
                              ? "₹1 Lakh Lifetime License (0% Profit Share)"
                              : "50/50 Profit Split Partner"
                          } plan. Please help me get activated.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <MessageCircle size={16} />
                        <span>Talk with Tradifive Team to Activate</span>
                        <ArrowRight size={14} />
                      </a>

                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 opacity-70 cursor-not-allowed"
                      >
                        <Lock size={13} />
                        <span>EA Download Locked (Activation Required)</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: DOWNLOAD PROGRESS UI (INLINE) */}
            {step === 4 && (
              <motion.div key="step4-inline" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                <DownloadEngineFlow
                  onDownloadComplete={onDownloadComplete}
                  alreadyDownloaded={selectedBot ? downloadedEngines[selectedBot.id] : false}
                  fileName="Tradifive.ex5"
                />
              </motion.div>
            )}

            {/* STEP 5: ACTIVATION KEY */}
            {step === 5 && (
              <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto mt-2">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 md:p-10 border border-border/80 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                    <Download size={100} className="text-primary" />
                  </div>

                  <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-primary/20 relative z-10">
                    {hasApprovedLicense && !isSuspended ? (
                      <ShieldCheck size={28} className="text-primary" />
                    ) : (
                      <Lock size={28} className="text-amber-500" />
                    )}
                  </div>

                  <h2 className="text-[22px] font-black tracking-[0.05em] mb-2 text-foreground uppercase italic">
                    {isSuspended ? "License Suspended" : hasApprovedLicense ? "Control Key Ready" : "Activation Required"}
                  </h2>
                  <p className="text-slate-500 text-[13px] font-medium mb-8 max-w-[300px] mx-auto leading-relaxed">
                    {isSuspended
                      ? "Trading has been halted by admin kill-switch. Contact support to reactivate your license."
                      : hasApprovedLicense
                      ? `Hardware-locked to MT5 #${accountNumber || "your account"}. Paste into Tradifive EA inputs.`
                      : "You must connect with the Tradifive team to receive an approved activation key."}
                  </p>

                  {hasApprovedLicense && !isSuspended ? (
                    <div className="max-w-xs mx-auto mb-8 relative group">
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                        Cryptographic Key (1 Key Bound)
                      </p>
                      <div className="bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-[16px] p-3.5 flex items-center justify-between group overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                        <span className="text-foreground font-mono text-[13px] tracking-wide font-black truncate max-w-[200px]">
                          {activationKey}
                        </span>
                        <PushableButton
                          variant="deep-3d"
                          onClick={() => copyKey(activationKey)}
                          className="p-1.5 min-w-[38px]"
                        >
                          {copied ? <CheckCircle2 size={15} className="text-primary" /> : <Copy size={15} />}
                        </PushableButton>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xs mx-auto mb-8">
                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(
                          `Hello Tradifive Team, I need help with my MT5 License Key for Account #${accountNumber || "new"}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all"
                      >
                        <MessageCircle size={15} /> Talk with Tradifive Support
                      </a>
                    </div>
                  )}

                  <PushableButton
                    variant="deep-3d"
                    onClick={() => setStep(6)}
                    disabled={!hasApprovedLicense || isSuspended}
                    className="w-full"
                  >
                    INITIALIZE SETUP <ArrowRight size={16} className="ml-1" />
                  </PushableButton>
                </div>
              </motion.div>
            )}

            {/* STEP 6: SETUP GUIDE - High Density Refinement */}
            {step === 6 && (
              <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl mx-auto mt-2">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[28px] p-8 border border-slate-100 dark:border-[#333333] shadow-sm space-y-10">

                  {/* Premium 3D Player Aesthetic */}
                  <div className="relative aspect-video rounded-[24px] bg-slate-900 overflow-hidden shadow-2xl group cursor-pointer border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/10 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <PlayCircle size={40} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Tutorial // HQ</span>
                    </div>
                  </div>

                  {/* High Density Instructions Stack */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Setup Instructions</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-[#141414] px-2 py-0.5 rounded border border-slate-100 dark:border-[#333333]">REV 1.4</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-slate-50/50 border border-slate-100 dark:border-[#333333] rounded-2xl">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-[10px] font-black text-white flex items-center justify-center mt-0.5">01</span>
                        <div className="flex-1">
                          <p className="text-[13px] font-black text-foreground uppercase tracking-tight">Deploy Engine File</p>
                          <button onClick={handleDownloadEngine} className="text-[11px] font-bold text-blue-600 hover:underline mt-1 flex items-center gap-1">
                            <Download size={12} /> GET LATEST .EX5
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-white dark:bg-[#1E1E1E] border border-slate-50 dark:border-white/5 dark:border-white/5 rounded-2xl">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-black text-white flex items-center justify-center mt-0.5">02</span>
                        <p className="text-[13px] font-bold text-slate-600 leading-tight">Paste Engine into MT5 "Experts" folder and attach to any active chart.</p>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-white dark:bg-[#1E1E1E] border border-slate-50 dark:border-white/5 dark:border-white/5 rounded-2xl">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-black text-white flex items-center justify-center mt-0.5">03</span>
                        <div className="space-y-3 w-full">
                          <p className="text-[13px] font-bold text-slate-600">Inject Encryption Key (found in previous step):</p>
                          <div className="bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-xl p-3 flex items-center justify-between font-mono text-[11px] font-black text-slate-400 tracking-widest uppercase">
                            {activationKey.substring(0, 15)}...
                            <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">STABLE</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <PushableButton variant="deep-3d" onClick={() => setStep(7)} className="w-full">
                      DEPLOUMENT COMPLETE <ArrowRight size={16} className="ml-1" />
                    </PushableButton>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 7: REAL-TIME MT5 LISTENER */}
            {step === 7 && (
              <motion.div key="step7" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto mt-2">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-10 border border-border/80 shadow-sm text-center flex flex-col items-center">
                  <div className="relative mb-8 pt-6">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                    <Loader2 size={56} className="text-primary relative z-10 animate-spin" />
                  </div>

                  <h2 className="text-[24px] font-black tracking-tight mb-4 text-foreground uppercase">Synchronizing...</h2>
                  <p className="text-slate-500 text-[14px] font-medium mb-8 max-w-[300px] mx-auto leading-relaxed">
                    Awaiting heartbeat signal from your MT5 terminal. Setup is nearly complete.
                  </p>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-xl px-5 py-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-slate-500 text-[13px] font-bold">Awaiting Webhook Payload</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 8: SUCCESS SCREEN */}
            {step === 8 && (
              <motion.div key="step8" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto mt-2">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 md:p-10 border border-border/80 shadow-sm text-center flex flex-col items-center">
                  <div className="relative mb-8 pt-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center relative z-10 border border-primary/20 text-primary shadow-inner"
                    >
                      <CheckCircle2 size={44} strokeWidth={2.5} />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-primary/20 rounded-full blur-2xl -z-10"
                    />
                  </div>

                  <h1 className="text-[36px] font-bold tracking-tight text-foreground mb-4">Your AI is Live 🚀</h1>
                  <p className="text-slate-500 font-medium text-[16px] max-w-md mx-auto mb-10 leading-relaxed">
                    <span className="text-foreground font-bold">{selectedBot?.name || "Your selected bot"}</span> is now actively trading on your account.
                  </p>

                  <div className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333333] rounded-[16px] py-4 px-8 mb-12 flex items-center gap-3 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary relative z-10"></div>
                    <span className="text-slate-700 font-bold tracking-wide text-sm">Status: Active</span>
                  </div>

                  <PushableButton
                    variant="deep-3d"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </PushableButton>
                </div>
              </motion.div>
            )}


          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>


  );
}






