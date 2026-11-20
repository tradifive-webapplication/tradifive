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
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          {/* Bottom Sheet Drawer Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative z-10 w-full sm:max-w-[520px] bg-white dark:bg-[#161619] rounded-t-[32px] sm:rounded-b-[24px] sm:mb-4 border border-slate-200/80 dark:border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.22)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Top Drag Handle Bar */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white">
                  <ListChecks size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                    Pre-Market Plan
                  </h3>
                  <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/15 transition-all cursor-pointer active:scale-95"
                aria-label="Close"
              >
                <X size={15} strokeWidth={2.4} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Session Bias */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Session Bias
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { 
                        id: "bullish", 
                        label: "Bullish", 
                        Icon: TrendingUp, 
                        activeStyle: "bg-emerald-600 text-white shadow-[0_4px_14px_-2px_rgba(16,185,129,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.35)]",
                        activeIconColor: "text-white"
                      },
                      { 
                        id: "neutral", 
                        label: "Neutral", 
                        Icon: Minus, 
                        activeStyle: "tactile-black-pill",
                        activeIconColor: "text-white"
                      },
                      { 
                        id: "bearish", 
                        label: "Bearish", 
                        Icon: TrendingDown, 
                        activeStyle: "bg-rose-600 text-white shadow-[0_4px_14px_-2px_rgba(244,63,94,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.35)]",
                        activeIconColor: "text-white"
                      },
                    ] as const
                  ).map(({ id, label, Icon, activeStyle, activeIconColor }) => {
                    const isActive = bias === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setBias(id)}
                        className={`h-10 px-3 rounded-full text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                          isActive
                            ? activeStyle
                            : "tactile-white-pill text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <Icon size={14} strokeWidth={2.4} className={isActive ? activeIconColor : (id === 'bullish' ? 'text-emerald-500' : id === 'bearish' ? 'text-rose-500' : 'text-slate-400')} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus Pairs */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Focus Pairs
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_PAIRS.map((pair) => {
                    const active = focusPairs.includes(pair);
                    return (
                      <button
                        key={pair}
                        type="button"
                        onClick={() => togglePair(pair)}
                        className={`h-8 px-3.5 rounded-full text-[12px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center justify-center ${
                          active
                            ? "tactile-black-pill"
                            : "tactile-white-pill text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {pair}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Risk Guardrails */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Max Daily Loss ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={maxRiskUsd}
                      onChange={(e) => setMaxRiskUsd(e.target.value)}
                      placeholder="100"
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[14px] font-bold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Max Trades Today
                  </label>
                  <input
                    type="number"
                    value={maxTrades}
                    onChange={(e) => setMaxTrades(e.target.value)}
                    placeholder="3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[14px] font-bold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Pre-Session Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Checklist
                  </label>
                  <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
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
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-[0.99] ${
                          checked
                            ? "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-300/80 dark:border-emerald-500/30 text-slate-900 dark:text-white"
                            : "bg-white dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            checked
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "border-2 border-slate-300 dark:border-white/20"
                          }`}
                        >
                          {checked && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="text-[13px] font-medium leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Key Levels & Gameplan
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your A+ setup trigger, invalidation, or news caution..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[13.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-900 dark:focus:border-white transition-colors resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-3 shrink-0 bg-white/50 dark:bg-[#161619]/50 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-5 rounded-full text-[13px] font-bold tactile-white-pill cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-10 px-6 rounded-full text-[13px] font-bold tactile-black-pill cursor-pointer select-none flex items-center gap-1.5"
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
