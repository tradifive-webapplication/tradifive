import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogPopup,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Discovery as IconlyDiscovery,
  Location as IconlyLocation,
  Calendar as IconlyCalendar,
  Graph as IconlyGraph,
  ShieldDone as IconlyShieldDone,
  Activity as IconlyActivity,
  Edit as IconlyEdit,
  Send as IconlySend,
  Star as IconlyStar
} from "react-iconly";

import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import defaultAvatar from "@/assets/default-avatar.svg";
import {
  CheckCircle2, MapPin, Calendar, MoreHorizontal, X,
  Search, Heart, MessageCircle, Bookmark, Share2,
  TrendingUp, Globe, Flame, ShieldCheck, Trophy,
  Star, BarChart2, FileText, Shield, Info, Target, Scale,
  Crown, ArrowRight, ChevronDown, ChevronLeft, Radio, Play, Pencil, Settings, Camera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import CreatePostModal from "@/components/CreatePostModal";
import CommentModal from "@/components/CommentModal";
import UserLevelBadge from "@/components/UserLevelBadge";
import { FollowButton } from "@/components/ui/FollowButton";
import FeedCard from "@/components/FeedCard";
import JournalTradesTable from "@/components/journal/JournalTradesTable";
import { JournalSettingsProvider } from "@/contexts/JournalSettingsContext";
import { getGamificationState } from "@/utils/gamification";
import { calculateTradingMetrics } from "@/utils/tradeMetrics";
import { FollowListModal } from "@/components/FollowListModal";
import { validateUsername } from "@/utils/usernameValidation";
import ShareProfileModal from "@/components/ShareProfileModal";

// Placeholder display names to filter out from suggestions
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

const PLACEHOLDER_NAMES = ["new trader", "guest trader", "demo trader", "trader", "guest"];

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
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-500/10 dark:bg-blue-500/15 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
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

const getActiveUserId = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const session = JSON.parse(localStorage.getItem(key) || '{}');
        if (session && session.user && session.user.id) {
          return session.user.id;
        }
      }
    }
  } catch (e) { }
  return 'guest';
};

export default function Profile() {
  const navigate = useNavigate();
  const userIdSync = getActiveUserId();

  const [profile, setProfile] = useState<any>(() => {
    const cached = localStorage.getItem(`prof_cache_data_${userIdSync}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [posts, setPosts] = useState<any[]>(() => {
    const cached = localStorage.getItem(`prof_cache_posts_${userIdSync}`);
    if (!cached) return [];
    try {
      const deletedArr = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
      const deletedSet = new Set(deletedArr.map(String));
      return JSON.parse(cached).filter((p: any) => p && !deletedSet.has(String(p.id)));
    } catch (_) {
      return JSON.parse(cached);
    }
  });
  const [loadingProfile, setLoadingProfile] = useState(() => {
    return localStorage.getItem(`prof_cache_data_${userIdSync}`) === null;
  });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [postsPage, setPostsPage] = useState(0);
  const [bookmarksPage, setBookmarksPage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("All");
  const avatarUploadRef = useRef<HTMLInputElement>(null);
  const bannerUploadRef = useRef<HTMLInputElement>(null);

  // Follow/Profile Stats
  const [followerCount, setFollowerCount] = useState(() => {
    const cached = localStorage.getItem(`prof_cache_followers_${userIdSync}`);
    return cached ? Number(cached) : 0;
  });
  const [followingCount, setFollowingCount] = useState(() => {
    const cached = localStorage.getItem(`prof_cache_following_${userIdSync}`);
    return cached ? Number(cached) : 0;
  });
  const [ownPostsCount, setOwnPostsCount] = useState(() => {
    const cached = localStorage.getItem(`prof_cache_posts_count_${userIdSync}`);
    return cached ? Number(cached) : 0;
  });

  const [followListState, setFollowListState] = useState<{ isOpen: boolean, type: 'followers' | 'following' }>({ isOpen: false, type: 'followers' });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Real-time calculated metrics with mockup fallbacks
  const [totalTradesCount, setTotalTradesCount] = useState<number>(() => {
    const cached = localStorage.getItem(`prof_cache_stats_${userIdSync}`);
    return cached ? JSON.parse(cached).totalTradesCount : 0;
  });
  const [winRateVal, setWinRateVal] = useState<string>(() => {
    const cached = localStorage.getItem(`prof_cache_stats_${userIdSync}`);
    return cached ? JSON.parse(cached).winRateVal : "0%";
  });
  const [roiVal, setRoiVal] = useState<string>(() => {
    const cached = localStorage.getItem(`prof_cache_stats_${userIdSync}`);
    return cached ? JSON.parse(cached).roiVal : "0.00%";
  });
  const [avgRRVal, setAvgRRVal] = useState<string>("0");
  const [streakVal, setStreakVal] = useState<string>(() => {
    const cached = localStorage.getItem(`prof_cache_stats_${userIdSync}`);
    return cached ? JSON.parse(cached).streakVal : "0 Days";
  });
  const [bestStreak, setBestStreak] = useState<number>(() => {
    const cached = localStorage.getItem(`prof_cache_stats_${userIdSync}`);
    return cached ? JSON.parse(cached).bestStreak : 0;
  });
  const [streakDots, setStreakDots] = useState<{ date: string; status: 'green' | 'red' | 'gray' }[]>([]);
  const [calendarDayMap, setCalendarDayMap] = useState<Record<string, 'green' | 'red' | 'gray'>>({});
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const [advMetrics, setAdvMetrics] = useState<any>(() => {
    const cached = localStorage.getItem(`prof_cache_adv_metrics_${userIdSync}`);
    return cached ? JSON.parse(cached) : calculateTradingMetrics([]);
  });

  // Interaction States
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [likesOffsets, setLikesOffsets] = useState<Record<string, number>>({});
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});
  const [suggestedTraders, setSuggestedTraders] = useState<any[]>([]);
  const [editPost, setEditPost] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsCounts, setCommentsCounts] = useState<Record<string, number>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleDeletePost = async (postId: string) => {
    const postIdStr = String(postId);

    // 1. Immediately remove from state
    setPosts(prev => prev.filter(p => String(p.id) !== postIdStr));
    setSavedPosts(prev => prev.filter(p => String(p.id) !== postIdStr));

    // 2. Permanently purge from all localStorage stores
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

    // 3. Delete from Supabase
    try {
      if (!postIdStr.startsWith('local-')) {
        await Promise.allSettled([
          supabase.from('social_post_likes').delete().eq('post_id', postId),
          supabase.from('social_post_bookmarks').delete().eq('post_id', postId),
          supabase.from('social_post_comments').delete().eq('post_id', postId),
        ]);
        await supabase.from('social_posts').delete().eq('id', postId);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // Edit Profile and Privacy States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gamState, setGamState] = useState(() => getGamificationState());

  useEffect(() => {
    const handleXPUpdate = () => {
      setGamState(getGamificationState());
    };
    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    return () => window.removeEventListener("tradifive_xp_update", handleXPUpdate);
  }, []);

  const [privacySettings, setPrivacySettings] = useState<Record<string, any>>({
    show_location: true,
    show_winrate: true,
    show_roi: true,
    show_avg_rr: true,
    show_streak: true,
    show_trades: true,
    show_performance: true,
    show_calendar: true,
    show_followers: true,
    is_private: false,
    account_type: 'personal' as 'personal' | 'creator' | 'business'
  });

  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editCountryEmoji, setEditCountryEmoji] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");

  useEffect(() => {
    const syncPrivacyFromStorage = () => {
      try {
        let merged: Record<string, any> = {
          show_location: true,
          show_winrate: true,
          show_roi: true,
          show_avg_rr: true,
          show_streak: true,
          show_trades: true,
          show_performance: true,
          show_calendar: true,
          show_followers: true,
          is_private: false,
          account_type: 'personal'
        };
        const savedToggles = localStorage.getItem('tradifive_card_toggles');
        if (savedToggles) {
          const t = JSON.parse(savedToggles);
          if (typeof t.trades === 'boolean') merged.show_trades = t.trades;
          if (typeof t.winRate === 'boolean') merged.show_winrate = t.winRate;
          if (typeof t.roi === 'boolean') merged.show_roi = t.roi;
          if (typeof t.avgRR === 'boolean') merged.show_avg_rr = t.avgRR;
          if (typeof t.streak === 'boolean') merged.show_streak = t.streak;
          if (typeof t.tradingPerformance === 'boolean') merged.show_performance = t.tradingPerformance;
          if (typeof t.calendar === 'boolean') merged.show_calendar = t.calendar;
          if (typeof t.followers === 'boolean') merged.show_followers = t.followers;
        }
        if (profile?.id) {
          const stored = localStorage.getItem(`tradifive_privacy_${profile.id}`);
          if (stored) {
            merged = { ...merged, ...JSON.parse(stored) };
          }
        }
        setPrivacySettings(merged);
      } catch (_) {}
    };
    syncPrivacyFromStorage();
    window.addEventListener("storage", syncPrivacyFromStorage);
    return () => window.removeEventListener("storage", syncPrivacyFromStorage);
  }, [profile?.id]);

  const openEditModal = () => {
    navigate('/settings?tab=profiles');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (editUsername) {
      const validation = validateUsername(editUsername);
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }
    }

    const updatedProfile = {
      ...profile,
      display_name: editDisplayName,
      username: editUsername,
      bio: editBio,
      location: editLocation,
      country: editCountry,
      country_emoji: editCountryEmoji,
      avatar_url: editAvatarUrl,
      banner_url: editBannerUrl
    };

    setProfile(updatedProfile);

    // Save privacy settings locally
    localStorage.setItem(`tradifive_privacy_${profile.id}`, JSON.stringify(privacySettings));

    // Also save privacy settings globally by username for public view lookups
    localStorage.setItem(`tradifive_privacy_user_${editUsername.toLowerCase()}`, JSON.stringify(privacySettings));

    // Also store the updated mock profiles in localStorage for public user profile page to look up!
    localStorage.setItem(`tradifive_mock_profile_${editUsername.toLowerCase()}`, JSON.stringify(updatedProfile));

    // Update tradifive cache keys for sidebar
    localStorage.setItem("tradifive_cached_display_name", editDisplayName);
    localStorage.setItem("tradifive_cached_username", editUsername);
    localStorage.setItem("tradifive_cached_avatar_url", editAvatarUrl);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.id.startsWith('mock-user-id')) {
        await supabase
          .from('profiles')
          .update({
            display_name: editDisplayName,
            username: editUsername,
            bio: editBio,
            avatar_url: editAvatarUrl,
            banner_url: editBannerUrl
          })
          .eq('id', user.id);
      }
      window.dispatchEvent(new Event("tradifive_profile_update"));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating database profile:", err);
      toast.error("Failed to save changes in database, but saved locally.");
    } finally {
      setIsEditModalOpen(false);
    }
  };

  useEffect(() => {
    fetchCoreProfile();
    fetchPostsData(0);
    fetchTradesData();
    fetchBookmarksData(0);
  }, []);

  const fetchCoreProfile = async () => {
    // Check local cache for immediate render
    const cacheProf = localStorage.getItem(`prof_cache_data_${userIdSync}`);
    if (cacheProf) {
      setProfile(JSON.parse(cacheProf));
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile({
          id: "guest",
          display_name: "Guest Trader",
          username: "guest",
          bio: "",
          avatar_url: "",
          banner_url: "/default-cover.png",
        });
        setLoadingProfile(false);
        return;
      }
      
      const [ profRes, followersRes, followingRes, sugRes ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('social_follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
          supabase.from('social_follows').select('following_id').eq('follower_id', user.id),
          supabase.from('profiles').select('id, display_name, username, avatar_url, win_rate, bio').neq('id', user.id).limit(10)
      ]);

      const profileData = profRes.data;
      if (profileData) {
        const emailUsername = (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : "trader");
        if (profileData.display_name === "Guest Trader" || !profileData.display_name || profileData.username === "guest_trader" || !profileData.username) {
          const meta = user.user_metadata || {};
          const resolvedDisplayName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || emailUsername;
          const resolvedUsername = profileData.username && profileData.username !== "guest_trader" ? profileData.username : emailUsername;
          const resolvedAvatarUrl = profileData.avatar_url || meta.avatar_url || meta.picture || defaultAvatar;

          const updatedProfile = {
            ...profileData,
            display_name: profileData.display_name && profileData.display_name !== "Guest Trader" ? profileData.display_name : resolvedDisplayName,
            username: resolvedUsername,
            bio: profileData.bio || "",
            avatar_url: resolvedAvatarUrl,
            banner_url: profileData.banner_url || "/default-cover.png",
          };
          supabase.from('profiles').update({
            display_name: updatedProfile.display_name,
            username: updatedProfile.username,
            avatar_url: updatedProfile.avatar_url,
            banner_url: updatedProfile.banner_url
          }).eq('id', user.id).then();
          setProfile(updatedProfile);
          localStorage.setItem(`prof_cache_data_${userIdSync}`, JSON.stringify(updatedProfile));
        } else {
          setProfile(profileData);
          localStorage.setItem(`prof_cache_data_${userIdSync}`, JSON.stringify(profileData));
        }
      } else {
        const meta = user.user_metadata || {};
        const emailUsername = (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : "trader");
        const resolvedDisplayName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || emailUsername;
        const fallbackProfile = {
          id: user.id,
          display_name: resolvedDisplayName,
          username: emailUsername,
          bio: "",
          avatar_url: meta.avatar_url || meta.picture || defaultAvatar,
          banner_url: "/default-cover.png"
        };
        setProfile(fallbackProfile);
        localStorage.setItem(`prof_cache_data_${userIdSync}`, JSON.stringify(fallbackProfile));
      }

      if (followersRes.count !== null) {
        setFollowerCount(followersRes.count);
        localStorage.setItem(`prof_cache_followers_${userIdSync}`, String(followersRes.count));
      }
      if (followingRes.data) {
        setFollowingCount(followingRes.data.length);
        localStorage.setItem(`prof_cache_following_${userIdSync}`, String(followingRes.data.length));
        const map = {};
        followingRes.data.forEach((f) => { map[f.following_id] = true; });
        setFollowedUsers(map);
      }

      if (sugRes.data) {
        const realTraders = sugRes.data.filter((p) => {
          const name = (p.display_name || '').trim().toLowerCase();
          return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        }).slice(0, 5);
        setSuggestedTraders(realTraders);
      }

    } catch (err) {
      console.error("Error loading core profile data:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchPostsData = async (page = 0) => {
    if (page === 0) setLoadingPosts(true);
    const cachePosts = localStorage.getItem(`prof_cache_posts_${userIdSync}`);
    if (cachePosts && page === 0) {
      setPosts(JSON.parse(cachePosts));
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingPosts(false); return; }

      const [postsRes, likesRes] = await Promise.all([
        supabase.from('social_posts').select('*')
          .eq('user_id', user.id).neq('post_type', 'story')
          .order('created_at', { ascending: false })
          .range(page * 15, (page + 1) * 15 - 1),
        supabase.from('social_post_likes').select('post_id').eq('user_id', user.id)
      ]);

      if (!postsRes.error && postsRes.data) {
        const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]').filter(p => !p.user_id || p.user_id === user.id);
        
        setPosts(prev => {
           let deletedPostIds = new Set<string>();
      try {
        const deletedArr = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
        deletedPostIds = new Set(deletedArr.map(String));
      } catch (_) {}
      const safeData = (postsRes.data || []).filter((p: any) => p && !deletedPostIds.has(String(p.id))).map((p: any) => ({
        ...p,
        profiles: p.profiles || profile || null
      }));
      const newPosts = page === 0 ? safeData : [...prev, ...safeData];
           const dbIds = new Set(newPosts.map(f => String(f.id)));
           const filteredLocal = localPosts.filter(p => !deletedPostIds.has(String(p.id)) && !dbIds.has(String(p.id)));
           const combined = [...filteredLocal, ...newPosts];
           combined.sort((a, b) => {
             const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
             const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
             return isNaN(timeB) || isNaN(timeA) ? 0 : timeB - timeA;
           });
           if(page === 0) {
              localStorage.setItem(`prof_cache_posts_${userIdSync}`, JSON.stringify(combined));
           }
           setOwnPostsCount(combined.length);
           return combined;
        });
      }

      if (likesRes.data) {
        const likedMap = JSON.parse(localStorage.getItem("fialgo_local_post_likes") || "{}");
        likesRes.data.forEach((l) => { likedMap[l.post_id] = true; });
        setLikedPosts(likedMap);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchTradesData = async () => {
    setLoadingTrades(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingTrades(false); return; }

      const [tradesRes, mt5Res] = await Promise.all([
        supabase.from('trades').select('id, profit, created_at, closed_at').eq('user_id', user.id),
        supabase.from('mt5_accounts').select('balance').eq('user_id', user.id).maybeSingle()
      ]);

      const tradesData = tradesRes.data;
      if (tradesData && tradesData.length > 0) {
        const total = tradesData.length;
        const wins = tradesData.filter((t) => Number(t.profit) > 0).length;
        const wr = total > 0 ? Math.round((wins / total) * 100) : 0;
        const pnlSum = tradesData.reduce((acc, t) => acc + Number(t.profit || 0), 0);

        setTotalTradesCount(total);
        setWinRateVal(`${wr}%`);

        let currentStreak = 0;
        const sortedTrades = [...tradesData].sort((a, b) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime());
        for (const t of sortedTrades) {
          if (Number(t.profit) > 0) { currentStreak++; } else { break; }
        }
        setStreakVal(`${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`);

        let best = 0;
        let runLen = 0;
        const chronoTrades = [...tradesData].sort((a, b) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
        for (const t of chronoTrades) {
          if (Number(t.profit) > 0) { runLen++; if (runLen > best) best = runLen; } else { runLen = 0; }
        }
        setBestStreak(best);

        const today = new Date();
        const dots = [];
        const dailyPnl = {};
        for (const t of tradesData) {
          const d = new Date(t.closed_at || t.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dailyPnl[key] = (dailyPnl[key] || 0) + Number(t.profit || 0);
        }
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

        const calMap = {};
        for (const [key, pnl] of Object.entries(dailyPnl)) {
          calMap[key] = pnl > 0 ? 'green' : 'red';
        }
        setCalendarDayMap(calMap);

        const balance = mt5Res.data?.balance || 10000;
        const roiPercent = balance > 0 ? (pnlSum / balance) * 100 : 0;
        const calculatedRoi = (pnlSum >= 0 ? "+" : "") + roiPercent.toFixed(2) + "%";
        setRoiVal(calculatedRoi);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrades(false);
    }
  };

  const fetchBookmarksData = async (page = 0) => {
    if (page === 0) setLoadingBookmarks(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingBookmarks(false); return; }

      const bookmarksRes = await supabase.from('social_post_bookmarks')
        .select('post_id, social_posts(*)')
        .eq('user_id', user.id)
        .range(page * 15, (page + 1) * 15 - 1);

      if (bookmarksRes && !bookmarksRes.error && bookmarksRes.data) {
        const bookmarkMap = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
        bookmarksRes.data.forEach((b: any) => { bookmarkMap[b.post_id] = true; });
        setBookmarkedPosts(bookmarkMap);
        const rawSaved = bookmarksRes.data.map((b: any) => b.social_posts).filter(Boolean);
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
        setSavedPosts(prev => page === 0 ? parsedSavedPosts : [...prev, ...parsedSavedPosts]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmarks(false);
    }
  };
  const toggleFollowUser = async (targetUserId: string, targetName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (targetUserId === user.id) return;

    const isFollowing = followedUsers[targetUserId] || false;
    setFollowedUsers(prev => ({ ...prev, [targetUserId]: !isFollowing }));

    try {
      if (isFollowing) {
        setFollowingCount(prev => Math.max(0, prev - 1));
        const { error } = await supabase
          .from('social_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
        toast.info(`Unfollowed ${targetName}`);
      } else {
        setFollowingCount(prev => prev + 1);
        const { error } = await supabase
          .from('social_follows')
          .insert([{ follower_id: user.id, following_id: targetUserId }]);
        if (error) throw error;
        toast.success(`Followed ${targetName}`);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error("Failed to update follow status.");
      setFollowedUsers(prev => ({ ...prev, [targetUserId]: isFollowing }));
    }
  };

  const handleLikePost = async (postId: string) => {
    const isCurrentlyLiked = likedPosts[postId] || false;
    const nextLiked = !isCurrentlyLiked;

    // Optimistic UI updates
    setLikedPosts(prev => {
      const next = { ...prev, [postId]: nextLiked };
      localStorage.setItem("fialgo_local_post_likes", JSON.stringify(next));
      return next;
    });
    setLikesOffsets(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (nextLiked ? 1 : -1)
    }));

    if (postId.startsWith('local-')) {
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const idx = localPosts.findIndex((p: any) => p.id === postId);
      if (idx !== -1) {
        const currentCount = localPosts[idx].like_count || 0;
        localPosts[idx].like_count = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
        localStorage.setItem('fialgo_local_posts', JSON.stringify(localPosts));
      }
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.id.startsWith('mock-user-id')) {
        if (nextLiked) {
          await supabase.from('social_post_likes').insert([{ post_id: postId, user_id: user.id }]);
        } else {
          await supabase.from('social_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleBookmarkPost = async (postId: string) => {
    const isCurrentlyBookmarked = bookmarkedPosts[postId] || false;
    const nextBookmarked = !isCurrentlyBookmarked;

    // Optimistic UI updates
    setBookmarkedPosts(prev => {
      const next = { ...prev, [postId]: nextBookmarked };
      localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(next));
      return next;
    });

    if (postId.startsWith('local-')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.id.startsWith('mock-user-id')) {
        if (nextBookmarked) {
          await supabase.from('social_post_bookmarks').insert([{ post_id: postId, user_id: user.id }]);

          // Increment bookmark_count on post
          const { data: postData } = await supabase.from('social_posts').select('bookmark_count').eq('id', postId).single();
          const count = (postData?.bookmark_count || 0) + 1;
          await supabase.from('social_posts').update({ bookmark_count: count }).eq('id', postId);
          toast.success("Post saved to bookmarks!");
        } else {
          await supabase.from('social_post_bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);

          // Decrement bookmark_count on post
          const { data: postData } = await supabase.from('social_posts').select('bookmark_count').eq('id', postId).single();
          const count = Math.max(0, (postData?.bookmark_count || 0) - 1);
          await supabase.from('social_posts').update({ bookmark_count: count }).eq('id', postId);
          toast.info("Post removed from bookmarks.");
        }

        // Refresh saved posts list!
        const savedPostsRes = await supabase
          .from('social_post_bookmarks')
          .select('post_id, social_posts(*)')
          .eq('user_id', user.id);
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
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };
  const handleVote = async (postId: string, updatedMediaUrl: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ media_url: updatedMediaUrl })
        .eq('id', postId);
      if (error) throw error;
      fetchProfileAndData();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const formatCount = (baseVal: number, offset: number) => {
    const total = Math.max(0, baseVal + offset);
    if (total >= 1000) {
      return (total / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return total.toString();
  };

  // Filtering posts based on mobile app rules
  const filteredPosts = posts.filter((p: any) => {
    const pUserIdStr = typeof p.user_id === 'object' ? p.user_id?.id : p.user_id;
    const isOwnPost = pUserIdStr === userIdSync ||
      p.profiles?.id === userIdSync ||
      (p.id && p.id.startsWith('local-'));

    const isTagged = (profile && profile.username && p.content)
      ? p.content.toLowerCase().includes('@' + profile.username.toLowerCase())
      : false;

    if (activeTab === "All") {
      return isOwnPost || isTagged;
    } else if (activeTab === "Posts") {
      return isOwnPost && p.media_type !== 'video' && !p.is_reply;
    } else if (activeTab === "Replies") {
      return isOwnPost && (p.is_reply || p.parent_id);
    } else if (activeTab === "Trades") {
      return isOwnPost && (p.is_trade || p.type === 'trade' || p.trade_details);
    } else if (activeTab === "Strategies") {
      return isOwnPost && (p.is_strategy || p.type === 'strategy');
    }
    return false;
  });

  const headerActions = (
    <div className="flex items-center gap-4">
      {/* Action buttons (e.g., share) could go here */}
    </div>
  );

  const resizeImageFile = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (loadingProfile) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Home", path: "/home" }, { label: "My Profile", path: "/profile" }]} headerActions={headerActions} noPadding={true}>
        <div className="w-full h-full flex flex-col px-4 lg:px-10 pt-6 pb-6 bg-[#F8FAFC] dark:bg-[#000000]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full animate-pulse">
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
              <div className="h-64 sm:h-80 bg-slate-200 dark:bg-[#1E1E1E] rounded-[32px] w-full" />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="h-28 bg-slate-200 dark:bg-[#1E1E1E] rounded-2xl" />
                <div className="h-28 bg-slate-200 dark:bg-[#1E1E1E] rounded-2xl" />
                <div className="h-28 bg-slate-200 dark:bg-[#1E1E1E] rounded-2xl" />
                <div className="h-28 bg-slate-200 dark:bg-[#1E1E1E] rounded-2xl" />
                <div className="h-28 bg-slate-200 dark:bg-[#1E1E1E] rounded-2xl" />
              </div>
              <div className="h-96 bg-slate-200 dark:bg-[#1E1E1E] rounded-[32px] w-full mt-6" />
            </div>
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
              <div className="h-80 bg-slate-200 dark:bg-[#1E1E1E] rounded-3xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout breadcrumbs={[{ label: "Home", path: "/home" }, { label: "My Profile", path: "/profile" }]} headerActions={headerActions} noPadding={true}>
        <div className="w-full min-h-screen flex flex-col px-3 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-28 md:pb-10 select-none font-sans text-slate-800 dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#000000]">
          <div className="max-w-4xl mx-auto w-full space-y-5">

            {/* --- UNIFIED PROFILE CONTENT --- */}
            <div className="space-y-5">

              {/* Header Card (Systemic Layout matching Reference Image 1) */}
              <div className="bg-white dark:bg-[#1A1A1E] rounded-[28px] overflow-hidden figma-card-shadow relative">

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

                  {loadingProfile ? (
                    <div className="w-full h-full animate-pulse bg-slate-350 dark:bg-[#1E1E1E]" />
                  ) : (
                    <div className="w-full h-full relative">
                      {(!profile?.banner_url) ? (
                        <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 relative" />
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

                  {/* Top Row: Overlapping Avatar on Left, Solid Pill Buttons on Right */}
                  <div className="flex items-end justify-between gap-4">
                    <div className="relative -mt-14 sm:-mt-16 shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#1A1A1E] overflow-hidden bg-white dark:bg-[#1E1E1E] relative shadow-lg">
                        {loadingProfile ? (
                          <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                        ) : (
                          <img
                            src={profile?.avatar_url || "/default-avatar.svg"}
                            alt="Avatar"
                            className="w-full h-full object-cover relative"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Action Buttons (Consistent Black Tactile Pill Style — Share is in top-right 3-dot menu) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 pb-1 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={openEditModal}
                        className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-[13.5px] font-bold whitespace-nowrap tactile-black-pill cursor-pointer select-none"
                      >
                        <IconlyEdit set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} /> Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* Identity & Metadata */}
                  <div className="mt-3 text-left">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        {profile?.display_name || "Guest Trader"}
                      </h1>
                      <span className="bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-white/10 flex items-center gap-1 shrink-0">
                        <Crown size={11} className="text-amber-500 fill-amber-500/20" /> Lvl {gamState.level}
                      </span>
                    </div>

                    {/* Handle & Joined Date */}
                    <div className="text-[13.5px] font-medium text-slate-500 dark:text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>@{profile?.username || "guest_trader"}</span>
                      <span>·</span>
                      <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026'}</span>
                      {profile?.location && (
                        <>
                          <span>·</span>
                          <span>{profile.location}</span>
                        </>
                      )}
                    </div>

                    {/* Following & Followers inline counts (Always visible on own profile) */}
                    <div className="flex items-center gap-4 text-[13.5px] text-slate-500 dark:text-neutral-400 mt-2 select-none">
                      <span
                        onClick={() => setFollowListState({ isOpen: true, type: 'following' })}
                        className="cursor-pointer hover:underline"
                      >
                        <strong className="text-slate-900 dark:text-white font-extrabold">{Math.max(0, followingCount)}</strong> following
                      </span>
                      <span
                        onClick={() => setFollowListState({ isOpen: true, type: 'followers' })}
                        className="cursor-pointer hover:underline"
                      >
                        <strong className="text-slate-900 dark:text-white font-extrabold">{Math.max(0, followerCount)}</strong> followers
                      </span>
                    </div>

                    {/* Bio */}
                    {profile?.bio && (
                      <p className="text-[14px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-3 max-w-2xl whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    )}

                    {/* Trading Style Badges (Clean Neutral Monochrome Style) */}
                    {profile?.trading_style && (
                      <div className="flex flex-wrap items-center gap-2 mt-3.5">
                        {profile.trading_style.split(',').map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10">
                            {idx % 2 === 0 ? <Star size={11} className="text-slate-500 dark:text-slate-400" /> : <Shield size={11} className="text-slate-500 dark:text-slate-400" />} {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* --- QUICK STATS: COMPACT 1-LINE ROW (All visible stats fit in 1 Line) --- */}
              {(() => {
                const visibleCards = [
                  { title: "Trades", value: totalTradesCount.toLocaleString(), isHidden: privacySettings.show_trades === false, icon: <IconlyGraph set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} className="text-blue-500" />, color: "bg-blue-500/10 text-blue-600" },
                  { title: "Win Rate", value: winRateVal, isHidden: privacySettings.show_winrate === false, icon: <IconlyShieldDone set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600" },
                  { title: "ROI (All Time)", value: roiVal, isHidden: privacySettings.show_roi === false, icon: <IconlyActivity set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600", highlighted: true },
                  { title: "Avg RR", value: avgRRVal, isHidden: privacySettings.show_avg_rr === false, icon: <WrappedTarget set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} className="text-purple-500" />, color: "bg-purple-500/10 text-purple-600" },
                  { title: "Streak", value: streakVal, isHidden: privacySettings.show_streak === false, icon: <WrappedFlame set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} className="text-orange-500" />, color: "bg-orange-500/10 text-orange-600" }
                ].filter(c => !c.isHidden);

                if (visibleCards.length === 0) return null;

                return (
                  <div
                    className="grid gap-1.5 sm:gap-3 w-full"
                    style={{ gridTemplateColumns: `repeat(${visibleCards.length}, minmax(0, 1fr))` }}
                  >
                    {visibleCards.map((card, idx) => (
                      <div key={idx} className="py-2.5 px-2 sm:py-3 sm:px-3.5 rounded-[14px] sm:rounded-2xl bg-white dark:bg-[#1E1E1E] figma-card-shadow hover:-translate-y-0.5 transition-all flex flex-col justify-between min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1 sm:mb-1.5">
                          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">{card.title}</span>
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
              {privacySettings.show_performance !== false && (
                <div className="bg-white dark:bg-[#1E1E1E] p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] figma-card-shadow flex flex-col gap-3">
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
                      <span className={`text-lg sm:text-xl font-extrabold tracking-tight leading-none mt-1.5 font-sans ${advMetrics.totalPnlPercent.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {advMetrics.totalPnlPercent}
                      </span>

                      <div className="h-12 sm:h-14 w-full mt-2 relative">
                        <svg className={`w-full h-full filter ${advMetrics.totalPnlPercent.startsWith('-') ? 'drop-shadow-[0_3px_6px_rgba(244,63,94,0.2)]' : 'drop-shadow-[0_3px_6px_rgba(59,130,246,0.2)]'}`} viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="pnlGradOwn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} stopOpacity="0.4" />
                              <stop offset="100%" stopColor={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={advMetrics.chartPath}
                            fill="none"
                            stroke={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <path
                            d={`${advMetrics.chartPath} L100,40 L0,40 Z`}
                            fill="url(#pnlGradOwn)"
                          />
                          <circle cx="100" cy={advMetrics.chartPath.split(',').pop() || 3} r="3" fill={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} className="animate-ping" />
                          <circle cx="100" cy={advMetrics.chartPath.split(',').pop() || 3} r="2" fill={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} />
                        </svg>
                      </div>
                    </div>

                    {/* Right part: compact stats list */}
                    <div className="col-span-7 space-y-1.5 pl-3 sm:pl-4 border-l border-slate-200/80 dark:border-white/5">
                      {[
                        { label: "Profit Factor", value: advMetrics.profitFactor, color: "text-blue-500", icon: <BarChart2 size={11} className="text-blue-500" /> },
                        { label: "Expectancy", value: advMetrics.expectancy, color: advMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500", icon: <TrendingUp size={11} className={advMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500"} /> },
                        { label: "Max Drawdown", value: advMetrics.maxDrawdown, color: "text-rose-500", highlighted: true, icon: <Scale size={11} className="text-rose-500" /> },
                        { label: "Consistency", value: `${advMetrics.consistencyScore}%`, color: "text-blue-500", icon: <CheckCircle2 size={11} className="text-blue-500" />, showInfo: true }
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
              )}

              {/* --- TRADING STREAK & CALENDAR ROW (Compact; controlled by Settings) --- */}
              {(privacySettings.show_streak !== false || privacySettings.show_calendar !== false) && (
                <div className={`grid grid-cols-1 ${(privacySettings.show_streak !== false && privacySettings.show_calendar !== false) ? 'sm:grid-cols-2' : ''} gap-3 w-full`}>

                  {/* Trading Streak Widget — Real Data */}
                  {privacySettings.show_streak !== false && (
                    <div className="p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-white dark:bg-[#1E1E1E] figma-card-shadow flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-[11px] sm:text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-orange-500/10 text-orange-500">
                            <Flame size={12} className="fill-orange-500/15" />
                          </span>
                          <span>Trading Streak</span>
                        </h3>
                        <span className="text-[12.5px] font-extrabold text-orange-500 leading-none">{streakVal}</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                        <span>Current Streak</span>
                        <span>Best: <strong className="text-slate-900 dark:text-white font-extrabold">{bestStreak} Day{bestStreak !== 1 ? 's' : ''}</strong></span>
                      </div>

                      {/* Day Dot indicators from real trade data (last 15 days) */}
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
                        <span>{streakDots.length > 0 && streakDots[0].date ? (() => { const d = new Date(streakDots[0].date); return isNaN(d.getTime()) ? '15 Days Ago' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); })() : '15 Days Ago'}</span>
                        <span>Today</span>
                      </div>
                    </div>
                  )}

                  {/* Performance Calendar Widget — Real Data */}
                  {privacySettings.show_calendar !== false && (
                    <div className="p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-white dark:bg-[#1E1E1E] figma-card-shadow flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-[11px] sm:text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                            <Calendar size={12} />
                          </span>
                          <span>Calendar</span>
                        </h3>
                        {/* Month Navigation */}
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

                      {/* Dynamic Heatmap Grid Calendar */}
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

                            const todayStr = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; })();

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

                      {/* Legend details row */}
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
                {["All", "Posts", "Replies", "Trades", "Strategies", ...(profile?.achievements && (profile.achievements as any).length > 0 ? ["Achievements"] : [])].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[74px] flex items-center justify-center pb-3.5 pt-2.5 text-[15px] sm:text-[16px] tracking-tight cursor-pointer transition-all relative select-none shrink-0 ${activeTab === tab
                        ? "font-bold text-slate-900 dark:text-white"
                        : "font-semibold text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white"
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-[3.5px] bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* --- BOTTOM GRID: POSTS FEED vs PINNED LIVE STREAM --- */}
              {/* Outer boxes fully adjusted to tactile rounded-3xl outer cards for absolute layout symmetry */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Feed Posts List */}
                <div className="md:col-span-12 max-w-4xl mx-auto w-full space-y-4">
                  {activeTab === "Trades" ? (
                    <div className="p-6 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Synchronized Execution Ledger</h3>
                      </div>
                      <JournalSettingsProvider>
                        <JournalTradesTable />
                      </JournalSettingsProvider>
                    </div>
                  ) : activeTab === "Achievements" ? (
                    <div className="p-6 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <WrappedTrophy size={18} className="text-blue-500 shrink-0" />
                          <span>Trader Badges & Level Progress</span>
                        </h3>
                        <span className="bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-blue-500/20 shadow-sm uppercase tracking-wider">
                          Rank: Vanguard
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Active Level Widget */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#2A2A2A]/60 border border-slate-150 dark:border-white/5 shadow-sm flex flex-col justify-between h-[120px]">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Progression Level</span>
                              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">Level {gamState.level}</span>
                            </div>
                            <Crown size={22} className="text-amber-500 fill-amber-500/20" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-slate-455">
                              <span>XP: {gamState.xp} / {gamState.xp_required}</span>
                              <span>{Math.round((gamState.xp / gamState.xp_required) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(gamState.xp / gamState.xp_required) * 100}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Discipline Level Modifier */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#2A2A2A]/60 border border-slate-150 dark:border-white/5 shadow-sm flex flex-col justify-between h-[120px]">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Discipline Score</span>
                              <span className="text-2xl font-extrabold text-emerald-500 mt-1 block">82%</span>
                            </div>
                            <IconlyShieldDone set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className="text-emerald-500 shrink-0" />
                          </div>
                          <div className="text-[10.5px] text-slate-500 dark:text-[#999] font-semibold leading-relaxed">
                            Your rank is stable. Maintain &gt;75% score to preserve premium badge benefits.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Achievements Ledger ({[1, 2, 3, 6].length} Unlocked)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { id: 1, name: "100 Winning Trades", desc: "Executed 100 profitable trades with verified parameters.", status: "unlocked", progress: "100/100" },
                            { id: 2, name: "Discipline Master", desc: "Maintained > 80% discipline score for 10 consecutive days.", status: "unlocked", progress: "10/10" },
                            { id: 3, name: "Drawdown Survivor", desc: "Zero days exceeding 2% drawdown limit this month.", status: "unlocked", progress: "30/30" },
                            { id: 4, name: "Risk Maestro", desc: "All executed positions had defined stop-losses and take-profits.", status: "locked", progress: "80/100" },
                            { id: 5, name: "Streak Legend", desc: "Reached a 15-day trading streak on the platform.", status: "locked", progress: `${gamState.streak}/15` },
                            { id: 6, name: "AI Coach Approved", desc: "Cleared 5 personal challenges proposed by the AI Coach.", status: "unlocked", progress: "5/5" }
                          ].map((badge) => (
                            <div
                              key={badge.id}
                              className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${badge.status === "unlocked"
                                  ? "bg-white dark:bg-[#2A2A2A]/60 border-slate-150 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                  : "bg-slate-50/50 dark:bg-[#1E1E1E]/40 border-transparent opacity-65"
                                }`}
                            >
                              <div className={`p-2.5 rounded-xl shrink-0 ${badge.status === "unlocked" ? "bg-blue-500/10 text-blue-500" : "bg-slate-200 dark:bg-[#1E1E1E] text-slate-400"
                                }`}>
                                {badge.id === 1 ? <Trophy size={18} /> :
                                  badge.id === 2 ? <ShieldCheck size={18} /> :
                                    badge.id === 3 ? <TrendingUp size={18} /> :
                                      badge.id === 4 ? <Target size={18} /> :
                                        badge.id === 5 ? <Flame size={18} /> : <Star size={18} />}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex justify-between items-center gap-2">
                                  <h5 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">{badge.name}</h5>
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${badge.status === "unlocked" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-[#1E1E1E] text-slate-400"
                                    }`}>
                                    {badge.status === "unlocked" ? "COMPLETED" : badge.progress}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-500 dark:text-[#999] leading-snug font-medium">{badge.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "Saved" ? (
                    savedPosts.length === 0 ? (
                      <div className="p-6 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm text-center py-12 flex flex-col items-center justify-center">
                        <p className="text-slate-500 dark:text-[#999] text-sm font-bold">No Saved Posts Available</p>
                      </div>
                    ) : (
                      <>
                        {savedPosts.map((post: any) => {
                          const isLiked = likedPosts[post.id] || false;
                          return (
                            <FeedCard
                              key={post.id}
                              feed={post}
                              currentUserId={profile?.id || ""}
                              followedUsers={followedUsers}
                              onToggleFollow={toggleFollowUser}
                              isLiked={isLiked}
                              likes={Math.max(0, (post.like_count ?? post.likes_count ?? 0) + (likesOffsets[post.id] || 0))}
                              onLike={handleLikePost}
                              onEdit={setEditPost}
                              onVote={handleVote}
                              onDelete={handleDeletePost}
                            />
                          );
                        })}
                        {savedPosts.length > 0 && (
                          <div className="flex justify-center mt-6 mb-8">
                            <button
                              onClick={() => {
                                const nextPage = bookmarksPage + 1;
                                setBookmarksPage(nextPage);
                                fetchBookmarksData(nextPage);
                              }}
                              disabled={loadingBookmarks}
                              className="px-6 py-2.5 rounded-full text-sm font-bold bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all shadow-sm disabled:opacity-50"
                            >
                              {loadingBookmarks ? "Loading..." : "Load More Saved Posts"}
                            </button>
                          </div>
                        )}
                      </>
                    )
                  ) : filteredPosts.length === 0 ? (
                    <div className="p-6 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm text-center py-12 flex flex-col items-center justify-center">
                      <p className="text-slate-500 dark:text-[#999] text-sm font-bold">No Posts Available</p>
                    </div>
                  ) : (
                    filteredPosts.map((post: any) => {
                      const isLiked = likedPosts[post.id] || false;
                      return (
                        <FeedCard
                          key={post.id}
                          feed={post}
                          currentUserId={profile?.id || ""}
                          followedUsers={followedUsers}
                          onToggleFollow={toggleFollowUser}
                          isLiked={isLiked}
                          likes={Math.max(0, (post.like_count ?? post.likes_count ?? 0) + (likesOffsets[post.id] || 0))}
                          onLike={handleLikePost}
                          onEdit={setEditPost}
                          onVote={handleVote}
                          onDelete={handleDeletePost}
                        />
                      );
                    })
                  )}
                  
                  {filteredPosts.length > 0 && activeTab !== "Trades" && activeTab !== "Achievements" && activeTab !== "Saved" && (
                    <div className="flex justify-center mt-6 mb-8">
                      <button
                        onClick={() => {
                          const nextPage = postsPage + 1;
                          setPostsPage(nextPage);
                          fetchPostsData(nextPage);
                        }}
                        disabled={loadingPosts}
                        className="px-6 py-2.5 rounded-full text-sm font-bold bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all shadow-sm disabled:opacity-50"
                      >
                        {loadingPosts ? "Loading..." : "Load More Posts"}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        <CreatePostModal
          isOpen={editPost !== null}
          onClose={() => setEditPost(null)}
          onSuccess={() => { setEditPost(null); fetchProfileAndData(); }}
          userId={profile?.id ?? ""}
          mode="edit"
          postId={editPost?.id}
          initialContent={editPost?.content}
          initialTags={editPost?.tags || []}
          initialMediaUrl={editPost?.media_url}
          initialMediaUrls={editPost?.media_urls}
          initialMediaType={editPost?.media_type as any}
        />
        {/* Real-time Image Zoom Lightbox Overlay */}
        {lightboxImage && createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-slate-955/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-colors shadow-lg z-50 cursor-pointer"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={lightboxImage}
              alt="Full size setup chart"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none cursor-default"
            />
          </div>,
          document.body
        )}

        <FollowListModal
          isOpen={followListState.isOpen}
          onClose={() => setFollowListState({ ...followListState, isOpen: false })}
          userId={userIdSync}
          type={followListState.type}
        />

        <ShareProfileModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          profile={{
            display_name: profile?.display_name,
            username: profile?.username,
            avatar_url: profile?.avatar_url,
            banner_url: profile?.banner_url,
            bio: profile?.bio,
            trading_style: profile?.trading_style,
            trades_count: totalTradesCount,
            win_rate: winRateVal,
            followers_count: followerCount,
            level: gamState?.level || 1,
          }}
        />
      </DashboardLayout>
    </>
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
