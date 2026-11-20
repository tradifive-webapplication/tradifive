import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ListChecks, TrendingUp, TrendingDown, Minus, ArrowRight, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTradingTheme } from "@/hooks/useTradingTheme";

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
  const { config: tradingTheme } = useTradingTheme();
  const [bias, setBias] = useState<"bullish" | "neutral" | "bearish">("neutral");
  const [focusPairs, setFocusPairs] = useState<string[]>(["XAUUSD", "EURUSD"]);
  const [maxRiskUsd, setMaxRiskUsd] = useState("100");
  const [maxTrades, setMaxTrades] = useState("3");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  // Toggle backside page scaling & blur when bottom sheet is open, matching Suggest / Report
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

  if (!isOpen) return null;

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
  const isBullish = bias === "bullish";
  const isNeutral = bias === "neutral";
  const isBearish = bias === "bearish";

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

        {/* Bottom Sheet Drawer matching Report & Suggest Modal Architecture */}
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
          className="relative w-full max-w-[760px] rounded-t-[28px] sm:rounded-t-[32px] bg-white dark:bg-[#121214] border-t border-x border-slate-200/90 dark:border-white/10 shadow-[0_-15px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.85)] max-h-[88vh] overflow-y-auto amazing-scrollbar text-slate-900 dark:text-white font-sans z-10"
        >
          {/* Top handle pill for pulling down */}
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mt-3 mb-1 cursor-grab active:cursor-grabbing hover:bg-slate-400 dark:hover:bg-white/40 transition-colors" />

          {/* Close button (Circular pill) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} strokeWidth={2.4} />
          </button>

          {/* 2-Column Responsive Layout matching Report & Suggest Dialogs */}
          <div className="p-6 sm:p-8 pt-3 sm:pt-4">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-8 items-start">
              {/* Left Column: Heading, Subtitle & Readiness Status */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9.5px] sm:text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                    DAILY PREPARATION
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Pre-Market Plan
                  </h2>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Define your session bias, risk rules, and gameplan before taking the first trade.
                  </p>
                </div>

                {/* Date Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <Calendar size={13} className="text-slate-400 dark:text-zinc-500" />
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Readiness Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-slate-400 dark:text-zinc-500" />
                      Readiness
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {completedChecks}/{CHECKLIST_ITEMS.length} done
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${(completedChecks / CHECKLIST_ITEMS.length) * 100}%`,
                        backgroundColor: tradingTheme.win,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Compact Form Controls */}
              <div className="space-y-4">
                {/* 1. Session Bias */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-2">
                    SESSION BIAS
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBias("bullish")}
                      style={isBullish ? { backgroundColor: tradingTheme.win, color: "#fff" } : undefined}
                      className={`h-9 px-3 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                        isBullish
                          ? "text-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.3)]"
                          : "tactile-white-pill text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <TrendingUp size={13} strokeWidth={2.4} style={{ color: isBullish ? "#fff" : tradingTheme.win }} />
                      <span>Bullish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBias("neutral")}
                      className={`h-9 px-3 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                        isNeutral
                          ? "tactile-black-pill text-white"
                          : "tactile-white-pill text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Minus size={13} strokeWidth={2.4} className={isNeutral ? "text-white" : "text-slate-400"} />
                      <span>Neutral</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBias("bearish")}
                      style={isBearish ? { backgroundColor: tradingTheme.loss, color: "#fff" } : undefined}
                      className={`h-9 px-3 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                        isBearish
                          ? "text-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.3)]"
                          : "tactile-white-pill text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <TrendingDown size={13} strokeWidth={2.4} style={{ color: isBearish ? "#fff" : tradingTheme.loss }} />
                      <span>Bearish</span>
                    </button>
                  </div>
                </div>

                {/* 2. Focus Pairs */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-2">
                    FOCUS PAIRS
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_PAIRS.map((pair) => {
                      const active = focusPairs.includes(pair);
                      return (
                        <button
                          key={pair}
                          type="button"
                          onClick={() => togglePair(pair)}
                          className={`h-7 px-3 rounded-full text-[11.5px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center justify-center ${
                            active
                              ? "tactile-black-pill text-white"
                              : "tactile-white-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {pair}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Risk & Limits */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">
                      MAX DAILY LOSS ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 font-bold text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        value={maxRiskUsd}
                        onChange={(e) => setMaxRiskUsd(e.target.value)}
                        placeholder="100"
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">
                      MAX TRADES TODAY
                    </label>
                    <input
                      type="number"
                      value={maxTrades}
                      onChange={(e) => setMaxTrades(e.target.value)}
                      placeholder="3"
                      className="w-full px-3 py-2 rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all"
                    />
                  </div>
                </div>

                {/* 4. Pre-Session Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                      CHECKLIST
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                      {completedChecks}/{CHECKLIST_ITEMS.length} done
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {CHECKLIST_ITEMS.map((item) => {
                      const checked = !!checklist[item.id];
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCheck(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-[0.99] ${
                            checked
                              ? "bg-slate-50/90 dark:bg-white/[0.04] border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white"
                              : "bg-[#f4f5f7]/50 dark:bg-[#1a1b20]/50 border-transparent dark:border-white/5 text-slate-600 dark:text-zinc-400 hover:bg-[#f4f5f7] dark:hover:bg-[#1a1b20]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              checked
                                ? "text-white shadow-sm"
                                : "border border-slate-300 dark:border-white/20"
                            }`}
                            style={checked ? { backgroundColor: tradingTheme.win } : undefined}
                          >
                            {checked && <Check size={10} strokeWidth={3} />}
                          </span>
                          <span className={`text-[12px] font-medium leading-tight ${checked ? "font-semibold" : ""}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Key Levels & Gameplan */}
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">
                    KEY LEVELS & GAMEPLAN
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your A+ setup trigger, invalidation, or news caution..."
                    className="w-full rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-300 dark:focus:border-white/20 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* 6. Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="h-9 px-5 rounded-full tactile-black-pill font-semibold text-[12.5px] inline-flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95"
                  >
                    <span>Save Plan</span>
                    <ArrowRight size={13.5} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default PreMarketPlanModal;
