import React, { useState, useEffect, useMemo, useCallback } from "react";
import { addXP } from "@/utils/gamification";
import DashboardLayout from "@/components/DashboardLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2, MapPin, Calendar, MoreHorizontal,
  Search, Heart, MessageCircle, Bookmark, Share2,
  TrendingUp, Globe, Flame, ShieldCheck, Trophy,
  Star, BarChart2, FileText, Shield, Info, Target, Scale,
  Crown, ArrowRight, ChevronDown, Radio, Play, UserPlus, UserCheck, Mail, Lock, Clock, Camera
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import FeedCard from "@/components/FeedCard";
import { toast } from "sonner";
import { calculateTradingMetrics } from "@/utils/tradeMetrics";
import { FollowListModal } from "@/components/FollowListModal";
import { CommentModal } from "@/components/CommentModal";

// Placeholder display names to filter out from suggestions
const PLACEHOLDER_NAMES = ["new trader", "guest trader", "demo trader", "trader", "guest"];

// --- MOCK FALLBACK TRADES ---
const MOCK_TRADES_FALLBACK = [
  { id: "t1", ticket: "8472910", symbol: "XAUUSD", profit: 1420.50, trade_type: 0, lot_size: 2.0, closed_at: new Date(Date.now() - 3600000 * 4).toISOString(), created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "t2", ticket: "8472911", symbol: "EURUSD", profit: -340.00, trade_type: 1, lot_size: 1.5, closed_at: new Date(Date.now() - 3600000 * 12).toISOString(), created_at: new Date(Date.now() - 3600000 * 13).toISOString() },
  { id: "t3", ticket: "8472912", symbol: "GBPUSD", profit: 890.20, trade_type: 0, lot_size: 1.0, closed_at: new Date(Date.now() - 3600000 * 24).toISOString(), created_at: new Date(Date.now() - 3600000 * 25).toISOString() },
  { id: "t4", ticket: "8472913", symbol: "XAUUSD", profit: 2450.00, trade_type: 0, lot_size: 3.0, closed_at: new Date(Date.now() - 3600000 * 48).toISOString(), created_at: new Date(Date.now() - 3600000 * 50).toISOString() },
  { id: "t5", ticket: "8472914", symbol: "USDCAD", profit: -120.00, trade_type: 1, lot_size: 1.0, closed_at: new Date(Date.now() - 3600000 * 72).toISOString(), created_at: new Date(Date.now() - 3600000 * 73).toISOString() }
];

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
  const [activeTab, setActiveTab] = useState<string>("Posts");
  const [suggestedTraders, setSuggestedTraders] = useState<any[]>([]);

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



  const [advMetrics, setAdvMetrics] = useState<any>(calculateTradingMetrics([]));

  // Privacy Settings state
  const [privacySettings, setPrivacySettings] = useState({
    show_location: true,
    show_winrate: true,
    show_roi: true,
    show_streak: true,
    show_trades: true,
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
        show_streak: true,
        show_trades: true,
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
        const { data: postsData, error: postsErr } = await supabase
          .from('social_posts')
          .select(`*, profiles (*)`)
          .eq('user_id', profileData.id)
          .neq('post_type', 'story')
          .order('created_at', { ascending: false });
        if (!postsErr && postsData) {
          setPosts(postsData);
          setOwnPostsCount(postsData.length);
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
        const { data: bookmarksData, error: bookmarksErr } = await supabase
          .from('social_post_bookmarks')
          .select('post_id, social_posts(*, profiles(id, first_name, last_name, avatar_url, username, display_name, bio, banner_url))')
          .eq('user_id', profileData.id);
        if (!bookmarksErr && bookmarksData) {
          const bookmarkMap: Record<string, boolean> = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
          bookmarksData.forEach((b: any) => { bookmarkMap[b.post_id] = true; });
          setBookmarkedPosts(bookmarkMap);
          const parsedSavedPosts = bookmarksData.map((b: any) => b.social_posts).filter((p: any) => p !== null);
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
        setFollowerCount(prev => prev - 1);
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
      if (existing) { navigate(`/inbox?conv=${existing.id}`); return; }
      const { data: existingReversed } = await supabase
        .from('dm_conversations').select('id')
        .eq('user1_id', user2_id).eq('user2_id', user1_id).maybeSingle();
      if (existingReversed) { navigate(`/inbox?conv=${existingReversed.id}`); return; }
      const { data: created, error } = await supabase
        .from('dm_conversations')
        .insert({ user1_id, user2_id, last_message_at: new Date().toISOString() })
        .select().single();
      if (error) { console.error(error); navigate('/inbox'); return; }
      navigate(`/inbox?conv=${created.id}`);
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
        .select('post_id, social_posts(*, profiles(id, first_name, last_name, avatar_url, username, display_name, bio, banner_url))')
        .eq('user_id', currentUserId);
      if (savedPostsRes.data) {
        const parsedSavedPosts = savedPostsRes.data
          .map((b: any) => b.social_posts)
          .filter((p: any) => p !== null);
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

  const handleDeletePost = useCallback(async (postId) => {
    try {
      await supabase.from('social_posts').delete().eq('id', postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.");
    }
  }, []);

  const userFeedsRender = useMemo(() => {
    const filteredPosts = posts.filter((p: any) => {
      const isTagged = (profile && profile.username && p.content)
        ? p.content.toLowerCase().includes('@' + profile.username.toLowerCase())
        : false;

      if (activeTab === "Posts") {
        return p.media_type !== 'video';
      } else if (activeTab === "Mentions") {
        return isTagged;
      } else if (activeTab === "Videos") {
        return p.media_type === 'video';
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
      <div className="w-full h-full flex flex-col min-h-0 px-4 lg:px-10 pt-6 pb-6 overflow-y-auto amazing-scrollbar select-none font-sans text-slate-800 dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#1E1E1E]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 relative max-w-7xl mx-auto w-full">

          {/* --- LEFT & MIDDLE MAIN CONTENT (col-span-9) --- */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">

            {/* Header Card (Consistent Tactile Neumorphic / Claymorphic Outer container with dual-border & soft shadow specs) */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] overflow-hidden border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none relative">
              {/* Cover Banner */}
              <div className="h-44 sm:h-52 w-full relative bg-slate-900 overflow-hidden border-b border-white/10 dark:border-white/5">
                {loading ? (
                  <div className="w-full h-full animate-pulse bg-slate-350 dark:bg-[#1E1E1E]" />
                ) : (
                  <div className="w-full h-full relative">
                    {(!profile?.banner_url || profile.banner_url === "/default-cover.png") ? (
                      <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-slate-600 dark:text-slate-700">
                        <Camera size={32} className="opacity-20" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={profile.banner_url}
                          alt="Cover"
                          className="w-full h-full object-cover opacity-100"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }}
                        />
                        {/* Subtle bottom shadow just for contrast if needed */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                      </>
                    )}
                  </div>
                )}



              </div>

              {/* Profile Details Area */}
              <div className="px-8 pb-5 relative pt-4">

                {/* Horizontal Layout containing Avatar & Stats top-level row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

                  {/* Left: Avatar container overlapping covers */}
                  <div className="relative -mt-16 sm:-mt-20 shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-white/5 overflow-hidden bg-white dark:bg-[#1E1E1E] relative">
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

                  {/* Right: Stats display horizontally positioned next to the avatar (Using Inter font weights) */}
                  <div className="flex flex-1 justify-around sm:justify-end gap-6 sm:gap-14 w-full sm:w-auto py-2 sm:py-0 text-center sm:text-right">
                    <div className="min-w-[65px] text-center">
                      <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{ownPostsCount}</p>
                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mt-2 leading-none">posts</p>
                    </div>
                    <div className="border-r border-slate-200 dark:border-white/5 h-8 self-center hidden sm:block" />
                    <div
                      onClick={() => handleFollowStatClick('followers')}
                      className="min-w-[75px] text-center cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{followerCount}</p>
                      <p className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider mt-2 leading-none">followers</p>
                    </div>
                    <div className="border-r border-slate-200 dark:border-white/5 h-8 self-center hidden sm:block" />
                    <div
                      onClick={() => handleFollowStatClick('following')}
                      className="min-w-[75px] text-center cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{followingCount}</p>
                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mt-2 leading-none">following</p>
                    </div>

                  </div>

                </div>

                {/* Info and buttons layout below the avatar level */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-end">

                  {/* Left columns: Profile identity labels & pills */}
                  <div className="md:col-span-8 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2 leading-tight">
                      {loading ? (
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
                      ) : (
                        <>
                          {profile?.display_name || profile?.full_name || (!isUUID(username || '') ? username : "Anonymous Trader")}
                          {profile?.account_type === 'creator' && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 ml-2">
                              <Crown size={12} className="text-purple-600 dark:text-purple-400" />
                              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Creator</span>
                            </div>
                          )}
                        </>
                      )}
                    </h1>
                    <div className="text-[13px] font-semibold text-slate-455 dark:text-slate-400 mt-1">
                      {loading ? (
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg inline-block" />
                      ) : (
                        `@${profile?.username || (!isUUID(username || '') ? username : "trader")}`
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-2.5 mb-1.5 select-none">
                      <span className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-655 dark:text-blue-400 text-[10.5px] font-black px-2.5 py-1 rounded-lg border border-blue-500/25 flex items-center gap-1 shadow-sm shrink-0">
                        <Crown size={12} className="text-blue-500" /> Lvl {levelVal}
                      </span>
                      <div className="flex items-center gap-2 flex-1 max-w-[180px] min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-[#1E1E1E] rounded-full overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${Math.min(100, (xpVal / xpRequiredVal) * 100)}%` }} />
                        </div>
                        <span className="text-[9.5px] text-slate-455 dark:text-slate-400 font-bold shrink-0">{xpVal}/{xpRequiredVal} XP</span>
                      </div>
                    </div>
                    <div className="text-[14px] text-slate-700 dark:text-[#CCC] font-semibold leading-relaxed mt-3.5 max-w-xl whitespace-pre-wrap">
                      {profile?.bio || "This user hasn't added a bio yet."}
                    </div>



                    {/* Geographic and join info */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-slate-500 dark:text-[#999] text-xs font-bold mt-5 pt-4 border-t border-slate-200/50 dark:border-white/5">
                      {privacySettings.show_location && (
                        <>
                          <span className="flex items-center gap-1.5">
                            {profile?.country_emoji || "🌍"} <span>{profile?.country || "Not set"}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13.5} className="text-slate-400" /> <span>{profile?.location || "Not set"}</span>
                          </span>
                        </>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13.5} className="text-slate-400" /> <span>Joined Jan 2024</span>
                      </span>
                    </div>
                  </div>

                  {/* Right columns: Compact Action Buttons */}
                  <div className="md:col-span-4 flex items-center justify-center sm:justify-end gap-2.5 w-full pb-2.5">
                    {/* Follow button */}
                    <button
                      onClick={() => profile?.id && toggleFollowUser(profile.id, profile.display_name)}
                      className={`flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-300 border-2 active:scale-95 ${followedUsers[profile?.id]
                          ? 'bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-[#EEE] border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none'
                          : 'bg-gradient-to-b from-[#60A5FA] to-[#3B82F6] dark:bg-none dark:bg-[#1E1E1E] text-white border-[#93C5FD] dark:border-[#3B82F6] shadow-[0_4px_7px_-5px_rgba(59,130,246,0.25),_0_0_0_2px_#3B82F6] dark:shadow-none'
                        }`}
                    >
                      {followedUsers[profile?.id] ? <><UserCheck size={13} /> Following</> : (hasRequested ? <><Clock size={13} /> Requested</> : <><UserPlus size={13} /> Follow</>)}
                    </button>

                    {/* Message button */}
                    <button
                      onClick={handleStartConversation}
                      className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-white dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] text-[12px] font-bold whitespace-nowrap transition-all border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none active:scale-95"
                    >
                      <Mail size={13} /> Message
                    </button>

                    {/* Channel button (conditional) */}
                    {userChannel && (
                      <Link to={`/channel/${userChannel.id}`} className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-[#1A1A1C] text-indigo-600 dark:text-indigo-400 text-[12px] font-bold whitespace-nowrap transition-all border-2 border-indigo-100 dark:border-indigo-800/50 shadow-[0_4px_7px_-5px_rgba(79,70,229,0.15),_0_0_0_2px_#E0E7FF] dark:shadow-none active:scale-95">
                        <Radio size={13} /> Channel
                      </Link>
                    )}

                    {/* More button */}
                    <button className="p-2 rounded-full bg-white dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none active:scale-95 transition-all">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* --- QUICK STATS GRID CARDS (5 Cards) --- */}
              {/* Redesigned to have 100% Tactile claymorphic styling matching mockup box shadow specs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { title: "Trades", value: safeTradesCount.toLocaleString(), isHidden: (!privacySettings.show_trades || isLocked), icon: <BarChart2 size={16} className="text-blue-500" />, color: "bg-blue-500/10 text-blue-600" },
                  { title: "Win Rate", value: safeWinRate, isHidden: (!privacySettings.show_winrate || isLocked), icon: <CheckCircle2 size={16} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600" },
                  { title: "ROI (All Time)", value: safeRoi, isHidden: (!privacySettings.show_roi || isLocked), icon: <TrendingUp size={16} className="text-emerald-500 animate-pulse" />, color: "bg-emerald-500/10 text-emerald-600", highlighted: true },
                  { title: "Avg RR", value: safeAvgRR, isHidden: (!privacySettings.show_winrate || isLocked), icon: <Target size={16} className="text-purple-500" />, color: "bg-purple-500/10 text-purple-600" },
                  { title: "Streak", value: safeStreak, isHidden: (!privacySettings.show_streak || isLocked), icon: <Flame size={16} className="text-orange-500 animate-pulse" />, color: "bg-orange-500/10 text-orange-600" }
                ].map((card, idx) => (
                  <div key={idx} className="py-3.5 px-5 rounded-2xl bg-white dark:bg-[#1E1E1E] border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),_0_0_0_2px_#E7E7E7] dark:shadow-none hover:-translate-y-0.5 transition-all duration-350 flex flex-col gap-2.5 group relative overflow-hidden">
                    <div className={`transition-all duration-300 ${card.isHidden ? 'blur-[4px] opacity-40 pointer-events-none select-none' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{card.title}</span>
                        <div className={`p-2 rounded-xl ${card.color} transition-transform group-hover:scale-105 duration-300`}>
                          {card.icon}
                        </div>
                      </div>
                      <p className={`text-xl sm:text-[22px] font-extrabold leading-none font-sans tracking-tight ${card.highlighted ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- TWO COLUMN MIDDLE SECTION: PERFORMANCE vs AI ANALYSIS --- */}
              {/* Both styled as tactile rounded-3xl containers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card A: Trading Performance */}
                <div className="bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] p-6 rounded-3xl border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none relative overflow-hidden group">
                  <div className={`flex flex-col gap-6 transition-all duration-300 ${(!privacySettings.show_roi || isLocked) ? 'blur-[5px] opacity-40 pointer-events-none select-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Trading Performance</h3>

                      {/* Select dropdown style tactile clone */}
                      <span className="text-[11px] font-bold text-[#393939] dark:text-[#E2E8F0] bg-white dark:bg-[#1E1E1E] px-3.5 py-1.5 rounded-full border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),_0_0_0_2px_#E7E7E7] dark:shadow-none cursor-pointer flex items-center gap-1.5 select-none active:scale-95 transition-all">
                        All Time <ArrowRight size={10} className="rotate-90 text-slate-500" />
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-5 items-center">

                      {/* Left part: Total PnL Label & glowing Line Chart */}
                      <div className="col-span-6 flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total PnL</span>
                        <span className={`text-2xl font-extrabold tracking-tight leading-none mt-2.5 font-sans ${safeAdvMetrics.totalPnlPercent.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {safeAdvMetrics.totalPnlPercent}
                        </span>

                        <div className="h-24 w-full mt-5 relative">
                          <svg className={`w-full h-full filter ${safeAdvMetrics.totalPnlPercent.startsWith('-') ? 'drop-shadow-[0_4px_8px_rgba(244,63,94,0.2)]' : 'drop-shadow-[0_4px_8px_rgba(59,130,246,0.2)]'}`} viewBox="0 0 100 40" preserveAspectRatio="none">
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
                            <circle cx="100" cy={safeAdvMetrics.chartPath.split(',').pop() || 3} r="3.5" fill={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} className="animate-ping" />
                            <circle cx="100" cy={safeAdvMetrics.chartPath.split(',').pop() || 3} r="2" fill={safeAdvMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} />
                          </svg>
                        </div>
                      </div>

                      {/* Right part: stats list styled with Inter weights */}
                      <div className="col-span-6 space-y-3.5 pl-6 border-l border-slate-200 dark:border-white/5">
                        {[
                          { label: "Profit Factor", value: safeAdvMetrics.profitFactor, color: "text-blue-500", icon: <BarChart2 size={13} className="text-blue-500" /> },
                          { label: "Expectancy", value: safeAdvMetrics.expectancy, color: safeAdvMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500", icon: <TrendingUp size={13} className={safeAdvMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500"} /> },
                          { label: "Max Drawdown", value: safeAdvMetrics.maxDrawdown, color: "text-rose-500", highlighted: true, icon: <Scale size={13} className="text-rose-500" /> },
                          { label: "Consistency Score", value: `${safeAdvMetrics.consistencyScore}%`, color: "text-blue-500", icon: <CheckCircle2 size={13} className="text-blue-500" />, showInfo: true }
                        ].map((stat, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-450 dark:text-[#999] flex items-center gap-2">
                              {/* Inner icon consistency boxes */}
                              <div className="p-1 rounded-lg bg-white dark:bg-[#1E1E1E] border border-white dark:border-white/5 shadow-sm">
                                {stat.icon}
                              </div>
                              <span className="flex items-center gap-1 font-semibold">
                                {stat.label}
                                {stat.showInfo && <Info size={11} className="text-slate-400 hover:text-slate-650 cursor-pointer" />}
                              </span>
                            </span>
                            <span className={`font-bold tracking-tight font-sans ${stat.highlighted ? 'text-rose-500' : 'text-slate-850 dark:text-[#EEE]'}`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Card B: Tradifive AI Analysis (Tactile rounded-3xl container) */}
                <div className="bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] p-6 rounded-3xl border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none relative overflow-hidden group">
                  <div className={`flex flex-col gap-5 transition-all duration-300 ${isLocked ? 'blur-[5px] opacity-40 pointer-events-none select-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tradifive AI Analysis</h3>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Updated 2h ago</span>
                    </div>

                    <div className="space-y-4">
                      {/* Emotional Discipline bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-slate-555 dark:text-[#999]">Emotional Discipline</span>
                          <span className="font-bold text-emerald-500">{safeAdvMetrics.emotionalDiscipline}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                          <div className="h-full bg-[#10b981] rounded-full transition-all duration-1000" style={{ width: `${safeAdvMetrics.emotionalDiscipline}%` }} />
                        </div>
                      </div>

                      {/* Revenge Trading Risk */}
                      <div className="flex justify-between items-center text-xs py-2.5 border-y border-slate-200/60 dark:border-white/5">
                        <span className="font-semibold text-slate-555 dark:text-[#999]">Revenge Trading Risk</span>
                        <span className={`font-bold flex items-center gap-1.5 ${safeAdvMetrics.revengeRisk === 'High' ? 'text-rose-500' : safeAdvMetrics.revengeRisk === 'Medium' ? 'text-yellow-500' : 'text-[#10b981]'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${safeAdvMetrics.revengeRisk === 'High' ? 'bg-rose-500' : safeAdvMetrics.revengeRisk === 'Medium' ? 'bg-yellow-500' : 'bg-[#10b981]'}`} /> {safeAdvMetrics.revengeRisk}
                        </span>
                      </div>

                      {/* Confidence Score bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-slate-555 dark:text-[#999]">Confidence Score</span>
                          <span className="font-bold text-blue-500">{safeAdvMetrics.confidenceScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${safeAdvMetrics.confidenceScore}%` }} />
                        </div>
                      </div>

                      {/* Two detailed info cells */}
                      <div className="grid grid-cols-2 gap-4 text-xs pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                        <div>
                          <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Best Trading Session</span>
                          <span className="font-bold text-slate-900 dark:text-white mt-1 block font-sans">{safeAdvMetrics.bestSession}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Suggested Improvement</span>
                          <span className="font-bold text-slate-900 dark:text-white mt-1 block font-sans">{safeAdvMetrics.suggestedImprovement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pill Tabs Bar Selector */}
              {/* Styled with skeuomorphic outline frame */}
              <div className="flex items-center gap-6 border-b-2 border-slate-200/50 dark:border-white/5 px-2 relative z-10">
                {isLocked ? (
                  <div className="py-3 text-slate-500 dark:text-[#999] text-xs font-bold w-full text-center">
                    <ShieldCheck size={20} className="inline-block mr-2 text-slate-400" />
                    Posts and Trades are private
                  </div>
                ) : (
                  (() => {
                    const tabs = ["Posts", "Trades", "Videos", "Mentions", ...(profile?.achievements && (profile.achievements as any).length > 0 ? ["Achievements"] : [])];
                    if (currentUserId === profile?.id) {
                      tabs.splice(2, 0, "Saved");
                    }
                    return tabs;
                  })().map((tab) => (
                    <div
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3.5 pt-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all relative select-none ${activeTab === tab
                          ? "text-blue-600 dark:text-blue-500"
                          : "text-slate-500 hover:text-slate-700 dark:text-[#999] dark:hover:text-slate-300"
                        }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                      )}
                    </div>
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

          {/* --- COLUMN 3: RIGHT SIDEBAR (col-span-3) --- */}
          {/* All outer sidebar panels aligned to rounded-3xl outer cards with clean borders */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">

            {/* A. Suggested Traders Widget */}
            <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <span>Suggested Traders</span>
                </h3>
                <span className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer">View all</span>
              </div>

              <div className="flex flex-col gap-5">
                {suggestedTraders.length === 0 ? (
                  <p className="text-[11px] font-semibold text-slate-400 text-center py-2">No suggested traders available</p>
                ) : (
                  suggestedTraders.map((person) => {
                    const isFollowing = followedUsers[person.id] || false;
                    const displayName = person.display_name || person.username || "Trader";
                    const displayAvatar = person.avatar_url || "/default-avatar.svg";
                    const displayWinrate = person.win_rate ? `${person.win_rate}% Win Rate` : "Active Trader";
                    const displayRole = person.bio ? (person.bio.length > 30 ? person.bio.substring(0, 30) + "..." : person.bio) : "Tradifive Member";

                    return (
                      <div key={person.id} className="flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <Link to={`/user/${person.username || ""}`} className="shrink-0 hover:opacity-85 transition-opacity duration-300">
                            <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full border border-slate-200/50 dark:border-white/5 object-cover bg-slate-100" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/user/${person.username || ""}`}>
                              <h4 className="font-bold text-slate-900 dark:text-white text-[13px] leading-tight hover:text-blue-600 cursor-pointer truncate transition-colors">{displayName}</h4>
                            </Link>
                            <p className="text-slate-455 dark:text-slate-400 text-[10.5px] leading-none mt-1 truncate font-semibold">{displayWinrate}</p>
                            <p className="text-slate-400 dark:text-slate-400 text-[10.5px] leading-none mt-1.5 truncate font-semibold">{displayRole}</p>
                          </div>
                        </div>

                        {/* Follow Button */}
                        <button
                          onClick={() => toggleFollowUser(person.id, displayName)}
                          className={`shrink-0 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 border-2 active:scale-95 ${isFollowing
                              ? 'bg-gradient-to-b from-[#F4F4F4]/50 to-[#FFFFFF]/60 dark:from-[#252528]/40 dark:to-[#1A1A1C]/50 text-slate-500 dark:text-[#999] border-slate-200 dark:border-white/5'
                              : 'bg-white dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.1),_0_0_0_2px_#E7E7E7] dark:shadow-none'
                            }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* B. Trading Streak Widget */}
            <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none relative overflow-hidden group">
              <div className={`flex flex-col gap-4.5 transition-all duration-300 ${(!privacySettings.show_streak || isLocked) ? 'blur-[5px] opacity-40 pointer-events-none select-none' : ''}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5/60 mb-1">
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={16} className="text-orange-500 fill-orange-500/10" />
                    <span>Trading Streak</span>
                  </h3>
                  <span className="text-[14px] font-bold text-orange-500 leading-none">{safeStreak}</span>
                </div>

                <div className="flex justify-between text-xs font-semibold text-slate-450">
                  <span>Current Streak</span>
                  <span>Best: <strong className="text-slate-900 dark:text-white font-extrabold">{profile?.best_streak || 0} Days</strong></span>
                </div>

                {/* Day Dot indicators row matching image exactly (15 dots) */}
                <div className="flex items-center justify-between gap-1.5 py-1">
                  {Array(15).fill({ status: 'gray' }).map((dot, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full block border border-white/5 shadow-sm ${dot.status === 'green' ? 'bg-[#10b981]' : (dot.status === 'red' ? 'bg-[#ef4444]' : 'bg-slate-200 dark:bg-[#1E1E1E]')
                        }`}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-widest leading-none">
                  <span>12 May</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* C. Performance Calendar Widget */}
            <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none relative overflow-hidden group">
              <div className={`flex flex-col gap-4.5 transition-all duration-300 ${(!privacySettings.show_trades || isLocked) ? 'blur-[5px] opacity-40 pointer-events-none select-none' : ''}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5/60 mb-1">
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={15} className="text-blue-500" />
                    <span>Calendar</span>
                  </h3>
                  {/* Tactical Dropdown trigger clone */}
                  <span className="flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] text-[#393939] dark:text-[#E2E8F0] text-[11px] font-extrabold uppercase tracking-wider transition-all border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-none cursor-pointer hover:text-slate-700 select-none active:scale-95 min-w-[105px]">
                    <span>May 2026</span> <ChevronDown size={11} className="text-[#393939] dark:text-[#E2E8F0] shrink-0" />
                  </span>
                </div>

                {/* Heatmap Grid Calendar (5 rows of 7 days) */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d.substring(0, 1)}</span>)}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Heatmap block layout matching the reference mockup layout */}
                    {Array(35).fill(null).map((_, idx) => (
                      <span key={idx} className="h-6 rounded-lg bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200/40 dark:border-white/5" />
                    ))}
                  </div>
                </div>

                {/* Legend details row */}
                <div className="flex items-center justify-between text-[9px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-wider pt-2.5 border-t border-slate-200/60 dark:border-slate-850">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#10b981]" /> Profitable
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#ef4444]" /> Loss
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-[#1E1E1E]" /> No Trade
                  </span>
                </div>
              </div>
            </div>

            {/* D. Achievements Widget with gorgeous premium inline SVG medals */}
            {/* Outer box styled with skeuomorphic outline frame */}
            {profile?.achievements && profile.achievements.length > 0 && (
            <div className="p-6 rounded-3xl border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.06),_0_0_0_2px_#E7E7E7] dark:shadow-none relative overflow-hidden group">
              <div className={`flex flex-col gap-4.5 transition-all duration-300 ${isLocked ? 'blur-[5px] opacity-40 pointer-events-none select-none' : ''}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5/60 mb-1">
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Star size={15} className="text-blue-500" />
                    <span>Achievements</span>
                  </h3>
                  <span className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer">View all</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-[9px] font-bold text-slate-500 dark:text-[#999] select-none">
                  {profile?.achievements && profile.achievements.length > 0 ? (
                    profile.achievements.slice(0, 3).map((ach: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-[#1E1E1E] border-2 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer shadow-sm">
                        <Star size={22} className="text-emerald-500 mx-auto mb-1.5 drop-shadow-sm" />
                        <span className="truncate block mt-1">{ach.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-6 text-center text-slate-400 dark:text-slate-400 text-xs font-semibold border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                      No achievements unlocked yet
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

          </div>
        </div>
      </div>

      <FollowListModal
        isOpen={followListState.isOpen}
        onClose={() => setFollowListState({ ...followListState, isOpen: false })}
        userId={profile?.id}
        type={followListState.type}
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
