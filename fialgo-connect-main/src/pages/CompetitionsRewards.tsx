import React, { useState, useEffect } from "react";
import {
  Activity as IconlyActivity,
  Star as IconlyStar,
  ShieldDone as IconlyShieldDone
} from "react-iconly";

import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Gift, Star, Trophy, Zap, Crown, Shield, Target, TrendingUp,
  CheckCircle, Lock, Sparkles, Award, Medal, Flame, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  getGamificationState, 
  syncGamificationWithSupabase, 
  unlockBenefit 
} from "@/utils/gamification";
import { useCompetitionsData } from "@/hooks/useCompetitionsData";


const WrappedTrophy = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Trophy size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedTarget = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Target size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedFlame = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Flame size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedCrown = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Crown size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedZap = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Zap size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedAward = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Award size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedMedal = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Medal size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedLock = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Lock size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedGift = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Gift size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};
export default function CompetitionsRewards() {
  const [gamState, setGamState] = useState(getGamificationState());
  const { redeemXPReward } = useCompetitionsData();
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [xpStats, setXpStats] = useState({ week: 0, month: 0 });

  useEffect(() => {
    syncGamificationWithSupabase().then(() => {
      setGamState(getGamificationState());
    });

    const handleUpdate = () => {
      setGamState(getGamificationState());
    };
    window.addEventListener("tradifive_xp_update", handleUpdate);
    return () => window.removeEventListener("tradifive_xp_update", handleUpdate);
  }, []);

  useEffect(() => {
    async function fetchXPStats() {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const now = new Date();
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay() || 7; 
      startOfWeek.setDate(now.getDate() - day + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data } = await supabase
        .from('user_xp_ledger')
        .select('xp_amount, created_at')
        .eq('user_id', session.user.id)
        .gt('xp_amount', 0)
        .gte('created_at', startOfMonth.toISOString());
        
      if (data) {
        let weekXP = 0;
        let monthXP = 0;
        data.forEach(entry => {
          monthXP += entry.xp_amount;
          if (new Date(entry.created_at) >= startOfWeek) {
            weekXP += entry.xp_amount;
          }
        });
        setXpStats({ week: weekXP, month: monthXP });
      }
    }
    fetchXPStats();
  }, [gamState.xp]);

  const allTimeXP = gamState.xp;
  const bountyBalance = gamState.bounty_balance;

  const xpMilestones = [
    { xp: 500,  label: "Rookie",       reward: "₹5 Fee Rebate",       icon: Shield,   color: "text-slate-500",  bg: "bg-slate-50 dark:bg-slate-900/20",   border: "border-slate-200 dark:border-slate-800",   unlocked: allTimeXP >= 500  },
    { xp: 1000, label: "Competitor",   reward: "₹10 Fee Rebate",      icon: Target,   color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950/20",border: "border-emerald-200 dark:border-emerald-900",unlocked: allTimeXP >= 1000  },
    { xp: 2500, label: "Challenger",   reward: "Free Month Pro",      icon: Zap,      color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/20",      border: "border-blue-200 dark:border-blue-900",     unlocked: allTimeXP >= 2500 },
    { xp: 5000, label: "Elite Trader", reward: "₹50 Cash Prize",      icon: Trophy,   color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/20",    border: "border-amber-200 dark:border-amber-900",   unlocked: allTimeXP >= 5000 },
    { xp: 10000,label: "Legend",       reward: "₹200 + VIP Badge",    icon: Crown,    color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/20",  border: "border-indigo-200 dark:border-indigo-900", unlocked: allTimeXP >= 10000 },
  ];

  const nextMilestone = xpMilestones.find(m => allTimeXP < m.xp) || xpMilestones[xpMilestones.length - 1];
  const progressPct = Math.min(100, (allTimeXP / nextMilestone.xp) * 100);

  const redeemableRewards = [
    { id: 1, title: "Fee Rebate",        desc: "Redeem 500 XP for a ₹5 trading fee rebate on your next challenge.", cost: 500,  icon: TrendingUp, available: !gamState.unlocked_items.includes(1)  },
    { id: 2, title: "Pro Plan — 1 Month",desc: "Unlock one month of Pro features including AI Coach and advanced analytics.", cost: 2000, icon: Sparkles,  available: !gamState.unlocked_items.includes(2)  },
    { id: 3, title: "Exclusive Badge",   desc: "A rare profile badge displayed on your public leaderboard profile.", cost: 1000, icon: Medal,     available: !gamState.unlocked_items.includes(3)  },
    { id: 4, title: "Cash Payout",       desc: "Withdraw ₹50 directly to your wallet. Requires verified account.", cost: 5000, icon: Gift,      available: false },
  ];

  const badges = [
    { label: "First Win",       icon: Trophy, earned: gamState.level >= 2,   color: "text-amber-500",  glow: "shadow-amber-500/20"  },
    { label: "7-Day Streak",    icon: Flame,  earned: gamState.streak >= 7,  color: "text-orange-500", glow: "shadow-orange-500/20" },
    { label: "Risk Tamer",      icon: Shield, earned: gamState.level >= 8,   color: "text-indigo-500", glow: "shadow-indigo-500/20" },
    { label: "Podium Finisher", icon: Award,  earned: gamState.level >= 12,  color: "text-purple-500",  glow: "shadow-purple-500/20" },
    { label: "Century Trader",  icon: Target, earned: gamState.level >= 18,  color: "text-emerald-500",  glow: "shadow-emerald-500/20" },
    { label: "Legend Status",   icon: Crown,  earned: gamState.level >= 25,  color: "text-indigo-600",  glow: "shadow-indigo-500/20" },
  ];

  const handleRedeem = async (id: number, cost: number, title: string) => {
    if (bountyBalance < cost) {
      toast.error("Not enough XP", { description: `You need ${cost - bountyBalance} more XP to redeem this reward.` });
      return;
    }
    setRedeeming(id);
    const ok = unlockBenefit(id, cost);
    if (ok) {
      await redeemXPReward(String(id), cost, title);
    }
    setRedeeming(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full font-sans pb-32 space-y-10 select-none">

        {/* HEADER */}
        <div>
          <h1 className="text-[25px] font-semibold text-slate-800 dark:text-white tracking-tight leading-none">Rewards</h1>
          <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-2 font-medium">Earn XP through competitions and trade activity. Redeem for cash, perks, and exclusive badges.</p>
        </div>

        {/* XP OVERVIEW CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Your XP Balance</span>
              <div className="flex items-end gap-3">
                <span className="text-[42px] font-bold text-slate-800 dark:text-white leading-none tabular-nums">{bountyBalance.toLocaleString()}</span>
                <span className="text-[14px] font-semibold text-slate-400 mb-1.5">XP</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Next Milestone: {nextMilestone.label}</span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">{allTimeXP.toLocaleString()} / {nextMilestone.xp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-indigo-600 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-stripe_2s_linear_infinite]" />
                  </motion.div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{(Math.max(0, nextMilestone.xp - allTimeXP)).toLocaleString()} XP needed to unlock <span className="font-bold text-slate-600 dark:text-slate-300">{nextMilestone.reward}</span></p>
              </div>
            </div>

            {/* XP stat pills */}
            <div className="flex sm:flex-col gap-3 sm:gap-2 shrink-0">
              {[
                { label: "This Week", value: `+${xpStats.week.toLocaleString()} XP`, color: "text-emerald-600" },
                { label: "This Month", value: `+${xpStats.month.toLocaleString()} XP`, color: "text-indigo-600" },
                { label: "All Time",  value: `${allTimeXP.toLocaleString()} XP`, color: "text-slate-800 dark:text-white" },
              ].map((s) => (
                <div key={s.label} className="px-4 py-2.5 rounded-[16px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),0_0_0_2px_#E7E7E7]  text-right min-w-[120px]">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-[15px] font-bold ${s.color} tabular-nums mt-0.5`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* XP MILESTONES */}
        <div className="space-y-4">
          <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">XP Milestones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {xpMilestones.map((m, i) => {
              const Icon = m.icon;
              const isNext = !m.unlocked && (i === 0 || xpMilestones[i - 1].unlocked);
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  className={`p-4 rounded-[20px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),0_0_0_2px_#E2E8F0] dark:border-white/5 dark:shadow-none flex flex-col items-center text-center gap-2 relative overflow-hidden transition-all ${m.unlocked ? m.bg : 'bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E]'}`}
                >
                  {isNext && <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-full">Next</span>}
                  {(() => {
                    const iconColor = m.unlocked ? `${m.color} shrink-0 mt-0.5` : 'text-slate-350 dark:text-slate-400 shrink-0 mt-0.5';
                    if (!m.unlocked) {
                      return <WrappedLock set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />;
                    }
                    return (
                      <>
                        {m.label === "Rookie" && <IconlyStar set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Competitor" && <WrappedTarget set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Challenger" && <WrappedZap set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Elite Trader" && <WrappedTrophy set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Legend" && <WrappedCrown set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                      </>
                    );
                  })()}
                  <div>
                    <p className={`text-[12px] font-bold ${m.unlocked ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{m.label}</p>
                    <p className="text-[9.5px] font-semibold text-slate-400 tabular-nums mt-0.5">{m.xp.toLocaleString()} XP</p>
                  </div>
                  <div className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold ${m.unlocked ? m.color + ' ' + m.bg : 'text-slate-400 bg-slate-50 dark:bg-[#1E1E1E]'}`}>
                    {m.reward}
                  </div>
                  {m.unlocked && <CheckCircle size={12} className="text-emerald-500 absolute bottom-2 right-2" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* REDEEMABLE REWARDS */}
        <div className="space-y-4">
          <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Redeem Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {redeemableRewards.map((r, i) => {
              const Icon = r.icon;
              const canAfford = bountyBalance >= r.cost;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}
                  className="p-5 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none transition-all flex items-start gap-4"
                >
                  {(() => {
                    const iconColor = canAfford ? 'text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5' : 'text-slate-455 dark:text-slate-400 shrink-0 mt-0.5';
                    return (
                      <>
                        {r.id === 1 && <IconlyActivity set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {r.id === 2 && <IconlyStar set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {r.id === 3 && <WrappedMedal set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {r.id === 4 && <WrappedGift set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                      </>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">{r.title}</h3>
                        <p className="text-[10.5px] text-slate-400 font-medium mt-1 leading-relaxed">{r.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-lg ${canAfford ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' : 'text-slate-400 bg-slate-100 dark:bg-[#1E1E1E]'}`}>
                          {r.cost.toLocaleString()} XP
                        </span>
                        <button
                          onClick={() => handleRedeem(r.id, r.cost, r.title)}
                          disabled={!r.available || redeeming === r.id}
                          className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                            !r.available
                              ? 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-400 cursor-not-allowed'
                              : canAfford
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
                                : 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {redeeming === r.id ? (
                            <span className="animate-pulse">Processing...</span>
                          ) : !r.available ? (
                            <><Lock size={10} /> Locked</>
                          ) : (
                            <>Redeem <ChevronRight size={12} /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* BADGES */}
        <div className="space-y-4">
          <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Achievement Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.04 * i }}
                  className={`p-4 rounded-[20px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),0_0_0_2px_#E2E8F0] dark:border-white/5 dark:shadow-none flex flex-col items-center gap-2.5 text-center transition-all ${b.earned ? 'bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E]' : 'bg-gradient-to-b from-[#F4F4F4] to-[#FAFAFA] dark:bg-none dark:bg-[#1E1E1E] opacity-50'}`}
                >
                  {(() => {
                    const iconColor = b.earned ? `${b.color} shrink-0 mt-0.5` : 'text-slate-350 dark:text-slate-400 shrink-0 mt-0.5';
                    return (
                      <>
                        {b.label === "First Win" && <WrappedTrophy set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "7-Day Streak" && <WrappedFlame set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Risk Tamer" && <IconlyShieldDone set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Podium Finisher" && <WrappedAward set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Century Trader" && <WrappedTarget set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Legend Status" && <WrappedCrown set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                      </>
                    );
                  })()}
                  <p className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{b.label}</p>
                  {b.earned
                    ? <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">Earned</span>
                    : <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-[#1E1E1E] px-2 py-0.5 rounded-full">Locked</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
