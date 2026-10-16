import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Copy, CheckCircle, Users, Trophy, Share2, Award, Zap, Crown,
  ArrowRight, Sparkles, Star, TrendingUp, Link as LinkIcon, Send,
  ChevronRight, UserPlus, CircleDollarSign, Flame, Medal
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { addXP } from "@/utils/gamification";

// ─── Tier config ────────────────────────────────────────────────────────────
const TIERS = [
  {
    label: "Starter",
    milestone: 1,
    xp: 500,
    reward: "500 XP Boost",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
    description: "Both you and your friend get an instant XP boost the moment they sign up.",
  },
  {
    label: "Pro Unlock",
    milestone: 3,
    xp: 500,
    reward: "15 Days Pro Free",
    icon: Crown,
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-500",
    description: "When 3 of your referred traders buy a Pro subscription, you unlock 15 days of TradiFive Pro for free and a 500 XP boost.",
  },
  {
    label: "Elite",
    milestone: 5,
    xp: 1000,
    reward: "1 Month Elite Free",
    icon: Trophy,
    color: "from-amber-400 to-yellow-500",
    glow: "shadow-amber-500/20",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
    description: "When 5 of your referred traders buy an Elite subscription, you unlock a full month of TradiFive Elite for free and a 1,000 XP boost.",
  },
];

// --- Standardized Perfect Metric Card ---
function PerfectRewardMetric({ label, value, icon: Icon, color, subValue, progress }: any) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] px-6 py-5 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm space-y-3 hover:-translate-y-0.5 transition-all duration-300 select-none">
        <div className="flex items-center justify-between mb-4">
           <p className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{label}</p>
           <div className={`p-2 rounded-xl ${color}`}>
             <Icon size={14} />
           </div>
        </div>
       <div className="space-y-3">
          <div className="flex items-end justify-between gap-2">
              <div className="space-y-1">
                  <div className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none font-sans">{value}</div>
                  {subValue && <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight leading-none pt-1">{subValue}</div>}
              </div>
          </div>
          {progress !== undefined && (
            <div className="h-1.5 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
               <div className="h-full bg-[#3b82f6] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          )}
       </div>
    </div>
  );
}

// ─── Floating orb ───────────────────────────────────────────────────────────
function FloatingOrb({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none opacity-30 ${className}`}
    />
  );
}

// ─── Tier Card ───────────────────────────────────────────────────────────────
function TierCard({ tier, referred, index }: { tier: typeof TIERS[0]; referred: number; index: number }) {
  const Icon = tier.icon;
  const achieved = referred >= tier.milestone;
  const progress = Math.min(1, referred / tier.milestone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative rounded-[32px] border flex flex-col gap-4 overflow-hidden transition-all duration-300 p-6 bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-white/5 shadow-sm"
    >

      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl ${tier.bg} border ${tier.border} flex items-center justify-center`}>
          <Icon size={20} className={tier.text} />
        </div>
        {achieved ? (
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${tier.bg} ${tier.text} border ${tier.border}`}>
            <CheckCircle size={10} /> Achieved
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400">
            {tier.milestone} friends
          </span>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1">{tier.label}</p>
        <h3 className={`text-[18px] font-bold ${achieved ? tier.text : "text-slate-900 dark:text-white"} leading-tight`}>
          {tier.reward}
        </h3>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{tier.description}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${tier.color} rounded-full`}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-400">
          <span>{Math.min(referred, tier.milestone)} / {tier.milestone}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step card ───────────────────────────────────────────────────────────────
function Step({ num, title, desc, color }: { num: number; title: string; desc: string; color: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center font-black text-[18px]`}>
        {num}
      </div>
      <div>
        <h4 className="font-bold text-[14px] text-slate-900 dark:text-white mb-1">{title}</h4>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[180px] mx-auto">{desc}</p>
      </div>
    </div>
  );
}

// ─── Referred friend row ─────────────────────────────────────────────────────
function FriendRow({ name, initials, status, xpEarned, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-[13px] shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">{name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-400">{status}</p>
      </div>
      <span className="text-[11px] font-bold text-emerald-500">+{xpEarned} XP</span>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Referrals() {
  const [username, setUsername] = useState<string>("trader");
  const [copied, setCopied] = useState(false);
  const [proClaimed, setProClaimed] = useState(false);
  const [eliteClaimed, setEliteClaimed] = useState(false);
  const [stats, setStats] = useState({ totalReferred: 0, rewardsEarned: 0 });
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"link" | "code">("link");
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch actual referral_code from profiles
          const { data: profileFull } = await supabase
            .from("profiles")
            .select("username, referral_code")
            .eq("id", user.id)
            .single();
          
          const uname = profileFull?.username || user.id.substring(0, 8);
          setUsername(uname);
          
          // Build referral code and link from DB referral_code
          const dbCode = profileFull?.referral_code || `TF-${uname.toUpperCase().slice(0, 6)}`;
          setReferralCode(dbCode);
          setReferralLink(`${window.location.origin}/login?ref=${dbCode}`);

          const { data: refsData } = await supabase
            .from("referrals")
            .select("*, profiles!referrals_referred_id_fkey(display_name, username, created_at, account_type)")
            .eq("referrer_id", user.id);
            
          if (refsData && refsData.length > 0) {
            let totalXP = 0;
            let totalProElite = 0;
            let totalElite = 0;
            const friendsList = refsData.map((r: any) => {
              const xp = r.referrer_xp || r.xp_rewarded || 500;
              totalXP += xp;
              const profile = r.profiles || {};
              const name = profile.display_name || profile.username || "Unknown Trader";
              const initials = name.substring(0, 2).toUpperCase();
              const accountType = profile.account_type || 'starter';
              
              if (accountType === 'pro' || accountType === 'elite' || accountType === 'creator') {
                totalProElite++;
              }
              if (accountType === 'elite' || accountType === 'creator') {
                totalElite++;
              }
              
              const dateStr = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently';
              let statusStr = `Signed up - ${dateStr}`;
              if (accountType === 'pro') statusStr = `Pro Plan Active - ${dateStr}`;
              if (accountType === 'elite' || accountType === 'creator') statusStr = `Elite Plan Active - ${dateStr}`;
              
              return {
                name,
                initials,
                status: statusStr,
                xpEarned: xp,
                accountType
              };
            });
            setFriends(friendsList);
            setStats({ totalReferred: refsData.length, rewardsEarned: totalXP, proCount: totalProElite, eliteCount: totalElite } as any);
          } else {
            setFriends([]);
            setStats({ totalReferred: 0, rewardsEarned: 0 });
          }
        }
      } catch (e) {
        console.error("Error fetching user profile:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);


  const displayValue = activeTab === "link" ? referralLink : referralCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    toast.success(activeTab === "link" ? "Referral link copied!" : "Referral code copied!", {
      description: "Share it with your fellow traders to earn rewards together."
    });
    // Note: XP is awarded when friend connects their broker (not just for copying link)
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on TradiFive",
          text: "I'm trading smarter with AI risk management on TradiFive. Use my referral to get started and we both earn rewards!",
          url: referralLink,
        });
        addXP(10, "Shared referral link", "Social Bonus");
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  const handleClaimPro = () => {
    if (stats.totalReferred >= 3 && !proClaimed) {
      setProClaimed(true);
      addXP(500, "Unlocked 15 Days Pro via Referrals!");
      toast.success("🎉 15 Days Pro Unlocked!", {
        description: "Your account has been upgraded. Enjoy all premium features!",
        duration: 6000,
      });
      localStorage.setItem("tradifive_cached_plan", "pro");
      window.dispatchEvent(new Event("tradifive_profile_update"));
    }
  };

  const handleClaimElite = () => {
    if (stats.totalReferred >= 5 && !eliteClaimed) {
      setEliteClaimed(true);
      addXP(1000, "Unlocked 1 Month Elite via Referrals!");
      toast.success("🏆 1 Month Elite Unlocked!", {
        description: "Welcome to Elite! You now have maximum protocol access.",
        duration: 6000,
      });
      localStorage.setItem("tradifive_cached_plan", "elite");
      window.dispatchEvent(new Event("tradifive_profile_update"));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1500px] mx-auto px-4 pb-32 space-y-8 font-sans select-none">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
         <div className="flex flex-col mt-2 mb-10 select-none">
            <h1 className="text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none font-sans">Referrals</h1>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl">Invite traders. Stack rewards together. Hit the milestones and unlock Pro access and exclusive elite badges.</p>
         </div>

        {/* ── METRICS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none mb-8">
           <PerfectRewardMetric 
              label="XP per Referral" value="500" icon={Zap} 
              color="bg-blue-500/10 text-blue-500"
              subValue="Instant boost when they connect"
           />
           <PerfectRewardMetric 
              label="Friends Referred" value={loading ? "—" : String(stats.totalReferred)} icon={Users} 
              color="bg-violet-500/10 text-violet-500"
              subValue={`${Math.max(0, 3 - stats.totalReferred)} more for Pro Unlock`}
              progress={Math.min(100, (stats.totalReferred / 3) * 100)}
           />
           <PerfectRewardMetric 
              label="Total XP Earned" value={loading ? "—" : `${stats.rewardsEarned.toLocaleString()}`} icon={Star} 
              color="bg-amber-500/10 text-amber-500"
              subValue="From referral bonuses"
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Share box */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8 space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Your Invite</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Share your link or code — both work</p>
                  </div>
                </div>
                {/* Tab toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                  {(["link", "code"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                        activeTab === t
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input row */}
              <div className="flex gap-2.5">
                <div className="flex-1 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {activeTab === "link" ? <LinkIcon size={14} /> : <Sparkles size={14} />}
                  </div>
                  <input
                    ref={inputRef}
                    readOnly
                    value={loading ? "Generating…" : displayValue}
                    onClick={() => inputRef.current?.select()}
                    className="w-full h-[48px] bg-slate-50 dark:bg-[#0C0E14] border border-slate-200 dark:border-[#1E2130] rounded-2xl pl-10 pr-4 text-[13px] font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all cursor-text"
                  />
                </div>
                <button
                  onClick={handleCopy}
                  disabled={loading}
                  className={`shrink-0 h-[48px] px-5 rounded-2xl text-[13px] font-bold flex items-center gap-2 transition-all active:scale-95 ${
                    copied
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-sm"
                  }`}
                >
                  {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleShare}
                  className="shrink-0 h-[48px] w-[48px] rounded-2xl bg-violet-500 text-white hover:bg-violet-600 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-violet-500/20"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Share to socials */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Share to:</span>
                {[
                  { label: "Twitter / X", bg: "bg-black text-white", onClick: () => window.open(`https://twitter.com/intent/tweet?text=Join+me+on+TradiFive+%F0%9F%92%B9+${encodeURIComponent(referralLink)}`) },
                  { label: "WhatsApp", bg: "bg-emerald-500 text-white", onClick: () => window.open(`https://wa.me/?text=Join+me+on+TradiFive+${encodeURIComponent(referralLink)}`) },
                  { label: "Telegram", bg: "bg-blue-500 text-white", onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join+me+on+TradiFive`) },
                ].map(s => (
                  <button
                    key={s.label}
                    onClick={s.onClick}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${s.bg} hover:opacity-80 transition-opacity`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Claim Pro banner (when eligible) */}
            <AnimatePresence>
              {stats.totalReferred >= 3 && !proClaimed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-[32px] overflow-hidden bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm p-8"
                >
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                        <Crown size={24} />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-[16px] tracking-tight">You've unlocked 15 Days Pro! 🎉</p>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[13px] mt-0.5">3 friends joined — claim your free 15 days now.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClaimPro}
                      className="shrink-0 px-6 py-3 rounded-2xl bg-violet-500 text-white hover:bg-violet-600 shadow-md font-bold text-[14px] transition-all active:scale-95 whitespace-nowrap"
                    >
                      Claim Pro
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Claim Elite banner (when eligible) */}
            <AnimatePresence>
              {stats.totalReferred >= 5 && !eliteClaimed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-[32px] overflow-hidden bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm p-8 mt-4"
                >
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-[16px] tracking-tight">You've unlocked 1 Month Elite! 🏆</p>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[13px] mt-0.5">5 friends joined — claim your free month of Elite now.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClaimElite}
                      className="shrink-0 px-6 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 shadow-md font-bold text-[14px] transition-all active:scale-95 whitespace-nowrap"
                    >
                      Claim Elite
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tier milestones */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Reward Tiers</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Unlock bigger rewards as you refer more traders</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider">{stats.totalReferred} referred</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TIERS.map((tier, i) => {
                    let refCount = stats.totalReferred;
                    if (i === 1) refCount = (stats as any).proCount || 0;
                    if (i === 2) refCount = (stats as any).eliteCount || 0;
                    return <TierCard key={tier.label} tier={tier} referred={refCount} index={i} />;
                  })}
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8"
            >
              <div className="flex items-center justify-center mb-6">
                  <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none text-center">How it works</h2>
              </div>
              <div className="relative grid grid-cols-3 gap-6">
                {/* Connector lines */}
                <div className="hidden sm:block absolute top-6 left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-px border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                <Step
                  num={1} title="Share Your Link"
                  desc="Copy your unique referral link and send it to traders you know."
                  color="bg-blue-500/10 text-blue-500"
                />
                <Step
                  num={2} title="They Sign Up"
                  desc="Your friend creates an account and connects their broker."
                  color="bg-violet-500/10 text-violet-500"
                />
                <Step
                  num={3} title="Both Get Rewarded"
                  desc="You both earn 500 XP instantly and climb toward bigger milestones."
                  color="bg-amber-500/10 text-amber-500"
                />
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Reward breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Gift size={18} />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">What you both earn</h3>
              </div>

              {[
                { role: "You (referrer)", xp: "500 XP", extra: "+ tier rewards", icon: Medal, color: "text-violet-500 bg-violet-500/10" },
                { role: "Your friend", xp: "500 XP", extra: "Welcome bonus", icon: UserPlus, color: "text-blue-500 bg-blue-500/10" },
              ].map(r => (
                <div key={r.role} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0C0E14] border border-slate-100 dark:border-[#1E2130]">
                  <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center shrink-0`}>
                    <r.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{r.role}</p>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">{r.xp}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">{r.extra}</span>
                </div>
              ))}

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5 border border-amber-200 dark:border-amber-500/20">
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Bonus condition</p>
                <p className="text-[12px] text-amber-700 dark:text-amber-300/80 leading-relaxed">
                  Your friend must connect a live broker account for both of you to receive the full XP reward.
                </p>
              </div>
            </motion.div>

            {/* Referred friends list */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Users size={18} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Referred Friends</h3>
                </div>
                <span className="text-[10px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">{stats.totalReferred} total</span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="py-8 text-center">
                  <Users size={28} className="mx-auto text-slate-300 dark:text-slate-400 mb-3" />
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No referrals yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Share your link to get started</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {friends.map((f, i) => (
                    <FriendRow key={i} {...f} delay={0.1 * i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/40 backdrop-blur-md border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),_0_0_0_2px_#E7E7E7] rounded-[32px] p-8 dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none"
            >
              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-2.5">
                  <Flame size={18} className="text-orange-500" />
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Your Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Friends", value: stats.totalReferred, icon: Users, color: "text-blue-500 bg-blue-500/10" },
                    { label: "XP Earned", value: stats.rewardsEarned.toLocaleString(), icon: Zap, color: "text-amber-500 bg-amber-500/10" },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-[#0C0E14] rounded-[20px] p-4 border border-slate-100 dark:border-[#1E2130]">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                         <s.icon size={14} />
                      </div>
                      <p className="text-[24px] font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mt-1.5 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-[#0C0E14] p-3 rounded-xl border border-slate-100 dark:border-[#1E2130]">
                  Refer 2 more traders to reach Pro status and unlock the elite badge milestone.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
