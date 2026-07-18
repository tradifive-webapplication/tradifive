import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, Lock, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string | null;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
  allowComments: boolean;
  onCommentsCountChange: (newCount: number) => void;
}

export default function CommentSection({
  postId,
  currentUserId,
  allowComments,
  onCommentsCountChange
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
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
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || submitting) return;

    if (!allowComments) {
      toast.error("Comments are locked for this post.");
      return;
    }

    setSubmitting(true);
    const contentText = inputText.trim();

    const newCommentPayload = {
      post_id: postId,
      user_id: currentUserId || "mock-user-id",
      content: contentText,
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
        localStorage.setItem("fialgo_local_comments", JSON.stringify(localComments));
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
          localStorage.setItem("fialgo_local_posts", JSON.stringify(localPosts));
        } else {
          // Store an override map for database post comments so that counts persist locally
          const localCommentCounts = JSON.parse(localStorage.getItem("fialgo_local_comment_counts") || "{}");
          const currentCount = localCommentCounts[postId] || 0;
          localCommentCounts[postId] = currentCount + 1;
          localStorage.setItem("fialgo_local_comment_counts", JSON.stringify(localCommentCounts));
        }

        const updatedList = [...comments, publishedComment];
        setComments(updatedList);
        onCommentsCountChange(updatedList.length);
        setInputText("");
        toast.success("Comment published successfully!");
      }
    } catch (err: any) {
      console.error("Comment submission failed:", err);
      toast.error(err.message || "Failed to submit comment.");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-4 font-sans select-text">
      
      {/* Comments List */}
      <div className="space-y-3.5 max-h-[220px] overflow-y-auto amazing-scrollbar pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 size={16} className="animate-spin mr-1.5" />
            <span className="text-xs font-semibold">Loading discussions...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-5 text-slate-400 dark:text-slate-400">
            <MessageSquare size={20} className="mx-auto mb-2 opacity-50" />
            <p className="text-[11px] font-bold uppercase tracking-wider">No comments yet</p>
            <p className="text-[10px] font-semibold mt-1">Be the first to share your systematic setup insights!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const commenterName = comment.profiles?.full_name || "Anonymous Trader";
            const commenterHandle = comment.profiles?.username ? `@${comment.profiles.username}` : "@anonymous";
            const commenterAvatar = comment.profiles?.avatar_url || "/default-avatar.svg";
            
            return (
              <div key={comment.id} className="flex gap-3 items-start animate-in fade-in duration-200">
                <img 
                  src={commenterAvatar} 
                  alt={commenterName} 
                  className="w-7 h-7 rounded-full shrink-0 border border-slate-200/50 dark:border-slate-800 object-cover bg-slate-100" 
                />
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/25 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1">
                        {commenterName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{commenterHandle}</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400 dark:text-slate-400 font-bold shrink-0">
                      {formatCommentDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-655 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-wrap select-text">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comment Input */}
      {allowComments ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1 relative shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a systematic setup comment..."
            disabled={submitting}
            maxLength={180}
            className="flex-grow pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#0E121F] border-2 border-slate-100 dark:border-[#222B3F] text-xs font-semibold outline-none focus:border-blue-500 dark:focus:border-blue-505 transition-colors text-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || submitting}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-450 text-[10.5px] font-black uppercase tracking-wider select-none">
          <Lock size={12} className="text-slate-400" />
          <span>Comments are disabled by the author</span>
        </div>
      )}

    </div>
  );
}
