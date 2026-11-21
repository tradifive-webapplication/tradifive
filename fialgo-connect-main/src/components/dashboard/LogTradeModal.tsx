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
  const [tab, setTab] = useState<"manual" | "import">(initialTab);
  const [symbol, setSymbol] = useState("XAUUSD");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [profit, setProfit] = useState("");
  const [lotSize, setLotSize] = useState("0.10");
  const [rrRatio, setRrRatio] = useState("");
  const [setup, setSetup] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial tab whenever modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTab(initialTab);
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

  const notifyComplete = () => {
    if (onSuccess) onSuccess();
    if (onSaved) onSaved();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pnlNum = parseFloat(profit);
    if (!symbol.trim() || isNaN(pnlNum)) {
      toast.error("Enter a valid symbol and P&L amount");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        toast.error("Please sign in to log trades");
        setSaving(false);
        return;
      }

      const nowIso = new Date().toISOString();
      const rrNum = parseFloat(rrRatio);
      const lotNum = parseFloat(lotSize) || 0.1;

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        ticket: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        symbol: symbol.trim().toUpperCase(),
        trade_type: side,
        lot_size: lotNum,
        profit: pnlNum,
        risk_reward_ratio: !isNaN(rrNum) ? rrNum : null,
        setup: setup.trim() || null,
        notes: notes.trim() || null,
        opened_at: nowIso,
        closed_at: nowIso,
        status: "closed",
        source: "manual",
        is_pending: false,
      });

      if (error) throw error;

      toast.success(
        `Logged ${symbol.trim().toUpperCase()} (${pnlNum >= 0 ? "+" : "-"}${currencySymbol}${Math.abs(pnlNum).toFixed(2)})`
      );
      setProfit("");
      setRrRatio("");
      setSetup("");
      setNotes("");
      notifyComplete();
      onClose();
    } catch (err: any) {
      console.error("Manual trade insert error:", err);
      toast.error(err?.message || "Failed to log trade");
    } finally {
      setSaving(false);
    }
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
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

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const idxSymbol = headers.findIndex(
        (h) =>
          h.includes("symbol") ||
          h.includes("pair") ||
          h.includes("instrument") ||
          h.includes("ticker")
      );
      const idxProfit = headers.findIndex(
        (h) =>
          h.includes("profit") ||
          h.includes("pnl") ||
          h.includes("p&l") ||
          h.includes("net")
      );
      const idxSide = headers.findIndex(
        (h) =>
          h.includes("side") ||
          h.includes("type") ||
          h.includes("direction")
      );
      const idxLot = headers.findIndex(
        (h) =>
          h.includes("lot") ||
          h.includes("size") ||
          h.includes("volume") ||
          h.includes("qty")
      );
      const idxDate = headers.findIndex(
        (h) =>
          h.includes("close") ||
          h.includes("date") ||
          h.includes("time")
      );

      if (idxSymbol === -1 || idxProfit === -1) {
        toast.error("CSV must include at least 'symbol' and 'profit' (or 'pnl') columns");
        return;
      }

      const rowsToInsert: any[] = [];
      const baseTs = Date.now();

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]
          .split(",")
          .map((c) => c.trim().replace(/^['"]|['"]$/g, ""));
        const sym = cols[idxSymbol];
        const rawProfit = (cols[idxProfit] || "").replace(/[$,₹\s]/g, "");
        const pnlNum = parseFloat(rawProfit);
        if (!sym || isNaN(pnlNum)) continue;

        const rawSide = idxSide !== -1 ? (cols[idxSide] || "").toUpperCase() : "BUY";
        const tradeType =
          rawSide.includes("SELL") || rawSide.includes("SHORT") ? "SELL" : "BUY";
        const lotVal = idxLot !== -1 ? parseFloat(cols[idxLot]) || 0.1 : 0.1;
        const parsedDate = idxDate !== -1 && cols[idxDate] ? new Date(cols[idxDate]) : new Date();
        const closedIso = isNaN(parsedDate.getTime())
          ? new Date().toISOString()
          : parsedDate.toISOString();

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

      toast.success(
        `Imported ${rowsToInsert.length} trade${rowsToInsert.length > 1 ? "s" : ""}`
      );
      notifyComplete();
      onClose();
    } catch (err: any) {
      console.error("CSV import error:", err);
      toast.error(err?.message || "Failed to import CSV");
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Top Drawer Panel sliding down from the top */}
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
            className="relative z-50 w-full max-w-3xl max-h-[92vh] overflow-hidden bg-white dark:bg-[#161619] border-b border-x border-slate-200/80 dark:border-white/10 rounded-b-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] select-none overscroll-contain flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-start sm:items-center justify-between px-6 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white flex items-center justify-center border border-slate-200/80 dark:border-white/10 shrink-0 shadow-2xs">
                  {tab === "manual" ? (
                    <PlusCircle size={18} strokeWidth={2.2} />
                  ) : (
                    <FileSpreadsheet size={18} strokeWidth={2.2} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {tab === "manual" ? "Log Trade" : "Import Trades"}
                    </h2>

                    {/* Tactile Tab Selector */}
                    <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200/60 dark:border-white/10 ml-0.5 sm:ml-2">
                      <button
                        type="button"
                        onClick={() => setTab("manual")}
                        className={`px-3 py-1 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          tab === "manual"
                            ? "bg-white dark:bg-[#25252a] text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        <PlusCircle size={12} />
                        <span>Manual</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("import")}
                        className={`px-3 py-1 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          tab === "import"
                            ? "bg-white dark:bg-[#25252a] text-slate-900 dark:text-white shadow-2xs"
                            : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        <Upload size={12} />
                        <span>Import CSV</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    {tab === "manual"
                      ? "Record execution details, lot size, P&L, and strategy setups."
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

            {/* Scrollable Modal Content */}
            <div
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="overflow-y-auto max-h-[calc(92vh-130px)] px-6 sm:px-7 py-5"
            >
              {tab === "manual" ? (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  {/* Symbol & Direction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                        Symbol
                      </label>
                      <input
                        type="text"
                        required
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="e.g. XAUUSD, EURUSD, BTCUSD"
                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-bold uppercase bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                        Direction
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSide("BUY")}
                          className={`py-2.5 rounded-xl text-[12.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                            side === "BUY"
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                              : "bg-slate-50/80 dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <TrendingUp size={14} />
                          <span>BUY</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSide("SELL")}
                          className={`py-2.5 rounded-xl text-[12.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                            side === "SELL"
                              ? "bg-rose-500 text-white border-rose-500 shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
                              : "bg-slate-50/80 dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <TrendingDown size={14} />
                          <span>SELL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* P&L, Lot Size, R-Multiple */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                        P&amp;L ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={profit}
                        onChange={(e) => setProfit(e.target.value)}
                        placeholder="+125.00"
                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                        Lot Size
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={lotSize}
                        onChange={(e) => setLotSize(e.target.value)}
                        placeholder="0.10"
                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                        R-Multiple
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={rrRatio}
                        onChange={(e) => setRrRatio(e.target.value)}
                        placeholder="2.0"
                        className="w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Setup / Tag */}
                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5">
                      Setup / Tag (optional)
                    </label>
                    <input
                      type="text"
                      value={setup}
                      onChange={(e) => setSetup(e.target.value)}
                      placeholder="e.g. NY Open FVG, Liquidity Sweep, Asian Range Breakout"
                      className="w-full px-4 py-2.5 rounded-xl text-[13px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 dark:text-neutral-300 block mb-1.5">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What went well or what would you improve?"
                      className="w-full px-4 py-2.5 rounded-xl text-[13px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all resize-none"
                    />
                  </div>
                      placeholder="What went well or what would you improve?"
                      className="w-full px-4 py-2.5 rounded-xl text-[13px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-800 dark:focus:border-white/40 transition-all resize-none"
                    />
                  </div>

                  {/* Action Buttons: Consistent Tactile Pills */}
                  <div className="pt-2 flex items-center justify-end gap-3">
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
                      className="tactile-black-pill rounded-full px-6 py-2 font-bold text-[12.5px] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 select-none"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Saving Trade...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Log Trade</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Import CSV Tab */
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFile}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white shadow-2xs mb-3 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={22} strokeWidth={2.2} />
                    </div>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                      {saving ? "Importing trades..." : "Upload CSV Trade History"}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-neutral-400 mt-1 max-w-[340px]">
                      Include column headers such as <span className="font-mono text-slate-700 dark:text-neutral-200 font-semibold">symbol, side, lot, profit, date</span>.
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      className="mt-4 tactile-black-pill rounded-full px-5 py-2 font-bold text-[12px] flex items-center gap-2 cursor-pointer transition-all active:scale-95 select-none"
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

                  {/* Cancel Button */}
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
              className="flex items-center justify-center py-3 border-t border-slate-100 dark:border-white/[0.06] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group rounded-b-[28px] mt-auto shrink-0"
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
