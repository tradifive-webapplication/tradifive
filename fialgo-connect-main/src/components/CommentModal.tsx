import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, MessageSquare, MessageCircle, Send, Lock, Loader2, Trash2, CheckCircle2, MapPin, CornerDownRight, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Heart as IconlyHeart, Send as IconlySend } from "react-iconly";

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
  post: any; // original feed post context
  onCommentsCountChange: (newCount: number) => void;
  focusedImageUrl?: string | null;
}

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  currentUserId,
  post,
  onCommentsCountChange,
  focusedImageUrl
}: CommentModalProps) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

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

  const hasMultipleImages = post.media_urls && post.media_urls.length > 1;
  const currentImageUrl = post.media_urls && post.media_urls.length > 0 ? post.media_urls[currentImageIndex] : (focusedImageUrl || post.media_url);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.media_urls) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : post.media_urls.length - 1));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.media_urls) {
      setCurrentImageIndex((prev) => (prev < post.media_urls.length - 1 ? prev + 1 : 0));
    }
  };

  const authorName = post.profiles?.full_name || "Anonymous Trader";
  const authorHandle = post.profiles?.username ? `@${post.profiles.username}` : "@anonymous";
  const authorAvatar = post.profiles?.avatar_url || "/default-avatar.svg";
  const allowComments = post.allow_comments !== false;

  // Extract Location and Clean Caption Content
  let parsedContent = post.content || "";
  let locationNameVal = "";
  const locMatch = parsedContent.match(/^📍\s+(.+)\n/);
  if (locMatch) {
    locationNameVal = locMatch[1];
    parsedContent = parsedContent.replace(/^📍\s+.+\n/, "");
  }

  const fetchComments = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      let dbComments: Comment[] = [];
      
      // 1. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("social_post_comments")
          .select("*, profiles(full_name, username, avatar_url)")
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Supabase comments read failed, using offline fallback:", error);
        } else if (data) {
          dbComments = data as any;
        }
      } catch (err) {
        console.warn("Supabase read error:", err);
      }

      // 2. Fetch offline comments from localStorage
      const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
      const filteredLocal = localComments.filter((c: any) => c.post_id === postId);

      // 3. Merge & Sort
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
      const localLikedComments = JSON.parse(localStorage.getItem("fialgo_local_comment_likes") || "[]");
      setLikedComments(localLikedComments);
    }
  }, [postId, isOpen]);

  const handleLikeToggle = (commentId: string) => {
    setLikedComments(prev => {
      const isLiked = prev.includes(commentId);
      const newLiked = isLiked ? prev.filter(id => id !== commentId) : [...prev, commentId];
      try { localStorage.setItem("fialgo_local_comment_likes", JSON.stringify(newLiked)); } catch(e){}
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
      created_at: new Date().toISOString()
    };

    try {
      let publishedComment: Comment | null = null;

      // 1. Try publishing to Supabase
      try {
        const { data, error } = await supabase
          .from("social_post_comments")
          .insert([newCommentPayload])
          .select("*, profiles(full_name, username, avatar_url)")
          .single();

        if (error) {
          console.warn("Supabase comment insert failed, using fallback:", error);
          throw error;
        }
        if (data) {
          publishedComment = data as any;
        }
      } catch (dbErr) {
        // 2. Graceful offline/guest localStorage fallback
        const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
        
        // Load active profile info
        const mockProfile = {
          full_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
          username: localStorage.getItem("tradifive_cached_username") || "trader",
          avatar_url: localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg"
        };

        const offlineComment = {
          id: `local-comment-${Date.now()}`,
          ...newCommentPayload,
          profiles: mockProfile
        };

        localComments.push(offlineComment);
        try {
          localStorage.setItem("fialgo_local_comments", JSON.stringify(localComments));
        } catch (storageErr) {
          console.warn("Storage quota exceeded for comments. Trimming array...");
          try {
            // Keep only the last 30 comments to save space
            const trimmedComments = localComments.slice(-30);
            localStorage.setItem("fialgo_local_comments", JSON.stringify(trimmedComments));
          } catch (e) {
            // If it still fails (e.g., massive base64 in a single comment), just keep the latest
            try {
              localStorage.setItem("fialgo_local_comments", JSON.stringify([offlineComment]));
            } catch (e2) {
              console.error("Critical storage error:", e2);
            }
          }
        }
        publishedComment = offlineComment;
      }

      if (publishedComment) {
        // Sync local post comment counts inside localStorage fialgo_local_posts cache
        const localPosts = JSON.parse(localStorage.getItem("fialgo_local_posts") || "[]");
        const postIdx = localPosts.findIndex((p: any) => p.id === postId);
        if (postIdx !== -1) {
          const currentCount = localPosts[postIdx].comment_count ?? localPosts[postIdx].comments_count ?? 0;
          localPosts[postIdx].comment_count = currentCount + 1;
          localPosts[postIdx].comments_count = currentCount + 1;
          try { localStorage.setItem("fialgo_local_posts", JSON.stringify(localPosts)); } catch(e) {}
        } else {
          // Store an override map for database post comments so that counts persist locally
          const localCommentCounts = JSON.parse(localStorage.getItem("fialgo_local_comment_counts") || "{}");
          const currentCount = localCommentCounts[postId] || 0;
          localCommentCounts[postId] = currentCount + 1;
          try { localStorage.setItem("fialgo_local_comment_counts", JSON.stringify(localCommentCounts)); } catch(e) {}
        }

        const updatedList = [...comments, publishedComment];
        setComments(updatedList);
        onCommentsCountChange(updatedList.length);
        toast.success(parentId ? "Reply published!" : "Comment published!");
      }
    } catch (err: any) {
      console.error("Comment submission failed:", err);
      toast.error(err.message || "Failed to submit comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      let deletedFromDb = false;

      // 1. Try deleting from Supabase
      if (!commentId.startsWith("local-comment-")) {
        try {
          const { error } = await supabase
            .from("social_post_comments")
            .delete()
            .eq("id", commentId);

          if (error) {
            console.warn("Supabase comment delete failed, checking local:", error);
          } else {
            deletedFromDb = true;
          }
        } catch (dbErr) {
          console.warn("Supabase comment delete catch:", dbErr);
        }
      }

      // 2. Try deleting from local storage comment stream
      const localComments = JSON.parse(localStorage.getItem("fialgo_local_comments") || "[]");
      const existsLocally = localComments.some((c: any) => c.id === commentId);

      if (existsLocally) {
        const filtered = localComments.filter((c: any) => c.id !== commentId);
        localStorage.setItem("fialgo_local_comments", JSON.stringify(filtered));
      }

      // Update local comment counts inside localStorage fialgo_local_posts cache
      const localPosts = JSON.parse(localStorage.getItem("fialgo_local_posts") || "[]");
      const postIdx = localPosts.findIndex((p: any) => p.id === postId);
      if (postIdx !== -1) {
        const currentCount = localPosts[postIdx].comment_count ?? localPosts[postIdx].comments_count ?? 0;
        const newCount = Math.max(0, currentCount - 1);
        localPosts[postIdx].comment_count = newCount;
        localPosts[postIdx].comments_count = newCount;
        localStorage.setItem("fialgo_local_posts", JSON.stringify(localPosts));
      } else {
        // Decrement local override comments map
        const localCommentCounts = JSON.parse(localStorage.getItem("fialgo_local_comment_counts") || "{}");
        const currentCount = localCommentCounts[postId] || 0;
        localCommentCounts[postId] = Math.max(0, currentCount - 1);
        localStorage.setItem("fialgo_local_comment_counts", JSON.stringify(localCommentCounts));
      }

      // Automatically cascade delete children locally if deleting parent
      const updatedList = comments.filter((c) => c.id !== commentId && c.parent_comment_id !== commentId);
      setComments(updatedList);
      onCommentsCountChange(updatedList.length);
      toast.success("Comment deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment.");
    }
  };

  const formatCommentDate = (dateStr: string | null) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Group root comments and child replies
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
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    onClose();
    navigate(`/user/${cleanUsername}`);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${focusedImageUrl ? "p-0" : "p-4 sm:p-6"}`}>
        {/* Backdrop Blur Overlay */}
        <div 
          className={`fixed inset-0 backdrop-blur-md cursor-pointer ${focusedImageUrl ? "bg-black/98" : "bg-slate-955/75"}`} 
          onClick={onClose} 
        />

        {/* Modal Container (Centered, Systematic Inter Layout) */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className={focusedImageUrl 
            ? "bg-black flex text-white relative z-50 w-full h-[100dvh] max-w-none flex-col md:flex-row font-sans rounded-none overflow-hidden" 
            : "bg-white dark:bg-[#1E1E1E] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none flex text-slate-800 dark:text-slate-100 relative z-50 w-[95vw] md:w-[85vw] lg:w-[75vw] max-w-5xl h-[85vh] md:h-[80vh] rounded-3xl overflow-hidden flex-col md:flex-row font-sans border border-slate-100 dark:border-white/5"}
        >
          {/* Left Pane: Post Details Card (Highly Systematic layout, proper Inter weights) */}
          {focusedImageUrl ? (
            <div className="flex-1 bg-black flex items-center justify-center p-4 relative group" onClick={onClose}>
               <img src={currentImageUrl} onClick={(e) => e.stopPropagation()} className="max-w-full max-h-full object-contain select-none cursor-default rounded-xl md:rounded-2xl shadow-2xl transition-opacity duration-300" />
               {hasMultipleImages && (
                 <>
                   <button 
                     onClick={handlePrevImage}
                     className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                   >
                     <ChevronLeft size={24} />
                   </button>
                   <button 
                     onClick={handleNextImage}
                     className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                   >
                     <ChevronRight size={24} />
                   </button>
                   <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     {post.media_urls.map((_: any, idx: number) => (
                       <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} />
                     ))}
                   </div>
                 </>
               )}
            </div>
          ) : (
            <div className="flex-1 p-6 md:p-8 bg-slate-50/30 dark:bg-transparent border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 overflow-y-auto amazing-scrollbar flex flex-col gap-6 select-text font-sans">
            
            {/* Original Post Header */}
            <div className="flex items-center gap-3">
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="w-11 h-11 rounded-full bg-slate-200 object-cover border border-slate-200/50 dark:border-slate-800 shadow-sm shrink-0" 
                onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }}
              />
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5 font-sans">
                  {authorName}
                </p>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5 font-sans">{authorHandle}</p>
              </div>
            </div>

            {/* Systematic Location Pill Tag */}
            {locationNameVal && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-fit text-[12px] font-semibold select-none font-sans">
                <MapPin size={12} className="text-blue-500" />
                <span>{locationNameVal}</span>
              </div>
            )}

            {/* Post caption text content */}
            <div className="text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed font-normal select-text whitespace-pre-wrap font-sans">
              {parsedContent}
            </div>

            {/* Post image/media previews if present - aspect ratio preserved */}
            {post.media_urls && post.media_urls.length > 0 ? (
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-[#222B3F] bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center max-h-[250px] shadow-sm shrink-0 relative group">
                <img src={currentImageUrl} className="w-full h-auto max-h-[250px] object-contain select-none transition-opacity duration-300" alt="Post attachment" />
                {hasMultipleImages && (
                 <>
                   <button 
                     onClick={handlePrevImage}
                     className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                   >
                     <ChevronLeft size={20} />
                   </button>
                   <button 
                     onClick={handleNextImage}
                     className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                   >
                     <ChevronRight size={20} />
                   </button>
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     {post.media_urls.map((_: any, idx: number) => (
                       <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                     ))}
                   </div>
                 </>
               )}
              </div>
            ) : post.media_url && post.post_type !== 'poll' && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center max-h-[250px] shadow-sm shrink-0">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} controls className="w-full max-h-[250px] object-contain select-none" poster="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop" />
                ) : (
                  <img src={post.media_url} className="w-full h-auto max-h-[250px] object-contain select-none" alt="Post attachment" />
                )}
              </div>
            )}

            {/* Post Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {post.tags.map((tag: string) => {
                  const isUserTag = tag.startsWith("@");
                  return (
                    <span 
                      key={tag} 
                      className={`inline-flex items-center text-[14px] font-medium transition-colors duration-200 select-none cursor-pointer font-sans ${
                        isUserTag
                          ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          : "text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                      }`}
                    >
                      {tag.startsWith("#") || tag.startsWith("@") ? tag : `#${tag}`}
                    </span>
                  );
                })}
              </div>
            )}
            {/* End of Left pane */}
            </div>
          )}

          {/* Right Pane: Premium Comments Discussion Flow */}
          <div className={`w-full md:w-[420px] lg:w-[480px] bg-white dark:bg-[#1E1E1E] flex flex-col justify-between overflow-hidden shrink-0 font-sans ${focusedImageUrl ? "border-l border-slate-100 dark:border-white/5" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                Comments <span className="text-slate-400 dark:text-slate-400 font-normal text-[14px]">({comments.length})</span>
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Threaded Comments Stream */}
            <div className="flex-grow overflow-y-auto amazing-scrollbar px-6 py-4 space-y-6 min-h-0 select-text">
              {focusedImageUrl && (
                <div className="flex flex-col gap-3 pb-5 mb-5 border-b border-slate-100 dark:border-white/5">
                   <div className="flex items-center gap-3">
                     <img src={authorAvatar} className="w-10 h-10 rounded-full object-cover border border-slate-200/50 dark:border-slate-800" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                     <div>
                        <p className="text-[14px] font-bold flex items-center gap-1 dark:text-white text-slate-900 leading-tight">
                           {authorName}
                        </p>
                        <p className="text-[12px] text-slate-500 font-medium mt-0.5">{authorHandle}</p>
                     </div>
                   </div>
                   <div className="text-[14px] font-normal leading-relaxed whitespace-pre-wrap dark:text-slate-200 text-slate-800">
                      {parsedContent}
                   </div>
                </div>
              )}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                </div>
              ) : rootComments.length === 0 ? (
                <div className="text-center py-20 text-slate-500 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center">
                    <MessageCircle size={48} strokeWidth={1} className="text-slate-300 dark:text-slate-300" />
                  </div>
                  <p className="text-[18px] font-bold text-slate-900 dark:text-white font-sans">No comments yet</p>
                  <p className="text-[14px] mt-1 font-sans">
                    Start the conversation.
                  </p>
                </div>
              ) : (
                rootComments.map((comment) => {
                  const commenterName = comment.profiles?.full_name || "Anonymous Trader";
                  const commenterHandle = comment.profiles?.username ? `@${comment.profiles.username}` : "@anonymous";
                  const commenterAvatar = comment.profiles?.avatar_url || "/default-avatar.svg";
                  const isOwnComment = comment.user_id === currentUserId || commenterHandle === `@${localStorage.getItem("tradifive_cached_username")}`;
                  const commentReplies = repliesMap[comment.id] || [];

                  return (
                    <div key={comment.id} className="space-y-4 animate-in fade-in duration-200">
                      
                      {/* Parent Comment Box */}
                      <div className="flex gap-3 items-start group relative">
                        <img 
                          src={commenterAvatar} 
                          alt={commenterName} 
                          onClick={() => handleUserClick(comment.profiles?.username || commenterName)}
                          className="w-9 h-9 rounded-full shrink-0 border border-slate-200/50 dark:border-slate-800 object-cover bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity" 
                          onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }}
                        />
                        <div className="flex-grow relative pt-0.5">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate font-sans">
                                {commenterName}
                              </span>
                              <span className="text-[13px] text-slate-500 font-normal truncate font-sans">{formatCommentDate(comment.created_at)}</span>
                            </div>
                            
                            {/* Delete Action */}
                            <div className="flex items-center gap-2 shrink-0 relative">
                              {isOwnComment && (
                                <div className="relative">
                                  {deletingCommentId === comment.id ? (
                                    <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-in fade-in zoom-in-95 shrink-0 font-sans shadow-sm absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap z-10">
                                      <span className="text-rose-500 dark:text-rose-400 mr-0.5">Delete?</span>
                                      <button 
                                        onClick={() => {
                                          handleDeleteComment(comment.id);
                                          setDeletingCommentId(null);
                                        }}
                                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold"
                                      >
                                        Yes
                                      </button>
                                      <span className="text-slate-300 dark:text-slate-800">|</span>
                                      <button 
                                        onClick={() => setDeletingCommentId(null)}
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-extrabold"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeletingCommentId(comment.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-rose-500 rounded transition-all cursor-pointer shrink-0"
                                      title="Delete comment"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                          </div>
                          
                          {/* Body Content */}
                          <p className="text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans mt-0.5">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-5 mt-2 mb-1">
                            {allowComments && !deletingCommentId && (
                              <button
                                onClick={() => {
                                  setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id);
                                  setReplyText("");
                                }}
                                className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                              >
                                Reply
                              </button>
                            )}
                            <button 
                               onClick={() => handleLikeToggle(comment.id)}
                               className={`text-[13px] font-semibold transition-colors flex items-center gap-1 ${
                                 likedComments.includes(comment.id) 
                                   ? "text-rose-500" 
                                   : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                               }`}>
                               <IconlyHeart size={14} set={likedComments.includes(comment.id) ? "bold" : "curved"} primaryColor="currentColor" className={likedComments.includes(comment.id) ? "text-rose-500" : ""} />
                               {likedComments.includes(comment.id) ? "1" : ""}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* INDENTED THREADED REPLIES CONTAINER WITH SLATE TIMELINE CONNECTING LINE */}
                      {(commentReplies.length > 0 || replyingToCommentId === comment.id) && (
                        <div className="ml-5 pl-5 border-l-2 border-slate-100 dark:border-slate-800/70 space-y-4 relative">
                          
                          {/* Nested Replies Loop */}
                          {commentReplies.map((reply) => {
                            const replyName = reply.profiles?.full_name || "Anonymous Trader";
                            const replyHandle = reply.profiles?.username ? `@${reply.profiles.username}` : "@anonymous";
                            const replyAvatar = reply.profiles?.avatar_url || "/default-avatar.svg";
                            const isOwnReply = reply.user_id === currentUserId || replyHandle === `@${localStorage.getItem("tradifive_cached_username")}`;

                            return (
                              <div key={reply.id} className="flex gap-2.5 items-start group relative animate-in fade-in duration-200">
                                {/* Child Reply Box - Professional Flat Layout */}
                                <div className="flex gap-2.5 items-start group relative">
                                  <img 
                                    src={replyAvatar} 
                                    alt={replyName} 
                                    onClick={() => handleUserClick(reply.profiles?.username || replyName)}
                                    className="w-7 h-7 rounded-full shrink-0 border border-slate-200/50 dark:border-slate-800 object-cover bg-slate-100 shadow-sm mt-0.5 cursor-pointer hover:opacity-80 transition-opacity" 
                                    onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }}
                                  />
                                  <div className="flex-grow text-xs relative pt-0.5">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate font-sans">
                                          {replyName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-450 font-medium truncate font-sans">{replyHandle}</span>
                                      </div>      
                                      
                                      {/* Date and Delete Action for Reply */}
                                      <div className="flex items-center gap-2 shrink-0 relative">
                                        <span className="text-[9px] text-slate-400 dark:text-slate-400 font-bold font-sans">
                                          {formatCommentDate(reply.created_at)}
                                        </span>
                                        {isOwnReply && (
                                          <div className="relative">
                                            {deletingCommentId === reply.id ? (
                                              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-in fade-in zoom-in-95 shrink-0 font-sans shadow-sm absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap z-10">
                                                <span className="text-rose-500 dark:text-rose-400 mr-0.5">Delete?</span>
                                                <button 
                                                  onClick={() => {
                                                    handleDeleteComment(reply.id);
                                                    setDeletingCommentId(null);
                                                  }}
                                                  className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold"
                                                >
                                                  Yes
                                                </button>
                                                <span className="text-slate-300 dark:text-slate-800">|</span>
                                                <button 
                                                  onClick={() => setDeletingCommentId(null)}
                                                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-extrabold"
                                                >
                                                  No
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => setDeletingCommentId(reply.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-450 hover:text-rose-500 rounded transition-all cursor-pointer shrink-0"
                                                title="Delete reply"
                                              >
                                                <Trash2 size={11} />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans mt-0.5">
                                      {reply.content}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <button 
                                        onClick={() => handleLikeToggle(reply.id)}
                                        className={`text-[12px] font-semibold transition-colors flex items-center gap-1 ${
                                          likedComments.includes(reply.id) 
                                            ? "text-rose-500" 
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}>
                                         <IconlyHeart size={13} set={likedComments.includes(reply.id) ? "bold" : "curved"} primaryColor="currentColor" className={likedComments.includes(reply.id) ? "text-rose-500" : ""} />
                                         {likedComments.includes(reply.id) ? "1" : ""}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Nesting Inline Reply Input Form */}
                          {replyingToCommentId === comment.id && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!replyText.trim()) return;
                                handlePublishComment(replyText, comment.id);
                                setReplyText("");
                                setReplyingToCommentId(null);
                              }}
                              className="flex items-center gap-2 relative pt-2 pb-1 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
                            >
                              <div className="relative flex-grow">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to ${commenterHandle}...`}
                                  disabled={submitting}
                                  maxLength={140}
                                  className="w-full pl-4 pr-10 py-2 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-transparent text-[13px] outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-300 dark:focus:border-slate-700 transition-colors text-slate-900 dark:text-white placeholder:text-slate-500"
                                />
                                <button
                                  type="submit"
                                  disabled={!replyText.trim() || submitting}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-blue-500 hover:text-blue-600 disabled:opacity-40 transition-colors"
                                >
                                  {submitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <IconlySend size={16} set={replyText.trim() ? "bold" : "curved"} primaryColor="currentColor" />
                                  )}
                                </button>
                              </div>
                            </form>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-[#1E1E1E]">
              {allowComments ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!inputText.trim()) return;
                  handlePublishComment(inputText);
                  setInputText("");
                }} className="flex items-center gap-3 relative">
                  <img src={localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg"} className="w-9 h-9 rounded-full shrink-0 border border-slate-200/50 dark:border-slate-800 object-cover" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Add a comment..."
                      disabled={submitting}
                      maxLength={180}
                      className="w-full pl-4 pr-10 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-transparent text-[14px] outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-300 dark:focus:border-slate-700 transition-colors text-slate-900 dark:text-white placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || submitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-blue-500 hover:text-blue-600 disabled:opacity-40 transition-colors"
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <IconlySend size={18} set={inputText.trim() ? "bold" : "curved"} primaryColor="currentColor" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-450 text-[12px] font-semibold select-none">
                  <Lock size={14} className="text-slate-400" />
                  <span>Comments are disabled for this post.</span>
                </div>
              )}
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
