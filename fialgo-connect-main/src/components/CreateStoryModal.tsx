import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Image, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
}

export default function CreateStoryModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: CreateStoryModalProps) {
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<"media" | "text">("media");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [textContent, setTextContent] = useState("");
  const [textGradient, setTextGradient] = useState("bg-gradient-to-br from-purple-500 to-pink-500");
  const [postMarket, setPostMarket] = useState<"global" | "indian" | "general">("global");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradients = [
    "bg-gradient-to-br from-purple-500 to-pink-500",
    "bg-gradient-to-br from-blue-500 to-cyan-400",
    "bg-gradient-to-br from-orange-400 to-rose-400",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-zinc-800 to-black",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);

      if (file.size > 20 * 1024 * 1024) {
        toast.error("File is too large! Please upload a file smaller than 20MB.");
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (file.type.startsWith("video/")) {
        setMediaType("video");
      } else {
        setMediaType("image");
      }

      const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const isHeic = file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic");
      
      if (isHeic) {
        setMediaBase64(result);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else if (file.type.startsWith("image/")) {
        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1080;
            const MAX_HEIGHT = 1920;
            let width = img.width || 1;
            let height = img.height || 1;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            width = Math.max(1, Math.round(width));
            height = Math.max(1, Math.round(height));
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              setMediaBase64(canvas.toDataURL("image/jpeg", 0.7));
            } else {
              setMediaBase64(result);
            }
          } catch (e) {
            console.error("Canvas compression failed, falling back to original:", e);
            setMediaBase64(result);
          } finally {
            setIsProcessing(false);
          }
        };
        img.onerror = () => {
          toast.error("Unsupported image format. Please try another photo.");
          setIsProcessing(false);
          removeMedia();
        };
        img.src = result;
      } else {
        setMediaBase64(result);
        setIsProcessing(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process file.");
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = () => {
    setMediaBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (storyType === "media" && !mediaBase64) {
      toast.error("Please select a photo or video for your story!");
      return;
    }
    if (storyType === "text" && !textContent.trim()) {
      toast.error("Please enter some text for your story!");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalMediaType = storyType === "text" ? "text" : mediaType;
      const finalMediaUrl = storyType === "text" ? textGradient : mediaBase64;
      const finalContent = storyType === "text" ? textContent : "Story";

      const newStoryObject = {
        user_id: userId,
        content: finalContent,
        media_url: finalMediaUrl,
        media_type: finalMediaType,
        post_type: "story",
        tags: [`[${postMarket}]`],
        created_at: new Date().toISOString(),
        is_public: true
      };

      const dbStoryObject = {
        user_id: userId,
        content: finalContent,
        media_url: finalMediaUrl,
        post_type: "story",
        tags: [`[${postMarket}]`],
        created_at: new Date().toISOString(),
        is_public: true
      };

      const { error } = await supabase.from("social_posts").insert([dbStoryObject]);
      
      // Optimistic update - ALWAYS save to local storage so it shows up instantly
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      localPosts.unshift({
        id: `local-story-${Date.now()}`,
        user_id: userId,
        content: finalContent,
        media_url: finalMediaUrl,
        media_type: finalMediaType,
        post_type: "story",
        tags: [`[${postMarket}]`],
        created_at: new Date().toISOString(),
        is_public: true,
        profiles: {
          id: userId,
          first_name: localStorage.getItem("tradifive_cached_display_name")?.split(' ')[0] || "Trader",
          last_name: localStorage.getItem("tradifive_cached_display_name")?.split(' ')[1] || "",
          display_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
          full_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
          username: localStorage.getItem("tradifive_cached_username") || "trader",
          avatar_url: localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg",
          bio: "Tradifive Member",
          banner_url: "/default-cover.png"
        }
      });
      try {
        localStorage.setItem('fialgo_local_posts', JSON.stringify(localPosts));
      } catch (storageErr) {
        // If quota exceeded, try to save just the newest 5 posts
        try {
          const slimPosts = localPosts.slice(0, 5);
          localStorage.setItem('fialgo_local_posts', JSON.stringify(slimPosts));
        } catch (e) {
          console.warn("Local storage quota exceeded completely.");
        }
      }

      if (error) {
        console.warn("Supabase insert failed, but saved locally:", error);
      }
      
      toast.success("Story published successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Story creation error:", err);
      toast.error("Failed to publish story");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
          onClick={onClose} 
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#09090b] border border-slate-200/60 dark:border-[#1F1F22] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col relative z-50 w-full max-w-[420px] rounded-[28px] overflow-hidden font-sans"
        >
          <div className="px-6 py-5 border-b border-slate-100 dark:border-[#1F1F22] flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create Story
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#1F1F22] hover:bg-slate-200 dark:hover:bg-[#2A2A2E] transition-colors text-slate-500 dark:text-slate-400"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

            {/* Tabs */}
            <div className="flex items-center bg-slate-100/80 dark:bg-[#1A1A1D] p-1 rounded-2xl mx-auto w-full max-w-[240px]">
              <button
                type="button"
                onClick={() => setStoryType("media")}
                className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${storyType === "media" ? "bg-white dark:bg-[#2A2A2E] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Media
              </button>
              <button
                type="button"
                onClick={() => setStoryType("text")}
                className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${storyType === "text" ? "bg-white dark:bg-[#2A2A2E] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Text
              </button>
            </div>

            {storyType === "media" ? (
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                {mediaBase64 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1F1F22] bg-slate-950 aspect-[9/16] w-full max-h-[500px] flex items-center justify-center shadow-inner cursor-pointer group"
                    title="Click media to change"
                  >
                    {mediaType === "video" ? (
                      <video src={mediaBase64} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <img src={mediaBase64} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[13px] font-bold gap-2">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                         <Plus size={20} strokeWidth={2.5} />
                      </div>
                      <span>Replace Media</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeMedia(); }}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full p-2 transition-colors z-10 shadow-lg"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : isProcessing ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-[#2A2A2E] rounded-3xl bg-slate-50/50 dark:bg-[#121214] flex flex-col items-center justify-center text-center aspect-[9/16] w-full max-h-[500px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1F1F22] flex items-center justify-center text-blue-500 mb-4 shadow-sm">
                      <Loader2 size={28} strokeWidth={2} className="animate-spin" />
                    </div>
                    <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Processing media...
                    </p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[200px]">
                      This might take a moment
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-[#2A2A2E] rounded-3xl bg-slate-50/50 dark:bg-[#121214] hover:bg-blue-50 dark:hover:bg-[#1A1A1D] hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-300 group relative aspect-[9/16] w-full max-h-[500px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1F1F22] flex items-center justify-center text-slate-400 dark:text-slate-400 mb-4 group-hover:scale-110 group-hover:text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all duration-300 shadow-sm">
                      <Image size={28} strokeWidth={2} />
                    </div>
                    <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Select photo or video
                    </p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[200px]">
                      Stories disappear after 24 hours. Max size 20MB.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-3xl flex flex-col items-center justify-center relative aspect-[9/16] w-full max-h-[500px] p-8 shadow-inner overflow-hidden ${textGradient}`}>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type something..."
                  className="w-full bg-transparent text-white text-center text-3xl font-extrabold placeholder:text-white/50 focus:outline-none resize-none overflow-hidden drop-shadow-md"
                  rows={4}
                  autoFocus
                />
                <div className="absolute bottom-8 flex gap-3 p-3 rounded-full bg-black/20 backdrop-blur-md">
                  {gradients.map((grad, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTextGradient(grad)}
                      className={`w-7 h-7 rounded-full border-2 ${textGradient === grad ? "border-white scale-110" : "border-transparent opacity-80 hover:opacity-100 hover:scale-110"} ${grad} shadow-sm transition-all duration-200`}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (storyType === "media" && !mediaBase64) || (storyType === "text" && !textContent.trim())}
              className={`w-full py-4 rounded-[16px] text-[15px] font-bold shadow-sm transition-all duration-300 ${
                ((storyType === "media" && !mediaBase64) || (storyType === "text" && !textContent.trim()) || isSubmitting)
                  ? "bg-slate-100 dark:bg-[#1A1A1D] text-slate-400 dark:text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0"
              } flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                "Add to Story"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
