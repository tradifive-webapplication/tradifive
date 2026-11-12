import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SuggestFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  username?: string;
}

export default function SuggestFeatureModal({
  isOpen,
  onClose,
  userId,
  username
}: SuggestFeatureModalProps) {
  const [featureIdea, setFeatureIdea] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [showOnBoard, setShowOnBoard] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureIdea.trim()) {
      toast.error("Please describe your feature idea.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDescription = [
        `FEATURE IDEA:\n${featureIdea.trim()}`,
        problemSolved.trim() ? `\nPROBLEM IT SOLVES:\n${problemSolved.trim()}` : "",
        `\nCommunity Board Visibility: ${showOnBoard ? "Public voting enabled" : "Private to team"}`,
        `Submitted by: @${username || "guest"} (${userId || "anon"})`,
      ].filter(Boolean).join("\n");

      // Save to support_tickets
      const { error } = await supabase.from("support_tickets").insert([
        {
          user_id: userId || null,
          subject: `[Feature Suggestion] ${featureIdea.trim().slice(0, 60)}...`,
          description: fullDescription,
          priority: "normal",
          status: "open",
        },
      ]);

      if (error) throw error;

      toast.success("Feature idea submitted! Thank you for helping build TradiFive.", {
        duration: 4000,
      });

      setFeatureIdea("");
      setProblemSolved("");
      setShowOnBoard(true);
      onClose();
    } catch (err: any) {
      console.error("Feature submission error:", err);
      toast.error(err?.message || "Could not submit idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window matching Picture 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[560px] rounded-[24px] bg-[#0E0E11] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden text-white font-sans z-10"
        >
          {/* Top handle pill */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-5">
            {/* Header */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                GOT AN IDEA? WE'D LOVE TO HEAR IT
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Suggest a Feature
              </h2>
            </div>

            {/* WHAT FEATURE WOULD YOU LIKE? */}
            <div>
              <label className="block text-[10.5px] font-bold tracking-wider text-zinc-400 uppercase mb-2">
                WHAT FEATURE WOULD YOU LIKE?
              </label>
              <textarea
                value={featureIdea}
                onChange={(e) => setFeatureIdea(e.target.value)}
                placeholder="Describe your idea: the more detail, the better..."
                rows={4}
                className="w-full rounded-xl bg-[#16161A] border border-white/10 p-3.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/80 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* WHAT PROBLEM WOULD IT SOLVE? (optional) */}
            <div>
              <label className="block text-[10.5px] font-bold tracking-wider text-zinc-400 uppercase mb-2">
                WHAT PROBLEM WOULD IT SOLVE? <span className="text-zinc-500 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                value={problemSolved}
                onChange={(e) => setProblemSolved(e.target.value)}
                placeholder="e.g. I always have to manually calculate X and it slows me down..."
                rows={3}
                className="w-full rounded-xl bg-[#16161A] border border-white/10 p-3.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/80 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Checkbox: Show on Ideas board */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="showOnBoardCheck"
                checked={showOnBoard}
                onChange={(e) => setShowOnBoard(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-[#16161A] border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="showOnBoardCheck" className="text-xs text-zinc-300 cursor-pointer select-none">
                <span className="font-bold text-white block">Show it on the Ideas board so others can vote</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 leading-normal">
                  Under your @{username || "username"}, in Community.
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !featureIdea.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send Idea"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
