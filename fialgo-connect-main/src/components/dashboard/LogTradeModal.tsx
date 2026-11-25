import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  PlusCircle,
  FileSpreadsheet,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  Link2,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  Sliders,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import FileUpload from "@/components/ui/FileUpload";

export interface LogTradeModalProps {
  isOpen?: boolean;
  open?: boolean;
  initialTab?: "manual" | "import";
  currencySymbol?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onSaved?: () => void;
}

type DirectionType = "BUY" | "SELL";
type SessionType = "Asia" | "London" | "NY AM" | "NY PM" | "No session";
type GradeType = "A+" | "A" | "B" | "C" | "F";
type AssetClassType = "Forex" | "Futures" | "Crypto" | "Stocks" | "Indices" | "Commodities";
type TradeCategoryType = "Day Trade" | "Swing" | "Scalp" | "Position";
type LogModeType = "basic" | "advanced" | "notrade";

export const LogTradeModal: React.FC<LogTradeModalProps> = ({
  isOpen,
  open,
  initialTab = "manual",
  currencySymbol = "$",
  onClose,
  onSuccess,
  onSaved,
}) => {
  const isModalOpen = isOpen ?? open ?? false;

  // View Mode: "manual" or "import"
  const [activeTab, setActiveTab] = useState<"manual" | "import">(initialTab);

  // Top Mode Slider: "basic" | "advanced" | "notrade"
  const [logMode, setLogMode] = useState<LogModeType>("basic");

  useEffect(() => {
    if (isModalOpen) {
      setActiveTab(initialTab);
    }
  }, [isModalOpen, initialTab]);

  // Form State: Core Trade Info
  const [symbol, setSymbol] = useState("XAUUSD");
  const [direction, setDirection] = useState<DirectionType>("BUY");
  const [profit, setProfit] = useState("");
  const [lotSize, setLotSize] = useState("0.10");
  const [rMultiple, setRMultiple] = useState("2.0");
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [assetClass, setAssetClass] = useState<AssetClassType>("Forex");
  const [tradeCategory, setTradeCategory] = useState<TradeCategoryType>("Day Trade");
  const [setupTag, setSetupTag] = useState("");
  const [session, setSession] = useState<SessionType>("London");
  const [sessionTime, setSessionTime] = useState("");
  const [followedPlan, setFollowedPlan] = useState<"yes" | "no">("yes");
  const [accountType, setAccountType] = useState("MT5 Vantage");

  // Form State: Execution Metrics
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [plannedRR, setPlannedRR] = useState("2.0");
  const [realizedRR, setRealizedRR] = useState("2.0");
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [mae, setMae] = useState("");
  const [mfe, setMfe] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [customExitReasonInput, setCustomExitReasonInput] = useState("");

  // Form State: Playbook & Targets
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>("Reversal");
  const [customPlaybookInput, setCustomPlaybookInput] = useState("");
  const [playbookOptions, setPlaybookOptions] = useState<string[]>([
    "Reversal",
    "Continuation",
    "Retracement",
    "Manipulation",
  ]);

  const [selectedLiquidity, setSelectedLiquidity] = useState<string>("Liquidity sweep");
  const [customLiquidityInput, setCustomLiquidityInput] = useState("");
  const [liquidityOptions, setLiquidityOptions] = useState<string[]>([
    "Liquidity sweep",
    "Equal highs",
    "Equal lows",
    "Session liquidity",
    "Major high",
    "Major low",
  ]);

  // Form State: Confluences & Confirmations
  const [selectedConfluences, setSelectedConfluences] = useState<string[]>(["FVG", "Order block"]);
  const [selectedConfirmations, setSelectedConfirmations] = useState<string[]>(["Market structure shift"]);
  const [selectedBonus, setSelectedBonus] = useState<string[]>(["SMT"]);

  // Form State: Revenge / Post-loss
  const [isRevengeTrade, setIsRevengeTrade] = useState(false);

  // Form State: Emotions & Psychology
  const [positiveEmotions, setPositiveEmotions] = useState<string[]>(["Disciplined", "Patient"]);
  const [negativeEmotions, setNegativeEmotions] = useState<string[]>([]);

  // Form State: Grade & Notes
  const [grade, setGrade] = useState<GradeType>("A");
  const [notes, setNotes] = useState("");

  // Screenshots & Media
  const [pictures, setPictures] = useState<string[]>([]);
  const [pictureTab, setPictureTab] = useState<"upload" | "link">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [saving, setSaving] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, onClose]);

  // Auto calculate P&L when prices and lot change
  const handleAutoCalcPnl = (entryStr: string, exitStr: string, sizeStr: string, dir: DirectionType) => {
    const en = parseFloat(entryStr);
    const ex = parseFloat(exitStr);
    const sz = parseFloat(sizeStr) || 1;
    if (!isNaN(en) && !isNaN(ex) && en > 0 && ex > 0) {
      const diff = dir === "BUY" ? ex - en : en - ex;
      const calcPnl = diff * sz;
      setProfit(calcPnl >= 0 ? `+${calcPnl.toFixed(2)}` : calcPnl.toFixed(2));
    }
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    setPictures((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success("Image URL attached!");
  };

  const togglePill = (item: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const notifyComplete = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tradifive:trades-updated"));
    }
    if (onSuccess) onSuccess();
    if (onSaved) onSaved();
  };

  // Manual Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNoTrade = logMode === "notrade";
    const pnlNum = parseFloat(profit.replace(/[+$,₹\s]/g, ""));

    if (!isNoTrade && (!symbol.trim() || isNaN(pnlNum))) {
      toast.error("Please enter a valid Symbol and P&L amount.");
      return;
    }

    setSaving(true);
    try {
      const { data: { session: sess } } = await supabase.auth.getSession();
      const user = sess?.user;
      if (!user) {
        toast.error("Please sign in to log trades");
        setSaving(false);
        return;
      }

      const openedIso = new Date(`${tradeDate}T12:00:00`).toISOString();
      const lotNum = parseFloat(lotSize) || 1;
      const rrNum = parseFloat(rMultiple);

      if (isNoTrade) {
        const { error } = await supabase.from("trades").insert({
          user_id: user.id,
          ticket: `NO-TRADE-${Date.now()}`,
          symbol: "DISCIPLINE_HOLD",
          trade_type: "BUY",
          lot_size: 0,
          profit: 0,
          risk_reward_ratio: null,
          setup: "Disciplined No Trade Day",
          notes: notes.trim() || "Disciplined No Trade Day recorded. Capital protected and trading streak maintained.",
          opened_at: openedIso,
          closed_at: openedIso,
          status: "closed",
          source: "no_trade_day",
          is_pending: false,
        });

        if (error) throw error;
        toast.success("Disciplined No Trade Day recorded! Streak protected.");
      } else {
        const fullNotesArray = [
          notes.trim(),
          `[Grade: ${grade}] [Session: ${session}${sessionTime ? ` @ ${sessionTime}` : ""}] [Plan: ${followedPlan.toUpperCase()}]`,
          logMode === "advanced" ? `[Playbook: ${selectedPlaybook}] [Liquidity: ${selectedLiquidity}]` : "",
          logMode === "advanced" && selectedConfluences.length > 0 ? `[Confluences: ${selectedConfluences.join(", ")}]` : "",
          logMode === "advanced" && positiveEmotions.length > 0 ? `[Psychology (+): ${positiveEmotions.join(", ")}]` : "",
          logMode === "advanced" && negativeEmotions.length > 0 ? `[Psychology (-): ${negativeEmotions.join(", ")}]` : "",
          logMode === "advanced" && isRevengeTrade ? "[ALERT: Flagged as Revenge Trade]" : "",
          pictures.length > 0 ? `[Screenshots: ${pictures.length} attached]` : "",
        ].filter(Boolean);

        const fullNotes = fullNotesArray.join("\n\n");

        const { error } = await supabase.from("trades").insert({
          user_id: user.id,
          ticket: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          symbol: symbol.trim().toUpperCase(),
          trade_type: direction,
          lot_size: lotNum,
          profit: pnlNum,
          risk_reward_ratio: !isNaN(rrNum) ? rrNum : null,
          setup: setupTag.trim() || (logMode === "advanced" ? selectedPlaybook : null),
          notes: fullNotes,
          opened_at: openedIso,
          closed_at: openedIso,
          status: "closed",
          source: "manual",
          is_pending: false,
        });

        if (error) throw error;
        toast.success(
          `Logged ${symbol.trim().toUpperCase()} (${pnlNum >= 0 ? "+" : "-"}${currencySymbol}${Math.abs(pnlNum).toFixed(2)})`
        );
      }

      notifyComplete();
      onClose();
    } catch (err: any) {
      console.error("Manual trade error:", err);
      toast.error(err?.message || "Failed to log trade");
    } finally {
      setSaving(false);
    }
  };

  // CSV Import Submit
  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);

    try {
      const { data: { session: sess } } = await supabase.auth.getSession();
      const user = sess?.user;
      if (!user) {
        toast.error("Please sign in to import trades");
        return;
      }

      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        toast.error("CSV needs a header row and at least one trade");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const idxSymbol = headers.findIndex((h) => h.includes("symbol") || h.includes("pair") || h.includes("instrument") || h.includes("ticker"));
      const idxProfit = headers.findIndex((h) => h.includes("profit") || h.includes("pnl") || h.includes("p&l") || h.includes("net"));
      const idxSide = headers.findIndex((h) => h.includes("side") || h.includes("type") || h.includes("direction"));
      const idxLot = headers.findIndex((h) => h.includes("lot") || h.includes("size") || h.includes("volume") || h.includes("qty"));
      const idxDate = headers.findIndex((h) => h.includes("close") || h.includes("date") || h.includes("time"));

      if (idxSymbol === -1 || idxProfit === -1) {
        toast.error("CSV must include at least 'symbol' and 'profit' (or 'pnl') columns");
        return;
      }

      const rowsToInsert: any[] = [];
      const baseTs = Date.now();

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^['"]|['"]$/g, ""));
        const sym = cols[idxSymbol];
        const rawProfit = (cols[idxProfit] || "").replace(/[$,₹\s]/g, "");
        const pnlNum = parseFloat(rawProfit);
        if (!sym || isNaN(pnlNum)) continue;

        const rawSide = idxSide !== -1 ? (cols[idxSide] || "").toUpperCase() : "BUY";
        const tradeType = rawSide.includes("SELL") || rawSide.includes("SHORT") ? "SELL" : "BUY";
        const lotVal = idxLot !== -1 ? parseFloat(cols[idxLot]) || 1 : 1;
        const parsedDate = idxDate !== -1 && cols[idxDate] ? new Date(cols[idxDate]) : new Date();
        const closedIso = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

        rowsToInsert.push({
          user_id: user.id,
          ticket: `CSV-${baseTs}-${i}`,
          symbol: sym.toUpperCase(),
          trade_type: tradeType,
          lot_size: lotVal,
          profit: pnlNum,
          opened_at: closedIso,
          closed_at: closedIso,
          status: "closed",
          source: "csv_import",
          is_pending: false,
        });
      }

      if (rowsToInsert.length === 0) {
        toast.error("No valid trade rows found in CSV");
        return;
      }

      const { error } = await supabase.from("trades").insert(rowsToInsert);
      if (error) throw error;

      toast.success(`Imported ${rowsToInsert.length} trade${rowsToInsert.length > 1 ? "s" : ""}`);
      notifyComplete();
      onClose();
    } catch (err: any) {
      console.error("CSV import error:", err);
      toast.error(err?.message || "Failed to import CSV");
    } finally {
      setSaving(false);
      if (csvFileInputRef.current) csvFileInputRef.current.value = "";
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Top Drawer Panel sliding directly down from the ceiling */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.85 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.8, bottom: 0.05 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -50 || info.velocity.y < -250) {
                onClose();
              }
            }}
            className={`relative z-50 w-full ${
              activeTab === "import" ? "max-w-2xl" : "max-w-4xl"
            } max-h-[92vh] overflow-hidden bg-white dark:bg-[#161619] border-b border-x border-slate-200/80 dark:border-white/10 rounded-b-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] select-none flex flex-col overscroll-contain transition-all duration-200`}
          >
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0 bg-white dark:bg-[#161619]">
              {/* Left Title: Clean and focused without 'Import CSV' button */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-white flex items-center justify-center border border-slate-200/80 dark:border-white/10 shrink-0 shadow-2xs">
                  {activeTab === "import" ? (
                    <FileSpreadsheet size={16} strokeWidth={2.2} />
                  ) : (
                    <PlusCircle size={16} strokeWidth={2.2} />
                  )}
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {activeTab === "import" ? "Import Trades" : "Log Trade"}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {activeTab === "import"
                      ? "Upload CSV export from MT5, TradingView, or broker statements."
                      : "Full trade journaling with execution metrics, sessions, discipline rating, and screenshots."}
                  </p>
                </div>
              </div>

              {/* Close Button with micro-tap */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200/60 dark:border-white/10 shadow-2xs transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X size={14} strokeWidth={2.2} />
              </motion.button>
            </div>

            {/* Mode Switcher Tabs for Log Trade: Basic | Advanced Logs | No Trade Today */}
            {activeTab === "manual" && (
              <div className="px-6 pt-3 pb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLogMode("basic")}
                    className={`rounded-full px-4 py-1.5 text-[12px] transition-all cursor-pointer select-none active:scale-95 ${
                      logMode === "basic"
                        ? "tactile-black-pill font-bold text-white shadow-xs"
                        : "tactile-white-pill font-semibold text-slate-700 dark:text-neutral-300"
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogMode("advanced")}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] transition-all cursor-pointer select-none active:scale-95 ${
                      logMode === "advanced"
                        ? "tactile-black-pill font-bold text-white shadow-xs ring-1 ring-amber-400/40"
                        : "tactile-white-pill font-semibold text-slate-700 dark:text-neutral-300"
                    }`}
                  >
                    <Sparkles size={12} className={logMode === "advanced" ? "text-amber-400" : "text-amber-500"} />
                    <span>Advanced Logs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogMode("notrade")}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] transition-all cursor-pointer select-none active:scale-95 ${
                      logMode === "notrade"
                        ? "tactile-amber-pill font-bold text-white shadow-xs"
                        : "tactile-white-pill font-semibold text-slate-700 dark:text-neutral-300"
                    }`}
                  >
                    <ShieldCheck size={12} className={logMode === "notrade" ? "text-white" : "text-amber-600"} />
                    <span>No Trade Today</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 dark:text-neutral-500 hidden sm:inline-block font-medium">
                  {logMode === "basic" && "Fast entry for quick setups & P&L"}
                  {logMode === "advanced" && "Complete professional playbook & psychology audit"}
                  {logMode === "notrade" && "Protect your streak and capital discipline"}
                </span>
              </div>
            )}

            {/* Scrollable Body Content */}
            <div
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="overflow-y-auto max-h-[calc(92vh-125px)] px-6 py-4 select-text bg-[#F8F9FA] dark:bg-[#121214]"
            >
              {activeTab === "import" ? (
                /* ── SLEEK IMPORT CSV VIEW (Kokonut Style File Upload) ── */
                <div className="space-y-4 py-2">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFile}
                    className="hidden"
                  />

                  {/* Dropzone matching the sleek KokonutUI file upload styling */}
                  <div
                    onClick={() => csvFileInputRef.current?.click()}
                    className="relative w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-slate-50/70 dark:bg-white/[0.02] p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white shadow-2xs mb-3 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={22} strokeWidth={2.2} />
                    </div>

                    <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                      {saving ? "Importing trades..." : "Drop CSV trade history or browse"}
                    </h3>

                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-1 max-w-[340px]">
                      Include column headers such as{" "}
                      <span className="font-mono text-slate-700 dark:text-neutral-200 font-semibold">
                        symbol, side, lot, profit, date
                      </span>
                    </p>

                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-2 font-medium">
                      CSV format up to 10 MB · MT5, TradingView, Broker statements
                    </span>

                    <button
                      type="button"
                      disabled={saving}
                      className="mt-4 tactile-black-pill rounded-full px-5 py-2 font-bold text-[12px] flex items-center gap-2 cursor-pointer transition-all active:scale-95 select-none"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Processing CSV...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>Choose CSV File</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom Action: Cancel */}
                  <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={onClose}
                      className="tactile-white-pill rounded-full px-5 py-2 text-[12px] font-semibold cursor-pointer select-none transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : logMode === "notrade" ? (
                /* ── NO TRADE TODAY DISCIPLINE MODE ── */
                <form onSubmit={handleManualSubmit} className="space-y-4 py-2">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                      <ShieldCheck size={20} strokeWidth={2.2} />
                      <h3 className="text-[14px] font-bold">Disciplined No-Trade Day</h3>
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Taking no trade when the market is choppy or your edge isn't present is a hallmark of elite trading.
                      Logging this protects your discipline rating, prevents revenge trading, and keeps your active streak alive.
                    </p>
                    <div className="pt-2">
                      <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                        Reason / Daily Market Note
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Market consolidated before CPI news; stayed disciplined on sidelines."
                        rows={3}
                        className="w-full px-3.5 py-2 rounded-xl text-[12.5px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={onClose}
                      className="tactile-white-pill rounded-full px-5 py-2 text-[12px] font-semibold cursor-pointer select-none transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={saving}
                      className="tactile-black-pill rounded-full px-6 py-2 font-bold text-[12.5px] flex items-center gap-2 cursor-pointer transition-all select-none shadow-sm"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Saving Record...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={13} />
                          <span>Confirm No Trade Day</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              ) : (
                /* ── 2-COLUMN LOG TRADE LAYOUT (Basic & Advanced Logs) ── */
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* LEFT COLUMN: All Inputs & Advanced Modules (7 Cols) */}
                    <div className="lg:col-span-7 space-y-3.5">
                      {/* CARD 1: Trade Info */}
                      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                          <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                            Trade Info
                          </h4>
                          <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
                            {currencySymbol} USD Denominated
                          </span>
                        </div>

                        {/* Symbol & Date */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Symbol
                            </label>
                            <input
                              type="text"
                              value={symbol}
                              onChange={(e) => setSymbol(e.target.value)}
                              placeholder="MNQ, SPY, XAUUSD..."
                              className="w-full h-[36px] px-3.5 rounded-xl text-[13px] font-bold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white uppercase transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={tradeDate}
                              onChange={(e) => setTradeDate(e.target.value)}
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white font-medium"
                            />
                          </div>
                        </div>

                        {/* Asset Class & Trade Type */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Asset Class
                            </label>
                            <select
                              value={assetClass}
                              onChange={(e) => setAssetClass(e.target.value as AssetClassType)}
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white font-medium"
                            >
                              {["Forex", "Futures", "Crypto", "Stocks", "Indices", "Commodities"].map((a) => (
                                <option key={a} value={a} className="dark:bg-[#1f1f23]">
                                  {a}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Trade Type
                            </label>
                            <select
                              value={tradeCategory}
                              onChange={(e) => setTradeCategory(e.target.value as TradeCategoryType)}
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white font-medium"
                            >
                              {["Day Trade", "Swing", "Scalp", "Position"].map((t) => (
                                <option key={t} value={t} className="dark:bg-[#1f1f23]">
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Long vs Short Tactile Pill Buttons */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                              Direction
                            </label>
                            <span className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer select-none">
                              Closed on another day?
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5 h-[38px]">
                            <button
                              type="button"
                              onClick={() => {
                                setDirection("BUY");
                                handleAutoCalcPnl(entryPrice, exitPrice, lotSize, "BUY");
                              }}
                              className={`rounded-full text-[12.5px] font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 active:scale-95 ${
                                direction === "BUY"
                                  ? "tactile-emerald-pill"
                                  : "tactile-white-pill text-slate-700 dark:text-neutral-300"
                              }`}
                            >
                              <span>↑ Long</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDirection("SELL");
                                handleAutoCalcPnl(entryPrice, exitPrice, lotSize, "SELL");
                              }}
                              className={`rounded-full text-[12.5px] font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 active:scale-95 ${
                                direction === "SELL"
                                  ? "tactile-rose-pill"
                                  : "tactile-white-pill text-slate-700 dark:text-neutral-300"
                              }`}
                            >
                              <span>↓ Short</span>
                            </button>
                          </div>
                        </div>

                        {/* Session selector with HH:MM and helper */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                            Session
                          </label>
                          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-neutral-400">
                            <Clock size={14} className="shrink-0 text-slate-400" />
                            <span className="flex-1 leading-snug">
                              No entry time yet. Add when you got filled, or pick the session, so this trade lands in the right part of your day.
                            </span>
                            <input
                              type="text"
                              value={sessionTime}
                              onChange={(e) => setSessionTime(e.target.value)}
                              placeholder="HH:MM"
                              className="w-16 h-7 px-2 text-center rounded-lg text-[11px] font-mono font-bold bg-white dark:bg-[#1a1a1d] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                            {(["Asia", "London", "NY AM", "NY PM", "No session"] as SessionType[]).map((sess) => (
                              <button
                                key={sess}
                                type="button"
                                onClick={() => setSession(sess)}
                                className={`py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  session === sess
                                    ? "tactile-black-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                {sess}
                              </button>
                            ))}
                          </div>
                          <div className="pt-0.5 text-[10.5px] text-slate-400 dark:text-neutral-500 flex items-center gap-1.5">
                            <span>Lands in {tradeDate ? new Date(tradeDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }) : "today"} under {session}. Counts in the daily P&L.</span>
                          </div>
                        </div>

                        {/* Followed Plan & Account */}
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Followed My Plan?
                            </label>
                            <div className="grid grid-cols-2 gap-2 h-[34px]">
                              <button
                                type="button"
                                onClick={() => setFollowedPlan("yes")}
                                className={`rounded-full text-[11.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  followedPlan === "yes"
                                    ? "tactile-emerald-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setFollowedPlan("no")}
                                className={`rounded-full text-[11.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  followedPlan === "no"
                                    ? "tactile-rose-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                                Account
                              </label>
                              <span className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer">
                                Manage
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setAccountType("None")}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  accountType === "None"
                                    ? "tactile-black-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                None
                              </button>
                              <button
                                type="button"
                                onClick={() => setAccountType("MT5 Vantage")}
                                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none flex items-center gap-2 active:scale-95 ${
                                  accountType !== "None"
                                    ? "tactile-black-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                <span className="w-4 h-4 rounded bg-white/20 text-[9px] font-mono font-bold flex items-center justify-center text-white">
                                  M5
                                </span>
                                <span>MetaTrader 5 Vantage Markets (Pty) Ltd #</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: Execution */}
                      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                          <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Execution</h4>
                        </div>

                        {/* Entry Price & Exit Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Entry Price
                            </label>
                            <input
                              type="text"
                              value={entryPrice}
                              onChange={(e) => {
                                setEntryPrice(e.target.value);
                                handleAutoCalcPnl(e.target.value, exitPrice, lotSize, direction);
                              }}
                              placeholder="0.00"
                              className="w-full h-[36px] px-3 rounded-xl text-[12.5px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Exit Price
                            </label>
                            <input
                              type="text"
                              value={exitPrice}
                              onChange={(e) => {
                                setExitPrice(e.target.value);
                                handleAutoCalcPnl(entryPrice, e.target.value, lotSize, direction);
                              }}
                              placeholder="0.00"
                              className="w-full h-[36px] px-3 rounded-xl text-[12.5px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-bold"
                            />
                          </div>
                        </div>

                        {/* P&L ($) & Size / Qty */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              P&L ({currencySymbol})
                            </label>
                            <input
                              type="text"
                              value={profit}
                              onChange={(e) => setProfit(e.target.value)}
                              placeholder="+500 or -200"
                              className={`w-full h-[36px] px-3 rounded-xl text-[13px] font-bold bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 font-mono transition-all ${
                                profit.startsWith("+")
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : profit.startsWith("-")
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-900 dark:text-white"
                              }`}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Size / Qty
                            </label>
                            <input
                              type="text"
                              value={lotSize}
                              onChange={(e) => {
                                setLotSize(e.target.value);
                                handleAutoCalcPnl(entryPrice, exitPrice, e.target.value, direction);
                              }}
                              placeholder="1"
                              className="w-full h-[36px] px-3 rounded-xl text-[12.5px] font-semibold font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
                            />
                          </div>
                        </div>

                        {/* Planned R:R & Realized R:R */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Planned R:R
                            </label>
                            <input
                              type="text"
                              value={plannedRR}
                              onChange={(e) => setPlannedRR(e.target.value)}
                              placeholder="e.g. 2.0"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Realized R:R
                            </label>
                            <input
                              type="text"
                              value={realizedRR}
                              onChange={(e) => {
                                setRealizedRR(e.target.value);
                                setRMultiple(e.target.value);
                              }}
                              placeholder="e.g. 2.5"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Entry Time & Exit / Close Time */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Entry Time
                            </label>
                            <input
                              type="text"
                              value={entryTime}
                              onChange={(e) => setEntryTime(e.target.value)}
                              placeholder="HH:MM:SS"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Exit / Close Time
                            </label>
                            <input
                              type="text"
                              value={exitTime}
                              onChange={(e) => setExitTime(e.target.value)}
                              placeholder="HH:MM:SS"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 font-bold"
                            />
                          </div>
                        </div>

                        {/* Stop Loss & Target Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Stop Loss
                            </label>
                            <input
                              type="text"
                              value={stopLoss}
                              onChange={(e) => setStopLoss(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Target
                            </label>
                            <input
                              type="text"
                              value={targetPrice}
                              onChange={(e) => setTargetPrice(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Partials & Add-ons */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Partials
                            </label>
                            <button
                              type="button"
                              className="text-[11.5px] font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 py-1"
                            >
                              <span>+ Add partial</span>
                            </button>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Add-ons
                            </label>
                            <button
                              type="button"
                              className="text-[11.5px] font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 py-1"
                            >
                              <span>+ Add add-on</span>
                            </button>
                          </div>
                        </div>

                        {/* MAE (Max Adverse) & MFE (Max Favorable) */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              MAE (Max Adverse) (Optional)
                            </label>
                            <input
                              type="text"
                              value={mae}
                              onChange={(e) => setMae(e.target.value)}
                              placeholder="Against you, in $"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              MFE (Max Favorable) (Optional)
                            </label>
                            <input
                              type="text"
                              value={mfe}
                              onChange={(e) => setMfe(e.target.value)}
                              placeholder="In your favour, in $"
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] font-mono bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Exit Reason */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                            Exit Reason
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={exitReason}
                              onChange={(e) => setExitReason(e.target.value)}
                              placeholder="Add your own exit reason..."
                              className="flex-1 h-[36px] px-3 rounded-xl text-[12px] bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
                            />
                            {exitReason && (
                              <button
                                type="button"
                                onClick={() => setExitReason("")}
                                className="tactile-white-pill rounded-full px-3 text-[11px] font-bold cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 italic">
                            Nothing here yet. Write the reasons you actually exit for and they stay for every trade.
                          </p>
                        </div>
                      </div>

                      {/* ── ADVANCED MODULES (Visible when in Advanced Logs mode) ── */}
                      {logMode === "advanced" && (
                        <div className="space-y-3.5">
                          {/* Playbook Card */}
                          <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Playbook</h4>
                                <span className="text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-wider">
                                  ADVANCED
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedPlaybook("")}
                                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {playbookOptions.map((pb) => (
                                <button
                                  key={pb}
                                  type="button"
                                  onClick={() => setSelectedPlaybook(pb)}
                                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                    selectedPlaybook === pb
                                      ? "tactile-black-pill text-white shadow-xs"
                                      : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                  }`}
                                >
                                  {pb}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Add your own playbook..."
                                value={customPlaybookInput}
                                onChange={(e) => setCustomPlaybookInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && customPlaybookInput.trim()) {
                                    e.preventDefault();
                                    if (!playbookOptions.includes(customPlaybookInput.trim())) {
                                      setPlaybookOptions((prev) => [...prev, customPlaybookInput.trim()]);
                                    }
                                    setSelectedPlaybook(customPlaybookInput.trim());
                                    setCustomPlaybookInput("");
                                  }
                                }}
                                className="flex-1 h-[34px] px-3 rounded-xl text-[11.5px] bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customPlaybookInput.trim()) {
                                    if (!playbookOptions.includes(customPlaybookInput.trim())) {
                                      setPlaybookOptions((prev) => [...prev, customPlaybookInput.trim()]);
                                    }
                                    setSelectedPlaybook(customPlaybookInput.trim());
                                    setCustomPlaybookInput("");
                                  }
                                }}
                                className="text-[11px] font-bold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white px-2 cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Liquidity Target Card */}
                          <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Liquidity Target</h4>
                                <span className="text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-wider">
                                  ADVANCED
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400 cursor-pointer">Edit</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
                              What were you targeting? The magnet this trade was built to reach.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {liquidityOptions.map((lt) => (
                                <button
                                  key={lt}
                                  type="button"
                                  onClick={() => setSelectedLiquidity(lt)}
                                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                    selectedLiquidity === lt
                                      ? "tactile-indigo-pill text-white shadow-xs"
                                      : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                  }`}
                                >
                                  {lt}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Add a target..."
                                value={customLiquidityInput}
                                onChange={(e) => setCustomLiquidityInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && customLiquidityInput.trim()) {
                                    e.preventDefault();
                                    if (!liquidityOptions.includes(customLiquidityInput.trim())) {
                                      setLiquidityOptions((prev) => [...prev, customLiquidityInput.trim()]);
                                    }
                                    setSelectedLiquidity(customLiquidityInput.trim());
                                    setCustomLiquidityInput("");
                                  }
                                }}
                                className="flex-1 h-[34px] px-3 rounded-xl text-[11.5px] bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customLiquidityInput.trim()) {
                                    if (!liquidityOptions.includes(customLiquidityInput.trim())) {
                                      setLiquidityOptions((prev) => [...prev, customLiquidityInput.trim()]);
                                    }
                                    setSelectedLiquidity(customLiquidityInput.trim());
                                    setCustomLiquidityInput("");
                                  }
                                }}
                                className="text-[11px] font-bold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white px-2 cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Breakdown (Confluences, Confirmations, Bonus) */}
                          <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Breakdown</h4>
                                <span className="text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-wider">
                                  ADVANCED
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400 cursor-pointer">Edit</span>
                            </div>

                            {/* Confluences */}
                            <div>
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                                Confluences
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {["FVG", "Order block", "Breaker", "Equilibrium", "Imbalance", "Liquidity sweep"].map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => togglePill(item, selectedConfluences, setSelectedConfluences)}
                                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                      selectedConfluences.includes(item)
                                        ? "tactile-purple-pill text-white shadow-xs"
                                        : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                    }`}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Confirmations */}
                            <div>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                                Confirmations
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {["iFVG", "Market structure shift", "Retest", "Rejection"].map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => togglePill(item, selectedConfirmations, setSelectedConfirmations)}
                                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                      selectedConfirmations.includes(item)
                                        ? "tactile-blue-pill text-white shadow-xs"
                                        : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                    }`}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Bonus */}
                            <div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                                Bonus
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {["SMT", "CISD", "Displacement"].map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => togglePill(item, selectedBonus, setSelectedBonus)}
                                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                      selectedBonus.includes(item)
                                        ? "tactile-amber-pill text-white shadow-xs"
                                        : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                    }`}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Post-loss Entry (Revenge Trade Protection) */}
                          <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Post-loss Entry</h4>
                                <span className="text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-wider">
                                  ADVANCED
                                </span>
                              </div>
                            </div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                              Post-loss Entry (Revenge Trade?)
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsRevengeTrade(false)}
                                className={`px-4 py-2 rounded-full text-[11.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  !isRevengeTrade
                                    ? "tactile-emerald-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                No revenge trade
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsRevengeTrade(true)}
                                className={`px-4 py-2 rounded-full text-[11.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  isRevengeTrade
                                    ? "tactile-rose-pill text-white shadow-xs"
                                    : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                }`}
                              >
                                Potential Revenge Trade
                              </button>
                            </div>
                          </div>

                          {/* Emotions & Psychology */}
                          <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Emotions & Psychology</h4>
                                <span className="text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-wider">
                                  ADVANCED
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400 cursor-pointer">Edit</span>
                            </div>

                            {/* Positive What Kept You Disciplined */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                                Positive, What Kept You Disciplined?
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {["Patient", "Disciplined", "Focused", "Calm", "Confident", "Rule-Following", "Selective", "Prepared"].map((emo) => (
                                  <button
                                    key={emo}
                                    type="button"
                                    onClick={() => togglePill(emo, positiveEmotions, setPositiveEmotions)}
                                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                      positiveEmotions.includes(emo)
                                        ? "tactile-emerald-pill text-white shadow-xs"
                                        : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                    }`}
                                  >
                                    {emo}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Negative What Hurt This Trade */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                                Negative, What Hurt This Trade?
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {["Fomo", "Revenge", "Overconfident", "Impatient", "Fearful", "Greedy", "Distracted", "Frustrated", "Anxious"].map((emo) => (
                                  <button
                                    key={emo}
                                    type="button"
                                    onClick={() => togglePill(emo, negativeEmotions, setNegativeEmotions)}
                                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                      negativeEmotions.includes(emo)
                                        ? "tactile-rose-pill text-white shadow-xs"
                                        : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                                    }`}
                                  >
                                    {emo}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Performance: Trade Grade */}
                      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                          <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Performance Grade</h4>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {(["A+", "A", "B", "C", "F"] as GradeType[]).map((g) => {
                            let activeClass = "tactile-black-pill text-white";
                            if (g === "A+" || g === "A") activeClass = "tactile-emerald-pill text-white";
                            else if (g === "B") activeClass = "tactile-blue-pill text-white";
                            else if (g === "C") activeClass = "tactile-amber-pill text-white";
                            else if (g === "F") activeClass = "tactile-rose-pill text-white";

                            return (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGrade(g)}
                                className={`py-2 rounded-full text-[12px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  grade === g
                                    ? `${activeClass} shadow-xs`
                                    : "tactile-white-pill text-slate-700 dark:text-neutral-300"
                                }`}
                              >
                                {g}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Notes / Reflections */}
                      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                          <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">Notes & Insights</h4>
                        </div>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Explain your trade entry and insights. What happened? What did you do well? What would you do differently?"
                          rows={3}
                          className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white resize-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Screenshots (Upload or Link) + Inspiring Trading Quotes Card (5 Cols) - STICKY PINNED */}
                    <div className="lg:col-span-5 lg:sticky lg:top-0 self-start flex flex-col space-y-3.5">
                      {/* Screenshots Card with Upload vs Paste Link */}
                      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col space-y-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                          <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                            Screenshots ({pictures.length})
                          </h4>

                          {/* Upload vs Link tactile buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPictureTab("upload")}
                              className={`rounded-full px-3 py-1 text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                pictureTab === "upload"
                                  ? "tactile-black-pill text-white shadow-xs"
                                  : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setPictureTab("link")}
                              className={`rounded-full px-3 py-1 text-[10.5px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                pictureTab === "link"
                                  ? "tactile-black-pill text-white shadow-xs"
                                  : "tactile-white-pill text-slate-600 dark:text-neutral-300"
                              }`}
                            >
                              Paste link
                            </button>
                          </div>
                        </div>

                        {pictureTab === "upload" ? (
                          /* KokonutUI FileUpload Component */
                          <div className="py-1">
                            <FileUpload
                              acceptedFileTypes={["image/png", "image/jpeg", "image/webp"]}
                              maxFileSize={5 * 1024 * 1024}
                              maxFiles={5}
                              uploadDelay={180}
                              onPicturesChange={(urls) => setPictures(urls)}
                              className="border-0 p-0 shadow-none bg-transparent"
                            />
                          </div>
                        ) : (
                          /* Paste Link input */
                          <div className="space-y-2 pt-1">
                            <div className="flex gap-1.5">
                              <input
                                type="url"
                                placeholder="Paste image or TradingView chart URL..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-xl text-[12px] bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="tactile-black-pill rounded-full px-3.5 py-1.5 text-[11px] font-bold cursor-pointer select-none active:scale-95"
                              >
                                Add
                              </button>
                            </div>

                            {pictures.length > 0 && (
                              <div className="pt-2">
                                <div className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 mb-1.5">
                                  Attached Links ({pictures.length})
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {pictures.map((pic, idx) => (
                                    <div
                                      key={idx}
                                      className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 group/img bg-slate-100"
                                    >
                                      <img
                                        src={pic}
                                        alt={`Link ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPictures((prev) => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        title="Remove image"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons: Cancel (white pill) & Log Trade (black pill) */}
                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={onClose}
                      className="tactile-white-pill rounded-full px-5 py-2 text-[12px] font-semibold cursor-pointer select-none transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={saving}
                      className="tactile-black-pill rounded-full px-6 py-2 font-bold text-[12.5px] flex items-center gap-2 cursor-pointer transition-all select-none disabled:opacity-50 shadow-sm"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Saving Trade...</span>
                        </>
                      ) : (
                        <span>Log Trade</span>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Grab Handle & Swipe Bar for Top Drawer */}
            <div
              onClick={onClose}
              className="flex items-center justify-center py-2.5 border-t border-slate-100 dark:border-white/[0.06] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group rounded-b-[28px] mt-auto shrink-0 bg-white dark:bg-[#161619]"
              title="Drag up or click to close"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-1.5 rounded-full bg-slate-300 dark:bg-white/25 group-hover:bg-slate-400 dark:group-hover:bg-white/40 transition-colors"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogTradeModal;
