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
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: EXPO_OUT },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: EXPO_OUT },
  },
};

// ── Consistent Card Box & KPI Box Styles (Shared with Dashboard, AI Journal, & Reports) ──
const SURFACE_CARD =
  "bg-white dark:bg-[#17171A] rounded-[20px] p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.03),0_8px_20px_-8px_rgba(15,23,42,0.06)] dark:shadow-none transition-all";

const INNER_CARD =
  "p-3.5 sm:p-4 rounded-[16px] bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]";

// ─── PARTNERSHIP TIERS CONFIGURATION (SUBSCRIPTION RECURRING) ──────────────────
const AFFILIATE_TIERS = [
  {
    tier: "Tier 1",
    name: "Starter Partner",
    milestone: "1–4 Subscribers",
    minTraders: 1,
    maxTraders: 4,
    upfrontBonus: "10%",
    upfrontNum: 140,
    profitOverride: "₹140/mo Pro · ₹280/mo Elite",
    perks: ["10% recurring monthly commission", "Friend gets 5% off first plan", "Weekly UPI / Bank payouts"],
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    accent: "from-blue-600 to-cyan-600"
  },
  {
    tier: "Tier 2",
    name: "Growth Partner",
    milestone: "5–14 Subscribers",
    minTraders: 5,
    maxTraders: 14,
    upfrontBonus: "15%",
    upfrontNum: 210,
    profitOverride: "₹210/mo Pro · ₹420/mo Elite",
    perks: ["15% recurring monthly commission", "Friend gets 5% off first plan", "Priority UPI / Bank clearance", "Exclusive TradiFive Partner badge"],
    badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
    accent: "from-violet-600 to-purple-600"
  },
  {
    tier: "Tier 3",
    name: "Ambassador",
    milestone: "15+ Subscribers",
    minTraders: 15,
    maxTraders: 999,
    upfrontBonus: "20%",
    upfrontNum: 280,
    profitOverride: "₹280/mo Pro · ₹560/mo Elite",
    perks: ["20% recurring monthly commission", "Friend gets 5% off first plan", "Dedicated Partner Support", "Custom creator highlight"],
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
    if (activeBrokers >= 15) return AFFILIATE_TIERS[2];
    if (activeBrokers >= 5) return AFFILIATE_TIERS[1];
    return AFFILIATE_TIERS[0];
  }, [activeBrokers]);

  const nextTier = React.useMemo(() => {
    if (activeBrokers < 5) return AFFILIATE_TIERS[1];
    if (activeBrokers < 15) return AFFILIATE_TIERS[2];
    return null;
  }, [activeBrokers]);

  const progressToNext = React.useMemo(() => {
    if (activeBrokers >= 15) return 100;
    if (activeBrokers >= 5) {
      return Math.round(((activeBrokers - 5) / 10) * 100);
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

            // Compute recurring monthly commissions based on tiers (Pro ₹1,399 baseline)
            const rate = active >= 15 ? 280 : active >= 5 ? 210 : 140;
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
                commission: isActive ? `+₹${rate.toLocaleString()}/mo` : `₹${rate.toLocaleString()}/mo Potential`,
                payoutStatus: isActive ? "Settled" : "Awaiting Subscription"
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
      description: "Friends get 5% off their first plan & you earn up to 20% recurring monthly commission."
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Upgrade your trading discipline with TradiFive (Risk Guard, Smart Journal & AI Coach). Use my referral link to get 5% off your first Pro or Elite plan: ${referralLink}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get 5% Off TradiFive Pro & Elite",
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
        description: "Your recurring commission activates automatically when your referred friends subscribe to Pro or Elite."
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 md:px-8 pb-12 space-y-5 select-none font-sans min-h-screen"
      >
        
        {/* ── 1. SIGNATURE HEADER & PARTNER NETWORK STRIP ── */}
        <motion.div variants={sectionVariants} className={SURFACE_CARD}>
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

              <h1 className="text-[24px] sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                Partner &amp; Referral Program
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                Give friends <strong className="text-slate-800 dark:text-slate-200 font-bold">5% OFF</strong> their first Pro or Elite subscription and earn up to <strong className="text-emerald-600 dark:text-emerald-400 font-bold">20% recurring monthly commission</strong> for as long as they stay subscribed.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleRequestPayout}
                className="tactile-emerald-pill h-[36px] px-4 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-sm whitespace-nowrap"
              >
                <Wallet size={14} />
                <span>Withdraw Commissions</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="tactile-white-pill h-[36px] w-[36px] rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none active:scale-95 shadow-xs"
                title="Show QR Code for mobile scanning"
              >
                <QrCode size={15} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── 2. METRICS ROW (5 CONSISTENCY CARDS MATCHING REPORTS) ── */}
        <motion.div variants={sectionVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Card 1: Settled Earnings */}
          <motion.div variants={cardItemVariants} className="p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/25">
            <div className="absolute top-4 right-4 text-emerald-600/30 group-hover:text-emerald-600/60 transition-colors">
              <DollarSign size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
              Settled Cash
            </span>
            <h3 className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none truncate tabular-nums">
              ₹<AnimatedNumber value={earnedCash} duration={800} format={(v) => Math.round(v).toLocaleString()} />
            </h3>
            <p className="text-[11px] font-semibold mt-2 text-emerald-600/90 dark:text-emerald-400/90 truncate">
              {activeBrokers > 0 ? `${activeBrokers} Active sub${activeBrokers > 1 ? "s" : ""}` : "Recurring monthly"} · Cleared
            </p>
          </motion.div>

          {/* Card 2: Pipeline Commissions */}
          <motion.div variants={cardItemVariants} className="p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-amber-500/25">
            <div className="absolute top-4 right-4 text-amber-600/30 group-hover:text-amber-600/60 transition-colors">
              <Clock size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
              In Pipeline
            </span>
            <h3 className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-amber-600 dark:text-amber-400 tracking-tight leading-none truncate tabular-nums">
              ₹<AnimatedNumber value={pendingCash} duration={800} delay={60} format={(v) => Math.round(v).toLocaleString()} />
            </h3>
            <p className="text-[11px] font-semibold mt-2 text-amber-600/90 dark:text-amber-400/90 truncate">
              {totalReferred - activeBrokers} signed up · Free plan
            </p>
          </motion.div>

          {/* Card 3: Paid Subscribers */}
          <motion.div variants={cardItemVariants} className="p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border bg-sky-500/[0.04] dark:bg-sky-500/[0.08] border-sky-500/25">
            <div className="absolute top-4 right-4 text-sky-600/30 group-hover:text-sky-600/60 transition-colors">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
              Paid Subscribers
            </span>
            <h3 className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-none truncate tabular-nums">
              <AnimatedNumber value={activeBrokers} duration={750} delay={100} format={(v) => String(Math.round(v))} />{" "}
              <span className="text-xs font-semibold text-slate-400">/ {totalReferred}</span>
            </h3>
            <p className="text-[11px] font-semibold mt-2 text-sky-600/90 dark:text-sky-400/90 truncate">
              Active Pro &amp; Elite Plans
            </p>
          </motion.div>

          {/* Card 4: Current Affiliate Tier */}
          <motion.div variants={cardItemVariants} className="p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border bg-violet-500/[0.04] dark:bg-violet-500/[0.08] border-violet-500/25">
            <div className="absolute top-4 right-4 text-violet-600/30 group-hover:text-violet-600/60 transition-colors">
              <Trophy size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
              Partner Tier
            </span>
            <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight leading-none truncate">
              {currentTier.name}
            </h3>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-violet-600/90 dark:text-violet-400/90 truncate">
              <span>{currentTier.upfrontBonus} Recurring</span>
              <span className="font-mono text-[10px] opacity-75">{progressToNext}%</span>
            </div>
          </motion.div>

          {/* Card 5: Consistency & Conversion */}
          <motion.div variants={cardItemVariants} className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] border-indigo-500/25">
            <div className="absolute top-4 right-4 text-indigo-600/30 group-hover:text-indigo-600/60 transition-colors">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 truncate">
              Conversion Rate
            </span>
            <h3 className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold text-indigo-600 dark:text-indigo-400 tracking-tight leading-none truncate tabular-nums">
              <AnimatedNumber
                value={totalReferred > 0 ? Math.round((activeBrokers / totalReferred) * 100) : 0}
                duration={750}
                delay={140}
                format={(v) => `${Math.round(v)}%`}
              />
            </h3>
            <p className="text-[11px] font-semibold mt-2 text-indigo-600/90 dark:text-indigo-400/90 truncate">
              Friend Discount: 5% OFF
            </p>
          </motion.div>

        </motion.div>

        {/* ── 3. INVITE WORKSTATION & VIRAL 1-CLICK SHARING ── */}
        <motion.div variants={sectionVariants} className={SURFACE_CARD}>
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Share2 size={15} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Your Unique Referral Workstation
                  </h2>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  Share your personalized link or 8-digit partner code. Any trader signing up is permanently credited to your account.
                </p>
              </div>

              {/* Segmented Control Pill */}
              <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/5 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("link")}
                  className={`h-[28px] px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "link"
                      ? "bg-white dark:bg-[#242428] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  Referral Link
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`h-[28px] px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "code"
                      ? "bg-white dark:bg-[#242428] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
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
                  className="w-full h-11 px-4 rounded-[14px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all select-all shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={() => handleCopy()}
                className={`h-11 px-6 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none shrink-0 shadow-sm active:scale-95 ${
                  copied ? "tactile-emerald-pill text-white" : "tactile-black-pill text-white"
                }`}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                1-Click Instant Share:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tactile-white-pill h-[34px] px-3.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-xs"
                >
                  <MessageCircle size={14} className="text-emerald-500" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join TradiFive Automated Gold AI Trading")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tactile-white-pill h-[34px] px-3.5 rounded-full text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-xs"
                >
                  <Send size={14} className="text-sky-500" />
                  <span>Telegram</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tactile-white-pill h-[34px] px-3.5 rounded-full text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-xs"
                >
                  <span>𝕏 Post</span>
                </a>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="tactile-white-pill h-[34px] px-3.5 rounded-full text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-xs"
                >
                  <Share2 size={13} />
                  <span>More</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="tactile-white-pill h-[34px] px-3.5 rounded-full text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-xs"
                >
                  <QrCode size={13} />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 4. EXPANSIVE 2-COLUMN SECTION: TIERS + TABLE & RIGHT SIDEBAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT 8 COLUMNS: TIERS, HOW IT WORKS & REFERRED TRADERS */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 3 Affiliate Partnership Tiers */}
            <motion.div variants={sectionVariants} className={SURFACE_CARD}>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Trophy size={18} className="text-amber-500" />
                      <span>Affiliate Commission Tiers</span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                      Your commissions automatically elevate as your referred network of traders scales.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-500/20">
                    {activeBrokers} Paid Subscribers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {AFFILIATE_TIERS.map((tier) => {
                    const isCurrent = currentTier.name === tier.name;
                    return (
                      <div
                        key={tier.name}
                        className={`relative p-4 sm:p-5 rounded-[18px] border transition-all space-y-3 flex flex-col justify-between ${
                          isCurrent
                            ? "bg-white dark:bg-[#1A1A1E] border-indigo-500/70 shadow-[0_4px_14px_rgba(99,102,241,0.12)] ring-1 ring-indigo-500/30"
                            : "bg-slate-50/60 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/5 shadow-2xs"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              {tier.tier} · {tier.milestone}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-2xs">
                                Your Tier
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {tier.name}
                          </h4>

                          <div className="pt-1 pb-1">
                            <div className="text-[22px] sm:text-[24px] font-bold text-emerald-600 dark:text-emerald-400">
                              {tier.upfrontBonus}
                              <span className="text-xs font-semibold text-slate-400 ml-1">Recurring / mo</span>
                            </div>
                            <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {tier.profitOverride}
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
            </motion.div>

            {/* Systematic 3-Step Process */}
            <motion.div variants={sectionVariants} className={SURFACE_CARD}>
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    How The Referral Program Works
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                    Automatic subscription tracking with direct UPI / bank payouts every {settlementDay}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className={INNER_CARD}>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center mb-2">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Share Your Link
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Send your partner link or code to fellow traders via WhatsApp, Telegram, or social media.
                    </p>
                  </div>

                  <div className={INNER_CARD}>
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-sm flex items-center justify-center mb-2">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Friend Gets 5% Off
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Your friend signs up and saves 5% on their first TradiFive Pro (₹1,399/mo) or Elite (₹2,799/mo) plan.
                    </p>
                  </div>

                  <div className={INNER_CARD}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center mb-2">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      Recurring Monthly Income
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Earn 10% to 20% recurring commission every month they stay subscribed, paid every {settlementDay}.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Referred Friends Real Table */}
            <motion.div variants={sectionVariants} className={SURFACE_CARD}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Users size={17} className="text-indigo-500" />
                      <span>Your Referred Traders Log</span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                      Live ledger of traders registered under your partner code.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/5">
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
                  <div className="py-10 text-center space-y-3 bg-slate-50/60 dark:bg-white/[0.01] rounded-[18px] border border-dashed border-slate-200 dark:border-white/10">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                      <UserPlus size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No referred traders yet
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                        Share your referral link on WhatsApp or trading groups to earn up to 20% recurring monthly commission.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy()}
                      className="tactile-black-pill h-[36px] px-4 rounded-full text-xs font-bold text-white cursor-pointer select-none active:scale-95 shadow-sm inline-flex items-center gap-1.5"
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
                                <span>{trader.status === "active" ? "Subscribed" : "Free Plan"}</span>
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
            </motion.div>

          </div>

          {/* RIGHT 4 COLUMNS: PAYOUT DESK, MARKETING COPY & FAQ */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
            
            {/* Payout & Withdrawal Action Card */}
            <motion.div variants={sectionVariants} className={SURFACE_CARD}>
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
                  <div className="text-[26px] sm:text-[28px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none tabular-nums">
                    ₹<AnimatedNumber value={earnedCash} duration={800} format={(v) => Math.round(v).toLocaleString()} />
                  </div>
                </div>

                <div className={INNER_CARD + " space-y-2 text-xs"}>
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
                    <strong className="text-slate-900 dark:text-white font-bold">₹500</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestPayout}
                  className="tactile-emerald-pill w-full h-11 rounded-full text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer select-none active:scale-95 shadow-sm"
                >
                  <Landmark size={15} />
                  <span>Request Payout Transfer →</span>
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Direct WhatsApp finance desk confirmation upon submission.
                </p>
              </div>
            </motion.div>

            {/* Why Traders Subscribe */}
            <motion.div variants={sectionVariants} className={SURFACE_CARD}>
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-500" />
                  <span>Why Traders Subscribe</span>
                </h4>

                <div className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <div className={INNER_CARD}>
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">1. 5% Instant Discount:</strong>
                    Friends save 5% immediately on Pro (₹1,399/mo) or Elite (₹2,799/mo) with your link.
                  </div>
                  <div className={INNER_CARD}>
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">2. Complete Discipline Suite:</strong>
                    Includes Risk Guard drawdown shields, Smart Trade Journal, and 24/7 AI Coach.
                  </div>
                  <div className={INNER_CARD}>
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">3. True Recurring Income:</strong>
                    Every monthly renewal adds 10%–20% straight to your commission wallet automatically.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Partner Program FAQ */}
            <motion.div variants={sectionVariants} className={SURFACE_CARD}>
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
                    No limit! Refer unlimited traders and unlock 20% recurring monthly commission forever.
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block font-bold mb-0.5">How do I track referred friends?</strong>
                    Your dashboard log updates in real-time as friends register and link MT5.
                  </div>
                </div>
              </div>
            </motion.div>

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
                className="w-full max-w-sm rounded-[20px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-2xl p-6 space-y-5 relative text-center"
              >
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="space-y-1 pt-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
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
                    className="tactile-black-pill w-full h-10 rounded-full text-xs font-bold text-white cursor-pointer select-none active:scale-95 transition-all shadow-sm"
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
                className="w-full max-w-md rounded-[20px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-2xl p-6 space-y-5 relative"
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
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Withdraw Referral Commissions
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Direct clearance processed to your verified Indian UPI ID or Bank account.
                  </p>
                </div>

                <div className="p-3.5 rounded-[16px] bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Withdrawable Balance:</span>
                  <span className="text-xl font-bold text-emerald-600">
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
                    className="tactile-white-pill flex-1 h-11 rounded-full text-xs font-bold text-slate-700 dark:text-neutral-200 cursor-pointer select-none active:scale-95 shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayout}
                    disabled={isSubmittingPayout}
                    className="tactile-emerald-pill flex-1 h-11 rounded-full text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                  >
                    <MessageCircle size={14} />
                    <span>Confirm via WhatsApp →</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  );
}
