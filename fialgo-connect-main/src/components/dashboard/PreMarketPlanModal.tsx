import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ListChecks, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

export interface DailyPreMarketPlan {
  dateKey: string;
  bias: "bullish" | "neutral" | "bearish";
  focusPairs: string[];
  maxRiskUsd: string;
  maxTrades: string;
  checklist: Record<string, boolean>;
  notes: string;
  updatedAt: string;
}

const CHECKLIST_ITEMS = [
  { id: "news", label: "Checked high-impact news calendar" },
  { id: "htf", label: "Marked HTF key levels & liquidity zones" },
  { id: "risk", label: "Confirmed max daily loss & position sizing" },
  { id: "mindset", label: "Calm mindset — no chasing or revenge trading" },
];

const POPULAR_PAIRS = ["XAUUSD", "EURUSD", "GBPUSD", "NAS100", "US30", "BTCUSD", "USDJPY", "NIFTY"];

export function getTodayPlanKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `tf_premarket_plan_${y}-${m}-${d}`;
}

export function loadTodayPlan(): DailyPreMarketPlan | null {
  try {
    const raw = localStorage.getItem(getTodayPlanKey());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface PreMarketPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (plan: DailyPreMarketPlan) => void;
}

export const PreMarketPlanModal: React.FC<PreMarketPlanModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [bias, setBias] = useState<"bullish" | "neutral" | "bearish">("neutral");
  const [focusPairs, setFocusPairs] = useState<string[]>(["XAUUSD", "EURUSD"]);
  const [maxRiskUsd, setMaxRiskUsd] = useState("100");
  const [maxTrades, setMaxTrades] = useState("3");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const saved = loadTodayPlan();
    if (saved) {
      setBias(saved.bias || "neutral");
      setFocusPairs(saved.focusPairs || ["XAUUSD"]);
      setMaxRiskUsd(saved.maxRiskUsd || "100");
      setMaxTrades(saved.maxTrades || "3");
      setChecklist(saved.checklist || {});
      setNotes(saved.notes || "");
    }
  }, [isOpen]);

  const togglePair = (pair: string) => {
    setFocusPairs((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    );
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const plan: DailyPreMarketPlan = {
      dateKey: getTodayPlanKey(),
      bias,
      focusPairs,
      maxRiskUsd,
      maxTrades,
      checklist,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(getTodayPlanKey(), JSON.stringify(plan));
      toast.success("Today's pre-market plan saved");
      onSaved?.(plan);
      onClose();
    } catch {
      toast.error("Could not save plan");
    }
  };

  const completedChecks = CHECKLIST_ITEMS.filter((c) => checklist[c.id]).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full sm:max-w-[480px] bg-white dark:bg-[#17171A] rounded-t-[26px] sm:rounded-[26px] border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white">
                  <ListChecks size={16} />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-white leading-tight">
                    Pre-Market Plan
                  </h3>
                  <p className="text-[12px] text-slate-400">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Session Bias */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Session Bias
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "bullish", label: "Bullish", Icon: TrendingUp, activeClass: "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
                      { id: "neutral", label: "Neutral", Icon: Minus, activeClass: "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900" },
                      { id: "bearish", label: "Bearish", Icon: TrendingDown, activeClass: "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" },
                    ] as const
                  ).map(({ id, label, Icon, activeClass }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBias(id)}
                      className={`py-2.5 px-3 rounded-2xl border text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        bias === id
                          ? activeClass
                          : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Pairs */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Focus Pairs
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_PAIRS.map((pair) => {
                    const active = focusPairs.includes(pair);
                    return (
                      <button
                        key={pair}
                        type="button"
                        onClick={() => togglePair(pair)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-white/10"
                        }`}
                      >
                        {pair}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Risk Guardrails */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Max Daily Loss ($)
                  </label>
                  <input
                    type="number"
                    value={maxRiskUsd}
                    onChange={(e) => setMaxRiskUsd(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[14px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Max Trades Today
                  </label>
                  <input
                    type="number"
                    value={maxTrades}
                    onChange={(e) => setMaxTrades(e.target.value)}
                    placeholder="3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[14px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pre-Session Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Checklist
                  </label>
                  <span className="text-[11.5px] font-semibold text-slate-500">
                    {completedChecks}/{CHECKLIST_ITEMS.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map((item) => {
                    const checked = !!checklist[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          checked
                            ? "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-slate-900 dark:text-white"
                            : "bg-slate-50/60 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-neutral-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            checked
                              ? "bg-emerald-500 text-white"
                              : "border-2 border-slate-300 dark:border-neutral-600"
                          }`}
                        >
                          {checked && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span className="text-[13px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Key Levels & Gameplan
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your A+ setup trigger, invalidation, or news caution..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[13.5px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="tactile-white-pill rounded-full px-4 py-2 text-[13px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="tactile-black-pill rounded-full px-5 py-2 text-[13px] font-semibold cursor-pointer"
              >
                Save Plan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PreMarketPlanModal;
