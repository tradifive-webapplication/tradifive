import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Trash2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadSupportAttachment, ChatAttachment } from "@/utils/supportChat";
import { toast } from "sonner";

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  username?: string;
}

export default function ReportProblemModal({
  isOpen,
  onClose,
  userId,
  username
}: ReportProblemModalProps) {
  const [whatHappened, setWhatHappened] = useState("");
  const [onlyTeamSeesThis, setOnlyTeamSeesThis] = useState(false);
  const [screenshots, setScreenshots] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (screenshots.length + files.length > 4) {
      toast.error("You can attach up to 4 screenshots.");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading screenshot...", { id: "report-upload" });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5 MB limit.`, { id: "report-upload" });
        continue;
      }
      try {
        const att = await uploadSupportAttachment(file, userId);
        if (att) {
          setScreenshots((prev) => [...prev, att]);
          toast.success(`Attached ${file.name}`, { id: "report-upload" });
        }
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`, { id: "report-upload" });
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeScreenshot = (idx: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened.trim()) {
      toast.error("Please describe what happened.");
      return;
    }

    setIsSubmitting(true);
    try {
      const attachmentBlock = screenshots.length > 0
        ? "\n\n--- ATTACHMENTS ---\n" + screenshots.map((s) => `[IMAGE_ATTACHMENT:${s.url}]`).join("\n")
        : "";
      const fullDescription = [
        whatHappened.trim(),
        attachmentBlock,
        `\nVisibility: ${onlyTeamSeesThis ? "Private (Only TradiFive team)" : "Public (Ideas & Bugs board)"}`,
        `Submitted by: @${username || "guest"} (${userId || "anon"})`,
      ].filter(Boolean).join("\n");

      // 1. Save to support_tickets in Supabase for Support Desk / Admin App
      const { error: ticketError } = await supabase.from("support_tickets").insert([
        {
          user_id: userId || null,
          subject: `[Bug Report] ${whatHappened.trim().slice(0, 60)}...`,
          description: fullDescription,
          priority: "high",
          status: "open",
        },
      ]);
      if (ticketError) console.error("Ticket error:", ticketError);

      // 2. Also save to user_feedback table so it shows in Admin Feedback Inbox
      const { error: feedbackError } = await supabase.from("user_feedback").insert([
        {
          user_id: userId || null,
          category: "Bug Report",
          description: fullDescription,
          rating: 0,
        },
      ]);
      if (feedbackError) console.error("Feedback error:", feedbackError);

      toast.success("Report submitted! Our team will review it immediately.", {
        duration: 4000,
      });

      setWhatHappened("");
      setScreenshots([]);
      setOnlyTeamSeesThis(false);
      onClose();
    } catch (err: any) {
      console.error("Report error:", err);
      toast.error(err?.message || "Could not submit report. Please try again.");
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
                  TELL US WHAT WENT WRONG: SCREENSHOTS HELP A LOT
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Report a Problem
                </h2>
              </div>

              {/* Right Column: Form Inputs */}
              <div className="space-y-5">
                {/* WHAT HAPPENED? */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-2">
                    WHAT HAPPENED?
                  </label>
                  <textarea
                    value={whatHappened}
                    onChange={(e) => setWhatHappened(e.target.value)}
                    placeholder="Describe the problem: what you were doing, what you expected, what actually happened..."
                    rows={4}
                    className="w-full rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* SCREENSHOTS */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-2">
                    SCREENSHOTS <span className="font-normal text-slate-400 dark:text-zinc-500">(optional · up to 4)</span>
                  </label>

                  {/* Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] py-5 px-4 flex flex-col items-center justify-center cursor-pointer transition-all"
                  >
                    <div className="text-slate-400 dark:text-zinc-500 mb-1.5">
                      <ImageIcon size={20} strokeWidth={1.8} />
                    </div>
                    <p className="text-xs text-slate-700 dark:text-zinc-200 font-medium">
                      Drag & drop or <span className="font-bold underline text-slate-900 dark:text-white">click to attach</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      PNG, JPG, GIF · max 5 MB each
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Thumbnail List */}
                  {screenshots.length > 0 && (
                    <div className="flex gap-2.5 mt-2.5 overflow-x-auto pb-1">
                      {screenshots.map((s, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-white/15 shrink-0 group">
                          <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeScreenshot(idx); }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkbox: Only TradiFive sees this */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="onlyTeamCheck"
                    checked={onlyTeamSeesThis}
                    onChange={(e) => setOnlyTeamSeesThis(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="onlyTeamCheck" className="text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none">
                    <span className="font-bold text-slate-900 dark:text-white block">Only TRADIFIVE sees this</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 block mt-0.5 leading-normal">
                      Otherwise it shows on the Ideas & bugs board under your @{username || "username"}, so others can say Me too. Screenshots stay private.
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
                    disabled={isSubmitting || isUploading || !whatHappened.trim()}
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
                      cursor: isSubmitting || isUploading || !whatHappened.trim() ? "not-allowed" : "pointer",
                      opacity: isSubmitting || isUploading || !whatHappened.trim() ? 0.45 : 1,
                      transition: "all 0.18s ease",
                    }}
                    className="active:scale-95 hover:brightness-110"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Report"}</span>
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
