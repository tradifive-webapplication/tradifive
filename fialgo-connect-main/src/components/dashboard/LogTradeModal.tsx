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
  SlidersHorizontal,
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
type AssetClassType = "Futures" | "Forex" | "Crypto" | "Stocks" | "Indices" | "Commodities";

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

  // Active View Tab: "manual" or "import"
  const [activeTab, setActiveTab] = useState<"manual" | "import">(initialTab);

  useEffect(() => {
    if (isModalOpen) {
      setActiveTab(initialTab);
    }
  }, [isModalOpen, initialTab]);

  // Form State - Trade Info & Execution
  const [symbol, setSymbol] = useState("XAUUSD");
  const [direction, setDirection] = useState<DirectionType>("BUY");
  const [profit, setProfit] = useState("");
  const [lotSize, setLotSize] = useState("0.10");
  const [rMultiple, setRMultiple] = useState("2.0");
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [assetClass, setAssetClass] = useState<AssetClassType>("Forex");
  const [setupTag, setSetupTag] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [session, setSession] = useState<SessionType>("No session");
  const [followedPlan, setFollowedPlan] = useState<"yes" | "no">("yes");
  const [grade, setGrade] = useState<GradeType>("A");
  const [notes, setNotes] = useState("");
  const [pictures, setPictures] = useState<string[]>([]);
  const [pictureTab, setPictureTab] = useState<"upload" | "link">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isNoTradeDay, setIsNoTradeDay] = useState(false);

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

  const notifyComplete = () => {
    if (onSuccess) onSuccess();
    if (onSaved) onSaved();
  };

  // Manual Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pnlNum = parseFloat(profit.replace(/[+$,₹\s]/g, ""));

    if (!isNoTradeDay && (!symbol.trim() || isNaN(pnlNum))) {
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

      if (isNoTradeDay) {
        const { error } = await supabase.from("trades").insert({
          user_id: user.id,
          ticket: `NO-TRADE-${Date.now()}`,
          symbol: "DISCIPLINE_HOLD",
          trade_type: "BUY",
          lot_size: 0,
          profit: 0,
          risk_reward_ratio: null,
          setup: "No Trade Day",
          notes: notes.trim() || "Disciplined No Trade Day logged to protect capital and streak.",
          opened_at: openedIso,
          closed_at: openedIso,
          status: "closed",
          source: "no_trade_day",
          is_pending: false,
        });

        if (error) throw error;
        toast.success("Disciplined No Trade Day recorded! Streak protected.");
      } else {
        const fullNotes = [
          notes.trim(),
          `[Grade: ${grade}] [Session: ${session}] [Plan: ${followedPlan.toUpperCase()}]`,
          pictures.length > 0 ? `[Screenshots: ${pictures.length} attached]` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        const { error } = await supabase.from("trades").insert({
          user_id: user.id,
          ticket: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          symbol: symbol.trim().toUpperCase(),
          trade_type: direction,
          lot_size: lotNum,
          profit: pnlNum,
          risk_reward_ratio: !isNaN(rrNum) ? rrNum : null,
          setup: setupTag.trim() || null,
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
              {/* When in Dedicated Import Mode: Title without manual switcher */}
              {initialTab === "import" ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-white flex items-center justify-center border border-slate-200/80 dark:border-white/10 shrink-0 shadow-2xs">
                    <FileSpreadsheet size={16} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                      Import Trades
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Upload CSV export from MT5, TradingView, or broker statements.
                    </p>
                  </div>
                </div>
              ) : (
                /* When in Log Trade: Header with segmented pills matching user design */
                <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab("manual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer select-none ${
                      activeTab === "manual"
                        ? "bg-white dark:bg-[#222226] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <PlusCircle size={13} strokeWidth={2.2} />
                    <span>Log Trade</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("import")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer select-none ${
                      activeTab === "import"
                        ? "bg-white dark:bg-[#222226] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <Upload size={12} strokeWidth={2.2} />
                    <span>Import CSV</span>
                  </button>
                </div>
              )}

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

            {/* Scrollable Body Content */}
            <div
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="overflow-y-auto max-h-[calc(92vh-115px)] px-6 py-4 select-text"
            >
              {activeTab === "import" ? (
                /* ── DEDICATED IMPORT CSV VIEW ── */
                <div className="space-y-4 py-2">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFile}
                    className="hidden"
                  />
                  <div
                    onClick={() => csvFileInputRef.current?.click()}
                    className="w-full py-12 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white shadow-2xs mb-3 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={22} strokeWidth={2.2} />
                    </div>
                    <p className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                      {saving ? "Importing trades..." : "Upload CSV Trade History"}
                    </p>
                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-1 max-w-[320px]">
                      Include column headers such as{" "}
                      <span className="font-mono text-slate-700 dark:text-neutral-200 font-semibold">
                        symbol, side, lot, profit, date
                      </span>
                      .
                    </p>
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

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="tactile-white-pill rounded-full px-5 py-2 text-[12px] font-semibold cursor-pointer select-none transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── CONSISTENCY CARDS & BUTTONS 2-COLUMN LAYOUT ── */
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* LEFT COLUMN: Core Details, Execution, Notes (7 Cols) */}
                    <div className="lg:col-span-7 space-y-3.5">
                      {/* CARD 1: Trade Info & Metrics */}
                      <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                            Trade Info & Execution
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                            {currencySymbol} USD Denominated
                          </span>
                        </div>

                        {/* Row: Symbol & Direction */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Symbol
                            </label>
                            <input
                              type="text"
                              value={symbol}
                              onChange={(e) => setSymbol(e.target.value)}
                              placeholder="XAUUSD"
                              className="w-full h-[36px] px-3.5 rounded-xl text-[13px] font-bold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white uppercase transition-all"
                              required={!isNoTradeDay}
                            />
                          </div>

                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Direction
                            </label>
                            <div className="grid grid-cols-2 gap-1.5 h-[36px]">
                              <button
                                type="button"
                                onClick={() => {
                                  setDirection("BUY");
                                  handleAutoCalcPnl(entryPrice, exitPrice, lotSize, "BUY");
                                }}
                                className={`rounded-xl text-[12px] font-bold transition-all cursor-pointer select-none flex items-center justify-center ${
                                  direction === "BUY"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.08]"
                                }`}
                              >
                                BUY
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDirection("SELL");
                                  handleAutoCalcPnl(entryPrice, exitPrice, lotSize, "SELL");
                                }}
                                className={`rounded-xl text-[12px] font-bold transition-all cursor-pointer select-none flex items-center justify-center ${
                                  direction === "SELL"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.08]"
                                }`}
                              >
                                SELL
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Row: P&L ($), Lot Size, R-Multiple */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              P&L ({currencySymbol})
                            </label>
                            <input
                              type="text"
                              value={profit}
                              onChange={(e) => setProfit(e.target.value)}
                              placeholder="+125.00"
                              className={`w-full h-[36px] px-3 rounded-xl text-[13px] font-bold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white font-mono transition-all ${
                                profit.startsWith("+")
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : profit.startsWith("-")
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-900 dark:text-white"
                              }`}
                              required={!isNoTradeDay}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Lot Size
                            </label>
                            <input
                              type="text"
                              value={lotSize}
                              onChange={(e) => {
                                setLotSize(e.target.value);
                                handleAutoCalcPnl(entryPrice, exitPrice, e.target.value, direction);
                              }}
                              placeholder="0.10"
                              className="w-full h-[36px] px-3 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white font-mono transition-all"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              R-Multiple
                            </label>
                            <input
                              type="text"
                              value={rMultiple}
                              onChange={(e) => setRMultiple(e.target.value)}
                              placeholder="2.0"
                              className="w-full h-[36px] px-3 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white font-mono transition-all"
                            />
                          </div>
                        </div>

                        {/* Row: Date & Asset Class */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={tradeDate}
                              onChange={(e) => setTradeDate(e.target.value)}
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                              Asset Class
                            </label>
                            <select
                              value={assetClass}
                              onChange={(e) => setAssetClass(e.target.value as AssetClassType)}
                              className="w-full h-[36px] px-3 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white"
                            >
                              {["Forex", "Futures", "Crypto", "Stocks", "Indices", "Commodities"].map((a) => (
                                <option key={a} value={a} className="dark:bg-[#1f1f23]">
                                  {a}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Setup / Tag */}
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                            Setup / Tag (Optional)
                          </label>
                          <input
                            type="text"
                            value={setupTag}
                            onChange={(e) => setSetupTag(e.target.value)}
                            placeholder="e.g. NY Open FVG, Liquidity Sweep"
                            className="w-full h-[36px] px-3.5 rounded-xl text-[12.5px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white transition-all font-medium"
                          />
                        </div>
                      </div>

                      {/* CARD 2: Advanced Journaling Accordion (Clean & Compact) */}
                      <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-3.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="w-full flex items-center justify-between text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-amber-500" />
                            <span>Advanced Metrics (Entry/Exit Prices, Session, Grade, Plan)</span>
                          </span>
                          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden space-y-3 pt-3"
                            >
                              {/* Entry & Exit Prices */}
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                    Entry Price
                                  </label>
                                  <input
                                    type="text"
                                    value={entryPrice}
                                    onChange={(e) => {
                                      setEntryPrice(e.target.value);
                                      handleAutoCalcPnl(e.target.value, exitPrice, lotSize, direction);
                                    }}
                                    placeholder="e.g. 2650.50"
                                    className="w-full h-[34px] px-3 rounded-xl text-[12px] font-mono bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                    Exit Price
                                  </label>
                                  <input
                                    type="text"
                                    value={exitPrice}
                                    onChange={(e) => {
                                      setExitPrice(e.target.value);
                                      handleAutoCalcPnl(entryPrice, e.target.value, lotSize, direction);
                                    }}
                                    placeholder="e.g. 2662.00"
                                    className="w-full h-[34px] px-3 rounded-xl text-[12px] font-mono bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white"
                                  />
                                </div>
                              </div>

                              {/* Session Selector */}
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                  Session
                                </label>
                                <div className="grid grid-cols-5 gap-1">
                                  {(["Asia", "London", "NY AM", "NY PM", "No session"] as SessionType[]).map((sess) => (
                                    <button
                                      key={sess}
                                      type="button"
                                      onClick={() => setSession(sess)}
                                      className={`py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                        session === sess
                                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                                          : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 hover:bg-slate-50"
                                      }`}
                                    >
                                      {sess}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Trade Grade & Followed Plan */}
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                    Trade Grade
                                  </label>
                                  <div className="grid grid-cols-5 gap-1">
                                    {(["A+", "A", "B", "C", "F"] as GradeType[]).map((g) => (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={() => setGrade(g)}
                                        className={`py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                          grade === g
                                            ? "bg-emerald-600 text-white shadow-2xs"
                                            : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300"
                                        }`}
                                      >
                                        {g}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                    Followed Plan?
                                  </label>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setFollowedPlan("yes")}
                                      className={`py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                        followedPlan === "yes"
                                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                                          : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300"
                                      }`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFollowedPlan("no")}
                                      className={`py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                        followedPlan === "no"
                                          ? "bg-rose-600 text-white shadow-2xs"
                                          : "bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300"
                                      }`}
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* No Trade Day protection checkbox */}
                              <div className="pt-1 flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                  <ShieldCheck size={13} />
                                  <span>Mark as Disciplined No Trade Day (protects streak)</span>
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isNoTradeDay}
                                  onChange={(e) => setIsNoTradeDay(e.target.checked)}
                                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* CARD 3: Notes (Optional) */}
                      <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-2xs space-y-1.5">
                        <label className="text-[10.5px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                          Notes / Reflections
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="What went well or what would you improve?"
                          rows={2}
                          className="w-full px-3.5 py-2 rounded-xl text-[12.5px] bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white focus:border-zinc-950 dark:focus:border-white resize-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: KokonutUI File Upload & Screenshots (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col space-y-3.5">
                      <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-2xs flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                            Screenshots ({pictures.length})
                          </span>

                          {/* Upload vs Link toggle */}
                          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/40 dark:border-white/10">
                            <button
                              type="button"
                              onClick={() => setPictureTab("upload")}
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer select-none ${
                                pictureTab === "upload"
                                  ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-2xs"
                                  : "text-slate-500 dark:text-neutral-400"
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setPictureTab("link")}
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer select-none ${
                                pictureTab === "link"
                                  ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-2xs"
                                  : "text-slate-500 dark:text-neutral-400"
                              }`}
                            >
                              Paste link
                            </button>
                          </div>
                        </div>

                        {pictureTab === "upload" ? (
                          /* KokonutUI FileUpload Component */
                          <div className="flex-1 flex flex-col justify-center">
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
                          <div className="space-y-2 pt-1 flex-1">
                            <div className="flex gap-1.5">
                              <input
                                type="url"
                                placeholder="Paste image or TradingView chart URL..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="tactile-black-pill rounded-xl px-3 py-1.5 text-[11px] font-bold cursor-pointer"
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
