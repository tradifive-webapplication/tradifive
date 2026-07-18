import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowUpRight, ArrowDownRight, Clock, DollarSign,
  Tag, MessageSquare, ImagePlus, Trash2, Plus
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
            className="fixed right-0 top-0 h-full w-full max-w-[540px] bg-white dark:bg-[#0A0A0A] shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-white/5 font-sans"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none">
                    {trade.direction === "BUY"
                      ? <ArrowUpRight size={22} strokeWidth={2.5} className={isProfit ? "text-[#00B87A]" : "text-[#FF4D4D]"} />
                      : <ArrowDownRight size={22} strokeWidth={2.5} className={isProfit ? "text-[#00B87A]" : "text-[#FF4D4D]"} />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">{trade.asset}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        trade.direction === "BUY"
                          ? "bg-[#E5F7F0] text-[#00B87A]"
                          : "bg-[#FFE6E6] text-[#FF4D4D]"
                      }`}>{trade.direction}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">Trade #{trade.id} · Execution Detail</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-[36px] h-[36px] rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center justify-center text-[#393939] dark:text-white hover:scale-105 transition-all">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
              {/* PnL Badge */}
              <div className={`inline-flex items-center px-4 py-2.5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none rounded-[14px] ${isProfit ? "text-[#00B87A]" : "text-[#FF4D4D]"}`}>
                <span className={`text-[22px] font-extrabold tracking-tight font-sans ${hideBalance ? "filter blur-md select-none" : ""}`}>
                  {percentageOnly ? `${isProfit ? "+" : ""}${trade.pnl.toFixed(2)}%` : formatMoney(trade.pnl, { raw: true, showSign: true })}
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 amazing-scrollbar">

              {/* Execution Details */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Clock size={14} /> Execution Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Entry Time", value: trade.entryTime, blur: false },
                    { label: "Exit Time", value: trade.exitTime, blur: false },
                    { label: "Entry Price", value: trade.entryPrice.toFixed(2), blur: hideBalance },
                    { label: "Exit Price", value: trade.exitPrice.toFixed(2), blur: hideBalance },
                  ].map(item => (
                    <div key={item.label} className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 rounded-[14px] p-5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                      <p className={`text-[15px] font-bold text-slate-800 dark:text-white tracking-tight ${item.blur ? 'filter blur-[6px] select-none hover:blur-none transition-all' : ''}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🗺️ Premium Visual Trade History Timeline */}
              <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-[24px] p-6 border border-slate-100 dark:border-white/5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C48C] animate-pulse" /> Trade Journey History
                </h4>
                
                <div className="relative pl-7 border-l-2 border-dashed border-slate-200 dark:border-slate-700 space-y-7 ml-2">
                  {/* Entry Node */}
                  <div className="relative">
                    <span className="absolute -left-[37px] top-0 w-[18px] h-[18px] rounded-full border-2 border-[#00C48C] bg-white dark:bg-[#1E1E1E] flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#00C48C]" />
                    </span>
                    <div className="-mt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B87A] bg-[#E5F7F0] px-3 py-1 rounded-md">
                          Position Opened
                        </span>
                        <span className="text-[13px] font-bold text-slate-400 dark:text-slate-400">-</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-2">{trade.entryTime}</p>
                    </div>
                  </div>

                  {/* Hold Period */}
                  <div className="relative py-2 pl-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500">Holding Period</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5 mr-2">
                      {trade.holdDuration || "N/A"}
                    </span>
                  </div>

                  {/* Exit Node */}
                  <div className="relative">
                    <span className={`absolute -left-[37px] top-0 w-[18px] h-[18px] rounded-full border-2 bg-white dark:bg-[#1E1E1E] flex items-center justify-center ${
                      trade.exitTime === "Open" ? "border-amber-500" : "border-slate-400"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        trade.exitTime === "Open" ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                      }`} />
                    </span>
                    <div className="-mt-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md ${
                          trade.exitTime === "Open" 
                            ? "text-amber-500 bg-amber-500/10" 
                            : "text-slate-500 bg-slate-100"
                        }`}>
                          {trade.exitTime === "Open" ? "Active / Open" : "Position Closed"}
                        </span>
                        {trade.exitTime !== "Open" && (
                          <span className="text-[13px] font-bold text-slate-400 dark:text-slate-400">-</span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-2">{trade.exitTime}</p>
                    </div>
                  </div>
                </div>

                {/* Outcome Summary Box */}
                <div className={`mt-6 p-5 rounded-2xl flex items-center justify-between ${
                  trade.pnl >= 0 
                    ? "bg-[#E5F7F0]/60 dark:bg-[#E5F7F0]/10" 
                    : "bg-[#FFE6E6]/60 dark:bg-[#FFE6E6]/10"
                }`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Trading Outcome</p>
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                      {trade.pnl >= 0 ? "Profitable Capture" : "Risk Stopped"}
                    </p>
                  </div>
                  <span className={`text-[15px] font-extrabold px-4 py-2 rounded-xl ${
                    trade.pnl >= 0 
                      ? "text-[#00B87A] bg-[#00B87A]/10" 
                      : "text-[#FF4D4D] bg-[#FF4D4D]/10"
                  } ${hideBalance ? 'filter blur-sm select-none' : ''}`}>
                    {percentageOnly ? `${isProfit ? "+" : ""}${trade.pnl.toFixed(2)}%` : formatMoney(trade.pnl, { raw: true, showSign: true })}
                  </span>
                </div>
              </div>

              {/* 📊 Intraday Price Chart */}
              <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-[24px] p-6 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-pulse" /> 1-Min Price Execution Chart
                  </h4>
                  <div className="flex items-center gap-1 bg-[#E2E8F0]/60 dark:bg-black/30 p-1.5 rounded-xl border border-white dark:border-white/5">
                    <button 
                      onClick={() => setChartMode("execution")}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${chartMode === "execution" ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-[#5B5CE6]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Execution
                    </button>
                    <button 
                      onClick={() => setChartMode("analysis")}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${chartMode === "analysis" ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-[#5B5CE6]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                      Analysis
                    </button>
                  </div>
                </div>

                {chartMode === "execution" ? (
                  <div className="relative w-full mt-2 rounded-xl overflow-hidden group">
                    <div 
                      ref={chartContainerRef} 
                      className="h-[250px] w-full relative bg-white dark:bg-[#0A0A0A] filter blur-[5px] pointer-events-none transition-all duration-500 opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="relative flex flex-col items-center bg-white/80 dark:bg-[#121212]/90 backdrop-blur-md px-8 py-5 rounded-3xl border border-white dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3 ring-4 ring-white dark:ring-[#121212] shadow-inner">
                          <Clock size={20} strokeWidth={2.5} />
                        </div>
                        <h5 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">Execution Data Sync</h5>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full shadow-sm">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px] w-full mt-2 relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 flex flex-col items-center justify-center group">
                    {/* Fake Chart Background (Blurred) */}
                    <div className="absolute inset-0 opacity-40 dark:opacity-30 filter blur-[4px] pointer-events-none transition-all duration-500 group-hover:blur-[6px]">
                      <div className="w-full h-full border-b border-l border-slate-300 dark:border-slate-800 relative">
                        <div className="absolute bottom-4 left-[10%] w-[4px] h-10 bg-emerald-500 rounded-sm"></div>
                        <div className="absolute bottom-12 left-[15%] w-[4px] h-16 bg-emerald-500 rounded-sm"></div>
                        <div className="absolute bottom-16 left-[25%] w-[4px] h-8 bg-[#F06363] rounded-sm"></div>
                        <div className="absolute bottom-10 left-[35%] w-[4px] h-20 bg-emerald-500 rounded-sm"></div>
                        <div className="absolute bottom-24 left-[50%] w-[4px] h-14 bg-[#F06363] rounded-sm"></div>
                        <div className="absolute bottom-14 left-[70%] w-[4px] h-24 bg-emerald-500 rounded-sm"></div>
                      </div>
                    </div>
                    {/* Overlay Content */}
                    <div className="relative z-10 flex flex-col items-center bg-white/70 dark:bg-[#121212]/80 backdrop-blur-md px-8 py-5 rounded-3xl border border-white dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-3 ring-4 ring-white dark:ring-[#121212] shadow-inner">
                        <Clock size={20} strokeWidth={2.5} />
                      </div>
                      <h5 className="text-[14px] font-black text-slate-800 dark:text-white tracking-tight">Advanced Analysis</h5>
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full shadow-sm">Coming Soon</p>
                    </div>
                  </div>
                )}

                {/* Simulated Candle Visual details */}
                <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    Entry: {trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </div>
                  {trade.exitTime !== "Open" && (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${trade.pnl >= 0 ? "bg-[#10B981]" : "bg-[#F06363]"}`} />
                      Exit: {trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </div>
                  )}
                </div>
              </div>

              {/* Setups Tags */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <Tag size={12} /> Setups
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {setups.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {s}
                      <button onClick={() => setSetups(setups.filter(x => x !== s))} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={setupInput}
                    onChange={e => { setSetupInput(e.target.value); setShowSetupSuggestions(true); }}
                    onFocus={() => setShowSetupSuggestions(true)}
                    onKeyDown={e => { if (e.key === "Enter") { addSetup(setupInput); } }}
                    placeholder="Add setup tag..."
                    className="w-full px-4 py-3 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none rounded-[14px] text-[11px] font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all"
                  />
                  {showSetupSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1E1E1E] dark:bg-emerald-500 rounded-xl border border-slate-100 dark:border-[#333333] dark:border-white/10 shadow-lg z-10 p-2 max-h-[140px] overflow-y-auto">
                      {SETUP_SUGGESTIONS.filter(s => !setups.includes(s) && s.toLowerCase().includes(setupInput.toLowerCase())).map(s => (
                        <button key={s} onClick={() => addSetup(s)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/5 transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mistakes Tags */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F06363] mb-4 flex items-center gap-2">
                  <Tag size={12} /> Mistakes
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mistakes.map(m => (
                    <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {m}
                      <button onClick={() => setMistakes(mistakes.filter(x => x !== m))} className="hover:text-rose-900 dark:hover:text-rose-200 transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={mistakeInput}
                    onChange={e => { setMistakeInput(e.target.value); setShowMistakeSuggestions(true); }}
                    onFocus={() => setShowMistakeSuggestions(true)}
                    onKeyDown={e => { if (e.key === "Enter") { addMistake(mistakeInput); } }}
                    placeholder="Add mistake tag..."
                    className="w-full px-4 py-3 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none rounded-[14px] text-[11px] font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F06363]/20 focus:border-[#F06363]/30 transition-all"
                  />
                  {showMistakeSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1E1E1E] dark:bg-emerald-500 rounded-xl border border-slate-100 dark:border-[#333333] dark:border-white/10 shadow-lg z-10 p-2 max-h-[140px] overflow-y-auto">
                      {MISTAKE_SUGGESTIONS.filter(m => !mistakes.includes(m) && m.toLowerCase().includes(mistakeInput.toLowerCase())).map(m => (
                        <button key={m} onClick={() => addMistake(m)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:bg-[#141414] dark:hover:bg-white/5 transition-colors">
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Notes */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <MessageSquare size={12} /> Trade Notes
                </h4>
                <RichTextEditor 
                  value={notes} 
                  onChange={setNotes} 
                  placeholder="Describe your psychological state, rationale, and any observations... You can also paste chart image URLs here."
                />
              </div>

              {/* Visual Review — Upload Zones */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <ImagePlus size={12} /> Visual Review
                </h4>
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
                        className={`relative rounded-[14px] transition-all cursor-pointer overflow-hidden min-h-[130px] flex flex-col items-center justify-center gap-2 ${
                          dragOver === zone
                            ? "border-[1.5px] border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10"
                            : "bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none hover:scale-[1.01]"
                        }`}
                      >
                        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(zone, e)} />
                        {img ? (
                          <>
                            <img src={img} alt={`${zone} chart`} className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              onClick={e => { e.stopPropagation(); zone === "entry" ? setEntryImg(null) : setExitImg(null); }}
                              className="absolute top-2 right-2 w-6 h-6 bg-white/90 dark:bg-[#141414]/90 dark:bg-slate-800/90 rounded-lg flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors z-10"
                            >
                              <Trash2 size={10} className="text-[#F06363]" />
                            </button>
                          </>
                        ) : (
                          <>
                            <ImagePlus size={18} className="text-slate-300" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{zone} Chart</span>
                            <span className="text-[8px] text-slate-300">Drop or Click</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 flex items-center gap-4 bg-white dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={onClose} 
                disabled={isSaving}
                className="flex-1 py-4 rounded-[14px] bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:scale-105 transition-all disabled:opacity-55"
              >
                Discard
              </button>
              <button 
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
                className="flex-1 py-4 rounded-[14px] bg-[#00C48C] hover:bg-[#00A877] hover:scale-105 text-white text-[12px] font-bold uppercase tracking-widest shadow-[0_4px_7px_-5px_rgba(0,196,140,0.4)] transition-all disabled:opacity-55 flex items-center justify-center gap-2"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSaving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}






