import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, MoreHorizontal, Heart, MessageSquare, MessageCircle, MessageSquareText, MessageCircleMore, Share, Share2, Bookmark, UserPlus, UserCheck, Flame, ShieldCheck, TrendingUp, Layers, Eye, Calendar, Globe, Sliders, PlayCircle, Play, Pause, CheckCircle2, Crown, Send, Volume2, VolumeX, Edit2, Trash2, AlertTriangle, Link2, Sparkles, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CommentModal from "@/components/CommentModal";
import { FeedPost } from "@/hooks/useHomeData";
import { addXP } from "@/utils/gamification";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import { UserHoverCard } from "@/components/UserHoverCard";

import { Heart as IconlyHeart, Upload as IconlySend, Bookmark as IconlyBookmark } from "react-iconly";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogPopup,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LikeBurst = () => {
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        x: Math.cos(i * (Math.PI / 3)) * 24,
                        y: Math.sin(i * (Math.PI / 3)) * 24
                    }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                    className={`absolute w-1.5 h-1.5 rounded-full ${['bg-rose-500', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400', 'bg-pink-400'][i]}`}
                />
            ))}
        </div>
    )
}

const ChatWithLines = ({ size = 20, set = "curved", stroke = "regular", className = "" }) => {
    const strokeW = stroke === "bold" ? 2 : 1.5;
    if (set === "bold") {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
                <g transform="translate(2 2)">
                    <mask id={`chat-mask-${size}`}>
                        <rect x="-2" y="-2" width="24" height="24" fill="white" />
                        <path d="M6.5 8.5h7M6.5 11.5h4" stroke="black" strokeWidth={strokeW} strokeLinecap="round" />
                    </mask>
                    <path mask={`url(#chat-mask-${size})`} d="M10,20a9.955,9.955,0,0,1-4.92-1.3,2.2,2.2,0,0,0-1.107-.424,1.213,1.213,0,0,0-.383.063l-2.02.6a.754.754,0,0,1-.226.036.62.62,0,0,1-.5-.239.647.647,0,0,1-.094-.578l.67-2.244a1.046,1.046,0,0,0-.07-.9,10.566,10.566,0,0,1-1.35-5A10.158,10.158,0,0,1,2.831,3.032,9.89,9.89,0,0,1,10.02,0a9.865,9.865,0,0,1,7.12,2.994,10.058,10.058,0,0,1,2.1,3.182A9.89,9.89,0,0,1,20,9.985a10.138,10.138,0,0,1-.865,4.172,9.6,9.6,0,0,1-2.275,3.153A10.245,10.245,0,0,1,10,20Z" fill="currentColor"></path>
                </g>
            </svg>
        )
    }
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <g transform="translate(2 2)">
                <path d="M17.071,17.07a10.006,10.006,0,0,1-11.285,2c-.547-.22-4.085.76-4.853-.007s.213-4.307-.007-4.854A10,10,0,1,1,17.071,17.07Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeW}></path>
                <path d="M6.5 8.5h7M6.5 11.5h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={strokeW} />
            </g>
        </svg>
    )
}

const AnimatedCounter = ({ value }: { value: number }) => {
    const prevValueRef = useRef(value);
    const direction = value > prevValueRef.current ? 1 : -1;

    useEffect(() => {
        prevValueRef.current = value;
    }, [value]);

    const digits = String(value).split("");

    return (
        <span className="relative flex items-center justify-center overflow-hidden h-[18px]">
            {digits.map((digit, index) => (
                <span key={index} className="relative inline-block w-[1ch] h-[18px]">
                    <AnimatePresence custom={direction} initial={false}>
                        <motion.span
                            key={digit}
                            custom={direction}
                            initial={(d) => ({ y: d > 0 ? 15 : -15, opacity: 0, position: "absolute" })}
                            animate={{ y: 0, opacity: 1, position: "absolute" }}
                            exit={(d) => ({ y: d > 0 ? -15 : 15, opacity: 0, position: "absolute" })}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
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

const TwitterCommentIcon = ({ size = 18, className = "" }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
    </svg>
);

interface FeedCardProps {
    feed: FeedPost;
    currentUserId: string;
    followedUsers: Record<string, boolean>;
    onToggleFollow: (id: string, name: string) => void;
    isLiked: boolean;
    likes: number;
    onLike: (postId: string) => void;
    onEdit?: (feed: FeedPost) => void;
    onDelete?: (postId: string) => void;
    onVote?: (postId: string, updatedMediaUrl: string) => void;
    onImageClick?: (url: string) => void;
}

function FeedCard({
    feed,
    currentUserId,
    followedUsers,
    onToggleFollow,
    isLiked,
    likes,
    onLike,
    onEdit,
    onDelete,
    onVote,
    onImageClick
}: FeedCardProps) {
    const navigate = useNavigate();


    const authorName = feed.profiles?.full_name || "Anonymous Trader";
    const authorHandle = feed.profiles?.username ? `@${feed.profiles.username}` : "@anonymous";
    const authorAvatar = feed.profiles?.avatar_url || "/default-avatar.svg";
    const rawImages = Array.isArray(feed.media_urls) ? feed.media_urls : [];
    const images = rawImages.filter(url => typeof url === 'string' && url.trim() !== '' && !url.trim().startsWith('{') && !url.trim().startsWith('['));
    const tags = feed.tags || [];
    const comments = feed.comment_count ?? feed.comments_count ?? 0;
    const initialBookmarked = feed.bookmark_count ? feed.bookmark_count > 0 : false;
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldShowReadMore = feed.content && (feed.content.length > 450 || feed.content.split('\n').length > 4);
    const [localShareCount, setLocalShareCount] = useState(feed.share_count || 0);

    const [isBookmarked, setIsBookmarked] = useState(() => {
        const bookmarks = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
        return bookmarks[feed.id] !== undefined ? bookmarks[feed.id] : initialBookmarked;
    });

    // Sync bookmark status with Supabase on mount/feed change
    useEffect(() => {
        const syncBookmark = async () => {
            if (!currentUserId || feed.id.startsWith('local-')) return;
            try {
                const { data } = await supabase
                    .from('social_post_bookmarks')
                    .select('id')
                    .eq('post_id', feed.id)
                    .eq('user_id', currentUserId)
                    .maybeSingle();

                if (data) {
                    setIsBookmarked(true);
                    const bookmarks = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
                    bookmarks[feed.id] = true;
                    localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(bookmarks));
                }
            } catch (err) {
                console.error("Error checking bookmark status:", err);
            }
        };
        syncBookmark();
    }, [feed.id, currentUserId]);

    const handleBookmark = async () => {
        const nextState = !isBookmarked;
        setIsBookmarked(nextState);
        const bookmarks = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
        if (nextState) {
            bookmarks[feed.id] = true;
            toast.success("Post saved to bookmarks!");
        } else {
            delete bookmarks[feed.id];
            toast.info("Post removed from bookmarks.");
        }
        localStorage.setItem("fialgo_local_bookmarks", JSON.stringify(bookmarks));

        if (!currentUserId || feed.id.startsWith('local-')) return;

        try {
            if (nextState) {
                await supabase.from('social_post_bookmarks').insert([{
                    post_id: feed.id,
                    user_id: currentUserId
                }]);
                const { data: postData } = await supabase.from('social_posts').select('bookmark_count').eq('id', feed.id).single();
                const count = (postData?.bookmark_count || 0) + 1;
                await supabase.from('social_posts').update({ bookmark_count: count }).eq('id', feed.id);
            } else {
                await supabase.from('social_post_bookmarks').delete().eq('post_id', feed.id).eq('user_id', currentUserId);
                const { data: postData } = await supabase.from('social_posts').select('bookmark_count').eq('id', feed.id).single();
                const count = Math.max(0, (postData?.bookmark_count || 0) - 1);
                await supabase.from('social_posts').update({ bookmark_count: count }).eq('id', feed.id);
            }
        } catch (err) {
            console.error("Error updating bookmark in Supabase:", err);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Post by ${authorName}`,
            text: feed.content || "Check out this post!",
            url: window.location.origin + `/post/${feed.id}`
        };

        setLocalShareCount(prev => prev + 1);

        if (currentUserId && !feed.id.startsWith('local-')) {
            try {
                const { data: postData } = await supabase.from('social_posts').select('share_count').eq('id', feed.id).single();
                const count = (postData?.share_count || 0) + 1;
                await supabase.from('social_posts').update({ share_count: count }).eq('id', feed.id);
            } catch (err) {
                console.error("Error updating share count in Supabase:", err);
            }
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };


    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [focusedImageUrl, setFocusedImageUrl] = useState<string | null>(null);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [showLikeBurst, setShowLikeBurst] = useState(false);
    const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
    const heartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Video Autoplay logic
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Scrubbing logic
    const progressRef = useRef<HTMLDivElement>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [showControls, setShowControls] = useState(false);
    useEffect(() => {
        if (!videoRef.current || feed.media_type !== 'video') return;

        const videoEl = videoRef.current;

        const handleTimeUpdate = () => {
            if (videoEl.duration > 0 && !isScrubbing) {
                setProgress((videoEl.currentTime / videoEl.duration) * 100);
            }
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        videoEl.addEventListener('timeupdate', handleTimeUpdate);
        videoEl.addEventListener('play', handlePlay);
        videoEl.addEventListener('pause', handlePause);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoEl.play().catch(() => { });
                    } else {
                        videoEl.pause();
                    }
                });
            },
            { threshold: 0.1 } // 10% of video must be visible to autoplay/stay playing
        );

        observer.observe(videoEl);
        return () => {
            observer.unobserve(videoEl);
            videoEl.removeEventListener('timeupdate', handleTimeUpdate);
            videoEl.removeEventListener('play', handlePlay);
            videoEl.removeEventListener('pause', handlePause);
        };
    }, [feed.media_type, feed.media_url]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(() => { });
            }
        }
    };

    const updateVideoProgress = (clientX: number) => {
        if (!videoRef.current || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        videoRef.current.currentTime = percentage * videoRef.current.duration;
        setProgress(percentage * 100);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsScrubbing(true);
        updateVideoProgress(e.clientX);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (isScrubbing) {
            updateVideoProgress(e.clientX);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (isScrubbing) {
            setIsScrubbing(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    const handleImageInteraction = (url: string, e: React.MouseEvent) => {
        if (e.detail === 1) {
            clickTimerRef.current = setTimeout(() => {
                setFocusedImageUrl(url);
            }, 250);
        } else if (e.detail === 2) {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
            // Trigger heart animation
            if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
            setShowHeartAnimation(true);
            heartTimeoutRef.current = setTimeout(() => setShowHeartAnimation(false), 900);
            if (!isLiked) {
                onLike(feed.id);
            }
        }
    };
    const [localCommentsCount, setLocalCommentsCount] = useState<number>(() => {
        const localCommentCounts = JSON.parse(localStorage.getItem("fialgo_local_comment_counts") || "{}");
        const storedOverride = localCommentCounts[feed.id];
        return storedOverride !== undefined ? storedOverride : comments;
    });

    // Vote state
    const votedOptionKey = `tradifive_voted_poll_${feed.id}`;
    const [votedOption, setVotedOption] = useState<number | null>(() => {
        const val = localStorage.getItem(votedOptionKey);
        return val !== null ? Number(val) : null;
    });

    // Parse poll details if applicable
    let pollData: { options: string[]; votes: number[] } | null = null;
    let signalData: { action: string; asset: string; entry: string; tp: string; sl: string } | null = null;
    if (feed.post_type === "poll" && feed.media_url) {
        try {
            pollData = JSON.parse(feed.media_url);
        } catch (e) { }
    } else if (feed.post_type === "signal" && feed.media_url) {
        try {
            signalData = JSON.parse(feed.media_url);
        } catch (e) { }
    }

    const handleVoteOption = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!pollData || votedOption !== null || feed.user_id === currentUserId) return;
        const updatedVotes = [...pollData.votes];
        updatedVotes[index]++;
        const updatedPoll = { ...pollData, votes: updatedVotes };

        localStorage.setItem(votedOptionKey, String(index));
        setVotedOption(index);

        if (onVote) {
            onVote(feed.id, JSON.stringify(updatedPoll));
        }
    };

    const totalPollVotes = pollData ? pollData.votes.reduce((a, b) => a + b, 0) : 0;
    const hasVotedOrOwns = votedOption !== null || feed.user_id === currentUserId;

    return (
        <div className="p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[32px] bg-white dark:bg-[#1C1C1E] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100/50 dark:border-white/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-left">
                    <UserHoverCard
                        userId={feed.user_id || ""}
                        username={authorHandle}
                        authorName={authorName}
                        authorAvatar={authorAvatar}
                        currentUserId={currentUserId}
                        isFollowing={followedUsers[feed.user_id || ""]}
                        onToggleFollow={onToggleFollow}
                    >
                        <Link to={`/user/${authorHandle.replace('@', '')}`} className="shrink-0 hover:opacity-85 transition-opacity block">
                            <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full bg-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                        </Link>
                    </UserHoverCard>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <UserHoverCard
                                userId={feed.user_id || ""}
                                username={authorHandle}
                                authorName={authorName}
                                authorAvatar={authorAvatar}
                                currentUserId={currentUserId}
                                isFollowing={followedUsers[feed.user_id || ""]}
                                onToggleFollow={onToggleFollow}
                            >
                                <Link to={`/user/${authorHandle.replace('@', '')}`} className="hover:opacity-85 transition-opacity group/feedcard block">
                                    <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight group-hover/feedcard:text-blue-500 transition-colors">{authorName}</p>
                                </Link>
                            </UserHoverCard>
                            <span className="text-[12px] text-slate-400 dark:text-zinc-400 font-medium select-none">{authorHandle}</span>
                            {feed.created_at && (
                                <span className="text-[12px] text-slate-400 dark:text-zinc-400">
                                    · {formatDistanceToNow(new Date(feed.created_at), { addSuffix: false })
                                        .replace("about ", "")
                                        .replace("less than a minute ago", "now")
                                        .replace(" minutes", "m")
                                        .replace(" minute", "m")
                                        .replace(" hours", "h")
                                        .replace(" hour", "h")
                                        .replace(" days", "d")
                                        .replace(" day", "d")
                                        .replace(" months", "mo")
                                        .replace(" month", "mo")
                                        .replace(" years", "y")
                                        .replace(" year", "y")}
                                </span>
                            )}
                            {feed.profiles?.account_type === 'creator' && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
                                    <Crown size={10} className="text-purple-600 dark:text-purple-400" />
                                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Creator</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {feed.profiles?.account_type === 'creator' && (
                        <button className="text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#222] px-3 py-1.5 rounded-[10px] hover:bg-slate-200 dark:hover:bg-[#333] transition-colors">
                            Channel
                        </button>
                    )}

                    {/* AI Coach Summary Trigger */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent("open-floating-ai-coach", {
                                detail: {
                                    text: `Summarize and review this post by ${authorName} (${authorHandle}):\n\n"${feed.content}"`,
                                    autoSend: true,
                                    postContext: {
                                        authorName,
                                        authorHandle,
                                        authorAvatar,
                                        content: feed.content,
                                        mediaUrls: images.length > 0 ? images : (feed.media_url ? [feed.media_url] : []),
                                        mediaType: feed.media_type || 'image',
                                        timestamp: feed.created_at,
                                        postType: feed.post_type
                                    }
                                }
                            }));
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-slate-400 hover:text-blue-500"
                        title="AI Coach Summary"
                    >
                        <Sparkles size={18} />
                    </button>

                    {/* Floating Actions Menu Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#1C2031] border border-slate-250 dark:border-slate-850 shadow-xl z-20 py-1.5 text-left font-sans animate-in fade-in slide-in-from-top-1 duration-150">
                                    {feed.user_id !== currentUserId ? (
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                toast.success("Post reported successfully!");
                                            }}
                                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252C42] hover:text-rose-500 text-left transition-colors flex items-center gap-2 group"
                                        >
                                            <AlertTriangle size={14} className="text-slate-400 group-hover:text-rose-500 transition-colors shrink-0" />
                                            <span>Report Post</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    if (onEdit) onEdit(feed);
                                                }}
                                                className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252C42] hover:text-blue-500 text-left transition-colors flex items-center gap-2 group"
                                            >
                                                <Edit2 size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                                <span>Edit Post</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="w-full px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-slate-50 dark:hover:bg-[#252C42] text-left transition-colors flex items-center gap-2 group"
                                            >
                                                <Trash2 size={14} className="text-rose-400 group-hover:text-rose-500 transition-colors shrink-0" />
                                                <span>Delete Post</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigator.clipboard.writeText(window.location.origin + `/post/${feed.id}`);
                                            toast.success("Post link copied!");
                                        }}
                                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252C42] hover:text-blue-500 text-left transition-colors flex items-center gap-2 group"
                                    >
                                        <Link2 size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                        <span>Copy Post Link</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigator.clipboard.writeText(window.location.origin + "/user/" + (feed.profiles?.username || ""));
                                            toast.success("Profile link copied!");
                                        }}
                                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252C42] hover:text-blue-500 text-left transition-colors flex items-center gap-2 group"
                                    >
                                        <Link2 size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                        <span>Copy Profile Link</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content & Tags */}
            <div className={`text-[15px] font-medium tracking-tight text-slate-800 dark:text-slate-200 mb-3 mt-2 prose prose-sm dark:prose-invert max-w-none prose-p:leading-[1.5] prose-p:font-medium prose-p:text-[15px] prose-p:tracking-tight prose-a:text-blue-500 break-words ${!isExpanded && shouldShowReadMore ? 'line-clamp-4' : ''}`}>
                {feed.content && <ReactMarkdown>{feed.content}</ReactMarkdown>}
            </div>
            {shouldShowReadMore && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="font-bold text-blue-500 dark:text-blue-400 -mt-2 mb-3 hover:underline focus:outline-none text-[13px]"
                >
                    {isExpanded ? 'show less' : 'read more'}
                </button>
            )}

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag: string) => (
                        <span key={tag} className="text-[12px] font-bold text-blue-500">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Media Rendering */}
            {images.length > 0 ? (
                <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 relative select-none">
                    {images.length >= 4 ? (
                        <div className="grid grid-cols-2 gap-1 h-[300px]">
                            <div className="col-span-1 h-full min-h-0 cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[0], e)}>
                                <img src={images[0]} className="w-full h-full object-cover" draggable={false} />
                            </div>
                            <div className="col-span-1 grid grid-rows-2 gap-1 h-full min-h-0">
                                <div className="w-full h-full min-h-0 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[1], e)}>
                                    <img src={images[1]} className="w-full h-full object-cover" draggable={false} />
                                </div>
                                <div className="grid grid-cols-2 gap-1 h-full min-h-0">
                                    <div className="w-full h-full min-h-0 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[2], e)}>
                                        <img src={images[2]} className="w-full h-full object-cover" draggable={false} />
                                    </div>
                                    <div className="relative w-full h-full min-h-0 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[3], e)}>
                                        <img src={images[3]} className="w-full h-full object-cover" draggable={false} />
                                        {images.length > 4 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[2px]">
                                                +{images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : images.length === 3 ? (
                        <div className="grid grid-cols-2 gap-1 h-[300px]">
                            <div className="col-span-1 h-full min-h-0 cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[0], e)}>
                                <img src={images[0]} className="w-full h-full object-cover" draggable={false} />
                            </div>
                            <div className="col-span-1 grid grid-rows-2 gap-1 h-full min-h-0">
                                <div className="w-full h-full min-h-0 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[1], e)}>
                                    <img src={images[1]} className="w-full h-full object-cover" draggable={false} />
                                </div>
                                <div className="w-full h-full min-h-0 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[2], e)}>
                                    <img src={images[2]} className="w-full h-full object-cover" draggable={false} />
                                </div>
                            </div>
                        </div>
                    ) : images.length === 2 ? (
                        <div className="grid grid-cols-2 gap-1 h-[300px]">
                            <img src={images[0]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[0], e)} draggable={false} />
                            <img src={images[1]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => handleImageInteraction(images[1], e)} draggable={false} />
                        </div>
                    ) : (
                        <img
                            src={images[0]}
                            className="w-full h-auto max-h-[480px] object-contain bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={(e) => handleImageInteraction(images[0], e)}
                            alt="Feed Attachment"
                            draggable={false}
                        />
                    )}
                    {/* Instagram-style double-tap heart animation */}
                    <AnimatePresence>
                        {showHeartAnimation && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.3, 1, 1], opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 0.85, times: [0, 0.25, 0.6, 1], ease: "easeOut" }}
                                >
                                    <IconlyHeart set="bold" stroke="bold" primaryColor="currentColor" size={80} className="text-white fill-white drop-shadow-[0_4px_24px_rgba(239,68,68,0.7)]" style={{ filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.6))' }} />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : feed.media_url && typeof feed.media_url === 'string' && feed.media_url.trim() !== '' && !feed.media_url.trim().startsWith('{') && !feed.media_url.trim().startsWith('[') && feed.post_type !== "poll" && feed.post_type !== "signal" ? (
                <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center relative select-none group">
                    {feed.media_type === 'video' ? (
                        <div 
                            className="relative w-full flex items-center justify-center bg-black group overflow-hidden"
                            onClick={togglePlay}
                            onMouseEnter={() => setShowControls(true)}
                            onMouseLeave={() => setShowControls(false)}
                            onTouchStart={() => setShowControls(true)}
                        >
                            <video
                                ref={videoRef}
                                src={feed.media_url}
                                className="w-full h-auto max-h-[500px] object-contain cursor-pointer"
                                playsInline
                                loop
                                muted={isMuted}
                                preload="auto"
                            />
                            
                            {/* Big Center Play Button (visible when paused) */}
                            <AnimatePresence>
                                {!isPlaying && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-xl">
                                            <Play className="w-8 h-8 ml-1" fill="currentColor" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Bottom Controls Bar (visible on hover or when paused) */}
                            <AnimatePresence>
                                {(showControls || !isPlaying) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-4 transition-opacity duration-300"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Play/Pause Button */}
                                        <button 
                                            onClick={togglePlay}
                                            className="text-white hover:text-blue-500 transition-colors"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
                                        </button>

                                        {/* Scrubber */}
                                        <div 
                                            ref={progressRef}
                                            className="flex-1 h-2 bg-white/30 rounded-full cursor-pointer relative group/scrubber touch-none"
                                            onPointerDown={handlePointerDown}
                                        >
                                            <div 
                                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                            {/* Scrubber Thumb */}
                                            <div 
                                                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform"
                                                style={{ left: `calc(${progress}% - 7px)` }}
                                            />
                                        </div>

                                        {/* Mute Button */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMuted(!isMuted);
                                            }}
                                            className="text-white hover:text-blue-500 transition-colors"
                                        >
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <img
                            src={feed.media_url}
                            className="w-full h-auto max-h-[480px] object-contain cursor-pointer hover:opacity-98 transition-all"
                            onClick={(e) => handleImageInteraction(feed.media_url!, e)}
                            alt="Feed Attachment"
                            draggable={false}
                        />
                    )}
                    {/* Instagram-style double-tap heart animation */}
                    <AnimatePresence>
                        {showHeartAnimation && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.3, 1, 1], opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 0.85, times: [0, 0.25, 0.6, 1], ease: "easeOut" }}
                                >
                                    <IconlyHeart set="bold" stroke="bold" primaryColor="currentColor" size={80} className="text-white fill-white drop-shadow-[0_4px_24px_rgba(239,68,68,0.7)]" style={{ filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.6))' }} />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : null}

            {/* Signal Rendering */}
            {signalData && (
                <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0D18] overflow-hidden relative">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <TrendingUp size={16} />
                            </span>
                            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">Trading Signal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${signalData.action === "Buy" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}>
                                {signalData.action}
                            </span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{signalData.asset}</span>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-[#151720] rounded-xl p-3 flex flex-col justify-center items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Entry</span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{signalData.entry || "-"}</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl p-3 flex flex-col justify-center items-center border border-emerald-100 dark:border-emerald-500/10">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase mb-1">Target</span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{signalData.tp || "-"}</span>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-500/5 rounded-xl p-3 flex flex-col justify-center items-center border border-rose-100 dark:border-rose-500/10">
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase mb-1">Stop</span>
                            <span className="text-sm font-black text-rose-700 dark:text-rose-400">{signalData.sl || "-"}</span>
                        </div>
                    </div>
                    {feed.is_premium && feed.user_id !== currentUserId && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-[#0B0D18]/80 backdrop-blur-[6px] flex flex-col items-center justify-center text-center p-6 z-10 rounded-2xl">
                            <span className="p-3 bg-indigo-500/10 text-indigo-500 rounded-full mb-3">
                                <Crown size={24} />
                            </span>
                            <h3 className="font-black text-slate-900 dark:text-white mb-2">Premium Signal</h3>
                            <p className="text-xs text-slate-500 font-semibold mb-4">Unlock this signal to see exact entry, target, and stop levels.</p>
                            <button className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30">
                                Unlock Now
                            </button>
                        </div>
                    )}
                </div>
            )}
            {pollData && (
                <div className="mb-4 mt-2 space-y-2">
                    {pollData.options.map((opt, idx) => {
                        const votes = pollData!.votes[idx] || 0;
                        const percentage = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
                        const isWinner = totalPollVotes > 0 && percentage === Math.max(...pollData!.options.map((_, i) => totalPollVotes > 0 ? Math.round(((pollData!.votes[i] || 0) / totalPollVotes) * 100) : 0));

                        return hasVotedOrOwns ? (
                            <div key={idx} className={`relative w-full p-4 rounded-2xl border transition-all duration-300 overflow-hidden select-none flex items-center justify-between group ${votedOption === idx ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]'}`}>
                                <div
                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${votedOption === idx ? 'bg-blue-500/10 dark:bg-blue-500/15' : 'bg-slate-200/50 dark:bg-white/5'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                                <span className={`relative z-10 flex items-center gap-3 font-bold text-[14px] ${votedOption === idx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                    {opt}
                                    {votedOption === idx && (
                                        <CheckCircle2 size={16} className="text-blue-500" />
                                    )}
                                </span>
                                <div className="relative z-10 flex items-center gap-2">
                                    <span className={`font-bold text-[13px] ${isWinner ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <button
                                key={idx}
                                onClick={(e) => handleVoteOption(e, idx)}
                                className="w-full text-left p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {opt}
                                </span>
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-blue-500 transition-colors" />
                            </button>
                        );
                    })}
                    <div className="text-[11px] font-semibold text-slate-500 px-1 pt-2 flex items-center justify-between">
                        <span>{totalPollVotes} vote{totalPollVotes !== 1 ? 's' : ''} • Final results</span>
                        {feed.user_id === currentUserId && <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Your Poll</span>}
                    </div>
                </div>
            )}




            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-6">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isLiked) {
                                setShowLikeBurst(true);
                                setTimeout(() => setShowLikeBurst(false), 800);

                            }
                            onLike(feed.id);
                        }}
                        className={`flex items-center gap-2 transition-all group ${isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                            }`}
                    >
                        <div className="p-2 -m-2 transition-transform duration-200 group-active:scale-90 flex items-center justify-center relative">
                            <AnimatePresence>
                                {showLikeBurst && <LikeBurst />}
                            </AnimatePresence>
                            <IconlyHeart size={18} set={isLiked ? "bold" : "curved"} stroke="bold" primaryColor="currentColor" className={`transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-120 group-hover:rotate-6 ${isLiked ? "fill-current" : ""}`} />
                        </div>
                        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 transition-colors duration-200 group-hover:text-rose-500">
                            <AnimatedCounter value={likes} />
                        </span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 transition-all group ${showComments ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                            }`}
                    >
                        <div className="p-2 -m-2 transition-transform duration-200 group-active:scale-90 flex items-center justify-center">
                            <ChatWithLines size={18} set={showComments ? "bold" : "curved"} stroke="bold" className={`transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-110 ${showComments ? 'text-indigo-500' : ''}`} />
                        </div>
                        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 transition-colors duration-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                            <AnimatedCounter value={localCommentsCount} />
                        </span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
                    >
                        <div className="p-2 -m-2 transition-transform duration-200 group-active:scale-90 flex items-center justify-center">
                            <IconlySend size={18} set="curved" stroke="bold" primaryColor="currentColor" className="transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-110 group-hover:-translate-y-0.5" />
                        </div>
                    </button>
                </div>
                <button onClick={handleBookmark} className="text-slate-400 hover:text-blue-500 transition-all group">
                    <div className="p-2 -m-2 transition-transform duration-200 group-active:scale-90 flex items-center justify-center">
                        <IconlyBookmark size={18} set="curved" stroke="bold" primaryColor="currentColor" className={`transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-120 group-hover:-rotate-6 ${isBookmarked ? 'text-blue-500 fill-current' : ''}`} />
                    </div>
                </button>
            </div>

            {/* Real-time centered Comment Modal Dialog or Full Screen Media Viewer */}
            <CommentModal
                isOpen={showComments || !!focusedImageUrl}
                onClose={() => { setShowComments(false); setFocusedImageUrl(null); }}
                postId={feed.id}
                currentUserId={currentUserId}
                post={feed}
                onCommentsCountChange={(newCount) => setLocalCommentsCount(newCount)}
                focusedImageUrl={focusedImageUrl}
            />

            {/* Delete Confirmation Modal */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogPopup className="bg-white dark:bg-[#121212] border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white font-bold text-xl mb-2">Delete Post</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                            Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                        <AlertDialogClose render={<button className="bg-slate-100 dark:bg-[#1E1E1E] hover:bg-slate-200 dark:hover:bg-[#222] text-slate-800 dark:text-slate-200 border-none px-4 py-2 rounded-lg font-medium transition-colors" />}>Cancel</AlertDialogClose>
                        <AlertDialogClose 
                            onClick={() => {
                                if (onDelete) onDelete(feed.id);
                            }}
                            render={<button className="bg-rose-500 hover:bg-rose-600 text-white border-none px-4 py-2 rounded-lg font-medium transition-colors" />}
                        >
                            Yes, Delete
                        </AlertDialogClose>
                    </AlertDialogFooter>
                </AlertDialogPopup>
            </AlertDialog>
        </div>
    );
}

export default React.memo(FeedCard);
