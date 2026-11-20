import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart as IconlyHeart,
  Chat as IconlyChat,
  Swap as IconlySwap,
  Bookmark as IconlyBookmark,
  Chart as IconlyChart,
  Send as IconlySend,
} from "react-iconly";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { playSound } from "@/utils/soundEffects";

// Cross-component broadcast event for instant multi-card & multi-view synchronization
const POST_SYNC_EVENT = "tradifive:post_action_sync";

export interface PostActionSyncPayload {
  postId: string;
  action: "like" | "bookmark" | "repost" | "comment" | "view";
  isLiked?: boolean;
  likeCount?: number;
  isBookmarked?: boolean;
  isReposted?: boolean;
  repostCount?: number;
  commentCount?: number;
  viewCount?: number;
}

export function broadcastPostSync(payload: PostActionSyncPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(POST_SYNC_EVENT, { detail: payload }));
}

// Particle burst effect when liking a post
const LikeParticleBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(i * (Math.PI / 3)) * 22,
            y: Math.sin(i * (Math.PI / 3)) * 22,
          }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.03 }}
          className={`absolute w-1.5 h-1.5 rounded-full ${
            [
              "bg-rose-500",
              "bg-pink-400",
              "bg-rose-400",
              "bg-amber-400",
              "bg-purple-400",
              "bg-rose-600",
            ][i]
          }`}
        />
      ))}
    </div>
  );
};

// Smooth animated numeric digit transition
const AnimatedNumber = ({ value }: { value: number }) => {
  const safeValue = Math.max(0, value || 0);
  const prevValueRef = useRef(safeValue);
  const direction = safeValue > prevValueRef.current ? 1 : -1;

  useEffect(() => {
    prevValueRef.current = safeValue;
  }, [safeValue]);

  const digits = String(safeValue).split("");

  return (
    <span className="relative flex items-center justify-center overflow-hidden h-[17px] font-sans">
      {digits.map((digit, index) => (
        <span key={index} className="relative inline-block w-[1ch] h-[17px]">
          <AnimatePresence custom={direction} initial={false}>
            <motion.span
              key={digit}
              custom={direction}
              initial={(d) => ({
                y: d > 0 ? 12 : -12,
                opacity: 0,
                position: "absolute",
              })}
              animate={{ y: 0, opacity: 1, position: "absolute" }}
              exit={(d) => ({
                y: d > 0 ? -12 : 12,
                opacity: 0,
                position: "absolute",
              })}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className="inset-0 flex items-center justify-center"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
};

const formatCompactViews = (count: number) => {
  if (count >= 1_000_000)
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000)
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
};

export interface PostActionBarProps {
  postId: string;
  post?: any;
  currentUserId?: string;
  initialLiked?: boolean;
  initialLikes?: number;
  initialComments?: number;
  initialReposted?: boolean;
  initialReposts?: number;
  initialBookmarked?: boolean;
  initialViews?: number;
  onLike?: (postId: string) => void;
  onCommentClick?: () => void;
  className?: string;
  showDividers?: boolean;
}

export default function PostActionBar({
  postId,
  post,
  currentUserId,
  initialLiked,
  initialLikes,
  initialComments,
  initialReposted,
  initialReposts,
  initialBookmarked,
  initialViews,
  onLike,
  onCommentClick,
  className = "",
}: PostActionBarProps) {
  const navigate = useNavigate();

  // 1. Initial State Resolution with safe fallback chain
  const baseLikes =
    initialLikes ??
    post?.likes ??
    post?.like_count ??
    post?.likes_count ??
    0;
  const baseComments =
    initialComments ??
    post?.comment_count ??
    post?.comments_count ??
    0;
  const baseReposts =
    initialReposts ??
    post?.repost_count ??
    post?.share_count ??
    0;
  const baseViews =
    initialViews ??
    post?.view_count ??
    post?.views_count ??
    0;

  // Local storage cache lookup for instant optimistic fidelity
  const getCachedLiked = () => {
    if (initialLiked !== undefined) return initialLiked;
    try {
      const likesMap = JSON.parse(
        localStorage.getItem("fialgo_local_post_likes") || "{}"
      );
      if (likesMap[postId] !== undefined) return Boolean(likesMap[postId]);
    } catch { /* ignore */ }
    return Boolean(post?.has_liked);
  };

  const getCachedBookmarked = () => {
    if (initialBookmarked !== undefined) return initialBookmarked;
    try {
      const bmMap = JSON.parse(
        localStorage.getItem("fialgo_local_bookmarks") || "{}"
      );
      if (bmMap[postId] !== undefined) return Boolean(bmMap[postId]);
    } catch { /* ignore */ }
    return Boolean(post?.bookmark_count && post.bookmark_count > 0);
  };

  const getCachedReposted = () => {
    if (initialReposted !== undefined) return initialReposted;
    try {
      const rpMap = JSON.parse(
        localStorage.getItem("tradifive_reposted_posts") || "{}"
      );
      return Boolean(rpMap[postId]);
    } catch { /* ignore */ }
    return false;
  };

  const [isLiked, setIsLiked] = useState<boolean>(getCachedLiked);
  const [likesCount, setLikesCount] = useState<number>(Number(baseLikes));
  const [commentCount, setCommentCount] = useState<number>(Number(baseComments));
  const [isReposted, setIsReposted] = useState<boolean>(getCachedReposted);
  const [repostCount, setRepostCount] = useState<number>(Number(baseReposts));
  const [isBookmarked, setIsBookmarked] = useState<boolean>(getCachedBookmarked);
  const [viewCount, setViewCount] = useState<number>(Number(baseViews));

  const [showBurst, setShowBurst] = useState(false);
  const isBusyLike = useRef(false);
  const isBusyBookmark = useRef(false);
  const isBusyRepost = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Update states if props change externally
  useEffect(() => {
    if (initialLiked !== undefined) setIsLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    if (initialLikes !== undefined) setLikesCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    if (initialComments !== undefined) setCommentCount(initialComments);
  }, [initialComments]);

  useEffect(() => {
    if (initialBookmarked !== undefined) setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  // 2. Real-time Cross-Component Event Bus Sync
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<PostActionSyncPayload>;
      const data = customEvent.detail;
      if (!data || data.postId !== postId) return;

      if (data.isLiked !== undefined) setIsLiked(data.isLiked);
      if (data.likeCount !== undefined) setLikesCount(data.likeCount);
      if (data.isBookmarked !== undefined) setIsBookmarked(data.isBookmarked);
      if (data.isReposted !== undefined) setIsReposted(data.isReposted);
      if (data.repostCount !== undefined) setRepostCount(data.repostCount);
      if (data.commentCount !== undefined) setCommentCount(data.commentCount);
      if (data.viewCount !== undefined) setViewCount(data.viewCount);
    };

    window.addEventListener(POST_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(POST_SYNC_EVENT, handleSync);
  }, [postId]);

  // 3. Supabase Realtime Channels for Live Cross-User Sync
  useEffect(() => {
    if (!postId || String(postId).startsWith("local-")) return;

    const channelName = `realtime-post-bar-${postId}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      // Realtime likes changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "social_post_likes",
          filter: `post_id=eq.${postId}`,
        },
        (payload: any) => {
          if (!isMounted.current) return;
          if (payload.eventType === "INSERT") {
            const insertedUserId = payload.new?.user_id;
            if (insertedUserId && currentUserId && insertedUserId === currentUserId) {
              setIsLiked(true);
            }
            setLikesCount((prev) => prev + 1);
          } else if (payload.eventType === "DELETE") {
            const deletedUserId = payload.old?.user_id;
            if (deletedUserId && currentUserId && deletedUserId === currentUserId) {
              setIsLiked(false);
            }
            setLikesCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      // Realtime comments changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "social_post_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload: any) => {
          if (!isMounted.current) return;
          if (payload.eventType === "INSERT") {
            setCommentCount((prev) => prev + 1);
          } else if (payload.eventType === "DELETE") {
            setCommentCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      // Realtime post counter changes
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "social_posts",
          filter: `id=eq.${postId}`,
        },
        (payload: any) => {
          if (!isMounted.current) return;
          const updated = payload.new;
          if (updated) {
            if (typeof updated.like_count === "number") {
              setLikesCount(updated.like_count);
            }
            if (typeof updated.comment_count === "number") {
              setCommentCount(updated.comment_count);
            }
            if (typeof updated.share_count === "number") {
              setRepostCount(updated.share_count);
            }
            if (typeof updated.view_count === "number") {
              setViewCount(updated.view_count);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, currentUserId]);

  // 4. Initial Sync with Supabase on Mount (checks if current user liked/bookmarked this post)
  useEffect(() => {
    if (!postId || !currentUserId || String(postId).startsWith("local-")) return;

    let active = true;
    const fetchUserInteractions = async () => {
      try {
        const [likeRes, bmRes] = await Promise.all([
          supabase
            .from("social_post_likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", currentUserId)
            .maybeSingle(),
          supabase
            .from("social_post_bookmarks")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", currentUserId)
            .maybeSingle(),
        ]);

        if (!active) return;

        if (likeRes.data) {
          setIsLiked(true);
          try {
            const map = JSON.parse(localStorage.getItem("fialgo_local_post_likes") || "{}");
            map[postId] = true;
            localStorage.setItem("fialgo_local_post_likes", JSON.stringify(map));
          } catch { /* ignore */ }
        }

        if (bmRes.data) {
          setIsBookmarked(true);
          try {
            const map = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
            map[postId] = true;
            localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(map));
          } catch { /* ignore */ }
        }
      } catch (err) {
        // Safe fallback
      }
    };

    fetchUserInteractions();
    return () => {
      active = false;
    };
  }, [postId, currentUserId]);

  // 5. Actions Handlers
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Please log in to like posts.");
      return;
    }
    if (isBusyLike.current) return;
    isBusyLike.current = true;

    const nextLiked = !isLiked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));

    // Play crisp micro-interaction sound
    playSound(nextLiked ? 'like' : 'unlike');

    // Instant optimistic UI
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }

    if (onLike) {
      try { onLike(postId); } catch { /* ignore */ }
    }

    // Local storage backup
    try {
      const map = JSON.parse(localStorage.getItem("fialgo_local_post_likes") || "{}");
      if (nextLiked) {
        map[postId] = true;
      } else {
        delete map[postId];
      }
      localStorage.setItem("fialgo_local_post_likes", JSON.stringify(map));
    } catch { /* ignore */ }

    // Broadcast to other components
    broadcastPostSync({
      postId,
      action: "like",
      isLiked: nextLiked,
      likeCount: nextCount,
    });

    // Remote persistence
    if (!String(postId).startsWith("local-")) {
      try {
        if (nextLiked) {
          const { error } = await supabase
            .from("social_post_likes")
            .insert([{ post_id: postId, user_id: currentUserId }]);
          if (error && error.code !== "23505") { // Ignore unique conflict
            throw error;
          }
        } else {
          const { error } = await supabase
            .from("social_post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", currentUserId);
          if (error) throw error;
        }
      } catch (err) {
        console.error("Failed to toggle like in Supabase:", err);
        // Revert on error
        setIsLiked(!nextLiked);
        setLikesCount(likesCount);
        broadcastPostSync({
          postId,
          action: "like",
          isLiked: !nextLiked,
          likeCount: likesCount,
        });
        toast.error("Could not update like. Please try again.");
      } finally {
        isBusyLike.current = false;
      }
    } else {
      isBusyLike.current = false;
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Please log in to save bookmarks.");
      return;
    }
    if (isBusyBookmark.current) return;
    isBusyBookmark.current = true;

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    playSound(nextBookmarked ? 'pop' : 'click');

    try {
      const map = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
      if (nextBookmarked) {
        map[postId] = true;
        toast.success("Post saved to bookmarks!");
      } else {
        delete map[postId];
        toast.info("Post removed from bookmarks.");
      }
      localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(map));
    } catch { /* ignore */ }

    broadcastPostSync({
      postId,
      action: "bookmark",
      isBookmarked: nextBookmarked,
    });

    if (!String(postId).startsWith("local-")) {
      try {
        if (nextBookmarked) {
          await supabase
            .from("social_post_bookmarks")
            .insert([{ post_id: postId, user_id: currentUserId }]);
        } else {
          await supabase
            .from("social_post_bookmarks")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", currentUserId);
        }
      } catch (err) {
        console.error("Failed to toggle bookmark in Supabase:", err);
      } finally {
        isBusyBookmark.current = false;
      }
    } else {
      isBusyBookmark.current = false;
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Please log in to repost.");
      return;
    }
    if (isBusyRepost.current) return;
    isBusyRepost.current = true;

    const nextReposted = !isReposted;
    const nextCount = Math.max(0, repostCount + (nextReposted ? 1 : -1));

    setIsReposted(nextReposted);
    setRepostCount(nextCount);
    playSound(nextReposted ? 'toggleOn' : 'toggleOff');

    try {
      const rpMap = JSON.parse(localStorage.getItem("tradifive_reposted_posts") || "{}");
      if (nextReposted) {
        rpMap[postId] = true;
        toast.success("Reposted to your profile!");
      } else {
        delete rpMap[postId];
        toast.info("Repost removed.");
      }
      localStorage.setItem("tradifive_reposted_posts", JSON.stringify(rpMap));

      const countMap = JSON.parse(localStorage.getItem("tradifive_repost_counts") || "{}");
      countMap[postId] = nextCount;
      localStorage.setItem("tradifive_repost_counts", JSON.stringify(countMap));
    } catch { /* ignore */ }

    broadcastPostSync({
      postId,
      action: "repost",
      isReposted: nextReposted,
      repostCount: nextCount,
    });

    if (!String(postId).startsWith("local-")) {
      try {
        const { data } = await supabase
          .from("social_posts")
          .select("share_count")
          .eq("id", postId)
          .maybeSingle();
        const currentCount = Number(data?.share_count ?? 0);
        const updatedCount = Math.max(0, currentCount + (nextReposted ? 1 : -1));
        await supabase
          .from("social_posts")
          .update({ share_count: updatedCount })
          .eq("id", postId);
      } catch (err) {
        console.error("Failed to update repost in Supabase:", err);
      } finally {
        isBusyRepost.current = false;
      }
    } else {
      isBusyRepost.current = false;
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playSound('click');

    const authorName = post?.profiles?.full_name || "TradiFive Trader";
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareData = {
      title: `Post by ${authorName}`,
      text: post?.content?.substring(0, 100) || "Check out this post on TradiFive!",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Post link copied to clipboard! 📋");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Post link copied to clipboard! 📋");
        } catch (_) {
          toast.error("Could not share post.");
        }
      }
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playSound('tab');
    if (onCommentClick) {
      onCommentClick();
    } else {
      navigate(`/post/${postId}`, {
        state: {
          post,
          currentUserId,
          isLiked,
          likes: likesCount,
          isReposted,
          repostCount,
          viewCount,
          isBookmarked,
        },
      });
    }
  };

  return (
    <div
      className={`flex items-center justify-between text-slate-500 dark:text-neutral-400 select-none ${className}`}
    >
      {/* 1. Comment / Reply */}
      <button
        type="button"
        onClick={handleComment}
        className="group flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-full transition-all duration-150 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer"
        title="Reply"
      >
        <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-95">
          <IconlyChat
            set="curved"
            stroke="bold"
            primaryColor="currentColor"
            size={18}
          />
        </span>
        {commentCount > 0 && (
          <span className="text-[12.5px] font-semibold font-sans tabular-nums leading-none">
            <AnimatedNumber value={commentCount} />
          </span>
        )}
      </button>

      {/* 2. Repost / Retweet */}
      <button
        type="button"
        onClick={handleRepost}
        className={`group flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-150 cursor-pointer ${
          isReposted
            ? "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-bold"
            : "hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
        }`}
        title={isReposted ? "Undo Repost" : "Repost"}
      >
        <span
          className={`inline-flex transition-transform duration-200 group-hover:scale-110 group-active:scale-90 ${
            isReposted ? "rotate-180" : ""
          }`}
        >
          <IconlySwap
            set="curved"
            stroke="bold"
            primaryColor="currentColor"
            size={18}
          />
        </span>
        {repostCount > 0 && (
          <span className="text-[12.5px] font-semibold font-sans tabular-nums leading-none">
            <AnimatedNumber value={repostCount} />
          </span>
        )}
      </button>

      {/* 3. Like with Heart Burst Animation */}
      <button
        type="button"
        onClick={handleLike}
        className={`group flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-150 cursor-pointer ${
          isLiked
            ? "text-rose-500 dark:text-rose-500 bg-rose-50/80 dark:bg-rose-500/10 font-bold"
            : "hover:text-rose-500 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        }`}
        title={isLiked ? "Unlike" : "Like"}
      >
        <div className="relative flex items-center justify-center">
          <AnimatePresence>{showBurst && <LikeParticleBurst />}</AnimatePresence>
          <motion.span
            animate={isLiked ? { scale: [1, 1.32, 1] } : { scale: 1 }}
            transition={{ duration: 0.28, type: "spring", stiffness: 500 }}
            className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90"
          >
            <IconlyHeart
              set={isLiked ? "bold" : "curved"}
              stroke="bold"
              primaryColor="currentColor"
              size={18}
            />
          </motion.span>
        </div>
        {likesCount > 0 && (
          <span className="text-[12.5px] font-semibold font-sans tabular-nums leading-none">
            <AnimatedNumber value={likesCount} />
          </span>
        )}
      </button>

      {/* 4. Bookmark */}
      <button
        type="button"
        onClick={handleBookmark}
        className={`group flex items-center p-1.5 rounded-full transition-all duration-150 cursor-pointer ${
          isBookmarked
            ? "text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
            : "hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        }`}
        title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
      >
        <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
          <IconlyBookmark
            set={isBookmarked ? "bold" : "curved"}
            stroke="bold"
            primaryColor="currentColor"
            size={18}
          />
        </span>
      </button>

      {/* 5. Impressions / Views */}
      <div
        className="group flex items-center gap-1.5 text-slate-450 dark:text-neutral-400 p-1.5 rounded-full transition-colors hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-default select-none"
        title={`${viewCount.toLocaleString()} views`}
      >
        <span className="inline-flex transition-transform duration-150 group-hover:scale-105">
          <IconlyChart
            set="curved"
            stroke="bold"
            primaryColor="currentColor"
            size={17}
          />
        </span>
        <span className="text-[12.5px] font-medium font-sans tabular-nums leading-none">
          {formatCompactViews(viewCount)}
        </span>
      </div>

      {/* 6. Share */}
      <button
        type="button"
        onClick={handleShare}
        className="group flex items-center p-1.5 -mr-1.5 rounded-full transition-all duration-150 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
        title="Share"
      >
        <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
          <IconlySend
            set="curved"
            stroke="bold"
            primaryColor="currentColor"
            size={18}
          />
        </span>
      </button>
    </div>
  );
}
