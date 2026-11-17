import React, { useState, useEffect, useMemo, useCallback } from "react";
import { addXP } from "@/utils/gamification";
import DashboardLayout from "@/components/DashboardLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2, MapPin, Calendar, MoreHorizontal,
  Search, Heart, MessageCircle, MessageSquare, Bookmark, Share2,
  TrendingUp, Globe, Flame, ShieldCheck, Trophy,
  Star, BarChart2, FileText, Shield, Info, Target, Scale,
  Crown, ArrowRight, ChevronDown, ChevronLeft, Radio, Play, UserPlus, UserCheck, Mail, Lock, Clock, Camera
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import FeedCard from "@/components/FeedCard";
import { toast } from "sonner";
import { calculateTradingMetrics } from "@/utils/tradeMetrics";
import { FollowListModal } from "@/components/FollowListModal";
import { CommentModal } from "@/components/CommentModal";
import ShareProfileModal from "@/components/ShareProfileModal";

// Placeholder display names to filter out from suggestions
const PLACEHOLDER_NAMES = ["new trader", "guest trader", "demo trader", "trader", "guest"];

// --- MOCK FALLBACK TRADES ---


function PollBlock({
  post,
  currentUserId,
  onVoteSuccess
}: {
  post: any;
  currentUserId: string;
  onVoteSuccess: () => void;
}) {
  const votedOptionKey = `tradifive_voted_poll_${post.id}`;
  const [votedOption, setVotedOption] = useState<number | null>(() => {
    const val = localStorage.getItem(votedOptionKey);
    return val !== null ? Number(val) : null;
  });

  let pollData: { options: string[]; votes: number[] } | null = null;
  if (post.post_type === "poll" && post.media_url) {
    try {
      pollData = JSON.parse(post.media_url);
    } catch (e) { }
  }

  if (!pollData) return null;

  const handleVoteOption = async (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pollData || votedOption !== null || post.user_id === currentUserId) return;
    const updatedVotes = [...pollData.votes];
    updatedVotes[index]++;
    const updatedPoll = { ...pollData, votes: updatedVotes };
    localStorage.setItem(votedOptionKey, String(index));
    setVotedOption(index);
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ media_url: JSON.stringify(updatedPoll) })
        .eq('id', post.id);
      if (error) throw error;
      onVoteSuccess();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const totalPollVotes = pollData.votes.reduce((a, b) => a + b, 0);
  const hasVotedOrOwns = votedOption !== null || post.user_id === currentUserId;

  return (
    <div className="mb-4 p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-[#1E1E1E]/10 space-y-3">
      {pollData.options.map((opt, idx) => {
        const votes = pollData!.votes[idx] || 0;
        const percentage = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
        return hasVotedOrOwns ? (
          <div key={idx} className="relative w-full p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#1E1E1E] overflow-hidden select-none font-semibold text-xs text-slate-800 dark:text-white flex items-center justify-between">
            <div className="absolute left-0 top-0 bottom-0 bg-blue-500/10 dark:bg-blue-500/15 transition-all duration-500" style={{ width: `${percentage}%` }} />
            <span className="relative z-10 flex items-center gap-2 font-bold">
              {opt} {votedOption === idx && <span className="text-[10px] text-blue-500 font-extrabold">(Your Vote)</span>}
            </span>
            <span className="relative z-10 font-extrabold text-slate-700 dark:text-slate-355">
              {percentage}% ({votes})
            </span>
          </div>
        ) : (
          <button
            key={idx}
            onClick={(e) => handleVoteOption(e, idx)}
            className="w-full text-left p-3.5 rounded-xl border-2 border-slate-200 dark:border-white/5 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50/10 dark:hover:bg-blue-500/5 transition-all font-semibold text-xs text-slate-700 dark:text-[#CCC] hover:text-blue-500 select-none cursor-pointer"
          >
            {opt}
          </button>
        );
      })}
      <div className="text-[10.5px] font-bold text-slate-400 dark:text-slate-400 px-1 pt-1 flex justify-between">
        <span>Total: {totalPollVotes} vote{totalPollVotes !== 1 ? 's' : ''}</span>
        {post.user_id === currentUserId && <span className="text-blue-500">Your Poll</span>}
      </div>
    </div>
  );
}

export default function UserProfilePublic() {
  const { username } = useParams<{ username: string }>();
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [suggestedTraders, setSuggestedTraders] = useState<any[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Follow/Profile Stats matching image exactly
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [ownPostsCount, setOwnPostsCount] = useState(0);
  const [followedByCount, setFollowedByCount] = useState(0);
  const [followListState, setFollowListState] = useState<{ isOpen: boolean, type: 'followers' | 'following' }>({ isOpen: false, type: 'followers' });
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

  // Dynamic calculated metrics states
  const [totalTradesCount, setTotalTradesCount] = useState<number>(0);
  const [displayWinRate, setWinRateVal] = useState<string>("0%");
  const [displayRoi, setRoiVal] = useState<string>("0.00%");
  const [displayAvgRR, setAvgRRVal] = useState<string>("0");
  const [displayStreak, setStreakVal] = useState<string>("0 Days");
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [streakDots, setStreakDots] = useState<{ date: string; status: 'green' | 'red' | 'gray' }[]>([]);
  const [calendarDayMap, setCalendarDayMap] = useState<Record<string, 'green' | 'red'>>({});
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());



  const [advMetrics, setAdvMetrics] = useState<any>(calculateTradingMetrics([]));

  // Privacy Settings state
  const [privacySettings, setPrivacySettings] = useState<Record<string, any>>({
    show_location: true,
    show_winrate: true,
    show_roi: true,
    show_avg_rr: true,
    show_streak: true,
    show_trades: true,
    show_performance: true,
    show_ai_analysis: true,
    show_followers: true,
    show_calendar: true,
    is_private: false,
    account_type: 'personal' as 'personal' | 'creator' | 'business'
  });

  const [publicTrades, setPublicTrades] = useState<any[]>([]);
  const [userChannel, setUserChannel] = useState<any>(null);
  const [levelVal, setLevelVal] = useState(1);
  const [xpVal, setXpVal] = useState(0);
  const [xpRequiredVal, setXpRequiredVal] = useState(500);

  // Interaction States
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [likesOffsets, setLikesOffsets] = useState<Record<string, number>>({});
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  // Helper to check if string is a UUID
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  useEffect(() => {
    fetchProfileAndData();
  }, [username]);

  const fetchProfileAndData = async () => {
    setLoading(true);
    try {
      const lowerUsername = username?.toLowerCase() || "";

      let loadedPrivacy: any = {
        show_location: true,
        show_winrate: true,
        show_roi: true,
        show_avg_rr: true,
        show_streak: true,
        show_trades: true,
        show_performance: true,
        show_ai_analysis: true,
        show_followers: true,
        show_calendar: true,
        is_private: false,
        account_type: 'personal'
      };

      // Try loading privacy settings from localStorage
      const storedPrivacyStr = localStorage.getItem(`tradifive_privacy_user_${lowerUsername}`);
      if (storedPrivacyStr) {
        try {
          loadedPrivacy = { ...loadedPrivacy, ...JSON.parse(storedPrivacyStr) };
        } catch (e) { }
      }

      let profileId = "";

      // ALWAYS query Supabase first for real profile data
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lowerUsername);

      let query = supabase.from('profiles').select('*');
      if (isUUID) {
        query = query.eq('id', lowerUsername);
      } else {
        query = query.ilike('username', lowerUsername);
      }

      const { data: profileData } = await query.maybeSingle();

      if (profileData) {
        // Real profile found in database
        setProfile(profileData);
        profileId = profileData.id;

        // Try loading privacy from localStorage by id
        let finalPrivacy = loadedPrivacy;
        const idPrivacyStr = localStorage.getItem(`tradifive_privacy_${profileData.id}`);
        if (idPrivacyStr) {
          try {
            const parsed = JSON.parse(idPrivacyStr);
            finalPrivacy = { ...loadedPrivacy, ...parsed };
          } catch (e) { }
        }

        // Ensure database is_private overrides localStorage if available
        if (profileData.is_private !== undefined && profileData.is_private !== null) {
          finalPrivacy.is_private = profileData.is_private;
        }

        setPrivacySettings(finalPrivacy);

        // Fetch posts for this user
        const { data: rawPostsData, error: postsErr } = await supabase
          .from('social_posts')
          .select('*')
          .eq('user_id', profileData.id)
          .neq('post_type', 'story')
          .order('created_at', { ascending: false });
        if (!postsErr && rawPostsData) {
          let deletedSet = new Set<string>();
          try {
            const delArr = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
            deletedSet = new Set(delArr.map(String));
          } catch (_) {}
          const safePosts = rawPostsData.filter((p: any) => p && !deletedSet.has(String(p.id))).map((p: any) => ({
            ...p,
            profiles: p.profiles || profileData
          }));
          setPosts(safePosts);
          setOwnPostsCount(safePosts.length);
        } else {
          setPosts([]);
          setOwnPostsCount(0);
        }

        // Fetch channel for this user
        const { data: channelData } = await supabase
          .from('channels')
          .select('*')
          .eq('created_by', profileData.id)
          .maybeSingle();
        setUserChannel(channelData);

        // Fetch bookmarks for this user
        const { data: rawBookmarksData, error: bookmarksErr } = await supabase
          .from('social_post_bookmarks')
          .select('post_id, social_posts(*)')
          .eq('user_id', profileData.id);
        if (!bookmarksErr && rawBookmarksData) {
          const bookmarkMap: Record<string, boolean> = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
          rawBookmarksData.forEach((b: any) => { bookmarkMap[b.post_id] = true; });
          setBookmarkedPosts(bookmarkMap);
          const rawSaved = rawBookmarksData.map((b: any) => b.social_posts).filter(Boolean);
          const authorIds = Array.from(new Set(rawSaved.map((p: any) => p.user_id).filter(Boolean)));
          let profMap: Record<string, any> = {};
          if (authorIds.length > 0) {
            const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url, username, display_name, bio, banner_url').in('id', authorIds);
            if (profs) profs.forEach((pr: any) => { profMap[pr.id] = pr; });
          }
          const parsedSavedPosts = rawSaved.map((p: any) => ({
            ...p,
            profiles: profMap[p.user_id] || null
          }));
          setSavedPosts(parsedSavedPosts);
        } else {
          const bookmarkMap: Record<string, boolean> = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
          setBookmarkedPosts(bookmarkMap);
        }
      } else {
        // User not found in database — show generic placeholder profile
        const placeholderProfile = {
          id: 'not-found',
          display_name: isUUID ? "Unknown Trader" : (username ? username.charAt(0).toUpperCase() + username.slice(1) : "Unknown Trader"),
          username: isUUID ? "unknown" : (username || "unknown"),
          bio: "This trader hasn't set up their profile yet.",
          avatar_url: "/default-avatar.svg",
          banner_url: "/default-cover.png",
          location: "",
          country: "",
          country_emoji: "🌍"
        };
        setProfile(placeholderProfile);
        profileId = placeholderProfile.id;
        setPrivacySettings(loadedPrivacy);
        setPosts([]);
        setOwnPostsCount(0);
      }

      // Fetch Trades for stats calculations (only for real DB profiles)
      if (profileId && profileId !== 'not-found' && !profileId.startsWith('mock-')) {
        const { count: followers } = await supabase
          .from('social_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileId);

        const { count: following } = await supabase
          .from('social_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileId);

        if (followers !== null) setFollowerCount(followers);
        if (following !== null) setFollowingCount(following);

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setCurrentUserId(currentUser.id);
          const { data: followRecord } = await supabase
            .from('social_follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('following_id', profileId)
            .maybeSingle();

          // Fetch all follows of current user
          const { data: allFollows } = await supabase
            .from('social_follows')
            .select('following_id')
            .eq('follower_id', currentUser.id);

          const map: Record<string, boolean> = { [profileId]: !!followRecord };
          if (allFollows) {
            allFollows.forEach((f: any) => {
              map[f.following_id] = true;
            });
          }
          setFollowedUsers(map);

          // Check if a follow request is pending
          if (profileId !== currentUser.id && profileId !== 'not-found' && !profileId.startsWith('mock-')) {
            const { data: requestRecord } = await supabase
              .from('social_follow_requests')
              .select('id')
              .eq('requester_id', currentUser.id)
              .eq('target_id', profileId)
              .maybeSingle();

            if (requestRecord) {
              setHasRequested(true);
            } else {
              setHasRequested(false);
            }
          }

          // Fetch Liked Posts
          const { data: likedData } = await supabase
            .from('social_post_likes')
            .select('post_id')
            .eq('user_id', currentUser.id);
          if (likedData) {
            const likedMap: Record<string, boolean> = {};
            likedData.forEach(item => { likedMap[item.post_id] = true; });
            setLikedPosts(likedMap);
          }

          // Fetch Suggested Traders from database (users other than logged-in user)
          const { data: sugData } = await supabase
            .from('profiles')
            .select('id, display_name, username, avatar_url, win_rate, bio')
            .neq('id', currentUser.id)
            .limit(10);
          if (sugData) {
            // Filter out placeholder/mock profiles
            const realTraders = sugData.filter((p: any) => {
              const name = (p.display_name || '').trim().toLowerCase();
              return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
            }).slice(0, 5);
            setSuggestedTraders(realTraders);
          }
        }

        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', profileId);

        if (tradesData && tradesData.length > 0) {
          const total = tradesData.length;
          const wins = tradesData.filter((t: any) => Number(t.profit) > 0).length;
          const wr = total > 0 ? Math.round((wins / total) * 100) : 0;
          const pnlSum = tradesData.reduce((acc: number, t: any) => acc + Number(t.profit || 0), 0);

          setTotalTradesCount(total);
          setWinRateVal(`${wr}%`);

          let currentStreak = 0;
          const sortedTrades = [...tradesData].sort((a: any, b: any) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime());
          for (const t of sortedTrades) {
            if (Number(t.profit) > 0) {
              currentStreak++;
            } else {
              break;
            }
          }
          setStreakVal(`${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`);

          let best = 0;
          let runLen = 0;
          const chronoTrades = [...tradesData].sort((a: any, b: any) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
          for (const t of chronoTrades) {
            if (Number(t.profit) > 0) { runLen++; if (runLen > best) best = runLen; } else { runLen = 0; }
          }
          setBestStreak(best);

          const today = new Date();
          const dailyPnl: Record<string, number> = {};
          for (const t of tradesData) {
            const d = new Date(t.closed_at || t.created_at);
            if (!isNaN(d.getTime())) {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              dailyPnl[key] = (dailyPnl[key] || 0) + Number(t.profit || 0);
            }
          }
          const dots: { date: string; status: 'green' | 'red' | 'gray' }[] = [];
          for (let i = 14; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (dailyPnl[key] !== undefined) {
              dots.push({ date: key, status: dailyPnl[key] > 0 ? 'green' : 'red' });
            } else {
              dots.push({ date: key, status: 'gray' });
            }
          }
          setStreakDots(dots);

          const calMap: Record<string, 'green' | 'red'> = {};
          for (const [key, pnl] of Object.entries(dailyPnl)) {
            calMap[key] = pnl > 0 ? 'green' : 'red';
          }
          setCalendarDayMap(calMap);

          // Fetch balance for ROI
          const { data: mt5Data } = await supabase
            .from('mt5_accounts')
            .select('balance')
            .eq('user_id', profileId)
            .maybeSingle();

          const balance = mt5Data?.balance || 10000;
          const roiPercent = balance > 0 ? (pnlSum / balance) * 100 : 0;
          setRoiVal((pnlSum >= 0 ? "+" : "") + roiPercent.toFixed(2) + "%");
          setPublicTrades(tradesData);
          setAdvMetrics(calculateTradingMetrics(tradesData, balance));
        } else {
          setTotalTradesCount(0);
          setWinRateVal("0%");
          setStreakVal("0 Days");
          setBestStreak(0);
          setStreakDots([]);
          setCalendarDayMap({});
          setRoiVal("0.00%");
          setPublicTrades([]);
          setAdvMetrics(calculateTradingMetrics([]));
        }
      } else {
        setTotalTradesCount(0);
        setWinRateVal("0%");
        setStreakVal("0 Days");
        setRoiVal("0.00%");
        setPublicTrades([]);
      }

      // Load gamification stats for this target user
      if (username && currentUserId) {
        // Check if viewing own profile
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentUserId)
          .maybeSingle();

        const isSelf = currentProfile?.username?.toLowerCase() === username.toLowerCase();
        if (isSelf) {
          const selfGam = localStorage.getItem("tradifive_gamification_state");
          if (selfGam) {
            try {
              const parsed = JSON.parse(selfGam);
              setLevelVal(parsed.level || 1);
              setXpVal(parsed.xp || 0);
              setXpRequiredVal(parsed.xp_required || 1000);
            } catch (e) { }
          }
        } else {
          // Fallback level for other public profiles
          const seed = username.length;
          const userLevel = 10 + (seed % 15);
          setLevelVal(userLevel);
          setXpVal(Math.floor(500 * Math.pow(userLevel, 1.1) * 0.4));
          setXpRequiredVal(Math.floor(500 * Math.pow(userLevel, 1.2)));
        }
      }

    } catch (err) {
      console.error(err);
      setPosts([]);
      setPublicTrades([]);
      setTotalTradesCount(0);
      setWinRateVal("0%");
      setStreakVal("0 Days");
      setRoiVal("0.00%");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollowUser = useCallback(async (targetUserId: string, targetName: string) => {
    // Block follows on placeholder/non-DB profiles
    if (!targetUserId || targetUserId === 'not-found' || targetUserId.startsWith('mock-')) {
      toast.error("This user hasn't set up their profile yet.");
      return;
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      toast.error("Please login to follow traders.");
      return;
    }
    if (targetUserId === currentUser.id) {
      toast.error("You cannot follow yourself.");
      return;
    }

    const isFollowing = followedUsers[targetUserId] || false;

    try {
      if (isFollowing) {
        // Unfollow
        setFollowedUsers(prev => ({ ...prev, [targetUserId]: false }));
        if (targetUserId === profile?.id) {
          setFollowerCount(prev => Math.max(0, prev - 1));
        }
        const { error } = await supabase
          .from('social_follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
        toast.info(`Unfollowed ${targetName}`);
      } else if (hasRequested && targetUserId === profile?.id) {
        // Cancel pending request
        setHasRequested(false);
        const { error } = await supabase
          .from('social_follow_requests')
          .delete()
          .eq('requester_id', currentUser.id)
          .eq('target_id', targetUserId);
        if (error) throw error;
        toast.info("Follow request cancelled");
      } else {
        // Try to follow
        // We only use the local privacy settings if we are on their page
        const isTargetPrivate = targetUserId === profile?.id ? privacySettings.is_private : false;

        if (isTargetPrivate) {
          // Send follow request
          setHasRequested(true);
          const { error } = await supabase
            .from('social_follow_requests')
            .insert([{ requester_id: currentUser.id, target_id: targetUserId }]);
          if (error) throw error;
          toast.success("Follow request sent");
        } else {
          // Direct follow
          setFollowedUsers(prev => ({ ...prev, [targetUserId]: true }));
          if (targetUserId === profile?.id) {
            setFollowerCount(prev => prev + 1);
          }
          const { error } = await supabase
            .from('social_follows')
            .insert([{ follower_id: currentUser.id, following_id: targetUserId }]);
          if (error) throw error;
          toast.success(`Followed ${targetName}`);
        }
      }
    } catch (err: any) {
      console.error("Error toggling follow:", err);
      toast.error("Failed to update follow status.");
      // The optimistic UI updates would be slightly complex to fully revert here reliably 
      // without refreshing, but a full reload isn't needed usually.
    }
  }, [followedUsers, hasRequested, profile?.id, privacySettings.is_private]);

  const handleFollowStatClick = (type) => {
    if (!profile?.id || profile.id === 'not-found' || profile.id.startsWith('mock-')) return;
    const isOwnProfile = currentUserId === profile.id;
    const isPrivate = privacySettings.is_private;
    const isFollowing = followedUsers[profile.id];
    if (!isOwnProfile && isPrivate && !isFollowing) {
      toast.error(`This account is private. Follow to see their ${type}.`);
      return;
    }
    setFollowListState({ isOpen: true, type });
  };

  const navigate = useNavigate();

  const handleStartConversation = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { toast.error("Please log in to send messages."); return; }
      const targetId = profile?.id;
      if (!targetId || targetId === 'not-found' || targetId.startsWith('mock-')) {
        toast.error("This user hasn't set up their profile yet."); return;
      }
      if (authUser.id === targetId) { toast.error("You cannot message yourself."); return; }
      // Block if private and NOT a confirmed follower.
      // hasRequested=true = pending request only, NOT approved yet.
      const isPrivate = privacySettings.is_private;
      const isActuallyFollowing = followedUsers[targetId] === true;
      if (isPrivate && !isActuallyFollowing) {
        if (hasRequested) {
          toast.error("Your follow request is still pending. You can message them once they accept.");
        } else {
          toast.error("This account is private. Follow them first to send a message.");
        }
        return;
      }
      const user1_id = authUser.id < targetId ? authUser.id : targetId;
      const user2_id = authUser.id > targetId ? authUser.id : targetId;
      const { data: existing } = await supabase
        .from('dm_conversations').select('id')
        .eq('user1_id', user1_id).eq('user2_id', user2_id).maybeSingle();
      if (existing) {
        navigate(`/inbox?conv=${existing.id}&partnerId=${targetId}&focus=true`);
        return;
      }
      const { data: existingReversed } = await supabase
        .from('dm_conversations').select('id')
        .eq('user1_id', user2_id).eq('user2_id', user1_id).maybeSingle();
      if (existingReversed) {
        navigate(`/inbox?conv=${existingReversed.id}&partnerId=${targetId}&focus=true`);
        return;
      }
      const { data: created, error } = await supabase
        .from('dm_conversations')
        .insert({ user1_id, user2_id, last_message_at: new Date().toISOString() })
        .select().single();
      if (error) {
        console.error(error);
        navigate(`/inbox?partnerId=${targetId}&focus=true`);
        return;
      }
      navigate(`/inbox?conv=${created.id}&partnerId=${targetId}&focus=true`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      navigate('/inbox');
    }
  };

  const handleLikePost = useCallback(async (postId) => {
    if (!currentUserId) { toast.error("Please log in to like posts."); return; }
    const isCurrentlyLiked = likedPosts[postId] || false;
    const nextLiked = !isCurrentlyLiked;
    setLikedPosts(prev => ({ ...prev, [postId]: nextLiked }));
    setLikesOffsets(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (nextLiked ? 1 : -1) }));
    try {
      if (nextLiked) {
        await supabase.from('social_post_likes').insert([{ post_id: postId, user_id: currentUserId }]);
      } else {
        await supabase.from('social_post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
      }

    } catch (err) { console.error("Error toggling like:", err); }
  }, [currentUserId, likedPosts]);

  const handleBookmarkPost = useCallback(async (postId) => {
    if (!currentUserId) { toast.error("Please log in to bookmark posts."); return; }
    const isCurrentlyBookmarked = bookmarkedPosts[postId] || false;
    const nextBookmarked = !isCurrentlyBookmarked;
    setBookmarkedPosts(prev => {
      const next = { ...prev, [postId]: nextBookmarked };
      localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(next));
      return next;
    });

    try {
      if (nextBookmarked) {
        await supabase.from('social_post_bookmarks').insert([{ post_id: postId, user_id: currentUserId }]);
        toast.success("Post saved to bookmarks!");
      } else {
        await supabase.from('social_post_bookmarks').delete().eq('post_id', postId).eq('user_id', currentUserId);
        toast.info("Post removed from bookmarks.");
      }
      const { data: postData } = await supabase.from('social_posts').select('bookmark_count').eq('id', postId).single();
      const currentCount = postData?.bookmark_count || 0;
      const newCount = nextBookmarked ? currentCount + 1 : Math.max(0, currentCount - 1);
      await supabase.from('social_posts').update({ bookmark_count: newCount }).eq('id', postId);

      // Refresh saved posts list!
      const savedPostsRes = await supabase
        .from('social_post_bookmarks')
        .select('post_id, social_posts(*)')
        .eq('user_id', currentUserId);
      if (savedPostsRes.data) {
        const rawSaved = savedPostsRes.data.map((b: any) => b.social_posts).filter(Boolean);
        const authorIds = Array.from(new Set(rawSaved.map((p: any) => p.user_id).filter(Boolean)));
        let profMap: Record<string, any> = {};
        if (authorIds.length > 0) {
          const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url, username, display_name, bio, banner_url').in('id', authorIds);
          if (profs) profs.forEach((pr: any) => { profMap[pr.id] = pr; });
        }
        const parsedSavedPosts = rawSaved.map((p: any) => ({
          ...p,
          profiles: profMap[p.user_id] || null
        }));
        setSavedPosts(parsedSavedPosts);
      }
    } catch (err) { console.error("Error toggling bookmark:", err); }
  }, [currentUserId, bookmarkedPosts]);

  const formatCount = (baseVal, offset) => {
    const total = Math.max(0, baseVal + offset);
    if (total >= 1000) return (total / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return total.toString();
  };

  const headerActions = (
    <div className="flex items-center gap-4">
    </div>
  );

  const handleVote = useCallback(async (postId, updatedMediaUrl) => {
    try {
      await supabase.from('social_posts').update({ media_url: updatedMediaUrl }).eq('id', postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, media_url: updatedMediaUrl } : p));
    } catch (error) {
      console.error("Error saving vote:", error);
    }
  }, []);

  const handleDeletePost = useCallback(async (postId: any) => {
    const postIdStr = String(postId);
    setPosts(prev => prev.filter(p => String(p.id) !== postIdStr));

    try {
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const updatedLocal = localPosts.filter((p: any) => String(p.id) !== postIdStr);
      localStorage.setItem('fialgo_local_posts', JSON.stringify(updatedLocal));

      const cachedFeeds = JSON.parse(localStorage.getItem('home_cache_feeds') || '[]');
      const updatedCache = cachedFeeds.filter((p: any) => String(p.id) !== postIdStr);
      localStorage.setItem('home_cache_feeds', JSON.stringify(updatedCache));

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('prof_cache_posts_')) {
          try {
            const arr = JSON.parse(localStorage.getItem(k) || '[]');
            const filtered = arr.filter((p: any) => String(p.id) !== postIdStr);
            localStorage.setItem(k, JSON.stringify(filtered));
          } catch (_) {}
        }
      }

      const deletedIds = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
      if (!deletedIds.includes(postIdStr)) {
        deletedIds.push(postIdStr);
        localStorage.setItem('tradifive_deleted_post_ids', JSON.stringify(deletedIds.slice(-500)));
      }
    } catch (_) {}

    toast.success("Post deleted successfully!");

    try {
      if (!postIdStr.startsWith('local-')) {
        await Promise.allSettled([
          supabase.from('social_post_likes').delete().eq('post_id', postId),
          supabase.from('social_post_bookmarks').delete().eq('post_id', postId),
          supabase.from('social_post_comments').delete().eq('post_id', postId),
        ]);
        await supabase.from('social_posts').delete().eq('id', postId);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }, []);

  const userFeedsRender = useMemo(() => {
    const filteredPosts = posts.filter((p: any) => {
      if (activeTab === "All") {
        return true;
      } else if (activeTab === "Posts") {
        return p.media_type !== 'video' && !p.is_reply;
      } else if (activeTab === "Replies") {
        return p.is_reply || p.parent_id;
      } else if (activeTab === "Trades") {
        return p.is_trade || p.type === 'trade' || p.trade_details;
      } else if (activeTab === "Strategies") {
        return p.is_strategy || p.type === 'strategy';
      }
      return true;
    });

    if (filteredPosts.length === 0) {
      return (
        <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none text-center py-12 flex flex-col items-center justify-center">
          <p className="text-slate-500 dark:text-[#999] text-sm font-bold">No Posts Available</p>
        </div>
      );
    }
    return filteredPosts.map((post: any) => {
      const isLiked = likedPosts[post.id] || false;
      return (
        <FeedCard
          key={post.id}
          feed={post}
          currentUserId={currentUserId || ""}
          followedUsers={followedUsers}
          onToggleFollow={toggleFollowUser}
          isLiked={isLiked}
          likes={Math.max(0, (post.like_count ?? post.likes_count ?? 0) + (likesOffsets[post.id] || 0))}
          onLike={handleLikePost}
          onVote={handleVote}
          onDelete={handleDeletePost}
        />
      );
    });
  }, [posts, likedPosts, followedUsers, currentUserId, likesOffsets, handleLikePost, handleVote, handleDeletePost, toggleFollowUser, activeTab, profile]);

  const savedFeedsRender = useMemo(() => {
    if (savedPosts.length === 0) {
      return (
        <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none text-center py-12 flex flex-col items-center justify-center">
          <p className="text-slate-500 dark:text-[#999] text-sm font-bold">No Saved Posts Available</p>
        </div>
      );
    }
    return savedPosts.map((post: any) => {
      const isLiked = likedPosts[post.id] || false;
      return (
        <FeedCard
          key={post.id}
          feed={post}
          currentUserId={currentUserId || ""}
          followedUsers={followedUsers}
          onToggleFollow={toggleFollowUser}
          isLiked={isLiked}
          likes={Math.max(0, (post.like_count ?? post.likes_count ?? 0) + (likesOffsets[post.id] || 0))}
          onLike={handleLikePost}
          onVote={handleVote}
          onDelete={handleDeletePost}
        />
      );
    });
  }, [savedPosts, likedPosts, followedUsers, currentUserId, likesOffsets, handleLikePost, handleVote, handleDeletePost, toggleFollowUser]);

  const isLocked = privacySettings.is_private && !followedUsers[profile?.id ?? ''] && currentUserId !== profile?.id;

  const safeTradesCount = isLocked ? 0 : totalTradesCount;
  const safeWinRate = isLocked ? "0%" : displayWinRate;
  const safeRoi = isLocked ? "0.00%" : displayRoi;
  const safeAvgRR = isLocked ? "0" : displayAvgRR;
  const safeStreak = isLocked ? "0 Days" : displayStreak;

  const safeAdvMetrics = isLocked ? {
    totalPnlPercent: "+0.0%",
    chartPath: "M0,20 L100,20",
    profitFactor: "0.00",
    expectancy: "0.00",
    maxDrawdown: "0.0%",
    consistencyScore: 0,
    emotionalDiscipline: 0,
    revengeRisk: "Low",
    confidenceScore: 0,
    bestSession: "N/A",
    suggestedImprovement: "N/A"
  } : advMetrics;

  return (
    <DashboardLayout breadcrumbs={[{ label: "Home", path: "/home" }, { label: `@${username || "user"}`, path: `/user/${username || "user"}` }]} headerActions={headerActions} noScroll={true} noPadding={true}>
      <div className="w-full h-full flex flex-col min-h-0 px-3 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-24 md:pb-10 overflow-y-auto amazing-scrollbar select-none font-sans text-slate-800 dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#000000]">
        <div className="max-w-4xl mx-auto w-full space-y-5">

          {/* --- UNIFIED PROFILE CONTENT --- */}
          <div className="space-y-5">

            {/* Header Card (Matching Reference Image 1 Layout) */}
            <div className="bg-white dark:bg-[#1A1A1E] rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-sm relative">
              {/* Cover Banner */}
              <div className="h-44 sm:h-56 w-full relative bg-slate-900 overflow-hidden">
                {/* Top-Left Back Button Overlay (Matching Reference Pic) */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute top-3.5 left-3.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                  title="Go Back"
                  aria-label="Go Back"
                >
                  <ChevronLeft size={20} strokeWidth={2.4} />
                </button>

                {/* Top-Right 3-Dot More Button Overlay (Matching Reference Pic) */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="absolute top-3.5 right-3.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreHorizontal size={20} strokeWidth={2.4} />
                </button>

                {loading ? (
                  <div className="w-full h-full animate-pulse bg-slate-350 dark:bg-[#1E1E1E]" />
                ) : (
                  <div className="w-full h-full relative">
                    {(!profile?.banner_url || profile.banner_url === "/default-cover.png") ? (
                      <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-slate-600 dark:text-slate-700 relative">
                        <Camera size={32} className="opacity-20" />
                      </div>
                    ) : (
                      <img
                        src={profile.banner_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Profile Details Area */}
              <div className="px-5 sm:px-8 pb-6 relative pt-3">
                {/* Top Row: Avatar on left overlapping banner, Action buttons on right (Image 1) */}
                <div className="flex items-end justify-between gap-4">
                  {/* Left: Avatar container overlapping cover */}
                  <div className="relative -mt-14 sm:-mt-16 shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#1A1A1E] overflow-hidden bg-white dark:bg-[#1E1E1E] relative shadow-lg">
                      {loading ? (
                        <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                      ) : (
                        <img
                          src={profile?.avatar_url || "/default-avatar.svg"}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons (Consistent Black Tactile Pill Style) */}
                  <div className="flex items-center gap-2 sm:gap-2.5 pb-1 flex-wrap justify-end">
                    {/* Follow button */}
                    <button
                      type="button"
                      onClick={() => profile?.id && toggleFollowUser(profile.id, profile.display_name)}
                      className={`flex items-center justify-center gap-1.5 px-6 py-2 rounded-full text-[13.5px] font-bold whitespace-nowrap cursor-pointer select-none ${
                        followedUsers[profile?.id]
                          ? "tactile-white-pill"
                          : "tactile-black-pill"
                      }`}
                    >
                      {followedUsers[profile?.id] ? <><UserCheck size={14} strokeWidth={2.4} /> Following</> : (hasRequested ? <><Clock size={14} strokeWidth={2.4} /> Requested</> : "Follow")}
                    </button>

                    {/* Message button */}
                    <button
                      type="button"
                      onClick={handleStartConversation}
                      className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full tactile-black-pill text-[13.5px] font-bold whitespace-nowrap cursor-pointer select-none"
                    >
                      <MessageSquare size={14} strokeWidth={2.4} /> Message
                    </button>

                    {/* Channel button (conditional) */}
                    {userChannel && (
                      <Link to={`/channel/${userChannel.id}`} className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full tactile-white-pill text-[13px] font-bold whitespace-nowrap select-none">
                        <Radio size={14} /> Channel
                      </Link>
                    )}
                  </div>
                </div>

                {/* Profile Identity & Info (Exact typography and metadata alignment from Reference Image 1) */}
                <div className="mt-3 text-left">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 leading-tight tracking-tight">
                    {loading ? (
                      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
                    ) : (
                      <>
                        {profile?.display_name || profile?.full_name || (!isUUID(username || '') ? username : "Anonymous Trader")}
                        {profile?.account_type === 'creator' && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
                            <Crown size={12} className="text-purple-600 dark:text-purple-400" />
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Creator</span>
                          </div>
                        )}
                      </>
                    )}
                  </h1>

                  {/* Handle & Joined Date on same line (Reference Image 1: @alphonso · Joined Oct 2026) */}
                  <div className="text-[13.5px] font-medium text-slate-500 dark:text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>@{profile?.username || (!isUUID(username || '') ? username : "trader")}</span>
                    <span>·</span>
                    <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026'}</span>
                  </div>

                  {/* Following & Followers counts (Reference Image 1: 4 following  2 followers) */}
                  <div className="flex items-center gap-4 text-[13.5px] text-slate-500 dark:text-neutral-400 mt-2 select-none">
                    <span onClick={() => handleFollowStatClick('following')} className="cursor-pointer hover:underline">
                      <strong className="text-slate-900 dark:text-white font-extrabold">{Math.max(0, followingCount)}</strong> following
                    </span>
                    <span onClick={() => handleFollowStatClick('followers')} className="cursor-pointer hover:underline">
                      <strong className="text-slate-900 dark:text-white font-extrabold">{Math.max(0, followerCount)}</strong> followers
                    </span>
                  </div>

                  {/* Bio */}
                  {profile?.bio && (
                    <div className="text-[14px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-3 max-w-2xl whitespace-pre-wrap">
                      {profile.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* --- QUICK STATS: COMPACT 1-LINE ROW (All 5 fit in 1 Line as requested in Image 2) --- */}
              {(() => {
                const visibleCards = [
                  { title: "Trades", value: safeTradesCount.toLocaleString(), isHidden: (!privacySettings.show_trades || isLocked), icon: <BarChart2 size={13} className="text-blue-500" />, color: "bg-blue-500/10 text-blue-600" },
                  { title: "Win Rate", value: safeWinRate, isHidden: (!privacySettings.show_winrate || isLocked), icon: <CheckCircle2 size={13} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600" },
                  { title: "ROI (All Time)", value: safeRoi, isHidden: (!privacySettings.show_roi || isLocked), icon: <TrendingUp size={13} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600", highlighted: true },
                  { title: "Avg RR", value: safeAvgRR, isHidden: (!privacySettings.show_avg_rr || isLocked), icon: <Target size={13} className="text-purple-500" />, color: "bg-purple-500/10 text-purple-600" },
                  { title: "Streak", value: safeStreak, isHidden: (!privacySettings.show_streak || isLocked), icon: <Flame size={13} className="text-orange-500" />, color: "bg-orange-500/10 text-orange-600" }
                ].filter(card => !card.isHidden);

                if (visibleCards.length === 0) return null;

                return (
                  <div
                    className="grid gap-1.5 sm:gap-3 w-full"
                    style={{ gridTemplateColumns: `repeat(${visibleCards.length}, minmax(0, 1fr))` }}
                  >
                    {visibleCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 px-2 sm:py-3 sm:px-3.5 rounded-[14px] sm:rounded-2xl bg-white dark:bg-[#1E1E1E] figma-card-shadow flex flex-col justify-between min-w-0 transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1 sm:mb-1.5">
                          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">
                            {card.title}
                          </span>
                          <div className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg ${card.color} shrink-0`}>
                            {card.icon}
                          </div>
                        </div>
                        <p className={`text-[13px] sm:text-[17px] md:text-[19px] font-extrabold leading-tight font-sans tracking-tight truncate ${card.highlighted ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                          {card.value}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* --- TRADING PERFORMANCE CARD (Compact; visible if enabled in Settings) --- */}
              {!isLocked && privacySettings.show_performance !== false && (
                <div className="bg-white dark:bg-[#1E1E1E] p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] figma-card-shadow relative overflow-hidden">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] sm:text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Trading Performance</h3>

                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-[#F4F5F7] dark:bg-[#2A2A2A] px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-xs cursor-pointer flex items-center gap-1 select-none active:scale-95 transition-all">
                        All Time <ArrowRight size={9} className="rotate-90 text-slate-500" />
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center">

                      {/* Left part: Total PnL Label & compact Line Chart */}
                      <div className="col-span-5 flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total PnL</span>
                        <span className={`text-lg sm:text-xl font-extrabold tracking-tight leading-none mt-1.5 font-sans ${safeAdvMetrics.totalPnlPercent.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {safeAdvMetrics.totalPnlPercent}
                        </span>

                        <div className="h-12 sm:h-14 w-full mt-2 relative">
                          <svg className={`w-full h-full filter ${safeAdvMetrics.totalPnlPercent.startsWith('-') ? 'drop-shadow-[0_3px_6px_rgba(244,63,94,0.2)]' : 'drop-shadow-[0_3px_6px_rgba(59,130,246,0.2)]'}`} viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path
                              d={safeAdvMetrics.chartPath}
                              fill="none"
                              stroke={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            <path
                              d={`${safeAdvMetrics.chartPath} L100,40 L0,40 Z`}
                              fill="url(#pnlGrad)"
                            />
                            <circle cx="100" cy={safeAdvMetrics.chartPath.split(',').pop() || 3} r="3" fill={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} className="animate-ping" />
                            <circle cx="100" cy={safeAdvMetrics.chartPath.split(',').pop() || 3} r="2" fill={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} />
                          </svg>
                        </div>
                      </div>

                      {/* Right part: compact stats list */}
                      <div className="col-span-7 space-y-1.5 pl-3 sm:pl-4 border-l border-slate-200/80 dark:border-white/5">
                        {[
                          { label: "Profit Factor", value: safeAdvMetrics.profitFactor, color: "text-blue-500", icon: <BarChart2 size={11} className="text-blue-500" /> },
                          { label: "Expectancy", value: safeAdvMetrics.expectancy, color: safeAdvMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500", icon: <TrendingUp size={11} className={safeAdvMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500"} /> },
                          { label: "Max Drawdown", value: safeAdvMetrics.maxDrawdown, color: "text-rose-500", highlighted: true, icon: <Scale size={11} className="text-rose-500" /> },
                          { label: "Consistency", value: `${safeAdvMetrics.consistencyScore}%`, color: "text-blue-500", icon: <CheckCircle2 size={11} className="text-blue-500" />, showInfo: true }
                        ].map((stat, i) => (
                          <div key={i} className="flex justify-between items-center text-[10.5px] sm:text-[11.5px] gap-1">
                            <span className="font-bold text-slate-500 dark:text-[#999] flex items-center gap-1.5 min-w-0">
                              <div className="p-1 rounded-md bg-slate-100 dark:bg-white/5 shrink-0">
                                {stat.icon}
                              </div>
                              <span className="flex items-center gap-1 font-semibold truncate">
                                {stat.label}
                                {stat.showInfo && <Info size={10} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0" />}
                              </span>
                            </span>
                            <span className={`font-bold tracking-tight font-sans shrink-0 ${stat.highlighted ? 'text-rose-500' : 'text-slate-900 dark:text-[#EEE]'}`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* --- TRADING STREAK & CALENDAR ROW (Compact; controlled by Settings) --- */}
              {!isLocked && (privacySettings.show_streak !== false || privacySettings.show_calendar !== false) && (
                <div className={`grid grid-cols-1 ${(privacySettings.show_streak !== false && privacySettings.show_calendar !== false) ? 'sm:grid-cols-2' : ''} gap-3 w-full`}>

                  {/* Trading Streak Card */}
                  {privacySettings.show_streak !== false && (
                    <div className="p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-white dark:bg-[#1E1E1E] figma-card-shadow flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-[11px] sm:text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-orange-500/10 text-orange-500">
                            <Flame size={12} className="fill-orange-500/15" />
                          </span>
                          <span>Trading Streak</span>
                        </h3>
                        <span className="text-[12.5px] font-extrabold text-orange-500 leading-none">{safeStreak}</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                        <span>Current Streak</span>
                        <span>Best: <strong className="text-slate-900 dark:text-white font-extrabold">{Math.max(bestStreak, profile?.best_streak || 0)} Day{Math.max(bestStreak, profile?.best_streak || 0) !== 1 ? 's' : ''}</strong></span>
                      </div>

                      {/* Last 15 Days Dot Indicators */}
                      <div className="flex items-center justify-between gap-1 py-0.5">
                        {(streakDots.length > 0 ? streakDots : Array.from({ length: 15 }, () => ({ date: '', status: 'gray' as const }))).map((dot, idx) => (
                          <span
                            key={idx}
                            title={dot.date ? `${dot.date} — ${dot.status === 'green' ? 'Profitable' : dot.status === 'red' ? 'Loss' : 'No Trade'}` : 'No Trade'}
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full block transition-transform hover:scale-125 ${
                              dot.status === 'green'
                                ? 'bg-[#10b981] shadow-[0_0_5px_rgba(16,185,129,0.4)]'
                                : dot.status === 'red'
                                  ? 'bg-[#ef4444] shadow-[0_0_5px_rgba(239,68,68,0.35)]'
                                  : 'bg-slate-200 dark:bg-white/10'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between text-[9px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider leading-none">
                        <span>
                          {streakDots.length > 0 && streakDots[0].date
                            ? (() => {
                                const d = new Date(streakDots[0].date);
                                return isNaN(d.getTime()) ? '15 Days Ago' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                              })()
                            : '15 Days Ago'}
                        </span>
                        <span>Today</span>
                      </div>
                    </div>
                  )}

                  {/* Performance Calendar Card */}
                  {privacySettings.show_calendar !== false && (
                    <div className="p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-white dark:bg-[#1E1E1E] figma-card-shadow flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-[11px] sm:text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                            <Calendar size={12} />
                          </span>
                          <span>Calendar</span>
                        </h3>

                        {/* Interactive Month Navigation */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            aria-label="Previous month"
                          >
                            <ChevronDown size={12} className="rotate-90" />
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F4F5F7] dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-200 text-[10px] font-extrabold uppercase tracking-wider border border-slate-200/60 dark:border-white/10 select-none min-w-[78px] text-center">
                            {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            aria-label="Next month"
                          >
                            <ChevronDown size={12} className="-rotate-90" />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Real-Data Heatmap Grid */}
                      <div className="space-y-1">
                        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d.substring(0, 1)}</span>)}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const year = calendarMonth.getFullYear();
                            const month = calendarMonth.getMonth();
                            const firstDay = new Date(year, month, 1);
                            const lastDay = new Date(year, month + 1, 0);
                            const startOffset = (firstDay.getDay() + 6) % 7;
                            const cells: React.ReactNode[] = [];

                            for (let i = 0; i < startOffset; i++) {
                              cells.push(<span key={`empty-${i}`} className="h-[20px] sm:h-[22px]" />);
                            }

                            const todayDate = new Date();
                            const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

                            for (let day = 1; day <= lastDay.getDate(); day++) {
                              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const status = calendarDayMap[key];
                              const isToday = key === todayStr;

                              let cellClass = "h-[20px] sm:h-[22px] w-full rounded-[5px] flex items-center justify-center text-[9px] font-bold transition-all ";
                              if (status === 'green') {
                                cellClass += "bg-[#10b981]/20 text-emerald-700 dark:bg-[#10b981]/30 dark:text-emerald-300 border border-[#10b981]/30";
                              } else if (status === 'red') {
                                cellClass += "bg-[#ef4444]/15 text-rose-700 dark:bg-[#ef4444]/25 dark:text-rose-300 border border-[#ef4444]/25";
                              } else {
                                cellClass += "bg-slate-100/90 dark:bg-white/[0.04] text-slate-400 dark:text-neutral-500 border border-slate-200/40 dark:border-white/5";
                              }
                              if (isToday) {
                                cellClass += " ring-1.5 ring-slate-900 dark:ring-white ring-offset-1 dark:ring-offset-[#1E1E1E]";
                              }

                              cells.push(
                                <span
                                  key={key}
                                  className={cellClass}
                                  title={`${key}${status === 'green' ? ' — Profitable' : status === 'red' ? ' — Loss' : ' — No Trade'}`}
                                >
                                  {day}
                                </span>
                              );
                            }

                            return cells;
                          })()}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-[2px] bg-[#10b981]" /> Profitable
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-[2px] bg-[#ef4444]" /> Loss
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-[2px] bg-slate-200 dark:bg-white/10" /> No Trade
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* --- BIG FULL-WIDTH SYSTEMIC TABS BAR (Matching Reference Pic 2) --- */}
              <div className="flex items-center w-full border-b border-slate-200 dark:border-white/10 pt-2 relative z-10 overflow-x-auto no-scrollbar">
                {isLocked ? (
                  <div className="py-3.5 text-slate-500 dark:text-[#999] text-sm font-bold w-full text-center">
                    <ShieldCheck size={20} className="inline-block mr-2 text-slate-400" />
                    Posts and Trades are private
                  </div>
                ) : (
                  ["All", "Posts", "Replies", "Trades", "Strategies"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-[74px] flex items-center justify-center pb-3.5 pt-2.5 text-[15px] sm:text-[16px] tracking-tight cursor-pointer transition-all relative select-none shrink-0 ${
                        activeTab === tab
                          ? "font-bold text-slate-900 dark:text-white"
                          : "font-semibold text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-[3.5px] bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Feed Posts List */}
                <div className="md:col-span-12 max-w-4xl mx-auto w-full space-y-6">
                  <div className="pt-2 min-h-[300px] flex flex-col space-y-3">
                    {isLocked ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
                        <ShieldCheck size={48} className="text-slate-300 dark:text-slate-400 mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-[#EEE]">Account is Private</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">Follow this user to view their complete timeline and trading history.</p>
                      </div>
                    ) : activeTab === "Achievements" ? (
                      <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Trophy size={16} className="text-blue-500" />
                            <span>Trader Badges & Level Progress</span>
                          </h3>
                          <span className="bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-blue-500/20 shadow-sm uppercase tracking-wider">
                            Rank: Vanguard
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Active Level Widget */}
                          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1E]/40 border border-slate-150 dark:border-white/5 shadow-sm flex flex-col justify-between h-[120px]">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Progression Level</span>
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">Level {levelVal}</span>
                              </div>
                              <Crown size={22} className="text-amber-500 fill-amber-500/20" />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold text-slate-455">
                                <span>XP: {xpVal} / {xpRequiredVal}</span>
                                <span>{Math.round((xpVal / xpRequiredVal) * 100)}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(xpVal / xpRequiredVal) * 100}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Discipline Level Modifier */}
                          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1E]/40 border border-slate-150 dark:border-white/5 shadow-sm flex flex-col justify-between h-[120px]">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Discipline Score</span>
                                <span className="text-2xl font-extrabold text-emerald-500 mt-1 block">{profile?.discipline_score || '0'}%</span>
                              </div>
                              <ShieldCheck size={22} className="text-emerald-500" />
                            </div>
                            <div className="text-[10.5px] text-slate-500 dark:text-[#999] font-semibold leading-relaxed">
                              User rank status is stable. Maintain &gt;75% score to preserve premium badge benefits.
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Achievements Ledger ({(profile?.achievements || []).length} Unlocked)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {profile?.achievements && profile.achievements.length > 0 ? (
                              profile.achievements.map((badge: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 bg-white dark:bg-[#1E1E1E]/30 border-slate-150 dark:border-white/5 hover:border-[#444]`}
                                >
                                  <div className="p-2.5 rounded-xl shrink-0 bg-blue-500/10 text-blue-500">
                                    <Trophy size={18} />
                                  </div>
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex justify-between items-center gap-2">
                                      <h5 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">{badge.name}</h5>
                                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                                        COMPLETED
                                      </span>
                                    </div>
                                    <p className="text-[10.5px] text-slate-500 dark:text-[#999] leading-snug font-medium">{badge.description || "Achievement Unlocked"}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-1 sm:col-span-2 py-10 text-center text-slate-400 dark:text-slate-400 text-xs font-semibold border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                                No achievements unlocked yet in the ledger.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : activeTab === "Trades" ? (
                      !privacySettings.show_trades ? (
                        <div className="p-12 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col items-center justify-center gap-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E1E1E] border-2 border-white dark:border-white/5 shadow-md flex items-center justify-center text-slate-400 dark:text-slate-400 animate-pulse">
                            <Shield size={28} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Trading Ledger is Private</h4>
                            <p className="text-xs text-slate-500 dark:text-[#999] max-w-sm font-medium">This trader has disabled public visibility for their verified execution ledger.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Synchronized Execution Ledger</h3>
                            <span className="text-[11px] font-bold text-[#393939] dark:text-[#E2E8F0] bg-white dark:bg-[#1E1E1E] px-3.5 py-1.5 rounded-full border-2 border-white dark:border-white/5 shadow-sm select-none">
                              Verified Execution
                            </span>
                          </div>

                          <div className="overflow-x-auto amazing-scrollbar">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <th className="pb-3 pl-2">Ticket</th>
                                  <th className="pb-3">Symbol</th>
                                  <th className="pb-3">Type</th>
                                  <th className="pb-3 text-right">Size</th>
                                  <th className="pb-3 text-right">Profit</th>
                                  <th className="pb-3 text-right pr-2">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40 text-xs font-bold">
                                {publicTrades.map((trade) => {
                                  const isWin = Number(trade.profit) > 0;
                                  return (
                                    <tr key={trade.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C2335]/30 transition-colors">
                                      <td className="py-3.5 pl-2 font-mono text-slate-500">#{trade.ticket}</td>
                                      <td className="py-3.5 flex items-center gap-1.5">
                                        <span>{trade.symbol.includes("XAU") ? "🇺🇸" : (trade.symbol.includes("BTC") ? "🪙" : "🇪🇺")}</span>
                                        <span className="text-slate-900 dark:text-white">{trade.symbol}</span>
                                      </td>
                                      <td className="py-3.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.trade_type === 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                          {trade.trade_type === 0 ? 'BUY' : 'SELL'}
                                        </span>
                                      </td>
                                      <td className="py-3.5 text-right font-mono text-slate-655 dark:text-[#CCC]">{Number(trade.lot_size).toFixed(2)}</td>
                                      <td className={`py-3.5 text-right font-mono ${isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {isWin ? '+' : ''}${Number(trade.profit).toFixed(2)}
                                      </td>
                                      <td className="py-3.5 text-right font-mono text-slate-400 pr-2">
                                        {new Date(trade.closed_at || trade.created_at).toLocaleDateString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    ) : activeTab === "Saved" ? (
                      savedFeedsRender
                    ) : posts.length === 0 ? (
                      <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none text-center py-12 flex flex-col items-center justify-center">
                        <p className="text-slate-500 dark:text-[#999] text-sm font-bold">No Posts Available</p>
                      </div>
                    ) : (
                      userFeedsRender
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <FollowListModal
        isOpen={followListState.isOpen}
        onClose={() => setFollowListState({ ...followListState, isOpen: false })}
        userId={profile?.id}
        type={followListState.type}
      />

      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile || {}}
      />
    </DashboardLayout>
  );
}

// Get post user helper function
function getPostUser(post: any) {
  if (post.profiles) {
    return {
      name: post.profiles.display_name || post.profiles.username || "User",
      username: post.profiles.username || "user",
      avatar: post.profiles.avatar_url || "/default-avatar.svg"
    };
  }
  return {
    name: "Guest Trader",
    username: "guest_trader",
    avatar: "/default-avatar.svg"
  };
}
