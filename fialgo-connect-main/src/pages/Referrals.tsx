import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Share2, Copy, CheckCircle2, Gift, DollarSign, ArrowRight,
  ShieldCheck, Sparkles, Send, ExternalLink, HelpCircle, ChevronRight,
  TrendingUp, Wallet, Check, AlertCircle, MessageCircle, QrCode, X,
  Trophy, Award, Zap, Phone, Landmark, Percent, Clock, UserPlus, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

// ── Consistent Card Box & KPI Box Styles (Shared with Dashboard, AI Journal, & RiskGuard) ──
const kpiBoxStyle = "min-h-[126px] p-4 sm:px-5 sm:py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none overflow-hidden";

const cardBoxStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none transition-all";

const innerBoxStyle = "p-3.5 sm:p-4 rounded-[16px] bg-[#F4F6F9]/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5";

// ─── PARTNERSHIP TIERS CONFIGURATION ──────────────────────────────────────────
const AFFILIATE_TIERS = [
  {
    tier: "Tier 1",
    name: "Starter Partner",
    milestone: "1–4 Traders",
    minTraders: 1,
    maxTraders: 4,
    upfrontBonus: "₹1,000",
    upfrontNum: 1000,
    profitOverride: "5.0%",
    perks: ["₹1,000 instant setup commission", "5% weekly profit share override", "Weekly UPI / Bank payouts"],
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    accent: "from-blue-600 to-cyan-600"
  },
  {
    tier: "Tier 2",
    name: "Growth Affiliate",
    milestone: "5–9 Traders",
    minTraders: 5,
    maxTraders: 9,
    upfrontBonus: "₹1,500",
    upfrontNum: 1500,
    profitOverride: "7.5%",
    perks: ["₹1,500 instant setup commission", "7.5% weekly profit share override", "Priority WhatsApp Desk clearance", "Exclusive TradiFive Partner badge"],
    badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
    accent: "from-violet-600 to-purple-600"
  },
  {
    tier: "Tier 3",
    name: "Institutional VIP Desk",
    milestone: "10+ Traders",
    minTraders: 10,
    maxTraders: 999,
    upfrontBonus: "₹2,000",
    upfrontNum: 2000,
    profitOverride: "10.0%",
    perks: ["₹2,000 instant setup commission", "10% weekly profit share override", "Dedicated Account Executive", "Custom branded landing page"],
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    accent: "from-amber-500 to-yellow-500"
  }
];

export default function Referrals() {
  const [userName, setUserName] = useState<string>("Trader");
  const [userId, setUserId] = useState<string>("");
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"link" | "code">("link");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutUpi, setPayoutUpi] = useState<string>("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState<boolean>(false);

  // Settlement Day preference (matches AutoTrade cohort)
  const [settlementDay] = useState<string>(() => {
    try {
      return localStorage.getItem("tradifive_settlement_day") || "Wednesday";
    } catch (e) {
      return "Wednesday";
    }
  });

  // Real Referral Telemetry Stats
  const [loading, setLoading] = useState<boolean>(true);
  const [totalReferred, setTotalReferred] = useState<number>(0);
  const [activeBrokers, setActiveBrokers] = useState<number>(0);
  const [earnedCash, setEarnedCash] = useState<number>(0);
  const [pendingCash, setPendingCash] = useState<number>(0);
  const [referredList, setReferredList] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current tier
  const currentTier = React.useMemo(() => {
    if (activeBrokers >= 10) return AFFILIATE_TIERS[2];
    if (activeBrokers >= 5) return AFFILIATE_TIERS[1];
    return AFFILIATE_TIERS[0];
  }, [activeBrokers]);

  const nextTier = React.useMemo(() => {
    if (activeBrokers < 5) return AFFILIATE_TIERS[1];
    if (activeBrokers < 10) return AFFILIATE_TIERS[2];
    return null;
  }, [activeBrokers]);

  const progressToNext = React.useMemo(() => {
    if (activeBrokers >= 10) return 100;
    if (activeBrokers >= 5) {
      return Math.round(((activeBrokers - 5) / 5) * 100);
    }
    return Math.round((activeBrokers / 5) * 100);
  }, [activeBrokers]);

  useEffect(() => {
    async function loadAffiliateData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, referral_code, phone")
            .eq("id", user.id)
            .maybeSingle();

          const uname = profile?.display_name || profile?.username || "Trader";
          setUserName(uname);

          const cleanCode = profile?.referral_code || `TF-${(profile?.username || user.id.slice(0, 6)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;
          setReferralCode(cleanCode);

          const origin = typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
            ? window.location.origin
            : "https://www.tradifive.in";
          setReferralLink(`${origin}/login?ref=${cleanCode}`);

          // Fetch real referrals from DB
          const { data: refs, error: refsError } = await supabase
            .from("referrals")
            .select(`
              id,
              status,
              created_at,
              completed_at,
              profiles:referred_id (
                display_name,
                username,
                created_at,
                is_verified
              )
            `)
            .eq("referrer_id", user.id)
            .order("created_at", { ascending: false });

          if (!refsError && refs && refs.length > 0) {
            setTotalReferred(refs.length);
            const active = refs.filter(r => r.status === "completed").length;
            setActiveBrokers(active);

            // Compute commissions based on tiers
            const rate = active >= 10 ? 2000 : active >= 5 ? 1500 : 1000;
            const earned = active * rate;
            const pending = (refs.length - active) * rate;

            setEarnedCash(earned);
            setPendingCash(pending);

            const mapped = refs.map((item: any) => {
              const p = item.profiles || {};
              const name = p.display_name || p.username || "Trader Friend";
              const isActive = item.status === "completed";
              return {
                id: item.id,
                name,
                username: p.username ? `@${p.username}` : "@trader",
                date: new Date(item.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }),
                status: isActive ? "active" : "pending",
                commission: isActive ? `+₹${rate.toLocaleString()}` : `₹${rate.toLocaleString()} Pending`,
                payoutStatus: isActive ? "Settled" : "Awaiting MT5 Setup"
              };
            });
            setReferredList(mapped);
          } else {
            // Fresh account zero state
            setTotalReferred(0);
            setActiveBrokers(0);
            setEarnedCash(0);
            setPendingCash(0);
            setReferredList([]);
          }
        }
      } catch (e) {
        console.error("Affiliate load error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadAffiliateData();
  }, []);

  const displayValue = activeTab === "link" ? referralLink : referralCode;

  const handleCopy = (isDirectCode = false) => {
    const val = isDirectCode ? referralCode : displayValue;
    navigator.clipboard.writeText(val);
    setCopied(true);
    toast.success(isDirectCode || activeTab === "code" ? "Referral code copied!" : "Referral link copied!", {
      description: "Share it with traders to earn ₹2,000 + 10% weekly profit share."
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Automate your trading with FiAlgo V1 on TradiFive. Precision Gold (XAUUSD) execution with weekly 50/50 profit share. Sign up with my partner link: ${referralLink}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join TradiFive Automated Trading",
          text: shareText,
          url: referralLink,
        });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  const handleRequestPayout = () => {
    if (earnedCash <= 0) {
      toast.info("No settled commission available yet", {
        description: "Your commission activates automatically when your referred traders link their MT5 account."
      });
      return;
    }
    setShowPayoutModal(true);
  };

  const handleConfirmPayout = () => {
    if (!payoutUpi.trim()) {
      toast.error("Please enter a valid UPI ID (e.g. yourname@oksbi)");
      return;
    }
    setIsSubmittingPayout(true);

    const message = `Hello TradiFive Finance Team!
I am requesting a referral commission payout:
• Referrer: ${userName} (ID: ${referralCode})
• Amount: ₹${earnedCash.toLocaleString()}
• Active Referrals: ${activeBrokers}
• UPI ID for Transfer: ${payoutUpi.trim()}
• Scheduled Payout Day: Every ${settlementDay}

Please verify and process my remittance. Thank you!`;

    const waUrl = `https://wa.me/919731980756?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    toast.success("Payout request generated!", {
      description: "Our Finance Desk processes referral clearances every " + settlementDay + "."
    });

    setIsSubmittingPayout(false);
    setShowPayoutModal(false);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(referralLink || "https://www.tradifive.in")}`;

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Affiliate & Referrals' }]}>
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 md:px-8 pb-12 space-y-5 select-none font-sans min-h-screen">
        
        {/* ── 1. SIGNATURE HEADER & PARTNER NETWORK STRIP ── */}
        <div className={cardBoxStyle}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>TradiFive Partner Network · Live</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                  <ShieldCheck size={12} />
                  <span>Weekly Payouts Every {settlementDay}</span>
                </span>
              </div>

              <h1
                className="text-[24px] sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Partner &amp; Referral Program
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                Earn up to <strong className="text-slate-800 dark:text-slate-200 font-bold">₹2,000 instant cash bonus</strong> per trader + <strong className="text-emerald-600 dark:text-emerald-400 font-bold">10% weekly profit share overrides</strong> when friends activate FiAlgo V1 automated trading.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRequestPayout}
                className="h-[38px] px-4 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-[0_4px_7px_-5px_rgba(16,185,129,0.4),0_0_0_2px_#059669] text-xs font-bold tracking-tight cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Wallet size={15} />
                <span>Withdraw Commissions</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="h-[38px] w-[38px] rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                title="Show QR Code for mobile scanning"
              >
                <QrCode size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. METRICS ROW (CORE 4 KPI BOXES MATCHING DASHBOARD) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* 1. Settled Earnings */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Settled Earnings
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h3
                className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                ₹{earnedCash.toLocaleString()}
              </h3>
              <div className="flex items-center justify-between mt-1 pt-0.5">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                  {activeBrokers > 0 ? `${activeBrokers} Active FiAlgo bot${activeBrokers > 1 ? 's' : ''}` : "100% direct cash payout"}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                  Cleared
                </span>
              </div>
            </div>
          </div>

          {/* 2. Pipeline Commissions */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Pipeline Commissions
              </p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h3
                className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                ₹{pendingCash.toLocaleString()}
              </h3>
              <div className="flex items-center justify-between mt-1 pt-0.5">
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 truncate">
                  {totalReferred - activeBrokers} registered · Pending setup
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
                  In Queue
                </span>
              </div>
            </div>
          </div>

          {/* 3. Active Traders */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Active Traders
              </p>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <h3
                  className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {activeBrokers}
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  / {totalReferred} Total
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-0.5">
                <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400 truncate">
                  Verified MT5 Engine
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 shrink-0">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* 4. Current Affiliate Tier */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Affiliate Tier
              </p>
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3
                  className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap truncate"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {currentTier.name}
                </h3>
                <span className="text-[10px] font-mono font-extrabold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-200/60 dark:border-violet-500/20 shrink-0">
                  {currentTier.profitOverride}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{nextTier ? `${activeBrokers} / ${nextTier.minTraders} for ${nextTier.name}` : "Max VIP Level"}</span>
                  <span className="font-bold">{progressToNext}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. INVITE WORKSTATION & VIRAL 1-CLICK SHARING ── */}
        <div className={cardBoxStyle}>
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Share2 size={15} />
                  </div>
                  <h2
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Your Unique Referral Workstation
                  </h2>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  Share your personalized link or 8-digit partner code. Any trader signing up is permanently credited to your account.
                </p>
              </div>

              {/* Toggle Link / Code */}
              <div className="flex items-center p-1 rounded-[12px] bg-[#F4F6F9] dark:bg-white/5 border border-slate-200/80 dark:border-white/5 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("link")}
                  className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "link"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Referral Link
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "code"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Partner Code
                </button>
              </div>
            </div>

            {/* Copyable Input Row */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="flex-1 relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  readOnly
                  value={loading ? "Generating..." : displayValue}
                  onClick={() => inputRef.current?.select()}
                  className="w-full h-11 px-4 rounded-[14px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all select-all shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={() => handleCopy()}
                className={`h-11 px-6 rounded-[14px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#2563EB] active:scale-95 ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600"
                }`}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Social Share Buttons (WhatsApp, Telegram, X, Native) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                1-Click Instant Share:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 transition-all cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join TradiFive Automated Gold AI Trading")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] border border-[#0088cc]/30 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>Telegram</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                >
                  <span>𝕏 Post</span>
                </a>

                {/* Mobile Native Share Sheet */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/80 dark:border-white/10"
                >
                  <Share2 size={13} />
                  <span>More</span>
                </button>

                {/* QR Code */}
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/80 dark:border-white/10"
                >
                  <QrCode size={13} />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. EXPANSIVE 2-COLUMN SECTION: TIERS + TABLE & RIGHT SIDEBAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT 8 COLUMNS: TIERS, HOW IT WORKS & REFERRED TRADERS */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 3 Affiliate Partnership Tiers */}
            <div className={cardBoxStyle}>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <Trophy size={18} className="text-amber-500" />
                      <span>Affiliate Commission Tiers</span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                      Your commissions automatically elevate as your referred network of traders scales.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-500/20">
                    {activeBrokers} Active Traders
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {AFFILIATE_TIERS.map((tier) => {
                    const isCurrent = currentTier.name === tier.name;
                    return (
                      <div
                        key={tier.name}
                        className={`relative p-4 sm:p-5 rounded-[18px] border-2 transition-all space-y-3 flex flex-col justify-between ${
                          isCurrent
                            ? "bg-white dark:bg-[#1A1A1E] border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                            : "bg-[#F8F9FC]/80 dark:bg-white/[0.02] border-white dark:border-white/5 shadow-xs"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              {tier.tier} · {tier.milestone}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white shadow-2xs">
                                Your Tier
                              </span>
                            )}
                          </div>

                          <h4
                            className="text-base font-bold text-slate-900 dark:text-white"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {tier.name}
                          </h4>

                          <div className="pt-1 pb-1">
                            <div
                              className="text-[22px] sm:text-[24px] font-bold text-emerald-600 dark:text-emerald-400"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {tier.upfrontBonus}
                              <span className="text-xs font-semibold text-slate-400 ml-1">/ Trader</span>
                            </div>
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                              + {tier.profitOverride} Weekly Override
                            </div>
                          </div>

                          <ul className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400">
                            {tier.perks.map((p, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Systematic 3-Step Process */}
            <div className={cardBoxStyle}>
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <h3
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    How The Referral Program Works
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                    Fully automated, verified via MetaTrader 5 and directly paid to your bank every {settlementDay}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className={innerBoxStyle}>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center mb-2">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Share Your Link
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Send your partner link to fellow traders via WhatsApp, Telegram, or social media.
                    </p>
                  </div>

                  <div className={innerBoxStyle}>
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-sm flex items-center justify-center mb-2">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      They Connect MT5
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Your friend activates FiAlgo V1 with ₹9,999 setup fee. The system instantly credits your commission.
                    </p>
                  </div>

                  <div className={innerBoxStyle}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center mb-2">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Weekly Direct Payout
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Earn up to ₹2,000 cash per setup + ongoing weekly 50/50 profit overrides every {settlementDay}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referred Friends Real Table */}
            <div className={cardBoxStyle}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <Users size={17} className="text-blue-500" />
                      <span>Your Referred Traders Log</span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                      Live ledger of traders registered under your partner code.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-[#F4F6F9] dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/5">
                    {referredList.length} Total Registered
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-14 rounded-[14px] bg-slate-100 dark:bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : referredList.length === 0 ? (
                  <div className="py-10 text-center space-y-3 bg-[#F8F9FC]/60 dark:bg-white/[0.01] rounded-[18px] border border-dashed border-slate-200 dark:border-white/10">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                      <UserPlus size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No referred traders yet
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                        Share your referral link on WhatsApp or trading groups to earn ₹2,000 cash for every new automated trading terminal.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy()}
                      className="h-9 px-4 rounded-[12px] text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Copy size={13} />
                      <span>Copy Your Referral Link</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto amazing-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Trader</th>
                          <th className="py-2.5 px-3">Registered</th>
                          <th className="py-2.5 px-3">Bot Status</th>
                          <th className="py-2.5 px-3 text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {referredList.map((trader) => (
                          <tr key={trader.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {trader.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {trader.username}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-medium">
                              {trader.date}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                trader.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${trader.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                <span>{trader.status === "active" ? "FiAlgo Active" : "Pending Setup"}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`font-mono font-bold ${
                                trader.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                              }`}>
                                {trader.commission}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: PAYOUT DESK, MARKETING COPY & FAQ */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
            
            {/* Payout & Withdrawal Action Card */}
            <div className={cardBoxStyle}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Commission Wallet
                  </span>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                    Guaranteed Clearance
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available For Withdrawal:</span>
                  <div
                    className="text-[26px] sm:text-[28px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ₹{earnedCash.toLocaleString()}
                  </div>
                </div>

                <div className={innerBoxStyle + " space-y-2 text-xs"}>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Settlement Schedule:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">Every {settlementDay}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Transfer Method:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">Direct UPI / NEFT</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Min. Withdrawal:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">₹1,000 (1 Trader)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestPayout}
                  className="w-full h-11 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center gap-2 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.2),0_0_0_2px_#334155] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
                >
                  <Landmark size={15} />
                  <span>Request Payout Transfer →</span>
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Direct WhatsApp finance desk confirmation upon submission.
                </p>
              </div>
            </div>

            {/* Quick Pitch Bullet Points for Traders */}
            <div className={cardBoxStyle}>
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-500" />
                  <span>How to Pitch FiAlgo V1</span>
                </h4>

                <div className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <div className={innerBoxStyle}>
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">1. Zero Manual Work:</strong>
                    FiAlgo V1 executes M1 gold trades automatically with hardware stop-loss protection.
                  </div>
                  <div className={innerBoxStyle}>
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">2. Aligned Interests:</strong>
                    Only a ₹9,999 setup fee with weekly 50/50 profit share. Zero commission on red days.
                  </div>
                  <div className={innerBoxStyle}>
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">3. Capital Safety:</strong>
                    100% of user capital stays locked in their own verified broker account.
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Program FAQ */}
            <div className={cardBoxStyle}>
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-violet-500" />
                  <span>Affiliate FAQ</span>
                </h4>

                <div className="space-y-2.5 text-slate-600 dark:text-slate-400 font-medium">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block font-bold mb-0.5">When is commission paid?</strong>
                    Commissions are settled every {settlementDay} directly to your UPI ID or bank account.
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block font-bold mb-0.5">Is there any referral limit?</strong>
                    No limit! Refer unlimited traders and unlock Tier 3 VIP 10% overrides forever.
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block font-bold mb-0.5">How do I track referred friends?</strong>
                    Your dashboard log updates in real-time as friends register and link MT5.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── QR CODE MODAL ── */}
        <AnimatePresence>
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-2xl dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 p-6 space-y-5 relative text-center"
              >
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="space-y-1 pt-2">
                  <h3
                    className="text-base font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Scan to Join TradiFive
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Scan with any smartphone camera to open your referral link.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-[18px] border border-slate-200 shadow-inner inline-block">
                  <img
                    src={qrImageUrl}
                    alt="Referral QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 py-2 px-3 rounded-[12px] border border-slate-200/80 dark:border-white/5">
                    {referralCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCopy();
                      setShowQrModal(false);
                    }}
                    className="w-full h-10 rounded-[12px] text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Copy Link Instead
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── PAYOUT REQUEST MODAL ── */}
        <AnimatePresence>
          {showPayoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-2xl dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 p-6 space-y-5 relative"
              >
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Wallet size={18} />
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider">Fast-Track Payout</span>
                  </div>
                  <h3
                    className="text-lg font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Withdraw Referral Commissions
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Direct clearance processed to your verified Indian UPI ID or Bank account.
                  </p>
                </div>

                <div className="p-3.5 rounded-[16px] bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Withdrawable Balance:</span>
                  <span
                    className="text-xl font-bold text-emerald-600"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ₹{earnedCash.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Enter UPI ID / VPA:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210@paytm or name@oksbi"
                    value={payoutUpi}
                    onChange={(e) => setPayoutUpi(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">
                    Clearance schedule: Every {settlementDay} at 18:00 IST.
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 h-11 rounded-[14px] text-xs font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayout}
                    disabled={isSubmittingPayout}
                    className="flex-1 h-11 rounded-[14px] text-xs font-bold bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>Confirm via WhatsApp →</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
