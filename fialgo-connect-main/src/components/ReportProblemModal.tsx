import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Trash2, CheckCircle2 } from "lucide-react";
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
      const screenshotLinks = screenshots.map((s) => s.url).join("\n");
      const fullDescription = [
        whatHappened.trim(),
        screenshots.length > 0 ? `\n\n--- SCREENSHOTS ---\n${screenshotLinks}` : "",
        `\nVisibility: ${onlyTeamSeesThis ? "Private (Only TradiFive team)" : "Public (Ideas & Bugs board)"}`,
        `Submitted by: @${username || "guest"} (${userId || "anon"})`,
      ].filter(Boolean).join("\n");

      // Save to support_tickets in Supabase
      const { error } = await supabase.from("support_tickets").insert([
        {
          user_id: userId || null,
          subject: `[Bug Report] ${whatHappened.trim().slice(0, 60)}...`,
          description: fullDescription,
          priority: "high",
          status: "open",
        },
      ]);

      if (error) throw error;

      toast.success("Report submitted! Our engineering team will review it immediately.", {
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

        {/* Modal Window matching Picture 1 */}
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
                TELL US WHAT WENT WRONG: SCREENSHOTS HELP A LOT
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Report a Problem
              </h2>
            </div>

            {/* WHAT HAPPENED? */}
            <div>
              <label className="block text-[10.5px] font-bold tracking-wider text-zinc-400 uppercase mb-2">
                WHAT HAPPENED?
              </label>
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="Describe the problem: what you were doing, what you expected, what actually happened..."
                rows={4}
                className="w-full rounded-xl bg-[#16161A] border border-white/10 p-3.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/80 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* SCREENSHOTS */}
            <div>
              <label className="block text-[10.5px] font-bold tracking-wider text-zinc-400 uppercase mb-2">
                SCREENSHOTS (optional · up to 4)
              </label>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border border-dashed border-white/15 bg-[#141418] hover:bg-[#18181E] hover:border-white/25 py-6 flex flex-col items-center justify-center cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 mb-2">
                  <ImageIcon size={20} />
                </div>
                <p className="text-xs text-white font-medium">
                  Drag & drop or <span className="font-bold underline">click to attach</span>
                </p>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">
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
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/15 shrink-0 group">
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
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="onlyTeamCheck"
                checked={onlyTeamSeesThis}
                onChange={(e) => setOnlyTeamSeesThis(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-[#16161A] border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="onlyTeamCheck" className="text-xs text-zinc-300 cursor-pointer select-none">
                <span className="font-bold text-white block">Only TradiFive sees this</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 leading-normal">
                  Otherwise it shows on the Ideas & bugs board under your @{username || "username"}, so others can say Me too. Screenshots stay private.
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
                disabled={isSubmitting || isUploading || !whatHappened.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send Report"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
