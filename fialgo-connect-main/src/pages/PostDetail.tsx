import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  X,
  Lock,
  Loader2,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Smile,
  MoreHorizontal,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Heart as IconlyHeart,
  Chat as IconlyChat,
  Swap as IconlySwap,
  Bookmark as IconlyBookmark,
  Chart as IconlyChart,
  Upload as IconlyUpload,
} from "react-iconly";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string | null;
  parent_comment_id: string | null;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const QUICK_EMOJIS = ["🔥", "🚀", "📈", "📉", "💎", "👏", "🎯", "💯", "😂", "❤️", "🫡", "⚡"];

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as any) || {};

  const [post, setPost] = useState<any>(navState.post || null);
  const [postLoading, setPostLoading] = useState(!navState.post);
  const [currentUserId, setCurrentUserId] = useState<string>(navState.currentUserId || "");

  // Interactive post metrics (initialized from router state for instant render)
  const [isLiked, setIsLiked] = useState<boolean>(Boolean(navState.isLiked));
  const [likes, setLikes] = useState<number>(Number(navState.likes ?? 0));
  const [isReposted, setIsReposted] = useState<boolean>(Boolean(navState.isReposted));
  const [repostCount, setRepostCount] = useState<number>(Number(navState.repostCount ?? 0));
  const [viewCount, setViewCount] = useState<number>(Number(navState.viewCount ?? 0));
  const [isBookmarked, setIsBookmarked] = useState<boolean>(Boolean(navState.isBookmarked));
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(navState.isFollowing));

  // Media gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Comments & composer state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyTargetName, setReplyTargetName] = useState<string>("");
  const [replyTargetHandle, setReplyTargetHandle] = useState<string>("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showEmojiStrip, setShowEmojiStrip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<string[]>([]);

  // Visual viewport tracking so the expanded reply composer rides cleanly above the mobile keyboard
  const [keyboardOffsetBottom, setKeyboardOffsetBottom] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUserAvatar =
    localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg";

  // Resolve current user ID
  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (active && data?.user?.id) {
          setCurrentUserId(data.user.id);
        }
      } catch {
        // ignore
      }
    };
    loadUser();
    return () => {
      active = false;
    };
  }, []);

  // Load post if opened directly via URL (or refresh)
  useEffect(() => {
    if (!postId) return;
    if (navState.post && navState.post.id === postId) {
      setPost(navState.post);
      setPostLoading(false);
      return;
    }

    let active = true;
    const fetchPost = async () => {
      setPostLoading(true);
      try {
        // Check local optimistic posts first
        const localPosts = JSON.parse(localStorage.getItem("fialgo_local_posts") || "[]");
        const localMatch = localPosts.find((p: any) => String(p.id) === String(postId));
        if (localMatch && active) {
          setPost(localMatch);
          setLikes(Number(localMatch.like_count ?? localMatch.likes_count ?? 0));
          setRepostCount(Number(localMatch.share_count ?? 0));
          setViewCount(Number(localMatch.view_count ?? 0));
          setPostLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("social_posts")
          .select("*, profiles(id, full_name, display_name, username, avatar_url, account_type)")
          .eq("id", postId)
          .maybeSingle();

        if (!error && data && active) {
          setPost(data);
          setLikes(Number((data as any).like_count ?? (data as any).likes_count ?? 0));
          setRepostCount(Number((data as any).share_count ?? 0));
          setViewCount(Number((data as any).view_count ?? 0));
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        if (active) setPostLoading(false);
      }
    };

    fetchPost();
    return () => {
      active = false;
    };
  }, [postId]);

  // Sync local liked / reposted / bookmarked / follow state when loaded directly
  useEffect(() => {
    if (!postId || !post) return;
    try {
      const reposts = JSON.parse(localStorage.getItem("tradifive_reposted_posts") || "{}");
      if (reposts[postId] !== undefined) setIsReposted(Boolean(reposts[postId]));
      const rCounts = JSON.parse(localStorage.getItem("tradifive_repost_counts") || "{}");
      if (typeof rCounts[postId] === "number") setRepostCount((p) => Math.max(p, rCounts[postId]));
      const vCounts = JSON.parse(localStorage.getItem("tradifive_view_counts") || "{}");
      if (typeof vCounts[postId] === "number") setViewCount((p) => Math.max(p, vCounts[postId]));
      const bookmarks = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
      if (bookmarks[postId] !== undefined) setIsBookmarked(Boolean(bookmarks[postId]));
      const localLikedComments = JSON.parse(localStorage.getItem("fialgo_local_comment_likes") || "[]");
      setLikedComments(localLikedComments);
    } catch {
      // ignore
    }
  }, [postId, post?.id]);

  // Sync follow & like status with Supabase when opened directly without navState
  useEffect(() => {
    if (!currentUserId || !postId || !post) return;
    const syncStatus = async () => {
      try {
        if (navState.isLiked === undefined && !String(postId).startsWith("local-")) {
          const { data: likeRow } = await supabase
            .from("social_post_likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", currentUserId)
            .maybeSingle();
          if (likeRow) setIsLiked(true);
        }
        const postAuthorId =
          typeof post.user_id === "object"
            ? post.user_id?.id || ""
            : post.user_id || post.profiles?.id || "";
        if (navState.isFollowing === undefined && postAuthorId && String(postAuthorId) !== String(currentUserId)) {
          const { data: followRow } = await supabase
            .from("social_follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", postAuthorId)
            .maybeSingle();
          if (followRow) setIsFollowing(true);
        }
      } catch {
        // ignore
      }
    };
    syncStatus();
  }, [currentUserId, postId, post?.user_id]);

  // Fetch comments
  useEffect(() => {
    if (!postId) return;
    let active = true;
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        let dbComments: Comment[] = [];
        if (!String(postId).startsWith("local-")) {
          try {
            const { data, error } = await supabase
              .from("social_post_comments")
              .select("*, profiles(full_name, username, avatar_url)")
              .eq("post_id", postId)
              .order("created_at", { ascending: true });
            if (!error && data) {
              dbComments = data as any;
            }
          } catch (err) {
            console.warn("Supabase read error:", err);
          }
        }

        const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
        const filteredLocal = localComments.filter((c: any) => String(c.post_id) === String(postId));

        const combined = [...dbComments, ...filteredLocal];
        combined.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeA - timeB;
        });

        if (active) setComments(combined);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        if (active) setCommentsLoading(false);
      }
    };
    fetchComments();
    return () => {
      active = false;
    };
  }, [postId]);

  // Track mobile virtual keyboard height so the reply composer sits right above it
  useEffect(() => {
    if (!isComposerOpen) {
      setKeyboardOffsetBottom(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;

    const updateOffset = () => {
      const keyboardHeight = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setKeyboardOffsetBottom(keyboardHeight);
    };

    updateOffset();
    vv.addEventListener("resize", updateOffset);
    vv.addEventListener("scroll", updateOffset);
    return () => {
      vv.removeEventListener("resize", updateOffset);
      vv.removeEventListener("scroll", updateOffset);
    };
  }, [isComposerOpen]);

  // Auto-focus textarea when composer opens
  useEffect(() => {
    if (isComposerOpen) {
      const t = window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(t);
    }
  }, [isComposerOpen, replyingToCommentId]);

  const authorId =
    typeof post?.user_id === "object"
      ? post.user_id?.id || ""
      : post?.user_id || post?.profiles?.id || "";
  const authorName =
    post?.profiles?.full_name || post?.profiles?.display_name || "Anonymous Trader";
  const authorHandle = post?.profiles?.username ? `@${post.profiles.username}` : "@anonymous";
  const authorAvatar = post?.profiles?.avatar_url || "/default-avatar.svg";
  const targetProfileParam =
    post?.profiles?.username || authorId || authorHandle.replace("@", "");
  const allowComments = post?.allow_comments !== false;
  const isOwnPost = Boolean(
    currentUserId && authorId && String(authorId) === String(currentUserId)
  );

  // Parse location, optional heading, and body
  let parsedContent = post?.content || "";
  let locationNameVal = "";
  let parsedHeadingVal = "";
  const locMatch = parsedContent.match(/^📍\s+(.+)(?:\n|$)/);
  if (locMatch) {
    locationNameVal = locMatch[1].trim();
    parsedContent = parsedContent.replace(/^📍\s+.+(?:\n|$)/, "");
  }
  const headingMatch = parsedContent.match(/^###\s+(.+)(?:\n|$)/);
  if (headingMatch) {
    parsedHeadingVal = headingMatch[1].trim();
    parsedContent = parsedContent.replace(/^###\s+.+(?:\n|$)/, "");
  }
  parsedContent = parsedContent.trim();

  const postTags: string[] = Array.isArray(post?.tags) ? post.tags : [];
  const inlineTagsLower = new Set(
    Array.from(parsedContent.matchAll(/#([A-Za-z0-9_]+)/g)).map((m: any) => m[1].toLowerCase())
  );
  const extraPostTags = postTags.filter((t) => !inlineTagsLower.has(t.toLowerCase()));

  // Media parsing
  const rawMediaUrls = Array.isArray(post?.media_urls)
    ? post.media_urls.filter(
        (u: any) =>
          typeof u === "string" &&
          u.trim() !== "" &&
          !u.trim().startsWith("{") &&
          !u.trim().startsWith("[")
      )
    : [];
  const hasMultipleImages = rawMediaUrls.length > 1;
  const currentImageUrl =
    rawMediaUrls.length > 0
      ? rawMediaUrls[currentImageIndex]
      : post?.post_type !== "poll" && post?.post_type !== "signal"
        ? post?.media_url
        : null;

  let pollData: { options: string[]; votes: number[] } | null = null;
  let signalData: { action: string; asset: string; entry: string; tp: string; sl: string } | null =
    null;
  if (post?.post_type === "poll" && post?.media_url) {
    try {
      pollData = JSON.parse(post.media_url);
    } catch {}
  } else if (post?.post_type === "signal" && post?.media_url) {
    try {
      signalData = JSON.parse(post.media_url);
    } catch {}
  }

  // Action handlers
  const handleToggleFollow = async () => {
    if (!currentUserId || !authorId || isOwnPost) return;
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) {
        const { error } = await supabase
          .from("social_follows")
          .insert([{ follower_id: currentUserId, following_id: authorId }]);
        if (error) throw error;
        toast.success(`Following ${authorName}`);
      } else {
        const { error } = await supabase
          .from("social_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", authorId);
        if (error) throw error;
        toast.info(`Unfollowed ${authorName}`);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      setIsFollowing(!next);
      toast.error("Failed to update follow status.");
    }
  };

  const handleToggleLike = async () => {
    if (!postId) return;
    if (!currentUserId) {
      toast.error("Please log in to like posts.");
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    const nextLikes = Math.max(0, likes + (next ? 1 : -1));
    setLikes(nextLikes);

    if (!String(postId).startsWith("local-")) {
      try {
        if (next) {
          await supabase
            .from("social_post_likes")
            .insert([{ post_id: postId, user_id: currentUserId }]);
        } else {
          await supabase
            .from("social_post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", currentUserId);
        }
        await supabase.from("social_posts").update({ like_count: nextLikes }).eq("id", postId);
      } catch (err) {
        console.error("Like toggle error:", err);
      }
    }
  };

  const handleRepost = async () => {
    if (!postId) return;
    if (!currentUserId) {
      toast.error("Please log in to repost.");
      return;
    }
    const next = !isReposted;
    setIsReposted(next);
    const nextCount = Math.max(0, repostCount + (next ? 1 : -1));
    setRepostCount(nextCount);

    try {
      const reposts = JSON.parse(localStorage.getItem("tradifive_reposted_posts") || "{}");
      if (next) {
        reposts[postId] = true;
        toast.success("Reposted!");
      } else {
        delete reposts[postId];
        toast.info("Repost removed");
      }
      localStorage.setItem("tradifive_reposted_posts", JSON.stringify(reposts));
      const counts = JSON.parse(localStorage.getItem("tradifive_repost_counts") || "{}");
      counts[postId] = nextCount;
      localStorage.setItem("tradifive_repost_counts", JSON.stringify(counts));
    } catch {}

    if (!String(postId).startsWith("local-")) {
      try {
        await supabase.from("social_posts").update({ share_count: nextCount }).eq("id", postId);
      } catch {}
    }
  };

  const handleBookmark = async () => {
    if (!postId) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      const bookmarks = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
      if (next) {
        bookmarks[postId] = true;
        toast.success("Post saved to bookmarks!");
      } else {
        delete bookmarks[postId];
        toast.info("Post removed from bookmarks.");
      }
      localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(bookmarks));
    } catch {}

    if (currentUserId && !String(postId).startsWith("local-")) {
      try {
        if (next) {
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
      } catch {}
    }
  };

  const handleShare = async () => {
    if (!postId) return;
    const shareUrl = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${authorName}`,
          text: parsedContent || "Check out this post!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch {}
  };

  const openReplyComposer = (
    parentId: string | null,
    targetName: string,
    targetHandle: string
  ) => {
    setReplyingToCommentId(parentId);
    setReplyTargetName(targetName);
    setReplyTargetHandle(targetHandle.startsWith("@") ? targetHandle : `@${targetHandle}`);
    setIsComposerOpen(true);
    setShowEmojiStrip(false);
  };

  const closeReplyComposer = () => {
    setIsComposerOpen(false);
    setShowEmojiStrip(false);
    setReplyingToCommentId(null);
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const liked = prev.includes(commentId);
      const next = liked ? prev.filter((id) => id !== commentId) : [...prev, commentId];
      try {
        localStorage.setItem("fialgo_local_comment_likes", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handlePublishComment = async (text: string, parentId: string | null = null) => {
    if (!postId || !text.trim() || submitting) return;
    if (!allowComments) {
      toast.error("Comments are locked for this post.");
      return;
    }

    setSubmitting(true);
    const contentText = text.trim();
    const newCommentPayload = {
      post_id: postId,
      user_id: currentUserId || "mock-user-id",
      content: contentText,
      parent_comment_id: parentId,
      created_at: new Date().toISOString(),
    };

    try {
      let publishedComment: Comment | null = null;
      try {
        const { data, error } = await supabase
          .from("social_post_comments")
          .insert([newCommentPayload])
          .select("*, profiles(full_name, username, avatar_url)")
          .single();
        if (error) throw error;
        if (data) publishedComment = data as any;
      } catch {
        const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
        const mockProfile = {
          full_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
          username: localStorage.getItem("tradifive_cached_username") || "trader",
          avatar_url: localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg",
        };
        const offlineComment = {
          id: `local-comment-${Date.now()}`,
          ...newCommentPayload,
          profiles: mockProfile,
        };
        localComments.push(offlineComment);
        try {
          localStorage.setItem("fialgo_local_comments", JSON.stringify(localComments.slice(-50)));
        } catch {}
        publishedComment = offlineComment;
      }

      if (publishedComment) {
        const updatedList = [...comments, publishedComment];
        setComments(updatedList);
        try {
          const localCommentCounts = JSON.parse(
            localStorage.getItem("fialgo_local_comment_counts") || "{}"
          );
          localCommentCounts[postId] = updatedList.length;
          localStorage.setItem("fialgo_local_comment_counts", JSON.stringify(localCommentCounts));
        } catch {}
        setInputText("");
        setIsComposerOpen(false);
        setShowEmojiStrip(false);
        setReplyingToCommentId(null);
        toast.success("Reply published!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit reply.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId) return;
    try {
      if (!commentId.startsWith("local-comment-")) {
        try {
          await supabase.from("social_post_comments").delete().eq("id", commentId);
        } catch {}
      }
      const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
      if (localComments.some((c: any) => c.id === commentId)) {
        localStorage.setItem(
          "fialgo_local_comments",
          JSON.stringify(localComments.filter((c: any) => c.id !== commentId))
        );
      }
      const updatedList = comments.filter(
        (c) => c.id !== commentId && c.parent_comment_id !== commentId
      );
      setComments(updatedList);
      try {
        const localCommentCounts = JSON.parse(
          localStorage.getItem("fialgo_local_comment_counts") || "{}"
        );
        localCommentCounts[postId] = updatedList.length;
        localStorage.setItem("fialgo_local_comment_counts", JSON.stringify(localCommentCounts));
      } catch {}
      toast.success("Reply deleted");
    } catch {
      toast.error("Failed to delete reply.");
    }
  };

  const formatShortTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "now";
    const date = new Date(dateStr);
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatCompactCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(count);
  };

  const renderStyledPostText = (text: string) => {
    const tokenRegex = /(\$[A-Za-z][A-Za-z0-9._-]{0,14}|#[A-Za-z0-9_]+|@[A-Za-z0-9_.]+)/g;
    return text.split(tokenRegex).map((part, idx) => {
      if (!part) return null;
      if (part.startsWith("$") || part.startsWith("#")) {
        return (
          <span key={idx} className="text-blue-600 dark:text-blue-400 font-medium">
            {part}
          </span>
        );
      }
      if (part.startsWith("@")) {
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/${part.slice(1)}`);
            }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const rootComments = comments.filter((c) => !c.parent_comment_id);
  const repliesMap = comments.reduce((acc, c) => {
    if (c.parent_comment_id) {
      if (!acc[c.parent_comment_id]) acc[c.parent_comment_id] = [];
      acc[c.parent_comment_id].push(c);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  return (
    <DashboardLayout noScroll noPadding>
      <div className="w-full h-full flex flex-col items-center min-h-0 bg-white dark:bg-[#121212]">
        {/* Flat Post Stream — Sits directly inside the single global DashboardLayout surface */}
        <div className="w-full max-w-[680px] flex-1 min-h-0 flex flex-col overflow-hidden font-sans text-slate-900 dark:text-slate-100">
          {/* Header: Circular Back (<) + "Post" */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200/85 dark:border-white/[0.09] shrink-0 bg-white dark:bg-[#121212]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft size={19} strokeWidth={2.4} />
              </button>
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
                Post
              </h1>
            </div>
          </div>

          {postLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : !post ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-[15px] font-semibold text-slate-500">Post not found.</p>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="px-5 py-2 rounded-full tactile-black-pill text-[13px] font-bold cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              {/* Scrollable Post + Replies Stream */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar min-h-0 overscroll-contain">
                {/* Original Post Block (Two-Column Editorial Layout) */}
                <div className="px-4 sm:px-5 pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    {/* Left Column: Avatar */}
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      onClick={() => navigate(`/user/${targetProfileParam}`)}
                      className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />

                    {/* Right Column: Author, Content, Media, Actions */}
                    <div className="flex-1 min-w-0">
                      {/* Author Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          onClick={() => navigate(`/user/${targetProfileParam}`)}
                          className="flex items-center gap-1.5 min-w-0 flex-wrap cursor-pointer"
                        >
                          <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {authorName}
                          </span>
                          <span className="text-[13.5px] font-normal text-slate-400 dark:text-neutral-500 shrink-0">
                            · {formatShortTime(post.created_at)}
                          </span>
                          {post.profiles?.account_type === "creator" && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
                              <Crown size={10} className="text-purple-600 dark:text-purple-400" />
                              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                Creator
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isOwnPost && authorId && (
                            <button
                              type="button"
                              onClick={handleToggleFollow}
                              className={`px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer select-none flex items-center gap-1 ${
                                isFollowing ? "tactile-white-pill" : "tactile-black-pill"
                              }`}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck size={11} strokeWidth={2.4} /> Following
                                </>
                              ) : (
                                "Follow"
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleShare}
                            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Share post"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Location */}
                      {locationNameVal && (
                        <div className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 mt-1">
                          <MapPin size={11} />
                          <span>{locationNameVal}</span>
                        </div>
                      )}

                      {/* Optional Post Heading */}
                      {parsedHeadingVal && (
                        <h2 className="mt-1.5 mb-1 text-[16.5px] font-bold text-slate-900 dark:text-white leading-snug tracking-tight break-words">
                          {parsedHeadingVal}
                        </h2>
                      )}

                      {/* Post Body */}
                      {parsedContent && (
                        <div
                          className={`${
                            parsedHeadingVal ? "mt-1" : "mt-1.5"
                          } text-[15px] text-slate-800 dark:text-slate-100 leading-[1.5] whitespace-pre-wrap select-text break-words`}
                        >
                          {renderStyledPostText(parsedContent)}
                        </div>
                      )}

                      {/* Extra Hashtags */}
                      {extraPostTags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                          {extraPostTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[14.5px] font-medium text-blue-600 dark:text-blue-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Media */}
                      {currentImageUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/40 relative">
                          {post.media_type === "video" ? (
                            <video
                              src={currentImageUrl}
                              controls
                              playsInline
                              className="w-full max-h-[380px] object-contain bg-black"
                            />
                          ) : (
                            <img
                              src={currentImageUrl}
                              alt="Post attachment"
                              onClick={() => setLightboxImage(currentImageUrl)}
                              className="w-full max-h-[420px] object-cover cursor-pointer select-none"
                            />
                          )}
                          {hasMultipleImages && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setCurrentImageIndex((prev) =>
                                    prev > 0 ? prev - 1 : rawMediaUrls.length - 1
                                  )
                                }
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCurrentImageIndex((prev) =>
                                    prev < rawMediaUrls.length - 1 ? prev + 1 : 0
                                  )
                                }
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Trading Signal Card */}
                      {signalData && (
                        <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0D18] overflow-hidden">
                          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <TrendingUp size={15} />
                              </span>
                              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                                Trading Signal
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  signalData.action === "Buy"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-rose-500/10 text-rose-600"
                                }`}
                              >
                                {signalData.action}
                              </span>
                              <span className="text-xs font-black">{signalData.asset}</span>
                            </div>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-2.5 text-center">
                            <div className="bg-slate-50 dark:bg-[#151720] rounded-xl p-2.5">
                              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                                Entry
                              </span>
                              <span className="text-sm font-black">{signalData.entry || "-"}</span>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl p-2.5">
                              <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                                Target
                              </span>
                              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                                {signalData.tp || "-"}
                              </span>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-500/5 rounded-xl p-2.5">
                              <span className="block text-[10px] font-bold text-rose-600 uppercase">
                                Stop
                              </span>
                              <span className="text-sm font-black text-rose-700 dark:text-rose-400">
                                {signalData.sl || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Poll Preview */}
                      {pollData && (
                        <div className="mt-3 space-y-2">
                          {pollData.options.map((opt, idx) => {
                            const total = pollData!.votes.reduce((a, b) => a + b, 0);
                            const pct =
                              total > 0 ? Math.round(((pollData!.votes[idx] || 0) / total) * 100) : 0;
                            return (
                              <div
                                key={idx}
                                className="relative p-3 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] flex items-center justify-between overflow-hidden"
                              >
                                <div
                                  className="absolute inset-y-0 left-0 bg-blue-500/10"
                                  style={{ width: `${pct}%` }}
                                />
                                <span className="relative z-10 text-[13.5px] font-semibold flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-slate-400" />
                                  {opt}
                                </span>
                                <span className="relative z-10 text-[12.5px] font-bold text-slate-500">
                                  {pct}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Cute Curved Iconly 6-Action Bar: Comment, Repost, Like, Bookmark, Views, Share */}
                      <div className="flex items-center justify-between pt-3 mt-2 text-slate-500 dark:text-neutral-400">
                        <button
                          type="button"
                          onClick={() => openReplyComposer(null, authorName, authorHandle)}
                          className="flex items-center gap-1.5 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors group p-1.5 -ml-1.5 rounded-full cursor-pointer"
                          title="Reply"
                        >
                          <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
                            <IconlyChat set="curved" stroke="bold" primaryColor="currentColor" size={19} />
                          </span>
                          {comments.length > 0 && (
                            <span className="text-[12.5px] font-medium tabular-nums">
                              {comments.length}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleRepost}
                          className={`flex items-center gap-1.5 transition-colors group p-1.5 rounded-full cursor-pointer ${
                            isReposted ? "text-emerald-500" : "hover:text-emerald-500"
                          }`}
                          title="Repost"
                        >
                          <span className="inline-flex transition-transform duration-200 group-hover:scale-110 group-active:scale-90">
                            <IconlySwap set="curved" stroke="bold" primaryColor="currentColor" size={19} />
                          </span>
                          {repostCount > 0 && (
                            <span className="text-[12.5px] font-medium tabular-nums">
                              {repostCount}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleToggleLike}
                          className={`flex items-center gap-1.5 transition-colors group p-1.5 rounded-full cursor-pointer ${
                            isLiked ? "text-rose-500" : "hover:text-rose-500"
                          }`}
                          title="Like"
                        >
                          <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
                            <IconlyHeart
                              set={isLiked ? "bold" : "curved"}
                              stroke="bold"
                              primaryColor="currentColor"
                              size={19}
                            />
                          </span>
                          {likes > 0 && (
                            <span className="text-[12.5px] font-medium tabular-nums">{likes}</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleBookmark}
                          className={`p-1.5 rounded-full transition-colors group cursor-pointer ${
                            isBookmarked ? "text-[#2563EB] dark:text-blue-400" : "hover:text-[#2563EB] dark:hover:text-blue-400"
                          }`}
                          title="Bookmark"
                        >
                          <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
                            <IconlyBookmark
                              set={isBookmarked ? "bold" : "curved"}
                              stroke="bold"
                              primaryColor="currentColor"
                              size={19}
                            />
                          </span>
                        </button>

                        <div
                          className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 select-none px-1"
                          title={`${viewCount.toLocaleString()} views`}
                        >
                          <IconlyChart set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                          <span className="text-[12.5px] font-medium tabular-nums">
                            {formatCompactCount(viewCount)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleShare}
                          className="p-1.5 -mr-1.5 rounded-full hover:text-slate-900 dark:hover:text-white transition-colors group cursor-pointer"
                          title="Share"
                        >
                          <span className="inline-flex transition-transform duration-150 group-hover:scale-110 group-active:scale-90">
                            <IconlyUpload set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200/85 dark:border-white/[0.09]" />

                {/* Replies Stream */}
                <div className="px-4 sm:px-5 py-4 space-y-5 select-text">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={22} className="animate-spin text-slate-400" />
                    </div>
                  ) : rootComments.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[14px] font-medium text-slate-400 dark:text-neutral-500">
                        No replies yet.
                      </p>
                    </div>
                  ) : (
                    rootComments.map((comment) => {
                      const cAuthor = comment.profiles?.full_name || "Trader";
                      const cHandle = comment.profiles?.username || "trader";
                      const cAvatar = comment.profiles?.avatar_url || "/default-avatar.svg";
                      const isCommentLiked = likedComments.includes(comment.id);
                      const isOwner = comment.user_id === currentUserId;
                      const replies = repliesMap[comment.id] || [];

                      return (
                        <div key={comment.id} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={cAvatar}
                              alt={cAuthor}
                              onClick={() => navigate(`/user/${cHandle}`)}
                              className="w-9 h-9 rounded-full object-cover shrink-0 bg-slate-100 dark:bg-white/10 cursor-pointer"
                              onError={(e) => {
                                e.currentTarget.src = "/default-avatar.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    onClick={() => navigate(`/user/${cHandle}`)}
                                    className="text-[14px] font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                                  >
                                    {cAuthor}
                                  </span>
                                  <span className="text-[12px] text-slate-400 dark:text-neutral-500 shrink-0">
                                    · {formatShortTime(comment.created_at)}
                                  </span>
                                </div>
                                {isOwner && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {deletingCommentId === comment.id ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleDeleteComment(comment.id);
                                            setDeletingCommentId(null);
                                          }}
                                          className="text-[11px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeletingCommentId(null)}
                                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setDeletingCommentId(comment.id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                        title="Delete reply"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              <p className="text-[14.5px] text-slate-800 dark:text-slate-200 leading-relaxed mt-0.5 break-words whitespace-pre-wrap">
                                {comment.content}
                              </p>

                              <div className="flex items-center gap-5 mt-2 text-slate-400 dark:text-neutral-500">
                                <button
                                  type="button"
                                  onClick={() => handleLikeComment(comment.id)}
                                  className={`flex items-center gap-1 text-[12px] font-semibold transition-colors cursor-pointer ${
                                    isCommentLiked ? "text-rose-500" : "hover:text-rose-500"
                                  }`}
                                >
                                  <IconlyHeart
                                    size={14}
                                    set={isCommentLiked ? "bold" : "curved"}
                                    stroke="bold"
                                    primaryColor="currentColor"
                                  />
                                  {isCommentLiked && <span>1</span>}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openReplyComposer(comment.id, cAuthor, cHandle)}
                                  className="text-[12px] font-semibold hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Nested Replies */}
                          {replies.length > 0 && (
                            <div className="pl-11 space-y-3 border-l-2 border-slate-100 dark:border-white/10 ml-4">
                              {replies.map((reply) => {
                                const rAuthor = reply.profiles?.full_name || "Trader";
                                const rHandle = reply.profiles?.username || "trader";
                                const rAvatar = reply.profiles?.avatar_url || "/default-avatar.svg";
                                const isReplyOwner = reply.user_id === currentUserId;

                                return (
                                  <div key={reply.id} className="flex items-start gap-2.5 pl-2">
                                    <img
                                      src={rAvatar}
                                      alt={rAuthor}
                                      onClick={() => navigate(`/user/${rHandle}`)}
                                      className="w-7 h-7 rounded-full object-cover shrink-0 bg-slate-100 dark:bg-white/10 cursor-pointer"
                                      onError={(e) => {
                                        e.currentTarget.src = "/default-avatar.svg";
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span
                                            onClick={() => navigate(`/user/${rHandle}`)}
                                            className="text-[13px] font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                                          >
                                            {rAuthor}
                                          </span>
                                          <span className="text-[11.5px] text-slate-400 dark:text-neutral-500 shrink-0">
                                            · {formatShortTime(reply.created_at)}
                                          </span>
                                        </div>
                                        {isReplyOwner && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                            title="Delete reply"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5 break-words whitespace-pre-wrap">
                                        {reply.content}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sticky Bottom Reply Trigger Bar (Sits right above BottomNav just like reference!) */}
              <div className="shrink-0 border-t border-slate-200/85 dark:border-white/[0.09] bg-white dark:bg-[#121212] px-3.5 sm:px-5 py-3">
                {!allowComments ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-slate-400">
                    <Lock size={14} />
                    <span>Replies are turned off for this post</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openReplyComposer(null, authorName, authorHandle)}
                    className="w-full h-11 rounded-full bg-slate-100/95 hover:bg-slate-200/80 dark:bg-white/[0.07] dark:hover:bg-white/[0.11] text-slate-800 dark:text-slate-100 font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
                  >
                    <IconlyChat set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                    <span>Reply to {authorName}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expanded Floating Reply Composer (Rides smoothly above mobile keyboard!) */}
      {isComposerOpen &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[9998] flex flex-col justify-end">
              {/* Subtle Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeReplyComposer}
                className="fixed inset-0 bg-black/35 backdrop-blur-[2px] cursor-pointer"
              />

              {/* Composer Sheet */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                style={{ marginBottom: `${keyboardOffsetBottom}px` }}
                className="relative z-10 w-full max-w-[680px] mx-auto bg-white dark:bg-[#161618] rounded-t-[24px] sm:rounded-[24px] sm:mb-4 border-t sm:border border-slate-200/80 dark:border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.14)] px-4 sm:px-5 pt-3.5 pb-[max(0.9rem,env(safe-area-inset-bottom))] font-sans"
              >
                <div className="space-y-3">
                  {/* Top Row: "Replying to @handle" + Circular X */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500 dark:text-neutral-400">
                      Replying to{" "}
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">
                        {replyTargetHandle || authorHandle}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={closeReplyComposer}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-600 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Close reply composer"
                    >
                      <X size={16} strokeWidth={2.2} />
                    </button>
                  </div>

                  {/* Avatar + Auto-Focused Textarea */}
                  <div className="flex items-start gap-3">
                    <img
                      src={currentUserAvatar}
                      alt="You"
                      className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 shrink-0 mt-0.5"
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                    <textarea
                      ref={textareaRef}
                      rows={2}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handlePublishComment(inputText, replyingToCommentId);
                        }
                      }}
                      placeholder={`Reply to ${replyTargetName || authorName}`}
                      className="flex-1 bg-transparent text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
                    />
                  </div>

                  {/* Quick Emoji Strip */}
                  {showEmojiStrip && (
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + emoji);
                            textareaRef.current?.focus();
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center text-base shrink-0 transition-transform active:scale-90 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bottom Toolbar: Emoji + GIF on left, Tactile Reply Pill on right */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEmojiStrip((prev) => !prev)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          showEmojiStrip
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
                        }`}
                        title="Add emoji"
                      >
                        <Smile size={18} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputText((prev) => (prev ? `${prev} 🚀` : "🚀"));
                          textareaRef.current?.focus();
                        }}
                        className="h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100 text-[11.5px] font-black tracking-wide transition-colors cursor-pointer"
                        title="GIF / Reaction"
                      >
                        GIF
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={!inputText.trim() || submitting}
                      onClick={() => handlePublishComment(inputText, replyingToCommentId)}
                      className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all select-none ${
                        inputText.trim() && !submitting
                          ? "tactile-black-pill cursor-pointer"
                          : "bg-slate-300 dark:bg-white/15 text-white dark:text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      {submitting ? <Loader2 size={15} className="animate-spin" /> : "Reply"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}

      {/* Optional Fullscreen Image Lightbox */}
      {lightboxImage &&
        createPortal(
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage}
              alt="Expanded attachment"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[88dvh] object-contain rounded-2xl shadow-2xl select-none"
            />
          </div>,
          document.body
        )}
    </DashboardLayout>
  );
}
