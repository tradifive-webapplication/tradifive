import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  X,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Check,
  Trash2,
} from "lucide-react";
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
  deadlineHint: string;
}> = [
  {
    id: "lifetime",
    shortLabel: "Life",
    sectionLabel: "LIFETIME · YOUR WHY",
    placeholder: "Trade for a living",
    deadlineHint: "Optional. Any day you choose.",
  },
  {
    id: "year",
    shortLabel: "Year",
    sectionLabel: "THIS YEAR",
    placeholder: "Get my first payout",
    deadlineHint: "Optional. Empty means 31 December.",
  },
  {
    id: "month",
    shortLabel: "Month",
    sectionLabel: "THIS MONTH",
    placeholder: "Pass my evaluation",
    deadlineHint: "Optional. Empty means the end of the month.",
  },
  {
    id: "week",
    shortLabel: "Week",
    sectionLabel: "THIS WEEK",
    placeholder: "Follow my plan on every trade",
    deadlineHint: "Optional. Empty means Sunday.",
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

function getEffectiveDeadline(horizon: HorizonId, explicit: string): Date | null {
  if (explicit) {
    const d = new Date(`${explicit}T23:59:59`);
    return isNaN(d.getTime()) ? null : d;
  }
  const now = new Date();
  if (horizon === "year") return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  if (horizon === "month") return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  if (horizon === "week") {
    const day = now.getDay();
    const daysToSunday = day === 0 ? 0 : 7 - day;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSunday, 23, 59, 59);
  }
  return null;
}

function formatDeadlineChip(horizon: HorizonId, explicit: string): string | null {
  const target = getEffectiveDeadline(horizon, explicit);
  if (!target) return null;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const dateStr = target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days < 0) return `Ended ${dateStr}`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days}d left · ${dateStr}`;
}

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1100;
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
        resolve(canvas.toDataURL("image/jpeg", 0.78));
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
  const [activeHorizon, setActiveHorizon] = useState<HorizonId>("week");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasAnyGoal = useMemo(() => {
    return (
      !!goals.pictureDataUrl ||
      CARD_TABS.some(
        (h) =>
          goals[h].title.trim().length > 0 ||
          goals[h].steps.some((s) => s.trim().length > 0)
      )
    );
  }, [goals]);

  // Pick first populated horizon on mount or after save
  useEffect(() => {
    if (!hasAnyGoal) return;
    const currentFilled =
      goals[activeHorizon].title.trim().length > 0 ||
      goals[activeHorizon].steps.some((s) => s.trim().length > 0);
    if (!currentFilled) {
      const firstPopulated = CARD_TABS.find(
        (h) =>
          goals[h].title.trim().length > 0 ||
          goals[h].steps.some((s) => s.trim().length > 0)
      );
      if (firstPopulated) setActiveHorizon(firstPopulated);
    }
  }, [goals, hasAnyGoal, activeHorizon]);

  const openEditor = () => {
    setDraft(JSON.parse(JSON.stringify(goals)));
    setModalOpen(true);
  };

  const persistGoals = (next: UserGoalsState) => {
    setGoals(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      toast.error("Image too large to save locally — try a smaller picture.");
    }
  };

  const handleSave = () => {
    const next: UserGoalsState = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    persistGoals(next);
    setModalOpen(false);
    toast.success("Your goals have been saved");
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
  const deadlineLabel = formatDeadlineChip(activeHorizon, currentGoal.deadline);
  const hasBgImage = hasAnyGoal && !!goals.pictureDataUrl;

  return (
    <>
      {/* ── Dashboard Goals Card ─────────────────────────────────────────── */}
      <section
        className={`relative overflow-hidden rounded-[16px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-200/80 dark:border-white/[0.07] ${
          hasBgImage ? "text-white" : "bg-white dark:bg-[#17171A]"
        }`}
      >
        {/* Optional Private "Your Why" Background Image */}
        {hasBgImage && (
          <>
            <img
              src={goals.pictureDataUrl!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/45 backdrop-blur-[1.5px]" />
          </>
        )}

        <div className="relative z-10">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[13px] font-semibold tracking-tight ${
                hasBgImage
                  ? "text-white/85"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              Goals
            </span>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={openEditor}
              className={
                hasBgImage
                  ? "px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-[11.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  : "tactile-white-pill rounded-full px-3 py-1 text-[11.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              }
            >
              <Pencil size={11.5} strokeWidth={2.2} />
              <span>Edit</span>
            </motion.button>
          </div>

          {!hasAnyGoal ? (
            /* Empty State — Crisp & Compact */
            <div className="mt-3">
              <h3 className="text-[19px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                What are you trading for?
              </h3>
              <p className="text-[12.5px] text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed max-w-[440px]">
                Set a goal for this week, this month, this year and your life, the steps
                that get you there, and a picture of your why.
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={openEditor}
                className="mt-3.5 tactile-white-pill rounded-full px-4 py-1.5 text-[12.5px] font-semibold cursor-pointer"
              >
                Set your goals
              </motion.button>
            </div>
          ) : (
            /* Active Goals View */
            <div className="mt-3 space-y-3">
              {/* Horizon Tabs */}
              <div
                className={`inline-flex items-center p-0.5 rounded-[10px] ${
                  hasBgImage
                    ? "bg-white/15 backdrop-blur-md"
                    : "bg-slate-100/90 dark:bg-white/[0.06]"
                }`}
              >
                {CARD_TABS.map((hid) => {
                  const cfg = HORIZON_CONFIG.find((c) => c.id === hid)!;
                  const active = activeHorizon === hid;
                  const hasData =
                    goals[hid].title.trim().length > 0 ||
                    goals[hid].steps.some((s) => s.trim().length > 0);
                  return (
                    <button
                      key={hid}
                      type="button"
                      onClick={() => setActiveHorizon(hid)}
                      className={`relative px-2.5 py-1 rounded-[8px] text-[11.5px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        active
                          ? hasBgImage
                            ? "text-slate-900"
                            : "text-slate-900 dark:text-white"
                          : hasBgImage
                          ? "text-white/75 hover:text-white"
                          : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="goals-horizon-pill"
                          transition={{ type: "spring", stiffness: 460, damping: 34 }}
                          className="absolute inset-0 bg-white dark:bg-[#26262B] rounded-[8px] shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
                        />
                      )}
                      <span className="relative z-10">{cfg.shortLabel}</span>
                      {hasData && !active && (
                        <span
                          className={`relative z-10 w-1 h-1 rounded-full ${
                            hasBgImage ? "bg-white/70" : "bg-blue-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Horizon Body */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHorizon}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3
                      className={`text-[17px] sm:text-[18px] font-bold tracking-tight leading-snug ${
                        hasBgImage
                          ? "text-white"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {currentGoal.title.trim() || (
                        <span className={hasBgImage ? "text-white/60 font-medium text-[14px]" : "text-slate-400 font-medium text-[14px]"}>
                          No goal set for this timeframe yet
                        </span>
                      )}
                    </h3>

                    {deadlineLabel && currentGoal.title.trim() && (
                      <span
                        className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          hasBgImage
                            ? "bg-white/15 text-white/90 border border-white/20"
                            : "bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-neutral-300"
                        }`}
                      >
                        {deadlineLabel}
                      </span>
                    )}
                  </div>

                  {/* Interactive Steps Checklist */}
                  {filledSteps.length > 0 && (
                    <div className="space-y-1.5 pt-0.5">
                      {filledSteps.map((step) => (
                        <button
                          key={step.idx}
                          type="button"
                          onClick={() => handleToggleStep(activeHorizon, step.idx)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-[12.5px] transition-all cursor-pointer ${
                            hasBgImage
                              ? "bg-white/10 hover:bg-white/15 text-white"
                              : "bg-slate-50/90 hover:bg-slate-100/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] text-slate-700 dark:text-neutral-200"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              step.done
                                ? "bg-emerald-500 text-white"
                                : hasBgImage
                                ? "border border-white/45"
                                : "border border-slate-300 dark:border-neutral-600"
                            }`}
                          >
                            {step.done && <Check size={10} strokeWidth={3} />}
                          </span>
                          <span
                            className={`font-medium leading-snug ${
                              step.done ? "line-through opacity-60" : ""
                            }`}
                          >
                            {step.text}
                          </span>
                        </button>
                      ))}

                      {/* Mini Progress Bar */}
                      <div className="flex items-center gap-2 pt-1">
                        <div
                          className={`flex-1 h-1 rounded-full overflow-hidden ${
                            hasBgImage ? "bg-white/20" : "bg-slate-100 dark:bg-white/10"
                          }`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(completedCount / filledSteps.length) * 100}%`,
                            }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                        <span
                          className={`text-[10.5px] font-semibold tabular-nums ${
                            hasBgImage ? "text-white/75" : "text-slate-400"
                          }`}
                        >
                          {completedCount}/{filledSteps.length}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* ── "Your goals" Modal / Bottom Sheet ────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className="relative z-10 w-full sm:max-w-[490px] bg-white dark:bg-[#17171A] rounded-t-[26px] sm:rounded-[26px] border border-slate-200/80 dark:border-white/10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Mobile Drag Handle */}
              <div className="pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/15" />
              </div>

              {/* Sticky Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Your goals
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Close goals editor"
                >
                  <X size={15} strokeWidth={2.2} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar px-5 py-4 space-y-6">
                {/* 1. PICTURE Section */}
                <div>
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-neutral-400">
                    PICTURE
                  </p>
                  <p className="text-[12.5px] text-slate-500 dark:text-neutral-400 mt-1">
                    Your why: the car, the house, the place. It sits behind your goals. Only you see it.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />

                  {draft.pictureDataUrl ? (
                    <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 h-28 group">
                      <img
                        src={draft.pictureDataUrl}
                        alt="Your why preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-full bg-white/95 text-slate-900 text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <ImageIcon size={13} />
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({ ...prev, pictureDataUrl: null }))
                          }
                          className="px-3 py-1.5 rounded-full bg-rose-500/90 text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-[13px] font-semibold text-slate-800 dark:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ImageIcon size={14} strokeWidth={2} />
                      <span>Add a picture</span>
                    </button>
                  )}
                </div>

                {/* 2. Four Goal Horizons: Lifetime, Year, Month, Week */}
                {HORIZON_CONFIG.map((cfg) => {
                  const item = draft[cfg.id];
                  return (
                    <div key={cfg.id} className="space-y-3">
                      <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-neutral-400">
                        {cfg.sectionLabel}
                      </label>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateDraftField(cfg.id, "title", e.target.value)
                        }
                        placeholder={cfg.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-[13px] bg-slate-100/90 dark:bg-white/[0.06] border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#1E1E22] text-[13.5px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none transition-all"
                      />

                      {/* Deadline */}
                      <div>
                        <p className="text-[11.5px] font-medium text-slate-500 dark:text-neutral-400 mb-1.5">
                          Deadline
                        </p>
                        <div className="flex items-center flex-wrap gap-2.5">
                          <label className="relative inline-flex items-center justify-between gap-3 px-3.5 py-2 rounded-[12px] bg-white dark:bg-[#222226] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_8px_rgba(15,23,42,0.05)] text-[12.5px] font-medium cursor-pointer min-w-[170px] hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                            <span
                              className={
                                item.deadline
                                  ? "text-slate-900 dark:text-white font-semibold"
                                  : "text-slate-400 dark:text-neutral-500"
                              }
                            >
                              {item.deadline
                                ? new Date(`${item.deadline}T00:00:00`).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric", year: "numeric" }
                                  )
                                : "No deadline"}
                            </span>
                            <CalendarIcon
                              size={14}
                              className="text-slate-400 dark:text-neutral-500 shrink-0"
                            />
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
                              className="text-[11.5px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                          <span className="text-[11.5px] text-slate-400 dark:text-neutral-500">
                            {cfg.deadlineHint}
                          </span>
                        </div>
                      </div>

                      {/* How I get there (Steps 1-3) */}
                      <div className="space-y-2">
                        <p className="text-[11.5px] font-medium text-slate-500 dark:text-neutral-400">
                          How I get there
                        </p>
                        {[0, 1, 2].map((stepIdx) => (
                          <input
                            key={stepIdx}
                            type="text"
                            value={item.steps[stepIdx]}
                            onChange={(e) =>
                              updateDraftStep(cfg.id, stepIdx, e.target.value)
                            }
                            placeholder={`Step ${stepIdx + 1}`}
                            className="w-full px-3.5 py-2.5 rounded-[13px] bg-slate-100/90 dark:bg-white/[0.06] border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#1E1E22] text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none transition-all"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Save Footer */}
              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-white/95 dark:bg-[#17171A]/95 backdrop-blur-md shrink-0">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSave}
                  className="w-full tactile-white-pill rounded-full py-2.5 text-[14px] font-semibold cursor-pointer"
                >
                  Save goals
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardGoalsCard;
