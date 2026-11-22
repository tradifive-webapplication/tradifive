import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  X,
  Calendar as CalendarIcon,
  Check,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type HorizonId = "week" | "month" | "year" | "lifetime";

interface HorizonGoal {
  title: string;
  deadline: string; // YYYY-MM-DD or ""
  steps: [string, string, string];
  completedSteps: [boolean, boolean, boolean];
}

interface BannerPreset {
  id: string;
  label: string;
  url: string;
  fallback: string;
}

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "trading_desk",
    label: "Trading Desk",
    url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    fallback: "/Dark_image.jpg",
  },
  {
    id: "skyline",
    label: "City Skyline",
    url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    fallback: "/Dark_image.jpg",
  },
  {
    id: "ocean",
    label: "Ocean Freedom",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    fallback: "/Dark_image.jpg",
  },
  {
    id: "mountain",
    label: "Summit Horizon",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    fallback: "/Dark_image.jpg",
  },
];

interface UserGoalsState {
  bannerPresetId?: string;
  pictureDataUrl?: string | null;
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
  bannerPresetId: "trading_desk",
  pictureDataUrl: null,
  week: {
    title: "Follow my trading plan on every execution",
    deadline: "",
    steps: [
      "Strict 1:2 Risk-to-Reward minimum on all entries",
      "Lock terminal after 2 consecutive losses",
      "Journal and screenshot every setup before EOD",
    ],
    completedSteps: [true, false, false],
  },
  month: {
    title: "Pass prop evaluation & maintain under 3% max drawdown",
    deadline: "",
    steps: [
      "Risk exactly 0.5% - 1% per position",
      "Trade London & NY session overlap only",
      "No revenge or weekend impulse orders",
    ],
    completedSteps: [false, false, false],
  },
  year: {
    title: "Scale to funded capital & first $10,000 in payouts",
    deadline: "",
    steps: [
      "Master my single A+ high-probability edge",
      "Qualify for 2 funded firm accounts",
      "Build a 6-month living expense trading reserve",
    ],
    completedSteps: [false, false, false],
  },
  lifetime: {
    title: "Full-time freedom & complete location independence",
    deadline: "",
    steps: [
      "Live anywhere in the world off trading profits",
      "Provide complete financial freedom for family",
      "Build long-term generational wealth portfolio",
    ],
    completedSteps: [false, false, false],
  },
};

const HORIZON_CONFIG: Array<{
  id: HorizonId;
  shortLabel: string;
  sectionLabel: string;
  categoryLabel: string;
  placeholder: string;
  deadlineHint: string;
  suggestions: string[];
}> = [
  {
    id: "week",
    shortLabel: "Week",
    sectionLabel: "THIS WEEK",
    categoryLabel: "Weekly Plan",
    placeholder: "Follow my plan on every trade",
    deadlineHint: "Optional. Empty means Sunday.",
    suggestions: [
      "Strict 1:2 Risk/Reward on all entries",
      "Lock terminal after 2 consecutive losses",
      "Screenshot and journal every trade",
      "Trade London & NY overlap only",
    ],
  },
  {
    id: "month",
    shortLabel: "Month",
    sectionLabel: "THIS MONTH",
    categoryLabel: "Monthly Target",
    placeholder: "Pass my evaluation challenge",
    deadlineHint: "Optional. Empty means end of the month.",
    suggestions: [
      "Pass Phase 1 evaluation challenge",
      "Keep max drawdown strictly under 3%",
      "Consistent 0.5% - 1% risk per trade",
      "No revenge or impulse overtrading",
    ],
  },
  {
    id: "year",
    shortLabel: "Year",
    sectionLabel: "THIS YEAR",
    categoryLabel: "Annual Milestone",
    placeholder: "Secure funded accounts & payouts",
    deadlineHint: "Optional. Empty means 31 December.",
    suggestions: [
      "Achieve $10,000 in prop firm payouts",
      "Scale up to $200k funded capital",
      "Master my single A+ edge strategy",
      "Build a 6-month living expense reserve",
    ],
  },
  {
    id: "lifetime",
    shortLabel: "Life",
    sectionLabel: "LIFETIME · YOUR WHY",
    categoryLabel: "Lifetime Vision",
    placeholder: "Trade for a living & full-time freedom",
    deadlineHint: "Optional. Any target date you choose.",
    suggestions: [
      "Full-time location independence",
      "Financial freedom for my family",
      "Retire early & build generational wealth",
      "Freedom to trade from anywhere worldwide",
    ],
  },
];

const CARD_TABS: HorizonId[] = ["week", "month", "year", "lifetime"];

function loadGoals(): UserGoalsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      bannerPresetId: parsed.bannerPresetId || "trading_desk",
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

interface DeadlineInfo {
  label: string;
  isEnded: boolean;
  isToday: boolean;
}

function formatDeadlineChip(horizon: HorizonId, explicit: string): DeadlineInfo | null {
  const target = getEffectiveDeadline(horizon, explicit);
  if (!target) return null;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const dateStr = target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days < 0) return { label: `Ended ${dateStr}`, isEnded: true, isToday: false };
  if (days === 0) return { label: "Due today", isEnded: false, isToday: true };
  if (days === 1) return { label: "1 day left", isEnded: false, isToday: false };
  return { label: `${days}d left · ${dateStr}`, isEnded: false, isToday: false };
}

export const DashboardGoalsCard: React.FC = () => {
  const [goals, setGoals] = useState<UserGoalsState>(() => loadGoals());
  const [draft, setDraft] = useState<UserGoalsState>(() => loadGoals());
  const [modalOpen, setModalOpen] = useState(false);
  const [activeHorizon, setActiveHorizon] = useState<HorizonId>("week");

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
    toast.success("Goals updated successfully");
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
  const currentConfig = HORIZON_CONFIG.find((c) => c.id === activeHorizon) || HORIZON_CONFIG[0];
  const filledSteps = currentGoal.steps
    .map((text, idx) => ({ text: text.trim(), idx, done: currentGoal.completedSteps[idx] }))
    .filter((s) => s.text.length > 0);
  const completedCount = filledSteps.filter((s) => s.done).length;
  const deadlineChip = formatDeadlineChip(activeHorizon, currentGoal.deadline);

  // Determine active visual banner preset
  const activePreset = useMemo(() => {
    return (
      BANNER_PRESETS.find((p) => p.id === goals.bannerPresetId) ||
      BANNER_PRESETS[0]
    );
  }, [goals.bannerPresetId]);

  return (
    <>
      {/* ── Dashboard Goals Card ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[20px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#17171A] text-slate-900 dark:text-white transition-all">
        {/* Beautiful "Your Why" Vision Photo Banner */}
        <div className="relative -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-4 h-28 sm:h-32 overflow-hidden group">
          <img
            src={goals.pictureDataUrl || activePreset.url}
            onError={(e) => {
              (e.target as HTMLImageElement).src = activePreset.fallback;
            }}
            alt="Trading Vision"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wide shadow-sm">
              <Target size={11} className="text-amber-400" />
              <span>Your Why Vision</span>
            </span>

            <button
              type="button"
              onClick={openEditor}
              className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white transition-colors cursor-pointer select-none"
            >
              Change Vision
            </button>
          </div>
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-white/10">
              <Target size={14} strokeWidth={2.4} />
            </div>
            <div>
              <span className="text-[13.5px] font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                Goals & Milestones
              </span>
              <span className="text-[10.5px] font-medium text-slate-400 dark:text-neutral-500 block mt-0.5">
                Trading discipline & targets
              </span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={openEditor}
            className="tactile-white-pill rounded-full px-3.5 py-1 text-[11.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm select-none"
          >
            <Pencil size={11} strokeWidth={2.2} />
            <span>Edit</span>
          </motion.button>
        </div>

        {/* Content Body */}
        <div className="mt-3.5 space-y-3">
          {/* Horizon Segmented Control Tabs */}
          <div className="grid grid-cols-4 p-1 rounded-xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06]">
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
                  className={`relative py-1.5 text-center text-[11.5px] font-bold transition-all rounded-[9px] select-none cursor-pointer flex items-center justify-center gap-1 ${
                    active
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="goals-horizon-pill"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-white dark:bg-[#252529] rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-slate-200/60 dark:border-white/[0.08]"
                    />
                  )}
                  <span className="relative z-10">{cfg.shortLabel}</span>
                  {hasData && (
                    <span
                      className={`relative z-10 w-1.5 h-1.5 rounded-full ${
                        active ? "bg-emerald-500" : "bg-slate-400 dark:bg-neutral-600"
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
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-2.5 pt-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-neutral-400 block mb-0.5">
                    {currentConfig.categoryLabel}
                  </span>
                  <h3 className="text-[15.5px] sm:text-[16.5px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug break-words">
                    {currentGoal.title.trim() || (
                      <span className="text-slate-400 dark:text-neutral-500 font-medium text-[13.5px]">
                        No {currentConfig.shortLabel.toLowerCase()} goal set yet
                      </span>
                    )}
                  </h3>
                </div>

                {deadlineChip && currentGoal.title.trim() && (
                  <span
                    className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                      deadlineChip.isEnded
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/20"
                        : deadlineChip.isToday
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20"
                        : "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-neutral-300 border border-slate-200/60 dark:border-white/[0.06]"
                    }`}
                  >
                    {deadlineChip.isEnded ? (
                      <AlertCircle size={10.5} strokeWidth={2.5} />
                    ) : (
                      <Clock size={10.5} strokeWidth={2.5} />
                    )}
                    {deadlineChip.label}
                  </span>
                )}
              </div>

              {/* Steps Checklist */}
              {filledSteps.length > 0 ? (
                <div className="space-y-1.5 pt-0.5">
                  {filledSteps.map((step) => (
                    <button
                      key={step.idx}
                      type="button"
                      onClick={() => handleToggleStep(activeHorizon, step.idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-[12.5px] transition-all cursor-pointer select-none group border ${
                        step.done
                          ? "bg-emerald-500/[0.07] dark:bg-emerald-500/[0.1] border-emerald-500/30 dark:border-emerald-500/25 text-emerald-950 dark:text-emerald-100"
                          : "bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100/90 dark:hover:bg-white/[0.06] border-slate-200/80 dark:border-white/[0.07] text-slate-800 dark:text-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      <div
                        className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 transition-all ${
                          step.done
                            ? "bg-emerald-500 border-2 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : "border-2 border-slate-300 dark:border-neutral-600 bg-white dark:bg-[#1A1A1E] group-hover:border-slate-500 dark:group-hover:border-neutral-400"
                        }`}
                      >
                        {step.done && <Check size={11} strokeWidth={3.4} />}
                      </div>
                      <span
                        className={`flex-1 font-semibold leading-snug break-words ${
                          step.done
                            ? "line-through text-slate-400 dark:text-neutral-500"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {step.text}
                      </span>
                    </button>
                  ))}

                  {/* Progress Bar & Milestone Status */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1.5">
                      <span>Milestones</span>
                      <span className="tabular-nums font-bold text-slate-700 dark:text-neutral-300">
                        {completedCount}/{filledSteps.length} completed ({Math.round((completedCount / filledSteps.length) * 100)}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(completedCount / filledSteps.length) * 100}%`,
                        }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                    {completedCount === filledSteps.length && filledSteps.length > 0 && (
                      <div className="mt-2 py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>All targets achieved for this timeframe!</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl px-3 bg-slate-50/50 dark:bg-white/[0.02]">
                  <p className="text-[12px] text-slate-500 dark:text-neutral-400 font-medium">
                    No action steps added for this goal yet.
                  </p>
                  <button
                    type="button"
                    onClick={openEditor}
                    className="mt-2 text-[11.5px] font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white underline cursor-pointer"
                  >
                    + Add 3 steps to achieve it
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── "Your goals" Modal / Bottom Sheet ────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[99999] flex flex-col justify-end items-center pointer-events-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              />

              {/* Bottom Sheet Drawer Modal */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative w-full max-w-[560px] rounded-t-[28px] sm:rounded-t-[32px] bg-white dark:bg-[#141417] border-t border-x border-slate-200/90 dark:border-white/10 shadow-[0_-15px_45px_rgba(0,0,0,0.2)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.85)] max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white font-sans z-10"
              >
                {/* Top Drag Handle Bar */}
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mt-3 mb-1" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close goals editor"
                >
                  <X size={14} strokeWidth={2.4} />
                </button>

                {/* Header */}
                <div className="px-6 py-3 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
                  <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Target size={16} className="text-slate-700 dark:text-neutral-300" />
                    <span>Your Trading Goals & Vision</span>
                  </h2>
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto amazing-scrollbar px-6 py-5 space-y-5">
                  {/* Visual Banner Theme Selector (No photo upload / no file picker) */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-600 dark:text-neutral-300 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" />
                        <span>VISION BANNER THEME</span>
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">
                      Choose an inspiring visual backdrop for your dashboard goals card.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BANNER_PRESETS.map((preset) => {
                        const isSelected = (draft.bannerPresetId || "trading_desk") === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                bannerPresetId: preset.id,
                                pictureDataUrl: null,
                              }))
                            }
                            className={`group relative rounded-xl overflow-hidden border-2 transition-all p-1 text-left cursor-pointer ${
                              isSelected
                                ? "border-slate-900 dark:border-white shadow-sm ring-2 ring-slate-900/10 dark:ring-white/10"
                                : "border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30"
                            }`}
                          >
                            <div className="h-14 rounded-lg overflow-hidden relative">
                              <img
                                src={preset.url}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = preset.fallback;
                                }}
                                alt={preset.label}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/35" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <span className="block mt-1 text-[11px] font-bold text-slate-800 dark:text-white truncate">
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Four Goal Horizons */}
                  {HORIZON_CONFIG.map((cfg) => {
                    const item = draft[cfg.id];
                    return (
                      <div
                        key={cfg.id}
                        className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">
                            {cfg.sectionLabel}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                            {cfg.categoryLabel}
                          </span>
                        </div>

                        {/* Title input */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateDraftField(cfg.id, "title", e.target.value)
                          }
                          placeholder={cfg.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 text-[13.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-800 dark:focus:border-white transition-all shadow-sm font-semibold"
                        />

                        {/* Quick Suggestion Pills */}
                        <div className="space-y-1.5 pt-0.5">
                          <p className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500">
                            Quick ideas (tap to use):
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cfg.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => updateDraftField(cfg.id, "title", sug)}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-neutral-300 font-medium transition-colors text-left cursor-pointer"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Deadline Date Picker */}
                        <div className="pt-1">
                          <p className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Target Deadline
                          </p>
                          <div className="flex items-center flex-wrap gap-2.5">
                            <label className="relative inline-flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 text-[12px] font-semibold cursor-pointer min-w-[160px] hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-sm">
                              <span
                                className={
                                  item.deadline
                                    ? "text-slate-900 dark:text-white font-bold"
                                    : "text-slate-400 dark:text-slate-500 font-medium"
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
                                className="text-slate-400 dark:text-slate-500 shrink-0"
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
                                className="text-[11.5px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {cfg.deadlineHint}
                            </span>
                          </div>
                        </div>

                        {/* How I get there (Steps 1-3) */}
                        <div className="space-y-2 pt-1">
                          <p className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                            Daily Action Habits (Up to 3 milestones)
                          </p>
                          {[0, 1, 2].map((stepIdx) => (
                            <div key={stepIdx} className="flex items-center gap-2">
                              <span className="w-5 text-[11px] font-bold text-slate-400 dark:text-neutral-500 tabular-nums">
                                #{stepIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={item.steps[stepIdx]}
                                onChange={(e) =>
                                  updateDraftStep(cfg.id, stepIdx, e.target.value)
                                }
                                placeholder={`Habit or rule ${stepIdx + 1} (e.g. Max 2 trades/day)`}
                                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-white/10 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-800 dark:focus:border-white transition-all shadow-sm font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sticky Save Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#141417] shrink-0 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-10 px-5 rounded-full text-[13px] font-bold tactile-white-pill cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="h-10 px-6 rounded-full text-[13px] font-bold tactile-black-pill cursor-pointer select-none shadow-sm"
                  >
                    Save goals
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
