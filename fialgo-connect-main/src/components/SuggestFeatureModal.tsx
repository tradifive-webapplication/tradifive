import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
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

  // Toggle backside page scaling & blur when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("tf-sheet-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.classList.remove("tf-sheet-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("tf-sheet-open");
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureIdea.trim()) {
      toast.error("Please describe what feature you'd like.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDescription = [
        `Idea: ${featureIdea.trim()}`,
        problemSolved.trim() ? `\nProblem it solves: ${problemSolved.trim()}` : "",
        `\nPublic Board: ${showOnBoard ? "Yes" : "No (Private feedback)"}`,
        `Submitted by: @${username || "guest"} (${userId || "anon"})`,
      ].filter(Boolean).join("\n");

      // 1. Save to support_tickets in Supabase for Support Desk / Admin App
      const { error: ticketError } = await supabase.from("support_tickets").insert([
        {
          user_id: userId || null,
          subject: `[Feature Suggestion] ${featureIdea.trim().slice(0, 60)}...`,
          description: fullDescription,
          priority: "low",
          status: "open",
        },
      ]);
      if (ticketError) console.error("Ticket error:", ticketError);

      // 2. Also save to user_feedback table so it shows in Admin Feedback Inbox
      const { error: feedbackError } = await supabase.from("user_feedback").insert([
        {
          user_id: userId || null,
          category: "Feature Suggestion",
          description: fullDescription,
          rating: 5,
        },
      ]);
      if (feedbackError) console.error("Feedback error:", feedbackError);

      toast.success("Thank you! Your idea has been sent to our product team.", {
        duration: 4000,
      });

      setFeatureIdea("");
      setProblemSolved("");
      setShowOnBoard(true);
      onClose();
    } catch (err: any) {
      console.error("Suggestion error:", err);
      toast.error(err?.message || "Could not submit suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex flex-col justify-end items-center pointer-events-auto">
        {/* Backdrop (Darkens and triggers blur on backside page) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
        />

        {/* Bottom Sheet Drawer matching Reference Image */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.velocity.y > 400) {
              onClose();
            }
          }}
          className="relative w-full max-w-[960px] rounded-t-[28px] sm:rounded-t-[32px] bg-white dark:bg-[#121214] border-t border-x border-slate-200/90 dark:border-white/10 shadow-[0_-15px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto amazing-scrollbar text-slate-900 dark:text-white font-sans z-10"
        >
          {/* Top handle pill for pulling down */}
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mt-3 mb-1 cursor-grab active:cursor-grabbing hover:bg-slate-400 dark:hover:bg-white/40 transition-colors" />

          {/* Close button (Circular pill) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={2.4} />
          </button>

          <form onSubmit={handleSubmit} className="p-6 sm:p-9 pt-3 sm:pt-4">
            {/* 2-Column Responsive Layout Matching Reference Image */}
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 md:gap-10 items-start">
              {/* Left Column: Heading & Subtitle */}
              <div className="space-y-1">
                <p className="text-[9.5px] sm:text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                  GOT AN IDEA? WE'D LOVE TO HEAR IT
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Suggest a Feature
                </h2>
              </div>

              {/* Right Column: Form Inputs */}
              <div className="space-y-5">
                {/* WHAT FEATURE WOULD YOU LIKE? */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-2">
                    WHAT FEATURE WOULD YOU LIKE?
                  </label>
                  <textarea
                    value={featureIdea}
                    onChange={(e) => setFeatureIdea(e.target.value)}
                    placeholder="Describe your idea: the more detail, the better..."
                    rows={4}
                    className="w-full rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* WHAT PROBLEM WOULD IT SOLVE? */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-2">
                    WHAT PROBLEM WOULD IT SOLVE? <span className="font-normal text-slate-400 dark:text-zinc-500">(optional)</span>
                  </label>
                  <textarea
                    value={problemSolved}
                    onChange={(e) => setProblemSolved(e.target.value)}
                    placeholder="e.g. I always have to manually calculate X and it slows me down..."
                    rows={3}
                    className="w-full rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Checkbox: Show it on the Ideas board so others can vote */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="showOnBoardCheck"
                    checked={showOnBoard}
                    onChange={(e) => setShowOnBoard(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="showOnBoardCheck" className="text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none">
                    <span className="font-bold text-slate-900 dark:text-white block">Show it on the Ideas board so others can vote</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 block mt-0.5 leading-normal">
                      Under your @{username || "username"}, in Community.
                    </span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !featureIdea.trim()}
                    style={{
                      borderRadius: 100,
                      padding: "9px 20px",
                      fontWeight: 700,
                      fontSize: 12.5,
                      letterSpacing: "0.01em",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      color: "#ffffff",
                      border: "none",
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 6px rgba(0, 0, 0, 0.25)",
                      cursor: isSubmitting || !featureIdea.trim() ? "not-allowed" : "pointer",
                      opacity: isSubmitting || !featureIdea.trim() ? 0.45 : 1,
                      transition: "all 0.18s ease",
                    }}
                    className="active:scale-95 hover:brightness-110"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Idea"}</span>
                    <ArrowRight size={13.5} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
