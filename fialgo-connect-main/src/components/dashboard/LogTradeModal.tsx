import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, PlusCircle, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LogTradeModalProps {
  isOpen: boolean;
  initialTab?: "manual" | "import";
  onClose: () => void;
  onSuccess: () => void;
}

export const LogTradeModal: React.FC<LogTradeModalProps> = ({
  isOpen,
  initialTab = "manual",
  onClose,
  onSuccess,
}) => {
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

  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pnlNum = parseFloat(profit);
    if (!symbol.trim() || isNaN(pnlNum)) {
      toast.error("Enter a valid symbol and P&L amount");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
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

      toast.success(`Logged ${symbol.trim().toUpperCase()} (${pnlNum >= 0 ? "+" : "-"}$${Math.abs(pnlNum).toFixed(2)})`);
      setProfit("");
      setRrRatio("");
      setSetup("");
      setNotes("");
      onSuccess();
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
      const { data: { session } } = await supabase.auth.getSession();
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
        const lotVal = idxLot !== -1 ? parseFloat(cols[idxLot]) || 0.1 : 0.1;
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
      onSuccess();
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
            className="relative z-10 w-full sm:max-w-[460px] bg-white dark:bg-[#17171A] rounded-t-[26px] sm:rounded-[26px] border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setTab("manual")}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tab === "manual"
                      ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-neutral-400"
                  }`}
                >
                  <PlusCircle size={14} />
                  Log Trade
                </button>
                <button
                  type="button"
                  onClick={() => setTab("import")}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    tab === "import"
                      ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-neutral-400"
                  }`}
                >
                  <Upload size={14} />
                  Import CSV
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {tab === "manual" ? (
              <form onSubmit={handleManualSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Symbol
                    </label>
                    <input
                      type="text"
                      required
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="XAUUSD"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[14px] font-semibold uppercase text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Direction
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["BUY", "SELL"] as const).map((dir) => (
                        <button
                          key={dir}
                          type="button"
                          onClick={() => setSide(dir)}
                          className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                            side === dir
                              ? dir === "BUY"
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-rose-500 text-white border-rose-500"
                              : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-white/10"
                          }`}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      P&amp;L ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={profit}
                      onChange={(e) => setProfit(e.target.value)}
                      placeholder="+125.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[14px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Lot Size
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={lotSize}
                      onChange={(e) => setLotSize(e.target.value)}
                      placeholder="0.10"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[14px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      R-Multiple
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={rrRatio}
                      onChange={(e) => setRrRatio(e.target.value)}
                      placeholder="2.0"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[14px] font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Setup / Tag (optional)
                  </label>
                  <input
                    type="text"
                    value={setup}
                    onChange={(e) => setSetup(e.target.value)}
                    placeholder="e.g. NY Open FVG, Liquidity Sweep"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[13.5px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What went well or what would you improve?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[13.5px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="tactile-white-pill rounded-full px-4 py-2 text-[13px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="tactile-black-pill rounded-full px-5 py-2 text-[13px] font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Log Trade"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="w-full py-10 px-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#222226] shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-blue-600 mb-3">
                    <FileSpreadsheet size={20} />
                  </div>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">
                    {saving ? "Importing trades..." : "Upload CSV trade history"}
                  </p>
                  <p className="text-[12.5px] text-slate-400 mt-1 max-w-[300px]">
                    Include columns like <span className="font-mono text-slate-600 dark:text-neutral-300">symbol, side, lot, profit, date</span>.
                  </p>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogTradeModal;
