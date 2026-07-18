import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { FollowButton } from "@/components/ui/FollowButton";
import { createPortal } from "react-dom";
import { X, Eye, ChevronUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface StoryGroup {
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  stories: {
    id: string;
    mediaUrl: string;
    mediaType?: string;
    content?: string;
    createdAt: string;
  }[];
}

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  currentUserId: string;
  onDeleteSuccess?: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewer({
  isOpen,
  onClose,
  storyGroups,
  initialGroupIndex,
  currentUserId,
  onDeleteSuccess,
}: StoryViewerProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [isViewersListOpen, setIsViewersListOpen] = useState(false);
  const [mockViewers, setMockViewers] = useState<any[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const getStartIndex = (group: StoryGroup) => {
    try {
      const seen = JSON.parse(localStorage.getItem('fialgo_seen_stories') || '{}');
      const userSeen = seen[group.userId] || [];
      const firstUnseenIndex = group.stories.findIndex(s => !userSeen.includes(s.id));
      return firstUnseenIndex !== -1 ? firstUnseenIndex : 0;
    } catch (e) {
      return 0;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentGroupIndex(initialGroupIndex);
      const group = storyGroups[initialGroupIndex];
      setCurrentStoryIndex(group ? getStartIndex(group) : 0);
      setProgress(0);
      setIsPaused(false);
      setIsViewersListOpen(false);
      setIsDeleteModalOpen(false);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
      
      try {
        setMockViewers([]);
      } catch (e) {}
    }
  }, [isOpen, initialGroupIndex, storyGroups]);

  useEffect(() => {
    if (!isOpen) return;
    const currentGroup = storyGroups[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];
    if (currentStory && currentGroup) {
      try {
        const seen = JSON.parse(localStorage.getItem('fialgo_seen_stories') || '{}');
        const userSeen = seen[currentGroup.userId] || [];
        if (!userSeen.includes(currentStory.id)) {
          seen[currentGroup.userId] = [...userSeen, currentStory.id];
          localStorage.setItem('fialgo_seen_stories', JSON.stringify(seen));
          
          // Record view in backend
          if (currentUserId && currentUserId !== currentGroup.userId && !currentStory.id.startsWith("local-") && !currentStory.id.startsWith("demo-")) {
            supabase.rpc('record_story_view', { 
              p_story_id: currentStory.id, 
              p_viewer_id: currentUserId 
            }).catch(err => console.error("Error recording view:", err));
          }
        }
      } catch(e) {}
    }
  }, [isOpen, currentGroupIndex, currentStoryIndex, storyGroups, currentUserId]);

  // Handle Base64 video crashing
  useEffect(() => {
    let objectUrl: string | null = null;
    
    const currentGroup = storyGroups[currentGroupIndex];
    if (currentGroup && isOpen) {
      const story = currentGroup.stories[currentStoryIndex];
      if (story?.mediaType === "video" && story.mediaUrl.startsWith("data:")) {
        // Convert to blob to prevent DOM crash with massive strings
        fetch(story.mediaUrl)
          .then(res => res.blob())
          .then(blob => {
            objectUrl = URL.createObjectURL(blob);
            setProcessedVideoUrl(objectUrl);
          })
          .catch(err => {
            console.error("Failed to parse video data URI", err);
            setProcessedVideoUrl(story.mediaUrl);
          });
      } else {
        setProcessedVideoUrl(story?.mediaUrl || null);
      }

      // Fetch real viewers if this is the user's own story
      if (currentGroup.userId === currentUserId && !story.id.startsWith("local-") && !story.id.startsWith("demo-")) {
        supabase
          .from('story_views')
          .select('viewer_id, profiles(full_name, avatar_url, username)')
          .eq('story_id', story.id)
          .then(({ data, error }) => {
            if (!error && data) {
              // Map it to the expected viewer format
              const realViewers = data.map((v: any) => v.profiles).filter(Boolean);
              setMockViewers(realViewers);
            }
          });
      } else {
        setMockViewers([]);
      }
    } else {
      setProcessedVideoUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentGroupIndex, currentStoryIndex, storyGroups, isOpen, currentUserId]);

  const goToNextStory = () => {
    const currentGroup = storyGroups[currentGroupIndex];
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      const nextGroup = storyGroups[currentGroupIndex + 1];
      setCurrentStoryIndex(nextGroup ? getStartIndex(nextGroup) : 0);
      setProgress(0);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      onClose();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      setCurrentStoryIndex(storyGroups[currentGroupIndex - 1].stories.length - 1);
      setProgress(0);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      // Re-start current story
      setProgress(0);
      accumulatedTimeRef.current = 0;
      startTimeRef.current = Date.now();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const animateProgress = () => {
      if (isPaused || isViewersListOpen || isDeleteModalOpen) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
      }

      const now = Date.now();
      const elapsed = (now - startTimeRef.current) + accumulatedTimeRef.current;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        goToNextStory();
      } else {
        setProgress(newProgress);
        animationRef.current = requestAnimationFrame(animateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, currentGroupIndex, currentStoryIndex, isPaused, isViewersListOpen, isDeleteModalOpen, storyGroups]);

  const handlePointerDown = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPaused(false);
    accumulatedTimeRef.current += (Date.now() - pausedTimeRef.current);
    startTimeRef.current = Date.now();

    // Check if click was short enough to be a tap, not a long-press (increased to 400ms for reliability)
    const clickDuration = Date.now() - pausedTimeRef.current;
    if (clickDuration < 400) {
      const { clientX } = e;
      const screenWidth = window.innerWidth;
      if (clientX < screenWidth / 3) {
        goToPrevStory();
      } else {
        goToNextStory();
      }
    }
  };

  const handlePointerLeave = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  };

  const handleDeleteStory = () => {
    setIsPaused(true);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentGroup || !currentStory) return;
    
    setIsDeleting(true);

    try {
      if (!currentStory.id.startsWith("local-")) {
        await supabase.from("social_posts").delete().eq("id", currentStory.id);
      }

      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const updatedLocalPosts = localPosts.filter((p: any) => p.id !== currentStory.id);
      localStorage.setItem('fialgo_local_posts', JSON.stringify(updatedLocalPosts));

      toast.success("Story deleted");

      setIsDeleteModalOpen(false);
      setIsDeleting(false);

      if (currentGroup.stories.length <= 1) {
        onClose();
      } else {
        // Find next appropriate index after deletion
        const nextIndex = currentStoryIndex < currentGroup.stories.length - 1 ? currentStoryIndex : currentStoryIndex - 1;
        setCurrentStoryIndex(nextIndex);
        setProgress(0);
        accumulatedTimeRef.current = 0;
        setIsPaused(false);
        startTimeRef.current = Date.now();
      }

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete story");
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const currentGroup = storyGroups[currentGroupIndex];
  if (!currentGroup) return null;
  const currentStory = currentGroup.stories[currentStoryIndex];
  if (!currentStory) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-[99999] flex items-center justify-center sm:p-4 touch-none"
      >
        <div 
          className="absolute inset-0 bg-black" 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />

        <div className="relative z-10 w-full max-w-md mx-auto h-full flex flex-col pointer-events-none rounded-none sm:rounded-[32px] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
          {/* Custom Delete Modal Overlay */}
          <AnimatePresence>
            {isDeleteModalOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm"
              >
                 <motion.div 
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-[300px] overflow-hidden flex flex-col items-center shadow-2xl"
                 >
                    <div className="p-6 pb-5 flex flex-col items-center text-center">
                       <h3 className="text-white font-bold text-[17px] mb-1.5">Delete Story?</h3>
                       <p className="text-zinc-400 text-[13px] leading-tight">Are you sure you want to delete this story? This cannot be undone.</p>
                    </div>
                    <div className="w-full flex flex-col border-t border-zinc-800">
                       <button 
                          onClick={handleConfirmDelete}
                          disabled={isDeleting}
                          className="w-full py-3.5 text-rose-500 font-bold hover:bg-zinc-800 transition-colors border-b border-zinc-800 flex items-center justify-center"
                       >
                          {isDeleting ? <span className="animate-pulse">Deleting...</span> : "Delete"}
                       </button>
                       <button 
                          onClick={() => { 
                             setIsDeleteModalOpen(false); 
                             setIsPaused(false); 
                             startTimeRef.current = Date.now(); 
                          }}
                          disabled={isDeleting}
                          className="w-full py-3.5 text-white font-medium hover:bg-zinc-800 transition-colors"
                       >
                          Cancel
                       </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-2 flex gap-1 z-30">
            {currentGroup.stories.map((story, idx) => {
              let barProgress = 0;
              if (idx < currentStoryIndex) barProgress = 100;
              else if (idx === currentStoryIndex) barProgress = progress;
              
              return (
                <div key={story.id} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-white"
                    style={{ width: `${barProgress}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex items-center justify-between z-20 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-white/20">
                <img src={currentGroup.user.avatar} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold text-white shadow-sm drop-shadow-md">{currentGroup.user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {currentGroup.userId === currentUserId && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStory();
                  }} 
                  className="p-2 bg-black/40 hover:bg-rose-500 rounded-full transition-colors backdrop-blur-md"
                >
                  <Trash2 size={18} className="text-white" />
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }} 
                className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-md"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 w-full relative bg-zinc-950">
            {currentStory.mediaType === "video" ? (
              processedVideoUrl ? (
                <video 
                  src={processedVideoUrl} 
                  className="w-full h-full object-cover object-center"
                  autoPlay 
                  muted={false}
                  playsInline
                  loop
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )
            ) : currentStory.mediaType === "text" ? (
              <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center shadow-inner ${currentStory.mediaUrl || "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                <p className="text-white text-3xl font-bold whitespace-pre-wrap drop-shadow-md leading-relaxed">{currentStory.content}</p>
              </div>
            ) : (
              <img 
                src={currentStory.mediaUrl} 
                alt="Story" 
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>

          {/* User's Own Story Bottom Action */}
          {currentGroup.userId === currentUserId && (
            <>
              {/* Bottom "Seen by" Button */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewersListOpen(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <ChevronUp size={20} className="text-white/70 group-hover:text-white transition-colors animate-bounce" />
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {mockViewers.map((viewer, i) => (
                        <img 
                          key={i} 
                          src={viewer.avatar_url || "/default-avatar.svg"} 
                          className="w-6 h-6 rounded-full border border-zinc-900 object-cover" 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md">
                      Seen by {mockViewers.length}
                    </span>
                  </div>
                </button>
              </div>

              {/* Viewers List Slide-up Panel */}
              <AnimatePresence>
                {isViewersListOpen && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 right-0 h-[60%] bg-white dark:bg-[#121214] z-50 rounded-t-[32px] flex flex-col pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                      <div className="flex items-center gap-2">
                        <Eye size={18} className="text-slate-900 dark:text-white" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Viewers</h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {mockViewers.length}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setIsViewersListOpen(false);
                          startTimeRef.current = Date.now(); // Reset start time so it resumes properly
                        }}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X size={18} className="text-slate-500" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 amazing-scrollbar">
                      {mockViewers.map((viewer, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <img 
                              src={viewer.avatar_url || "/default-avatar.svg"} 
                              alt={viewer.full_name} 
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                            />
                            <div>
                              <p className="font-bold text-[13px] text-slate-900 dark:text-white leading-tight">
                                {viewer.full_name || viewer.username}
                              </p>
                              <p className="text-[11px] text-slate-500">@{viewer.username || `user_${i}`}</p>
                            </div>
                          </div>
                          <FollowButton
                            isFollowing={false}
                            onToggleFollow={() => {}}
                          />
                        </div>
                      ))}
                      {mockViewers.length === 0 && (
                        <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
                          <Eye size={32} className="mb-2 opacity-50" />
                          <p className="text-sm font-medium">No views yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
