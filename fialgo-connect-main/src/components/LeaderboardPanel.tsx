import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Crown, Trophy, Medal, Flame, TrendingUp, Star, Zap, RefreshCw, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

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
  trades_count?: number;
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

// Rank badge for top 3 & others
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={15} className="text-amber-400 fill-amber-400/30" />;
  if (rank === 2) return <Trophy size={15} className="text-slate-400 fill-slate-400/20" />;
  if (rank === 3) return <Medal size={15} className="text-orange-500 fill-orange-500/20" />;
  return <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 w-5 text-center tabular-nums">#{rank}</span>;
}

// XP Level label
function LevelBadge({ level }: { level: number }) {
  const colors = level >= 20 ? "bg-amber-500/15 text-amber-500 border border-amber-500/25"
               : level >= 10 ? "bg-violet-500/15 text-violet-500 border border-violet-500/25"
               : level >= 5 ? "bg-blue-500/15 text-blue-500 border border-blue-500/25"
               : "bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-300/60 dark:border-white/10";
  return (
    <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide tabular-nums ${colors}`}>
      Lv {level}
    </span>
  );
}

// Avatar Initials & Gradient Helper
const getInitials = (name: string) => {
  const parts = (name || "TR").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || "TR").slice(0, 2).toUpperCase();
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-violet-600 to-purple-800",
    "from-amber-600 to-orange-700",
    "from-rose-600 to-pink-700",
    "from-sky-600 to-cyan-700",
  ];
  let sum = 0;
  for (let i = 0; i < (name || "").length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

function UserAvatar({ user, sizeClass = "w-9 h-9 text-xs" }: { user: LeaderboardUser; sizeClass?: string }) {
  const [imgError, setImgError] = useState(false);
  const name = user.display_name || user.username || "Trader";

  if (user.avatar_url && !imgError) {
    return (
      <img
        src={user.avatar_url}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-slate-200/80 dark:border-white/10`}
      />
    );
  }

  const gradient = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} text-white font-black flex items-center justify-center shrink-0 border border-white/20 select-none shadow-xs`}
    >
      {initials}
    </div>
  );
}

// Top 3 Podium card
function PodiumCard({ user, position }: { user: LeaderboardUser; position: 1 | 2 | 3 }) {
  const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
  const orders = { 1: "order-2", 2: "order-1", 3: "order-3" };
  const colors = {
    1: "from-amber-400/25 to-yellow-500/10 border-amber-400/30 shadow-amber-500/10",
    2: "from-slate-400/25 to-slate-300/10 border-slate-400/30 shadow-slate-400/10",
    3: "from-orange-500/25 to-orange-400/10 border-orange-500/30 shadow-orange-500/10",
  };
  const glows = {
    1: "shadow-[0_0_24px_rgba(251,191,36,0.2)]",
    2: "shadow-[0_0_20px_rgba(148,163,184,0.12)]",
    3: "shadow-[0_0_20px_rgba(249,115,22,0.12)]",
  };
  const avatarBorders = {
    1: "ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0B0E14]",
    2: "ring-2 ring-slate-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0B0E14]",
    3: "ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0B0E14]",
  };

  const name = user.display_name || user.username || "Trader";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (3 - position) * 0.1, type: "spring", stiffness: 200 }}
      className={`flex flex-col items-center gap-2.5 ${orders[position]} flex-1 max-w-[130px]`}
    >
      {/* Crown for #1 */}
      {position === 1 ? (
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Crown size={22} className="text-amber-400 fill-amber-400/30 filter drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]" />
        </motion.div>
      ) : (
        <div className="h-5" />
      )}

      {/* Avatar with position badge */}
      <div className="relative">
        <div className={avatarBorders[position] + " rounded-full"}>
          <UserAvatar user={user} sizeClass="w-13 h-13 text-sm" />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#0B0E14] flex items-center justify-center text-[10px] font-black border border-slate-200 dark:border-white/10 shadow-xs ${
            position === 1 ? "text-amber-500" : position === 2 ? "text-slate-400" : "text-orange-500"
          }`}
        >
          {position}
        </div>
      </div>

      {/* Name and XP */}
      <div className="text-center w-full px-1">
        <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
          {name}
        </p>
        <p className="text-[11px] font-black text-emerald-500 tabular-nums">
          {(user.xp_total || 0).toLocaleString()} <span className="text-[9px] font-normal opacity-80">XP</span>
        </p>
      </div>

      {/* Podium base */}
      <div
        className={`w-full rounded-t-2xl bg-gradient-to-t ${colors[position]} border-t border-x ${glows[position]} flex flex-col items-center justify-center ${heights[position]} min-w-[85px] pt-2`}
      >
        <LevelBadge level={user.xp_level || 1} />
        {user.win_rate !== null && user.win_rate !== undefined && (
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1.5 tabular-nums">
            {Number(user.win_rate).toFixed(0)}% WR
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function LeaderboardPanel({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All Time");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const fetchLeaderboard = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      // 1. Fetch non-banned profiles
      const { data: profilesData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url, xp_total, xp_level, streak_days, win_rate, is_verified, subscription_status, created_at")
        .eq("is_banned", false);

      if (profileErr) throw profileErr;

      const rawProfiles = profilesData || [];

      // 2. Fetch period-scoped XP if filtering by Month or Week
      let periodXpMap: Record<string, number> = {};
      if (filter !== "All Time") {
        const now = new Date();
        let periodStart: Date;
        if (filter === "This Month") {
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          // This Week (starting Monday)
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          periodStart = new Date(now.setDate(diff));
          periodStart.setHours(0, 0, 0, 0);
        }

        const { data: ledgerData } = await supabase
          .from("user_xp_ledger")
          .select("user_id, xp_amount")
          .gte("created_at", periodStart.toISOString());

        if (ledgerData) {
          ledgerData.forEach((row: any) => {
            if (row.user_id) {
              periodXpMap[row.user_id] = (periodXpMap[row.user_id] || 0) + (Number(row.xp_amount) || 0);
            }
          });
        }
      }

      // 3. Query trades to compute real-time win rates if profiles lack win_rate
      let userTradeStatsMap: Record<string, { winRate: number; totalTrades: number }> = {};
      try {
        const { data: tradesData } = await supabase
          .from("trades")
          .select("user_id, profit");

        if (tradesData && tradesData.length > 0) {
          const userTradesGroup: Record<string, any[]> = {};
          tradesData.forEach((t: any) => {
            if (t.user_id) {
              if (!userTradesGroup[t.user_id]) userTradesGroup[t.user_id] = [];
              userTradesGroup[t.user_id].push(t);
            }
          });

          Object.keys(userTradesGroup).forEach((uid) => {
            const list = userTradesGroup[uid];
            const wins = list.filter((t) => Number(t.profit) > 0).length;
            userTradeStatsMap[uid] = {
              totalTrades: list.length,
              winRate: Math.round((wins / list.length) * 100),
            };
          });
        }
      } catch (tradeErr) {
        console.warn("Trades aggregation fallback:", tradeErr);
      }

      // 4. Map & rank users
      const ranked: LeaderboardUser[] = rawProfiles
        .map((u: any) => {
          let computedXP = Number(u.xp_total) || 0;
          if (filter !== "All Time") {
            // If we have ledger entries for the period, use that.
            // Otherwise if user has XP, show proportional or full if joined recently
            computedXP = periodXpMap[u.id] !== undefined ? periodXpMap[u.id] : 0;
          }

          const tradeStat = userTradeStatsMap[u.id];
          const effectiveWinRate =
            u.win_rate !== null && u.win_rate !== undefined
              ? Number(u.win_rate)
              : tradeStat
              ? tradeStat.winRate
              : null;

          const level =
            Number(u.xp_level) || Math.max(1, Math.floor(computedXP / 250) + 1);

          return {
            id: u.id,
            display_name: u.display_name,
            username: u.username,
            avatar_url: u.avatar_url,
            xp_total: computedXP,
            xp_level: level,
            streak_days: Number(u.streak_days) || 0,
            win_rate: effectiveWinRate,
            is_verified: !!u.is_verified,
            subscription_status: u.subscription_status || null,
            rank: 0,
            trades_count: tradeStat?.totalTrades || 0,
          };
        })
        .sort((a, b) => {
          if (b.xp_total !== a.xp_total) {
            return b.xp_total - a.xp_total;
          }
          if ((b.streak_days || 0) !== (a.streak_days || 0)) {
            return (b.streak_days || 0) - (a.streak_days || 0);
          }
          return (b.win_rate || 0) - (a.win_rate || 0);
        })
        .map((u, i) => ({
          ...u,
          rank: i + 1,
        }));

      setUsers(ranked);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  // Initial load
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Real-time Subscriptions (Live updates when profiles or XP ledger change)
  useEffect(() => {
    const channel = supabase
      .channel("realtime_leaderboard_hub")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchLeaderboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_xp_ledger" },
        () => {
          fetchLeaderboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  const topThree = useMemo(() => users.slice(0, 3), [users]);
  const currentUserEntry = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-white/10 rounded-lg" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="h-9 w-60 bg-slate-200 dark:bg-white/10 rounded-xl" />
        </div>
        <div className="h-40 bg-slate-100 dark:bg-white/5 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 pb-32">
      {/* ── Header Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              XP Leaderboard
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Top traders ranked by consistency, win rate & disciplined trading
          </p>
        </div>

        {/* Filter dock + Manual Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#18181B] border border-slate-200/80 dark:border-white/10 rounded-xl shadow-2xs">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fetchLeaderboard(true)}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#18181B] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            title={`Last updated ${lastSyncTime}. Click to refresh.`}
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
          </button>
        </div>
      </div>

      {/* ── Current User Standing Banner ───────────────────────────────── */}
      {currentUserEntry && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <UserAvatar user={currentUserEntry} sizeClass="w-12 h-12 text-sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-extrabold text-slate-900 dark:text-white">
                  {currentUserEntry.display_name || currentUserEntry.username || "You"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  Your Standing
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Current Rank: <strong className="text-blue-600 dark:text-blue-400 font-extrabold">#{currentUserEntry.rank}</strong> of {users.length} traders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:border-l sm:border-slate-200/80 dark:sm:border-white/10 sm:pl-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total XP</p>
              <p className="text-[17px] font-black text-emerald-500 tabular-nums">
                {currentUserEntry.xp_total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level</p>
              <LevelBadge level={currentUserEntry.xp_level} />
            </div>
            {currentUserEntry.streak_days !== null && currentUserEntry.streak_days > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streak</p>
                <span className="flex items-center gap-1 text-[13px] font-extrabold text-orange-500 tabular-nums">
                  <Flame size={14} className="fill-orange-500/20" />
                  {currentUserEntry.streak_days}d
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Top 3 Podium (When 3+ traders exist) ───────────────────────── */}
      {topThree.length >= 3 && (
        <div className="mb-10 pt-4 flex items-end justify-center gap-3 sm:gap-6 border-b border-slate-200/60 dark:border-white/5 pb-2">
          <PodiumCard user={topThree[1]} position={2} />
          <PodiumCard user={topThree[0]} position={1} />
          <PodiumCard user={topThree[2]} position={3} />
        </div>
      )}

      {/* ── Full Leaderboard Table ────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 px-5 pb-2 select-none">
          <span className="col-span-1">#</span>
          <span className="col-span-5">Trader</span>
          <span className="col-span-2 text-right">XP</span>
          <span className="col-span-2 text-right">Level</span>
          <span className="col-span-2 text-right">Win Rate</span>
        </div>

        <AnimatePresence mode="popLayout">
          {users.map((u, idx) => {
            const isCurrentUser = u.id === currentUserId;

            return (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className={`grid grid-cols-12 items-center px-4 sm:px-5 py-3.5 rounded-2xl border transition-all cursor-default select-none ${
                  isCurrentUser
                    ? "bg-blue-500/[0.08] dark:bg-blue-500/[0.12] border-blue-500/40 shadow-xs ring-1 ring-blue-500/20"
                    : u.rank === 1
                    ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.04] border-amber-500/25 dark:border-amber-500/20"
                    : "bg-white dark:bg-[#18181B] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15"
                }`}
              >
                {/* Rank Badge */}
                <div className="col-span-1 flex items-center justify-start">
                  <RankBadge rank={u.rank} />
                </div>

                {/* Avatar + Trader Info */}
                <div className="col-span-5 flex items-center gap-3 min-w-0 pr-2">
                  <UserAvatar user={u} sizeClass="w-9 h-9 text-xs" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[13px] font-extrabold truncate ${
                          isCurrentUser
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {u.display_name || u.username || "Trader"}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold text-blue-500">(You)</span>
                      )}
                      {u.is_verified && (
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 fill-emerald-500/20" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {u.username && (
                        <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 truncate max-w-[100px] sm:max-w-none">
                          @{u.username}
                        </span>
                      )}
                      <PlanBadge plan={u.subscription_status} />
                      {u.streak_days !== null && u.streak_days > 0 && (
                        <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-orange-500 tabular-nums">
                          <Flame size={10} className="fill-orange-500/20" />
                          {u.streak_days}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* XP Column */}
                <div className="col-span-2 text-right">
                  <span className="text-[13px] font-black text-emerald-500 tabular-nums">
                    {(u.xp_total || 0).toLocaleString()}
                  </span>
                  <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 ml-1 font-semibold uppercase">
                    XP
                  </span>
                </div>

                {/* Level Column */}
                <div className="col-span-2 text-right">
                  <LevelBadge level={u.xp_level || 1} />
                </div>

                {/* Win Rate Column */}
                <div className="col-span-2 text-right">
                  {u.win_rate !== null && u.win_rate !== undefined ? (
                    <span
                      className={`text-[12px] font-bold tabular-nums ${
                        u.win_rate >= 60
                          ? "text-emerald-500"
                          : u.win_rate >= 40
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    >
                      {Number(u.win_rate).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-400 dark:text-zinc-600 font-semibold">—</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state safeguard */}
        {users.length === 0 && (
          <div className="text-center py-20 px-4 bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-white/[0.06] rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Star size={24} />
            </div>
            <h4 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
              No traders on the leaderboard yet
            </h4>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Connect your MT5 account and start earning XP through disciplined trading!
            </p>
          </div>
        )}
      </div>

      {/* ── XP Info Footer ────────────────────────────────────────────── */}
      <div className="mt-8 p-4 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <TrendingUp size={13} className="text-emerald-500" />
          <span>
            XP is awarded from <strong className="text-slate-700 dark:text-zinc-300">profitable disciplined trades</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-blue-500" />
          <span>
            AI Coach evaluates <strong className="text-slate-700 dark:text-zinc-300">consistency & risk guard adherence</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={13} className="text-orange-500" />
          <span>Daily check-in streaks reward bonus XP</span>
        </div>
      </div>
    </div>
  );
}
