import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Tag, X, Check } from "lucide-react";

const ALL_TAGS = ["Breakout", "Liquidity Sweep", "Order Block", "FVG", "FOMO", "Early Exit", "Revenge Trade", "Overleveraged", "Supply Zone", "BOS"];

interface JournalFilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export default function JournalFilterDropdown({ isOpen, onClose, anchorRef }: JournalFilterDropdownProps) {
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, anchorRef]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearAll = () => {
    setAssetSearch("");
    setSelectedTags([]);
    setDateFrom("");
    setDateTo("");
  };

  const activeCount = (assetSearch ? 1 : 0) + selectedTags.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute right-0 top-full mt-2 w-[340px] bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] rounded-2xl border border-slate-100 dark:border-[#333333] dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-black/30 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-50 dark:border-white/5 dark:border-white/5 dark:border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Advanced Filters</h4>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-[9px] font-black uppercase tracking-widest text-[#F06363] hover:text-[#F06363]/80 transition-colors">
                Clear All ({activeCount})
              </button>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Asset Search */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Search Asset</label>
              <div className="relative">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  value={assetSearch}
                  onChange={e => setAssetSearch(e.target.value)}
                  placeholder="e.g. XAUUSD, EURUSD..."
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-[#141414] dark:bg-white/5 rounded-xl border border-slate-100 dark:border-[#333333] dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-mono"
                />
                {assetSearch && (
                  <button onClick={() => setAssetSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Tag Multi-Select */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                <span className="flex items-center gap-1.5"><Tag size={10} /> Filter by Tags</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                        isSelected
                          ? "bg-white text-white shadow-sm shadow-emerald-500/20"
                          : "bg-slate-50 dark:bg-[#141414] dark:bg-white/5 text-slate-500 border border-slate-100 dark:border-[#333333] dark:border-white/10 hover:border-blue-300 hover:text-white"
                      }`}
                    >
                      {isSelected && <Check size={9} />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range Picker */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                <span className="flex items-center gap-1.5"><Calendar size={10} /> Date Range</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#141414] dark:bg-white/5 rounded-xl border border-slate-100 dark:border-[#333333] dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <span className="absolute -top-1.5 left-3 text-[7px] font-black uppercase tracking-widest text-slate-300 bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] px-1">From</span>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#141414] dark:bg-white/5 rounded-xl border border-slate-100 dark:border-[#333333] dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <span className="absolute -top-1.5 left-3 text-[7px] font-black uppercase tracking-widest text-slate-300 bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] px-1">To</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



