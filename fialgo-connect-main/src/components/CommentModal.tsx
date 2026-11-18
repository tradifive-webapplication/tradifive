import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  X,
  MessageCircle,
  Lock,
  Loader2,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Repeat2,
  Bookmark,
  Share,
  Smile,
  MoreHorizontal,
  BarChart2,
  Heart,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Heart as IconlyHeart } from "react-iconly";

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

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  currentUserId: string;
  post: any;
  onCommentsCountChange: (newCount: number) => void;
  focusedImageUrl?: string | null;
  isLiked?: boolean;
  likes?: number;
  onLike?: (postId: string) => void;
  isReposted?: boolean;
  repostCount?: number;
  onRepost?: (e: React.MouseEvent) => void;
  viewCount?: number;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
  isFollowing?: boolean;
  onToggleFollow?: (targetUserId: string, targetName: string) => void;
}

const QUICK_EMOJIS = ["🔥", "🚀", "📈", "📉", "💎", "👏", "🎯", "💯", "😂", "❤️", "🫡", "⚡"];

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  currentUserId,
  post,
  onCommentsCountChange,
  focusedImageUrl,
  isLiked = false,
  likes = 0,
  onLike,
  isReposted = false,
  repostCount = 0,
  onRepost,
  viewCount = 0,
  isBookmarked = false,
  onBookmark,
  onShare,
  isFollowing = false,
  onToggleFollow,
}: CommentModalProps) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyTargetName, setReplyTargetName] = useState<string>("");
  const [replyTargetHandle, setReplyTargetHandle] = useState<string>("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showEmojiStrip, setShowEmojiStrip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Mobile virtual keyboard viewport tracking so the reply composer rides smoothly above the keyboard
  const [viewportStyle, setViewportStyle] = useState<{ height?: string; top?: number }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  const authorName = post.profiles?.full_name || post.profiles?.display_name || "Anonymous Trader";
  const authorHandle = post.profiles?.username ? `@${post.profiles.username}` : "@anonymous";
  const authorAvatar = post.profiles?.avatar_url || "/default-avatar.svg";
  const allowComments = post.allow_comments !== false;
  const isOwnPost = Boolean(
    currentUserId && (post.user_id === currentUserId || post.profiles?.id === currentUserId)
  );
  const currentUserAvatar =
    localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg";

  // Sync visualViewport height/offset for iOS Safari & Android Chrome virtual keyboard
  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const updateViewport = () => {
      if (window.innerWidth < 768) {
        setViewportStyle({
          height: `${Math.round(vv.height)}px`,
          top: Math.round(vv.offsetTop),
        });
      } else {
        setViewportStyle({});
      }
    };

    updateViewport();
    vv.addEventListener("resize", updateViewport);
    vv.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      vv.removeEventListener("resize", updateViewport);
      vv.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [isOpen]);

  // Reset composer state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsComposerOpen(false);
      setShowEmojiStrip(false);
      setReplyingToCommentId(null);
      setInputText("");
    }
  }, [isOpen]);

  // Auto-focus textarea when composer opens
  useEffect(() => {
    if (isComposerOpen) {
      const t = window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(t);
    }
  }, [isComposerOpen, replyingToCommentId]);

  useEffect(() => {
    if (isOpen) {
      if (focusedImageUrl && post.media_urls) {
        const idx = post.media_urls.indexOf(focusedImageUrl);
        setCurrentImageIndex(idx !== -1 ? idx : 0);
      } else {
        setCurrentImageIndex(0);
      }
    }
  }, [isOpen, focusedImageUrl, post.media_urls]);

  const rawMediaUrls = Array.isArray(post.media_urls)
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
      : focusedImageUrl || (post.post_type !== "poll" && post.post_type !== "signal" ? post.media_url : null);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rawMediaUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : rawMediaUrls.length - 1));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rawMediaUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev < rawMediaUrls.length - 1 ? prev + 1 : 0));
    }
  };

  // Extract Location, Optional Heading (`### Heading`), and Clean Caption Content
  let parsedContent = post.content || "";
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

  const postTags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const inlineTagsLower = new Set(
    Array.from(parsedContent.matchAll(/#([A-Za-z0-9_]+)/g)).map((m: any) => m[1].toLowerCase())
  );
  const extraPostTags = postTags.filter((t) => !inlineTagsLower.has(t.toLowerCase()));

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
              handleUserClick(part.slice(1));
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

  const fetchComments = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      let dbComments: Comment[] = [];

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

      const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
      const filteredLocal = localComments.filter((c: any) => c.post_id === postId);

      const combined = [...dbComments, ...filteredLocal];
      combined.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });

      setComments(combined);
      onCommentsCountChange(combined.length);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    if (isOpen) {
      try {
        const localLikedComments = JSON.parse(
          localStorage.getItem("fialgo_local_comment_likes") || "[]"
        );
        setLikedComments(localLikedComments);
      } catch {
        setLikedComments([]);
      }
    }
  }, [postId, isOpen]);

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

  const handleLikeToggle = (commentId: string) => {
    setLikedComments((prev) => {
      const liked = prev.includes(commentId);
      const newLiked = liked ? prev.filter((id) => id !== commentId) : [...prev, commentId];
      try {
        localStorage.setItem("fialgo_local_comment_likes", JSON.stringify(newLiked));
      } catch {}
      return newLiked;
    });
  };

  const handlePublishComment = async (text: string, parentId: string | null = null) => {
    if (!text.trim() || submitting) return;

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
        const localPosts = JSON.parse(localStorage.getItem("fialgo_local_posts") || "[]");
        const postIdx = localPosts.findIndex((p: any) => p.id === postId);
        if (postIdx !== -1) {
          const currentCount =
            localPosts[postIdx].comment_count ?? localPosts[postIdx].comments_count ?? 0;
          localPosts[postIdx].comment_count = currentCount + 1;
          localPosts[postIdx].comments_count = currentCount + 1;
          try {
            localStorage.setItem("fialgo_local_posts", JSON.stringify(localPosts));
          } catch {}
        } else {
          const localCommentCounts = JSON.parse(
            localStorage.getItem("fialgo_local_comment_counts") || "{}"
          );
          localCommentCounts[postId] = (localCommentCounts[postId] || 0) + 1;
          try {
            localStorage.setItem(
              "fialgo_local_comment_counts",
              JSON.stringify(localCommentCounts)
            );
          } catch {}
        }

        const updatedList = [...comments, publishedComment];
        setComments(updatedList);
        onCommentsCountChange(updatedList.length);
        setInputText("");
        setIsComposerOpen(false);
        setShowEmojiStrip(false);
        setReplyingToCommentId(null);
        toast.success(parentId ? "Reply published!" : "Reply published!");
      }
    } catch (err: any) {
      console.error("Comment submission failed:", err);
      toast.error(err.message || "Failed to submit reply.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      if (!commentId.startsWith("local-comment-")) {
        try {
          await supabase.from("social_post_comments").delete().eq("id", commentId);
        } catch {}
      }

      const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
      if (localComments.some((c: any) => c.id === commentId)) {
        const filtered = localComments.filter((c: any) => c.id !== commentId);
        localStorage.setItem("fialgo_local_comments", JSON.stringify(filtered));
      }

      const localPosts = JSON.parse(localStorage.getItem("fialgo_local_posts") || "[]");
      const postIdx = localPosts.findIndex((p: any) => p.id === postId);
      if (postIdx !== -1) {
        const currentCount =
          localPosts[postIdx].comment_count ?? localPosts[postIdx].comments_count ?? 0;
        const newCount = Math.max(0, currentCount - 1);
        localPosts[postIdx].comment_count = newCount;
        localPosts[postIdx].comments_count = newCount;
        localStorage.setItem("fialgo_local_posts", JSON.stringify(localPosts));
      } else {
        const localCommentCounts = JSON.parse(
          localStorage.getItem("fialgo_local_comment_counts") || "{}"
        );
        localCommentCounts[postId] = Math.max(0, (localCommentCounts[postId] || 0) - 1);
        localStorage.setItem("fialgo_local_comment_counts", JSON.stringify(localCommentCounts));
      }

      const updatedList = comments.filter(
        (c) => c.id !== commentId && c.parent_comment_id !== commentId
      );
      setComments(updatedList);
      onCommentsCountChange(updatedList.length);
      toast.success("Reply deleted");
    } catch (err) {
      console.error("Failed to delete comment:", err);
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

  const rootComments = comments.filter((c) => !c.parent_comment_id);
  const repliesMap = comments.reduce((acc, c) => {
    if (c.parent_comment_id) {
      if (!acc[c.parent_comment_id]) acc[c.parent_comment_id] = [];
      acc[c.parent_comment_id].push(c);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  const handleUserClick = (username: string | null | undefined) => {
    if (!username) return;
    const cleanUsername = username.startsWith("@") ? username.substring(1) : username;
    onClose();
    navigate(`/user/${cleanUsername}`);
  };

  if (!isOpen) return null;

  // ── Fullscreen Image Lightbox mode when user taps an image directly ──
  if (focusedImageUrl) {
    return createPortal(
      <AnimatePresence>
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close image"
          >
            <X size={20} />
          </button>

          <img
            src={currentImageUrl}
            alt="Post attachment"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88dvh] object-contain rounded-2xl shadow-2xl select-none"
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </AnimatePresence>,
      document.body
    );
  }

  // ── Native Post + Replies View (Matching Reference Images 1 & 2) ──
  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-x-0 top-0 z-[9999] flex items-end md:items-center justify-center md:p-6"
        style={{
          height: viewportStyle.height || "100dvh",
          top: viewportStyle.top ? `${viewportStyle.top}px` : 0,
        }}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        />

        {/* Post View Container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full md:max-w-[640px] h-full md:h-[88vh] bg-white dark:bg-[#141416] md:rounded-[28px] figma-card-shadow flex flex-col overflow-hidden font-sans text-slate-900 dark:text-slate-100"
        >
          {/* Top Bar: Circular Back (<) + "Post" */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#141416]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft size={19} strokeWidth={2.4} />
              </button>
              <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
                Post
              </h2>
            </div>
          </div>

          {/* Scrollable Body: Original Post + Divider + Replies */}
          <div
            ref={scrollBodyRef}
            className="flex-1 overflow-y-auto amazing-scrollbar min-h-0 overscroll-contain"
          >
            {/* Original Post Block */}
            <div className="px-4 sm:px-5 pt-4 pb-3">
              {/* Author Row */}
              <div className="flex items-center justify-between gap-3">
                <div
                  onClick={() => handleUserClick(post.profiles?.username || post.user_id)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "/default-avatar.svg";
                    }}
                  />
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
                      {authorName}
                    </span>
                    <span className="text-[13px] font-medium text-slate-400 dark:text-neutral-500">
                      · {formatShortTime(post.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isOwnPost && onToggleFollow && post.user_id && (
                    <button
                      type="button"
                      onClick={() => onToggleFollow(post.user_id, authorName)}
                      className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold cursor-pointer select-none flex items-center gap-1 ${
                        isFollowing ? "tactile-white-pill" : "tactile-black-pill"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={12} strokeWidth={2.4} /> Following
                        </>
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onShare}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Location Tag */}
              {locationNameVal && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11.5px] font-semibold mt-3">
                  <MapPin size={11} />
                  <span>{locationNameVal}</span>
                </div>
              )}

              {/* Post Heading (optional) */}
              {parsedHeadingVal && (
                <h3 className="mt-3 text-[16.5px] font-bold text-slate-900 dark:text-white leading-snug tracking-tight break-words">
                  {parsedHeadingVal}
                </h3>
              )}

              {/* Post Content */}
              {parsedContent && (
                <div className={`${parsedHeadingVal ? "mt-1.5" : "mt-3"} text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-text break-words`}>
                  {renderStyledPostText(parsedContent)}
                </div>
              )}

              {/* Extra Post Hashtags */}
              {extraPostTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  {extraPostTags.map((tag) => (
                    <span key={tag} className="text-[14.5px] font-medium text-blue-600 dark:text-blue-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Media */}
              {currentImageUrl && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/40 relative group">
                  {post.media_type === "video" ? (
                    <video
                      src={currentImageUrl}
                      controls
                      className="w-full max-h-[360px] object-contain"
                    />
                  ) : (
                    <img
                      src={currentImageUrl}
                      alt="Post attachment"
                      className="w-full max-h-[380px] object-cover select-none"
                    />
                  )}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Post Action Row (Comment, Repost, Like, Views, Bookmark, Share — matching Image 1) */}
              <div className="flex items-center justify-between pt-3.5 mt-3 text-slate-500 dark:text-neutral-400">
                <button
                  type="button"
                  onClick={() => openReplyComposer(null, authorName, authorHandle)}
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 -ml-1.5 rounded-full cursor-pointer"
                  title="Reply"
                >
                  <MessageCircle size={18} strokeWidth={1.9} />
                  {comments.length > 0 && (
                    <span className="text-[13px] font-semibold tabular-nums">
                      {comments.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onRepost}
                  className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-full cursor-pointer ${
                    isReposted
                      ? "text-emerald-500"
                      : "hover:text-emerald-500"
                  }`}
                  title="Repost"
                >
                  <Repeat2 size={18} strokeWidth={isReposted ? 2.3 : 1.9} />
                  {repostCount > 0 && (
                    <span className="text-[13px] font-semibold tabular-nums">
                      {repostCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onLike && onLike(postId)}
                  className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-full cursor-pointer ${
                    isLiked
                      ? "text-slate-900 dark:text-white"
                      : "hover:text-rose-500"
                  }`}
                  title="Like"
                >
                  <Heart
                    size={18}
                    strokeWidth={1.9}
                    className={
                      isLiked
                        ? "fill-slate-900 text-slate-900 dark:fill-white dark:text-white"
                        : ""
                    }
                  />
                  {likes > 0 && (
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
                      {likes}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBookmark}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isBookmarked
                      ? "text-blue-500"
                      : "hover:text-blue-500"
                  }`}
                  title="Bookmark"
                >
                  <Bookmark
                    size={18}
                    strokeWidth={1.9}
                    className={isBookmarked ? "fill-blue-500 text-blue-500" : ""}
                  />
                </button>

                <div
                  className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 select-none"
                  title={`${viewCount.toLocaleString()} views`}
                >
                  <BarChart2 size={18} strokeWidth={1.9} />
                  <span className="text-[13px] font-medium tabular-nums">
                    {formatCompactCount(viewCount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onShare}
                  className="p-1.5 -mr-1.5 rounded-full hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share size={17} strokeWidth={1.9} />
                </button>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-slate-100 dark:border-white/10 mx-4 sm:mx-5" />

            {/* Replies Stream */}
            <div className="px-4 sm:px-5 py-4 space-y-5 select-text">
              {loading ? (
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
                  const commenterName = comment.profiles?.full_name || "Anonymous Trader";
                  const commenterHandle = comment.profiles?.username
                    ? `@${comment.profiles.username}`
                    : "@anonymous";
                  const commenterAvatar = comment.profiles?.avatar_url || "/default-avatar.svg";
                  const isOwnComment =
                    comment.user_id === currentUserId ||
                    commenterHandle === `@${localStorage.getItem("tradifive_cached_username")}`;
                  const commentReplies = repliesMap[comment.id] || [];

                  return (
                    <div key={comment.id} className="space-y-3.5">
                      <div className="flex gap-3 items-start group">
                        <img
                          src={commenterAvatar}
                          alt={commenterName}
                          onClick={() =>
                            handleUserClick(comment.profiles?.username || commenterName)
                          }
                          className="w-9 h-9 rounded-full shrink-0 border border-slate-200/60 dark:border-white/10 object-cover bg-slate-100 cursor-pointer"
                          onError={(e) => {
                            e.currentTarget.src = "/default-avatar.svg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                onClick={() =>
                                  handleUserClick(comment.profiles?.username || commenterName)
                                }
                                className="text-[14px] font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                              >
                                {commenterName}
                              </span>
                              <span className="text-[12.5px] text-slate-400 dark:text-neutral-500 shrink-0">
                                · {formatShortTime(comment.created_at)}
                              </span>
                            </div>

                            {isOwnComment && (
                              <div className="relative shrink-0">
                                {deletingCommentId === comment.id ? (
                                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteComment(comment.id);
                                        setDeletingCommentId(null);
                                      }}
                                      className="text-rose-600 dark:text-rose-400 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingCommentId(null)}
                                      className="text-slate-500 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingCommentId(comment.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                                    title="Delete reply"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <p className="text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap mt-0.5">
                            {comment.content}
                          </p>

                          <div className="flex items-center gap-4 mt-1.5">
                            {allowComments && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReplyComposer(comment.id, commenterName, commenterHandle)
                                }
                                className="text-[12.5px] font-semibold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                              >
                                Reply
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleLikeToggle(comment.id)}
                              className={`text-[12.5px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                likedComments.includes(comment.id)
                                  ? "text-rose-500"
                                  : "text-slate-500 hover:text-rose-500 dark:text-neutral-400"
                              }`}
                            >
                              <IconlyHeart
                                size={13}
                                set={likedComments.includes(comment.id) ? "bold" : "curved"}
                                primaryColor="currentColor"
                              />
                              {likedComments.includes(comment.id) ? "1" : ""}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Nested Replies */}
                      {commentReplies.length > 0 && (
                        <div className="ml-5 pl-4 border-l-2 border-slate-100 dark:border-white/10 space-y-3">
                          {commentReplies.map((reply) => {
                            const rName = reply.profiles?.full_name || "Anonymous Trader";
                            const rHandle = reply.profiles?.username
                              ? `@${reply.profiles.username}`
                              : "@anonymous";
                            const rAvatar = reply.profiles?.avatar_url || "/default-avatar.svg";
                            const isOwnReply =
                              reply.user_id === currentUserId ||
                              rHandle === `@${localStorage.getItem("tradifive_cached_username")}`;

                            return (
                              <div key={reply.id} className="flex gap-2.5 items-start">
                                <img
                                  src={rAvatar}
                                  alt={rName}
                                  onClick={() =>
                                    handleUserClick(reply.profiles?.username || rName)
                                  }
                                  className="w-7 h-7 rounded-full shrink-0 border border-slate-200/60 dark:border-white/10 object-cover bg-slate-100 cursor-pointer"
                                  onError={(e) => {
                                    e.currentTarget.src = "/default-avatar.svg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                        {rName}
                                      </span>
                                      <span className="text-[11.5px] text-slate-400 dark:text-neutral-500 shrink-0">
                                        · {formatShortTime(reply.created_at)}
                                      </span>
                                    </div>
                                    {isOwnReply && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                                        title="Delete reply"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mt-0.5">
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

          {/* Bottom Reply Bar: Collapsed Pill (Image 1) -> Expanded Composer above Keyboard (Image 2) */}
          <div className="shrink-0 bg-white dark:bg-[#141416] border-t border-slate-100 dark:border-white/10">
            {!allowComments ? (
              <div className="px-4 py-3.5 flex items-center justify-center gap-2 text-slate-400 text-[12.5px] font-semibold select-none">
                <Lock size={14} />
                <span>Replies are disabled for this post.</span>
              </div>
            ) : !isComposerOpen ? (
              /* Collapsed State — Matching Reference Image 1 */
              <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => openReplyComposer(null, authorName, authorHandle)}
                  className="w-full py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] flex items-center justify-center gap-2 text-[14px] font-semibold text-slate-800 dark:text-slate-100 transition-all active:scale-[0.99] cursor-pointer select-none"
                >
                  <MessageCircle size={16} strokeWidth={2.1} />
                  <span>Reply to {authorName}</span>
                </button>
              </div>
            ) : (
              /* Expanded Composer State — Matching Reference Image 2 (Stays right above mobile keyboard) */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inputText.trim()) return;
                  handlePublishComment(inputText, replyingToCommentId);
                }}
                className="px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                {/* Row 1: "Replying to @handle" + Circular Close (×) */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-400 dark:text-neutral-400">
                    Replying to {replyTargetHandle || authorHandle}
                  </span>
                  <button
                    type="button"
                    onClick={closeReplyComposer}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    aria-label="Close reply composer"
                  >
                    <X size={15} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Row 2: Current User Avatar + Auto-Focused Reply Input */}
                <div className="flex items-start gap-3">
                  <img
                    src={currentUserAvatar}
                    alt="You"
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200/70 dark:border-white/10 bg-slate-100"
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
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && inputText.trim()) {
                        e.preventDefault();
                        handlePublishComment(inputText, replyingToCommentId);
                      }
                    }}
                    placeholder={`Reply to ${replyTargetName || authorName}`}
                    disabled={submitting}
                    maxLength={500}
                    enterKeyHint="send"
                    className="flex-1 resize-none bg-transparent border-none outline-none text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 leading-relaxed pt-1 max-h-28"
                  />
                </div>

                {/* Optional Quick Emoji Bar */}
                {showEmojiStrip && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 bg-slate-50 dark:bg-white/[0.04] rounded-xl">
                    {QUICK_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setInputText((prev) => prev + em);
                          textareaRef.current?.focus();
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 flex items-center justify-center text-[17px] shrink-0 cursor-pointer active:scale-90 transition-transform"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {/* Row 3: Emoji + GIF buttons on Left, "Reply" Pill Button on Right */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 pl-12">
                    <button
                      type="button"
                      onClick={() => setShowEmojiStrip((prev) => !prev)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        showEmojiStrip
                          ? "bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white"
                          : "bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
                      }`}
                      title="Add emoji"
                      aria-label="Add emoji"
                    >
                      <Smile size={18} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info("GIF picker coming soon")}
                      className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[11px] font-extrabold tracking-tight transition-colors cursor-pointer"
                      title="Add GIF"
                      aria-label="Add GIF"
                    >
                      GIF
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || submitting}
                    className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all select-none ${
                      inputText.trim() && !submitting
                        ? "tactile-black-pill cursor-pointer"
                        : "bg-slate-300 dark:bg-white/15 text-white cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Replying..." : "Reply"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
