import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Send,
  AlertCircle,
  MessageSquare,
  CreditCard,
  Bug,
  UploadCloud,
  X,
  FileImage,
  FileVideo,
  Check,
  Loader2,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const SETTINGS_CARD =
  "rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6";

const CATEGORY_OPTIONS = [
  {
    id: "bug",
    label: "Technical Bug",
    desc: "Crash, sync issue, or broken UI",
    icon: Bug,
    priority: "high",
  },
  {
    id: "billing",
    label: "Billing Issue",
    desc: "Plan, coupon, or invoice help",
    icon: CreditCard,
    priority: "high",
  },
  {
    id: "features",
    label: "Feature Request",
    desc: "New tool or workflow idea",
    icon: AlertCircle,
    priority: "medium",
  },
  {
    id: "feedback",
    label: "General Feedback",
    desc: "Thoughts on speed or design",
    icon: MessageSquare,
    priority: "low",
  },
] as const;

export default function ReportTab() {
  const [reportCategory, setReportCategory] = useState<string>("bug");
  const [reportPriority, setReportPriority] = useState<"low" | "medium" | "high">("medium");
  const [reportSubject, setReportSubject] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    let channel: any = null;

    const loadRecentReports = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("support_tickets")
          .select("id, subject, status, priority, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (active && data) setRecentReports(data);

        channel = supabase
          .channel(`report-tab-tickets-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "support_tickets",
              filter: `user_id=eq.${user.id}`,
            },
            async () => {
              const { data: refreshed } = await supabase
                .from("support_tickets")
                .select("id, subject, status, priority, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5);
              if (active && refreshed) setRecentReports(refreshed);
            }
          )
          .subscribe();
      } catch {
        // Non-fatal recent ticket fetch
      }
    };

    loadRecentReports();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    if (attachments.length + incoming.length > 3) {
      toast.error("You can attach up to 3 files per report.");
      return;
    }
    const valid = incoming.filter((f) => {
      if (f.size > 50 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 50MB file limit.`);
        return false;
      }
      return true;
    });
    if (valid.length > 0) {
      setAttachments((prev) => [...prev, ...valid]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setReportCategory("bug");
    setReportPriority("medium");
    setReportSubject("");
    setReportDescription("");
    setAttachments([]);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSubject.trim() || !reportDescription.trim()) {
      toast.error("Please fill in both subject and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit a report.");
        return;
      }

      const uploadedUrls: string[] = [];
      if (attachments.length > 0) {
        toast.loading(`Uploading ${attachments.length} attachment(s)...`, {
          id: "upload",
        });

        for (const file of attachments) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from("support-attachments")
            .upload(filePath, file);

          if (!uploadError && data) {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("support-attachments")
              .getPublicUrl(filePath);
            uploadedUrls.push(publicUrl);
          } else if (file.size < 500000 && file.type.startsWith("image/")) {
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
            uploadedUrls.push(base64);
          }
        }
        toast.dismiss("upload");
      }

      const selectedMeta =
        CATEGORY_OPTIONS.find((c) => c.id === reportCategory) ||
        CATEGORY_OPTIONS[0];
      let finalDescription = `[Category: ${selectedMeta.label}]\n\n${reportDescription.trim()}`;
      if (uploadedUrls.length > 0) {
        finalDescription += "\n\n--- ATTACHMENTS ---\n";
        uploadedUrls.forEach((url) => {
          if (
            url.startsWith("data:image") ||
            url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
          ) {
            finalDescription += `\n[IMAGE_ATTACHMENT:${url}]`;
          } else {
            finalDescription += `\n[VIDEO_ATTACHMENT:${url}]`;
          }
        });
      }

      const { data: created, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: reportSubject.trim(),
          description: finalDescription,
          status: "open",
          priority: reportPriority,
        })
        .select("id, subject, status, priority, created_at")
        .single();

      if (error) {
        toast.error("Failed to submit ticket: " + error.message);
        return;
      }

      if (created) {
        setRecentReports((prev) => [created, ...prev].slice(0, 5));
      }

      toast.success("Problem report submitted!", {
        description: "Our engineering & support team has received your ticket.",
      });
      handleReset();
    } catch {
      toast.dismiss("upload");
      toast.error("An unexpected error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5 pb-10 font-sans">
      {/* Card 1: Report Form */}
      <div className={SETTINGS_CARD}>
        <form onSubmit={handleReportSubmit} className="space-y-5">
          {/* Category Selection Cards */}
          <div className="space-y-2.5">
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block px-0.5">
              Issue Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = reportCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setReportCategory(cat.id);
                      setReportPriority(cat.priority);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? "border-slate-900 dark:border-white bg-slate-50/80 dark:bg-white/[0.05] shadow-[0_1px_6px_rgba(15,23,42,0.06)]"
                        : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight">
                        {cat.label}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-snug">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 dark:bg-white/[0.06]" />

          {/* Impact / Priority Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">
                Urgency Level
              </h3>
              <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Choose High if this blocks live trading, broker sync, or billing.
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-white/[0.05] p-1 rounded-full inline-flex items-center gap-1 border border-slate-200/80 dark:border-white/10 self-start sm:self-center">
              {(["low", "medium", "high"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setReportPriority(lvl)}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-semibold capitalize transition-all cursor-pointer ${
                    reportPriority === lvl
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 dark:bg-white/[0.06]" />

          {/* Subject & Description */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block px-0.5">
                Subject Summary *
              </label>
              <input
                type="text"
                placeholder="Brief title of the problem"
                value={reportSubject}
                onChange={(e) => setReportSubject(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white dark:focus:bg-[#1E1E24] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                  Description Details *
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  Include steps to reproduce
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Describe what happened, what you expected, and any broker or page details..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white dark:focus:bg-[#1E1E24] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Media Attachments Dropzone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                  Attachments (Optional)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  PNG, JPG, or MP4 · Up to 3 files
                </span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  addFiles(Array.from(e.dataTransfer.files || []));
                }}
                className={`w-full border border-dashed transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isDragging
                    ? "border-slate-900 dark:border-white bg-slate-100/80 dark:bg-white/[0.06]"
                    : "border-slate-300 dark:border-white/15 bg-slate-50/70 dark:bg-white/[0.02] hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-neutral-300 flex items-center justify-center">
                  <UploadCloud size={18} />
                </div>
                <div className="text-center">
                  <p className="text-[12.5px] font-semibold text-slate-800 dark:text-white">
                    Click or drop screenshots and screen recordings
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                    Max 50MB per file
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1.5">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-3 flex items-center gap-2.5"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/[0.07] flex items-center justify-center text-slate-600 dark:text-neutral-300 shrink-0">
                        {file.type.startsWith("video") ? (
                          <FileVideo size={17} />
                        ) : (
                          <FileImage size={17} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-[10.5px] text-slate-400 tabular-nums">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(idx);
                        }}
                        className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 hover:bg-rose-200 transition-colors cursor-pointer"
                        aria-label="Remove attachment"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
            {(reportSubject || reportDescription || attachments.length > 0) && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReset}
                className="tactile-white-pill h-9 px-4 rounded-full text-[12px] font-semibold text-slate-700 dark:text-neutral-200 cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !reportSubject.trim() || !reportDescription.trim()}
              className="h-9 px-5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-slate-900 font-semibold text-[12.5px] shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={13.5} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Recent Reports Status */}
      <div className={`${SETTINGS_CARD} space-y-3`}>
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-slate-500 dark:text-neutral-400" />
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Submissions
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-neutral-300 text-[11px] font-bold tabular-nums">
            {recentReports.length}
          </span>
        </div>

        {recentReports.length === 0 ? (
          <p className="text-[12px] text-slate-400 dark:text-neutral-500 py-2">
            No submitted reports yet. Submitted tickets appear here with live status updates.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {recentReports.map((item) => {
              const statusStr = String(item.status || "open");
              return (
                <div
                  key={item.id}
                  className="py-2.5 first:pt-1 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                      {item.subject}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5 font-mono">
                      #{String(item.id || "").split("-")[0].toUpperCase()} ·{" "}
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      statusStr === "resolved"
                        ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : statusStr === "in-progress" || statusStr === "in_progress"
                        ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300"
                    }`}
                  >
                    {statusStr.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
