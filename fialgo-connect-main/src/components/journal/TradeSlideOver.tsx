import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowUpRight, ArrowDownRight, Clock, DollarSign,
  Tag, MessageSquare, ImagePlus, Trash2, Plus, AlertTriangle,
  TrendingUp, TrendingDown, CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { createChart, ColorType, CrosshairMode, CandlestickSeries, AreaSeries, createSeriesMarkers } from 'lightweight-charts';
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import RichTextEditor from "./RichTextEditor";

interface Trade {
  id: number | string;
  asset: string;
  direction: "BUY" | "SELL";
  pnl: number;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  setups: string[];
  mistakes: string[];
  notes: string;
  holdDuration?: string;
  rawTrade?: any;
  stopLoss?: number;
  takeProfit?: number;
}

interface TradeSlideOverProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const SETUP_SUGGESTIONS = ["Breakout", "Liquidity Sweep", "Order Block", "FVG", "Supply Zone", "Demand Zone", "BOS", "CHoCH"];
const MISTAKE_SUGGESTIONS = ["FOMO", "Early Exit", "Revenge Trade", "Overleveraged", "No Stop Loss", "Moved SL", "Late Entry"];

// Helper to generate realistic OHLC candles as a fallback
function generateMockCandles(entryPrice: number, exitPrice: number, totalMinutes: number = 60) {
  return [];
}

export default function TradeSlideOver({ trade, isOpen, onClose }: TradeSlideOverProps) {
  const [setups, setSetups] = useState<string[]>(trade?.setups || []);
  const [mistakes, setMistakes] = useState<string[]>(trade?.mistakes || []);
  const [notes, setNotes] = useState(trade?.notes || "");
  const [setupInput, setSetupInput] = useState("");
  const [mistakeInput, setMistakeInput] = useState("");
  const [showSetupSuggestions, setShowSetupSuggestions] = useState(false);
  const [showMistakeSuggestions, setShowMistakeSuggestions] = useState(false);
  const [dragOver, setDragOver] = useState<"entry" | "exit" | null>(null);
  const [entryImg, setEntryImg] = useState<string | null>(null);
  const [exitImg, setExitImg] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"execution" | "analysis">("execution");
  const entryRef = useRef<HTMLInputElement>(null);
  const exitRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { hideBalance, percentageOnly, formatMoney } = useJournalSettings();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !trade || chartMode !== "execution") return;
    
    let parsedCandles: any[] = [];
    if (trade?.rawTrade?.entry_reason) {
       try {
           const er = trade.rawTrade.entry_reason;
           const parsed = typeof er === 'string' ? JSON.parse(er) : er;
           if (Array.isArray(parsed) && parsed.length > 0) {
               parsedCandles = parsed;
           }
       } catch (e) {
           console.error('Failed to parse candles', e);
       }
    }

    const isDark = document.documentElement.classList.contains('dark');
    
    const chartOptions = { 
        layout: { 
            textColor: '#94a3b8', 
            background: { type: ColorType.Solid, color: 'transparent' } 
        },
        grid: {
            vertLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
            horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
        },
        crosshair: {
            mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
            visible: true,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        timeScale: {
            visible: true,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            timeVisible: true,
            secondsVisible: false,
        },
        watermark: {
            visible: true,
            fontSize: 64,
            horzAlign: 'center',
            vertAlign: 'center',
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            text: trade.asset || 'TRADE',
        },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10B981', downColor: '#F06363', borderVisible: false,
        wickUpColor: '#10B981', wickDownColor: '#F06363',
    });

    let finalCandles: any[] = [];
    if (parsedCandles.length > 0) {
        const sortedData = parsedCandles.sort((a,b) => a.time - b.time);
        let lastTime = 0;
        for (const c of sortedData) {
            if (c.time > lastTime) {
                finalCandles.push(c);
                lastTime = c.time;
            }
        }
    } else {
        finalCandles = generateMockCandles(trade.entryPrice, trade.exitPrice || trade.entryPrice, 60);
    }

    candlestickSeries.setData(finalCandles.map(c => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
    })));

    const markers: any[] = [];
    const entryColor = trade.direction === 'BUY' ? '#10B981' : '#F06363';
    
    if (finalCandles.length > 0) {
        const entryTime = trade.rawTrade?.opened_at_sec || finalCandles[0].time;
        let entryCandle = finalCandles.find(c => Math.abs(c.time - entryTime) < 120);
        if (!entryCandle) entryCandle = finalCandles[0];

        markers.push({
            time: entryCandle.time,
            position: trade.direction === 'BUY' ? 'belowBar' : 'aboveBar',
            color: entryColor,
            shape: trade.direction === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: 'Entry ' + trade.direction,
        });

        if (trade.exitTime !== 'Open') {
            const exitTime = trade.rawTrade?.closed_at_sec || finalCandles[finalCandles.length - 1].time;
            let exitCandle = finalCandles.find(c => Math.abs(c.time - exitTime) < 120);
            if (!exitCandle) exitCandle = finalCandles[finalCandles.length - 1];

            if (exitCandle && exitCandle.time > entryCandle.time) {
                const isProfit = trade.pnl >= 0;
                markers.push({
                    time: exitCandle.time,
                    position: trade.direction === 'BUY' ? 'aboveBar' : 'belowBar',
                    color: isProfit ? '#10B981' : '#F06363',
                    shape: trade.direction === 'BUY' ? 'arrowDown' : 'arrowUp',
                    text: 'Exit',
                });
            }
        }

        if (markers.length > 0) {
            createSeriesMarkers(candlestickSeries, markers.sort((a,b) => a.time - b.time));
        }
    }

    if (trade.stopLoss && trade.stopLoss > 0) {
        candlestickSeries.createPriceLine({
            price: trade.stopLoss,
            color: '#F06363',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'SL',
        });
    }
    if (trade.takeProfit && trade.takeProfit > 0) {
        candlestickSeries.createPriceLine({
            price: trade.takeProfit,
            color: '#10B981',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'TP',
        });
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
    };
  }, [trade, chartMode]);

  useEffect(() => {
    if (trade) {
      setSetups(trade.setups || []);
      setMistakes(trade.mistakes || []);
      setNotes(trade.notes || "");
    }
  }, [trade]);

  if (!trade) return null;

  const isProfit = trade.pnl >= 0;

  const addSetup = (tag: string) => {
    const t = tag.trim();
    if (t && !setups.includes(t)) setSetups([...setups, t]);
    setSetupInput("");
    setShowSetupSuggestions(false);
  };

  const addMistake = (tag: string) => {
    const t = tag.trim();
    if (t && !mistakes.includes(t)) setMistakes([...mistakes, t]);
    setMistakeInput("");
    setShowMistakeSuggestions(false);
  };

  const handleDrop = (zone: "entry" | "exit", e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      zone === "entry" ? setEntryImg(url) : setExitImg(url);
    }
  };

  const handleFileSelect = (zone: "entry" | "exit", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      zone === "entry" ? setEntryImg(url) : setExitImg(url);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-[4px] z-50"
            onClick={onClose}
          />

          {/* Slide-Over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[540px] bg-white dark:bg-[#121316] shadow-2xl z-50 flex flex-col border-l border-slate-200/90 dark:border-white/10 font-sans"
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-white/[0.08] bg-white/80 dark:bg-[#121316]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${
                    isProfit 
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-50 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}>
                    {trade.direction === "BUY"
                      ? <ArrowUpRight size={20} strokeWidth={2.5} />
                      : <ArrowDownRight size={20} strokeWidth={2.5} />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[19px] font-black text-slate-900 dark:text-white tracking-tight">{trade.asset}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        trade.direction === "BUY"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-500/20"
                      }`}>{trade.direction}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Trade #{trade.id} · Execution Detail</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="tactile-white-pill w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer select-none active:scale-95 transition-transform"
                >
                  <X size={15} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 amazing-scrollbar">

              {/* 🏆 Hero P&L Summary Card */}
              <div className={`rounded-[20px] p-5 sm:p-6 border transition-all ${
                isProfit 
                  ? "bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.03] to-transparent border-emerald-500/20 dark:border-emerald-500/20" 
                  : "bg-gradient-to-br from-rose-500/[0.08] via-rose-500/[0.03] to-transparent border-rose-500/20 dark:border-rose-500/20"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Net Realized P&L</span>
                    <div className={`text-[28px] sm:text-[32px] font-black tracking-tight font-mono mt-0.5 ${
                      isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      <span className={hideBalance ? "filter blur-md select-none" : ""}>
                        {percentageOnly ? `${isProfit ? "+" : ""}${trade.pnl.toFixed(2)}%` : formatMoney(trade.pnl, { raw: true, showSign: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isProfit 
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" 
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                    }`}>
                      {isProfit ? "Profitable Capture" : "Loss Incurred"}
                    </span>
                    {trade.holdDuration && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock size={11} /> {trade.holdDuration}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ⏱️ Execution Details Card */}
              <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <Clock size={13} className="text-slate-400" /> Execution Metrics
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Order fill specs</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Entry Time", value: trade.entryTime, blur: false },
                    { label: "Exit Time", value: trade.exitTime, blur: false },
                    { label: "Entry Price", value: trade.entryPrice.toFixed(2), blur: hideBalance },
                    { label: "Exit Price", value: trade.exitPrice.toFixed(2), blur: hideBalance },
                  ].map(item => (
                    <div key={item.label} className="bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl p-3.5 shadow-2xs">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-white font-mono tracking-tight ${item.blur ? 'filter blur-[6px] select-none hover:blur-none transition-all' : ''}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🗺️ Visual Trade History Timeline Card */}
              <div className="bg-slate-50/70 dark:bg-white/[0.02] rounded-[20px] p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Trade Journey History
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Timeline</span>
                </div>
                
                <div className="relative pl-7 border-l-2 border-dashed border-slate-200 dark:border-slate-700/60 space-y-6 ml-2">
                  {/* Entry Node */}
                  <div className="relative">
                    <span className="absolute -left-[36px] top-0.5 w-[18px] h-[18px] rounded-full border-2 border-emerald-500 bg-white dark:bg-[#1E1E1E] flex items-center justify-center shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                    <div className="-mt-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          Position Opened
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400">@ {trade.entryPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-1.5">{trade.entryTime}</p>
                    </div>
                  </div>

                  {/* Hold Period */}
                  <div className="relative py-2 px-3.5 bg-white dark:bg-white/[0.04] rounded-xl border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Holding Period</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/[0.06]">
                      {trade.holdDuration || "N/A"}
                    </span>
                  </div>

                  {/* Exit Node */}
                  <div className="relative">
                    <span className={`absolute -left-[36px] top-0.5 w-[18px] h-[18px] rounded-full border-2 bg-white dark:bg-[#1E1E1E] flex items-center justify-center shadow-2xs ${
                      trade.exitTime === "Open" ? "border-amber-500" : "border-slate-400"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        trade.exitTime === "Open" ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                      }`} />
                    </span>
                    <div className="-mt-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          trade.exitTime === "Open" 
                            ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" 
                            : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/10"
                        }`}>
                          {trade.exitTime === "Open" ? "Active / Open" : "Position Closed"}
                        </span>
                        {trade.exitTime !== "Open" && (
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400">@ {trade.exitPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-1.5">{trade.exitTime}</p>
                    </div>
                  </div>
                </div>

                {/* Outcome Summary Box */}
                <div className={`mt-5 p-4 rounded-xl flex items-center justify-between border ${
                  trade.pnl >= 0 
                    ? "bg-emerald-50/50 dark:bg-emerald-500/[0.06] border-emerald-200/80 dark:border-emerald-500/20" 
                    : "bg-rose-50/50 dark:bg-rose-500/[0.06] border-rose-200/80 dark:border-rose-500/20"
                }`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Trading Outcome</p>
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                      {trade.pnl >= 0 ? "Profitable Capture" : "Risk Stopped"}
                    </p>
                  </div>
                  <span className={`text-[14px] font-black px-3.5 py-1.5 rounded-xl font-mono ${
                    trade.pnl >= 0 
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15" 
                      : "text-rose-700 dark:text-rose-400 bg-rose-500/15"
                  } ${hideBalance ? 'filter blur-sm select-none' : ''}`}>
                    {percentageOnly ? `${isProfit ? "+" : ""}${trade.pnl.toFixed(2)}%` : formatMoney(trade.pnl, { raw: true, showSign: true })}
                  </span>
                </div>
              </div>

              {/* 🏷️ Strategy & Discipline Analysis Card */}
              <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <Tag size={13} className="text-slate-400" /> Strategy & Discipline Tags
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Classify execution</span>
                </div>

                {/* Setups Section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Setups ({setups.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Confluence / Model</span>
                  </div>
                  {setups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {setups.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                          {s}
                          <button type="button" onClick={() => setSetups(setups.filter(x => x !== s))} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <input
                      value={setupInput}
                      onChange={e => { setSetupInput(e.target.value); setShowSetupSuggestions(true); }}
                      onFocus={() => setShowSetupSuggestions(true)}
                      onKeyDown={e => { if (e.key === "Enter") { addSetup(setupInput); } }}
                      placeholder="Add setup tag (e.g. FVG, Order Block)..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-xl text-[12px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/40 dark:focus:border-emerald-500/40 transition-all shadow-2xs"
                    />
                    {showSetupSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-lg z-10 p-2 max-h-[140px] overflow-y-auto">
                        {SETUP_SUGGESTIONS.filter(s => !setups.includes(s) && s.toLowerCase().includes(setupInput.toLowerCase())).map(s => (
                          <button key={s} type="button" onClick={() => addSetup(s)} className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Quick preset chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
                    {SETUP_SUGGESTIONS.slice(0, 5).filter(s => !setups.includes(s)).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSetup(s)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-white/[0.04] dark:hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 border border-slate-200/60 hover:border-emerald-200 dark:border-white/[0.06] transition-all cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200/70 dark:border-white/[0.06] my-5" />

                {/* Mistakes Section */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Mistakes ({mistakes.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Discipline / Psychology</span>
                  </div>
                  {mistakes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mistakes.map(m => (
                        <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                          {m}
                          <button type="button" onClick={() => setMistakes(mistakes.filter(x => x !== m))} className="hover:text-rose-900 dark:hover:text-rose-200 transition-colors cursor-pointer"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <input
                      value={mistakeInput}
                      onChange={e => { setMistakeInput(e.target.value); setShowMistakeSuggestions(true); }}
                      onFocus={() => setShowMistakeSuggestions(true)}
                      onKeyDown={e => { if (e.key === "Enter") { addMistake(mistakeInput); } }}
                      placeholder="Add mistake tag (e.g. FOMO, Early Exit)..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-xl text-[12px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-rose-500/40 dark:focus:border-rose-500/40 transition-all shadow-2xs"
                    />
                    {showMistakeSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-lg z-10 p-2 max-h-[140px] overflow-y-auto">
                        {MISTAKE_SUGGESTIONS.filter(m => !mistakes.includes(m) && m.toLowerCase().includes(mistakeInput.toLowerCase())).map(m => (
                          <button key={m} type="button" onClick={() => addMistake(m)} className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Quick preset chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
                    {MISTAKE_SUGGESTIONS.slice(0, 5).filter(m => !mistakes.includes(m)).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => addMistake(m)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-white/[0.04] dark:hover:bg-rose-500/10 text-slate-600 hover:text-rose-700 dark:text-zinc-400 dark:hover:text-rose-300 border border-slate-200/60 hover:border-rose-200 dark:border-white/[0.06] transition-all cursor-pointer"
                      >
                        + {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 📝 Trade Notes & Psychology Card */}
              <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <MessageSquare size={13} className="text-slate-400" /> Trade Notes & Psychology
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Markdown enabled</span>
                </div>
                <RichTextEditor 
                  value={notes} 
                  onChange={setNotes} 
                  placeholder="Describe your psychological state, rationale, and any observations... You can also paste chart image URLs here."
                />
              </div>

              {/* 📷 Visual Review (Chart Photos) Card */}
              <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <ImagePlus size={13} className="text-slate-400" /> Visual Proof (Chart Photos)
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Before & After</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["entry", "exit"] as const).map(zone => {
                    const img = zone === "entry" ? entryImg : exitImg;
                    const ref = zone === "entry" ? entryRef : exitRef;
                    return (
                      <div
                        key={zone}
                        onDragOver={e => { e.preventDefault(); setDragOver(zone); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => handleDrop(zone, e)}
                        onClick={() => ref.current?.click()}
                        className={`relative rounded-2xl transition-all cursor-pointer overflow-hidden min-h-[135px] flex flex-col items-center justify-center gap-1.5 p-3.5 border ${
                          dragOver === zone
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm"
                            : "border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.03] hover:border-slate-400 dark:hover:border-white/30 shadow-2xs hover:scale-[1.01]"
                        }`}
                      >
                        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(zone, e)} />
                        {img ? (
                          <>
                            <img src={img} alt={`${zone} chart`} className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); zone === "entry" ? setEntryImg(null) : setExitImg(null); }}
                              className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-[#141414]/90 rounded-lg flex items-center justify-center shadow-xs hover:bg-rose-50 transition-colors z-10"
                            >
                              <Trash2 size={12} className="text-rose-500" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-400 mb-0.5">
                              <ImagePlus size={16} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider">{zone === "entry" ? "Entry Setup" : "Exit / Target"}</span>
                            <span className="text-[9px] font-medium text-slate-400">Click or drop screenshot</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-5 flex items-center gap-3 bg-white dark:bg-[#121316] border-t border-slate-100 dark:border-white/[0.08] sticky bottom-0 z-20">
              <button 
                type="button"
                onClick={onClose} 
                disabled={isSaving}
                className="tactile-white-pill flex-1 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 shadow-xs active:scale-95 transition-all disabled:opacity-55 cursor-pointer"
              >
                Discard
              </button>
              <button 
                type="button"
                onClick={async () => {
                  if (isSaving) return;
                  setIsSaving(true);
                  try {
                    const tradeId = trade.rawTrade?.id || trade.id;
                    const { error } = await supabase
                      .from("trades")
                      .update({
                        notes: notes,
                        tags: setups,
                        setup: setups[0] || null
                      })
                      .eq("id", tradeId);

                    if (error) throw error;
                    toast.success("Trade journal entry saved successfully!");
                    
                    if (trade.rawTrade) {
                      trade.rawTrade.notes = notes;
                      trade.rawTrade.tags = setups;
                      trade.rawTrade.setup = setups[0] || null;
                    }
                    onClose();
                  } catch (err: any) {
                    console.error("Failed to save trade entry:", err);
                    toast.error(err.message || "Failed to save journal entry.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="tactile-emerald-pill flex-1 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-wider text-white shadow-sm active:scale-95 transition-all disabled:opacity-55 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isSaving ? "Saving..." : "Save Entry"}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}






