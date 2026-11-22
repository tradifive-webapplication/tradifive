import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Image as ImageIcon, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

type HorizonId = "week" | "month" | "year" | "lifetime";

interface HorizonGoal {
  title: string;
  deadline: string; // YYYY-MM-DD or ""
  steps: [string, string, string];
  completedSteps: [boolean, boolean, boolean];
}

interface UserGoalsState {
  pictureDataUrl: string | null;
  lifetime: HorizonGoal;
  year: HorizonGoal;
  month: HorizonGoal;
  week: HorizonGoal;
  updatedAt?: string;
}

const STORAGE_KEY = "tf_user_trading_goals_v1";

const EMPTY_HORIZON = (): HorizonGoal => ({
  title: "",
  deadline: "",
  steps: ["", "", ""],
  completedSteps: [false, false, false],
});

const DEFAULT_STATE: UserGoalsState = {
  pictureDataUrl: null,
  lifetime: EMPTY_HORIZON(),
  year: EMPTY_HORIZON(),
  month: EMPTY_HORIZON(),
  week: EMPTY_HORIZON(),
};

const HORIZON_CONFIG: Array<{
  id: HorizonId;
  shortLabel: string;
  sectionLabel: string;
  placeholder: string;
}> = [
  {
    id: "week",
    shortLabel: "Week",
    sectionLabel: "This week",
    placeholder: "e.g. Follow my plan on every trade",
  },
  {
    id: "month",
    shortLabel: "Month",
    sectionLabel: "This month",
    placeholder: "e.g. Pass my evaluation",
  },
  {
    id: "year",
    shortLabel: "Year",
    sectionLabel: "This year",
    placeholder: "e.g. Secure my first payout",
  },
  {
    id: "lifetime",
    shortLabel: "Life",
    sectionLabel: "Lifetime goal",
    placeholder: "e.g. Full-time trading",
  },
];

const CARD_TABS: HorizonId[] = ["week", "month", "year", "lifetime"];

function loadGoals(): UserGoalsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      pictureDataUrl: parsed.pictureDataUrl || null,
      lifetime: { ...EMPTY_HORIZON(), ...(parsed.lifetime || {}) },
      year: { ...EMPTY_HORIZON(), ...(parsed.year || {}) },
      month: { ...EMPTY_HORIZON(), ...(parsed.month || {}) },
      week: { ...EMPTY_HORIZON(), ...(parsed.week || {}) },
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const DashboardGoalsCard: React.FC = () => {
  const [goals, setGoals] = useState<UserGoalsState>(() => loadGoals());
  const [draft, setDraft] = useState<UserGoalsState>(() => loadGoals());
  const [modalOpen, setModalOpen] = useState(false);
  const [activeHorizon, setActiveHorizon] = useState<HorizonId>("lifetime");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasAnyGoal = useMemo(() => {
    return (
      !!goals.pictureDataUrl ||
      CARD_TABS.some((h) => {
        return (
          goals[h].title.trim().length > 0 ||
          goals[h].steps.some((s) => s.trim().length > 0)
        );
      })
    );
  }, [goals]);

  // Lock body scroll when modal opens
  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add("tf-sheet-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setModalOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.classList.remove("tf-sheet-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("tf-sheet-open");
    }
  }, [modalOpen]);

  const openEditor = () => {
    setDraft(JSON.parse(JSON.stringify(goals)));
    setModalOpen(true);
  };

  const persistGoals = (next: UserGoalsState) => {
    setGoals(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      toast.error("Could not save goals locally.");
    }
  };

  const handleSave = () => {
    const next: UserGoalsState = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    persistGoals(next);
    setModalOpen(false);
    toast.success("Goals updated");
  };

  const handleToggleStep = (horizon: HorizonId, stepIdx: number) => {
    const updated: UserGoalsState = {
      ...goals,
      [horizon]: {
        ...goals[horizon],
        completedSteps: goals[horizon].completedSteps.map((c, idx) =>
          idx === stepIdx ? !c : c
        ) as [boolean, boolean, boolean],
      },
    };
    persistGoals(updated);
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setDraft((prev) => ({ ...prev, pictureDataUrl: dataUrl }));
    } catch {
      toast.error("Could not load image");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateDraftField = (
    horizon: HorizonId,
    field: "title" | "deadline",
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      [horizon]: {
        ...prev[horizon],
        [field]: value,
      },
    }));
  };

  const updateDraftStep = (horizon: HorizonId, idx: number, value: string) => {
    setDraft((prev) => {
      const nextSteps = [...prev[horizon].steps] as [string, string, string];
      nextSteps[idx] = value;
      return {
        ...prev,
        [horizon]: {
          ...prev[horizon],
          steps: nextSteps,
        },
      };
    });
  };

  const currentGoal = goals[activeHorizon];
  const filledSteps = currentGoal.steps
    .map((text, idx) => ({ text: text.trim(), idx, done: currentGoal.completedSteps[idx] }))
    .filter((s) => s.text.length > 0);
  const completedCount = filledSteps.filter((s) => s.done).length;

  // Simple, human deadline text (only if user explicitly provided a date)
  const deadlineText = currentGoal.deadline
    ? new Date(`${currentGoal.deadline}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <>
      {/* ── Human-made, Simple Goals Card ───────────────────────────────── */}
      <section className="rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#17171A] text-slate-900 dark:text-white shadow-sm">
        {/* Header: Just "Goals" and a clean "Edit" link */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Goals
          </h3>
          <button
            type="button"
            onClick={openEditor}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* Quiet, Calm Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] mt-3">
          {CARD_TABS.map((hid) => {
            const cfg = HORIZON_CONFIG.find((c) => c.id === hid)!;
            const active = activeHorizon === hid;
            return (
              <button
                key={hid}
                type="button"
                onClick={() => setActiveHorizon(hid)}
                className={`flex-1 py-1 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  active
                    ? "bg-white dark:bg-[#27272A] text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {cfg.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Goal Body */}
        <div className="mt-3.5 space-y-2.5">
          {/* Goal title & optional date */}
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white capitalize">
              {currentGoal.title.trim() || (
                <span className="text-slate-400 dark:text-neutral-500 font-normal text-sm">
                  No goal set
                </span>
              )}
            </h4>
            {deadlineText && (
              <span className="text-xs text-slate-400 dark:text-neutral-500 shrink-0">
                {deadlineText}
              </span>
            )}
          </div>

          {/* Simple, natural checklist */}
          {filledSteps.length > 0 ? (
            <div className="space-y-1 pt-1">
              {filledSteps.map((step) => (
                <button
                  key={step.idx}
                  type="button"
                  onClick={() => handleToggleStep(activeHorizon, step.idx)}
                  className="w-full flex items-center gap-2.5 py-1.5 px-0.5 text-left group cursor-pointer select-none"
                >
                  <span
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      step.done
                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900"
                        : "border-slate-300 dark:border-neutral-600 group-hover:border-slate-400 dark:group-hover:border-neutral-400 bg-transparent"
                    }`}
                  >
                    {step.done && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span
                    className={`text-[13px] leading-snug transition-colors capitalize ${
                      step.done
                        ? "line-through text-slate-400 dark:text-neutral-500"
                        : "text-slate-700 dark:text-neutral-200"
                    }`}
                  >
                    {step.text}
                  </span>
                </button>
              ))}

              {/* Quiet, simple progress note */}
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-neutral-500 pt-2.5 mt-2 border-t border-slate-100 dark:border-white/5">
                <span>{completedCount} of {filledSteps.length} done</span>
                {completedCount === filledSteps.length && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Done
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2.5 text-center">
              <button
                type="button"
                onClick={openEditor}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              >
                + Add steps
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Simple, Clean Goals Editor Modal ────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-[500px] rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-white font-sans z-10 flex flex-col max-h-[88vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    Edit Goals
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto amazing-scrollbar p-5 space-y-6">
                  {/* Four Horizons Stacked Simply */}
                  {HORIZON_CONFIG.map((cfg) => {
                    const item = draft[cfg.id];
                    return (
                      <div key={cfg.id} className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                        <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 block">
                          {cfg.sectionLabel}
                        </label>

                        {/* Title input */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateDraftField(cfg.id, "title", e.target.value)
                          }
                          placeholder={cfg.placeholder}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                        />

                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs font-medium cursor-pointer text-slate-600 dark:text-neutral-300">
                            <CalendarIcon size={12} className="text-slate-400" />
                            <span>
                              {item.deadline
                                ? new Date(`${item.deadline}T00:00:00`).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric", year: "numeric" }
                                  )
                                : "Add date"}
                            </span>
                            <input
                              type="date"
                              value={item.deadline}
                              onChange={(e) =>
                                updateDraftField(cfg.id, "deadline", e.target.value)
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </label>
                          {item.deadline && (
                            <button
                              type="button"
                              onClick={() => updateDraftField(cfg.id, "deadline", "")}
                              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Steps 1-3 */}
                        <div className="space-y-1.5 pt-1">
                          {[0, 1, 2].map((stepIdx) => (
                            <input
                              key={stepIdx}
                              type="text"
                              value={item.steps[stepIdx]}
                              onChange={(e) =>
                                updateDraftStep(cfg.id, stepIdx, e.target.value)
                              }
                              placeholder={`Step ${stepIdx + 1}`}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[12.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default DashboardGoalsCard;
