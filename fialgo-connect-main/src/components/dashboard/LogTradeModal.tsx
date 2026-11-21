import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  PlusCircle,
  FileSpreadsheet,
  Check,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Clock,
  Image as ImageIcon,
  Link2,
  Trash2,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface LogTradeModalProps {
  isOpen?: boolean;
  open?: boolean;
  initialTab?: "manual" | "import";
  currencySymbol?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onSaved?: () => void;
}

type ModeTab = "basic" | "advanced" | "no_trade_day";
type DirectionType = "BUY" | "SELL";
type AssetClassType = "Futures" | "Forex" | "Crypto" | "Stocks" | "Indices" | "Commodities";
type TradeTypeCategory = "Day Trade" | "Scalp" | "Swing" | "Position";
type SessionType = "Asia" | "London" | "NY AM" | "NY PM" | "No session";
type GradeType = "A+" | "A" | "B" | "C" | "F";

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

  // Main Drawer Tab: Manual vs CSV Import
  const [activeMainTab, setActiveMainTab] = useState<"manual" | "import">(initialTab);

  // Manual Sub-mode: Basic | Advanced | No Trade Day
  const [modeTab, setModeTab] = useState<ModeTab>("basic");

  // Form State - Trade Info
  const [symbol, setSymbol] = useState("MNQ");
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [assetClass, setAssetClass] = useState<AssetClassType>("Futures");
  const [tradeCategory, setTradeCategory] = useState<TradeTypeCategory>("Day Trade");
  const [closedAnotherDay, setClosedAnotherDay] = useState(false);
  const [exitDate, setExitDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [direction, setDirection] = useState<DirectionType>("BUY");

  // Session
  const [entryTime, setEntryTime] = useState("");
  const [session, setSession] = useState<SessionType>("NY AM");

  // Plan & Account
  const [followedPlan, setFollowedPlan] = useState<"yes" | "no">("yes");
  const [selectedAccount, setSelectedAccount] = useState("None");
  const [availableAccounts, setAvailableAccounts] = useState<string[]>(["None"]);

  // Execution
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [profit, setProfit] = useState("");
  const [lotSize, setLotSize] = useState("1");
  const [plannedRr, setPlannedRr] = useState("");
  const [realizedRr, setRealizedRr] = useState("");

  // Performance & Grade
  const [grade, setGrade] = useState<GradeType>("A");

  // Notes
  const [notes, setNotes] = useState("");

  // Pictures / Screenshots
  const [pictureMode, setPictureMode] = useState<"upload" | "link">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [pictures, setPictures] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // No Trade Day specific fields
  const [noTradeReason, setNoTradeReason] = useState("Market conditions choppy / No high-probability setup");
  const [noTradeNotes, setNoTradeNotes] = useState("");

  const [saving, setSaving] = useState(false);

  // Synchronize initialTab when opening
  useEffect(() => {
    if (isModalOpen) {
      setActiveMainTab(initialTab);
      // Fetch user's connected MT5 accounts if available
      (async () => {
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          if (sess?.user) {
            const { data } = await supabase
              .from("mt5_accounts")
              .select("server, account_number")
              .eq("user_id", sess.user.id);
            if (data && data.length > 0) {
              const accNames = data.map((d: any) => `${d.server || "MT5"} (${d.account_number})`);
              setAvailableAccounts(["None", ...accNames]);
              setSelectedAccount(accNames[0]);
            }
          }
        } catch (_) {}
      })();
    }
  }, [isModalOpen, initialTab]);

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

  // Handle global paste for images
  useEffect(() => {
    if (!isModalOpen || activeMainTab !== "manual") return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setPictures((prev) => [...prev, reader.result as string]);
                toast.success("Screenshot pasted from clipboard!");
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isModalOpen, activeMainTab]);

  const notifyComplete = () => {
    if (onSuccess) onSuccess();
    if (onSaved) onSaved();
  };

  // Picture Upload handler
  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPictures((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`Attached ${files.length} image${files.length > 1 ? "s" : ""}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    setPictures((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success("Image link attached!");
  };

  const removePicture = (index: number) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  // Manual Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pnlNum = parseFloat(profit);

    if (modeTab !== "no_trade_day" && (!symbol.trim() || isNaN(pnlNum))) {
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

      const openedIso = new Date(`${tradeDate}T${entryTime || "12:00"}:00`).toISOString();
      const closedIso = closedAnotherDay
        ? new Date(`${exitDate}T16:00:00`).toISOString()
        : openedIso;

      const lotNum = parseFloat(lotSize) || 1;
      const parsedEntry = parseFloat(entryPrice);
      const parsedExit = parseFloat(exitPrice);
      const rrNum = parseFloat(realizedRr || plannedRr);

      // Structure metadata so rich journal fields persist
      const meta = {
        assetClass,
        tradeCategory,
        session,
        followedPlan: followedPlan === "yes",
        account: selectedAccount,
        entryPrice: !isNaN(parsedEntry) ? parsedEntry : null,
        exitPrice: !isNaN(parsedExit) ? parsedExit : null,
        plannedRr: parseFloat(plannedRr) || null,
        realizedRr: parseFloat(realizedRr) || null,
        grade,
        picturesCount: pictures.length,
      };

      if (modeTab === "no_trade_day") {
        // Record a disciplined No Trade Day
        const { error } = await supabase.from("trades").insert({
          user_id: user.id,
          ticket: `NO-TRADE-${Date.now()}`,
          symbol: "DISCIPLINE_HOLD",
          trade_type: "BUY",
          lot_size: 0,
          profit: 0,
          risk_reward_ratio: null,
          setup: "No Trade Day",
          notes: `[Reason: ${noTradeReason}] ${noTradeNotes}`.trim(),
          opened_at: openedIso,
          closed_at: closedIso,
          status: "closed",
          source: "no_trade_day",
          is_pending: false,
        });

        if (error) throw error;
        toast.success("Disciplined No Trade Day recorded! Streak protected.");
      } else {
        // Standard or Advanced Trade Insert
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
          setup: session ? `${session} ${tradeCategory}` : null,
          notes: fullNotes,
          opened_at: openedIso,
          closed_at: closedIso,
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

  const formattedDateHeadline = new Date(tradeDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Top Drawer Panel sliding down from ceiling */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.8, bottom: 0.05 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -50 || info.velocity.y < -250) {
                onClose();
              }
            }}
            className="relative z-50 w-full max-w-5xl max-h-[92vh] overflow-hidden bg-white dark:bg-[#161619] border-b border-x border-slate-200/80 dark:border-white/10 rounded-b-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] select-none overscroll-contain flex flex-col"
          >
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 pt-4 pb-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0 bg-white dark:bg-[#161619]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white flex items-center justify-center border border-slate-200/80 dark:border-white/10 shrink-0 shadow-2xs">
                  {activeMainTab === "manual" ? (
                    <PlusCircle size={18} strokeWidth={2.2} />
                  ) : (
                    <FileSpreadsheet size={18} strokeWidth={2.2} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {activeMainTab === "manual" ? "Log Trade" : "Import Trades"}
                    </h2>

                    {/* Manual vs Import Switcher */}
                    <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200/60 dark:border-white/10 ml-1">
                      <button
                        type="button"
                        onClick={() => setActiveMainTab("manual")}
                        className={`px-3 py-1 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeMainTab === "manual"
                            ? "bg-white dark:bg-[#25252a] text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        <PlusCircle size={12} />
                        <span>Manual</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMainTab("import")}
                        className={`px-3 py-1 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeMainTab === "import"
                            ? "bg-white dark:bg-[#25252a] text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        <Upload size={12} />
                        <span>Import CSV</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    {activeMainTab === "manual"
                      ? "Full trade journaling with execution metrics, sessions, discipline rating, and screenshots."
                      : "Upload CSV export from MT5, TradingView, or broker statements."}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200/60 dark:border-white/10 shadow-2xs transition-all cursor-pointer shrink-0 ml-3"
                title="Close"
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            {/* Sub-Header: Mode Pills (Basic | Advanced | No Trade Day) */}
            {activeMainTab === "manual" && (
              <div className="px-6 sm:px-8 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between gap-3 shrink-0">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300/50 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setModeTab("basic")}
                    className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer select-none ${
                      modeTab === "basic"
                        ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeTab("advanced")}
                    className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer select-none ${
                      modeTab === "advanced"
                        ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Advanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeTab("no_trade_day")}
                    className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer select-none ${
                      modeTab === "no_trade_day"
                        ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    No Trade Day
                  </button>
                </div>

                <div className="text-[11.5px] text-slate-500 dark:text-neutral-400 font-medium hidden sm:block">
                  {modeTab === "basic" && "Fast entry for quick setups & P&L"}
                  {modeTab === "advanced" && "Complete execution details, sessions & screenshots"}
                  {modeTab === "no_trade_day" && "Log discipline hold to protect streak & psychology"}
                </div>
              </div>
            )}

            {/* Scrollable Body Content */}
            <div
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="overflow-y-auto max-h-[calc(92vh-140px)] px-6 sm:px-8 py-5 select-text"
            >
              {activeMainTab === "manual" ? (
                modeTab === "no_trade_day" ? (
                  /* ── NO TRADE DAY SCREEN ── */
                  <form onSubmit={handleManualSubmit} className="max-w-2xl mx-auto space-y-4 py-2">
                    <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                            Log Disciplined No-Trade Day
                          </h3>
                          <p className="text-[12px] text-slate-500 dark:text-neutral-400">
                            Preserve your consistency streak without forcing suboptimal trades.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                          Date
                        </label>
                        <input
                          type="date"
                          value={tradeDate}
                          onChange={(e) => setTradeDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                          Discipline Reason
                        </label>
                        <select
                          value={noTradeReason}
                          onChange={(e) => setNoTradeReason(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl text-[13px] bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all cursor-pointer"
                        >
                          <option value="Market conditions choppy / No high-probability setup">
                            Market conditions choppy / No high-probability setup
                          </option>
                          <option value="High-impact news event (Fed, CPI, NFP) avoided">
                            High-impact news event (Fed, CPI, NFP) avoided
                          </option>
                          <option value="Followed trading rules: Daily limit or risk threshold met">
                            Followed trading rules: Daily limit or risk threshold met
                          </option>
                          <option value="Psychological check: Rested and avoided revenge trading">
                            Psychological check: Rested and avoided revenge trading
                          </option>
                          <option value="Personal schedule / Away from terminal">
                            Personal schedule / Away from terminal
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                          Reflection &amp; Market Notes
                        </label>
                        <textarea
                          rows={3}
                          value={noTradeNotes}
                          onChange={(e) => setNoTradeNotes(e.target.value)}
                          placeholder="What did the market do today? How did waiting protect your capital?"
                          className="w-full px-4 py-2.5 rounded-xl text-[13px] bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="tactile-white-pill rounded-full px-5 py-2 text-[12.5px] font-semibold cursor-pointer select-none active:scale-95 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="tactile-black-pill rounded-full px-6 py-2.5 font-bold text-[13px] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 select-none"
                      >
                        {saving ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Recording...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={14} />
                            <span>Log No Trade Day</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── MANUAL LOG TRADE (BASIC & ADVANCED 2-COLUMN VIEW) ── */
                  <form onSubmit={handleManualSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* ── LEFT COLUMN: Trade Info, Execution, Performance, Notes (col-span-7) ── */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* 1. Trade Info Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-4">
                          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                            Trade Info
                          </h3>

                          {/* Symbol & Date */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                Symbol
                              </label>
                              <input
                                type="text"
                                required
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                placeholder="MNQ, SPY, XAUUSD..."
                                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-bold uppercase bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                Date
                              </label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={tradeDate}
                                  onChange={(e) => setTradeDate(e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Asset Class & Trade Type (Advanced view) */}
                          {modeTab === "advanced" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                  Asset Class
                                </label>
                                <select
                                  value={assetClass}
                                  onChange={(e) => setAssetClass(e.target.value as AssetClassType)}
                                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all cursor-pointer"
                                >
                                  <option value="Futures">Futures</option>
                                  <option value="Forex">Forex</option>
                                  <option value="Crypto">Crypto</option>
                                  <option value="Stocks">Stocks</option>
                                  <option value="Indices">Indices</option>
                                  <option value="Commodities">Commodities</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                  Trade Type
                                </label>
                                <select
                                  value={tradeCategory}
                                  onChange={(e) => setTradeCategory(e.target.value as TradeTypeCategory)}
                                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all cursor-pointer"
                                >
                                  <option value="Day Trade">Day Trade</option>
                                  <option value="Scalp">Scalp</option>
                                  <option value="Swing">Swing</option>
                                  <option value="Position">Position</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Closed on another day toggle */}
                          {modeTab === "advanced" && (
                            <div className="flex items-center justify-between pt-0.5">
                              <label className="text-[12px] font-medium text-slate-600 dark:text-neutral-300 flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={closedAnotherDay}
                                  onChange={(e) => setClosedAnotherDay(e.target.checked)}
                                  className="rounded text-slate-900 focus:ring-0"
                                />
                                <span>Closed on another day?</span>
                              </label>

                              {closedAnotherDay && (
                                <input
                                  type="date"
                                  value={exitDate}
                                  onChange={(e) => setExitDate(e.target.value)}
                                  className="px-3 py-1.5 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white"
                                />
                              )}
                            </div>
                          )}

                          {/* Direction (↑ Long / ↓ Short) */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setDirection("BUY")}
                              className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 select-none ${
                                direction === "BUY"
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md"
                                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border-slate-200/90 dark:border-white/10 hover:border-slate-300"
                              }`}
                            >
                              <ArrowUpRight size={15} />
                              <span>↑ Long</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDirection("SELL")}
                              className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 select-none ${
                                direction === "SELL"
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md"
                                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border-slate-200/90 dark:border-white/10 hover:border-slate-300"
                              }`}
                            >
                              <ArrowDownRight size={15} />
                              <span>↓ Short</span>
                            </button>
                          </div>

                          {/* Session Picker & Note (Advanced view) */}
                          {modeTab === "advanced" && (
                            <div className="space-y-2.5 pt-1">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
                                Session
                              </label>

                              {/* Session Helper Box */}
                              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-neutral-300">
                                  <Clock size={14} className="text-slate-400 shrink-0" />
                                  <span>
                                    No entry time yet. Add when you got filled, or pick the session.
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="HH:MM"
                                  value={entryTime}
                                  onChange={(e) => setEntryTime(e.target.value)}
                                  className="w-20 px-2.5 py-1 text-center font-mono text-[12px] rounded-lg bg-white dark:bg-[#202024] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                                />
                              </div>

                              {/* Session Pills */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {(["Asia", "London", "NY AM", "NY PM", "No session"] as SessionType[]).map(
                                  (sess) => (
                                    <button
                                      key={sess}
                                      type="button"
                                      onClick={() => setSession(sess)}
                                      className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer select-none ${
                                        session === sess
                                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                                          : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-300 border-slate-200/80 dark:border-white/10 hover:border-slate-300"
                                      }`}
                                    >
                                      {sess}
                                    </button>
                                  )
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400 dark:text-neutral-500 flex items-center gap-1">
                                <span>✍</span>
                                <span>
                                  Lands in {formattedDateHeadline} under {session}. Counts in daily P&amp;L.
                                </span>
                              </p>
                            </div>
                          )}

                          {/* Followed My Plan & Account (Advanced view) */}
                          {modeTab === "advanced" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                  Followed My Plan
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setFollowedPlan("yes")}
                                    className={`py-2 rounded-xl text-[12.5px] font-bold border transition-all cursor-pointer select-none ${
                                      followedPlan === "yes"
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                        : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-300 border-slate-200/90 dark:border-white/10"
                                    }`}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFollowedPlan("no")}
                                    className={`py-2 rounded-xl text-[12.5px] font-bold border transition-all cursor-pointer select-none ${
                                      followedPlan === "no"
                                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                                        : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-300 border-slate-200/90 dark:border-white/10"
                                    }`}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                                    Account
                                  </label>
                                  <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                                    Manage
                                  </span>
                                </div>
                                <select
                                  value={selectedAccount}
                                  onChange={(e) => setSelectedAccount(e.target.value)}
                                  className="w-full px-3.5 py-2 rounded-xl text-[12.5px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 cursor-pointer"
                                >
                                  {availableAccounts.map((acc) => (
                                    <option key={acc} value={acc}>
                                      {acc}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Execution Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3.5">
                          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                            Execution
                          </h3>

                          {/* Entry Price & Exit Price */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                Entry Price
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                Exit Price
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={exitPrice}
                                onChange={(e) => setExitPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40"
                              />
                            </div>
                          </div>

                          {/* P&L and Size / Qty */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                P&amp;L ({currencySymbol})
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                required
                                value={profit}
                                onChange={(e) => setProfit(e.target.value)}
                                placeholder="+500 or -200"
                                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-bold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                Size / Qty
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={lotSize}
                                onChange={(e) => setLotSize(e.target.value)}
                                placeholder="1"
                                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40"
                              />
                            </div>
                          </div>

                          {/* Planned R:R & Realized R:R (Advanced view) */}
                          {modeTab === "advanced" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                  Planned R:R
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={plannedRr}
                                  onChange={(e) => setPlannedRr(e.target.value)}
                                  placeholder="e.g. 2.0"
                                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-1.5">
                                  Realized R:R
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={realizedRr}
                                  onChange={(e) => setRealizedRr(e.target.value)}
                                  placeholder="e.g. 2.5"
                                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Performance Card (Trade Grade) */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3">
                          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                            Performance
                          </h3>

                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-2">
                              Trade Grade
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {(["A+", "A", "B", "C", "F"] as GradeType[]).map((g) => {
                                const isSelected = grade === g;
                                return (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGrade(g)}
                                    className={`py-2 rounded-xl text-[13px] font-bold border transition-all cursor-pointer select-none ${
                                      isSelected
                                        ? g === "A+" || g === "A"
                                          ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                                          : g === "B"
                                          ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                          : g === "C"
                                          ? "bg-amber-400 text-white border-amber-400 shadow-sm"
                                          : "bg-rose-500 text-white border-rose-500 shadow-sm"
                                        : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border-slate-200/90 dark:border-white/10 hover:border-slate-300"
                                    }`}
                                  >
                                    {g}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 4. Notes Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                            Notes
                          </h3>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Explain your trade, entry, and insights. What happened? What did you do well? What would you do differently?"
                            className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all resize-none"
                          />
                        </div>

                        {/* Action Buttons: Save Trade & Cancel/Delete */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={saving}
                            className="tactile-black-pill rounded-full px-7 py-2.5 font-bold text-[13px] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 select-none shadow-md"
                          >
                            {saving ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Saving Trade...</span>
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                <span>Save Trade</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={onClose}
                            className="tactile-white-pill rounded-full px-5 py-2.5 text-[13px] font-semibold cursor-pointer select-none active:scale-95 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* ── RIGHT COLUMN: PICTURES (col-span-5) ── */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex flex-col min-h-[480px]">
                          {/* Pictures Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                              Pictures
                            </span>

                            {/* Upload vs Link toggle */}
                            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300/50 dark:border-white/10">
                              <button
                                type="button"
                                onClick={() => setPictureMode("upload")}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer select-none ${
                                  pictureMode === "upload"
                                    ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-2xs"
                                    : "text-slate-500 dark:text-neutral-400"
                                }`}
                              >
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => setPictureMode("link")}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer select-none ${
                                  pictureMode === "link"
                                    ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-2xs"
                                    : "text-slate-500 dark:text-neutral-400"
                                }`}
                              >
                                Paste a link
                              </button>
                            </div>
                          </div>

                          {/* Hidden File Input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePictureUpload}
                            className="hidden"
                          />

                          {/* Paste a link input row */}
                          {pictureMode === "link" && (
                            <div className="pt-3 flex gap-2">
                              <input
                                type="url"
                                placeholder="Paste image or chart URL..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-xl text-[12px] bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="tactile-black-pill rounded-xl px-3 py-1.5 text-[11.5px] font-bold cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          )}

                          {/* Drag & Drop Area */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-3 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 rounded-2xl p-6 text-center transition-colors cursor-pointer group bg-white/50 dark:bg-white/[0.01]"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-neutral-400 group-hover:scale-105 transition-transform mb-3">
                              <ImageIcon size={22} strokeWidth={1.8} />
                            </div>
                            <p className="text-[13px] font-bold text-slate-700 dark:text-neutral-200">
                              Drop screenshots, or{" "}
                              <span className="text-slate-900 dark:text-white underline underline-offset-2">
                                choose files
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                              ⌘ Cmd+V works here too
                            </p>
                          </div>

                          {/* Thumbnails list if any attached */}
                          {pictures.length > 0 && (
                            <div className="pt-3">
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-2">
                                Attached Screenshots ({pictures.length})
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {pictures.map((pic, idx) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group/img bg-slate-100"
                                  >
                                    <img
                                      src={pic}
                                      alt={`Screenshot ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removePicture(idx);
                                      }}
                                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                      title="Remove image"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                )
              ) : (
                /* ── IMPORT CSV VIEW ── */
                <div className="space-y-4 max-w-2xl mx-auto py-2">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFile}
                    className="hidden"
                  />
                  <div
                    onClick={() => csvFileInputRef.current?.click()}
                    className="w-full py-16 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white shadow-2xs mb-3 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={24} strokeWidth={2.2} />
                    </div>
                    <p className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">
                      {saving ? "Importing trades..." : "Upload CSV Trade History"}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-neutral-400 mt-1 max-w-[340px]">
                      Include column headers such as{" "}
                      <span className="font-mono text-slate-700 dark:text-neutral-200 font-semibold">
                        symbol, side, lot, profit, date
                      </span>
                      .
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      className="mt-4 tactile-black-pill rounded-full px-6 py-2.5 font-bold text-[12.5px] flex items-center gap-2 cursor-pointer transition-all active:scale-95 select-none"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Processing CSV...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>Choose CSV File</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="tactile-white-pill rounded-full px-5 py-2 text-[12.5px] font-semibold cursor-pointer select-none active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Grab Handle & Swipe Bar */}
            <div
              onClick={onClose}
              className="flex items-center justify-center py-3 border-t border-slate-100 dark:border-white/[0.06] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group rounded-b-[28px] mt-auto shrink-0 bg-white dark:bg-[#161619]"
              title="Drag up or click to close"
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/25 group-hover:bg-slate-400 dark:group-hover:bg-white/40 transition-colors" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogTradeModal;
