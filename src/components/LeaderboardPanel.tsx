import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Crown, Trophy, Medal, Flame, TrendingUp, Star, Zap, ChevronUp } from "lucide-react";

interface LeaderboardUser {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  xp_total: number;
  xp_level: number;
  streak_days: number | null;
  win_rate: number | null;
  is_verified: boolean | null;
  subscription_status: string | null;
  rank: number;
}

// Tier filter options
const FILTERS = ["All Time", "This Month", "This Week"] as const;
type Filter = typeof FILTERS[number];

// Subscription badge colors
function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan || plan === "standard" || plan === "starter") return null;
  const isElite = plan === "elite" || plan === "advanced";
  return (
    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
      isElite
        ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
        : "bg-violet-500/20 text-violet-500 border border-violet-500/30"
    }`}>
      {isElite ? "Elite" : "Pro"}
    </span>
  );
}

// Rank badge for top 3
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={14} className="text-amber-400 fill-amber-400/30" />;
  if (rank === 2) return <Trophy size={14} className="text-slate-400 fill-slate-400/20" />;
  if (rank === 3) return <Medal size={14} className="text-orange-500 fill-orange-500/20" />;
  return <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 w-4 text-center">{rank}</span>;
}

// XP Level label
function LevelBadge({ level }: { level: number }) {
  const colors = level >= 20 ? "bg-amber-500/15 text-amber-500"
               : level >= 10 ? "bg-violet-500/15 text-violet-500"
               : level >= 5 ? "bg-blue-500/15 text-blue-500"
               : "bg-slate-200/80 dark:bg-slate-800 text-slate-500";
  return (
    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${colors}`}>
      Lv {level}
    </span>
  );
}

// Top 3 Podium card
function PodiumCard({ user, position }: { user: LeaderboardUser; position: 1 | 2 | 3 }) {
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
  const orders = { 1: "order-2", 2: "order-1", 3: "order-3" };
  const colors = {
    1: "from-amber-400/20 to-yellow-500/10 border-amber-400/30 shadow-amber-500/10",
    2: "from-slate-400/20 to-slate-300/10 border-slate-400/30 shadow-slate-400/10",
    3: "from-orange-500/20 to-orange-400/10 border-orange-500/30 shadow-orange-500/10"
  };
  const glows = {
    1: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
    2: "shadow-[0_0_20px_rgba(148,163,184,0.1)]",
    3: "shadow-[0_0_20px_rgba(249,115,22,0.1)]"
  };
  const avatarBorders = {
    1: "ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0E1020]",
    2: "ring-2 ring-slate-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0E1020]",
    3: "ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0E1020]"
  };

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || "T")}&background=random&color=fff`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (3 - position) * 0.1, type: "spring", stiffness: 200 }}
      className={`flex flex-col items-center gap-2 ${orders[position]}`}
    >
      {/* Crown for #1 */}
      {position === 1 && (
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Crown size={20} className="text-amber-400 fill-amber-400/30" />
        </motion.div>
      )}

      {/* Avatar */}
      <div className="relative">
        <img
          src={user.avatar_url || avatarFallback}
          onError={(e) => { e.currentTarget.src = avatarFallback; }}
          alt={user.display_name || "Trader"}
          className={`w-12 h-12 rounded-full object-cover ${avatarBorders[position]}`}
        />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#0E1020] flex items-center justify-center text-[9px] font-black border border-slate-200 dark:border-slate-800 ${
          position === 1 ? "text-amber-500" : position === 2 ? "text-slate-400" : "text-orange-500"
        }`}>
          {position}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[80px]">
          {user.display_name || user.username || "Trader"}
        </p>
        <p className="text-[10px] font-black text-emerald-500">{(user.xp_total || 0).toLocaleString()} XP</p>
      </div>

      {/* Podium base */}
      <div className={`w-full rounded-t-2xl bg-gradient-to-t ${colors[position]} border-t border-x ${glows[position]} flex items-center justify-center ${heights[position]} min-w-[70px]`}>
        <LevelBadge level={user.xp_level || 1} />
      </div>
    </motion.div>
  );
}

export default function LeaderboardPanel({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All Time");
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url, xp_total, xp_level, streak_days, win_rate, is_verified, subscription_status')
          .eq('is_banned', false)
          .gt('xp_total', 0)
          .order('xp_total', { ascending: false })
          .limit(50);

        if (error) throw error;

        const ranked: LeaderboardUser[] = (data || []).map((u, i) => ({
          ...u,
          rank: i + 1
        }));

        setUsers(ranked);

        // Find current user's rank
        if (currentUserId) {
          const myRank = ranked.findIndex(u => u.id === currentUserId);
          setCurrentUserRank(myRank >= 0 ? myRank + 1 : null);
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUserId, filter]);

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 animate-pulse">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800/40 rounded-2xl" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/30 rounded-2xl mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 pb-32">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            XP Leaderboard
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Top traders ranked by consistency & disciplined trading
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1A1A21] rounded-xl">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                filter === f
                  ? "bg-white dark:bg-[#252535] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Current user rank banner */}
      {currentUserRank && currentUserRank > 3 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 px-5 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-blue-500" />
            <span className="text-[13px] font-bold text-slate-800 dark:text-white">
              Your current rank: <span className="text-blue-500">#{currentUserRank}</span>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Earn XP from profitable trades to climb up!
          </span>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="mb-8 flex items-end justify-center gap-4">
          <PodiumCard user={topThree[1]} position={2} />
          <PodiumCard user={topThree[0]} position={1} />
          <PodiumCard user={topThree[2]} position={3} />
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 px-4 pb-2">
          <span className="col-span-1">#</span>
          <span className="col-span-5">Trader</span>
          <span className="col-span-2 text-right">XP</span>
          <span className="col-span-2 text-right">Level</span>
          <span className="col-span-2 text-right">Win Rate</span>
        </div>

        <AnimatePresence>
          {restUsers.map((u, idx) => {
            const isCurrentUser = u.id === currentUserId;
            const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.display_name || u.username || "T")}&background=random&color=fff`;

            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl border transition-all hover:-translate-y-0.5 cursor-default select-none ${
                  isCurrentUser
                    ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                    : "bg-white dark:bg-[#13141F] border-slate-100 dark:border-[#1E2538] hover:border-slate-200 dark:hover:border-[#2A3350]"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  <RankBadge rank={u.rank} />
                </div>

                {/* Avatar + Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <img
                    src={u.avatar_url || avatarFallback}
                    onError={(e) => { e.currentTarget.src = avatarFallback; }}
                    alt={u.display_name || "Trader"}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[12.5px] font-bold truncate ${isCurrentUser ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                        {u.display_name || u.username || "Trader"}
                        {isCurrentUser && " (You)"}
                      </span>
                      {u.is_verified && (
                        <span className="inline-flex items-center justify-center bg-[#23A55A] text-white rounded-full w-3.5 h-3.5 shrink-0">
                          <svg viewBox="0 0 12 12" className="w-2 h-2 fill-current"><path d="M4.5 9L1.5 6l1.2-1.2L4.5 6.6l4.8-4.8L10.5 3z" /></svg>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {u.username && <span className="text-[10px] text-slate-400 dark:text-slate-400">@{u.username}</span>}
                      <PlanBadge plan={u.subscription_status} />
                      {u.streak_days && u.streak_days > 2 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-orange-500">
                          <Flame size={9} className="fill-orange-500/20" />
                          {u.streak_days}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* XP */}
                <div className="col-span-2 text-right">
                  <span className="text-[12px] font-black text-emerald-500">{(u.xp_total || 0).toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-400 ml-0.5">xp</span>
                </div>

                {/* Level */}
                <div className="col-span-2 text-right">
                  <LevelBadge level={u.xp_level || 1} />
                </div>

                {/* Win Rate */}
                <div className="col-span-2 text-right">
                  {u.win_rate ? (
                    <span className={`text-[11px] font-bold ${u.win_rate >= 60 ? "text-emerald-500" : u.win_rate >= 40 ? "text-amber-500" : "text-rose-500"}`}>
                      {Number(u.win_rate).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300 dark:text-slate-400">—</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {users.length === 0 && (
          <div className="text-center py-16">
            <Star size={32} className="text-slate-300 dark:text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold">No traders on the leaderboard yet.</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-1">Connect your MT5 and start earning XP through disciplined trading!</p>
          </div>
        )}
      </div>

      {/* XP info footer */}
      <div className="mt-8 p-4 bg-slate-50/80 dark:bg-[#0E1020]/80 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-500" />
          <span>XP is earned only from <strong className="text-slate-700 dark:text-slate-300">profitable disciplined trades</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-blue-500" />
          <span>AI Coach evaluates <strong className="text-slate-700 dark:text-slate-300">consistency & discipline</strong> before awarding XP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-orange-500" />
          <span>Daily check-in streaks also reward XP</span>
        </div>
      </div>
    </div>
  );
}
