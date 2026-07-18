import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Lock, 
  Gift, 
  CircleDollarSign,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  Flame,
  Calendar,
  Share2,
  Copy,
  MessageSquare,
  BookOpen,
  Heart,
  Users,
  Link as LinkIcon,
  UserPlus,
  BrainCircuit,
  ShieldAlert,
  Medal
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { PushableButton } from "@/components/PushableButton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { 
  getGamificationState, 
  addXP, 
  unlockBenefit, 
  completeMission, 
  GamificationState,
  syncGamificationWithSupabase
} from "@/utils/gamification";

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

// --- 7-Day Consistency Streak Check-in Widget ---
function ConsistencyCheckin({ gamState, onClaimed }: { gamState: GamificationState; onClaimed: () => void }) {
  const [claimDay, setClaimDay] = useState(() => {
    return Number(localStorage.getItem("tradifive_consistency_day") || "1");
  });
  
  const [lastClaimDate, setLastClaimDate] = useState(() => {
    return localStorage.getItem("tradifive_last_checkin_date") || "";
  });

  const todayStr = new Date().toLocaleDateString("en-US");
  const isClaimedToday = lastClaimDate === todayStr;

  const weeklyStreakRewards = [
    { day: 1, xp: 20 },
    { day: 2, xp: 20 },
    { day: 3, xp: 30 },
    { day: 4, xp: 30 },
    { day: 5, xp: 50 },
    { day: 6, xp: 50 },
    { day: 7, xp: 150, bonus: true },
  ];

  const handleCheckin = () => {
    if (isClaimedToday) {
      toast.info("You have already checked-in today! Return tomorrow.");
      return;
    }

    const currentReward = weeklyStreakRewards[claimDay - 1];
    
    // Add XP
    addXP(currentReward.xp, `Day ${claimDay} Consistency Check-In`, "Daily Bonus");
    
    // Save claim date
    localStorage.setItem("tradifive_last_checkin_date", todayStr);
    setLastClaimDate(todayStr);

    // Advance check-in day
    let nextDay = claimDay + 1;
    if (nextDay > 7) nextDay = 1;
    localStorage.setItem("tradifive_consistency_day", String(nextDay));
    setClaimDay(nextDay);

    if (currentReward.bonus) {
      toast.success("🎁 Week 1 Gold Mystery Chest Unlocked!", {
        description: "You earned +150 XP and an exclusive chest custom border."
      });
    }

    onClaimed();
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8 space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
            <Flame size={18} className="fill-orange-500/10" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Login Consistency Check-In</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Maintain streak for large Day 7 Gold Chest multipliers.</p>
          </div>
        </div>
        <span className="text-[10px] font-black bg-orange-500/15 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full uppercase tracking-wider">
          🔥 Week 1
        </span>
      </div>

      {/* 7 Day Blocks Row */}
      <div className="grid grid-cols-7 gap-3">
        {weeklyStreakRewards.map((item) => {
          const isCompleted = item.day < claimDay;
          const isCurrent = item.day === claimDay && !isClaimedToday;
          const isClaimedCurrent = item.day === claimDay && isClaimedToday;
          
          return (
            <div 
              key={item.day}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center min-h-[90px] transition-all duration-300 ${
                isCompleted 
                  ? "bg-slate-50/50 dark:bg-slate-900/20 border-transparent opacity-65 text-slate-400 dark:text-slate-400" 
                  : isClaimedCurrent 
                    ? "bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/30 text-emerald-600"
                    : isCurrent 
                      ? "bg-blue-500/5 dark:bg-blue-500/5 border-blue-500/60 ring-2 ring-blue-500/10 text-blue-500 shadow-sm"
                      : "bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200"
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider block">Day {item.day}</span>
              
              <div className="my-1.5 flex items-center justify-center">
                {isCompleted ? (
                  <Check size={16} className="text-slate-455" />
                ) : isClaimedCurrent ? (
                  <Check size={16} className="text-emerald-500" />
                ) : item.bonus ? (
                  <Crown size={16} className="text-amber-500 fill-amber-500/10 animate-bounce mt-1" />
                ) : (
                  <CircleDollarSign size={14} className="text-blue-500" />
                )}
              </div>

              <span className="text-[9.5px] font-black leading-none block">
                {item.bonus ? "+150" : `+${item.xp}`} XP
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          {isClaimedToday ? "Streak saved. Next check-in opens tomorrow." : "Claim your daily login reward to extend active streak."}
        </div>
        
        <button
          onClick={handleCheckin}
          disabled={isClaimedToday}
          className={`px-6 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 border-2 active:scale-95 ${
            isClaimedToday
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border-transparent cursor-not-allowed"
              : "bg-gradient-to-b from-[#60A5FA] to-[#3B82F6] dark:bg-none dark:bg-[#1E1E1E] text-white border-[#93C5FD] dark:border-[#3B82F6] shadow-[0_4px_7px_-5px_rgba(59,130,246,0.2),_0_0_0_2px_#3B82F6]"
          }`}
        >
          {isClaimedToday ? "Checked-In Today" : "Claim Daily Check-In"}
        </button>
      </div>
    </div>
  );
}

// --- Refer & Earn Console ---
function ReferAndEarn() {
  const [referralCode, setReferralCode] = useState("TF-XXXXXX-XP");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Generate unique referral code from user ID prefix
        const uid = session.user.id.replace(/-/g, '').toUpperCase().slice(0, 6);
        setReferralCode(`TF-${uid}-XP`);
      }
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!", {
      description: "Share this code with other traders to claim +500 XP when they connect their account."
    });
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8 space-y-6 select-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
          <Share2 size={18} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Refer & Earn</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Invite fellow traders. Earn mutual rewards upon MetaTrader verification.</p>
        </div>
      </div>

      <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Your Referral Code</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white block select-text font-mono tracking-tight">{referralCode}</span>
        </div>

        <button 
          onClick={handleCopy}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] text-[11px] font-extrabold uppercase tracking-wider transition-all border-2 border-white dark:border-[#222B3F] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none active:scale-95 shrink-0"
        >
          <Copy size={13} /> Copy Code
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-bold pt-1 select-none">
        <div className="p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-2.5">
          <CircleDollarSign size={15} className="text-emerald-500" />
          <div>
            <span className="text-slate-455 dark:text-slate-400 text-[9px] uppercase tracking-wider block">Your Reward</span>
            <span className="text-emerald-500 font-extrabold">+500 Coins / XP</span>
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-2.5">
          <CircleDollarSign size={15} className="text-emerald-500" />
          <div>
            <span className="text-slate-455 dark:text-slate-400 text-[9px] uppercase tracking-wider block">Friend's Reward</span>
            <span className="text-emerald-500 font-extrabold">+500 Coins / XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Daily Directives List ---
function DailyDirectives({ gamState, onComplete }: { gamState: GamificationState; onComplete: (id: number, reward: number, text: string) => void }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`Resets in ${diffHrs}h ${diffMins}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  const directives = [
    { id: 1, text: "Execute 3 or fewer trades", reward: 50 },
    { id: 2, text: "Hit Daily Profit Target", reward: 100 },
    { id: 3, text: "Zero Risk Violations", reward: 250 },
  ];

  const handleTaskClick = (id: number, reward: number, text: string) => {
    const isCompleted = gamState.completed_missions.includes(id);
    if (isCompleted) {
      toast.info("This directive is already completed for today!");
      return;
    }
    onComplete(id, reward, text);
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Target size={18} />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Daily Directives</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">{timeLeft}</span>
      </div>
      <div className="space-y-3">
        {directives.map(task => {
          const isCompleted = gamState.completed_missions.includes(task.id);
          return (
            <div 
              key={task.id} 
              onClick={() => handleTaskClick(task.id, task.reward, task.text)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none active:scale-99 ${
                isCompleted 
                  ? "bg-slate-50/40 dark:bg-slate-900/20 border-transparent opacity-60" 
                  : "bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:-translate-y-0.5 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted ? "bg-blue-600 border-blue-600" : "border-slate-200 dark:border-slate-700"
                }`}>
                  {isCompleted && <Check size={12} className="text-white" />}
                </div>
                <span className={`text-[13px] font-semibold transition-all ${
                  isCompleted ? "line-through text-slate-400 dark:text-slate-400" : "text-slate-700 dark:text-slate-200"
                }`}>
                  {task.text}
                </span>
              </div>
              <span className={`text-[11px] font-black px-3.5 py-1 rounded-full ${
                isCompleted ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
              }`}>
                +{task.reward} XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// --- XP Earn Map - Trading-Only XP opportunities ---
function XPEarnMap() {
  const earns = [
    { icon: TrendingUp, label: "Profitable Disciplined Trade", xp: "25–100", cat: "Trading",    color: "bg-emerald-500/10 text-emerald-600" },
    { icon: Calendar,   label: "Daily Check-In",               xp: "20–150", cat: "Streak",     color: "bg-orange-500/10 text-orange-500" },
    { icon: Target,     label: "Daily Directives",             xp: "50–250", cat: "Missions",   color: "bg-blue-500/10 text-blue-500" },
    { icon: ShieldAlert, label: "Zero Risk Violations",        xp: "100",    cat: "Discipline", color: "bg-amber-500/10 text-amber-500" },
    { icon: Star,       label: "Weekly Consistency Bonus",     xp: "200",    cat: "Discipline", color: "bg-violet-500/10 text-violet-500" },
    { icon: Users,      label: "Refer a Friend",               xp: "500",    cat: "Referral",   color: "bg-purple-500/10 text-purple-500" },
    { icon: BookOpen,   label: "Journal Entry",                xp: "50",     cat: "Journal",    color: "bg-teal-500/10 text-teal-500" },
    { icon: Medal,      label: "Connect MT5 Broker",           xp: "500",    cat: "Platform",   color: "bg-emerald-500/10 text-emerald-600" },
    { icon: TrendingUp, label: "Join Tournament",              xp: "50",     cat: "Compete",    color: "bg-cyan-500/10 text-cyan-500" },
    { icon: BrainCircuit, label: "AI Coach Consultation",      xp: "30",     cat: "AI",         color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">All Ways to Earn XP</h3>
        <span className="text-[11px] font-bold text-blue-500">{earns.length} earn types</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {earns.map((e, i) => (
          <motion.div
            key={e.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 p-4 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2 group"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-xl ${e.color} flex items-center justify-center`}>
                <e.icon size={15} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">{e.cat}</span>
            </div>
            <div>
              <p className="text-[12.5px] font-bold text-slate-800 dark:text-white leading-tight">{e.label}</p>
              <p className="text-[11px] font-black text-emerald-500 mt-0.5">+{e.xp} XP</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Historical XP Ledger Table ---
function XPLedger({ ledger }: { ledger: any[] }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm rounded-[32px] overflow-hidden select-none">
      <div className="p-8 border-b border-slate-200 dark:border-white/5">
        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">XP Transaction Ledger</h3>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              <th className="px-4 py-3 pb-4">Event Protocol</th>
              <th className="px-4 py-3 pb-4">Date Issued</th>
              <th className="px-4 py-3 pb-4">Rate Modifier</th>
              <th className="px-4 py-3 pb-4 text-right pr-6">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40 font-semibold text-[13px]">
            {ledger.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-slate-400 font-semibold italic">
                  No XP transactions recorded yet. Earn XP to populate your ledger.
                </td>
              </tr>
            ) : (
              ledger.map((row, i) => {
                const isNegative = row.xp.startsWith("-");
                return (
                  <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-[#1E2335]/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">{row.event}</td>
                    <td className="px-4 py-4 text-[12px] text-slate-400 dark:text-slate-400 font-medium">{row.date}</td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        {row.mult}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-right pr-6 font-black font-sans ${isNegative ? "text-rose-500" : "text-emerald-500"}`}>
                      {row.xp}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function Rewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
      } else {
        setUser(session.user);
        // Clear any stale localStorage gamification data before fetching fresh DB state
        localStorage.removeItem("tradifive_gamification_state");
        setAuthChecked(true);
        await syncGamificationWithSupabase();
      }
    };
    checkUser();
  }, [navigate]);

  const [gamState, setGamState] = useState<GamificationState>(() => getGamificationState());

  useEffect(() => {
    const handleXPUpdate = () => {
      setGamState(getGamificationState());
    };
    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    return () => window.removeEventListener("tradifive_xp_update", handleXPUpdate);
  }, []);

  const handleDirectiveComplete = (id: number, reward: number, text: string) => {
    completeMission(id, reward, text);
  };

  const handleUnlockBenefit = (id: number, cost: number) => {
    unlockBenefit(id, cost);
  };

  const benefits = [
    { id: 1, title: "Custom Advanced Analytics", cost: 2500, type: "Tool Upgrade", icon: Target },
    { id: 2, title: "$10,000 Funded Challenge", cost: 15000, type: "Capital Funding", icon: CircleDollarSign },
    { id: 3, title: "Tactical UI Dark Theme", cost: 1000, type: "Cosmetic Theme", icon: Crown },
    { id: 4, title: "Advanced HUD Dashboard", cost: 5000, type: "UI Module", icon: Zap },
  ];

function RewardsSkeleton() {
  return (
    <div className="max-w-[1500px] mx-auto space-y-8 pb-32 animate-pulse select-none">
      {/* Header Block */}
      <div className="flex flex-col mt-2 mb-10 gap-3">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
        <div className="h-4.5 w-[450px] bg-slate-200 dark:bg-slate-800/80 rounded-md" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1E1E1E] px-6 py-5 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800/80 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800/80 rounded" />
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800/80 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-white dark:border-white/5 shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800/80 rounded" />
            <div className="grid grid-cols-7 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="p-3 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 h-20" />
              ))}
            </div>
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-white dark:border-white/5 shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800/80 rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (!authChecked) {
    return (
      <DashboardLayout>
        <RewardsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1500px] mx-auto space-y-8 pb-32">
        
         {/* Header Block */}
         <div className="flex flex-col mt-2 mb-10 select-none">
            <h1 className="text-[32px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none font-sans">Discipline Rewards & XP</h1>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium mt-3">Operational discipline incentives and gamified trader mastery rewards.</p>
         </div>

        {/* Standardized Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
           <PerfectRewardMetric 
              label="Discipline Level" value={`Lvl ${gamState.level}`} icon={Crown} 
              color="bg-amber-500/10 text-amber-500"
              subValue={`Rank: ${
                gamState.level < 5 ? "Novice" :
                gamState.level < 10 ? "Challenger" :
                gamState.level < 15 ? "Elite" :
                gamState.level < 20 ? "Master" : "Vanguard"
              }`}
           />
           <PerfectRewardMetric 
              label="Current Level Progress" value={gamState.xp.toLocaleString()} icon={Star} 
              color="bg-blue-500/10 text-blue-500"
              subValue={`Next Level: ${gamState.xp_required}`}
              progress={(gamState.xp / gamState.xp_required) * 100}
           />
           <PerfectRewardMetric 
              label="Bounty Coin Balance" value={gamState.bounty_balance.toLocaleString()} icon={CircleDollarSign} 
              color="bg-emerald-500/10 text-emerald-500"
              subValue="Available for Store Unlocks"
           />
           <PerfectRewardMetric 
              label="Active Streak Boost" value={`+${gamState.streak}%`} icon={Zap} 
              color="bg-purple-500/10 text-purple-500"
              subValue={`${gamState.streak} Consecutive Logins`}
           />
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Left Columns (col-span-8) */}
           <div className="lg:col-span-8 space-y-8">
             <ConsistencyCheckin gamState={gamState} onClaimed={() => setGamState(getGamificationState())} />
             <DailyDirectives gamState={gamState} onComplete={handleDirectiveComplete} />
             <ReferAndEarn />
             <XPLedger ledger={gamState.ledger} />
           </div>

           {/* Right Columns (col-span-4) */}
           <div className="lg:col-span-4 space-y-8 h-fit">
             
             {/* Gamified Roadmap Footer Card */}
             <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] p-6 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden select-none">
               <h4 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Milestone Roadmap</h4>
               <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold mb-6">Reach Level 20 to unlock "The Institutional Vault" indicators.</p>
               
               <div className="space-y-3">
                 <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850 w-full relative">
                   <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm transition-all duration-700" style={{ width: `${Math.min(100, (gamState.level / 20) * 100)}%` }} />
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-bold">
                   <span className="text-slate-400 dark:text-slate-400">Progress to Lvl 20</span>
                   <span className="text-blue-500">{Math.round((gamState.level / 20) * 100)}% Complete</span>
                 </div>
               </div>
               
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                 <Trophy size={100} />
               </div>
             </div>
           </div>
        </div>

        {/* XP Earn Map - All Platform Opportunities */}
        <XPEarnMap />

        {/* Benefit Store Sections */}
        <div className="space-y-6">
           <div className="flex items-center justify-between select-none">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Benefit Marketplace</h3>
              <div className="flex gap-2">
                 <span className="text-[11px] font-bold px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl">
                   Coins: {gamState.bounty_balance.toLocaleString()}
                 </span>
              </div>
           </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((item) => {
                const isUnlocked = gamState.unlocked_items.includes(item.id);
                const hasBalance = gamState.bounty_balance >= item.cost;
                
                return (
                  <div key={item.id} className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm group hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-[240px]">
                     <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isUnlocked ? "bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400" : "bg-blue-500/10 border-blue-500/10 text-blue-500"}`}>
                              {isUnlocked ? <Check size={18} className="text-emerald-500" /> : <item.icon size={18} />}
                           </div>
                           <span className="text-[9px] font-extrabold text-slate-455 dark:text-slate-400 uppercase tracking-widest leading-none">{item.type}</span>
                        </div>
                        
                        <div className="space-y-1.5 mb-auto select-none">
                           <h4 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">{item.title}</h4>
                           <div className="flex items-center gap-1.5 leading-none">
                              <CircleDollarSign size={12} className="text-emerald-500" />
                              <span className="text-[13px] font-black text-emerald-500 font-sans">{item.cost.toLocaleString()} Coins</span>
                           </div>
                        </div>
   
                        <button 
                          onClick={() => handleUnlockBenefit(item.id, item.cost)}
                          disabled={isUnlocked || !hasBalance}
                          className={`w-full py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 active:scale-98 ${
                            isUnlocked 
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 cursor-not-allowed border border-transparent"
                              : hasBalance
                                ? "bg-gradient-to-b from-[#60A5FA] to-[#3B82F6] dark:bg-none dark:bg-[#1E1E1E] text-white border-2 border-[#93C5FD] dark:border-[#3B82F6] shadow-[0_4px_7px_-5px_rgba(59,130,246,0.2),_0_0_0_2px_#3B82F6]"
                                : "bg-slate-100 dark:bg-slate-855 text-slate-400 dark:text-slate-400 border-2 border-transparent cursor-not-allowed"
                          }`}
                        >
                           {isUnlocked ? "Benefit Active" : hasBalance ? "Unlock Benefit" : "Insufficient Coins"}
                        </button>
                     </div>
                  </div>
                );
              })}
           </div>
         </div>

      </div>
    </DashboardLayout>
  );
}
