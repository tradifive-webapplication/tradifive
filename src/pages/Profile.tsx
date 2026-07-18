import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
  Crown, ArrowRight, ChevronDown, Radio, Play, Pencil, Settings, Camera
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
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#121212] border-slate-200 dark:border-white/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Delete Post</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-[#1E1E1E] hover:bg-slate-200 dark:hover:bg-[#222] text-slate-800 dark:text-slate-200 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeletePost}
              className="bg-rose-500 hover:bg-rose-600 text-white border-none"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    return cached ? JSON.parse(cached) : [];
  });
  const [loadingProfile, setLoadingProfile] = useState(() => {
    return localStorage.getItem(`prof_cache_data_${userIdSync}`) === null;
  });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [postsPage, setPostsPage] = useState(0);
  const [bookmarksPage, setBookmarksPage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("Posts");
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
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
  };

  const executeDeletePost = async () => {
    if (!postToDelete) return;
    const postId = postToDelete;
    
    if (postId.startsWith('local-')) {
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const updated = localPosts.filter((p: any) => p.id !== postId);
      localStorage.setItem('fialgo_local_posts', JSON.stringify(updated));
      toast.success("Post deleted successfully!");
      
      // Optimistic UI updates for local posts
      setPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
      setSavedPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
      
      fetchProfileAndData();
      setPostToDelete(null);
      return;
    }
    
    // Optimistic UI updates for DB posts
    setPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
    setSavedPosts(prev => prev.filter(p => String(p.id) !== String(postId)));

    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
      toast.success("Post deleted successfully!");
      fetchProfileAndData();
    } catch (err: any) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post.");
      fetchProfileAndData(); // Revert optimistic update on failure
    }
    setPostToDelete(null);
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

  const [privacySettings, setPrivacySettings] = useState({
    show_location: true,
    show_winrate: true,
    show_roi: true,
    show_streak: true,
    show_trades: true,
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
    if (profile?.id) {
      const stored = localStorage.getItem(`tradifive_privacy_${profile.id}`);
      if (stored) {
        setPrivacySettings(JSON.parse(stored));
      }
    }
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
        supabase.from('social_posts').select('*, profiles (id, first_name, last_name, avatar_url, username, display_name, bio, banner_url)')
          .eq('user_id', user.id).neq('post_type', 'story')
          .order('created_at', { ascending: false })
          .range(page * 15, (page + 1) * 15 - 1),
        supabase.from('social_post_likes').select('post_id').eq('user_id', user.id)
      ]);

      if (!postsRes.error && postsRes.data) {
        const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]').filter(p => !p.user_id || p.user_id === user.id);
        
        setPosts(prev => {
           const newPosts = page === 0 ? postsRes.data : [...prev, ...postsRes.data];
           const dbIds = new Set(newPosts.map(f => String(f.id)));
           const filteredLocal = localPosts.filter(p => !dbIds.has(String(p.id)));
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
        .select('post_id, social_posts(*, profiles(id, first_name, last_name, avatar_url, username, display_name, bio, banner_url))')
        .eq('user_id', user.id)
        .range(page * 15, (page + 1) * 15 - 1);

      if (bookmarksRes && !bookmarksRes.error && bookmarksRes.data) {
        const bookmarkMap = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
        bookmarksRes.data.forEach((b) => { bookmarkMap[b.post_id] = true; });
        setBookmarkedPosts(bookmarkMap);
        const parsedSavedPosts = bookmarksRes.data.map((b) => b.social_posts).filter((p) => p !== null);
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
        const { error } = await supabase
          .from('social_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
        toast.info(`Unfollowed ${targetName}`);
      } else {
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
          .select('post_id, social_posts(*, profiles(id, first_name, last_name, avatar_url, username, display_name, bio, banner_url))')
          .eq('user_id', user.id);
        if (savedPostsRes.data) {
          const parsedSavedPosts = savedPostsRes.data
            .map((b: any) => b.social_posts)
            .filter((p: any) => p !== null);
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

    if (activeTab === "Activity") {
      return isOwnPost || isTagged;
    } else if (activeTab === "Posts") {
      return isOwnPost && p.media_type !== 'video';
    } else if (activeTab === "Mentions") {
      return isTagged;
    } else if (activeTab === "Videos") {
      return isOwnPost && p.media_type === 'video';
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
            <div className="lg:col-span-9 space-y-6">
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
            <div className="lg:col-span-3 space-y-6">
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
        <div className="w-full min-h-screen flex flex-col px-4 lg:px-10 pt-6 pb-6 select-none font-sans text-slate-800 dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#000000]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 relative max-w-7xl mx-auto w-full">

            {/* --- LEFT & MIDDLE MAIN CONTENT (col-span-9) --- */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">

              {/* Header Card (Consistent Tactile Neumorphic / Claymorphic Outer container with dual-border & soft shadow specs) */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm relative">

                {/* Cover Banner */}
                <div className="h-44 sm:h-52 w-full relative bg-[#1A1A1A] overflow-hidden border-b border-white/10 dark:border-white/5">
                  {loadingProfile ? (
                    <div className="w-full h-full animate-pulse bg-slate-350 dark:bg-[#1E1E1E]" />
                  ) : (
                    <div className="w-full h-full relative">
                      {(!profile?.banner_url || profile.banner_url === "/default-cover.png") ? (
                        <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900" />
                      ) : (
                        <>
                          <img
                            src={profile.banner_url}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-100"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }}
                          />
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
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-[#1E1E1E] overflow-hidden bg-white dark:bg-[#1E1E1E] relative">
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

                    {/* Right: Stats display horizontally positioned next to the avatar (Using Inter font weights) */}
                    <div className="flex flex-1 justify-around sm:justify-end gap-6 sm:gap-14 w-full sm:w-auto py-2 sm:py-0 text-center sm:text-right">
                      <div className="min-w-[65px] text-center">
                        <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{ownPostsCount}</p>
                        <p className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider mt-2 leading-none">posts</p>
                      </div>
                      <div className="border-r border-slate-200 dark:border-white/5 h-8 self-center hidden sm:block" />
                      <div
                        onClick={() => setFollowListState({ isOpen: true, type: 'followers' })}
                        className="min-w-[75px] text-center cursor-pointer hover:opacity-70 transition-opacity"
                      >
                        <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{followerCount}</p>
                        <p className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider mt-2 leading-none">followers</p>
                      </div>
                      <div className="border-r border-slate-200 dark:border-white/5 h-8 self-center hidden sm:block" />
                      <div
                        onClick={() => setFollowListState({ isOpen: true, type: 'following' })}
                        className="min-w-[75px] text-center cursor-pointer hover:opacity-70 transition-opacity"
                      >
                        <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{followingCount}</p>
                        <p className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider mt-2 leading-none">following</p>
                      </div>
                    </div>

                  </div>

                  {/* Info and buttons layout below the avatar level */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-end">

                    {/* Left columns: Profile identity labels & pills */}
                    <div className="md:col-span-8 text-center sm:text-left">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2 leading-tight">
                        {profile?.display_name || "Guest Trader"}
                      </h1>
                      <p className="text-[13px] font-semibold text-slate-455 dark:text-slate-400 mt-1">
                        @{profile?.username || "guest_trader"}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-2.5 mb-1.5 select-none">
                        <span className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-655 dark:text-blue-400 text-[10.5px] font-black px-2.5 py-1 rounded-lg border border-blue-500/25 flex items-center gap-1 shadow-sm shrink-0">
                          <Crown size={12} className="text-blue-500" /> Lvl {gamState.level}
                        </span>
                        <div className="flex items-center gap-2 flex-1 max-w-[180px] min-w-[120px]">
                          <div className="flex-1 h-[7px] bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-slate-200/50 dark:border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-none">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-300" 
                              style={{ width: `${Math.min(100, (gamState.xp / gamState.xp_required) * 100)}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-350 font-bold shrink-0">{gamState.xp}/{gamState.xp_required} XP</span>
                        </div>
                      </div>
                      <p className="text-[14px] text-slate-700 dark:text-[#CCC] font-semibold leading-relaxed mt-3.5 max-w-xl whitespace-pre-wrap">
                        {profile?.bio || "No bio yet. Update your profile to tell others about your trading style."}
                      </p>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                        {profile?.trading_style ? (
                          profile.trading_style.split(',').map((tag, idx) => (
                            <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border shadow-sm ${idx % 3 === 0 ? "bg-blue-500/10 text-blue-655 dark:text-blue-400 border-blue-500/10" :
                                idx % 3 === 1 ? "bg-emerald-500/10 text-emerald-655 dark:text-emerald-450 border-emerald-500/10" :
                                  "bg-orange-500/10 text-orange-655 dark:text-orange-400 border-orange-500/10"
                              }`}>
                              {idx % 3 === 0 ? <Star size={11} className="fill-blue-500/20 text-blue-500" /> :
                                idx % 3 === 1 ? <Shield size={11} className="fill-emerald-500/20 text-emerald-500" /> :
                                  <Star size={11} className="fill-orange-500/20 text-orange-500" />} {tag}
                            </span>
                          ))
                        ) : null}
                      </div>

                      {/* Geographic and join info */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-slate-500 dark:text-[#999] text-xs font-bold mt-5 pt-4 border-t border-slate-200/50 dark:border-white/5">
                        <span className="flex items-center gap-1.5">
                          <IconlyDiscovery set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" /> <span>{profile?.country || "Not set"}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconlyLocation set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" /> <span>{profile?.location || "Not set"}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconlyCalendar set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" /> <span>Joined Jan 2024</span>
                        </span>
                      </div>
                    </div>

                    {/* Right columns: Claymorphic Action Buttons to match mockup exactly */}
                    <div className="md:col-span-4 flex items-center justify-center sm:justify-end gap-2.5 w-full pb-2.5">
                      {/* Edit Button */}
                      <button
                        onClick={openEditModal}
                        className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-300 border active:scale-95 bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm"
                      >
                        <IconlyEdit set="curved" primaryColor="currentColor" size={15} stroke="bold" strokeWidth={2} /> Edit
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => {
                          const profileUrl = `${window.location.origin}/user/${profile?.username || "guest_trader"}`;
                          navigator.clipboard.writeText(profileUrl);
                          toast.success("Profile link copied to clipboard!");
                        }}
                        className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-white dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-200 text-[12px] font-bold whitespace-nowrap transition-all border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-50 dark:hover:bg-[#333] active:scale-95"
                      >
                        <IconlySend set="curved" primaryColor="currentColor" size={15} stroke="bold" strokeWidth={2} /> Share
                      </button>
                    </div>

                  </div>

                </div>
              </div>

              {/* --- QUICK STATS GRID CARDS (5 Cards) --- */}
              {/* Redesigned to have 100% Tactile claymorphic styling matching mockup box shadow specs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { title: "Trades", value: totalTradesCount.toLocaleString(), icon: <IconlyGraph set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-blue-500" />, color: "bg-blue-500/10 text-blue-600" },
                  { title: "Win Rate", value: winRateVal, icon: <IconlyShieldDone set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600" },
                  { title: "ROI (All Time)", value: roiVal, icon: <IconlyActivity set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-emerald-500 animate-pulse" />, color: "bg-emerald-500/10 text-emerald-600", highlighted: true },
                  { title: "Avg RR", value: avgRRVal, icon: <WrappedTarget set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-purple-500" />, color: "bg-purple-500/10 text-purple-600" },
                  { title: "Streak", value: streakVal, icon: <WrappedFlame set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-orange-500 animate-pulse" />, color: "bg-orange-500/10 text-orange-600" }
                ].map((card, idx) => (
                  <div key={idx} className="py-3.5 px-5 rounded-[16px] bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2.5 group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{card.title}</span>
                      <div className={`p-2 rounded-xl ${card.color} transition-transform group-hover:scale-105 duration-300`}>
                        {card.icon}
                      </div>
                    </div>
                    <p className={`text-xl sm:text-[22px] font-extrabold leading-none font-sans tracking-tight ${card.highlighted ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* --- TWO COLUMN MIDDLE SECTION: PERFORMANCE vs AI ANALYSIS --- */}
              {/* Both styled as tactile rounded-3xl containers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card A: Trading Performance */}
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[20px] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Trading Performance</h3>

                    {/* Select dropdown style tactile clone */}
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#2A2A2A] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer flex items-center gap-1.5 select-none active:scale-95 transition-all">
                      All Time <ArrowRight size={10} className="rotate-90 text-slate-500" />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-5 items-center">

                    {/* Left part: Total PnL Label & glowing Line Chart */}
                    <div className="col-span-6 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total PnL</span>
                      <span className={`text-2xl font-extrabold tracking-tight leading-none mt-2.5 font-sans ${advMetrics.totalPnlPercent.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {advMetrics.totalPnlPercent}
                      </span>

                      <div className="h-24 w-full mt-5 relative">
                        <svg className={`w-full h-full filter ${advMetrics.totalPnlPercent.startsWith('-') ? 'drop-shadow-[0_4px_8px_rgba(244,63,94,0.2)]' : 'drop-shadow-[0_4px_8px_rgba(59,130,246,0.2)]'}`} viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
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
                            fill="url(#pnlGrad)"
                          />
                          {/* Glowing terminal node */}
                          <circle cx="100" cy={advMetrics.chartPath.split(',').pop() || 3} r="3.5" fill={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} className="animate-ping" />
                          <circle cx="100" cy={advMetrics.chartPath.split(',').pop() || 3} r="2" fill={advMetrics.totalPnlPercent.startsWith('-') ? "#f43f5e" : "#3b82f6"} />
                        </svg>
                      </div>
                    </div>

                    {/* Right part: stats list styled with Inter weights */}
                    <div className="col-span-6 space-y-3.5 pl-6 border-l border-slate-200 dark:border-white/5">
                      {[
                        { label: "Profit Factor", value: advMetrics.profitFactor, color: "text-blue-500", icon: <BarChart2 size={13} className="text-blue-500" /> },
                        { label: "Expectancy", value: advMetrics.expectancy, color: advMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500", icon: <TrendingUp size={13} className={advMetrics.expectancy.startsWith('-') ? "text-rose-500" : "text-emerald-500"} /> },
                        { label: "Max Drawdown", value: advMetrics.maxDrawdown, color: "text-rose-500", highlighted: true, icon: <Scale size={13} className="text-rose-500" /> },
                        { label: "Consistency Score", value: `${advMetrics.consistencyScore}%`, color: "text-blue-500", icon: <CheckCircle2 size={13} className="text-blue-500" />, showInfo: true }
                      ].map((stat, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-455 dark:text-[#999] flex items-center gap-2">
                            {/* Inner icon consistency boxes */}
                            <div className="p-1 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-100 dark:border-white/5 shadow-sm">
                              {stat.icon}
                            </div>
                            <span className="flex items-center gap-1 font-semibold">
                              {stat.label}
                              {stat.showInfo && <Info size={11} className="text-slate-400 hover:text-slate-655 cursor-pointer" />}
                            </span>
                          </span>
                          <span className={`font-bold tracking-tight font-sans ${stat.highlighted ? 'text-rose-500' : 'text-slate-855 dark:text-[#EEE]'}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Card B: Tradifive AI Analysis (Tactile rounded-3xl container) */}
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[20px] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tradifive AI Analysis</h3>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Updated 2h ago</span>
                  </div>

                  <div className="space-y-4">
                    {/* Emotional Discipline bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-555 dark:text-[#999]">Emotional Discipline</span>
                        <span className="font-bold text-emerald-500">{advMetrics.emotionalDiscipline}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                        <div className="h-full bg-[#10b981] rounded-full transition-all duration-1000" style={{ width: `${advMetrics.emotionalDiscipline}%` }} />
                      </div>
                    </div>

                    {/* Revenge Trading Risk */}
                    <div className="flex justify-between items-center text-xs py-2.5 border-y border-slate-200/60 dark:border-white/5">
                      <span className="font-semibold text-slate-555 dark:text-[#999]">Revenge Trading Risk</span>
                      <span className={`font-bold flex items-center gap-1.5 ${advMetrics.revengeRisk === 'High' ? 'text-rose-500' : advMetrics.revengeRisk === 'Medium' ? 'text-yellow-500' : 'text-[#10b981]'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${advMetrics.revengeRisk === 'High' ? 'bg-rose-500' : advMetrics.revengeRisk === 'Medium' ? 'bg-yellow-500' : 'bg-[#10b981]'}`} /> {advMetrics.revengeRisk}
                      </span>
                    </div>

                    {/* Confidence Score bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-555 dark:text-[#999]">Confidence Score</span>
                        <span className="font-bold text-blue-500">{advMetrics.confidenceScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${advMetrics.confidenceScore}%` }} />
                      </div>
                    </div>

                    {/* Two detailed info cells */}
                    <div className="grid grid-cols-2 gap-4 text-xs pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Best Trading Session</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-1 block font-sans">{advMetrics.bestSession}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Suggested Improvement</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-1 block font-sans">{advMetrics.suggestedImprovement}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Underline Tabs Bar Selector */}
              <div className="flex items-center gap-6 border-b-2 border-slate-200/50 dark:border-white/5 px-2 relative z-10 mb-6 select-none overflow-x-auto scrollbar-hide">
                {["Posts", "Trades", "Saved", "Videos", "Mentions", ...(profile?.achievements && (profile.achievements as any).length > 0 ? ["Achievements"] : [])].map((tab) => (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3.5 pt-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all relative select-none shrink-0 ${activeTab === tab
                        ? "text-blue-600 dark:text-blue-500"
                        : "text-slate-500 hover:text-slate-700 dark:text-[#999] dark:hover:text-slate-300"
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                    )}
                  </div>
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

            {/* --- COLUMN 3: RIGHT SIDEBAR (col-span-3) --- */}
            {/* All outer sidebar panels aligned to rounded-3xl outer cards with clean borders */}
            <div className="md:col-span-4 lg:col-span-3 space-y-6">

              {/* A. Suggested Traders Widget */}
              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm">
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
                          <FollowButton
                            isFollowing={isFollowing}
                            onToggleFollow={() => toggleFollowUser(person.id, displayName)}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* B. Trading Streak Widget — Real Data */}
              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm flex flex-col gap-4.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-1">
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={16} className="text-orange-500 fill-orange-500/10" />
                    <span>Trading Streak</span>
                  </h3>
                  <span className="text-[14px] font-bold text-orange-500 leading-none">{streakVal}</span>
                </div>

                <div className="flex justify-between text-xs font-semibold text-slate-455">
                  <span>Current Streak</span>
                  <span>Best: <strong className="text-slate-900 dark:text-white font-extrabold">{bestStreak} Day{bestStreak !== 1 ? 's' : ''}</strong></span>
                </div>

                {/* Day Dot indicators from real trade data (last 15 days) */}
                <div className="flex items-center justify-between gap-1.5 py-1">
                  {(streakDots.length > 0 ? streakDots : Array.from({ length: 15 }, () => ({ date: '', status: 'gray' as const }))).map((dot, idx) => (
                    <span
                      key={idx}
                      title={dot.date}
                      className={`w-2.5 h-2.5 rounded-full block border border-white/5 shadow-sm ${dot.status === 'green' ? 'bg-[#10b981]' : (dot.status === 'red' ? 'bg-[#ef4444]' : 'bg-slate-200 dark:bg-[#1E1E1E]')
                        }`}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[9px] text-slate-455 font-bold uppercase tracking-widest leading-none">
                  <span>{streakDots.length > 0 ? (() => { const d = new Date(streakDots[0].date); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); })() : ''}</span>
                  <span>Today</span>
                </div>
              </div>

              {/* C. Performance Calendar Widget — Real Data */}
              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm flex flex-col gap-4.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-1">
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={15} className="text-blue-500" />
                    <span>Calendar</span>
                  </h3>
                  {/* Month Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })}
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <ChevronDown size={13} className="rotate-90" />
                    </button>
                    <span className="flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-200 text-[11px] font-extrabold uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 shadow-sm cursor-default select-none min-w-[105px]">
                      <span>{calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </span>
                    <button
                      onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })}
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <ChevronDown size={13} className="-rotate-90" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Heatmap Grid Calendar */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d.substring(0, 1)}</span>)}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {(() => {
                      const year = calendarMonth.getFullYear();
                      const month = calendarMonth.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const startOffset = (firstDay.getDay() + 6) % 7; // Monday=0
                      const cells: React.ReactNode[] = [];

                      // Empty cells for days before the 1st
                      for (let i = 0; i < startOffset; i++) {
                        cells.push(<span key={`empty-${i}`} className="h-6" />);
                      }

                      const todayStr = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; })();

                      for (let day = 1; day <= lastDay.getDate(); day++) {
                        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const status = calendarDayMap[key]; // 'green' | 'red' | undefined
                        const isToday = key === todayStr;

                        let cellClass = "aspect-square w-full rounded-[4px] transition-all ";
                        if (status === 'green') {
                          cellClass += "bg-[#10b981]/50 dark:bg-[#10b981]/80 shadow-sm";
                        } else if (status === 'red') {
                          cellClass += "bg-[#ef4444]/30 dark:bg-[#ef4444]/15 border-[#ef4444]/20 shadow-sm";
                        } else {
                          cellClass += "bg-slate-100 dark:bg-[#1E1E1E] border-slate-200/40 dark:border-white/5";
                        }
                        if (isToday) {
                          cellClass += " ring-2 ring-[#444] ring-offset-1 dark:ring-offset-[#1A1A1C]";
                        }

                        cells.push(
                          <span
                            key={key}
                            className={cellClass}
                            title={`${key}${status === 'green' ? ' — Profitable' : status === 'red' ? ' — Loss' : ' — No Trade'}`}
                          />
                        );
                      }

                      return cells;
                    })()}
                  </div>
                </div>

                {/* Legend details row */}
                <div className="flex items-center justify-between text-[9px] text-slate-455 dark:text-slate-400 font-extrabold uppercase tracking-wider pt-2.5 border-t border-slate-200/60 dark:border-slate-850">
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

              {/* D. Achievements Widget with gorgeous premium inline SVG medals */}
              {profile?.achievements && (profile.achievements as any).length > 0 && (
                <div className="p-5 rounded-[20px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] shadow-sm flex flex-col gap-4.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-1">
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Star size={15} className="text-blue-500" />
                    <span>Achievements</span>
                  </h3>
                  <span className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer">View all</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-[9px] font-bold text-slate-500 dark:text-[#999] select-none">

                  {/* 1. 100 Winning Trades Medallion */}
                  <div className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/5 shadow-sm hover:scale-103 transition-transform duration-300">
                    <svg className="w-12 h-12 shrink-0 select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="45" r="30" fill="url(#goldGlow)" opacity="0.15" />
                      <path d="M35 50 L25 85 L50 72 L75 85 L65 50 Z" fill="url(#goldRibbon)" stroke="#F59E0B" strokeWidth="1.5" />
                      <polygon points="50,15 80,25 80,55 50,80 20,55 20,25" fill="url(#goldShield)" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round" />
                      <polygon points="50,20 74,28 74,52 50,72 26,52 26,28" fill="none" stroke="#FBBF24" strokeWidth="1" strokeLinejoin="round" />
                      <polygon points="50,28 54,38 65,38 56,44 59,55 50,48 41,55 44,44 35,38 46,38" fill="#FBBF24" />
                      <circle cx="50" cy="52" r="14" fill="#78350F" stroke="#FBBF24" strokeWidth="1.5" />
                      <text x="50" y="56" fill="#FBBF24" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">100</text>
                      <defs>
                        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="goldShield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FBBF24" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                        <linearGradient id="goldRibbon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#B91C1C" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="leading-tight block uppercase tracking-wider text-[8px] font-bold text-amber-600 dark:text-amber-500 text-center">
                      100<br />Winning<br />Trades
                    </span>
                  </div>

                  {/* 2. 10 Days Streak Medallion */}
                  <div className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/5 shadow-sm hover:scale-103 transition-transform duration-300">
                    <svg className="w-12 h-12 shrink-0 select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="45" r="30" fill="url(#purpleGlow)" opacity="0.15" />
                      <path d="M35 50 L25 85 L50 72 L75 85 L65 50 Z" fill="url(#purpleRibbon)" stroke="#A855F7" strokeWidth="1.5" />
                      <polygon points="50,15 80,25 80,55 50,80 20,55 20,25" fill="url(#purpleShield)" stroke="#7E22CE" strokeWidth="2.5" strokeLinejoin="round" />
                      <polygon points="50,20 74,28 74,52 50,72 26,52 26,28" fill="none" stroke="#C084FC" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M50,28 C54,34 52,38 54,42 C51,44 48,42 46,40 C44,45 47,48 50,48 C53,48 56,44 54,37" fill="#F59E0B" />
                      <circle cx="50" cy="52" r="14" fill="#4C1D95" stroke="#C084FC" strokeWidth="1.5" />
                      <text x="50" y="56" fill="#C084FC" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">10</text>
                      <defs>
                        <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="purpleShield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C084FC" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#6D28D9" />
                        </linearGradient>
                        <linearGradient id="purpleRibbon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EC4899" />
                          <stop offset="100%" stopColor="#BE185D" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="leading-tight block uppercase tracking-wider text-[8px] font-bold text-purple-655 dark:text-purple-400 text-center">
                      10 Days<br />Streak
                    </span>
                  </div>

                  {/* 3. 2K Trades Executed Medallion */}
                  <div className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/5 shadow-sm hover:scale-103 transition-transform duration-300">
                    <svg className="w-12 h-12 shrink-0 select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="45" r="30" fill="url(#blueGlow)" opacity="0.15" />
                      <path d="M35 50 L25 85 L50 72 L75 85 L65 50 Z" fill="url(#blueRibbon)" stroke="#3B82F6" strokeWidth="1.5" />
                      <polygon points="50,15 80,25 80,55 50,80 20,55 20,25" fill="url(#blueShield)" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />
                      <polygon points="50,20 74,28 74,52 50,72 26,52 26,28" fill="none" stroke="#60A5FA" strokeWidth="1" strokeLinejoin="round" />
                      <circle cx="50" cy="38" r="8" fill="#FBBF24" />
                      <path d="M42,48 L58,48 L55,42 L45,42 Z" fill="#FBBF24" />
                      <circle cx="50" cy="52" r="14" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" />
                      <text x="50" y="55" fill="#60A5FA" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">2K</text>
                      <defs>
                        <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="blueShield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60A5FA" />
                          <stop offset="50%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                        <linearGradient id="blueRibbon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="leading-tight block uppercase tracking-wider text-[8px] font-bold text-blue-600 dark:text-blue-400 text-center">
                      2K<br />Trades<br />Executed
                    </span>
                  </div>

                </div>
              </div>
              )}

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
